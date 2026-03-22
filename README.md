# Todo App

A personal todo list web app built with Next.js 14, React 18, TypeScript, and Tailwind CSS. Everything runs client-side — no backend, no account needed. Your tasks are saved in your browser's localStorage and persist across page refreshes.

## Features

- **Create tasks** — type a task and press Enter or click Add
- **Complete tasks** — check the checkbox to mark a task done (and uncheck to revert)
- **Filter tasks** — switch between All / Active / Completed views
- **Delete tasks** — remove a task with a confirmation step
- **Persistence** — tasks survive page refreshes via localStorage
- **Corruption recovery** — if stored data is unreadable, the app resets gracefully with a notice
- **Keyboard accessible** — all actions reachable without a mouse
- **Responsive** — works on mobile (320 px) up to desktop (1280 px+)

## Prerequisites

### Node.js and npm

This project requires **Node.js 20+** and **npm 10+**.

Check your versions:

```bash
node --version   # should be v20.x or higher
npm --version    # should be 10.x or higher
npx --version    # comes bundled with npm
```

If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org) (choose the LTS version). npm and npx are included automatically.

Alternatively, use a version manager:

```bash
# Using nvm (Linux/macOS)
nvm install --lts
nvm use --lts

# Using fnm (cross-platform, faster)
fnm install --lts
fnm use --lts
```

## Getting Started

```bash
# 1. Clone the repo
git clone <repo-url>
cd todo-app

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Script | Command | What it does |
|--------|---------|--------------|
| `dev` | `next dev` | Start local dev server at localhost:3000 |
| `build` | `next build` | Create a production build |
| `start` | `next start` | Serve the production build |
| `typecheck` | `tsc --noEmit` | TypeScript validation (strict mode) |
| `lint` | `next lint` | ESLint via Next.js |
| `test` | `jest` | Unit + integration tests |
| `test:watch` | `jest --watch` | Tests in watch mode |
| `test:e2e` | `playwright test` | End-to-end tests (auto-starts dev server) |
| `test:all` | runs all of the above | Full quality gate |

## Running Tests

```bash
# Unit and integration tests
npm test

# End-to-end tests (Playwright — installs browsers on first run)
npx playwright install chromium   # one-time setup
npm run test:e2e

# Everything at once
npm run test:all
```

## Tech Stack

- **[Next.js 14](https://nextjs.org)** — App Router, server components shell, client-side SPA
- **[React 18](https://react.dev)** — hooks-based state management (`useReducer`)
- **[TypeScript 5](https://www.typescriptlang.org)** — strict mode, no `any`
- **[Tailwind CSS 3](https://tailwindcss.com)** — utility-first styling
- **[Jest 29](https://jestjs.io)** + **[React Testing Library](https://testing-library.com)** — unit and integration tests
- **[Playwright](https://playwright.dev)** — end-to-end tests

## Project Structure

```
src/
├── app/              # Next.js App Router pages and layout
├── components/       # UI components (TodoApp, TodoInput, TodoList, …)
├── hooks/            # useTodos, useLocalStorage
├── lib/              # storage.ts — JSON serialisation and corruption recovery
└── types/            # TodoItem, TodoStatus, FilterOption

__tests__/
├── unit/             # Hook and utility unit tests
├── integration/      # Component integration tests (React Testing Library)
└── e2e/              # Browser end-to-end tests (Playwright)
```
