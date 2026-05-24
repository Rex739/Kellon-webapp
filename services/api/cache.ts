type CacheEntry<T> = {
  expiresAt: number;
  value: Promise<T>;
};

const apiCache = new Map<string, CacheEntry<unknown>>();

export function getCachedApiResponse<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const cached = apiCache.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = fetcher().catch((error) => {
    apiCache.delete(key);
    throw error;
  });

  apiCache.set(key, {
    expiresAt: now + ttlMs,
    value,
  });

  return value;
}
