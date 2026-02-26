// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ---------------------------------------------------------------------------
// Matrix helpers (for matrix exponentiation)
// ---------------------------------------------------------------------------

type Matrix = number[][];

function matMul(A: Matrix, B: Matrix): Matrix {
  const n = A.length;
  const result: Matrix = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < n; k++) {
      if (A[i][k] === 0) continue;
      for (let j = 0; j < n; j++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
}

function matPow(M: Matrix, p: number): Matrix {
  const n = M.length;
  // identity matrix
  let result: Matrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => (i === j ? 1 : 0))
  );
  let base = M.map(row => [...row]);
  while (p > 0) {
    if (p & 1) result = matMul(result, base);
    base = matMul(base, base);
    p >>= 1;
  }
  return result;
}

// ---------------------------------------------------------------------------
// LinearRecurrence class
// ---------------------------------------------------------------------------

export class LinearRecurrence {
  private coefficients: number[];
  private initialValues: number[];
  readonly order: number;

  /**
   * f(n) = c[0]*f(n-1) + c[1]*f(n-2) + ... + c[k-1]*f(n-k)
   * initialValues[0] = f(0), initialValues[1] = f(1), ...
   */
  constructor(coefficients: number[], initialValues: number[]) {
    this.coefficients = [...coefficients];
    this.initialValues = [...initialValues];
    this.order = coefficients.length;
  }

  getCoefficients(): number[] {
    return [...this.coefficients];
  }

  /**
   * Compute the nth term using matrix exponentiation.
   * For small n we can use iterative method directly.
   */
  nthTerm(n: number): number {
    const k = this.order;
    if (n < k) return this.initialValues[n];

    // Build companion matrix
    // [f(n)   ]   [c0 c1 ... ck-1] [f(n-1)  ]
    // [f(n-1) ] = [1  0  ... 0   ] [f(n-2)  ]
    // ...                           ...
    // [f(n-k+1)]  [0  0  ... 0   ] [f(n-k)  ]
    const M: Matrix = Array.from({ length: k }, () => new Array(k).fill(0));
    for (let j = 0; j < k; j++) {
      M[0][j] = this.coefficients[j];
    }
    for (let i = 1; i < k; i++) {
      M[i][i - 1] = 1;
    }

    // Initial state vector: [f(k-1), f(k-2), ..., f(0)]
    const Mp = matPow(M, n - k + 1);

    // State at step k-1: [f(k-1), f(k-2), ..., f(0)]
    const initState = this.initialValues.slice(0, k).reverse();

    // Result = Mp * initState, take first component
    let result = 0;
    for (let j = 0; j < k; j++) {
      result += Mp[0][j] * initState[j];
    }
    return result;
  }

  /**
   * Return the first `count` terms starting from f(0).
   */
  terms(count: number): number[] {
    if (count <= 0) return [];
    const result: number[] = [];
    const k = this.order;

    // Fill initial values
    for (let i = 0; i < Math.min(k, count); i++) {
      result.push(this.initialValues[i] ?? 0);
    }

    // Continue iteratively
    for (let i = k; i < count; i++) {
      let val = 0;
      for (let j = 0; j < k; j++) {
        val += this.coefficients[j] * result[i - 1 - j];
      }
      result.push(val);
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// Berlekamp-Massey algorithm
// ---------------------------------------------------------------------------

/**
 * Given a sequence, find the shortest linear recurrence that generates it.
 * Returns the coefficients [c1, c2, ...] such that
 *   s[n] = c1*s[n-1] + c2*s[n-2] + ...
 */
export function berlekampMassey(sequence: number[]): number[] {
  const n = sequence.length;
  if (n === 0) return [];
  // A single element is insufficient to determine any recurrence
  if (n === 1) return [];

  let C: number[] = [1];
  let B: number[] = [1];
  let L = 0;
  let m = 1;
  let b = 1;

  for (let i = 0; i < n; i++) {
    let d = sequence[i];
    for (let j = 1; j <= L; j++) {
      d += C[j] * sequence[i - j];
    }
    // treat as integer arithmetic (mod-free for integer sequences)
    if (d === 0) {
      m++;
    } else if (2 * L <= i) {
      const T = [...C];
      const factor = d / b;
      // extend C
      while (C.length < B.length + m) C.push(0);
      for (let j = m; j < B.length + m; j++) {
        C[j] -= factor * B[j - m];
      }
      L = i + 1 - L;
      B = T;
      b = d;
      m = 1;
    } else {
      const factor = d / b;
      while (C.length < B.length + m) C.push(0);
      for (let j = m; j < B.length + m; j++) {
        C[j] -= factor * B[j - m];
      }
      m++;
    }
  }

  // C[0] = 1, C[1..L] are the negated recurrence coefficients
  // recurrence: s[n] = -C[1]*s[n-1] - C[2]*s[n-2] - ...
  const coeffs: number[] = [];
  for (let i = 1; i <= L; i++) {
    coeffs.push(-C[i]);
  }
  return coeffs;
}

// ---------------------------------------------------------------------------
// General nth-term helper (iterative, safe for large sequences)
// ---------------------------------------------------------------------------

/**
 * Compute the nth term of a linear recurrence defined by coefficients and initial values.
 * f(n) = coeffs[0]*f(n-1) + coeffs[1]*f(n-2) + ...
 * init[0] = f(0), init[1] = f(1), ...
 */
export function recurrenceNthTerm(
  coeffs: number[],
  init: number[],
  n: number
): number {
  const k = coeffs.length;
  if (n < k) return init[n] ?? 0;

  const window: number[] = init.slice(0, k);
  for (let i = k; i <= n; i++) {
    let val = 0;
    for (let j = 0; j < k; j++) {
      val += coeffs[j] * window[k - 1 - j];
    }
    window.shift();
    window.push(val);
  }
  return window[k - 1];
}

// ---------------------------------------------------------------------------
// Classic sequences
// ---------------------------------------------------------------------------

/** nth Fibonacci number (0-indexed: F(0)=0, F(1)=1) */
export function nthFibonacci(n: number): number {
  if (n < 0) throw new RangeError('n must be non-negative');
  if (n === 0) return 0;
  if (n === 1) return 1;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

/** nth Lucas number (L(0)=2, L(1)=1, L(n)=L(n-1)+L(n-2)) */
export function nthLucas(n: number): number {
  if (n < 0) throw new RangeError('n must be non-negative');
  if (n === 0) return 2;
  if (n === 1) return 1;
  let a = 2, b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

/** nth Tribonacci number (T(0)=0, T(1)=0, T(2)=1, T(n)=T(n-1)+T(n-2)+T(n-3)) */
export function nthTribonacci(n: number): number {
  if (n < 0) throw new RangeError('n must be non-negative');
  if (n === 0) return 0;
  if (n === 1) return 0;
  if (n === 2) return 1;
  let a = 0, b = 0, c = 1;
  for (let i = 3; i <= n; i++) {
    const d = a + b + c;
    a = b;
    b = c;
    c = d;
  }
  return c;
}

/** nth Padovan sequence (P(0)=1, P(1)=1, P(2)=1, P(n)=P(n-2)+P(n-3)) */
export function nthPadovan(n: number): number {
  if (n < 0) throw new RangeError('n must be non-negative');
  if (n === 0) return 1;
  if (n === 1) return 1;
  if (n === 2) return 1;
  let a = 1, b = 1, c = 1;
  for (let i = 3; i <= n; i++) {
    const d = a + b; // P(n) = P(n-2) + P(n-3)  → a=P(n-3), b=P(n-2)
    a = b;
    b = c;
    c = d;
  }
  return c;
}

// ---------------------------------------------------------------------------
// Arithmetic / Geometric sequences
// ---------------------------------------------------------------------------

/** nth term of arithmetic sequence: a(n) = first + n*diff (0-indexed) */
export function arithmeticSequence(first: number, diff: number, n: number): number {
  return first + n * diff;
}

/** nth term of geometric sequence: g(n) = first * ratio^n (0-indexed) */
export function geometricSequence(first: number, ratio: number, n: number): number {
  return first * Math.pow(ratio, n);
}

/** Sum of first n terms of arithmetic sequence */
export function arithmeticSum(first: number, diff: number, n: number): number {
  // S(n) = n*(2*first + (n-1)*diff)/2
  return (n * (2 * first + (n - 1) * diff)) / 2;
}

/** Sum of first n terms of geometric sequence */
export function geometricSum(first: number, ratio: number, n: number): number {
  if (ratio === 1) return first * n;
  return first * (Math.pow(ratio, n) - 1) / (ratio - 1);
}

// ---------------------------------------------------------------------------
// Custom sequence generator
// ---------------------------------------------------------------------------

/**
 * Generate a sequence of `count` terms using a custom recurrence function.
 * f(n, prevTerms) where prevTerms is all previously generated terms.
 * init provides the seed values.
 */
export function generateSequence(
  f: (n: number, prev: number[]) => number,
  init: number[],
  count: number
): number[] {
  const result: number[] = [...init];
  while (result.length < count) {
    const n = result.length;
    result.push(f(n, result));
  }
  return result.slice(0, count);
}

// ---------------------------------------------------------------------------
// isLinearRecurrence
// ---------------------------------------------------------------------------

/**
 * Check whether the given sequence satisfies some linear recurrence of order ≤ maxOrder.
 * Uses Berlekamp-Massey: if the LFSR length is ≤ maxOrder and the recurrence
 * reproduces the entire sequence, return true.
 */
export function isLinearRecurrence(sequence: number[], maxOrder = 10): boolean {
  if (sequence.length < 2) return false;
  // All-zeros trivially satisfies any linear recurrence (f(n) = 1*f(n-1))
  if (sequence.every(v => v === 0)) return true;
  const coeffs = berlekampMassey(sequence);
  const order = coeffs.length;
  if (order === 0 || order > maxOrder) return false;

  // Verify: re-generate sequence and compare
  const init = sequence.slice(0, order);
  for (let i = order; i < sequence.length; i++) {
    let expected = 0;
    for (let j = 0; j < order; j++) {
      expected += coeffs[j] * sequence[i - 1 - j];
    }
    if (Math.abs(expected - sequence[i]) > 1e-9) return false;
  }
  return true;
}
