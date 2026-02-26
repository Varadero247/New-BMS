// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export function mean(data: number[]): number {
  if (!data.length) return NaN;
  return data.reduce((s, x) => s + x, 0) / data.length;
}

export function median(data: number[]): number {
  if (!data.length) return NaN;
  const s = [...data].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m-1] + s[m]) / 2;
}

export function mode(data: number[]): number[] {
  const freq = new Map<number, number>();
  for (const x of data) freq.set(x, (freq.get(x) ?? 0) + 1);
  const max = Math.max(...freq.values());
  return [...freq.entries()].filter(([,v]) => v === max).map(([k]) => k);
}

export function variance(data: number[], population = false): number {
  if (data.length < 2) return NaN;
  const mu = mean(data);
  const sq = data.reduce((s, x) => s + (x - mu) ** 2, 0);
  return sq / (population ? data.length : data.length - 1);
}

export function stdDev(data: number[], population = false): number {
  return Math.sqrt(variance(data, population));
}

export function min(data: number[]): number { return Math.min(...data); }
export function max(data: number[]): number { return Math.max(...data); }
export function range(data: number[]): number { return max(data) - min(data); }

export function sum(data: number[]): number { return data.reduce((s, x) => s + x, 0); }

export function percentile(data: number[], p: number): number {
  const s = [...data].sort((a, b) => a - b);
  const idx = (p / 100) * (s.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return s[lo] + (s[hi] - s[lo]) * (idx - lo);
}

export function iqr(data: number[]): number {
  return percentile(data, 75) - percentile(data, 25);
}

export function zScore(x: number, mu: number, sigma: number): number {
  return (x - mu) / sigma;
}

export function covariance(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2 || n !== y.length) return NaN;
  const mx = mean(x), my = mean(y);
  return x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0) / (n - 1);
}

export function correlation(x: number[], y: number[]): number {
  return covariance(x, y) / (stdDev(x) * stdDev(y));
}

export function linearRegression(x: number[], y: number[]): { slope: number; intercept: number } {
  const n = x.length;
  const mx = mean(x), my = mean(y);
  const slope = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0) / x.reduce((s, xi) => s + (xi - mx) ** 2, 0);
  return { slope, intercept: my - slope * mx };
}

export function skewness(data: number[]): number {
  const mu = mean(data), sd = stdDev(data, true), n = data.length;
  return data.reduce((s, x) => s + ((x - mu) / sd) ** 3, 0) / n;
}
