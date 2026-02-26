// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepClone) as unknown as T;
  if (value instanceof Date) return new Date(value.getTime()) as unknown as T;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value as object)) result[key] = deepClone((value as Record<string,unknown>)[key]);
  return result as T;
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, (b as unknown[])[i]));
  }
  const aKeys = Object.keys(a as object), bKeys = Object.keys(b as object);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every(k => deepEqual((a as Record<string,unknown>)[k], (b as Record<string,unknown>)[k]));
}

export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  const result = deepClone(target);
  for (const src of sources) {
    for (const key of Object.keys(src as object)) {
      const tVal = (result as Record<string,unknown>)[key], sVal = (src as Record<string,unknown>)[key];
      if (tVal && sVal && typeof tVal === 'object' && typeof sVal === 'object' && !Array.isArray(tVal))
        (result as Record<string,unknown>)[key] = deepMerge(tVal as object, sVal as object);
      else if (sVal !== undefined) (result as Record<string,unknown>)[key] = deepClone(sVal);
    }
  }
  return result;
}

export function deepGet(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

export function deepSet(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]] || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {};
    cur = cur[keys[i]] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
}

export function deepDelete(obj: Record<string, unknown>, path: string): void {
  const keys = path.split('.');
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]] || typeof cur[keys[i]] !== 'object') return;
    cur = cur[keys[i]] as Record<string, unknown>;
  }
  delete cur[keys[keys.length - 1]];
}

export function deepKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return prefix ? [prefix] : [];
  const result: string[] = [];
  for (const key of Object.keys(obj as object)) {
    const full = prefix ? `${prefix}.${key}` : key;
    const val = (obj as Record<string,unknown>)[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) result.push(...deepKeys(val, full));
    else result.push(full);
  }
  return result;
}

export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') return obj;
  Object.freeze(obj);
  for (const key of Object.keys(obj as object)) deepFreeze((obj as Record<string,unknown>)[key]);
  return obj as Readonly<T>;
}

export function flatten(obj: Record<string, unknown>, sep = '.', prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const full = prefix ? `${prefix}${sep}${key}` : key;
    const val = obj[key];
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date))
      Object.assign(result, flatten(val as Record<string,unknown>, sep, full));
    else result[full] = val;
  }
  return result;
}

export function unflatten(obj: Record<string, unknown>, sep = '.'): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) deepSet(result, key.split(sep).join('.'), val);
  return result;
}
