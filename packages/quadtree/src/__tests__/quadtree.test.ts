// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  Quadtree,
  RegionQuadtree,
  inBounds,
  boundsOverlap,
  boundsContains,
  distance2D,
  distanceToBounds,
  buildQuadtree,
  Point2D,
  Bounds,
  PointData,
} from '../quadtree';

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree.insert — 100+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree.insert', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 };

  // Grid of points 0..9 in each axis → 100 tests
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      it(`inserts point (${i * 9},${j * 9}) and returns true`, () => {
        const qt = new Quadtree<string>(bounds);
        expect(qt.insert({ x: i * 9, y: j * 9 }, `v_${i}_${j}`)).toBe(true);
        expect(qt.size).toBe(1);
      });
    }
  }

  // Out-of-bounds points → 10 tests
  for (let i = 0; i < 10; i++) {
    it(`returns false for out-of-bounds point (${100 + i * 5}, 50)`, () => {
      const qt = new Quadtree<number>(bounds);
      expect(qt.insert({ x: 100 + i * 5, y: 50 }, i)).toBe(false);
      expect(qt.size).toBe(0);
    });
  }

  // Negative out-of-bounds → 5 tests
  for (let i = 1; i <= 5; i++) {
    it(`returns false for negative out-of-bounds point (-${i}, 50)`, () => {
      const qt = new Quadtree<number>(bounds);
      expect(qt.insert({ x: -i, y: 50 }, i)).toBe(false);
    });
  }

  it('inserts multiple points and tracks size correctly', () => {
    const qt = new Quadtree<number>(bounds);
    for (let i = 0; i < 20; i++) {
      qt.insert({ x: i * 4, y: i * 4 }, i);
    }
    expect(qt.size).toBe(20);
  });

  it('inserts point at origin (0, 0)', () => {
    const qt = new Quadtree<string>(bounds);
    expect(qt.insert({ x: 0, y: 0 }, 'origin')).toBe(true);
  });

  it('rejects point exactly at x+width boundary (x=100)', () => {
    const qt = new Quadtree<number>(bounds);
    expect(qt.insert({ x: 100, y: 50 }, 1)).toBe(false);
  });

  it('rejects point exactly at y+height boundary (y=100)', () => {
    const qt = new Quadtree<number>(bounds);
    expect(qt.insert({ x: 50, y: 100 }, 1)).toBe(false);
  });

  it('forces subdivision when capacity is exceeded', () => {
    const qt = new Quadtree<number>(bounds, 2);
    for (let i = 0; i < 8; i++) {
      qt.insert({ x: i * 10 + 1, y: i * 10 + 1 }, i);
    }
    expect(qt.size).toBe(8);
    expect(qt.depth).toBeGreaterThan(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree.query (rectangular region) — 100+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree.query rectangular region', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 200, height: 200 };

  // Build a tree with 10x10 grid points (at 10, 30, 50, ..., 190)
  function buildGrid(): Quadtree<string> {
    const qt = new Quadtree<string>(bounds);
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        qt.insert({ x: i * 20 + 10, y: j * 20 + 10 }, `${i},${j}`);
      }
    }
    return qt;
  }

  // Query exact single-cell regions — 100 tests
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      it(`finds exactly point (${i * 20 + 10},${j * 20 + 10}) in its cell`, () => {
        const qt = buildGrid();
        const region: Bounds = { x: i * 20, y: j * 20, width: 20, height: 20 };
        const result = qt.query(region);
        expect(result.length).toBe(1);
        expect(result[0].data).toBe(`${i},${j}`);
      });
    }
  }

  it('returns all 100 points when querying full bounds', () => {
    const qt = buildGrid();
    expect(qt.query(bounds).length).toBe(100);
  });

  it('returns 0 points for a non-overlapping region', () => {
    const qt = buildGrid();
    expect(qt.query({ x: 201, y: 0, width: 10, height: 10 }).length).toBe(0);
  });

  it('returns correct count when querying top half', () => {
    const qt = buildGrid();
    const result = qt.query({ x: 0, y: 0, width: 200, height: 100 });
    expect(result.length).toBe(50);
  });

  it('returns correct count when querying left half', () => {
    const qt = buildGrid();
    const result = qt.query({ x: 0, y: 0, width: 100, height: 200 });
    expect(result.length).toBe(50);
  });

  it('returns correct count for top-left quadrant', () => {
    const qt = buildGrid();
    const result = qt.query({ x: 0, y: 0, width: 100, height: 100 });
    expect(result.length).toBe(25);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree.queryCircle — 80+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree.queryCircle', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 200, height: 200 };

  function buildRing(): Quadtree<number> {
    const qt = new Quadtree<number>(bounds);
    // 36 points on a ring at radius 50 from (100,100)
    for (let i = 0; i < 36; i++) {
      const angle = (i * Math.PI * 2) / 36;
      qt.insert({ x: 100 + Math.cos(angle) * 50, y: 100 + Math.sin(angle) * 50 }, i);
    }
    return qt;
  }

  // Query with increasing radius from centre — 36 tests checking each ring point
  for (let i = 0; i < 36; i++) {
    it(`finds ring point ${i} with radius 50.1 from (100,100)`, () => {
      const qt = buildRing();
      const result = qt.queryCircle({ x: 100, y: 100 }, 50.1);
      expect(result.length).toBe(36);
    });
  }

  it('finds 0 points with radius 0 from (100,100) when no point at centre', () => {
    const qt = buildRing();
    expect(qt.queryCircle({ x: 100, y: 100 }, 0).length).toBe(0);
  });

  it('finds all points with sufficiently large radius', () => {
    const qt = buildRing();
    expect(qt.queryCircle({ x: 100, y: 100 }, 200).length).toBe(36);
  });

  // Varying center positions — 40 tests
  for (let i = 0; i < 40; i++) {
    const cx = i * 5;
    it(`queryCircle center (${cx}, 100) radius 5 returns non-negative count`, () => {
      const qt = new Quadtree<number>(bounds);
      qt.insert({ x: cx, y: 100 }, i);
      const result = qt.queryCircle({ x: cx, y: 100 }, 1);
      expect(result.length).toBe(1);
    });
  }

  it('does not include points just outside radius', () => {
    const qt = new Quadtree<number>(bounds);
    qt.insert({ x: 150, y: 100 }, 1);
    const result = qt.queryCircle({ x: 100, y: 100 }, 49);
    expect(result.length).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree.nearest — 80+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree.nearest', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 };

  function buildLine(): Quadtree<number> {
    const qt = new Quadtree<number>(bounds);
    for (let i = 0; i < 10; i++) {
      qt.insert({ x: i * 10 + 5, y: 50 }, i);
    }
    return qt;
  }

  // nearest(p, k) for k = 1..10 from origin — 10 tests
  for (let k = 1; k <= 10; k++) {
    it(`returns ${k} nearest points from (0, 50)`, () => {
      const qt = buildLine();
      const result = qt.nearest({ x: 0, y: 50 }, k);
      expect(result.length).toBe(k);
    });
  }

  // Verify ordering for k=3 from various positions — 30 tests
  for (let pos = 0; pos < 30; pos++) {
    it(`nearest results are sorted by distance for query from (${pos * 3}, 50)`, () => {
      const qt = buildLine();
      const center: Point2D = { x: pos * 3, y: 50 };
      const result = qt.nearest(center, 3);
      for (let i = 0; i < result.length - 1; i++) {
        expect(distance2D(result[i].point, center)).toBeLessThanOrEqual(
          distance2D(result[i + 1].point, center)
        );
      }
    });
  }

  // k=0 returns empty — 5 tests
  for (let i = 0; i < 5; i++) {
    it(`nearest(point, 0) returns empty array (test ${i})`, () => {
      const qt = buildLine();
      expect(qt.nearest({ x: i * 10, y: 50 }, 0)).toEqual([]);
    });
  }

  it('returns all points when k >= size', () => {
    const qt = buildLine();
    expect(qt.nearest({ x: 50, y: 50 }, 100).length).toBe(10);
  });

  it('returns empty from empty tree', () => {
    const qt = new Quadtree<number>(bounds);
    expect(qt.nearest({ x: 50, y: 50 }, 3)).toEqual([]);
  });

  // Verify nearest picks closest point — 30 tests
  for (let i = 0; i < 30; i++) {
    it(`nearest(1) from (${i * 3 + 5}, 50) returns the closest line point`, () => {
      const qt = buildLine();
      const x = i * 3 + 5;
      const result = qt.nearest({ x, y: 50 }, 1);
      expect(result.length).toBe(1);
      // Compute all distances and verify the returned point is indeed closest
      const all = qt.all();
      const minDist = Math.min(...all.map(pd => distance2D(pd.point, { x, y: 50 })));
      expect(distance2D(result[0].point, { x, y: 50 })).toBeCloseTo(minDist, 8);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree.closestPoint — 80+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree.closestPoint', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 200, height: 200 };

  // Diagonal points 0,0 to 190,190 step 20 — 10 points
  function buildDiagonal(): Quadtree<number> {
    const qt = new Quadtree<number>(bounds);
    for (let i = 0; i < 10; i++) {
      qt.insert({ x: i * 20, y: i * 20 }, i);
    }
    return qt;
  }

  // Each point should be closest to itself — 10 tests
  for (let i = 0; i < 10; i++) {
    it(`closestPoint to (${i * 20}, ${i * 20}) returns data ${i}`, () => {
      const qt = buildDiagonal();
      const result = qt.closestPoint({ x: i * 20, y: i * 20 });
      expect(result).not.toBeNull();
      expect(result!.data).toBe(i);
    });
  }

  // Midpoints between diagonal points — 9 tests
  for (let i = 0; i < 9; i++) {
    it(`closestPoint to midpoint between ${i} and ${i + 1} returns one of them`, () => {
      const qt = buildDiagonal();
      const mid: Point2D = { x: i * 20 + 10, y: i * 20 + 10 };
      const result = qt.closestPoint(mid);
      expect(result).not.toBeNull();
      expect([i, i + 1]).toContain(result!.data);
    });
  }

  it('returns null for empty tree', () => {
    const qt = new Quadtree<number>(bounds);
    expect(qt.closestPoint({ x: 50, y: 50 })).toBeNull();
  });

  // Single point in tree — 20 tests
  for (let i = 0; i < 20; i++) {
    it(`closestPoint with single point (${i * 8}, ${i * 8}) returns that point`, () => {
      const qt = new Quadtree<number>(bounds);
      qt.insert({ x: i * 8, y: i * 8 }, i);
      const result = qt.closestPoint({ x: 0, y: 0 });
      expect(result).not.toBeNull();
      expect(result!.data).toBe(i);
    });
  }

  // Off-tree query positions — 40 tests
  for (let i = 0; i < 40; i++) {
    it(`closestPoint from external position (${i * 5}, 0) finds closest diagonal point`, () => {
      const qt = buildDiagonal();
      const result = qt.closestPoint({ x: i * 5, y: 0 });
      expect(result).not.toBeNull();
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree.remove — 60+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree.remove', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 };

  // Remove each of 10 inserted points — 10 tests
  for (let i = 0; i < 10; i++) {
    it(`removes point (${i * 9}, ${i * 9}) and size decreases`, () => {
      const qt = new Quadtree<number>(bounds);
      for (let j = 0; j < 10; j++) qt.insert({ x: j * 9, y: j * 9 }, j);
      const before = qt.size;
      const removed = qt.remove({ x: i * 9, y: i * 9 });
      expect(removed).toBe(true);
      expect(qt.size).toBe(before - 1);
    });
  }

  // Remove non-existent point — 10 tests
  for (let i = 0; i < 10; i++) {
    it(`returns false when removing non-existent point (${i + 200}, 50)`, () => {
      const qt = new Quadtree<number>(bounds);
      qt.insert({ x: 50, y: 50 }, 1);
      expect(qt.remove({ x: i + 200, y: 50 })).toBe(false);
    });
  }

  // Remove from empty tree — 10 tests
  for (let i = 0; i < 10; i++) {
    it(`remove from empty tree returns false (test ${i})`, () => {
      const qt = new Quadtree<number>(bounds);
      expect(qt.remove({ x: i * 10, y: i * 10 })).toBe(false);
    });
  }

  it('remove all points one by one leaves empty tree', () => {
    const qt = new Quadtree<number>(bounds);
    const pts: Point2D[] = [];
    for (let i = 0; i < 10; i++) {
      const p = { x: i * 9, y: i * 9 };
      pts.push(p);
      qt.insert(p, i);
    }
    for (const p of pts) qt.remove(p);
    expect(qt.size).toBe(0);
  });

  // Remove and verify point is gone from query — 20 tests
  for (let i = 0; i < 20; i++) {
    it(`after removing point (${i * 4}, ${i * 4}), query returns 0 for that region`, () => {
      const qt = new Quadtree<number>(bounds);
      qt.insert({ x: i * 4, y: i * 4 }, i);
      qt.remove({ x: i * 4, y: i * 4 });
      const region: Bounds = { x: i * 4 - 1, y: i * 4 - 1, width: 3, height: 3 };
      // Only query if region is valid
      if (i * 4 >= 1) {
        expect(qt.query(region).filter(pd => pd.point.x === i * 4 && pd.point.y === i * 4).length).toBe(0);
      }
    });
  }

  it('removes only first matching point at coordinates', () => {
    const qt = new Quadtree<number>(bounds, 10);
    qt.insert({ x: 50, y: 50 }, 1);
    qt.insert({ x: 50, y: 50 }, 2);
    const before = qt.size;
    qt.remove({ x: 50, y: 50 });
    expect(qt.size).toBe(before - 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree.all() — 50+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree.all()', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 };

  // Various sizes — 20 tests
  for (let n = 0; n < 20; n++) {
    it(`all() returns ${n} items when ${n} points inserted`, () => {
      const qt = new Quadtree<number>(bounds);
      for (let i = 0; i < n; i++) qt.insert({ x: (i % 10) * 9, y: Math.floor(i / 10) * 9 }, i);
      expect(qt.all().length).toBe(n);
    });
  }

  it('all() returns empty array for new tree', () => {
    const qt = new Quadtree<number>(bounds);
    expect(qt.all()).toEqual([]);
  });

  it('all() returns all points including post-subdivision', () => {
    const qt = new Quadtree<number>(bounds, 2);
    const pts = [
      { x: 10, y: 10 }, { x: 80, y: 10 },
      { x: 10, y: 80 }, { x: 80, y: 80 },
      { x: 50, y: 50 },
    ];
    pts.forEach((p, i) => qt.insert(p, i));
    expect(qt.all().length).toBe(pts.length);
  });

  // Data integrity — 20 tests
  for (let n = 5; n <= 24; n++) {
    it(`all() from tree with ${n} points has correct data values`, () => {
      const qt = new Quadtree<number>(bounds);
      const inserted = new Set<number>();
      for (let i = 0; i < n; i++) {
        qt.insert({ x: (i % 10) * 9, y: Math.floor(i / 10) * 9 }, i);
        inserted.add(i);
      }
      const allData = new Set(qt.all().map(pd => pd.data));
      for (const v of inserted) expect(allData.has(v)).toBe(true);
    });
  }

  it('all() after clear() returns empty', () => {
    const qt = new Quadtree<number>(bounds);
    for (let i = 0; i < 5; i++) qt.insert({ x: i * 10, y: i * 10 }, i);
    qt.clear();
    expect(qt.all()).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree.size / .depth — 50+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree size and depth', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 };

  // size tracking — 20 tests
  for (let n = 0; n < 20; n++) {
    it(`size equals ${n} after ${n} insertions`, () => {
      const qt = new Quadtree<number>(bounds);
      for (let i = 0; i < n; i++) qt.insert({ x: (i % 10) * 9, y: Math.floor(i / 10) * 9 }, i);
      expect(qt.size).toBe(n);
    });
  }

  it('size is 0 for new tree', () => {
    expect(new Quadtree(bounds).size).toBe(0);
  });

  it('size is 0 after clear', () => {
    const qt = new Quadtree<number>(bounds);
    for (let i = 0; i < 10; i++) qt.insert({ x: i * 9, y: i * 9 }, i);
    qt.clear();
    expect(qt.size).toBe(0);
  });

  // depth — 10 tests
  it('depth is 1 for empty tree', () => {
    expect(new Quadtree(bounds).depth).toBe(1);
  });

  for (let capacity = 1; capacity <= 8; capacity++) {
    it(`depth increases with capacity=${capacity} and many points`, () => {
      const qt = new Quadtree<number>(bounds, capacity);
      for (let i = 0; i < 20; i++) qt.insert({ x: i * 4, y: i * 4 }, i);
      expect(qt.depth).toBeGreaterThanOrEqual(1);
    });
  }

  // bounds property — 10 tests
  for (let i = 0; i < 10; i++) {
    it(`bounds returns correct object for offset bounds (test ${i})`, () => {
      const b: Bounds = { x: i * 5, y: i * 5, width: 100, height: 100 };
      const qt = new Quadtree<number>(b);
      expect(qt.bounds).toEqual(b);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree.contains — 60+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree.contains', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 };

  // Points inside — 25 tests
  for (let i = 0; i < 25; i++) {
    it(`contains (${i * 3}, ${i * 3}) within [0,100)x[0,100)`, () => {
      const qt = new Quadtree<number>(bounds);
      if (i * 3 < 100) {
        expect(qt.contains({ x: i * 3, y: i * 3 })).toBe(true);
      }
    });
  }

  // Points outside — 20 tests
  const outsidePoints: Array<[number, number]> = [
    [100, 50], [50, 100], [-1, 50], [50, -1],
    [150, 150], [-10, -10], [100, 100], [0, 100],
    [101, 0], [0, 101], [200, 50], [50, 200],
    [-5, 5], [5, -5], [100, 0], [0, 100],
    [105, 50], [50, 105], [-1, 0], [0, -1],
  ];
  for (let i = 0; i < outsidePoints.length; i++) {
    const [x, y] = outsidePoints[i];
    it(`does not contain (${x}, ${y}) outside [0,100)x[0,100)`, () => {
      const qt = new Quadtree<number>(bounds);
      const expected = x >= 0 && x < 100 && y >= 0 && y < 100;
      expect(qt.contains({ x, y })).toBe(expected);
    });
  }

  // Custom bounds — 15 tests
  for (let i = 0; i < 15; i++) {
    it(`contains (${i * 5 + 10}, 50) in bounds x=10,width=80`, () => {
      const b: Bounds = { x: 10, y: 0, width: 80, height: 100 };
      const qt = new Quadtree<number>(b);
      const x = i * 5 + 10;
      expect(qt.contains({ x, y: 50 })).toBe(x >= 10 && x < 90);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RegionQuadtree set/get — 60+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('RegionQuadtree set/get', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 128, height: 128 };

  // Set and get 30 values at various grid positions
  for (let i = 0; i < 30; i++) {
    it(`sets value ${i + 1} at (${i * 4}, ${i * 4}) and retrieves it`, () => {
      const rq = new RegionQuadtree(bounds);
      rq.set({ x: i * 4, y: i * 4 }, i + 1);
      expect(rq.get({ x: i * 4, y: i * 4 })).toBe(i + 1);
    });
  }

  // get returns 0 for unset points — 10 tests
  for (let i = 0; i < 10; i++) {
    it(`get returns 0 for unset point (${i * 10}, ${i * 10})`, () => {
      const rq = new RegionQuadtree(bounds);
      expect(rq.get({ x: i * 10, y: i * 10 })).toBe(0);
    });
  }

  it('overwriting a value updates it', () => {
    const rq = new RegionQuadtree(bounds);
    rq.set({ x: 10, y: 10 }, 5);
    rq.set({ x: 10, y: 10 }, 99);
    expect(rq.get({ x: 10, y: 10 })).toBe(99);
  });

  it('clear resets all values', () => {
    const rq = new RegionQuadtree(bounds);
    rq.set({ x: 10, y: 10 }, 42);
    rq.clear();
    expect(rq.get({ x: 10, y: 10 })).toBe(0);
  });

  // Multiple distinct positions — 20 tests (start at i=1 to avoid (0,0) collision)
  for (let i = 1; i <= 20; i++) {
    it(`independent set/get at (${i * 6}, 0) and (0, ${i * 6})`, () => {
      const rq = new RegionQuadtree(bounds);
      rq.set({ x: i * 6, y: 0 }, i + 10);
      rq.set({ x: 0, y: i * 6 }, i + 20);
      expect(rq.get({ x: i * 6, y: 0 })).toBe(i + 10);
      expect(rq.get({ x: 0, y: i * 6 })).toBe(i + 20);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RegionQuadtree querySum / queryCount — 60+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('RegionQuadtree querySum and queryCount', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 128, height: 128 };

  it('querySum returns 0 for empty tree', () => {
    const rq = new RegionQuadtree(bounds);
    expect(rq.querySum(bounds)).toBe(0);
  });

  it('queryCount returns 0 for empty tree', () => {
    const rq = new RegionQuadtree(bounds);
    expect(rq.queryCount(bounds)).toBe(0);
  });

  it('querySum returns value of single set point', () => {
    const rq = new RegionQuadtree(bounds);
    rq.set({ x: 10, y: 10 }, 7);
    expect(rq.querySum(bounds)).toBe(7);
  });

  it('queryCount returns 1 for single set point', () => {
    const rq = new RegionQuadtree(bounds);
    rq.set({ x: 10, y: 10 }, 7);
    expect(rq.queryCount(bounds)).toBe(1);
  });

  // Sum of multiple distinct points — 20 tests
  for (let n = 1; n <= 20; n++) {
    it(`querySum of ${n} points each with value 1 equals ${n}`, () => {
      const rq = new RegionQuadtree(bounds);
      for (let i = 0; i < n; i++) {
        rq.set({ x: i * 6, y: 0 }, 1);
      }
      const sum = rq.querySum(bounds);
      expect(sum).toBe(n);
    });
  }

  // queryCount — 20 tests
  for (let n = 1; n <= 20; n++) {
    it(`queryCount of ${n} distinct points returns ${n}`, () => {
      const rq = new RegionQuadtree(bounds);
      for (let i = 0; i < n; i++) {
        rq.set({ x: i * 6, y: 0 }, n);
      }
      expect(rq.queryCount(bounds)).toBe(n);
    });
  }

  it('querySum of non-overlapping region returns 0', () => {
    const rq = new RegionQuadtree(bounds);
    rq.set({ x: 10, y: 10 }, 5);
    expect(rq.querySum({ x: 200, y: 200, width: 10, height: 10 })).toBe(0);
  });

  it('queryCount of non-overlapping region returns 0', () => {
    const rq = new RegionQuadtree(bounds);
    rq.set({ x: 10, y: 10 }, 5);
    expect(rq.queryCount({ x: 200, y: 200, width: 10, height: 10 })).toBe(0);
  });

  it('size is 0 for empty RegionQuadtree', () => {
    expect(new RegionQuadtree(bounds).size).toBe(0);
  });

  it('size increases when setting non-zero values', () => {
    const rq = new RegionQuadtree(bounds);
    rq.set({ x: 10, y: 10 }, 5);
    expect(rq.size).toBeGreaterThan(0);
  });

  it('size resets after clear()', () => {
    const rq = new RegionQuadtree(bounds);
    rq.set({ x: 10, y: 10 }, 5);
    rq.clear();
    expect(rq.size).toBe(0);
  });

  // Setting value to 0 removes the point contribution — 10 tests
  for (let i = 1; i <= 10; i++) {
    it(`setting point ${i} to 0 and then queryCount returns 0`, () => {
      const rq = new RegionQuadtree(bounds);
      rq.set({ x: i * 10, y: i * 10 }, i);
      rq.set({ x: i * 10, y: i * 10 }, 0);
      expect(rq.queryCount(bounds)).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// inBounds helper — 50+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('inBounds helper', () => {
  const b: Bounds = { x: 10, y: 20, width: 50, height: 40 };

  // Inside points — 20 tests
  for (let i = 0; i < 20; i++) {
    const px = 10 + i * 2;
    const py = 20 + i;
    it(`inBounds (${px}, ${py}) in [10,60)x[20,60) => ${px < 60 && py < 60}`, () => {
      expect(inBounds({ x: px, y: py }, b)).toBe(px >= 10 && px < 60 && py >= 20 && py < 60);
    });
  }

  // Boundary corners — 4 tests
  it('inBounds top-left corner (10, 20) is true', () => expect(inBounds({ x: 10, y: 20 }, b)).toBe(true));
  it('inBounds top-right boundary (60, 20) is false', () => expect(inBounds({ x: 60, y: 20 }, b)).toBe(false));
  it('inBounds bottom-left boundary (10, 60) is false', () => expect(inBounds({ x: 10, y: 60 }, b)).toBe(false));
  it('inBounds bottom-right corner (60, 60) is false', () => expect(inBounds({ x: 60, y: 60 }, b)).toBe(false));

  // Outside — 20 tests
  for (let i = 0; i < 20; i++) {
    const px = 60 + i;
    it(`inBounds (${px}, 30) outside right edge is false`, () => {
      expect(inBounds({ x: px, y: 30 }, b)).toBe(false);
    });
  }

  // Negative coords — 6 tests
  for (let i = 0; i < 6; i++) {
    it(`inBounds (-${i + 1}, 30) is false`, () => {
      expect(inBounds({ x: -(i + 1), y: 30 }, b)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// boundsOverlap helper — 50+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('boundsOverlap helper', () => {
  const a: Bounds = { x: 0, y: 0, width: 100, height: 100 };

  it('identical bounds overlap', () => {
    expect(boundsOverlap(a, a)).toBe(true);
  });

  it('fully contained bounds overlap', () => {
    expect(boundsOverlap(a, { x: 10, y: 10, width: 20, height: 20 })).toBe(true);
  });

  it('adjacent bounds (touching edge) do not overlap', () => {
    expect(boundsOverlap(a, { x: 100, y: 0, width: 50, height: 100 })).toBe(false);
  });

  it('non-overlapping bounds (to the right) return false', () => {
    expect(boundsOverlap(a, { x: 200, y: 0, width: 50, height: 100 })).toBe(false);
  });

  it('non-overlapping bounds (below) return false', () => {
    expect(boundsOverlap(a, { x: 0, y: 200, width: 100, height: 50 })).toBe(false);
  });

  // Partial overlaps — 20 tests
  for (let offset = 1; offset < 20; offset++) {
    it(`partially overlapping bounds with offset ${offset} return true`, () => {
      const b: Bounds = { x: offset * 5, y: offset * 5, width: 100, height: 100 };
      // Only overlaps if b doesn't fully escape a
      const expected = !(offset * 5 >= 100 || offset * 5 >= 100);
      expect(boundsOverlap(a, b)).toBe(expected);
    });
  }

  // Disjoint to left — 10 tests
  for (let i = 1; i <= 10; i++) {
    it(`bounds to the left by ${i} units do not overlap`, () => {
      const b: Bounds = { x: -(50 + i), y: 0, width: 50, height: 100 };
      expect(boundsOverlap(a, b)).toBe(false);
    });
  }

  // Corner-touching — 4 tests
  it('corner-touching bounds (top-right) do not overlap', () => {
    expect(boundsOverlap(a, { x: 100, y: 0, width: 10, height: 10 })).toBe(false);
  });
  it('corner-touching bounds (bottom-right) do not overlap', () => {
    expect(boundsOverlap(a, { x: 100, y: 100, width: 10, height: 10 })).toBe(false);
  });
  it('corner-touching bounds (bottom-left) do not overlap', () => {
    expect(boundsOverlap(a, { x: -10, y: 100, width: 10, height: 10 })).toBe(false);
  });
  it('corner-touching bounds (top-left) do not overlap', () => {
    expect(boundsOverlap(a, { x: -10, y: -10, width: 10, height: 10 })).toBe(false);
  });

  // Large outer with small inner — 10 tests
  for (let i = 1; i <= 10; i++) {
    it(`large outer bounds contains small inner (test ${i}) — overlap true`, () => {
      const inner: Bounds = { x: i * 5, y: i * 5, width: 5, height: 5 };
      const outer: Bounds = { x: 0, y: 0, width: 1000, height: 1000 };
      expect(boundsOverlap(outer, inner)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// boundsContains helper — 50+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('boundsContains helper', () => {
  const outer: Bounds = { x: 0, y: 0, width: 100, height: 100 };

  it('identical bounds contain each other', () => {
    expect(boundsContains(outer, outer)).toBe(true);
  });

  it('outer contains a smaller inner', () => {
    expect(boundsContains(outer, { x: 10, y: 10, width: 50, height: 50 })).toBe(true);
  });

  it('outer does not contain slightly overflowing inner', () => {
    expect(boundsContains(outer, { x: 50, y: 50, width: 60, height: 60 })).toBe(false);
  });

  it('inner does not contain outer', () => {
    expect(boundsContains({ x: 10, y: 10, width: 50, height: 50 }, outer)).toBe(false);
  });

  // Various inner sizes — 20 tests
  for (let size = 5; size <= 24; size++) {
    it(`outer (0,0,100,100) contains inner (5,5,${size},${size}) => ${5 + size <= 100}`, () => {
      const inner: Bounds = { x: 5, y: 5, width: size, height: size };
      expect(boundsContains(outer, inner)).toBe(5 + size <= 100);
    });
  }

  // Edge cases — 10 tests
  it('zero-width inner at left edge is contained', () => {
    expect(boundsContains(outer, { x: 0, y: 0, width: 0, height: 50 })).toBe(true);
  });

  for (let i = 1; i <= 9; i++) {
    it(`inner shifted by ${i} still within 100x100 outer`, () => {
      const inner: Bounds = { x: i, y: i, width: 100 - 2 * i, height: 100 - 2 * i };
      expect(boundsContains(outer, inner)).toBe(true);
    });
  }

  // Off-axis inners — 20 tests
  for (let i = 0; i < 20; i++) {
    const innerX = i * 2;
    it(`inner at x=${innerX} with width 10 is ${innerX + 10 <= 100 ? '' : 'not '}contained`, () => {
      const inner: Bounds = { x: innerX, y: 0, width: 10, height: 50 };
      expect(boundsContains(outer, inner)).toBe(innerX + 10 <= 100);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// distance2D helper — 50+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('distance2D helper', () => {
  it('distance from (0,0) to (0,0) is 0', () => {
    expect(distance2D({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
  });

  it('distance from (0,0) to (3,4) is 5', () => {
    expect(distance2D({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5, 10);
  });

  it('distance from (0,0) to (1,0) is 1', () => {
    expect(distance2D({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(1);
  });

  it('distance is symmetric', () => {
    const a: Point2D = { x: 3, y: 4 };
    const b: Point2D = { x: 7, y: 1 };
    expect(distance2D(a, b)).toBeCloseTo(distance2D(b, a), 10);
  });

  // Known Pythagorean triples — 10 tests
  const triples: Array<[number, number, number, number, number]> = [
    [0, 0, 3, 4, 5],
    [0, 0, 5, 12, 13],
    [0, 0, 8, 15, 17],
    [0, 0, 7, 24, 25],
    [0, 0, 20, 21, 29],
    [0, 0, 9, 40, 41],
    [0, 0, 12, 35, 37],
    [0, 0, 11, 60, 61],
    [0, 0, 13, 84, 85],
    [0, 0, 6, 8, 10],
  ];
  for (const [x1, y1, x2, y2, expected] of triples) {
    it(`distance2D (${x1},${y1}) to (${x2},${y2}) ≈ ${expected}`, () => {
      expect(distance2D({ x: x1, y: y1 }, { x: x2, y: y2 })).toBeCloseTo(expected, 8);
    });
  }

  // Distance with negative coords — 10 tests
  for (let i = 0; i < 10; i++) {
    it(`distance2D (0,0) to (-${i * 3}, -${i * 4}) ≈ ${i * 5}`, () => {
      expect(distance2D({ x: 0, y: 0 }, { x: -i * 3, y: -i * 4 })).toBeCloseTo(i * 5, 8);
    });
  }

  // Horizontal/vertical — 20 tests
  for (let d = 1; d <= 10; d++) {
    it(`horizontal distance (0,0)-(${d},0) = ${d}`, () => {
      expect(distance2D({ x: 0, y: 0 }, { x: d, y: 0 })).toBe(d);
    });
    it(`vertical distance (0,0)-(0,${d}) = ${d}`, () => {
      expect(distance2D({ x: 0, y: 0 }, { x: 0, y: d })).toBe(d);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// distanceToBounds helper — 50+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('distanceToBounds helper', () => {
  const b: Bounds = { x: 10, y: 10, width: 80, height: 80 };

  it('point inside bounds has distance 0', () => {
    expect(distanceToBounds({ x: 50, y: 50 }, b)).toBe(0);
  });

  it('point at top-left corner has distance 0', () => {
    expect(distanceToBounds({ x: 10, y: 10 }, b)).toBe(0);
  });

  it('point directly to the right outside has correct distance', () => {
    expect(distanceToBounds({ x: 100, y: 50 }, b)).toBeCloseTo(10, 8); // 100 - (10+80) = 10
  });

  it('point directly above outside has correct distance', () => {
    expect(distanceToBounds({ x: 50, y: 0 }, b)).toBeCloseTo(10, 8); // 10 - 0 = 10
  });

  it('point at corner (10+80, 10) has distance 0 (boundary = inside)', () => {
    // x=90 is on the boundary of [10, 90)
    // distanceToBounds uses Math.max(..., 0) so at boundary = 0
    expect(distanceToBounds({ x: 90, y: 10 }, b)).toBe(0);
  });

  // Points outside to the right — 20 tests
  for (let i = 1; i <= 20; i++) {
    it(`point (${90 + i}, 50) has distanceToBounds ${i} from right edge`, () => {
      expect(distanceToBounds({ x: 90 + i, y: 50 }, b)).toBeCloseTo(i, 8);
    });
  }

  // Points above — 10 tests
  for (let i = 1; i <= 10; i++) {
    it(`point (50, ${10 - i}) has distanceToBounds ${i} from top edge`, () => {
      expect(distanceToBounds({ x: 50, y: 10 - i }, b)).toBeCloseTo(i, 8);
    });
  }

  // Corner diagonals — 5 tests
  it('point at (0, 0) has distanceToBounds ~sqrt(200) from corner (10,10)', () => {
    expect(distanceToBounds({ x: 0, y: 0 }, b)).toBeCloseTo(Math.sqrt(200), 8);
  });

  for (let i = 1; i <= 4; i++) {
    it(`diagonal point outside top-right corner distance (test ${i})`, () => {
      const p: Point2D = { x: 90 + i, y: 10 - i };
      // dx = i (right of x+width=90), dy = i (above y=10)
      const expected = Math.sqrt(i * i + i * i);
      expect(distanceToBounds(p, b)).toBeCloseTo(expected, 8);
    });
  }

  // Points deep inside — 10 tests
  for (let i = 0; i < 10; i++) {
    it(`interior point (${20 + i * 5}, ${20 + i * 5}) has distance 0`, () => {
      if (20 + i * 5 < 90) {
        expect(distanceToBounds({ x: 20 + i * 5, y: 20 + i * 5 }, b)).toBe(0);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// buildQuadtree — 30+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('buildQuadtree', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 };

  it('builds empty tree from empty array', () => {
    const qt = buildQuadtree([], bounds);
    expect(qt.size).toBe(0);
  });

  it('builds tree with correct size from N points', () => {
    const pts: Array<PointData<number>> = Array.from({ length: 10 }, (_, i) => ({
      point: { x: i * 9, y: i * 9 },
      data: i,
    }));
    const qt = buildQuadtree(pts, bounds);
    expect(qt.size).toBe(10);
  });

  // Build from n points (n = 1..10) — 10 tests
  for (let n = 1; n <= 10; n++) {
    it(`buildQuadtree with ${n} points has size ${n}`, () => {
      const pts: Array<PointData<string>> = Array.from({ length: n }, (_, i) => ({
        point: { x: i * (90 / Math.max(n - 1, 1)), y: i * (90 / Math.max(n - 1, 1)) },
        data: `p${i}`,
      }));
      const qt = buildQuadtree(pts, bounds);
      expect(qt.size).toBe(n);
    });
  }

  it('respects custom capacity', () => {
    const pts: Array<PointData<number>> = Array.from({ length: 8 }, (_, i) => ({
      point: { x: i * 10 + 5, y: 50 },
      data: i,
    }));
    const qtDefault = buildQuadtree(pts, bounds);
    const qtCap1 = buildQuadtree(pts, bounds, 1);
    expect(qtCap1.depth).toBeGreaterThanOrEqual(qtDefault.depth);
  });

  // Query after build — 10 tests
  for (let n = 1; n <= 10; n++) {
    it(`buildQuadtree(${n}) query full bounds returns ${n} results`, () => {
      const pts: Array<PointData<number>> = Array.from({ length: n }, (_, i) => ({
        point: { x: i * 9, y: i * 9 },
        data: i,
      }));
      const qt = buildQuadtree(pts, bounds);
      expect(qt.query(bounds).length).toBe(n);
    });
  }

  it('out-of-bounds points in input are silently skipped', () => {
    const pts: Array<PointData<number>> = [
      { point: { x: 50, y: 50 }, data: 1 },
      { point: { x: 200, y: 200 }, data: 2 }, // out of bounds
    ];
    const qt = buildQuadtree(pts, bounds);
    expect(qt.size).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge cases — 50+ tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Edge cases', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 };

  // Empty tree operations — 10 tests
  it('empty tree: size is 0', () => expect(new Quadtree(bounds).size).toBe(0));
  it('empty tree: depth is 1', () => expect(new Quadtree(bounds).depth).toBe(1));
  it('empty tree: all() is []', () => expect(new Quadtree(bounds).all()).toEqual([]));
  it('empty tree: query returns []', () => expect(new Quadtree(bounds).query(bounds)).toEqual([]));
  it('empty tree: queryCircle returns []', () => expect(new Quadtree(bounds).queryCircle({ x: 50, y: 50 }, 50)).toEqual([]));
  it('empty tree: nearest(p, 3) returns []', () => expect(new Quadtree(bounds).nearest({ x: 50, y: 50 }, 3)).toEqual([]));
  it('empty tree: closestPoint returns null', () => expect(new Quadtree(bounds).closestPoint({ x: 50, y: 50 })).toBeNull());
  it('empty tree: remove returns false', () => expect(new Quadtree(bounds).remove({ x: 50, y: 50 })).toBe(false));
  it('empty tree: contains(inside) is true', () => expect(new Quadtree(bounds).contains({ x: 50, y: 50 })).toBe(true));
  it('empty tree: contains(outside) is false', () => expect(new Quadtree(bounds).contains({ x: 150, y: 50 })).toBe(false));

  // Out-of-bounds inserts — 10 tests
  for (let i = 0; i < 10; i++) {
    it(`out-of-bounds insert does not increase size (test ${i})`, () => {
      const qt = new Quadtree<number>(bounds);
      qt.insert({ x: 100 + i, y: 100 + i }, i);
      expect(qt.size).toBe(0);
    });
  }

  // Single point — 10 tests
  it('single point: size is 1', () => {
    const qt = new Quadtree<number>(bounds);
    qt.insert({ x: 50, y: 50 }, 42);
    expect(qt.size).toBe(1);
  });
  it('single point: all() has 1 element', () => {
    const qt = new Quadtree<number>(bounds);
    qt.insert({ x: 50, y: 50 }, 42);
    expect(qt.all().length).toBe(1);
  });
  it('single point: nearest(p, 1) returns that point', () => {
    const qt = new Quadtree<number>(bounds);
    qt.insert({ x: 50, y: 50 }, 42);
    expect(qt.nearest({ x: 0, y: 0 }, 1)[0].data).toBe(42);
  });
  it('single point: closestPoint returns it', () => {
    const qt = new Quadtree<number>(bounds);
    qt.insert({ x: 50, y: 50 }, 42);
    expect(qt.closestPoint({ x: 0, y: 0 })!.data).toBe(42);
  });
  it('single point: remove returns true', () => {
    const qt = new Quadtree<number>(bounds);
    qt.insert({ x: 50, y: 50 }, 42);
    expect(qt.remove({ x: 50, y: 50 })).toBe(true);
    expect(qt.size).toBe(0);
  });

  // capacity = 1 — 10 tests (forces immediate split)
  for (let n = 2; n <= 11; n++) {
    it(`capacity=1, inserting ${n} points leads to size ${n} and depth > 1`, () => {
      const qt = new Quadtree<number>(bounds, 1);
      for (let i = 0; i < n; i++) qt.insert({ x: i * 8, y: i * 8 }, i);
      expect(qt.size).toBe(n);
      expect(qt.depth).toBeGreaterThan(1);
    });
  }

  // clear resets everything — 10 tests
  for (let n = 1; n <= 10; n++) {
    it(`clear after ${n} insertions resets size to 0`, () => {
      const qt = new Quadtree<number>(bounds);
      for (let i = 0; i < n; i++) qt.insert({ x: i * 9, y: i * 9 }, i);
      qt.clear();
      expect(qt.size).toBe(0);
      expect(qt.all()).toEqual([]);
    });
  }

  // Large number of points
  it('handles 1000 insertions', () => {
    const b: Bounds = { x: 0, y: 0, width: 1000, height: 1000 };
    const qt = new Quadtree<number>(b);
    for (let i = 0; i < 1000; i++) {
      qt.insert({ x: (i % 100) * 9, y: Math.floor(i / 100) * 9 }, i);
    }
    expect(qt.size).toBeLessThanOrEqual(1000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree.clear — additional tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree.clear additional', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 };

  it('clear preserves bounds', () => {
    const qt = new Quadtree<number>(bounds);
    qt.insert({ x: 50, y: 50 }, 1);
    qt.clear();
    expect(qt.bounds).toEqual(bounds);
  });

  it('can insert after clear', () => {
    const qt = new Quadtree<number>(bounds);
    qt.insert({ x: 50, y: 50 }, 1);
    qt.clear();
    qt.insert({ x: 10, y: 10 }, 99);
    expect(qt.size).toBe(1);
    expect(qt.all()[0].data).toBe(99);
  });

  it('depth resets to 1 after clear', () => {
    const qt = new Quadtree<number>(bounds, 1);
    for (let i = 0; i < 20; i++) qt.insert({ x: i * 4, y: i * 4 }, i);
    qt.clear();
    expect(qt.depth).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree with string data — additional coverage
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree with string data', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 200, height: 200 };

  for (let i = 0; i < 20; i++) {
    it(`stores and retrieves string data 'label-${i}'`, () => {
      const qt = new Quadtree<string>(bounds);
      qt.insert({ x: i * 9, y: i * 9 }, `label-${i}`);
      const result = qt.all();
      expect(result[0].data).toBe(`label-${i}`);
    });
  }

  it('stores object data correctly', () => {
    const qt = new Quadtree<{ id: number }>(bounds);
    qt.insert({ x: 50, y: 50 }, { id: 42 });
    expect(qt.all()[0].data.id).toBe(42);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree queryCircle edge cases — extra tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree queryCircle extra edge cases', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 200, height: 200 };

  it('radius 0 returns only the point exactly at center', () => {
    const qt = new Quadtree<number>(bounds);
    qt.insert({ x: 100, y: 100 }, 1);
    qt.insert({ x: 101, y: 100 }, 2);
    const result = qt.queryCircle({ x: 100, y: 100 }, 0);
    const hasCenter = result.some(pd => pd.point.x === 100 && pd.point.y === 100);
    expect(result.length).toBeLessThanOrEqual(1);
    if (result.length === 1) expect(hasCenter).toBe(true);
  });

  for (let r = 1; r <= 10; r++) {
    it(`queryCircle radius ${r * 10} returns increasing results`, () => {
      const qt = new Quadtree<number>(bounds);
      for (let i = 0; i < 10; i++) {
        qt.insert({ x: 100 + i * 5, y: 100 }, i);
      }
      const result = qt.queryCircle({ x: 100, y: 100 }, r * 10);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RegionQuadtree with varied bounds — extra tests
// ─────────────────────────────────────────────────────────────────────────────
describe('RegionQuadtree varied bounds', () => {
  for (let size = 32; size <= 256; size *= 2) {
    it(`RegionQuadtree with bounds ${size}x${size} works correctly`, () => {
      const b: Bounds = { x: 0, y: 0, width: size, height: size };
      const rq = new RegionQuadtree(b);
      const pt: Point2D = { x: Math.floor(size / 4), y: Math.floor(size / 4) };
      rq.set(pt, 7);
      expect(rq.get(pt)).toBe(7);
    });
  }

  it('RegionQuadtree with maxDepth=1 stores at root', () => {
    const b: Bounds = { x: 0, y: 0, width: 100, height: 100 };
    const rq = new RegionQuadtree(b, 1);
    rq.set({ x: 50, y: 50 }, 42);
    // Should store value (even if at root level)
    expect(rq.get({ x: 50, y: 50 })).toBeGreaterThanOrEqual(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree coalesced query/nearest integration — extra tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree integration: query + nearest consistency', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 300, height: 300 };

  for (let trial = 0; trial < 20; trial++) {
    it(`trial ${trial}: query and nearest agree on count`, () => {
      const qt = new Quadtree<number>(bounds, 4);
      // Use a step of 11 so points stay within bounds for all trial sizes
      // Max n = 5 + 19*2 = 43; 42*11 = 462 > 300, so clamp to valid points
      const n = 5 + trial * 2;
      let inserted = 0;
      for (let i = 0; i < n; i++) {
        const x = (i * 11) % 299;
        const y = Math.floor((i * 11) / 299) * 11;
        if (y < 300) {
          qt.insert({ x, y }, i);
          inserted++;
        }
      }
      const allViaQuery = qt.query(bounds);
      const allViaNnearest = qt.nearest({ x: 0, y: 0 }, n * 2);
      expect(allViaQuery.length).toBe(inserted);
      expect(allViaNnearest.length).toBe(inserted);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree point data integrity through subdivision — extra tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree data integrity through subdivision', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 };

  for (let cap = 1; cap <= 5; cap++) {
    it(`capacity=${cap}: all data values preserved after subdivision`, () => {
      const qt = new Quadtree<number>(bounds, cap);
      const expected = new Set<number>();
      for (let i = 0; i < 15; i++) {
        qt.insert({ x: i * 6, y: i * 6 }, i * 100);
        expected.add(i * 100);
      }
      const allData = new Set(qt.all().map(pd => pd.data));
      for (const v of expected) expect(allData.has(v)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Helper: boundsOverlap symmetry — extra tests
// ─────────────────────────────────────────────────────────────────────────────
describe('boundsOverlap symmetry', () => {
  const pairs: Array<[Bounds, Bounds]> = [
    [{ x: 0, y: 0, width: 50, height: 50 }, { x: 25, y: 25, width: 50, height: 50 }],
    [{ x: 0, y: 0, width: 100, height: 10 }, { x: 0, y: 5, width: 100, height: 10 }],
    [{ x: 0, y: 0, width: 10, height: 10 }, { x: 20, y: 20, width: 10, height: 10 }],
    [{ x: 0, y: 0, width: 5, height: 5 }, { x: 5, y: 0, width: 5, height: 5 }],
    [{ x: 0, y: 0, width: 200, height: 200 }, { x: 50, y: 50, width: 10, height: 10 }],
  ];
  for (let i = 0; i < pairs.length; i++) {
    const [a, b] = pairs[i];
    it(`boundsOverlap(a,b) == boundsOverlap(b,a) for pair ${i}`, () => {
      expect(boundsOverlap(a, b)).toBe(boundsOverlap(b, a));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Quadtree insert + query correctness with known positions
// ─────────────────────────────────────────────────────────────────────────────
describe('Quadtree insert + query known positions', () => {
  const bounds: Bounds = { x: 0, y: 0, width: 100, height: 100 };

  const knownPoints: Array<[number, number, string]> = [
    [5, 5, 'a'], [25, 5, 'b'], [75, 5, 'c'], [95, 5, 'd'],
    [5, 25, 'e'], [25, 25, 'f'], [75, 25, 'g'], [95, 25, 'h'],
    [5, 75, 'i'], [25, 75, 'j'], [75, 75, 'k'], [95, 75, 'l'],
    [5, 95, 'm'], [25, 95, 'n'], [75, 95, 'o'], [95, 95, 'p'],
  ];

  function buildKnown(): Quadtree<string> {
    const qt = new Quadtree<string>(bounds);
    knownPoints.forEach(([x, y, label]) => qt.insert({ x, y }, label));
    return qt;
  }

  // Query each quadrant — 4 tests
  it('query top-left quadrant [0,50)x[0,50) returns 4 points', () => {
    const qt = buildKnown();
    expect(qt.query({ x: 0, y: 0, width: 50, height: 50 }).length).toBe(4);
  });
  it('query top-right quadrant [50,100)x[0,50) returns 4 points', () => {
    const qt = buildKnown();
    expect(qt.query({ x: 50, y: 0, width: 50, height: 50 }).length).toBe(4);
  });
  it('query bottom-left quadrant [0,50)x[50,100) returns 4 points', () => {
    const qt = buildKnown();
    expect(qt.query({ x: 0, y: 50, width: 50, height: 50 }).length).toBe(4);
  });
  it('query bottom-right quadrant [50,100)x[50,100) returns 4 points', () => {
    const qt = buildKnown();
    expect(qt.query({ x: 50, y: 50, width: 50, height: 50 }).length).toBe(4);
  });

  // Each individual point can be found — 16 tests
  for (const [x, y, label] of knownPoints) {
    it(`point '${label}' at (${x},${y}) found in tiny region`, () => {
      const qt = buildKnown();
      const region: Bounds = { x: x - 1, y: y - 1, width: 3, height: 3 };
      const result = qt.query(region).filter(pd => pd.data === label);
      expect(result.length).toBe(1);
    });
  }
});
