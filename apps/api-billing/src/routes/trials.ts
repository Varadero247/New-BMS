// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { PRICING } from '@ims/config';

const router = Router();

// POST /api/billing/trials/start — start a trial session
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { organisationId, email, stripeCustomerId } = req.body;
    if (!organisationId || !email) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'organisationId and email are required' } });
    }

    const durationDays = PRICING.trial.durationDays;
    const startedAt = new Date();
    const expiresAt = new Date(startedAt);
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const trial = await (prisma as any).trialSession.create({
      data: {
        organisationId,
        email,
        stripeCustomerId: stripeCustomerId || null,
        startedAt,
        expiresAt,
        maxUsers: PRICING.trial.maxUsers,
        appliedDiscountPct: PRICING.trial.conversionDiscountPct,
        status: 'ACTIVE',
      },
    });

    res.status(201).json({ success: true, data: trial });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// GET /api/billing/trials/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const trial = await (prisma as any).trialSession.findUnique({ where: { id: req.params.id } });
    if (!trial) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Trial not found' } });
    res.json({ success: true, data: trial });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// PATCH /api/billing/trials/:id/cancel
router.patch('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const trial = await (prisma as any).trialSession.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
    res.json({ success: true, data: trial });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// PATCH /api/billing/trials/:id/convert — convert trial to paid subscription
router.patch('/:id/convert', async (req: Request, res: Response) => {
  try {
    const { subscriptionId } = req.body;
    const trial = await (prisma as any).trialSession.update({
      where: { id: req.params.id },
      data: {
        status: 'CONVERTED',
        convertedAt: new Date(),
        subscriptionId: subscriptionId || null,
      },
    });
    res.json({ success: true, data: trial });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

export default router;
