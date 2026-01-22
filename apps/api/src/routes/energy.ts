import { Router } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router: IRouter = Router();

// Get energy stats
router.get('/stats', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { buildingId, period = 'day' } = req.query;

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    const where: any = {
      timestamp: { gte: startDate },
    };

    if (buildingId) {
      where.buildingId = buildingId;
    }

    const readings = await prisma.energyReading.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });

    // Calculate stats
    const totalConsumption = readings.reduce((sum, r) => sum + r.value, 0);
    const totalCost = readings.reduce((sum, r) => sum + (r.cost || 0), 0);
    const averageDaily = totalConsumption / (period === 'day' ? 1 : period === 'week' ? 7 : 30);
    const peakUsage = Math.max(...readings.map((r) => r.value), 0);

    // Get previous period for comparison
    const prevStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const prevReadings = await prisma.energyReading.findMany({
      where: {
        ...where,
        timestamp: { gte: prevStartDate, lt: startDate },
      },
    });

    const prevTotal = prevReadings.reduce((sum, r) => sum + r.value, 0);
    const percentChange = prevTotal > 0 ? ((totalConsumption - prevTotal) / prevTotal) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalConsumption,
        totalCost,
        averageDaily,
        peakUsage,
        comparison: {
          previousPeriod: prevTotal,
          percentChange: Math.round(percentChange * 100) / 100,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get energy readings
router.get('/readings', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { buildingId, type, from, to, limit = 100 } = req.query;

    const where: any = {};

    if (buildingId) where.buildingId = buildingId;
    if (type) where.type = type;
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = new Date(from as string);
      if (to) where.timestamp.lte = new Date(to as string);
    }

    const readings = await prisma.energyReading.findMany({
      where,
      take: Number(limit),
      orderBy: { timestamp: 'desc' },
      include: {
        building: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      data: readings,
    });
  } catch (error) {
    next(error);
  }
});

// Get energy by building
router.get('/by-building', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const readings = await prisma.energyReading.groupBy({
      by: ['buildingId'],
      where: {
        timestamp: { gte: startOfMonth },
      },
      _sum: {
        value: true,
        cost: true,
      },
    });

    const buildings = await prisma.building.findMany({
      where: { id: { in: readings.map((r) => r.buildingId) } },
      select: { id: true, name: true },
    });

    const data = readings.map((r) => ({
      building: buildings.find((b) => b.id === r.buildingId),
      totalUsage: r._sum.value || 0,
      totalCost: r._sum.cost || 0,
    }));

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
