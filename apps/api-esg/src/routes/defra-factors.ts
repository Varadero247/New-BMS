import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';

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
    const data = await (prisma as any).esgDefraFactor.findMany({ where: { orgId, deletedAt: null } });
    res.json({ success: true, data });
  } catch (error: any) {
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
    const data = await (prisma as any).esgDefraFactor.create({
      data: { category, subcategory, activity, unit, factor, year, source, notes, orgId, createdBy: (req as any).user?.id },
    });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

export default router;
