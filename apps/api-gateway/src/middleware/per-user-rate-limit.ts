// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Per-User Rate Limiting Middleware
 *
 * Tier-based limits keyed on authenticated user ID rather than IP.
 * Falls back to IP-based limiting for unauthenticated requests.
 *
 * Tiers:
 *   basic      — 300 req / 15 min
 *   standard   — 1000 req / 15 min
 *   premium    — 5000 req / 15 min
 *   enterprise — unlimited
 */

import type { Request, Response, NextFunction } from 'express';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('per-user-rate-limit');

// ── Types ──────────────────────────────────────────────────────────────────

export type UserTier = 'basic' | 'standard' | 'premium' | 'enterprise';

export interface TierLimits {
  /** Maximum requests in the window */
  maxRequests: number;
  /** Window length in milliseconds */
  windowMs: number;
}

export interface PerUserRateLimitOptions {
  /** Map of tier → limits. Falls back to TIER_DEFAULTS. */
  tiers?: Partial<Record<UserTier, TierLimits>>;
  /** Extract user ID from request (default: req.user?.id) */
  getUserId?: (req: Request) => string | undefined;
  /** Extract user tier from request (default: req.user?.tier || 'standard') */
  getUserTier?: (req: Request) => UserTier;
  /** Called when a user is rate-limited */
  onLimitReached?: (userId: string, tier: UserTier) => void;
  /** Skip rate limiting entirely (e.g. in tests) */
  skip?: (req: Request) => boolean;
}

export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// ── Defaults ───────────────────────────────────────────────────────────────

export const TIER_DEFAULTS: Record<UserTier, TierLimits> = {
  basic:      { maxRequests: 300,     windowMs: 15 * 60 * 1000 },
  standard:   { maxRequests: 1_000,   windowMs: 15 * 60 * 1000 },
  premium:    { maxRequests: 5_000,   windowMs: 15 * 60 * 1000 },
  enterprise: { maxRequests: Infinity, windowMs: 15 * 60 * 1000 },
};

// ── In-Memory Store ────────────────────────────────────────────────────────

export class InMemoryUserRateLimitStore {
  private readonly store = new Map<string, RateLimitEntry>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor(cleanupIntervalMs = 60_000) {
    // Periodically evict expired entries
    this.cleanupInterval = setInterval(() => this.evictExpired(), cleanupIntervalMs);
    if (this.cleanupInterval.unref) this.cleanupInterval.unref();
  }

  /**
   * Increment a user's request counter.
   * Returns the updated entry (with a fresh window if it expired).
   */
  increment(key: string, windowMs: number): RateLimitEntry {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now >= existing.resetAt) {
      const entry: RateLimitEntry = { count: 1, resetAt: now + windowMs };
      this.store.set(key, entry);
      return entry;
    }

    existing.count += 1;
    return existing;
  }

  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key);
    if (entry && Date.now() >= entry.resetAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry;
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  get size(): number {
    return this.store.size;
  }

  evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now >= entry.resetAt) this.store.delete(key);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Module-level default store
let defaultStore: InMemoryUserRateLimitStore | null = null;

function getDefaultStore(): InMemoryUserRateLimitStore {
  if (!defaultStore) defaultStore = new InMemoryUserRateLimitStore();
  return defaultStore;
}

// ── Middleware Factory ─────────────────────────────────────────────────────

export function createPerUserRateLimit(
  opts: PerUserRateLimitOptions = {},
  store: InMemoryUserRateLimitStore = getDefaultStore()
) {
  const tierConfig: Record<UserTier, TierLimits> = {
    ...TIER_DEFAULTS,
    ...opts.tiers,
  };

  const getUserId = opts.getUserId ?? ((req: Request) => (req as Request & { user?: { id?: string } }).user?.id);
  const getUserTier = opts.getUserTier ?? ((req: Request): UserTier => {
    const user = (req as Request & { user?: { tier?: string } }).user;
    const t = user?.tier;
    if (t === 'basic' || t === 'standard' || t === 'premium' || t === 'enterprise') return t;
    return 'standard';
  });

  return function perUserRateLimit(req: Request, res: Response, next: NextFunction): void {
    // Allow test/CI bypass
    if (opts.skip?.(req) || process.env.RATE_LIMIT_ENABLED === 'false') {
      return next();
    }

    const userId = getUserId(req);

    // Unauthenticated — delegate to IP-based limiting (not our concern here)
    if (!userId) return next();

    const tier = getUserTier(req);
    const limits = tierConfig[tier];

    // Enterprise tier is unlimited
    if (!isFinite(limits.maxRequests)) return next();

    const key = `user:${userId}`;
    const entry = store.increment(key, limits.windowMs);

    const remaining = Math.max(0, limits.maxRequests - entry.count);
    const resetSec = Math.ceil((entry.resetAt - Date.now()) / 1000);

    // Set informational rate-limit headers (RFC 6585 / draft-ietf-httpapi-ratelimit-headers)
    res.setHeader('X-RateLimit-Limit', limits.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

    if (entry.count > limits.maxRequests) {
      logger.warn('Per-user rate limit exceeded', { userId, tier, count: entry.count });
      opts.onLimitReached?.(userId, tier);

      res.setHeader('Retry-After', resetSec);
      res.status(429).json({
        success: false,
        error: {
          code: 'USER_RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded for your account tier (${tier}). Try again in ${resetSec}s.`,
          tier,
          retryAfter: resetSec,
        },
      });
      return;
    }

    next();
  };
}

/** Reset the module-level default store (for testing). */
export function resetDefaultStore(): void {
  defaultStore?.destroy();
  defaultStore = null;
}
