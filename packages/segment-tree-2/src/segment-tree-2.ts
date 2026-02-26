// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export class SegmentTree {
  private _n: number;
  private _tree: number[];

  constructor(arr: number[]) {
    this._n = arr.length;
    this._tree = new Array(4 * this._n).fill(0);
    if (this._n > 0) this._build(arr, 1, 0, this._n - 1);
  }

  get size(): number { return this._n; }

  private _build(arr: number[], node: number, start: number, end: number): void {
    if (start === end) { this._tree[node] = arr[start]; return; }
    const mid = (start + end) >> 1;
    this._build(arr, 2 * node, start, mid);
    this._build(arr, 2 * node + 1, mid + 1, end);
    this._tree[node] = this._tree[2 * node] + this._tree[2 * node + 1];
  }

  private _update(node: number, start: number, end: number, i: number, val: number): void {
    if (start === end) { this._tree[node] = val; return; }
    const mid = (start + end) >> 1;
    if (i <= mid) this._update(2 * node, start, mid, i, val);
    else this._update(2 * node + 1, mid + 1, end, i, val);
    this._tree[node] = this._tree[2 * node] + this._tree[2 * node + 1];
  }

  private _query(node: number, start: number, end: number, l: number, r: number): number {
    if (r < start || end < l) return 0;
    if (l <= start && end <= r) return this._tree[node];
    const mid = (start + end) >> 1;
    return this._query(2 * node, start, mid, l, r) + this._query(2 * node + 1, mid + 1, end, l, r);
  }

  update(i: number, val: number): void { this._update(1, 0, this._n - 1, i, val); }
  query(l: number, r: number): number { return this._query(1, 0, this._n - 1, l, r); }
}

export class RangeMinTree {
  private _n: number;
  private _tree: number[];

  constructor(arr: number[]) {
    this._n = arr.length;
    this._tree = new Array(4 * this._n).fill(Infinity);
    if (this._n > 0) this._build(arr, 1, 0, this._n - 1);
  }

  get size(): number { return this._n; }

  private _build(arr: number[], node: number, start: number, end: number): void {
    if (start === end) { this._tree[node] = arr[start]; return; }
    const mid = (start + end) >> 1;
    this._build(arr, 2 * node, start, mid);
    this._build(arr, 2 * node + 1, mid + 1, end);
    this._tree[node] = Math.min(this._tree[2 * node], this._tree[2 * node + 1]);
  }

  private _update(node: number, start: number, end: number, i: number, val: number): void {
    if (start === end) { this._tree[node] = val; return; }
    const mid = (start + end) >> 1;
    if (i <= mid) this._update(2 * node, start, mid, i, val);
    else this._update(2 * node + 1, mid + 1, end, i, val);
    this._tree[node] = Math.min(this._tree[2 * node], this._tree[2 * node + 1]);
  }

  private _query(node: number, start: number, end: number, l: number, r: number): number {
    if (r < start || end < l) return Infinity;
    if (l <= start && end <= r) return this._tree[node];
    const mid = (start + end) >> 1;
    return Math.min(this._query(2 * node, start, mid, l, r), this._query(2 * node + 1, mid + 1, end, l, r));
  }

  update(i: number, val: number): void { this._update(1, 0, this._n - 1, i, val); }
  query(l: number, r: number): number { return this._query(1, 0, this._n - 1, l, r); }
}

export class RangeMaxTree {
  private _n: number;
  private _tree: number[];

  constructor(arr: number[]) {
    this._n = arr.length;
    this._tree = new Array(4 * this._n).fill(-Infinity);
    if (this._n > 0) this._build(arr, 1, 0, this._n - 1);
  }

  get size(): number { return this._n; }

  private _build(arr: number[], node: number, start: number, end: number): void {
    if (start === end) { this._tree[node] = arr[start]; return; }
    const mid = (start + end) >> 1;
    this._build(arr, 2 * node, start, mid);
    this._build(arr, 2 * node + 1, mid + 1, end);
    this._tree[node] = Math.max(this._tree[2 * node], this._tree[2 * node + 1]);
  }

  private _update(node: number, start: number, end: number, i: number, val: number): void {
    if (start === end) { this._tree[node] = val; return; }
    const mid = (start + end) >> 1;
    if (i <= mid) this._update(2 * node, start, mid, i, val);
    else this._update(2 * node + 1, mid + 1, end, i, val);
    this._tree[node] = Math.max(this._tree[2 * node], this._tree[2 * node + 1]);
  }

  private _query(node: number, start: number, end: number, l: number, r: number): number {
    if (r < start || end < l) return -Infinity;
    if (l <= start && end <= r) return this._tree[node];
    const mid = (start + end) >> 1;
    return Math.max(this._query(2 * node, start, mid, l, r), this._query(2 * node + 1, mid + 1, end, l, r));
  }

  update(i: number, val: number): void { this._update(1, 0, this._n - 1, i, val); }
  query(l: number, r: number): number { return this._query(1, 0, this._n - 1, l, r); }
}

export class LazySegmentTree {
  private _n: number;
  private _tree: number[];
  private _lazy: number[];

  constructor(arr: number[]) {
    this._n = arr.length;
    this._tree = new Array(4 * this._n).fill(0);
    this._lazy = new Array(4 * this._n).fill(0);
    if (this._n > 0) this._build(arr, 1, 0, this._n - 1);
  }

  get size(): number { return this._n; }

  private _build(arr: number[], node: number, start: number, end: number): void {
    if (start === end) { this._tree[node] = arr[start]; return; }
    const mid = (start + end) >> 1;
    this._build(arr, 2 * node, start, mid);
    this._build(arr, 2 * node + 1, mid + 1, end);
    this._tree[node] = this._tree[2 * node] + this._tree[2 * node + 1];
  }

  private _pushDown(node: number, start: number, end: number): void {
    if (this._lazy[node] !== 0) {
      const mid = (start + end) >> 1;
      this._tree[2 * node] += this._lazy[node] * (mid - start + 1);
      this._lazy[2 * node] += this._lazy[node];
      this._tree[2 * node + 1] += this._lazy[node] * (end - mid);
      this._lazy[2 * node + 1] += this._lazy[node];
      this._lazy[node] = 0;
    }
  }

  private _update(node: number, start: number, end: number, l: number, r: number, val: number): void {
    if (r < start || end < l) return;
    if (l <= start && end <= r) {
      this._tree[node] += val * (end - start + 1);
      this._lazy[node] += val;
      return;
    }
    this._pushDown(node, start, end);
    const mid = (start + end) >> 1;
    this._update(2 * node, start, mid, l, r, val);
    this._update(2 * node + 1, mid + 1, end, l, r, val);
    this._tree[node] = this._tree[2 * node] + this._tree[2 * node + 1];
  }

  private _query(node: number, start: number, end: number, l: number, r: number): number {
    if (r < start || end < l) return 0;
    if (l <= start && end <= r) return this._tree[node];
    this._pushDown(node, start, end);
    const mid = (start + end) >> 1;
    return this._query(2 * node, start, mid, l, r) + this._query(2 * node + 1, mid + 1, end, l, r);
  }

  rangeUpdate(l: number, r: number, val: number): void { this._update(1, 0, this._n - 1, l, r, val); }
  rangeQuery(l: number, r: number): number { return this._query(1, 0, this._n - 1, l, r); }
}
