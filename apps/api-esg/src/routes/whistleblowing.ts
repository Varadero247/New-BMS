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

const logger = createLogger('api-esg');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GRI 2-26 — Mechanisms for Seeking Advice and Raising Concerns (Whistleblowing)

const whistleblowSchema = z.object({
  category: z.enum(['FINANCIAL_MISCONDUCT', 'ENVIRONMENTAL', 'SAFETY', 'DISCRIMINATION', 'HARASSMENT', 'CORRUPTION', 'HUMAN_RIGHTS', 'DATA_PROTECTION', 'OTHER']),
  summary: z.string().trim().min(1),
  details: z.string().trim().optional(),
  reportedDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  channel: z.enum(['HOTLINE', 'EMAIL', 'WEB_FORM', 'IN_PERSON', 'THIRD_PARTY', 'ANONYMOUS']),
  anonymous: z.boolean().optional(),
  reporterName: z.string().trim().optional(),
  reporterEmail: z.string().email().optional(),
  relatedEntityOrPerson: z.string().trim().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assignedTo: z.string().trim().optional(),
});

async function generateRef(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.esgWhistleblow.count();
  return `WB-${year}-${String(count + 1).padStart(4, '0')}`;
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, category } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (category) where.category = category;
    const [reports, total] = await Promise.all([
      prisma.esgWhistleblow.findMany({ where, skip, take: limit, orderBy: { reportedDate: 'desc' } }),
      prisma.esgWhistleblow.count({ where }),
    ]);
    res.json({ success: true, data: reports, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list whistleblowing reports', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list reports' } });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = whistleblowSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const referenceNumber = await generateRef();
    const report = await prisma.esgWhistleblow.create({
      data: {
        id: uuidv4(), referenceNumber, ...parsed.data,
        reportedDate: new Date(parsed.data.reportedDate),
        status: 'RECEIVED',
      },
    });
    logger.info('Whistleblowing report received', { referenceNumber, category: parsed.data.category });
    res.status(201).json({ success: true, data: report });
  } catch (error: unknown) {
    logger.error('Failed to record whistleblowing report', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record report' } });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const [total, thisYear, byStatus, byCategory] = await Promise.all([
      prisma.esgWhistleblow.count({ where: { deletedAt: null } }),
      prisma.esgWhistleblow.count({ where: { deletedAt: null, reportedDate: { gte: yearStart } } }),
      prisma.esgWhistleblow.groupBy({ by: ['status'], where: { deletedAt: null }, _count: { id: true } }),
      prisma.esgWhistleblow.groupBy({ by: ['category'], where: { deletedAt: null }, _count: { id: true } }),
    ]);
    res.json({
      success: true,
      data: {
        total,
        thisYear,
        byStatus: Object.fromEntries(byStatus.map((b) => [b.status, b._count.id])),
        byCategory: Object.fromEntries(byCategory.map((b) => [b.category, b._count.id])),
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get stats' } });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const report = await prisma.esgWhistleblow.findUnique({ where: { id: req.params.id } });
    if (!report || report.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    res.json({ success: true, data: report });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get report' } });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgWhistleblow.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    const updateSchema = whistleblowSchema.partial().extend({
      status: z.enum(['RECEIVED', 'UNDER_INVESTIGATION', 'SUBSTANTIATED', 'UNSUBSTANTIATED', 'CLOSED', 'REFERRED']).optional(),
      investigationNotes: z.string().trim().optional(),
      resolution: z.string().trim().optional(),
      closedAt: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const { reportedDate, closedAt, ...rest } = parsed.data;
    const updated = await prisma.esgWhistleblow.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(reportedDate ? { reportedDate: new Date(reportedDate) } : {}),
        ...(closedAt ? { closedAt: new Date(closedAt) } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update report' } });
  }
});

export default router;
