import { Router } from 'express';
import { prisma } from '@bms/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Get dashboard stats
router.get('/stats', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalBuildings,
      activeBuildings,
      totalDevices,
      onlineDevices,
      offlineDevices,
      warningDevices,
      errorDevices,
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      todayEnergy,
      monthEnergy,
      prevMonthEnergy,
    ] = await Promise.all([
      prisma.building.count(),
      prisma.building.count({ where: { isActive: true } }),
      prisma.device.count({ where: { isActive: true } }),
      prisma.device.count({ where: { isActive: true, status: 'ONLINE' } }),
      prisma.device.count({ where: { isActive: true, status: 'OFFLINE' } }),
      prisma.device.count({ where: { isActive: true, status: 'WARNING' } }),
      prisma.device.count({ where: { isActive: true, status: 'ERROR' } }),
      prisma.alert.count(),
      prisma.alert.count({ where: { status: 'ACTIVE' } }),
      prisma.alert.count({ where: { status: 'ACTIVE', severity: 'CRITICAL' } }),
      prisma.energyReading.aggregate({
        where: { timestamp: { gte: startOfDay } },
        _sum: { value: true },
      }),
      prisma.energyReading.aggregate({
        where: { timestamp: { gte: startOfMonth } },
        _sum: { value: true },
      }),
      prisma.energyReading.aggregate({
        where: {
          timestamp: {
            gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            lt: startOfMonth,
          },
        },
        _sum: { value: true },
      }),
    ]);

    const currentMonth = monthEnergy._sum.value || 0;
    const previousMonth = prevMonthEnergy._sum.value || 0;
    const energyTrend = previousMonth > 0
      ? ((currentMonth - previousMonth) / previousMonth) * 100
      : 0;

    res.json({
      success: true,
      data: {
        buildings: {
          total: totalBuildings,
          active: activeBuildings,
        },
        devices: {
          total: totalDevices,
          online: onlineDevices,
          offline: offlineDevices,
          warning: warningDevices,
          error: errorDevices,
        },
        alerts: {
          total: totalAlerts,
          active: activeAlerts,
          critical: criticalAlerts,
        },
        energy: {
          todayUsage: todayEnergy._sum.value || 0,
          monthUsage: currentMonth,
          trend: Math.round(energyTrend * 100) / 100,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get recent activity
router.get('/activity', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const [recentAlerts, recentDeviceUpdates] = await Promise.all([
      prisma.alert.findMany({
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          building: { select: { name: true } },
          device: { select: { name: true } },
        },
      }),
      prisma.device.findMany({
        where: { lastSeen: { not: null } },
        take: Number(limit),
        orderBy: { lastSeen: 'desc' },
        select: {
          id: true,
          name: true,
          status: true,
          lastSeen: true,
          building: { select: { name: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        alerts: recentAlerts,
        deviceUpdates: recentDeviceUpdates,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
