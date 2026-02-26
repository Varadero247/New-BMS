// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export interface Interval {
  low: number;
  high: number;
  data?: unknown;
}

interface ITNode {
  interval: Interval;
  max: number;
  left: ITNode | null;
  right: ITNode | null;
}

function mkITNode(iv: Interval): ITNode {
  return { interval: iv, max: iv.high, left: null, right: null };
}

function updateMax(n: ITNode): void {
  n.max = n.interval.high;
  if (n.left && n.left.max > n.max) n.max = n.left.max;
  if (n.right && n.right.max > n.max) n.max = n.right.max;
}

function overlap(a: Interval, b: Interval): boolean {
  return a.low <= b.high && b.low <= a.high;
}

export class IntervalTree {
  private _root: ITNode | null = null;
  private _size = 0;

  insert(low: number, high: number, data?: unknown): void {
    const iv: Interval = { low, high, data };
    this._root = this._ins(this._root, iv);
    this._size++;
  }

  private _ins(n: ITNode | null, iv: Interval): ITNode {
    if (n === null) return mkITNode(iv);
    if (iv.low < n.interval.low) n.left = this._ins(n.left, iv);
    else n.right = this._ins(n.right, iv);
    updateMax(n);
    return n;
  }

  delete(low: number, high: number): boolean {
    const before = this._size;
    this._root = this._del(this._root, low, high);
    return this._size < before;
  }

  private _del(n: ITNode | null, low: number, high: number): ITNode | null {
    if (n === null) return null;
    if (n.interval.low === low && n.interval.high === high) {
      this._size--;
      if (n.left === null) return n.right;
      if (n.right === null) return n.left;
      let min = n.right;
      while (min.left) min = min.left;
      n.interval = min.interval;
      n.right = this._del(n.right, min.interval.low, min.interval.high);
    } else if (low < n.interval.low) {
      n.left = this._del(n.left, low, high);
    } else {
      n.right = this._del(n.right, low, high);
    }
    updateMax(n);
    return n;
  }

  findOverlapping(low: number, high: number): Interval[] {
    const q: Interval = { low, high };
    const out: Interval[] = [];
    this._findAll(this._root, q, out);
    return out;
  }

  findAllOverlapping(low: number, high: number): Interval[] {
    return this.findOverlapping(low, high);
  }

  private _findAll(n: ITNode | null, q: Interval, out: Interval[]): void {
    if (n === null || n.max < q.low) return;
    this._findAll(n.left, q, out);
    if (overlap(n.interval, q)) out.push(n.interval);
    if (n.interval.low <= q.high) this._findAll(n.right, q, out);
  }

  contains(low: number, high: number): boolean {
    return this._contains(this._root, low, high);
  }

  private _contains(n: ITNode | null, low: number, high: number): boolean {
    if (n === null) return false;
    if (n.interval.low === low && n.interval.high === high) return true;
    if (low < n.interval.low) return this._contains(n.left, low, high);
    return this._contains(n.right, low, high);
  }

  get size(): number { return this._size; }
  clear(): void { this._root = null; this._size = 0; }

  toArray(): Interval[] {
    const out: Interval[] = [];
    const stack: ITNode[] = [];
    let n = this._root;
    while (n || stack.length) {
      while (n) { stack.push(n); n = n.left; }
      n = stack.pop()!;
      out.push(n.interval);
      n = n.right;
    }
    return out;
  }
}

export class AugmentedIntervalTree extends IntervalTree {}

export class IntervalSet {
  private _intervals: [number, number][] = [];

  add(low: number, high: number): void {
    this._intervals.push([low, high]);
  }

  remove(low: number, high: number): boolean {
    const i = this._intervals.findIndex(([l, h]) => l === low && h === high);
    if (i === -1) return false;
    this._intervals.splice(i, 1);
    return true;
  }

  overlaps(low: number, high: number): boolean {
    return this._intervals.some(([l, h]) => l <= high && low <= h);
  }

  count(): number { return this._intervals.length; }

  merge(): IntervalSet {
    const sorted = [...this._intervals].sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [];
    for (const [l, h] of sorted) {
      if (!merged.length || l > merged[merged.length - 1][1]) {
        merged.push([l, h]);
      } else {
        merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], h);
      }
    }
    const s = new IntervalSet();
    s._intervals = merged;
    return s;
  }

  toArray(): [number, number][] { return [...this._intervals]; }
}
