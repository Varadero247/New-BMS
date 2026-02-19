import { Router, Request, Response } from 'express';
import { prisma} from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-hr');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// Performance Goals
// ============================================

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

const createSchema = z.object({
  cycleId: z.string().trim().uuid(),
  employeeId: z.string().trim().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
  category: z.enum([
    'PERFORMANCE',
    'DEVELOPMENT',
    'BEHAVIORAL',
    'TEAM',
    'STRATEGIC',
    'OPERATIONAL',
    'INNOVATION',
  ]),
  weight: z.number().min(0).max(100).optional(),
  measurementCriteria: z.string().trim().min(1).max(200),
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

const updateSchema = createSchema
  .partial()
  .omit({ cycleId: true, employeeId: true })
  .extend({
    status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD']).optional(),
    progress: z.number().int().min(0).max(100).optional(),
    actualValue: z.string().trim().optional(),
    selfRating: z.number().min(0).max(5).optional(),
    managerRating: z.number().min(0).max(5).optional(),
    finalRating: z.number().min(0).max(5).optional(),
    ratingComments: z.string().trim().optional(),
  });

const updateSchema_ = updateSchema;

// GET / - List goals
router.get('/', async (req: Request, res: Response) => {
  try {
    const { employeeId, cycleId, status, category } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (employeeId && typeof employeeId === 'string') where.employeeId = employeeId;
    if (cycleId && typeof cycleId === 'string') where.cycleId = cycleId;
    if (status && typeof status === 'string') where.status = status;
    if (category && typeof category === 'string') where.category = category;

    const [goals, total] = await Promise.all([
      prisma.performanceGoal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'asc' },
        include: {
          employee: {
            select: {
              id: true,
              employeeNumber: true,
              firstName: true,
              lastName: true,
              jobTitle: true,
            },
          },
          cycle: { select: { id: true, name: true, status: true } },
          _count: { select: { updates: true } },
        },
      }),
      prisma.performanceGoal.count({ where }),
    ]);

    res.json({
      success: true,
      data: goals,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Error fetching goals', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch goals' },
    });
  }
});

// GET /overdue - Goals past due date and not completed
router.get('/overdue', async (_req: Request, res: Response) => {
  try {
    const goals = await prisma.performanceGoal.findMany({
      where: {
        dueDate: { lt: new Date() },
        status: { in: ['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD'] } as any,
      },
      orderBy: { dueDate: 'asc' },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            workEmail: true,
          },
        },
        cycle: { select: { id: true, name: true } },
      },
      take: 100,
    });

    res.json({ success: true, data: goals });
  } catch (error) {
    logger.error('Error fetching overdue goals', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch overdue goals' },
    });
  }
});

// GET /stats - Goal statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { cycleId } = req.query;
    const where: any = {};
    if (cycleId && typeof cycleId === 'string') where.cycleId = cycleId;

    const [total, byStatus, byCategory, avgProgress] = await Promise.all([
      prisma.performanceGoal.count({ where }),
      prisma.performanceGoal.groupBy({ by: ['status'], _count: { id: true }, where }),
      prisma.performanceGoal.groupBy({ by: ['category'], _count: { id: true }, where }),
      prisma.performanceGoal.aggregate({ _avg: { progress: true }, where }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        avgProgress: Math.round(avgProgress._avg.progress || 0),
        byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
        byCategory: byCategory.map((c) => ({ category: c.category, count: c._count.id })),
      },
    });
  } catch (error) {
    logger.error('Error fetching goal stats', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch goal stats' },
    });
  }
});

// GET /:id - Get single goal with updates
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const goal = await prisma.performanceGoal.findUnique({
      where: { id: req.params.id },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
          },
        },
        cycle: { select: { id: true, name: true, status: true } },
        updates: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!goal) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Goal not found' } });
    }

    res.json({ success: true, data: goal });
  } catch (error) {
    logger.error('Error fetching goal', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch goal' } });
  }
});

// POST / - Create goal
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const _authReq = req as AuthRequest;

    const [employee, cycle] = await Promise.all([
      prisma.employee.findUnique({ where: { id: data.employeeId } }),
      prisma.performanceCycle.findUnique({ where: { id: data.cycleId } }),
    ]);

    if (!employee)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Employee not found' } });
    if (!cycle)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Performance cycle not found' },
      });

    const goal = await prisma.performanceGoal.create({
      data: {
        cycleId: data.cycleId,
        employeeId: data.employeeId,
        title: data.title,
        description: data.description,
        category: data.category as any,
        weight: data.weight !== undefined ? data.weight : 0,
        measurementCriteria: data.measurementCriteria,
        targetValue: data.targetValue,
        unit: data.unit,
        startDate: data.startDate ? new Date(data.startDate) : null,
        dueDate: new Date(data.dueDate),
        status: 'NOT_STARTED',
        progress: 0,
        alignedToObjective: data.alignedToObjective,
      },
      include: {
        employee: { select: { id: true, employeeNumber: true, firstName: true, lastName: true } },
        cycle: { select: { id: true, name: true } },
      },
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

// PUT /:id - Update goal
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.performanceGoal.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Goal not found' } });
    }

    const data = updateSchema_.parse(req.body);
    const updateData: Record<string, unknown> = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.startDate) updateData.startDate = new Date(data.startDate);

    const goal = await prisma.performanceGoal.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        employee: { select: { id: true, employeeNumber: true, firstName: true, lastName: true } },
        cycle: { select: { id: true, name: true } },
      },
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
});

// DELETE /:id - Delete goal
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.performanceGoal.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Goal not found' } });
    }

    await prisma.performanceGoal.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting goal', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete goal' },
    });
  }
});

// POST /:id/updates - Add goal progress update
router.post('/:id/updates', async (req: Request, res: Response) => {
  try {
    const goal = await prisma.performanceGoal.findUnique({ where: { id: req.params.id } });
    if (!goal) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Goal not found' } });
    }

    const schema = z.object({
      progressAfter: z.number().int().min(0).max(100),
      updateNotes: z.string().trim().min(1).max(2000),
      evidence: z.record(z.unknown()).optional(),
    });

    const data = schema.parse(req.body);
    const authReq = req as AuthRequest;

    const update = await prisma.$transaction(async (tx) => {
      const goalUpdate = await tx.goalUpdate.create({
        data: {
          goalId: req.params.id,
          progressBefore: goal.progress,
          progressAfter: data.progressAfter,
          updateNotes: data.updateNotes,
          updatedById: authReq.user?.id || 'system',
          evidence: data.evidence as any,
        },
      });

      const newStatus = data.progressAfter >= 100 ? 'COMPLETED' : 'IN_PROGRESS';
      await tx.performanceGoal.update({
        where: { id: req.params.id },
        data: { progress: data.progressAfter, status: newStatus },
      });

      return goalUpdate;
    });

    res.status(201).json({ success: true, data: update });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error adding goal update', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to add goal update' },
    });
  }
});

export default router;
