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

// GET /api/milestones - List milestones by projectId
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
    logger.error('List milestones error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list milestones' } });
  }
});

const createMilestoneSchema = z.object({
  projectId: z.string().trim().min(1).max(200),
  milestoneName: z.string().trim().min(1).max(200),
  milestoneDescription: z.string().optional(),
  plannedDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
  baselineDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  deliverables: z.string().optional(),
  requiresApproval: z.boolean().optional(),
  isCritical: z.boolean().optional(),
  status: z.string().optional(),
});
const updateMilestoneSchema = createMilestoneSchema.extend({
  actualDate: z.string().optional(),
  achievementPercentage: z.number().min(0).max(100).optional(),
}).partial();

// POST /api/milestones - Create milestone
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createMilestoneSchema.parse(req.body);

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
    logger.error('Create milestone error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create milestone' } });
  }
});

// PUT /api/milestones/:id - Update milestone
router.put('/:id', checkOwnership(prisma.projectMilestone), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectMilestone.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    const parsed = updateMilestoneSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const data = parsed.data;
    const updateData = { ...data } as Record<string, unknown>;

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
    logger.error('Update milestone error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update milestone' } });
  }
});

// PUT /api/milestones/:id/approve - Approve milestone
router.put('/:id/approve', checkOwnership(prisma.projectMilestone), async (req: AuthRequest, res: Response) => {
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
    logger.error('Approve milestone error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve milestone' } });
  }
});

// DELETE /api/milestones/:id - Delete milestone
router.delete('/:id', checkOwnership(prisma.projectMilestone), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectMilestone.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    await prisma.projectMilestone.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete milestone error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete milestone' } });
  }
});

export default router;
