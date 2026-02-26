// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * Polynomial arithmetic and operations.
 *
 * A polynomial is represented as an array of coefficients where coeffs[i]
 * is the coefficient of x^i.  So [1, 2, 3] represents 1 + 2x + 3x².
 * Trailing zeros are always trimmed so that the internal representation
 * is canonical.
 */

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Remove trailing zeros from a coefficient array. */
function trim(c: number[]): number[] {
  let end = c.length;
  while (end > 0 && c[end - 1] === 0) end--;
  return c.slice(0, end);
}

/** Deep-clone a coefficient array. */
function cloneCoeffs(c: number[]): number[] {
  return c.slice();
}

// ---------------------------------------------------------------------------
// Polynomial class
// ---------------------------------------------------------------------------

export class Polynomial {
  private readonly _coeffs: number[]; // trimmed, coeffs[i] = coeff of x^i

  constructor(coeffs: number[]) {
    this._coeffs = trim(cloneCoeffs(coeffs));
  }

  // -------------------------------------------------------------------------
  // Basic properties
  // -------------------------------------------------------------------------

  /** Degree of the polynomial.  Returns -Infinity for the zero polynomial. */
  get degree(): number {
    if (this._coeffs.length === 0) return -Infinity;
    return this._coeffs.length - 1;
  }

  /** Return the coefficient of x^n (0 if not defined). */
  coeff(n: number): number {
    if (n < 0 || n >= this._coeffs.length) return 0;
    return this._coeffs[n];
  }

  /** Trimmed coefficient array (no trailing zeros). */
  get coefficients(): number[] {
    return cloneCoeffs(this._coeffs);
  }

  /** True if this is the zero polynomial. */
  isZero(): boolean {
    return this._coeffs.length === 0;
  }

  // -------------------------------------------------------------------------
  // Evaluation
  // -------------------------------------------------------------------------

  /**
   * Evaluate the polynomial at x using Horner's method.
   * Handles edge cases: zero polynomial returns 0; degree-0 returns constant.
   */
  evaluate(x: number): number {
    if (this._coeffs.length === 0) return 0;
    let result = this._coeffs[this._coeffs.length - 1];
    for (let i = this._coeffs.length - 2; i >= 0; i--) {
      result = result * x + this._coeffs[i];
    }
    return result;
  }

  // -------------------------------------------------------------------------
  // Arithmetic
  // -------------------------------------------------------------------------

  add(other: Polynomial): Polynomial {
    const len = Math.max(this._coeffs.length, other._coeffs.length);
    const result = new Array<number>(len).fill(0);
    for (let i = 0; i < this._coeffs.length; i++) result[i] += this._coeffs[i];
    for (let i = 0; i < other._coeffs.length; i++) result[i] += other._coeffs[i];
    return new Polynomial(result);
  }

  subtract(other: Polynomial): Polynomial {
    const len = Math.max(this._coeffs.length, other._coeffs.length);
    const result = new Array<number>(len).fill(0);
    for (let i = 0; i < this._coeffs.length; i++) result[i] += this._coeffs[i];
    for (let i = 0; i < other._coeffs.length; i++) result[i] -= other._coeffs[i];
    return new Polynomial(result);
  }

  /** Alias for subtract. */
  sub(other: Polynomial): Polynomial {
    return this.subtract(other);
  }

  multiply(other: Polynomial): Polynomial {
    if (this.isZero() || other.isZero()) return new Polynomial([]);
    const len = this._coeffs.length + other._coeffs.length - 1;
    const result = new Array<number>(len).fill(0);
    for (let i = 0; i < this._coeffs.length; i++) {
      for (let j = 0; j < other._coeffs.length; j++) {
        result[i + j] += this._coeffs[i] * other._coeffs[j];
      }
    }
    return new Polynomial(result);
  }

  /** Alias for multiply. */
  mul(other: Polynomial): Polynomial {
    return this.multiply(other);
  }

  /** Multiply every coefficient by scalar. */
  scale(scalar: number): Polynomial {
    return new Polynomial(this._coeffs.map((c) => c * scalar));
  }

  negate(): Polynomial {
    return this.scale(-1);
  }

  /** Raise to a non-negative integer power. */
  pow(n: number): Polynomial {
    if (!Number.isInteger(n) || n < 0) throw new RangeError('pow requires a non-negative integer');
    if (n === 0) return new Polynomial([1]);
    let result = new Polynomial([1]);
    let base: Polynomial = this; // eslint-disable-line @typescript-eslint/no-this-alias
    let exp = n;
    while (exp > 0) {
      if (exp % 2 === 1) result = result.multiply(base);
      base = base.multiply(base);
      exp = Math.floor(exp / 2);
    }
    return result;
  }

  // -------------------------------------------------------------------------
  // Calculus
  // -------------------------------------------------------------------------

  /** Differentiate: d/dx. */
  derivative(): Polynomial {
    if (this._coeffs.length <= 1) return new Polynomial([]);
    const d = this._coeffs.slice(1).map((c, i) => c * (i + 1));
    return new Polynomial(d);
  }

  /** Antiderivative (indefinite integral) with optional integration constant. */
  integral(constant = 0): Polynomial {
    const integ = new Array<number>(this._coeffs.length + 1).fill(0);
    integ[0] = constant;
    for (let i = 0; i < this._coeffs.length; i++) {
      integ[i + 1] = this._coeffs[i] / (i + 1);
    }
    return new Polynomial(integ);
  }

  // -------------------------------------------------------------------------
  // Polynomial division
  // -------------------------------------------------------------------------

  /**
   * Polynomial long division.
   * Returns { quotient, remainder } such that:
   *   this === divisor * quotient + remainder
   * Throws if divisor is the zero polynomial.
   */
  divmod(divisor: Polynomial): { quotient: Polynomial; remainder: Polynomial } {
    if (divisor.isZero()) throw new Error('Division by zero polynomial');

    if (this.degree < divisor.degree) {
      return { quotient: new Polynomial([]), remainder: new Polynomial(this._coeffs) };
    }

    const rem = cloneCoeffs(this._coeffs);
    const divDeg = divisor.degree as number;
    const leadDiv = divisor._coeffs[divDeg];
    const quotLen = (this.degree as number) - divDeg + 1;
    const quot = new Array<number>(quotLen).fill(0);

    for (let i = (this.degree as number); i >= divDeg; i--) {
      const q = rem[i] / leadDiv;
      quot[i - divDeg] = q;
      for (let j = 0; j <= divDeg; j++) {
        rem[i - divDeg + j] -= q * divisor._coeffs[j];
      }
    }

    return {
      quotient: new Polynomial(quot),
      remainder: new Polynomial(rem),
    };
  }

  // -------------------------------------------------------------------------
  // GCD
  // -------------------------------------------------------------------------

  /** Greatest common divisor of two polynomials (monic: leading coeff = 1). */
  static gcd(a: Polynomial, b: Polynomial): Polynomial {
    // Euclidean algorithm on polynomials
    let x = a;
    let y = b;
    while (!y.isZero()) {
      const { remainder } = x.divmod(y);
      x = y;
      y = remainder;
    }
    // Make monic
    if (x.isZero()) return new Polynomial([1]);
    const lead = x._coeffs[x._coeffs.length - 1];
    return x.scale(1 / lead);
  }

  // -------------------------------------------------------------------------
  // Factory: fromRoots
  // -------------------------------------------------------------------------

  /**
   * Build the polynomial (x - r1)(x - r2)...(x - rN) from the given roots.
   * Returns the constant polynomial 1 when no roots are given.
   */
  static fromRoots(...roots: number[]): Polynomial {
    let result = new Polynomial([1]);
    for (const r of roots) {
      result = result.multiply(new Polynomial([-r, 1])); // (x - r)
    }
    return result;
  }

  // -------------------------------------------------------------------------
  // Composition
  // -------------------------------------------------------------------------

  /**
   * Compose: returns this(other(x)).
   * Uses Horner's method on the coefficient array.
   */
  compose(other: Polynomial): Polynomial {
    if (this._coeffs.length === 0) return new Polynomial([]);
    let result = new Polynomial([this._coeffs[this._coeffs.length - 1]]);
    for (let i = this._coeffs.length - 2; i >= 0; i--) {
      result = result.multiply(other).add(new Polynomial([this._coeffs[i]]));
    }
    return result;
  }

  // -------------------------------------------------------------------------
  // Root finding
  // -------------------------------------------------------------------------

  /**
   * Find real roots using the companion matrix + QR-like power iteration approach.
   * For practical polynomials (degree ≤ 50).  Roots are sorted ascending.
   */
  realRoots(tolerance = 1e-10): number[] {
    const deg = this.degree;
    if (typeof deg !== 'number' || !isFinite(deg)) return [];
    if (deg === 0) return []; // non-zero constant has no roots
    if (deg === 1) {
      // a0 + a1*x = 0  =>  x = -a0/a1
      return [-this._coeffs[0] / this._coeffs[1]];
    }
    if (deg === 2) {
      return quadraticRoots(this._coeffs[2], this._coeffs[1], this._coeffs[0]);
    }

    // For higher degree: use companion matrix eigenvalues via shifted QR iteration
    const n = deg;
    const lead = this._coeffs[n];
    // Monic version coefficients
    const a = this._coeffs.map((c) => c / lead);

    // Build companion matrix (n x n)
    const C: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
    // Sub-diagonal = 1
    for (let i = 1; i < n; i++) C[i][i - 1] = 1;
    // Last column = negated monic coefficients (in ascending degree order reversed)
    for (let i = 0; i < n; i++) C[i][n - 1] = -a[i];

    // Extract real eigenvalues using power iteration per deflation
    // Simple approach: use numerical QR with Hessenberg reduction
    const roots: number[] = eigenvaluesReal(C, tolerance);
    return roots.sort((a, b) => a - b);
  }

  // -------------------------------------------------------------------------
  // String representation
  // -------------------------------------------------------------------------

  /**
   * Human-readable string.  E.g. "3x^2 + 2x + 1" for [1, 2, 3].
   * Zero polynomial returns "0".
   */
  toString(variable = 'x'): string {
    if (this._coeffs.length === 0) return '0';

    const terms: string[] = [];
    for (let i = this._coeffs.length - 1; i >= 0; i--) {
      const c = this._coeffs[i];
      if (c === 0) continue;

      let term: string;
      if (i === 0) {
        term = String(c);
      } else if (i === 1) {
        if (c === 1) term = variable;
        else if (c === -1) term = `-${variable}`;
        else term = `${c}${variable}`;
      } else {
        if (c === 1) term = `${variable}^${i}`;
        else if (c === -1) term = `-${variable}^${i}`;
        else term = `${c}${variable}^${i}`;
      }
      terms.push(term);
    }

    if (terms.length === 0) return '0';

    // Join with " + " / " - "
    let result = terms[0];
    for (let i = 1; i < terms.length; i++) {
      if (terms[i].startsWith('-')) {
        result += ' - ' + terms[i].slice(1);
      } else {
        result += ' + ' + terms[i];
      }
    }
    return result;
  }

  // -------------------------------------------------------------------------
  // Equality
  // -------------------------------------------------------------------------

  /** Coefficient-wise equality within epsilon. */
  equals(other: Polynomial, epsilon = 1e-12): boolean {
    const len = Math.max(this._coeffs.length, other._coeffs.length);
    for (let i = 0; i < len; i++) {
      const a = i < this._coeffs.length ? this._coeffs[i] : 0;
      const b = i < other._coeffs.length ? other._coeffs[i] : 0;
      if (Math.abs(a - b) > epsilon) return false;
    }
    return true;
  }
}

// ---------------------------------------------------------------------------
// Companion matrix eigenvalue extractor (real only)
// ---------------------------------------------------------------------------

/**
 * Extract real eigenvalues from a companion matrix using the Francis QR
 * algorithm with a simple shift.  Returns only real roots (imaginary parts
 * discarded when |imag| < tol).
 */
function eigenvaluesReal(C: number[][], tol: number): number[] {
  const n = C.length;
  if (n === 0) return [];

  // Convert to upper Hessenberg form first
  const H = hessenberg(C);

  // QR iteration with Francis double-shift
  const roots: number[] = [];
  qrIterate(H, n, tol, roots);
  return roots;
}

/** In-place reduction to upper Hessenberg form using Householder reflectors. */
function hessenberg(A: number[][]): number[][] {
  const n = A.length;
  const H = A.map((row) => row.slice());

  for (let k = 0; k < n - 2; k++) {
    // Build Householder reflector for column k, rows k+1..n-1
    const x: number[] = [];
    for (let i = k + 1; i < n; i++) x.push(H[i][k]);
    const norm = Math.sqrt(x.reduce((s, v) => s + v * v, 0));
    if (norm < 1e-15) continue;
    x[0] += Math.sign(x[0] || 1) * norm;
    const norm2 = Math.sqrt(x.reduce((s, v) => s + v * v, 0));
    const u = x.map((v) => v / norm2);

    // Apply reflector from left: H = (I - 2uu^T) H
    for (let j = k; j < n; j++) {
      let dot = 0;
      for (let i = 0; i < u.length; i++) dot += u[i] * H[i + k + 1][j];
      for (let i = 0; i < u.length; i++) H[i + k + 1][j] -= 2 * dot * u[i];
    }
    // Apply reflector from right: H = H (I - 2uu^T)
    for (let i = 0; i < n; i++) {
      let dot = 0;
      for (let j = 0; j < u.length; j++) dot += H[i][j + k + 1] * u[j];
      for (let j = 0; j < u.length; j++) H[i][j + k + 1] -= 2 * dot * u[j];
    }
  }
  return H;
}

/**
 * QR iteration on upper Hessenberg matrix H (n×n).
 * Uses Wilkinson shift for convergence.  Deflates when sub-diagonal ≈ 0.
 * Appends real eigenvalues to `roots`.
 */
function qrIterate(H: number[][], n: number, tol: number, roots: number[]): void {
  let size = n;
  let maxIter = 200 * n;

  while (size > 0 && maxIter-- > 0) {
    if (size === 1) {
      roots.push(H[0][0]);
      return;
    }

    // Check for deflation at bottom
    let deflated = false;
    for (let i = size - 1; i > 0; i--) {
      if (Math.abs(H[i][i - 1]) < tol * (Math.abs(H[i - 1][i - 1]) + Math.abs(H[i][i]))) {
        H[i][i - 1] = 0;
        if (i === size - 1) {
          // Single eigenvalue
          roots.push(H[size - 1][size - 1]);
          size--;
          deflated = true;
          break;
        } else if (i === size - 2) {
          // 2×2 block — extract eigenvalues
          const a = H[size - 2][size - 2];
          const b = H[size - 2][size - 1];
          const c = H[size - 1][size - 2];
          const d = H[size - 1][size - 1];
          const trace = a + d;
          const det = a * d - b * c;
          const disc = trace * trace - 4 * det;
          if (disc >= 0) {
            roots.push((trace + Math.sqrt(disc)) / 2);
            roots.push((trace - Math.sqrt(disc)) / 2);
          }
          // complex pair — skip (not real)
          size -= 2;
          deflated = true;
          break;
        }
      }
    }
    if (deflated) continue;

    // Wilkinson shift from bottom 2×2
    const a = H[size - 2][size - 2];
    const b = H[size - 2][size - 1];
    const c = H[size - 1][size - 2];
    const d = H[size - 1][size - 1];
    const trace2 = a + d;
    const det2 = a * d - b * c;
    const disc2 = trace2 * trace2 / 4 - det2;
    const mu = disc2 >= 0
      ? trace2 / 2 + Math.sign(trace2) * Math.sqrt(disc2)
      : trace2 / 2;

    // QR step with shift mu on H[0..size-1]
    qrStep(H, size, mu);
  }

  // Remaining diagonal entries as eigenvalues
  for (let i = 0; i < size; i++) roots.push(H[i][i]);
}

/** One QR step on H[0..size-1] with shift mu using Givens rotations. */
function qrStep(H: number[][], size: number, mu: number): void {
  // Shift
  for (let i = 0; i < size; i++) H[i][i] -= mu;

  // QR decomposition via Givens rotations (update H in place: H = QR then H = RQ)
  const cs: number[] = [];
  const sn: number[] = [];

  for (let i = 0; i < size - 1; i++) {
    const a = H[i][i];
    const b = H[i + 1][i];
    const r = Math.sqrt(a * a + b * b);
    if (r < 1e-15) {
      cs.push(1);
      sn.push(0);
      continue;
    }
    const c = a / r;
    const s = b / r;
    cs.push(c);
    sn.push(s);

    // Apply rotation from left to rows i and i+1
    for (let j = i; j < size; j++) {
      const tmp = c * H[i][j] + s * H[i + 1][j];
      H[i + 1][j] = -s * H[i][j] + c * H[i + 1][j];
      H[i][j] = tmp;
    }
  }

  // Apply rotations from right
  for (let i = 0; i < size - 1; i++) {
    const c = cs[i];
    const s = sn[i];
    for (let j = 0; j <= i + 1 && j < size; j++) {
      const tmp = c * H[j][i] + s * H[j][i + 1];
      H[j][i + 1] = -s * H[j][i] + c * H[j][i + 1];
      H[j][i] = tmp;
    }
  }

  // Un-shift
  for (let i = 0; i < size; i++) H[i][i] += mu;
}

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

/**
 * Create a polynomial from a list of coefficients:
 *   poly(1, 2, 3)  =>  1 + 2x + 3x²
 */
export function poly(...coeffs: number[]): Polynomial {
  return new Polynomial(coeffs);
}

/** Create a monomial: coeff * x^degree. */
export function monomial(coeff: number, degree: number): Polynomial {
  if (degree < 0) throw new RangeError('degree must be non-negative');
  const c = new Array<number>(degree + 1).fill(0);
  c[degree] = coeff;
  return new Polynomial(c);
}

/** Create a constant polynomial. */
export function constant(c: number): Polynomial {
  return new Polynomial([c]);
}

/** Create ax + b. */
export function linear(a: number, b: number): Polynomial {
  return new Polynomial([b, a]);
}

/** Create ax² + bx + c. */
export function quadratic(a: number, b: number, c: number): Polynomial {
  return new Polynomial([c, b, a]);
}

// ---------------------------------------------------------------------------
// Quadratic formula
// ---------------------------------------------------------------------------

/**
 * Exact real roots of ax² + bx + c = 0.
 * Returns [] for no real roots, [r] for repeated root, [r1, r2] ascending.
 */
export function quadraticRoots(a: number, b: number, c: number): number[] {
  if (a === 0) {
    // Linear case
    if (b === 0) return [];
    return [-c / b];
  }
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  if (disc === 0) return [-b / (2 * a)];
  const sqrtDisc = Math.sqrt(disc);
  const r1 = (-b - sqrtDisc) / (2 * a);
  const r2 = (-b + sqrtDisc) / (2 * a);
  return r1 <= r2 ? [r1, r2] : [r2, r1];
}

// ---------------------------------------------------------------------------
// Lagrange interpolation
// ---------------------------------------------------------------------------

/**
 * Given a set of (x_i, y_i) points, return the unique polynomial of minimal
 * degree that passes through all of them.
 */
export function lagrangeInterpolation(points: Array<{ x: number; y: number }>): Polynomial {
  if (points.length === 0) return new Polynomial([]);
  let result = new Polynomial([]);

  for (let i = 0; i < points.length; i++) {
    const { x: xi, y: yi } = points[i];
    // Build basis polynomial L_i(x)
    let basis = new Polynomial([1]);
    let denom = 1;
    for (let j = 0; j < points.length; j++) {
      if (j === i) continue;
      const xj = points[j].x;
      basis = basis.multiply(new Polynomial([-xj, 1])); // (x - xj)
      denom *= xi - xj;
    }
    result = result.add(basis.scale(yi / denom));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Chebyshev polynomials T_n(x)
// ---------------------------------------------------------------------------

/**
 * Return the Chebyshev polynomial of the first kind T_n(x).
 * T_0 = 1, T_1 = x, T_{n+1} = 2x*T_n - T_{n-1}
 */
export function chebyshev(n: number): Polynomial {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('n must be a non-negative integer');
  if (n === 0) return new Polynomial([1]);
  if (n === 1) return new Polynomial([0, 1]); // x
  let prev = new Polynomial([1]);
  let curr = new Polynomial([0, 1]);
  const twoX = new Polynomial([0, 2]); // 2x
  for (let k = 2; k <= n; k++) {
    const next = twoX.multiply(curr).subtract(prev);
    prev = curr;
    curr = next;
  }
  return curr;
}

// ---------------------------------------------------------------------------
// Legendre polynomials P_n(x)
// ---------------------------------------------------------------------------

/**
 * Return the Legendre polynomial P_n(x).
 * P_0 = 1, P_1 = x, (n+1)P_{n+1} = (2n+1)x*P_n - n*P_{n-1}
 */
export function legendre(n: number): Polynomial {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('n must be a non-negative integer');
  if (n === 0) return new Polynomial([1]);
  if (n === 1) return new Polynomial([0, 1]);
  let prev = new Polynomial([1]);
  let curr = new Polynomial([0, 1]);
  for (let k = 1; k < n; k++) {
    const x = new Polynomial([0, 1]);
    const next = x.multiply(curr).scale((2 * k + 1) / (k + 1)).subtract(prev.scale(k / (k + 1)));
    prev = curr;
    curr = next;
  }
  return curr;
}

// ---------------------------------------------------------------------------
// Newton's forward difference interpolation
// ---------------------------------------------------------------------------

/**
 * Given equally-spaced (or arbitrary) xs and ys, compute the interpolating
 * polynomial using Newton's divided difference formula.
 */
export function newtonInterpolation(xs: number[], ys: number[]): Polynomial {
  if (xs.length !== ys.length) throw new Error('xs and ys must have the same length');
  if (xs.length === 0) return new Polynomial([]);
  const n = xs.length;
  // Build divided difference table
  const dd = ys.slice();
  for (let j = 1; j < n; j++) {
    for (let i = n - 1; i >= j; i--) {
      dd[i] = (dd[i] - dd[i - 1]) / (xs[i] - xs[i - j]);
    }
  }
  // Build polynomial using nested multiplication: N(x) = dd[0] + dd[1](x-x0) + dd[2](x-x0)(x-x1)...
  let result = new Polynomial([dd[n - 1]]);
  for (let i = n - 2; i >= 0; i--) {
    result = result.multiply(new Polynomial([-xs[i], 1])).add(new Polynomial([dd[i]]));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Standalone array-based helpers (spec API surface)
// ---------------------------------------------------------------------------

/** Add two coefficient arrays and return the result as a number[]. */
export function polyAdd(a: number[], b: number[]): number[] {
  return new Polynomial(a).add(new Polynomial(b)).coefficients;
}

/** Subtract two coefficient arrays and return the result as a number[]. */
export function polySub(a: number[], b: number[]): number[] {
  return new Polynomial(a).subtract(new Polynomial(b)).coefficients;
}

/** Multiply two coefficient arrays and return the result as a number[]. */
export function polyMul(a: number[], b: number[]): number[] {
  return new Polynomial(a).multiply(new Polynomial(b)).coefficients;
}

/** Evaluate a polynomial given as a coefficient array at x using Horner's method. */
export function polyEval(coeffs: number[], x: number): number {
  return new Polynomial(coeffs).evaluate(x);
}

/** Differentiate a coefficient array and return the result as a number[]. */
export function polyDerivative(coeffs: number[]): number[] {
  return new Polynomial(coeffs).derivative().coefficients;
}

/** Compute the antiderivative of a coefficient array. */
export function polyIntegral(coeffs: number[], constant = 0): number[] {
  return new Polynomial(coeffs).integral(constant).coefficients;
}

/**
 * Polynomial GCD (standalone function).
 * Returns a monic polynomial (leading coefficient 1) or [1] for the zero GCD.
 */
export function gcd(a: Polynomial, b: Polynomial): Polynomial {
  return Polynomial.gcd(a, b);
}

/**
 * Lagrange interpolation accepting tuple pairs [x, y].
 * Returns the interpolating polynomial as a number[] of coefficients.
 */
export function lagrangeInterpolationTuples(points: Array<[number, number]>): number[] {
  const pts = points.map(([x, y]) => ({ x, y }));
  return lagrangeInterpolation(pts).coefficients;
}

/**
 * Newton interpolation returning a number[] of coefficients.
 */
export function newtonInterpolationCoeffs(xs: number[], ys: number[]): number[] {
  return newtonInterpolation(xs, ys).coefficients;
}
