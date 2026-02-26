// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ─── DisjointSets (numeric, 0-indexed) ───────────────────────────────────────

export class DisjointSets {
  private parent: number[];
  private rank: number[];
  private size: number[];
  public numComponents: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.size = new Array(n).fill(1);
    this.numComponents = n;
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rx = this.find(x);
    const ry = this.find(y);
    if (rx === ry) return false;

    // union by rank
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

    this.numComponents--;
    return true;
  }

  connected(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  componentSize(x: number): number {
    return this.size[this.find(x)];
  }

  components(): number[][] {
    const map = new Map<number, number[]>();
    for (let i = 0; i < this.parent.length; i++) {
      const root = this.find(i);
      if (!map.has(root)) map.set(root, []);
      map.get(root)!.push(i);
    }
    return Array.from(map.values());
  }
}

// ─── DisjointSetsWeighted ────────────────────────────────────────────────────

export class DisjointSetsWeighted {
  private parent: number[];
  // weight[x] = weight from x to parent[x]; if x is root, weight[x] = 0
  private weight: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.weight = new Array(n).fill(0);
  }

  find(x: number): { root: number; weight: number } {
    if (this.parent[x] === x) {
      return { root: x, weight: 0 };
    }
    const { root, weight: parentWeight } = this.find(this.parent[x]);
    // path compression: update parent and accumulated weight
    this.weight[x] += parentWeight;
    this.parent[x] = root;
    return { root, weight: this.weight[x] };
  }

  /**
   * Add edge x → y with given weight (meaning: value[y] - value[x] = weight)
   * Returns true if merged (were in different components).
   */
  union(x: number, y: number, weight: number): boolean {
    const { root: rx, weight: wx } = this.find(x);
    const { root: ry, weight: wy } = this.find(y);
    if (rx === ry) return false;

    // Invariant: weight[i] = value[i] - value[parent[i]]
    // value[y] - value[x] = weight (edge constraint)
    // wx = value[rx] - value[root_rx] = 0 (rx is a root, so value[rx] relative to itself = 0)
    // wy = value[ry] - value[root_ry] = 0
    // After setting parent[rx] = ry:
    //   weight[rx] = value[rx] - value[ry]
    //   value[rx] = value[x] - wx = value[x]   (wx accumulated from x up to rx)
    //   value[ry] = value[y] - wy = value[y]   (wy accumulated from y up to ry)
    //   value[rx] - value[ry] = value[x] - value[y] = -(value[y] - value[x]) = -weight
    //   But x and y may not be rx/ry, so in general:
    //   value[x] = wx + value[rx], value[y] = wy + value[ry]
    //   value[y] - value[x] = weight → wy + value[ry] - wx - value[rx] = weight
    //   value[rx] - value[ry] = wy - wx - weight
    this.parent[rx] = ry;
    this.weight[rx] = wy - wx - weight;
    return true;
  }

  connected(x: number, y: number): boolean {
    return this.find(x).root === this.find(y).root;
  }

  /**
   * Returns value[y] - value[x] if connected, null otherwise.
   * Invariant: weight[i] = value[i] - value[parent[i]], so
   * find(x).weight = value[x] - value[root].
   * diff(x,y) = value[y]-value[x] = (wy + value[root]) - (wx + value[root]) = wy - wx.
   */
  diff(x: number, y: number): number | null {
    if (!this.connected(x, y)) return null;
    const { weight: wx } = this.find(x);
    const { weight: wy } = this.find(y);
    return wy - wx;
  }
}

// ─── GenericDisjointSets<T> ──────────────────────────────────────────────────

export class GenericDisjointSets<T> {
  private indexMap: Map<T, number>;
  private ds: DisjointSets;
  private items: T[];
  private _size: number;

  constructor() {
    this.indexMap = new Map();
    this.items = [];
    this._size = 0;
    // start with capacity 0; grow on demand
    this.ds = new DisjointSets(0);
  }

  private ensureAdded(item: T): number {
    if (!this.indexMap.has(item)) {
      this.add(item);
    }
    return this.indexMap.get(item)!;
  }

  add(item: T): void {
    if (this.indexMap.has(item)) return;
    const idx = this._size;
    this.indexMap.set(item, idx);
    this.items.push(item);
    this._size++;
    // Rebuild the DisjointSets with one more element, preserving structure
    const newDs = new DisjointSets(this._size);
    // re-apply all existing unions by copying parent/rank arrays
    // Since we can't access private internals cleanly, we keep a parallel structure
    // Actually, let's use a simpler internal approach: store parent/rank directly
    // We'll rebuild using a private method trick — instead, swap to direct storage
    this._rebuildWithNewItem();
  }

  // We keep a raw arrays approach for growth
  private parentArr: number[] = [];
  private rankArr: number[] = [];
  private sizeArr: number[] = [];
  public numComponents: number = 0;

  private _rebuildWithNewItem(): void {
    const idx = this._size - 1;
    this.parentArr.push(idx);
    this.rankArr.push(0);
    this.sizeArr.push(1);
    this.numComponents++;
    // Replace the DisjointSets reference (not used directly anymore)
  }

  private _findRaw(x: number): number {
    if (this.parentArr[x] !== x) {
      this.parentArr[x] = this._findRaw(this.parentArr[x]);
    }
    return this.parentArr[x];
  }

  find(item: T): T {
    const idx = this.ensureAdded(item);
    const root = this._findRaw(idx);
    return this.items[root];
  }

  union(a: T, b: T): boolean {
    const ia = this.ensureAdded(a);
    const ib = this.ensureAdded(b);
    const ra = this._findRaw(ia);
    const rb = this._findRaw(ib);
    if (ra === rb) return false;

    if (this.rankArr[ra] < this.rankArr[rb]) {
      this.parentArr[ra] = rb;
      this.sizeArr[rb] += this.sizeArr[ra];
    } else if (this.rankArr[ra] > this.rankArr[rb]) {
      this.parentArr[rb] = ra;
      this.sizeArr[ra] += this.sizeArr[rb];
    } else {
      this.parentArr[rb] = ra;
      this.sizeArr[ra] += this.sizeArr[rb];
      this.rankArr[ra]++;
    }
    this.numComponents--;
    return true;
  }

  connected(a: T, b: T): boolean {
    if (!this.indexMap.has(a) || !this.indexMap.has(b)) return false;
    const ia = this.indexMap.get(a)!;
    const ib = this.indexMap.get(b)!;
    return this._findRaw(ia) === this._findRaw(ib);
  }

  componentOf(item: T): T[] {
    if (!this.indexMap.has(item)) return [];
    const idx = this.indexMap.get(item)!;
    const root = this._findRaw(idx);
    const result: T[] = [];
    for (let i = 0; i < this._size; i++) {
      if (this._findRaw(i) === root) result.push(this.items[i]);
    }
    return result;
  }
}

// ─── Standalone Functions ────────────────────────────────────────────────────

export function connectedComponents(n: number, edges: Array<[number, number]>): number[][] {
  const ds = new DisjointSets(n);
  for (const [u, v] of edges) {
    ds.union(u, v);
  }
  return ds.components();
}

export function numConnectedComponents(n: number, edges: Array<[number, number]>): number {
  const ds = new DisjointSets(n);
  for (const [u, v] of edges) {
    ds.union(u, v);
  }
  return ds.numComponents;
}

export function isConnectedGraph(n: number, edges: Array<[number, number]>): boolean {
  if (n === 0) return true;
  return numConnectedComponents(n, edges) === 1;
}

/**
 * Kruskal's MST — returns edges in the MSF sorted by weight ascending.
 * edges: [u, v, weight]
 */
export function minimumSpanningForest(
  n: number,
  edges: Array<[number, number, number]>
): Array<[number, number, number]> {
  const sorted = [...edges].sort((a, b) => a[2] - b[2]);
  const ds = new DisjointSets(n);
  const result: Array<[number, number, number]> = [];
  for (const [u, v, w] of sorted) {
    if (ds.union(u, v)) {
      result.push([u, v, w]);
    }
  }
  return result;
}
