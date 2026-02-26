// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/** Clamp a number between min and max. */
export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

/** Parse a #RRGGBB hex string into [r, g, b] (0-255). */
export function parseHex(hex: string): [number, number, number] {
  const h = hex.replace(/^#/, '');
  const n = parseInt(h, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/** Convert r, g, b (0-255) to a #RRGGBB hex string. */
export function toHex(r: number, g: number, b: number): string {
  const toB = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return `#${toB(r)}${toB(g)}${toB(b)}`;
}

/** Convert r, g, b (0-255) to [h (0-360), s (0-100), l (0-100)]. */
export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) {
    h = (gn - bn) / d + (gn < bn ? 6 : 0);
  } else if (max === gn) {
    h = (bn - rn) / d + 2;
  } else {
    h = (rn - gn) / d + 4;
  }
  h /= 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hueToRgb(p: number, q: number, t: number): number {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

/** Convert h (0-360), s (0-100), l (0-100) to [r, g, b] (0-255). */
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hn = h / 360, sn = s / 100, ln = l / 100;
  if (sn === 0) {
    const v = Math.round(ln * 255);
    return [v, v, v];
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  return [
    Math.round(hueToRgb(p, q, hn + 1 / 3) * 255),
    Math.round(hueToRgb(p, q, hn) * 255),
    Math.round(hueToRgb(p, q, hn - 1 / 3) * 255),
  ];
}

/** WCAG relative luminance of an sRGB color (r, g, b in 0-255). */
export function luminance(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio between two colors. */
export function contrastRatio(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  const l1 = luminance(r1, g1, b1);
  const l2 = luminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Check WCAG accessibility: AA requires ≥4.5:1 (3:1 large text), AAA requires ≥7:1. */
export function isAccessible(ratio: number, level: 'AA' | 'AAA'): boolean {
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/** Lighten an RGB color by a percentage (0-100). */
export function lighten(r: number, g: number, b: number, amount: number): [number, number, number] {
  const [h, s, l] = rgbToHsl(r, g, b);
  return hslToRgb(h, s, clamp(l + amount, 0, 100));
}

/** Darken an RGB color by a percentage (0-100). */
export function darken(r: number, g: number, b: number, amount: number): [number, number, number] {
  const [h, s, l] = rgbToHsl(r, g, b);
  return hslToRgb(h, s, clamp(l - amount, 0, 100));
}

/** Mix two RGB colors with a weight (0=all color1, 1=all color2). */
export function mix(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number,
  weight: number
): [number, number, number] {
  const w = clamp(weight, 0, 1);
  return [
    Math.round(r1 * (1 - w) + r2 * w),
    Math.round(g1 * (1 - w) + g2 * w),
    Math.round(b1 * (1 - w) + b2 * w),
  ];
}

/** Get the complementary color (opposite hue). */
export function complementary(r: number, g: number, b: number): [number, number, number] {
  const [h, s, l] = rgbToHsl(r, g, b);
  return hslToRgb((h + 180) % 360, s, l);
}

/** Get the two triadic colors (±120 degrees). */
export function triadic(
  r: number, g: number, b: number
): [[number, number, number], [number, number, number]] {
  const [h, s, l] = rgbToHsl(r, g, b);
  return [
    hslToRgb((h + 120) % 360, s, l),
    hslToRgb((h + 240) % 360, s, l),
  ];
}

/** Get the two analogous colors (±30 degrees). */
export function analogous(
  r: number, g: number, b: number
): [[number, number, number], [number, number, number]] {
  const [h, s, l] = rgbToHsl(r, g, b);
  return [
    hslToRgb((h + 30) % 360, s, l),
    hslToRgb((h + 330) % 360, s, l),
  ];
}

/** Return true if the color's relative luminance is greater than 0.5. */
export function isLight(r: number, g: number, b: number): boolean {
  return luminance(r, g, b) > 0.5;
}
