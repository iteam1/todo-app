# Quickstart: Todo App — Core Features

**Branch**: `001-todo-core-features` | **Date**: 2026-03-22

## Prerequisites

- Node.js 20+
- npm 10+ (or the package manager initialised in the repository)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
# → App available at http://localhost:3000
```

## Running Tests

```bash
# Unit + integration tests (Jest + React Testing Library)
npm test

# Unit + integration tests in watch mode
npm run test:watch

# E2E tests (Playwright — requires dev server running OR uses webServer auto-start)
npm run test:e2e

# All tests + type check in one command (use before committing)
npm run test:all
```

## Type Check

```bash
npm run typecheck
# Runs: tsc --noEmit
# Expected: zero errors (strict mode enforced)
```

## Lint

```bash
npm run lint
# Expected: zero errors
```

## Validate a Feature End-to-End (Manual)

1. Open `http://localhost:3000` in a browser.
2. **Create**: Type a task description and press Enter (or click Add). Verify it appears at the top
   of the list with Active status.
3. **Persist**: Refresh the page. Verify the task is still there.
4. **Complete**: Click the checkbox next to a task. Verify the visual style changes immediately.
5. **Filter**: Click "Active" — verify only uncompleted tasks show. Click "Completed" — verify only
   completed tasks show. Click "All" — verify all tasks show.
6. **Delete**: Click the delete button on a task. Confirm in the dialog. Verify the task disappears
   from all filter views and does not return after a page refresh.
7. **Keyboard**: Tab through all controls. Verify all actions (create, toggle, filter, delete, cancel
   delete) are reachable and operable without a mouse.
8. **Mobile**: Resize browser to 320 px wide. Verify no horizontal overflow and all touch targets
   are comfortably tappable.

## Validate Corruption Recovery (Manual)

```javascript
// Paste in browser DevTools console to corrupt storage:
localStorage.setItem('todos', 'this is not json {{{');
```

Refresh the page. Verify:
- The app loads (does not crash or show a blank screen).
- A non-blocking notification appears explaining data was reset.
- The task list is empty and fully functional.

## Project Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `next dev` | Start local dev server |
| `build` | `next build` | Production build |
| `start` | `next start` | Start production server |
| `typecheck` | `tsc --noEmit` | TypeScript validation |
| `lint` | `next lint` | ESLint via Next.js |
| `test` | `jest` | Unit + integration tests |
| `test:watch` | `jest --watch` | Tests in watch mode |
| `test:e2e` | `playwright test` | E2E tests |
| `test:all` | `npm run typecheck && npm run lint && npm test && npm run test:e2e` | Full quality gate |
