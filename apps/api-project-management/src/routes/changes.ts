import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-project-management');

const router: IRouter = Router();
router.use(authenticate);

// GET /api/changes - List change requests by projectId
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, page = '1', limit = '50' } = req.query;

    if (!projectId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' } });
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ProjectChangeWhereInput = { projectId: projectId as string };

    const [changes, total] = await Promise.all([
      prisma.projectChange.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { requestDate: 'desc' },
      }),
      prisma.projectChange.count({ where }),
    ]);

    res.json({
      success: true,
      data: changes,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List changes error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list change requests' } });
  }
});

// POST /api/changes - Create change request
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      projectId: z.string().min(1),
      changeCode: z.string().min(1),
      changeTitle: z.string().min(1),
      changeDescription: z.string().min(1),
      changeReason: z.string().min(1),
      changeType: z.enum(['SCOPE', 'SCHEDULE', 'BUDGET', 'QUALITY', 'RESOURCE', 'PROCESS']),
      impactOnScope: z.string().optional(),
      impactOnSchedule: z.number().optional(),
      impactOnBudget: z.number().optional(),
      impactOnQuality: z.string().optional(),
      impactOnRisk: z.string().optional(),
      impactOnResources: z.string().optional(),
      benefits: z.string().optional(),
      implementationPlan: z.string().optional(),
      priority: z.string().optional(),
      urgency: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const change = await prisma.projectChange.create({
      data: {
        projectId: data.projectId,
        changeCode: data.changeCode,
        changeTitle: data.changeTitle,
        changeDescription: data.changeDescription,
        changeReason: data.changeReason,
        changeType: data.changeType,
        requestedBy: req.user?.id,
        requestDate: new Date(),
        impactOnScope: data.impactOnScope,
        impactOnSchedule: data.impactOnSchedule,
        impactOnBudget: data.impactOnBudget,
        impactOnQuality: data.impactOnQuality,
        impactOnRisk: data.impactOnRisk,
        impactOnResources: data.impactOnResources,
        benefits: data.benefits,
        implementationPlan: data.implementationPlan,
        priority: data.priority || 'MEDIUM',
        urgency: data.urgency || 'NORMAL',
        status: 'SUBMITTED',
      },
    });

    res.status(201).json({ success: true, data: change });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Create change error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create change request' } });
  }
});

// PUT /api/changes/:id - Update change request
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectChange.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }

    const data = req.body;
    const updateData: any = { ...data };

    if (data.implementedAt) updateData.implementedAt = new Date(data.implementedAt);

    const change = await prisma.projectChange.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: change });
  } catch (error) {
    logger.error('Update change error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update change request' } });
  }
});

// PUT /api/changes/:id/review - Review change request
router.put('/:id/review', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectChange.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }

    const { status, reviewerComments } = req.body;

    const change = await prisma.projectChange.update({
      where: { id: req.params.id },
      data: {
        status: status || 'UNDER_REVIEW',
        reviewedBy: req.user?.id,
        reviewedAt: new Date(),
        reviewerComments,
      },
    });

    res.json({ success: true, data: change });
  } catch (error) {
    logger.error('Review change error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to review change request' } });
  }
});

// PUT /api/changes/:id/approve - Approve change request
router.put('/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectChange.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }

    const { status, approvalComments } = req.body;

    const change = await prisma.projectChange.update({
      where: { id: req.params.id },
      data: {
        status: status || 'APPROVED',
        approvedBy: req.user?.id,
        approvedAt: new Date(),
        approvalComments,
      },
    });

    res.json({ success: true, data: change });
  } catch (error) {
    logger.error('Approve change error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve change request' } });
  }
});

// DELETE /api/changes/:id - Delete change request
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectChange.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }

    await prisma.projectChange.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete change error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete change request' } });
  }
});

export default router;
