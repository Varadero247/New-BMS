// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-field-service');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------
function generateInvoiceNumber(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `FSI-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const invoiceCreateSchema = z.object({
  jobId: z.string().trim().uuid(),
  customerId: z.string().trim().uuid(),
  lineItems: z.array(z.any()),
  laborTotal: z.number().min(0),
  partsTotal: z.number().min(0),
  total: z.number().min(0),
  tax: z.number().min(0).optional().nullable(),
  dueDate: z
    .string()
    .trim()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  currency: z.string().trim().length(3).optional(),
});

const invoiceUpdateSchema = z.object({
  lineItems: z.array(z.any()).optional(),
  laborTotal: z.number().min(0).optional(),
  partsTotal: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
  tax: z.number().min(0).optional().nullable(),
  dueDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  status: z.enum(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
  currency: z.string().trim().length(3).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List invoices
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { jobId, customerId, status } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (jobId) where.jobId = String(jobId);
    if (customerId) where.customerId = String(customerId);
    if (status) where.status = String(status);

    const [data, total] = await Promise.all([
      prisma.fsSvcInvoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { job: true, customer: true },
      }),
      prisma.fsSvcInvoice.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list invoices', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list invoices' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create invoice from job
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = invoiceCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const authReq = req as AuthRequest;
    const data = await prisma.fsSvcInvoice.create({
      data: {
        ...parsed.data,
        number: generateInvoiceNumber(),
        lineItems: parsed.data.lineItems as Prisma.InputJsonValue,
        laborTotal: new Prisma.Decimal(parsed.data.laborTotal),
        partsTotal: new Prisma.Decimal(parsed.data.partsTotal),
        total: new Prisma.Decimal(parsed.data.total),
        tax: parsed.data.tax != null ? new Prisma.Decimal(parsed.data.tax) : null,
        dueDate: new Date(parsed.data.dueDate),
        createdBy: authReq.user!.id,
      },
    });

    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create invoice', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create invoice' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get invoice
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await prisma.fsSvcInvoice.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { job: true, customer: true },
    });

    if (!data) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get invoice', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get invoice' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update invoice
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcInvoice.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    const parsed = invoiceUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.lineItems) updateData.lineItems = parsed.data.lineItems as Prisma.InputJsonValue;
    if (parsed.data.laborTotal !== undefined)
      updateData.laborTotal = new Prisma.Decimal(parsed.data.laborTotal);
    if (parsed.data.partsTotal !== undefined)
      updateData.partsTotal = new Prisma.Decimal(parsed.data.partsTotal);
    if (parsed.data.total !== undefined) updateData.total = new Prisma.Decimal(parsed.data.total);
    if (parsed.data.tax !== undefined)
      updateData.tax = parsed.data.tax !== null ? new Prisma.Decimal(parsed.data.tax) : null;
    if (parsed.data.dueDate) updateData.dueDate = new Date(parsed.data.dueDate);

    const data = await prisma.fsSvcInvoice.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update invoice', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update invoice' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete invoice
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcInvoice.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    await prisma.fsSvcInvoice.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'Invoice deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete invoice', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete invoice' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/send — Send invoice
// ---------------------------------------------------------------------------
router.put('/:id/send', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcInvoice.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    if (existing.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Only draft invoices can be sent' },
      });
    }

    const data = await prisma.fsSvcInvoice.update({
      where: { id: req.params.id },
      data: { status: 'SENT' },
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to send invoice', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to send invoice' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/pay — Mark invoice as paid
// ---------------------------------------------------------------------------
router.put('/:id/pay', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcInvoice.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } });
    }

    if (existing.status === 'PAID') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invoice is already paid' },
      });
    }

    const data = await prisma.fsSvcInvoice.update({
      where: { id: req.params.id },
      data: { status: 'PAID', paidDate: new Date() },
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to mark invoice as paid', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to mark invoice as paid' },
    });
  }
});

export default router;
