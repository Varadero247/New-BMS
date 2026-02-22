import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { PartnerRequest } from '../middleware/partner-auth';

const logger = createLogger('api-partners:learning');
const router = Router();

// GET /api/learning - List learning modules
router.get('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id;
    if (!partnerId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });

    const { category, difficulty } = req.query;
    const where: Record<string, unknown> = { status: 'ACTIVE' };
    if (category) where.type = category;
    if (difficulty) where.stage = difficulty;

    const modules = await prisma.mktPartnerDeal.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({ success: true, data: modules });
  } catch (error) {
    logger.error('Error fetching learning modules', { error: String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch learning modules' } });
  }
});

// GET /api/learning/:id - Get learning module
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id;
    if (!partnerId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });

    const module = await prisma.mktPartnerDeal.findUnique({ where: { id: req.params.id } });
    if (!module) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Module not found' } });

    res.json({ success: true, data: module });
  } catch (error) {
    logger.error('Error fetching module', { error: String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch module' } });
  }
});

// POST /api/learning/:id/enroll - Enroll in module
router.post('/:id/enroll', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id;
    if (!partnerId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });

    const schema = z.object({ userId: z.string().trim().min(1) });
    const data = schema.parse(req.body);

    const module = await prisma.mktPartnerDeal.findUnique({ where: { id: req.params.id } });
    if (!module) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Module not found' } });

    res.status(201).json({ success: true, data: { moduleId: req.params.id, userId: data.userId, status: 'ENROLLED' } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error enrolling in module', { error: String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to enroll' } });
  }
});

// POST /api/learning/:id/complete - Mark module as complete
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id;
    if (!partnerId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });

    const schema = z.object({ score: z.number().min(0).max(100).optional() });
    const data = schema.parse(req.body);

    const module = await prisma.mktPartnerDeal.findUnique({ where: { id: req.params.id } });
    if (!module) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Module not found' } });

    res.json({ success: true, data: { moduleId: req.params.id, partnerId, status: 'COMPLETED', score: data.score ?? null } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error completing module', { error: String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete module' } });
  }
});

export default router;
