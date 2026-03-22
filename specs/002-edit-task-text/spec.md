# Feature Specification: Edit Task Text

**Feature Branch**: `002-edit-task-text`
**Created**: 2026-03-22
**Status**: Draft
**Input**: User description: "Edit Task Text — Inline edit for existing todo items. As a user, I want to edit a task's text to fix mistakes without deleting it. Click edit → inline input pre-filled with current text. Enter or blur → save; Escape → cancel and restore original. Blank saves → rejected, restore original. Persist to localStorage."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Task Text Inline (Priority: P1)

A user with an existing task notices a typo or wants to update the wording. They activate editing on that task — an inline text input appears, pre-filled with the current task text. They make their changes and confirm, and the updated text is immediately shown and remembered across sessions.

**Why this priority**: This is the core capability of the feature. Without the ability to enter, confirm, and persist an edit, nothing else in this feature has value.

**Independent Test**: Can be fully tested by creating a task, clicking edit, changing the text, confirming (Enter or clicking away), and verifying the new text persists after page reload.

**Acceptance Scenarios**:

1. **Given** a task exists in the list, **When** the user activates edit mode on that task, **Then** an inline text input appears pre-filled with the task's current text.
2. **Given** the user is in edit mode with modified text, **When** the user presses Enter, **Then** the task is updated with the new text and the input is dismissed.
3. **Given** the user is in edit mode with modified text, **When** the user moves focus away from the input (blur), **Then** the task is saved with the new text.
4. **Given** a task has been successfully edited, **When** the user reloads the page, **Then** the updated task text is still shown.

---

### User Story 2 - Cancel Edit (Priority: P2)

A user accidentally activates edit mode or decides not to make a change. They press Escape, and the task reverts to its original text without any modification.

**Why this priority**: The ability to cancel an unintended or unwanted edit is essential for a non-destructive editing experience. Without it, users risk accidentally changing tasks.

**Independent Test**: Can be fully tested by entering edit mode on a task, modifying the text, pressing Escape, and confirming the task still shows the original text.

**Acceptance Scenarios**:

1. **Given** the user is in edit mode with modified text, **When** the user presses Escape, **Then** the input is dismissed and the task text reverts to its original value.
2. **Given** the user is in edit mode without making any changes, **When** the user presses Escape, **Then** the task remains unchanged and the input is dismissed.

---

### User Story 3 - Reject Blank Save (Priority: P3)

A user clears all text in the edit input and tries to save. The system rejects the blank value and restores the original task text instead of saving an empty task.

**Why this priority**: Blank tasks are meaningless and should never be allowed. This guardrail protects data integrity but is a narrower edge case compared to the main save/cancel flows.

**Independent Test**: Can be fully tested by entering edit mode, clearing all text, pressing Enter (or blurring), and confirming the task reverts to the original text.

**Acceptance Scenarios**:

1. **Given** the user is in edit mode and has cleared all text, **When** the user presses Enter, **Then** the blank input is rejected and the task text is restored to its original value.
2. **Given** the user is in edit mode and has cleared all text, **When** the user moves focus away (blur), **Then** the blank input is rejected and the task text is restored to its original value.
3. **Given** a blank save was rejected, **When** the page is reloaded, **Then** the task still shows its original text.

---

### Edge Cases

- What happens when the user edits a task to the same text it already had? Save succeeds silently — no change, no error.
- What happens when two tasks are both in edit mode simultaneously? Only one task may be in edit mode at a time; activating edit on a second task saves (or cancels) any open edit first.
- What happens if the user's input contains only whitespace? Treated as blank — rejected and original text restored.
- How does the system handle a very long edited text? The input should accept the text; display truncation (if any) is a visual concern, not a data concern.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to activate edit mode on any existing task to modify its text.
- **FR-002**: When edit mode is activated, the system MUST display an inline text input pre-filled with the task's current text.
- **FR-003**: The system MUST save the edited text when the user confirms (presses Enter or moves focus away from the input).
- **FR-004**: The system MUST cancel the edit and restore the original text when the user presses Escape.
- **FR-005**: The system MUST reject a save attempt when the edited text is blank or contains only whitespace, and MUST restore the original text.
- **FR-006**: The system MUST persist the updated task text so it survives page reloads.
- **FR-007**: Only one task MAY be in edit mode at any given time.

### Key Entities

- **Task**: Represents a single to-do item. Key attribute: `text` (the editable content). A task has a persistent identity that allows its text to be updated without deletion.
- **Edit Session**: A transient state associated with a task that holds the in-progress edited text. Begins when edit mode is activated and ends on save, cancel, or blank rejection.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a task text edit (activate, change, confirm) in under 10 seconds.
- **SC-002**: 100% of confirmed edits (non-blank) are reflected immediately in the task list and persist across page reloads.
- **SC-003**: 100% of Escape key presses during edit mode restore the original task text without modification.
- **SC-004**: 100% of blank or whitespace-only save attempts are rejected; no empty task text is ever persisted.
- **SC-005**: Users successfully edit a task on their first attempt without encountering confusing or unexpected behavior.

## Assumptions

- Tasks already exist in the list (task creation is handled by a separate feature).
- The storage mechanism (localStorage) is already in use by the app for task persistence; this feature extends that persistence to include edits.
- "Activate edit mode" means a click on an edit affordance (e.g., a button or double-click on the task text); the exact trigger is a UI decision left to planning.
- Tasks are not collaboratively edited in real time; a single-user, single-session model is assumed.
- Only the task text is editable via this feature; other task properties (e.g., completion status) are out of scope.
