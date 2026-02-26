// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-automotive');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

async function generateDevNumber(): Promise<string> {
  const yy = String(new Date().getFullYear()).slice(-2);
  const mm = String(new Date().getMonth() + 1).padStart(2, '0');
  const prefix = `SD-${yy}${mm}`;
  const count = await prisma.supplierDevelopment.count({ where: { devNumber: { startsWith: prefix } } });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// GET /api/supplier-dev
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, tier, search } = req.query;
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status as string;
    if (tier) where.tier = tier as string;

    const items = await prisma.supplierDevelopment.findMany({
      where,
      take: 500,
      orderBy: { createdAt: 'desc' },
    });

    const data = search
      ? items.filter((i) => i.supplierName.toLowerCase().includes((search as string).toLowerCase()))
      : items;

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching supplier developments', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch supplier developments' } });
  }
});

// GET /api/supplier-dev/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.supplierDevelopment.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } });
    res.json({ success: true, data: item });
  } catch (error) {
    logger.error('Error fetching supplier dev', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch item' } });
  }
});

// POST /api/supplier-dev
router.post('/', async (req: Request, res: Response) => {
  try {
    const { supplierName, supplierCode, program, status, tier, score, sqa, targetDate, issues } = req.body;
    const user = (req as AuthRequest).user;

    const item = await prisma.supplierDevelopment.create({
      data: {
        devNumber: await generateDevNumber(),
        supplierName: supplierName || 'Unknown Supplier',
        supplierCode: supplierCode || null,
        program: program || null,
        status: status || 'UNDER_DEVELOPMENT',
        tier: tier || 'TIER_1',
        score: typeof score === 'number' ? score : parseInt(score as string) || 70,
        sqa: sqa || null,
        targetDate: targetDate ? new Date(targetDate) : null,
        issues: issues || null,
        createdBy: user?.email || user?.id,
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    logger.error('Error creating supplier dev', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create item' } });
  }
});

// PUT /api/supplier-dev/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { supplierName, supplierCode, program, status, tier, score, sqa, targetDate, issues } = req.body;

    const item = await prisma.supplierDevelopment.update({
      where: { id: req.params.id },
      data: {
        ...(supplierName && { supplierName }),
        ...(supplierCode !== undefined && { supplierCode }),
        ...(program !== undefined && { program }),
        ...(status && { status }),
        ...(tier && { tier }),
        ...(score !== undefined && { score: typeof score === 'number' ? score : parseInt(score as string) }),
        ...(sqa !== undefined && { sqa }),
        ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
        ...(issues !== undefined && { issues }),
      },
    });

    res.json({ success: true, data: item });
  } catch (error) {
    logger.error('Error updating supplier dev', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update item' } });
  }
});

// DELETE /api/supplier-dev/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.supplierDevelopment.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    logger.error('Error deleting supplier dev', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete item' } });
  }
});

export default router;
