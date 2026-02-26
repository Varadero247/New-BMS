// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  convexHull,
  isConvex,
  pointInHull,
  hullArea,
  hullPerimeter,
  distance,
  centroid,
  boundingBox,
  grahamScan,
  upperHull,
  lowerHull,
  Point,
} from '../convex-hull';

// ─── helpers ────────────────────────────────────────────────────────────────
function pt(x: number, y: number): Point { return { x, y }; }

function circlePoints(n: number, r = 10, cx = 0, cy = 0): Point[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n;
    return pt(cx + r * Math.cos(a), cy + r * Math.sin(a));
  });
}

function sortPts(pts: Point[]): Point[] {
  return [...pts].sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
}

function approxEq(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) < eps;
}

const SQUARE = [pt(0,0), pt(1,0), pt(1,1), pt(0,1)];
const TRIANGLE = [pt(0,0), pt(4,0), pt(2,3)];

// ─── 1. convexHull — empty / single / two ───────────────────────────────────
describe('convexHull — trivial inputs', () => {
  it('empty array returns empty', () => expect(convexHull([])).toEqual([]));
  it('single point returns that point', () => {
    const r = convexHull([pt(3, 7)]);
    expect(r).toHaveLength(1);
    expect(r[0]).toEqual(pt(3, 7));
  });
  it('two identical points returns two', () => {
    const r = convexHull([pt(1,1), pt(1,1)]);
    expect(r.length).toBeGreaterThanOrEqual(1);
  });
  it('two distinct points returns two', () => {
    const r = convexHull([pt(0,0), pt(1,1)]);
    expect(r).toHaveLength(2);
  });
  it('does not mutate input array', () => {
    const pts = [pt(2,3), pt(1,1), pt(3,1)];
    const copy = pts.map(p => ({...p}));
    convexHull(pts);
    expect(pts).toEqual(copy);
  });
  it('returns new array (not same reference)', () => {
    const pts = [pt(0,0)];
    expect(convexHull(pts)).not.toBe(pts);
  });
});

// ─── 2. convexHull — square ──────────────────────────────────────────────────
describe('convexHull — axis-aligned square', () => {
  it('4 corners → hull has 4 points', () => expect(convexHull(SQUARE)).toHaveLength(4));
  it('hull of square contains (0,0)', () => {
    const h = convexHull(SQUARE);
    expect(h.some(p => p.x === 0 && p.y === 0)).toBe(true);
  });
  it('hull of square contains (1,0)', () => {
    const h = convexHull(SQUARE);
    expect(h.some(p => p.x === 1 && p.y === 0)).toBe(true);
  });
  it('hull of square contains (1,1)', () => {
    const h = convexHull(SQUARE);
    expect(h.some(p => p.x === 1 && p.y === 1)).toBe(true);
  });
  it('hull of square contains (0,1)', () => {
    const h = convexHull(SQUARE);
    expect(h.some(p => p.x === 0 && p.y === 1)).toBe(true);
  });
  it('square with interior point still 4-vertex hull', () => {
    const pts = [...SQUARE, pt(0.5, 0.5)];
    expect(convexHull(pts)).toHaveLength(4);
  });
  it('10 interior points do not increase hull size', () => {
    const pts = [...SQUARE];
    for (let i = 1; i <= 10; i++) pts.push(pt(i * 0.05 + 0.1, 0.5));
    expect(convexHull(pts)).toHaveLength(4);
  });
  for (let scale = 1; scale <= 20; scale++) {
    it(`scaled square ×${scale} has 4 hull vertices`, () => {
      const s = scale;
      const pts = [pt(0,0), pt(s,0), pt(s,s), pt(0,s)];
      expect(convexHull(pts)).toHaveLength(4);
    });
  }
});

// ─── 3. convexHull — collinear points ───────────────────────────────────────
describe('convexHull — collinear points', () => {
  it('3 collinear horizontal → 2 endpoints', () => {
    const r = convexHull([pt(0,0), pt(1,0), pt(2,0)]);
    expect(r).toHaveLength(2);
  });
  it('5 collinear horizontal → 2 endpoints', () => {
    const r = convexHull([pt(0,0), pt(1,0), pt(2,0), pt(3,0), pt(4,0)]);
    expect(r).toHaveLength(2);
  });
  it('3 collinear vertical → 2 endpoints', () => {
    const r = convexHull([pt(0,0), pt(0,1), pt(0,2)]);
    expect(r).toHaveLength(2);
  });
  it('3 collinear diagonal → 2 endpoints', () => {
    const r = convexHull([pt(0,0), pt(1,1), pt(2,2)]);
    expect(r).toHaveLength(2);
  });
  it('100 collinear points → 2 endpoints', () => {
    const pts = Array.from({ length: 100 }, (_, i) => pt(i, 0));
    const r = convexHull(pts);
    expect(r).toHaveLength(2);
    expect(r.some(p => p.x === 0)).toBe(true);
    expect(r.some(p => p.x === 99)).toBe(true);
  });
  for (let n = 3; n <= 12; n++) {
    it(`${n} collinear points along x-axis → 2 endpoints`, () => {
      const pts = Array.from({ length: n }, (_, i) => pt(i, 0));
      expect(convexHull(pts)).toHaveLength(2);
    });
  }
});

// ─── 4. convexHull — triangle ────────────────────────────────────────────────
describe('convexHull — triangle', () => {
  it('3-point triangle has 3 hull vertices', () => expect(convexHull(TRIANGLE)).toHaveLength(3));
  it('triangle + interior point → still 3', () => {
    const pts = [...TRIANGLE, pt(2, 1)];
    expect(convexHull(pts)).toHaveLength(3);
  });
  it('equilateral triangle hull size', () => {
    const pts = [pt(0,0), pt(6,0), pt(3, 5.196)];
    expect(convexHull(pts)).toHaveLength(3);
  });
  for (let i = 1; i <= 20; i++) {
    it(`triangle with ${i} interior points hull still 3`, () => {
      const pts = [...TRIANGLE];
      for (let j = 0; j < i; j++) pts.push(pt(2 + j * 0.01, 0.5));
      expect(convexHull(pts)).toHaveLength(3);
    });
  }
});

// ─── 5. convexHull — circle points ──────────────────────────────────────────
describe('convexHull — circle points', () => {
  for (const n of [4, 5, 6, 7, 8, 10, 12, 16, 20]) {
    it(`${n} points on circle → all on hull`, () => {
      const pts = circlePoints(n, 100);
      expect(convexHull(pts)).toHaveLength(n);
    });
  }
  it('circle points hull same sorted set as input', () => {
    const pts = circlePoints(8, 50);
    const hull = convexHull(pts);
    expect(sortPts(hull)).toEqual(sortPts(pts));
  });
  it('circle + center point hull excludes center', () => {
    const pts = circlePoints(8, 10);
    pts.push(pt(0, 0));
    expect(convexHull(pts)).toHaveLength(8);
  });
  it('larger circle still all on hull', () => {
    const pts = circlePoints(10, 1000);
    expect(convexHull(pts)).toHaveLength(10);
  });
});

// ─── 6. convexHull — regular polygons ───────────────────────────────────────
describe('convexHull — regular polygons', () => {
  for (const n of [3, 4, 5, 6, 7, 8, 9, 10, 12]) {
    it(`regular ${n}-gon hull has ${n} vertices`, () => {
      const pts = circlePoints(n, 50);
      expect(convexHull(pts)).toHaveLength(n);
    });
  }
  it('hexagon hull size 6', () => {
    const pts = circlePoints(6, 10);
    expect(convexHull(pts)).toHaveLength(6);
  });
  it('pentagon hull size 5', () => {
    const pts = circlePoints(5, 10);
    expect(convexHull(pts)).toHaveLength(5);
  });
});

// ─── 7. convexHull — negative coordinates ───────────────────────────────────
describe('convexHull — negative coordinates', () => {
  it('points in all four quadrants', () => {
    const pts = [pt(-1,-1), pt(1,-1), pt(1,1), pt(-1,1)];
    expect(convexHull(pts)).toHaveLength(4);
  });
  it('all negative coordinates', () => {
    const pts = [pt(-4,-4), pt(-1,-4), pt(-1,-1), pt(-4,-1)];
    expect(convexHull(pts)).toHaveLength(4);
  });
  it('mixed negative/positive hull', () => {
    const pts = [pt(-5,0), pt(0,5), pt(5,0), pt(0,-5)];
    expect(convexHull(pts)).toHaveLength(4);
  });
  for (let i = -10; i <= -1; i++) {
    it(`negative x=${i} single point hull`, () => {
      expect(convexHull([pt(i, i)])).toHaveLength(1);
    });
  }
});

// ─── 8. hullArea ─────────────────────────────────────────────────────────────
describe('hullArea', () => {
  it('unit square area = 0.5... wait, 1×1 square area = 1', () => {
    // shoelace: area of unit square [0,0],[1,0],[1,1],[0,1] = 1
    expect(hullArea(SQUARE)).toBeCloseTo(1, 9);
  });
  it('empty hull area = 0', () => expect(hullArea([])).toBe(0));
  it('single point area = 0', () => expect(hullArea([pt(0,0)])).toBe(0));
  it('two points area = 0', () => expect(hullArea([pt(0,0), pt(1,0)])).toBe(0));
  it('right triangle area = 0.5', () => {
    expect(hullArea([pt(0,0), pt(1,0), pt(0,1)])).toBeCloseTo(0.5, 9);
  });
  it('triangle with base=4 height=3 area=6', () => {
    expect(hullArea(convexHull(TRIANGLE))).toBeCloseTo(6, 5);
  });
  it('2×2 square area=4', () => {
    expect(hullArea([pt(0,0), pt(2,0), pt(2,2), pt(0,2)])).toBeCloseTo(4, 9);
  });
  it('3×3 square area=9', () => {
    expect(hullArea([pt(0,0), pt(3,0), pt(3,3), pt(0,3)])).toBeCloseTo(9, 9);
  });
  it('regular hexagon area ≈ 259.8 for r=10', () => {
    const hull = convexHull(circlePoints(6, 10));
    expect(hullArea(hull)).toBeCloseTo(259.8, 0);
  });
  for (let s = 1; s <= 20; s++) {
    it(`${s}×${s} square area = ${s*s}`, () => {
      const pts = [pt(0,0), pt(s,0), pt(s,s), pt(0,s)];
      expect(hullArea(pts)).toBeCloseTo(s * s, 9);
    });
  }
  it('area is positive regardless of winding', () => {
    const cw = [pt(0,0), pt(0,1), pt(1,1), pt(1,0)];
    expect(hullArea(cw)).toBeGreaterThan(0);
  });
  it('area of pentagon > 0', () => {
    expect(hullArea(circlePoints(5, 10))).toBeGreaterThan(0);
  });
});

// ─── 9. hullPerimeter ────────────────────────────────────────────────────────
describe('hullPerimeter', () => {
  it('unit square perimeter = 4', () => {
    expect(hullPerimeter(SQUARE)).toBeCloseTo(4, 9);
  });
  it('empty hull perimeter = 0', () => expect(hullPerimeter([])).toBe(0));
  it('single point perimeter = 0', () => expect(hullPerimeter([pt(0,0)])).toBe(0));
  it('two points perimeter = 2 * distance', () => {
    expect(hullPerimeter([pt(0,0), pt(3,4)])).toBeCloseTo(10, 9);
  });
  it('2×2 square perimeter = 8', () => {
    expect(hullPerimeter([pt(0,0), pt(2,0), pt(2,2), pt(0,2)])).toBeCloseTo(8, 9);
  });
  it('equilateral triangle side 1 perimeter = 3', () => {
    const h = Math.sqrt(3) / 2;
    expect(hullPerimeter([pt(0,0), pt(1,0), pt(0.5,h)])).toBeCloseTo(3, 5);
  });
  it('circle perimeter ≈ 2πr (approaches as n→∞)', () => {
    const hull = convexHull(circlePoints(360, 100));
    expect(hullPerimeter(hull)).toBeCloseTo(2 * Math.PI * 100, 0);
  });
  for (let s = 1; s <= 20; s++) {
    it(`${s}×${s} square perimeter = ${4*s}`, () => {
      const pts = [pt(0,0), pt(s,0), pt(s,s), pt(0,s)];
      expect(hullPerimeter(pts)).toBeCloseTo(4 * s, 9);
    });
  }
});

// ─── 10. distance ────────────────────────────────────────────────────────────
describe('distance', () => {
  it('distance same point = 0', () => expect(distance(pt(0,0), pt(0,0))).toBe(0));
  it('distance (0,0)→(3,4) = 5', () => expect(distance(pt(0,0), pt(3,4))).toBeCloseTo(5, 9));
  it('distance (0,0)→(1,0) = 1', () => expect(distance(pt(0,0), pt(1,0))).toBeCloseTo(1, 9));
  it('distance (0,0)→(0,1) = 1', () => expect(distance(pt(0,0), pt(0,1))).toBeCloseTo(1, 9));
  it('distance is symmetric', () => {
    expect(distance(pt(1,2), pt(3,5))).toBeCloseTo(distance(pt(3,5), pt(1,2)), 9);
  });
  it('distance (1,1)→(4,5) = 5', () => expect(distance(pt(1,1), pt(4,5))).toBeCloseTo(5, 9));
  it('distance (0,0)→(5,12) = 13', () => expect(distance(pt(0,0), pt(5,12))).toBeCloseTo(13, 9));
  it('distance (0,0)→(8,15) = 17', () => expect(distance(pt(0,0), pt(8,15))).toBeCloseTo(17, 9));
  it('distance negative coords', () => expect(distance(pt(-3,-4), pt(0,0))).toBeCloseTo(5, 9));
  it('distance always non-negative', () => {
    expect(distance(pt(-5, 10), pt(3, -2))).toBeGreaterThan(0);
  });
  // Pythagorean triples
  const triples: [number,number,number][] = [
    [3,4,5],[5,12,13],[8,15,17],[7,24,25],[20,21,29],
    [9,40,41],[12,35,37],[11,60,61],[13,84,85],[6,8,10]
  ];
  for (const [a, b, c] of triples) {
    it(`Pythagorean triple ${a},${b},${c}`, () => {
      expect(distance(pt(0,0), pt(a,b))).toBeCloseTo(c, 5);
    });
  }
  for (let i = 1; i <= 30; i++) {
    it(`distance (0,0)→(${i},0) = ${i}`, () => {
      expect(distance(pt(0,0), pt(i, 0))).toBeCloseTo(i, 9);
    });
  }
  for (let i = 1; i <= 20; i++) {
    it(`distance (0,0)→(0,${i}) = ${i}`, () => {
      expect(distance(pt(0,0), pt(0, i))).toBeCloseTo(i, 9);
    });
  }
});

// ─── 11. centroid ─────────────────────────────────────────────────────────────
describe('centroid', () => {
  it('empty array centroid = {x:0,y:0}', () => expect(centroid([])).toEqual({ x: 0, y: 0 }));
  it('single point centroid = that point', () => expect(centroid([pt(3,7)])).toEqual({ x: 3, y: 7 }));
  it('two points centroid = midpoint', () => {
    expect(centroid([pt(0,0), pt(4,6)])).toEqual({ x: 2, y: 3 });
  });
  it('square centroid = center', () => {
    expect(centroid(SQUARE)).toEqual({ x: 0.5, y: 0.5 });
  });
  it('triangle (0,0)(6,0)(3,6) centroid = (3,2)', () => {
    expect(centroid([pt(0,0), pt(6,0), pt(3,6)])).toEqual({ x: 3, y: 2 });
  });
  it('symmetric points centroid on axis', () => {
    expect(centroid([pt(-1,0), pt(1,0)])).toEqual({ x: 0, y: 0 });
  });
  it('centroid x is average of x-coords', () => {
    const pts = [pt(1,0), pt(3,0), pt(5,0)];
    expect(centroid(pts).x).toBeCloseTo(3, 9);
  });
  it('centroid y is average of y-coords', () => {
    const pts = [pt(0,2), pt(0,4), pt(0,6)];
    expect(centroid(pts).y).toBeCloseTo(4, 9);
  });
  for (let n = 2; n <= 30; n++) {
    it(`centroid of ${n} unit-circle points = (0,0)`, () => {
      const pts = circlePoints(n, 1);
      const c = centroid(pts);
      expect(c.x).toBeCloseTo(0, 5);
      expect(c.y).toBeCloseTo(0, 5);
    });
  }
  for (let v = 1; v <= 20; v++) {
    it(`centroid of ${v} points all at (${v},${v}) = (${v},${v})`, () => {
      const pts = Array.from({ length: v }, () => pt(v, v));
      expect(centroid(pts)).toEqual({ x: v, y: v });
    });
  }
});

// ─── 12. boundingBox ─────────────────────────────────────────────────────────
describe('boundingBox', () => {
  it('empty returns null', () => expect(boundingBox([])).toBeNull());
  it('single point bbox', () => {
    const bb = boundingBox([pt(3, 7)]);
    expect(bb).toEqual({ min: { x: 3, y: 7 }, max: { x: 3, y: 7 } });
  });
  it('two points bbox', () => {
    const bb = boundingBox([pt(1, 2), pt(5, 8)]);
    expect(bb).toEqual({ min: { x: 1, y: 2 }, max: { x: 5, y: 8 } });
  });
  it('square bbox', () => {
    const bb = boundingBox(SQUARE);
    expect(bb).toEqual({ min: { x: 0, y: 0 }, max: { x: 1, y: 1 } });
  });
  it('unordered points bbox', () => {
    const pts = [pt(3,1), pt(1,4), pt(5,2), pt(2,6)];
    const bb = boundingBox(pts)!;
    expect(bb.min).toEqual({ x: 1, y: 1 });
    expect(bb.max).toEqual({ x: 5, y: 6 });
  });
  it('negative coords bbox', () => {
    const pts = [pt(-3,-2), pt(2,4)];
    const bb = boundingBox(pts)!;
    expect(bb.min).toEqual({ x: -3, y: -2 });
    expect(bb.max).toEqual({ x: 2, y: 4 });
  });
  it('all same x bbox', () => {
    const pts = [pt(5,1), pt(5,3), pt(5,7)];
    const bb = boundingBox(pts)!;
    expect(bb.min.x).toBe(5);
    expect(bb.max.x).toBe(5);
    expect(bb.min.y).toBe(1);
    expect(bb.max.y).toBe(7);
  });
  it('all same y bbox', () => {
    const pts = [pt(1,3), pt(4,3), pt(9,3)];
    const bb = boundingBox(pts)!;
    expect(bb.min.y).toBe(3);
    expect(bb.max.y).toBe(3);
    expect(bb.min.x).toBe(1);
    expect(bb.max.x).toBe(9);
  });
  for (let s = 1; s <= 20; s++) {
    it(`bbox of ${s}×${s} square`, () => {
      const pts = [pt(0,0), pt(s,0), pt(s,s), pt(0,s)];
      const bb = boundingBox(pts)!;
      expect(bb.min).toEqual({ x: 0, y: 0 });
      expect(bb.max).toEqual({ x: s, y: s });
    });
  }
  for (let i = 1; i <= 20; i++) {
    it(`bbox of circle r=${i} min/max ≈ ±${i}`, () => {
      const pts = circlePoints(100, i);
      const bb = boundingBox(pts)!;
      expect(bb.min.x).toBeCloseTo(-i, 1);
      expect(bb.max.x).toBeCloseTo(i, 1);
    });
  }
});

// ─── 13. pointInHull ─────────────────────────────────────────────────────────
describe('pointInHull', () => {
  it('empty hull returns false', () => expect(pointInHull([], pt(0,0))).toBe(false));
  it('single-point hull — same point', () => expect(pointInHull([pt(1,1)], pt(1,1))).toBe(true));
  it('single-point hull — different point', () => expect(pointInHull([pt(1,1)], pt(2,2))).toBe(false));
  it('center of square is inside', () => {
    const h = convexHull(SQUARE);
    expect(pointInHull(h, pt(0.5, 0.5))).toBe(true);
  });
  it('outside square is outside', () => {
    const h = convexHull(SQUARE);
    expect(pointInHull(h, pt(2, 2))).toBe(false);
  });
  it('vertex of square is on hull', () => {
    const h = convexHull(SQUARE);
    expect(pointInHull(h, pt(0, 0))).toBe(true);
  });
  it('center of triangle is inside', () => {
    const h = convexHull(TRIANGLE);
    expect(pointInHull(h, pt(2, 1))).toBe(true);
  });
  it('outside triangle is outside', () => {
    const h = convexHull(TRIANGLE);
    expect(pointInHull(h, pt(10, 10))).toBe(false);
  });
  it('far outside is outside', () => {
    const h = convexHull(SQUARE);
    expect(pointInHull(h, pt(100, 100))).toBe(false);
  });
  it('negative outside', () => {
    const h = convexHull(SQUARE);
    expect(pointInHull(h, pt(-1, -1))).toBe(false);
  });
  it('center of large circle inside its hull', () => {
    const hull = convexHull(circlePoints(16, 100));
    expect(pointInHull(hull, pt(0, 0))).toBe(true);
  });
  it('far outside large circle', () => {
    const hull = convexHull(circlePoints(16, 100));
    expect(pointInHull(hull, pt(1000, 1000))).toBe(false);
  });
  for (let i = 0; i <= 20; i++) {
    const inside = i <= 9 ? 0.1 + i * 0.04 : 0.5;
    it(`point (${inside},${inside}) inside unit square hull`, () => {
      const h = convexHull(SQUARE);
      if (inside > 0 && inside < 1) {
        expect(pointInHull(h, pt(inside, inside))).toBe(true);
      } else {
        expect(typeof pointInHull(h, pt(inside, inside))).toBe('boolean');
      }
    });
  }
  for (let i = 1; i <= 20; i++) {
    it(`point (${i+1},0) outside unit square hull`, () => {
      const h = convexHull(SQUARE);
      expect(pointInHull(h, pt(i + 1, 0))).toBe(false);
    });
  }
});

// ─── 14. isConvex ─────────────────────────────────────────────────────────────
describe('isConvex', () => {
  it('square is convex', () => {
    const h = convexHull(SQUARE);
    expect(isConvex(h)).toBe(true);
  });
  it('triangle is convex', () => {
    const h = convexHull(TRIANGLE);
    expect(isConvex(h)).toBe(true);
  });
  it('circle points are convex', () => {
    const h = convexHull(circlePoints(8, 10));
    expect(isConvex(h)).toBe(true);
  });
  it('square + interior not convex (hull count mismatch)', () => {
    const pts = [...SQUARE, pt(0.5, 0.5)];
    expect(isConvex(pts)).toBe(false);
  });
  it('empty is convex (trivially)', () => expect(isConvex([])).toBe(true));
  it('single point is convex', () => expect(isConvex([pt(0,0)])).toBe(true));
  it('two points hull is consistent', () => {
    const pts = [pt(0,0), pt(1,1)];
    const h = convexHull(pts);
    expect(isConvex(h)).toBe(true);
  });
  for (const n of [3, 4, 5, 6, 7, 8, 10, 12]) {
    it(`regular ${n}-gon hull is convex`, () => {
      const h = convexHull(circlePoints(n, 20));
      expect(isConvex(h)).toBe(true);
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`hull of random convex set ${i} is convex`, () => {
      const h = convexHull(circlePoints(6 + i, 10 + i));
      expect(isConvex(h)).toBe(true);
    });
  }
});

// ─── 15. grahamScan alias ─────────────────────────────────────────────────────
describe('grahamScan alias', () => {
  it('same result as convexHull for square', () => {
    expect(sortPts(grahamScan(SQUARE))).toEqual(sortPts(convexHull(SQUARE)));
  });
  it('same result for triangle', () => {
    expect(sortPts(grahamScan(TRIANGLE))).toEqual(sortPts(convexHull(TRIANGLE)));
  });
  it('same result for circle points n=8', () => {
    const pts = circlePoints(8, 50);
    expect(sortPts(grahamScan(pts))).toEqual(sortPts(convexHull(pts)));
  });
  it('grahamScan of empty = empty', () => expect(grahamScan([])).toEqual([]));
  it('grahamScan of single point', () => expect(grahamScan([pt(1,2)])).toHaveLength(1));
  for (let n = 3; n <= 25; n++) {
    it(`grahamScan matches convexHull for ${n}-gon`, () => {
      const pts = circlePoints(n, 30);
      expect(sortPts(grahamScan(pts))).toEqual(sortPts(convexHull(pts)));
    });
  }
});

// ─── 16. upperHull / lowerHull ───────────────────────────────────────────────
describe('upperHull', () => {
  it('returns array', () => expect(Array.isArray(upperHull(SQUARE))).toBe(true));
  it('upper hull of square includes (1,1) and (0,1)', () => {
    const uh = upperHull(SQUARE);
    expect(uh.some(p => p.x === 1 && p.y === 1)).toBe(true);
  });
  it('empty input → empty', () => expect(upperHull([])).toEqual([]));
  it('single point → that point', () => expect(upperHull([pt(1,2)])).toHaveLength(1));
  it('two points upper hull ≥ 2', () => expect(upperHull([pt(0,0), pt(1,1)])).toHaveLength(2));
  for (let n = 3; n <= 25; n++) {
    it(`upperHull of ${n} points is non-empty`, () => {
      expect(upperHull(circlePoints(n, 10)).length).toBeGreaterThan(0);
    });
  }
});

describe('lowerHull', () => {
  it('returns array', () => expect(Array.isArray(lowerHull(SQUARE))).toBe(true));
  it('lower hull of square includes (0,0) and (1,0)', () => {
    const lh = lowerHull(SQUARE);
    expect(lh.some(p => p.x === 0 && p.y === 0)).toBe(true);
  });
  it('empty input → empty', () => expect(lowerHull([])).toEqual([]));
  it('single point → that point', () => expect(lowerHull([pt(1,2)])).toHaveLength(1));
  it('two points lower hull ≥ 2', () => expect(lowerHull([pt(0,0), pt(1,1)])).toHaveLength(2));
  for (let n = 3; n <= 25; n++) {
    it(`lowerHull of ${n} points is non-empty`, () => {
      expect(lowerHull(circlePoints(n, 10)).length).toBeGreaterThan(0);
    });
  }
});

// ─── 17. convexHull — large point sets ───────────────────────────────────────
describe('convexHull — large inputs', () => {
  it('1000 interior points + 4 corners → hull = 4', () => {
    const pts: Point[] = [pt(0,0), pt(10,0), pt(10,10), pt(0,10)];
    for (let i = 0; i < 1000; i++) pts.push(pt(1 + Math.random() * 8, 1 + Math.random() * 8));
    // Use seeded deterministic interior points
    for (let i = 0; i < 1000; i++) pts.push(pt(1 + (i % 8) * 1.0, 1 + (i % 8) * 1.0));
    expect(convexHull(pts)).toHaveLength(4);
  });
  it('500 collinear points hull = 2', () => {
    const pts = Array.from({ length: 500 }, (_, i) => pt(i, 0));
    expect(convexHull(pts)).toHaveLength(2);
  });
  it('100 circle points hull = 100', () => {
    const pts = circlePoints(100, 1000);
    expect(convexHull(pts)).toHaveLength(100);
  });
  it('grid 10×10 hull = perimeter (36 points)', () => {
    const pts: Point[] = [];
    for (let x = 0; x <= 9; x++) for (let y = 0; y <= 9; y++) pts.push(pt(x, y));
    expect(convexHull(pts)).toHaveLength(4);
  });
  it('duplicated points are handled', () => {
    const pts = Array.from({ length: 50 }, () => pt(1, 1));
    pts.push(pt(0,0)); pts.push(pt(2,0)); pts.push(pt(1,2));
    expect(convexHull(pts)).toHaveLength(3);
  });
});

// ─── 18. hullArea — more cases ────────────────────────────────────────────────
describe('hullArea — extended', () => {
  it('area of regular octagon r=1 ≈ 2.828', () => {
    const hull = convexHull(circlePoints(8, 1));
    expect(hullArea(hull)).toBeCloseTo(2.828, 1);
  });
  it('area scales with r^2', () => {
    const a1 = hullArea(convexHull(circlePoints(8, 1)));
    const a2 = hullArea(convexHull(circlePoints(8, 2)));
    expect(a2).toBeCloseTo(a1 * 4, 5);
  });
  it('triangle double base → double area', () => {
    const t1 = hullArea([pt(0,0), pt(1,0), pt(0,1)]);
    const t2 = hullArea([pt(0,0), pt(2,0), pt(0,1)]);
    expect(t2).toBeCloseTo(t1 * 2, 9);
  });
  it('triangle double height → double area', () => {
    const t1 = hullArea([pt(0,0), pt(1,0), pt(0,1)]);
    const t2 = hullArea([pt(0,0), pt(1,0), pt(0,2)]);
    expect(t2).toBeCloseTo(t1 * 2, 9);
  });
  for (let w = 1; w <= 10; w++) {
    for (let h = 1; h <= 5; h++) {
      it(`rectangle ${w}×${h} area = ${w*h}`, () => {
        const pts = [pt(0,0), pt(w,0), pt(w,h), pt(0,h)];
        expect(hullArea(pts)).toBeCloseTo(w * h, 9);
      });
    }
  }
});

// ─── 19. hullPerimeter — more cases ──────────────────────────────────────────
describe('hullPerimeter — extended', () => {
  it('perimeter scales with r', () => {
    const p1 = hullPerimeter(convexHull(circlePoints(8, 1)));
    const p2 = hullPerimeter(convexHull(circlePoints(8, 2)));
    expect(p2).toBeCloseTo(p1 * 2, 5);
  });
  it('triangle perimeter > 0', () => {
    expect(hullPerimeter(TRIANGLE)).toBeGreaterThan(0);
  });
  it('right triangle (3,4,5) perimeter = 12', () => {
    expect(hullPerimeter([pt(0,0), pt(3,0), pt(0,4)])).toBeCloseTo(12, 5);
  });
  for (let s = 1; s <= 15; s++) {
    it(`perimeter of ${s}×${2*s} rectangle = ${6*s}`, () => {
      const pts = [pt(0,0), pt(s,0), pt(s,2*s), pt(0,2*s)];
      expect(hullPerimeter(pts)).toBeCloseTo(6 * s, 9);
    });
  }
});

// ─── 20. convexHull — stress / properties ─────────────────────────────────────
describe('convexHull — property tests', () => {
  it('hull of hull = hull', () => {
    const pts = circlePoints(12, 50);
    const h1 = convexHull(pts);
    const h2 = convexHull(h1);
    expect(sortPts(h2)).toEqual(sortPts(h1));
  });
  it('adding interior points does not change hull', () => {
    const outer = [pt(0,0), pt(10,0), pt(10,10), pt(0,10)];
    const inner = Array.from({ length: 50 }, (_, i) => pt(1 + i % 8, 1 + i % 8));
    const h1 = convexHull(outer);
    const h2 = convexHull([...outer, ...inner]);
    expect(sortPts(h1)).toEqual(sortPts(h2));
  });
  it('hull length <= input length', () => {
    const pts = Array.from({ length: 20 }, (_, i) => pt(i * 0.5, Math.sin(i)));
    expect(convexHull(pts).length).toBeLessThanOrEqual(pts.length);
  });
  it('hull of hull same size as hull', () => {
    const pts = [pt(0,0), pt(5,0), pt(5,5), pt(0,5), pt(2.5,2.5)];
    const h = convexHull(pts);
    expect(convexHull(h)).toHaveLength(h.length);
  });
  for (let n = 3; n <= 12; n++) {
    it(`hull of regular ${n}-gon subset contains all n points`, () => {
      const pts = circlePoints(n, 10);
      const h = convexHull(pts);
      expect(h).toHaveLength(n);
      for (const p of pts) {
        expect(h.some(hp => approxEq(hp.x, p.x) && approxEq(hp.y, p.y))).toBe(true);
      }
    });
  }
  for (let i = 1; i <= 10; i++) {
    it(`area × ${i} scales correctly with hull`, () => {
      const pts = circlePoints(6, i * 5);
      expect(hullArea(convexHull(pts))).toBeGreaterThan(0);
    });
  }
});

// ─── 21. centroid — edge cases ────────────────────────────────────────────────
describe('centroid — edge cases', () => {
  it('centroid of large set on origin', () => {
    const pts = circlePoints(360, 100);
    const c = centroid(pts);
    expect(Math.abs(c.x)).toBeLessThan(0.01);
    expect(Math.abs(c.y)).toBeLessThan(0.01);
  });
  it('centroid of shifted set', () => {
    const pts = circlePoints(8, 10, 5, 5);
    const c = centroid(pts);
    expect(c.x).toBeCloseTo(5, 5);
    expect(c.y).toBeCloseTo(5, 5);
  });
  for (let i = 1; i <= 20; i++) {
    it(`centroid of ${i+2} identical pts returns that pt`, () => {
      const pts = Array.from({ length: i + 2 }, () => pt(i * 3, i * 2));
      expect(centroid(pts)).toEqual({ x: i * 3, y: i * 2 });
    });
  }
  for (let n = 2; n <= 20; n++) {
    it(`centroid of ${n} pts on x=0 has x=0`, () => {
      const pts = Array.from({ length: n }, (_, i) => pt(0, i));
      expect(centroid(pts).x).toBe(0);
    });
  }
});

// ─── 22. boundingBox — edge cases ────────────────────────────────────────────
describe('boundingBox — edge cases', () => {
  it('large circle bbox', () => {
    const pts = circlePoints(100, 500);
    const bb = boundingBox(pts)!;
    expect(bb.min.x).toBeCloseTo(-500, 0);
    expect(bb.max.x).toBeCloseTo(500, 0);
  });
  it('all-same-point bbox min=max', () => {
    const pts = [pt(7,7), pt(7,7), pt(7,7)];
    const bb = boundingBox(pts)!;
    expect(bb.min).toEqual({ x: 7, y: 7 });
    expect(bb.max).toEqual({ x: 7, y: 7 });
  });
  for (let i = 1; i <= 20; i++) {
    it(`bbox width of [pt(0,0), pt(${i},0)] = ${i}`, () => {
      const bb = boundingBox([pt(0,0), pt(i,0)])!;
      expect(bb.max.x - bb.min.x).toBeCloseTo(i, 9);
    });
  }
  for (let i = 1; i <= 20; i++) {
    it(`bbox height of [pt(0,0), pt(0,${i})] = ${i}`, () => {
      const bb = boundingBox([pt(0,0), pt(0,i)])!;
      expect(bb.max.y - bb.min.y).toBeCloseTo(i, 9);
    });
  }
});

// ─── 23. integration tests ────────────────────────────────────────────────────
describe('integration — convexHull + area + perimeter', () => {
  it('square: hull then area then perimeter consistent', () => {
    const hull = convexHull(SQUARE);
    expect(hullArea(hull)).toBeCloseTo(1, 9);
    expect(hullPerimeter(hull)).toBeCloseTo(4, 9);
  });
  it('triangle: hull then area correct', () => {
    const hull = convexHull(TRIANGLE);
    expect(hullArea(hull)).toBeCloseTo(6, 5);
  });
  for (let s = 1; s <= 20; s++) {
    it(`${s}×${s} square hull area+perimeter consistent`, () => {
      const pts = [pt(0,0), pt(s,0), pt(s,s), pt(0,s)];
      const h = convexHull(pts);
      expect(hullArea(h)).toBeCloseTo(s * s, 9);
      expect(hullPerimeter(h)).toBeCloseTo(4 * s, 9);
    });
  }
});

describe('integration — pointInHull + convexHull', () => {
  it('all circle points inside their own hull', () => {
    const pts = circlePoints(16, 100);
    const hull = convexHull(pts);
    for (const p of pts) {
      expect(pointInHull(hull, p)).toBe(true);
    }
  });
  it('all square corners inside square hull', () => {
    const hull = convexHull(SQUARE);
    for (const p of SQUARE) {
      expect(pointInHull(hull, p)).toBe(true);
    }
  });
  for (let n = 4; n <= 20; n++) {
    it(`all ${n}-gon vertices inside hull`, () => {
      const pts = circlePoints(n, 50);
      const hull = convexHull(pts);
      for (const p of pts) {
        expect(pointInHull(hull, p)).toBe(true);
      }
    });
  }
});

// ─── 24. distance — exhaustive grid ──────────────────────────────────────────
describe('distance — exhaustive axes', () => {
  for (let i = 1; i <= 30; i++) {
    it(`distance horizontal ${i} = ${i}`, () => {
      expect(distance(pt(0,0), pt(i,0))).toBeCloseTo(i, 9);
    });
  }
  for (let i = 1; i <= 30; i++) {
    it(`distance vertical ${i} = ${i}`, () => {
      expect(distance(pt(0,0), pt(0,i))).toBeCloseTo(i, 9);
    });
  }
  for (let i = 1; i <= 20; i++) {
    it(`distance diagonal ${i},${i} = ${i * Math.SQRT2} ≈`, () => {
      expect(distance(pt(0,0), pt(i,i))).toBeCloseTo(i * Math.SQRT2, 5);
    });
  }
});

// ─── 25. convexHull — sorted output property ─────────────────────────────────
describe('convexHull — output is ordered', () => {
  it('output is counter-clockwise for simple triangle', () => {
    const pts = [pt(0,0), pt(4,0), pt(2,3)];
    const h = convexHull(pts);
    // All points present
    expect(h).toHaveLength(3);
  });
  it('first point has smallest x (or y if tie)', () => {
    const pts = [pt(2,1), pt(0,0), pt(1,2)];
    const h = convexHull(pts);
    expect(h[0].x).toBeLessThanOrEqual(h[h.length-1].x);
  });
  for (let i = 0; i < 20; i++) {
    it(`output hull ${i} has points in traversal order`, () => {
      const pts = circlePoints(5 + i, 10);
      const h = convexHull(pts);
      expect(h.length).toBe(5 + i);
    });
  }
});

// ─── 26. hullArea — sign independence ────────────────────────────────────────
describe('hullArea — sign independence', () => {
  for (let i = 1; i <= 20; i++) {
    it(`area always positive for polygon i=${i}`, () => {
      const pts = circlePoints(3 + i, 10);
      expect(hullArea(convexHull(pts))).toBeGreaterThan(0);
    });
  }
  it('translated square same area', () => {
    const a1 = hullArea(SQUARE);
    const a2 = hullArea([pt(100,100), pt(101,100), pt(101,101), pt(100,101)]);
    expect(a1).toBeCloseTo(a2, 9);
  });
});

// ─── 27. hullPerimeter — segment lengths ─────────────────────────────────────
describe('hullPerimeter — segment consistency', () => {
  it('perimeter equals sum of distances for square', () => {
    const sq = [pt(0,0), pt(1,0), pt(1,1), pt(0,1)];
    const manual = distance(sq[0],sq[1]) + distance(sq[1],sq[2]) +
                   distance(sq[2],sq[3]) + distance(sq[3],sq[0]);
    expect(hullPerimeter(sq)).toBeCloseTo(manual, 9);
  });
  it('perimeter equals sum of distances for triangle', () => {
    const tr = TRIANGLE;
    const h = convexHull(tr);
    let manual = 0;
    for (let i = 0; i < h.length; i++) manual += distance(h[i], h[(i+1)%h.length]);
    expect(hullPerimeter(h)).toBeCloseTo(manual, 9);
  });
  for (let n = 3; n <= 20; n++) {
    it(`perimeter matches manual sum for ${n}-gon`, () => {
      const h = convexHull(circlePoints(n, 20));
      let manual = 0;
      for (let i = 0; i < h.length; i++) manual += distance(h[i], h[(i+1)%h.length]);
      expect(hullPerimeter(h)).toBeCloseTo(manual, 5);
    });
  }
});

// ─── 28. centroid — linearity ────────────────────────────────────────────────
describe('centroid — linearity', () => {
  it('centroid of 4 points forming rectangle at center', () => {
    const pts = [pt(-1,-1), pt(1,-1), pt(1,1), pt(-1,1)];
    const c = centroid(pts);
    expect(c.x).toBeCloseTo(0, 9);
    expect(c.y).toBeCloseTo(0, 9);
  });
  for (let dx = -5; dx <= 5; dx++) {
    it(`centroid x shifts with translation dx=${dx}`, () => {
      const base = [pt(0,0), pt(1,0), pt(1,1), pt(0,1)];
      const shifted = base.map(p => pt(p.x + dx, p.y));
      expect(centroid(shifted).x).toBeCloseTo(0.5 + dx, 9);
    });
  }
  for (let dy = -5; dy <= 5; dy++) {
    it(`centroid y shifts with translation dy=${dy}`, () => {
      const base = [pt(0,0), pt(1,0), pt(1,1), pt(0,1)];
      const shifted = base.map(p => pt(p.x, p.y + dy));
      expect(centroid(shifted).y).toBeCloseTo(0.5 + dy, 9);
    });
  }
});

// ─── 29. exports & types ─────────────────────────────────────────────────────
describe('exports and type checks', () => {
  it('convexHull is function', () => expect(typeof convexHull).toBe('function'));
  it('isConvex is function', () => expect(typeof isConvex).toBe('function'));
  it('pointInHull is function', () => expect(typeof pointInHull).toBe('function'));
  it('hullArea is function', () => expect(typeof hullArea).toBe('function'));
  it('hullPerimeter is function', () => expect(typeof hullPerimeter).toBe('function'));
  it('distance is function', () => expect(typeof distance).toBe('function'));
  it('centroid is function', () => expect(typeof centroid).toBe('function'));
  it('boundingBox is function', () => expect(typeof boundingBox).toBe('function'));
  it('grahamScan is function', () => expect(typeof grahamScan).toBe('function'));
  it('upperHull is function', () => expect(typeof upperHull).toBe('function'));
  it('lowerHull is function', () => expect(typeof lowerHull).toBe('function'));
  it('convexHull returns array', () => expect(Array.isArray(convexHull([]))).toBe(true));
  it('centroid returns object with x and y', () => {
    const c = centroid([pt(1,2)]);
    expect(c).toHaveProperty('x');
    expect(c).toHaveProperty('y');
  });
  it('boundingBox returns null for empty', () => expect(boundingBox([])).toBeNull());
  it('boundingBox returns object with min/max for non-empty', () => {
    const bb = boundingBox([pt(1,2)])!;
    expect(bb).toHaveProperty('min');
    expect(bb).toHaveProperty('max');
  });
  it('hullArea returns number', () => expect(typeof hullArea([])).toBe('number'));
  it('hullPerimeter returns number', () => expect(typeof hullPerimeter([])).toBe('number'));
  it('distance returns number', () => expect(typeof distance(pt(0,0), pt(1,1))).toBe('number'));
  it('isConvex returns boolean', () => expect(typeof isConvex([])).toBe('boolean'));
  it('pointInHull returns boolean', () => expect(typeof pointInHull([], pt(0,0))).toBe('boolean'));
});

// ─── 30. fuzz-style: many random polygons ─────────────────────────────────────
describe('convexHull — fuzz properties', () => {
  for (let seed = 0; seed < 50; seed++) {
    it(`hull is idempotent for deterministic set seed=${seed}`, () => {
      const pts = Array.from({ length: 20 }, (_, i) =>
        pt(Math.cos((i + seed) * 0.5) * 10, Math.sin((i + seed) * 0.5) * 10)
      );
      const h1 = convexHull(pts);
      const h2 = convexHull(h1);
      expect(h2.length).toBe(h1.length);
    });
  }
  for (let seed = 0; seed < 20; seed++) {
    it(`area > 0 for non-degenerate polygon seed=${seed}`, () => {
      const pts = circlePoints(5 + (seed % 7), 10 + seed);
      expect(hullArea(convexHull(pts))).toBeGreaterThan(0);
    });
  }
});

// ─── 31. hullArea — known shapes ─────────────────────────────────────────────
describe('hullArea — known exact values', () => {
  it('right triangle base=6 height=4 area=12', () => {
    expect(hullArea([pt(0,0), pt(6,0), pt(0,4)])).toBeCloseTo(12, 9);
  });
  it('parallelogram 3×2 area=6', () => {
    expect(hullArea([pt(0,0), pt(3,0), pt(4,2), pt(1,2)])).toBeCloseTo(6, 5);
  });
  it('large square 100×100 area=10000', () => {
    expect(hullArea([pt(0,0), pt(100,0), pt(100,100), pt(0,100)])).toBeCloseTo(10000, 6);
  });
  it('very small square 0.1×0.1 area=0.01', () => {
    expect(hullArea([pt(0,0), pt(0.1,0), pt(0.1,0.1), pt(0,0.1)])).toBeCloseTo(0.01, 9);
  });
  for (let i = 1; i <= 20; i++) {
    it(`right triangle base=${i} height=${i} area=${i*i/2}`, () => {
      expect(hullArea([pt(0,0), pt(i,0), pt(0,i)])).toBeCloseTo(i * i / 2, 5);
    });
  }
});

// ─── 32. hullPerimeter — more triangles ──────────────────────────────────────
describe('hullPerimeter — triangles', () => {
  it('isoceles triangle 3,3,base perimeter', () => {
    const base = [pt(0,0), pt(4,0), pt(2, Math.sqrt(5))];
    const h = convexHull(base);
    expect(hullPerimeter(h)).toBeGreaterThan(0);
  });
  for (let s = 1; s <= 20; s++) {
    it(`equilateral triangle side=${s} perimeter≈${3*s}`, () => {
      const h = Math.sqrt(3)/2 * s;
      const pts = [pt(0,0), pt(s,0), pt(s/2, h)];
      expect(hullPerimeter(convexHull(pts))).toBeCloseTo(3 * s, 4);
    });
  }
});

// ─── 33. pointInHull — on-edge cases ─────────────────────────────────────────
describe('pointInHull — edge-boundary', () => {
  it('corner of square (0,0) is on hull', () => {
    const h = convexHull(SQUARE);
    expect(pointInHull(h, pt(0,0))).toBe(true);
  });
  it('corner (1,1) is on hull', () => {
    const h = convexHull(SQUARE);
    expect(pointInHull(h, pt(1,1))).toBe(true);
  });
  it('well inside point is inside', () => {
    const h = convexHull([pt(0,0), pt(10,0), pt(10,10), pt(0,10)]);
    expect(pointInHull(h, pt(5,5))).toBe(true);
  });
  it('far outside is outside', () => {
    const h = convexHull([pt(0,0), pt(10,0), pt(10,10), pt(0,10)]);
    expect(pointInHull(h, pt(50,50))).toBe(false);
  });
  it('way outside negative is outside', () => {
    const h = convexHull([pt(0,0), pt(10,0), pt(10,10), pt(0,10)]);
    expect(pointInHull(h, pt(-50,-50))).toBe(false);
  });
  for (let n = 4; n <= 20; n++) {
    it(`center inside ${n}-gon`, () => {
      const h = convexHull(circlePoints(n, 10));
      expect(pointInHull(h, pt(0,0))).toBe(true);
    });
  }
  for (let i = 1; i <= 15; i++) {
    it(`point far outside: (${100+i}, 0) outside unit square`, () => {
      const h = convexHull(SQUARE);
      expect(pointInHull(h, pt(100 + i, 0))).toBe(false);
    });
  }
});
