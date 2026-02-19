import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-portal');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List documents shared with customer
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;
    const category = req.query.category as string | undefined;

    const where: Record<string, unknown> = {
      portalType: 'CUSTOMER',
      deletedAt: null,
      OR: [{ visibility: 'PUBLIC' }, { visibility: 'SHARED', uploadedBy: auth.user!.id }],
    };
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      prisma.portalDocument.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.portalDocument.count({ where }),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing customer documents', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list documents' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Document detail
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const document = await prisma.portalDocument.findFirst({
      where: {
        id: req.params.id,
        portalType: 'CUSTOMER',
        deletedAt: null,
        visibility: { not: 'PRIVATE' },
      },
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    return res.json({ success: true, data: document });
  } catch (error: unknown) {
    logger.error('Error fetching document', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch document' },
    });
  }
});

export default router;
