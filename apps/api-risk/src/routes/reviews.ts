import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';
const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('risk-reviews');

const likelihoodEnum = z.enum(['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN']);
const consequenceEnum = z.enum(['INSIGNIFICANT', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC']);

const createReviewSchema = z.object({
  riskId: z.string().trim().min(1, 'riskId is required'),
  reviewer: z.string().trim().optional(),
  reviewerName: z.string().trim().optional(),
  scheduledDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(z.string().trim().datetime({ offset: true })),
  completedDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .optional()
    .or(z.string().trim().datetime({ offset: true }).optional()),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  previousScore: z.number().nonnegative().optional(),
  newLikelihood: likelihoodEnum.optional(),
  newConsequence: consequenceEnum.optional(),
  newScore: z.number().nonnegative().optional(),
  findings: z.string().trim().optional(),
  recommendations: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const updateReviewSchema = createReviewSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.riskReview.count({
    where: { orgId, referenceNumber: { startsWith: `RRV-${year}` } },
  });
  return `RRV-${year}-${String(count + 1).padStart(4, '0')}`;
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search)
      where.OR = [
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { findings: { contains: search, mode: 'insensitive' } },
      ];
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.riskReview.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.riskReview.count({ where }),
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
    logger.error('Failed to fetch reviews', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch reviews' },
    });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const item = await prisma.riskReview.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'review not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to fetch review', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch review' },
    });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const {
      riskId,
      reviewer,
      reviewerName,
      scheduledDate,
      completedDate,
      status,
      previousScore,
      newLikelihood,
      newConsequence,
      newScore,
      findings,
      recommendations,
      notes,
    } = parsed.data;
    const data = await prisma.riskReview.create({
      data: {
        riskId,
        reviewer,
        reviewerName,
        scheduledDate,
        completedDate,
        status,
        previousScore,
        newLikelihood,
        newConsequence,
        newScore,
        findings,
        recommendations,
        notes,
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create review', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateReviewSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.riskReview.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'review not found' } });
    const {
      riskId,
      reviewer,
      reviewerName,
      scheduledDate,
      completedDate,
      status,
      previousScore,
      newLikelihood,
      newConsequence,
      newScore,
      findings,
      recommendations,
      notes,
    } = parsed.data;
    const data = await prisma.riskReview.update({
      where: { id: req.params.id },
      data: {
        riskId,
        reviewer,
        reviewerName,
        scheduledDate,
        completedDate,
        status,
        previousScore,
        newLikelihood,
        newConsequence,
        newScore,
        findings,
        recommendations,
        notes,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update review', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.riskReview.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'review not found' } });
    await prisma.riskReview.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'review deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete review', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } });
  }
});

export default router;
