// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { PartnerRequest } from '../middleware/partner-auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { portalPrisma } from '../prisma-portal';
import { prisma } from '../prisma';

const logger = createLogger('api-partners:referrals');
const router = Router();

const trackReferralSchema = z.object({
  prospectEmail: z.string().trim().email(),
  prospectName: z.string().trim().optional(),
});

// GET /api/referrals — list partner's referrals
router.get('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id as string | undefined;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const referrals = await portalPrisma.mktPartnerReferral.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    res.json({ success: true, data: referrals });
  } catch (error) {
    logger.error('Failed to fetch referrals', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch referrals' },
    });
  }
});

// POST /api/referrals/track — track a new referral
router.post('/track', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id as string | undefined;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const parsed = trackReferralSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    // Get partner's referral code
    const partner = await prisma.mktPartner.findUnique({
      where: { id: partnerId },
      select: { referralCode: true },
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Partner not found' },
      });
    }

    const referral = await portalPrisma.mktPartnerReferral.create({
      data: {
        partnerId: partnerId as string,
        referralCode: partner.referralCode,
        prospectEmail: parsed.data.prospectEmail,
        prospectName: parsed.data.prospectName,
      },
    });

    res.status(201).json({ success: true, data: referral });
  } catch (error) {
    logger.error('Failed to track referral', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to track referral' },
    });
  }
});

// GET /api/referrals/stats — referral statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id as string | undefined;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const referrals = await portalPrisma.mktPartnerReferral.findMany({
      where: { partnerId },
      take: 1000,
    });

    const total = referrals.length;
    const clicked = referrals.filter((r) => r.clickedAt).length;
    const signedUp = referrals.filter((r) => r.signedUpAt).length;
    const converted = referrals.filter((r) => r.convertedAt).length;
    const conversionRate = total > 0 ? converted / total : 0;

    res.json({
      success: true,
      data: { total, clicked, signedUp, converted, conversionRate },
    });
  } catch (error) {
    logger.error('Failed to get referral stats', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get referral stats' },
    });
  }
});

export default router;
