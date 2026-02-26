// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

const DEFAULT_EPSILON = 1e-10;

// ─── Vector ──────────────────────────────────────────────────────────────────

export class Vector {
  private readonly _components: number[];

  constructor(components: number[]) {
    if (components.length === 0) {
      throw new Error('Vector must have at least one component');
    }
    this._components = components.slice();
  }

  get(i: number): number {
    if (i < 0 || i >= this._components.length) {
      throw new RangeError(`Index ${i} out of bounds for vector of dim ${this._components.length}`);
    }
    return this._components[i];
  }

  get dim(): number {
    return this._components.length;
  }

  get components(): number[] {
    return this._components.slice();
  }

  add(other: Vector): Vector {
    if (this.dim !== other.dim) {
      throw new Error(`Dimension mismatch: ${this.dim} vs ${other.dim}`);
    }
    return new Vector(this._components.map((v, i) => v + other._components[i]));
  }

  subtract(other: Vector): Vector {
    if (this.dim !== other.dim) {
      throw new Error(`Dimension mismatch: ${this.dim} vs ${other.dim}`);
    }
    return new Vector(this._components.map((v, i) => v - other._components[i]));
  }

  scale(scalar: number): Vector {
    return new Vector(this._components.map((v) => v * scalar));
  }

  dot(other: Vector): number {
    if (this.dim !== other.dim) {
      throw new Error(`Dimension mismatch: ${this.dim} vs ${other.dim}`);
    }
    return this._components.reduce((sum, v, i) => sum + v * other._components[i], 0);
  }

  cross(other: Vector): Vector {
    if (this.dim !== 3 || other.dim !== 3) {
      throw new Error('Cross product is only defined for 3D vectors');
    }
    const [a0, a1, a2] = this._components;
    const [b0, b1, b2] = other._components;
    return new Vector([
      a1 * b2 - a2 * b1,
      a2 * b0 - a0 * b2,
      a0 * b1 - a1 * b0,
    ]);
  }

  magnitude(): number {
    return Math.sqrt(this.magnitudeSquared());
  }

  magnitudeSquared(): number {
    return this._components.reduce((sum, v) => sum + v * v, 0);
  }

  normalize(): Vector {
    const mag = this.magnitude();
    if (mag < DEFAULT_EPSILON) {
      throw new Error('Cannot normalize a zero vector');
    }
    return this.scale(1 / mag);
  }

  angleTo(other: Vector): number {
    if (this.dim !== other.dim) {
      throw new Error(`Dimension mismatch: ${this.dim} vs ${other.dim}`);
    }
    const magProduct = this.magnitude() * other.magnitude();
    if (magProduct < DEFAULT_EPSILON) {
      throw new Error('Cannot compute angle involving a zero vector');
    }
    const cosAngle = Math.max(-1, Math.min(1, this.dot(other) / magProduct));
    return Math.acos(cosAngle);
  }

  projectOnto(other: Vector): Vector {
    if (this.dim !== other.dim) {
      throw new Error(`Dimension mismatch: ${this.dim} vs ${other.dim}`);
    }
    const otherMagSq = other.magnitudeSquared();
    if (otherMagSq < DEFAULT_EPSILON) {
      throw new Error('Cannot project onto a zero vector');
    }
    return other.scale(this.dot(other) / otherMagSq);
  }

  isOrthogonal(other: Vector, epsilon: number = DEFAULT_EPSILON): boolean {
    if (this.dim !== other.dim) {
      throw new Error(`Dimension mismatch: ${this.dim} vs ${other.dim}`);
    }
    return Math.abs(this.dot(other)) <= epsilon;
  }

  isParallel(other: Vector, epsilon: number = DEFAULT_EPSILON): boolean {
    if (this.dim !== other.dim) {
      throw new Error(`Dimension mismatch: ${this.dim} vs ${other.dim}`);
    }
    const thisMag = this.magnitude();
    const otherMag = other.magnitude();
    if (thisMag < epsilon || otherMag < epsilon) {
      return true; // zero vector is parallel to everything
    }
    const cosAngle = Math.abs(this.dot(other)) / (thisMag * otherMag);
    return cosAngle >= 1 - epsilon;
  }

  equals(other: Vector, epsilon: number = DEFAULT_EPSILON): boolean {
    if (this.dim !== other.dim) return false;
    return this._components.every((v, i) => Math.abs(v - other._components[i]) <= epsilon);
  }

  negate(): Vector {
    return this.scale(-1);
  }

  toArray(): number[] {
    return this._components.slice();
  }

  toString(): string {
    return `Vector(${this._components.join(', ')})`;
  }

  static zero(dim: number): Vector {
    if (dim <= 0) throw new Error('Dimension must be positive');
    return new Vector(new Array(dim).fill(0));
  }

  static unit(dim: number, i: number): Vector {
    if (dim <= 0) throw new Error('Dimension must be positive');
    if (i < 0 || i >= dim) throw new RangeError(`Index ${i} out of bounds for dim ${dim}`);
    const arr = new Array(dim).fill(0);
    arr[i] = 1;
    return new Vector(arr);
  }
}

// ─── Matrix ──────────────────────────────────────────────────────────────────

export class Matrix {
  private readonly _data: number[][];
  private readonly _rows: number;
  private readonly _cols: number;

  constructor(rows: number[][]) {
    if (rows.length === 0) throw new Error('Matrix must have at least one row');
    const cols = rows[0].length;
    if (cols === 0) throw new Error('Matrix must have at least one column');
    for (const row of rows) {
      if (row.length !== cols) throw new Error('All rows must have the same number of columns');
    }
    this._rows = rows.length;
    this._cols = cols;
    this._data = rows.map((r) => r.slice());
  }

  static zeros(m: number, n: number): Matrix {
    if (m <= 0 || n <= 0) throw new Error('Dimensions must be positive');
    return new Matrix(Array.from({ length: m }, () => new Array(n).fill(0)));
  }

  static identity(n: number): Matrix {
    if (n <= 0) throw new Error('Dimension must be positive');
    return new Matrix(
      Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (i === j ? 1 : 0))
      )
    );
  }

  static fromVector(v: Vector, columnVector: boolean = true): Matrix {
    if (columnVector) {
      return new Matrix(v.toArray().map((x) => [x]));
    } else {
      return new Matrix([v.toArray()]);
    }
  }

  static diagonal(values: number[]): Matrix {
    const n = values.length;
    if (n === 0) throw new Error('Values array must not be empty');
    return new Matrix(
      Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (__, j) => (i === j ? values[i] : 0))
      )
    );
  }

  static random(m: number, n: number, random: () => number = Math.random): Matrix {
    if (m <= 0 || n <= 0) throw new Error('Dimensions must be positive');
    return new Matrix(
      Array.from({ length: m }, () => Array.from({ length: n }, () => random()))
    );
  }

  get rows(): number {
    return this._rows;
  }

  get cols(): number {
    return this._cols;
  }

  get(i: number, j: number): number {
    if (i < 0 || i >= this._rows) throw new RangeError(`Row index ${i} out of bounds`);
    if (j < 0 || j >= this._cols) throw new RangeError(`Col index ${j} out of bounds`);
    return this._data[i][j];
  }

  set(i: number, j: number, value: number): Matrix {
    if (i < 0 || i >= this._rows) throw new RangeError(`Row index ${i} out of bounds`);
    if (j < 0 || j >= this._cols) throw new RangeError(`Col index ${j} out of bounds`);
    const newData = this._data.map((r) => r.slice());
    newData[i][j] = value;
    return new Matrix(newData);
  }

  getRow(i: number): number[] {
    if (i < 0 || i >= this._rows) throw new RangeError(`Row index ${i} out of bounds`);
    return this._data[i].slice();
  }

  getCol(j: number): number[] {
    if (j < 0 || j >= this._cols) throw new RangeError(`Col index ${j} out of bounds`);
    return this._data.map((r) => r[j]);
  }

  getRowVector(i: number): Vector {
    return new Vector(this.getRow(i));
  }

  getColVector(j: number): Vector {
    return new Vector(this.getCol(j));
  }

  add(other: Matrix): Matrix {
    if (this._rows !== other._rows || this._cols !== other._cols) {
      throw new Error('Matrix dimensions must match for addition');
    }
    return new Matrix(
      this._data.map((row, i) => row.map((v, j) => v + other._data[i][j]))
    );
  }

  subtract(other: Matrix): Matrix {
    if (this._rows !== other._rows || this._cols !== other._cols) {
      throw new Error('Matrix dimensions must match for subtraction');
    }
    return new Matrix(
      this._data.map((row, i) => row.map((v, j) => v - other._data[i][j]))
    );
  }

  multiply(other: Matrix): Matrix {
    if (this._cols !== other._rows) {
      throw new Error(
        `Cannot multiply ${this._rows}x${this._cols} by ${other._rows}x${other._cols}`
      );
    }
    return new Matrix(
      Array.from({ length: this._rows }, (_, i) =>
        Array.from({ length: other._cols }, (__, j) =>
          this._data[i].reduce((sum, v, k) => sum + v * other._data[k][j], 0)
        )
      )
    );
  }

  multiplyVector(v: Vector): Vector {
    if (this._cols !== v.dim) {
      throw new Error(`Cannot multiply ${this._rows}x${this._cols} matrix by vector of dim ${v.dim}`);
    }
    return new Vector(
      this._data.map((row) => row.reduce((sum, val, j) => sum + val * v.get(j), 0))
    );
  }

  scale(scalar: number): Matrix {
    return new Matrix(this._data.map((row) => row.map((v) => v * scalar)));
  }

  transpose(): Matrix {
    return new Matrix(
      Array.from({ length: this._cols }, (_, j) =>
        Array.from({ length: this._rows }, (__, i) => this._data[i][j])
      )
    );
  }

  isSquare(): boolean {
    return this._rows === this._cols;
  }

  isSymmetric(epsilon: number = DEFAULT_EPSILON): boolean {
    if (!this.isSquare()) return false;
    for (let i = 0; i < this._rows; i++) {
      for (let j = i + 1; j < this._cols; j++) {
        if (Math.abs(this._data[i][j] - this._data[j][i]) > epsilon) return false;
      }
    }
    return true;
  }

  trace(): number {
    if (!this.isSquare()) throw new Error('Trace is only defined for square matrices');
    let sum = 0;
    for (let i = 0; i < this._rows; i++) sum += this._data[i][i];
    return sum;
  }

  // LU decomposition with partial pivoting: PA = LU
  luDecomposition(): { L: Matrix; U: Matrix; P: Matrix } {
    if (!this.isSquare()) throw new Error('LU decomposition requires a square matrix');
    const n = this._rows;
    const U = this._data.map((r) => r.slice());
    const L: number[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (__, j) => (i === j ? 1 : 0))
    );
    const P: number[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (__, j) => (i === j ? 1 : 0))
    );

    for (let col = 0; col < n; col++) {
      // Partial pivoting: find max element in column
      let maxRow = col;
      let maxVal = Math.abs(U[col][col]);
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(U[row][col]) > maxVal) {
          maxVal = Math.abs(U[row][col]);
          maxRow = row;
        }
      }

      if (maxRow !== col) {
        // Swap rows in U and P
        [U[col], U[maxRow]] = [U[maxRow], U[col]];
        [P[col], P[maxRow]] = [P[maxRow], P[col]];
        // Swap already-computed part of L
        for (let k = 0; k < col; k++) {
          [L[col][k], L[maxRow][k]] = [L[maxRow][k], L[col][k]];
        }
      }

      if (Math.abs(U[col][col]) < DEFAULT_EPSILON) continue; // singular column

      for (let row = col + 1; row < n; row++) {
        const factor = U[row][col] / U[col][col];
        L[row][col] = factor;
        for (let k = col; k < n; k++) {
          U[row][k] -= factor * U[col][k];
        }
      }
    }

    return { L: new Matrix(L), U: new Matrix(U), P: new Matrix(P) };
  }

  determinant(): number {
    if (!this.isSquare()) throw new Error('Determinant is only defined for square matrices');
    const n = this._rows;
    if (n === 1) return this._data[0][0];
    if (n === 2) {
      return this._data[0][0] * this._data[1][1] - this._data[0][1] * this._data[1][0];
    }

    const { U, P } = this.luDecomposition();

    // Count swaps in permutation matrix P (number of row swaps performed)
    // Determine sign from P: det(P) = (-1)^(number of transpositions)
    const pArr = P.toArray();
    const visited = new Array(n).fill(false);
    let swaps = 0;
    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;
      let cycleLen = 0;
      let j = i;
      while (!visited[j]) {
        visited[j] = true;
        // find where row j went
        j = pArr[j].indexOf(1);
        cycleLen++;
      }
      swaps += cycleLen - 1;
    }

    const sign = swaps % 2 === 0 ? 1 : -1;
    let diagProduct = 1;
    for (let i = 0; i < n; i++) diagProduct *= U.get(i, i);

    return sign * diagProduct;
  }

  inverse(): Matrix | null {
    if (!this.isSquare()) throw new Error('Inverse requires a square matrix');
    const n = this._rows;

    // Build augmented matrix [A | I]
    const aug: number[][] = this._data.map((row, i) => [
      ...row.slice(),
      ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
    ]);

    // Gauss-Jordan elimination with partial pivoting
    for (let col = 0; col < n; col++) {
      // Find pivot
      let pivotRow = -1;
      let pivotVal = 0;
      for (let row = col; row < n; row++) {
        if (Math.abs(aug[row][col]) > Math.abs(pivotVal)) {
          pivotVal = aug[row][col];
          pivotRow = row;
        }
      }

      if (pivotRow === -1 || Math.abs(pivotVal) < DEFAULT_EPSILON) return null; // singular

      // Swap rows
      if (pivotRow !== col) [aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]];

      // Normalize pivot row
      const pivotElement = aug[col][col];
      for (let k = 0; k < 2 * n; k++) aug[col][k] /= pivotElement;

      // Eliminate column
      for (let row = 0; row < n; row++) {
        if (row === col) continue;
        const factor = aug[row][col];
        for (let k = 0; k < 2 * n; k++) {
          aug[row][k] -= factor * aug[col][k];
        }
      }
    }

    // Extract right half
    return new Matrix(aug.map((row) => row.slice(n)));
  }

  rank(): number {
    const ref = this.rowEchelon();
    const data = ref.toArray();
    let r = 0;
    for (const row of data) {
      if (row.some((v) => Math.abs(v) > DEFAULT_EPSILON)) r++;
    }
    return r;
  }

  solve(b: Vector): Vector | null {
    if (!this.isSquare()) return null;
    const n = this._rows;
    if (b.dim !== n) throw new Error(`Vector dimension ${b.dim} does not match matrix rows ${n}`);

    // Build augmented matrix [A | b]
    const aug: number[][] = this._data.map((row, i) => [...row.slice(), b.get(i)]);

    // Gaussian elimination with partial pivoting
    for (let col = 0; col < n; col++) {
      let pivotRow = -1;
      let pivotVal = 0;
      for (let row = col; row < n; row++) {
        if (Math.abs(aug[row][col]) > Math.abs(pivotVal)) {
          pivotVal = aug[row][col];
          pivotRow = row;
        }
      }

      if (pivotRow === -1 || Math.abs(pivotVal) < DEFAULT_EPSILON) return null; // no unique solution

      if (pivotRow !== col) [aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]];

      for (let row = col + 1; row < n; row++) {
        const factor = aug[row][col] / aug[col][col];
        for (let k = col; k <= n; k++) {
          aug[row][k] -= factor * aug[col][k];
        }
      }
    }

    // Back substitution
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = aug[i][n];
      for (let j = i + 1; j < n; j++) sum -= aug[i][j] * x[j];
      if (Math.abs(aug[i][i]) < DEFAULT_EPSILON) return null;
      x[i] = sum / aug[i][i];
    }

    return new Vector(x);
  }

  rowEchelon(): Matrix {
    const data = this._data.map((r) => r.slice());
    const m = this._rows;
    const n = this._cols;
    let pivotRow = 0;

    for (let col = 0; col < n && pivotRow < m; col++) {
      // Find pivot
      let maxRow = pivotRow;
      for (let row = pivotRow + 1; row < m; row++) {
        if (Math.abs(data[row][col]) > Math.abs(data[maxRow][col])) maxRow = row;
      }

      if (Math.abs(data[maxRow][col]) < DEFAULT_EPSILON) continue;

      if (maxRow !== pivotRow) [data[pivotRow], data[maxRow]] = [data[maxRow], data[pivotRow]];

      const pivot = data[pivotRow][col];
      for (let k = col; k < n; k++) data[pivotRow][k] /= pivot;

      for (let row = pivotRow + 1; row < m; row++) {
        const factor = data[row][col];
        for (let k = col; k < n; k++) data[row][k] -= factor * data[pivotRow][k];
      }

      pivotRow++;
    }

    return new Matrix(data);
  }

  equals(other: Matrix, epsilon: number = DEFAULT_EPSILON): boolean {
    if (this._rows !== other._rows || this._cols !== other._cols) return false;
    return this._data.every((row, i) =>
      row.every((v, j) => Math.abs(v - other._data[i][j]) <= epsilon)
    );
  }

  toArray(): number[][] {
    return this._data.map((r) => r.slice());
  }

  toString(): string {
    return `Matrix(${this._rows}x${this._cols})[\n${this._data.map((r) => '  [' + r.join(', ') + ']').join(',\n')}\n]`;
  }
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Arrays must have the same length');
  return a.reduce((sum, v, i) => sum + v * b[i], 0);
}

export function crossProduct(
  a: [number, number, number],
  b: [number, number, number]
): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

export function matMul(a: number[][], b: number[][]): number[][] {
  const m = a.length;
  const k = a[0].length;
  const n = b[0].length;
  if (b.length !== k) throw new Error('Incompatible matrix dimensions for multiplication');
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (__, j) =>
      a[i].reduce((sum, v, l) => sum + v * b[l][j], 0)
    )
  );
}

export function transpose(m: number[][]): number[][] {
  if (m.length === 0) return [];
  const rows = m.length;
  const cols = m[0].length;
  return Array.from({ length: cols }, (_, j) =>
    Array.from({ length: rows }, (__, i) => m[i][j])
  );
}

export function det2(m: [[number, number], [number, number]]): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

export function det3(m: number[][]): number {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

export function lerpVectors(a: Vector, b: Vector, t: number): Vector {
  if (a.dim !== b.dim) throw new Error(`Dimension mismatch: ${a.dim} vs ${b.dim}`);
  return a.scale(1 - t).add(b.scale(t));
}

export function gramSchmidt(vectors: Vector[]): Vector[] {
  if (vectors.length === 0) return [];
  const result: Vector[] = [];

  for (const v of vectors) {
    let u = v;
    for (const e of result) {
      // subtract projection of v onto e
      const proj = e.scale(v.dot(e) / e.magnitudeSquared());
      u = u.subtract(proj);
    }
    const mag = u.magnitude();
    if (mag > DEFAULT_EPSILON) {
      result.push(u.scale(1 / mag));
    }
  }

  return result;
}
