// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { randomBytes, createHash } from 'crypto';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** The NIL UUID — all bits zero */
export const NIL_UUID = '00000000-0000-0000-0000-000000000000';

/** RFC 4122 DNS namespace UUID */
export const NAMESPACE_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

/** RFC 4122 URL namespace UUID */
export const NAMESPACE_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

/** RFC 4122 OID namespace UUID */
export const NAMESPACE_OID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';

// ---------------------------------------------------------------------------
// Regex helpers
// ---------------------------------------------------------------------------

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const UUID_V4_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const UUID_V1_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

/**
 * UUID v4 — fully random.
 * Returns lowercase RFC-4122 formatted UUID:
 * "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
 */
export function uuidV4(): string {
  const buf = randomBytes(16);
  // Set version bits to 4 (0100 xxxx)
  buf[6] = (buf[6] & 0x0f) | 0x40;
  // Set variant bits to 10xx xxxx (RFC 4122)
  buf[8] = (buf[8] & 0x3f) | 0x80;
  const hex = buf.toString('hex');
  return (
    hex.slice(0, 8) +
    '-' +
    hex.slice(8, 12) +
    '-' +
    hex.slice(12, 16) +
    '-' +
    hex.slice(16, 20) +
    '-' +
    hex.slice(20)
  );
}

/**
 * UUID v1-style — time-based with a random node.
 * Simplified: uses Date.now() for the timestamp fields and random bytes for
 * the clock sequence and node, then sets the version/variant bits.
 */
export function uuidV1(): string {
  const now = BigInt(Date.now());
  // UUID epoch offset: 100-nanosecond intervals between 15 Oct 1582 and 1 Jan 1970
  const EPOCH_OFFSET = BigInt('122192928000000000');
  // Convert ms to 100-ns intervals
  const ts = now * BigInt(10000) + EPOCH_OFFSET;

  const timeLow = Number(ts & BigInt(0xffffffff));
  const timeMid = Number((ts >> BigInt(32)) & BigInt(0xffff));
  const timeHiAndVersion = Number((ts >> BigInt(48)) & BigInt(0x0fff)) | 0x1000;

  const clockSeqBuf = randomBytes(2);
  const clockSeq = ((clockSeqBuf[0] & 0x3f) | 0x80) * 256 + clockSeqBuf[1];

  const nodeBuf = randomBytes(6);

  const toHex = (n: number, len: number): string =>
    n.toString(16).padStart(len, '0');

  return (
    toHex(timeLow, 8) +
    '-' +
    toHex(timeMid, 4) +
    '-' +
    toHex(timeHiAndVersion, 4) +
    '-' +
    toHex(clockSeq, 4) +
    '-' +
    nodeBuf.toString('hex')
  );
}

/**
 * Generate a batch of `count` UUID v4 strings.
 */
export function generateBatch(count: number): string[] {
  if (count < 0) return [];
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(uuidV4());
  }
  return result;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Returns `true` for any valid v1-v5 UUID string (case-insensitive, with or
 * without hyphens).
 */
export function isUUID(s: string): boolean {
  if (typeof s !== 'string') return false;
  const normalized = tryNormalize(s);
  if (!normalized) return false;
  return UUID_RE.test(normalized);
}

/** Returns `true` only for v4 UUIDs. */
export function isUUIDv4(s: string): boolean {
  if (typeof s !== 'string') return false;
  const normalized = tryNormalize(s);
  if (!normalized) return false;
  return UUID_V4_RE.test(normalized);
}

/** Returns `true` only for v1 UUIDs. */
export function isUUIDv1(s: string): boolean {
  if (typeof s !== 'string') return false;
  const normalized = tryNormalize(s);
  if (!normalized) return false;
  return UUID_V1_RE.test(normalized);
}

// ---------------------------------------------------------------------------
// Parsing & normalisation
// ---------------------------------------------------------------------------

export interface UUIDComponents {
  timeLow: string;
  timeMid: string;
  timeHiAndVersion: string;
  clockSeqHiAndReserved: string;
  clockSeqLow: string;
  node: string;
  version: number;
}

/**
 * Parse a UUID string into its RFC-4122 components.
 * Throws if the string is not a valid UUID.
 */
export function parseUUID(uuid: string): UUIDComponents {
  const norm = normalizeUUID(uuid);
  const parts = norm.split('-');
  const timeHiAndVersion = parts[2];
  const versionChar = timeHiAndVersion[0];
  const version =
    versionChar >= '1' && versionChar <= '5' ? parseInt(versionChar, 10) : 0;

  const clockSeqGroup = parts[3]; // 4 hex chars
  return {
    timeLow: parts[0],
    timeMid: parts[1],
    timeHiAndVersion: timeHiAndVersion,
    clockSeqHiAndReserved: clockSeqGroup.slice(0, 2),
    clockSeqLow: clockSeqGroup.slice(2, 4),
    node: parts[4],
    version,
  };
}

/**
 * Normalize a UUID: accepts 32 hex chars (no hyphens) or any hyphenated form.
 * Returns lowercase hyphenated form.
 * Throws if input is invalid.
 */
export function normalizeUUID(s: string): string {
  if (typeof s !== 'string') throw new Error('Input must be a string');
  const stripped = s.replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(stripped)) {
    throw new Error(`Invalid UUID: "${s}"`);
  }
  return (
    stripped.slice(0, 8) +
    '-' +
    stripped.slice(8, 12) +
    '-' +
    stripped.slice(12, 16) +
    '-' +
    stripped.slice(16, 20) +
    '-' +
    stripped.slice(20)
  );
}

/** Internal helper — returns null instead of throwing. */
function tryNormalize(s: string): string | null {
  try {
    return normalizeUUID(s);
  } catch {
    return null;
  }
}

/**
 * Strip hyphens from a UUID; returns 32 lowercase hex chars.
 * Throws if input is invalid.
 */
export function stripHyphens(uuid: string): string {
  const norm = normalizeUUID(uuid);
  return norm.replace(/-/g, '');
}

// ---------------------------------------------------------------------------
// Comparison & equality
// ---------------------------------------------------------------------------

/**
 * Compare two UUIDs lexicographically (after normalisation).
 * Returns -1, 0, or 1.
 */
export function compareUUIDs(a: string, b: string): -1 | 0 | 1 {
  const na = normalizeUUID(a);
  const nb = normalizeUUID(b);
  if (na < nb) return -1;
  if (na > nb) return 1;
  return 0;
}

/**
 * Returns `true` if two UUID strings represent the same UUID
 * (case-insensitive, ignoring hyphens).
 */
export function uuidsEqual(a: string, b: string): boolean {
  try {
    return normalizeUUID(a) === normalizeUUID(b);
  } catch {
    return false;
  }
}

/**
 * Sort an array of UUID strings in lexicographic order.
 * Returns a new sorted array.
 */
export function sortUUIDs(uuids: string[]): string[] {
  return [...uuids].sort((a, b) => compareUUIDs(a, b));
}

// ---------------------------------------------------------------------------
// Byte conversion
// ---------------------------------------------------------------------------

/**
 * Convert a UUID string to a 16-byte Uint8Array.
 */
export function uuidToBytes(uuid: string): Uint8Array {
  const hex = stripHyphens(uuid);
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Convert a 16-byte Uint8Array to a UUID string.
 */
export function bytesToUUID(bytes: Uint8Array): string {
  if (bytes.length !== 16) throw new Error('Bytes array must be exactly 16 bytes');
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return (
    hex.slice(0, 8) +
    '-' +
    hex.slice(8, 12) +
    '-' +
    hex.slice(12, 16) +
    '-' +
    hex.slice(16, 20) +
    '-' +
    hex.slice(20)
  );
}

// ---------------------------------------------------------------------------
// Base64 encoding
// ---------------------------------------------------------------------------

/**
 * Encode a UUID as a base64 string (from its 16 raw bytes).
 */
export function uuidToBase64(uuid: string): string {
  const bytes = uuidToBytes(uuid);
  return Buffer.from(bytes).toString('base64');
}

/**
 * Decode a base64 string back to a UUID.
 */
export function base64ToUUID(b64: string): string {
  const buf = Buffer.from(b64, 'base64');
  if (buf.length !== 16) throw new Error('Base64 does not decode to 16 bytes');
  return bytesToUUID(new Uint8Array(buf));
}

// ---------------------------------------------------------------------------
// Short ID
// ---------------------------------------------------------------------------

/** Base-58 alphabet (Bitcoin-style, excludes 0, O, I, l) */
const BASE58_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Generate a short, base58-encoded ID from 16 random bytes (~22 chars).
 */
export function shortId(): string {
  const bytes = randomBytes(16);
  // Treat bytes as a big-endian integer and encode in base 58
  let num = BigInt('0x' + bytes.toString('hex'));
  const base = BigInt(58);
  let result = '';
  while (num > BigInt(0)) {
    const remainder = Number(num % base);
    result = BASE58_ALPHABET[remainder] + result;
    num = num / base;
  }
  // Pad leading 1s for leading zero bytes
  for (const byte of bytes) {
    if (byte === 0) result = BASE58_ALPHABET[0] + result;
    else break;
  }
  return result || BASE58_ALPHABET[0];
}

// ---------------------------------------------------------------------------
// Sequential UUID
// ---------------------------------------------------------------------------

/**
 * Sequential (sortable) UUID.
 * Encodes a 48-bit millisecond timestamp into the first 48 bits, then fills
 * the rest with random bytes. Version bits are set to 4, variant to 10.
 * Because the timestamp prefix is in the most-significant bytes, UUIDs
 * generated later will sort lexicographically after earlier ones.
 */
export function sequentialUUID(): string {
  const now = Date.now();
  const buf = randomBytes(16);

  // Write timestamp into bytes 0-5 (big-endian)
  buf[0] = (now / 0x10000000000) & 0xff;
  buf[1] = (now / 0x100000000) & 0xff;
  buf[2] = (now / 0x1000000) & 0xff;
  buf[3] = (now / 0x10000) & 0xff;
  buf[4] = (now / 0x100) & 0xff;
  buf[5] = now & 0xff;

  // Set version to 4
  buf[6] = (buf[6] & 0x0f) | 0x40;
  // Set variant
  buf[8] = (buf[8] & 0x3f) | 0x80;

  return bytesToUUID(new Uint8Array(buf));
}

// ---------------------------------------------------------------------------
// Version detection
// ---------------------------------------------------------------------------

/**
 * Returns the UUID version (1-5) or null if the string is not a valid UUID.
 */
export function uuidVersion(uuid: string): number | null {
  const normalized = tryNormalize(uuid);
  if (!normalized) return null;
  if (!UUID_RE.test(normalized)) return null;
  const ver = parseInt(normalized[14], 10);
  return ver >= 1 && ver <= 5 ? ver : null;
}

// ---------------------------------------------------------------------------
// Deterministic UUID (v5-like)
// ---------------------------------------------------------------------------

/**
 * Generate a deterministic UUID from a namespace UUID and a name string.
 * Uses SHA-1 of (namespace bytes + UTF-8 name bytes), then sets version=5
 * and the RFC-4122 variant bits.
 */
export function uuidV5(namespace: string, name: string): string {
  const nsBuf = Buffer.from(stripHyphens(namespace), 'hex');
  const nameBuf = Buffer.from(name, 'utf8');
  const combined = Buffer.concat([nsBuf, nameBuf]);
  const hash = createHash('sha1').update(combined).digest();

  // Set version 5 (0101)
  hash[6] = (hash[6] & 0x0f) | 0x50;
  // Set variant 10xx
  hash[8] = (hash[8] & 0x3f) | 0x80;

  return bytesToUUID(new Uint8Array(hash.slice(0, 16)));
}
