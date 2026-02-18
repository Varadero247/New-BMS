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

const conditionEnum = z.enum(['ABOVE', 'BELOW', 'EQUALS', 'CHANGE_PERCENT', 'ANOMALY']);
const alertStatusEnum = z.enum(['ACTIVE', 'TRIGGERED', 'ACKNOWLEDGED', 'RESOLVED']);

const alertCreateSchema = z.object({
  name: z.string().min(1).max(200),
  metric: z.string().min(1).max(200),
  condition: conditionEnum,
  threshold: z.number(),
  status: alertStatusEnum.optional().default('ACTIVE'),
  notificationChannels: z.array(z.string()).optional().nullable(),
  cooldownMinutes: z.number().int().min(1).optional().default(60),
});

const alertUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  metric: z.string().min(1).max(200).optional(),
  condition: conditionEnum.optional(),
  threshold: z.number().optional(),
  status: alertStatusEnum.optional(),
  notificationChannels: z.array(z.string()).optional().nullable(),
  cooldownMinutes: z.number().int().min(1).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

const RESERVED_PATHS = new Set(['triggered']);

// ===================================================================
// GET /api/alerts/triggered — Currently triggered alerts
// ===================================================================

router.get('/triggered', async (req: Request, res: Response) => {
  try {
    const alerts = await prisma.analyticsAlert.findMany({
      where: { status: 'TRIGGERED', deletedAt: null } as any,
      orderBy: { triggeredAt: 'desc' },
      take: Math.min(Number(req.query.limit) || 50, 200),
      skip: Number(req.query.offset) || 0,
    });

    res.json({ success: true, data: alerts });
  } catch (error: unknown) {
    logger.error('Failed to get triggered alerts', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get triggered alerts' } });
  }
});

// ===================================================================
// GET /api/alerts — List alerts
// ===================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, metric, condition, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (typeof status === 'string' && status.length > 0) where.status = status;
    if (typeof metric === 'string' && metric.length > 0) where.metric = { contains: metric, mode: 'insensitive' };
    if (typeof condition === 'string' && condition.length > 0) where.condition = condition;
    if (typeof search === 'string' && search.length > 0) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [alerts, total] = await Promise.all([
      prisma.analyticsAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.analyticsAlert.count({ where }),
    ]);

    res.json({
      success: true,
      data: alerts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list alerts', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list alerts' } });
  }
});

// ===================================================================
// POST /api/alerts — Create alert
// ===================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = alertCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const data = parsed.data;
    const alert = await prisma.analyticsAlert.create({
      data: {
        name: data.name,
        metric: data.metric,
        condition: data.condition,
        threshold: data.threshold,
        status: data.status,
        notificationChannels: (data.notificationChannels || null) as any,
        cooldownMinutes: data.cooldownMinutes,
        createdBy: authReq.user!.id,
      },
    });

    logger.info('Alert created', { id: alert.id, name: alert.name });
    res.status(201).json({ success: true, data: alert });
  } catch (error: unknown) {
    logger.error('Failed to create alert', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create alert' } });
  }
});

// ===================================================================
// PUT /api/alerts/:id/acknowledge — Acknowledge alert
// ===================================================================

router.put('/:id/acknowledge', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    const alert = await prisma.analyticsAlert.findFirst({ where: { id, deletedAt: null } as any });
    if (!alert) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } });
    }

    if (alert.status !== 'TRIGGERED') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Alert is not in TRIGGERED state' } });
    }

    const updated = await prisma.analyticsAlert.update({
      where: { id },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedBy: authReq.user!.id,
      },
    });

    logger.info('Alert acknowledged', { id });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to acknowledge alert', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to acknowledge alert' } });
  }
});

// ===================================================================
// PUT /api/alerts/:id/resolve — Resolve alert
// ===================================================================

router.put('/:id/resolve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const alert = await prisma.analyticsAlert.findFirst({ where: { id, deletedAt: null } as any });
    if (!alert) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } });
    }

    if (alert.status === 'RESOLVED') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Alert is already resolved' } });
    }

    const updated = await prisma.analyticsAlert.update({
      where: { id },
      data: { status: 'RESOLVED' },
    });

    logger.info('Alert resolved', { id });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to resolve alert', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to resolve alert' } });
  }
});

// ===================================================================
// GET /api/alerts/:id — Get alert by ID
// ===================================================================

router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return;

    const alert = await prisma.analyticsAlert.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!alert) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } });
    }

    res.json({ success: true, data: alert });
  } catch (error: unknown) {
    logger.error('Failed to get alert', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get alert' } });
  }
});

// ===================================================================
// PUT /api/alerts/:id — Update alert
// ===================================================================

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsAlert.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } });
    }

    const parsed = alertUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const updated = await prisma.analyticsAlert.update({
      where: { id },
      data: parsed.data as any,
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to update alert', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update alert' } });
  }
});

// ===================================================================
// DELETE /api/alerts/:id — Soft delete alert
// ===================================================================

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsAlert.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } });
    }

    await prisma.analyticsAlert.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Alert deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete alert', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete alert' } });
  }
});

export default router;
