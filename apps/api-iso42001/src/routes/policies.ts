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

const policyCreateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  content: z.string().trim().min(1).max(50000),
  policyType: z.enum([
    'AI_GOVERNANCE',
    'DATA_MANAGEMENT',
    'ETHICS',
    'RISK_MANAGEMENT',
    'TRANSPARENCY',
    'HUMAN_OVERSIGHT',
    'SECURITY',
    'PRIVACY',
    'FAIRNESS',
    'ACCOUNTABILITY',
    'INCIDENT_RESPONSE',
    'THIRD_PARTY',
    'OTHER',
  ]),
  summary: z.string().trim().max(2000).optional().nullable(),
  scope: z.string().trim().max(2000).optional().nullable(),
  effectiveDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  reviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  owner: z.string().trim().max(200).optional().nullable(),
  department: z.string().trim().max(200).optional().nullable(),
  version: z.string().trim().max(50).optional().default('1.0'),
  notes: z.string().trim().max(4000).optional().nullable(),
});

const policyUpdateSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  content: z.string().trim().min(1).max(50000).optional(),
  policyType: z
    .enum([
      'AI_GOVERNANCE',
      'DATA_MANAGEMENT',
      'ETHICS',
      'RISK_MANAGEMENT',
      'TRANSPARENCY',
      'HUMAN_OVERSIGHT',
      'SECURITY',
      'PRIVACY',
      'FAIRNESS',
      'ACCOUNTABILITY',
      'INCIDENT_RESPONSE',
      'THIRD_PARTY',
      'OTHER',
    ])
    .optional(),
  summary: z.string().trim().max(2000).optional().nullable(),
  scope: z.string().trim().max(2000).optional().nullable(),
  effectiveDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  reviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  owner: z.string().trim().max(200).optional().nullable(),
  department: z.string().trim().max(200).optional().nullable(),
  version: z.string().trim().max(50).optional(),
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

// GET / — List policies
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, policyType, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (policyType && typeof policyType === 'string') {
      where.policyType = policyType;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [policies, total] = await Promise.all([
      prisma.aiPolicy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aiPolicy.count({ where }),
    ]);

    res.json({
      success: true,
      data: policies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list policies', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list policies' },
    });
  }
});

// POST / — Create policy
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = policyCreateSchema.safeParse(req.body);
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
    const reference = generateReference('POL');

    const policy = await prisma.aiPolicy.create({
      data: {
        reference: reference as string,
        title: parsed.data.title,
        content: parsed.data.content,
        policyType: parsed.data.policyType,
        status: 'DRAFT',
        summary: parsed.data.summary ?? null,
        scope: parsed.data.scope ?? null,
        effectiveDate: parsed.data.effectiveDate ? new Date(parsed.data.effectiveDate) : null,
        reviewDate: parsed.data.reviewDate ? new Date(parsed.data.reviewDate) : null,
        owner: parsed.data.owner ?? null,
        department: parsed.data.department ?? null,
        version: parsed.data.version || '1.0',
        notes: parsed.data.notes ?? null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('AI policy created', { policyId: policy.id, reference });
    res.status(201).json({ success: true, data: policy });
  } catch (error: unknown) {
    logger.error('Failed to create policy', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create policy' },
    });
  }
});

// PUT /:id/approve — Approve policy
router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.aiPolicy.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Policy not found' } });
    }

    if (existing.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_APPROVED', message: 'Policy is already approved' },
      });
    }

    const authReq = req as AuthRequest;
    const policy = await prisma.aiPolicy.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: authReq.user?.id || 'system',
        approvedAt: new Date(),
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
    });

    logger.info('AI policy approved', { policyId: id });
    res.json({ success: true, data: policy });
  } catch (error: unknown) {
    logger.error('Failed to approve policy', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to approve policy' },
    });
  }
});

// GET /:id — Get policy by ID
const RESERVED_PATHS = new Set(['approve']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const policy = await prisma.aiPolicy.findFirst({
      where: { id, deletedAt: null },
    });

    if (!policy) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Policy not found' } });
    }

    res.json({ success: true, data: policy });
  } catch (error: unknown) {
    logger.error('Failed to get policy', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get policy' } });
  }
});

// PUT /:id — Update policy
router.put('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const parsed = policyUpdateSchema.safeParse(req.body);
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

    const existing = await prisma.aiPolicy.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Policy not found' } });
    }

    const authReq = req as AuthRequest;
    const policy = await prisma.aiPolicy.update({
      where: { id },
      data: {
        ...parsed.data,
        effectiveDate:
          parsed.data.effectiveDate !== undefined
            ? parsed.data.effectiveDate
              ? new Date(parsed.data.effectiveDate)
              : null
            : undefined,
        reviewDate:
          parsed.data.reviewDate !== undefined
            ? parsed.data.reviewDate
              ? new Date(parsed.data.reviewDate)
              : null
            : undefined,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
    });

    logger.info('AI policy updated', { policyId: id });
    res.json({ success: true, data: policy });
  } catch (error: unknown) {
    logger.error('Failed to update policy', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update policy' },
    });
  }
});

// DELETE /:id — Soft delete policy
router.delete('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const existing = await prisma.aiPolicy.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Policy not found' } });
    }

    const authReq = req as AuthRequest;
    await prisma.aiPolicy.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: authReq.user?.id || 'system',
      },
    });

    logger.info('AI policy soft-deleted', { policyId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete policy', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete policy' },
    });
  }
});

export default router;
