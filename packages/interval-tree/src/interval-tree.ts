// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export interface Interval<T = void> {
  lo: number;
  hi: number;
  data?: T;
}

interface INode<T> {
  lo: number;
  hi: number;
  data?: T;
  maxHi: number;
  left: INode<T> | null;
  right: INode<T> | null;
}

function makeNode<T>(lo: number, hi: number, data?: T): INode<T> {
  return { lo, hi, data, maxHi: hi, left: null, right: null };
}

function refreshMax<T>(n: INode<T>): void {
  n.maxHi = n.hi;
  if (n.left !== null && n.left.maxHi > n.maxHi) n.maxHi = n.left.maxHi;
  if (n.right !== null && n.right.maxHi > n.maxHi) n.maxHi = n.right.maxHi;
}

function nodeInsert<T>(root: INode<T> | null, lo: number, hi: number, data?: T): INode<T> {
  if (root === null) return makeNode(lo, hi, data);
  if (lo < root.lo || (lo === root.lo && hi < root.hi)) {
    root.left = nodeInsert(root.left, lo, hi, data);
  } else {
    root.right = nodeInsert(root.right, lo, hi, data);
  }
  refreshMax(root);
  return root;
}

function nodeRemove<T>(
  root: INode<T> | null,
  lo: number,
  hi: number,
  ref: { found: boolean }
): INode<T> | null {
  if (root === null || ref.found) return root;
  if (lo < root.lo || (lo === root.lo && hi < root.hi)) {
    root.left = nodeRemove(root.left, lo, hi, ref);
  } else if (lo === root.lo && hi === root.hi) {
    ref.found = true;
    if (root.left === null) return root.right;
    if (root.right === null) return root.left;
    let succ: INode<T> = root.right;
    while (succ.left !== null) succ = succ.left;
    root.lo = succ.lo;
    root.hi = succ.hi;
    root.data = succ.data;
    root.right = nodeRemove(root.right, succ.lo, succ.hi, { found: false });
  } else {
    root.right = nodeRemove(root.right, lo, hi, ref);
  }
  refreshMax(root);
  return root;
}

function nodeOverlapping<T>(root: INode<T> | null, lo: number, hi: number, out: Interval<T>[]): void {
  if (root === null || root.maxHi < lo) return;
  nodeOverlapping(root.left, lo, hi, out);
  if (root.lo <= hi && root.hi >= lo) {
    out.push({ lo: root.lo, hi: root.hi, data: root.data } as Interval<T>);
  }
  if (root.lo <= hi) nodeOverlapping(root.right, lo, hi, out);
}

function nodeContaining<T>(root: INode<T> | null, point: number, out: Interval<T>[]): void {
  if (root === null || root.maxHi < point) return;
  nodeContaining(root.left, point, out);
  if (root.lo <= point && root.hi >= point) {
    out.push({ lo: root.lo, hi: root.hi, data: root.data } as Interval<T>);
  }
  if (root.lo <= point) nodeContaining(root.right, point, out);
}

function nodeToArray<T>(root: INode<T> | null, out: Interval<T>[]): void {
  if (root === null) return;
  nodeToArray(root.left, out);
  out.push({ lo: root.lo, hi: root.hi, data: root.data } as Interval<T>);
  nodeToArray(root.right, out);
}

export class IntervalTree<T = void> {
  private _root: INode<T> | null = null;
  private _size = 0;

  get size(): number { return this._size; }
  get isEmpty(): boolean { return this._size === 0; }

  insert(interval: Interval<T>): void {
    this._root = nodeInsert(this._root, interval.lo, interval.hi, interval.data);
    this._size++;
  }

  remove(lo: number, hi: number): boolean {
    const ref = { found: false };
    this._root = nodeRemove(this._root, lo, hi, ref);
    if (ref.found) this._size--;
    return ref.found;
  }

  findOverlapping(lo: number, hi: number): Interval<T>[] {
    const out: Interval<T>[] = [];
    nodeOverlapping(this._root, lo, hi, out);
    return out;
  }

  findContaining(point: number): Interval<T>[] {
    const out: Interval<T>[] = [];
    nodeContaining(this._root, point, out);
    return out;
  }

  findExact(lo: number, hi: number): Interval<T> | undefined {
    let node = this._root;
    while (node !== null) {
      if (lo === node.lo && hi === node.hi) {
        return { lo: node.lo, hi: node.hi, data: node.data } as Interval<T>;
      }
      if (lo < node.lo || (lo === node.lo && hi < node.hi)) {
        node = node.left;
      } else {
        node = node.right;
      }
    }
    return undefined;
  }

  toArray(): Interval<T>[] {
    const out: Interval<T>[] = [];
    nodeToArray(this._root, out);
    return out;
  }

  /** Find any one interval overlapping [lo, hi] */
  findAny(lo: number, hi: number): Interval<T> | null {
    const results = this.findOverlapping(lo, hi);
    return results.length > 0 ? results[0] : null;
  }

  /** Find all intervals overlapping [lo, hi] */
  findAll(lo: number, hi: number): Interval<T>[] {
    return this.findOverlapping(lo, hi);
  }

  /** Check if any interval overlaps [lo, hi] */
  overlaps(lo: number, hi: number): boolean {
    return this.findAny(lo, hi) !== null;
  }

  clear(): void {
    this._root = null;
    this._size = 0;
  }
}

// ─── Factory helpers ──────────────────────────────────────────────────────────

export function createIntervalTree(): IntervalTree {
  return new IntervalTree();
}

export function fromIntervals(intervals: Array<{ lo: number; hi: number; data?: unknown }>): IntervalTree {
  const t = new IntervalTree();
  for (const iv of intervals) t.insert(iv as Interval);
  return t;
}

// ─── Pure utility functions ───────────────────────────────────────────────────

export function pointInAny(intervals: Array<{ lo: number; hi: number }>, p: number): boolean {
  return intervals.some(iv => iv.lo <= p && p <= iv.hi);
}

export function findIntervalsContaining(
  intervals: Array<{ lo: number; hi: number; data?: unknown }>,
  p: number
): Array<{ lo: number; hi: number; data?: unknown }> {
  return intervals.filter(iv => iv.lo <= p && p <= iv.hi);
}

export function mergeIntervals(
  intervals: Array<{ lo: number; hi: number; data?: unknown }>
): Array<{ lo: number; hi: number }> {
  if (!intervals.length) return [];
  const sorted = [...intervals].sort((a, b) => a.lo - b.lo || a.hi - b.hi);
  const result: Array<{ lo: number; hi: number }> = [{ lo: sorted[0].lo, hi: sorted[0].hi }];
  for (let i = 1; i < sorted.length; i++) {
    const last = result[result.length - 1];
    if (sorted[i].lo <= last.hi) {
      last.hi = Math.max(last.hi, sorted[i].hi);
    } else {
      result.push({ lo: sorted[i].lo, hi: sorted[i].hi });
    }
  }
  return result;
}

export function totalCoverage(intervals: Array<{ lo: number; hi: number }>): number {
  return mergeIntervals(intervals).reduce((sum, iv) => sum + iv.hi - iv.lo, 0);
}

export function intervalsOverlap(
  a: { lo: number; hi: number },
  b: { lo: number; hi: number }
): boolean {
  return a.lo <= b.hi && b.lo <= a.hi;
}

export function countOverlappingPairs(intervals: Array<{ lo: number; hi: number }>): number {
  let count = 0;
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      if (intervalsOverlap(intervals[i], intervals[j])) count++;
    }
  }
  return count;
}

export function maxOverlap(intervals: Array<{ lo: number; hi: number }>): number {
  if (!intervals.length) return 0;
  const events: [number, number][] = [];
  for (const iv of intervals) {
    events.push([iv.lo, 1]);
    events.push([iv.hi + 1, -1]);
  }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let max = 0;
  let cur = 0;
  for (const [, delta] of events) {
    cur += delta;
    if (cur > max) max = cur;
  }
  return max;
}

export class SegmentTree {
  private _n: number;
  private _vals: number[];
  private _sum: number[];
  private _min: number[];
  private _max: number[];

  constructor(values: number[]) {
    this._n = values.length;
    this._vals = values.slice();
    const sz = 4 * Math.max(this._n, 1);
    this._sum = new Array(sz).fill(0);
    this._min = new Array(sz).fill(Infinity);
    this._max = new Array(sz).fill(-Infinity);
    if (this._n > 0) this._build(1, 0, this._n - 1);
  }

  private _build(node: number, start: number, end: number): void {
    if (start === end) {
      this._sum[node] = this._vals[start];
      this._min[node] = this._vals[start];
      this._max[node] = this._vals[start];
      return;
    }
    const mid = (start + end) >> 1;
    this._build(2 * node, start, mid);
    this._build(2 * node + 1, mid + 1, end);
    this._pushUp(node);
  }

  private _pushUp(node: number): void {
    this._sum[node] = this._sum[2 * node] + this._sum[2 * node + 1];
    this._min[node] = Math.min(this._min[2 * node], this._min[2 * node + 1]);
    this._max[node] = Math.max(this._max[2 * node], this._max[2 * node + 1]);
  }

  private _update(node: number, start: number, end: number, idx: number, val: number): void {
    if (start === end) {
      this._vals[idx] = val;
      this._sum[node] = val;
      this._min[node] = val;
      this._max[node] = val;
      return;
    }
    const mid = (start + end) >> 1;
    if (idx <= mid) this._update(2 * node, start, mid, idx, val);
    else this._update(2 * node + 1, mid + 1, end, idx, val);
    this._pushUp(node);
  }

  private _querySum(node: number, start: number, end: number, lo: number, hi: number): number {
    if (lo > end || hi < start) return 0;
    if (lo <= start && end <= hi) return this._sum[node];
    const mid = (start + end) >> 1;
    return this._querySum(2 * node, start, mid, lo, hi) + this._querySum(2 * node + 1, mid + 1, end, lo, hi);
  }

  private _queryMin(node: number, start: number, end: number, lo: number, hi: number): number {
    if (lo > end || hi < start) return Infinity;
    if (lo <= start && end <= hi) return this._min[node];
    const mid = (start + end) >> 1;
    return Math.min(this._queryMin(2 * node, start, mid, lo, hi), this._queryMin(2 * node + 1, mid + 1, end, lo, hi));
  }

  private _queryMax(node: number, start: number, end: number, lo: number, hi: number): number {
    if (lo > end || hi < start) return -Infinity;
    if (lo <= start && end <= hi) return this._max[node];
    const mid = (start + end) >> 1;
    return Math.max(this._queryMax(2 * node, start, mid, lo, hi), this._queryMax(2 * node + 1, mid + 1, end, lo, hi));
  }

  get length(): number { return this._n; }

  query(lo: number, hi: number): number {
    if (this._n === 0) return 0;
    return this._querySum(1, 0, this._n - 1, lo, hi);
  }

  update(index: number, value: number): void {
    if (this._n === 0) return;
    this._update(1, 0, this._n - 1, index, value);
  }

  queryMin(lo: number, hi: number): number {
    if (this._n === 0) return Infinity;
    return this._queryMin(1, 0, this._n - 1, lo, hi);
  }

  queryMax(lo: number, hi: number): number {
    if (this._n === 0) return -Infinity;
    return this._queryMax(1, 0, this._n - 1, lo, hi);
  }

  toArray(): number[] { return this._vals.slice(); }
}

export class FenwickTree {
  private _n: number;
  private _tree: number[];

  constructor(n: number) {
    this._n = n;
    this._tree = new Array(n + 1).fill(0);
  }

  get length(): number { return this._n; }

  update(index: number, delta: number): void {
    let i = index + 1;
    while (i <= this._n) { this._tree[i] += delta; i += i & -i; }
  }

  prefixSum(index: number): number {
    let sum = 0; let i = index + 1;
    while (i > 0) { sum += this._tree[i]; i -= i & -i; }
    return sum;
  }

  rangeSum(lo: number, hi: number): number {
    if (lo === 0) return this.prefixSum(hi);
    return this.prefixSum(hi) - this.prefixSum(lo - 1);
  }
}

export class SweepLine {
  static coveredLength(intervals: Array<[number, number]>): number {
    if (intervals.length === 0) return 0;
    const sorted = [...intervals].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    let total = 0;
    let curStart = sorted[0][0];
    let curEnd = sorted[0][1];
    for (let i = 1; i < sorted.length; i++) {
      const [s, e] = sorted[i];
      if (s <= curEnd) { if (e > curEnd) curEnd = e; }
      else { total += curEnd - curStart; curStart = s; curEnd = e; }
    }
    total += curEnd - curStart;
    return total;
  }

  static countOverlaps(intervals: Array<[number, number]>): Array<{ point: number; count: number }> {
    if (intervals.length === 0) return [];
    const events: Array<[number, number]> = [];
    for (const [s, e] of intervals) { events.push([s, 1]); events.push([e, -1]); }
    events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const result: Array<{ point: number; count: number }> = [];
    let count = 0;
    for (const [point, delta] of events) { count += delta; result.push({ point, count }); }
    return result;
  }

  static merge(intervals: Array<[number, number]>): Array<[number, number]> {
    if (intervals.length === 0) return [];
    const sorted = [...intervals].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const merged: Array<[number, number]> = [[sorted[0][0], sorted[0][1]]];
    for (let i = 1; i < sorted.length; i++) {
      const last = merged[merged.length - 1];
      const [s, e] = sorted[i];
      if (s <= last[1]) { if (e > last[1]) last[1] = e; }
      else { merged.push([s, e]); }
    }
    return merged;
  }
}
