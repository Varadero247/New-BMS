// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-energy');

const router = Router();
router.use(authenticate);

// GET /api/dashboard — energy management KPI summary
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [meters, baselines, targets, seus, alerts, projects, audits] = await Promise.all([
      prisma.energyMeter.count({ where: { status: 'ACTIVE' } }),
      prisma.energyBaseline.count(),
      prisma.energyTarget.count(),
      prisma.energySeu.count(),
      prisma.energyAlert.count({ where: { acknowledged: false } }),
      prisma.energyProject.count({ where: { status: { not: 'COMPLETED' } } }),
      prisma.energyAudit.count(),
    ]);

    // Get recent readings for trend
    const recentReadings = await prisma.energyReading.findMany({
      orderBy: { readingDate: 'desc' },
      take: 10,
      select: { id: true, readingDate: true, value: true, meterId: true },
    });

    // Get unacknowledged alerts
    const activeAlerts = await prisma.energyAlert.findMany({
      where: { acknowledged: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, type: true, severity: true, message: true, createdAt: true },
    });

    // Get top SEUs
    const topSeus = await prisma.energySeu.findMany({
      orderBy: { consumptionPercentage: 'desc' },
      take: 5,
      select: { id: true, name: true, unit: true, consumptionPercentage: true, annualConsumption: true, priority: true },
    });

    // Total energy consumption from recent bills
    const recentBills = await prisma.energyBill.findMany({
      where: {
        periodStart: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      },
      take: 500,
      select: { cost: true, consumption: true, unit: true },
    });
    const totalConsumption = recentBills.reduce((sum, b) => sum + (typeof b.consumption === 'object' ? (b.consumption as { toNumber?: () => number }).toNumber?.() || 0 : Number(b.consumption) || 0), 0);
    const totalCost = recentBills.reduce((sum, b) => sum + (typeof b.cost === 'object' ? (b.cost as { toNumber?: () => number }).toNumber?.() || 0 : Number(b.cost) || 0), 0);

    res.json({
      success: true,
      data: {
        summary: { meters, baselines, targets, seus, alerts, projects, audits, totalConsumption, totalCost },
        recentReadings,
        activeAlerts,
        topSeus,
      },
    });
  } catch (error) {
    logger.error('Energy dashboard error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch dashboard data' } });
  }
});

export default router;
