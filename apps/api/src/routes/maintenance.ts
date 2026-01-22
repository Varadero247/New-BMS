import { Router } from 'express';
import type { Router as IRouter } from 'express';
import { z } from 'zod';
import { prisma } from '@ims/database';
import { validate } from '../middleware/validate';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error-handler';

const router: IRouter = Router();

const createMaintenanceSchema = z.object({
  deviceId: z.string(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'INSPECTION', 'EMERGENCY']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  title: z.string().min(1),
  description: z.string().min(1),
  scheduledAt: z.string().datetime().optional(),
});

const updateMaintenanceSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  notes: z.string().optional(),
  cost: z.number().min(0).optional(),
  scheduledAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
});

// Get all maintenance reports
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      type,
      priority,
      deviceId,
      buildingId,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (priority) {
      where.priority = priority;
    }

    if (deviceId) {
      where.deviceId = deviceId;
    }

    if (buildingId) {
      where.device = {
        buildingId,
      };
    }

    const [reports, total] = await Promise.all([
      prisma.maintenanceReport.findMany({
        where,
        include: {
          device: {
            select: {
              id: true,
              name: true,
              type: true,
              building: {
                select: { id: true, name: true },
              },
            },
          },
          reporter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.maintenanceReport.count({ where }),
    ]);

    res.json({
      success: true,
      data: reports,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get maintenance report by ID
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const report = await prisma.maintenanceReport.findUnique({
      where: { id },
      include: {
        device: {
          include: {
            building: {
              select: { id: true, name: true, address: true },
            },
            zone: {
              select: { id: true, name: true, floor: true },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!report) {
      throw new AppError(404, 'NOT_FOUND', 'Maintenance report not found');
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

// Create maintenance report
router.post('/', authenticate, validate(createMaintenanceSchema), async (req: AuthRequest, res, next) => {
  try {
    const data = req.body;

    // Verify device exists
    const device = await prisma.device.findUnique({
      where: { id: data.deviceId },
    });

    if (!device) {
      throw new AppError(404, 'NOT_FOUND', 'Device not found');
    }

    const report = await prisma.maintenanceReport.create({
      data: {
        deviceId: data.deviceId,
        reportedBy: req.user!.id,
        type: data.type,
        priority: data.priority,
        title: data.title,
        description: data.description,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      },
      include: {
        device: {
          select: {
            id: true,
            name: true,
            type: true,
            building: {
              select: { id: true, name: true },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create alert for urgent/high priority maintenance
    if (data.priority === 'URGENT' || data.priority === 'HIGH') {
      await prisma.alert.create({
        data: {
          buildingId: device.buildingId,
          deviceId: device.id,
          type: 'MAINTENANCE',
          severity: data.priority === 'URGENT' ? 'CRITICAL' : 'WARNING',
          title: `Maintenance Required: ${data.title}`,
          message: data.description,
          data: { maintenanceReportId: report.id },
        },
      });
    }

    res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

// Update maintenance report
router.patch('/:id', authenticate, validate(updateMaintenanceSchema), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = await prisma.maintenanceReport.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Maintenance report not found');
    }

    // Handle status transitions
    if (updates.status === 'COMPLETED' && !updates.completedAt) {
      updates.completedAt = new Date();
    }

    const report = await prisma.maintenanceReport.update({
      where: { id },
      data: {
        ...updates,
        scheduledAt: updates.scheduledAt ? new Date(updates.scheduledAt) : undefined,
        completedAt: updates.completedAt ? new Date(updates.completedAt) : undefined,
      },
      include: {
        device: {
          select: {
            id: true,
            name: true,
            type: true,
            building: {
              select: { id: true, name: true },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

// Delete maintenance report
router.delete('/:id', authenticate, requireRole(['ADMIN', 'MANAGER']), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const report = await prisma.maintenanceReport.findUnique({
      where: { id },
    });

    if (!report) {
      throw new AppError(404, 'NOT_FOUND', 'Maintenance report not found');
    }

    await prisma.maintenanceReport.delete({
      where: { id },
    });

    res.json({
      success: true,
      data: { message: 'Maintenance report deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
});

// Get maintenance statistics
router.get('/stats/summary', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { buildingId } = req.query;

    const where: any = {};
    if (buildingId) {
      where.device = { buildingId };
    }

    const [
      total,
      open,
      inProgress,
      completed,
      urgent,
      byType,
    ] = await Promise.all([
      prisma.maintenanceReport.count({ where }),
      prisma.maintenanceReport.count({ where: { ...where, status: 'OPEN' } }),
      prisma.maintenanceReport.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.maintenanceReport.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.maintenanceReport.count({ where: { ...where, priority: 'URGENT', status: { not: 'COMPLETED' } } }),
      prisma.maintenanceReport.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        open,
        inProgress,
        completed,
        urgent,
        byType: byType.reduce((acc, curr) => {
          acc[curr.type] = curr._count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
