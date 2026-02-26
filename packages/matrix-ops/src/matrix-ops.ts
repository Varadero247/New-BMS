// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export type Matrix = number[][];

export function zeros(rows: number, cols: number): Matrix {
  return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

export function identity(n: number): Matrix {
  const m = zeros(n, n);
  for (let i = 0; i < n; i++) m[i][i] = 1;
  return m;
}

export function shape(m: Matrix): [number, number] {
  return [m.length, m[0]?.length ?? 0];
}

export function transpose(m: Matrix): Matrix {
  const [rows, cols] = shape(m);
  return Array.from({ length: cols }, (_, j) => Array.from({ length: rows }, (_, i) => m[i][j]));
}

export function add(a: Matrix, b: Matrix): Matrix {
  const [rows, cols] = shape(a);
  return Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => a[i][j] + b[i][j]));
}

export function subtract(a: Matrix, b: Matrix): Matrix {
  const [rows, cols] = shape(a);
  return Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => a[i][j] - b[i][j]));
}

export function scale(m: Matrix, scalar: number): Matrix {
  return m.map(row => row.map(v => v * scalar));
}

export function multiply(a: Matrix, b: Matrix): Matrix {
  const [aRows, aCols] = shape(a);
  const [, bCols] = shape(b);
  const result = zeros(aRows, bCols);
  for (let i = 0; i < aRows; i++)
    for (let k = 0; k < aCols; k++)
      for (let j = 0; j < bCols; j++)
        result[i][j] += a[i][k] * b[k][j];
  return result;
}

export function trace(m: Matrix): number {
  const n = Math.min(...shape(m));
  let sum = 0;
  for (let i = 0; i < n; i++) sum += m[i][i];
  return sum;
}

export function determinant(m: Matrix): number {
  const n = m.length;
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0]*m[1][1] - m[0][1]*m[1][0];
  // LU decomposition for larger matrices
  const lu = m.map(row => [...row]);
  let sign = 1;
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(lu[row][col]) > Math.abs(lu[maxRow][col])) maxRow = row;
    }
    if (maxRow !== col) { [lu[col], lu[maxRow]] = [lu[maxRow], lu[col]]; sign *= -1; }
    if (lu[col][col] === 0) return 0;
    for (let row = col + 1; row < n; row++) {
      const factor = lu[row][col] / lu[col][col];
      for (let j = col; j < n; j++) lu[row][j] -= factor * lu[col][j];
    }
  }
  let det = sign;
  for (let i = 0; i < n; i++) det *= lu[i][i];
  return det;
}

export function inverse(m: Matrix): Matrix | null {
  const n = m.length;
  const aug = m.map((row, i) => [...row, ...identity(n)[i]]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) return null;
    for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = 0; j < 2 * n; j++) aug[row][j] -= factor * aug[col][j];
    }
  }
  return aug.map(row => row.slice(n));
}

export function rank(m: Matrix): number {
  const [rows, cols] = shape(m);
  const mat = m.map(row => [...row]);
  let r = 0;
  for (let col = 0; col < cols && r < rows; col++) {
    let maxRow = -1;
    for (let row = r; row < rows; row++) {
      if (Math.abs(mat[row][col]) > 1e-12) { maxRow = row; break; }
    }
    if (maxRow === -1) continue;
    [mat[r], mat[maxRow]] = [mat[maxRow], mat[r]];
    const pivot = mat[r][col];
    for (let j = col; j < cols; j++) mat[r][j] /= pivot;
    for (let row = 0; row < rows; row++) {
      if (row === r) continue;
      const factor = mat[row][col];
      for (let j = col; j < cols; j++) mat[row][j] -= factor * mat[r][j];
    }
    r++;
  }
  return r;
}

export function frobenius(m: Matrix): number {
  return Math.sqrt(m.reduce((sum, row) => sum + row.reduce((s, v) => s + v*v, 0), 0));
}

export function hadamard(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v * b[i][j]));
}

export function elementwiseApply(m: Matrix, fn: (v: number) => number): Matrix {
  return m.map(row => row.map(fn));
}

export function rowSum(m: Matrix): number[] { return m.map(row => row.reduce((a, b) => a + b, 0)); }
export function colSum(m: Matrix): number[] {
  const [rows, cols] = shape(m);
  return Array.from({ length: cols }, (_, j) => m.reduce((s, row) => s + row[j], 0));
}

export function matPow(m: Matrix, n: number): Matrix {
  if (n === 0) return identity(m.length);
  if (n === 1) return m;
  if (n % 2 === 0) { const half = matPow(m, n / 2); return multiply(half, half); }
  return multiply(m, matPow(m, n - 1));
}

export function vectorDot(a: number[], b: number[]): number {
  return a.reduce((s, v, i) => s + v * b[i], 0);
}

export function outerProduct(a: number[], b: number[]): Matrix {
  return a.map(ai => b.map(bj => ai * bj));
}

export function isSymmetric(m: Matrix): boolean {
  const n = m.length;
  for (let i = 0; i < n; i++) for (let j = i+1; j < n; j++) {
    if (Math.abs(m[i][j] - m[j][i]) > 1e-10) return false;
  }
  return true;
}

export function isDiagonal(m: Matrix): boolean {
  const n = m.length;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if (i !== j && Math.abs(m[i][j]) > 1e-10) return false;
  }
  return true;
}

export function flatten(m: Matrix): number[] { return m.flat(); }

export function fromFlat(data: number[], rows: number, cols: number): Matrix {
  return Array.from({ length: rows }, (_, i) => data.slice(i * cols, (i + 1) * cols));
}

export function rowSwap(a: Matrix, i: number, j: number): Matrix {
  const m = a.map(r => [...r]);
  [m[i], m[j]] = [m[j], m[i]];
  return m;
}
