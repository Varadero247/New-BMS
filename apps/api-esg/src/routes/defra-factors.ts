import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const logger = createLogger('api-esg');

const router = Router();

const createSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  activity: z.string().min(1, 'Activity is required'),
  unit: z.string().min(1, 'Unit is required'),
  factor: z.number({ required_error: 'Factor is required' }),
  year: z.number().int({ message: 'Year must be an integer' }),
  source: z.string().optional(),
  notes: z.string().optional(),
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const data = await prisma.esgDefraFactor.findMany({ where: { orgId, deletedAt: null } as any });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }
    const orgId = (req as any).user?.orgId || 'default';
    const { category, subcategory, activity, unit, factor, year, source, notes } = parsed.data;
    const data = await prisma.esgDefraFactor.create({
      data: { category, subcategory, activity, unit, factor, year, source, notes, orgId, createdBy: (req as AuthRequest).user?.id },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create resource' } });
  }
});

export default router;
