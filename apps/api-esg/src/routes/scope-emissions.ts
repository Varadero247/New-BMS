import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';

const router = Router();

const createSchema = z.object({
  scope: z.number().int().min(1).max(3, 'Scope must be 1, 2, or 3'),
  category: z.string().optional(),
  source: z.string().optional(),
  activity: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  emissionFactor: z.number().optional(),
  co2e: z.number().optional(),
  period: z.string().optional(),
  location: z.string().optional(),
  verifiedBy: z.string().optional(),
  verifiedDate: z.string().optional(),
  notes: z.string().optional(),
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as AuthRequest).user?.orgId || 'default';
    const { scope } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (scope) where.scope = parseInt(scope);
    const data = await prisma.esgScopeEmission.findMany({ where, orderBy: { period: 'desc' } });
    res.json({ success: true, data });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }
    const orgId = (req as AuthRequest).user?.orgId || 'default';
    const y = new Date().getFullYear();
    const c = await prisma.esgScopeEmission.count({ where: { orgId } });
    const { scope, category, source, activity, quantity, unit, emissionFactor, co2e, period, location, verifiedBy, verifiedDate, notes } = parsed.data;
    const data = await prisma.esgScopeEmission.create({
      data: {
        scope, category, source, activity, quantity, unit, emissionFactor, co2e, period, location, verifiedBy,
        verifiedDate: verifiedDate ? new Date(verifiedDate) : undefined,
        notes,
        orgId, referenceNumber: `EMI-${y}-${String(c + 1).padStart(4, '0')}`, createdBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: (error as Error).message } });
  }
});

export default router;
