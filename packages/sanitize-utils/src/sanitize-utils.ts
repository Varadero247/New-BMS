// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * Strip all HTML tags from a string.
 * "<p>Hello <b>world</b></p>" → "Hello world"
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML special characters.
 * & → &amp;  < → &lt;  > → &gt;  " → &quot;  ' → &#39;
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Unescape HTML entities back to characters.
 * Reverses escapeHtml; also handles &nbsp; → " ", &copy; → "©", etc.
 */
export function unescapeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&hellip;/g, '…')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export interface SanitizeHtmlOptions {
  allowedTags?: string[];
  allowedAttrs?: string[];
  stripComments?: boolean;
}

const DEFAULT_ALLOWED_TAGS = ['b', 'i', 'u', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a', 'span'];
const DEFAULT_ALLOWED_ATTRS = ['href', 'title', 'class'];

/**
 * Allowed-tag HTML sanitizer (whitelist approach).
 * Removes disallowed tags and attributes, strips comments if requested.
 */
export function sanitizeHtml(html: string, opts?: SanitizeHtmlOptions): string {
  const allowedTags = opts?.allowedTags ?? DEFAULT_ALLOWED_TAGS;
  const allowedAttrs = opts?.allowedAttrs ?? DEFAULT_ALLOWED_ATTRS;
  const stripComments = opts?.stripComments ?? true;

  let result = html;

  // Strip HTML comments
  if (stripComments) {
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  }

  // Process tags: remove disallowed tags, strip disallowed attrs from allowed tags
  result = result.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (match, tagName, attrs) => {
    const lowerTag = tagName.toLowerCase();
    // Check if tag is in closing form
    const isClosing = match.startsWith('</');

    if (!allowedTags.includes(lowerTag)) {
      return '';
    }

    if (isClosing) {
      return `</${lowerTag}>`;
    }

    // Filter attributes
    const filteredAttrs = attrs.replace(/([a-zA-Z\-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g, (attrMatch: string, attrName: string, dq: string, sq: string, bare: string) => {
      if (!allowedAttrs.includes(attrName.toLowerCase())) {
        return '';
      }
      const val = dq ?? sq ?? bare ?? '';
      return ` ${attrName.toLowerCase()}="${val}"`;
    });

    const selfClosing = attrs.trim().endsWith('/') ? ' /' : '';
    return `<${lowerTag}${filteredAttrs.trimEnd()}${selfClosing}>`;
  });

  return result;
}

/**
 * SQL injection escape (basic — for display purposes, not parameterized queries).
 * Escapes single quotes, double quotes, backslashes, semicolons, comment sequences.
 */
export function escapeSql(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/;/g, '\\;')
    .replace(/--/g, '\\-\\-')
    .replace(/\/\*/g, '\\/\\*')
    .replace(/\*\//g, '\\*\\/');
}

/**
 * Shell argument escape.
 * Wraps in single quotes, escapes internal single quotes: "it's" → "'it'\\''s'"
 */
export function escapeShell(s: string): string {
  return "'" + s.replace(/'/g, "'\\''") + "'";
}

/**
 * Escape regex special characters.
 * Escapes: . * + ? ^ $ { } [ ] | ( ) \
 */
export function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Remove control characters (ASCII 0-31 except tab \t=9, newline \n=10, CR \r=13).
 */
export function stripControlChars(s: string): string {
  // Remove ASCII 0-8, 11-12, 14-31 (keep \t=9, \n=10, \r=13)
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

/**
 * Remove null bytes.
 */
export function stripNullBytes(s: string): string {
  return s.replace(/\x00/g, '');
}

/**
 * Normalize whitespace: collapse multiple spaces/tabs into single space, trim.
 */
export function normalizeWhitespace(s: string): string {
  return s.replace(/[ \t]+/g, ' ').trim();
}

/**
 * Truncate to max length with optional ellipsis (default: "…").
 */
export function truncate(s: string, maxLen: number, ellipsis?: string): string {
  const ell = ellipsis !== undefined ? ellipsis : '…';
  if (s.length <= maxLen) return s;
  if (maxLen <= ell.length) return ell.slice(0, maxLen);
  return s.slice(0, maxLen - ell.length) + ell;
}

/**
 * Remove non-printable characters (keeps printable ASCII and above).
 */
export function stripNonPrintable(s: string): string {
  // Remove control chars (0x00-0x1F) and DEL (0x7F)
  return s.replace(/[\x00-\x1F\x7F]/g, '');
}

const UNSAFE_FILENAME_CHARS = /[/\\:*?"<>|\x00]/g;

/**
 * Sanitize filename: remove/replace characters not safe for filenames.
 * Replace: / \ : * ? " < > | \0 with replacement (default: '_').
 * Also strips leading/trailing dots and spaces.
 */
export function sanitizeFilename(name: string, replacement?: string): string {
  const rep = replacement !== undefined ? replacement : '_';
  let result = name.replace(UNSAFE_FILENAME_CHARS, rep);
  // Strip leading/trailing dots and spaces
  result = result.replace(/^[.\s]+/, '').replace(/[.\s]+$/, '');
  if (result === '') result = '_';
  return result;
}

/**
 * Sanitize URL path segment.
 * Percent-encode unsafe chars; strip ".." traversal.
 */
export function sanitizePathSegment(segment: string): string {
  // Remove path traversal
  let result = segment.replace(/\.\./g, '');
  // Remove leading/trailing slashes
  result = result.replace(/^\/+|\/+$/g, '');
  // Percent-encode characters that are not unreserved in path segments
  result = result.replace(/[^a-zA-Z0-9\-._~!$&'()*+,;=:@]/g, (ch) =>
    encodeURIComponent(ch)
  );
  return result;
}

/**
 * Sanitize email: lowercase, trim, basic format check.
 * Returns null if clearly invalid (no @, no dot after @), else trimmed lowercase.
 */
export function sanitizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const atIdx = trimmed.indexOf('@');
  if (atIdx < 1) return null;
  const domain = trimmed.slice(atIdx + 1);
  if (!domain.includes('.')) return null;
  if (domain.endsWith('.')) return null;
  if (trimmed.length > 320) return null;
  return trimmed;
}

/**
 * Sanitize phone number: keep only digits, +, -, (), spaces.
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9+\-() ]/g, '');
}

export interface NumericOptions {
  allowDecimal?: boolean;
  allowNegative?: boolean;
  allowThousandsSep?: boolean;
}

/**
 * Sanitize numeric string: keep only digits and optionally decimal/sign.
 */
export function sanitizeNumeric(s: string, opts?: NumericOptions): string {
  const allowDecimal = opts?.allowDecimal ?? false;
  const allowNegative = opts?.allowNegative ?? false;
  const allowThousandsSep = opts?.allowThousandsSep ?? false;

  let pattern = '0-9';
  if (allowDecimal) pattern += '.';
  if (allowNegative) pattern += '\\-';
  if (allowThousandsSep) pattern += ',';

  const regex = new RegExp(`[^${pattern}]`, 'g');
  return s.replace(regex, '');
}

/**
 * Sanitize JSON string: escape special chars for embedding in JSON.
 * Escapes \, ", \n, \r, \t, \b, \f and control chars.
 */
export function escapeJson(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/[\x00-\x1F\x7F]/g, (ch) => {
      const code = ch.charCodeAt(0);
      switch (code) {
        case 0x08: return '\\b';  // backspace
        case 0x09: return '\\t';  // tab
        case 0x0A: return '\\n';  // newline
        case 0x0C: return '\\f';  // form feed
        case 0x0D: return '\\r';  // carriage return
        default: {
          const hex = code.toString(16).padStart(4, '0');
          return `\\u${hex}`;
        }
      }
    });
}

/**
 * Mask email: "john.doe@example.com" → "j*******@example.com"
 */
export function maskEmail(email: string): string {
  const atIdx = email.indexOf('@');
  if (atIdx < 0) return email;
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx);
  if (local.length <= 1) return local + domain;
  return local[0] + '*'.repeat(local.length - 1) + domain;
}

/**
 * Mask phone: keep last 4 digits, mask rest: "07700900000" → "*******0000"
 */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return phone;
  const visible = digits.slice(-4);
  const masked = '*'.repeat(digits.length - 4);
  return masked + visible;
}

/**
 * Mask credit card: keep last 4 digits: "**** **** **** 1234"
 */
export function maskCreditCard(cc: string): string {
  const digits = cc.replace(/\D/g, '');
  if (digits.length < 4) return '*'.repeat(digits.length);
  const last4 = digits.slice(-4);
  return '**** **** **** ' + last4;
}

/**
 * Mask string: keeps visibleStart chars from start and visibleEnd from end,
 * masks the middle with char (default: '*').
 */
export function maskString(s: string, visibleStart?: number, visibleEnd?: number, char?: string): string {
  const vs = visibleStart ?? 1;
  const ve = visibleEnd ?? 1;
  const mc = char ?? '*';

  if (s.length <= vs + ve) return s;
  const start = s.slice(0, vs);
  const end = s.slice(s.length - ve);
  const maskedLen = s.length - vs - ve;
  return start + mc.repeat(maskedLen) + end;
}

const XSS_PATTERNS = [
  /<script/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /onclick\s*=/i,
  /onmouseover\s*=/i,
  /javascript\s*:/i,
  /data\s*:\s*text\/html/i,
  /vbscript\s*:/i,
  /eval\s*\(/i,
  /expression\s*\(/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /<link/i,
  /<meta/i,
  /document\.cookie/i,
  /document\.write/i,
  /window\.location/i,
  /alert\s*\(/i,
  /confirm\s*\(/i,
  /prompt\s*\(/i,
];

/**
 * Check if string contains potential XSS.
 */
export function containsXss(s: string): boolean {
  return XSS_PATTERNS.some((pattern) => pattern.test(s));
}

const SQL_INJECTION_PATTERNS = [
  /union\s+select/i,
  /drop\s+table/i,
  /drop\s+database/i,
  /delete\s+from/i,
  /insert\s+into/i,
  /update\s+\w+\s+set/i,
  /--\s/,
  /\/\*/,
  /or\s+1\s*=\s*1/i,
  /and\s+1\s*=\s*1/i,
  /or\s+'[^']*'\s*=\s*'[^']*/i,
  /;\s*select/i,
  /xp_cmdshell/i,
  /exec\s*\(/i,
  /waitfor\s+delay/i,
  /benchmark\s*\(/i,
  /sleep\s*\(/i,
  /information_schema/i,
  /sys\.tables/i,
  /char\s*\(\d/i,
];

/**
 * Check if string contains potential SQL injection.
 */
export function containsSqlInjection(s: string): boolean {
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(s));
}

const EMAIL_PATTERN = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(?:\+?[\d\s\-().]{7,15})/g;
const CARD_PATTERN = /\b(?:\d[ \-]?){13,19}\b/g;

/**
 * Redact PII patterns from text.
 * Replaces email addresses with [EMAIL], phone numbers with [PHONE],
 * credit card patterns with [CARD].
 */
export function redactPii(text: string): string {
  let result = text.replace(EMAIL_PATTERN, '[EMAIL]');
  result = result.replace(CARD_PATTERN, '[CARD]');
  // Phone after email/card to avoid false positives
  result = result.replace(PHONE_PATTERN, (match) => {
    // Only replace if it looks sufficiently phone-like (at least 7 digits)
    const digits = match.replace(/\D/g, '');
    if (digits.length >= 7) return '[PHONE]';
    return match;
  });
  return result;
}

/**
 * Safe integer parse: returns null if not a valid integer.
 */
export function safeParseInt(s: string, radix?: number): number | null {
  const trimmed = s.trim();
  if (trimmed === '') return null;
  const r = radix ?? 10;
  const parsed = parseInt(trimmed, r);
  if (isNaN(parsed)) return null;
  // Verify the whole string was consumed (no trailing junk for base 10)
  if (r === 10 && !/^-?\d+$/.test(trimmed)) return null;
  return parsed;
}

/**
 * Safe float parse: returns null if not a valid float.
 */
export function safeParseFloat(s: string): number | null {
  const trimmed = s.trim();
  if (trimmed === '') return null;
  const parsed = parseFloat(trimmed);
  if (isNaN(parsed)) return null;
  // Verify whole string is a valid float
  if (!/^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(trimmed)) return null;
  return parsed;
}
