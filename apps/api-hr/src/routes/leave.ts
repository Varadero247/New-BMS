import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-hr');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/leave/types - Get all leave types
router.get('/types', async (_req: Request, res: Response) => {
  try {
    const types = await prisma.leaveType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 100,
    });

    res.json({ success: true, data: types });
  } catch (error) {
    logger.error('Error fetching leave types', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch leave types' } });
  }
});

// POST /api/leave/types - Create leave type
router.post('/types', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      code: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.enum(['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT', 'UNPAID', 'COMPENSATORY', 'STUDY', 'SABBATICAL', 'OTHER']),
      color: z.string().optional(),
      defaultDaysPerYear: z.number().default(0),
      maxCarryForward: z.number().default(0),
      isPaid: z.boolean().default(true),
      requiresApproval: z.boolean().default(true),
      requiresDocument: z.boolean().default(false),
      allowHalfDay: z.boolean().default(true),
      minNoticeDays: z.number().default(0),
    });

    const data = schema.parse(req.body);
    const leaveType = await prisma.leaveType.create({ data });

    res.status(201).json({ success: true, data: leaveType });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating leave type', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create leave type' } });
  }
});

// GET /api/leave/requests - Get leave requests
router.get('/requests', async (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      status,
      leaveTypeId,
      startDate,
      endDate,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.LeaveRequestWhereInput = {};
    if (employeeId) where.employeeId = employeeId as string;
    if (status) where.status = status as string;
    if (leaveTypeId) where.leaveTypeId = leaveTypeId as string;
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate as string);
      if (endDate) where.startDate.lte = new Date(endDate as string);
    }

    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true, departmentId: true } },
          leaveType: true,
          approvals: true,
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: requests,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('Error fetching leave requests', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch leave requests' } });
  }
});

// GET /api/leave/requests/:id - Get single leave request
router.get('/requests/:id', async (req: Request, res: Response) => {
  try {
    const request = await prisma.leaveRequest.findUnique({
      where: { id: req.params.id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
            department: true,
            manager: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        leaveType: true,
        approvals: true,
      },
    });

    if (!request) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Leave request not found' } });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    logger.error('Error fetching leave request', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch leave request' } });
  }
});

// POST /api/leave/requests - Create leave request
router.post('/requests', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().uuid(),
      leaveTypeId: z.string().uuid(),
      startDate: z.string(),
      endDate: z.string(),
      isHalfDay: z.boolean().default(false),
      halfDayPeriod: z.enum(['FIRST_HALF', 'SECOND_HALF']).optional(),
      reason: z.string().optional(),
      contactDuring: z.string().optional(),
      handoverToId: z.string().uuid().optional(),
      handoverNotes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Calculate days
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    let days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (data.isHalfDay) days = 0.5;

    // Check balance
    const year = start.getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: { employeeId_leaveTypeId_year: { employeeId: data.employeeId, leaveTypeId: data.leaveTypeId, year } },
    });

    if (balance && balance.balance < days) {
      return res.status(400).json({
        success: false,
        error: { code: 'INSUFFICIENT_BALANCE', message: `Insufficient leave balance. Available: ${balance.balance}, Requested: ${days}` },
      });
    }

    // Generate request number
    const count = await prisma.leaveRequest.count();
    const requestNumber = `LR-${year}-${String(count + 1).padStart(5, '0')}`;

    // Get employee's manager for approval
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
      select: { managerId: true },
    });

    const request = await prisma.$transaction(async (tx) => {
      const created = await tx.leaveRequest.create({
        data: {
          requestNumber,
          employeeId: data.employeeId,
          leaveTypeId: data.leaveTypeId,
          startDate: start,
          endDate: end,
          days,
          isHalfDay: data.isHalfDay,
          halfDayPeriod: data.halfDayPeriod,
          reason: data.reason,
          contactDuring: data.contactDuring,
          handoverToId: data.handoverToId,
          handoverNotes: data.handoverNotes,
          status: 'PENDING',
          approvals: employee?.managerId ? {
            create: {
              approverEmployeeId: employee.managerId,
              step: 1,
              status: 'PENDING',
            },
          } : undefined,
        },
        include: {
          employee: { select: { firstName: true, lastName: true } },
          leaveType: true,
          approvals: true,
        },
      });

      // Update pending balance
      if (balance) {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { pending: { increment: days } },
        });
      }

      return created;
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating leave request', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create leave request' } });
  }
});

// PUT /api/leave/requests/:id/approve - Approve leave request
router.put('/requests/:id/approve', async (req: Request, res: Response) => {
  try {
    const { approverId, comments } = req.body;

    const request = await prisma.leaveRequest.findUnique({
      where: { id: req.params.id },
      include: { approvals: true },
    });

    if (!request) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Leave request not found' } });
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      // Update approval
      await tx.leaveApproval.updateMany({
        where: { leaveRequestId: req.params.id, approverEmployeeId: approverId },
        data: { status: 'APPROVED', decision: 'APPROVE', decidedAt: new Date(), comments },
      });

      // Update request status
      const updated = await tx.leaveRequest.update({
        where: { id: req.params.id },
        data: { status: 'APPROVED' },
        include: { employee: true, leaveType: true },
      });

      // Update leave balance
      const year = request.startDate.getFullYear();
      await tx.leaveBalance.update({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            year,
          },
        },
        data: {
          pending: { decrement: request.days },
          taken: { increment: request.days },
          balance: { decrement: request.days },
        },
      });

      return updated;
    });

    res.json({ success: true, data: updatedRequest });
  } catch (error) {
    logger.error('Error approving leave request', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve leave request' } });
  }
});

// PUT /api/leave/requests/:id/reject - Reject leave request
router.put('/requests/:id/reject', async (req: Request, res: Response) => {
  try {
    const { approverId, comments } = req.body;

    const request = await prisma.leaveRequest.findUnique({ where: { id: req.params.id } });

    if (!request) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Leave request not found' } });
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      // Update approval
      await tx.leaveApproval.updateMany({
        where: { leaveRequestId: req.params.id, approverEmployeeId: approverId },
        data: { status: 'REJECTED', decision: 'REJECT', decidedAt: new Date(), comments },
      });

      // Update request status
      const updated = await tx.leaveRequest.update({
        where: { id: req.params.id },
        data: { status: 'REJECTED' },
      });

      // Release pending balance
      const year = request.startDate.getFullYear();
      await tx.leaveBalance.update({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            year,
          },
        },
        data: { pending: { decrement: request.days } },
      });

      return updated;
    });

    res.json({ success: true, data: updatedRequest });
  } catch (error) {
    logger.error('Error rejecting leave request', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reject leave request' } });
  }
});

// GET /api/leave/balances/:employeeId - Get employee leave balances
router.get('/balances/:employeeId', async (req: Request, res: Response) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const balances = await prisma.leaveBalance.findMany({
      where: {
        employeeId: req.params.employeeId,
        year: parseInt(year as string),
      },
      include: { leaveType: true },
      take: 100,
    });

    res.json({ success: true, data: balances });
  } catch (error) {
    logger.error('Error fetching leave balances', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch leave balances' } });
  }
});

// POST /api/leave/balances - Initialize/update leave balance
router.post('/balances', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().uuid(),
      leaveTypeId: z.string().uuid(),
      year: z.number(),
      entitled: z.number(),
      carryForward: z.number().default(0),
      adjustment: z.number().default(0),
    });

    const data = schema.parse(req.body);
    const balance = data.entitled + data.carryForward + data.adjustment;

    const leaveBalance = await prisma.leaveBalance.upsert({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: data.employeeId,
          leaveTypeId: data.leaveTypeId,
          year: data.year,
        },
      },
      update: {
        entitled: data.entitled,
        carryForward: data.carryForward,
        adjustment: data.adjustment,
        balance,
      },
      create: {
        ...data,
        balance,
      },
      include: { leaveType: true },
    });

    res.json({ success: true, data: leaveBalance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating leave balance', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update leave balance' } });
  }
});

// GET /api/leave/calendar - Get leave calendar
router.get('/calendar', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, departmentId } = req.query;

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const where: Prisma.LeaveRequestWhereInput = {
      status: 'APPROVED',
      OR: [
        { startDate: { gte: start, lte: end } },
        { endDate: { gte: start, lte: end } },
        { AND: [{ startDate: { lte: start } }, { endDate: { gte: end } }] },
      ],
    };

    if (departmentId) {
      where.employee = { departmentId };
    }

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, departmentId: true } },
        leaveType: { select: { name: true, color: true } },
      },
      take: 500,
    });

    res.json({ success: true, data: leaves });
  } catch (error) {
    logger.error('Error fetching leave calendar', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch calendar' } });
  }
});

// Holidays
// GET /api/leave/holidays - Get holidays
router.get('/holidays', async (req: Request, res: Response) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const holidays = await prisma.holiday.findMany({
      where: { year: parseInt(year as string) },
      orderBy: { date: 'asc' },
      take: 100,
    });

    res.json({ success: true, data: holidays });
  } catch (error) {
    logger.error('Error fetching holidays', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch holidays' } });
  }
});

// POST /api/leave/holidays - Create holiday
router.post('/holidays', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      date: z.string(),
      type: z.enum(['PUBLIC', 'COMPANY', 'OPTIONAL', 'RESTRICTED']),
      isFloating: z.boolean().default(false),
      applicableLocations: z.array(z.string()).default([]),
      description: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const date = new Date(data.date);

    const holiday = await prisma.holiday.create({
      data: {
        ...data,
        date,
        year: date.getFullYear(),
      },
    });

    res.status(201).json({ success: true, data: holiday });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating holiday', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create holiday' } });
  }
});

export default router;
