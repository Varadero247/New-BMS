import { randomUUID } from 'crypto';
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
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `ESG-${prefix}-${yy}${mm}-${rand}`;
}

const frameworkCreateSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  version: z.string().min(1).max(50),
  description: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
  modules: z.any().optional().nullable(),
});

const frameworkUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  version: z.string().min(1).max(50).optional(),
  description: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
  modules: z.any().optional().nullable(),
});

const metricCreateSchema = z.object({
  category: z.enum(['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE']),
  subcategory: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  unit: z.string().min(1).max(50),
  targetValue: z.number().optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY']),
  isRequired: z.boolean().optional(),
});

const dataPointCreateSchema = z.object({
  periodStart: z.string(),
  periodEnd: z.string(),
  value: z.number(),
  unit: z.string().min(1).max(50),
  source: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED']).optional(),
});

// GET /api/frameworks
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const skip = (Math.max(1, parseInt(page as string, 10) || 1) - 1) * Math.max(1, parseInt(limit as string, 10) || 20);
    const take = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    const where: Record<string, any> = { deletedAt: null };

    const [data, total] = await Promise.all([
      prisma.esgFramework.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { metrics: { where: { deletedAt: null } as any } } }),
      prisma.esgFramework.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page: Math.max(1, parseInt(page as string, 10) || 1), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error: unknown) {
    logger.error('Error listing frameworks', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list frameworks' } });
  }
});

// POST /api/frameworks
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = frameworkCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const data = parsed.data;
    const framework = await prisma.esgFramework.create({
      data: {
        name: data.name,
        code: data.code,
        version: data.version,
        description: data.description || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        modules: data.modules || null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: framework });
  } catch (error: unknown) {
    if (error != null && typeof error === 'object' && 'code' in error && (error as any).code === 'P2002') {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Framework code already exists' } });
    }
    logger.error('Error creating framework', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create framework' } });
  }
});

// GET /api/frameworks/:id/metrics
router.get('/:id/metrics', async (req: Request, res: Response) => {
  try {
    const framework = await prisma.esgFramework.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!framework) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Framework not found' } });
    }

    const metrics = await prisma.esgMetric.findMany({
      where: { frameworkId: req.params.id, deletedAt: null } as any,
      orderBy: { code: 'asc' },
    });

    res.json({ success: true, data: metrics });
  } catch (error: unknown) {
    logger.error('Error fetching framework metrics', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch metrics' } });
  }
});

// POST /api/frameworks/:id/metrics
router.post('/:id/metrics', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const framework = await prisma.esgFramework.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!framework) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Framework not found' } });
    }

    const parsed = metricCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const data = parsed.data;
    const metric = await prisma.esgMetric.create({
      data: {
        frameworkId: req.params.id,
        category: data.category,
        subcategory: data.subcategory,
        name: data.name,
        code: data.code,
        unit: data.unit,
        targetValue: data.targetValue != null ? new Prisma.Decimal(data.targetValue) : null,
        description: data.description || null,
        frequency: data.frequency,
        isRequired: data.isRequired || false,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: metric });
  } catch (error: unknown) {
    if (error != null && typeof error === 'object' && 'code' in error && (error as any).code === 'P2002') {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Metric code already exists' } });
    }
    logger.error('Error creating metric', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create metric' } });
  }
});

// GET /api/frameworks/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const framework = await prisma.esgFramework.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { metrics: { where: { deletedAt: null } as any } },
    });
    if (!framework) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Framework not found' } });
    }
    res.json({ success: true, data: framework });
  } catch (error: unknown) {
    logger.error('Error fetching framework', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch framework' } });
  }
});

// PUT /api/frameworks/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = frameworkUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const existing = await prisma.esgFramework.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Framework not found' } });
    }

    const framework = await prisma.esgFramework.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data: framework });
  } catch (error: unknown) {
    logger.error('Error updating framework', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update framework' } });
  }
});

// DELETE /api/frameworks/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgFramework.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Framework not found' } });
    }

    await prisma.esgFramework.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Framework deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting framework', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete framework' } });
  }
});

// POST /api/metrics/:id/data-points — mounted separately in index.ts or here via sub-path
// We handle metrics data-points as part of frameworks router
// These are mounted at /api/frameworks but we need /api/metrics/:id/data-points
// The index.ts will mount this router at /api/frameworks, so we use a workaround

export default router;
