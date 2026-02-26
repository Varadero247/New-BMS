// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/**
 * clamp — constrains a value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) throw new RangeError('min must be <= max');
  return Math.min(Math.max(value, min), max);
}

/**
 * lerp — linear interpolation between a and b at parameter t.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * remap — maps value from one range to another.
 */
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMin === inMax) return outMin;
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * roundTo — rounds to the given number of decimal places.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * floorTo — floors to the given number of decimal places.
 */
export function floorTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.floor(value * factor) / factor;
}

/**
 * ceilTo — ceils to the given number of decimal places.
 */
export function ceilTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.ceil(value * factor) / factor;
}

/**
 * toFixed — formats number to fixed decimal string.
 */
export function toFixed(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

/**
 * isPrime — returns true if n is a prime number.
 */
export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

/**
 * gcd — greatest common divisor (Euclidean algorithm).
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * lcm — least common multiple.
 */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round(a) * Math.round(b)) / gcd(a, b);
}

/**
 * factorial — n! for non-negative integers.
 */
export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('n must be a non-negative integer');
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/**
 * fibonacci — nth Fibonacci number (0-indexed: fib(0)=0, fib(1)=1).
 */
export function fibonacci(n: number): number {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('n must be a non-negative integer');
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

/**
 * sumArray — sum of all elements.
 */
export function sumArray(arr: number[]): number {
  return arr.reduce((acc, v) => acc + v, 0);
}

/**
 * product — product of all elements.
 */
export function product(arr: number[]): number {
  return arr.reduce((acc, v) => acc * v, 1);
}

/**
 * mean — arithmetic mean.
 */
export function mean(arr: number[]): number {
  if (arr.length === 0) throw new RangeError('Array must not be empty');
  return sumArray(arr) / arr.length;
}

/**
 * median — middle value of sorted array.
 */
export function median(arr: number[]): number {
  if (arr.length === 0) throw new RangeError('Array must not be empty');
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * mode — most frequent value(s).
 */
export function mode(arr: number[]): number[] {
  if (arr.length === 0) throw new RangeError('Array must not be empty');
  const freq = new Map<number, number>();
  for (const v of arr) freq.set(v, (freq.get(v) ?? 0) + 1);
  const maxFreq = Math.max(...freq.values());
  const result: number[] = [];
  freq.forEach((count, val) => {
    if (count === maxFreq) result.push(val);
  });
  return result.sort((a, b) => a - b);
}

/**
 * variance — population variance.
 */
export function variance(arr: number[]): number {
  if (arr.length === 0) throw new RangeError('Array must not be empty');
  const m = mean(arr);
  return mean(arr.map((v) => (v - m) ** 2));
}

/**
 * stdDev — population standard deviation.
 */
export function stdDev(arr: number[]): number {
  return Math.sqrt(variance(arr));
}

/**
 * percentile — p-th percentile (0-100) using linear interpolation.
 */
export function percentile(arr: number[], p: number): number {
  if (arr.length === 0) throw new RangeError('Array must not be empty');
  if (p < 0 || p > 100) throw new RangeError('p must be between 0 and 100');
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const frac = index - lower;
  return sorted[lower] * (1 - frac) + sorted[upper] * frac;
}

/**
 * normalize — min-max normalization to [0, 1].
 */
export function normalize(arr: number[]): number[] {
  if (arr.length === 0) throw new RangeError('Array must not be empty');
  const mn = Math.min(...arr);
  const mx = Math.max(...arr);
  if (mn === mx) return arr.map(() => 0);
  return arr.map((v) => (v - mn) / (mx - mn));
}

/**
 * range — max - min of array.
 */
export function range(arr: number[]): number {
  if (arr.length === 0) throw new RangeError('Array must not be empty');
  return Math.max(...arr) - Math.min(...arr);
}

/**
 * isEven — true if integer is even.
 */
export function isEven(n: number): boolean {
  return Number.isInteger(n) && n % 2 === 0;
}

/**
 * isOdd — true if integer is odd.
 */
export function isOdd(n: number): boolean {
  return Number.isInteger(n) && Math.abs(n % 2) === 1;
}

/**
 * isInteger — true if value is an integer.
 */
export function isInteger(n: number): boolean {
  return Number.isInteger(n);
}

/**
 * isFiniteNumber — type-guard: true if value is a finite number.
 */
export function isFiniteNumber(n: unknown): n is number {
  return typeof n === 'number' && Number.isFinite(n);
}

/**
 * inRange — checks if value is in [min, max] (or (min, max) if exclusive).
 */
export function inRange(value: number, min: number, max: number, exclusive = false): boolean {
  if (exclusive) return value > min && value < max;
  return value >= min && value <= max;
}

const ROMAN_VALS: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'],  [90, 'XC'],  [50, 'L'],  [40, 'XL'],
  [10, 'X'],   [9, 'IX'],   [5, 'V'],   [4, 'IV'],
  [1, 'I'],
];

/**
 * toRoman — converts integer (1-3999) to Roman numeral string.
 */
export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) {
    throw new RangeError('n must be an integer between 1 and 3999');
  }
  let result = '';
  let remaining = n;
  for (const [val, sym] of ROMAN_VALS) {
    while (remaining >= val) {
      result += sym;
      remaining -= val;
    }
  }
  return result;
}

/**
 * fromRoman — converts Roman numeral string to integer.
 */
export function fromRoman(s: string): number {
  const map: Record<string, number> = {
    I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
  };
  const upper = s.toUpperCase();
  if (!/^[IVXLCDM]+$/.test(upper)) throw new Error(`Invalid Roman numeral: ${s}`);
  let result = 0;
  for (let i = 0; i < upper.length; i++) {
    const cur = map[upper[i]];
    const next = map[upper[i + 1]] ?? 0;
    if (cur < next) {
      result -= cur;
    } else {
      result += cur;
    }
  }
  return result;
}

/**
 * formatWithCommas — formats number with comma thousands separators.
 */
export function formatWithCommas(n: number): string {
  const parts = n.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * safeDiv — divides a by b; returns fallback (default 0) when b is 0.
 */
export function safeDiv(a: number, b: number, fallback = 0): number {
  if (b === 0) return fallback;
  return a / b;
}
