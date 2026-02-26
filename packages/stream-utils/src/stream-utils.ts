// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { AsyncPredicate, AsyncMapper, AsyncReducer, StreamStats, Pipeline } from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function* _toAsyncIterable<T>(iter: AsyncIterable<T> | Iterable<T>): AsyncGenerator<T> {
  if (Symbol.asyncIterator in iter) {
    yield* iter as AsyncIterable<T>;
  } else {
    for (const item of iter as Iterable<T>) {
      yield item;
    }
  }
}

// ---------------------------------------------------------------------------
// Async iterator utilities
// ---------------------------------------------------------------------------

/**
 * Convert an array to an async iterable.
 */
export async function* fromArray<T>(arr: T[]): AsyncIterable<T> {
  for (const item of arr) {
    yield item;
  }
}

/**
 * Collect all items from an async iterable (or sync iterable) into an array.
 */
export async function toArray<T>(iter: AsyncIterable<T> | Iterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const item of _toAsyncIterable(iter)) {
    result.push(item);
  }
  return result;
}

/**
 * Map each item through a (possibly async) transform function.
 */
export async function* map<T, R>(
  iter: AsyncIterable<T>,
  fn: AsyncMapper<T, R>,
): AsyncIterable<R> {
  let index = 0;
  for await (const item of iter) {
    yield await fn(item, index++);
  }
}

/**
 * Filter items by a (possibly async) predicate.
 */
export async function* filter<T>(
  iter: AsyncIterable<T>,
  fn: AsyncPredicate<T>,
): AsyncIterable<T> {
  for await (const item of iter) {
    if (await fn(item)) {
      yield item;
    }
  }
}

/**
 * Reduce items to a single accumulated value.
 */
export async function reduce<T, R>(
  iter: AsyncIterable<T>,
  fn: AsyncReducer<T, R>,
  initial: R,
): Promise<R> {
  let acc = initial;
  for await (const item of iter) {
    acc = await fn(acc, item);
  }
  return acc;
}

/**
 * Execute a side-effect function for each item.
 */
export async function forEach<T>(
  iter: AsyncIterable<T>,
  fn: (item: T, index: number) => void | Promise<void>,
): Promise<void> {
  let index = 0;
  for await (const item of iter) {
    await fn(item, index++);
  }
}

/**
 * Yield only the first n items.
 */
export async function* take<T>(iter: AsyncIterable<T>, n: number): AsyncIterable<T> {
  if (n <= 0) return;
  let count = 0;
  for await (const item of iter) {
    yield item;
    if (++count >= n) return;
  }
}

/**
 * Skip the first n items, then yield the rest.
 */
export async function* skip<T>(iter: AsyncIterable<T>, n: number): AsyncIterable<T> {
  let skipped = 0;
  for await (const item of iter) {
    if (skipped < n) {
      skipped++;
    } else {
      yield item;
    }
  }
}

/**
 * Yield items while the predicate returns true, then stop.
 */
export async function* takeWhile<T>(
  iter: AsyncIterable<T>,
  fn: (item: T) => boolean,
): AsyncIterable<T> {
  for await (const item of iter) {
    if (!fn(item)) return;
    yield item;
  }
}

/**
 * Skip items while the predicate returns true, then yield the rest.
 */
export async function* skipWhile<T>(
  iter: AsyncIterable<T>,
  fn: (item: T) => boolean,
): AsyncIterable<T> {
  let skipping = true;
  for await (const item of iter) {
    if (skipping && fn(item)) continue;
    skipping = false;
    yield item;
  }
}

/**
 * Map each item to an async iterable or array and flatten one level.
 */
export async function* flatMap<T, R>(
  iter: AsyncIterable<T>,
  fn: (item: T) => AsyncIterable<R> | R[],
): AsyncIterable<R> {
  for await (const item of iter) {
    const inner = fn(item);
    if (Symbol.asyncIterator in inner) {
      yield* inner as AsyncIterable<R>;
    } else {
      yield* inner as R[];
    }
  }
}

/**
 * Flatten one level of nested async iterables or arrays.
 */
export async function* flatten<T>(
  iter: AsyncIterable<AsyncIterable<T> | T[]>,
): AsyncIterable<T> {
  for await (const inner of iter) {
    if (Symbol.asyncIterator in inner) {
      yield* inner as AsyncIterable<T>;
    } else {
      yield* inner as T[];
    }
  }
}

/**
 * Batch items into chunks of a given size. The last chunk may be smaller.
 */
export async function* chunk<T>(iter: AsyncIterable<T>, size: number): AsyncIterable<T[]> {
  if (size <= 0) throw new RangeError('chunk size must be > 0');
  let batch: T[] = [];
  for await (const item of iter) {
    batch.push(item);
    if (batch.length === size) {
      yield batch;
      batch = [];
    }
  }
  if (batch.length > 0) {
    yield batch;
  }
}

/**
 * Zip two async iterables into pairs. Stops when the shorter one ends.
 */
export async function* zip<A, B>(
  a: AsyncIterable<A>,
  b: AsyncIterable<B>,
): AsyncIterable<[A, B]> {
  const iterA = a[Symbol.asyncIterator]();
  const iterB = b[Symbol.asyncIterator]();
  while (true) {
    const [resA, resB] = await Promise.all([iterA.next(), iterB.next()]);
    if (resA.done || resB.done) break;
    yield [resA.value, resB.value];
  }
}

/**
 * Yield [index, item] pairs (like Python enumerate).
 */
export async function* enumerate<T>(iter: AsyncIterable<T>): AsyncIterable<[number, T]> {
  let index = 0;
  for await (const item of iter) {
    yield [index++, item];
  }
}

/**
 * Remove duplicate items. An optional key function determines identity.
 */
export async function* distinct<T>(
  iter: AsyncIterable<T>,
  keyFn?: (item: T) => unknown,
): AsyncIterable<T> {
  const seen = new Set<unknown>();
  for await (const item of iter) {
    const key = keyFn ? keyFn(item) : item;
    if (!seen.has(key)) {
      seen.add(key);
      yield item;
    }
  }
}

/**
 * Tap into a stream for side effects without modifying items.
 */
export async function* tap<T>(
  iter: AsyncIterable<T>,
  fn: (item: T) => void | Promise<void>,
): AsyncIterable<T> {
  for await (const item of iter) {
    await fn(item);
    yield item;
  }
}

/**
 * Concatenate multiple async iterables end-to-end.
 */
export async function* concat<T>(...iters: AsyncIterable<T>[]): AsyncIterable<T> {
  for (const iter of iters) {
    yield* iter;
  }
}

/**
 * Round-robin merge of multiple async iterables (interleave).
 * Pulls one item at a time from each iterable in order, skipping exhausted ones.
 */
export async function* interleave<T>(...iters: AsyncIterable<T>[]): AsyncIterable<T> {
  const iterators = iters.map((it) => it[Symbol.asyncIterator]());
  const active = new Array<boolean>(iterators.length).fill(true);

  while (active.some(Boolean)) {
    for (let i = 0; i < iterators.length; i++) {
      if (!active[i]) continue;
      const result = await iterators[i].next();
      if (result.done) {
        active[i] = false;
      } else {
        yield result.value;
      }
    }
  }
}

/**
 * Count total items in the iterable.
 */
export async function count<T>(iter: AsyncIterable<T>): Promise<number> {
  let n = 0;
  for await (const _ of iter) {
    n++;
  }
  return n;
}

/**
 * Return the first item, or undefined if empty.
 */
export async function first<T>(iter: AsyncIterable<T>): Promise<T | undefined> {
  for await (const item of iter) {
    return item;
  }
  return undefined;
}

/**
 * Return the last item, or undefined if empty.
 */
export async function last<T>(iter: AsyncIterable<T>): Promise<T | undefined> {
  let result: T | undefined;
  for await (const item of iter) {
    result = item;
  }
  return result;
}

/**
 * Return true if any item satisfies the predicate.
 */
export async function some<T>(
  iter: AsyncIterable<T>,
  fn: AsyncPredicate<T>,
): Promise<boolean> {
  for await (const item of iter) {
    if (await fn(item)) return true;
  }
  return false;
}

/**
 * Return true if every item satisfies the predicate (vacuously true for empty).
 */
export async function every<T>(
  iter: AsyncIterable<T>,
  fn: AsyncPredicate<T>,
): Promise<boolean> {
  for await (const item of iter) {
    if (!(await fn(item))) return false;
  }
  return true;
}

/**
 * Return the first item satisfying the predicate, or undefined.
 */
export async function find<T>(
  iter: AsyncIterable<T>,
  fn: AsyncPredicate<T>,
): Promise<T | undefined> {
  for await (const item of iter) {
    if (await fn(item)) return item;
  }
  return undefined;
}

/**
 * Return the minimum item according to a comparator (default: natural order for numbers/strings).
 */
export async function min<T>(
  iter: AsyncIterable<T>,
  compareFn?: (a: T, b: T) => number,
): Promise<T | undefined> {
  const cmp = compareFn ?? ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  let result: T | undefined;
  let hasValue = false;
  for await (const item of iter) {
    if (!hasValue || cmp(item, result as T) < 0) {
      result = item;
      hasValue = true;
    }
  }
  return result;
}

/**
 * Return the maximum item according to a comparator.
 */
export async function max<T>(
  iter: AsyncIterable<T>,
  compareFn?: (a: T, b: T) => number,
): Promise<T | undefined> {
  const cmp = compareFn ?? ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  let result: T | undefined;
  let hasValue = false;
  for await (const item of iter) {
    if (!hasValue || cmp(item, result as T) > 0) {
      result = item;
      hasValue = true;
    }
  }
  return result;
}

/**
 * Sum all numeric items.
 */
export async function sum(iter: AsyncIterable<number>): Promise<number> {
  let total = 0;
  for await (const n of iter) {
    total += n;
  }
  return total;
}

/**
 * Compute descriptive statistics for a numeric stream.
 */
export async function getStats(iter: AsyncIterable<number>): Promise<StreamStats> {
  let cnt = 0;
  let total = 0;
  let minVal = Infinity;
  let maxVal = -Infinity;

  for await (const n of iter) {
    cnt++;
    total += n;
    if (n < minVal) minVal = n;
    if (n > maxVal) maxVal = n;
  }

  if (cnt === 0) {
    return { count: 0, sum: 0, min: 0, max: 0, mean: 0 };
  }

  return {
    count: cnt,
    sum: total,
    min: minVal,
    max: maxVal,
    mean: total / cnt,
  };
}

// ---------------------------------------------------------------------------
// Generator utilities
// ---------------------------------------------------------------------------

/**
 * Generate numbers from start (inclusive) to end (exclusive) with optional step.
 */
export async function* range(
  start: number,
  end: number,
  step = 1,
): AsyncIterable<number> {
  if (step === 0) throw new RangeError('range step cannot be 0');
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      yield i;
    }
  } else {
    for (let i = start; i > end; i += step) {
      yield i;
    }
  }
}

/**
 * Repeat a value a fixed number of times (infinite if times is omitted).
 */
export async function* repeat<T>(value: T, times?: number): AsyncIterable<T> {
  if (times === undefined) {
    while (true) {
      yield value;
    }
  } else {
    for (let i = 0; i < times; i++) {
      yield value;
    }
  }
}

/**
 * Cycle through an array a fixed number of full cycles (infinite if times is omitted).
 */
export async function* cycle<T>(arr: T[], times?: number): AsyncIterable<T> {
  if (arr.length === 0) return;
  if (times === undefined) {
    while (true) {
      yield* arr;
    }
  } else {
    for (let t = 0; t < times; t++) {
      yield* arr;
    }
  }
}

/**
 * Generate items by calling fn(index) up to count times (infinite if count is omitted).
 */
export async function* generate<T>(
  fn: (index: number) => T | Promise<T>,
  count?: number,
): AsyncIterable<T> {
  if (count === undefined) {
    let i = 0;
    while (true) {
      yield await fn(i++);
    }
  } else {
    for (let i = 0; i < count; i++) {
      yield await fn(i);
    }
  }
}

// ---------------------------------------------------------------------------
// Pipeline builder
// ---------------------------------------------------------------------------

class PipelineImpl<T> implements Pipeline<T> {
  constructor(private readonly _source: AsyncIterable<T>) {}

  map<R>(fn: (item: T, index: number) => R | Promise<R>): Pipeline<R> {
    return new PipelineImpl<R>(map(this._source, fn));
  }

  filter(fn: (item: T) => boolean | Promise<boolean>): Pipeline<T> {
    return new PipelineImpl<T>(filter(this._source, fn));
  }

  take(n: number): Pipeline<T> {
    return new PipelineImpl<T>(take(this._source, n));
  }

  skip(n: number): Pipeline<T> {
    return new PipelineImpl<T>(skip(this._source, n));
  }

  chunk(size: number): Pipeline<T[]> {
    return new PipelineImpl<T[]>(chunk(this._source, size));
  }

  distinct(keyFn?: (item: T) => unknown): Pipeline<T> {
    return new PipelineImpl<T>(distinct(this._source, keyFn));
  }

  tap(fn: (item: T) => void | Promise<void>): Pipeline<T> {
    return new PipelineImpl<T>(tap(this._source, fn));
  }

  toArray(): Promise<T[]> {
    return toArray(this._source);
  }

  forEach(fn: (item: T, index: number) => void | Promise<void>): Promise<void> {
    return forEach(this._source, fn);
  }

  reduce<R>(fn: (acc: R, item: T) => R | Promise<R>, initial: R): Promise<R> {
    return reduce(this._source, fn, initial);
  }

  count(): Promise<number> {
    return count(this._source);
  }

  first(): Promise<T | undefined> {
    return first(this._source);
  }
}

/**
 * Create a fluent pipeline builder from an async iterable source.
 */
export function pipeline<T>(source: AsyncIterable<T>): Pipeline<T> {
  return new PipelineImpl<T>(source);
}
