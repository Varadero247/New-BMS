// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Adaptive Timeout Manager
 *
 * Dynamically adjusts timeouts based on observed p95 response times.
 * Prevents cascading failures caused by fixed timeouts that are too
 * aggressive while avoiding excessive waiting on degraded dependencies.
 *
 * Algorithm:
 *   adaptive_timeout = max(base_timeout, observed_p95 × margin_factor)
 *   bounded by [min_timeout, max_timeout]
 */

export interface AdaptiveTimeoutOptions {
  /** Baseline timeout (ms). Used until enough samples are collected. Default: 5000 */
  baseTimeoutMs?: number;
  /** Minimum allowed timeout (ms). Default: 100 */
  minTimeoutMs?: number;
  /** Maximum allowed timeout (ms). Default: 30_000 */
  maxTimeoutMs?: number;
  /** Multiplier applied to p95 to give a safety margin. Default: 1.5 */
  marginFactor?: number;
  /** Minimum samples before adaptive logic kicks in. Default: 10 */
  minSamples?: number;
  /** Window size — only last N samples are considered. Default: 200 */
  windowSize?: number;
}

const DEFAULTS: Required<AdaptiveTimeoutOptions> = {
  baseTimeoutMs: 5_000,
  minTimeoutMs: 100,
  maxTimeoutMs: 30_000,
  marginFactor: 1.5,
  minSamples: 10,
  windowSize: 200,
};

export class AdaptiveTimeout {
  private samples: number[] = [];
  private readonly cfg: Required<AdaptiveTimeoutOptions>;

  constructor(opts: AdaptiveTimeoutOptions = {}) {
    this.cfg = { ...DEFAULTS, ...opts };
  }

  /** Record an observed response time in ms. */
  record(latencyMs: number): void {
    this.samples.push(latencyMs);
    if (this.samples.length > this.cfg.windowSize) {
      this.samples.shift();
    }
  }

  /** Calculate the recommended timeout in ms for the next request. */
  getTimeout(): number {
    if (this.samples.length < this.cfg.minSamples) {
      return this.cfg.baseTimeoutMs;
    }

    const p95 = this.percentile(95);
    const adaptive = Math.round(p95 * this.cfg.marginFactor);

    return Math.min(
      Math.max(adaptive, this.cfg.minTimeoutMs),
      this.cfg.maxTimeoutMs
    );
  }

  /** Compute the p-th percentile (0-100) of recorded samples. */
  percentile(p: number): number {
    if (this.samples.length === 0) return 0;
    const sorted = [...this.samples].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
  }

  /** Number of recorded samples in the current window. */
  get sampleCount(): number {
    return this.samples.length;
  }

  /** Reset all recorded samples. */
  reset(): void {
    this.samples = [];
  }
}

/**
 * Wrap an async operation with the current adaptive timeout.
 *
 * @example
 * ```ts
 * const timer = new AdaptiveTimeout({ baseTimeoutMs: 3000 });
 * const result = await withAdaptiveTimeout(timer, () => fetchData());
 * ```
 */
export async function withAdaptiveTimeout<T>(
  timer: AdaptiveTimeout,
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  const timeoutMs = timer.getTimeout();
  const start = Date.now();

  return new Promise<T>((resolve, reject) => {
    const handle = setTimeout(() => {
      reject(new Error(errorMessage ?? `Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    fn()
      .then((result) => {
        clearTimeout(handle);
        timer.record(Date.now() - start);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(handle);
        timer.record(Date.now() - start);
        reject(err);
      });
  });
}
