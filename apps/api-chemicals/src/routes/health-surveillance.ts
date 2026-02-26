// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
const uuidv4 = () => crypto.randomUUID();
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-chemicals');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// COSHH 2002 Regulation 11 — Health Surveillance

const surveillanceSchema = z.object({
  employeeId: z.string().trim().min(1),
  employeeName: z.string().trim().min(1),
  jobRole: z.string().trim().min(1),
  department: z.string().trim().optional(),
  substancesExposed: z.array(z.string()).min(1),
  surveillanceType: z.enum(['LUNG_FUNCTION', 'SKIN_CHECK', 'BLOOD_TEST', 'URINE_TEST', 'AUDIOMETRY', 'VISION_TEST', 'GENERAL_HEALTH', 'BIOLOGICAL_MONITORING', 'OTHER']),
  examinationDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  conductedBy: z.string().trim().min(1),
  clinicRef: z.string().trim().optional(),
  result: z.enum(['NORMAL', 'BORDERLINE', 'ABNORMAL', 'REQUIRES_FOLLOW_UP', 'UNFIT_FOR_ROLE']),
  clinicalFindings: z.string().trim().optional(),
  restrictionsApplied: z.string().trim().optional(),
  nextSurveillanceDue: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  consentObtained: z.boolean().optional(),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { result, surveillanceType } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (result) where.result = result;
    if (surveillanceType) where.surveillanceType = surveillanceType;
    const [records, total] = await Promise.all([
      prisma.chemHealthSurveillance.findMany({ where, skip, take: limit, orderBy: { examinationDate: 'desc' } }),
      prisma.chemHealthSurveillance.count({ where }),
    ]);
    res.json({ success: true, data: records, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list health surveillance records', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list health surveillance records' } });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = surveillanceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const record = await prisma.chemHealthSurveillance.create({
      data: {
        id: uuidv4(), ...parsed.data,
        examinationDate: new Date(parsed.data.examinationDate),
        nextSurveillanceDue: parsed.data.nextSurveillanceDue ? new Date(parsed.data.nextSurveillanceDue) : undefined,
      },
    });
    logger.info('Health surveillance record created', { employeeName: parsed.data.employeeName, result: parsed.data.result });
    if (parsed.data.result === 'UNFIT_FOR_ROLE' || parsed.data.result === 'ABNORMAL') {
      logger.warn('Health surveillance flagged — action required', { employeeId: parsed.data.employeeId, result: parsed.data.result });
    }
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Failed to create health surveillance record', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create health surveillance record' } });
  }
});

router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    const in30Days = new Date(); in30Days.setDate(in30Days.getDate() + 30);
    const [total, abnormal, unfit, overdue, dueSoon] = await Promise.all([
      prisma.chemHealthSurveillance.count({ where: { deletedAt: null } }),
      prisma.chemHealthSurveillance.count({ where: { deletedAt: null, result: 'ABNORMAL' } }),
      prisma.chemHealthSurveillance.count({ where: { deletedAt: null, result: 'UNFIT_FOR_ROLE' } }),
      prisma.chemHealthSurveillance.count({ where: { deletedAt: null, nextSurveillanceDue: { lt: today } } }),
      prisma.chemHealthSurveillance.count({ where: { deletedAt: null, nextSurveillanceDue: { gte: today, lte: in30Days } } }),
    ]);
    res.json({ success: true, data: { total, abnormal, unfit, overdueForReview: overdue, dueSoon } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get dashboard' } });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await prisma.chemHealthSurveillance.findUnique({ where: { id: req.params.id } });
    if (!record || record.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
    res.json({ success: true, data: record });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get record' } });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.chemHealthSurveillance.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
    const updateSchema = surveillanceSchema.partial();
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const { examinationDate, nextSurveillanceDue, ...rest } = parsed.data;
    const updated = await prisma.chemHealthSurveillance.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(examinationDate ? { examinationDate: new Date(examinationDate) } : {}),
        ...(nextSurveillanceDue ? { nextSurveillanceDue: new Date(nextSurveillanceDue) } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update record' } });
  }
});

export default router;
