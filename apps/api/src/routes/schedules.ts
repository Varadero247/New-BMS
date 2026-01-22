import { Router } from 'express';
import type { Router as IRouter } from 'express';
import { z } from 'zod';
import { prisma } from '@ims/database';
import { validate } from '../middleware/validate';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error-handler';

const router: IRouter = Router();

const createScheduleSchema = z.object({
  buildingId: z.string(),
  zoneId: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['HVAC', 'LIGHTING', 'ACCESS', 'MAINTENANCE', 'CUSTOM']),
  config: z.object({
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    temperature: z.number().optional(),
    brightness: z.number().min(0).max(100).optional(),
    recurring: z.boolean().optional(),
    actions: z.array(z.object({
      deviceId: z.string().optional(),
      command: z.string(),
      params: z.record(z.any()).optional(),
    })).optional(),
  }),
  isActive: z.boolean().optional(),
});

const updateScheduleSchema = createScheduleSchema.partial();

// Get all schedules
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { buildingId, type, active, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (buildingId) {
      where.buildingId = buildingId;
    }

    if (type) {
      where.type = type;
    }

    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        where,
        include: {
          building: {
            select: { id: true, name: true },
          },
          zone: {
            select: { id: true, name: true },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.schedule.count({ where }),
    ]);

    res.json({
      success: true,
      data: schedules,
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

// Get schedule by ID
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        building: {
          select: { id: true, name: true, address: true },
        },
        zone: {
          select: { id: true, name: true, floor: true },
        },
      },
    });

    if (!schedule) {
      throw new AppError(404, 'NOT_FOUND', 'Schedule not found');
    }

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
});

// Create schedule
router.post('/', authenticate, requireRole(['ADMIN', 'MANAGER']), validate(createScheduleSchema), async (req: AuthRequest, res, next) => {
  try {
    const data = req.body;

    // Verify building exists
    const building = await prisma.building.findUnique({
      where: { id: data.buildingId },
    });

    if (!building) {
      throw new AppError(404, 'NOT_FOUND', 'Building not found');
    }

    // Verify zone if provided
    if (data.zoneId) {
      const zone = await prisma.zone.findUnique({
        where: { id: data.zoneId },
      });

      if (!zone || zone.buildingId !== data.buildingId) {
        throw new AppError(404, 'NOT_FOUND', 'Zone not found in this building');
      }
    }

    const schedule = await prisma.schedule.create({
      data: {
        buildingId: data.buildingId,
        zoneId: data.zoneId,
        name: data.name,
        description: data.description,
        type: data.type,
        config: data.config,
        isActive: data.isActive ?? true,
      },
      include: {
        building: {
          select: { id: true, name: true },
        },
        zone: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
});

// Update schedule
router.patch('/:id', authenticate, requireRole(['ADMIN', 'MANAGER']), validate(updateScheduleSchema), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Schedule not found');
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: updates,
      include: {
        building: {
          select: { id: true, name: true },
        },
        zone: {
          select: { id: true, name: true },
        },
      },
    });

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
});

// Toggle schedule active status
router.post('/:id/toggle', authenticate, requireRole(['ADMIN', 'MANAGER']), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Schedule not found');
    }

    const schedule = await prisma.schedule.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    res.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    next(error);
  }
});

// Delete schedule
router.delete('/:id', authenticate, requireRole(['ADMIN', 'MANAGER']), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const schedule = await prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new AppError(404, 'NOT_FOUND', 'Schedule not found');
    }

    await prisma.schedule.delete({
      where: { id },
    });

    res.json({
      success: true,
      data: { message: 'Schedule deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
});

// Get schedules for a specific building
router.get('/building/:buildingId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { buildingId } = req.params;

    const schedules = await prisma.schedule.findMany({
      where: { buildingId },
      include: {
        zone: {
          select: { id: true, name: true, floor: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
