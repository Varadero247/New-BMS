// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface MetricLabels {
  [key: string]: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function labelsKey(labels?: MetricLabels): string {
  if (!labels || Object.keys(labels).length === 0) return '__default__';
  return Object.keys(labels)
    .sort()
    .map((k) => `${k}=${labels[k]}`)
    .join(',');
}

export function formatPrometheusLabels(labels: MetricLabels): string {
  const keys = Object.keys(labels);
  if (keys.length === 0) return '';
  const parts = keys.sort().map((k) => `${k}="${labels[k]}"`);
  return `{${parts.join(',')}}`;
}

export function parsePrometheusLine(
  line: string
): { name: string; labels: MetricLabels; value: number } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;
  // name{labels} value or name value
  const withLabels = /^([a-zA-Z_:][a-zA-Z0-9_:]*)\{([^}]*)\}\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)$/.exec(trimmed);
  if (withLabels) {
    const name = withLabels[1];
    const labelsStr = withLabels[2];
    const value = parseFloat(withLabels[3]);
    const labels: MetricLabels = {};
    if (labelsStr.trim()) {
      for (const part of labelsStr.split(',')) {
        const m = /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*"([^"]*)"\s*$/.exec(part);
        if (m) labels[m[1]] = m[2];
      }
    }
    return { name, labels, value };
  }
  const plain = /^([a-zA-Z_:][a-zA-Z0-9_:]*)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)$/.exec(trimmed);
  if (plain) {
    return { name: plain[1], labels: {}, value: parseFloat(plain[2]) };
  }
  return null;
}

export function mergeMetrics(a: string, b: string): string {
  return a + (a.endsWith('\n') || a === '' ? '' : '\n') + b;
}

// ── Counter ────────────────────────────────────────────────────────────────

export class Counter {
  readonly name: string;
  readonly help: string;
  private readonly labelNames: string[];
  private values: Map<string, number> = new Map();
  private labelSets: Map<string, MetricLabels> = new Map();

  constructor(name: string, help = '', labelNames: string[] = []) {
    this.name = name;
    this.help = help;
    this.labelNames = labelNames;
  }

  inc(labels?: MetricLabels, value = 1): void {
    if (value < 0) throw new Error('Counter value must be >= 0');
    const key = labelsKey(labels);
    this.values.set(key, (this.values.get(key) ?? 0) + value);
    if (labels && !this.labelSets.has(key)) {
      this.labelSets.set(key, { ...labels });
    }
  }

  get(labels?: MetricLabels): number {
    return this.values.get(labelsKey(labels)) ?? 0;
  }

  reset(labels?: MetricLabels): void {
    if (labels !== undefined) {
      this.values.set(labelsKey(labels), 0);
    } else {
      this.values.clear();
      this.labelSets.clear();
    }
  }

  labels(): MetricLabels[] {
    return Array.from(this.labelSets.values());
  }

  toPrometheus(): string {
    let out = `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} counter\n`;
    if (this.values.size === 0) {
      out += `${this.name} 0\n`;
    } else {
      for (const [key, val] of this.values) {
        const lblObj = key === '__default__' ? {} : (this.labelSets.get(key) ?? {});
        const lblStr = formatPrometheusLabels(lblObj);
        out += `${this.name}${lblStr} ${val}\n`;
      }
    }
    return out;
  }
}

// ── Gauge ──────────────────────────────────────────────────────────────────

export class Gauge {
  readonly name: string;
  readonly help: string;
  private readonly labelNames: string[];
  private values: Map<string, number> = new Map();
  private labelSets: Map<string, MetricLabels> = new Map();

  constructor(name: string, help = '', labelNames: string[] = []) {
    this.name = name;
    this.help = help;
    this.labelNames = labelNames;
  }

  private setKey(key: string, value: number, labels?: MetricLabels): void {
    this.values.set(key, value);
    if (labels && !this.labelSets.has(key)) {
      this.labelSets.set(key, { ...labels });
    }
  }

  set(value: number, labels?: MetricLabels): void {
    const key = labelsKey(labels);
    this.setKey(key, value, labels);
  }

  inc(labels?: MetricLabels, value = 1): void {
    const key = labelsKey(labels);
    this.setKey(key, (this.values.get(key) ?? 0) + value, labels);
  }

  dec(labels?: MetricLabels, value = 1): void {
    const key = labelsKey(labels);
    this.setKey(key, (this.values.get(key) ?? 0) - value, labels);
  }

  get(labels?: MetricLabels): number {
    return this.values.get(labelsKey(labels)) ?? 0;
  }

  reset(labels?: MetricLabels): void {
    if (labels !== undefined) {
      this.values.set(labelsKey(labels), 0);
    } else {
      this.values.clear();
      this.labelSets.clear();
    }
  }

  toPrometheus(): string {
    let out = `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} gauge\n`;
    if (this.values.size === 0) {
      out += `${this.name} 0\n`;
    } else {
      for (const [key, val] of this.values) {
        const lblObj = key === '__default__' ? {} : (this.labelSets.get(key) ?? {});
        const lblStr = formatPrometheusLabels(lblObj);
        out += `${this.name}${lblStr} ${val}\n`;
      }
    }
    return out;
  }
}

// ── Histogram ─────────────────────────────────────────────────────────────

const DEFAULT_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

interface HistogramData {
  buckets: Record<string, number>;
  sum: number;
  count: number;
  observations: number[];
}

export class Histogram {
  readonly name: string;
  readonly help: string;
  private readonly buckets: number[];
  private readonly labelNames: string[];
  private data: Map<string, HistogramData> = new Map();

  constructor(
    name: string,
    buckets: number[] = DEFAULT_BUCKETS,
    help = '',
    labelNames: string[] = []
  ) {
    this.name = name;
    this.buckets = [...buckets].sort((a, b) => a - b);
    this.help = help;
    this.labelNames = labelNames;
  }

  private initData(key: string): HistogramData {
    if (!this.data.has(key)) {
      const b: Record<string, number> = {};
      for (const bucket of this.buckets) {
        b[String(bucket)] = 0;
      }
      b['+Inf'] = 0;
      this.data.set(key, { buckets: b, sum: 0, count: 0, observations: [] });
    }
    return this.data.get(key)!;
  }

  observe(value: number, labels?: MetricLabels): void {
    const key = labelsKey(labels);
    const d = this.initData(key);
    d.sum += value;
    d.count++;
    d.observations.push(value);
    for (const bucket of this.buckets) {
      if (value <= bucket) {
        d.buckets[String(bucket)]++;
      }
    }
    d.buckets['+Inf']++;
  }

  get(labels?: MetricLabels): { buckets: Record<string, number>; sum: number; count: number } {
    const key = labelsKey(labels);
    const d = this.data.get(key);
    if (!d) {
      const b: Record<string, number> = {};
      for (const bucket of this.buckets) b[String(bucket)] = 0;
      b['+Inf'] = 0;
      return { buckets: b, sum: 0, count: 0 };
    }
    return { buckets: { ...d.buckets }, sum: d.sum, count: d.count };
  }

  reset(labels?: MetricLabels): void {
    if (labels !== undefined) {
      this.data.delete(labelsKey(labels));
    } else {
      this.data.clear();
    }
  }

  percentile(p: number, labels?: MetricLabels): number {
    const key = labelsKey(labels);
    const d = this.data.get(key);
    if (!d || d.observations.length === 0) return 0;
    const sorted = [...d.observations].sort((a, b) => a - b);
    if (p <= 0) return sorted[0];
    if (p >= 1) return sorted[sorted.length - 1];
    const idx = p * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }

  mean(labels?: MetricLabels): number {
    const key = labelsKey(labels);
    const d = this.data.get(key);
    if (!d || d.count === 0) return 0;
    return d.sum / d.count;
  }

  toPrometheus(): string {
    let out = `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} histogram\n`;
    if (this.data.size === 0) {
      for (const bucket of this.buckets) {
        out += `${this.name}_bucket{le="${bucket}"} 0\n`;
      }
      out += `${this.name}_bucket{le="+Inf"} 0\n`;
      out += `${this.name}_sum 0\n${this.name}_count 0\n`;
    } else {
      for (const [, d] of this.data) {
        for (const bucket of this.buckets) {
          out += `${this.name}_bucket{le="${bucket}"} ${d.buckets[String(bucket)]}\n`;
        }
        out += `${this.name}_bucket{le="+Inf"} ${d.buckets['+Inf']}\n`;
        out += `${this.name}_sum ${d.sum}\n${this.name}_count ${d.count}\n`;
      }
    }
    return out;
  }
}

// ── Summary ───────────────────────────────────────────────────────────────

const DEFAULT_QUANTILES = [0.5, 0.9, 0.95, 0.99];

export class Summary {
  readonly name: string;
  readonly help: string;
  private readonly quantiles: number[];
  private observations: number[] = [];
  private _sum = 0;
  private _count = 0;

  constructor(name: string, quantiles: number[] = DEFAULT_QUANTILES, help = '') {
    this.name = name;
    this.quantiles = [...quantiles].sort((a, b) => a - b);
    this.help = help;
  }

  observe(value: number): void {
    this.observations.push(value);
    this._sum += value;
    this._count++;
  }

  get(): { quantiles: Record<string, number>; sum: number; count: number } {
    const sorted = [...this.observations].sort((a, b) => a - b);
    const q: Record<string, number> = {};
    for (const p of this.quantiles) {
      if (sorted.length === 0) {
        q[String(p)] = 0;
      } else if (p <= 0) {
        q[String(p)] = sorted[0];
      } else if (p >= 1) {
        q[String(p)] = sorted[sorted.length - 1];
      } else {
        const idx = p * (sorted.length - 1);
        const lo = Math.floor(idx);
        const hi = Math.ceil(idx);
        if (lo === hi) {
          q[String(p)] = sorted[lo];
        } else {
          q[String(p)] = sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
        }
      }
    }
    return { quantiles: q, sum: this._sum, count: this._count };
  }

  reset(): void {
    this.observations = [];
    this._sum = 0;
    this._count = 0;
  }

  toPrometheus(): string {
    const result = this.get();
    let out = `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} summary\n`;
    for (const p of this.quantiles) {
      out += `${this.name}{quantile="${p}"} ${result.quantiles[String(p)]}\n`;
    }
    out += `${this.name}_sum ${result.sum}\n${this.name}_count ${result.count}\n`;
    return out;
  }
}

// ── Timer ─────────────────────────────────────────────────────────────────

export class Timer {
  readonly name: string;
  readonly help: string;
  private durations: number[] = [];

  constructor(name: string, help = '') {
    this.name = name;
    this.help = help;
  }

  start(): () => number {
    const startTime = Date.now();
    return () => {
      const elapsed = Date.now() - startTime;
      this.durations.push(elapsed);
      return elapsed;
    };
  }

  record(durationMs: number): void {
    this.durations.push(durationMs);
  }

  stats(): { min: number; max: number; mean: number; count: number; p95: number; p99: number } {
    if (this.durations.length === 0) {
      return { min: 0, max: 0, mean: 0, count: 0, p95: 0, p99: 0 };
    }
    const sorted = [...this.durations].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const percentile = (p: number) => {
      const idx = p * (sorted.length - 1);
      const lo = Math.floor(idx);
      const hi = Math.ceil(idx);
      if (lo === hi) return sorted[lo];
      return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
    };
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: sum / sorted.length,
      count: sorted.length,
      p95: percentile(0.95),
      p99: percentile(0.99),
    };
  }

  reset(): void {
    this.durations = [];
  }
}

// ── MetricRegistry ─────────────────────────────────────────────────────────

type AnyMetric = Counter | Gauge | Histogram | Summary | Timer;

export class MetricRegistry {
  private metrics: Map<string, AnyMetric> = new Map();

  registerCounter(name: string, help = '', labelNames: string[] = []): Counter {
    const c = new Counter(name, help, labelNames);
    this.metrics.set(name, c);
    return c;
  }

  registerGauge(name: string, help = '', labelNames: string[] = []): Gauge {
    const g = new Gauge(name, help, labelNames);
    this.metrics.set(name, g);
    return g;
  }

  registerHistogram(
    name: string,
    buckets: number[] = DEFAULT_BUCKETS,
    help = ''
  ): Histogram {
    const h = new Histogram(name, buckets, help);
    this.metrics.set(name, h);
    return h;
  }

  registerSummary(name: string, quantiles: number[] = DEFAULT_QUANTILES, help = ''): Summary {
    const s = new Summary(name, quantiles, help);
    this.metrics.set(name, s);
    return s;
  }

  registerTimer(name: string, help = ''): Timer {
    const t = new Timer(name, help);
    this.metrics.set(name, t);
    return t;
  }

  get(name: string): AnyMetric | undefined {
    return this.metrics.get(name);
  }

  list(): string[] {
    return Array.from(this.metrics.keys());
  }

  toPrometheus(): string {
    return Array.from(this.metrics.values())
      .map((m) => {
        if (m instanceof Counter || m instanceof Gauge || m instanceof Histogram || m instanceof Summary) {
          return m.toPrometheus();
        }
        return '';
      })
      .filter(Boolean)
      .join('');
  }

  reset(): void {
    this.metrics.clear();
  }

  unregister(name: string): boolean {
    return this.metrics.delete(name);
  }
}

// ── RollingStats ───────────────────────────────────────────────────────────

export class RollingStats {
  private readonly windowSize: number;
  private window: number[] = [];

  constructor(windowSize: number) {
    this.windowSize = windowSize;
  }

  record(value: number): void {
    this.window.push(value);
    if (this.window.length > this.windowSize) {
      this.window.shift();
    }
  }

  get(): { min: number; max: number; mean: number; count: number; sum: number; values: number[] } {
    if (this.window.length === 0) {
      return { min: 0, max: 0, mean: 0, count: 0, sum: 0, values: [] };
    }
    const sum = this.window.reduce((acc, v) => acc + v, 0);
    return {
      min: Math.min(...this.window),
      max: Math.max(...this.window),
      mean: sum / this.window.length,
      count: this.window.length,
      sum,
      values: [...this.window],
    };
  }

  percentile(p: number): number {
    if (this.window.length === 0) return 0;
    const sorted = [...this.window].sort((a, b) => a - b);
    if (p <= 0) return sorted[0];
    if (p >= 1) return sorted[sorted.length - 1];
    const idx = p * (sorted.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }

  reset(): void {
    this.window = [];
  }
}

// ── RateTracker ────────────────────────────────────────────────────────────

interface RateEntry {
  timestamp: number;
  count: number;
}

export class RateTracker {
  private readonly windowMs: number;
  private readonly clock: () => number;
  private entries: RateEntry[] = [];
  private _total = 0;

  constructor(windowMs: number, clock: () => number = Date.now) {
    this.windowMs = windowMs;
    this.clock = clock;
  }

  private prune(): void {
    const cutoff = this.clock() - this.windowMs;
    this.entries = this.entries.filter((e) => e.timestamp >= cutoff);
  }

  record(count = 1): void {
    this.prune();
    this.entries.push({ timestamp: this.clock(), count });
    this._total += count;
  }

  rate(): number {
    this.prune();
    const windowCounts = this.entries.reduce((acc, e) => acc + e.count, 0);
    return windowCounts / (this.windowMs / 1000);
  }

  total(): number {
    return this._total;
  }

  reset(): void {
    this.entries = [];
    this._total = 0;
  }
}

// ── Default registry ───────────────────────────────────────────────────────

export const defaultRegistry = new MetricRegistry();
