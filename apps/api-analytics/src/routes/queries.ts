import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-analytics');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const queryCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  sql: z.string().min(1),
  parameters: z.record(z.any()).optional().nullable(),
  isPublic: z.boolean().optional().default(false),
});

const queryUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  sql: z.string().min(1).optional(),
  parameters: z.record(z.any()).optional().nullable(),
  isPublic: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ===================================================================
// GET /api/queries — List queries
// ===================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { owner, isPublic, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (owner === 'me') {
      where.ownerId = authReq.user!.id;
    } else if (typeof owner === 'string' && owner.length > 0) {
      where.ownerId = owner;
    }

    if (isPublic === 'true') where.isPublic = true;
    if (isPublic === 'false') where.isPublic = false;

    if (typeof search === 'string' && search.length > 0) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [queries, total] = await Promise.all([
      prisma.analyticsQuery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.analyticsQuery.count({ where }),
    ]);

    res.json({
      success: true,
      data: queries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list queries', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list queries' } });
  }
});

// ===================================================================
// POST /api/queries — Create query
// ===================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = queryCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const data = parsed.data;
    const query = await prisma.analyticsQuery.create({
      data: {
        name: data.name,
        description: data.description || null,
        sql: data.sql,
        parameters: data.parameters || null,
        isPublic: data.isPublic,
        ownerId: authReq.user!.id,
        createdBy: authReq.user!.id,
      },
    });

    logger.info('Query created', { id: query.id, name: query.name });
    res.status(201).json({ success: true, data: query });
  } catch (error: unknown) {
    logger.error('Failed to create query', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create query' } });
  }
});

// ===================================================================
// POST /api/queries/:id/execute — Execute query
// ===================================================================

router.post('/:id/execute', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = await prisma.analyticsQuery.findFirst({ where: { id, deletedAt: null } });
    if (!query) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Query not found' } });
    }

    const startTime = Date.now();

    // Simulate query execution with mock results
    const mockResults = {
      columns: ['id', 'name', 'value'],
      rows: [
        { id: 1, name: 'Sample 1', value: 100 },
        { id: 2, name: 'Sample 2', value: 200 },
      ],
      rowCount: 2,
    };

    const executionMs = Date.now() - startTime;

    // Update last run and avg execution time
    await prisma.analyticsQuery.update({
      where: { id },
      data: {
        lastRun: new Date(),
        avgExecutionMs: executionMs,
      },
    });

    logger.info('Query executed', { id, executionMs });
    res.json({ success: true, data: { query: query.sql, results: mockResults, executionMs } });
  } catch (error: unknown) {
    logger.error('Failed to execute query', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to execute query' } });
  }
});

// ===================================================================
// GET /api/queries/:id — Get query by ID
// ===================================================================

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const query = await prisma.analyticsQuery.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!query) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Query not found' } });
    }

    res.json({ success: true, data: query });
  } catch (error: unknown) {
    logger.error('Failed to get query', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get query' } });
  }
});

// ===================================================================
// PUT /api/queries/:id — Update query
// ===================================================================

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsQuery.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Query not found' } });
    }

    const parsed = queryUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const updated = await prisma.analyticsQuery.update({
      where: { id },
      data: parsed.data,
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to update query', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update query' } });
  }
});

// ===================================================================
// DELETE /api/queries/:id — Soft delete query
// ===================================================================

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsQuery.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Query not found' } });
    }

    await prisma.analyticsQuery.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Query deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete query', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete query' } });
  }
});

export default router;
