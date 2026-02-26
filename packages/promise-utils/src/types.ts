// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffFactor?: number;
  jitter?: boolean;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

export interface TimeoutOptions {
  ms: number;
  message?: string;
}

export interface PoolOptions {
  concurrency: number;
}

export type SettledResult<T> =
  | { status: 'fulfilled'; value: T }
  | { status: 'rejected'; reason: unknown };

export interface DeferredPromise<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

export interface SemaphoreOptions {
  permits: number;
}

export interface RateLimiterOptions {
  maxCalls: number;
  windowMs: number;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

export interface BatchOptions {
  maxSize: number;
  maxWaitMs: number;
}
