// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('ai-audit-middleware');

// HTTP methods that represent mutating actions
const AUDITED_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Map HTTP methods to AiAuditAction enum values
function methodToAction(
  method: string
): 'DECISION' | 'OVERRIDE' | 'REVIEW' | 'APPROVAL' | 'REJECTION' | 'ESCALATION' | 'CONFIG_CHANGE' {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'DECISION';
    case 'PUT':
    case 'PATCH':
      return 'CONFIG_CHANGE';
    case 'DELETE':
      return 'OVERRIDE';
    default:
      return 'DECISION';
  }
}

// Truncate a string to a max length for storage
function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

// Build a safe input summary from the request body
function buildInputSummary(body: unknown): string {
  if (!body || typeof body !== 'object') return '(no body)';
  try {
    const raw = JSON.stringify(body);
    return truncate(raw, 4000);
  } catch {
    return '(unserializable body)';
  }
}

// Build a safe output summary from the response body
function buildOutputSummary(body: unknown): string {
  if (!body) return '(no body)';
  try {
    const raw = JSON.stringify(body);
    return truncate(raw, 4000);
  } catch {
    return '(unserializable body)';
  }
}

/**
 * Creates Express middleware that automatically logs mutating requests
 * (POST, PUT, PATCH, DELETE) to the AiAuditLog table.
 *
 * Uses response patching (overriding res.json) to capture the output summary
 * after the route handler has finished.
 *
 * @param systemId - Optional AI system ID to associate all logged entries with
 * @returns Express middleware function
 */
export function createAiAuditMiddleware(systemId?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only audit mutating requests
    if (!AUDITED_METHODS.has(req.method.toUpperCase())) {
      return next();
    }

    // Skip audit-log routes themselves to prevent infinite recursion
    if (req.originalUrl.includes('/api/audit-log')) {
      return next();
    }

    const authReq = req as AuthRequest;
    const startTime = Date.now();
    const inputSummary = buildInputSummary(req.body);
    const action = methodToAction(req.method);
    const description = `${req.method.toUpperCase()} ${req.originalUrl}`;

    // Patch res.json to capture the response body
    const originalJson = res.json.bind(res);
    res.json = function patchedJson(body: unknown): Response {
      // Restore original json to prevent double-patching
      res.json = originalJson;

      const durationMs = Date.now() - startTime;
      const outputSummary = buildOutputSummary(body);

      // Fire-and-forget: write audit log entry asynchronously
      prisma.aiAuditLog
        .create({
          data: {
            systemId: systemId ?? null,
            action,
            description,
            inputSummary,
            outputSummary,
            userId: authReq.user?.id || 'system',
            userName: authReq.user?.email || 'system',
            ipAddress: req.ip || null,
            organisationId: (authReq.user as { organisationId?: string })?.organisationId || 'default',
            metadata: {
              method: req.method,
              path: req.originalUrl,
              statusCode: res.statusCode,
              durationMs,
              userAgent: req.headers['user-agent'] || null,
            },
          },
        })
        .then((entry) => {
          logger.debug('AI audit log entry written', {
            entryId: entry.id,
            action,
            path: req.originalUrl,
          });
        })
        .catch((error: unknown) => {
          // Audit logging should never break the request flow
          logger.error('Failed to write AI audit log', {
            error: error instanceof Error ? error.message : 'Unknown error',
            path: req.originalUrl,
            method: req.method,
          });
        });

      // Call the original res.json with the body
      return originalJson(body);
    };

    next();
  };
}

export default createAiAuditMiddleware;
