// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/**
 * Builds an adjacency list from an edge array.
 */
function buildAdj(n: number, edges: Array<[number, number]>): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  return adj;
}

/**
 * Compute subtree sizes rooted at `root` via iterative DFS.
 */
function computeSubtreeSizes(n: number, adj: number[][], root: number): number[] {
  const size = new Array<number>(n).fill(1);
  const parent = new Array<number>(n).fill(-1);
  const order: number[] = [];
  const stack = [root];
  const visited = new Array<boolean>(n).fill(false);
  visited[root] = true;

  while (stack.length > 0) {
    const node = stack.pop()!;
    order.push(node);
    for (const nb of adj[node]) {
      if (!visited[nb]) {
        visited[nb] = true;
        parent[nb] = node;
        stack.push(nb);
      }
    }
  }

  // process in reverse BFS/DFS order so children are done before parents
  for (let i = order.length - 1; i >= 0; i--) {
    const node = order[i];
    if (parent[node] !== -1) {
      size[parent[node]] += size[node];
    }
  }

  return size;
}

/**
 * Find centroid of a subtree containing `start` nodes (removed nodes tracked by `removed`).
 * Returns the centroid node index.
 */
function findCentroidInSubtree(
  adj: number[][],
  removed: boolean[],
  start: number,
  treeSize: number,
): number {
  // First compute sizes within this connected component (ignoring removed nodes)
  const n = adj.length;
  const size = new Array<number>(n).fill(0);
  const parent = new Array<number>(n).fill(-1);
  const order: number[] = [];
  const stack = [start];
  const inStack = new Array<boolean>(n).fill(false);
  inStack[start] = true;

  while (stack.length > 0) {
    const node = stack.pop()!;
    order.push(node);
    for (const nb of adj[node]) {
      if (!removed[nb] && !inStack[nb]) {
        inStack[nb] = true;
        parent[nb] = node;
        stack.push(nb);
      }
    }
  }

  for (const node of order) {
    size[node] = 1;
  }

  for (let i = order.length - 1; i >= 0; i--) {
    const node = order[i];
    if (parent[node] !== -1) {
      size[parent[node]] += size[node];
    }
  }

  // Find centroid: node where all subtrees (including "upward" part) are <= treeSize/2
  for (const node of order) {
    const maxSubtree = Math.max(
      ...adj[node]
        .filter((nb) => !removed[nb] && parent[nb] === node)
        .map((nb) => size[nb]),
      treeSize - size[node], // upward part
    );
    if (maxSubtree <= Math.floor(treeSize / 2)) {
      return node;
    }
  }

  // fallback (should not happen for valid tree)
  return order[0];
}

// ---------------------------------------------------------------------------
// CentroidDecomposition class
// ---------------------------------------------------------------------------

export class CentroidDecomposition {
  private n: number;
  private adj: number[][];
  private removed: boolean[];
  private centroidParent: number[];
  private centroidDepth: number[];
  private decompOrder: number[];
  centroid: number;

  constructor(n: number, edges: Array<[number, number]>) {
    this.n = n;
    this.adj = buildAdj(n, edges);
    this.removed = new Array<boolean>(n).fill(false);
    this.centroidParent = new Array<number>(n).fill(-1);
    this.centroidDepth = new Array<number>(n).fill(0);
    this.decompOrder = [];

    if (n === 0) {
      this.centroid = -1;
      return;
    }
    if (n === 1) {
      this.decompOrder = [0];
      this.centroid = 0;
      return;
    }

    // Compute total tree size from root 0
    const sizes = computeSubtreeSizes(n, this.adj, 0);
    const totalSize = sizes[0];

    this.centroid = this._decompose(0, totalSize, -1, 0);
  }

  private _decompose(start: number, treeSize: number, parent: number, depth: number): number {
    const c = findCentroidInSubtree(this.adj, this.removed, start, treeSize);
    this.centroidParent[c] = parent;
    this.centroidDepth[c] = depth;
    this.decompOrder.push(c);
    this.removed[c] = true;

    // For each subtree after removing c, recurse
    for (const nb of this.adj[c]) {
      if (!this.removed[nb]) {
        // Compute size of this subtree
        const subSize = this._subtreeSizeFrom(nb, c);
        this._decompose(nb, subSize, c, depth + 1);
      }
    }

    // Restore c so future calls can navigate around it
    // Actually we keep it removed — that's the standard approach.
    // (removed stays true for c so it acts as a separator in subsequent calls)

    return c;
  }

  private _subtreeSizeFrom(start: number, blockedParent: number): number {
    // BFS/DFS counting nodes reachable from start without going through removed nodes
    // (blockedParent is the centroid we just removed, already marked removed)
    let count = 0;
    const stack = [start];
    const visited = new Array<boolean>(this.n).fill(false);
    visited[start] = true;
    while (stack.length > 0) {
      const node = stack.pop()!;
      count++;
      for (const nb of this.adj[node]) {
        if (!this.removed[nb] && !visited[nb]) {
          visited[nb] = true;
          stack.push(nb);
        }
      }
    }
    return count;
  }

  /**
   * Find centroid of the subtree rooted at `subroot` with given size.
   * Uses a fresh (all-false) removed array so it works independently of
   * decomposition state.
   */
  getCentroid(subroot: number, treeSize: number): number {
    const freshRemoved = new Array<boolean>(this.n).fill(false);
    return findCentroidInSubtree(this.adj, freshRemoved, subroot, treeSize);
  }

  /**
   * Returns the centroids in the order they were processed during decomposition.
   */
  decompose(): number[] {
    return [...this.decompOrder];
  }

  /**
   * Subtree size of `node` in the original tree (rooted at 0).
   */
  subtreeSize(node: number): number {
    const sizes = computeSubtreeSizes(this.n, this.adj, 0);
    return sizes[node];
  }

  /**
   * Depth of `node` in the centroid decomposition tree.
   */
  depth(node: number): number {
    return this.centroidDepth[node];
  }

  /**
   * Count paths (pairs of nodes u, v with u < v) whose edge-distance is exactly targetLen.
   */
  countPathsOfLength(targetLen: number): number {
    if (this.n <= 1) return 0;
    // Use allPairsDistances
    const distMap = this.allPairsDistances(this.n - 1);
    return distMap.get(targetLen) ?? 0;
  }

  /**
   * Returns a map from distance → number of ordered pairs {u,v} with u < v at that distance.
   * Only counts pairs at distance <= maxDist.
   */
  allPairsDistances(maxDist: number): Map<number, number> {
    const dist = TreeUtils.allPairsShortestPaths(this.n, this._edges());
    const result = new Map<number, number>();
    for (let i = 0; i < this.n; i++) {
      for (let j = i + 1; j < this.n; j++) {
        const d = dist[i][j];
        if (d <= maxDist && d >= 0) {
          result.set(d, (result.get(d) ?? 0) + 1);
        }
      }
    }
    return result;
  }

  /**
   * Minimum edge distance between any two distinct nodes.
   */
  closestPairDistance(): number {
    if (this.n <= 1) return 0;
    // In a tree, adjacent nodes have distance 1; if there are any edges the answer is 1
    const edgeList = this._edges();
    if (edgeList.length > 0) return 1;
    return Infinity;
  }

  private _edges(): Array<[number, number]> {
    const edges: Array<[number, number]> = [];
    for (let u = 0; u < this.n; u++) {
      for (const v of this.adj[u]) {
        if (v > u) edges.push([u, v]);
      }
    }
    return edges;
  }
}

// ---------------------------------------------------------------------------
// TreeUtils class
// ---------------------------------------------------------------------------

export class TreeUtils {
  /**
   * Returns subtree sizes for all nodes when tree is rooted at `root` (default 0).
   */
  static subtreeSizes(n: number, edges: Array<[number, number]>, root = 0): number[] {
    if (n === 0) return [];
    const adj = buildAdj(n, edges);
    return computeSubtreeSizes(n, adj, root);
  }

  /**
   * Finds the centroid of the tree.
   * The centroid is the node whose removal results in no subtree larger than n/2.
   */
  static findCentroid(n: number, edges: Array<[number, number]>): number {
    if (n === 1) return 0;
    const adj = buildAdj(n, edges);
    const removed = new Array<boolean>(n).fill(false);
    return findCentroidInSubtree(adj, removed, 0, n);
  }

  /**
   * Computes all-pairs shortest paths using BFS from each node.
   * Returns dist[i][j] = edge distance between i and j.
   */
  static allPairsShortestPaths(n: number, edges: Array<[number, number]>): number[][] {
    const adj = buildAdj(n, edges);
    const dist: number[][] = [];

    for (let start = 0; start < n; start++) {
      const d = new Array<number>(n).fill(-1);
      d[start] = 0;
      const queue = [start];
      let head = 0;
      while (head < queue.length) {
        const node = queue[head++];
        for (const nb of adj[node]) {
          if (d[nb] === -1) {
            d[nb] = d[node] + 1;
            queue.push(nb);
          }
        }
      }
      dist.push(d);
    }

    return dist;
  }

  /**
   * Returns the eccentricity of each node: max distance to any other node.
   */
  static eccentricity(n: number, edges: Array<[number, number]>): number[] {
    if (n === 1) return [0];
    const dist = TreeUtils.allPairsShortestPaths(n, edges);
    return dist.map((row) => Math.max(...row));
  }

  /**
   * Returns the radius of the tree: minimum eccentricity over all nodes.
   */
  static radius(n: number, edges: Array<[number, number]>): number {
    if (n === 1) return 0;
    const ecc = TreeUtils.eccentricity(n, edges);
    return Math.min(...ecc);
  }

  /**
   * Returns the diameter of the tree: maximum distance between any two nodes.
   */
  static diameter(n: number, edges: Array<[number, number]>): number {
    if (n === 1) return 0;
    const dist = TreeUtils.allPairsShortestPaths(n, edges);
    let maxDist = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (dist[i][j] > maxDist) maxDist = dist[i][j];
      }
    }
    return maxDist;
  }
}

// ---------------------------------------------------------------------------
// Standalone functions
// ---------------------------------------------------------------------------

/**
 * Find the centroid of a tree with n nodes and given edges.
 */
export function treeCentroid(n: number, edges: Array<[number, number]>): number {
  return TreeUtils.findCentroid(n, edges);
}

/**
 * Compute the diameter of a tree (longest path in edge count).
 */
export function treeDiameter(n: number, edges: Array<[number, number]>): number {
  return TreeUtils.diameter(n, edges);
}

/**
 * Compute the radius of a tree (minimum eccentricity).
 */
export function treeRadius(n: number, edges: Array<[number, number]>): number {
  return TreeUtils.radius(n, edges);
}

/**
 * Count the number of unordered pairs {u, v} (u != v) at exactly distance d in the tree.
 */
export function countPairsAtDistance(
  n: number,
  edges: Array<[number, number]>,
  d: number,
): number {
  if (n <= 1) return 0;
  const dist = TreeUtils.allPairsShortestPaths(n, edges);
  let count = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (dist[i][j] === d) count++;
    }
  }
  return count;
}
