// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export type Graph = Map<number, number[]>;
export type WeightedGraph = Map<number, [number, number][]>; // node -> [neighbor, weight][]

export function createGraph(n: number): Graph {
  const g: Graph = new Map();
  for (let i = 0; i < n; i++) g.set(i, []);
  return g;
}

export function addEdge(g: Graph, u: number, v: number, directed = false): void {
  g.get(u)?.push(v);
  if (!directed) g.get(v)?.push(u);
}

export function bfs(g: Graph, start: number): number[] {
  const visited = new Set<number>([start]);
  const queue = [start];
  const order: number[] = [];
  while (queue.length) {
    const node = queue.shift()!;
    order.push(node);
    for (const nbr of (g.get(node) ?? [])) {
      if (!visited.has(nbr)) { visited.add(nbr); queue.push(nbr); }
    }
  }
  return order;
}

export function dfs(g: Graph, start: number): number[] {
  const visited = new Set<number>();
  const order: number[] = [];
  function visit(n: number): void {
    if (visited.has(n)) return;
    visited.add(n); order.push(n);
    for (const nbr of (g.get(n) ?? [])) visit(nbr);
  }
  visit(start);
  return order;
}

export function topologicalSort(g: Graph): number[] | null {
  const inDegree = new Map<number, number>();
  for (const [node] of g) inDegree.set(node, 0);
  for (const [, nbrs] of g) for (const nbr of nbrs) inDegree.set(nbr, (inDegree.get(nbr) ?? 0) + 1);
  const queue: number[] = [];
  for (const [node, deg] of inDegree) if (deg === 0) queue.push(node);
  const result: number[] = [];
  while (queue.length) {
    const node = queue.shift()!;
    result.push(node);
    for (const nbr of (g.get(node) ?? [])) {
      const d = (inDegree.get(nbr) ?? 0) - 1;
      inDegree.set(nbr, d);
      if (d === 0) queue.push(nbr);
    }
  }
  return result.length === g.size ? result : null; // null if cycle
}

export function dijkstra(g: WeightedGraph, start: number): Map<number, number> {
  const dist = new Map<number, number>();
  for (const [n] of g) dist.set(n, Infinity);
  dist.set(start, 0);
  const visited = new Set<number>();
  const getMin = (): number => {
    let min = Infinity, minNode = -1;
    for (const [n, d] of dist) if (!visited.has(n) && d < min) { min = d; minNode = n; }
    return minNode;
  };
  for (let i = 0; i < g.size; i++) {
    const u = getMin();
    if (u === -1 || dist.get(u) === Infinity) break;
    visited.add(u);
    for (const [v, w] of (g.get(u) ?? [])) {
      const nd = (dist.get(u) ?? Infinity) + w;
      if (nd < (dist.get(v) ?? Infinity)) dist.set(v, nd);
    }
  }
  return dist;
}

export function hasCycle(g: Graph): boolean {
  const visited = new Set<number>();
  const recStack = new Set<number>();
  function dfsCheck(n: number): boolean {
    visited.add(n); recStack.add(n);
    for (const nbr of (g.get(n) ?? [])) {
      if (!visited.has(nbr) && dfsCheck(nbr)) return true;
      if (recStack.has(nbr)) return true;
    }
    recStack.delete(n);
    return false;
  }
  for (const [n] of g) if (!visited.has(n) && dfsCheck(n)) return true;
  return false;
}

export function isConnected(g: Graph): boolean {
  if (g.size === 0) return true;
  const start = g.keys().next().value;
  return bfs(g, start).length === g.size;
}

export function shortestPath(g: Graph, start: number, end: number): number[] | null {
  const prev = new Map<number, number | null>([[start, null]]);
  const queue = [start];
  while (queue.length) {
    const node = queue.shift()!;
    if (node === end) {
      const path: number[] = [];
      let cur: number | null = end;
      while (cur !== null) { path.unshift(cur); cur = prev.get(cur) ?? null; }
      return path;
    }
    for (const nbr of (g.get(node) ?? [])) {
      if (!prev.has(nbr)) { prev.set(nbr, node); queue.push(nbr); }
    }
  }
  return null;
}
