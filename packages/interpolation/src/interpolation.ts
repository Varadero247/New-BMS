// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export function linear(a: number, b: number, t: number): number { return a + (b - a) * t; }

export function bilinear(q00: number, q10: number, q01: number, q11: number, tx: number, ty: number): number {
  return linear(linear(q00, q10, tx), linear(q01, q11, tx), ty);
}

export function cosine(a: number, b: number, t: number): number {
  const t2 = (1 - Math.cos(t * Math.PI)) / 2;
  return a * (1 - t2) + b * t2;
}

export function cubic(y0: number, y1: number, y2: number, y3: number, t: number): number {
  const a0 = y3 - y2 - y0 + y1;
  const a1 = y0 - y1 - a0;
  const a2 = y2 - y0;
  const a3 = y1;
  return a0 * t ** 3 + a1 * t ** 2 + a2 * t + a3;
}

export function hermite(y0: number, y1: number, t0: number, t1: number, t: number): number {
  const t2 = t * t, t3 = t2 * t;
  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  return h00 * y0 + h10 * t0 + h01 * y1 + h11 * t1;
}

export function smoothstep(a: number, b: number, t: number): number {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

export function smootherstep(a: number, b: number, t: number): number {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export function inverseLerp(a: number, b: number, value: number): number {
  if (a === b) return 0;
  return (value - a) / (b - a);
}

export function remap(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  return outMin + (outMax - outMin) * inverseLerp(inMin, inMax, value);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function nearestNeighbor(a: number, b: number, t: number): number {
  return t < 0.5 ? a : b;
}

export function multiPoint(points: number[], t: number): number {
  if (points.length === 0) return 0;
  if (points.length === 1) return points[0];
  const segments = points.length - 1;
  const scaled = t * segments;
  const i = Math.min(Math.floor(scaled), segments - 1);
  return linear(points[i], points[i + 1], scaled - i);
}

export function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return a + diff * t;
}

export function lagrange(xs: number[], ys: number[], x: number): number {
  let result = 0;
  for (let i = 0; i < xs.length; i++) {
    let term = ys[i];
    for (let j = 0; j < xs.length; j++) {
      if (i !== j) term *= (x - xs[j]) / (xs[i] - xs[j]);
    }
    result += term;
  }
  return result;
}

export function splinePoint(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  );
}
