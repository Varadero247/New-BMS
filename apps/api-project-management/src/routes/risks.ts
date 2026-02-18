import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-project-management');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Helper: calculate risk level from probability x impact
function getRiskLevel(probability: number, impact: number): string {
  const score = probability * impact;
  if (score <= 4) return 'LOW';
  if (score <= 9) return 'MEDIUM';
  if (score <= 16) return 'HIGH';
  return 'CRITICAL';
}

// GET /api/risks - List project risks by projectId
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, riskLevel, status, page = '1', limit = '50' } = req.query;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' },
      });
    }

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { projectId: projectId as string, deletedAt: null };
    if (riskLevel) where.riskLevel = riskLevel as any;
    if (status) where.status = status as any;

    const [risks, total] = await Promise.all([
      prisma.projectRisk.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ riskScore: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.projectRisk.count({ where }),
    ]);

    res.json({
      success: true,
      data: risks,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List project risks error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list project risks' },
    });
  }
});

const createProjectRiskSchema = z.object({
  projectId: z.string().trim().min(1).max(200),
  riskCode: z.string().trim().min(1).max(200),
  riskTitle: z.string().trim().min(1).max(200),
  riskDescription: z.string().trim().min(1).max(2000),
  riskCategory: z.enum(['TECHNICAL', 'RESOURCE', 'SCHEDULE', 'BUDGET', 'QUALITY', 'EXTERNAL']),
  riskTrigger: z.string().trim().optional(),
  probability: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
  expectedMonetaryValue: z.number().optional(),
  contingencyAmount: z.number().nonnegative().optional(),
  responseStrategy: z.string().trim().optional(),
  responsePlan: z.string().trim().optional(),
  responseOwner: z.string().trim().optional(),
  mitigationActions: z.string().trim().optional(),
  contingencyPlan: z.string().trim().optional(),
  status: z.string().trim().optional(),
  reviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
});
const updateProjectRiskSchema = createProjectRiskSchema
  .extend({
    residualProbability: z.number().min(1).max(5).optional(),
    residualImpact: z.number().min(1).max(5).optional(),
    closedDate: z.string().trim().optional(),
  })
  .partial();

// POST /api/risks - Create project risk
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createProjectRiskSchema.parse(req.body);

    const riskScore = data.probability * data.impact;
    const riskLevel = getRiskLevel(data.probability, data.impact);

    const risk = await prisma.projectRisk.create({
      data: {
        projectId: data.projectId,
        riskCode: data.riskCode,
        riskTitle: data.riskTitle,
        riskDescription: data.riskDescription,
        riskCategory: data.riskCategory,
        riskTrigger: data.riskTrigger,
        probability: data.probability,
        impact: data.impact,
        riskScore,
        riskLevel,
        expectedMonetaryValue: data.expectedMonetaryValue,
        contingencyAmount: data.contingencyAmount,
        responseStrategy: data.responseStrategy || 'MITIGATE',
        responsePlan: data.responsePlan,
        responseOwner: data.responseOwner,
        mitigationActions: data.mitigationActions,
        contingencyPlan: data.contingencyPlan,
        status: data.status || 'IDENTIFIED',
        identifiedBy: req.user?.id,
        identifiedDate: new Date(),
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : null,
      },
    });

    res.status(201).json({ success: true, data: risk });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    logger.error('Create project risk error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create project risk' },
    });
  }
});

// PUT /api/risks/:id - Update project risk
router.put('/:id', checkOwnership(prisma.projectRisk), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectRisk.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Project risk not found' } });
    }

    const parsed = updateProjectRiskSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const data = parsed.data;
    const updateData = { ...data } as Record<string, unknown>;

    // Recalculate risk score if probability or impact changed
    const probability = data.probability ?? existing.probability;
    const impact = data.impact ?? existing.impact;
    updateData.riskScore = probability * impact;
    updateData.riskLevel = getRiskLevel(probability, impact);

    // Handle residual risk calculation
    if (data.residualProbability !== undefined || data.residualImpact !== undefined) {
      const resProbability =
        data.residualProbability ?? existing.residualProbability ?? probability;
      const resImpact = data.residualImpact ?? existing.residualImpact ?? impact;
      updateData.residualRisk = resProbability * resImpact;
    }

    if (data.reviewDate) updateData.reviewDate = new Date(data.reviewDate);
    if (data.closedDate) updateData.closedDate = new Date(data.closedDate);

    // Auto-close date when status changes to CLOSED
    if (data.status === 'CLOSED' && existing.status !== 'CLOSED') {
      updateData.closedDate = updateData.closedDate || new Date();
    }

    const risk = await prisma.projectRisk.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: risk });
  } catch (error) {
    logger.error('Update project risk error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update project risk' },
    });
  }
});

// DELETE /api/risks/:id - Delete project risk
router.delete(
  '/:id',
  checkOwnership(prisma.projectRisk),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.projectRisk.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Project risk not found' },
        });
      }

      await prisma.projectRisk.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });
      res.status(204).send();
    } catch (error) {
      logger.error('Delete project risk error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete project risk' },
      });
    }
  }
);

export default router;
