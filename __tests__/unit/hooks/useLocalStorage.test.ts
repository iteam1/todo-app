import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const KEY = 'test-key';
const DEFAULT: string[] = [];

function validate(raw: string | null): string[] {
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

describe('useLocalStorage', () => {
  it('returns default value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, DEFAULT, validate));
    expect(result.current[0]).toEqual([]);
  });

  it('reads initial value from localStorage', () => {
    localStorage.setItem(KEY, JSON.stringify(['item1', 'item2']));
    const { result } = renderHook(() => useLocalStorage(KEY, DEFAULT, validate));
    expect(result.current[0]).toEqual(['item1', 'item2']);
  });

  it('write calls setItem with correct key and serialized value', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, DEFAULT, validate));
    act(() => {
      result.current[1](['a', 'b']);
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(KEY, JSON.stringify(['a', 'b']));
  });

  it('write returns true on success', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, DEFAULT, validate));
    let success = false;
    act(() => {
      success = result.current[1](['a']);
    });
    expect(success).toBe(true);
  });

  it('QuotaExceededError is caught without throwing and returns false', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, DEFAULT, validate));
    // Use mockImplementationOnce so original impl is restored after one call
    (localStorage.setItem as jest.Mock).mockImplementationOnce(() => {
      const err = new DOMException('QuotaExceededError', 'QuotaExceededError');
      throw err;
    });
    let success = true;
    expect(() => {
      act(() => {
        success = result.current[1](['a']);
      });
    }).not.toThrow();
    expect(success).toBe(false);
  });

  it('storage event triggers re-read', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, DEFAULT, validate));
    act(() => {
      localStorage.setItem(KEY, JSON.stringify(['new-item']));
      window.dispatchEvent(new StorageEvent('storage', { key: KEY }));
    });
    expect(result.current[0]).toEqual(['new-item']);
  });

  it('server snapshot returns default value', () => {
    // The server snapshot is tested indirectly by ensuring the hook has a stable fallback.
    // We can't easily test SSR in jsdom, but we verify the hook renders without error.
    const { result } = renderHook(() => useLocalStorage(KEY, DEFAULT, validate));
    expect(result.current[0]).toEqual([]);
  });
});
