// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;
export type Primitive = string | number | boolean | null | undefined;
export type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };
export type DeepPartial<T> = { [K in keyof T]?: DeepPartial<T[K]> };

export function isString(value: unknown): value is string { return typeof value === 'string'; }
export function isNumber(value: unknown): value is number { return typeof value === 'number' && !isNaN(value); }
export function isBoolean(value: unknown): value is boolean { return typeof value === 'boolean'; }
export function isNull(value: unknown): value is null { return value === null; }
export function isUndefined(value: unknown): value is undefined { return value === undefined; }
export function isNullish(value: unknown): value is null | undefined { return value === null || value === undefined; }
export function isDefined<T>(value: T | null | undefined): value is T { return value !== null && value !== undefined; }
export function isObject(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
export function isArray(value: unknown): value is unknown[] { return Array.isArray(value); }
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown { return typeof value === 'function'; }
export function isSymbol(value: unknown): value is symbol { return typeof value === 'symbol'; }
export function isBigInt(value: unknown): value is bigint { return typeof value === 'bigint'; }
export function isPrimitive(value: unknown): value is Primitive {
  return value === null || ['string','number','boolean','undefined'].includes(typeof value);
}
export function isInteger(value: unknown): value is number { return Number.isInteger(value); }
export function isFloat(value: unknown): value is number { return typeof value === 'number' && !Number.isInteger(value); }
export function isNaN(value: unknown): boolean { return typeof value === 'number' && Number.isNaN(value); }
export function isFinite(value: unknown): value is number { return typeof value === 'number' && Number.isFinite(value); }
export function isInfinity(value: unknown): boolean { return value === Infinity || value === -Infinity; }
export function isDate(value: unknown): value is Date { return value instanceof Date && !Number.isNaN(value.getTime()); }
export function isRegex(value: unknown): value is RegExp { return value instanceof RegExp; }
export function isError(value: unknown): value is Error { return value instanceof Error; }
export function isPromise(value: unknown): value is Promise<unknown> { return value instanceof Promise || (isObject(value) && isFunction((value as Record<string,unknown>).then)); }
export function isIterable(value: unknown): value is Iterable<unknown> { return isObject(value) && isFunction((value as Record<string,unknown>)[Symbol.iterator]); }

export function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
}

export function toString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true','1','yes','on'].includes(value.toLowerCase());
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

export function coerce<T>(value: unknown, type: 'string' | 'number' | 'boolean'): T {
  if (type === 'string') return toString(value) as T;
  if (type === 'number') return toNumber(value) as T;
  if (type === 'boolean') return toBoolean(value) as T;
  return value as T;
}

export function getType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  if (value instanceof RegExp) return 'regexp';
  if (value instanceof Error) return 'error';
  return typeof value;
}

export function assertDefined<T>(value: T | null | undefined, message?: string): T {
  if (value === null || value === undefined) throw new Error(message ?? 'Expected defined value');
  return value;
}

export function assertString(value: unknown, message?: string): string {
  if (!isString(value)) throw new Error(message ?? `Expected string, got ${typeof value}`);
  return value;
}

export function assertNumber(value: unknown, message?: string): number {
  if (!isNumber(value)) throw new Error(message ?? `Expected number, got ${typeof value}`);
  return value;
}

export function narrowType<T>(
  value: unknown,
  guard: (v: unknown) => v is T,
  fallback: T
): T {
  return guard(value) ? value : fallback;
}

export function pickKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) if (key in obj) result[key] = obj[key];
  return result;
}

export function omitKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) delete (result as Record<string, unknown>)[key as string];
  return result as Omit<T, K>;
}
