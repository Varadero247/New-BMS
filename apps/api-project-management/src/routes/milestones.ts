import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();
router.use(authenticate);

// GET /api/milestones - List milestones by projectId
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

    const [milestones, total] = await Promise.all([
      prisma.projectMilestone.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { plannedDate: 'asc' },
      }),
      prisma.projectMilestone.count({ where }),
    ]);

    res.json({
      success: true,
      data: milestones,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List milestones error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list milestones' } });
  }
});

// POST /api/milestones - Create milestone
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      projectId: z.string().min(1),
      milestoneName: z.string().min(1),
      milestoneDescription: z.string().optional(),
      plannedDate: z.string(),
      baselineDate: z.string().optional(),
      deliverables: z.string().optional(),
      requiresApproval: z.boolean().optional(),
      isCritical: z.boolean().optional(),
      status: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const milestone = await prisma.projectMilestone.create({
      data: {
        projectId: data.projectId,
        milestoneName: data.milestoneName,
        milestoneDescription: data.milestoneDescription,
        plannedDate: new Date(data.plannedDate),
        baselineDate: data.baselineDate ? new Date(data.baselineDate) : null,
        deliverables: data.deliverables,
        requiresApproval: data.requiresApproval ?? true,
        isCritical: data.isCritical ?? false,
        status: data.status || 'UPCOMING',
        approvalStatus: 'PENDING',
        achievementPercentage: 0,
      },
    });

    res.status(201).json({ success: true, data: milestone });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create milestone error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create milestone' } });
  }
});

// PUT /api/milestones/:id - Update milestone
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectMilestone.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    const data = req.body;
    const updateData: any = { ...data };

    if (data.plannedDate) updateData.plannedDate = new Date(data.plannedDate);
    if (data.actualDate) updateData.actualDate = new Date(data.actualDate);
    if (data.baselineDate) updateData.baselineDate = new Date(data.baselineDate);

    // Auto-set achievement when status is ACHIEVED
    if (data.status === 'ACHIEVED' && existing.status !== 'ACHIEVED') {
      updateData.achievementPercentage = 100;
      if (!updateData.actualDate) updateData.actualDate = new Date();
    }

    const milestone = await prisma.projectMilestone.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: milestone });
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update milestone' } });
  }
});

// PUT /api/milestones/:id/approve - Approve milestone
router.put('/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectMilestone.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    const milestone = await prisma.projectMilestone.update({
      where: { id: req.params.id },
      data: {
        approvalStatus: 'APPROVED',
        approvedBy: req.user?.id,
        approvedAt: new Date(),
      },
    });

    res.json({ success: true, data: milestone });
  } catch (error) {
    console.error('Approve milestone error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve milestone' } });
  }
});

// DELETE /api/milestones/:id - Delete milestone
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectMilestone.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    await prisma.projectMilestone.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Milestone deleted successfully' } });
  } catch (error) {
    console.error('Delete milestone error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete milestone' } });
  }
});

export default router;
