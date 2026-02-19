import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-iso42001');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `AI42-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const aiSystemCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(4000),
  category: z.enum([
    'MACHINE_LEARNING',
    'DEEP_LEARNING',
    'NATURAL_LANGUAGE_PROCESSING',
    'COMPUTER_VISION',
    'ROBOTICS',
    'EXPERT_SYSTEM',
    'GENERATIVE_AI',
    'RECOMMENDATION_SYSTEM',
    'SPEECH_RECOGNITION',
    'OTHER',
  ]),
  riskTier: z.enum(['UNACCEPTABLE', 'HIGH', 'LIMITED', 'MINIMAL']),
  purpose: z.string().trim().max(2000).optional().nullable(),
  vendor: z.string().trim().max(200).optional().nullable(),
  version: z.string().trim().max(50).optional().nullable(),
  deploymentDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  owner: z.string().trim().max(200).optional().nullable(),
  department: z.string().trim().max(200).optional().nullable(),
  dataTypes: z.string().trim().max(2000).optional().nullable(),
  userBase: z.string().trim().max(1000).optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
});

const aiSystemUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(4000).optional(),
  category: z
    .enum([
      'MACHINE_LEARNING',
      'DEEP_LEARNING',
      'NATURAL_LANGUAGE_PROCESSING',
      'COMPUTER_VISION',
      'ROBOTICS',
      'EXPERT_SYSTEM',
      'GENERATIVE_AI',
      'RECOMMENDATION_SYSTEM',
      'SPEECH_RECOGNITION',
      'OTHER',
    ])
    .optional(),
  riskTier: z.enum(['UNACCEPTABLE', 'HIGH', 'LIMITED', 'MINIMAL']).optional(),
  status: z
    .enum(['ACTIVE', 'INACTIVE', 'DEVELOPMENT', 'DECOMMISSIONED', 'UNDER_REVIEW'])
    .optional(),
  purpose: z.string().trim().max(2000).optional().nullable(),
  vendor: z.string().trim().max(200).optional().nullable(),
  version: z.string().trim().max(50).optional().nullable(),
  deploymentDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  owner: z.string().trim().max(200).optional().nullable(),
  department: z.string().trim().max(200).optional().nullable(),
  dataTypes: z.string().trim().max(2000).optional().nullable(),
  userBase: z.string().trim().max(1000).optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET / — List AI systems
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, category, riskTier, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (category && typeof category === 'string') {
      where.category = category;
    }
    if (riskTier && typeof riskTier === 'string') {
      where.riskTier = riskTier;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [systems, total] = await Promise.all([
      prisma.aiSystem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aiSystem.count({ where }),
    ]);

    res.json({
      success: true,
      data: systems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list AI systems', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list AI systems' },
    });
  }
});

// POST / — Create AI system
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = aiSystemCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
    }

    const authReq = req as AuthRequest;
    const reference = generateReference('SYS');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const system = await prisma.aiSystem.create({
      data: {
        reference: reference,
        name: parsed.data.name,
        description: parsed.data.description,
        category: parsed.data.category as any,
        riskTier: parsed.data.riskTier as any,
        status: 'ACTIVE' as any,
        purpose: parsed.data.purpose ?? null,
        vendor: parsed.data.vendor ?? null,
        version: parsed.data.version ?? null,
        deploymentDate: parsed.data.deploymentDate ? new Date(parsed.data.deploymentDate) : null,
        owner: parsed.data.owner ?? null,
        department: parsed.data.department ?? null,
        dataTypes: parsed.data.dataTypes ?? null,
        userBase: parsed.data.userBase ?? null,
        notes: parsed.data.notes ?? null,
        organisationId: (authReq.user as { organisationId?: string })?.organisationId || 'default',
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('AI system created', { systemId: system.id, reference });
    res.status(201).json({ success: true, data: system });
  } catch (error: unknown) {
    logger.error('Failed to create AI system', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create AI system' },
    });
  }
});

// GET /:id/risks — Risks for a specific AI system
router.get('/:id/risks', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const system = await prisma.aiSystem.findFirst({ where: { id, deletedAt: null } });
    if (!system) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'AI system not found' } });
    }

    const risks = await prisma.aiRiskAssessment.findMany({
      where: { systemId: id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    res.json({ success: true, data: risks });
  } catch (error: unknown) {
    logger.error('Failed to get risks for AI system', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get risks for AI system' },
    });
  }
});

// GET /:id/incidents — Incidents for a specific AI system
router.get('/:id/incidents', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const system = await prisma.aiSystem.findFirst({ where: { id, deletedAt: null } });
    if (!system) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'AI system not found' } });
    }

    const incidents = await prisma.aiIncident.findMany({
      where: { systemId: id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    res.json({ success: true, data: incidents });
  } catch (error: unknown) {
    logger.error('Failed to get incidents for AI system', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get incidents for AI system' },
    });
  }
});

// GET /:id — Get AI system by ID
const RESERVED_PATHS = new Set(['risks', 'incidents']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const system = await prisma.aiSystem.findFirst({
      where: { id, deletedAt: null },
    });

    if (!system) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'AI system not found' } });
    }

    res.json({ success: true, data: system });
  } catch (error: unknown) {
    logger.error('Failed to get AI system', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get AI system' },
    });
  }
});

// PUT /:id — Update AI system
router.put('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const parsed = aiSystemUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await prisma.aiSystem.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'AI system not found' } });
    }

    const authReq = req as AuthRequest;
    const system = await prisma.aiSystem.update({
      where: { id },
      data: {
        ...(parsed.data as any),
        deploymentDate:
          parsed.data.deploymentDate !== undefined
            ? parsed.data.deploymentDate
              ? new Date(parsed.data.deploymentDate)
              : null
            : undefined,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
    });

    logger.info('AI system updated', { systemId: id });
    res.json({ success: true, data: system });
  } catch (error: unknown) {
    logger.error('Failed to update AI system', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update AI system' },
    });
  }
});

// DELETE /:id — Soft delete AI system
router.delete('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const existing = await prisma.aiSystem.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'AI system not found' } });
    }

    const authReq = req as AuthRequest;
    await prisma.aiSystem.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: authReq.user?.id || 'system',
      },
    });

    logger.info('AI system soft-deleted', { systemId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete AI system', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete AI system' },
    });
  }
});

export default router;
