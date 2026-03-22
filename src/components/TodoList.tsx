'use client';

import type { FilterOption, TodoItem as TodoItemType } from '@/types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: TodoItemType[];
  activeFilter: FilterOption;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function getEmptyStateMessage(filter: FilterOption): string {
  switch (filter) {
    case 'active':
      return 'No active tasks.';
    case 'completed':
      return 'No completed tasks.';
    default:
      return 'No tasks yet. Add one above.';
  }
}

export function TodoList({ todos, activeFilter, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">{getEmptyStateMessage(activeFilter)}</p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
