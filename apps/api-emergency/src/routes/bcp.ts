import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('emergency-bcp');

const emergencyTypeEnum = z.enum(['FIRE', 'EXPLOSION', 'CHEMICAL_SPILL', 'GAS_LEAK', 'FLOOD', 'STRUCTURAL_FAILURE', 'POWER_FAILURE', 'CYBER_ATTACK', 'BOMB_THREAT', 'CIVIL_UNREST', 'PANDEMIC', 'SEVERE_WEATHER', 'UTILITY_FAILURE', 'MEDICAL_MASS_CASUALTY', 'TERRORISM', 'ENVIRONMENTAL_RELEASE', 'SUPPLY_CHAIN_DISRUPTION', 'OTHER']);
const bcpStatusEnum = z.enum(['DRAFT', 'APPROVED', 'ACTIVE', 'UNDER_REVIEW', 'SUPERSEDED']);
const exerciseTypeEnum = z.enum(['TABLETOP', 'FUNCTIONAL', 'FULL_SCALE', 'DRILL', 'WALK_THROUGH']);
const exerciseOutcomeEnum = z.enum(['PASSED', 'PASSED_WITH_ACTIONS', 'FAILED', 'CANCELLED']);

const createBcpSchema = z.object({
  title: z.string().min(1, 'title is required'),
  version: z.string().optional(),
  emergencyTypes: z.array(emergencyTypeEnum).optional().default([]),
  scopeDescription: z.string().optional(),
  businessFunctions: z.array(z.string()).optional().default([]),
  crisisTeamLead: z.string().optional(),
  crisisTeamLeadPhone: z.string().optional(),
  crisisTeamMembers: z.any().optional(),
  crisisTeamMeetingPoint: z.string().optional(),
  crisisTeamVirtualLink: z.string().optional(),
  biaCompletedDate: z.string().optional(),
  criticalFunctions: z.any().optional(),
  recoveryStrategies: z.any().optional(),
  alternativeSites: z.any().optional(),
  itRecoveryApproach: z.string().optional(),
  communicationsBackup: z.string().optional(),
  activationCriteria: z.string().optional(),
  activationProcess: z.string().optional(),
  deactivationProcess: z.string().optional(),
  staffCommunicationPlan: z.string().optional(),
  customerCommPlan: z.string().optional(),
  supplierCommPlan: z.string().optional(),
  mediaCommPlan: z.string().optional(),
  regulatoryCommPlan: z.string().optional(),
  reviewDate: z.string(),
});

const updateBcpSchema = createBcpSchema.partial();

async function generateBcpRef(orgId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.femBusinessContinuityPlan.count({
    where: { organisationId: orgId, planReference: { startsWith: `BCP-${year}` } },
  });
  return `BCP-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET /api/bcp — all BCPs
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { organisationId: orgId };
    if (status) where.status = status as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.femBusinessContinuityPlan.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' }, include: { _count: { select: { exercises: true } } } }),
      prisma.femBusinessContinuityPlan.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error: unknown) { logger.error('Failed to fetch BCPs', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch BCPs' } }); }
});

// GET /api/bcp/due-review — BCPs approaching review date (before /:id)
router.get('/due-review', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const data = await prisma.femBusinessContinuityPlan.findMany({
      where: { organisationId: orgId, reviewDate: { lt: thirtyDaysFromNow } },
      orderBy: { reviewDate: 'asc' },
    });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to fetch BCPs due review', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch BCPs due review' } }); }
});

// POST /api/bcp — create BCP
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createBcpSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = (req as any).user?.orgId || 'default';
    const planReference = await generateBcpRef(orgId);
    const { reviewDate, biaCompletedDate, ...rest } = parsed.data;
    const data = await prisma.femBusinessContinuityPlan.create({
      data: {
        ...rest,
        planReference,
        reviewDate: new Date(reviewDate),
        biaCompletedDate: biaCompletedDate ? new Date(biaCompletedDate) : undefined,
        createdBy: (req as AuthRequest).user?.id,
        organisationId: orgId,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to create BCP', { error: (error as Error).message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: (error as Error).message } }); }
});

// GET /api/bcp/:id — get BCP with exercises
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await prisma.femBusinessContinuityPlan.findUnique({
      where: { id: req.params.id },
      include: { exercises: { orderBy: { scheduledDate: 'desc' } } },
    });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'BCP not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) { logger.error('Failed to fetch BCP', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch BCP' } }); }
});

// PUT /api/bcp/:id — update BCP
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateBcpSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await prisma.femBusinessContinuityPlan.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'BCP not found' } });
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.reviewDate) updateData.reviewDate = new Date(parsed.data.reviewDate);
    if (parsed.data.biaCompletedDate) updateData.biaCompletedDate = new Date(parsed.data.biaCompletedDate);
    const data = await prisma.femBusinessContinuityPlan.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to update BCP', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: (error as Error).message } }); }
});

// POST /api/bcp/:id/activate — activate BCP
router.post('/:id/activate', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await prisma.femBusinessContinuityPlan.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'BCP not found' } });
    const data = await prisma.femBusinessContinuityPlan.update({
      where: { id: req.params.id },
      data: { status: 'ACTIVE' },
    });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to activate BCP', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'ACTIVATE_ERROR', message: (error as Error).message } }); }
});

// POST /api/bcp/:id/exercise — create exercise
router.post('/:id/exercise', authenticate, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      exerciseType: exerciseTypeEnum,
      title: z.string().min(1),
      scheduledDate: z.string(),
      scope: z.string().optional(),
      participantsCount: z.number().int().optional(),
      externalPartiesInvolved: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await prisma.femBusinessContinuityPlan.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'BCP not found' } });
    const { scheduledDate, ...rest } = parsed.data;
    const data = await prisma.femBcpExercise.create({
      data: { ...rest, scheduledDate: new Date(scheduledDate), bcpId: req.params.id, createdBy: (req as AuthRequest).user?.id },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to create exercise', { error: (error as Error).message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: (error as Error).message } }); }
});

// PUT /api/bcp/:bcpId/exercise/:id — update exercise with results
router.put('/:bcpId/exercise/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      actualDate: z.string().optional(),
      durationHours: z.number().optional(),
      outcome: exerciseOutcomeEnum.optional(),
      objectivesMet: z.boolean().optional(),
      findings: z.string().optional(),
      strengthsIdentified: z.array(z.string()).optional(),
      weaknessesIdentified: z.array(z.string()).optional(),
      actionsRequired: z.any().optional(),
      reportUrl: z.string().optional(),
      facilitatorName: z.string().optional(),
      nextExerciseDate: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await prisma.femBcpExercise.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Exercise not found' } });
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.actualDate) updateData.actualDate = new Date(parsed.data.actualDate);
    if (parsed.data.nextExerciseDate) updateData.nextExerciseDate = new Date(parsed.data.nextExerciseDate);
    const data = await prisma.femBcpExercise.update({ where: { id: req.params.id }, data: updateData });
    // Update parent BCP test info
    if (parsed.data.outcome) {
      await prisma.femBusinessContinuityPlan.update({
        where: { id: req.params.bcpId },
        data: { lastTestedDate: new Date(), lastTestOutcome: parsed.data.outcome },
      });
    }
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to update exercise', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: (error as Error).message } }); }
});

export default router;
