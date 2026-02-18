import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
const logger = createLogger('api-incidents');

const router = Router();
router.param('id', validateIdParam());

const assignSchema = z.object({
  investigator: z.string().trim().min(1, 'investigator is required'),
  investigatorName: z.string().trim().optional(),
});

const reportSchema = z.object({
  rootCause: z.string().trim().optional(),
  contributingFactors: z.string().trim().optional(),
  correctiveActions: z.string().trim().optional(),
  preventiveActions: z.string().trim().optional(),
  report: z.string().trim().optional(),
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
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' },
    });
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
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' },
    });
  }
});

export default router;
