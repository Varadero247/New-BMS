import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-field-service');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const siteCreateSchema = z.object({
  customerId: z.string().trim().uuid(),
  name: z.string().trim().min(1).max(200),
  address: z.record(z.any()),
  coordinates: z.record(z.any()).optional().nullable(),
  accessInstructions: z.string().trim().max(2000).optional().nullable(),
  contactName: z.string().trim().max(200).optional().nullable(),
  contactPhone: z.string().trim().max(30).optional().nullable(),
  specialRequirements: z.any().optional().nullable(),
  equipment: z.any().optional().nullable(),
});

const siteUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  address: z.record(z.any()).optional(),
  coordinates: z.record(z.any()).optional().nullable(),
  accessInstructions: z.string().trim().max(2000).optional().nullable(),
  contactName: z.string().trim().max(200).optional().nullable(),
  contactPhone: z.string().trim().max(30).optional().nullable(),
  specialRequirements: z.any().optional().nullable(),
  equipment: z.any().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List sites
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (customerId) where.customerId = String(customerId);

    const [data, total] = await Promise.all([
      prisma.fsSvcSite.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      prisma.fsSvcSite.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list sites', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list sites' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create site
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = siteCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const authReq = req as AuthRequest;
    const data = await prisma.fsSvcSite.create({
      data: {
        ...parsed.data,
        address: parsed.data.address as Prisma.InputJsonValue,
        coordinates: parsed.data.coordinates as any,
        specialRequirements: parsed.data.specialRequirements as any,
        equipment: parsed.data.equipment as any,
        createdBy: authReq.user!.id,
      },
    });

    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create site', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create site' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get site by ID
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await prisma.fsSvcSite.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { customer: true },
    });

    if (!data) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Site not found' } });
    }
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get site', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get site' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update site
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcSite.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Site not found' } });
    }

    const parsed = siteUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const data = await prisma.fsSvcSite.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        address: parsed.data.address as Prisma.InputJsonValue,
        coordinates: parsed.data.coordinates as any,
        specialRequirements: parsed.data.specialRequirements as any,
        equipment: parsed.data.equipment as any,
      },
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update site', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update site' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete site
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcSite.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Site not found' } });
    }

    await prisma.fsSvcSite.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'Site deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete site', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete site' },
    });
  }
});

export default router;
