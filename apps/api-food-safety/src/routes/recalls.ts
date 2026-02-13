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

const recallCreateSchema = z.object({
  productName: z.string().min(1).max(200),
  batchNumber: z.string().min(1).max(100),
  reason: z.string().min(1).max(2000),
  type: z.enum(['VOLUNTARY', 'MANDATORY', 'MARKET_WITHDRAWAL']),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  initiatedDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  unitsAffected: z.number().int().min(0).optional().nullable(),
  unitsRecovered: z.number().int().min(0).optional().nullable(),
  regulatoryNotified: z.boolean().optional().default(false),
  publicNotice: z.boolean().optional().default(false),
  rootCause: z.string().max(2000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

const recallUpdateSchema = z.object({
  productName: z.string().min(1).max(200).optional(),
  batchNumber: z.string().min(1).max(100).optional(),
  reason: z.string().min(1).max(2000).optional(),
  type: z.enum(['VOLUNTARY', 'MANDATORY', 'MARKET_WITHDRAWAL']).optional(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['INITIATED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED']).optional(),
  unitsAffected: z.number().int().min(0).optional().nullable(),
  unitsRecovered: z.number().int().min(0).optional().nullable(),
  regulatoryNotified: z.boolean().optional(),
  publicNotice: z.boolean().optional(),
  rootCause: z.string().max(2000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function generateRecallNumber(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RCL-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// GET /api/recalls/active
// ---------------------------------------------------------------------------
router.get('/active', async (req: Request, res: Response) => {
  try {
    const data = await prisma.fsRecall.findMany({
      where: {
        deletedAt: null,
        status: { in: ['INITIATED', 'IN_PROGRESS'] },
      },
      orderBy: { initiatedDate: 'desc' },
    });

    res.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error fetching active recalls', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch active recalls' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/recalls
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, severity, type } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (status) where.status = String(status);
    if (severity) where.severity = String(severity);
    if (type) where.type = String(type);

    const [data, total] = await Promise.all([
      prisma.fsRecall.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.fsRecall.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    logger.error('Error listing recalls', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list recalls' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/recalls
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = recallCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const number = generateRecallNumber();
    const user = (req as AuthRequest).user;

    const recall = await prisma.fsRecall.create({
      data: {
        ...body,
        number,
        initiatedDate: new Date(body.initiatedDate),
        createdBy: user?.id || 'system',
      },
    });

    logger.info('Recall created', { id: recall.id, number });
    res.status(201).json({ success: true, data: recall });
  } catch (error: any) {
    logger.error('Error creating recall', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create recall' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/recalls/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const recall = await prisma.fsRecall.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!recall) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recall not found' } });
    }

    res.json({ success: true, data: recall });
  } catch (error: any) {
    logger.error('Error fetching recall', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch recall' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/recalls/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const RESERVED = new Set(['complete']);
    if (RESERVED.has(req.params.id)) return (undefined as any);

    const existing = await prisma.fsRecall.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recall not found' } });
    }

    const parsed = recallUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const recall = await prisma.fsRecall.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    logger.info('Recall updated', { id: recall.id });
    res.json({ success: true, data: recall });
  } catch (error: any) {
    logger.error('Error updating recall', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update recall' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/recalls/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsRecall.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recall not found' } });
    }

    await prisma.fsRecall.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Recall deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Recall deleted successfully' } });
  } catch (error: any) {
    logger.error('Error deleting recall', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete recall' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/recalls/:id/complete
// ---------------------------------------------------------------------------
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsRecall.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recall not found' } });
    }

    if (existing.status === 'COMPLETED' || existing.status === 'CLOSED') {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_COMPLETED', message: 'Recall is already completed' } });
    }

    const recall = await prisma.fsRecall.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
        ...(req.body.unitsRecovered !== undefined ? { unitsRecovered: req.body.unitsRecovered } : {}),
        ...(req.body.rootCause ? { rootCause: req.body.rootCause } : {}),
      },
    });

    logger.info('Recall completed', { id: recall.id });
    res.json({ success: true, data: recall });
  } catch (error: any) {
    logger.error('Error completing recall', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete recall' } });
  }
});

export default router;
