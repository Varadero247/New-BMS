// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  RetryOptions,
  SettledResult,
  DeferredPromise,
  BatchOptions,
  CacheEntry,
} from './types';

// ---------------------------------------------------------------------------
// Core concurrency
// ---------------------------------------------------------------------------

/**
 * Resolves after `ms` milliseconds.
 */
export function delay(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

/**
 * Rejects with a TimeoutError if `promise` does not settle within `ms` ms.
 */
export function timeout<T>(promise: Promise<T>, ms: number, message?: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(message ?? `Promise timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

/**
 * Wraps an async function so it rejects if it does not resolve within `ms` ms.
 */
export function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return timeout(fn(), ms);
}

/**
 * Like `Promise.race` but resolves with `{ value, index }`.
 */
export function race<T>(promises: Promise<T>[]): Promise<{ value: T; index: number }> {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      reject(new Error('race called with empty array'));
      return;
    }
    promises.forEach((p, index) => {
      Promise.resolve(p).then(
        (value) => resolve({ value, index }),
        reject,
      );
    });
  });
}

/**
 * Resolves with the value of the first fulfilled promise (like `Promise.any`).
 */
export function any<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      reject(new AggregateError([], 'All promises were rejected'));
      return;
    }
    const errors: unknown[] = new Array(promises.length);
    let rejectedCount = 0;
    promises.forEach((p, i) => {
      Promise.resolve(p).then(resolve, (e) => {
        errors[i] = e;
        rejectedCount++;
        if (rejectedCount === promises.length) {
          reject(new AggregateError(errors, 'All promises were rejected'));
        }
      });
    });
  });
}

/**
 * Like `Promise.allSettled` but returns typed `SettledResult<T>[]`.
 */
export function allSettled<T>(promises: Promise<T>[]): Promise<SettledResult<T>[]> {
  return Promise.all(
    promises.map((p) =>
      Promise.resolve(p).then(
        (value): SettledResult<T> => ({ status: 'fulfilled', value }),
        (reason): SettledResult<T> => ({ status: 'rejected', reason }),
      ),
    ),
  );
}

// ---------------------------------------------------------------------------
// Retry
// ---------------------------------------------------------------------------

/**
 * Retry `fn` with exponential back-off and optional jitter.
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  const {
    maxAttempts,
    delayMs,
    backoffFactor = 2,
    jitter = false,
    shouldRetry,
  } = options;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts) break;
      if (shouldRetry && !shouldRetry(err, attempt)) break;
      const base = delayMs * Math.pow(backoffFactor, attempt - 1);
      const wait = jitter ? base * (0.5 + Math.random() * 0.5) : base;
      if (wait > 0) await delay(wait);
    }
  }
  throw lastError;
}

/**
 * Like `retry` but returns `fallback` instead of throwing after all retries are exhausted.
 */
export async function retryWithFallback<T>(
  fn: () => Promise<T>,
  fallback: T,
  options?: RetryOptions,
): Promise<T> {
  try {
    return await retry(fn, options ?? { maxAttempts: 3, delayMs: 0 });
  } catch {
    return fallback;
  }
}

/**
 * Simple retry shorthand — retries up to `maxAttempts` times with no delay.
 */
export function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  return retry(fn, { maxAttempts, delayMs: 0 });
}

// ---------------------------------------------------------------------------
// Concurrency limiting
// ---------------------------------------------------------------------------

/**
 * Returns a limit function that enforces at most `concurrency` concurrent executions.
 * Similar in interface to the `p-limit` package.
 */
export function pLimit<T>(concurrency: number): (fn: () => Promise<T>) => Promise<T> {
  if (concurrency < 1) throw new RangeError('concurrency must be >= 1');
  let active = 0;
  const queue: Array<() => void> = [];

  function next(): void {
    if (queue.length > 0 && active < concurrency) {
      active++;
      const run = queue.shift()!;
      run();
    }
  }

  return function limit(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const run = (): void => {
        fn().then(
          (v) => {
            resolve(v);
            active--;
            next();
          },
          (e) => {
            reject(e);
            active--;
            next();
          },
        );
      };
      if (active < concurrency) {
        active++;
        run();
      } else {
        queue.push(run);
      }
    });
  };
}

/**
 * Run an array of async functions with a maximum concurrency, returning results in order.
 */
export async function pool<T>(
  fns: Array<() => Promise<T>>,
  concurrency: number,
): Promise<T[]> {
  const results: T[] = new Array(fns.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < fns.length) {
      const i = nextIndex++;
      results[i] = await fns[i]();
    }
  }

  const workers: Promise<void>[] = [];
  const slots = Math.min(concurrency, fns.length);
  for (let i = 0; i < slots; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  return results;
}

/**
 * Async map with a concurrency limit, preserving order.
 */
export async function mapLimit<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number,
): Promise<R[]> {
  return pool(
    items.map((item) => () => fn(item)),
    concurrency,
  );
}

/**
 * Async filter with a concurrency limit, preserving order.
 */
export async function filterLimit<T>(
  items: T[],
  fn: (item: T) => Promise<boolean>,
  concurrency: number,
): Promise<T[]> {
  const flags = await mapLimit(items, fn, concurrency);
  return items.filter((_, i) => flags[i]);
}

// ---------------------------------------------------------------------------
// Deferred / control
// ---------------------------------------------------------------------------

/**
 * Returns a `DeferredPromise<T>` whose `resolve` and `reject` are externally accessible.
 */
export function deferred<T>(): DeferredPromise<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * Counting semaphore. Use `acquire()` before a critical section and `release()` after,
 * or use the `withSemaphore()` convenience wrapper.
 */
export function createSemaphore(permits: number): {
  acquire: () => Promise<void>;
  release: () => void;
  withSemaphore: <T>(fn: () => Promise<T>) => Promise<T>;
} {
  let available = permits;
  const waiters: Array<() => void> = [];

  function acquire(): Promise<void> {
    if (available > 0) {
      available--;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      waiters.push(resolve);
    });
  }

  function release(): void {
    if (waiters.length > 0) {
      const next = waiters.shift()!;
      next();
    } else {
      available++;
    }
  }

  async function withSemaphore<T>(fn: () => Promise<T>): Promise<T> {
    await acquire();
    try {
      return await fn();
    } finally {
      release();
    }
  }

  return { acquire, release, withSemaphore };
}

// ---------------------------------------------------------------------------
// Batching / throttling
// ---------------------------------------------------------------------------

/**
 * Collect individual items and flush them as a batch.
 * `fn` is called with an array of items once `maxSize` is reached or `maxWaitMs` elapses.
 */
export function batch<T, R>(
  fn: (items: T[]) => Promise<R[]>,
  options: BatchOptions,
): (item: T) => Promise<R> {
  const { maxSize, maxWaitMs } = options;
  let pending: Array<{ item: T; resolve: (r: R) => void; reject: (e: unknown) => void }> = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  function flush(): void {
    if (pending.length === 0) return;
    const batch = pending.splice(0);
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    fn(batch.map((b) => b.item)).then(
      (results) => {
        batch.forEach((b, i) => b.resolve(results[i]));
      },
      (err) => {
        batch.forEach((b) => b.reject(err));
      },
    );
  }

  return function add(item: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      pending.push({ item, resolve, reject });
      if (pending.length >= maxSize) {
        flush();
      } else if (timer === null) {
        timer = setTimeout(flush, maxWaitMs);
      }
    });
  };
}

/**
 * Debounce an async function — only the last call within `waitMs` ms is executed.
 */
export function debounceAsync<T>(fn: () => Promise<T>, waitMs: number): () => Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingResolve: ((v: T) => void) | null = null;
  let pendingReject: ((e: unknown) => void) | null = null;
  let pendingPromise: Promise<T> | null = null;

  return function debounced(): Promise<T> {
    if (timer !== null) clearTimeout(timer);

    if (pendingPromise === null) {
      pendingPromise = new Promise<T>((res, rej) => {
        pendingResolve = res;
        pendingReject = rej;
      });
    }

    timer = setTimeout(() => {
      timer = null;
      const res = pendingResolve!;
      const rej = pendingReject!;
      pendingResolve = null;
      pendingReject = null;
      pendingPromise = null;
      fn().then(res, rej);
    }, waitMs);

    return pendingPromise;
  };
}

/**
 * Throttle an async function — at most one call per `intervalMs` ms.
 * If called during the cooldown period, the same in-flight promise is returned.
 */
export function throttleAsync<T>(fn: () => Promise<T>, intervalMs: number): () => Promise<T> {
  let lastCall = 0;
  let inFlight: Promise<T> | null = null;

  return function throttled(): Promise<T> {
    const now = Date.now();
    if (inFlight !== null && now - lastCall < intervalMs) {
      return inFlight;
    }
    lastCall = now;
    inFlight = fn().finally(() => {
      inFlight = null;
    });
    return inFlight;
  };
}

// ---------------------------------------------------------------------------
// Caching
// ---------------------------------------------------------------------------

/**
 * Memoize an async function. Results are cached by JSON-serialised arguments.
 * Optionally expire cache entries after `ttlMs` milliseconds.
 */
export function memoizeAsync<T>(
  fn: (...args: unknown[]) => Promise<T>,
  ttlMs?: number,
): (...args: unknown[]) => Promise<T> {
  const cache = new Map<string, CacheEntry<T>>();

  return async function memoized(...args: unknown[]): Promise<T> {
    const key = JSON.stringify(args);
    const now = Date.now();
    const entry = cache.get(key);
    if (entry !== undefined) {
      if (entry.expiresAt === null || entry.expiresAt > now) {
        return entry.value;
      }
      cache.delete(key);
    }
    const value = await fn(...args);
    cache.set(key, {
      value,
      expiresAt: ttlMs !== undefined ? now + ttlMs : null,
    });
    return value;
  };
}

/**
 * Execute an async function only once. Subsequent calls return the same cached promise.
 */
export function once<T>(fn: () => Promise<T>): () => Promise<T> {
  let called = false;
  let result: Promise<T>;
  return function (): Promise<T> {
    if (!called) {
      called = true;
      result = fn();
    }
    return result;
  };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Type guard — returns true if `value` is a thenable (Promise-like).
 */
export function isPromise(value: unknown): value is Promise<unknown> {
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as Record<string, unknown>)['then'] === 'function'
  );
}

/**
 * Wrap `value` in a resolved promise if it is not already a promise.
 */
export function toPromise<T>(value: T | Promise<T>): Promise<T> {
  return isPromise(value) ? (value as Promise<T>) : Promise.resolve(value);
}

/**
 * Convert a Node.js error-first callback-style function to a Promise.
 * The returned function passes all provided positional args followed by the callback.
 */
export function promisify<T>(
  fn: (...args: unknown[]) => void,
): (...args: unknown[]) => Promise<T> {
  return function (...args: unknown[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      fn(...args, (err: unknown, result: T) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}
