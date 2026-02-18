import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-portal');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

const markReadSchema = z.object({
  isRead: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List notifications
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;
    const isRead = req.query.isRead as string | undefined;

    const where: Record<string, unknown> = {
      portalUserId: auth.user!.id,
      deletedAt: null,
    };
    if (isRead === 'true') where.isRead = true;
    if (isRead === 'false') where.isRead = false;

    const [items, total] = await Promise.all([
      prisma.portalNotification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.portalNotification.count({ where }),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing notifications', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list notifications' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /read-all — Mark all as read
// ---------------------------------------------------------------------------

router.put('/read-all', async (req: Request, res: Response) => {
  try {
    const parsed = markReadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0]?.message || 'Invalid input',
        },
      });
    }

    const auth = req as AuthRequest;

    const result = await prisma.portalNotification.updateMany({
      where: { portalUserId: auth.user!.id, isRead: false, deletedAt: null } as any,
      data: { isRead: true, readAt: new Date() },
    });

    logger.info('All notifications marked as read', { count: result.count });
    return res.json({ success: true, data: { updated: result.count } });
  } catch (error: unknown) {
    logger.error('Error marking all as read', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to mark all as read' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/read — Mark single notification as read
// ---------------------------------------------------------------------------

router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const parsed = markReadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0]?.message || 'Invalid input',
        },
      });
    }

    const auth = req as AuthRequest;

    const notification = await prisma.portalNotification.findFirst({
      where: { id: req.params.id, portalUserId: auth.user!.id, deletedAt: null } as any,
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Notification not found' } });
    }

    const updated = await prisma.portalNotification.update({
      where: { id: req.params.id },
      data: { isRead: true, readAt: new Date() },
    });

    logger.info('Notification marked as read', { id: updated.id });
    return res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Error marking notification as read', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to mark as read' },
    });
  }
});

export default router;
