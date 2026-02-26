// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { createHash, createHmac } from 'crypto';
import { HashAlgorithm } from './types';

// ─────────────────────────────────────────────────────────────
// BASE64
// ─────────────────────────────────────────────────────────────

/** Standard base64 encode. Accepts a string or Buffer. */
export function toBase64(input: string | Buffer): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return buf.toString('base64');
}

/** Standard base64 decode to UTF-8 string. */
export function fromBase64(input: string): string {
  return Buffer.from(input, 'base64').toString('utf8');
}

/** URL-safe base64 encode (replaces +→-, /→_, strips = padding). */
export function toBase64Url(input: string | Buffer): string {
  return toBase64(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** URL-safe base64 decode. */
export function fromBase64Url(input: string): string {
  // Re-pad to a multiple of 4
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + '='.repeat(pad), 'base64').toString('utf8');
}

/** Validate standard base64 (allows optional padding). */
export function isValidBase64(input: string): boolean {
  return /^[A-Za-z0-9+/]*={0,2}$/.test(input) && input.length % 4 === 0;
}

/** Validate URL-safe base64 (no +, /, =). */
export function isValidBase64Url(input: string): boolean {
  return /^[A-Za-z0-9\-_]*$/.test(input);
}

// ─────────────────────────────────────────────────────────────
// HEX
// ─────────────────────────────────────────────────────────────

/** Encode string or Buffer to lowercase hex string. */
export function toHex(input: string | Buffer): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return buf.toString('hex');
}

/** Decode a hex string to a UTF-8 string. */
export function fromHex(input: string): string {
  return Buffer.from(input, 'hex').toString('utf8');
}

/** Validate a hex string: even length and only 0-9 a-f A-F. */
export function isValidHex(input: string): boolean {
  return input.length % 2 === 0 && /^[0-9a-fA-F]*$/.test(input);
}

/** Return an array of 2-character lowercase hex byte strings, e.g. ['0a','ff',...]. */
export function toHexBytes(input: string | Buffer): string[] {
  const hex = toHex(input);
  const result: string[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    result.push(hex.slice(i, i + 2));
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// URI / URL ENCODING
// ─────────────────────────────────────────────────────────────

/**
 * Like encodeURI — preserves characters that are legal in a URI
 * (:/?#[]@!$&'()*+,;= and unreserved chars).
 */
export function encodeUri(input: string): string {
  return encodeURI(input);
}

/** Like decodeURI. */
export function decodeUri(input: string): string {
  return decodeURI(input);
}

/** Like encodeURIComponent — percent-encodes everything except unreserved chars. */
export function encodeUriComponent(input: string): string {
  return encodeURIComponent(input);
}

/** Like decodeURIComponent. */
export function decodeUriComponent(input: string): string {
  return decodeURIComponent(input);
}

/**
 * Encode a plain object as application/x-www-form-urlencoded.
 * Keys and values are encoded with encodeURIComponent; spaces become '+'.
 */
export function encodeFormData(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

/**
 * Parse an application/x-www-form-urlencoded string into a plain object.
 * Handles both '+'-space and '%20' encoding.
 */
export function decodeFormData(input: string): Record<string, string> {
  if (!input) return {};
  const result: Record<string, string> = {};
  for (const pair of input.split('&')) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) continue;
    const key = decodeURIComponent(pair.slice(0, eqIdx).replace(/\+/g, ' '));
    const val = decodeURIComponent(pair.slice(eqIdx + 1).replace(/\+/g, ' '));
    result[key] = val;
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// HTML ENTITIES
// ─────────────────────────────────────────────────────────────

const HTML_ENCODE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const HTML_DECODE_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
};

/** Encode &, <, >, ", ' to their HTML entity equivalents. */
export function encodeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => HTML_ENCODE_MAP[ch] ?? ch);
}

/** Decode HTML entities (&amp; &lt; &gt; &quot; &#39; &apos;) back to characters. */
export function decodeHtml(input: string): string {
  return input.replace(/&(?:amp|lt|gt|quot|#39|apos);/g, (entity) => HTML_DECODE_MAP[entity] ?? entity);
}

/** Strip all HTML tags from a string. */
export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

// ─────────────────────────────────────────────────────────────
// SIMPLE CIPHERS / ENCODING
// ─────────────────────────────────────────────────────────────

/** ROT13 encode/decode (symmetric). Only shifts A-Z and a-z. */
export function rot13(input: string): string {
  return input.replace(/[A-Za-z]/g, (ch) => {
    const base = ch <= 'Z' ? 65 : 97;
    return String.fromCharCode(((ch.charCodeAt(0) - base + 13) % 26) + base);
  });
}

/** ROT47 encode/decode (symmetric). Shifts printable ASCII chars 33-126. */
export function rot47(input: string): string {
  return input.replace(/[!-~]/g, (ch) => {
    return String.fromCharCode(((ch.charCodeAt(0) - 33 + 47) % 94) + 33);
  });
}

/** Reverse a string in a Unicode-aware manner (handles surrogate pairs). */
export function reverseString(input: string): string {
  return [...input].reverse().join('');
}

/** Encode a UTF-8 string to space-separated binary octets ("A" → "01000001"). */
export function toBinary(input: string): string {
  const bytes = Buffer.from(input, 'utf8');
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, '0'))
    .join(' ');
}

/** Decode a space-separated binary string back to a UTF-8 string. */
export function fromBinary(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/);
  const bytes = parts.map((b) => parseInt(b, 2));
  return Buffer.from(bytes).toString('utf8');
}

// ─────────────────────────────────────────────────────────────
// HASHING
// ─────────────────────────────────────────────────────────────

/** Return the hex hash of a string using the given algorithm. */
export function hash(input: string, algorithm: HashAlgorithm): string {
  return createHash(algorithm).update(input, 'utf8').digest('hex');
}

/** SHA-256 hex hash. */
export function sha256(input: string): string {
  return hash(input, 'sha256');
}

/** SHA-512 hex hash. */
export function sha512(input: string): string {
  return hash(input, 'sha512');
}

/** MD5 hex hash. */
export function md5(input: string): string {
  return hash(input, 'md5');
}

/**
 * HMAC hex digest. Defaults to sha256 if no algorithm provided.
 */
export function hmac(input: string, secret: string, algorithm: HashAlgorithm = 'sha256'): string {
  return createHmac(algorithm, secret).update(input, 'utf8').digest('hex');
}

// ─────────────────────────────────────────────────────────────
// CRC32 checksum (lookup-table implementation, no external deps)
// ─────────────────────────────────────────────────────────────

const CRC32_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
})();

/**
 * CRC32 checksum as an unsigned 32-bit integer.
 * Accepts a string (UTF-8) or Buffer.
 */
export function checksum(input: string | Buffer): number {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ─────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

/** Convert a byte count to a human-readable string ("1.23 KB", "4.56 MB", etc.). */
export function bytesToHuman(bytes: number): string {
  if (bytes < 0) throw new RangeError('bytes must be >= 0');
  if (bytes === 0) return '0 B';
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < BYTE_UNITS.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  const formatted = unitIndex === 0 ? String(Math.round(value)) : value.toFixed(2);
  return `${formatted} ${BYTE_UNITS[unitIndex]}`;
}

/** Returns true if every character in the string is ASCII (code point 0-127). */
export function isAscii(input: string): boolean {
  for (let i = 0; i < input.length; i++) {
    if (input.charCodeAt(i) > 127) return false;
  }
  return true;
}

/** Returns true if every character is a printable ASCII character (code 32-126). */
export function isPrintable(input: string): boolean {
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code < 32 || code > 126) return false;
  }
  return true;
}

/** Returns the byte length of a string encoded as UTF-8. */
export function countBytes(input: string): number {
  return Buffer.byteLength(input, 'utf8');
}
