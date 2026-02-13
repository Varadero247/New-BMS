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

const ncrCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  area: z.string().max(200).optional().nullable(),
  category: z.enum(['PROCESS', 'PRODUCT', 'DOCUMENTATION', 'FACILITY', 'SUPPLIER']),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  rootCause: z.string().max(2000).optional().nullable(),
  correctiveAction: z.string().max(2000).optional().nullable(),
  preventiveAction: z.string().max(2000).optional().nullable(),
  dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  assignedTo: z.string().max(200).optional().nullable(),
});

const ncrUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  area: z.string().max(200).optional().nullable(),
  category: z.enum(['PROCESS', 'PRODUCT', 'DOCUMENTATION', 'FACILITY', 'SUPPLIER']).optional(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['OPEN', 'INVESTIGATING', 'CORRECTIVE_ACTION', 'CLOSED']).optional(),
  rootCause: z.string().max(2000).optional().nullable(),
  correctiveAction: z.string().max(2000).optional().nullable(),
  preventiveAction: z.string().max(2000).optional().nullable(),
  dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  assignedTo: z.string().max(200).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function generateNcrNumber(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NCR-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// GET /api/ncrs/open
// ---------------------------------------------------------------------------
router.get('/open', async (req: Request, res: Response) => {
  try {
    const data = await prisma.fsNcr.findMany({
      where: {
        deletedAt: null,
        status: { in: ['OPEN', 'INVESTIGATING', 'CORRECTIVE_ACTION'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Error fetching open NCRs', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch open NCRs' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/ncrs
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, severity, category } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = String(status);
    if (severity) where.severity = String(severity);
    if (category) where.category = String(category);

    const [data, total] = await Promise.all([
      prisma.fsNcr.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.fsNcr.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing NCRs', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list NCRs' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/ncrs
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = ncrCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const number = generateNcrNumber();
    const user = (req as AuthRequest).user;

    const ncr = await prisma.fsNcr.create({
      data: {
        ...body,
        number,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        createdBy: user?.id || 'system',
      },
    });

    logger.info('NCR created', { id: ncr.id, number });
    res.status(201).json({ success: true, data: ncr });
  } catch (error: unknown) {
    logger.error('Error creating NCR', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create NCR' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/ncrs/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ncr = await prisma.fsNcr.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!ncr) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'NCR not found' } });
    }

    res.json({ success: true, data: ncr });
  } catch (error: unknown) {
    logger.error('Error fetching NCR', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch NCR' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/ncrs/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const RESERVED = new Set(['close']);
    if (RESERVED.has(req.params.id)) return (undefined as any);

    const existing = await prisma.fsNcr.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'NCR not found' } });
    }

    const parsed = ncrUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const updateData: Record<string, unknown> = { ...body };
    if (body.dueDate) updateData.dueDate = new Date(body.dueDate);

    const ncr = await prisma.fsNcr.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logger.info('NCR updated', { id: ncr.id });
    res.json({ success: true, data: ncr });
  } catch (error: unknown) {
    logger.error('Error updating NCR', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update NCR' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/ncrs/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsNcr.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'NCR not found' } });
    }

    await prisma.fsNcr.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('NCR deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'NCR deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting NCR', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete NCR' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/ncrs/:id/close
// ---------------------------------------------------------------------------
router.put('/:id/close', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsNcr.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'NCR not found' } });
    }

    if (existing.status === 'CLOSED') {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_CLOSED', message: 'NCR is already closed' } });
    }

    const ncr = await prisma.fsNcr.update({
      where: { id: req.params.id },
      data: {
        status: 'CLOSED',
        closedDate: new Date(),
        ...(req.body.rootCause ? { rootCause: req.body.rootCause } : {}),
        ...(req.body.correctiveAction ? { correctiveAction: req.body.correctiveAction } : {}),
        ...(req.body.preventiveAction ? { preventiveAction: req.body.preventiveAction } : {}),
      },
    });

    logger.info('NCR closed', { id: ncr.id });
    res.json({ success: true, data: ncr });
  } catch (error: unknown) {
    logger.error('Error closing NCR', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to close NCR' } });
  }
});

export default router;
