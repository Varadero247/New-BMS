// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ---------------------------------------------------------------------------
// Lazy evaluation
// ---------------------------------------------------------------------------

export function lazy<T>(factory: () => T): { get(): T; reset(): void; isComputed(): boolean } {
  let computed = false;
  let value: T;
  return {
    get(): T {
      if (!computed) {
        value = factory();
        computed = true;
      }
      return value;
    },
    reset(): void {
      computed = false;
    },
    isComputed(): boolean {
      return computed;
    },
  };
}

export function lazyCached<T>(factory: () => T): () => T {
  let computed = false;
  let value: T;
  return function (): T {
    if (!computed) {
      value = factory();
      computed = true;
    }
    return value;
  };
}

// ---------------------------------------------------------------------------
// Deferred computation
// ---------------------------------------------------------------------------

export function defer<T>(fn: () => T, ms = 0): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (e) {
        reject(e);
      }
    }, ms);
  });
}

export function deferred<T>(): {
  promise: Promise<T>;
  resolve(v: T): void;
  reject(e: unknown): void;
} {
  let res!: (v: T) => void;
  let rej!: (e: unknown) => void;
  const promise = new Promise<T>((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  return { promise, resolve: res, reject: rej };
}

// ---------------------------------------------------------------------------
// Thunk
// ---------------------------------------------------------------------------

export function thunk<T>(value: T): () => T {
  return () => value;
}

export function force<T>(thunkOrValue: T | (() => T)): T {
  if (typeof thunkOrValue === "function") {
    return (thunkOrValue as () => T)();
  }
  return thunkOrValue;
}

// ---------------------------------------------------------------------------
// Weak cache
// ---------------------------------------------------------------------------

export function createWeakCache<K extends object, V>(): {
  get(key: K): V | undefined;
  set(key: K, v: V): void;
  has(key: K): boolean;
  delete(key: K): boolean;
} {
  const map = new WeakMap<K, V>();
  return {
    get(key: K): V | undefined {
      return map.get(key);
    },
    set(key: K, v: V): void {
      map.set(key, v);
    },
    has(key: K): boolean {
      return map.has(key);
    },
    delete(key: K): boolean {
      return map.delete(key);
    },
  };
}

// ---------------------------------------------------------------------------
// Rate limiting / batching
// ---------------------------------------------------------------------------

export function batch<T>(fn: (items: T[]) => void, maxBatchSize: number): (item: T) => void {
  let bucket: T[] = [];
  return function (item: T): void {
    bucket.push(item);
    if (bucket.length >= maxBatchSize) {
      fn(bucket.slice());
      bucket = [];
    }
  };
}

export function once<T>(fn: () => T): () => T {
  let called = false;
  let result: T;
  return function (): T {
    if (!called) {
      result = fn();
      called = true;
    }
    return result;
  };
}

export function nthCall<T>(fn: () => T, n: number): () => T | undefined {
  let count = 0;
  return function (): T | undefined {
    count += 1;
    if (count === n) {
      return fn();
    }
    return undefined;
  };
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) result.push(i);
  } else if (step < 0) {
    for (let i = start; i > end; i += step) result.push(i);
  }
  return result;
}

export function naturals(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i);
}

export function fibonacci(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];
  const result = [0, 1];
  for (let i = 2; i < count; i++) {
    result.push(result[i - 1] + result[i - 2]);
  }
  return result;
}

export function primes(count: number): number[] {
  const result: number[] = [];
  let candidate = 2;
  while (result.length < count) {
    const isPrime = result.every((p) => candidate % p !== 0);
    if (isPrime) result.push(candidate);
    candidate += 1;
  }
  return result;
}

export function repeat<T>(value: T, count: number): T[] {
  return Array.from({ length: count }, () => value);
}

export function cycle<T>(arr: T[], count: number): T[] {
  if (arr.length === 0) return [];
  return Array.from({ length: count }, (_, i) => arr[i % arr.length]);
}

export function interleave<T>(a: T[], b: T[]): T[] {
  const result: T[] = [];
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (i < a.length) result.push(a[i]);
    if (i < b.length) result.push(b[i]);
  }
  return result;
}

export function flatten<T>(arr: (T | T[])[]): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      for (const sub of item) result.push(sub);
    } else {
      result.push(item);
    }
  }
  return result;
}

export function uniqueBy<T>(arr: T[], key: (v: T) => unknown): T[] {
  const seen = new Set<unknown>();
  const result: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      result.push(item);
    }
  }
  return result;
}

export function groupConsecutive<T>(arr: T[], key: (v: T) => unknown): T[][] {
  if (arr.length === 0) return [];
  const result: T[][] = [];
  let current: T[] = [arr[0]];
  let currentKey = key(arr[0]);
  for (let i = 1; i < arr.length; i++) {
    const k = key(arr[i]);
    if (k === currentKey) {
      current.push(arr[i]);
    } else {
      result.push(current);
      current = [arr[i]];
      currentKey = k;
    }
  }
  result.push(current);
  return result;
}
