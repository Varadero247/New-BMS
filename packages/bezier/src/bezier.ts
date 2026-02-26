// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface Vec2 { x: number; y: number; }

export function vec2(x: number, y: number): Vec2 { return { x, y }; }

export function linear(t: number, p0: Vec2, p1: Vec2): Vec2 {
  return { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t };
}

export function quadratic(t: number, p0: Vec2, p1: Vec2, p2: Vec2): Vec2 {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

export function cubic(t: number, p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2): Vec2 {
  const u = 1 - t, u2 = u * u, t2 = t * t;
  const b0 = u2 * u, b1 = 3 * u2 * t, b2 = 3 * u * t2, b3 = t2 * t;
  return {
    x: b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
    y: b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y,
  };
}

export function cubicDerivative(t: number, p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2): Vec2 {
  const u = 1 - t;
  const dx = 3 * (u * u * (p1.x - p0.x) + 2 * u * t * (p2.x - p1.x) + t * t * (p3.x - p2.x));
  const dy = 3 * (u * u * (p1.y - p0.y) + 2 * u * t * (p2.y - p1.y) + t * t * (p3.y - p2.y));
  return { x: dx, y: dy };
}

export function arcLength(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, steps = 100): number {
  let len = 0;
  let prev = cubic(0, p0, p1, p2, p3);
  for (let i = 1; i <= steps; i++) {
    const cur = cubic(i / steps, p0, p1, p2, p3);
    const dx = cur.x - prev.x, dy = cur.y - prev.y;
    len += Math.sqrt(dx * dx + dy * dy);
    prev = cur;
  }
  return len;
}

export interface BoundingBox { minX: number; minY: number; maxX: number; maxY: number; }

export function boundingBox(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2): BoundingBox {
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i <= 20; i++) {
    const pt = cubic(i / 20, p0, p1, p2, p3);
    xs.push(pt.x); ys.push(pt.y);
  }
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) };
}

export function split(t: number, p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2): [Vec2[], Vec2[]] {
  const p01 = linear(t, p0, p1), p12 = linear(t, p1, p2), p23 = linear(t, p2, p3);
  const p012 = linear(t, p01, p12), p123 = linear(t, p12, p23);
  const p0123 = linear(t, p012, p123);
  return [[p0, p01, p012, p0123], [p0123, p123, p23, p3]];
}

export function elevate(p0: Vec2, p1: Vec2, p2: Vec2): [Vec2, Vec2, Vec2, Vec2] {
  const q0 = p0;
  const q1 = { x: (p0.x + 2 * p1.x) / 3, y: (p0.y + 2 * p1.y) / 3 };
  const q2 = { x: (2 * p1.x + p2.x) / 3, y: (2 * p1.y + p2.y) / 3 };
  const q3 = p2;
  return [q0, q1, q2, q3];
}

export function isFlatEnough(p0: Vec2, p1: Vec2, p2: Vec2, p3: Vec2, tolerance = 1): boolean {
  const ux = 3 * p1.x - 2 * p0.x - p3.x, uy = 3 * p1.y - 2 * p0.y - p3.y;
  const vx = 3 * p2.x - p0.x - 2 * p3.x, vy = 3 * p2.y - p0.y - 2 * p3.y;
  const maxSq = Math.max(ux * ux + uy * uy, vx * vx + vy * vy);
  return maxSq <= tolerance * tolerance * 16;
}

export function dist2(a: Vec2, b: Vec2): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
