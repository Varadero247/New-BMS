import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-analytics');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ANL-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const exportCreateSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['FULL', 'FILTERED', 'CUSTOM']),
  format: z.enum(['PDF', 'EXCEL', 'CSV', 'HTML']),
  filters: z.record(z.any()).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ===================================================================
// GET /api/exports — List exports
// ===================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, format, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (typeof status === 'string' && status.length > 0) where.status = status;
    if (typeof format === 'string' && format.length > 0) where.format = format;
    if (typeof search === 'string' && search.length > 0) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [exports, total] = await Promise.all([
      prisma.analyticsExport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.analyticsExport.count({ where }),
    ]);

    res.json({
      success: true,
      data: exports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list exports', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list exports' } });
  }
});

// ===================================================================
// POST /api/exports — Request new export
// ===================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = exportCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const data = parsed.data;
    const exportRecord = await prisma.analyticsExport.create({
      data: {
        name: data.name,
        type: data.type,
        format: data.format,
        filters: (data.filters || null) as any,
        status: 'QUEUED',
        requestedBy: authReq.user!.id,
        createdBy: authReq.user!.id,
      },
    });

    logger.info('Export requested', { id: exportRecord.id, name: exportRecord.name });
    res.status(201).json({ success: true, data: exportRecord });
  } catch (error: unknown) {
    logger.error('Failed to create export', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create export' } });
  }
});

// ===================================================================
// GET /api/exports/:id/download — Download export file
// ===================================================================

router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const exportRecord = await prisma.analyticsExport.findFirst({
      where: { id, deletedAt: null } as any,
    });

    if (!exportRecord) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Export not found' } });
    }

    if (exportRecord.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, error: { code: 'NOT_READY', message: 'Export is not yet completed' } });
    }

    if (!exportRecord.fileUrl) {
      return res.status(404).json({ success: false, error: { code: 'NO_FILE', message: 'Export file not available' } });
    }

    res.json({ success: true, data: { downloadUrl: exportRecord.fileUrl, fileName: `${exportRecord.name}.${exportRecord.format.toLowerCase()}` } });
  } catch (error: unknown) {
    logger.error('Failed to download export', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to download export' } });
  }
});

// ===================================================================
// GET /api/exports/:id — Get export by ID
// ===================================================================

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const exportRecord = await prisma.analyticsExport.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!exportRecord) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Export not found' } });
    }

    res.json({ success: true, data: exportRecord });
  } catch (error: unknown) {
    logger.error('Failed to get export', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get export' } });
  }
});

// ===================================================================
// DELETE /api/exports/:id — Delete export
// ===================================================================

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsExport.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Export not found' } });
    }

    await prisma.analyticsExport.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Export deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete export', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete export' } });
  }
});

export default router;
