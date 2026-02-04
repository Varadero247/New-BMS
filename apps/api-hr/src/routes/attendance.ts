import { Router, Request, Response } from 'express';
import { prisma } from '@ims/database';
import { z } from 'zod';

const router: Router = Router();

// GET /api/attendance - Get attendance records
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      employeeId,
      startDate,
      endDate,
      status,
      page = '1',
      limit = '50',
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, employeeNumber: true, departmentId: true },
          },
          shift: true,
        },
        skip,
        take,
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.count({ where }),
    ]);

    res.json({
      success: true,
      data: attendances,
      meta: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch attendance' } });
  }
});

// GET /api/attendance/summary - Get attendance summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, departmentId } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate as string) : new Date();

    const where: any = {
      date: { gte: start, lte: end },
    };

    if (departmentId) {
      where.employee = { departmentId };
    }

    const summary = await prisma.attendance.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const totalHours = await prisma.attendance.aggregate({
      where,
      _sum: { workedHours: true, overtimeHours: true },
      _avg: { lateMinutes: true },
    });

    res.json({
      success: true,
      data: {
        byStatus: summary,
        totalWorkedHours: totalHours._sum.workedHours || 0,
        totalOvertimeHours: totalHours._sum.overtimeHours || 0,
        avgLateMinutes: Math.round(totalHours._avg.lateMinutes || 0),
      },
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch summary' } });
  }
});

// POST /api/attendance/clock-in - Clock in
router.post('/clock-in', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().uuid(),
      location: z.string().optional(),
      method: z.enum(['MANUAL', 'BIOMETRIC', 'CARD_SWIPE', 'MOBILE_APP', 'WEB_PORTAL', 'FACIAL_RECOGNITION']).default('WEB_PORTAL'),
    });

    const { employeeId, location, method } = schema.parse(req.body);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in today
    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    if (existing && existing.clockIn) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_CLOCKED_IN', message: 'Already clocked in today' },
      });
    }

    const now = new Date();

    // Get employee's shift to calculate late minutes
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { shift: true },
    });

    let lateMinutes = 0;
    if (employee?.shift) {
      const [shiftHour, shiftMin] = employee.shift.startTime.split(':').map(Number);
      const shiftStart = new Date(today);
      shiftStart.setHours(shiftHour, shiftMin, 0, 0);
      if (now > shiftStart) {
        lateMinutes = Math.round((now.getTime() - shiftStart.getTime()) / 60000);
      }
    }

    const attendance = await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date: today } },
      update: {
        clockIn: now,
        clockInLocation: location,
        clockInMethod: method,
        lateMinutes,
        status: lateMinutes > 0 ? 'LATE' : 'PRESENT',
      },
      create: {
        employeeId,
        date: today,
        shiftId: employee?.shiftId,
        clockIn: now,
        clockInLocation: location,
        clockInMethod: method,
        lateMinutes,
        status: lateMinutes > 0 ? 'LATE' : 'PRESENT',
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error clocking in:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to clock in' } });
  }
});

// POST /api/attendance/clock-out - Clock out
router.post('/clock-out', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().uuid(),
      location: z.string().optional(),
      method: z.enum(['MANUAL', 'BIOMETRIC', 'CARD_SWIPE', 'MOBILE_APP', 'WEB_PORTAL', 'FACIAL_RECOGNITION']).default('WEB_PORTAL'),
    });

    const { employeeId, location, method } = schema.parse(req.body);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });

    if (!existing || !existing.clockIn) {
      return res.status(400).json({
        success: false,
        error: { code: 'NOT_CLOCKED_IN', message: 'Must clock in first' },
      });
    }

    if (existing.clockOut) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_CLOCKED_OUT', message: 'Already clocked out today' },
      });
    }

    const now = new Date();
    const workedMs = now.getTime() - existing.clockIn.getTime();
    const workedHours = workedMs / 3600000;

    // Calculate overtime (if worked > 8 hours)
    const standardHours = existing.scheduledHours || 8;
    const overtimeHours = Math.max(0, workedHours - standardHours);

    const attendance = await prisma.attendance.update({
      where: { id: existing.id },
      data: {
        clockOut: now,
        clockOutLocation: location,
        clockOutMethod: method,
        workedHours: Math.round(workedHours * 100) / 100,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error clocking out:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to clock out' } });
  }
});

// PUT /api/attendance/:id - Update attendance record (manual correction)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      clockIn: z.string().optional(),
      clockOut: z.string().optional(),
      status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEKEND', 'WORK_FROM_HOME', 'LATE']).optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: any = { ...data };
    if (data.clockIn) updateData.clockIn = new Date(data.clockIn);
    if (data.clockOut) updateData.clockOut = new Date(data.clockOut);

    // Recalculate worked hours if both times are present
    if (updateData.clockIn && updateData.clockOut) {
      const workedMs = updateData.clockOut.getTime() - updateData.clockIn.getTime();
      updateData.workedHours = Math.round((workedMs / 3600000) * 100) / 100;
    }

    const attendance = await prisma.attendance.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error updating attendance:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update attendance' } });
  }
});

// Work shifts routes
// GET /api/attendance/shifts - Get all shifts
router.get('/shifts/all', async (_req: Request, res: Response) => {
  try {
    const shifts = await prisma.workShift.findMany({
      where: { isActive: true },
      include: { _count: { select: { employees: true } } },
    });

    res.json({ success: true, data: shifts });
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch shifts' } });
  }
});

// POST /api/attendance/shifts - Create shift
router.post('/shifts', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      code: z.string().min(1),
      description: z.string().optional(),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      breakDuration: z.number().default(60),
      workingHours: z.number(),
      monday: z.boolean().default(true),
      tuesday: z.boolean().default(true),
      wednesday: z.boolean().default(true),
      thursday: z.boolean().default(true),
      friday: z.boolean().default(true),
      saturday: z.boolean().default(false),
      sunday: z.boolean().default(false),
      isNightShift: z.boolean().default(false),
    });

    const data = schema.parse(req.body);

    const shift = await prisma.workShift.create({ data });

    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error creating shift:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create shift' } });
  }
});

export default router;
