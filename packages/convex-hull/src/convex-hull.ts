// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface Point {
  x: number;
  y: number;
}

// Cross product of vectors OA and OB
function cross(O: Point, A: Point, B: Point): number {
  return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
}

// Graham scan / Andrew's monotone chain - O(n log n)
export function convexHull(points: Point[]): Point[] {
  if (points.length <= 1) return [...points];
  const sorted = [...points].sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
  const lower: Point[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return [...lower, ...upper];
}

export function isConvex(points: Point[]): boolean {
  const hull = convexHull(points);
  if (hull.length !== points.length) return false;
  return true;
}

export function pointInHull(hull: Point[], p: Point): boolean {
  const n = hull.length;
  if (n === 0) return false;
  if (n === 1) return hull[0].x === p.x && hull[0].y === p.y;
  for (let i = 0; i < n; i++) {
    if (cross(hull[i], hull[(i+1)%n], p) < 0) return false;
  }
  return true;
}

export function hullArea(hull: Point[]): number {
  const n = hull.length;
  if (n < 3) return 0;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += hull[i].x * hull[j].y;
    area -= hull[j].x * hull[i].y;
  }
  return Math.abs(area) / 2;
}

export function hullPerimeter(hull: Point[]): number {
  const n = hull.length;
  if (n < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const dx = hull[j].x - hull[i].x;
    const dy = hull[j].y - hull[i].y;
    perimeter += Math.sqrt(dx*dx + dy*dy);
  }
  return perimeter;
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt((b.x-a.x)**2 + (b.y-a.y)**2);
}

export function centroid(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

export function boundingBox(points: Point[]): { min: Point; max: Point } | null {
  if (points.length === 0) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  }
  return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } };
}

export function grahamScan(points: Point[]): Point[] {
  return convexHull(points); // alias
}

export function upperHull(points: Point[]): Point[] {
  const sorted = [...points].sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
  const upper: Point[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return upper;
}

export function lowerHull(points: Point[]): Point[] {
  const sorted = [...points].sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);
  const lower: Point[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], p) <= 0) lower.pop();
    lower.push(p);
  }
  return lower;
}
