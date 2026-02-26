// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-energy');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const targetCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  metricType: z.enum(['CONSUMPTION', 'INTENSITY', 'COST', 'EMISSIONS', 'RENEWABLE_PERCENTAGE']),
  baselineId: z.string().trim().uuid().optional().nullable(),
  year: z.number().int().min(2000).max(2100),
  targetValue: z.number().nonnegative(),
  unit: z.string().trim().min(1).max(50),
});

const targetUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  metricType: z
    .enum(['CONSUMPTION', 'INTENSITY', 'COST', 'EMISSIONS', 'RENEWABLE_PERCENTAGE'])
    .optional(),
  baselineId: z.string().trim().uuid().optional().nullable(),
  year: z.number().int().min(2000).max(2100).optional(),
  targetValue: z.number().nonnegative().optional(),
  actualValue: z.number().optional().nullable(),
  unit: z.string().trim().min(1).max(50).optional(),
  status: z.enum(['ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'ACHIEVED']).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List targets
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const { year, status, metricType } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (year) {
      const n = parseInt(String(year), 10);
      if (!isNaN(n)) where.year = n;
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (metricType && typeof metricType === 'string') {
      where.metricType = metricType;
    }

    const [targets, total] = await Promise.all([
      prisma.energyTarget.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          baseline: { select: { id: true, name: true, year: true } },
        },
      }),
      prisma.energyTarget.count({ where }),
    ]);

    res.json({
      success: true,
      data: targets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list targets', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list targets' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create target
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = targetCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    // Validate baseline if provided
    if (data.baselineId) {
      const baseline = await prisma.energyBaseline.findFirst({
        where: { id: data.baselineId, deletedAt: null },
      });
      if (!baseline) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
      }
    }

    const target = await prisma.energyTarget.create({
      data: {
        name: data.name,
        metricType: data.metricType,
        baselineId: data.baselineId ?? null,
        year: data.year,
        targetValue: new Prisma.Decimal(data.targetValue),
        unit: data.unit,
        status: 'ON_TRACK',
        createdBy: authReq.user?.id || 'system',
      },
      include: {
        baseline: { select: { id: true, name: true, year: true } },
      },
    });

    logger.info('Target created', { targetId: target.id });
    res.status(201).json({ success: true, data: target });
  } catch (error: unknown) {
    logger.error('Failed to create target', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create target' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id/progress — Target progress
// ---------------------------------------------------------------------------

router.get('/:id/progress', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const target = await prisma.energyTarget.findFirst({
      where: { id, deletedAt: null },
      include: {
        baseline: { select: { id: true, name: true, totalConsumption: true } },
      },
    });

    if (!target) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Target not found' } });
    }

    const targetVal = Number(target.targetValue);
    const actualVal = Number(target.actualValue || 0);
    const baselineVal = target.baseline ? Number(target.baseline.totalConsumption) : null;

    const progress = targetVal !== 0 ? (actualVal / targetVal) * 100 : 0;
    const variance = targetVal - actualVal;

    res.json({
      success: true,
      data: {
        target: targetVal,
        actual: actualVal,
        baseline: baselineVal,
        progress: Math.round(progress * 100) / 100,
        variance,
        status: target.status,
        onTrack: target.status === 'ON_TRACK' || target.status === 'ACHIEVED',
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get target progress', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get target progress' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get target
// ---------------------------------------------------------------------------

const RESERVED_PATHS = new Set(['progress']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const target = await prisma.energyTarget.findFirst({
      where: { id, deletedAt: null },
      include: {
        baseline: { select: { id: true, name: true, year: true, totalConsumption: true } },
      },
    });

    if (!target) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Target not found' } });
    }

    res.json({ success: true, data: target });
  } catch (error: unknown) {
    logger.error('Failed to get target', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get target' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update target
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = targetUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await prisma.energyTarget.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Target not found' } });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.targetValue !== undefined) {
      updateData.targetValue = new Prisma.Decimal(updateData.targetValue as number);
    }
    if (updateData.actualValue !== undefined && updateData.actualValue !== null) {
      updateData.actualValue = new Prisma.Decimal(updateData.actualValue as number);
    }

    const target = await prisma.energyTarget.update({
      where: { id },
      data: updateData,
    });

    logger.info('Target updated', { targetId: id });
    res.json({ success: true, data: target });
  } catch (error: unknown) {
    logger.error('Failed to update target', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update target' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete target
// ---------------------------------------------------------------------------

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.energyTarget.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Target not found' } });
    }

    await prisma.energyTarget.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info('Target soft-deleted', { targetId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete target', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete target' },
    });
  }
});

export default router;
