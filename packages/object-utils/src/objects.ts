// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * Pick specified keys from an object.
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specified keys from an object.
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj } as T;
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

/**
 * Deep merge sources into target. Arrays are replaced, not concatenated.
 */
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  const output = { ...target } as Record<string, unknown>;
  for (const source of sources) {
    if (source == null) continue;
    for (const key of Object.keys(source) as (keyof typeof source)[]) {
      const srcVal = source[key];
      const tgtVal = output[key as string];
      if (
        srcVal !== null &&
        typeof srcVal === 'object' &&
        !Array.isArray(srcVal) &&
        tgtVal !== null &&
        typeof tgtVal === 'object' &&
        !Array.isArray(tgtVal)
      ) {
        output[key as string] = deepMerge(
          tgtVal as Record<string, unknown>,
          srcVal as Record<string, unknown>
        );
      } else {
        output[key as string] = srcVal;
      }
    }
  }
  return output as T;
}

/**
 * Deep clone an object via JSON serialisation.
 * Note: functions, undefined values, and symbols are not cloned.
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * Deep equality check between two values.
 */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;

  const aArr = Array.isArray(a);
  const bArr = Array.isArray(b);
  if (aArr !== bArr) return false;

  if (aArr && bArr) {
    const aA = a as unknown[];
    const bA = b as unknown[];
    if (aA.length !== bA.length) return false;
    for (let i = 0; i < aA.length; i++) {
      if (!deepEqual(aA[i], bA[i])) return false;
    }
    return true;
  }

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(bObj, k)) return false;
    if (!deepEqual(aObj[k], bObj[k])) return false;
  }
  return true;
}

/**
 * Get a nested value by dot-path (e.g. 'a.b.c').
 * Returns defaultValue if the path does not exist.
 */
export function getPath(obj: unknown, path: string, defaultValue?: unknown): unknown {
  if (path === '') return obj;
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current === undefined ? defaultValue : current;
}

/**
 * Set a nested value by dot-path. Intermediate objects are created as needed.
 */
export function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (
      current[part] === null ||
      current[part] === undefined ||
      typeof current[part] !== 'object'
    ) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]] = value;
}

/**
 * Delete a nested value by dot-path.
 * Returns true if the key existed and was deleted, false otherwise.
 */
export function deletePath(obj: Record<string, unknown>, path: string): boolean {
  const parts = path.split('.');
  let current: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (
      current[part] === null ||
      current[part] === undefined ||
      typeof current[part] !== 'object'
    ) {
      return false;
    }
    current = current[part] as Record<string, unknown>;
  }
  const last = parts[parts.length - 1];
  if (!Object.prototype.hasOwnProperty.call(current, last)) return false;
  delete current[last];
  return true;
}

/**
 * Return a diff of two flat-or-nested records.
 * Only returns keys whose values differ (shallow comparison of leaf values).
 */
export function diff(
  a: Record<string, unknown>,
  b: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const result: Record<string, { from: unknown; to: unknown }> = {};
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of allKeys) {
    const aVal = a[key];
    const bVal = b[key];
    if (!deepEqual(aVal, bVal)) {
      result[key] = { from: aVal, to: bVal };
    }
  }
  return result;
}

/**
 * Flatten a nested object to dot-notation keys.
 * e.g. { a: { b: 1 } } → { 'a.b': 1 }
 */
export function flatten(
  obj: Record<string, unknown>,
  separator = '.'
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  function recurse(current: unknown, prefix: string): void {
    if (
      current !== null &&
      typeof current === 'object' &&
      !Array.isArray(current) &&
      Object.keys(current as object).length > 0
    ) {
      for (const [k, v] of Object.entries(current as Record<string, unknown>)) {
        const newKey = prefix ? `${prefix}${separator}${k}` : k;
        recurse(v, newKey);
      }
    } else {
      result[prefix] = current;
    }
  }

  recurse(obj, '');
  return result;
}

/**
 * Reverse flatten: convert dot-notation keys back to a nested object.
 */
export function unflatten(
  obj: Record<string, unknown>,
  separator = '.'
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    setPath(result, separator === '.' ? key : key.split(separator).join('.'), value);
  }
  return result;
}

/**
 * Returns true if the object has no own enumerable keys.
 */
export function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Typed Object.keys.
 */
export function keys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[];
}

/**
 * Typed Object.values.
 */
export function values<T extends object>(obj: T): T[keyof T][] {
  return Object.values(obj) as T[keyof T][];
}

/**
 * Typed Object.entries.
 */
export function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
}

/**
 * Map over object values, returning a new object with the same keys.
 */
export function mapValues<T extends object, R>(
  obj: T,
  fn: (v: T[keyof T], k: keyof T) => R
): Record<keyof T, R> {
  const result = {} as Record<keyof T, R>;
  for (const [k, v] of entries(obj)) {
    result[k] = fn(v, k);
  }
  return result;
}

/**
 * Filter an object's keys by a predicate, returning a Partial<T>.
 */
export function filterKeys<T extends object>(
  obj: T,
  predicate: (k: keyof T) => boolean
): Partial<T> {
  const result: Partial<T> = {};
  for (const k of keys(obj)) {
    if (predicate(k)) {
      result[k] = obj[k];
    }
  }
  return result;
}

/**
 * Swap keys and values of a string record.
 */
export function invert(obj: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    result[v] = k;
  }
  return result;
}

/**
 * Shallow merge (Object.assign style). b properties overwrite a.
 */
export function merge<T extends object>(a: T, b: Partial<T>): T {
  return Object.assign({}, a, b);
}

/**
 * Type-safe key membership check.
 */
export function hasKey<T extends object>(obj: T, key: string): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
