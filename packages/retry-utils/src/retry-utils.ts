// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: 'none' | 'linear' | 'exponential';
  shouldRetry?: (err: unknown, attempt: number) => boolean;
}

export function exponentialBackoff(attempt: number, baseMs = 100, maxMs = 30000): number {
  return Math.min(maxMs, baseMs * Math.pow(2, attempt));
}
export function linearBackoff(attempt: number, stepMs = 100, maxMs = 10000): number {
  return Math.min(maxMs, stepMs * (attempt + 1));
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 0, backoff = 'none', shouldRetry } = opts;
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try { return await fn(); }
    catch (err) {
      lastErr = err;
      if (attempt < maxAttempts - 1) {
        if (shouldRetry && !shouldRetry(err, attempt)) throw err;
        const delay = backoff === 'exponential' ? exponentialBackoff(attempt, delayMs)
          : backoff === 'linear' ? linearBackoff(attempt, delayMs)
          : delayMs;
        if (delay > 0) await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw lastErr;
}

export function retry<T>(fn: () => T, maxAttempts = 3): T {
  let lastErr: unknown;
  for (let i = 0; i < maxAttempts; i++) {
    try { return fn(); }
    catch (e) { lastErr = e; }
  }
  throw lastErr;
}

export function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): () => Promise<T> {
  return () => retryAsync(fn, { maxAttempts });
}

export class CircuitBreaker {
  private failures = 0; private lastFailureTime = 0; private _state: 'closed'|'open'|'half-open' = 'closed';
  constructor(private threshold = 5, private resetTimeMs = 60000) {}
  get state() { return this._state; }
  get failureCount() { return this.failures; }
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this._state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeMs) this._state = 'half-open';
      else throw new Error('Circuit is open');
    }
    try {
      const result = await fn();
      if (this._state === 'half-open') { this.failures = 0; this._state = 'closed'; }
      return result;
    } catch (err) {
      this.failures++; this.lastFailureTime = Date.now();
      if (this.failures >= this.threshold) this._state = 'open';
      throw err;
    }
  }
  reset(): void { this.failures = 0; this._state = 'closed'; }
}

export async function withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs));
  return Promise.race([fn(), timeout]);
}
