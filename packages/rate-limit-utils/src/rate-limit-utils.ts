// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ── Types ──────────────────────────────────────────────────────────────────

/** Injectable clock for deterministic testing. Returns current time in ms. */
export type ClockFn = () => number;

/** Result returned by all rate limiter consume/peek operations. */
export interface RateLimitResult {
  /** Whether the request is allowed. */
  allowed: boolean;
  /** Requests remaining in the current window. */
  remaining: number;
  /** Timestamp (ms) when the limit resets. */
  resetAt: number;
  /** Milliseconds to wait before retrying (only set when not allowed). */
  retryAfter?: number;
}

// ── Internal state types ───────────────────────────────────────────────────

interface FixedWindowState {
  count: number;
  windowStart: number;
}

interface TokenBucketState {
  tokens: number;
  lastRefill: number;
}

interface LeakyBucketState {
  queue: number;
  lastLeak: number;
}

interface ConcurrencyState {
  active: number;
}

// ── Fixed Window Counter ───────────────────────────────────────────────────

/**
 * Classic fixed window rate limiter. Allows up to `limit` requests per
 * `windowMs` milliseconds. Resets at window boundaries.
 */
export class FixedWindowCounter {
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly clock: ClockFn;
  private readonly store: Map<string, FixedWindowState> = new Map();

  constructor(limit: number, windowMs: number, clock: ClockFn = Date.now) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.clock = clock;
  }

  private getState(key: string): FixedWindowState {
    const now = this.clock();
    const existing = this.store.get(key);
    if (!existing || now >= existing.windowStart + this.windowMs) {
      const state: FixedWindowState = { count: 0, windowStart: now };
      this.store.set(key, state);
      return state;
    }
    return existing;
  }

  consume(key: string, tokens = 1): RateLimitResult {
    const state = this.getState(key);
    const now = this.clock();
    const resetAt = state.windowStart + this.windowMs;

    if (state.count + tokens > this.limit) {
      return {
        allowed: false,
        remaining: Math.max(0, this.limit - state.count),
        resetAt,
        retryAfter: resetAt - now,
      };
    }

    state.count += tokens;
    return {
      allowed: true,
      remaining: this.limit - state.count,
      resetAt,
    };
  }

  peek(key: string): RateLimitResult {
    const now = this.clock();
    const existing = this.store.get(key);
    if (!existing || now >= existing.windowStart + this.windowMs) {
      return {
        allowed: true,
        remaining: this.limit,
        resetAt: now + this.windowMs,
      };
    }
    const resetAt = existing.windowStart + this.windowMs;
    const remaining = Math.max(0, this.limit - existing.count);
    return {
      allowed: existing.count < this.limit,
      remaining,
      resetAt,
      retryAfter: existing.count >= this.limit ? resetAt - now : undefined,
    };
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  stats(key: string): { count: number; windowStart: number } {
    const now = this.clock();
    const existing = this.store.get(key);
    if (!existing || now >= existing.windowStart + this.windowMs) {
      return { count: 0, windowStart: now };
    }
    return { count: existing.count, windowStart: existing.windowStart };
  }
}

// ── Sliding Window Log ─────────────────────────────────────────────────────

/**
 * Precise sliding window rate limiter. Keeps a log of request timestamps;
 * removes entries older than `windowMs`; allows if count < limit.
 */
export class SlidingWindowLog {
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly clock: ClockFn;
  private readonly store: Map<string, number[]> = new Map();

  constructor(limit: number, windowMs: number, clock: ClockFn = Date.now) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.clock = clock;
  }

  private prune(key: string): number[] {
    const now = this.clock();
    const cutoff = now - this.windowMs;
    const log = this.store.get(key) ?? [];
    const pruned = log.filter(t => t > cutoff);
    this.store.set(key, pruned);
    return pruned;
  }

  consume(key: string): RateLimitResult {
    const now = this.clock();
    const log = this.prune(key);
    const resetAt = log.length > 0 ? log[0] + this.windowMs : now + this.windowMs;

    if (log.length >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter: resetAt - now,
      };
    }

    log.push(now);
    this.store.set(key, log);
    return {
      allowed: true,
      remaining: this.limit - log.length,
      resetAt: log.length > 0 ? log[0] + this.windowMs : now + this.windowMs,
    };
  }

  peek(key: string): RateLimitResult {
    const now = this.clock();
    const cutoff = now - this.windowMs;
    const log = (this.store.get(key) ?? []).filter(t => t > cutoff);
    const resetAt = log.length > 0 ? log[0] + this.windowMs : now + this.windowMs;
    const remaining = Math.max(0, this.limit - log.length);
    return {
      allowed: log.length < this.limit,
      remaining,
      resetAt,
      retryAfter: log.length >= this.limit ? resetAt - now : undefined,
    };
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  logSize(key: string): number {
    const now = this.clock();
    const cutoff = now - this.windowMs;
    const log = this.store.get(key) ?? [];
    return log.filter(t => t > cutoff).length;
  }
}

// ── Sliding Window Counter (approximate) ──────────────────────────────────

interface SlidingWindowCounterState {
  prevCount: number;
  currCount: number;
  windowStart: number;
}

/**
 * Approximate sliding window using two fixed windows weighted by position.
 * Estimate = prevCount * (1 - elapsed/windowMs) + currCount
 */
export class SlidingWindowCounter {
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly clock: ClockFn;
  private readonly store: Map<string, SlidingWindowCounterState> = new Map();

  constructor(limit: number, windowMs: number, clock: ClockFn = Date.now) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.clock = clock;
  }

  private getState(key: string): SlidingWindowCounterState {
    const now = this.clock();
    const existing = this.store.get(key);

    if (!existing) {
      const state: SlidingWindowCounterState = { prevCount: 0, currCount: 0, windowStart: now };
      this.store.set(key, state);
      return state;
    }

    const elapsed = now - existing.windowStart;

    if (elapsed >= 2 * this.windowMs) {
      // Both windows expired
      const state: SlidingWindowCounterState = { prevCount: 0, currCount: 0, windowStart: now };
      this.store.set(key, state);
      return state;
    }

    if (elapsed >= this.windowMs) {
      // Roll to next window
      const state: SlidingWindowCounterState = {
        prevCount: existing.currCount,
        currCount: 0,
        windowStart: existing.windowStart + this.windowMs,
      };
      this.store.set(key, state);
      return state;
    }

    return existing;
  }

  private estimate(state: SlidingWindowCounterState): number {
    const now = this.clock();
    const elapsed = now - state.windowStart;
    const weight = elapsed / this.windowMs;
    return state.prevCount * (1 - weight) + state.currCount;
  }

  consume(key: string): RateLimitResult {
    const state = this.getState(key);
    const now = this.clock();
    const est = this.estimate(state);
    const resetAt = state.windowStart + this.windowMs;

    if (est >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter: resetAt - now,
      };
    }

    state.currCount += 1;
    const remaining = Math.max(0, this.limit - Math.ceil(this.estimate(state)));
    return {
      allowed: true,
      remaining,
      resetAt,
    };
  }

  peek(key: string): RateLimitResult {
    const state = this.getState(key);
    const now = this.clock();
    const est = this.estimate(state);
    const resetAt = state.windowStart + this.windowMs;
    const remaining = Math.max(0, this.limit - Math.ceil(est));
    return {
      allowed: est < this.limit,
      remaining,
      resetAt,
      retryAfter: est >= this.limit ? resetAt - now : undefined,
    };
  }

  reset(key: string): void {
    this.store.delete(key);
  }
}

// ── Token Bucket ───────────────────────────────────────────────────────────

/**
 * Token bucket rate limiter. Tokens refill continuously at `refillRate`
 * tokens per second up to `capacity`.
 */
export class TokenBucket {
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per second
  private readonly clock: ClockFn;
  private readonly store: Map<string, TokenBucketState> = new Map();
  private readonly initialTokens: number;

  constructor(opts: {
    capacity: number;
    refillRate: number;
    initialTokens?: number;
    clock?: ClockFn;
  }) {
    this.capacity = opts.capacity;
    this.refillRate = opts.refillRate;
    this.initialTokens = opts.initialTokens ?? opts.capacity;
    this.clock = opts.clock ?? Date.now;
  }

  private getState(key: string): TokenBucketState {
    if (!this.store.has(key)) {
      const state: TokenBucketState = { tokens: this.initialTokens, lastRefill: this.clock() };
      this.store.set(key, state);
      return state;
    }
    return this.store.get(key)!;
  }

  private refill(state: TokenBucketState): void {
    const now = this.clock();
    const elapsed = (now - state.lastRefill) / 1000; // seconds
    const added = elapsed * this.refillRate;
    state.tokens = Math.min(this.capacity, state.tokens + added);
    state.lastRefill = now;
  }

  consume(key: string, tokens = 1): RateLimitResult {
    const state = this.getState(key);
    this.refill(state);
    const now = this.clock();

    if (state.tokens < tokens) {
      const deficit = tokens - state.tokens;
      const waitMs = Math.ceil((deficit / this.refillRate) * 1000);
      const resetAt = now + waitMs;
      return {
        allowed: false,
        remaining: Math.floor(state.tokens),
        resetAt,
        retryAfter: waitMs,
      };
    }

    state.tokens -= tokens;
    const tokensUntilFull = this.capacity - state.tokens;
    const resetAt = tokensUntilFull > 0
      ? now + Math.ceil((tokensUntilFull / this.refillRate) * 1000)
      : now;

    return {
      allowed: true,
      remaining: Math.floor(state.tokens),
      resetAt,
    };
  }

  add(key: string, tokens: number): void {
    const state = this.getState(key);
    this.refill(state);
    state.tokens = Math.min(this.capacity, state.tokens + tokens);
  }

  peek(key: string): RateLimitResult {
    const state = this.getState(key);
    const now = this.clock();
    const elapsed = (now - state.lastRefill) / 1000;
    const currentTokens = Math.min(this.capacity, state.tokens + elapsed * this.refillRate);
    const resetAt = currentTokens < 1
      ? now + Math.ceil(((1 - currentTokens) / this.refillRate) * 1000)
      : now;

    return {
      allowed: currentTokens >= 1,
      remaining: Math.floor(currentTokens),
      resetAt,
      retryAfter: currentTokens < 1 ? resetAt - now : undefined,
    };
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  tokenCount(key: string): number {
    const state = this.getState(key);
    this.refill(state);
    return state.tokens;
  }
}

// ── Leaky Bucket ───────────────────────────────────────────────────────────

/**
 * Leaky bucket rate limiter. Queues requests and drains at `leakRate`/s.
 * Rejects new requests if the queue is full.
 */
export class LeakyBucket {
  private readonly capacity: number;
  private readonly leakRate: number; // requests per second
  private readonly clock: ClockFn;
  private readonly store: Map<string, LeakyBucketState> = new Map();

  constructor(opts: { capacity: number; leakRate: number; clock?: ClockFn }) {
    this.capacity = opts.capacity;
    this.leakRate = opts.leakRate;
    this.clock = opts.clock ?? Date.now;
  }

  private getState(key: string): LeakyBucketState {
    if (!this.store.has(key)) {
      const state: LeakyBucketState = { queue: 0, lastLeak: this.clock() };
      this.store.set(key, state);
      return state;
    }
    return this.store.get(key)!;
  }

  private leak(state: LeakyBucketState): void {
    const now = this.clock();
    const elapsed = (now - state.lastLeak) / 1000; // seconds
    const drained = Math.floor(elapsed * this.leakRate);
    state.queue = Math.max(0, state.queue - drained);
    if (drained > 0) state.lastLeak = now;
  }

  consume(key: string): RateLimitResult {
    const state = this.getState(key);
    this.leak(state);
    const now = this.clock();

    if (state.queue >= this.capacity) {
      const waitMs = Math.ceil(((state.queue - this.capacity + 1) / this.leakRate) * 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: now + waitMs,
        retryAfter: waitMs,
      };
    }

    state.queue += 1;
    const remaining = this.capacity - state.queue;
    const resetAt = now + Math.ceil((state.queue / this.leakRate) * 1000);
    return {
      allowed: true,
      remaining,
      resetAt,
    };
  }

  queueSize(key: string): number {
    const state = this.getState(key);
    this.leak(state);
    return state.queue;
  }

  reset(key: string): void {
    this.store.delete(key);
  }
}

// ── Concurrency Limiter ────────────────────────────────────────────────────

/**
 * Limits the number of concurrent in-flight requests for a given key.
 */
export class ConcurrencyLimiter {
  private readonly maxConcurrent: number;
  private readonly store: Map<string, ConcurrencyState> = new Map();

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  private getState(key: string): ConcurrencyState {
    if (!this.store.has(key)) {
      const state: ConcurrencyState = { active: 0 };
      this.store.set(key, state);
      return state;
    }
    return this.store.get(key)!;
  }

  acquire(key: string): boolean {
    const state = this.getState(key);
    if (state.active >= this.maxConcurrent) return false;
    state.active += 1;
    return true;
  }

  release(key: string): void {
    const state = this.getState(key);
    if (state.active > 0) state.active -= 1;
  }

  active(key: string): number {
    return this.getState(key).active;
  }

  reset(key: string): void {
    this.store.delete(key);
  }
}

// ── Composite Limiter (AND logic) ─────────────────────────────────────────

type Limitable = { consume(key: string): RateLimitResult };

/**
 * Combines multiple limiters with AND logic. All must allow the request.
 * Returns the most restrictive result.
 */
export class CompositeLimiter {
  private readonly limiters: Limitable[];

  constructor(...limiters: Limitable[]) {
    this.limiters = limiters;
  }

  consume(key: string): RateLimitResult {
    const results = this.limiters.map(l => l.consume(key));
    // Find the most restrictive: first check if any blocked
    const blocked = results.find(r => !r.allowed);
    if (blocked) return blocked;
    // All allowed: return result with smallest remaining
    return results.reduce((most, cur) =>
      cur.remaining < most.remaining ? cur : most
    );
  }
}

// ── Factory function ───────────────────────────────────────────────────────

/**
 * Factory function to create a rate limiter by strategy name.
 */
export function createRateLimiter(
  strategy: 'fixed' | 'sliding-log' | 'sliding-counter' | 'token-bucket',
  opts: {
    limit?: number;
    windowMs?: number;
    capacity?: number;
    refillRate?: number;
    clock?: ClockFn;
  }
): FixedWindowCounter | SlidingWindowLog | SlidingWindowCounter | TokenBucket {
  const { limit = 10, windowMs = 60000, capacity, refillRate, clock } = opts;

  switch (strategy) {
    case 'fixed':
      return new FixedWindowCounter(limit, windowMs, clock);
    case 'sliding-log':
      return new SlidingWindowLog(limit, windowMs, clock);
    case 'sliding-counter':
      return new SlidingWindowCounter(limit, windowMs, clock);
    case 'token-bucket':
      return new TokenBucket({
        capacity: capacity ?? limit,
        refillRate: refillRate ?? limit / (windowMs / 1000),
        clock,
      });
    default: {
      const _exhaustive: never = strategy;
      throw new Error(`Unknown strategy: ${_exhaustive}`);
    }
  }
}

// ── Utility functions ──────────────────────────────────────────────────────

/**
 * Returns the Retry-After header value in whole seconds, rounded up.
 */
export function retryAfterSeconds(result: RateLimitResult): number {
  if (result.allowed) return 0;
  if (result.retryAfter == null) return 0;
  return Math.ceil(result.retryAfter / 1000);
}

/**
 * Returns true if the given error represents a rate limit error.
 * Matches if err.message contains "rate limit", "too many requests", or "429".
 */
export function isRateLimitError(err: unknown): boolean {
  if (err == null) return false;
  let msg = '';
  if (err instanceof Error) {
    msg = err.message;
  } else if (typeof err === 'object' && err !== null && 'message' in err) {
    msg = String((err as Record<string, unknown>).message);
  } else if (typeof err === 'string') {
    msg = err;
  } else {
    return false;
  }
  const lower = msg.toLowerCase();
  return lower.includes('rate limit') || lower.includes('too many requests') || /\b429\b/.test(lower);
}

/**
 * Returns a throttled version of `fn` that allows at most `limitPerSecond`
 * calls per second. Extra calls within the same second window are dropped
 * (return undefined).
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limitPerSecond: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  const windowMs = 1000;
  let windowStart = Date.now();
  let count = 0;

  return function (...args: Parameters<T>): ReturnType<T> | undefined {
    const now = Date.now();
    if (now - windowStart >= windowMs) {
      windowStart = now;
      count = 0;
    }
    if (count >= limitPerSecond) return undefined;
    count += 1;
    return fn(...args) as ReturnType<T>;
  };
}

/**
 * Returns a debounced version of `fn`. Execution is delayed until `waitMs`
 * milliseconds have elapsed since the last call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, waitMs);
  };
}
