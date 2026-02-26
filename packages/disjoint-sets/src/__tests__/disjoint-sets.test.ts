// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  DisjointSets,
  DisjointSetsWeighted,
  GenericDisjointSets,
  connectedComponents,
  numConnectedComponents,
  isConnectedGraph,
  minimumSpanningForest,
} from '../disjoint-sets';

// ─── 1. find / union basic (150 tests) ───────────────────────────────────────
describe('DisjointSets – find/union basic', () => {
  // 50 tests: fresh DS of size n — each element is its own root
  for (let n = 1; n <= 50; n++) {
    it(`n=${n}: every element is its own root initially`, () => {
      const ds = new DisjointSets(n);
      for (let i = 0; i < n; i++) {
        expect(ds.find(i)).toBe(i);
      }
    });
  }

  // 50 tests: union(i, i+1) — check they share a root
  for (let i = 0; i < 50; i++) {
    it(`union(${i}, ${i + 1}) in size-${i + 2} DS shares root`, () => {
      const ds = new DisjointSets(i + 2);
      ds.union(i, i + 1);
      expect(ds.find(i)).toBe(ds.find(i + 1));
    });
  }

  // 50 tests: union returns true first time, false second time
  for (let i = 0; i < 50; i++) {
    it(`union(${i}, ${i + 1}) returns true first call, false second`, () => {
      const ds = new DisjointSets(i + 2);
      expect(ds.union(i, i + 1)).toBe(true);
      expect(ds.union(i, i + 1)).toBe(false);
    });
  }
});

// ─── 2. connected (150 tests) ────────────────────────────────────────────────
describe('DisjointSets – connected', () => {
  // 50 tests: not connected before union
  for (let i = 0; i < 50; i++) {
    it(`n=${i + 2}: elements ${i} and ${i + 1} not connected before union`, () => {
      const ds = new DisjointSets(i + 2);
      expect(ds.connected(i, i + 1)).toBe(false);
    });
  }

  // 50 tests: connected after union
  for (let i = 0; i < 50; i++) {
    it(`n=${i + 2}: elements ${i} and ${i + 1} connected after union`, () => {
      const ds = new DisjointSets(i + 2);
      ds.union(i, i + 1);
      expect(ds.connected(i, i + 1)).toBe(true);
    });
  }

  // 50 tests: transitivity — union(0,1), union(1,2) → 0 and 2 connected
  for (let n = 3; n <= 52; n++) {
    it(`n=${n}: 0-1-2 chain transitivity`, () => {
      const ds = new DisjointSets(n);
      ds.union(0, 1);
      ds.union(1, 2);
      expect(ds.connected(0, 2)).toBe(true);
      if (n > 3) {
        expect(ds.connected(0, 3)).toBe(false);
      }
    });
  }
});

// ─── 3. numComponents (100 tests) ────────────────────────────────────────────
describe('DisjointSets – numComponents', () => {
  // 50 tests: starts at n
  for (let n = 1; n <= 50; n++) {
    it(`n=${n}: numComponents starts at ${n}`, () => {
      const ds = new DisjointSets(n);
      expect(ds.numComponents).toBe(n);
    });
  }

  // 50 tests: each successful union decreases numComponents by 1
  for (let n = 2; n <= 51; n++) {
    it(`n=${n}: numComponents decreases by 1 per union`, () => {
      const ds = new DisjointSets(n);
      let expected = n;
      for (let i = 0; i < n - 1; i++) {
        ds.union(i, i + 1);
        expected--;
        expect(ds.numComponents).toBe(expected);
      }
      // All in one component now — redundant union changes nothing
      ds.union(0, n - 1);
      expect(ds.numComponents).toBe(1);
    });
  }
});

// ─── 4. componentSize (100 tests) ────────────────────────────────────────────
describe('DisjointSets – componentSize', () => {
  // 50 tests: initial size is 1
  for (let n = 1; n <= 50; n++) {
    it(`n=${n}: every element has componentSize 1 initially`, () => {
      const ds = new DisjointSets(n);
      for (let i = 0; i < n; i++) {
        expect(ds.componentSize(i)).toBe(1);
      }
    });
  }

  // 50 tests: after chaining unions, componentSize equals merged count
  for (let k = 2; k <= 51; k++) {
    it(`chain union 0..${k - 1}: componentSize equals ${k}`, () => {
      const ds = new DisjointSets(k);
      for (let i = 0; i < k - 1; i++) {
        ds.union(i, i + 1);
      }
      for (let i = 0; i < k; i++) {
        expect(ds.componentSize(i)).toBe(k);
      }
    });
  }
});

// ─── 5. components() (100 tests) ─────────────────────────────────────────────
describe('DisjointSets – components()', () => {
  // 20 tests: all singletons — components returns n arrays each of length 1
  for (let n = 1; n <= 20; n++) {
    it(`n=${n}: components() returns ${n} singleton arrays`, () => {
      const ds = new DisjointSets(n);
      const comps = ds.components();
      expect(comps.length).toBe(n);
      const all = comps.flat().sort((a, b) => a - b);
      expect(all).toEqual(Array.from({ length: n }, (_, i) => i));
    });
  }

  // 20 tests: union all → one component covering all elements
  for (let n = 2; n <= 21; n++) {
    it(`n=${n}: after full chain union, components() returns 1 array`, () => {
      const ds = new DisjointSets(n);
      for (let i = 0; i < n - 1; i++) ds.union(i, i + 1);
      const comps = ds.components();
      expect(comps.length).toBe(1);
      const all = comps[0].sort((a, b) => a - b);
      expect(all).toEqual(Array.from({ length: n }, (_, i) => i));
    });
  }

  // 30 tests: two halves merged separately
  for (let half = 2; half <= 31; half++) {
    it(`two halves of size ${half}: components() returns 2 arrays`, () => {
      const n = half * 2;
      const ds = new DisjointSets(n);
      for (let i = 0; i < half - 1; i++) ds.union(i, i + 1);
      for (let i = half; i < n - 1; i++) ds.union(i, i + 1);
      const comps = ds.components();
      expect(comps.length).toBe(2);
      const all = comps.flat().sort((a, b) => a - b);
      expect(all).toEqual(Array.from({ length: n }, (_, i) => i));
    });
  }

  // 30 tests: union every other pair — creates n/2 components of size 2
  for (let k = 1; k <= 30; k++) {
    it(`${k} pairs union: components() returns ${k} components of size 2`, () => {
      const n = k * 2;
      const ds = new DisjointSets(n);
      for (let i = 0; i < n; i += 2) ds.union(i, i + 1);
      const comps = ds.components();
      expect(comps.length).toBe(k);
      for (const comp of comps) {
        expect(comp.length).toBe(2);
      }
    });
  }
});

// ─── 6. GenericDisjointSets (100 tests) ──────────────────────────────────────
describe('GenericDisjointSets – string keys', () => {
  // 25 tests: add single items — find returns self
  for (let i = 0; i < 25; i++) {
    it(`add item "k${i}": find returns "k${i}"`, () => {
      const gds = new GenericDisjointSets<string>();
      gds.add(`k${i}`);
      expect(gds.find(`k${i}`)).toBe(`k${i}`);
    });
  }

  // 25 tests: union two strings — connected
  for (let i = 0; i < 25; i++) {
    it(`union "a${i}" and "b${i}": connected`, () => {
      const gds = new GenericDisjointSets<string>();
      gds.add(`a${i}`);
      gds.add(`b${i}`);
      expect(gds.union(`a${i}`, `b${i}`)).toBe(true);
      expect(gds.connected(`a${i}`, `b${i}`)).toBe(true);
    });
  }

  // 25 tests: numComponents tracking
  for (let n = 1; n <= 25; n++) {
    it(`GenericDisjointSets: ${n} items start with ${n} components`, () => {
      const gds = new GenericDisjointSets<string>();
      for (let i = 0; i < n; i++) gds.add(`item${i}`);
      expect(gds.numComponents).toBe(n);
    });
  }

  // 25 tests: componentOf includes all members
  for (let k = 2; k <= 26; k++) {
    it(`componentOf after ${k}-element chain union`, () => {
      const gds = new GenericDisjointSets<string>();
      const keys = Array.from({ length: k }, (_, i) => `node${i}`);
      for (const key of keys) gds.add(key);
      for (let i = 0; i < k - 1; i++) gds.union(keys[i], keys[i + 1]);
      const comp = gds.componentOf('node0');
      expect(comp.length).toBe(k);
      for (const key of keys) {
        expect(comp).toContain(key);
      }
    });
  }
});

// ─── 7. connectedComponents standalone (100 tests) ───────────────────────────
describe('connectedComponents standalone', () => {
  // 20 tests: no edges → n singleton components
  for (let n = 1; n <= 20; n++) {
    it(`n=${n}, no edges: ${n} singletons`, () => {
      const comps = connectedComponents(n, []);
      expect(comps.length).toBe(n);
      const all = comps.flat().sort((a, b) => a - b);
      expect(all).toEqual(Array.from({ length: n }, (_, i) => i));
    });
  }

  // 20 tests: full path graph 0-1-2-...(n-1)
  for (let n = 2; n <= 21; n++) {
    it(`n=${n}, path graph: 1 component`, () => {
      const edges: Array<[number, number]> = [];
      for (let i = 0; i < n - 1; i++) edges.push([i, i + 1]);
      const comps = connectedComponents(n, edges);
      expect(comps.length).toBe(1);
      const all = comps[0].sort((a, b) => a - b);
      expect(all).toEqual(Array.from({ length: n }, (_, i) => i));
    });
  }

  // 20 tests: two isolated paths of length k each
  for (let k = 2; k <= 21; k++) {
    it(`two isolated paths of ${k} nodes: 2 components`, () => {
      const n = k * 2;
      const edges: Array<[number, number]> = [];
      for (let i = 0; i < k - 1; i++) edges.push([i, i + 1]);
      for (let i = k; i < n - 1; i++) edges.push([i, i + 1]);
      const comps = connectedComponents(n, edges);
      expect(comps.length).toBe(2);
    });
  }

  // 20 tests: star graph — one hub, n-1 leaves
  for (let n = 2; n <= 21; n++) {
    it(`n=${n}, star graph: 1 component`, () => {
      const edges: Array<[number, number]> = [];
      for (let i = 1; i < n; i++) edges.push([0, i]);
      const comps = connectedComponents(n, edges);
      expect(comps.length).toBe(1);
    });
  }

  // 20 tests: isolated pairs
  for (let k = 1; k <= 20; k++) {
    it(`${k} isolated pairs: ${k} components`, () => {
      const n = k * 2;
      const edges: Array<[number, number]> = [];
      for (let i = 0; i < n; i += 2) edges.push([i, i + 1]);
      const comps = connectedComponents(n, edges);
      expect(comps.length).toBe(k);
      for (const comp of comps) expect(comp.length).toBe(2);
    });
  }
});

// ─── 8. numConnectedComponents (100 tests) ────────────────────────────────────
describe('numConnectedComponents', () => {
  // 25 tests: no edges → n
  for (let n = 1; n <= 25; n++) {
    it(`n=${n}, no edges: ${n} components`, () => {
      expect(numConnectedComponents(n, [])).toBe(n);
    });
  }

  // 25 tests: complete graph on n nodes → 1
  for (let n = 2; n <= 26; n++) {
    it(`n=${n}, complete graph: 1 component`, () => {
      const edges: Array<[number, number]> = [];
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
          edges.push([i, j]);
      expect(numConnectedComponents(n, edges)).toBe(1);
    });
  }

  // 25 tests: k isolated nodes plus one fully connected clique of size 3
  for (let k = 0; k <= 24; k++) {
    it(`${k} isolated nodes + triangle: ${k + 1} components`, () => {
      const n = k + 3;
      const edges: Array<[number, number]> = [
        [k, k + 1],
        [k + 1, k + 2],
        [k, k + 2],
      ];
      expect(numConnectedComponents(n, edges)).toBe(k + 1);
    });
  }

  // 25 tests: chain unions reduce count by 1 each
  for (let n = 2; n <= 26; n++) {
    it(`n=${n} chain of ${n - 1} edges → 1 component`, () => {
      const edges: Array<[number, number]> = [];
      for (let i = 0; i < n - 1; i++) edges.push([i, i + 1]);
      expect(numConnectedComponents(n, edges)).toBe(1);
    });
  }
});

// ─── 9. isConnectedGraph (50 tests) ──────────────────────────────────────────
describe('isConnectedGraph', () => {
  // 10 tests: single node
  for (let i = 0; i < 10; i++) {
    it(`single node (run ${i}): always connected`, () => {
      expect(isConnectedGraph(1, [])).toBe(true);
    });
  }

  // 15 tests: path graph on n nodes — connected
  for (let n = 2; n <= 16; n++) {
    it(`n=${n} path graph: connected`, () => {
      const edges: Array<[number, number]> = [];
      for (let i = 0; i < n - 1; i++) edges.push([i, i + 1]);
      expect(isConnectedGraph(n, edges)).toBe(true);
    });
  }

  // 15 tests: two separate components — not connected
  for (let n = 4; n <= 18; n++) {
    it(`n=${n} two halves, no bridge: not connected`, () => {
      const half = Math.floor(n / 2);
      const edges: Array<[number, number]> = [];
      for (let i = 0; i < half - 1; i++) edges.push([i, i + 1]);
      for (let i = half; i < n - 1; i++) edges.push([i, i + 1]);
      expect(isConnectedGraph(n, edges)).toBe(false);
    });
  }

  // 10 tests: complete graph
  for (let n = 2; n <= 11; n++) {
    it(`n=${n} complete graph: connected`, () => {
      const edges: Array<[number, number]> = [];
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
          edges.push([i, j]);
      expect(isConnectedGraph(n, edges)).toBe(true);
    });
  }
});

// ─── 10. minimumSpanningForest / Kruskal (50 tests) ──────────────────────────
describe('minimumSpanningForest (Kruskal)', () => {
  // 10 tests: path graph with unit weights — MST = all edges, total weight = n-1
  for (let n = 2; n <= 11; n++) {
    it(`n=${n} path graph unit weights: MST weight = ${n - 1}`, () => {
      const edges: Array<[number, number, number]> = [];
      for (let i = 0; i < n - 1; i++) edges.push([i, i + 1, 1]);
      const mst = minimumSpanningForest(n, edges);
      expect(mst.length).toBe(n - 1);
      const totalWeight = mst.reduce((s, e) => s + e[2], 0);
      expect(totalWeight).toBe(n - 1);
    });
  }

  // 10 tests: triangle with weights 1,2,3 — MST picks edges 1 and 2, weight=3
  for (let i = 0; i < 10; i++) {
    it(`triangle (run ${i}): MST picks 2 cheapest edges (weight 3)`, () => {
      const edges: Array<[number, number, number]> = [
        [0, 1, 1],
        [1, 2, 2],
        [0, 2, 3],
      ];
      const mst = minimumSpanningForest(3, edges);
      expect(mst.length).toBe(2);
      const totalWeight = mst.reduce((s, e) => s + e[2], 0);
      expect(totalWeight).toBe(3);
    });
  }

  // 10 tests: disconnected graph — MSF has fewer edges than n-1
  for (let k = 2; k <= 11; k++) {
    it(`${k} isolated nodes: MSF has 0 edges`, () => {
      const mst = minimumSpanningForest(k, []);
      expect(mst.length).toBe(0);
    });
  }

  // 10 tests: complete graph on n nodes with increasing weights — MST = n-1 edges
  for (let n = 2; n <= 11; n++) {
    it(`n=${n} complete graph: MST has ${n - 1} edges`, () => {
      const edges: Array<[number, number, number]> = [];
      let w = 1;
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
          edges.push([i, j, w++]);
      const mst = minimumSpanningForest(n, edges);
      expect(mst.length).toBe(n - 1);
    });
  }

  // 10 tests: verify Kruskal picks globally minimum edges
  // Star graph: hub=0, spokes to 1..n-1 with weight=spoke index
  // Plus a cycle edge 1-2 with high weight — MST avoids it
  for (let n = 3; n <= 12; n++) {
    it(`n=${n} star + heavy cycle edge: MST picks only star edges`, () => {
      const edges: Array<[number, number, number]> = [];
      for (let i = 1; i < n; i++) edges.push([0, i, i]);
      // add heavy edge 1-2 (should be skipped)
      edges.push([1, 2, 1000]);
      const mst = minimumSpanningForest(n, edges);
      expect(mst.length).toBe(n - 1);
      const totalWeight = mst.reduce((s, e) => s + e[2], 0);
      // expected weight: sum of 1..n-1
      const expected = (n * (n - 1)) / 2;
      expect(totalWeight).toBe(expected);
    });
  }
});

// ─── 11. DisjointSetsWeighted (additional coverage) ──────────────────────────
describe('DisjointSetsWeighted', () => {
  // 30 tests: diff between directly connected nodes
  for (let n = 2; n <= 31; n++) {
    it(`n=${n}: diff(0,1) = weight after union(0,1, weight)`, () => {
      const w = n * 3;
      const ds = new DisjointSetsWeighted(n);
      ds.union(0, 1, w);
      // diff(x,y) = value[y]-value[x] = w
      expect(ds.diff(0, 1)).toBe(w);
    });
  }

  // 20 tests: diff returns null when not connected
  for (let n = 2; n <= 21; n++) {
    it(`n=${n}: diff(0, ${n - 1}) = null when not connected`, () => {
      const ds = new DisjointSetsWeighted(n);
      expect(ds.diff(0, n - 1)).toBeNull();
    });
  }

  // 20 tests: connected() after union
  for (let n = 2; n <= 21; n++) {
    it(`n=${n}: connected(0,1) after union`, () => {
      const ds = new DisjointSetsWeighted(n);
      expect(ds.connected(0, 1)).toBe(false);
      ds.union(0, 1, 5);
      expect(ds.connected(0, 1)).toBe(true);
    });
  }

  // 15 tests: chained diff — union(0,1,a) union(1,2,b) → diff(0,2) = a+b
  for (let i = 1; i <= 15; i++) {
    it(`chain diff: union(0,1,${i}), union(1,2,${i * 2}) → diff(0,2)=${i * 3}`, () => {
      const ds = new DisjointSetsWeighted(5);
      ds.union(0, 1, i);
      ds.union(1, 2, i * 2);
      expect(ds.diff(0, 2)).toBe(i * 3);
    });
  }

  // 15 tests: union returns true first time, false second
  for (let i = 0; i < 15; i++) {
    it(`weighted union(0,1) returns true first, false second (run ${i})`, () => {
      const ds = new DisjointSetsWeighted(4);
      expect(ds.union(0, 1, i)).toBe(true);
      expect(ds.union(0, 1, i * 2)).toBe(false);
    });
  }
});

// ─── 12. Edge cases and stress (additional) ───────────────────────────────────
describe('DisjointSets – edge cases', () => {
  // 10 tests: union with self returns false
  for (let i = 0; i < 10; i++) {
    it(`union(${i}, ${i}) self-union returns false`, () => {
      const ds = new DisjointSets(20);
      expect(ds.union(i, i)).toBe(false);
    });
  }

  // 10 tests: redundant union after merge returns false
  for (let i = 0; i < 10; i++) {
    it(`redundant union after merge (run ${i})`, () => {
      const ds = new DisjointSets(10);
      ds.union(0, 1);
      ds.union(1, 2);
      expect(ds.union(0, 2)).toBe(false);
    });
  }

  // 10 tests: path compression correctness — find after many unions
  for (let n = 5; n <= 14; n++) {
    it(`n=${n} path compression: find is consistent after chain`, () => {
      const ds = new DisjointSets(n);
      for (let i = 0; i < n - 1; i++) ds.union(i, i + 1);
      const root = ds.find(0);
      for (let i = 0; i < n; i++) {
        expect(ds.find(i)).toBe(root);
      }
    });
  }

  // 10 tests: large n — all in one component after full chain
  for (let exp = 1; exp <= 10; exp++) {
    const n = exp * 10;
    it(`n=${n} large chain: numComponents=1`, () => {
      const ds = new DisjointSets(n);
      for (let i = 0; i < n - 1; i++) ds.union(i, i + 1);
      expect(ds.numComponents).toBe(1);
    });
  }

  // 10 tests: interleaved unions
  for (let k = 1; k <= 10; k++) {
    it(`interleaved unions, k=${k}: correct component count`, () => {
      const n = k * 4;
      const ds = new DisjointSets(n);
      // union first half with stride
      for (let i = 0; i < k; i++) {
        ds.union(i * 2, i * 2 + 1);
      }
      expect(ds.numComponents).toBe(n - k);
      // union second half
      for (let i = k * 2; i < k * 3; i++) {
        ds.union(i, i + 1);
      }
      expect(ds.numComponents).toBe(n - k - k);
    });
  }
});

// ─── 13. GenericDisjointSets additional (additional coverage) ─────────────────
describe('GenericDisjointSets – additional', () => {
  // 10 tests: find on unknown item implicitly adds it
  for (let i = 0; i < 10; i++) {
    it(`find on unadded item "x${i}" returns itself`, () => {
      const gds = new GenericDisjointSets<string>();
      const result = gds.find(`x${i}`);
      expect(result).toBe(`x${i}`);
    });
  }

  // 10 tests: union increments numComponents correctly
  for (let n = 2; n <= 11; n++) {
    it(`GenericDS n=${n}: numComponents decreases on each union`, () => {
      const gds = new GenericDisjointSets<number>();
      for (let i = 0; i < n; i++) gds.add(i);
      for (let i = 0; i < n - 1; i++) {
        const before = gds.numComponents;
        gds.union(i, i + 1);
        expect(gds.numComponents).toBe(before - 1);
      }
      expect(gds.numComponents).toBe(1);
    });
  }

  // 10 tests: componentOf singletons
  for (let i = 0; i < 10; i++) {
    it(`componentOf("solo${i}") returns ["solo${i}"]`, () => {
      const gds = new GenericDisjointSets<string>();
      gds.add(`solo${i}`);
      expect(gds.componentOf(`solo${i}`)).toEqual([`solo${i}`]);
    });
  }

  // 10 tests: connected after chain union
  for (let n = 2; n <= 11; n++) {
    it(`GenericDS chain n=${n}: all connected to 0`, () => {
      const gds = new GenericDisjointSets<number>();
      for (let i = 0; i < n; i++) gds.add(i);
      for (let i = 0; i < n - 1; i++) gds.union(i, i + 1);
      for (let i = 1; i < n; i++) {
        expect(gds.connected(0, i)).toBe(true);
      }
    });
  }

  // 10 tests: double union returns false
  for (let i = 0; i < 10; i++) {
    it(`GenericDS: double union "a${i}" "b${i}" returns false`, () => {
      const gds = new GenericDisjointSets<string>();
      gds.add(`a${i}`);
      gds.add(`b${i}`);
      expect(gds.union(`a${i}`, `b${i}`)).toBe(true);
      expect(gds.union(`a${i}`, `b${i}`)).toBe(false);
    });
  }
});

// ─── 14. isConnectedGraph additional (edge cases) ────────────────────────────
describe('isConnectedGraph – additional', () => {
  // 10 tests: n=0 edge case
  for (let i = 0; i < 10; i++) {
    it(`n=0 (run ${i}): returns true (vacuously connected)`, () => {
      expect(isConnectedGraph(0, [])).toBe(true);
    });
  }

  // 10 tests: two nodes, one edge — connected
  for (let w = 0; w < 10; w++) {
    it(`n=2, one edge (run ${w}): connected`, () => {
      expect(isConnectedGraph(2, [[0, 1]])).toBe(true);
    });
  }

  // 10 tests: two nodes, no edge — not connected
  for (let w = 0; w < 10; w++) {
    it(`n=2, no edge (run ${w}): not connected`, () => {
      expect(isConnectedGraph(2, [])).toBe(false);
    });
  }

  // 10 tests: cycle graph — connected
  for (let n = 3; n <= 12; n++) {
    it(`n=${n} cycle: connected`, () => {
      const edges: Array<[number, number]> = [];
      for (let i = 0; i < n; i++) edges.push([i, (i + 1) % n]);
      expect(isConnectedGraph(n, edges)).toBe(true);
    });
  }

  // 10 tests: one missing node keeps graph disconnected
  for (let n = 3; n <= 12; n++) {
    it(`n=${n} path missing last edge: not connected`, () => {
      const edges: Array<[number, number]> = [];
      for (let i = 0; i < n - 2; i++) edges.push([i, i + 1]);
      expect(isConnectedGraph(n, edges)).toBe(false);
    });
  }
});

// ─── 15. numConnectedComponents additional ────────────────────────────────────
describe('numConnectedComponents – additional', () => {
  // 10 tests: duplicate edges don't change count
  for (let n = 2; n <= 11; n++) {
    it(`n=${n}: duplicate edges count correctly`, () => {
      const edges: Array<[number, number]> = [];
      edges.push([0, 1]);
      edges.push([0, 1]); // duplicate
      edges.push([0, 1]); // duplicate
      expect(numConnectedComponents(n, edges)).toBe(n - 1);
    });
  }

  // 10 tests: adding back-edges to path doesn't create new components
  for (let n = 3; n <= 12; n++) {
    it(`n=${n} path + back edges: 1 component`, () => {
      const edges: Array<[number, number]> = [];
      for (let i = 0; i < n - 1; i++) edges.push([i, i + 1]);
      for (let i = 0; i < n - 2; i++) edges.push([i, i + 2]);
      expect(numConnectedComponents(n, edges)).toBe(1);
    });
  }

  // 10 tests: exactly k components from isolated groups
  for (let k = 2; k <= 11; k++) {
    it(`${k} groups of 3: ${k} components`, () => {
      const n = k * 3;
      const edges: Array<[number, number]> = [];
      for (let g = 0; g < k; g++) {
        const base = g * 3;
        edges.push([base, base + 1]);
        edges.push([base + 1, base + 2]);
      }
      expect(numConnectedComponents(n, edges)).toBe(k);
    });
  }

  // 10 tests: single isolated node among connected group
  for (let i = 0; i < 10; i++) {
    it(`n=5 path 0-1-2-3 + isolated 4: 2 components (run ${i})`, () => {
      const edges: Array<[number, number]> = [[0, 1], [1, 2], [2, 3]];
      expect(numConnectedComponents(5, edges)).toBe(2);
    });
  }

  // 10 tests: n=1 always 1 component
  for (let i = 0; i < 10; i++) {
    it(`n=1 (run ${i}): always 1 component`, () => {
      expect(numConnectedComponents(1, [])).toBe(1);
    });
  }
});

// ─── 16. minimumSpanningForest additional ────────────────────────────────────
describe('minimumSpanningForest – additional', () => {
  // 10 tests: all same weight — picks n-1 edges
  for (let n = 2; n <= 11; n++) {
    it(`n=${n} all-weight-5 complete: MST has ${n - 1} edges`, () => {
      const edges: Array<[number, number, number]> = [];
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
          edges.push([i, j, 5]);
      const mst = minimumSpanningForest(n, edges);
      expect(mst.length).toBe(n - 1);
    });
  }

  // 10 tests: negative weights — Kruskal still works
  for (let n = 2; n <= 11; n++) {
    it(`n=${n} negative weights: MST picks all negative edges first`, () => {
      const edges: Array<[number, number, number]> = [];
      for (let i = 0; i < n - 1; i++) edges.push([i, i + 1, -i - 1]);
      // add high weight back edges
      for (let i = 0; i < n - 2; i++) edges.push([i, i + 2, 100]);
      const mst = minimumSpanningForest(n, edges);
      expect(mst.length).toBe(n - 1);
      const weights = mst.map((e) => e[2]).sort((a, b) => a - b);
      // all picked edges should be the negative ones
      const expected = Array.from({ length: n - 1 }, (_, i) => -(i + 1)).sort((a, b) => a - b);
      expect(weights).toEqual(expected);
    });
  }

  // 10 tests: MST total weight formula for chain with weights 1,2,...,n-1
  for (let n = 2; n <= 11; n++) {
    it(`n=${n} chain weights 1..${n - 1}: MST weight = ${(n * (n - 1)) / 2}`, () => {
      const edges: Array<[number, number, number]> = [];
      for (let i = 0; i < n - 1; i++) edges.push([i, i + 1, i + 1]);
      const mst = minimumSpanningForest(n, edges);
      const totalWeight = mst.reduce((s, e) => s + e[2], 0);
      expect(totalWeight).toBe((n * (n - 1)) / 2);
    });
  }

  // 10 tests: forest — 2 disconnected paths of length n/2
  for (let k = 2; k <= 11; k++) {
    it(`two paths of ${k}: MSF has ${2 * (k - 1)} edges`, () => {
      const n = k * 2;
      const edges: Array<[number, number, number]> = [];
      for (let i = 0; i < k - 1; i++) edges.push([i, i + 1, 1]);
      for (let i = k; i < n - 1; i++) edges.push([i, i + 1, 1]);
      const msf = minimumSpanningForest(n, edges);
      expect(msf.length).toBe(2 * (k - 1));
    });
  }

  // 10 tests: single edge graph — MST is that edge
  for (let i = 0; i < 10; i++) {
    it(`single edge graph (run ${i}): MST = that edge`, () => {
      const w = i + 1;
      const mst = minimumSpanningForest(3, [[0, 1, w]]);
      expect(mst.length).toBe(1);
      expect(mst[0][2]).toBe(w);
    });
  }
});

// ─── 17. componentSize stress and correctness ─────────────────────────────────
describe('DisjointSets – componentSize correctness', () => {
  // 20 tests: componentSize after incremental unions
  for (let n = 3; n <= 22; n++) {
    it(`n=${n}: componentSize of root grows correctly`, () => {
      const ds = new DisjointSets(n);
      for (let i = 0; i < n - 1; i++) {
        ds.union(0, i + 1);
        expect(ds.componentSize(0)).toBe(i + 2);
      }
    });
  }

  // 10 tests: two separate groups have correct sizes
  for (let k = 2; k <= 11; k++) {
    it(`two groups of ${k}: componentSize correct for both`, () => {
      const n = k * 2;
      const ds = new DisjointSets(n);
      for (let i = 0; i < k - 1; i++) ds.union(i, i + 1);
      for (let i = k; i < n - 1; i++) ds.union(i, i + 1);
      for (let i = 0; i < k; i++) expect(ds.componentSize(i)).toBe(k);
      for (let i = k; i < n; i++) expect(ds.componentSize(i)).toBe(k);
    });
  }

  // 10 tests: merging two equal-size groups doubles size
  for (let k = 1; k <= 10; k++) {
    it(`merge two groups of ${k}: resulting size = ${k * 2}`, () => {
      const n = k * 2;
      const ds = new DisjointSets(n);
      for (let i = 0; i < k - 1; i++) ds.union(i, i + 1);
      for (let i = k; i < n - 1; i++) ds.union(i, i + 1);
      expect(ds.componentSize(0)).toBe(k);
      ds.union(0, k);
      expect(ds.componentSize(0)).toBe(k * 2);
    });
  }
});

// ─── 18. connectedComponents element coverage ─────────────────────────────────
describe('connectedComponents – element coverage', () => {
  // 20 tests: all elements appear in exactly one component
  for (let n = 2; n <= 21; n++) {
    it(`n=${n} random edges: every element in exactly one component`, () => {
      const edges: Array<[number, number]> = [];
      for (let i = 0; i < n - 1; i += 2) edges.push([i, i + 1]);
      const comps = connectedComponents(n, edges);
      const seen = new Set<number>();
      for (const comp of comps) {
        for (const el of comp) {
          expect(seen.has(el)).toBe(false);
          seen.add(el);
        }
      }
      expect(seen.size).toBe(n);
    });
  }

  // 10 tests: total elements across all components = n
  for (let n = 5; n <= 14; n++) {
    it(`n=${n}: total elements across components = ${n}`, () => {
      const edges: Array<[number, number]> = [[0, 1], [2, 3]];
      const comps = connectedComponents(n, edges);
      const total = comps.reduce((s, c) => s + c.length, 0);
      expect(total).toBe(n);
    });
  }
});
