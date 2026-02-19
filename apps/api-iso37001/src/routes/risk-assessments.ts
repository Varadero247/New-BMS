import { randomUUID } from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-iso37001');
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
  return `AB-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

function calculateRiskScore(likelihood: number, impact: number): number {
  return likelihood * impact;
}

function determineRiskLevel(score: number): string {
  if (score >= 20) return 'CRITICAL';
  if (score >= 12) return 'HIGH';
  if (score >= 6) return 'MEDIUM';
  return 'LOW';
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const riskAssessmentCreateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(5000).optional(),
  category: z.enum([
    'BRIBERY_OF_PUBLIC_OFFICIALS',
    'COMMERCIAL_BRIBERY',
    'FACILITATION_PAYMENTS',
    'GIFTS_HOSPITALITY',
    'POLITICAL_CONTRIBUTIONS',
    'CHARITABLE_DONATIONS',
    'THIRD_PARTY_RISKS',
    'PROCUREMENT',
    'SALES_MARKETING',
    'MERGERS_ACQUISITIONS',
    'JOINT_VENTURES',
    'CUSTOMS_CLEARANCE',
    'OTHER',
  ]),
  businessFunction: z.string().trim().min(1).max(200),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  country: z.string().trim().max(100).optional(),
  existingControls: z.string().trim().max(5000).optional(),
  owner: z.string().trim().max(200).optional(),
  reviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  notes: z.string().trim().max(2000).optional(),
});

const riskAssessmentUpdateSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  description: z.string().trim().max(5000).optional(),
  category: z
    .enum([
      'BRIBERY_OF_PUBLIC_OFFICIALS',
      'COMMERCIAL_BRIBERY',
      'FACILITATION_PAYMENTS',
      'GIFTS_HOSPITALITY',
      'POLITICAL_CONTRIBUTIONS',
      'CHARITABLE_DONATIONS',
      'THIRD_PARTY_RISKS',
      'PROCUREMENT',
      'SALES_MARKETING',
      'MERGERS_ACQUISITIONS',
      'JOINT_VENTURES',
      'CUSTOMS_CLEARANCE',
      'OTHER',
    ])
    .optional(),
  businessFunction: z.string().trim().min(1).max(200).optional(),
  likelihood: z.number().int().min(1).max(5).optional(),
  impact: z.number().int().min(1).max(5).optional(),
  country: z.string().trim().max(100).optional(),
  existingControls: z.string().trim().max(5000).optional(),
  owner: z.string().trim().max(200).optional(),
  reviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  notes: z.string().trim().max(2000).optional(),
});

const mitigateSchema = z.object({
  mitigationPlan: z.string().trim().min(1).max(5000),
  residualLikelihood: z.number().int().min(1).max(5),
  residualImpact: z.number().int().min(1).max(5),
  controlsAdded: z.string().trim().max(5000).optional(),
  mitigationOwner: z.string().trim().max(200).optional(),
  targetDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
});

// ---------------------------------------------------------------------------
// Reserved paths for /:id routes
// ---------------------------------------------------------------------------

const RESERVED_PATHS = new Set(['health', 'stats', 'export']);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET / — List risk assessments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, riskLevel, businessFunction, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (category && typeof category === 'string') {
      where.category = category;
    }
    if (riskLevel && typeof riskLevel === 'string') {
      where.riskLevel = riskLevel;
    }
    if (businessFunction && typeof businessFunction === 'string') {
      where.businessFunction = { contains: businessFunction, mode: 'insensitive' };
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { businessFunction: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [assessments, total] = await Promise.all([
      prisma.abRiskAssessment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.abRiskAssessment.count({ where }),
    ]);

    res.json({
      success: true,
      data: assessments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list risk assessments', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list risk assessments' },
    });
  }
});

// POST / — Create risk assessment
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = riskAssessmentCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const userId = (req as AuthRequest).user?.id || 'system';
    const referenceNumber = generateReference('RSK');

    const riskScore = calculateRiskScore(parsed.data.likelihood, parsed.data.impact);
    const riskLevel = determineRiskLevel(riskScore);

    const assessment = await prisma.abRiskAssessment.create({
      data: {
        ...parsed.data,
        referenceNumber,
        riskScore,
        riskLevel: riskLevel as string,
        status: 'IDENTIFIED',
        createdBy: userId,
        updatedBy: userId,
      },
    });

    logger.info('Risk assessment created', {
      id: assessment.id,
      referenceNumber,
      riskScore,
      riskLevel,
    });
    res.status(201).json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to create risk assessment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create risk assessment' },
    });
  }
});

// GET /:id — Get by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return next('route');

    const assessment = await prisma.abRiskAssessment.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Risk assessment not found' },
      });
    }

    res.json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to get risk assessment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get risk assessment' },
    });
  }
});

// PUT /:id — Update
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return next('route');

    const parsed = riskAssessmentUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const existing = await prisma.abRiskAssessment.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Risk assessment not found' },
      });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    // Recalculate risk score if likelihood or impact changed
    const likelihood = parsed.data.likelihood ?? existing.likelihood;
    const impact = parsed.data.impact ?? existing.impact;
    const riskScore = calculateRiskScore(likelihood, impact);
    const riskLevel = determineRiskLevel(riskScore);

    const assessment = await prisma.abRiskAssessment.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        riskScore,
        riskLevel: riskLevel as string,
        updatedBy: userId,
      },
    });

    logger.info('Risk assessment updated', { id: assessment.id, riskScore, riskLevel });
    res.json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to update risk assessment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update risk assessment' },
    });
  }
});

// PUT /:id/mitigate — Update mitigation and residual risk
router.put('/:id/mitigate', async (req: Request, res: Response) => {
  try {
    const parsed = mitigateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const existing = await prisma.abRiskAssessment.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Risk assessment not found' },
      });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    const residualRiskScore = calculateRiskScore(
      parsed.data.residualLikelihood,
      parsed.data.residualImpact
    );
    const residualRiskLevel = determineRiskLevel(residualRiskScore);

    const assessment = await prisma.abRiskAssessment.update({
      where: { id: req.params.id },
      data: {
        mitigationPlan: parsed.data.mitigationPlan as string,
        residualLikelihood: parsed.data.residualLikelihood,
        residualImpact: parsed.data.residualImpact,
        residualRiskScore,
        residualRiskLevel,
        controlsAdded: parsed.data.controlsAdded,
        mitigationOwner: parsed.data.mitigationOwner,
        targetDate: parsed.data.targetDate,
        status: 'MITIGATED',
        updatedBy: userId,
      },
    });

    logger.info('Risk assessment mitigated', {
      id: assessment.id,
      residualRiskScore,
      residualRiskLevel,
    });
    res.json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to mitigate risk assessment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to mitigate risk assessment' },
    });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.abRiskAssessment.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Risk assessment not found' },
      });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    await prisma.abRiskAssessment.update({
      where: { id: req.params.id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });

    logger.info('Risk assessment deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Risk assessment deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete risk assessment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete risk assessment' },
    });
  }
});

export default router;
