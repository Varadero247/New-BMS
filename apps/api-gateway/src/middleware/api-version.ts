// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@ims/monitoring';

interface VersionedRequest extends Request {
  apiVersion?: string;
}

const logger = createLogger('api-version');

/**
 * API versioning constants
 */
export const API_VERSION = {
  CURRENT: 'v1',
  SUPPORTED: ['v1'],
  DEPRECATED: [] as string[],
};

/**
 * Middleware to add API version header to responses
 */
export function addVersionHeader(version: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('X-API-Version', version);
    next();
  };
}

/**
 * Middleware to mark routes as deprecated
 * Adds deprecation headers and logs usage
 */
export function deprecatedRoute(alternativeEndpoint: string, sunsetDate?: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Add deprecation headers
    res.setHeader('Deprecation', 'true');
    res.setHeader(
      'X-API-Deprecation-Notice',
      `This endpoint is deprecated. Please use ${alternativeEndpoint}`
    );

    if (sunsetDate) {
      res.setHeader('Sunset', sunsetDate);
    }

    // Log deprecated endpoint usage
    logger.warn('Deprecated endpoint accessed', {
      path: req.path,
      method: req.method,
      alternative: alternativeEndpoint,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    next();
  };
}

/**
 * Middleware to extract API version from URL or header
 */
export function extractApiVersion(req: Request, res: Response, next: NextFunction): void {
  const vReq = req as VersionedRequest;
  // Check URL path first (e.g., /api/v1/...)
  const pathMatch = req.path.match(/^\/api\/(v\d+)\//);
  if (pathMatch) {
    vReq.apiVersion = pathMatch[1];
  } else {
    // Fall back to header
    const headerVersion = req.headers['x-api-version'] as string;
    vReq.apiVersion = headerVersion || API_VERSION.CURRENT;
  }

  next();
}

/**
 * Middleware to reject unsupported API versions
 */
export function validateApiVersion(req: Request, res: Response, next: NextFunction): void {
  const version = (req as VersionedRequest).apiVersion;

  if (!API_VERSION.SUPPORTED.includes(version as string)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'UNSUPPORTED_API_VERSION',
        message: `API version '${version}' is not supported. Supported versions: ${API_VERSION.SUPPORTED.join(', ')}`,
      },
    });
    return;
  }

  if (API_VERSION.DEPRECATED.includes(version as string)) {
    res.setHeader('Deprecation', 'true');
    res.setHeader(
      'X-API-Deprecation-Notice',
      `API version '${version}' is deprecated. Please upgrade to a newer version.`
    );
  }

  next();
}

export default {
  API_VERSION,
  addVersionHeader,
  deprecatedRoute,
  extractApiVersion,
  validateApiVersion,
};
