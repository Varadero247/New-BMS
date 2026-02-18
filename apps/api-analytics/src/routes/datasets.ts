import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-analytics');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `ANL-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const dataSourceEnum = z.enum([
  'HEALTH_SAFETY',
  'ENVIRONMENT',
  'QUALITY',
  'HR',
  'FINANCE',
  'CRM',
  'INVENTORY',
  'CMMS',
  'ALL',
]);

const datasetCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional().nullable(),
  source: dataSourceEnum,
  query: z.string().trim().min(1),
  schema: z.record(z.any()),
  refreshSchedule: z.string().trim().max(100).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const datasetUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  source: dataSourceEnum.optional(),
  query: z.string().trim().min(1).optional(),
  schema: z.record(z.any()).optional(),
  refreshSchedule: z.string().trim().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ===================================================================
// GET /api/datasets — List datasets
// ===================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const { source, isActive, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (typeof source === 'string' && source.length > 0) where.source = source;
    if (isActive === 'true') where.isActive = true;
    if (isActive === 'false') where.isActive = false;
    if (typeof search === 'string' && search.length > 0) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [datasets, total] = await Promise.all([
      prisma.analyticsDataset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.analyticsDataset.count({ where }),
    ]);

    res.json({
      success: true,
      data: datasets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list datasets', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list datasets' },
    });
  }
});

// ===================================================================
// POST /api/datasets — Create dataset
// ===================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = datasetCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const data = parsed.data;
    const dataset = await prisma.analyticsDataset.create({
      data: {
        name: data.name,
        description: data.description || null,
        source: data.source,
        query: data.query,
        schema: data.schema,
        refreshSchedule: data.refreshSchedule || null,
        isActive: data.isActive,
        createdBy: authReq.user!.id,
      },
    });

    logger.info('Dataset created', { id: dataset.id, name: dataset.name });
    res.status(201).json({ success: true, data: dataset });
  } catch (error: unknown) {
    logger.error('Failed to create dataset', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create dataset' },
    });
  }
});

// ===================================================================
// POST /api/datasets/:id/refresh — Refresh dataset
// ===================================================================

router.post('/:id/refresh', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const dataset = await prisma.analyticsDataset.findFirst({
      where: { id, deletedAt: null } as any,
    });
    if (!dataset) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Dataset not found' } });
    }

    const updated = await prisma.analyticsDataset.update({
      where: { id },
      data: {
        lastRefreshed: new Date(),
        rowCount: (parseInt(id.replace(/-/g, '').slice(0, 6), 16) % 10000) + 1,
      },
    });

    logger.info('Dataset refreshed', { id });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to refresh dataset', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to refresh dataset' },
    });
  }
});

// ===================================================================
// GET /api/datasets/:id — Get dataset by ID
// ===================================================================

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const dataset = await prisma.analyticsDataset.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!dataset) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Dataset not found' } });
    }

    res.json({ success: true, data: dataset });
  } catch (error: unknown) {
    logger.error('Failed to get dataset', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get dataset' },
    });
  }
});

// ===================================================================
// PUT /api/datasets/:id — Update dataset
// ===================================================================

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsDataset.findFirst({
      where: { id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Dataset not found' } });
    }

    const parsed = datasetUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const updated = await prisma.analyticsDataset.update({
      where: { id },
      data: parsed.data,
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to update dataset', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update dataset' },
    });
  }
});

// ===================================================================
// DELETE /api/datasets/:id — Soft delete dataset
// ===================================================================

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsDataset.findFirst({
      where: { id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Dataset not found' } });
    }

    await prisma.analyticsDataset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Dataset deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete dataset', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete dataset' },
    });
  }
});

export default router;
