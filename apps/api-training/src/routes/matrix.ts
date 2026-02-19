import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';
const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('training-matrix');

const createSchema = z.object({
  competencyId: z.string().trim().min(1, 'Competency ID is required'),
  employeeId: z.string().trim().min(1, 'Employee ID is required'),
  employeeName: z.string().trim().optional(),
  currentLevel: z.enum(['NOT_STARTED', 'DEVELOPING', 'COMPETENT', 'EXPERT', 'EXPIRED']).optional(),
  targetLevel: z.enum(['NOT_STARTED', 'DEVELOPING', 'COMPETENT', 'EXPERT', 'EXPIRED']).optional(),
  assessedDate: z.string().trim().datetime({ offset: true }).optional().or(z.null()),
  assessedBy: z.string().trim().optional(),
  nextReviewDate: z.string().trim().datetime({ offset: true }).optional().or(z.null()),
  gap: z.boolean().optional(),
  notes: z.string().trim().optional(),
});
const updateSchema = createSchema.partial();

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search) where.employeeName = { contains: search, mode: 'insensitive' };
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.trainMatrix.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.trainMatrix.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: Math.max(1, parseInt(limit, 10) || 20),
        total,
        totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to fetch', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch matrix entries' },
    });
  }
});
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const item = await prisma.trainMatrix.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'matrix entry not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch matrix entry' },
    });
  }
});
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const {
      competencyId,
      employeeId,
      employeeName,
      currentLevel,
      targetLevel,
      assessedDate,
      assessedBy,
      nextReviewDate,
      gap,
      notes,
    } = parsed.data;
    const data = await prisma.trainMatrix.create({
      data: {
        competencyId,
        employeeId,
        employeeName,
        currentLevel,
        targetLevel,
        assessedDate,
        assessedBy,
        nextReviewDate,
        gap,
        notes,
        orgId,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' },
    });
  }
});
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.trainMatrix.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'matrix entry not found' } });
    const {
      competencyId,
      employeeId,
      employeeName,
      currentLevel,
      targetLevel,
      assessedDate,
      assessedBy,
      nextReviewDate,
      gap,
      notes,
    } = parsed.data;
    const data = await prisma.trainMatrix.update({
      where: { id: req.params.id },
      data: {
        competencyId,
        employeeId,
        employeeName,
        currentLevel,
        targetLevel,
        assessedDate,
        assessedBy,
        nextReviewDate,
        gap,
        notes,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.trainMatrix.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'matrix entry not found' } });
    await prisma.trainMatrix.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'matrix entry deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});
export default router;
