import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const logger = createLogger('api-esg');

const router = Router();

const createSchema = z.object({
  scope: z.number().int().min(1).max(3, 'Scope must be 1, 2, or 3'),
  category: z.string().trim().optional(),
  source: z.string().trim().optional(),
  activity: z.string().trim().optional(),
  quantity: z.number().nonnegative().optional(),
  unit: z.string().trim().optional(),
  emissionFactor: z.number().optional(),
  co2e: z.number().optional(),
  period: z.string().trim().optional(),
  location: z.string().trim().optional(),
  verifiedBy: z.string().trim().optional(),
  verifiedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  notes: z.string().trim().optional(),
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const { scope } = req.query as Record<string, string>;
    const where: Record<string, any> = { orgId, deletedAt: null };
    if (scope) {
      const n = parseInt(scope, 10);
      if (!isNaN(n)) where.scope = n;
    }
    const data = await prisma.esgScopeEmission.findMany({
      where,
      orderBy: { period: 'desc' },
      take: 1000,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed' } });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = (req as any).user?.orgId || 'default';
    const y = new Date().getFullYear();
    const c = await prisma.esgScopeEmission.count({ where: { orgId } });
    const {
      scope,
      category,
      source,
      activity,
      quantity,
      unit,
      emissionFactor,
      co2e,
      period,
      location,
      verifiedBy,
      verifiedDate,
      notes,
    } = parsed.data;
    const data = await prisma.esgScopeEmission.create({
      data: {
        scope,
        category,
        source,
        activity,
        quantity,
        unit,
        emissionFactor,
        co2e,
        period,
        location,
        verifiedBy,
        verifiedDate: verifiedDate ? new Date(verifiedDate) : undefined,
        notes,
        orgId,
        referenceNumber: `EMI-${y}-${String(c + 1).padStart(4, '0')}`,
        createdBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' },
    });
  }
});

export default router;
