import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-iso42001');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

const METRIC_TYPES = ['PERFORMANCE', 'ACCURACY', 'BIAS', 'DRIFT', 'AVAILABILITY', 'LATENCY', 'ERROR_RATE', 'USAGE', 'SAFETY', 'COMPLIANCE', 'OTHER'] as const;
const STATUSES = ['NORMAL', 'WARNING', 'ALERT', 'CRITICAL', 'RESOLVED'] as const;

const createSchema = z.object({
  systemId: z.string().trim().min(1).max(100),
  metricType: z.enum(METRIC_TYPES).default('PERFORMANCE'),
  metricName: z.string().trim().min(1).max(300),
  description: z.string().max(2000).optional().nullable(),
  value: z.number().optional().nullable(),
  unit: z.string().max(100).optional().nullable(),
  threshold: z.number().optional().nullable(),
  thresholdType: z.enum(['ABOVE', 'BELOW', 'RANGE']).optional().nullable(),
  isoClause: z.string().max(200).optional().nullable(),
  measuredBy: z.string().max(200).optional().nullable(),
  measurementDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(STATUSES).optional(),
  alertSent: z.boolean().optional(),
  resolvedAt: z.string().optional().nullable(),
  resolvedBy: z.string().max(200).optional().nullable(),
  resolutionNotes: z.string().max(5000).optional().nullable(),
});

// GET /dashboard — Monitoring dashboard summary (must be before /:id)
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const where: Record<string, unknown> = { deletedAt: null };
    if ((authReq.user as any)?.organisationId) where.organisationId = (authReq.user as any).organisationId;

    const [total, normal, warning, alert, critical, byMetricType, recent] = await Promise.all([
      prisma.aiMonitoring.count({ where }),
      prisma.aiMonitoring.count({ where: { ...where, status: 'NORMAL' } }),
      prisma.aiMonitoring.count({ where: { ...where, status: 'WARNING' } }),
      prisma.aiMonitoring.count({ where: { ...where, status: 'ALERT' } }),
      prisma.aiMonitoring.count({ where: { ...where, status: 'CRITICAL' } }),
      prisma.aiMonitoring.groupBy({ by: ['metricType'], where, _count: { id: true } }),
      prisma.aiMonitoring.findMany({
        where: { ...where, status: { not: 'NORMAL' } },
        take: 10,
        orderBy: { measurementDate: 'desc' },
        select: { id: true, systemId: true, metricName: true, metricType: true, value: true, status: true, measurementDate: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total, normal, warning, alert, critical,
        byMetricType: byMetricType.map((m: Record<string, unknown>) => ({ metricType: m.metricType, count: (m as any)._count.id })),
        recentAlerts: recent,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get monitoring dashboard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get monitoring dashboard' } });
  }
});

// GET /system/:systemId — Monitoring records for a specific AI system
router.get('/system/:systemId', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null, systemId: req.params.systemId };
    if (req.query.status) where.status = req.query.status;
    if (req.query.metricType) where.metricType = req.query.metricType;

    const [items, total] = await Promise.all([
      prisma.aiMonitoring.findMany({ where, skip, take: limit, orderBy: { measurementDate: 'desc' } }),
      prisma.aiMonitoring.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to get system monitoring', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get system monitoring' } });
  }
});

// GET / — List monitoring records
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, metricType, systemId, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status && typeof status === 'string') where.status = status;
    if (metricType && typeof metricType === 'string') where.metricType = metricType;
    if (systemId && typeof systemId === 'string') where.systemId = systemId;
    if (search && typeof search === 'string') {
      where.OR = [
        { metricName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { systemId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.aiMonitoring.findMany({ where, skip, take: limit, orderBy: { measurementDate: 'desc' } }),
      prisma.aiMonitoring.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list monitoring records', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list monitoring records' } });
  }
});

// POST / — Create monitoring record
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;

    // Auto-determine status based on threshold
    let status = 'NORMAL';
    if (parsed.data.value !== null && parsed.data.value !== undefined && parsed.data.threshold !== null && parsed.data.threshold !== undefined) {
      const thresholdType = parsed.data.thresholdType || 'ABOVE';
      if (thresholdType === 'ABOVE' && parsed.data.value > parsed.data.threshold) {
        status = 'WARNING';
      } else if (thresholdType === 'BELOW' && parsed.data.value < parsed.data.threshold) {
        status = 'WARNING';
      }
    }

    const record = await prisma.aiMonitoring.create({
      data: {
        ...parsed.data,
        measurementDate: parsed.data.measurementDate ? new Date(parsed.data.measurementDate) : new Date(),
        status: status as any,
        organisationId: (authReq.user as any)?.organisationId || 'default',
        createdBy: authReq.user?.id || 'system',
      } as any,
    });

    logger.info('AI monitoring record created', { id: record.id, systemId: parsed.data.systemId, status });
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Failed to create monitoring record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create monitoring record' } });
  }
});

// GET /:id — Get monitoring record by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await prisma.aiMonitoring.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!record) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Monitoring record not found' } });
    res.json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Failed to get monitoring record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get monitoring record' } });
  }
});

// PUT /:id — Update monitoring record
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.aiMonitoring.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Monitoring record not found' } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.measurementDate) data.measurementDate = new Date(parsed.data.measurementDate);
    if ((parsed.data as any).resolvedAt) data.resolvedAt = new Date((parsed.data as any).resolvedAt);

    const record = await prisma.aiMonitoring.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Failed to update monitoring record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update monitoring record' } });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aiMonitoring.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Monitoring record not found' } });

    await prisma.aiMonitoring.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete monitoring record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete monitoring record' } });
  }
});

export default router;
