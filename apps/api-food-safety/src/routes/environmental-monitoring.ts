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

const envMonCreateSchema = z.object({
  location: z.string().min(1).max(200),
  testType: z.enum(['SWAB', 'AIR', 'WATER', 'SURFACE']),
  parameter: z.string().min(1).max(200),
  result: z.string().min(1).max(200),
  unit: z.string().max(50).optional().nullable(),
  limit: z.string().max(200).optional().nullable(),
  withinSpec: z.boolean(),
  testedBy: z.string().max(200).optional().nullable(),
  testedAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  notes: z.string().max(2000).optional().nullable(),
});

const envMonUpdateSchema = z.object({
  location: z.string().min(1).max(200).optional(),
  testType: z.enum(['SWAB', 'AIR', 'WATER', 'SURFACE']).optional(),
  parameter: z.string().min(1).max(200).optional(),
  result: z.string().min(1).max(200).optional(),
  unit: z.string().max(50).optional().nullable(),
  limit: z.string().max(200).optional().nullable(),
  withinSpec: z.boolean().optional(),
  testedBy: z.string().max(200).optional().nullable(),
  testedAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  notes: z.string().max(2000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET /api/environmental-monitoring/out-of-spec
// ---------------------------------------------------------------------------
router.get('/out-of-spec', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null, withinSpec: false };

    const [data, total] = await Promise.all([
      prisma.fsEnvironmentalMonitoring.findMany({ where, skip, take: limit, orderBy: { testedAt: 'desc' } }),
      prisma.fsEnvironmentalMonitoring.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error fetching out-of-spec records', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch out-of-spec records' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/environmental-monitoring
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { testType, location, withinSpec } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (testType) where.testType = String(testType);
    if (location) where.location = { contains: String(location), mode: 'insensitive' };
    if (withinSpec !== undefined) where.withinSpec = withinSpec === 'true';

    const [data, total] = await Promise.all([
      prisma.fsEnvironmentalMonitoring.findMany({ where, skip, take: limit, orderBy: { testedAt: 'desc' } }),
      prisma.fsEnvironmentalMonitoring.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing environmental monitoring records', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list environmental monitoring records' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/environmental-monitoring
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = envMonCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const user = (req as AuthRequest).user;

    const record = await prisma.fsEnvironmentalMonitoring.create({
      data: {
        ...body,
        testedAt: new Date(body.testedAt),
        createdBy: user?.id || 'system',
      },
    });

    logger.info('Environmental monitoring record created', { id: record.id });
    res.status(201).json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Error creating environmental monitoring record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create environmental monitoring record' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/environmental-monitoring/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await prisma.fsEnvironmentalMonitoring.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!record) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Environmental monitoring record not found' } });
    }

    res.json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Error fetching environmental monitoring record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch environmental monitoring record' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/environmental-monitoring/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsEnvironmentalMonitoring.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Environmental monitoring record not found' } });
    }

    const parsed = envMonUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const updateData: Record<string, unknown> = { ...body };
    if (body.testedAt) updateData.testedAt = new Date(body.testedAt);

    const record = await prisma.fsEnvironmentalMonitoring.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logger.info('Environmental monitoring record updated', { id: record.id });
    res.json({ success: true, data: record });
  } catch (error: unknown) {
    logger.error('Error updating environmental monitoring record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update environmental monitoring record' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/environmental-monitoring/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsEnvironmentalMonitoring.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Environmental monitoring record not found' } });
    }

    await prisma.fsEnvironmentalMonitoring.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Environmental monitoring record deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Environmental monitoring record deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting environmental monitoring record', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete environmental monitoring record' } });
  }
});

export default router;
