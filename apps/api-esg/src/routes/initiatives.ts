import { randomUUID } from 'crypto';
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

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `ESG-${prefix}-${yy}${mm}-${rand}`;
}

const initiativeCreateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(2000).optional().nullable(),
  category: z.enum(['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE']),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  endDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  budget: z.number().min(0).optional().nullable(),
  actualCost: z.number().min(0).optional().nullable(),
  owner: z.string().trim().max(200).optional().nullable(),
  impact: z.any().optional().nullable(),
});

const initiativeUpdateSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  category: z.enum(['ENVIRONMENTAL', 'SOCIAL', 'GOVERNANCE']).optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  endDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  budget: z.number().min(0).optional().nullable(),
  actualCost: z.number().min(0).optional().nullable(),
  owner: z.string().trim().max(200).optional().nullable(),
  impact: z.any().optional().nullable(),
});

// GET /api/initiatives
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, status, page = '1', limit = '20' } = req.query;
    const skip =
      (Math.max(1, parseInt(page as string, 10) || 1) - 1) *
      Math.max(1, parseInt(limit as string, 10) || 20);
    const take = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    const where: Record<string, any> = { deletedAt: null };
    if (category) where.category = category as string;
    if (status) where.status = status as string;

    const [data, total] = await Promise.all([
      prisma.esgInitiative.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.esgInitiative.count({ where }),
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
    logger.error('Error listing initiatives', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list initiatives' },
    });
  }
});

// POST /api/initiatives
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = initiativeCreateSchema.safeParse(req.body);
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
    const initiative = await prisma.esgInitiative.create({
      data: {
        title: data.title,
        description: data.description || null,
        category: data.category,
        status: data.status || 'PLANNED',
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget !== null ? new Prisma.Decimal(data.budget) : null,
        actualCost: data.actualCost !== null ? new Prisma.Decimal(data.actualCost) : null,
        owner: data.owner || null,
        impact: data.impact || null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: initiative });
  } catch (error: unknown) {
    logger.error('Error creating initiative', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create initiative' },
    });
  }
});

// GET /api/initiatives/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const initiative = await prisma.esgInitiative.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!initiative) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Initiative not found' } });
    }
    res.json({ success: true, data: initiative });
  } catch (error: unknown) {
    logger.error('Error fetching initiative', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch initiative' },
    });
  }
});

// PUT /api/initiatives/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = initiativeUpdateSchema.safeParse(req.body);
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

    const existing = await prisma.esgInitiative.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Initiative not found' } });
    }

    const updateData: Record<string, any> = { ...parsed.data };
    if (updateData.budget !== undefined)
      updateData.budget = updateData.budget !== null ? new Prisma.Decimal(updateData.budget) : null;
    if (updateData.actualCost !== undefined)
      updateData.actualCost =
        updateData.actualCost !== null ? new Prisma.Decimal(updateData.actualCost) : null;
    if (updateData.startDate !== undefined)
      updateData.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
    if (updateData.endDate !== undefined)
      updateData.endDate = updateData.endDate ? new Date(updateData.endDate) : null;

    const initiative = await prisma.esgInitiative.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, data: initiative });
  } catch (error: unknown) {
    logger.error('Error updating initiative', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update initiative' },
    });
  }
});

// DELETE /api/initiatives/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgInitiative.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Initiative not found' } });
    }

    await prisma.esgInitiative.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'Initiative deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting initiative', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete initiative' },
    });
  }
});

export default router;
