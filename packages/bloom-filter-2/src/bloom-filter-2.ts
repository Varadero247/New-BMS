// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

function hash(s: string, seed: number, m: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 0x9e3779b9) >>> 0;
    h = (((h << 13) | (h >>> 19)) >>> 0);
  }
  return h % m;
}

export class BloomFilter {
  private bits: Uint8Array;
  private _added = 0;
  constructor(private m: number = 10000, private k: number = 3) {
    this.bits = new Uint8Array(Math.ceil(m / 8));
  }
  private _hashes(item: string): number[] {
    return Array.from({ length: this.k }, (_, i) => hash(item, (i + 1) * 2654435761, this.m));
  }
  add(item: string): void {
    for (const h of this._hashes(item)) this.bits[h >> 3] |= 1 << (h & 7);
    this._added++;
  }
  has(item: string): boolean {
    return this._hashes(item).every(h => (this.bits[h >> 3] >> (h & 7)) & 1);
  }
  get size(): number { return this._added; }
  clear(): void { this.bits.fill(0); this._added = 0; }
}

export class CountingBloomFilter {
  private counts: Uint16Array;
  constructor(private m: number = 10000, private k: number = 3) {
    this.counts = new Uint16Array(m);
  }
  private _hashes(item: string): number[] {
    return Array.from({ length: this.k }, (_, i) => hash(item, (i + 1) * 2654435761, this.m));
  }
  add(item: string): void { for (const h of this._hashes(item)) this.counts[h]++; }
  has(item: string): boolean { return this._hashes(item).every(h => this.counts[h] > 0); }
  remove(item: string): void { for (const h of this._hashes(item)) { if (this.counts[h] > 0) this.counts[h]--; } }
}

export class ScalableBloomFilter {
  private filters: BloomFilter[] = [];
  private capacity: number;
  constructor(initialCapacity = 1000) {
    this.capacity = initialCapacity;
    this.filters.push(new BloomFilter(initialCapacity * 10, 3));
  }
  add(item: string): void {
    const last = this.filters[this.filters.length - 1];
    if (last.size >= this.capacity * this.filters.length) {
      this.filters.push(new BloomFilter(this.capacity * this.filters.length * 20, 3));
    }
    this.filters[this.filters.length - 1].add(item);
  }
  has(item: string): boolean { return this.filters.some(f => f.has(item)); }
}

export function estimateFalsePositiveRate(m: number, k: number, n: number): number {
  return Math.pow(1 - Math.exp(-k * n / m), k);
}
