// Copyright (c) 2026 Nexara DMCC. All rights reserved.

interface OSTNode { value: number; left: OSTNode | null; right: OSTNode | null; size: number; }
function newNode(value: number): OSTNode { return { value, left: null, right: null, size: 1 }; }
function sz(node: OSTNode | null): number { return node ? node.size : 0; }
function upd(node: OSTNode): void { node.size = 1 + sz(node.left) + sz(node.right); }

export class OrderStatisticsTree {
  private root: OSTNode | null = null;
  get size(): number { return sz(this.root); }
  get isEmpty(): boolean { return this.root === null; }
  insert(value: number): void { this.root = this._ins(this.root, value); }
  private _ins(node: OSTNode | null, value: number): OSTNode {
    if (!node) return newNode(value);
    if (value < node.value) node.left = this._ins(node.left, value);
    else node.right = this._ins(node.right, value);
    upd(node); return node;
  }
  delete(value: number): boolean {
    const [r, d] = this._del(this.root, value); this.root = r; return d;
  }
  private _del(node: OSTNode | null, value: number): [OSTNode | null, boolean] {
    if (!node) return [null, false];
    let d = false;
    if (value < node.value) [node.left, d] = this._del(node.left, value);
    else if (value > node.value) [node.right, d] = this._del(node.right, value);
    else {
      d = true;
      if (!node.left) return [node.right, true];
      if (!node.right) return [node.left, true];
      let succ = node.right; while (succ.left) succ = succ.left;
      node.value = succ.value; [node.right,] = this._del(node.right, succ.value);
    }
    if (node) upd(node); return [node, d];
  }
  rank(value: number): number { return this._rank(this.root, value); }
  private _rank(node: OSTNode | null, value: number): number {
    if (!node) return 0;
    if (value <= node.value) return this._rank(node.left, value);
    return 1 + sz(node.left) + this._rank(node.right, value);
  }
  select(k: number): number | undefined { return this._sel(this.root, k); }
  private _sel(node: OSTNode | null, k: number): number | undefined {
    if (!node) return undefined;
    const ls = sz(node.left);
    if (k < ls) return this._sel(node.left, k);
    if (k === ls) return node.value;
    return this._sel(node.right, k - ls - 1);
  }
  contains(value: number): boolean {
    let node = this.root;
    while (node) { if (value === node.value) return true; node = value < node.value ? node.left : node.right; }
    return false;
  }
  min(): number | undefined {
    if (!this.root) return undefined; let n = this.root; while (n.left) n = n.left; return n.value;
  }
  max(): number | undefined {
    if (!this.root) return undefined; let n = this.root; while (n.right) n = n.right; return n.value;
  }
  toSortedArray(): number[] {
    const r: number[] = []; this._inorder(this.root, r); return r;
  }
  private _inorder(node: OSTNode | null, r: number[]): void {
    if (!node) return; this._inorder(node.left, r); r.push(node.value); this._inorder(node.right, r);
  }
  countRange(lo: number, hi: number): number { return this.rank(hi + 1) - this.rank(lo); }
  kthSmallest(k: number): number | undefined { return this.select(k - 1); }
  kthLargest(k: number): number | undefined { return this.select(this.size - k); }
  clear(): void { this.root = null; }
  predecessor(value: number): number | undefined {
    let pred: number | undefined; let node = this.root;
    while (node) { if (node.value < value) { pred = node.value; node = node.right; } else node = node.left; }
    return pred;
  }
  successor(value: number): number | undefined {
    let succ: number | undefined; let node = this.root;
    while (node) { if (node.value > value) { succ = node.value; node = node.left; } else node = node.right; }
    return succ;
  }
}

export function createOST(): OrderStatisticsTree { return new OrderStatisticsTree(); }
export function fromArray(arr: number[]): OrderStatisticsTree {
  const t = new OrderStatisticsTree(); for (const x of arr) t.insert(x); return t;
}
export function findMedian(arr: number[]): number {
  const t = fromArray(arr); const n = t.size;
  if (n === 0) return NaN;
  if (n % 2 === 1) return t.kthSmallest(Math.ceil(n / 2))!;
  return (t.kthSmallest(n/2)! + t.kthSmallest(n/2+1)!) / 2;
}
export class RunningMedian {
  private ost = new OrderStatisticsTree();
  insert(value: number): void { this.ost.insert(value); }
  median(): number {
    const n = this.ost.size; if (n === 0) return NaN;
    if (n % 2 === 1) return this.ost.kthSmallest(Math.ceil(n/2))!;
    return (this.ost.kthSmallest(n/2)! + this.ost.kthSmallest(n/2+1)!) / 2;
  }
}
