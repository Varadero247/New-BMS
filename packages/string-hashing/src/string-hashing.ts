// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export function djb2(s: string): number {
  let hash = 5381;
  for (let i = 0; i < s.length; i++) hash = ((hash << 5) + hash) + s.charCodeAt(i);
  return hash >>> 0;
}

export function sdbm(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
  return hash >>> 0;
}

export function fnv1a32(s: string): number {
  let hash = 2166136261;
  for (let i = 0; i < s.length; i++) { hash ^= s.charCodeAt(i); hash = (hash * 16777619) >>> 0; }
  return hash;
}

export function polynomialHash(s: string, base = 31, mod = 1e9 + 7): number {
  let hash = 0, power = 1;
  for (let i = 0; i < s.length; i++) {
    hash = (hash + (s.charCodeAt(i) - 96) * power) % mod;
    power = (power * base) % mod;
  }
  return Math.round(hash);
}

export class RollingHash {
  private _hash = 0;
  private _window: number[] = [];
  private _powers: number[] = [1];
  private _base: number;
  private _mod: number;
  private _windowSize: number;
  constructor(windowSize: number, base = 31, mod = 1000000007) {
    this._windowSize = windowSize; this._base = base; this._mod = mod;
    for (let i = 1; i <= windowSize; i++) this._powers[i] = (this._powers[i-1] * base) % mod;
  }
  push(ch: string): void {
    const code = ch.charCodeAt(0);
    this._hash = (this._hash * this._base + code) % this._mod;
    this._window.push(code);
    if (this._window.length > this._windowSize) {
      const removed = this._window.shift()!;
      this._hash = (this._hash - removed * this._powers[this._windowSize] % this._mod + this._mod * 2) % this._mod;
    }
  }
  get hash(): number { return this._hash; }
  reset(): void { this._hash = 0; this._window = []; }
}

export function rabinKarp(text: string, pattern: string): number[] {
  const result: number[] = [];
  if (pattern.length === 0 || pattern.length > text.length) return result;
  const ph = fnv1a32(pattern);
  for (let i = 0; i <= text.length - pattern.length; i++) {
    if (fnv1a32(text.slice(i, i + pattern.length)) === ph && text.slice(i, i + pattern.length) === pattern) result.push(i);
  }
  return result;
}

export function jenkinsOAT(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash += s.charCodeAt(i); hash += (hash << 10); hash ^= (hash >> 6);
  }
  hash += (hash << 3); hash ^= (hash >> 11); hash += (hash << 15);
  return hash >>> 0;
}

export function adler32(s: string): number {
  let a = 1, b = 0;
  for (let i = 0; i < s.length; i++) { a = (a + s.charCodeAt(i)) % 65521; b = (b + a) % 65521; }
  return ((b << 16) | a) >>> 0;
}

export function bkdrHash(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 131 + s.charCodeAt(i)) >>> 0;
  return hash;
}

export function areAnagrams(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const freq: Record<string, number> = {};
  for (const c of a) freq[c] = (freq[c] || 0) + 1;
  for (const c of b) { if (!freq[c]) return false; freq[c]--; }
  return true;
}

export function charFrequency(s: string): Map<string, number> {
  const map = new Map<string, number>();
  for (const c of s) map.set(c, (map.get(c) || 0) + 1);
  return map;
}

export function consistentHash(s: string, buckets: number): number {
  return djb2(s) % buckets;
}

export function multiHash(s: string, k: number, mod: number): number[] {
  return Array.from({ length: k }, (_, i) => polynomialHash(s, 31 + i * 2, mod));
}

export function normalizeHash(hash: number, mod: number): number {
  return (hash % mod) / mod;
}

export function murmurhash3_32(s: string, seed = 0): number {
  let h = seed;
  for (let i = 0; i < s.length; i++) {
    let k = s.charCodeAt(i);
    k = Math.imul(k, 0xcc9e2d51); k = (k << 15) | (k >>> 17); k = Math.imul(k, 0x1b873593);
    h ^= k; h = (h << 13) | (h >>> 19); h = (Math.imul(h, 5) + 0xe6546b64) | 0;
  }
  h ^= s.length; h ^= (h >>> 16); h = Math.imul(h, 0x85ebca6b); h ^= (h >>> 13);
  h = Math.imul(h, 0xc2b2ae35); h ^= (h >>> 16);
  return h >>> 0;
}

export function collisionRate(strings: string[], hashFn: (s: string) => number): number {
  const hashes = strings.map(hashFn);
  const unique = new Set(hashes).size;
  return strings.length === 0 ? 0 : (strings.length - unique) / strings.length;
}
