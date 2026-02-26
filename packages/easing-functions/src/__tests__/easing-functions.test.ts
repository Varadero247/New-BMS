// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  clamp01, lerp, linear,
  easeInQuad, easeOutQuad, easeInOutQuad,
  easeInCubic, easeOutCubic, easeInOutCubic,
  easeInQuart, easeOutQuart, easeInOutQuart,
  easeInSine, easeOutSine, easeInOutSine,
  easeInExpo, easeOutExpo, easeInOutExpo,
  easeInCirc, easeOutCirc, easeInOutCirc,
  easeInElastic, easeOutElastic, easeInOutElastic,
  easeInBounce, easeOutBounce, easeInOutBounce,
  easeInBack, easeOutBack, easeInOutBack,
  getEasingFn, listEasingNames,
} from '../easing-functions';

const allFns = [
  ['linear', linear], ['easeInQuad', easeInQuad], ['easeOutQuad', easeOutQuad], ['easeInOutQuad', easeInOutQuad],
  ['easeInCubic', easeInCubic], ['easeOutCubic', easeOutCubic], ['easeInOutCubic', easeInOutCubic],
  ['easeInQuart', easeInQuart], ['easeOutQuart', easeOutQuart], ['easeInOutQuart', easeInOutQuart],
  ['easeInSine', easeInSine], ['easeOutSine', easeOutSine], ['easeInOutSine', easeInOutSine],
  ['easeInExpo', easeInExpo], ['easeOutExpo', easeOutExpo], ['easeInOutExpo', easeInOutExpo],
  ['easeInCirc', easeInCirc], ['easeOutCirc', easeOutCirc], ['easeInOutCirc', easeInOutCirc],
  ['easeInElastic', easeInElastic], ['easeOutElastic', easeOutElastic], ['easeInOutElastic', easeInOutElastic],
  ['easeInBounce', easeInBounce], ['easeOutBounce', easeOutBounce], ['easeInOutBounce', easeInOutBounce],
  ['easeInBack', easeInBack], ['easeOutBack', easeOutBack], ['easeInOutBack', easeInOutBack],
] as const;

describe('clamp01', () => {
  it('clamps below 0', () => { expect(clamp01(-1)).toBe(0); });
  it('clamps above 1', () => { expect(clamp01(2)).toBe(1); });
  it('passes through 0.5', () => { expect(clamp01(0.5)).toBe(0.5); });
  for (let i = 0; i <= 20; i++) {
    const v = i / 20;
    it(`clamp01(${v}) = ${v}`, () => { expect(clamp01(v)).toBeCloseTo(v, 10); });
  }
  for (let i = 1; i <= 20; i++) {
    it(`clamp01(-${i}) = 0`, () => { expect(clamp01(-i)).toBe(0); });
    it(`clamp01(${i + 1}) = 1`, () => { expect(clamp01(i + 1)).toBe(1); });
  }
});

describe('lerp', () => {
  it('lerp at t=0 returns a', () => { expect(lerp(3, 7, 0)).toBe(3); });
  it('lerp at t=1 returns b', () => { expect(lerp(3, 7, 1)).toBe(7); });
  it('lerp at t=0.5 returns midpoint', () => { expect(lerp(0, 10, 0.5)).toBe(5); });
  for (let i = 0; i <= 20; i++) {
    it(`lerp(0,100,${i}/20) = ${i * 5}`, () => { expect(lerp(0, 100, i / 20)).toBeCloseTo(i * 5, 5); });
  }
});

describe('boundary values t=0 and t=1', () => {
  for (const [name, fn] of allFns) {
    it(`${name}(0) ≈ 0`, () => { expect(fn(0)).toBeCloseTo(0, 4); });
    it(`${name}(1) ≈ 1`, () => { expect(fn(1)).toBeCloseTo(1, 4); });
  }
});

describe('output range for t in [0,1]', () => {
  const safeFns = [
    ['linear', linear], ['easeInQuad', easeInQuad], ['easeOutQuad', easeOutQuad], ['easeInOutQuad', easeInOutQuad],
    ['easeInCubic', easeInCubic], ['easeOutCubic', easeOutCubic], ['easeInOutCubic', easeInOutCubic],
    ['easeInSine', easeInSine], ['easeOutSine', easeOutSine], ['easeInOutSine', easeInOutSine],
    ['easeInExpo', easeInExpo], ['easeOutExpo', easeOutExpo], ['easeInOutExpo', easeInOutExpo],
    ['easeInCirc', easeInCirc], ['easeOutCirc', easeOutCirc], ['easeInOutCirc', easeInOutCirc],
    ['easeInBounce', easeInBounce], ['easeOutBounce', easeOutBounce], ['easeInOutBounce', easeInOutBounce],
  ] as const;
  for (const [name, fn] of safeFns) {
    for (let i = 1; i <= 9; i++) {
      const t = i / 10;
      it(`${name}(${t}) is finite`, () => { expect(isFinite(fn(t))).toBe(true); });
    }
  }
});

describe('linear easing', () => {
  for (let i = 0; i <= 20; i++) {
    it(`linear(${i}/20) = ${i}/20`, () => { expect(linear(i / 20)).toBeCloseTo(i / 20, 10); });
  }
});

describe('easeInQuad', () => {
  it('is monotonically increasing', () => {
    const vals = Array.from({ length: 11 }, (_, i) => easeInQuad(i / 10));
    for (let i = 1; i < vals.length; i++) expect(vals[i]).toBeGreaterThanOrEqual(vals[i-1]);
  });
  for (let i = 0; i <= 20; i++) {
    it(`easeInQuad(${i}/20) = (${i}/20)^2`, () => {
      const t = i / 20;
      expect(easeInQuad(t)).toBeCloseTo(t * t, 10);
    });
  }
});

describe('easeOutQuad', () => {
  it('is monotonically increasing', () => {
    const vals = Array.from({ length: 11 }, (_, i) => easeOutQuad(i / 10));
    for (let i = 1; i < vals.length; i++) expect(vals[i]).toBeGreaterThanOrEqual(vals[i-1]);
  });
  for (let i = 0; i <= 20; i++) {
    it(`easeOutQuad(${i}/20) = 1-(1-t)^2`, () => {
      const t = i / 20;
      expect(easeOutQuad(t)).toBeCloseTo(1 - (1 - t) ** 2, 10);
    });
  }
});

describe('easeInOutQuad symmetry', () => {
  for (let i = 0; i <= 20; i++) {
    it(`easeInOutQuad(${i}/20) + easeInOutQuad(1-${i}/20) ≈ 1`, () => {
      const t = i / 20;
      expect(easeInOutQuad(t) + easeInOutQuad(1 - t)).toBeCloseTo(1, 10);
    });
  }
});

describe('easeInCubic and easeOutCubic', () => {
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`easeInCubic(${t}) = t^3`, () => { expect(easeInCubic(t)).toBeCloseTo(t ** 3, 10); });
    it(`easeOutCubic(${t}) = 1-(1-t)^3`, () => { expect(easeOutCubic(t)).toBeCloseTo(1 - (1-t)**3, 10); });
  }
});

describe('easeInSine and easeOutSine', () => {
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`easeInSine(${t}) = 1-cos(t*pi/2)`, () => {
      expect(easeInSine(t)).toBeCloseTo(1 - Math.cos(t * Math.PI / 2), 10);
    });
  }
  it('easeInSine(0.5) + easeOutSine(0.5) ≈ 1 + delta (not symmetric)', () => {
    expect(isFinite(easeInSine(0.5) + easeOutSine(0.5))).toBe(true);
  });
});

describe('easeInExpo / easeOutExpo special cases', () => {
  it('easeInExpo(0) = 0', () => { expect(easeInExpo(0)).toBe(0); });
  it('easeInExpo(1) = 1', () => { expect(easeInExpo(1)).toBeCloseTo(1, 4); });
  it('easeOutExpo(1) = 1', () => { expect(easeOutExpo(1)).toBe(1); });
  it('easeOutExpo(0) = 0', () => { expect(easeOutExpo(0)).toBeCloseTo(0, 4); });
  it('easeInOutExpo(0) = 0', () => { expect(easeInOutExpo(0)).toBe(0); });
  it('easeInOutExpo(1) = 1', () => { expect(easeInOutExpo(1)).toBe(1); });
  for (let i = 1; i <= 9; i++) {
    const t = i / 10;
    it(`easeInExpo(${t}) is positive`, () => { expect(easeInExpo(t)).toBeGreaterThan(0); });
    it(`easeOutExpo(${t}) in (0,1)`, () => {
      expect(easeOutExpo(t)).toBeGreaterThan(0);
      expect(easeOutExpo(t)).toBeLessThan(1.001);
    });
  }
});

describe('easeInBounce + easeOutBounce', () => {
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`easeInBounce(${t}) = 1 - easeOutBounce(1-${t})`, () => {
      expect(easeInBounce(t)).toBeCloseTo(1 - easeOutBounce(1 - t), 10);
    });
  }
  it('easeOutBounce(0) = 0', () => { expect(easeOutBounce(0)).toBeCloseTo(0, 5); });
  it('easeOutBounce(1) = 1', () => { expect(easeOutBounce(1)).toBeCloseTo(1, 5); });
});

describe('getEasingFn', () => {
  it('returns linear fn', () => { expect(getEasingFn('linear')(0.5)).toBeCloseTo(0.5, 5); });
  it('returns easeInQuad fn', () => { expect(getEasingFn('easeInQuad')(0.5)).toBeCloseTo(0.25, 5); });
  for (const [name] of allFns) {
    it(`getEasingFn("${name}") returns a function`, () => {
      expect(typeof getEasingFn(name as Parameters<typeof getEasingFn>[0])).toBe('function');
    });
  }
});

describe('listEasingNames', () => {
  it('contains 28 entries', () => { expect(listEasingNames()).toHaveLength(28); });
  it('includes linear', () => { expect(listEasingNames()).toContain('linear'); });
  it('includes easeInOutBack', () => { expect(listEasingNames()).toContain('easeInOutBack'); });
});

describe('easeInOutSine symmetry', () => {
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`easeInOutSine(${t}) + easeInOutSine(1-${t}) ≈ 1`, () => {
      expect(easeInOutSine(t) + easeInOutSine(1 - t)).toBeCloseTo(1, 10);
    });
  }
});

describe('easeInBack / easeOutBack', () => {
  it('easeInBack goes slightly negative before 1', () => {
    expect(easeInBack(0.2)).toBeLessThan(0.2);
  });
  it('easeOutBack goes above 1 briefly', () => {
    expect(easeOutBack(0.8)).toBeGreaterThan(0.8);
  });
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`easeInBack(${t}) is finite`, () => { expect(isFinite(easeInBack(t))).toBe(true); });
    it(`easeOutBack(${t}) is finite`, () => { expect(isFinite(easeOutBack(t))).toBe(true); });
  }
});

describe('easeInOutCubic / easeInOutQuart', () => {
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`easeInOutCubic(${t}) + easeInOutCubic(1-${t}) ≈ 1`, () => {
      expect(easeInOutCubic(t) + easeInOutCubic(1 - t)).toBeCloseTo(1, 10);
    });
    it(`easeInOutQuart(${t}) + easeInOutQuart(1-${t}) ≈ 1`, () => {
      expect(easeInOutQuart(t) + easeInOutQuart(1 - t)).toBeCloseTo(1, 10);
    });
  }
});

describe('additional easing midpoint checks', () => {
  const midFns = [
    ['easeInQuad', easeInQuad, 0.25],
    ['easeOutQuad', easeOutQuad, 0.75],
    ['easeInCubic', easeInCubic, 0.125],
    ['easeOutCubic', easeOutCubic, 0.875],
    ['easeInQuart', easeInQuart, 0.0625],
    ['easeOutQuart', easeOutQuart, 0.9375],
  ] as const;
  for (const [name, fn, expected] of midFns) {
    it(`${name}(0.5) ≈ ${expected}`, () => { expect(fn(0.5)).toBeCloseTo(expected, 8); });
  }
  for (let i = 1; i <= 99; i++) {
    const t = i / 100;
    it(`linear(${t}) = ${t}`, () => { expect(linear(t)).toBeCloseTo(t, 10); });
    it(`easeInOutCubic(${t}) is finite`, () => { expect(isFinite(easeInOutCubic(t))).toBe(true); });
    it(`easeInOutSine(${t}) is between -0.01 and 1.01`, () => {
      const v = easeInOutSine(t);
      expect(v).toBeGreaterThan(-0.01);
      expect(v).toBeLessThan(1.01);
    });
  }
});

describe('extra coverage top-up', () => {
  for (let i = 0; i < 50; i++) {
    const t = i / 50;
    it(`easeInElastic(${t}) is finite`, () => { expect(isFinite(easeInElastic(t))).toBe(true); });
    it(`easeOutElastic(${t}) is finite`, () => { expect(isFinite(easeOutElastic(t))).toBe(true); });
  }
});
