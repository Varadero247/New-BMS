import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-quality');
const router: Router = Router();
router.use(authenticate);

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-RAC';
  const count = await prisma.qualRaci.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

const createSchema = z.object({
  processName: z.string().min(1).max(300),
  processId: z.string().max(100).optional().nullable(),
  activityName: z.string().min(1).max(300),
  roleName: z.string().min(1).max(200),
  personName: z.string().max(200).optional().nullable(),
  raciType: z.enum(['RESPONSIBLE', 'ACCOUNTABLE', 'CONSULTED', 'INFORMED']),
  notes: z.string().max(5000).optional().nullable(),
});

const updateSchema = createSchema.partial();

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// GET / — List RACI entries (optionally filtered by process)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { processId, raciType, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (processId && typeof processId === 'string') where.processId = processId;
    if (raciType && typeof raciType === 'string') where.raciType = raciType;
    if (search && typeof search === 'string') {
      where.OR = [
        { processName: { contains: search, mode: 'insensitive' } },
        { activityName: { contains: search, mode: 'insensitive' } },
        { roleName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.qualRaci.findMany({ where, skip, take: limit, orderBy: [{ processName: 'asc' }, { activityName: 'asc' }] }),
      prisma.qualRaci.count({ where }),
    ]);

    res.json({ success: true, data: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list RACI entries', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list RACI entries' } });
  }
});

// GET /matrix — Pivot-style matrix grouped by process+activity
router.get('/matrix', async (req: Request, res: Response) => {
  try {
    const { processId } = req.query;
    const where: Record<string, unknown> = { deletedAt: null };
    if (processId && typeof processId === 'string') where.processId = processId;

    const entries = await prisma.qualRaci.findMany({
      where,
      orderBy: [{ processName: 'asc' }, { activityName: 'asc' }],
      take: 500,
    });

    // Group by process → activity → roles
    const matrix: Record<string, Record<string, Array<{ roleName: string; personName: string | null; raciType: string }>>> = {};
    for (const e of entries) {
      if (!matrix[e.processName]) matrix[e.processName] = {};
      if (!matrix[e.processName][e.activityName]) matrix[e.processName][e.activityName] = [];
      matrix[e.processName][e.activityName].push({ roleName: e.roleName, personName: e.personName, raciType: e.raciType });
    }

    res.json({ success: true, data: matrix });
  } catch (error: unknown) {
    logger.error('Failed to generate RACI matrix', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate RACI matrix' } });
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

    const item = await prisma.qualRaci.create({
      data: {
        referenceNumber,
        ...parsed.data,
        organisationId: (authReq.user as any)?.organisationId || 'default',
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to create RACI entry', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create RACI entry' } });
  }
});

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.qualRaci.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'RACI entry not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to get RACI entry', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get RACI entry' } });
  }
});

// PUT /:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.qualRaci.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'RACI entry not found' } });

    const item = await prisma.qualRaci.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to update RACI entry', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update RACI entry' } });
  }
});

// DELETE /:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.qualRaci.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'RACI entry not found' } });

    await prisma.qualRaci.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete RACI entry', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete RACI entry' } });
  }
});

export default router;
