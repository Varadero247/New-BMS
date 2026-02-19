import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-partners:deals');
const router = Router();
router.param('id', validateIdParam());

const createDealSchema = z.object({
  companyName: z.string().trim().min(1).max(200),
  contactName: z.string().trim().min(1).max(200),
  contactEmail: z.string().trim().email(),
  estimatedUsers: z.number().int().min(1),
  isoStandards: z.array(z.string().trim()).min(1),
  estimatedACV: z.number().min(0).optional(),
  notes: z.string().trim().optional(),
});

const statusUpdateSchema = z.object({
  status: z.enum(['SUBMITTED', 'IN_DEMO', 'NEGOTIATING', 'CLOSED_WON', 'CLOSED_LOST']),
  actualACV: z.number().optional(),
});

const VALID_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ['IN_DEMO', 'CLOSED_LOST'],
  IN_DEMO: ['NEGOTIATING', 'CLOSED_LOST'],
  NEGOTIATING: ['CLOSED_WON', 'CLOSED_LOST'],
  CLOSED_WON: [],
  CLOSED_LOST: [],
};

// POST /api/deals
router.post('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as any).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const parsed = createDealSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    // Get partner's commission rate based on tier
    const partner = await prisma.mktPartner.findUnique({ where: { id: partnerId } });
    const commissionRates: Record<string, number> = {
      REFERRAL: 0.25,
      CO_SELL: 0.325,
      RESELLER: 0.375,
      GCC_SPECIALIST: 0.3,
    };
    const commissionRate = commissionRates[partner?.tier || 'REFERRAL'] || 0.25;

    const deal = await prisma.mktPartnerDeal.create({
      data: {
        ...parsed.data,
        partnerId,
        commissionRate,
      },
    });

    res.status(201).json({ success: true, data: deal });
  } catch (error) {
    logger.error('Deal creation failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create deal' },
    });
  }
});

// GET /api/deals
router.get('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as any).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const { status } = req.query;
    const where: Record<string, unknown> = { partnerId };
    if (status) where.status = status as any;

    const deals = await prisma.mktPartnerDeal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    // Summary stats
    const submitted = deals.filter((d) => d.status === 'SUBMITTED').length;
    const inProgress = deals.filter((d) => ['IN_DEMO', 'NEGOTIATING'].includes(d.status)).length;
    const closedWon = deals.filter((d) => d.status === 'CLOSED_WON').length;
    const totalCommission = deals
      .filter((d) => d.status === 'CLOSED_WON' && d.commissionValue)
      .reduce((sum, d) => sum + (d.commissionValue || 0), 0);
    const pendingCommission = deals
      .filter((d) => d.status === 'CLOSED_WON' && !d.commissionPaid && d.commissionValue)
      .reduce((sum, d) => sum + (d.commissionValue || 0), 0);

    res.json({
      success: true,
      data: {
        deals,
        summary: { submitted, inProgress, closedWon, totalCommission, pendingCommission },
      },
    });
  } catch (error) {
    logger.error('Failed to fetch deals', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch deals' },
    });
  }
});

// PATCH /api/deals/:id/status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as any).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const parsed = statusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const deal = await prisma.mktPartnerDeal.findUnique({
      where: { id: req.params.id },
    });

    if (!deal || deal.partnerId !== partnerId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Deal not found' },
      });
    }

    // Validate state transition
    const validNext = VALID_TRANSITIONS[deal.status] || [];
    if (!validNext.includes(parsed.data.status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: `Cannot transition from ${deal.status} to ${parsed.data.status}`,
        },
      });
    }

    const updateData: Record<string, unknown> = { status: parsed.data.status };

    if (parsed.data.status === 'CLOSED_WON') {
      updateData.closedAt = new Date();
      const acv = parsed.data.actualACV || deal.estimatedACV || 0;
      updateData.actualACV = acv;
      updateData.commissionValue = acv * deal.commissionRate;
    }

    if (parsed.data.status === 'CLOSED_LOST') {
      updateData.closedAt = new Date();
    }

    const updated = await prisma.mktPartnerDeal.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('Deal status update failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update deal' },
    });
  }
});

export default router;
