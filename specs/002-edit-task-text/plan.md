# Implementation Plan: Edit Task Text

**Branch**: `002-edit-task-text` | **Date**: 2026-03-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-edit-task-text/spec.md`

## Summary

Allow users to edit the text of any existing task inline. Activating edit mode on a task replaces its display text with a pre-filled input; confirming (Enter/blur) saves; Escape or blank input restores the original. The change is persisted to localStorage via the existing reducer + persistence pipeline. No new dependencies are introduced.

## Technical Context

**Language/Version**: TypeScript 5.4 (strict mode, `any` prohibited)
**Primary Dependencies**: Next.js 14 (App Router), React 18, Tailwind CSS 3
**Storage**: localStorage — existing `useTodos` persistence pipeline (auto-persist on state change)
**Testing**: Jest 29 + React Testing Library 14 (unit/integration), Playwright 1.40 (E2E)
**Target Platform**: Web — all modern browsers; responsive across mobile ≥ 320 px, tablet ≥ 768 px, desktop ≥ 1280 px
**Project Type**: Client-side web application (Next.js, no backend)
**Performance Goals**: Inline edit activation and save must feel instantaneous (< 100 ms perceived latency — no async operations involved)
**Constraints**: No new npm dependencies; Tailwind utilities only for styling
**Scale/Scope**: Single-user, single-tab; up to a few hundred tasks per session

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Clean Code | PASS | Edit logic split: data mutation in `useTodos` reducer; UI state (isEditing, editText) in `TodoItem` or lifted to `TodoList`; no mixed abstractions |
| II. Simple UX | PASS | Edit activated by a single click on an affordance; save/cancel via keyboard conventions (Enter/Escape/blur); blank rejection is silent (restore, no error dialog) |
| III. Responsive Design | PASS | Inline input uses `w-full` and Tailwind utilities; touch target ≥ 44 × 44 px for the edit trigger button |
| IV. Minimal Dependencies | PASS | No new dependencies required; existing stack covers all needs |
| V. Mandatory Testing | PASS | Unit tests (reducer action), integration tests (TodoItem edit interactions), E2E test (full edit user journey) all required |

## Project Structure

### Documentation (this feature)

```text
specs/002-edit-task-text/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code

```text
src/
├── hooks/
│   └── useTodos.ts           # Add EDIT_TODO action + editTodo() export
├── components/
│   ├── TodoList.tsx           # Add editingId state; pass edit callbacks to TodoItem
│   └── TodoItem.tsx           # Add inline edit mode (local editText state)
└── types/
    └── todo.ts               # No changes required

__tests__/
├── unit/
│   └── hooks/
│       └── useTodos.test.ts  # Add EDIT_TODO reducer tests
├── integration/
│   └── TodoItem.test.tsx     # Add edit mode interaction tests
└── e2e/
    └── edit-task.spec.ts     # New — covers full edit journey
```

**Structure Decision**: Web application (frontend-only). All changes are confined to existing `src/` directories. No new directories required.

## Complexity Tracking

> No constitution violations — table not required.
