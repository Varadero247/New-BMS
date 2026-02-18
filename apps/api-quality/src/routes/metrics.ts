import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-quality');
const router: Router = Router();
router.use(authenticate);

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-MET';
  const count = await prisma.qualMetric.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(300),
  description: z.string().max(2000).optional().nullable(),
  category: z.enum(['CUSTOMER_SATISFACTION', 'PRODUCT_QUALITY', 'PROCESS_PERFORMANCE', 'SUPPLIER_PERFORMANCE', 'AUDIT_RESULTS', 'NONCONFORMANCE', 'DELIVERY', 'SAFETY', 'FINANCIAL', 'OTHER']).default('OTHER'),
  unit: z.string().max(100).optional().nullable(),
  targetValue: z.number().nonnegative().optional().nullable(),
  actualValue: z.number().optional().nullable(),
  lowerLimit: z.number().optional().nullable(),
  upperLimit: z.number().optional().nullable(),
  frequency: z.string().max(100).optional().nullable(),
  owner: z.string().max(200).optional().nullable(),
  isoClause: z.string().max(200).optional().nullable(),
  period: z.string().max(100).optional().nullable(),
  measurementDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional().nullable(),
  trend: z.string().max(100).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(['ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'NOT_MEASURED']).optional(),
});

// GET /summary — Metrics dashboard summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const where: Record<string, unknown> = { deletedAt: null };
    if (req.query.organisationId) where.organisationId = req.query.organisationId;

    const [total, onTrack, atRisk, offTrack, byCategory] = await Promise.all([
      prisma.qualMetric.count({ where }),
      prisma.qualMetric.count({ where: { ...where, status: 'ON_TRACK' } }),
      prisma.qualMetric.count({ where: { ...where, status: 'AT_RISK' } }),
      prisma.qualMetric.count({ where: { ...where, status: 'OFF_TRACK' } }),
      prisma.qualMetric.groupBy({ by: ['category'], where, _count: { id: true } }),
    ]);

    res.json({
      success: true,
      data: {
        total, onTrack, atRisk, offTrack,
        byCategory: byCategory.map((c: Record<string, unknown>) => ({ category: c.category, count: (c as any)._count.id })),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get metrics summary', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get metrics summary' } });
  }
});

// GET / — List metrics
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, category, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status && typeof status === 'string') where.status = status;
    if (category && typeof category === 'string') where.category = category;
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { owner: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.qualMetric.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.qualMetric.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list metrics', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list metrics' } });
  }
});

// POST / — Create metric
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;
    const referenceNumber = await generateRefNumber();

    const item = await prisma.qualMetric.create({
      data: {
        referenceNumber,
        ...parsed.data,
        measurementDate: parsed.data.measurementDate ? new Date(parsed.data.measurementDate) : null,
        status: 'NOT_MEASURED',
        organisationId: (authReq.user as any)?.organisationId || 'default',
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to create metric', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create metric' } });
  }
});

// GET /:id — Get metric by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.qualMetric.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Metric not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to get metric', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get metric' } });
  }
});

// PUT /:id — Update metric
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.qualMetric.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Metric not found' } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.measurementDate) data.measurementDate = new Date(parsed.data.measurementDate);

    const item = await prisma.qualMetric.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to update metric', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update metric' } });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.qualMetric.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Metric not found' } });

    await prisma.qualMetric.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete metric', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete metric' } });
  }
});

export default router;
