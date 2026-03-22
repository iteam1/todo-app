'use client';

import { useEffect, useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { FilterBar } from './FilterBar';
import { TodoInput } from './TodoInput';
import { TodoList } from './TodoList';

export function TodoApp() {
  const {
    filteredTodos,
    activeFilter,
    storageCorrupted,
    storageQuotaExceeded,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    setFilter,
  } = useTodos();

  const [showCorruptedBanner, setShowCorruptedBanner] = useState(storageCorrupted);
  const [showQuotaBanner, setShowQuotaBanner] = useState(false);

  useEffect(() => {
    if (storageCorrupted) {
      setShowCorruptedBanner(true);
      const timer = setTimeout(() => setShowCorruptedBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [storageCorrupted]);

  useEffect(() => {
    if (storageQuotaExceeded) {
      setShowQuotaBanner(true);
      const timer = setTimeout(() => setShowQuotaBanner(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowQuotaBanner(false);
    }
  }, [storageQuotaExceeded]);

  return (
    <main className="mx-auto max-w-xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Tasks</h1>

      {showCorruptedBanner && (
        <div
          role="alert"
          className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800"
        >
          Your task data was unreadable and has been reset.
        </div>
      )}

      {showQuotaBanner && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800"
        >
          Storage full — your last change could not be saved.
        </div>
      )}

      <div className="flex flex-col gap-4">
        <TodoInput onSubmit={addTodo} />
        <FilterBar activeFilter={activeFilter} onChange={setFilter} />
        <TodoList
          todos={filteredTodos}
          activeFilter={activeFilter}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          editTodo={editTodo}
        />
      </div>
    </main>
  );
}
