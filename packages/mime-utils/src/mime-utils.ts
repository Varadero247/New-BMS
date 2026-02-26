// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * Extension → MIME type map (120+ entries).
 */
export const MIME_MAP: Record<string, string> = {
  // Text / markup
  html: 'text/html',
  htm: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  mjs: 'application/javascript',
  ts: 'application/typescript',
  tsx: 'application/typescript',
  jsx: 'application/javascript',
  json: 'application/json',
  xml: 'application/xml',
  csv: 'text/csv',
  txt: 'text/plain',
  md: 'text/markdown',
  markdown: 'text/markdown',
  rtf: 'application/rtf',
  yaml: 'application/x-yaml',
  yml: 'application/x-yaml',
  toml: 'application/toml',
  ini: 'text/plain',
  env: 'text/plain',
  log: 'text/plain',
  sql: 'application/sql',
  graphql: 'application/graphql',
  // Documents
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odp: 'application/vnd.oasis.opendocument.presentation',
  // Images
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  avif: 'image/avif',
  heic: 'image/heic',
  heif: 'image/heif',
  apng: 'image/apng',
  jxl: 'image/jxl',
  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  flac: 'audio/flac',
  aac: 'audio/aac',
  m4a: 'audio/mp4',
  opus: 'audio/opus',
  mid: 'audio/midi',
  midi: 'audio/midi',
  weba: 'audio/webm',
  // Video
  mp4: 'video/mp4',
  webm: 'video/webm',
  avi: 'video/x-msvideo',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  ogv: 'video/ogg',
  m4v: 'video/mp4',
  flv: 'video/x-flv',
  wmv: 'video/x-ms-wmv',
  '3gp': 'video/3gpp',
  // Archives
  zip: 'application/zip',
  gz: 'application/gzip',
  tar: 'application/x-tar',
  bz2: 'application/x-bzip2',
  '7z': 'application/x-7z-compressed',
  rar: 'application/vnd.rar',
  xz: 'application/x-xz',
  zst: 'application/zstd',
  // Fonts
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
  eot: 'application/vnd.ms-fontobject',
  // Source code
  sh: 'application/x-sh',
  py: 'text/x-python',
  rb: 'application/x-ruby',
  go: 'text/x-go',
  rs: 'text/x-rust',
  java: 'text/x-java-source',
  c: 'text/x-c',
  cpp: 'text/x-c++',
  h: 'text/x-c',
  cs: 'text/x-csharp',
  php: 'application/x-httpd-php',
  swift: 'text/x-swift',
  kt: 'text/x-kotlin',
  scala: 'text/x-scala',
  lua: 'text/x-lua',
  pl: 'text/x-perl',
  r: 'text/x-r',
  // Binary / executables
  wasm: 'application/wasm',
  bin: 'application/octet-stream',
  exe: 'application/vnd.microsoft.portable-executable',
  dll: 'application/vnd.microsoft.portable-executable',
  so: 'application/octet-stream',
  dmg: 'application/x-apple-diskimage',
  pkg: 'application/octet-stream',
  deb: 'application/x-debian-package',
  rpm: 'application/x-rpm',
  // Data / messaging
  eml: 'message/rfc822',
  ics: 'text/calendar',
  vcf: 'text/vcard',
  geojson: 'application/geo+json',
  gpx: 'application/gpx+xml',
  kml: 'application/vnd.google-earth.kml+xml',
  // Misc web
  webmanifest: 'application/manifest+json',
  map: 'application/json',
  wsdl: 'application/wsdl+xml',
  xhtml: 'application/xhtml+xml',
  atom: 'application/atom+xml',
  rss: 'application/rss+xml',
  ndjson: 'application/x-ndjson',
};

// ─── Reverse map: MIME → extensions ────────────────────────────────────────
const REVERSE_MAP: Map<string, string[]> = new Map();
for (const [ext, mime] of Object.entries(MIME_MAP)) {
  const list = REVERSE_MAP.get(mime) ?? [];
  list.push(ext);
  REVERSE_MAP.set(mime, list);
}

// ─── Compressible MIME prefixes / types ───────────────────────────────────
const COMPRESSIBLE_TYPES = new Set([
  'application/json',
  'application/xml',
  'application/javascript',
  'application/typescript',
  'application/graphql',
  'application/x-yaml',
  'application/toml',
  'application/sql',
  'application/manifest+json',
  'application/xhtml+xml',
  'application/atom+xml',
  'application/rss+xml',
  'application/geo+json',
  'application/gpx+xml',
  'image/svg+xml',
]);

// ─── Unsafe MIME types (executable / potentially dangerous) ─────────────────
const UNSAFE_TYPES = new Set([
  'application/vnd.microsoft.portable-executable',
  'application/x-sh',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-apple-diskimage',
  'application/x-debian-package',
  'application/x-rpm',
  'application/x-httpd-php',
  'application/octet-stream',
  'application/x-ruby',
]);

// ─── Text charset types ───────────────────────────────────────────────────
const TEXT_CHARSET_TYPES = new Set([
  'application/json',
  'application/javascript',
  'application/typescript',
  'application/xml',
  'application/x-yaml',
  'application/toml',
  'application/sql',
  'application/graphql',
  'application/manifest+json',
  'application/xhtml+xml',
  'application/atom+xml',
  'application/rss+xml',
  'application/geo+json',
  'image/svg+xml',
  'text/calendar',
  'text/vcard',
]);

// ─── Core API ─────────────────────────────────────────────────────────────

/**
 * Get MIME type from file extension (with or without leading dot).
 */
export function getMimeType(ext: string): string | undefined {
  const clean = ext.startsWith('.') ? ext.slice(1) : ext;
  return MIME_MAP[clean.toLowerCase()];
}

/**
 * Get known extensions for a MIME type.
 */
export function getExtensions(mimeType: string): string[] {
  return REVERSE_MAP.get(mimeType.toLowerCase()) ?? [];
}

/**
 * Get MIME type from a filename or path.
 */
export function getMimeFromFilename(filename: string): string | undefined {
  const base = filename.split('/').pop() ?? filename;
  const dotIdx = base.lastIndexOf('.');
  if (dotIdx === -1) return undefined;
  const ext = base.slice(dotIdx + 1);
  return getMimeType(ext);
}

/**
 * Check if a MIME type is text-based.
 */
export function isText(mimeType: string): boolean {
  const norm = normalizeMime(mimeType);
  return norm.startsWith('text/') || TEXT_CHARSET_TYPES.has(norm);
}

/**
 * Check if a MIME type is an image.
 */
export function isImage(mimeType: string): boolean {
  return normalizeMime(mimeType).startsWith('image/');
}

/**
 * Check if a MIME type is audio.
 */
export function isAudio(mimeType: string): boolean {
  return normalizeMime(mimeType).startsWith('audio/');
}

/**
 * Check if a MIME type is video.
 */
export function isVideo(mimeType: string): boolean {
  return normalizeMime(mimeType).startsWith('video/');
}

/**
 * Check if a MIME type is an application type.
 */
export function isApplication(mimeType: string): boolean {
  return normalizeMime(mimeType).startsWith('application/');
}

/**
 * Check if a file with this MIME type is safe to display in the browser
 * (not executable or otherwise dangerous).
 */
export function isSafe(mimeType: string): boolean {
  const norm = normalizeMime(mimeType);
  if (UNSAFE_TYPES.has(norm)) return false;
  // octet-stream is always unsafe
  if (norm === 'application/octet-stream') return false;
  return true;
}

/**
 * Check if a MIME type is compressible.
 */
export function isCompressible(mimeType: string): boolean {
  const norm = normalizeMime(mimeType);
  if (norm.startsWith('text/')) return true;
  return COMPRESSIBLE_TYPES.has(norm);
}

/**
 * Normalize a MIME type: lowercase, strip parameters.
 * e.g. "Text/HTML; charset=utf-8" → "text/html"
 */
export function normalizeMime(mimeType: string): string {
  return mimeType.split(';')[0].trim().toLowerCase();
}

/**
 * Get the default charset for a MIME type.
 * text/* and common application types return 'UTF-8'; binary types return undefined.
 */
export function getCharset(mimeType: string): string | undefined {
  const norm = normalizeMime(mimeType);
  if (norm.startsWith('text/')) return 'UTF-8';
  if (TEXT_CHARSET_TYPES.has(norm)) return 'UTF-8';
  return undefined;
}

// ─── Content-Type parsing ─────────────────────────────────────────────────

export interface ContentType {
  type: string;
  subtype: string;
  parameters: Record<string, string>;
  full: string;
}

/**
 * Parse a Content-Type header string into its components.
 */
export function parseContentType(header: string): ContentType {
  const parts = header.split(';');
  const mainPart = (parts[0] ?? '').trim().toLowerCase();
  const slashIdx = mainPart.indexOf('/');
  const type = slashIdx === -1 ? mainPart : mainPart.slice(0, slashIdx);
  const subtype = slashIdx === -1 ? '' : mainPart.slice(slashIdx + 1);

  const parameters: Record<string, string> = {};
  for (let i = 1; i < parts.length; i++) {
    const param = parts[i].trim();
    const eqIdx = param.indexOf('=');
    if (eqIdx === -1) {
      parameters[param.toLowerCase()] = '';
    } else {
      const key = param.slice(0, eqIdx).trim().toLowerCase();
      const val = param.slice(eqIdx + 1).trim().replace(/^"|"$/g, '');
      parameters[key] = val;
    }
  }

  return { type, subtype, parameters, full: mainPart };
}

/**
 * Format a Content-Type header from a MIME type and optional charset.
 */
export function formatContentType(mimeType: string, charset?: string): string {
  const norm = normalizeMime(mimeType);
  if (charset) return `${norm}; charset=${charset}`;
  return norm;
}

// ─── Magic-byte detection ─────────────────────────────────────────────────

/**
 * Detect MIME type from magic bytes (first bytes of a file).
 */
export function detectFromBytes(bytes: Uint8Array | number[]): string | undefined {
  const b = Array.from(bytes instanceof Uint8Array ? bytes : bytes);
  if (b.length === 0) return undefined;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    return 'image/png';
  }
  // JPEG: FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return 'image/jpeg';
  }
  // GIF: 47 49 46 38
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) {
    return 'image/gif';
  }
  // PDF: 25 50 44 46
  if (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46) {
    return 'application/pdf';
  }
  // ZIP / DOCX / XLSX / etc.: 50 4B 03 04
  if (b[0] === 0x50 && b[1] === 0x4b) {
    return 'application/zip';
  }
  // WEBP: 52 49 46 46 ?? ?? ?? ?? 57 45 42 50
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  ) {
    return 'image/webp';
  }
  // WAV: 52 49 46 46 ?? ?? ?? ?? 57 41 56 45
  if (
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x41 && b[10] === 0x56 && b[11] === 0x45
  ) {
    return 'audio/wav';
  }
  // RIFF container (WebP/WAV already handled above; fallback)
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) {
    return 'application/octet-stream';
  }
  // MP3: FF FB or FF F3 or FF F2 (MPEG sync) or ID3 tag
  if ((b[0] === 0xff && (b[1] === 0xfb || b[1] === 0xf3 || b[1] === 0xf2)) ||
      (b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33)) {
    return 'audio/mpeg';
  }
  // BMP: 42 4D
  if (b[0] === 0x42 && b[1] === 0x4d) {
    return 'image/bmp';
  }
  // TIFF: 49 49 (little-endian) or 4D 4D (big-endian)
  if ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0x00) ||
      (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0x00 && b[3] === 0x2a)) {
    return 'image/tiff';
  }
  // WASM: 00 61 73 6D
  if (b[0] === 0x00 && b[1] === 0x61 && b[2] === 0x73 && b[3] === 0x6d) {
    return 'application/wasm';
  }
  // OGG: 4F 67 67 53
  if (b[0] === 0x4f && b[1] === 0x67 && b[2] === 0x67 && b[3] === 0x53) {
    return 'audio/ogg';
  }
  // FLAC: 66 4C 61 43
  if (b[0] === 0x66 && b[1] === 0x4c && b[2] === 0x61 && b[3] === 0x43) {
    return 'audio/flac';
  }

  return undefined;
}

// ─── Category ────────────────────────────────────────────────────────────

export type MimeCategory = 'text' | 'image' | 'audio' | 'video' | 'application' | 'font' | 'model' | 'other';

/**
 * Get the broad category of a MIME type.
 */
export function getMimeCategory(mimeType: string): MimeCategory {
  const norm = normalizeMime(mimeType);
  if (norm.startsWith('text/')) return 'text';
  if (norm.startsWith('image/')) return 'image';
  if (norm.startsWith('audio/')) return 'audio';
  if (norm.startsWith('video/')) return 'video';
  if (norm.startsWith('font/')) return 'font';
  if (norm.startsWith('model/')) return 'model';
  if (norm.startsWith('application/')) return 'application';
  return 'other';
}

// ─── List helpers ─────────────────────────────────────────────────────────

/**
 * List all known file extensions.
 */
export function listExtensions(): string[] {
  return Object.keys(MIME_MAP);
}

/**
 * List all known MIME types (deduplicated).
 */
export function listMimeTypes(): string[] {
  return Array.from(new Set(Object.values(MIME_MAP)));
}

/**
 * Check if an extension is in the known MIME map.
 */
export function isKnownExtension(ext: string): boolean {
  const clean = ext.startsWith('.') ? ext.slice(1) : ext;
  return clean.toLowerCase() in MIME_MAP;
}

/**
 * Return all text/* MIME types from the map.
 */
export function getTextMimeTypes(): string[] {
  return Array.from(new Set(
    Object.values(MIME_MAP).filter(m => m.startsWith('text/'))
  ));
}

/**
 * Return all image/* MIME types from the map.
 */
export function getImageMimeTypes(): string[] {
  return Array.from(new Set(
    Object.values(MIME_MAP).filter(m => m.startsWith('image/'))
  ));
}
