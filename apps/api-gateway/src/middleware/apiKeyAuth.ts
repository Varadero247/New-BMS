import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { createLogger } from '@ims/monitoring';
import { getApiKeyStore } from '../routes/api-keys';

const logger = createLogger('api-gateway:api-key-auth');

/**
 * API Key Authentication Middleware
 *
 * Checks the Authorization header for "Bearer rxk_..." pattern.
 * If found: looks up by prefix, verifies bcrypt hash, checks not revoked.
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
  const store = getApiKeyStore();

  // Find key record by prefix
  let matchedRecord: ReturnType<typeof store.get> | undefined;
  let matchedId: string | undefined;

  for (const [id, record] of store.entries()) {
    if (record.keyPrefix === prefix && record.status === 'active') {
      matchedRecord = record;
      matchedId = id;
      break;
    }
  }

  if (!matchedRecord || !matchedId) {
    // Invalid or revoked key — let it fall through to JWT auth which will also reject
    next();
    return;
  }

  // Verify bcrypt hash (async but we handle it in a promise)
  bcrypt.compare(token, matchedRecord.keyHash)
    .then((isValid) => {
      if (!isValid) {
        logger.warn('API key hash mismatch', { prefix });
        next();
        return;
      }

      // Inject context into request
      (req as Request & { user?: Record<string, unknown> }).user = {
        id: matchedRecord!.createdById,
        orgId: matchedRecord!.orgId,
        role: 'ADMIN', // API keys get admin-level access within their scopes
        email: `apikey:${matchedRecord!.name}`,
        apiKey: true,
        apiKeyId: matchedId,
        scopes: matchedRecord!.scopes,
      };

      // Increment usage stats (async, non-blocking)
      matchedRecord!.usageCount += 1;
      matchedRecord!.lastUsedAt = new Date().toISOString();

      logger.info('API key authenticated', { prefix, name: matchedRecord!.name });
      next();
    })
    .catch((err) => {
      logger.error('API key verification error', { error: err.message });
      next();
    });
}
