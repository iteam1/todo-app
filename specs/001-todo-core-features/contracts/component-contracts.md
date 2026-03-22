# Component Contracts: Todo App — Core Features

**Date**: 2026-03-22

These contracts define the public prop interfaces and behavioural expectations for each component.
They are the implementation target — the actual TypeScript types in `src/types/todo.ts` and component
files MUST satisfy these contracts.

---

## `TodoApp`

Root client component. Owns all state via `useTodos`. Composes all child components.

**Props**: none (state owner)

**Responsibilities**:
- Initialise and expose `useTodos` state (todos, activeFilter, actions).
- Render `TodoInput`, `FilterBar`, `TodoList`.
- Pass down only the props each child needs (no over-sharing).
- Render corruption notification banner when `useTodos` reports a recovery event.

---

## `TodoInput`

Controlled text input for creating new tasks.

```typescript
interface TodoInputProps {
  onSubmit: (text: string) => void;
}
```

**Behaviour**:
- Renders a text `<input>` and a submit `<button>` (or supports Enter key to submit).
- Calls `onSubmit(text.trim())` on submit.
- Validates locally: if trimmed text is empty, does NOT call `onSubmit`; focuses input.
- Clears the input field after a successful `onSubmit` call.
- Input MUST have a visible label (or `aria-label`) for screen readers.

---

## `TodoList`

Renders the filtered list of tasks or an empty-state message.

```typescript
interface TodoListProps {
  todos: TodoItem[];          // pre-filtered list from useTodos
  activeFilter: FilterOption;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Behaviour**:
- If `todos` is empty: renders a contextual message based on `activeFilter`:
  - `"all"` → *"No tasks yet. Add one above."*
  - `"active"` → *"No active tasks."*
  - `"completed"` → *"No completed tasks."*
- If `todos` is non-empty: renders a `<ul>` with one `<TodoItem>` per item.
- Does NOT filter or sort internally — receives already-filtered, ordered list.

---

## `TodoItem`

Single task row: displays text, completion toggle, and delete trigger.

```typescript
interface TodoItemProps {
  todo: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**Behaviour**:
- Renders as `<li>` with a native `<input type="checkbox">` for completion toggle.
- Checkbox `aria-label`: `"Mark '${todo.text}' as ${todo.status === 'active' ? 'complete' : 'incomplete'}"`.
- Completed tasks MUST show visually distinct style (strikethrough text, reduced opacity, or both).
- Delete button triggers `onDelete(todo.id)` — `TodoItem` does NOT show the confirmation; that is
  handled by the parent via `DeleteConfirmDialog`.
- Minimum touch target: 44 × 44 px for both the checkbox and the delete button (Tailwind `min-h-11 min-w-11`).

---

## `FilterBar`

Three-tab filter control.

```typescript
interface FilterBarProps {
  activeFilter: FilterOption;
  onChange: (filter: FilterOption) => void;
}
```

**Behaviour**:
- Renders three buttons: "All", "Active", "Completed".
- The active filter button MUST have a distinct visual state (e.g., underline, colour change).
- Each button calls `onChange` with the corresponding `FilterOption` value.
- Keyboard: tab to each button, Space/Enter to activate.
- ARIA: `role="tablist"` on the container; `role="tab"` on each button; `aria-selected` reflects
  active filter.

---

## `DeleteConfirmDialog`

Inline confirmation before permanent deletion.

```typescript
interface DeleteConfirmDialogProps {
  taskText: string;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Behaviour**:
- Renders when a delete is triggered from `TodoItem`.
- Displays the task text to confirm the correct item is being deleted.
- Provides "Delete" (confirm) and "Cancel" buttons.
- On mount: focus MUST move to the "Cancel" button (safer default per UX principle).
- On confirm: calls `onConfirm()`.
- On cancel or Escape key: calls `onCancel()`.
- MUST be keyboard-operable (Tab between buttons; Escape cancels).

---

## `useTodos` Hook

Core state and action hook.

```typescript
interface UseTodosReturn {
  todos: TodoItem[];               // full unfiltered list
  filteredTodos: TodoItem[];       // todos filtered + sorted by createdAt desc
  activeFilter: FilterOption;
  storageCorrupted: boolean;       // true for one render cycle after corruption recovery
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setFilter: (filter: FilterOption) => void;
}
```

**Behaviour**:
- `addTodo`: creates a new `TodoItem` with UUID, current timestamp, `status: "active"`,
  `completedAt: null`; prepends to list.
- `toggleTodo`: flips `status`; sets/clears `completedAt`.
- `deleteTodo`: removes item by `id`.
- `setFilter`: updates `activeFilter`; persists selection to `sessionStorage` (survives page
  navigation within tab; resets on new session — avoids stale filter confusion across sessions).
- `filteredTodos`: derived from `todos` + `activeFilter`; sorted newest-first.
- `storageCorrupted`: set to `true` when `storage.ts` detects and recovers from corruption;
  consumed by `TodoApp` to render the notification banner.

---

## `useLocalStorage` Hook

Generic typed localStorage hook.

```typescript
function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  validate: (value: unknown) => value is T
): [T, (value: T) => void]
```

**Behaviour**:
- Uses `useSyncExternalStore` internally.
- On read: calls `storage.ts` for parse + validation; falls back to `defaultValue` on failure.
- On write: serialises value to JSON; calls `localStorage.setItem`.
- Handles `QuotaExceededError` on write: logs error, does not throw.
- `getServerSnapshot` returns `defaultValue` (SSR-safe).
