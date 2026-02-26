// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma, Prisma } from '../prisma';
import {
  getRiskLevel,
  calculateScore,
  likelihoodToNum,
  consequenceToNum,
  mapCoshhToRisk,
  mapFraToRisk,
  mapIncidentToRisk,
  getAppetiteStatus,
} from '../services/riskScoring';

const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('risk-risks');

const likelihoodEnum = z.enum(['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN']);
const consequenceEnum = z.enum(['INSIGNIFICANT', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC']);
const categoryEnum = z.enum([
  'STRATEGIC',
  'OPERATIONAL',
  'FINANCIAL',
  'COMPLIANCE',
  'REPUTATIONAL',
  'ENVIRONMENTAL',
  'HEALTH_SAFETY',
  'INFORMATION_SECURITY',
  'QUALITY',
  'SUPPLY_CHAIN',
  'TECHNOLOGY_CYBER',
  'PEOPLE_HR',
  'EXTERNAL_GEOPOLITICAL',
  'PROJECT_PROGRAMME',
  'OTHER',
]);

const createRiskSchema = z.object({
  title: z.string().trim().min(1, 'title is required'),
  description: z.string().trim().optional(),
  category: categoryEnum,
  subcategory: z.string().trim().optional(),
  source: z.string().trim().optional(),
  owner: z.string().trim().optional(),
  ownerName: z.string().trim().optional(),
  ownerJobTitle: z.string().trim().optional(),
  department: z.string().trim().optional(),
  causes: z.array(z.string().trim()).optional(),
  riskEvent: z.string().trim().optional(),
  consequences: z.array(z.string().trim()).optional(),
  affectedObjectives: z.array(z.string().trim()).optional(),
  internalContext: z.string().trim().optional(),
  externalContext: z.string().trim().optional(),
  regulatoryRef: z.string().trim().optional(),
  sourceModule: z
    .enum([
      'MANUAL',
      'HEALTH_SAFETY',
      'CHEMICAL_COSHH',
      'FIRE_EMERGENCY',
      'QUALITY_MOD',
      'INFORMATION_SECURITY',
      'ENVIRONMENTAL',
      'SUPPLIER_MOD',
      'PROJECT_MOD',
      'FINANCIAL_MOD',
      'HR_MOD',
      'AUDIT_MOD',
    ])
    .optional(),
  sourceCoshhId: z.string().trim().optional(),
  sourceFireRiskId: z.string().trim().optional(),
  sourceChemicalId: z.string().trim().optional(),
  sourceIncidentId: z.string().trim().optional(),
  sourceAuditFindingId: z.string().trim().optional(),
  sourceEmergencyId: z.string().trim().optional(),
  likelihood: likelihoodEnum.optional(),
  consequence: consequenceEnum.optional(),
  inherentScore: z.number().nonnegative().optional(),
  inherentLikelihood: z.number().min(1).max(5).optional(),
  inherentConsequence: z.number().min(1).max(5).optional(),
  inherentRiskLevel: z.string().trim().optional(),
  inherentVelocity: z.enum(['IMMEDIATE', 'SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM']).optional(),
  controlEffectiveness: z.enum(['STRONG', 'ADEQUATE', 'WEAK', 'NONE_EFFECTIVE']).optional(),
  residualLikelihood: likelihoodEnum.optional(),
  residualConsequence: consequenceEnum.optional(),
  residualScore: z.number().nonnegative().optional(),
  residualLikelihoodNum: z.number().min(1).max(5).optional(),
  residualConsequenceNum: z.number().min(1).max(5).optional(),
  residualRiskLevel: z.string().trim().optional(),
  appetiteStatus: z.string().trim().optional(),
  alarpStatus: z.string().trim().optional(),
  acceptedByManagement: z.boolean().optional(),
  acceptedBy: z.string().trim().optional(),
  acceptanceJustification: z.string().trim().optional(),
  treatment: z
    .enum([
      'ACCEPT',
      'MITIGATE',
      'TRANSFER',
      'AVOID',
      'ESCALATE',
      'REDUCE_LIKELIHOOD',
      'REDUCE_CONSEQUENCE',
      'SHARE',
      'EXPLOIT',
    ])
    .optional(),
  treatmentPlan: z.string().trim().optional(),
  treatmentDescription: z.string().trim().optional(),
  treatmentTargetScore: z.number().nonnegative().optional(),
  treatmentTargetDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .optional()
    .or(z.string().trim().datetime({ offset: true }).optional()),
  treatmentCost: z.number().nonnegative().optional(),
  treatmentBenefit: z.string().trim().optional(),
  earlyWarningSigns: z.array(z.string().trim()).optional(),
  reviewFrequency: z.string().trim().optional(),
  nextReviewDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .optional()
    .or(z.string().trim().datetime({ offset: true }).optional()),
  relatedRiskIds: z.array(z.string().trim()).optional(),
  aggregationGroup: z.string().trim().optional(),
  controls: z.string().trim().optional(),
  status: z.enum(['IDENTIFIED', 'ASSESSED', 'TREATING', 'MONITORING', 'CLOSED']).optional(),
  dueDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .optional()
    .or(z.string().trim().datetime({ offset: true }).optional()),
  reviewDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .optional()
    .or(z.string().trim().datetime({ offset: true }).optional()),
  linkedIncident: z.string().trim().optional(),
  linkedAudit: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  notes: z.string().trim().optional(),
});

const updateRiskSchema = createRiskSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.riskRegister.count({
    where: { orgId, referenceNumber: { startsWith: `RISK-${year}` } },
  });
  return `RISK-${year}-${String(count + 1).padStart(4, '0')}`;
}

function autoCalculateFields(data: unknown): Record<string, unknown> {
  const result = { ...(data as Record<string, unknown>) } as Record<string, unknown>;
  // Auto-calculate inherent score from numeric or enum values
  if (result.inherentLikelihood && result.inherentConsequence) {
    result.inherentScore = calculateScore(result.inherentLikelihood as number, result.inherentConsequence as number);
    result.inherentRiskLevel = getRiskLevel(result.inherentScore as number);
  } else if (result.likelihood && result.consequence) {
    const l = likelihoodToNum(result.likelihood as string);
    const c = consequenceToNum(result.consequence as string);
    if (!result.inherentLikelihood) result.inherentLikelihood = l;
    if (!result.inherentConsequence) result.inherentConsequence = c;
    result.inherentScore = calculateScore(l, c);
    result.inherentRiskLevel = getRiskLevel(result.inherentScore as number);
  }
  // Auto-calculate residual score
  if (result.residualLikelihoodNum && result.residualConsequenceNum) {
    result.residualScore = calculateScore(
      result.residualLikelihoodNum as number,
      result.residualConsequenceNum as number
    );
    result.residualRiskLevel = getRiskLevel(result.residualScore as number);
  } else if (result.residualLikelihood && result.residualConsequence) {
    const rl = likelihoodToNum(result.residualLikelihood as string);
    const rc = consequenceToNum(result.residualConsequence as string);
    if (!result.residualLikelihoodNum) result.residualLikelihoodNum = rl;
    if (!result.residualConsequenceNum) result.residualConsequenceNum = rc;
    result.residualScore = calculateScore(rl, rc);
    result.residualRiskLevel = getRiskLevel(result.residualScore as number);
  }
  // Default next review date if not set
  if (!result.nextReviewDate) {
    const next = new Date();
    next.setMonth(next.getMonth() + 3);
    result.nextReviewDate = next.toISOString();
  }
  return result;
}

// Named routes BEFORE /:id
// GET /api/risks/register — full register export
router.get('/register', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const { page = '1', limit = '50' } = req.query as Record<string, string>;
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const where = { orgId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.riskRegister.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        include: {
          riskControls: { where: { isActive: true } },
          keyRiskIndicators: { where: { isActive: true } },
          treatmentActions: true,
        },
        orderBy: { residualScore: 'desc' },
      }),
      prisma.riskRegister.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: Math.max(1, parseInt(limit, 10) || 20),
        total,
        totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to fetch register', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch register' },
    });
  }
});

// GET /api/risks/heatmap
router.get('/heatmap', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const { category, owner, sourceModule: sm } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null, status: { not: 'CLOSED' } };
    if (category) where.category = category;
    if (owner) where.owner = owner;
    if (sm) where.sourceModule = sm;
    const risks = await prisma.riskRegister.findMany({
      where,
      select: {
        id: true,
        title: true,
        referenceNumber: true,
        residualLikelihoodNum: true,
        residualConsequenceNum: true,
        residualRiskLevel: true,
        category: true,
        ownerName: true,
      },
      take: 1000,
    });
    const matrix: Record<string, any[]> = {};
    for (const r of risks) {
      const l = r.residualLikelihoodNum || 3;
      const c = r.residualConsequenceNum || 3;
      const key = `${l}-${c}`;
      if (!matrix[key]) matrix[key] = [];
      matrix[key].push(r);
    }
    const heatmapData = [];
    for (let l = 1; l <= 5; l++) {
      for (let c = 1; c <= 5; c++) {
        const key = `${l}-${c}`;
        heatmapData.push({
          likelihood: l,
          consequence: c,
          count: (matrix[key] || []).length,
          risks: matrix[key] || [],
        });
      }
    }
    res.json({ success: true, data: { heatmapData, total: risks.length } });
  } catch (error: unknown) {
    logger.error('Failed to generate heatmap', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate heatmap' },
    });
  }
});

// GET /api/risks/overdue-review
router.get('/overdue-review', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const risks = await prisma.riskRegister.findMany({
      where: {
        orgId,
        deletedAt: null,
        status: { not: 'CLOSED' },
        nextReviewDate: { lt: new Date() },
      },
      orderBy: { nextReviewDate: 'asc' },
      select: {
        id: true,
        referenceNumber: true,
        title: true,
        ownerName: true,
        nextReviewDate: true,
        residualRiskLevel: true,
        category: true,
      },
      take: 1000,
    });
    res.json({ success: true, data: risks });
  } catch (error: unknown) {
    logger.error('Failed to fetch overdue reviews', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch overdue reviews' },
    });
  }
});

// GET /api/risks/exceeds-appetite
router.get('/exceeds-appetite', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const risks = await prisma.riskRegister.findMany({
      where: {
        orgId,
        deletedAt: null,
        appetiteStatus: 'EXCEEDS',
        status: { not: 'CLOSED' },
      },
      orderBy: { residualScore: 'desc' },
      select: {
        id: true,
        referenceNumber: true,
        title: true,
        category: true,
        residualRiskLevel: true,
        residualScore: true,
        ownerName: true,
      },
      take: 1000,
    });
    res.json({ success: true, data: risks });
  } catch (error: unknown) {
    logger.error('Failed to fetch exceeds-appetite', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch risks exceeding appetite' },
    });
  }
});

// GET /api/risks/by-category
router.get('/by-category', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const raw = await prisma.riskRegister.groupBy({
      by: ['category'],
      where: { orgId, deletedAt: null },
      _count: true,
    });
    res.json({
      success: true,
      data: raw.map((r: Record<string, unknown>) => ({
        category: r.category,
        count: (r as { _count: number })._count,
      })),
    });
  } catch (error: unknown) {
    logger.error('Failed to fetch by-category', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch category breakdown' },
    });
  }
});

// GET /api/risks/aggregate
router.get('/aggregate', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const { groupBy = 'category' } = req.query as Record<string, string>;
    const validFields = ['category', 'department', 'sourceModule', 'aggregationGroup', 'status'];
    const field = validFields.includes(groupBy) ? groupBy : 'category';
    const raw = await prisma.riskRegister.groupBy({
      by: [field as Prisma.RiskRegisterScalarFieldEnum],
      where: { orgId, deletedAt: null },
      _count: true,
    });
    res.json({
      success: true,
      data: raw.map((r: Record<string, unknown>) => ({
        group: r[field],
        count: (r as { _count: number })._count,
      })),
    });
  } catch (error: unknown) {
    logger.error('Failed to aggregate', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to aggregate risks' },
    });
  }
});

// POST /api/risks/from-coshh/:coshhId
router.post('/from-coshh/:coshhId', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const crossModuleSchema = z
      .object({
        id: z.string().trim().min(1, 'id is required'),
        title: z.string().trim().optional(),
      })
      .passthrough();
    const parsed = crossModuleSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const coshhData = parsed.data;
    const mapped = mapCoshhToRisk(coshhData);
    const referenceNumber = await generateRef(orgId);
    const data = await prisma.riskRegister.create({
      data: {
        ...(mapped as unknown as Prisma.RiskRegisterCreateInput),
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create risk from COSHH', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } });
  }
});

// POST /api/risks/from-fra/:fraId
router.post('/from-fra/:fraId', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const fraSchema = z
      .object({
        id: z.string().trim().min(1, 'id is required'),
        title: z.string().trim().optional(),
      })
      .passthrough();
    const parsedFra = fraSchema.safeParse(req.body);
    if (!parsedFra.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsedFra.error.errors[0].message },
      });
    const fraData = parsedFra.data;
    const mapped = mapFraToRisk(fraData);
    const referenceNumber = await generateRef(orgId);
    const data = await prisma.riskRegister.create({
      data: {
        ...(mapped as unknown as Prisma.RiskRegisterCreateInput),
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create risk from FRA', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } });
  }
});

// POST /api/risks/from-incident/:id
router.post('/from-incident/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const incidentSchema = z
      .object({
        id: z.string().trim().min(1, 'id is required'),
        title: z.string().trim().optional(),
      })
      .passthrough();
    const parsedInc = incidentSchema.safeParse(req.body);
    if (!parsedInc.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsedInc.error.errors[0].message },
      });
    const incidentData = parsedInc.data;
    const mapped = mapIncidentToRisk(incidentData);
    const referenceNumber = await generateRef(orgId);
    const data = await prisma.riskRegister.create({
      data: {
        ...(mapped as unknown as Prisma.RiskRegisterCreateInput),
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create risk from incident', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } });
  }
});

// POST /api/risks/from-audit/:id
router.post('/from-audit/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const auditSchema = z
      .object({ id: z.string().trim().optional(), title: z.string().trim().optional() })
      .passthrough();
    const parsedAudit = auditSchema.safeParse(req.body);
    if (!parsedAudit.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsedAudit.error.errors[0].message },
      });
    const auditData = parsedAudit.data;
    const referenceNumber = await generateRef(orgId);
    const data = await prisma.riskRegister.create({
      data: {
        title: `${auditData.title || 'Audit finding'} — compliance risk`,
        category: 'COMPLIANCE',
        sourceModule: 'AUDIT_MOD',
        sourceAuditFindingId: auditData.id || req.params.id,
        inherentLikelihood: 3,
        inherentConsequence: 3,
        inherentScore: 9,
        inherentRiskLevel: 'HIGH',
        likelihood: 'POSSIBLE',
        consequence: 'MODERATE',
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create risk from audit', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } });
  }
});

// GET /api/risks — list all with filters
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const {
      status,
      search,
      category,
      level,
      owner: ownerFilter,
      sourceModule: smFilter,
      page = '1',
      limit = '20',
      sort = 'createdAt',
      order = 'desc',
    } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (category) where.category = category;
    if (level) where.residualRiskLevel = level;
    if (ownerFilter) where.owner = ownerFilter;
    if (smFilter) where.sourceModule = smFilter;
    if (search)
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const validSorts = ['createdAt', 'residualScore', 'category', 'nextReviewDate', 'title'];
    const orderField = validSorts.includes(sort) ? sort : 'createdAt';
    const [data, total] = await Promise.all([
      prisma.riskRegister.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { [orderField]: order === 'asc' ? 'asc' : 'desc' },
      }),
      prisma.riskRegister.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: Math.max(1, parseInt(limit, 10) || 20),
        total,
        totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to fetch risks', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch risks' },
    });
  }
});

// GET /api/risks/:id — get risk with all relations
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const item = await prisma.riskRegister.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
      include: {
        riskControls: { where: { isActive: true } },
        keyRiskIndicators: {
          where: { isActive: true },
          include: { readings: { orderBy: { recordedAt: 'desc' }, take: 10 } },
        },
        treatmentActions: { orderBy: { targetDate: 'asc' } },
        reviews: { orderBy: { scheduledDate: 'desc' }, take: 10 },
        bowtie: true,
      },
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'risk not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to fetch risk', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch risk' } });
  }
});

// POST /api/risks — create risk (manual entry)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createRiskSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const calculated = autoCalculateFields(parsed.data);
    // Auto-check appetite status if we have residual score and appetite statements
    if (calculated.residualScore && calculated.category) {
      try {
        const appetite = await prisma.riskAppetiteStatement.findFirst({
          where: {
            category: calculated.category,
            isActive: true,
            OR: [{ organisationId: orgId }, { organisationId: null }],
          },
        });
        if (appetite) {
          calculated.appetiteStatus = getAppetiteStatus(
            calculated.residualScore as number,
            appetite
          );
        }
      } catch {
        /* appetite check optional */
      }
    }
    const data = await prisma.riskRegister.create({
      data: {
        ...(calculated as unknown as Prisma.RiskRegisterCreateInput),
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create risk', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } });
  }
});

// PUT /api/risks/:id — update risk
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateRiskSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.riskRegister.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'risk not found' } });
    const calculated = autoCalculateFields(parsed.data);
    const resScore = (calculated.residualScore ?? existing.residualScore) as number | null;
    const cat = calculated.category ?? existing.category;
    if (resScore && cat) {
      try {
        const appetite = await prisma.riskAppetiteStatement.findFirst({
          where: {
            category: cat,
            isActive: true,
            OR: [{ organisationId: orgId }, { organisationId: null }],
          },
        });
        if (appetite) {
          calculated.appetiteStatus = getAppetiteStatus(resScore, appetite);
        }
      } catch {
        /* optional */
      }
    }
    if (calculated.acceptedByManagement && !existing.acceptedByManagement) {
      calculated.acceptedAt = new Date();
    }
    const data = await prisma.riskRegister.update({
      where: { id: req.params.id },
      data: { ...calculated, updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update risk', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } });
  }
});

// DELETE /api/risks/:id — soft delete
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.riskRegister.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'risk not found' } });
    await prisma.riskRegister.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'risk deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete risk', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } });
  }
});

export default router;
