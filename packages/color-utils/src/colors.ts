// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { RGB, RGBA, HSL } from './types';

/**
 * Clamp a number to the range [min, max].
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Round a number to a given number of decimal places.
 */
function round(value: number, decimals = 4): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Validate whether a string is a valid CSS hex colour (#rgb or #rrggbb).
 */
export function isValidHex(hex: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

/**
 * Expand a shorthand hex ('#abc') to full form ('#aabbcc').
 * Returns the input unchanged if already in full form.
 */
function expandHex(hex: string): string {
  const clean = hex.startsWith('#') ? hex.slice(1) : hex;
  if (clean.length === 3) {
    return '#' + clean.split('').map((c) => c + c).join('');
  }
  return '#' + clean;
}

/**
 * Parse '#rgb' or '#rrggbb' to { r, g, b } (each 0-255).
 * Throws if the input is not a valid hex colour.
 */
export function hexToRgb(hex: string): RGB {
  if (!isValidHex(hex)) throw new Error(`Invalid hex color: ${hex}`);
  const full = expandHex(hex);
  const r = parseInt(full.slice(1, 3), 16);
  const g = parseInt(full.slice(3, 5), 16);
  const b = parseInt(full.slice(5, 7), 16);
  return { r, g, b };
}

/**
 * Convert { r, g, b } (each 0-255) to a '#rrggbb' hex string.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert RGB (0-255) to HSL (h: 0-360, s: 0-100, l: 0-100).
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === rn) {
      h = ((gn - bn) / delta) % 6;
    } else if (max === gn) {
      h = (bn - rn) / delta + 2;
    } else {
      h = (rn - gn) / delta + 4;
    }
    h = h * 60;
    if (h < 0) h += 360;
  }

  return {
    h: round(h, 2),
    s: round(s * 100, 2),
    l: round(l * 100, 2),
  };
}

/**
 * Convert HSL (h: 0-360, s: 0-100, l: 0-100) to RGB (0-255).
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;

  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60)       { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else              { r1 = c; g1 = 0; b1 = x; }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

/**
 * Compute WCAG relative luminance for an RGB colour (0-255 each).
 * Result is in [0, 1].
 */
export function luminance(r: number, g: number, b: number): number {
  const toLinear = (c: number): number => {
    const cn = c / 255;
    return cn <= 0.04045 ? cn / 12.92 : Math.pow((cn + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Compute the WCAG contrast ratio between two RGB colours.
 * Result is in [1, 21].
 */
export function contrastRatio(rgb1: RGB, rgb2: RGB): number {
  const l1 = luminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = luminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return round((lighter + 0.05) / (darker + 0.05), 4);
}

/**
 * Return true if the colour has a relative luminance > 0.179 (considered "light").
 */
export function isLightColor(rgb: RGB): boolean {
  return luminance(rgb.r, rgb.g, rgb.b) > 0.179;
}

/**
 * Lighten a hex colour by `amount` percentage points (0-100) in HSL space.
 */
export function lighten(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  const newL = clamp(hsl.l + amount, 0, 100);
  const { r: nr, g: ng, b: nb } = hslToRgb(hsl.h, hsl.s, newL);
  return rgbToHex(nr, ng, nb);
}

/**
 * Darken a hex colour by `amount` percentage points (0-100) in HSL space.
 */
export function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  const newL = clamp(hsl.l - amount, 0, 100);
  const { r: nr, g: ng, b: nb } = hslToRgb(hsl.h, hsl.s, newL);
  return rgbToHex(nr, ng, nb);
}

/**
 * Mix two hex colours. `weight` is the proportion of hex1 (0 = all hex2, 1 = all hex1).
 * Default weight is 0.5.
 */
export function mix(hex1: string, hex2: string, weight = 0.5): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const w = clamp(weight, 0, 1);
  return rgbToHex(
    Math.round(c1.r * w + c2.r * (1 - w)),
    Math.round(c1.g * w + c2.g * (1 - w)),
    Math.round(c1.b * w + c2.b * (1 - w)),
  );
}

/**
 * Return the complementary colour (hue rotated by 180°) as a hex string.
 */
export function complementary(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  const newH = (hsl.h + 180) % 360;
  const { r: nr, g: ng, b: nb } = hslToRgb(newH, hsl.s, hsl.l);
  return rgbToHex(nr, ng, nb);
}

/**
 * Parse a hex colour and add an alpha channel, returning an RGBA object.
 */
export function hexToRgba(hex: string, alpha: number): RGBA {
  const { r, g, b } = hexToRgb(hex);
  return { r, g, b, a: clamp(alpha, 0, 1) };
}

/**
 * Serialise an RGBA object to 'rgba(r,g,b,a)'.
 */
export function rgbaToString(rgba: RGBA): string {
  return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
}

/**
 * Serialise an RGB object to 'rgb(r,g,b)'.
 */
export function rgbToString(rgb: RGB): string {
  return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
}

/**
 * Parse a CSS 'rgb(r, g, b)' or 'rgb(r,g,b)' string to an RGB object.
 * Returns null if parsing fails.
 */
export function parseColor(input: string): RGB | null {
  const match = input.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);
  if (!match) return null;
  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  if (r > 255 || g > 255 || b > 255) return null;
  return { r, g, b };
}

/**
 * Alpha-composite a foreground RGBA colour over a background RGB colour.
 * Uses the standard Porter-Duff "over" operation.
 */
export function alphaBlend(fg: RGBA, bg: RGB): RGB {
  const a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
  };
}

/**
 * Convert an RGB colour to its grayscale equivalent using the
 * luminosity method (same weights as WCAG luminance).
 */
export function grayscale(rgb: RGB): RGB {
  const gray = Math.round(0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b);
  return { r: gray, g: gray, b: gray };
}
