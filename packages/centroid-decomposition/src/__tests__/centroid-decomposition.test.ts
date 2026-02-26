// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import {
  CentroidDecomposition,
  TreeUtils,
  treeCentroid,
  treeDiameter,
  treeRadius,
  countPairsAtDistance,
} from '../centroid-decomposition';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a path graph: 0-1-2-...(n-1) */
function pathEdges(n: number): Array<[number, number]> {
  const edges: Array<[number, number]> = [];
  for (let i = 0; i < n - 1; i++) edges.push([i, i + 1]);
  return edges;
}

/** Build a star graph: centre=0 connected to 1...(n-1) */
function starEdges(n: number): Array<[number, number]> {
  const edges: Array<[number, number]> = [];
  for (let i = 1; i < n; i++) edges.push([0, i]);
  return edges;
}

/** Build a complete binary tree on n nodes (0-indexed, root=0) */
function binaryTreeEdges(n: number): Array<[number, number]> {
  const edges: Array<[number, number]> = [];
  for (let i = 1; i < n; i++) {
    edges.push([Math.floor((i - 1) / 2), i]);
  }
  return edges;
}

/** BFS distances from source in a graph given as edge list */
function bfsDist(n: number, edges: Array<[number, number]>, src: number): number[] {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
  const d = new Array<number>(n).fill(-1);
  d[src] = 0;
  const q = [src];
  let head = 0;
  while (head < q.length) {
    const node = q[head++];
    for (const nb of adj[node]) {
      if (d[nb] === -1) { d[nb] = d[node] + 1; q.push(nb); }
    }
  }
  return d;
}

// ---------------------------------------------------------------------------
// Section 1: subtreeSizes — 150 tests
// ---------------------------------------------------------------------------

describe('TreeUtils.subtreeSizes', () => {
  // Path graph: root=0, sizes[i] = n-i
  for (let n = 2; n <= 51; n++) {
    it(`path(${n}): sizes rooted at 0 are n-i`, () => {
      const sizes = TreeUtils.subtreeSizes(n, pathEdges(n), 0);
      for (let i = 0; i < n; i++) {
        expect(sizes[i]).toBe(n - i);
      }
    });
  }

  // Star graph: root=0, size[0]=n, size[i]=1 for i>0
  for (let n = 2; n <= 51; n++) {
    it(`star(${n}): root size=${n}, leaves=1`, () => {
      const sizes = TreeUtils.subtreeSizes(n, starEdges(n), 0);
      expect(sizes[0]).toBe(n);
      for (let i = 1; i < n; i++) {
        expect(sizes[i]).toBe(1);
      }
    });
  }

  // Single node
  it('single node: size=[1]', () => {
    expect(TreeUtils.subtreeSizes(1, [], 0)).toEqual([1]);
  });

  // Two nodes
  it('two nodes rooted at 0: sizes=[2,1]', () => {
    expect(TreeUtils.subtreeSizes(2, [[0, 1]], 0)).toEqual([2, 1]);
  });

  it('two nodes rooted at 1: sizes=[1,2]', () => {
    expect(TreeUtils.subtreeSizes(2, [[0, 1]], 1)).toEqual([1, 2]);
  });

  // Binary tree of 7 nodes
  it('binary tree(7) root 0: sizes correct', () => {
    const sizes = TreeUtils.subtreeSizes(7, binaryTreeEdges(7), 0);
    expect(sizes[0]).toBe(7);
    expect(sizes[1]).toBe(3);
    expect(sizes[2]).toBe(3);
    for (let i = 3; i <= 6; i++) expect(sizes[i]).toBe(1);
  });

  // Sum of sizes equals n * (n+1)/2 for path (since each node i has n-i)
  for (let n = 2; n <= 10; n++) {
    it(`path(${n}) sum of sizes == n*(n+1)/2`, () => {
      const sizes = TreeUtils.subtreeSizes(n, pathEdges(n), 0);
      const sum = sizes.reduce((a, b) => a + b, 0);
      expect(sum).toBe((n * (n + 1)) / 2);
    });
  }

  // Root is always n
  for (let n = 1; n <= 15; n++) {
    it(`star(${n}) sizes[0] == n`, () => {
      const sizes = TreeUtils.subtreeSizes(n, starEdges(n), 0);
      expect(sizes[0]).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 2: findCentroid — 100 tests
// ---------------------------------------------------------------------------

describe('TreeUtils.findCentroid / treeCentroid', () => {
  /** Verify centroid property: removal splits into components all <= n/2 */
  function verifyCentroid(n: number, edges: Array<[number, number]>, c: number): boolean {
    const adj: number[][] = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
    // BFS/DFS each component when c is removed
    const visited = new Array<boolean>(n).fill(false);
    visited[c] = true;
    for (let start = 0; start < n; start++) {
      if (visited[start]) continue;
      // BFS from start
      const q = [start];
      visited[start] = true;
      let head = 0;
      let compSize = 0;
      while (head < q.length) {
        const node = q[head++];
        compSize++;
        for (const nb of adj[node]) {
          if (!visited[nb]) { visited[nb] = true; q.push(nb); }
        }
      }
      if (compSize > Math.floor(n / 2)) return false;
    }
    return true;
  }

  // Path graphs n=2..51
  for (let n = 2; n <= 51; n++) {
    it(`path(${n}): centroid satisfies centroid property`, () => {
      const c = TreeUtils.findCentroid(n, pathEdges(n));
      expect(verifyCentroid(n, pathEdges(n), c)).toBe(true);
    });
  }

  // Star graphs n=2..30
  for (let n = 2; n <= 30; n++) {
    it(`star(${n}): centroid is 0`, () => {
      const c = TreeUtils.findCentroid(n, starEdges(n));
      expect(c).toBe(0);
    });
  }

  // Binary trees
  for (let n = 1; n <= 7; n++) {
    it(`binaryTree(${n}): centroid property holds`, () => {
      if (n === 1) {
        expect(TreeUtils.findCentroid(1, [])).toBe(0);
        return;
      }
      const c = TreeUtils.findCentroid(n, binaryTreeEdges(n));
      expect(verifyCentroid(n, binaryTreeEdges(n), c)).toBe(true);
    });
  }

  // treeCentroid standalone
  for (let n = 2; n <= 15; n++) {
    it(`treeCentroid(path(${n})) satisfies property`, () => {
      const c = treeCentroid(n, pathEdges(n));
      expect(verifyCentroid(n, pathEdges(n), c)).toBe(true);
    });
  }

  it('single node centroid is 0', () => {
    expect(TreeUtils.findCentroid(1, [])).toBe(0);
    expect(treeCentroid(1, [])).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Section 3: treeDiameter — 150 tests
// ---------------------------------------------------------------------------

describe('treeDiameter / TreeUtils.diameter', () => {
  // path(n) → n-1
  for (let n = 1; n <= 60; n++) {
    it(`path(${n}) diameter == ${n - 1}`, () => {
      const d = treeDiameter(n, pathEdges(n));
      expect(d).toBe(n - 1);
      expect(TreeUtils.diameter(n, pathEdges(n))).toBe(n - 1);
    });
  }

  // star(n) → 2 for n >= 3, 1 for n=2
  for (let n = 2; n <= 30; n++) {
    it(`star(${n}) diameter == ${n >= 3 ? 2 : 1}`, () => {
      const expected = n >= 3 ? 2 : 1;
      expect(treeDiameter(n, starEdges(n))).toBe(expected);
    });
  }

  // single node diameter is 0
  it('single node diameter == 0', () => {
    expect(treeDiameter(1, [])).toBe(0);
  });

  // Binary tree of height h: diameter = 2h
  for (let h = 1; h <= 5; h++) {
    it(`complete binary tree height ${h}: diameter == ${2 * h}`, () => {
      const n = Math.pow(2, h + 1) - 1;
      const edges = binaryTreeEdges(n);
      expect(treeDiameter(n, edges)).toBe(2 * h);
    });
  }

  // Verify with BFS double-BFS technique
  for (let n = 2; n <= 20; n++) {
    it(`path(${n}) BFS-diameter matches treeDiameter`, () => {
      const edges = pathEdges(n);
      // BFS from 0 → farthest node → BFS again
      const d1 = bfsDist(n, edges, 0);
      const far1 = d1.indexOf(Math.max(...d1));
      const d2 = bfsDist(n, edges, far1);
      const bfsDiam = Math.max(...d2);
      expect(treeDiameter(n, edges)).toBe(bfsDiam);
    });
  }

  it('two-node tree diameter == 1', () => {
    expect(treeDiameter(2, [[0, 1]])).toBe(1);
  });

  it('three-node path diameter == 2', () => {
    expect(treeDiameter(3, [[0, 1], [1, 2]])).toBe(2);
  });

  it('three-node star diameter == 2', () => {
    expect(treeDiameter(3, [[0, 1], [0, 2]])).toBe(2);
  });

  it('caterpillar tree: diameter is spine + 0 (leaves dont extend)', () => {
    // spine 0-1-2-3, leaves hanging from 1 and 2
    const edges: Array<[number, number]> = [[0,1],[1,2],[2,3],[1,4],[2,5]];
    expect(treeDiameter(6, edges)).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Section 4: treeRadius — 100 tests
// ---------------------------------------------------------------------------

describe('treeRadius / TreeUtils.radius', () => {
  // path(n): radius = ceil((n-1)/2)
  for (let n = 1; n <= 50; n++) {
    it(`path(${n}) radius == ceil((n-1)/2) = ${Math.ceil((n - 1) / 2)}`, () => {
      const expected = Math.ceil((n - 1) / 2);
      expect(treeRadius(n, pathEdges(n))).toBe(expected);
      expect(TreeUtils.radius(n, pathEdges(n))).toBe(expected);
    });
  }

  // star(n): radius = 1 for n>=2
  for (let n = 2; n <= 20; n++) {
    it(`star(${n}) radius == 1`, () => {
      expect(treeRadius(n, starEdges(n))).toBe(1);
    });
  }

  it('single node radius == 0', () => {
    expect(treeRadius(1, [])).toBe(0);
  });

  // radius <= diameter/2 (since radius is ceil(diameter/2) for trees)
  for (let n = 2; n <= 20; n++) {
    it(`path(${n}): radius <= diameter`, () => {
      const r = treeRadius(n, pathEdges(n));
      const d = treeDiameter(n, pathEdges(n));
      expect(r).toBeLessThanOrEqual(d);
    });
  }

  it('binary tree height 2 radius == 2', () => {
    // 0-1-2 + 0-3-4 (caterpillar of depth 2 from root) — actually use complete binary tree
    // 7 nodes: diameter 4, radius 2
    expect(treeRadius(7, binaryTreeEdges(7))).toBe(2);
  });

  it('binary tree height 3 radius == 3', () => {
    expect(treeRadius(15, binaryTreeEdges(15))).toBe(3);
  });

  // radius <= floor(diameter/2) + 1
  for (let n = 3; n <= 15; n++) {
    it(`path(${n}): radius <= floor(diam/2)+1`, () => {
      const r = treeRadius(n, pathEdges(n));
      const diam = treeDiameter(n, pathEdges(n));
      expect(r).toBeLessThanOrEqual(Math.floor(diam / 2) + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 5: eccentricity — 100 tests
// ---------------------------------------------------------------------------

describe('TreeUtils.eccentricity', () => {
  // path(n): eccentricity of node i == max(i, n-1-i)
  for (let n = 2; n <= 30; n++) {
    it(`path(${n}): eccentricity[i] == max(i, n-1-i)`, () => {
      const ecc = TreeUtils.eccentricity(n, pathEdges(n));
      for (let i = 0; i < n; i++) {
        expect(ecc[i]).toBe(Math.max(i, n - 1 - i));
      }
    });
  }

  // star(n>=2): centre ecc=1, leaves ecc=2
  for (let n = 3; n <= 20; n++) {
    it(`star(${n}): centre ecc=1, leaves ecc=2`, () => {
      const ecc = TreeUtils.eccentricity(n, starEdges(n));
      expect(ecc[0]).toBe(1);
      for (let i = 1; i < n; i++) expect(ecc[i]).toBe(2);
    });
  }

  it('star(2): eccentricities are both 1', () => {
    const ecc = TreeUtils.eccentricity(2, [[0, 1]]);
    expect(ecc[0]).toBe(1);
    expect(ecc[1]).toBe(1);
  });

  it('single node: eccentricity=[0]', () => {
    expect(TreeUtils.eccentricity(1, [])).toEqual([0]);
  });

  // min(ecc) = radius, max(ecc) = diameter
  for (let n = 2; n <= 20; n++) {
    it(`path(${n}): min(ecc)=radius, max(ecc)=diameter`, () => {
      const ecc = TreeUtils.eccentricity(n, pathEdges(n));
      const minEcc = Math.min(...ecc);
      const maxEcc = Math.max(...ecc);
      expect(minEcc).toBe(treeRadius(n, pathEdges(n)));
      expect(maxEcc).toBe(treeDiameter(n, pathEdges(n)));
    });
  }

  // All eccentricities are positive for n >= 2
  for (let n = 2; n <= 10; n++) {
    it(`path(${n}): all eccentricities > 0`, () => {
      const ecc = TreeUtils.eccentricity(n, pathEdges(n));
      for (const e of ecc) expect(e).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 6: allPairsShortestPaths — 100 tests
// ---------------------------------------------------------------------------

describe('TreeUtils.allPairsShortestPaths', () => {
  // Triangle inequality: d[i][j] + d[j][k] >= d[i][k]
  for (let n = 3; n <= 15; n++) {
    it(`path(${n}): triangle inequality holds`, () => {
      const dist = TreeUtils.allPairsShortestPaths(n, pathEdges(n));
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          for (let k = 0; k < n; k++) {
            expect(dist[i][j] + dist[j][k]).toBeGreaterThanOrEqual(dist[i][k]);
          }
        }
      }
    });
  }

  // Symmetry
  for (let n = 2; n <= 15; n++) {
    it(`path(${n}): symmetry d[i][j]==d[j][i]`, () => {
      const dist = TreeUtils.allPairsShortestPaths(n, pathEdges(n));
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          expect(dist[i][j]).toBe(dist[j][i]);
        }
      }
    });
  }

  // Diagonal is 0
  for (let n = 1; n <= 15; n++) {
    it(`path(${n}): diagonal is 0`, () => {
      const dist = TreeUtils.allPairsShortestPaths(n, pathEdges(n));
      for (let i = 0; i < n; i++) expect(dist[i][i]).toBe(0);
    });
  }

  // path(n): d[i][j] = |i-j|
  for (let n = 2; n <= 20; n++) {
    it(`path(${n}): d[i][j]==|i-j|`, () => {
      const dist = TreeUtils.allPairsShortestPaths(n, pathEdges(n));
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          expect(dist[i][j]).toBe(Math.abs(i - j));
        }
      }
    });
  }

  it('single node: [[0]]', () => {
    expect(TreeUtils.allPairsShortestPaths(1, [])).toEqual([[0]]);
  });

  it('two nodes: [[0,1],[1,0]]', () => {
    expect(TreeUtils.allPairsShortestPaths(2, [[0, 1]])).toEqual([[0, 1], [1, 0]]);
  });
});

// ---------------------------------------------------------------------------
// Section 7: countPairsAtDistance / countPairsAtDistance standalone — 100 tests
// ---------------------------------------------------------------------------

describe('countPairsAtDistance', () => {
  // path(n): pairs at distance d: n-d pairs (for 1 <= d <= n-1)
  for (let n = 2; n <= 20; n++) {
    for (let d = 1; d <= Math.min(n - 1, 5); d++) {
      it(`path(${n}) pairs at dist ${d} == ${n - d}`, () => {
        expect(countPairsAtDistance(n, pathEdges(n), d)).toBe(n - d);
      });
    }
  }

  // star(n): pairs at dist 1 = n-1 (centre to each leaf), pairs at dist 2 = C(n-1,2)
  for (let n = 3; n <= 15; n++) {
    it(`star(${n}) pairs at dist 1 == ${n - 1}`, () => {
      expect(countPairsAtDistance(n, starEdges(n), 1)).toBe(n - 1);
    });
    it(`star(${n}) pairs at dist 2 == ${((n - 1) * (n - 2)) / 2}`, () => {
      const expected = ((n - 1) * (n - 2)) / 2;
      expect(countPairsAtDistance(n, starEdges(n), 2)).toBe(expected);
    });
  }

  // pairs at dist 0 always 0 (no self-pairs counted)
  for (let n = 2; n <= 10; n++) {
    it(`path(${n}) pairs at dist 0 == 0`, () => {
      expect(countPairsAtDistance(n, pathEdges(n), 0)).toBe(0);
    });
  }

  // pairs at dist > diameter == 0
  for (let n = 2; n <= 10; n++) {
    it(`path(${n}) pairs at dist n == 0`, () => {
      expect(countPairsAtDistance(n, pathEdges(n), n)).toBe(0);
    });
  }

  it('single node: 0 pairs at any distance', () => {
    expect(countPairsAtDistance(1, [], 1)).toBe(0);
    expect(countPairsAtDistance(1, [], 0)).toBe(0);
  });

  // Total pairs = n*(n-1)/2
  for (let n = 2; n <= 12; n++) {
    it(`path(${n}): total pairs across all distances == n*(n-1)/2`, () => {
      let total = 0;
      for (let d = 1; d < n; d++) {
        total += countPairsAtDistance(n, pathEdges(n), d);
      }
      expect(total).toBe((n * (n - 1)) / 2);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 8: CentroidDecomposition.decompose — 100 tests
// ---------------------------------------------------------------------------

describe('CentroidDecomposition.decompose', () => {
  // decompose returns exactly n centroids
  for (let n = 1; n <= 50; n++) {
    it(`path(${n}).decompose() returns ${n} centroids`, () => {
      const cd = new CentroidDecomposition(n, pathEdges(n));
      const order = cd.decompose();
      expect(order).toHaveLength(n);
    });
  }

  for (let n = 2; n <= 30; n++) {
    it(`star(${n}).decompose() has ${n} elements`, () => {
      const cd = new CentroidDecomposition(n, starEdges(n));
      expect(cd.decompose()).toHaveLength(n);
    });
  }

  // Each node appears exactly once
  for (let n = 1; n <= 20; n++) {
    it(`path(${n}).decompose() contains each node exactly once`, () => {
      const cd = new CentroidDecomposition(n, pathEdges(n));
      const order = cd.decompose();
      const sorted = [...order].sort((a, b) => a - b);
      expect(sorted).toEqual(Array.from({ length: n }, (_, i) => i));
    });
  }

  // First element is the root centroid
  for (let n = 1; n <= 20; n++) {
    it(`path(${n}).decompose()[0] == centroid`, () => {
      const cd = new CentroidDecomposition(n, pathEdges(n));
      const order = cd.decompose();
      expect(order[0]).toBe(cd.centroid);
    });
  }

  it('single node: decompose() == [0]', () => {
    const cd = new CentroidDecomposition(1, []);
    expect(cd.decompose()).toEqual([0]);
  });

  it('two nodes: decompose() has length 2', () => {
    const cd = new CentroidDecomposition(2, [[0, 1]]);
    expect(cd.decompose()).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Section 9: CentroidDecomposition.depth — 50 tests
// ---------------------------------------------------------------------------

describe('CentroidDecomposition.depth', () => {
  // Root centroid has depth 0
  for (let n = 1; n <= 25; n++) {
    it(`path(${n}): root centroid has depth 0`, () => {
      const cd = new CentroidDecomposition(n, pathEdges(n));
      expect(cd.depth(cd.centroid)).toBe(0);
    });
  }

  // All depths are non-negative
  for (let n = 1; n <= 15; n++) {
    it(`path(${n}): all depths >= 0`, () => {
      const cd = new CentroidDecomposition(n, pathEdges(n));
      for (let i = 0; i < n; i++) {
        expect(cd.depth(i)).toBeGreaterThanOrEqual(0);
      }
    });
  }

  // star(n): root centroid (node 0) has depth 0
  for (let n = 2; n <= 10; n++) {
    it(`star(${n}): node 0 depth == 0`, () => {
      const cd = new CentroidDecomposition(n, starEdges(n));
      expect(cd.depth(cd.centroid)).toBe(0);
    });
  }

  it('single node: depth(0)==0', () => {
    const cd = new CentroidDecomposition(1, []);
    expect(cd.depth(0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Section 10: CentroidDecomposition.countPathsOfLength — 50 tests
// ---------------------------------------------------------------------------

describe('CentroidDecomposition.countPathsOfLength', () => {
  // path(n): paths of length d = n-d pairs
  for (let n = 2; n <= 15; n++) {
    for (let d = 1; d <= Math.min(n - 1, 4); d++) {
      it(`path(${n}).countPathsOfLength(${d}) == ${n - d}`, () => {
        const cd = new CentroidDecomposition(n, pathEdges(n));
        expect(cd.countPathsOfLength(d)).toBe(n - d);
      });
    }
  }

  // star(n): paths of length 1 = n-1
  for (let n = 3; n <= 10; n++) {
    it(`star(${n}).countPathsOfLength(1) == ${n - 1}`, () => {
      const cd = new CentroidDecomposition(n, starEdges(n));
      expect(cd.countPathsOfLength(1)).toBe(n - 1);
    });
  }

  // paths of length > diameter = 0
  for (let n = 2; n <= 8; n++) {
    it(`path(${n}).countPathsOfLength(${n}) == 0`, () => {
      const cd = new CentroidDecomposition(n, pathEdges(n));
      expect(cd.countPathsOfLength(n)).toBe(0);
    });
  }

  it('single node: countPathsOfLength(1)==0', () => {
    const cd = new CentroidDecomposition(1, []);
    expect(cd.countPathsOfLength(1)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Section 11: allPairsDistances and closestPairDistance — 50 extra tests
// ---------------------------------------------------------------------------

describe('CentroidDecomposition.allPairsDistances and closestPairDistance', () => {
  // allPairsDistances: sum of all pair counts = n*(n-1)/2
  for (let n = 2; n <= 15; n++) {
    it(`path(${n}).allPairsDistances: total pairs == n*(n-1)/2`, () => {
      const cd = new CentroidDecomposition(n, pathEdges(n));
      const distMap = cd.allPairsDistances(n - 1);
      let total = 0;
      for (const cnt of distMap.values()) total += cnt;
      expect(total).toBe((n * (n - 1)) / 2);
    });
  }

  // closestPairDistance == 1 for any connected tree with >= 2 nodes
  for (let n = 2; n <= 20; n++) {
    it(`path(${n}).closestPairDistance() == 1`, () => {
      const cd = new CentroidDecomposition(n, pathEdges(n));
      expect(cd.closestPairDistance()).toBe(1);
    });
  }

  it('single node: closestPairDistance()==0', () => {
    const cd = new CentroidDecomposition(1, []);
    expect(cd.closestPairDistance()).toBe(0);
  });

  // allPairsDistances for path(5): dist1=4, dist2=3, dist3=2, dist4=1
  it('path(5) allPairsDistances checks', () => {
    const cd = new CentroidDecomposition(5, pathEdges(5));
    const distMap = cd.allPairsDistances(4);
    expect(distMap.get(1)).toBe(4);
    expect(distMap.get(2)).toBe(3);
    expect(distMap.get(3)).toBe(2);
    expect(distMap.get(4)).toBe(1);
  });

  // subtreeSize (rooted at 0)
  for (let n = 2; n <= 15; n++) {
    it(`path(${n}): subtreeSize(0) == ${n}`, () => {
      const cd = new CentroidDecomposition(n, pathEdges(n));
      expect(cd.subtreeSize(0)).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 12: getCentroid method — 50 extra tests
// ---------------------------------------------------------------------------

describe('CentroidDecomposition.getCentroid', () => {
  /** Verify centroid property */
  function verifyCentroid(n: number, edges: Array<[number, number]>, c: number): boolean {
    const adj: number[][] = Array.from({ length: n }, () => []);
    for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
    const visited = new Array<boolean>(n).fill(false);
    visited[c] = true;
    for (let start = 0; start < n; start++) {
      if (visited[start]) continue;
      const q = [start];
      visited[start] = true;
      let head = 0;
      let compSize = 0;
      while (head < q.length) {
        const node = q[head++];
        compSize++;
        for (const nb of adj[node]) {
          if (!visited[nb]) { visited[nb] = true; q.push(nb); }
        }
      }
      if (compSize > Math.floor(n / 2)) return false;
    }
    return true;
  }

  for (let n = 2; n <= 30; n++) {
    it(`path(${n}): getCentroid(0,${n}) satisfies centroid property`, () => {
      const cd = new CentroidDecomposition(n, pathEdges(n));
      const c = cd.getCentroid(0, n);
      expect(verifyCentroid(n, pathEdges(n), c)).toBe(true);
    });
  }

  for (let n = 2; n <= 20; n++) {
    it(`star(${n}): getCentroid(0,${n}) == 0`, () => {
      const cd = new CentroidDecomposition(n, starEdges(n));
      const c = cd.getCentroid(0, n);
      expect(c).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 13: Edge cases and cross-checks — 100 extra tests
// ---------------------------------------------------------------------------

describe('Cross-checks and edge cases', () => {
  // TreeUtils.radius <= TreeUtils.diameter for various trees
  for (let n = 2; n <= 20; n++) {
    it(`star(${n}): radius <= diameter`, () => {
      const r = TreeUtils.radius(n, starEdges(n));
      const d = TreeUtils.diameter(n, starEdges(n));
      expect(r).toBeLessThanOrEqual(d);
    });
  }

  // diameter = max eccentricity
  for (let n = 2; n <= 15; n++) {
    it(`path(${n}): diameter == max(eccentricity)`, () => {
      const ecc = TreeUtils.eccentricity(n, pathEdges(n));
      const d = TreeUtils.diameter(n, pathEdges(n));
      expect(Math.max(...ecc)).toBe(d);
    });
  }

  // radius = min eccentricity
  for (let n = 2; n <= 15; n++) {
    it(`path(${n}): radius == min(eccentricity)`, () => {
      const ecc = TreeUtils.eccentricity(n, pathEdges(n));
      const r = TreeUtils.radius(n, pathEdges(n));
      expect(Math.min(...ecc)).toBe(r);
    });
  }

  // path(n) diameter + 1 == n
  for (let n = 1; n <= 20; n++) {
    it(`path(${n}): diameter + 1 == n`, () => {
      expect(TreeUtils.diameter(n, pathEdges(n)) + 1).toBe(n);
    });
  }

  // star(n>=3): diameter == 2
  for (let n = 3; n <= 15; n++) {
    it(`star(${n}) diameter == 2`, () => {
      expect(TreeUtils.diameter(n, starEdges(n))).toBe(2);
    });
  }

  // countPairsAtDistance path(5) spot-checks
  it('path(5) pairs at dist 1 == 4', () => {
    expect(countPairsAtDistance(5, pathEdges(5), 1)).toBe(4);
  });
  it('path(5) pairs at dist 2 == 3', () => {
    expect(countPairsAtDistance(5, pathEdges(5), 2)).toBe(3);
  });
  it('path(5) pairs at dist 3 == 2', () => {
    expect(countPairsAtDistance(5, pathEdges(5), 3)).toBe(2);
  });
  it('path(5) pairs at dist 4 == 1', () => {
    expect(countPairsAtDistance(5, pathEdges(5), 4)).toBe(1);
  });

  // subtreeSizes: sum for star
  for (let n = 2; n <= 15; n++) {
    it(`star(${n}): sum of subtreeSizes == ${n + (n - 1)}`, () => {
      const sizes = TreeUtils.subtreeSizes(n, starEdges(n), 0);
      const sum = sizes.reduce((a, b) => a + b, 0);
      // root contributes n, each leaf contributes 1 → n + (n-1)
      expect(sum).toBe(n + (n - 1));
    });
  }

  // CentroidDecomposition: centroid property
  for (let n = 1; n <= 20; n++) {
    it(`CentroidDecomposition path(${n}): centroid property`, () => {
      const cd = new CentroidDecomposition(n, pathEdges(n));
      if (n === 1) {
        expect(cd.centroid).toBe(0);
        return;
      }
      const c = cd.centroid;
      const edges = pathEdges(n);
      const adj: number[][] = Array.from({ length: n }, () => []);
      for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u); }
      const visited = new Array<boolean>(n).fill(false);
      visited[c] = true;
      for (let start = 0; start < n; start++) {
        if (visited[start]) continue;
        const q = [start];
        visited[start] = true;
        let head = 0; let compSize = 0;
        while (head < q.length) {
          const node = q[head++]; compSize++;
          for (const nb of adj[node]) if (!visited[nb]) { visited[nb] = true; q.push(nb); }
        }
        expect(compSize).toBeLessThanOrEqual(Math.floor(n / 2));
      }
    });
  }

  // path(n) centroid is floor((n-1)/2)
  for (let n = 1; n <= 20; n++) {
    it(`path(${n}): centroid is middle node`, () => {
      const cd = new CentroidDecomposition(n, pathEdges(n));
      // The centroid of a path is approximately the middle
      const c = cd.centroid;
      // It should be either floor((n-1)/2) or ceil((n-1)/2)
      const mid = Math.floor((n - 1) / 2);
      const midCeil = Math.ceil((n - 1) / 2);
      expect(c === mid || c === midCeil).toBe(true);
    });
  }
});
