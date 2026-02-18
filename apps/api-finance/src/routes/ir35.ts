import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const router = Router();
const logger = createLogger('finance-ir35');

const createIr35Schema = z.object({
  contractorName: z.string().min(1, 'contractorName is required'),
  contractorEmail: z.string().trim().email().optional().nullable(),
  engagementDesc: z.string().optional(),
  clientName: z.string().optional(),
  determination: z.enum(['PENDING', 'INSIDE', 'OUTSIDE', 'UNKNOWN']).optional(),
  assessmentDate: z.string().trim().datetime({ offset: true }).optional().nullable(),
  assessedBy: z.string().optional(),
  reasoning: z.string().optional(),
  evidenceUrl: z.string().trim().url('Invalid URL').optional(),
  reviewDate: z.string().trim().datetime({ offset: true }).optional().nullable(),
  notes: z.string().optional(),
});
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const data = await prisma.finIr35Assessment.findMany({
      where: { orgId, deletedAt: null } as any,
      orderBy: { createdAt: 'desc' },
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
    const parsed = createIr35Schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const y = new Date().getFullYear();
    const c = await prisma.finIr35Assessment.count({ where: { orgId } });
    const {
      contractorName,
      contractorEmail,
      engagementDesc,
      clientName,
      determination,
      assessmentDate,
      assessedBy,
      reasoning,
      evidenceUrl,
      reviewDate,
      notes,
    } = parsed.data;
    const data = await prisma.finIr35Assessment.create({
      data: {
        contractorName,
        contractorEmail,
        engagementDesc,
        clientName,
        determination: determination as any,
        assessmentDate,
        assessedBy,
        reasoning,
        evidenceUrl,
        reviewDate,
        notes,
        orgId,
        referenceNumber: `IR35-${y}-${String(c + 1).padStart(4, '0')}`,
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
