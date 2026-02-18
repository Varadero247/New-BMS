import { Router, Response } from 'express';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const logger = createLogger('api-gateway:api-keys');
const router = Router();

// ─── Types ──────────────────────────────────────────────────────────────────

interface ApiKeyRecord {
  id: string;
  name: string;
  keyPrefix: string; // first 12 chars of the full key
  keyHash: string;   // bcrypt hash of the full key
  scopes: string[];
  orgId: string;
  createdById: string;
  createdAt: string;
  lastUsedAt: string | null;
  usageCount: number;
  status: 'active' | 'revoked';
  revokedAt: string | null;
}

// ─── In-Memory Store ────────────────────────────────────────────────────────

const apiKeyStore = new Map<string, ApiKeyRecord>();

// Export for use by apiKeyAuth middleware
export function getApiKeyStore(): Map<string, ApiKeyRecord> {
  return apiKeyStore;
}

// ─── Validation Schemas ─────────────────────────────────────────────────────

const createKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  scopes: z.array(z.string().trim().min(1)).min(1, 'At least one scope is required'),
});

// ─── All routes require authentication + admin role ─────────────────────────

router.use(authenticate);

// ─── Routes ─────────────────────────────────────────────────────────────────

// POST /api/admin/api-keys — Create a new API key
router.post('/', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createKeySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const { name, scopes } = parsed.data;

    // Generate key: "rxk_" + 32 random bytes as base64url
    const randomBytes = crypto.randomBytes(32);
    const fullKey = 'rxk_' + randomBytes.toString('base64url');
    const keyPrefix = fullKey.substring(0, 12);

    // Hash with bcrypt cost 10
    const keyHash = await bcrypt.hash(fullKey, 10);

    const orgId = (req.user as any)?.orgId || 'default';

    const record: ApiKeyRecord = {
      id: uuidv4(),
      name,
      keyPrefix,
      keyHash,
      scopes,
      orgId,
      createdById: req.user!.id,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      usageCount: 0,
      status: 'active',
      revokedAt: null,
    };

    apiKeyStore.set(record.id, record);

    logger.info('API key created', { id: record.id, name, prefix: keyPrefix, createdBy: req.user!.id });

    // Return the full key ONCE — it cannot be retrieved again
    res.status(201).json({
      success: true,
      data: {
        id: record.id,
        name: record.name,
        key: fullKey, // only returned on creation
        keyPrefix: record.keyPrefix,
        scopes: record.scopes,
        createdAt: record.createdAt,
        status: record.status,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to create API key', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create API key' },
    });
  }
});

// GET /api/admin/api-keys — List all API keys (never returns the full key)
router.get('/', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const orgId = (req.user as any)?.orgId || 'default';
    const keys = Array.from(apiKeyStore.values())
      .filter((k) => k.orgId === orgId)
      .map((k) => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        scopes: k.scopes,
        createdAt: k.createdAt,
        lastUsedAt: k.lastUsedAt,
        usageCount: k.usageCount,
        status: k.status,
        revokedAt: k.revokedAt,
      }));

    res.json({
      success: true,
      data: keys,
      meta: { total: keys.length },
    });
  } catch (error: unknown) {
    logger.error('Failed to list API keys', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list API keys' },
    });
  }
});

// DELETE /api/admin/api-keys/:id — Revoke an API key
router.delete('/:id', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const record = apiKeyStore.get(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'API key not found' },
      });
    }

    if (record.status === 'revoked') {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_REVOKED', message: 'API key is already revoked' },
      });
    }

    record.status = 'revoked';
    record.revokedAt = new Date().toISOString();

    logger.info('API key revoked', { id, name: record.name, revokedBy: req.user!.id });

    res.json({
      success: true,
      data: { id: record.id, name: record.name, status: record.status, revokedAt: record.revokedAt },
    });
  } catch (error: unknown) {
    logger.error('Failed to revoke API key', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to revoke API key' },
    });
  }
});

export default router;
