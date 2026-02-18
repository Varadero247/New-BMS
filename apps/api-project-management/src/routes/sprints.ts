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

// GET /api/sprints - List sprints by projectId
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, page = '1', limit = '50' } = req.query;

    if (!projectId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' } });
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { projectId: projectId as string, deletedAt: null };

    const [sprints, total] = await Promise.all([
      prisma.projectSprint.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { sprintNumber: 'asc' },
        include: {
          _count: {
            select: { userStories: true },
          },
        },
      }),
      prisma.projectSprint.count({ where }),
    ]);

    res.json({
      success: true,
      data: sprints,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List sprints error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list sprints' } });
  }
});

// GET /api/sprints/:id/stories - Get user stories for sprint
router.get('/:id/stories', async (req: AuthRequest, res: Response) => {
  try {
    const sprint = await prisma.projectSprint.findUnique({ where: { id: req.params.id } });
    if (!sprint) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sprint not found' } });
    }

    const stories = await prisma.projectUserStory.findMany({
      where: { sprintId: req.params.id, deletedAt: null } as any,
      orderBy: [{ backlogPriority: 'asc' }, { createdAt: 'asc' }],
      take: 1000});

    res.json({ success: true, data: stories });
  } catch (error) {
    logger.error('Get sprint stories error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get sprint stories' } });
  }
});

const createSprintSchema = z.object({
  projectId: z.string().trim().min(1).max(200),
  sprintNumber: z.number().min(1),
  sprintName: z.string().trim().min(1).max(200),
  sprintGoal: z.string().optional(),
  startDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
  endDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
  duration: z.number().min(1),
  plannedVelocity: z.number().optional(),
  teamCapacity: z.number().nonnegative().optional(),
  status: z.string().optional(),
});
const updateSprintSchema = createSprintSchema.extend({
  actualVelocity: z.number().optional(),
  completedStoryPoints: z.number().int().nonnegative().optional(),
  committedStoryPoints: z.number().int().nonnegative().optional(),
  retrospectiveNotes: z.string().optional(),
  teamSatisfactionScore: z.number().min(0).max(10).optional(),
}).partial();

// POST /api/sprints - Create sprint
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createSprintSchema.parse(req.body);

    const sprint = await prisma.projectSprint.create({
      data: {
        projectId: data.projectId,
        sprintNumber: data.sprintNumber,
        sprintName: data.sprintName,
        sprintGoal: data.sprintGoal,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        duration: data.duration,
        plannedVelocity: data.plannedVelocity,
        teamCapacity: data.teamCapacity,
        status: data.status || 'PLANNED',
        committedStoryPoints: 0,
        completedStoryPoints: 0,
      },
    });

    res.status(201).json({ success: true, data: sprint });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Create sprint error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create sprint' } });
  }
});

// PUT /api/sprints/:id - Update sprint (including retrospective fields)
router.put('/:id', checkOwnership(prisma.projectSprint), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectSprint.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sprint not found' } });
    }

    const parsed = updateSprintSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const data = parsed.data;
    const updateData = { ...data } as Record<string, unknown>;

    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const sprint = await prisma.projectSprint.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: sprint });
  } catch (error) {
    logger.error('Update sprint error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update sprint' } });
  }
});

// DELETE /api/sprints/:id - Delete sprint
router.delete('/:id', checkOwnership(prisma.projectSprint), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectSprint.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sprint not found' } });
    }

    await prisma.projectSprint.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete sprint error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete sprint' } });
  }
});

export default router;
