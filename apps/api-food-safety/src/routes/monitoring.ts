import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-food-safety');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const monitoringCreateSchema = z.object({
  ccpId: z.string().trim().uuid(),
  monitoredBy: z.string().max(200).optional().nullable(),
  monitoredAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  value: z.string().trim().min(1).max(200),
  unit: z.string().max(50).optional().nullable(),
  withinLimits: z.boolean(),
  deviation: z.string().max(2000).optional().nullable(),
  correctiveActionTaken: z.string().max(2000).optional().nullable(),
  verifiedBy: z.string().max(200).optional().nullable(),
  verifiedAt: z.string().datetime({ offset: true }).optional().nullable(),
});

const monitoringUpdateSchema = z.object({
  monitoredBy: z.string().max(200).optional().nullable(),
  monitoredAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  value: z.string().trim().min(1).max(200).optional(),
  unit: z.string().max(50).optional().nullable(),
  withinLimits: z.boolean().optional(),
  deviation: z.string().max(2000).optional().nullable(),
  correctiveActionTaken: z.string().max(2000).optional().nullable(),
  verifiedBy: z.string().max(200).optional().nullable(),
  verifiedAt: z.string().datetime({ offset: true }).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET /api/monitoring/deviations
// ---------------------------------------------------------------------------
router.get('/deviations', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null, withinLimits: false };

    const [data, total] = await Promise.all([
      prisma.fsMonitoringRecord.findMany({ where, skip, take: limit, orderBy: { monitoredAt: 'desc' }, include: { ccp: true } }),
      prisma.fsMonitoringRecord.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error fetching deviations', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch deviations' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/monitoring
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { ccpId, withinLimits, dateFrom, dateTo } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (ccpId) where.ccpId = String(ccpId);
    if (withinLimits !== undefined) where.withinLimits = withinLimits === 'true';
    if (dateFrom || dateTo) {
      (where as any).monitoredAt = {};
      if (dateFrom) (where as any).monitoredAt.gte = new Date(String(dateFrom));
      if (dateTo) (where as any).monitoredAt.lte = new Date(String(dateTo));
    }

    const [data, total] = await Promise.all([
      prisma.fsMonitoringRecord.findMany({ where, skip, take: limit, orderBy: { monitoredAt: 'desc' }, include: { ccp: true } }),
      prisma.fsMonitoringRecord.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing monitoring records', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list monitoring records' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/monitoring
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = monitoringCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const user = (req as AuthRequest).user;

    const record = await prisma.fsMonitoringRecord.create({
      data: {
        ...body,
        monitoredAt: new Date(body.monitoredAt),
        verifiedAt: body.verifiedAt ? new Date(body.verifiedAt) : null,
        createdBy: user?.id || 'system',
      },
    });

    logger.info('Monitoring record created', { id: record.id });
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Error creating monitoring record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create monitoring record' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/monitoring/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await prisma.fsMonitoringRecord.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { ccp: true },
    });

    if (!record) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Monitoring record not found' } });
    }

    res.json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Error fetching monitoring record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch monitoring record' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/monitoring/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsMonitoringRecord.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Monitoring record not found' } });
    }

    const parsed = monitoringUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const updateData: Record<string, unknown> = { ...body };
    if (body.monitoredAt) updateData.monitoredAt = new Date(body.monitoredAt);
    if (body.verifiedAt) updateData.verifiedAt = new Date(body.verifiedAt);

    const record = await prisma.fsMonitoringRecord.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logger.info('Monitoring record updated', { id: record.id });
    res.json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Error updating monitoring record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update monitoring record' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/monitoring/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsMonitoringRecord.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Monitoring record not found' } });
    }

    await prisma.fsMonitoringRecord.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Monitoring record deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Monitoring record deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting monitoring record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete monitoring record' } });
  }
});

export default router;
