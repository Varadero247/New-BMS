import { Router, Request, Response } from 'express';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const logger = createLogger('api-partners:commission');
const router = Router();

// GET /api/commission/summary — commission overview
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as AuthRequest).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const deals = await prisma.mktPartnerDeal.findMany({
      where: { partnerId },
      take: 500,
    });

    const totalEarned = deals
      .filter((d) => d.status === 'CLOSED_WON' && d.commissionValue)
      .reduce((sum, d) => sum + (d.commissionValue || 0), 0);

    const totalPaid = deals
      .filter((d) => d.commissionPaid && d.commissionValue)
      .reduce((sum, d) => sum + (d.commissionValue || 0), 0);

    const pendingPayout = totalEarned - totalPaid;

    const dealsWon = deals.filter((d) => d.status === 'CLOSED_WON').length;
    const dealsInPipeline = deals.filter((d) =>
      ['SUBMITTED', 'IN_DEMO', 'NEGOTIATING'].includes(d.status)
    ).length;

    const pipelineValue = deals
      .filter((d) => ['SUBMITTED', 'IN_DEMO', 'NEGOTIATING'].includes(d.status))
      .reduce((sum, d) => sum + ((d.estimatedACV || 0) * d.commissionRate), 0);

    res.json({
      success: true,
      data: {
        totalEarned,
        totalPaid,
        pendingPayout,
        dealsWon,
        dealsInPipeline,
        pipelineValue,
      },
    });
  } catch (error) {
    logger.error('Failed to get commission summary', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get commission summary' },
    });
  }
});

// GET /api/commission/history — full commission history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as AuthRequest).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const deals = await prisma.mktPartnerDeal.findMany({
      where: {
        partnerId,
        status: 'CLOSED_WON',
        commissionValue: { not: null },
      },
      orderBy: { closedAt: 'desc' },
      take: 500,
      select: {
        id: true,
        companyName: true,
        actualACV: true,
        commissionRate: true,
        commissionValue: true,
        commissionPaid: true,
        closedAt: true,
      },
    });

    res.json({ success: true, data: deals });
  } catch (error) {
    logger.error('Failed to get commission history', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get commission history' },
    });
  }
});

// GET /api/commission/pending — deals with unpaid commission
router.get('/pending', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as AuthRequest).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const deals = await prisma.mktPartnerDeal.findMany({
      where: {
        partnerId,
        status: 'CLOSED_WON',
        commissionPaid: false,
        commissionValue: { not: null },
      },
      orderBy: { closedAt: 'desc' },
      take: 500,
    });

    const totalPending = deals.reduce((sum, d) => sum + (d.commissionValue || 0), 0);

    res.json({ success: true, data: { deals, totalPending } });
  } catch (error) {
    logger.error('Failed to get pending commissions', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get pending commissions' },
    });
  }
});

export default router;
