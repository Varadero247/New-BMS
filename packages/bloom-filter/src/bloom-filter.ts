// Copyright (c) 2026 Nexara DMCC. All rights reserved.

function hash1(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0);
}

function hash2(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}

function hash3(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h = h & h;
  }
  return (h >>> 0);
}

export class BloomFilter {
  private bits: Uint8Array;
  private size: number;
  private k: number;

  constructor(size = 1024, k = 3) {
    this.size = size;
    this.k = k;
    this.bits = new Uint8Array(Math.ceil(size / 8));
  }

  private setBit(pos: number): void {
    const byte = Math.floor(pos / 8);
    const bit = pos % 8;
    this.bits[byte] |= (1 << bit);
  }

  private getBit(pos: number): boolean {
    const byte = Math.floor(pos / 8);
    const bit = pos % 8;
    return (this.bits[byte] & (1 << bit)) !== 0;
  }

  private getPositions(item: string): number[] {
    const h1 = hash1(item) % this.size;
    const h2 = hash2(item) % this.size;
    const h3 = hash3(item) % this.size;
    const positions: number[] = [h1];
    if (this.k >= 2) positions.push(h2);
    if (this.k >= 3) positions.push(h3);
    for (let i = 3; i < this.k; i++) positions.push((h1 + i * h2 + i * i) % this.size);
    return positions;
  }

  add(item: string): void { for (const pos of this.getPositions(item)) this.setBit(pos); }

  mightContain(item: string): boolean { return this.getPositions(item).every(pos => this.getBit(pos)); }

  clear(): void { this.bits.fill(0); }

  get bitSize(): number { return this.size; }
  get hashFunctions(): number { return this.k; }

  estimateFalsePositiveRate(n: number): number {
    return Math.pow(1 - Math.exp(-this.k * n / this.size), this.k);
  }

  merge(other: BloomFilter): BloomFilter {
    if (other.size !== this.size || other.k !== this.k) throw new Error('Incompatible filters');
    const merged = new BloomFilter(this.size, this.k);
    for (let i = 0; i < this.bits.length; i++) merged.bits[i] = this.bits[i] | other.bits[i];
    return merged;
  }
}

export function createBloomFilter(size?: number, k?: number): BloomFilter { return new BloomFilter(size, k); }
export function optimalBloomSize(n: number, fpr: number): number { return Math.ceil(-n * Math.log(fpr) / (Math.log(2) ** 2)); }
export function optimalHashCount(m: number, n: number): number { return Math.max(1, Math.round((m / n) * Math.log(2))); }
