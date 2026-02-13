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

const governanceCreateSchema = z.object({
  category: z.enum(['BOARD', 'ETHICS', 'RISK', 'COMPLIANCE', 'TRANSPARENCY', 'ANTI_CORRUPTION']),
  metric: z.string().min(1).max(200),
  value: z.string().min(1).max(1000),
  periodStart: z.string(),
  periodEnd: z.string(),
  notes: z.string().max(2000).optional().nullable(),
});

const governanceUpdateSchema = z.object({
  category: z.enum(['BOARD', 'ETHICS', 'RISK', 'COMPLIANCE', 'TRANSPARENCY', 'ANTI_CORRUPTION']).optional(),
  metric: z.string().min(1).max(200).optional(),
  value: z.string().min(1).max(1000).optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  notes: z.string().max(2000).optional().nullable(),
});

const RESERVED_PATHS = new Set(['policies', 'ethics']);

// GET /api/governance/policies
router.get('/policies', async (req: Request, res: Response) => {
  try {
    const where: Record<string, unknown> = {
      deletedAt: null,
      category: { in: ['COMPLIANCE', 'TRANSPARENCY'] },
    };

    const metrics = await prisma.esgGovernanceMetric.findMany({ where, orderBy: { periodStart: 'desc' } });

    const policies = metrics.map((m: Record<string, unknown>) => ({
      id: m.id,
      category: m.category,
      metric: m.metric,
      value: m.value,
      period: m.periodStart,
      notes: m.notes,
    }));

    res.json({ success: true, data: policies });
  } catch (error: unknown) {
    logger.error('Error fetching policies', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch policies' } });
  }
});

// GET /api/governance/ethics
router.get('/ethics', async (req: Request, res: Response) => {
  try {
    const where: Record<string, unknown> = {
      deletedAt: null,
      category: { in: ['ETHICS', 'ANTI_CORRUPTION'] },
    };

    const metrics = await prisma.esgGovernanceMetric.findMany({ where, orderBy: { periodStart: 'desc' } });

    const ethicsData = metrics.map((m: Record<string, unknown>) => ({
      id: m.id,
      category: m.category,
      metric: m.metric,
      value: m.value,
      period: m.periodStart,
      notes: m.notes,
    }));

    res.json({ success: true, data: ethicsData });
  } catch (error: unknown) {
    logger.error('Error fetching ethics data', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch ethics data' } });
  }
});

// GET /api/governance
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, periodStart, periodEnd, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
    const take = parseInt(limit as string, 10);

    const where: Record<string, unknown> = { deletedAt: null };
    if (category) where.category = category as string;
    if (periodStart) where.periodStart = { gte: new Date(periodStart as string) };
    if (periodEnd) where.periodEnd = { lte: new Date(periodEnd as string) };

    const [data, total] = await Promise.all([
      prisma.esgGovernanceMetric.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.esgGovernanceMetric.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page: parseInt(page as string, 10), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error: unknown) {
    logger.error('Error listing governance metrics', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list governance metrics' } });
  }
});

// POST /api/governance
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = governanceCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const data = parsed.data;
    const metric = await prisma.esgGovernanceMetric.create({
      data: {
        category: data.category,
        metric: data.metric,
        value: data.value,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        notes: data.notes || null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: metric });
  } catch (error: unknown) {
    logger.error('Error creating governance metric', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create governance metric' } });
  }
});

// GET /api/governance/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');
    const metric = await prisma.esgGovernanceMetric.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!metric) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Governance metric not found' } });
    }
    res.json({ success: true, data: metric });
  } catch (error: unknown) {
    logger.error('Error fetching governance metric', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch governance metric' } });
  }
});

// PUT /api/governance/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = governanceUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const existing = await prisma.esgGovernanceMetric.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Governance metric not found' } });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.periodStart) updateData.periodStart = new Date(updateData.periodStart);
    if (updateData.periodEnd) updateData.periodEnd = new Date(updateData.periodEnd);

    const metric = await prisma.esgGovernanceMetric.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: metric });
  } catch (error: unknown) {
    logger.error('Error updating governance metric', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update governance metric' } });
  }
});

// DELETE /api/governance/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgGovernanceMetric.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Governance metric not found' } });
    }

    await prisma.esgGovernanceMetric.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Governance metric deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting governance metric', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete governance metric' } });
  }
});

export default router;
