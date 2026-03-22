<!--
SYNC IMPACT REPORT
==================
Version change: [unversioned/template] → 1.0.0

Modified principles:
  - [PRINCIPLE_1_NAME] → I. Clean Code (new)
  - [PRINCIPLE_2_NAME] → II. Simple UX (new)
  - [PRINCIPLE_3_NAME] → III. Responsive Design (new)
  - [PRINCIPLE_4_NAME] → IV. Minimal Dependencies (new)
  - [PRINCIPLE_5_NAME] → V. Mandatory Testing (new)

Added sections:
  - Technology Stack (replaces [SECTION_2_NAME])
  - Quality Gates (replaces [SECTION_3_NAME])

Removed sections: none

Templates requiring updates:
  ✅ .specify/memory/constitution.md — written now
  ⚠ .specify/templates/tasks-template.md — Line 11 and Phase 3/4/5 test sections
    say "Tests are OPTIONAL". Constitution declares testing MANDATORY. Update
    wording to "Tests are MANDATORY per project constitution" and remove the
    "(OPTIONAL - only if tests requested)" guards from test task headers.

Follow-up TODOs: none — all placeholders resolved.
-->

# Todo App Constitution

## Core Principles

### I. Clean Code

Code MUST be readable, maintainable, and minimal in complexity.

- Every function or component MUST have a single, clearly named responsibility.
- Dead code, commented-out blocks, and unused imports MUST NOT be committed.
- Logic MUST be expressed at a consistent level of abstraction; mixed abstraction
  levels within a single function are prohibited.
- Naming MUST be explicit and self-documenting; abbreviations are only permitted
  when universally understood in the domain (e.g., `id`, `url`).
- **Rationale**: Long-term maintainability and onboarding speed depend on
  consistent, readable code. Complexity debt compounds quickly in UI projects.

### II. Simple UX

User interfaces MUST minimise cognitive load and prioritise clarity over
cleverness.

- Every interactive element MUST have an obvious purpose without needing
  documentation or tooltips for primary actions.
- Navigation paths MUST be reducible to the fewest steps that achieve the user
  goal.
- Error states MUST communicate what went wrong and how to recover; silent
  failures are prohibited.
- Visual hierarchy MUST guide the user's eye; decorative elements that compete
  with functional content MUST NOT be introduced.
- **Rationale**: A todo app's value is in frictionless task capture and
  completion. UI complexity directly undermines this.

### III. Responsive Design

Every view MUST be fully functional across all common viewport sizes: mobile
(≥ 320 px), tablet (≥ 768 px), and desktop (≥ 1280 px).

- Layout MUST be implemented with Tailwind responsive utilities (`sm:`, `md:`,
  `lg:` prefixes); raw media queries in component files are prohibited unless
  Tailwind cannot express the constraint.
- Touch targets MUST be at minimum 44 × 44 px on mobile viewports.
- No horizontal scrollbar MUST appear on any standard viewport unless the
  content is inherently scrollable (e.g., a code block).
- **Rationale**: Users access todo apps across devices throughout the day.
  A broken mobile layout degrades core value.

### IV. Minimal Dependencies

A package MUST only be added when it solves a problem that cannot be reasonably
solved with the existing stack (Next.js, React, Tailwind) or standard Web APIs.

- Every new dependency MUST be justified with: (a) the problem it solves,
  (b) why the existing stack is insufficient, and (c) the package's maintenance
  status checked at time of addition.
- Dependencies that duplicate functionality already present in the stack
  (e.g., a CSS-in-JS library when Tailwind is available) MUST NOT be added.
- `devDependencies` follow the same rule; convenience packages that save trivial
  effort are prohibited.
- **Rationale**: Each dependency is a surface for supply-chain risk, bundle size
  growth, and future upgrade burden. The chosen stack already covers most needs.

### V. Mandatory Testing (NON-NEGOTIABLE)

All features MUST be accompanied by unit tests, integration tests, and
end-to-end (E2E) tests before a story is considered complete. Testing is not
optional.

- **Unit tests** MUST cover all pure functions, hooks, and utility modules.
  Framework: Jest + React Testing Library.
- **Integration tests** MUST cover page-level interactions and API route
  behaviour including error paths. Framework: Jest + React Testing Library
  (with `next/server` test helpers or MSW for API mocking).
- **End-to-end tests** MUST cover every critical user journey at the acceptance
  scenario level. Framework: Playwright.
- Tests MUST be written before or alongside implementation (test-first preferred;
  test-alongside acceptable when design is genuinely exploratory).
- A failing test suite MUST block merge; no `--passWithNoTests` or skip flags
  are permitted without explicit documented justification.
- **Rationale**: A todo app's correctness is directly visible to users. Regressions
  in CRUD operations or state management are immediately damaging to trust.

## Technology Stack

The canonical stack for this project is fixed. Deviations require a constitution
amendment.

- **Framework**: Next.js (App Router)
- **UI Library**: React
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict mode MUST be enabled; `any` is prohibited
  except at verified external-data boundaries)
- **Test Tooling**: Jest, React Testing Library, Playwright
- **Package Manager**: as initialised in the repository (do not switch without
  team agreement)

No additional UI component library, state management library, or CSS framework
MUST be introduced without a documented justification per Principle IV.

## Quality Gates

The following gates MUST pass before any pull request is merged.

1. **Tests green**: all unit, integration, and E2E tests pass with no skips.
2. **TypeScript clean**: `tsc --noEmit` reports zero errors.
3. **Lint clean**: ESLint reports zero errors (warnings are reviewed, not
   blocking, but MUST be addressed within the same sprint).
4. **Responsive check**: new UI components are verified at mobile, tablet, and
   desktop breakpoints (manual or Playwright screenshot test).
5. **Constitution check**: the PR description MUST include a brief note on how
   the change complies with each applicable principle, or explicitly states
   which principles are not relevant and why.

## Governance

This constitution supersedes all verbal conventions and informal agreements.
Amendments follow this procedure:

1. Open a PR with the proposed change to `.specify/memory/constitution.md`.
2. Increment the version per semantic versioning:
   - **MAJOR**: removal or incompatible redefinition of a principle.
   - **MINOR**: new principle or materially expanded guidance.
   - **PATCH**: clarifications, wording, or non-semantic refinements.
3. The PR description MUST include an updated Sync Impact Report (the HTML
   comment at the top of this file).
4. All affected template files MUST be updated in the same PR.
5. Merging the amendment PR constitutes ratification.

All code reviews MUST verify compliance with applicable principles. Complexity
that violates a principle MUST be justified in a Complexity Tracking table in
the relevant `plan.md`.

**Version**: 1.0.0 | **Ratified**: 2026-03-22 | **Last Amended**: 2026-03-22
