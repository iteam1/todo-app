import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoInput } from '@/components/TodoInput';

describe('TodoInput', () => {
  it('renders a labelled input and submit button', () => {
    render(<TodoInput onSubmit={jest.fn()} />);
    expect(screen.getByRole('textbox', { name: /new task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('pressing Enter calls onSubmit with trimmed text', async () => {
    const onSubmit = jest.fn();
    render(<TodoInput onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox', { name: /new task/i });
    await userEvent.type(input, '  Buy milk  ');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('Buy milk');
  });

  it('clicking submit button calls onSubmit', async () => {
    const onSubmit = jest.fn();
    render(<TodoInput onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox', { name: /new task/i });
    await userEvent.type(input, 'Task text');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onSubmit).toHaveBeenCalledWith('Task text');
  });

  it('whitespace-only input does not call onSubmit and keeps focus on input', async () => {
    const onSubmit = jest.fn();
    render(<TodoInput onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox', { name: /new task/i });
    await userEvent.type(input, '   ');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(input).toHaveFocus();
  });

  it('input clears after successful submit', async () => {
    const onSubmit = jest.fn();
    render(<TodoInput onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox', { name: /new task/i });
    await userEvent.type(input, 'Task');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(input).toHaveValue('');
  });

  it('is keyboard-only operable', async () => {
    const onSubmit = jest.fn();
    render(<TodoInput onSubmit={onSubmit} />);
    const input = screen.getByRole('textbox', { name: /new task/i });
    input.focus();
    await userEvent.keyboard('My task{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('My task');
  });
});
