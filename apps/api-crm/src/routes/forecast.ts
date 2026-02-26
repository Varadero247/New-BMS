// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('api-crm');

// All forecast routes require auth
router.use(authenticate);
router.param('id', validateIdParam());

/**
 * GET /api/forecast
 * Returns weighted pipeline forecast derived from open deals,
 * plus a flat list suitable for the forecast management table.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const deals = await prisma.crmDeal.findMany({
      where: { status: 'OPEN' },
      take: 1000,
      select: {
        id: true,
        title: true,
        value: true,
        probability: true,
        expectedCloseDate: true,
        stage: { select: { name: true } },
        assignedTo: true,
      },
      orderBy: { expectedCloseDate: 'asc' },
    });

    const forecast = deals.map((d) => ({
      id: d.id,
      title: d.title,
      value: Number(d.value),
      probability: d.probability,
      weightedValue: Math.round(Number(d.value) * (d.probability / 100)),
      expectedCloseDate: d.expectedCloseDate,
      stage: d.stage?.name ?? 'Unknown',
      assignedTo: d.assignedTo,
    }));

    res.json({ success: true, data: forecast });
  } catch (err) {
    logger.error('Failed to get forecast', { error: (err as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get forecast' } });
  }
});

/**
 * POST /api/forecast
 * Updates deal probability (used as forecast adjustment).
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { dealId, probability } = req.body as { dealId: string; probability: number };
    if (!dealId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'dealId is required' } });
    }
    const updated = await prisma.crmDeal.update({
      where: { id: dealId },
      data: { probability: Math.min(100, Math.max(0, probability ?? 50)) },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Failed to create forecast entry', { error: (err as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create forecast entry' } });
  }
});

/**
 * PUT /api/forecast/:id
 * Updates a deal's probability for forecast purposes.
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { probability } = req.body as { probability: number };
    const updated = await prisma.crmDeal.update({
      where: { id: req.params.id },
      data: { probability: Math.min(100, Math.max(0, probability ?? 50)) },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Failed to update forecast entry', { error: (err as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update forecast entry' } });
  }
});

/**
 * DELETE /api/forecast/:id — removes deal from pipeline (sets status LOST)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.crmDeal.update({
      where: { id: req.params.id },
      data: { status: 'LOST' },
    });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (err) {
    logger.error('Failed to delete forecast entry', { error: (err as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete forecast entry' } });
  }
});

export default router;
