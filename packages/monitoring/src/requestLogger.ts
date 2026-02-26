// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Request, Response, NextFunction } from 'express';
import { createLogger } from './logger';

const logger = createLogger('http');

/**
 * Structured HTTP access log middleware.
 * Logs method, path, status, latency, userId, and correlationId for every request.
 */
export function requestLogger(): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const latencyMs = Date.now() - start;
      const reqAny = req as unknown as Record<string, unknown>;
      const userId = reqAny.userId || String(reqAny.user ?? '-');
      const correlationId = reqAny.correlationId || req.headers['x-correlation-id'] || '-';

      logger.info('request', {
        method: req.method,
        path: req.originalUrl || req.url,
        status: res.statusCode,
        latencyMs,
        userId,
        correlationId,
        contentLength: res.getHeader('content-length') || 0,
        userAgent: req.headers['user-agent'] || '-',
        ip: req.ip || req.socket.remoteAddress || '-',
      });
    });

    next();
  };
}
