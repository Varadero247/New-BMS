import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { z } from 'zod';

const router = Router();
const logger = createLogger('api-crm');

router.use(authenticate);

const RESERVED_PATHS = ['leaderboard'];

const TIER_CONFIG: Record<string, { commissionRate: number; bountyAmount: number; commissionDuration: number }> = {
  TIER_1_REFERRAL: { commissionRate: 25, bountyAmount: 500, commissionDuration: 12 },
  TIER_2_COSELL: { commissionRate: 32.5, bountyAmount: 750, commissionDuration: 18 },
  TIER_3_RESELLER: { commissionRate: 37.5, bountyAmount: 1000, commissionDuration: 24 },
};

const createPartnerSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  tier: z.enum(['TIER_1_REFERRAL', 'TIER_2_COSELL', 'TIER_3_RESELLER']),
  notes: z.string().optional(),
});

const updateTierSchema = z.object({
  tier: z.enum(['TIER_1_REFERRAL', 'TIER_2_COSELL', 'TIER_3_RESELLER']),
});

const createReferralSchema = z.object({
  dealId: z.string().min(1, 'Deal ID is required'),
});

const payCommissionsSchema = z.object({
  commissionIds: z.array(z.string()).min(1, 'At least one commission ID is required'),
});

// POST / — Register partner
router.post('/', async (req: Request, res: Response) => {
  try {
    const validation = createPartnerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors.map((e) => e.message).join(', '),
      });
    }

    const tierConfig = TIER_CONFIG[validation.data.tier];
    const userId = (req as any).user?.id || 'system';

    const partner = await prisma.crmPartner.create({
      data: {
        accountId: validation.data.accountId,
        tier: validation.data.tier,
        commissionRate: tierConfig.commissionRate,
        bountyAmount: tierConfig.bountyAmount,
        commissionDuration: tierConfig.commissionDuration,
        notes: validation.data.notes,
        createdBy: userId,
      },
    });

    logger.info('Partner registered', { partnerId: partner.id, tier: partner.tier });
    return res.status(201).json({ success: true, data: partner });
  } catch (error: unknown) {
    if (error != null && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Account is already registered as a partner' });
    }
    logger.error('Failed to register partner', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to register partner' });
  }
});

// GET / — List partners
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const tier = req.query.tier as string;
    const status = req.query.status as string;

    const where: Record<string, unknown> = { deletedAt: null };
    if (tier) where.tier = tier;
    if (status) where.status = status;

    const [partners, total] = await Promise.all([
      prisma.crmPartner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { account: true },
      }),
      prisma.crmPartner.count({ where }),
    ]);

    return res.json({
      success: true,
      data: partners,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list partners', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to list partners' });
  }
});

// GET /leaderboard — Partners ranked by totalReferrals descending
router.get('/leaderboard', async (_req: Request, res: Response) => {
  try {
    const partners = await prisma.crmPartner.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      orderBy: { totalReferrals: 'desc' },
      take: 50,
      include: { account: true },
    });

    return res.json({ success: true, data: partners });
  } catch (error: unknown) {
    logger.error('Failed to get partner leaderboard', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to get partner leaderboard' });
  }
});

// GET /:id — Partner detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.includes(req.params.id)) {
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }

    const partner = await prisma.crmPartner.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { account: true },
    });

    if (!partner) {
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }

    return res.json({ success: true, data: partner });
  } catch (error: unknown) {
    logger.error('Failed to get partner', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to get partner' });
  }
});

// PUT /:id/tier — Upgrade/downgrade tier
router.put('/:id/tier', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.crmPartner.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }

    const validation = updateTierSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors.map((e) => e.message).join(', '),
      });
    }

    const tierConfig = TIER_CONFIG[validation.data.tier];

    const partner = await prisma.crmPartner.update({
      where: { id: req.params.id },
      data: {
        tier: validation.data.tier,
        commissionRate: tierConfig.commissionRate,
        bountyAmount: tierConfig.bountyAmount,
        commissionDuration: tierConfig.commissionDuration,
      },
    });

    logger.info('Partner tier updated', { partnerId: partner.id, tier: partner.tier });
    return res.json({ success: true, data: partner });
  } catch (error: unknown) {
    logger.error('Failed to update partner tier', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to update partner tier' });
  }
});

// POST /:id/referrals — Log deal referral
router.post('/:id/referrals', async (req: Request, res: Response) => {
  try {
    const partner = await prisma.crmPartner.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!partner) {
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }

    const validation = createReferralSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors.map((e) => e.message).join(', '),
      });
    }

    const deal = await prisma.crmDeal.findFirst({
      where: { id: validation.data.dealId, deletedAt: null },
    });

    if (!deal) {
      return res.status(404).json({ success: false, error: 'Deal not found' });
    }

    const userId = (req as any).user?.id || 'system';

    // Calculate commission amount based on deal value and partner commission rate
    const dealValue = Number(deal.value);
    const commissionAmount = Math.round(dealValue * Number(partner.commissionRate) / 100 * 100) / 100;

    const referral = await prisma.crmReferral.create({
      data: {
        partnerId: req.params.id,
        dealId: validation.data.dealId,
        commissionAmount,
        createdBy: userId,
      },
    });

    // Increment totalReferrals
    await prisma.crmPartner.update({
      where: { id: req.params.id },
      data: { totalReferrals: { increment: 1 } },
    });

    // Create commission record
    await prisma.crmCommission.create({
      data: {
        partnerId: req.params.id,
        referralId: referral.id,
        amount: commissionAmount,
        type: 'COMMISSION',
        createdBy: userId,
      },
    });

    logger.info('Referral logged', { partnerId: req.params.id, dealId: validation.data.dealId, referralId: referral.id });
    return res.status(201).json({ success: true, data: referral });
  } catch (error: unknown) {
    logger.error('Failed to log referral', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to log referral' });
  }
});

// GET /:id/commissions — Commission ledger for partner
router.get('/:id/commissions', async (req: Request, res: Response) => {
  try {
    const partner = await prisma.crmPartner.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!partner) {
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { partnerId: req.params.id, deletedAt: null };

    const [commissions, total] = await Promise.all([
      prisma.crmCommission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { referral: { include: { deal: true } } },
      }),
      prisma.crmCommission.count({ where }),
    ]);

    return res.json({
      success: true,
      data: commissions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list commissions', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to list commissions' });
  }
});

// POST /:id/commissions/pay — Mark pending commissions as paid
router.post('/:id/commissions/pay', async (req: Request, res: Response) => {
  try {
    const partner = await prisma.crmPartner.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!partner) {
      return res.status(404).json({ success: false, error: 'Partner not found' });
    }

    const validation = payCommissionsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors.map((e) => e.message).join(', '),
      });
    }

    const now = new Date();
    let totalPaid = 0;

    for (const commissionId of validation.data.commissionIds) {
      const commission = await prisma.crmCommission.findFirst({
        where: { id: commissionId, partnerId: req.params.id, status: 'PENDING', deletedAt: null },
      });

      if (commission) {
        await prisma.crmCommission.update({
          where: { id: commissionId },
          data: { status: 'PAID', paidAt: now },
        });
        totalPaid += Number(commission.amount);
      }
    }

    // Update partner totalCommissionPaid
    if (totalPaid > 0) {
      await prisma.crmPartner.update({
        where: { id: req.params.id },
        data: { totalCommissionPaid: { increment: totalPaid } },
      });
    }

    logger.info('Commissions paid', { partnerId: req.params.id, totalPaid, count: validation.data.commissionIds.length });
    return res.json({
      success: true,
      data: { paidCount: validation.data.commissionIds.length, totalPaid },
    });
  } catch (error: unknown) {
    logger.error('Failed to pay commissions', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to pay commissions' });
  }
});

export default router;
