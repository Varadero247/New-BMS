// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { NamedGroups, MatchResult, RegexFlags, ExtractResult } from './types';

// ---------------------------------------------------------------------------
// PATTERN LIBRARY
// ---------------------------------------------------------------------------

/**
 * Pre-built RegExp constants for common validation patterns.
 * All patterns are anchored (^ and $) to validate the full string unless
 * used with matchAll/extract which require global non-anchored variants.
 */
export const PATTERNS = {
  // Contact / Network
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
  URL: /^https?:\/\/(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|localhost|\d{1,3}(?:\.\d{1,3}){3})(?::\d{2,5})?(?:\/[^\s]*)?$/,
  IPV4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  IPV6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^[0-9a-fA-F]{1,4}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}$|^(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}$|^(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}$|^::$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,

  // Phone numbers
  PHONE_E164: /^\+[1-9]\d{1,14}$/,
  PHONE_UK: /^(?:(?:\+44|0044|0)(?:\s?|-?)(?:7\d{3}|\d{4})(?:\s?|-?)\d{3,4}(?:\s?|-?)\d{3,4}|(?:\+44|0044|0)(?:\s?|-?)(?:800|808|843|844|845|870|871|872|873)(?:\s?|-?)\d{3,4}(?:\s?|-?)\d{3,4})$/,
  PHONE_US: /^(?:\+1[-.\s]?)?\(?([2-9][0-9]{2})\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/,

  // Postal codes
  POSTCODE_UK: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
  POSTCODE_US: /^\d{5}(?:-\d{4})?$/,

  // Financial
  IBAN: /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/,
  CREDIT_CARD: /^(?:4\d{12}(?:\d{3})?|5[1-5]\d{14}|3[47]\d{13}|3(?:0[0-5]|[68]\d)\d{11}|6(?:011|5\d{2})\d{12}|(?:2131|1800|35\d{3})\d{11})$/,

  // Date / Time
  ISO_DATE: /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/,
  ISO_DATETIME: /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-][01]\d:[0-5]\d)$/,
  TIME_24H: /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/,
  TIME_12H: /^(?:0?[1-9]|1[0-2]):[0-5]\d(?::[0-5]\d)?\s?(?:AM|PM|am|pm)$/,

  // Colours
  HEX_COLOR: /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
  RGB_COLOR: /^rgb\(\s*(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\s*,\s*(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\s*,\s*(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\s*\)$/,
  HSL_COLOR: /^hsl\(\s*(?:360|3[0-5]\d|[012]?\d\d?)\s*,\s*(?:100|\d{1,2})%\s*,\s*(?:100|\d{1,2})%\s*\)$/,

  // String / Identity
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  USERNAME: /^[a-zA-Z0-9_.-]{3,32}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).{8,}$/,

  // Software / Tech
  SEMVER: /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/,
  MAC_ADDRESS: /^(?:[0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$/,
  HTML_TAG: /^<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>[\s\S]*?<\/\1>$/,
  CSS_CLASS: /^\.[a-zA-Z_-][a-zA-Z0-9_-]*$/,

  // Numbers
  POSITIVE_INT: /^\d+$/,
  NEGATIVE_INT: /^-\d+$/,
  DECIMAL: /^-?\d+\.\d+$/,
  SCIENTIFIC_NOTATION: /^-?\d+(?:\.\d+)?[eE][+-]?\d+$/,

  // Text structure
  WHITESPACE_ONLY: /^\s+$/,
  EMPTY_LINE: /^$/,
  MARKDOWN_HEADING: /^#{1,6}\s+\S/,
  MARKDOWN_LINK: /^\[([^\]]+)\]\(([^)]+)\)$/,
} as const;

// ---------------------------------------------------------------------------
// VALIDATION FUNCTIONS
// ---------------------------------------------------------------------------

/** Returns true if the string is a valid email address. */
export function isEmail(s: string): boolean {
  return PATTERNS.EMAIL.test(s);
}

/** Returns true if the string is a valid HTTP/HTTPS URL. */
export function isUrl(s: string): boolean {
  return PATTERNS.URL.test(s);
}

/** Returns true if the string is a valid IPv4 address. */
export function isIpv4(s: string): boolean {
  return PATTERNS.IPV4.test(s);
}

/** Returns true if the string is a valid IPv6 address. */
export function isIpv6(s: string): boolean {
  return PATTERNS.IPV6.test(s);
}

/** Returns true if the string is a valid UUID (v1-v5). */
export function isUuid(s: string): boolean {
  return PATTERNS.UUID.test(s);
}

/** Returns true if the string is a valid URL slug. */
export function isSlug(s: string): boolean {
  return PATTERNS.SLUG.test(s);
}

/** Returns true if the string is a valid IBAN. */
export function isIban(s: string): boolean {
  return PATTERNS.IBAN.test(s);
}

/** Returns true if the string meets strong-password criteria. */
export function isStrongPassword(s: string): boolean {
  return PATTERNS.PASSWORD_STRONG.test(s);
}

/** Returns true if the string is a valid semantic version. */
export function isSemver(s: string): boolean {
  return PATTERNS.SEMVER.test(s);
}

/** Returns true if the string is a valid hex colour (#rgb, #rrggbb, #rrggbbaa). */
export function isHexColor(s: string): boolean {
  return PATTERNS.HEX_COLOR.test(s);
}

/** Returns true if the string is a valid UK postcode. */
export function isPostcodeUk(s: string): boolean {
  return PATTERNS.POSTCODE_UK.test(s);
}

// ---------------------------------------------------------------------------
// MATCHING UTILITIES
// ---------------------------------------------------------------------------

/**
 * Run a single match and return a structured MatchResult.
 * The pattern need not have the global flag; it is used as-is.
 */
export function match(str: string, pattern: RegExp): MatchResult {
  // Ensure we don't accidentally mutate lastIndex on a stateful global regex
  const nonGlobal = pattern.global
    ? new RegExp(pattern.source, pattern.flags.replace('g', ''))
    : pattern;
  const m = nonGlobal.exec(str);
  if (!m) {
    return { matched: false, groups: {}, index: -1, value: '' };
  }
  return {
    matched: true,
    groups: (m.groups as NamedGroups | undefined) ?? {},
    index: m.index,
    value: m[0],
  };
}

/**
 * Return all matches for a pattern as an array of MatchResult.
 * A global copy of the pattern is created internally.
 */
export function matchAll(str: string, pattern: RegExp): MatchResult[] {
  const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  const results: MatchResult[] = [];
  let m: RegExpExecArray | null;
  global.lastIndex = 0;
  while ((m = global.exec(str)) !== null) {
    results.push({
      matched: true,
      groups: (m.groups as NamedGroups | undefined) ?? {},
      index: m.index,
      value: m[0],
    });
    // Prevent infinite loop on zero-length matches
    if (m[0].length === 0) global.lastIndex++;
  }
  return results;
}

/**
 * Extract all values of a specific capture group (by index or name) from all matches.
 * Defaults to the full match (group 0) when no group argument is provided.
 */
export function extract(str: string, pattern: RegExp, group?: number | string): string[] {
  const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  const results: string[] = [];
  let m: RegExpExecArray | null;
  global.lastIndex = 0;
  while ((m = global.exec(str)) !== null) {
    if (group === undefined || group === 0) {
      results.push(m[0]);
    } else if (typeof group === 'string') {
      const val = m.groups?.[group];
      if (val !== undefined) results.push(val);
    } else {
      const val = m[group as number];
      if (val !== undefined) results.push(val);
    }
    if (m[0].length === 0) global.lastIndex++;
  }
  return results;
}

/**
 * Extract all named capture groups from every match and return as an array of NamedGroups.
 */
export function extractNamed(str: string, pattern: RegExp): NamedGroups[] {
  const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  const results: NamedGroups[] = [];
  let m: RegExpExecArray | null;
  global.lastIndex = 0;
  while ((m = global.exec(str)) !== null) {
    results.push((m.groups as NamedGroups | undefined) ?? {});
    if (m[0].length === 0) global.lastIndex++;
  }
  return results;
}

/** Test whether a pattern matches any part of the string. */
export function test(str: string, pattern: RegExp): boolean {
  const nonGlobal = pattern.global
    ? new RegExp(pattern.source, pattern.flags.replace('g', ''))
    : pattern;
  return nonGlobal.test(str);
}

/** Count the number of non-overlapping matches of a pattern in a string. */
export function count(str: string, pattern: RegExp): number {
  const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  let n = 0;
  let m: RegExpExecArray | null;
  global.lastIndex = 0;
  while ((m = global.exec(str)) !== null) {
    n++;
    if (m[0].length === 0) global.lastIndex++;
  }
  return n;
}

/**
 * Return the first pattern from the list that matches the string, plus the match value.
 * Returns null if no pattern matches.
 */
export function findFirst(
  str: string,
  patterns: RegExp[],
): { pattern: RegExp; match: string } | null {
  for (const pat of patterns) {
    const nonGlobal = pat.global
      ? new RegExp(pat.source, pat.flags.replace('g', ''))
      : pat;
    const m = nonGlobal.exec(str);
    if (m) return { pattern: pat, match: m[0] };
  }
  return null;
}

/**
 * For each pattern, collect all matches from the string.
 */
export function findAll(
  str: string,
  patterns: RegExp[],
): Array<{ pattern: RegExp; matches: string[] }> {
  return patterns.map((pat) => ({
    pattern: pat,
    matches: extract(str, pat),
  }));
}

// ---------------------------------------------------------------------------
// REPLACEMENT UTILITIES
// ---------------------------------------------------------------------------

/**
 * Replace the first (or all, if pattern is global) occurrence(s) using the
 * native String.prototype.replace behaviour.
 */
export function replace(
  str: string,
  pattern: RegExp,
  replacement: string | ((match: string, ...groups: string[]) => string),
): string {
  if (typeof replacement === 'string') {
    return str.replace(pattern, replacement);
  }
  return str.replace(pattern, replacement as (...args: string[]) => string);
}

/**
 * Replace ALL occurrences of the pattern regardless of whether the global flag is set.
 */
export function replaceAll(str: string, pattern: RegExp, replacement: string): string {
  const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  return str.replace(global, replacement);
}

/**
 * Replace only the nth (1-based) occurrence of the pattern.
 */
export function replaceNth(
  str: string,
  pattern: RegExp,
  replacement: string,
  n: number,
): string {
  const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  let occurrences = 0;
  global.lastIndex = 0;
  return str.replace(global, (matched) => {
    occurrences++;
    return occurrences === n ? replacement : matched;
  });
}

/**
 * Replace all matches with a redaction token (default '***').
 */
export function redact(str: string, pattern: RegExp, replacement = '***'): string {
  return replaceAll(str, pattern, replacement);
}

/**
 * Wrap every match with before/after strings (default '<mark>' / '</mark>').
 */
export function highlight(
  str: string,
  pattern: RegExp,
  before = '<mark>',
  after = '</mark>',
): string {
  const global = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  return str.replace(global, (m) => `${before}${m}${after}`);
}

// ---------------------------------------------------------------------------
// BUILDER UTILITIES
// ---------------------------------------------------------------------------

/**
 * Escape all regex special characters in a string so it can be used for
 * literal matching inside a RegExp constructor.
 */
export function escape(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Combine multiple patterns using | alternation into a single RegExp.
 * Flags from the first pattern are preserved.
 */
export function combine(...patterns: RegExp[]): RegExp {
  const source = patterns.map((p) => `(?:${p.source})`).join('|');
  const flags = patterns[0]?.flags ?? '';
  return new RegExp(source, flags);
}

/**
 * Return a new RegExp with the specified flags added and/or removed.
 */
export function flags(pattern: RegExp, add?: string, remove?: string): RegExp {
  let f = pattern.flags;
  if (add) {
    for (const ch of add) {
      if (!f.includes(ch)) f += ch;
    }
  }
  if (remove) {
    for (const ch of remove) {
      f = f.replace(ch, '');
    }
  }
  return new RegExp(pattern.source, f);
}

/**
 * Create a RegExp from a source string and a flags string.
 */
export function withFlags(source: string, flagStr: RegexFlags): RegExp {
  return new RegExp(source, flagStr);
}

/** Build a named capture group fragment: `(?<name>pattern)` */
export function namedGroup(name: string, pattern: string): string {
  return `(?<${name}>${pattern})`;
}

/** Build a lookahead fragment: `(?=pattern)` */
export function lookahead(pattern: string): string {
  return `(?=${pattern})`;
}

/** Build a negative lookahead fragment: `(?!pattern)` */
export function negativeLookahead(pattern: string): string {
  return `(?!${pattern})`;
}

/** Build a lookbehind fragment: `(?<=pattern)` */
export function lookbehind(pattern: string): string {
  return `(?<=${pattern})`;
}

/** Build an optional non-capturing group: `(?:pattern)?` */
export function optional(pattern: string): string {
  return `(?:${pattern})?`;
}

/**
 * Build a repetition non-capturing group: `(?:pattern){min,max}`.
 * When max is omitted the quantifier is `{min,}`.
 */
export function repeat(pattern: string, min: number, max?: number): string {
  const quantifier = max !== undefined ? `{${min},${max}}` : `{${min},}`;
  return `(?:${pattern})${quantifier}`;
}

// ---------------------------------------------------------------------------
// SPLIT / ANALYSIS
// ---------------------------------------------------------------------------

/** Split a string on every match of the pattern. */
export function splitOn(str: string, pattern: RegExp): string[] {
  return str.split(pattern);
}

/**
 * Split a string but keep the delimiter matches in the result array,
 * interleaved between the surrounding segments.
 */
export function splitKeep(str: string, pattern: RegExp): string[] {
  const global = new RegExp(
    `(${pattern.source})`,
    pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g',
  );
  return str.split(global).filter((s) => s !== undefined);
}

/**
 * Analyse a RegExp and return metadata about it.
 */
export function analyze(pattern: RegExp): {
  hasGroups: boolean;
  hasNamedGroups: boolean;
  flags: string;
  isGlobal: boolean;
  isSticky: boolean;
  source: string;
} {
  const src = pattern.source;
  const hasGroups = /\((?!\?:)/.test(src);
  const hasNamedGroups = /\(\?<[a-zA-Z]/.test(src);
  return {
    hasGroups,
    hasNamedGroups,
    flags: pattern.flags,
    isGlobal: pattern.global,
    isSticky: pattern.sticky,
    source: src,
  };
}

// Re-export types for convenience
export type { NamedGroups, MatchResult, RegexFlags, ExtractResult };
