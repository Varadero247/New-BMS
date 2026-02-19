import { Router, Response } from 'express';
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

// GET /api/timesheets - List timesheets by projectId or employeeId
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, employeeId, page = '1', limit = '50' } = req.query;

    if (!projectId && !employeeId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'projectId or employeeId query parameter is required',
        },
      });
    }

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (projectId) where.projectId = projectId;
    if (employeeId) where.employeeId = employeeId;

    const [timesheets, total] = await Promise.all([
      prisma.projectTimesheet.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { workDate: 'desc' },
        include: {
          task: { select: { id: true, taskCode: true, taskName: true } },
        },
      }),
      prisma.projectTimesheet.count({ where }),
    ]);

    res.json({
      success: true,
      data: timesheets,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List timesheets error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list timesheets' },
    });
  }
});

const createTimesheetSchema = z.object({
  projectId: z.string().trim().min(1).max(200),
  taskId: z.string().trim().optional(),
  employeeId: z.string().trim().min(1).max(200),
  workDate: z
    .string()
    .trim()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  hoursWorked: z.number().min(0),
  overtime: z.number().optional(),
  activityType: z.enum(['DEVELOPMENT', 'TESTING', 'DESIGN', 'MEETING', 'DOCUMENTATION', 'ADMIN']),
  description: z.string().trim().optional(),
  isBillable: z.boolean().optional(),
  billableHours: z.number().nonnegative().optional(),
  hourlyRate: z.number().nonnegative().optional(),
});
const updateTimesheetSchema = createTimesheetSchema.partial();

// POST /api/timesheets - Create timesheet entry
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createTimesheetSchema.parse(req.body);

    // Calculate total cost if hourly rate provided
    const billableHours = data.billableHours ?? data.hoursWorked;
    const totalCost = data.hourlyRate ? data.hourlyRate * billableHours : null;

    const timesheet = await prisma.projectTimesheet.create({
      data: {
        projectId: data.projectId,
        taskId: data.taskId,
        employeeId: data.employeeId,
        workDate: new Date(data.workDate),
        hoursWorked: data.hoursWorked,
        overtime: data.overtime || 0,
        activityType: data.activityType,
        description: data.description,
        isBillable: data.isBillable ?? true,
        billableHours,
        hourlyRate: data.hourlyRate,
        totalCost,
        status: 'PENDING',
      },
    });

    res.status(201).json({ success: true, data: timesheet });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    logger.error('Create timesheet error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create timesheet' },
    });
  }
});

// PUT /api/timesheets/:id - Update timesheet
router.put(
  '/:id',
  checkOwnership(prisma.projectTimesheet),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.projectTimesheet.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Timesheet not found' } });
      }

      const parsed = updateTimesheetSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
        });
      const data = parsed.data;
      const updateData = { ...data } as Record<string, unknown>;

      if (data.workDate) updateData.workDate = new Date(data.workDate);

      // Recalculate total cost if relevant fields changed
      const hourlyRate = data.hourlyRate ?? existing.hourlyRate;
      const billableHours = data.billableHours ?? existing.billableHours;
      if (hourlyRate && billableHours) {
        updateData.totalCost = hourlyRate * billableHours;
      }

      const timesheet = await prisma.projectTimesheet.update({
        where: { id: req.params.id },
        data: updateData,
      });

      res.json({ success: true, data: timesheet });
    } catch (error) {
      logger.error('Update timesheet error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update timesheet' },
      });
    }
  }
);

// PUT /api/timesheets/:id/approve - Approve timesheet
router.put(
  '/:id/approve',
  checkOwnership(prisma.projectTimesheet),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.projectTimesheet.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Timesheet not found' } });
      }

      const timesheet = await prisma.projectTimesheet.update({
        where: { id: req.params.id },
        data: {
          status: 'APPROVED',
          approvedBy: req.user?.id,
          approvedAt: new Date(),
        },
      });

      res.json({ success: true, data: timesheet });
    } catch (error) {
      logger.error('Approve timesheet error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to approve timesheet' },
      });
    }
  }
);

// DELETE /api/timesheets/:id - Delete timesheet
router.delete(
  '/:id',
  checkOwnership(prisma.projectTimesheet),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.projectTimesheet.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Timesheet not found' } });
      }

      await prisma.projectTimesheet.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });
      res.status(204).send();
    } catch (error) {
      logger.error('Delete timesheet error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete timesheet' },
      });
    }
  }
);

export default router;
