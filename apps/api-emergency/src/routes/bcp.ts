// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { validateIdParam } from '@ims/shared';

const router = Router();
const logger = createLogger('emergency-bcp');
router.param('id', validateIdParam());
router.param('bcpId', validateIdParam('bcpId'));

const emergencyTypeEnum = z.enum([
  'FIRE',
  'EXPLOSION',
  'CHEMICAL_SPILL',
  'GAS_LEAK',
  'FLOOD',
  'STRUCTURAL_FAILURE',
  'POWER_FAILURE',
  'CYBER_ATTACK',
  'BOMB_THREAT',
  'CIVIL_UNREST',
  'PANDEMIC',
  'SEVERE_WEATHER',
  'UTILITY_FAILURE',
  'MEDICAL_MASS_CASUALTY',
  'TERRORISM',
  'ENVIRONMENTAL_RELEASE',
  'SUPPLY_CHAIN_DISRUPTION',
  'OTHER',
]);
const _bcpStatusEnum = z.enum(['DRAFT', 'APPROVED', 'ACTIVE', 'UNDER_REVIEW', 'SUPERSEDED']);
const exerciseTypeEnum = z.enum(['TABLETOP', 'FUNCTIONAL', 'FULL_SCALE', 'DRILL', 'WALK_THROUGH']);
const exerciseOutcomeEnum = z.enum(['PASSED', 'PASSED_WITH_ACTIONS', 'FAILED', 'CANCELLED']);

const createBcpSchema = z.object({
  title: z.string().trim().min(1, 'title is required'),
  version: z.string().trim().optional(),
  emergencyTypes: z.array(emergencyTypeEnum).optional().default([]),
  scopeDescription: z.string().trim().optional(),
  businessFunctions: z.array(z.string().trim()).optional().default([]),
  crisisTeamLead: z.string().trim().optional(),
  crisisTeamLeadPhone: z.string().trim().optional(),
  crisisTeamMembers: z.any().optional(),
  crisisTeamMeetingPoint: z.string().trim().optional(),
  crisisTeamVirtualLink: z.string().trim().optional(),
  biaCompletedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  criticalFunctions: z.any().optional(),
  recoveryStrategies: z.any().optional(),
  alternativeSites: z.any().optional(),
  itRecoveryApproach: z.string().trim().optional(),
  communicationsBackup: z.string().trim().optional(),
  activationCriteria: z.string().trim().optional(),
  activationProcess: z.string().trim().optional(),
  deactivationProcess: z.string().trim().optional(),
  staffCommunicationPlan: z.string().trim().optional(),
  customerCommPlan: z.string().trim().optional(),
  supplierCommPlan: z.string().trim().optional(),
  mediaCommPlan: z.string().trim().optional(),
  regulatoryCommPlan: z.string().trim().optional(),
  reviewDate: z
    .string()
    .trim()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
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
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { organisationId: orgId };
    if (status) where.status = status;
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.femBusinessContinuityPlan.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { exercises: true } } },
      }),
      prisma.femBusinessContinuityPlan.count({ where }),
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
    logger.error('Failed to fetch BCPs', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch BCPs' } });
  }
});

// GET /api/bcp/due-review — BCPs approaching review date (before /:id)
router.get('/due-review', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const data = await prisma.femBusinessContinuityPlan.findMany({
      where: { organisationId: orgId, reviewDate: { lt: thirtyDaysFromNow } },
      orderBy: { reviewDate: 'asc' },
      take: 1000,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to fetch BCPs due review', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch BCPs due review' },
    });
  }
});

// POST /api/bcp — create BCP
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createBcpSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
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
  } catch (error: unknown) {
    logger.error('Failed to create BCP', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create business continuity plan' },
    });
  }
});

// GET /api/bcp/:id — get BCP with exercises
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await prisma.femBusinessContinuityPlan.findUnique({
      where: { id: req.params.id },
      include: { exercises: { orderBy: { scheduledDate: 'desc' } } },
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'BCP not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to fetch BCP', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch BCP' } });
  }
});

// PUT /api/bcp/:id — update BCP
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateBcpSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.femBusinessContinuityPlan.findFirst({
      where: { id: req.params.id, organisationId: orgId },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'BCP not found' } });
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.reviewDate) updateData.reviewDate = new Date(parsed.data.reviewDate);
    if (parsed.data.biaCompletedDate)
      updateData.biaCompletedDate = new Date(parsed.data.biaCompletedDate);
    const data = await prisma.femBusinessContinuityPlan.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update BCP', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update business continuity plan' },
    });
  }
});

// POST /api/bcp/:id/activate — activate BCP
router.post('/:id/activate', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.femBusinessContinuityPlan.findFirst({
      where: { id: req.params.id, organisationId: orgId },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'BCP not found' } });
    const data = await prisma.femBusinessContinuityPlan.update({
      where: { id: req.params.id },
      data: { status: 'ACTIVE' },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to activate BCP', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'ACTIVATE_ERROR', message: 'Failed to activate business continuity plan' },
    });
  }
});

// POST /api/bcp/:id/exercise — create exercise
router.post('/:id/exercise', authenticate, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      exerciseType: exerciseTypeEnum,
      title: z.string().trim().min(1).max(200),
      scheduledDate: z
        .string()
        .trim()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      scope: z.string().trim().optional(),
      participantsCount: z.number().int().optional(),
      externalPartiesInvolved: z.boolean().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.femBusinessContinuityPlan.findFirst({
      where: { id: req.params.id, organisationId: orgId },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'BCP not found' } });
    const { scheduledDate, ...rest } = parsed.data;
    const data = await prisma.femBcpExercise.create({
      data: {
        ...rest,
        scheduledDate: new Date(scheduledDate),
        bcpId: req.params.id,
        createdBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create exercise', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create exercise' },
    });
  }
});

// PUT /api/bcp/:bcpId/exercise/:id — update exercise with results
router.put('/:bcpId/exercise/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      actualDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      durationHours: z.number().nonnegative().optional(),
      outcome: exerciseOutcomeEnum.optional(),
      objectivesMet: z.boolean().optional(),
      findings: z.string().trim().optional(),
      strengthsIdentified: z.array(z.string().trim()).optional(),
      weaknessesIdentified: z.array(z.string().trim()).optional(),
      actionsRequired: z.any().optional(),
      reportUrl: z.string().trim().url('Invalid URL').optional(),
      facilitatorName: z.string().trim().optional(),
      nextExerciseDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const existing = await prisma.femBcpExercise.findFirst({
      where: {
        id: req.params.id,
        bcp: { organisationId: ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default' },
      },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Exercise not found' } });
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.actualDate) updateData.actualDate = new Date(parsed.data.actualDate);
    if (parsed.data.nextExerciseDate)
      updateData.nextExerciseDate = new Date(parsed.data.nextExerciseDate);
    const data = await prisma.femBcpExercise.update({
      where: { id: req.params.id },
      data: updateData,
    });
    // Update parent BCP test info
    if (parsed.data.outcome) {
      await prisma.femBusinessContinuityPlan.update({
        where: { id: req.params.bcpId },
        data: { lastTestedDate: new Date(), lastTestOutcome: parsed.data.outcome },
      });
    }
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update exercise', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update exercise' },
    });
  }
});

export default router;
