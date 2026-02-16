import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const updateBoardPackSchema = z.object({
  status: z.enum(['DRAFT', 'FINAL', 'DISTRIBUTED']),
});

const logger = createLogger('board-packs');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// GET / — List board packs, newest first
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [boardPacks, total] = await Promise.all([
      prisma.boardPack.findMany({
        orderBy: { generatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.boardPack.count(),
    ]);

    res.json({
      success: true,
      data: {
        boardPacks,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    logger.error('Failed to list board packs', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list board packs' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get single board pack with sections
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const boardPack = await prisma.boardPack.findUnique({
      where: { id: req.params.id },
    });

    if (!boardPack) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Board pack not found' } });
    }

    res.json({ success: true, data: boardPack });
  } catch (err) {
    logger.error('Failed to get board pack', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get board pack' } });
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id — Update status (DRAFT → FINAL → DISTRIBUTED)
// ---------------------------------------------------------------------------
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.boardPack.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Board pack not found' } });
    }

    const parsed = updateBoardPackSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }

    const { status } = parsed.data;
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['FINAL'],
      FINAL: ['DISTRIBUTED'],
      DISTRIBUTED: [],
    };

    if (!validTransitions[existing.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TRANSITION', message: `Cannot transition from ${existing.status} to ${status}` },
      });
    }

    const boardPack = await prisma.boardPack.update({
      where: { id: req.params.id },
      data: {
        status,
      },
    });

    logger.info('Board pack updated', { id: boardPack.id, status });
    res.json({ success: true, data: boardPack });
  } catch (err) {
    logger.error('Failed to update board pack', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update board pack' } });
  }
});

export default router;
