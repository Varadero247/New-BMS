// Copyright (c) 2026 Nexara DMCC. All rights reserved.

interface Node {
  left: Node | null;
  right: Node | null;
  sum: number;
  min: number;
  max: number;
  count: number;
}

function makeNode(left: Node | null, right: Node | null, sum: number, min: number, max: number, count: number): Node {
  return { left, right, sum, min, max, count };
}

function build(arr: number[], l: number, r: number): Node {
  if (l === r) {
    return makeNode(null, null, arr[l], arr[l], arr[l], 1);
  }
  const mid = (l + r) >> 1;
  const leftNode = build(arr, l, mid);
  const rightNode = build(arr, mid + 1, r);
  return makeNode(
    leftNode, rightNode,
    leftNode.sum + rightNode.sum,
    Math.min(leftNode.min, rightNode.min),
    Math.max(leftNode.max, rightNode.max),
    leftNode.count + rightNode.count
  );
}

function update(node: Node | null, l: number, r: number, idx: number, val: number): Node {
  if (l === r) {
    return makeNode(null, null, val, val, val, 1);
  }
  const mid = (l + r) >> 1;
  if (idx <= mid) {
    const newLeft = update(node!.left, l, mid, idx, val);
    const right = node!.right!;
    return makeNode(
      newLeft, right,
      newLeft.sum + right.sum,
      Math.min(newLeft.min, right.min),
      Math.max(newLeft.max, right.max),
      newLeft.count + right.count
    );
  } else {
    const left = node!.left!;
    const newRight = update(node!.right, mid + 1, r, idx, val);
    return makeNode(
      left, newRight,
      left.sum + newRight.sum,
      Math.min(left.min, newRight.min),
      Math.max(left.max, newRight.max),
      left.count + newRight.count
    );
  }
}

function querySum(node: Node | null, l: number, r: number, ql: number, qr: number): number {
  if (!node || qr < l || r < ql) return 0;
  if (ql <= l && r <= qr) return node.sum;
  const mid = (l + r) >> 1;
  return querySum(node.left, l, mid, ql, qr) + querySum(node.right, mid + 1, r, ql, qr);
}

function queryMin(node: Node | null, l: number, r: number, ql: number, qr: number): number {
  if (!node || qr < l || r < ql) return Infinity;
  if (ql <= l && r <= qr) return node.min;
  const mid = (l + r) >> 1;
  return Math.min(queryMin(node.left, l, mid, ql, qr), queryMin(node.right, mid + 1, r, ql, qr));
}

function queryMax(node: Node | null, l: number, r: number, ql: number, qr: number): number {
  if (!node || qr < l || r < ql) return -Infinity;
  if (ql <= l && r <= qr) return node.max;
  const mid = (l + r) >> 1;
  return Math.max(queryMax(node.left, l, mid, ql, qr), queryMax(node.right, mid + 1, r, ql, qr));
}

export class PersistentSegmentTree {
  private roots: Node[];
  private n: number;

  constructor(arr: number[]) {
    this.n = arr.length;
    this.roots = [build(arr, 0, this.n - 1)];
  }

  get versions(): number { return this.roots.length; }

  update(version: number, idx: number, val: number): number {
    if (idx < 0 || idx >= this.n) throw new RangeError(`Index ${idx} out of range`);
    const newRoot = update(this.roots[version], 0, this.n - 1, idx, val);
    this.roots.push(newRoot);
    return this.roots.length - 1;
  }

  querySum(version: number, l: number, r: number): number {
    return querySum(this.roots[version], 0, this.n - 1, l, r);
  }

  queryMin(version: number, l: number, r: number): number {
    return queryMin(this.roots[version], 0, this.n - 1, l, r);
  }

  queryMax(version: number, l: number, r: number): number {
    return queryMax(this.roots[version], 0, this.n - 1, l, r);
  }

  queryPoint(version: number, idx: number): number {
    return this.querySum(version, idx, idx);
  }

  get size(): number { return this.n; }
}

export interface PSTRoot { node: Node; size: number; }

export function pstBuild(arr: number[]): PSTRoot {
  const n = arr.length;
  return { node: build(arr, 0, n - 1), size: n };
}

export function pstUpdate(root: PSTRoot, idx: number, val: number): PSTRoot {
  return { node: update(root.node, 0, root.size - 1, idx, val), size: root.size };
}

export function pstQuerySum(root: PSTRoot, l: number, r: number): number {
  return querySum(root.node, 0, root.size - 1, l, r);
}

export function pstQueryMin(root: PSTRoot, l: number, r: number): number {
  return queryMin(root.node, 0, root.size - 1, l, r);
}

export function pstQueryMax(root: PSTRoot, l: number, r: number): number {
  return queryMax(root.node, 0, root.size - 1, l, r);
}

export function pstMerge(a: PSTRoot, b: PSTRoot): PSTRoot {
  function mergeNodes(an: Node | null, bn: Node | null, l: number, r: number): Node {
    if (!an) return bn!;
    if (!bn) return an;
    if (l === r) {
      const v = an.sum + bn.sum;
      return makeNode(null, null, v, v, v, an.count + bn.count);
    }
    const mid = (l + r) >> 1;
    const left = mergeNodes(an.left, bn.left, l, mid);
    const right = mergeNodes(an.right, bn.right, mid + 1, r);
    return makeNode(left, right, left.sum + right.sum, Math.min(left.min, right.min), Math.max(left.max, right.max), left.count + right.count);
  }
  return { node: mergeNodes(a.node, b.node, 0, a.size - 1), size: a.size };
}

export class PersistentFreqTree {
  private roots: Node[];
  private N: number;

  constructor(N: number) {
    this.N = N;
    const emptyArr = new Array(N).fill(0);
    this.roots = [build(emptyArr, 0, N - 1)];
  }

  insert(version: number, v: number): number {
    const cur = this.roots[version];
    const newRoot = update(cur, 0, this.N - 1, v, querySum(cur, 0, this.N - 1, v, v) + 1);
    this.roots.push(newRoot);
    return this.roots.length - 1;
  }

  countRange(vl: number, vr: number, l: number, r: number): number {
    return querySum(this.roots[vr], 0, this.N - 1, l, r) -
           querySum(this.roots[vl - 1] || this.roots[0], 0, this.N - 1, l, r);
  }

  get versions(): number { return this.roots.length; }
}
