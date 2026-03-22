'use client';

import { useEffect } from 'react';

interface DeleteConfirmDialogProps {
  todoText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({ todoText, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCancel();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div className="mt-2 p-3 border border-red-200 rounded bg-red-50 flex flex-col gap-2">
      <p className="text-sm text-gray-700">
        Delete &ldquo;{todoText}&rdquo;? This cannot be undone.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="min-h-11 min-w-11 px-3 bg-red-600 text-white rounded text-sm hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 outline-none"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={onCancel}
          autoFocus
          className="min-h-11 min-w-11 px-3 border border-gray-300 rounded text-sm hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 outline-none"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
