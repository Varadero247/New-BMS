import { Router } from 'express';
import type { Router as IRouter } from 'express';
import { z } from 'zod';
import { prisma } from '@ims/database';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/error-handler';

const router: IRouter = Router();

const createAlertSchema = z.object({
  buildingId: z.string(),
  deviceId: z.string().optional(),
  type: z.enum(['SYSTEM', 'DEVICE', 'SECURITY', 'ENVIRONMENTAL', 'MAINTENANCE', 'ENERGY']),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL', 'EMERGENCY']),
  title: z.string().min(1),
  message: z.string().min(1),
  data: z.record(z.unknown()).optional(),
});

// List all alerts
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 50, buildingId, status, severity, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (buildingId) where.buildingId = buildingId;
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (type) where.type = type;

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          building: { select: { id: true, name: true } },
          device: { select: { id: true, name: true } },
        },
      }),
      prisma.alert.count({ where }),
    ]);

    res.json({
      success: true,
      data: alerts,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get alert stats
router.get('/stats', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const [total, active, critical, resolved] = await Promise.all([
      prisma.alert.count(),
      prisma.alert.count({ where: { status: 'ACTIVE' } }),
      prisma.alert.count({ where: { status: 'ACTIVE', severity: 'CRITICAL' } }),
      prisma.alert.count({
        where: {
          status: 'RESOLVED',
          resolvedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);

    res.json({
      success: true,
      data: { total, active, critical, resolved },
    });
  } catch (error) {
    next(error);
  }
});

// Get single alert
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        building: { select: { id: true, name: true } },
        device: { select: { id: true, name: true, type: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!alert) {
      throw new AppError(404, 'NOT_FOUND', 'Alert not found');
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
});

// Create alert
router.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'MANAGER', 'TECHNICIAN'),
  validate(createAlertSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const alert = await prisma.alert.create({
        data: {
          ...req.body,
          userId: req.user!.id,
          status: 'ACTIVE',
        },
        include: {
          building: { select: { id: true, name: true } },
          device: { select: { id: true, name: true } },
        },
      });

      res.status(201).json({
        success: true,
        data: alert,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Acknowledge alert
router.post('/:id/acknowledge', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
        userId: req.user!.id,
      },
    });

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
});

// Resolve alert
router.post('/:id/resolve', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        userId: req.user!.id,
      },
    });

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
});

// Dismiss alert
router.post('/:id/dismiss', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status: 'DISMISSED',
        userId: req.user!.id,
      },
    });

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
