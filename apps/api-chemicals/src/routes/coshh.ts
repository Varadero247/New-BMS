import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { calculateRiskScore, getRiskLevel } from '../services/riskCalculator';

const router = Router();
const logger = createLogger('chem-coshh');

const exposureRouteEnum = z.enum(['INHALATION', 'SKIN_ABSORPTION', 'INGESTION', 'INJECTION', 'EYE_CONTACT']);
const rpeClassEnum = z.enum(['FFP1', 'FFP2', 'FFP3', 'HALF_MASK', 'FULL_FACE', 'SUPPLIED_AIR', 'NONE_REQUIRED']);

const createCoshhSchema = z.object({
  chemicalId: z.string().min(1),
  activityDescription: z.string().min(1, 'activityDescription is required'),
  locationBuilding: z.string().optional(),
  locationRoom: z.string().optional(),
  locationSite: z.string().optional(),
  personsExposed: z.array(z.string()).optional(),
  estimatedPersonsNum: z.number().optional(),
  includesContractors: z.boolean().optional(),
  includesVisitors: z.boolean().optional(),
  includesVulnerable: z.boolean().optional(),
  exposureRoutes: z.array(exposureRouteEnum).optional(),
  quantityUsed: z.number().optional(),
  quantityUnit: z.string().optional(),
  frequencyOfUse: z.string().optional(),
  durationPerUseMinutes: z.number().optional(),
  exposureDurationHrDay: z.number().optional(),
  welComparisonResult: z.string().optional(),
  airMonitoringRequired: z.boolean().optional(),
  airMonitoringFreq: z.string().optional(),
  inherentLikelihood: z.number().min(1).max(5),
  inherentSeverity: z.number().min(1).max(5),
  controlMeasures: z.any(),
  respiratoryProtection: z.string().optional(),
  rpeClass: rpeClassEnum.optional(),
  handProtectionGlove: z.string().optional(),
  gloveBreakthroughTime: z.string().optional(),
  eyeProtection: z.string().optional(),
  bodyProtection: z.string().optional(),
  footProtection: z.string().optional(),
  residualLikelihood: z.number().min(1).max(5),
  residualSeverity: z.number().min(1).max(5),
  residualRiskAccepted: z.boolean().optional(),
  spillMinorProcedure: z.string().optional(),
  spillMajorProcedure: z.string().optional(),
  fireEmergencyProc: z.string().optional(),
  injuryProc: z.string().optional(),
  emergencyPPERequired: z.string().optional(),
  healthSurveillanceReq: z.boolean().optional(),
  healthSurvDetails: z.string().optional(),
  recordRetentionYears: z.number().optional(),
  wasteDisposalMethod: z.string().optional(),
  substitutionConsidered: z.boolean().optional(),
  substitutionOutcome: z.string().optional(),
  assessorName: z.string().optional(),
  assessorJobTitle: z.string().optional(),
  assessmentDate: z.string().datetime({ offset: true }).or(z.string().datetime()),
  reviewDate: z.string().datetime({ offset: true }).or(z.string().datetime()),
  reviewTriggers: z.array(z.string()).optional(),
});

const updateCoshhSchema = createCoshhSchema.partial();

async function generateCoshhRef(orgId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.chemCoshh.count({ where: { orgId, referenceNumber: { startsWith: `COSHH-${year}` } } });
  return `COSHH-${year}-${String(count + 1).padStart(4, '0')}`;
}

// GET /api/coshh/due-review — assessments due for review
router.get('/due-review', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const days = parseInt(req.query.days as string) || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const data = await prisma.chemCoshh.findMany({
      where: { orgId, status: 'ACTIVE', reviewDate: { lte: futureDate }, deletedAt: null },
      include: { chemical: { select: { id: true, productName: true, casNumber: true } } },
      orderBy: { reviewDate: 'asc' },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to fetch due reviews', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch due reviews' } });
  }
});

// GET /api/coshh — all COSHH assessments (org-wide)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { status, riskLevel, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status as any;
    if (riskLevel) where.residualRiskLevel = riskLevel as any;
    if (search) {
      where.OR = [
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { activityDescription: { contains: search, mode: 'insensitive' } },
        { chemical: { productName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.chemCoshh.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { chemical: { select: { id: true, productName: true, casNumber: true, signalWord: true, pictograms: true } } },
      }),
      prisma.chemCoshh.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error: unknown) {
    logger.error('Failed to fetch COSHH assessments', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch COSHH assessments' } });
  }
});

// GET /api/coshh/:id — single COSHH assessment
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const item = await prisma.chemCoshh.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
      include: { chemical: true, exposureMonitoring: true },
    });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'COSHH assessment not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to fetch COSHH assessment', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch COSHH assessment' } });
  }
});

// POST /api/coshh — create COSHH assessment
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createCoshhSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const d = parsed.data;

    const chemical = await prisma.chemRegister.findFirst({ where: { id: d.chemicalId, orgId, deletedAt: null } as any });
    if (!chemical) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chemical not found' } });

    const referenceNumber = await generateCoshhRef(orgId);
    const inherentRiskScore = calculateRiskScore(d.inherentLikelihood, d.inherentSeverity);
    const inherentRiskLevel = getRiskLevel(inherentRiskScore);
    const residualRiskScore = calculateRiskScore(d.residualLikelihood, d.residualSeverity);
    const residualRiskLevel = getRiskLevel(residualRiskScore);

    // Auto-set health surveillance for CMR substances
    const healthSurveillanceReq = d.healthSurveillanceReq || chemical.isCmr;
    const recordRetentionYears = chemical.isCmr ? 40 : (d.recordRetentionYears || null);

    const data = await prisma.chemCoshh.create({
      data: {
        ...d,
        referenceNumber,
        inherentRiskScore,
        inherentRiskLevel,
        residualRiskScore,
        residualRiskLevel,
        healthSurveillanceReq,
        recordRetentionYears,
        orgId,
        createdBy: (req as AuthRequest).user?.id,
      } as any,
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create COSHH assessment', { error: (error as Error).message });
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create resource' } });
  }
});

// PUT /api/coshh/:id — update assessment
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateCoshhSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.chemCoshh.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'COSHH assessment not found' } });

    const d = parsed.data;
    const updates: Record<string, unknown> = { ...d };
    if (d.inherentLikelihood && d.inherentSeverity) {
      const inherentScore = calculateRiskScore(d.inherentLikelihood, d.inherentSeverity);
      updates.inherentRiskScore = inherentScore;
      updates.inherentRiskLevel = getRiskLevel(inherentScore);
    }
    if (d.residualLikelihood && d.residualSeverity) {
      const residualScore = calculateRiskScore(d.residualLikelihood, d.residualSeverity);
      updates.residualRiskScore = residualScore;
      updates.residualRiskLevel = getRiskLevel(residualScore);
    }

    const data = await prisma.chemCoshh.update({ where: { id: req.params.id }, data: updates });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update COSHH assessment', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } });
  }
});

// POST /api/coshh/:id/sign-off — assessor/supervisor sign-off
router.post('/:id/sign-off', authenticate, async (req: Request, res: Response) => {
  try {
    const signOffSchema = z.object({ role: z.enum(['assessor', 'supervisor']), name: z.string().min(1, 'name is required') });
    const parsed = signOffSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const { role, name } = parsed.data;
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.chemCoshh.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'COSHH assessment not found' } });

    const updates: Record<string, unknown> = {};
    if (role === 'assessor') {
      updates.assessorName = name;
      updates.assessorSignedAt = new Date();
    } else {
      updates.supervisorName = name;
      updates.supervisorSignedAt = new Date();
    }

    const data = await prisma.chemCoshh.update({ where: { id: req.params.id }, data: updates });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to sign off COSHH', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } });
  }
});

export default router;
