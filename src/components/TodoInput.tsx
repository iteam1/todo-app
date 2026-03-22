'use client';

import { useRef, useState } from 'react';

interface TodoInputProps {
  onSubmit: (text: string) => void;
}

export function TodoInput({ onSubmit }: TodoInputProps) {
  const [value, setValue] = useState('');
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    const trimmed = value.trim();
    if (trimmed === '') {
      setShowError(true);
      inputRef.current?.focus();
      return;
    }
    setShowError(false);
    onSubmit(trimmed);
    setValue('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  return (
    <div className="flex gap-2">
      <div className="flex flex-col flex-1">
        <input
          ref={inputRef}
          type="text"
          aria-label="New task"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (showError && e.target.value.trim() !== '') setShowError(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task…"
          className="border border-gray-300 rounded px-3 py-2 w-full focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none"
        />
        {showError && (
          <span role="alert" className="text-sm text-red-600 mt-1">
            Task text cannot be empty.
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        aria-label="Add task"
        className="min-h-11 min-w-11 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 outline-none"
      >
        Add
      </button>
    </div>
  );
}
