'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { parseTodos } from '@/lib/storage';
import type { FilterOption, TodoItem } from '@/types/todo';

type Action =
  | { type: 'ADD_TODO'; text: string }
  | { type: 'TOGGLE_TODO'; id: string }
  | { type: 'DELETE_TODO'; id: string }
  | { type: 'EDIT_TODO'; id: string; text: string }
  | { type: 'SET_FILTER'; filter: FilterOption };

interface State {
  todos: TodoItem[];
  activeFilter: FilterOption;
  storageCorrupted: boolean;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID (e.g. old jsdom)
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TODO': {
      const trimmed = action.text.trim();
      if (trimmed === '') return state;
      const newTodo: TodoItem = {
        id: generateId(),
        text: trimmed,
        status: 'active',
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      return { ...state, todos: [newTodo, ...state.todos] };
    }
    case 'TOGGLE_TODO': {
      const todos = state.todos.map((todo) => {
        if (todo.id !== action.id) return todo;
        if (todo.status === 'active') {
          return { ...todo, status: 'completed' as const, completedAt: new Date().toISOString() };
        }
        return { ...todo, status: 'active' as const, completedAt: null };
      });
      return { ...state, todos };
    }
    case 'DELETE_TODO': {
      return { ...state, todos: state.todos.filter((t) => t.id !== action.id) };
    }
    case 'EDIT_TODO': {
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.id ? { ...todo, text: action.text } : todo,
        ),
      };
    }
    case 'SET_FILTER': {
      return { ...state, activeFilter: action.filter };
    }
    default:
      return state;
  }
}

function getFilteredTodos(todos: TodoItem[], filter: FilterOption): TodoItem[] {
  const sorted = [...todos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  switch (filter) {
    case 'active':
      return sorted.filter((t) => t.status === 'active');
    case 'completed':
      return sorted.filter((t) => t.status === 'completed');
    default:
      return sorted;
  }
}

function loadInitialState(): State {
  if (typeof window === 'undefined') {
    return { todos: [], activeFilter: 'all', storageCorrupted: false };
  }
  try {
    const raw = localStorage.getItem('todos');
    const { todos, corrupted } = parseTodos(raw);
    return { todos, activeFilter: 'all', storageCorrupted: corrupted };
  } catch {
    return { todos: [], activeFilter: 'all', storageCorrupted: false };
  }
}

export function useTodos() {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);
  const [storageQuotaExceeded, setStorageQuotaExceeded] = useStorageQuota();

  // Persist todos to localStorage on every state change
  useEffect(() => {
    try {
      const serialized = JSON.stringify(state.todos);
      localStorage.setItem('todos', serialized);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        setStorageQuotaExceeded(true);
      }
    }
  }, [state.todos, setStorageQuotaExceeded]);

  const addTodo = useCallback((text: string) => {
    dispatch({ type: 'ADD_TODO', text });
  }, []);

  const toggleTodo = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_TODO', id });
  }, []);

  const deleteTodo = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TODO', id });
  }, []);

  const setFilter = useCallback((filter: FilterOption) => {
    dispatch({ type: 'SET_FILTER', filter });
  }, []);

  const editTodo = useCallback((id: string, text: string) => {
    dispatch({ type: 'EDIT_TODO', id, text });
  }, []);

  const filteredTodos = getFilteredTodos(state.todos, state.activeFilter);

  return {
    todos: state.todos,
    filteredTodos,
    activeFilter: state.activeFilter,
    storageCorrupted: state.storageCorrupted,
    storageQuotaExceeded,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    setFilter,
  };
}

function useStorageQuota(): [boolean, (v: boolean) => void] {
  const [exceeded, setExceeded] = useSimpleState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setStorageQuotaExceeded = useCallback(
    (value: boolean) => {
      setExceeded(value);
      if (value) {
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          setExceeded(false);
          timerRef.current = null;
        }, 5000);
      }
    },
    [setExceeded],
  );

  return [exceeded, setStorageQuotaExceeded];
}

// Simple useState-like hook using useReducer for stable reference
function useSimpleState<T>(initial: T): [T, (v: T) => void] {
  const [value, dispatch] = useReducer((_: T, next: T) => next, initial);
  return [value, dispatch];
}
