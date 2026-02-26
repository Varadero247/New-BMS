// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { Request, Response, NextFunction } from 'express';
import { createLogger } from '@ims/monitoring';
import { logActivity, type ActivityAction } from './index';

const logger = createLogger('activity:middleware');

interface ActivityUser {
  id: string;
  role: string;
  name?: string;
  email?: string;
  avatar?: string;
  organisationId?: string;
  orgId?: string;
}

interface ActivityRequest extends Request {
  user?: ActivityUser;
}

/**
 * Express middleware that automatically logs activity for create/update/delete operations.
 *
 * Wraps res.json to detect successful operations and log them.
 * Expects req.user to have { id, name, organisationId } (AuthRequest pattern).
 *
 * @param recordType - The type of record being acted on (e.g. 'risk', 'incident', 'aspect')
 */
export function activityLogger(recordType: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown): Response {
      try {
        const user = (req as ActivityRequest).user;
        if (!user?.id) {
          return originalJson(body);
        }

        const statusCode = res.statusCode;
        const method = req.method.toUpperCase();
        let action: ActivityAction | null = null;

        if (method === 'POST' && statusCode === 201) {
          action = 'created';
        } else if ((method === 'PUT' || method === 'PATCH') && statusCode === 200) {
          action = 'updated';
        } else if (method === 'DELETE' && (statusCode === 200 || statusCode === 204)) {
          action = 'deleted';
        }

        if (action) {
          // Extract recordId from the response body or URL params
          const recordId = req.params.id || extractIdFromBody(body);

          if (recordId) {
            // Fire and forget — logActivity never throws
            logActivity({
              orgId: user.organisationId || user.orgId || 'unknown',
              recordType,
              recordId,
              userId: user.id,
              userName: user.name || user.email || 'Unknown User',
              userAvatar: user.avatar,
              action,
              metadata: {
                method,
                path: req.originalUrl || req.path,
              },
            });
          }
        }
      } catch (error: unknown) {
        logger.error('Activity middleware error', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      return originalJson(body);
    };

    next();
  };
}

/**
 * Try to extract an ID from a response body object.
 */
function extractIdFromBody(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const bodyObj = body as Record<string, unknown>;
  const data = bodyObj.data;
  if (data && typeof data === 'object' && (data as Record<string, unknown>).id) {
    return String((data as Record<string, unknown>).id);
  }
  if (bodyObj.id) {
    return String(bodyObj.id);
  }
  return undefined;
}
