// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import {
  createTask,
  getTasks,
  getMyTasks,
  updateTask,
  completeTask,
  deleteTask,
} from '@ims/tasks';
import { z } from 'zod';

const logger = createLogger('api-gateway:tasks');
const router = Router();
router.param('id', validateIdParam());

// ============================================
// Validation schemas
// ============================================

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(500),
  description: z.string().trim().max(5000).optional(),
  recordType: z.string().trim().max(100).optional(),
  recordId: z.string().trim().max(100).optional(),
  assigneeId: z.string().trim().min(1).max(200),
  assigneeName: z.string().trim().min(1).max(200),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional().default('MEDIUM'),
  dueDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  description: z.string().trim().max(5000).optional(),
  assigneeId: z.string().trim().min(1).max(200).optional(),
  assigneeName: z.string().trim().min(1).max(200).optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  dueDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETE', 'CANCELLED']).optional(),
});

// ============================================
// GET /api/my-tasks — aggregated My Tasks for current user
// (Must be defined BEFORE /:id to avoid Express route conflict)
// ============================================
router.get('/my-tasks', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const orgId = (user as { organisationId?: string }).organisationId || (user as { orgId?: string }).orgId || 'default';

    const grouped = await getMyTasks(orgId, user!.id);

    res.json({
      success: true,
      data: grouped,
    });
  } catch (error: unknown) {
    logger.error('Failed to get my tasks', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get my tasks' },
    });
  }
});

// ============================================
// POST /api/tasks — create task
// ============================================
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const parsed = createTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0].message,
          details: parsed.error.errors,
        },
      });
    }

    const orgId = (user as { organisationId?: string }).organisationId || (user as { orgId?: string }).orgId || 'default';

    const task = await createTask({
      orgId,
      title: parsed.data.title,
      description: parsed.data.description,
      recordType: parsed.data.recordType,
      recordId: parsed.data.recordId,
      assigneeId: parsed.data.assigneeId,
      assigneeName: parsed.data.assigneeName,
      createdById: user!.id,
      priority: parsed.data.priority,
      dueDate: parsed.data.dueDate,
    });

    logger.info('Task created and assigned', {
      taskId: task.id,
      refNumber: task.refNumber,
      assigneeId: task.assigneeId,
      createdById: user!.id,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error: unknown) {
    logger.error('Failed to create task', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create task' },
    });
  }
});

// ============================================
// GET /api/tasks — list tasks (filtered, paginated)
// ============================================
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const orgId = (user as { organisationId?: string }).organisationId || (user as { orgId?: string }).orgId || 'default';

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

    const result = await getTasks(orgId, {
      assigneeId: req.query.assigneeId as string | undefined,
      status: req.query.status as never,
      priority: req.query.priority as never,
      recordType: req.query.recordType as string | undefined,
      page,
      limit,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    logger.error('Failed to list tasks', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list tasks' },
    });
  }
});

// ============================================
// PATCH /api/tasks/:id/complete — mark complete
// ============================================
router.patch('/:id/complete', authenticate, async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const task = await completeTask(taskId);

    logger.info('Task completed', { taskId, refNumber: task.refNumber });

    res.json({
      success: true,
      data: task,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to complete task', { error: message });

    if (message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to complete task' },
    });
  }
});

// ============================================
// PUT /api/tasks/:id — update task
// ============================================
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    const parsed = updateTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0].message,
          details: parsed.error.errors,
        },
      });
    }

    const updates: Record<string, unknown> = { ...parsed.data };
    if (updates.dueDate) {
      updates.dueDate = new Date(updates.dueDate as string);
    }

    const task = await updateTask(taskId, updates);

    logger.info('Task updated', { taskId, refNumber: task.refNumber });

    res.json({
      success: true,
      data: task,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to update task', { error: message });

    if (message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update task' },
    });
  }
});

// ============================================
// DELETE /api/tasks/:id — delete task
// ============================================
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const taskId = req.params.id;
    await deleteTask(taskId);

    logger.info('Task deleted', { taskId });

    res.json({
      success: true,
      data: { id: taskId, deleted: true },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to delete task', { error: message });

    if (message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete task' },
    });
  }
});

export default router;
