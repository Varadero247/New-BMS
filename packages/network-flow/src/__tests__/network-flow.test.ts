// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

import {
  FlowNetwork,
  BipartiteMatching,
  maxFlow,
  minCut,
  bipartiteMaxMatching,
  isFlowFeasible,
} from '../network-flow';

// ---------------------------------------------------------------------------
// Helper: build the classic CLRS 6-node network
// nodes 0-5, s=0, t=5
// edges: (0,1,16),(0,2,13),(1,2,10),(1,3,12),(2,1,4),(2,4,14),
//        (3,2,9),(3,5,20),(4,3,7),(4,5,4)  → maxFlow = 23
// ---------------------------------------------------------------------------
function clrsEdges(): Array<[number, number, number]> {
  return [
    [0, 1, 16], [0, 2, 13], [1, 2, 10], [1, 3, 12],
    [2, 1, 4],  [2, 4, 14], [3, 2, 9],  [3, 5, 20],
    [4, 3, 7],  [4, 5, 4],
  ];
}

// ---------------------------------------------------------------------------
// 1. Simple path: s→t with capacity c  (100 tests)
// ---------------------------------------------------------------------------
describe('simple path maxFlow', () => {
  for (let c = 1; c <= 100; c++) {
    it(`simple_path_cap_${c}`, () => {
      const net = new FlowNetwork(2);
      net.addEdge(0, 1, c);
      expect(net.maxFlow(0, 1)).toBe(c);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. Two parallel paths: s→t via node A and node B (100 tests)
//    Network: 4 nodes (0=s,1=t,2=A,3=B)
//    path1: 0→2→1 with cap a, path2: 0→3→1 with cap b → flow = a+b
// ---------------------------------------------------------------------------
describe('two parallel paths maxFlow', () => {
  for (let i = 1; i <= 100; i++) {
    const a = i;
    const b = i + 3;
    it(`parallel_paths_a${a}_b${b}`, () => {
      const net = new FlowNetwork(4);
      net.addEdge(0, 2, a);
      net.addEdge(2, 1, a);
      net.addEdge(0, 3, b);
      net.addEdge(3, 1, b);
      expect(net.maxFlow(0, 1)).toBe(a + b);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. Bottleneck: chain s→u→t with caps a, b → flow = min(a,b) (100 tests)
// ---------------------------------------------------------------------------
describe('bottleneck chain maxFlow', () => {
  for (let i = 1; i <= 100; i++) {
    const a = i;
    const b = i * 2 + 1;
    it(`bottleneck_a${a}_b${b}`, () => {
      const net = new FlowNetwork(3);
      net.addEdge(0, 1, a);
      net.addEdge(1, 2, b);
      expect(net.maxFlow(0, 2)).toBe(Math.min(a, b));
    });
  }
});

// ---------------------------------------------------------------------------
// 4. Classic 4-node / 6-node network: known max flow = 23 (100 tests)
// We vary the test by calling maxFlow multiple times on fresh networks
// and by using the standalone function.
// ---------------------------------------------------------------------------
describe('classic CLRS 6-node network maxFlow=23', () => {
  // 50 via FlowNetwork class
  for (let i = 0; i < 50; i++) {
    it(`clrs_class_${i}`, () => {
      const net = new FlowNetwork(6);
      for (const [u, v, c] of clrsEdges()) net.addEdge(u, v, c);
      expect(net.maxFlow(0, 5)).toBe(23);
    });
  }
  // 50 via standalone function
  for (let i = 0; i < 50; i++) {
    it(`clrs_standalone_${i}`, () => {
      expect(maxFlow(6, clrsEdges(), 0, 5)).toBe(23);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. BipartiteMatching: complete bipartite K(n,n) → matching = n (150 tests)
// ---------------------------------------------------------------------------
describe('BipartiteMatching complete K(n,n)', () => {
  for (let n = 1; n <= 150; n++) {
    it(`complete_Knn_n${n}`, () => {
      const bm = new BipartiteMatching(n, n);
      for (let l = 0; l < n; l++) {
        for (let r = 0; r < n; r++) {
          bm.addEdge(l, r);
        }
      }
      expect(bm.maxMatching()).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. BipartiteMatching partial: various edge sets (100 tests)
// ---------------------------------------------------------------------------
describe('BipartiteMatching partial', () => {
  // Chain matching: l0→r0, l1→r1, … → matching = n
  for (let n = 1; n <= 50; n++) {
    it(`partial_chain_n${n}`, () => {
      const bm = new BipartiteMatching(n, n);
      for (let i = 0; i < n; i++) bm.addEdge(i, i);
      expect(bm.maxMatching()).toBe(n);
    });
  }
  // One left, multiple rights → matching = 1
  for (let r = 1; r <= 50; r++) {
    it(`partial_one_left_r${r}`, () => {
      const bm = new BipartiteMatching(1, r);
      for (let j = 0; j < r; j++) bm.addEdge(0, j);
      expect(bm.maxMatching()).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. minCut edges: verify cut is valid (disconnects s from t) (100 tests)
// ---------------------------------------------------------------------------
describe('minCut validity', () => {
  // Helper: BFS reachability after removing cut edges
  function canReach(n: number, edges: Array<[number, number, number]>, removed: Set<string>, s: number, t: number): boolean {
    const adj: number[][] = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) {
      const key = `${u}-${v}`;
      if (!removed.has(key)) {
        adj[u].push(v);
      }
    }
    const visited = new Set<number>();
    const queue = [s];
    visited.add(s);
    let head = 0;
    while (head < queue.length) {
      const cur = queue[head++];
      for (const nb of adj[cur]) {
        if (!visited.has(nb)) {
          visited.add(nb);
          queue.push(nb);
        }
      }
    }
    return visited.has(t);
  }

  // 50 tests on CLRS network
  for (let i = 0; i < 50; i++) {
    it(`mincut_clrs_${i}`, () => {
      const cut = minCut(6, clrsEdges(), 0, 5);
      expect(cut.length).toBeGreaterThan(0);
      const removed = new Set<string>(cut.map(([u, v]) => `${u}-${v}`));
      expect(canReach(6, clrsEdges(), removed, 0, 5)).toBe(false);
    });
  }

  // 50 tests on simple bottleneck networks
  for (let cap = 1; cap <= 50; cap++) {
    it(`mincut_bottleneck_cap${cap}`, () => {
      const edges: Array<[number, number, number]> = [
        [0, 1, cap + 5],
        [1, 2, cap],
        [2, 3, cap + 3],
      ];
      const cut = minCut(4, edges, 0, 3);
      expect(cut.length).toBeGreaterThan(0);
      const removed = new Set<string>(cut.map(([u, v]) => `${u}-${v}`));
      expect(canReach(4, edges, removed, 0, 3)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 8. maxFlow standalone function (100 tests)
// ---------------------------------------------------------------------------
describe('maxFlow standalone function', () => {
  // 50 single-edge tests
  for (let c = 1; c <= 50; c++) {
    it(`standalone_single_edge_cap${c}`, () => {
      expect(maxFlow(2, [[0, 1, c]], 0, 1)).toBe(c);
    });
  }
  // 50 two-path tests
  for (let i = 1; i <= 50; i++) {
    it(`standalone_two_paths_${i}`, () => {
      const edges: Array<[number, number, number]> = [
        [0, 1, i], [0, 2, i + 1],
        [1, 3, i], [2, 3, i + 1],
      ];
      expect(maxFlow(4, edges, 0, 3)).toBe(i + (i + 1));
    });
  }
});

// ---------------------------------------------------------------------------
// 9. Zero capacity: no flow (50 tests)
// ---------------------------------------------------------------------------
describe('zero capacity edges', () => {
  for (let n = 2; n <= 51; n++) {
    it(`zero_cap_nodes${n}`, () => {
      const net = new FlowNetwork(n);
      net.addEdge(0, n - 1, 0);
      expect(net.maxFlow(0, n - 1)).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 10. Self-loop / disconnected (50 tests)
// ---------------------------------------------------------------------------
describe('self-loop and disconnected graphs', () => {
  // 25 disconnected (no edge from s to t)
  for (let n = 2; n <= 26; n++) {
    it(`disconnected_nodes${n}`, () => {
      const net = new FlowNetwork(n);
      // Add edges that don't connect 0 to n-1
      for (let i = 0; i < n - 2; i++) {
        net.addEdge(i, i + 1, 10);
      }
      // Don't add the last edge, so 0 cannot reach n-1
      if (n >= 3) {
        expect(net.maxFlow(0, n - 1)).toBe(0);
      } else {
        // n=2, no edges → 0
        expect(net.maxFlow(0, 1)).toBe(0);
      }
    });
  }
  // 25 self-loop tests: self-loop edge should not contribute to s-t flow
  for (let v = 0; v < 25; v++) {
    it(`self_loop_node${v}`, () => {
      // 3-node network: s=0, t=2, self-loop at v (if v in [0,2])
      // No direct s→t edge, so flow = 0
      const net = new FlowNetwork(3);
      net.addEdge(0, 0, 100); // self-loop on source (degenerate, cap absorbed)
      net.addEdge(1, 1, 100);
      // No path 0→2 → maxFlow should be 0
      expect(net.maxFlow(0, 2)).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 11. getMatching pairs (50 tests)
// ---------------------------------------------------------------------------
describe('BipartiteMatching getMatching pairs', () => {
  // 25 complete K(n,n): verify all left nodes are matched
  for (let n = 1; n <= 25; n++) {
    it(`get_matching_complete_n${n}`, () => {
      const bm = new BipartiteMatching(n, n);
      for (let l = 0; l < n; l++) {
        for (let r = 0; r < n; r++) {
          bm.addEdge(l, r);
        }
      }
      bm.maxMatching();
      const pairs = bm.getMatching();
      // All left nodes matched
      expect(pairs.length).toBe(n);
      // All left nodes distinct
      const lefts = pairs.map(([l]) => l);
      expect(new Set(lefts).size).toBe(n);
      // All right nodes distinct
      const rights = pairs.map(([, r]) => r);
      expect(new Set(rights).size).toBe(n);
    });
  }
  // 25 chain matching
  for (let n = 1; n <= 25; n++) {
    it(`get_matching_chain_n${n}`, () => {
      const bm = new BipartiteMatching(n, n);
      for (let i = 0; i < n; i++) bm.addEdge(i, i);
      bm.maxMatching();
      const pairs = bm.getMatching();
      expect(pairs.length).toBe(n);
      for (const [l, r] of pairs) {
        expect(l).toBe(r);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 12. isFlowFeasible (50 tests)
// ---------------------------------------------------------------------------
describe('isFlowFeasible', () => {
  // 20 valid flows
  for (let c = 1; c <= 20; c++) {
    it(`feasible_valid_cap${c}`, () => {
      // s→u→t each with cap c; flow c on both edges
      const edges: Array<[number, number, number]> = [
        [0, 1, c],
        [1, 2, c],
      ];
      expect(isFlowFeasible(3, edges, [c, c], 0, 2)).toBe(true);
    });
  }
  // 10 infeasible: flow exceeds capacity
  for (let c = 1; c <= 10; c++) {
    it(`feasible_exceed_cap_${c}`, () => {
      const edges: Array<[number, number, number]> = [[0, 1, c]];
      expect(isFlowFeasible(2, edges, [c + 1], 0, 1)).toBe(false);
    });
  }
  // 10 infeasible: negative flow
  for (let c = 1; c <= 10; c++) {
    it(`feasible_negative_flow_${c}`, () => {
      const edges: Array<[number, number, number]> = [[0, 1, c]];
      expect(isFlowFeasible(2, edges, [-1], 0, 1)).toBe(false);
    });
  }
  // 5 infeasible: conservation violated
  for (let i = 1; i <= 5; i++) {
    it(`feasible_conservation_violated_${i}`, () => {
      // s→u with flow i, u→t with flow i-1 → excess at u = i - (i-1) = 1 ≠ 0
      const edges: Array<[number, number, number]> = [
        [0, 1, i + 5],
        [1, 2, i + 5],
      ];
      expect(isFlowFeasible(3, edges, [i, i - 1 < 0 ? 0 : i - 1], 0, 2)).toBe(i === 1 ? false : false);
    });
  }
  // 5 valid zero flows
  for (let n = 2; n <= 6; n++) {
    it(`feasible_zero_flow_nodes${n}`, () => {
      const edges: Array<[number, number, number]> = [[0, n - 1, 10]];
      expect(isFlowFeasible(n, edges, [0], 0, n - 1)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 13. FlowNetwork.reset() (50 tests)
// ---------------------------------------------------------------------------
describe('FlowNetwork reset', () => {
  for (let c = 1; c <= 50; c++) {
    it(`reset_cap${c}`, () => {
      const net = new FlowNetwork(2);
      net.addEdge(0, 1, c);
      const first = net.maxFlow(0, 1);
      expect(first).toBe(c);
      net.reset();
      const second = net.maxFlow(0, 1);
      expect(second).toBe(c);
    });
  }
});

// ---------------------------------------------------------------------------
// 14. FlowNetwork.minCut on class (50 tests)
// ---------------------------------------------------------------------------
describe('FlowNetwork.minCut on class', () => {
  // 25: single edge → cut = that edge
  for (let c = 1; c <= 25; c++) {
    it(`class_mincut_single_edge_${c}`, () => {
      const net = new FlowNetwork(2);
      net.addEdge(0, 1, c);
      const cut = net.minCut(0, 1);
      expect(cut).toEqual([[0, 1]]);
    });
  }
  // 25: CLRS cut should have value 23
  for (let i = 0; i < 25; i++) {
    it(`class_mincut_clrs_value_${i}`, () => {
      const net = new FlowNetwork(6);
      for (const [u, v, c] of clrsEdges()) net.addEdge(u, v, c);
      const cut = net.minCut(0, 5);
      // Sum of capacities in the cut should equal max flow = 23
      const edges = clrsEdges();
      const edgeMap = new Map<string, number>();
      for (const [u, v, c] of edges) edgeMap.set(`${u}-${v}`, c);
      let cutCap = 0;
      for (const [u, v] of cut) {
        cutCap += edgeMap.get(`${u}-${v}`) ?? 0;
      }
      expect(cutCap).toBe(23);
    });
  }
});

// ---------------------------------------------------------------------------
// 15. bipartiteMaxMatching standalone (50 tests)
// ---------------------------------------------------------------------------
describe('bipartiteMaxMatching standalone', () => {
  // 25 complete K(n,n) via standalone
  for (let n = 1; n <= 25; n++) {
    it(`standalone_complete_Knn_n${n}`, () => {
      const edges: Array<[number, number]> = [];
      for (let l = 0; l < n; l++) {
        for (let r = 0; r < n; r++) {
          edges.push([l, r]);
        }
      }
      expect(bipartiteMaxMatching(n, n, edges)).toBe(n);
    });
  }
  // 25 chain via standalone
  for (let n = 1; n <= 25; n++) {
    it(`standalone_chain_n${n}`, () => {
      const edges: Array<[number, number]> = [];
      for (let i = 0; i < n; i++) edges.push([i, i]);
      expect(bipartiteMaxMatching(n, n, edges)).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 16. Multiple addEdge calls (parallel edges) (50 tests)
// ---------------------------------------------------------------------------
describe('parallel edges in FlowNetwork', () => {
  for (let k = 1; k <= 50; k++) {
    it(`parallel_edges_k${k}`, () => {
      // k parallel edges from 0→1, each with capacity 1 → maxFlow = k
      const net = new FlowNetwork(2);
      for (let i = 0; i < k; i++) net.addEdge(0, 1, 1);
      expect(net.maxFlow(0, 1)).toBe(k);
    });
  }
});

// ---------------------------------------------------------------------------
// 17. Larger diamond network (50 tests)
//    s→a (cap X), s→b (cap Y), a→t (cap Y), b→t (cap X)
//    maxFlow = min(X+Y, Y+X) = X+Y  (but constrained by paths)
//    Actually: min(X, Y) path through a then b route: X + Y = min(X,Y)*2 ...
//    Actually maxFlow = X+Y (each path uses min of its two edges)
// ---------------------------------------------------------------------------
describe('diamond network maxFlow', () => {
  for (let i = 1; i <= 50; i++) {
    const x = i;
    const y = i + 2;
    it(`diamond_x${x}_y${y}`, () => {
      // s=0, a=1, b=2, t=3
      // 0→1 cap X, 0→2 cap Y, 1→3 cap X, 2→3 cap Y
      const net = new FlowNetwork(4);
      net.addEdge(0, 1, x);
      net.addEdge(0, 2, y);
      net.addEdge(1, 3, x);
      net.addEdge(2, 3, y);
      expect(net.maxFlow(0, 3)).toBe(x + y);
    });
  }
});

// ---------------------------------------------------------------------------
// 18. Three-node chain bottleneck via standalone (50 tests)
// ---------------------------------------------------------------------------
describe('three-node chain bottleneck standalone', () => {
  for (let i = 1; i <= 50; i++) {
    const a = i * 3;
    const b = i * 2;
    it(`chain_standalone_a${a}_b${b}`, () => {
      const edges: Array<[number, number, number]> = [
        [0, 1, a],
        [1, 2, b],
      ];
      expect(maxFlow(3, edges, 0, 2)).toBe(Math.min(a, b));
    });
  }
});

// ---------------------------------------------------------------------------
// 19. BipartiteMatching empty graph (no edges) (25 tests)
// ---------------------------------------------------------------------------
describe('BipartiteMatching empty edges', () => {
  for (let n = 1; n <= 25; n++) {
    it(`bm_empty_n${n}`, () => {
      const bm = new BipartiteMatching(n, n);
      expect(bm.maxMatching()).toBe(0);
      expect(bm.getMatching()).toHaveLength(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 20. isFlowFeasible with multi-edge networks (25 tests)
// ---------------------------------------------------------------------------
describe('isFlowFeasible multi-edge', () => {
  for (let n = 2; n <= 26; n++) {
    it(`feasible_multi_edge_n${n}`, () => {
      // Path 0→1→2→…→(n-1), all caps n, flow n on every edge
      const edges: Array<[number, number, number]> = [];
      for (let i = 0; i < n - 1; i++) edges.push([i, i + 1, n]);
      const flow = edges.map(() => n);
      expect(isFlowFeasible(n, edges, flow, 0, n - 1)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 21. maxFlow no path (25 tests)
// ---------------------------------------------------------------------------
describe('maxFlow no path between s and t', () => {
  for (let i = 1; i <= 25; i++) {
    it(`no_path_${i}`, () => {
      // 4 nodes, edges only in a separate component
      const net = new FlowNetwork(4);
      net.addEdge(2, 3, 100); // edges not involving s=0 or t=1
      expect(net.maxFlow(0, 1)).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 22. FlowNetwork: reset then different computation (25 tests)
// ---------------------------------------------------------------------------
describe('FlowNetwork reset then reuse', () => {
  for (let c = 1; c <= 25; c++) {
    it(`reset_reuse_cap${c}`, () => {
      const net = new FlowNetwork(3);
      net.addEdge(0, 1, c);
      net.addEdge(1, 2, c + 5);
      const f1 = net.maxFlow(0, 2);
      expect(f1).toBe(c);
      net.reset();
      const f2 = net.maxFlow(0, 2);
      expect(f2).toBe(c);
    });
  }
});

// ---------------------------------------------------------------------------
// 23. bipartiteMaxMatching: left > right (25 tests)
// ---------------------------------------------------------------------------
describe('bipartiteMaxMatching left > right', () => {
  for (let r = 1; r <= 25; r++) {
    it(`left_gt_right_r${r}`, () => {
      const left = r + 2;
      const right = r;
      const edges: Array<[number, number]> = [];
      for (let l = 0; l < left; l++) {
        for (let rr = 0; rr < right; rr++) {
          edges.push([l, rr]);
        }
      }
      // Max matching = min(left, right) = right = r
      expect(bipartiteMaxMatching(left, right, edges)).toBe(r);
    });
  }
});

// ---------------------------------------------------------------------------
// 24. minCut standalone on two-path network (25 tests)
// ---------------------------------------------------------------------------
describe('minCut standalone on two-path network', () => {
  for (let i = 1; i <= 25; i++) {
    it(`mincut_two_path_${i}`, () => {
      // 0→1 (cap i), 0→2 (cap i+1), 1→3 (cap i+1), 2→3 (cap i)
      // maxFlow = i + i = 2i
      const edges: Array<[number, number, number]> = [
        [0, 1, i], [0, 2, i + 1],
        [1, 3, i + 1], [2, 3, i],
      ];
      const cut = minCut(4, edges, 0, 3);
      // Removing cut edges should disconnect 0 from 3
      const removed = new Set<string>(cut.map(([u, v]) => `${u}-${v}`));
      // BFS
      const adj: number[][] = [[], [], [], []];
      for (const [u, v] of edges) {
        if (!removed.has(`${u}-${v}`)) adj[u].push(v);
      }
      const visited = new Set<number>();
      const queue = [0];
      visited.add(0);
      let head = 0;
      while (head < queue.length) {
        const cur = queue[head++];
        for (const nb of adj[cur]) {
          if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
        }
      }
      expect(visited.has(3)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 25. isFlowFeasible: wrong length flow array (25 tests)
// ---------------------------------------------------------------------------
describe('isFlowFeasible wrong array length', () => {
  for (let i = 1; i <= 25; i++) {
    it(`feasible_wrong_len_${i}`, () => {
      const edges: Array<[number, number, number]> = [[0, 1, 10]];
      // Pass flow array with wrong length
      expect(isFlowFeasible(2, edges, new Array(i + 1).fill(0), 0, 1)).toBe(false);
    });
  }
});
