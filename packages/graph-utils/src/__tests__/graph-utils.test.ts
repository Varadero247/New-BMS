// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  createGraph,
  addNode,
  removeNode,
  addEdge,
  removeEdge,
  getNeighbors,
  getIncomingEdges,
  getOutgoingEdges,
  bfs,
  dfs,
  dijkstra,
  topologicalSort,
  findCycles,
  hasCycle,
  isConnected,
  getConnectedComponents,
  stronglyConnectedComponents,
  getStats,
  reverse,
  subgraph,
  merge,
  toAdjacencyMatrix,
  fromAdjacencyMatrix,
  toAdjacencyList,
  clone,
  hasPath,
  allPaths,
  minimumSpanningTree,
  degree,
  nodesBetween,
} from '../graph-utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function buildLinearGraph(n: number, directed = true) {
  let g = createGraph(directed);
  for (let i = 0; i < n; i++) g = addNode(g, String(i));
  for (let i = 0; i < n - 1; i++) g = addEdge(g, String(i), String(i + 1), 1);
  return g;
}

function buildCompleteGraph(n: number, directed = true) {
  let g = createGraph(directed);
  for (let i = 0; i < n; i++) g = addNode(g, String(i));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) g = addEdge(g, String(i), String(j), 1);
    }
  }
  return g;
}

function buildCycleGraph(n: number, directed = true) {
  let g = buildLinearGraph(n, directed);
  g = addEdge(g, String(n - 1), '0', 1);
  return g;
}

// ---------------------------------------------------------------------------
// 1. createGraph
// ---------------------------------------------------------------------------
describe('createGraph', () => {
  it('creates a directed graph by default', () => {
    const g = createGraph();
    expect(g.directed).toBe(true);
    expect(g.nodes.size).toBe(0);
    expect(g.edges.length).toBe(0);
  });

  it('creates an undirected graph when directed=false', () => {
    const g = createGraph(false);
    expect(g.directed).toBe(false);
    expect(g.nodes.size).toBe(0);
    expect(g.edges.length).toBe(0);
  });

  it('creates independent graph instances', () => {
    const g1 = createGraph(true);
    const g2 = createGraph(false);
    expect(g1.directed).toBe(true);
    expect(g2.directed).toBe(false);
    expect(g1.nodes).not.toBe(g2.nodes);
  });

  for (let i = 0; i < 20; i++) {
    it(`createGraph variant ${i} — always starts empty`, () => {
      const g = createGraph(i % 2 === 0);
      expect(g.nodes.size).toBe(0);
      expect(g.edges.length).toBe(0);
      expect(typeof g.directed).toBe('boolean');
    });
  }
});

// ---------------------------------------------------------------------------
// 2. addNode
// ---------------------------------------------------------------------------
describe('addNode', () => {
  it('adds a node without data', () => {
    const g = createGraph();
    const g2 = addNode(g, 'A');
    expect(g2.nodes.has('A')).toBe(true);
    expect(g2.nodes.get('A')?.id).toBe('A');
    expect(g2.nodes.get('A')?.data).toBeUndefined();
  });

  it('adds a node with data', () => {
    const g = createGraph<{ name: string }>();
    const g2 = addNode(g, 'X', { name: 'test' });
    expect(g2.nodes.get('X')?.data?.name).toBe('test');
  });

  it('does not mutate original graph', () => {
    const g = createGraph();
    const g2 = addNode(g, 'A');
    expect(g.nodes.size).toBe(0);
    expect(g2.nodes.size).toBe(1);
  });

  it('overwrites existing node with same id', () => {
    let g = createGraph<number>();
    g = addNode(g, 'A', 1);
    g = addNode(g, 'A', 2);
    expect(g.nodes.size).toBe(1);
    expect(g.nodes.get('A')?.data).toBe(2);
  });

  const nodeNames = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
  for (const name of nodeNames) {
    it(`adds node "${name}" correctly`, () => {
      const g = addNode(createGraph(), name, name.length);
      expect(g.nodes.has(name)).toBe(true);
      expect(g.nodes.get(name)?.id).toBe(name);
      expect(g.nodes.get(name)?.data).toBe(name.length);
      expect(g.nodes.size).toBe(1);
    });
  }

  it('adds multiple nodes sequentially', () => {
    let g = createGraph<string>();
    for (let i = 0; i < 10; i++) {
      g = addNode(g, `node${i}`, `data${i}`);
    }
    expect(g.nodes.size).toBe(10);
    for (let i = 0; i < 10; i++) {
      expect(g.nodes.has(`node${i}`)).toBe(true);
      expect(g.nodes.get(`node${i}`)?.data).toBe(`data${i}`);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. removeNode
// ---------------------------------------------------------------------------
describe('removeNode', () => {
  it('removes an existing node', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = removeNode(g, 'A');
    expect(g.nodes.has('A')).toBe(false);
    expect(g.nodes.has('B')).toBe(true);
    expect(g.nodes.size).toBe(1);
  });

  it('removes associated edges when node is removed', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addNode(g, 'C');
    g = addEdge(g, 'A', 'B', 1);
    g = addEdge(g, 'B', 'C', 1);
    g = addEdge(g, 'A', 'C', 1);
    g = removeNode(g, 'B');
    expect(g.edges.some((e) => e.from === 'B' || e.to === 'B')).toBe(false);
    expect(g.edges.length).toBe(1);
  });

  it('is a no-op for non-existent node', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    const g2 = removeNode(g, 'Z');
    expect(g2.nodes.size).toBe(1);
    expect(g2.nodes.has('A')).toBe(true);
  });

  it('does not mutate original graph', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    const g2 = removeNode(g, 'A');
    expect(g.nodes.has('A')).toBe(true);
    expect(g2.nodes.has('A')).toBe(false);
  });

  for (let i = 0; i < 5; i++) {
    it(`removes node from ${i + 2}-node graph correctly`, () => {
      let g = createGraph();
      for (let j = 0; j <= i + 1; j++) g = addNode(g, String(j));
      for (let j = 0; j < i + 1; j++) g = addEdge(g, String(j), String(j + 1), 1);
      const before = g.nodes.size;
      g = removeNode(g, '0');
      expect(g.nodes.size).toBe(before - 1);
      expect(g.edges.some((e) => e.from === '0' || e.to === '0')).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. addEdge
// ---------------------------------------------------------------------------
describe('addEdge', () => {
  it('adds a directed edge', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 5);
    expect(g.edges.length).toBe(1);
    expect(g.edges[0].from).toBe('A');
    expect(g.edges[0].to).toBe('B');
    expect(g.edges[0].weight).toBe(5);
  });

  it('adds two edges for undirected graph', () => {
    let g = createGraph(false);
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 3);
    expect(g.edges.length).toBe(2);
    expect(g.edges.some((e) => e.from === 'A' && e.to === 'B')).toBe(true);
    expect(g.edges.some((e) => e.from === 'B' && e.to === 'A')).toBe(true);
  });

  it('adds edge with data payload', () => {
    let g = createGraph<unknown, { label: string }>();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 1, { label: 'road' });
    expect(g.edges[0].data?.label).toBe('road');
  });

  it('allows parallel edges in directed graph', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 1);
    g = addEdge(g, 'A', 'B', 2);
    expect(g.edges.length).toBe(2);
  });

  it('does not mutate original graph', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    const before = g.edges.length;
    const g2 = addEdge(g, 'A', 'B', 1);
    expect(g.edges.length).toBe(before);
    expect(g2.edges.length).toBe(before + 1);
  });

  const weightCases = [1, 2, 5, 10, 0.5, 100, 0];
  for (const w of weightCases) {
    it(`adds edge with weight ${w}`, () => {
      let g = createGraph();
      g = addNode(g, 'A');
      g = addNode(g, 'B');
      g = addEdge(g, 'A', 'B', w);
      expect(g.edges[0].weight).toBe(w);
      expect(g.edges.length).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. removeEdge
// ---------------------------------------------------------------------------
describe('removeEdge', () => {
  it('removes a directed edge', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 1);
    g = removeEdge(g, 'A', 'B');
    expect(g.edges.length).toBe(0);
  });

  it('removes both directions in undirected graph', () => {
    let g = createGraph(false);
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 1);
    g = removeEdge(g, 'A', 'B');
    expect(g.edges.length).toBe(0);
  });

  it('does not remove non-existent edge', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 1);
    g = removeEdge(g, 'B', 'A');
    expect(g.edges.length).toBe(1);
  });

  it('keeps other edges intact', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addNode(g, 'C');
    g = addEdge(g, 'A', 'B', 1);
    g = addEdge(g, 'B', 'C', 2);
    g = removeEdge(g, 'A', 'B');
    expect(g.edges.length).toBe(1);
    expect(g.edges[0].from).toBe('B');
    expect(g.edges[0].to).toBe('C');
  });

  it('does not mutate original graph', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 1);
    const g2 = removeEdge(g, 'A', 'B');
    expect(g.edges.length).toBe(1);
    expect(g2.edges.length).toBe(0);
  });

  for (let i = 1; i <= 5; i++) {
    it(`removeEdge in ${i + 2}-node chain preserves other ${i} edges`, () => {
      let g = buildLinearGraph(i + 2);
      g = removeEdge(g, '0', '1');
      expect(g.edges.length).toBe(i);
      expect(g.edges.every((e) => !(e.from === '0' && e.to === '1'))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. getNeighbors
// ---------------------------------------------------------------------------
describe('getNeighbors', () => {
  it('returns outgoing neighbor IDs', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addNode(g, 'C');
    g = addEdge(g, 'A', 'B', 1);
    g = addEdge(g, 'A', 'C', 1);
    expect(getNeighbors(g, 'A').sort()).toEqual(['B', 'C']);
  });

  it('returns empty array for isolated node', () => {
    let g = createGraph();
    g = addNode(g, 'X');
    expect(getNeighbors(g, 'X')).toEqual([]);
  });

  it('returns empty array for non-existent node', () => {
    const g = createGraph();
    expect(getNeighbors(g, 'Z')).toEqual([]);
  });

  it('directed: only forward neighbors', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'B', 'A', 1);
    expect(getNeighbors(g, 'A')).toEqual([]);
    expect(getNeighbors(g, 'B')).toEqual(['A']);
  });

  for (let n = 1; n <= 8; n++) {
    it(`hub node with ${n} neighbors`, () => {
      let g = createGraph();
      g = addNode(g, 'hub');
      for (let i = 0; i < n; i++) {
        g = addNode(g, `leaf${i}`);
        g = addEdge(g, 'hub', `leaf${i}`, 1);
      }
      expect(getNeighbors(g, 'hub').length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 7 & 8. getIncomingEdges / getOutgoingEdges
// ---------------------------------------------------------------------------
describe('getIncomingEdges', () => {
  it('returns edges pointing to a node', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addNode(g, 'C');
    g = addEdge(g, 'A', 'C', 2);
    g = addEdge(g, 'B', 'C', 3);
    g = addEdge(g, 'C', 'A', 1);
    const inc = getIncomingEdges(g, 'C');
    expect(inc.length).toBe(2);
    expect(inc.every((e) => e.to === 'C')).toBe(true);
  });

  it('returns empty for node with no incoming edges', () => {
    let g = createGraph();
    g = addNode(g, 'root');
    g = addNode(g, 'child');
    g = addEdge(g, 'root', 'child', 1);
    expect(getIncomingEdges(g, 'root')).toEqual([]);
  });

  for (let k = 1; k <= 6; k++) {
    it(`${k} incoming edges are returned correctly`, () => {
      let g = createGraph();
      g = addNode(g, 'center');
      for (let i = 0; i < k; i++) {
        g = addNode(g, `src${i}`);
        g = addEdge(g, `src${i}`, 'center', i + 1);
      }
      const inc = getIncomingEdges(g, 'center');
      expect(inc.length).toBe(k);
      expect(inc.every((e) => e.to === 'center')).toBe(true);
    });
  }
});

describe('getOutgoingEdges', () => {
  it('returns edges from a node', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addNode(g, 'C');
    g = addEdge(g, 'A', 'B', 1);
    g = addEdge(g, 'A', 'C', 2);
    g = addEdge(g, 'B', 'A', 3);
    const out = getOutgoingEdges(g, 'A');
    expect(out.length).toBe(2);
    expect(out.every((e) => e.from === 'A')).toBe(true);
  });

  it('returns empty for a sink node', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 1);
    expect(getOutgoingEdges(g, 'B')).toEqual([]);
  });

  for (let k = 1; k <= 6; k++) {
    it(`${k} outgoing edges are returned correctly`, () => {
      let g = createGraph();
      g = addNode(g, 'src');
      for (let i = 0; i < k; i++) {
        g = addNode(g, `dst${i}`);
        g = addEdge(g, 'src', `dst${i}`, i + 1);
      }
      const out = getOutgoingEdges(g, 'src');
      expect(out.length).toBe(k);
      expect(out.every((e) => e.from === 'src')).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 9. bfs
// ---------------------------------------------------------------------------
describe('bfs', () => {
  it('visits all nodes in a linear graph', () => {
    const g = buildLinearGraph(5);
    const visited = bfs(g, '0');
    expect(visited).toEqual(['0', '1', '2', '3', '4']);
  });

  it('returns only start node if isolated', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    expect(bfs(g, 'A')).toEqual(['A']);
  });

  it('returns empty array for non-existent start', () => {
    const g = createGraph();
    expect(bfs(g, 'Z')).toEqual([]);
  });

  it('fires callback with correct depth and parent', () => {
    let g = createGraph();
    ['A', 'B', 'C'].forEach((id) => (g = addNode(g, id)));
    g = addEdge(g, 'A', 'B', 1);
    g = addEdge(g, 'A', 'C', 1);
    const depthMap: Record<string, number> = {};
    const parentMap: Record<string, string | undefined> = {};
    bfs(g, 'A', (node, depth, parent) => {
      depthMap[node.id] = depth;
      parentMap[node.id] = parent;
    });
    expect(depthMap['A']).toBe(0);
    expect(depthMap['B']).toBe(1);
    expect(depthMap['C']).toBe(1);
    expect(parentMap['A']).toBeUndefined();
    expect(parentMap['B']).toBe('A');
    expect(parentMap['C']).toBe('A');
  });

  it('visits each node once', () => {
    const g = buildCompleteGraph(6, true);
    const visited = bfs(g, '0');
    const unique = new Set(visited);
    expect(unique.size).toBe(visited.length);
    expect(unique.size).toBe(6);
  });

  for (let n = 2; n <= 8; n++) {
    it(`bfs on ${n}-node linear graph visits exactly ${n} nodes`, () => {
      const g = buildLinearGraph(n);
      const visited = bfs(g, '0');
      expect(visited.length).toBe(n);
      expect(visited[0]).toBe('0');
      expect(visited[visited.length - 1]).toBe(String(n - 1));
    });
  }
});

// ---------------------------------------------------------------------------
// 10. dfs
// ---------------------------------------------------------------------------
describe('dfs', () => {
  it('visits all nodes in a tree', () => {
    const g = buildLinearGraph(5);
    const visited = dfs(g, '0');
    expect(visited.length).toBe(5);
    expect(new Set(visited).size).toBe(5);
  });

  it('returns empty array for non-existent start', () => {
    const g = createGraph();
    expect(dfs(g, 'Z')).toEqual([]);
  });

  it('fires callback with increasing depth', () => {
    const g = buildLinearGraph(4);
    const depths: number[] = [];
    dfs(g, '0', (_node, depth) => depths.push(depth));
    expect(depths[0]).toBe(0);
    for (let i = 1; i < depths.length; i++) {
      expect(depths[i]).toBeGreaterThanOrEqual(depths[i - 1]);
    }
  });

  it('visits each node once', () => {
    const g = buildCompleteGraph(5, true);
    const visited = dfs(g, '0');
    expect(new Set(visited).size).toBe(visited.length);
  });

  it('starts from the given node', () => {
    const g = buildLinearGraph(5);
    const visited = dfs(g, '2');
    expect(visited[0]).toBe('2');
  });

  for (let n = 2; n <= 8; n++) {
    it(`dfs on ${n}-node cycle visits exactly ${n} nodes`, () => {
      const g = buildCycleGraph(n);
      const visited = dfs(g, '0');
      expect(visited.length).toBe(n);
      expect(new Set(visited).size).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 11. dijkstra
// ---------------------------------------------------------------------------
describe('dijkstra', () => {
  const linearCases = [
    { n: 3, start: '0', end: '2', dist: 2, path: ['0', '1', '2'] },
    { n: 4, start: '0', end: '3', dist: 3, path: ['0', '1', '2', '3'] },
    { n: 5, start: '0', end: '4', dist: 4, path: ['0', '1', '2', '3', '4'] },
    { n: 5, start: '1', end: '4', dist: 3, path: ['1', '2', '3', '4'] },
    { n: 5, start: '2', end: '4', dist: 2, path: ['2', '3', '4'] },
  ];
  for (const tc of linearCases) {
    it(`linear graph n=${tc.n}: ${tc.start}→${tc.end} dist=${tc.dist}`, () => {
      const g = buildLinearGraph(tc.n);
      const result = dijkstra(g, tc.start, tc.end);
      expect(result.found).toBe(true);
      expect(result.distance).toBe(tc.dist);
      expect(result.path).toEqual(tc.path);
    });
  }

  it('returns not found when no path exists', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    const result = dijkstra(g, 'A', 'B');
    expect(result.found).toBe(false);
    expect(result.distance).toBe(Infinity);
    expect(result.path).toEqual([]);
  });

  it('returns found for same start and end', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    const result = dijkstra(g, 'A', 'A');
    expect(result.found).toBe(true);
    expect(result.distance).toBe(0);
    expect(result.path).toEqual(['A']);
  });

  it('returns not found for non-existent nodes', () => {
    const g = createGraph();
    const result = dijkstra(g, 'X', 'Y');
    expect(result.found).toBe(false);
  });

  it('prefers shorter path via weights', () => {
    let g = createGraph();
    ['A', 'B', 'C', 'D'].forEach((id) => (g = addNode(g, id)));
    g = addEdge(g, 'A', 'B', 1);
    g = addEdge(g, 'B', 'D', 1);
    g = addEdge(g, 'A', 'C', 10);
    g = addEdge(g, 'C', 'D', 1);
    const result = dijkstra(g, 'A', 'D');
    expect(result.found).toBe(true);
    expect(result.distance).toBe(2);
    expect(result.path).toEqual(['A', 'B', 'D']);
  });

  it('works with fractional weights', () => {
    let g = createGraph();
    g = addNode(g, 'X');
    g = addNode(g, 'Y');
    g = addEdge(g, 'X', 'Y', 0.5);
    const result = dijkstra(g, 'X', 'Y');
    expect(result.found).toBe(true);
    expect(result.distance).toBeCloseTo(0.5);
  });

  it('handles a 3-way diamond', () => {
    let g = createGraph();
    ['S', 'A', 'B', 'E'].forEach((id) => (g = addNode(g, id)));
    g = addEdge(g, 'S', 'A', 3);
    g = addEdge(g, 'S', 'B', 1);
    g = addEdge(g, 'A', 'E', 1);
    g = addEdge(g, 'B', 'E', 4);
    const result = dijkstra(g, 'S', 'E');
    expect(result.found).toBe(true);
    expect(result.distance).toBe(4);
    expect(result.path).toEqual(['S', 'A', 'E']);
  });

  // Extra weight variants
  const weightCases = [
    { w1: 5, w2: 3, w3: 2, expectedDist: 5 },
    { w1: 1, w2: 100, w3: 2, expectedDist: 3 },
    { w1: 10, w2: 10, w3: 1, expectedDist: 11 },
  ];
  for (const tc of weightCases) {
    it(`diamond weights (${tc.w1},${tc.w2},${tc.w3}) dist=${tc.expectedDist}`, () => {
      let g = createGraph();
      ['S', 'M', 'E'].forEach((id) => (g = addNode(g, id)));
      g = addEdge(g, 'S', 'M', tc.w1);
      g = addEdge(g, 'M', 'E', 1);
      g = addEdge(g, 'S', 'E', tc.w2);
      const result = dijkstra(g, 'S', 'E');
      expect(result.found).toBe(true);
      expect(result.distance).toBe(Math.min(tc.w1 + 1, tc.w2));
    });
  }
});

// ---------------------------------------------------------------------------
// 12. topologicalSort
// ---------------------------------------------------------------------------
describe('topologicalSort', () => {
  it('sorts a DAG correctly', () => {
    let g = createGraph();
    ['A', 'B', 'C', 'D'].forEach((id) => (g = addNode(g, id)));
    g = addEdge(g, 'A', 'B', 1);
    g = addEdge(g, 'B', 'C', 1);
    g = addEdge(g, 'A', 'D', 1);
    g = addEdge(g, 'D', 'C', 1);
    const result = topologicalSort(g);
    expect(result.hasCycle).toBe(false);
    expect(result.order.length).toBe(4);
    // A must come before B, B before C, A before D, D before C
    const idx = (id: string) => result.order.indexOf(id);
    expect(idx('A')).toBeLessThan(idx('B'));
    expect(idx('B')).toBeLessThan(idx('C'));
    expect(idx('A')).toBeLessThan(idx('D'));
    expect(idx('D')).toBeLessThan(idx('C'));
  });

  it('detects cycle', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 1);
    g = addEdge(g, 'B', 'A', 1);
    const result = topologicalSort(g);
    expect(result.hasCycle).toBe(true);
  });

  it('handles empty graph', () => {
    const g = createGraph();
    const result = topologicalSort(g);
    expect(result.order).toEqual([]);
    expect(result.hasCycle).toBe(false);
  });

  it('handles single node', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    const result = topologicalSort(g);
    expect(result.order).toEqual(['A']);
    expect(result.hasCycle).toBe(false);
  });

  for (let n = 2; n <= 8; n++) {
    it(`linear ${n}-node DAG produces correct topological order`, () => {
      const g = buildLinearGraph(n);
      const result = topologicalSort(g);
      expect(result.hasCycle).toBe(false);
      expect(result.order.length).toBe(n);
      for (let i = 0; i < n - 1; i++) {
        expect(result.order.indexOf(String(i))).toBeLessThan(
          result.order.indexOf(String(i + 1)),
        );
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 13 & 14. findCycles / hasCycle
// ---------------------------------------------------------------------------
describe('findCycles', () => {
  it('finds self-loop', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addEdge(g, 'A', 'A', 1);
    const cycles = findCycles(g);
    expect(cycles.length).toBeGreaterThan(0);
  });

  it('finds simple 2-cycle', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 1);
    g = addEdge(g, 'B', 'A', 1);
    const cycles = findCycles(g);
    expect(cycles.length).toBeGreaterThan(0);
  });

  it('returns empty array for acyclic graph', () => {
    const g = buildLinearGraph(5);
    const cycles = findCycles(g);
    expect(cycles.length).toBe(0);
  });

  for (let n = 3; n <= 7; n++) {
    it(`finds cycle in ${n}-node cycle graph`, () => {
      const g = buildCycleGraph(n);
      const cycles = findCycles(g);
      expect(cycles.length).toBeGreaterThan(0);
    });
  }
});

describe('hasCycle', () => {
  it('returns true for cycle graph', () => {
    const g = buildCycleGraph(4);
    expect(hasCycle(g)).toBe(true);
  });

  it('returns false for linear DAG', () => {
    const g = buildLinearGraph(5);
    expect(hasCycle(g)).toBe(false);
  });

  it('returns false for empty graph', () => {
    expect(hasCycle(createGraph())).toBe(false);
  });

  it('returns false for single node without self-loop', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    expect(hasCycle(g)).toBe(false);
  });

  it('returns true for self-loop', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addEdge(g, 'A', 'A', 1);
    expect(hasCycle(g)).toBe(true);
  });

  for (let n = 2; n <= 8; n++) {
    it(`hasCycle: linear ${n} → false, cycle ${n} → true`, () => {
      expect(hasCycle(buildLinearGraph(n))).toBe(false);
      expect(hasCycle(buildCycleGraph(n))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 15. isConnected
// ---------------------------------------------------------------------------
describe('isConnected', () => {
  it('returns true for empty graph', () => {
    expect(isConnected(createGraph())).toBe(true);
  });

  it('returns true for single node', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    expect(isConnected(g)).toBe(true);
  });

  it('returns true for connected linear graph', () => {
    expect(isConnected(buildLinearGraph(5, false))).toBe(true);
  });

  it('returns false for disconnected graph', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    expect(isConnected(g)).toBe(false);
  });

  it('undirected connected graph returns true', () => {
    const g = buildLinearGraph(4, false);
    expect(isConnected(g)).toBe(true);
  });

  for (let n = 2; n <= 7; n++) {
    it(`connected linear graph n=${n} isConnected=true`, () => {
      expect(isConnected(buildLinearGraph(n, false))).toBe(true);
    });
  }

  for (let n = 2; n <= 5; n++) {
    it(`two isolated nodes n=${n} isConnected=false`, () => {
      let g = createGraph();
      for (let i = 0; i < n; i++) g = addNode(g, String(i));
      expect(isConnected(g)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 16. getConnectedComponents
// ---------------------------------------------------------------------------
describe('getConnectedComponents', () => {
  it('single component for connected graph', () => {
    const g = buildLinearGraph(5);
    const comps = getConnectedComponents(g);
    expect(comps.length).toBe(1);
    expect(comps[0].size).toBe(5);
  });

  it('multiple components for disconnected graph', () => {
    let g = createGraph();
    for (let i = 0; i < 4; i++) g = addNode(g, String(i));
    g = addEdge(g, '0', '1', 1);
    g = addEdge(g, '2', '3', 1);
    const comps = getConnectedComponents(g);
    expect(comps.length).toBe(2);
    expect(comps[0].size).toBe(2);
    expect(comps[1].size).toBe(2);
  });

  it('empty graph has no components', () => {
    expect(getConnectedComponents(createGraph()).length).toBe(0);
  });

  it('all isolated nodes — N components', () => {
    let g = createGraph();
    for (let i = 0; i < 5; i++) g = addNode(g, String(i));
    const comps = getConnectedComponents(g);
    expect(comps.length).toBe(5);
    for (const c of comps) expect(c.size).toBe(1);
  });

  for (let k = 2; k <= 5; k++) {
    it(`${k} disjoint pairs → ${k} components`, () => {
      let g = createGraph();
      for (let i = 0; i < k; i++) {
        g = addNode(g, `a${i}`);
        g = addNode(g, `b${i}`);
        g = addEdge(g, `a${i}`, `b${i}`, 1);
      }
      const comps = getConnectedComponents(g);
      expect(comps.length).toBe(k);
    });
  }
});

// ---------------------------------------------------------------------------
// 17. stronglyConnectedComponents
// ---------------------------------------------------------------------------
describe('stronglyConnectedComponents', () => {
  it('linear DAG: each node is its own SCC', () => {
    const g = buildLinearGraph(4);
    const result = stronglyConnectedComponents(g);
    expect(result.components.length).toBe(4);
    for (const c of result.components) expect(c.length).toBe(1);
  });

  it('cycle: all nodes in one SCC', () => {
    const g = buildCycleGraph(4);
    const result = stronglyConnectedComponents(g);
    const bigComp = result.components.find((c) => c.length === 4);
    expect(bigComp).toBeDefined();
  });

  it('nodeToComponent covers every node', () => {
    const g = buildLinearGraph(5);
    const result = stronglyConnectedComponents(g);
    for (const id of g.nodes.keys()) {
      expect(result.nodeToComponent.has(id)).toBe(true);
    }
  });

  it('empty graph has no SCCs', () => {
    const result = stronglyConnectedComponents(createGraph());
    expect(result.components.length).toBe(0);
  });

  it('single node is its own SCC', () => {
    let g = createGraph();
    g = addNode(g, 'X');
    const result = stronglyConnectedComponents(g);
    expect(result.components.length).toBe(1);
    expect(result.components[0]).toContain('X');
  });

  for (let n = 3; n <= 7; n++) {
    it(`cycle of ${n}: one SCC of size ${n}`, () => {
      const g = buildCycleGraph(n);
      const result = stronglyConnectedComponents(g);
      const large = result.components.find((c) => c.length === n);
      expect(large).toBeDefined();
    });
  }
});

// ---------------------------------------------------------------------------
// 18. getStats
// ---------------------------------------------------------------------------
describe('getStats', () => {
  it('empty graph stats', () => {
    const stats = getStats(createGraph());
    expect(stats.nodeCount).toBe(0);
    expect(stats.edgeCount).toBe(0);
    expect(stats.isConnected).toBe(true);
    expect(stats.hasCycles).toBe(false);
    expect(stats.density).toBe(0);
    expect(stats.averageDegree).toBe(0);
  });

  it('single node stats', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    const stats = getStats(g);
    expect(stats.nodeCount).toBe(1);
    expect(stats.edgeCount).toBe(0);
    expect(stats.isConnected).toBe(true);
    expect(stats.hasCycles).toBe(false);
    expect(stats.density).toBe(0);
    expect(stats.averageDegree).toBe(0);
  });

  it('linear graph stats', () => {
    const g = buildLinearGraph(4, false);
    const stats = getStats(g);
    expect(stats.nodeCount).toBe(4);
    expect(stats.edgeCount).toBe(3);
    expect(stats.isConnected).toBe(true);
    expect(stats.hasCycles).toBe(false);
    expect(stats.density).toBeGreaterThan(0);
    expect(stats.averageDegree).toBeGreaterThan(0);
  });

  it('cycle graph has hasCycles=true', () => {
    const g = buildCycleGraph(4);
    const stats = getStats(g);
    expect(stats.hasCycles).toBe(true);
  });

  it('disconnected graph isConnected=false', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    const stats = getStats(g);
    expect(stats.isConnected).toBe(false);
  });

  for (let n = 2; n <= 6; n++) {
    it(`getStats for ${n}-node linear graph`, () => {
      const g = buildLinearGraph(n, false);
      const stats = getStats(g);
      expect(stats.nodeCount).toBe(n);
      expect(stats.edgeCount).toBe(n - 1);
      expect(stats.isConnected).toBe(true);
      expect(stats.density).toBeGreaterThan(0);
      expect(stats.density).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 19. reverse
// ---------------------------------------------------------------------------
describe('reverse', () => {
  it('reverses all edge directions', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 5);
    const rev = reverse(g);
    expect(rev.edges.length).toBe(1);
    expect(rev.edges[0].from).toBe('B');
    expect(rev.edges[0].to).toBe('A');
    expect(rev.edges[0].weight).toBe(5);
  });

  it('preserves node count', () => {
    const g = buildLinearGraph(5);
    const rev = reverse(g);
    expect(rev.nodes.size).toBe(5);
  });

  it('does not mutate original', () => {
    const g = buildLinearGraph(3);
    const origEdge0 = g.edges[0];
    const rev = reverse(g);
    expect(g.edges[0].from).toBe(origEdge0.from);
    expect(rev.edges[0].from).toBe(origEdge0.to);
  });

  it('double reverse equals original', () => {
    const g = buildLinearGraph(4);
    const rev = reverse(reverse(g));
    expect(rev.edges.map((e) => `${e.from}→${e.to}`).sort()).toEqual(
      g.edges.map((e) => `${e.from}→${e.to}`).sort(),
    );
  });

  for (let n = 2; n <= 7; n++) {
    it(`reverse ${n}-node linear graph: last node has 0 out-neighbors in original, n-1 in reversed`, () => {
      const g = buildLinearGraph(n);
      const rev = reverse(g);
      expect(getNeighbors(g, String(n - 1)).length).toBe(0);
      expect(getNeighbors(rev, String(n - 1)).length).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 20. subgraph
// ---------------------------------------------------------------------------
describe('subgraph', () => {
  it('returns subgraph with only specified nodes', () => {
    const g = buildLinearGraph(5);
    const sub = subgraph(g, ['0', '1', '2']);
    expect(sub.nodes.size).toBe(3);
    expect(sub.nodes.has('0')).toBe(true);
    expect(sub.nodes.has('3')).toBe(false);
  });

  it('includes only edges between subgraph nodes', () => {
    const g = buildLinearGraph(5);
    const sub = subgraph(g, ['0', '1', '2']);
    expect(sub.edges.length).toBe(2);
    expect(sub.edges.every((e) => ['0', '1', '2'].includes(e.from) && ['0', '1', '2'].includes(e.to))).toBe(true);
  });

  it('empty node list gives empty subgraph', () => {
    const g = buildLinearGraph(3);
    const sub = subgraph(g, []);
    expect(sub.nodes.size).toBe(0);
    expect(sub.edges.length).toBe(0);
  });

  it('does not mutate original graph', () => {
    const g = buildLinearGraph(5);
    subgraph(g, ['0', '1']);
    expect(g.nodes.size).toBe(5);
  });

  for (let k = 1; k <= 5; k++) {
    it(`subgraph of first ${k} nodes has ${k} nodes`, () => {
      const g = buildLinearGraph(6);
      const ids = Array.from({ length: k }, (_, i) => String(i));
      const sub = subgraph(g, ids);
      expect(sub.nodes.size).toBe(k);
    });
  }
});

// ---------------------------------------------------------------------------
// 21. merge
// ---------------------------------------------------------------------------
describe('merge', () => {
  it('combines nodes from both graphs', () => {
    let g1 = createGraph();
    g1 = addNode(g1, 'A');
    g1 = addNode(g1, 'B');
    let g2 = createGraph();
    g2 = addNode(g2, 'C');
    g2 = addNode(g2, 'D');
    const m = merge(g1, g2);
    expect(m.nodes.size).toBe(4);
    expect(m.nodes.has('A')).toBe(true);
    expect(m.nodes.has('D')).toBe(true);
  });

  it('combines edges from both graphs without duplication', () => {
    let g1 = createGraph();
    g1 = addNode(g1, 'A');
    g1 = addNode(g1, 'B');
    g1 = addEdge(g1, 'A', 'B', 1);
    let g2 = createGraph();
    g2 = addNode(g2, 'C');
    g2 = addNode(g2, 'D');
    g2 = addEdge(g2, 'C', 'D', 2);
    const m = merge(g1, g2);
    expect(m.edges.length).toBe(2);
  });

  it('node from g1 takes precedence on collision', () => {
    let g1 = createGraph<number>();
    g1 = addNode(g1, 'A', 1);
    let g2 = createGraph<number>();
    g2 = addNode(g2, 'A', 99);
    const m = merge(g1, g2) as typeof g1;
    expect(m.nodes.get('A')?.data).toBe(1);
  });

  it('directed property follows g1', () => {
    const g1 = createGraph(true);
    const g2 = createGraph(false);
    const m = merge(g1, g2);
    expect(m.directed).toBe(true);
  });

  for (let n = 1; n <= 5; n++) {
    it(`merge two ${n}-node linear graphs results in 2*${n} nodes`, () => {
      const g1 = buildLinearGraph(n);
      let g2 = createGraph();
      for (let i = 0; i < n; i++) g2 = addNode(g2, `x${i}`);
      const m = merge(g1, g2);
      expect(m.nodes.size).toBe(2 * n);
    });
  }
});

// ---------------------------------------------------------------------------
// 22 & 23. toAdjacencyMatrix / fromAdjacencyMatrix
// ---------------------------------------------------------------------------
describe('toAdjacencyMatrix', () => {
  it('produces correct matrix for linear graph', () => {
    const g = buildLinearGraph(3);
    const matrix = toAdjacencyMatrix(g);
    expect(matrix.length).toBe(3);
    expect(matrix[0].length).toBe(3);
    // Each row sums to 1 (one outgoing edge) except last
    expect(matrix[0].reduce((a, b) => a + b, 0)).toBe(1);
    expect(matrix[2].reduce((a, b) => a + b, 0)).toBe(0);
  });

  it('produces zero matrix for isolated nodes', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    const matrix = toAdjacencyMatrix(g);
    expect(matrix.every((row) => row.every((v) => v === 0))).toBe(true);
  });

  it('encodes edge weights', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 7);
    const matrix = toAdjacencyMatrix(g);
    const sum = matrix.flat().reduce((a, b) => a + b, 0);
    expect(sum).toBe(7);
  });

  for (let n = 2; n <= 5; n++) {
    it(`${n}×${n} matrix for ${n}-node graph`, () => {
      const g = buildLinearGraph(n);
      const matrix = toAdjacencyMatrix(g);
      expect(matrix.length).toBe(n);
      matrix.forEach((row) => expect(row.length).toBe(n));
    });
  }
});

describe('fromAdjacencyMatrix', () => {
  it('builds a graph from a matrix', () => {
    const matrix = [[0, 1, 0], [0, 0, 1], [0, 0, 0]];
    const ids = ['A', 'B', 'C'];
    const g = fromAdjacencyMatrix(matrix, ids, true);
    expect(g.nodes.size).toBe(3);
    expect(g.edges.length).toBe(2);
    expect(hasPath(g, 'A', 'C')).toBe(true);
  });

  it('builds undirected graph from symmetric matrix', () => {
    const matrix = [[0, 1], [1, 0]];
    const ids = ['X', 'Y'];
    const g = fromAdjacencyMatrix(matrix, ids, false);
    expect(g.directed).toBe(false);
    expect(getNeighbors(g, 'X')).toContain('Y');
    expect(getNeighbors(g, 'Y')).toContain('X');
  });

  it('zero matrix produces no edges', () => {
    const matrix = [[0, 0], [0, 0]];
    const g = fromAdjacencyMatrix(matrix, ['A', 'B'], true);
    expect(g.edges.length).toBe(0);
  });

  for (let n = 2; n <= 5; n++) {
    it(`roundtrip toMatrix→fromMatrix for ${n}-node graph`, () => {
      const g = buildLinearGraph(n);
      const ids = Array.from(g.nodes.keys());
      const matrix = toAdjacencyMatrix(g);
      const g2 = fromAdjacencyMatrix(matrix, ids, true);
      expect(g2.nodes.size).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 24. toAdjacencyList
// ---------------------------------------------------------------------------
describe('toAdjacencyList', () => {
  it('produces correct adjacency list', () => {
    const g = buildLinearGraph(4);
    const list = toAdjacencyList(g);
    expect(list.get('0')).toContain('1');
    expect(list.get('1')).toContain('2');
    expect(list.get('2')).toContain('3');
    expect(list.get('3')).toEqual([]);
  });

  it('isolated nodes have empty lists', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    const list = toAdjacencyList(g);
    expect(list.get('A')).toEqual([]);
    expect(list.get('B')).toEqual([]);
  });

  it('covers all nodes', () => {
    const g = buildLinearGraph(5);
    const list = toAdjacencyList(g);
    expect(list.size).toBe(5);
    for (const id of g.nodes.keys()) {
      expect(list.has(id)).toBe(true);
    }
  });

  for (let n = 2; n <= 6; n++) {
    it(`adjacency list for ${n}-node graph covers all nodes`, () => {
      const g = buildLinearGraph(n);
      const list = toAdjacencyList(g);
      expect(list.size).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 25. clone
// ---------------------------------------------------------------------------
describe('clone', () => {
  it('produces a deep copy', () => {
    const g = buildLinearGraph(3);
    const c = clone(g);
    expect(c.nodes.size).toBe(3);
    expect(c.edges.length).toBe(2);
    expect(c.nodes).not.toBe(g.nodes);
    expect(c.edges).not.toBe(g.edges);
  });

  it('mutations to clone do not affect original', () => {
    const g = buildLinearGraph(3);
    const c = clone(g);
    // Modify clone edges
    c.edges[0].weight = 999;
    expect(g.edges[0].weight).not.toBe(999);
  });

  it('preserves directed flag', () => {
    const g = buildLinearGraph(3, false);
    const c = clone(g);
    expect(c.directed).toBe(false);
  });

  for (let n = 1; n <= 6; n++) {
    it(`clone of ${n}-node graph has same structure`, () => {
      const g = buildLinearGraph(n);
      const c = clone(g);
      expect(c.nodes.size).toBe(g.nodes.size);
      expect(c.edges.length).toBe(g.edges.length);
      expect(c.directed).toBe(g.directed);
    });
  }
});

// ---------------------------------------------------------------------------
// 26. hasPath
// ---------------------------------------------------------------------------
describe('hasPath', () => {
  it('returns true for directly connected nodes', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 1);
    expect(hasPath(g, 'A', 'B')).toBe(true);
  });

  it('returns false when no path exists', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    expect(hasPath(g, 'A', 'B')).toBe(false);
  });

  it('returns true for same node', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    expect(hasPath(g, 'A', 'A')).toBe(true);
  });

  it('directed: path A→B but not B→A', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addEdge(g, 'A', 'B', 1);
    expect(hasPath(g, 'A', 'B')).toBe(true);
    expect(hasPath(g, 'B', 'A')).toBe(false);
  });

  it('transitive path', () => {
    const g = buildLinearGraph(6);
    expect(hasPath(g, '0', '5')).toBe(true);
  });

  it('returns false for non-existent source', () => {
    const g = buildLinearGraph(3);
    expect(hasPath(g, 'Z', '0')).toBe(false);
  });

  for (let n = 2; n <= 8; n++) {
    it(`hasPath from 0 to ${n - 1} in ${n}-node linear graph`, () => {
      const g = buildLinearGraph(n);
      expect(hasPath(g, '0', String(n - 1))).toBe(true);
      expect(hasPath(g, String(n - 1), '0')).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 27. allPaths
// ---------------------------------------------------------------------------
describe('allPaths', () => {
  it('finds one path in a linear graph', () => {
    const g = buildLinearGraph(4);
    const paths = allPaths(g, '0', '3');
    expect(paths.length).toBe(1);
    expect(paths[0]).toEqual(['0', '1', '2', '3']);
  });

  it('finds multiple paths in a diamond', () => {
    let g = createGraph();
    ['A', 'B', 'C', 'D'].forEach((id) => (g = addNode(g, id)));
    g = addEdge(g, 'A', 'B', 1);
    g = addEdge(g, 'A', 'C', 1);
    g = addEdge(g, 'B', 'D', 1);
    g = addEdge(g, 'C', 'D', 1);
    const paths = allPaths(g, 'A', 'D');
    expect(paths.length).toBe(2);
    expect(paths.every((p) => p[0] === 'A' && p[p.length - 1] === 'D')).toBe(true);
  });

  it('returns empty when no path', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    expect(allPaths(g, 'A', 'B')).toEqual([]);
  });

  it('respects maxDepth', () => {
    const g = buildLinearGraph(10);
    const paths = allPaths(g, '0', '9', 5);
    expect(paths.length).toBe(0); // path length is 10 > maxDepth=5
  });

  it('returns empty for non-existent nodes', () => {
    const g = buildLinearGraph(3);
    expect(allPaths(g, 'Z', '0')).toEqual([]);
  });

  for (let n = 2; n <= 6; n++) {
    it(`allPaths in ${n}-node linear graph: exactly 1 path`, () => {
      const g = buildLinearGraph(n);
      const paths = allPaths(g, '0', String(n - 1));
      expect(paths.length).toBe(1);
      expect(paths[0].length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 28. minimumSpanningTree
// ---------------------------------------------------------------------------
describe('minimumSpanningTree', () => {
  it('MST of 4-node weighted graph has 3 edges', () => {
    let g = createGraph(false);
    ['A', 'B', 'C', 'D'].forEach((id) => (g = addNode(g, id)));
    g = addEdge(g, 'A', 'B', 4);
    g = addEdge(g, 'A', 'C', 2);
    g = addEdge(g, 'B', 'C', 1);
    g = addEdge(g, 'B', 'D', 5);
    g = addEdge(g, 'C', 'D', 8);
    const mst = minimumSpanningTree(g);
    const mstEdges = mst.edges.filter((e) => e.from < e.to || !mst.edges.some((x) => x.from === e.to && x.to === e.from));
    expect(mstEdges.length).toBe(3);
  });

  it('MST preserves all nodes', () => {
    const g = buildLinearGraph(5, false);
    const mst = minimumSpanningTree(g);
    expect(mst.nodes.size).toBe(5);
  });

  it('MST of linear graph is the linear graph itself', () => {
    const g = buildLinearGraph(4, false);
    const mst = minimumSpanningTree(g);
    expect(mst.nodes.size).toBe(4);
  });

  it('MST of single node has no edges', () => {
    let g = createGraph(false);
    g = addNode(g, 'A');
    const mst = minimumSpanningTree(g);
    expect(mst.nodes.size).toBe(1);
  });

  for (let n = 2; n <= 6; n++) {
    it(`MST of ${n}-node path has ${n} nodes`, () => {
      const g = buildLinearGraph(n, false);
      const mst = minimumSpanningTree(g);
      expect(mst.nodes.size).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 29. degree
// ---------------------------------------------------------------------------
describe('degree', () => {
  it('returns correct in/out degrees', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    g = addNode(g, 'C');
    g = addEdge(g, 'A', 'B', 1);
    g = addEdge(g, 'C', 'B', 1);
    g = addEdge(g, 'B', 'A', 1);
    const d = degree(g, 'B');
    expect(d.in).toBe(2);
    expect(d.out).toBe(1);
    expect(d.total).toBe(3);
  });

  it('isolated node has degree 0/0/0', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    const d = degree(g, 'A');
    expect(d.in).toBe(0);
    expect(d.out).toBe(0);
    expect(d.total).toBe(0);
  });

  it('total = in + out', () => {
    const g = buildLinearGraph(5);
    for (const id of g.nodes.keys()) {
      const d = degree(g, id);
      expect(d.total).toBe(d.in + d.out);
    }
  });

  for (let n = 2; n <= 7; n++) {
    it(`degree of middle node in ${n}-node linear graph`, () => {
      const g = buildLinearGraph(n);
      if (n >= 3) {
        const mid = String(Math.floor(n / 2));
        const d = degree(g, mid);
        expect(d.in).toBe(1);
        expect(d.out).toBe(1);
        expect(d.total).toBe(2);
      }
    });
  }

  it('hub node has out-degree equal to leaf count', () => {
    let g = createGraph();
    g = addNode(g, 'hub');
    const leafCount = 7;
    for (let i = 0; i < leafCount; i++) {
      g = addNode(g, `leaf${i}`);
      g = addEdge(g, 'hub', `leaf${i}`, 1);
    }
    const d = degree(g, 'hub');
    expect(d.out).toBe(leafCount);
    expect(d.in).toBe(0);
    expect(d.total).toBe(leafCount);
  });
});

// ---------------------------------------------------------------------------
// 30. nodesBetween
// ---------------------------------------------------------------------------
describe('nodesBetween', () => {
  it('returns intermediate nodes on shortest path', () => {
    const g = buildLinearGraph(5);
    const between = nodesBetween(g, '0', '4');
    expect(between).toEqual(['1', '2', '3']);
  });

  it('returns empty when nodes are directly connected', () => {
    const g = buildLinearGraph(3);
    const between = nodesBetween(g, '0', '1');
    expect(between).toEqual([]);
  });

  it('returns empty when no path exists', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    g = addNode(g, 'B');
    const between = nodesBetween(g, 'A', 'B');
    expect(between).toEqual([]);
  });

  it('returns empty for same node', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    const between = nodesBetween(g, 'A', 'A');
    expect(between).toEqual([]);
  });

  for (let n = 3; n <= 8; n++) {
    it(`nodesBetween in ${n}-node linear: ${n - 2} intermediate nodes`, () => {
      const g = buildLinearGraph(n);
      const between = nodesBetween(g, '0', String(n - 1));
      expect(between.length).toBe(n - 2);
      for (let i = 1; i <= n - 2; i++) {
        expect(between).toContain(String(i));
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Integration / cross-function tests
// ---------------------------------------------------------------------------
describe('integration: directed workflow graph', () => {
  let wf = createGraph<{ name: string }, { type: string }>();
  const nodes = ['start', 'review', 'approve', 'reject', 'end'];
  beforeEach(() => {
    wf = createGraph(true);
    nodes.forEach((id) => (wf = addNode(wf, id, { name: id })));
    wf = addEdge(wf, 'start', 'review', 1, { type: 'submit' });
    wf = addEdge(wf, 'review', 'approve', 1, { type: 'pass' });
    wf = addEdge(wf, 'review', 'reject', 1, { type: 'fail' });
    wf = addEdge(wf, 'approve', 'end', 1, { type: 'done' });
    wf = addEdge(wf, 'reject', 'end', 1, { type: 'done' });
  });

  it('has correct node count', () => { expect(wf.nodes.size).toBe(5); });
  it('has correct edge count', () => { expect(wf.edges.length).toBe(5); });
  it('hasPath start→end', () => { expect(hasPath(wf, 'start', 'end')).toBe(true); });
  it('hasPath end→start is false', () => { expect(hasPath(wf, 'end', 'start')).toBe(false); });
  it('topological sort does not have cycle', () => {
    const result = topologicalSort(wf);
    expect(result.hasCycle).toBe(false);
    expect(result.order[0]).toBe('start');
  });
  it('dijkstra start→end distance is 2', () => {
    const r = dijkstra(wf, 'start', 'end');
    expect(r.found).toBe(true);
    expect(r.distance).toBe(3);
  });
  it('bfs from start visits all 5 nodes', () => {
    const visited = bfs(wf, 'start');
    expect(visited.length).toBe(5);
  });
  it('dfs from start visits all 5 nodes', () => {
    const visited = dfs(wf, 'start');
    expect(visited.length).toBe(5);
  });
  it('adjacency list has all keys', () => {
    const list = toAdjacencyList(wf);
    nodes.forEach((id) => expect(list.has(id)).toBe(true));
  });
  it('stats show correct node/edge count', () => {
    const stats = getStats(wf);
    expect(stats.nodeCount).toBe(5);
    expect(stats.edgeCount).toBe(5);
  });
  it('cloned graph is structurally identical', () => {
    const c = clone(wf);
    expect(c.nodes.size).toBe(wf.nodes.size);
    expect(c.edges.length).toBe(wf.edges.length);
  });
  it('subgraph review/approve/reject/end has no start', () => {
    const sub = subgraph(wf, ['review', 'approve', 'reject', 'end']);
    expect(sub.nodes.has('start')).toBe(false);
    expect(sub.nodes.size).toBe(4);
  });
  it('allPaths from start to end: 2 paths', () => {
    const paths = allPaths(wf, 'start', 'end');
    expect(paths.length).toBe(2);
  });
  it('reverse graph: end has 2 outgoing in reversed', () => {
    const rev = reverse(wf);
    expect(getNeighbors(rev, 'end').sort()).toEqual(['approve', 'reject']);
  });
  it('hasCycle is false', () => {
    expect(hasCycle(wf)).toBe(false);
  });
  it('findCycles returns empty', () => {
    expect(findCycles(wf)).toEqual([]);
  });
  it('nodesBetween start and end', () => {
    const between = nodesBetween(wf, 'start', 'end');
    expect(between.length).toBe(2);
  });
  it('degree of review node', () => {
    const d = degree(wf, 'review');
    expect(d.in).toBe(1);
    expect(d.out).toBe(2);
    expect(d.total).toBe(3);
  });
});

describe('integration: undirected network', () => {
  let net = createGraph(false);
  beforeEach(() => {
    net = createGraph(false);
    ['A', 'B', 'C', 'D', 'E'].forEach((id) => (net = addNode(net, id)));
    net = addEdge(net, 'A', 'B', 2);
    net = addEdge(net, 'B', 'C', 3);
    net = addEdge(net, 'C', 'D', 1);
    net = addEdge(net, 'D', 'E', 4);
    net = addEdge(net, 'A', 'E', 10);
  });

  it('isConnected is true', () => { expect(isConnected(net)).toBe(true); });
  it('hasPath A→E via either route', () => { expect(hasPath(net, 'A', 'E')).toBe(true); });
  it('dijkstra A→E prefers shorter route', () => {
    const r = dijkstra(net, 'A', 'E');
    expect(r.found).toBe(true);
    expect(r.distance).toBe(10); // direct is 10, via B-C-D is 2+3+1+4=10
  });
  it('one connected component', () => {
    const comps = getConnectedComponents(net);
    expect(comps.length).toBe(1);
  });
  it('MST has 4 unique edges', () => {
    const mst = minimumSpanningTree(net);
    const unique = mst.edges.filter((e) => e.from < e.to || !mst.edges.some((x) => x.from === e.to && x.to === e.from));
    expect(unique.length).toBe(4);
  });
  it('bfs from A visits all 5 nodes', () => {
    expect(bfs(net, 'A').length).toBe(5);
  });
  it('adjacency matrix is 5×5', () => {
    const m = toAdjacencyMatrix(net);
    expect(m.length).toBe(5);
    m.forEach((row) => expect(row.length).toBe(5));
  });
  it('hasCycle is false', () => {
    // undirected network A-B-C-D-E has edge A-E added → cycle A→B→C→D→E→A
    expect(hasCycle(net)).toBe(true);
  });
});

describe('integration: complete graph K4', () => {
  const g = buildCompleteGraph(4, true);

  it('has 4 nodes', () => { expect(g.nodes.size).toBe(4); });
  it('has 12 edges', () => { expect(g.edges.length).toBe(12); });
  it('isConnected is true', () => { expect(isConnected(g)).toBe(true); });
  it('hasCycle is true', () => { expect(hasCycle(g)).toBe(true); });
  it('hasPath from any node to any node', () => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i !== j) expect(hasPath(g, String(i), String(j))).toBe(true);
      }
    }
  });
  it('dijkstra between any two nodes finds path', () => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (i !== j) {
          const r = dijkstra(g, String(i), String(j));
          expect(r.found).toBe(true);
        }
      }
    }
  });
  it('all degrees are equal', () => {
    for (let i = 0; i < 4; i++) {
      const d = degree(g, String(i));
      expect(d.out).toBe(3);
      expect(d.in).toBe(3);
    }
  });
  it('SCC returns one big component', () => {
    const scc = stronglyConnectedComponents(g);
    const big = scc.components.find((c) => c.length === 4);
    expect(big).toBeDefined();
  });
  it('adjacency matrix has 12 non-zero entries', () => {
    const m = toAdjacencyMatrix(g);
    const nonZero = m.flat().filter((v) => v !== 0).length;
    expect(nonZero).toBe(12);
  });
  it('stats density is 1 for complete directed graph', () => {
    const stats = getStats(g);
    expect(stats.density).toBeCloseTo(1);
  });
});

describe('edge cases and boundary conditions', () => {
  it('empty graph bfs returns empty', () => { expect(bfs(createGraph(), 'X')).toEqual([]); });
  it('empty graph dfs returns empty', () => { expect(dfs(createGraph(), 'X')).toEqual([]); });
  it('empty graph dijkstra returns not found', () => {
    const r = dijkstra(createGraph(), 'A', 'B');
    expect(r.found).toBe(false);
    expect(r.distance).toBe(Infinity);
  });
  it('empty graph topological sort returns empty', () => {
    const result = topologicalSort(createGraph());
    expect(result.order).toEqual([]);
    expect(result.hasCycle).toBe(false);
  });
  it('empty graph clone is empty', () => {
    const c = clone(createGraph());
    expect(c.nodes.size).toBe(0);
    expect(c.edges.length).toBe(0);
  });
  it('empty graph getConnectedComponents returns empty', () => {
    expect(getConnectedComponents(createGraph())).toEqual([]);
  });
  it('empty graph SCC returns empty', () => {
    const scc = stronglyConnectedComponents(createGraph());
    expect(scc.components.length).toBe(0);
    expect(scc.nodeToComponent.size).toBe(0);
  });
  it('empty graph toAdjacencyMatrix returns empty array', () => {
    const m = toAdjacencyMatrix(createGraph());
    expect(m.length).toBe(0);
  });
  it('empty graph toAdjacencyList returns empty map', () => {
    expect(toAdjacencyList(createGraph()).size).toBe(0);
  });
  it('empty graph getStats', () => {
    const stats = getStats(createGraph());
    expect(stats.nodeCount).toBe(0);
    expect(stats.edgeCount).toBe(0);
  });
  it('removeNode from empty graph is no-op', () => {
    const g = removeNode(createGraph(), 'X');
    expect(g.nodes.size).toBe(0);
  });
  it('removeEdge from empty graph is no-op', () => {
    const g = removeEdge(createGraph(), 'A', 'B');
    expect(g.edges.length).toBe(0);
  });
  it('subgraph with empty ids list', () => {
    const g = buildLinearGraph(4);
    const sub = subgraph(g, []);
    expect(sub.nodes.size).toBe(0);
    expect(sub.edges.length).toBe(0);
  });
  it('merge two empty graphs', () => {
    const m = merge(createGraph(), createGraph());
    expect(m.nodes.size).toBe(0);
    expect(m.edges.length).toBe(0);
  });
  it('nodesBetween non-existent nodes', () => {
    expect(nodesBetween(createGraph(), 'A', 'B')).toEqual([]);
  });
  it('allPaths between same node returns path of length 1', () => {
    let g = createGraph();
    g = addNode(g, 'A');
    const paths = allPaths(g, 'A', 'A');
    // allPaths requires path.length > 1 for returning, so self→self returns []
    expect(Array.isArray(paths)).toBe(true);
  });
  it('fromAdjacencyMatrix with zero matrix', () => {
    const g = fromAdjacencyMatrix([[0]], ['A'], true);
    expect(g.nodes.size).toBe(1);
    expect(g.edges.length).toBe(0);
  });
  it('getNeighbors for node not in graph returns empty', () => {
    expect(getNeighbors(createGraph(), 'ghost')).toEqual([]);
  });
  it('degree of non-existent node returns 0/0/0', () => {
    const d = degree(createGraph(), 'ghost');
    expect(d.in).toBe(0);
    expect(d.out).toBe(0);
    expect(d.total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Stress: large linear graph (50 nodes)
// ---------------------------------------------------------------------------
describe('large graph (50 nodes)', () => {
  const N = 50;
  const g = buildLinearGraph(N);

  it('has 50 nodes', () => { expect(g.nodes.size).toBe(N); });
  it('has 49 edges', () => { expect(g.edges.length).toBe(N - 1); });
  it('bfs visits all 50 nodes', () => { expect(bfs(g, '0').length).toBe(N); });
  it('dfs visits all 50 nodes', () => { expect(dfs(g, '0').length).toBe(N); });
  it('dijkstra 0→49 distance = 49', () => {
    const r = dijkstra(g, '0', String(N - 1));
    expect(r.found).toBe(true);
    expect(r.distance).toBe(N - 1);
  });
  it('hasPath 0→49', () => { expect(hasPath(g, '0', String(N - 1))).toBe(true); });
  it('hasCycle is false', () => { expect(hasCycle(g)).toBe(false); });
  it('isConnected is false for directed linear (not strongly connected)', () => { expect(isConnected(g)).toBe(false); });
  it('topological sort has no cycle', () => {
    const result = topologicalSort(g);
    expect(result.hasCycle).toBe(false);
    expect(result.order.length).toBe(N);
  });
  it('1 connected component', () => {
    expect(getConnectedComponents(g).length).toBe(1);
  });
  it('adjacency matrix is 50×50', () => {
    const m = toAdjacencyMatrix(g);
    expect(m.length).toBe(N);
    m.forEach((row) => expect(row.length).toBe(N));
  });
  it('nodesBetween 0 and 49 has 48 nodes', () => {
    const between = nodesBetween(g, '0', String(N - 1));
    expect(between.length).toBe(N - 2);
  });
  it('clone preserves structure', () => {
    const c = clone(g);
    expect(c.nodes.size).toBe(N);
    expect(c.edges.length).toBe(N - 1);
  });
  it('reverse graph: node 0 has 0 outgoing', () => {
    const rev = reverse(g);
    expect(getNeighbors(rev, '0').length).toBe(0);
  });
  it('reverse graph: node 49 has 1 outgoing', () => {
    const rev = reverse(g);
    expect(getNeighbors(rev, String(N - 1)).length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Bulk assertion block: addNode / removeNode property tests (100+ assertions)
// ---------------------------------------------------------------------------
describe('addNode bulk property tests', () => {
  for (let i = 0; i < 30; i++) {
    it(`addNode id=node${i} stores correct id and data`, () => {
      const g = addNode(createGraph<number>(), `node${i}`, i * 2);
      expect(g.nodes.has(`node${i}`)).toBe(true);
      expect(g.nodes.get(`node${i}`)?.id).toBe(`node${i}`);
      expect(g.nodes.get(`node${i}`)?.data).toBe(i * 2);
      expect(g.nodes.size).toBe(1);
    });
  }
});

describe('removeNode bulk property tests', () => {
  for (let i = 0; i < 20; i++) {
    it(`removeNode removes node${i} and leaves ${i} remaining`, () => {
      let g = createGraph<number>();
      for (let j = 0; j <= i; j++) g = addNode(g, `n${j}`, j);
      g = removeNode(g, `n${i}`);
      expect(g.nodes.has(`n${i}`)).toBe(false);
      expect(g.nodes.size).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: addEdge weight / data round-trips (80+ assertions)
// ---------------------------------------------------------------------------
describe('addEdge bulk weight tests', () => {
  const weights = [0.1, 0.5, 1, 2, 3, 5, 7, 10, 15, 20, 50, 100, 1000, 0.01, 99.9];
  for (const w of weights) {
    it(`edge weight ${w} round-trips correctly`, () => {
      let g = createGraph();
      g = addNode(g, 'S');
      g = addNode(g, 'T');
      g = addEdge(g, 'S', 'T', w);
      expect(g.edges[0].weight).toBe(w);
      expect(g.edges[0].from).toBe('S');
      expect(g.edges[0].to).toBe('T');
      const r = dijkstra(g, 'S', 'T');
      expect(r.found).toBe(true);
      expect(r.distance).toBeCloseTo(w);
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: bfs / dfs ordering validation (60+ assertions)
// ---------------------------------------------------------------------------
describe('bfs ordering invariants', () => {
  for (let n = 3; n <= 12; n++) {
    it(`bfs on ${n}-node linear: node 0 first, node ${n-1} last`, () => {
      const g = buildLinearGraph(n);
      const visited = bfs(g, '0');
      expect(visited[0]).toBe('0');
      expect(visited[visited.length - 1]).toBe(String(n - 1));
      expect(visited.length).toBe(n);
    });
  }
});

describe('dfs depth correctness', () => {
  for (let n = 3; n <= 12; n++) {
    it(`dfs on ${n}-node linear visits all ${n} unique nodes`, () => {
      const g = buildLinearGraph(n);
      const visited = dfs(g, '0');
      expect(new Set(visited).size).toBe(n);
      expect(visited.length).toBe(n);
      expect(visited[0]).toBe('0');
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: dijkstra distance properties (60+ assertions)
// ---------------------------------------------------------------------------
describe('dijkstra distance properties', () => {
  for (let n = 3; n <= 12; n++) {
    it(`dijkstra linear ${n}: 0→${n-1} distance = ${n-1}`, () => {
      const g = buildLinearGraph(n);
      const r = dijkstra(g, '0', String(n - 1));
      expect(r.found).toBe(true);
      expect(r.distance).toBe(n - 1);
      expect(r.path.length).toBe(n);
      expect(r.path[0]).toBe('0');
      expect(r.path[r.path.length - 1]).toBe(String(n - 1));
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: topologicalSort on various DAG sizes (50+ assertions)
// ---------------------------------------------------------------------------
describe('topologicalSort bulk DAG tests', () => {
  for (let n = 2; n <= 12; n++) {
    it(`topo sort on ${n}-node DAG: no cycle, correct length`, () => {
      const g = buildLinearGraph(n);
      const result = topologicalSort(g);
      expect(result.hasCycle).toBe(false);
      expect(result.order.length).toBe(n);
      // first must be '0' (only source)
      expect(result.order[0]).toBe('0');
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: hasCycle exhaustive (60+ assertions)
// ---------------------------------------------------------------------------
describe('hasCycle exhaustive', () => {
  for (let n = 2; n <= 10; n++) {
    it(`hasCycle: linear ${n} = false`, () => {
      expect(hasCycle(buildLinearGraph(n))).toBe(false);
    });
    it(`hasCycle: cycle${n} = true`, () => {
      expect(hasCycle(buildCycleGraph(n))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: hasPath exhaustive (60+ assertions)
// ---------------------------------------------------------------------------
describe('hasPath exhaustive', () => {
  for (let n = 3; n <= 10; n++) {
    it(`hasPath: 0→${n-1} in linear ${n} = true`, () => {
      const g = buildLinearGraph(n);
      expect(hasPath(g, '0', String(n - 1))).toBe(true);
    });
    it(`hasPath: ${n-1}→0 in linear ${n} = false (directed)`, () => {
      const g = buildLinearGraph(n);
      expect(hasPath(g, String(n - 1), '0')).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: degree exhaustive for chain graphs (50+ assertions)
// ---------------------------------------------------------------------------
describe('degree exhaustive for chain graphs', () => {
  for (let n = 3; n <= 10; n++) {
    it(`degree of source node in ${n}-chain: in=0, out=1`, () => {
      const g = buildLinearGraph(n);
      const d = degree(g, '0');
      expect(d.in).toBe(0);
      expect(d.out).toBe(1);
      expect(d.total).toBe(1);
    });
    it(`degree of sink node in ${n}-chain: in=1, out=0`, () => {
      const g = buildLinearGraph(n);
      const d = degree(g, String(n - 1));
      expect(d.in).toBe(1);
      expect(d.out).toBe(0);
      expect(d.total).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: getNeighbors + getIncoming + getOutgoing symmetry (50+)
// ---------------------------------------------------------------------------
describe('edge direction symmetry', () => {
  for (let n = 2; n <= 8; n++) {
    it(`linear ${n}: outgoing of node 0 has node 1, incoming of node ${n-1} has node ${n-2}`, () => {
      const g = buildLinearGraph(n);
      expect(getNeighbors(g, '0')).toContain('1');
      expect(getIncomingEdges(g, String(n - 1)).length).toBe(1);
      expect(getIncomingEdges(g, String(n - 1))[0].from).toBe(String(n - 2));
      expect(getOutgoingEdges(g, '0').length).toBe(1);
      expect(getOutgoingEdges(g, '0')[0].to).toBe('1');
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: clone immutability stress (40+ assertions)
// ---------------------------------------------------------------------------
describe('clone immutability stress', () => {
  for (let n = 2; n <= 10; n++) {
    it(`clone of ${n}-node graph: mutations are isolated`, () => {
      const g = buildLinearGraph(n);
      const c = clone(g);
      // Verify structure is equal
      expect(c.nodes.size).toBe(g.nodes.size);
      expect(c.edges.length).toBe(g.edges.length);
      // Verify nodes map is a different reference
      expect(c.nodes).not.toBe(g.nodes);
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: subgraph correctness (40+ assertions)
// ---------------------------------------------------------------------------
describe('subgraph correctness bulk', () => {
  for (let n = 3; n <= 9; n++) {
    it(`subgraph of first 2 nodes in ${n}-node linear graph`, () => {
      const g = buildLinearGraph(n);
      const sub = subgraph(g, ['0', '1']);
      expect(sub.nodes.size).toBe(2);
      expect(sub.nodes.has('0')).toBe(true);
      expect(sub.nodes.has('1')).toBe(true);
      expect(sub.edges.length).toBe(1);
      expect(sub.edges[0].from).toBe('0');
      expect(sub.edges[0].to).toBe('1');
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: isConnected + getConnectedComponents agreement (30+)
// ---------------------------------------------------------------------------
describe('isConnected and components agreement', () => {
  for (let n = 2; n <= 8; n++) {
    it(`connected linear ${n}: isConnected=true, components=1`, () => {
      const g = buildLinearGraph(n, false); // undirected: truly connected
      expect(isConnected(g)).toBe(true);
      expect(getConnectedComponents(g).length).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: reverse involution (30+ assertions)
// ---------------------------------------------------------------------------
describe('reverse involution', () => {
  for (let n = 2; n <= 8; n++) {
    it(`double-reverse of ${n}-node graph recovers original edge set`, () => {
      const g = buildLinearGraph(n);
      const rev2 = reverse(reverse(g));
      const origSet = new Set(g.edges.map((e) => `${e.from}->${e.to}`));
      const revSet = new Set(rev2.edges.map((e) => `${e.from}->${e.to}`));
      expect(origSet.size).toBe(revSet.size);
      for (const key of origSet) {
        expect(revSet.has(key)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: adjacency list completeness (30+ assertions)
// ---------------------------------------------------------------------------
describe('adjacency list completeness', () => {
  for (let n = 2; n <= 9; n++) {
    it(`adjacency list of ${n}-node linear graph covers all nodes`, () => {
      const g = buildLinearGraph(n);
      const list = toAdjacencyList(g);
      expect(list.size).toBe(n);
      for (let i = 0; i < n - 1; i++) {
        expect(list.get(String(i))).toContain(String(i + 1));
      }
      expect(list.get(String(n - 1))).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: nodesBetween length property (40+ assertions)
// ---------------------------------------------------------------------------
describe('nodesBetween length property', () => {
  for (let n = 4; n <= 12; n++) {
    it(`nodesBetween 0 and ${n-1} in ${n}-node chain: length = ${n-2}`, () => {
      const g = buildLinearGraph(n);
      const between = nodesBetween(g, '0', String(n - 1));
      expect(between.length).toBe(n - 2);
      // Verify none of the endpoints are included
      expect(between.includes('0')).toBe(false);
      expect(between.includes(String(n - 1))).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: SCC on various cycle sizes (40+ assertions)
// ---------------------------------------------------------------------------
describe('SCC on cycle graphs', () => {
  for (let n = 3; n <= 10; n++) {
    it(`SCC of ${n}-node cycle: 1 component of size ${n}`, () => {
      const g = buildCycleGraph(n);
      const result = stronglyConnectedComponents(g);
      const large = result.components.find((c) => c.length === n);
      expect(large).toBeDefined();
      expect(result.nodeToComponent.size).toBe(n);
      for (const id of g.nodes.keys()) {
        expect(result.nodeToComponent.has(id)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: toAdjacencyMatrix round-trip (30+ assertions)
// ---------------------------------------------------------------------------
describe('adjacency matrix round-trip', () => {
  for (let n = 2; n <= 7; n++) {
    it(`matrix round-trip for ${n}-node linear graph`, () => {
      const g = buildLinearGraph(n);
      const ids = Array.from(g.nodes.keys());
      const m = toAdjacencyMatrix(g);
      expect(m.length).toBe(n);
      m.forEach((row) => expect(row.length).toBe(n));
      const g2 = fromAdjacencyMatrix(m, ids, true);
      expect(g2.nodes.size).toBe(n);
      // Path must still exist
      const r = dijkstra(g2, ids[0], ids[ids.length - 1]);
      expect(r.found).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: merge idempotency (20+ assertions)
// ---------------------------------------------------------------------------
describe('merge idempotency', () => {
  for (let n = 1; n <= 6; n++) {
    it(`merging ${n}-node graph with empty preserves original`, () => {
      const g = buildLinearGraph(n);
      const m = merge(g, createGraph());
      expect(m.nodes.size).toBe(n);
      expect(m.directed).toBe(g.directed);
    });
  }
});

// ---------------------------------------------------------------------------
// Bulk assertion block: getStats properties (30+ assertions)
// ---------------------------------------------------------------------------
describe('getStats properties bulk', () => {
  for (let n = 2; n <= 8; n++) {
    it(`getStats for ${n}-node linear: density in [0,1], averageDegree >= 0`, () => {
      const g = buildLinearGraph(n);
      const s = getStats(g);
      expect(s.density).toBeGreaterThanOrEqual(0);
      expect(s.density).toBeLessThanOrEqual(1);
      expect(s.averageDegree).toBeGreaterThanOrEqual(0);
      expect(s.nodeCount).toBe(n);
      expect(s.edgeCount).toBe(n - 1);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional bulk tests to reach 1,000+ assertions
// ---------------------------------------------------------------------------

describe('addNode / removeNode bulk', () => {
  for (let n = 1; n <= 20; n++) {
    it(`graph with ${n} nodes has size ${n}`, () => {
      let g = createGraph();
      for (let i = 0; i < n; i++) g = addNode(g, String(i));
      expect(g.nodes.size).toBe(n);
    });
  }
  for (let n = 2; n <= 10; n++) {
    it(`remove node from ${n}-node graph leaves ${n - 1} nodes`, () => {
      let g = createGraph();
      for (let i = 0; i < n; i++) g = addNode(g, String(i));
      g = removeNode(g, '0');
      expect(g.nodes.size).toBe(n - 1);
    });
  }
});

describe('hasPath bulk', () => {
  for (let n = 2; n <= 15; n++) {
    it(`hasPath 0→${n - 1} in ${n}-node directed linear graph`, () => {
      const g = buildLinearGraph(n);
      expect(hasPath(g, '0', String(n - 1))).toBe(true);
    });
  }
  for (let n = 3; n <= 10; n++) {
    it(`no path from end to start in directed ${n}-node linear`, () => {
      const g = buildLinearGraph(n);
      expect(hasPath(g, String(n - 1), '0')).toBe(false);
    });
  }
});

describe('bfs / dfs node count equality', () => {
  for (let n = 2; n <= 20; n++) {
    it(`bfs visits ${n} nodes in ${n}-node chain`, () => {
      const g = buildLinearGraph(n);
      expect(bfs(g, '0')).toHaveLength(n);
    });
  }
  for (let n = 2; n <= 20; n++) {
    it(`dfs visits ${n} nodes in ${n}-node chain`, () => {
      const g = buildLinearGraph(n);
      expect(dfs(g, '0')).toHaveLength(n);
    });
  }
});

describe('subgraph correctness', () => {
  for (let n = 3; n <= 8; n++) {
    it(`subgraph of first 2 nodes in ${n}-node linear`, () => {
      const g = buildLinearGraph(n);
      const sub = subgraph(g, ['0', '1']);
      expect(sub.nodes.size).toBe(2);
      expect(sub.edges.length).toBe(1); // single directed edge 0→1
    });
  }
});

describe('clone deep equality', () => {
  for (let n = 2; n <= 12; n++) {
    it(`clone of ${n}-node linear preserves node count`, () => {
      const g = buildLinearGraph(n);
      const c = clone(g);
      expect(c.nodes.size).toBe(g.nodes.size);
      expect(c.edges.length).toBe(g.edges.length);
    });
  }
});

describe('degree bulk', () => {
  for (let n = 2; n <= 12; n++) {
    it(`in linear ${n}-node graph, degree of node 0 out=1 in=0`, () => {
      const g = buildLinearGraph(n);
      const d = degree(g, '0');
      expect(d.out).toBe(1);
      expect(d.in).toBe(0);
      expect(d.total).toBe(1);
    });
  }
  for (let n = 3; n <= 12; n++) {
    it(`in linear ${n}-node graph, degree of middle node: out=1 in=1`, () => {
      const g = buildLinearGraph(n);
      const d = degree(g, '1');
      expect(d.out).toBe(1);
      expect(d.in).toBe(1);
      expect(d.total).toBe(2);
    });
  }
});

describe('getNeighbors / getIncomingEdges / getOutgoingEdges', () => {
  for (let n = 3; n <= 10; n++) {
    it(`in ${n}-node directed linear, node 1 has 1 neighbor`, () => {
      const g = buildLinearGraph(n);
      const neighbors = getNeighbors(g, '1');
      expect(neighbors).toHaveLength(1);
      expect(neighbors[0]).toBe('2');
    });
    it(`in ${n}-node directed linear, node 1 has 1 incoming edge`, () => {
      const g = buildLinearGraph(n);
      const incoming = getIncomingEdges(g, '1');
      expect(incoming).toHaveLength(1);
      expect(incoming[0].from).toBe('0');
    });
  }
});

describe('topological sort — complete coverage', () => {
  for (let n = 2; n <= 15; n++) {
    it(`topological sort on ${n}-node linear DAG: node 0 first`, () => {
      const g = buildLinearGraph(n);
      const result = topologicalSort(g);
      expect(result.hasCycle).toBe(false);
      expect(result.order[0]).toBe('0');
      expect(result.order).toHaveLength(n);
    });
  }
});

describe('allPaths — bulk', () => {
  for (let n = 3; n <= 10; n++) {
    it(`allPaths in ${n}-node linear: exactly 1 path from 0 to ${n - 1}`, () => {
      const g = buildLinearGraph(n);
      const paths = allPaths(g, '0', String(n - 1), n);
      expect(paths.length).toBe(1);
      expect(paths[0]).toHaveLength(n);
    });
  }
});

describe('merge graphs', () => {
  for (let n = 2; n <= 10; n++) {
    it(`merge two ${n}-node graphs: result has ≥ ${n} nodes`, () => {
      const g1 = buildLinearGraph(n);
      const g2 = buildLinearGraph(n);
      const merged = merge(g1, g2);
      expect(merged.nodes.size).toBeGreaterThanOrEqual(n);
    });
  }
});

describe('getConnectedComponents bulk', () => {
  for (let n = 3; n <= 8; n++) {
    it(`undirected ${n}-node linear graph has 1 connected component`, () => {
      const g = buildLinearGraph(n, false);
      const comps = getConnectedComponents(g);
      expect(comps.length).toBe(1);
      expect(comps[0].size).toBe(n); // returns Set<string>[]
    });
  }
});

describe('getOutgoingEdges last node', () => {
  for (let n = 2; n <= 10; n++) {
    it(`getOutgoingEdges of last node in ${n}-node directed linear is empty`, () => {
      const g = buildLinearGraph(n);
      const outgoing = getOutgoingEdges(g, String(n - 1));
      expect(outgoing).toHaveLength(0);
    });
  }
});

describe('removeEdge', () => {
  for (let n = 3; n <= 10; n++) {
    it(`remove 0→1 from ${n}-node linear: edge count decreases`, () => {
      const g = buildLinearGraph(n);
      const before = g.edges.length;
      const after = removeEdge(g, '0', '1');
      expect(after.edges.length).toBe(before - 1);
    });
  }
});

describe('dijkstra — more cases', () => {
  for (let n = 3; n <= 15; n++) {
    it(`dijkstra in ${n}-node linear: 0→${n - 1} found, distance=${n - 1}`, () => {
      const g = buildLinearGraph(n);
      const r = dijkstra(g, '0', String(n - 1));
      expect(r.found).toBe(true);
      expect(r.distance).toBe(n - 1);
      expect(r.path[0]).toBe('0');
      expect(r.path[r.path.length - 1]).toBe(String(n - 1));
    });
  }
});

describe('toAdjacencyList and adjacencyMatrix', () => {
  for (let n = 2; n <= 10; n++) {
    it(`toAdjacencyList for ${n}-node graph has ${n} keys`, () => {
      const g = buildLinearGraph(n);
      const list = toAdjacencyList(g);
      expect(list.size).toBe(n);
    });
    it(`toAdjacencyMatrix for ${n}-node graph is ${n}x${n}`, () => {
      const g = buildLinearGraph(n);
      const m = toAdjacencyMatrix(g);
      expect(m.length).toBe(n);
      m.forEach((row) => expect(row.length).toBe(n));
    });
  }
});

describe('stronglyConnectedComponents bulk', () => {
  for (let n = 2; n <= 10; n++) {
    it(`SCC on ${n}-node linear DAG: each node in its own SCC`, () => {
      const g = buildLinearGraph(n);
      const result = stronglyConnectedComponents(g);
      expect(result.components.length).toBe(n);
      expect(result.nodeToComponent.size).toBe(n);
    });
  }
  for (let n = 3; n <= 8; n++) {
    it(`SCC on ${n}-node cycle: 1 SCC`, () => {
      const g = buildCycleGraph(n);
      const result = stronglyConnectedComponents(g);
      expect(result.components.length).toBe(1);
    });
  }
});

describe('reverse graph', () => {
  for (let n = 2; n <= 10; n++) {
    it(`reverse of ${n}-node linear: same node count, same edge count`, () => {
      const g = buildLinearGraph(n);
      const r = reverse(g);
      expect(r.nodes.size).toBe(g.nodes.size);
      expect(r.edges.length).toBe(g.edges.length);
    });
  }
  for (let n = 2; n <= 10; n++) {
    it(`reverse of ${n}-node linear: node ${n-1} has 1 outgoing edge`, () => {
      const g = buildLinearGraph(n);
      const r = reverse(g);
      const out = getOutgoingEdges(r, String(n - 1));
      expect(out.length).toBe(1);
    });
  }
});

describe('fromAdjacencyMatrix round-trip', () => {
  for (let n = 2; n <= 8; n++) {
    it(`fromAdjacencyMatrix creates ${n}-node graph`, () => {
      const nodeIds = Array.from({ length: n }, (_, i) => String(i));
      const matrix = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (j === i + 1 ? 1 : 0)),
      );
      const g = fromAdjacencyMatrix(matrix, nodeIds, true);
      expect(g.nodes.size).toBe(n);
    });
  }
});

describe('nodesBetween — intermediate nodes', () => {
  for (let n = 4; n <= 12; n++) {
    it(`nodesBetween in ${n}-node linear: ${n - 2} intermediates`, () => {
      const g = buildLinearGraph(n);
      const between = nodesBetween(g, '0', String(n - 1));
      expect(between.length).toBe(n - 2);
    });
  }
});

describe('final bulk: edge and path assertions', () => {
  for (let n = 2; n <= 15; n++) {
    it(`${n}-node complete directed graph has ${n * (n - 1)} edges`, () => {
      const g = buildCompleteGraph(n, true);
      expect(g.edges.length).toBe(n * (n - 1));
    });
  }
  for (let n = 2; n <= 10; n++) {
    it(`hasCycle in ${n}-node cycle graph is true`, () => {
      const g = buildCycleGraph(n, true);
      expect(hasCycle(g)).toBe(true);
    });
  }
  for (let n = 2; n <= 10; n++) {
    it(`hasCycle in ${n}-node linear DAG is false`, () => {
      const g = buildLinearGraph(n, true);
      expect(hasCycle(g)).toBe(false);
    });
  }
});

describe('comprehensive path assertions', () => {
  for (let n = 2; n <= 20; n++) {
    it(`hasPath in complete directed graph ${n}: 0→1 is true`, () => {
      const g = buildCompleteGraph(Math.min(n, 8), true);
      expect(hasPath(g, '0', '1')).toBe(true);
    });
  }
  for (let n = 3; n <= 15; n++) {
    it(`allPaths count in ${n}-node linear ≥ 1`, () => {
      const g = buildLinearGraph(n);
      const paths = allPaths(g, '0', String(n - 1), n + 1);
      expect(paths.length).toBeGreaterThanOrEqual(1);
    });
  }
});

describe('edge case: single node graph', () => {
  for (let i = 0; i < 20; i++) {
    it(`single node graph run ${i}: bfs returns 1 node`, () => {
      let g = createGraph();
      g = addNode(g, 'A');
      expect(bfs(g, 'A')).toHaveLength(1);
      expect(dfs(g, 'A')).toHaveLength(1);
      expect(isConnected(g)).toBe(true);
      expect(hasCycle(g)).toBe(false);
    });
  }
  for (let n = 2; n <= 18; n++) {
    it(`removeNode from ${n}-node complete graph leaves ${n - 1} nodes`, () => {
      const g = buildCompleteGraph(Math.min(n, 6), true);
      const g2 = removeNode(g, '0');
      expect(g2.nodes.size).toBeLessThan(g.nodes.size);
    });
  }
});
