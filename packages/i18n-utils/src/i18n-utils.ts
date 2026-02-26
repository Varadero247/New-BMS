// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TranslationStore {
  [key: string]: string | TranslationStore;
}

// ─── interpolate ──────────────────────────────────────────────────────────────

/**
 * Replace {{varName}} placeholders in a template string with values from vars.
 * Unknown placeholders are left unchanged.
 */
export function interpolate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : _match;
  });
}

// ─── getNestedValue ───────────────────────────────────────────────────────────

/**
 * Traverse a nested TranslationStore using dot-notation key (e.g. "a.b.c").
 * Returns the string leaf value, or undefined if not found / not a string.
 */
export function getNestedValue(
  store: TranslationStore,
  key: string
): string | undefined {
  const parts = key.split('.');
  let current: string | TranslationStore = store;
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return undefined;
    const next = (current as TranslationStore)[part];
    if (next === undefined) return undefined;
    current = next;
  }
  return typeof current === 'string' ? current : undefined;
}

// ─── translate ────────────────────────────────────────────────────────────────

/**
 * Look up key in store (dot-notation) and optionally interpolate vars.
 * Returns the key itself if not found.
 */
export function translate(
  store: TranslationStore,
  key: string,
  vars?: Record<string, string>
): string {
  const value = getNestedValue(store, key);
  if (value === undefined) return key;
  return vars ? interpolate(value, vars) : value;
}

// ─── createI18n ───────────────────────────────────────────────────────────────

/**
 * Create a lightweight i18n instance bound to a translation store.
 */
export function createI18n(
  translations: TranslationStore,
  fallback = 'en'
): { t(key: string, vars?: Record<string, string>): string; has(key: string): boolean; locale: string } {
  return {
    locale: fallback,
    t(key: string, vars?: Record<string, string>): string {
      return translate(translations, key, vars);
    },
    has(key: string): boolean {
      return hasKey(translations, key);
    },
  };
}

// ─── pluralizeEn ──────────────────────────────────────────────────────────────

/**
 * English pluralisation: n === 1 returns singular, otherwise plural.
 */
export function pluralizeEn(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}

// ─── formatMessage ────────────────────────────────────────────────────────────

/**
 * Replace positional {0}, {1}, … placeholders with values array items.
 * Unknown indices are left as-is.
 */
export function formatMessage(
  template: string,
  values: (string | number)[]
): string {
  return template.replace(/\{(\d+)\}/g, (_match, idx: string) => {
    const i = parseInt(idx, 10);
    return i < values.length ? String(values[i]) : _match;
  });
}

// ─── extractKeys ──────────────────────────────────────────────────────────────

/**
 * Return all leaf keys from a TranslationStore in dot-notation.
 */
export function extractKeys(
  store: TranslationStore,
  prefix = ''
): string[] {
  const keys: string[] = [];
  for (const key of Object.keys(store)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = store[key];
    if (typeof value === 'string') {
      keys.push(fullKey);
    } else {
      keys.push(...extractKeys(value, fullKey));
    }
  }
  return keys;
}

// ─── mergeTranslations ────────────────────────────────────────────────────────

/**
 * Deep-merge two translation stores. Override values win on conflict.
 */
export function mergeTranslations(
  base: TranslationStore,
  override: TranslationStore
): TranslationStore {
  const result: TranslationStore = { ...base };
  for (const key of Object.keys(override)) {
    const baseVal = result[key];
    const overVal = override[key];
    if (
      typeof baseVal === 'object' &&
      baseVal !== null &&
      typeof overVal === 'object' &&
      overVal !== null
    ) {
      result[key] = mergeTranslations(
        baseVal as TranslationStore,
        overVal as TranslationStore
      );
    } else {
      result[key] = overVal;
    }
  }
  return result;
}

// ─── countKeys ────────────────────────────────────────────────────────────────

/**
 * Count the total number of leaf string keys in a TranslationStore.
 */
export function countKeys(store: TranslationStore): number {
  return extractKeys(store).length;
}

// ─── hasKey ───────────────────────────────────────────────────────────────────

/**
 * Return true if the dot-notation key exists and resolves to a string.
 */
export function hasKey(store: TranslationStore, key: string): boolean {
  return getNestedValue(store, key) !== undefined;
}

// ─── normalizeLocale ──────────────────────────────────────────────────────────

/**
 * Normalise a locale code to BCP 47 format (lowercase language, uppercase region).
 * Examples: "en_US" → "en-US", "EN-us" → "en-US", "fr" → "fr".
 */
export function normalizeLocale(code: string): string {
  const parts = code.replace('_', '-').split('-');
  if (parts.length === 1) return parts[0].toLowerCase();
  return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
}

// ─── isValidLocale ────────────────────────────────────────────────────────────

/**
 * Return true for simple locale codes: two lowercase letters ("en"),
 * or ll-CC format ("en-US" / "en_US"). Case-insensitive.
 */
export function isValidLocale(code: string): boolean {
  return /^[a-zA-Z]{2}(?:[-_][a-zA-Z]{2})?$/.test(code);
}
