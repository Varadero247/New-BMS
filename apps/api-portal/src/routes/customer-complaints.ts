import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-portal');
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
  return `PTL-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const complaintCreateSchema = z.object({
  reportType: z.literal('COMPLAINT').default('COMPLAINT'),
  description: z.string().min(1).max(5000),
  severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR']),
  attachments: z.any().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// POST / — Submit a complaint
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = complaintCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const data = parsed.data;
    const referenceNumber = generateReference('CMP');

    const complaint = await prisma.portalQualityReport.create({
      data: {
        portalUserId: auth.user!.id,
        reportType: 'COMPLAINT',
        referenceNumber,
        description: data.description,
        severity: data.severity,
        status: 'OPEN',
        attachments: data.attachments ?? undefined,
        createdBy: auth.user!.id,
      },
    });

    logger.info('Customer complaint submitted', { id: complaint.id, referenceNumber });
    return res.status(201).json({ success: true, data: complaint });
  } catch (error: unknown) {
    logger.error('Error creating complaint', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create complaint' } });
  }
});

// ---------------------------------------------------------------------------
// GET / — List customer complaints
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const where: Record<string, unknown> = {
      portalUserId: auth.user!.id,
      reportType: 'COMPLAINT',
      deletedAt: null,
    };
    if (status) where.status = status;

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
    logger.error('Error listing complaints', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list complaints' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Complaint detail
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const complaint = await prisma.portalQualityReport.findFirst({
      where: { id: req.params.id, portalUserId: auth.user!.id, deletedAt: null } as any,
    });

    if (!complaint) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Complaint not found' } });
    }

    return res.json({ success: true, data: complaint });
  } catch (error: unknown) {
    logger.error('Error fetching complaint', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch complaint' } });
  }
});

export default router;
