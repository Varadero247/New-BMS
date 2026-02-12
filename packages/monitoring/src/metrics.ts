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
 * Prisma middleware to record query duration metrics.
 * Usage: prisma.$use(prismaMetricsMiddleware);
 */
export async function prismaMetricsMiddleware(
  params: { model?: string; action: string; args: any; dataPath: string[]; runInTransaction: boolean },
  next: (params: any) => Promise<any>
): Promise<any> {
  const start = Date.now();
  const result = await next(params);
  const duration = (Date.now() - start) / 1000;
  databaseQueryDuration.observe(
    { operation: params.action, model: params.model || 'unknown' },
    duration
  );
  return result;
}
