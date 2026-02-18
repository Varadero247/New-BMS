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
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AI42-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Risk score calculation
// ---------------------------------------------------------------------------

const LIKELIHOOD_SCORES: Record<string, number> = {
  RARE: 1,
  UNLIKELY: 2,
  POSSIBLE: 3,
  LIKELY: 4,
  ALMOST_CERTAIN: 5,
};

const IMPACT_SCORES: Record<string, number> = {
  NEGLIGIBLE: 1,
  MINOR: 2,
  MODERATE: 3,
  MAJOR: 4,
  CATASTROPHIC: 5,
};

function calculateRiskScore(likelihood: string, impact: string): number {
  const likelihoodScore = LIKELIHOOD_SCORES[likelihood] || 1;
  const impactScore = IMPACT_SCORES[impact] || 1;
  return likelihoodScore * impactScore;
}

function getRiskLevel(score: number): string {
  if (score >= 20) return 'CRITICAL';
  if (score >= 12) return 'HIGH';
  if (score >= 6) return 'MEDIUM';
  return 'LOW';
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const riskCreateSchema = z.object({
  systemId: z.string().uuid(),
  title: z.string().min(1).max(300),
  description: z.string().max(4000).optional().nullable(),
  category: z.enum([
    'BIAS_DISCRIMINATION',
    'PRIVACY_DATA_PROTECTION',
    'SAFETY_SECURITY',
    'TRANSPARENCY_EXPLAINABILITY',
    'ACCOUNTABILITY',
    'HUMAN_OVERSIGHT',
    'ROBUSTNESS_RELIABILITY',
    'ENVIRONMENTAL_IMPACT',
    'SOCIETAL_IMPACT',
    'INTELLECTUAL_PROPERTY',
    'REGULATORY_COMPLIANCE',
    'OTHER',
  ]),
  likelihood: z.enum(['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN']),
  impact: z.enum(['NEGLIGIBLE', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC']),
  existingControls: z.string().max(4000).optional().nullable(),
  proposedMitigations: z.string().max(4000).optional().nullable(),
  riskOwner: z.string().max(200).optional().nullable(),
  reviewDate: z.string().optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

const riskUpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(4000).optional().nullable(),
  category: z.enum([
    'BIAS_DISCRIMINATION',
    'PRIVACY_DATA_PROTECTION',
    'SAFETY_SECURITY',
    'TRANSPARENCY_EXPLAINABILITY',
    'ACCOUNTABILITY',
    'HUMAN_OVERSIGHT',
    'ROBUSTNESS_RELIABILITY',
    'ENVIRONMENTAL_IMPACT',
    'SOCIETAL_IMPACT',
    'INTELLECTUAL_PROPERTY',
    'REGULATORY_COMPLIANCE',
    'OTHER',
  ]).optional(),
  likelihood: z.enum(['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN']).optional(),
  impact: z.enum(['NEGLIGIBLE', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC']).optional(),
  status: z.enum(['IDENTIFIED', 'ASSESSED', 'MITIGATED', 'ACCEPTED', 'CLOSED']).optional(),
  existingControls: z.string().max(4000).optional().nullable(),
  proposedMitigations: z.string().max(4000).optional().nullable(),
  riskOwner: z.string().max(200).optional().nullable(),
  reviewDate: z.string().optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
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

// GET / — List risk assessments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, status, systemId, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (category && typeof category === 'string') {
      where.category = category;
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (systemId && typeof systemId === 'string') {
      where.systemId = systemId;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [risks, total] = await Promise.all([
      prisma.aiRiskAssessment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          system: { select: { id: true, name: true, riskTier: true } },
        },
      }),
      prisma.aiRiskAssessment.count({ where }),
    ]);

    res.json({
      success: true,
      data: risks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list risk assessments', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list risk assessments' } });
  }
});

// POST / — Create risk assessment
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = riskCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    // Verify system exists
    const system = await prisma.aiSystem.findFirst({ where: { id: parsed.data.systemId, deletedAt: null } as any });
    if (!system) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'AI system not found' } });
    }

    const authReq = req as AuthRequest;
    const reference = generateReference('RSK');
    const riskScore = calculateRiskScore(parsed.data.likelihood, parsed.data.impact);
    const riskLevel = getRiskLevel(riskScore);

    const risk = await prisma.aiRiskAssessment.create({
      data: {
        reference: reference as any,
        systemId: parsed.data.systemId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        category: parsed.data.category as any,
        likelihood: parsed.data.likelihood as any,
        impact: parsed.data.impact as any,
        riskScore,
        riskLevel,
        status: 'IDENTIFIED',
        existingControls: parsed.data.existingControls ?? null,
        proposedMitigations: parsed.data.proposedMitigations ?? null,
        riskOwner: parsed.data.riskOwner ?? null,
        reviewDate: parsed.data.reviewDate ? new Date(parsed.data.reviewDate) : null,
        notes: parsed.data.notes ?? null,
        createdBy: authReq.user?.id || 'system',
      } as any,
      include: {
        system: { select: { id: true, name: true } },
      },
    });

    logger.info('AI risk assessment created', { riskId: risk.id, reference, riskScore, riskLevel });
    res.status(201).json({ success: true, data: risk });
  } catch (error: unknown) {
    logger.error('Failed to create risk assessment', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create risk assessment' } });
  }
});

// GET /:id — Get risk assessment by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const risk = await prisma.aiRiskAssessment.findFirst({
      where: { id, deletedAt: null } as any,
      include: {
        system: { select: { id: true, name: true, riskTier: true } },
      },
    });

    if (!risk) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk assessment not found' } });
    }

    res.json({ success: true, data: risk });
  } catch (error: unknown) {
    logger.error('Failed to get risk assessment', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get risk assessment' } });
  }
});

// PUT /:id — Update risk assessment
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = riskUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.aiRiskAssessment.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk assessment not found' } });
    }

    const authReq = req as AuthRequest;

    // Recalculate risk score if likelihood or impact changed
    const likelihood = parsed.data.likelihood || existing.likelihood;
    const impact = parsed.data.impact || existing.impact;
    const riskScore = calculateRiskScore(likelihood, impact);
    const riskLevel = getRiskLevel(riskScore);

    const risk = await prisma.aiRiskAssessment.update({
      where: { id },
      data: {
        ...parsed.data,
        riskScore,
        riskLevel,
        reviewDate: parsed.data.reviewDate !== undefined
          ? (parsed.data.reviewDate ? new Date(parsed.data.reviewDate) : null)
          : undefined,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      } as any,
      include: {
        system: { select: { id: true, name: true } },
      },
    });

    logger.info('AI risk assessment updated', { riskId: id, riskScore, riskLevel });
    res.json({ success: true, data: risk });
  } catch (error: unknown) {
    logger.error('Failed to update risk assessment', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update risk assessment' } });
  }
});

// DELETE /:id — Soft delete risk assessment
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.aiRiskAssessment.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk assessment not found' } });
    }

    const authReq = req as AuthRequest;
    await prisma.aiRiskAssessment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: authReq.user?.id || 'system',
      } as any,
    });

    logger.info('AI risk assessment soft-deleted', { riskId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete risk assessment', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete risk assessment' } });
  }
});

export default router;
