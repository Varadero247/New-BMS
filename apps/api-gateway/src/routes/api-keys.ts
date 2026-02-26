// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { prisma as prismaBase } from '@ims/database';
import type { PrismaClient } from '@ims/database/core';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = prismaBase as unknown as PrismaClient;

const logger = createLogger('api-gateway:api-keys');
const router = Router();

// ─── Validation Schemas ─────────────────────────────────────────────────────

const createKeySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  scopes: z.array(z.string().trim().min(1).max(2000)).min(1, 'At least one scope is required'),
});

// ─── All routes require authentication + admin role ─────────────────────────

router.use(authenticate);

// ─── Routes ─────────────────────────────────────────────────────────────────

// POST /api/admin/api-keys — Create a new API key
router.post('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
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

    const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || 'default';
    const createdById = (req as AuthRequest).user!.id;

    const record = await prisma.apiKey.create({
      data: {
        name,
        keyHash,
        prefix: keyPrefix,
        permissions: scopes,
        orgId,
        createdById,
        isActive: true,
        usageCount: 0,
      },
    });

    logger.info('API key created', {
      id: record.id,
      name,
      prefix: keyPrefix,
      createdBy: createdById,
    });

    // Return the full key ONCE — it cannot be retrieved again
    res.status(201).json({
      success: true,
      data: {
        id: record.id,
        name: record.name,
        key: fullKey, // only returned on creation
        keyPrefix: record.prefix,
        scopes: record.permissions,
        createdAt: record.createdAt,
        status: record.isActive ? 'active' : 'revoked',
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to create API key', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create API key' },
    });
  }
});

// GET /api/admin/api-keys — List all API keys (never returns the full key)
router.get('/', requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || 'default';

    const keys = await prisma.apiKey.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });

    const data = keys.map((k) => ({
      id: k.id,
      name: k.name,
      keyPrefix: k.prefix,
      scopes: k.permissions,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
      usageCount: k.usageCount,
      status: k.isActive ? 'active' : 'revoked',
      revokedAt: k.revokedAt,
    }));

    res.json({
      success: true,
      data,
      meta: { total: data.length },
    });
  } catch (error: unknown) {
    logger.error('Failed to list API keys', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list API keys' },
    });
  }
});

// DELETE /api/admin/api-keys/:id — Revoke an API key
router.delete('/:id', requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await prisma.apiKey.findUnique({ where: { id } });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'API key not found' },
      });
    }

    if (!record.isActive) {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_REVOKED', message: 'API key is already revoked' },
      });
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data: { isActive: false, revokedAt: new Date() },
    });

    logger.info('API key revoked', { id, name: record.name, revokedBy: (req as AuthRequest).user!.id });

    res.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        status: 'revoked',
        revokedAt: updated.revokedAt,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to revoke API key', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to revoke API key' },
    });
  }
});

export default router;
