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
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `ANL-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const reportCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  type: z.enum(['SCHEDULED', 'AD_HOC', 'TEMPLATE']),
  format: z.enum(['PDF', 'EXCEL', 'CSV', 'HTML']),
  schedule: z.record(z.any()).optional().nullable(),
  query: z.record(z.any()),
  filters: z.record(z.any()).optional().nullable(),
  recipients: z.array(z.string()).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const reportUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  type: z.enum(['SCHEDULED', 'AD_HOC', 'TEMPLATE']).optional(),
  format: z.enum(['PDF', 'EXCEL', 'CSV', 'HTML']).optional(),
  schedule: z.record(z.any()).optional().nullable(),
  query: z.record(z.any()).optional(),
  filters: z.record(z.any()).optional().nullable(),
  recipients: z.array(z.string()).optional().nullable(),
  isActive: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const RESERVED_PATHS = new Set(['runs']);

// ===================================================================
// GET /api/reports — List reports
// ===================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, isActive, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (typeof type === 'string' && type.length > 0) where.type = type;
    if (isActive === 'true') where.isActive = true;
    if (isActive === 'false') where.isActive = false;
    if (typeof search === 'string' && search.length > 0) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [reports, total] = await Promise.all([
      prisma.analyticsReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.analyticsReport.count({ where }),
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list reports', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list reports' } });
  }
});

// ===================================================================
// POST /api/reports — Create report
// ===================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = reportCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const data = parsed.data;
    const report = await prisma.analyticsReport.create({
      data: {
        name: data.name,
        description: data.description || null,
        type: data.type,
        format: data.format,
        schedule: (data.schedule || null) as any,
        query: data.query as any,
        filters: (data.filters || null) as any,
        recipients: (data.recipients || null) as any,
        isActive: data.isActive,
        createdBy: authReq.user!.id,
      },
    });

    logger.info('Report created', { id: report.id, name: report.name });
    res.status(201).json({ success: true, data: report });
  } catch (error: unknown) {
    logger.error('Failed to create report', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create report' } });
  }
});

// ===================================================================
// POST /api/reports/:id/run — Execute report
// ===================================================================

router.post('/:id/run', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    const report = await prisma.analyticsReport.findFirst({ where: { id, deletedAt: null } as any });
    if (!report) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    }

    const run = await prisma.analyticsReportRun.create({
      data: {
        reportId: id,
        status: 'QUEUED',
        parameters: req.body.parameters || null,
        createdBy: authReq.user!.id,
      },
    });

    // Update last generated
    await prisma.analyticsReport.update({
      where: { id },
      data: { lastGenerated: new Date() },
    });

    logger.info('Report run queued', { reportId: id, runId: run.id });
    res.status(201).json({ success: true, data: run });
  } catch (error: unknown) {
    logger.error('Failed to run report', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to run report' } });
  }
});

// ===================================================================
// GET /api/reports/:id/runs — List report runs
// ===================================================================

router.get('/:id/runs', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20);
    const skip = (page - 1) * limit;

    const report = await prisma.analyticsReport.findFirst({ where: { id, deletedAt: null } as any });
    if (!report) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    }

    const [runs, total] = await Promise.all([
      prisma.analyticsReportRun.findMany({
        where: { reportId: id, deletedAt: null } as any,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.analyticsReportRun.count({ where: { reportId: id, deletedAt: null } as any }),
    ]);

    res.json({
      success: true,
      data: runs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list report runs', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list report runs' } });
  }
});

// ===================================================================
// GET /api/reports/:id/runs/:runId — Get specific run
// ===================================================================

router.get('/:id/runs/:runId', async (req: Request, res: Response) => {
  try {
    const { id, runId } = req.params;

    const run = await prisma.analyticsReportRun.findFirst({
      where: { id: runId, reportId: id, deletedAt: null } as any,
      include: { report: true },
    });

    if (!run) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report run not found' } });
    }

    res.json({ success: true, data: run });
  } catch (error: unknown) {
    logger.error('Failed to get report run', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get report run' } });
  }
});

// ===================================================================
// GET /api/reports/:id — Get report by ID
// ===================================================================

router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return;

    const report = await prisma.analyticsReport.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { runs: { take: 5, orderBy: { createdAt: 'desc' } } },
    });

    if (!report) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    }

    res.json({ success: true, data: report });
  } catch (error: unknown) {
    logger.error('Failed to get report', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get report' } });
  }
});

// ===================================================================
// PUT /api/reports/:id — Update report
// ===================================================================

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsReport.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    }

    const parsed = reportUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const updated = await prisma.analyticsReport.update({
      where: { id },
      data: parsed.data as any,
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to update report', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update report' } });
  }
});

// ===================================================================
// DELETE /api/reports/:id — Soft delete report
// ===================================================================

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsReport.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    }

    await prisma.analyticsReport.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Report deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete report', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete report' } });
  }
});

export default router;
