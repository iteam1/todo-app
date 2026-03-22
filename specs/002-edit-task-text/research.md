# Research: Edit Task Text

**Branch**: `002-edit-task-text` | **Date**: 2026-03-22

## Summary

All decisions are fully resolvable from the existing codebase and standard React/web conventions. No external research was required. Zero NEEDS CLARIFICATION items remain.

---

## Decision 1: Where to own edit state

**Decision**: `editingId: string | null` is lifted to `TodoList` (or `TodoApp`); `editText` is local to `TodoItem`.

**Rationale**: The "only one edit at a time" constraint requires a single source of truth for which item (if any) is currently being edited. `TodoList` already owns the rendered list and passes per-item props, making it the natural owner. `editText` — the in-progress string — is transient view state that only `TodoItem` needs; lifting it would add unnecessary re-renders to siblings.

**Alternatives considered**:
- **All-local in `TodoItem`**: Simple, but two items could be in edit mode simultaneously if a user clicks edit on two items quickly. Rejected — violates FR-007.
- **Global in `useTodos` reducer**: Possible, but edit mode is a pure UI concern with no persistence requirement; mixing it into the data reducer violates single-responsibility (Principle I).

---

## Decision 2: EDIT_TODO reducer action

**Decision**: Add an `EDIT_TODO` action to the existing `useTodos` reducer. Payload: `{ id: string; text: string }`. The action finds the todo by id and returns a new array with the updated `text`.

**Rationale**: The existing reducer pattern (ADD_TODO, TOGGLE_TODO, DELETE_TODO, SET_FILTER) is the established data-mutation pathway. Extending it ensures the existing localStorage auto-persist side-effect (the `useEffect` that serialises `state.todos` on every change) handles persistence automatically — no additional wiring needed.

**Alternatives considered**:
- **Direct `localStorage.setItem` in `TodoItem`**: Bypasses the reducer; creates a second write path and risks desync. Rejected.
- **New standalone hook**: Unnecessary indirection for a single action. Rejected.

---

## Decision 3: Edit activation affordance

**Decision**: An "Edit" icon button on each `TodoItem` row activates edit mode. This follows the same pattern as the existing "Delete" button.

**Rationale**: The delete button is already present, keyboard-accessible, and aria-labelled. Adding a sibling edit button is consistent, obvious (Principle II), and requires no new interaction pattern. Double-click on task text is a common alternative but is not touch-friendly and conflicts with text selection.

**Alternatives considered**:
- **Double-click on task text**: Common in desktop UIs, but poor on mobile (touch targets) and conflicts with text selection. Rejected per Principle III.
- **Inline "edit" text link**: Adds visual clutter competing with the task text. Rejected per Principle II.

---

## Decision 4: Blank/whitespace rejection behaviour

**Decision**: On blur or Enter with blank/whitespace-only text, silently restore the original task text and exit edit mode. No error dialog or inline message is shown.

**Rationale**: The spec says "restore original" — a silent restore is the least disruptive recovery. An error message for a blank edit would add noise for a minor slip; the restoration itself communicates that blank is not accepted. This aligns with Principle II (minimise cognitive load).

**Alternatives considered**:
- **Show inline validation message**: Adds noise and complexity for a case the user will self-correct immediately. Rejected.
- **Keep input open and shake/highlight**: More visual feedback, but over-engineers a minor slip. Rejected.

---

## Decision 5: Simultaneous edit guard

**Decision**: When the user activates edit mode on a second item while one is already open, the currently open edit is **cancelled** (original text restored), and the new item enters edit mode.

**Rationale**: FR-007 requires only one item in edit mode at a time. Cancel-on-switch is simpler than save-on-switch (which would silently commit a potentially unintentional partial edit). The user's intent to edit a different item is a clear signal to abandon the previous attempt.

**Alternatives considered**:
- **Save-on-switch**: Could commit accidental partial text. Rejected.
- **Block the second edit until first is resolved**: Forces explicit resolution but imposes friction for an accidental click. Rejected.

---

## Decision 6: No new npm dependencies

**Decision**: Zero new packages. All implementation uses React built-ins (controlled input, `useRef`, `useEffect` for focus), Tailwind utilities for styling, and TypeScript for types.

**Rationale**: The feature is straightforward controlled-input behaviour. Constitution Principle IV prohibits adding packages when the existing stack suffices.

**Alternatives considered**: None — the existing stack is fully sufficient.
