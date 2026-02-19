import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-environment');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// Reference Number Generators
// ============================================

async function generatePlanRefNumber(): Promise<string> {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const count = await prisma.envEmergencyPlan.count({
    where: { refNumber: { startsWith: `EEP-${yymm}` } },
  });
  return `EEP-${yymm}-${String(count + 1).padStart(4, '0')}`;
}

async function generateIncidentRefNumber(): Promise<string> {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const count = await prisma.envEmergencyIncident.count({
    where: { refNumber: { startsWith: `EEI-${yymm}` } },
  });
  return `EEI-${yymm}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// EMERGENCY PLANS (ISO 14001 Clause 8.2)
// ============================================

// POST /plans — Create emergency plan
router.post('/plans', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      scenario: z.string().trim().min(1).max(200),
      triggerConditions: z.string().trim().min(1).max(200),
      immediateResponse: z.string().trim().min(1).max(2000),
      notificationReqs: z.string().trim().optional(),
      containmentProcs: z.string().trim().optional(),
      impactMitigation: z.string().trim().optional(),
      recoveryActions: z.string().trim().optional(),
      reviewSchedule: z.string().trim().optional(),
      status: z.enum(['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'ARCHIVED']).optional(),
      lastReviewDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      nextReviewDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generatePlanRefNumber();

    const plan = await prisma.envEmergencyPlan.create({
      data: {
        refNumber,
        title: data.title,
        scenario: data.scenario,
        triggerConditions: data.triggerConditions,
        immediateResponse: data.immediateResponse,
        notificationReqs: data.notificationReqs,
        containmentProcs: data.containmentProcs,
        impactMitigation: data.impactMitigation,
        recoveryActions: data.recoveryActions,
        reviewSchedule: data.reviewSchedule,
        status: (data.status as any) || 'DRAFT',
        lastReviewDate: data.lastReviewDate ? new Date(data.lastReviewDate) : null,
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : null,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create emergency plan error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create emergency plan' },
    });
  }
});

// GET /plans — List plans with pagination
router.get('/plans', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status, search } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { scenario: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [plans, total] = await Promise.all([
      prisma.envEmergencyPlan.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { drills: { orderBy: { drillDate: 'desc' }, take: 5 } },
      }),
      prisma.envEmergencyPlan.count({ where }),
    ]);

    res.json({
      success: true,
      data: plans,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List emergency plans error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list emergency plans' },
    });
  }
});

// PUT /plans/:id — Update plan
const planUpdateSchema = z.object({
  title: z.string().trim().optional(),
  scenario: z.string().trim().optional(),
  description: z.string().trim().optional(),
  location: z.string().trim().optional(),
  department: z.string().trim().optional(),
  responsiblePerson: z.string().trim().optional(),
  status: z.string().trim().optional(),
  priority: z.string().trim().optional(),
  lastReviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  nextReviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  responseTeam: z.array(z.string().trim()).optional(),
  procedures: z.string().trim().optional(),
  communicationPlan: z.string().trim().optional(),
  evacuationRoutes: z.string().trim().optional(),
  assemblyPoints: z.string().trim().optional(),
  equipmentRequired: z.string().trim().optional(),
  externalAgencies: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

router.put(
  '/plans/:id',
  checkOwnership(prisma.envEmergencyPlan as any),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.envEmergencyPlan.findUnique({ where: { id: req.params.id } });
      if (!existing)
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Emergency plan not found' },
        });

      const parsed = planUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            fields: parsed.error.errors.map((e) => e.path.join('.')),
          },
        });
      }
      const data: Record<string, unknown> = { ...parsed.data };

      // Convert date strings to Date objects
      if (data.lastReviewDate && typeof data.lastReviewDate === 'string')
        data.lastReviewDate = new Date(data.lastReviewDate as string);
      if (data.nextReviewDate && typeof data.nextReviewDate === 'string')
        data.nextReviewDate = new Date(data.nextReviewDate as string);

      const plan = await prisma.envEmergencyPlan.update({
        where: { id: req.params.id },
        data,
      });

      res.json({ success: true, data: plan });
    } catch (error) {
      logger.error('Update emergency plan error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update emergency plan' },
      });
    }
  }
);

// ============================================
// EMERGENCY DRILLS
// ============================================

// POST /drills — Log drill exercise
router.post('/drills', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      planId: z.string().trim().min(1).max(200),
      drillDate: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      drillType: z.enum(['TABLETOP', 'FUNCTIONAL', 'FULL_SCALE']),
      participants: z.array(z.string().trim()).min(1),
      scenario: z.string().trim().optional(),
      outcome: z.enum(['SATISFACTORY', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY']).optional(),
      lessonsLearned: z.string().trim().optional(),
      actionsRequired: z.string().trim().optional(),
      conductedBy: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    // Verify the plan exists
    const plan = await prisma.envEmergencyPlan.findUnique({ where: { id: data.planId } });
    if (!plan)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Emergency plan not found' },
      });

    const drill = await prisma.envEmergencyDrill.create({
      data: {
        planId: data.planId,
        drillDate: new Date(data.drillDate),
        drillType: data.drillType,
        participants: data.participants,
        scenario: data.scenario,
        outcome: (data.outcome as any) || 'SATISFACTORY',
        lessonsLearned: data.lessonsLearned,
        actionsRequired: data.actionsRequired,
        conductedBy: data.conductedBy,
      },
    });

    res.status(201).json({ success: true, data: drill });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create drill error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create drill' },
    });
  }
});

// GET /drills — List drills with outcomes
router.get('/drills', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', planId, outcome, drillType, search } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (planId) where.planId = planId as string;
    if (outcome) where.outcome = outcome as any;
    if (drillType) where.drillType = drillType as string;
    if (search) {
      where.OR = [
        { scenario: { contains: search as string, mode: 'insensitive' } },
        { conductedBy: { contains: search as string, mode: 'insensitive' } },
        { lessonsLearned: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [drills, total] = await Promise.all([
      prisma.envEmergencyDrill.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { drillDate: 'desc' },
        include: { plan: { select: { id: true, refNumber: true, title: true } } },
      }),
      prisma.envEmergencyDrill.count({ where }),
    ]);

    res.json({
      success: true,
      data: drills,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List drills error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list drills' },
    });
  }
});

// ============================================
// EMERGENCY INCIDENTS
// ============================================

// POST /incidents — Log environmental emergency
router.post('/incidents', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().min(1).max(2000),
      incidentDate: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      location: z.string().trim().optional(),
      environmentalImpact: z.string().trim().optional(),
      containmentActions: z.string().trim().optional(),
      regulatoryNotified: z.boolean().optional(),
      status: z.enum(['ACTIVE', 'CONTAINED', 'RESOLVED', 'CLOSED']).optional(),
      linkedPlanId: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateIncidentRefNumber();

    // Verify linked plan exists if provided
    if (data.linkedPlanId) {
      const plan = await prisma.envEmergencyPlan.findUnique({ where: { id: data.linkedPlanId } });
      if (!plan)
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Linked emergency plan not found' },
        });
    }

    const incident = await prisma.envEmergencyIncident.create({
      data: {
        refNumber,
        title: data.title,
        description: data.description,
        incidentDate: new Date(data.incidentDate),
        location: data.location,
        environmentalImpact: data.environmentalImpact,
        containmentActions: data.containmentActions,
        regulatoryNotified: data.regulatoryNotified ?? false,
        status: (data.status as any) || 'ACTIVE',
        linkedPlanId: data.linkedPlanId,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create emergency incident error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create emergency incident' },
    });
  }
});

// ============================================
// DASHBOARD
// ============================================

// GET /dashboard — Overview stats
router.get('/dashboard', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [
      totalPlans,
      activePlans,
      drillsLast12Months,
      openIncidents,
      totalIncidents,
      plansByStatus,
      drillsByOutcome,
    ] = await Promise.all([
      prisma.envEmergencyPlan.count({ where: { deletedAt: null } as any }),
      prisma.envEmergencyPlan.count({ where: { deletedAt: null, status: 'ACTIVE' } as any }),
      prisma.envEmergencyDrill.count({ where: { drillDate: { gte: twelveMonthsAgo } } }),
      prisma.envEmergencyIncident.count({ where: { status: { in: ['ACTIVE', 'CONTAINED'] } } }),
      prisma.envEmergencyIncident.count(),
      prisma.envEmergencyPlan.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { deletedAt: null } as any,
      }),
      prisma.envEmergencyDrill.groupBy({
        by: ['outcome'],
        _count: { id: true },
        where: { drillDate: { gte: twelveMonthsAgo } },
      }),
    ]);

    // Drill compliance: at least 1 drill per active plan per year
    const drillCompliance =
      activePlans > 0 ? Math.min(100, Math.round((drillsLast12Months / activePlans) * 100)) : 100;

    res.json({
      success: true,
      data: {
        totalPlans,
        activePlans,
        drillsLast12Months,
        drillCompliance,
        openIncidents,
        totalIncidents,
        plansByStatus: plansByStatus.map((g) => ({ status: g.status, count: g._count.id })),
        drillsByOutcome: drillsByOutcome.map((g) => ({ outcome: g.outcome, count: g._count.id })),
      },
    });
  } catch (error) {
    logger.error('Emergency dashboard error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to load emergency dashboard' },
    });
  }
});

export default router;
