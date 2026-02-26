// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** QR error correction level: L=7%, M=15%, Q=25%, H=30% data recovery */
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

/** QR encoding mode */
export type QRMode = 'numeric' | 'alphanumeric' | 'byte' | 'kanji';

/** QR version (1–40) */
export type QRVersion = number;

export interface QROptions {
  errorCorrectionLevel?: ErrorCorrectionLevel; // default 'M'
  version?: QRVersion;                         // default: auto-select
  mode?: QRMode;                               // default: auto-detect
  margin?: number;                             // quiet zone modules, default 4
}

export interface QRMatrix {
  size: number;                // modules per side (e.g. 21 for v1)
  data: boolean[][];           // true=dark, false=light
  version: QRVersion;
  errorCorrectionLevel: ErrorCorrectionLevel;
  mode: QRMode;
}

// ---------------------------------------------------------------------------
// Capacity table: versions 1–10, ECL L/M/Q/H, mode numeric/alphanumeric/byte
// Source: QR code spec ISO 18004:2015
// ---------------------------------------------------------------------------

type CapacityTable = Record<string, Record<ErrorCorrectionLevel, Record<'numeric' | 'alphanumeric' | 'byte', number>>>;

const CAPACITY_TABLE: CapacityTable = {
  1:  { L: { numeric: 41,   alphanumeric: 25,  byte: 17  }, M: { numeric: 34,   alphanumeric: 20,  byte: 14  }, Q: { numeric: 27,   alphanumeric: 16,  byte: 11  }, H: { numeric: 17,   alphanumeric: 10,  byte: 7   } },
  2:  { L: { numeric: 77,   alphanumeric: 47,  byte: 32  }, M: { numeric: 63,   alphanumeric: 38,  byte: 26  }, Q: { numeric: 48,   alphanumeric: 29,  byte: 20  }, H: { numeric: 34,   alphanumeric: 20,  byte: 14  } },
  3:  { L: { numeric: 127,  alphanumeric: 77,  byte: 53  }, M: { numeric: 101,  alphanumeric: 61,  byte: 42  }, Q: { numeric: 77,   alphanumeric: 47,  byte: 32  }, H: { numeric: 58,   alphanumeric: 35,  byte: 24  } },
  4:  { L: { numeric: 187,  alphanumeric: 114, byte: 78  }, M: { numeric: 149,  alphanumeric: 90,  byte: 62  }, Q: { numeric: 111,  alphanumeric: 67,  byte: 46  }, H: { numeric: 82,   alphanumeric: 50,  byte: 34  } },
  5:  { L: { numeric: 255,  alphanumeric: 154, byte: 106 }, M: { numeric: 202,  alphanumeric: 122, byte: 84  }, Q: { numeric: 144,  alphanumeric: 87,  byte: 60  }, H: { numeric: 106,  alphanumeric: 64,  byte: 44  } },
  6:  { L: { numeric: 322,  alphanumeric: 195, byte: 134 }, M: { numeric: 255,  alphanumeric: 154, byte: 106 }, Q: { numeric: 178,  alphanumeric: 108, byte: 74  }, H: { numeric: 139,  alphanumeric: 84,  byte: 58  } },
  7:  { L: { numeric: 370,  alphanumeric: 224, byte: 154 }, M: { numeric: 293,  alphanumeric: 178, byte: 122 }, Q: { numeric: 207,  alphanumeric: 125, byte: 86  }, H: { numeric: 154,  alphanumeric: 93,  byte: 64  } },
  8:  { L: { numeric: 461,  alphanumeric: 279, byte: 192 }, M: { numeric: 365,  alphanumeric: 221, byte: 152 }, Q: { numeric: 259,  alphanumeric: 157, byte: 108 }, H: { numeric: 202,  alphanumeric: 122, byte: 84  } },
  9:  { L: { numeric: 552,  alphanumeric: 335, byte: 230 }, M: { numeric: 432,  alphanumeric: 262, byte: 180 }, Q: { numeric: 312,  alphanumeric: 189, byte: 130 }, H: { numeric: 235,  alphanumeric: 143, byte: 98  } },
  10: { L: { numeric: 652,  alphanumeric: 395, byte: 271 }, M: { numeric: 513,  alphanumeric: 311, byte: 213 }, Q: { numeric: 364,  alphanumeric: 221, byte: 151 }, H: { numeric: 288,  alphanumeric: 174, byte: 119 } },
};

// Approximate byte capacities for versions 11–40 at ECL M (for selectVersion)
const BYTE_CAPACITY_M: Record<number, number> = {
  11: 251, 12: 287, 13: 331, 14: 362, 15: 412,
  16: 450, 17: 504, 18: 560, 19: 624, 20: 666,
  21: 711, 22: 779, 23: 857, 24: 911, 25: 997,
  26: 1059, 27: 1125, 28: 1190, 29: 1264, 30: 1370,
  31: 1452, 32: 1538, 33: 1628, 34: 1722, 35: 1809,
  36: 1911, 37: 1989, 38: 2099, 39: 2213, 40: 2331,
};

const ALPHANUMERIC_CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

// ---------------------------------------------------------------------------
// Mode detection
// ---------------------------------------------------------------------------

/**
 * Detect the most compact QR encoding mode for the given string.
 * numeric → only 0–9
 * alphanumeric → 0–9, A–Z, space, $%*+-./:
 * byte → everything else fitting in Latin-1
 * kanji → CJK characters (Unicode range)
 */
export function detectMode(data: string): QRMode {
  if (data.length === 0) return 'byte';
  // Check for kanji (CJK Unified Ideographs block U+4E00–U+9FFF)
  if ([...data].every(ch => ch.charCodeAt(0) >= 0x4e00 && ch.charCodeAt(0) <= 0x9fff)) {
    return 'kanji';
  }
  if (/^[0-9]+$/.test(data)) return 'numeric';
  if ([...data].every(ch => ALPHANUMERIC_CHARSET.includes(ch))) return 'alphanumeric';
  return 'byte';
}

// ---------------------------------------------------------------------------
// Capacity
// ---------------------------------------------------------------------------

/**
 * Return the character capacity for the given version, ECL, and mode.
 * For kanji, we approximate as byte/2. Versions >10 use estimates.
 */
export function getCapacity(version: QRVersion, ecl: ErrorCorrectionLevel, mode: QRMode): number {
  const v = Math.max(1, Math.min(40, Math.round(version)));
  if (v <= 10) {
    const row = CAPACITY_TABLE[v]?.[ecl];
    if (!row) return 0;
    if (mode === 'kanji') return Math.floor(row.byte / 2);
    if (mode === 'numeric') return row.numeric;
    if (mode === 'alphanumeric') return row.alphanumeric;
    return row.byte;
  }
  // Versions 11–40: use approximate byte capacity and scale
  const byteM = BYTE_CAPACITY_M[v] ?? 2331;
  const eclScale: Record<ErrorCorrectionLevel, number> = { L: 1.4, M: 1.0, Q: 0.7, H: 0.55 };
  const modeScale: Record<QRMode, number> = { numeric: 2.9, alphanumeric: 1.8, byte: 1.0, kanji: 0.5 };
  return Math.floor(byteM * eclScale[ecl] * modeScale[mode]);
}

// ---------------------------------------------------------------------------
// Version selection
// ---------------------------------------------------------------------------

/**
 * Return the minimum QR version that fits the data string at the given ECL.
 * If mode is not supplied it is auto-detected.
 */
export function selectVersion(data: string, ecl: ErrorCorrectionLevel, mode?: QRMode): QRVersion {
  const m = mode ?? detectMode(data);
  const len = data.length;
  for (let v = 1; v <= 40; v++) {
    if (getCapacity(v, ecl, m) >= len) return v;
  }
  return 40; // best effort for very long data
}

// ---------------------------------------------------------------------------
// Size
// ---------------------------------------------------------------------------

/** Return the module grid size for a given QR version: 4*version + 17 */
export function getSize(version: QRVersion): number {
  const v = Math.max(1, Math.min(40, Math.round(version)));
  return 4 * v + 17;
}

// ---------------------------------------------------------------------------
// Deterministic hash helper (no crypto dependency)
// ---------------------------------------------------------------------------

function simpleHash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (Math.imul(h, 0x01000193)) >>> 0;
  }
  return h;
}

// ---------------------------------------------------------------------------
// Matrix generation
// ---------------------------------------------------------------------------

/**
 * Generate a simplified deterministic QR boolean matrix.
 * The pattern is data-dependent (uses a simple hash) and respects
 * the standard finder-pattern area in the top-left 7×7 corner.
 */
export function generateMatrix(data: string, opts: QROptions = {}): QRMatrix {
  const ecl: ErrorCorrectionLevel = opts.errorCorrectionLevel ?? 'M';
  const mode: QRMode = opts.mode ?? detectMode(data);
  const version: QRVersion = opts.version ?? selectVersion(data, ecl, mode);
  const size = getSize(version);

  // Build a deterministic grid
  const hash = simpleHash(data);
  const grid: boolean[][] = [];
  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let c = 0; c < size; c++) {
      // Deterministic fill: XOR of row, col, hash, and a prime mix
      const val = (r * 31 + c * 17 + hash + r * c) & 0xff;
      grid[r][c] = val < 128;
    }
  }

  // Stamp finder pattern (top-left 7×7): border is dark, interior has specific pattern
  function stampFinder(ro: number, co: number): void {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (ro + r < size && co + c < size) {
          // Outer border dark (row/col 0 or 6), inner 3×3 dark, ring between light
          const isOuterBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner3 = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[ro + r][co + c] = isOuterBorder || isInner3;
        }
      }
    }
  }

  stampFinder(0, 0);
  stampFinder(0, size - 7);
  stampFinder(size - 7, 0);

  return { size, data: grid, version, errorCorrectionLevel: ecl, mode };
}

// ---------------------------------------------------------------------------
// ASCII art
// ---------------------------------------------------------------------------

/**
 * Render a QRMatrix as ASCII art using block characters.
 * Each row maps dark→darkChar, light→lightChar, separated by '\n'.
 */
export function toAscii(matrix: QRMatrix, darkChar = '█', lightChar = ' '): string {
  return matrix.data
    .map(row => row.map(cell => (cell ? darkChar : lightChar)).join(''))
    .join('\n');
}

// ---------------------------------------------------------------------------
// SVG rendering
// ---------------------------------------------------------------------------

export interface SvgOptions {
  cellSize?: number;
  foreground?: string;
  background?: string;
}

/**
 * Render a QRMatrix as an SVG string.
 * Returns a complete SVG XML document with rect elements for dark modules.
 */
export function toSvg(matrix: QRMatrix, opts: SvgOptions = {}): string {
  const cellSize = opts.cellSize ?? 4;
  const fg = opts.foreground ?? '#000000';
  const bg = opts.background ?? '#ffffff';
  const totalSize = matrix.size * cellSize;

  const rects: string[] = [];
  for (let r = 0; r < matrix.size; r++) {
    for (let c = 0; c < matrix.size; c++) {
      if (matrix.data[r][c]) {
        rects.push(
          `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="${fg}"/>`
        );
      }
    }
  }

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">`,
    `<rect width="${totalSize}" height="${totalSize}" fill="${bg}"/>`,
    ...rects,
    `</svg>`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Data URI
// ---------------------------------------------------------------------------

/**
 * Render a QRMatrix as a base64-encoded SVG data URI.
 */
export function toDataUri(matrix: QRMatrix, opts: { cellSize?: number } = {}): string {
  const svg = toSvg(matrix, { cellSize: opts.cellSize });
  const b64 = Buffer.from(svg, 'utf8').toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
}

// ---------------------------------------------------------------------------
// Terminal rendering
// ---------------------------------------------------------------------------

/**
 * Render a QRMatrix for terminal output using Unicode block characters.
 * Each pair of rows is combined into a single terminal line using
 * upper-half (▀) and lower-half (▄) block chars.
 */
export function toTerminal(matrix: QRMatrix): string {
  const lines: string[] = [];
  for (let r = 0; r < matrix.size; r += 2) {
    const top = matrix.data[r];
    const bot = matrix.data[r + 1] ?? new Array(matrix.size).fill(false);
    const line = top
      .map((t, c) => {
        const b = bot[c];
        if (t && b) return '█';
        if (t && !b) return '▀';
        if (!t && b) return '▄';
        return ' ';
      })
      .join('');
    lines.push(line);
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Content validation
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  version?: QRVersion;
}

/**
 * Validate that a data string can be encoded in a QR code
 * using the given options. Returns {valid: false, reason: 'too long'} if
 * the data exceeds the maximum version 40 H-ECL capacity.
 */
export function validateContent(data: string, opts: QROptions = {}): ValidationResult {
  const ecl: ErrorCorrectionLevel = opts.errorCorrectionLevel ?? 'M';
  const mode: QRMode = opts.mode ?? detectMode(data);
  const maxCapacity = getCapacity(40, ecl, mode);
  if (data.length > maxCapacity) {
    return { valid: false, reason: 'too long' };
  }
  const version = selectVersion(data, ecl, mode);
  return { valid: true, version };
}

// ---------------------------------------------------------------------------
// URL-scheme builders
// ---------------------------------------------------------------------------

/** Build a WIFI: scheme string for Wi-Fi network QR codes */
export function buildWifiQR(ssid: string, password: string, security: 'WPA' | 'WEP' | 'nopass' = 'WPA'): string {
  return `WIFI:T:${security};S:${ssid};P:${password};;`;
}

/** Build a vCard 3.0 string for contact QR codes */
export function buildVCardQR(opts: {
  name: string;
  phone?: string;
  email?: string;
  org?: string;
  url?: string;
}): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${opts.name}`,
    `N:${opts.name};;;`,
  ];
  if (opts.phone) lines.push(`TEL:${opts.phone}`);
  if (opts.email) lines.push(`EMAIL:${opts.email}`);
  if (opts.org) lines.push(`ORG:${opts.org}`);
  if (opts.url) lines.push(`URL:${opts.url}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

/** Build a mailto: URI for email QR codes */
export function buildEmailQR(to: string, subject?: string, body?: string): string {
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  const query = params.length ? `?${params.join('&')}` : '';
  return `mailto:${to}${query}`;
}

/** Build an sms: URI for SMS QR codes */
export function buildSmsQR(phone: string, message?: string): string {
  const normalised = phone.startsWith('+') ? phone : `+${phone}`;
  return message ? `sms:${normalised}:${message}` : `sms:${normalised}`;
}

/** Build a geo: URI for location QR codes */
export function buildGeoQR(lat: number, lon: number): string {
  return `geo:${lat},${lon}`;
}

/** Build an iCalendar VEVENT string for calendar QR codes */
export function buildEventQR(opts: {
  summary: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
}): string {
  function formatDt(d: Date): string {
    return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${opts.summary}`,
    `DTSTART:${formatDt(opts.start)}`,
    `DTEND:${formatDt(opts.end)}`,
  ];
  if (opts.location) lines.push(`LOCATION:${opts.location}`);
  if (opts.description) lines.push(`DESCRIPTION:${opts.description}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Chunking
// ---------------------------------------------------------------------------

/**
 * Split data into an array of chunks each at most maxChunkSize characters.
 */
export function chunkData(data: string, maxChunkSize: number): string[] {
  if (maxChunkSize <= 0) throw new RangeError('maxChunkSize must be > 0');
  const chunks: string[] = [];
  for (let i = 0; i < data.length; i += maxChunkSize) {
    chunks.push(data.slice(i, i + maxChunkSize));
  }
  if (chunks.length === 0) chunks.push('');
  return chunks;
}

// ---------------------------------------------------------------------------
// Matrix analytics
// ---------------------------------------------------------------------------

/**
 * Estimate the density of dark modules as a fraction of total modules.
 */
export function estimateDensity(matrix: QRMatrix): number {
  const total = matrix.size * matrix.size;
  if (total === 0) return 0;
  const dark = countDarkModules(matrix);
  return dark / total;
}

/**
 * Return true if the top-left 7×7 finder pattern border is all dark.
 */
export function hasFinderPattern(matrix: QRMatrix): boolean {
  if (matrix.size < 7) return false;
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const isOuterBorder = r === 0 || r === 6 || c === 0 || c === 6;
      if (isOuterBorder && !matrix.data[r][c]) return false;
    }
  }
  return true;
}

/**
 * Count the total number of dark (true) modules in the matrix.
 */
export function countDarkModules(matrix: QRMatrix): number {
  let count = 0;
  for (const row of matrix.data) {
    for (const cell of row) {
      if (cell) count++;
    }
  }
  return count;
}
