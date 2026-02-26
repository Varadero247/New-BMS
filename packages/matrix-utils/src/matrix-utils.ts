// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export type Matrix = number[][];

export function identity(n: number): Matrix {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
}
export function zeros(rows: number, cols: number): Matrix {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}
export function transpose(m: Matrix): Matrix {
  const rows = m.length, cols = m[0].length;
  return Array.from({ length: cols }, (_, j) => Array.from({ length: rows }, (_, i) => m[i][j]));
}
export function add(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v + b[i][j]));
}
export function subtract(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v - b[i][j]));
}
export function scalarMultiply(m: Matrix, s: number): Matrix {
  return m.map(row => row.map(v => v * s));
}
export function multiply(a: Matrix, b: Matrix): Matrix {
  const rows = a.length, cols = b[0].length, inner = b.length;
  const result = zeros(rows, cols);
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++)
      for (let k = 0; k < inner; k++)
        result[i][j] += a[i][k] * b[k][j];
  return result;
}
export function determinant(m: Matrix): number {
  const n = m.length;
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0]*m[1][1] - m[0][1]*m[1][0];
  return m[0].reduce((sum, val, j) => {
    const minor = m.slice(1).map(row => row.filter((_, c) => c !== j));
    return sum + (j % 2 === 0 ? 1 : -1) * val * determinant(minor);
  }, 0);
}
export function trace(m: Matrix): number {
  return m.reduce((s, row, i) => s + row[i], 0);
}
export function frobenius(m: Matrix): number {
  return Math.sqrt(m.flat().reduce((s, v) => s + v*v, 0));
}
export function equal(a: Matrix, b: Matrix, eps = 1e-9): boolean {
  return a.every((row, i) => row.every((v, j) => Math.abs(v - b[i][j]) < eps));
}
export function shape(m: Matrix): [number, number] {
  return [m.length, m[0]?.length ?? 0];
}
export function flatten(m: Matrix): number[] { return m.flat(); }
export function fromFlat(arr: number[], rows: number, cols: number): Matrix {
  return Array.from({ length: rows }, (_, i) => arr.slice(i*cols, (i+1)*cols));
}
export function rotate2D(theta: number): Matrix {
  const c = Math.cos(theta), s = Math.sin(theta);
  return [[c, -s], [s, c]];
}
export function scale2D(sx: number, sy: number): Matrix { return [[sx, 0], [0, sy]]; }
export function isSquare(m: Matrix): boolean { return m.length === (m[0]?.length ?? 0); }
