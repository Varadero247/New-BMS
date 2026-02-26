// Copyright (c) 2026 Nexara DMCC. All rights reserved.

function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0x100000000; };
}

export function whiteNoise(seed: number): number {
  return lcg(seed)();
}

export function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }

export function fade(t: number): number { return t * t * t * (t * (t * 6 - 15) + 10); }

export function grad1D(hash: number, x: number): number {
  return (hash & 1) ? x : -x;
}

export function permutation(seed: number): number[] {
  const rng = lcg(seed);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}

export function perlin1D(x: number, seed = 0): number {
  const perm = permutation(seed);
  const xi = Math.floor(x) & 255;
  const xf = x - Math.floor(x);
  const u = fade(xf);
  const g0 = grad1D(perm[xi], xf);
  const g1 = grad1D(perm[(xi + 1) & 255], xf - 1);
  return lerp(g0, g1, u);
}

export function valueNoise1D(x: number, seed = 0): number {
  const perm = permutation(seed);
  const xi = Math.floor(x) & 255;
  const xf = x - Math.floor(x);
  const u = fade(xf);
  const v0 = perm[xi] / 255;
  const v1 = perm[(xi + 1) & 255] / 255;
  return lerp(v0, v1, u);
}

export function fractalNoise1D(
  x: number,
  octaves = 4,
  persistence = 0.5,
  lacunarity = 2,
  seed = 0
): number {
  let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += perlin1D(x * frequency, seed + i) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  return value / maxValue;
}

export function perlin2D(x: number, y: number, seed = 0): number {
  const perm = permutation(seed);
  const xi = Math.floor(x) & 255, yi = Math.floor(y) & 255;
  const xf = x - Math.floor(x), yf = y - Math.floor(y);
  const u = fade(xf), v = fade(yf);
  const h00 = perm[(perm[xi] + yi) & 255];
  const h10 = perm[(perm[(xi + 1) & 255] + yi) & 255];
  const h01 = perm[(perm[xi] + yi + 1) & 255];
  const h11 = perm[(perm[(xi + 1) & 255] + yi + 1) & 255];
  const g00 = grad1D(h00, xf) * grad1D(h00 >> 1, yf);
  const g10 = grad1D(h10, xf - 1) * grad1D(h10 >> 1, yf);
  const g01 = grad1D(h01, xf) * grad1D(h01 >> 1, yf - 1);
  const g11 = grad1D(h11, xf - 1) * grad1D(h11 >> 1, yf - 1);
  return lerp(lerp(g00, g10, u), lerp(g01, g11, u), v);
}

export function fractalNoise2D(
  x: number, y: number,
  octaves = 4, persistence = 0.5, lacunarity = 2, seed = 0
): number {
  let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += perlin2D(x * frequency, y * frequency, seed + i) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  return value / maxValue;
}

export function turbulence(x: number, octaves = 4, seed = 0): number {
  let value = 0, amplitude = 1, frequency = 1, maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += Math.abs(perlin1D(x * frequency, seed + i)) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / maxValue;
}

export function normalize(values: number[]): number[] {
  const min = Math.min(...values), max = Math.max(...values);
  if (max === min) return values.map(() => 0);
  return values.map(v => (v - min) / (max - min));
}
