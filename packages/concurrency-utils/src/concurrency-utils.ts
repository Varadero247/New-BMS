// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential.

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export async function retry<T>(fn: () => Promise<T>, attempts: number, delayMs = 0): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (e) {
      lastError = e;
      if (i < attempts - 1 && delayMs > 0) await sleep(delayMs);
    }
  }
  throw lastError;
}
export async function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timeout after " + ms + "ms")), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}
export async function parallel<T>(tasks, concurrency: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) { const i = idx++; results[i] = await tasks[i](); }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
  return results;
}
export async function sequential<T>(tasks): Promise<T[]> {
  const results: T[] = [];
  for (const task of tasks) results.push(await task());
  return results;
}
export function debounce<T extends unknown[]>(fn: (...args: T) => void, ms: number): (...args: T) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
export function throttle<T extends unknown[]>(fn: (...args: T) => void, ms: number): (...args: T) => void {
  let last = 0;
  return (...args: T) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...args); }
  };
}
export function memoize<T extends unknown[], R>(fn: (...args: T) => R): (...args: T) => R {
  const cache = new Map<string, R>();
  return (...args: T) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
export function once<T extends unknown[], R>(fn: (...args: T) => R): (...args: T) => R {
  let called = false;
  let result: R;
  return (...args: T) => {
    if (!called) { called = true; result = fn(...args); }
    return result;
  };
}
export class Semaphore {
  private count: number;
  private queue: (() => void)[] = [];

  constructor(count: number) { this.count = count; }

  async acquire(): Promise<void> {
    if (this.count > 0) { this.count--; return; }
    return new Promise(resolve => this.queue.push(resolve));
  }

  release(): void {
    if (this.queue.length > 0) { const next = this.queue.shift()!; next(); }
    else { this.count++; }
  }

  get available(): number { return this.count; }
}
export class EventQueue<T> {
  private queue: T[] = [];
  private handlers: ((item: T) => void)[] = [];

  enqueue(item: T): void {
    if (this.handlers.length > 0) {
      const handler = this.handlers.shift()!;
      handler(item);
    } else { this.queue.push(item); }
  }

  dequeue(): Promise<T> {
    if (this.queue.length > 0) return Promise.resolve(this.queue.shift()!);
    return new Promise(resolve => this.handlers.push(resolve));
  }

  get size(): number { return this.queue.length; }
  get pendingHandlers(): number { return this.handlers.length; }
}
export function createDeferred() {
  let resolve: any;
  let reject: any;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}
export async function allSettled<T>(promises: Promise<T>[]): Promise<{status: string; value?: T; reason?: unknown}[]> {
  return Promise.allSettled(promises).then(results =>
    results.map(r => r.status === "fulfilled"
      ? { status: "fulfilled" as const, value: (r as PromiseFulfilledResult<T>).value }
      : { status: "rejected" as const, reason: (r as PromiseRejectedResult).reason }
    )
  );
}
export function batch<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size));
  return batches;
}
export async function mapConcurrent<T, R>(items: T[], fn: (item: T, index: number) => Promise<R>, concurrency: number): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let idx = 0;
  async function worker() {
    while (idx < items.length) { const i = idx++; results[i] = await fn(items[i], i); }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}
