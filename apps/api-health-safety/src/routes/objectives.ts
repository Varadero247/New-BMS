// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination} from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-health-safety');

const router: IRouter = Router();

router.use(authenticate);
router.param('id', validateIdParam());
router.param('mid', validateIdParam('mid'));

const OBJECTIVE_CATEGORIES = [
  'INCIDENT_REDUCTION',
  'HAZARD_ELIMINATION',
  'TRAINING',
  'AUDIT',
  'LEGAL_COMPLIANCE',
  'HEALTH_WELLBEING',
  'RISK_REDUCTION',
  'CONTRACTOR_MANAGEMENT',
  'OTHER',
] as const;
const OBJECTIVE_STATUSES = [
  'ACTIVE',
  'ON_TRACK',
  'AT_RISK',
  'BEHIND',
  'ACHIEVED',
  'CANCELLED',
] as const;

// Generate reference number OBJ-001, OBJ-002, etc.
async function generateReferenceNumber(): Promise<string> {
  const last = await prisma.ohsObjective.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: { referenceNumber: true },
  });

  let nextNum = 1;
  if (last?.referenceNumber) {
    const match = last.referenceNumber.match(/OBJ-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  return `OBJ-${String(nextNum).padStart(3, '0')}`;
}

// Calculate progress percent from milestones
function calculateProgress(milestones: { completed: boolean }[]): number {
  if (milestones.length === 0) return 0;
  const completed = milestones.filter((m) => m.completed).length;
  return Math.round((completed / milestones.length) * 100);
}

// GET /api/objectives - List objectives
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status, category, search } = req.query;
    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { objectiveStatement: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [objectives, total] = await Promise.all([
      prisma.ohsObjective.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { milestones: { orderBy: { sortOrder: 'asc' } } },
      }),
      prisma.ohsObjective.count({ where }),
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

// GET /api/objectives/:id - Get single objective
router.get('/:id', checkOwnership(prisma.ohsObjective), async (req: Request, res: Response) => {
  try {
    const objective = await prisma.ohsObjective.findUnique({
      where: { id: req.params.id },
      include: { milestones: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!objective || (objective as Record<string, unknown>).deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
    }

    res.json({ success: true, data: objective });
  } catch (error) {
    logger.error('Get objective error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get objective' },
    });
  }
});

// POST /api/objectives - Create objective
router.post('/', async (req: Request, res: Response) => {
  try {
    const milestoneSchema = z.object({
      title: z.string().trim().min(1).max(200),
      dueDate: z
        .string()
        .trim()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
    });

    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      objectiveStatement: z.string().trim().optional(),
      category: z.enum(OBJECTIVE_CATEGORIES),
      ohsPolicyLink: z.string().trim().optional(),
      department: z.string().trim().optional(),
      owner: z.string().trim().optional(),
      startDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      targetDate: z
        .string()
        .trim()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      kpiDescription: z.string().trim().optional(),
      baselineValue: z.number().optional(),
      targetValue: z.number().nonnegative().optional(),
      currentValue: z.number().nonnegative().optional(),
      unit: z.string().trim().optional(),
      monitoringFrequency: z.string().trim().optional(),
      resourcesRequired: z.string().trim().optional(),
      progressNotes: z.string().trim().optional(),
      // AI
      aiRecommendations: z.string().trim().optional(),
      aiGenerated: z.boolean().optional(),
      status: z.enum(OBJECTIVE_STATUSES).optional(),
      milestones: z.array(milestoneSchema).optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateReferenceNumber();

    const objective = await prisma.ohsObjective.create({
      data: {
        id: uuidv4(),
        referenceNumber,
        title: data.title,
        objectiveStatement: data.objectiveStatement,
        category: data.category,
        ohsPolicyLink: data.ohsPolicyLink,
        department: data.department,
        owner: data.owner,
        startDate: data.startDate ? new Date(data.startDate) : null,
        targetDate: new Date(data.targetDate),
        kpiDescription: data.kpiDescription,
        baselineValue: data.baselineValue,
        targetValue: data.targetValue,
        currentValue: data.currentValue ?? 0,
        unit: data.unit,
        monitoringFrequency: data.monitoringFrequency,
        resourcesRequired: data.resourcesRequired,
        progressNotes: data.progressNotes,
        aiRecommendations: data.aiRecommendations,
        aiGenerated: data.aiGenerated ?? false,
        status: data.status || 'ACTIVE',
        milestones: data.milestones
          ? {
              create: data.milestones.map((m, i) => ({
                id: uuidv4(),
                title: m.title,
                dueDate: new Date(m.dueDate),
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: { milestones: { orderBy: { sortOrder: 'asc' } } },
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

// PATCH /api/objectives/:id - Update objective
router.patch(
  '/:id',
  checkOwnership(prisma.ohsObjective),
  async (req: Request, res: Response) => {
    try {
      const existing = await prisma.ohsObjective.findUnique({
        where: { id: req.params.id },
        include: { milestones: true },
      });
      if (!existing || existing.deletedAt) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
      }

      const schema = z.object({
        title: z.string().trim().min(1).max(200).optional(),
        objectiveStatement: z.string().trim().optional(),
        category: z.enum(OBJECTIVE_CATEGORIES).optional(),
        ohsPolicyLink: z.string().trim().optional(),
        department: z.string().trim().optional(),
        owner: z.string().trim().optional(),
        startDate: z
          .string()
          .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
          .optional(),
        targetDate: z
          .string()
          .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
          .optional(),
        kpiDescription: z.string().trim().optional(),
        baselineValue: z.number().optional(),
        targetValue: z.number().nonnegative().optional(),
        currentValue: z.number().nonnegative().optional(),
        unit: z.string().trim().optional(),
        monitoringFrequency: z.string().trim().optional(),
        resourcesRequired: z.string().trim().optional(),
        progressNotes: z.string().trim().optional(),
        aiRecommendations: z.string().trim().optional(),
        aiGenerated: z.boolean().optional(),
        status: z.enum(OBJECTIVE_STATUSES).optional(),
      });

      const data = schema.parse(req.body);

      const updateData: Record<string, unknown> = { ...data };
      if (data.startDate) updateData.startDate = new Date(data.startDate);
      if (data.targetDate) updateData.targetDate = new Date(data.targetDate);

      // Recalculate progress from milestones
      const progress = calculateProgress(existing.milestones);
      updateData.progressPercent = progress;

      if (data.status === 'ACHIEVED') {
        updateData.completedDate = new Date();
        updateData.progressPercent = 100;
      }

      const objective = await prisma.ohsObjective.update({
        where: { id: req.params.id },
        data: updateData,
        include: { milestones: { orderBy: { sortOrder: 'asc' } } },
      });

      res.json({ success: true, data: objective });
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
      logger.error('Update objective error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update objective' },
      });
    }
  }
);

// DELETE /api/objectives/:id - Delete objective (cascades milestones)
router.delete(
  '/:id',
  checkOwnership(prisma.ohsObjective),
  async (req: Request, res: Response) => {
    try {
      const existing = await prisma.ohsObjective.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
      }

      await prisma.ohsObjective.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
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

// POST /api/objectives/:id/milestones - Add milestone
router.post('/:id/milestones', async (req: Request, res: Response) => {
  try {
    const objective = await prisma.ohsObjective.findUnique({
      where: { id: req.params.id },
      include: { milestones: true },
    });
    if (!objective || (objective as Record<string, unknown>).deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      dueDate: z
        .string()
        .trim()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
    });

    const data = schema.parse(req.body);
    const nextOrder = objective.milestones.length;

    const milestone = await prisma.objectiveMilestone.create({
      data: {
        id: uuidv4(),
        objectiveId: req.params.id,
        title: data.title,
        dueDate: new Date(data.dueDate),
        sortOrder: nextOrder,
      },
    });

    res.status(201).json({ success: true, data: milestone });
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
    logger.error('Add milestone error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to add milestone' },
    });
  }
});

// PATCH /api/objectives/:id/milestones/:mid - Update milestone
router.patch('/:id/milestones/:mid', async (req: Request, res: Response) => {
  try {
    const milestone = await prisma.objectiveMilestone.findUnique({ where: { id: req.params.mid } });
    if (!milestone || milestone.objectiveId !== req.params.id) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200).optional(),
      dueDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      completed: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.completed === true) updateData.completedDate = new Date();
    if (data.completed === false) updateData.completedDate = null;

    const updated = await prisma.objectiveMilestone.update({
      where: { id: req.params.mid },
      data: updateData,
    });

    // Recalculate objective progress
    const allMilestones = await prisma.objectiveMilestone.findMany({
      where: { objectiveId: req.params.id },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });
    const progress = calculateProgress(allMilestones);
    await prisma.ohsObjective.update({
      where: { id: req.params.id },
      data: { progressPercent: progress },
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

export default router;
