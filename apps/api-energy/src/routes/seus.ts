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

const seuCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  facility: z.string().max(200).optional().nullable(),
  process: z.string().max(200).optional().nullable(),
  consumptionPercentage: z.number().min(0).max(100),
  annualConsumption: z.number().min(0),
  unit: z.string().min(1).max(50),
  variables: z.any().optional().nullable(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional().default('MEDIUM'),
});

const seuUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  facility: z.string().max(200).optional().nullable(),
  process: z.string().max(200).optional().nullable(),
  consumptionPercentage: z.number().min(0).max(100).optional(),
  annualConsumption: z.number().min(0).optional(),
  unit: z.string().min(1).max(50).optional(),
  variables: z.any().optional().nullable(),
  status: z.enum(['IDENTIFIED', 'ANALYZED', 'OPTIMIZED']).optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List SEUs
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const { facility, status, priority } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };

    if (facility && typeof facility === 'string') {
      where.facility = { contains: facility, mode: 'insensitive' };
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (priority && typeof priority === 'string') {
      where.priority = priority;
    }

    const [seus, total] = await Promise.all([
      prisma.energySeu.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.energySeu.count({ where }),
    ]);

    res.json({
      success: true,
      data: seus,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    logger.error('Failed to list SEUs', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to list SEUs' });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create SEU
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = seuCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const seu = await prisma.energySeu.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        facility: data.facility ?? null,
        process: data.process ?? null,
        consumptionPercentage: new Prisma.Decimal(data.consumptionPercentage),
        annualConsumption: new Prisma.Decimal(data.annualConsumption),
        unit: data.unit,
        variables: data.variables ?? null,
        priority: data.priority,
        status: 'IDENTIFIED',
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('SEU created', { seuId: seu.id });
    res.status(201).json({ success: true, data: seu });
  } catch (error: any) {
    logger.error('Failed to create SEU', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to create SEU' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get SEU
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const seu = await prisma.energySeu.findFirst({
      where: { id, deletedAt: null },
    });

    if (!seu) {
      return res.status(404).json({ success: false, error: 'SEU not found' });
    }

    res.json({ success: true, data: seu });
  } catch (error: any) {
    logger.error('Failed to get SEU', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to get SEU' });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update SEU
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = seuUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.energySeu.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'SEU not found' });
    }

    const updateData: any = { ...parsed.data };
    if (updateData.consumptionPercentage !== undefined) {
      updateData.consumptionPercentage = new Prisma.Decimal(updateData.consumptionPercentage);
    }
    if (updateData.annualConsumption !== undefined) {
      updateData.annualConsumption = new Prisma.Decimal(updateData.annualConsumption);
    }

    const seu = await prisma.energySeu.update({
      where: { id },
      data: updateData,
    });

    logger.info('SEU updated', { seuId: id });
    res.json({ success: true, data: seu });
  } catch (error: any) {
    logger.error('Failed to update SEU', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to update SEU' });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete SEU
// ---------------------------------------------------------------------------

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.energySeu.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'SEU not found' });
    }

    await prisma.energySeu.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info('SEU soft-deleted', { seuId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: any) {
    logger.error('Failed to delete SEU', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to delete SEU' });
  }
});

export default router;
