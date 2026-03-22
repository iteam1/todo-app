import { render, screen } from '@testing-library/react';
import { TodoList } from '@/components/TodoList';
import type { TodoItem } from '@/types/todo';

const mockTodo: TodoItem = {
  id: '1',
  text: 'Buy milk',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  completedAt: null,
};

describe('TodoList', () => {
  it('renders a <ul> with one TodoItem per task', () => {
    render(
      <TodoList
        todos={[mockTodo]}
        activeFilter="all"
        onToggle={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });

  it('renders multiple items', () => {
    const todos: TodoItem[] = [
      mockTodo,
      { ...mockTodo, id: '2', text: 'Walk the dog' },
    ];
    render(<TodoList todos={todos} activeFilter="all" onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders empty-state message when todos is empty and filter is "all"', () => {
    render(<TodoList todos={[]} activeFilter="all" onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('No tasks yet. Add one above.')).toBeInTheDocument();
  });

  it('renders "No active tasks." when filter is "active" and todos is empty', () => {
    render(<TodoList todos={[]} activeFilter="active" onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('No active tasks.')).toBeInTheDocument();
  });

  it('renders "No completed tasks." when filter is "completed" and todos is empty', () => {
    render(
      <TodoList todos={[]} activeFilter="completed" onToggle={jest.fn()} onDelete={jest.fn()} />,
    );
    expect(screen.getByText('No completed tasks.')).toBeInTheDocument();
  });
});
