// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination} from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-hr');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/attendance - Get attendance records
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate, status, page = '1', limit = '50' } = req.query;

    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query, { defaultLimit: 50 });

    const where: Record<string, unknown> = { deletedAt: null };
    if (employeeId) where.employeeId = employeeId as string;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {
        ...(startDate && { gte: new Date(startDate as string) }),
        ...(endDate && { lte: new Date(endDate as string) }),
      };
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeNumber: true,
              departmentId: true,
            },
          },
          shift: true,
        },
        skip,
        take: limitNum,
        orderBy: { date: 'desc' },
      }),
      prisma.attendance.count({ where }),
    ]);

    res.json({
      success: true,
      data: attendances,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('Error fetching attendance', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch attendance' },
    });
  }
});

// GET /api/attendance/summary - Get attendance summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, departmentId } = req.query;

    // Default to last 30 days if not provided
    const end = endDate ? new Date(endDate as string) : new Date();
    const start = startDate
      ? new Date(startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const where: Record<string, unknown> = {
      date: { gte: start, lte: end },
    };

    if (departmentId) {
      where.employee = { departmentId };
    }

    // Get attendance records grouped by status
    const summary = await prisma.attendance.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    });

    // Extract individual counts
    const statusCounts: Record<string, number> = {};
    summary.forEach((s) => {
      statusCounts[s.status] = s._count.id;
    });

    const present = statusCounts['PRESENT'] || 0;
    const absent = statusCounts['ABSENT'] || 0;
    const late = statusCounts['LATE'] || 0;
    const halfDay = statusCounts['HALF_DAY'] || 0;
    const leave = statusCounts['ON_LEAVE'] || 0;
    const totalRecords = summary.reduce((acc, s) => acc + s._count.id, 0);

    // Get total hours
    const totalHours = await prisma.attendance.aggregate({
      where,
      _sum: { workedHours: true, overtimeHours: true },
      _avg: { lateMinutes: true },
    });

    // Today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySummary = await prisma.attendance.groupBy({
      by: ['status'],
      where: {
        date: { gte: today, lt: tomorrow },
        ...(departmentId ? { employee: { departmentId: departmentId as string } } : {}),
      },
      _count: { id: true },
    });

    const todayStatusCounts: Record<string, number> = {};
    todaySummary.forEach((s) => {
      todayStatusCounts[s.status] = s._count.id;
    });

    const todayPresent = (todayStatusCounts['PRESENT'] || 0) + (todayStatusCounts['LATE'] || 0);
    const todayAbsent = todayStatusCounts['ABSENT'] || 0;

    // Get total active employees
    const totalEmployees = await prisma.employee.count({
      where: {
        employmentStatus: 'ACTIVE',
        ...(departmentId ? { departmentId: departmentId as string } : {}),
      },
    });

    // Get last 7 days trends — single query then group in JS (avoids 7 sequential DB calls)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weekRecords = await prisma.attendance.findMany({
      where: {
        date: { gte: sevenDaysAgo },
        ...(departmentId ? { employee: { departmentId: departmentId as string } } : {}),
      },
      select: { date: true, status: true },
      take: 10000,
    });

    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayCounts: Record<string, number> = {};
      weekRecords
        .filter((r) => r.date >= date && r.date < nextDay)
        .forEach((r) => {
          dayCounts[r.status] = (dayCounts[r.status] || 0) + 1;
        });

      trends.push({
        date: date.toISOString().split('T')[0],
        present: (dayCounts['PRESENT'] || 0) + (dayCounts['LATE'] || 0),
        absent: dayCounts['ABSENT'] || 0,
        late: dayCounts['LATE'] || 0,
        leave: dayCounts['ON_LEAVE'] || 0,
      });
    }

    res.json({
      success: true,
      data: {
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        totalRecords,
        present,
        absent,
        late,
        halfDay,
        leave,
        presentPercentage: totalRecords > 0 ? Math.round((present / totalRecords) * 1000) / 10 : 0,
        absentPercentage: totalRecords > 0 ? Math.round((absent / totalRecords) * 1000) / 10 : 0,
        latePercentage: totalRecords > 0 ? Math.round((late / totalRecords) * 1000) / 10 : 0,
        totalWorkedHours: Math.round((Number(totalHours._sum.workedHours || 0) || 0) * 10) / 10,
        totalOvertimeHours: Math.round((Number(totalHours._sum.overtimeHours || 0) || 0) * 10) / 10,
        avgLateMinutes: Math.round(Number(totalHours._avg?.lateMinutes || 0) || 0),
        todayPresent,
        todayAbsent,
        todayTotal: totalEmployees,
        trends,
      },
    });
  } catch (error) {
    logger.error('Error fetching attendance summary', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch summary' },
    });
  }
});

// POST /api/attendance/clock-in - Clock in
router.post('/clock-in', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().trim().uuid(),
      location: z.string().trim().optional(),
      method: z
        .enum([
          'MANUAL',
          'BIOMETRIC',
          'CARD_SWIPE',
          'MOBILE_APP',
          'WEB_PORTAL',
          'FACIAL_RECOGNITION',
        ])
        .default('WEB_PORTAL'),
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
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error clocking in', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to clock in' } });
  }
});

// POST /api/attendance/clock-out - Clock out
router.post('/clock-out', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().trim().uuid(),
      location: z.string().trim().optional(),
      method: z
        .enum([
          'MANUAL',
          'BIOMETRIC',
          'CARD_SWIPE',
          'MOBILE_APP',
          'WEB_PORTAL',
          'FACIAL_RECOGNITION',
        ])
        .default('WEB_PORTAL'),
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
    const standardHours = Number(existing.scheduledHours) || 8;
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
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error clocking out', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to clock out' } });
  }
});

// PUT /api/attendance/:id - Update attendance record (manual correction)
router.put('/:id', checkOwnership(prisma.attendance), async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      clockIn: z.string().trim().optional(),
      clockOut: z.string().trim().optional(),
      status: z
        .enum([
          'PRESENT',
          'ABSENT',
          'HALF_DAY',
          'ON_LEAVE',
          'HOLIDAY',
          'WEEKEND',
          'WORK_FROM_HOME',
          'LATE',
        ])
        .optional(),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: Record<string, unknown> = { ...data } as Record<string, unknown>;
    if (data.clockIn) updateData.clockIn = new Date(data.clockIn);
    if (data.clockOut) updateData.clockOut = new Date(data.clockOut);

    // Recalculate worked hours if both times are present
    if (updateData.clockIn && updateData.clockOut) {
      const workedMs = (updateData.clockOut as Date).getTime() - (updateData.clockIn as Date).getTime();
      updateData.workedHours = Math.round((workedMs / 3600000) * 100) / 100;
    }

    const attendance = await prisma.attendance.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating attendance', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update attendance' },
    });
  }
});

// POST /api/attendance - Manual attendance entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().trim().uuid(),
      date: z
        .string()
        .trim()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      clockIn: z.string().trim().optional(),
      clockOut: z.string().trim().optional(),
      status: z
        .enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'WORK_FROM_HOME', 'HOLIDAY'])
        .default('PRESENT'),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const attendanceDate = new Date(data.date);
    attendanceDate.setHours(0, 0, 0, 0);

    const createData: Record<string, unknown> = {
      employeeId: data.employeeId,
      date: attendanceDate,
      status: data.status,
      notes: data.notes,
      clockInMethod: 'MANUAL' as const,
      lateMinutes: 0,
    };

    if (data.clockIn) {
      const [hours, minutes] = data.clockIn.split(':').map(Number);
      const clockInDate = new Date(attendanceDate);
      clockInDate.setHours(hours, minutes, 0, 0);
      createData.clockIn = clockInDate;
    }

    if (data.clockOut) {
      const [hours, minutes] = data.clockOut.split(':').map(Number);
      const clockOutDate = new Date(attendanceDate);
      clockOutDate.setHours(hours, minutes, 0, 0);
      createData.clockOut = clockOutDate;
    }

    if (createData.clockIn && createData.clockOut) {
      const workedMs = (createData.clockOut as Date).getTime() - (createData.clockIn as Date).getTime();
      createData.workedHours = Math.round((workedMs / 3600000) * 100) / 100;
      const standardHours = 8;
      createData.overtimeHours = Math.max(
        0,
        Math.round((Number(createData.workedHours) - standardHours) * 100) / 100
      );
    }

    const attendance = await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: data.employeeId, date: attendanceDate } },
      update: createData as Prisma.AttendanceUncheckedUpdateInput,
      create: createData as Prisma.AttendanceUncheckedCreateInput,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeNumber: true },
        },
      },
    });

    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating manual attendance', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create attendance record' },
    });
  }
});

// Work shifts routes
// GET /api/attendance/shifts - Get all shifts
router.get('/shifts/all', async (_req: Request, res: Response) => {
  try {
    const shifts = await prisma.workShift.findMany({
      where: { isActive: true, deletedAt: null },
      include: { _count: { select: { employees: true } } },
      take: 1000,
    });

    res.json({ success: true, data: shifts });
  } catch (error) {
    logger.error('Error fetching shifts', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch shifts' },
    });
  }
});

// POST /api/attendance/shifts - Create shift
router.post('/shifts', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().trim().min(1).max(200),
      code: z.string().trim().min(1).max(200),
      description: z.string().trim().optional(),
      startTime: z
        .string()
        .trim()
        .regex(/^\d{2}:\d{2}$/),
      endTime: z
        .string()
        .trim()
        .regex(/^\d{2}:\d{2}$/),
      breakDuration: z.number().default(60),
      workingHours: z.number().nonnegative(),
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
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating shift', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create shift' },
    });
  }
});

export default router;
