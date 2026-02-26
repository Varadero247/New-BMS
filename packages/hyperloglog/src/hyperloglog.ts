// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// MurmurHash3 32-bit (simplified for integers/strings)
function murmur3(str: string, seed = 0): number {
  let h = seed;
  for (let i = 0; i < str.length; i++) {
    let k = str.charCodeAt(i);
    k = Math.imul(k, 0xcc9e2d51);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, 0x1b873593);
    h ^= k;
    h = (h << 13) | (h >>> 19);
    h = (Math.imul(h, 5) + 0xe6546b64) | 0;
  }
  h ^= str.length;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

function clz32(x: number): number {
  if (x === 0) return 32;
  let n = 0;
  if ((x & 0xFFFF0000) === 0) { n += 16; x <<= 16; }
  if ((x & 0xFF000000) === 0) { n += 8; x <<= 8; }
  if ((x & 0xF0000000) === 0) { n += 4; x <<= 4; }
  if ((x & 0xC0000000) === 0) { n += 2; x <<= 2; }
  if ((x & 0x80000000) === 0) { n += 1; }
  return n;
}

export class HyperLogLog {
  private b: number;  // log2(m) register bits
  private m: number;  // number of registers = 2^b
  private registers: Uint8Array;
  private alpha: number;
  private seed: number;

  constructor(b = 10, seed = 42) {
    if (b < 4 || b > 16) throw new RangeError('b must be in [4, 16]');
    this.b = b;
    this.m = 1 << b;
    this.registers = new Uint8Array(this.m);
    this.seed = seed;
    // Alpha constants
    if (this.m === 16) this.alpha = 0.673;
    else if (this.m === 32) this.alpha = 0.697;
    else if (this.m === 64) this.alpha = 0.709;
    else this.alpha = 0.7213 / (1 + 1.079 / this.m);
  }

  add(item: string): void {
    const hash = murmur3(item, this.seed);
    const j = hash >>> (32 - this.b);         // register index
    const w = (hash << this.b) | (1 << (this.b - 1)); // remaining bits
    const rho = clz32(w) + 1;                 // position of leftmost 1-bit
    if (rho > this.registers[j]) this.registers[j] = rho;
  }

  count(): number {
    let sum = 0;
    for (let i = 0; i < this.m; i++) sum += Math.pow(2, -this.registers[i]);
    let estimate = this.alpha * this.m * this.m / sum;
    // Small range correction
    if (estimate <= 2.5 * this.m) {
      let zeros = 0;
      for (let i = 0; i < this.m; i++) if (this.registers[i] === 0) zeros++;
      if (zeros > 0) estimate = this.m * Math.log(this.m / zeros);
    }
    return Math.round(estimate);
  }

  merge(other: HyperLogLog): HyperLogLog {
    if (this.m !== other.m) throw new Error('Cannot merge HLLs with different precision');
    const result = new HyperLogLog(this.b, this.seed);
    for (let i = 0; i < this.m; i++) {
      result.registers[i] = Math.max(this.registers[i], other.registers[i]);
    }
    return result;
  }

  /** Error rate estimate: 1.04 / sqrt(m) */
  get errorRate(): number { return 1.04 / Math.sqrt(this.m); }
  get precision(): number { return this.b; }
  get numRegisters(): number { return this.m; }

  clear(): void { this.registers.fill(0); }

  clone(): HyperLogLog {
    const c = new HyperLogLog(this.b, this.seed);
    c.registers.set(this.registers);
    return c;
  }
}

// MinHash for Jaccard similarity estimation
export class MinHash {
  private k: number;  // number of hash functions
  private signatures: number[];
  private seeds: number[];

  constructor(k = 128) {
    this.k = k;
    this.signatures = new Array(k).fill(Infinity);
    this.seeds = Array.from({ length: k }, (_, i) => i * 1234567 + 42);
  }

  add(item: string): void {
    for (let i = 0; i < this.k; i++) {
      const h = murmur3(item, this.seeds[i]);
      if (h < this.signatures[i]) this.signatures[i] = h;
    }
  }

  /** Estimate Jaccard similarity with another MinHash */
  similarity(other: MinHash): number {
    if (this.k !== other.k) throw new Error('Different k values');
    let matches = 0;
    for (let i = 0; i < this.k; i++) {
      if (this.signatures[i] === other.signatures[i]) matches++;
    }
    return matches / this.k;
  }

  get numHashFunctions(): number { return this.k; }
  get signatureArray(): number[] { return [...this.signatures]; }
}

// Count-Min Sketch (included here as a related probabilistic structure)
export class CountMinSketch {
  private width: number;
  private depth: number;
  private table: number[][];
  private seeds: number[];

  constructor(width = 1024, depth = 5) {
    this.width = width;
    this.depth = depth;
    this.table = Array.from({ length: depth }, () => new Array(width).fill(0));
    this.seeds = Array.from({ length: depth }, (_, i) => i * 999983 + 1);
  }

  add(item: string, count = 1): void {
    for (let i = 0; i < this.depth; i++) {
      const col = murmur3(item, this.seeds[i]) % this.width;
      this.table[i][col] += count;
    }
  }

  estimate(item: string): number {
    let min = Infinity;
    for (let i = 0; i < this.depth; i++) {
      const col = murmur3(item, this.seeds[i]) % this.width;
      min = Math.min(min, this.table[i][col]);
    }
    return min === Infinity ? 0 : min;
  }

  merge(other: CountMinSketch): CountMinSketch {
    const result = new CountMinSketch(this.width, this.depth);
    result.seeds = [...this.seeds];
    for (let i = 0; i < this.depth; i++)
      for (let j = 0; j < this.width; j++)
        result.table[i][j] = this.table[i][j] + other.table[i][j];
    return result;
  }

  get dimensions(): { width: number; depth: number } { return { width: this.width, depth: this.depth }; }
  clear(): void { this.table.forEach(row => row.fill(0)); }
}

// Bloom Filter (here for completeness as a related sketch structure)
export class ProbabilisticBloomFilter {
  private bits: Uint8Array;
  private k: number;  // number of hash functions
  private m: number;  // bit array size
  private seeds: number[];
  private count: number;

  constructor(m = 4096, k = 5) {
    this.m = m;
    this.k = k;
    this.bits = new Uint8Array(Math.ceil(m / 8));
    this.seeds = Array.from({ length: k }, (_, i) => i * 2654435761 + 1);
    this.count = 0;
  }

  add(item: string): void {
    this.count++;
    for (let i = 0; i < this.k; i++) {
      const pos = murmur3(item, this.seeds[i]) % this.m;
      this.bits[pos >> 3] |= 1 << (pos & 7);
    }
  }

  has(item: string): boolean {
    for (let i = 0; i < this.k; i++) {
      const pos = murmur3(item, this.seeds[i]) % this.m;
      if (!(this.bits[pos >> 3] & (1 << (pos & 7)))) return false;
    }
    return true;
  }

  get approximateCount(): number { return this.count; }
  get falsePositiveRate(): number {
    const ratio = this.count / this.m;
    return Math.pow(1 - Math.exp(-this.k * ratio), this.k);
  }
}

// Standalone helpers
export function estimateCardinality(items: string[], b = 10): number {
  const hll = new HyperLogLog(b);
  items.forEach(i => hll.add(i));
  return hll.count();
}

export function estimateJaccard(setA: string[], setB: string[], k = 128): number {
  const mhA = new MinHash(k);
  const mhB = new MinHash(k);
  setA.forEach(i => mhA.add(i));
  setB.forEach(i => mhB.add(i));
  return mhA.similarity(mhB);
}
