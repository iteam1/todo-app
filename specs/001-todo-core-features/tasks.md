---

description: "Task list template for feature implementation"
---

# Tasks: Todo App — Core Features

**Input**: Design documents from `/specs/001-todo-core-features/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: Tests are MANDATORY per project constitution (unit + integration + E2E required for every feature).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project initialisation and tooling configuration

- [X] T001 Initialise Next.js 14 App Router project with TypeScript strict mode and Tailwind CSS at repository root (`npx create-next-app@latest . --typescript --tailwind --app --src-dir`)
- [X] T002 [P] Configure `jest.config.ts` — jsdom environment, `jest-localstorage-mock` in `setupFilesAfterFramework`, React Testing Library setup, module name mapper for `@/` alias, collect coverage from `src/`
- [X] T003 [P] Configure `playwright.config.ts` — `webServer` with `command: 'npm run dev'`, `url: 'http://localhost:3000'`, `reuseExistingServer: !process.env.CI`; `use.baseURL: 'http://localhost:3000'`
- [X] T004 [P] Verify `tsconfig.json` has `strict: true`, `noUncheckedIndexedAccess: true`, and `paths: { "@/*": ["./src/*"] }`; update if `create-next-app` defaults differ
- [X] T005 [P] Add npm scripts to `package.json`: `test:e2e` → `playwright test`, `test:all` → `npm run typecheck && npm run lint && npm test && npm run test:e2e`, `typecheck` → `tsc --noEmit`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, storage layer, and core hooks that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Define `TodoItem` interface, `TodoStatus` union (`'active' | 'completed'`), and `FilterOption` union (`'all' | 'active' | 'completed'`) in `src/types/todo.ts`
- [X] T007 [P] Implement `src/lib/storage.ts` — `parseTodos(raw: string | null): { todos: TodoItem[]; corrupted: boolean }` with try-catch around `JSON.parse`, `Array.isArray` check, per-item field validation (`id`, `text`, `status`, `createdAt`, `completedAt`), and `serializeTodos(todos: TodoItem[]): string`
- [X] T008 Implement `src/hooks/useLocalStorage.ts` — generic `useLocalStorage<T>(key, defaultValue, validate)` hook using `useSyncExternalStore`; `subscribe` wires `window.addEventListener('storage', cb)`; `getSnapshot` parses `localStorage.getItem(key)` and passes the result through the caller-supplied `validate` function, falling back to `defaultValue` on any error; `getServerSnapshot` returns `defaultValue`; write serialises value and calls `setItem`, catches `QuotaExceededError`, logs it, and returns `false` to signal failure to the caller
- [X] T009 Implement `src/hooks/useTodos.ts` — `useReducer` with actions `ADD_TODO`, `TOGGLE_TODO`, `DELETE_TODO`, `SET_FILTER`; `filteredTodos` derived from todos + activeFilter sorted by `createdAt` descending; `storageCorrupted` boolean surfaced from `useLocalStorage`; `storageQuotaExceeded` boolean set to `true` when `useLocalStorage` write returns `false` (QuotaExceededError), reset to `false` after 5 s; persists todos array on every state change via `useLocalStorage`, passing `parseTodos` as the `validate` argument
- [X] T010 [P] Create `src/app/globals.css` with `@tailwind base; @tailwind components; @tailwind utilities;` directives
- [X] T011 [P] Create `src/app/layout.tsx` as a Server Component with `<html>`, `<body>`, and `<ClientRoot>` wrapper; import `globals.css`; set metadata title to "Todo App"
- [X] T012 [P] Create `src/app/client-root.tsx` with `'use client'` directive; renders `{children}` as the single `'use client'` boundary for the entire app
- [X] T013 Create `src/app/page.tsx` importing and rendering `<TodoApp />` (created in Phase 3)

**Checkpoint**: Foundation complete — all user stories can now begin in parallel

---

## Phase 3: User Story 1 — Create and Manage Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks, see them in a list, and have them persist after a page refresh.

**Independent Test**: Create several tasks, refresh the page, verify all tasks are still displayed in correct order.

### Tests for User Story 1 (MANDATORY)

> **MANDATORY: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T014 [P] [US1] Write unit tests for `src/lib/storage.ts` in `__tests__/unit/lib/storage.test.ts`: valid JSON array returns parsed todos; `null` returns empty array; invalid JSON triggers recovery and returns `[]`; non-array JSON triggers recovery; item missing required field triggers recovery; `serializeTodos` round-trips correctly
- [X] T015 [P] [US1] Write unit tests for `src/hooks/useLocalStorage.ts` in `__tests__/unit/hooks/useLocalStorage.test.ts`: initial read from localStorage; write calls `setItem` with correct key and serialised value; storage event triggers re-read; `QuotaExceededError` is caught without throwing; server snapshot returns default value
- [X] T016 [P] [US1] Write unit tests for `src/hooks/useTodos.ts` ADD_TODO action in `__tests__/unit/hooks/useTodos.test.ts`: dispatching `ADD_TODO` creates a `TodoItem` with correct `id`, `text`, `status: 'active'`, `completedAt: null`, `createdAt`; new item prepended to list; whitespace-only text is rejected (no item added); list sorted newest-first
- [X] T017 [P] [US1] Write integration tests for `TodoInput` in `__tests__/integration/TodoInput.test.tsx`: renders labelled input and submit button; typing and pressing Enter calls `onSubmit` with trimmed text; clicking submit button calls `onSubmit`; whitespace-only input does not call `onSubmit` and keeps focus on input; input clears after successful submit; keyboard-only operable
- [X] T018 [P] [US1] Write integration tests for `TodoList` in `__tests__/integration/TodoList.test.tsx`: renders a `<ul>` with one `<TodoItem>` per task in `todos` prop; renders empty-state message `"No tasks yet. Add one above."` when `todos` is empty and `activeFilter` is `'all'`
- [X] T019 [US1] Write E2E test in `__tests__/e2e/create-task.spec.ts`: create a task and verify it appears at top of list; refresh page and verify task persists; attempt to submit whitespace task and verify it is not created; create a 500-character task and verify it is created without layout overflow

### Implementation for User Story 1

- [X] T020 [P] [US1] Implement `src/components/TodoInput.tsx` — controlled `<input type="text">` with `aria-label="New task"`, submit on Enter key or button click, trims + validates non-empty text before calling `onSubmit(text)`, clears input on success, displays inline validation hint on empty submit, min `h-11 w-11` touch target on submit button
- [X] T021 [P] [US1] Implement `src/components/TodoItem.tsx` — `<li data-todo-id={todo.id}>` with `<input type="checkbox" disabled aria-label="Mark '${todo.text}' as complete" checked={false} />` (toggle wired in T027/US2; `disabled` stub avoids unhandled click), task text display; min `h-11 w-11` touch targets; no strikethrough styling yet (added in T027)
- [X] T022 [P] [US1] Implement `src/components/TodoList.tsx` — renders `<ul>` with `<TodoItem>` per item when `todos.length > 0`; renders contextual empty-state message when `todos.length === 0` based on `activeFilter` prop (`'all'` → `"No tasks yet. Add one above."`, `'active'` → `"No active tasks."`, `'completed'` → `"No completed tasks."`)
- [X] T023 [US1] Implement `src/components/TodoApp.tsx` — `'use client'` component; consumes `useTodos`; renders a non-blocking auto-dismiss (5 s) banner when `storageCorrupted` is true ("Your task data was unreadable and has been reset."); renders a separate non-blocking auto-dismiss (5 s) banner when `storageQuotaExceeded` is true ("Storage full — your last change could not be saved."); composes `<TodoInput onSubmit={addTodo} />` and `<TodoList todos={filteredTodos} activeFilter={activeFilter} onToggle={toggleTodo} onDelete={deleteTodo} />`; reads `activeFilter` from `useTodos` state (do not hardcode `'all'` — the reducer initialises it; FilterBar added in US3 will call `setFilter`)

**Checkpoint**: User Story 1 is fully functional — create tasks, list renders, refresh persists, empty state visible

---

## Phase 4: User Story 2 — Task Completion Tracking (Priority: P1)

**Goal**: Users can mark tasks as completed or active; visual state and persistence are immediate and correct.

**Independent Test**: Create tasks, toggle completion state on each, refresh and verify every task retains its last-saved status.

### Tests for User Story 2 (MANDATORY)

> **MANDATORY: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T024 [P] [US2] Write unit tests for `useTodos.ts` TOGGLE_TODO action in `__tests__/unit/hooks/useTodos.test.ts`: active item → status becomes `'completed'` and `completedAt` is set; completed item → status becomes `'active'` and `completedAt` is `null`; toggling unknown id is a no-op; state is persisted to localStorage after toggle
- [X] T025 [P] [US2] Write integration tests for `TodoItem` toggle in `__tests__/integration/TodoItem.test.tsx`: checkbox is checked when `todo.status === 'completed'`; clicking checkbox calls `onToggle(todo.id)`; completed item renders with strikethrough Tailwind class; active item does not have strikethrough; `aria-label` reflects current completion state
- [X] T026 [US2] Write E2E test in `__tests__/e2e/complete-task.spec.ts`: mark a task complete and verify visual change; unmark it and verify visual revert; refresh page and verify completion state persists for both active and completed tasks

### Implementation for User Story 2

- [X] T027 [US2] Update `src/components/TodoItem.tsx` — remove `disabled` stub from checkbox; wire `onChange={() => onToggle(todo.id)}`; update `aria-label` to `"Mark '${todo.text}' as ${todo.status === 'active' ? 'complete' : 'incomplete'}"`; apply `line-through opacity-50` Tailwind classes when `status === 'completed'`
- [X] T028 [US2] Verify `src/components/TodoApp.tsx` already passes `onToggle={toggleTodo}` to `TodoList` and that `TodoList` passes it to each `TodoItem` (wire if not done in T023)

**Checkpoint**: User Stories 1 and 2 both work independently — create, complete, toggle, persist

---

## Phase 5: User Story 3 — Task Filtering (Priority: P2)

**Goal**: Users can filter tasks by All / Active / Completed; list updates immediately; empty states are contextual.

**Independent Test**: Create a mix of active and completed tasks, click each filter, verify only the correct subset is shown without altering underlying data.

### Tests for User Story 3 (MANDATORY)

> **MANDATORY: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T029 [P] [US3] Write unit tests for `useTodos.ts` SET_FILTER and `filteredTodos` in `__tests__/unit/hooks/useTodos.test.ts`: `'all'` returns all items; `'active'` returns only active items; `'completed'` returns only completed items; toggling a task while `'active'` filter is set causes it to disappear from `filteredTodos`; invalid stored filter falls back to `'all'`
- [X] T030 [P] [US3] Write integration tests for `FilterBar` in `__tests__/integration/FilterBar.test.tsx`: renders three buttons ("All", "Active", "Completed"); button matching `activeFilter` has `aria-selected="true"`; clicking each button calls `onChange` with the correct `FilterOption`; keyboard Tab/Space/Enter operable; `role="tablist"` on container
- [X] T031 [US3] Write E2E test in `__tests__/e2e/filter-tasks.spec.ts`: create 2 active and 1 completed task; verify "Active" filter shows 2 tasks; verify "Completed" shows 1 task; verify "All" shows all 3; complete a task while "Active" filter is active and verify it disappears from view; verify empty-state messages when no tasks match each filter

### Implementation for User Story 3

- [X] T032 [US3] Implement `src/components/FilterBar.tsx` — `<div role="tablist">` with three `<button role="tab">` elements for All/Active/Completed; `aria-selected` reflects `activeFilter === option`; active tab styled with Tailwind (e.g., `border-b-2 font-semibold`); calls `onChange(option)` on click; keyboard Tab focus + Space/Enter activation
- [X] T033 [US3] Update `src/components/TodoApp.tsx` — render `<FilterBar activeFilter={activeFilter} onChange={setFilter} />` between `TodoInput` and `TodoList`; ensure `filteredTodos` (not `todos`) is passed to `TodoList`
- [X] T034 [US3] Update `src/components/TodoList.tsx` — confirm `activeFilter` prop is used to select the correct empty-state message (`"No tasks yet. Add one above."` / `"No active tasks."` / `"No completed tasks."`); no other changes needed if T022 was implemented correctly

**Checkpoint**: User Stories 1, 2, and 3 all work independently — filtering live, empty states contextual

---

## Phase 6: User Story 4 — Task Deletion (Priority: P2)

**Goal**: Users can delete tasks with a confirmation step; deleted tasks are gone from all views and storage.

**Independent Test**: Delete tasks via keyboard and mouse, cancel a deletion, switch filters, refresh — verify deleted tasks never reappear.

### Tests for User Story 4 (MANDATORY)

> **MANDATORY: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T035 [P] [US4] Write unit tests for `useTodos.ts` DELETE_TODO action in `__tests__/unit/hooks/useTodos.test.ts`: item with matching id is removed from array; deleting unknown id is a no-op; remaining items are unchanged; localStorage is updated after deletion
- [X] T036 [P] [US4] Write integration tests for `DeleteConfirmDialog` in `__tests__/integration/DeleteConfirmDialog.test.tsx`: renders the task text; clicking "Delete" calls `onConfirm`; clicking "Cancel" calls `onCancel`; pressing Escape calls `onCancel`; focus moves to "Cancel" button on mount; both buttons keyboard-operable
- [X] T037 [US4] Write E2E test in `__tests__/e2e/delete-task.spec.ts`: click delete on a task, verify dialog shows task text, confirm deletion and verify task is gone from list; click delete, cancel, verify task remains; delete a task while "Completed" filter is active, switch to "All" and verify task is absent; refresh page and verify deleted task does not reappear

### Implementation for User Story 4

- [X] T038 [P] [US4] Implement `src/components/DeleteConfirmDialog.tsx` — modal/inline dialog showing task text with "Delete" and "Cancel" buttons; `autoFocus` on Cancel button; `onKeyDown` handler for Escape → `onCancel()`; min `h-11 w-11` touch targets; fully keyboard-operable
- [X] T039 [US4] Update `src/components/TodoItem.tsx` — add delete `<button>` with trash icon or "Delete" label (min `h-11 w-11`), `aria-label="Delete '${todo.text}'"`, local `showConfirm` state; render `<DeleteConfirmDialog>` when `showConfirm` is true; on confirm: call `onDelete(todo.id)` then move focus to next/previous sibling `<li>` using `data-todo-id` attribute lookup; on cancel: set `showConfirm` to false
- [X] T040 [US4] Update `src/components/TodoList.tsx` — pass `onDelete` prop through to each `<TodoItem>` (note: `data-todo-id` is already on the `<li>` in `TodoItem` from T021; no wrapper `<li>` needed here)
- [X] T041 [US4] Verify `src/components/TodoApp.tsx` passes `onDelete={deleteTodo}` to `TodoList` (should already be wired from T023; confirm and update if not)

**Checkpoint**: All four user stories complete and independently testable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Responsive layout, accessibility polish, and full quality-gate pass

- [X] T042 [P] Add responsive container layout to `src/components/TodoApp.tsx` — `mx-auto max-w-xl px-4 sm:px-6 py-8`; verify no horizontal overflow at 320 px viewport width; verify comfortable padding at 768 px and 1280 px
- [X] T043 [P] Audit all interactive elements in `TodoInput.tsx`, `TodoItem.tsx`, `FilterBar.tsx`, `DeleteConfirmDialog.tsx` for visible focus indicators — add `focus-visible:ring-2 focus-visible:ring-offset-2` or equivalent Tailwind classes where missing
- [X] T044 [P] Add Playwright responsive screenshot assertions in a new `__tests__/e2e/responsive.spec.ts` — verify no horizontal scrollbar at 320 × 568 px (mobile), 768 × 1024 px (tablet), and 1280 × 800 px (desktop) viewports
- [X] T045 Run full quality gate: `npm run test:all` (`typecheck` → `lint` → `test` → `test:e2e`); fix any type errors, lint violations, failing tests, or E2E failures
- [X] T046 [P] Validate `specs/001-todo-core-features/quickstart.md` manual checklist steps against the implemented app; update any script names or paths that changed during implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Depends on Phase 2 completion; integrates with US1 components
- **US3 (Phase 5)**: Depends on Phase 2 completion; integrates with US1 + US2 components
- **US4 (Phase 6)**: Depends on Phase 2 completion; integrates with US1 + US2 + US3 components
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Foundational complete — no story dependencies
- **US2 (P1)**: Foundational complete — builds on TodoItem from US1
- **US3 (P2)**: Foundational complete — adds FilterBar; integrates with US1 + US2 list
- **US4 (P2)**: Foundational complete — adds delete to TodoItem from US1; works with all filters from US3

### Within Each User Story

- Tests MUST be written and FAIL before implementation begins
- `src/types/` before `src/lib/` before `src/hooks/` before `src/components/`
- Unit tests before integration tests before E2E tests
- Story complete and checkpoint validated before moving to next story

### Parallel Opportunities

- All `[P]`-marked tasks within Phase 1 can run in parallel after T001 completes
- All `[P]`-marked tasks within Phase 2 can run in parallel after T006 completes
- Within each user story: all `[P]`-marked test tasks can be written in parallel
- Within each user story: all `[P]`-marked implementation tasks can be built in parallel after tests exist
- US1 and US2 can be developed concurrently by different developers after Phase 2 (US2 builds on TodoItem)

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all US1 tests simultaneously (all target different files):
Task: "T014 — __tests__/unit/lib/storage.test.ts"
Task: "T015 — __tests__/unit/hooks/useLocalStorage.test.ts"
Task: "T016 — __tests__/unit/hooks/useTodos.test.ts (ADD_TODO)"
Task: "T017 — __tests__/integration/TodoInput.test.tsx"
Task: "T018 — __tests__/integration/TodoList.test.tsx"
```

## Parallel Example: User Story 1 Implementation

```bash
# Launch after tests exist and are confirmed failing:
Task: "T020 — src/components/TodoInput.tsx"
Task: "T021 — src/components/TodoItem.tsx"
Task: "T022 — src/components/TodoList.tsx"
# T023 (TodoApp) depends on T020–T022 completing first
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (tests then implementation)
4. **STOP and VALIDATE**: create tasks, refresh, verify persistence, keyboard-test input
5. Deploy/demo if ready — this is a working, valuable product

### Incremental Delivery

1. Setup + Foundational → skeleton running
2. US1 → test independently → demo (task creation MVP)
3. US2 → test independently → demo (completion tracking added)
4. US3 → test independently → demo (filtering added)
5. US4 → test independently → demo (deletion added)
6. Polish → full quality gate → release-ready

### Parallel Team Strategy

With two developers after Phase 2:

- **Dev A**: US1 + US2 (both P1, build on same TodoItem component)
- **Dev B**: US3 + US4 (both P2, can start once Dev A has TodoItem skeleton from US1)

---

## Notes

- `[P]` = different files, no incomplete dependencies — safe to parallelise
- Story labels `[US1]`–`[US4]` map directly to spec.md user stories
- Tests MUST fail before implementation — no skipping the red phase
- Commit after each checkpoint or logical group
- Stop at any checkpoint to validate story independently before proceeding
- Avoid: vague tasks, same-file conflicts in parallel tasks, cross-story dependencies that break independence
