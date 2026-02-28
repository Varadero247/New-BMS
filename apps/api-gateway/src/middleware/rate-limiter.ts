// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import rateLimit, { type RateLimitRequestHandler, type Options } from 'express-rate-limit';
import type { Request, Response } from 'express';
import Redis from 'ioredis';
import RedisStore from 'rate-limit-redis';
import { createLogger, rateLimitExceededTotal } from '@ims/monitoring';

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
 * Skip rate limiting when RATE_LIMIT_ENABLED=false (load testing / CI).
 * Never disable in production.
 */
function skipRateLimit(): boolean {
  return process.env.RATE_LIMIT_ENABLED === 'false';
}

/**
 * Standard rate limit error response
 */
function createRateLimitHandler(message: string, limiterName = 'api') {
  return (_req: Request, res: Response) => {
    rateLimitExceededTotal.inc({ limiter: limiterName, service: 'api-gateway' });
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
 * 5 attempts per 15 minutes per IP (keyed on IP only to prevent user enumeration)
 */
export const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  keyGenerator: (req: Request) => {
    // Keyed on IP only — including email in the key allows user enumeration
    // (attacker observes different rate-limit counters per email to detect existence)
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `auth:${ip}`;
  },
  store: createStore(),
  handler: createRateLimitHandler('Too many login attempts. Please try again in 15 minutes.', 'auth'),
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
  skip: skipRateLimit,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `register:${ip}`;
  },
  store: createStore(),
  handler: createRateLimitHandler('Too many registration attempts. Please try again in 1 hour.', 'register'),
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
  skip: skipRateLimit,
  keyGenerator: (req: Request) => {
    const email = req.body?.email || 'unknown';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `reset:${ip}:${email}`;
  },
  store: createStore(),
  handler: createRateLimitHandler(
    'Too many password reset attempts. Please try again in 15 minutes.',
    'password_reset'
  ),
});

/**
 * Token refresh rate limiter - prevent JWT refresh token cracking
 * 20 refresh attempts per 15 minutes per IP
 */
export const refreshLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `refresh:${ip}`;
  },
  store: createStore(),
  handler: createRateLimitHandler(
    'Too many token refresh attempts. Please try again later.',
    'refresh'
  ),
});

/**
 * General API rate limiter - more relaxed
 * 300 requests per 15 minutes per IP
 */
export const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `api:${ip}`;
  },
  store: createStore(),
  handler: createRateLimitHandler('Too many requests. Please slow down.', 'api'),
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
  skip: skipRateLimit,
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `strict:${ip}`;
  },
  store: createStore(),
  handler: createRateLimitHandler('Rate limit exceeded for this operation.', 'strict_api'),
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
