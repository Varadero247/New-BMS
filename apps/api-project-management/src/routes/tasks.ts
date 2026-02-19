import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-project-management');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());
router.param('projectId', validateIdParam('projectId'));

// GET /api/tasks - List tasks by projectId
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { projectId, status, page = '1', limit = '100' } = req.query;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' },
      });
    }

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { projectId: projectId as string, deletedAt: null };
    if (status) where.status = status;

    const [tasks, total] = await Promise.all([
      prisma.projectTask.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ wbsLevel: 'asc' }, { sortOrder: 'asc' }],
      }),
      prisma.projectTask.count({ where }),
    ]);

    res.json({
      success: true,
      data: tasks,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List tasks error', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list tasks' } });
  }
});

// GET /api/tasks/gantt/:projectId - Get Gantt chart data
router.get('/gantt/:projectId', async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.projectTask.findMany({
      where: { projectId: req.params.projectId, deletedAt: null },
      orderBy: [{ wbsLevel: 'asc' }, { sortOrder: 'asc' }],
      select: {
        id: true,
        taskCode: true,
        taskName: true,
        taskType: true,
        parentTaskId: true,
        wbsLevel: true,
        sortOrder: true,
        plannedStartDate: true,
        plannedEndDate: true,
        actualStartDate: true,
        actualEndDate: true,
        baselineStartDate: true,
        baselineEndDate: true,
        plannedDuration: true,
        actualDuration: true,
        progressPercentage: true,
        status: true,
        isCriticalPath: true,
        slack: true,
        predecessorIds: true,
        dependencyType: true,
        lagDays: true,
        assignedToId: true,
        priority: true,
      },
      take: 1000,
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    logger.error('Gantt data error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get Gantt data' },
    });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', checkOwnership(prisma.projectTask), async (req: Request, res: Response) => {
  try {
    const task = await prisma.projectTask.findUnique({
      where: { id: req.params.id },
      include: {
        childTasks: true,
        parentTask: true,
        timesheets: true,
      },
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    logger.error('Get task error', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get task' } });
  }
});

const createTaskSchema = z.object({
  projectId: z.string().trim().min(1).max(200),
  taskCode: z.string().trim().min(1).max(200),
  taskName: z.string().trim().min(1).max(200),
  taskDescription: z.string().trim().optional(),
  parentTaskId: z.string().trim().optional(),
  wbsLevel: z.number().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  taskType: z.enum(['TASK', 'MILESTONE', 'PHASE', 'DELIVERABLE']).optional(),
  assignedToId: z.string().trim().optional(),
  assignedDepartment: z.string().trim().optional(),
  plannedStartDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  plannedEndDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  plannedDuration: z.number().nonnegative().optional(),
  plannedEffort: z.number().optional(),
  predecessorIds: z.string().trim().optional(),
  dependencyType: z.string().trim().optional(),
  lagDays: z.number().optional(),
  isCriticalPath: z.boolean().optional(),
  plannedCost: z.number().nonnegative().optional(),
  acceptanceCriteria: z.string().trim().optional(),
  priority: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED']).optional(),
});
const updateTaskSchema = createTaskSchema
  .extend({
    actualStartDate: z.string().trim().optional(),
    actualEndDate: z.string().trim().optional(),
    baselineStartDate: z.string().trim().optional(),
    baselineEndDate: z.string().trim().optional(),
    progressPercentage: z.number().min(0).max(100).optional(),
    actualDuration: z.number().nonnegative().optional(),
    actualEffort: z.number().nonnegative().optional(),
    actualCost: z.number().nonnegative().optional(),
    slack: z.number().optional(),
  })
  .partial();

// POST /api/tasks - Create task
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createTaskSchema.parse(req.body);

    const task = await prisma.projectTask.create({
      data: {
        projectId: data.projectId,
        taskCode: data.taskCode,
        taskName: data.taskName,
        taskDescription: data.taskDescription,
        parentTaskId: data.parentTaskId,
        wbsLevel: data.wbsLevel || 0,
        sortOrder: data.sortOrder || 0,
        taskType: data.taskType || 'TASK',
        assignedToId: data.assignedToId,
        assignedDepartment: data.assignedDepartment,
        plannedStartDate: data.plannedStartDate ? new Date(data.plannedStartDate) : null,
        plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : null,
        plannedDuration: data.plannedDuration,
        plannedEffort: data.plannedEffort,
        predecessorIds: data.predecessorIds,
        dependencyType: data.dependencyType,
        lagDays: data.lagDays || 0,
        isCriticalPath: data.isCriticalPath || false,
        plannedCost: data.plannedCost,
        acceptanceCriteria: data.acceptanceCriteria,
        priority: data.priority || 'MEDIUM',
        tags: data.tags,
        status: data.status || 'NOT_STARTED',
      },
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    logger.error('Create task error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create task' },
    });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', checkOwnership(prisma.projectTask), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.projectTask.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }

    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const data = parsed.data;
    const updateData = { ...data } as Record<string, unknown>;

    // Handle date conversions
    if (data.plannedStartDate) updateData.plannedStartDate = new Date(data.plannedStartDate);
    if (data.plannedEndDate) updateData.plannedEndDate = new Date(data.plannedEndDate);
    if (data.actualStartDate) updateData.actualStartDate = new Date(data.actualStartDate);
    if (data.actualEndDate) updateData.actualEndDate = new Date(data.actualEndDate);
    if (data.baselineStartDate) updateData.baselineStartDate = new Date(data.baselineStartDate);
    if (data.baselineEndDate) updateData.baselineEndDate = new Date(data.baselineEndDate);

    // Auto-set actual start date when status changes to IN_PROGRESS
    if (
      data.status === 'IN_PROGRESS' &&
      existing.status === 'NOT_STARTED' &&
      !existing.actualStartDate
    ) {
      updateData.actualStartDate = new Date();
    }

    // Auto-set actual end date and progress when completed
    if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      updateData.actualEndDate = updateData.actualEndDate || new Date();
      updateData.progressPercentage = 100;
    }

    const task = await prisma.projectTask.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: task });
  } catch (error) {
    logger.error('Update task error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update task' },
    });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete(
  '/:id',
  checkOwnership(prisma.projectTask),
  async (req: Request, res: Response) => {
    try {
      const existing = await prisma.projectTask.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
      }

      await prisma.projectTask.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });
      res.status(204).send();
    } catch (error) {
      logger.error('Delete task error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete task' },
      });
    }
  }
);

export default router;
