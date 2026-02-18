import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-cmms');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateRequestNumber(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `MR-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const requestCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  requestedBy: z.string().trim().min(1).max(200),
  assetId: z.string().trim().uuid().optional().nullable(),
  locationId: z.string().trim().uuid().optional().nullable(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

const requestUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['NEW', 'APPROVED', 'REJECTED', 'CONVERTED']).optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ===================================================================
// REQUESTS CRUD
// ===================================================================

// GET / — List requests
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, priority, assetId, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = String(status);
    if (priority) where.priority = String(priority);
    if (assetId) where.assetId = String(assetId);
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { number: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.cmmsRequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          asset: { select: { id: true, name: true, code: true } },
          location: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.cmmsRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list requests', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list requests' },
    });
  }
});

// POST / — Create request
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = requestCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.errors },
      });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const request = await prisma.cmmsRequest.create({
      data: {
        number: generateRequestNumber(),
        title: data.title,
        description: data.description,
        requestedBy: data.requestedBy,
        assetId: data.assetId,
        locationId: data.locationId,
        priority: data.priority || 'MEDIUM',
        notes: data.notes,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: request });
  } catch (error: unknown) {
    logger.error('Failed to create request', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create request' },
    });
  }
});

// GET /:id — Get request by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const request = await prisma.cmmsRequest.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: {
        asset: { select: { id: true, name: true, code: true } },
        location: { select: { id: true, name: true, code: true } },
      },
    });

    if (!request) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }

    res.json({ success: true, data: request });
  } catch (error: unknown) {
    logger.error('Failed to get request', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get request' },
    });
  }
});

// PUT /:id — Update request
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = requestUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.errors },
      });
    }

    const existing = await prisma.cmmsRequest.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }

    const request = await prisma.cmmsRequest.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json({ success: true, data: request });
  } catch (error: unknown) {
    logger.error('Failed to update request', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update request' },
    });
  }
});

// PUT /:id/approve — Approve request and convert to work order
router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsRequest.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }

    if (existing.status !== 'NEW') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Only NEW requests can be approved' },
      });
    }

    const authReq = req as AuthRequest;

    // Create work order from request
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
    const woNumber = `WO-${yy}${mm}-${rand}`;

    let workOrder = null;
    if (existing.assetId) {
      workOrder = await prisma.cmmsWorkOrder.create({
        data: {
          number: woNumber,
          title: existing.title,
          description: existing.description,
          assetId: existing.assetId,
          type: 'CORRECTIVE',
          priority: existing.priority,
          requestedBy: existing.requestedBy,
          createdBy: authReq.user?.id || 'system',
        },
      });
    }

    const request = await prisma.cmmsRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        workOrderId: workOrder?.id || null,
      },
    });

    res.json({ success: true, data: { request, workOrder } });
  } catch (error: unknown) {
    logger.error('Failed to approve request', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to approve request' },
    });
  }
});

// DELETE /:id — Soft delete request
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsRequest.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Request not found' } });
    }

    await prisma.cmmsRequest.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'Request deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete request', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete request' },
    });
  }
});

export default router;
