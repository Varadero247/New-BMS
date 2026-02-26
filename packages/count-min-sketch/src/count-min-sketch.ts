// Copyright (c) 2026 Nexara DMCC. All rights reserved.

function murmur3(str: string, seed: number): number {
  let h = seed >>> 0;
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

export class CountMinSketch {
  private table: number[][];
  private seeds: number[];
  readonly width: number;
  readonly depth: number;
  private totalCount: number;

  constructor(width = 1024, depth = 5) {
    if (width < 1 || depth < 1) throw new RangeError('width and depth must be >= 1');
    this.width = width;
    this.depth = depth;
    this.table = Array.from({ length: depth }, () => new Array(width).fill(0));
    this.seeds = Array.from({ length: depth }, (_, i) => (i + 1) * 999983);
    this.totalCount = 0;
  }

  add(item: string, count = 1): void {
    if (count <= 0) return;
    this.totalCount += count;
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

  /** Conservative update: only increment cells that equal current estimate */
  addConservative(item: string, count = 1): void {
    if (count <= 0) return;
    const cur = this.estimate(item);
    const target = cur + count;
    this.totalCount += count;
    for (let i = 0; i < this.depth; i++) {
      const col = murmur3(item, this.seeds[i]) % this.width;
      if (this.table[i][col] < target) this.table[i][col] = target;
    }
  }

  merge(other: CountMinSketch): CountMinSketch {
    if (this.width !== other.width || this.depth !== other.depth) {
      throw new Error('Cannot merge sketches with different dimensions');
    }
    const result = new CountMinSketch(this.width, this.depth);
    result.seeds = [...this.seeds];
    result.totalCount = this.totalCount + other.totalCount;
    for (let i = 0; i < this.depth; i++)
      for (let j = 0; j < this.width; j++)
        result.table[i][j] = this.table[i][j] + other.table[i][j];
    return result;
  }

  get total(): number { return this.totalCount; }

  clear(): void {
    this.table.forEach(row => row.fill(0));
    this.totalCount = 0;
  }

  clone(): CountMinSketch {
    const c = new CountMinSketch(this.width, this.depth);
    c.seeds = [...this.seeds];
    c.totalCount = this.totalCount;
    for (let i = 0; i < this.depth; i++) c.table[i] = [...this.table[i]];
    return c;
  }

  /** Theoretical error bound: epsilon = e / width */
  get errorRate(): number { return Math.E / this.width; }
  /** Theoretical failure probability: delta = 1 / e^depth */
  get failureProb(): number { return 1 / Math.pow(Math.E, this.depth); }
}

// Count-Mean-Min Sketch (bias corrected variant)
export class CountMeanMinSketch extends CountMinSketch {
  estimateBiasCorrected(item: string): number {
    // Count-Mean-Min: subtract mean of other cells to reduce bias
    let min = Infinity;
    for (let i = 0; i < this.depth; i++) {
      const col = murmur3(item, (this as any).seeds[i]) % this.width;
      const cell = (this as any).table[i][col];
      const rowSum = (this as any).table[i].reduce((a: number, b: number) => a + b, 0);
      const mean = (rowSum - cell) / (this.width - 1);
      const corrected = cell - mean;
      if (corrected < min) min = corrected;
    }
    return Math.max(0, min === Infinity ? 0 : min);
  }
}

// Lossy Counting for heavy hitters
export class LossyCounting {
  private counts: Map<string, number>;
  private errors: Map<string, number>;
  private n: number;   // total items seen
  private w: number;   // window size = ceil(1/epsilon)
  private currentBucket: number;
  private epsilon: number;

  constructor(epsilon = 0.01) {
    if (epsilon <= 0 || epsilon >= 1) throw new RangeError('epsilon must be in (0, 1)');
    this.epsilon = epsilon;
    this.w = Math.ceil(1 / epsilon);
    this.counts = new Map();
    this.errors = new Map();
    this.n = 0;
    this.currentBucket = 1;
  }

  add(item: string): void {
    this.n++;
    if (this.counts.has(item)) {
      this.counts.set(item, this.counts.get(item)! + 1);
    } else {
      this.counts.set(item, 1);
      this.errors.set(item, this.currentBucket - 1);
    }
    // At end of window, prune low-count items
    if (this.n % this.w === 0) {
      for (const [key, count] of this.counts) {
        if (count + (this.errors.get(key) || 0) <= this.currentBucket) {
          this.counts.delete(key);
          this.errors.delete(key);
        }
      }
      this.currentBucket++;
    }
  }

  /** Get items with estimated frequency >= support fraction */
  heavyHitters(support: number): Array<{ item: string; count: number }> {
    const threshold = (support - this.epsilon) * this.n;
    const result: Array<{ item: string; count: number }> = [];
    for (const [item, count] of this.counts) {
      if (count >= threshold) result.push({ item, count });
    }
    return result.sort((a, b) => b.count - a.count);
  }

  get totalItems(): number { return this.n; }
  get uniqueTracked(): number { return this.counts.size; }
}

// Frequent Items / Misra-Gries algorithm
export class MisraGries {
  private counts: Map<string, number>;
  private k: number;

  constructor(k: number) {
    if (k < 1) throw new RangeError('k must be >= 1');
    this.k = k;
    this.counts = new Map();
  }

  add(item: string): void {
    if (this.counts.has(item)) {
      this.counts.set(item, this.counts.get(item)! + 1);
    } else if (this.counts.size < this.k - 1) {
      this.counts.set(item, 1);
    } else {
      // Decrement all, remove zeros
      for (const [key, count] of this.counts) {
        if (count === 1) this.counts.delete(key);
        else this.counts.set(key, count - 1);
      }
    }
  }

  /** Get top-k candidates (may include false positives) */
  topK(): Array<{ item: string; count: number }> {
    return [...this.counts.entries()]
      .map(([item, count]) => ({ item, count }))
      .sort((a, b) => b.count - a.count);
  }

  get size(): number { return this.counts.size; }
}

// Standalone convenience functions
export function countFrequency(items: string[], width = 512, depth = 5): Map<string, number> {
  const sketch = new CountMinSketch(width, depth);
  items.forEach(item => sketch.add(item));
  const unique = new Set(items);
  const result = new Map<string, number>();
  unique.forEach(item => result.set(item, sketch.estimate(item)));
  return result;
}

export function findHeavyHitters(items: string[], support = 0.01): string[] {
  const lc = new LossyCounting(support / 2);
  items.forEach(item => lc.add(item));
  return lc.heavyHitters(support).map(h => h.item);
}
