import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-esg');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());


const waterCreateSchema = z.object({
  usageType: z.enum(['INTAKE', 'DISCHARGE', 'RECYCLED', 'CONSUMED']),
  source: z.string().trim().max(200).optional().nullable(),
  quantity: z.number().positive(),
  unit: z.string().trim().min(1).max(50),
  periodStart: z
    .string()
    .trim()
    .min(1)
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  periodEnd: z
    .string()
    .trim()
    .min(1)
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  facility: z.string().trim().max(200).optional().nullable(),
});

const waterUpdateSchema = z.object({
  usageType: z.enum(['INTAKE', 'DISCHARGE', 'RECYCLED', 'CONSUMED']).optional(),
  source: z.string().trim().max(200).optional().nullable(),
  quantity: z.number().positive().optional(),
  unit: z.string().trim().min(1).max(50).optional(),
  periodStart: z.string().trim().optional(),
  periodEnd: z.string().trim().optional(),
  facility: z.string().trim().max(200).optional().nullable(),
});

// GET /api/water
router.get('/', async (req: Request, res: Response) => {
  try {
    const { usageType, page = '1', limit = '20' } = req.query;
    const skip =
      (Math.max(1, parseInt(page as string, 10) || 1) - 1) *
      Math.max(1, parseInt(limit as string, 10) || 20);
    const take = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    const where: Record<string, any> = { deletedAt: null };
    if (usageType) where.usageType = usageType as string;

    const [data, total] = await Promise.all([
      prisma.esgWater.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.esgWater.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, parseInt(page as string, 10) || 1),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: unknown) {
    logger.error('Error listing water records', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list water records' },
    });
  }
});

// POST /api/water
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = waterCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.issues,
        },
      });
    }

    const data = parsed.data;
    const water = await prisma.esgWater.create({
      data: {
        usageType: data.usageType,
        source: data.source || null,
        quantity: new Prisma.Decimal(data.quantity),
        unit: data.unit,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        facility: data.facility || null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: water });
  } catch (error: unknown) {
    logger.error('Error creating water record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create water record' },
    });
  }
});

// GET /api/water/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const water = await prisma.esgWater.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!water) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Water record not found' } });
    }
    res.json({ success: true, data: water });
  } catch (error: unknown) {
    logger.error('Error fetching water record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch water record' },
    });
  }
});

// PUT /api/water/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = waterUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.issues,
        },
      });
    }

    const existing = await prisma.esgWater.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Water record not found' } });
    }

    const updateData: Record<string, any> = { ...parsed.data };
    if (updateData.quantity !== undefined)
      updateData.quantity = new Prisma.Decimal(updateData.quantity);
    if (updateData.periodStart) updateData.periodStart = new Date(updateData.periodStart);
    if (updateData.periodEnd) updateData.periodEnd = new Date(updateData.periodEnd);

    const water = await prisma.esgWater.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: water });
  } catch (error: unknown) {
    logger.error('Error updating water record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update water record' },
    });
  }
});

// DELETE /api/water/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgWater.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Water record not found' } });
    }

    await prisma.esgWater.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Water record deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting water record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete water record' },
    });
  }
});

export default router;
