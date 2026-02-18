import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-field-service');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const kpiCreateSchema = z.object({
  technicianId: z.string().uuid().optional().nullable(),
  metricType: z.enum(['FIRST_TIME_FIX', 'RESPONSE_TIME', 'RESOLUTION_TIME', 'CUSTOMER_SATISFACTION', 'UTILIZATION', 'JOBS_COMPLETED']),
  value: z.number(),
  unit: z.string().min(1).max(50),
  periodStart: z.string(),
  periodEnd: z.string(),
  target: z.number().optional().nullable(),
});

const kpiUpdateSchema = z.object({
  metricType: z.enum(['FIRST_TIME_FIX', 'RESPONSE_TIME', 'RESOLUTION_TIME', 'CUSTOMER_SATISFACTION', 'UTILIZATION', 'JOBS_COMPLETED']).optional(),
  value: z.number().optional(),
  unit: z.string().min(1).max(50).optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
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

// ---------------------------------------------------------------------------
// GET / — List KPIs
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { technicianId, metricType, period } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (technicianId) where.technicianId = String(technicianId);
    if (metricType) where.metricType = String(metricType);
    if (period) {
      const periodDate = new Date(String(period));
      where.periodStart = { lte: periodDate };
      where.periodEnd = { gte: periodDate };
    }

    const [data, total] = await Promise.all([
      prisma.fsSvcKpi.findMany({ where, skip, take: limit, orderBy: { periodStart: 'desc' }, include: { technician: true } }),
      prisma.fsSvcKpi.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list KPIs', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list KPIs' } });
  }
});

// ---------------------------------------------------------------------------
// GET /dashboard — KPI dashboard summary
// ---------------------------------------------------------------------------
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const kpis = await prisma.fsSvcKpi.findMany({
      where: {
        deletedAt: null,
        periodStart: { gte: thirtyDaysAgo } as any,
      },
      include: { technician: true },
    });

    // Aggregate by metric type
    const summary: Record<string, { metricType: string; average: number; count: number; unit: string; target: number | null }> = {};

    for (const kpi of kpis) {
      if (!summary[kpi.metricType]) {
        summary[kpi.metricType] = {
          metricType: kpi.metricType,
          average: 0,
          count: 0,
          unit: kpi.unit,
          target: kpi.target ? Number(kpi.target) : null,
        };
      }
      summary[kpi.metricType].count += 1;
      summary[kpi.metricType].average += Number(kpi.value);
    }

    // Calculate averages
    for (const key of Object.keys(summary)) {
      if (summary[key].count > 0) {
        summary[key].average = Math.round((summary[key].average / summary[key].count) * 100) / 100;
      }
    }

    // Job stats
    const [totalJobs, completedJobs, openJobs] = await Promise.all([
      prisma.fsSvcJob.count({ where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } as any } }),
      prisma.fsSvcJob.count({ where: { deletedAt: null, status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } as any } }),
      prisma.fsSvcJob.count({ where: { deletedAt: null, status: { in: ['UNASSIGNED', 'ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'] } as any } }),
    ]);

    res.json({
      success: true,
      data: {
        kpiSummary: Object.values(summary),
        jobStats: { totalJobs, completedJobs, openJobs },
        period: { start: thirtyDaysAgo.toISOString(), end: now.toISOString() },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get KPI dashboard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get KPI dashboard' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create KPI
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = kpiCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.issues } });
    }

    const authReq = req as AuthRequest;
    const data = await prisma.fsSvcKpi.create({
      data: {
        ...parsed.data,
        value: new Prisma.Decimal(parsed.data.value),
        target: parsed.data.target != null ? new Prisma.Decimal(parsed.data.target) : null,
        periodStart: new Date(parsed.data.periodStart),
        periodEnd: new Date(parsed.data.periodEnd),
        createdBy: authReq.user!.id,
      },
    });

    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create KPI', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create KPI' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get KPI
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const data = await prisma.fsSvcKpi.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { technician: true },
    });

    if (!data) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'KPI not found' } });
    }
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get KPI', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get KPI' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update KPI
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcKpi.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'KPI not found' } });
    }

    const parsed = kpiUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.issues } });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.value !== undefined) updateData.value = new Prisma.Decimal(parsed.data.value);
    if (parsed.data.target !== undefined) updateData.target = parsed.data.target != null ? new Prisma.Decimal(parsed.data.target) : null;
    if (parsed.data.periodStart) updateData.periodStart = new Date(parsed.data.periodStart);
    if (parsed.data.periodEnd) updateData.periodEnd = new Date(parsed.data.periodEnd);

    const data = await prisma.fsSvcKpi.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update KPI', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update KPI' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete KPI
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcKpi.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'KPI not found' } });
    }

    await prisma.fsSvcKpi.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'KPI deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete KPI', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete KPI' } });
  }
});

export default router;
