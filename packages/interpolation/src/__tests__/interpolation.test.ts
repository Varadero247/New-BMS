// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { linear, bilinear, cosine, cubic, hermite, smoothstep, smootherstep, inverseLerp, remap, clamp, nearestNeighbor, multiPoint, lerpAngle, lagrange, splinePoint } from '../interpolation';

describe('linear', () => {
  it('t=0 returns a', () => { expect(linear(0, 10, 0)).toBe(0); });
  it('t=1 returns b', () => { expect(linear(0, 10, 1)).toBe(10); });
  it('t=0.5 returns midpoint', () => { expect(linear(0, 10, 0.5)).toBe(5); });
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    it(`linear(0,100,${t}) = ${i}`, () => { expect(linear(0, 100, t)).toBeCloseTo(i, 8); });
  }
});

describe('bilinear', () => {
  it('all corners equal = constant', () => { expect(bilinear(5, 5, 5, 5, 0.5, 0.5)).toBe(5); });
  it('tx=0,ty=0 returns q00', () => { expect(bilinear(1, 2, 3, 4, 0, 0)).toBe(1); });
  it('tx=1,ty=0 returns q10', () => { expect(bilinear(1, 2, 3, 4, 1, 0)).toBe(2); });
  it('tx=0,ty=1 returns q01', () => { expect(bilinear(1, 2, 3, 4, 0, 1)).toBe(3); });
  it('tx=1,ty=1 returns q11', () => { expect(bilinear(1, 2, 3, 4, 1, 1)).toBe(4); });
  for (let i = 0; i <= 50; i++) {
    const tx = i / 50, ty = i / 50;
    it(`bilinear(0,1,0,1,${tx},${ty}) is between 0 and 1`, () => {
      const v = bilinear(0, 1, 0, 1, tx, ty);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  }
  for (let i = 0; i <= 50; i++) {
    const tx = i / 50;
    it(`bilinear(0,10,0,10,${tx},0) = linear(0,10,${tx})`, () => {
      expect(bilinear(0, 10, 0, 10, tx, 0)).toBeCloseTo(linear(0, 10, tx), 10);
    });
  }
});

describe('cosine', () => {
  it('t=0 returns a', () => { expect(cosine(0, 10, 0)).toBeCloseTo(0, 8); });
  it('t=1 returns b', () => { expect(cosine(0, 10, 1)).toBeCloseTo(10, 8); });
  it('t=0.5 returns midpoint', () => { expect(cosine(0, 10, 0.5)).toBeCloseTo(5, 8); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`cosine(0,1,${t}) in [0,1]`, () => {
      const v = cosine(0, 1, t);
      expect(v).toBeGreaterThanOrEqual(-0.001);
      expect(v).toBeLessThanOrEqual(1.001);
    });
  }
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`cosine is finite at t=${t}`, () => { expect(isFinite(cosine(5, 15, t))).toBe(true); });
  }
});

describe('cubic', () => {
  it('t=0 returns y1', () => { expect(cubic(0, 1, 2, 3, 0)).toBeCloseTo(1, 8); });
  it('t=1 returns y2', () => { expect(cubic(0, 1, 2, 3, 1)).toBeCloseTo(2, 8); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`cubic is finite at t=${t}`, () => { expect(isFinite(cubic(0, 1, 2, 3, t))).toBe(true); });
  }
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`cubic with equal points is constant ${i}`, () => {
      expect(cubic(5, 5, 5, 5, t)).toBeCloseTo(5, 8);
    });
  }
});

describe('hermite', () => {
  it('t=0 returns y0', () => { expect(hermite(0, 1, 0, 0, 0)).toBeCloseTo(0, 8); });
  it('t=1 returns y1', () => { expect(hermite(0, 1, 0, 0, 1)).toBeCloseTo(1, 8); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`hermite is finite at t=${t}`, () => { expect(isFinite(hermite(0, 1, 0, 0, t))).toBe(true); });
  }
});

describe('smoothstep', () => {
  it('t<=a returns 0', () => { expect(smoothstep(0, 1, 0)).toBeCloseTo(0, 8); });
  it('t>=b returns 1', () => { expect(smoothstep(0, 1, 1)).toBeCloseTo(1, 8); });
  it('t=0.5 (midpoint of [0,1]) returns 0.5', () => { expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5, 8); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`smoothstep(0,1,${t}) in [0,1]`, () => {
      const v = smoothstep(0, 1, t);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  }
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`smoothstep(0,1,${t}) + smoothstep(0,1,1-${t}) = 1`, () => {
      expect(smoothstep(0, 1, t) + smoothstep(0, 1, 1 - t)).toBeCloseTo(1, 8);
    });
  }
});

describe('smootherstep', () => {
  it('t=0 returns 0', () => { expect(smootherstep(0, 1, 0)).toBeCloseTo(0, 8); });
  it('t=1 returns 1', () => { expect(smootherstep(0, 1, 1)).toBeCloseTo(1, 8); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`smootherstep(0,1,${t}) in [0,1]`, () => {
      const v = smootherstep(0, 1, t);
      expect(v).toBeGreaterThanOrEqual(-0.001);
      expect(v).toBeLessThanOrEqual(1.001);
    });
  }
});

describe('inverseLerp', () => {
  it('inverseLerp(0,10,0) = 0', () => { expect(inverseLerp(0, 10, 0)).toBe(0); });
  it('inverseLerp(0,10,10) = 1', () => { expect(inverseLerp(0, 10, 10)).toBe(1); });
  it('inverseLerp(0,10,5) = 0.5', () => { expect(inverseLerp(0, 10, 5)).toBe(0.5); });
  it('same a and b returns 0', () => { expect(inverseLerp(5, 5, 5)).toBe(0); });
  for (let i = 0; i <= 50; i++) {
    it(`inverseLerp(0,50,${i}) = ${i}/50`, () => {
      expect(inverseLerp(0, 50, i)).toBeCloseTo(i / 50, 10);
    });
  }
  for (let i = 0; i <= 50; i++) {
    it(`linear + inverseLerp roundtrip ${i}`, () => {
      const t = i / 50;
      const v = linear(0, 100, t);
      expect(inverseLerp(0, 100, v)).toBeCloseTo(t, 10);
    });
  }
});

describe('remap', () => {
  it('remap(5, 0,10, 0,100) = 50', () => { expect(remap(5, 0, 10, 0, 100)).toBeCloseTo(50, 8); });
  it('remap(0, 0,10, 0,100) = 0', () => { expect(remap(0, 0, 10, 0, 100)).toBeCloseTo(0, 8); });
  it('remap(10, 0,10, 0,100) = 100', () => { expect(remap(10, 0, 10, 0, 100)).toBeCloseTo(100, 8); });
  for (let i = 0; i <= 50; i++) {
    it(`remap(${i},0,50,0,100)=${i*2}`, () => {
      expect(remap(i, 0, 50, 0, 100)).toBeCloseTo(i * 2, 8);
    });
  }
});

describe('clamp', () => {
  it('clamps below min', () => { expect(clamp(-5, 0, 10)).toBe(0); });
  it('clamps above max', () => { expect(clamp(15, 0, 10)).toBe(10); });
  it('passes value in range', () => { expect(clamp(5, 0, 10)).toBe(5); });
  for (let i = 0; i <= 50; i++) {
    it(`clamp(${i-10},0,40)`, () => {
      const v = clamp(i - 10, 0, 40);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(40);
    });
  }
});

describe('nearestNeighbor', () => {
  it('t<0.5 returns a', () => { expect(nearestNeighbor(10, 20, 0.4)).toBe(10); });
  it('t>=0.5 returns b', () => { expect(nearestNeighbor(10, 20, 0.5)).toBe(20); });
  for (let i = 0; i < 50; i++) {
    const t = i / 100;
    it(`nearestNeighbor t=${t} < 0.5 returns first`, () => { expect(nearestNeighbor(1, 2, t)).toBe(1); });
  }
  for (let i = 50; i <= 100; i++) {
    const t = i / 100;
    it(`nearestNeighbor t=${t} >= 0.5 returns second`, () => { expect(nearestNeighbor(1, 2, t)).toBe(2); });
  }
});

describe('multiPoint', () => {
  it('empty returns 0', () => { expect(multiPoint([], 0.5)).toBe(0); });
  it('single element returns that element', () => { expect(multiPoint([42], 0.5)).toBe(42); });
  it('t=0 returns first point', () => { expect(multiPoint([1, 2, 3], 0)).toBe(1); });
  it('t=1 returns last point', () => { expect(multiPoint([1, 2, 3], 1)).toBeCloseTo(3, 8); });
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`multiPoint([0,10,20], ${t}) is monotone`, () => {
      const v = multiPoint([0, 10, 20], t);
      expect(v).toBeGreaterThanOrEqual(-0.001);
      expect(v).toBeLessThanOrEqual(20.001);
    });
  }
});

describe('lerpAngle', () => {
  it('lerpAngle(0, π, 0) = 0', () => { expect(lerpAngle(0, Math.PI, 0)).toBeCloseTo(0, 8); });
  it('lerpAngle(0, π, 1) = π', () => { expect(lerpAngle(0, Math.PI, 1)).toBeCloseTo(Math.PI, 8); });
  it('lerpAngle(0, π, 0.5) = π/2', () => { expect(lerpAngle(0, Math.PI, 0.5)).toBeCloseTo(Math.PI / 2, 8); });
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`lerpAngle finite at t=${t}`, () => { expect(isFinite(lerpAngle(0, Math.PI, t))).toBe(true); });
  }
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`lerpAngle wrap-around finite at t=${t}`, () => {
      expect(isFinite(lerpAngle(3, -3, t))).toBe(true);
    });
  }
});

describe('lagrange', () => {
  it('interpolates through known points', () => {
    const xs = [0, 1, 2], ys = [0, 1, 4];
    expect(lagrange(xs, ys, 0)).toBeCloseTo(0, 6);
    expect(lagrange(xs, ys, 1)).toBeCloseTo(1, 6);
    expect(lagrange(xs, ys, 2)).toBeCloseTo(4, 6);
  });
  it('single point returns its value', () => {
    expect(lagrange([3], [7], 3)).toBeCloseTo(7, 8);
  });
  for (let i = 0; i <= 20; i++) {
    it(`lagrange through linear points is linear ${i}`, () => {
      const xs = [0, 1, 2, 3];
      const ys = [0, 1, 2, 3];
      expect(lagrange(xs, ys, i / 10)).toBeCloseTo(i / 10, 5);
    });
  }
});

describe('splinePoint', () => {
  it('t=0 returns p1', () => { expect(splinePoint(0, 1, 2, 3, 0)).toBeCloseTo(1, 8); });
  it('t=1 returns p2', () => { expect(splinePoint(0, 1, 2, 3, 1)).toBeCloseTo(2, 8); });
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`splinePoint is finite at t=${t}`, () => {
      expect(isFinite(splinePoint(0, 1, 2, 3, t))).toBe(true);
    });
  }
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`splinePoint constant points returns that value ${i}`, () => {
      expect(splinePoint(5, 5, 5, 5, t)).toBeCloseTo(5, 8);
    });
  }
});
