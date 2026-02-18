import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-quality');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-REL';
  const count = await prisma.qualRelease.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

const createSchema = z.object({
  productName: z.string().trim().min(1).max(300),
  productId: z.string().max(100).optional().nullable(),
  batchNumber: z.string().max(200).optional().nullable(),
  releaseStage: z.string().max(200).optional().nullable(),
  inspectionCriteria: z.string().max(5000).optional().nullable(),
  testResults: z.string().max(10000).optional().nullable(),
  decision: z.enum(['APPROVED', 'REJECTED', 'CONDITIONAL', 'ON_HOLD']).optional(),
  conditions: z.string().max(5000).optional().nullable(),
  nonconformanceRef: z.string().max(200).optional().nullable(),
  evidence: z.string().max(5000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

const updateSchema = createSchema.partial();

const authoriseSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED', 'CONDITIONAL']),
  conditions: z.string().max(5000).optional().nullable(),
});

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// GET /
router.get('/', async (req: Request, res: Response) => {
  try {
    const { decision, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (decision && typeof decision === 'string') where.decision = decision;
    if (search && typeof search === 'string') {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { batchNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.qualRelease.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.qualRelease.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list releases', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list releases' } });
  }
});

// POST /
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;
    const referenceNumber = await generateRefNumber();

    const item = await prisma.qualRelease.create({
      data: {
        referenceNumber,
        ...parsed.data,
        decision: parsed.data.decision || 'ON_HOLD',
        organisationId: (authReq.user as any)?.organisationId || 'default',
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to create release', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create release' } });
  }
});

// PUT /:id/authorise — Authorise release decision
router.put('/:id/authorise', async (req: Request, res: Response) => {
  try {
    const parsed = authoriseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.qualRelease.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Release not found' } });

    const authReq = req as AuthRequest;
    const item = await prisma.qualRelease.update({
      where: { id: req.params.id },
      data: {
        decision: parsed.data.decision,
        conditions: parsed.data.conditions ?? null,
        authorisedBy: authReq.user?.email || authReq.user?.id || 'system',
        authorisedAt: new Date(),
      },
    });

    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to authorise release', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to authorise release' } });
  }
});

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.qualRelease.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Release not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to get release', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get release' } });
  }
});

// PUT /:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.qualRelease.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Release not found' } });

    const item = await prisma.qualRelease.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to update release', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update release' } });
  }
});

// DELETE /:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.qualRelease.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Release not found' } });

    await prisma.qualRelease.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete release', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete release' } });
  }
});

export default router;
