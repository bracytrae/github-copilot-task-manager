
# MiniNotion — Lightweight Task & Calendar (Static)

> MiniNotion is a single-page, client-side task and event manager inspired by Notion's simplicity. It focuses on quick task capture, inline editing, simple prioritization, and a compact calendar for event management — all implemented with plain HTML, CSS and JavaScript and persisting data to `localStorage`.

## Key Features
- Tasks: create, inline-edit, mark complete, set high priority, drag-and-drop reorder, undo-delete.
- Composer: fast task entry with Enter-to-add and optional description.
- Search: live search scoped to the Tasks view.
- Calendar: add and delete events (date, title, description).
- Persistence: tasks and events are saved in the browser's `localStorage` as JSON.
- Export / Import: download/upload tasks and events as JSON files.
- Mobile-friendly: responsive layout, sidebar menu toggle and touch-friendly controls.
- Accessibility: ARIA roles, visually-hidden labels, keyboard shortcuts and focus-visible styles.

## Tech Stack
- HTML, CSS, vanilla JavaScript (no build step required).

## Getting Started
These instructions assume you have the project on your machine. To run locally, you can either open the UI directly or serve the folder with a small static server.

1. Open directly

	 - Double-click `index.html` in the project root or open it from your browser (`file://.../index.html`).

2. Serve with a simple static server (recommended for correct file handling)

	 - Python 3:

		 ```bash
		 python -m http.server 8000
		 # then open http://localhost:8000 in your browser
		 ```

	 - Node (http-server):

		 ```bash
		 npm install -g http-server
		 http-server -c-1
		 ```

## Usage Guide

- Add a task: type a title in the composer and press `Add Task` or press `Enter` while focused on the title input.
- Edit inline: double-click a task's title or description to edit in place; press `Enter` to save or `Escape` to cancel.
- Reorder: drag a task card to reorder the list.
- Complete: toggle the checkbox to mark a task complete (visual strike-through applied).
- Priority: click `Set priority` / `High` to toggle a high-priority flag.
- Undo delete: after deleting a task, use the toast `UNDO` button to restore within a few seconds.
- Search: use the search box in the Tasks view to filter tasks by title or description.

Calendar
- Add event: switch to the Calendar view, enter a date and title (description optional), then `Add Event`.
- Delete event: use the `Delete` button on an event card.

Export / Import
- Export tasks/events to JSON via the `Export` buttons in the Boards. This downloads a `.json` file.
- Import using the corresponding `Import` control (select a previously exported JSON file). Imported data replaces the current list for that type.
- Clear All: use `Clear All Tasks` / `Clear All Events` to remove all items (confirmation required).

Persistence
- Tasks are stored under the `localStorage` key: `mininotion.tasks`.
- Events are stored under the `localStorage` key: `mininotion.events`.

Keyboard Shortcuts
- `n` — focus the new task title input
- `t` — switch to Tasks view
- `c` — open Calendar view

Accessibility Notes
- The app uses ARIA roles and visually-hidden labels for form controls. Focus-visible outlines and keyboard handlers are provided to support keyboard-only navigation.

Development Notes
- No dependencies or build tools are required. All source files are in the project root: `index.html`, `styles.css`, `app.js`.
- If you plan to extend the project, consider adding unit/browser tests and a monthly calendar grid view (planned features).

Contributing
- Fork the repo, create a branch for your feature, and submit a PR. Keep changes focused and include tests when possible.

License
- MIT (add your own LICENSE file if you intend to publish this project).

---

If you'd like, I can create a release zip, add a test harness, or implement event editing/recurrence next.
# github-copilot-task-manager

MiniNotion — a simple Notion-like task manager built with HTML/CSS/JavaScript.

Run locally:

1. Open `index.html` in a browser (double-click or use a static server).

That's it — tasks are stored in `localStorage` for persistence between reloads.

Files added:

- `index.html` — main UI
- `styles.css` — styles
- `app.js` — JavaScript behavior (CRUD, persistence, drag/drop)

Notes:
- The Projects view was removed per request; only Tasks and Calendar remain.
- Calendar events are managed from the Calendar view and persisted to `localStorage`.

Accessibility & shortcuts:
- Added ARIA roles and hidden labels for inputs to improve screen-reader support.
- Keyboard shortcuts: press `n` to focus the new task title, `t` to switch to Tasks, `c` to open Calendar.

Finishing touches added:
- Empty-state messages for Tasks and Calendar when no items exist.
- Export/import JSON for Tasks and Events via the UI.
- Clear All Tasks / Clear All Events buttons with confirmation.
- Improved focus-visible outlines and keyboard-friendly controls.

Want features next? I can add search, tags, multiple pages, or export/import.
Mobile improvements:
- Added a menu toggle for small screens and an overlay to open/close the sidebar.
- Increased tap target sizes for buttons and nav items.