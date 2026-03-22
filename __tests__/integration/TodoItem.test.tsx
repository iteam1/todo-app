import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem as TodoItemComponent } from '@/components/TodoItem';
import type { TodoItem } from '@/types/todo';

const activeTodo: TodoItem = {
  id: '1',
  text: 'Buy milk',
  status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  completedAt: null,
};

const completedTodo: TodoItem = {
  ...activeTodo,
  status: 'completed',
  completedAt: '2026-01-01T01:00:00.000Z',
};

describe('TodoItem — toggle', () => {
  it('checkbox is unchecked for active todo', () => {
    render(<TodoItemComponent todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('checkbox is checked for completed todo', () => {
    render(<TodoItemComponent todo={completedTodo} onToggle={jest.fn()} onDelete={jest.fn()} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('clicking checkbox calls onToggle with todo.id', async () => {
    const onToggle = jest.fn();
    render(<TodoItemComponent todo={activeTodo} onToggle={onToggle} onDelete={jest.fn()} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('completed item has line-through class', () => {
    render(<TodoItemComponent todo={completedTodo} onToggle={jest.fn()} onDelete={jest.fn()} />);
    const text = screen.getByText('Buy milk');
    expect(text.className).toMatch(/line-through/);
  });

  it('active item does not have line-through class', () => {
    render(<TodoItemComponent todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} />);
    const text = screen.getByText('Buy milk');
    expect(text.className).not.toMatch(/line-through/);
  });

  it('aria-label reflects current completion state for active', () => {
    render(<TodoItemComponent todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByRole('checkbox', { name: /mark.*buy milk.*complete/i })).toBeInTheDocument();
  });

  it('aria-label reflects current completion state for completed', () => {
    render(<TodoItemComponent todo={completedTodo} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByRole('checkbox', { name: /mark.*buy milk.*incomplete/i })).toBeInTheDocument();
  });
});

describe('TodoItem — delete', () => {
  it('renders a delete button', () => {
    render(<TodoItemComponent todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByRole('button', { name: /delete.*buy milk/i })).toBeInTheDocument();
  });

  it('clicking delete shows confirmation dialog', async () => {
    render(<TodoItemComponent todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /delete.*buy milk/i }));
    // Dialog appears with task text and confirm/cancel buttons
    expect(screen.getAllByText(/buy milk/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('confirming delete calls onDelete with todo.id', async () => {
    const onDelete = jest.fn();
    render(<TodoItemComponent todo={activeTodo} onToggle={jest.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: /delete.*buy milk/i }));
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('cancelling delete hides dialog', async () => {
    render(<TodoItemComponent todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /delete.*buy milk/i }));
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument();
  });
});
