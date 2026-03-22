# Quickstart: Edit Task Text

**Branch**: `002-edit-task-text` | **Date**: 2026-03-22

A concise guide for the developer implementing this feature.

---

## What you're building

An inline text editor for existing todo items. When the user clicks "Edit" on a task row, the text is replaced by a pre-filled text input. Enter or blur saves; Escape cancels; blank input rejects and restores the original.

---

## Files to change

| File | What changes |
|------|-------------|
| `src/hooks/useTodos.ts` | Add `EDIT_TODO` reducer case + `editTodo` function to return value |
| `src/components/TodoList.tsx` | Add `editingId` state; pass `isEditing`, `onEditStart`, `onEditSave`, `onEditCancel` to `TodoItem` |
| `src/components/TodoItem.tsx` | Add inline edit UI: edit button, conditional input, keyboard handlers, focus management |

No changes to `src/types/todo.ts` or `src/lib/storage.ts`.

---

## Step-by-step implementation order

### Step 1 — Add `EDIT_TODO` to the reducer (`useTodos.ts`)

1. Add `{ type: 'EDIT_TODO'; id: string; text: string }` to the `Action` union type.
2. Add a `case 'EDIT_TODO':` branch in the reducer:
   ```typescript
   case 'EDIT_TODO':
     return {
       ...state,
       todos: state.todos.map(t =>
         t.id === action.id ? { ...t, text: action.text } : t
       ),
     };
   ```
3. Add `editTodo` to the hook's return value:
   ```typescript
   editTodo: (id: string, text: string) =>
     dispatch({ type: 'EDIT_TODO', id, text }),
   ```
4. Verify: existing `useEffect` for localStorage persistence fires automatically — no extra code needed.

### Step 2 — Lift edit state into `TodoList`

1. Add state: `const [editingId, setEditingId] = useState<string | null>(null);`
2. Accept `editTodo` from `useTodos` via props or directly if `TodoList` calls the hook (check current wiring).
3. Define callbacks:
   - `onEditStart(id)`: `setEditingId(id)`
   - `onEditSave(id, text)`: trim text; if non-empty call `editTodo(id, text.trim())`; `setEditingId(null)`
   - `onEditCancel()`: `setEditingId(null)`
4. Pass `isEditing={editingId === todo.id}` and the three callbacks to each `<TodoItem>`.

### Step 3 — Add inline edit UI to `TodoItem`

1. Add local state: `const [editText, setEditText] = useState(todo.text);`
2. Add a `useRef<HTMLInputElement>(null)` for the edit input.
3. Add a `useEffect` that fires when `isEditing` changes:
   - `isEditing` → `true`: `setEditText(todo.text)`, `inputRef.current?.focus()`, `inputRef.current?.select()`
   - `isEditing` → `false`: no action needed (state resets on next activation)
4. Render conditionally:
   - `isEditing === false`: existing text display + new Edit button (icon, aria-label="Edit task")
   - `isEditing === true`: `<input>` with `value={editText}`, `onChange`, `onKeyDown`, `onBlur`
5. Key handlers in `onKeyDown`:
   - `Enter`: call `onEditSave(todo.id, editText)`
   - `Escape`: call `onEditCancel()`
6. `onBlur`: call `onEditSave(todo.id, editText)` — same as Enter
7. Touch targets: Edit button MUST be ≥ 44 × 44 px (use `p-2` or `min-h-[44px] min-w-[44px]`).

---

## Key invariants to preserve

- **One edit at a time**: enforced by `editingId` in `TodoList`; activating a second edit cancels the first.
- **Blank rejection is silent**: `onEditSave` discards the edit if `text.trim() === ''`; no error shown.
- **Persistence is automatic**: updating `state.todos` via `EDIT_TODO` triggers the existing `useEffect` — no manual `localStorage.setItem` needed.
- **TypeScript strict mode**: no `any`; all new props must be fully typed.

---

## Tests to write

### Unit (`__tests__/unit/hooks/useTodos.test.ts`)
- `EDIT_TODO` updates the text of the matching todo
- `EDIT_TODO` does not change any other fields (status, createdAt, completedAt)
- `EDIT_TODO` with a non-existent id is a no-op
- `editTodo()` function is exposed on the hook return value

### Integration (`__tests__/integration/TodoItem.test.tsx`)
- Edit button is visible in display mode
- Clicking Edit button shows the input pre-filled with current text
- Pressing Enter saves the new text
- Pressing Escape restores the original text
- Blurring the input saves the new text
- Pressing Enter with blank text restores the original text
- Blurring with blank text restores the original text
- Input is auto-focused when edit mode activates
- Only one item can be in edit mode at a time (TodoList-level test)

### E2E (`__tests__/e2e/edit-task.spec.ts`)
- Add a task → edit its text → confirm → reload → verify new text persists
- Add a task → edit its text → press Escape → verify original text remains
- Add a task → edit to blank → confirm → verify original text remains

---

## Run commands

```bash
npm test                   # Unit + integration
npm run test:e2e           # Playwright E2E (requires dev server)
npm run typecheck          # tsc --noEmit
npm run lint               # ESLint
```
