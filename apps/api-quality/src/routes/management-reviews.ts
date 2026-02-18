import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-quality');
const router: Router = Router();
router.use(authenticate);

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-MRV';
  const count = await prisma.qualManagementReview.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

const createSchema = z.object({
  title: z.string().min(1).max(300),
  meetingDate: z.string(),
  chairperson: z.string().max(200).optional().nullable(),
  attendees: z.string().max(5000).optional().nullable(),
  // §9.3.2 inputs
  previousActions: z.string().max(10000).optional().nullable(),
  changesInContext: z.string().max(5000).optional().nullable(),
  customerFeedback: z.string().max(5000).optional().nullable(),
  qualityObjectives: z.string().max(5000).optional().nullable(),
  processPerformance: z.string().max(5000).optional().nullable(),
  nonconformanceSummary: z.string().max(5000).optional().nullable(),
  auditResults: z.string().max(5000).optional().nullable(),
  supplierPerformance: z.string().max(5000).optional().nullable(),
  resourceAdequacy: z.string().max(5000).optional().nullable(),
  riskAssessment: z.string().max(5000).optional().nullable(),
  // §9.3.3 outputs
  improvements: z.string().max(5000).optional().nullable(),
  resourceNeeds: z.string().max(5000).optional().nullable(),
  decisions: z.string().max(5000).optional().nullable(),
  actionItems: z.string().max(5000).optional().nullable(),
  nextReviewDate: z.string().optional().nullable(),
  minutes: z.string().max(50000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

const updateSchema = createSchema.partial();

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// GET /
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status && typeof status === 'string') where.status = status;
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { chairperson: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.qualManagementReview.findMany({ where, skip, take: limit, orderBy: { meetingDate: 'desc' } }),
      prisma.qualManagementReview.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list management reviews', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list management reviews' } });
  }
});

// POST /
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;
    const referenceNumber = await generateRefNumber();

    const item = await prisma.qualManagementReview.create({
      data: {
        referenceNumber,
        ...parsed.data,
        meetingDate: new Date(parsed.data.meetingDate),
        nextReviewDate: parsed.data.nextReviewDate ? new Date(parsed.data.nextReviewDate) : null,
        status: 'PLANNED',
        organisationId: (authReq.user as any)?.organisationId || 'default',
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to create management review', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create management review' } });
  }
});

// PUT /:id/complete — Complete the review
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.qualManagementReview.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Management review not found' } });

    if (existing.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_COMPLETED', message: 'Review is already completed' } });
    }

    const item = await prisma.qualManagementReview.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED' },
    });

    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to complete management review', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete management review' } });
  }
});

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.qualManagementReview.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Management review not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to get management review', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get management review' } });
  }
});

// PUT /:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.qualManagementReview.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Management review not found' } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.meetingDate) data.meetingDate = new Date(parsed.data.meetingDate);
    if (parsed.data.nextReviewDate) data.nextReviewDate = new Date(parsed.data.nextReviewDate);

    const item = await prisma.qualManagementReview.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to update management review', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update management review' } });
  }
});

// DELETE /:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.qualManagementReview.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Management review not found' } });

    await prisma.qualManagementReview.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete management review', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete management review' } });
  }
});

export default router;
