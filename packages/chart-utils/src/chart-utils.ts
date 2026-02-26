// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  AggregateMethod,
  BucketedData,
  ChartData,
  DataPoint,
  HeatmapCell,
  MovingAverage,
  Outlier,
  PieSlice,
  Series,
  TimeUnit,
  TrendResult,
} from './types';

// ─── Data Transformation ────────────────────────────────────────────────────

/**
 * Convert a record array to a Series using specified name and value fields.
 */
export function toSeries(
  data: Record<string, number>[],
  nameField: string,
  valueField: string,
): Series {
  return {
    name: nameField,
    data: data.map((row, i) => ({
      x: row[nameField] !== undefined ? row[nameField] : i,
      y: Number(row[valueField]) || 0,
    })),
  };
}

/**
 * Convert record array to PieSlice array with percentages.
 */
export function toPieSeries(
  data: Record<string, number>[],
  labelField: string,
  valueField: string,
): PieSlice[] {
  const total = data.reduce((sum, row) => sum + (Number(row[valueField]) || 0), 0);
  return data.map((row) => {
    const value = Number(row[valueField]) || 0;
    return {
      label: String(row[labelField] ?? ''),
      value,
      percentage: total === 0 ? 0 : (value / total) * 100,
    };
  });
}

/**
 * Normalize heatmap data — returns cells as-is (values already provided).
 */
export function toHeatmap(data: Array<{ x: string; y: string; value: number }>): HeatmapCell[] {
  return data.map(({ x, y, value }) => ({ x, y, value }));
}

/**
 * Merge multiple Series objects into a single ChartData.
 */
export function mergeSeriesData(...series: Series[]): ChartData {
  const allXLabels = new Set<string>();
  for (const s of series) {
    for (const pt of s.data) {
      allXLabels.add(String(pt.x));
    }
  }
  return {
    series,
    xLabels: Array.from(allXLabels),
  };
}

/**
 * Transpose rows so that each non-label key becomes its own Series.
 */
export function transposeToSeries(
  rows: Record<string, number | string>[],
  labelKey: string,
): Series[] {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]).filter((k) => k !== labelKey);
  return keys.map((key) => ({
    name: key,
    data: rows.map((row) => ({
      x: String(row[labelKey] ?? ''),
      y: Number(row[key]) || 0,
    })),
  }));
}

// ─── Aggregation ─────────────────────────────────────────────────────────────

/**
 * Apply an aggregation method to an array of numbers.
 */
export function aggregate(values: number[], method: AggregateMethod): number {
  const clean = values.filter((v) => isFinite(v));
  if (clean.length === 0) return 0;

  switch (method) {
    case 'sum':
      return clean.reduce((a, b) => a + b, 0);
    case 'average':
      return clean.reduce((a, b) => a + b, 0) / clean.length;
    case 'min':
      return Math.min(...clean);
    case 'max':
      return Math.max(...clean);
    case 'count':
      return clean.length;
    case 'first':
      return clean[0];
    case 'last':
      return clean[clean.length - 1];
    case 'median': {
      const sorted = [...clean].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }
    case 'stddev': {
      const mean = clean.reduce((a, b) => a + b, 0) / clean.length;
      const variance = clean.reduce((sum, v) => sum + (v - mean) ** 2, 0) / clean.length;
      return Math.sqrt(variance);
    }
    default:
      return 0;
  }
}

/**
 * Create histogram buckets from a flat value array.
 */
export function bucketize(values: number[], bucketCount: number): BucketedData[] {
  const clean = values.filter((v) => isFinite(v));
  if (clean.length === 0 || bucketCount <= 0) return [];

  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const range = max - min;

  if (range === 0) {
    return [
      {
        label: String(min),
        value: min,
        count: clean.length,
        from: min,
        to: min,
      },
    ];
  }

  const step = range / bucketCount;
  const buckets: BucketedData[] = Array.from({ length: bucketCount }, (_, i) => {
    const from = min + i * step;
    const to = min + (i + 1) * step;
    return {
      label: `${from.toFixed(2)}–${to.toFixed(2)}`,
      value: from + step / 2,
      count: 0,
      from,
      to,
    };
  });

  for (const v of clean) {
    const idx = Math.min(Math.floor((v - min) / step), bucketCount - 1);
    buckets[idx].count++;
  }

  return buckets;
}

/**
 * Time-based aggregation: groups timestamped points into time buckets.
 */
export function groupByTime(
  points: Array<{ timestamp: number; value: number }>,
  unit: TimeUnit,
  method: AggregateMethod,
): DataPoint[] {
  const bucketKey = (ts: number): string => {
    const d = new Date(ts);
    switch (unit) {
      case 'minute':
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}-${d.getMinutes()}`;
      case 'hour':
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`;
      case 'day':
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      case 'week': {
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay());
        return `${startOfWeek.getFullYear()}-W${startOfWeek.getMonth()}-${startOfWeek.getDate()}`;
      }
      case 'month':
        return `${d.getFullYear()}-${d.getMonth()}`;
      case 'quarter': {
        const q = Math.floor(d.getMonth() / 3);
        return `${d.getFullYear()}-Q${q}`;
      }
      case 'year':
        return `${d.getFullYear()}`;
    }
  };

  const grouped = new Map<string, number[]>();
  const keyOrder: string[] = [];

  for (const pt of points) {
    const key = bucketKey(pt.timestamp);
    if (!grouped.has(key)) {
      grouped.set(key, []);
      keyOrder.push(key);
    }
    grouped.get(key)!.push(pt.value);
  }

  return keyOrder.map((key) => ({
    x: key,
    y: aggregate(grouped.get(key)!, method),
  }));
}

/**
 * Rolling window aggregation over DataPoints.
 */
export function rollup(
  points: DataPoint[],
  windowSize: number,
  method: AggregateMethod,
): DataPoint[] {
  if (windowSize <= 0) return [];
  return points.map((pt, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const window = points.slice(start, i + 1).map((p) => p.y);
    return { ...pt, y: aggregate(window, method) };
  });
}

/**
 * Resample a series to a target number of points using the given aggregation.
 */
export function resample(series: Series, targetLength: number, method: AggregateMethod): Series {
  const data = series.data;
  if (data.length === 0 || targetLength <= 0) return { ...series, data: [] };
  if (targetLength >= data.length) return { ...series };

  const chunkSize = data.length / targetLength;
  const resampled: DataPoint[] = Array.from({ length: targetLength }, (_, i) => {
    const start = Math.floor(i * chunkSize);
    const end = Math.floor((i + 1) * chunkSize);
    const chunk = data.slice(start, end);
    const values = chunk.map((p) => p.y);
    return {
      x: chunk[0].x,
      y: aggregate(values, method),
    };
  });

  return { ...series, data: resampled };
}

// ─── Statistics ───────────────────────────────────────────────────────────────

/**
 * Simple moving average.
 */
export function movingAverage(values: number[], period: number): MovingAverage {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const window = values.slice(i - period + 1, i + 1);
      result.push(window.reduce((a, b) => a + b, 0) / period);
    }
  }
  return { period, values: result };
}

/**
 * Exponential moving average.
 */
export function exponentialMovingAverage(values: number[], alpha: number): number[] {
  if (values.length === 0) return [];
  const result: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    result.push(alpha * values[i] + (1 - alpha) * result[i - 1]);
  }
  return result;
}

/**
 * Linear regression (ordinary least squares).
 */
export function linearTrend(points: Array<{ x: number; y: number }>): TrendResult {
  const n = points.length;
  if (n === 0) {
    const forecast = (_x: number) => 0;
    return { slope: 0, intercept: 0, r2: 0, direction: 'flat', forecast };
  }

  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);

  const denom = n * sumX2 - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0);
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  const direction: 'up' | 'down' | 'flat' =
    Math.abs(slope) < 1e-10 ? 'flat' : slope > 0 ? 'up' : 'down';

  const forecast = (x: number) => slope * x + intercept;

  return { slope, intercept, r2, direction, forecast };
}

/**
 * Z-score based outlier detection.
 */
export function detectOutliers(values: number[], threshold = 2.5): Outlier[] {
  if (values.length === 0) return [];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  if (std === 0) return [];

  return values
    .map((v, i) => ({ index: i, value: v, zscore: (v - mean) / std }))
    .filter((o) => Math.abs(o.zscore) > threshold);
}

/**
 * Normalize values to [0, 1].
 */
export function normalize(values: number[]): number[] {
  const clean = values.filter((v) => isFinite(v));
  if (clean.length === 0) return values.map(() => 0);
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const range = max - min;
  if (range === 0) return values.map(() => 0);
  return values.map((v) => (isFinite(v) ? (v - min) / range : 0));
}

/**
 * Standardize values to z-scores.
 */
export function standardize(values: number[]): number[] {
  if (values.length === 0) return [];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  if (std === 0) return values.map(() => 0);
  return values.map((v) => (v - mean) / std);
}

/**
 * Running cumulative sum.
 */
export function cumulative(values: number[]): number[] {
  let running = 0;
  return values.map((v) => {
    running += v;
    return running;
  });
}

/**
 * Period-over-period percentage change.
 * First element is always 0; subsequent elements are ((curr - prev) / |prev|) * 100.
 */
export function pctChange(values: number[]): number[] {
  if (values.length === 0) return [];
  return values.map((v, i) => {
    if (i === 0) return 0;
    const prev = values[i - 1];
    if (prev === 0) return 0;
    return ((v - prev) / Math.abs(prev)) * 100;
  });
}

/**
 * Rolling Pearson correlation between two arrays over a sliding window.
 */
export function rollingCorrelation(a: number[], b: number[], window: number): number[] {
  const n = Math.min(a.length, b.length);
  const result: number[] = [];

  for (let i = 0; i < n; i++) {
    if (i < window - 1) {
      result.push(NaN);
      continue;
    }
    const wa = a.slice(i - window + 1, i + 1);
    const wb = b.slice(i - window + 1, i + 1);
    const meanA = wa.reduce((s, v) => s + v, 0) / window;
    const meanB = wb.reduce((s, v) => s + v, 0) / window;
    let num = 0;
    let denomA = 0;
    let denomB = 0;
    for (let j = 0; j < window; j++) {
      const da = wa[j] - meanA;
      const db = wb[j] - meanB;
      num += da * db;
      denomA += da * da;
      denomB += db * db;
    }
    const denom = Math.sqrt(denomA * denomB);
    result.push(denom === 0 ? 0 : num / denom);
  }

  return result;
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Format a number with thousands separators and fixed decimals.
 */
export function formatValue(value: number, decimals = 2): string {
  return value.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a number as a percentage string.
 */
export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Generate `count` distinct hex colors evenly distributed around the hue wheel.
 */
export function generateColors(count: number, baseHue = 0): string[] {
  if (count <= 0) return [];
  return Array.from({ length: count }, (_, i) => {
    const hue = (baseHue + (i * 360) / count) % 360;
    return hslToHex(hue, 65, 55);
  });
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return [r, g, b];
}

/**
 * Linearly interpolate between two hex colors.
 * t = 0 returns `from`, t = 1 returns `to`.
 */
export function interpolateColor(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(lerp(r1, r2))}${toHex(lerp(g1, g2))}${toHex(lerp(b1, b2))}`;
}

/**
 * Scale a value from one range to another.
 */
export function scaleToRange(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number,
): number {
  const fromRange = fromMax - fromMin;
  if (fromRange === 0) return toMin;
  return toMin + ((value - fromMin) / fromRange) * (toMax - toMin);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Get the min and max y-values of a Series.
 */
export function getMinMax(series: Series): { min: number; max: number } {
  if (series.data.length === 0) return { min: 0, max: 0 };
  const values = series.data.map((p) => p.y);
  return { min: Math.min(...values), max: Math.max(...values) };
}

/**
 * Pad a Series to a target length by appending fill values.
 */
export function padSeries(series: Series, targetLength: number, fillValue = 0): Series {
  if (series.data.length >= targetLength) return { ...series };
  const extra: DataPoint[] = Array.from(
    { length: targetLength - series.data.length },
    (_, i) => ({
      x: series.data.length + i,
      y: fillValue,
    }),
  );
  return { ...series, data: [...series.data, ...extra] };
}

/**
 * Align two series to share the same x labels (union of both x sets, filling missing y with 0).
 */
export function alignSeries(a: Series, b: Series): [Series, Series] {
  const allX = Array.from(
    new Set([...a.data.map((p) => String(p.x)), ...b.data.map((p) => String(p.x))]),
  );

  const aMap = new Map(a.data.map((p) => [String(p.x), p.y]));
  const bMap = new Map(b.data.map((p) => [String(p.x), p.y]));

  const newA: Series = {
    ...a,
    data: allX.map((x) => ({ x, y: aMap.get(x) ?? 0 })),
  };
  const newB: Series = {
    ...b,
    data: allX.map((x) => ({ x, y: bMap.get(x) ?? 0 })),
  };

  return [newA, newB];
}

/**
 * Remove NaN and Infinity values from an array.
 */
export function filterNaN(values: number[]): number[] {
  return values.filter((v) => isFinite(v) && !isNaN(v));
}
