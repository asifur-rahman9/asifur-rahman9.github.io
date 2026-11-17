import { afterEach, describe, expect, it, vi } from 'vitest';
import { readCache, writeCache } from '../src/lib/cache';

const memoryStorage = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
};

describe('cache', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns fresh entries and drops ones older than ten minutes', () => {
    vi.stubGlobal('localStorage', memoryStorage());
    writeCache('k', { a: 1 }, 0);
    expect(readCache('k', 9 * 60 * 1000)).toEqual({ a: 1 });
    expect(readCache('k', 11 * 60 * 1000)).toBeNull();
  });

  it('never throws when storage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(() => writeCache('k', 1)).not.toThrow();
    expect(readCache('k')).toBeNull();
  });
});
