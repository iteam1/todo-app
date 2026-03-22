import { renderHook, act } from '@testing-library/react';
import { useTodos } from '@/hooks/useTodos';

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('useTodos — ADD_TODO', () => {
  it('creates a todo with correct fields', () => {
    const { result } = renderHook(() => useTodos());
    act(() => {
      result.current.addTodo('Buy milk');
    });
    expect(result.current.todos).toHaveLength(1);
    const todo = result.current.todos[0]!;
    expect(todo.text).toBe('Buy milk');
    expect(todo.status).toBe('active');
    expect(todo.completedAt).toBeNull();
    expect(typeof todo.id).toBe('string');
    expect(todo.id).not.toBe('');
    expect(typeof todo.createdAt).toBe('string');
  });

  it('prepends new item to the list', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('First'); });
    act(() => { result.current.addTodo('Second'); });
    expect(result.current.todos[0]!.text).toBe('Second');
    expect(result.current.todos[1]!.text).toBe('First');
  });

  it('rejects whitespace-only text', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('   '); });
    expect(result.current.todos).toHaveLength(0);
  });

  it('sorts todos newest-first in filteredTodos', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('First'); });
    act(() => { result.current.addTodo('Second'); });
    expect(result.current.filteredTodos[0]!.text).toBe('Second');
  });
});

describe('useTodos — TOGGLE_TODO', () => {
  it('active item becomes completed with completedAt set', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task'); });
    const id = result.current.todos[0]!.id;
    act(() => { result.current.toggleTodo(id); });
    const todo = result.current.todos[0]!;
    expect(todo.status).toBe('completed');
    expect(todo.completedAt).not.toBeNull();
  });

  it('completed item reverts to active with completedAt null', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task'); });
    const id = result.current.todos[0]!.id;
    act(() => { result.current.toggleTodo(id); });
    act(() => { result.current.toggleTodo(id); });
    const todo = result.current.todos[0]!;
    expect(todo.status).toBe('active');
    expect(todo.completedAt).toBeNull();
  });

  it('toggling unknown id is a no-op', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task'); });
    const before = result.current.todos[0]!.status;
    act(() => { result.current.toggleTodo('nonexistent-id'); });
    expect(result.current.todos[0]!.status).toBe(before);
  });

  it('state is persisted to localStorage after toggle', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task'); });
    const id = result.current.todos[0]!.id;
    act(() => { result.current.toggleTodo(id); });
    const stored = JSON.parse(localStorage.getItem('todos') ?? '[]') as unknown[];
    expect(stored).toHaveLength(1);
    expect((stored[0] as { status: string }).status).toBe('completed');
  });
});

describe('useTodos — SET_FILTER and filteredTodos', () => {
  it('"all" returns all items', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Active'); });
    act(() => {
      result.current.addTodo('ToComplete');
      result.current.toggleTodo(result.current.todos[0]!.id);
    });
    act(() => { result.current.setFilter('all'); });
    expect(result.current.filteredTodos).toHaveLength(2);
  });

  it('"active" returns only active items', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task1'); });
    act(() => { result.current.addTodo('Task2'); });
    const id = result.current.todos[1]!.id;
    act(() => { result.current.toggleTodo(id); });
    act(() => { result.current.setFilter('active'); });
    expect(result.current.filteredTodos.every((t) => t.status === 'active')).toBe(true);
  });

  it('"completed" returns only completed items', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task1'); });
    act(() => { result.current.addTodo('Task2'); });
    const id = result.current.todos[0]!.id;
    act(() => { result.current.toggleTodo(id); });
    act(() => { result.current.setFilter('completed'); });
    expect(result.current.filteredTodos.every((t) => t.status === 'completed')).toBe(true);
  });

  it('toggling while "active" filter is set removes item from filteredTodos', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task'); });
    act(() => { result.current.setFilter('active'); });
    const id = result.current.filteredTodos[0]!.id;
    act(() => { result.current.toggleTodo(id); });
    expect(result.current.filteredTodos).toHaveLength(0);
  });
});

describe('useTodos — EDIT_TODO', () => {
  it('editTodo is present on hook return value', () => {
    const { result } = renderHook(() => useTodos());
    expect(typeof result.current.editTodo).toBe('function');
  });

  it('updates matching todo text', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Original text'); });
    const id = result.current.todos[0]!.id;
    act(() => { result.current.editTodo(id, 'Updated text'); });
    expect(result.current.todos[0]!.text).toBe('Updated text');
  });

  it('leaves all other fields unchanged (status/createdAt/completedAt)', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task'); });
    const before = result.current.todos[0]!;
    act(() => { result.current.editTodo(before.id, 'New text'); });
    const after = result.current.todos[0]!;
    expect(after.status).toBe(before.status);
    expect(after.createdAt).toBe(before.createdAt);
    expect(after.completedAt).toBe(before.completedAt);
  });

  it('is a no-op when id not found', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task'); });
    const before = result.current.todos[0]!.text;
    act(() => { result.current.editTodo('nonexistent-id', 'New text'); });
    expect(result.current.todos[0]!.text).toBe(before);
  });

  it('persists updated text to localStorage', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task'); });
    const id = result.current.todos[0]!.id;
    act(() => { result.current.editTodo(id, 'Persisted text'); });
    const stored = JSON.parse(localStorage.getItem('todos') ?? '[]') as unknown[];
    expect((stored[0] as { text: string }).text).toBe('Persisted text');
  });
});

describe('useTodos — DELETE_TODO', () => {
  it('removes item with matching id', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task'); });
    const id = result.current.todos[0]!.id;
    act(() => { result.current.deleteTodo(id); });
    expect(result.current.todos).toHaveLength(0);
  });

  it('deleting unknown id is a no-op', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task'); });
    act(() => { result.current.deleteTodo('nonexistent'); });
    expect(result.current.todos).toHaveLength(1);
  });

  it('remaining items are unchanged', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task1'); });
    act(() => { result.current.addTodo('Task2'); });
    const id = result.current.todos[0]!.id;
    act(() => { result.current.deleteTodo(id); });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0]!.text).toBe('Task1');
  });

  it('localStorage is updated after deletion', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('Task'); });
    const id = result.current.todos[0]!.id;
    act(() => { result.current.deleteTodo(id); });
    const stored = JSON.parse(localStorage.getItem('todos') ?? '[]') as unknown[];
    expect(stored).toHaveLength(0);
  });
});
