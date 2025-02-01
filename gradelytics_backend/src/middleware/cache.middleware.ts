import { Elysia } from 'elysia';

interface CacheItem {
  data: any;
  timestamp: number;
}

export const cacheMiddleware = new Elysia()
  .state('cache', new Map<string, CacheItem>())
  .derive(({ request, store: { cache } }) => {
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

    return {
      getCache: (key: string) => {
        const item = cache.get(key);
        if (!item) return null;

        // Check if cache is expired
        if (Date.now() - item.timestamp > CACHE_TTL) {
          cache.delete(key);
          return null;
        }

        return item.data;
      },

      setCache: (key: string, data: any) => {
        cache.set(key, {
          data,
          timestamp: Date.now()
        });
      }
    };
  }); 