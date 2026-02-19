import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
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
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (priority) where.priority = priority as any;
    if (actionType) where.actionType = actionType as any;
    if (source) where.source = source as any;
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
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list actions' },
    });
  }
});

// GET /:id
router.get('/:id', checkOwnership(prisma.envAction), async (req: AuthRequest, res: Response) => {
  try {
    const action = await prisma.envAction.findUnique({ where: { id: req.params.id } });
    if (!action)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });
    res.json({ success: true, data: action });
  } catch (error) {
    logger.error('Get action error', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get action' } });
  }
});

// POST /
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      actionType: z.string().trim().min(1).max(2000),
      priority: z.string().trim().min(1).max(200),
      source: z.string().trim().min(1).max(200),
      description: z.string().trim().min(1).max(2000),
      assignedTo: z.string().trim().min(1).max(200),
      dueDate: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      sourceReference: z.string().trim().optional(),
      expectedOutcome: z.string().trim().optional(),
      linkedAspectId: z.string().trim().optional(),
      linkedEventId: z.string().trim().optional(),
      linkedLegalId: z.string().trim().optional(),
      linkedObjectiveId: z.string().trim().optional(),
      department: z.string().trim().optional(),
      estimatedHours: z.number().nonnegative().optional(),
      estimatedCost: z.number().nonnegative().optional(),
      resourcesRequired: z.string().trim().optional(),
      status: z.string().trim().optional(),
      progressNotes: z.string().trim().optional(),
      completionDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      percentComplete: z.number().min(0).max(100).optional(),
      evidenceRefs: z.string().trim().optional(),
      verificationMethod: z.string().trim().optional(),
      verifiedBy: z.string().trim().optional(),
      verificationDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      verificationNotes: z.string().trim().optional(),
      effective: z.string().trim().optional(),
      aiActionPlan: z.string().trim().optional(),
      aiPriorityJustification: z.string().trim().optional(),
      aiResourceEstimate: z.string().trim().optional(),
      aiObstacles: z.string().trim().optional(),
      aiSuccessCriteria: z.string().trim().optional(),
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
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create action error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create action' },
    });
  }
});

// PUT /:id
const actionUpdateSchema = z.object({
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  category: z.string().trim().optional(),
  linkedAspectId: z.string().trim().optional(),
  linkedObjectiveId: z.string().trim().optional(),
  assignedTo: z.string().trim().optional(),
  department: z.string().trim().optional(),
  priority: z.string().trim().optional(),
  dueDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  completionDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  verificationDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  verifiedBy: z.string().trim().optional(),
  status: z.string().trim().optional(),
  progress: z.number().min(0).max(100).optional(),
  evidence: z.string().trim().optional(),
  resources: z.string().trim().optional(),
  budget: z.number().nonnegative().optional(),
  actualCost: z.number().nonnegative().optional(),
  aiSuggestedActions: z.string().trim().optional(),
  aiTimeline: z.string().trim().optional(),
  aiSuccessCriteria: z.string().trim().optional(),
  aiGenerated: z.boolean().optional(),
});

router.put('/:id', checkOwnership(prisma.envAction), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envAction.findUnique({ where: { id: req.params.id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });

    const parsed = actionUpdateSchema.safeParse(req.body);
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

    // Auto-set completionDate when status changes to COMPLETED
    if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED' && !data.completionDate) {
      data.completionDate = new Date();
    }

    // Convert date strings to Date objects
    if (data.dueDate && typeof data.dueDate === 'string')
      data.dueDate = new Date(data.dueDate as string);
    if (data.completionDate && typeof data.completionDate === 'string')
      data.completionDate = new Date(data.completionDate as string);
    if (data.verificationDate && typeof data.verificationDate === 'string')
      data.verificationDate = new Date(data.verificationDate as string);

    const action = await prisma.envAction.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: action });
  } catch (error) {
    logger.error('Update action error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update action' },
    });
  }
});

// DELETE /:id
router.delete('/:id', checkOwnership(prisma.envAction), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envAction.findUnique({ where: { id: req.params.id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });
    await prisma.envAction.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: req.user?.id },
    });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete action error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete action' },
    });
  }
});

export default router;
