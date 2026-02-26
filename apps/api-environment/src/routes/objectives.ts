// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma, EnvObjectiveCategory, EnvReviewFrequency } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination} from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-environment');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());
router.param('milestoneId', validateIdParam('milestoneId'));

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.envObjective.count({
    where: { referenceNumber: { startsWith: `ENV-OBJ-${year}` } },
  });
  return `ENV-OBJ-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List objectives
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50', status, category, search } = req.query;
    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query, { defaultLimit: 50 });

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { objectiveStatement: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
        { owner: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [objectives, total] = await Promise.all([
      prisma.envObjective.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { milestones: true },
      }),
      prisma.envObjective.count({ where }),
    ]);

    res.json({
      success: true,
      data: objectives,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List objectives error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list objectives' },
    });
  }
});

// GET /:id
router.get('/:id', checkOwnership(prisma.envObjective), async (req: Request, res: Response) => {
  try {
    const objective = await prisma.envObjective.findUnique({
      where: { id: req.params.id },
      include: { milestones: true },
    });
    if (!objective)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
    res.json({ success: true, data: objective });
  } catch (error) {
    logger.error('Get objective error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get objective' },
    });
  }
});

// POST /
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      objectiveStatement: z.string().trim().min(1).max(2000),
      category: z.string().trim().min(1).max(200),
      targetDate: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      owner: z.string().trim().min(1).max(200),
      status: z.string().trim().optional(),
      policyCommitment: z.string().trim().optional(),
      iso14001Clause: z.string().trim().optional(),
      linkedAspects: z.array(z.string().trim()).optional().default([]),
      sdgAlignment: z.array(z.string().trim()).optional().default([]),
      netZeroTarget: z.boolean().optional(),
      netZeroDescription: z.string().trim().optional(),
      kpiDescription: z.string().trim().optional(),
      baselineValue: z.number().optional(),
      baselineDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      targetValue: z.number().nonnegative().optional(),
      currentValue: z.number().nonnegative().optional(),
      unit: z.string().trim().optional(),
      measurementMethod: z.string().trim().optional(),
      dataSource: z.string().trim().optional(),
      startDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      department: z.string().trim().optional(),
      resourcesRequired: z.string().trim().optional(),
      estimatedCost: z.number().nonnegative().optional(),
      actionsRequired: z.boolean().optional(),
      reviewFrequency: z.string().trim().optional(),
      progressNotes: z.string().trim().optional(),
      progressPercent: z.number().min(0).max(100).optional(),
      aiSmartAnalysis: z.string().trim().optional(),
      aiImprovedStatement: z.string().trim().optional(),
      aiSuggestedKPIs: z.string().trim().optional(),
      aiSuggestedMilestones: z.string().trim().optional(),
      aiBenchmarks: z.string().trim().optional(),
      aiRisks: z.string().trim().optional(),
      aiGenerated: z.boolean().optional(),
      milestones: z
        .array(
          z.object({
            title: z.string().trim().min(1).max(200),
            dueDate: z
              .string()
              .trim()
              .min(1)
              .max(200)
              .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
          })
        )
        .optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const objective = await prisma.envObjective.create({
      data: {
        referenceNumber,
        title: data.title,
        objectiveStatement: data.objectiveStatement,
        category: data.category as EnvObjectiveCategory,
        targetDate: new Date(data.targetDate),
        owner: data.owner,
        status: data.status || 'NOT_STARTED',
        policyCommitment: data.policyCommitment,
        iso14001Clause: data.iso14001Clause,
        linkedAspects: data.linkedAspects,
        sdgAlignment: data.sdgAlignment,
        netZeroTarget: data.netZeroTarget ?? false,
        netZeroDescription: data.netZeroDescription,
        kpiDescription: data.kpiDescription,
        baselineValue: data.baselineValue,
        baselineDate: data.baselineDate ? new Date(data.baselineDate) : null,
        targetValue: data.targetValue,
        currentValue: data.currentValue ?? 0,
        unit: data.unit,
        measurementMethod: data.measurementMethod,
        dataSource: data.dataSource,
        startDate: data.startDate ? new Date(data.startDate) : null,
        department: data.department,
        resourcesRequired: data.resourcesRequired,
        estimatedCost: data.estimatedCost,
        actionsRequired: data.actionsRequired ?? false,
        reviewFrequency: data.reviewFrequency as EnvReviewFrequency,
        progressNotes: data.progressNotes,
        progressPercent: data.progressPercent ?? 0,
        aiSmartAnalysis: data.aiSmartAnalysis,
        aiImprovedStatement: data.aiImprovedStatement,
        aiSuggestedKPIs: data.aiSuggestedKPIs,
        aiSuggestedMilestones: data.aiSuggestedMilestones,
        aiBenchmarks: data.aiBenchmarks,
        aiRisks: data.aiRisks,
        aiGenerated: data.aiGenerated ?? false,
        milestones:
          data.milestones && data.milestones.length > 0
            ? {
                create: data.milestones.map((m, index) => ({
                  title: m.title,
                  dueDate: new Date(m.dueDate),
                  sortOrder: index,
                })),
              }
            : undefined,
      },
      include: { milestones: true },
    });

    res.status(201).json({ success: true, data: objective });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create objective error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create objective' },
    });
  }
});

// PUT /:id
const objectiveUpdateSchema = z.object({
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  relatedAspectId: z.string().trim().optional(),
  department: z.string().trim().optional(),
  responsiblePerson: z.string().trim().optional(),
  targetDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  baselineDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  startDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  baselineValue: z.number().optional(),
  targetValue: z.number().nonnegative().optional(),
  currentValue: z.number().nonnegative().optional(),
  unit: z.string().trim().optional(),
  kpiFormula: z.string().trim().optional(),
  measurementFrequency: z.string().trim().optional(),
  status: z.string().trim().optional(),
  priority: z.string().trim().optional(),
  budget: z.number().nonnegative().optional(),
  actualCost: z.number().nonnegative().optional(),
  resourceRequirements: z.string().trim().optional(),
  risks: z.string().trim().optional(),
  aiSuggestedKPIs: z.string().trim().optional(),
  aiActionPlan: z.string().trim().optional(),
  aiBenchmarkComparison: z.string().trim().optional(),
  aiProgressAnalysis: z.string().trim().optional(),
  aiRiskAssessment: z.string().trim().optional(),
  aiGenerated: z.boolean().optional(),
});

router.put('/:id', checkOwnership(prisma.envObjective), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.envObjective.findUnique({ where: { id: req.params.id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });

    const parsed = objectiveUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: parsed.error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    const data: Record<string, unknown> = { ...parsed.data };

    // Convert date strings to Date objects
    if (data.targetDate) data.targetDate = new Date(data.targetDate as string);
    if (data.baselineDate) data.baselineDate = new Date(data.baselineDate as string);
    if (data.startDate) data.startDate = new Date(data.startDate as string);

    const objective = await prisma.envObjective.update({
      where: { id: req.params.id },
      data,
      include: { milestones: true },
    });

    res.json({ success: true, data: objective });
  } catch (error) {
    logger.error('Update objective error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update objective' },
    });
  }
});

// PATCH /:id/milestones/:milestoneId - Update milestone completion
router.patch('/:id/milestones/:milestoneId', async (req: Request, res: Response) => {
  try {
    const objective = await prisma.envObjective.findUnique({ where: { id: req.params.id } });
    if (!objective)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });

    const milestone = await prisma.envMilestone.findUnique({
      where: { id: req.params.milestoneId },
    });
    if (!milestone || milestone.objectiveId !== req.params.id) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    const schema = z.object({
      completed: z.boolean().optional(),
      completedDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      title: z.string().trim().optional(),
      dueDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      notes: z.string().trim().optional(),
      sortOrder: z.number().int().nonnegative().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.completedDate) updateData.completedDate = new Date(data.completedDate);
    // Auto-set completedDate when marking as completed
    if (data.completed === true && !milestone.completed && !data.completedDate) {
      updateData.completedDate = new Date();
    }
    // Clear completedDate when marking as not completed
    if (data.completed === false) {
      updateData.completedDate = null;
    }

    const updated = await prisma.envMilestone.update({
      where: { id: req.params.milestoneId },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Update milestone error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update milestone' },
    });
  }
});

// DELETE /:id
router.delete(
  '/:id',
  checkOwnership(prisma.envObjective),
  async (req: Request, res: Response) => {
    try {
      const existing = await prisma.envObjective.findUnique({ where: { id: req.params.id } });
      if (!existing)
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
      await prisma.envObjective.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date(), updatedBy: req.user?.id },
      });
      res.status(204).send();
    } catch (error) {
      logger.error('Delete objective error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete objective' },
      });
    }
  }
);

export default router;
