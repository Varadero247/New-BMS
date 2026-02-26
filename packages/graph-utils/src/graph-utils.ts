// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  Graph,
  GraphNode,
  GraphEdge,
  ShortestPathResult,
  SCCResult,
  GraphStats,
  TopologicalResult,
  TraversalCallback,
} from './types';

// ---------------------------------------------------------------------------
// 1. createGraph
// ---------------------------------------------------------------------------
export function createGraph<N = unknown, E = unknown>(directed = true): Graph<N, E> {
  return {
    nodes: new Map<string, GraphNode<N>>(),
    edges: [] as GraphEdge<E>[],
    directed,
  };
}

// ---------------------------------------------------------------------------
// 2. addNode
// ---------------------------------------------------------------------------
export function addNode<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  id: string,
  data?: N,
): Graph<N, E> {
  const nodes = new Map(graph.nodes);
  nodes.set(id, { id, data });
  return { ...graph, nodes };
}

// ---------------------------------------------------------------------------
// 3. removeNode
// ---------------------------------------------------------------------------
export function removeNode<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  id: string,
): Graph<N, E> {
  const nodes = new Map(graph.nodes);
  nodes.delete(id);
  const edges = graph.edges.filter((e) => e.from !== id && e.to !== id);
  return { ...graph, nodes, edges };
}

// ---------------------------------------------------------------------------
// 4. addEdge
// ---------------------------------------------------------------------------
export function addEdge<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  from: string,
  to: string,
  weight?: number,
  data?: E,
): Graph<N, E> {
  const edge: GraphEdge<E> = { from, to, weight, data };
  const edges = [...graph.edges, edge];
  if (!graph.directed) {
    edges.push({ from: to, to: from, weight, data });
  }
  return { ...graph, edges };
}

// ---------------------------------------------------------------------------
// 5. removeEdge
// ---------------------------------------------------------------------------
export function removeEdge<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  from: string,
  to: string,
): Graph<N, E> {
  // Remove first occurrence (directed) or both directions (undirected)
  if (graph.directed) {
    const idx = graph.edges.findIndex((e) => e.from === from && e.to === to);
    if (idx === -1) return graph;
    const edges = [...graph.edges.slice(0, idx), ...graph.edges.slice(idx + 1)];
    return { ...graph, edges };
  }
  const edges = graph.edges.filter(
    (e) => !((e.from === from && e.to === to) || (e.from === to && e.to === from)),
  );
  return { ...graph, edges };
}

// ---------------------------------------------------------------------------
// 6. getNeighbors
// ---------------------------------------------------------------------------
export function getNeighbors<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  nodeId: string,
): string[] {
  return graph.edges
    .filter((e) => e.from === nodeId)
    .map((e) => e.to);
}

// ---------------------------------------------------------------------------
// 7. getIncomingEdges
// ---------------------------------------------------------------------------
export function getIncomingEdges<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  nodeId: string,
): GraphEdge<E>[] {
  return graph.edges.filter((e) => e.to === nodeId);
}

// ---------------------------------------------------------------------------
// 8. getOutgoingEdges
// ---------------------------------------------------------------------------
export function getOutgoingEdges<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  nodeId: string,
): GraphEdge<E>[] {
  return graph.edges.filter((e) => e.from === nodeId);
}

// ---------------------------------------------------------------------------
// 9. bfs
// ---------------------------------------------------------------------------
export function bfs<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  startId: string,
  callback?: TraversalCallback<N>,
): string[] {
  if (!graph.nodes.has(startId)) return [];
  const visited = new Set<string>();
  const queue: Array<{ id: string; depth: number; parent?: string }> = [
    { id: startId, depth: 0 },
  ];
  visited.add(startId);
  const result: string[] = [];

  while (queue.length > 0) {
    const item = queue.shift()!;
    const node = graph.nodes.get(item.id)!;
    result.push(item.id);
    if (callback) callback(node, item.depth, item.parent);

    const neighbors = getNeighbors(graph, item.id);
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId) && graph.nodes.has(neighborId)) {
        visited.add(neighborId);
        queue.push({ id: neighborId, depth: item.depth + 1, parent: item.id });
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// 10. dfs
// ---------------------------------------------------------------------------
export function dfs<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  startId: string,
  callback?: TraversalCallback<N>,
): string[] {
  if (!graph.nodes.has(startId)) return [];
  const visited = new Set<string>();
  const result: string[] = [];

  function dfsVisit(id: string, depth: number, parent?: string): void {
    if (visited.has(id) || !graph.nodes.has(id)) return;
    visited.add(id);
    const node = graph.nodes.get(id)!;
    result.push(id);
    if (callback) callback(node, depth, parent);
    const neighbors = getNeighbors(graph, id);
    for (const neighborId of neighbors) {
      dfsVisit(neighborId, depth + 1, id);
    }
  }

  dfsVisit(startId, 0);
  return result;
}

// ---------------------------------------------------------------------------
// 11. dijkstra
// ---------------------------------------------------------------------------
export function dijkstra<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  startId: string,
  endId: string,
): ShortestPathResult {
  if (!graph.nodes.has(startId) || !graph.nodes.has(endId)) {
    return { path: [], distance: Infinity, found: false };
  }

  const dist = new Map<string, number>();
  const prev = new Map<string, string | undefined>();
  const unvisited = new Set<string>(graph.nodes.keys());

  for (const id of graph.nodes.keys()) {
    dist.set(id, Infinity);
    prev.set(id, undefined);
  }
  dist.set(startId, 0);

  while (unvisited.size > 0) {
    // Pick unvisited node with smallest distance
    let u: string | undefined;
    let minDist = Infinity;
    for (const id of unvisited) {
      const d = dist.get(id) ?? Infinity;
      if (d < minDist) {
        minDist = d;
        u = id;
      }
    }

    if (u === undefined || dist.get(u) === Infinity) break;
    if (u === endId) break;

    unvisited.delete(u);

    const outgoing = getOutgoingEdges(graph, u);
    for (const edge of outgoing) {
      if (!unvisited.has(edge.to)) continue;
      const w = edge.weight ?? 1;
      const alt = (dist.get(u) ?? Infinity) + w;
      if (alt < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, alt);
        prev.set(edge.to, u);
      }
    }
  }

  const distance = dist.get(endId) ?? Infinity;
  if (distance === Infinity) {
    return { path: [], distance: Infinity, found: false };
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | undefined = endId;
  while (current !== undefined) {
    path.unshift(current);
    current = prev.get(current);
  }

  return { path, distance, found: true };
}

// ---------------------------------------------------------------------------
// 12. topologicalSort (Kahn's algorithm)
// ---------------------------------------------------------------------------
export function topologicalSort<N = unknown, E = unknown>(
  graph: Graph<N, E>,
): TopologicalResult {
  const inDegree = new Map<string, number>();
  for (const id of graph.nodes.keys()) {
    inDegree.set(id, 0);
  }
  for (const edge of graph.edges) {
    if (graph.nodes.has(edge.to)) {
      inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }
  queue.sort(); // deterministic

  const order: string[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    order.push(u);
    const neighbors = getNeighbors(graph, u);
    for (const v of neighbors) {
      if (!graph.nodes.has(v)) continue;
      const newDeg = (inDegree.get(v) ?? 0) - 1;
      inDegree.set(v, newDeg);
      if (newDeg === 0) {
        queue.push(v);
        queue.sort(); // keep sorted for determinism
      }
    }
  }

  const hasCycle = order.length !== graph.nodes.size;
  return { order, hasCycle };
}

// ---------------------------------------------------------------------------
// 13. findCycles
// ---------------------------------------------------------------------------
export function findCycles<N = unknown, E = unknown>(graph: Graph<N, E>): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];

  function dfsFind(id: string): void {
    visited.add(id);
    recStack.add(id);
    path.push(id);

    const neighbors = getNeighbors(graph, id);
    for (const neighbor of neighbors) {
      if (!graph.nodes.has(neighbor)) continue;
      if (!visited.has(neighbor)) {
        dfsFind(neighbor);
      } else if (recStack.has(neighbor)) {
        // Found a cycle — extract it
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart);
          // Normalise by starting at minimum node for deduplication
          const minIdx = cycle.indexOf(cycle.slice().sort()[0]);
          const normalised = [...cycle.slice(minIdx), ...cycle.slice(0, minIdx)];
          const key = normalised.join(',');
          const exists = cycles.some((c) => c.join(',') === key);
          if (!exists) cycles.push(normalised);
        }
      }
    }

    path.pop();
    recStack.delete(id);
  }

  for (const id of graph.nodes.keys()) {
    if (!visited.has(id)) {
      dfsFind(id);
    }
  }

  return cycles;
}

// ---------------------------------------------------------------------------
// 14. hasCycle
// ---------------------------------------------------------------------------
export function hasCycle<N = unknown, E = unknown>(graph: Graph<N, E>): boolean {
  const visited = new Set<string>();

  if (graph.directed) {
    const recStack = new Set<string>();
    function dfsDir(id: string): boolean {
      visited.add(id);
      recStack.add(id);
      for (const neighbor of getNeighbors(graph, id)) {
        if (!graph.nodes.has(neighbor)) continue;
        if (!visited.has(neighbor)) {
          if (dfsDir(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }
      recStack.delete(id);
      return false;
    }
    for (const id of graph.nodes.keys()) {
      if (!visited.has(id)) {
        if (dfsDir(id)) return true;
      }
    }
    return false;
  }

  // Undirected: track parent to avoid treating parent edge as a back edge
  function dfsUndir(id: string, parentId: string | null): boolean {
    visited.add(id);
    for (const neighbor of getNeighbors(graph, id)) {
      if (!graph.nodes.has(neighbor)) continue;
      if (neighbor === parentId) continue; // skip the edge we came from
      if (visited.has(neighbor)) return true; // back edge → cycle
      if (dfsUndir(neighbor, id)) return true;
    }
    return false;
  }
  for (const id of graph.nodes.keys()) {
    if (!visited.has(id)) {
      if (dfsUndir(id, null)) return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// 15. isConnected
// ---------------------------------------------------------------------------
export function isConnected<N = unknown, E = unknown>(graph: Graph<N, E>): boolean {
  if (graph.nodes.size === 0) return true;
  if (graph.nodes.size === 1) return true;

  const startId = graph.nodes.keys().next().value as string;

  if (!graph.directed) {
    // Undirected: check if BFS from any node reaches all nodes
    const visited = bfs(graph, startId);
    return visited.length === graph.nodes.size;
  }

  // Directed: strongly connected — BFS forward + BFS on reversed graph
  const forwardVisited = bfs(graph, startId);
  if (forwardVisited.length !== graph.nodes.size) return false;

  const rev = reverse(graph);
  const reverseVisited = bfs(rev, startId);
  return reverseVisited.length === graph.nodes.size;
}

// ---------------------------------------------------------------------------
// 16. getConnectedComponents
// ---------------------------------------------------------------------------
export function getConnectedComponents<N = unknown, E = unknown>(
  graph: Graph<N, E>,
): Set<string>[] {
  const visited = new Set<string>();
  const components: Set<string>[] = [];

  // For directed graphs, use weak connectivity (treat edges as undirected)
  const undirectedNeighbors = (id: string): string[] => {
    const out = graph.edges.filter((e) => e.from === id).map((e) => e.to);
    const inc = graph.edges.filter((e) => e.to === id).map((e) => e.from);
    return [...new Set([...out, ...inc])];
  };

  for (const id of graph.nodes.keys()) {
    if (visited.has(id)) continue;
    const component = new Set<string>();
    const queue = [id];
    visited.add(id);
    component.add(id);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const neighbor of undirectedNeighbors(curr)) {
        if (!graph.nodes.has(neighbor)) continue;
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          component.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    components.push(component);
  }

  return components;
}

// ---------------------------------------------------------------------------
// 17. stronglyConnectedComponents (Tarjan's algorithm)
// ---------------------------------------------------------------------------
export function stronglyConnectedComponents<N = unknown, E = unknown>(
  graph: Graph<N, E>,
): SCCResult {
  let index = 0;
  const stack: string[] = [];
  const onStack = new Set<string>();
  const indices = new Map<string, number>();
  const lowlink = new Map<string, number>();
  const components: string[][] = [];

  function strongconnect(v: string): void {
    indices.set(v, index);
    lowlink.set(v, index);
    index++;
    stack.push(v);
    onStack.add(v);

    for (const w of getNeighbors(graph, v)) {
      if (!graph.nodes.has(w)) continue;
      if (!indices.has(w)) {
        strongconnect(w);
        lowlink.set(v, Math.min(lowlink.get(v)!, lowlink.get(w)!));
      } else if (onStack.has(w)) {
        lowlink.set(v, Math.min(lowlink.get(v)!, indices.get(w)!));
      }
    }

    if (lowlink.get(v) === indices.get(v)) {
      const component: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        component.push(w);
      } while (w !== v);
      components.push(component);
    }
  }

  for (const id of graph.nodes.keys()) {
    if (!indices.has(id)) {
      strongconnect(id);
    }
  }

  const nodeToComponent = new Map<string, number>();
  components.forEach((comp, idx) => {
    for (const id of comp) {
      nodeToComponent.set(id, idx);
    }
  });

  return { components, nodeToComponent };
}

// ---------------------------------------------------------------------------
// 18. getStats
// ---------------------------------------------------------------------------
export function getStats<N = unknown, E = unknown>(graph: Graph<N, E>): GraphStats {
  const nodeCount = graph.nodes.size;
  const edgeCount = graph.directed
    ? graph.edges.length
    : graph.edges.length / 2; // undirected stores both directions

  const connected = isConnected(graph);
  const hasCycles = hasCycle(graph);

  // Density: E / (V*(V-1)) for directed, E / (V*(V-1)/2) for undirected
  let density = 0;
  if (nodeCount > 1) {
    const maxEdges = graph.directed
      ? nodeCount * (nodeCount - 1)
      : (nodeCount * (nodeCount - 1)) / 2;
    density = edgeCount / maxEdges;
  }

  // Average degree: sum of out-degrees / nodeCount
  let totalDegree = 0;
  for (const id of graph.nodes.keys()) {
    totalDegree += getNeighbors(graph, id).length;
  }
  const averageDegree = nodeCount > 0 ? totalDegree / nodeCount : 0;

  // Diameter: max shortest path distance (only for connected graphs, skip if large)
  let diameter: number | undefined;
  if (connected && nodeCount > 0 && nodeCount <= 100) {
    let maxDist = 0;
    for (const startId of graph.nodes.keys()) {
      for (const endId of graph.nodes.keys()) {
        if (startId !== endId) {
          const result = dijkstra(graph, startId, endId);
          if (result.found && result.distance > maxDist) {
            maxDist = result.distance;
          }
        }
      }
    }
    diameter = maxDist;
  }

  return { nodeCount, edgeCount, isConnected: connected, hasCycles, density, averageDegree, diameter };
}

// ---------------------------------------------------------------------------
// 19. reverse
// ---------------------------------------------------------------------------
export function reverse<N = unknown, E = unknown>(graph: Graph<N, E>): Graph<N, E> {
  const edges = graph.edges.map((e) => ({ ...e, from: e.to, to: e.from }));
  return { ...graph, nodes: new Map(graph.nodes), edges };
}

// ---------------------------------------------------------------------------
// 20. subgraph
// ---------------------------------------------------------------------------
export function subgraph<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  nodeIds: string[],
): Graph<N, E> {
  const idSet = new Set(nodeIds);
  const nodes = new Map<string, GraphNode<N>>();
  for (const id of nodeIds) {
    const node = graph.nodes.get(id);
    if (node) nodes.set(id, node);
  }
  const edges = graph.edges.filter((e) => idSet.has(e.from) && idSet.has(e.to));
  return { ...graph, nodes, edges };
}

// ---------------------------------------------------------------------------
// 21. merge
// ---------------------------------------------------------------------------
export function merge<N = unknown, E = unknown>(
  g1: Graph<N, E>,
  g2: Graph<N, E>,
): Graph<N, E> {
  const nodes = new Map<string, GraphNode<N>>(g1.nodes);
  for (const [id, node] of g2.nodes) {
    if (!nodes.has(id)) nodes.set(id, node);
  }
  // Deduplicate edges by from+to+weight
  const edgeSet = new Set<string>();
  const edges: GraphEdge<E>[] = [];
  for (const e of [...g1.edges, ...g2.edges]) {
    const key = `${e.from}→${e.to}:${e.weight ?? 1}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push(e);
    }
  }
  return { nodes, edges, directed: g1.directed };
}

// ---------------------------------------------------------------------------
// 22. toAdjacencyMatrix
// ---------------------------------------------------------------------------
export function toAdjacencyMatrix<N = unknown, E = unknown>(
  graph: Graph<N, E>,
): number[][] {
  const ids = Array.from(graph.nodes.keys());
  const idxMap = new Map<string, number>();
  ids.forEach((id, i) => idxMap.set(id, i));

  const matrix: number[][] = Array.from({ length: ids.length }, () =>
    new Array(ids.length).fill(0),
  );

  for (const edge of graph.edges) {
    const fi = idxMap.get(edge.from);
    const ti = idxMap.get(edge.to);
    if (fi !== undefined && ti !== undefined) {
      matrix[fi][ti] = edge.weight ?? 1;
    }
  }

  return matrix;
}

// ---------------------------------------------------------------------------
// 23. fromAdjacencyMatrix
// ---------------------------------------------------------------------------
export function fromAdjacencyMatrix(
  matrix: number[][],
  nodeIds: string[],
  directed = true,
): Graph<unknown, unknown> {
  let graph = createGraph(directed);
  for (const id of nodeIds) {
    graph = addNode(graph, id);
  }
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      const w = matrix[i][j];
      if (w !== 0) {
        // For undirected, addEdge adds both directions; skip the reverse entry
        if (!directed && j < i) continue;
        graph = addEdge(graph, nodeIds[i], nodeIds[j], w);
      }
    }
  }
  return graph;
}

// ---------------------------------------------------------------------------
// 24. toAdjacencyList
// ---------------------------------------------------------------------------
export function toAdjacencyList<N = unknown, E = unknown>(
  graph: Graph<N, E>,
): Map<string, string[]> {
  const list = new Map<string, string[]>();
  for (const id of graph.nodes.keys()) {
    list.set(id, []);
  }
  for (const edge of graph.edges) {
    const arr = list.get(edge.from);
    if (arr) arr.push(edge.to);
  }
  return list;
}

// ---------------------------------------------------------------------------
// 25. clone
// ---------------------------------------------------------------------------
export function clone<N = unknown, E = unknown>(graph: Graph<N, E>): Graph<N, E> {
  const nodes = new Map<string, GraphNode<N>>();
  for (const [id, node] of graph.nodes) {
    nodes.set(id, { ...node });
  }
  const edges = graph.edges.map((e) => ({ ...e }));
  return { nodes, edges, directed: graph.directed };
}

// ---------------------------------------------------------------------------
// 26. hasPath
// ---------------------------------------------------------------------------
export function hasPath<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  from: string,
  to: string,
): boolean {
  if (!graph.nodes.has(from) || !graph.nodes.has(to)) return false;
  if (from === to) return true;
  const visited = new Set<string>();
  const queue = [from];
  visited.add(from);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const neighbor of getNeighbors(graph, curr)) {
      if (!graph.nodes.has(neighbor)) continue;
      if (neighbor === to) return true;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// 27. allPaths
// ---------------------------------------------------------------------------
export function allPaths<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  from: string,
  to: string,
  maxDepth = 20,
): string[][] {
  if (!graph.nodes.has(from) || !graph.nodes.has(to)) return [];
  const results: string[][] = [];

  function dfsAll(current: string, path: string[], visited: Set<string>): void {
    if (path.length > maxDepth + 1) return;
    if (current === to && path.length > 1) {
      results.push([...path]);
      return;
    }
    for (const neighbor of getNeighbors(graph, current)) {
      if (!graph.nodes.has(neighbor)) continue;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        path.push(neighbor);
        dfsAll(neighbor, path, visited);
        path.pop();
        visited.delete(neighbor);
      }
    }
  }

  const visited = new Set<string>([from]);
  dfsAll(from, [from], visited);
  return results;
}

// ---------------------------------------------------------------------------
// 28. minimumSpanningTree (Kruskal's)
// ---------------------------------------------------------------------------
export function minimumSpanningTree<N = unknown, E = unknown>(
  graph: Graph<N, E>,
): Graph<N, E> {
  // Union-Find helpers
  const parent = new Map<string, string>();
  const rank = new Map<string, number>();

  const find = (x: string): string => {
    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)!));
    return parent.get(x)!;
  };

  const union = (x: string, y: string): boolean => {
    const rx = find(x);
    const ry = find(y);
    if (rx === ry) return false;
    if ((rank.get(rx) ?? 0) < (rank.get(ry) ?? 0)) {
      parent.set(rx, ry);
    } else if ((rank.get(rx) ?? 0) > (rank.get(ry) ?? 0)) {
      parent.set(ry, rx);
    } else {
      parent.set(ry, rx);
      rank.set(rx, (rank.get(rx) ?? 0) + 1);
    }
    return true;
  };

  for (const id of graph.nodes.keys()) {
    parent.set(id, id);
    rank.set(id, 0);
  }

  // For undirected: de-duplicate edges (each stored twice)
  const uniqueEdges = graph.directed
    ? [...graph.edges]
    : graph.edges.filter((e) => e.from < e.to || !graph.edges.some((x) => x.from === e.to && x.to === e.from));

  const sorted = [...uniqueEdges].sort((a, b) => (a.weight ?? 1) - (b.weight ?? 1));

  let mst = createGraph<N, E>(graph.directed);
  for (const [id, node] of graph.nodes) {
    mst = addNode(mst, id, node.data);
  }

  for (const edge of sorted) {
    if (union(edge.from, edge.to)) {
      mst = addEdge(mst, edge.from, edge.to, edge.weight, edge.data);
    }
  }

  return mst;
}

// ---------------------------------------------------------------------------
// 29. degree
// ---------------------------------------------------------------------------
export function degree<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  nodeId: string,
): { in: number; out: number; total: number } {
  const outDeg = graph.edges.filter((e) => e.from === nodeId).length;
  const inDeg = graph.edges.filter((e) => e.to === nodeId).length;
  return { in: inDeg, out: outDeg, total: inDeg + outDeg };
}

// ---------------------------------------------------------------------------
// 30. nodesBetween
// ---------------------------------------------------------------------------
export function nodesBetween<N = unknown, E = unknown>(
  graph: Graph<N, E>,
  from: string,
  to: string,
): string[] {
  const result = dijkstra(graph, from, to);
  if (!result.found || result.path.length <= 2) return [];
  return result.path.slice(1, -1);
}
