import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-environment');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

function calculateSignificance(scores: {
  severity: number;
  probability: number;
  duration: number;
  extent: number;
  reversibility: number;
  regulatory: number;
  stakeholder: number;
}): { score: number; isSignificant: boolean } {
  const score = Math.round(
    scores.severity * 1.5 +
      scores.probability * 1.5 +
      scores.duration +
      scores.extent +
      scores.reversibility +
      scores.regulatory +
      scores.stakeholder
  );
  return { score, isSignificant: score >= 15 };
}

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.envAspect.count({
    where: { referenceNumber: { startsWith: `ENV-ASP-${year}` } },
  });
  return `ENV-ASP-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List aspects
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status, significant, search } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (significant === 'true') where.isSignificant = true;
    if (significant === 'false') where.isSignificant = false;
    if (search) {
      where.OR = [
        { activityProcess: { contains: search as string, mode: 'insensitive' } },
        { aspect: { contains: search as string, mode: 'insensitive' } },
        { impact: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [aspects, total] = await Promise.all([
      prisma.envAspect.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { significanceScore: 'desc' },
      }),
      prisma.envAspect.count({ where }),
    ]);

    res.json({
      success: true,
      data: aspects,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List aspects error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list aspects' },
    });
  }
});

// GET /:id
router.get('/:id', checkOwnership(prisma.envAspect), async (req: AuthRequest, res: Response) => {
  try {
    const aspect = await prisma.envAspect.findUnique({ where: { id: req.params.id } });
    if (!aspect)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Aspect not found' } });
    res.json({ success: true, data: aspect });
  } catch (error) {
    logger.error('Get aspect error', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get aspect' } });
  }
});

// POST /
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      activityProcess: z.string().trim().min(1).max(200),
      activityCategory: z.enum([
        'ENERGY_USE',
        'WATER_USE',
        'WASTE_GENERATION',
        'EMISSIONS_TO_AIR',
        'DISCHARGES_TO_WATER',
        'LAND_CONTAMINATION',
        'RESOURCE_USE',
        'NOISE_VIBRATION',
        'BIODIVERSITY',
        'TRANSPORT',
        'PROCUREMENT',
        'PRODUCT_DESIGN',
        'OTHER',
      ]),
      department: z.string().trim().min(1).max(200),
      location: z.string().trim().optional(),
      lifecyclePhases: z.array(z.string().trim()).optional().default([]),
      operatingCondition: z.string().trim().default('NORMAL'),
      description: z.string().trim().optional(),
      aspect: z.string().trim().min(1).max(200),
      impact: z.string().trim().min(1).max(200),
      impactDirection: z.string().trim().default('ADVERSE'),
      environmentalMedia: z.array(z.string().trim()).optional().default([]),
      scaleOfImpact: z.string().trim().default('LOCAL'),
      scoreSeverity: z.number().min(1).max(5).default(1),
      scoreProbability: z.number().min(1).max(5).default(1),
      scoreDuration: z.number().min(1).max(5).default(1),
      scoreExtent: z.number().min(1).max(5).default(1),
      scoreReversibility: z.number().min(1).max(5).default(1),
      scoreRegulatory: z.number().min(1).max(5).default(1),
      scoreStakeholder: z.number().min(1).max(5).default(1),
      significanceOverride: z.boolean().optional(),
      overrideReason: z.string().trim().optional(),
      existingControls: z.string().trim().optional(),
      controlHierarchy: z.string().trim().optional(),
      residualScore: z.number().nonnegative().optional(),
      targetScore: z.number().nonnegative().optional(),
      legalReferences: z.string().trim().optional(),
      permitReference: z.string().trim().optional(),
      applicableStandards: z.string().trim().optional(),
      responsiblePerson: z.string().trim().optional(),
      reviewFrequency: z.string().trim().optional(),
      nextReviewDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      status: z.string().trim().optional(),
      aiSignificanceJustification: z.string().trim().optional(),
      aiControlRecommendations: z.string().trim().optional(),
      aiLegalObligations: z.string().trim().optional(),
      aiBenchmarkComparison: z.string().trim().optional(),
      aiImprovementOpportunities: z.string().trim().optional(),
      aiClimateRelevance: z.string().trim().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const sig = calculateSignificance({
      severity: data.scoreSeverity,
      probability: data.scoreProbability,
      duration: data.scoreDuration,
      extent: data.scoreExtent,
      reversibility: data.scoreReversibility,
      regulatory: data.scoreRegulatory,
      stakeholder: data.scoreStakeholder,
    });
    const referenceNumber = await generateRefNumber();

    const aspect = await prisma.envAspect.create({
      data: {
        referenceNumber,
        activityProcess: data.activityProcess,
        activityCategory: data.activityCategory as any,
        department: data.department,
        location: data.location,
        lifecyclePhases: data.lifecyclePhases,
        operatingCondition: data.operatingCondition as any,
        description: data.description,
        aspect: data.aspect,
        impact: data.impact,
        impactDirection: data.impactDirection as any,
        environmentalMedia: data.environmentalMedia,
        scaleOfImpact: data.scaleOfImpact as any,
        scoreSeverity: data.scoreSeverity,
        scoreProbability: data.scoreProbability,
        scoreDuration: data.scoreDuration,
        scoreExtent: data.scoreExtent,
        scoreReversibility: data.scoreReversibility,
        scoreRegulatory: data.scoreRegulatory,
        scoreStakeholder: data.scoreStakeholder,
        significanceScore: sig.score,
        isSignificant:
          data.significanceOverride !== undefined
            ? !data.significanceOverride
              ? sig.isSignificant
              : !sig.isSignificant
            : sig.isSignificant,
        significanceOverride: data.significanceOverride ?? false,
        overrideReason: data.overrideReason,
        existingControls: data.existingControls,
        controlHierarchy: data.controlHierarchy as any,
        residualScore: data.residualScore,
        targetScore: data.targetScore,
        legalReferences: data.legalReferences,
        permitReference: data.permitReference,
        applicableStandards: data.applicableStandards,
        responsiblePerson: data.responsiblePerson,
        reviewFrequency: data.reviewFrequency as any,
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : null,
        status: (data.status as any) || 'ACTIVE',
        aiSignificanceJustification: data.aiSignificanceJustification,
        aiControlRecommendations: data.aiControlRecommendations,
        aiLegalObligations: data.aiLegalObligations,
        aiBenchmarkComparison: data.aiBenchmarkComparison,
        aiImprovementOpportunities: data.aiImprovementOpportunities,
        aiClimateRelevance: data.aiClimateRelevance,
        aiGenerated: data.aiGenerated ?? false,
      },
    });

    res.status(201).json({ success: true, data: aspect });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create aspect error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create aspect' },
    });
  }
});

// PUT /:id
const aspectUpdateSchema = z.object({
  activityProcess: z.string().trim().min(1).max(200).optional(),
  activityCategory: z
    .enum([
      'ENERGY_USE',
      'WATER_USE',
      'WASTE_GENERATION',
      'EMISSIONS_TO_AIR',
      'DISCHARGES_TO_WATER',
      'LAND_CONTAMINATION',
      'RESOURCE_USE',
      'NOISE_VIBRATION',
      'BIODIVERSITY',
      'TRANSPORT',
      'PROCUREMENT',
      'PRODUCT_DESIGN',
      'OTHER',
    ])
    .optional(),
  department: z.string().trim().min(1).max(200).optional(),
  location: z.string().trim().optional(),
  lifecyclePhases: z.array(z.string().trim()).optional(),
  operatingCondition: z.string().trim().optional(),
  description: z.string().trim().optional(),
  aspect: z.string().trim().min(1).max(200).optional(),
  impact: z.string().trim().min(1).max(200).optional(),
  impactDirection: z.string().trim().optional(),
  environmentalMedia: z.array(z.string().trim()).optional(),
  scaleOfImpact: z.string().trim().optional(),
  scoreSeverity: z.number().min(1).max(5).optional(),
  scoreProbability: z.number().min(1).max(5).optional(),
  scoreDuration: z.number().min(1).max(5).optional(),
  scoreExtent: z.number().min(1).max(5).optional(),
  scoreReversibility: z.number().min(1).max(5).optional(),
  scoreRegulatory: z.number().min(1).max(5).optional(),
  scoreStakeholder: z.number().min(1).max(5).optional(),
  significanceOverride: z.boolean().optional(),
  overrideReason: z.string().trim().optional(),
  existingControls: z.string().trim().optional(),
  controlHierarchy: z.string().trim().optional(),
  residualScore: z.number().nonnegative().optional(),
  targetScore: z.number().nonnegative().optional(),
  legalReferences: z.string().trim().optional(),
  permitReference: z.string().trim().optional(),
  applicableStandards: z.string().trim().optional(),
  responsiblePerson: z.string().trim().optional(),
  reviewFrequency: z.string().trim().optional(),
  nextReviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  status: z.string().trim().optional(),
  aiSignificanceJustification: z.string().trim().optional(),
  aiControlRecommendations: z.string().trim().optional(),
  aiLegalObligations: z.string().trim().optional(),
  aiBenchmarkComparison: z.string().trim().optional(),
  aiImprovementOpportunities: z.string().trim().optional(),
  aiClimateRelevance: z.string().trim().optional(),
  aiGenerated: z.boolean().optional(),
});

router.put('/:id', checkOwnership(prisma.envAspect), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envAspect.findUnique({ where: { id: req.params.id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Aspect not found' } });

    const parsed = aspectUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: parsed.error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    const data = parsed.data;
    const scores = {
      severity: data.scoreSeverity ?? existing.scoreSeverity,
      probability: data.scoreProbability ?? existing.scoreProbability,
      duration: data.scoreDuration ?? existing.scoreDuration,
      extent: data.scoreExtent ?? existing.scoreExtent,
      reversibility: data.scoreReversibility ?? existing.scoreReversibility,
      regulatory: data.scoreRegulatory ?? existing.scoreRegulatory,
      stakeholder: data.scoreStakeholder ?? existing.scoreStakeholder,
    };
    const sig = calculateSignificance(scores);

    const aspect = await prisma.envAspect.update({
      where: { id: req.params.id },
      data: {
        ...data,
        significanceScore: sig.score,
        isSignificant: data.significanceOverride ? !sig.isSignificant : sig.isSignificant,
        nextReviewDate: data.nextReviewDate
          ? new Date(data.nextReviewDate)
          : existing.nextReviewDate,
      } as any,
    });

    res.json({ success: true, data: aspect });
  } catch (error) {
    logger.error('Update aspect error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update aspect' },
    });
  }
});

// DELETE /:id
router.delete('/:id', checkOwnership(prisma.envAspect), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envAspect.findUnique({ where: { id: req.params.id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Aspect not found' } });
    await prisma.envAspect.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: req.user?.id },
    });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete aspect error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete aspect' },
    });
  }
});

export default router;
