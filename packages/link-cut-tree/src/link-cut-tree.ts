// Copyright (c) 2026 Nexara DMCC. All rights reserved.

class LCTNode {
  left: LCTNode | null = null;
  right: LCTNode | null = null;
  parent: LCTNode | null = null;
  reversed: boolean = false;
  val: number;
  sum: number;
  id: number;

  constructor(id: number, val = 0) {
    this.id = id;
    this.val = val;
    this.sum = val;
  }

  isRoot(): boolean {
    return this.parent === null ||
      (this.parent.left !== this && this.parent.right !== this);
  }

  pushDown(): void {
    if (this.reversed) {
      const tmp = this.left; this.left = this.right; this.right = tmp;
      if (this.left) this.left.reversed = !this.left.reversed;
      if (this.right) this.right.reversed = !this.right.reversed;
      this.reversed = false;
    }
  }

  pull(): void {
    this.sum = (this.left ? this.left.sum : 0) + this.val + (this.right ? this.right.sum : 0);
  }
}

export class LinkCutTree {
  private nodes: LCTNode[];

  constructor(n: number, values: number[] = []) {
    this.nodes = Array.from({ length: n }, (_, i) => new LCTNode(i, values[i] ?? 0));
  }

  private pushAll(v: LCTNode): void {
    if (!v.isRoot()) this.pushAll(v.parent!);
    v.pushDown();
  }

  private rotate(v: LCTNode): void {
    const p = v.parent!, g = p.parent;
    const isLeft = p.left === v;
    // Attach v's child to p
    const child = isLeft ? v.right : v.left;
    if (isLeft) { p.left = child; v.right = p; }
    else { p.right = child; v.left = p; }
    if (child) child.parent = p;
    p.parent = v; v.parent = g;
    if (g) {
      if (g.left === p) g.left = v;
      else if (g.right === p) g.right = v;
    }
    p.pull(); v.pull();
  }

  private splay(v: LCTNode): void {
    this.pushAll(v);
    while (!v.isRoot()) {
      const p = v.parent!;
      if (!p.isRoot()) {
        const g = p.parent!;
        if ((g.left === p) === (p.left === v)) this.rotate(p);
        else this.rotate(v);
      }
      this.rotate(v);
    }
  }

  /** Make v the root of its represented tree */
  access(v: LCTNode): LCTNode {
    let last: LCTNode | null = null;
    let cur: LCTNode = v;
    while (cur) {
      this.splay(cur);
      cur.right = last;
      cur.pull();
      last = cur;
      cur = cur.parent!;
    }
    this.splay(v);
    return last!;
  }

  makeRoot(v: LCTNode): void {
    this.access(v);
    v.reversed = !v.reversed;
    v.pushDown();
  }

  findRoot(v: LCTNode): LCTNode {
    this.access(v);
    v.pushDown();
    let cur = v;
    while (cur.left) { cur.pushDown(); cur = cur.left; }
    this.splay(cur);
    return cur;
  }

  /** Link nodes u and v (add edge) — they must be in different components */
  link(u: number, v: number): boolean {
    const nu = this.nodes[u], nv = this.nodes[v];
    if (this.findRoot(nu) === this.findRoot(nv)) return false; // already connected
    this.makeRoot(nu);
    nu.parent = nv;
    return true;
  }

  /** Cut the edge between u and v */
  cut(u: number, v: number): boolean {
    const nu = this.nodes[u], nv = this.nodes[v];
    this.makeRoot(nu);
    this.access(nv);
    if (nv.left !== nu || nu.right !== null) return false; // not adjacent
    nv.left = null; nu.parent = null;
    nv.pull();
    return true;
  }

  /** Check if u and v are connected */
  connected(u: number, v: number): boolean {
    const nu = this.nodes[u], nv = this.nodes[v];
    return this.findRoot(nu) === this.findRoot(nv);
  }

  /** Sum of values on path from u to v */
  pathSum(u: number, v: number): number {
    const nu = this.nodes[u], nv = this.nodes[v];
    this.makeRoot(nu);
    this.access(nv);
    return nv.sum;
  }

  /** Update value at node i */
  update(i: number, val: number): void {
    const node = this.nodes[i];
    this.splay(node);
    node.val = val;
    node.pull();
  }

  getValue(i: number): number { return this.nodes[i].val; }
  get size(): number { return this.nodes.length; }
}

// Simple Union-Find for comparison (easier to reason about)
export class DynamicConnectivity {
  private parent: number[];
  private rank: number[];
  private edges: Set<string>;
  private adjList: Map<number, Set<number>>;
  private componentCount: number;

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.edges = new Set();
    this.adjList = new Map();
    for (let i = 0; i < n; i++) this.adjList.set(i, new Set());
    this.componentCount = n;
  }

  private find(x: number): number {
    while (this.parent[x] !== x) { this.parent[x] = this.parent[this.parent[x]]; x = this.parent[x]; }
    return x;
  }

  private union(x: number, y: number): boolean {
    const px = this.find(x), py = this.find(y);
    if (px === py) return false;
    if (this.rank[px] < this.rank[py]) { this.parent[px] = py; }
    else if (this.rank[px] > this.rank[py]) { this.parent[py] = px; }
    else { this.parent[py] = px; this.rank[px]++; }
    this.componentCount--;
    return true;
  }

  addEdge(u: number, v: number): boolean {
    const key = `${Math.min(u,v)}-${Math.max(u,v)}`;
    if (this.edges.has(key)) return false;
    this.edges.add(key);
    this.adjList.get(u)!.add(v);
    this.adjList.get(v)!.add(u);
    return this.union(u, v);
  }

  connected(u: number, v: number): boolean { return this.find(u) === this.find(v); }
  get components(): number { return this.componentCount; }
  get size(): number { return this.parent.length; }
  neighbors(v: number): number[] { return [...(this.adjList.get(v) || [])]; }
}

// Forest operations using the LinkCutTree
export function buildForest(n: number, edges: [number, number][]): LinkCutTree {
  const lct = new LinkCutTree(n);
  for (const [u, v] of edges) lct.link(u, v);
  return lct;
}

export function areConnected(lct: LinkCutTree, u: number, v: number): boolean {
  return lct.connected(u, v);
}
