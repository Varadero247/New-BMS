import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { calculateFireRiskLevel, calculateRiskScore } from '../services/riskCalculator';

const router = Router();
const logger = createLogger('emergency-fra');

const riskLevelEnum = z.enum(['TRIVIAL', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH', 'INTOLERABLE']);

const createFraSchema = z.object({
  premisesId: z.string().trim().min(1).max(200),
  assessmentDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
  nextReviewDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
  assessorName: z.string().trim().min(1).max(200),
  assessorCompany: z.string().optional(),
  assessorQualification: z.string().optional(),
  assessorIsCompetent: z.boolean().optional(),
  ignitionSources: z.array(z.string()).optional().default([]),
  fuelSources: z.array(z.string()).optional().default([]),
  oxygenSources: z.array(z.string()).optional().default([]),
  totalPersonsAtRisk: z.number().int().optional(),
  employeesAtRisk: z.number().int().optional(),
  visitorsAtRisk: z.number().int().optional(),
  contractorsAtRisk: z.number().int().optional(),
  vulnerablePersonsPresent: z.boolean().optional(),
  outOfHoursRisk: z.boolean().optional(),
  existingPrecautions: z.any().optional(),
  likelihoodRating: z.number().int().min(1).max(5),
  consequenceRating: z.number().int().min(1).max(5),
  significantFindings: z.string().optional(),
  actionPlan: z.any().optional(),
  staffInformedDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  emergencyPlanInPlace: z.boolean().optional(),
  trainingConducted: z.boolean().optional(),
  reviewTriggered: z.array(z.string()).optional().default([]),
  reviewNotes: z.string().optional(),
  writtenRecordComplete: z.boolean().optional(),
  fireArrangementsDocumented: z.boolean().optional(),
  sharedWithIncomingRP: z.boolean().optional(),
});

const updateFraSchema = createFraSchema.partial();

async function generateFraRef(orgId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.femFireRiskAssessment.count({
    where: { organisationId: orgId, referenceNumber: { startsWith: `FRA-${year}` } },
  });
  return `FRA-${year}-${String(count + 1).padStart(4, '0')}`;
}

// GET /api/fra — all FRAs with filter
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const { status, premisesId, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { organisationId: orgId, deletedAt: null };
    if (status) where.assessmentStatus = status as any;
    if (premisesId) where.premisesId = premisesId as any;
    const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.femFireRiskAssessment.findMany({ where, skip, take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100), orderBy: { assessmentDate: 'desc' }, include: { premises: { select: { name: true } } } }),
      prisma.femFireRiskAssessment.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: Math.max(1, parseInt(page, 10) || 1), limit: Math.max(1, parseInt(limit, 10) || 20), total, totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)) } });
  } catch (error: unknown) { logger.error('Failed to fetch FRAs', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch fire risk assessments' } }); }
});

// GET /api/fra/overdue — FRAs past review date (MUST be before /:id)
router.get('/overdue', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const data = await prisma.femFireRiskAssessment.findMany({
      where: { organisationId: orgId, deletedAt: null, nextReviewDate: { lt: new Date() } as any },
      include: { premises: { select: { name: true } } },
      orderBy: { nextReviewDate: 'asc' },
      take: 1000});
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to fetch overdue FRAs', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch overdue FRAs' } }); }
});

// POST /api/fra — create FRA
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createFraSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = (req as any).user?.orgId || 'default';
    const referenceNumber = await generateFraRef(orgId);
    const overallRiskScore = calculateRiskScore(parsed.data.likelihoodRating, parsed.data.consequenceRating);
    const overallRiskLevel = calculateFireRiskLevel(parsed.data.likelihoodRating, parsed.data.consequenceRating);
    const { premisesId, assessmentDate, nextReviewDate, staffInformedDate, ...rest } = parsed.data;
    const data = await prisma.femFireRiskAssessment.create({
      data: {
        ...rest,
        premisesId,
        assessmentDate: new Date(assessmentDate),
        nextReviewDate: new Date(nextReviewDate),
        staffInformedDate: staffInformedDate ? new Date(staffInformedDate) : undefined,
        overallRiskScore,
        overallRiskLevel,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        organisationId: orgId,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to create FRA', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create fire risk assessment' } }); }
});

// GET /api/fra/:id — get full FRA
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const item = await prisma.femFireRiskAssessment.findFirst({
      where: { id: req.params.id, organisationId: orgId, deletedAt: null } as any,
      include: { premises: true },
    });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FRA not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) { logger.error('Failed to fetch FRA', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch FRA' } }); }
});

// PUT /api/fra/:id — update
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateFraSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const existing = await prisma.femFireRiskAssessment.findFirst({ where: { id: req.params.id, organisationId: orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FRA not found' } });
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.assessmentDate) updateData.assessmentDate = new Date(parsed.data.assessmentDate);
    if (parsed.data.nextReviewDate) updateData.nextReviewDate = new Date(parsed.data.nextReviewDate);
    if (parsed.data.staffInformedDate) updateData.staffInformedDate = new Date(parsed.data.staffInformedDate);
    if (parsed.data.likelihoodRating && parsed.data.consequenceRating) {
      updateData.overallRiskScore = calculateRiskScore(parsed.data.likelihoodRating, parsed.data.consequenceRating);
      updateData.overallRiskLevel = calculateFireRiskLevel(parsed.data.likelihoodRating, parsed.data.consequenceRating);
    }
    const data = await prisma.femFireRiskAssessment.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to update FRA', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update fire risk assessment' } }); }
});

// POST /api/fra/:id/approve — approve and sign off
router.post('/:id/approve', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const existing = await prisma.femFireRiskAssessment.findFirst({ where: { id: req.params.id, organisationId: orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FRA not found' } });
    const data = await prisma.femFireRiskAssessment.update({
      where: { id: req.params.id },
      data: { approvedBy: (req as AuthRequest).user?.id, approvedAt: new Date(), assessmentStatus: 'CURRENT', writtenRecordComplete: true },
    });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to approve FRA', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'APPROVE_ERROR', message: 'Failed to approve fire risk assessment' } }); }
});

// GET /api/fra/:id/action-plan — just the action plan items
router.get('/:id/action-plan', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const item = await prisma.femFireRiskAssessment.findFirst({
      where: { id: req.params.id, organisationId: orgId, deletedAt: null } as any,
      select: { id: true, referenceNumber: true, actionPlan: true, overallRiskLevel: true },
    });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FRA not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) { logger.error('Failed to fetch action plan', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch action plan' } }); }
});

export default router;
