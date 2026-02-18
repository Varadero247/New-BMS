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

const socialCreateSchema = z.object({
  category: z.enum(['DIVERSITY', 'HEALTH_SAFETY', 'TRAINING', 'COMMUNITY', 'HUMAN_RIGHTS', 'LABOR']),
  metric: z.string().min(1).max(200),
  value: z.number(),
  unit: z.string().max(50).optional().nullable(),
  periodStart: z.string(),
  periodEnd: z.string(),
  notes: z.string().max(2000).optional().nullable(),
});

const socialUpdateSchema = z.object({
  category: z.enum(['DIVERSITY', 'HEALTH_SAFETY', 'TRAINING', 'COMMUNITY', 'HUMAN_RIGHTS', 'LABOR']).optional(),
  metric: z.string().min(1).max(200).optional(),
  value: z.number().optional(),
  unit: z.string().max(50).optional().nullable(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  notes: z.string().max(2000).optional().nullable(),
});

const RESERVED_PATHS = new Set(['workforce', 'safety']);

// GET /api/social/workforce
router.get('/workforce', async (req: Request, res: Response) => {
  try {
    const where: Record<string, any> = {
      deletedAt: null,
      category: { in: ['DIVERSITY', 'LABOR'] },
    };

    const metrics = await prisma.esgSocialMetric.findMany({ where, orderBy: { periodStart: 'desc' } });

    const summary: Record<string, any[]> = { diversity: [], labor: [] };
    for (const m of metrics) {
      if (m.category === 'DIVERSITY') {
        summary.diversity.push({ metric: m.metric, value: Number(m.value), unit: m.unit, period: m.periodStart });
      } else if (m.category === 'LABOR') {
        summary.labor.push({ metric: m.metric, value: Number(m.value), unit: m.unit, period: m.periodStart });
      }
    }

    res.json({ success: true, data: summary });
  } catch (error: unknown) {
    logger.error('Error fetching workforce summary', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch workforce summary' } });
  }
});

// GET /api/social/safety
router.get('/safety', async (req: Request, res: Response) => {
  try {
    const where: Record<string, any> = {
      deletedAt: null,
      category: 'HEALTH_SAFETY',
    };

    const metrics = await prisma.esgSocialMetric.findMany({ where, orderBy: { periodStart: 'desc' } });

    const safetyData = metrics.map((m: Record<string, any>) => ({
      metric: m.metric,
      value: Number(m.value),
      unit: m.unit,
      period: m.periodStart,
      notes: m.notes,
    }));

    res.json({ success: true, data: safetyData });
  } catch (error: unknown) {
    logger.error('Error fetching safety summary', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch safety summary' } });
  }
});

// GET /api/social
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, periodStart, periodEnd, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
    const take = parseInt(limit as string, 10);

    const where: Record<string, any> = { deletedAt: null };
    if (category) where.category = category as string;
    if (periodStart) where.periodStart = { gte: new Date(periodStart as string) };
    if (periodEnd) where.periodEnd = { lte: new Date(periodEnd as string) };

    const [data, total] = await Promise.all([
      prisma.esgSocialMetric.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.esgSocialMetric.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page: parseInt(page as string, 10), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error: unknown) {
    logger.error('Error listing social metrics', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list social metrics' } });
  }
});

// POST /api/social
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = socialCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const data = parsed.data;
    const metric = await prisma.esgSocialMetric.create({
      data: {
        category: data.category,
        metric: data.metric,
        value: new Prisma.Decimal(data.value),
        unit: data.unit || null,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        notes: data.notes || null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: metric });
  } catch (error: unknown) {
    logger.error('Error creating social metric', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create social metric' } });
  }
});

// GET /api/social/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');
    const metric = await prisma.esgSocialMetric.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!metric) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Social metric not found' } });
    }
    res.json({ success: true, data: metric });
  } catch (error: unknown) {
    logger.error('Error fetching social metric', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch social metric' } });
  }
});

// PUT /api/social/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = socialUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const existing = await prisma.esgSocialMetric.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Social metric not found' } });
    }

    const updateData: Record<string, any> = { ...parsed.data };
    if (updateData.value !== undefined) updateData.value = new Prisma.Decimal(updateData.value);
    if (updateData.periodStart) updateData.periodStart = new Date(updateData.periodStart);
    if (updateData.periodEnd) updateData.periodEnd = new Date(updateData.periodEnd);

    const metric = await prisma.esgSocialMetric.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: metric });
  } catch (error: unknown) {
    logger.error('Error updating social metric', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update social metric' } });
  }
});

// DELETE /api/social/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgSocialMetric.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Social metric not found' } });
    }

    await prisma.esgSocialMetric.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Social metric deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting social metric', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete social metric' } });
  }
});

export default router;
