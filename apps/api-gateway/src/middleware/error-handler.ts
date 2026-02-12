import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-gateway');

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Unhandled error', { error: err.message, code: err.code, statusCode: err.statusCode });

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = statusCode < 500
    ? (err.message || 'An unexpected error occurred')
    : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}
