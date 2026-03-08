// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { calculateACV, recommendTier } from '@ims/config';

const router = Router();

// GET /api/billing/subscriptions — list subscriptions (filtered by org)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { organisationId, status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, unknown> = {};
    if (organisationId) where.organisationId = organisationId;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      (prisma as any).subscription.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      (prisma as any).subscription.count({ where }),
    ]);

    res.json({ success: true, data: items, meta: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// GET /api/billing/subscriptions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const sub = await (prisma as any).subscription.findUnique({ where: { id: req.params.id } });
    if (!sub) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Subscription not found' } });
    res.json({ success: true, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// POST /api/billing/subscriptions — create subscription
router.post('/', async (req: Request, res: Response) => {
  try {
    const { organisationId, tierId, userCount, billingCycle = 'ANNUAL' } = req.body;
    if (!organisationId || !tierId || !userCount) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'organisationId, tierId, and userCount are required' } });
    }

    const recommendedTier = recommendTier(userCount);
    const acv = calculateACV(recommendedTier, userCount);
    const perUserMonthlyRate = acv / 12 / userCount;

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    const sub = await (prisma as any).subscription.create({
      data: {
        organisationId,
        tierId,
        billingCycle,
        status: 'ACTIVE',
        userCount,
        perUserMonthlyRate,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    res.status(201).json({ success: true, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// PATCH /api/billing/subscriptions/:id — update subscription
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { userCount, status, cancelAtPeriodEnd } = req.body;
    const data: Record<string, unknown> = {};
    if (userCount !== undefined) data.userCount = userCount;
    if (status !== undefined) data.status = status;
    if (cancelAtPeriodEnd !== undefined) data.cancelAtPeriodEnd = cancelAtPeriodEnd;

    const sub = await (prisma as any).subscription.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

export default router;
