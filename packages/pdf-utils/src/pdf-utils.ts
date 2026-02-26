// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ---------------------------------------------------------------------------
// PDF version detection
// ---------------------------------------------------------------------------

/**
 * Reads the first line of a PDF buffer/string and returns the version string.
 * "%PDF-1.4" → "1.4", null if not a PDF.
 */
export function detectPdfVersion(data: Buffer | string): string | null {
  const header = Buffer.isBuffer(data) ? data.slice(0, 16).toString('ascii') : data.slice(0, 16);
  const match = header.match(/^%PDF-(\d+\.\d+)/);
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// PDF validation
// ---------------------------------------------------------------------------

/**
 * Returns true if the data starts with the PDF magic bytes "%PDF-".
 */
export function isPdf(data: Buffer | string): boolean {
  if (Buffer.isBuffer(data)) {
    if (data.length < 5) return false;
    return (
      data[0] === 0x25 && // %
      data[1] === 0x50 && // P
      data[2] === 0x44 && // D
      data[3] === 0x46 && // F
      data[4] === 0x2d    // -
    );
  }
  return data.startsWith('%PDF-');
}

// ---------------------------------------------------------------------------
// PDF Metadata
// ---------------------------------------------------------------------------

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modDate?: Date;
  pageCount?: number;
  version?: string;
  encrypted?: boolean;
  fileSize?: number;
}

/**
 * Parse metadata from a PDF Info dictionary text (simplified).
 * Parses lines like "/Title (Document Title)\n/Author (John Doe)\n..."
 */
export function parseMetadata(raw: string): PdfMetadata {
  const meta: PdfMetadata = {};

  const extract = (key: string): string | undefined => {
    const re = new RegExp(`/${key}\\s*\\(([^)]*)\\)`);
    const m = raw.match(re);
    return m ? m[1] : undefined;
  };

  const title = extract('Title');
  if (title !== undefined) meta.title = title;

  const author = extract('Author');
  if (author !== undefined) meta.author = author;

  const subject = extract('Subject');
  if (subject !== undefined) meta.subject = subject;

  const keywordsRaw = extract('Keywords');
  if (keywordsRaw !== undefined) {
    meta.keywords = keywordsRaw.split(',').map((k) => k.trim()).filter((k) => k.length > 0);
  }

  const creator = extract('Creator');
  if (creator !== undefined) meta.creator = creator;

  const producer = extract('Producer');
  if (producer !== undefined) meta.producer = producer;

  const creationDateStr = extract('CreationDate');
  if (creationDateStr !== undefined) {
    const d = parsePdfDate(creationDateStr);
    if (d) meta.creationDate = d;
  }

  const modDateStr = extract('ModDate');
  if (modDateStr !== undefined) {
    const d = parsePdfDate(modDateStr);
    if (d) meta.modDate = d;
  }

  const pageCountMatch = raw.match(/\/PageCount\s+(\d+)/);
  if (pageCountMatch) meta.pageCount = parseInt(pageCountMatch[1], 10);

  const versionMatch = raw.match(/\/Version\s+\(([^)]+)\)/);
  if (versionMatch) meta.version = versionMatch[1];

  const encryptedMatch = raw.match(/\/Encrypted\s+(true|false)/i);
  if (encryptedMatch) meta.encrypted = encryptedMatch[1].toLowerCase() === 'true';

  const fileSizeMatch = raw.match(/\/FileSize\s+(\d+)/);
  if (fileSizeMatch) meta.fileSize = parseInt(fileSizeMatch[1], 10);

  return meta;
}

function parsePdfDate(s: string): Date | null {
  // PDF date format: D:YYYYMMDDHHmmSSOHH'mm' or ISO
  const pdfMatch = s.match(/^D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (pdfMatch) {
    const [, y, mo, d, h, mi, sec] = pdfMatch;
    return new Date(`${y}-${mo}-${d}T${h}:${mi}:${sec}Z`);
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Serialize metadata to PDF Info dict format.
 */
export function serializeMetadata(meta: Partial<PdfMetadata>): string {
  const lines: string[] = [];

  if (meta.title !== undefined) lines.push(`/Title (${meta.title})`);
  if (meta.author !== undefined) lines.push(`/Author (${meta.author})`);
  if (meta.subject !== undefined) lines.push(`/Subject (${meta.subject})`);
  if (meta.keywords !== undefined) lines.push(`/Keywords (${meta.keywords.join(', ')})`);
  if (meta.creator !== undefined) lines.push(`/Creator (${meta.creator})`);
  if (meta.producer !== undefined) lines.push(`/Producer (${meta.producer})`);
  if (meta.creationDate !== undefined) {
    lines.push(`/CreationDate (${formatPdfDate(meta.creationDate)})`);
  }
  if (meta.modDate !== undefined) {
    lines.push(`/ModDate (${formatPdfDate(meta.modDate)})`);
  }
  if (meta.pageCount !== undefined) lines.push(`/PageCount ${meta.pageCount}`);
  if (meta.version !== undefined) lines.push(`/Version (${meta.version})`);
  if (meta.encrypted !== undefined) lines.push(`/Encrypted ${meta.encrypted}`);
  if (meta.fileSize !== undefined) lines.push(`/FileSize ${meta.fileSize}`);

  return lines.join('\n');
}

function formatPdfDate(d: Date): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  return `D:${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
}

// ---------------------------------------------------------------------------
// Page size constants (points: 1pt = 1/72 inch)
// ---------------------------------------------------------------------------

export interface PageSize {
  width: number;
  height: number;
  name: string;
}

export const PAGE_SIZES: Record<string, PageSize> = {
  A0: { name: 'A0', width: 2384, height: 3370 },
  A1: { name: 'A1', width: 1684, height: 2384 },
  A2: { name: 'A2', width: 1191, height: 1684 },
  A3: { name: 'A3', width: 842, height: 1191 },
  A4: { name: 'A4', width: 595, height: 842 },
  A5: { name: 'A5', width: 420, height: 595 },
  A6: { name: 'A6', width: 298, height: 420 },
  B4: { name: 'B4', width: 709, height: 1001 },
  B5: { name: 'B5', width: 499, height: 709 },
  Letter: { name: 'Letter', width: 612, height: 792 },
  Legal: { name: 'Legal', width: 612, height: 1008 },
  Tabloid: { name: 'Tabloid', width: 792, height: 1224 },
  Executive: { name: 'Executive', width: 522, height: 756 },
  Statement: { name: 'Statement', width: 396, height: 612 },
  Folio: { name: 'Folio', width: 612, height: 936 },
};

/**
 * Get page size by name. If landscape is true, width and height are swapped.
 */
export function getPageSize(name: string, landscape?: boolean): PageSize | undefined {
  const size = PAGE_SIZES[name];
  if (!size) return undefined;
  if (landscape) {
    return { name: size.name, width: size.height, height: size.width };
  }
  return size;
}

// ---------------------------------------------------------------------------
// Unit conversion
// ---------------------------------------------------------------------------

const PT_PER_MM = 72 / 25.4;
const PT_PER_IN = 72;

export function ptToMm(pt: number): number {
  return pt / PT_PER_MM;
}

export function mmToPt(mm: number): number {
  return mm * PT_PER_MM;
}

export function ptToIn(pt: number): number {
  return pt / PT_PER_IN;
}

export function inToPt(inches: number): number {
  return inches * PT_PER_IN;
}

// ---------------------------------------------------------------------------
// PDF colour space utilities
// ---------------------------------------------------------------------------

export type ColorSpace = 'RGB' | 'CMYK' | 'Grayscale';

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface CMYKColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

export function rgbToCmyk(rgb: RGBColor): CMYKColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 1 };
  return {
    c: (1 - r - k) / (1 - k),
    m: (1 - g - k) / (1 - k),
    y: (1 - b - k) / (1 - k),
    k,
  };
}

export function cmykToRgb(cmyk: CMYKColor): RGBColor {
  const r = 255 * (1 - cmyk.c) * (1 - cmyk.k);
  const g = 255 * (1 - cmyk.m) * (1 - cmyk.k);
  const b = 255 * (1 - cmyk.y) * (1 - cmyk.k);
  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
  };
}

export function rgbToGrayscale(rgb: RGBColor): number {
  return Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
}

export function hexToRgb(hex: string): RGBColor {
  const clean = hex.replace(/^#/, '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Returns PDF rg/RG operator string: "r g b RG" with values in 0-1 range (3 decimal places).
 */
export function rgbToPdfColor(rgb: RGBColor): string {
  const fmt = (n: number) => (Math.max(0, Math.min(255, n)) / 255).toFixed(3);
  return `${fmt(rgb.r)} ${fmt(rgb.g)} ${fmt(rgb.b)} RG`;
}

// ---------------------------------------------------------------------------
// PDF coordinate system (origin bottom-left)
// ---------------------------------------------------------------------------

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Convert top-left y to bottom-left y: pageHeight - y
 */
export function flipY(y: number, pageHeight: number): number {
  return pageHeight - y;
}

export function rectFromTopLeft(x: number, y: number, w: number, h: number, pageHeight: number): Rect {
  return { x, y: pageHeight - y - h, width: w, height: h };
}

// ---------------------------------------------------------------------------
// Text utilities for PDF
// ---------------------------------------------------------------------------

/**
 * Simple estimate: text.length * fontSizePt * (charsPerPt ?? 0.5)
 */
export function estimateTextWidth(text: string, fontSizePt: number, charsPerPt?: number): number {
  return text.length * fontSizePt * (charsPerPt ?? 0.5);
}

/**
 * Word-wrap text to fit within maxWidthPt; returns array of lines.
 */
export function wrapText(text: string, maxWidthPt: number, fontSizePt: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (estimateTextWidth(candidate, fontSizePt) <= maxWidthPt) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      // If single word is wider than line, still push it (no breaking within words)
      if (estimateTextWidth(word, fontSizePt) > maxWidthPt) {
        lines.push(word);
        current = '';
      } else {
        current = word;
      }
    }
  }

  if (current) lines.push(current);
  return lines;
}

/**
 * Truncate text to fit within maxWidthPt, appending ellipsis if needed.
 */
export function truncateText(
  text: string,
  maxWidthPt: number,
  fontSizePt: number,
  ellipsis = '...'
): string {
  if (estimateTextWidth(text, fontSizePt) <= maxWidthPt) return text;
  const ellipsisWidth = estimateTextWidth(ellipsis, fontSizePt);
  let result = '';
  for (const char of text) {
    const candidate = result + char;
    if (estimateTextWidth(candidate, fontSizePt) + ellipsisWidth > maxWidthPt) {
      break;
    }
    result = candidate;
  }
  return result + ellipsis;
}

// ---------------------------------------------------------------------------
// Table layout
// ---------------------------------------------------------------------------

export interface TableCell {
  text: string;
  colspan?: number;
  rowspan?: number;
  align?: 'left' | 'center' | 'right';
}

export interface TableRow {
  cells: TableCell[];
}

export interface TableLayout {
  rows: TableRow[];
  columnWidths: number[];
  rowHeight: number;
  totalWidth: number;
  totalHeight: number;
}

export function calculateTableLayout(
  rows: TableRow[],
  columnWidths: number[],
  rowHeight = 20
): TableLayout {
  const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
  const totalHeight = rows.length * rowHeight;
  return { rows, columnWidths, rowHeight, totalWidth, totalHeight };
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationOptions {
  itemsPerPage: number;
  totalItems: number;
}

export interface PaginationResult {
  totalPages: number;
  pages: Array<{ page: number; startIndex: number; endIndex: number; count: number }>;
}

export function paginate(opts: PaginationOptions): PaginationResult {
  const { itemsPerPage, totalItems } = opts;
  if (itemsPerPage <= 0 || totalItems <= 0) {
    return { totalPages: 0, pages: [] };
  }
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pages = [];
  for (let p = 1; p <= totalPages; p++) {
    const startIndex = (p - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);
    const count = endIndex - startIndex + 1;
    pages.push({ page: p, startIndex, endIndex, count });
  }
  return { totalPages, pages };
}

// ---------------------------------------------------------------------------
// Bookmark/outline structure
// ---------------------------------------------------------------------------

export interface Bookmark {
  title: string;
  page: number;
  children?: Bookmark[];
}

export function flattenBookmarks(
  bookmarks: Bookmark[],
  depth = 0
): Array<{ title: string; page: number; depth: number }> {
  const result: Array<{ title: string; page: number; depth: number }> = [];
  for (const bm of bookmarks) {
    result.push({ title: bm.title, page: bm.page, depth });
    if (bm.children && bm.children.length > 0) {
      result.push(...flattenBookmarks(bm.children, depth + 1));
    }
  }
  return result;
}

export function countBookmarks(bookmarks: Bookmark[]): number {
  let count = 0;
  for (const bm of bookmarks) {
    count += 1;
    if (bm.children && bm.children.length > 0) {
      count += countBookmarks(bm.children);
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// Watermark text generation
// ---------------------------------------------------------------------------

export function createWatermarkText(
  text: string,
  opts?: { repeat?: number; separator?: string; uppercase?: boolean }
): string {
  const repeat = opts?.repeat ?? 1;
  const separator = opts?.separator ?? ' ';
  const uppercase = opts?.uppercase ?? false;
  const base = uppercase ? text.toUpperCase() : text;
  const parts = Array(repeat).fill(base);
  return parts.join(separator);
}

// ---------------------------------------------------------------------------
// File size formatting
// ---------------------------------------------------------------------------

export function formatFileSize(bytes: number): string {
  if (bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

// ---------------------------------------------------------------------------
// PDF/A compliance level
// ---------------------------------------------------------------------------

export type PdfALevel = '1a' | '1b' | '2a' | '2b' | '2u' | '3a' | '3b' | '3u';

// Features NOT compatible with each PDF/A level
const PDFA_INCOMPATIBLE: Record<PdfALevel, string[]> = {
  '1a': ['transparency', 'javascript', 'encryption', 'lzw', 'attachments', 'optional-content', 'rich-media'],
  '1b': ['transparency', 'javascript', 'encryption', 'lzw', 'attachments', 'optional-content', 'rich-media'],
  '2a': ['javascript', 'encryption', 'lzw', 'rich-media'],
  '2b': ['javascript', 'encryption', 'lzw', 'rich-media'],
  '2u': ['javascript', 'encryption', 'lzw', 'rich-media'],
  '3a': ['javascript', 'encryption'],
  '3b': ['javascript', 'encryption'],
  '3u': ['javascript', 'encryption'],
};

/**
 * Returns true if all listed features are compatible with the given PDF/A level.
 */
export function isPdfACompliant(level: PdfALevel, features: string[]): boolean {
  const incompatible = PDFA_INCOMPATIBLE[level] ?? [];
  for (const f of features) {
    if (incompatible.includes(f)) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Merge metadata
// ---------------------------------------------------------------------------

export function mergeMetadata(
  base: Partial<PdfMetadata>,
  override: Partial<PdfMetadata>
): PdfMetadata {
  return { ...base, ...override } as PdfMetadata;
}

// ---------------------------------------------------------------------------
// Generate unique PDF object ID
// ---------------------------------------------------------------------------

/**
 * Returns the smallest positive integer not in the existing array.
 */
export function generateObjectId(existing: number[]): number {
  const set = new Set(existing);
  let id = 1;
  while (set.has(id)) id++;
  return id;
}

// ---------------------------------------------------------------------------
// Cross-reference table
// ---------------------------------------------------------------------------

export interface XrefEntry {
  objectNumber: number;
  generation: number;
  offset: number;
  free: boolean;
}

export function buildXrefTable(entries: XrefEntry[]): string {
  const sorted = [...entries].sort((a, b) => a.objectNumber - b.objectNumber);
  const lines: string[] = ['xref', `0 ${sorted.length}`];
  for (const e of sorted) {
    const offsetStr = String(e.offset).padStart(10, '0');
    const genStr = String(e.generation).padStart(5, '0');
    const type = e.free ? 'f' : 'n';
    lines.push(`${offsetStr} ${genStr} ${type} `);
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// PDF checksum (simple, not cryptographic)
// ---------------------------------------------------------------------------

/**
 * Sum of char codes mod 65536.
 */
export function pdfChecksum(data: string): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum = (sum + data.charCodeAt(i)) % 65536;
  }
  return sum;
}
