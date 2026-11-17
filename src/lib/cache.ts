// Small localStorage cache shared by every island (and every tab), so repeat visits
// don't spend GitHub's 60 unauthenticated requests per hour.
const TTL_MS = 10 * 60 * 1000;

export const CACHE_KEYS = { activity: 'gh-activity-v1', repos: 'gh-repos-v1' } as const;

/** The cached value if it is younger than the TTL, else null. Never throws (private mode, quota, SSR). */
export function readCache<T>(key: string, now = Date.now()): T | null {
  try {
    const c = JSON.parse(localStorage.getItem(key) || 'null');
    return c && now - c.at < TTL_MS ? c.data : null;
  } catch { return null; }
}

export function writeCache(key: string, data: unknown, now = Date.now()) {
  try { localStorage.setItem(key, JSON.stringify({ at: now, data })); } catch { /* storage unavailable */ }
}
