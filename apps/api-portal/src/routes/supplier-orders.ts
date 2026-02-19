import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-portal');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const confirmOrderSchema = z.object({
  notes: z.string().trim().max(2000).optional().nullable(),
  expectedDelivery: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(
      z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
    )
    .optional()
    .nullable(),
});

// ---------------------------------------------------------------------------
// GET / — List purchase orders for supplier
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const where: Record<string, unknown> = {
      portalUserId: auth.user!.id,
      type: 'PURCHASE',
      deletedAt: null,
    };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.portalOrder.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.portalOrder.count({ where }),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing purchase orders', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list purchase orders' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/confirm — Acknowledge/confirm PO
// ---------------------------------------------------------------------------

router.post('/:id/confirm', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = confirmOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      });
    }

    const order = await prisma.portalOrder.findFirst({
      where: {
        id: req.params.id,
        portalUserId: auth.user!.id,
        type: 'PURCHASE',
        deletedAt: null,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Purchase order not found' },
      });
    }

    if (order.status !== 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Only submitted orders can be confirmed' },
      });
    }

    const updated = await prisma.portalOrder.update({
      where: { id: req.params.id },
      data: {
        status: 'CONFIRMED',
        notes: parsed.data.notes ?? order.notes,
        expectedDelivery: parsed.data.expectedDelivery
          ? new Date(parsed.data.expectedDelivery)
          : order.expectedDelivery,
      },
    });

    logger.info('Purchase order confirmed', { id: updated.id, orderNumber: updated.orderNumber });
    return res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Error confirming order', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to confirm order' },
    });
  }
});

export default router;
