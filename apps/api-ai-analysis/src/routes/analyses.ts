import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-ai-analysis');

const router: IRouter = Router();

router.use(authenticate);

// GET /api/analyses - List AI analyses
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', sourceType, status } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (sourceType) where.sourceType = sourceType as any;
    if (status) where.status = status as any;

    const [analyses, total] = await Promise.all([
      prisma.aIAnalysis.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aIAnalysis.count({ where }),
    ]);

    res.json({
      success: true,
      data: analyses,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List analyses error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list analyses' },
    });
  }
});

// GET /api/analyses/:id - Get single analysis
router.get('/:id', checkOwnership(prisma.aIAnalysis), async (req: AuthRequest, res: Response) => {
  try {
    const analysis = await prisma.aIAnalysis.findUnique({
      where: { id: req.params.id },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Analysis not found' },
      });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    logger.error('Get analysis error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get analysis' },
    });
  }
});

// POST /api/analyses/:id/accept - Accept analysis
router.post('/:id/accept', checkOwnership(prisma.aIAnalysis), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aIAnalysis.findUnique({ where: { id: req.params.id } });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Analysis not found' },
      });
    }

    const schema = z.object({
      acceptedActions: z.array(z.number()).optional(),
      acceptedGaps: z.array(z.number()).optional(),
    });

    const data = schema.parse(req.body);

    const analysis = await prisma.aIAnalysis.update({
      where: { id: req.params.id },
      data: {
        status: data.acceptedActions?.length === (existing.suggestedActions as unknown[])?.length
          ? 'ACCEPTED'
          : 'PARTIALLY_ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    res.json({ success: true, data: analysis });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields = error.errors.map(e => e.path.join('.'));
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields },
      });
    }
    logger.error('Accept analysis error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to accept analysis' },
    });
  }
});

// POST /api/analyses/:id/reject - Reject analysis
router.post('/:id/reject', checkOwnership(prisma.aIAnalysis), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aIAnalysis.findUnique({ where: { id: req.params.id } });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Analysis not found' },
      });
    }

    const analysis = await prisma.aIAnalysis.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
      },
    });

    res.json({ success: true, data: analysis });
  } catch (error) {
    logger.error('Reject analysis error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to reject analysis' },
    });
  }
});

// DELETE /api/analyses/:id - Delete analysis
router.delete('/:id', checkOwnership(prisma.aIAnalysis), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.aIAnalysis.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete analysis error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete analysis' },
    });
  }
});

export default router;
