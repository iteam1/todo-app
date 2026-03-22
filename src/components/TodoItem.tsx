'use client';

import { useEffect, useRef, useState } from 'react';
import type { TodoItem } from '@/types/todo';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface TodoItemProps {
  todo: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  onEditStart: (id: string) => void;
  onEditSave: (id: string, text: string) => void;
  onEditCancel: () => void;
}

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  isEditing,
  onEditStart,
  onEditSave,
  onEditCancel,
}: TodoItemProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditText(todo.text);
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing, todo.text]);

  function handleConfirmDelete() {
    onDelete(todo.id);
    const currentLi = deleteButtonRef.current?.closest('li');
    if (currentLi) {
      const sibling =
        (currentLi.nextElementSibling as HTMLElement | null) ??
        (currentLi.previousElementSibling as HTMLElement | null);
      if (sibling) {
        const focusable = sibling.querySelector<HTMLElement>('button, input, [tabindex]');
        focusable?.focus();
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onEditSave(todo.id, editText);
    } else if (e.key === 'Escape') {
      onEditCancel();
    }
  }

  const ariaLabel =
    todo.status === 'active'
      ? `Mark '${todo.text}' as complete`
      : `Mark '${todo.text}' as incomplete`;

  return (
    <li data-todo-id={todo.id} className="flex flex-col gap-1 py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.status === 'completed'}
          onChange={() => onToggle(todo.id)}
          aria-label={ariaLabel}
          className="min-h-5 min-w-5 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
        />
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => onEditSave(todo.id, editText)}
            className="flex-1 min-w-0 border border-blue-400 rounded px-2 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <>
            <span
              className={`flex-1 text-gray-800 break-words min-w-0 ${todo.status === 'completed' ? 'line-through opacity-50' : ''}`}
            >
              {todo.text}
            </span>
            <button
              type="button"
              onClick={() => onEditStart(todo.id)}
              aria-label="Edit task"
              className="min-h-[44px] min-w-[44px] px-2 text-gray-400 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none rounded"
            >
              ✎
            </button>
          </>
        )}
        <button
          ref={deleteButtonRef}
          type="button"
          onClick={() => setShowConfirm(true)}
          aria-label={`Delete '${todo.text}'`}
          className="min-h-11 min-w-11 px-2 text-gray-400 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 outline-none rounded"
        >
          ✕
        </button>
      </div>
      {showConfirm && (
        <DeleteConfirmDialog
          todoText={todo.text}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </li>
  );
}
