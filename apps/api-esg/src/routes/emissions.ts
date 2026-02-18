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

const emissionCreateSchema = z.object({
  scope: z.enum(['SCOPE_1', 'SCOPE_2', 'SCOPE_3']),
  category: z.string().min(1).max(200),
  source: z.string().min(1).max(200),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  co2Equivalent: z.number().min(0),
  periodStart: z.string(),
  periodEnd: z.string(),
  methodology: z.string().max(500).optional().nullable(),
  verifiedBy: z.string().max(200).optional().nullable(),
});

const emissionUpdateSchema = z.object({
  scope: z.enum(['SCOPE_1', 'SCOPE_2', 'SCOPE_3']).optional(),
  category: z.string().min(1).max(200).optional(),
  source: z.string().min(1).max(200).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().min(1).max(50).optional(),
  co2Equivalent: z.number().min(0).optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  methodology: z.string().max(500).optional().nullable(),
  verifiedBy: z.string().max(200).optional().nullable(),
});

const RESERVED_PATHS = new Set(['summary', 'trend']);

// GET /api/emissions/summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { year } = req.query;

    const where: Record<string, any> = { deletedAt: null };
    if (year) {
      const y = parseInt(year as string, 10);
      where.periodStart = { gte: new Date(`${y}-01-01`) };
      where.periodEnd = { lte: new Date(`${y}-12-31`) };
    }

    const emissions = await prisma.esgEmission.findMany({ where, take: 10000 });

    const summary: Record<string, number> = { SCOPE_1: 0, SCOPE_2: 0, SCOPE_3: 0 };
    for (const e of emissions) {
      summary[e.scope] += Number(e.co2Equivalent);
    }

    const total = summary.SCOPE_1 + summary.SCOPE_2 + summary.SCOPE_3;

    res.json({
      success: true,
      data: {
        total,
        byScope: summary,
        count: emissions.length,
      },
    });
  } catch (error: unknown) {
    logger.error('Error fetching emissions summary', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch emissions summary' } });
  }
});

// GET /api/emissions/trend
router.get('/trend', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { year } = req.query;
    const y = year ? parseInt(year as string, 10) : new Date().getFullYear();

    const where: Record<string, any> = {
      deletedAt: null,
      periodStart: { gte: new Date(`${y}-01-01`) },
      periodEnd: { lte: new Date(`${y}-12-31`) },
    };

    const emissions = await prisma.esgEmission.findMany({ where, orderBy: { periodStart: 'asc' } });

    const monthlyData: Record<string, number> = {};
    for (let m = 1; m <= 12; m++) {
      monthlyData[m.toString().padStart(2, '0')] = 0;
    }

    for (const e of emissions) {
      const month = new Date(e.periodStart).toISOString().slice(5, 7);
      monthlyData[month] += Number(e.co2Equivalent);
    }

    const trend = Object.keys(monthlyData).sort().map((month) => ({
      month: `${y}-${month}`,
      co2Equivalent: monthlyData[month],
    }));

    res.json({ success: true, data: trend });
  } catch (error: unknown) {
    logger.error('Error fetching emissions trend', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch emissions trend' } });
  }
});

// GET /api/emissions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { scope, category, periodStart, periodEnd, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
    const take = parseInt(limit as string, 10);

    const where: Record<string, any> = { deletedAt: null };
    if (scope) where.scope = scope as string;
    if (category) where.category = { contains: category as string, mode: 'insensitive' };
    if (periodStart) where.periodStart = { gte: new Date(periodStart as string) };
    if (periodEnd) where.periodEnd = { lte: new Date(periodEnd as string) };

    const [data, total] = await Promise.all([
      prisma.esgEmission.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.esgEmission.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page: parseInt(page as string, 10), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error: unknown) {
    logger.error('Error listing emissions', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list emissions' } });
  }
});

// POST /api/emissions
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = emissionCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const data = parsed.data;
    const emission = await prisma.esgEmission.create({
      data: {
        scope: data.scope,
        category: data.category,
        source: data.source,
        quantity: new Prisma.Decimal(data.quantity),
        unit: data.unit,
        co2Equivalent: new Prisma.Decimal(data.co2Equivalent),
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        methodology: data.methodology || null,
        verifiedBy: data.verifiedBy || null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: emission });
  } catch (error: unknown) {
    logger.error('Error creating emission', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create emission' } });
  }
});

// GET /api/emissions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');
    const emission = await prisma.esgEmission.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!emission) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Emission not found' } });
    }
    res.json({ success: true, data: emission });
  } catch (error: unknown) {
    logger.error('Error fetching emission', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch emission' } });
  }
});

// PUT /api/emissions/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = emissionUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const existing = await prisma.esgEmission.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Emission not found' } });
    }

    const updateData: Record<string, any> = { ...parsed.data };
    if (updateData.quantity !== undefined) updateData.quantity = new Prisma.Decimal(updateData.quantity);
    if (updateData.co2Equivalent !== undefined) updateData.co2Equivalent = new Prisma.Decimal(updateData.co2Equivalent);
    if (updateData.periodStart) updateData.periodStart = new Date(updateData.periodStart);
    if (updateData.periodEnd) updateData.periodEnd = new Date(updateData.periodEnd);

    const emission = await prisma.esgEmission.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: emission });
  } catch (error: unknown) {
    logger.error('Error updating emission', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update emission' } });
  }
});

// DELETE /api/emissions/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgEmission.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Emission not found' } });
    }

    await prisma.esgEmission.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Emission deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting emission', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete emission' } });
  }
});

export default router;
