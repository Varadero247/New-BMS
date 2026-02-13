import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-cmms');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const planCreateSchema = z.object({
  name: z.string().min(1).max(200),
  assetId: z.string().uuid(),
  description: z.string().max(2000).optional().nullable(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY']),
  lastPerformed: z.string().optional().nullable(),
  nextDue: z.string().optional().nullable(),
  tasks: z.any(),
  assignedTo: z.string().max(200).optional().nullable(),
  isActive: z.boolean().optional(),
  estimatedDuration: z.number().int().optional().nullable(),
  estimatedCost: z.number().optional().nullable(),
});

const planUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUALLY', 'ANNUALLY']).optional(),
  lastPerformed: z.string().optional().nullable(),
  nextDue: z.string().optional().nullable(),
  tasks: z.any().optional(),
  assignedTo: z.string().max(200).optional().nullable(),
  isActive: z.boolean().optional(),
  estimatedDuration: z.number().int().optional().nullable(),
  estimatedCost: z.number().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ===================================================================
// PREVENTIVE PLANS CRUD
// ===================================================================

// GET / — List preventive plans
router.get('/', async (req: Request, res: Response) => {
  try {
    const { assetId, frequency, isActive, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (assetId) where.assetId = String(assetId);
    if (frequency) where.frequency = String(frequency);
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [plans, total] = await Promise.all([
      prisma.cmmsPreventivePlan.findMany({
        where,
        skip,
        take: limit,
        include: { asset: { select: { id: true, name: true, code: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.cmmsPreventivePlan.count({ where }),
    ]);

    res.json({
      success: true,
      data: plans,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list preventive plans', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list preventive plans' } });
  }
});

// POST / — Create preventive plan
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = planCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const plan = await prisma.cmmsPreventivePlan.create({
      data: {
        name: data.name,
        assetId: data.assetId,
        description: data.description,
        frequency: data.frequency,
        lastPerformed: data.lastPerformed ? new Date(data.lastPerformed) : null,
        nextDue: data.nextDue ? new Date(data.nextDue) : null,
        tasks: data.tasks || [],
        assignedTo: data.assignedTo,
        isActive: data.isActive !== undefined ? data.isActive : true,
        estimatedDuration: data.estimatedDuration,
        estimatedCost: data.estimatedCost != null ? new Prisma.Decimal(data.estimatedCost) : null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: plan });
  } catch (error: unknown) {
    logger.error('Failed to create preventive plan', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create preventive plan' } });
  }
});

// GET /:id — Get preventive plan by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const plan = await prisma.cmmsPreventivePlan.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { asset: { select: { id: true, name: true, code: true } } },
    });

    if (!plan) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Preventive plan not found' } });
    }

    res.json({ success: true, data: plan });
  } catch (error: unknown) {
    logger.error('Failed to get preventive plan', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get preventive plan' } });
  }
});

// PUT /:id — Update preventive plan
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = planUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const existing = await prisma.cmmsPreventivePlan.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Preventive plan not found' } });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { ...data };
    if (data.lastPerformed !== undefined) updateData.lastPerformed = data.lastPerformed ? new Date(data.lastPerformed) : null;
    if (data.nextDue !== undefined) updateData.nextDue = data.nextDue ? new Date(data.nextDue) : null;
    if (data.estimatedCost !== undefined) updateData.estimatedCost = data.estimatedCost != null ? new Prisma.Decimal(data.estimatedCost) : null;

    const plan = await prisma.cmmsPreventivePlan.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: plan });
  } catch (error: unknown) {
    logger.error('Failed to update preventive plan', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update preventive plan' } });
  }
});

// DELETE /:id — Soft delete preventive plan
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsPreventivePlan.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Preventive plan not found' } });
    }

    await prisma.cmmsPreventivePlan.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Preventive plan deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete preventive plan', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete preventive plan' } });
  }
});

export default router;
