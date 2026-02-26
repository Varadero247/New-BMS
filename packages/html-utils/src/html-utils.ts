// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { HtmlStats, MetaTag, SanitizeOptions } from './types';

// ---------------------------------------------------------------------------
// Named entity map — 50+ entries
// ---------------------------------------------------------------------------
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00A0',
  copy: '\u00A9',
  reg: '\u00AE',
  trade: '\u2122',
  euro: '\u20AC',
  pound: '\u00A3',
  yen: '\u00A5',
  cent: '\u00A2',
  mdash: '\u2014',
  ndash: '\u2013',
  laquo: '\u00AB',
  raquo: '\u00BB',
  hellip: '\u2026',
  deg: '\u00B0',
  plusmn: '\u00B1',
  times: '\u00D7',
  divide: '\u00F7',
  frac12: '\u00BD',
  frac14: '\u00BC',
  frac34: '\u00BE',
  alpha: '\u03B1',
  beta: '\u03B2',
  gamma: '\u03B3',
  delta: '\u03B4',
  epsilon: '\u03B5',
  pi: '\u03C0',
  sigma: '\u03C3',
  mu: '\u03BC',
  omega: '\u03C9',
  sum: '\u2211',
  infin: '\u221E',
  radic: '\u221A',
  asymp: '\u2248',
  ne: '\u2260',
  le: '\u2264',
  ge: '\u2265',
  larr: '\u2190',
  rarr: '\u2192',
  uarr: '\u2191',
  darr: '\u2193',
  harr: '\u2194',
  bull: '\u2022',
  middot: '\u00B7',
  lsquo: '\u2018',
  rsquo: '\u2019',
  ldquo: '\u201C',
  rdquo: '\u201D',
  dagger: '\u2020',
  Dagger: '\u2021',
  permil: '\u2030',
  prime: '\u2032',
  Prime: '\u2033',
};

// Reverse map: character → entity name (pick shortest / canonical)
const CHAR_TO_ENTITY: Record<string, string> = {
  '&': 'amp',
  '<': 'lt',
  '>': 'gt',
  '"': 'quot',
  "'": 'apos',
};

// ---------------------------------------------------------------------------
// Entity encoding / decoding
// ---------------------------------------------------------------------------

/**
 * Encode &, <, >, ", ' to HTML entities.
 */
export function encodeHtml(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const ent = CHAR_TO_ENTITY[c];
    out += ent ? `&${ent};` : c;
  }
  return out;
}

/**
 * Decode HTML entities including named, decimal (&#NNN;) and hex (&#xHHH;).
 */
export function decodeHtml(s: string): string {
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, code: string) => {
    if (code.startsWith('#x') || code.startsWith('#X')) {
      return String.fromCodePoint(parseInt(code.slice(2), 16));
    }
    if (code.startsWith('#')) {
      return String.fromCodePoint(parseInt(code.slice(1), 10));
    }
    return NAMED_ENTITIES[code] ?? match;
  });
}

/**
 * Encode a string for safe use inside an HTML attribute value.
 * Every non-alphanumeric character is encoded as &#NNN;
 */
export function encodeHtmlAttribute(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (/[a-zA-Z0-9]/.test(c)) {
      out += c;
    } else {
      out += `&#${c.charCodeAt(0)};`;
    }
  }
  return out;
}

/**
 * Strip all HTML tags, decode entities, collapse whitespace.
 */
export function htmlToText(html: string): string {
  const stripped = stripTags(html);
  const decoded = decodeHtml(stripped);
  return decoded.replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// Tag utilities
// ---------------------------------------------------------------------------

/**
 * Remove all tags from html, or only remove tags NOT in allowedTags.
 */
export function stripTags(html: string, allowedTags?: string[]): string {
  if (!allowedTags || allowedTags.length === 0) {
    return html.replace(/<[^>]*>/g, '');
  }
  const allowed = new Set(allowedTags.map(t => t.toLowerCase()));
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag: string) => {
    return allowed.has(tag.toLowerCase()) ? match : '';
  });
}

/**
 * Return sorted unique tag names found in html.
 */
export function extractTags(html: string): string[] {
  const found = new Set<string>();
  const re = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    found.add(m[1].toLowerCase());
  }
  return [...found].sort();
}

/**
 * Wrap content in an HTML tag with optional attributes.
 */
export function wrapTag(content: string, tag: string, attrs?: Record<string, string>): string {
  return `${buildTag(tag, attrs)}${content}</${tag}>`;
}

/**
 * Remove the outermost wrapping tag of the given name, keeping its children.
 */
export function unwrapTag(html: string, tag: string): string {
  const t = tag.toLowerCase();
  // Match opening tag (with possible attrs) + content + closing tag
  const re = new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${t}>`, 'gi');
  return html.replace(re, '$1');
}

/**
 * Rename a tag throughout the HTML string.
 */
export function replaceTag(html: string, fromTag: string, toTag: string): string {
  const ft = fromTag.toLowerCase();
  // Replace opening tags
  let result = html.replace(new RegExp(`<(${ft})(\\s[^>]*)?>`, 'gi'), `<${toTag}$2>`);
  // Replace closing tags
  result = result.replace(new RegExp(`<\\/${ft}>`, 'gi'), `</${toTag}>`);
  return result;
}

/**
 * Build an HTML opening (or self-closing) tag string.
 */
export function buildTag(tag: string, attrs?: Record<string, string>, selfClosing?: boolean): string {
  let s = `<${tag}`;
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      s += ` ${k}="${encodeHtml(v)}"`;
    }
  }
  s += selfClosing ? ' />' : '>';
  return s;
}

/**
 * Parse an attribute string like `class="foo" id="bar" disabled` into a Record.
 */
export function parseAttrs(attrString: string): Record<string, string> {
  const result: Record<string, string> = {};
  // Match: key="value", key='value', or bare key
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrString)) !== null) {
    const key = m[1];
    const val = m[2] ?? m[3] ?? m[4] ?? '';
    result[key] = val;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Sanitization
// ---------------------------------------------------------------------------

const DEFAULT_ALLOWED_TAGS = new Set([
  'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div',
]);

const DEFAULT_ALLOWED_ATTRS: Record<string, string[]> = {
  a: ['href', 'title'],
  img: ['src', 'alt'],
  '*': ['class', 'id'],
};

/**
 * Sanitize HTML: remove disallowed tags/attributes, strip event handlers.
 */
export function sanitize(html: string, options?: SanitizeOptions): string {
  const allowedTags = options?.allowedTags
    ? new Set(options.allowedTags.map(t => t.toLowerCase()))
    : DEFAULT_ALLOWED_TAGS;

  const allowedAttrs: Record<string, string[]> = options?.allowedAttrs ?? DEFAULT_ALLOWED_ATTRS;
  const stripComm = options?.stripComments ?? true;

  // Strip comments
  let result = stripComm ? stripComments(html) : html;

  // Strip script/style blocks entirely
  result = stripScripts(result);
  result = stripStyles(result);

  // Process tags one by one
  result = result.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)(\s[^>]*)?>/g, (match, slash: string, rawTag: string, attrPart: string) => {
    const tag = rawTag.toLowerCase();

    // Always block script/style
    if (tag === 'script' || tag === 'style') return '';

    if (!allowedTags.has(tag)) return '';

    // Closing tag — keep it
    if (slash === '/') return `</${tag}>`;

    // Opening tag — filter attributes
    const filteredAttrs: Record<string, string> = {};
    if (attrPart) {
      const parsed = parseAttrs(attrPart.trim());
      const tagAllowed = allowedAttrs[tag] ?? [];
      const globalAllowed = allowedAttrs['*'] ?? [];
      const permittedKeys = new Set([...tagAllowed, ...globalAllowed]);

      for (const [k, v] of Object.entries(parsed)) {
        const kl = k.toLowerCase();
        // Strip on* event handlers
        if (kl.startsWith('on')) continue;
        // Strip javascript: in href/src
        if ((kl === 'href' || kl === 'src') && /^\s*javascript\s*:/i.test(v)) continue;
        if (permittedKeys.has(kl)) {
          filteredAttrs[kl] = v;
        }
      }
    }

    return buildTag(tag, filteredAttrs);
  });

  return result;
}

/**
 * Returns true if the HTML contains no script tags, on* attrs, or javascript: URLs.
 */
export function isXssSafe(html: string): boolean {
  if (/<script[\s>]/i.test(html)) return false;
  if (/\bon\w+\s*=/i.test(html)) return false;
  if (/href\s*=\s*["']?\s*javascript\s*:/i.test(html)) return false;
  if (/src\s*=\s*["']?\s*javascript\s*:/i.test(html)) return false;
  return true;
}

/**
 * Remove all <script>...</script> blocks.
 */
export function stripScripts(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

/**
 * Remove all <style>...</style> blocks.
 */
export function stripStyles(html: string): string {
  return html.replace(/<style[\s\S]*?<\/style>/gi, '');
}

/**
 * Remove HTML comments <!-- ... -->.
 */
export function stripComments(html: string): string {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

/**
 * Extract all <a href> links with their text and optional title.
 */
export function extractLinks(html: string): Array<{ href: string; text: string; title?: string }> {
  const results: Array<{ href: string; text: string; title?: string }> = [];
  const re = /<a\s([^>]*)>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const attrs = parseAttrs(m[1]);
    const href = attrs['href'] ?? '';
    const text = htmlToText(m[2]);
    const entry: { href: string; text: string; title?: string } = { href, text };
    if (attrs['title']) entry.title = attrs['title'];
    results.push(entry);
  }
  return results;
}

/**
 * Extract all <img> tags with src, alt, title.
 */
export function extractImages(html: string): Array<{ src: string; alt?: string; title?: string }> {
  const results: Array<{ src: string; alt?: string; title?: string }> = [];
  const re = /<img\s([^>]*?)(?:\/)?>(?:<\/img>)?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const attrs = parseAttrs(m[1]);
    const src = attrs['src'] ?? '';
    const entry: { src: string; alt?: string; title?: string } = { src };
    if (attrs['alt'] !== undefined) entry.alt = attrs['alt'];
    if (attrs['title'] !== undefined) entry.title = attrs['title'];
    results.push(entry);
  }
  return results;
}

/**
 * Extract h1–h6 headings with their level and text.
 */
export function extractHeadings(html: string): Array<{ level: number; text: string }> {
  const results: Array<{ level: number; text: string }> = [];
  const re = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    results.push({ level: parseInt(m[1], 10), text: htmlToText(m[2]) });
  }
  return results;
}

/**
 * Extract <meta name="..." content="..."> pairs.
 */
export function extractMetaTags(html: string): MetaTag[] {
  const results: MetaTag[] = [];
  const re = /<meta\s([^>]*)>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const attrs = parseAttrs(m[1]);
    const name = attrs['name'] ?? attrs['property'] ?? '';
    const content = attrs['content'] ?? '';
    if (name) results.push({ name, content });
  }
  return results;
}

/**
 * Extract text content of all instances of a specific tag.
 */
export function extractText(html: string, tag: string): string[] {
  const results: string[] = [];
  const t = tag.toLowerCase();
  const re = new RegExp(`<${t}\\b[^>]*>([\\s\\S]*?)<\\/${t}>`, 'gi');
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    results.push(htmlToText(m[1]));
  }
  return results;
}

/**
 * Extract email addresses from the text content of the HTML.
 */
export function extractEmails(html: string): string[] {
  const text = htmlToText(html);
  const re = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
  return [...new Set(text.match(re) ?? [])];
}

/**
 * Count words in the text content of the HTML.
 */
export function countWords(html: string): number {
  const text = htmlToText(html).trim();
  if (!text) return 0;
  return text.split(/\s+/).length;
}

// ---------------------------------------------------------------------------
// Transformation
// ---------------------------------------------------------------------------

/**
 * Truncate HTML to maxChars of text content while keeping HTML balanced.
 */
export function truncateHtml(html: string, maxChars: number, ellipsis?: string): string {
  const ell = ellipsis ?? '…';
  let charCount = 0;
  let output = '';
  const tagStack: string[] = [];
  let i = 0;
  let done = false;

  while (i < html.length && !done) {
    if (html[i] === '<') {
      // Find end of tag
      const end = html.indexOf('>', i);
      if (end === -1) {
        // Malformed — treat rest as text
        const remaining = html.slice(i);
        const toAdd = remaining.slice(0, maxChars - charCount);
        output += toAdd;
        charCount += toAdd.length;
        done = charCount >= maxChars;
        break;
      }
      const tag = html.slice(i, end + 1);
      output += tag;
      i = end + 1;

      // Track open/close for balancing
      const tagMatch = tag.match(/^<(\/?)([a-zA-Z][a-zA-Z0-9]*)/);
      if (tagMatch) {
        const isClose = tagMatch[1] === '/';
        const tagName = tagMatch[2].toLowerCase();
        const voidTags = new Set(['br', 'hr', 'img', 'input', 'link', 'meta', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr']);
        if (!voidTags.has(tagName)) {
          if (isClose) {
            const idx = tagStack.lastIndexOf(tagName);
            if (idx !== -1) tagStack.splice(idx, 1);
          } else if (!tag.endsWith('/>')) {
            tagStack.push(tagName);
          }
        }
      }
    } else {
      // Text node
      const end = html.indexOf('<', i);
      const textEnd = end === -1 ? html.length : end;
      const text = html.slice(i, textEnd);
      const remaining = maxChars - charCount;

      if (text.length <= remaining) {
        output += text;
        charCount += text.length;
        i = textEnd;
      } else {
        output += text.slice(0, remaining) + ell;
        charCount = maxChars;
        done = true;
      }
    }
  }

  // Close unclosed tags in reverse order
  for (let j = tagStack.length - 1; j >= 0; j--) {
    output += `</${tagStack[j]}>`;
  }

  return output;
}

/**
 * Wrap matching terms in <mark> (or custom tag) elements.
 * Skips content inside HTML tags.
 */
export function highlightTerms(
  html: string,
  terms: string[],
  wrapTag_?: string,
  wrapClass?: string,
): string {
  if (terms.length === 0) return html;
  const tag = wrapTag_ ?? 'mark';
  const classAttr = wrapClass ? ` class="${wrapClass}"` : '';

  // Process only text nodes (outside tags)
  return html.replace(/(>|^)([\s\S]*?)(<|$)/g, (match, open: string, text: string, close: string) => {
    if (!text) return match;
    let result = text;
    for (const term of terms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(${escaped})`, 'gi');
      result = result.replace(re, `<${tag}${classAttr}>$1</${tag}>`);
    }
    return open + result + close;
  });
}

/**
 * Add target="_blank" rel="noopener noreferrer" to external <a> tags.
 */
export function addTargetBlank(html: string, excludeDomains?: string[]): string {
  return html.replace(/<a\s([^>]*)>/gi, (match, attrPart: string) => {
    const attrs = parseAttrs(attrPart);
    const href = attrs['href'] ?? '';

    // Only external URLs
    if (!/^https?:\/\//i.test(href)) return match;

    // Check excludeDomains
    if (excludeDomains && excludeDomains.length > 0) {
      const excluded = excludeDomains.some(domain => href.includes(domain));
      if (excluded) return match;
    }

    attrs['target'] = '_blank';
    attrs['rel'] = 'noopener noreferrer';

    let newTag = '<a';
    for (const [k, v] of Object.entries(attrs)) {
      newTag += ` ${k}="${v}"`;
    }
    newTag += '>';
    return newTag;
  });
}

/**
 * Add loading="lazy" to all <img> tags.
 */
export function lazyLoadImages(html: string): string {
  return html.replace(/<img\s([^>]*?)(\/??>)/gi, (match, attrPart: string, end: string) => {
    if (/loading\s*=/i.test(attrPart)) return match;
    return `<img ${attrPart.trim()} loading="lazy"${end}`;
  });
}

/**
 * Convert relative href/src URLs to absolute using baseUrl.
 */
export function absolutifyUrls(html: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '');

  return html.replace(/(href|src)\s*=\s*["']([^"']+)["']/gi, (match, attr: string, url: string) => {
    if (/^(https?:\/\/|\/\/|mailto:|tel:|#|javascript:)/i.test(url)) return match;
    const absolute = url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
    const q = match.includes('"') ? '"' : "'";
    return `${attr}=${q}${absolute}${q}`;
  });
}

/**
 * Minify HTML: collapse whitespace between tags, strip comments.
 */
export function minifyHtml(html: string): string {
  let result = stripComments(html);
  // Replace whitespace-only text between tags with a single space
  result = result.replace(/>\s+</g, '> <');
  // Collapse multiple internal whitespace
  result = result.replace(/\s{2,}/g, ' ');
  return result.trim();
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

/**
 * Return stats about an HTML string.
 */
export function getHtmlStats(html: string): HtmlStats {
  const tagCount = (html.match(/<[a-zA-Z][^>]*>/g) ?? []).length;
  const textLength = htmlToText(html).length;
  const linkCount = (html.match(/<a\s/gi) ?? []).length;
  const imageCount = (html.match(/<img\s/gi) ?? []).length;
  const headingCount = (html.match(/<h[1-6]\b/gi) ?? []).length;
  return { tagCount, textLength, linkCount, imageCount, headingCount };
}

/**
 * Estimate reading time in minutes (default 200 wpm).
 */
export function estimateReadingTime(html: string, wpm?: number): number {
  const words = countWords(html);
  const rate = wpm ?? 200;
  return Math.ceil(words / rate);
}
