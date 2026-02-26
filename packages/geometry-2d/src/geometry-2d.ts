// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface Point { x: number; y: number; }
export interface Line { p1: Point; p2: Point; }
export interface Circle { center: Point; radius: number; }
export interface Rectangle { x: number; y: number; width: number; height: number; }

export const EPS = 1e-9;

export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

export function distanceSq(a: Point, b: Point): number {
  return (a.x-b.x)**2 + (a.y-b.y)**2;
}

export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x+b.x)/2, y: (a.y+b.y)/2 };
}

export function translate(p: Point, dx: number, dy: number): Point {
  return { x: p.x+dx, y: p.y+dy };
}

export function scale(p: Point, sx: number, sy: number): Point {
  return { x: p.x*sx, y: p.y*sy };
}

export function rotate(p: Point, angle: number, origin: Point = {x:0,y:0}): Point {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const dx = p.x - origin.x, dy = p.y - origin.y;
  return { x: origin.x + dx*cos - dy*sin, y: origin.y + dx*sin + dy*cos };
}

export function cross(o: Point, a: Point, b: Point): number {
  return (a.x-o.x)*(b.y-o.y) - (a.y-o.y)*(b.x-o.x);
}

export function dot(a: Point, b: Point): number { return a.x*b.x + a.y*b.y; }

export function magnitude(p: Point): number { return Math.sqrt(p.x*p.x+p.y*p.y); }

export function normalize(p: Point): Point {
  const mag = magnitude(p);
  return mag < EPS ? { x: 0, y: 0 } : { x: p.x/mag, y: p.y/mag };
}

export function angle(a: Point, b: Point): number {
  return Math.atan2(b.y-a.y, b.x-a.x);
}

export function angleBetween(a: Point, b: Point): number {
  const dotAB = dot(a, b);
  const mags = magnitude(a) * magnitude(b);
  if (mags < EPS) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dotAB/mags)));
}

export function pointOnSegment(p: Point, a: Point, b: Point): boolean {
  const c = cross({ x: 0, y: 0 }, { x: b.x-a.x, y: b.y-a.y }, { x: p.x-a.x, y: p.y-a.y });
  if (Math.abs(c) > EPS) return false;
  return Math.min(a.x,b.x) <= p.x+EPS && p.x <= Math.max(a.x,b.x)+EPS &&
         Math.min(a.y,b.y) <= p.y+EPS && p.y <= Math.max(a.y,b.y)+EPS;
}

export function segmentsIntersect(a1: Point, a2: Point, b1: Point, b2: Point): boolean {
  const d1 = cross(b1, b2, a1);
  const d2 = cross(b1, b2, a2);
  const d3 = cross(a1, a2, b1);
  const d4 = cross(a1, a2, b2);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
      ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  if (Math.abs(d1) < EPS && pointOnSegment(a1, b1, b2)) return true;
  if (Math.abs(d2) < EPS && pointOnSegment(a2, b1, b2)) return true;
  if (Math.abs(d3) < EPS && pointOnSegment(b1, a1, a2)) return true;
  if (Math.abs(d4) < EPS && pointOnSegment(b2, a1, a2)) return true;
  return false;
}

export function polygonArea(pts: Point[]): number {
  const n = pts.length;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const j = (i+1) % n;
    area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

export function polygonPerimeter(pts: Point[]): number {
  let p = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) p += distance(pts[i], pts[(i+1)%n]);
  return p;
}

export function pointInPolygon(pt: Point, polygon: Point[]): boolean {
  const n = polygon.length;
  let inside = false;
  for (let i = 0, j = n-1; i < n; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    if (((yi > pt.y) !== (yj > pt.y)) && (pt.x < (xj-xi)*(pt.y-yi)/(yj-yi)+xi)) {
      inside = !inside;
    }
  }
  return inside;
}

export function isConvexPolygon(pts: Point[]): boolean {
  const n = pts.length;
  if (n < 3) return false;
  let sign = 0;
  for (let i = 0; i < n; i++) {
    const c = cross(pts[i], pts[(i+1)%n], pts[(i+2)%n]);
    if (Math.abs(c) > EPS) {
      const s = c > 0 ? 1 : -1;
      if (sign === 0) sign = s;
      else if (s !== sign) return false;
    }
  }
  return true;
}

export function centroid(pts: Point[]): Point {
  const n = pts.length;
  return { x: pts.reduce((s, p) => s+p.x, 0)/n, y: pts.reduce((s, p) => s+p.y, 0)/n };
}

export function boundingBox(pts: Point[]): Rectangle {
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const minX = Math.min(...xs), minY = Math.min(...ys);
  const maxX = Math.max(...xs), maxY = Math.max(...ys);
  return { x: minX, y: minY, width: maxX-minX, height: maxY-minY };
}

export function circleArea(r: number): number { return Math.PI * r * r; }
export function circleCircumference(r: number): number { return 2 * Math.PI * r; }

export function pointInCircle(pt: Point, c: Circle): boolean {
  return distanceSq(pt, c.center) <= c.radius * c.radius + EPS;
}

export function circlesIntersect(a: Circle, b: Circle): boolean {
  const d = distance(a.center, b.center);
  return d <= a.radius + b.radius + EPS && d >= Math.abs(a.radius - b.radius) - EPS;
}

export function convexHull(points: Point[]): Point[] {
  const pts = [...points].sort((a, b) => a.x !== b.x ? a.x-b.x : a.y-b.y);
  const n = pts.length;
  if (n < 3) return pts;
  const lower: Point[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length-2], lower[lower.length-1], p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = n-1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length-2], upper[upper.length-1], p) <= 0)
      upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0,-1), ...upper.slice(0,-1)];
}

export function distancePointToLine(pt: Point, a: Point, b: Point): number {
  const len = distance(a, b);
  if (len < EPS) return distance(pt, a);
  const t = Math.max(0, Math.min(1, ((pt.x-a.x)*(b.x-a.x)+(pt.y-a.y)*(b.y-a.y))/(len*len)));
  const proj = { x: a.x+t*(b.x-a.x), y: a.y+t*(b.y-a.y) };
  return distance(pt, proj);
}

export function reflectPoint(pt: Point, line: Line): Point {
  const { p1: a, p2: b } = line;
  const dx = b.x-a.x, dy = b.y-a.y;
  const t = ((pt.x-a.x)*dx + (pt.y-a.y)*dy) / (dx*dx+dy*dy);
  const foot = { x: a.x+t*dx, y: a.y+t*dy };
  return { x: 2*foot.x-pt.x, y: 2*foot.y-pt.y };
}

export function interpolate(a: Point, b: Point, t: number): Point {
  return { x: a.x+(b.x-a.x)*t, y: a.y+(b.y-a.y)*t };
}
