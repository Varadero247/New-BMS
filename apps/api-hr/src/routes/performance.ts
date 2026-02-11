import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';

const router: Router = Router();

// GET /api/performance/cycles - Get performance cycles
router.get('/cycles', async (req: Request, res: Response) => {
  try {
    const { year, status } = req.query;

    const where: any = {};
    if (year) where.year = parseInt(year as string);
    if (status) where.status = status;

    const cycles = await prisma.performanceCycle.findMany({
      where,
      include: {
        _count: { select: { reviews: true, goals: true } },
      },
      orderBy: { year: 'desc' },
    });

    res.json({ success: true, data: cycles });
  } catch (error) {
    console.error('Error fetching performance cycles:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch cycles' } });
  }
});

// POST /api/performance/cycles - Create performance cycle
router.post('/cycles', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      year: z.number(),
      cycleType: z.enum(['ANNUAL', 'SEMI_ANNUAL', 'QUARTERLY', 'CONTINUOUS']),
      startDate: z.string(),
      endDate: z.string(),
      goalSettingStart: z.string().optional(),
      goalSettingEnd: z.string().optional(),
      midYearReviewStart: z.string().optional(),
      midYearReviewEnd: z.string().optional(),
      annualReviewStart: z.string().optional(),
      annualReviewEnd: z.string().optional(),
      ratingScale: z.number().default(5),
      ratingLabels: z.record(z.string()).optional(),
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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error creating cycle:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create cycle' } });
  }
});

// GET /api/performance/reviews - Get performance reviews
router.get('/reviews', async (req: Request, res: Response) => {
  try {
    const { cycleId, employeeId, reviewerId, status, page = '1', limit = '20' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (cycleId) where.cycleId = cycleId;
    if (employeeId) where.employeeId = employeeId;
    if (reviewerId) where.reviewerId = reviewerId;
    if (status) where.status = status;

    const [reviews, total] = await Promise.all([
      prisma.performanceReview.findMany({
        where,
        include: {
          cycle: { select: { name: true, year: true } },
          employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true, jobTitle: true } },
          reviewer: { select: { id: true, firstName: true, lastName: true } },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.performanceReview.count({ where }),
    ]);

    res.json({
      success: true,
      data: reviews,
      meta: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch reviews' } });
  }
});

// GET /api/performance/reviews/:id - Get single review
router.get('/reviews/:id', async (req: Request, res: Response) => {
  try {
    const review = await prisma.performanceReview.findUnique({
      where: { id: req.params.id },
      include: {
        cycle: true,
        employee: {
          select: {
            id: true, firstName: true, lastName: true, employeeNumber: true, jobTitle: true,
            department: true,
          },
        },
        reviewer: { select: { id: true, firstName: true, lastName: true } },
        feedbacks: true,
      },
    });

    if (!review) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Review not found' } });
    }

    // Get employee's goals for this cycle
    const goals = await prisma.performanceGoal.findMany({
      where: { cycleId: review.cycleId, employeeId: review.employeeId },
      include: { updates: { orderBy: { createdAt: 'desc' }, take: 5 } },
    });

    res.json({ success: true, data: { ...review, goals } });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch review' } });
  }
});

// POST /api/performance/reviews - Create review
router.post('/reviews', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      cycleId: z.string().uuid(),
      employeeId: z.string().uuid(),
      reviewerId: z.string().uuid(),
      reviewType: z.enum(['ANNUAL', 'MID_YEAR', 'QUARTERLY', 'PROBATION', 'PROJECT_END', 'AD_HOC']),
      periodStart: z.string(),
      periodEnd: z.string(),
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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create review' } });
  }
});

// PUT /api/performance/reviews/:id - Update review
router.put('/reviews/:id', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      selfAssessment: z.string().optional(),
      selfRating: z.number().optional(),
      managerAssessment: z.string().optional(),
      managerRating: z.number().optional(),
      competencyRatings: z.record(z.number()).optional(),
      overallRating: z.number().optional(),
      overallComments: z.string().optional(),
      strengths: z.string().optional(),
      improvementAreas: z.string().optional(),
      developmentPlan: z.string().optional(),
      status: z.enum(['DRAFT', 'SELF_ASSESSMENT', 'MANAGER_REVIEW', 'CALIBRATION', 'ACKNOWLEDGED', 'COMPLETED']).optional(),
    });

    const data = schema.parse(req.body);

    const updateData: any = { ...data };
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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update review' } });
  }
});

// Goals
// GET /api/performance/goals - Get goals
router.get('/goals', async (req: Request, res: Response) => {
  try {
    const { employeeId, cycleId, status, category } = req.query;

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (cycleId) where.cycleId = cycleId;
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
    });

    res.json({ success: true, data: goals });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch goals' } });
  }
});

// POST /api/performance/goals - Create goal
router.post('/goals', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      cycleId: z.string().uuid(),
      employeeId: z.string().uuid(),
      title: z.string().min(1),
      description: z.string(),
      category: z.enum(['PERFORMANCE', 'DEVELOPMENT', 'BEHAVIORAL', 'STRATEGIC', 'OPERATIONAL']),
      weight: z.number().min(0).max(100).default(0),
      measurementCriteria: z.string(),
      targetValue: z.string().optional(),
      unit: z.string().optional(),
      startDate: z.string().optional(),
      dueDate: z.string(),
      alignedToObjective: z.string().optional(),
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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error creating goal:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create goal' } });
  }
});

// PUT /api/performance/goals/:id - Update goal
router.put('/goals/:id', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      progress: z.number().min(0).max(100).optional(),
      actualValue: z.string().optional(),
      status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'AT_RISK', 'COMPLETED', 'EXCEEDED', 'CANCELLED']).optional(),
      selfRating: z.number().optional(),
      managerRating: z.number().optional(),
      finalRating: z.number().optional(),
      ratingComments: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const goal = await prisma.performanceGoal.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: goal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error updating goal:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update goal' } });
  }
});

// POST /api/performance/goals/:id/update - Add goal progress update
router.post('/goals/:id/update', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      progressAfter: z.number().min(0).max(100),
      updateNotes: z.string(),
      updatedById: z.string(),
      evidence: z.any().optional(),
    });

    const data = schema.parse(req.body);

    const goal = await prisma.performanceGoal.findUnique({ where: { id: req.params.id } });
    if (!goal) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Goal not found' } });
    }

    const [update] = await Promise.all([
      prisma.goalUpdate.create({
        data: {
          goalId: req.params.id,
          progressBefore: goal.progress,
          progressAfter: data.progressAfter,
          updateNotes: data.updateNotes,
          updatedById: data.updatedById,
          evidence: data.evidence,
        },
      }),
      prisma.performanceGoal.update({
        where: { id: req.params.id },
        data: {
          progress: data.progressAfter,
          status: data.progressAfter >= 100 ? 'COMPLETED' : data.progressAfter > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
        },
      }),
    ]);

    res.status(201).json({ success: true, data: update });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error adding goal update:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add update' } });
  }
});

export default router;
