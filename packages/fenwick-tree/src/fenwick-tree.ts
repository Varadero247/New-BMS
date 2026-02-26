// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/** Fenwick Tree (Binary Indexed Tree) for prefix sum queries in O(log n) */
export class FenwickTree {
  private tree: number[];
  private n: number;

  constructor(n: number) {
    this.n = n;
    this.tree = new Array(n + 1).fill(0);
  }

  /** Add delta to index i (1-indexed) */
  update(i: number, delta: number): void {
    for (; i <= this.n; i += i & (-i)) this.tree[i] += delta;
  }

  /** Prefix sum [1..i] (1-indexed) */
  prefixSum(i: number): number {
    let sum = 0;
    for (; i > 0; i -= i & (-i)) sum += this.tree[i];
    return sum;
  }

  /** Range sum [l..r] (1-indexed, inclusive) */
  rangeSum(l: number, r: number): number {
    return this.prefixSum(r) - this.prefixSum(l - 1);
  }

  /** Point value at index i */
  point(i: number): number {
    return this.rangeSum(i, i);
  }

  get size(): number { return this.n; }

  /** Build from array (0-indexed input, internally 1-indexed) */
  static fromArray(arr: number[]): FenwickTree {
    const ft = new FenwickTree(arr.length);
    for (let i = 0; i < arr.length; i++) ft.update(i + 1, arr[i]);
    return ft;
  }

  /** Find smallest index whose prefix sum >= target */
  find(target: number): number {
    let pos = 0;
    let bitMask = 1 << Math.floor(Math.log2(this.n));
    while (bitMask > 0) {
      if (pos + bitMask <= this.n && this.tree[pos + bitMask] < target) {
        pos += bitMask;
        target -= this.tree[pos];
      }
      bitMask >>= 1;
    }
    return pos + 1;
  }

  toArray(): number[] {
    return Array.from({ length: this.n }, (_, i) => this.point(i + 1));
  }
}

/** 2D Fenwick Tree */
export class FenwickTree2D {
  private tree: number[][];
  private rows: number;
  private cols: number;

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.tree = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));
  }

  update(r: number, c: number, delta: number): void {
    for (let i = r; i <= this.rows; i += i & (-i))
      for (let j = c; j <= this.cols; j += j & (-j))
        this.tree[i][j] += delta;
  }

  prefixSum(r: number, c: number): number {
    let sum = 0;
    for (let i = r; i > 0; i -= i & (-i))
      for (let j = c; j > 0; j -= j & (-j))
        sum += this.tree[i][j];
    return sum;
  }

  rangeSum(r1: number, c1: number, r2: number, c2: number): number {
    return this.prefixSum(r2, c2) - this.prefixSum(r1 - 1, c2)
         - this.prefixSum(r2, c1 - 1) + this.prefixSum(r1 - 1, c1 - 1);
  }
}

export function createFenwickTree(n: number): FenwickTree { return new FenwickTree(n); }
export function createFenwickTree2D(rows: number, cols: number): FenwickTree2D { return new FenwickTree2D(rows, cols); }
