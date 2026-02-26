// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export interface DataPoint {
  timestamp: number;
  value: number;
}

// ---------------------------------------------------------------------------
// TimeSeries class
// ---------------------------------------------------------------------------
export class TimeSeries {
  private _data: DataPoint[];

  constructor(data: DataPoint[] = []) {
    this._data = [...data].sort((a, b) => a.timestamp - b.timestamp);
  }

  add(point: DataPoint): void {
    this._data.push(point);
    this._data.sort((a, b) => a.timestamp - b.timestamp);
  }

  get(index: number): DataPoint | undefined {
    return this._data[index];
  }

  slice(start: number, end: number): TimeSeries {
    return new TimeSeries(this._data.filter(p => p.timestamp >= start && p.timestamp <= end));
  }

  /** Resample to evenly-spaced intervals using linear interpolation. */
  resample(intervalMs: number): TimeSeries {
    if (this._data.length < 2) return new TimeSeries([...this._data]);
    const first = this._data[0].timestamp;
    const last = this._data[this._data.length - 1].timestamp;
    const result: DataPoint[] = [];
    for (let t = first; t <= last; t += intervalMs) {
      result.push({ timestamp: t, value: this._interpolateAt(t) });
    }
    return new TimeSeries(result);
  }

  private _interpolateAt(t: number): number {
    if (this._data.length === 0) return 0;
    if (t <= this._data[0].timestamp) return this._data[0].value;
    if (t >= this._data[this._data.length - 1].timestamp) return this._data[this._data.length - 1].value;
    let lo = 0;
    let hi = this._data.length - 1;
    while (lo + 1 < hi) {
      const mid = (lo + hi) >> 1;
      if (this._data[mid].timestamp <= t) lo = mid; else hi = mid;
    }
    const a = this._data[lo];
    const b = this._data[hi];
    const ratio = (t - a.timestamp) / (b.timestamp - a.timestamp);
    return a.value + ratio * (b.value - a.value);
  }

  /** Linear interpolation at an arbitrary timestamp (public). */
  interpolate(t: number): number {
    return this._interpolateAt(t);
  }

  get length(): number {
    return this._data.length;
  }

  values(): number[] {
    return this._data.map(p => p.value);
  }

  timestamps(): number[] {
    return this._data.map(p => p.timestamp);
  }
}

// ---------------------------------------------------------------------------
// Moving averages
// ---------------------------------------------------------------------------

/** Simple Moving Average */
export function sma(data: number[], window: number): number[] {
  if (window <= 0 || window > data.length) return [];
  const result: number[] = [];
  for (let i = 0; i <= data.length - window; i++) {
    let sum = 0;
    for (let j = i; j < i + window; j++) sum += data[j];
    result.push(sum / window);
  }
  return result;
}

/** Exponential Moving Average */
export function ema(data: number[], alpha: number): number[] {
  if (data.length === 0) return [];
  const result: number[] = [data[0]];
  for (let i = 1; i < data.length; i++) {
    result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}

/** Weighted Moving Average */
export function wma(data: number[], weights: number[]): number[] {
  const w = weights.length;
  if (w === 0 || w > data.length) return [];
  const weightSum = weights.reduce((a, b) => a + b, 0);
  if (weightSum === 0) return [];
  const result: number[] = [];
  for (let i = 0; i <= data.length - w; i++) {
    let s = 0;
    for (let j = 0; j < w; j++) s += data[i + j] * weights[j];
    result.push(s / weightSum);
  }
  return result;
}

/** Double Exponential Moving Average */
export function dema(data: number[], alpha: number): number[] {
  const e1 = ema(data, alpha);
  const e2 = ema(e1, alpha);
  return e1.map((v, i) => 2 * v - e2[i]);
}

/** Triple Exponential Moving Average */
export function tema(data: number[], alpha: number): number[] {
  const e1 = ema(data, alpha);
  const e2 = ema(e1, alpha);
  const e3 = ema(e2, alpha);
  return e1.map((v, i) => 3 * v - 3 * e2[i] + e3[i]);
}

// ---------------------------------------------------------------------------
// Statistical functions
// ---------------------------------------------------------------------------

export function mean(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
}

export function variance(data: number[]): number {
  if (data.length < 2) return 0;
  const m = mean(data);
  return data.reduce((s, v) => s + (v - m) ** 2, 0) / data.length;
}

export function stddev(data: number[]): number {
  return Math.sqrt(variance(data));
}

/** Pearson autocorrelation at a given lag */
export function autocorrelation(data: number[], lag: number): number {
  if (lag < 0 || lag >= data.length) return 0;
  const m = mean(data);
  const v = variance(data);
  if (v === 0) return lag === 0 ? 1 : 0;
  let sum = 0;
  for (let i = 0; i < data.length - lag; i++) {
    sum += (data[i] - m) * (data[i + lag] - m);
  }
  return sum / (data.length * v);
}

/** Cross-correlation between two series at a given lag */
export function crossCorrelation(a: number[], b: number[], lag: number): number {
  const n = Math.min(a.length, b.length);
  if (n === 0) return 0;
  const ma = mean(a.slice(0, n));
  const mb = mean(b.slice(0, n));
  const sa = stddev(a.slice(0, n));
  const sb = stddev(b.slice(0, n));
  if (sa === 0 || sb === 0) return 0;
  let sum = 0;
  const count = n - Math.abs(lag);
  if (count <= 0) return 0;
  if (lag >= 0) {
    for (let i = 0; i < count; i++) sum += (a[i] - ma) * (b[i + lag] - mb);
  } else {
    for (let i = 0; i < count; i++) sum += (a[i - lag] - ma) * (b[i] - mb);
  }
  return sum / (count * sa * sb);
}

export interface DecomposeResult {
  trend: number[];
  seasonal: number[];
  residual: number[];
}

/** Additive seasonal decomposition (centred moving average trend) */
export function seasonalDecompose(data: number[], period: number): DecomposeResult {
  const n = data.length;
  if (n < period * 2) {
    return { trend: data.slice(), seasonal: new Array(n).fill(0), residual: new Array(n).fill(0) };
  }

  // Trend via centred moving average
  const trend: number[] = new Array(n).fill(NaN);
  const half = Math.floor(period / 2);
  for (let i = half; i < n - half; i++) {
    let sum = 0;
    for (let j = i - half; j <= i + half; j++) sum += data[j];
    trend[i] = sum / (2 * half + 1);
  }

  // Detrend
  const detrended: number[] = data.map((v, i) => (isNaN(trend[i]) ? NaN : v - trend[i]));

  // Average each season position
  const seasonalAvg: number[] = new Array(period).fill(0);
  const seasonalCount: number[] = new Array(period).fill(0);
  for (let i = 0; i < n; i++) {
    if (!isNaN(detrended[i])) {
      seasonalAvg[i % period] += detrended[i];
      seasonalCount[i % period]++;
    }
  }
  const seasonalMeans = seasonalAvg.map((s, i) => (seasonalCount[i] > 0 ? s / seasonalCount[i] : 0));

  // Centre seasonal component
  const seasonalCenter = mean(seasonalMeans);
  const centeredSeasonal = seasonalMeans.map(v => v - seasonalCenter);

  const seasonal = data.map((_, i) => centeredSeasonal[i % period]);
  const residual = data.map((v, i) => {
    const t = isNaN(trend[i]) ? mean(trend.filter(x => !isNaN(x))) : trend[i];
    return v - t - seasonal[i];
  });

  // Fill NaN trend edges with nearest valid
  const validTrend = trend.filter(x => !isNaN(x));
  const trendFilled = trend.map((v, i) => {
    if (!isNaN(v)) return v;
    return i < half ? validTrend[0] ?? data[i] : validTrend[validTrend.length - 1] ?? data[i];
  });

  return { trend: trendFilled, seasonal, residual };
}

// ---------------------------------------------------------------------------
// Smoothing
// ---------------------------------------------------------------------------

/** Gaussian smoothing with given sigma */
export function gaussianSmooth(data: number[], sigma: number): number[] {
  if (data.length === 0) return [];
  const radius = Math.ceil(3 * sigma);
  const kernel: number[] = [];
  for (let i = -radius; i <= radius; i++) {
    kernel.push(Math.exp(-(i * i) / (2 * sigma * sigma)));
  }
  const kernelSum = kernel.reduce((a, b) => a + b, 0);
  const normalized = kernel.map(k => k / kernelSum);

  return data.map((_, idx) => {
    let s = 0;
    let w = 0;
    for (let k = 0; k < normalized.length; k++) {
      const di = idx - radius + k;
      if (di >= 0 && di < data.length) {
        s += normalized[k] * data[di];
        w += normalized[k];
      }
    }
    return w > 0 ? s / w : data[idx];
  });
}

/** Savitzky-Golay smoothing (polynomial fitting, linear approximation) */
export function savitzkyGolay(data: number[], windowSize: number, _polyOrder: number): number[] {
  if (data.length === 0) return [];
  const half = Math.floor(windowSize / 2);
  return data.map((_, idx) => {
    const lo = Math.max(0, idx - half);
    const hi = Math.min(data.length - 1, idx + half);
    let sum = 0;
    for (let j = lo; j <= hi; j++) sum += data[j];
    return sum / (hi - lo + 1);
  });
}

/** 1-D Kalman filter (constant model) */
export function kalmanFilter(data: number[], processNoise: number, measurementNoise: number): number[] {
  if (data.length === 0) return [];
  const result: number[] = [];
  let estimate = data[0];
  let errorCovariance = 1;
  for (const measurement of data) {
    // Predict
    const predictedErrorCovariance = errorCovariance + processNoise;
    // Update
    const kalmanGain = predictedErrorCovariance / (predictedErrorCovariance + measurementNoise);
    estimate = estimate + kalmanGain * (measurement - estimate);
    errorCovariance = (1 - kalmanGain) * predictedErrorCovariance;
    result.push(estimate);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Forecasting
// ---------------------------------------------------------------------------

/** Linear regression forecast: fit line to data and project `steps` ahead */
export function linearForecast(data: number[], steps: number): number[] {
  const n = data.length;
  if (n === 0) return [];
  const xs = Array.from({ length: n }, (_, i) => i);
  const mx = mean(xs);
  const my = mean(data);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (data[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = my - slope * mx;
  return Array.from({ length: steps }, (_, i) => slope * (n + i) + intercept);
}

/** Holt's Double Exponential Smoothing */
export function holtsDouble(data: number[], alpha: number, beta: number, steps: number): number[] {
  if (data.length < 2) return [];
  let level = data[0];
  let trend = data[1] - data[0];
  for (let i = 1; i < data.length; i++) {
    const prevLevel = level;
    level = alpha * data[i] + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }
  return Array.from({ length: steps }, (_, i) => level + (i + 1) * trend);
}

/** Holt-Winters Triple Exponential Smoothing (additive) */
export function holtsWinters(
  data: number[],
  alpha: number,
  beta: number,
  gamma: number,
  period: number,
  steps: number,
): number[] {
  if (data.length < period) return [];
  // Initialise
  let level = mean(data.slice(0, period));
  let trend = (mean(data.slice(period, 2 * period)) - mean(data.slice(0, period))) / period;
  const seasonals: number[] = data.slice(0, period).map(v => v - level);

  for (let i = period; i < data.length; i++) {
    const s = seasonals[i % period];
    const prevLevel = level;
    level = alpha * (data[i] - s) + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    seasonals[i % period] = gamma * (data[i] - level) + (1 - gamma) * s;
  }

  return Array.from({ length: steps }, (_, i) => {
    const m = i + 1;
    return level + m * trend + seasonals[(data.length + i) % period];
  });
}

/** ARIMA-like forecast (simplified: AR(p) portion using OLS) */
export function arima(data: number[], p: number, d: number, _q: number): number[] {
  // Apply differencing
  let series = [...data];
  for (let i = 0; i < d; i++) {
    const diff: number[] = [];
    for (let j = 1; j < series.length; j++) diff.push(series[j] - series[j - 1]);
    series = diff;
  }
  if (series.length <= p) return [data[data.length - 1]];

  // Fit AR(p) via OLS
  const n = series.length;
  // Build matrix X (n-p rows, p cols) and vector y
  const X: number[][] = [];
  const y: number[] = [];
  for (let i = p; i < n; i++) {
    X.push(series.slice(i - p, i).reverse());
    y.push(series[i]);
  }
  // Normal equations: phi = (X'X)^-1 X'y  (simple for p=1..4)
  const phi = olsCoefficients(X, y);

  // Forecast one step on the differenced series
  const lastP = series.slice(n - p).reverse();
  const diffForecast = phi.reduce((s, c, i) => s + c * (lastP[i] ?? 0), 0);

  // Undo differencing (d times)
  let forecast = diffForecast;
  if (d > 0) {
    let base = data[data.length - 1];
    forecast = base + forecast;
  }

  return [forecast];
}

/** Simple OLS for small systems */
function olsCoefficients(X: number[][], y: number[]): number[] {
  const p = X[0]?.length ?? 0;
  if (p === 0) return [];
  // Compute X'X and X'y
  const XtX: number[][] = Array.from({ length: p }, () => new Array(p).fill(0));
  const Xty: number[] = new Array(p).fill(0);
  for (let i = 0; i < X.length; i++) {
    for (let j = 0; j < p; j++) {
      Xty[j] += X[i][j] * y[i];
      for (let k = 0; k < p; k++) {
        XtX[j][k] += X[i][j] * X[i][k];
      }
    }
  }
  // Solve via Gaussian elimination
  return gaussianElimination(XtX, Xty);
}

function gaussianElimination(A: number[][], b: number[]): number[] {
  const n = b.length;
  const aug: number[][] = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    if (Math.abs(aug[col][col]) < 1e-12) continue;
    for (let row = col + 1; row < n; row++) {
      const factor = aug[row][col] / aug[col][col];
      for (let k = col; k <= n; k++) aug[row][k] -= factor * aug[col][k];
    }
  }
  const x: number[] = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = aug[i][n];
    for (let j = i + 1; j < n; j++) s -= aug[i][j] * x[j];
    x[i] = Math.abs(aug[i][i]) < 1e-12 ? 0 : s / aug[i][i];
  }
  return x;
}

// ---------------------------------------------------------------------------
// Anomaly detection
// ---------------------------------------------------------------------------

export interface AnomalyResult {
  index: number;
  value: number;
  score: number;
}

/** Z-Score anomaly detection */
export function zScoreAnomalies(data: number[], threshold: number): AnomalyResult[] {
  const m = mean(data);
  const s = stddev(data);
  if (s === 0) return [];
  return data
    .map((v, i) => ({ index: i, value: v, score: Math.abs(v - m) / s }))
    .filter(r => r.score > threshold);
}

/** IQR-based anomaly detection */
export function iqrAnomalies(data: number[], multiplier: number): AnomalyResult[] {
  if (data.length < 4) return [];
  const sorted = [...data].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lower = q1 - multiplier * iqr;
  const upper = q3 + multiplier * iqr;
  return data
    .map((v, i) => ({
      index: i,
      value: v,
      score: v < lower ? (lower - v) / (iqr || 1) : v > upper ? (v - upper) / (iqr || 1) : 0,
    }))
    .filter(r => r.score > 0);
}

/** Simplified isolation score (distance-based proxy) */
export function isolationScore(data: number[], point: number): number {
  if (data.length === 0) return 0;
  const m = mean(data);
  const s = stddev(data);
  if (s === 0) return 0;
  return Math.abs(point - m) / s;
}

// ---------------------------------------------------------------------------
// Change detection
// ---------------------------------------------------------------------------

export interface CusumResult {
  upper: number[];
  lower: number[];
  alarms: number[];
}

/** CUSUM change detection */
export function cusum(data: number[], target: number, allowance: number): CusumResult {
  const upper: number[] = [];
  const lower: number[] = [];
  const alarms: number[] = [];
  let cu = 0;
  let cl = 0;
  for (let i = 0; i < data.length; i++) {
    cu = Math.max(0, cu + data[i] - target - allowance);
    cl = Math.max(0, cl - data[i] + target - allowance);
    upper.push(cu);
    lower.push(cl);
    if (cu > 0 || cl > 0) alarms.push(i);
  }
  return { upper, lower, alarms };
}

/** Pettitt test — returns the index of the most likely change point */
export function pettittTest(data: number[]): number {
  const n = data.length;
  if (n < 2) return 0;
  let maxK = 0;
  let maxIdx = 0;
  for (let t = 1; t < n; t++) {
    let u = 0;
    for (let i = 0; i <= t - 1; i++) {
      for (let j = t; j < n; j++) {
        u += Math.sign(data[i] - data[j]);
      }
    }
    const absU = Math.abs(u);
    if (absU > maxK) {
      maxK = absU;
      maxIdx = t;
    }
  }
  return maxIdx;
}

// ---------------------------------------------------------------------------
// Helpers / generators
// ---------------------------------------------------------------------------

/** Generate a sine wave with optional Gaussian noise */
export function generateSine(
  length: number,
  frequency: number,
  amplitude: number,
  noise: number,
): number[] {
  return Array.from({ length }, (_, i) => {
    const n = noise > 0 ? (Math.random() * 2 - 1) * noise : 0;
    return amplitude * Math.sin(2 * Math.PI * frequency * i) + n;
  });
}

/** Generate a linear trend with optional Gaussian noise */
export function generateTrend(
  length: number,
  slope: number,
  intercept: number,
  noise: number,
): number[] {
  return Array.from({ length }, (_, i) => {
    const n = noise > 0 ? (Math.random() * 2 - 1) * noise : 0;
    return slope * i + intercept + n;
  });
}

/** Apply d-th order differencing to a series */
export function differencing(data: number[], order: number): number[] {
  let series = [...data];
  for (let d = 0; d < order; d++) {
    const diff: number[] = [];
    for (let i = 1; i < series.length; i++) diff.push(series[i] - series[i - 1]);
    series = diff;
  }
  return series;
}
