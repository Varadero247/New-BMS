import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-energy');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// GET /dashboard — Energy KPIs dashboard
// ---------------------------------------------------------------------------

router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Total consumption this month
    const monthlyConsumption = await prisma.energyReading.aggregate({
      where: {
        deletedAt: null,
        readingDate: { gte: startOfMonth, lte: endOfMonth } as any,
      },
      _sum: { value: true, cost: true },
    });

    // Total consumption this year
    const yearlyConsumption = await prisma.energyReading.aggregate({
      where: {
        deletedAt: null,
        readingDate: { gte: startOfYear, lte: now } as any,
      },
      _sum: { value: true, cost: true },
    });

    // Active meters count
    const activeMeters = await prisma.energyMeter.count({
      where: { status: 'ACTIVE', deletedAt: null } as any,
    });

    // Active targets
    const targets = await prisma.energyTarget.findMany({
      where: { deletedAt: null, year: now.getFullYear() } as any,
      take: 1000,
    });
    const onTrackTargets = targets.filter(
      (t) => t.status === 'ON_TRACK' || t.status === 'ACHIEVED'
    ).length;

    // Active projects
    const activeProjects = await prisma.energyProject.count({
      where: { status: { in: ['APPROVED', 'IN_PROGRESS'] }, deletedAt: null },
    });

    // Unresolved alerts
    const unresolvedAlerts = await prisma.energyAlert.count({
      where: { resolvedAt: null, deletedAt: null } as any,
    });

    // SEU count
    const seuCount = await prisma.energySeu.count({
      where: { deletedAt: null } as any,
    });

    // Bills pending verification
    const pendingBills = await prisma.energyBill.count({
      where: { status: 'PENDING', deletedAt: null } as any,
    });

    res.json({
      success: true,
      data: {
        monthlyConsumption: Number(monthlyConsumption._sum.value || 0),
        monthlyCost: Number(monthlyConsumption._sum.cost || 0),
        yearlyConsumption: Number(yearlyConsumption._sum.value || 0),
        yearlyCost: Number(yearlyConsumption._sum.cost || 0),
        activeMeters,
        totalTargets: targets.length,
        onTrackTargets,
        activeProjects,
        unresolvedAlerts,
        significantEnergyUses: seuCount,
        pendingBills,
        period: {
          month: { start: startOfMonth.toISOString(), end: endOfMonth.toISOString() },
          year: now.getFullYear(),
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to generate dashboard', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate dashboard' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /esos — ESOS compliance report data
// ---------------------------------------------------------------------------

router.get('/esos', async (_req: Request, res: Response) => {
  try {
    // Energy Savings Opportunity Scheme data
    const audits = await prisma.energyAudit.findMany({
      where: { deletedAt: null, type: { in: ['EXTERNAL', 'REGULATORY', 'ISO_50001'] } as any },
      orderBy: { scheduledDate: 'desc' },
      take: 1000,
    });

    const seus = await prisma.energySeu.findMany({
      where: { deletedAt: null } as any,
      orderBy: { consumptionPercentage: 'desc' },
      take: 1000,
    });

    const projects = await prisma.energyProject.findMany({
      where: { deletedAt: null } as any,
      orderBy: { estimatedSavings: 'desc' },
      take: 1000,
    });

    const totalConsumption = seus.reduce((sum, s) => sum + Number(s.annualConsumption), 0);
    const totalSavingsOpportunity = projects.reduce(
      (sum, p) => sum + Number(p.estimatedSavings || 0),
      0
    );

    res.json({
      success: true,
      data: {
        qualifyingAudits: audits.length,
        latestAudit: audits[0] || null,
        significantEnergyUses: seus.map((s) => ({
          name: s.name,
          facility: s.facility,
          annualConsumption: Number(s.annualConsumption),
          consumptionPercentage: Number(s.consumptionPercentage),
          unit: s.unit,
          status: s.status,
        })),
        totalConsumption,
        savingsOpportunities: projects.map((p) => ({
          title: p.title,
          type: p.type,
          estimatedSavings: Number(p.estimatedSavings || 0),
          investmentCost: Number(p.investmentCost || 0),
          paybackMonths: p.paybackMonths,
          status: p.status,
        })),
        totalSavingsOpportunity,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to generate ESOS report', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate ESOS report' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /secr — UK Streamlined Energy and Carbon Reporting
// ---------------------------------------------------------------------------

router.get('/secr', async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    const reportYear = year ? parseInt(String(year), 10) : new Date().getFullYear();

    const startOfYear = new Date(reportYear, 0, 1);
    const endOfYear = new Date(reportYear, 11, 31, 23, 59, 59);

    // Total energy consumption by type
    const readings = await prisma.energyReading.findMany({
      where: {
        deletedAt: null,
        readingDate: { gte: startOfYear, lte: endOfYear } as any,
      },
      include: {
        meter: { select: { type: true, unit: true } },
      },
      take: 1000,
    });

    const byType: Record<string, { consumption: number; cost: number; count: number }> = {};
    for (const r of readings) {
      const type = r.meter.type;
      if (!byType[type]) {
        byType[type] = { consumption: 0, cost: 0, count: 0 };
      }
      byType[type].consumption += Number(r.value);
      byType[type].cost += Number(r.cost || 0);
      byType[type].count++;
    }

    // Total bills for the year
    const bills = await prisma.energyBill.aggregate({
      where: {
        deletedAt: null,
        periodStart: { gte: startOfYear } as any,
        periodEnd: { lte: endOfYear },
      },
      _sum: { cost: true, consumption: true },
    });

    // EnPI performance
    const enpis = await prisma.energyEnpi.findMany({
      where: { deletedAt: null } as any,
      select: {
        name: true,
        unit: true,
        baselineValue: true,
        currentValue: true,
        targetValue: true,
      },
      take: 1000,
    });

    const totalConsumption = Object.values(byType).reduce((sum, t) => sum + t.consumption, 0);
    const totalCost = Number(bills._sum.cost || 0);

    res.json({
      success: true,
      data: {
        reportYear,
        totalEnergyConsumption: totalConsumption,
        totalEnergyCost: totalCost,
        consumptionByType: Object.entries(byType).map(([type, data]) => ({
          type,
          ...data,
        })),
        intensityMetrics: enpis.map((e) => ({
          name: e.name,
          unit: e.unit,
          baseline: Number(e.baselineValue || 0),
          current: Number(e.currentValue || 0),
          target: Number(e.targetValue || 0),
        })),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to generate SECR report', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate SECR report' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /consumption — Consumption by type/facility/period
// ---------------------------------------------------------------------------

router.get('/consumption', async (req: Request, res: Response) => {
  try {
    const { groupBy, dateFrom, dateTo, facility } = req.query;

    const where: Record<string, unknown> = { deletedAt: null };
    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.gte = new Date(String(dateFrom));
      if (dateTo) dateFilter.lte = new Date(String(dateTo));
      where.readingDate = dateFilter;
    }

    const readings = await prisma.energyReading.findMany({
      where,
      include: {
        meter: { select: { type: true, facility: true, unit: true, name: true } },
      },
      take: 1000,
    });

    // Filter by facility if provided
    const filtered = facility
      ? readings.filter(
          (r) =>
            r.meter.facility &&
            r.meter.facility.toLowerCase().includes(String(facility).toLowerCase())
        )
      : readings;

    const groupKey = typeof groupBy === 'string' ? groupBy : 'type';

    const grouped: Record<string, { consumption: number; cost: number; count: number }> = {};
    for (const r of filtered) {
      let key: string;
      if (groupKey === 'facility') {
        key = r.meter.facility || 'Unknown';
      } else if (groupKey === 'meter') {
        key = r.meter.name;
      } else {
        key = r.meter.type;
      }

      if (!grouped[key]) {
        grouped[key] = { consumption: 0, cost: 0, count: 0 };
      }
      grouped[key].consumption += Number(r.value);
      grouped[key].cost += Number(r.cost || 0);
      grouped[key].count++;
    }

    const totalConsumption = filtered.reduce((sum, r) => sum + Number(r.value), 0);
    const totalCost = filtered.reduce((sum, r) => sum + Number(r.cost || 0), 0);

    res.json({
      success: true,
      data: {
        groupBy: groupKey,
        totalConsumption,
        totalCost,
        readingCount: filtered.length,
        breakdown: Object.entries(grouped)
          .map(([key, data]) => ({
            key,
            ...data,
            percentage:
              totalConsumption > 0
                ? Math.round((data.consumption / totalConsumption) * 10000) / 100
                : 0,
          }))
          .sort((a, b) => b.consumption - a.consumption),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to generate consumption report', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate consumption report' },
    });
  }
});

export default router;
