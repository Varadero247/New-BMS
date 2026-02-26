// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export class DisjointSet {
  private parent: number[];
  private rank: number[];
  private _components: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this._components = n;
  }

  find(x: number): number {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }

  union(x: number, y: number): boolean {
    const rx = this.find(x), ry = this.find(y);
    if (rx === ry) return false;
    if (this.rank[rx] < this.rank[ry]) this.parent[rx] = ry;
    else if (this.rank[rx] > this.rank[ry]) this.parent[ry] = rx;
    else { this.parent[ry] = rx; this.rank[rx]++; }
    this._components--;
    return true;
  }

  connected(x: number, y: number): boolean { return this.find(x) === this.find(y); }
  get components(): number { return this._components; }
  get size(): number { return this.parent.length; }

  getComponent(x: number): number[] {
    const root = this.find(x);
    return Array.from({ length: this.parent.length }, (_, i) => i).filter(i => this.find(i) === root);
  }

  allComponents(): Map<number, number[]> {
    const map = new Map<number, number[]>();
    for (let i = 0; i < this.parent.length; i++) {
      const root = this.find(i);
      if (!map.has(root)) map.set(root, []);
      map.get(root)!.push(i);
    }
    return map;
  }
}

export function createDisjointSet(n: number): DisjointSet { return new DisjointSet(n); }

export function connectedComponents(edges: [number, number][], n: number): number {
  const ds = new DisjointSet(n);
  for (const [u, v] of edges) ds.union(u, v);
  return ds.components;
}

export function isCyclic(edges: [number, number][], n: number): boolean {
  const ds = new DisjointSet(n);
  for (const [u, v] of edges) {
    if (!ds.union(u, v)) return true;
  }
  return false;
}
