// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';
const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('suppliers-spend');

const createSchema = z.object({
  supplierId: z.string().trim().min(1, 'Supplier ID is required'),
  period: z.string().trim().min(1, 'Period is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().trim().length(3).optional(),
  category: z.string().trim().optional(),
  poNumber: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await prisma.suppSpend.count({
    where: { orgId, referenceNumber: { startsWith: `SSP-${y}` } },
  });
  return `SSP-${y}-${String(c + 1).padStart(4, '0')}`;
}
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search)
      where.OR = [
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { poNumber: { contains: search, mode: 'insensitive' } },
      ];
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.suppSpend.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.suppSpend.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: Math.max(1, parseInt(limit, 10) || 20),
        total,
        totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to fetch', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch spends' },
    });
  }
});
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const item = await prisma.suppSpend.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'spend not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch spend' },
    });
  }
});
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const { supplierId, period, amount, currency, category, poNumber, notes } = parsed.data;
    const data = await prisma.suppSpend.create({
      data: {
        referenceNumber,
        supplierId,
        period,
        amount,
        currency,
        category,
        poNumber,
        notes,
        orgId,
        createdBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' },
    });
  }
});
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.suppSpend.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'spend not found' } });
    const { supplierId, period, amount, currency, category, poNumber, notes } = parsed.data;
    const data = await prisma.suppSpend.update({
      where: { id: req.params.id },
      data: { supplierId, period, amount, currency, category, poNumber, notes },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.suppSpend.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'spend not found' } });
    await prisma.suppSpend.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'spend deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});
export default router;
