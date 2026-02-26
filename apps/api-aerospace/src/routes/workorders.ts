// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination} from '@ims/shared';
import { scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-aerospace');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());
router.param('tid', validateIdParam('tid'));

// ============================================
// AS9110 MRO Work Order Management — Interfaces
// ============================================

// ============================================
// Reference Number Generator
// ============================================

async function generateWORefNumber(): Promise<string> {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const count = await prisma.workOrder.count({
    where: { refNumber: { startsWith: `WO-${yymm}` } },
  });
  return `WO-${yymm}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// Zod Schemas
// ============================================

const createWorkOrderSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  aircraftType: z.string().trim().min(1, 'Aircraft type is required'),
  aircraftReg: z.string().trim().optional(),
  description: z.string().trim().min(1, 'Description is required'),
  priority: z.enum(['AOG', 'URGENT', 'ROUTINE', 'DEFERRED']).optional(),
  assignedTo: z.string().trim().optional(),
  startDate: z.string().trim().datetime({ offset: true }).optional(),
  dueDate: z.string().trim().datetime({ offset: true }).optional(),
});

const addTaskCardSchema = z.object({
  taskNumber: z.string().trim().min(1, 'Task number is required'),
  description: z.string().trim().min(1, 'Description is required'),
  zone: z.string().trim().optional(),
  access: z.string().trim().optional(),
  estimatedHours: z.number().positive().optional(),
  technicianId: z.string().trim().optional(),
  technicianName: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const completeTaskSchema = z.object({
  actualHours: z.number().positive('Actual hours must be positive'),
  technicianId: z.string().trim().min(1, 'Technician ID is required'),
  technicianName: z.string().trim().min(1, 'Technician name is required'),
  notes: z.string().trim().optional(),
});

const releaseSchema = z.object({
  releaseCertType: z.enum(['EASA_FORM_1', 'FAA_8130_3', 'CRS']),
  releaseCertRef: z.string().trim().min(1, 'Release certificate reference is required'),
});

const deferSchema = z.object({
  deferralRef: z.string().trim().min(1, 'MEL/CDL reference is required'),
  deferralNotes: z.string().trim().min(1, 'Deferral notes are required'),
});

// ============================================
// ROUTES
// ============================================

// POST / — Create work order
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createWorkOrderSchema.parse(req.body);
    const refNumber = await generateWORefNumber();

    const wo = await prisma.workOrder.create({
      data: {
        refNumber,
        title: data.title,
        aircraftType: data.aircraftType,
        aircraftReg: data.aircraftReg,
        description: data.description,
        priority: (data.priority || 'ROUTINE') as never,
        status: 'OPEN',
        assignedTo: data.assignedTo,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        createdBy: (req as AuthRequest).user?.id || 'unknown',
      },
    });

    logger.info('Work order created', { refNumber, aircraftType: data.aircraftType });
    res.status(201).json({ success: true, data: wo });
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
    logger.error('Create work order error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create work order' },
    });
  }
});

// GET / — List work orders with status filter, pagination
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status, priority, search } = req.query;
    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { aircraftType: { contains: search as string, mode: 'insensitive' } },
        { aircraftReg: { contains: search as string, mode: 'insensitive' } },
        { assignedTo: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { tasks: true },
      }),
      prisma.workOrder.count({ where }),
    ]);

    res.json({
      success: true,
      data: workOrders,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List work orders error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list work orders' },
    });
  }
});

// GET /:id — Get work order with task cards and signoffs
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const wo = await prisma.workOrder.findUnique({
      where: { id: req.params.id },
      include: { tasks: { orderBy: { taskNumber: 'asc' } } },
    });

    if (!wo || wo.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    res.json({ success: true, data: wo });
  } catch (error) {
    logger.error('Get work order error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get work order' },
    });
  }
});

// POST /:id/tasks — Add task card
router.post('/:id/tasks', async (req: Request, res: Response) => {
  try {
    const wo = await prisma.workOrder.findUnique({ where: { id: req.params.id } });
    if (!wo || wo.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    if (wo.status === 'RELEASED' || wo.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: `Cannot add tasks when work order status is ${wo.status}`,
        },
      });
    }

    const data = addTaskCardSchema.parse(req.body);

    const task = await prisma.taskCard.create({
      data: {
        workOrderId: req.params.id,
        taskNumber: data.taskNumber,
        description: data.description,
        zone: data.zone,
        access: data.access,
        estimatedHours: data.estimatedHours,
        technicianId: data.technicianId,
        technicianName: data.technicianName,
        status: 'OPEN',
        notes: data.notes,
      },
    });

    // Update work order status to IN_PROGRESS if currently OPEN
    if (wo.status === 'OPEN') {
      await prisma.workOrder.update({
        where: { id: req.params.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    logger.info('Task card added', { workOrderId: req.params.id, taskNumber: data.taskNumber });
    res.status(201).json({ success: true, data: task });
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
    logger.error('Add task card error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to add task card' },
    });
  }
});

// PUT /:id/tasks/:tid/complete — Complete task + technician sign
router.put('/:id/tasks/:tid/complete', async (req: Request, res: Response) => {
  try {
    const wo = await prisma.workOrder.findUnique({ where: { id: req.params.id } });
    if (!wo || wo.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    const task = await prisma.taskCard.findFirst({
      where: { id: req.params.tid, workOrderId: req.params.id },
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Task card not found' } });
    }

    if (task.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Task card is already completed' },
      });
    }

    const data = completeTaskSchema.parse(req.body);

    const updatedTask = await prisma.taskCard.update({
      where: { id: req.params.tid },
      data: {
        status: 'COMPLETED',
        actualHours: data.actualHours,
        technicianId: data.technicianId,
        technicianName: data.technicianName,
        signedDate: new Date(),
        notes: data.notes || task.notes,
      },
    });

    logger.info('Task card completed', {
      workOrderId: req.params.id,
      taskId: req.params.tid,
      technicianId: data.technicianId,
    });
    res.json({ success: true, data: updatedTask });
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
    logger.error('Complete task card error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to complete task card' },
    });
  }
});

// POST /:id/inspect — Quality inspection signoff
router.post('/:id/inspect', async (req: Request, res: Response) => {
  try {
    const wo = await prisma.workOrder.findUnique({
      where: { id: req.params.id },
      include: { tasks: true },
    });

    if (!wo || wo.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    if (wo.status === 'RELEASED' || wo.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: `Cannot inspect when work order status is ${wo.status}`,
        },
      });
    }

    // Check that there are tasks and all are completed
    if (wo.tasks.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_TASKS', message: 'Cannot inspect work order with no task cards' },
      });
    }

    const incompleteTasks = wo.tasks.filter(
      (t) => t.status !== 'COMPLETED' && t.status !== 'DEFERRED'
    );
    if (incompleteTasks.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TASKS_INCOMPLETE',
          message: `Cannot inspect. ${incompleteTasks.length} task(s) not completed: ${incompleteTasks.map((t) => t.taskNumber).join(', ')}`,
        },
      });
    }

    const updatedWo = await prisma.workOrder.update({
      where: { id: req.params.id },
      data: {
        status: 'INSPECTION',
        inspectedBy: (req as AuthRequest).user?.id || 'unknown',
        inspectedDate: new Date(),
      },
    });

    logger.info('Work order inspected', {
      id: req.params.id,
      refNumber: wo.refNumber,
      inspectedBy: updatedWo.inspectedBy,
    });
    res.json({ success: true, data: updatedWo });
  } catch (error) {
    logger.error('Inspect work order error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to inspect work order' },
    });
  }
});

// POST /:id/release — Airworthiness release
router.post('/:id/release', async (req: Request, res: Response) => {
  try {
    const wo = await prisma.workOrder.findUnique({
      where: { id: req.params.id },
      include: { tasks: true },
    });

    if (!wo || wo.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    // Validate all tasks are completed
    const incompleteTasks = wo.tasks.filter(
      (t) => t.status !== 'COMPLETED' && t.status !== 'DEFERRED'
    );
    if (incompleteTasks.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TASKS_INCOMPLETE',
          message: `Cannot release. ${incompleteTasks.length} task(s) not completed: ${incompleteTasks.map((t) => t.taskNumber).join(', ')}`,
        },
      });
    }

    // Validate inspection has been done
    if (!wo.inspectedBy || !wo.inspectedDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSPECTION_REQUIRED',
          message: 'Quality inspection must be completed before airworthiness release',
        },
      });
    }

    const data = releaseSchema.parse(req.body);

    const updatedWo = await prisma.workOrder.update({
      where: { id: req.params.id },
      data: {
        status: 'RELEASED',
        releaseCertType: data.releaseCertType,
        releaseCertRef: data.releaseCertRef,
        releasedBy: (req as AuthRequest).user?.id || 'unknown',
        releasedDate: new Date(),
        completedDate: new Date(),
      },
    });

    logger.info('Work order released', {
      id: req.params.id,
      refNumber: wo.refNumber,
      releaseCertType: data.releaseCertType,
      releaseCertRef: data.releaseCertRef,
    });
    res.json({ success: true, data: updatedWo });
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
    logger.error('Release work order error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to release work order' },
    });
  }
});

// POST /:id/defer — Defer defect with MEL/CDL reference
router.post('/:id/defer', async (req: Request, res: Response) => {
  try {
    const wo = await prisma.workOrder.findUnique({ where: { id: req.params.id } });
    if (!wo || wo.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    if (wo.status === 'RELEASED' || wo.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATE',
          message: `Cannot defer when work order status is ${wo.status}`,
        },
      });
    }

    const data = deferSchema.parse(req.body);

    const updatedWo = await prisma.workOrder.update({
      where: { id: req.params.id },
      data: {
        status: 'DEFERRED',
        deferralRef: data.deferralRef,
        deferralNotes: data.deferralNotes,
      },
    });

    logger.info('Work order deferred', {
      id: req.params.id,
      refNumber: wo.refNumber,
      deferralRef: data.deferralRef,
    });
    res.json({ success: true, data: updatedWo });
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
    logger.error('Defer work order error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to defer work order' },
    });
  }
});

// GET /:id/release-cert — Generate release certificate data
router.get('/:id/release-cert', async (req: Request, res: Response) => {
  try {
    const wo = await prisma.workOrder.findUnique({
      where: { id: req.params.id },
      include: { tasks: { orderBy: { taskNumber: 'asc' } } },
    });

    if (!wo || wo.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }

    if (wo.status !== 'RELEASED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_RELEASED',
          message: 'Release certificate is only available for released work orders',
        },
      });
    }

    const certificate = {
      certificateType: wo.releaseCertType,
      certificateRef: wo.releaseCertRef,
      workOrderRef: wo.refNumber,
      title: wo.title,
      aircraftType: wo.aircraftType,
      aircraftRegistration: wo.aircraftReg,
      description: wo.description,
      tasksPerformed: wo.tasks.map((t) => ({
        taskNumber: t.taskNumber,
        description: t.description,
        zone: t.zone,
        technicianName: t.technicianName,
        signedDate: t.signedDate,
        actualHours: t.actualHours,
        status: t.status,
      })),
      totalHours: wo.tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0),
      inspectedBy: wo.inspectedBy,
      inspectedDate: wo.inspectedDate,
      releasedBy: wo.releasedBy,
      releasedDate: wo.releasedDate,
      completedDate: wo.completedDate,
      generatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: certificate });
  } catch (error) {
    logger.error('Generate release cert error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate release certificate' },
    });
  }
});

export default router;
