import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-food-safety');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const auditCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  type: z.enum(['INTERNAL', 'EXTERNAL', 'REGULATORY', 'CERTIFICATION', 'SUPPLIER']),
  auditor: z.string().trim().min(1).max(200),
  scope: z.string().max(2000).optional().nullable(),
  scheduledDate: z.string().trim().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  score: z.number().min(0).max(100).optional().nullable(),
  findings: z.any().optional().nullable(),
  certificate: z.string().max(500).optional().nullable(),
});

const auditCompleteSchema = z.object({
  score: z.number().min(0).max(100).optional().nullable(),
  findings: z.any().optional().nullable(),
});

const auditUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  type: z.enum(['INTERNAL', 'EXTERNAL', 'REGULATORY', 'CERTIFICATION', 'SUPPLIER']).optional(),
  auditor: z.string().trim().min(1).max(200).optional(),
  scope: z.string().max(2000).optional().nullable(),
  scheduledDate: z.string().trim().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  score: z.number().min(0).max(100).optional().nullable(),
  findings: z.any().optional().nullable(),
  certificate: z.string().max(500).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET /api/audits
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, status } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (type) where.type = String(type);
    if (status) where.status = String(status);

    const [data, total] = await Promise.all([
      prisma.fsAudit.findMany({ where, skip, take: limit, orderBy: { scheduledDate: 'desc' } }),
      prisma.fsAudit.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing audits', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list audits' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/audits
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = auditCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const user = (req as AuthRequest).user;

    const audit = await prisma.fsAudit.create({
      data: {
        ...body,
        scheduledDate: new Date(body.scheduledDate),
        createdBy: user?.id || 'system',
      },
    });

    logger.info('Audit created', { id: audit.id });
    res.status(201).json({ success: true, data: audit });
  } catch (error: unknown) {
    logger.error('Error creating audit', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create audit' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/audits/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const audit = await prisma.fsAudit.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!audit) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    res.json({ success: true, data: audit });
  } catch (error: unknown) {
    logger.error('Error fetching audit', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch audit' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/audits/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const RESERVED = new Set(['complete']);
    if (RESERVED.has(req.params.id)) return (undefined as any);

    const existing = await prisma.fsAudit.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    const parsed = auditUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const updateData: Record<string, unknown> = { ...body };
    if (body.scheduledDate) updateData.scheduledDate = new Date(body.scheduledDate);

    const audit = await prisma.fsAudit.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logger.info('Audit updated', { id: audit.id });
    res.json({ success: true, data: audit });
  } catch (error: unknown) {
    logger.error('Error updating audit', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update audit' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/audits/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsAudit.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    await prisma.fsAudit.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Audit deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Audit deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting audit', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete audit' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/audits/:id/complete
// ---------------------------------------------------------------------------
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsAudit.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    if (existing.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_COMPLETED', message: 'Audit is already completed' } });
    }

    const completeParsed = auditCompleteSchema.safeParse(req.body);
    if (!completeParsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: completeParsed.error.errors[0]?.message || 'Invalid completion data' } });
    }
    const { score, findings } = completeParsed.data;

    const audit = await prisma.fsAudit.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
        ...(score != null ? { score } : {}),
        ...(findings != null ? { findings } : {}),
      },
    });

    logger.info('Audit completed', { id: audit.id });
    res.json({ success: true, data: audit });
  } catch (error: unknown) {
    logger.error('Error completing audit', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete audit' } });
  }
});

export default router;
