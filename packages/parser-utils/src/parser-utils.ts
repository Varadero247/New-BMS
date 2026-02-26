// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { CsvOptions, IniSection, ParseResult, Token } from './types';
import { TokenType } from './types';
// Re-export types so test files can import from this module directly
export { TokenType } from './types';
export type {
  ParseOptions,
  CsvOptions,
  IniSection,
  TomlValue,
  Token,
  TokenType as TokenTypeType,
  ParseResult,
  LexerState,
} from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function normaliseDelimiter(d: string | undefined): string {
  return d !== undefined ? d : ',';
}

function normaliseQuote(q: string | undefined): string {
  return q !== undefined ? q : '"';
}

function normaliseEscape(e: string | undefined, quote: string): string {
  return e !== undefined ? e : quote;
}

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------

/**
 * Parse a CSV / TSV string into a two-dimensional array of strings.
 * Each inner array represents one row; each element is one field.
 */
export function parseCsv(text: string, options?: CsvOptions): string[][] {
  const delimiter = normaliseDelimiter(options?.delimiter);
  const quote = normaliseQuote(options?.quote);
  const escape = normaliseEscape(options?.escape, quote);
  const trim = options?.trim ?? false;
  const skipEmpty = options?.skipEmptyLines ?? true;

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuote = false;
  let i = 0;

  const isNewline = (ch: string) => ch === '\n' || ch === '\r';

  while (i < text.length) {
    const ch = text[i];

    if (inQuote) {
      // Check for escape sequence first
      if (
        escape !== quote &&
        ch === escape &&
        i + 1 < text.length &&
        text[i + 1] === quote
      ) {
        field += quote;
        i += 2;
        continue;
      }
      // Doubled-quote escape (or escape === quote)
      if (ch === quote) {
        if (escape === quote && i + 1 < text.length && text[i + 1] === quote) {
          field += quote;
          i += 2;
          continue;
        }
        inQuote = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    // Not in quote
    if (ch === quote) {
      inQuote = true;
      i++;
      continue;
    }

    if (text.startsWith(delimiter, i)) {
      row.push(trim ? field.trim() : field);
      field = '';
      i += delimiter.length;
      continue;
    }

    if (isNewline(ch)) {
      // Handle \r\n
      if (ch === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
        i++;
      }
      row.push(trim ? field.trim() : field);
      field = '';
      // A row is "empty" only if it has exactly one field and that field is empty (true blank line).
      // Rows with multiple fields are never skipped even if all values are empty.
      const isEmptyRow = row.length === 1 && row[0] === '';
      if (!skipEmpty || !isEmptyRow) {
        rows.push(row);
      }
      row = [];
      i++;
      continue;
    }

    field += ch;
    i++;
  }

  // Flush last field / row
  row.push(trim ? field.trim() : field);
  const isLastRowEmpty = row.length === 1 && row[0] === '';
  if (!skipEmpty || !isLastRowEmpty) {
    rows.push(row);
  }

  return rows;
}

/**
 * Serialise a two-dimensional array of strings back to a CSV string.
 */
export function stringifyCsv(rows: string[][], options?: CsvOptions): string {
  const delimiter = normaliseDelimiter(options?.delimiter);
  const quote = normaliseQuote(options?.quote);
  const newline = options?.newline ?? '\n';

  const needsQuoting = (field: string): boolean =>
    field.includes(delimiter) ||
    field.includes(quote) ||
    field.includes('\n') ||
    field.includes('\r');

  const quoteField = (field: string): string => {
    const escaped = field.split(quote).join(quote + quote);
    return `${quote}${escaped}${quote}`;
  };

  return rows
    .map(row =>
      row
        .map(field => (needsQuoting(field) ? quoteField(field) : field))
        .join(delimiter)
    )
    .join(newline);
}

/**
 * Parse a CSV string that has a header row.
 * Returns an array of plain objects keyed by the header values.
 */
export function csvToObjects(
  text: string,
  options?: CsvOptions
): Record<string, string>[] {
  const rows = parseCsv(text, options);
  if (rows.length === 0) return [];
  const [headers, ...dataRows] = rows;
  return dataRows.map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      obj[h] = row[idx] ?? '';
    });
    return obj;
  });
}

/**
 * Serialise an array of objects to a CSV string with a header row.
 */
export function objectsToCsv(
  objects: Record<string, string>[],
  options?: CsvOptions
): string {
  if (objects.length === 0) return '';
  const headers = Object.keys(objects[0]);
  const rows: string[][] = [
    headers,
    ...objects.map(obj => headers.map(h => obj[h] ?? '')),
  ];
  return stringifyCsv(rows, options);
}

// ---------------------------------------------------------------------------
// INI / config parsing
// ---------------------------------------------------------------------------

/**
 * Parse an INI-format string.
 * Returns a map of section name → (key → value).
 * Keys that appear before any section header are placed under the empty-string key.
 */
export function parseIni(
  text: string
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = { '': {} };
  let currentSection = '';

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith(';') || line.startsWith('#')) continue;

    // Section header
    const sectionMatch = /^\[([^\]]+)\]/.exec(line);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      if (!(currentSection in result)) {
        result[currentSection] = {};
      }
      continue;
    }

    // Key=value
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let value = line.slice(eqIdx + 1).trim();
    // Strip inline comments
    const commentIdx = value.search(/\s[;#]/);
    if (commentIdx !== -1) {
      value = value.slice(0, commentIdx).trim();
    }
    if (!(currentSection in result)) {
      result[currentSection] = {};
    }
    result[currentSection][key] = value;
  }

  return result;
}

/**
 * Serialise a parsed INI config back to an INI string.
 */
export function stringifyIni(
  config: Record<string, Record<string, string>>
): string {
  const lines: string[] = [];

  // Root keys (section = '') first, without a header
  if (config['']) {
    for (const [k, v] of Object.entries(config[''])) {
      lines.push(`${k}=${v}`);
    }
  }

  for (const [section, pairs] of Object.entries(config)) {
    if (section === '') continue;
    if (lines.length > 0) lines.push('');
    lines.push(`[${section}]`);
    for (const [k, v] of Object.entries(pairs)) {
      lines.push(`${k}=${v}`);
    }
  }

  return lines.join('\n');
}

/**
 * Parse KEY=VALUE (or KEY:VALUE) lines to a flat record.
 * Lines beginning with # or ; are treated as comments and ignored.
 */
export function parseKeyValue(
  text: string,
  delimiter = '='
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#') || line.startsWith(';')) continue;
    const idx = line.indexOf(delimiter);
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + delimiter.length).trim();
    result[key] = value;
  }
  return result;
}

/**
 * Serialise a flat record to KEY=VALUE lines.
 */
export function stringifyKeyValue(
  obj: Record<string, string>,
  delimiter = '='
): string {
  return Object.entries(obj)
    .map(([k, v]) => `${k}${delimiter}${v}`)
    .join('\n');
}

// ---------------------------------------------------------------------------
// Query string / URL params
// ---------------------------------------------------------------------------

/**
 * Parse a query string (with or without leading '?') into a record.
 * Repeated keys accumulate into arrays; single occurrences are plain strings.
 */
export function parseQueryString(
  qs: string
): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  const raw = qs.startsWith('?') ? qs.slice(1) : qs;
  if (raw === '') return result;

  for (const part of raw.split('&')) {
    if (part === '') continue;
    const eqIdx = part.indexOf('=');
    const key = decodeURIComponent(eqIdx === -1 ? part : part.slice(0, eqIdx));
    const value = eqIdx === -1 ? '' : decodeURIComponent(part.slice(eqIdx + 1));

    if (key in result) {
      const existing = result[key];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        result[key] = [existing, value];
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Serialise a params record to a query string (without leading '?').
 */
export function stringifyQueryString(
  params: Record<string, string | string[] | number | boolean>
): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    const encodedKey = encodeURIComponent(key);
    if (Array.isArray(value)) {
      for (const v of value) {
        parts.push(`${encodedKey}=${encodeURIComponent(String(v))}`);
      }
    } else {
      parts.push(`${encodedKey}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.join('&');
}

/**
 * Parse a query string where every key maps to an array of values (even singletons).
 */
export function parseMultiValueQuery(qs: string): Record<string, string[]> {
  const single = parseQueryString(qs);
  const result: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(single)) {
    result[k] = Array.isArray(v) ? v : [v];
  }
  return result;
}

// ---------------------------------------------------------------------------
// JSON utilities
// ---------------------------------------------------------------------------

/**
 * Attempt to JSON-parse `text`; return `fallback` if parsing throws.
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

/**
 * Relaxed JSON parser that tolerates:
 *   - Single-line `//` comments
 *   - Trailing commas in arrays and objects
 *
 * Delegates to `JSON.parse` after stripping these constructs.
 * Not a full JSON5 implementation — sufficient for config files.
 */
export function parseJson5Like(text: string): unknown {
  // Remove single-line comments (careful not to touch strings)
  let cleaned = '';
  let inStr = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inStr) {
      if (ch === '\\') {
        cleaned += ch + (text[i + 1] ?? '');
        i += 2;
        continue;
      }
      if (ch === '"') inStr = false;
      cleaned += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      cleaned += ch;
      i++;
      continue;
    }
    if (ch === '/' && text[i + 1] === '/') {
      // Skip until end of line
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    cleaned += ch;
    i++;
  }

  // Remove trailing commas before ] or }
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  return JSON.parse(cleaned);
}

/**
 * Find and return the first JSON object or array embedded in arbitrary text.
 * Returns `undefined` if none can be found.
 */
export function extractJsonFromText(text: string): unknown | undefined {
  // Find the first '{' or '[' and try progressively longer substrings
  for (let start = 0; start < text.length; start++) {
    const ch = text[start];
    if (ch !== '{' && ch !== '[') continue;
    const closing = ch === '{' ? '}' : ']';
    // Walk backwards from end to find matching close
    let depth = 0;
    for (let end = start; end < text.length; end++) {
      if (text[end] === ch) depth++;
      else if (text[end] === closing) {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(text.slice(start, end + 1));
          } catch {
            // Not valid JSON at this range; keep searching
            break;
          }
        }
      }
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Template / string parsing
// ---------------------------------------------------------------------------

/**
 * Replace `{{key}}` or `${key}` placeholders in `template` with values from `vars`.
 * Unknown keys are left as-is.
 */
export function parseTemplate(
  template: string,
  vars: Record<string, string | number | boolean>
): string {
  return template.replace(/\{\{(\w+)\}\}|\$\{(\w+)\}/g, (match, k1, k2) => {
    const key = k1 ?? k2;
    return key in vars ? String(vars[key]) : match;
  });
}

/**
 * Tokenise a simple math / filter expression into an array of Tokens.
 * Handles: numbers (integer + float), double-quoted strings, identifiers,
 * operators (+-/=<>!&|^~%), punctuation (()[]{},;:), and whitespace.
 */
export function tokenizeExpression(expr: string): Token[] {
  const state: { source: string; pos: number; tokens: Token[] } = {
    source: expr,
    pos: 0,
    tokens: [],
  };

  while (state.pos < state.source.length) {
    const start = state.pos;
    const ch = state.source[state.pos];

    // Whitespace
    if (/\s/.test(ch)) {
      let ws = '';
      while (state.pos < state.source.length && /\s/.test(state.source[state.pos])) {
        ws += state.source[state.pos++];
      }
      state.tokens.push({ type: TokenType.Whitespace, value: ws, position: start });
      continue;
    }

    // Number (integer or float, optional leading minus only when not following an operand)
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(state.source[state.pos + 1] ?? ''))) {
      let num = '';
      let hasDot = false;
      while (state.pos < state.source.length) {
        const c = state.source[state.pos];
        if (/[0-9]/.test(c)) {
          num += c;
          state.pos++;
        } else if (c === '.' && !hasDot) {
          hasDot = true;
          num += c;
          state.pos++;
        } else {
          break;
        }
      }
      state.tokens.push({ type: TokenType.Number, value: num, position: start });
      continue;
    }

    // Double-quoted string
    if (ch === '"') {
      let str = '"';
      state.pos++;
      while (state.pos < state.source.length) {
        const c = state.source[state.pos];
        str += c;
        state.pos++;
        if (c === '\\') {
          // Consume escaped char
          if (state.pos < state.source.length) {
            str += state.source[state.pos++];
          }
          continue;
        }
        if (c === '"') break;
      }
      state.tokens.push({ type: TokenType.String, value: str, position: start });
      continue;
    }

    // Identifier / keyword
    if (/[a-zA-Z_$]/.test(ch)) {
      let id = '';
      while (state.pos < state.source.length && /[a-zA-Z0-9_$]/.test(state.source[state.pos])) {
        id += state.source[state.pos++];
      }
      state.tokens.push({ type: TokenType.Identifier, value: id, position: start });
      continue;
    }

    // Multi-char operators
    const twoChar = state.source.slice(state.pos, state.pos + 2);
    if (['==', '!=', '<=', '>=', '&&', '||', '**', '<<', '>>', '=>'].includes(twoChar)) {
      state.tokens.push({ type: TokenType.Operator, value: twoChar, position: start });
      state.pos += 2;
      continue;
    }

    // Single-char operators
    if (/[+\-*/=<>!&|^~%]/.test(ch)) {
      state.tokens.push({ type: TokenType.Operator, value: ch, position: start });
      state.pos++;
      continue;
    }

    // Punctuation
    if (/[()[\]{},;:.]/.test(ch)) {
      state.tokens.push({ type: TokenType.Punctuation, value: ch, position: start });
      state.pos++;
      continue;
    }

    // Unknown
    state.tokens.push({ type: TokenType.Unknown, value: ch, position: start });
    state.pos++;
  }

  return state.tokens;
}

const TRUTHY_VALUES = new Set(['true', 'yes', '1', 'on', 'enabled', 'y', 't']);
const FALSY_VALUES = new Set(['false', 'no', '0', 'off', 'disabled', 'n', 'f']);

/**
 * Convert a string representation of a boolean to an actual boolean.
 * Throws a RangeError for unrecognised values.
 */
export function parseBooleanValue(value: string): boolean {
  const lower = value.trim().toLowerCase();
  if (TRUTHY_VALUES.has(lower)) return true;
  if (FALSY_VALUES.has(lower)) return false;
  throw new RangeError(`Cannot parse "${value}" as a boolean`);
}

/**
 * Parse a string to an integer using `radix` (default 10).
 * Returns `fallback` (default 0) if the result is NaN.
 */
export function parseIntSafe(
  text: string,
  radix = 10,
  fallback = 0
): number {
  const n = parseInt(text, radix);
  return isNaN(n) ? fallback : n;
}

/**
 * Parse a string to a floating-point number.
 * Returns `fallback` (default 0) if the result is NaN.
 */
export function parseFloatSafe(text: string, fallback = 0): number {
  const n = parseFloat(text);
  return isNaN(n) ? fallback : n;
}

// ---------------------------------------------------------------------------
// Path / selector parsing
// ---------------------------------------------------------------------------

/**
 * Split a dot-path string into path segments.
 * Handles array notation: `"a[0].b"` → `["a", "0", "b"]`.
 */
export function parseDotPath(path: string): string[] {
  if (path === '') return [];
  // Normalise bracket notation to dot notation first
  const normalised = path.replace(/\[(\d+)\]/g, '.$1');
  return normalised.split('.').filter(s => s.length > 0);
}

/**
 * Convert a glob pattern (supporting `*`, `**`, and `?`) to a RegExp.
 */
export function parseGlobPattern(pattern: string): RegExp {
  let regexStr = '';
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];
    if (ch === '*' && pattern[i + 1] === '*') {
      regexStr += '.*';
      i += 2;
      // Skip optional trailing slash
      if (pattern[i] === '/') i++;
      continue;
    }
    if (ch === '*') {
      regexStr += '[^/]*';
      i++;
      continue;
    }
    if (ch === '?') {
      regexStr += '[^/]';
      i++;
      continue;
    }
    // Escape regex meta-characters
    regexStr += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    i++;
  }
  return new RegExp(`^${regexStr}$`);
}

/**
 * Parsed representation of a semver string.
 */
export interface SemverParts {
  major: number;
  minor: number;
  patch: number;
  /** Pre-release identifier, e.g. "beta.1". Empty string if absent. */
  pre: string;
  /** Build metadata, e.g. "build.123". Empty string if absent. */
  build: string;
}

/**
 * Parse a semantic version string into its constituent parts.
 * Throws a SyntaxError for strings that do not match the semver format.
 */
export function parseSemver(version: string): SemverParts {
  const rx =
    /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.]+))?(?:\+([a-zA-Z0-9.]+))?$/;
  const m = rx.exec(version.trim());
  if (!m) throw new SyntaxError(`Invalid semver: "${version}"`);
  return {
    major: parseInt(m[1], 10),
    minor: parseInt(m[2], 10),
    patch: parseInt(m[3], 10),
    pre: m[4] ?? '',
    build: m[5] ?? '',
  };
}

/**
 * Compare two semver strings.
 * Returns `-1` if a < b, `0` if a === b (pre/build ignored for equality), `1` if a > b.
 * Pre-release versions have lower precedence than the release version.
 */
export function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const pa = parseSemver(a);
  const pb = parseSemver(b);

  for (const field of ['major', 'minor', 'patch'] as const) {
    if (pa[field] < pb[field]) return -1;
    if (pa[field] > pb[field]) return 1;
  }

  // Same numeric version: handle pre-release
  if (pa.pre === '' && pb.pre !== '') return 1;   // release > pre-release
  if (pa.pre !== '' && pb.pre === '') return -1;
  if (pa.pre !== pb.pre) return pa.pre < pb.pre ? -1 : 1;

  return 0;
}

// ---------------------------------------------------------------------------
// ParseResult helpers (bonus utilities)
// ---------------------------------------------------------------------------

/** Wrap a successful parse result. */
export function ok<T>(data: T): ParseResult<T> {
  return { success: true, data };
}

/** Wrap a failed parse result. */
export function fail<T>(error: string): ParseResult<T> {
  return { success: false, error };
}
