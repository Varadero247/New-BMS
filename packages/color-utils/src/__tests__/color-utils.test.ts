// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  clamp,
  parseHex,
  toHex,
  rgbToHsl,
  hslToRgb,
  luminance,
  contrastRatio,
  isAccessible,
  lighten,
  darken,
  mix,
  complementary,
  triadic,
  analogous,
  isLight,
} from '../color-utils';

// ---------------------------------------------------------------------------
// clamp
// ---------------------------------------------------------------------------
describe('clamp', () => {
  it('clamps below min', () => { expect(clamp(-5, 0, 100)).toBe(0); });
  it('clamps above max', () => { expect(clamp(200, 0, 100)).toBe(100); });
  it('returns value within range', () => { expect(clamp(50, 0, 100)).toBe(50); });
  it('returns min when equal to min', () => { expect(clamp(0, 0, 100)).toBe(0); });
  it('returns max when equal to max', () => { expect(clamp(100, 0, 100)).toBe(100); });
  it('works with negative range', () => { expect(clamp(-10, -20, -5)).toBe(-10); });
  it('clamps negative below min', () => { expect(clamp(-30, -20, -5)).toBe(-20); });
  it('clamps negative above max', () => { expect(clamp(0, -20, -5)).toBe(-5); });
  it('works with float values', () => { expect(clamp(0.3, 0, 1)).toBeCloseTo(0.3); });
  it('clamps float below min', () => { expect(clamp(-0.1, 0, 1)).toBe(0); });
  it('clamps float above max', () => { expect(clamp(1.1, 0, 1)).toBe(1); });
  for (let i = 0; i < 50; i++) {
    it(`clamp iteration ${i}: value within [0,255]`, () => {
      const v = (i * 13) % 400 - 50;
      const result = clamp(v, 0, 255);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(255);
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`clamp iteration ${i}: value equals itself when in range`, () => {
      const v = i * 5;
      expect(clamp(v, 0, 200)).toBe(v <= 200 ? v : 200);
    });
  }
});

// ---------------------------------------------------------------------------
// parseHex
// ---------------------------------------------------------------------------
describe('parseHex', () => {
  it('parses #000000', () => { expect(parseHex('#000000')).toEqual([0, 0, 0]); });
  it('parses #ffffff', () => { expect(parseHex('#ffffff')).toEqual([255, 255, 255]); });
  it('parses #ff0000 red', () => { expect(parseHex('#ff0000')).toEqual([255, 0, 0]); });
  it('parses #00ff00 green', () => { expect(parseHex('#00ff00')).toEqual([0, 255, 0]); });
  it('parses #0000ff blue', () => { expect(parseHex('#0000ff')).toEqual([0, 0, 255]); });
  it('parses #ffff00 yellow', () => { expect(parseHex('#ffff00')).toEqual([255, 255, 0]); });
  it('parses #ff00ff magenta', () => { expect(parseHex('#ff00ff')).toEqual([255, 0, 255]); });
  it('parses #00ffff cyan', () => { expect(parseHex('#00ffff')).toEqual([0, 255, 255]); });
  it('parses #808080 mid-grey', () => { expect(parseHex('#808080')).toEqual([128, 128, 128]); });
  it('parses #c0c0c0 silver', () => { expect(parseHex('#c0c0c0')).toEqual([192, 192, 192]); });
  it('parses #800000 maroon', () => { expect(parseHex('#800000')).toEqual([128, 0, 0]); });
  it('parses #008000 dark green', () => { expect(parseHex('#008000')).toEqual([0, 128, 0]); });
  it('parses #000080 navy', () => { expect(parseHex('#000080')).toEqual([0, 0, 128]); });
  it('parses uppercase #FF0000', () => { expect(parseHex('#FF0000')).toEqual([255, 0, 0]); });
  it('parses uppercase #FFFFFF', () => { expect(parseHex('#FFFFFF')).toEqual([255, 255, 255]); });
  it('returns array of length 3', () => { expect(parseHex('#aabbcc').length).toBe(3); });
  it('returns numbers in 0-255 range', () => {
    const [r, g, b] = parseHex('#7f3f1f');
    expect(r).toBeGreaterThanOrEqual(0); expect(r).toBeLessThanOrEqual(255);
    expect(g).toBeGreaterThanOrEqual(0); expect(g).toBeLessThanOrEqual(255);
    expect(b).toBeGreaterThanOrEqual(0); expect(b).toBeLessThanOrEqual(255);
  });
  for (let i = 0; i < 100; i++) {
    it(`parseHex round-trip ${i}`, () => {
      const r = (i * 7) % 256, g = (i * 11) % 256, b = (i * 13) % 256;
      const hex = toHex(r, g, b);
      const [pr, pg, pb] = parseHex(hex);
      expect(pr).toBe(r);
      expect(pg).toBe(g);
      expect(pb).toBe(b);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`parseHex channel isolation r=${i*5}`, () => {
      const r = (i * 5) % 256;
      const [pr] = parseHex(toHex(r, 0, 0));
      expect(pr).toBe(r);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`parseHex channel isolation g=${i*5}`, () => {
      const g = (i * 5) % 256;
      const [, pg] = parseHex(toHex(0, g, 0));
      expect(pg).toBe(g);
    });
  }
});

// ---------------------------------------------------------------------------
// toHex
// ---------------------------------------------------------------------------
describe('toHex', () => {
  it('returns #000000 for black', () => { expect(toHex(0, 0, 0)).toBe('#000000'); });
  it('returns #ffffff for white', () => { expect(toHex(255, 255, 255)).toBe('#ffffff'); });
  it('returns #ff0000 for red', () => { expect(toHex(255, 0, 0)).toBe('#ff0000'); });
  it('returns #00ff00 for green', () => { expect(toHex(0, 255, 0)).toBe('#00ff00'); });
  it('returns #0000ff for blue', () => { expect(toHex(0, 0, 255)).toBe('#0000ff'); });
  it('starts with #', () => { expect(toHex(100, 150, 200).startsWith('#')).toBe(true); });
  it('has length 7', () => { expect(toHex(100, 150, 200).length).toBe(7); });
  it('pads single digit channels with zero', () => { expect(toHex(0, 0, 15)).toBe('#00000f'); });
  it('handles 128 grey', () => { expect(toHex(128, 128, 128)).toBe('#808080'); });
  it('clamps values above 255', () => { expect(toHex(300, 0, 0)).toBe('#ff0000'); });
  it('clamps values below 0', () => { expect(toHex(-10, 0, 0)).toBe('#000000'); });
  it('rounds fractional values', () => { expect(toHex(127.6, 0, 0)).toBe('#800000'); });
  it('returns lowercase hex', () => { expect(toHex(171, 205, 239)).toMatch(/^#[0-9a-f]{6}$/); });
  for (let i = 0; i < 100; i++) {
    it(`toHex format check ${i}`, () => {
      const r = (i * 3) % 256, g = (i * 5) % 256, b = (i * 7) % 256;
      const hex = toHex(r, g, b);
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`toHex deterministic ${i}`, () => {
      const r = (i * 17) % 256, g = (i * 31) % 256, b = (i * 47) % 256;
      expect(toHex(r, g, b)).toBe(toHex(r, g, b));
    });
  }
});

// ---------------------------------------------------------------------------
// rgbToHsl
// ---------------------------------------------------------------------------
describe('rgbToHsl', () => {
  it('black => [0, 0, 0]', () => { expect(rgbToHsl(0, 0, 0)).toEqual([0, 0, 0]); });
  it('white => [0, 0, 100]', () => { expect(rgbToHsl(255, 255, 255)).toEqual([0, 0, 100]); });
  it('red => [0, 100, 50]', () => { expect(rgbToHsl(255, 0, 0)).toEqual([0, 100, 50]); });
  it('green => [120, 100, 50]', () => { expect(rgbToHsl(0, 255, 0)).toEqual([120, 100, 50]); });
  it('blue => [240, 100, 50]', () => { expect(rgbToHsl(0, 0, 255)).toEqual([240, 100, 50]); });
  it('yellow => [60, 100, 50]', () => { expect(rgbToHsl(255, 255, 0)).toEqual([60, 100, 50]); });
  it('cyan => [180, 100, 50]', () => { expect(rgbToHsl(0, 255, 255)).toEqual([180, 100, 50]); });
  it('magenta => [300, 100, 50]', () => { expect(rgbToHsl(255, 0, 255)).toEqual([300, 100, 50]); });
  it('grey returns s=0', () => { expect(rgbToHsl(128, 128, 128)[1]).toBe(0); });
  it('returns h in [0,360]', () => {
    const [h] = rgbToHsl(123, 45, 67);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(360);
  });
  it('returns s in [0,100]', () => {
    const [, s] = rgbToHsl(123, 45, 67);
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(100);
  });
  it('returns l in [0,100]', () => {
    const [,, l] = rgbToHsl(123, 45, 67);
    expect(l).toBeGreaterThanOrEqual(0);
    expect(l).toBeLessThanOrEqual(100);
  });
  for (let i = 0; i < 100; i++) {
    it(`rgbToHsl h in range ${i}`, () => {
      const r = (i * 7) % 256, g = (i * 11) % 256, b = (i * 13) % 256;
      const [h, s, l] = rgbToHsl(r, g, b);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(360);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
      expect(l).toBeGreaterThanOrEqual(0);
      expect(l).toBeLessThanOrEqual(100);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`rgbToHsl grey has s=0 iteration ${i}`, () => {
      const v = (i * 5) % 256;
      const [, s] = rgbToHsl(v, v, v);
      expect(s).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// hslToRgb
// ---------------------------------------------------------------------------
describe('hslToRgb', () => {
  it('black [0,0,0] => [0,0,0]', () => { expect(hslToRgb(0, 0, 0)).toEqual([0, 0, 0]); });
  it('white [0,0,100] => [255,255,255]', () => { expect(hslToRgb(0, 0, 100)).toEqual([255, 255, 255]); });
  it('red [0,100,50] => [255,0,0]', () => { expect(hslToRgb(0, 100, 50)).toEqual([255, 0, 0]); });
  it('green [120,100,50] => [0,255,0]', () => { expect(hslToRgb(120, 100, 50)).toEqual([0, 255, 0]); });
  it('blue [240,100,50] => [0,0,255]', () => { expect(hslToRgb(240, 100, 50)).toEqual([0, 0, 255]); });
  it('yellow [60,100,50] => [255,255,0]', () => { expect(hslToRgb(60, 100, 50)).toEqual([255, 255, 0]); });
  it('cyan [180,100,50] => [0,255,255]', () => { expect(hslToRgb(180, 100, 50)).toEqual([0, 255, 255]); });
  it('magenta [300,100,50] => [255,0,255]', () => { expect(hslToRgb(300, 100, 50)).toEqual([255, 0, 255]); });
  it('achromatic returns equal channels', () => {
    const [r, g, b] = hslToRgb(0, 0, 50);
    expect(r).toBe(g); expect(g).toBe(b);
  });
  it('returns values in [0,255]', () => {
    const [r, g, b] = hslToRgb(200, 60, 40);
    expect(r).toBeGreaterThanOrEqual(0); expect(r).toBeLessThanOrEqual(255);
    expect(g).toBeGreaterThanOrEqual(0); expect(g).toBeLessThanOrEqual(255);
    expect(b).toBeGreaterThanOrEqual(0); expect(b).toBeLessThanOrEqual(255);
  });
  for (let i = 0; i < 100; i++) {
    it(`hslToRgb values in range ${i}`, () => {
      const h = (i * 36) % 360, s = (i * 7) % 101, l = (i * 5) % 101;
      const [r, g, b] = hslToRgb(h, s, l);
      expect(r).toBeGreaterThanOrEqual(0); expect(r).toBeLessThanOrEqual(255);
      expect(g).toBeGreaterThanOrEqual(0); expect(g).toBeLessThanOrEqual(255);
      expect(b).toBeGreaterThanOrEqual(0); expect(b).toBeLessThanOrEqual(255);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`hslToRgb achromatic returns equal r,g,b ${i}`, () => {
      const l = (i * 2) % 101;
      const [r, g, b] = hslToRgb(0, 0, l);
      expect(r).toBe(g);
      expect(g).toBe(b);
    });
  }
});

// ---------------------------------------------------------------------------
// rgbToHsl / hslToRgb round-trip
// ---------------------------------------------------------------------------
describe('rgbToHsl/hslToRgb round-trip', () => {
  const cases: [number, number, number][] = [
    [255, 0, 0], [0, 255, 0], [0, 0, 255],
    [255, 255, 0], [0, 255, 255], [255, 0, 255],
    [128, 128, 128], [0, 0, 0], [255, 255, 255],
    [200, 100, 50], [10, 200, 150], [75, 25, 200],
  ];
  for (const [r, g, b] of cases) {
    it(`round-trip rgb(${r},${g},${b})`, () => {
      const [h, s, l] = rgbToHsl(r, g, b);
      const [rr, gg, bb] = hslToRgb(h, s, l);
      expect(Math.abs(rr - r)).toBeLessThanOrEqual(2);
      expect(Math.abs(gg - g)).toBeLessThanOrEqual(2);
      expect(Math.abs(bb - b)).toBeLessThanOrEqual(2);
    });
  }
  for (let i = 0; i < 80; i++) {
    it(`round-trip generated ${i}`, () => {
      const r = (i * 13) % 256, g = (i * 17) % 256, b = (i * 19) % 256;
      const [h, s, l] = rgbToHsl(r, g, b);
      const [rr, gg, bb] = hslToRgb(h, s, l);
      expect(Math.abs(rr - r)).toBeLessThanOrEqual(3);
      expect(Math.abs(gg - g)).toBeLessThanOrEqual(3);
      expect(Math.abs(bb - b)).toBeLessThanOrEqual(3);
    });
  }
});

// ---------------------------------------------------------------------------
// luminance
// ---------------------------------------------------------------------------
describe('luminance', () => {
  it('black has luminance 0', () => { expect(luminance(0, 0, 0)).toBeCloseTo(0); });
  it('white has luminance 1', () => { expect(luminance(255, 255, 255)).toBeCloseTo(1); });
  it('red luminance ~0.2126', () => { expect(luminance(255, 0, 0)).toBeCloseTo(0.2126, 3); });
  it('green luminance ~0.7152', () => { expect(luminance(0, 255, 0)).toBeCloseTo(0.7152, 3); });
  it('blue luminance ~0.0722', () => { expect(luminance(0, 0, 255)).toBeCloseTo(0.0722, 3); });
  it('luminance is non-negative', () => {
    expect(luminance(100, 100, 100)).toBeGreaterThanOrEqual(0);
  });
  it('luminance is <= 1', () => {
    expect(luminance(200, 200, 200)).toBeLessThanOrEqual(1);
  });
  it('mid-grey luminance is between 0 and 1', () => {
    const l = luminance(128, 128, 128);
    expect(l).toBeGreaterThan(0);
    expect(l).toBeLessThan(1);
  });
  it('luminance increases with brightness', () => {
    expect(luminance(100, 100, 100)).toBeLessThan(luminance(200, 200, 200));
  });
  it('luminance is not linear (gamma corrected)', () => {
    const l1 = luminance(128, 0, 0);
    expect(l1).not.toBeCloseTo(0.2126 * 0.5, 2);
  });
  for (let i = 0; i < 50; i++) {
    it(`luminance in [0,1] for grey ${i}`, () => {
      const v = (i * 5) % 256;
      const l = luminance(v, v, v);
      expect(l).toBeGreaterThanOrEqual(0);
      expect(l).toBeLessThanOrEqual(1);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`luminance monotone for pure red ${i}`, () => {
      const v1 = (i * 5) % 256;
      const v2 = Math.min(v1 + 5, 255);
      expect(luminance(v1, 0, 0)).toBeLessThanOrEqual(luminance(v2, 0, 0));
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`luminance random check ${i}`, () => {
      const r = (i * 7) % 256, g = (i * 11) % 256, b = (i * 13) % 256;
      const l = luminance(r, g, b);
      expect(l).toBeGreaterThanOrEqual(0);
      expect(l).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// contrastRatio
// ---------------------------------------------------------------------------
describe('contrastRatio', () => {
  it('black on white is 21:1', () => {
    expect(contrastRatio(0, 0, 0, 255, 255, 255)).toBeCloseTo(21, 0);
  });
  it('white on black is 21:1', () => {
    expect(contrastRatio(255, 255, 255, 0, 0, 0)).toBeCloseTo(21, 0);
  });
  it('same color has ratio 1', () => {
    expect(contrastRatio(100, 100, 100, 100, 100, 100)).toBeCloseTo(1, 5);
  });
  it('ratio is always >= 1', () => {
    expect(contrastRatio(200, 100, 50, 50, 100, 200)).toBeGreaterThanOrEqual(1);
  });
  it('is commutative', () => {
    const r1 = contrastRatio(255, 0, 0, 0, 0, 255);
    const r2 = contrastRatio(0, 0, 255, 255, 0, 0);
    expect(r1).toBeCloseTo(r2, 5);
  });
  it('ratio is <= 21', () => {
    const r = contrastRatio(0, 0, 0, 255, 255, 255);
    expect(r).toBeLessThanOrEqual(21.1);
  });
  it('red vs white is > 1', () => {
    expect(contrastRatio(255, 0, 0, 255, 255, 255)).toBeGreaterThan(1);
  });
  it('returns a number', () => {
    expect(typeof contrastRatio(0, 0, 0, 255, 255, 255)).toBe('number');
  });
  for (let i = 0; i < 60; i++) {
    it(`contrastRatio >= 1 for pair ${i}`, () => {
      const r1 = (i * 7) % 256, g1 = (i * 11) % 256, b1 = (i * 13) % 256;
      const r2 = 255 - r1, g2 = 255 - g1, b2 = 255 - b1;
      const ratio = contrastRatio(r1, g1, b1, r2, g2, b2);
      expect(ratio).toBeGreaterThanOrEqual(1);
    });
  }
  for (let i = 0; i < 40; i++) {
    it(`contrastRatio commutative ${i}`, () => {
      const r1 = (i * 9) % 256, g1 = (i * 13) % 256, b1 = (i * 17) % 256;
      const r2 = (i * 23) % 256, g2 = (i * 29) % 256, b2 = (i * 31) % 256;
      const ra = contrastRatio(r1, g1, b1, r2, g2, b2);
      const rb = contrastRatio(r2, g2, b2, r1, g1, b1);
      expect(ra).toBeCloseTo(rb, 10);
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`contrastRatio same color = 1 for grey ${i}`, () => {
      const v = (i * 9) % 256;
      expect(contrastRatio(v, v, v, v, v, v)).toBeCloseTo(1, 5);
    });
  }
});

// ---------------------------------------------------------------------------
// isAccessible
// ---------------------------------------------------------------------------
describe('isAccessible', () => {
  it('AA passes at 4.5', () => { expect(isAccessible(4.5, 'AA')).toBe(true); });
  it('AA fails at 4.4', () => { expect(isAccessible(4.4, 'AA')).toBe(false); });
  it('AAA passes at 7', () => { expect(isAccessible(7, 'AAA')).toBe(true); });
  it('AAA fails at 6.9', () => { expect(isAccessible(6.9, 'AAA')).toBe(false); });
  it('AA passes at 21', () => { expect(isAccessible(21, 'AA')).toBe(true); });
  it('AAA passes at 21', () => { expect(isAccessible(21, 'AAA')).toBe(true); });
  it('AA fails at 1', () => { expect(isAccessible(1, 'AA')).toBe(false); });
  it('AAA fails at 1', () => { expect(isAccessible(1, 'AAA')).toBe(false); });
  it('AA passes at 5', () => { expect(isAccessible(5, 'AA')).toBe(true); });
  it('AAA fails at 5', () => { expect(isAccessible(5, 'AAA')).toBe(false); });
  it('returns boolean', () => { expect(typeof isAccessible(4.5, 'AA')).toBe('boolean'); });
  for (let i = 0; i < 50; i++) {
    it(`isAccessible AA threshold check ${i}`, () => {
      const ratio = 1 + i * 0.5;
      const result = isAccessible(ratio, 'AA');
      expect(result).toBe(ratio >= 4.5);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`isAccessible AAA threshold check ${i}`, () => {
      const ratio = 1 + i * 0.5;
      const result = isAccessible(ratio, 'AAA');
      expect(result).toBe(ratio >= 7);
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`isAccessible AA implies not necessarily AAA ${i}`, () => {
      const ratio = 4.5 + i * 0.1;
      if (ratio < 7) {
        expect(isAccessible(ratio, 'AA')).toBe(true);
        expect(isAccessible(ratio, 'AAA')).toBe(false);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// lighten
// ---------------------------------------------------------------------------
describe('lighten', () => {
  it('lightening black by 50 produces mid grey', () => {
    const [r, g, b] = lighten(0, 0, 0, 50);
    expect(r).toBe(g); expect(g).toBe(b);
    expect(r).toBeGreaterThan(0);
  });
  it('lightening white by any amount stays white', () => {
    const [r, g, b] = lighten(255, 255, 255, 20);
    expect(r).toBe(255); expect(g).toBe(255); expect(b).toBe(255);
  });
  it('lightening returns values in [0,255]', () => {
    const [r, g, b] = lighten(100, 50, 200, 20);
    expect(r).toBeGreaterThanOrEqual(0); expect(r).toBeLessThanOrEqual(255);
    expect(g).toBeGreaterThanOrEqual(0); expect(g).toBeLessThanOrEqual(255);
    expect(b).toBeGreaterThanOrEqual(0); expect(b).toBeLessThanOrEqual(255);
  });
  it('lightening by 0 returns approximately same color', () => {
    const [r, g, b] = lighten(100, 150, 200, 0);
    expect(r).toBeGreaterThanOrEqual(98);
    expect(g).toBeGreaterThanOrEqual(148);
    expect(b).toBeGreaterThanOrEqual(198);
  });
  it('returns an array of 3', () => {
    expect(lighten(100, 100, 100, 10).length).toBe(3);
  });
  for (let i = 0; i < 60; i++) {
    it(`lighten stays in [0,255] iteration ${i}`, () => {
      const r = (i * 7) % 256, g = (i * 11) % 256, b = (i * 13) % 256;
      const amount = (i * 3) % 50;
      const [lr, lg, lb] = lighten(r, g, b, amount);
      expect(lr).toBeGreaterThanOrEqual(0); expect(lr).toBeLessThanOrEqual(255);
      expect(lg).toBeGreaterThanOrEqual(0); expect(lg).toBeLessThanOrEqual(255);
      expect(lb).toBeGreaterThanOrEqual(0); expect(lb).toBeLessThanOrEqual(255);
    });
  }
  for (let i = 0; i < 40; i++) {
    it(`lighten increases or maintains luminance ${i}`, () => {
      const r = (i * 9) % 200, g = (i * 11) % 200, b = (i * 13) % 200;
      const [lr, lg, lb] = lighten(r, g, b, 10);
      expect(luminance(lr, lg, lb)).toBeGreaterThanOrEqual(luminance(r, g, b) - 0.01);
    });
  }
});

// ---------------------------------------------------------------------------
// darken
// ---------------------------------------------------------------------------
describe('darken', () => {
  it('darkening white by 50 produces mid grey', () => {
    const [r, g, b] = darken(255, 255, 255, 50);
    expect(r).toBe(g); expect(g).toBe(b);
    expect(r).toBeLessThan(255);
  });
  it('darkening black stays black', () => {
    const [r, g, b] = darken(0, 0, 0, 20);
    expect(r).toBe(0); expect(g).toBe(0); expect(b).toBe(0);
  });
  it('darkening returns values in [0,255]', () => {
    const [r, g, b] = darken(200, 150, 100, 20);
    expect(r).toBeGreaterThanOrEqual(0); expect(r).toBeLessThanOrEqual(255);
    expect(g).toBeGreaterThanOrEqual(0); expect(g).toBeLessThanOrEqual(255);
    expect(b).toBeGreaterThanOrEqual(0); expect(b).toBeLessThanOrEqual(255);
  });
  it('returns an array of 3', () => {
    expect(darken(100, 100, 100, 10).length).toBe(3);
  });
  it('darkening by 0 returns approximately same color', () => {
    const [r, g, b] = darken(100, 150, 200, 0);
    expect(Math.abs(r - 100)).toBeLessThanOrEqual(3);
    expect(Math.abs(g - 150)).toBeLessThanOrEqual(3);
    expect(Math.abs(b - 200)).toBeLessThanOrEqual(3);
  });
  for (let i = 0; i < 60; i++) {
    it(`darken stays in [0,255] iteration ${i}`, () => {
      const r = (i * 7) % 256, g = (i * 11) % 256, b = (i * 13) % 256;
      const amount = (i * 3) % 50;
      const [dr, dg, db] = darken(r, g, b, amount);
      expect(dr).toBeGreaterThanOrEqual(0); expect(dr).toBeLessThanOrEqual(255);
      expect(dg).toBeGreaterThanOrEqual(0); expect(dg).toBeLessThanOrEqual(255);
      expect(db).toBeGreaterThanOrEqual(0); expect(db).toBeLessThanOrEqual(255);
    });
  }
  for (let i = 0; i < 40; i++) {
    it(`darken reduces or maintains luminance ${i}`, () => {
      const r = (i * 9) % 256, g = (i * 11) % 256, b = (i * 13) % 256;
      const [dr, dg, db] = darken(r, g, b, 10);
      expect(luminance(dr, dg, db)).toBeLessThanOrEqual(luminance(r, g, b) + 0.01);
    });
  }
});

// ---------------------------------------------------------------------------
// mix
// ---------------------------------------------------------------------------
describe('mix', () => {
  it('mix at weight 0 returns first color', () => {
    expect(mix(255, 0, 0, 0, 0, 255, 0)).toEqual([255, 0, 0]);
  });
  it('mix at weight 1 returns second color', () => {
    expect(mix(255, 0, 0, 0, 0, 255, 1)).toEqual([0, 0, 255]);
  });
  it('mix at weight 0.5 is midpoint', () => {
    expect(mix(0, 0, 0, 255, 255, 255, 0.5)).toEqual([128, 128, 128]);
  });
  it('returns array of length 3', () => {
    expect(mix(255, 0, 0, 0, 255, 0, 0.5).length).toBe(3);
  });
  it('result is in [0,255]', () => {
    const [r, g, b] = mix(100, 200, 50, 50, 100, 250, 0.3);
    expect(r).toBeGreaterThanOrEqual(0); expect(r).toBeLessThanOrEqual(255);
    expect(g).toBeGreaterThanOrEqual(0); expect(g).toBeLessThanOrEqual(255);
    expect(b).toBeGreaterThanOrEqual(0); expect(b).toBeLessThanOrEqual(255);
  });
  it('clamps weight below 0 to 0', () => {
    expect(mix(255, 0, 0, 0, 0, 255, -1)).toEqual([255, 0, 0]);
  });
  it('clamps weight above 1 to 1', () => {
    expect(mix(255, 0, 0, 0, 0, 255, 2)).toEqual([0, 0, 255]);
  });
  it('mix of same color returns same color', () => {
    expect(mix(100, 150, 200, 100, 150, 200, 0.7)).toEqual([100, 150, 200]);
  });
  for (let i = 0; i < 60; i++) {
    it(`mix result in [0,255] iteration ${i}`, () => {
      const r1 = (i * 7) % 256, g1 = (i * 11) % 256, b1 = (i * 13) % 256;
      const r2 = 255 - r1, g2 = 255 - g1, b2 = 255 - b1;
      const w = (i % 11) / 10;
      const [r, g, b] = mix(r1, g1, b1, r2, g2, b2, w);
      expect(r).toBeGreaterThanOrEqual(0); expect(r).toBeLessThanOrEqual(255);
      expect(g).toBeGreaterThanOrEqual(0); expect(g).toBeLessThanOrEqual(255);
      expect(b).toBeGreaterThanOrEqual(0); expect(b).toBeLessThanOrEqual(255);
    });
  }
  for (let i = 0; i < 40; i++) {
    it(`mix weight=0 is first color ${i}`, () => {
      const r = (i * 7) % 256, g = (i * 11) % 256, b = (i * 13) % 256;
      expect(mix(r, g, b, 10, 20, 30, 0)).toEqual([r, g, b]);
    });
  }
  for (let i = 0; i < 40; i++) {
    it(`mix weight=1 is second color ${i}`, () => {
      const r = (i * 17) % 256, g = (i * 19) % 256, b = (i * 23) % 256;
      expect(mix(10, 20, 30, r, g, b, 1)).toEqual([r, g, b]);
    });
  }
});

// ---------------------------------------------------------------------------
// complementary
// ---------------------------------------------------------------------------
describe('complementary', () => {
  it('complement of red is cyan-like', () => {
    const [r, g, b] = complementary(255, 0, 0);
    expect(g).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(0);
  });
  it('complement of complement approximates original', () => {
    const [r, g, b] = complementary(200, 100, 50);
    const [r2, g2, b2] = complementary(r, g, b);
    expect(Math.abs(r2 - 200)).toBeLessThanOrEqual(5);
    expect(Math.abs(g2 - 100)).toBeLessThanOrEqual(5);
    expect(Math.abs(b2 - 50)).toBeLessThanOrEqual(5);
  });
  it('returns array of length 3', () => {
    expect(complementary(100, 150, 200).length).toBe(3);
  });
  it('returns values in [0,255]', () => {
    const [r, g, b] = complementary(100, 150, 200);
    expect(r).toBeGreaterThanOrEqual(0); expect(r).toBeLessThanOrEqual(255);
    expect(g).toBeGreaterThanOrEqual(0); expect(g).toBeLessThanOrEqual(255);
    expect(b).toBeGreaterThanOrEqual(0); expect(b).toBeLessThanOrEqual(255);
  });
  it('complement of grey is grey', () => {
    const [r, g, b] = complementary(128, 128, 128);
    expect(r).toBe(g); expect(g).toBe(b);
  });
  it('complement of white is white', () => {
    const [r, g, b] = complementary(255, 255, 255);
    expect(r).toBe(255); expect(g).toBe(255); expect(b).toBe(255);
  });
  it('complement of black is black', () => {
    const [r, g, b] = complementary(0, 0, 0);
    expect(r).toBe(0); expect(g).toBe(0); expect(b).toBe(0);
  });
  for (let i = 0; i < 60; i++) {
    it(`complementary in [0,255] iteration ${i}`, () => {
      const r = (i * 7) % 256, g = (i * 11) % 256, b = (i * 13) % 256;
      const [cr, cg, cb] = complementary(r, g, b);
      expect(cr).toBeGreaterThanOrEqual(0); expect(cr).toBeLessThanOrEqual(255);
      expect(cg).toBeGreaterThanOrEqual(0); expect(cg).toBeLessThanOrEqual(255);
      expect(cb).toBeGreaterThanOrEqual(0); expect(cb).toBeLessThanOrEqual(255);
    });
  }
  for (let i = 0; i < 40; i++) {
    it(`double complement approximates original ${i}`, () => {
      const r = (i * 9) % 200 + 20, g = (i * 13) % 200 + 20, b = (i * 17) % 200 + 20;
      const [r2, g2, b2] = complementary(...complementary(r, g, b) as [number, number, number]);
      expect(Math.abs(r2 - r)).toBeLessThanOrEqual(5);
      expect(Math.abs(g2 - g)).toBeLessThanOrEqual(5);
      expect(Math.abs(b2 - b)).toBeLessThanOrEqual(5);
    });
  }
});

// ---------------------------------------------------------------------------
// triadic
// ---------------------------------------------------------------------------
describe('triadic', () => {
  it('returns two colors', () => {
    expect(triadic(255, 0, 0).length).toBe(2);
  });
  it('each triadic color has 3 channels', () => {
    const [a, b] = triadic(255, 0, 0);
    expect(a.length).toBe(3);
    expect(b.length).toBe(3);
  });
  it('triadic values are in [0,255]', () => {
    const [[r1, g1, b1], [r2, g2, b2]] = triadic(200, 100, 50);
    [r1, g1, b1, r2, g2, b2].forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(255);
    });
  });
  it('triadic of red produces green-ish and blue-ish', () => {
    const [[, g1], [, , b2]] = triadic(255, 0, 0);
    expect(g1).toBeGreaterThan(0);
    expect(b2).toBeGreaterThan(0);
  });
  it('triadic of black stays black', () => {
    const [[r1, g1, b1], [r2, g2, b2]] = triadic(0, 0, 0);
    expect(r1).toBe(0); expect(g1).toBe(0); expect(b1).toBe(0);
    expect(r2).toBe(0); expect(g2).toBe(0); expect(b2).toBe(0);
  });
  for (let i = 0; i < 60; i++) {
    it(`triadic in [0,255] iteration ${i}`, () => {
      const r = (i * 7) % 256, g = (i * 11) % 256, b = (i * 13) % 256;
      const [[r1, g1, b1], [r2, g2, b2]] = triadic(r, g, b);
      [r1, g1, b1, r2, g2, b2].forEach(v => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(255);
      });
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`triadic returns 2 colors iteration ${i}`, () => {
      const r = (i * 11) % 256, g = (i * 17) % 256, b = (i * 19) % 256;
      expect(triadic(r, g, b).length).toBe(2);
    });
  }
});

// ---------------------------------------------------------------------------
// analogous
// ---------------------------------------------------------------------------
describe('analogous', () => {
  it('returns two colors', () => {
    expect(analogous(255, 0, 0).length).toBe(2);
  });
  it('each analogous color has 3 channels', () => {
    const [a, b] = analogous(255, 0, 0);
    expect(a.length).toBe(3);
    expect(b.length).toBe(3);
  });
  it('analogous values are in [0,255]', () => {
    const [[r1, g1, b1], [r2, g2, b2]] = analogous(200, 100, 50);
    [r1, g1, b1, r2, g2, b2].forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(255);
    });
  });
  it('analogous of black stays black', () => {
    const [[r1, g1, b1], [r2, g2, b2]] = analogous(0, 0, 0);
    expect(r1).toBe(0); expect(g1).toBe(0); expect(b1).toBe(0);
    expect(r2).toBe(0); expect(g2).toBe(0); expect(b2).toBe(0);
  });
  it('two analogous colors are different (non-grey)', () => {
    const [[r1, g1, b1], [r2, g2, b2]] = analogous(255, 0, 0);
    expect([r1, g1, b1]).not.toEqual([r2, g2, b2]);
  });
  for (let i = 0; i < 60; i++) {
    it(`analogous in [0,255] iteration ${i}`, () => {
      const r = (i * 7) % 256, g = (i * 11) % 256, b = (i * 13) % 256;
      const [[r1, g1, b1], [r2, g2, b2]] = analogous(r, g, b);
      [r1, g1, b1, r2, g2, b2].forEach(v => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(255);
      });
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`analogous returns 2 colors iteration ${i}`, () => {
      const r = (i * 11) % 256, g = (i * 17) % 256, b = (i * 19) % 256;
      expect(analogous(r, g, b).length).toBe(2);
    });
  }
});

// ---------------------------------------------------------------------------
// isLight
// ---------------------------------------------------------------------------
describe('isLight', () => {
  it('white is light', () => { expect(isLight(255, 255, 255)).toBe(true); });
  it('black is not light', () => { expect(isLight(0, 0, 0)).toBe(false); });
  it('mid grey is not light (luminance ~0.216)', () => { expect(isLight(128, 128, 128)).toBe(false); });
  it('very light yellow is light', () => { expect(isLight(255, 255, 200)).toBe(true); });
  it('dark navy is not light', () => { expect(isLight(0, 0, 128)).toBe(false); });
  it('returns boolean', () => { expect(typeof isLight(100, 100, 100)).toBe('boolean'); });
  it('light colour has luminance > 0.5', () => {
    const [r, g, b] = [240, 240, 240];
    const result = isLight(r, g, b);
    expect(result).toBe(luminance(r, g, b) > 0.5);
  });
  for (let i = 0; i < 50; i++) {
    it(`isLight consistent with luminance ${i}`, () => {
      const r = (i * 7) % 256, g = (i * 11) % 256, b = (i * 13) % 256;
      const lum = luminance(r, g, b);
      expect(isLight(r, g, b)).toBe(lum > 0.5);
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`isLight false for dark colors ${i}`, () => {
      const v = (i * 3) % 50;
      expect(isLight(v, v, v)).toBe(false);
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`isLight true for very bright colors ${i}`, () => {
      const v = 230 + (i % 26);
      expect(isLight(v, v, v)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional integration / edge-case tests
// ---------------------------------------------------------------------------
describe('edge cases and integration', () => {
  it('parseHex handles lowercase a-f', () => {
    expect(parseHex('#abcdef')).toEqual([171, 205, 239]);
  });
  it('toHex and parseHex are inverses for random colors', () => {
    for (let i = 0; i < 10; i++) {
      const r = (i * 37) % 256, g = (i * 53) % 256, b = (i * 73) % 256;
      expect(parseHex(toHex(r, g, b))).toEqual([r, g, b]);
    }
  });
  it('black to white contrast is maximum', () => {
    const ratio = contrastRatio(0, 0, 0, 255, 255, 255);
    expect(isAccessible(ratio, 'AAA')).toBe(true);
  });
  it('lighten then darken approximates original', () => {
    const r = 100, g = 150, b = 200;
    const [lr, lg, lb] = lighten(r, g, b, 10);
    const [dr, dg, db] = darken(lr, lg, lb, 10);
    expect(Math.abs(dr - r)).toBeLessThanOrEqual(5);
    expect(Math.abs(dg - g)).toBeLessThanOrEqual(5);
    expect(Math.abs(db - b)).toBeLessThanOrEqual(5);
  });
  it('mix is linear in first channel', () => {
    const [r] = mix(0, 0, 0, 100, 0, 0, 0.5);
    expect(r).toBe(50);
  });
  it('triadic covers 360 degrees (hue delta 120)', () => {
    const [h0] = rgbToHsl(255, 0, 0);
    const [[r1], [r2]] = triadic(255, 0, 0);
    const [h1] = rgbToHsl(r1, 0, 0);
    expect(h0).toBe(0);
    // triadic colors are hue-shifted by 120
    const [[tr1, tg1, tb1]] = triadic(255, 0, 0);
    const [th1] = rgbToHsl(tr1, tg1, tb1);
    expect(th1).toBeCloseTo(120, -1);
  });
  it('analogous are within 30 degrees of original', () => {
    const [h0] = rgbToHsl(255, 0, 0);
    const [[ar, ag, ab]] = analogous(255, 0, 0);
    const [h1] = rgbToHsl(ar, ag, ab);
    expect(Math.abs(h1 - h0 - 30) % 360).toBeLessThanOrEqual(5);
  });
  it('complementary has hue offset 180', () => {
    const [h0] = rgbToHsl(255, 0, 0);
    const [cr, cg, cb] = complementary(255, 0, 0);
    const [h1] = rgbToHsl(cr, cg, cb);
    expect(Math.abs(h1 - h0 - 180) % 360).toBeLessThanOrEqual(5);
  });
  for (let i = 0; i < 30; i++) {
    it(`full pipeline hex->hsl->rgb ${i}`, () => {
      const r = (i * 19) % 256, g = (i * 23) % 256, b = (i * 29) % 256;
      const hex = toHex(r, g, b);
      const [pr, pg, pb] = parseHex(hex);
      const [h, s, l] = rgbToHsl(pr, pg, pb);
      const [rr, gg, bb] = hslToRgb(h, s, l);
      expect(rr).toBeGreaterThanOrEqual(0); expect(rr).toBeLessThanOrEqual(255);
      expect(gg).toBeGreaterThanOrEqual(0); expect(gg).toBeLessThanOrEqual(255);
      expect(bb).toBeGreaterThanOrEqual(0); expect(bb).toBeLessThanOrEqual(255);
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`isAccessible black vs lightening ${i}`, () => {
      const v = (i * 8) % 256;
      const [lr, lg, lb] = lighten(v, v, v, 20);
      const ratio = contrastRatio(0, 0, 0, lr, lg, lb);
      const accessible = isAccessible(ratio, 'AA');
      expect(typeof accessible).toBe('boolean');
    });
  }
});
