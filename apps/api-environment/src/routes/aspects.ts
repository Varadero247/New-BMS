import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();
router.use(authenticate);

function calculateSignificance(scores: {
  severity: number; probability: number; duration: number;
  extent: number; reversibility: number; regulatory: number; stakeholder: number;
}): { score: number; isSignificant: boolean } {
  const score = Math.round(
    scores.severity * 1.5 + scores.probability * 1.5 +
    scores.duration + scores.extent + scores.reversibility +
    scores.regulatory + scores.stakeholder
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
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status, significant, search } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
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
      prisma.envAspect.findMany({ where, skip, take: limitNum, orderBy: { significanceScore: 'desc' } }),
      prisma.envAspect.count({ where }),
    ]);

    res.json({
      success: true,
      data: aspects,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List aspects error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list aspects' } });
  }
});

// GET /:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const aspect = await prisma.envAspect.findUnique({ where: { id: req.params.id } });
    if (!aspect) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Aspect not found' } });
    res.json({ success: true, data: aspect });
  } catch (error) {
    console.error('Get aspect error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get aspect' } });
  }
});

// POST /
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      activityProcess: z.string().min(1),
      activityCategory: z.string(),
      department: z.string().min(1),
      location: z.string().optional(),
      lifecyclePhases: z.array(z.string()).optional().default([]),
      operatingCondition: z.string().default('NORMAL'),
      description: z.string().optional(),
      aspect: z.string().min(1),
      impact: z.string().min(1),
      impactDirection: z.string().default('ADVERSE'),
      environmentalMedia: z.array(z.string()).optional().default([]),
      scaleOfImpact: z.string().default('LOCAL'),
      scoreSeverity: z.number().min(1).max(5).default(1),
      scoreProbability: z.number().min(1).max(5).default(1),
      scoreDuration: z.number().min(1).max(5).default(1),
      scoreExtent: z.number().min(1).max(5).default(1),
      scoreReversibility: z.number().min(1).max(5).default(1),
      scoreRegulatory: z.number().min(1).max(5).default(1),
      scoreStakeholder: z.number().min(1).max(5).default(1),
      significanceOverride: z.boolean().optional(),
      overrideReason: z.string().optional(),
      existingControls: z.string().optional(),
      controlHierarchy: z.string().optional(),
      residualScore: z.number().optional(),
      targetScore: z.number().optional(),
      legalReferences: z.string().optional(),
      permitReference: z.string().optional(),
      applicableStandards: z.string().optional(),
      responsiblePerson: z.string().optional(),
      reviewFrequency: z.string().optional(),
      nextReviewDate: z.string().optional(),
      status: z.string().optional(),
      aiSignificanceJustification: z.string().optional(),
      aiControlRecommendations: z.string().optional(),
      aiLegalObligations: z.string().optional(),
      aiBenchmarkComparison: z.string().optional(),
      aiImprovementOpportunities: z.string().optional(),
      aiClimateRelevance: z.string().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const sig = calculateSignificance({
      severity: data.scoreSeverity, probability: data.scoreProbability,
      duration: data.scoreDuration, extent: data.scoreExtent,
      reversibility: data.scoreReversibility, regulatory: data.scoreRegulatory,
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
        isSignificant: data.significanceOverride !== undefined ? !data.significanceOverride ? sig.isSignificant : !sig.isSignificant : sig.isSignificant,
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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create aspect error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create aspect' } });
  }
});

// PUT /:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envAspect.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Aspect not found' } });

    const data = req.body;
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
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : existing.nextReviewDate,
      },
    });

    res.json({ success: true, data: aspect });
  } catch (error) {
    console.error('Update aspect error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update aspect' } });
  }
});

// DELETE /:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envAspect.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Aspect not found' } });
    await prisma.envAspect.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Aspect deleted successfully' } });
  } catch (error) {
    console.error('Delete aspect error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete aspect' } });
  }
});

export default router;
