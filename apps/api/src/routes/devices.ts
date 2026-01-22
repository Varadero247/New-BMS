import { Router } from 'express';
import type { Router as IRouter } from 'express';
import { z } from 'zod';
import { prisma } from '@ims/database';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError } from '../middleware/error-handler';

const router: IRouter = Router();

const createDeviceSchema = z.object({
  buildingId: z.string(),
  zoneId: z.string().optional(),
  name: z.string().min(1),
  type: z.enum([
    'HVAC', 'THERMOSTAT', 'LIGHTING', 'MOTION_SENSOR', 'DOOR_SENSOR',
    'WINDOW_SENSOR', 'SMOKE_DETECTOR', 'CO_DETECTOR', 'WATER_LEAK',
    'ENERGY_METER', 'AIR_QUALITY', 'CAMERA', 'ACCESS_CONTROL',
    'ELEVATOR', 'FIRE_ALARM', 'SPRINKLER', 'GENERATOR', 'UPS', 'OTHER'
  ]),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  ipAddress: z.string().optional(),
  macAddress: z.string().optional(),
  firmware: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const updateDeviceSchema = createDeviceSchema.partial();

const controlDeviceSchema = z.object({
  command: z.string().min(1),
  parameters: z.record(z.unknown()).optional(),
});

// List all devices
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { page = 1, limit = 50, buildingId, zoneId, type, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { isActive: true };

    if (buildingId) where.buildingId = buildingId;
    if (zoneId) where.zoneId = zoneId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { serialNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          building: { select: { id: true, name: true } },
          zone: { select: { id: true, name: true } },
        },
      }),
      prisma.device.count({ where }),
    ]);

    res.json({
      success: true,
      data: devices,
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

// Get device stats
router.get('/stats', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const [total, online, offline, warning, error] = await Promise.all([
      prisma.device.count({ where: { isActive: true } }),
      prisma.device.count({ where: { isActive: true, status: 'ONLINE' } }),
      prisma.device.count({ where: { isActive: true, status: 'OFFLINE' } }),
      prisma.device.count({ where: { isActive: true, status: 'WARNING' } }),
      prisma.device.count({ where: { isActive: true, status: 'ERROR' } }),
    ]);

    res.json({
      success: true,
      data: { total, online, offline, warning, error },
    });
  } catch (error) {
    next(error);
  }
});

// Get single device
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const device = await prisma.device.findUnique({
      where: { id },
      include: {
        building: { select: { id: true, name: true } },
        zone: { select: { id: true, name: true } },
        readings: {
          take: 20,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!device) {
      throw new AppError(404, 'NOT_FOUND', 'Device not found');
    }

    res.json({
      success: true,
      data: device,
    });
  } catch (error) {
    next(error);
  }
});

// Create device
router.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'MANAGER', 'TECHNICIAN'),
  validate(createDeviceSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const device = await prisma.device.create({
        data: {
          ...req.body,
          status: 'OFFLINE',
        },
        include: {
          building: { select: { id: true, name: true } },
          zone: { select: { id: true, name: true } },
        },
      });

      res.status(201).json({
        success: true,
        data: device,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update device
router.put(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'MANAGER', 'TECHNICIAN'),
  validate(updateDeviceSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;

      const device = await prisma.device.update({
        where: { id },
        data: req.body,
        include: {
          building: { select: { id: true, name: true } },
          zone: { select: { id: true, name: true } },
        },
      });

      res.json({
        success: true,
        data: device,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete device
router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'MANAGER'),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;

      await prisma.device.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        success: true,
        data: { message: 'Device deleted successfully' },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get device readings
router.get('/:id/readings', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 100, type, from, to } = req.query;

    const where: any = { deviceId: id };

    if (type) where.type = type;
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from as string);
      if (to) where.timestamp.lte = new Date(to as string);
    }

    const readings = await prisma.sensorReading.findMany({
      where,
      take: Number(limit),
      orderBy: { timestamp: 'desc' },
    });

    res.json({
      success: true,
      data: readings,
    });
  } catch (error) {
    next(error);
  }
});

// Send control command
router.post(
  '/:id/control',
  authenticate,
  requireRole('ADMIN', 'MANAGER', 'TECHNICIAN'),
  validate(controlDeviceSchema),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;
      const { command, parameters } = req.body;

      const control = await prisma.deviceControl.create({
        data: {
          deviceId: id,
          command,
          parameters,
          status: 'PENDING',
        },
      });

      // In a real implementation, this would send the command to the device
      // For now, we'll simulate success
      await prisma.deviceControl.update({
        where: { id: control.id },
        data: {
          status: 'SUCCESS',
          executedAt: new Date(),
          result: { success: true },
        },
      });

      res.json({
        success: true,
        data: { message: 'Command sent successfully', controlId: control.id },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
