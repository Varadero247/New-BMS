// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, formatRefNumber} from '@ims/shared';

const logger = createLogger('api-quality');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());


const createSchema = z.object({
  employeeName: z.string().trim().min(1).max(200),
  employeeId: z.string().trim().max(100).optional().nullable(),
  role: z.string().trim().max(200).optional().nullable(),
  department: z.string().trim().max(200).optional().nullable(),
  competencyArea: z.string().trim().min(1).max(300),
  requiredLevel: z.string().trim().max(100).optional().nullable(),
  currentLevel: z.string().trim().max(100).optional().nullable(),
  status: z.enum(['COMPETENT', 'IN_TRAINING', 'NOT_COMPETENT', 'EXPIRED']).optional(),
  trainingCompleted: z.string().trim().max(5000).optional().nullable(),
  certifications: z.string().trim().max(2000).optional().nullable(),
  assessmentDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  nextReviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  assessor: z.string().trim().max(200).optional().nullable(),
  evidence: z.string().trim().max(5000).optional().nullable(),
  gapAnalysis: z.string().trim().max(5000).optional().nullable(),
  actionPlan: z.string().trim().max(5000).optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
});

const updateSchema = createSchema.partial();

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// GET /
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, department, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status && typeof status === 'string') where.status = status;
    if (department && typeof department === 'string') where.department = department;
    if (search && typeof search === 'string') {
      where.OR = [
        { employeeName: { contains: search, mode: 'insensitive' } },
        { competencyArea: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.qualCompetence.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.qualCompetence.count({ where }),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list competences', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list competences' },
    });
  }
});

// POST /
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
    }

    const authReq = req as AuthRequest;
    const _refPrefix = 'QMS-CMP';
    const _refYear = new Date().getFullYear();
    const _refCount = await prisma.qualCompetence.count({ where: { referenceNumber: { startsWith: `${_refPrefix}-${_refYear}` } } });
    const referenceNumber = formatRefNumber(_refPrefix, _refCount);

    const item = await prisma.qualCompetence.create({
      data: {
        referenceNumber,
        ...parsed.data,
        status: parsed.data.status || 'IN_TRAINING',
        assessmentDate: parsed.data.assessmentDate ? new Date(parsed.data.assessmentDate) : null,
        nextReviewDate: parsed.data.nextReviewDate ? new Date(parsed.data.nextReviewDate) : null,
        organisationId: (authReq.user as { organisationId?: string })?.organisationId || 'default',
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to create competence', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create competence' },
    });
  }
});

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.qualCompetence.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!item)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Competence record not found' },
      });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to get competence', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get competence' },
    });
  }
});

// PUT /:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await prisma.qualCompetence.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Competence record not found' },
      });

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.assessmentDate) data.assessmentDate = new Date(parsed.data.assessmentDate);
    if (parsed.data.nextReviewDate) data.nextReviewDate = new Date(parsed.data.nextReviewDate);

    const item = await prisma.qualCompetence.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to update competence', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update competence' },
    });
  }
});

// DELETE /:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.qualCompetence.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Competence record not found' },
      });

    await prisma.qualCompetence.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete competence', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete competence' },
    });
  }
});

export default router;
