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

const trainingCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(['INDUCTION', 'REFRESHER', 'HACCP', 'GMP', 'HYGIENE', 'ALLERGEN', 'FOOD_DEFENSE']),
  trainer: z.string().max(200).optional().nullable(),
  scheduledDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  attendees: z.any().optional().nullable(),
  certificate: z.string().max(500).optional().nullable(),
  validUntil: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});

const trainingUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(['INDUCTION', 'REFRESHER', 'HACCP', 'GMP', 'HYGIENE', 'ALLERGEN', 'FOOD_DEFENSE']).optional(),
  trainer: z.string().max(200).optional().nullable(),
  scheduledDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  status: z.enum(['PLANNED', 'COMPLETED', 'CANCELLED']).optional(),
  attendees: z.any().optional().nullable(),
  certificate: z.string().max(500).optional().nullable(),
  validUntil: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------------------
// GET /api/training
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, status } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (type) where.type = String(type);
    if (status) where.status = String(status);

    const [data, total] = await Promise.all([
      prisma.fsTraining.findMany({ where, skip, take: limit, orderBy: { scheduledDate: 'desc' } }),
      prisma.fsTraining.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing training records', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list training records' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/training
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = trainingCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const user = (req as AuthRequest).user;

    const training = await prisma.fsTraining.create({
      data: {
        ...body,
        scheduledDate: new Date(body.scheduledDate),
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        createdBy: user?.id || 'system',
      },
    });

    logger.info('Training record created', { id: training.id });
    res.status(201).json({ success: true, data: training });
  } catch (error: unknown) {
    logger.error('Error creating training record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create training record' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/training/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const training = await prisma.fsTraining.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!training) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Training record not found' } });
    }

    res.json({ success: true, data: training });
  } catch (error: unknown) {
    logger.error('Error fetching training record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch training record' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/training/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const RESERVED = new Set(['complete']);
    if (RESERVED.has(req.params.id)) return (undefined as any);

    const existing = await prisma.fsTraining.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Training record not found' } });
    }

    const parsed = trainingUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const updateData: Record<string, unknown> = { ...body };
    if (body.scheduledDate) updateData.scheduledDate = new Date(body.scheduledDate);
    if (body.validUntil) updateData.validUntil = new Date(body.validUntil);

    const training = await prisma.fsTraining.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logger.info('Training record updated', { id: training.id });
    res.json({ success: true, data: training });
  } catch (error: unknown) {
    logger.error('Error updating training record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update training record' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/training/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsTraining.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Training record not found' } });
    }

    await prisma.fsTraining.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Training record deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Training record deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting training record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete training record' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/training/:id/complete
// ---------------------------------------------------------------------------
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsTraining.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Training record not found' } });
    }

    if (existing.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_COMPLETED', message: 'Training is already completed' } });
    }

    const training = await prisma.fsTraining.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
        ...(req.body.attendees ? { attendees: req.body.attendees } : {}),
        ...(req.body.certificate ? { certificate: req.body.certificate } : {}),
        ...(req.body.validUntil ? { validUntil: new Date(req.body.validUntil) } : {}),
      },
    });

    logger.info('Training completed', { id: training.id });
    res.json({ success: true, data: training });
  } catch (error: unknown) {
    logger.error('Error completing training', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete training' } });
  }
});

export default router;
