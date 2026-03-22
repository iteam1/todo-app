# Edit Task Text

Inline edit for existing todo items.

**User Story (P1)**: As a user, I want to edit a task's text to fix mistakes without deleting it.

**Requirements**:
- Click edit → inline input pre-filled with current text
- Enter or blur → save; Escape → cancel and restore original
- Blank saves → rejected, restore original
- Persist to localStorage
