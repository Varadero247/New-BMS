// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Locale, string and formatting utilities for IMS

// ---------------------------------------------------------------------------
// Number / Currency / Date formatting (Intl-based)
// ---------------------------------------------------------------------------

/** Format a number using Intl.NumberFormat. */
export function formatNumber(
  n: number,
  locale: string = 'en-US',
  options: Intl.NumberFormatOptions = {}
): string {
  return new Intl.NumberFormat(locale, options).format(n);
}

/** Format a number as currency using Intl.NumberFormat. */
export function formatCurrency(
  n: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(n);
}

/** Format a Date using Intl.DateTimeFormat. */
export function formatDate(
  date: Date,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Format a relative-time string from a diff in seconds.
 * Positive = future, negative = past.
 */
export function formatRelativeTime(
  diffSeconds: number,
  locale: string = 'en-US'
): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const abs = Math.abs(diffSeconds);
  if (abs < 60) return rtf.format(Math.round(diffSeconds), 'second');
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), 'hour');
  if (abs < 2592000) return rtf.format(Math.round(diffSeconds / 86400), 'day');
  if (abs < 31536000) return rtf.format(Math.round(diffSeconds / 2592000), 'month');
  return rtf.format(Math.round(diffSeconds / 31536000), 'year');
}

/** Get the human-readable display name for a locale code. */
export function getLocaleName(code: string, displayLocale: string = 'en-US'): string {
  try {
    const dn = new Intl.DisplayNames([displayLocale], { type: 'language' });
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Get the human-readable display name for a currency code. */
export function getCurrencyName(code: string, locale: string = 'en-US'): string {
  try {
    const dn = new Intl.DisplayNames([locale], { type: 'currency' });
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}

// ---------------------------------------------------------------------------
// Pluralization & ordinals
// ---------------------------------------------------------------------------

/** Simple English pluralization. */
export function pluralize(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural;
}

/** Return ordinal string for a positive integer: 1st, 2nd, 3rd, 4th, ... */
export function ordinal(n: number): string {
  const abs = Math.abs(Math.floor(n));
  const mod100 = abs % 100;
  const mod10 = abs % 10;
  let suffix: string;
  if (mod100 >= 11 && mod100 <= 13) {
    suffix = 'th';
  } else if (mod10 === 1) {
    suffix = 'st';
  } else if (mod10 === 2) {
    suffix = 'nd';
  } else if (mod10 === 3) {
    suffix = 'rd';
  } else {
    suffix = 'th';
  }
  return `${n}${suffix}`;
}

// ---------------------------------------------------------------------------
// String utilities
// ---------------------------------------------------------------------------

/** Truncate a string to maxLen chars, appending ellipsis if needed. */
export function truncate(str: string, maxLen: number, ellipsis: string = '...'): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + ellipsis;
}

/** Capitalize the first character of a string. */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Title-case each word in a string. */
export function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Convert camelCase to kebab-case. */
export function camelToKebab(str: string): string {
  return str
    .replace(/([A-Z]+)/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^-/, '');
}

/** Convert kebab-case to camelCase. */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-zA-Z])/g, (_, c: string) => c.toUpperCase());
}

/** Convert snake_case to camelCase. */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-zA-Z])/g, (_, c: string) => c.toUpperCase());
}

/** Convert camelCase to snake_case. */
export function camelToSnake(str: string): string {
  return str
    .replace(/([A-Z]+)/g, (match) => `_${match.toLowerCase()}`)
    .replace(/^_/, '');
}

/** Left-pad a string to the given length with the given char. */
export function padStart(str: string, len: number, char: string = ' '): string {
  const padChar = char.length > 0 ? char[0] : ' ';
  if (str.length >= len) return str;
  return padChar.repeat(len - str.length) + str;
}

/** Right-pad a string to the given length with the given char. */
export function padEnd(str: string, len: number, char: string = ' '): string {
  const padChar = char.length > 0 ? char[0] : ' ';
  if (str.length >= len) return str;
  return str + padChar.repeat(len - str.length);
}

/** Repeat a string n times. */
export function repeat(str: string, n: number): string {
  if (n <= 0) return '';
  return str.repeat(n);
}

/** Count words in a string (split on whitespace). */
export function countWords(str: string): number {
  const trimmed = str.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Count characters in a string (same as .length). */
export function countChars(str: string): number {
  return str.length;
}

/** Reverse a string. */
export function reverseStr(str: string): string {
  return str.split('').reverse().join('');
}

/** Check if a string is a palindrome (case-insensitive, ignores non-alphanumeric). */
export function isPalindrome(str: string): boolean {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}
