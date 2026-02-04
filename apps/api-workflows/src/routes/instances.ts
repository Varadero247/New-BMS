import { Router, Request, Response } from 'express';
import { prisma } from '@ims/database';
import { z } from 'zod';

const router: Router = Router();

// Valid WorkflowPriority enum values
const priorityEnum = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']);

// Valid WorkflowInstanceStatus enum values
const statusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'WAITING_APPROVAL', 'PAUSED', 'COMPLETED', 'CANCELLED', 'ERROR', 'EXPIRED']);

// GET /api/instances - Get workflow instances
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, definitionId, initiatorId, page = '1', limit = '20' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (status) where.status = status;
    if (definitionId) where.definitionId = definitionId;
    if (initiatorId) where.initiatorId = initiatorId;

    const [instances, total] = await Promise.all([
      prisma.workflowInstance.findMany({
        where,
        include: {
          definition: { select: { name: true } },
          _count: { select: { tasks: true, history: true } },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.workflowInstance.count({ where }),
    ]);

    res.json({
      success: true,
      data: instances,
      meta: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Error fetching instances:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch instances' } });
  }
});

// GET /api/instances/stats/summary - Get instance statistics (must be before /:id)
router.get('/stats/summary', async (_req: Request, res: Response) => {
  try {
    const [byStatus, byPriority, recent] = await Promise.all([
      prisma.workflowInstance.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.workflowInstance.groupBy({
        by: ['priority'],
        _count: true,
      }),
      prisma.workflowInstance.findMany({
        where: { status: 'IN_PROGRESS' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          definition: { select: { name: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        byStatus,
        byPriority,
        recentActive: recent,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' } });
  }
});

// GET /api/instances/:id - Get single instance
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const instance = await prisma.workflowInstance.findUnique({
      where: { id: req.params.id },
      include: {
        definition: true,
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
        history: {
          orderBy: { actionAt: 'desc' },
        },
      },
    });

    if (!instance) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Instance not found' } });
    }

    res.json({ success: true, data: instance });
  } catch (error) {
    console.error('Error fetching instance:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch instance' } });
  }
});

// POST /api/instances - Start new workflow instance
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      definitionId: z.string().uuid(),
      initiatorId: z.string().uuid(),
      title: z.string().min(1),
      description: z.string().optional(),
      priority: priorityEnum.default('NORMAL'),
      entityType: z.string().optional(),
      entityId: z.string().optional(),
      variables: z.any().optional(),
      formData: z.any().optional(),
      dueDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Get definition
    const definition = await prisma.workflowDefinition.findUnique({
      where: { id: data.definitionId },
    });

    if (!definition) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Definition not found' } });
    }

    if (definition.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Definition must be active' } });
    }

    // Generate instance number
    const count = await prisma.workflowInstance.count();
    const instanceNumber = `WF-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // Create instance
    const instance = await prisma.workflowInstance.create({
      data: {
        instanceNumber,
        definitionId: data.definitionId,
        initiatorId: data.initiatorId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: 'IN_PROGRESS',
        entityType: data.entityType,
        entityId: data.entityId,
        variables: data.variables,
        formData: data.formData,
        startedAt: new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
      include: {
        definition: { select: { name: true } },
      },
    });

    // Create initial history entry
    await prisma.workflowHistory.create({
      data: {
        instanceId: instance.id,
        action: 'STARTED',
        actionBy: data.initiatorId,
        details: { message: 'Workflow instance started' },
      },
    });

    res.status(201).json({ success: true, data: instance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error creating instance:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create instance' } });
  }
});

// PUT /api/instances/:id/advance - Advance to next node
router.put('/:id/advance', async (req: Request, res: Response) => {
  try {
    const { nextNodeId, actionBy, comments } = req.body;

    const current = await prisma.workflowInstance.findUnique({ where: { id: req.params.id } });
    if (!current) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Instance not found' } });
    }

    // Add current node to completed nodes
    const completedNodeIds = current.completedNodeIds || [];
    if (current.currentNodeId && !completedNodeIds.includes(current.currentNodeId)) {
      completedNodeIds.push(current.currentNodeId);
    }

    const instance = await prisma.workflowInstance.update({
      where: { id: req.params.id },
      data: {
        currentNodeId: nextNodeId,
        completedNodeIds,
      },
    });

    // Record history
    await prisma.workflowHistory.create({
      data: {
        instanceId: req.params.id,
        action: 'NODE_COMPLETED',
        actionBy,
        nodeId: current.currentNodeId,
        details: { nextNodeId, comments },
      },
    });

    res.json({ success: true, data: instance });
  } catch (error) {
    console.error('Error advancing instance:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to advance instance' } });
  }
});

// PUT /api/instances/:id/complete - Complete workflow
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      actionBy: z.string().uuid().optional(),
      outcome: z.enum(['APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']).optional(),
      outcomeNotes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const instance = await prisma.workflowInstance.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        outcome: data.outcome,
        outcomeNotes: data.outcomeNotes,
      },
    });

    await prisma.workflowHistory.create({
      data: {
        instanceId: req.params.id,
        action: 'COMPLETED',
        actionBy: data.actionBy,
        details: { outcome: data.outcome, outcomeNotes: data.outcomeNotes },
      },
    });

    res.json({ success: true, data: instance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error completing instance:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete instance' } });
  }
});

// PUT /api/instances/:id/cancel - Cancel workflow
router.put('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { cancelledById, cancellationReason } = req.body;

    const instance = await prisma.workflowInstance.update({
      where: { id: req.params.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledById,
        cancellationReason,
      },
    });

    await prisma.workflowHistory.create({
      data: {
        instanceId: req.params.id,
        action: 'CANCELLED',
        actionBy: cancelledById,
        details: { reason: cancellationReason },
      },
    });

    res.json({ success: true, data: instance });
  } catch (error) {
    console.error('Error cancelling instance:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to cancel instance' } });
  }
});

export default router;
