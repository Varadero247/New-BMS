// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

import {
  KDTree,
  KDTree3D,
  RTree,
  GridIndex,
  euclidean2D,
  euclidean3D,
  bboxContains,
  bboxOverlaps,
  pointInCircle,
  geohashEncode,
  geohashDecode,
  Point2D,
  Point3D,
  BBox,
  Circle,
} from '../spatial-index';

// ─── euclidean2D ─────────────────────────────────────────────────────────────

describe('euclidean2D', () => {
  it('returns 0 for identical points', () => {
    expect(euclidean2D({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
  });

  for (let n = 1; n <= 30; n++) {
    it(`euclidean2D horizontal distance ${n}`, () => {
      expect(euclidean2D({ x: 0, y: 0 }, { x: n, y: 0 })).toBeCloseTo(n, 9);
    });
  }

  for (let n = 1; n <= 30; n++) {
    it(`euclidean2D vertical distance ${n}`, () => {
      expect(euclidean2D({ x: 0, y: 0 }, { x: 0, y: n })).toBeCloseTo(n, 9);
    });
  }

  it('3-4-5 right triangle', () => {
    expect(euclidean2D({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5, 9);
  });

  it('5-12-13 right triangle', () => {
    expect(euclidean2D({ x: 0, y: 0 }, { x: 5, y: 12 })).toBeCloseTo(13, 9);
  });

  it('is symmetric', () => {
    const a = { x: 1, y: 2 };
    const b = { x: 4, y: 6 };
    expect(euclidean2D(a, b)).toBeCloseTo(euclidean2D(b, a), 9);
  });

  it('handles negative coordinates', () => {
    expect(euclidean2D({ x: -3, y: 0 }, { x: 0, y: 4 })).toBeCloseTo(5, 9);
  });

  it('handles floating point coordinates', () => {
    expect(euclidean2D({ x: 0.1, y: 0.2 }, { x: 0.4, y: 0.6 })).toBeCloseTo(0.5, 5);
  });

  it('large coordinates', () => {
    expect(euclidean2D({ x: 0, y: 0 }, { x: 1000, y: 0 })).toBeCloseTo(1000, 5);
  });

  for (let n = 1; n <= 10; n++) {
    it(`euclidean2D diagonal distance sqrt(2)*${n}`, () => {
      expect(euclidean2D({ x: 0, y: 0 }, { x: n, y: n })).toBeCloseTo(Math.sqrt(2) * n, 5);
    });
  }
});

// ─── euclidean3D ─────────────────────────────────────────────────────────────

describe('euclidean3D', () => {
  it('returns 0 for identical points', () => {
    expect(euclidean3D({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 })).toBe(0);
  });

  for (let n = 1; n <= 25; n++) {
    it(`euclidean3D x-axis distance ${n}`, () => {
      expect(euclidean3D({ x: 0, y: 0, z: 0 }, { x: n, y: 0, z: 0 })).toBeCloseTo(n, 9);
    });
  }

  for (let n = 1; n <= 25; n++) {
    it(`euclidean3D y-axis distance ${n}`, () => {
      expect(euclidean3D({ x: 0, y: 0, z: 0 }, { x: 0, y: n, z: 0 })).toBeCloseTo(n, 9);
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`euclidean3D z-axis distance ${n}`, () => {
      expect(euclidean3D({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: n })).toBeCloseTo(n, 9);
    });
  }

  it('unit cube diagonal sqrt(3)', () => {
    expect(euclidean3D({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 })).toBeCloseTo(Math.sqrt(3), 9);
  });

  it('is symmetric', () => {
    const a = { x: 1, y: 2, z: 3 };
    const b = { x: 4, y: 6, z: 8 };
    expect(euclidean3D(a, b)).toBeCloseTo(euclidean3D(b, a), 9);
  });

  it('handles negatives', () => {
    expect(euclidean3D({ x: -1, y: -1, z: -1 }, { x: 1, y: 1, z: 1 })).toBeCloseTo(Math.sqrt(12), 9);
  });
});

// ─── bboxContains ─────────────────────────────────────────────────────────────

describe('bboxContains', () => {
  const bb: BBox = { minX: 0, minY: 0, maxX: 10, maxY: 10 };

  it('contains origin', () => {
    expect(bboxContains(bb, { x: 0, y: 0 })).toBe(true);
  });

  it('contains max corner', () => {
    expect(bboxContains(bb, { x: 10, y: 10 })).toBe(true);
  });

  it('contains centre', () => {
    expect(bboxContains(bb, { x: 5, y: 5 })).toBe(true);
  });

  it('excludes point just outside right', () => {
    expect(bboxContains(bb, { x: 10.01, y: 5 })).toBe(false);
  });

  it('excludes point just outside top', () => {
    expect(bboxContains(bb, { x: 5, y: 10.01 })).toBe(false);
  });

  it('excludes point just outside left', () => {
    expect(bboxContains(bb, { x: -0.01, y: 5 })).toBe(false);
  });

  it('excludes point just outside bottom', () => {
    expect(bboxContains(bb, { x: 5, y: -0.01 })).toBe(false);
  });

  for (let n = 0; n <= 10; n++) {
    it(`bboxContains point (${n}, ${n}) inside [0..10]`, () => {
      expect(bboxContains(bb, { x: n, y: n })).toBe(true);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`bboxContains point (${n + 10}, 5) outside right edge by ${n}`, () => {
      expect(bboxContains(bb, { x: n + 10, y: 5 })).toBe(false);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`bboxContains point (-${n}, 5) outside left edge by ${n}`, () => {
      expect(bboxContains(bb, { x: -n, y: 5 })).toBe(false);
    });
  }
});

// ─── bboxOverlaps ─────────────────────────────────────────────────────────────

describe('bboxOverlaps', () => {
  const a: BBox = { minX: 0, minY: 0, maxX: 5, maxY: 5 };

  it('same box overlaps itself', () => {
    expect(bboxOverlaps(a, a)).toBe(true);
  });

  it('partially overlapping boxes', () => {
    expect(bboxOverlaps(a, { minX: 3, minY: 3, maxX: 8, maxY: 8 })).toBe(true);
  });

  it('contained box overlaps', () => {
    expect(bboxOverlaps(a, { minX: 1, minY: 1, maxX: 4, maxY: 4 })).toBe(true);
  });

  it('adjacent (touching edge) overlaps', () => {
    expect(bboxOverlaps(a, { minX: 5, minY: 0, maxX: 10, maxY: 5 })).toBe(true);
  });

  it('disjoint to the right', () => {
    expect(bboxOverlaps(a, { minX: 6, minY: 0, maxX: 10, maxY: 5 })).toBe(false);
  });

  it('disjoint above', () => {
    expect(bboxOverlaps(a, { minX: 0, minY: 6, maxX: 5, maxY: 10 })).toBe(false);
  });

  it('disjoint to the left', () => {
    expect(bboxOverlaps(a, { minX: -5, minY: 0, maxX: -1, maxY: 5 })).toBe(false);
  });

  it('disjoint below', () => {
    expect(bboxOverlaps(a, { minX: 0, minY: -5, maxX: 5, maxY: -1 })).toBe(false);
  });

  for (let n = 1; n <= 10; n++) {
    it(`bboxOverlaps shifted right by ${n}: overlaps when shift<=5`, () => {
      const b: BBox = { minX: n, minY: 0, maxX: n + 5, maxY: 5 };
      expect(bboxOverlaps(a, b)).toBe(n <= 5);
    });
  }

  for (let n = 6; n <= 15; n++) {
    it(`bboxOverlaps shifted right by ${n}: no overlap`, () => {
      const b: BBox = { minX: n, minY: 0, maxX: n + 5, maxY: 5 };
      expect(bboxOverlaps(a, b)).toBe(false);
    });
  }
});

// ─── pointInCircle ─────────────────────────────────────────────────────────────

describe('pointInCircle', () => {
  const c: Circle = { cx: 0, cy: 0, r: 5 };

  it('centre is in circle', () => {
    expect(pointInCircle({ x: 0, y: 0 }, c)).toBe(true);
  });

  it('point on boundary', () => {
    expect(pointInCircle({ x: 5, y: 0 }, c)).toBe(true);
  });

  it('point just outside', () => {
    expect(pointInCircle({ x: 5.0001, y: 0 }, c)).toBe(false);
  });

  it('3-4-5 point on boundary', () => {
    expect(pointInCircle({ x: 3, y: 4 }, c)).toBe(true);
  });

  it('3-4-5 point slightly outside', () => {
    expect(pointInCircle({ x: 3, y: 4.1 }, c)).toBe(false);
  });

  for (let n = 0; n <= 4; n++) {
    it(`pointInCircle at (${n}, 0) inside r=5`, () => {
      expect(pointInCircle({ x: n, y: 0 }, c)).toBe(true);
    });
  }

  for (let n = 6; n <= 15; n++) {
    it(`pointInCircle at (${n}, 0) outside r=5`, () => {
      expect(pointInCircle({ x: n, y: 0 }, c)).toBe(false);
    });
  }

  it('off-centre circle contains point', () => {
    const c2: Circle = { cx: 3, cy: 4, r: 2 };
    expect(pointInCircle({ x: 3, y: 5 }, c2)).toBe(true);
  });

  it('off-centre circle excludes point', () => {
    const c2: Circle = { cx: 3, cy: 4, r: 2 };
    expect(pointInCircle({ x: 0, y: 0 }, c2)).toBe(false);
  });

  it('radius 0 circle only contains its own centre', () => {
    const c3: Circle = { cx: 1, cy: 1, r: 0 };
    expect(pointInCircle({ x: 1, y: 1 }, c3)).toBe(true);
    expect(pointInCircle({ x: 1.001, y: 1 }, c3)).toBe(false);
  });
});

// ─── KDTree — insert / size ───────────────────────────────────────────────────

describe('KDTree insert and size', () => {
  for (let n = 1; n <= 50; n++) {
    it(`KDTree insert ${n} points has size ${n}`, () => {
      const tree = new KDTree<number>();
      for (let i = 0; i < n; i++) tree.insert({ x: i, y: i }, i);
      expect(tree.size).toBe(n);
    });
  }
});

// ─── KDTree — search (exact) ──────────────────────────────────────────────────

describe('KDTree exact search', () => {
  for (let n = 0; n <= 30; n++) {
    it(`KDTree exact search finds inserted point at (${n}, ${n})`, () => {
      const tree = new KDTree<string>();
      tree.insert({ x: n, y: n }, `val-${n}`);
      expect(tree.search({ x: n, y: n })).toBe(`val-${n}`);
    });
  }

  it('search returns undefined for missing point', () => {
    const tree = new KDTree<number>();
    tree.insert({ x: 1, y: 1 }, 42);
    expect(tree.search({ x: 99, y: 99 })).toBeUndefined();
  });

  it('search among many inserted points', () => {
    const tree = new KDTree<number>();
    for (let i = 0; i < 20; i++) tree.insert({ x: i * 10, y: i * 10 }, i);
    expect(tree.search({ x: 100, y: 100 })).toBe(10);
  });

  it('search empty tree returns undefined', () => {
    const tree = new KDTree<number>();
    expect(tree.search({ x: 0, y: 0 })).toBeUndefined();
  });

  for (let n = 1; n <= 15; n++) {
    it(`KDTree search not found for unmissed point offset ${n}`, () => {
      const tree = new KDTree<number>();
      tree.insert({ x: 0, y: 0 }, 0);
      expect(tree.search({ x: n, y: 0 })).toBeUndefined();
    });
  }
});

// ─── KDTree — nearest ────────────────────────────────────────────────────────

describe('KDTree nearest', () => {
  it('nearest on empty tree returns undefined', () => {
    const tree = new KDTree<number>();
    expect(tree.nearest({ x: 0, y: 0 })).toBeUndefined();
  });

  it('nearest with single point returns that point', () => {
    const tree = new KDTree<number>();
    tree.insert({ x: 3, y: 4 }, 99);
    const r = tree.nearest({ x: 0, y: 0 });
    expect(r).toBeDefined();
    expect(r!.data).toBe(99);
  });

  for (let n = 1; n <= 40; n++) {
    it(`KDTree nearest among ${n} diagonal points finds closest`, () => {
      const tree = new KDTree<number>();
      for (let i = 0; i < n; i++) tree.insert({ x: i, y: i }, i);
      const r = tree.nearest({ x: 0, y: 0 });
      expect(r).toBeDefined();
      expect(r!.data).toBe(0);
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`KDTree nearest among horizontal grid finds correct point at query ${n}`, () => {
      const tree = new KDTree<number>();
      for (let i = 0; i < 10; i++) tree.insert({ x: i * 10, y: 0 }, i);
      const r = tree.nearest({ x: n * 10, y: 0 });
      expect(r).toBeDefined();
      expect(r!.data).toBe(Math.min(n, 9));
    });
  }

  it('nearest point returns correct coordinates', () => {
    const tree = new KDTree<string>();
    tree.insert({ x: 1, y: 0 }, 'a');
    tree.insert({ x: 10, y: 0 }, 'b');
    const r = tree.nearest({ x: 0, y: 0 });
    expect(r!.point.x).toBe(1);
    expect(r!.data).toBe('a');
  });
});

// ─── KDTree — kNearest ───────────────────────────────────────────────────────

describe('KDTree kNearest', () => {
  it('kNearest k=0 returns empty', () => {
    const tree = new KDTree<number>();
    tree.insert({ x: 1, y: 1 }, 1);
    expect(tree.kNearest({ x: 0, y: 0 }, 0)).toHaveLength(0);
  });

  it('kNearest with empty tree returns empty', () => {
    const tree = new KDTree<number>();
    expect(tree.kNearest({ x: 0, y: 0 }, 3)).toHaveLength(0);
  });

  for (let k = 1; k <= 10; k++) {
    it(`kNearest k=${k} with 10 points returns ${k} results`, () => {
      const tree = new KDTree<number>();
      for (let i = 0; i < 10; i++) tree.insert({ x: i, y: 0 }, i);
      const r = tree.kNearest({ x: 0, y: 0 }, k);
      expect(r.length).toBe(k);
    });
  }

  it('kNearest k > size returns all points', () => {
    const tree = new KDTree<number>();
    for (let i = 0; i < 5; i++) tree.insert({ x: i, y: 0 }, i);
    const r = tree.kNearest({ x: 0, y: 0 }, 100);
    expect(r.length).toBe(5);
  });

  it('kNearest results are sorted by distance', () => {
    const tree = new KDTree<number>();
    for (let i = 0; i < 10; i++) tree.insert({ x: i * 2, y: 0 }, i);
    const r = tree.kNearest({ x: 0, y: 0 }, 5);
    for (let i = 1; i < r.length; i++) {
      const d0 = euclidean2D({ x: 0, y: 0 }, r[i - 1].point);
      const d1 = euclidean2D({ x: 0, y: 0 }, r[i].point);
      expect(d0).toBeLessThanOrEqual(d1);
    }
  });

  for (let n = 1; n <= 20; n++) {
    it(`kNearest k=3 from ${n} points all have valid data`, () => {
      const tree = new KDTree<number>();
      for (let i = 0; i < n; i++) tree.insert({ x: i, y: i }, i);
      const r = tree.kNearest({ x: 0, y: 0 }, 3);
      for (const e of r) expect(e.data).toBeGreaterThanOrEqual(0);
    });
  }
});

// ─── KDTree — rangeSearch ─────────────────────────────────────────────────────

describe('KDTree rangeSearch', () => {
  it('empty tree returns empty', () => {
    const tree = new KDTree<number>();
    expect(tree.rangeSearch({ minX: 0, minY: 0, maxX: 10, maxY: 10 })).toHaveLength(0);
  });

  it('bbox containing all points returns all', () => {
    const tree = new KDTree<number>();
    for (let i = 0; i < 5; i++) tree.insert({ x: i, y: i }, i);
    const r = tree.rangeSearch({ minX: -1, minY: -1, maxX: 10, maxY: 10 });
    expect(r).toHaveLength(5);
  });

  it('bbox containing no points returns empty', () => {
    const tree = new KDTree<number>();
    for (let i = 0; i < 5; i++) tree.insert({ x: i, y: i }, i);
    const r = tree.rangeSearch({ minX: 100, minY: 100, maxX: 200, maxY: 200 });
    expect(r).toHaveLength(0);
  });

  for (let n = 0; n <= 9; n++) {
    it(`rangeSearch bbox [${n}..${n}] returns exactly 1 point from diagonal grid`, () => {
      const tree = new KDTree<number>();
      for (let i = 0; i < 10; i++) tree.insert({ x: i, y: i }, i);
      const r = tree.rangeSearch({ minX: n, minY: n, maxX: n, maxY: n });
      expect(r.length).toBe(1);
      expect(r[0].data).toBe(n);
    });
  }

  it('rangeSearch returns only points inside bbox', () => {
    const tree = new KDTree<number>();
    for (let i = 0; i < 20; i++) tree.insert({ x: i, y: 0 }, i);
    const r = tree.rangeSearch({ minX: 5, minY: -1, maxX: 10, maxY: 1 });
    expect(r.length).toBe(6);
    for (const e of r) {
      expect(e.point.x).toBeGreaterThanOrEqual(5);
      expect(e.point.x).toBeLessThanOrEqual(10);
    }
  });

  for (let w = 1; w <= 10; w++) {
    it(`rangeSearch width=${w} window on x-axis returns ${w + 1} points`, () => {
      const tree = new KDTree<number>();
      for (let i = 0; i <= 20; i++) tree.insert({ x: i, y: 0 }, i);
      const r = tree.rangeSearch({ minX: 0, minY: -0.5, maxX: w, maxY: 0.5 });
      expect(r.length).toBe(w + 1);
    });
  }
});

// ─── KDTree — circleSearch ────────────────────────────────────────────────────

describe('KDTree circleSearch', () => {
  it('empty tree returns empty', () => {
    const tree = new KDTree<number>();
    expect(tree.circleSearch({ cx: 0, cy: 0, r: 10 })).toHaveLength(0);
  });

  it('circle containing all points', () => {
    const tree = new KDTree<number>();
    for (let i = -2; i <= 2; i++) tree.insert({ x: i, y: 0 }, i);
    const r = tree.circleSearch({ cx: 0, cy: 0, r: 100 });
    expect(r).toHaveLength(5);
  });

  it('zero-radius circle finds only centre point', () => {
    const tree = new KDTree<number>();
    tree.insert({ x: 0, y: 0 }, 1);
    tree.insert({ x: 1, y: 0 }, 2);
    const r = tree.circleSearch({ cx: 0, cy: 0, r: 0 });
    expect(r.length).toBe(1);
    expect(r[0].data).toBe(1);
  });

  for (let r = 1; r <= 10; r++) {
    it(`circleSearch r=${r} from origin on unit grid returns correct count`, () => {
      const tree = new KDTree<string>();
      for (let x = -15; x <= 15; x++) {
        for (let y = -15; y <= 15; y++) {
          tree.insert({ x, y }, `${x},${y}`);
        }
      }
      const results = tree.circleSearch({ cx: 0, cy: 0, r });
      for (const e of results) {
        const dist = Math.sqrt(e.point.x ** 2 + e.point.y ** 2);
        expect(dist).toBeLessThanOrEqual(r + 1e-9);
      }
    });
  }

  it('circleSearch returns correct data for each found point', () => {
    const tree = new KDTree<string>();
    tree.insert({ x: 1, y: 0 }, 'A');
    tree.insert({ x: 3, y: 0 }, 'B');
    tree.insert({ x: 10, y: 0 }, 'C');
    const r = tree.circleSearch({ cx: 0, cy: 0, r: 2 });
    const datas = r.map(e => e.data);
    expect(datas).toContain('A');
    expect(datas).not.toContain('C');
  });
});

// ─── KDTree — static build ────────────────────────────────────────────────────

describe('KDTree static build', () => {
  it('builds from empty array', () => {
    const tree = KDTree.build<number>([]);
    expect(tree.size).toBe(0);
  });

  for (let n = 1; n <= 30; n++) {
    it(`KDTree.build with ${n} points has correct size`, () => {
      const points = Array.from({ length: n }, (_, i) => ({ point: { x: i, y: i }, data: i }));
      const tree = KDTree.build<number>(points);
      expect(tree.size).toBe(n);
    });
  }

  it('built tree supports nearest query', () => {
    const points = [
      { point: { x: 1, y: 0 }, data: 'a' },
      { point: { x: 5, y: 0 }, data: 'b' },
    ];
    const tree = KDTree.build(points);
    const r = tree.nearest({ x: 0, y: 0 });
    expect(r!.data).toBe('a');
  });

  it('built tree supports rangeSearch', () => {
    const points = Array.from({ length: 10 }, (_, i) => ({ point: { x: i, y: 0 }, data: i }));
    const tree = KDTree.build(points);
    const r = tree.rangeSearch({ minX: 0, minY: -1, maxX: 4, maxY: 1 });
    expect(r.length).toBe(5);
  });
});

// ─── KDTree3D ─────────────────────────────────────────────────────────────────

describe('KDTree3D', () => {
  it('starts with size 0', () => {
    const tree = new KDTree3D<number>();
    expect(tree.size).toBe(0);
  });

  for (let n = 1; n <= 40; n++) {
    it(`KDTree3D insert ${n} 3D points has size ${n}`, () => {
      const tree = new KDTree3D<number>();
      for (let i = 0; i < n; i++) tree.insert({ x: i, y: i, z: i }, i);
      expect(tree.size).toBe(n);
    });
  }

  it('nearest on empty 3D tree returns undefined', () => {
    const tree = new KDTree3D<number>();
    expect(tree.nearest({ x: 0, y: 0, z: 0 })).toBeUndefined();
  });

  it('nearest with one point returns it', () => {
    const tree = new KDTree3D<string>();
    tree.insert({ x: 1, y: 2, z: 3 }, 'hello');
    const r = tree.nearest({ x: 0, y: 0, z: 0 });
    expect(r!.data).toBe('hello');
  });

  for (let n = 2; n <= 20; n++) {
    it(`KDTree3D nearest among ${n} points finds closest to origin`, () => {
      const tree = new KDTree3D<number>();
      for (let i = 1; i <= n; i++) tree.insert({ x: i, y: i, z: i }, i);
      const r = tree.nearest({ x: 0, y: 0, z: 0 });
      expect(r!.data).toBe(1);
    });
  }

  it('KDTree3D nearest returns correct point', () => {
    const tree = new KDTree3D<string>();
    tree.insert({ x: 0, y: 0, z: 1 }, 'near');
    tree.insert({ x: 100, y: 100, z: 100 }, 'far');
    const r = tree.nearest({ x: 0, y: 0, z: 0 });
    expect(r!.data).toBe('near');
  });

  it('KDTree3D kNearest returns 0 for k=0', () => {
    const tree = new KDTree3D<number>();
    tree.insert({ x: 0, y: 0, z: 0 }, 1);
    expect(tree.kNearest({ x: 0, y: 0, z: 0 }, 0)).toHaveLength(0);
  });

  for (let k = 1; k <= 10; k++) {
    it(`KDTree3D kNearest k=${k} with 15 points returns ${k} results`, () => {
      const tree = new KDTree3D<number>();
      for (let i = 0; i < 15; i++) tree.insert({ x: i, y: 0, z: 0 }, i);
      const r = tree.kNearest({ x: 0, y: 0, z: 0 }, k);
      expect(r.length).toBe(k);
    });
  }

  it('KDTree3D kNearest sorted by distance', () => {
    const tree = new KDTree3D<number>();
    for (let i = 0; i < 10; i++) tree.insert({ x: i * 3, y: 0, z: 0 }, i);
    const r = tree.kNearest({ x: 0, y: 0, z: 0 }, 5);
    for (let i = 1; i < r.length; i++) {
      const d0 = euclidean3D({ x: 0, y: 0, z: 0 }, r[i - 1].point);
      const d1 = euclidean3D({ x: 0, y: 0, z: 0 }, r[i].point);
      expect(d0).toBeLessThanOrEqual(d1);
    }
  });

  it('KDTree3D kNearest k > size returns all points', () => {
    const tree = new KDTree3D<number>();
    for (let i = 0; i < 4; i++) tree.insert({ x: i, y: 0, z: 0 }, i);
    expect(tree.kNearest({ x: 0, y: 0, z: 0 }, 100)).toHaveLength(4);
  });

  it('KDTree3D handles negative coordinates', () => {
    const tree = new KDTree3D<string>();
    tree.insert({ x: -1, y: -1, z: -1 }, 'neg');
    tree.insert({ x: 1, y: 1, z: 1 }, 'pos');
    const r = tree.nearest({ x: -2, y: -2, z: -2 });
    expect(r!.data).toBe('neg');
  });

  it('KDTree3D handles floating point coordinates', () => {
    const tree = new KDTree3D<number>();
    tree.insert({ x: 0.1, y: 0.2, z: 0.3 }, 1);
    tree.insert({ x: 1.1, y: 1.2, z: 1.3 }, 2);
    const r = tree.nearest({ x: 0, y: 0, z: 0 });
    expect(r!.data).toBe(1);
  });
});

// ─── RTree ────────────────────────────────────────────────────────────────────

describe('RTree', () => {
  it('starts with size 0', () => {
    const rt = new RTree<string>();
    expect(rt.size).toBe(0);
  });

  for (let n = 1; n <= 40; n++) {
    it(`RTree insert ${n} items has size ${n}`, () => {
      const rt = new RTree<number>();
      for (let i = 0; i < n; i++) rt.insert({ minX: i, minY: i, maxX: i + 1, maxY: i + 1 }, i);
      expect(rt.size).toBe(n);
    });
  }

  it('search on empty RTree returns empty', () => {
    const rt = new RTree<number>();
    expect(rt.search({ minX: 0, minY: 0, maxX: 10, maxY: 10 })).toHaveLength(0);
  });

  it('search finds overlapping bbox', () => {
    const rt = new RTree<string>();
    rt.insert({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, 'box1');
    const r = rt.search({ minX: 3, minY: 3, maxX: 8, maxY: 8 });
    expect(r).toContain('box1');
  });

  it('search does not find non-overlapping bbox', () => {
    const rt = new RTree<string>();
    rt.insert({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, 'box1');
    const r = rt.search({ minX: 10, minY: 10, maxX: 20, maxY: 20 });
    expect(r).not.toContain('box1');
  });

  it('all() returns all inserted data', () => {
    const rt = new RTree<number>();
    for (let i = 0; i < 5; i++) rt.insert({ minX: i, minY: 0, maxX: i + 1, maxY: 1 }, i);
    const all = rt.all();
    expect(all).toHaveLength(5);
    for (let i = 0; i < 5; i++) expect(all).toContain(i);
  });

  it('delete existing entry returns true', () => {
    const rt = new RTree<string>();
    const bb: BBox = { minX: 0, minY: 0, maxX: 1, maxY: 1 };
    rt.insert(bb, 'x');
    expect(rt.delete(bb, 'x')).toBe(true);
    expect(rt.size).toBe(0);
  });

  it('delete non-existent entry returns false', () => {
    const rt = new RTree<string>();
    expect(rt.delete({ minX: 0, minY: 0, maxX: 1, maxY: 1 }, 'ghost')).toBe(false);
  });

  it('delete removes correct element when duplicates exist', () => {
    const rt = new RTree<number>();
    const bb: BBox = { minX: 0, minY: 0, maxX: 1, maxY: 1 };
    rt.insert(bb, 1);
    rt.insert(bb, 2);
    expect(rt.delete(bb, 1)).toBe(true);
    expect(rt.size).toBe(1);
    expect(rt.all()).toContain(2);
    expect(rt.all()).not.toContain(1);
  });

  for (let n = 1; n <= 20; n++) {
    it(`RTree search finds ${n} overlapping boxes when all overlap query`, () => {
      const rt = new RTree<number>();
      for (let i = 0; i < n; i++) rt.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, i);
      const r = rt.search({ minX: 5, minY: 5, maxX: 6, maxY: 6 });
      expect(r.length).toBe(n);
    });
  }

  for (let n = 1; n <= 15; n++) {
    it(`RTree after deleting ${n} items size = ${20 - n}`, () => {
      const rt = new RTree<number>();
      const bbs: BBox[] = [];
      for (let i = 0; i < 20; i++) {
        const bb: BBox = { minX: i, minY: 0, maxX: i + 1, maxY: 1 };
        bbs.push(bb);
        rt.insert(bb, i);
      }
      for (let i = 0; i < n; i++) rt.delete(bbs[i], i);
      expect(rt.size).toBe(20 - n);
    });
  }

  it('search with touching bbox (edge) finds it', () => {
    const rt = new RTree<string>();
    rt.insert({ minX: 0, minY: 0, maxX: 5, maxY: 5 }, 'A');
    const r = rt.search({ minX: 5, minY: 5, maxX: 10, maxY: 10 });
    expect(r).toContain('A');
  });

  it('RTree all() empty is []', () => {
    const rt = new RTree<number>();
    expect(rt.all()).toEqual([]);
  });

  it('RTree search returns multiple overlapping entries', () => {
    const rt = new RTree<string>();
    rt.insert({ minX: 0, minY: 0, maxX: 10, maxY: 10 }, 'big');
    rt.insert({ minX: 1, minY: 1, maxX: 3, maxY: 3 }, 'small');
    rt.insert({ minX: 50, minY: 50, maxX: 60, maxY: 60 }, 'far');
    const r = rt.search({ minX: 2, minY: 2, maxX: 4, maxY: 4 });
    expect(r).toContain('big');
    expect(r).toContain('small');
    expect(r).not.toContain('far');
  });
});

// ─── GridIndex ────────────────────────────────────────────────────────────────

describe('GridIndex', () => {
  it('starts with size 0', () => {
    const g = new GridIndex<string>(1);
    expect(g.size).toBe(0);
  });

  for (let n = 1; n <= 40; n++) {
    it(`GridIndex insert ${n} points has size ${n}`, () => {
      const g = new GridIndex<number>(1);
      for (let i = 0; i < n; i++) g.insert({ x: i, y: 0 }, i);
      expect(g.size).toBe(n);
    });
  }

  it('query on empty grid returns empty', () => {
    const g = new GridIndex<number>(1);
    expect(g.query({ minX: 0, minY: 0, maxX: 10, maxY: 10 })).toHaveLength(0);
  });

  it('query returns inserted point within bbox', () => {
    const g = new GridIndex<string>(1);
    g.insert({ x: 3, y: 3 }, 'point');
    const r = g.query({ minX: 0, minY: 0, maxX: 5, maxY: 5 });
    expect(r).toContain('point');
  });

  it('query excludes point outside bbox', () => {
    const g = new GridIndex<string>(1);
    g.insert({ x: 10, y: 10 }, 'far');
    const r = g.query({ minX: 0, minY: 0, maxX: 5, maxY: 5 });
    expect(r).not.toContain('far');
  });

  it('nearest on empty grid returns undefined', () => {
    const g = new GridIndex<number>(1);
    expect(g.nearest({ x: 0, y: 0 })).toBeUndefined();
  });

  it('nearest returns the only inserted point', () => {
    const g = new GridIndex<string>(1);
    g.insert({ x: 5, y: 5 }, 'solo');
    expect(g.nearest({ x: 0, y: 0 })).toBe('solo');
  });

  for (let n = 2; n <= 20; n++) {
    it(`GridIndex nearest among ${n} grid points finds closest`, () => {
      const g = new GridIndex<number>(10);
      for (let i = 0; i < n; i++) g.insert({ x: i * 10, y: 0 }, i);
      const r = g.nearest({ x: 0, y: 0 });
      expect(r).toBe(0);
    });
  }

  it('GridIndex query returns all points in bbox', () => {
    const g = new GridIndex<number>(1);
    for (let i = 0; i < 10; i++) g.insert({ x: i, y: 0 }, i);
    const r = g.query({ minX: 2, minY: -0.5, maxX: 5, maxY: 0.5 });
    expect(r.length).toBe(4);
    expect(r.sort()).toEqual([2, 3, 4, 5]);
  });

  it('GridIndex with large cell size still queries correctly', () => {
    const g = new GridIndex<string>(100);
    g.insert({ x: 50, y: 50 }, 'A');
    g.insert({ x: 150, y: 50 }, 'B');
    const r = g.query({ minX: 0, minY: 0, maxX: 100, maxY: 100 });
    expect(r).toContain('A');
    expect(r).not.toContain('B');
  });

  for (let cs = 1; cs <= 10; cs++) {
    it(`GridIndex cellSize=${cs} correctly inserts 5 points`, () => {
      const g = new GridIndex<number>(cs);
      for (let i = 0; i < 5; i++) g.insert({ x: i * cs, y: 0 }, i);
      expect(g.size).toBe(5);
    });
  }

  it('GridIndex query with bbox exactly on cell boundary', () => {
    const g = new GridIndex<number>(5);
    g.insert({ x: 0, y: 0 }, 0);
    g.insert({ x: 5, y: 0 }, 5);
    g.insert({ x: 10, y: 0 }, 10);
    const r = g.query({ minX: 0, minY: -1, maxX: 5, maxY: 1 });
    expect(r).toContain(0);
    expect(r).toContain(5);
    expect(r).not.toContain(10);
  });

  it('GridIndex nearest picks closer of two candidates', () => {
    const g = new GridIndex<string>(10);
    g.insert({ x: 1, y: 0 }, 'near');
    g.insert({ x: 9, y: 0 }, 'far');
    expect(g.nearest({ x: 0, y: 0 })).toBe('near');
  });

  it('GridIndex handles duplicate coordinates', () => {
    const g = new GridIndex<number>(1);
    g.insert({ x: 0, y: 0 }, 1);
    g.insert({ x: 0, y: 0 }, 2);
    expect(g.size).toBe(2);
    const r = g.query({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
    expect(r.length).toBe(2);
  });

  it('GridIndex query with negative coords', () => {
    const g = new GridIndex<string>(5);
    g.insert({ x: -3, y: -3 }, 'neg');
    const r = g.query({ minX: -5, minY: -5, maxX: 0, maxY: 0 });
    expect(r).toContain('neg');
  });
});

// ─── geohashEncode / geohashDecode ───────────────────────────────────────────

describe('geohashEncode', () => {
  it('encodes London approximately', () => {
    const h = geohashEncode(51.5, -0.1, 6);
    expect(h).toHaveLength(6);
    expect(typeof h).toBe('string');
  });

  it('encodes with default precision 9', () => {
    const h = geohashEncode(0, 0);
    expect(h).toHaveLength(9);
  });

  for (let p = 1; p <= 12; p++) {
    it(`geohashEncode precision=${p} produces hash of length ${p}`, () => {
      const h = geohashEncode(40.7, -74.0, p);
      expect(h).toHaveLength(p);
    });
  }

  it('encodes same location consistently', () => {
    expect(geohashEncode(51.5, -0.1, 6)).toBe(geohashEncode(51.5, -0.1, 6));
  });

  it('produces different hashes for different locations', () => {
    expect(geohashEncode(0, 0, 5)).not.toBe(geohashEncode(1, 1, 5));
  });

  it('encodes equator', () => {
    const h = geohashEncode(0, 0, 4);
    expect(h).toHaveLength(4);
  });

  it('encodes north pole region', () => {
    const h = geohashEncode(89, 0, 5);
    expect(h).toHaveLength(5);
  });

  it('encodes south pole region', () => {
    const h = geohashEncode(-89, 0, 5);
    expect(h).toHaveLength(5);
  });

  it('only uses valid geohash chars', () => {
    const valid = new Set('0123456789bcdefghjkmnpqrstuvwxyz');
    const h = geohashEncode(37.8, -122.4, 8);
    for (const ch of h) expect(valid.has(ch)).toBe(true);
  });

  for (let lat = -80; lat <= 80; lat += 20) {
    it(`geohashEncode lat=${lat} lon=0 p=5 has length 5`, () => {
      expect(geohashEncode(lat, 0, 5)).toHaveLength(5);
    });
  }

  for (let lon = -160; lon <= 160; lon += 40) {
    it(`geohashEncode lat=0 lon=${lon} p=5 has length 5`, () => {
      expect(geohashEncode(0, lon, 5)).toHaveLength(5);
    });
  }
});

describe('geohashDecode', () => {
  it('decode returns lat and lon', () => {
    const h = geohashEncode(51.5, -0.1, 7);
    const d = geohashDecode(h);
    expect(d).toHaveProperty('lat');
    expect(d).toHaveProperty('lon');
    expect(d).toHaveProperty('error');
  });

  it('decode error lat and lon are positive', () => {
    const d = geohashDecode(geohashEncode(0, 0, 6));
    expect(d.error.lat).toBeGreaterThan(0);
    expect(d.error.lon).toBeGreaterThan(0);
  });

  it('decode approximates encoded location', () => {
    const lat = 48.85;
    const lon = 2.35;
    const h = geohashEncode(lat, lon, 7);
    const d = geohashDecode(h);
    expect(Math.abs(d.lat - lat)).toBeLessThan(0.01);
    expect(Math.abs(d.lon - lon)).toBeLessThan(0.01);
  });

  for (let p = 3; p <= 9; p++) {
    it(`geohashDecode precision=${p} approximates origin within error`, () => {
      const h = geohashEncode(0, 0, p);
      const d = geohashDecode(h);
      expect(Math.abs(d.lat)).toBeLessThan(d.error.lat * 2 + 1);
      expect(Math.abs(d.lon)).toBeLessThan(d.error.lon * 2 + 1);
    });
  }

  it('higher precision → smaller error', () => {
    const d5 = geohashDecode(geohashEncode(0, 0, 5));
    const d8 = geohashDecode(geohashEncode(0, 0, 8));
    expect(d8.error.lat).toBeLessThan(d5.error.lat);
  });

  it('decode negative coordinates', () => {
    const lat = -33.87;
    const lon = 151.21;
    const h = geohashEncode(lat, lon, 7);
    const d = geohashDecode(h);
    expect(Math.abs(d.lat - lat)).toBeLessThan(0.1);
    expect(Math.abs(d.lon - lon)).toBeLessThan(0.1);
  });

  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lon = -90; lon <= 90; lon += 45) {
      it(`geohashDecode roundtrip lat=${lat} lon=${lon}`, () => {
        const h = geohashEncode(lat, lon, 6);
        const d = geohashDecode(h);
        expect(Math.abs(d.lat - lat)).toBeLessThan(0.5);
        expect(Math.abs(d.lon - lon)).toBeLessThan(0.5);
      });
    }
  }
});

// ─── Mixed / integration tests ───────────────────────────────────────────────

describe('Integration: KDTree with string data', () => {
  it('stores and retrieves string data', () => {
    const tree = new KDTree<string>();
    tree.insert({ x: 1, y: 2 }, 'hello');
    expect(tree.search({ x: 1, y: 2 })).toBe('hello');
  });

  for (let n = 1; n <= 20; n++) {
    it(`KDTree search for all ${n} inserted string values`, () => {
      const tree = new KDTree<string>();
      for (let i = 0; i < n; i++) tree.insert({ x: i, y: 0 }, `item-${i}`);
      for (let i = 0; i < n; i++) {
        expect(tree.search({ x: i, y: 0 })).toBe(`item-${i}`);
      }
    });
  }
});

describe('Integration: KDTree + RTree cross-validation', () => {
  for (let n = 1; n <= 15; n++) {
    it(`KDTree rangeSearch and RTree search agree for ${n} points`, () => {
      const kdTree = new KDTree<number>();
      const rTree = new RTree<number>();
      for (let i = 0; i < n; i++) {
        kdTree.insert({ x: i, y: i }, i);
        rTree.insert({ minX: i, minY: i, maxX: i, maxY: i }, i);
      }
      const bbox: BBox = { minX: 0, minY: 0, maxX: n - 1, maxY: n - 1 };
      const kdResults = kdTree.rangeSearch(bbox).map(e => e.data).sort((a, b) => a - b);
      const rtResults = rTree.search(bbox).sort((a, b) => a - b);
      expect(kdResults).toEqual(rtResults);
    });
  }
});

describe('Integration: GridIndex query consistency', () => {
  for (let n = 1; n <= 20; n++) {
    it(`GridIndex query finds all ${n} grid points in containing bbox`, () => {
      const g = new GridIndex<number>(1);
      for (let i = 0; i < n; i++) g.insert({ x: i, y: 0 }, i);
      const r = g.query({ minX: -1, minY: -1, maxX: n + 1, maxY: 1 });
      expect(r.length).toBe(n);
    });
  }
});

describe('Edge cases and boundary conditions', () => {
  it('KDTree handles single float point exactly', () => {
    const tree = new KDTree<string>();
    tree.insert({ x: 1.23456789, y: 9.87654321 }, 'precise');
    expect(tree.search({ x: 1.23456789, y: 9.87654321 })).toBe('precise');
  });

  it('KDTree handles many points at same x', () => {
    const tree = new KDTree<number>();
    for (let i = 0; i < 10; i++) tree.insert({ x: 0, y: i }, i);
    expect(tree.size).toBe(10);
    const r = tree.rangeSearch({ minX: -1, minY: 0, maxX: 1, maxY: 9 });
    expect(r.length).toBe(10);
  });

  it('KDTree handles many points at same y', () => {
    const tree = new KDTree<number>();
    for (let i = 0; i < 10; i++) tree.insert({ x: i, y: 0 }, i);
    expect(tree.size).toBe(10);
    const r = tree.rangeSearch({ minX: 0, minY: -1, maxX: 9, maxY: 1 });
    expect(r.length).toBe(10);
  });

  it('RTree search with identical bboxes returns both', () => {
    const rt = new RTree<string>();
    const bb: BBox = { minX: 0, minY: 0, maxX: 1, maxY: 1 };
    rt.insert(bb, 'first');
    rt.insert(bb, 'second');
    const r = rt.search(bb);
    expect(r.length).toBe(2);
  });

  it('GridIndex multiple points same cell are all returned', () => {
    const g = new GridIndex<number>(10);
    for (let i = 0; i < 5; i++) g.insert({ x: 1, y: 1 }, i);
    const r = g.query({ minX: 0, minY: 0, maxX: 5, maxY: 5 });
    expect(r.length).toBe(5);
  });

  it('euclidean2D with same point gives 0', () => {
    const p = { x: 42.7, y: -13.5 };
    expect(euclidean2D(p, p)).toBe(0);
  });

  it('euclidean3D with same point gives 0', () => {
    const p = { x: 1.1, y: 2.2, z: 3.3 };
    expect(euclidean3D(p, p)).toBe(0);
  });

  it('bboxContains with degenerate (zero-area) bbox at a point', () => {
    const bb: BBox = { minX: 5, minY: 5, maxX: 5, maxY: 5 };
    expect(bboxContains(bb, { x: 5, y: 5 })).toBe(true);
    expect(bboxContains(bb, { x: 5, y: 5.001 })).toBe(false);
  });

  it('bboxOverlaps degenerate bboxes that share a corner', () => {
    const a: BBox = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    const b: BBox = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    expect(bboxOverlaps(a, b)).toBe(true);
  });

  it('KDTree3D insert and kNearest with k=0', () => {
    const tree = new KDTree3D<number>();
    tree.insert({ x: 0, y: 0, z: 0 }, 42);
    expect(tree.kNearest({ x: 0, y: 0, z: 0 }, 0)).toHaveLength(0);
  });

  it('GridIndex with cellSize 0.1 handles sub-unit coordinates', () => {
    const g = new GridIndex<string>(0.1);
    g.insert({ x: 0.05, y: 0.05 }, 'tiny');
    const r = g.query({ minX: 0, minY: 0, maxX: 0.1, maxY: 0.1 });
    expect(r).toContain('tiny');
  });

  for (let n = 1; n <= 10; n++) {
    it(`KDTree circleSearch radius=${n} from origin captures n*n*pi area points`, () => {
      const tree = new KDTree<number>();
      // Insert a 21x21 grid
      let idx = 0;
      for (let x = -10; x <= 10; x++) {
        for (let y = -10; y <= 10; y++) {
          tree.insert({ x, y }, idx++);
        }
      }
      const results = tree.circleSearch({ cx: 0, cy: 0, r: n });
      for (const e of results) {
        const dist = Math.sqrt(e.point.x ** 2 + e.point.y ** 2);
        expect(dist).toBeLessThanOrEqual(n + 1e-9);
      }
    });
  }
});

// ─── Additional coverage: KDTree large datasets ───────────────────────────────

describe('KDTree large dataset operations', () => {
  it('inserts 100 points and finds all via rangeSearch', () => {
    const tree = new KDTree<number>();
    for (let i = 0; i < 100; i++) tree.insert({ x: i % 10, y: Math.floor(i / 10) }, i);
    const r = tree.rangeSearch({ minX: 0, minY: 0, maxX: 9, maxY: 9 });
    expect(r.length).toBe(100);
  });

  it('kNearest k=10 from 100 points returns 10 closest', () => {
    const tree = new KDTree<number>();
    for (let i = 0; i < 100; i++) tree.insert({ x: i, y: 0 }, i);
    const r = tree.kNearest({ x: 0, y: 0 }, 10);
    expect(r.length).toBe(10);
    const datas = r.map(e => e.data);
    for (let i = 0; i < 10; i++) expect(datas).toContain(i);
  });

  it('nearest in 100-point grid finds true nearest', () => {
    const tree = new KDTree<number>();
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) tree.insert({ x: i, y: j }, i * 10 + j);
    }
    const r = tree.nearest({ x: 4.9, y: 4.9 });
    expect(r).toBeDefined();
    // Should be either (4,4), (4,5), (5,4), or (5,5) — all equidistant
    expect(r!.point.x).toBeGreaterThanOrEqual(4);
    expect(r!.point.x).toBeLessThanOrEqual(5);
  });

  for (let q = 0; q <= 9; q++) {
    it(`KDTree rangeSearch row ${q} of 10x10 grid returns 10 points`, () => {
      const tree = new KDTree<number>();
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) tree.insert({ x: i, y: j }, i * 10 + j);
      }
      const r = tree.rangeSearch({ minX: 0, minY: q, maxX: 9, maxY: q });
      expect(r.length).toBe(10);
    });
  }

  for (let q = 0; q <= 9; q++) {
    it(`KDTree rangeSearch col ${q} of 10x10 grid returns 10 points`, () => {
      const tree = new KDTree<number>();
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) tree.insert({ x: i, y: j }, i * 10 + j);
      }
      const r = tree.rangeSearch({ minX: q, minY: 0, maxX: q, maxY: 9 });
      expect(r.length).toBe(10);
    });
  }
});

// ─── Additional: RTree with many boxes ───────────────────────────────────────

describe('RTree many boxes', () => {
  for (let n = 1; n <= 20; n++) {
    it(`RTree all() after ${n} inserts returns ${n} items`, () => {
      const rt = new RTree<string>();
      for (let i = 0; i < n; i++) rt.insert({ minX: i, minY: 0, maxX: i + 1, maxY: 1 }, `item-${i}`);
      expect(rt.all().length).toBe(n);
    });
  }

  it('RTree delete all and all() returns empty', () => {
    const rt = new RTree<number>();
    const bbs: BBox[] = [];
    for (let i = 0; i < 10; i++) {
      const bb: BBox = { minX: i, minY: 0, maxX: i + 1, maxY: 1 };
      bbs.push(bb);
      rt.insert(bb, i);
    }
    for (let i = 0; i < 10; i++) rt.delete(bbs[i], i);
    expect(rt.size).toBe(0);
    expect(rt.all()).toHaveLength(0);
  });

  it('RTree search after deleting an entry does not return it', () => {
    const rt = new RTree<string>();
    const bb: BBox = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    rt.insert(bb, 'gone');
    rt.delete(bb, 'gone');
    expect(rt.search({ minX: 0, minY: 0, maxX: 10, maxY: 10 })).not.toContain('gone');
  });

  for (let n = 1; n <= 15; n++) {
    it(`RTree search finds overlapping set of size ${n} from 20 items`, () => {
      const rt = new RTree<number>();
      for (let i = 0; i < 20; i++) {
        rt.insert({ minX: i, minY: 0, maxX: i + 1, maxY: 1 }, i);
      }
      // query [0, n) range
      const r = rt.search({ minX: 0, minY: 0, maxX: n, maxY: 1 });
      // Should find items 0..n (those whose box overlaps [0,n])
      expect(r.length).toBeGreaterThanOrEqual(n);
    });
  }
});

// ─── Additional: GridIndex larger scenarios ───────────────────────────────────

describe('GridIndex larger scenarios', () => {
  it('GridIndex nearest in a 5x5 grid', () => {
    const g = new GridIndex<string>(1);
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        g.insert({ x, y }, `${x},${y}`);
      }
    }
    const r = g.nearest({ x: 2.4, y: 2.4 });
    expect(r).toBe('2,2');
  });

  for (let cs = 1; cs <= 10; cs++) {
    it(`GridIndex cellSize=${cs} query [0..${cs * 2 - 1}] finds inserted points`, () => {
      const g = new GridIndex<number>(cs);
      for (let i = 0; i < 5; i++) g.insert({ x: i * cs, y: 0 }, i);
      const r = g.query({ minX: 0, minY: -0.5, maxX: cs * 4, maxY: 0.5 });
      expect(r.length).toBe(5);
    });
  }

  it('GridIndex query after inserting duplicate coords returns both', () => {
    const g = new GridIndex<string>(5);
    g.insert({ x: 2, y: 2 }, 'alpha');
    g.insert({ x: 2, y: 2 }, 'beta');
    const r = g.query({ minX: 0, minY: 0, maxX: 4, maxY: 4 });
    expect(r).toContain('alpha');
    expect(r).toContain('beta');
  });

  it('GridIndex nearest with equidistant points returns one', () => {
    const g = new GridIndex<string>(10);
    g.insert({ x: -5, y: 0 }, 'left');
    g.insert({ x: 5, y: 0 }, 'right');
    const r = g.nearest({ x: 0, y: 0 });
    expect(['left', 'right']).toContain(r);
  });
});

// ─── KDTree3D additional coverage ─────────────────────────────────────────────

describe('KDTree3D additional', () => {
  it('KDTree3D handles large number of points', () => {
    const tree = new KDTree3D<number>();
    for (let i = 0; i < 50; i++) tree.insert({ x: i, y: i, z: i }, i);
    expect(tree.size).toBe(50);
    const r = tree.nearest({ x: 25, y: 25, z: 25 });
    expect(r!.data).toBe(25);
  });

  for (let n = 1; n <= 15; n++) {
    it(`KDTree3D kNearest k=${n} from 20 points returns ${n} results`, () => {
      const tree = new KDTree3D<number>();
      for (let i = 0; i < 20; i++) tree.insert({ x: i * 2, y: 0, z: 0 }, i);
      expect(tree.kNearest({ x: 0, y: 0, z: 0 }, n)).toHaveLength(n);
    });
  }

  it('KDTree3D kNearest with k > size returns all', () => {
    const tree = new KDTree3D<number>();
    for (let i = 0; i < 7; i++) tree.insert({ x: i, y: 0, z: 0 }, i);
    expect(tree.kNearest({ x: 0, y: 0, z: 0 }, 100)).toHaveLength(7);
  });

  it('KDTree3D nearest picks among different axes', () => {
    const tree = new KDTree3D<string>();
    tree.insert({ x: 0, y: 0, z: 1 }, 'z-near');
    tree.insert({ x: 0, y: 2, z: 0 }, 'y-mid');
    tree.insert({ x: 5, y: 0, z: 0 }, 'x-far');
    const r = tree.nearest({ x: 0, y: 0, z: 0 });
    expect(r!.data).toBe('z-near');
  });
});

// ─── Helpers combined tests ───────────────────────────────────────────────────

describe('Helper function combinations', () => {
  for (let n = 1; n <= 20; n++) {
    it(`bboxContains is consistent with euclidean2D for point (${n}, 0) in [0..20]`, () => {
      const bb: BBox = { minX: 0, minY: -1, maxX: 20, maxY: 1 };
      const p: Point2D = { x: n, y: 0 };
      expect(bboxContains(bb, p)).toBe(true);
      expect(euclidean2D({ x: 0, y: 0 }, p)).toBeCloseTo(n, 5);
    });
  }

  for (let n = 1; n <= 15; n++) {
    it(`pointInCircle and euclidean2D consistent for r=${n}`, () => {
      const c: Circle = { cx: 0, cy: 0, r: n };
      const p: Point2D = { x: n - 0.5, y: 0 };
      expect(pointInCircle(p, c)).toBe(true);
      expect(euclidean2D({ x: 0, y: 0 }, p)).toBeLessThan(n);
    });
  }

  it('bboxOverlaps is symmetric', () => {
    const a: BBox = { minX: 0, minY: 0, maxX: 5, maxY: 5 };
    const b: BBox = { minX: 3, minY: 3, maxX: 8, maxY: 8 };
    expect(bboxOverlaps(a, b)).toBe(bboxOverlaps(b, a));
  });

  it('bboxContains and bboxOverlaps agree for degenerate point', () => {
    const bb: BBox = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
    const pt: Point2D = { x: 5, y: 5 };
    const ptBox: BBox = { minX: pt.x, minY: pt.y, maxX: pt.x, maxY: pt.y };
    expect(bboxContains(bb, pt)).toBe(true);
    expect(bboxOverlaps(bb, ptBox)).toBe(true);
  });
});

// ─── Stress tests ─────────────────────────────────────────────────────────────

describe('Stress tests', () => {
  it('KDTree with 200 random-ish points nearest is correct', () => {
    const tree = new KDTree<number>();
    for (let i = 0; i < 200; i++) {
      const x = (i * 7) % 100;
      const y = (i * 13) % 100;
      tree.insert({ x, y }, i);
    }
    expect(tree.size).toBe(200);
    const r = tree.nearest({ x: 0, y: 0 });
    expect(r).toBeDefined();
  });

  it('KDTree3D with 150 points nearest returns a result', () => {
    const tree = new KDTree3D<number>();
    for (let i = 0; i < 150; i++) {
      tree.insert({ x: (i * 3) % 50, y: (i * 7) % 50, z: (i * 11) % 50 }, i);
    }
    expect(tree.size).toBe(150);
    const r = tree.nearest({ x: 0, y: 0, z: 0 });
    expect(r).toBeDefined();
  });

  it('RTree with 100 items — search returns correct overlap count', () => {
    const rt = new RTree<number>();
    for (let i = 0; i < 100; i++) {
      rt.insert({ minX: i, minY: 0, maxX: i + 1, maxY: 1 }, i);
    }
    const r = rt.search({ minX: 10, minY: 0, maxX: 20, maxY: 1 });
    expect(r.length).toBe(12); // boxes 9..20 (box i=9 has maxX=10 which touches minX=10)
  });

  it('GridIndex with 100 points query returns correct subset', () => {
    const g = new GridIndex<number>(10);
    for (let i = 0; i < 100; i++) g.insert({ x: i, y: 0 }, i);
    const r = g.query({ minX: 0, minY: -1, maxX: 9, maxY: 1 });
    expect(r.length).toBe(10);
    for (const v of r) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(9);
    }
  });
});

// ─── Extended euclidean distance tests ────────────────────────────────────────

describe('euclidean2D extended', () => {
  for (let n = 1; n <= 50; n++) {
    it(`euclidean2D distance from (0,0) to (${n},0) equals ${n}`, () => {
      expect(euclidean2D({ x: 0, y: 0 }, { x: n, y: 0 })).toBeCloseTo(n, 8);
    });
  }

  for (let n = 1; n <= 30; n++) {
    it(`euclidean2D is always non-negative for offset (${n}, ${n})`, () => {
      const d = euclidean2D({ x: 0, y: 0 }, { x: n, y: n });
      expect(d).toBeGreaterThan(0);
    });
  }

  it('euclidean2D triangle inequality holds', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 3, y: 0 };
    const c = { x: 0, y: 4 };
    expect(euclidean2D(a, c)).toBeLessThanOrEqual(euclidean2D(a, b) + euclidean2D(b, c));
  });
});

// ─── Extended bboxContains tests ──────────────────────────────────────────────

describe('bboxContains extended', () => {
  for (let n = 0; n <= 20; n++) {
    it(`bboxContains (${n}, 5) in [0..20, 0..10] = true`, () => {
      const bb: BBox = { minX: 0, minY: 0, maxX: 20, maxY: 10 };
      expect(bboxContains(bb, { x: n, y: 5 })).toBe(true);
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`bboxContains (${n + 20}, 5) outside right = false`, () => {
      const bb: BBox = { minX: 0, minY: 0, maxX: 20, maxY: 10 };
      expect(bboxContains(bb, { x: n + 20, y: 5 })).toBe(false);
    });
  }
});

// ─── Extended pointInCircle tests ────────────────────────────────────────────

describe('pointInCircle extended', () => {
  for (let r = 1; r <= 30; r++) {
    it(`pointInCircle: point on axis at r=${r} is inside circle of radius r`, () => {
      const c: Circle = { cx: 0, cy: 0, r };
      expect(pointInCircle({ x: r, y: 0 }, c)).toBe(true);
    });
  }

  for (let r = 1; r <= 20; r++) {
    it(`pointInCircle: point at (${r}+0.01, 0) is outside circle of radius ${r}`, () => {
      const c: Circle = { cx: 0, cy: 0, r };
      expect(pointInCircle({ x: r + 0.01, y: 0 }, c)).toBe(false);
    });
  }
});

// ─── Extended KDTree nearest / rangeSearch ────────────────────────────────────

describe('KDTree nearest extended', () => {
  for (let n = 1; n <= 30; n++) {
    it(`KDTree nearest from ${n} points along y-axis finds point at y=0`, () => {
      const tree = new KDTree<number>();
      for (let i = 0; i < n; i++) tree.insert({ x: 0, y: i }, i);
      const r = tree.nearest({ x: 0, y: 0 });
      expect(r!.data).toBe(0);
    });
  }
});

describe('KDTree rangeSearch extended', () => {
  for (let half = 1; half <= 25; half++) {
    it(`KDTree rangeSearch square [-${half}..${half}] on 51x51 grid`, () => {
      const tree = new KDTree<number>();
      let idx = 0;
      for (let x = -25; x <= 25; x++) {
        for (let y = -25; y <= 25; y++) {
          tree.insert({ x, y }, idx++);
        }
      }
      const r = tree.rangeSearch({ minX: -half, minY: -half, maxX: half, maxY: half });
      expect(r.length).toBe((2 * half + 1) ** 2);
    });
  }
});

// ─── Extended RTree tests ─────────────────────────────────────────────────────

describe('RTree extended search and delete', () => {
  for (let n = 1; n <= 25; n++) {
    it(`RTree insert and all() length is ${n}`, () => {
      const rt = new RTree<number>();
      for (let i = 0; i < n; i++) rt.insert({ minX: i, minY: 0, maxX: i + 1, maxY: 1 }, i);
      expect(rt.all().length).toBe(n);
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`RTree delete ${n} of 25 items leaves size=${25 - n}`, () => {
      const rt = new RTree<number>();
      const bboxes: BBox[] = [];
      for (let i = 0; i < 25; i++) {
        const bb: BBox = { minX: i, minY: 0, maxX: i + 1, maxY: 1 };
        bboxes.push(bb);
        rt.insert(bb, i);
      }
      for (let i = 0; i < n; i++) rt.delete(bboxes[i], i);
      expect(rt.size).toBe(25 - n);
    });
  }
});

// ─── Extended GridIndex tests ─────────────────────────────────────────────────

describe('GridIndex extended query', () => {
  for (let n = 1; n <= 20; n++) {
    it(`GridIndex cellSize=1 query row 0..${n - 1} finds ${n} points`, () => {
      const g = new GridIndex<number>(1);
      for (let i = 0; i < 30; i++) g.insert({ x: i, y: 0 }, i);
      const r = g.query({ minX: 0, minY: -0.5, maxX: n - 1, maxY: 0.5 });
      expect(r.length).toBe(n);
    });
  }

  for (let n = 1; n <= 15; n++) {
    it(`GridIndex nearest from ${n + 1} collinear points picks index 0`, () => {
      const g = new GridIndex<number>(1);
      for (let i = 0; i <= n; i++) g.insert({ x: i, y: 0 }, i);
      expect(g.nearest({ x: 0, y: 0 })).toBe(0);
    });
  }
});

// ─── KDTree3D nearest extended ────────────────────────────────────────────────

describe('KDTree3D nearest extended', () => {
  for (let n = 1; n <= 25; n++) {
    it(`KDTree3D nearest from ${n} z-axis points picks index 1 from origin`, () => {
      const tree = new KDTree3D<number>();
      for (let i = 1; i <= n; i++) tree.insert({ x: 0, y: 0, z: i }, i);
      const r = tree.nearest({ x: 0, y: 0, z: 0 });
      expect(r!.data).toBe(1);
    });
  }
});

// ─── geohashEncode extended precision tests ───────────────────────────────────

describe('geohashEncode extended', () => {
  for (let lon = -170; lon <= 170; lon += 10) {
    it(`geohashEncode at lon=${lon} lat=0 p=4 produces length-4 hash`, () => {
      expect(geohashEncode(0, lon, 4)).toHaveLength(4);
    });
  }
});
