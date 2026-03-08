// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { PRICING } from '@ims/config';

const router = Router();

// GET /api/billing/pricing-tiers — return all tiers from canonical config
router.get('/', (_req: Request, res: Response) => {
  const tiers = Object.entries(PRICING.tiers).map(([key, tier]) => ({
    key,
    ...tier,
  }));
  res.json({ success: true, data: tiers });
});

// GET /api/billing/pricing-tiers/:id — return single tier by id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const entry = Object.entries(PRICING.tiers).find(([, tier]) => tier.id === id);
  if (!entry) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Tier '${id}' not found` } });
  }
  const [key, tier] = entry;
  res.json({ success: true, data: { key, ...tier } });
});

// GET /api/billing/pricing-tiers/volume-bands — return volume discount bands
router.get('/volume-bands', (_req: Request, res: Response) => {
  res.json({ success: true, data: PRICING.volumeDiscounts });
});

export default router;
