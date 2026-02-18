import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-portal');
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
  return `PTL-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const qualityReportCreateSchema = z.object({
  portalUserId: z.string().trim().uuid(),
  reportType: z.enum(['NCR', 'COMPLAINT', 'INSPECTION', 'AUDIT']),
  description: z.string().trim().min(1).max(5000),
  severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR']),
  attachments: z.any().optional().nullable(),
});

const qualityReportUpdateSchema = z.object({
  description: z.string().trim().min(1).max(5000).optional(),
  severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR']).optional(),
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED']).optional(),
  resolution: z.string().max(5000).optional().nullable(),
  attachments: z.any().optional().nullable(),
});

// ---------------------------------------------------------------------------
// GET / — List quality reports
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const reportType = req.query.reportType as string | undefined;
    const severity = req.query.severity as string | undefined;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (reportType) where.reportType = reportType;
    if (severity) where.severity = severity;

    const [items, total] = await Promise.all([
      prisma.portalQualityReport.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.portalQualityReport.count({ where }),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing quality reports', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list quality reports' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create quality report
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = qualityReportCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const data = parsed.data;
    const referenceNumber = generateReference('QR');

    const report = await prisma.portalQualityReport.create({
      data: {
        portalUserId: data.portalUserId,
        reportType: data.reportType,
        referenceNumber,
        description: data.description,
        severity: data.severity,
        status: 'OPEN',
        attachments: data.attachments ?? undefined,
        createdBy: auth.user!.id,
      },
    });

    logger.info('Quality report created', { id: report.id, referenceNumber });
    return res.status(201).json({ success: true, data: report });
  } catch (error: unknown) {
    logger.error('Error creating quality report', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create quality report' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Quality report detail
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const report = await prisma.portalQualityReport.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!report) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Quality report not found' } });
    }

    return res.json({ success: true, data: report });
  } catch (error: unknown) {
    logger.error('Error fetching quality report', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch quality report' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update quality report
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = qualityReportUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const existing = await prisma.portalQualityReport.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Quality report not found' } });
    }

    const updated = await prisma.portalQualityReport.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    logger.info('Quality report updated', { id: updated.id });
    return res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Error updating quality report', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update quality report' } });
  }
});

export default router;
