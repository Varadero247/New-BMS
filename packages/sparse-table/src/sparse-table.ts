// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * Generic sparse table — works for any idempotent operation (min, max, gcd, and, or, etc.)
 * Idempotent: f(f(a,b), b) = f(a,b) — allows O(1) query using overlapping intervals.
 *
 * Preprocessing: O(n log n) time and space.
 * Query:         O(1) — uses two overlapping intervals of length 2^k.
 */
export class SparseTable<T> {
  private readonly table: T[][];
  private readonly log: number[];
  private readonly n: number;
  private readonly combine: (a: T, b: T) => T;

  constructor(data: T[], combine: (a: T, b: T) => T) {
    this.n = data.length;
    this.combine = combine;

    // Precompute floor(log2(i)) for i = 1..n
    this.log = new Array<number>(this.n + 1).fill(0);
    for (let i = 2; i <= this.n; i++) {
      this.log[i] = this.log[Math.floor(i / 2)] + 1;
    }

    const levels = this.n > 0 ? this.log[this.n] + 1 : 1;
    this.table = Array.from({ length: levels }, () => new Array<T>(this.n));

    // Level 0: identity — each element covers a range of length 1
    for (let i = 0; i < this.n; i++) {
      this.table[0][i] = data[i];
    }

    // Fill upper levels
    for (let j = 1; j < levels; j++) {
      for (let i = 0; i + (1 << j) <= this.n; i++) {
        this.table[j][i] = combine(
          this.table[j - 1][i],
          this.table[j - 1][i + (1 << (j - 1))],
        );
      }
    }
  }

  /**
   * O(1) range query over [l, r] inclusive.
   * ONLY correct for idempotent operations.
   */
  query(l: number, r: number): T {
    if (l < 0 || r >= this.n || l > r) {
      throw new RangeError(`Invalid range [${l}, ${r}] for size ${this.n}`);
    }
    const k = this.log[r - l + 1];
    return this.combine(this.table[k][l], this.table[k][r - (1 << k) + 1]);
  }

  get size(): number {
    return this.n;
  }

  get(i: number): T {
    if (i < 0 || i >= this.n) {
      throw new RangeError(`Index ${i} out of bounds for size ${this.n}`);
    }
    return this.table[0][i];
  }
}

// ---------------------------------------------------------------------------
// Specialised: Range Minimum Query
// ---------------------------------------------------------------------------

/**
 * Range Minimum Query — O(1) query after O(n log n) preprocessing.
 */
export class RMQ {
  private readonly st: SparseTable<number>;
  private readonly stIdx: SparseTable<number>;
  private readonly n: number;

  constructor(data: number[]) {
    this.n = data.length;
    this.st = new SparseTable<number>(data, (a, b) => Math.min(a, b));

    // Parallel table tracking the index of the minimum
    const indexed: number[] = data.map((_, i) => i);
    this.stIdx = new SparseTable<number>(
      indexed,
      (a, b) => (data[a] <= data[b] ? a : b),
    );
  }

  /** Minimum value in [l, r] inclusive. */
  min(l: number, r: number): number {
    return this.st.query(l, r);
  }

  /** Index of minimum in [l, r] inclusive (leftmost if tied). */
  minIndex(l: number, r: number): number {
    return this.stIdx.query(l, r);
  }

  get size(): number {
    return this.n;
  }
}

// ---------------------------------------------------------------------------
// Specialised: Range Maximum Query
// ---------------------------------------------------------------------------

/**
 * Range Maximum Query — O(1) query after O(n log n) preprocessing.
 */
export class RMaxQ {
  private readonly st: SparseTable<number>;
  private readonly stIdx: SparseTable<number>;
  private readonly n: number;

  constructor(data: number[]) {
    this.n = data.length;
    this.st = new SparseTable<number>(data, (a, b) => Math.max(a, b));

    const indexed: number[] = data.map((_, i) => i);
    this.stIdx = new SparseTable<number>(
      indexed,
      (a, b) => (data[a] >= data[b] ? a : b),
    );
  }

  /** Maximum value in [l, r] inclusive. */
  max(l: number, r: number): number {
    return this.st.query(l, r);
  }

  /** Index of maximum in [l, r] inclusive (leftmost if tied). */
  maxIndex(l: number, r: number): number {
    return this.stIdx.query(l, r);
  }

  get size(): number {
    return this.n;
  }
}

// ---------------------------------------------------------------------------
// Specialised: Range GCD Query
// ---------------------------------------------------------------------------

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Range GCD Query — GCD is idempotent: gcd(gcd(a,b), b) = gcd(a,b).
 */
export class RGcdQ {
  private readonly st: SparseTable<number>;
  private readonly n: number;

  constructor(data: number[]) {
    this.n = data.length;
    this.st = new SparseTable<number>(data, gcd);
  }

  /** GCD of all elements in [l, r] inclusive. */
  gcd(l: number, r: number): number {
    return this.st.query(l, r);
  }

  get size(): number {
    return this.n;
  }
}

// ---------------------------------------------------------------------------
// Prefix Sum (1D)
// ---------------------------------------------------------------------------

/**
 * Prefix sum array for O(1) range sum queries and O(n) construction.
 * Not a sparse table, but a closely related range-query structure.
 */
export class PrefixSum {
  private readonly prefix: number[];
  private readonly original: number[];
  private readonly n: number;

  constructor(data: number[]) {
    this.n = data.length;
    this.original = [...data];
    this.prefix = new Array<number>(this.n + 1).fill(0);
    for (let i = 0; i < this.n; i++) {
      this.prefix[i + 1] = this.prefix[i] + data[i];
    }
  }

  /**
   * Sum of elements in [l, r] inclusive.
   */
  sum(l: number, r: number): number {
    if (l < 0 || r >= this.n || l > r) {
      throw new RangeError(`Invalid range [${l}, ${r}] for size ${this.n}`);
    }
    return this.prefix[r + 1] - this.prefix[l];
  }

  /**
   * Sum of elements in [0, i] inclusive.
   */
  prefixSum(i: number): number {
    if (i < 0 || i >= this.n) {
      throw new RangeError(`Index ${i} out of bounds for size ${this.n}`);
    }
    return this.prefix[i + 1];
  }

  /**
   * Original value at index i.
   */
  get(i: number): number {
    if (i < 0 || i >= this.n) {
      throw new RangeError(`Index ${i} out of bounds for size ${this.n}`);
    }
    return this.original[i];
  }

  get size(): number {
    return this.n;
  }
}

// ---------------------------------------------------------------------------
// 2D Prefix Sum
// ---------------------------------------------------------------------------

/**
 * 2D prefix sum for O(1) submatrix sum queries.
 */
export class PrefixSum2D {
  private readonly prefix: number[][];
  private readonly r: number;
  private readonly c: number;

  constructor(matrix: number[][]) {
    this.r = matrix.length;
    this.c = this.r > 0 ? matrix[0].length : 0;

    // prefix[i][j] = sum of matrix[0..i-1][0..j-1]
    this.prefix = Array.from({ length: this.r + 1 }, () =>
      new Array<number>(this.c + 1).fill(0),
    );

    for (let i = 1; i <= this.r; i++) {
      for (let j = 1; j <= this.c; j++) {
        this.prefix[i][j] =
          matrix[i - 1][j - 1] +
          this.prefix[i - 1][j] +
          this.prefix[i][j - 1] -
          this.prefix[i - 1][j - 1];
      }
    }
  }

  /**
   * Sum of submatrix with top-left (r1,c1) and bottom-right (r2,c2) inclusive.
   */
  sum(r1: number, c1: number, r2: number, c2: number): number {
    if (
      r1 < 0 || c1 < 0 || r2 >= this.r || c2 >= this.c ||
      r1 > r2 || c1 > c2
    ) {
      throw new RangeError(
        `Invalid submatrix [${r1},${c1}]..[${r2},${c2}] for ${this.r}x${this.c} matrix`,
      );
    }
    return (
      this.prefix[r2 + 1][c2 + 1] -
      this.prefix[r1][c2 + 1] -
      this.prefix[r2 + 1][c1] +
      this.prefix[r1][c1]
    );
  }

  get rows(): number {
    return this.r;
  }

  get cols(): number {
    return this.c;
  }
}

// ---------------------------------------------------------------------------
// Difference Array
// ---------------------------------------------------------------------------

/**
 * Difference array supporting O(1) range updates and O(n) full reconstruction.
 */
export class DifferenceArray {
  private readonly diff: number[];
  private readonly n: number;

  constructor(data: number[]) {
    this.n = data.length;
    this.diff = new Array<number>(this.n + 1).fill(0);
    // Build difference array from initial data
    for (let i = 0; i < this.n; i++) {
      this.diff[i] += data[i];
      this.diff[i + 1] -= data[i];
    }
  }

  /**
   * Add delta to every element in [l, r] inclusive. O(1).
   */
  add(l: number, r: number, delta: number): void {
    if (l < 0 || r >= this.n || l > r) {
      throw new RangeError(`Invalid range [${l}, ${r}] for size ${this.n}`);
    }
    this.diff[l] += delta;
    this.diff[r + 1] -= delta;
  }

  /**
   * Get current value at index i. O(i) — prefix sum of diff[0..i].
   */
  get(i: number): number {
    if (i < 0 || i >= this.n) {
      throw new RangeError(`Index ${i} out of bounds for size ${this.n}`);
    }
    let val = 0;
    for (let k = 0; k <= i; k++) {
      val += this.diff[k];
    }
    return val;
  }

  /**
   * Reconstruct the full array after all updates. O(n).
   */
  toArray(): number[] {
    const result: number[] = new Array<number>(this.n);
    let running = 0;
    for (let i = 0; i < this.n; i++) {
      running += this.diff[i];
      result[i] = running;
    }
    return result;
  }

  get size(): number {
    return this.n;
  }
}

// ---------------------------------------------------------------------------
// Sliding Window Min / Max (using RMQ / RMaxQ)
// ---------------------------------------------------------------------------

/**
 * Sliding window minimum for each window of size k.
 * Returns an array of length n - k + 1.
 */
export function slidingWindowMin(data: number[], k: number): number[] {
  const n = data.length;
  if (k <= 0 || k > n) {
    throw new RangeError(`Window size ${k} invalid for array of length ${n}`);
  }
  const rmq = new RMQ(data);
  const result: number[] = [];
  for (let i = 0; i <= n - k; i++) {
    result.push(rmq.min(i, i + k - 1));
  }
  return result;
}

/**
 * Sliding window maximum for each window of size k.
 * Returns an array of length n - k + 1.
 */
export function slidingWindowMax(data: number[], k: number): number[] {
  const n = data.length;
  if (k <= 0 || k > n) {
    throw new RangeError(`Window size ${k} invalid for array of length ${n}`);
  }
  const rmaxq = new RMaxQ(data);
  const result: number[] = [];
  for (let i = 0; i <= n - k; i++) {
    result.push(rmaxq.max(i, i + k - 1));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Build helpers
// ---------------------------------------------------------------------------

/** Convenience factory for RMQ. */
export function buildRMQ(data: number[]): RMQ {
  return new RMQ(data);
}

/** Convenience factory for RMaxQ. */
export function buildRMaxQ(data: number[]): RMaxQ {
  return new RMaxQ(data);
}

/** Convenience factory for PrefixSum. */
export function buildPrefixSum(data: number[]): PrefixSum {
  return new PrefixSum(data);
}

// ---------------------------------------------------------------------------
// SparseTableGeneric<T> — alias of SparseTable<T> under the requested name
// ---------------------------------------------------------------------------

/**
 * Alias: SparseTableGeneric<T> is identical to SparseTable<T>.
 * Exposed under a separate name as required by the public API.
 */
export class SparseTableGeneric<T> {
  private readonly inner: SparseTable<T>;

  constructor(arr: T[], combine: (a: T, b: T) => T) {
    this.inner = new SparseTable<T>(arr, combine);
  }

  query(l: number, r: number): T {
    return this.inner.query(l, r);
  }

  get size(): number {
    return this.inner.size;
  }
}

// ---------------------------------------------------------------------------
// SparseTable (number-specialised) — queryMin / queryMax / queryGcd
// ---------------------------------------------------------------------------

function _gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Number-specialised sparse table with queryMin, queryMax, and queryGcd.
 * Pre-builds three separate sparse tables (min, max, gcd) at construction.
 */
export class SparseTableNum {
  private readonly stMin: SparseTable<number>;
  private readonly stMax: SparseTable<number>;
  private readonly stGcd: SparseTable<number>;
  private readonly n: number;

  constructor(arr: number[]) {
    this.n = arr.length;
    this.stMin = new SparseTable<number>(arr, Math.min);
    this.stMax = new SparseTable<number>(arr, Math.max);
    this.stGcd = new SparseTable<number>(arr, _gcd);
  }

  /** Minimum of arr[l..r] inclusive. O(1). */
  queryMin(l: number, r: number): number {
    return this.stMin.query(l, r);
  }

  /** Maximum of arr[l..r] inclusive. O(1). */
  queryMax(l: number, r: number): number {
    return this.stMax.query(l, r);
  }

  /** GCD of arr[l..r] inclusive. O(1). */
  queryGcd(l: number, r: number): number {
    return this.stGcd.query(l, r);
  }

  get size(): number {
    return this.n;
  }
}

// ---------------------------------------------------------------------------
// Standalone convenience functions
// ---------------------------------------------------------------------------

/**
 * Build a raw sparse table (2D array) for any combine function.
 * table[j][i] = combine of arr[i .. i + 2^j - 1].
 */
export function buildSparseTable(
  arr: number[],
  combine: (a: number, b: number) => number,
): number[][] {
  const n = arr.length;
  if (n === 0) return [];
  const log: number[] = new Array<number>(n + 1).fill(0);
  for (let i = 2; i <= n; i++) log[i] = log[Math.floor(i / 2)] + 1;
  const levels = log[n] + 1;
  const table: number[][] = Array.from({ length: levels }, () => new Array<number>(n).fill(0));
  for (let i = 0; i < n; i++) table[0][i] = arr[i];
  for (let j = 1; j < levels; j++) {
    for (let i = 0; i + (1 << j) <= n; i++) {
      table[j][i] = combine(table[j - 1][i], table[j - 1][i + (1 << (j - 1))]);
    }
  }
  return table;
}

/** Range minimum of arr[l..r] inclusive (builds sparse table each call). */
export function rangeMin(arr: number[], l: number, r: number): number {
  return new SparseTable<number>(arr, Math.min).query(l, r);
}

/** Range maximum of arr[l..r] inclusive (builds sparse table each call). */
export function rangeMax(arr: number[], l: number, r: number): number {
  return new SparseTable<number>(arr, Math.max).query(l, r);
}

/** Range GCD of arr[l..r] inclusive (builds sparse table each call). */
export function rangeGcd(arr: number[], l: number, r: number): number {
  return new SparseTable<number>(arr, _gcd).query(l, r);
}

/**
 * Returns a reusable query function for range-minimum over arr.
 * The sparse table is built once; subsequent calls are O(1).
 */
export function rmqAll(arr: number[]): (l: number, r: number) => number {
  const st = new SparseTable<number>(arr, Math.min);
  return (l: number, r: number) => st.query(l, r);
}
