import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoStats } from '~/components/todo-stats';

describe('TodoStats', () => {
  const getValues = () => ({
    total: screen.getByTestId('stats-total').textContent,
    completed: screen.getByTestId('stats-completed').textContent,
    pending: screen.getByTestId('stats-pending').textContent,
  });

  it('renders all pending when none are completed', () => {
    render(<TodoStats total={5} completed={0} />);

    expect(getValues()).toEqual({
      total: '5',
      completed: '0',
      pending: '5',
    });
  });

  it('renders all completed when total equals completed', () => {
    render(<TodoStats total={4} completed={4} />);

    expect(getValues()).toEqual({
      total: '4',
      completed: '4',
      pending: '0',
    });
  });

  it('renders a mix of completed and pending', () => {
    render(<TodoStats total={7} completed={3} />);

    expect(getValues()).toEqual({
      total: '7',
      completed: '3',
      pending: '4',
    });
  });

  it('renders zeros when the todo list is empty', () => {
    render(<TodoStats total={0} completed={0} />);

    expect(getValues()).toEqual({
      total: '0',
      completed: '0',
      pending: '0',
    });
  });

  it('renders the stats container with all three labels', () => {
    render(<TodoStats total={1} completed={1} />);

    expect(screen.getByTestId('todo-stats')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});
