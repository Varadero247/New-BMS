import { Router, Request, Response } from 'express';
import { prisma } from '@ims/database';
import type { Prisma } from '@ims/database/workflows';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-workflows');

const router: Router = Router();
router.use(authenticate);

// Valid WorkflowTaskType enum values
const taskTypeEnum = z.enum(['REVIEW', 'APPROVE', 'COMPLETE_FORM', 'UPLOAD_DOCUMENT', 'VERIFICATION', 'DATA_ENTRY', 'NOTIFICATION', 'CUSTOM']);

// Valid WorkflowPriority enum values
const priorityEnum = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']);

// Valid WorkflowTaskStatus enum values
const taskStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'SKIPPED']);

// GET /api/tasks - Get workflow tasks
router.get('/', async (req: Request, res: Response) => {
  try {
    const { assigneeId, status, priority, instanceId } = req.query;

    const where: Prisma.WorkflowTaskWhereInput = {};
    if (assigneeId) where.assigneeId = assigneeId as string;
    if (status) where.status = status as string;
    if (priority) where.priority = priority as string;
    if (instanceId) where.instanceId = instanceId as string;

    const tasks = await prisma.workflowTask.findMany({
      where,
      include: {
        instance: {
          select: { instanceNumber: true, title: true, priority: true },
        },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    logger.error('Error fetching tasks', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch tasks' } });
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
        by: ['priority'],
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
        byPriority,
        overdueCount: overdue,
      },
    });
  } catch (error) {
    logger.error('Error fetching task stats', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' } });
  }
});

// GET /api/tasks/my/:userId - Get my assigned tasks
router.get('/my/:userId', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const where: Prisma.WorkflowTaskWhereInput = {
      assigneeId: req.params.userId,
    };
    if (status) where.status = status;

    const tasks = await prisma.workflowTask.findMany({
      where,
      include: {
        instance: {
          select: { instanceNumber: true, title: true, priority: true },
        },
      },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    logger.error('Error fetching my tasks', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch tasks' } });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', async (req: Request, res: Response) => {
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
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    logger.error('Error fetching task', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch task' } });
  }
});

// POST /api/tasks - Create task
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      instanceId: z.string().uuid(),
      assigneeId: z.string().uuid(),
      taskType: taskTypeEnum,
      title: z.string().min(1),
      description: z.string().optional(),
      priority: priorityEnum.default('NORMAL'),
      dueDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Generate task number
    const count = await prisma.workflowTask.count();
    const taskNumber = `TSK-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    const task = await prisma.workflowTask.create({
      data: {
        taskNumber,
        instanceId: data.instanceId,
        assigneeId: data.assigneeId,
        taskType: data.taskType,
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: 'PENDING',
      },
      include: {
        instance: { select: { instanceNumber: true, title: true } },
      },
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating task', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create task' } });
  }
});

// PUT /api/tasks/:id/claim - Claim task
router.put('/:id/claim', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const task = await prisma.workflowTask.update({
      where: { id: req.params.id },
      data: {
        assigneeId: userId,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    res.json({ success: true, data: task });
  } catch (error) {
    logger.error('Error claiming task', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to claim task' } });
  }
});

// PUT /api/tasks/:id/complete - Complete task
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      result: z.any().optional(),
      notes: z.string().optional(),
      completedBy: z.string().uuid().optional(),
    });

    const data = schema.parse(req.body);

    const task = await prisma.workflowTask.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        result: data.result,
        notes: data.notes,
        completedAt: new Date(),
      },
    });

    // Record in workflow history
    await prisma.workflowHistory.create({
      data: {
        instanceId: task.instanceId,
        action: 'TASK_COMPLETED',
        actionBy: data.completedBy,
        details: { taskId: task.id, result: data.result, notes: data.notes },
      },
    });

    res.json({ success: true, data: task });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error completing task', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete task' } });
  }
});

// PUT /api/tasks/:id/reassign - Reassign task
router.put('/:id/reassign', async (req: Request, res: Response) => {
  try {
    const { newAssigneeId, reason, reassignedBy } = req.body;

    const currentTask = await prisma.workflowTask.findUnique({ where: { id: req.params.id } });
    if (!currentTask) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }

    const task = await prisma.workflowTask.update({
      where: { id: req.params.id },
      data: {
        assigneeId: newAssigneeId,
      },
    });

    // Record history
    await prisma.workflowHistory.create({
      data: {
        instanceId: task.instanceId,
        action: 'TASK_REASSIGNED',
        actionBy: reassignedBy,
        details: {
          taskId: task.id,
          previousAssignee: currentTask.assigneeId,
          newAssignee: newAssigneeId,
          reason,
        },
      },
    });

    res.json({ success: true, data: task });
  } catch (error) {
    logger.error('Error reassigning task', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reassign task' } });
  }
});

export default router;
