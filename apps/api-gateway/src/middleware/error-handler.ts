// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@ims/monitoring';
import { Sentry } from '@ims/sentry';
import type { AuthRequest } from '@ims/auth';

const logger = createLogger('api-gateway');

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    // Attach user context to error report if the request was authenticated
    const user = (req as AuthRequest).user;
    if (user) {
      Sentry.getCurrentScope().setUser({ id: user.id, email: user.email, username: user.role });
    }
    Sentry.captureException(err);
  }

  logger.error('Unhandled error', {
    error: err.message,
    code: err.code,
    statusCode,
  });
  const code = err.code || 'INTERNAL_ERROR';
  const message =
    statusCode < 500 ? err.message || 'An unexpected error occurred' : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}
