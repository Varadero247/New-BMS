import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';

const router = Router();

const assignSchema = z.object({
  investigator: z.string().min(1, 'investigator is required'),
  investigatorName: z.string().optional(),
});

const reportSchema = z.object({
  rootCause: z.string().optional(),
  contributingFactors: z.string().optional(),
  correctiveActions: z.string().optional(),
  preventiveActions: z.string().optional(),
  report: z.string().optional(),
});

router.post('/:id/assign', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = assignSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const data = await prisma.incIncident.update({
      where: { id: req.params.id },
      data: {
        investigator: parsed.data.investigator,
        investigatorName: parsed.data.investigatorName,
        status: 'INVESTIGATING',
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: (error as Error).message } });
  }
});

router.put('/:id/report', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = reportSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const data = await prisma.incIncident.update({
      where: { id: req.params.id },
      data: {
        rootCause: parsed.data.rootCause,
        contributingFactors: parsed.data.contributingFactors,
        correctiveActions: parsed.data.correctiveActions,
        preventiveActions: parsed.data.preventiveActions,
        investigationReport: parsed.data.report,
        investigationDate: new Date(),
        status: 'ROOT_CAUSE_ANALYSIS',
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: (error as Error).message } });
  }
});

export default router;
