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

const paymentIntentSchema = z.object({
  paymentMethod: z.enum(['BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'OTHER']).default('BANK_TRANSFER'),
  notes: z.string().max(1000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// GET / — List invoices for customer
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      portalUserId: auth.user!.id,
      type: 'SALES',
      deletedAt: null,
    };

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
    logger.error('Error listing invoices', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list invoices' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Invoice detail
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const invoice = await prisma.portalOrder.findFirst({
      where: { id: req.params.id, portalUserId: auth.user!.id, deletedAt: null } as any,
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    return res.json({ success: true, data: invoice });
  } catch (error: unknown) {
    logger.error('Error fetching invoice', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch invoice' } });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/pay — Record payment intent
// ---------------------------------------------------------------------------

router.post('/:id/pay', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = paymentIntentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const invoice = await prisma.portalOrder.findFirst({
      where: { id: req.params.id, portalUserId: auth.user!.id, deletedAt: null } as any,
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    const updated = await prisma.portalOrder.update({
      where: { id: req.params.id },
      data: {
        notes: `Payment intent: ${parsed.data.paymentMethod}${parsed.data.notes ? ` - ${parsed.data.notes}` : ''}`,
        updatedAt: new Date(),
      },
    });

    logger.info('Payment intent recorded', { orderId: updated.id, method: parsed.data.paymentMethod });
    return res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Error recording payment', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record payment' } });
  }
});

export default router;
