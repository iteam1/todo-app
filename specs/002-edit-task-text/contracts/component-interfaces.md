# Component Interface Contracts: Edit Task Text

**Branch**: `002-edit-task-text` | **Date**: 2026-03-22

These are the internal prop/return-type contracts introduced or modified by this feature. They serve as the authoritative interface definition during implementation.

---

## `useTodos` hook — additions

The hook's return type gains one new function:

```typescript
editTodo(id: string, text: string): void
```

- Dispatches `EDIT_TODO` action
- Caller is responsible for pre-validating `text` (non-empty after trim) before calling
- No return value; state update is synchronous via React reducer

Full updated return shape (additions in bold):

```typescript
{
  todos: TodoItem[];
  activeFilter: FilterOption;
  storageCorrupted: boolean;
  storageQuotaExceeded: boolean;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setFilter: (filter: FilterOption) => void;
  editTodo: (id: string, text: string) => void;   // NEW
}
```

---

## `TodoList` component — additions

New internal state:

```typescript
const [editingId, setEditingId] = useState<string | null>(null);
```

New callbacks passed to each `TodoItem`:

```typescript
onEditStart: (id: string) => void
  // Sets editingId = id; if another item was editing, its edit is cancelled first

onEditSave: (id: string, text: string) => void
  // Validates text; if non-empty calls editTodo(id, text); then sets editingId = null

onEditCancel: () => void
  // Sets editingId = null (TodoItem restores its own editText from props)
```

---

## `TodoItem` component — additions

New props:

```typescript
interface TodoItemProps {
  todo: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;              // NEW — true when this item is in edit mode
  onEditStart: (id: string) => void; // NEW — call when user clicks Edit button
  onEditSave: (id: string, text: string) => void; // NEW — call on Enter or blur
  onEditCancel: () => void;        // NEW — call on Escape
}
```

Local state (inside component):

```typescript
const [editText, setEditText] = useState(todo.text);
```

Behaviour:
- When `isEditing` transitions from `false` → `true`: reset `editText` to `todo.text` and focus the input
- When `isEditing` is `true` and Enter is pressed: call `onEditSave(todo.id, editText)`
- When `isEditing` is `true` and Escape is pressed: call `onEditCancel()`
- When `isEditing` is `true` and input blurs: call `onEditSave(todo.id, editText)` (same as Enter)
- When `isEditing` is `false`: render task text as usual
- Edit button is hidden/disabled while `isEditing` is `true` (prevent double-activation)

Focus behaviour:
- On edit activation: auto-focus the inline input and select all text
- On edit exit (save/cancel): return focus to the Edit button on this row

---

## EDIT_TODO Reducer Action Contract

```typescript
type Action =
  | { type: 'ADD_TODO'; text: string }
  | { type: 'TOGGLE_TODO'; id: string }
  | { type: 'DELETE_TODO'; id: string }
  | { type: 'SET_FILTER'; filter: FilterOption }
  | { type: 'EDIT_TODO'; id: string; text: string }  // NEW
```

Reducer guarantee:
- Input `text` MUST be non-empty and non-whitespace (caller's responsibility)
- Returns a new `State` object (immutable update)
- `todos` array reference changes only if a matching item is found
- No other state fields (`activeFilter`, `storageCorrupted`) are affected
