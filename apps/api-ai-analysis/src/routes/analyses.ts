import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();

router.use(authenticate);

// GET /api/analyses - List AI analyses
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', sourceType, status } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (sourceType) where.sourceType = sourceType;
    if (status) where.status = status;

    const [analyses, total] = await Promise.all([
      prisma.aIAnalysis.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.aIAnalysis.count({ where }),
    ]);

    res.json({
      success: true,
      data: analyses,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List analyses error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list analyses' },
    });
  }
});

// GET /api/analyses/:id - Get single analysis
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const analysis = await prisma.aIAnalysis.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        actions: true,
      },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Analysis not found' },
      });
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get analysis' },
    });
  }
});

// POST /api/analyses/:id/accept - Accept analysis
router.post('/:id/accept', async (req: AuthRequest, res: Response) => {
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
        status: data.acceptedActions?.length === (existing.suggestedActions as any[])?.length
          ? 'ACCEPTED'
          : 'PARTIALLY_ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    res.json({ success: true, data: analysis });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    console.error('Accept analysis error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to accept analysis' },
    });
  }
});

// POST /api/analyses/:id/reject - Reject analysis
router.post('/:id/reject', async (req: AuthRequest, res: Response) => {
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
    console.error('Reject analysis error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to reject analysis' },
    });
  }
});

// DELETE /api/analyses/:id - Delete analysis
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.aIAnalysis.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Analysis deleted successfully' } });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete analysis' },
    });
  }
});

export default router;
