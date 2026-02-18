import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-energy');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const alertCreateSchema = z.object({
  meterId: z.string().uuid().optional().nullable(),
  type: z.enum(['OVERCONSUMPTION', 'ANOMALY', 'THRESHOLD_BREACH', 'EQUIPMENT_FAULT', 'BILLING_DISCREPANCY']),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional().default('MEDIUM'),
  message: z.string().min(1).max(1000),
  details: z.any().optional().nullable(),
});

const alertUpdateSchema = z.object({
  type: z.enum(['OVERCONSUMPTION', 'ANOMALY', 'THRESHOLD_BREACH', 'EQUIPMENT_FAULT', 'BILLING_DISCREPANCY']).optional(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  message: z.string().min(1).max(1000).optional(),
  details: z.any().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List alerts
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, severity, acknowledged } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (type && typeof type === 'string') {
      where.type = type;
    }
    if (severity && typeof severity === 'string') {
      where.severity = severity;
    }
    if (acknowledged !== undefined) {
      where.acknowledged = acknowledged === 'true';
    }

    const [alerts, total] = await Promise.all([
      prisma.energyAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          meter: { select: { id: true, name: true, code: true, type: true } },
        },
      }),
      prisma.energyAlert.count({ where }),
    ]);

    res.json({
      success: true,
      data: alerts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list alerts', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to list alerts' });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create alert
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = alertCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    // Validate meter if provided
    if (data.meterId) {
      const meter = await prisma.energyMeter.findFirst({ where: { id: data.meterId, deletedAt: null } as any });
      if (!meter) {
        return res.status(400).json({ success: false, error: 'Meter not found' });
      }
    }

    const alert = await prisma.energyAlert.create({
      data: {
        meterId: data.meterId ?? null,
        type: data.type,
        severity: data.severity,
        message: data.message,
        details: data.details ?? null,
        createdBy: authReq.user?.id || 'system',
      },
      include: {
        meter: { select: { id: true, name: true, code: true } },
      },
    });

    logger.info('Alert created', { alertId: alert.id, type: data.type, severity: data.severity });
    res.status(201).json({ success: true, data: alert });
  } catch (error: unknown) {
    logger.error('Failed to create alert', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to create alert' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get alert
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const alert = await prisma.energyAlert.findFirst({
      where: { id, deletedAt: null } as any,
      include: {
        meter: { select: { id: true, name: true, code: true, type: true } },
      },
    });

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    res.json({ success: true, data: alert });
  } catch (error: unknown) {
    logger.error('Failed to get alert', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to get alert' });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update alert
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = alertUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.energyAlert.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    const alert = await prisma.energyAlert.update({
      where: { id },
      data: parsed.data,
    });

    logger.info('Alert updated', { alertId: id });
    res.json({ success: true, data: alert });
  } catch (error: unknown) {
    logger.error('Failed to update alert', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to update alert' });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete alert
// ---------------------------------------------------------------------------

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.energyAlert.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    await prisma.energyAlert.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info('Alert soft-deleted', { alertId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete alert', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to delete alert' });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/acknowledge — Acknowledge alert
// ---------------------------------------------------------------------------

router.put('/:id/acknowledge', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const authReq = req as AuthRequest;

    const existing = await prisma.energyAlert.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    if (existing.acknowledged) {
      return res.status(400).json({ success: false, error: 'Alert is already acknowledged' });
    }

    const alert = await prisma.energyAlert.update({
      where: { id },
      data: {
        acknowledged: true,
        acknowledgedBy: authReq.user?.id || 'system',
        acknowledgedAt: new Date(),
      },
    });

    logger.info('Alert acknowledged', { alertId: id });
    res.json({ success: true, data: alert });
  } catch (error: unknown) {
    logger.error('Failed to acknowledge alert', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to acknowledge alert' });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/resolve — Resolve alert
// ---------------------------------------------------------------------------

router.put('/:id/resolve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.energyAlert.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    if (existing.resolvedAt) {
      return res.status(400).json({ success: false, error: 'Alert is already resolved' });
    }

    const alert = await prisma.energyAlert.update({
      where: { id },
      data: {
        resolvedAt: new Date(),
        acknowledged: true,
        acknowledgedAt: existing.acknowledgedAt || new Date(),
        acknowledgedBy: existing.acknowledgedBy || ((req as AuthRequest).user?.id || 'system'),
      },
    });

    logger.info('Alert resolved', { alertId: id });
    res.json({ success: true, data: alert });
  } catch (error: unknown) {
    logger.error('Failed to resolve alert', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to resolve alert' });
  }
});

export default router;
