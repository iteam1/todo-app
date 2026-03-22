# todo-app Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-22

## Active Technologies
- TypeScript 5.4 (strict mode, `any` prohibited) + Next.js 14 (App Router), React 18, Tailwind CSS 3 (002-edit-task-text)
- localStorage — existing `useTodos` persistence pipeline (auto-persist on state change) (002-edit-task-text)

- TypeScript 5.x (strict mode — `any` prohibited except verified external-data boundaries) + Next.js 14+, React 18+, Tailwind CSS 3+ (001-todo-core-features)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x (strict mode — `any` prohibited except verified external-data boundaries): Follow standard conventions

## Recent Changes
- 002-edit-task-text: Added TypeScript 5.4 (strict mode, `any` prohibited) + Next.js 14 (App Router), React 18, Tailwind CSS 3

- 001-todo-core-features: Added TypeScript 5.x (strict mode — `any` prohibited except verified external-data boundaries) + Next.js 14+, React 18+, Tailwind CSS 3+

<!-- MANUAL ADDITIONS START -->
## Task Workflow (MANDATORY)

When working through tasks from `tasks.md`:

1. **Before starting**: Use `TodoWrite` to load all tasks from `tasks.md` into your todo list so progress is visible.
2. **One task at a time**: Complete one task fully before moving to the next.
3. **After each task**: Stop and wait for user review. Do NOT auto-proceed to the next task.
4. **User confirms OK**: Then and only then commit the changes with message format `task(T###): <task description>` and move to the next task.
5. **User gives feedback**: Apply the feedback, then stop again for re-review. Repeat until user confirms OK.

This loop ensures every task is reviewed and committed independently before proceeding.
<!-- MANUAL ADDITIONS END -->
