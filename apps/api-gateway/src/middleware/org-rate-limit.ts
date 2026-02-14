import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-gateway');

/**
 * Per-organisation sliding window rate limiter (in-memory, no Redis dependency).
 *
 * Each organisation gets a request budget per 60-second sliding window.
 * The budget is determined by the organisation's plan tier.
 *
 * Plan tier limits (requests per 60 seconds):
 *   FREE:         200
 *   STARTER:      500
 *   PROFESSIONAL: 2 000  (default)
 *   ENTERPRISE:  10 000
 */

const PLAN_LIMITS: Record<string, number> = {
  FREE: 200,
  STARTER: 500,
  PROFESSIONAL: 2000,
  ENTERPRISE: 10000,
};

const WINDOW_MS = 60_000; // 60 seconds

interface WindowEntry {
  count: number;
  windowStart: number;
  firstHitLogged: boolean;
}

// In-memory store keyed by orgId (or 'anonymous')
const windows = new Map<string, WindowEntry>();

/**
 * Periodically purge expired windows to prevent memory leaks.
 * Runs every 5 minutes.
 */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    let purged = 0;
    windows.forEach((entry, key) => {
      if (now - entry.windowStart >= WINDOW_MS) {
        windows.delete(key);
        purged++;
      }
    });
    if (purged > 0) {
      logger.debug('Org rate-limit window cleanup', { purged, remaining: windows.size });
    }
  }, CLEANUP_INTERVAL_MS);

  // Allow the process to exit even if the timer is still running
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Stop the periodic cleanup (useful for tests / graceful shutdown).
 */
export function stopOrgRateLimitCleanup(): void {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

/**
 * Clear all tracked windows (useful for tests).
 */
export function resetOrgRateLimitWindows(): void {
  windows.clear();
}

/**
 * Express middleware factory.
 *
 * Usage:
 *   app.use('/api', orgRateLimit());
 */
export function orgRateLimit() {
  // Kick off the background cleanup on first call
  startCleanup();

  return (req: Request, res: Response, next: NextFunction) => {
    // Skip health / readiness / metrics endpoints
    if (req.path === '/health' || req.path === '/ready' || req.path === '/metrics') {
      return next();
    }

    const now = Date.now();

    // Extract organisation context from the authenticated user (if present).
    // The auth middleware attaches `user` to the request before this runs.
    const user = (req as any).user;
    const orgId: string = user?.organisationId || user?.organizationId || 'anonymous';
    const plan: string = user?.plan || 'PROFESSIONAL';
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.PROFESSIONAL;

    // ------------------------------------------------------------------
    // Sliding window logic
    // ------------------------------------------------------------------
    let entry = windows.get(orgId);

    if (!entry || now - entry.windowStart >= WINDOW_MS) {
      // Window expired (or first request) — start a fresh window
      entry = { count: 1, windowStart: now, firstHitLogged: false };
      windows.set(orgId, entry);
    } else {
      entry.count++;
    }

    const remaining = Math.max(0, limit - entry.count);
    const resetAt = new Date(entry.windowStart + WINDOW_MS);
    const retryAfterSeconds = Math.ceil((entry.windowStart + WINDOW_MS - now) / 1000);

    // Always set informational headers
    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', resetAt.toISOString());

    if (entry.count > limit) {
      // Log only the first breach per window to avoid log spam
      if (!entry.firstHitLogged) {
        entry.firstHitLogged = true;
        logger.warn('Organisation rate limit exceeded', {
          orgId,
          plan,
          limit,
          count: entry.count,
          resetAt: resetAt.toISOString(),
        });
      }

      res.setHeader('Retry-After', String(retryAfterSeconds));

      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded',
          retryAfter: retryAfterSeconds,
          limit,
          remaining: 0,
          resetAt: resetAt.toISOString(),
        },
      });
    }

    next();
  };
}
