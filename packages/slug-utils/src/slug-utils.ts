// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { TRANSLITERATION_MAP } from './transliteration-map';
import { SlugOptions, SlugifyResult } from './types';

const DEFAULT_SEP = '-';

export function transliterate(input: string): string {
  let result = '';
  for (const char of input) {
    result += TRANSLITERATION_MAP[char] ?? char;
  }
  return result;
}

export function slugify(input: string, options?: SlugOptions): string {
  if (!input || input.length === 0) return '';

  const sep = options?.separator ?? DEFAULT_SEP;
  const doLower = options?.lowercase !== false;
  const doTranslit = options?.transliterate !== false;
  const maxLen = options?.maxLength ?? 0;
  const strict = options?.strict ?? false;

  let s = input;
  if (doTranslit) s = transliterate(s);

  // Keep only allowed chars
  const allowed = strict ? /[^a-z0-9]+/g : new RegExp(`[^a-zA-Z0-9${sep ? sep.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') : ''}]+`, 'g');
  s = s.replace(allowed, sep);

  // Collapse consecutive separators
  if (sep) {
    const sepEsc = sep.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    s = s.replace(new RegExp(`${sepEsc}+`, 'g'), sep);
    // Trim leading/trailing separator
    s = s.replace(new RegExp(`^${sepEsc}|${sepEsc}$`, 'g'), '');
  }

  if (doLower) s = s.toLowerCase();

  if (maxLen > 0 && s.length > maxLen) {
    s = s.slice(0, maxLen);
    // Trim at word boundary
    const lastSep = s.lastIndexOf(sep);
    if (lastSep > 0) s = s.slice(0, lastSep);
  }

  return s;
}

export function slugifyResult(input: string, options?: SlugOptions): SlugifyResult {
  const slug = slugify(input, options);
  return { slug, original: input, changed: slug !== input };
}

export function toKebabCase(input: string): string {
  return input
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export function toCamelCase(input: string): string {
  const parts = input.replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase()).replace(/^(.)/, (m: string) => m.toLowerCase());
  return parts;
}

export function toPascalCase(input: string): string {
  const camel = toCamelCase(input);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

export function toSnakeCase(input: string): string {
  return input
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

export function toTitleCase(input: string): string {
  return input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

export function isValidSlug(slug: string, separator = '-'): boolean {
  if (!slug || slug.length === 0) return false;
  const sep = separator.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  // No leading/trailing separator, no consecutive separators, only alphanumeric + separator
  const pattern = new RegExp(`^[a-z0-9]([a-z0-9${sep}]*[a-z0-9])?$`);
  if (!pattern.test(slug)) return false;
  const doublePattern = new RegExp(`${sep}{2,}`);
  return !doublePattern.test(slug);
}

export function uniqueSlug(base: string, existingSlugs: string[], options?: SlugOptions): string {
  const slug = slugify(base, options);
  if (!existingSlugs.includes(slug)) return slug;
  let counter = 2;
  while (counter < 10000) {
    const candidate = `${slug}-${counter}`;
    if (!existingSlugs.includes(candidate)) return candidate;
    counter++;
  }
  return `${slug}-${Date.now()}`;
}

export function truncateSlug(slug: string, maxLength: number, separator = '-'): string {
  if (slug.length <= maxLength) return slug;
  let truncated = slug.slice(0, maxLength);
  const lastSep = truncated.lastIndexOf(separator);
  if (lastSep > 0) truncated = truncated.slice(0, lastSep);
  return truncated;
}

const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
export function generateSlug(length = 8): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return result;
}

export function extractSlugParts(slug: string, separator = '-'): string[] {
  return slug.split(separator).filter(Boolean);
}

export function joinSlugs(parts: string[], separator = '-'): string {
  return parts.map((p) => slugify(p, { separator })).filter(Boolean).join(separator);
}

export function compareSlug(a: string, b: string): boolean {
  return slugify(a) === slugify(b);
}
