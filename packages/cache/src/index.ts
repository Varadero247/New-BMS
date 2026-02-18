/**
 * @ims/cache - Redis caching layer for IMS services
 *
 * Provides TTL-based key-value caching with pattern invalidation.
 * Uses ioredis for Redis connectivity and supports graceful fallback
 * when Redis is unavailable (cache miss returns null, writes are no-ops).
 */
import Redis from 'ioredis';

// ============================================
// TYPES
// ============================================

export interface CacheOptions {
  /** Time-to-live in seconds (default: 300 = 5 minutes) */
  ttl?: number;
  /** Prefix for cache keys to namespace by service (default: 'ims') */
  prefix?: string;
}

export interface CacheConfig {
  /** Redis connection URL (default: process.env.REDIS_URL || 'redis://localhost:6379') */
  url?: string;
  /** Default TTL in seconds (default: 300) */
  defaultTtl?: number;
  /** Key prefix (default: 'ims') */
  prefix?: string;
  /** Enable/disable caching globally (default: true) */
  enabled?: boolean;
}

// ============================================
// CACHE CLIENT
// ============================================

let redisClient: Redis | null = null;
let cacheEnabled = true;
let defaultTtl = 300; // 5 minutes
let keyPrefix = 'ims';

/**
 * Initialize the cache layer with Redis connection.
 * Should be called once at service startup.
 */
export function initCache(config: CacheConfig = {}): Redis | null {
  const url = config.url || process.env.REDIS_URL || 'redis://localhost:6379';
  cacheEnabled = config.enabled !== false;
  defaultTtl = config.defaultTtl ?? 300;
  keyPrefix = config.prefix ?? 'ims';

  if (!cacheEnabled) {
    return null;
  }

  try {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 3) return null; // Stop retrying after 3 attempts
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redisClient.on('error', (err: Error) => {
      // Silently degrade - log but don't crash
      if (process.env.NODE_ENV !== 'test') {
        console.warn('[cache] Redis connection error:', err.message);
      }
    });

    redisClient.on('connect', () => {
      if (process.env.NODE_ENV !== 'test') {
        console.info('[cache] Redis connected');
      }
    });

    return redisClient;
  } catch {
    redisClient = null;
    return null;
  }
}

/**
 * Get the underlying Redis client (for advanced usage).
 */
export function getRedisClient(): Redis | null {
  return redisClient;
}

/**
 * Build a fully-qualified cache key with prefix.
 */
function buildKey(key: string): string {
  return `${keyPrefix}:${key}`;
}

// ============================================
// CORE CACHE OPERATIONS
// ============================================

/**
 * Get a cached value by key.
 * Returns null on cache miss or when Redis is unavailable.
 */
export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  if (!cacheEnabled || !redisClient) return null;

  try {
    const data = await redisClient.get(buildKey(key));
    if (data === null) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/**
 * Set a cached value with optional TTL.
 * No-op when Redis is unavailable.
 */
export async function cacheSet<T = unknown>(
  key: string,
  value: T,
  options?: CacheOptions
): Promise<void> {
  if (!cacheEnabled || !redisClient) return;

  const ttl = options?.ttl ?? defaultTtl;
  const fullKey = buildKey(key);

  try {
    const serialized = JSON.stringify(value);
    if (ttl > 0) {
      await redisClient.setex(fullKey, ttl, serialized);
    } else {
      await redisClient.set(fullKey, serialized);
    }
  } catch {
    // Silently degrade
  }
}

/**
 * Delete a specific cached key.
 */
export async function cacheDel(key: string): Promise<void> {
  if (!cacheEnabled || !redisClient) return;

  try {
    await redisClient.del(buildKey(key));
  } catch {
    // Silently degrade
  }
}

/**
 * Invalidate all cache keys matching a glob pattern.
 * Example: cacheInvalidate('users:*') deletes all user-related cache keys.
 *
 * Uses SCAN for production safety (non-blocking iteration).
 */
export async function cacheInvalidate(pattern: string): Promise<number> {
  if (!cacheEnabled || !redisClient) return 0;

  const fullPattern = buildKey(pattern);
  let deletedCount = 0;

  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redisClient.scan(cursor, 'MATCH', fullPattern, 'COUNT', 100);
      cursor = nextCursor;

      if (keys.length > 0) {
        await redisClient.del(...keys);
        deletedCount += keys.length;
      }
    } while (cursor !== '0');
  } catch {
    // Silently degrade
  }

  return deletedCount;
}

/**
 * Check if a key exists in the cache.
 */
export async function cacheHas(key: string): Promise<boolean> {
  if (!cacheEnabled || !redisClient) return false;

  try {
    const exists = await redisClient.exists(buildKey(key));
    return exists === 1;
  } catch {
    return false;
  }
}

// ============================================
// CACHE HELPERS
// ============================================

/**
 * Get-or-set: returns cached value if available, otherwise calls the factory
 * function, caches the result, and returns it.
 *
 * This is the recommended pattern for caching database queries:
 *
 * ```typescript
 * const users = await cacheGetOrSet('users:page:1', async () => {
 *   return prisma.user.findMany({ take: 20 });
 * }, { ttl: 60 });
 * ```
 */
export async function cacheGetOrSet<T>(
  key: string,
  factory: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const value = await factory();
  await cacheSet(key, value, options);
  return value;
}

/**
 * Gracefully disconnect the Redis client.
 * Call during service shutdown.
 */
export async function closeCache(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {
      // Already disconnected
    }
    redisClient = null;
  }
}
