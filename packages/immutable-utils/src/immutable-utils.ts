// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// immutable-utils: Pure / immutable utility functions for objects, arrays, and Maps.

// ---------------------------------------------------------------------------
// Object operations — all return new objects, never mutate the original
// ---------------------------------------------------------------------------

/** Shallow-freeze an object and return it as Readonly<T>. */
export function freeze<T>(obj: T): Readonly<T> {
  return Object.freeze(obj);
}

/** Deep-freeze an object (recursively) and return it as Readonly<T>. */
export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') return obj;
  Object.getOwnPropertyNames(obj).forEach((name) => {
    const val = (obj as Record<string, unknown>)[name];
    if (val !== null && typeof val === 'object') {
      deepFreeze(val);
    }
  });
  return Object.freeze(obj);
}

/** Return true if the object (or primitive) is frozen. */
export function isFrozen(obj: unknown): boolean {
  if (obj === null || typeof obj !== 'object') return true;
  return Object.isFrozen(obj);
}

/** Return a new object with key set to value (original unchanged). */
export function set<T>(obj: T, key: keyof T, value: T[keyof T]): T {
  return { ...(obj as object), [key]: value } as T;
}

/** Return a new object without the given key. */
export function unset<T extends object>(obj: T, key: keyof T): Omit<T, keyof T> {
  const result = { ...obj };
  delete result[key];
  return result as Omit<T, keyof T>;
}

/** Return a new object with key updated via fn. */
export function update<T>(obj: T, key: keyof T, fn: (v: T[keyof T]) => T[keyof T]): T {
  return set(obj, key, fn(obj[key]));
}

/** Set a deeply nested value via path (returns a new object). */
export function setIn<T>(obj: T, path: string[], value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...tail] = path;
  const current = (obj as Record<string, unknown>)[head];
  const next =
    tail.length === 0
      ? value
      : setIn(
          current !== null && typeof current === 'object' ? current : {},
          tail,
          value,
        );
  return { ...(obj as Record<string, unknown>), [head]: next } as T;
}

/** Get a deeply nested value via path (returns undefined if missing). */
export function getIn<T>(obj: T, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/** Delete a deeply nested key via path (returns a new object). */
export function deleteIn<T>(obj: T, path: string[]): T {
  if (path.length === 0) return obj;
  if (path.length === 1) {
    const result = { ...(obj as Record<string, unknown>) };
    delete result[path[0]];
    return result as T;
  }
  const [head, ...tail] = path;
  const child = (obj as Record<string, unknown>)[head];
  const newChild =
    child !== null && typeof child === 'object'
      ? deleteIn(child, tail)
      : child;
  return { ...(obj as Record<string, unknown>), [head]: newChild } as T;
}

/** Shallow merge: spread sources into a new object. */
export function merge<T extends object>(a: T, ...sources: Partial<T>[]): T {
  return Object.assign({}, a, ...sources) as T;
}

/** Deep merge two objects (second wins on conflict at leaf level). */
export function mergeDeep<T extends object>(a: T, b: Partial<T>): T {
  const result: Record<string, unknown> = { ...(a as Record<string, unknown>) };
  for (const key of Object.keys(b) as (keyof T)[]) {
    const aVal = (a as Record<string, unknown>)[key as string];
    const bVal = (b as Record<string, unknown>)[key as string];
    if (
      bVal !== null &&
      typeof bVal === 'object' &&
      !Array.isArray(bVal) &&
      aVal !== null &&
      typeof aVal === 'object' &&
      !Array.isArray(aVal)
    ) {
      result[key as string] = mergeDeep(
        aVal as Record<string, unknown>,
        bVal as Record<string, unknown>,
      );
    } else {
      result[key as string] = bVal;
    }
  }
  return result as T;
}

/** Return a new object with only the specified keys. */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

/** Return a new object without the specified keys. */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) delete result[key];
  return result as Omit<T, K>;
}

// ---------------------------------------------------------------------------
// Array operations — return new arrays, originals are never mutated
// ---------------------------------------------------------------------------

/** Append items to a new array. */
export function push<T>(arr: T[], ...items: T[]): T[] {
  return [...arr, ...items];
}

/** Remove the last element and return the new shorter array. */
export function pop<T>(arr: T[]): T[] {
  return arr.slice(0, arr.length - 1);
}

/** Remove the first element and return the new shorter array. */
export function shift<T>(arr: T[]): T[] {
  return arr.slice(1);
}

/** Prepend items and return a new array. */
export function unshift<T>(arr: T[], ...items: T[]): T[] {
  return [...items, ...arr];
}

/** Immutable equivalent of Array.prototype.splice. */
export function splice<T>(
  arr: T[],
  start: number,
  deleteCount?: number,
  ...items: T[]
): T[] {
  const result = [...arr];
  if (deleteCount === undefined) {
    result.splice(start);
  } else {
    result.splice(start, deleteCount, ...items);
  }
  return result;
}

/** Insert an item at the given index. */
export function insertAt<T>(arr: T[], index: number, item: T): T[] {
  return splice(arr, index, 0, item);
}

/** Remove the element at the given index. */
export function removeAt<T>(arr: T[], index: number): T[] {
  return splice(arr, index, 1);
}

/** Return a new array with element at index updated by fn. */
export function updateAt<T>(arr: T[], index: number, fn: (v: T) => T): T[] {
  return arr.map((v, i) => (i === index ? fn(v) : v));
}

/** Return a new array with element at index replaced by value. */
export function setAt<T>(arr: T[], index: number, value: T): T[] {
  return arr.map((v, i) => (i === index ? value : v));
}

/** Return a reversed copy of the array. */
export function reverse<T>(arr: T[]): T[] {
  return [...arr].reverse();
}

/** Return a sorted copy of the array. */
export function sort<T>(arr: T[], compareFn?: (a: T, b: T) => number): T[] {
  return [...arr].sort(compareFn);
}

/** Move element from index `from` to index `to`. */
export function move<T>(arr: T[], from: number, to: number): T[] {
  if (from === to) return [...arr];
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

/** Swap two elements at indices i and j. */
export function swap<T>(arr: T[], i: number, j: number): T[] {
  if (i === j) return [...arr];
  const result = [...arr];
  [result[i], result[j]] = [result[j], result[i]];
  return result;
}

// ---------------------------------------------------------------------------
// Map operations — return new Maps, originals are never mutated
// ---------------------------------------------------------------------------

/** Return a new Map with the key set to value. */
export function setKey<K, V>(map: Map<K, V>, key: K, value: V): Map<K, V> {
  return new Map(map).set(key, value);
}

/** Return a new Map without the given key. */
export function deleteKey<K, V>(map: Map<K, V>, key: K): Map<K, V> {
  const result = new Map(map);
  result.delete(key);
  return result;
}

/** Merge two Maps; entries in b overwrite entries in a. */
export function mergeMap<K, V>(a: Map<K, V>, b: Map<K, V>): Map<K, V> {
  return new Map([...a, ...b]);
}
