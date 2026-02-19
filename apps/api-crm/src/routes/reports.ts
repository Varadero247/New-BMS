import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';


const router = Router();
const logger = createLogger('api-crm');

router.use(authenticate);

// GET /sales-dashboard — Overall sales metrics
router.get('/sales-dashboard', async (_req: Request, res: Response) => {
  try {
    const totalDeals = await prisma.crmDeal.count({ where: { deletedAt: null } as any });
    const wonDeals = await prisma.crmDeal.count({
      where: { status: 'WON', deletedAt: null } as any,
    });
    const lostDeals = await prisma.crmDeal.count({
      where: { status: 'LOST', deletedAt: null } as any,
    });
    const openDeals = await prisma.crmDeal.count({
      where: { status: 'OPEN', deletedAt: null } as any,
    });

    const totalValueAgg = await prisma.crmDeal.aggregate({
      where: { deletedAt: null } as any,
      _sum: { value: true },
    });

    const wonValueAgg = await prisma.crmDeal.aggregate({
      where: { status: 'WON', deletedAt: null } as any,
      _sum: { value: true },
    });

    const totalValue = Number(totalValueAgg._sum.value || 0);
    const wonValue = Number(wonValueAgg._sum.value || 0);
    const avgDealSize = wonDeals > 0 ? Math.round((wonValue / wonDeals) * 100) / 100 : 0;
    const conversionRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 10000) / 100 : 0;

    return res.json({
      success: true,
      data: {
        totalDeals,
        wonDeals,
        lostDeals,
        openDeals,
        totalValue,
        wonValue,
        avgDealSize,
        conversionRate,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get sales dashboard', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get sales dashboard' },
    });
  }
});

// GET /pipeline-velocity — Average deal age and velocity by stage
router.get('/pipeline-velocity', async (_req: Request, res: Response) => {
  try {
    const openDeals = await prisma.crmDeal.findMany({
      where: { status: 'OPEN', deletedAt: null } as any,
      select: { createdAt: true, stageId: true },
      take: 1000,
    });

    const now = new Date();
    const dealAges = openDeals.map((d) => {
      const ageMs = now.getTime() - d.createdAt.getTime();
      return { ageDays: Math.floor(ageMs / (1000 * 60 * 60 * 24)), stageId: d.stageId };
    });

    const avgDealAge =
      dealAges.length > 0
        ? Math.round(dealAges.reduce((sum, d) => sum + d.ageDays, 0) / dealAges.length)
        : 0;

    // Velocity by stage
    const stageMap: Record<string, { totalDays: number; count: number }> = {};
    for (const deal of dealAges) {
      const key = deal.stageId || 'unassigned';
      if (!stageMap[key]) stageMap[key] = { totalDays: 0, count: 0 };
      stageMap[key].totalDays += deal.ageDays;
      stageMap[key].count += 1;
    }

    const velocityByStage = Object.entries(stageMap).map(([stageId, data]) => ({
      stageId,
      avgDays: Math.round(data.totalDays / data.count),
      dealCount: data.count,
    }));

    return res.json({
      success: true,
      data: { avgDealAge, velocityByStage },
    });
  } catch (error: unknown) {
    logger.error('Failed to get pipeline velocity', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get pipeline velocity' },
    });
  }
});

// GET /win-loss — Win/loss rates by source and assignee
router.get('/win-loss', async (_req: Request, res: Response) => {
  try {
    const closedDeals = await prisma.crmDeal.findMany({
      where: { status: { in: ['WON', 'LOST'] }, deletedAt: null },
      select: { status: true, source: true, assignedTo: true },
      take: 1000,
    });

    const wonCount = closedDeals.filter((d) => d.status === 'WON').length;
    const lostCount = closedDeals.filter((d) => d.status === 'LOST').length;
    const totalClosed = closedDeals.length;

    const winRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 10000) / 100 : 0;
    const lossRate = totalClosed > 0 ? Math.round((lostCount / totalClosed) * 10000) / 100 : 0;

    // By source
    const sourceMap: Record<string, { won: number; lost: number }> = {};
    for (const deal of closedDeals) {
      const key = deal.source || 'UNKNOWN';
      if (!sourceMap[key]) sourceMap[key] = { won: 0, lost: 0 };
      if (deal.status === 'WON') sourceMap[key].won++;
      else sourceMap[key].lost++;
    }

    const bySource = Object.entries(sourceMap).map(([source, data]) => ({
      source,
      won: data.won,
      lost: data.lost,
      total: data.won + data.lost,
      winRate: Math.round((data.won / (data.won + data.lost)) * 10000) / 100,
    }));

    // By assignee
    const assigneeMap: Record<string, { won: number; lost: number }> = {};
    for (const deal of closedDeals) {
      const key = deal.assignedTo || 'unassigned';
      if (!assigneeMap[key]) assigneeMap[key] = { won: 0, lost: 0 };
      if (deal.status === 'WON') assigneeMap[key].won++;
      else assigneeMap[key].lost++;
    }

    const byAssignee = Object.entries(assigneeMap).map(([assignee, data]) => ({
      assignee,
      won: data.won,
      lost: data.lost,
      total: data.won + data.lost,
      winRate: Math.round((data.won / (data.won + data.lost)) * 10000) / 100,
    }));

    return res.json({
      success: true,
      data: { winRate, lossRate, bySource, byAssignee },
    });
  } catch (error: unknown) {
    logger.error('Failed to get win/loss report', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get win/loss report' },
    });
  }
});

// GET /forecast — Revenue forecast for OPEN deals grouped by month
router.get('/forecast', async (_req: Request, res: Response) => {
  try {
    const openDeals = await prisma.crmDeal.findMany({
      where: { status: 'OPEN', deletedAt: null } as any,
      select: { value: true, probability: true, expectedCloseDate: true },
      take: 1000,
    });

    // Group by expected close month
    const monthMap: Record<string, { weighted: number; count: number; totalValue: number }> = {};

    for (const deal of openDeals) {
      const value = Number(deal.value);
      const probability = deal.probability || 0;
      const weighted = Math.round(((value * probability) / 100) * 100) / 100;

      let monthKey: string;
      if (deal.expectedCloseDate) {
        const d = new Date(deal.expectedCloseDate);
        monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else {
        monthKey = 'unscheduled';
      }

      if (!monthMap[monthKey]) monthMap[monthKey] = { weighted: 0, count: 0, totalValue: 0 };
      monthMap[monthKey].weighted += weighted;
      monthMap[monthKey].count += 1;
      monthMap[monthKey].totalValue += value;
    }

    const forecast = Object.entries(monthMap)
      .map(([month, data]) => ({
        month,
        dealCount: data.count,
        totalValue: Math.round(data.totalValue * 100) / 100,
        weightedValue: Math.round(data.weighted * 100) / 100,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const totalWeightedForecast = forecast.reduce((sum, f) => sum + f.weightedValue, 0);

    return res.json({
      success: true,
      data: { totalWeightedForecast: Math.round(totalWeightedForecast * 100) / 100, forecast },
    });
  } catch (error: unknown) {
    logger.error('Failed to get forecast', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get forecast' },
    });
  }
});

// GET /partner-performance — Partner-sourced revenue and commissions
router.get('/partner-performance', async (_req: Request, res: Response) => {
  try {
    const partners = await prisma.crmPartner.findMany({
      where: { deletedAt: null } as any,
      include: {
        account: { select: { name: true } },
        referrals: {
          where: { deletedAt: null } as any,
          include: { deal: { select: { value: true, status: true } } },
        },
      },
      orderBy: { totalReferrals: 'desc' },
      take: 1000,
    });

    let totalPartnerSourcedRevenue = 0;
    let totalCommissions = 0;

    const topPartners = partners.map((partner) => {
      const wonReferrals = partner.referrals.filter((r) => r.deal.status === 'WON');
      const partnerRevenue = wonReferrals.reduce((sum, r) => sum + Number(r.deal.value), 0);
      const partnerCommissions = Number(partner.totalCommissionPaid);

      totalPartnerSourcedRevenue += partnerRevenue;
      totalCommissions += partnerCommissions;

      return {
        partnerId: partner.id,
        accountName: partner.account.name,
        tier: partner.tier,
        totalReferrals: partner.totalReferrals,
        wonReferrals: wonReferrals.length,
        revenue: Math.round(partnerRevenue * 100) / 100,
        commissionsPaid: partnerCommissions,
      };
    });

    return res.json({
      success: true,
      data: {
        totalPartnerSourcedRevenue: Math.round(totalPartnerSourcedRevenue * 100) / 100,
        totalCommissions: Math.round(totalCommissions * 100) / 100,
        topPartners,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get partner performance', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get partner performance' },
    });
  }
});

// GET /customer-health — Account health metrics
router.get('/customer-health', async (_req: Request, res: Response) => {
  try {
    const accounts = await prisma.crmAccount.findMany({
      where: { deletedAt: null, type: 'CUSTOMER' } as any,
      select: {
        id: true,
        name: true,
        lifetimeRevenue: true,
        openComplaintCount: true,
        openNCRCount: true,
        lastInvoiceDate: true,
      },
      take: 1000,
    });

    const totalAccounts = accounts.length;
    const revenues = accounts.map((a) => Number(a.lifetimeRevenue || 0));
    const avgLifetimeRevenue =
      totalAccounts > 0
        ? Math.round((revenues.reduce((sum, r) => sum + r, 0) / totalAccounts) * 100) / 100
        : 0;

    const accountsWithComplaints = accounts.filter((a) => (a.openComplaintCount || 0) > 0);
    const accountsWithNCRs = accounts.filter((a) => (a.openNCRCount || 0) > 0);

    // Accounts with no activity in last 90 days
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const inactiveAccounts = accounts.filter(
      (a) => !a.lastInvoiceDate || new Date(a.lastInvoiceDate) < ninetyDaysAgo
    );

    return res.json({
      success: true,
      data: {
        totalCustomerAccounts: totalAccounts,
        avgLifetimeRevenue,
        accountsWithOpenComplaints: accountsWithComplaints.length,
        accountsWithOpenNCRs: accountsWithNCRs.length,
        inactiveAccounts: inactiveAccounts.length,
        healthBreakdown: accounts.map((a) => ({
          accountId: a.id,
          accountName: a.name,
          lifetimeRevenue: Number(a.lifetimeRevenue || 0),
          openComplaints: a.openComplaintCount || 0,
          openNCRs: a.openNCRCount || 0,
          lastInvoiceDate: a.lastInvoiceDate,
          isInactive: !a.lastInvoiceDate || new Date(a.lastInvoiceDate) < ninetyDaysAgo,
        })),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get customer health', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get customer health' },
    });
  }
});

export default router;
