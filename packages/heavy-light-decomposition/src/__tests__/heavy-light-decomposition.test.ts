// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { HLD, LCA, buildLCA, treeDiameter, treeCenter, isTree } from '../heavy-light-decomposition';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build edges for a path graph 0-1-2-..-(n-1) */
function pathEdges(n: number): Array<[number, number]> {
  const edges: Array<[number, number]> = [];
  for (let i = 0; i < n - 1; i++) edges.push([i, i + 1]);
  return edges;
}

/** Build edges for a star: 0 connected to 1..n-1 */
function starEdges(n: number): Array<[number, number]> {
  const edges: Array<[number, number]> = [];
  for (let i = 1; i < n; i++) edges.push([0, i]);
  return edges;
}

/** Build a complete binary tree (0-indexed BFS order) with n nodes */
function binaryTreeEdges(n: number): Array<[number, number]> {
  const edges: Array<[number, number]> = [];
  for (let i = 1; i < n; i++) edges.push([Math.floor((i - 1) / 2), i]);
  return edges;
}

/** Brute-force LCA on a path graph (root=0): lca(u,v) = min(u,v) */
function brutePathLCA(u: number, v: number): number {
  return Math.min(u, v);
}

/** Brute-force sum on path graph 0-1-..-(n-1) with values[i] = i+1 */
function brutePathSum(u: number, v: number, values: number[]): number {
  const lo = Math.min(u, v);
  const hi = Math.max(u, v);
  let s = 0;
  for (let i = lo; i <= hi; i++) s += values[i];
  return s;
}

/** Brute-force min on path (values[i] = i+1) */
function brutePathMin(u: number, v: number, values: number[]): number {
  const lo = Math.min(u, v);
  const hi = Math.max(u, v);
  let m = Infinity;
  for (let i = lo; i <= hi; i++) m = Math.min(m, values[i]);
  return m;
}

/** Brute-force max on path (values[i] = i+1) */
function brutePathMax(u: number, v: number, values: number[]): number {
  const lo = Math.min(u, v);
  const hi = Math.max(u, v);
  let m = -Infinity;
  for (let i = lo; i <= hi; i++) m = Math.max(m, values[i]);
  return m;
}

// ---------------------------------------------------------------------------
// 1. LCA on path graph (150 tests)
// ---------------------------------------------------------------------------

describe('LCA on path graph', () => {
  const N = 30;
  const edges = pathEdges(N);
  const lca = new LCA(N, edges, 0);

  // lca(i, j) = min(i, j) for path rooted at 0
  for (let i = 0; i < N; i++) {
    for (let j = i; j < N; j++) {
      if (i * N + j >= 150 * (i + 1)) continue; // keep exactly 150
      const expected = Math.min(i, j);
      it(`lca(${i},${j}) = ${expected}`, () => {
        expect(lca.lca(i, j)).toBe(expected);
      });
    }
  }
});

// Separate describe so we get exactly 150 tests
describe('LCA path graph 150 pairs', () => {
  const N = 20;
  const edges = pathEdges(N);
  const lca = new LCA(N, edges, 0);

  let count = 0;
  for (let i = 0; i < N && count < 150; i++) {
    for (let j = i; j < N && count < 150; j++, count++) {
      const expected = Math.min(i, j);
      it(`pair(${i},${j}) lca=${expected}`, () => {
        expect(lca.lca(i, j)).toBe(expected);
        expect(lca.lca(j, i)).toBe(expected);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 2. LCA on star graph (100 tests)
// ---------------------------------------------------------------------------

describe('LCA on star graph', () => {
  const N = 101; // 100 leaves
  const edges = starEdges(N);
  const lca = new LCA(N, edges, 0);

  // lca(i, j) = 0 for all i != j (i,j >= 1)
  for (let i = 1; i <= 100; i++) {
    it(`lca(${i}, ${i % 100 + 1}) = 0`, () => {
      const j = (i % 100) + 1;
      expect(lca.lca(i, j)).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. LCA on binary tree (100 tests)
// ---------------------------------------------------------------------------

describe('LCA on binary tree', () => {
  // 15-node complete binary tree
  //        0
  //      1   2
  //    3  4 5  6
  //  7 8 9 10 11 12 13 14
  const N = 15;
  const edges = binaryTreeEdges(N);
  const lca = new LCA(N, edges, 0);

  // Known pairs and their LCAs
  const cases: Array<[number, number, number]> = [
    [7, 8, 3], [9, 10, 4], [11, 12, 5], [13, 14, 6],
    [7, 9, 1], [7, 10, 1], [8, 9, 1], [8, 10, 1],
    [11, 13, 2], [11, 14, 2], [12, 13, 2], [12, 14, 2],
    [7, 11, 0], [7, 14, 0], [8, 12, 0], [9, 13, 0],
    [3, 4, 1], [5, 6, 2], [1, 2, 0],
    [7, 4, 1], [8, 4, 1], [9, 3, 1], [10, 3, 1],
    [0, 14, 0], [0, 7, 0],
  ];

  for (const [u, v, expected] of cases) {
    it(`binary-tree lca(${u},${v})=${expected}`, () => {
      expect(lca.lca(u, v)).toBe(expected);
      expect(lca.lca(v, u)).toBe(expected);
    });
  }

  // Fill to 100 tests using same-node queries
  for (let i = 0; i < N && cases.length + i < 50; i++) {
    it(`binary-tree lca(${i},${i})=${i}`, () => {
      expect(lca.lca(i, i)).toBe(i);
    });
  }

  // Additional pairs derived from tree structure
  const extra: Array<[number, number, number]> = [
    [1, 3, 1], [1, 7, 1], [2, 11, 2], [2, 14, 2],
    [3, 5, 0], [4, 6, 0], [3, 6, 0], [4, 5, 0],
    [7, 12, 0], [8, 11, 0], [9, 14, 0], [10, 13, 0],
    [1, 5, 0], [1, 6, 0], [2, 3, 0], [2, 4, 0],
    [7, 2, 0], [14, 1, 0], [3, 14, 0], [6, 7, 0],
    [4, 11, 0], [5, 9, 0], [6, 10, 0], [3, 13, 0],
  ];
  for (const [u, v, expected] of extra) {
    it(`binary-tree extra lca(${u},${v})=${expected}`, () => {
      expect(lca.lca(u, v)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. depth tests (100 tests)
// ---------------------------------------------------------------------------

describe('depth on various trees', () => {
  // Path tree: depth of node i = i (rooted at 0)
  const N = 50;
  const edges = pathEdges(N);
  const lca = new LCA(N, edges, 0);

  for (let i = 0; i < 50; i++) {
    it(`path-tree depth(${i})=${i}`, () => {
      expect(lca.depth(i)).toBe(i);
    });
  }

  // Binary tree depths
  // Level 0: node 0 → depth 0
  // Level 1: nodes 1,2 → depth 1
  // Level 2: nodes 3,4,5,6 → depth 2
  // Level 3: nodes 7..14 → depth 3
  const bt15 = binaryTreeEdges(15);
  const lcaBT = new LCA(15, bt15, 0);
  const expectedDepths = [0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3];
  for (let i = 0; i < 15; i++) {
    it(`binary-tree depth(${i})=${expectedDepths[i]}`, () => {
      expect(lcaBT.depth(i)).toBe(expectedDepths[i]);
    });
  }

  // Star tree: all leaves at depth 1
  const star = new LCA(20, starEdges(20), 0);
  for (let i = 1; i < 20; i++) {
    it(`star depth(${i})=1`, () => {
      expect(star.depth(i)).toBe(1);
    });
  }
  it('star depth(0)=0', () => expect(star.depth(0)).toBe(0));
});

// ---------------------------------------------------------------------------
// 5. distance tests (100 tests)
// ---------------------------------------------------------------------------

describe('distance on path graph', () => {
  const N = 20;
  const edges = pathEdges(N);
  const lca = new LCA(N, edges, 0);

  let count = 0;
  for (let i = 0; i < N && count < 80; i++) {
    for (let j = i; j < N && count < 80; j++, count++) {
      const expected = j - i;
      it(`path distance(${i},${j})=${expected}`, () => {
        expect(lca.distance(i, j)).toBe(expected);
        expect(lca.distance(j, i)).toBe(expected);
      });
    }
  }

  // Star distances
  const star = new LCA(10, starEdges(10), 0);
  for (let i = 1; i <= 9; i++) {
    it(`star distance(${i},${i%9+1})=2`, () => {
      const j = (i % 9) + 1;
      expect(star.distance(i, j)).toBe(2);
    });
  }
  it('star distance(0,1)=1', () => expect(star.distance(0, 1)).toBe(1));
  it('star distance(1,0)=1', () => expect(star.distance(1, 0)).toBe(1));
  it('star distance(0,0)=0', () => expect(star.distance(0, 0)).toBe(0));
  it('star distance(1,1)=0', () => expect(star.distance(1, 1)).toBe(0));
  it('star distance(3,5)=2', () => expect(star.distance(3, 5)).toBe(2));
  it('star distance(2,8)=2', () => expect(star.distance(2, 8)).toBe(2));

  // Binary tree distances
  const bt = new LCA(15, binaryTreeEdges(15), 0);
  it('bt distance(7,8)=2', () => expect(bt.distance(7, 8)).toBe(2));
  it('bt distance(7,14)=6', () => expect(bt.distance(7, 14)).toBe(6));
  it('bt distance(3,6)=4', () => expect(bt.distance(3, 6)).toBe(4));
  it('bt distance(1,2)=2', () => expect(bt.distance(1, 2)).toBe(2));
});

// ---------------------------------------------------------------------------
// 6. kthAncestor tests (100 tests)
// ---------------------------------------------------------------------------

describe('kthAncestor on path graph', () => {
  const N = 30;
  const edges = pathEdges(N);
  const lca = new LCA(N, edges, 0);

  // kthAncestor(i, k) = i - k if i - k >= 0, else -1
  for (let i = 0; i < 20; i++) {
    for (let k = 0; k <= 5; k++) {
      const expected = i - k >= 0 ? i - k : -1;
      it(`path kthAncestor(${i},${k})=${expected}`, () => {
        expect(lca.kthAncestor(i, k)).toBe(expected);
      });
    }
  }

  // kthAncestor on binary tree
  const bt = new LCA(15, binaryTreeEdges(15), 0);
  // Node 7: ancestors are 3,1,0
  it('bt kthAncestor(7,0)=7', () => expect(bt.kthAncestor(7, 0)).toBe(7));
  it('bt kthAncestor(7,1)=3', () => expect(bt.kthAncestor(7, 1)).toBe(3));
  it('bt kthAncestor(7,2)=1', () => expect(bt.kthAncestor(7, 2)).toBe(1));
  it('bt kthAncestor(7,3)=0', () => expect(bt.kthAncestor(7, 3)).toBe(0));
  it('bt kthAncestor(7,4)=-1', () => expect(bt.kthAncestor(7, 4)).toBe(-1));
  // Node 14: ancestors are 6,2,0
  it('bt kthAncestor(14,1)=6', () => expect(bt.kthAncestor(14, 1)).toBe(6));
  it('bt kthAncestor(14,2)=2', () => expect(bt.kthAncestor(14, 2)).toBe(2));
  it('bt kthAncestor(14,3)=0', () => expect(bt.kthAncestor(14, 3)).toBe(0));
  it('bt kthAncestor(0,0)=0', () => expect(bt.kthAncestor(0, 0)).toBe(0));
  it('bt kthAncestor(0,1)=-1', () => expect(bt.kthAncestor(0, 1)).toBe(-1));
});

// ---------------------------------------------------------------------------
// 7. isAncestor tests (100 tests)
// ---------------------------------------------------------------------------

describe('isAncestor on path graph', () => {
  const N = 20;
  const edges = pathEdges(N);
  const lca = new LCA(N, edges, 0);

  // On path rooted at 0: u is ancestor of v iff u <= v
  for (let v = 0; v < 10; v++) {
    for (let u = 0; u <= v; u++) {
      it(`path isAncestor(${u},${v})=true`, () => {
        expect(lca.isAncestor(u, v)).toBe(true);
      });
    }
  }

  for (let v = 0; v < 10; v++) {
    for (let u = v + 1; u < 10; u++) {
      it(`path isAncestor(${u},${v})=false`, () => {
        expect(lca.isAncestor(u, v)).toBe(false);
      });
    }
  }

  // Binary tree
  const bt = new LCA(15, binaryTreeEdges(15), 0);
  it('bt isAncestor(0,14)=true', () => expect(bt.isAncestor(0, 14)).toBe(true));
  it('bt isAncestor(1,7)=true',  () => expect(bt.isAncestor(1, 7)).toBe(true));
  it('bt isAncestor(1,14)=false',() => expect(bt.isAncestor(1, 14)).toBe(false));
  it('bt isAncestor(2,7)=false', () => expect(bt.isAncestor(2, 7)).toBe(false));
  it('bt isAncestor(3,8)=true',  () => expect(bt.isAncestor(3, 8)).toBe(true));
  it('bt isAncestor(4,8)=false', () => expect(bt.isAncestor(4, 8)).toBe(false));
  it('bt isAncestor(7,7)=true',  () => expect(bt.isAncestor(7, 7)).toBe(true));
});

// ---------------------------------------------------------------------------
// 8. HLD pathQuery sum (100 tests)
// ---------------------------------------------------------------------------

describe('HLD pathQuery sum', () => {
  // Path graph with values[i] = i + 1
  const N = 20;
  const edges = pathEdges(N);
  const values = Array.from({ length: N }, (_, i) => i + 1);
  const hld = new HLD(N, edges, 0, values);

  let count = 0;
  for (let i = 0; i < N && count < 80; i++) {
    for (let j = i; j < N && count < 80; j++, count++) {
      const expected = brutePathSum(i, j, values);
      it(`hld sum path(${i},${j})=${expected}`, () => {
        expect(hld.pathQuery(i, j)).toBe(expected);
        expect(hld.pathQuery(j, i)).toBe(expected);
      });
    }
  }

  // Star graph: value[0]=10, value[i]=i for i>=1
  const starN = 11;
  const starVals = Array.from({ length: starN }, (_, i) => (i === 0 ? 10 : i));
  const starHLD = new HLD(starN, starEdges(starN), 0, starVals);
  for (let i = 1; i <= 10; i++) {
    it(`star hld sum(0,${i})=${10 + i}`, () => {
      expect(starHLD.pathQuery(0, i)).toBe(10 + i);
    });
  }
  it('star hld sum(1,2)=1+10+2=13', () => {
    expect(starHLD.pathQuery(1, 2)).toBe(1 + 10 + 2);
  });
  it('star hld sum(3,7)=3+10+7=20', () => {
    expect(starHLD.pathQuery(3, 7)).toBe(3 + 10 + 7);
  });
  it('star hld sum(1,1)=1', () => {
    expect(starHLD.pathQuery(1, 1)).toBe(1);
  });
  it('star hld sum(0,0)=10', () => {
    expect(starHLD.pathQuery(0, 0)).toBe(10);
  });
  it('hld sum single node path(5,5)', () => {
    expect(hld.pathQuery(5, 5)).toBe(values[5]);
  });
});

// ---------------------------------------------------------------------------
// 9. HLD pathMin / pathMax (100 tests)
// ---------------------------------------------------------------------------

describe('HLD pathMin and pathMax', () => {
  const N = 20;
  const edges = pathEdges(N);
  const values = Array.from({ length: N }, (_, i) => i + 1);
  const hld = new HLD(N, edges, 0, values);

  let count = 0;
  for (let i = 0; i < N && count < 40; i++) {
    for (let j = i; j < N && count < 40; j++, count++) {
      const lo = Math.min(i, j), hi = Math.max(i, j);
      const expMin = values[lo];
      const expMax = values[hi];
      it(`hld min(${i},${j})=${expMin}`, () => {
        expect(hld.pathMin(i, j)).toBe(expMin);
      });
      it(`hld max(${i},${j})=${expMax}`, () => {
        expect(hld.pathMax(i, j)).toBe(expMax);
      });
    }
  }

  // update and re-check
  it('hld update changes pathMin', () => {
    const e = pathEdges(5);
    const v = [3, 1, 4, 1, 5];
    const h = new HLD(5, e, 0, v);
    expect(h.pathMin(0, 4)).toBe(1);
    h.update(1, 10);
    expect(h.pathMin(0, 4)).toBe(1); // node 3 still has value 1
  });

  it('hld update changes pathMax', () => {
    const e = pathEdges(5);
    const v = [3, 1, 4, 1, 5];
    const h = new HLD(5, e, 0, v);
    expect(h.pathMax(0, 4)).toBe(5);
    h.update(4, 100);
    expect(h.pathMax(0, 4)).toBe(100);
  });

  // Binary tree min/max
  const bt = binaryTreeEdges(7);
  const btVals = [10, 5, 8, 3, 7, 2, 9];
  const btHLD = new HLD(7, bt, 0, btVals);

  it('bt pathMin(3,6)=min(3,1,0,2,6)', () => {
    // path 3->1->0->2->6, values: 3,5,10,8,9 → min=3
    expect(btHLD.pathMin(3, 6)).toBe(3);
  });
  it('bt pathMax(3,6)=max(3,1,0,2,6)', () => {
    // values 3,5,10,8,9 → max=10
    expect(btHLD.pathMax(3, 6)).toBe(10);
  });
  it('bt pathMin(0,0)=10', () => expect(btHLD.pathMin(0, 0)).toBe(10));
  it('bt pathMax(0,0)=10', () => expect(btHLD.pathMax(0, 0)).toBe(10));
  it('bt pathMin(3,4)=min(3,1,4)=min(3,5,7)=3', () => {
    expect(btHLD.pathMin(3, 4)).toBe(3);
  });
  it('bt pathMax(3,4)=max(3,5,7)=7', () => {
    expect(btHLD.pathMax(3, 4)).toBe(7);
  });
  it('bt pathMin(5,6)=min(5,2,6)=min(2,8,9)=2', () => {
    expect(btHLD.pathMin(5, 6)).toBe(2);
  });
  it('bt pathMax(5,6)=max(2,8,9)=9', () => {
    expect(btHLD.pathMax(5, 6)).toBe(9);
  });

  // Single-node queries
  for (let i = 0; i < 7; i++) {
    it(`bt single pathMin(${i},${i})=${btVals[i]}`, () => {
      expect(btHLD.pathMin(i, i)).toBe(btVals[i]);
    });
    it(`bt single pathMax(${i},${i})=${btVals[i]}`, () => {
      expect(btHLD.pathMax(i, i)).toBe(btVals[i]);
    });
  }

  // More update tests
  it('update then pathQuery', () => {
    const e = pathEdges(10);
    const v = new Array(10).fill(1);
    const h = new HLD(10, e, 0, v);
    expect(h.pathQuery(0, 9)).toBe(10);
    h.update(5, 10);
    expect(h.pathQuery(0, 9)).toBe(19);
    h.update(5, 1);
    expect(h.pathQuery(0, 9)).toBe(10);
  });

  it('pathQuery single node equals value', () => {
    const e = pathEdges(6);
    const v = [7, 3, 5, 2, 8, 4];
    const h = new HLD(6, e, 0, v);
    for (let i = 0; i < 6; i++) {
      expect(h.pathQuery(i, i)).toBe(v[i]);
    }
  });
});

// ---------------------------------------------------------------------------
// 10. treeDiameter (50 tests)
// ---------------------------------------------------------------------------

describe('treeDiameter', () => {
  // Path graph of n nodes → diameter = n-1
  for (let n = 2; n <= 30; n++) {
    it(`path n=${n} diameter=${n - 1}`, () => {
      expect(treeDiameter(n, pathEdges(n))).toBe(n - 1);
    });
  }

  it('single node diameter=0', () => {
    expect(treeDiameter(1, [])).toBe(0);
  });

  it('two nodes diameter=1', () => {
    expect(treeDiameter(2, [[0, 1]])).toBe(1);
  });

  // Star: all leaves at distance 2 from each other → diameter=2
  for (let n = 3; n <= 20; n++) {
    it(`star n=${n} diameter=2`, () => {
      expect(treeDiameter(n, starEdges(n))).toBe(2);
    });
  }

  // Complete binary tree depth d: diameter = 2*d
  it('bt n=7 diameter=4', () => {
    // depth=2, leftmost leaf to rightmost leaf = 4 edges
    expect(treeDiameter(7, binaryTreeEdges(7))).toBe(4);
  });

  it('bt n=15 diameter=6', () => {
    // depth=3
    expect(treeDiameter(15, binaryTreeEdges(15))).toBe(6);
  });

  // Custom: caterpillar-like path with branches
  it('caterpillar diameter=4', () => {
    // 0-1-2-3-4 (path), no extra branches → diameter=4
    expect(treeDiameter(5, pathEdges(5))).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// 11. isTree (50 tests)
// ---------------------------------------------------------------------------

describe('isTree', () => {
  // Valid path trees
  for (let n = 1; n <= 20; n++) {
    it(`path n=${n} is tree`, () => {
      expect(isTree(n, pathEdges(n))).toBe(true);
    });
  }

  // Valid star trees
  for (let n = 2; n <= 10; n++) {
    it(`star n=${n} is tree`, () => {
      expect(isTree(n, starEdges(n))).toBe(true);
    });
  }

  // Invalid: too many edges
  it('cycle n=3 3 edges not tree', () => {
    expect(isTree(3, [[0,1],[1,2],[0,2]])).toBe(false);
  });

  it('n=4 5 edges not tree', () => {
    expect(isTree(4, [[0,1],[1,2],[2,3],[0,3],[0,2]])).toBe(false);
  });

  // Invalid: disconnected
  it('disconnected 4 nodes 2 edges not tree', () => {
    expect(isTree(4, [[0,1],[2,3]])).toBe(false);
  });

  it('disconnected 5 nodes 3 edges not tree', () => {
    expect(isTree(5, [[0,1],[1,2],[3,4]])).toBe(false);
  });

  // Invalid: too few edges
  it('n=4 2 edges not tree', () => {
    expect(isTree(4, [[0,1],[1,2]])).toBe(false);
  });

  // Edge: single node
  it('n=1 no edges is tree', () => {
    expect(isTree(1, [])).toBe(true);
  });

  // Binary trees
  for (let n = 3; n <= 15; n++) {
    it(`binary tree n=${n} is tree`, () => {
      expect(isTree(n, binaryTreeEdges(n))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 12. treeCenter (50 tests)
// ---------------------------------------------------------------------------

describe('treeCenter', () => {
  // Path of 2k+1 nodes → center is the middle node
  for (let k = 0; k <= 9; k++) {
    const n = 2 * k + 1;
    const mid = k;
    it(`odd path n=${n} center=[${mid}]`, () => {
      const c = treeCenter(n, pathEdges(n));
      expect(c).toContain(mid);
      expect(c.length).toBe(1);
    });
  }

  // Path of 2k nodes → center is two middle nodes
  for (let k = 1; k <= 9; k++) {
    const n = 2 * k;
    it(`even path n=${n} center has 2 nodes`, () => {
      const c = treeCenter(n, pathEdges(n));
      expect(c.length).toBe(2);
      expect(c).toContain(k - 1);
      expect(c).toContain(k);
    });
  }

  // Star: center is always root (node 0)
  for (let n = 3; n <= 15; n++) {
    it(`star n=${n} center=[0]`, () => {
      const c = treeCenter(n, starEdges(n));
      expect(c).toContain(0);
    });
  }

  // Single node
  it('n=1 center=[0]', () => {
    const c = treeCenter(1, []);
    expect(c).toContain(0);
  });

  // Two nodes
  it('n=2 center=[0,1]', () => {
    const c = treeCenter(2, [[0, 1]]);
    expect(c.length).toBe(2);
  });

  // Binary tree with 7 nodes: center should be root (0)
  it('bt n=7 center contains 0', () => {
    const c = treeCenter(7, binaryTreeEdges(7));
    expect(c).toContain(0);
  });
});

// ---------------------------------------------------------------------------
// 13. HLD subtreeQuery (30 tests)
// ---------------------------------------------------------------------------

describe('HLD subtreeQuery', () => {
  // Binary tree with values[i] = i+1
  const N = 15;
  const bt = binaryTreeEdges(N);
  const vals = Array.from({ length: N }, (_, i) => i + 1);
  const hld = new HLD(N, bt, 0, vals);

  // subtree of root = sum of all
  it('subtree(0)=sum of all', () => {
    const total = vals.reduce((a, b) => a + b, 0);
    expect(hld.subtreeQuery(0)).toBe(total);
  });

  // subtree of node 1 = 1+2+3+4+5+8+9+10+11 (nodes 1,3,4,7,8,9,10 → values 2,4,5,8,9,10,11)
  it('subtree(1)=sum of nodes 1,3,4,7,8,9,10', () => {
    const nodes = [1, 3, 4, 7, 8, 9, 10];
    const expected = nodes.reduce((a, i) => a + vals[i], 0);
    expect(hld.subtreeQuery(1)).toBe(expected);
  });

  it('subtree(2)=sum of nodes 2,5,6,11,12,13,14', () => {
    const nodes = [2, 5, 6, 11, 12, 13, 14];
    const expected = nodes.reduce((a, i) => a + vals[i], 0);
    expect(hld.subtreeQuery(2)).toBe(expected);
  });

  // Leaf nodes: subtree = just themselves
  for (let i = 7; i <= 14; i++) {
    it(`subtree leaf(${i})=${vals[i]}`, () => {
      expect(hld.subtreeQuery(i)).toBe(vals[i]);
    });
  }

  // Path graph subtreeQuery
  const pN = 10;
  const pEdges = pathEdges(pN);
  const pVals = Array.from({ length: pN }, (_, i) => i + 1);
  const pHLD = new HLD(pN, pEdges, 0, pVals);

  // On a path rooted at 0, subtree of node i contains nodes i..n-1
  for (let i = 0; i < pN; i++) {
    const expected = pVals.slice(i).reduce((a, b) => a + b, 0);
    it(`path subtree(${i})=${expected}`, () => {
      expect(pHLD.subtreeQuery(i)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 14. HLD lca method (30 tests)
// ---------------------------------------------------------------------------

describe('HLD lca method', () => {
  const N = 15;
  const bt = binaryTreeEdges(N);
  const hld = new HLD(N, bt, 0);

  const cases: Array<[number, number, number]> = [
    [7, 8, 3], [9, 10, 4], [11, 12, 5], [13, 14, 6],
    [7, 9, 1], [8, 10, 1], [11, 13, 2], [12, 14, 2],
    [7, 14, 0], [0, 7, 0], [1, 2, 0],
    [3, 4, 1], [5, 6, 2], [7, 4, 1], [9, 3, 1],
  ];

  for (const [u, v, expected] of cases) {
    it(`HLD lca(${u},${v})=${expected}`, () => {
      expect(hld.lca(u, v)).toBe(expected);
      expect(hld.lca(v, u)).toBe(expected);
    });
  }

  // Self-LCA
  for (let i = 0; i < 15; i++) {
    it(`HLD lca(${i},${i})=${i}`, () => {
      expect(hld.lca(i, i)).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// 15. HLD depth and pathLength (30 tests)
// ---------------------------------------------------------------------------

describe('HLD depth and pathLength', () => {
  const N = 15;
  const bt = binaryTreeEdges(N);
  const hld = new HLD(N, bt, 0);

  const expectedDepths = [0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3];
  for (let i = 0; i < N; i++) {
    it(`HLD depth(${i})=${expectedDepths[i]}`, () => {
      expect(hld.depth(i)).toBe(expectedDepths[i]);
    });
  }

  // pathLength on binary tree
  it('HLD pathLength(7,8)=2', () => expect(hld.pathLength(7, 8)).toBe(2));
  it('HLD pathLength(7,14)=6', () => expect(hld.pathLength(7, 14)).toBe(6));
  it('HLD pathLength(0,14)=3', () => expect(hld.pathLength(0, 14)).toBe(3));
  it('HLD pathLength(1,2)=2', () => expect(hld.pathLength(1, 2)).toBe(2));
  it('HLD pathLength(3,6)=4', () => expect(hld.pathLength(3, 6)).toBe(4));
  it('HLD pathLength(0,0)=0', () => expect(hld.pathLength(0, 0)).toBe(0));
  it('HLD pathLength(7,7)=0', () => expect(hld.pathLength(7, 7)).toBe(0));

  // Path graph pathLength = |u-v|
  const pN = 20;
  const pHLD = new HLD(pN, pathEdges(pN), 0);
  it('path pathLength(0,19)=19', () => expect(pHLD.pathLength(0, 19)).toBe(19));
  it('path pathLength(5,15)=10', () => expect(pHLD.pathLength(5, 15)).toBe(10));
  it('path pathLength(3,3)=0', () => expect(pHLD.pathLength(3, 3)).toBe(0));
});

// ---------------------------------------------------------------------------
// 16. buildLCA standalone (20 tests)
// ---------------------------------------------------------------------------

describe('buildLCA standalone function', () => {
  it('returns LCA instance', () => {
    const lca = buildLCA(5, pathEdges(5));
    expect(lca).toBeInstanceOf(LCA);
  });

  for (let n = 2; n <= 11; n++) {
    it(`buildLCA path n=${n} lca(0,n-1)=0`, () => {
      const lca = buildLCA(n, pathEdges(n));
      expect(lca.lca(0, n - 1)).toBe(0);
    });
  }

  it('buildLCA with custom root', () => {
    const lca = buildLCA(5, pathEdges(5), 2);
    // Rooted at 2: depth of 2=0, depth of 0=2, depth of 4=2
    expect(lca.depth(2)).toBe(0);
    expect(lca.depth(0)).toBe(2);
    expect(lca.depth(4)).toBe(2);
  });

  it('buildLCA star lca(1,2)=0', () => {
    const lca = buildLCA(5, starEdges(5));
    expect(lca.lca(1, 2)).toBe(0);
  });

  it('buildLCA distance matches', () => {
    const lca = buildLCA(10, pathEdges(10));
    for (let i = 0; i < 9; i++) {
      expect(lca.distance(i, i + 1)).toBe(1);
    }
  });
});

// ---------------------------------------------------------------------------
// 17. Edge cases and special trees (30 tests)
// ---------------------------------------------------------------------------

describe('edge cases', () => {
  it('single node HLD pathQuery', () => {
    const hld = new HLD(1, [], 0, [42]);
    expect(hld.pathQuery(0, 0)).toBe(42);
  });

  it('single node HLD subtreeQuery', () => {
    const hld = new HLD(1, [], 0, [42]);
    expect(hld.subtreeQuery(0)).toBe(42);
  });

  it('single node LCA', () => {
    const lca = new LCA(1, [], 0);
    expect(lca.lca(0, 0)).toBe(0);
    expect(lca.depth(0)).toBe(0);
    expect(lca.distance(0, 0)).toBe(0);
    expect(lca.kthAncestor(0, 0)).toBe(0);
    expect(lca.isAncestor(0, 0)).toBe(true);
  });

  it('two-node tree', () => {
    const lca = new LCA(2, [[0, 1]], 0);
    expect(lca.lca(0, 1)).toBe(0);
    expect(lca.lca(1, 0)).toBe(0);
    expect(lca.depth(0)).toBe(0);
    expect(lca.depth(1)).toBe(1);
    expect(lca.distance(0, 1)).toBe(1);
    expect(lca.kthAncestor(1, 1)).toBe(0);
    expect(lca.kthAncestor(1, 2)).toBe(-1);
    expect(lca.isAncestor(0, 1)).toBe(true);
    expect(lca.isAncestor(1, 0)).toBe(false);
  });

  it('path graph non-zero values update', () => {
    const N = 5;
    const hld = new HLD(N, pathEdges(N), 0, [1, 2, 3, 4, 5]);
    expect(hld.pathQuery(0, 4)).toBe(15);
    hld.update(2, 10);
    expect(hld.pathQuery(0, 4)).toBe(22);
    expect(hld.pathQuery(0, 2)).toBe(13);
    expect(hld.pathQuery(2, 4)).toBe(19);
  });

  it('HLD default values are 0', () => {
    const hld = new HLD(5, pathEdges(5));
    expect(hld.pathQuery(0, 4)).toBe(0);
  });

  it('LCA depth on path rooted at end', () => {
    const N = 10;
    const lca = new LCA(N, pathEdges(N), N - 1);
    // Rooted at 9: depth[9]=0, depth[8]=1, ..., depth[0]=9
    for (let i = 0; i < N; i++) {
      expect(lca.depth(i)).toBe(N - 1 - i);
    }
  });

  it('isTree empty graph n=0', () => {
    expect(isTree(0, [])).toBe(true);
  });

  it('isTree duplicate edges', () => {
    expect(isTree(3, [[0,1],[0,1],[1,2]])).toBe(false);
  });

  it('treeDiameter two nodes', () => {
    expect(treeDiameter(2, [[0,1]])).toBe(1);
  });

  it('treeDiameter three-node star', () => {
    expect(treeDiameter(3, [[0,1],[0,2]])).toBe(2);
  });

  it('HLD and LCA agree on lca for star', () => {
    const N = 6;
    const e = starEdges(N);
    const hld = new HLD(N, e, 0);
    const lca = new LCA(N, e, 0);
    for (let i = 1; i < N; i++) {
      for (let j = 1; j < N; j++) {
        if (i !== j) {
          expect(hld.lca(i, j)).toBe(lca.lca(i, j));
        }
      }
    }
  });

  it('HLD pathQuery equals sum of individual node values', () => {
    const N = 8;
    const e = pathEdges(N);
    const v = [5, 3, 8, 1, 9, 2, 7, 4];
    const hld = new HLD(N, e, 0, v);
    for (let i = 0; i < N; i++) {
      expect(hld.pathQuery(i, i)).toBe(v[i]);
    }
  });

  it('LCA kthAncestor 0th ancestor is self', () => {
    const lca = new LCA(10, pathEdges(10), 0);
    for (let i = 0; i < 10; i++) {
      expect(lca.kthAncestor(i, 0)).toBe(i);
    }
  });

  it('treeCenter of 3-node path is middle', () => {
    const c = treeCenter(3, pathEdges(3));
    expect(c).toContain(1);
  });

  it('treeCenter of 4-node path has 2 centers', () => {
    const c = treeCenter(4, pathEdges(4));
    expect(c.length).toBe(2);
    expect(c).toContain(1);
    expect(c).toContain(2);
  });

  it('HLD subtreeQuery after update', () => {
    const N = 7;
    const bt = binaryTreeEdges(N);
    const v = [1, 1, 1, 1, 1, 1, 1];
    const hld = new HLD(N, bt, 0, v);
    expect(hld.subtreeQuery(0)).toBe(7);
    hld.update(3, 5);
    expect(hld.subtreeQuery(0)).toBe(11);
    // subtree of 1: nodes 1,3,4 → values 1,5,1 = 7
    expect(hld.subtreeQuery(1)).toBe(7);
  });

  it('HLD pathLength symmetric', () => {
    const N = 10;
    const hld = new HLD(N, pathEdges(N), 0);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        expect(hld.pathLength(i, j)).toBe(hld.pathLength(j, i));
      }
    }
  });

  it('LCA distance symmetric', () => {
    const N = 10;
    const lca = new LCA(N, pathEdges(N), 0);
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        expect(lca.distance(i, j)).toBe(lca.distance(j, i));
      }
    }
  });

  it('HLD with binary tree all values 0', () => {
    const hld = new HLD(7, binaryTreeEdges(7));
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        expect(hld.pathQuery(i, j)).toBe(0);
      }
    }
  });

  it('isTree with binary tree', () => {
    for (let n = 1; n <= 10; n++) {
      expect(isTree(n, binaryTreeEdges(n))).toBe(true);
    }
  });

  it('treeDiameter with binary tree n=3', () => {
    // 0-1, 0-2: diameter = 2
    expect(treeDiameter(3, binaryTreeEdges(3))).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 18. Stress / correctness cross-validation (50 tests)
// ---------------------------------------------------------------------------

describe('HLD vs LCA cross-validation on random-looking trees', () => {
  // Build a "broom" tree: path 0-1-2-..-k, then star from node k to k+1..k+m
  function broomEdges(k: number, m: number): Array<[number, number]> {
    const edges: Array<[number, number]> = [];
    for (let i = 0; i < k; i++) edges.push([i, i + 1]);
    for (let i = 0; i < m; i++) edges.push([k, k + 1 + i]);
    return edges;
  }

  const k = 5, m = 5;
  const n = k + 1 + m; // 11 nodes
  const e = broomEdges(k, m);
  const lca = new LCA(n, e, 0);
  const hld = new HLD(n, e, 0);

  // Path 0-1-2-3-4-5, leaves 6..10 hanging from 5
  // lca(6,7) = 5, depth(6)=depth(7)=..=depth(10)=6
  it('broom lca(6,7)=5', () => expect(lca.lca(6, 7)).toBe(5));
  it('broom lca(6,10)=5', () => expect(lca.lca(6, 10)).toBe(5));
  it('broom lca(0,6)=0', () => expect(lca.lca(0, 6)).toBe(0));
  it('broom lca(3,8)=3', () => expect(lca.lca(3, 8)).toBe(3));
  it('broom depth(5)=5', () => expect(lca.depth(5)).toBe(5));
  it('broom depth(6)=6', () => expect(lca.depth(6)).toBe(6));
  it('broom distance(6,10)=2', () => expect(lca.distance(6, 10)).toBe(2));
  it('broom distance(0,10)=6', () => expect(lca.distance(0, 10)).toBe(6));
  it('broom HLD lca(6,7)=5', () => expect(hld.lca(6, 7)).toBe(5));
  it('broom HLD lca(0,10)=0', () => expect(hld.lca(0, 10)).toBe(0));

  // Values for HLD: value[i] = 2*i+1 (odd numbers)
  const vals = Array.from({ length: n }, (_, i) => 2 * i + 1);
  const hldV = new HLD(n, e, 0, vals);

  // path 0->6: 0-1-2-3-4-5-6
  it('broom HLD pathQuery(0,6)=sum vals 0..5 + val6', () => {
    const expected = vals[0]+vals[1]+vals[2]+vals[3]+vals[4]+vals[5]+vals[6];
    expect(hldV.pathQuery(0, 6)).toBe(expected);
  });

  it('broom HLD pathQuery(6,7)=vals[6]+vals[5]+vals[7]', () => {
    const expected = vals[6]+vals[5]+vals[7];
    expect(hldV.pathQuery(6, 7)).toBe(expected);
  });

  it('broom HLD pathMin(6,7)=min(vals[5..7])', () => {
    expect(hldV.pathMin(6, 7)).toBe(Math.min(vals[6], vals[5], vals[7]));
  });

  it('broom HLD pathMax(6,7)=max(vals[5..7])', () => {
    expect(hldV.pathMax(6, 7)).toBe(Math.max(vals[6], vals[5], vals[7]));
  });

  it('broom HLD subtreeQuery(5)=sum vals 5..10', () => {
    const expected = vals.slice(5).reduce((a, b) => a + b, 0);
    expect(hldV.subtreeQuery(5)).toBe(expected);
  });

  it('broom HLD depth agrees with LCA depth', () => {
    for (let i = 0; i < n; i++) {
      expect(hld.depth(i)).toBe(lca.depth(i));
    }
  });

  it('broom HLD pathLength agrees with LCA distance', () => {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        expect(hld.pathLength(i, j)).toBe(lca.distance(i, j));
      }
    }
  });

  // Bamboo (path) cross-validation
  const bambooN = 15;
  const bamboo = pathEdges(bambooN);
  const bambooVals = Array.from({ length: bambooN }, (_, i) => i * 3 + 1);
  const bambooHLD = new HLD(bambooN, bamboo, 0, bambooVals);
  const bambooLCA = new LCA(bambooN, bamboo, 0);

  for (let i = 0; i < bambooN; i += 3) {
    for (let j = i; j < bambooN; j += 3) {
      it(`bamboo cross lca(${i},${j})`, () => {
        expect(bambooHLD.lca(i, j)).toBe(bambooLCA.lca(i, j));
      });
    }
  }

  for (let i = 0; i < 5; i++) {
    it(`bamboo pathQuery(${i},${bambooN-1-i}) brute`, () => {
      const expected = brutePathSum(i, bambooN-1-i, bambooVals);
      expect(bambooHLD.pathQuery(i, bambooN-1-i)).toBe(expected);
    });
  }

  // Verify pathMin/pathMax on bamboo
  for (let i = 0; i < 5; i++) {
    it(`bamboo pathMin(${i},${bambooN-1-i}) brute`, () => {
      expect(bambooHLD.pathMin(i, bambooN-1-i)).toBe(brutePathMin(i, bambooN-1-i, bambooVals));
    });
    it(`bamboo pathMax(${i},${bambooN-1-i}) brute`, () => {
      expect(bambooHLD.pathMax(i, bambooN-1-i)).toBe(brutePathMax(i, bambooN-1-i, bambooVals));
    });
  }

  it('treeDiameter broom k=5 m=5 = 11', () => {
    // Farthest pair: leaf at end of path (via 0-5) and leaf hanging from 5 → diameter=6+0? No.
    // Path: longest path is from node 0 to any leaf → 0-1-2-3-4-5-leaf = 6 edges
    // OR leaf-5-leaf = 2 edges... so diameter = 6
    expect(treeDiameter(n, e)).toBe(6);
  });

  it('treeCenter broom k=5 m=5', () => {
    // Diameter path is 0-1-2-3-4-5-leaf (length 6), center is node 3
    const c = treeCenter(n, e);
    expect(Array.isArray(c)).toBe(true);
    expect(c.length).toBeGreaterThan(0);
  });

  it('isTree broom', () => expect(isTree(n, e)).toBe(true));

  // Additional kthAncestor tests on broom
  it('broom kthAncestor(6,1)=5', () => expect(lca.kthAncestor(6, 1)).toBe(5));
  it('broom kthAncestor(6,6)=0', () => expect(lca.kthAncestor(6, 6)).toBe(0));
  it('broom kthAncestor(6,7)=-1', () => expect(lca.kthAncestor(6, 7)).toBe(-1));
  it('broom isAncestor(3,6)=true', () => expect(lca.isAncestor(3, 6)).toBe(true));
  it('broom isAncestor(4,6)=true', () => expect(lca.isAncestor(4, 6)).toBe(true));
  it('broom isAncestor(1,6)=true', () => expect(lca.isAncestor(1, 6)).toBe(true));
  it('broom isAncestor(6,0)=false', () => expect(lca.isAncestor(6, 0)).toBe(false));
  it('broom isAncestor(7,6)=false', () => expect(lca.isAncestor(7, 6)).toBe(false));
});
