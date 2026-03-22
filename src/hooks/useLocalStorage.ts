'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';

type Action<T> =
  | { type: 'set'; value: T }
  | { type: 'refresh' };

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  validate: (raw: string | null) => T,
): [T, (value: T) => boolean] {
  const keyRef = useRef(key);
  const defaultValueRef = useRef(defaultValue);
  const validateRef = useRef(validate);
  keyRef.current = key;
  defaultValueRef.current = defaultValue;
  validateRef.current = validate;

  function readFromStorage(): T {
    if (typeof window === 'undefined') return defaultValueRef.current;
    try {
      const raw = localStorage.getItem(keyRef.current);
      return validateRef.current(raw);
    } catch {
      return defaultValueRef.current;
    }
  }

  const [value, dispatch] = useReducer(
    (_prev: T, action: Action<T>): T => {
      if (action.type === 'set') return action.value;
      return readFromStorage();
    },
    undefined,
    (): T => (typeof window !== 'undefined' ? readFromStorage() : defaultValue),
  );

  // Listen for storage events from other tabs / test dispatches
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === keyRef.current || event.key === null) {
        dispatch({ type: 'refresh' });
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setValue = useCallback(
    (newValue: T): boolean => {
      try {
        const serialized = JSON.stringify(newValue);
        localStorage.setItem(keyRef.current, serialized);
        dispatch({ type: 'set', value: newValue });
        return true;
      } catch (error) {
        if (
          error instanceof Error &&
          (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
        ) {
          console.error('localStorage QuotaExceededError: could not save data', error);
          return false;
        }
        throw error;
      }
    },
    [],
  );

  return [value, setValue];
}
