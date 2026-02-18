import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-analytics');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const trendEnum = z.enum(['UP', 'DOWN', 'STABLE']);
const frequencyEnum = z.enum(['REALTIME', 'DAILY', 'WEEKLY', 'MONTHLY']);

const kpiCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  module: z.string().trim().min(1).max(100),
  formula: z.string().max(500).optional().nullable(),
  unit: z.string().max(50).optional().nullable(),
  currentValue: z.number().nonnegative().optional().nullable(),
  previousValue: z.number().optional().nullable(),
  targetValue: z.number().nonnegative().optional().nullable(),
  trend: trendEnum,
  frequency: frequencyEnum,
});

const kpiUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  module: z.string().trim().min(1).max(100).optional(),
  formula: z.string().max(500).optional().nullable(),
  unit: z.string().max(50).optional().nullable(),
  currentValue: z.number().nonnegative().optional().nullable(),
  previousValue: z.number().optional().nullable(),
  targetValue: z.number().nonnegative().optional().nullable(),
  trend: trendEnum.optional(),
  frequency: frequencyEnum.optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

const RESERVED_PATHS = new Set(['executive-dashboard', 'modules']);

// ===================================================================
// GET /api/kpis/executive-dashboard — All KPIs grouped by module
// ===================================================================

router.get('/executive-dashboard', async (req: Request, res: Response) => {
  try {
    const kpis = await prisma.analyticsKpi.findMany({
      where: { deletedAt: null } as any,
      orderBy: [{ module: 'asc' }, { name: 'asc' }],
      take: Math.min(Math.max(1, parseInt(req.query.limit as string, 10) || 50), 200),
      skip: Math.max(0, parseInt(req.query.offset as string, 10) || 0),
    });

    const grouped: Record<string, any[]> = {};
    for (const kpi of kpis) {
      if (!grouped[kpi.module]) grouped[kpi.module] = [];
      grouped[kpi.module].push(kpi);
    }

    res.json({ success: true, data: grouped });
  } catch (error: unknown) {
    logger.error('Failed to get executive dashboard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get executive dashboard' } });
  }
});

// ===================================================================
// GET /api/kpis/modules/:module — KPIs for specific module
// ===================================================================

router.get('/modules/:module', async (req: Request, res: Response) => {
  try {
    const { module } = req.params;

    const kpis = await prisma.analyticsKpi.findMany({
      where: { module, deletedAt: null } as any,
      orderBy: { name: 'asc' },
      take: Math.min(Math.max(1, parseInt(req.query.limit as string, 10) || 50), 200),
      skip: Math.max(0, parseInt(req.query.offset as string, 10) || 0),
    });

    res.json({ success: true, data: kpis });
  } catch (error: unknown) {
    logger.error('Failed to get module KPIs', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get module KPIs' } });
  }
});

// ===================================================================
// GET /api/kpis — List KPIs
// ===================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const { module, frequency, trend, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (typeof module === 'string' && module.length > 0) where.module = module;
    if (typeof frequency === 'string' && frequency.length > 0) where.frequency = frequency;
    if (typeof trend === 'string' && trend.length > 0) where.trend = trend;
    if (typeof search === 'string' && search.length > 0) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [kpis, total] = await Promise.all([
      prisma.analyticsKpi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.analyticsKpi.count({ where }),
    ]);

    res.json({
      success: true,
      data: kpis,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list KPIs', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list KPIs' } });
  }
});

// ===================================================================
// POST /api/kpis — Create KPI
// ===================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = kpiCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const data = parsed.data;
    const kpi = await prisma.analyticsKpi.create({
      data: {
        name: data.name,
        description: data.description || null,
        module: data.module,
        formula: data.formula || null,
        unit: data.unit || null,
        currentValue: data.currentValue != null ? data.currentValue : null,
        previousValue: data.previousValue != null ? data.previousValue : null,
        targetValue: data.targetValue != null ? data.targetValue : null,
        trend: data.trend,
        frequency: data.frequency,
        createdBy: authReq.user!.id,
      },
    });

    logger.info('KPI created', { id: kpi.id, name: kpi.name });
    res.status(201).json({ success: true, data: kpi });
  } catch (error: unknown) {
    logger.error('Failed to create KPI', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create KPI' } });
  }
});

// ===================================================================
// POST /api/kpis/:id/calculate — Recalculate KPI
// ===================================================================

router.post('/:id/calculate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const kpi = await prisma.analyticsKpi.findFirst({ where: { id, deletedAt: null } as any });
    if (!kpi) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'KPI not found' } });
    }

    // Simulate recalculation — deterministic based on current timestamp epoch bucket
    // so repeat calls within the same minute return the same value
    const bucket = Math.floor(Date.now() / 60000);
    const newValue = Math.round(((parseInt(id.replace(/-/g, '').slice(0, 6), 16) + bucket) % 10000)) / 100;
    const previousValue = kpi.currentValue;
    let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
    if (previousValue != null) {
      const prev = Number(previousValue);
      if (newValue > prev) trend = 'UP';
      else if (newValue < prev) trend = 'DOWN';
    }

    const updated = await prisma.analyticsKpi.update({
      where: { id },
      data: {
        previousValue: kpi.currentValue,
        currentValue: newValue,
        trend,
        lastCalculated: new Date(),
      },
    });

    logger.info('KPI recalculated', { id, newValue });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to calculate KPI', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate KPI' } });
  }
});

// ===================================================================
// GET /api/kpis/:id — Get KPI by ID
// ===================================================================

router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return;

    const kpi = await prisma.analyticsKpi.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!kpi) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'KPI not found' } });
    }

    res.json({ success: true, data: kpi });
  } catch (error: unknown) {
    logger.error('Failed to get KPI', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get KPI' } });
  }
});

// ===================================================================
// PUT /api/kpis/:id — Update KPI
// ===================================================================

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsKpi.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'KPI not found' } });
    }

    const parsed = kpiUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const updated = await prisma.analyticsKpi.update({
      where: { id },
      data: parsed.data,
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to update KPI', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update KPI' } });
  }
});

// ===================================================================
// DELETE /api/kpis/:id — Soft delete KPI
// ===================================================================

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsKpi.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'KPI not found' } });
    }

    await prisma.analyticsKpi.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'KPI deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete KPI', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete KPI' } });
  }
});

export default router;
