// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export type DistanceFn<T> = (a: T, b: T) => number;

interface VPNode<T> {
  point: T;
  mu: number; // median distance to children
  left: VPNode<T> | null;  // distance < mu
  right: VPNode<T> | null; // distance >= mu
}

export class VPTree<T> {
  private root: VPNode<T> | null;
  private distFn: DistanceFn<T>;
  private count: number;

  constructor(points: T[], distFn: DistanceFn<T>) {
    this.distFn = distFn;
    this.count = points.length;
    this.root = this.build([...points]);
  }

  private build(points: T[]): VPNode<T> | null {
    if (points.length === 0) return null;
    if (points.length === 1) return { point: points[0], mu: 0, left: null, right: null };
    // Pick vantage point (first element for simplicity)
    const vp = points[0];
    const rest = points.slice(1);
    // Compute distances
    const dists = rest.map(p => this.distFn(vp, p));
    // Find median
    const sorted = [...dists].sort((a, b) => a - b);
    const mu = sorted[Math.floor((sorted.length - 1) / 2)];
    // Partition
    const left: T[] = [], right: T[] = [];
    for (let i = 0; i < rest.length; i++) {
      if (dists[i] < mu) left.push(rest[i]);
      else right.push(rest[i]);
    }
    return {
      point: vp,
      mu,
      left: this.build(left),
      right: this.build(right)
    };
  }

  get size(): number { return this.count; }

  /** Find the nearest neighbor to query point */
  nearest(query: T): T | null {
    if (!this.root) return null;
    const state = { best: this.root.point, bestDist: this.distFn(query, this.root.point) };
    this.searchNearest(this.root, query, state);
    return state.best;
  }

  private searchNearest(node: VPNode<T> | null, query: T, state: { best: T; bestDist: number }): void {
    if (!node) return;
    const d = this.distFn(query, node.point);
    if (d < state.bestDist) { state.best = node.point; state.bestDist = d; }
    if (d < node.mu) {
      if (d - state.bestDist < node.mu) this.searchNearest(node.left, query, state);
      if (d + state.bestDist >= node.mu) this.searchNearest(node.right, query, state);
    } else {
      if (d + state.bestDist >= node.mu) this.searchNearest(node.right, query, state);
      if (d - state.bestDist < node.mu) this.searchNearest(node.left, query, state);
    }
  }

  /** Find k nearest neighbors to query point */
  kNearest(query: T, k: number): T[] {
    if (!this.root || k <= 0) return [];
    // Max-heap by distance capped at size k: heap[0] = farthest among k candidates
    const heap: Array<{ point: T; dist: number }> = [];
    const pushHeap = (item: { point: T; dist: number }) => {
      heap.push(item);
      heap.sort((a, b) => b.dist - a.dist);
      if (heap.length > k) heap.shift(); // remove farthest (index 0, highest dist)
    };
    const tau = () => heap.length < k ? Infinity : heap[0].dist;
    const search = (node: VPNode<T> | null) => {
      if (!node) return;
      const d = this.distFn(query, node.point);
      pushHeap({ point: node.point, dist: d });
      if (d < node.mu) {
        if (d - tau() < node.mu) search(node.left);
        if (d + tau() >= node.mu) search(node.right);
      } else {
        if (d + tau() >= node.mu) search(node.right);
        if (d - tau() < node.mu) search(node.left);
      }
    };
    search(this.root);
    return heap.map(h => h.point);
  }

  /** Find all points within radius r of query */
  withinRadius(query: T, r: number): T[] {
    const result: T[] = [];
    const search = (node: VPNode<T> | null) => {
      if (!node) return;
      const d = this.distFn(query, node.point);
      if (d <= r) result.push(node.point);
      if (d - r < node.mu) search(node.left);
      if (d + r >= node.mu) search(node.right);
    };
    search(this.root);
    return result;
  }

  /** Check if any point is within radius r of query */
  hasPointWithinRadius(query: T, r: number): boolean {
    const search = (node: VPNode<T> | null): boolean => {
      if (!node) return false;
      const d = this.distFn(query, node.point);
      if (d <= r) return true;
      if (d - r < node.mu && search(node.left)) return true;
      if (d + r >= node.mu && search(node.right)) return true;
      return false;
    };
    return search(this.root);
  }
}

// Euclidean distance for 2D points
export type Point2D = { x: number; y: number };
export const euclidean2D: DistanceFn<Point2D> = (a, b) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

// Manhattan distance for 2D points
export const manhattan2D: DistanceFn<Point2D> = (a, b) =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

// Euclidean distance for n-D points (number arrays)
export const euclideanND: DistanceFn<number[]> = (a, b) =>
  Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));

// Hamming distance for strings of equal length
export const hammingDistance: DistanceFn<string> = (a, b) => {
  let d = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) d++;
  return d + Math.abs(a.length - b.length);
};

// Levenshtein distance for strings
export const levenshteinDistance: DistanceFn<string> = (a, b) => {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) {
    dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  }
  return dp[m][n];
};

// BK-Tree (Burkhard-Keller tree) for discrete metric spaces
export class BKTree<T> {
  private root: { point: T; children: Map<number, BKTree<T>> } | null = null;
  private distFn: DistanceFn<T>;
  private count: number = 0;

  constructor(distFn: DistanceFn<T>) {
    this.distFn = distFn;
  }

  insert(point: T): void {
    this.count++;
    if (!this.root) { this.root = { point, children: new Map() }; return; }
    let node = this.root;
    while (true) {
      const d = this.distFn(point, node.point);
      if (d === 0) return; // duplicate
      if (!node.children.has(d)) { node.children.set(d, new BKTree(this.distFn)); }
      const child = node.children.get(d)!;
      if (!child.root) { child.root = { point, children: new Map() }; child.count = 1; return; }
      node = child.root;
    }
  }

  search(query: T, maxDist: number): T[] {
    if (!this.root) return [];
    const result: T[] = [];
    const stack = [this.root];
    while (stack.length) {
      const node = stack.pop()!;
      const d = this.distFn(query, node.point);
      if (d <= maxDist) result.push(node.point);
      for (const [k, child] of node.children) {
        if (Math.abs(k - d) <= maxDist && child.root) stack.push(child.root);
      }
    }
    return result;
  }

  get size(): number { return this.count; }
}
