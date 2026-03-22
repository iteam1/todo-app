import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '@/components/FilterBar';

describe('FilterBar', () => {
  it('renders three buttons: All, Active, Completed', () => {
    render(<FilterBar activeFilter="all" onChange={jest.fn()} />);
    expect(screen.getByRole('tab', { name: /^all$/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^active$/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^completed$/i })).toBeInTheDocument();
  });

  it('container has role="tablist"', () => {
    render(<FilterBar activeFilter="all" onChange={jest.fn()} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('active filter button has aria-selected="true"', () => {
    render(<FilterBar activeFilter="active" onChange={jest.fn()} />);
    expect(screen.getByRole('tab', { name: /^active$/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /^all$/i })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: /^completed$/i })).toHaveAttribute('aria-selected', 'false');
  });

  it('clicking "All" calls onChange with "all"', async () => {
    const onChange = jest.fn();
    render(<FilterBar activeFilter="active" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: /^all$/i }));
    expect(onChange).toHaveBeenCalledWith('all');
  });

  it('clicking "Active" calls onChange with "active"', async () => {
    const onChange = jest.fn();
    render(<FilterBar activeFilter="all" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: /^active$/i }));
    expect(onChange).toHaveBeenCalledWith('active');
  });

  it('clicking "Completed" calls onChange with "completed"', async () => {
    const onChange = jest.fn();
    render(<FilterBar activeFilter="all" onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: /^completed$/i }));
    expect(onChange).toHaveBeenCalledWith('completed');
  });

  it('is keyboard operable with Tab and Enter', async () => {
    const onChange = jest.fn();
    render(<FilterBar activeFilter="all" onChange={onChange} />);
    const activeBtn = screen.getByRole('tab', { name: /^active$/i });
    activeBtn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('active');
  });
});
