import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';

const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('risk-bowtie');

const bowtieSchema = z.object({
  topEvent: z.string().trim().min(1).max(200),
  threats: z.array(
    z.object({
      id: z.string().trim(),
      description: z.string().trim(),
      likelihood: z.number().min(1).max(5).optional(),
    })
  ),
  preventionBarriers: z.array(
    z.object({
      id: z.string().trim(),
      description: z.string().trim(),
      type: z.string().trim().optional(),
      effectiveness: z.string().trim().optional(),
      owner: z.string().trim().optional(),
      degradationFactors: z.array(z.string().trim()).optional(),
      linkedThreatIds: z.array(z.string().trim()).optional(),
    })
  ),
  consequences: z.array(
    z.object({
      id: z.string().trim(),
      description: z.string().trim(),
      severity: z.number().min(1).max(5).optional(),
    })
  ),
  mitigationBarriers: z.array(
    z.object({
      id: z.string().trim(),
      description: z.string().trim(),
      type: z.string().trim().optional(),
      effectiveness: z.string().trim().optional(),
      owner: z.string().trim().optional(),
      degradationFactors: z.array(z.string().trim()).optional(),
      linkedConsequenceIds: z.array(z.string().trim()).optional(),
    })
  ),
  escalationFactors: z.array(z.string().trim()).optional(),
  criticalPath: z.string().trim().optional(),
  keyGaps: z.string().trim().optional(),
  priorityActions: z.string().trim().optional(),
});

// GET /api/risks/:id/bowtie
router.get('/:id/bowtie', authenticate, async (req: Request, res: Response) => {
  try {
    const bowtie = await prisma.riskBowtie.findUnique({ where: { riskId: req.params.id } });
    res.json({ success: true, data: bowtie });
  } catch (error: unknown) {
    logger.error('Failed to fetch bowtie', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch bowtie' },
    });
  }
});

// POST /api/risks/:id/bowtie
router.post('/:id/bowtie', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const risk = await prisma.riskRegister.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!risk)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    // Bow-tie is for HIGH+ risks only
    const level = risk.residualRiskLevel || risk.inherentRiskLevel || '';
    if (['LOW', 'MEDIUM'].includes(level)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Bow-tie analysis is only available for HIGH, VERY_HIGH, or CRITICAL risks',
        },
      });
    }
    const parsed = bowtieSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const existing = await prisma.riskBowtie.findUnique({ where: { riskId: req.params.id } });
    let bowtie;
    if (existing) {
      bowtie = await prisma.riskBowtie.update({
        where: { riskId: req.params.id },
        data: {
          ...parsed.data,
          version: String(parseFloat(existing.version) + 0.1),
          createdBy: (req as AuthRequest).user?.id,
        },
      });
    } else {
      bowtie = await prisma.riskBowtie.create({
        data: { ...parsed.data, riskId: req.params.id, createdBy: (req as AuthRequest).user?.id },
      });
    }
    res.status(existing ? 200 : 201).json({ success: true, data: bowtie });
  } catch (error: unknown) {
    logger.error('Failed to save bowtie', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to save bowtie analysis' },
    });
  }
});

// GET /api/risks/bowtie/all
router.get('/bowtie/all', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const bowties = await prisma.riskBowtie.findMany({
      where: { risk: { orgId, deletedAt: null } } as any,
      include: {
        risk: {
          select: {
            id: true,
            title: true,
            referenceNumber: true,
            residualRiskLevel: true,
            category: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    });
    res.json({ success: true, data: bowties });
  } catch (error: unknown) {
    logger.error('Failed to fetch bowties', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch bowties' },
    });
  }
});

export default router;
