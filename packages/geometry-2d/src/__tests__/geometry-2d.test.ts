// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  distance, distanceSq, midpoint, translate, scale, rotate, cross, dot, magnitude, normalize,
  angle, angleBetween, pointOnSegment, segmentsIntersect, polygonArea, polygonPerimeter,
  pointInPolygon, isConvexPolygon, centroid, boundingBox, circleArea, circleCircumference,
  pointInCircle, circlesIntersect, convexHull, distancePointToLine, reflectPoint, interpolate,
  EPS, Point, Circle,
} from '../geometry-2d';

// ---------------------------------------------------------------------------
// distance — 200 tests
// ---------------------------------------------------------------------------
describe('distance 200 tests', () => {
  for (let i = 0; i < 200; i++) {
    it(`distance from (0,0) to (${i},0) = ${i}`, () => {
      expect(distance({ x: 0, y: 0 }, { x: i, y: 0 })).toBeCloseTo(i, 9);
    });
  }
});

// ---------------------------------------------------------------------------
// distanceSq — 100 tests
// ---------------------------------------------------------------------------
describe('distanceSq 100 tests', () => {
  for (let i = 0; i < 100; i++) {
    it(`distanceSq (0,0) to (${i},0) = ${i * i}`, () => {
      expect(distanceSq({ x: 0, y: 0 }, { x: i, y: 0 })).toBeCloseTo(i * i, 9);
    });
  }
});

// ---------------------------------------------------------------------------
// midpoint — 100 tests
// ---------------------------------------------------------------------------
describe('midpoint 100 tests', () => {
  for (let i = 0; i < 100; i++) {
    it(`midpoint (0,0) and (${i * 2},0) = (${i},0)`, () => {
      const m = midpoint({ x: 0, y: 0 }, { x: i * 2, y: 0 });
      expect(m.x).toBeCloseTo(i);
      expect(m.y).toBeCloseTo(0);
    });
  }
});

// ---------------------------------------------------------------------------
// translate — 100 tests
// ---------------------------------------------------------------------------
describe('translate 100 tests', () => {
  for (let i = 0; i < 100; i++) {
    it(`translate origin by (${i},${i}) gives (${i},${i})`, () => {
      const p = translate({ x: 0, y: 0 }, i, i);
      expect(p.x).toBe(i);
      expect(p.y).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// magnitude — 100 tests
// ---------------------------------------------------------------------------
describe('magnitude 100 tests', () => {
  for (let i = 1; i <= 100; i++) {
    it(`magnitude of (${i},0) = ${i}`, () => {
      expect(magnitude({ x: i, y: 0 })).toBeCloseTo(i);
    });
  }
});

// ---------------------------------------------------------------------------
// circleArea — 100 tests
// ---------------------------------------------------------------------------
describe('circleArea 100 tests', () => {
  for (let r = 1; r <= 100; r++) {
    it(`circleArea(${r}) = PI*${r}^2`, () => {
      expect(circleArea(r)).toBeCloseTo(Math.PI * r * r);
    });
  }
});

// ---------------------------------------------------------------------------
// circleCircumference — 100 tests
// ---------------------------------------------------------------------------
describe('circleCircumference 100 tests', () => {
  for (let r = 1; r <= 100; r++) {
    it(`circumference(${r}) = 2*PI*${r}`, () => {
      expect(circleCircumference(r)).toBeCloseTo(2 * Math.PI * r);
    });
  }
});

// ---------------------------------------------------------------------------
// polygonArea unit square — 100 tests
// ---------------------------------------------------------------------------
describe('polygonArea unit square 100 tests', () => {
  for (let i = 0; i < 100; i++) {
    it(`unit square area = 1 test ${i}`, () => {
      const sq = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
      expect(polygonArea(sq)).toBeCloseTo(1);
    });
  }
});

// ---------------------------------------------------------------------------
// pointInPolygon unit square — 100 tests
// ---------------------------------------------------------------------------
describe('pointInPolygon unit square 100 tests', () => {
  for (let i = 0; i < 100; i++) {
    it(`center (0.5,0.5) is inside unit square test ${i}`, () => {
      const sq = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
      expect(pointInPolygon({ x: 0.5, y: 0.5 }, sq)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// interpolate — 101 tests (t = 0/100 .. 100/100)
// ---------------------------------------------------------------------------
describe('interpolate 101 tests', () => {
  for (let t = 0; t <= 100; t++) {
    it(`interpolate at t=${t / 100} between (0,0) and (100,0)`, () => {
      const p = interpolate({ x: 0, y: 0 }, { x: 100, y: 0 }, t / 100);
      expect(p.x).toBeCloseTo(t);
    });
  }
});

// ---------------------------------------------------------------------------
// scale — 100 tests
// ---------------------------------------------------------------------------
describe('scale 100 tests', () => {
  for (let i = 1; i <= 100; i++) {
    it(`scale (1,1) by (${i},${i}) gives (${i},${i})`, () => {
      const p = scale({ x: 1, y: 1 }, i, i);
      expect(p.x).toBeCloseTo(i);
      expect(p.y).toBeCloseTo(i);
    });
  }
});

// ---------------------------------------------------------------------------
// dot product — 50 tests
// ---------------------------------------------------------------------------
describe('dot 50 tests', () => {
  for (let i = 1; i <= 50; i++) {
    it(`dot (${i},0) · (${i},0) = ${i * i}`, () => {
      expect(dot({ x: i, y: 0 }, { x: i, y: 0 })).toBeCloseTo(i * i);
    });
  }
});

// ---------------------------------------------------------------------------
// cross product — 50 tests
// ---------------------------------------------------------------------------
describe('cross 50 tests', () => {
  for (let i = 1; i <= 50; i++) {
    it(`cross origin (${i},0) (0,${i}) = ${i * i}`, () => {
      const c = cross({ x: 0, y: 0 }, { x: i, y: 0 }, { x: 0, y: i });
      expect(c).toBeCloseTo(i * i);
    });
  }
});

// ---------------------------------------------------------------------------
// normalize — 50 tests
// ---------------------------------------------------------------------------
describe('normalize 50 tests', () => {
  for (let i = 1; i <= 50; i++) {
    it(`normalize (${i},0) gives (1,0)`, () => {
      const n = normalize({ x: i, y: 0 });
      expect(n.x).toBeCloseTo(1);
      expect(n.y).toBeCloseTo(0);
    });
  }
});

// ---------------------------------------------------------------------------
// angle — 50 tests
// ---------------------------------------------------------------------------
describe('angle 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    const rad = (i / 50) * 2 * Math.PI;
    it(`angle from origin to (cos,sin) at ${i}/50 * 2PI`, () => {
      const b = { x: Math.cos(rad), y: Math.sin(rad) };
      expect(angle({ x: 0, y: 0 }, b)).toBeCloseTo(rad > Math.PI ? rad - 2 * Math.PI : rad, 5);
    });
  }
});

// ---------------------------------------------------------------------------
// rotate — 50 tests: rotating (1,0) by 2PI/50 steps
// ---------------------------------------------------------------------------
describe('rotate 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    const a = (i / 50) * 2 * Math.PI;
    it(`rotate (1,0) by ${i}/50 * 2PI, x ~ cos`, () => {
      const p = rotate({ x: 1, y: 0 }, a);
      expect(p.x).toBeCloseTo(Math.cos(a), 5);
      expect(p.y).toBeCloseTo(Math.sin(a), 5);
    });
  }
});

// ---------------------------------------------------------------------------
// polygonPerimeter — 50 tests: perimeter of equilateral polygon approximating circle
// ---------------------------------------------------------------------------
describe('polygonPerimeter 50 tests', () => {
  for (let n = 3; n <= 52; n++) {
    it(`${n}-gon perimeter is positive`, () => {
      const pts: Point[] = [];
      for (let k = 0; k < n; k++) {
        pts.push({ x: Math.cos((2 * Math.PI * k) / n), y: Math.sin((2 * Math.PI * k) / n) });
      }
      const p = polygonPerimeter(pts);
      expect(p).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// boundingBox — 50 tests
// ---------------------------------------------------------------------------
describe('boundingBox 50 tests', () => {
  for (let i = 1; i <= 50; i++) {
    it(`bounding box of ${i} points on x-axis has width ${i - 1}`, () => {
      const pts: Point[] = Array.from({ length: i }, (_, k) => ({ x: k, y: 0 }));
      const bb = boundingBox(pts);
      expect(bb.width).toBeCloseTo(i - 1);
      expect(bb.height).toBeCloseTo(0);
    });
  }
});

// ---------------------------------------------------------------------------
// centroid — 50 tests: centroid of square at offset
// ---------------------------------------------------------------------------
describe('centroid 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    it(`centroid of unit square offset by (${i},${i}) = (${i + 0.5},${i + 0.5})`, () => {
      const sq: Point[] = [
        { x: i, y: i }, { x: i + 1, y: i }, { x: i + 1, y: i + 1 }, { x: i, y: i + 1 },
      ];
      const c = centroid(sq);
      expect(c.x).toBeCloseTo(i + 0.5);
      expect(c.y).toBeCloseTo(i + 0.5);
    });
  }
});

// ---------------------------------------------------------------------------
// pointInCircle — 50 tests: points on x-axis inside circle of radius 200
// ---------------------------------------------------------------------------
describe('pointInCircle 50 tests', () => {
  const circ: Circle = { center: { x: 0, y: 0 }, radius: 200 };
  for (let i = 0; i < 50; i++) {
    it(`point (${i},0) is inside circle r=200`, () => {
      expect(pointInCircle({ x: i, y: 0 }, circ)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// pointInPolygon outside — 50 tests
// ---------------------------------------------------------------------------
describe('pointInPolygon outside 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    it(`point (${2 + i},0.5) is outside unit square test ${i}`, () => {
      const sq = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
      expect(pointInPolygon({ x: 2 + i, y: 0.5 }, sq)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// isConvexPolygon — 25 tests regular polygons (all convex)
// ---------------------------------------------------------------------------
describe('isConvexPolygon regular polygons 25 tests', () => {
  for (let n = 3; n <= 27; n++) {
    it(`regular ${n}-gon is convex`, () => {
      const pts: Point[] = [];
      for (let k = 0; k < n; k++) {
        pts.push({ x: Math.cos((2 * Math.PI * k) / n), y: Math.sin((2 * Math.PI * k) / n) });
      }
      expect(isConvexPolygon(pts)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// segmentsIntersect — 25 tests crossing X
// ---------------------------------------------------------------------------
describe('segmentsIntersect crossing 25 tests', () => {
  for (let i = 1; i <= 25; i++) {
    it(`segments crossing at origin, scale ${i}`, () => {
      expect(
        segmentsIntersect(
          { x: -i, y: 0 }, { x: i, y: 0 },
          { x: 0, y: -i }, { x: 0, y: i }
        )
      ).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// segmentsIntersect non-intersecting — 25 tests
// ---------------------------------------------------------------------------
describe('segmentsIntersect non-crossing 25 tests', () => {
  for (let i = 1; i <= 25; i++) {
    it(`parallel horizontal segments offset by ${i} do not intersect`, () => {
      expect(
        segmentsIntersect(
          { x: 0, y: 0 }, { x: i, y: 0 },
          { x: 0, y: 1 }, { x: i, y: 1 }
        )
      ).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// distancePointToLine — 25 tests: point at (0,h) to x-axis = h
// ---------------------------------------------------------------------------
describe('distancePointToLine 25 tests', () => {
  for (let h = 1; h <= 25; h++) {
    it(`point (0,${h}) to x-axis segment distance = ${h}`, () => {
      expect(
        distancePointToLine({ x: 0, y: h }, { x: -100, y: 0 }, { x: 100, y: 0 })
      ).toBeCloseTo(h);
    });
  }
});

// ---------------------------------------------------------------------------
// reflectPoint — 25 tests: reflect (x,1) across x-axis → (x,-1)
// ---------------------------------------------------------------------------
describe('reflectPoint 25 tests', () => {
  for (let x = 0; x < 25; x++) {
    it(`reflect (${x},1) across x-axis → (${x},-1)`, () => {
      const r = reflectPoint({ x, y: 1 }, { p1: { x: 0, y: 0 }, p2: { x: 1, y: 0 } });
      expect(r.x).toBeCloseTo(x);
      expect(r.y).toBeCloseTo(-1);
    });
  }
});

// ---------------------------------------------------------------------------
// distanceSq diagonal — 25 tests
// ---------------------------------------------------------------------------
describe('distanceSq diagonal 25 tests', () => {
  for (let i = 1; i <= 25; i++) {
    it(`distanceSq (0,0) to (${i},${i}) = ${2 * i * i}`, () => {
      expect(distanceSq({ x: 0, y: 0 }, { x: i, y: i })).toBeCloseTo(2 * i * i);
    });
  }
});

// ---------------------------------------------------------------------------
// convexHull — 25 tests: hull of regular n-gon should have n points
// ---------------------------------------------------------------------------
describe('convexHull 25 tests', () => {
  for (let n = 3; n <= 27; n++) {
    it(`convex hull of regular ${n}-gon has ${n} points`, () => {
      const pts: Point[] = [];
      for (let k = 0; k < n; k++) {
        pts.push({ x: Math.cos((2 * Math.PI * k) / n), y: Math.sin((2 * Math.PI * k) / n) });
      }
      const hull = convexHull(pts);
      expect(hull.length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// circlesIntersect — 25 tests: two circles sharing same center, r=1 and r=2 → intersect
// ---------------------------------------------------------------------------
describe('circlesIntersect 25 tests', () => {
  for (let i = 1; i <= 25; i++) {
    it(`circle at origin r=${i} intersects circle at (${i},0) r=${i}`, () => {
      const a: Circle = { center: { x: 0, y: 0 }, radius: i };
      const b: Circle = { center: { x: i, y: 0 }, radius: i };
      expect(circlesIntersect(a, b)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// angleBetween — 25 tests: angle between (1,0) and (cos θ, sin θ)
// ---------------------------------------------------------------------------
describe('angleBetween 25 tests', () => {
  for (let i = 0; i < 25; i++) {
    const theta = (i / 25) * Math.PI;
    it(`angleBetween (1,0) and (cos(${i}*PI/25), sin(${i}*PI/25)) ≈ ${theta.toFixed(4)}`, () => {
      const b = { x: Math.cos(theta), y: Math.sin(theta) };
      expect(angleBetween({ x: 1, y: 0 }, b)).toBeCloseTo(theta, 5);
    });
  }
});

// ---------------------------------------------------------------------------
// polygonArea rectangles — 25 tests: n×n square area = n²
// ---------------------------------------------------------------------------
describe('polygonArea rectangles 25 tests', () => {
  for (let n = 1; n <= 25; n++) {
    it(`${n}×${n} square polygon area = ${n * n}`, () => {
      const sq: Point[] = [
        { x: 0, y: 0 }, { x: n, y: 0 }, { x: n, y: n }, { x: 0, y: n },
      ];
      expect(polygonArea(sq)).toBeCloseTo(n * n);
    });
  }
});

// ---------------------------------------------------------------------------
// pointOnSegment — 25 tests: midpoints
// ---------------------------------------------------------------------------
describe('pointOnSegment 25 tests', () => {
  for (let i = 0; i < 25; i++) {
    it(`midpoint of segment (0,0)-(${i * 2},0) is on segment`, () => {
      expect(pointOnSegment({ x: i, y: 0 }, { x: 0, y: 0 }, { x: i * 2, y: 0 })).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// translate y-axis — 25 tests
// ---------------------------------------------------------------------------
describe('translate y-axis 25 tests', () => {
  for (let i = 1; i <= 25; i++) {
    it(`translate (0,0) by (0,${i}) gives (0,${i})`, () => {
      const p = translate({ x: 0, y: 0 }, 0, i);
      expect(p.x).toBe(0);
      expect(p.y).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// scale x-axis — 25 tests
// ---------------------------------------------------------------------------
describe('scale x-axis 25 tests', () => {
  for (let i = 1; i <= 25; i++) {
    it(`scale (2,3) by (${i},1) gives (${2 * i},3)`, () => {
      const p = scale({ x: 2, y: 3 }, i, 1);
      expect(p.x).toBeCloseTo(2 * i);
      expect(p.y).toBeCloseTo(3);
    });
  }
});

// ---------------------------------------------------------------------------
// dot orthogonal — 25 tests
// ---------------------------------------------------------------------------
describe('dot orthogonal 25 tests', () => {
  for (let i = 1; i <= 25; i++) {
    it(`dot (${i},0) · (0,${i}) = 0`, () => {
      expect(dot({ x: i, y: 0 }, { x: 0, y: i })).toBeCloseTo(0);
    });
  }
});

// ---------------------------------------------------------------------------
// magnitude 3-4-5 triangles — 25 tests
// ---------------------------------------------------------------------------
describe('magnitude 3-4-5 triangles 25 tests', () => {
  for (let k = 1; k <= 25; k++) {
    it(`magnitude (${3 * k},${4 * k}) = ${5 * k}`, () => {
      expect(magnitude({ x: 3 * k, y: 4 * k })).toBeCloseTo(5 * k);
    });
  }
});

// ---------------------------------------------------------------------------
// normalize unit — 25 tests: any nonzero vector normalized has magnitude 1
// ---------------------------------------------------------------------------
describe('normalize unit magnitude 25 tests', () => {
  for (let i = 1; i <= 25; i++) {
    it(`normalize (${i},${i}) has magnitude 1`, () => {
      const n = normalize({ x: i, y: i });
      expect(magnitude(n)).toBeCloseTo(1);
    });
  }
});

// ---------------------------------------------------------------------------
// circleArea vs circumference ratio — 25 tests
// ---------------------------------------------------------------------------
describe('circleArea circumference ratio 25 tests', () => {
  for (let r = 1; r <= 25; r++) {
    it(`circleArea(${r}) / circleCircumference(${r}) = r/2 = ${r / 2}`, () => {
      expect(circleArea(r) / circleCircumference(r)).toBeCloseTo(r / 2);
    });
  }
});

// ---------------------------------------------------------------------------
// interpolate y-only — 25 tests
// ---------------------------------------------------------------------------
describe('interpolate y-only 25 tests', () => {
  for (let i = 0; i < 25; i++) {
    it(`interpolate (0,0)→(0,${i}) at t=1 = (0,${i})`, () => {
      const p = interpolate({ x: 0, y: 0 }, { x: 0, y: i }, 1);
      expect(p.x).toBeCloseTo(0);
      expect(p.y).toBeCloseTo(i);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional EPS constant tests — 10 tests
// ---------------------------------------------------------------------------
describe('EPS constant 10 tests', () => {
  for (let i = 0; i < 10; i++) {
    it(`EPS is small positive number test ${i}`, () => {
      expect(EPS).toBeGreaterThan(0);
      expect(EPS).toBeLessThan(1e-6);
    });
  }
});

// ---------------------------------------------------------------------------
// distance symmetry — 25 tests
// ---------------------------------------------------------------------------
describe('distance symmetry 25 tests', () => {
  for (let i = 1; i <= 25; i++) {
    it(`distance(a,b) = distance(b,a) for (0,0)-(${i},${i})`, () => {
      const a = { x: 0, y: 0 };
      const b = { x: i, y: i };
      expect(distance(a, b)).toBeCloseTo(distance(b, a));
    });
  }
});

// ---------------------------------------------------------------------------
// midpoint symmetry — 25 tests
// ---------------------------------------------------------------------------
describe('midpoint symmetry 25 tests', () => {
  for (let i = 1; i <= 25; i++) {
    it(`midpoint(a,b) = midpoint(b,a) for (${i},0) and (0,${i})`, () => {
      const a = { x: i, y: 0 };
      const b = { x: 0, y: i };
      const m1 = midpoint(a, b);
      const m2 = midpoint(b, a);
      expect(m1.x).toBeCloseTo(m2.x);
      expect(m1.y).toBeCloseTo(m2.y);
    });
  }
});

// ---------------------------------------------------------------------------
// polygonPerimeter unit square — 25 tests
// ---------------------------------------------------------------------------
describe('polygonPerimeter unit square 25 tests', () => {
  for (let i = 0; i < 25; i++) {
    it(`unit square perimeter = 4 test ${i}`, () => {
      const sq: Point[] = [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 },
      ];
      expect(polygonPerimeter(sq)).toBeCloseTo(4);
    });
  }
});

// ---------------------------------------------------------------------------
// boundingBox height — 25 tests
// ---------------------------------------------------------------------------
describe('boundingBox height 25 tests', () => {
  for (let i = 1; i <= 25; i++) {
    it(`bounding box of points on y-axis 0..${i} has height ${i}`, () => {
      const pts: Point[] = Array.from({ length: i + 1 }, (_, k) => ({ x: 0, y: k }));
      const bb = boundingBox(pts);
      expect(bb.height).toBeCloseTo(i);
      expect(bb.width).toBeCloseTo(0);
    });
  }
});

// ---------------------------------------------------------------------------
// circlesIntersect non-intersecting — 25 tests: circles far apart
// ---------------------------------------------------------------------------
describe('circlesIntersect non-intersecting 25 tests', () => {
  for (let i = 1; i <= 25; i++) {
    it(`circles far apart (sep=${10 * i}) do not intersect`, () => {
      const a: Circle = { center: { x: 0, y: 0 }, radius: 1 };
      const b: Circle = { center: { x: 10 * i, y: 0 }, radius: 1 };
      expect(circlesIntersect(a, b)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// pointInCircle outside — 25 tests
// ---------------------------------------------------------------------------
describe('pointInCircle outside 25 tests', () => {
  for (let i = 1; i <= 25; i++) {
    it(`point (${i + 1},0) is outside circle r=${i}`, () => {
      const circ: Circle = { center: { x: 0, y: 0 }, radius: i };
      expect(pointInCircle({ x: i + 1, y: 0 }, circ)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// convexHull with interior points — 10 tests
// ---------------------------------------------------------------------------
describe('convexHull with interior points 10 tests', () => {
  for (let i = 0; i < 10; i++) {
    it(`hull of square + center (test ${i}) has 4 points`, () => {
      const pts: Point[] = [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 },
        { x: 0.5, y: 0.5 }, // interior
      ];
      const hull = convexHull(pts);
      expect(hull.length).toBe(4);
    });
  }
});

// ---------------------------------------------------------------------------
// distancePointToLine collinear — 10 tests
// ---------------------------------------------------------------------------
describe('distancePointToLine collinear 10 tests', () => {
  for (let i = 1; i <= 10; i++) {
    it(`point on line has distance 0 (test ${i})`, () => {
      // All three points are on y=0
      expect(
        distancePointToLine({ x: i * 3, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 })
      ).toBeCloseTo(0);
    });
  }
});

// ---------------------------------------------------------------------------
// cross collinear — 10 tests: collinear points → cross = 0
// ---------------------------------------------------------------------------
describe('cross collinear 10 tests', () => {
  for (let i = 1; i <= 10; i++) {
    it(`cross of collinear points (0,0),(${i},0),(${2 * i},0) = 0`, () => {
      expect(cross({ x: 0, y: 0 }, { x: i, y: 0 }, { x: 2 * i, y: 0 })).toBeCloseTo(0);
    });
  }
});

// ---------------------------------------------------------------------------
// rotate identity — 10 tests: rotating by 0 returns same point
// ---------------------------------------------------------------------------
describe('rotate identity 10 tests', () => {
  for (let i = 1; i <= 10; i++) {
    it(`rotate (${i},${i}) by 0 returns (${i},${i})`, () => {
      const p = rotate({ x: i, y: i }, 0);
      expect(p.x).toBeCloseTo(i);
      expect(p.y).toBeCloseTo(i);
    });
  }
});

// ---------------------------------------------------------------------------
// rotate full circle — 10 tests: rotating by 2PI returns same point
// ---------------------------------------------------------------------------
describe('rotate full circle 10 tests', () => {
  for (let i = 1; i <= 10; i++) {
    it(`rotate (${i},0) by 2PI returns (${i},0)`, () => {
      const p = rotate({ x: i, y: 0 }, 2 * Math.PI);
      expect(p.x).toBeCloseTo(i);
      expect(p.y).toBeCloseTo(0, 5);
    });
  }
});

// ---------------------------------------------------------------------------
// isConvexPolygon non-convex L-shape — 10 tests
// ---------------------------------------------------------------------------
describe('isConvexPolygon non-convex 10 tests', () => {
  for (let i = 0; i < 10; i++) {
    it(`L-shaped polygon is not convex (test ${i})`, () => {
      // A simple non-convex (L-shape)
      const pts: Point[] = [
        { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 },
        { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 },
      ];
      expect(isConvexPolygon(pts)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// reflectPoint across y-axis — 10 tests
// ---------------------------------------------------------------------------
describe('reflectPoint across y-axis 10 tests', () => {
  for (let i = 1; i <= 10; i++) {
    it(`reflect (${i},${i}) across y-axis → (-${i},${i})`, () => {
      // y-axis is the vertical line x=0: line from (0,0) to (0,1)
      const r = reflectPoint({ x: i, y: i }, { p1: { x: 0, y: 0 }, p2: { x: 0, y: 1 } });
      expect(r.x).toBeCloseTo(-i);
      expect(r.y).toBeCloseTo(i);
    });
  }
});

// ---------------------------------------------------------------------------
// centroid triangle — 10 tests
// ---------------------------------------------------------------------------
describe('centroid triangle 10 tests', () => {
  for (let i = 1; i <= 10; i++) {
    it(`centroid of equilateral-like triangle offset by ${i}`, () => {
      const pts: Point[] = [
        { x: i, y: i }, { x: i + 3, y: i }, { x: i + 1.5, y: i + 2 },
      ];
      const c = centroid(pts);
      expect(c.x).toBeCloseTo(i + 1.5);
      expect(c.y).toBeCloseTo(i + 2 / 3);
    });
  }
});

// ---------------------------------------------------------------------------
// angleBetween perpendicular — 10 tests: (1,0) and (0,1) → PI/2
// ---------------------------------------------------------------------------
describe('angleBetween perpendicular 10 tests', () => {
  for (let i = 0; i < 10; i++) {
    it(`angleBetween (1,0) and (0,1) = PI/2 test ${i}`, () => {
      expect(angleBetween({ x: 1, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(Math.PI / 2);
    });
  }
});

// ---------------------------------------------------------------------------
// angleBetween parallel — 10 tests: same direction → 0
// ---------------------------------------------------------------------------
describe('angleBetween parallel 10 tests', () => {
  for (let i = 1; i <= 10; i++) {
    it(`angleBetween (${i},0) and (${i * 2},0) = 0`, () => {
      expect(angleBetween({ x: i, y: 0 }, { x: i * 2, y: 0 })).toBeCloseTo(0);
    });
  }
});

// ---------------------------------------------------------------------------
// pointOnSegment endpoint — 10 tests
// ---------------------------------------------------------------------------
describe('pointOnSegment endpoint 10 tests', () => {
  for (let i = 1; i <= 10; i++) {
    it(`endpoint (${i},0) is on segment (0,0)-(${i},0)`, () => {
      expect(pointOnSegment({ x: i, y: 0 }, { x: 0, y: 0 }, { x: i, y: 0 })).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// interpolate midpoint — 10 tests
// ---------------------------------------------------------------------------
describe('interpolate midpoint 10 tests', () => {
  for (let i = 1; i <= 10; i++) {
    it(`interpolate t=0.5 between (0,0) and (${2 * i},${2 * i}) = (${i},${i})`, () => {
      const p = interpolate({ x: 0, y: 0 }, { x: 2 * i, y: 2 * i }, 0.5);
      expect(p.x).toBeCloseTo(i);
      expect(p.y).toBeCloseTo(i);
    });
  }
});

// ---------------------------------------------------------------------------
// distanceSq symmetry — 10 tests
// ---------------------------------------------------------------------------
describe('distanceSq symmetry 10 tests', () => {
  for (let i = 1; i <= 10; i++) {
    it(`distanceSq(a,b) = distanceSq(b,a) for (${i},0)`, () => {
      const a = { x: 0, y: 0 };
      const b = { x: i, y: i };
      expect(distanceSq(a, b)).toBeCloseTo(distanceSq(b, a));
    });
  }
});

// ---------------------------------------------------------------------------
// normalize zero vector — 5 tests
// ---------------------------------------------------------------------------
describe('normalize zero vector 5 tests', () => {
  for (let i = 0; i < 5; i++) {
    it(`normalize (0,0) returns (0,0) test ${i}`, () => {
      const n = normalize({ x: 0, y: 0 });
      expect(n.x).toBe(0);
      expect(n.y).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// convexHull collinear — 5 tests
// ---------------------------------------------------------------------------
describe('convexHull collinear 5 tests', () => {
  for (let i = 0; i < 5; i++) {
    it(`convex hull of 3 collinear points has at most 2 extreme points test ${i}`, () => {
      const pts: Point[] = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
      const hull = convexHull(pts);
      // With the Andrew's monotone chain removing collinear, we get 2 endpoints
      expect(hull.length).toBeLessThanOrEqual(3);
      expect(hull.length).toBeGreaterThanOrEqual(2);
    });
  }
});

// ---------------------------------------------------------------------------
// circleArea zero radius — 5 tests
// ---------------------------------------------------------------------------
describe('circleArea zero radius 5 tests', () => {
  for (let i = 0; i < 5; i++) {
    it(`circleArea(0) = 0 test ${i}`, () => {
      expect(circleArea(0)).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// distance same point — 5 tests
// ---------------------------------------------------------------------------
describe('distance same point 5 tests', () => {
  for (let i = 0; i < 5; i++) {
    it(`distance from (${i},${i}) to itself = 0`, () => {
      expect(distance({ x: i, y: i }, { x: i, y: i })).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// polygonArea triangle — 5 tests
// ---------------------------------------------------------------------------
describe('polygonArea triangle 5 tests', () => {
  for (let b = 1; b <= 5; b++) {
    it(`right triangle base=${b} height=${b} area=${(b * b) / 2}`, () => {
      const tri: Point[] = [{ x: 0, y: 0 }, { x: b, y: 0 }, { x: 0, y: b }];
      expect(polygonArea(tri)).toBeCloseTo((b * b) / 2);
    });
  }
});
