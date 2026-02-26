// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export type Merger<T> = (a: T, b: T) => T;

export class SegmentTree<T> {
  private tree: T[];
  private n: number;
  private identity: T;
  private merge: Merger<T>;

  constructor(arr: T[], identity: T, merge: Merger<T>) {
    this.n = arr.length;
    this.identity = identity;
    this.merge = merge;
    this.tree = new Array(4 * this.n).fill(identity);
    if (this.n > 0) this.build(arr, 1, 0, this.n - 1);
  }

  private build(arr: T[], node: number, start: number, end: number): void {
    if (start === end) { this.tree[node] = arr[start]; return; }
    const mid = Math.floor((start + end) / 2);
    this.build(arr, 2 * node, start, mid);
    this.build(arr, 2 * node + 1, mid + 1, end);
    this.tree[node] = this.merge(this.tree[2 * node], this.tree[2 * node + 1]);
  }

  query(l: number, r: number): T {
    if (l > r || l >= this.n || r < 0) return this.identity;
    return this._query(1, 0, this.n - 1, Math.max(0, l), Math.min(this.n - 1, r));
  }

  private _query(node: number, start: number, end: number, l: number, r: number): T {
    if (r < start || end < l) return this.identity;
    if (l <= start && end <= r) return this.tree[node];
    const mid = Math.floor((start + end) / 2);
    return this.merge(
      this._query(2 * node, start, mid, l, r),
      this._query(2 * node + 1, mid + 1, end, l, r)
    );
  }

  update(idx: number, value: T): void {
    if (idx < 0 || idx >= this.n) return;
    this._update(1, 0, this.n - 1, idx, value);
  }

  private _update(node: number, start: number, end: number, idx: number, value: T): void {
    if (start === end) { this.tree[node] = value; return; }
    const mid = Math.floor((start + end) / 2);
    if (idx <= mid) this._update(2 * node, start, mid, idx, value);
    else this._update(2 * node + 1, mid + 1, end, idx, value);
    this.tree[node] = this.merge(this.tree[2 * node], this.tree[2 * node + 1]);
  }

  get length(): number { return this.n; }
}

export function sumSegmentTree(arr: number[]): SegmentTree<number> {
  return new SegmentTree(arr, 0, (a, b) => a + b);
}

export function minSegmentTree(arr: number[]): SegmentTree<number> {
  return new SegmentTree(arr, Infinity, Math.min);
}

export function maxSegmentTree(arr: number[]): SegmentTree<number> {
  return new SegmentTree(arr, -Infinity, Math.max);
}

export function rangeSum(arr: number[], l: number, r: number): number {
  return sumSegmentTree(arr).query(l, r);
}

export function rangeMin(arr: number[], l: number, r: number): number {
  return minSegmentTree(arr).query(l, r);
}

export function rangeMax(arr: number[], l: number, r: number): number {
  return maxSegmentTree(arr).query(l, r);
}
