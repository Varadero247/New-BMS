import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-iso37001');
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
  return `AB-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const dueDiligenceCreateSchema = z.object({
  thirdPartyName: z.string().trim().min(1).max(300),
  thirdPartyType: z.enum([
    'SUPPLIER',
    'AGENT',
    'INTERMEDIARY',
    'CONSULTANT',
    'JOINT_VENTURE_PARTNER',
    'CONTRACTOR',
    'DISTRIBUTOR',
    'GOVERNMENT_ENTITY',
    'OTHER',
  ]),
  level: z.enum(['BASIC', 'STANDARD', 'ENHANCED']),
  country: z.string().trim().min(1).max(100),
  industry: z.string().trim().max(200).optional(),
  contactName: z.string().trim().max(200).optional(),
  contactEmail: z.string().trim().email().optional(),
  contractValue: z.number().optional(),
  currency: z.string().trim().length(3).default('USD'),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  notes: z.string().trim().max(5000).optional(),
  scopeOfEngagement: z.string().trim().max(2000).optional(),
});

const dueDiligenceUpdateSchema = z.object({
  thirdPartyName: z.string().trim().min(1).max(300).optional(),
  thirdPartyType: z
    .enum([
      'SUPPLIER',
      'AGENT',
      'INTERMEDIARY',
      'CONSULTANT',
      'JOINT_VENTURE_PARTNER',
      'CONTRACTOR',
      'DISTRIBUTOR',
      'GOVERNMENT_ENTITY',
      'OTHER',
    ])
    .optional(),
  level: z.enum(['BASIC', 'STANDARD', 'ENHANCED']).optional(),
  country: z.string().trim().min(1).max(100).optional(),
  industry: z.string().trim().max(200).optional(),
  contactName: z.string().trim().max(200).optional(),
  contactEmail: z.string().trim().email().optional(),
  contractValue: z.number().optional(),
  currency: z.string().trim().length(3).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  notes: z.string().trim().max(5000).optional(),
  scopeOfEngagement: z.string().trim().max(2000).optional(),
});

const completeSchema = z.object({
  findings: z.string().trim().min(1).max(5000),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  recommendation: z
    .enum(['APPROVE', 'APPROVE_WITH_CONDITIONS', 'REJECT', 'FURTHER_REVIEW'])
    .optional(),
  conditions: z.string().trim().max(2000).optional(),
});

// ---------------------------------------------------------------------------
// Reserved paths for /:id routes
// ---------------------------------------------------------------------------

const RESERVED_PATHS = new Set(['health', 'stats', 'export']);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET / — List due diligence assessments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { thirdPartyType, status, riskLevel, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (thirdPartyType && typeof thirdPartyType === 'string') {
      where.thirdPartyType = thirdPartyType;
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (riskLevel && typeof riskLevel === 'string') {
      where.riskLevel = riskLevel;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { thirdPartyName: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [assessments, total] = await Promise.all([
      prisma.abDueDiligence.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.abDueDiligence.count({ where }),
    ]);

    res.json({
      success: true,
      data: assessments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list due diligence assessments', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list due diligence assessments' },
    });
  }
});

// POST / — Create due diligence assessment
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = dueDiligenceCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const userId = (req as AuthRequest).user?.id || 'system';
    const referenceNumber = generateReference('DD');

    const assessment = await prisma.abDueDiligence.create({
      data: {
        ...parsed.data,
        referenceNumber,
        status: 'PENDING',
        createdBy: userId,
        updatedBy: userId,
      } as any,
    });

    logger.info('Due diligence assessment created', { id: assessment.id, referenceNumber });
    res.status(201).json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to create due diligence assessment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create due diligence assessment' },
    });
  }
});

// GET /:id — Get by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');

    const assessment = await prisma.abDueDiligence.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Due diligence assessment not found' },
      });
    }

    res.json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to get due diligence assessment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get due diligence assessment' },
    });
  }
});

// PUT /:id — Update
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');

    const parsed = dueDiligenceUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const existing = await prisma.abDueDiligence.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Due diligence assessment not found' },
      });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    const assessment = await prisma.abDueDiligence.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        updatedBy: userId,
      } as any,
    });

    logger.info('Due diligence assessment updated', { id: assessment.id });
    res.json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to update due diligence assessment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update due diligence assessment' },
    });
  }
});

// PUT /:id/complete — Mark assessment as completed with findings
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const parsed = completeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const existing = await prisma.abDueDiligence.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Due diligence assessment not found' },
      });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    const assessment = await prisma.abDueDiligence.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        findings: parsed.data.findings,
        riskLevel: parsed.data.riskLevel as any,
        recommendation: parsed.data.recommendation,
        conditions: parsed.data.conditions,
        completedAt: new Date(),
        completedBy: userId,
        updatedBy: userId,
      } as any,
    });

    logger.info('Due diligence assessment completed', { id: assessment.id });
    res.json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to complete due diligence assessment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to complete due diligence assessment' },
    });
  }
});

// PUT /:id/expire — Mark as expired
router.put('/:id/expire', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.abDueDiligence.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Due diligence assessment not found' },
      });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    const assessment = await prisma.abDueDiligence.update({
      where: { id: req.params.id },
      data: {
        status: 'EXPIRED',
        updatedBy: userId,
      } as any,
    });

    logger.info('Due diligence assessment expired', { id: assessment.id });
    res.json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to expire due diligence assessment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to expire due diligence assessment' },
    });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.abDueDiligence.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Due diligence assessment not found' },
      });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    await prisma.abDueDiligence.update({
      where: { id: req.params.id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      } as any,
    });

    logger.info('Due diligence assessment deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Due diligence assessment deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete due diligence assessment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete due diligence assessment' },
    });
  }
});

export default router;
