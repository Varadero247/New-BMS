// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ─── Path Operations ─────────────────────────────────────────────────────────

/**
 * Join path segments together using forward slashes.
 * Handles leading/trailing slashes correctly.
 */
export function join(...parts: string[]): string {
  if (parts.length === 0) return '.';
  const filtered = parts.filter((p) => p !== '');
  if (filtered.length === 0) return '.';

  let result = filtered.join('/');
  // Normalize multiple slashes but preserve leading double slash (UNC)
  const hasLeadingDouble = result.startsWith('//');
  result = result.replace(/\/\/+/g, '/');
  if (hasLeadingDouble) result = '/' + result;
  // Remove trailing slash unless root
  if (result.length > 1 && result.endsWith('/')) {
    result = result.slice(0, -1);
  }
  return result || '.';
}

/**
 * Return the parent directory of a path.
 */
export function dirname(path: string): string {
  if (path === '') return '.';
  // Normalise backslashes
  const p = path.replace(/\\/g, '/');
  const idx = p.lastIndexOf('/');
  if (idx === -1) return '.';
  if (idx === 0) return '/';
  return p.slice(0, idx);
}

/**
 * Return the last portion of a path.
 * If ext is supplied and the path ends with it, the extension is removed.
 */
export function basename(path: string, ext?: string): string {
  const p = path.replace(/\\/g, '/');
  const parts = p.split('/');
  let base = parts[parts.length - 1] ?? '';
  // If the last segment is empty (trailing slash) fall back one more
  if (base === '' && parts.length > 1) {
    base = parts[parts.length - 2] ?? '';
  }
  if (ext && base.endsWith(ext)) {
    base = base.slice(0, base.length - ext.length);
  }
  return base;
}

/**
 * Return the file extension (including the leading dot).
 */
export function extname(path: string): string {
  const base = basename(path);
  const dotIdx = base.lastIndexOf('.');
  if (dotIdx <= 0) return ''; // hidden files like ".gitignore" have no ext
  return base.slice(dotIdx);
}

/**
 * Normalize a path by resolving `.`, `..` and double slashes.
 */
export function normalize(path: string): string {
  if (path === '') return '.';
  const p = path.replace(/\\/g, '/');
  const isAbs = p.startsWith('/');
  const segments = p.split('/').filter((s) => s !== '');
  const resolved: string[] = [];
  for (const seg of segments) {
    if (seg === '.') continue;
    if (seg === '..') {
      if (resolved.length > 0 && resolved[resolved.length - 1] !== '..') {
        resolved.pop();
      } else if (!isAbs) {
        resolved.push('..');
      }
    } else {
      resolved.push(seg);
    }
  }
  const result = (isAbs ? '/' : '') + resolved.join('/');
  return result || (isAbs ? '/' : '.');
}

/**
 * Return true if the path is absolute.
 */
export function isAbsolute(path: string): boolean {
  if (path.startsWith('/')) return true;
  // Windows absolute: C:\... or C:/...
  if (/^[A-Za-z]:[/\\]/.test(path)) return true;
  return false;
}

/**
 * Compute a relative path from `from` to `to`.
 */
export function relative(from: string, to: string): string {
  const normFrom = normalize(from).replace(/\\/g, '/').split('/').filter(s => s !== '' && s !== '.');
  const normTo = normalize(to).replace(/\\/g, '/').split('/').filter(s => s !== '' && s !== '.');

  // Find common prefix
  let common = 0;
  while (common < normFrom.length && common < normTo.length && normFrom[common] === normTo[common]) {
    common++;
  }

  const ups = normFrom.length - common;
  const parts: string[] = [];
  for (let i = 0; i < ups; i++) parts.push('..');
  for (let i = common; i < normTo.length; i++) parts.push(normTo[i]);

  return parts.join('/') || '.';
}

/**
 * Resolve a sequence of paths into an absolute path.
 * Uses the first absolute segment found (scanning right to left).
 */
export function resolve(...parts: string[]): string {
  let resolved = '';
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i].replace(/\\/g, '/');
    if (resolved === '') {
      resolved = p;
    } else {
      resolved = p + '/' + resolved;
    }
    if (isAbsolute(resolved)) break;
  }
  if (!isAbsolute(resolved)) {
    resolved = '/cwd/' + resolved;
  }
  return normalize(resolved);
}

/**
 * Convert backslashes to forward slashes (Unix-style paths).
 */
export function toUnix(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * Convert forward slashes to backslashes (Windows-style paths).
 */
export function toWindows(path: string): string {
  return path.replace(/\//g, '\\');
}

// ─── MIME Type Utilities ──────────────────────────────────────────────────────

const MIME_MAP: Record<string, string> = {
  // Images
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
  '.avif': 'image/avif',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  // Videos
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.avi': 'video/x-msvideo',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
  '.flv': 'video/x-flv',
  '.wmv': 'video/x-ms-wmv',
  '.m4v': 'video/x-m4v',
  '.3gp': 'video/3gpp',
  // Audio
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.flac': 'audio/flac',
  '.aac': 'audio/aac',
  '.m4a': 'audio/mp4',
  '.oga': 'audio/ogg',
  '.opus': 'audio/opus',
  '.wma': 'audio/x-ms-wma',
  '.aiff': 'audio/aiff',
  // Documents
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.md': 'text/markdown',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.xml': 'application/xml',
  '.json': 'application/json',
  '.rtf': 'application/rtf',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
  '.odp': 'application/vnd.oasis.opendocument.presentation',
  // Archives
  '.zip': 'application/zip',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
  '.bz2': 'application/x-bzip2',
  '.7z': 'application/x-7z-compressed',
  '.rar': 'application/vnd.rar',
  '.xz': 'application/x-xz',
  '.zst': 'application/zstd',
  // Code / misc
  '.js': 'application/javascript',
  '.ts': 'application/typescript',
  '.css': 'text/css',
  '.wasm': 'application/wasm',
  '.bin': 'application/octet-stream',
  '.exe': 'application/octet-stream',
  '.dmg': 'application/octet-stream',
  '.iso': 'application/octet-stream',
  '.yaml': 'application/yaml',
  '.yml': 'application/yaml',
  '.toml': 'application/toml',
  '.sh': 'application/x-sh',
  '.bat': 'application/x-msdos-program',
};

const REVERSE_MIME_MAP: Record<string, string> = {};
for (const [ext, mime] of Object.entries(MIME_MAP)) {
  if (!(mime in REVERSE_MIME_MAP)) {
    REVERSE_MIME_MAP[mime] = ext;
  }
}

/**
 * Return the MIME type for a given filename or extension.
 */
export function getMimeType(filename: string): string {
  const ext = extname(filename).toLowerCase() || filename.toLowerCase();
  return MIME_MAP[ext] ?? 'application/octet-stream';
}

/**
 * Return the file extension for a given MIME type.
 */
export function getExtensionForMime(mime: string): string {
  return REVERSE_MIME_MAP[mime.toLowerCase()] ?? '';
}

const IMAGE_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
  'image/svg+xml', 'image/x-icon', 'image/tiff', 'image/avif',
  'image/heic', 'image/heif',
]);

const VIDEO_MIMES = new Set([
  'video/mp4', 'video/webm', 'video/ogg', 'video/x-msvideo',
  'video/quicktime', 'video/x-matroska', 'video/x-flv', 'video/x-ms-wmv',
  'video/x-m4v', 'video/3gpp',
]);

const AUDIO_MIMES = new Set([
  'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/mp4',
  'audio/ogg', 'audio/opus', 'audio/x-ms-wma', 'audio/aiff',
]);

const DOCUMENT_MIMES = new Set([
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv', 'text/markdown', 'text/html',
  'application/xml', 'application/json', 'application/rtf',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
]);

const ARCHIVE_MIMES = new Set([
  'application/zip', 'application/x-tar', 'application/gzip',
  'application/x-bzip2', 'application/x-7z-compressed',
  'application/vnd.rar', 'application/x-xz', 'application/zstd',
]);

export function isImageFile(filename: string): boolean {
  return IMAGE_MIMES.has(getMimeType(filename));
}

export function isVideoFile(filename: string): boolean {
  return VIDEO_MIMES.has(getMimeType(filename));
}

export function isAudioFile(filename: string): boolean {
  return AUDIO_MIMES.has(getMimeType(filename));
}

export function isDocumentFile(filename: string): boolean {
  return DOCUMENT_MIMES.has(getMimeType(filename));
}

export function isArchiveFile(filename: string): boolean {
  return ARCHIVE_MIMES.has(getMimeType(filename));
}

// ─── File Size Formatting ─────────────────────────────────────────────────────

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

/**
 * Format a byte count as a human-readable string (e.g. "1.50 MB").
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes < 0) throw new RangeError('bytes must be non-negative');
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = Math.max(0, decimals);
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), SIZE_UNITS.length - 1);
  const value = (bytes / Math.pow(k, i)).toFixed(dm);
  return `${value} ${SIZE_UNITS[i]}`;
}

/**
 * Parse a human-readable file size string back to bytes.
 */
export function parseFileSize(str: string): number {
  const match = str.trim().match(/^([\d.]+)\s*([A-Za-z]+)$/);
  if (!match) throw new Error(`Invalid file size string: "${str}"`);
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  const idx = SIZE_UNITS.indexOf(unit);
  if (idx === -1) throw new Error(`Unknown unit: "${unit}"`);
  return Math.round(value * Math.pow(1024, idx));
}

export function bytesToKb(bytes: number): number {
  return bytes / 1024;
}

export function bytesToMb(bytes: number): number {
  return bytes / (1024 * 1024);
}

export function bytesToGb(bytes: number): number {
  return bytes / (1024 * 1024 * 1024);
}

export function kbToBytes(kb: number): number {
  return kb * 1024;
}

export function mbToBytes(mb: number): number {
  return mb * 1024 * 1024;
}

export function gbToBytes(gb: number): number {
  return gb * 1024 * 1024 * 1024;
}

// ─── Filename Utilities ───────────────────────────────────────────────────────

// Characters invalid on Windows / common filesystems
const INVALID_FILENAME_CHARS = /[<>:"/\\|?*\x00-\x1F]/g;
// Windows reserved names
const RESERVED_NAMES = /^(CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9])(\..*)?$/i;

/**
 * Remove or replace characters that are invalid in filenames.
 */
export function sanitizeFilename(name: string): string {
  let sanitized = name
    .replace(INVALID_FILENAME_CHARS, '_')
    .replace(/^\.+/, '_') // leading dots
    .replace(/[\s.]+$/, ''); // trailing spaces/dots

  // Replace reserved names
  if (RESERVED_NAMES.test(sanitized)) {
    sanitized = '_' + sanitized;
  }

  return sanitized || '_';
}

/**
 * Return true if the filename is valid for cross-platform use.
 */
export function isValidFilename(name: string): boolean {
  if (!name || name.length === 0 || name.length > 255) return false;
  if (INVALID_FILENAME_CHARS.test(name)) return false;
  if (RESERVED_NAMES.test(name)) return false;
  if (/^\./.test(name)) return false;
  if (/[\s.]$/.test(name)) return false;
  return true;
}

/**
 * Add an extension to a filename (ensures exactly one dot separator).
 */
export function addExtension(filename: string, ext: string): string {
  const e = ext.startsWith('.') ? ext : '.' + ext;
  return filename + e;
}

/**
 * Change the extension of a filename.
 */
export function changeExtension(filename: string, newExt: string): string {
  const stripped = stripExtension(filename);
  const e = newExt.startsWith('.') ? newExt : '.' + newExt;
  return stripped + e;
}

/**
 * Remove the extension from a filename.
 */
export function stripExtension(filename: string): string {
  const ext = extname(filename);
  if (!ext) return filename;
  return filename.slice(0, filename.length - ext.length);
}

/**
 * Generate a unique filename by appending a counter if the base name
 * already exists in the `existing` array.
 */
export function generateUniqueFilename(base: string, existing: string[]): string {
  const existingSet = new Set(existing);
  if (!existingSet.has(base)) return base;

  const ext = extname(base);
  const stem = stripExtension(base);
  let counter = 1;
  while (true) {
    const candidate = `${stem} (${counter})${ext}`;
    if (!existingSet.has(candidate)) return candidate;
    counter++;
  }
}
