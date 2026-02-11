import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();
router.use(authenticate);

// GET /api/sprints - List sprints by projectId
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, page = '1', limit = '50' } = req.query;

    if (!projectId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' } });
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { projectId: projectId as string };

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
    console.error('List sprints error:', error);
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
      where: { sprintId: req.params.id },
      orderBy: [{ backlogPriority: 'asc' }, { createdAt: 'asc' }],
    });

    res.json({ success: true, data: stories });
  } catch (error) {
    console.error('Get sprint stories error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get sprint stories' } });
  }
});

// POST /api/sprints - Create sprint
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      projectId: z.string().min(1),
      sprintNumber: z.number().min(1),
      sprintName: z.string().min(1),
      sprintGoal: z.string().optional(),
      startDate: z.string(),
      endDate: z.string(),
      duration: z.number().min(1),
      plannedVelocity: z.number().optional(),
      teamCapacity: z.number().optional(),
      status: z.string().optional(),
    });

    const data = schema.parse(req.body);

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
    console.error('Create sprint error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create sprint' } });
  }
});

// PUT /api/sprints/:id - Update sprint (including retrospective fields)
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectSprint.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sprint not found' } });
    }

    const data = req.body;
    const updateData: any = { ...data };

    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const sprint = await prisma.projectSprint.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: sprint });
  } catch (error) {
    console.error('Update sprint error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update sprint' } });
  }
});

// DELETE /api/sprints/:id - Delete sprint
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectSprint.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sprint not found' } });
    }

    await prisma.projectSprint.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Sprint deleted successfully' } });
  } catch (error) {
    console.error('Delete sprint error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete sprint' } });
  }
});

export default router;
