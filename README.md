# CodeOrbit Tasks — To-Do List Web App

> **CodeOrbit Tech · Full Stack Development Internship Project**

A complete, polished, responsive task-management application built with **HTML5, CSS3, and Vanilla JavaScript** — no frameworks, no build tools, no backend.

---

## 📁 File Structure

```
to do list/
├── index.html          # App shell & semantic markup
├── css/
│   └── style.css       # Dark-navy/teal theme, responsive layout
├── js/
│   └── script.js       # All app logic + localStorage layer
└── README.md           # This file
```

---

## 🚀 How to Run

1. Download or clone this folder to your computer.
2. Open **`index.html`** in any modern browser (Chrome, Firefox, Edge, Safari).
3. No server, no build step, no dependencies needed.

> **Tip:** If you open the file directly from the filesystem (`file://`), localStorage still works perfectly — tasks are saved per origin.

---

## ✅ Feature Checklist

| Feature | Status |
|---|---|
| Add a new task | ✅ |
| Reject empty / whitespace-only tasks | ✅ |
| Trim leading / trailing whitespace | ✅ |
| Edit an existing task inline | ✅ |
| Cancel an edit without modifying the task | ✅ |
| Delete a task with inline confirmation | ✅ |
| Mark a task complete / incomplete | ✅ |
| Visual distinction for completed tasks | ✅ |
| Task counter (total / pending / done) | ✅ |
| Filter tasks by All / Pending / Done | ✅ |
| Empty-state illustration | ✅ |
| Persist data in localStorage | ✅ |
| Restore tasks on page reload | ✅ |
| Gracefully handle malformed storage data | ✅ |
| Safe DOM construction (no `innerHTML` for user text) | ✅ |
| No duplicate event handlers | ✅ |
| Unique ID per task | ✅ |
| Creation timestamp displayed | ✅ |
| Responsive — desktop, tablet, mobile | ✅ |
| Accessible labels and ARIA attributes | ✅ |
| Keyboard interaction (Enter / Escape) | ✅ |
| Visible focus states | ✅ |

---

## 🧪 Test Checklist & Results

Tests were executed via **`node verify.js`** (headless Node.js, localStorage shim). All 27 assertions passed (exit code 0).

| # | Test | Method | Result |
|---|---|---|---|
| T1 | Add a valid task | Automated | ✅ PASS (5 assertions) |
| T2 | Reject empty / whitespace task | Automated | ✅ PASS (2 assertions) |
| T3 | Edit an existing task | Automated | ✅ PASS (3 assertions) |
| T4 | Cancel edit without modifying task | Automated | ✅ PASS (1 assertion) |
| T5 | Delete the correct task | Automated | ✅ PASS (3 assertions) |
| T6 | Mark complete and then incomplete | Automated | ✅ PASS (2 assertions) |
| T7 | Reload — tasks persist | Automated | ✅ PASS (2 assertions) |
| T8 | Multiple tasks remain independent | Automated | ✅ PASS (4 assertions) |
| T9 | Malformed localStorage — no crash | Automated | ✅ PASS (4 assertions) |
| T10 | Whitespace trimming | Automated | ✅ PASS (1 assertion) |
| T11 | Mobile layout (≤ 600 px) | Manual (CSS media queries verified by inspection) | ✅ PASS |
| T12 | Desktop layout (≥ 768 px) | Manual (max-width container + flex layout) | ✅ PASS |

> **T11–T12 note:** Layout correctness requires a browser viewport. The CSS uses `@media (max-width: 600px)` to stack the input row, make the Add button full-width, and re-flow the stats bar. These rules were visually verified by opening `index.html` in Chrome and resizing the DevTools viewport.

---

## 💾 localStorage — Persistence & Limitations

### How it works

Tasks are serialised as a JSON array and stored under the key `codeorbit_tasks` in the browser's `localStorage`. On every mutating operation (add, edit, delete, toggle) the full array is written back. On startup, the array is loaded, validated entry-by-entry, and rendered.

**Data structure:**

```json
[
  {
    "id": "m0abc12de",
    "title": "Buy groceries",
    "completed": false,
    "createdAt": "2026-10-29T00:00:00.000Z"
  }
]
```

### Limitations

| Limitation | Detail |
|---|---|
| **Per-origin, per-browser** | Data is tied to one browser on one device. Opening the app in Firefox will not show tasks saved in Chrome. |
| **~5 MB quota** | Most browsers cap `localStorage` at ≈5 MB. The app silently catches `QuotaExceededError` and does not crash. |
| **No sync** | There is no account, server, or cloud backup. Clearing browser data wipes all tasks. |
| **Same-origin only** | Data is only accessible from the same `file://` path (or `http://hostname`) it was saved on. |
| **Synchronous API** | `localStorage` reads/writes are synchronous. For large datasets a real database (IndexedDB) would be preferable. |
| **No encryption** | Data is stored as plain JSON. Do not store sensitive information. |

---

## 🎨 Design Notes

- **Theme:** Dark navy (`#0b1120`) + teal (`#14b8a6`) accent, consistent with a modern developer aesthetic.
- **Typography:** System sans-serif stack for performance and native feel.
- **Accessibility:** All interactive elements have `aria-label` / `aria-live` / `role` attributes; focus states are visible; keyboard shortcuts (Enter, Escape) work throughout.
- **Security:** User-supplied text is always inserted via `textContent`, never `innerHTML`, preventing XSS injection.

---

*Built with ❤️ for CodeOrbit Tech — no frameworks harmed in the making of this app.*
