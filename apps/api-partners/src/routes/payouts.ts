import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const logger = createLogger('api-partners:payouts');
const router = Router();

const MIN_PAYOUT_AMOUNT = 100; // £100

const requestPayoutSchema = z.object({
  paymentMethod: z.enum(['BANK_TRANSFER', 'PAYPAL', 'STRIPE']).optional(),
  notes: z.string().max(1000).optional(),
});

// GET /api/payouts
router.get('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as any).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const payouts = await prisma.mktPartnerPayout.findMany({
      where: { partnerId },
      orderBy: { requestedAt: 'desc' },
    });

    // Calculate available balance
    const unpaidDeals = await prisma.mktPartnerDeal.findMany({
      where: {
        partnerId,
        status: 'CLOSED_WON',
        commissionPaid: false,
        commissionValue: { not: null },
      },
    });

    const availableBalance = unpaidDeals.reduce((sum, d) => sum + (d.commissionValue || 0), 0);

    res.json({
      success: true,
      data: {
        payouts,
        availableBalance,
        minPayoutAmount: MIN_PAYOUT_AMOUNT,
        canRequestPayout: availableBalance >= MIN_PAYOUT_AMOUNT,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch payouts', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch payouts' },
    });
  }
});

// POST /api/payouts/request
router.post('/request', async (req: Request, res: Response) => {
  try {
    const parsed = requestPayoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0]?.message || 'Invalid input' } });
    }

    const partnerId = (req as any).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    // Get unpaid deals
    const unpaidDeals = await prisma.mktPartnerDeal.findMany({
      where: {
        partnerId,
        status: 'CLOSED_WON',
        commissionPaid: false,
        commissionValue: { not: null },
      },
    });

    const totalAmount = unpaidDeals.reduce((sum, d) => sum + (d.commissionValue || 0), 0);

    if (totalAmount < MIN_PAYOUT_AMOUNT) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BELOW_MINIMUM',
          message: `Minimum payout amount is £${MIN_PAYOUT_AMOUNT}. Current available: £${totalAmount.toFixed(2)}`,
        },
      });
    }

    // Create payout request
    const payout = await prisma.mktPartnerPayout.create({
      data: {
        partnerId,
        amount: totalAmount,
        dealIds: unpaidDeals.map((d) => d.id),
      },
    });

    // Mark deals as commission paid
    await prisma.mktPartnerDeal.updateMany({
      where: { id: { in: unpaidDeals.map((d) => d.id) } },
      data: { commissionPaid: true },
    });

    res.status(201).json({ success: true, data: payout });
  } catch (error) {
    logger.error('Payout request failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to request payout' },
    });
  }
});

export default router;
