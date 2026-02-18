import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-energy');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `ENR-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const baselineCreateSchema = z.object({
  name: z.string().min(1).max(200),
  year: z.number().int().min(2000).max(2100),
  description: z.string().max(2000).optional().nullable(),
  totalConsumption: z.number().min(0),
  unit: z.string().min(1).max(50),
  methodology: z.string().min(1).max(500),
  adjustmentFactors: z.any().optional().nullable(),
});

const baselineUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  description: z.string().max(2000).optional().nullable(),
  totalConsumption: z.number().min(0).optional(),
  unit: z.string().min(1).max(50).optional(),
  methodology: z.string().min(1).max(500).optional(),
  adjustmentFactors: z.any().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SUPERSEDED']).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List baselines
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const { year, status } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (year) { const n = parseInt(String(year), 10); if (!isNaN(n)) where.year = n; }
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const [baselines, total] = await Promise.all([
      prisma.energyBaseline.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.energyBaseline.count({ where }),
    ]);

    res.json({
      success: true,
      data: baselines,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list baselines', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list baselines' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create baseline
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = baselineCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const baseline = await prisma.energyBaseline.create({
      data: {
        name: data.name,
        year: data.year,
        description: data.description ?? null,
        totalConsumption: new Prisma.Decimal(data.totalConsumption),
        unit: data.unit,
        methodology: data.methodology,
        adjustmentFactors: data.adjustmentFactors ?? null,
        status: 'DRAFT',
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Baseline created', { baselineId: baseline.id });
    res.status(201).json({ success: true, data: baseline });
  } catch (error: unknown) {
    logger.error('Failed to create baseline', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create baseline' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get baseline
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const baseline = await prisma.energyBaseline.findFirst({
      where: { id, deletedAt: null } as any,
      include: { targets: { where: { deletedAt: null } as any } },
    });

    if (!baseline) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
    }

    res.json({ success: true, data: baseline });
  } catch (error: unknown) {
    logger.error('Failed to get baseline', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get baseline' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update baseline
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = baselineUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }

    const existing = await prisma.energyBaseline.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.totalConsumption !== undefined) {
      updateData.totalConsumption = new Prisma.Decimal(updateData.totalConsumption as any);
    }

    const baseline = await prisma.energyBaseline.update({
      where: { id },
      data: updateData,
    });

    logger.info('Baseline updated', { baselineId: id });
    res.json({ success: true, data: baseline });
  } catch (error: unknown) {
    logger.error('Failed to update baseline', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update baseline' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete baseline
// ---------------------------------------------------------------------------

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.energyBaseline.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
    }

    await prisma.energyBaseline.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info('Baseline soft-deleted', { baselineId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete baseline', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete baseline' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/approve — Approve baseline
// ---------------------------------------------------------------------------

router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;

    const existing = await prisma.energyBaseline.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Baseline not found' } });
    }

    if (existing.status !== 'DRAFT') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Only DRAFT baselines can be approved' } });
    }

    const baseline = await prisma.energyBaseline.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        approvedBy: authReq.user?.id || 'system',
        approvedAt: new Date(),
      },
    });

    logger.info('Baseline approved', { baselineId: id });
    res.json({ success: true, data: baseline });
  } catch (error: unknown) {
    logger.error('Failed to approve baseline', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve baseline' } });
  }
});

export default router;
