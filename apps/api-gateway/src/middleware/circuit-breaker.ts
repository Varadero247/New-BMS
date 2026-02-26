// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('circuit-breaker');

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerConfig {
  /** Service name for logging */
  name: string;
  /** Number of consecutive failures before opening the circuit */
  failureThreshold?: number;
  /** Milliseconds to wait in OPEN state before moving to HALF_OPEN */
  resetTimeoutMs?: number;
  /** Successful requests in HALF_OPEN required before closing the circuit */
  halfOpenSuccesses?: number;
  /**
   * Enable stale response cache for GET/HEAD requests when circuit is OPEN.
   * Last successful 2xx response is served with X-Cache: HIT-stale instead of 503.
   * Default: true
   */
  staleCache?: boolean;
  /**
   * How long (ms) a cached response is considered usable when the circuit is open.
   * Default: 120_000 (2 minutes)
   */
  staleTtlMs?: number;
}

/**
 * Per-service circuit breaker state.
 * Tracks failures within a rolling window and gates requests when the
 * circuit is open, allowing downstream services to recover.
 */
interface CircuitState_ {
  state: CircuitState;
  failures: number;
  lastFailureTime: number;
  halfOpenSuccesses: number;
}

interface CachedResponse {
  status: number;
  headers: { 'content-type'?: string; 'cache-control'?: string };
  body: Buffer;
  cachedAt: number;
}

const MAX_CACHE_ENTRIES = 100;

/**
 * LRU-evicting in-memory store for stale proxy responses.
 * Key: `METHOD:path` (e.g. "GET:/api/risks").
 * Only successful (2xx) GET/HEAD responses are stored.
 */
class StaleResponseCache {
  private readonly entries = new Map<string, CachedResponse>();

  set(key: string, entry: CachedResponse): void {
    if (this.entries.size >= MAX_CACHE_ENTRIES) {
      const firstKey = this.entries.keys().next().value;
      if (firstKey !== undefined) this.entries.delete(firstKey);
    }
    this.entries.set(key, entry);
  }

  get(key: string, ttlMs: number): CachedResponse | null {
    const entry = this.entries.get(key);
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > ttlMs) {
      this.entries.delete(key);
      return null;
    }
    return entry;
  }

  size(): number {
    return this.entries.size;
  }
}

export interface ProxyCircuitBreaker {
  /** Express middleware — blocks requests when circuit is OPEN, serves stale cache for GET/HEAD */
  middleware: RequestHandler;
  /** Call this when the proxied request fails (network error or 5xx) */
  onFailure: () => void;
  /** Call this when the proxied request succeeds (non-5xx response) */
  onSuccess: () => void;
  /** Return current circuit state (for health/metrics endpoints) */
  getState: () => CircuitState;
  /**
   * Mount this BEFORE the proxy to populate the stale cache from live responses.
   * Intercepts res.write/end to buffer the full proxy response body; on a 2xx
   * GET/HEAD response the body is stored keyed by METHOD:path. Originals are
   * restored immediately after the response ends so no state leaks.
   *
   * Express chain: middleware → captureMiddleware → proxy
   */
  captureMiddleware: RequestHandler;
}

// Narrow type alias used only for monkey-patching res.write/end.
// Not an intersection with Response — keeps write/end as simple function types
// so originals can be restored without TypeScript complaining about overload mismatches.
type PatchFns = {
  write: (...args: unknown[]) => boolean;
  end: (...args: unknown[]) => Response;
};

/**
 * Create a circuit breaker for an HTTP proxy service.
 *
 * State machine:
 *   CLOSED → OPEN  after `failureThreshold` failures
 *   OPEN   → HALF_OPEN after `resetTimeoutMs` ms
 *   HALF_OPEN → CLOSED  after `halfOpenSuccesses` consecutive successes
 *   HALF_OPEN → OPEN    on any failure
 *
 * Usage:
 *   const cb = createProxyCircuitBreaker({ name: 'Health Safety' });
 *   // Wire failures:
 *   onProxyRes: (proxyRes) => proxyRes.statusCode >= 500 ? cb.onFailure() : cb.onSuccess()
 *   onError: () => cb.onFailure()
 *   // Mount middleware chain before the proxy:
 *   cb.middleware → cb.captureMiddleware → proxy
 */
export function createProxyCircuitBreaker(config: CircuitBreakerConfig): ProxyCircuitBreaker {
  const {
    name,
    failureThreshold = 5,
    resetTimeoutMs = 30000,
    halfOpenSuccesses: halfOpenSuccessThreshold = 2,
    staleCache: staleCacheEnabled = true,
    staleTtlMs = 120_000,
  } = config;

  const state: CircuitState_ = {
    state: 'CLOSED',
    failures: 0,
    lastFailureTime: 0,
    halfOpenSuccesses: 0,
  };

  const cache = new StaleResponseCache();

  function onFailure(): void {
    state.failures++;
    state.lastFailureTime = Date.now();
    state.halfOpenSuccesses = 0;

    if (state.state === 'HALF_OPEN' || state.failures >= failureThreshold) {
      state.state = 'OPEN';
      logger.warn(`[CircuitBreaker] ${name} OPENED after ${state.failures} failure(s)`);
    }
  }

  function onSuccess(): void {
    if (state.state === 'HALF_OPEN') {
      state.halfOpenSuccesses++;
      if (state.halfOpenSuccesses >= halfOpenSuccessThreshold) {
        state.state = 'CLOSED';
        state.failures = 0;
        state.halfOpenSuccesses = 0;
        logger.info(`[CircuitBreaker] ${name} CLOSED — service recovered`);
      }
    } else if (state.state === 'CLOSED') {
      // Reset failure counter on successful request (sliding window reset)
      state.failures = 0;
    }
  }

  function getState(): CircuitState {
    return state.state;
  }

  function cacheKey(req: Request): string {
    return `${req.method}:${req.path}`;
  }

  const captureMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
    if (!staleCacheEnabled || !['GET', 'HEAD'].includes(req.method)) {
      next();
      return;
    }

    const chunks: Buffer[] = [];
    const patchFns = res as unknown as PatchFns;
    const origWrite = patchFns.write.bind(res);
    const origEnd = patchFns.end.bind(res);

    patchFns.write = (...args: unknown[]): boolean => {
      const chunk = args[0];
      if (chunk && typeof chunk !== 'function') {
        chunks.push(Buffer.isBuffer(chunk) ? (chunk as Buffer) : Buffer.from(chunk as string));
      }
      return origWrite(...args);
    };

    patchFns.end = (...args: unknown[]): Response => {
      const chunk = args[0];
      if (chunk && typeof chunk !== 'function') {
        chunks.push(Buffer.isBuffer(chunk) ? (chunk as Buffer) : Buffer.from(chunk as string));
      }

      // Restore originals before sending so recursive end() calls are safe
      patchFns.write = origWrite;
      patchFns.end = origEnd;

      // Cache if 2xx (only after restore, so cache.set doesn't affect the send)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey(req), {
          status: res.statusCode,
          headers: {
            'content-type': res.getHeader('content-type') as string | undefined,
            'cache-control': res.getHeader('cache-control') as string | undefined,
          },
          body: Buffer.concat(chunks),
          cachedAt: Date.now(),
        });
      }

      return origEnd(...args);
    };

    next();
  };

  const middleware: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
    if (state.state === 'OPEN') {
      const elapsed = Date.now() - state.lastFailureTime;
      if (elapsed >= resetTimeoutMs) {
        // Transition to HALF_OPEN and allow one probe request through
        state.state = 'HALF_OPEN';
        logger.info(`[CircuitBreaker] ${name} HALF_OPEN — testing recovery`);
      } else {
        const retryAfterSec = Math.ceil((resetTimeoutMs - elapsed) / 1000);

        // Serve stale cached response for safe read-only methods
        if (staleCacheEnabled && ['GET', 'HEAD'].includes(req.method)) {
          const cached = cache.get(cacheKey(req), staleTtlMs);
          if (cached) {
            const ageSeconds = Math.round((Date.now() - cached.cachedAt) / 1000);
            logger.info(
              `[CircuitBreaker] ${name} OPEN — serving stale response for ${req.path} (age: ${ageSeconds}s)`
            );
            res.set('X-Cache', 'HIT-stale');
            res.set('X-Cache-Age', `${ageSeconds}s`);
            res.set('Retry-After', String(retryAfterSec));
            if (cached.headers['content-type']) {
              res.set('Content-Type', cached.headers['content-type']);
            }
            res.status(cached.status).send(cached.body);
            return;
          }
        }

        // No stale response available — standard 503
        res.set('Retry-After', String(retryAfterSec));
        res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: `${name} service is temporarily unavailable. Please retry in ${retryAfterSec}s.`,
          },
        });
        return;
      }
    }

    next();
  };

  return { middleware, onFailure, onSuccess, getState, captureMiddleware };
}
