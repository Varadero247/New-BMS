// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Confidential and proprietary information of Nexara DMCC.
// Unauthorised copying, distribution, or modification is strictly prohibited.

// ---------------------------------------------------------------------------
// Signal / computed values
// ---------------------------------------------------------------------------

export interface Signal<T> {
  get(): T;
  set(v: T): void;
  subscribe(fn: (v: T) => void): () => void;
}

export function createSignal<T>(initial: T): Signal<T> {
  let value = initial;
  const listeners: Set<(v: T) => void> = new Set();

  return {
    get(): T {
      return value;
    },
    set(v: T): void {
      value = v;
      listeners.forEach((fn) => fn(v));
    },
    subscribe(fn: (v: T) => void): () => void {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export interface Computed<T> {
  get(): T;
}

export function createComputed<T>(
  deps: Array<{ get(): unknown }>,
  fn: (...args: unknown[]) => T,
): Computed<T> {
  let cache: T = fn(...deps.map((d) => d.get()));

  return {
    get(): T {
      cache = fn(...deps.map((d) => d.get()));
      return cache;
    },
  };
}

export function createEffect(fn: () => void): () => void {
  fn();
  // Returns a no-op dispose (synchronous pull-based model)
  return () => undefined;
}

// ---------------------------------------------------------------------------
// Stream operations (synchronous pull-based)
// ---------------------------------------------------------------------------

export interface Stream<T> {
  map<R>(fn: (v: T) => R): Stream<R>;
  filter(fn: (v: T) => boolean): Stream<T>;
  take(n: number): Stream<T>;
  drop(n: number): Stream<T>;
  toArray(): T[];
}

function wrapArray<T>(arr: T[]): Stream<T> {
  return {
    map<R>(fn: (v: T) => R): Stream<R> {
      return wrapArray(arr.map(fn));
    },
    filter(fn: (v: T) => boolean): Stream<T> {
      return wrapArray(arr.filter(fn));
    },
    take(n: number): Stream<T> {
      return wrapArray(arr.slice(0, n));
    },
    drop(n: number): Stream<T> {
      return wrapArray(arr.slice(n));
    },
    toArray(): T[] {
      return arr.slice();
    },
  };
}

export function fromArray<T>(arr: T[]): Stream<T> {
  return wrapArray(arr.slice());
}

export function mapStream<T, R>(arr: T[], fn: (v: T) => R): R[] {
  return arr.map(fn);
}

export function filterStream<T>(arr: T[], fn: (v: T) => boolean): T[] {
  return arr.filter(fn);
}

export function takeStream<T>(arr: T[], n: number): T[] {
  return arr.slice(0, n);
}

export function dropStream<T>(arr: T[], n: number): T[] {
  return arr.slice(n);
}

export function scanStream<T, R>(
  arr: T[],
  fn: (acc: R, v: T) => R,
  initial: R,
): R[] {
  const result: R[] = [];
  let acc = initial;
  for (const v of arr) {
    acc = fn(acc, v);
    result.push(acc);
  }
  return result;
}

export function flatMapStream<T, R>(arr: T[], fn: (v: T) => R[]): R[] {
  const result: R[] = [];
  for (const v of arr) {
    result.push(...fn(v));
  }
  return result;
}

export function zipStream<A, B>(a: A[], b: B[]): [A, B][] {
  const len = Math.min(a.length, b.length);
  const result: [A, B][] = [];
  for (let i = 0; i < len; i++) {
    result.push([a[i], b[i]]);
  }
  return result;
}

export function mergeArrays<T>(...arrs: T[][]): T[] {
  return ([] as T[]).concat(...arrs);
}

export function distinctStream<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  return arr.filter((v) => {
    if (seen.has(v)) return false;
    seen.add(v);
    return true;
  });
}

export function chunkStream<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export function windowStream<T>(arr: T[], size: number): T[][] {
  if (size <= 0 || size > arr.length) return [];
  const result: T[][] = [];
  for (let i = 0; i <= arr.length - size; i++) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export function groupByStream<T>(
  arr: T[],
  key: (v: T) => string,
): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const v of arr) {
    const k = key(v);
    if (!result[k]) result[k] = [];
    result[k].push(v);
  }
  return result;
}

export function partitionStream<T>(
  arr: T[],
  fn: (v: T) => boolean,
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  for (const v of arr) {
    if (fn(v)) pass.push(v);
    else fail.push(v);
  }
  return [pass, fail];
}

export function reduceStream<T, R>(
  arr: T[],
  fn: (acc: R, v: T) => R,
  initial: R,
): R {
  return arr.reduce(fn, initial);
}

export function countByStream<T>(
  arr: T[],
  fn: (v: T) => string,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const v of arr) {
    const k = fn(v);
    result[k] = (result[k] ?? 0) + 1;
  }
  return result;
}

export function sumStream(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

export function maxStream(arr: number[]): number {
  if (arr.length === 0) return -Infinity;
  return Math.max(...arr);
}

export function minStream(arr: number[]): number {
  if (arr.length === 0) return Infinity;
  return Math.min(...arr);
}

export function avgStream(arr: number[]): number {
  if (arr.length === 0) return 0;
  return sumStream(arr) / arr.length;
}
