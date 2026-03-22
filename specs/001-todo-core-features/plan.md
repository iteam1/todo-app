# Implementation Plan: Todo App — Core Features

**Branch**: `001-todo-core-features` | **Date**: 2026-03-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-todo-core-features/spec.md`

## Summary

Build a personal todo list SPA using Next.js 14 (App Router) with TypeScript strict mode, React hooks
for state management, and localStorage for client-side persistence. The app supports task creation,
completion tracking, status filtering (All / Active / Completed), and deletion with confirmation —
fully client-side, offline-capable, with basic keyboard accessibility and full mobile-to-desktop
responsiveness. Maximum supported task count is 100.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode — `any` prohibited except verified external-data boundaries)
**Primary Dependencies**: Next.js 14+, React 18+, Tailwind CSS 3+
**Storage**: Browser localStorage (JSON-serialised array; `useSyncExternalStore` for cross-tab sync)
**Testing**: Jest 29+, React Testing Library 14+, Playwright 1.40+, jest-localstorage-mock
**Target Platform**: Web browsers — mobile (≥ 320 px), tablet (≥ 768 px), desktop (≥ 1280 px)
**Project Type**: Single-page web application (Next.js App Router, fully client-side)
**Performance Goals**: ≤ 100 ms UI interactions; ≤ 1 s filter updates; renders 100 tasks without perceptible delay
**Constraints**: Client-side only; offline-capable; no backend; no authentication
**Scale/Scope**: Personal productivity — single user, maximum 100 tasks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design — all gates still pass.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Clean Code | Single-responsibility components; no dead code; no `any` types | ✅ PASS — component split enforced (see Project Structure); strict TS throughout |
| II. Simple UX | Immediate feedback for all actions; no silent failures; clear empty states | ✅ PASS — FR-012, FR-013 mandate feedback and empty states; error path covered in `storage.ts` |
| III. Responsive Design | Tailwind breakpoints; 44 px touch targets; no horizontal overflow | ✅ PASS — mobile-first Tailwind; FR-014, SC-004 define measurable responsive targets |
| IV. Minimal Dependencies | Core stack only; no UI library or state manager beyond React hooks | ✅ PASS — `jest-localstorage-mock` is a devDependency justified by Jest's lack of a built-in localStorage API |
| V. Mandatory Testing | Unit + integration + E2E for all 4 user stories | ✅ PASS — test structure maps each story to unit/integration/E2E files |

No violations — Complexity Tracking omitted.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-core-features/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── storage-contract.md     # localStorage schema + corruption recovery contract
│   └── component-contracts.md  # Component prop interfaces (UI contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx           # Root layout (Server Component shell); mounts ClientRoot
│   ├── client-root.tsx      # 'use client' boundary; wraps page content
│   ├── page.tsx             # Single page; renders <TodoApp />
│   └── globals.css          # Tailwind base directives (@tailwind base/components/utilities)
├── components/
│   ├── TodoApp.tsx          # Root client component; owns state via useTodos
│   ├── TodoInput.tsx        # Controlled input + submit for new tasks
│   ├── TodoList.tsx         # Renders filtered list or appropriate empty-state message
│   ├── TodoItem.tsx         # Single task row: checkbox toggle, text display, delete trigger
│   ├── FilterBar.tsx        # All / Active / Completed tab controls
│   └── DeleteConfirmDialog.tsx  # Inline confirmation prompt before permanent deletion
├── hooks/
│   ├── useTodos.ts          # Core reducer: add, toggleComplete, delete, setFilter; exposes filtered list
│   └── useLocalStorage.ts   # Generic useSyncExternalStore-based localStorage hook with cross-tab sync
├── lib/
│   └── storage.ts           # JSON serialise/deserialise; try-catch corruption detection; schema validation
└── types/
    └── todo.ts              # TodoItem interface; TodoStatus enum; FilterOption enum

__tests__/
├── unit/
│   ├── hooks/
│   │   ├── useTodos.test.ts
│   │   └── useLocalStorage.test.ts
│   └── lib/
│       └── storage.test.ts
├── integration/
│   ├── TodoInput.test.tsx
│   ├── TodoList.test.tsx
│   ├── TodoItem.test.tsx
│   └── FilterBar.test.tsx
└── e2e/
    ├── create-task.spec.ts
    ├── complete-task.spec.ts
    ├── filter-tasks.spec.ts
    └── delete-task.spec.ts

playwright.config.ts
jest.config.ts
tsconfig.json
```

**Structure Decision**: Single Next.js project at repository root. App Router `src/app/` provides the
page shell; `client-root.tsx` establishes the `'use client'` boundary at the lowest necessary level,
keeping `layout.tsx` as a Server Component. All business logic lives in `src/hooks/` and `src/lib/`;
components are pure presentational + event wiring. Tests mirror source structure under `__tests__/`.
