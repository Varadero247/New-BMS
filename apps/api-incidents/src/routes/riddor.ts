import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';

const router = Router();

const assessSchema = z.object({
  reportable: z.boolean({ required_error: 'reportable is required' }),
  riddorRef: z.string().optional(),
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const data = await prisma.incIncident.findMany({
      where: { orgId, deletedAt: null, riddorReportable: 'YES' } as any,
      orderBy: { dateOccurred: 'desc' },
      take: 500,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed' } });
  }
});

router.post('/:id/assess', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = assessSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const data = await prisma.incIncident.update({
      where: { id: req.params.id },
      data: {
        riddorReportable: parsed.data.reportable ? 'YES' : 'NO',
        riddorRef: parsed.data.riddorRef,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: 'Failed to update resource' } });
  }
});

export default router;
