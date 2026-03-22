# Research: Todo App — Core Features

**Branch**: `001-todo-core-features` | **Date**: 2026-03-22

## 1. State Management

**Decision**: `useState` + `useReducer` (built-in React hooks only)

**Rationale**: For a single-component-tree app with a maximum of 100 items, built-in hooks are
sufficient. `useReducer` handles the todo collection (add, toggle, delete) with a clean action
dispatch pattern; `useState` covers transient UI state (current input value, active filter). Zero
extra dependencies, full TypeScript strict support, smallest possible bundle.

**Alternatives considered**:
- Context API + useReducer: Adds a Provider wrapper; worthwhile only when state must cross distant
  component boundaries — not needed here since `TodoApp` is the single state owner.
- Zustand: Excellent for larger apps; overkill for a self-contained single-user SPA.
- Redux Toolkit: Team/scale use case; adds tooling overhead not justified here.

---

## 2. localStorage Persistence & Cross-Tab Sync

**Decision**: Custom `useLocalStorage` hook built on React 18's `useSyncExternalStore`

**Rationale**: `useSyncExternalStore` is the official React 18 API for integrating external stores.
It handles cross-tab sync automatically via the `storage` event in the `subscribe` callback, prevents
hydration mismatches via `getServerSnapshot`, and integrates with React's concurrent rendering.
Storage events fire when another tab writes; same-tab writes trigger re-render directly through
React's state update path.

```
subscribe: window.addEventListener('storage', cb) / removeEventListener on cleanup
getSnapshot: () => parse(localStorage.getItem(TODOS_KEY))
getServerSnapshot: () => []   // SSR-safe empty default
```

**Alternatives considered**:
- Plain `useEffect` + `useState`: Simpler but requires manual cross-tab event wiring and does not
  integrate with concurrent React features.
- IndexedDB: More capable but significantly more complex API for a 100-item personal app with no
  binary data or relational queries.

---

## 3. Corruption Detection & Recovery

**Decision**: `try-catch` around `JSON.parse` + shape validation + silent reset to `[]`

**Rationale**: localStorage can contain malformed JSON from a previous crash, partial write, or
browser bug. The recovery strategy is:

1. Wrap `JSON.parse` in `try-catch` — catches syntax errors.
2. Validate the parsed value is an `Array` — catches type drift.
3. Optionally validate each item has required fields (`id`, `text`, `status`, `createdAt`).
4. On any failure: `localStorage.removeItem(key)`, log the error, return `[]`.
5. Surface a one-time user notification (toast/banner) so the user is aware data was reset.

This satisfies SC-007 without requiring a checksum library (Principle IV: minimal dependencies).

**Alternatives considered**:
- CRC32 / Web Crypto checksums: Stronger integrity guarantee; adds complexity not warranted for
  human-entered plain text.
- `jsonrepair` npm package: Useful for recovering partially-written data; not justified here since
  localStorage writes are atomic at the browser level.

---

## 4. Testing localStorage in Jest

**Decision**: `jest-localstorage-mock` (devDependency) + `jest.spyOn(Storage.prototype)` for
interaction assertions

**Rationale**: `jest-localstorage-mock` replaces `localStorage` globally in the test environment,
eliminating "localStorage is not defined" errors with zero configuration. `jest.spyOn` is used in
tests that need to assert *how* the code called localStorage (e.g., verifying the correct key and
serialised value). The combination covers both "does the hook read/write" and "does it call the
right API" test cases.

**Justification for devDependency** (Principle IV gate): Jest's jsdom environment does not provide
a working `localStorage` implementation by default. This package solves that specific gap; no
equivalent is available in the existing stack.

**Alternatives considered**:
- Manual `__mocks__/localStorage.js`: Full control but boilerplate overhead; `jest-localstorage-mock`
  covers all needed cases without custom code.
- No mock (integration tests only): Slower feedback loop; unit tests for `useLocalStorage` hook need
  isolation from a real browser.

---

## 5. Next.js App Router — "use client" Boundary

**Decision**: Place `'use client'` in a `client-root.tsx` wrapper component, one level below
`layout.tsx`

**Rationale**: The App Router's `layout.tsx` is a Server Component by default. For a fully
client-side SPA we could mark the entire layout `'use client'`, but the cleaner approach is a thin
`ClientRoot` wrapper that establishes the client boundary while keeping the HTML shell (`<html>`,
`<body>`, metadata) in a Server Component — which benefits from Next.js's static optimisation for
the shell. All interactive components (`TodoApp`, `TodoInput`, etc.) inherit the client boundary
from `ClientRoot` without needing their own `'use client'` directives.

**Alternatives considered**:
- Mark every interactive leaf component individually: Verbose; the entire feature is client-side, so
  a single root boundary is simpler and equivalent.
- Mark `layout.tsx` directly: Works but forfeits static shell optimisation.

---

## 6. Playwright Configuration for Next.js

**Decision**: `webServer` with `url` and `reuseExistingServer: !process.env.CI`

**Rationale**: Playwright's `webServer` block auto-starts the Next.js dev server before tests and
shuts it down after. `reuseExistingServer: !process.env.CI` lets developers reuse a running
`npm run dev` instance locally (fast iteration) while forcing a clean server in CI (reproducibility).
`baseURL` in the `use` block enables relative path navigation in tests.

```typescript
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
},
use: { baseURL: 'http://localhost:3000' },
```

**Alternatives considered**:
- Manual server start before test run: Error-prone in CI; `webServer` is the officially recommended
  pattern.
- `port` instead of `url`: Less reliable — `url` polls for actual server readiness.

---

## 7. Keyboard Accessibility for Todo Lists

**Decision**: Semantic HTML (`<ul>`, `<li>`, `<input type="checkbox">`) + explicit focus management
after deletion

**Rationale**: Native HTML semantics provide keyboard interaction (Space/Enter on checkbox), screen
reader announcements, and visible focus indicators with zero additional JavaScript or ARIA. ARIA
roles are reserved for cases where native semantics are impossible. After a task is deleted, focus
MUST be moved programmatically to the next task in the list (or the previous if the deleted item was
last) so keyboard users are not dropped to the top of the page. This satisfies FR-016 (basic keyboard
accessibility) and aligns with W3C ARIA Authoring Practices.

**Implementation note**: `aria-label` on each checkbox MUST include the task text so screen readers
announce which task is being toggled (e.g., `aria-label="Mark 'Buy milk' as complete"`).

**Alternatives considered**:
- `role="checkbox"` on a custom `<div>`: Requires manual Space/Enter handling, `aria-checked`,
  `tabindex`; no benefit over a native checkbox here.
- No focus management after delete: Keyboard users lose position in the list; violates the spirit
  of FR-016.
