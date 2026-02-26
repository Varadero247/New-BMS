// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/**
 * @module string-template
 * Template rendering and string manipulation utilities.
 */

// ---------------------------------------------------------------------------
// Template rendering
// ---------------------------------------------------------------------------

/**
 * Renders a template string replacing {{key}} and {key} placeholders.
 */
export function render(
  template: string,
  vars: Record<string, string | number | boolean>
): string {
  return template.replace(/\{\{(\w+)\}\}|\{(\w+)\}/g, (_match, k1, k2) => {
    const key = k1 ?? k2;
    return key in vars ? String(vars[key]) : _match;
  });
}

/**
 * Renders a template supporting {{#if key}}...{{/if}} conditional blocks.
 * The block is included when vars[key] is truthy.
 */
export function renderConditional(
  template: string,
  vars: Record<string, unknown>
): string {
  // Process if/else blocks: {{#if key}}...{{else}}...{{/if}}
  let result = template.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_match, key, body) => {
      const hasElse = body.includes('{{else}}');
      if (hasElse) {
        const [truePart, falsePart] = body.split('{{else}}');
        return vars[key] ? truePart : falsePart;
      }
      return vars[key] ? body : '';
    }
  );
  // Replace remaining {{key}} / {key} placeholders
  result = result.replace(/\{\{(\w+)\}\}|\{(\w+)\}/g, (_match, k1, k2) => {
    const key = k1 ?? k2;
    return key in vars ? String(vars[key]) : _match;
  });
  return result;
}

/**
 * Renders a template supporting {{#each <key>}}...{{/each}} loops.
 * Inside the block, {{this.field}} is replaced per item.
 */
export function renderLoop(
  template: string,
  key: string,
  items: Record<string, unknown>[]
): string {
  const blockRe = new RegExp(
    `\\{\\{#each ${key}\\}\\}([\\s\\S]*?)\\{\\{/each\\}\\}`,
    'g'
  );
  return template.replace(blockRe, (_match, body: string) => {
    return items
      .map((item) =>
        body.replace(/\{\{this\.(\w+)\}\}/g, (_m, field) =>
          field in item ? String(item[field]) : _m
        )
      )
      .join('');
  });
}

// ---------------------------------------------------------------------------
// String manipulation
// ---------------------------------------------------------------------------

/** Converts a string to a URL-friendly slug. */
export function slugify(str: string): string {
  return deburr(str)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Basic accent → ASCII map
const DEBURR_MAP: Record<string, string> = {
  à: 'a', á: 'a', â: 'a', ã: 'a', ä: 'a', å: 'a',
  è: 'e', é: 'e', ê: 'e', ë: 'e',
  ì: 'i', í: 'i', î: 'i', ï: 'i',
  ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o', ø: 'o',
  ù: 'u', ú: 'u', û: 'u', ü: 'u',
  ý: 'y', ÿ: 'y',
  ñ: 'n', ç: 'c',
  À: 'A', Á: 'A', Â: 'A', Ã: 'A', Ä: 'A', Å: 'A',
  È: 'E', É: 'E', Ê: 'E', Ë: 'E',
  Ì: 'I', Í: 'I', Î: 'I', Ï: 'I',
  Ò: 'O', Ó: 'O', Ô: 'O', Õ: 'O', Ö: 'O', Ø: 'O',
  Ù: 'U', Ú: 'U', Û: 'U', Ü: 'U',
  Ý: 'Y',
  Ñ: 'N', Ç: 'C',
  ß: 'ss', æ: 'ae', Æ: 'AE', œ: 'oe', Œ: 'OE',
};

/** Removes common accent characters, mapping them to ASCII equivalents. */
export function deburr(str: string): string {
  return str
    .split('')
    .map((ch) => DEBURR_MAP[ch] ?? ch)
    .join('');
}

/** Escapes HTML special characters. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Unescapes HTML entities back to characters. */
export function unescapeHtml(str: string): string {
  return str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}

/** Escapes all regex special characters in a string. */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Removes all HTML tags from a string. */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Word-wraps a string to a maximum line width.
 * Splits on whitespace; long words are placed on their own line.
 */
export function wrap(str: string, width: number): string {
  if (width <= 0) return str;
  const words = str.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current === '') {
      current = word;
    } else if (current.length + 1 + word.length <= width) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.join('\n');
}

/**
 * Indents each line of a string by n repetitions of char (default space).
 */
export function indent(str: string, n: number, char = ' '): string {
  const pad = char.repeat(n);
  return str
    .split('\n')
    .map((line) => pad + line)
    .join('\n');
}

/**
 * Removes common leading whitespace from all lines (dedent).
 * Empty lines are ignored when computing the minimum indent.
 */
export function dedent(str: string): string {
  const lines = str.split('\n');
  const nonEmpty = lines.filter((l) => l.trim() !== '');
  if (nonEmpty.length === 0) return str;
  const minIndent = Math.min(
    ...nonEmpty.map((l) => l.match(/^(\s*)/)?.[1].length ?? 0)
  );
  return lines.map((l) => l.slice(minIndent)).join('\n');
}

/** Collapses runs of whitespace (spaces, tabs, newlines) into a single space and trims. */
export function normalize(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/** Counts the number of lines (newline-delimited) in a string. */
export function countLines(str: string): number {
  if (str === '') return 1;
  return str.split('\n').length;
}

/** Splits a string into lines. */
export function splitLines(str: string): string[] {
  return str.split('\n');
}

/**
 * Truncates a string to maxLen characters, placing separator in the middle.
 * Default separator is '...'.
 * If maxLen >= str.length, returns the original string.
 */
export function truncateMiddle(
  str: string,
  maxLen: number,
  separator = '...'
): string {
  if (str.length <= maxLen) return str;
  const sepLen = separator.length;
  if (maxLen <= sepLen) return separator.slice(0, maxLen);
  const totalChars = maxLen - sepLen;
  const frontLen = Math.ceil(totalChars / 2);
  const backLen = Math.floor(totalChars / 2);
  return str.slice(0, frontLen) + separator + str.slice(str.length - backLen);
}

/** Returns the longest common prefix of two strings. */
export function commonPrefix(a: string, b: string): string {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return a.slice(0, i);
}

/** Returns the longest common suffix of two strings. */
export function commonSuffix(a: string, b: string): string {
  let i = 0;
  while (i < a.length && i < b.length && a[a.length - 1 - i] === b[b.length - 1 - i]) i++;
  return a.slice(a.length - i);
}

/** Computes the Levenshtein edit distance between two strings. */
export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

/**
 * Returns a similarity score between 0 and 1 based on Levenshtein distance.
 * 1 = identical strings, 0 = completely different (or both empty).
 */
export function similarity(a: string, b: string): number {
  if (a === '' && b === '') return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - editDistance(a, b) / maxLen;
}
