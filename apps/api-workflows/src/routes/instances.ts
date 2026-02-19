import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-workflows');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Valid WorkflowPriority enum values
const priorityEnum = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']);

// Valid WorkflowInstanceStatus enum values
const _statusEnum = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'WAITING_APPROVAL',
  'PAUSED',
  'COMPLETED',
  'CANCELLED',
  'ERROR',
  'EXPIRED',
]);

// GET /api/instances - Get workflow instances
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { status, definitionId, initiatedById, page = '1', limit = '20' } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (definitionId) where.definitionId = definitionId as string;
    if (initiatedById) where.initiatedById = initiatedById as string;

    const [instances, total] = await Promise.all([
      prisma.workflowInstance.findMany({
        where,
        include: {
          definition: { select: { name: true } },
          _count: { select: { tasks: true, history: true } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.workflowInstance.count({ where }),
    ]);

    res.json({
      success: true,
      data: instances,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('Error fetching instances', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch instances' },
    });
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
        where: { status: 'IN_PROGRESS', deletedAt: null },
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
    logger.error('Error fetching stats', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' },
    });
  }
});

// GET /api/instances/:id - Get single instance
router.get(
  '/:id',
  checkOwnership(prisma.workflowInstance),
  async (req: AuthRequest, res: Response) => {
    try {
      const instance = await prisma.workflowInstance.findUnique({
        where: { id: req.params.id },
        include: {
          definition: true,
          tasks: {
            orderBy: { createdAt: 'desc' },
          },
          history: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!instance) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Instance not found' } });
      }

      res.json({ success: true, data: instance });
    } catch (error) {
      logger.error('Error fetching instance', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch instance' },
      });
    }
  }
);

// POST /api/instances - Start new workflow instance
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      definitionId: z.string().trim(),
      initiatedById: z.string().trim(),
      priority: priorityEnum.default('NORMAL'),
      entityType: z.string().trim().optional(),
      entityId: z.string().trim().optional(),
      contextData: z.record(z.unknown()).optional(),
      slaDeadline: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    // Get definition
    const definition = await prisma.workflowDefinition.findUnique({
      where: { id: data.definitionId },
    });

    if (!definition) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Definition not found' } });
    }

    if (definition.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Definition must be active' },
      });
    }

    // Generate reference number
    const count = await prisma.workflowInstance.count();
    const referenceNumber = `WF-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // Create instance
    const instance = await prisma.workflowInstance.create({
      data: {
        referenceNumber,
        definitionId: data.definitionId,
        initiatedById: data.initiatedById,
        priority: data.priority,
        status: 'IN_PROGRESS',
        entityType: data.entityType,
        entityId: data.entityId,
        contextData: data.contextData as any,
        slaDeadline: data.slaDeadline ? new Date(data.slaDeadline) : undefined,
      },
      include: {
        definition: { select: { name: true } },
      },
    });

    // Create initial history entry
    await prisma.workflowHistory.create({
      data: {
        instanceId: instance.id,
        eventType: 'STARTED',
        actorId: data.initiatedById,
        description: 'Workflow instance started',
      },
    });

    res.status(201).json({ success: true, data: instance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating instance', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create instance' },
    });
  }
});

// PUT /api/instances/:id/advance - Advance to next node
const advanceInstanceSchema = z.object({
  nextStepId: z.string().trim().min(1).max(200),
  actionBy: z.string().trim().min(1).max(2000).optional(),
  comments: z.string().trim().max(2000).optional(),
});

router.put(
  '/:id/advance',
  checkOwnership(prisma.workflowInstance),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = advanceInstanceSchema.parse(req.body);

      const current = await prisma.workflowInstance.findUnique({ where: { id: req.params.id } });
      if (!current) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Instance not found' } });
      }

      const previousStepId = current.currentStepId;

      const instance = await prisma.$transaction(async (tx: any) => {
        const updated = await tx.workflowInstance.update({
          where: { id: req.params.id },
          data: {
            currentStepId: data.nextStepId,
          },
        });

        // Record history
        await tx.workflowHistory.create({
          data: {
            instanceId: req.params.id,
            eventType: 'STEP_COMPLETED',
            actorId: data.actionBy,
            stepId: previousStepId,
            description: data.comments,
            metadata: { nextStepId: data.nextStepId },
          },
        });

        return updated;
      });

      res.json({ success: true, data: instance });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
      }
      logger.error('Error advancing instance', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to advance instance' },
      });
    }
  }
);

// PUT /api/instances/:id/complete - Complete workflow
router.put(
  '/:id/complete',
  checkOwnership(prisma.workflowInstance),
  async (req: AuthRequest, res: Response) => {
    try {
      const schema = z.object({
        completedById: z.string().trim().optional(),
        outcome: z.enum(['APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']).optional(),
      });

      const data = schema.parse(req.body);

      const instance = await prisma.$transaction(async (tx: any) => {
        const updated = await tx.workflowInstance.update({
          where: { id: req.params.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            completedById: data.completedById,
            outcome: data.outcome,
          },
        });

        await tx.workflowHistory.create({
          data: {
            instanceId: req.params.id,
            eventType: 'COMPLETED',
            actorId: data.completedById,
            description: `Workflow completed with outcome: ${data.outcome || 'COMPLETED'}`,
          },
        });

        return updated;
      });

      res.json({ success: true, data: instance });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
      }
      logger.error('Error completing instance', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to complete instance' },
      });
    }
  }
);

// PUT /api/instances/:id/cancel - Cancel workflow
const cancelInstanceSchema = z.object({
  cancelledById: z.string().trim().uuid(),
  cancellationReason: z.string().trim().min(1).max(2000).optional(),
});

router.put(
  '/:id/cancel',
  checkOwnership(prisma.workflowInstance),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = cancelInstanceSchema.parse(req.body);

      const instance = await prisma.$transaction(async (tx: any) => {
        const updated = await tx.workflowInstance.update({
          where: { id: req.params.id },
          data: {
            status: 'CANCELLED',
            completedAt: new Date(),
            completedById: data.cancelledById,
            cancellationReason: data.cancellationReason,
          },
        });

        await tx.workflowHistory.create({
          data: {
            instanceId: req.params.id,
            eventType: 'CANCELLED',
            actorId: data.cancelledById,
            description: data.cancellationReason,
          },
        });

        return updated;
      });

      res.json({ success: true, data: instance });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
      }
      logger.error('Error cancelling instance', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to cancel instance' },
      });
    }
  }
);

export default router;
