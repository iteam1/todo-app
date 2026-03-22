import type { TodoItem } from '@/types/todo';

export interface ParseResult {
  todos: TodoItem[];
  corrupted: boolean;
}

function isValidTodoItem(item: unknown): item is TodoItem {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj['id'] === 'string' && obj['id'] !== '' &&
    typeof obj['text'] === 'string' && obj['text'] !== '' &&
    (obj['status'] === 'active' || obj['status'] === 'completed') &&
    typeof obj['createdAt'] === 'string' && obj['createdAt'] !== '' &&
    (typeof obj['completedAt'] === 'string' || obj['completedAt'] === null)
  );
}

export function parseTodos(raw: string | null): ParseResult {
  if (raw === null) {
    return { todos: [], corrupted: false };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { todos: [], corrupted: true };
    }
    for (const item of parsed) {
      if (!isValidTodoItem(item)) {
        return { todos: [], corrupted: true };
      }
    }
    return { todos: parsed as TodoItem[], corrupted: false };
  } catch {
    return { todos: [], corrupted: true };
  }
}

export function serializeTodos(todos: TodoItem[]): string {
  return JSON.stringify(todos);
}
