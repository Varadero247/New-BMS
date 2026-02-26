// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  ConfigValue,
  ConfigSchema,
  ConfigField,
  ParsedEnv,
  ConfigError,
  DeepPartial,
  ConfigChangeEvent,
} from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return (value.map(deepClone) as unknown) as T;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value as Record<string, unknown>)) {
    out[key] = deepClone((value as Record<string, unknown>)[key]);
  }
  return out as T;
}

function getChangedPaths(a: object, b: object, prefix = ''): string[] {
  const paths: string[] = [];
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const allKeys = new Set([...Object.keys(aObj), ...Object.keys(bObj)]);
  for (const key of allKeys) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const aVal = aObj[key];
    const bVal = bObj[key];
    if (isPlainObject(aVal) && isPlainObject(bVal)) {
      paths.push(...getChangedPaths(aVal, bVal, fullKey));
    } else if (!deepEqual(aVal, bVal)) {
      paths.push(fullKey);
    }
  }
  return paths;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => deepEqual(v, (b as unknown[])[i]));
  }
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((k) => deepEqual(aObj[k], bObj[k]));
}

// ---------------------------------------------------------------------------
// Environment variable parsing
// ---------------------------------------------------------------------------

/**
 * Parse a process.env-like object and return a typed accessor wrapper.
 */
export function parseEnv(env: Record<string, string | undefined>): ParsedEnv {
  const raw = { ...env };
  return {
    raw,
    getString(key, defaultValue) {
      return getEnvString(raw, key, defaultValue);
    },
    getNumber(key, defaultValue) {
      return getEnvNumber(raw, key, defaultValue);
    },
    getBoolean(key, defaultValue) {
      return getEnvBoolean(raw, key, defaultValue);
    },
    getArray(key, separator, defaultValue) {
      return getEnvArray(raw, key, separator, defaultValue);
    },
    getJson<T>(key: string, defaultValue?: T): T {
      return getEnvJson<T>(raw, key, defaultValue);
    },
    require(keys) {
      requireEnv(raw, keys);
    },
    has(key) {
      return raw[key] !== undefined && raw[key] !== '';
    },
    keys() {
      return Object.keys(raw).filter((k) => raw[k] !== undefined);
    },
  };
}

/**
 * Get a string value from an env object, with optional default.
 */
export function getEnvString(
  env: Record<string, string | undefined>,
  key: string,
  defaultValue?: string,
): string {
  const val = env[key];
  if (val !== undefined && val !== '') return val;
  if (defaultValue !== undefined) return defaultValue;
  return '';
}

/**
 * Get a numeric value from an env object, with optional default.
 * Returns NaN if the value cannot be parsed and no default is provided.
 */
export function getEnvNumber(
  env: Record<string, string | undefined>,
  key: string,
  defaultValue?: number,
): number {
  const val = env[key];
  if (val !== undefined && val !== '') {
    const num = Number(val);
    if (!isNaN(num)) return num;
  }
  if (defaultValue !== undefined) return defaultValue;
  return NaN;
}

/**
 * Get a boolean value from an env object.
 * Truthy strings: '1', 'true', 'yes', 'on' (case-insensitive).
 */
export function getEnvBoolean(
  env: Record<string, string | undefined>,
  key: string,
  defaultValue?: boolean,
): boolean {
  const val = env[key];
  if (val !== undefined && val !== '') {
    const lower = val.toLowerCase().trim();
    if (['1', 'true', 'yes', 'on'].includes(lower)) return true;
    if (['0', 'false', 'no', 'off'].includes(lower)) return false;
  }
  if (defaultValue !== undefined) return defaultValue;
  return false;
}

/**
 * Get an array of strings from an env object by splitting on a separator.
 */
export function getEnvArray(
  env: Record<string, string | undefined>,
  key: string,
  separator = ',',
  defaultValue: string[] = [],
): string[] {
  const val = env[key];
  if (val !== undefined && val !== '') {
    return val.split(separator).map((s) => s.trim()).filter((s) => s.length > 0);
  }
  return defaultValue;
}

/**
 * Get a JSON-parsed value from an env object.
 */
export function getEnvJson<T>(
  env: Record<string, string | undefined>,
  key: string,
  defaultValue?: T,
): T {
  const val = env[key];
  if (val !== undefined && val !== '') {
    try {
      return JSON.parse(val) as T;
    } catch {
      // fall through to default
    }
  }
  if (defaultValue !== undefined) return defaultValue;
  throw new Error(`[ConfigError] Missing or invalid JSON for env key: ${key}`);
}

/**
 * Throw a ConfigError if any of the required env keys are missing or empty.
 */
export function requireEnv(
  env: Record<string, string | undefined>,
  keys: string[],
): void {
  const missing = keys.filter((k) => env[k] === undefined || env[k] === '');
  if (missing.length > 0) {
    throw Object.assign(
      new Error(`[ConfigError] Missing required environment variables: ${missing.join(', ')}`),
      { code: 'MISSING_ENV', fields: missing } as { code: string; fields: string[] },
    );
  }
}

/**
 * Parse a .env file content string into a key-value map.
 * Supports: comments (#), quoted values (single/double), inline \n escapes.
 */
export function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and comments
    if (!line || line.startsWith('#')) continue;

    // Must contain =
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;

    const key = line.slice(0, eqIdx).trim();
    if (!key) continue;

    let rawValue = line.slice(eqIdx + 1);

    // Determine quoting
    const firstChar = rawValue[0];
    if (firstChar === '"' || firstChar === "'") {
      const quote = firstChar;
      const endIdx = rawValue.indexOf(quote, 1);
      if (endIdx !== -1) {
        rawValue = rawValue.slice(1, endIdx);
      } else {
        rawValue = rawValue.slice(1);
      }
      // Replace literal \n escapes inside double-quoted values
      if (quote === '"') {
        rawValue = rawValue.replace(/\\n/g, '\n');
      }
    } else {
      // Strip inline comment
      const commentIdx = rawValue.indexOf(' #');
      if (commentIdx !== -1) {
        rawValue = rawValue.slice(0, commentIdx);
      }
      rawValue = rawValue.trim();
    }

    result[key] = rawValue;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Config merging / deep merge
// ---------------------------------------------------------------------------

/**
 * Deep-merge one or more override objects onto a base. Arrays are replaced (not merged).
 */
export function deepMerge<T extends object>(base: T, ...overrides: DeepPartial<T>[]): T {
  let result = deepClone(base);
  for (const override of overrides) {
    result = mergeTwoObjects(result, override) as T;
  }
  return result;
}

function mergeTwoObjects<T>(base: T, override: DeepPartial<T>): T {
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return (override !== undefined ? override : base) as T;
  }
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(override as Record<string, unknown>)) {
    const bVal = (base as Record<string, unknown>)[key];
    const oVal = (override as Record<string, unknown>)[key];
    if (oVal === undefined) continue;
    if (isPlainObject(bVal) && isPlainObject(oVal)) {
      result[key] = mergeTwoObjects(bVal, oVal);
    } else {
      result[key] = deepClone(oVal);
    }
  }
  return result as T;
}

/**
 * Deep-merge an array of partial configs into a single config.
 */
export function deepMergeAll<T extends object>(configs: DeepPartial<T>[]): T {
  if (configs.length === 0) return {} as T;
  const [first, ...rest] = configs;
  return deepMerge(first as T, ...rest);
}

/**
 * Return a new object containing only the specified keys.
 */
export function pick<T extends object, K extends keyof T>(
  config: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in config) {
      result[key] = config[key];
    }
  }
  return result;
}

/**
 * Return a new object with the specified keys removed.
 */
export function omit<T extends object, K extends keyof T>(
  config: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...config } as Record<string, unknown>;
  for (const key of keys) {
    delete result[key as string];
  }
  return result as Omit<T, K>;
}

/**
 * Flatten a nested config object to dot-notation keys.
 */
export function flatten(
  config: object,
  prefix = '',
  separator = '.',
): Record<string, ConfigValue> {
  const result: Record<string, ConfigValue> = {};

  function recurse(obj: object, currentPrefix: string): void {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = currentPrefix ? `${currentPrefix}${separator}${key}` : key;
      if (isPlainObject(value)) {
        recurse(value, fullKey);
      } else {
        result[fullKey] = value as ConfigValue;
      }
    }
  }

  recurse(config, prefix);
  return result;
}

/**
 * Unflatten dot-notation keys back into a nested object.
 */
export function unflatten(
  flat: Record<string, ConfigValue>,
  separator = '.',
): object {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(separator);
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!isPlainObject(current[part])) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = value;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

/**
 * Validate a config object against a schema definition.
 * Returns validation result with any errors and the (possibly coerced) value.
 */
export function validateConfig<T>(
  config: unknown,
  schema: ConfigSchema,
): { valid: boolean; errors: ConfigError[]; value: T } {
  const errors: ConfigError[] = [];
  const value: Record<string, unknown> = {};

  if (!isPlainObject(config)) {
    errors.push({ field: '__root__', message: 'Config must be a plain object', code: 'INVALID_TYPE' });
    return { valid: false, errors, value: value as T };
  }

  const configObj = config as Record<string, unknown>;

  for (const [field, fieldDef] of Object.entries(schema)) {
    const rawVal = configObj[field];

    // Check required
    if (rawVal === undefined || rawVal === null) {
      if (fieldDef.required) {
        errors.push({ field, message: `Field '${field}' is required`, code: 'REQUIRED' });
        continue;
      }
      // Use default if present
      if (fieldDef.default !== undefined) {
        value[field] = fieldDef.default;
      }
      continue;
    }

    // Type check
    const typeError = checkType(field, rawVal, fieldDef);
    if (typeError) {
      errors.push(typeError);
      continue;
    }

    // Range checks for numbers
    if (fieldDef.type === 'number' && typeof rawVal === 'number') {
      if (fieldDef.min !== undefined && rawVal < fieldDef.min) {
        errors.push({ field, message: `Field '${field}' must be >= ${fieldDef.min}`, code: 'MIN_VALUE' });
        continue;
      }
      if (fieldDef.max !== undefined && rawVal > fieldDef.max) {
        errors.push({ field, message: `Field '${field}' must be <= ${fieldDef.max}`, code: 'MAX_VALUE' });
        continue;
      }
    }

    // String length checks (reusing min/max as min/max length)
    if (fieldDef.type === 'string' && typeof rawVal === 'string') {
      if (fieldDef.min !== undefined && rawVal.length < fieldDef.min) {
        errors.push({ field, message: `Field '${field}' must have length >= ${fieldDef.min}`, code: 'MIN_LENGTH' });
        continue;
      }
      if (fieldDef.max !== undefined && rawVal.length > fieldDef.max) {
        errors.push({ field, message: `Field '${field}' must have length <= ${fieldDef.max}`, code: 'MAX_LENGTH' });
        continue;
      }
    }

    // Enum check
    if (fieldDef.enum !== undefined) {
      const enumVals = fieldDef.enum as ConfigValue[];
      if (!enumVals.some((e) => deepEqual(e, rawVal as ConfigValue))) {
        errors.push({
          field,
          message: `Field '${field}' must be one of: ${enumVals.join(', ')}`,
          code: 'INVALID_ENUM',
        });
        continue;
      }
    }

    value[field] = rawVal;
  }

  // Copy over fields not in schema
  for (const key of Object.keys(configObj)) {
    if (!(key in schema) && value[key] === undefined) {
      value[key] = configObj[key];
    }
  }

  return { valid: errors.length === 0, errors, value: value as T };
}

function checkType(field: string, value: unknown, fieldDef: ConfigField): ConfigError | null {
  switch (fieldDef.type) {
    case 'string':
      if (typeof value !== 'string') {
        return { field, message: `Field '${field}' must be a string`, code: 'INVALID_TYPE' };
      }
      break;
    case 'number':
      if (typeof value !== 'number') {
        return { field, message: `Field '${field}' must be a number`, code: 'INVALID_TYPE' };
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        return { field, message: `Field '${field}' must be a boolean`, code: 'INVALID_TYPE' };
      }
      break;
    case 'array':
      if (!Array.isArray(value)) {
        return { field, message: `Field '${field}' must be an array`, code: 'INVALID_TYPE' };
      }
      break;
    case 'object':
      if (!isPlainObject(value)) {
        return { field, message: `Field '${field}' must be an object`, code: 'INVALID_TYPE' };
      }
      break;
  }
  return null;
}

/**
 * Apply schema defaults to a partial config, returning a complete config.
 */
export function applyDefaults<T>(config: DeepPartial<T>, schema: ConfigSchema): T {
  const result: Record<string, unknown> = { ...(config as Record<string, unknown>) };

  for (const [field, fieldDef] of Object.entries(schema)) {
    if ((result[field] === undefined || result[field] === null) && fieldDef.default !== undefined) {
      result[field] = fieldDef.default;
    }
  }

  return result as T;
}

// ---------------------------------------------------------------------------
// Config store class
// ---------------------------------------------------------------------------

export class ConfigStore<T extends object> {
  private _current: T;
  private readonly _initial: T;
  private _listeners: Array<(event: ConfigChangeEvent<T>) => void> = [];

  constructor(initial: T) {
    this._initial = deepClone(initial);
    this._current = deepClone(initial);
  }

  /** Get the current config state. */
  get(): T {
    return deepClone(this._current);
  }

  /** Merge updates into the current config and notify listeners. */
  set(updates: DeepPartial<T>): void {
    const previous = deepClone(this._current);
    this._current = deepMerge(this._current, updates);
    const changedPaths = getChangedPaths(previous, this._current);
    if (changedPaths.length > 0) {
      const event: ConfigChangeEvent<T> = {
        previous,
        current: deepClone(this._current),
        changedPaths,
        timestamp: Date.now(),
      };
      for (const listener of this._listeners) {
        listener(event);
      }
    }
  }

  /** Get a value at a dot-notation path. */
  getPath<V>(path: string): V | undefined {
    const parts = path.split('.');
    let current: unknown = this._current;
    for (const part of parts) {
      if (!isPlainObject(current)) return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    return current as V | undefined;
  }

  /** Set a value at a dot-notation path. */
  setPath(path: string, value: unknown): void {
    const parts = path.split('.');
    if (parts.length === 0) return;

    const buildNested = (remainingParts: string[], val: unknown): DeepPartial<T> => {
      if (remainingParts.length === 1) {
        return { [remainingParts[0]]: val } as DeepPartial<T>;
      }
      return { [remainingParts[0]]: buildNested(remainingParts.slice(1), val) } as DeepPartial<T>;
    };

    this.set(buildNested(parts, value));
  }

  /** Reset the config to its initial state. */
  reset(): void {
    const previous = deepClone(this._current);
    this._current = deepClone(this._initial);
    const changedPaths = getChangedPaths(previous, this._current);
    if (changedPaths.length > 0) {
      const event: ConfigChangeEvent<T> = {
        previous,
        current: deepClone(this._current),
        changedPaths,
        timestamp: Date.now(),
      };
      for (const listener of this._listeners) {
        listener(event);
      }
    }
  }

  /**
   * Subscribe to config change events.
   * Returns an unsubscribe function.
   */
  subscribe(listener: (event: ConfigChangeEvent<T>) => void): () => void {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== listener);
    };
  }

  /** Serialize current config to JSON. */
  toJSON(): string {
    return JSON.stringify(this._current);
  }

  /** Replace current config from a JSON string. */
  fromJSON(json: string): void {
    const parsed = JSON.parse(json) as T;
    const previous = deepClone(this._current);
    this._current = deepClone(parsed);
    const changedPaths = getChangedPaths(previous, this._current);
    if (changedPaths.length > 0) {
      const event: ConfigChangeEvent<T> = {
        previous,
        current: deepClone(this._current),
        changedPaths,
        timestamp: Date.now(),
      };
      for (const listener of this._listeners) {
        listener(event);
      }
    }
  }

  /** Return a frozen (immutable) copy of the current config. */
  freeze(): Readonly<T> {
    return Object.freeze(deepClone(this._current)) as Readonly<T>;
  }

  /** Return a deep clone of the current config state (snapshot). */
  snapshot(): T {
    return deepClone(this._current);
  }
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/**
 * Coerce a raw string value to the given type.
 */
export function coerceValue(
  value: string,
  type: 'string' | 'number' | 'boolean' | 'json',
): ConfigValue {
  switch (type) {
    case 'string':
      return value;
    case 'number': {
      const n = Number(value);
      return isNaN(n) ? 0 : n;
    }
    case 'boolean': {
      const lower = value.toLowerCase().trim();
      return ['1', 'true', 'yes', 'on'].includes(lower);
    }
    case 'json': {
      try {
        return JSON.parse(value) as ConfigValue;
      } catch {
        return value;
      }
    }
  }
}

/**
 * Interpolate ${KEY} placeholders in a template string from a config map.
 * Unresolved placeholders are left as-is.
 */
export function interpolate(
  template: string,
  config: Record<string, string>,
): string {
  return template.replace(/\$\{([^}]+)\}/g, (match, key: string) => {
    return key in config ? config[key] : match;
  });
}

const DEFAULT_SECRET_KEYS = [
  'password',
  'secret',
  'key',
  'token',
  'apikey',
  'api_key',
  'privatekey',
  'private_key',
  'passphrase',
  'credential',
];

/**
 * Recursively replace values of keys that look like secrets with '***'.
 */
export function redactSecrets(
  config: object,
  secretKeys: string[] = DEFAULT_SECRET_KEYS,
): object {
  function recurse(obj: unknown): unknown {
    if (!isPlainObject(obj) && !Array.isArray(obj)) return obj;
    if (Array.isArray(obj)) return obj.map(recurse);

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      const isSecret = secretKeys.some((sk) => lowerKey.includes(sk.toLowerCase()));
      if (isSecret && (typeof value === 'string' || typeof value === 'number')) {
        result[key] = '***';
      } else {
        result[key] = recurse(value);
      }
    }
    return result;
  }

  return recurse(config) as object;
}

/**
 * Compute the diff between two configs.
 * Returns an object mapping changed paths to { from, to } pairs.
 */
export function diffConfigs(
  a: object,
  b: object,
): Record<string, { from: ConfigValue; to: ConfigValue }> {
  const flatA = flatten(a);
  const flatB = flatten(b);
  const result: Record<string, { from: ConfigValue; to: ConfigValue }> = {};

  const allKeys = new Set([...Object.keys(flatA), ...Object.keys(flatB)]);
  for (const key of allKeys) {
    const aVal = flatA[key];
    const bVal = flatB[key];
    if (!deepEqual(aVal, bVal)) {
      result[key] = { from: aVal, to: bVal };
    }
  }

  return result;
}

/**
 * Deep equality check for two config objects.
 */
export function isConfigEqual(a: object, b: object): boolean {
  return deepEqual(a, b);
}

/**
 * Return a new object with all keys sorted alphabetically (recursively).
 */
export function sortKeys(config: object): object {
  if (!isPlainObject(config)) return config;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(config as Record<string, unknown>).sort()) {
    const val = (config as Record<string, unknown>)[key];
    sorted[key] = isPlainObject(val) ? sortKeys(val) : val;
  }
  return sorted;
}
