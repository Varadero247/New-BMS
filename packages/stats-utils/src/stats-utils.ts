// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { DescriptiveStats, HypothesisTestResult, RegressionResult, CorrelationResult, HistogramResult } from './types';

// ---- Descriptive statistics ----
export function sum(data: number[]): number { return data.reduce((a, b) => a + b, 0); }
export function mean(data: number[]): number { if (data.length === 0) return NaN; return sum(data) / data.length; }
export function min(data: number[]): number { return Math.min(...data); }
export function max(data: number[]): number { return Math.max(...data); }
export function range(data: number[]): number { return max(data) - min(data); }

export function median(data: number[]): number {
  if (data.length === 0) return NaN;
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function mode(data: number[]): number[] {
  const freq = new Map<number, number>();
  for (const v of data) freq.set(v, (freq.get(v) ?? 0) + 1);
  const maxF = Math.max(...freq.values());
  return [...freq.entries()].filter(([, f]) => f === maxF).map(([v]) => v).sort((a, b) => a - b);
}

export function variance(data: number[], population = true): number {
  if (data.length < 2) return 0;
  const m = mean(data);
  const sq = data.map(v => (v - m) ** 2);
  return sum(sq) / (population ? data.length : data.length - 1);
}

export function std(data: number[], population = true): number { return Math.sqrt(variance(data, population)); }

export function percentile(data: number[], p: number): number {
  if (data.length === 0) return NaN;
  const sorted = [...data].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function quartiles(data: number[]): { q1: number; q2: number; q3: number; iqr: number } {
  const q1 = percentile(data, 25);
  const q2 = percentile(data, 50);
  const q3 = percentile(data, 75);
  return { q1, q2, q3, iqr: q3 - q1 };
}

export function skewness(data: number[]): number {
  const n = data.length;
  if (n < 3) return 0;
  const m = mean(data);
  const s = std(data, true);
  if (s === 0) return 0;
  return data.reduce((acc, v) => acc + ((v - m) / s) ** 3, 0) / n;
}

export function kurtosis(data: number[]): number {
  const n = data.length;
  if (n < 4) return 0;
  const m = mean(data);
  const s = std(data, true);
  if (s === 0) return 0;
  return data.reduce((acc, v) => acc + ((v - m) / s) ** 4, 0) / n - 3;
}

export function describeStats(data: number[]): DescriptiveStats {
  const q = quartiles(data);
  return {
    count: data.length,
    mean: mean(data),
    median: median(data),
    mode: mode(data),
    std: std(data, false),
    variance: variance(data, false),
    min: min(data),
    max: max(data),
    range: range(data),
    skewness: skewness(data),
    kurtosis: kurtosis(data),
    q1: q.q1,
    q3: q.q3,
    iqr: q.iqr,
    sum: sum(data),
  };
}

export function zScore(value: number, m: number, s: number): number {
  if (s === 0) return 0;
  return (value - m) / s;
}

export function normalize(data: number[]): number[] {
  const m = mean(data);
  const s = std(data, true);
  if (s === 0) return data.map(() => 0);
  return data.map(v => (v - m) / s);
}

export function minMaxScale(data: number[], lo = 0, hi = 1): number[] {
  const mn = min(data);
  const mx = max(data);
  const r = mx - mn;
  if (r === 0) return data.map(() => lo);
  return data.map(v => lo + ((v - mn) / r) * (hi - lo));
}

export function weightedMean(data: number[], weights: number[]): number {
  const wSum = sum(weights);
  if (wSum === 0) return NaN;
  return data.reduce((acc, v, i) => acc + v * weights[i], 0) / wSum;
}

export function geometricMean(data: number[]): number {
  if (data.some(v => v <= 0)) return NaN;
  return Math.exp(mean(data.map(v => Math.log(v))));
}

export function harmonicMean(data: number[]): number {
  if (data.some(v => v === 0)) return NaN;
  return data.length / sum(data.map(v => 1 / v));
}

export function covariance(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2 || n !== y.length) return NaN;
  const mx = mean(x);
  const my = mean(y);
  return x.reduce((acc, xi, i) => acc + (xi - mx) * (y[i] - my), 0) / (n - 1);
}

export function rank(data: number[]): number[] {
  const sorted = [...data].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  const ranks = new Array(data.length).fill(0);
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j < sorted.length - 1 && sorted[j + 1].v === sorted[j].v) j++;
    const avgRank = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) ranks[sorted[k].i] = avgRank;
    i = j + 1;
  }
  return ranks;
}

// ---- Normal distribution ----
function erf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

export function normalPDF(x: number, m = 0, s = 1): number {
  return Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
}

export function normalCDF(x: number, m = 0, s = 1): number {
  return 0.5 * (1 + erf((x - m) / (s * Math.SQRT2)));
}

export function normalInvCDF(p: number, m = 0, s = 1): number {
  // Beasley-Springer-Moro approximation
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return m;
  const a = [0, -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239];
  const b = [0, -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let z: number;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    z = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    z = (((((a[1] * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * r + a[6]) * q /
        (((((b[1] * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]) * r + 1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    z = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
         ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  return m + s * z;
}

export function standardize(x: number, m: number, s: number): number { return zScore(x, m, s); }

// ---- T-distribution ----
function betaContinuedFraction(a: number, b: number, x: number): number {
  const maxIter = 200;
  const eps = 3e-7;
  let h = 1;
  let d = 1 - (a + b) * x / (a + 1);
  if (Math.abs(d) < 1e-30) d = 1e-30;
  d = 1 / d;
  let c = 1;
  h = d;
  for (let m = 1; m <= maxIter; m++) {
    let aa = m * (b - m) * x / ((a + 2 * m - 1) * (a + 2 * m));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (a + b + m) * x / ((a + 2 * m) * (a + 2 * m + 1));
    d = 1 + aa * d;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    c = 1 + aa / c;
    if (Math.abs(c) < 1e-30) c = 1e-30;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < eps) break;
  }
  return h;
}

function logGamma(z: number): number {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = z;
  let x = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (const ci of c) { y += 1; ser += ci / y; }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function incompleteBeta(a: number, b: number, x: number): number {
  if (x < 0 || x > 1) return NaN;
  if (x === 0) return 0;
  if (x === 1) return 1;
  const lbeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lbeta) / a;
  if (x < (a + 1) / (a + b + 2)) {
    return front * betaContinuedFraction(a, b, x);
  }
  return 1 - Math.exp(Math.log(1 - x) * b + Math.log(x) * a - lbeta) / b * betaContinuedFraction(b, a, 1 - x);
}

export function tPDF(x: number, df: number): number {
  const logC = logGamma((df + 1) / 2) - 0.5 * Math.log(df * Math.PI) - logGamma(df / 2);
  return Math.exp(logC) * Math.pow(1 + x * x / df, -(df + 1) / 2);
}

export function tCDF(x: number, df: number): number {
  const ibeta = incompleteBeta(df / 2, 0.5, df / (df + x * x));
  return x >= 0 ? 1 - 0.5 * ibeta : 0.5 * ibeta;
}

export function tInvCDF(p: number, df: number): number {
  // Use bisection
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;
  let lo = -100, hi = 100;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (tCDF(mid, df) < p) lo = mid; else hi = mid;
    if (hi - lo < 1e-10) break;
  }
  return (lo + hi) / 2;
}

// ---- Chi-squared distribution ----
function gammaCDF(x: number, a: number): number {
  // Regularized incomplete gamma using series expansion
  if (x < 0) return 0;
  if (x === 0) return 0;
  const MAX = 200;
  const eps = 1e-8;
  const logA = Math.log(x) * a - x - logGamma(a);
  let sum2 = 1 / a;
  let term = sum2;
  let n = 1;
  while (n < MAX) {
    term *= x / (a + n);
    sum2 += term;
    if (term < eps * sum2) break;
    n++;
  }
  return Math.min(1, Math.exp(logA) * sum2);
}

export function chiSquaredPDF(x: number, df: number): number {
  if (x <= 0) return 0;
  const k = df / 2;
  return Math.exp((k - 1) * Math.log(x) - x / 2 - k * Math.log(2) - logGamma(k));
}

export function chiSquaredCDF(x: number, df: number): number {
  if (x <= 0) return 0;
  return gammaCDF(x / 2, df / 2);
}

export function chiSquaredTest(observed: number[], expected: number[]): HypothesisTestResult {
  const statistic = observed.reduce((acc, o, i) => acc + (o - expected[i]) ** 2 / expected[i], 0);
  const df = observed.length - 1;
  const pValue = 1 - chiSquaredCDF(statistic, df);
  return { statistic, pValue, reject: pValue < 0.05, degreesOfFreedom: df };
}

// ---- F-distribution ----
export function fPDF(x: number, d1: number, d2: number): number {
  if (x <= 0) return 0;
  const num = Math.pow(d1 * x, d1) * Math.pow(d2, d2);
  const den = Math.pow(d1 * x + d2, d1 + d2);
  const beta = Math.exp(logGamma(d1 / 2) + logGamma(d2 / 2) - logGamma((d1 + d2) / 2));
  return Math.sqrt(num / den) / (x * beta);
}

export function fCDF(x: number, d1: number, d2: number): number {
  if (x <= 0) return 0;
  return incompleteBeta(d1 / 2, d2 / 2, d1 * x / (d1 * x + d2));
}

// ---- Hypothesis tests ----
export function tTest(sample: number[], mu = 0, alpha = 0.05): HypothesisTestResult {
  const n = sample.length;
  const m = mean(sample);
  const s = std(sample, false);
  const se = s / Math.sqrt(n);
  const statistic = se === 0 ? 0 : (m - mu) / se;
  const df = n - 1;
  const pValue = 2 * (1 - tCDF(Math.abs(statistic), df));
  const tCrit = tInvCDF(1 - alpha / 2, df);
  const ci: [number, number] = [m - tCrit * se, m + tCrit * se];
  return { statistic, pValue, reject: pValue < alpha, confidenceInterval: ci, degreesOfFreedom: df };
}

export function tTestTwoSample(a: number[], b: number[], paired = false, alpha = 0.05): HypothesisTestResult {
  if (paired) {
    const diffs = a.map((v, i) => v - b[i]);
    return tTest(diffs, 0, alpha);
  }
  const n1 = a.length, n2 = b.length;
  const m1 = mean(a), m2 = mean(b);
  const v1 = variance(a, false), v2 = variance(b, false);
  const se = Math.sqrt(v1 / n1 + v2 / n2);
  if (se === 0) {
    const reject = m1 !== m2;
    return { statistic: reject ? Infinity : 0, pValue: reject ? 0 : 1, reject, degreesOfFreedom: n1 + n2 - 2 };
  }
  const statistic = (m1 - m2) / se;
  // Welch's df
  const df = Math.round((v1 / n1 + v2 / n2) ** 2 / ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1)));
  const pValue = 2 * (1 - tCDF(Math.abs(statistic), df));
  return { statistic, pValue, reject: pValue < alpha, degreesOfFreedom: df };
}

export function zTest(sample: number[], mu: number, sigma: number, alpha = 0.05): HypothesisTestResult {
  const n = sample.length;
  const m = mean(sample);
  const se = sigma / Math.sqrt(n);
  const statistic = (m - mu) / se;
  const pValue = 2 * (1 - normalCDF(Math.abs(statistic)));
  const zCrit = normalInvCDF(1 - alpha / 2);
  const ci: [number, number] = [m - zCrit * se, m + zCrit * se];
  return { statistic, pValue, reject: pValue < alpha, confidenceInterval: ci };
}

export function anova(groups: number[][], alpha = 0.05): HypothesisTestResult {
  const k = groups.length;
  const ns = groups.map(g => g.length);
  const N = sum(ns);
  const means = groups.map(mean);
  const grandMean = mean(groups.flat());
  // Between-group SS
  const ssBetween = means.reduce((acc, m, i) => acc + ns[i] * (m - grandMean) ** 2, 0);
  // Within-group SS
  const ssWithin = groups.reduce((acc, g, i) => acc + sum(g.map(v => (v - means[i]) ** 2)), 0);
  const dfBetween = k - 1;
  const dfWithin = N - k;
  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;
  if (msWithin === 0) {
    // All within-group variance is zero; reject if any group means differ
    const reject = msBetween > 0;
    return { statistic: reject ? Infinity : 0, pValue: reject ? 0 : 1, reject, degreesOfFreedom: dfBetween };
  }
  const statistic = msBetween / msWithin;
  const pValue = 1 - fCDF(statistic, dfBetween, dfWithin);
  return { statistic, pValue, reject: pValue < alpha, degreesOfFreedom: dfBetween };
}

// ---- Correlation & Regression ----
export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2 || n !== y.length) return NaN;
  const mx = mean(x), my = mean(y);
  const num = x.reduce((acc, xi, i) => acc + (xi - mx) * (y[i] - my), 0);
  const den = Math.sqrt(x.reduce((acc, xi) => acc + (xi - mx) ** 2, 0) * y.reduce((acc, yi) => acc + (yi - my) ** 2, 0));
  return den === 0 ? 0 : num / den;
}

export function spearmanCorrelation(x: number[], y: number[]): number {
  return pearsonCorrelation(rank(x), rank(y));
}

export function correlation(x: number[], y: number[]): CorrelationResult {
  return { pearson: pearsonCorrelation(x, y), spearman: spearmanCorrelation(x, y) };
}

export function linearRegression(x: number[], y: number[]): RegressionResult {
  const n = x.length;
  const mx = mean(x), my = mean(y);
  const ssxx = x.reduce((acc, xi) => acc + (xi - mx) ** 2, 0);
  const ssxy = x.reduce((acc, xi, i) => acc + (xi - mx) * (y[i] - my), 0);
  const slope = ssxx === 0 ? 0 : ssxy / ssxx;
  const intercept = my - slope * mx;
  const predict = (xv: number) => slope * xv + intercept;
  const residuals = x.map((xi, i) => y[i] - predict(xi));
  const ssTot = y.reduce((acc, yi) => acc + (yi - my) ** 2, 0);
  const ssRes = sum(residuals.map(r => r ** 2));
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2, residuals, predict };
}

// ---- Sampling ----
export function shuffle<T>(data: T[]): T[] {
  const arr = [...data];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function sample(data: number[], n: number, withReplacement = false): number[] {
  if (withReplacement) {
    return Array.from({ length: n }, () => data[Math.floor(Math.random() * data.length)]);
  }
  return shuffle(data).slice(0, n);
}

export function bootstrapMean(data: number[], iterations = 1000): number[] {
  return Array.from({ length: iterations }, () => mean(sample(data, data.length, true)));
}

export function confidenceInterval(data: number[], confidence = 0.95): [number, number] {
  const m = mean(data);
  const s = std(data, false);
  const n = data.length;
  const alpha = 1 - confidence;
  const tCrit = tInvCDF(1 - alpha / 2, n - 1);
  const se = s / Math.sqrt(n);
  return [m - tCrit * se, m + tCrit * se];
}

// ---- Frequency Analysis ----
export function histogram(data: number[], bins = 10): HistogramResult {
  const mn = min(data), mx = max(data);
  const binWidth = (mx - mn) / bins;
  const edges = Array.from({ length: bins + 1 }, (_, i) => mn + i * binWidth);
  const counts = new Array(bins).fill(0);
  for (const v of data) {
    let i = Math.floor((v - mn) / binWidth);
    if (i >= bins) i = bins - 1;
    counts[i]++;
  }
  const total = sum(counts);
  const density = counts.map(c => total > 0 ? c / (total * binWidth) : 0);
  return { bins: edges, counts, density };
}

export function frequency<T>(data: T[]): Map<T, number> {
  const map = new Map<T, number>();
  for (const v of data) map.set(v, (map.get(v) ?? 0) + 1);
  return map;
}

export function cumulative(data: number[]): number[] {
  const result: number[] = [];
  let acc = 0;
  for (const v of data) { acc += v; result.push(acc); }
  return result;
}
