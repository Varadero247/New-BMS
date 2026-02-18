import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-portal');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `PTL-${prefix}-${yy}${mm}-${rand}`;
}

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

const orderCreateSchema = z.object({
  portalUserId: z.string().uuid(),
  type: z.enum(['PURCHASE', 'SALES', 'RETURN']),
  totalAmount: z.number().positive(),
  currency: z.string().length(3).default('GBP'),
  items: z.any(),
  shippingAddress: z.any().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  expectedDelivery: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});

const orderUpdateSchema = z.object({
  totalAmount: z.number().positive().optional(),
  items: z.any().optional(),
  shippingAddress: z.any().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  expectedDelivery: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});

const statusUpdateSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED', 'CONFIRMED', 'IN_PROGRESS', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

// ---------------------------------------------------------------------------
// GET / — List orders
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (type) where.type = type;

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
    logger.error('Error listing orders', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list orders' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create order
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = orderCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const data = parsed.data;
    const orderNumber = generateReference('ORD');

    const order = await prisma.portalOrder.create({
      data: {
        orderNumber,
        portalUserId: data.portalUserId,
        type: data.type,
        status: 'DRAFT',
        totalAmount: new Prisma.Decimal(data.totalAmount),
        currency: data.currency,
        items: data.items,
        shippingAddress: data.shippingAddress ?? undefined,
        notes: data.notes ?? null,
        expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery) : null,
        createdBy: auth.user!.id,
      },
    });

    logger.info('Order created', { id: order.id, orderNumber });
    return res.status(201).json({ success: true, data: order });
  } catch (error: unknown) {
    logger.error('Error creating order', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create order' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Order detail
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const order = await prisma.portalOrder.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    return res.json({ success: true, data: order });
  } catch (error: unknown) {
    logger.error('Error fetching order', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch order' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update order
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = orderUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const existing = await prisma.portalOrder.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.totalAmount) {
      updateData.totalAmount = new Prisma.Decimal(updateData.totalAmount as any);
    }
    if (updateData.expectedDelivery) {
      updateData.expectedDelivery = new Date(updateData.expectedDelivery as string);
    }

    const updated = await prisma.portalOrder.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logger.info('Order updated', { id: updated.id });
    return res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Error updating order', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update order' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/status — Update order status
// ---------------------------------------------------------------------------

router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const parsed = statusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const existing = await prisma.portalOrder.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    const updated = await prisma.portalOrder.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });

    logger.info('Order status updated', { id: updated.id, status: parsed.data.status });
    return res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Error updating order status', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update order status' } });
  }
});

export default router;
