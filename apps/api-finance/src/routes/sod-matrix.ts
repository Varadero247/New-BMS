import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const router = Router();
const logger = createLogger('finance-sod-matrix');

const createSodRuleSchema = z.object({
  role1: z.string().trim().min(1, 'role1 is required'),
  role2: z.string().trim().min(1, 'role2 is required'),
  conflictType: z.string().trim().optional(),
  description: z.string().trim().optional(),
  mitigatingControl: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const data = await prisma.finSodRule.findMany({
      where: { orgId, deletedAt: null },
      take: 500,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Operation failed', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed' } });
  }
});
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSodRuleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const { role1, role2, conflictType, description, mitigatingControl, isActive } = parsed.data;
    const data = await prisma.finSodRule.create({
      data: {
        role1,
        role2,
        conflictType,
        description,
        mitigatingControl,
        isActive,
        orgId,
        createdBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Operation failed', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' },
    });
  }
});
export default router;
