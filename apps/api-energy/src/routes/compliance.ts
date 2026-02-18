import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-energy');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const complianceCreateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(2000).optional().nullable(),
  regulation: z.string().trim().min(1).max(200),
  jurisdiction: z.string().trim().max(200).optional().nullable(),
  requirement: z.string().trim().min(1).max(2000),
  evidenceRequired: z.string().trim().max(2000).optional().nullable(),
  dueDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(
      z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
    )
    .optional()
    .nullable(),
});

const complianceUpdateSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  regulation: z.string().trim().min(1).max(200).optional(),
  jurisdiction: z.string().trim().max(200).optional().nullable(),
  requirement: z.string().trim().min(1).max(2000).optional(),
  evidenceRequired: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT', 'NOT_ASSESSED']).optional(),
  dueDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(
      z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
    )
    .optional()
    .nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET /dashboard — Compliance dashboard
// ---------------------------------------------------------------------------

router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const obligations = await prisma.energyComplianceObligation.findMany({
      where: { deletedAt: null } as any,
      take: 1000,
    });

    const total = obligations.length;
    const compliant = obligations.filter((o) => o.status === 'COMPLIANT').length;
    const nonCompliant = obligations.filter((o) => o.status === 'NON_COMPLIANT').length;
    const partiallyCompliant = obligations.filter((o) => o.status === 'PARTIALLY_COMPLIANT').length;
    const notAssessed = obligations.filter((o) => o.status === 'NOT_ASSESSED').length;

    const now = new Date();
    const overdue = obligations.filter(
      (o) => o.dueDate && new Date(o.dueDate) < now && o.status !== 'COMPLIANT'
    ).length;
    const upcomingDue = obligations.filter((o) => {
      if (!o.dueDate || o.status === 'COMPLIANT') return false;
      const due = new Date(o.dueDate);
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      return due >= now && due <= thirtyDaysFromNow;
    }).length;

    const complianceRate = total > 0 ? (compliant / total) * 100 : 0;

    // Group by regulation
    const byRegulation: Record<string, { total: number; compliant: number }> = {};
    for (const o of obligations) {
      if (!byRegulation[o.regulation]) {
        byRegulation[o.regulation] = { total: 0, compliant: 0 };
      }
      byRegulation[o.regulation].total++;
      if (o.status === 'COMPLIANT') byRegulation[o.regulation].compliant++;
    }

    res.json({
      success: true,
      data: {
        total,
        compliant,
        nonCompliant,
        partiallyCompliant,
        notAssessed,
        overdue,
        upcomingDue,
        complianceRate: Math.round(complianceRate * 100) / 100,
        byRegulation: Object.entries(byRegulation).map(([regulation, data]) => ({
          regulation,
          ...data,
          rate: data.total > 0 ? Math.round((data.compliant / data.total) * 10000) / 100 : 0,
        })),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get compliance dashboard', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get compliance dashboard' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET / — List compliance obligations
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, regulation } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (regulation && typeof regulation === 'string') {
      where.regulation = { contains: regulation, mode: 'insensitive' };
    }

    const [obligations, total] = await Promise.all([
      prisma.energyComplianceObligation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.energyComplianceObligation.count({ where }),
    ]);

    res.json({
      success: true,
      data: obligations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list compliance obligations', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list compliance obligations' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create compliance obligation
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = complianceCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
        details: parsed.error.flatten(),
      });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const obligation = await prisma.energyComplianceObligation.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        regulation: data.regulation,
        jurisdiction: data.jurisdiction ?? null,
        requirement: data.requirement,
        evidenceRequired: data.evidenceRequired ?? null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: 'NOT_ASSESSED',
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Compliance obligation created', { obligationId: obligation.id });
    res.status(201).json({ success: true, data: obligation });
  } catch (error: unknown) {
    logger.error('Failed to create compliance obligation', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create compliance obligation' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get compliance obligation
// ---------------------------------------------------------------------------

const RESERVED_PATHS = new Set(['dashboard']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const obligation = await prisma.energyComplianceObligation.findFirst({
      where: { id, deletedAt: null } as any,
    });

    if (!obligation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Compliance obligation not found' },
      });
    }

    res.json({ success: true, data: obligation });
  } catch (error: unknown) {
    logger.error('Failed to get compliance obligation', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get compliance obligation' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update compliance obligation
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = complianceUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
        details: parsed.error.flatten(),
      });
    }

    const existing = await prisma.energyComplianceObligation.findFirst({
      where: { id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Compliance obligation not found' },
      });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate as string);
    }

    const obligation = await prisma.energyComplianceObligation.update({
      where: { id },
      data: updateData,
    });

    logger.info('Compliance obligation updated', { obligationId: id });
    res.json({ success: true, data: obligation });
  } catch (error: unknown) {
    logger.error('Failed to update compliance obligation', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update compliance obligation' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete compliance obligation
// ---------------------------------------------------------------------------

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.energyComplianceObligation.findFirst({
      where: { id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Compliance obligation not found' },
      });
    }

    await prisma.energyComplianceObligation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info('Compliance obligation soft-deleted', { obligationId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete compliance obligation', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete compliance obligation' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/assess — Assess compliance obligation
// ---------------------------------------------------------------------------

router.put('/:id/assess', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const _schema = z.object({
      status: z.string().trim().min(1),
      notes: z.string().trim().optional(),
    });
    const _parsed = _schema.safeParse(req.body);
    if (!_parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: _parsed.error.errors[0].message },
      });
    const { status, notes } = _parsed.data;
    const authReq = req as AuthRequest;

    if (!status || !['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid status required: COMPLIANT, NON_COMPLIANT, or PARTIALLY_COMPLIANT',
        },
      });
    }

    const existing = await prisma.energyComplianceObligation.findFirst({
      where: { id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Compliance obligation not found' },
      });
    }

    const obligation = await prisma.energyComplianceObligation.update({
      where: { id },
      data: {
        status,
        lastAssessed: new Date(),
        assessedBy: authReq.user?.id || 'system',
        notes: notes || existing.notes,
      },
    });

    logger.info('Compliance obligation assessed', { obligationId: id, status });
    res.json({ success: true, data: obligation });
  } catch (error: unknown) {
    logger.error('Failed to assess compliance obligation', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to assess compliance obligation' },
    });
  }
});

export default router;
