// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface Quaternion { w: number; x: number; y: number; z: number; }
export interface Vec3 { x: number; y: number; z: number; }

export function quat(w: number, x: number, y: number, z: number): Quaternion { return { w, x, y, z }; }
export function identity(): Quaternion { return { w: 1, x: 0, y: 0, z: 0 }; }

export function magnitude(q: Quaternion): number {
  return Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);
}

export function normalize(q: Quaternion): Quaternion {
  const m = magnitude(q);
  if (m === 0) return identity();
  return { w: q.w / m, x: q.x / m, y: q.y / m, z: q.z / m };
}

export function conjugate(q: Quaternion): Quaternion {
  return { w: q.w, x: -q.x, y: -q.y, z: -q.z };
}

export function add(a: Quaternion, b: Quaternion): Quaternion {
  return { w: a.w + b.w, x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function scale(q: Quaternion, s: number): Quaternion {
  return { w: q.w * s, x: q.x * s, y: q.y * s, z: q.z * s };
}

export function dot(a: Quaternion, b: Quaternion): number {
  return a.w * b.w + a.x * b.x + a.y * b.y + a.z * b.z;
}

export function multiply(a: Quaternion, b: Quaternion): Quaternion {
  return {
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
  };
}

export function inverse(q: Quaternion): Quaternion {
  const m2 = q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z;
  if (m2 === 0) return identity();
  return { w: q.w / m2, x: -q.x / m2, y: -q.y / m2, z: -q.z / m2 };
}

export function fromAxisAngle(axis: Vec3, angle: number): Quaternion {
  const half = angle / 2, s = Math.sin(half);
  const mag = Math.sqrt(axis.x ** 2 + axis.y ** 2 + axis.z ** 2) || 1;
  return { w: Math.cos(half), x: (axis.x / mag) * s, y: (axis.y / mag) * s, z: (axis.z / mag) * s };
}

export function toAxisAngle(q: Quaternion): { axis: Vec3; angle: number } {
  const n = normalize(q);
  const angle = 2 * Math.acos(Math.max(-1, Math.min(1, n.w)));
  const s = Math.sqrt(1 - n.w * n.w);
  if (s < 0.0001) return { axis: { x: 1, y: 0, z: 0 }, angle: 0 };
  return { axis: { x: n.x / s, y: n.y / s, z: n.z / s }, angle };
}

export function fromEuler(roll: number, pitch: number, yaw: number): Quaternion {
  const cr = Math.cos(roll / 2), sr = Math.sin(roll / 2);
  const cp = Math.cos(pitch / 2), sp = Math.sin(pitch / 2);
  const cy = Math.cos(yaw / 2), sy = Math.sin(yaw / 2);
  return {
    w: cr * cp * cy + sr * sp * sy,
    x: sr * cp * cy - cr * sp * sy,
    y: cr * sp * cy + sr * cp * sy,
    z: cr * cp * sy - sr * sp * cy,
  };
}

export function slerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
  let d = dot(a, b);
  let bm = b;
  if (d < 0) { bm = scale(b, -1); d = -d; }
  if (d > 0.9995) return normalize(add(a, scale(add(bm, scale(a, -1)), t)));
  const theta0 = Math.acos(d), theta = theta0 * t;
  const sinTheta = Math.sin(theta), sinTheta0 = Math.sin(theta0);
  const s1 = Math.cos(theta) - d * sinTheta / sinTheta0;
  const s2 = sinTheta / sinTheta0;
  return add(scale(a, s1), scale(bm, s2));
}

export function rotateVector(q: Quaternion, v: Vec3): Vec3 {
  const p: Quaternion = { w: 0, x: v.x, y: v.y, z: v.z };
  const r = multiply(multiply(q, p), conjugate(q));
  return { x: r.x, y: r.y, z: r.z };
}

export function toMatrix3x3(q: Quaternion): number[] {
  const { w, x, y, z } = normalize(q);
  return [
    1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w),
    2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w),
    2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y),
  ];
}

export function isIdentity(q: Quaternion, eps = 1e-9): boolean {
  return Math.abs(q.w - 1) < eps && Math.abs(q.x) < eps && Math.abs(q.y) < eps && Math.abs(q.z) < eps;
}

export function areEqual(a: Quaternion, b: Quaternion, eps = 1e-9): boolean {
  return Math.abs(a.w - b.w) < eps && Math.abs(a.x - b.x) < eps
    && Math.abs(a.y - b.y) < eps && Math.abs(a.z - b.z) < eps;
}
