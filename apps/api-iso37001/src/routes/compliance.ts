import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-iso37001');
const router: Router = Router();
router.use(authenticate);

function generateReference(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `AB-CMP-${yy}${mm}-${rand}`;
}

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const CATEGORIES = ['POLICY', 'PROCEDURE', 'CONTROL', 'TRAINING', 'DUE_DILIGENCE', 'REPORTING', 'MONITORING', 'MANAGEMENT_REVIEW', 'OTHER'] as const;
const STATUSES = ['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT', 'NOT_APPLICABLE', 'UNDER_REVIEW'] as const;

const createSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional().nullable(),
  isoClause: z.string().max(200).optional().nullable(),
  category: z.enum(CATEGORIES).default('OTHER'),
  owner: z.string().max(200).optional().nullable(),
  department: z.string().max(200).optional().nullable(),
  assessmentDate: z.string().optional().nullable(),
  nextReviewDate: z.string().optional().nullable(),
  evidence: z.string().max(5000).optional().nullable(),
  gaps: z.string().max(5000).optional().nullable(),
  remediation: z.string().max(5000).optional().nullable(),
  remediationDue: z.string().optional().nullable(),
  remediationBy: z.string().max(200).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(STATUSES).optional(),
  closedDate: z.string().optional().nullable(),
  closedBy: z.string().max(200).optional().nullable(),
  closureNotes: z.string().max(5000).optional().nullable(),
});

// GET /stats — Compliance statistics (must be before /:id)
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [total, compliant, nonCompliant, partial, byCategory] = await Promise.all([
      prisma.abCompliance.count({ where: { deletedAt: null } as any }),
      prisma.abCompliance.count({ where: { deletedAt: null, status: 'COMPLIANT' } as any }),
      prisma.abCompliance.count({ where: { deletedAt: null, status: 'NON_COMPLIANT' } as any }),
      prisma.abCompliance.count({ where: { deletedAt: null, status: 'PARTIALLY_COMPLIANT' } as any }),
      prisma.abCompliance.groupBy({ by: ['category'], where: { deletedAt: null } as any, _count: { id: true } }),
    ]);

    const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        total, compliant, nonCompliant, partial, complianceRate,
        byCategory: byCategory.map((c: Record<string, unknown>) => ({ category: c.category, count: (c as any)._count.id })),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get compliance stats', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get compliance stats' } });
  }
});

// GET / — List compliance records
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, category, isoClause, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status && typeof status === 'string') where.status = status;
    if (category && typeof category === 'string') where.category = category;
    if (isoClause && typeof isoClause === 'string') where.isoClause = { contains: isoClause, mode: 'insensitive' };
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { owner: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.abCompliance.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.abCompliance.count({ where }),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list compliance records', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list compliance records' } });
  }
});

// POST / — Create compliance record
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const userId = (req as AuthRequest).user?.id || 'system';
    const organisationId = ((req as AuthRequest).user as any)?.organisationId || 'default';
    const referenceNumber = generateReference();

    const record = await prisma.abCompliance.create({
      data: {
        ...parsed.data,
        referenceNumber,
        assessmentDate: parsed.data.assessmentDate ? new Date(parsed.data.assessmentDate) : null,
        nextReviewDate: parsed.data.nextReviewDate ? new Date(parsed.data.nextReviewDate) : null,
        remediationDue: parsed.data.remediationDue ? new Date(parsed.data.remediationDue) : null,
        status: 'UNDER_REVIEW',
        organisationId,
        createdBy: userId,
      },
    });

    logger.info('Compliance record created', { id: record.id, referenceNumber });
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Failed to create compliance record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create compliance record' } });
  }
});

// GET /:id — Get by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await prisma.abCompliance.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!record) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Compliance record not found' } });
    res.json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Failed to get compliance record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get compliance record' } });
  }
});

// PUT /:id — Update
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.abCompliance.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Compliance record not found' } });

    const userId = (req as AuthRequest).user?.id || 'system';
    const data: Record<string, unknown> = { ...parsed.data, updatedBy: userId };

    if (parsed.data.assessmentDate) data.assessmentDate = new Date(parsed.data.assessmentDate);
    if (parsed.data.nextReviewDate) data.nextReviewDate = new Date(parsed.data.nextReviewDate);
    if (parsed.data.remediationDue) data.remediationDue = new Date(parsed.data.remediationDue);
    if ((parsed.data as any).closedDate) data.closedDate = new Date((parsed.data as any).closedDate);

    const record = await prisma.abCompliance.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Failed to update compliance record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update compliance record' } });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.abCompliance.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Compliance record not found' } });

    await prisma.abCompliance.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete compliance record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete compliance record' } });
  }
});

export default router;
