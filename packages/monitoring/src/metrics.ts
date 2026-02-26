// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import client from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

// Create a Registry
export const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
  registers: [register],
});

export const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'],
  registers: [register],
});

export const activeRequests = new client.Gauge({
  name: 'http_requests_active',
  help: 'Number of active HTTP requests',
  labelNames: ['service'],
  registers: [register],
});

export const authFailuresTotal = new client.Counter({
  name: 'auth_failures_total',
  help: 'Total number of authentication failures',
  labelNames: ['reason', 'service'],
  registers: [register],
});

export const rateLimitExceededTotal = new client.Counter({
  name: 'rate_limit_exceeded_total',
  help: 'Total number of rate limit exceeded events',
  labelNames: ['limiter', 'service'],
  registers: [register],
});

export const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'model'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

// Middleware to track HTTP metrics
export const metricsMiddleware = (serviceName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    activeRequests.inc({ service: serviceName });

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const route = req.route?.path || req.path || 'unknown';

      httpRequestDuration.observe(
        {
          method: req.method,
          route,
          status_code: res.statusCode.toString(),
          service: serviceName,
        },
        duration
      );

      httpRequestTotal.inc({
        method: req.method,
        route,
        status_code: res.statusCode.toString(),
        service: serviceName,
      });

      activeRequests.dec({ service: serviceName });
    });

    next();
  };
};

// Metrics endpoint handler
export const metricsHandler = async (_req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

/**
 * Track the duration of an arbitrary database query and record it in
 * the databaseQueryDuration histogram.
 *
 * Usage:
 * ```typescript
 * const users = await trackDbQuery('findMany', 'User', () =>
 *   prisma.user.findMany({ where: { isActive: true } })
 * );
 * ```
 */
export async function trackDbQuery<T>(
  operation: string,
  model: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    const duration = (Date.now() - start) / 1000;
    databaseQueryDuration.observe({ operation, model }, duration);
  }
}

/** Alias for databaseQueryDuration histogram — convenient named export */
export const dbQueryHistogram = databaseQueryDuration;

/** Shared param shape for Prisma $use() middleware (Prisma v5, deprecated API). */
interface PrismaMiddlewareParams {
  model?: string;
  action: string;
  args: unknown;
  dataPath: string[];
  runInTransaction: boolean;
}

/**
 * Prisma middleware to record query duration metrics.
 * Usage: prisma.$use(prismaMetricsMiddleware)
 *
 * NOTE: Prisma's $use() API is deprecated in v5 and will be removed in v6.
 * A $extends()-based replacement should be adopted when upgrading to Prisma 6.
 */
export async function prismaMetricsMiddleware(
  params: PrismaMiddlewareParams,
  next: (params: PrismaMiddlewareParams) => Promise<unknown>
): Promise<unknown> {
  const start = Date.now();
  const result = await next(params);
  const duration = (Date.now() - start) / 1000;
  databaseQueryDuration.observe(
    { operation: params.action, model: params.model || 'unknown' },
    duration
  );
  return result;
}
