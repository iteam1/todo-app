# Storage Contract: Todo App — Core Features

**Date**: 2026-03-22

## Overview

The only external interface this application exposes is the browser's `localStorage`. This document
defines the contract between the application and the storage layer.

---

## localStorage Schema

### Key

```
"todos"
```

### Value

A JSON-serialised array of `TodoItem` objects (see `data-model.md` for full type definition).

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "text": "Buy groceries",
    "status": "active",
    "createdAt": "2026-03-22T09:00:00.000Z",
    "completedAt": null
  },
  {
    "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "text": "Write unit tests",
    "status": "completed",
    "createdAt": "2026-03-21T14:30:00.000Z",
    "completedAt": "2026-03-22T08:45:00.000Z"
  }
]
```

---

## Read Contract

| Condition | Behaviour |
|-----------|-----------|
| Key absent | Return `[]`; do not write anything |
| Value is valid JSON array of TodoItems | Return parsed array |
| Value is invalid JSON | Clear key; return `[]`; emit corruption notification |
| Value is valid JSON but not an array | Clear key; return `[]`; emit corruption notification |
| Value is valid JSON array but item fields are malformed | Clear key; return `[]`; emit corruption notification |

---

## Write Contract

| Trigger | Action |
|---------|--------|
| Task created | Prepend new item to array; serialise full array; `localStorage.setItem("todos", json)` |
| Task toggled | Update item in-place; serialise full array; `setItem` |
| Task deleted | Remove item from array; serialise full array; `setItem` |
| Storage full (`QuotaExceededError`) | Catch error; surface non-blocking user warning; do NOT clear existing data |

---

## Cross-Tab Sync Contract

- The `storage` event fires in all tabs except the one that made the write.
- The `useLocalStorage` hook subscribes to `window.addEventListener('storage', ...)` and re-reads
  the key on each event.
- The application does not lock or version writes; last-write-wins semantics apply.
- Tabs detect changes only to the `"todos"` key; unrelated storage events are ignored.

---

## Corruption Notification Contract

- When corruption is detected on read, the application MUST display a one-time, non-blocking banner
  or toast with a message such as: *"Your task data was unreadable and has been reset."*
- The notification MUST NOT block interaction with the app.
- The notification MUST disappear after user acknowledgement or a fixed timeout (≥ 5 seconds).
