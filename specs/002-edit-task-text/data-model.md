# Data Model: Edit Task Text

**Branch**: `002-edit-task-text` | **Date**: 2026-03-22

## Existing Entity: TodoItem

No new entities are introduced. The existing `TodoItem` interface is unchanged.

```
TodoItem {
  id        : string          — Unique identifier (UUID or random fallback). Immutable after creation.
  text      : string          — Task description. Non-empty, non-whitespace. MUTABLE by this feature.
  status    : 'active' | 'completed'
  createdAt : string          — ISO 8601 timestamp. Immutable after creation.
  completedAt: string | null  — ISO 8601 timestamp or null.
}
```

**Validation rules for `text`** (enforced by the EDIT_TODO reducer action):
- MUST NOT be empty string
- MUST NOT be whitespace-only (after `.trim()`)
- MUST be a string

If the edited text fails validation, the action is NOT dispatched. The UI layer (TodoItem component) is responsible for calling the validator before dispatching.

---

## New Reducer Action: EDIT_TODO

**Payload**:
```
{ type: 'EDIT_TODO', id: string, text: string }
```

**State transition**:
- Find the `TodoItem` with matching `id`
- Return new `todos` array with that item's `text` replaced by the trimmed payload `text`
- All other fields (`status`, `createdAt`, `completedAt`) are unchanged
- If no item matches `id`, state is returned unchanged (defensive no-op)

**Persistence**: No additional wiring. The existing `useEffect` in `useTodos` that writes `state.todos` to localStorage fires automatically when `todos` changes.

---

## New UI State: Edit Session (transient, not persisted)

Edit session state is ephemeral — it exists only while a task row is in edit mode and is never written to localStorage.

**In `TodoList` (or `TodoApp`)**:
```
editingId : string | null   — ID of the task currently in edit mode. null = no task editing.
```
- Set to a task's `id` when the user activates edit on that task
- Reset to `null` on save, cancel, or blank rejection

**In `TodoItem` (local to component)**:
```
editText : string           — Current value of the inline text input during an active edit session.
```
- Initialised with the task's current `text` when edit mode activates
- Cleared when edit mode exits

---

## State Transitions

```
[Display mode]
    │
    ▼ user clicks Edit button
[Edit mode]  editingId = task.id, editText = task.text
    │
    ├─▶ Enter pressed / blur fires
    │     ├─ editText.trim() non-empty  →  dispatch EDIT_TODO  →  [Display mode, text updated]
    │     └─ editText.trim() empty      →  restore original    →  [Display mode, text unchanged]
    │
    └─▶ Escape pressed                 →  restore original    →  [Display mode, text unchanged]
```
