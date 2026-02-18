import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-food-safety');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Severity / Likelihood scoring maps
// ---------------------------------------------------------------------------
const severityScores: Record<string, number> = {
  CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2,
};
const likelihoodScores: Record<string, number> = {
  ALMOST_CERTAIN: 5, LIKELY: 4, POSSIBLE: 3, UNLIKELY: 2, RARE: 1,
};

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const hazardCreateSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['BIOLOGICAL', 'CHEMICAL', 'PHYSICAL', 'ALLERGEN', 'RADIOLOGICAL']),
  description: z.string().max(2000).optional().nullable(),
  source: z.string().max(500).optional().nullable(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  likelihood: z.enum(['ALMOST_CERTAIN', 'LIKELY', 'POSSIBLE', 'UNLIKELY', 'RARE']),
  controlMeasure: z.string().max(2000).optional().nullable(),
  processStep: z.string().max(200).optional().nullable(),
  isSignificant: z.boolean().optional().default(false),
  category: z.string().max(100).optional().nullable(),
});

const hazardUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(['BIOLOGICAL', 'CHEMICAL', 'PHYSICAL', 'ALLERGEN', 'RADIOLOGICAL']).optional(),
  description: z.string().max(2000).optional().nullable(),
  source: z.string().max(500).optional().nullable(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  likelihood: z.enum(['ALMOST_CERTAIN', 'LIKELY', 'POSSIBLE', 'UNLIKELY', 'RARE']).optional(),
  controlMeasure: z.string().max(2000).optional().nullable(),
  processStep: z.string().max(200).optional().nullable(),
  isSignificant: z.boolean().optional(),
  category: z.string().max(100).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------------------
// GET /api/hazards/summary
// ---------------------------------------------------------------------------
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const hazards = await prisma.fsHazard.findMany({
      where: { deletedAt: null } as any,
      select: { type: true, severity: true, isSignificant: true },
      take: 10000,
    });

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let significantCount = 0;

    for (const h of hazards) {
      byType[h.type] = (byType[h.type] || 0) + 1;
      bySeverity[h.severity] = (bySeverity[h.severity] || 0) + 1;
      if (h.isSignificant) significantCount++;
    }

    res.json({
      success: true,
      data: { total: hazards.length, byType, bySeverity, significantCount },
    });
  } catch (error: unknown) {
    logger.error('Error fetching hazard summary', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch hazard summary' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/hazards
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, severity, isSignificant } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (type) where.type = String(type);
    if (severity) where.severity = String(severity);
    if (isSignificant !== undefined) where.isSignificant = isSignificant === 'true';

    const [data, total] = await Promise.all([
      prisma.fsHazard.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.fsHazard.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing hazards', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list hazards' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/hazards
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = hazardCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const riskScore = (severityScores[body.severity] || 1) * (likelihoodScores[body.likelihood] || 1);
    const user = (req as AuthRequest).user;

    const hazard = await prisma.fsHazard.create({
      data: {
        ...body,
        riskScore,
        createdBy: user?.id || 'system',
      },
    });

    logger.info('Hazard created', { id: hazard.id });
    res.status(201).json({ success: true, data: hazard });
  } catch (error: unknown) {
    logger.error('Error creating hazard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create hazard' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/hazards/:id
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const hazard = await prisma.fsHazard.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { ccps: true },
    });

    if (!hazard) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Hazard not found' } });
    }

    res.json({ success: true, data: hazard });
  } catch (error: unknown) {
    logger.error('Error fetching hazard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch hazard' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/hazards/:id
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsHazard.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Hazard not found' } });
    }

    const parsed = hazardUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const body = parsed.data;
    const sev = body.severity || existing.severity;
    const lik = body.likelihood || existing.likelihood;
    const riskScore = (severityScores[sev] || 1) * (likelihoodScores[lik] || 1);

    const hazard = await prisma.fsHazard.update({
      where: { id: req.params.id },
      data: { ...body, riskScore },
    });

    logger.info('Hazard updated', { id: hazard.id });
    res.json({ success: true, data: hazard });
  } catch (error: unknown) {
    logger.error('Error updating hazard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update hazard' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/hazards/:id
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsHazard.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Hazard not found' } });
    }

    await prisma.fsHazard.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Hazard deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Hazard deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting hazard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete hazard' } });
  }
});

export default router;
