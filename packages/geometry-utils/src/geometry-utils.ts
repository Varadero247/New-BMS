// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export interface Point2D { x: number; y: number; }
export interface Point3D { x: number; y: number; z: number; }
export interface Line2D { p1: Point2D; p2: Point2D; }
export interface Circle { center: Point2D; radius: number; }
export interface Rectangle { x: number; y: number; width: number; height: number; }

export function distance2D(a: Point2D, b: Point2D): number {
  return Math.sqrt((b.x-a.x)**2 + (b.y-a.y)**2);
}

export function distance3D(a: Point3D, b: Point3D): number {
  return Math.sqrt((b.x-a.x)**2 + (b.y-a.y)**2 + (b.z-a.z)**2);
}

export function midpoint(a: Point2D, b: Point2D): Point2D {
  return { x: (a.x+b.x)/2, y: (a.y+b.y)/2 };
}

export function slope(p1: Point2D, p2: Point2D): number {
  return (p2.y - p1.y) / (p2.x - p1.x);
}

export function areaTriangle(a: Point2D, b: Point2D, c: Point2D): number {
  return Math.abs((b.x-a.x)*(c.y-a.y) - (c.x-a.x)*(b.y-a.y)) / 2;
}

export function perimeterTriangle(a: Point2D, b: Point2D, c: Point2D): number {
  return distance2D(a,b) + distance2D(b,c) + distance2D(c,a);
}

export function areaCircle(r: number): number { return Math.PI * r * r; }
export function circumferenceCircle(r: number): number { return 2 * Math.PI * r; }

export function areaRectangle(r: Rectangle): number { return r.width * r.height; }
export function perimeterRectangle(r: Rectangle): number { return 2 * (r.width + r.height); }

export function dotProduct(a: Point2D, b: Point2D): number { return a.x*b.x + a.y*b.y; }
export function crossProduct(a: Point2D, b: Point2D): number { return a.x*b.y - a.y*b.x; }

export function normalize(v: Point2D): Point2D {
  const len = Math.sqrt(v.x**2 + v.y**2);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x/len, y: v.y/len };
}

export function convexHull(points: Point2D[]): Point2D[] {
  if (points.length < 3) return [...points];
  const sorted = [...points].sort((a,b) => a.x-b.x || a.y-b.y);
  const cross = (o: Point2D, a: Point2D, b: Point2D) => (a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const lower: Point2D[] = [];
  for (const p of sorted) { while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], p) <= 0) lower.pop(); lower.push(p); }
  const upper: Point2D[] = [];
  for (let i = sorted.length-1; i >= 0; i--) { const p = sorted[i]; while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], p) <= 0) upper.pop(); upper.push(p); }
  lower.pop(); upper.pop();
  return lower.concat(upper);
}

export function pointInCircle(p: Point2D, c: Circle): boolean {
  return distance2D(p, c.center) <= c.radius;
}

export function pointInRectangle(p: Point2D, r: Rectangle): boolean {
  return p.x >= r.x && p.x <= r.x+r.width && p.y >= r.y && p.y <= r.y+r.height;
}

export function degreesToRadians(deg: number): number { return deg * Math.PI / 180; }
export function radiansToDegrees(rad: number): number { return rad * 180 / Math.PI; }
