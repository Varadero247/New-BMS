// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { z } from 'zod';
import { prisma } from '../prisma';
const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('contracts-contracts');

const createSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().optional(),
  type: z
    .enum(['SUPPLIER', 'CUSTOMER', 'SERVICE', 'NDA', 'LEASE', 'EMPLOYMENT', 'PARTNERSHIP', 'OTHER'])
    .optional(),
  status: z
    .enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED'])
    .optional(),
  counterparty: z.string().trim().optional(),
  counterpartyContact: z.string().trim().optional(),
  value: z.number().optional(),
  currency: z.string().trim().length(3).optional(),
  startDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  endDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  renewalDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  autoRenew: z.boolean().optional(),
  noticePeriodDays: z.number().int().optional(),
  paymentTerms: z.string().trim().optional(),
  fileUrl: z.string().trim().url('Invalid URL').optional(),
  owner: z.string().trim().optional(),
  ownerName: z.string().trim().optional(),
  department: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  notes: z.string().trim().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await prisma.contContract.count({
    where: { orgId, referenceNumber: { startsWith: `CON-${y}` } },
  });
  return `CON-${y}-${String(c + 1).padStart(4, '0')}`;
}
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.contContract.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contContract.count({ where }),
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
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch contracts' },
    });
  }
});
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const item = await prisma.contContract.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'contract not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch contract' },
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
    const {
      title,
      description,
      type,
      status,
      counterparty,
      counterpartyContact,
      value,
      currency,
      startDate,
      endDate,
      renewalDate,
      autoRenew,
      noticePeriodDays,
      paymentTerms,
      fileUrl,
      owner,
      ownerName,
      department,
      tags,
      notes,
    } = parsed.data;
    const data = await prisma.contContract.create({
      data: {
        title,
        description,
        type,
        status,
        counterparty,
        counterpartyContact,
        value,
        currency,
        startDate,
        endDate,
        renewalDate,
        autoRenew,
        noticePeriodDays,
        paymentTerms,
        fileUrl,
        owner,
        ownerName,
        department,
        tags,
        notes,
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
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
    const existing = await prisma.contContract.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'contract not found' } });
    const {
      title,
      description,
      type,
      status,
      counterparty,
      counterpartyContact,
      value,
      currency,
      startDate,
      endDate,
      renewalDate,
      autoRenew,
      noticePeriodDays,
      paymentTerms,
      fileUrl,
      owner,
      ownerName,
      department,
      tags,
      notes,
    } = parsed.data;
    const data = await prisma.contContract.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        type,
        status,
        counterparty,
        counterpartyContact,
        value,
        currency,
        startDate,
        endDate,
        renewalDate,
        autoRenew,
        noticePeriodDays,
        paymentTerms,
        fileUrl,
        owner,
        ownerName,
        department,
        tags,
        notes,
        updatedBy: (req as AuthRequest).user?.id,
      },
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
    const existing = await prisma.contContract.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'contract not found' } });
    await prisma.contContract.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'contract deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});
export default router;
