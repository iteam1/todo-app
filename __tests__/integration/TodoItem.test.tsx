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

describe('TodoItem — edit (US1: activate and save)', () => {
  const editProps = {
    isEditing: false,
    onEditStart: jest.fn(),
    onEditSave: jest.fn(),
    onEditCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Edit button is visible in display mode', () => {
    render(
      <TodoItemComponent todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} {...editProps} />,
    );
    expect(screen.getByRole('button', { name: /edit task/i })).toBeInTheDocument();
  });

  it('clicking Edit calls onEditStart with todo.id', async () => {
    render(
      <TodoItemComponent todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} {...editProps} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /edit task/i }));
    expect(editProps.onEditStart).toHaveBeenCalledWith('1');
  });

  it('shows input pre-filled with current text when isEditing is true', () => {
    render(
      <TodoItemComponent
        todo={activeTodo}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
        {...editProps}
        isEditing={true}
      />,
    );
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe('Buy milk');
  });

  it('pressing Enter calls onEditSave with id and new text', async () => {
    render(
      <TodoItemComponent
        todo={activeTodo}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
        {...editProps}
        isEditing={true}
      />,
    );
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'New text');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(editProps.onEditSave).toHaveBeenCalledWith('1', 'New text');
  });

  it('blurring the input calls onEditSave', async () => {
    render(
      <TodoItemComponent
        todo={activeTodo}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
        {...editProps}
        isEditing={true}
      />,
    );
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Blurred text');
    fireEvent.blur(input);
    expect(editProps.onEditSave).toHaveBeenCalledWith('1', 'Blurred text');
  });

  it('only one item in edit mode at a time — second Edit click fires onEditStart again', async () => {
    const { rerender } = render(
      <TodoItemComponent todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} {...editProps} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /edit task/i }));
    expect(editProps.onEditStart).toHaveBeenCalledTimes(1);
    // Simulate parent switching edit to another item — this item goes back to display mode
    rerender(
      <TodoItemComponent todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} {...editProps} isEditing={false} />,
    );
    expect(screen.getByRole('button', { name: /edit task/i })).toBeInTheDocument();
  });
});

describe('TodoItem — edit (US2: Escape cancellation)', () => {
  const editProps = {
    isEditing: true,
    onEditStart: jest.fn(),
    onEditSave: jest.fn(),
    onEditCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('pressing Escape with modified text calls onEditCancel, not onEditSave', async () => {
    render(
      <TodoItemComponent todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} {...editProps} />,
    );
    const input = screen.getByRole('textbox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Modified text');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(editProps.onEditCancel).toHaveBeenCalledTimes(1);
    expect(editProps.onEditSave).not.toHaveBeenCalled();
  });

  it('pressing Escape without changes calls onEditCancel, not onEditSave', () => {
    render(
      <TodoItemComponent todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} {...editProps} />,
    );
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(editProps.onEditCancel).toHaveBeenCalledTimes(1);
    expect(editProps.onEditSave).not.toHaveBeenCalled();
  });

  it('editTodo is NOT called when Escape is pressed', async () => {
    const onEditSave = jest.fn();
    render(
      <TodoItemComponent
        todo={activeTodo}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
        {...editProps}
        onEditSave={onEditSave}
      />,
    );
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Changed');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onEditSave).not.toHaveBeenCalled();
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
