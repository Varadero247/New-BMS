import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-energy');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const auditCreateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  type: z.enum(['INTERNAL', 'EXTERNAL', 'REGULATORY', 'ISO_50001']),
  auditor: z.string().trim().min(1).max(200),
  facility: z.string().trim().max(200).optional().nullable(),
  scheduledDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(
      z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
    ),
  findings: z.any().optional().nullable(),
  recommendations: z.any().optional().nullable(),
});

const auditUpdateSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  type: z.enum(['INTERNAL', 'EXTERNAL', 'REGULATORY', 'ISO_50001']).optional(),
  auditor: z.string().trim().min(1).max(200).optional(),
  facility: z.string().trim().max(200).optional().nullable(),
  scheduledDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(
      z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
    )
    .optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']).optional(),
  findings: z.any().optional().nullable(),
  recommendations: z.any().optional().nullable(),
  score: z.number().min(0).max(100).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List audits
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, facility, status } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (type && typeof type === 'string') {
      where.type = type;
    }
    if (facility && typeof facility === 'string') {
      where.facility = { contains: facility, mode: 'insensitive' };
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const [audits, total] = await Promise.all([
      prisma.energyAudit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
      }),
      prisma.energyAudit.count({ where }),
    ]);

    res.json({
      success: true,
      data: audits,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list audits', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list audits' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create audit
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = auditCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
        details: parsed.error.flatten(),
      });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const audit = await prisma.energyAudit.create({
      data: {
        title: data.title,
        type: data.type,
        auditor: data.auditor,
        facility: data.facility ?? null,
        scheduledDate: new Date(data.scheduledDate),
        findings: data.findings ?? null,
        recommendations: data.recommendations ?? null,
        status: 'PLANNED',
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Audit created', { auditId: audit.id });
    res.status(201).json({ success: true, data: audit });
  } catch (error: unknown) {
    logger.error('Failed to create audit', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create audit' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get audit
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const audit = await prisma.energyAudit.findFirst({
      where: { id, deletedAt: null },
    });

    if (!audit) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    res.json({ success: true, data: audit });
  } catch (error: unknown) {
    logger.error('Failed to get audit', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get audit' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update audit
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = auditUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
        details: parsed.error.flatten(),
      });
    }

    const existing = await prisma.energyAudit.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.scheduledDate) {
      updateData.scheduledDate = new Date(updateData.scheduledDate as string);
    }
    if (updateData.score !== undefined && updateData.score !== null) {
      updateData.score = new Prisma.Decimal(updateData.score as any);
    }

    const audit = await prisma.energyAudit.update({
      where: { id },
      data: updateData,
    });

    logger.info('Audit updated', { auditId: id });
    res.json({ success: true, data: audit });
  } catch (error: unknown) {
    logger.error('Failed to update audit', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update audit' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete audit
// ---------------------------------------------------------------------------

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.energyAudit.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    await prisma.energyAudit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info('Audit soft-deleted', { auditId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete audit', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete audit' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/complete — Complete audit
// ---------------------------------------------------------------------------

router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const _schema = z.object({
      score: z.number().min(0).max(100).optional(),
      findings: z.any().optional(),
      recommendations: z.any().optional(),
    });
    const _parsed = _schema.safeParse(req.body);
    if (!_parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: _parsed.error.errors[0].message },
      });
    const { score, findings, recommendations } = _parsed.data;

    const existing = await prisma.energyAudit.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    if (existing.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Audit is already completed' },
      });
    }

    const audit = await prisma.energyAudit.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
        score: score !== null ? new Prisma.Decimal(score) : existing.score,
        findings: findings ?? existing.findings,
        recommendations: recommendations ?? existing.recommendations,
      },
    });

    logger.info('Audit completed', { auditId: id });
    res.json({ success: true, data: audit });
  } catch (error: unknown) {
    logger.error('Failed to complete audit', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to complete audit' },
    });
  }
});

export default router;
