// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

/**
 * Dijkstra's shortest-path algorithm.
 * graph: node -> [[neighbor, weight], ...]
 * Returns a Map of node -> shortest distance from source (Infinity if unreachable).
 */
export function dijkstra(
  graph: Map<number, [number, number][]>,
  source: number
): Map<number, number> {
  const dist = new Map<number, number>();
  // Initialise all known nodes to Infinity
  for (const node of graph.keys()) {
    dist.set(node, Infinity);
  }
  dist.set(source, 0);

  // Simple min-heap via sorted array (adequate for test scale)
  // [distance, node]
  const pq: [number, number][] = [[0, source]];

  while (pq.length > 0) {
    // Extract minimum
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;

    if (d > (dist.get(u) ?? Infinity)) continue;

    const neighbors = graph.get(u) ?? [];
    for (const [v, w] of neighbors) {
      const alt = d + w;
      const prev = dist.get(v) ?? Infinity;
      if (alt < prev) {
        dist.set(v, alt);
        pq.push([alt, v]);
      }
    }
  }

  return dist;
}

/**
 * Bellman-Ford shortest-path algorithm.
 * edges: [[from, to, weight], ...]
 * n: number of nodes (nodes are 0..n-1)
 * Returns null if a negative-weight cycle is detected, otherwise a Map of node -> distance.
 */
export function bellmanFord(
  edges: [number, number, number][],
  n: number,
  source: number
): Map<number, number> | null {
  const dist = new Map<number, number>();
  for (let i = 0; i < n; i++) dist.set(i, Infinity);
  dist.set(source, 0);

  // Relax edges n-1 times
  for (let iter = 0; iter < n - 1; iter++) {
    for (const [u, v, w] of edges) {
      const du = dist.get(u) ?? Infinity;
      if (du === Infinity) continue;
      const dv = dist.get(v) ?? Infinity;
      if (du + w < dv) {
        dist.set(v, du + w);
      }
    }
  }

  // Check for negative cycles
  for (const [u, v, w] of edges) {
    const du = dist.get(u) ?? Infinity;
    const dv = dist.get(v) ?? Infinity;
    if (du !== Infinity && du + w < dv) {
      return null;
    }
  }

  return dist;
}

/**
 * Floyd-Warshall all-pairs shortest paths.
 * matrix[i][j] = weight of edge i->j, 0 on diagonal, Infinity if no edge.
 * Returns a new matrix of shortest distances.
 */
export function floydWarshall(matrix: number[][]): number[][] {
  const n = matrix.length;
  // Deep copy
  const dist: number[][] = matrix.map((row) => [...row]);

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] !== Infinity && dist[k][j] !== Infinity) {
          const via = dist[i][k] + dist[k][j];
          if (via < dist[i][j]) {
            dist[i][j] = via;
          }
        }
      }
    }
  }

  return dist;
}

/**
 * Topological sort (Kahn's algorithm).
 * graph: node -> [neighbors]
 * Returns sorted order or null if the graph contains a cycle.
 */
export function topologicalSort(
  graph: Map<number, number[]>
): number[] | null {
  const inDegree = new Map<number, number>();
  for (const node of graph.keys()) {
    if (!inDegree.has(node)) inDegree.set(node, 0);
    for (const nb of graph.get(node)!) {
      inDegree.set(nb, (inDegree.get(nb) ?? 0) + 1);
    }
  }

  const queue: number[] = [];
  for (const [node, deg] of inDegree) {
    if (deg === 0) queue.push(node);
  }

  const result: number[] = [];
  while (queue.length > 0) {
    queue.sort((a, b) => a - b); // deterministic
    const u = queue.shift()!;
    result.push(u);
    for (const v of graph.get(u) ?? []) {
      const newDeg = (inDegree.get(v) ?? 0) - 1;
      inDegree.set(v, newDeg);
      if (newDeg === 0) queue.push(v);
    }
  }

  if (result.length !== inDegree.size) return null;
  return result;
}

/**
 * Strongly Connected Components via Kosaraju's algorithm.
 * graph: node -> [neighbors]
 * Returns array of SCCs (each SCC is an array of node IDs).
 */
export function stronglyConnected(
  graph: Map<number, number[]>
): number[][] {
  const nodes = Array.from(graph.keys());

  // Ensure all neighbour nodes are also in the node set
  const allNodes = new Set<number>(nodes);
  for (const neighbors of graph.values()) {
    for (const nb of neighbors) allNodes.add(nb);
  }

  // Step 1: DFS on original graph to get finish order
  const visited = new Set<number>();
  const finishOrder: number[] = [];

  function dfs1(u: number): void {
    visited.add(u);
    for (const v of graph.get(u) ?? []) {
      if (!visited.has(v)) dfs1(v);
    }
    finishOrder.push(u);
  }

  for (const node of allNodes) {
    if (!visited.has(node)) dfs1(node);
  }

  // Step 2: Build transposed graph
  const transposed = new Map<number, number[]>();
  for (const node of allNodes) transposed.set(node, []);
  for (const [u, neighbors] of graph) {
    for (const v of neighbors) {
      transposed.get(v)!.push(u);
    }
  }

  // Step 3: DFS on transposed graph in reverse finish order
  const visited2 = new Set<number>();
  const sccs: number[][] = [];

  function dfs2(u: number, scc: number[]): void {
    visited2.add(u);
    scc.push(u);
    for (const v of transposed.get(u) ?? []) {
      if (!visited2.has(v)) dfs2(v, scc);
    }
  }

  for (let i = finishOrder.length - 1; i >= 0; i--) {
    const node = finishOrder[i];
    if (!visited2.has(node)) {
      const scc: number[] = [];
      dfs2(node, scc);
      sccs.push(scc);
    }
  }

  return sccs;
}
