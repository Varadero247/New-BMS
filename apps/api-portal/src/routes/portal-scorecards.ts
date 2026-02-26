// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
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

const scorecardCreateSchema = z.object({
  portalUserId: z.string().trim().uuid(),
  period: z.string().trim().min(1).max(50),
  overallScore: z.number().min(0).max(100),
  qualityScore: z.number().min(0).max(100).optional().nullable(),
  deliveryScore: z.number().min(0).max(100).optional().nullable(),
  responseScore: z.number().min(0).max(100).optional().nullable(),
  complianceScore: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// GET / — List scorecards
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;
    const portalUserId = req.query.portalUserId as string | undefined;
    const period = req.query.period as string | undefined;

    const where: Record<string, unknown> = { deletedAt: null };
    if (portalUserId) where.portalUserId = portalUserId;
    if (period) where.period = period;

    const [items, total] = await Promise.all([
      prisma.portalScorecard.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.portalScorecard.count({ where }),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing scorecards', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list scorecards' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create scorecard
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = scorecardCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      });
    }

    const data = parsed.data;

    const scorecard = await prisma.portalScorecard.create({
      data: {
        portalUserId: data.portalUserId,
        period: data.period,
        overallScore: new Prisma.Decimal(data.overallScore),
        qualityScore: data.qualityScore !== null ? new Prisma.Decimal(data.qualityScore ?? 0) : null,
        deliveryScore: data.deliveryScore !== null ? new Prisma.Decimal(data.deliveryScore ?? 0) : null,
        responseScore: data.responseScore !== null ? new Prisma.Decimal(data.responseScore ?? 0) : null,
        complianceScore:
          data.complianceScore !== null ? new Prisma.Decimal(data.complianceScore ?? 0) : null,
        notes: data.notes ?? null,
        createdBy: auth.user!.id,
      },
    });

    logger.info('Scorecard created', { id: scorecard.id, portalUserId: data.portalUserId });
    return res.status(201).json({ success: true, data: scorecard });
  } catch (error: unknown) {
    logger.error('Error creating scorecard', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create scorecard' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Scorecard detail
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const scorecard = await prisma.portalScorecard.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!scorecard) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Scorecard not found' } });
    }

    return res.json({ success: true, data: scorecard });
  } catch (error: unknown) {
    logger.error('Error fetching scorecard', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch scorecard' },
    });
  }
});

export default router;
