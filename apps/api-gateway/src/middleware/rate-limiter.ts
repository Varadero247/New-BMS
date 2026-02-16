import rateLimit, { type RateLimitRequestHandler, type Options } from 'express-rate-limit';
import type { Request, Response } from 'express';
import Redis from 'ioredis';
import RedisStore from 'rate-limit-redis';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('rate-limiter');

// Redis client singleton
let redis: Redis | null = null;
let redisReady = false;

/**
 * Get or create Redis client for rate limiting.
 * Returns null if REDIS_URL is not set.
 */
export function getRedisClient(): Redis | null {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    logger.warn('REDIS_URL not set - rate limiting will use in-memory store');
    return null;
  }

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('Redis connection failed after retries, using in-memory rate limiting');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redis.on('error', () => {
      // Suppress repeated ioredis error logs — just mark unavailable
      redisReady = false;
    });

    redis.on('ready', () => {
      redisReady = true;
      logger.info('Redis connected for rate limiting');
    });

    // Attempt connection — don't block startup if it fails
    redis.connect().catch(() => {
      redisReady = false;
    });

    return redis;
  } catch (error) {
    logger.error('Failed to create Redis client', { error });
    return null;
  }
}

/**
 * Try to create a Redis store for rate limiting.
 * Falls back to in-memory (undefined) if Redis is unreachable.
 */
function createStore(): RedisStore | undefined {
  const client = getRedisClient();
  if (!client) return undefined;

  // If Redis isn't ready after initial connect attempt, skip RedisStore entirely
  // to avoid rate-limit-redis crashing on its Lua script load
  if (!redisReady) {
    logger.warn('Redis not ready at store creation time - using in-memory rate limiting');
    return undefined;
  }

  try {
    return new RedisStore({
      // @ts-expect-error - ioredis is compatible
      sendCommand: (...args: string[]) => client.call(...args),
      prefix: 'rl:',
    });
  } catch {
    logger.warn('Failed to create RedisStore - using in-memory rate limiting');
    return undefined;
  }
}

/**
 * Standard rate limit error response
 */
function createRateLimitHandler(message: string) {
  return (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfter: res.getHeader('Retry-After'),
      },
    });
  };
}

/**
 * Authentication rate limiter - strict limits for login/register
 * 5 attempts per 15 minutes per IP+email combination
 */
export const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'unknown';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `auth:${ip}:${email}`;
  },
  store: createStore(),
  handler: createRateLimitHandler('Too many login attempts. Please try again in 15 minutes.'),
});

/**
 * Registration rate limiter - very strict
 * 3 registrations per hour per IP
 */
export const registerLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `register:${ip}`;
  },
  store: createStore(),
  handler: createRateLimitHandler('Too many registration attempts. Please try again in 1 hour.'),
});

/**
 * Password reset rate limiter
 * 3 attempts per 15 minutes per IP+email
 */
export const passwordResetLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'unknown';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `reset:${ip}:${email}`;
  },
  store: createStore(),
  handler: createRateLimitHandler(
    'Too many password reset attempts. Please try again in 15 minutes.'
  ),
});

/**
 * General API rate limiter - more relaxed
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `api:${ip}`;
  },
  store: createStore(),
  handler: createRateLimitHandler('Too many requests. Please slow down.'),
});

/**
 * Strict API rate limiter for sensitive operations
 * 20 requests per 15 minutes per IP
 */
export const strictApiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `strict:${ip}`;
  },
  store: createStore(),
  handler: createRateLimitHandler('Rate limit exceeded for this operation.'),
});

/**
 * Create a custom rate limiter with specific options
 */
export function createRateLimiter(options: Partial<Options>): RateLimitRequestHandler {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(),
    handler: createRateLimitHandler('Rate limit exceeded.'),
    ...options,
  });
}

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
