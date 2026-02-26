// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-medical');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

const baaSchema = z.object({
  businessAssociate: z.string().trim().min(1),
  contactName: z.string().trim().optional(),
  contactEmail: z.string().email().optional(),
  effectiveDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  expiryDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  servicesProvided: z.string().trim().min(1),
  phiAccessed: z.array(z.string()).min(1),
  subcontractors: z.string().trim().optional(),
  documentRef: z.string().trim().optional(),
  createdBy: z.string().trim().min(1),
});

// GET / - list BAAs
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    const [baas, total] = await Promise.all([
      prisma.hipaaBaa.findMany({ where, skip, take: limit, orderBy: { effectiveDate: 'desc' } }),
      prisma.hipaaBaa.count({ where }),
    ]);
    res.json({ success: true, data: baas, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list BAAs', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list BAAs' } });
  }
});

// POST /
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = baaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const baa = await prisma.hipaaBaa.create({
      data: {
        id: uuidv4(), ...parsed.data,
        effectiveDate: new Date(parsed.data.effectiveDate),
        expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : undefined,
        status: 'ACTIVE',
      },
    });
    res.status(201).json({ success: true, data: baa });
  } catch (error: unknown) {
    logger.error('Failed to create BAA', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create BAA' } });
  }
});

// GET /expiring - BAAs expiring within 90 days
router.get('/expiring', async (_req: Request, res: Response) => {
  try {
    const in90Days = new Date();
    in90Days.setDate(in90Days.getDate() + 90);
    const baas = await prisma.hipaaBaa.findMany({
      where: { deletedAt: null, status: 'ACTIVE', expiryDate: { lte: in90Days, gte: new Date() } },
      orderBy: { expiryDate: 'asc' },
    });
    res.json({ success: true, data: baas });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get expiring BAAs' } });
  }
});

// GET /stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [total, active, expired, pending] = await Promise.all([
      prisma.hipaaBaa.count({ where: { deletedAt: null } }),
      prisma.hipaaBaa.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.hipaaBaa.count({ where: { status: 'EXPIRED', deletedAt: null } }),
      prisma.hipaaBaa.count({ where: { status: 'PENDING_SIGNATURE', deletedAt: null } }),
    ]);
    res.json({ success: true, data: { total, active, expired, pendingSignature: pending } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get stats' } });
  }
});

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const baa = await prisma.hipaaBaa.findUnique({ where: { id: req.params.id } });
    if (!baa || baa.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'BAA not found' } });
    }
    res.json({ success: true, data: baa });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get BAA' } });
  }
});

// PUT /:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hipaaBaa.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'BAA not found' } });
    }
    const updateSchema = baaSchema.partial().extend({
      status: z.enum(['DRAFT', 'PENDING_SIGNATURE', 'ACTIVE', 'UNDER_REVIEW', 'EXPIRED', 'TERMINATED']).optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const updated = await prisma.hipaaBaa.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        effectiveDate: parsed.data.effectiveDate ? new Date(parsed.data.effectiveDate) : undefined,
        expiryDate: parsed.data.expiryDate ? new Date(parsed.data.expiryDate) : undefined,
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update BAA' } });
  }
});

// DELETE /:id - soft delete (terminate)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hipaaBaa.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'BAA not found' } });
    }
    await prisma.hipaaBaa.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), status: 'TERMINATED', terminatedAt: new Date(), terminationReason: req.body.terminationReason || 'Administrative termination' },
    });
    res.json({ success: true, data: { message: 'BAA terminated successfully' } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to terminate BAA' } });
  }
});

// PUT /:id/renew
router.put('/:id/renew', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hipaaBaa.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'BAA not found' } });
    }
    const schema = z.object({ expiryDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date') });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'New expiry date required' } });
    }
    const updated = await prisma.hipaaBaa.update({
      where: { id: req.params.id },
      data: { expiryDate: new Date(parsed.data.expiryDate), status: 'ACTIVE', lastReviewDate: new Date() },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to renew BAA' } });
  }
});

export default router;
