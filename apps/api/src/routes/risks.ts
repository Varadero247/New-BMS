import { Router } from 'express';
import type { Router as IRouter } from 'express';
import { z } from 'zod';
import { prisma } from '@ims/database';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router: IRouter = Router();

// Validation schemas
const createRiskSchema = z.object({
  standard: z.enum(['ISO_45001', 'ISO_14001', 'ISO_9001']),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: z.string().optional(),
  source: z.string().optional(),
  likelihood: z.number().min(1).max(5).default(1),
  severity: z.number().min(1).max(5).default(1),
  detectability: z.number().min(1).max(5).default(1),
  aspectType: z.string().optional(),
  environmentalImpact: z.string().optional(),
  scale: z.number().min(1).max(5).optional(),
  frequency: z.number().min(1).max(5).optional(),
  legalImpact: z.number().min(1).max(5).optional(),
  processOwner: z.string().optional(),
  processInputs: z.string().optional(),
  processOutputs: z.string().optional(),
  kpis: z.string().optional(),
  existingControls: z.string().optional(),
  additionalControls: z.string().optional(),
  reviewDate: z.string().datetime().optional(),
});

const updateRiskSchema = createRiskSchema.partial().extend({
  status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'MITIGATED', 'CLOSED', 'ACCEPTED']).optional(),
  residualRisk: z.number().min(1).max(125).optional(),
});

// Calculate risk score and level
function calculateRiskScore(likelihood: number, severity: number, detectability: number) {
  const score = likelihood * severity * detectability;
  let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  if (score <= 8) level = 'LOW';
  else if (score <= 27) level = 'MEDIUM';
  else if (score <= 64) level = 'HIGH';
  else level = 'CRITICAL';
  return { score, level };
}

// Calculate significance score for environmental aspects
function calculateSignificanceScore(scale?: number, frequency?: number, legalImpact?: number) {
  if (!scale || !frequency || !legalImpact) return null;
  return scale * frequency * legalImpact;
}

// GET /api/risks - List all risks with filtering
router.get('/', authenticate, async (req, res, next) => {
  try {
    const {
      standard,
      status,
      riskLevel,
      search,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (standard) where.standard = standard;
    if (status) where.status = status;
    if (riskLevel) where.riskLevel = riskLevel;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [risks, total] = await Promise.all([
      prisma.risk.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          _count: {
            select: { actions: true, incidents: true },
          },
        },
      }),
      prisma.risk.count({ where }),
    ]);

    res.json({
      success: true,
      data: risks,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/risks/matrix - Get risk matrix data
router.get('/matrix', authenticate, async (req, res, next) => {
  try {
    const { standard } = req.query;

    const where: any = { status: 'ACTIVE' };
    if (standard) where.standard = standard;

    const risks = await prisma.risk.findMany({
      where,
      select: {
        id: true,
        title: true,
        likelihood: true,
        severity: true,
        riskScore: true,
        riskLevel: true,
        standard: true,
      },
    });

    // Create 5x5 matrix
    const matrix: { [key: string]: any[] } = {};
    for (let l = 1; l <= 5; l++) {
      for (let s = 1; s <= 5; s++) {
        matrix[`${l}-${s}`] = [];
      }
    }

    risks.forEach((risk) => {
      const key = `${risk.likelihood}-${risk.severity}`;
      matrix[key].push(risk);
    });

    res.json({
      success: true,
      data: { matrix, risks },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/risks/:id - Get single risk
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const risk = await prisma.risk.findUnique({
      where: { id: req.params.id },
      include: {
        actions: {
          include: {
            owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        incidents: {
          take: 5,
          orderBy: { dateOccurred: 'desc' },
        },
        bowTieAnalyses: true,
        aiAnalyses: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!risk) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Risk not found' },
      });
    }

    res.json({ success: true, data: risk });
  } catch (error) {
    next(error);
  }
});

// POST /api/risks - Create new risk
router.post('/', authenticate, validate(createRiskSchema), async (req, res, next) => {
  try {
    const { likelihood, severity, detectability, scale, frequency, legalImpact, ...rest } = req.body;

    const { score, level } = calculateRiskScore(likelihood, severity, detectability);
    const significanceScore = calculateSignificanceScore(scale, frequency, legalImpact);

    const risk = await prisma.risk.create({
      data: {
        ...rest,
        likelihood,
        severity,
        detectability,
        riskScore: score,
        riskLevel: level,
        scale,
        frequency,
        legalImpact,
        significanceScore,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Risk',
        entityId: risk.id,
        newData: risk as any,
      },
    });

    res.status(201).json({ success: true, data: risk });
  } catch (error) {
    next(error);
  }
});

// PUT /api/risks/:id - Update risk
router.put('/:id', authenticate, validate(updateRiskSchema), async (req, res, next) => {
  try {
    const existing = await prisma.risk.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Risk not found' },
      });
    }

    const { likelihood, severity, detectability, scale, frequency, legalImpact, ...rest } = req.body;

    // Recalculate scores if values changed
    const newLikelihood = likelihood ?? existing.likelihood;
    const newSeverity = severity ?? existing.severity;
    const newDetectability = detectability ?? existing.detectability;
    const { score, level } = calculateRiskScore(newLikelihood, newSeverity, newDetectability);

    const newScale = scale ?? existing.scale;
    const newFrequency = frequency ?? existing.frequency;
    const newLegalImpact = legalImpact ?? existing.legalImpact;
    const significanceScore = calculateSignificanceScore(newScale, newFrequency, newLegalImpact);

    const risk = await prisma.risk.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        likelihood: newLikelihood,
        severity: newSeverity,
        detectability: newDetectability,
        riskScore: score,
        riskLevel: level,
        scale: newScale,
        frequency: newFrequency,
        legalImpact: newLegalImpact,
        significanceScore,
        lastReviewedAt: new Date(),
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Risk',
        entityId: risk.id,
        oldData: existing as any,
        newData: risk as any,
      },
    });

    res.json({ success: true, data: risk });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/risks/:id - Delete risk
router.delete('/:id', authenticate, requireRole(['ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const existing = await prisma.risk.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Risk not found' },
      });
    }

    await prisma.risk.delete({
      where: { id: req.params.id },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'Risk',
        entityId: req.params.id,
        oldData: existing as any,
      },
    });

    res.json({ success: true, data: { message: 'Risk deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
