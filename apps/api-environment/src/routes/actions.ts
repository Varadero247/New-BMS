import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-environment');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.envAction.count({
    where: { referenceNumber: { startsWith: `ENV-ACT-${year}` } },
  });
  return `ENV-ACT-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List actions
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status, priority, actionType, source, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.EnvActionWhereInput = { deletedAt: null };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (actionType) where.actionType = actionType;
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
        { assignedTo: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [actions, total] = await Promise.all([
      prisma.envAction.findMany({ where, skip, take: limitNum, orderBy: { dueDate: 'asc' } }),
      prisma.envAction.count({ where }),
    ]);

    res.json({
      success: true,
      data: actions,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List actions error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list actions' } });
  }
});

// GET /:id
router.get('/:id', checkOwnership(prisma.envAction), async (req: AuthRequest, res: Response) => {
  try {
    const action = await prisma.envAction.findUnique({ where: { id: req.params.id } });
    if (!action) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });
    res.json({ success: true, data: action });
  } catch (error) {
    logger.error('Get action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get action' } });
  }
});

// POST /
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      actionType: z.string().min(1),
      priority: z.string().min(1),
      source: z.string().min(1),
      description: z.string().min(1),
      assignedTo: z.string().min(1),
      dueDate: z.string().min(1),
      sourceReference: z.string().optional(),
      expectedOutcome: z.string().optional(),
      linkedAspectId: z.string().optional(),
      linkedEventId: z.string().optional(),
      linkedLegalId: z.string().optional(),
      linkedObjectiveId: z.string().optional(),
      department: z.string().optional(),
      estimatedHours: z.number().optional(),
      estimatedCost: z.number().optional(),
      resourcesRequired: z.string().optional(),
      status: z.string().optional(),
      progressNotes: z.string().optional(),
      completionDate: z.string().optional(),
      percentComplete: z.number().min(0).max(100).optional(),
      evidenceRefs: z.string().optional(),
      verificationMethod: z.string().optional(),
      verifiedBy: z.string().optional(),
      verificationDate: z.string().optional(),
      verificationNotes: z.string().optional(),
      effective: z.string().optional(),
      aiActionPlan: z.string().optional(),
      aiPriorityJustification: z.string().optional(),
      aiResourceEstimate: z.string().optional(),
      aiObstacles: z.string().optional(),
      aiSuccessCriteria: z.string().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const action = await prisma.envAction.create({
      data: {
        referenceNumber,
        title: data.title,
        actionType: data.actionType as any,
        priority: data.priority as any,
        source: data.source as any,
        sourceReference: data.sourceReference,
        description: data.description,
        expectedOutcome: data.expectedOutcome,
        linkedAspectId: data.linkedAspectId,
        linkedEventId: data.linkedEventId,
        linkedLegalId: data.linkedLegalId,
        linkedObjectiveId: data.linkedObjectiveId,
        assignedTo: data.assignedTo,
        department: data.department,
        dueDate: new Date(data.dueDate),
        estimatedHours: data.estimatedHours,
        estimatedCost: data.estimatedCost,
        resourcesRequired: data.resourcesRequired,
        status: (data.status as any) || 'OPEN',
        progressNotes: data.progressNotes,
        completionDate: data.completionDate ? new Date(data.completionDate) : null,
        percentComplete: data.percentComplete ?? 0,
        evidenceRefs: data.evidenceRefs,
        verificationMethod: data.verificationMethod as any,
        verifiedBy: data.verifiedBy,
        verificationDate: data.verificationDate ? new Date(data.verificationDate) : null,
        verificationNotes: data.verificationNotes,
        effective: data.effective as any,
        aiActionPlan: data.aiActionPlan,
        aiPriorityJustification: data.aiPriorityJustification,
        aiResourceEstimate: data.aiResourceEstimate,
        aiObstacles: data.aiObstacles,
        aiSuccessCriteria: data.aiSuccessCriteria,
        aiGenerated: data.aiGenerated ?? false,
      },
    });

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create action' } });
  }
});

// PUT /:id
router.put('/:id', checkOwnership(prisma.envAction), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envAction.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });

    const data = req.body;

    // Auto-set completionDate when status changes to COMPLETED
    if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED' && !data.completionDate) {
      data.completionDate = new Date();
    }

    // Convert date strings to Date objects
    if (data.dueDate && typeof data.dueDate === 'string') data.dueDate = new Date(data.dueDate);
    if (data.completionDate && typeof data.completionDate === 'string') data.completionDate = new Date(data.completionDate);
    if (data.verificationDate && typeof data.verificationDate === 'string') data.verificationDate = new Date(data.verificationDate);

    const action = await prisma.envAction.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: action });
  } catch (error) {
    logger.error('Update action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update action' } });
  }
});

// DELETE /:id
router.delete('/:id', checkOwnership(prisma.envAction), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envAction.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });
    await prisma.envAction.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete action' } });
  }
});

export default router;
