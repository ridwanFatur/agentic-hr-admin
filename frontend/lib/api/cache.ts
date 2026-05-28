/**
 * Lightweight request cache to prevent duplicate in-flight requests.
 * Keyed by a cache key string. Entries expire after TTL milliseconds.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 30_000; // 30 seconds

const store = new Map<string, CacheEntry<unknown>>();

export const requestCache = {
  /**
   * Get a cached value by key. Returns undefined if missing or expired.
   */
  get<T>(key: string): T | undefined {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return undefined;
    }
    return entry.data;
  },

  /**
   * Store a value with a TTL (default 30s).
   */
  set<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
    store.set(key, { data, expiresAt: Date.now() + ttlMs });
  },

  /**
   * Remove a specific entry.
   */
  invalidate(key: string): void {
    store.delete(key);
  },

  /**
   * Clear all cached entries.
   */
  clear(): void {
    store.clear();
  },
};

/**
 * Wraps an async fetch function with caching.
 * If a cached result exists for the key, it is returned immediately.
 * Otherwise, the fetch function is called, cached, and returned.
 */
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs?: number
): Promise<T> {
  const cached = requestCache.get<T>(key);
  if (cached !== undefined) return cached;

  const result = await fetchFn();
  requestCache.set(key, result, ttlMs);
  return result;
}
