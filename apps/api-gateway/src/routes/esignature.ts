// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Electronic Signature API — 21 CFR Part 11 compliant e-signatures
 *
 * POST /api/esignatures         — Create e-signature (requires password re-auth)
 * GET  /api/esignatures         — List e-signatures for a resource
 * GET  /api/esignatures/:id     — Get single e-signature with integrity check
 * POST /api/esignatures/:id/verify — Re-verify signature integrity
 * DELETE /api/esignatures/:id   — Invalidate (revoke) a signature
 */
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination} from '@ims/shared';
import {
  createSignature,
  verifySignature,
  isValidMeaning,
  getValidMeanings,
} from '@ims/esig';

const logger = createLogger('api-gateway-esignature');
const router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// =============================================
// POST / — Create e-signature
// =============================================

router.post('/', async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const schema = z.object({
      meaning: z.string().trim().min(1),
      reason: z.string().trim().min(1).max(500),
      password: z.string().min(1),
      resourceType: z.string().trim().min(1).max(100),
      resourceId: z.string().trim().min(1),
      resourceRef: z.string().trim().min(1).max(200),
    });

    const data = schema.parse(req.body);

    if (!isValidMeaning(data.meaning)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MEANING',
          message: `Invalid signature meaning. Valid values: ${getValidMeanings().join(', ')}`,
        },
      });
    }

    // Fetch user record for password re-authentication
    const userId = authReq.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const user = await (prisma as Record<string, any>).user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const { signature, error: sigError } = await createSignature(
      {
        userId: user.id,
        userEmail: user.email,
        userFullName: user.fullName || user.name || user.email,
        meaning: data.meaning,
        reason: data.reason,
        password: data.password,
        ipAddress,
        userAgent,
        resourceType: data.resourceType,
        resourceId: data.resourceId,
        resourceRef: data.resourceRef,
      },
      user.password
    );

    if (!signature || sigError) {
      return res.status(401).json({
        success: false,
        error: { code: 'SIGNATURE_FAILED', message: sigError || 'Signature creation failed' },
      });
    }

    // Persist to database
    const record = await (prisma as Record<string, any>).eSignature.create({
      data: {
        id: signature.id,
        userId: signature.userId,
        userEmail: signature.userEmail,
        userFullName: signature.userFullName,
        meaning: signature.meaning,
        reason: signature.reason,
        resourceType: signature.resourceType,
        resourceId: signature.resourceId,
        resourceRef: signature.resourceRef,
        ipAddress: signature.ipAddress,
        userAgent: signature.userAgent,
        checksum: signature.checksum,
        valid: true,
      },
    });

    logger.info('E-signature created', {
      signatureId: record.id,
      userId: record.userId,
      meaning: record.meaning,
      resourceType: record.resourceType,
      resourceId: record.resourceId,
    });

    // Return without sensitive data
    const { ...publicRecord } = record;
    res.status(201).json({ success: true, data: publicRecord });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create e-signature error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create e-signature' },
    });
  }
});

// =============================================
// GET / — List e-signatures for a resource
// =============================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const { resourceType, resourceId, userId, meaning, page = '1', limit = '20' } = req.query;

    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { valid: true };
    if (resourceType) where.resourceType = resourceType;
    if (resourceId) where.resourceId = resourceId;
    if (userId) where.userId = userId;
    if (meaning) where.meaning = meaning;

    const [items, total] = await Promise.all([
      (prisma as Record<string, any>).eSignature.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          userEmail: true,
          userFullName: true,
          meaning: true,
          reason: true,
          resourceType: true,
          resourceId: true,
          resourceRef: true,
          valid: true,
          createdAt: true,
        },
      }),
      (prisma as Record<string, any>).eSignature.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('List e-signatures error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list e-signatures' },
    });
  }
});

// =============================================
// GET /:id — Get e-signature with integrity check
// =============================================

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await (prisma as Record<string, any>).eSignature.findUnique({
      where: { id: req.params.id },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'E-signature not found' },
      });
    }

    // Run integrity verification
    const verification = verifySignature({
      id: record.id,
      userId: record.userId,
      userEmail: record.userEmail,
      userFullName: record.userFullName,
      meaning: record.meaning,
      reason: record.reason,
      timestamp: record.createdAt,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      resourceType: record.resourceType,
      resourceId: record.resourceId,
      resourceRef: record.resourceRef,
      checksum: record.checksum,
      valid: record.valid,
    });

    res.json({
      success: true,
      data: {
        ...record,
        integrity: {
          valid: verification.valid,
          checksumMatch: verification.checksumMatch,
        },
      },
    });
  } catch (error) {
    logger.error('Get e-signature error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get e-signature' },
    });
  }
});

// =============================================
// POST /:id/verify — Re-verify signature integrity
// =============================================

router.post('/:id/verify', async (req: Request, res: Response) => {
  try {
    const record = await (prisma as Record<string, any>).eSignature.findUnique({
      where: { id: req.params.id },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'E-signature not found' },
      });
    }

    const verification = verifySignature({
      id: record.id,
      userId: record.userId,
      userEmail: record.userEmail,
      userFullName: record.userFullName,
      meaning: record.meaning,
      reason: record.reason,
      timestamp: record.createdAt,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      resourceType: record.resourceType,
      resourceId: record.resourceId,
      resourceRef: record.resourceRef,
      checksum: record.checksum,
      valid: record.valid,
    });

    // If tampered, invalidate in DB
    if (!verification.checksumMatch && record.valid) {
      await (prisma as Record<string, any>).eSignature.update({
        where: { id: record.id },
        data: { valid: false },
      });
      logger.warn('Signature invalidated due to checksum mismatch', { id: record.id });
    }

    res.json({ success: true, data: verification });
  } catch (error) {
    logger.error('Verify e-signature error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to verify e-signature' },
    });
  }
});

// =============================================
// DELETE /:id — Revoke (invalidate) signature
// =============================================

router.delete('/:id', async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const record = await (prisma as Record<string, any>).eSignature.findUnique({
      where: { id: req.params.id },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'E-signature not found' },
      });
    }

    if (!record.valid) {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_INVALID', message: 'E-signature is already invalidated' },
      });
    }

    await (prisma as Record<string, any>).eSignature.update({
      where: { id: record.id },
      data: { valid: false },
    });

    logger.info('E-signature revoked', {
      signatureId: record.id,
      revokedBy: authReq.user?.id,
    });

    res.json({ success: true, data: { message: 'E-signature revoked' } });
  } catch (error) {
    logger.error('Revoke e-signature error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to revoke e-signature' },
    });
  }
});

export default router;
