import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { z } from 'zod';

const logger = createLogger('api-infosec');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function generateRiskRef(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ISR-${yy}${mm}-${rand}`;
}

function calculateRiskLevel(score: number): string {
  if (score <= 4) return 'VERY_LOW';
  if (score <= 8) return 'LOW';
  if (score <= 12) return 'MEDIUM';
  if (score <= 19) return 'HIGH';
  return 'CRITICAL';
}

const RESERVED_PATHS = new Set(['heat-map']);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const riskCreateSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  threat: z.string().min(1).max(500),
  vulnerability: z.string().min(1).max(500),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  assetId: z.string().uuid().optional(),
  category: z.string().max(100).optional(),
  owner: z.string().max(200).optional(),
});

const riskUpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  threat: z.string().min(1).max(500).optional(),
  vulnerability: z.string().min(1).max(500).optional(),
  likelihood: z.number().int().min(1).max(5).optional(),
  impact: z.number().int().min(1).max(5).optional(),
  assetId: z.string().uuid().optional().nullable(),
  category: z.string().max(100).optional(),
  owner: z.string().max(200).optional(),
  status: z.enum(['IDENTIFIED', 'ASSESSED', 'TREATING', 'ACCEPTED', 'CLOSED']).optional(),
});

const treatmentSchema = z.object({
  treatment: z.enum(['MITIGATE', 'TRANSFER', 'AVOID', 'ACCEPT']),
  treatmentPlan: z.string().min(1).max(5000),
  controlIds: z.array(z.string()).optional(),
  residualLikelihood: z.number().int().min(1).max(5).optional(),
  residualImpact: z.number().int().min(1).max(5).optional(),
});

// ---------------------------------------------------------------------------
// POST / — Create risk
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = riskCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const refNumber = generateRiskRef();
    const riskScore = parsed.data.likelihood * parsed.data.impact;
    const riskLevel = calculateRiskLevel(riskScore);

    const risk = await prisma.isRisk.create({
      data: {
        refNumber,
        title: parsed.data.title,
        description: parsed.data.description || null,
        threat: parsed.data.threat,
        vulnerability: parsed.data.vulnerability,
        likelihood: parsed.data.likelihood,
        impact: parsed.data.impact,
        riskScore,
        riskLevel,
        assetId: parsed.data.assetId || null,
        category: parsed.data.category || null,
        owner: parsed.data.owner || null,
        status: 'IDENTIFIED',
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Information security risk created', { riskId: risk.id, refNumber, riskScore, riskLevel });
    res.status(201).json({ success: true, data: risk });
  } catch (error: unknown) {
    logger.error('Failed to create risk', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to create risk' });
  }
});

// ---------------------------------------------------------------------------
// GET / — List risks with filters
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { riskLevel, status, treatment, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (riskLevel && typeof riskLevel === 'string') {
      where.riskLevel = riskLevel;
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (treatment && typeof treatment === 'string') {
      where.treatment = treatment;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { refNumber: { contains: search, mode: 'insensitive' } },
        { threat: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [risks, total] = await Promise.all([
      prisma.isRisk.findMany({
        where,
        skip,
        take: limit,
        orderBy: { riskScore: 'desc' },
      }),
      prisma.isRisk.count({ where }),
    ]);

    res.json({
      success: true,
      data: risks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list risks', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to list risks' });
  }
});

// ---------------------------------------------------------------------------
// GET /heat-map — 5x5 risk matrix
// ---------------------------------------------------------------------------
router.get('/heat-map', async (_req: Request, res: Response) => {
  try {
    const risks = await prisma.isRisk.findMany({
      where: { deletedAt: null },
      select: { likelihood: true, impact: true },
    });

    // Build 5x5 matrix
    const matrix: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));

    for (const risk of risks) {
      const li = risk.likelihood - 1; // 0-indexed
      const ii = risk.impact - 1;
      if (li >= 0 && li < 5 && ii >= 0 && ii < 5) {
        matrix[li][ii]++;
      }
    }

    res.json({
      success: true,
      data: {
        matrix,
        labels: {
          likelihood: ['Very Low (1)', 'Low (2)', 'Medium (3)', 'High (4)', 'Very High (5)'],
          impact: ['Negligible (1)', 'Minor (2)', 'Moderate (3)', 'Major (4)', 'Severe (5)'],
        },
        totalRisks: risks.length,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to generate heat map', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to generate heat map' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Risk detail
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const risk = await prisma.isRisk.findFirst({
      where: { id, deletedAt: null },
    });

    if (!risk) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }

    res.json({ success: true, data: risk });
  } catch (error: unknown) {
    logger.error('Failed to get risk', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to get risk' });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update risk
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const parsed = riskUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.isRisk.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }

    const authReq = req as AuthRequest;
    const likelihood = parsed.data.likelihood ?? existing.likelihood;
    const impact = parsed.data.impact ?? existing.impact;
    const riskScore = likelihood * impact;
    const riskLevel = calculateRiskLevel(riskScore);

    const risk = await prisma.isRisk.update({
      where: { id },
      data: {
        ...parsed.data,
        likelihood,
        impact,
        riskScore,
        riskLevel,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
    });

    logger.info('Risk updated', { riskId: id, riskScore, riskLevel });
    res.json({ success: true, data: risk });
  } catch (error: unknown) {
    logger.error('Failed to update risk', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to update risk' });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/treatment — Assign treatment plan
// ---------------------------------------------------------------------------
router.put('/:id/treatment', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = treatmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.isRisk.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Risk not found' });
    }

    const authReq = req as AuthRequest;

    const updateData: Record<string, unknown> = {
      treatment: parsed.data.treatment,
      treatmentPlan: parsed.data.treatmentPlan,
      controlIds: parsed.data.controlIds || [],
      status: 'TREATING',
      updatedBy: authReq.user?.id || 'system',
      updatedAt: new Date(),
    };

    if (parsed.data.residualLikelihood && parsed.data.residualImpact) {
      updateData.residualLikelihood = parsed.data.residualLikelihood;
      updateData.residualImpact = parsed.data.residualImpact;
      updateData.residualRiskScore = parsed.data.residualLikelihood * parsed.data.residualImpact;
      updateData.residualRiskLevel = calculateRiskLevel(updateData.residualRiskScore);
    }

    const risk = await prisma.isRisk.update({
      where: { id },
      data: updateData,
    });

    logger.info('Risk treatment assigned', { riskId: id, treatment: parsed.data.treatment });
    res.json({ success: true, data: risk });
  } catch (error: unknown) {
    logger.error('Failed to assign treatment', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to assign treatment' });
  }
});

export default router;
