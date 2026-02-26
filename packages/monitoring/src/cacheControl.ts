// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that sets Cache-Control headers for read-only reference endpoints.
 * @param maxAge - Cache duration in seconds (default: 300 = 5 minutes)
 */
export function cacheControl(
  maxAge = 300
): (req: Request, res: Response, next: NextFunction) => void {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      'Cache-Control',
      `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`
    );
    next();
  };
}
