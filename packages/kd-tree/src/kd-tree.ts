// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ---------------------------------------------------------------------------
// Distance helpers
// ---------------------------------------------------------------------------

export function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function manhattanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.abs(a[i] - b[i]);
  }
  return sum;
}

// ---------------------------------------------------------------------------
// Internal node type
// ---------------------------------------------------------------------------

interface KDNode {
  point: number[];
  left: KDNode | null;
  right: KDNode | null;
  axis: number;
}

// ---------------------------------------------------------------------------
// Build helpers
// ---------------------------------------------------------------------------

function buildNode(points: number[][], depth: number, k: number): KDNode | null {
  if (points.length === 0) return null;

  const axis = depth % k;
  // Sort by this axis
  const sorted = points.slice().sort((a, b) => a[axis] - b[axis]);
  const medianIdx = Math.floor(sorted.length / 2);

  return {
    point: sorted[medianIdx],
    axis,
    left: buildNode(sorted.slice(0, medianIdx), depth + 1, k),
    right: buildNode(sorted.slice(medianIdx + 1), depth + 1, k),
  };
}

// ---------------------------------------------------------------------------
// Nearest-neighbor search (single)
// ---------------------------------------------------------------------------

function nnSearch(
  node: KDNode | null,
  query: number[],
  best: { point: number[]; dist: number } | null
): { point: number[]; dist: number } | null {
  if (node === null) return best;

  const dist = euclideanDistance(query, node.point);
  if (best === null || dist < best.dist) {
    best = { point: node.point, dist };
  }

  const axis = node.axis;
  const diff = query[axis] - node.point[axis];
  const near = diff <= 0 ? node.left : node.right;
  const far = diff <= 0 ? node.right : node.left;

  best = nnSearch(near, query, best);

  // Check whether the hypersphere could cross the splitting plane
  if (best === null || Math.abs(diff) < best.dist) {
    best = nnSearch(far, query, best);
  }

  return best;
}

// ---------------------------------------------------------------------------
// k-nearest search (bounded priority queue via sorted array)
// ---------------------------------------------------------------------------

function knnSearch(
  node: KDNode | null,
  query: number[],
  k: number,
  heap: Array<{ point: number[]; dist: number }>
): void {
  if (node === null) return;

  const dist = euclideanDistance(query, node.point);

  if (heap.length < k) {
    heap.push({ point: node.point, dist });
    // Maintain max-heap property (largest dist at index 0) — simple insertion sort
    heap.sort((a, b) => b.dist - a.dist);
  } else if (dist < heap[0].dist) {
    heap[0] = { point: node.point, dist };
    heap.sort((a, b) => b.dist - a.dist);
  }

  const axis = node.axis;
  const diff = query[axis] - node.point[axis];
  const near = diff <= 0 ? node.left : node.right;
  const far = diff <= 0 ? node.right : node.left;

  knnSearch(near, query, k, heap);

  const worstDist = heap.length < k ? Infinity : heap[0].dist;
  if (Math.abs(diff) < worstDist || heap.length < k) {
    knnSearch(far, query, k, heap);
  }
}

// ---------------------------------------------------------------------------
// Radius search
// ---------------------------------------------------------------------------

function radiusSearch(
  node: KDNode | null,
  query: number[],
  r: number,
  result: number[][]
): void {
  if (node === null) return;

  const dist = euclideanDistance(query, node.point);
  if (dist <= r) {
    result.push(node.point);
  }

  const axis = node.axis;
  const diff = query[axis] - node.point[axis];
  const near = diff <= 0 ? node.left : node.right;
  const far = diff <= 0 ? node.right : node.left;

  radiusSearch(near, query, r, result);

  if (Math.abs(diff) <= r) {
    radiusSearch(far, query, r, result);
  }
}

// ---------------------------------------------------------------------------
// Count nodes
// ---------------------------------------------------------------------------

function countNodes(node: KDNode | null): number {
  if (node === null) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}

// ---------------------------------------------------------------------------
// KDTree class
// ---------------------------------------------------------------------------

export class KDTree {
  private root: KDNode | null;
  private _size: number;
  private _dimensions: number;

  constructor(points: number[][], k?: number) {
    if (points.length === 0) {
      this._dimensions = k ?? 0;
      this._size = 0;
      this.root = null;
      return;
    }
    this._dimensions = k ?? points[0].length;
    this._size = points.length;
    this.root = buildNode(points, 0, this._dimensions);
  }

  get size(): number {
    return this._size;
  }

  get dimensions(): number {
    return this._dimensions;
  }

  nearest(query: number[]): number[] | null {
    if (this.root === null) return null;
    const result = nnSearch(this.root, query, null);
    return result ? result.point : null;
  }

  kNearest(query: number[], k: number): number[][] {
    if (this.root === null) return [];
    const heap: Array<{ point: number[]; dist: number }> = [];
    knnSearch(this.root, query, k, heap);
    // Sort ascending by distance
    heap.sort((a, b) => a.dist - b.dist);
    return heap.map((h) => h.point);
  }

  withinRadius(query: number[], r: number): number[][] {
    if (this.root === null) return [];
    const result: number[][] = [];
    radiusSearch(this.root, query, r, result);
    return result;
  }
}

// ---------------------------------------------------------------------------
// KDTree2D class
// ---------------------------------------------------------------------------

export class KDTree2D {
  private tree: KDTree;

  constructor(points: Array<[number, number]>) {
    this.tree = new KDTree(points as number[][], 2);
  }

  get size(): number {
    return this.tree.size;
  }

  nearest(x: number, y: number): [number, number] | null {
    const result = this.tree.nearest([x, y]);
    return result ? [result[0], result[1]] : null;
  }

  kNearest(x: number, y: number, k: number): Array<[number, number]> {
    return this.tree.kNearest([x, y], k).map((p) => [p[0], p[1]] as [number, number]);
  }

  withinRadius(x: number, y: number, r: number): Array<[number, number]> {
    return this.tree.withinRadius([x, y], r).map((p) => [p[0], p[1]] as [number, number]);
  }
}

// ---------------------------------------------------------------------------
// Standalone functions
// ---------------------------------------------------------------------------

export function buildKDTree(points: number[][]): KDTree {
  return new KDTree(points);
}

export function nearestNeighbor(points: number[][], query: number[]): number[] {
  const tree = new KDTree(points);
  return tree.nearest(query) ?? [];
}

export function kNearestNeighbors(
  points: number[][],
  query: number[],
  k: number
): number[][] {
  const tree = new KDTree(points);
  return tree.kNearest(query, k);
}

export function pointsWithinRadius(
  points: number[][],
  query: number[],
  r: number
): number[][] {
  const tree = new KDTree(points);
  return tree.withinRadius(query, r);
}
