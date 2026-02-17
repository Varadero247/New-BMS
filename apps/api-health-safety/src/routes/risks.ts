import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-health-safety');

const router: IRouter = Router();

router.use(authenticate);
router.param('id', validateIdParam());

// Helper: calculate risk level from L×S (5x5 matrix)
function getRiskLevel(likelihood: number, severity: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const score = likelihood * severity;
  if (score <= 4) return 'LOW';
  if (score <= 9) return 'MEDIUM';
  if (score <= 16) return 'HIGH';
  return 'CRITICAL';
}

// Helper: generate reference number HS-001, HS-002, etc.
async function generateReferenceNumber(): Promise<string> {
  const lastRisk = await prisma.risk.findFirst({
    where: { referenceNumber: { not: null } },
    orderBy: { createdAt: 'desc' },
    select: { referenceNumber: true },
  });

  let nextNum = 1;
  if (lastRisk?.referenceNumber) {
    const match = lastRisk.referenceNumber.match(/HS-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  return `HS-${String(nextNum).padStart(3, '0')}`;
}

// Helper: default review date based on risk level
function getDefaultReviewDate(riskLevel: string): Date {
  const now = new Date();
  switch (riskLevel) {
    case 'CRITICAL': return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    case 'HIGH':     return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    case 'MEDIUM':   return new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
    case 'LOW':      return new Date(now.getFullYear(), now.getMonth() + 12, now.getDate());
    default:         return new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());
  }
}

// GET /api/risks - List H&S risks
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, riskLevel, category, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.RiskWhereInput = { deletedAt: null };
    if (status) where.status = status;
    if (riskLevel) where.riskLevel = riskLevel;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [risks, total] = await Promise.all([
      prisma.risk.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ riskScore: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.risk.count({ where }),
    ]);

    res.json({
      success: true,
      data: risks,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List risks error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list risks' } });
  }
});

// GET /api/risks/matrix - Get risk matrix data
router.get('/matrix', async (req: AuthRequest, res: Response) => {
  try {
    const risks = await prisma.risk.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { id: true, title: true, likelihood: true, severity: true, riskScore: true },
      take: 500,
    });

    const matrix: Record<string, { id: string; title: string; riskScore: number }[]> = {};

    risks.forEach(risk => {
      const key = `${risk.likelihood}-${risk.severity}`;
      if (!matrix[key]) matrix[key] = [];
      matrix[key].push({ id: risk.id, title: risk.title, riskScore: risk.riskScore || 0 });
    });

    res.json({ success: true, data: matrix });
  } catch (error) {
    logger.error('Risk matrix error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get risk matrix' } });
  }
});

// GET /api/risks/:id - Get single risk
router.get('/:id', checkOwnership(prisma.risk), async (req: AuthRequest, res: Response) => {
  try {
    const risk = await prisma.risk.findUnique({
      where: { id: req.params.id },
      include: { actions: true },
    });

    if (!risk) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    }

    res.json({ success: true, data: risk });
  } catch (error) {
    logger.error('Get risk error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get risk' } });
  }
});

// POST /api/risks - Create risk
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      category: z.string().optional(),
      source: z.string().optional(),
      whoAtRisk: z.string().optional(),
      likelihood: z.number().min(1).max(5),
      severity: z.number().min(1).max(5),
      existingControls: z.string().optional(),
      aiControlElimination: z.string().optional(),
      aiControlSubstitution: z.string().optional(),
      aiControlEngineering: z.string().optional(),
      aiControlAdministrative: z.string().optional(),
      aiControlPPE: z.string().optional(),
      aiControlsGenerated: z.boolean().optional(),
      additionalControls: z.string().optional(),
      residualLikelihood: z.number().min(1).max(5).optional(),
      residualSeverity: z.number().min(1).max(5).optional(),
      riskOwner: z.string().optional(),
      responsible: z.string().optional(),
      legalReference: z.string().optional(),
      status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'MITIGATED', 'CLOSED', 'ACCEPTED']).optional(),
      reviewDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Calculate initial risk score (L x S)
    const riskScore = data.likelihood * data.severity;
    const riskLevel = getRiskLevel(data.likelihood, data.severity);

    // Calculate residual risk if provided
    const resL = data.residualLikelihood || data.likelihood;
    const resS = data.residualSeverity || data.severity;
    const residualRiskScore = resL * resS;
    const residualRiskLevel = getRiskLevel(resL, resS);

    const referenceNumber = await generateReferenceNumber();
    const reviewDate = data.reviewDate
      ? new Date(data.reviewDate)
      : getDefaultReviewDate(riskLevel);

    const risk = await prisma.risk.create({
      data: {
        id: uuidv4(),
        referenceNumber,
        title: data.title,
        description: data.description,
        category: data.category,
        source: data.source,
        whoAtRisk: data.whoAtRisk,
        likelihood: data.likelihood,
        severity: data.severity,
        detectability: 1,
        riskScore,
        riskLevel,
        existingControls: data.existingControls,
        aiControlElimination: data.aiControlElimination,
        aiControlSubstitution: data.aiControlSubstitution,
        aiControlEngineering: data.aiControlEngineering,
        aiControlAdministrative: data.aiControlAdministrative,
        aiControlPPE: data.aiControlPPE,
        aiControlsGenerated: data.aiControlsGenerated ?? false,
        additionalControls: data.additionalControls,
        residualLikelihood: resL,
        residualSeverity: resS,
        residualRiskScore,
        residualRiskLevel,
        riskOwner: data.riskOwner,
        responsible: data.responsible,
        legalReference: data.legalReference,
        createdBy: req.user?.id,
        status: data.status || 'ACTIVE',
        reviewDate,
      },
    });

    res.status(201).json({ success: true, data: risk });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create risk error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create risk' } });
  }
});

// PATCH /api/risks/:id - Update risk
router.patch('/:id', checkOwnership(prisma.risk), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.risk.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      source: z.string().optional(),
      whoAtRisk: z.string().optional(),
      likelihood: z.number().min(1).max(5).optional(),
      severity: z.number().min(1).max(5).optional(),
      existingControls: z.string().optional(),
      aiControlElimination: z.string().optional(),
      aiControlSubstitution: z.string().optional(),
      aiControlEngineering: z.string().optional(),
      aiControlAdministrative: z.string().optional(),
      aiControlPPE: z.string().optional(),
      aiControlsGenerated: z.boolean().optional(),
      additionalControls: z.string().optional(),
      residualLikelihood: z.number().min(1).max(5).optional(),
      residualSeverity: z.number().min(1).max(5).optional(),
      riskOwner: z.string().optional(),
      responsible: z.string().optional(),
      legalReference: z.string().optional(),
      status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'MITIGATED', 'CLOSED', 'ACCEPTED']).optional(),
      reviewDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Recalculate scores if factors changed
    const l = data.likelihood ?? existing.likelihood;
    const s = data.severity ?? existing.severity;
    const riskScore = l * s;
    const riskLevel = getRiskLevel(l, s);

    const resL = data.residualLikelihood ?? existing.residualLikelihood ?? l;
    const resS = data.residualSeverity ?? existing.residualSeverity ?? s;
    const residualRiskScore = resL * resS;
    const residualRiskLevel = getRiskLevel(resL, resS);

    const risk = await prisma.risk.update({
      where: { id: req.params.id },
      data: {
        ...data,
        likelihood: l,
        severity: s,
        riskScore,
        riskLevel,
        residualLikelihood: resL,
        residualSeverity: resS,
        residualRiskScore,
        residualRiskLevel,
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : existing.reviewDate,
        lastReviewedAt: new Date(),
      },
    });

    res.json({ success: true, data: risk });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update risk error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update risk' } });
  }
});

// PUT /api/risks/:id - Update risk (alias for PATCH)
router.put('/:id', checkOwnership(prisma.risk), async (req: AuthRequest, res: Response) => {
  // Forward to PATCH handler
  req.method = 'PATCH';
  return router.handle(req, res, () => {});
});

// DELETE /api/risks/:id - Delete risk
router.delete('/:id', checkOwnership(prisma.risk), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.risk.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    }

    await prisma.risk.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete risk error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete risk' } });
  }
});

export default router;
