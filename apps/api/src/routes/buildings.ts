import { Router } from 'express';
import type { Router as IRouter } from 'express';
import { z } from 'zod';
import { prisma } from '@ims/database';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/error-handler';

const router: IRouter = Router();

const createBuildingSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().default('USA'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  totalArea: z.number().positive().optional(),
  floors: z.number().int().positive().default(1),
  yearBuilt: z.number().int().optional(),
  imageUrl: z.string().url().optional(),
});

const updateBuildingSchema = createBuildingSchema.partial();

const createZoneSchema = z.object({
  name: z.string().min(1),
  floor: z.number().int().positive().default(1),
  type: z.enum([
    'OFFICE', 'CONFERENCE', 'LOBBY', 'HALLWAY', 'RESTROOM',
    'KITCHEN', 'SERVER_ROOM', 'STORAGE', 'PARKING', 'MECHANICAL',
    'OUTDOOR', 'OTHER'
  ]),
  area: z.number().positive().optional(),
  capacity: z.number().int().positive().optional(),
  description: z.string().optional(),
});

// List all buildings
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
        { city: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [buildings, total] = await Promise.all([
      prisma.building.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { zones: true, devices: true },
          },
        },
      }),
      prisma.building.count({ where }),
    ]);

    res.json({
      success: true,
      data: buildings,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single building
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const building = await prisma.building.findUnique({
      where: { id },
      include: {
        zones: { where: { isActive: true } },
        devices: { where: { isActive: true }, take: 10 },
        _count: {
          select: { zones: true, devices: true, alerts: true },
        },
      },
    });

    if (!building) {
      throw new AppError(404, 'NOT_FOUND', 'Building not found');
    }

    res.json({
      success: true,
      data: building,
    });
  } catch (error) {
    next(error);
  }
});

// Create building
router.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'MANAGER'),
  validate(createBuildingSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const building = await prisma.building.create({
        data: req.body,
      });

      // Add creator as building owner
      await prisma.buildingUser.create({
        data: {
          buildingId: building.id,
          userId: req.user!.id,
          role: 'OWNER',
        },
      });

      res.status(201).json({
        success: true,
        data: building,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update building
router.put(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'MANAGER'),
  validate(updateBuildingSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;

      const building = await prisma.building.update({
        where: { id },
        data: req.body,
      });

      res.json({
        success: true,
        data: building,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete building
router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;

      await prisma.building.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        success: true,
        data: { message: 'Building deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
);

// List zones for a building
router.get('/:id/zones', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const zones = await prisma.zone.findMany({
      where: { buildingId: id, isActive: true },
      include: {
        _count: { select: { devices: true } },
      },
      orderBy: [{ floor: 'asc' }, { name: 'asc' }],
    });

    res.json({
      success: true,
      data: zones,
    });
  } catch (error) {
    next(error);
  }
});

// Create zone
router.post(
  '/:id/zones',
  authenticate,
  requireRole('ADMIN', 'MANAGER'),
  validate(createZoneSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;

      const zone = await prisma.zone.create({
        data: {
          ...req.body,
          buildingId: id,
        },
      });

      res.status(201).json({
        success: true,
        data: zone,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
