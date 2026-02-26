// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

// ---------------------------------------------------------------------------
// Internal edge representation for adjacency-list flow networks
// ---------------------------------------------------------------------------
interface Edge {
  to: number;
  cap: number;   // residual capacity
  flow: number;  // flow currently on this edge
  rev: number;   // index of reverse edge in graph[to]
}

// ---------------------------------------------------------------------------
// FlowNetwork — Dinic's algorithm O(V²E)
// ---------------------------------------------------------------------------
export class FlowNetwork {
  private n: number;
  private graph: Edge[][];
  // Store original capacities so reset() can restore them
  private origEdges: Array<{ from: number; to: number; cap: number; fwdIdx: number }>;

  constructor(numNodes: number) {
    this.n = numNodes;
    this.graph = Array.from({ length: numNodes }, () => []);
    this.origEdges = [];
  }

  addEdge(from: number, to: number, capacity: number): void {
    const fwdIdx = this.graph[from].length;
    const revIdx = this.graph[to].length;
    this.graph[from].push({ to, cap: capacity, flow: 0, rev: revIdx });
    this.graph[to].push({ to: from, cap: 0, flow: 0, rev: fwdIdx });
    this.origEdges.push({ from, to, cap: capacity, fwdIdx });
  }

  // BFS to build level graph
  private bfs(s: number, t: number, level: number[]): boolean {
    level.fill(-1);
    level[s] = 0;
    const queue: number[] = [s];
    let head = 0;
    while (head < queue.length) {
      const u = queue[head++];
      for (const e of this.graph[u]) {
        if (e.cap > 0 && level[e.to] === -1) {
          level[e.to] = level[u] + 1;
          queue.push(e.to);
        }
      }
    }
    return level[t] !== -1;
  }

  // DFS blocking flow
  private dfs(u: number, t: number, pushed: number, level: number[], iter: number[]): number {
    if (u === t) return pushed;
    for (; iter[u] < this.graph[u].length; iter[u]++) {
      const e = this.graph[u][iter[u]];
      if (e.cap <= 0 || level[e.to] !== level[u] + 1) continue;
      const d = this.dfs(e.to, t, Math.min(pushed, e.cap), level, iter);
      if (d > 0) {
        e.cap -= d;
        e.flow += d;
        this.graph[e.to][e.rev].cap += d;
        this.graph[e.to][e.rev].flow -= d;
        return d;
      }
    }
    return 0;
  }

  maxFlow(source: number, sink: number): number {
    let flow = 0;
    const level = new Array<number>(this.n);
    while (this.bfs(source, sink, level)) {
      const iter = new Array<number>(this.n).fill(0);
      let pushed: number;
      while ((pushed = this.dfs(source, sink, Infinity, level, iter)) > 0) {
        flow += pushed;
      }
    }
    return flow;
  }

  minCut(source: number, sink: number): Array<[number, number]> {
    // Run max flow first to saturate
    this.maxFlow(source, sink);
    // BFS from source on residual graph to find reachable set S
    const reachable = new Array<boolean>(this.n).fill(false);
    reachable[source] = true;
    const queue: number[] = [source];
    let head = 0;
    while (head < queue.length) {
      const u = queue[head++];
      for (const e of this.graph[u]) {
        if (e.cap > 0 && !reachable[e.to]) {
          reachable[e.to] = true;
          queue.push(e.to);
        }
      }
    }
    // Min cut = original edges going from S to T-side that are fully saturated
    const cut: Array<[number, number]> = [];
    for (const { from, to, fwdIdx } of this.origEdges) {
      if (reachable[from] && !reachable[to]) {
        const e = this.graph[from][fwdIdx];
        // Edge is in min cut if originally had capacity and is saturated
        if (e.cap === 0) {
          cut.push([from, to]);
        }
      }
    }
    return cut;
  }

  reset(): void {
    // Rebuild the graph from origEdges with original capacities
    this.graph = Array.from({ length: this.n }, () => []);
    const origEdgesCopy = this.origEdges.slice();
    this.origEdges = [];
    for (const { from, to, cap } of origEdgesCopy) {
      this.addEdge(from, to, cap);
    }
  }
}

// ---------------------------------------------------------------------------
// BipartiteMatching — Hopcroft-Karp
// ---------------------------------------------------------------------------
export class BipartiteMatching {
  private leftSize: number;
  private rightSize: number;
  private adj: number[][];
  private matchL: number[];
  private matchR: number[];

  constructor(leftSize: number, rightSize: number) {
    this.leftSize = leftSize;
    this.rightSize = rightSize;
    this.adj = Array.from({ length: leftSize }, () => []);
    this.matchL = new Array(leftSize).fill(-1);
    this.matchR = new Array(rightSize).fill(-1);
  }

  addEdge(left: number, right: number): void {
    this.adj[left].push(right);
  }

  // BFS phase of Hopcroft-Karp
  private bfs(): number[] {
    const dist = new Array<number>(this.leftSize).fill(Infinity);
    const queue: number[] = [];
    for (let u = 0; u < this.leftSize; u++) {
      if (this.matchL[u] === -1) {
        dist[u] = 0;
        queue.push(u);
      }
    }
    let found = false;
    let head = 0;
    while (head < queue.length) {
      const u = queue[head++];
      for (const v of this.adj[u]) {
        const w = this.matchR[v];
        if (w === -1) {
          found = true;
        } else if (dist[w] === Infinity) {
          dist[w] = dist[u] + 1;
          queue.push(w);
        }
      }
    }
    return found ? dist : [];
  }

  private dfs(u: number, dist: number[]): boolean {
    for (const v of this.adj[u]) {
      const w = this.matchR[v];
      if (w === -1 || (dist[w] === dist[u] + 1 && this.dfs(w, dist))) {
        this.matchL[u] = v;
        this.matchR[v] = u;
        return true;
      }
    }
    dist[u] = Infinity;
    return false;
  }

  maxMatching(): number {
    // Reset state
    this.matchL.fill(-1);
    this.matchR.fill(-1);
    let matching = 0;
    let dist: number[];
    while ((dist = this.bfs()).length > 0) {
      for (let u = 0; u < this.leftSize; u++) {
        if (this.matchL[u] === -1 && this.dfs(u, dist)) {
          matching++;
        }
      }
    }
    return matching;
  }

  getMatching(): Array<[number, number]> {
    const result: Array<[number, number]> = [];
    for (let u = 0; u < this.leftSize; u++) {
      if (this.matchL[u] !== -1) {
        result.push([u, this.matchL[u]]);
      }
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// Standalone functions
// ---------------------------------------------------------------------------

/**
 * Compute max flow from s to t using Dinic's algorithm.
 */
export function maxFlow(
  n: number,
  edges: Array<[number, number, number]>,
  s: number,
  t: number
): number {
  const net = new FlowNetwork(n);
  for (const [u, v, c] of edges) net.addEdge(u, v, c);
  return net.maxFlow(s, t);
}

/**
 * Return the list of edges in a minimum s-t cut.
 * Each returned pair [u, v] is an original edge that belongs to the cut.
 */
export function minCut(
  n: number,
  edges: Array<[number, number, number]>,
  s: number,
  t: number
): Array<[number, number]> {
  const net = new FlowNetwork(n);
  for (const [u, v, c] of edges) net.addEdge(u, v, c);
  return net.minCut(s, t);
}

/**
 * Maximum bipartite matching using Hopcroft-Karp.
 */
export function bipartiteMaxMatching(
  leftSize: number,
  rightSize: number,
  edges: Array<[number, number]>
): number {
  const bm = new BipartiteMatching(leftSize, rightSize);
  for (const [l, r] of edges) bm.addEdge(l, r);
  return bm.maxMatching();
}

/**
 * Validate that a given flow assignment is feasible:
 *   - 0 ≤ flow[i] ≤ capacity[i] for every edge i
 *   - Flow conservation at every non-source, non-sink node
 */
export function isFlowFeasible(
  n: number,
  edges: Array<[number, number, number]>,
  flow: number[],
  s: number,
  t: number
): boolean {
  if (flow.length !== edges.length) return false;
  // Capacity constraint
  for (let i = 0; i < edges.length; i++) {
    if (flow[i] < 0 || flow[i] > edges[i][2]) return false;
  }
  // Conservation at intermediate nodes
  const excess = new Array<number>(n).fill(0);
  for (let i = 0; i < edges.length; i++) {
    const [u, v] = edges[i];
    excess[u] -= flow[i];
    excess[v] += flow[i];
  }
  for (let v = 0; v < n; v++) {
    if (v === s || v === t) continue;
    if (excess[v] !== 0) return false;
  }
  return true;
}
