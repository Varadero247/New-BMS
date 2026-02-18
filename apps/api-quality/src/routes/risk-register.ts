import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-quality');
const router: Router = Router();
router.use(authenticate);

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-RR';
  const count = await prisma.qualRiskRegister.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

// Calculate risk score: likelihood (1-5) * impact (1-5)
const LIKELIHOOD_SCORES: Record<string, number> = { RARE: 1, UNLIKELY: 2, POSSIBLE: 3, LIKELY: 4, ALMOST_CERTAIN: 5 };
const IMPACT_SCORES: Record<string, number> = { NEGLIGIBLE: 1, MINOR: 2, MODERATE: 3, MAJOR: 4, CATASTROPHIC: 5 };

function calcRiskScore(likelihood: string, impact: string): number {
  return (LIKELIHOOD_SCORES[likelihood] || 3) * (IMPACT_SCORES[impact] || 3);
}

const createSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().min(1).max(5000),
  category: z.string().max(200).optional().nullable(),
  source: z.string().max(200).optional().nullable(),
  isoClause: z.string().max(200).optional().nullable(),
  department: z.string().max(200).optional().nullable(),
  owner: z.string().max(200).optional().nullable(),
  likelihood: z.enum(['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN']).default('POSSIBLE'),
  impact: z.enum(['NEGLIGIBLE', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC']).default('MODERATE'),
  residualLikelihood: z.enum(['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN']).optional().nullable(),
  residualImpact: z.enum(['NEGLIGIBLE', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC']).optional().nullable(),
  treatmentStrategy: z.string().max(200).optional().nullable(),
  controls: z.string().max(5000).optional().nullable(),
  mitigationActions: z.string().max(5000).optional().nullable(),
  reviewDate: z.string().optional().nullable(),
  nextReviewDate: z.string().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'MITIGATED', 'ACCEPTED', 'CLOSED', 'TRANSFERRED']).optional(),
  lastReviewDate: z.string().optional().nullable(),
});

// GET /heatmap — Risk heat map data
router.get('/heatmap', async (req: Request, res: Response) => {
  try {
    const where: Record<string, unknown> = { deletedAt: null };
    const items = await prisma.qualRiskRegister.findMany({
      where,
      select: { id: true, referenceNumber: true, title: true, likelihood: true, impact: true, riskScore: true, status: true },
    });

    res.json({ success: true, data: items });
  } catch (error: unknown) {
    logger.error('Failed to get risk heatmap', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get risk heatmap' } });
  }
});

// GET /stats — Risk register statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [total, open, mitigated, byStatus] = await Promise.all([
      prisma.qualRiskRegister.count({ where: { deletedAt: null } as any }),
      prisma.qualRiskRegister.count({ where: { deletedAt: null, status: 'OPEN' } as any }),
      prisma.qualRiskRegister.count({ where: { deletedAt: null, status: 'MITIGATED' } as any }),
      prisma.qualRiskRegister.groupBy({ by: ['status'], where: { deletedAt: null } as any, _count: { id: true } }),
    ]);

    res.json({
      success: true,
      data: {
        total, open, mitigated,
        byStatus: byStatus.map((s: Record<string, unknown>) => ({ status: s.status, count: (s as any)._count.id })),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get risk register stats', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get risk register stats' } });
  }
});

// GET / — List risks
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, category, likelihood, impact, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status && typeof status === 'string') where.status = status;
    if (category && typeof category === 'string') where.category = { contains: category, mode: 'insensitive' };
    if (likelihood && typeof likelihood === 'string') where.likelihood = likelihood;
    if (impact && typeof impact === 'string') where.impact = impact;
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { owner: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.qualRiskRegister.findMany({ where, skip, take: limit, orderBy: { riskScore: 'desc' } }),
      prisma.qualRiskRegister.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list risks', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list risks' } });
  }
});

// POST / — Create risk
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;
    const referenceNumber = await generateRefNumber();
    const riskScore = calcRiskScore(parsed.data.likelihood, parsed.data.impact);
    const residualScore = (parsed.data.residualLikelihood && parsed.data.residualImpact)
      ? calcRiskScore(parsed.data.residualLikelihood, parsed.data.residualImpact)
      : null;

    const item = await prisma.qualRiskRegister.create({
      data: {
        referenceNumber,
        ...parsed.data,
        riskScore,
        residualScore,
        reviewDate: parsed.data.reviewDate ? new Date(parsed.data.reviewDate) : null,
        nextReviewDate: parsed.data.nextReviewDate ? new Date(parsed.data.nextReviewDate) : null,
        status: 'OPEN',
        organisationId: (authReq.user as any)?.organisationId || 'default',
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to create risk', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create risk' } });
  }
});

// GET /:id — Get risk by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.qualRiskRegister.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to get risk', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get risk' } });
  }
});

// PUT /:id — Update risk
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.qualRiskRegister.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });

    const data: Record<string, unknown> = { ...parsed.data };

    // Recalculate scores if likelihood/impact changed
    const likelihood = parsed.data.likelihood || existing.likelihood;
    const impact = parsed.data.impact || existing.impact;
    data.riskScore = calcRiskScore(likelihood, impact);

    const residualLikelihood = (parsed.data.residualLikelihood !== undefined ? parsed.data.residualLikelihood : existing.residualLikelihood);
    const residualImpact = (parsed.data.residualImpact !== undefined ? parsed.data.residualImpact : existing.residualImpact);
    if (residualLikelihood && residualImpact) {
      data.residualScore = calcRiskScore(residualLikelihood, residualImpact);
    }

    if (parsed.data.reviewDate) data.reviewDate = new Date(parsed.data.reviewDate);
    if (parsed.data.nextReviewDate) data.nextReviewDate = new Date(parsed.data.nextReviewDate);
    if ((parsed.data as any).lastReviewDate) data.lastReviewDate = new Date((parsed.data as any).lastReviewDate);

    const item = await prisma.qualRiskRegister.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to update risk', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update risk' } });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.qualRiskRegister.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });

    await prisma.qualRiskRegister.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete risk', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete risk' } });
  }
});

export default router;
