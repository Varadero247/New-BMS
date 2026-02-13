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
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PTL-${prefix}-${yy}${mm}-${rand}`;
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

const npsCreateSchema = z.object({
  score: z.number().int().min(0).max(10),
  comment: z.string().max(2000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// POST / — Submit NPS score
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = npsCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const data = parsed.data;
    const referenceNumber = generateReference('NPS');

    const nps = await prisma.portalQualityReport.create({
      data: {
        portalUserId: auth.user!.id,
        reportType: 'INSPECTION',
        referenceNumber,
        description: `NPS Score: ${data.score}${data.comment ? ` - ${data.comment}` : ''}`,
        severity: data.score <= 6 ? 'CRITICAL' : data.score <= 8 ? 'MINOR' : 'MINOR',
        status: 'CLOSED',
        attachments: { npsScore: data.score, comment: data.comment || null },
        createdBy: auth.user!.id,
      },
    });

    logger.info('NPS score submitted', { id: nps.id, score: data.score });
    return res.status(201).json({ success: true, data: nps });
  } catch (error: unknown) {
    logger.error('Error submitting NPS', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit NPS score' } });
  }
});

// ---------------------------------------------------------------------------
// GET / — View own NPS submissions
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20);
    const skip = (page - 1) * limit;

    const where: any = {
      portalUserId: auth.user!.id,
      reportType: 'INSPECTION',
      deletedAt: null,
    };

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
    logger.error('Error listing NPS submissions', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list NPS submissions' } });
  }
});

export default router;
