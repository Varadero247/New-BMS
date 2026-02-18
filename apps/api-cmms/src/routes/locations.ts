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

const locationCreateSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(50),
  description: z.string().max(2000).optional().nullable(),
  parentLocationId: z.string().uuid().optional().nullable(),
  type: z.enum(['SITE', 'BUILDING', 'FLOOR', 'ROOM', 'AREA', 'ZONE']),
  address: z.string().max(500).optional().nullable(),
  coordinates: z.string().max(100).optional().nullable(),
});

const locationUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  parentLocationId: z.string().uuid().optional().nullable(),
  type: z.enum(['SITE', 'BUILDING', 'FLOOR', 'ROOM', 'AREA', 'ZONE']).optional(),
  address: z.string().max(500).optional().nullable(),
  coordinates: z.string().max(100).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ===================================================================
// LOCATIONS CRUD
// ===================================================================

// GET / — List locations
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (type) where.type = String(type);
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { code: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [locations, total] = await Promise.all([
      prisma.cmmsLocation.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.cmmsLocation.count({ where }),
    ]);

    res.json({
      success: true,
      data: locations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list locations', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list locations' } });
  }
});

// POST / — Create location
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = locationCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const location = await prisma.cmmsLocation.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        parentLocationId: data.parentLocationId,
        type: data.type,
        address: data.address,
        coordinates: data.coordinates,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: location });
  } catch (error: unknown) {
    if ((error as any)?.code === 'P2002') {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Location code already exists' } });
    }
    logger.error('Failed to create location', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create location' } });
  }
});

// GET /:id — Get location by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const location = await prisma.cmmsLocation.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!location) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Location not found' } });
    }

    res.json({ success: true, data: location });
  } catch (error: unknown) {
    logger.error('Failed to get location', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get location' } });
  }
});

// PUT /:id — Update location
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = locationUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const existing = await prisma.cmmsLocation.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Location not found' } });
    }

    const location = await prisma.cmmsLocation.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data: location });
  } catch (error: unknown) {
    logger.error('Failed to update location', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update location' } });
  }
});

// DELETE /:id — Soft delete location
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsLocation.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Location not found' } });
    }

    await prisma.cmmsLocation.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Location deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete location', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete location' } });
  }
});

export default router;
