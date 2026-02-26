// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export function xor(a: Uint8Array, b: Uint8Array): Uint8Array {
  const len = Math.min(a.length, b.length);
  const result = new Uint8Array(len);
  for (let i = 0; i < len; i++) result[i] = a[i] ^ b[i];
  return result;
}

export function rotateLeft32(x: number, n: number): number {
  n = n & 31;
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

export function rotateRight32(x: number, n: number): number {
  n = n & 31;
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex string length');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

export function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

export function base64ToBytes(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

export function bytesToUtf8(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('utf8');
}

export function utf8ToBytes(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, 'utf8'));
}

export function fnv1a32(data: Uint8Array): number {
  let hash = 2166136261;
  for (let i = 0; i < data.length; i++) {
    hash ^= data[i];
    hash = (Math.imul(hash, 16777619)) >>> 0;
  }
  return hash;
}

export function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(hash, 33) + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function adler32(data: Uint8Array): number {
  let a = 1, b = 0;
  const MOD = 65521;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % MOD;
    b = (b + a) % MOD;
  }
  return ((b << 16) | a) >>> 0;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
})();

export function crc32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ data[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

export function murmur3(data: Uint8Array, seed: number = 0): number {
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;
  let h = seed >>> 0;
  const len = data.length;
  const nblocks = Math.floor(len / 4);
  for (let i = 0; i < nblocks; i++) {
    let k = (data[i * 4] | (data[i * 4 + 1] << 8) | (data[i * 4 + 2] << 16) | (data[i * 4 + 3] << 24)) >>> 0;
    k = Math.imul(k, c1) >>> 0;
    k = rotateLeft32(k, 15);
    k = Math.imul(k, c2) >>> 0;
    h ^= k;
    h = rotateLeft32(h, 13);
    h = (Math.imul(h, 5) + 0xe6546b64) >>> 0;
  }
  let tail = 0;
  const rem = len & 3;
  const off = nblocks * 4;
  if (rem >= 3) tail ^= data[off + 2] << 16;
  if (rem >= 2) tail ^= data[off + 1] << 8;
  if (rem >= 1) { tail ^= data[off]; tail = Math.imul(tail, c1) >>> 0; tail = rotateLeft32(tail, 15); tail = Math.imul(tail, c2) >>> 0; h ^= tail; }
  h ^= len;
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

export function generateNonce(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return bytes;
}

export function generateId(length: number = 16): string {
  return bytesToHex(generateNonce(length));
}

export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function padPKCS7(data: Uint8Array, blockSize: number): Uint8Array {
  const padLen = blockSize - (data.length % blockSize);
  const padded = new Uint8Array(data.length + padLen);
  padded.set(data);
  padded.fill(padLen, data.length);
  return padded;
}

export function unpadPKCS7(data: Uint8Array): Uint8Array {
  if (data.length === 0) throw new Error('Empty data');
  const padLen = data[data.length - 1];
  if (padLen === 0 || padLen > data.length) throw new Error('Invalid padding');
  return data.slice(0, data.length - padLen);
}

export function splitBytes(data: Uint8Array, chunkSize: number): Uint8Array[] {
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
}

export function joinBytes(...chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}

export function zeroPad(data: Uint8Array, length: number): Uint8Array {
  if (data.length >= length) return data.slice(0, length);
  const result = new Uint8Array(length);
  result.set(data, length - data.length);
  return result;
}
