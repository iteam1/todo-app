## Task Workflow (MANDATORY)

When working through tasks from a `tasks.md` file:

1. **Before starting**: Load all tasks from `tasks.md` into your todo list so progress is visible.
2. **One task at a time**: Complete one task fully before moving to the next.
3. **After each task**: Stop and wait for user review. Do NOT auto-proceed to the next task.
4. **User confirms OK**: Commit the changes with message format `task(T###): <task description>`, then move to the next task.
5. **User gives feedback**: Apply the feedback, stop again for re-review. Repeat until user confirms OK.

This loop ensures every task is reviewed and committed independently before proceeding.

---

## Testing Rules (NON-NEGOTIABLE)

- Tests MUST be written before or alongside implementation (test-first preferred)
- Unit tests → integration tests → E2E tests — all three layers required per feature
- A failing test suite blocks proceeding to the next task
- Never skip or weaken tests without explicit user approval

---

## Constitution Reference

Full project principles (Clean Code, Simple UX, Responsive Design, Minimal Dependencies, Mandatory Testing) are defined in `.specify/memory/constitution.md`. All work must comply.
