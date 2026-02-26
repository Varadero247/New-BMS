import { AnomalyConfig, AnomalyMethod, AnomalyResult, DataPoint, DetectionReport, Severity } from './types';

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

export function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length;
}

export function stdDev(values: number[]): number {
  return Math.sqrt(variance(values));
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function quantile(values: number[], q: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const pos = q * (sorted.length - 1);
  const lower = Math.floor(pos);
  const upper = Math.ceil(pos);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (pos - lower);
}

export function mad(values: number[]): number {
  const m = median(values);
  return median(values.map(v => Math.abs(v - m)));
}

export function zScore(value: number, mu: number, sigma: number): number {
  if (sigma === 0) return 0;
  return Math.abs((value - mu) / sigma);
}

export function scoreSeverity(score: number, method: AnomalyMethod, config: AnomalyConfig): Severity | null {
  const threshold = config.zScoreThreshold ?? 3.0;
  const multiplier = config.iqrMultiplier ?? 1.5;
  let ratio: number;
  if (method === 'zscore' || method === 'mad' || method === 'ewma') {
    ratio = score / threshold;
  } else if (method === 'iqr') {
    ratio = score / multiplier;
  } else {
    ratio = score;
  }
  if (ratio < 1) return null;
  if (ratio < 1.5) return 'low';
  if (ratio < 2.5) return 'medium';
  if (ratio < 4) return 'high';
  return 'critical';
}

export function detectZScore(points: DataPoint[], config: AnomalyConfig): AnomalyResult[] {
  const values = points.map(p => p.value);
  const mu = mean(values);
  const sigma = stdDev(values);
  const threshold = config.zScoreThreshold ?? 3.0;
  return points.map(point => {
    const score = zScore(point.value, mu, sigma);
    const isAnomaly = score > threshold;
    return { point, isAnomaly, score, severity: isAnomaly ? scoreSeverity(score, 'zscore', config) : null, method: 'zscore' as const };
  });
}

export function detectIQR(points: DataPoint[], config: AnomalyConfig): AnomalyResult[] {
  const values = points.map(p => p.value);
  const q1 = quantile(values, 0.25);
  const q3 = quantile(values, 0.75);
  const iqrVal = q3 - q1;
  const multiplier = config.iqrMultiplier ?? 1.5;
  const lower = q1 - multiplier * iqrVal;
  const upper = q3 + multiplier * iqrVal;
  return points.map(point => {
    const isAnomaly = point.value < lower || point.value > upper;
    const score = isAnomaly ? Math.max(point.value - upper, lower - point.value) / (iqrVal || 1) : 0;
    return { point, isAnomaly, score, severity: isAnomaly ? scoreSeverity(score, 'iqr', config) : null, method: 'iqr' as const };
  });
}

export function detectMAD(points: DataPoint[], config: AnomalyConfig): AnomalyResult[] {
  const values = points.map(p => p.value);
  const m = median(values);
  const madVal = mad(values);
  const threshold = config.zScoreThreshold ?? 3.0;
  return points.map(point => {
    const score = madVal === 0 ? 0 : Math.abs(point.value - m) / madVal;
    const isAnomaly = score > threshold;
    return { point, isAnomaly, score, severity: isAnomaly ? scoreSeverity(score, 'mad', config) : null, method: 'mad' as const };
  });
}

export function detectThreshold(points: DataPoint[], config: AnomalyConfig): AnomalyResult[] {
  const threshold = config.threshold ?? 100;
  return points.map(point => {
    const isAnomaly = point.value > threshold;
    const score = isAnomaly ? point.value / threshold : 0;
    return { point, isAnomaly, score, severity: isAnomaly ? scoreSeverity(score, 'threshold', config) : null, method: 'threshold' as const };
  });
}

export function detectEWMA(points: DataPoint[], config: AnomalyConfig): AnomalyResult[] {
  const alpha = config.ewmaAlpha ?? 0.3;
  const threshold = config.zScoreThreshold ?? 3.0;
  if (points.length === 0) return [];
  let ewma = points[0].value;
  const results: AnomalyResult[] = [];
  for (const point of points) {
    const score = Math.abs(point.value - ewma);
    const isAnomaly = score > threshold * (Math.abs(ewma) || 1);
    results.push({ point, isAnomaly, score, severity: isAnomaly ? scoreSeverity(score / (Math.abs(ewma) || 1), 'ewma', config) : null, method: 'ewma' as const });
    ewma = alpha * point.value + (1 - alpha) * ewma;
  }
  return results;
}

export function detect(points: DataPoint[], config: AnomalyConfig): DetectionReport {
  let results: AnomalyResult[];
  switch (config.method) {
    case 'zscore': results = detectZScore(points, config); break;
    case 'iqr': results = detectIQR(points, config); break;
    case 'mad': results = detectMAD(points, config); break;
    case 'threshold': results = detectThreshold(points, config); break;
    case 'ewma': results = detectEWMA(points, config); break;
    default: results = [];
  }
  const anomalyCount = results.filter(r => r.isAnomaly).length;
  const anomalyRate = points.length > 0 ? anomalyCount / points.length : 0;
  return { results, anomalyCount, anomalyRate, method: config.method };
}

export function makePoint(value: number, timestamp?: number): DataPoint {
  return { value, timestamp: timestamp ?? Date.now() };
}

export function isValidMethod(m: string): m is AnomalyMethod {
  return ['zscore', 'iqr', 'mad', 'ewma', 'threshold'].includes(m);
}

export function filterAnomalies(results: AnomalyResult[]): AnomalyResult[] {
  return results.filter(r => r.isAnomaly);
}

export function filterBySeverity(results: AnomalyResult[], severity: Severity): AnomalyResult[] {
  return results.filter(r => r.severity === severity);
}
