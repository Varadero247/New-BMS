import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import {
  getRiskLevel, calculateScore, likelihoodToNum, consequenceToNum,
  mapCoshhToRisk, mapFraToRisk, mapIncidentToRisk, getAppetiteStatus,
} from '../services/riskScoring';

const router = Router();
const logger = createLogger('risk-risks');

const likelihoodEnum = z.enum(['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN']);
const consequenceEnum = z.enum(['INSIGNIFICANT', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC']);
const categoryEnum = z.enum([
  'STRATEGIC', 'OPERATIONAL', 'FINANCIAL', 'COMPLIANCE', 'REPUTATIONAL', 'ENVIRONMENTAL',
  'HEALTH_SAFETY', 'INFORMATION_SECURITY', 'QUALITY', 'SUPPLY_CHAIN', 'TECHNOLOGY_CYBER',
  'PEOPLE_HR', 'EXTERNAL_GEOPOLITICAL', 'PROJECT_PROGRAMME', 'OTHER',
]);

const createRiskSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  category: categoryEnum,
  subcategory: z.string().optional(),
  source: z.string().optional(),
  owner: z.string().optional(),
  ownerName: z.string().optional(),
  ownerJobTitle: z.string().optional(),
  department: z.string().optional(),
  causes: z.array(z.string()).optional(),
  riskEvent: z.string().optional(),
  consequences: z.array(z.string()).optional(),
  affectedObjectives: z.array(z.string()).optional(),
  internalContext: z.string().optional(),
  externalContext: z.string().optional(),
  regulatoryRef: z.string().optional(),
  sourceModule: z.enum(['MANUAL', 'HEALTH_SAFETY', 'CHEMICAL_COSHH', 'FIRE_EMERGENCY', 'QUALITY_MOD', 'INFORMATION_SECURITY', 'ENVIRONMENTAL', 'SUPPLIER_MOD', 'PROJECT_MOD', 'FINANCIAL_MOD', 'HR_MOD', 'AUDIT_MOD']).optional(),
  sourceCoshhId: z.string().optional(),
  sourceFireRiskId: z.string().optional(),
  sourceChemicalId: z.string().optional(),
  sourceIncidentId: z.string().optional(),
  sourceAuditFindingId: z.string().optional(),
  sourceEmergencyId: z.string().optional(),
  likelihood: likelihoodEnum.optional(),
  consequence: consequenceEnum.optional(),
  inherentScore: z.number().optional(),
  inherentLikelihood: z.number().min(1).max(5).optional(),
  inherentConsequence: z.number().min(1).max(5).optional(),
  inherentRiskLevel: z.string().optional(),
  inherentVelocity: z.enum(['IMMEDIATE', 'SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM']).optional(),
  controlEffectiveness: z.enum(['STRONG', 'ADEQUATE', 'WEAK', 'NONE_EFFECTIVE']).optional(),
  residualLikelihood: likelihoodEnum.optional(),
  residualConsequence: consequenceEnum.optional(),
  residualScore: z.number().optional(),
  residualLikelihoodNum: z.number().min(1).max(5).optional(),
  residualConsequenceNum: z.number().min(1).max(5).optional(),
  residualRiskLevel: z.string().optional(),
  appetiteStatus: z.string().optional(),
  alarpStatus: z.string().optional(),
  acceptedByManagement: z.boolean().optional(),
  acceptedBy: z.string().optional(),
  acceptanceJustification: z.string().optional(),
  treatment: z.enum(['ACCEPT', 'MITIGATE', 'TRANSFER', 'AVOID', 'ESCALATE', 'REDUCE_LIKELIHOOD', 'REDUCE_CONSEQUENCE', 'SHARE', 'EXPLOIT']).optional(),
  treatmentPlan: z.string().optional(),
  treatmentDescription: z.string().optional(),
  treatmentTargetScore: z.number().optional(),
  treatmentTargetDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  treatmentCost: z.number().optional(),
  treatmentBenefit: z.string().optional(),
  earlyWarningSigns: z.array(z.string()).optional(),
  reviewFrequency: z.string().optional(),
  nextReviewDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  relatedRiskIds: z.array(z.string()).optional(),
  aggregationGroup: z.string().optional(),
  controls: z.string().optional(),
  status: z.enum(['IDENTIFIED', 'ASSESSED', 'TREATING', 'MONITORING', 'CLOSED']).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  reviewDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  linkedIncident: z.string().optional(),
  linkedAudit: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const updateRiskSchema = createRiskSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.riskRegister.count({ where: { orgId, referenceNumber: { startsWith: `RISK-${year}` } } });
  return `RISK-${year}-${String(count + 1).padStart(4, '0')}`;
}

function autoCalculateFields(data: unknown): Record<string, unknown> {
  const result = { ...(data as any) } as Record<string, any>;
  // Auto-calculate inherent score from numeric or enum values
  if (result.inherentLikelihood && result.inherentConsequence) {
    result.inherentScore = calculateScore(result.inherentLikelihood, result.inherentConsequence);
    result.inherentRiskLevel = getRiskLevel(result.inherentScore);
  } else if (result.likelihood && result.consequence) {
    const l = likelihoodToNum(result.likelihood);
    const c = consequenceToNum(result.consequence);
    if (!result.inherentLikelihood) result.inherentLikelihood = l;
    if (!result.inherentConsequence) result.inherentConsequence = c;
    result.inherentScore = calculateScore(l, c);
    result.inherentRiskLevel = getRiskLevel(result.inherentScore);
  }
  // Auto-calculate residual score
  if (result.residualLikelihoodNum && result.residualConsequenceNum) {
    result.residualScore = calculateScore(result.residualLikelihoodNum, result.residualConsequenceNum);
    result.residualRiskLevel = getRiskLevel(result.residualScore);
  } else if (result.residualLikelihood && result.residualConsequence) {
    const rl = likelihoodToNum(result.residualLikelihood);
    const rc = consequenceToNum(result.residualConsequence);
    if (!result.residualLikelihoodNum) result.residualLikelihoodNum = rl;
    if (!result.residualConsequenceNum) result.residualConsequenceNum = rc;
    result.residualScore = calculateScore(rl, rc);
    result.residualRiskLevel = getRiskLevel(result.residualScore);
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
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { page = '1', limit = '50' } = req.query as Record<string, string>;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const where = { orgId, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.riskRegister.findMany({
        where, skip, take: Math.min(parseInt(limit, 10) || 20, 100),
        include: { riskControls: { where: { isActive: true } }, keyRiskIndicators: { where: { isActive: true } }, treatmentActions: true },
        orderBy: { residualScore: 'desc' },
      }),
      prisma.riskRegister.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit, 10)) } });
  } catch (error: unknown) { logger.error('Failed to fetch register', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch register' } }); }
});

// GET /api/risks/heatmap
router.get('/heatmap', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { category, owner, sourceModule: sm } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null, status: { not: 'CLOSED' } };
    if (category) where.category = category as any;
    if (owner) where.owner = owner as any;
    if (sm) where.sourceModule = sm as any;
    const risks = await prisma.riskRegister.findMany({
      where,
      select: { id: true, title: true, referenceNumber: true, residualLikelihoodNum: true, residualConsequenceNum: true, residualRiskLevel: true, category: true, ownerName: true },
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
        heatmapData.push({ likelihood: l, consequence: c, count: (matrix[key] || []).length, risks: matrix[key] || [] });
      }
    }
    res.json({ success: true, data: { heatmapData, total: risks.length } });
  } catch (error: unknown) { logger.error('Failed to generate heatmap', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate heatmap' } }); }
});

// GET /api/risks/overdue-review
router.get('/overdue-review', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const risks = await prisma.riskRegister.findMany({
      where: { orgId, deletedAt: null, status: { not: 'CLOSED' } as any, nextReviewDate: { lt: new Date() } },
      orderBy: { nextReviewDate: 'asc' },
      select: { id: true, referenceNumber: true, title: true, ownerName: true, nextReviewDate: true, residualRiskLevel: true, category: true },
    });
    res.json({ success: true, data: risks });
  } catch (error: unknown) { logger.error('Failed to fetch overdue reviews', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch overdue reviews' } }); }
});

// GET /api/risks/exceeds-appetite
router.get('/exceeds-appetite', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const risks = await prisma.riskRegister.findMany({
      where: { orgId, deletedAt: null, appetiteStatus: 'EXCEEDS', status: { not: 'CLOSED' } as any },
      orderBy: { residualScore: 'desc' },
      select: { id: true, referenceNumber: true, title: true, category: true, residualRiskLevel: true, residualScore: true, ownerName: true },
    });
    res.json({ success: true, data: risks });
  } catch (error: unknown) { logger.error('Failed to fetch exceeds-appetite', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch risks exceeding appetite' } }); }
});

// GET /api/risks/by-category
router.get('/by-category', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const raw = await prisma.riskRegister.groupBy({
      by: ['category'], where: { orgId, deletedAt: null } as any, _count: true,
    });
    res.json({ success: true, data: raw.map((r: Record<string, unknown>) => ({ category: r.category, count: (r as any)._count })) });
  } catch (error: unknown) { logger.error('Failed to fetch by-category', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch category breakdown' } }); }
});

// GET /api/risks/aggregate
router.get('/aggregate', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { groupBy = 'category' } = req.query as Record<string, string>;
    const validFields = ['category', 'department', 'sourceModule', 'aggregationGroup', 'status'];
    const field = validFields.includes(groupBy) ? groupBy : 'category';
    const raw = await prisma.riskRegister.groupBy({
      by: [field] as any, where: { orgId, deletedAt: null } as any, _count: true,
    });
    res.json({ success: true, data: raw.map((r: Record<string, unknown>) => ({ group: r[field], count: (r as any)._count })) });
  } catch (error: unknown) { logger.error('Failed to aggregate', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to aggregate risks' } }); }
});

// POST /api/risks/from-coshh/:coshhId
router.post('/from-coshh/:coshhId', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const crossModuleSchema = z.object({ id: z.string().min(1, 'id is required'), title: z.string().optional() }).passthrough();
    const parsed = crossModuleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const coshhData = parsed.data;
    const mapped = mapCoshhToRisk(coshhData);
    const referenceNumber = await generateRef(orgId);
    const data = await prisma.riskRegister.create({
      data: { ...mapped, orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id } as any,
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to create risk from COSHH', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } }); }
});

// POST /api/risks/from-fra/:fraId
router.post('/from-fra/:fraId', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const fraSchema = z.object({ id: z.string().min(1, 'id is required'), title: z.string().optional() }).passthrough();
    const parsedFra = fraSchema.safeParse(req.body);
    if (!parsedFra.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsedFra.error.errors[0].message } });
    const fraData = parsedFra.data;
    const mapped = mapFraToRisk(fraData);
    const referenceNumber = await generateRef(orgId);
    const data = await prisma.riskRegister.create({
      data: { ...mapped, orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id } as any,
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to create risk from FRA', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } }); }
});

// POST /api/risks/from-incident/:id
router.post('/from-incident/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const incidentSchema = z.object({ id: z.string().min(1, 'id is required'), title: z.string().optional() }).passthrough();
    const parsedInc = incidentSchema.safeParse(req.body);
    if (!parsedInc.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsedInc.error.errors[0].message } });
    const incidentData = parsedInc.data;
    const mapped = mapIncidentToRisk(incidentData);
    const referenceNumber = await generateRef(orgId);
    const data = await prisma.riskRegister.create({
      data: { ...mapped, orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id } as any,
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to create risk from incident', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } }); }
});

// POST /api/risks/from-audit/:id
router.post('/from-audit/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const auditSchema = z.object({ id: z.string().optional(), title: z.string().optional() }).passthrough();
    const parsedAudit = auditSchema.safeParse(req.body);
    if (!parsedAudit.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsedAudit.error.errors[0].message } });
    const auditData = parsedAudit.data;
    const referenceNumber = await generateRef(orgId);
    const data = await prisma.riskRegister.create({
      data: {
        title: `${auditData.title || 'Audit finding'} — compliance risk`,
        category: 'COMPLIANCE',
        sourceModule: 'AUDIT_MOD',
        sourceAuditFindingId: auditData.id || req.params.id,
        inherentLikelihood: 3, inherentConsequence: 3, inherentScore: 9,
        inherentRiskLevel: 'HIGH', likelihood: 'POSSIBLE', consequence: 'MODERATE',
        orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id,
      } as any,
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to create risk from audit', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } }); }
});

// GET /api/risks — list all with filters
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { status, search, category, level, owner: ownerFilter, sourceModule: smFilter, page = '1', limit = '20', sort = 'createdAt', order = 'desc' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status as any;
    if (category) where.category = category as any;
    if (level) where.residualRiskLevel = level as any;
    if (ownerFilter) where.owner = ownerFilter as any;
    if (smFilter) where.sourceModule = smFilter as any;
    if (search) where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { referenceNumber: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const validSorts = ['createdAt', 'residualScore', 'category', 'nextReviewDate', 'title'];
    const orderField = validSorts.includes(sort) ? sort : 'createdAt';
    const [data, total] = await Promise.all([
      prisma.riskRegister.findMany({ where, skip, take: Math.min(parseInt(limit, 10) || 20, 100), orderBy: { [orderField]: order === 'asc' ? 'asc' : 'desc' } }),
      prisma.riskRegister.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit, 10)) } });
  } catch (error: unknown) { logger.error('Failed to fetch risks', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch risks' } }); }
});

// GET /api/risks/:id — get risk with all relations
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const item = await prisma.riskRegister.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
      include: {
        riskControls: { where: { isActive: true } },
        keyRiskIndicators: { where: { isActive: true }, include: { readings: { orderBy: { recordedAt: 'desc' }, take: 10 } } },
        treatmentActions: { orderBy: { targetDate: 'asc' } },
        reviews: { orderBy: { scheduledDate: 'desc' }, take: 10 },
        bowtie: true,
      },
    });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'risk not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) { logger.error('Failed to fetch risk', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch risk' } }); }
});

// POST /api/risks — create risk (manual entry)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createRiskSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const calculated = autoCalculateFields(parsed.data);
    // Auto-check appetite status if we have residual score and appetite statements
    if (calculated.residualScore && calculated.category) {
      try {
        const appetite = await prisma.riskAppetiteStatement.findFirst({
          where: { category: calculated.category, isActive: true, OR: [{ organisationId: orgId }, { organisationId: null }] },
        });
        if (appetite) {
          calculated.appetiteStatus = getAppetiteStatus(calculated.residualScore as number, appetite);
        }
      } catch { /* appetite check optional */ }
    }
    const data = await prisma.riskRegister.create({
      data: { ...calculated, orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id } as any,
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to create risk', { error: (error as Error).message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Operation failed' } }); }
});

// PUT /api/risks/:id — update risk
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateRiskSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.riskRegister.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'risk not found' } });
    const calculated = autoCalculateFields(parsed.data);
    const resScore = (calculated.residualScore ?? existing.residualScore) as any;
    const cat = (calculated.category ?? existing.category) as any;
    if (resScore && cat) {
      try {
        const appetite = await prisma.riskAppetiteStatement.findFirst({
          where: { category: cat, isActive: true, OR: [{ organisationId: orgId }, { organisationId: null }] },
        });
        if (appetite) {
          calculated.appetiteStatus = getAppetiteStatus(resScore, appetite);
        }
      } catch { /* optional */ }
    }
    if (calculated.acceptedByManagement && !existing.acceptedByManagement) {
      calculated.acceptedAt = new Date();
    }
    const data = await prisma.riskRegister.update({
      where: { id: req.params.id },
      data: { ...calculated, updatedBy: (req as AuthRequest).user?.id } as any,
    });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to update risk', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } }); }
});

// DELETE /api/risks/:id — soft delete
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.riskRegister.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'risk not found' } });
    await prisma.riskRegister.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id } });
    res.json({ success: true, data: { message: 'risk deleted successfully' } });
  } catch (error: unknown) { logger.error('Failed to delete risk', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } }); }
});

export default router;
