# Tasks: Edit Task Text

**Input**: Design documents from `/specs/002-edit-task-text/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: MANDATORY per project constitution (unit + integration + E2E required).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label — US1, US2, US3
- Exact file paths included in every description

---

## Phase 1: Setup

No new directories, dependencies, or configuration required. This feature extends existing source files only. Proceed directly to Phase 2.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the `EDIT_TODO` reducer action to the data layer. All user stories depend on this for persistence. Tests are written first (constitution: test-first preferred).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T001 Write unit tests for `EDIT_TODO` reducer action in `__tests__/unit/hooks/useTodos.test.ts` — cover: updates matching todo text, leaves all other fields unchanged (status/createdAt/completedAt), is a no-op when id not found, and `editTodo()` is present on hook return value. **Run tests — they MUST fail before T002.**
- [ ] T002 Add `EDIT_TODO` case to reducer and `editTodo(id, text)` to the return value in `src/hooks/useTodos.ts`. **Run T001 tests — they MUST pass after this task.**

**Checkpoint**: `editTodo()` is available and unit-tested. localStorage persistence is automatic via existing `useEffect`.

---

## Phase 3: User Story 1 — Edit and Save Inline (Priority: P1) 🎯 MVP

**Goal**: Users can click an Edit button on any task, modify the text in an inline input, and confirm (Enter or blur) to save the change. The update persists across page reloads.

**Independent Test**: Add a task → click Edit → change text → press Enter → reload page → confirm new text appears.

### Tests for User Story 1 (MANDATORY — write before implementation)

- [ ] T003 [P] [US1] Write integration tests for edit activation and save in `__tests__/integration/TodoItem.test.tsx` — cover: Edit button visible in display mode; clicking Edit shows input pre-filled with current text; pressing Enter saves new text; blurring input saves new text; input is auto-focused on edit activation; only one item in edit mode at a time (second click on different item cancels the first). **Run tests — they MUST fail before T004–T006.**

### Implementation for User Story 1

- [ ] T004 [P] [US1] Add to `src/components/TodoItem.tsx`: `isEditing`, `onEditStart`, `onEditSave`, `onEditCancel` props (fully typed); `editText` local state (initialised to `todo.text`); `useRef<HTMLInputElement>` for focus; `useEffect` to auto-focus + select-all when `isEditing` becomes true; conditional render (display text + Edit button when not editing; `<input>` when editing); `onKeyDown` handler dispatching Enter → `onEditSave(todo.id, editText)` and Escape → `onEditCancel()`; `onBlur` → `onEditSave(todo.id, editText)`; Edit button with `aria-label="Edit task"` and `min-h-[44px] min-w-[44px]` for touch target.
- [ ] T005 [US1] Add to `src/components/TodoList.tsx`: `editTodo: (id: string, text: string) => void` prop; `editingId: string | null` state (useState); `onEditStart(id)` → `setEditingId(id)`; `onEditSave(id, text)` → trim text, if non-empty call `editTodo(id, text.trim())` then `setEditingId(null)`, else `setEditingId(null)` (blank rejection — no dispatch); `onEditCancel()` → `setEditingId(null)`; pass `isEditing={editingId === todo.id}` and all three callbacks to each `<TodoItem>`. (Depends on T004 prop interface.)
- [ ] T006 [US1] In `src/components/TodoApp.tsx`: destructure `editTodo` from `useTodos()` and pass as `editTodo={editTodo}` prop to `<TodoList>`. (Depends on T002 and T005.)
- [ ] T007 [US1] Write E2E test in `__tests__/e2e/edit-task.spec.ts` — cover: add task → click Edit → change text → press Enter → reload → verify new text persists. (Depends on T005 + T006 being complete.)

**Checkpoint**: User Story 1 is fully functional. Edit → save → persist works end-to-end. Run `npm test && npm run test:e2e` to verify.

---

## Phase 4: User Story 2 — Cancel Edit (Priority: P2)

**Goal**: Users can press Escape during editing to discard changes and restore the original task text. No data is modified.

**Independent Test**: Create a task → click Edit → change text → press Escape → confirm original text is still shown.

**Note**: The Escape handler and `onEditCancel` callback are implemented in Phase 3 (T004 + T005). This phase adds dedicated tests to verify the cancel path in isolation.

### Tests for User Story 2 (MANDATORY)

- [ ] T008 [P] [US2] Add integration test cases for Escape cancellation to `__tests__/integration/TodoItem.test.tsx` — cover: pressing Escape with modified text restores original text; pressing Escape without changes leaves text unchanged; `editTodo` is NOT called when Escape is pressed. **Run tests — should pass if T004/T005 are correct; fail if Escape path has a bug.**
- [ ] T009 [US2] Add E2E test case to `__tests__/e2e/edit-task.spec.ts` — cover: add task → click Edit → modify text → press Escape → verify original text is displayed.

**Checkpoint**: Cancel path is independently verified. Escape always restores original text without any persistence side-effects.

---

## Phase 5: User Story 3 — Reject Blank Save (Priority: P3)

**Goal**: If the user clears all text and tries to save (Enter or blur), the original text is silently restored. Blank task text is never persisted.

**Independent Test**: Create a task → click Edit → clear all text → press Enter → confirm original text is restored and persists on reload.

**Note**: Blank rejection logic is in `onEditSave` in `TodoList` (T005): `text.trim() === ''` → skip dispatch + reset `editingId`. This phase adds dedicated tests.

### Tests for User Story 3 (MANDATORY)

- [ ] T010 [P] [US3] Add integration test cases for blank rejection to `__tests__/integration/TodoItem.test.tsx` — cover: pressing Enter with blank text restores original text; blurring with blank text restores original text; whitespace-only input is treated as blank and rejected; `editTodo` is NOT called when text is blank or whitespace-only.
- [ ] T011 [US3] Add E2E test case to `__tests__/e2e/edit-task.spec.ts` — cover: add task → click Edit → clear text → press Enter → verify original text remains and persists on reload.

**Checkpoint**: All three user stories are independently functional and tested. Blank input never corrupts stored data.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T012 [P] Verify responsive behaviour of the Edit button and inline input in `src/components/TodoItem.tsx` — confirm touch target ≥ 44×44 px on mobile (320 px viewport), no horizontal overflow at any breakpoint; add a Playwright screenshot assertion in `__tests__/e2e/edit-task.spec.ts` at mobile viewport if not already covered.
- [ ] T013 Run the full quality gate suite and fix any issues: `npm run typecheck && npm run lint && npm test && npm run test:e2e`. All gates must pass with zero errors before the feature branch is merge-ready.

**Checkpoint**: All quality gates green. Feature is ready for PR.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 2 (Foundational)**: No dependencies — start immediately
- **Phase 3 (US1)**: Depends on Phase 2 completion — BLOCKS direct use of `editTodo`
- **Phase 4 (US2)**: Depends on Phase 3 completion (Escape handler is in T004/T005)
- **Phase 5 (US3)**: Depends on Phase 3 completion (blank rejection is in T005)
- **Phase 6 (Polish)**: Depends on Phases 3, 4, 5 complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (T002). No other story dependencies.
- **US2 (P2)**: Depends on US1 implementation (Escape handler wired in T004/T005).
- **US3 (P3)**: Depends on US1 implementation (blank guard is in onEditSave from T005).

### Within Phase 3 (US1)

```
T003 ──[P]── T004        ← parallel: different files
               │
              T005        ← depends on T004 (TodoItem prop interface)
               │
              T006        ← depends on T002 (editTodo) + T005 (TodoList prop)
               │
              T007        ← depends on T006 (full save chain wired)
```

### Within Phases 4 and 5

```
T008 ──[P]── T009        ← parallel: different files (integration vs e2e)
T010 ──[P]── T011        ← parallel: different files
```

---

## Parallel Execution Examples

### Phase 2

```bash
# Sequential (T001 must fail before T002):
Task: "Write unit tests for EDIT_TODO reducer in useTodos.test.ts"
Task: "Add EDIT_TODO reducer case and editTodo() in useTodos.ts"
```

### Phase 3 (US1) — open T003 and T004 together

```bash
# Launch these in parallel:
Task: "Write integration tests for edit activation and save in TodoItem.test.tsx"
Task: "Add edit props, inline input, and keyboard handlers to TodoItem.tsx"

# Then sequentially:
Task: "Add editingId state and edit callbacks to TodoList.tsx"
Task: "Wire editTodo from useTodos into TodoApp.tsx"
Task: "Write E2E test for save + persist in edit-task.spec.ts"
```

### Phases 4 and 5 — once Phase 3 is done

```bash
# US2 tests in parallel:
Task: "Integration tests for Escape cancellation in TodoItem.test.tsx"
Task: "E2E test for Escape in edit-task.spec.ts"

# US3 tests in parallel:
Task: "Integration tests for blank rejection in TodoItem.test.tsx"
Task: "E2E test for blank rejection in edit-task.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001–T002)
2. Complete Phase 3: User Story 1 (T003–T007)
3. **STOP and VALIDATE**: `npm test && npm run test:e2e` — US1 works end-to-end
4. Demo inline edit with persistence

### Incremental Delivery

1. Phase 2 + Phase 3 → Inline edit with save — **MVP demo-able**
2. Add Phase 4 → Escape cancel — safe undo path
3. Add Phase 5 → Blank rejection — data integrity guardrail
4. Add Phase 6 → Polish, quality gates — merge-ready

---

## Notes

- `[P]` tasks touch different files with no shared in-progress dependencies
- Tests MUST be written first and confirmed failing before implementation
- Each story's checkpoint is independently verifiable — stop and test before moving on
- `editTodo` persistence is automatic — no manual localStorage.setItem needed
- Blank rejection: `text.trim() === ''` check lives in `onEditSave` in TodoList (not in reducer)
- Only one item in edit mode at a time: enforced by `editingId` in TodoList (single `useState`)
