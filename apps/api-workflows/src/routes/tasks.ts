import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-workflows');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Valid WorkflowTaskType enum values
const taskTypeEnum = z.enum([
  'REVIEW',
  'APPROVE',
  'COMPLETE_FORM',
  'UPLOAD_DOCUMENT',
  'VERIFICATION',
  'DATA_ENTRY',
  'NOTIFICATION',
  'CUSTOM',
]);

// Valid WorkflowTaskStatus enum values
const _taskStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE']);

// GET /api/tasks - Get workflow tasks
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { assignedToId, status, instanceId } = req.query;

    const where: Record<string, unknown> = { deletedAt: null };
    if (assignedToId) where.assignedToId = assignedToId as string;
    if (status) where.status = status as string;
    if (instanceId) where.instanceId = instanceId as string;

    const tasks = await prisma.workflowTask.findMany({
      where,
      include: {
        instance: {
          select: { referenceNumber: true, priority: true },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 100,
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    logger.error('Error fetching tasks', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch tasks' },
    });
  }
});

// GET /api/tasks/stats/summary - Get task statistics (must be before /:id)
router.get('/stats/summary', async (_req: Request, res: Response) => {
  try {
    const [byStatus, byPriority, overdue] = await Promise.all([
      prisma.workflowTask.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.workflowTask.groupBy({
        by: ['taskType'],
        where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
        _count: true,
      }),
      prisma.workflowTask.count({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        byStatus,
        byTaskType: byPriority,
        overdueCount: overdue,
      },
    });
  } catch (error) {
    logger.error('Error fetching task stats', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' },
    });
  }
});

// GET /api/tasks/my/:userId - Get my assigned tasks
router.get('/my/:userId', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const where: Record<string, unknown> = {
      assignedToId: req.params.userId,
      deletedAt: null,
    };
    if (status) where.status = status;

    const tasks = await prisma.workflowTask.findMany({
      where,
      include: {
        instance: {
          select: { referenceNumber: true, priority: true },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 100,
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    logger.error('Error fetching my tasks', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch tasks' },
    });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', checkOwnership(prisma.workflowTask), async (req: AuthRequest, res: Response) => {
  try {
    const task = await prisma.workflowTask.findUnique({
      where: { id: req.params.id },
      include: {
        instance: {
          include: { definition: true },
        },
      },
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    logger.error('Error fetching task', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch task' } });
  }
});

// POST /api/tasks - Create task
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      instanceId: z.string().trim(),
      assignedToId: z.string().trim().optional(),
      assignedToName: z.string().trim().optional(),
      taskType: taskTypeEnum,
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().optional(),
      dueDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
    });

    const data = schema.parse(req.body);

    const task = await prisma.workflowTask.create({
      data: {
        instanceId: data.instanceId,
        assignedToId: data.assignedToId,
        assignedToName: data.assignedToName,
        taskType: data.taskType,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: 'PENDING',
      },
      include: {
        instance: { select: { referenceNumber: true } },
      },
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating task', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create task' },
    });
  }
});

// PUT /api/tasks/:id/claim - Claim task
const claimTaskSchema = z.object({
  userId: z.string().trim().min(1).max(200),
  userName: z.string().trim().min(1).max(200).optional(),
});

router.put(
  '/:id/claim',
  checkOwnership(prisma.workflowTask),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = claimTaskSchema.parse(req.body);

      const task = await prisma.workflowTask.update({
        where: { id: req.params.id },
        data: {
          assignedToId: data.userId,
          assignedToName: data.userName,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });

      res.json({ success: true, data: task });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
      }
      logger.error('Error claiming task', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to claim task' },
      });
    }
  }
);

// PUT /api/tasks/:id/complete - Complete task
router.put(
  '/:id/complete',
  checkOwnership(prisma.workflowTask),
  async (req: AuthRequest, res: Response) => {
    try {
      const schema = z.object({
        outcome: z.string().trim().optional(),
        notes: z.string().trim().optional(),
        completedBy: z.string().trim().optional(),
      });

      const data = schema.parse(req.body);

      const task = await prisma.workflowTask.update({
        where: { id: req.params.id },
        data: {
          status: 'COMPLETED',
          outcome: data.outcome,
          notes: data.notes,
          completedAt: new Date(),
        },
      });

      // Record in workflow history
      await prisma.workflowHistory.create({
        data: {
          instanceId: task.instanceId,
          eventType: 'TASK_COMPLETED',
          actorId: data.completedBy,
          metadata: { taskId: task.id, outcome: data.outcome, notes: data.notes },
        },
      });

      res.json({ success: true, data: task });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
      }
      logger.error('Error completing task', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to complete task' },
      });
    }
  }
);

// PUT /api/tasks/:id/reassign - Reassign task
const reassignTaskSchema = z.object({
  newAssigneeId: z.string().trim().min(1).max(200),
  newAssigneeName: z.string().trim().min(1).max(200).optional(),
  reason: z.string().trim().min(1).max(1000).optional(),
  reassignedBy: z.string().trim().min(1).max(200).optional(),
});

router.put(
  '/:id/reassign',
  checkOwnership(prisma.workflowTask),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = reassignTaskSchema.parse(req.body);

      const currentTask = await prisma.workflowTask.findUnique({ where: { id: req.params.id } });
      if (!currentTask) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
      }

      const task = await prisma.workflowTask.update({
        where: { id: req.params.id },
        data: {
          assignedToId: data.newAssigneeId,
          assignedToName: data.newAssigneeName,
        },
      });

      // Record history
      await prisma.workflowHistory.create({
        data: {
          instanceId: task.instanceId,
          eventType: 'DELEGATED',
          actorId: data.reassignedBy,
          metadata: {
            taskId: task.id,
            previousAssignee: currentTask.assignedToId,
            newAssignee: data.newAssigneeId,
            reason: data.reason,
          },
        },
      });

      res.json({ success: true, data: task });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
      }
      logger.error('Error reassigning task', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to reassign task' },
      });
    }
  }
);

export default router;
