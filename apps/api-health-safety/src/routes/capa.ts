import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-health-safety');

const router: IRouter = Router();

router.use(authenticate);
router.param('id', validateIdParam());
router.param('aid', validateIdParam('aid'));

const CAPA_TYPES = ['CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT'] as const;
const CAPA_SOURCES = ['INCIDENT', 'NEAR_MISS', 'AUDIT', 'RISK_ASSESSMENT', 'LEGAL', 'MANAGEMENT_REVIEW', 'WORKER_SUGGESTION', 'OTHER'] as const;
const CAPA_PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
const CAPA_STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'CLOSED', 'OVERDUE'] as const;
const CAPA_ACTION_TYPES = ['IMMEDIATE', 'CORRECTIVE', 'PREVENTIVE'] as const;
const CAPA_ACTION_STATUSES = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'OVERDUE', 'CANCELLED'] as const;

// Generate reference number CAPA-001, CAPA-002, etc.
async function generateReferenceNumber(): Promise<string> {
  const last = await prisma.capa.findFirst({
    where: { deletedAt: null } as any,
    orderBy: { createdAt: 'desc' },
    select: { referenceNumber: true },
  });

  let nextNum = 1;
  if (last?.referenceNumber) {
    const match = last.referenceNumber.match(/CAPA-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  return `CAPA-${String(nextNum).padStart(3, '0')}`;
}

// Auto-set target completion date from priority
function getTargetDate(priority: string): Date {
  const now = new Date();
  switch (priority) {
    case 'CRITICAL': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);   // 7 days
    case 'HIGH':     return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);  // 14 days
    case 'MEDIUM':   return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);  // 30 days
    default:         return new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);  // 60 days
  }
}

// GET /api/capa - List CAPAs
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, capaType, source, priority, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (capaType) where.capaType = capaType as any;
    if (source) where.source = source as any;
    if (priority) where.priority = priority as any;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { problemStatement: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [capas, total] = await Promise.all([
      prisma.capa.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { actions: { orderBy: { sortOrder: 'asc' } } },
      }),
      prisma.capa.count({ where }),
    ]);

    res.json({
      success: true,
      data: capas,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List CAPAs error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list CAPAs' } });
  }
});

// GET /api/capa/:id - Get single CAPA
router.get('/:id', checkOwnership(prisma.capa), async (req: AuthRequest, res: Response) => {
  try {
    const capa = await prisma.capa.findUnique({
      where: { id: req.params.id },
      include: { actions: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!capa || (capa as any).deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    }

    res.json({ success: true, data: capa });
  } catch (error) {
    logger.error('Get CAPA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get CAPA' } });
  }
});

// POST /api/capa - Create CAPA
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const actionSchema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(CAPA_ACTION_TYPES),
      owner: z.string().optional(),
      dueDate: z.string().optional(),
    });

    const schema = z.object({
      title: z.string().min(1),
      capaType: z.enum(CAPA_TYPES),
      source: z.enum(CAPA_SOURCES),
      sourceReference: z.string().optional(),
      priority: z.enum(CAPA_PRIORITIES).optional(),
      targetCompletionDate: z.string().optional(),
      department: z.string().optional(),
      responsiblePerson: z.string().optional(),
      problemStatement: z.string().optional(),
      rootCauseAnalysis: z.string().optional(),
      containmentActions: z.string().optional(),
      successCriteria: z.string().optional(),
      verificationMethod: z.string().optional(),
      // AI
      aiAnalysis: z.string().optional(),
      aiAnalysisGenerated: z.boolean().optional(),
      // Relations
      incidentId: z.string().optional(),
      riskId: z.string().optional(),
      // Nested actions
      actions: z.array(actionSchema).optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateReferenceNumber();
    const priority = data.priority || 'MEDIUM';
    const targetCompletionDate = data.targetCompletionDate
      ? new Date(data.targetCompletionDate)
      : getTargetDate(priority);

    const capa = await prisma.capa.create({
      data: {
        id: uuidv4(),
        referenceNumber,
        title: data.title,
        capaType: data.capaType,
        source: data.source,
        sourceReference: data.sourceReference,
        priority,
        targetCompletionDate,
        department: data.department,
        responsiblePerson: data.responsiblePerson,
        problemStatement: data.problemStatement,
        rootCauseAnalysis: data.rootCauseAnalysis,
        containmentActions: data.containmentActions,
        successCriteria: data.successCriteria,
        verificationMethod: data.verificationMethod,
        aiAnalysis: data.aiAnalysis,
        aiAnalysisGenerated: data.aiAnalysisGenerated ?? false,
        incidentId: data.incidentId,
        riskId: data.riskId,
        createdBy: req.user?.id,
        status: 'OPEN',
        actions: data.actions ? {
          create: data.actions.map((a, i) => ({
            id: uuidv4(),
            title: a.title,
            description: a.description,
            type: a.type,
            owner: a.owner,
            dueDate: a.dueDate ? new Date(a.dueDate) : null,
            sortOrder: i,
          })),
        } : undefined,
      },
      include: { actions: { orderBy: { sortOrder: 'asc' } } },
    });

    res.status(201).json({ success: true, data: capa });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create CAPA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create CAPA' } });
  }
});

// PATCH /api/capa/:id - Update CAPA
router.patch('/:id', checkOwnership(prisma.capa), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.capa.findUnique({ where: { id: req.params.id } });
    if (!existing || (existing as any).deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      capaType: z.enum(CAPA_TYPES).optional(),
      source: z.enum(CAPA_SOURCES).optional(),
      sourceReference: z.string().optional(),
      priority: z.enum(CAPA_PRIORITIES).optional(),
      targetCompletionDate: z.string().optional(),
      department: z.string().optional(),
      responsiblePerson: z.string().optional(),
      problemStatement: z.string().optional(),
      rootCauseAnalysis: z.string().optional(),
      containmentActions: z.string().optional(),
      successCriteria: z.string().optional(),
      verificationMethod: z.string().optional(),
      aiAnalysis: z.string().optional(),
      aiAnalysisGenerated: z.boolean().optional(),
      status: z.enum(CAPA_STATUSES).optional(),
      closureNotes: z.string().optional(),
      effectivenessRating: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: any = { ...data };
    if (data.targetCompletionDate) updateData.targetCompletionDate = new Date(data.targetCompletionDate);
    if (data.status === 'CLOSED') {
      (updateData as any).closedDate = new Date();
      (updateData as any).closedBy = req.user?.id;
    }

    const capa = await prisma.capa.update({
      where: { id: req.params.id },
      data: updateData,
      include: { actions: { orderBy: { sortOrder: 'asc' } } },
    });

    res.json({ success: true, data: capa });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update CAPA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update CAPA' } });
  }
});

// DELETE /api/capa/:id - Delete CAPA (cascades actions)
router.delete('/:id', checkOwnership(prisma.capa), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.capa.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    }

    await prisma.capa.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete CAPA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete CAPA' } });
  }
});

// POST /api/capa/:id/actions - Add action to CAPA
router.post('/:id/actions', async (req: AuthRequest, res: Response) => {
  try {
    const capa = await prisma.capa.findUnique({
      where: { id: req.params.id },
      include: { actions: true },
    });
    if (!capa || (capa as any).deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    }

    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(CAPA_ACTION_TYPES),
      owner: z.string().optional(),
      dueDate: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const nextOrder = capa.actions.length;

    const action = await prisma.capaAction.create({
      data: {
        id: uuidv4(),
        capaId: req.params.id,
        title: data.title,
        description: data.description,
        type: data.type,
        owner: data.owner,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        sortOrder: nextOrder,
      },
    });

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Add CAPA action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add CAPA action' } });
  }
});

// PATCH /api/capa/:id/actions/:aid - Update CAPA action
router.patch('/:id/actions/:aid', async (req: AuthRequest, res: Response) => {
  try {
    const action = await prisma.capaAction.findUnique({ where: { id: req.params.aid } });
    if (!action || action.capaId !== req.params.id) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA action not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      type: z.enum(CAPA_ACTION_TYPES).optional(),
      owner: z.string().optional(),
      dueDate: z.string().optional(),
      status: z.enum(CAPA_ACTION_STATUSES).optional(),
    });

    const data = schema.parse(req.body);

    const updateData: any = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.status === 'COMPLETED' || data.status === 'VERIFIED') {
      (updateData as any).completedAt = new Date();
    }

    const updated = await prisma.capaAction.update({
      where: { id: req.params.aid },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update CAPA action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update CAPA action' } });
  }
});

export default router;
