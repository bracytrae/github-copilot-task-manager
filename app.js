// Simple Task manager with localStorage persistence and drag/drop reordering
const STORAGE_KEY = 'mininotion.tasks'
const EVENTS_KEY = 'mininotion.events'

function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}

function loadTasks(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')
  }catch(e){return[]}
}

function saveTasks(tasks){localStorage.setItem(STORAGE_KEY,JSON.stringify(tasks))}

function loadEvents(){
  try{return JSON.parse(localStorage.getItem(EVENTS_KEY)||'[]')}catch(e){return[]}
}
function saveEvents(events){localStorage.setItem(EVENTS_KEY,JSON.stringify(events))}

const state = {tasks: loadTasks(), events: loadEvents()}

function createTask(title,desc,priority=false){
  return {id:uid(),title:title||'Untitled',desc:desc||'',completed:false,priority:!!priority,created:Date.now()}
}

function render(){
  const container = document.getElementById('tasks')
  const empty = document.getElementById('tasks-empty')
  if(!container) return
  container.setAttribute('role','list')
  // empty state handling
  if(!state.tasks || state.tasks.length===0){
    container.innerHTML = ''
    container.style.display = 'none'
    if(empty) empty.style.display = 'block'
    return
  }else{
    if(empty) empty.style.display = 'none'
    container.style.display = ''
  }
  container.innerHTML = ''
  state.tasks.forEach(task=>{
    const el = document.createElement('div')
    el.className = 'task' + (task.completed? ' completed':'')
    el.draggable = true
    el.dataset.id = task.id
    el.setAttribute('role','listitem')
    el.setAttribute('tabindex','0')

    el.innerHTML = `
      <div class="row">
        <input type="checkbox" class="toggle" ${task.completed? 'checked':''} />
        <h3 class="title" tabindex="0">${escapeHtml(task.title)}</h3>
      </div>
      <p class="desc" tabindex="0">${escapeHtml(task.desc)}</p>
      <div class="actions">
        <button class="btn edit">Edit</button>
        <button class="btn del">Delete</button>
        <button class="priority-btn">${task.priority? 'High':'Set priority'}</button>
      </div>
    `

    // events
    el.querySelector('.toggle').addEventListener('change',e=>{
      toggleComplete(task.id)
    })

    el.querySelector('.del').addEventListener('click',()=>{
      deleteTask(task.id)
    })

    el.querySelector('.edit').addEventListener('click',()=>{
      openEditor(task)
    })

    el.querySelector('.priority-btn').addEventListener('click',()=>{
      togglePriority(task.id)
    })

    // inline double-click editing
    el.querySelector('.title').addEventListener('dblclick',()=>{
      startInlineEdit(el.querySelector('.title'), task, 'title')
    })
    el.querySelector('.desc').addEventListener('dblclick',()=>{
      startInlineEdit(el.querySelector('.desc'), task, 'desc')
    })

    // drag events
    el.addEventListener('dragstart',dragStart)
    el.addEventListener('dragend',dragEnd)
    el.addEventListener('dragover',dragOver)
    el.addEventListener('drop',drop)

    container.appendChild(el)
  })
}



function renderCalendar(){
  const container = document.getElementById('events-list')
  const empty = document.getElementById('events-empty')
  if(!container) return
  const events = state.events || []
  if(events.length===0){
    container.innerHTML = ''
    container.style.display = 'none'
    if(empty) empty.style.display = 'block'
    return
  }else{
    if(empty) empty.style.display = 'none'
    container.style.display = ''
  }
  container.innerHTML = ''
  const sorted = events.slice().sort((a,b)=> new Date(a.date)-new Date(b.date))
  sorted.forEach((ev,idx)=>{
    const el = document.createElement('div')
    el.className = 'event'
    el.innerHTML = `<div class="date">${escapeHtml(ev.date)}</div><div class="title">${escapeHtml(ev.title)}</div><div class="desc">${escapeHtml(ev.desc)}</div><div style="margin-top:8px"><button class="btn del-event">Delete</button></div>`
    el.querySelector('.del-event').addEventListener('click',()=>{ deleteEvent(idx) })
    container.appendChild(el)
  })
}

function addEvent(){
  const date = document.getElementById('event-date').value
  const title = document.getElementById('event-title').value.trim()
  const desc = document.getElementById('event-desc').value.trim()
  if(!date || !title) return alert('Please provide date and title')
  state.events.unshift({id:uid(),date,title,desc})
  saveEvents(state.events)
  document.getElementById('event-date').value=''
  document.getElementById('event-title').value=''
  document.getElementById('event-desc').value=''
  renderCalendar()
}

// Generic toast helper (non-undo)
function showToast(text, duration=3000){
  const t = document.getElementById('toast')
  if(!t) return
  t.textContent = text
  t.classList.add('show')
  setTimeout(()=>{ t.classList.remove('show') }, duration)
}

// Download JSON helper
function downloadJSON(filename, obj){
  const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function exportTasks(){ downloadJSON('mininotion-tasks.json', state.tasks || []) }
function exportEvents(){ downloadJSON('mininotion-events.json', state.events || []) }

function importTasksFile(file){
  if(!file) return
  const fr = new FileReader()
  fr.onload = ()=>{
    try{
      const data = JSON.parse(fr.result)
      if(Array.isArray(data)){
        state.tasks = data
        saveTasks(state.tasks)
        render()
        showToast('Tasks imported')
      }else{ alert('Invalid tasks file') }
    }catch(e){ alert('Invalid JSON') }
  }
  fr.readAsText(file)
}

function importEventsFile(file){
  if(!file) return
  const fr = new FileReader()
  fr.onload = ()=>{
    try{
      const data = JSON.parse(fr.result)
      if(Array.isArray(data)){
        state.events = data
        saveEvents(state.events)
        renderCalendar()
        showToast('Events imported')
      }else{ alert('Invalid events file') }
    }catch(e){ alert('Invalid JSON') }
  }
  fr.readAsText(file)
}

function clearAllTasks(){
  if(!state.tasks || state.tasks.length===0){ showToast('No tasks to clear'); return }
  if(confirm('Clear all tasks? This cannot be undone.')){
    state.tasks = []
    saveTasks(state.tasks)
    render()
    showToast('All tasks cleared')
  }
}

function clearAllEvents(){
  if(!state.events || state.events.length===0){ showToast('No events to clear'); return }
  if(confirm('Clear all events? This cannot be undone.')){
    state.events = []
    saveEvents(state.events)
    renderCalendar()
    showToast('All events cleared')
  }
}

function deleteEvent(index){
  state.events.splice(index,1)
  saveEvents(state.events)
  renderCalendar()
}

// Inline editing helper
function startInlineEdit(node, task, field){
  const original = task[field]
  node.contentEditable = true
  node.focus()
  const sel = window.getSelection()
  if(sel && sel.rangeCount>0) sel.removeAllRanges()
  function finish(save){
    node.contentEditable = false
    node.removeEventListener('blur',onblur)
    node.removeEventListener('keydown',onkey)
    if(save){
      task[field] = node.textContent.trim() || original
      saveTasks(state.tasks)
      render()
    }else{
      node.textContent = original
    }
  }
  function onblur(){ finish(true) }
  function onkey(e){ if(e.key==='Enter'){ e.preventDefault(); finish(true) } if(e.key==='Escape'){ finish(false) } }
  node.addEventListener('blur',onblur)
  node.addEventListener('keydown',onkey)
}

function togglePriority(id){
  const t = state.tasks.find(x=>x.id===id)
  if(!t) return
  t.priority = !t.priority
  saveTasks(state.tasks)
  render()
}

function escapeHtml(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}

function addFromComposer(){
  const title = document.getElementById('new-title').value.trim()
  const desc = document.getElementById('new-desc').value.trim()
  const priority = document.getElementById('priority').checked
  if(!title) return alert('Please add a title')
  const t = createTask(title,desc,priority)
  state.tasks.unshift(t)
  saveTasks(state.tasks)
  render()
  document.getElementById('new-title').value=''
  document.getElementById('new-desc').value=''
  document.getElementById('priority').checked=false
}

function toggleComplete(id){
  const t = state.tasks.find(x=>x.id===id)
  if(!t) return
  t.completed = !t.completed
  saveTasks(state.tasks)
  render()
}

let lastDeleted = null
function deleteTask(id){
  const index = state.tasks.findIndex(x=>x.id===id)
  if(index===-1) return
  lastDeleted = {task: state.tasks[index], index}
  state.tasks.splice(index,1)
  saveTasks(state.tasks)
  render()
  showUndoToast('Task deleted', ()=>{
    // undo
    state.tasks.splice(lastDeleted.index,0,lastDeleted.task)
    saveTasks(state.tasks)
    render()
    lastDeleted = null
  })
  // clear after 6s
  setTimeout(()=>{ lastDeleted = null },6000)
}

function showUndoToast(text, onUndo){
  const t = document.getElementById('toast')
  t.innerHTML = `<span>${text}</span><button id="undo">UNDO</button>`
  t.classList.add('show')
  const btn = document.getElementById('undo')
  let cleared = false
  function hide(){ if(!cleared){ t.classList.remove('show'); cleared=true } }
  btn.addEventListener('click',()=>{ onUndo(); hide() })
  setTimeout(hide,5000)
}

function openEditor(task){
  const title = prompt('Edit title', task.title)
  if(title===null) return
  const desc = prompt('Edit description', task.desc)
  if(desc===null) return
  task.title = title
  task.desc = desc
  saveTasks(state.tasks)
  render()
}

// Drag/drop handlers
let dragEl = null
function dragStart(e){
  dragEl = this
  this.classList.add('dragging')
  e.dataTransfer.effectAllowed = 'move'
}
function dragEnd(){
  if(dragEl) dragEl.classList.remove('dragging')
  dragEl = null
}
function dragOver(e){
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}
function drop(e){
  e.preventDefault()
  if(!dragEl) return
  const fromId = dragEl.dataset.id
  const toId = this.dataset.id
  if(fromId===toId) return
  const fromIndex = state.tasks.findIndex(x=>x.id===fromId)
  const toIndex = state.tasks.findIndex(x=>x.id===toId)
  const [item] = state.tasks.splice(fromIndex,1)
  state.tasks.splice(toIndex,0,item)
  saveTasks(state.tasks)
  render()
}

// Search
document.addEventListener('DOMContentLoaded',()=>{
  render()
  document.getElementById('add-btn').addEventListener('click',addFromComposer)
  document.getElementById('add-event-btn').addEventListener('click',addEvent)
  // export / import / clear wiring
  const expTasks = document.getElementById('export-tasks')
  if(expTasks) expTasks.addEventListener('click', exportTasks)
  const expEvents = document.getElementById('export-events')
  if(expEvents) expEvents.addEventListener('click', exportEvents)
  const impTasks = document.getElementById('import-tasks-file')
  if(impTasks) impTasks.addEventListener('change', e=>{ importTasksFile(e.target.files[0]); impTasks.value=''; })
  const impEvents = document.getElementById('import-events-file')
  if(impEvents) impEvents.addEventListener('change', e=>{ importEventsFile(e.target.files[0]); impEvents.value=''; })
  const clearT = document.getElementById('clear-tasks')
  if(clearT) clearT.addEventListener('click', clearAllTasks)
  const clearE = document.getElementById('clear-events')
  if(clearE) clearE.addEventListener('click', clearAllEvents)
  // Enter to add when focused on title
  document.getElementById('new-title').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); addFromComposer() } })
  document.getElementById('search').addEventListener('input',e=>{
    const q = e.target.value.toLowerCase()
    const filtered = state.tasks.filter(t=>t.title.toLowerCase().includes(q)||t.desc.toLowerCase().includes(q))
    const container = document.getElementById('tasks')
    container.innerHTML = ''
    filtered.forEach(t=>{
      // reuse render snippet
      const el = document.createElement('div')
      el.className = 'task' + (t.completed? ' completed':'')
      el.innerHTML = `<div class="row"><input type="checkbox" class="toggle" ${t.completed? 'checked':''} /><h3 class="title">${escapeHtml(t.title)}</h3></div><p class="desc">${escapeHtml(t.desc)}</p><div class="actions"><button class="btn edit">Edit</button><button class="btn del">Delete</button>${t.priority? '<span class="priority">● High</span>':''}</div>`
      el.querySelector('.toggle').addEventListener('change',()=>{toggleComplete(t.id)})
      el.querySelector('.del').addEventListener('click',()=>{deleteTask(t.id)})
      el.querySelector('.edit').addEventListener('click',()=>{openEditor(t)})
      container.appendChild(el)
    })
  })
  // wire nav buttons
  document.querySelectorAll('.nav-btn').forEach(b=>{
    b.addEventListener('click',()=>{
      const view = b.dataset.view
      showView(view)
    })
  })

  function showView(name){
    document.querySelectorAll('.view').forEach(v=>v.style.display='none')
    document.getElementById('view-'+name).style.display='block'
    document.querySelectorAll('.nav-btn').forEach(nb=>nb.classList.remove('active'))
    document.querySelector(`.nav-btn[data-view="${name}"]`).classList.add('active')
    document.getElementById('view-title').textContent = name.charAt(0).toUpperCase()+name.slice(1)
    // render corresponding
    if(name==='calendar') renderCalendar()
    if(name==='tasks') render()
  }

  // keyboard shortcuts (when not typing): 'n' -> focus new task title, 't' -> tasks, 'c' -> calendar
  document.addEventListener('keydown', (e)=>{
    const tag = (document.activeElement && document.activeElement.tagName) || ''
    if(tag==='INPUT' || tag==='TEXTAREA' || (document.activeElement && document.activeElement.isContentEditable)) return
    if(e.key==='n'){
      e.preventDefault(); document.getElementById('new-title').focus(); return
    }
    if(e.key==='t'){
      e.preventDefault(); showView('tasks'); return
    }
    if(e.key==='c'){
      e.preventDefault(); showView('calendar'); return
    }
  })

  // Mobile sidebar toggle
  const menuToggle = document.getElementById('menu-toggle')
  const sidebar = document.querySelector('.sidebar')
  const mobileOverlay = document.getElementById('mobile-overlay')
  function openMobileMenu(){
    if(!sidebar) return
    sidebar.classList.add('mobile-open')
    if(mobileOverlay){ mobileOverlay.hidden = false; mobileOverlay.classList.add('show') }
  }
  function closeMobileMenu(){
    if(!sidebar) return
    sidebar.classList.remove('mobile-open')
    if(mobileOverlay){ mobileOverlay.classList.remove('show'); setTimeout(()=>{ if(mobileOverlay) mobileOverlay.hidden = true },200) }
  }
  if(menuToggle) menuToggle.addEventListener('click', ()=>{ if(sidebar && sidebar.classList.contains('mobile-open')) closeMobileMenu(); else openMobileMenu() })
  if(mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu)

  // default view
  showView('tasks')
  // Start live clock
  function updateClock(){
    const el = document.getElementById('clock')
    if(!el) return
    const now = new Date()
    let hrs = now.getHours()
    const mins = String(now.getMinutes()).padStart(2,'0')
    const ampm = hrs >= 12 ? 'PM' : 'AM'
    hrs = hrs % 12 || 12
    el.textContent = `${hrs}:${mins} ${ampm}`
  }
  updateClock()
  setInterval(updateClock, 1000)
})
