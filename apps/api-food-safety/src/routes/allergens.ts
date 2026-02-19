import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma} from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-food-safety');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const allergenCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  type: z.enum(['MAJOR', 'MINOR']),
  description: z.string().trim().max(2000).optional().nullable(),
  controlMeasures: z.string().trim().max(2000).optional().nullable(),
  labellingRequired: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

const allergenUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  type: z.enum(['MAJOR', 'MINOR']).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  controlMeasures: z.string().trim().max(2000).optional().nullable(),
  labellingRequired: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

function generateAllergenCode(): string {
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 3), 16) % 900) + 100;
  return `ALG-${rand}`;
}

// ---------------------------------------------------------------------------
// GET /api/allergens
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, isActive } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (type) where.type = String(type);
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [data, total] = await Promise.all([
      prisma.fsAllergen.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.fsAllergen.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing allergens', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list allergens' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/allergens
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = allergenCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      });
    }

    const body = parsed.data;
    const code = generateAllergenCode();
    const user = (req as AuthRequest).user;

    const allergen = await prisma.fsAllergen.create({
      data: {
        ...body,
        code,
        createdBy: user?.id || 'system',
      },
    });

    logger.info('Allergen created', { id: allergen.id, code });
    res.status(201).json({ success: true, data: allergen });
  } catch (error: unknown) {
    logger.error('Error creating allergen', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create allergen' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/allergens/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const allergen = await prisma.fsAllergen.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!allergen) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Allergen not found' } });
    }

    res.json({ success: true, data: allergen });
  } catch (error: unknown) {
    logger.error('Error fetching allergen', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch allergen' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/allergens/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsAllergen.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Allergen not found' } });
    }

    const parsed = allergenUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      });
    }

    const allergen = await prisma.fsAllergen.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    logger.info('Allergen updated', { id: allergen.id });
    res.json({ success: true, data: allergen });
  } catch (error: unknown) {
    logger.error('Error updating allergen', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update allergen' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/allergens/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsAllergen.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Allergen not found' } });
    }

    await prisma.fsAllergen.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Allergen deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Allergen deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting allergen', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete allergen' },
    });
  }
});

export default router;
