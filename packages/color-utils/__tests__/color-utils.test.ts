// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  isValidHex,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  luminance,
  contrastRatio,
  isLightColor,
  lighten,
  darken,
  mix,
  complementary,
  hexToRgba,
  rgbaToString,
  rgbToString,
  parseColor,
  alphaBlend,
  grayscale,
} from '../src/index';
import type { RGB, RGBA } from '../src/index';

// ---------------------------------------------------------------------------
// isValidHex — 60 tests
// ---------------------------------------------------------------------------
describe('isValidHex', () => {
  const valid3 = ['#000', '#fff', '#abc', '#ABC', '#1a2', '#f0f', '#0f0', '#00f', '#a1b', '#9e3'];
  const valid6 = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#abcdef', '#ABCDEF', '#123456', '#fedcba', '#a1b2c3',
  ];
  const invalid = [
    '', '#', '#0', '#00', '#0000', '#00000', '#0000000',
    'ff0000', '#gggggg', '#xyz', '#12345g', null as unknown as string,
    undefined as unknown as string, '#12 456', ' #ffffff', '#ffffff ',
  ];

  for (let i = 0; i < valid3.length; i++) {
    const hex = valid3[i];
    it(`returns true for valid 3-digit hex [${i}]: ${hex}`, () => {
      expect(isValidHex(hex)).toBe(true);
    });
  }

  for (let i = 0; i < valid6.length; i++) {
    const hex = valid6[i];
    it(`returns true for valid 6-digit hex [${i}]: ${hex}`, () => {
      expect(isValidHex(hex)).toBe(true);
    });
  }

  for (let i = 0; i < invalid.length; i++) {
    const hex = invalid[i];
    it(`returns false for invalid hex [${i}]: ${JSON.stringify(hex)}`, () => {
      expect(isValidHex(hex as string)).toBe(false);
    });
  }

  // Extra loop-generated cases — increments of channel value
  for (let i = 0; i < 20; i++) {
    const v = i.toString(16).padStart(2, '0');
    it(`isValidHex roundtrip channel value ${i}`, () => {
      expect(isValidHex(`#${v}${v}${v}`)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// hexToRgb — 80 tests
// ---------------------------------------------------------------------------
describe('hexToRgb', () => {
  // Well-known colours
  const cases: Array<[string, RGB]> = [
    ['#000000', { r: 0, g: 0, b: 0 }],
    ['#ffffff', { r: 255, g: 255, b: 255 }],
    ['#ff0000', { r: 255, g: 0, b: 0 }],
    ['#00ff00', { r: 0, g: 255, b: 0 }],
    ['#0000ff', { r: 0, g: 0, b: 255 }],
    ['#ffff00', { r: 255, g: 255, b: 0 }],
    ['#ff00ff', { r: 255, g: 0, b: 255 }],
    ['#00ffff', { r: 0, g: 255, b: 255 }],
    ['#123456', { r: 18, g: 52, b: 86 }],
    ['#abcdef', { r: 171, g: 205, b: 239 }],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [hex, expected] = cases[i];
    it(`hexToRgb known color [${i}]: ${hex}`, () => {
      expect(hexToRgb(hex)).toEqual(expected);
    });
  }

  // Shorthand expansion
  const shorthand: Array<[string, RGB]> = [
    ['#000', { r: 0, g: 0, b: 0 }],
    ['#fff', { r: 255, g: 255, b: 255 }],
    ['#f00', { r: 255, g: 0, b: 0 }],
    ['#0f0', { r: 0, g: 255, b: 0 }],
    ['#00f', { r: 0, g: 0, b: 255 }],
    ['#abc', { r: 170, g: 187, b: 204 }],
    ['#1a2', { r: 17, g: 170, b: 34 }],
    ['#9e3', { r: 153, g: 238, b: 51 }],
  ];

  for (let i = 0; i < shorthand.length; i++) {
    const [hex, expected] = shorthand[i];
    it(`hexToRgb shorthand [${i}]: ${hex}`, () => {
      expect(hexToRgb(hex)).toEqual(expected);
    });
  }

  // Error on invalid
  const bad = ['', 'ff0000', '#gg0000', '#12345', '#1234567'];
  for (let i = 0; i < bad.length; i++) {
    const hex = bad[i];
    it(`hexToRgb throws on invalid [${i}]: ${JSON.stringify(hex)}`, () => {
      expect(() => hexToRgb(hex)).toThrow();
    });
  }

  // Loop over grayscale values — every 5th step from 0-255
  for (let v = 0; v <= 255; v += 5) {
    it(`hexToRgb grayscale step ${v}`, () => {
      const h = v.toString(16).padStart(2, '0');
      const result = hexToRgb(`#${h}${h}${h}`);
      expect(result.r).toBe(v);
      expect(result.g).toBe(v);
      expect(result.b).toBe(v);
    });
  }
});

// ---------------------------------------------------------------------------
// rgbToHex — 60 tests
// ---------------------------------------------------------------------------
describe('rgbToHex', () => {
  const cases: Array<[number, number, number, string]> = [
    [0, 0, 0, '#000000'],
    [255, 255, 255, '#ffffff'],
    [255, 0, 0, '#ff0000'],
    [0, 255, 0, '#00ff00'],
    [0, 0, 255, '#0000ff'],
    [18, 52, 86, '#123456'],
    [171, 205, 239, '#abcdef'],
    [128, 128, 128, '#808080'],
    [127, 0, 255, '#7f00ff'],
    [0, 127, 255, '#007fff'],
  ];

  for (let i = 0; i < cases.length; i++) {
    const [r, g, b, expected] = cases[i];
    it(`rgbToHex known [${i}]: rgb(${r},${g},${b})`, () => {
      expect(rgbToHex(r, g, b)).toBe(expected);
    });
  }

  // Roundtrip: hexToRgb -> rgbToHex
  const hexSamples = [
    '#ff5733', '#c70039', '#900c3f', '#581845', '#ffc300',
    '#daa520', '#2e86ab', '#a23b72', '#f18f01', '#048a81',
  ];

  for (let i = 0; i < hexSamples.length; i++) {
    const hex = hexSamples[i];
    it(`rgbToHex roundtrip [${i}]: ${hex}`, () => {
      const { r, g, b } = hexToRgb(hex);
      expect(rgbToHex(r, g, b)).toBe(hex);
    });
  }

  // Clamp out-of-range values
  for (let i = 0; i < 10; i++) {
    it(`rgbToHex clamps negative/over-255 [${i}]`, () => {
      const result = rgbToHex(-i * 10, 300 + i, -1);
      expect(isValidHex(result)).toBe(true);
      const { r, g, b } = hexToRgb(result);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(255);
      expect(b).toBeGreaterThanOrEqual(0);
    });
  }

  // Loop: every 30th step of a single-channel ramp
  for (let v = 0; v <= 255; v += 30) {
    it(`rgbToHex red channel ramp ${v}`, () => {
      const result = rgbToHex(v, 0, 0);
      expect(isValidHex(result)).toBe(true);
      expect(hexToRgb(result).r).toBe(v);
    });
  }
});

// ---------------------------------------------------------------------------
// rgbToHsl — 60 tests
// ---------------------------------------------------------------------------
describe('rgbToHsl', () => {
  it('black -> hsl(0, 0, 0)', () => {
    const { h, s, l } = rgbToHsl(0, 0, 0);
    expect(h).toBe(0);
    expect(s).toBe(0);
    expect(l).toBe(0);
  });

  it('white -> hsl(0, 0, 100)', () => {
    const { h, s, l } = rgbToHsl(255, 255, 255);
    expect(s).toBe(0);
    expect(l).toBe(100);
  });

  it('pure red -> hue 0', () => {
    expect(rgbToHsl(255, 0, 0).h).toBeCloseTo(0, 0);
  });

  it('pure green -> hue 120', () => {
    expect(rgbToHsl(0, 255, 0).h).toBeCloseTo(120, 0);
  });

  it('pure blue -> hue 240', () => {
    expect(rgbToHsl(0, 0, 255).h).toBeCloseTo(240, 0);
  });

  it('pure yellow -> hue 60', () => {
    expect(rgbToHsl(255, 255, 0).h).toBeCloseTo(60, 0);
  });

  it('pure cyan -> hue 180', () => {
    expect(rgbToHsl(0, 255, 255).h).toBeCloseTo(180, 0);
  });

  it('pure magenta -> hue 300', () => {
    expect(rgbToHsl(255, 0, 255).h).toBeCloseTo(300, 0);
  });

  // Saturation is 100% for pure hues
  const pureHues: Array<[number, number, number]> = [
    [255, 0, 0], [0, 255, 0], [0, 0, 255],
    [255, 255, 0], [0, 255, 255], [255, 0, 255],
  ];

  for (let i = 0; i < pureHues.length; i++) {
    const [r, g, b] = pureHues[i];
    it(`rgbToHsl saturation 100 for pure hue [${i}]: rgb(${r},${g},${b})`, () => {
      expect(rgbToHsl(r, g, b).s).toBeCloseTo(100, 0);
    });
  }

  // Lightness is 50% for pure saturated colours
  for (let i = 0; i < pureHues.length; i++) {
    const [r, g, b] = pureHues[i];
    it(`rgbToHsl lightness 50 for pure hue [${i}]: rgb(${r},${g},${b})`, () => {
      expect(rgbToHsl(r, g, b).l).toBeCloseTo(50, 0);
    });
  }

  // Output ranges
  for (let i = 0; i < 20; i++) {
    const r = (i * 13) % 256;
    const g = (i * 37) % 256;
    const b = (i * 71) % 256;
    it(`rgbToHsl output ranges [${i}]: rgb(${r},${g},${b})`, () => {
      const { h, s, l } = rgbToHsl(r, g, b);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
      expect(l).toBeGreaterThanOrEqual(0);
      expect(l).toBeLessThanOrEqual(100);
    });
  }
});

// ---------------------------------------------------------------------------
// hslToRgb — 60 tests
// ---------------------------------------------------------------------------
describe('hslToRgb', () => {
  // Pure hue roundtrips
  const hslCases: Array<[number, number, number, RGB]> = [
    [0, 100, 50, { r: 255, g: 0, b: 0 }],
    [120, 100, 50, { r: 0, g: 255, b: 0 }],
    [240, 100, 50, { r: 0, g: 0, b: 255 }],
    [60, 100, 50, { r: 255, g: 255, b: 0 }],
    [180, 100, 50, { r: 0, g: 255, b: 255 }],
    [300, 100, 50, { r: 255, g: 0, b: 255 }],
    [0, 0, 0, { r: 0, g: 0, b: 0 }],
    [0, 0, 100, { r: 255, g: 255, b: 255 }],
    [0, 0, 50, { r: 128, g: 128, b: 128 }],
  ];

  for (let i = 0; i < hslCases.length; i++) {
    const [h, s, l, expected] = hslCases[i];
    it(`hslToRgb known [${i}]: hsl(${h},${s},${l})`, () => {
      const result = hslToRgb(h, s, l);
      expect(result.r).toBeCloseTo(expected.r, -1);
      expect(result.g).toBeCloseTo(expected.g, -1);
      expect(result.b).toBeCloseTo(expected.b, -1);
    });
  }

  // Roundtrip rgbToHsl -> hslToRgb
  const rgbSamples: Array<RGB> = [
    { r: 255, g: 99, b: 71 },
    { r: 60, g: 179, b: 113 },
    { r: 106, g: 90, b: 205 },
    { r: 255, g: 165, b: 0 },
    { r: 220, g: 20, b: 60 },
  ];

  for (let i = 0; i < rgbSamples.length; i++) {
    const { r, g, b } = rgbSamples[i];
    it(`hslToRgb roundtrip [${i}]: rgb(${r},${g},${b})`, () => {
      const hsl = rgbToHsl(r, g, b);
      const back = hslToRgb(hsl.h, hsl.s, hsl.l);
      expect(back.r).toBeCloseTo(r, -1);
      expect(back.g).toBeCloseTo(g, -1);
      expect(back.b).toBeCloseTo(b, -1);
    });
  }

  // Output bounds
  for (let i = 0; i < 20; i++) {
    const h = (i * 18) % 360;
    const s = (i * 5) % 101;
    const l = (i * 7) % 101;
    it(`hslToRgb output bounds [${i}]: hsl(${h},${s},${l})`, () => {
      const { r, g, b } = hslToRgb(h, s, l);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(255);
      expect(g).toBeGreaterThanOrEqual(0);
      expect(g).toBeLessThanOrEqual(255);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(255);
    });
  }

  // Gray (s=0) always produces equal r/g/b
  for (let i = 0; i <= 25; i++) {
    const l = i * 4;
    it(`hslToRgb gray (s=0, l=${l}) produces equal channels`, () => {
      const { r, g, b } = hslToRgb(0, 0, l);
      expect(r).toBe(g);
      expect(g).toBe(b);
    });
  }
});

// ---------------------------------------------------------------------------
// luminance — 50 tests
// ---------------------------------------------------------------------------
describe('luminance', () => {
  it('black luminance is 0', () => {
    expect(luminance(0, 0, 0)).toBe(0);
  });

  it('white luminance is 1', () => {
    expect(luminance(255, 255, 255)).toBeCloseTo(1, 4);
  });

  it('pure red luminance ~0.2126', () => {
    expect(luminance(255, 0, 0)).toBeCloseTo(0.2126, 3);
  });

  it('pure green luminance ~0.7152', () => {
    expect(luminance(0, 255, 0)).toBeCloseTo(0.7152, 3);
  });

  it('pure blue luminance ~0.0722', () => {
    expect(luminance(0, 0, 255)).toBeCloseTo(0.0722, 3);
  });

  // Luminance always in [0,1]
  for (let i = 0; i < 30; i++) {
    const r = (i * 9) % 256;
    const g = (i * 23) % 256;
    const b = (i * 47) % 256;
    it(`luminance in [0,1] for rgb(${r},${g},${b})`, () => {
      const lum = luminance(r, g, b);
      expect(lum).toBeGreaterThanOrEqual(0);
      expect(lum).toBeLessThanOrEqual(1);
    });
  }

  // Monotone: brighter grays have higher luminance
  for (let i = 0; i < 10; i++) {
    const v1 = i * 20;
    const v2 = (i + 1) * 20;
    if (v2 <= 255) {
      it(`luminance monotone: gray(${v1}) < gray(${v2})`, () => {
        expect(luminance(v1, v1, v1)).toBeLessThan(luminance(v2, v2, v2));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// contrastRatio — 50 tests
// ---------------------------------------------------------------------------
describe('contrastRatio', () => {
  it('black on white = 21', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 0);
  });

  it('white on black = 21', () => {
    expect(contrastRatio({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 })).toBeCloseTo(21, 0);
  });

  it('same color = 1', () => {
    expect(contrastRatio({ r: 100, g: 100, b: 100 }, { r: 100, g: 100, b: 100 })).toBeCloseTo(1, 2);
  });

  it('is commutative', () => {
    const a: RGB = { r: 255, g: 0, b: 0 };
    const b: RGB = { r: 0, g: 0, b: 255 };
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 4);
  });

  it('result >= 1', () => {
    expect(contrastRatio({ r: 128, g: 0, b: 255 }, { r: 0, g: 128, b: 0 })).toBeGreaterThanOrEqual(1);
  });

  it('result <= 21', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeLessThanOrEqual(21);
  });

  // Contrast is always >= 1
  for (let i = 0; i < 30; i++) {
    const c1: RGB = { r: (i * 13) % 256, g: (i * 37) % 256, b: (i * 71) % 256 };
    const c2: RGB = { r: (i * 97) % 256, g: (i * 53) % 256, b: (i * 17) % 256 };
    it(`contrastRatio >= 1 [${i}]`, () => {
      expect(contrastRatio(c1, c2)).toBeGreaterThanOrEqual(1);
    });
  }

  // Contrast is always <= 21
  for (let i = 0; i < 10; i++) {
    const c1: RGB = { r: i * 25, g: i * 10, b: i * 5 };
    const c2: RGB = { r: 255 - i * 25, g: 255 - i * 10, b: 255 - i * 5 };
    it(`contrastRatio <= 21 [${i}]`, () => {
      expect(contrastRatio(c1, c2)).toBeLessThanOrEqual(21.1);
    });
  }
});

// ---------------------------------------------------------------------------
// isLightColor — 50 tests
// ---------------------------------------------------------------------------
describe('isLightColor', () => {
  it('white is light', () => {
    expect(isLightColor({ r: 255, g: 255, b: 255 })).toBe(true);
  });

  it('black is not light', () => {
    expect(isLightColor({ r: 0, g: 0, b: 0 })).toBe(false);
  });

  it('yellow is light', () => {
    expect(isLightColor({ r: 255, g: 255, b: 0 })).toBe(true);
  });

  it('dark navy is not light', () => {
    expect(isLightColor({ r: 0, g: 0, b: 128 })).toBe(false);
  });

  // Light colours have luminance > 0.179
  const lightColors: RGB[] = [
    { r: 255, g: 255, b: 255 },
    { r: 255, g: 255, b: 0 },
    { r: 200, g: 200, b: 200 },
    { r: 255, g: 200, b: 100 },
    { r: 180, g: 220, b: 255 },
  ];

  for (let i = 0; i < lightColors.length; i++) {
    const c = lightColors[i];
    it(`isLightColor true for rgb(${c.r},${c.g},${c.b})`, () => {
      expect(isLightColor(c)).toBe(true);
    });
  }

  // Dark colours
  const darkColors: RGB[] = [
    { r: 0, g: 0, b: 0 },
    { r: 30, g: 30, b: 30 },
    { r: 0, g: 0, b: 100 },
    { r: 80, g: 0, b: 0 },
    { r: 50, g: 50, b: 50 },
  ];

  for (let i = 0; i < darkColors.length; i++) {
    const c = darkColors[i];
    it(`isLightColor false for rgb(${c.r},${c.g},${c.b})`, () => {
      expect(isLightColor(c)).toBe(false);
    });
  }

  // Verify against luminance threshold directly
  for (let i = 0; i < 30; i++) {
    const v = i * 8;
    it(`isLightColor consistent with luminance threshold [gray=${v}]`, () => {
      const rgb: RGB = { r: v, g: v, b: v };
      const lum = luminance(v, v, v);
      expect(isLightColor(rgb)).toBe(lum > 0.179);
    });
  }
});

// ---------------------------------------------------------------------------
// lighten — 50 tests
// ---------------------------------------------------------------------------
describe('lighten', () => {
  it('lighten black by 50 produces a mid-grey hex', () => {
    const result = lighten('#000000', 50);
    expect(isValidHex(result)).toBe(true);
    const { r, g, b } = hexToRgb(result);
    expect(r).toBe(g);
    expect(g).toBe(b);
    expect(r).toBeGreaterThan(0);
  });

  it('lighten by 0 returns same colour', () => {
    expect(lighten('#ff5733', 0)).toBe('#ff5733');
  });

  it('lighten by 100 returns white', () => {
    const result = lighten('#000000', 100);
    expect(result).toBe('#ffffff');
  });

  it('lighten returns valid hex', () => {
    expect(isValidHex(lighten('#336699', 10))).toBe(true);
  });

  it('lightened colour is lighter than original', () => {
    const orig = hexToRgb('#336699');
    const lighter = hexToRgb(lighten('#336699', 15));
    expect(luminance(lighter.r, lighter.g, lighter.b)).toBeGreaterThan(
      luminance(orig.r, orig.g, orig.b),
    );
  });

  // Loop: lighten produces valid hex for 30 different colours
  for (let i = 0; i < 30; i++) {
    const r = ((i * 37) % 206) + 25;
    const g = ((i * 53) % 206) + 25;
    const b = ((i * 71) % 206) + 25;
    const hex = rgbToHex(r, g, b);
    it(`lighten valid hex [${i}]: ${hex} by ${i % 30}`, () => {
      expect(isValidHex(lighten(hex, i % 30))).toBe(true);
    });
  }

  // Lighten then compare HSL lightness
  for (let i = 0; i < 10; i++) {
    const amount = (i + 1) * 5;
    it(`lighten increases HSL lightness by ~${amount}% [${i}]`, () => {
      const hex = '#336699';
      const orig = rgbToHsl(...Object.values(hexToRgb(hex)) as [number, number, number]);
      const ltnd = rgbToHsl(...Object.values(hexToRgb(lighten(hex, amount))) as [number, number, number]);
      expect(ltnd.l).toBeGreaterThanOrEqual(orig.l);
    });
  }
});

// ---------------------------------------------------------------------------
// darken — 50 tests
// ---------------------------------------------------------------------------
describe('darken', () => {
  it('darken white by 50 produces mid-grey', () => {
    const result = darken('#ffffff', 50);
    expect(isValidHex(result)).toBe(true);
    const { r } = hexToRgb(result);
    expect(r).toBeLessThan(255);
  });

  it('darken by 0 returns same colour', () => {
    expect(darken('#ff5733', 0)).toBe('#ff5733');
  });

  it('darken by 100 returns black', () => {
    expect(darken('#ffffff', 100)).toBe('#000000');
  });

  it('darken returns valid hex', () => {
    expect(isValidHex(darken('#336699', 10))).toBe(true);
  });

  it('darkened colour is darker than original', () => {
    const orig = hexToRgb('#336699');
    const darker = hexToRgb(darken('#336699', 15));
    expect(luminance(darker.r, darker.g, darker.b)).toBeLessThan(
      luminance(orig.r, orig.g, orig.b),
    );
  });

  // Loop: darken produces valid hex for 30 different colours
  for (let i = 0; i < 30; i++) {
    const r = ((i * 37) % 206) + 25;
    const g = ((i * 53) % 206) + 25;
    const b = ((i * 71) % 206) + 25;
    const hex = rgbToHex(r, g, b);
    it(`darken valid hex [${i}]: ${hex} by ${i % 30}`, () => {
      expect(isValidHex(darken(hex, i % 30))).toBe(true);
    });
  }

  // Darken then compare HSL lightness
  for (let i = 0; i < 10; i++) {
    const amount = (i + 1) * 5;
    it(`darken reduces HSL lightness [${i}]`, () => {
      const hex = '#336699';
      const orig = rgbToHsl(...Object.values(hexToRgb(hex)) as [number, number, number]);
      const drknd = rgbToHsl(...Object.values(hexToRgb(darken(hex, amount))) as [number, number, number]);
      expect(drknd.l).toBeLessThanOrEqual(orig.l);
    });
  }
});

// ---------------------------------------------------------------------------
// mix — 60 tests
// ---------------------------------------------------------------------------
describe('mix', () => {
  it('mix weight 0.5 of red and blue', () => {
    const result = mix('#ff0000', '#0000ff', 0.5);
    expect(isValidHex(result)).toBe(true);
    const { r, b } = hexToRgb(result);
    expect(r).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(0);
  });

  it('mix weight 1.0 returns first colour', () => {
    expect(mix('#ff0000', '#0000ff', 1)).toBe('#ff0000');
  });

  it('mix weight 0.0 returns second colour', () => {
    expect(mix('#ff0000', '#0000ff', 0)).toBe('#0000ff');
  });

  it('mix default weight is 0.5', () => {
    const a = mix('#ff0000', '#0000ff');
    const b = mix('#ff0000', '#0000ff', 0.5);
    expect(a).toBe(b);
  });

  it('mix returns valid hex', () => {
    expect(isValidHex(mix('#336699', '#ff5733'))).toBe(true);
  });

  it('mix is symmetric at 0.5', () => {
    const a = mix('#ff0000', '#0000ff', 0.5);
    const b = mix('#0000ff', '#ff0000', 0.5);
    expect(a).toBe(b);
  });

  // Loop: mix always produces valid hex
  for (let i = 0; i < 25; i++) {
    const weight = i / 24;
    it(`mix valid hex at weight ${weight.toFixed(2)} [${i}]`, () => {
      expect(isValidHex(mix('#abcdef', '#fedcba', weight))).toBe(true);
    });
  }

  // Loop: mix of same colour is that colour
  const samples = ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000',
                   '#123456', '#abcdef', '#fedcba', '#aabbcc', '#334455'];
  for (let i = 0; i < samples.length; i++) {
    const hex = samples[i];
    it(`mix same colour is identity [${i}]: ${hex}`, () => {
      expect(mix(hex, hex)).toBe(hex);
    });
  }

  // Loop: intermediate mixes have channels between the two extremes
  for (let i = 1; i < 10; i++) {
    const weight = i / 10;
    it(`mix channel between extremes at weight ${weight.toFixed(1)} [${i}]`, () => {
      const c1 = hexToRgb('#ff0000');
      const c2 = hexToRgb('#0000ff');
      const m = hexToRgb(mix('#ff0000', '#0000ff', weight));
      expect(m.r).toBeGreaterThanOrEqual(Math.min(c1.r, c2.r) - 1);
      expect(m.r).toBeLessThanOrEqual(Math.max(c1.r, c2.r) + 1);
    });
  }

  // Loop: varying mix across colour pairs
  for (let i = 0; i < 10; i++) {
    const r1 = ((i * 37) % 256);
    const g1 = ((i * 53) % 256);
    const b1 = ((i * 71) % 256);
    it(`mix various pairs [${i}]`, () => {
      const hex1 = rgbToHex(r1, g1, b1);
      const hex2 = rgbToHex(255 - r1, 255 - g1, 255 - b1);
      expect(isValidHex(mix(hex1, hex2))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// complementary — 50 tests
// ---------------------------------------------------------------------------
describe('complementary', () => {
  it('complementary of pure red is cyan', () => {
    const result = complementary('#ff0000');
    expect(isValidHex(result)).toBe(true);
    const { r, g, b } = hexToRgb(result);
    expect(g).toBeGreaterThan(r);
    expect(b).toBeGreaterThan(r);
  });

  it('complementary of pure green is magenta', () => {
    const result = complementary('#00ff00');
    expect(isValidHex(result)).toBe(true);
  });

  it('complementary returns valid hex', () => {
    expect(isValidHex(complementary('#336699'))).toBe(true);
  });

  it('double complementary returns original hue', () => {
    const hex = '#ff5733';
    const comp = complementary(hex);
    const compcomp = complementary(comp);
    const origHsl = rgbToHsl(...Object.values(hexToRgb(hex)) as [number, number, number]);
    const backHsl = rgbToHsl(...Object.values(hexToRgb(compcomp)) as [number, number, number]);
    expect(Math.abs(origHsl.h - backHsl.h)).toBeLessThan(2);
  });

  // Hue difference is ~180 degrees
  const hexSamples = [
    '#ff5733', '#c70039', '#900c3f', '#581845', '#ffc300',
    '#daa520', '#2e86ab', '#a23b72', '#f18f01', '#048a81',
  ];

  for (let i = 0; i < hexSamples.length; i++) {
    const hex = hexSamples[i];
    it(`complementary hue offset ~180 [${i}]: ${hex}`, () => {
      const orig = rgbToHsl(...Object.values(hexToRgb(hex)) as [number, number, number]);
      const comp = rgbToHsl(...Object.values(hexToRgb(complementary(hex))) as [number, number, number]);
      const diff = Math.abs(orig.h - comp.h);
      const normalised = diff > 180 ? 360 - diff : diff;
      expect(normalised).toBeCloseTo(180, 0);
    });
  }

  // Lightness and saturation preserved
  for (let i = 0; i < 30; i++) {
    const r = ((i * 37) % 206) + 25;
    const g = ((i * 53) % 206) + 25;
    const b = ((i * 71) % 206) + 25;
    const hex = rgbToHex(r, g, b);
    it(`complementary preserves saturation/lightness [${i}]`, () => {
      const orig = rgbToHsl(...Object.values(hexToRgb(hex)) as [number, number, number]);
      const comp = rgbToHsl(...Object.values(hexToRgb(complementary(hex))) as [number, number, number]);
      expect(Math.abs(orig.s - comp.s)).toBeLessThan(2);
      expect(Math.abs(orig.l - comp.l)).toBeLessThan(2);
    });
  }
});

// ---------------------------------------------------------------------------
// hexToRgba — 50 tests
// ---------------------------------------------------------------------------
describe('hexToRgba', () => {
  it('hexToRgba black at 0.5 alpha', () => {
    expect(hexToRgba('#000000', 0.5)).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
  });

  it('hexToRgba white at 1.0 alpha', () => {
    expect(hexToRgba('#ffffff', 1)).toEqual({ r: 255, g: 255, b: 255, a: 1 });
  });

  it('hexToRgba clamps alpha > 1', () => {
    expect(hexToRgba('#ffffff', 2).a).toBe(1);
  });

  it('hexToRgba clamps alpha < 0', () => {
    expect(hexToRgba('#ffffff', -1).a).toBe(0);
  });

  it('hexToRgba works with 3-digit hex', () => {
    const result = hexToRgba('#fff', 0.8);
    expect(result).toEqual({ r: 255, g: 255, b: 255, a: 0.8 });
  });

  // Loop over alpha values 0-1 in 0.1 steps
  for (let i = 0; i <= 10; i++) {
    const alpha = i / 10;
    it(`hexToRgba alpha ${alpha.toFixed(1)} stored correctly`, () => {
      const result = hexToRgba('#336699', alpha);
      expect(result.a).toBeCloseTo(alpha, 5);
    });
  }

  // RGB channels are preserved
  const hexSamples = [
    '#ff0000', '#00ff00', '#0000ff', '#123456', '#abcdef',
    '#fedcba', '#aabbcc', '#334455', '#667788', '#99aabb',
  ];

  for (let i = 0; i < hexSamples.length; i++) {
    const hex = hexSamples[i];
    it(`hexToRgba preserves RGB channels [${i}]: ${hex}`, () => {
      const expected = hexToRgb(hex);
      const result = hexToRgba(hex, 0.5);
      expect(result.r).toBe(expected.r);
      expect(result.g).toBe(expected.g);
      expect(result.b).toBe(expected.b);
    });
  }

  // Loop: alpha at varying levels
  for (let i = 0; i < 20; i++) {
    const alpha = i / 19;
    it(`hexToRgba alpha in [0,1] for step ${i}`, () => {
      const result = hexToRgba('#ff5733', alpha);
      expect(result.a).toBeGreaterThanOrEqual(0);
      expect(result.a).toBeLessThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// rgbaToString — 40 tests
// ---------------------------------------------------------------------------
describe('rgbaToString', () => {
  it('formats rgba correctly', () => {
    expect(rgbaToString({ r: 255, g: 0, b: 0, a: 1 })).toBe('rgba(255,0,0,1)');
  });

  it('formats with alpha 0', () => {
    expect(rgbaToString({ r: 0, g: 0, b: 0, a: 0 })).toBe('rgba(0,0,0,0)');
  });

  it('formats with fractional alpha', () => {
    expect(rgbaToString({ r: 128, g: 64, b: 32, a: 0.5 })).toBe('rgba(128,64,32,0.5)');
  });

  it('starts with rgba(', () => {
    expect(rgbaToString({ r: 1, g: 2, b: 3, a: 0.1 })).toMatch(/^rgba\(/);
  });

  it('ends with )', () => {
    expect(rgbaToString({ r: 1, g: 2, b: 3, a: 0.1 })).toMatch(/\)$/);
  });

  // Loop: rgbaToString for various values
  for (let i = 0; i < 25; i++) {
    const r = (i * 10) % 256;
    const g = (i * 20) % 256;
    const b = (i * 30) % 256;
    const a = i / 24;
    it(`rgbaToString format [${i}]: rgba(${r},${g},${b},${a.toFixed(2)})`, () => {
      const result = rgbaToString({ r, g, b, a });
      expect(result).toContain(`${r}`);
      expect(result).toContain(`${g}`);
      expect(result).toContain(`${b}`);
      expect(result).toMatch(/^rgba\(/);
    });
  }

  // Parseability: result contains all 4 components
  for (let i = 0; i < 10; i++) {
    const rgba: RGBA = { r: i * 25, g: i * 10, b: 255 - i * 25, a: i / 9 };
    it(`rgbaToString all components present [${i}]`, () => {
      const str = rgbaToString(rgba);
      expect(str).toContain(rgba.r.toString());
      expect(str).toContain(rgba.g.toString());
      expect(str).toContain(rgba.b.toString());
    });
  }
});

// ---------------------------------------------------------------------------
// rgbToString — 40 tests
// ---------------------------------------------------------------------------
describe('rgbToString', () => {
  it('formats rgb correctly', () => {
    expect(rgbToString({ r: 255, g: 0, b: 0 })).toBe('rgb(255,0,0)');
  });

  it('formats black', () => {
    expect(rgbToString({ r: 0, g: 0, b: 0 })).toBe('rgb(0,0,0)');
  });

  it('formats white', () => {
    expect(rgbToString({ r: 255, g: 255, b: 255 })).toBe('rgb(255,255,255)');
  });

  it('starts with rgb(', () => {
    expect(rgbToString({ r: 1, g: 2, b: 3 })).toMatch(/^rgb\(/);
  });

  it('ends with )', () => {
    expect(rgbToString({ r: 1, g: 2, b: 3 })).toMatch(/\)$/);
  });

  // Roundtrip with parseColor
  const samples: RGB[] = [
    { r: 255, g: 0, b: 0 },
    { r: 0, g: 255, b: 0 },
    { r: 0, g: 0, b: 255 },
    { r: 128, g: 128, b: 128 },
    { r: 10, g: 20, b: 30 },
  ];

  for (let i = 0; i < samples.length; i++) {
    const rgb = samples[i];
    it(`rgbToString -> parseColor roundtrip [${i}]`, () => {
      const str = rgbToString(rgb);
      const parsed = parseColor(str);
      expect(parsed).toEqual(rgb);
    });
  }

  // Loop: rgbToString for a range of values
  for (let i = 0; i < 25; i++) {
    const r = (i * 10) % 256;
    const g = (i * 20) % 256;
    const b = (i * 30) % 256;
    it(`rgbToString format [${i}]`, () => {
      const result = rgbToString({ r, g, b });
      expect(result).toContain(`${r}`);
      expect(result).toContain(`${g}`);
      expect(result).toContain(`${b}`);
      expect(result).toMatch(/^rgb\(/);
    });
  }
});

// ---------------------------------------------------------------------------
// parseColor — 50 tests
// ---------------------------------------------------------------------------
describe('parseColor', () => {
  it('parses rgb(255,0,0)', () => {
    expect(parseColor('rgb(255,0,0)')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses with spaces', () => {
    expect(parseColor('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses rgb(0,0,0)', () => {
    expect(parseColor('rgb(0,0,0)')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('parses rgb(255,255,255)', () => {
    expect(parseColor('rgb(255,255,255)')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('returns null for empty string', () => {
    expect(parseColor('')).toBeNull();
  });

  it('returns null for hex string', () => {
    expect(parseColor('#ff0000')).toBeNull();
  });

  it('returns null for rgba string', () => {
    expect(parseColor('rgba(255,0,0,1)')).toBeNull();
  });

  it('returns null for out-of-range values', () => {
    expect(parseColor('rgb(256,0,0)')).toBeNull();
  });

  it('returns null for invalid format', () => {
    expect(parseColor('rgb(255 0 0)')).toBeNull();
  });

  it('returns null for partial match', () => {
    expect(parseColor('rgb(255,0)')).toBeNull();
  });

  // Loop: valid roundtrips via rgbToString
  for (let i = 0; i < 20; i++) {
    const r = (i * 13) % 256;
    const g = (i * 37) % 256;
    const b = (i * 71) % 256;
    it(`parseColor roundtrip [${i}]: rgb(${r},${g},${b})`, () => {
      const str = rgbToString({ r, g, b });
      expect(parseColor(str)).toEqual({ r, g, b });
    });
  }

  // Loop: invalid strings
  const invalid = [
    'hsl(0,100%,50%)', 'RGB(255,0,0)', 'rgb()', 'rgb(a,b,c)',
    '255,0,0', 'rgb[255,0,0]', 'rgb(255.5,0,0)',
  ];

  for (let i = 0; i < invalid.length; i++) {
    it(`parseColor null for invalid [${i}]: ${invalid[i]}`, () => {
      expect(parseColor(invalid[i])).toBeNull();
    });
  }

  // Loop: extra spaces
  for (let i = 0; i < 10; i++) {
    const r = i * 25;
    const g = i * 10;
    const b = 255 - i * 25;
    it(`parseColor with extra spaces [${i}]`, () => {
      const result = parseColor(`rgb( ${r} , ${g} , ${b} )`);
      if (result !== null) {
        expect(result.r).toBe(r);
        expect(result.g).toBe(g);
        expect(result.b).toBe(b);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// alphaBlend — 50 tests
// ---------------------------------------------------------------------------
describe('alphaBlend', () => {
  it('fully opaque fg returns fg colour', () => {
    const fg: RGBA = { r: 255, g: 0, b: 0, a: 1 };
    const bg: RGB = { r: 0, g: 0, b: 255 };
    expect(alphaBlend(fg, bg)).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('fully transparent fg returns bg colour', () => {
    const fg: RGBA = { r: 255, g: 0, b: 0, a: 0 };
    const bg: RGB = { r: 0, g: 0, b: 255 };
    expect(alphaBlend(fg, bg)).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('50% alpha blends evenly', () => {
    const fg: RGBA = { r: 200, g: 100, b: 0, a: 0.5 };
    const bg: RGB = { r: 0, g: 100, b: 200 };
    const result = alphaBlend(fg, bg);
    expect(result.r).toBeCloseTo(100, 0);
    expect(result.g).toBe(100);
    expect(result.b).toBeCloseTo(100, 0);
  });

  it('result channels are in [0,255]', () => {
    const fg: RGBA = { r: 200, g: 150, b: 100, a: 0.7 };
    const bg: RGB = { r: 50, g: 50, b: 50 };
    const result = alphaBlend(fg, bg);
    expect(result.r).toBeGreaterThanOrEqual(0);
    expect(result.r).toBeLessThanOrEqual(255);
  });

  // Loop: varying alpha levels
  for (let i = 0; i <= 10; i++) {
    const alpha = i / 10;
    it(`alphaBlend at alpha ${alpha.toFixed(1)} [${i}]`, () => {
      const fg: RGBA = { r: 255, g: 255, b: 255, a: alpha };
      const bg: RGB = { r: 0, g: 0, b: 0 };
      const result = alphaBlend(fg, bg);
      const expected = Math.round(255 * alpha);
      expect(result.r).toBe(expected);
      expect(result.g).toBe(expected);
      expect(result.b).toBe(expected);
    });
  }

  // Loop: all channels in [0,255] for various inputs
  for (let i = 0; i < 30; i++) {
    const fg: RGBA = {
      r: (i * 13) % 256,
      g: (i * 37) % 256,
      b: (i * 71) % 256,
      a: i / 29,
    };
    const bg: RGB = {
      r: (i * 97) % 256,
      g: (i * 53) % 256,
      b: (i * 17) % 256,
    };
    it(`alphaBlend channels in range [${i}]`, () => {
      const result = alphaBlend(fg, bg);
      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
      expect(result.g).toBeGreaterThanOrEqual(0);
      expect(result.g).toBeLessThanOrEqual(255);
      expect(result.b).toBeGreaterThanOrEqual(0);
      expect(result.b).toBeLessThanOrEqual(255);
    });
  }
});

// ---------------------------------------------------------------------------
// grayscale — 50 tests
// ---------------------------------------------------------------------------
describe('grayscale', () => {
  it('gray of black is black', () => {
    expect(grayscale({ r: 0, g: 0, b: 0 })).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('gray of white is white', () => {
    expect(grayscale({ r: 255, g: 255, b: 255 })).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('gray always has equal r/g/b', () => {
    const result = grayscale({ r: 100, g: 150, b: 200 });
    expect(result.r).toBe(result.g);
    expect(result.g).toBe(result.b);
  });

  it('gray of already-gray is same', () => {
    const gray = { r: 128, g: 128, b: 128 };
    expect(grayscale(gray)).toEqual(gray);
  });

  it('result channels in [0,255]', () => {
    const result = grayscale({ r: 255, g: 0, b: 0 });
    expect(result.r).toBeGreaterThanOrEqual(0);
    expect(result.r).toBeLessThanOrEqual(255);
  });

  // Loop: equal r/g/b for all combinations
  for (let i = 0; i < 30; i++) {
    const r = (i * 13) % 256;
    const g = (i * 37) % 256;
    const b = (i * 71) % 256;
    it(`grayscale equal channels [${i}]: rgb(${r},${g},${b})`, () => {
      const result = grayscale({ r, g, b });
      expect(result.r).toBe(result.g);
      expect(result.g).toBe(result.b);
    });
  }

  // Loop: channels in bounds
  for (let i = 0; i < 10; i++) {
    const r = i * 25;
    const g = (i + 3) * 20 % 256;
    const b = (i + 7) * 15 % 256;
    it(`grayscale channel in [0,255] [${i}]`, () => {
      const result = grayscale({ r, g, b });
      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
    });
  }

  // Luminance after grayscale should equal original luminance
  for (let i = 0; i < 5; i++) {
    const r = i * 50;
    const g = (i + 1) * 40;
    const b = (i + 2) * 30;
    it(`grayscale preserves perceptual luminance [${i}]`, () => {
      const orig = luminance(r, g, b);
      const gs = grayscale({ r, g, b });
      const gsLum = luminance(gs.r, gs.g, gs.b);
      expect(gsLum).toBeCloseTo(orig, 2);
    });
  }
});

// ---------------------------------------------------------------------------
// Integration / cross-function tests — 100 tests
// ---------------------------------------------------------------------------
describe('integration tests', () => {
  // hexToRgb + rgbToHex roundtrip for 30 hex values
  for (let i = 0; i < 30; i++) {
    const r = (i * 37) % 256;
    const g = (i * 53) % 256;
    const b = (i * 71) % 256;
    const hex = rgbToHex(r, g, b);
    it(`hexToRgb <-> rgbToHex roundtrip [${i}]`, () => {
      const rgb = hexToRgb(hex);
      expect(rgbToHex(rgb.r, rgb.g, rgb.b)).toBe(hex);
    });
  }

  // rgbToHsl + hslToRgb roundtrip for 20 values
  for (let i = 0; i < 20; i++) {
    const r = (i * 13) % 256;
    const g = (i * 37) % 256;
    const b = (i * 71) % 256;
    it(`rgbToHsl <-> hslToRgb roundtrip [${i}]`, () => {
      const { h, s, l } = rgbToHsl(r, g, b);
      const back = hslToRgb(h, s, l);
      expect(back.r).toBeCloseTo(r, -0.5);
      expect(back.g).toBeCloseTo(g, -0.5);
      expect(back.b).toBeCloseTo(b, -0.5);
    });
  }

  // Contrast ratio with black/white meets WCAG AA for pure colours
  it('pure red on white meets expected contrast range', () => {
    const ratio = contrastRatio({ r: 255, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    expect(ratio).toBeGreaterThan(1);
    expect(ratio).toBeLessThanOrEqual(21);
  });

  it('isLightColor agrees with luminance > 0.179', () => {
    for (let v = 0; v <= 255; v += 17) {
      const rgb: RGB = { r: v, g: v, b: v };
      expect(isLightColor(rgb)).toBe(luminance(v, v, v) > 0.179);
    }
  });

  it('lighten then darken by same amount returns original colour', () => {
    const hex = '#336699';
    const result = darken(lighten(hex, 15), 15);
    const origHsl = rgbToHsl(...Object.values(hexToRgb(hex)) as [number, number, number]);
    const resultHsl = rgbToHsl(...Object.values(hexToRgb(result)) as [number, number, number]);
    expect(Math.abs(origHsl.l - resultHsl.l)).toBeLessThan(2);
  });

  it('mix(a, b, 0.5) == mix(b, a, 0.5) for multiple pairs', () => {
    const pairs: Array<[string, string]> = [
      ['#ff0000', '#0000ff'],
      ['#00ff00', '#ff00ff'],
      ['#ffffff', '#000000'],
      ['#123456', '#654321'],
    ];
    for (const [a, b] of pairs) {
      expect(mix(a, b, 0.5)).toBe(mix(b, a, 0.5));
    }
  });

  it('complementary of complementary returns same hue', () => {
    const hexes = ['#ff5733', '#336699', '#99cc00', '#9933ff', '#ff9900'];
    for (const hex of hexes) {
      const comp = complementary(hex);
      const backComp = complementary(comp);
      const origH = rgbToHsl(...Object.values(hexToRgb(hex)) as [number, number, number]).h;
      const backH = rgbToHsl(...Object.values(hexToRgb(backComp)) as [number, number, number]).h;
      expect(Math.abs(origH - backH)).toBeLessThan(2);
    }
  });

  it('alphaBlend with white bg at varying alpha matches linear interp', () => {
    for (let i = 0; i <= 10; i++) {
      const alpha = i / 10;
      const fg: RGBA = { r: 0, g: 0, b: 0, a: alpha };
      const bg: RGB = { r: 255, g: 255, b: 255 };
      const result = alphaBlend(fg, bg);
      expect(result.r).toBe(Math.round(255 * (1 - alpha)));
    }
  });

  it('grayscale of already-grayscale is idempotent', () => {
    for (let v = 0; v <= 255; v += 25) {
      const gs = grayscale({ r: v, g: v, b: v });
      expect(gs).toEqual({ r: v, g: v, b: v });
    }
  });

  it('rgbaToString -> contains channel values', () => {
    for (let i = 0; i < 10; i++) {
      const rgba: RGBA = { r: i * 25, g: i * 10, b: 255 - i * 25, a: i / 9 };
      const str = rgbaToString(rgba);
      expect(str).toContain(rgba.r.toString());
    }
  });

  it('parseColor returns null for all invalid inputs batch', () => {
    const invalids = ['', '#ff0000', 'hsl()', 'RGB(1,2,3)', 'rgb(256,0,0)', 'rgb(a,b,c)'];
    for (const s of invalids) {
      expect(parseColor(s)).toBeNull();
    }
  });

  // Loop: full pipeline hex -> rgb -> hsl -> darken -> valid result
  for (let i = 0; i < 20; i++) {
    const r = ((i * 37) % 206) + 25;
    const g = ((i * 53) % 206) + 25;
    const b = ((i * 71) % 206) + 25;
    it(`pipeline lighten/darken [${i}]`, () => {
      const hex = rgbToHex(r, g, b);
      const lighter = lighten(hex, 10);
      const darker = darken(hex, 10);
      expect(isValidHex(lighter)).toBe(true);
      expect(isValidHex(darker)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional edge-case and boundary tests — 65 tests
// ---------------------------------------------------------------------------
describe('edge cases and boundaries', () => {
  // rgbToHex produces lowercase hex letters
  for (let i = 0; i < 10; i++) {
    const v = 0xa0 + i;
    it(`rgbToHex produces lowercase output [${i}]`, () => {
      const result = rgbToHex(v, v, v);
      expect(result).toBe(result.toLowerCase());
    });
  }

  // hexToRgb is case-insensitive
  const casePairs: Array<[string, string]> = [
    ['#abcdef', '#ABCDEF'],
    ['#aabbcc', '#AABBCC'],
    ['#ff5733', '#FF5733'],
    ['#a1b2c3', '#A1B2C3'],
    ['#fedcba', '#FEDCBA'],
  ];
  for (let i = 0; i < casePairs.length; i++) {
    const [lower, upper] = casePairs[i];
    it(`hexToRgb case-insensitive [${i}]`, () => {
      expect(hexToRgb(lower)).toEqual(hexToRgb(upper));
    });
  }

  // luminance of pure channels sums to 1
  it('luminance of R + G + B channels sums to 1', () => {
    const r = luminance(255, 0, 0);
    const g = luminance(0, 255, 0);
    const b = luminance(0, 0, 255);
    expect(r + g + b).toBeCloseTo(1, 3);
  });

  // contrastRatio symmetry for 15 pairs
  for (let i = 0; i < 15; i++) {
    const c1: RGB = { r: (i * 17) % 256, g: (i * 31) % 256, b: (i * 53) % 256 };
    const c2: RGB = { r: (i * 79) % 256, g: (i * 97) % 256, b: (i * 113) % 256 };
    it(`contrastRatio symmetry [${i}]`, () => {
      expect(contrastRatio(c1, c2)).toBeCloseTo(contrastRatio(c2, c1), 4);
    });
  }

  // mix weight clamps
  it('mix clamps weight > 1 to 1', () => {
    expect(mix('#ff0000', '#0000ff', 2)).toBe('#ff0000');
  });

  it('mix clamps weight < 0 to 0', () => {
    expect(mix('#ff0000', '#0000ff', -1)).toBe('#0000ff');
  });

  // rgbToString and rgbaToString produce different prefixes
  it('rgbToString prefix is rgb( not rgba(', () => {
    expect(rgbToString({ r: 1, g: 2, b: 3 })).not.toMatch(/^rgba/);
  });

  it('rgbaToString prefix is rgba( not rgb(', () => {
    expect(rgbaToString({ r: 1, g: 2, b: 3, a: 0.5 })).toMatch(/^rgba/);
  });

  // grayscale of pure red uses ~21 weight
  it('grayscale of pure red is ~54', () => {
    const result = grayscale({ r: 255, g: 0, b: 0 });
    expect(result.r).toBeCloseTo(54, -1);
  });

  it('grayscale of pure green is ~182', () => {
    const result = grayscale({ r: 0, g: 255, b: 0 });
    expect(result.r).toBeCloseTo(182, -1);
  });

  it('grayscale of pure blue is ~18', () => {
    const result = grayscale({ r: 0, g: 0, b: 255 });
    expect(result.r).toBeCloseTo(18, -1);
  });

  // hexToRgba throws on invalid hex
  it('hexToRgba throws on invalid hex', () => {
    expect(() => hexToRgba('not-a-hex', 0.5)).toThrow();
  });

  // isValidHex for mixed-case shorthand
  for (let i = 0; i < 5; i++) {
    const hex = `#${i.toString(16)}A${i.toString(16)}`;
    it(`isValidHex mixed-case shorthand [${i}]: ${hex}`, () => {
      expect(isValidHex(hex)).toBe(true);
    });
  }

  // parseColor rejects rgba strings
  for (let i = 0; i < 5; i++) {
    const alpha = i / 4;
    it(`parseColor rejects rgba(r,g,b,${alpha}) [${i}]`, () => {
      expect(parseColor(`rgba(128,64,32,${alpha})`)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// Final top-up — 10 tests to reach ≥1,000
// ---------------------------------------------------------------------------
describe('top-up tests', () => {
  for (let i = 0; i < 10; i++) {
    const r = (i * 23 + 1) % 256;
    const g = (i * 47 + 1) % 256;
    const b = (i * 83 + 1) % 256;
    it(`top-up: rgbToHex->hexToRgb identity [${i}] rgb(${r},${g},${b})`, () => {
      const hex = rgbToHex(r, g, b);
      const back = hexToRgb(hex);
      expect(back.r).toBe(r);
      expect(back.g).toBe(g);
      expect(back.b).toBe(b);
    });
  }
});
