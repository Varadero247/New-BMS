// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { Vector, RegressionResult, Fraction } from './types';

// ---------------------------------------------------------------------------
// Basic arithmetic / number theory
// ---------------------------------------------------------------------------

/**
 * Greatest common divisor using the iterative Euclidean algorithm.
 * Both inputs are treated as absolute integers.
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * Least common multiple of two integers.
 * Returns 0 if either input is 0.
 */
export function lcm(a: number, b: number): number {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  if (a === 0 || b === 0) return 0;
  return (a / gcd(a, b)) * b;
}

/**
 * Primality test via trial division up to sqrt(n).
 * Numbers < 2 are not prime.
 */
export function isPrime(n: number): boolean {
  n = Math.trunc(n);
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  const limit = Math.sqrt(n);
  for (let i = 3; i <= limit; i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * Sieve of Eratosthenes — returns all primes up to (and including) n.
 */
export function primes(n: number): number[] {
  n = Math.trunc(n);
  if (n < 2) return [];
  const sieve = new Uint8Array(n + 1).fill(1);
  sieve[0] = 0;
  sieve[1] = 0;
  for (let i = 2; i * i <= n; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= n; j += i) {
        sieve[j] = 0;
      }
    }
  }
  const result: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (sieve[i]) result.push(i);
  }
  return result;
}

/**
 * Prime factorisation — returns a Map<prime, exponent>.
 * factors(12) → Map { 2 => 2, 3 => 1 }
 */
export function factors(n: number): Map<number, number> {
  n = Math.abs(Math.trunc(n));
  const result = new Map<number, number>();
  if (n < 2) return result;
  for (let d = 2; d * d <= n; d++) {
    while (n % d === 0) {
      result.set(d, (result.get(d) ?? 0) + 1);
      n = Math.trunc(n / d);
    }
  }
  if (n > 1) result.set(n, (result.get(n) ?? 0) + 1);
  return result;
}

/**
 * nth Fibonacci number (0-indexed, iterative).
 * fibonacci(0)=0, fibonacci(1)=1.
 * Returns NaN for negative n.
 */
export function fibonacci(n: number): number {
  n = Math.trunc(n);
  if (n < 0) return NaN;
  if (n === 0) return 0;
  if (n === 1) return 1;
  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

/**
 * Factorial n! — throws RangeError for n > 20 or n < 0.
 * factorial(0) = 1.
 */
export function factorial(n: number): number {
  n = Math.trunc(n);
  if (n < 0) throw new RangeError('factorial: n must be non-negative');
  if (n > 20) throw new RangeError('factorial: n must be <= 20 to avoid overflow');
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/**
 * Binomial coefficient C(n, k) — "n choose k".
 * Returns 0 for k < 0 or k > n.
 */
export function binomial(n: number, k: number): number {
  n = Math.trunc(n);
  k = Math.trunc(k);
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  // Use symmetry to minimise multiplications
  if (k > n - k) k = n - k;
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return Math.round(result);
}

/**
 * Clamp value to [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation: lerp(a, b, 0) = a, lerp(a, b, 1) = b.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Inverse linear interpolation — returns t such that lerp(a, b, t) = value.
 * Returns NaN when a === b.
 */
export function inverseLerp(a: number, b: number, value: number): number {
  if (a === b) return NaN;
  return (value - a) / (b - a);
}

/**
 * Re-map value from [inMin, inMax] to [outMin, outMax].
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  const t = inverseLerp(inMin, inMax, value);
  return lerp(outMin, outMax, t);
}

/**
 * Round value to a given number of decimal places.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Truncate (floor toward zero) value to a given number of decimal places.
 */
export function truncateTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.trunc(value * factor) / factor;
}

/**
 * Approximate a decimal as a Fraction using the continued-fraction algorithm.
 * @param decimal       The value to approximate.
 * @param maxDenominator  Upper bound on denominator (default 1000).
 */
export function toFraction(decimal: number, maxDenominator = 1000): Fraction {
  const sign = decimal < 0 ? -1 : 1;
  decimal = Math.abs(decimal);
  let bestNum = Math.round(decimal);
  let bestDen = 1;
  let bestErr = Math.abs(decimal - bestNum / bestDen);

  for (let den = 1; den <= maxDenominator; den++) {
    const num = Math.round(decimal * den);
    const err = Math.abs(decimal - num / den);
    if (err < bestErr) {
      bestErr = err;
      bestNum = num;
      bestDen = den;
    }
    if (bestErr === 0) break;
  }
  return { numerator: sign * bestNum, denominator: bestDen };
}

// ---------------------------------------------------------------------------
// Statistics
// ---------------------------------------------------------------------------

/**
 * Sum of all values in an array. Returns 0 for empty arrays.
 */
export function sum(arr: number[]): number {
  return arr.reduce((acc, v) => acc + v, 0);
}

/**
 * Arithmetic mean. Returns NaN for empty arrays.
 */
export function mean(arr: number[]): number {
  if (arr.length === 0) return NaN;
  return sum(arr) / arr.length;
}

/**
 * Median value. Handles even-length arrays by averaging the two middle values.
 * Returns NaN for empty arrays.
 */
export function median(arr: number[]): number {
  if (arr.length === 0) return NaN;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Mode — returns the value(s) that appear most frequently.
 * If all values appear equally often, all are returned.
 */
export function mode(arr: number[]): number[] {
  if (arr.length === 0) return [];
  const freq = new Map<number, number>();
  for (const v of arr) freq.set(v, (freq.get(v) ?? 0) + 1);
  const maxFreq = Math.max(...freq.values());
  const result: number[] = [];
  for (const [val, count] of freq) {
    if (count === maxFreq) result.push(val);
  }
  return result.sort((a, b) => a - b);
}

/**
 * Variance — sample by default (divides by n-1).
 * Pass population=true to divide by n.
 * Returns NaN for arrays too short for the chosen divisor.
 */
export function variance(arr: number[], population = false): number {
  const n = arr.length;
  if (n === 0) return NaN;
  if (!population && n === 1) return NaN;
  const m = mean(arr);
  const sumSq = arr.reduce((acc, v) => acc + (v - m) ** 2, 0);
  return sumSq / (population ? n : n - 1);
}

/**
 * Standard deviation (square root of variance).
 */
export function stdDev(arr: number[], population = false): number {
  return Math.sqrt(variance(arr, population));
}

/**
 * Coefficient of variation (stdDev / mean * 100).
 * Returns NaN when mean is 0.
 */
export function coefficientOfVariation(arr: number[]): number {
  const m = mean(arr);
  if (m === 0) return NaN;
  return (stdDev(arr) / m) * 100;
}

/**
 * Pearson's moment coefficient of skewness.
 * Returns NaN for arrays of length < 3.
 */
export function skewness(arr: number[]): number {
  const n = arr.length;
  if (n < 3) return NaN;
  const m = mean(arr);
  const s = stdDev(arr);
  if (s === 0) return 0;
  const cubedDeviations = arr.reduce((acc, v) => acc + ((v - m) / s) ** 3, 0);
  return (n / ((n - 1) * (n - 2))) * cubedDeviations;
}

/**
 * Excess kurtosis (Fisher's definition, subtracts 3).
 * Returns NaN for arrays of length < 4.
 */
export function kurtosis(arr: number[]): number {
  const n = arr.length;
  if (n < 4) return NaN;
  const m = mean(arr);
  const s = stdDev(arr);
  if (s === 0) return 0;
  const fourthMoment = arr.reduce((acc, v) => acc + ((v - m) / s) ** 4, 0);
  const k =
    ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * fourthMoment -
    (3 * (n - 1) ** 2) / ((n - 2) * (n - 3));
  return k;
}

/**
 * pth percentile using linear interpolation (p in [0, 100]).
 * Returns NaN for empty arrays.
 */
export function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return NaN;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/**
 * Returns { q1, q2, q3 } quartiles.
 */
export function quartiles(arr: number[]): { q1: number; q2: number; q3: number } {
  return {
    q1: percentile(arr, 25),
    q2: percentile(arr, 50),
    q3: percentile(arr, 75),
  };
}

/**
 * Interquartile range (Q3 - Q1).
 */
export function iqr(arr: number[]): number {
  const { q1, q3 } = quartiles(arr);
  return q3 - q1;
}

/**
 * Z-score of a single value relative to the distribution of an array.
 * Returns NaN when stdDev is 0.
 */
export function zScore(value: number, arr: number[]): number {
  const m = mean(arr);
  const s = stdDev(arr);
  if (s === 0) return NaN;
  return (value - m) / s;
}

/**
 * Min-max normalise array to [0, 1].
 * Returns the original array (copy) when min === max.
 */
export function normalize(arr: number[]): number[] {
  if (arr.length === 0) return [];
  const minVal = Math.min(...arr);
  const maxVal = Math.max(...arr);
  if (minVal === maxVal) return arr.map(() => 0);
  return arr.map((v) => (v - minVal) / (maxVal - minVal));
}

/**
 * Z-score standardise (mean=0, std=1).
 * Returns array of zeros when stdDev is 0.
 */
export function standardize(arr: number[]): number[] {
  if (arr.length === 0) return [];
  const m = mean(arr);
  const s = stdDev(arr);
  if (s === 0) return arr.map(() => 0);
  return arr.map((v) => (v - m) / s);
}

/**
 * Sample covariance of two equal-length arrays.
 * Returns NaN when arrays are different lengths or too short.
 */
export function covariance(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length < 2) return NaN;
  const ma = mean(a);
  const mb = mean(b);
  const n = a.length;
  return a.reduce((acc, v, i) => acc + (v - ma) * (b[i] - mb), 0) / (n - 1);
}

/**
 * Pearson correlation coefficient.
 * Returns NaN when either stdDev is 0 or arrays differ in length.
 */
export function correlation(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length < 2) return NaN;
  const cov = covariance(a, b);
  const sa = stdDev(a);
  const sb = stdDev(b);
  if (sa === 0 || sb === 0) return NaN;
  return cov / (sa * sb);
}

/**
 * Simple linear regression (ordinary least squares).
 * Returns { slope, intercept, r2 }.
 */
export function linearRegression(x: number[], y: number[]): RegressionResult {
  if (x.length !== y.length || x.length < 2) {
    return { slope: NaN, intercept: NaN, r2: NaN };
  }
  const n = x.length;
  const mx = mean(x);
  const my = mean(y);
  let ssxy = 0;
  let ssxx = 0;
  for (let i = 0; i < n; i++) {
    ssxy += (x[i] - mx) * (y[i] - my);
    ssxx += (x[i] - mx) ** 2;
  }
  if (ssxx === 0) return { slope: NaN, intercept: NaN, r2: NaN };
  const slope = ssxy / ssxx;
  const intercept = my - slope * mx;
  // Coefficient of determination
  const ssTot = y.reduce((acc, v) => acc + (v - my) ** 2, 0);
  const ssRes = y.reduce((acc, v, i) => acc + (v - (slope * x[i] + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

/**
 * Simple moving average with the given window size.
 * Output length = arr.length - window + 1.
 */
export function movingAverage(arr: number[], window: number): number[] {
  if (window <= 0 || window > arr.length) return [];
  const result: number[] = [];
  for (let i = 0; i <= arr.length - window; i++) {
    result.push(mean(arr.slice(i, i + window)));
  }
  return result;
}

/**
 * Exponential moving average with smoothing factor alpha in (0, 1].
 * First value is seeded with arr[0].
 */
export function exponentialMovingAverage(arr: number[], alpha: number): number[] {
  if (arr.length === 0) return [];
  const result: number[] = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    result.push(alpha * arr[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Vector operations
// ---------------------------------------------------------------------------

/**
 * Dot product of two equal-length vectors.
 * Returns NaN if lengths differ.
 */
export function dotProduct(a: Vector, b: Vector): number {
  if (a.length !== b.length) return NaN;
  return a.reduce((acc, v, i) => acc + v * b[i], 0);
}

/**
 * 3D cross product — both vectors must have exactly 3 elements.
 * Returns [NaN, NaN, NaN] for invalid inputs.
 */
export function crossProduct3d(a: Vector, b: Vector): Vector {
  if (a.length !== 3 || b.length !== 3) return [NaN, NaN, NaN];
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/**
 * Euclidean magnitude (L2 norm) of a vector.
 */
export function magnitude(v: Vector): number {
  return Math.sqrt(dotProduct(v, v));
}

/**
 * Unit vector in the same direction as v.
 * Returns [NaN,...] for zero-magnitude vectors.
 */
export function normalize2(v: Vector): Vector {
  const mag = magnitude(v);
  if (mag === 0) return v.map(() => NaN);
  return v.map((c) => c / mag);
}

/**
 * Element-wise vector addition.
 * Returns [NaN,...] if lengths differ.
 */
export function vectorAdd(a: Vector, b: Vector): Vector {
  if (a.length !== b.length) return a.map(() => NaN);
  return a.map((v, i) => v + b[i]);
}

/**
 * Element-wise vector subtraction.
 * Returns [NaN,...] if lengths differ.
 */
export function vectorSubtract(a: Vector, b: Vector): Vector {
  if (a.length !== b.length) return a.map(() => NaN);
  return a.map((v, i) => v - b[i]);
}

/**
 * Scalar multiplication of a vector.
 */
export function vectorScale(v: Vector, s: number): Vector {
  return v.map((c) => c * s);
}
