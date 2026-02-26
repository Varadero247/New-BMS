// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ---------------------------------------------------------------------------
// Random number generation (injectable)
// ---------------------------------------------------------------------------

/** Returns a value in [0, 1). */
export type RNG = () => number;

// ---------------------------------------------------------------------------
// Seeded PRNG — Mulberry32
// ---------------------------------------------------------------------------

/**
 * Returns a deterministic RNG seeded with the given integer.
 * Algorithm: Mulberry32 (fast, good statistical properties).
 */
export function seededRNG(seed: number): RNG {
  let s = seed >>> 0;
  return (): number => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Uniform distribution
// ---------------------------------------------------------------------------

/** Returns a uniformly distributed integer in [min, max] inclusive. */
export function uniformInt(min: number, max: number, rng: RNG = Math.random): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Returns a uniformly distributed float in [min, max). */
export function uniformFloat(min: number, max: number, rng: RNG = Math.random): number {
  return rng() * (max - min) + min;
}

// ---------------------------------------------------------------------------
// Normal (Gaussian) distribution — Box-Muller transform
// ---------------------------------------------------------------------------

/**
 * Returns a sample from N(mean, stddev²) using the Box-Muller transform.
 * Two uniform samples are consumed per call; the second variate is discarded.
 */
export function normalSample(mean = 0, stddev = 1, rng: RNG = Math.random): number {
  let u1: number;
  let u2: number;
  // Avoid u1 = 0 (log(0) is undefined)
  do {
    u1 = rng();
  } while (u1 === 0);
  u2 = rng();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stddev * z0;
}

/** Probability density function of N(mean, stddev²) at x. */
export function normalPDF(x: number, mean: number, stddev: number): number {
  const z = (x - mean) / stddev;
  return Math.exp(-0.5 * z * z) / (stddev * Math.sqrt(2 * Math.PI));
}

/**
 * Cumulative distribution function of N(mean, stddev²).
 * Uses the Abramowitz & Stegun rational approximation (max error ≈ 7.5e-8).
 */
export function normalCDF(x: number, mean: number, stddev: number): number {
  const z = (x - mean) / (stddev * Math.SQRT2);
  return 0.5 * (1 + erf(z));
}

/** Error function approximation (used by normalCDF). */
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const ax = Math.abs(x);
  // Abramowitz & Stegun 7.1.26
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}

// ---------------------------------------------------------------------------
// Bernoulli distribution
// ---------------------------------------------------------------------------

/** Returns true with probability p. */
export function bernoulli(p: number, rng: RNG = Math.random): boolean {
  return rng() < p;
}

/** Returns the number of successes in n independent Bernoulli(p) trials. */
export function binomialSample(n: number, p: number, rng: RNG = Math.random): number {
  let successes = 0;
  for (let i = 0; i < n; i++) {
    if (rng() < p) successes++;
  }
  return successes;
}

// ---------------------------------------------------------------------------
// Poisson distribution
// ---------------------------------------------------------------------------

/**
 * Returns a Poisson-distributed sample with rate lambda.
 * Uses Knuth's algorithm (suitable for small lambda).
 */
export function poissonSample(lambda: number, rng: RNG = Math.random): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L);
  return k - 1;
}

/** Probability mass function of Poisson(lambda) at non-negative integer k. */
export function poissonPMF(k: number, lambda: number): number {
  if (k < 0 || !Number.isInteger(k)) return 0;
  // Special case: lambda=0 means P(X=0)=1, P(X>0)=0
  if (lambda === 0) return k === 0 ? 1 : 0;
  return Math.exp(-lambda + k * Math.log(lambda) - logFactorial(k));
}

/** Natural log of k! computed iteratively. */
function logFactorial(k: number): number {
  let result = 0;
  for (let i = 2; i <= k; i++) result += Math.log(i);
  return result;
}

// ---------------------------------------------------------------------------
// Exponential distribution
// ---------------------------------------------------------------------------

/** Returns a sample from Exponential(rate) using the inverse-CDF method. */
export function exponentialSample(rate: number, rng: RNG = Math.random): number {
  let u: number;
  do {
    u = rng();
  } while (u === 0);
  return -Math.log(u) / rate;
}

/** Probability density function of Exponential(rate) at x ≥ 0. */
export function exponentialPDF(x: number, rate: number): number {
  if (x < 0) return 0;
  return rate * Math.exp(-rate * x);
}

/** Cumulative distribution function of Exponential(rate) at x ≥ 0. */
export function exponentialCDF(x: number, rate: number): number {
  if (x < 0) return 0;
  return 1 - Math.exp(-rate * x);
}

// ---------------------------------------------------------------------------
// Geometric distribution
// ---------------------------------------------------------------------------

/**
 * Returns the number of trials until the first success (1-indexed).
 * Uses the inverse-CDF: k = ceil(log(U) / log(1-p)).
 */
export function geometricSample(p: number, rng: RNG = Math.random): number {
  let u: number;
  do {
    u = rng();
  } while (u === 0 || u === 1);
  return Math.ceil(Math.log(u) / Math.log(1 - p));
}

// ---------------------------------------------------------------------------
// Weighted sampling
// ---------------------------------------------------------------------------

/** Returns one item drawn according to the supplied weights (with replacement). */
export function weightedChoice<T>(items: T[], weights: number[], rng: RNG = Math.random): T {
  if (items.length === 0) throw new Error('weightedChoice: items must not be empty');
  if (items.length !== weights.length) throw new Error('weightedChoice: items and weights must have the same length');
  const total = weights.reduce((a, b) => a + b, 0);
  let threshold = rng() * total;
  for (let i = 0; i < items.length; i++) {
    threshold -= weights[i];
    if (threshold <= 0) return items[i];
  }
  return items[items.length - 1];
}

/** Returns k items drawn according to the supplied weights (with replacement). */
export function weightedSample<T>(items: T[], weights: number[], k: number, rng: RNG = Math.random): T[] {
  const result: T[] = [];
  for (let i = 0; i < k; i++) {
    result.push(weightedChoice(items, weights, rng));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Random sampling
// ---------------------------------------------------------------------------

/** Returns a uniformly random element of arr. */
export function randomChoice<T>(arr: T[], rng: RNG = Math.random): T {
  if (arr.length === 0) throw new Error('randomChoice: array must not be empty');
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Returns k elements sampled without replacement using the
 * Floyd–Knuth algorithm (O(k) expected).
 */
export function randomSample<T>(arr: T[], k: number, rng: RNG = Math.random): T[] {
  if (k > arr.length) throw new Error('randomSample: k must be <= array length');
  const set = new Set<number>();
  const result: T[] = [];
  for (let i = arr.length - k; i < arr.length; i++) {
    const j = uniformInt(0, i, rng);
    if (set.has(j)) {
      set.add(i);
      result.push(arr[i]);
    } else {
      set.add(j);
      result.push(arr[j]);
    }
  }
  return result;
}

/** Returns a new array with the same elements in a random order (Fisher-Yates). */
export function shuffle<T>(arr: T[], rng: RNG = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

// ---------------------------------------------------------------------------
// Histogram
// ---------------------------------------------------------------------------

/**
 * Partitions data into `bins` equally-spaced buckets and returns the count
 * in each bucket. The range spans [min(data), max(data)].
 */
export function histogram(
  data: number[],
  bins: number,
): Array<{ min: number; max: number; count: number }> {
  if (data.length === 0 || bins <= 0) return [];
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  const width = hi === lo ? 1 : (hi - lo) / bins;
  const result = Array.from({ length: bins }, (_, i) => ({
    min: lo + i * width,
    max: lo + (i + 1) * width,
    count: 0,
  }));
  for (const v of data) {
    let idx = Math.floor((v - lo) / width);
    if (idx >= bins) idx = bins - 1;
    result[idx].count++;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Empirical CDF
// ---------------------------------------------------------------------------

/** Returns a step function that estimates P(X ≤ x) from the provided sample. */
export function empiricalCDF(data: number[]): (x: number) => number {
  const sorted = data.slice().sort((a, b) => a - b);
  const n = sorted.length;
  return (x: number): number => {
    let lo = 0;
    let hi = n;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (sorted[mid] <= x) lo = mid + 1;
      else hi = mid;
    }
    return lo / n;
  };
}

// ---------------------------------------------------------------------------
// Moments
// ---------------------------------------------------------------------------

/** Arithmetic mean of data. Returns NaN for empty arrays. */
export function mean(data: number[]): number {
  if (data.length === 0) return NaN;
  return data.reduce((a, b) => a + b, 0) / data.length;
}

/**
 * Variance of data.
 * @param population - if true, divide by n (population variance); else divide by n-1 (sample variance).
 */
export function variance(data: number[], population = false): number {
  if (data.length === 0) return NaN;
  if (data.length === 1) return population ? 0 : NaN;
  const m = mean(data);
  const ss = data.reduce((acc, x) => acc + (x - m) ** 2, 0);
  return ss / (population ? data.length : data.length - 1);
}

/** Standard deviation. */
export function stddev(data: number[], population = false): number {
  return Math.sqrt(variance(data, population));
}

/** Skewness (Fisher's moment coefficient of skewness). */
export function skewness(data: number[]): number {
  if (data.length < 3) return NaN;
  const m = mean(data);
  const s = stddev(data, true);
  if (s === 0) return 0;
  const n = data.length;
  const sum3 = data.reduce((acc, x) => acc + ((x - m) / s) ** 3, 0);
  return sum3 / n;
}

/** Excess kurtosis (kurtosis − 3). */
export function kurtosis(data: number[]): number {
  if (data.length < 4) return NaN;
  const m = mean(data);
  const s = stddev(data, true);
  if (s === 0) return 0;
  const n = data.length;
  const sum4 = data.reduce((acc, x) => acc + ((x - m) / s) ** 4, 0);
  return sum4 / n - 3;
}

/** Population covariance of x and y (equal-length arrays). */
export function covariance(x: number[], y: number[]): number {
  if (x.length !== y.length) throw new Error('covariance: arrays must have equal length');
  if (x.length === 0) return NaN;
  const mx = mean(x);
  const my = mean(y);
  return x.reduce((acc, xi, i) => acc + (xi - mx) * (y[i] - my), 0) / x.length;
}

/** Pearson correlation coefficient. */
export function correlation(x: number[], y: number[]): number {
  const cov = covariance(x, y);
  const sx = stddev(x, true);
  const sy = stddev(y, true);
  if (sx === 0 || sy === 0) return NaN;
  return cov / (sx * sy);
}

// ---------------------------------------------------------------------------
// Binomial PMF / CDF
// ---------------------------------------------------------------------------

/** Probability mass function of Binomial(n, p) at integer k. */
export function binomialPMF(k: number, n: number, p: number): number {
  if (k < 0 || k > n || !Number.isInteger(k) || !Number.isInteger(n)) return 0;
  return binomialCoeff(n, k) * p ** k * (1 - p) ** (n - k);
}

/** Cumulative distribution function of Binomial(n, p): P(X ≤ k). */
export function binomialCDF(k: number, n: number, p: number): number {
  let cdf = 0;
  for (let i = 0; i <= Math.floor(k); i++) {
    cdf += binomialPMF(i, n, p);
  }
  return cdf;
}

/** Binomial coefficient C(n, k). */
function binomialCoeff(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  // Use multiplicative formula for numerical stability
  let result = 1;
  for (let i = 0; i < Math.min(k, n - k); i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
}

// ---------------------------------------------------------------------------
// Z-score
// ---------------------------------------------------------------------------

/** Standardises x relative to the given distribution. */
export function zScore(x: number, mean: number, stddev: number): number {
  return (x - mean) / stddev;
}

/** Reconstructs the original value from a z-score. */
export function fromZScore(z: number, mean: number, stddev: number): number {
  return z * stddev + mean;
}

// ---------------------------------------------------------------------------
// Monte Carlo
// ---------------------------------------------------------------------------

/**
 * Runs `samples` independent trials and returns the arithmetic mean of
 * the results.  `trial` receives the RNG so it can draw further random
 * variates in a controlled, injectable way.
 */
export function monteCarlo(
  samples: number,
  trial: (rng: RNG) => number,
  rng: RNG = Math.random,
): number {
  let total = 0;
  for (let i = 0; i < samples; i++) {
    total += trial(rng);
  }
  return total / samples;
}
