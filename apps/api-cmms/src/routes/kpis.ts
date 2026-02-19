import { Router, Request, Response, NextFunction } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-cmms');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const kpiCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  metricType: z.enum(['MTBF', 'MTTR', 'OEE', 'AVAILABILITY', 'COMPLIANCE', 'COST']),
  assetId: z.string().trim().uuid().optional().nullable(),
  value: z.number(),
  unit: z.string().trim().min(1).max(50),
  periodStart: z
    .string()
    .trim()
    .min(1)
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  periodEnd: z
    .string()
    .trim()
    .min(1)
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  target: z.number().optional().nullable(),
});

const kpiUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  metricType: z.enum(['MTBF', 'MTTR', 'OEE', 'AVAILABILITY', 'COMPLIANCE', 'COST']).optional(),
  value: z.number().optional(),
  unit: z.string().trim().min(1).max(50).optional(),
  periodStart: z.string().trim().optional(),
  periodEnd: z.string().trim().optional(),
  target: z.number().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

const RESERVED_PATHS = new Set(['dashboard']);

// ===================================================================
// KPIS CRUD
// ===================================================================

// GET /dashboard — KPI dashboard summary
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const kpis = await prisma.cmmsKpi.findMany({
      where: { deletedAt: null },
      orderBy: { periodEnd: 'desc' },
      take: 1000,
    });

    // Group by metric type and get latest
    const latestByType: Record<string, any> = {};
    for (const kpi of kpis) {
      if (!latestByType[kpi.metricType]) {
        latestByType[kpi.metricType] = kpi;
      }
    }

    // Summary stats
    const totalAssets = await prisma.cmmsAsset.count({
      where: { deletedAt: null, status: 'ACTIVE' },
    });
    const openWorkOrders = await prisma.cmmsWorkOrder.count({
      where: { deletedAt: null, status: { in: ['OPEN', 'IN_PROGRESS'] } as any },
    });
    const overdueWorkOrders = await prisma.cmmsWorkOrder.count({
      where: {
        deletedAt: null,
        status: { in: ['OPEN', 'IN_PROGRESS'] } as any,
        scheduledEnd: { lt: new Date() },
      },
    });
    const lowStockParts = await prisma.cmmsPart.count({ where: { deletedAt: null } });

    res.json({
      success: true,
      data: {
        latestKpis: Object.values(latestByType),
        summary: {
          totalAssets,
          openWorkOrders,
          overdueWorkOrders,
          lowStockParts,
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get KPI dashboard', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get KPI dashboard' },
    });
  }
});

// GET / — List KPIs
router.get('/', async (req: Request, res: Response) => {
  try {
    const { metricType, assetId, periodStart, periodEnd } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (metricType) where.metricType = String(metricType);
    if (assetId) where.assetId = String(assetId);
    if (periodStart) where.periodStart = { gte: new Date(String(periodStart)) };
    if (periodEnd) where.periodEnd = { lte: new Date(String(periodEnd)) };

    const [kpis, total] = await Promise.all([
      prisma.cmmsKpi.findMany({
        where,
        skip,
        take: limit,
        include: { asset: { select: { id: true, name: true, code: true } } },
        orderBy: { periodEnd: 'desc' },
      }),
      prisma.cmmsKpi.count({ where }),
    ]);

    res.json({
      success: true,
      data: kpis,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list KPIs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list KPIs' } });
  }
});

// POST / — Create KPI
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = kpiCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.errors },
      });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const kpi = await prisma.cmmsKpi.create({
      data: {
        name: data.name,
        metricType: data.metricType,
        assetId: data.assetId,
        value: new Prisma.Decimal(data.value),
        unit: data.unit,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        target: data.target !== null ? new Prisma.Decimal(data.target) : null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: kpi });
  } catch (error: unknown) {
    logger.error('Failed to create KPI', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create KPI' } });
  }
});

// GET /:id — Get KPI by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const kpi = await prisma.cmmsKpi.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { asset: { select: { id: true, name: true, code: true } } },
    });

    if (!kpi) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'KPI not found' } });
    }

    res.json({ success: true, data: kpi });
  } catch (error: unknown) {
    logger.error('Failed to get KPI', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get KPI' } });
  }
});

// PUT /:id — Update KPI
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = kpiUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.errors },
      });
    }

    const existing = await prisma.cmmsKpi.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'KPI not found' } });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.metricType !== undefined) updateData.metricType = data.metricType;
    if (data.value !== undefined) updateData.value = new Prisma.Decimal(data.value);
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.periodStart !== undefined) updateData.periodStart = new Date(data.periodStart);
    if (data.periodEnd !== undefined) updateData.periodEnd = new Date(data.periodEnd);
    if (data.target !== undefined)
      updateData.target = data.target !== null ? new Prisma.Decimal(data.target) : null;

    const kpi = await prisma.cmmsKpi.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: kpi });
  } catch (error: unknown) {
    logger.error('Failed to update KPI', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update KPI' } });
  }
});

// DELETE /:id — Soft delete KPI
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsKpi.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'KPI not found' } });
    }

    await prisma.cmmsKpi.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'KPI deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete KPI', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete KPI' } });
  }
});

export default router;
