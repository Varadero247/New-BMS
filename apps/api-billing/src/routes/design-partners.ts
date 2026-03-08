// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { PRICING } from '@ims/config';

const router = Router();

// GET /api/billing/design-partners/:orgId
router.get('/:orgId', async (req: Request, res: Response) => {
  try {
    const record = await (prisma as any).designPartnerStatus.findUnique({
      where: { organisationId: req.params.orgId },
    });
    if (!record) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Design partner record not found' } });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// POST /api/billing/design-partners — register a new design partner
router.post('/', async (req: Request, res: Response) => {
  try {
    const { organisationId, lockedPriceMonthly, subscriptionId } = req.body;
    if (!organisationId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'organisationId is required' } });
    }

    const lockInMonths = PRICING.designPartner.lockInMonths;
    const noticeAtMonth = PRICING.designPartner.noticeAtMonth;

    const now = new Date();
    const lockedUntil = new Date(now);
    lockedUntil.setMonth(lockedUntil.getMonth() + lockInMonths);

    const notifyAtDate = new Date(now);
    notifyAtDate.setMonth(notifyAtDate.getMonth() + noticeAtMonth);

    const record = await (prisma as any).designPartnerStatus.create({
      data: {
        organisationId,
        subscriptionId: subscriptionId || null,
        isDesignPartner: true,
        lockedPriceMonthly: lockedPriceMonthly || null,
        lockedUntil,
        notifyAtDate,
      },
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// PATCH /api/billing/design-partners/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { renewalRateMonthly, noticeSentAt } = req.body;
    const data: Record<string, unknown> = {};
    if (renewalRateMonthly !== undefined) data.renewalRateMonthly = renewalRateMonthly;
    if (noticeSentAt !== undefined) data.noticeSentAt = new Date(noticeSentAt);

    const record = await (prisma as any).designPartnerStatus.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

export default router;
