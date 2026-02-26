// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

export const correlationIdMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get correlation ID from header or generate new one
    const correlationId = req.get(CORRELATION_ID_HEADER) || uuidv4();

    // Store on request
    req.correlationId = correlationId;

    // Add to response headers
    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    next();
  };
};

export const getCorrelationId = (req: Request): string => {
  return req.correlationId || 'unknown';
};
