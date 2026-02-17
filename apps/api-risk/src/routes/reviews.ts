import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('risk-reviews');

const likelihoodEnum = z.enum(['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN']);
const consequenceEnum = z.enum(['INSIGNIFICANT', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC']);

const createReviewSchema = z.object({
  riskId: z.string().min(1, 'riskId is required'),
  reviewer: z.string().optional(),
  reviewerName: z.string().optional(),
  scheduledDate: z.string().datetime({ offset: true }).or(z.string().datetime()),
  completedDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  previousScore: z.number().optional(),
  newLikelihood: likelihoodEnum.optional(),
  newConsequence: consequenceEnum.optional(),
  newScore: z.number().optional(),
  findings: z.string().optional(),
  recommendations: z.string().optional(),
  notes: z.string().optional(),
});

const updateReviewSchema = createReviewSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.riskReview.count({ where: { orgId, referenceNumber: { startsWith: `RRV-${year}` } } });
  return `RRV-${year}-${String(count + 1).padStart(4, '0')}`;
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as AuthRequest).user?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.riskReview.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.riskReview.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error: unknown) { logger.error('Failed to fetch reviews', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch reviews' } }); }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await prisma.riskReview.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'review not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) { logger.error('Failed to fetch review', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch review' } }); }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = (req as AuthRequest).user?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const { riskId, reviewer, reviewerName, scheduledDate, completedDate, status, previousScore, newLikelihood, newConsequence, newScore, findings, recommendations, notes } = parsed.data;
    const data = await prisma.riskReview.create({ data: { riskId, reviewer, reviewerName, scheduledDate, completedDate, status, previousScore, newLikelihood, newConsequence, newScore, findings, recommendations, notes, orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id } });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to create review', { error: (error as Error).message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: (error as Error).message } }); }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateReviewSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await prisma.riskReview.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'review not found' } });
    const { riskId, reviewer, reviewerName, scheduledDate, completedDate, status, previousScore, newLikelihood, newConsequence, newScore, findings, recommendations, notes } = parsed.data;
    const data = await prisma.riskReview.update({ where: { id: req.params.id }, data: { riskId, reviewer, reviewerName, scheduledDate, completedDate, status, previousScore, newLikelihood, newConsequence, newScore, findings, recommendations, notes, updatedBy: (req as AuthRequest).user?.id } });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to update review', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: (error as Error).message } }); }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await prisma.riskReview.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'review not found' } });
    await prisma.riskReview.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id } });
    res.json({ success: true, data: { message: 'review deleted successfully' } });
  } catch (error: unknown) { logger.error('Failed to delete review', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: (error as Error).message } }); }
});

export default router;
