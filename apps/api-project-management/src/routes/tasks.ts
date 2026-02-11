import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();
router.use(authenticate);

// GET /api/tasks - List tasks by projectId
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, status, page = '1', limit = '100' } = req.query;

    if (!projectId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' } });
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { projectId: projectId as string };
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
    console.error('List tasks error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list tasks' } });
  }
});

// GET /api/tasks/gantt/:projectId - Get Gantt chart data
router.get('/gantt/:projectId', async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await prisma.projectTask.findMany({
      where: { projectId: req.params.projectId },
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
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Gantt data error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get Gantt data' } });
  }
});

// GET /api/tasks/:id - Get single task
router.get('/:id', async (req: AuthRequest, res: Response) => {
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
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get task' } });
  }
});

// POST /api/tasks - Create task
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      projectId: z.string().min(1),
      taskCode: z.string().min(1),
      taskName: z.string().min(1),
      taskDescription: z.string().optional(),
      parentTaskId: z.string().optional(),
      wbsLevel: z.number().optional(),
      sortOrder: z.number().optional(),
      taskType: z.enum(['TASK', 'MILESTONE', 'PHASE', 'DELIVERABLE']).optional(),
      assignedToId: z.string().optional(),
      assignedDepartment: z.string().optional(),
      plannedStartDate: z.string().optional(),
      plannedEndDate: z.string().optional(),
      plannedDuration: z.number().optional(),
      plannedEffort: z.number().optional(),
      predecessorIds: z.string().optional(),
      dependencyType: z.string().optional(),
      lagDays: z.number().optional(),
      isCriticalPath: z.boolean().optional(),
      plannedCost: z.number().optional(),
      acceptanceCriteria: z.string().optional(),
      priority: z.string().optional(),
      tags: z.string().optional(),
      status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED']).optional(),
    });

    const data = schema.parse(req.body);

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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create task error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create task' } });
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectTask.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }

    const data = req.body;
    const updateData: any = { ...data };

    // Handle date conversions
    if (data.plannedStartDate) updateData.plannedStartDate = new Date(data.plannedStartDate);
    if (data.plannedEndDate) updateData.plannedEndDate = new Date(data.plannedEndDate);
    if (data.actualStartDate) updateData.actualStartDate = new Date(data.actualStartDate);
    if (data.actualEndDate) updateData.actualEndDate = new Date(data.actualEndDate);
    if (data.baselineStartDate) updateData.baselineStartDate = new Date(data.baselineStartDate);
    if (data.baselineEndDate) updateData.baselineEndDate = new Date(data.baselineEndDate);

    // Auto-set actual start date when status changes to IN_PROGRESS
    if (data.status === 'IN_PROGRESS' && existing.status === 'NOT_STARTED' && !existing.actualStartDate) {
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
    console.error('Update task error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update task' } });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectTask.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }

    await prisma.projectTask.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Task deleted successfully' } });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete task' } });
  }
});

export default router;
