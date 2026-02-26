// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface Vec2 { x: number; y: number; }
export interface Vec3 { x: number; y: number; z: number; }

export function vec2(x: number, y: number): Vec2 { return { x, y }; }
export function vec3(x: number, y: number, z: number): Vec3 { return { x, y, z }; }
export function add2(a: Vec2, b: Vec2): Vec2 { return { x: a.x+b.x, y: a.y+b.y }; }
export function sub2(a: Vec2, b: Vec2): Vec2 { return { x: a.x-b.x, y: a.y-b.y }; }
export function scale2(v: Vec2, s: number): Vec2 { return { x: v.x*s, y: v.y*s }; }
export function dot2(a: Vec2, b: Vec2): number { return a.x*b.x + a.y*b.y; }
export function mag2(v: Vec2): number { return Math.sqrt(v.x*v.x + v.y*v.y); }
export function norm2(v: Vec2): Vec2 { const m = mag2(v); return m === 0 ? { x: 0, y: 0 } : { x: v.x/m, y: v.y/m }; }
export function lerp2(a: Vec2, b: Vec2, t: number): Vec2 { return { x: a.x+(b.x-a.x)*t, y: a.y+(b.y-a.y)*t }; }
export function angle2(v: Vec2): number { return Math.atan2(v.y, v.x); }
export function angleBetween2(a: Vec2, b: Vec2): number { return Math.acos(Math.min(1, Math.max(-1, dot2(norm2(a), norm2(b))))); }
export function perp2(v: Vec2): Vec2 { return { x: -v.y, y: v.x }; }
export function reflect2(v: Vec2, n: Vec2): Vec2 { const d = 2*dot2(v,n); return { x: v.x-d*n.x, y: v.y-d*n.y }; }
export function project2(v: Vec2, onto: Vec2): Vec2 { const d = dot2(onto,onto); return d === 0 ? {x:0,y:0} : scale2(onto, dot2(v,onto)/d); }
export function dist2(a: Vec2, b: Vec2): number { return mag2(sub2(a, b)); }
export function eq2(a: Vec2, b: Vec2, eps = 1e-9): boolean { return Math.abs(a.x-b.x) < eps && Math.abs(a.y-b.y) < eps; }

export function add3(a: Vec3, b: Vec3): Vec3 { return { x: a.x+b.x, y: a.y+b.y, z: a.z+b.z }; }
export function sub3(a: Vec3, b: Vec3): Vec3 { return { x: a.x-b.x, y: a.y-b.y, z: a.z-b.z }; }
export function scale3(v: Vec3, s: number): Vec3 { return { x: v.x*s, y: v.y*s, z: v.z*s }; }
export function dot3(a: Vec3, b: Vec3): number { return a.x*b.x + a.y*b.y + a.z*b.z; }
export function cross3(a: Vec3, b: Vec3): Vec3 { return { x: a.y*b.z-a.z*b.y, y: a.z*b.x-a.x*b.z, z: a.x*b.y-a.y*b.x }; }
export function mag3(v: Vec3): number { return Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z); }
export function norm3(v: Vec3): Vec3 { const m = mag3(v); return m === 0 ? {x:0,y:0,z:0} : { x: v.x/m, y: v.y/m, z: v.z/m }; }
export function lerp3(a: Vec3, b: Vec3, t: number): Vec3 { return { x: a.x+(b.x-a.x)*t, y: a.y+(b.y-a.y)*t, z: a.z+(b.z-a.z)*t }; }
export function dist3(a: Vec3, b: Vec3): number { return mag3(sub3(a, b)); }
export function eq3(a: Vec3, b: Vec3, eps = 1e-9): boolean { return Math.abs(a.x-b.x)<eps && Math.abs(a.y-b.y)<eps && Math.abs(a.z-b.z)<eps; }
export function negate2(v: Vec2): Vec2 { return { x: -v.x, y: -v.y }; }
export function negate3(v: Vec3): Vec3 { return { x: -v.x, y: -v.y, z: -v.z }; }
