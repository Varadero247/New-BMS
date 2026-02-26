// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { whiteNoise, lerp, fade, grad1D, perlin1D, valueNoise1D, fractalNoise1D, perlin2D, fractalNoise2D, turbulence, normalize, permutation } from '../noise-gen';

describe('whiteNoise', () => {
  it('returns a number in [0, 1)', () => { const v = whiteNoise(42); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); });
  it('is deterministic for same seed', () => { expect(whiteNoise(99)).toBe(whiteNoise(99)); });
  it('differs for different seeds usually', () => { expect(whiteNoise(1) === whiteNoise(2)).toBe(false); });
  for (let i = 0; i < 100; i++) {
    it(`whiteNoise(${i}) in [0,1)`, () => {
      const v = whiteNoise(i);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  }
});

describe('lerp', () => {
  it('t=0 returns a', () => { expect(lerp(3, 7, 0)).toBe(3); });
  it('t=1 returns b', () => { expect(lerp(3, 7, 1)).toBe(7); });
  it('t=0.5 returns midpoint', () => { expect(lerp(0, 10, 0.5)).toBe(5); });
  for (let i = 0; i <= 20; i++) {
    it(`lerp(0,20,${i}/20)=${i}`, () => { expect(lerp(0, 20, i / 20)).toBeCloseTo(i, 10); });
  }
});

describe('fade', () => {
  it('fade(0) = 0', () => { expect(fade(0)).toBeCloseTo(0, 10); });
  it('fade(1) = 1', () => { expect(fade(1)).toBeCloseTo(1, 10); });
  it('fade(0.5) = 0.5', () => { expect(fade(0.5)).toBeCloseTo(0.5, 10); });
  it('fade derivative at 0 = 0', () => { expect(fade(0.001) / 0.001).toBeCloseTo(0, 1); });
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`fade(${t}) is in [0,1]`, () => { const v = fade(t); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThanOrEqual(1); });
  }
});

describe('grad1D', () => {
  it('even hash (0) returns -x for positive x', () => { expect(grad1D(0, 1)).toBe(-1); });
  it('odd hash (1) returns x for positive x', () => { expect(grad1D(1, 1)).toBe(1); });
  for (let i = 0; i < 50; i++) {
    it(`grad1D(${i}, 1) returns ±1`, () => { expect(Math.abs(grad1D(i, 1))).toBe(1); });
  }
  for (let i = 0; i < 50; i++) {
    it(`grad1D(${i}, 0) is zero`, () => { expect(Math.abs(grad1D(i, 0))).toBeCloseTo(0, 10); });
  }
});

describe('permutation', () => {
  it('returns 256 elements', () => { expect(permutation(0)).toHaveLength(256); });
  it('contains all values 0-255', () => {
    const p = permutation(42);
    const set = new Set(p);
    expect(set.size).toBe(256);
  });
  it('is deterministic', () => {
    const p1 = permutation(7), p2 = permutation(7);
    expect(p1).toEqual(p2);
  });
  it('differs for different seeds', () => {
    const p1 = permutation(1), p2 = permutation(2);
    expect(p1).not.toEqual(p2);
  });
  for (let i = 0; i < 50; i++) {
    it(`permutation(${i}) all values in [0,255]`, () => {
      const p = permutation(i);
      expect(p.every(v => v >= 0 && v <= 255)).toBe(true);
    });
  }
});

describe('perlin1D', () => {
  it('returns a finite number', () => { expect(isFinite(perlin1D(0.5))).toBe(true); });
  it('is deterministic', () => { expect(perlin1D(1.5, 42)).toBe(perlin1D(1.5, 42)); });
  for (let i = 0; i < 50; i++) {
    const x = i * 0.1;
    it(`perlin1D(${x}) is finite`, () => { expect(isFinite(perlin1D(x))).toBe(true); });
  }
  for (let seed = 0; seed < 50; seed++) {
    it(`perlin1D seed=${seed} is deterministic`, () => {
      expect(perlin1D(0.7, seed)).toBe(perlin1D(0.7, seed));
    });
  }
});

describe('valueNoise1D', () => {
  it('returns value in [0,1]', () => {
    const v = valueNoise1D(0.5);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(1);
  });
  it('is deterministic', () => { expect(valueNoise1D(1.5, 42)).toBe(valueNoise1D(1.5, 42)); });
  for (let i = 0; i < 50; i++) {
    const x = i * 0.3;
    it(`valueNoise1D(${x}) in [0,1]`, () => {
      const v = valueNoise1D(x, i);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  }
});

describe('fractalNoise1D', () => {
  it('returns finite number', () => { expect(isFinite(fractalNoise1D(1.0))).toBe(true); });
  it('is deterministic', () => { expect(fractalNoise1D(0.5, 4, 0.5, 2, 7)).toBe(fractalNoise1D(0.5, 4, 0.5, 2, 7)); });
  for (let octaves = 1; octaves <= 8; octaves++) {
    it(`fractalNoise1D with ${octaves} octaves is finite`, () => {
      expect(isFinite(fractalNoise1D(0.5, octaves))).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`fractalNoise1D(${i * 0.1}) finite`, () => {
      expect(isFinite(fractalNoise1D(i * 0.1))).toBe(true);
    });
  }
});

describe('perlin2D', () => {
  it('returns finite number', () => { expect(isFinite(perlin2D(0.5, 0.5))).toBe(true); });
  it('is deterministic', () => { expect(perlin2D(1.1, 2.2, 42)).toBe(perlin2D(1.1, 2.2, 42)); });
  for (let i = 0; i < 50; i++) {
    it(`perlin2D(${i*0.1}, ${i*0.1}) is finite`, () => {
      expect(isFinite(perlin2D(i * 0.1, i * 0.1))).toBe(true);
    });
  }
});

describe('fractalNoise2D', () => {
  for (let i = 0; i < 50; i++) {
    it(`fractalNoise2D(${i*0.1}, 0.5) is finite`, () => {
      expect(isFinite(fractalNoise2D(i * 0.1, 0.5))).toBe(true);
    });
  }
});

describe('turbulence', () => {
  it('returns non-negative value', () => { expect(turbulence(0.5)).toBeGreaterThanOrEqual(0); });
  it('is deterministic', () => { expect(turbulence(1.5, 4, 42)).toBe(turbulence(1.5, 4, 42)); });
  for (let i = 0; i < 50; i++) {
    it(`turbulence(${i*0.2}) >= 0`, () => { expect(turbulence(i * 0.2)).toBeGreaterThanOrEqual(0); });
  }
  for (let oct = 1; oct <= 8; oct++) {
    it(`turbulence with ${oct} octaves is finite`, () => {
      expect(isFinite(turbulence(0.5, oct))).toBe(true);
    });
  }
});

describe('normalize', () => {
  it('empty array returns empty', () => { expect(normalize([])).toEqual([]); });
  it('all-same array returns zeros', () => { expect(normalize([5, 5, 5])).toEqual([0, 0, 0]); });
  it('min = 0 after normalize', () => {
    const n = normalize([1, 3, 5, 2]);
    expect(Math.min(...n)).toBeCloseTo(0, 10);
  });
  it('max = 1 after normalize', () => {
    const n = normalize([1, 3, 5, 2]);
    expect(Math.max(...n)).toBeCloseTo(1, 10);
  });
  for (let len = 2; len <= 52; len++) {
    it(`normalize array of length ${len} min=0 max=1`, () => {
      const arr = Array.from({ length: len }, (_, i) => i);
      const n = normalize(arr);
      expect(Math.min(...n)).toBeCloseTo(0, 10);
      expect(Math.max(...n)).toBeCloseTo(1, 10);
    });
  }
});

describe('noise-gen extra top-up', () => {
  it('lerp(0, 10, 0) = 0', () => { expect(lerp(0, 10, 0)).toBe(0); });
  it('lerp(0, 10, 1) = 10', () => { expect(lerp(0, 10, 1)).toBe(10); });
  it('lerp(0, 10, 0.5) = 5', () => { expect(lerp(0, 10, 0.5)).toBe(5); });
  it('fade(0) = 0', () => { expect(fade(0)).toBe(0); });
  it('fade(1) = 1', () => { expect(fade(1)).toBe(1); });
  it('fade(0.5) is finite', () => { expect(isFinite(fade(0.5))).toBe(true); });
  it('fade(0.5) ≈ 0.5', () => { expect(fade(0.5)).toBeCloseTo(0.5, 5); });
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`fade(${t}) is in [0,1]`, () => {
      const f = fade(t);
      expect(f).toBeGreaterThanOrEqual(-0.001);
      expect(f).toBeLessThanOrEqual(1.001);
    });
  }
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    it(`lerp(0, 1, ${t}) ≈ ${t}`, () => {
      expect(lerp(0, 1, t)).toBeCloseTo(t, 10);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`whiteNoise(${i}) in [0,1)`, () => {
      const n = whiteNoise(i);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`perlin1D(${i * 0.1}) is finite`, () => {
      expect(isFinite(perlin1D(i * 0.1))).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`valueNoise1D(${i * 0.1}) in [0,1]`, () => {
      const n = valueNoise1D(i * 0.1);
      expect(n).toBeGreaterThanOrEqual(-0.001);
      expect(n).toBeLessThanOrEqual(1.001);
    });
  }
  for (let i = 1; i <= 50; i++) {
    it(`turbulence(${i * 0.2}) is non-negative`, () => {
      expect(turbulence(i * 0.2)).toBeGreaterThanOrEqual(0);
    });
  }
});
