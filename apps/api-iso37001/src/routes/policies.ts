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

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const policyCreateSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().min(1),
  policyType: z.enum([
    'ANTI_BRIBERY_POLICY',
    'GIFTS_HOSPITALITY_POLICY',
    'WHISTLEBLOWING_POLICY',
    'CONFLICTS_OF_INTEREST',
    'THIRD_PARTY_MANAGEMENT',
    'FACILITATION_PAYMENTS',
    'POLITICAL_CONTRIBUTIONS',
    'CHARITABLE_DONATIONS',
    'SPONSORSHIPS',
    'OTHER',
  ]),
  version: z.string().max(20).optional(),
  effectiveDate: z.string().optional(),
  reviewDate: z.string().optional(),
  scope: z.string().max(2000).optional(),
  owner: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

const policyUpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  content: z.string().min(1).optional(),
  policyType: z.enum([
    'ANTI_BRIBERY_POLICY',
    'GIFTS_HOSPITALITY_POLICY',
    'WHISTLEBLOWING_POLICY',
    'CONFLICTS_OF_INTEREST',
    'THIRD_PARTY_MANAGEMENT',
    'FACILITATION_PAYMENTS',
    'POLITICAL_CONTRIBUTIONS',
    'CHARITABLE_DONATIONS',
    'SPONSORSHIPS',
    'OTHER',
  ]).optional(),
  version: z.string().max(20).optional(),
  effectiveDate: z.string().optional(),
  reviewDate: z.string().optional(),
  scope: z.string().max(2000).optional(),
  owner: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
  status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'SUPERSEDED', 'ARCHIVED']).optional(),
});

// ---------------------------------------------------------------------------
// Reserved paths for /:id routes
// ---------------------------------------------------------------------------

const RESERVED_PATHS = new Set(['health', 'stats', 'export']);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET / — List policies
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, policyType, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
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
        { referenceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [policies, total] = await Promise.all([
      prisma.abPolicy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.abPolicy.count({ where }),
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
    logger.error('Failed to list policies', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list policies' } });
  }
});

// POST / — Create policy
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = policyCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const userId = (req as AuthRequest).user?.id || 'system';
    const referenceNumber = generateReference('POL');

    const policy = await prisma.abPolicy.create({
      data: {
        ...parsed.data,
        referenceNumber,
        status: 'DRAFT',
        createdBy: userId,
        updatedBy: userId,
      } as any,
    });

    logger.info('Policy created', { id: policy.id, referenceNumber });
    res.status(201).json({ success: true, data: policy });
  } catch (error: unknown) {
    logger.error('Failed to create policy', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create policy' } });
  }
});

// GET /:id — Get policy by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');

    const policy = await prisma.abPolicy.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!policy) {
      return res.status(404).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Policy not found' } });
    }

    res.json({ success: true, data: policy });
  } catch (error: unknown) {
    logger.error('Failed to get policy', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get policy' } });
  }
});

// PUT /:id — Update policy
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');

    const parsed = policyUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const existing = await prisma.abPolicy.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Policy not found' } });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    const policy = await prisma.abPolicy.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        updatedBy: userId,
      } as any,
    });

    logger.info('Policy updated', { id: policy.id });
    res.json({ success: true, data: policy });
  } catch (error: unknown) {
    logger.error('Failed to update policy', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update policy' } });
  }
});

// PUT /:id/approve — Approve policy
router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.abPolicy.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Policy not found' } });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    const policy = await prisma.abPolicy.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date(),
        updatedBy: userId,
      } as any,
    });

    logger.info('Policy approved', { id: policy.id });
    res.json({ success: true, data: policy });
  } catch (error: unknown) {
    logger.error('Failed to approve policy', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve policy' } });
  }
});

// DELETE /:id — Soft delete policy
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.abPolicy.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Policy not found' } });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    await prisma.abPolicy.update({
      where: { id: req.params.id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      } as any,
    });

    logger.info('Policy deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Policy deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete policy', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete policy' } });
  }
});

export default router;
