// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { createHash, createHmac, randomBytes, timingSafeEqual as cryptoTimingSafeEqual } from 'crypto';

// ─── Basic hash functions — return hex digest ────────────────────────────────

export function md5(data: string | Buffer): string {
  return createHash('md5').update(data).digest('hex');
}

export function sha1(data: string | Buffer): string {
  return createHash('sha1').update(data).digest('hex');
}

export function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

export function sha384(data: string | Buffer): string {
  return createHash('sha384').update(data).digest('hex');
}

export function sha512(data: string | Buffer): string {
  return createHash('sha512').update(data).digest('hex');
}

export function sha3_256(data: string | Buffer): string {
  return createHash('sha3-256').update(data).digest('hex');
}

// ─── Generic hash with algorithm selection ───────────────────────────────────

export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512' | 'sha3-256' | 'sha3-512';

export function hash(data: string | Buffer, algorithm: HashAlgorithm): string {
  return createHash(algorithm).update(data).digest('hex');
}

// ─── Output encoding variants ────────────────────────────────────────────────

export function sha256Base64(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('base64');
}

export function sha256Buffer(data: string | Buffer): Buffer {
  return createHash('sha256').update(data).digest();
}

export function sha256Uint8(data: string | Buffer): Uint8Array {
  return new Uint8Array(sha256Buffer(data));
}

// ─── HMAC ────────────────────────────────────────────────────────────────────

export function hmacSha256(key: string | Buffer, data: string | Buffer): string {
  return createHmac('sha256', key).update(data).digest('hex');
}

export function hmacSha512(key: string | Buffer, data: string | Buffer): string {
  return createHmac('sha512', key).update(data).digest('hex');
}

export function hmacMd5(key: string | Buffer, data: string | Buffer): string {
  return createHmac('md5', key).update(data).digest('hex');
}

export function hmac(algorithm: HashAlgorithm, key: string | Buffer, data: string | Buffer): string {
  return createHmac(algorithm, key).update(data).digest('hex');
}

// ─── Verify HMAC (constant-time comparison) ──────────────────────────────────

export function verifyHmac(
  algorithm: HashAlgorithm,
  key: string | Buffer,
  data: string | Buffer,
  expected: string,
): boolean {
  const computed = hmac(algorithm, key, data);
  if (computed.length !== expected.length) return false;
  try {
    return cryptoTimingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

// ─── Constant-time comparison of two hex strings ─────────────────────────────

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return cryptoTimingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// ─── File checksum (from Buffer) ─────────────────────────────────────────────

export function checksum(data: Buffer, algorithm: HashAlgorithm = 'sha256'): string {
  return createHash(algorithm).update(data).digest('hex');
}

// ─── Integrity: generate and verify ──────────────────────────────────────────

export function generateIntegrity(data: string | Buffer, algorithm: HashAlgorithm = 'sha256'): string {
  const digest = createHash(algorithm).update(data).digest('base64');
  return `${algorithm}-${digest}`;
}

export function verifyIntegrity(data: string | Buffer, integrity: string): boolean {
  const dashIdx = integrity.indexOf('-');
  if (dashIdx === -1) return false;
  const algorithm = integrity.slice(0, dashIdx) as HashAlgorithm;
  const expectedBase64 = integrity.slice(dashIdx + 1);
  try {
    const computed = createHash(algorithm).update(data).digest('base64');
    return computed === expectedBase64;
  } catch {
    return false;
  }
}

// ─── CRC32 (pure JS implementation) ──────────────────────────────────────────

const CRC32_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table.push(c);
  }
  return table;
})();

export function crc32(data: string | Buffer): number {
  const buf = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ─── Adler32 checksum ────────────────────────────────────────────────────────

export function adler32(data: string | Buffer): number {
  const buf = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
  const MOD_ADLER = 65521;
  let a = 1;
  let b = 0;
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % MOD_ADLER;
    b = (b + a) % MOD_ADLER;
  }
  return ((b << 16) | a) >>> 0;
}

// ─── FNV-1a 32-bit hash ───────────────────────────────────────────────────────

export function fnv1a32(data: string): number {
  const FNV_PRIME = 0x01000193;
  const FNV_OFFSET = 0x811c9dc5;
  let hash32 = FNV_OFFSET;
  for (let i = 0; i < data.length; i++) {
    hash32 ^= data.charCodeAt(i);
    hash32 = Math.imul(hash32, FNV_PRIME);
  }
  return hash32 >>> 0;
}

// ─── DJB2 hash ───────────────────────────────────────────────────────────────

export function djb2(data: string): number {
  let hash32 = 5381;
  for (let i = 0; i < data.length; i++) {
    hash32 = (Math.imul(hash32, 33) ^ data.charCodeAt(i)) >>> 0;
  }
  return hash32 >>> 0;
}

// ─── MurmurHash3 (32-bit, seed=0) ────────────────────────────────────────────

export function murmur3(data: string, seed = 0): number {
  const key = Buffer.from(data, 'utf8');
  const len = key.length;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  let h1 = seed >>> 0;
  const nblocks = Math.floor(len / 4);

  for (let i = 0; i < nblocks; i++) {
    let k1 = key.readUInt32LE(i * 4);
    k1 = Math.imul(k1, c1) >>> 0;
    k1 = ((k1 << 15) | (k1 >>> 17)) >>> 0;
    k1 = Math.imul(k1, c2) >>> 0;
    h1 ^= k1;
    h1 = ((h1 << 13) | (h1 >>> 19)) >>> 0;
    h1 = (Math.imul(h1, 5) + 0xe6546b64) >>> 0;
  }

  const tail = key.slice(nblocks * 4);
  let k1 = 0;
  switch (tail.length) {
    case 3:
      k1 ^= tail[2] << 16;
    // falls through
    case 2:
      k1 ^= tail[1] << 8;
    // falls through
    case 1:
      k1 ^= tail[0];
      k1 = Math.imul(k1, c1) >>> 0;
      k1 = ((k1 << 15) | (k1 >>> 17)) >>> 0;
      k1 = Math.imul(k1, c2) >>> 0;
      h1 ^= k1;
  }

  h1 ^= len;
  // fmix32
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 0x85ebca6b) >>> 0;
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 0xc2b2ae35) >>> 0;
  h1 ^= h1 >>> 16;
  return h1 >>> 0;
}

// ─── Simple non-cryptographic hash (for hash tables) ─────────────────────────

export function simpleHash(data: string, buckets = 1000): number {
  let h = 0;
  for (let i = 0; i < data.length; i++) {
    h = (h * 31 + data.charCodeAt(i)) >>> 0;
  }
  return h % buckets;
}

// ─── Password hashing (PBKDF2-based, no bcrypt dep) ──────────────────────────

export interface HashedPassword {
  hash: string;
  salt: string;
  iterations: number;
  algorithm: string;
}

export function hashPassword(
  password: string,
  saltHex?: string,
  iterations = 100000,
): HashedPassword {
  const { pbkdf2Sync } = require('crypto') as typeof import('crypto');
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : randomBytes(32);
  const derived = pbkdf2Sync(password, salt, iterations, 64, 'sha512');
  return {
    hash: derived.toString('hex'),
    salt: salt.toString('hex'),
    iterations,
    algorithm: 'pbkdf2-sha512',
  };
}

export function verifyPassword(password: string, hashed: HashedPassword): boolean {
  const { pbkdf2Sync } = require('crypto') as typeof import('crypto');
  const salt = Buffer.from(hashed.salt, 'hex');
  const derived = pbkdf2Sync(password, salt, hashed.iterations, 64, 'sha512');
  const derivedHex = derived.toString('hex');
  if (derivedHex.length !== hashed.hash.length) return false;
  try {
    return cryptoTimingSafeEqual(Buffer.from(derivedHex, 'hex'), Buffer.from(hashed.hash, 'hex'));
  } catch {
    return false;
  }
}

// ─── Content-addressable key ──────────────────────────────────────────────────

export function contentKey(data: string | Buffer): string {
  return sha256(data);
}

// ─── Combine multiple hashes ──────────────────────────────────────────────────

export function combineHashes(...hashes: string[]): string {
  return sha256(hashes.join(''));
}

// ─── Short hash: first N hex chars of sha256 ─────────────────────────────────

export function shortHash(data: string | Buffer, length = 8): string {
  return sha256(data).slice(0, length);
}

// ─── Deterministic ID from object ────────────────────────────────────────────

export function objectHash(obj: unknown): string {
  const sorted = JSON.stringify(obj, (_, value) => {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value as Record<string, unknown>)
        .sort()
        .reduce(
          (acc, k) => {
            acc[k] = (value as Record<string, unknown>)[k];
            return acc;
          },
          {} as Record<string, unknown>,
        );
    }
    return value;
  });
  return sha256(sorted);
}

// ─── List available algorithms ────────────────────────────────────────────────

export function listAlgorithms(): HashAlgorithm[] {
  return ['md5', 'sha1', 'sha256', 'sha384', 'sha512', 'sha3-256', 'sha3-512'];
}
