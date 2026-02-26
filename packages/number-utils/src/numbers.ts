// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { FormatOptions, NumberRange, RoundingMode, StatSummary } from './types';

/** Clamp a value to [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Round a number to a given number of decimal places using the specified mode. */
export function roundTo(value: number, decimals = 0, mode: RoundingMode = 'round'): number {
  const factor = Math.pow(10, decimals);
  switch (mode) {
    case 'ceil': return Math.ceil(value * factor) / factor;
    case 'floor': return Math.floor(value * factor) / factor;
    case 'trunc': return Math.trunc(value * factor) / factor;
    default: return Math.round(value * factor) / factor;
  }
}

/** Linear interpolation between a and b by t (0–1). */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Normalise a value from [min, max] to [0, 1]. */
export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return (value - min) / (max - min);
}

/** Reverse normalise: map a 0–1 value back to [min, max]. */
export function denormalize(t: number, min: number, max: number): number {
  return min + t * (max - min);
}

/** Return true if n is a prime number. */
export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

/** Greatest common divisor of two integers (Euclidean). */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

/** Least common multiple of two integers. */
export function lcm(a: number, b: number): number {
  const g = gcd(a, b);
  return g === 0 ? 0 : Math.abs(Math.trunc(a) * Math.trunc(b)) / g;
}

/** Factorial of n (non-negative integer). Returns NaN for negatives or non-integers. */
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/** nth Fibonacci number (0-indexed, F(0)=0, F(1)=1). */
export function fibonacci(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0) return 0;
  if (n === 1) return 1;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

/** Sum of an array of numbers. */
export function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

/** Product of an array of numbers. */
export function product(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc * n, 1);
}

/** Arithmetic mean. Returns NaN for empty arrays. */
export function mean(numbers: number[]): number {
  if (numbers.length === 0) return NaN;
  return sum(numbers) / numbers.length;
}

/** Median value. Returns NaN for empty arrays. */
export function median(numbers: number[]): number {
  if (numbers.length === 0) return NaN;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** Mode(s) — returns the most frequently occurring value(s). */
export function mode(numbers: number[]): number[] {
  if (numbers.length === 0) return [];
  const freq = new Map<number, number>();
  for (const n of numbers) freq.set(n, (freq.get(n) ?? 0) + 1);
  const max = Math.max(...freq.values());
  return [...freq.entries()].filter(([, c]) => c === max).map(([v]) => v);
}

/** Population variance. */
export function variance(numbers: number[]): number {
  if (numbers.length === 0) return NaN;
  const m = mean(numbers);
  return mean(numbers.map(n => (n - m) ** 2));
}

/** Population standard deviation. */
export function stdDev(numbers: number[]): number {
  return Math.sqrt(variance(numbers));
}

/** p-th percentile (0–100) using linear interpolation. */
export function percentile(numbers: number[], p: number): number {
  if (numbers.length === 0) return NaN;
  const sorted = [...numbers].sort((a, b) => a - b);
  const idx = (clamp(p, 0, 100) / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/** Full statistical summary for a dataset. */
export function statSummary(numbers: number[]): StatSummary {
  return {
    min: numbers.length === 0 ? NaN : Math.min(...numbers),
    max: numbers.length === 0 ? NaN : Math.max(...numbers),
    mean: mean(numbers),
    median: median(numbers),
    stdDev: stdDev(numbers),
    count: numbers.length,
  };
}

/** Return true if value is within the inclusive range [range.min, range.max]. */
export function inRange(value: number, range: NumberRange): boolean {
  return value >= range.min && value <= range.max;
}

/** Format a number with optional locale, decimals, prefix, and suffix. */
export function formatNumber(value: number, opts: FormatOptions = {}): string {
  const { decimals, prefix = '', suffix = '', locale } = opts;
  let str: string;
  if (locale !== undefined) {
    str = decimals !== undefined
      ? value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : value.toLocaleString(locale);
  } else {
    str = decimals !== undefined ? value.toFixed(decimals) : String(value);
  }
  return `${prefix}${str}${suffix}`;
}

/** Convert an integer to its ordinal string (1 → "1st", 2 → "2nd", etc.). */
export function toOrdinal(n: number): string {
  const abs = Math.abs(Math.trunc(n));
  const mod100 = abs % 100;
  const mod10 = abs % 10;
  let suffix: string;
  if (mod100 >= 11 && mod100 <= 13) {
    suffix = 'th';
  } else if (mod10 === 1) {
    suffix = 'st';
  } else if (mod10 === 2) {
    suffix = 'nd';
  } else if (mod10 === 3) {
    suffix = 'rd';
  } else {
    suffix = 'th';
  }
  return `${Math.trunc(n)}${suffix}`;
}

/** Sum of digits of an integer. */
export function digitSum(n: number): number {
  return String(Math.abs(Math.trunc(n))).split('').reduce((acc, d) => acc + Number(d), 0);
}

/** Return true if n is a power of two (n > 0). */
export function isPowerOfTwo(n: number): boolean {
  return Number.isInteger(n) && n > 0 && (n & (n - 1)) === 0;
}

/** Smallest power of two >= n. */
export function nextPowerOfTwo(n: number): number {
  if (n <= 1) return 1;
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

/** Return true if mode is a valid RoundingMode. */
export function isValidRoundingMode(mode: unknown): mode is RoundingMode {
  return mode === 'ceil' || mode === 'floor' || mode === 'round' || mode === 'trunc';
}
