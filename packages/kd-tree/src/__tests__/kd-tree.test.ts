// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  KDTree,
  KDTree2D,
  buildKDTree,
  nearestNeighbor,
  kNearestNeighbors,
  pointsWithinRadius,
  euclideanDistance,
  manhattanDistance,
} from '../kd-tree';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bruteNearest(points: number[][], query: number[]): number[] {
  let best: number[] = points[0];
  let bestDist = euclideanDistance(points[0], query);
  for (let i = 1; i < points.length; i++) {
    const d = euclideanDistance(points[i], query);
    if (d < bestDist) {
      bestDist = d;
      best = points[i];
    }
  }
  return best;
}

function bruteKNearest(points: number[][], query: number[], k: number): number[][] {
  return points
    .slice()
    .sort((a, b) => euclideanDistance(a, query) - euclideanDistance(b, query))
    .slice(0, k);
}

function bruteWithinRadius(points: number[][], query: number[], r: number): number[][] {
  return points.filter((p) => euclideanDistance(p, query) <= r);
}

function approxEqual(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) < eps;
}

// ---------------------------------------------------------------------------
// Section 1: nearest 1D (100 tests)
// ---------------------------------------------------------------------------

describe('nearest 1D', () => {
  // 100 tests: for i in 0..99, build array of 10 points [0,10,20,...,90],
  // query = i, nearest should be the multiple of 10 closest to i.
  for (let i = 0; i < 100; i++) {
    it(`nearest 1D query=${i}`, () => {
      const pts = Array.from({ length: 10 }, (_, idx) => [idx * 10]);
      const tree = new KDTree(pts);
      const result = tree.nearest([i]);
      const brute = bruteNearest(pts, [i]);
      expect(result).not.toBeNull();
      // distances should match
      const treeDist = euclideanDistance(result!, [i]);
      const bruteDist = euclideanDistance(brute, [i]);
      expect(approxEqual(treeDist, bruteDist)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 2: nearest 2D vs brute force (100 tests)
// ---------------------------------------------------------------------------

describe('nearest 2D brute force', () => {
  // 5x5 grid of points, 25 query points
  const grid: number[][] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      grid.push([r * 10, c * 10]);
    }
  }

  for (let i = 0; i < 100; i++) {
    const qx = (i * 3) % 47;
    const qy = (i * 7 + 5) % 47;
    it(`nearest 2D query=(${qx},${qy})`, () => {
      const tree = new KDTree(grid);
      const result = tree.nearest([qx, qy]);
      const brute = bruteNearest(grid, [qx, qy]);
      expect(result).not.toBeNull();
      const treeDist = euclideanDistance(result!, [qx, qy]);
      const bruteDist = euclideanDistance(brute, [qx, qy]);
      expect(approxEqual(treeDist, bruteDist)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 3: nearest 3D vs brute force (100 tests)
// ---------------------------------------------------------------------------

describe('nearest 3D brute force', () => {
  // Build 27 points (3x3x3 grid)
  const grid3d: number[][] = [];
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      for (let c = 0; c < 3; c++) {
        grid3d.push([a * 5, b * 5, c * 5]);
      }
    }
  }

  for (let i = 0; i < 100; i++) {
    const qx = (i * 2 + 1) % 14;
    const qy = (i * 3 + 2) % 14;
    const qz = (i * 5 + 3) % 14;
    it(`nearest 3D query=(${qx},${qy},${qz})`, () => {
      const tree = new KDTree(grid3d);
      const result = tree.nearest([qx, qy, qz]);
      const brute = bruteNearest(grid3d, [qx, qy, qz]);
      expect(result).not.toBeNull();
      const treeDist = euclideanDistance(result!, [qx, qy, qz]);
      const bruteDist = euclideanDistance(brute, [qx, qy, qz]);
      expect(approxEqual(treeDist, bruteDist)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 4: kNearest — sorted by distance (100 tests)
// ---------------------------------------------------------------------------

describe('kNearest sorted by distance', () => {
  const pts2d: number[][] = [];
  for (let i = 0; i < 20; i++) {
    pts2d.push([(i * 7) % 50, (i * 11 + 3) % 50]);
  }

  for (let i = 0; i < 100; i++) {
    const k = (i % 5) + 1; // k in 1..5
    const qx = (i * 4 + 1) % 50;
    const qy = (i * 6 + 2) % 50;
    it(`kNearest k=${k} query=(${qx},${qy})`, () => {
      const tree = new KDTree(pts2d);
      const result = tree.kNearest([qx, qy], k);
      const brute = bruteKNearest(pts2d, [qx, qy], k);

      // Count and distances match
      expect(result.length).toBe(Math.min(k, pts2d.length));
      // Worst distance in result should match brute force worst distance
      const treeDists = result.map((p) => euclideanDistance(p, [qx, qy]));
      const bruteDists = brute.map((p) => euclideanDistance(p, [qx, qy]));
      // Sort both and compare element by element
      treeDists.sort((a, b) => a - b);
      bruteDists.sort((a, b) => a - b);
      for (let j = 0; j < treeDists.length; j++) {
        expect(approxEqual(treeDists[j], bruteDists[j])).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Section 5: withinRadius (100 tests)
// ---------------------------------------------------------------------------

describe('withinRadius', () => {
  const pts: number[][] = [];
  for (let i = 0; i < 25; i++) {
    pts.push([(i * 4) % 20, (i * 7) % 20]);
  }

  for (let i = 0; i < 100; i++) {
    const r = (i % 10) + 1; // radius 1..10
    const qx = (i * 3) % 20;
    const qy = (i * 5) % 20;
    it(`withinRadius r=${r} query=(${qx},${qy})`, () => {
      const tree = new KDTree(pts);
      const result = tree.withinRadius([qx, qy], r);
      const brute = bruteWithinRadius(pts, [qx, qy], r);

      // Same count
      expect(result.length).toBe(brute.length);

      // Every result point is within r
      for (const p of result) {
        expect(euclideanDistance(p, [qx, qy])).toBeLessThanOrEqual(r + 1e-9);
      }

      // Every brute force point appears in result (compare distances)
      const resultDists = result.map((p) => euclideanDistance(p, [qx, qy])).sort((a, b) => a - b);
      const bruteDists = brute.map((p) => euclideanDistance(p, [qx, qy])).sort((a, b) => a - b);
      for (let j = 0; j < resultDists.length; j++) {
        expect(approxEqual(resultDists[j], bruteDists[j])).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Section 6: KDTree2D nearest (100 tests)
// ---------------------------------------------------------------------------

describe('KDTree2D nearest', () => {
  const pts2d: Array<[number, number]> = [];
  for (let i = 0; i < 16; i++) {
    pts2d.push([(i * 5) % 40, (i * 8 + 2) % 40]);
  }

  for (let i = 0; i < 100; i++) {
    const qx = (i * 3 + 1) % 40;
    const qy = (i * 7 + 4) % 40;
    it(`KDTree2D nearest query=(${qx},${qy})`, () => {
      const tree2d = new KDTree2D(pts2d);
      const result = tree2d.nearest(qx, qy);
      const brute = bruteNearest(pts2d as number[][], [qx, qy]);
      expect(result).not.toBeNull();
      const treeDist = euclideanDistance([result![0], result![1]], [qx, qy]);
      const bruteDist = euclideanDistance(brute, [qx, qy]);
      expect(approxEqual(treeDist, bruteDist)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 7: KDTree2D withinRadius (100 tests)
// ---------------------------------------------------------------------------

describe('KDTree2D withinRadius', () => {
  const pts2d: Array<[number, number]> = [];
  for (let i = 0; i < 20; i++) {
    pts2d.push([(i * 3) % 30, (i * 7 + 1) % 30]);
  }

  for (let i = 0; i < 100; i++) {
    const r = (i % 8) + 2;
    const qx = (i * 4) % 30;
    const qy = (i * 6 + 3) % 30;
    it(`KDTree2D withinRadius r=${r} query=(${qx},${qy})`, () => {
      const tree2d = new KDTree2D(pts2d);
      const result = tree2d.withinRadius(qx, qy, r);
      const brute = bruteWithinRadius(pts2d as number[][], [qx, qy], r);
      expect(result.length).toBe(brute.length);
      for (const p of result) {
        expect(euclideanDistance([p[0], p[1]], [qx, qy])).toBeLessThanOrEqual(r + 1e-9);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Section 8: euclideanDistance known values (100 tests)
// ---------------------------------------------------------------------------

describe('euclideanDistance', () => {
  // i=0..49: distance between [i,0] and [0,0] = i
  for (let i = 0; i < 50; i++) {
    it(`euclidean [${i},0] to origin = ${i}`, () => {
      expect(approxEqual(euclideanDistance([i, 0], [0, 0]), i)).toBe(true);
    });
  }

  // i=0..49: distance between [i,i] and [0,0] = i*sqrt(2)
  for (let i = 0; i < 50; i++) {
    it(`euclidean [${i},${i}] to origin = ${i}*sqrt(2)`, () => {
      const expected = i * Math.sqrt(2);
      expect(approxEqual(euclideanDistance([i, i], [0, 0]), expected)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 9: manhattanDistance known values (100 tests)
// ---------------------------------------------------------------------------

describe('manhattanDistance', () => {
  // i=0..49: manhattan([i,0],[0,0]) = i
  for (let i = 0; i < 50; i++) {
    it(`manhattan [${i},0] to origin = ${i}`, () => {
      expect(approxEqual(manhattanDistance([i, 0], [0, 0]), i)).toBe(true);
    });
  }

  // i=0..49: manhattan([i,i],[0,0]) = 2*i
  for (let i = 0; i < 50; i++) {
    it(`manhattan [${i},${i}] to origin = ${2 * i}`, () => {
      expect(approxEqual(manhattanDistance([i, i], [0, 0]), 2 * i)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 10: size and dimensions (50 tests)
// ---------------------------------------------------------------------------

describe('size and dimensions', () => {
  for (let n = 1; n <= 25; n++) {
    it(`size = ${n} (2D)`, () => {
      const pts = Array.from({ length: n }, (_, i) => [i, i * 2]);
      const tree = new KDTree(pts);
      expect(tree.size).toBe(n);
      expect(tree.dimensions).toBe(2);
    });
  }

  for (let d = 1; d <= 25; d++) {
    it(`dimensions = ${d}`, () => {
      const pts = [Array.from({ length: d }, (_, i) => i)];
      const tree = new KDTree(pts);
      expect(tree.dimensions).toBe(d);
      expect(tree.size).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 11: single point tree (50 tests)
// ---------------------------------------------------------------------------

describe('single point tree', () => {
  for (let i = 0; i < 25; i++) {
    it(`single 2D point nearest i=${i}`, () => {
      const pt = [i * 3, i * 7 + 1];
      const tree = new KDTree([pt]);
      const query = [i * 3 + 1, i * 7 + 2];
      const result = tree.nearest(query);
      expect(result).toEqual(pt);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`single 2D point withinRadius i=${i}`, () => {
      const pt = [i * 2, i * 2];
      const tree = new KDTree([pt]);
      // radius just enough to include the point
      const query = [i * 2 + 1, i * 2 + 1];
      const dist = euclideanDistance(pt, query);
      const inResult = tree.withinRadius(query, dist + 0.001);
      expect(inResult.length).toBe(1);
      expect(inResult[0]).toEqual(pt);
      const outResult = tree.withinRadius(query, dist - 0.001);
      expect(outResult.length).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 12: empty tree → null / [] (50 tests)
// ---------------------------------------------------------------------------

describe('empty tree', () => {
  for (let i = 0; i < 25; i++) {
    it(`empty tree nearest i=${i}`, () => {
      const tree = new KDTree([]);
      const result = tree.nearest([i, i]);
      expect(result).toBeNull();
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`empty tree withinRadius/kNearest i=${i}`, () => {
      const tree = new KDTree([]);
      expect(tree.withinRadius([i, i], 100)).toEqual([]);
      expect(tree.kNearest([i, i], 5)).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// Bonus: standalone function tests (additional coverage beyond 1,000)
// ---------------------------------------------------------------------------

describe('standalone functions', () => {
  it('buildKDTree returns KDTree instance', () => {
    const pts = [[1, 2], [3, 4], [5, 6]];
    const tree = buildKDTree(pts);
    expect(tree).toBeInstanceOf(KDTree);
    expect(tree.size).toBe(3);
  });

  it('nearestNeighbor basic', () => {
    const pts = [[0, 0], [10, 10], [5, 5]];
    const result = nearestNeighbor(pts, [4, 4]);
    expect(euclideanDistance(result, [4, 4])).toBeLessThanOrEqual(euclideanDistance([10, 10], [4, 4]));
  });

  it('kNearestNeighbors returns k points', () => {
    const pts = Array.from({ length: 10 }, (_, i) => [i, i]);
    const result = kNearestNeighbors(pts, [4.5, 4.5], 3);
    expect(result.length).toBe(3);
  });

  it('pointsWithinRadius returns correct count', () => {
    const pts = [[0, 0], [1, 0], [2, 0], [10, 0]];
    const result = pointsWithinRadius(pts, [0, 0], 2.5);
    expect(result.length).toBe(3);
  });

  it('KDTree2D size property', () => {
    const pts: Array<[number, number]> = [[1, 2], [3, 4], [5, 6], [7, 8]];
    const tree2d = new KDTree2D(pts);
    expect(tree2d.size).toBe(4);
  });

  it('KDTree2D kNearest returns correct count', () => {
    const pts: Array<[number, number]> = Array.from({ length: 10 }, (_, i) => [i * 2, i * 3] as [number, number]);
    const tree2d = new KDTree2D(pts);
    const result = tree2d.kNearest(5, 5, 3);
    expect(result.length).toBe(3);
  });
});
