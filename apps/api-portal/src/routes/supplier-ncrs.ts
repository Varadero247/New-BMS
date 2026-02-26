// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-portal');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const ncrResponseSchema = z.object({
  resolution: z.string().trim().min(1).max(5000),
  attachments: z.any().optional().nullable(),
});

// ---------------------------------------------------------------------------
// GET / — List NCRs against the supplier
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const where: Record<string, unknown> = {
      portalUserId: auth.user!.id,
      reportType: 'NCR',
      deletedAt: null,
    };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.portalQualityReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.portalQualityReport.count({ where }),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing NCRs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list NCRs' } });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/response — Submit corrective action response
// ---------------------------------------------------------------------------

router.post('/:id/response', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = ncrResponseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      });
    }

    const ncr = await prisma.portalQualityReport.findFirst({
      where: {
        id: req.params.id,
        portalUserId: auth.user!.id,
        reportType: 'NCR',
        deletedAt: null,
      },
    });

    if (!ncr) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'NCR not found' } });
    }

    if (ncr.status === 'CLOSED' || ncr.status === 'RESOLVED') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'NCR is already resolved or closed' },
      });
    }

    const updated = await prisma.portalQualityReport.update({
      where: { id: req.params.id },
      data: {
        resolution: parsed.data.resolution,
        status: 'INVESTIGATING',
        attachments: parsed.data.attachments ?? ncr.attachments,
      },
    });

    logger.info('NCR response submitted', { id: updated.id });
    return res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Error submitting NCR response', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to submit NCR response' },
    });
  }
});

export default router;
