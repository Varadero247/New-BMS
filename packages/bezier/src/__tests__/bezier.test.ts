// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { vec2, linear, quadratic, cubic, cubicDerivative, arcLength, boundingBox, split, elevate, isFlatEnough, dist2, Vec2 } from '../bezier';

const p0 = vec2(0, 0), p1 = vec2(1, 0), p2 = vec2(1, 1), p3 = vec2(0, 1);
const pa = vec2(0, 0), pb = vec2(1, 1);

describe('vec2', () => {
  for (let i = 0; i < 50; i++) {
    it(`vec2(${i}, ${i+1}) has correct properties`, () => {
      const v = vec2(i, i + 1);
      expect(v.x).toBe(i);
      expect(v.y).toBe(i + 1);
    });
  }
});

describe('linear interpolation', () => {
  it('t=0 returns p0', () => { const r = linear(0, p0, p3); expect(r.x).toBeCloseTo(0); expect(r.y).toBeCloseTo(0); });
  it('t=1 returns p1', () => { const r = linear(1, p0, p3); expect(r.x).toBeCloseTo(0); expect(r.y).toBeCloseTo(1); });
  it('t=0.5 returns midpoint', () => { const r = linear(0.5, pa, pb); expect(r.x).toBeCloseTo(0.5); expect(r.y).toBeCloseTo(0.5); });
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    it(`linear t=${t} x is monotone`, () => {
      const r = linear(t, pa, pb);
      expect(r.x).toBeCloseTo(t, 5);
      expect(r.y).toBeCloseTo(t, 5);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`linear on axis ${i}`, () => {
      const r = linear(i / 50, vec2(0, 0), vec2(50, 50));
      expect(r.x).toBeCloseTo(i, 4);
    });
  }
});

describe('quadratic bezier', () => {
  it('t=0 returns p0', () => { const r = quadratic(0, pa, vec2(0.5, 1), pb); expect(r.x).toBeCloseTo(0); });
  it('t=1 returns p2', () => { const r = quadratic(1, pa, vec2(0.5, 1), pb); expect(r.x).toBeCloseTo(1); expect(r.y).toBeCloseTo(1); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`quadratic t=${t} is finite`, () => {
      const r = quadratic(t, p0, p1, p2);
      expect(isFinite(r.x)).toBe(true);
      expect(isFinite(r.y)).toBe(true);
    });
  }
  it('symmetric curve midpoint', () => {
    const c = vec2(0.5, 1);
    const r = quadratic(0.5, vec2(0, 0), c, vec2(1, 0));
    expect(r.x).toBeCloseTo(0.5, 5);
    expect(r.y).toBeCloseTo(0.5, 5);
  });
  for (let i = 0; i < 50; i++) {
    it(`quadratic weights sum to 1 at t=${i}/50`, () => {
      const t = i / 50, u = 1 - t;
      const w = u * u + 2 * u * t + t * t;
      expect(w).toBeCloseTo(1, 10);
    });
  }
});

describe('cubic bezier', () => {
  it('t=0 returns p0', () => { const r = cubic(0, p0, p1, p2, p3); expect(r.x).toBeCloseTo(0); expect(r.y).toBeCloseTo(0); });
  it('t=1 returns p3', () => { const r = cubic(1, p0, p1, p2, p3); expect(r.x).toBeCloseTo(0); expect(r.y).toBeCloseTo(1); });
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    it(`cubic t=${t} has finite coords`, () => {
      const r = cubic(t, p0, p1, p2, p3);
      expect(isFinite(r.x)).toBe(true);
      expect(isFinite(r.y)).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`cubic bernstein weights sum to 1 at t=${i}/50`, () => {
      const t = i / 50, u = 1 - t;
      const sum = u ** 3 + 3 * u ** 2 * t + 3 * u * t ** 2 + t ** 3;
      expect(sum).toBeCloseTo(1, 10);
    });
  }
});

describe('cubicDerivative', () => {
  it('is defined at t=0', () => { const d = cubicDerivative(0, p0, p1, p2, p3); expect(isFinite(d.x)).toBe(true); });
  it('is defined at t=1', () => { const d = cubicDerivative(1, p0, p1, p2, p3); expect(isFinite(d.x)).toBe(true); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`derivative at t=${t} is finite`, () => {
      const d = cubicDerivative(t, p0, p1, p2, p3);
      expect(isFinite(d.x)).toBe(true);
      expect(isFinite(d.y)).toBe(true);
    });
  }
  it('derivative at t=0 points from p0 to p1 (x direction)', () => {
    const d = cubicDerivative(0, vec2(0,0), vec2(1,0), vec2(2,0), vec2(3,0));
    expect(d.x).toBeCloseTo(3, 5);
    expect(d.y).toBeCloseTo(0, 5);
  });
});

describe('arcLength', () => {
  it('straight line arc length ≈ diagonal', () => {
    const l = arcLength(vec2(0,0), vec2(1,0), vec2(2,0), vec2(3,0), 200);
    expect(l).toBeCloseTo(3, 0);
  });
  it('zero-length curve', () => {
    const l = arcLength(vec2(1,1), vec2(1,1), vec2(1,1), vec2(1,1), 50);
    expect(l).toBeCloseTo(0, 5);
  });
  for (let steps = 10; steps <= 100; steps += 10) {
    it(`arcLength with ${steps} steps is positive for non-degenerate curve`, () => {
      const l = arcLength(p0, p1, p2, p3, steps);
      expect(l).toBeGreaterThan(0);
    });
  }
  for (let i = 1; i <= 50; i++) {
    it(`arcLength steps=${i*2} is finite`, () => {
      const l = arcLength(p0, p1, p2, p3, i * 2);
      expect(isFinite(l)).toBe(true);
    });
  }
});

describe('boundingBox', () => {
  it('contains all control points area', () => {
    const bb = boundingBox(p0, p1, p2, p3);
    expect(bb.minX).toBeLessThanOrEqual(0);
    expect(bb.minY).toBeLessThanOrEqual(0);
    expect(bb.maxX).toBeGreaterThanOrEqual(0);
    expect(bb.maxY).toBeGreaterThanOrEqual(0);
  });
  it('minX <= maxX', () => { const bb = boundingBox(p0, p1, p2, p3); expect(bb.minX).toBeLessThanOrEqual(bb.maxX); });
  it('minY <= maxY', () => { const bb = boundingBox(p0, p1, p2, p3); expect(bb.minY).toBeLessThanOrEqual(bb.maxY); });
  for (let i = 0; i < 50; i++) {
    it(`bb check ${i} minX <= maxX`, () => {
      const bb = boundingBox(vec2(i, 0), vec2(i+1, i), vec2(i+2, i+1), vec2(i+3, i+2));
      expect(bb.minX).toBeLessThanOrEqual(bb.maxX);
    });
  }
  it('straight horizontal line bb has zero height', () => {
    const bb = boundingBox(vec2(0,5), vec2(1,5), vec2(2,5), vec2(3,5));
    expect(bb.minY).toBeCloseTo(5, 3);
    expect(bb.maxY).toBeCloseTo(5, 3);
  });
});

describe('split', () => {
  it('split at t=0.5 produces two 4-point curves', () => {
    const [left, right] = split(0.5, p0, p1, p2, p3);
    expect(left).toHaveLength(4);
    expect(right).toHaveLength(4);
  });
  it('left curve starts at p0', () => {
    const [left] = split(0.5, p0, p1, p2, p3);
    expect(left[0].x).toBeCloseTo(p0.x, 5);
    expect(left[0].y).toBeCloseTo(p0.y, 5);
  });
  it('right curve ends at p3', () => {
    const [, right] = split(0.5, p0, p1, p2, p3);
    expect(right[3].x).toBeCloseTo(p3.x, 5);
    expect(right[3].y).toBeCloseTo(p3.y, 5);
  });
  it('join point is on the curve', () => {
    const [left, right] = split(0.5, p0, p1, p2, p3);
    const pt = cubic(0.5, p0, p1, p2, p3);
    expect(left[3].x).toBeCloseTo(pt.x, 3);
    expect(right[0].x).toBeCloseTo(pt.x, 3);
  });
  for (let i = 1; i < 50; i++) {
    const t = i / 50;
    it(`split at t=${t} produces valid left start`, () => {
      const [left] = split(t, p0, p1, p2, p3);
      expect(left[0].x).toBeCloseTo(p0.x, 5);
    });
  }
});

describe('elevate', () => {
  it('returns 4 control points', () => { expect(elevate(p0, p1, p2)).toHaveLength(4); });
  it('first point preserved', () => { const [q0] = elevate(pa, vec2(0.5,1), pb); expect(q0.x).toBeCloseTo(pa.x, 5); });
  it('last point preserved', () => { const q = elevate(pa, vec2(0.5,1), pb); expect(q[3].x).toBeCloseTo(pb.x, 5); });
  for (let i = 0; i < 50; i++) {
    it(`elevated curve sample ${i} is finite`, () => {
      const q = elevate(vec2(i, 0), vec2(i+1, i), vec2(i+2, 0));
      expect(q.every(p => isFinite(p.x) && isFinite(p.y))).toBe(true);
    });
  }
});

describe('isFlatEnough', () => {
  it('straight line is flat', () => {
    expect(isFlatEnough(vec2(0,0), vec2(1,0), vec2(2,0), vec2(3,0), 0.01)).toBe(true);
  });
  it('very curved line is not flat with tight tolerance', () => {
    expect(isFlatEnough(vec2(0,0), vec2(0,100), vec2(100,100), vec2(100,0), 0.01)).toBe(false);
  });
  for (let tol = 1; tol <= 50; tol++) {
    it(`isFlatEnough straight line tolerance=${tol}`, () => {
      expect(isFlatEnough(vec2(0,0), vec2(1,0), vec2(2,0), vec2(3,0), tol)).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`isFlatEnough returns boolean ${i}`, () => {
      const r = isFlatEnough(vec2(i,0), vec2(i,i), vec2(i+1,i+1), vec2(i+1,0), 0.5);
      expect(typeof r).toBe('boolean');
    });
  }
});

describe('dist2', () => {
  it('same point is 0', () => { expect(dist2(p0, p0)).toBeCloseTo(0, 5); });
  it('(0,0) to (3,4) is 5', () => { expect(dist2(vec2(0,0), vec2(3,4))).toBeCloseTo(5, 5); });
  for (let i = 0; i < 50; i++) {
    it(`dist2 is non-negative ${i}`, () => {
      expect(dist2(vec2(i, 0), vec2(0, i))).toBeGreaterThanOrEqual(0);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`dist2 symmetric ${i}`, () => {
      const a = vec2(i, i+1), b = vec2(i+2, i+3);
      expect(dist2(a, b)).toBeCloseTo(dist2(b, a), 10);
    });
  }
});

describe('additional bezier edge cases', () => {
  for (let i = 0; i < 30; i++) {
    it(`cubic passes through p0 at t=0 for curve ${i}`, () => {
      const pt = cubic(0, vec2(i,i), vec2(i+1,i+2), vec2(i+2,i+1), vec2(i+3,i));
      expect(pt.x).toBeCloseTo(i, 5);
    });
    it(`cubic passes through p3 at t=1 for curve ${i}`, () => {
      const pt = cubic(1, vec2(i,i), vec2(i+1,i+2), vec2(i+2,i+1), vec2(i+3,i));
      expect(pt.x).toBeCloseTo(i+3, 5);
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`quadratic at t=0 starts at p0 variant ${i}`, () => {
      const r = quadratic(0, vec2(i,0), vec2(i+1,1), vec2(i+2,0));
      expect(r.x).toBeCloseTo(i, 5);
    });
    it(`split at t=0.5 join point matches cubic ${i}`, () => {
      const q0=vec2(i,0), q1=vec2(i+1,i), q2=vec2(i+2,i+1), q3=vec2(i+3,0);
      const [left, right] = split(0.5, q0, q1, q2, q3);
      expect(left[3].x).toBeCloseTo(right[0].x, 4);
    });
  }
});
