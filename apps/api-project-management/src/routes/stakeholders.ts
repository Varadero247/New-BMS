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

// Helper: calculate stakeholder category from power/interest grid
function getStakeholderCategory(powerLevel: number, interestLevel: number): string {
  if (powerLevel >= 4 && interestLevel >= 4) return 'MANAGE_CLOSELY';
  if (powerLevel >= 4 && interestLevel < 4) return 'KEEP_SATISFIED';
  if (powerLevel < 4 && interestLevel >= 4) return 'KEEP_INFORMED';
  return 'MONITOR';
}

// GET /api/stakeholders - List stakeholders by projectId
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, page = '1', limit = '50' } = req.query;

    if (!projectId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' } });
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ProjectStakeholderWhereInput = { projectId: projectId as string, deletedAt: null };

    const [stakeholders, total] = await Promise.all([
      prisma.projectStakeholder.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ powerLevel: 'desc' }, { interestLevel: 'desc' }],
      }),
      prisma.projectStakeholder.count({ where }),
    ]);

    res.json({
      success: true,
      data: stakeholders,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List stakeholders error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list stakeholders' } });
  }
});

// POST /api/stakeholders - Create stakeholder
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      projectId: z.string().min(1),
      stakeholderName: z.string().min(1),
      stakeholderOrg: z.string().optional(),
      stakeholderRole: z.string().min(1),
      stakeholderType: z.enum(['INTERNAL', 'EXTERNAL', 'SPONSOR', 'CUSTOMER', 'SUPPLIER', 'REGULATOR']),
      email: z.string().optional(),
      phone: z.string().optional(),
      powerLevel: z.number().min(1).max(5),
      interestLevel: z.number().min(1).max(5),
      currentEngagement: z.string().optional(),
      desiredEngagement: z.string().optional(),
      engagementStrategy: z.string().optional(),
      communicationFrequency: z.string().optional(),
      communicationMethod: z.string().optional(),
      requirements: z.string().optional(),
      expectations: z.string().optional(),
      status: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const stakeholderCategory = getStakeholderCategory(data.powerLevel, data.interestLevel);

    const stakeholder = await prisma.projectStakeholder.create({
      data: {
        projectId: data.projectId,
        stakeholderName: data.stakeholderName,
        stakeholderOrg: data.stakeholderOrg,
        stakeholderRole: data.stakeholderRole,
        stakeholderType: data.stakeholderType,
        email: data.email,
        phone: data.phone,
        powerLevel: data.powerLevel,
        interestLevel: data.interestLevel,
        stakeholderCategory,
        currentEngagement: data.currentEngagement || 'NEUTRAL',
        desiredEngagement: data.desiredEngagement || 'SUPPORTIVE',
        engagementStrategy: data.engagementStrategy,
        communicationFrequency: data.communicationFrequency || 'MONTHLY',
        communicationMethod: data.communicationMethod,
        requirements: data.requirements,
        expectations: data.expectations,
        status: data.status || 'ACTIVE',
      },
    });

    res.status(201).json({ success: true, data: stakeholder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Create stakeholder error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create stakeholder' } });
  }
});

// PUT /api/stakeholders/:id - Update stakeholder
router.put('/:id', checkOwnership(prisma.projectStakeholder), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectStakeholder.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Stakeholder not found' } });
    }

    const data = req.body;
    const updateData = { ...data } as Record<string, unknown>;

    // Recalculate stakeholder category if power/interest changed
    const powerLevel = data.powerLevel ?? existing.powerLevel;
    const interestLevel = data.interestLevel ?? existing.interestLevel;
    updateData.stakeholderCategory = getStakeholderCategory(powerLevel, interestLevel);

    const stakeholder = await prisma.projectStakeholder.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: stakeholder });
  } catch (error) {
    logger.error('Update stakeholder error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update stakeholder' } });
  }
});

// DELETE /api/stakeholders/:id - Delete stakeholder
router.delete('/:id', checkOwnership(prisma.projectStakeholder), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectStakeholder.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Stakeholder not found' } });
    }

    await prisma.projectStakeholder.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete stakeholder error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete stakeholder' } });
  }
});

export default router;
