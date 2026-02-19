import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-hr');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/performance/cycles - Get performance cycles
router.get('/cycles', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { year, status } = req.query;

    const where: Record<string, unknown> = { deletedAt: null };
    if (year) {
      const n = parseInt(year as string, 10);
      if (!isNaN(n)) where.year = n;
    }
    if (status) where.status = status;

    const cycles = await prisma.performanceCycle.findMany({
      where,
      include: {
        _count: { select: { reviews: true, goals: true } },
      },
      orderBy: { year: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: cycles });
  } catch (error) {
    logger.error('Error fetching performance cycles', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch cycles' },
    });
  }
});

// POST /api/performance/cycles - Create performance cycle
router.post('/cycles', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().trim().min(1).max(200),
      year: z.number().int().min(2000).max(2100),
      cycleType: z.enum(['ANNUAL', 'SEMI_ANNUAL', 'QUARTERLY', 'CONTINUOUS']),
      startDate: z
        .string()
        .trim()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      endDate: z
        .string()
        .trim()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      goalSettingStart: z.string().trim().optional(),
      goalSettingEnd: z.string().trim().optional(),
      midYearReviewStart: z.string().trim().optional(),
      midYearReviewEnd: z.string().trim().optional(),
      annualReviewStart: z.string().trim().optional(),
      annualReviewEnd: z.string().trim().optional(),
      ratingScale: z.number().default(5),
      ratingLabels: z.record(z.string().trim()).optional(),
    });

    const data = schema.parse(req.body);

    const cycle = await prisma.performanceCycle.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        goalSettingStart: data.goalSettingStart ? new Date(data.goalSettingStart) : undefined,
        goalSettingEnd: data.goalSettingEnd ? new Date(data.goalSettingEnd) : undefined,
        midYearReviewStart: data.midYearReviewStart ? new Date(data.midYearReviewStart) : undefined,
        midYearReviewEnd: data.midYearReviewEnd ? new Date(data.midYearReviewEnd) : undefined,
        annualReviewStart: data.annualReviewStart ? new Date(data.annualReviewStart) : undefined,
        annualReviewEnd: data.annualReviewEnd ? new Date(data.annualReviewEnd) : undefined,
      },
    });

    res.status(201).json({ success: true, data: cycle });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating cycle', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create cycle' },
    });
  }
});

// GET /api/performance/reviews - Get performance reviews
router.get('/reviews', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { cycleId, employeeId, reviewerId, status, page = '1', limit = '20' } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (cycleId) where.cycleId = cycleId as string;
    if (employeeId) where.employeeId = employeeId as string;
    if (reviewerId) where.reviewerId = reviewerId as string;
    if (status) where.status = status;

    const [reviews, total] = await Promise.all([
      prisma.performanceReview.findMany({
        where,
        include: {
          cycle: { select: { name: true, year: true } },
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeNumber: true,
              jobTitle: true,
            },
          },
          reviewer: { select: { id: true, firstName: true, lastName: true } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.performanceReview.count({ where }),
    ]);

    res.json({
      success: true,
      data: reviews,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('Error fetching reviews', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch reviews' },
    });
  }
});

// GET /api/performance/reviews/:id - Get single review
router.get(
  '/reviews/:id',
  checkOwnership(prisma.performanceReview),
  async (req: Request, res: Response) => {
    try {
      const review = await prisma.performanceReview.findUnique({
        where: { id: req.params.id },
        include: {
          cycle: true,
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeNumber: true,
              jobTitle: true,
              department: true,
            },
          },
          reviewer: { select: { id: true, firstName: true, lastName: true } },
          feedbacks: true,
        },
      });

      if (!review) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Review not found' } });
      }

      // Get employee's goals for this cycle
      const goals = await prisma.performanceGoal.findMany({
        where: { cycleId: review.cycleId, employeeId: review.employeeId, deletedAt: null },
        include: { updates: { orderBy: { createdAt: 'desc' }, take: 5 } },
        take: 100,
      });

      res.json({ success: true, data: { ...review, goals } });
    } catch (error) {
      logger.error('Error fetching review', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch review' },
      });
    }
  }
);

// POST /api/performance/reviews - Create review
router.post('/reviews', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      cycleId: z.string().trim().uuid(),
      employeeId: z.string().trim().uuid(),
      reviewerId: z.string().trim().uuid(),
      reviewType: z.enum(['ANNUAL', 'MID_YEAR', 'QUARTERLY', 'PROBATION', 'PROJECT_END', 'AD_HOC']),
      periodStart: z
        .string()
        .trim()
        .min(1)
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      periodEnd: z
        .string()
        .trim()
        .min(1)
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
    });

    const data = schema.parse(req.body);

    const review = await prisma.performanceReview.create({
      data: {
        ...data,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        status: 'DRAFT',
      },
      include: {
        cycle: true,
        employee: { select: { firstName: true, lastName: true } },
        reviewer: { select: { firstName: true, lastName: true } },
      },
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating review', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create review' },
    });
  }
});

// PUT /api/performance/reviews/:id - Update review
router.put(
  '/reviews/:id',
  checkOwnership(prisma.performanceReview),
  async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        selfAssessment: z.string().trim().optional(),
        selfRating: z.number().optional(),
        managerAssessment: z.string().trim().optional(),
        managerRating: z.number().nonnegative().optional(),
        competencyRatings: z.record(z.number()).optional(),
        overallRating: z.number().optional(),
        overallComments: z.string().trim().optional(),
        strengths: z.string().trim().optional(),
        improvementAreas: z.string().trim().optional(),
        developmentPlan: z.string().trim().optional(),
        status: z
          .enum([
            'DRAFT',
            'SELF_ASSESSMENT',
            'MANAGER_REVIEW',
            'CALIBRATION',
            'ACKNOWLEDGED',
            'COMPLETED',
          ])
          .optional(),
      });

      const data = schema.parse(req.body);

      const updateData = { ...data } as Record<string, unknown>;
      if (data.selfRating !== undefined) updateData.selfRatingDate = new Date();
      if (data.managerRating !== undefined) updateData.managerRatingDate = new Date();

      const review = await prisma.performanceReview.update({
        where: { id: req.params.id },
        data: updateData,
        include: { cycle: true, employee: true, reviewer: true },
      });

      res.json({ success: true, data: review });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
      }
      logger.error('Error updating review', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update review' },
      });
    }
  }
);

// Goals
// GET /api/performance/goals - Get goals
router.get('/goals', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { employeeId, cycleId, status, category } = req.query;

    const where: Record<string, unknown> = { deletedAt: null };
    if (employeeId) where.employeeId = employeeId as string;
    if (cycleId) where.cycleId = cycleId as string;
    if (status) where.status = status;
    if (category) where.category = category;

    const goals = await prisma.performanceGoal.findMany({
      where,
      include: {
        cycle: { select: { name: true, year: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
        updates: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
      orderBy: [{ dueDate: 'asc' }, { weight: 'desc' }],
      take: 100,
    });

    res.json({ success: true, data: goals });
  } catch (error) {
    logger.error('Error fetching goals', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch goals' },
    });
  }
});

// POST /api/performance/goals - Create goal
router.post('/goals', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      cycleId: z.string().trim().uuid(),
      employeeId: z.string().trim().uuid(),
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().min(1),
      category: z.enum(['PERFORMANCE', 'DEVELOPMENT', 'BEHAVIORAL', 'STRATEGIC', 'OPERATIONAL']),
      weight: z.number().min(0).max(100).default(0),
      measurementCriteria: z.string().trim(),
      targetValue: z.string().trim().optional(),
      unit: z.string().trim().optional(),
      startDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      dueDate: z
        .string()
        .trim()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      alignedToObjective: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const goal = await prisma.performanceGoal.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        dueDate: new Date(data.dueDate),
        status: 'NOT_STARTED',
      },
      include: { cycle: true, employee: true },
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating goal', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create goal' },
    });
  }
});

// PUT /api/performance/goals/:id - Update goal
router.put(
  '/goals/:id',
  checkOwnership(prisma.performanceGoal),
  async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        title: z.string().trim().optional(),
        description: z.string().trim().optional(),
        progress: z.number().min(0).max(100).optional(),
        actualValue: z.string().trim().optional(),
        status: z
          .enum(['NOT_STARTED', 'IN_PROGRESS', 'AT_RISK', 'COMPLETED', 'EXCEEDED', 'CANCELLED'])
          .optional(),
        selfRating: z.number().optional(),
        managerRating: z.number().nonnegative().optional(),
        finalRating: z.number().optional(),
        ratingComments: z.string().trim().optional(),
      });

      const data = schema.parse(req.body);

      const goal = await prisma.performanceGoal.update({
        where: { id: req.params.id },
        data,
      });

      res.json({ success: true, data: goal });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
      }
      logger.error('Error updating goal', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update goal' },
      });
    }
  }
);

// POST /api/performance/goals/:id/update - Add goal progress update
router.post('/goals/:id/update', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      progressAfter: z.number().min(0).max(100),
      updateNotes: z.string().trim(),
      updatedById: z.string().trim(),
      evidence: z.record(z.unknown()).optional(),
    });

    const data = schema.parse(req.body);

    const goal = await prisma.performanceGoal.findUnique({ where: { id: req.params.id } });
    if (!goal) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Goal not found' } });
    }

    const [update] = await Promise.all([
      prisma.goalUpdate.create({
        data: {
          goalId: req.params.id,
          progressBefore: goal.progress,
          progressAfter: data.progressAfter,
          updateNotes: data.updateNotes,
          updatedById: data.updatedById,
          evidence: data.evidence as Prisma.InputJsonValue,
        },
      }),
      prisma.performanceGoal.update({
        where: { id: req.params.id },
        data: {
          progress: data.progressAfter,
          status:
            data.progressAfter >= 100
              ? 'COMPLETED'
              : data.progressAfter > 0
                ? 'IN_PROGRESS'
                : 'NOT_STARTED',
        },
      }),
    ]);

    res.status(201).json({ success: true, data: update });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error adding goal update', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add update' } });
  }
});

export default router;
