import { parseTodos, serializeTodos } from '@/lib/storage';
import type { TodoItem } from '@/types/todo';

const validTodo: TodoItem = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  text: 'Buy milk',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  completedAt: null,
};

describe('parseTodos', () => {
  it('returns parsed todos for valid JSON array', () => {
    const raw = JSON.stringify([validTodo]);
    const result = parseTodos(raw);
    expect(result.todos).toHaveLength(1);
    expect(result.todos[0]).toEqual(validTodo);
    expect(result.corrupted).toBe(false);
  });

  it('returns empty array for null input', () => {
    const result = parseTodos(null);
    expect(result.todos).toEqual([]);
    expect(result.corrupted).toBe(false);
  });

  it('returns corrupted=true for invalid JSON', () => {
    const result = parseTodos('this is not json {{{');
    expect(result.todos).toEqual([]);
    expect(result.corrupted).toBe(true);
  });

  it('returns corrupted=true for non-array JSON', () => {
    const result = parseTodos('{"key":"value"}');
    expect(result.todos).toEqual([]);
    expect(result.corrupted).toBe(true);
  });

  it('returns corrupted=true when item is missing required field', () => {
    const broken = [{ id: '123', text: 'Test', status: 'active', createdAt: '2026-01-01T00:00:00.000Z' }]; // missing completedAt
    const result = parseTodos(JSON.stringify(broken));
    expect(result.todos).toEqual([]);
    expect(result.corrupted).toBe(true);
  });

  it('returns corrupted=true when item has invalid status', () => {
    const broken = [{ ...validTodo, status: 'pending' }];
    const result = parseTodos(JSON.stringify(broken));
    expect(result.todos).toEqual([]);
    expect(result.corrupted).toBe(true);
  });

  it('returns corrupted=true when item has empty id', () => {
    const broken = [{ ...validTodo, id: '' }];
    const result = parseTodos(JSON.stringify(broken));
    expect(result.todos).toEqual([]);
    expect(result.corrupted).toBe(true);
  });
});

describe('serializeTodos', () => {
  it('round-trips a todos array', () => {
    const todos = [validTodo];
    const serialized = serializeTodos(todos);
    const result = parseTodos(serialized);
    expect(result.todos).toEqual(todos);
    expect(result.corrupted).toBe(false);
  });

  it('serializes an empty array', () => {
    expect(serializeTodos([])).toBe('[]');
  });
});
