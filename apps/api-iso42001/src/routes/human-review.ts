import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-iso42001');
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
  return `AI42-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const reviewCreateSchema = z.object({
  systemId: z.string().min(1).max(100),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional().nullable(),
  aiDecision: z.string().min(1).max(5000),
  aiConfidence: z.number().min(0).max(1).optional().nullable(),
  aiReasoning: z.string().max(10000).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
});

const reviewDecisionSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'ESCALATED']),
  justification: z.string().min(1).max(5000),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET / — List human reviews
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, systemId, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (systemId && typeof systemId === 'string') {
      where.systemId = systemId;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { aiDecision: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.aiHumanReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aiHumanReview.count({ where }),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list human reviews', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list human reviews' } });
  }
});

// GET /pending — List pending reviews for the current user
router.get('/pending', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const reviews = await prisma.aiHumanReview.findMany({
      where: {
        deletedAt: null,
        status: 'PENDING',
        OR: [
          { reviewerUserId: authReq.user?.id } as any,
          { reviewerUserId: null },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    res.json({ success: true, data: reviews });
  } catch (error: unknown) {
    logger.error('Failed to list pending reviews', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list pending reviews' } });
  }
});

// POST / — Create a human review request
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = reviewCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;
    const review = await prisma.aiHumanReview.create({
      data: {
        systemId: parsed.data.systemId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        aiDecision: parsed.data.aiDecision,
        aiConfidence: parsed.data.aiConfidence ?? null,
        aiReasoning: parsed.data.aiReasoning ?? null,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
        metadata: (parsed.data.metadata ?? undefined) as any,
        status: 'PENDING',
        createdBy: authReq.user?.id || 'system',
        organisationId: (authReq.user as any)?.organisationId || 'default',
      },
    });

    logger.info('Human review created', { reviewId: review.id, systemId: parsed.data.systemId });
    res.status(201).json({ success: true, data: review });
  } catch (error: unknown) {
    logger.error('Failed to create human review', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create human review' } });
  }
});

// PUT /:id/decide — Submit a review decision
router.put('/:id/decide', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = reviewDecisionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.aiHumanReview.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Human review not found' } });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_DECIDED', message: 'Review has already been decided' } });
    }

    // Check expiry
    if (existing.expiresAt && new Date() > existing.expiresAt) {
      await prisma.aiHumanReview.update({ where: { id }, data: { status: 'EXPIRED' } });
      return res.status(400).json({ success: false, error: { code: 'EXPIRED', message: 'Review has expired' } });
    }

    const authReq = req as AuthRequest;
    const statusMap: Record<string, string> = { APPROVED: 'APPROVED', REJECTED: 'REJECTED', ESCALATED: 'ESCALATED' };

    const review = await prisma.aiHumanReview.update({
      where: { id },
      data: {
        status: statusMap[parsed.data.decision] as any,
        decision: parsed.data.decision,
        justification: parsed.data.justification,
        reviewerUserId: authReq.user?.id || 'system',
        reviewerName: authReq.user?.email || 'system',
        reviewedAt: new Date(),
      },
    });

    logger.info('Human review decided', { reviewId: id, decision: parsed.data.decision });
    res.json({ success: true, data: review });
  } catch (error: unknown) {
    logger.error('Failed to decide human review', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit review decision' } });
  }
});

// GET /:id — Get human review by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await prisma.aiHumanReview.findFirst({
      where: { id, deletedAt: null } as any,
    });

    if (!review) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Human review not found' } });
    }

    res.json({ success: true, data: review });
  } catch (error: unknown) {
    logger.error('Failed to get human review', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get human review' } });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.aiHumanReview.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Human review not found' } });
    }

    await prisma.aiHumanReview.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info('Human review soft-deleted', { reviewId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete human review', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete human review' } });
  }
});

export default router;
