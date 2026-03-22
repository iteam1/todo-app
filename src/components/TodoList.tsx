'use client';

import { useState } from 'react';
import type { FilterOption, TodoItem as TodoItemType } from '@/types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: TodoItemType[];
  activeFilter: FilterOption;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  editTodo: (id: string, text: string) => void;
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

export function TodoList({ todos, activeFilter, onToggle, onDelete, editTodo }: TodoListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  function onEditStart(id: string) {
    setEditingId(id);
  }

  function onEditSave(id: string, text: string) {
    if (text.trim() !== '') {
      editTodo(id, text.trim());
    }
    setEditingId(null);
  }

  function onEditCancel() {
    setEditingId(null);
  }

  if (todos.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">{getEmptyStateMessage(activeFilter)}</p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          isEditing={editingId === todo.id}
          onEditStart={onEditStart}
          onEditSave={onEditSave}
          onEditCancel={onEditCancel}
        />
      ))}
    </ul>
  );
}
