// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Real-Time Dashboard Metrics
 *
 * Aggregates business KPIs and system health indicators for operational
 * dashboards. Designed as a pull-based metrics snapshot — call the methods
 * on demand from a `/api/dashboard/metrics` endpoint.
 *
 * All methods are side-effect free; callers provide the data sources
 * (DB clients, Prometheus registry, etc.) via the constructor options.
 */

export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs?: number;
  details?: string;
}

export interface SystemHealthSnapshot {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  components: ComponentHealth[];
  uptimeSeconds: number;
  timestamp: Date;
}

export interface BusinessKpiSnapshot {
  activeUsers: number;
  requestsLastMinute: number;
  errorRatePercent: number;
  avgResponseTimeMs: number;
  timestamp: Date;
}

export interface DashboardMetricsOptions {
  /** Called to perform a DB liveness check. Return latency in ms, or throw on failure. */
  checkDatabase?: () => Promise<number>;
  /** Called to perform a cache/Redis liveness check. Return latency in ms, or throw. */
  checkCache?: () => Promise<number>;
  /** Service start time (used for uptime calculation). Default: process start time */
  startTime?: Date;
}

/** Rolling window counter — thread-safe in a single-process Node environment. */
export class RollingCounter {
  private buckets: number[];
  private readonly windowMs: number;
  private readonly bucketCount: number;
  private lastReset: number;

  constructor(windowMs = 60_000, bucketCount = 60) {
    this.windowMs = windowMs;
    this.bucketCount = bucketCount;
    this.buckets = new Array<number>(bucketCount).fill(0);
    this.lastReset = Date.now();
  }

  /** Increment by delta (default: 1). */
  increment(delta = 1): void {
    this.rotate();
    this.buckets[0] += delta;
  }

  /** Get the total count across all active buckets. */
  get total(): number {
    this.rotate();
    return this.buckets.reduce((sum, n) => sum + n, 0);
  }

  /** Get count per second (averaged across the window). */
  get rate(): number {
    return this.total / (this.windowMs / 1000);
  }

  private rotate(): void {
    const now = Date.now();
    const elapsed = now - this.lastReset;
    const bucketDuration = this.windowMs / this.bucketCount;
    const bucketsToRotate = Math.floor(elapsed / bucketDuration);

    if (bucketsToRotate <= 0) return;

    const rotations = Math.min(bucketsToRotate, this.bucketCount);
    for (let i = 0; i < rotations; i++) {
      this.buckets.pop();
      this.buckets.unshift(0);
    }

    this.lastReset = now - (elapsed % bucketDuration);
  }
}

/** Exponential moving average for latency tracking. */
export class LatencyTracker {
  private ema: number | null = null;
  private readonly alpha: number;
  private _count = 0;
  private _errorCount = 0;

  /** @param smoothing - EMA smoothing factor 0-1. Default 0.1 (slower but smoother). */
  constructor(smoothing = 0.1) {
    this.alpha = smoothing;
  }

  record(latencyMs: number, isError = false): void {
    this._count++;
    if (isError) this._errorCount++;
    this.ema =
      this.ema === null ? latencyMs : this.alpha * latencyMs + (1 - this.alpha) * this.ema;
  }

  /** Exponential moving average latency in ms, or 0 if no data yet. */
  get avg(): number {
    return this.ema ?? 0;
  }

  get count(): number {
    return this._count;
  }

  get errorCount(): number {
    return this._errorCount;
  }

  get errorRate(): number {
    if (this._count === 0) return 0;
    return (this._errorCount / this._count) * 100;
  }
}

/** Collects and exposes dashboard metrics for the IMS platform. */
export class DashboardMetrics {
  private readonly startTime: Date;
  private readonly opts: DashboardMetricsOptions;

  /** Publicly accessible rolling counters for request tracking. */
  readonly requests = new RollingCounter(60_000, 60);
  readonly latency = new LatencyTracker(0.05);

  constructor(opts: DashboardMetricsOptions = {}) {
    this.opts = opts;
    this.startTime = opts.startTime ?? new Date();
  }

  /** Record a completed HTTP request. Call from your metrics middleware. */
  recordRequest(latencyMs: number, isError = false): void {
    this.requests.increment();
    this.latency.record(latencyMs, isError);
  }

  /** Get a system health snapshot. */
  async getSystemHealth(): Promise<SystemHealthSnapshot> {
    const components: ComponentHealth[] = [];

    if (this.opts.checkDatabase) {
      try {
        const latencyMs = await this.opts.checkDatabase();
        components.push({
          name: 'database',
          status: latencyMs < 100 ? 'healthy' : latencyMs < 500 ? 'degraded' : 'unhealthy',
          latencyMs,
        });
      } catch (err) {
        components.push({
          name: 'database',
          status: 'unhealthy',
          details: err instanceof Error ? err.message : 'check failed',
        });
      }
    }

    if (this.opts.checkCache) {
      try {
        const latencyMs = await this.opts.checkCache();
        components.push({
          name: 'cache',
          status: latencyMs < 50 ? 'healthy' : latencyMs < 200 ? 'degraded' : 'unhealthy',
          latencyMs,
        });
      } catch (err) {
        components.push({
          name: 'cache',
          status: 'unhealthy',
          details: err instanceof Error ? err.message : 'check failed',
        });
      }
    }

    // Derive overall health
    const statuses = components.map((c) => c.status);
    const overall: SystemHealthSnapshot['overall'] = statuses.includes('unhealthy')
      ? 'unhealthy'
      : statuses.includes('degraded')
        ? 'degraded'
        : 'healthy';

    return {
      overall,
      components,
      uptimeSeconds: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      timestamp: new Date(),
    };
  }

  /** Get a snapshot of business KPIs. */
  getBusinessKpis(): BusinessKpiSnapshot {
    return {
      activeUsers: 0, // Caller should override this from session store / presence service
      requestsLastMinute: this.requests.total,
      errorRatePercent: Math.round(this.latency.errorRate * 100) / 100,
      avgResponseTimeMs: Math.round(this.latency.avg),
      timestamp: new Date(),
    };
  }
}
