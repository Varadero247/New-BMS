// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { PartnerRequest } from '../middleware/partner-auth';

const logger = createLogger('api-partners:directory');
const router = Router();

// GET /api/directory - List partners in directory
router.get('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id;
    if (!partnerId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });

    const { tier, search } = req.query;
    const where: Record<string, unknown> = { status: 'ACTIVE' };
    if (tier) where.tier = tier;
    if (search) where.name = { contains: search as string, mode: 'insensitive' };

    const partners = await prisma.mktPartner.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({ success: true, data: partners });
  } catch (error) {
    logger.error('Error fetching directory', { error: String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch directory' } });
  }
});

// GET /api/directory/:id - Get partner profile
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id;
    if (!partnerId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });

    const partner = await prisma.mktPartner.findUnique({ where: { id: req.params.id } });
    if (!partner) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Partner not found' } });

    res.json({ success: true, data: partner });
  } catch (error) {
    logger.error('Error fetching partner', { error: String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch partner' } });
  }
});

export default router;
