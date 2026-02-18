import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-cmms');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateWONumber(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `WO-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const workOrderCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  assetId: z.string().uuid(),
  type: z.enum(['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'EMERGENCY', 'INSPECTION']),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  assignedTo: z.string().max(200).optional().nullable(),
  requestedBy: z.string().max(200).optional().nullable(),
  scheduledStart: z.string().optional().nullable(),
  scheduledEnd: z.string().optional().nullable(),
  laborHours: z.number().optional().nullable(),
  laborCost: z.number().optional().nullable(),
  partsCost: z.number().optional().nullable(),
  failureCode: z.string().max(50).optional().nullable(),
});

const workOrderUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'EMERGENCY', 'INSPECTION']).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  assignedTo: z.string().max(200).optional().nullable(),
  scheduledStart: z.string().optional().nullable(),
  scheduledEnd: z.string().optional().nullable(),
  laborHours: z.number().optional().nullable(),
  laborCost: z.number().optional().nullable(),
  partsCost: z.number().optional().nullable(),
  totalCost: z.number().optional().nullable(),
  completionNotes: z.string().max(2000).optional().nullable(),
  failureCode: z.string().max(50).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const RESERVED_PATHS = new Set(['overdue', 'upcoming']);

// ===================================================================
// WORK ORDERS
// ===================================================================

// GET /overdue — Overdue work orders
router.get('/overdue', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const workOrders = await prisma.cmmsWorkOrder.findMany({
      where: {
        deletedAt: null,
        status: { in: ['OPEN', 'IN_PROGRESS'] } as any,
        scheduledEnd: { lt: now },
      },
      include: { asset: { select: { id: true, name: true, code: true } } },
      orderBy: { scheduledEnd: 'asc' },
    });

    res.json({ success: true, data: workOrders });
  } catch (error: unknown) {
    logger.error('Failed to list overdue work orders', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list overdue work orders' } });
  }
});

// GET /upcoming — Upcoming work orders
router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const days = parseIntParam(req.query.days, 7);
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    const workOrders = await prisma.cmmsWorkOrder.findMany({
      where: {
        deletedAt: null,
        status: { in: ['OPEN'] } as any,
        scheduledStart: { gte: now, lte: future },
      },
      include: { asset: { select: { id: true, name: true, code: true } } },
      orderBy: { scheduledStart: 'asc' },
    });

    res.json({ success: true, data: workOrders });
  } catch (error: unknown) {
    logger.error('Failed to list upcoming work orders', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list upcoming work orders' } });
  }
});

// GET / — List work orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, type, assetId, assignedTo, priority, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = String(status);
    if (type) where.type = String(type);
    if (assetId) where.assetId = String(assetId);
    if (assignedTo) where.assignedTo = { contains: String(assignedTo), mode: 'insensitive' };
    if (priority) where.priority = String(priority);
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { number: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [workOrders, total] = await Promise.all([
      prisma.cmmsWorkOrder.findMany({
        where,
        skip,
        take: limit,
        include: { asset: { select: { id: true, name: true, code: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.cmmsWorkOrder.count({ where }),
    ]);

    res.json({
      success: true,
      data: workOrders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list work orders', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list work orders' } });
  }
});

// POST / — Create work order
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = workOrderCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const workOrder = await prisma.cmmsWorkOrder.create({
      data: {
        number: generateWONumber(),
        title: data.title,
        description: data.description,
        assetId: data.assetId,
        type: data.type,
        priority: data.priority || 'MEDIUM',
        assignedTo: data.assignedTo,
        requestedBy: data.requestedBy,
        scheduledStart: data.scheduledStart ? new Date(data.scheduledStart) : null,
        scheduledEnd: data.scheduledEnd ? new Date(data.scheduledEnd) : null,
        laborHours: data.laborHours != null ? new Prisma.Decimal(data.laborHours) : null,
        laborCost: data.laborCost != null ? new Prisma.Decimal(data.laborCost) : null,
        partsCost: data.partsCost != null ? new Prisma.Decimal(data.partsCost) : null,
        failureCode: data.failureCode,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: workOrder });
  } catch (error: unknown) {
    logger.error('Failed to create work order', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create work order' } });
  }
});

// GET /:id — Get work order by ID
router.get('/:id', async (req: Request, res: Response) => {
  if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');
  try {
    const workOrder = await prisma.cmmsWorkOrder.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: {
        asset: { select: { id: true, name: true, code: true } },
        partUsages: { where: { deletedAt: null } as any, include: { part: true } },
        downtimes: { where: { deletedAt: null } as any },
      },
    });

    if (!workOrder) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    res.json({ success: true, data: workOrder });
  } catch (error: unknown) {
    logger.error('Failed to get work order', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get work order' } });
  }
});

// PUT /:id — Update work order
router.put('/:id', async (req: Request, res: Response) => {
  if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');
  try {
    const parsed = workOrderUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const existing = await prisma.cmmsWorkOrder.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { ...data };
    if (data.scheduledStart !== undefined) updateData.scheduledStart = data.scheduledStart ? new Date(data.scheduledStart) : null;
    if (data.scheduledEnd !== undefined) updateData.scheduledEnd = data.scheduledEnd ? new Date(data.scheduledEnd) : null;
    if (data.laborHours !== undefined) updateData.laborHours = data.laborHours != null ? new Prisma.Decimal(data.laborHours) : null;
    if (data.laborCost !== undefined) updateData.laborCost = data.laborCost != null ? new Prisma.Decimal(data.laborCost) : null;
    if (data.partsCost !== undefined) updateData.partsCost = data.partsCost != null ? new Prisma.Decimal(data.partsCost) : null;
    if (data.totalCost !== undefined) updateData.totalCost = data.totalCost != null ? new Prisma.Decimal(data.totalCost) : null;

    const workOrder = await prisma.cmmsWorkOrder.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: workOrder });
  } catch (error: unknown) {
    logger.error('Failed to update work order', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update work order' } });
  }
});

// DELETE /:id — Soft delete work order
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsWorkOrder.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    await prisma.cmmsWorkOrder.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Work order deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete work order', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete work order' } });
  }
});

// PUT /:id/assign — Assign work order to technician
router.put('/:id/assign', async (req: Request, res: Response) => {
  try {
    const { assignedTo } = req.body;
    if (!assignedTo) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'assignedTo is required' } });
    }

    const existing = await prisma.cmmsWorkOrder.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    const workOrder = await prisma.cmmsWorkOrder.update({
      where: { id: req.params.id },
      data: { assignedTo: String(assignedTo) },
    });

    res.json({ success: true, data: workOrder });
  } catch (error: unknown) {
    logger.error('Failed to assign work order', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to assign work order' } });
  }
});

// PUT /:id/start — Start work order
router.put('/:id/start', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsWorkOrder.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    const workOrder = await prisma.cmmsWorkOrder.update({
      where: { id: req.params.id },
      data: { status: 'IN_PROGRESS', actualStart: new Date() },
    });

    res.json({ success: true, data: workOrder });
  } catch (error: unknown) {
    logger.error('Failed to start work order', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to start work order' } });
  }
});

// PUT /:id/complete — Complete work order
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const { completionNotes, laborHours, partsCost } = req.body;

    const existing = await prisma.cmmsWorkOrder.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    const updateData: Record<string, unknown> = {
      status: 'COMPLETED',
      actualEnd: new Date(),
      completionNotes: completionNotes || null,
    };
    if (laborHours != null) updateData.laborHours = new Prisma.Decimal(laborHours);
    if (partsCost != null) updateData.partsCost = new Prisma.Decimal(partsCost);

    const workOrder = await prisma.cmmsWorkOrder.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: workOrder });
  } catch (error: unknown) {
    logger.error('Failed to complete work order', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete work order' } });
  }
});

// PUT /:id/close — Supervisor sign-off
router.put('/:id/close', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsWorkOrder.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    if (existing.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Work order must be completed before closing' } });
    }

    const authReq = req as AuthRequest;
    const workOrder = await prisma.cmmsWorkOrder.update({
      where: { id: req.params.id },
      data: {
        status: 'CANCELLED',
        completionNotes: existing.completionNotes
          ? `${existing.completionNotes}\n[Closed by ${authReq.user?.email || 'supervisor'}]`
          : `[Closed by ${authReq.user?.email || 'supervisor'}]`,
      },
    });

    res.json({ success: true, data: workOrder });
  } catch (error: unknown) {
    logger.error('Failed to close work order', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to close work order' } });
  }
});

export default router;
