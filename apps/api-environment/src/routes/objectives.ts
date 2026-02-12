import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

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
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status, category, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.EnvObjectiveWhereInput = {};
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
      prisma.envObjective.findMany({ where, skip, take: limitNum, orderBy: { createdAt: 'desc' }, include: { milestones: true } }),
      prisma.envObjective.count({ where }),
    ]);

    res.json({
      success: true,
      data: objectives,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List objectives error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list objectives' } });
  }
});

// GET /:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const objective = await prisma.envObjective.findUnique({ where: { id: req.params.id }, include: { milestones: true } });
    if (!objective) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
    res.json({ success: true, data: objective });
  } catch (error) {
    logger.error('Get objective error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get objective' } });
  }
});

// POST /
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      objectiveStatement: z.string().min(1),
      category: z.string().min(1),
      targetDate: z.string().min(1),
      owner: z.string().min(1),
      status: z.string().optional(),
      policyCommitment: z.string().optional(),
      iso14001Clause: z.string().optional(),
      linkedAspects: z.array(z.string()).optional().default([]),
      sdgAlignment: z.array(z.string()).optional().default([]),
      netZeroTarget: z.boolean().optional(),
      netZeroDescription: z.string().optional(),
      kpiDescription: z.string().optional(),
      baselineValue: z.number().optional(),
      baselineDate: z.string().optional(),
      targetValue: z.number().optional(),
      currentValue: z.number().optional(),
      unit: z.string().optional(),
      measurementMethod: z.string().optional(),
      dataSource: z.string().optional(),
      startDate: z.string().optional(),
      department: z.string().optional(),
      resourcesRequired: z.string().optional(),
      estimatedCost: z.number().optional(),
      actionsRequired: z.boolean().optional(),
      reviewFrequency: z.string().optional(),
      progressNotes: z.string().optional(),
      progressPercent: z.number().optional(),
      aiSmartAnalysis: z.string().optional(),
      aiImprovedStatement: z.string().optional(),
      aiSuggestedKPIs: z.string().optional(),
      aiSuggestedMilestones: z.string().optional(),
      aiBenchmarks: z.string().optional(),
      aiRisks: z.string().optional(),
      aiGenerated: z.boolean().optional(),
      milestones: z.array(z.object({
        title: z.string().min(1),
        dueDate: z.string().min(1),
      })).optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const objective = await prisma.envObjective.create({
      data: {
        referenceNumber,
        title: data.title,
        objectiveStatement: data.objectiveStatement,
        category: data.category as any,
        targetDate: new Date(data.targetDate),
        owner: data.owner,
        status: (data.status as any) || 'NOT_STARTED',
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
        reviewFrequency: data.reviewFrequency as any,
        progressNotes: data.progressNotes,
        progressPercent: data.progressPercent ?? 0,
        aiSmartAnalysis: data.aiSmartAnalysis,
        aiImprovedStatement: data.aiImprovedStatement,
        aiSuggestedKPIs: data.aiSuggestedKPIs,
        aiSuggestedMilestones: data.aiSuggestedMilestones,
        aiBenchmarks: data.aiBenchmarks,
        aiRisks: data.aiRisks,
        aiGenerated: data.aiGenerated ?? false,
        milestones: data.milestones && data.milestones.length > 0
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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create objective error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create objective' } });
  }
});

// PUT /:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envObjective.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });

    const data = req.body;

    // Convert date strings to Date objects
    if (data.targetDate) data.targetDate = new Date(data.targetDate);
    if (data.baselineDate) data.baselineDate = new Date(data.baselineDate);
    if (data.startDate) data.startDate = new Date(data.startDate);

    // Remove milestones from the update data (handle separately if needed)
    delete data.milestones;

    const objective = await prisma.envObjective.update({
      where: { id: req.params.id },
      data,
      include: { milestones: true },
    });

    res.json({ success: true, data: objective });
  } catch (error) {
    logger.error('Update objective error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update objective' } });
  }
});

// PATCH /:id/milestones/:milestoneId - Update milestone completion
router.patch('/:id/milestones/:milestoneId', async (req: AuthRequest, res: Response) => {
  try {
    const objective = await prisma.envObjective.findUnique({ where: { id: req.params.id } });
    if (!objective) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });

    const milestone = await prisma.envMilestone.findUnique({ where: { id: req.params.milestoneId } });
    if (!milestone || milestone.objectiveId !== req.params.id) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    const schema = z.object({
      completed: z.boolean().optional(),
      completedDate: z.string().optional(),
      title: z.string().optional(),
      dueDate: z.string().optional(),
      notes: z.string().optional(),
      sortOrder: z.number().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: any = { ...data };
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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update milestone error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update milestone' } });
  }
});

// DELETE /:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envObjective.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
    await prisma.envObjective.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete objective error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete objective' } });
  }
});

export default router;
