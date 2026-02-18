import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-quality');
const router: Router = Router();
router.use(authenticate);

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-AUD';
  const count = await prisma.qualAudit.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

const createSchema = z.object({
  title: z.string().min(1).max(300),
  auditType: z.enum(['INTERNAL', 'EXTERNAL', 'SUPPLIER', 'REGULATORY', 'CERTIFICATION', 'SURVEILLANCE']).default('INTERNAL'),
  scope: z.string().min(1).max(2000),
  isoClause: z.string().max(200).optional().nullable(),
  department: z.string().max(200).optional().nullable(),
  leadAuditor: z.string().min(1).max(200),
  auditTeam: z.string().max(2000).optional().nullable(),
  auditee: z.string().max(200).optional().nullable(),
  scheduledDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  objectives: z.string().max(2000).optional().nullable(),
  criteria: z.string().max(2000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  findings: z.string().max(10000).optional().nullable(),
  conclusions: z.string().max(5000).optional().nullable(),
  completedDate: z.string().optional().nullable(),
  nextAuditDate: z.string().optional().nullable(),
});

// GET / — List audits
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, auditType, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status && typeof status === 'string') where.status = status;
    if (auditType && typeof auditType === 'string') where.auditType = auditType;
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { leadAuditor: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.qualAudit.findMany({ where, skip, take: limit, orderBy: { scheduledDate: 'desc' } }),
      prisma.qualAudit.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list audits', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list audits' } });
  }
});

// POST / — Create audit
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;
    const referenceNumber = await generateRefNumber();

    const item = await prisma.qualAudit.create({
      data: {
        referenceNumber,
        ...parsed.data,
        scheduledDate: parsed.data.scheduledDate ? new Date(parsed.data.scheduledDate) : null,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        status: 'PLANNED',
        organisationId: (authReq.user as any)?.organisationId || 'default',
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to create audit', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create audit' } });
  }
});

// GET /:id — Get audit by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.qualAudit.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to get audit', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get audit' } });
  }
});

// PUT /:id — Update audit
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.qualAudit.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.scheduledDate) data.scheduledDate = new Date(parsed.data.scheduledDate);
    if (parsed.data.dueDate) data.dueDate = new Date(parsed.data.dueDate);
    if ((parsed.data as any).completedDate) data.completedDate = new Date((parsed.data as any).completedDate);
    if ((parsed.data as any).nextAuditDate) data.nextAuditDate = new Date((parsed.data as any).nextAuditDate);

    const item = await prisma.qualAudit.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to update audit', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update audit' } });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.qualAudit.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });

    await prisma.qualAudit.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete audit', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete audit' } });
  }
});

export default router;
