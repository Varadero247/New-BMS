// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * Deduplicate an array preserving insertion order.
 */
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/**
 * Deduplicate an array by a specific key, preserving the first occurrence.
 */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set<unknown>();
  const result: T[] = [];
  for (const item of arr) {
    const val = item[key];
    if (!seen.has(val)) {
      seen.add(val);
      result.push(item);
    }
  }
  return result;
}

/**
 * Group array elements by the value of a key into a Record.
 */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of arr) {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
  }
  return result;
}

/**
 * Split array into chunks of the given size.
 * Throws if size is less than 1.
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size < 1) throw new RangeError('chunk size must be >= 1');
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Flatten one level of nested arrays.
 */
export function flatten<T>(arr: T[][]): T[] {
  const result: T[] = [];
  for (const inner of arr) {
    for (const item of inner) {
      result.push(item);
    }
  }
  return result;
}

/**
 * Recursively flatten all levels of nested arrays.
 */
export function flattenDeep(arr: unknown[]): unknown[] {
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

/**
 * Zip two arrays into an array of pairs. Stops at the shorter array length.
 */
export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  const len = Math.min(a.length, b.length);
  const result: [A, B][] = [];
  for (let i = 0; i < len; i++) {
    result.push([a[i], b[i]]);
  }
  return result;
}

/**
 * Partition array into two groups: those matching the predicate and those that do not.
 * Returns [matching, nonMatching].
 */
export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const matching: T[] = [];
  const nonMatching: T[] = [];
  for (const item of arr) {
    if (predicate(item)) {
      matching.push(item);
    } else {
      nonMatching.push(item);
    }
  }
  return [matching, nonMatching];
}

/**
 * Return elements present in `a` but not in `b`.
 */
export function difference<T>(a: T[], b: T[]): T[] {
  const bSet = new Set(b);
  return a.filter((item) => !bSet.has(item));
}

/**
 * Return elements present in both `a` and `b`.
 */
export function intersection<T>(a: T[], b: T[]): T[] {
  const bSet = new Set(b);
  return a.filter((item) => bSet.has(item));
}

/**
 * Return unique elements from the union of `a` and `b`.
 */
export function union<T>(a: T[], b: T[]): T[] {
  return unique([...a, ...b]);
}

/**
 * Rotate array left by n positions. Negative n rotates right.
 */
export function rotate<T>(arr: T[], n: number): T[] {
  if (arr.length === 0) return [];
  const len = arr.length;
  const shift = ((n % len) + len) % len;
  return [...arr.slice(shift), ...arr.slice(0, shift)];
}

/**
 * Deterministic shuffle using a seeded LCG PRNG when seed is provided,
 * otherwise uses Math.random (non-deterministic).
 * Returns a new array without modifying the original.
 */
export function shuffle<T>(arr: T[], seed?: number): T[] {
  const copy = [...arr];
  let random: () => number;

  if (seed !== undefined) {
    // Linear Congruential Generator (LCG) for deterministic shuffles
    let s = seed >>> 0;
    random = () => {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 0x100000000;
    };
  } else {
    random = Math.random;
  }

  // Fisher-Yates shuffle
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

/**
 * Return n randomly sampled elements (without replacement).
 * If n >= arr.length, returns a shuffled copy of the whole array.
 */
export function sample<T>(arr: T[], n: number): T[] {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, Math.max(0, n));
}

/**
 * Return the first n elements.
 */
export function take<T>(arr: T[], n: number): T[] {
  return arr.slice(0, Math.max(0, n));
}

/**
 * Return all elements except the first n.
 */
export function drop<T>(arr: T[], n: number): T[] {
  return arr.slice(Math.max(0, n));
}

/**
 * Return the last n elements.
 */
export function takeRight<T>(arr: T[], n: number): T[] {
  const clamped = Math.max(0, n);
  if (clamped === 0) return [];
  return arr.slice(-clamped);
}

/**
 * Return all elements except the last n.
 */
export function dropRight<T>(arr: T[], n: number): T[] {
  const clamped = Math.max(0, n);
  if (clamped === 0) return [...arr];
  return arr.slice(0, -clamped);
}

/**
 * Remove falsy values (null, undefined, false, 0, '') from the array.
 */
export function compact<T>(arr: (T | null | undefined | false | 0 | '')[]): T[] {
  return arr.filter(Boolean) as T[];
}

/**
 * Count occurrences of each value for a given key.
 */
export function countBy<T>(arr: T[], key: keyof T): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of arr) {
    const k = String(item[key]);
    result[k] = (result[k] ?? 0) + 1;
  }
  return result;
}

/**
 * Stable sort by a key in ascending or descending order.
 */
export function sortBy<T>(arr: T[], key: keyof T, dir: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    let cmp = 0;
    if (av < bv) cmp = -1;
    else if (av > bv) cmp = 1;
    return dir === 'asc' ? cmp : -cmp;
  });
}

/**
 * Return the first element or undefined if the array is empty.
 */
export function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

/**
 * Return the last element or undefined if the array is empty.
 */
export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

/**
 * Sum all numbers in the array. Returns 0 for empty arrays.
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, n) => acc + n, 0);
}

/**
 * Compute the arithmetic average. Returns NaN for empty arrays.
 */
export function average(arr: number[]): number {
  if (arr.length === 0) return NaN;
  return sum(arr) / arr.length;
}
