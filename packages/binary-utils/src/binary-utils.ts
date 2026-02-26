// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { ByteOrder } from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Coerce a JS number to an unsigned 32-bit integer. */
function u32(n: number): number {
  return n >>> 0;
}

// ---------------------------------------------------------------------------
// Bit operations (work on 32-bit integers)
// ---------------------------------------------------------------------------

/**
 * Get the bit at position `pos` (0 = LSB).
 */
export function getBit(n: number, pos: number): 0 | 1 {
  return ((u32(n) >>> pos) & 1) as 0 | 1;
}

/**
 * Set the bit at position `pos` to 1.
 */
export function setBit(n: number, pos: number): number {
  return u32(u32(n) | (1 << pos));
}

/**
 * Clear the bit at position `pos` to 0.
 */
export function clearBit(n: number, pos: number): number {
  return u32(u32(n) & ~(1 << pos));
}

/**
 * Toggle the bit at position `pos`.
 */
export function toggleBit(n: number, pos: number): number {
  return u32(u32(n) ^ (1 << pos));
}

/**
 * Return true if the bit at position `pos` is set.
 */
export function hasBit(n: number, pos: number): boolean {
  return getBit(n, pos) === 1;
}

/**
 * Count the number of set bits (popcount) using Brian Kernighan's algorithm.
 */
export function countBits(n: number): number {
  let v = u32(n);
  let count = 0;
  while (v !== 0) {
    v &= v - 1;
    count++;
  }
  return count;
}

/**
 * Count the number of leading zero bits in a 32-bit unsigned integer.
 */
export function leadingZeros(n: number): number {
  const v = u32(n);
  if (v === 0) return 32;
  let count = 0;
  let mask = 0x80000000;
  while ((v & mask) === 0) {
    count++;
    mask >>>= 1;
  }
  return count;
}

/**
 * Count the number of trailing zero bits in a 32-bit unsigned integer.
 */
export function trailingZeros(n: number): number {
  const v = u32(n);
  if (v === 0) return 32;
  let count = 0;
  let x = v;
  while ((x & 1) === 0) {
    count++;
    x >>>= 1;
  }
  return count;
}

/**
 * Return the 0-indexed position of the highest set bit, or -1 if n === 0.
 */
export function highestBit(n: number): number {
  const v = u32(n);
  if (v === 0) return -1;
  return 31 - leadingZeros(v);
}

/**
 * Return the 0-indexed position of the lowest set bit, or -1 if n === 0.
 */
export function lowestBit(n: number): number {
  const v = u32(n);
  if (v === 0) return -1;
  return trailingZeros(v);
}

/**
 * Reverse the bit order of a 32-bit integer.
 */
export function reverseBits(n: number): number {
  let v = u32(n);
  let result = 0;
  for (let i = 0; i < 32; i++) {
    result = u32((result << 1) | (v & 1));
    v >>>= 1;
  }
  return result;
}

/**
 * Rotate a 32-bit integer left by `bits` positions.
 */
export function rotateLeft(n: number, bits: number): number {
  const b = bits & 31;
  const v = u32(n);
  return u32((v << b) | (v >>> (32 - b)));
}

/**
 * Rotate a 32-bit integer right by `bits` positions.
 */
export function rotateRight(n: number, bits: number): number {
  const b = bits & 31;
  const v = u32(n);
  return u32((v >>> b) | (v << (32 - b)));
}

/**
 * Return true if n is a power of two (n > 0).
 */
export function isPowerOfTwo(n: number): boolean {
  if (n <= 0) return false;
  return (n & (n - 1)) === 0;
}

/**
 * Return the smallest power of two that is >= n.
 * Returns 1 for n <= 1.
 */
export function nextPowerOfTwo(n: number): number {
  if (n <= 1) return 1;
  // Already a power of two
  if (isPowerOfTwo(n)) return n;
  let v = u32(n - 1);
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return u32(v + 1);
}

/**
 * Return the largest power of two that is <= n.
 * Returns 1 for n <= 1.
 */
export function prevPowerOfTwo(n: number): number {
  if (n <= 1) return 1;
  if (isPowerOfTwo(n)) return n;
  // Smear highest bit downward, then isolate it
  let v = u32(n);
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  // v is now all-ones from highest set bit downward; v - (v >>> 1) gives highest bit alone
  return u32(v - (v >>> 1));
}

/**
 * Return floor(log2(n)) using bit tricks. n must be > 0.
 */
export function log2(n: number): number {
  if (n <= 0) throw new RangeError('log2: n must be > 0');
  return highestBit(u32(n));
}

// ---------------------------------------------------------------------------
// Bit field / flag utilities
// ---------------------------------------------------------------------------

/**
 * Create a flag constants object from a list of names.
 * The first name gets value 1, the second 2, etc.
 */
export function createFlags(...names: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (let i = 0; i < names.length; i++) {
    result[names[i]] = 1 << i;
  }
  return result;
}

/**
 * Return true if `value` has `flag` set.
 */
export function hasFlag(value: number, flag: number): boolean {
  return (value & flag) === flag;
}

/**
 * Set `flag` bits in `value`.
 */
export function setFlag(value: number, flag: number): number {
  return u32(value | flag);
}

/**
 * Clear `flag` bits from `value`.
 */
export function clearFlag(value: number, flag: number): number {
  return u32(value & ~flag);
}

/**
 * Toggle `flag` bits in `value`.
 */
export function toggleFlag(value: number, flag: number): number {
  return u32(value ^ flag);
}

/**
 * Combine (OR) multiple flags into one value.
 */
export function combineFlags(...flags: number[]): number {
  return u32(flags.reduce((acc, f) => acc | f, 0));
}

/**
 * Return the names of all active flags in `value` from the given `flagMap`.
 */
export function getActiveFlags(value: number, flagMap: Record<string, number>): string[] {
  return Object.entries(flagMap)
    .filter(([, flag]) => hasFlag(value, flag))
    .map(([name]) => name);
}

/**
 * Convert a number to its binary string representation, zero-padded to `width` bits.
 * Default width is 8.
 */
export function toBitString(n: number, width: number = 8): string {
  const v = u32(n);
  const raw = v.toString(2);
  return raw.padStart(width, '0').slice(-width);
}

/**
 * Parse a binary string (e.g. '00001010') into a number.
 */
export function fromBitString(s: string): number {
  return u32(parseInt(s, 2));
}

// ---------------------------------------------------------------------------
// Buffer / byte operations
// ---------------------------------------------------------------------------

/**
 * Convert a string, number array, or Uint8Array into a Node.js Buffer.
 */
export function toBuffer(data: string | number[] | Uint8Array): Buffer {
  if (typeof data === 'string') {
    return Buffer.from(data, 'utf8');
  }
  if (data instanceof Uint8Array) {
    return Buffer.from(data);
  }
  return Buffer.from(data);
}

/**
 * Concatenate one or more Buffers into a single Buffer.
 */
export function concat(...buffers: Buffer[]): Buffer {
  return Buffer.concat(buffers);
}

/**
 * Split a Buffer by a delimiter Buffer. Returns an array of Buffer slices.
 */
export function split(buf: Buffer, delimiter: Buffer): Buffer[] {
  const result: Buffer[] = [];
  let start = 0;
  let pos = indexOf(buf, delimiter);
  while (pos !== -1) {
    result.push(buf.slice(start, pos));
    start = pos + delimiter.length;
    pos = indexOf(buf.slice(start), delimiter);
    if (pos !== -1) pos += start;
  }
  result.push(buf.slice(start));
  return result;
}

/**
 * Find the first occurrence of `needle` in `haystack`. Returns -1 if not found.
 */
export function indexOf(haystack: Buffer, needle: Buffer): number {
  if (needle.length === 0) return 0;
  if (needle.length > haystack.length) return -1;
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
}

/**
 * Read an unsigned 16-bit integer from `buf` at `offset`.
 */
export function readUInt16(buf: Buffer, offset: number, order: ByteOrder = 'big-endian'): number {
  if (order === 'big-endian') {
    return buf.readUInt16BE(offset);
  }
  return buf.readUInt16LE(offset);
}

/**
 * Read an unsigned 32-bit integer from `buf` at `offset`.
 */
export function readUInt32(buf: Buffer, offset: number, order: ByteOrder = 'big-endian'): number {
  if (order === 'big-endian') {
    return buf.readUInt32BE(offset);
  }
  return buf.readUInt32LE(offset);
}

/**
 * Read a signed 16-bit integer from `buf` at `offset`.
 */
export function readInt16(buf: Buffer, offset: number, order: ByteOrder = 'big-endian'): number {
  if (order === 'big-endian') {
    return buf.readInt16BE(offset);
  }
  return buf.readInt16LE(offset);
}

/**
 * Read a signed 32-bit integer from `buf` at `offset`.
 */
export function readInt32(buf: Buffer, offset: number, order: ByteOrder = 'big-endian'): number {
  if (order === 'big-endian') {
    return buf.readInt32BE(offset);
  }
  return buf.readInt32LE(offset);
}

/**
 * Write an unsigned 16-bit integer as a 2-byte Buffer.
 */
export function writeUInt16(value: number, order: ByteOrder = 'big-endian'): Buffer {
  const buf = Buffer.allocUnsafe(2);
  if (order === 'big-endian') {
    buf.writeUInt16BE(value, 0);
  } else {
    buf.writeUInt16LE(value, 0);
  }
  return buf;
}

/**
 * Write an unsigned 32-bit integer as a 4-byte Buffer.
 */
export function writeUInt32(value: number, order: ByteOrder = 'big-endian'): Buffer {
  const buf = Buffer.allocUnsafe(4);
  if (order === 'big-endian') {
    buf.writeUInt32BE(value, 0);
  } else {
    buf.writeUInt32LE(value, 0);
  }
  return buf;
}

/**
 * XOR two same-length Buffers byte by byte.
 */
export function xorBuffers(a: Buffer, b: Buffer): Buffer {
  if (a.length !== b.length) {
    throw new RangeError('xorBuffers: buffers must be the same length');
  }
  const result = Buffer.allocUnsafe(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i];
  }
  return result;
}

/**
 * Compute the Hamming distance between two same-length Buffers at the bit level.
 */
export function hammingDistance(a: Buffer, b: Buffer): number {
  if (a.length !== b.length) {
    throw new RangeError('hammingDistance: buffers must be the same length');
  }
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    dist += countBits(a[i] ^ b[i]);
  }
  return dist;
}

/**
 * Constant-time equality comparison of two Buffers.
 */
export function isEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

// ---------------------------------------------------------------------------
// Encoding helpers
// ---------------------------------------------------------------------------

/**
 * Convert each byte in a Buffer to its 8-bit binary representation, space-separated.
 * Example: Buffer [0x0A, 0xFF] → '00001010 11111111'
 */
export function toBinaryString(buf: Buffer): string {
  const parts: string[] = [];
  for (let i = 0; i < buf.length; i++) {
    parts.push(toBitString(buf[i], 8));
  }
  return parts.join(' ');
}

/**
 * Produce a formatted hex dump of a Buffer (similar to `xxd`).
 * Each row shows `width` bytes (default 16), with hex on the left and ASCII on the right.
 */
export function toHexDump(buf: Buffer, width: number = 16): string {
  const lines: string[] = [];
  for (let offset = 0; offset < buf.length; offset += width) {
    const slice = buf.slice(offset, offset + width);
    const hex = Array.from(slice)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(' ');
    const ascii = Array.from(slice)
      .map((b) => (b >= 0x20 && b < 0x7f ? String.fromCharCode(b) : '.'))
      .join('');
    const offsetStr = offset.toString(16).padStart(8, '0');
    const hexPadded = hex.padEnd(width * 3 - 1, ' ');
    lines.push(`${offsetStr}  ${hexPadded}  ${ascii}`);
  }
  return lines.join('\n');
}

/**
 * Parse a hex dump produced by `toHexDump` back into a Buffer.
 * Strips offset columns and ASCII columns; reads only the hex bytes.
 */
export function fromHexDump(dump: string): Buffer {
  const bytes: number[] = [];
  for (const line of dump.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Strip leading offset (8 hex chars + 2 spaces)
    const withoutOffset = trimmed.replace(/^[0-9a-fA-F]{8}\s{1,2}/, '');
    // Extract the hex portion: everything before the last 2+ spaces + ASCII block
    // Strategy: split on two or more spaces; first token(s) are hex pairs
    const hexSection = withoutOffset.split(/\s{2,}/)[0];
    const hexTokens = hexSection.trim().split(/\s+/);
    for (const token of hexTokens) {
      if (/^[0-9a-fA-F]{2}$/.test(token)) {
        bytes.push(parseInt(token, 16));
      }
    }
  }
  return Buffer.from(bytes);
}
