# Data Model: Todo App — Core Features

**Branch**: `001-todo-core-features` | **Date**: 2026-03-22

## Entities

### TodoItem

The single domain entity. Represents one task in the user's list.

| Field            | Type                      | Required | Constraints                                      |
|------------------|---------------------------|----------|--------------------------------------------------|
| `id`             | `string` (UUID v4)        | Yes      | Unique; generated at creation; never mutated     |
| `text`           | `string`                  | Yes      | 1–500 characters; whitespace-only is rejected    |
| `status`         | `TodoStatus` (enum)       | Yes      | `"active"` or `"completed"`                      |
| `createdAt`      | `string` (ISO 8601)       | Yes      | Set at creation; never mutated                   |
| `completedAt`    | `string \| null` (ISO 8601) | Yes    | `null` when status is `"active"`; set when status becomes `"completed"`; reset to `null` when toggled back |

### Enums

```typescript
// src/types/todo.ts

export type TodoStatus = 'active' | 'completed';

export type FilterOption = 'all' | 'active' | 'completed';

export interface TodoItem {
  id: string;
  text: string;
  status: TodoStatus;
  createdAt: string;   // ISO 8601
  completedAt: string | null;
}
```

---

## State Transitions

```
                    toggleComplete
  ┌─────────┐ ──────────────────────► ┌─────────────┐
  │ active  │                          │  completed  │
  └─────────┘ ◄────────────────────── └─────────────┘
                    toggleComplete

  Creation  → always lands in "active"
  Deletion  → removes from collection entirely (no soft-delete)
```

| Action           | From       | To          | Side Effects                                        |
|------------------|------------|-------------|-----------------------------------------------------|
| `createTodo`     | —          | `active`    | New TodoItem inserted at head of array; `completedAt = null` |
| `toggleComplete` | `active`   | `completed` | `completedAt` set to current ISO timestamp          |
| `toggleComplete` | `completed`| `active`    | `completedAt` reset to `null`                       |
| `deleteTodo`     | any        | (removed)   | Item removed from array; focus moved to adjacent item |

---

## Persistence Schema

### localStorage Key

```
Key:   "todos"
Value: JSON-serialised `TodoItem[]`
```

### Serialisation Rules

- The entire `TodoItem[]` array is written as a single JSON string on every state change.
- An empty list is stored as `"[]"` (not absent).
- The storage key `"todos"` is the only key written by this application.

### Shape Validation on Read

The `storage.ts` module validates the parsed value against these rules before returning it:

1. `JSON.parse` succeeds (no syntax error).
2. Result is an `Array`.
3. Each element has: `id` (non-empty string), `text` (non-empty string), `status` (`"active"` |
   `"completed"`), `createdAt` (non-empty string), `completedAt` (string or null).
4. If any rule fails → clear key, return `[]`, emit corruption notification.

### Estimated Storage Budget

| Scenario         | Approx. size                           |
|------------------|----------------------------------------|
| 100 tasks × 500 chars | ~60 KB JSON — well within 5 MB localStorage quota |
| 100 tasks × 50 chars  | ~10 KB — typical real-world usage     |

---

## Filter Logic

Filtering is pure, computed at render time from the in-memory array. No separate filtered array is
persisted.

| FilterOption | Predicate                             |
|--------------|---------------------------------------|
| `"all"`      | `() => true` (no filter)             |
| `"active"`   | `item => item.status === "active"`    |
| `"completed"`| `item => item.status === "completed"` |

Display order: creation date descending (newest first) — applied before the filter predicate.
