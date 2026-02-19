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

const declarationCreateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  scope: z.string().trim().min(1).max(4000),
  conformanceStatement: z.string().trim().min(1).max(10000),
  standard: z.string().trim().max(100).optional().default('ISO 42001:2023'),
  declarationDate: z
    .string()
    .trim()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  validUntil: z.string().trim().optional().nullable(),
  signedBy: z.string().trim().max(200).optional().nullable(),
  exclusions: z.string().trim().max(4000).optional().nullable(),
  supportingEvidence: z.string().trim().max(4000).optional().nullable(),
  notes: z.string().trim().max(4000).optional().nullable(),
});

const declarationUpdateSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  scope: z.string().trim().min(1).max(4000).optional(),
  conformanceStatement: z.string().trim().min(1).max(10000).optional(),
  standard: z.string().trim().max(100).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'EXPIRED']).optional(),
  declarationDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  validUntil: z.string().trim().optional().nullable(),
  signedBy: z.string().trim().max(200).optional().nullable(),
  exclusions: z.string().trim().max(4000).optional().nullable(),
  supportingEvidence: z.string().trim().max(4000).optional().nullable(),
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

// GET / — List self-declarations
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { scope: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [declarations, total] = await Promise.all([
      prisma.aiSelfDeclaration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aiSelfDeclaration.count({ where }),
    ]);

    res.json({
      success: true,
      data: declarations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list self-declarations', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list self-declarations' },
    });
  }
});

// POST / — Create self-declaration
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = declarationCreateSchema.safeParse(req.body);
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
    const reference = generateReference('DEC');

    const declaration = await prisma.aiSelfDeclaration.create({
      data: {
        reference: reference as any,
        title: parsed.data.title,
        scope: parsed.data.scope,
        conformanceStatement: parsed.data.conformanceStatement,
        standard: parsed.data.standard || 'ISO 42001:2023',
        status: 'DRAFT',
        declarationDate: new Date(parsed.data.declarationDate),
        validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
        signedBy: parsed.data.signedBy ?? null,
        exclusions: parsed.data.exclusions ?? null,
        supportingEvidence: parsed.data.supportingEvidence ?? null,
        notes: parsed.data.notes ?? null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Self-declaration created', { declarationId: declaration.id, reference });
    res.status(201).json({ success: true, data: declaration });
  } catch (error: unknown) {
    logger.error('Failed to create self-declaration', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create self-declaration' },
    });
  }
});

// PUT /:id/publish — Publish self-declaration
router.put('/:id/publish', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.aiSelfDeclaration.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Self-declaration not found' },
      });
    }

    if (existing.status === 'PUBLISHED') {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_PUBLISHED', message: 'Self-declaration is already published' },
      });
    }

    const authReq = req as AuthRequest;
    const declaration = await prisma.aiSelfDeclaration.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        signedBy:
          (z.string().trim().uuid().safeParse(req.body?.signedBy).success
            ? req.body.signedBy
            : null) ||
          authReq.user?.id ||
          existing.signedBy,
        publishedAt: new Date(),
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
    });

    logger.info('Self-declaration published', { declarationId: id });
    res.json({ success: true, data: declaration });
  } catch (error: unknown) {
    logger.error('Failed to publish self-declaration', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to publish self-declaration' },
    });
  }
});

// GET /:id — Get self-declaration by ID
const RESERVED_PATHS = new Set(['publish']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const declaration = await prisma.aiSelfDeclaration.findFirst({
      where: { id, deletedAt: null },
    });

    if (!declaration) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Self-declaration not found' },
      });
    }

    res.json({ success: true, data: declaration });
  } catch (error: unknown) {
    logger.error('Failed to get self-declaration', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get self-declaration' },
    });
  }
});

// PUT /:id — Update self-declaration
router.put('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const parsed = declarationUpdateSchema.safeParse(req.body);
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

    const existing = await prisma.aiSelfDeclaration.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Self-declaration not found' },
      });
    }

    const authReq = req as AuthRequest;
    const declaration = await prisma.aiSelfDeclaration.update({
      where: { id },
      data: {
        ...parsed.data,
        declarationDate: parsed.data.declarationDate
          ? new Date(parsed.data.declarationDate)
          : undefined,
        validUntil:
          parsed.data.validUntil !== undefined
            ? parsed.data.validUntil
              ? new Date(parsed.data.validUntil)
              : null
            : undefined,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
    });

    logger.info('Self-declaration updated', { declarationId: id });
    res.json({ success: true, data: declaration });
  } catch (error: unknown) {
    logger.error('Failed to update self-declaration', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update self-declaration' },
    });
  }
});

// DELETE /:id — Soft delete self-declaration
router.delete('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const existing = await prisma.aiSelfDeclaration.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Self-declaration not found' },
      });
    }

    const authReq = req as AuthRequest;
    await prisma.aiSelfDeclaration.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Self-declaration soft-deleted', { declarationId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete self-declaration', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete self-declaration' },
    });
  }
});

export default router;
