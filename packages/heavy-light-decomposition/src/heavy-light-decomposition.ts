// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ---------------------------------------------------------------------------
// Segment Tree (internal) — supports range sum, range min, range max
// ---------------------------------------------------------------------------

class SegTree {
  private n: number;
  private sum: number[];
  private mn: number[];
  private mx: number[];

  constructor(n: number, data: number[]) {
    this.n = n;
    this.sum = new Array(4 * n).fill(0);
    this.mn  = new Array(4 * n).fill(Infinity);
    this.mx  = new Array(4 * n).fill(-Infinity);
    if (data.length > 0) this._build(data, 1, 0, n - 1);
  }

  private _build(data: number[], node: number, l: number, r: number): void {
    if (l === r) {
      this.sum[node] = data[l] ?? 0;
      this.mn[node]  = data[l] ?? 0;
      this.mx[node]  = data[l] ?? 0;
      return;
    }
    const mid = (l + r) >> 1;
    this._build(data, 2 * node, l, mid);
    this._build(data, 2 * node + 1, mid + 1, r);
    this._pushUp(node);
  }

  private _pushUp(node: number): void {
    this.sum[node] = this.sum[2 * node] + this.sum[2 * node + 1];
    this.mn[node]  = Math.min(this.mn[2 * node], this.mn[2 * node + 1]);
    this.mx[node]  = Math.max(this.mx[2 * node], this.mx[2 * node + 1]);
  }

  update(pos: number, val: number, node: number = 1, l: number = 0, r: number = this.n - 1): void {
    if (l === r) {
      this.sum[node] = val;
      this.mn[node]  = val;
      this.mx[node]  = val;
      return;
    }
    const mid = (l + r) >> 1;
    if (pos <= mid) this.update(pos, val, 2 * node, l, mid);
    else            this.update(pos, val, 2 * node + 1, mid + 1, r);
    this._pushUp(node);
  }

  querySum(ql: number, qr: number, node: number = 1, l: number = 0, r: number = this.n - 1): number {
    if (ql > r || qr < l) return 0;
    if (ql <= l && r <= qr) return this.sum[node];
    const mid = (l + r) >> 1;
    return this.querySum(ql, qr, 2 * node, l, mid) +
           this.querySum(ql, qr, 2 * node + 1, mid + 1, r);
  }

  queryMin(ql: number, qr: number, node: number = 1, l: number = 0, r: number = this.n - 1): number {
    if (ql > r || qr < l) return Infinity;
    if (ql <= l && r <= qr) return this.mn[node];
    const mid = (l + r) >> 1;
    return Math.min(
      this.queryMin(ql, qr, 2 * node, l, mid),
      this.queryMin(ql, qr, 2 * node + 1, mid + 1, r)
    );
  }

  queryMax(ql: number, qr: number, node: number = 1, l: number = 0, r: number = this.n - 1): number {
    if (ql > r || qr < l) return -Infinity;
    if (ql <= l && r <= qr) return this.mx[node];
    const mid = (l + r) >> 1;
    return Math.max(
      this.queryMax(ql, qr, 2 * node, l, mid),
      this.queryMax(ql, qr, 2 * node + 1, mid + 1, r)
    );
  }
}

// ---------------------------------------------------------------------------
// HLD class
// ---------------------------------------------------------------------------

export class HLD {
  private n: number;
  private adj: number[][];
  private root: number;

  // node metadata
  private parent: number[];
  private depth_: number[];
  private subtreeSize: number[];
  private heavyChild: number[];   // heavy child of each node (-1 if leaf)
  private chainHead: number[];    // topmost node of the heavy chain containing this node
  private pos: number[];          // DFS in-order position for segment tree
  private posEnd: number[];       // end position for subtree (inclusive)
  private nodeValues: number[];

  private seg: SegTree;
  private timer: number = 0;

  constructor(
    n: number,
    edges: Array<[number, number]>,
    root: number = 0,
    values: number[] = []
  ) {
    this.n = n;
    this.root = root;
    this.adj = Array.from({ length: n }, () => []);
    this.parent      = new Array(n).fill(-1);
    this.depth_      = new Array(n).fill(0);
    this.subtreeSize = new Array(n).fill(1);
    this.heavyChild  = new Array(n).fill(-1);
    this.chainHead   = new Array(n).fill(-1);
    this.pos         = new Array(n).fill(0);
    this.posEnd      = new Array(n).fill(0);
    this.nodeValues  = new Array(n).fill(0);

    for (let i = 0; i < values.length && i < n; i++) this.nodeValues[i] = values[i];

    for (const [u, v] of edges) {
      this.adj[u].push(v);
      this.adj[v].push(u);
    }

    this._dfs1(root, -1, 0);
    this.timer = 0;
    this._dfs2(root, root);

    // build segment tree with values mapped to positions
    const arr = new Array(n).fill(0);
    for (let v = 0; v < n; v++) arr[this.pos[v]] = this.nodeValues[v];
    this.seg = new SegTree(n, arr);
  }

  // First DFS: compute parent, depth, subtreeSize, heavyChild
  private _dfs1(v: number, par: number, d: number): void {
    this.parent[v] = par;
    this.depth_[v] = d;
    this.subtreeSize[v] = 1;
    let maxSize = 0;

    const stack: Array<[number, number, number, number]> = [[v, par, d, 0]];
    // iterative DFS to avoid stack overflow on large trees
    const iterStack: Array<{ v: number; par: number; d: number; childIdx: number }> = [];
    iterStack.push({ v, par, d, childIdx: 0 });

    while (iterStack.length > 0) {
      const frame = iterStack[iterStack.length - 1];
      const { v: cur, par: curPar, d: curD } = frame;

      if (frame.childIdx === 0) {
        this.parent[cur] = curPar;
        this.depth_[cur] = curD;
        this.subtreeSize[cur] = 1;
        this.heavyChild[cur] = -1;
      }

      const children = this.adj[cur];
      let advanced = false;
      while (frame.childIdx < children.length) {
        const child = children[frame.childIdx];
        frame.childIdx++;
        if (child === curPar) continue;
        iterStack.push({ v: child, par: cur, d: curD + 1, childIdx: 0 });
        advanced = true;
        break;
      }

      if (!advanced) {
        iterStack.pop();
        if (iterStack.length > 0) {
          const parentFrame = iterStack[iterStack.length - 1];
          const pv = parentFrame.v;
          this.subtreeSize[pv] += this.subtreeSize[cur];
          if (this.heavyChild[pv] === -1 || this.subtreeSize[cur] > this.subtreeSize[this.heavyChild[pv]]) {
            this.heavyChild[pv] = cur;
          }
        }
      }
    }
  }

  // Second DFS: assign chain heads and positions
  private _dfs2(v: number, head: number): void {
    const stack: Array<[number, number]> = [[v, head]];
    while (stack.length > 0) {
      const [cur, h] = stack.pop()!;
      this.chainHead[cur] = h;
      this.pos[cur] = this.timer++;

      // Push heavy child last so it gets processed first (continues the chain)
      const heavy = this.heavyChild[cur];
      const children = this.adj[cur];

      // Push light children (they start new chains)
      for (const child of children) {
        if (child === this.parent[cur]) continue;
        if (child === heavy) continue;
        stack.push([child, child]);
      }
      // Push heavy child so it continues current chain (processed next)
      if (heavy !== -1) {
        stack.push([heavy, h]);
      }
    }

    // posEnd: for subtree, in DFS order subtree of v spans [pos[v], pos[v] + size[v] - 1]
    for (let i = 0; i < this.n; i++) {
      this.posEnd[i] = this.pos[i] + this.subtreeSize[i] - 1;
    }
  }

  // Walk up two nodes to their LCA, accumulating segment tree queries along the way
  private _pathQuery(u: number, v: number, queryFn: (l: number, r: number) => number, combine: (a: number, b: number) => number, identity: number): number {
    let result = identity;
    let a = u, b = v;
    while (this.chainHead[a] !== this.chainHead[b]) {
      if (this.depth_[this.chainHead[a]] < this.depth_[this.chainHead[b]]) {
        [a, b] = [b, a];
      }
      // a is deeper chain head
      result = combine(result, queryFn(this.pos[this.chainHead[a]], this.pos[a]));
      a = this.parent[this.chainHead[a]];
    }
    // Now same chain
    if (this.depth_[a] > this.depth_[b]) [a, b] = [b, a];
    result = combine(result, queryFn(this.pos[a], this.pos[b]));
    return result;
  }

  pathQuery(u: number, v: number): number {
    return this._pathQuery(
      u, v,
      (l, r) => this.seg.querySum(l, r),
      (a, b) => a + b,
      0
    );
  }

  pathMin(u: number, v: number): number {
    return this._pathQuery(
      u, v,
      (l, r) => this.seg.queryMin(l, r),
      (a, b) => Math.min(a, b),
      Infinity
    );
  }

  pathMax(u: number, v: number): number {
    return this._pathQuery(
      u, v,
      (l, r) => this.seg.queryMax(l, r),
      (a, b) => Math.max(a, b),
      -Infinity
    );
  }

  update(node: number, value: number): void {
    this.nodeValues[node] = value;
    this.seg.update(this.pos[node], value);
  }

  subtreeQuery(node: number): number {
    return this.seg.querySum(this.pos[node], this.posEnd[node]);
  }

  lca(u: number, v: number): number {
    let a = u, b = v;
    while (this.chainHead[a] !== this.chainHead[b]) {
      if (this.depth_[this.chainHead[a]] < this.depth_[this.chainHead[b]]) {
        [a, b] = [b, a];
      }
      a = this.parent[this.chainHead[a]];
    }
    return this.depth_[a] < this.depth_[b] ? a : b;
  }

  depth(node: number): number {
    return this.depth_[node];
  }

  pathLength(u: number, v: number): number {
    const l = this.lca(u, v);
    return this.depth_[u] + this.depth_[v] - 2 * this.depth_[l];
  }
}

// ---------------------------------------------------------------------------
// LCA class — binary lifting
// ---------------------------------------------------------------------------

const LOG = 20;

export class LCA {
  private n: number;
  private adj: number[][];
  private root: number;
  private depth_: number[];
  private up: number[][];  // up[k][v] = 2^k-th ancestor of v

  constructor(n: number, edges: Array<[number, number]>, root: number = 0) {
    this.n = n;
    this.root = root;
    this.adj = Array.from({ length: n }, () => []);
    this.depth_ = new Array(n).fill(0);
    this.up = Array.from({ length: LOG }, () => new Array(n).fill(-1));

    for (const [u, v] of edges) {
      this.adj[u].push(v);
      this.adj[v].push(u);
    }

    this._build();
  }

  private _build(): void {
    // BFS to set depth and up[0]
    // up[0][root] = root (sentinel for LCA algorithm)
    // up[0][v] = parent of v for all other nodes
    const queue: number[] = [this.root];
    const visited = new Array(this.n).fill(false);
    visited[this.root] = true;
    this.up[0][this.root] = this.root; // root points to itself as sentinel

    let head = 0;
    while (head < queue.length) {
      const v = queue[head++];
      for (const w of this.adj[v]) {
        if (!visited[w]) {
          visited[w] = true;
          this.depth_[w] = this.depth_[v] + 1;
          this.up[0][w] = v;
          queue.push(w);
        }
      }
    }

    // Fill binary lifting table
    for (let k = 1; k < LOG; k++) {
      for (let v = 0; v < this.n; v++) {
        const anc = this.up[k - 1][v];
        this.up[k][v] = anc === -1 ? -1 : this.up[k - 1][anc];
      }
    }
  }

  lca(u: number, v: number): number {
    let a = u, b = v;
    if (this.depth_[a] < this.depth_[b]) [a, b] = [b, a];

    // Bring a up to same depth as b
    let diff = this.depth_[a] - this.depth_[b];
    for (let k = 0; k < LOG; k++) {
      if ((diff >> k) & 1) {
        a = this.up[k][a];
      }
    }

    if (a === b) return a;

    // Binary lift together
    for (let k = LOG - 1; k >= 0; k--) {
      if (this.up[k][a] !== this.up[k][b]) {
        a = this.up[k][a];
        b = this.up[k][b];
      }
    }
    return this.up[0][a];
  }

  depth(node: number): number {
    return this.depth_[node];
  }

  distance(u: number, v: number): number {
    const l = this.lca(u, v);
    return this.depth_[u] + this.depth_[v] - 2 * this.depth_[l];
  }

  kthAncestor(node: number, k: number): number {
    // If k exceeds depth, there's no k-th ancestor
    if (k > this.depth_[node]) return -1;
    let v = node;
    for (let i = 0; i < LOG; i++) {
      if ((k >> i) & 1) {
        v = this.up[i][v];
        if (v === -1) return -1;
      }
    }
    return v;
  }

  isAncestor(u: number, v: number): boolean {
    // u is ancestor of v iff lca(u, v) === u
    return this.lca(u, v) === u;
  }
}

// ---------------------------------------------------------------------------
// Standalone functions
// ---------------------------------------------------------------------------

export function buildLCA(n: number, edges: Array<[number, number]>, root: number = 0): LCA {
  return new LCA(n, edges, root);
}

export function treeDiameter(n: number, edges: Array<[number, number]>): number {
  if (n <= 1) return 0;
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }

  // BFS from node 0 to find farthest node
  const bfs = (start: number): [number, number[]] => {
    const dist = new Array(n).fill(-1);
    dist[start] = 0;
    const queue = [start];
    let head = 0;
    let farthest = start;
    while (head < queue.length) {
      const v = queue[head++];
      if (dist[v] > dist[farthest]) farthest = v;
      for (const w of adj[v]) {
        if (dist[w] === -1) {
          dist[w] = dist[v] + 1;
          queue.push(w);
        }
      }
    }
    return [farthest, dist];
  };

  const [u] = bfs(0);
  const [v, dist] = bfs(u);
  return dist[v];
}

export function treeCenter(n: number, edges: Array<[number, number]>): number[] {
  if (n === 1) return [0];
  if (n === 2) return [0, 1];

  const adj: number[][] = Array.from({ length: n }, () => []);
  const degree = new Array(n).fill(0);

  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
    degree[u]++;
    degree[v]++;
  }

  // Iteratively remove leaves
  let leaves: number[] = [];
  for (let i = 0; i < n; i++) {
    if (degree[i] === 1) leaves.push(i);
  }

  let remaining = n;
  while (remaining > 2) {
    remaining -= leaves.length;
    const newLeaves: number[] = [];
    for (const leaf of leaves) {
      for (const nb of adj[leaf]) {
        degree[nb]--;
        if (degree[nb] === 1) newLeaves.push(nb);
      }
      degree[leaf] = 0;
    }
    leaves = newLeaves;
  }

  return leaves.length > 0 ? leaves : [0];
}

export function isTree(n: number, edges: Array<[number, number]>): boolean {
  if (n === 0) return true;
  if (edges.length !== n - 1) return false;

  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    if (u < 0 || u >= n || v < 0 || v >= n) return false;
    adj[u].push(v);
    adj[v].push(u);
  }

  // BFS connectivity check
  const visited = new Array(n).fill(false);
  visited[0] = true;
  const queue = [0];
  let head = 0;
  let count = 1;
  while (head < queue.length) {
    const v = queue[head++];
    for (const w of adj[v]) {
      if (!visited[w]) {
        visited[w] = true;
        count++;
        queue.push(w);
      }
    }
  }
  return count === n;
}
