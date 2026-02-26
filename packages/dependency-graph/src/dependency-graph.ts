// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export class DependencyGraph<T = string> {
  private _nodes: Set<T> = new Set();
  private _deps: Map<T, Set<T>> = new Map();
  private _dependents: Map<T, Set<T>> = new Map();
  addNode(id: T): void {
    if (!this._nodes.has(id)) {
      this._nodes.add(id);
      this._deps.set(id, new Set());
      this._dependents.set(id, new Set());
    }
  }
  removeNode(id: T): void {
    if (!this._nodes.has(id)) return;
    const deps = this._deps.get(id) || new Set();
    for (const dep of deps) {
      const dd = this._dependents.get(dep);
      if (dd) dd.delete(id);
    }
    const dependents = this._dependents.get(id) || new Set();
    for (const dep of dependents) {
      const dd2 = this._deps.get(dep);
      if (dd2) dd2.delete(id);
    }
    this._nodes.delete(id);
    this._deps.delete(id);
    this._dependents.delete(id);
  }
  addDependency(id: T, dep: T): void {
    this.addNode(id);
    this.addNode(dep);
    this._deps.get(id).add(dep);
    this._dependents.get(dep).add(id);
  }
  removeDependency(id: T, dep: T): void {
    const deps = this._deps.get(id);
    if (deps) deps.delete(dep);
    const dependents = this._dependents.get(dep);
    if (dependents) dependents.delete(id);
  }
  getDependencies(id: T): T[] {
    const deps = this._deps.get(id);
    return deps ? Array.from(deps) : [];
  }
  getDependents(id: T): T[] { const d = this._dependents.get(id); return d ? Array.from(d) : []; }
  getTransitiveDependencies(id: T): Set<T> {
    const result = new Set();
    const visited = new Set();
    const stack = [id];
    while (stack.length > 0) {
      const node = stack.pop();
      if (visited.has(node)) continue;
      visited.add(node);
      const deps = this._deps.get(node) || new Set();
      for (const dep of deps) {
        if (!visited.has(dep)) { result.add(dep); stack.push(dep); }
      }
    }
    return result;
  }
  topologicalSort(): T[] {
    const inDeg = new Map();
    for (const node of this._nodes) {
      const deps = this._deps.get(node) || new Set();
      inDeg.set(node, deps.size);
    }
    const queue = [];
    for (const [node, deg] of inDeg) if (deg === 0) queue.push(node);
    const result = [];
    while (queue.length > 0) {
      const node = queue.shift();
      result.push(node);
      const dependents = this._dependents.get(node) || new Set();
      for (const dep of dependents) {
        const nd = (inDeg.get(dep) || 0) - 1;
        inDeg.set(dep, nd);
        if (nd === 0) queue.push(dep);
      }
    }
    if (result.length !== this._nodes.size) throw new Error("Cycle detected: topological sort not possible");
    return result;
  }
  hasCycle(): boolean { try { this.topologicalSort(); return false; } catch { return true; } }
  getCycles(): T[][] {
    const index = new Map();
    const lowlink = new Map();
    const onStack = new Map();
    const stack = [];
    const sccs = [];
    let idx = 0;
    const strongconnect = (v) => {
      index.set(v, idx); lowlink.set(v, idx); idx++;
      stack.push(v); onStack.set(v, true);
      const deps = this._deps.get(v) || new Set();
      for (const w of deps) {
        if (!index.has(w)) { strongconnect(w); lowlink.set(v, Math.min(lowlink.get(v), lowlink.get(w))); }
        else if (onStack.get(w)) { lowlink.set(v, Math.min(lowlink.get(v), index.get(w))); }
      }
      if (lowlink.get(v) === index.get(v)) {
        const scc = []; let w;
        do { w = stack.pop(); onStack.set(w, false); scc.push(w); } while (w !== v);
        const hasSelf = scc.some(n => { const d = this._deps.get(n); return d ? d.has(n) : false; });
        if (scc.length > 1 || hasSelf) sccs.push(scc);
      }
    };
    for (const node of this._nodes) if (!index.has(node)) strongconnect(node);
    return sccs;
  }
  hasNode(id: T): boolean { return this._nodes.has(id); }
  get size(): number { return this._nodes.size; }
  nodes(): T[] { return Array.from(this._nodes); }
  clone(): DependencyGraph<T> {
    const g = new DependencyGraph();
    for (const node of this._nodes) g.addNode(node);
    for (const [node, deps] of this._deps) for (const dep of deps) g.addDependency(node, dep);
    return g;
  }
  merge(other: DependencyGraph<T>): DependencyGraph<T> {
    const g = this.clone();
    for (const node of other.nodes()) g.addNode(node);
    for (const node of other.nodes()) for (const dep of other.getDependencies(node)) g.addDependency(node, dep);
    return g;
  }
}

export function topoSort(nodes, getDeps) {
  const nodeSet = new Set(nodes);
  const inDeg = new Map();
  const dependents = new Map();
  for (const n of nodes) { inDeg.set(n, 0); dependents.set(n, []); }
  for (const n of nodes) for (const dep of getDeps(n)) {
    if (!nodeSet.has(dep)) continue;
    dependents.get(dep).push(n);
    inDeg.set(n, (inDeg.get(n) || 0) + 1);
  }
  const queue = [];
  for (const [n, d] of inDeg) if (d === 0) queue.push(n);
  const result = [];
  while (queue.length > 0) {
    const n = queue.shift(); result.push(n);
    for (const dep of (dependents.get(n) || [])) {
      const nd = (inDeg.get(dep) || 0) - 1; inDeg.set(dep, nd);
      if (nd === 0) queue.push(dep);
    }
  }
  if (result.length !== nodes.length) throw new Error("Cycle detected");
  return result;
}

export function buildGraph(edges) {
  const g = new DependencyGraph();
  for (const [from, to] of edges) g.addDependency(from, to);
  return g;
}
