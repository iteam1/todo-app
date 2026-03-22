import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
  it('renders the task text', () => {
    render(
      <DeleteConfirmDialog todoText="Buy milk" onConfirm={jest.fn()} onCancel={jest.fn()} />,
    );
    expect(screen.getByText(/buy milk/i)).toBeInTheDocument();
  });

  it('clicking Delete calls onConfirm', async () => {
    const onConfirm = jest.fn();
    render(
      <DeleteConfirmDialog todoText="Buy milk" onConfirm={onConfirm} onCancel={jest.fn()} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('clicking Cancel calls onCancel', async () => {
    const onCancel = jest.fn();
    render(
      <DeleteConfirmDialog todoText="Buy milk" onConfirm={jest.fn()} onCancel={onCancel} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('pressing Escape calls onCancel', () => {
    const onCancel = jest.fn();
    render(
      <DeleteConfirmDialog todoText="Buy milk" onConfirm={jest.fn()} onCancel={onCancel} />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('both buttons are keyboard operable', async () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
      <DeleteConfirmDialog todoText="Buy milk" onConfirm={onConfirm} onCancel={onCancel} />,
    );
    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    cancelBtn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onCancel).toHaveBeenCalled();
    const deleteBtn = screen.getByRole('button', { name: /^delete$/i });
    deleteBtn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onConfirm).toHaveBeenCalled();
  });
});
