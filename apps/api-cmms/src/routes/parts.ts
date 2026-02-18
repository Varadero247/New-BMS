import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-cmms');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const partCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  partNumber: z.string().trim().min(1).max(50),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  manufacturer: z.string().max(200).optional().nullable(),
  unitCost: z.number().nonnegative().optional().nullable(),
  quantity: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  maxStock: z.number().int().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  supplier: z.string().max(200).optional().nullable(),
  reorderPoint: z.number().int().optional().nullable(),
  leadTimeDays: z.number().int().optional().nullable(),
});

const partUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  manufacturer: z.string().max(200).optional().nullable(),
  unitCost: z.number().nonnegative().optional().nullable(),
  quantity: z.number().int().min(0).optional(),
  minStock: z.number().int().min(0).optional(),
  maxStock: z.number().int().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  supplier: z.string().max(200).optional().nullable(),
  reorderPoint: z.number().int().optional().nullable(),
  leadTimeDays: z.number().int().optional().nullable(),
});

const partUsageSchema = z.object({
  workOrderId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

const RESERVED_PATHS = new Set(['low-stock']);

// ===================================================================
// PARTS CRUD
// ===================================================================

// GET /low-stock — Parts below reorder point
router.get('/low-stock', async (req: Request, res: Response) => {
  try {
    const parts = await prisma.cmmsPart.findMany({
      where: {
        deletedAt: null,
        OR: [
          { reorderPoint: { not: null } as any },
          { minStock: { gt: 0 } },
        ],
      },
      orderBy: { quantity: 'asc' },
      take: 1000});

    const lowStock = parts.filter((p: Record<string, unknown>) => {
      const threshold = (p.reorderPoint ?? p.minStock) as number;
      return (p.quantity as number) <= threshold;
    });

    res.json({ success: true, data: lowStock });
  } catch (error: unknown) {
    logger.error('Failed to list low-stock parts', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list low-stock parts' } });
  }
});

// GET / — List parts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, lowStock, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (category) where.category = { contains: String(category), mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { partNumber: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [parts, total] = await Promise.all([
      prisma.cmmsPart.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.cmmsPart.count({ where }),
    ]);

    res.json({
      success: true,
      data: parts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list parts', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list parts' } });
  }
});

// POST / — Create part
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = partCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const part = await prisma.cmmsPart.create({
      data: {
        name: data.name,
        partNumber: data.partNumber,
        description: data.description,
        category: data.category,
        manufacturer: data.manufacturer,
        unitCost: data.unitCost != null ? new Prisma.Decimal(data.unitCost) : null,
        quantity: data.quantity ?? 0,
        minStock: data.minStock ?? 0,
        maxStock: data.maxStock,
        location: data.location,
        supplier: data.supplier,
        reorderPoint: data.reorderPoint,
        leadTimeDays: data.leadTimeDays,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: part });
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2002') {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Part number already exists' } });
    }
    logger.error('Failed to create part', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create part' } });
  }
});

// GET /:id — Get part by ID
router.get('/:id', async (req: Request, res: Response) => {
  if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');
  try {
    const part = await prisma.cmmsPart.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { partUsages: { where: { deletedAt: null } as any, take: 20, orderBy: { usedAt: 'desc' } } },
    });

    if (!part) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Part not found' } });
    }

    res.json({ success: true, data: part });
  } catch (error: unknown) {
    logger.error('Failed to get part', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get part' } });
  }
});

// PUT /:id — Update part
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = partUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const existing = await prisma.cmmsPart.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Part not found' } });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { ...data };
    if (data.unitCost !== undefined) updateData.unitCost = data.unitCost != null ? new Prisma.Decimal(data.unitCost) : null;

    const part = await prisma.cmmsPart.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: part });
  } catch (error: unknown) {
    logger.error('Failed to update part', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update part' } });
  }
});

// DELETE /:id — Soft delete part
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsPart.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Part not found' } });
    }

    await prisma.cmmsPart.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Part deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete part', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete part' } });
  }
});

// POST /:id/usage — Record part usage on work order
router.post('/:id/usage', async (req: Request, res: Response) => {
  try {
    const parsed = partUsageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const part = await prisma.cmmsPart.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!part) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Part not found' } });
    }

    if (part.quantity < data.quantity) {
      return res.status(400).json({ success: false, error: { code: 'INSUFFICIENT_STOCK', message: 'Insufficient stock' } });
    }

    const unitCost = part.unitCost ? Number(part.unitCost) : 0;
    const totalCost = unitCost * data.quantity;

    const [usage] = await Promise.all([
      prisma.cmmsPartUsage.create({
        data: {
          workOrderId: data.workOrderId,
          partId: req.params.id,
          quantity: data.quantity,
          unitCost: new Prisma.Decimal(unitCost),
          totalCost: new Prisma.Decimal(totalCost),
          createdBy: authReq.user?.id || 'system',
        },
      }),
      prisma.cmmsPart.update({
        where: { id: req.params.id },
        data: { quantity: part.quantity - data.quantity },
      }),
    ]);

    res.status(201).json({ success: true, data: usage });
  } catch (error: unknown) {
    logger.error('Failed to record part usage', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record part usage' } });
  }
});

export default router;
