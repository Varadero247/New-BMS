// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * Numeric Union-Find (Disjoint Set Union) with path compression and union by rank.
 * Elements are integers in the range [0, n-1].
 */
export class UnionFind {
  private parent: number[];
  private rank: number[];
  private size: number[];
  private _components: number;
  private readonly n: number;

  constructor(n: number) {
    if (n < 0) throw new RangeError('n must be non-negative');
    this.n = n;
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.size = new Array(n).fill(1);
    this._components = n;
  }

  /** Find the representative (root) of the set containing x, with path compression. */
  find(x: number): number {
    this.checkBounds(x);
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
    }
    return this.parent[x];
  }

  /**
   * Union the sets containing x and y by rank.
   * Returns true if x and y were in different sets (a merge occurred).
   */
  union(x: number, y: number): boolean {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return false;

    if (this.rank[rx] < this.rank[ry]) {
      this.parent[rx] = ry;
      this.size[ry] += this.size[rx];
    } else if (this.rank[rx] > this.rank[ry]) {
      this.parent[ry] = rx;
      this.size[rx] += this.size[ry];
    } else {
      this.parent[ry] = rx;
      this.size[rx] += this.size[ry];
      this.rank[rx]++;
    }
    this._components--;
    return true;
  }

  /** Returns true if x and y are in the same set. */
  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  /** Number of disjoint sets. */
  get components(): number {
    return this._components;
  }

  /** Size of the set containing x. */
  componentSize(x: number): number {
    return this.size[this.find(x)];
  }

  /** All elements in the same set as x. */
  getComponent(x: number): number[] {
    const root = this.find(x);
    const result: number[] = [];
    for (let i = 0; i < this.n; i++) {
      if (this.find(i) === root) result.push(i);
    }
    return result;
  }

  /** All disjoint sets as arrays. */
  getAllComponents(): number[][] {
    const map = new Map<number, number[]>();
    for (let i = 0; i < this.n; i++) {
      const root = this.find(i);
      if (!map.has(root)) map.set(root, []);
      map.get(root)!.push(i);
    }
    return Array.from(map.values());
  }

  /** Reset to initial state (each element is its own set). */
  reset(): void {
    for (let i = 0; i < this.n; i++) {
      this.parent[i] = i;
      this.rank[i] = 0;
      this.size[i] = 1;
    }
    this._components = this.n;
  }

  private checkBounds(x: number): void {
    if (x < 0 || x >= this.n) {
      throw new RangeError(`Index ${x} out of bounds [0, ${this.n - 1}]`);
    }
  }
}

/**
 * Generic Union-Find supporting any key type (uses Map internally).
 */
export class GenericUnionFind<T> {
  private parent: Map<T, T> = new Map();
  private rank: Map<T, number> = new Map();
  private sizeMap: Map<T, number> = new Map();
  private _size = 0;
  private _components = 0;

  /** Add an element to the structure. If already present, does nothing. */
  add(item: T): void {
    if (this.parent.has(item)) return;
    this.parent.set(item, item);
    this.rank.set(item, 0);
    this.sizeMap.set(item, 1);
    this._size++;
    this._components++;
  }

  /** Find the representative of the set containing item, with path compression. */
  find(item: T): T {
    if (!this.parent.has(item)) throw new Error(`Item not found in UnionFind`);
    if (this.parent.get(item) !== item) {
      this.parent.set(item, this.find(this.parent.get(item)!));
    }
    return this.parent.get(item)!;
  }

  /**
   * Union the sets containing a and b.
   * Automatically adds items if not present.
   * Returns true if a merge occurred.
   */
  union(a: T, b: T): boolean {
    if (!this.parent.has(a)) this.add(a);
    if (!this.parent.has(b)) this.add(b);
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return false;

    const rankA = this.rank.get(ra)!;
    const rankB = this.rank.get(rb)!;
    const sizeA = this.sizeMap.get(ra)!;
    const sizeB = this.sizeMap.get(rb)!;

    if (rankA < rankB) {
      this.parent.set(ra, rb);
      this.sizeMap.set(rb, sizeA + sizeB);
    } else if (rankA > rankB) {
      this.parent.set(rb, ra);
      this.sizeMap.set(ra, sizeA + sizeB);
    } else {
      this.parent.set(rb, ra);
      this.sizeMap.set(ra, sizeA + sizeB);
      this.rank.set(ra, rankA + 1);
    }
    this._components--;
    return true;
  }

  /** Returns true if a and b are in the same set. */
  connected(a: T, b: T): boolean {
    if (!this.parent.has(a) || !this.parent.has(b)) return false;
    return this.find(a) === this.find(b);
  }

  /** Total number of elements. */
  get size(): number {
    return this._size;
  }

  /** Number of disjoint sets. */
  get components(): number {
    return this._components;
  }

  /** Size of the set containing item. */
  componentSize(item: T): number {
    return this.sizeMap.get(this.find(item))!;
  }

  /** All elements in the same set as item. */
  getComponent(item: T): T[] {
    const root = this.find(item);
    const result: T[] = [];
    for (const key of this.parent.keys()) {
      if (this.find(key) === root) result.push(key);
    }
    return result;
  }

  /** All disjoint sets. */
  getAllComponents(): T[][] {
    const map = new Map<T, T[]>();
    for (const key of this.parent.keys()) {
      const root = this.find(key);
      if (!map.has(root)) map.set(root, []);
      map.get(root)!.push(key);
    }
    return Array.from(map.values());
  }

  /** Returns true if item is in the structure. */
  has(item: T): boolean {
    return this.parent.has(item);
  }
}

/**
 * Weighted Union-Find.
 *
 * Invariant: `weightToRoot[x]` stores weight[x] / weight[root(x)].
 * When union(x, y, w) is called it encodes: weight[x] / weight[y] = w.
 */
export class WeightedUnionFind {
  private parent: number[];
  private rank: number[];
  /**
   * weightToRoot[i] = weight[i] / weight[root(i)].
   * For a root r: weightToRoot[r] = 1.
   */
  private weightToRoot: number[];
  private readonly n: number;

  constructor(n: number) {
    if (n < 0) throw new RangeError('n must be non-negative');
    this.n = n;
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.weightToRoot = new Array(n).fill(1);
  }

  /**
   * Find root of x, applying path compression and updating weightToRoot.
   * Returns { root, w } where w = weight[x] / weight[root].
   */
  private findWithWeight(x: number): { root: number; w: number } {
    if (this.parent[x] === x) return { root: x, w: 1 };
    // Recurse to find root and the weight of parent relative to root.
    const { root, w: parentW } = this.findWithWeight(this.parent[x]);
    // weight[x]/weight[root] = (weight[x]/weight[parent]) * (weight[parent]/weight[root])
    //                        = weightToRoot[x] * parentW
    this.weightToRoot[x] = this.weightToRoot[x] * parentW;
    // Path compression: point directly to root.
    this.parent[x] = root;
    return { root, w: this.weightToRoot[x] };
  }

  /** Find root of x with path compression. */
  find(x: number): number {
    return this.findWithWeight(x).root;
  }

  /**
   * Union such that weight[x] / weight[y] = w.
   * If already connected, does nothing.
   */
  union(x: number, y: number, w: number): void {
    const { root: rx, w: wx } = this.findWithWeight(x);
    const { root: ry, w: wy } = this.findWithWeight(y);
    if (rx === ry) return;

    // We know: wx = weight[x]/weight[rx], wy = weight[y]/weight[ry]
    // Constraint: weight[x]/weight[y] = w  =>  wx/weight[rx] / (wy/weight[ry]) = w
    //   =>  weight[rx]/weight[ry] = w * wy / wx
    const rxOverRy = (w * wy) / wx; // weight[rx]/weight[ry]

    if (this.rank[rx] < this.rank[ry]) {
      // rx's root becomes ry.  weightToRoot[rx] = weight[rx]/weight[ry] = rxOverRy
      this.parent[rx] = ry;
      this.weightToRoot[rx] = rxOverRy;
    } else if (this.rank[rx] > this.rank[ry]) {
      // ry's root becomes rx.  weightToRoot[ry] = weight[ry]/weight[rx] = 1/rxOverRy
      this.parent[ry] = rx;
      this.weightToRoot[ry] = 1 / rxOverRy;
    } else {
      this.parent[ry] = rx;
      this.weightToRoot[ry] = 1 / rxOverRy;
      this.rank[rx]++;
    }
  }

  /**
   * Returns weight[x] / weight[root(x)].
   */
  weight(x: number): number {
    return this.findWithWeight(x).w;
  }

  /** Returns true if x and y are in the same set. */
  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  /**
   * Returns weight[x] / weight[y] if x and y are connected, null otherwise.
   */
  ratio(x: number, y: number): number | null {
    const { root: rx, w: wx } = this.findWithWeight(x);
    const { root: ry, w: wy } = this.findWithWeight(y);
    if (rx !== ry) return null;
    // wx = weight[x]/weight[root], wy = weight[y]/weight[root]
    // weight[x]/weight[y] = wx / wy
    return wx / wy;
  }
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Count the number of connected components in an undirected graph of n nodes
 * (0-indexed) with the given edge list.
 */
export function countComponents(n: number, edges: [number, number][]): number {
  const uf = new UnionFind(n);
  for (const [u, v] of edges) uf.union(u, v);
  return uf.components;
}

/**
 * Returns true if there is a path from src to dst in the undirected graph.
 */
export function hasPath(
  n: number,
  edges: [number, number][],
  src: number,
  dst: number,
): boolean {
  if (src === dst) return true;
  const uf = new UnionFind(n);
  for (const [u, v] of edges) uf.union(u, v);
  return uf.connected(src, dst);
}

/**
 * Return all connected components as arrays of node indices.
 */
export function connectedComponents(
  n: number,
  edges: [number, number][],
): number[][] {
  const uf = new UnionFind(n);
  for (const [u, v] of edges) uf.union(u, v);
  return uf.getAllComponents();
}

/**
 * Given a list of edges that form a graph which started as a tree (n nodes,
 * n-1 edges) plus one extra edge, return the edge that creates the cycle.
 * Returns null if no redundant edge is found.
 */
export function findRedundantConnection(
  edges: [number, number][],
): [number, number] | null {
  const maxNode = edges.reduce((m, [u, v]) => Math.max(m, u, v), 0);
  const uf = new UnionFind(maxNode + 1);
  for (const [u, v] of edges) {
    if (!uf.union(u, v)) return [u, v];
  }
  return null;
}

/**
 * Factory helper — creates a new UnionFind of size n.
 */
export function makeUnionFind(n: number): UnionFind {
  return new UnionFind(n);
}
