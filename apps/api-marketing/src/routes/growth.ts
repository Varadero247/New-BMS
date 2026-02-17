import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const logger = createLogger('api-marketing:growth');
const router = Router();

// GET /api/growth/metrics
router.get('/metrics', authenticate, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Lead metrics
    const [totalLeads, leadsThisMonth, leadsLastMonth] = await Promise.all([
      prisma.mktLead.count(),
      prisma.mktLead.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.mktLead.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
    ]);

    // Lead source breakdown
    const leadsBySource = await prisma.mktLead.groupBy({
      by: ['source'],
      _count: true,
    });

    // Health score distribution
    const healthScores = await prisma.mktHealthScore.findMany({
      orderBy: { createdAt: 'desc' },
      distinct: ['userId'],
    });

    const healthy = healthScores.filter((s) => s.score >= 70).length;
    const atRisk = healthScores.filter((s) => s.score >= 40 && s.score < 70).length;
    const critical = healthScores.filter((s) => s.score < 40).length;

    // Partner metrics
    const [totalPartners, totalDeals, closedWonDeals] = await Promise.all([
      prisma.mktPartner.count(),
      prisma.mktPartnerDeal.count(),
      prisma.mktPartnerDeal.count({ where: { status: 'CLOSED_WON' } }),
    ]);

    // Upcoming renewals
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const upcomingRenewals = await prisma.mktRenewalSequence.count({
      where: {
        renewalDate: { lte: thirtyDaysFromNow },
        renewedAt: null,
      },
    });

    // Active win-backs
    const activeWinBacks = await prisma.mktWinBackSequence.count({
      where: { reactivatedAt: null },
    });

    res.json({
      success: true,
      data: {
        leads: {
          total: totalLeads,
          thisMonth: leadsThisMonth,
          lastMonth: leadsLastMonth,
          bySource: leadsBySource.map((s) => ({ source: s.source, count: s._count })),
        },
        health: {
          total: healthScores.length,
          healthy,
          atRisk,
          critical,
        },
        partners: {
          total: totalPartners,
          totalDeals,
          closedWonDeals,
        },
        renewals: {
          upcoming30Days: upcomingRenewals,
        },
        winBacks: {
          active: activeWinBacks,
        },
      },
    });
  } catch (error) {
    logger.error('Growth metrics failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch growth metrics' },
    });
  }
});

// GET /api/growth/snapshot/:date
router.get('/snapshot/:date', authenticate, async (req: Request, res: Response) => {
  try {
    const date = new Date(req.params.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid date format' },
      });
    }

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const [leadsOnDate, emailsSent] = await Promise.all([
      prisma.mktLead.count({
        where: { createdAt: { gte: date, lt: nextDay } },
      }),
      prisma.mktEmailLog.count({
        where: { sentAt: { gte: date, lt: nextDay } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        date: req.params.date,
        leads: leadsOnDate,
        emailsSent,
      },
    });
  } catch (error) {
    logger.error('Growth snapshot failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch snapshot' },
    });
  }
});

export default router;
