// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/**
 * sleep — resolves after `ms` milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * timeout — wraps a promise and rejects if it doesn't settle within `ms`.
 */
export function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

/**
 * retry — calls `fn` up to `maxAttempts` times, waiting `delayMs` between attempts.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number,
  delayMs = 0,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (attempt < maxAttempts && delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }
  throw lastError;
}

/**
 * parallel — runs tasks with optional concurrency limit, returns results in input order.
 */
export async function parallel<T>(
  tasks: Array<() => Promise<T>>,
  concurrency = Infinity,
): Promise<T[]> {
  if (tasks.length === 0) return [];
  const results: T[] = new Array(tasks.length);
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const limit = Math.min(concurrency, tasks.length);
  const workers = Array.from({ length: limit }, () => worker());
  await Promise.all(workers);
  return results;
}

/**
 * sequential — runs tasks one after another, returns results in order.
 */
export async function sequential<T>(tasks: Array<() => Promise<T>>): Promise<T[]> {
  const results: T[] = [];
  for (const task of tasks) {
    results.push(await task());
  }
  return results;
}

/**
 * race — runs all tasks, resolves with the first settled value (or rejects with the first error).
 */
export function race<T>(tasks: Array<() => Promise<T>>): Promise<T> {
  return Promise.race(tasks.map((t) => t()));
}

/**
 * settle — like Promise.allSettled but typed.
 */
export function settle<T>(
  promises: Promise<T>[],
): Promise<Array<{ status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown }>> {
  return Promise.allSettled(promises) as Promise<
    Array<{ status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown }>
  >;
}

/**
 * mapAsync — maps an array through an async function with optional concurrency.
 */
export function mapAsync<T, R>(
  arr: T[],
  fn: (item: T) => Promise<R>,
  concurrency = Infinity,
): Promise<R[]> {
  return parallel(arr.map((item) => () => fn(item)), concurrency);
}

/**
 * filterAsync — filters an array using an async predicate (preserves order).
 */
export async function filterAsync<T>(
  arr: T[],
  fn: (item: T) => Promise<boolean>,
): Promise<T[]> {
  const flags = await Promise.all(arr.map(fn));
  return arr.filter((_, i) => flags[i]);
}

/**
 * reduceAsync — async left-fold over an array.
 */
export async function reduceAsync<T, R>(
  arr: T[],
  fn: (acc: R, item: T) => Promise<R>,
  initial: R,
): Promise<R> {
  let acc = initial;
  for (const item of arr) {
    acc = await fn(acc, item);
  }
  return acc;
}

/**
 * defer — creates a deferred promise (resolve/reject exposed).
 */
export function defer<T>(): {
  promise: Promise<T>;
  resolve(v: T): void;
  reject(e: unknown): void;
} {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * promisify — converts a Node-style callback function into a Promise.
 */
export function promisify<T>(
  fn: (cb: (err: unknown, result: T) => void) => void,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    fn((err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/**
 * withTimeout — runs `fn`, returns `fallback` if it times out (or rethrows if no fallback given).
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  ms: number,
  fallback?: T,
): Promise<T> {
  try {
    return await timeout(fn(), ms);
  } catch (e) {
    if (fallback !== undefined) return fallback;
    throw e;
  }
}

/**
 * chunk — splits an array into chunks of `size` (synchronous, useful for batching).
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * allSettled — like settle but returns a simplified {ok, value?, error?} shape.
 */
export async function allSettled<T>(
  promises: Promise<T>[],
): Promise<Array<{ ok: boolean; value?: T; error?: unknown }>> {
  const results = await Promise.allSettled(promises);
  return results.map((r) =>
    r.status === 'fulfilled'
      ? { ok: true, value: r.value }
      : { ok: false, error: r.reason },
  );
}

/**
 * firstResolved — resolves with the first promise that fulfils (ignores rejections unless all reject).
 */
export function firstResolved<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let rejected = 0;
    let lastError: unknown;
    for (const p of promises) {
      p.then(resolve, (e) => {
        lastError = e;
        rejected++;
        if (rejected === promises.length) reject(lastError);
      });
    }
    if (promises.length === 0) reject(new Error('No promises provided'));
  });
}

/**
 * createTaskQueue — a concurrency-limited task queue.
 */
export function createTaskQueue(concurrency: number): {
  add<T>(task: () => Promise<T>): Promise<T>;
  pending(): number;
  running(): number;
} {
  let _running = 0;
  let _pending = 0;
  const queue: Array<() => void> = [];

  function schedule() {
    while (queue.length > 0 && _running < concurrency) {
      const next = queue.shift()!;
      next();
    }
  }

  function add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      _pending++;
      queue.push(() => {
        _pending--;
        _running++;
        task().then(
          (v) => { _running--; schedule(); resolve(v); },
          (e) => { _running--; schedule(); reject(e); },
        );
      });
      schedule();
    });
  }

  return {
    add,
    pending: () => _pending,
    running: () => _running,
  };
}
