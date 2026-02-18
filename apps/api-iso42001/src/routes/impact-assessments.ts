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

const impactCreateSchema = z.object({
  systemId: z.string().trim().uuid(),
  title: z.string().trim().min(1).max(300),
  description: z.string().max(10000).optional().nullable(),
  impactLevel: z.enum(['MINIMAL', 'LIMITED', 'SIGNIFICANT', 'HIGH', 'UNACCEPTABLE']).optional().default('LIMITED'),
  assessmentType: z.enum(['INITIAL', 'PERIODIC', 'CHANGE_TRIGGERED', 'INCIDENT_TRIGGERED']).optional().default('INITIAL'),
  scope: z.string().max(4000).optional().nullable(),
  methodology: z.string().max(4000).optional().nullable(),
  findings: z.string().max(10000).optional().nullable(),
  humanRightsImpact: z.string().max(4000).optional().nullable(),
  environmentalImpact: z.string().max(4000).optional().nullable(),
  socialImpact: z.string().max(4000).optional().nullable(),
  economicImpact: z.string().max(4000).optional().nullable(),
  mitigationMeasures: z.string().max(10000).optional().nullable(),
  residualRisk: z.string().max(4000).optional().nullable(),
  assessor: z.string().max(200).optional().nullable(),
  reviewDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

const impactUpdateSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  description: z.string().max(10000).optional().nullable(),
  impactLevel: z.enum(['MINIMAL', 'LIMITED', 'SIGNIFICANT', 'HIGH', 'UNACCEPTABLE']).optional(),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'ARCHIVED']).optional(),
  assessmentType: z.enum(['INITIAL', 'PERIODIC', 'CHANGE_TRIGGERED', 'INCIDENT_TRIGGERED']).optional(),
  scope: z.string().max(4000).optional().nullable(),
  methodology: z.string().max(4000).optional().nullable(),
  findings: z.string().max(10000).optional().nullable(),
  humanRightsImpact: z.string().max(4000).optional().nullable(),
  environmentalImpact: z.string().max(4000).optional().nullable(),
  socialImpact: z.string().max(4000).optional().nullable(),
  economicImpact: z.string().max(4000).optional().nullable(),
  mitigationMeasures: z.string().max(10000).optional().nullable(),
  residualRisk: z.string().max(4000).optional().nullable(),
  assessor: z.string().max(200).optional().nullable(),
  reviewDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
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

// GET / — List impact assessments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { systemId, impactLevel, status, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (systemId && typeof systemId === 'string') {
      where.systemId = systemId;
    }
    if (impactLevel && typeof impactLevel === 'string') {
      where.impactLevel = impactLevel;
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [assessments, total] = await Promise.all([
      prisma.aiImpactAssessment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          system: { select: { id: true, name: true, riskTier: true } },
        },
      }),
      prisma.aiImpactAssessment.count({ where }),
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
    logger.error('Failed to list impact assessments', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list impact assessments' } });
  }
});

// POST / — Create impact assessment
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = impactCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    // Verify system exists
    const system = await prisma.aiSystem.findFirst({ where: { id: parsed.data.systemId, deletedAt: null } as any });
    if (!system) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'AI system not found' } });
    }

    const authReq = req as AuthRequest;
    const reference = generateReference('IMP');

    const assessment = await prisma.aiImpactAssessment.create({
      data: {
        reference: reference as any,
        systemId: parsed.data.systemId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        impactLevel: (parsed.data.impactLevel || 'LIMITED') as any,
        status: 'DRAFT',
        assessmentType: parsed.data.assessmentType || 'INITIAL',
        scope: parsed.data.scope ?? null,
        methodology: parsed.data.methodology ?? null,
        findings: parsed.data.findings ?? null,
        humanRightsImpact: parsed.data.humanRightsImpact ?? null,
        environmentalImpact: parsed.data.environmentalImpact ?? null,
        socialImpact: parsed.data.socialImpact ?? null,
        economicImpact: parsed.data.economicImpact ?? null,
        mitigationMeasures: parsed.data.mitigationMeasures ?? null,
        residualRisk: parsed.data.residualRisk ?? null,
        assessor: parsed.data.assessor ?? null,
        reviewDate: parsed.data.reviewDate ? new Date(parsed.data.reviewDate) : null,
        notes: parsed.data.notes ?? null,
        createdBy: authReq.user?.id || 'system',
      } as any,
      include: {
        system: { select: { id: true, name: true } },
      },
    });

    logger.info('Impact assessment created', { assessmentId: assessment.id, reference });
    res.status(201).json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to create impact assessment', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create impact assessment' } });
  }
});

// PUT /:id/approve — Approve impact assessment
router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.aiImpactAssessment.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Impact assessment not found' } });
    }

    if (existing.status === 'APPROVED') {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_APPROVED', message: 'Impact assessment is already approved' } });
    }

    const authReq = req as AuthRequest;
    const assessment = await prisma.aiImpactAssessment.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: authReq.user?.id || 'system',
        approvedAt: new Date(),
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      } as any,
      include: {
        system: { select: { id: true, name: true } },
      },
    });

    logger.info('Impact assessment approved', { assessmentId: id });
    res.json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to approve impact assessment', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve impact assessment' } });
  }
});

// GET /:id — Get impact assessment by ID
const RESERVED_PATHS = new Set(['approve']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const assessment = await prisma.aiImpactAssessment.findFirst({
      where: { id, deletedAt: null } as any,
      include: {
        system: { select: { id: true, name: true, riskTier: true } },
      },
    });

    if (!assessment) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Impact assessment not found' } });
    }

    res.json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to get impact assessment', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get impact assessment' } });
  }
});

// PUT /:id — Update impact assessment
router.put('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const parsed = impactUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.aiImpactAssessment.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Impact assessment not found' } });
    }

    const authReq = req as AuthRequest;
    const assessment = await prisma.aiImpactAssessment.update({
      where: { id },
      data: {
        ...parsed.data,
        reviewDate: parsed.data.reviewDate !== undefined
          ? (parsed.data.reviewDate ? new Date(parsed.data.reviewDate) : null)
          : undefined,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      } as any,
      include: {
        system: { select: { id: true, name: true } },
      },
    });

    logger.info('Impact assessment updated', { assessmentId: id });
    res.json({ success: true, data: assessment });
  } catch (error: unknown) {
    logger.error('Failed to update impact assessment', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update impact assessment' } });
  }
});

// DELETE /:id — Soft delete impact assessment
router.delete('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const existing = await prisma.aiImpactAssessment.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Impact assessment not found' } });
    }

    const authReq = req as AuthRequest;
    await prisma.aiImpactAssessment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: authReq.user?.id || 'system',
      } as any,
    });

    logger.info('Impact assessment soft-deleted', { assessmentId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete impact assessment', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete impact assessment' } });
  }
});

export default router;
