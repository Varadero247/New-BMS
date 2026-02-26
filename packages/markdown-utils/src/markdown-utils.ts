// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type {
  MarkdownHeading,
  MarkdownLink,
  MarkdownCodeBlock,
  MarkdownTable,
  MarkdownStats,
  ToHtmlOptions,
  FrontMatter,
} from './types';

// ─── Internal helpers ────────────────────────────────────────────────────────

/** Escape HTML special characters in a string. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Apply inline Markdown transforms (bold, italic, code, links, images) to an
 *  already HTML-escaped string.  The caller must escape first, then inline. */
function applyInline(escaped: string): string {
  let s = escaped;

  // Inline code — do first so inner chars are not re-processed.
  s = s.replace(/`([^`]+)`/g, (_m, code) => `<code>${code}</code>`);

  // Images  ![alt](url)
  s = s.replace(
    /!\[([^\]]*)\]\(([^)]*)\)/g,
    (_m, alt, url) => `<img src="${url}" alt="${alt}" />`,
  );

  // Links  [text](url)
  s = s.replace(
    /\[([^\]]+)\]\(([^)]*)\)/g,
    (_m, text, url) => `<a href="${url}">${text}</a>`,
  );

  // Bold **text** or __text__
  s = s.replace(/\*\*([^*]+)\*\*/g, (_m, t) => `<strong>${t}</strong>`);
  s = s.replace(/__([^_]+)__/g, (_m, t) => `<strong>${t}</strong>`);

  // Italic *text* or _text_  (single delimiters, not preceded by another)
  s = s.replace(/\*([^*\n]+)\*/g, (_m, t) => `<em>${t}</em>`);
  s = s.replace(/_([^_\n]+)_/g, (_m, t) => `<em>${t}</em>`);

  return s;
}

// ─── Conversion ──────────────────────────────────────────────────────────────

/**
 * Convert Markdown to HTML.
 *
 * Supports: h1-h6, **bold**, *italic*, `inline code`, fenced code blocks,
 * [links](url), ![images](url), > blockquotes, - /* unordered lists,
 * 1. ordered lists, --- horizontal rules, blank-line-separated paragraphs.
 */
export function toHtml(markdown: string, options: ToHtmlOptions = {}): string {
  const addIds = options.addHeadingIds !== false;

  const lines = markdown.split('\n');
  const out: string[] = [];

  let inCodeBlock = false;
  let codeLang = '';
  let codeLines: string[] = [];

  let inUl = false;
  let inOl = false;
  let inBlockquote = false;
  let paragraphLines: string[] = [];

  function flushParagraph(): void {
    if (paragraphLines.length === 0) return;
    const content = paragraphLines.join(' ').trim();
    if (content) {
      out.push(`<p>${applyInline(escapeHtml(content))}</p>`);
    }
    paragraphLines = [];
  }

  function flushUl(): void {
    if (!inUl) return;
    out.push('</ul>');
    inUl = false;
  }

  function flushOl(): void {
    if (!inOl) return;
    out.push('</ol>');
    inOl = false;
  }

  function flushBlockquote(): void {
    if (!inBlockquote) return;
    out.push('</blockquote>');
    inBlockquote = false;
  }

  function flushAll(): void {
    flushParagraph();
    flushUl();
    flushOl();
    flushBlockquote();
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];

    // ── Fenced code blocks ─────────────────────────────────────────────────
    if (!inCodeBlock && /^```/.test(raw)) {
      flushAll();
      codeLang = raw.slice(3).trim();
      codeLines = [];
      inCodeBlock = true;
      continue;
    }
    if (inCodeBlock) {
      if (/^```/.test(raw)) {
        const langAttr = codeLang ? ` class="language-${escapeHtml(codeLang)}"` : '';
        out.push(`<pre><code${langAttr}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        inCodeBlock = false;
        codeLang = '';
        codeLines = [];
      } else {
        codeLines.push(raw);
      }
      continue;
    }

    // ── Blank lines ────────────────────────────────────────────────────────
    if (raw.trim() === '') {
      flushAll();
      continue;
    }

    // ── Horizontal rule ────────────────────────────────────────────────────
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(raw.trim())) {
      flushAll();
      out.push('<hr />');
      continue;
    }

    // ── ATX Headings ───────────────────────────────────────────────────────
    const headingMatch = raw.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      flushAll();
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      const text = headingMatch[2].trim();
      const idAttr = addIds ? ` id="${slugify(text)}"` : '';
      out.push(`<h${level}${idAttr}>${applyInline(escapeHtml(text))}</h${level}>`);
      continue;
    }

    // ── Blockquotes ────────────────────────────────────────────────────────
    const bqMatch = raw.match(/^>\s?(.*)/);
    if (bqMatch) {
      flushParagraph();
      flushUl();
      flushOl();
      if (!inBlockquote) {
        out.push('<blockquote>');
        inBlockquote = true;
      }
      out.push(`<p>${applyInline(escapeHtml(bqMatch[1]))}</p>`);
      continue;
    }
    if (inBlockquote) {
      flushBlockquote();
    }

    // ── Unordered lists ────────────────────────────────────────────────────
    const ulMatch = raw.match(/^([*\-+])\s+(.*)/);
    if (ulMatch) {
      flushParagraph();
      flushOl();
      if (!inUl) {
        out.push('<ul>');
        inUl = true;
      }
      out.push(`<li>${applyInline(escapeHtml(ulMatch[2]))}</li>`);
      continue;
    }

    // ── Ordered lists ──────────────────────────────────────────────────────
    const olMatch = raw.match(/^\d+\.\s+(.*)/);
    if (olMatch) {
      flushParagraph();
      flushUl();
      if (!inOl) {
        out.push('<ol>');
        inOl = true;
      }
      out.push(`<li>${applyInline(escapeHtml(olMatch[1]))}</li>`);
      continue;
    }

    // ── Paragraph accumulation ─────────────────────────────────────────────
    flushUl();
    flushOl();
    paragraphLines.push(raw);
  }

  // Flush anything still open
  flushAll();

  const body = out.join('\n');

  if (options.fullDocument) {
    const title = escapeHtml(options.title ?? 'Document');
    return `<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><title>${title}</title></head>\n<body>\n${body}\n</body>\n</html>`;
  }

  return body;
}

/**
 * Strip all Markdown syntax and return plain text.
 */
export function toPlainText(markdown: string): string {
  let s = markdown;

  // Remove front matter
  s = removeFrontMatter(s);

  // Remove fenced code blocks (keep code text)
  s = s.replace(/```[^\n]*\n([\s\S]*?)```/g, '$1');

  // Remove inline code markers
  s = s.replace(/`([^`]+)`/g, '$1');

  // Remove images
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, '');

  // Remove links but keep text
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // Remove headings markers
  s = s.replace(/^#{1,6}\s+/gm, '');

  // Remove bold/italic
  s = s.replace(/\*\*([^*]+)\*\*/g, '$1');
  s = s.replace(/__([^_]+)__/g, '$1');
  s = s.replace(/\*([^*\n]+)\*/g, '$1');
  s = s.replace(/_([^_\n]+)_/g, '$1');

  // Remove blockquote markers
  s = s.replace(/^>\s?/gm, '');

  // Remove list markers
  s = s.replace(/^[*\-+]\s+/gm, '');
  s = s.replace(/^\d+\.\s+/gm, '');

  // Remove horizontal rules
  s = s.replace(/^(-{3,}|\*{3,}|_{3,})\s*$/gm, '');

  // Collapse multiple blank lines
  s = s.replace(/\n{3,}/g, '\n\n');

  return s.trim();
}

/** Alias for `toPlainText`. */
export function stripMarkdown(markdown: string): string {
  return toPlainText(markdown);
}

// ─── Extraction ───────────────────────────────────────────────────────────────

/**
 * Extract all ATX headings from a Markdown string.
 */
export function extractHeadings(markdown: string): MarkdownHeading[] {
  const results: MarkdownHeading[] = [];
  const lines = markdown.split('\n');
  let inCode = false;
  for (const line of lines) {
    if (/^```/.test(line)) { inCode = !inCode; continue; }
    if (inCode) continue;
    const m = line.match(/^(#{1,6})\s+(.*)/);
    if (m) {
      const level = m[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      const text = m[2].trim();
      results.push({ level, text, id: slugify(text) });
    }
  }
  return results;
}

/**
 * Extract all hyperlinks and images from Markdown.
 */
export function extractLinks(markdown: string): MarkdownLink[] {
  const results: MarkdownLink[] = [];
  // Images first (must come before link pattern to avoid double-match)
  const imgRe = /!\[([^\]]*)\]\(([^)]*)\)/g;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(markdown)) !== null) {
    results.push({ text: m[1], url: m[2], isImage: true });
  }
  // Links (skip images)
  const linkRe = /(?<!!)(?<!\])\[([^\]]+)\]\(([^)]*)\)/g;
  while ((m = linkRe.exec(markdown)) !== null) {
    results.push({ text: m[1], url: m[2], isImage: false });
  }
  return results;
}

/**
 * Extract only image links from Markdown.
 */
export function extractImages(markdown: string): MarkdownLink[] {
  return extractLinks(markdown).filter((l) => l.isImage);
}

/**
 * Extract fenced code blocks from Markdown.
 */
export function extractCodeBlocks(markdown: string): MarkdownCodeBlock[] {
  const results: MarkdownCodeBlock[] = [];
  const re = /```([^\n]*)\n([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    results.push({ language: m[1].trim(), code: m[2] });
  }
  return results;
}

/**
 * Extract GFM-style pipe tables from Markdown.
 */
export function extractTables(markdown: string): MarkdownTable[] {
  const results: MarkdownTable[] = [];
  const lines = markdown.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\|/.test(line)) {
      const headers = parsePipeRow(line);
      // Next line should be separator
      if (i + 1 < lines.length && /^\|[-| :]+\|/.test(lines[i + 1])) {
        const rows: string[][] = [];
        let j = i + 2;
        while (j < lines.length && /^\|/.test(lines[j])) {
          rows.push(parsePipeRow(lines[j]));
          j++;
        }
        results.push({ headers, rows });
        i = j;
        continue;
      }
    }
    i++;
  }
  return results;
}

function parsePipeRow(line: string): string[] {
  return line
    .split('|')
    .map((c) => c.trim())
    .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
}

/**
 * Extract YAML-like front matter from a Markdown document.
 *
 * Front matter is delimited by `---` on the first line and a closing `---`.
 * Each line inside is treated as `key: value`.  Values that look like numbers,
 * booleans, or comma-separated lists are coerced accordingly.
 */
export function extractFrontMatter(markdown: string): { data: FrontMatter; content: string } {
  const fm: FrontMatter = {};
  const lines = markdown.split('\n');

  if (lines[0]?.trim() !== '---') {
    return { data: fm, content: markdown };
  }

  let closeIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      closeIdx = i;
      break;
    }
  }

  if (closeIdx === -1) {
    return { data: fm, content: markdown };
  }

  const fmLines = lines.slice(1, closeIdx);
  for (const fmLine of fmLines) {
    const colonIdx = fmLine.indexOf(':');
    if (colonIdx === -1) continue;
    const key = fmLine.slice(0, colonIdx).trim();
    const rawVal = fmLine.slice(colonIdx + 1).trim();
    fm[key] = coerceFmValue(rawVal);
  }

  const content = lines.slice(closeIdx + 1).join('\n').replace(/^\n/, '');
  return { data: fm, content };
}

function coerceFmValue(raw: string): string | number | boolean | string[] {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  const num = Number(raw);
  if (!isNaN(num) && raw !== '') return num;
  // Simple array: [a, b, c] or a, b, c
  if (raw.startsWith('[') && raw.endsWith(']')) {
    return raw
      .slice(1, -1)
      .split(',')
      .map((s) => s.trim());
  }
  return raw;
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

/**
 * Count words in a string.
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Return aggregate statistics for a Markdown document.
 */
export function getStats(markdown: string): MarkdownStats {
  const plain = toPlainText(markdown);
  const wordCount = countWords(plain);
  const headingCount = extractHeadings(markdown).length;
  const links = extractLinks(markdown);
  const linkCount = links.filter((l) => !l.isImage).length;
  const imageCount = links.filter((l) => l.isImage).length;
  const codeBlockCount = extractCodeBlocks(markdown).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
  return {
    wordCount,
    charCount: markdown.length,
    headingCount,
    linkCount,
    imageCount,
    codeBlockCount,
    readingTimeMinutes,
  };
}

/**
 * Generate a Markdown table of contents from headings in the document.
 */
export function getTableOfContents(markdown: string): string {
  const headings = extractHeadings(markdown);
  if (headings.length === 0) return '';
  const minLevel = Math.min(...headings.map((h) => h.level));
  return headings
    .map((h) => {
      const indent = '  '.repeat(h.level - minLevel);
      return `${indent}- [${h.text}](#${h.id})`;
    })
    .join('\n');
}

// ─── Transformation ───────────────────────────────────────────────────────────

/**
 * Convert text to a URL-safe slug.
 * Lowercases, replaces non-alphanumeric runs with hyphens, trims edge hyphens.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Add `{#slug}` anchors after each heading.
 */
export function addHeadingIds(markdown: string): string {
  return markdown.replace(/^(#{1,6})\s+(.*)/gm, (_m, hashes, text) => {
    const trimmed = text.trim();
    const id = slugify(trimmed);
    return `${hashes} ${trimmed} {#${id}}`;
  });
}

/**
 * Shift all heading levels so the minimum level equals `baseLevel` (default 1).
 */
export function normalizeHeadings(markdown: string, baseLevel: number = 1): string {
  const headings = extractHeadings(markdown);
  if (headings.length === 0) return markdown;
  const minLevel = Math.min(...headings.map((h) => h.level));
  const delta = baseLevel - minLevel;
  if (delta === 0) return markdown;

  return markdown.replace(/^(#{1,6})(\s+.*)/gm, (_m, hashes, rest) => {
    const newLevel = Math.min(6, Math.max(1, hashes.length + delta));
    return '#'.repeat(newLevel) + rest;
  });
}

/**
 * Remove `<script>` tags, `on*` event attributes, and `javascript:` href/src values.
 */
export function sanitizeHtml(html: string): string {
  let s = html;
  // Remove script tags and their content
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  // Remove on* attributes
  s = s.replace(/\s+on\w+="[^"]*"/gi, '');
  s = s.replace(/\s+on\w+='[^']*'/gi, '');
  s = s.replace(/\s+on\w+=[^\s>]*/gi, '');
  // Remove javascript: URIs in href/src
  s = s.replace(/\b(href|src)="javascript:[^"]*"/gi, '$1="#"');
  s = s.replace(/\b(href|src)='javascript:[^']*'/gi, "$1='#'");
  return s;
}

/**
 * Truncate Markdown at the nearest word boundary at or before `maxWords`.
 * Appends "..." when truncation occurs.
 */
export function truncateMarkdown(markdown: string, maxWords: number): string {
  const words = markdown.trim().split(/\s+/);
  if (words.length <= maxWords) return markdown.trim();
  return words.slice(0, maxWords).join(' ') + '...';
}

/**
 * Wrap every occurrence of `term` (case-insensitive) in `==term==` mark syntax.
 */
export function highlight(markdown: string, term: string): string {
  if (!term) return markdown;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');
  return markdown.replace(re, '==$1==');
}

/**
 * Add or replace the front matter block of a Markdown document.
 */
export function mergeFrontMatter(markdown: string, data: FrontMatter): string {
  const { content } = extractFrontMatter(markdown);
  const lines = ['---'];
  for (const [key, val] of Object.entries(data)) {
    if (Array.isArray(val)) {
      lines.push(`${key}: [${val.join(', ')}]`);
    } else {
      lines.push(`${key}: ${String(val)}`);
    }
  }
  lines.push('---');
  return lines.join('\n') + '\n' + content;
}

/**
 * Remove the front matter block from a Markdown document, returning only the body.
 */
export function removeFrontMatter(markdown: string): string {
  return extractFrontMatter(markdown).content;
}

// ─── Building ─────────────────────────────────────────────────────────────────

/** Create a Markdown heading string. */
export function heading(level: 1 | 2 | 3 | 4 | 5 | 6, text: string): string {
  return `${'#'.repeat(level)} ${text}`;
}

/** Wrap text in bold markers. */
export function bold(text: string): string {
  return `**${text}**`;
}

/** Wrap text in italic markers. */
export function italic(text: string): string {
  return `*${text}*`;
}

/** Wrap text in inline code backticks. */
export function code(text: string): string {
  return `\`${text}\``;
}

/** Create a fenced code block. */
export function codeBlock(codeStr: string, language: string = ''): string {
  return `\`\`\`${language}\n${codeStr}\n\`\`\``;
}

/** Create a Markdown hyperlink. */
export function link(text: string, url: string): string {
  return `[${text}](${url})`;
}

/** Create a Markdown image tag. */
export function image(alt: string, url: string): string {
  return `![${alt}](${url})`;
}

/** Wrap text in a blockquote. */
export function blockquote(text: string): string {
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

/** Create an unordered or ordered list from an array of items. */
export function list(items: string[], ordered: boolean = false): string {
  return items
    .map((item, idx) => (ordered ? `${idx + 1}. ${item}` : `- ${item}`))
    .join('\n');
}

/** Create a GFM pipe table from headers and rows. */
export function table(headers: string[], rows: string[][]): string {
  const headerRow = `| ${headers.join(' | ')} |`;
  const separator = `| ${headers.map(() => '---').join(' | ')} |`;
  const dataRows = rows.map((r) => `| ${r.join(' | ')} |`).join('\n');
  return [headerRow, separator, ...(dataRows ? [dataRows] : [])].join('\n');
}

/** Return a Markdown horizontal rule. */
export function horizontalRule(): string {
  return '---';
}
