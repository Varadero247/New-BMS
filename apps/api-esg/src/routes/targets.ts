import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-esg');
const router: Router = Router();
router.use(authenticate);

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ESG-${prefix}-${yy}${mm}-${rand}`;
}

const targetCreateSchema = z.object({
  metricId: z.string().uuid(),
  year: z.number().int().min(2000).max(2100),
  targetValue: z.number(),
  actualValue: z.number().optional().nullable(),
  baselineYear: z.number().int().min(2000).max(2100).optional().nullable(),
  baselineValue: z.number().optional().nullable(),
  status: z.enum(['ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'ACHIEVED']).optional(),
});

const targetUpdateSchema = z.object({
  metricId: z.string().uuid().optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  targetValue: z.number().optional(),
  actualValue: z.number().optional().nullable(),
  baselineYear: z.number().int().min(2000).max(2100).optional().nullable(),
  baselineValue: z.number().optional().nullable(),
  status: z.enum(['ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'ACHIEVED']).optional(),
});

// GET /api/targets
router.get('/', async (req: Request, res: Response) => {
  try {
    const { year, status, metricId, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
    const take = parseInt(limit as string, 10);

    const where: Record<string, unknown> = { deletedAt: null };
    if (year) where.year = parseInt(year as string, 10);
    if (status) where.status = status as string;
    if (metricId) where.metricId = metricId as string;

    const [data, total] = await Promise.all([
      prisma.esgTarget.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { metric: true } }),
      prisma.esgTarget.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page: parseInt(page as string, 10), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error: unknown) {
    logger.error('Error listing targets', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list targets' } });
  }
});

// POST /api/targets
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = targetCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const data = parsed.data;
    const target = await prisma.esgTarget.create({
      data: {
        metricId: data.metricId,
        year: data.year,
        targetValue: new Prisma.Decimal(data.targetValue),
        actualValue: data.actualValue != null ? new Prisma.Decimal(data.actualValue) : null,
        baselineYear: data.baselineYear || null,
        baselineValue: data.baselineValue != null ? new Prisma.Decimal(data.baselineValue) : null,
        status: data.status || 'ON_TRACK',
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: target });
  } catch (error: unknown) {
    logger.error('Error creating target', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create target' } });
  }
});

// GET /api/targets/:id/trajectory
router.get('/:id/trajectory', async (req: Request, res: Response) => {
  try {
    const target = await prisma.esgTarget.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { metric: { include: { dataPoints: { where: { deletedAt: null }, orderBy: { periodStart: 'asc' } } } } },
    });

    if (!target) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Target not found' } });
    }

    const dataPoints = target.metric?.dataPoints || [];
    const trajectory = dataPoints.map((dp: Record<string, unknown>) => ({
      period: dp.periodStart,
      actual: Number(dp.value),
      target: Number(target.targetValue),
    }));

    res.json({
      success: true,
      data: {
        target: {
          id: target.id,
          year: target.year,
          targetValue: Number(target.targetValue),
          actualValue: target.actualValue ? Number(target.actualValue) : null,
          status: target.status,
        },
        trajectory,
      },
    });
  } catch (error: unknown) {
    logger.error('Error fetching target trajectory', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch trajectory' } });
  }
});

// GET /api/targets/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const target = await prisma.esgTarget.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { metric: true },
    });
    if (!target) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Target not found' } });
    }
    res.json({ success: true, data: target });
  } catch (error: unknown) {
    logger.error('Error fetching target', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch target' } });
  }
});

// PUT /api/targets/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = targetUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const existing = await prisma.esgTarget.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Target not found' } });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.targetValue !== undefined) updateData.targetValue = new Prisma.Decimal(updateData.targetValue);
    if (updateData.actualValue !== undefined) updateData.actualValue = updateData.actualValue != null ? new Prisma.Decimal(updateData.actualValue) : null;
    if (updateData.baselineValue !== undefined) updateData.baselineValue = updateData.baselineValue != null ? new Prisma.Decimal(updateData.baselineValue) : null;

    const target = await prisma.esgTarget.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: target });
  } catch (error: unknown) {
    logger.error('Error updating target', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update target' } });
  }
});

// DELETE /api/targets/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgTarget.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Target not found' } });
    }

    await prisma.esgTarget.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Target deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting target', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete target' } });
  }
});

export default router;
