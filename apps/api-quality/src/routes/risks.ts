import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();

router.use(authenticate);

// Generate risk number
function generateRiskNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RSK-${year}-${random}`;
}

// Calculate risk level from score
function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
  if (score <= 5) return 'LOW';
  if (score <= 12) return 'MEDIUM';
  if (score <= 19) return 'HIGH';
  return 'EXTREME';
}

// GET /api/risks - List risks
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, currentRiskLevel, riskCategory, riskType } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (currentRiskLevel) where.currentRiskLevel = currentRiskLevel;
    if (riskCategory) where.riskCategory = riskCategory;
    if (riskType) where.riskType = riskType;

    const [risks, total] = await Promise.all([
      prisma.qMSRisk.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { currentRiskScore: 'desc' },
        include: {
          _count: { select: { assessments: true, controls: true, treatments: true } },
        },
      }),
      prisma.qMSRisk.count({ where }),
    ]);

    res.json({
      success: true,
      data: risks,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List risks error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list risks' } });
  }
});

// GET /api/risks/:id - Get single risk
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const risk = await prisma.qMSRisk.findUnique({
      where: { id: req.params.id },
      include: {
        assessments: { orderBy: { assessmentDate: 'desc' } },
        controls: { orderBy: { createdAt: 'asc' } },
        treatments: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!risk) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    }

    res.json({ success: true, data: risk });
  } catch (error) {
    console.error('Get risk error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get risk' } });
  }
});

// POST /api/risks - Create risk
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      riskCategory: z.enum(['STRATEGIC', 'OPERATIONAL', 'FINANCIAL', 'COMPLIANCE', 'REPUTATIONAL', 'TECHNICAL', 'MARKET', 'PROJECT', 'SUPPLY_CHAIN', 'ENVIRONMENTAL', 'SAFETY']),
      riskType: z.enum(['OPPORTUNITY', 'THREAT', 'BOTH']).default('THREAT'),
      standard: z.enum(['ISO_45001', 'ISO_14001', 'ISO_9001']).optional(),
      process: z.string().optional(),
      department: z.string().optional(),
      objective: z.string().optional(),
      ownerId: z.string().optional(),
      likelihood: z.number().min(1).max(5).default(1),
      impact: z.number().min(1).max(5).default(1),
      reviewFrequency: z.number().optional(),
      nextReviewDate: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const currentRiskScore = data.likelihood * data.impact;

    const risk = await prisma.qMSRisk.create({
      data: {
        ...data,
        riskNumber: generateRiskNumber(),
        currentRiskScore,
        currentRiskLevel: getRiskLevel(currentRiskScore),
        status: 'IDENTIFIED',
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : undefined,
        createdById: req.user!.id,
      },
    });

    // Create initial assessment
    await prisma.riskAssessment.create({
      data: {
        riskId: risk.id,
        assessmentType: 'INITIAL',
        assessedById: req.user!.id,
        likelihood: data.likelihood,
        impact: data.impact,
        riskScore: currentRiskScore,
        riskLevel: getRiskLevel(currentRiskScore),
      },
    });

    res.status(201).json({ success: true, data: risk });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create risk error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create risk' } });
  }
});

// PATCH /api/risks/:id - Update risk
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qMSRisk.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      riskCategory: z.enum(['STRATEGIC', 'OPERATIONAL', 'FINANCIAL', 'COMPLIANCE', 'REPUTATIONAL', 'TECHNICAL', 'MARKET', 'PROJECT', 'SUPPLY_CHAIN', 'ENVIRONMENTAL', 'SAFETY']).optional(),
      status: z.enum(['IDENTIFIED', 'BEING_ASSESSED', 'ASSESSED', 'TREATMENT_PLANNED', 'TREATMENT_IN_PROGRESS', 'MONITORED', 'CLOSED', 'ACCEPTED']).optional(),
      ownerId: z.string().optional(),
      likelihood: z.number().min(1).max(5).optional(),
      impact: z.number().min(1).max(5).optional(),
      residualLikelihood: z.number().min(1).max(5).optional(),
      residualImpact: z.number().min(1).max(5).optional(),
      targetRiskScore: z.number().optional(),
      reviewFrequency: z.number().optional(),
      nextReviewDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Calculate scores if needed
    let currentRiskScore = existing.currentRiskScore;
    let currentRiskLevel = existing.currentRiskLevel;
    if (data.likelihood !== undefined || data.impact !== undefined) {
      const l = data.likelihood ?? existing.likelihood;
      const i = data.impact ?? existing.impact;
      currentRiskScore = l * i;
      currentRiskLevel = getRiskLevel(currentRiskScore);
    }

    let residualRiskScore = existing.residualRiskScore;
    let residualRiskLevel = existing.residualRiskLevel;
    if (data.residualLikelihood !== undefined || data.residualImpact !== undefined) {
      const rl = data.residualLikelihood ?? existing.residualLikelihood ?? existing.likelihood;
      const ri = data.residualImpact ?? existing.residualImpact ?? existing.impact;
      residualRiskScore = rl * ri;
      residualRiskLevel = getRiskLevel(residualRiskScore);
    }

    const risk = await prisma.qMSRisk.update({
      where: { id: req.params.id },
      data: {
        ...data,
        currentRiskScore,
        currentRiskLevel,
        residualRiskScore,
        residualRiskLevel,
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : undefined,
        lastReviewedAt: new Date(),
        lastReviewedById: req.user!.id,
        updatedById: req.user!.id,
      },
    });

    res.json({ success: true, data: risk });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update risk error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update risk' } });
  }
});

// POST /api/risks/:id/assessments - Add assessment
router.post('/:id/assessments', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      assessmentType: z.enum(['INITIAL', 'PERIODIC', 'TRIGGERED', 'POST_INCIDENT', 'POST_TREATMENT']).default('PERIODIC'),
      likelihood: z.number().min(1).max(5),
      impact: z.number().min(1).max(5),
      likelihoodFactors: z.any().optional(),
      impactFactors: z.any().optional(),
      rationale: z.string().optional(),
      assumptions: z.string().optional(),
      uncertainties: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const riskScore = data.likelihood * data.impact;

    // Get previous score for trend
    const previousAssessment = await prisma.riskAssessment.findFirst({
      where: { riskId: req.params.id },
      orderBy: { assessmentDate: 'desc' },
    });

    let trendDirection: 'IMPROVING' | 'STABLE' | 'DETERIORATING' | undefined;
    if (previousAssessment) {
      if (riskScore < previousAssessment.riskScore) trendDirection = 'IMPROVING';
      else if (riskScore > previousAssessment.riskScore) trendDirection = 'DETERIORATING';
      else trendDirection = 'STABLE';
    }

    const assessment = await prisma.riskAssessment.create({
      data: {
        ...data,
        riskId: req.params.id,
        assessedById: req.user!.id,
        riskScore,
        riskLevel: getRiskLevel(riskScore),
        trendDirection,
        previousScore: previousAssessment?.riskScore,
      },
    });

    // Update risk with new assessment
    await prisma.qMSRisk.update({
      where: { id: req.params.id },
      data: {
        likelihood: data.likelihood,
        impact: data.impact,
        currentRiskScore: riskScore,
        currentRiskLevel: getRiskLevel(riskScore),
        lastReviewedAt: new Date(),
        lastReviewedById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add assessment error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add assessment' } });
  }
});

// POST /api/risks/:id/controls - Add control
router.post('/:id/controls', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      controlType: z.enum(['PREVENTIVE', 'DETECTIVE', 'CORRECTIVE', 'DIRECTIVE']),
      controlCategory: z.enum(['MANUAL', 'AUTOMATED', 'SEMI_AUTOMATED', 'IT_DEPENDENT']).default('MANUAL'),
      frequency: z.enum(['CONTINUOUS', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'AD_HOC']).default('CONTINUOUS'),
      ownerId: z.string().optional(),
      designEffectiveness: z.enum(['EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'MODERATE', 'WEAK', 'INEFFECTIVE']).default('MODERATE'),
      relatedDocuments: z.array(z.string()).default([]),
    });

    const data = schema.parse(req.body);

    const control = await prisma.riskControl.create({
      data: {
        ...data,
        riskId: req.params.id,
        status: 'ACTIVE',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: control });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add control error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add control' } });
  }
});

// POST /api/risks/:id/treatments - Add treatment
router.post('/:id/treatments', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      treatmentStrategy: z.enum(['AVOID', 'REDUCE_LIKELIHOOD', 'REDUCE_IMPACT', 'TRANSFER', 'ACCEPT', 'EXPLOIT', 'ENHANCE']),
      ownerId: z.string().optional(),
      plannedStartDate: z.string().optional(),
      plannedEndDate: z.string().optional(),
      expectedLikelihood: z.number().min(1).max(5).optional(),
      expectedImpact: z.number().min(1).max(5).optional(),
      estimatedCost: z.number().optional(),
      resourcesRequired: z.string().optional(),
      verificationMethod: z.string().optional(),
    });

    const data = schema.parse(req.body);
    let expectedRiskScore: number | undefined;
    if (data.expectedLikelihood && data.expectedImpact) {
      expectedRiskScore = data.expectedLikelihood * data.expectedImpact;
    }

    const treatment = await prisma.riskTreatment.create({
      data: {
        ...data,
        riskId: req.params.id,
        plannedStartDate: data.plannedStartDate ? new Date(data.plannedStartDate) : undefined,
        plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : undefined,
        expectedRiskScore,
        status: 'PROPOSED',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: treatment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add treatment error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add treatment' } });
  }
});

// DELETE /api/risks/:id - Delete risk
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qMSRisk.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    }

    await prisma.qMSRisk.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Risk deleted successfully' } });
  } catch (error) {
    console.error('Delete risk error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete risk' } });
  }
});

export default router;
