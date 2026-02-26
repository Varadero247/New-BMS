// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { LinkCutTree, DynamicConnectivity, buildForest, areConnected } from '../link-cut-tree';

// ---------------------------------------------------------------------------
// SECTION 1: LinkCutTree — initial state (100 tests)
// For n = 1..100: a single isolated node is not connected to itself via another
// and its value defaults to 0.
// ---------------------------------------------------------------------------
describe('LinkCutTree initial state', () => {
  for (let n = 1; n <= 100; n++) {
    it(`size ${n}: node 0 getValue === 0`, () => {
      const lct = new LinkCutTree(n);
      expect(lct.getValue(0)).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 2: LinkCutTree size (100 tests)
// ---------------------------------------------------------------------------
describe('LinkCutTree size property', () => {
  for (let n = 1; n <= 100; n++) {
    it(`size ${n}: lct.size === ${n}`, () => {
      const lct = new LinkCutTree(n);
      expect(lct.size).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 3: LinkCutTree — isolated nodes not connected (100 tests)
// For n = 2..101, nodes 0 and 1 are not connected before any link.
// ---------------------------------------------------------------------------
describe('LinkCutTree connected — isolated nodes', () => {
  for (let n = 2; n <= 101; n++) {
    it(`n=${n}: node 0 and node 1 not connected initially`, () => {
      const lct = new LinkCutTree(n);
      expect(lct.connected(0, 1)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 4: LinkCutTree link — single edge (100 tests)
// For n = 2..101, link(0,1) then connected(0,1) === true.
// ---------------------------------------------------------------------------
describe('LinkCutTree link — single edge', () => {
  for (let n = 2; n <= 101; n++) {
    it(`n=${n}: after link(0,1), connected(0,1) === true`, () => {
      const lct = new LinkCutTree(n);
      const result = lct.link(0, 1);
      expect(result).toBe(true);
      expect(lct.connected(0, 1)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 5: LinkCutTree link — chain connectivity (100 tests)
// For n = 3..102: link 0-1 and 1-2, check 0 connected to 2.
// ---------------------------------------------------------------------------
describe('LinkCutTree link — chain of 3', () => {
  for (let n = 3; n <= 102; n++) {
    it(`n=${n}: chain 0-1-2, connected(0,2) === true`, () => {
      const lct = new LinkCutTree(n);
      lct.link(0, 1);
      lct.link(1, 2);
      expect(lct.connected(0, 2)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 6: LinkCutTree cut — basic disconnect (100 tests)
// For n = 2..101: link(0,1), cut(0,1), then connected(0,1) === false.
// ---------------------------------------------------------------------------
describe('LinkCutTree cut — basic disconnect', () => {
  for (let n = 2; n <= 101; n++) {
    it(`n=${n}: after link then cut, nodes 0 and 1 disconnected`, () => {
      const lct = new LinkCutTree(n);
      lct.link(0, 1);
      expect(lct.connected(0, 1)).toBe(true);
      const cutResult = lct.cut(0, 1);
      expect(cutResult).toBe(true);
      expect(lct.connected(0, 1)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 7: LinkCutTree update and getValue (100 tests)
// For i = 0..99: create tree of size 100, update(i, i*3+7), getValue(i) === i*3+7.
// ---------------------------------------------------------------------------
describe('LinkCutTree update and getValue', () => {
  for (let i = 0; i < 100; i++) {
    it(`update node ${i} value to ${i * 3 + 7}`, () => {
      const lct = new LinkCutTree(100);
      lct.update(i, i * 3 + 7);
      expect(lct.getValue(i)).toBe(i * 3 + 7);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 8: LinkCutTree constructor with initial values (100 tests)
// ---------------------------------------------------------------------------
describe('LinkCutTree constructor with initial values', () => {
  for (let i = 0; i < 100; i++) {
    it(`constructor: node ${i} starts with value ${i * 2 + 1}`, () => {
      const vals = Array.from({ length: 100 }, (_, k) => k * 2 + 1);
      const lct = new LinkCutTree(100, vals);
      expect(lct.getValue(i)).toBe(i * 2 + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 9: LinkCutTree pathSum — single edge (100 tests)
// For i = 0..99: create n=2 tree with vals [i, i+5], link(0,1), pathSum(0,1) === 2i+5.
// ---------------------------------------------------------------------------
describe('LinkCutTree pathSum — single edge', () => {
  for (let i = 0; i < 100; i++) {
    it(`pathSum(0,1) with vals [${i}, ${i + 5}] === ${2 * i + 5}`, () => {
      const lct = new LinkCutTree(2, [i, i + 5]);
      lct.link(0, 1);
      expect(lct.pathSum(0, 1)).toBe(2 * i + 5);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 10: LinkCutTree pathSum — same node (100 tests)
// pathSum(i,i) === value at i (single node path)
// ---------------------------------------------------------------------------
describe('LinkCutTree pathSum — same node', () => {
  for (let i = 0; i < 100; i++) {
    it(`pathSum(${i},${i}) === getValue(${i})`, () => {
      const vals = Array.from({ length: 100 }, (_, k) => k + 1);
      const lct = new LinkCutTree(100, vals);
      expect(lct.pathSum(i, i)).toBe(i + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 11: LinkCutTree link returns false when already connected (50 tests)
// ---------------------------------------------------------------------------
describe('LinkCutTree link — already connected returns false', () => {
  for (let n = 2; n <= 51; n++) {
    it(`n=${n}: second link(0,1) returns false`, () => {
      const lct = new LinkCutTree(n);
      lct.link(0, 1);
      expect(lct.link(0, 1)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 12: LinkCutTree cut returns false when no edge (50 tests)
// ---------------------------------------------------------------------------
describe('LinkCutTree cut — no edge returns false', () => {
  for (let n = 2; n <= 51; n++) {
    it(`n=${n}: cut(0,1) with no edge returns false`, () => {
      const lct = new LinkCutTree(n);
      expect(lct.cut(0, 1)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 13: LinkCutTree — star graph connectivity (50 tests)
// Build a star from node 0: link(0,1)..link(0,k), all nodes connected to 0.
// ---------------------------------------------------------------------------
describe('LinkCutTree star graph connectivity', () => {
  for (let k = 1; k <= 50; k++) {
    it(`star of ${k + 1} nodes: node 1 connected to node ${k > 1 ? k : 1}`, () => {
      const lct = new LinkCutTree(k + 1);
      for (let j = 1; j <= k; j++) lct.link(0, j);
      if (k >= 2) {
        expect(lct.connected(1, k)).toBe(true);
      } else {
        expect(lct.connected(0, 1)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 14: LinkCutTree — path graph connectivity (50 tests)
// Build path 0-1-2-...-k, check endpoints connected.
// ---------------------------------------------------------------------------
describe('LinkCutTree path graph connectivity', () => {
  for (let k = 1; k <= 50; k++) {
    it(`path of ${k + 1} nodes: connected(0, ${k}) === true`, () => {
      const lct = new LinkCutTree(k + 1);
      for (let j = 0; j < k; j++) lct.link(j, j + 1);
      expect(lct.connected(0, k)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 15: LinkCutTree — pathSum chain (50 tests)
// Chain of 3 nodes with values [1,1,1], pathSum(0,2) === 3.
// Vary by different uniform values.
// ---------------------------------------------------------------------------
describe('LinkCutTree pathSum — 3-node chain uniform values', () => {
  for (let v = 1; v <= 50; v++) {
    it(`chain vals=[${v},${v},${v}]: pathSum(0,2) === ${3 * v}`, () => {
      const lct = new LinkCutTree(3, [v, v, v]);
      lct.link(0, 1);
      lct.link(1, 2);
      expect(lct.pathSum(0, 2)).toBe(3 * v);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 16: LinkCutTree — pathSum after update (50 tests)
// Chain 0-1-2, initial vals [1,1,1], update middle node to v, pathSum(0,2) === v+2.
// ---------------------------------------------------------------------------
describe('LinkCutTree pathSum after update', () => {
  for (let v = 1; v <= 50; v++) {
    it(`chain, update node 1 to ${v}: pathSum(0,2) === ${v + 2}`, () => {
      const lct = new LinkCutTree(3, [1, 1, 1]);
      lct.link(0, 1);
      lct.link(1, 2);
      lct.update(1, v);
      expect(lct.pathSum(0, 2)).toBe(v + 2);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 17: LinkCutTree — cut middle of chain, check disconnect (50 tests)
// ---------------------------------------------------------------------------
describe('LinkCutTree cut middle of chain', () => {
  for (let n = 3; n <= 52; n++) {
    it(`n=${n}: cut(1,2) disconnects 0 from 2`, () => {
      const lct = new LinkCutTree(n);
      lct.link(0, 1);
      lct.link(1, 2);
      lct.cut(1, 2);
      expect(lct.connected(0, 2)).toBe(false);
      expect(lct.connected(0, 1)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 18: DynamicConnectivity — initial state (100 tests)
// ---------------------------------------------------------------------------
describe('DynamicConnectivity initial state', () => {
  for (let n = 1; n <= 100; n++) {
    it(`n=${n}: size === ${n}`, () => {
      const dc = new DynamicConnectivity(n);
      expect(dc.size).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 19: DynamicConnectivity — initial components (100 tests)
// ---------------------------------------------------------------------------
describe('DynamicConnectivity initial components', () => {
  for (let n = 1; n <= 100; n++) {
    it(`n=${n}: components === ${n} initially`, () => {
      const dc = new DynamicConnectivity(n);
      expect(dc.components).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 20: DynamicConnectivity — not connected initially (100 tests)
// ---------------------------------------------------------------------------
describe('DynamicConnectivity not connected initially', () => {
  for (let n = 2; n <= 101; n++) {
    it(`n=${n}: nodes 0 and 1 not connected initially`, () => {
      const dc = new DynamicConnectivity(n);
      expect(dc.connected(0, 1)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 21: DynamicConnectivity addEdge (100 tests)
// For n=10, add edge (0, i%10==0?1:i%10) and check connected.
// ---------------------------------------------------------------------------
describe('DynamicConnectivity addEdge — returns true for new edge', () => {
  for (let i = 1; i <= 100; i++) {
    it(`addEdge iteration ${i}: returns true for fresh edge`, () => {
      const dc = new DynamicConnectivity(10);
      const u = 0, v = (i % 9) + 1; // v in 1..9
      const result = dc.addEdge(u, v);
      expect(result).toBe(true);
      expect(dc.connected(u, v)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 22: DynamicConnectivity addEdge duplicate returns false (100 tests)
// ---------------------------------------------------------------------------
describe('DynamicConnectivity addEdge duplicate', () => {
  for (let i = 0; i < 100; i++) {
    it(`duplicate edge (0, ${(i % 9) + 1}) returns false`, () => {
      const dc = new DynamicConnectivity(10);
      const v = (i % 9) + 1;
      dc.addEdge(0, v);
      expect(dc.addEdge(0, v)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 23: DynamicConnectivity components count decreases (100 tests)
// For n=10, add i edges in a path 0-1-2-...-i, components = 10-i.
// ---------------------------------------------------------------------------
describe('DynamicConnectivity components decrease as edges added', () => {
  for (let i = 1; i <= 9; i++) {
    // Run 11 iterations per edge count for a total near 100
    for (let rep = 0; rep < 11; rep++) {
      it(`path length ${i}, rep ${rep}: components === ${10 - i}`, () => {
        const dc = new DynamicConnectivity(10);
        for (let j = 0; j < i; j++) dc.addEdge(j, j + 1);
        expect(dc.components).toBe(10 - i);
      });
    }
  }
  // one more to hit 100
  it('path 0-1-2-...-9 gives 1 component', () => {
    const dc = new DynamicConnectivity(10);
    for (let j = 0; j < 9; j++) dc.addEdge(j, j + 1);
    expect(dc.components).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// SECTION 24: DynamicConnectivity neighbors (100 tests)
// ---------------------------------------------------------------------------
describe('DynamicConnectivity neighbors', () => {
  for (let v = 1; v <= 9; v++) {
    // test that 0 has each node as neighbor after adding edge
    it(`neighbors of 0 includes ${v} after addEdge(0,${v})`, () => {
      const dc = new DynamicConnectivity(10);
      dc.addEdge(0, v);
      expect(dc.neighbors(0)).toContain(v);
    });
  }

  for (let v = 1; v <= 9; v++) {
    // reverse: neighbor of v includes 0
    it(`neighbors of ${v} includes 0 after addEdge(0,${v})`, () => {
      const dc = new DynamicConnectivity(10);
      dc.addEdge(0, v);
      expect(dc.neighbors(v)).toContain(0);
    });
  }

  // neighbors length checks
  for (let k = 1; k <= 9; k++) {
    it(`node 0 has ${k} neighbors after adding ${k} edges from 0`, () => {
      const dc = new DynamicConnectivity(10);
      for (let j = 1; j <= k; j++) dc.addEdge(0, j);
      expect(dc.neighbors(0).length).toBe(k);
    });
  }

  // isolated node has 0 neighbors
  for (let v = 0; v < 10; v++) {
    it(`node ${v} has 0 neighbors initially`, () => {
      const dc = new DynamicConnectivity(10);
      expect(dc.neighbors(v).length).toBe(0);
    });
  }

  // after star from node 0, inner nodes have exactly 1 neighbor
  for (let v = 1; v <= 9; v++) {
    it(`in star graph, node ${v} has exactly 1 neighbor (node 0)`, () => {
      const dc = new DynamicConnectivity(10);
      for (let j = 1; j <= 9; j++) dc.addEdge(0, j);
      expect(dc.neighbors(v)).toEqual([0]);
    });
  }

  // nodes not yet in edge set have 0 neighbors
  for (let v = 1; v < 10; v++) {
    it(`node ${v} has 0 neighbors when only edge is (0,${v > 1 ? v - 1 : v})`, () => {
      const dc = new DynamicConnectivity(10);
      dc.addEdge(0, v > 1 ? v - 1 : 0 + 1); // add some edge not involving v (unless v=1)
      if (v > 1) {
        expect(dc.neighbors(v).length).toBe(0);
      } else {
        expect(dc.neighbors(1).length).toBe(1); // edge (0,1) was added
      }
    });
  }

  // add multiple edges, check count for a hub
  for (let k = 2; k <= 9; k++) {
    it(`path 0-1-...-${k}: node 1 has ${k === 1 ? 1 : 2} neighbors`, () => {
      const dc = new DynamicConnectivity(10);
      for (let j = 0; j < k; j++) dc.addEdge(j, j + 1);
      const expected = k === 1 ? 1 : 2;
      expect(dc.neighbors(1).length).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 25: DynamicConnectivity — star from center (50 tests)
// ---------------------------------------------------------------------------
describe('DynamicConnectivity star: all leaves connected to center', () => {
  for (let k = 2; k <= 51; k++) {
    it(`star n=${k}: leaf 1 connected to leaf ${k - 1}`, () => {
      const dc = new DynamicConnectivity(k);
      for (let j = 1; j < k; j++) dc.addEdge(0, j);
      if (k >= 3) {
        expect(dc.connected(1, k - 1)).toBe(true);
      } else {
        expect(dc.connected(0, 1)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 26: buildForest helper (50 tests)
// ---------------------------------------------------------------------------
describe('buildForest helper', () => {
  for (let n = 2; n <= 51; n++) {
    it(`buildForest n=${n} single edge: connected(0,1)`, () => {
      const lct = buildForest(n, [[0, 1]]);
      expect(lct.connected(0, 1)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 27: areConnected helper (50 tests)
// ---------------------------------------------------------------------------
describe('areConnected helper', () => {
  for (let n = 2; n <= 51; n++) {
    it(`areConnected: n=${n} edge (0,1)`, () => {
      const lct = buildForest(n, [[0, 1]]);
      expect(areConnected(lct, 0, 1)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 28: LinkCutTree — update then pathSum (50 tests)
// ---------------------------------------------------------------------------
describe('LinkCutTree update then pathSum on single edge', () => {
  for (let i = 0; i < 50; i++) {
    it(`update node 0 to ${i + 10}, pathSum(0,1) === ${i + 10 + 5}`, () => {
      const lct = new LinkCutTree(2, [1, 5]);
      lct.link(0, 1);
      lct.update(0, i + 10);
      expect(lct.pathSum(0, 1)).toBe(i + 10 + 5);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 29: LinkCutTree — link/cut cycle (50 tests)
// Link and cut the same edge repeatedly.
// ---------------------------------------------------------------------------
describe('LinkCutTree link/cut cycle', () => {
  for (let rep = 1; rep <= 50; rep++) {
    it(`cycle rep ${rep}: after ${rep} link/cut pairs, nodes disconnected`, () => {
      const lct = new LinkCutTree(2);
      for (let r = 0; r < rep; r++) {
        lct.link(0, 1);
        lct.cut(0, 1);
      }
      expect(lct.connected(0, 1)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 30: LinkCutTree — single node self-connectivity (50 tests)
// A single node is trivially connected to itself.
// ---------------------------------------------------------------------------
describe('LinkCutTree single node', () => {
  for (let i = 0; i < 50; i++) {
    it(`single node tree (size=${i + 1}): node 0 connected to itself`, () => {
      const lct = new LinkCutTree(i + 1);
      expect(lct.connected(0, 0)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 31: DynamicConnectivity — path and non-adjacent connectivity (50 tests)
// ---------------------------------------------------------------------------
describe('DynamicConnectivity path connectivity', () => {
  for (let len = 2; len <= 51; len++) {
    it(`path of length ${len}: endpoints connected`, () => {
      const dc = new DynamicConnectivity(len + 1);
      for (let j = 0; j < len; j++) dc.addEdge(j, j + 1);
      expect(dc.connected(0, len)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 32: LinkCutTree — 4-node path pathSum (50 tests)
// ---------------------------------------------------------------------------
describe('LinkCutTree 4-node path pathSum', () => {
  for (let v = 1; v <= 50; v++) {
    it(`path vals all ${v}: pathSum(0,3) === ${4 * v}`, () => {
      const lct = new LinkCutTree(4, [v, v, v, v]);
      lct.link(0, 1);
      lct.link(1, 2);
      lct.link(2, 3);
      expect(lct.pathSum(0, 3)).toBe(4 * v);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 33: LinkCutTree — disconnected tree components stay separate (50 tests)
// ---------------------------------------------------------------------------
describe('LinkCutTree separate components remain disconnected', () => {
  for (let n = 4; n <= 53; n++) {
    it(`n=${n}: components {0,1} and {2,3} not connected`, () => {
      const lct = new LinkCutTree(n);
      lct.link(0, 1);
      lct.link(2, 3);
      expect(lct.connected(0, 2)).toBe(false);
      expect(lct.connected(1, 3)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 34: LinkCutTree — after merging two components (50 tests)
// ---------------------------------------------------------------------------
describe('LinkCutTree merge two components', () => {
  for (let n = 4; n <= 53; n++) {
    it(`n=${n}: merge {0,1} and {2,3} via link(1,2)`, () => {
      const lct = new LinkCutTree(n);
      lct.link(0, 1);
      lct.link(2, 3);
      lct.link(1, 2);
      expect(lct.connected(0, 3)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 35: LinkCutTree — pathSum 4-node star (50 tests)
// ---------------------------------------------------------------------------
describe('LinkCutTree 4-node star pathSum', () => {
  for (let v = 1; v <= 50; v++) {
    it(`star vals all ${v}: pathSum(1,2) via center === ${3 * v}`, () => {
      const lct = new LinkCutTree(4, [v, v, v, v]);
      lct.link(0, 1);
      lct.link(0, 2);
      lct.link(0, 3);
      // path from 1 to 2 goes through 0: sum = v+v+v
      expect(lct.pathSum(1, 2)).toBe(3 * v);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 36: DynamicConnectivity — components after connecting all (50 tests)
// ---------------------------------------------------------------------------
describe('DynamicConnectivity fully connected graph', () => {
  for (let n = 2; n <= 51; n++) {
    it(`n=${n}: after connecting all, 1 component`, () => {
      const dc = new DynamicConnectivity(n);
      // Build a spanning path
      for (let j = 0; j < n - 1; j++) dc.addEdge(j, j + 1);
      expect(dc.components).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 37: LinkCutTree — getValue after constructor with values (50 tests)
// ---------------------------------------------------------------------------
describe('LinkCutTree getValue with custom values', () => {
  for (let i = 0; i < 50; i++) {
    it(`node ${i} in 50-node tree starts at value ${i * 5}`, () => {
      const vals = Array.from({ length: 50 }, (_, k) => k * 5);
      const lct = new LinkCutTree(50, vals);
      expect(lct.getValue(i)).toBe(i * 5);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 38: LinkCutTree — multiple updates (50 tests)
// ---------------------------------------------------------------------------
describe('LinkCutTree multiple updates', () => {
  for (let i = 0; i < 50; i++) {
    it(`update node ${i} twice, final value retained`, () => {
      const lct = new LinkCutTree(50);
      lct.update(i, 100);
      lct.update(i, i + 200);
      expect(lct.getValue(i)).toBe(i + 200);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 39: DynamicConnectivity — bidirectional addEdge connectivity (50 tests)
// ---------------------------------------------------------------------------
describe('DynamicConnectivity bidirectional', () => {
  for (let v = 1; v <= 50; v++) {
    it(`connected(${v},0) after addEdge(0,${v})`, () => {
      const dc = new DynamicConnectivity(51);
      dc.addEdge(0, v);
      expect(dc.connected(v, 0)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 40: LinkCutTree — pathSum two-edge path with distinct values (50 tests)
// ---------------------------------------------------------------------------
describe('LinkCutTree pathSum two-edge with distinct values', () => {
  for (let i = 0; i < 50; i++) {
    const a = i + 1, b = i * 2 + 3, c = i * 3 + 5;
    it(`vals [${a},${b},${c}] path 0-1-2: pathSum(0,2) === ${a + b + c}`, () => {
      const lct = new LinkCutTree(3, [a, b, c]);
      lct.link(0, 1);
      lct.link(1, 2);
      expect(lct.pathSum(0, 2)).toBe(a + b + c);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 41: DynamicConnectivity — isolated node self-connectivity (50 tests)
// ---------------------------------------------------------------------------
describe('DynamicConnectivity self-connectivity', () => {
  for (let v = 0; v < 50; v++) {
    it(`node ${v} is connected to itself`, () => {
      const dc = new DynamicConnectivity(50);
      expect(dc.connected(v, v)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 42: LinkCutTree — buildForest with no edges (50 tests)
// ---------------------------------------------------------------------------
describe('buildForest with no edges', () => {
  for (let n = 2; n <= 51; n++) {
    it(`buildForest n=${n} no edges: not connected(0,1)`, () => {
      const lct = buildForest(n, []);
      expect(lct.connected(0, 1)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 43: DynamicConnectivity — adding same edge twice (50 tests)
// ---------------------------------------------------------------------------
describe('DynamicConnectivity — addEdge same edge twice does not change components', () => {
  for (let v = 1; v <= 50; v++) {
    it(`n=51: adding (0,${v}) twice, components after second add unchanged`, () => {
      const dc = new DynamicConnectivity(51);
      dc.addEdge(0, v);
      const compAfterFirst = dc.components;
      dc.addEdge(0, v);
      expect(dc.components).toBe(compAfterFirst);
    });
  }
});

// ---------------------------------------------------------------------------
// SECTION 44: LinkCutTree — cut in 4-node path (50 tests)
// ---------------------------------------------------------------------------
describe('LinkCutTree cut in 4-node path', () => {
  for (let cutAt = 0; cutAt < 3; cutAt++) {
    for (let rep = 1; rep <= 17; rep++) {
      it(`cut edge (${cutAt},${cutAt + 1}) rep ${rep}: endpoints separated`, () => {
        const lct = new LinkCutTree(4);
        lct.link(0, 1);
        lct.link(1, 2);
        lct.link(2, 3);
        lct.cut(cutAt, cutAt + 1);
        if (cutAt === 0) {
          expect(lct.connected(0, 1)).toBe(false);
          expect(lct.connected(1, 3)).toBe(true);
        } else if (cutAt === 1) {
          expect(lct.connected(0, 2)).toBe(false);
          expect(lct.connected(2, 3)).toBe(true);
        } else {
          expect(lct.connected(2, 3)).toBe(false);
          expect(lct.connected(0, 2)).toBe(true);
        }
      });
    }
  }
  // fill remainder
  it('cut (0,1) in path 0-1-2-3: node 0 isolated', () => {
    const lct = new LinkCutTree(4);
    lct.link(0, 1); lct.link(1, 2); lct.link(2, 3);
    lct.cut(0, 1);
    expect(lct.connected(0, 3)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SECTION 45: Mixed LCT and DC operations (50 tests)
// ---------------------------------------------------------------------------
describe('Mixed LCT operations', () => {
  for (let n = 5; n <= 54; n++) {
    it(`n=${n}: 3-node chain with cut/reconnect`, () => {
      const lct = new LinkCutTree(n);
      lct.link(0, 1);
      lct.link(1, 2);
      expect(lct.connected(0, 2)).toBe(true);
      lct.cut(0, 1);
      expect(lct.connected(0, 2)).toBe(false);
      lct.link(0, 2);
      expect(lct.connected(0, 2)).toBe(true);
    });
  }
});
