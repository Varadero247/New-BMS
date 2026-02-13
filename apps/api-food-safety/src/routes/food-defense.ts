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

const foodDefenseCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  threatType: z.enum(['INTENTIONAL_CONTAMINATION', 'SABOTAGE', 'TAMPERING', 'BIOTERRORISM', 'CYBER']),
  vulnerabilityAssessment: z.string().max(2000).optional().nullable(),
  mitigationMeasure: z.string().max(2000).optional().nullable(),
  status: z.enum(['IDENTIFIED', 'ASSESSED', 'MITIGATED', 'MONITORED']).optional().default('IDENTIFIED'),
  riskLevel: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  assessedDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  reviewDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});

const foodDefenseUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  threatType: z.enum(['INTENTIONAL_CONTAMINATION', 'SABOTAGE', 'TAMPERING', 'BIOTERRORISM', 'CYBER']).optional(),
  vulnerabilityAssessment: z.string().max(2000).optional().nullable(),
  mitigationMeasure: z.string().max(2000).optional().nullable(),
  status: z.enum(['IDENTIFIED', 'ASSESSED', 'MITIGATED', 'MONITORED']).optional(),
  riskLevel: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  assessedDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  reviewDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------------------
// GET /api/food-defense
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { threatType, status, riskLevel } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (threatType) where.threatType = String(threatType);
    if (status) where.status = String(status);
    if (riskLevel) where.riskLevel = String(riskLevel);

    const [data, total] = await Promise.all([
      prisma.fsFoodDefense.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.fsFoodDefense.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    logger.error('Error listing food defense records', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list food defense records' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/food-defense
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = foodDefenseCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const user = (req as AuthRequest).user;

    const record = await prisma.fsFoodDefense.create({
      data: {
        ...body,
        assessedDate: body.assessedDate ? new Date(body.assessedDate) : null,
        reviewDate: body.reviewDate ? new Date(body.reviewDate) : null,
        createdBy: user?.id || 'system',
      },
    });

    logger.info('Food defense record created', { id: record.id });
    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    logger.error('Error creating food defense record', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create food defense record' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/food-defense/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await prisma.fsFoodDefense.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!record) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Food defense record not found' } });
    }

    res.json({ success: true, data: record });
  } catch (error: any) {
    logger.error('Error fetching food defense record', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch food defense record' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/food-defense/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsFoodDefense.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Food defense record not found' } });
    }

    const parsed = foodDefenseUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const updateData: any = { ...body };
    if (body.assessedDate) updateData.assessedDate = new Date(body.assessedDate);
    if (body.reviewDate) updateData.reviewDate = new Date(body.reviewDate);

    const record = await prisma.fsFoodDefense.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logger.info('Food defense record updated', { id: record.id });
    res.json({ success: true, data: record });
  } catch (error: any) {
    logger.error('Error updating food defense record', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update food defense record' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/food-defense/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsFoodDefense.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Food defense record not found' } });
    }

    await prisma.fsFoodDefense.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Food defense record deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Food defense record deleted successfully' } });
  } catch (error: any) {
    logger.error('Error deleting food defense record', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete food defense record' } });
  }
});

export default router;
