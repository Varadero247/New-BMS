// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function toSet<T>(input: Set<T> | T[]): Set<T> {
  return input instanceof Set ? input : new Set(input);
}

// ---------------------------------------------------------------------------
// Set operations
// ---------------------------------------------------------------------------

/** Returns the union of two sets / arrays. */
export function union<T>(a: Set<T> | T[], b: Set<T> | T[]): Set<T> {
  const sa = toSet(a);
  const sb = toSet(b);
  const result = new Set<T>(sa);
  for (const item of sb) result.add(item);
  return result;
}

/** Returns the intersection (elements present in both). */
export function intersection<T>(a: Set<T> | T[], b: Set<T> | T[]): Set<T> {
  const sa = toSet(a);
  const sb = toSet(b);
  const result = new Set<T>();
  for (const item of sa) {
    if (sb.has(item)) result.add(item);
  }
  return result;
}

/** Returns elements in a but not in b. */
export function difference<T>(a: Set<T> | T[], b: Set<T> | T[]): Set<T> {
  const sa = toSet(a);
  const sb = toSet(b);
  const result = new Set<T>();
  for (const item of sa) {
    if (!sb.has(item)) result.add(item);
  }
  return result;
}

/** Returns elements in exactly one of the two sets. */
export function symmetricDifference<T>(a: Set<T> | T[], b: Set<T> | T[]): Set<T> {
  const sa = toSet(a);
  const sb = toSet(b);
  const result = new Set<T>();
  for (const item of sa) {
    if (!sb.has(item)) result.add(item);
  }
  for (const item of sb) {
    if (!sa.has(item)) result.add(item);
  }
  return result;
}

/** Returns true if every element of a is in b (a ⊆ b). */
export function isSubset<T>(a: Set<T> | T[], b: Set<T> | T[]): boolean {
  const sa = toSet(a);
  const sb = toSet(b);
  for (const item of sa) {
    if (!sb.has(item)) return false;
  }
  return true;
}

/** Returns true if every element of b is in a (a ⊇ b). */
export function isSuperset<T>(a: Set<T> | T[], b: Set<T> | T[]): boolean {
  return isSubset(b, a);
}

/** Returns true if the two sets share no elements. */
export function areDisjoint<T>(a: Set<T> | T[], b: Set<T> | T[]): boolean {
  const sa = toSet(a);
  const sb = toSet(b);
  for (const item of sa) {
    if (sb.has(item)) return false;
  }
  return true;
}

/** Returns the Cartesian product of two arrays. */
export function cartesianProduct<A, B>(a: A[], b: B[]): [A, B][] {
  const result: [A, B][] = [];
  for (const ai of a) {
    for (const bi of b) {
      result.push([ai, bi]);
    }
  }
  return result;
}

/**
 * Returns all subsets of arr (power set).
 * arr.length must be ≤ 16.
 */
export function powerSet<T>(arr: T[]): T[][] {
  if (arr.length > 16) {
    throw new RangeError('powerSet: input array length must be ≤ 16');
  }
  const result: T[][] = [];
  const n = arr.length;
  const total = 1 << n; // 2^n
  for (let mask = 0; mask < total; mask++) {
    const subset: T[] = [];
    for (let bit = 0; bit < n; bit++) {
      if (mask & (1 << bit)) subset.push(arr[bit]);
    }
    result.push(subset);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Map utilities
// ---------------------------------------------------------------------------

/** Groups array items by the result of keyFn. */
export function groupBy<T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K,
): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of arr) {
    const key = keyFn(item);
    const group = map.get(key);
    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}

/** Indexes array items by the result of keyFn (last write wins on duplicate keys). */
export function indexBy<T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K,
): Map<K, T> {
  const map = new Map<K, T>();
  for (const item of arr) {
    map.set(keyFn(item), item);
  }
  return map;
}

/** Counts array items by the result of keyFn. */
export function countBy<T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K,
): Map<K, number> {
  const map = new Map<K, number>();
  for (const item of arr) {
    const key = keyFn(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

/** Transforms every value in a map, preserving keys. */
export function mapValues<K, V, R>(map: Map<K, V>, fn: (v: V, k: K) => R): Map<K, R> {
  const result = new Map<K, R>();
  for (const [k, v] of map) {
    result.set(k, fn(v, k));
  }
  return result;
}

/** Transforms every key in a map, preserving values. */
export function mapKeys<K, V, R extends string | number | symbol>(
  map: Map<K, V>,
  fn: (k: K, v: V) => R,
): Map<R, V> {
  const result = new Map<R, V>();
  for (const [k, v] of map) {
    result.set(fn(k, v), v);
  }
  return result;
}

/** Returns a new map containing only entries where predicate returns true. */
export function filterMap<K, V>(
  map: Map<K, V>,
  predicate: (v: V, k: K) => boolean,
): Map<K, V> {
  const result = new Map<K, V>();
  for (const [k, v] of map) {
    if (predicate(v, k)) result.set(k, v);
  }
  return result;
}

/** Merges two maps; conflicting keys are resolved by mergeFn. */
export function mergeWith<K, V>(
  a: Map<K, V>,
  b: Map<K, V>,
  mergeFn: (av: V, bv: V, k: K) => V,
): Map<K, V> {
  const result = new Map<K, V>(a);
  for (const [k, bv] of b) {
    if (result.has(k)) {
      result.set(k, mergeFn(result.get(k) as V, bv, k));
    } else {
      result.set(k, bv);
    }
  }
  return result;
}

/** Inverts a map so that values become keys and keys become values. */
export function invertMap<
  K extends string | number | symbol,
  V extends string | number | symbol,
>(map: Map<K, V>): Map<V, K> {
  const result = new Map<V, K>();
  for (const [k, v] of map) {
    result.set(v, k);
  }
  return result;
}

/** Creates a Map from an array of [key, value] pairs. */
export function fromEntries<K extends string | number | symbol, V>(
  entries: [K, V][],
): Map<K, V> {
  const result = new Map<K, V>();
  for (const [k, v] of entries) {
    result.set(k, v);
  }
  return result;
}

/** Converts a Map<string, V> to a plain object Record<string, V>. */
export function toObject<V>(map: Map<string, V>): Record<string, V> {
  const obj: Record<string, V> = {};
  for (const [k, v] of map) {
    obj[k] = v;
  }
  return obj;
}

// ---------------------------------------------------------------------------
// BiMap — bidirectional map
// ---------------------------------------------------------------------------

export class BiMap<K, V> {
  private readonly _forward = new Map<K, V>();
  private readonly _reverse = new Map<V, K>();

  set(key: K, value: V): this {
    // Remove stale reverse entry for the old value associated with key
    if (this._forward.has(key)) {
      const oldValue = this._forward.get(key) as V;
      this._reverse.delete(oldValue);
    }
    // Remove stale forward entry for the old key associated with value
    if (this._reverse.has(value)) {
      const oldKey = this._reverse.get(value) as K;
      this._forward.delete(oldKey);
    }
    this._forward.set(key, value);
    this._reverse.set(value, key);
    return this;
  }

  get(key: K): V | undefined {
    return this._forward.get(key);
  }

  getKey(value: V): K | undefined {
    return this._reverse.get(value);
  }

  has(key: K): boolean {
    return this._forward.has(key);
  }

  hasValue(value: V): boolean {
    return this._reverse.has(value);
  }

  delete(key: K): boolean {
    if (!this._forward.has(key)) return false;
    const value = this._forward.get(key) as V;
    this._forward.delete(key);
    this._reverse.delete(value);
    return true;
  }

  get size(): number {
    return this._forward.size;
  }

  entries(): IterableIterator<[K, V]> {
    return this._forward.entries();
  }

  keys(): IterableIterator<K> {
    return this._forward.keys();
  }

  values(): IterableIterator<V> {
    return this._forward.values();
  }
}

// ---------------------------------------------------------------------------
// MultiSet (bag)
// ---------------------------------------------------------------------------

export class MultiSet<T> {
  private readonly _counts = new Map<T, number>();
  private _total = 0;

  add(item: T, count = 1): this {
    if (count < 1) throw new RangeError('MultiSet.add: count must be ≥ 1');
    const current = this._counts.get(item) ?? 0;
    this._counts.set(item, current + count);
    this._total += count;
    return this;
  }

  /**
   * Removes `count` copies of item.
   * Returns true if at least one copy existed and was removed.
   * Removes the item entirely if the count reaches zero.
   */
  remove(item: T, count = 1): boolean {
    const current = this._counts.get(item);
    if (current === undefined || current === 0) return false;
    const removed = Math.min(count, current);
    const remaining = current - removed;
    if (remaining <= 0) {
      this._counts.delete(item);
    } else {
      this._counts.set(item, remaining);
    }
    this._total -= removed;
    return true;
  }

  count(item: T): number {
    return this._counts.get(item) ?? 0;
  }

  has(item: T): boolean {
    return (this._counts.get(item) ?? 0) > 0;
  }

  /** Total count of all items (with repetition). */
  size(): number {
    return this._total;
  }

  /** Number of distinct items. */
  uniqueSize(): number {
    return this._counts.size;
  }

  /** Flattened array — each item repeated its count number of times. */
  toArray(): T[] {
    const result: T[] = [];
    for (const [item, cnt] of this._counts) {
      for (let i = 0; i < cnt; i++) result.push(item);
    }
    return result;
  }

  entries(): [T, number][] {
    return Array.from(this._counts.entries());
  }

  /** Returns the n most common items in descending order of count. */
  mostCommon(n?: number): [T, number][] {
    const sorted = Array.from(this._counts.entries()).sort((a, b) => b[1] - a[1]);
    return n !== undefined ? sorted.slice(0, n) : sorted;
  }
}

// ---------------------------------------------------------------------------
// Array utilities
// ---------------------------------------------------------------------------

/** Splits arr into sub-arrays of at most size elements. */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size < 1) throw new RangeError('chunk: size must be ≥ 1');
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/** Flattens one level of nesting. */
export function flatten<T>(arr: (T | T[])[]): T[] {
  const result: T[] = [];
  for (const item of arr) {
    if (Array.isArray(item)) {
      for (const inner of item) result.push(inner);
    } else {
      result.push(item);
    }
  }
  return result;
}

/** Recursively flattens all levels of nesting. */
export function deepFlatten(arr: unknown[]): unknown[] {
  const result: unknown[] = [];
  function recurse(a: unknown[]): void {
    for (const item of a) {
      if (Array.isArray(item)) {
        recurse(item);
      } else {
        result.push(item);
      }
    }
  }
  recurse(arr);
  return result;
}

/** Returns a new array with duplicate values removed, optionally by key function. */
export function unique<T>(arr: T[], keyFn?: (item: T) => unknown): T[] {
  if (!keyFn) {
    return Array.from(new Set(arr));
  }
  const seen = new Set<unknown>();
  const result: T[] = [];
  for (const item of arr) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

/** Zips two arrays into pairs; stops at the shorter length. */
export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  const len = Math.min(a.length, b.length);
  const result: [A, B][] = [];
  for (let i = 0; i < len; i++) result.push([a[i], b[i]]);
  return result;
}

/** Unzips an array of pairs into two separate arrays. */
export function unzip<A, B>(pairs: [A, B][]): [A[], B[]] {
  const as: A[] = [];
  const bs: B[] = [];
  for (const [a, b] of pairs) {
    as.push(a);
    bs.push(b);
  }
  return [as, bs];
}

/** Rotates arr left by n positions (negative n rotates right). */
export function rotate<T>(arr: T[], n: number): T[] {
  if (arr.length === 0) return [];
  const len = arr.length;
  // Normalise n to [0, len)
  const shift = ((n % len) + len) % len;
  return [...arr.slice(shift), ...arr.slice(0, shift)];
}

/**
 * Produces sliding windows of the given size, advancing by step each time.
 * step defaults to 1.
 */
export function sliding<T>(arr: T[], size: number, step = 1): T[][] {
  if (size < 1) throw new RangeError('sliding: size must be ≥ 1');
  if (step < 1) throw new RangeError('sliding: step must be ≥ 1');
  const result: T[][] = [];
  for (let i = 0; i + size <= arr.length; i += step) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/** Transposes a 2-D matrix (rows become columns). */
export function transpose<T>(matrix: T[][]): T[][] {
  if (matrix.length === 0) return [];
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: T[][] = Array.from({ length: cols }, () => new Array<T>(rows));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][r] = matrix[r][c];
    }
  }
  return result;
}

/** Removes falsy values (null, undefined, false, 0, '') from an array. */
export function compact<T>(arr: (T | null | undefined | false | 0 | '')[]): T[] {
  return arr.filter(Boolean) as T[];
}

/** Splits arr into two arrays: truthy-predicate items and falsy-predicate items. */
export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  for (const item of arr) {
    if (predicate(item)) pass.push(item);
    else fail.push(item);
  }
  return [pass, fail];
}

/** Counts occurrences of each distinct value in arr. */
export function tally<T>(arr: T[]): Map<T, number> {
  const map = new Map<T, number>();
  for (const item of arr) {
    map.set(item, (map.get(item) ?? 0) + 1);
  }
  return map;
}
