// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { createLogger } from '@ims/monitoring';
import { prisma as prismaBase } from '@ims/database';
import type { PrismaClient } from '@ims/database/core';

const prisma = prismaBase as unknown as PrismaClient;
const logger = createLogger('api-gateway:api-key-auth');

/**
 * API Key Authentication Middleware
 *
 * Checks the Authorization header for "Bearer rxk_..." pattern.
 * If found: looks up by prefix in DB, verifies bcrypt hash, checks not revoked.
 * If NOT rxk_ pattern: skips silently (lets normal JWT auth handle it).
 *
 * On success, injects orgId and scopes into req context and increments usage stats.
 */
export function apiKeyAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // No auth header or not a Bearer token — skip
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.slice(7);

  // Only handle rxk_ prefixed tokens
  if (!token.startsWith('rxk_')) {
    next();
    return;
  }

  const prefix = token.substring(0, 12);

  // Look up by prefix in database
  prisma.apiKey
    .findFirst({ where: { prefix, isActive: true } })
    .then((record) => {
      if (!record) {
        // Invalid or revoked key — let JWT auth reject
        next();
        return;
      }

      // Verify bcrypt hash
      return bcrypt.compare(token, record.keyHash).then((isValid) => {
        if (!isValid) {
          logger.warn('API key hash mismatch', { prefix });
          next();
          return;
        }

        // Inject context into request
        (req as Request & { user?: Record<string, unknown> }).user = {
          id: record.createdById,
          orgId: record.orgId,
          role: 'ADMIN', // API keys get admin-level access within their scopes
          email: `apikey:${record.name}`,
          apiKey: true,
          apiKeyId: record.id,
          scopes: record.permissions,
        };

        // Update usage stats (non-blocking fire-and-forget)
        void prisma.apiKey
          .update({
            where: { id: record.id },
            data: { usageCount: { increment: 1 }, lastUsedAt: new Date() },
          })
          .catch((err: Error) =>
            logger.warn('Failed to update API key usage stats', { error: err.message })
          );

        logger.info('API key authenticated', { prefix, name: record.name });
        next();
      });
    })
    .catch((err: Error) => {
      logger.error('API key verification error', { error: err.message });
      next();
    });
}
