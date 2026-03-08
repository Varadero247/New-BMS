// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { PRICING, calculateACV, recommendTier } from '@ims/config';
import { randomUUID } from 'crypto';

const router = Router();

// POST /api/billing/stack-calculator/sessions — save a stack calculator session
router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const { tools, userCount } = req.body;
    if (!tools || !userCount) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'tools and userCount are required' } });
    }

    // Calculate total tool spend
    const totalMonthly = Array.isArray(tools)
      ? tools.reduce((sum: number, t: { monthlyPrice?: number }) => sum + (t.monthlyPrice || 0), 0)
      : 0;
    const totalAnnual = totalMonthly * 12;

    // Calculate Nexara saving
    const tier = recommendTier(userCount);
    const nexaraACV = calculateACV(tier, userCount);
    const nexaraSaving = Math.max(0, totalAnnual - nexaraACV);

    const session = await (prisma as any).stackCalculatorSession.create({
      data: {
        sessionToken: randomUUID(),
        tools,
        totalMonthly,
        totalAnnual,
        nexaraSaving,
        userCount,
        selectedTier: tier,
      },
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

// GET /api/billing/stack-calculator/sessions/:token
router.get('/sessions/:token', async (req: Request, res: Response) => {
  try {
    const session = await (prisma as any).stackCalculatorSession.findUnique({
      where: { sessionToken: req.params.token },
    });
    if (!session) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } });

    // Enrich with current pricing
    const competitorBenchmarks = PRICING.competitorBenchmarks;
    res.json({ success: true, data: { ...session, competitorBenchmarks } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: (error as Error).message } });
  }
});

export default router;
