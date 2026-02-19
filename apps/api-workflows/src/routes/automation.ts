import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-workflows');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Validation schemas
const createRuleSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().optional(),
  code: z.string().trim().min(1).max(100),
  triggerType: z.enum(['EVENT', 'SCHEDULED', 'CONDITION', 'WORKFLOW_EVENT', 'API', 'WEBHOOK']),
  triggerEvent: z.string().trim().optional(),
  triggerSchedule: z.string().trim().optional(),
  triggerCondition: z.record(z.unknown()).optional(),
  actionType: z.enum([
    'CREATE_WORKFLOW',
    'UPDATE_ENTITY',
    'SEND_NOTIFICATION',
    'CALL_WEBHOOK',
    'EXECUTE_SCRIPT',
    'ASSIGN_TASK',
    'ESCALATE',
    'UPDATE_STATUS',
    'GENERATE_REPORT',
    'CUSTOM',
  ]),
  actionConfig: z.record(z.unknown()),
  entityType: z.string().trim().optional(),
  workflowCategory: z
    .enum([
      'APPROVAL',
      'REVIEW',
      'CHANGE_MANAGEMENT',
      'INCIDENT',
      'REQUEST',
      'ONBOARDING',
      'OFFBOARDING',
      'PROCUREMENT',
      'DOCUMENT_CONTROL',
      'AUDIT',
      'CAPA',
      'TRAINING',
      'CUSTOM',
    ])
    .optional(),
  priority: z.number().int().min(0).max(100).default(0),
  maxRetries: z.number().int().min(0).max(10).default(3),
  retryDelaySeconds: z.number().int().min(1).max(3600).default(60),
  timeoutSeconds: z.number().int().min(1).max(3600).default(300),
  isActive: z.boolean().default(true),
});

const updateRuleSchema = createRuleSchema.partial().omit({ code: true });

// GET /api/automation/rules - Get automation rules
router.get('/rules', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { triggerType, actionType, isActive, entityType } = req.query;

    const where: Record<string, unknown> = { deletedAt: null };
    if (triggerType) where.triggerType = triggerType as string;
    if (actionType) where.actionType = actionType as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (entityType) where.entityType = entityType;

    const rules = await prisma.automationRule.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { executions: true },
        },
      },
      take: 100,
    });

    res.json({ success: true, data: rules });
  } catch (error) {
    logger.error('Error fetching automation rules', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch automation rules' },
    });
  }
});

// GET /api/automation/rules/:id - Get single rule
router.get(
  '/rules/:id',
  checkOwnership(prisma.automationRule),
  async (req: Request, res: Response) => {
    try {
      const rule = await prisma.automationRule.findUnique({
        where: { id: req.params.id },
        include: {
          executions: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { executions: true },
          },
        },
      });

      if (!rule) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Automation rule not found' },
        });
      }

      res.json({ success: true, data: rule });
    } catch (error) {
      logger.error('Error fetching automation rule', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch automation rule' },
      });
    }
  }
);

// POST /api/automation/rules - Create automation rule
router.post('/rules', async (req: Request, res: Response) => {
  try {
    const data = createRuleSchema.parse(req.body);

    // Check for duplicate code
    const existing = await prisma.automationRule.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE', message: 'Rule with this code already exists' },
      });
    }

    const rule = await prisma.automationRule.create({
      data: {
        name: data.name,
        description: data.description,
        code: data.code,
        triggerType: data.triggerType,
        triggerEvent: data.triggerEvent,
        triggerSchedule: data.triggerSchedule,
        triggerCondition: data.triggerCondition as Prisma.InputJsonValue,
        actionType: data.actionType,
        actionConfig: data.actionConfig as Prisma.InputJsonValue,
        entityType: data.entityType,
        workflowCategory: data.workflowCategory,
        priority: data.priority,
        maxRetries: data.maxRetries,
        retryDelaySeconds: data.retryDelaySeconds,
        timeoutSeconds: data.timeoutSeconds,
        isActive: data.isActive,
      },
    });

    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors },
      });
    }
    logger.error('Error creating automation rule', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create automation rule' },
    });
  }
});

// PUT /api/automation/rules/:id - Update automation rule
router.put(
  '/rules/:id',
  checkOwnership(prisma.automationRule),
  async (req: Request, res: Response) => {
    try {
      const data = updateRuleSchema.parse(req.body);

      const rule = await prisma.automationRule.update({
        where: { id: req.params.id },
        data: data as Record<string, unknown>,
      });

      res.json({ success: true, data: rule });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: error.errors },
        });
      }
      logger.error('Error updating automation rule', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update automation rule' },
      });
    }
  }
);

// DELETE /api/automation/rules/:id - Delete automation rule
router.delete(
  '/rules/:id',
  checkOwnership(prisma.automationRule),
  async (req: Request, res: Response) => {
    try {
      await prisma.automationRule.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting automation rule', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete automation rule' },
      });
    }
  }
);

// POST /api/automation/rules/:id/execute - Execute rule manually
const executeRuleSchema = z.object({
  triggerData: z.record(z.unknown()).optional(),
  entityType: z.string().trim().min(1).max(100).optional(),
  entityId: z.string().trim().uuid().optional(),
});

router.post('/rules/:id/execute', async (req: Request, res: Response) => {
  try {
    const { triggerData, entityType, entityId } = executeRuleSchema.parse(req.body);

    const rule = await prisma.automationRule.findUnique({
      where: { id: req.params.id },
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Automation rule not found' },
      });
    }

    if (!rule.isActive) {
      return res.status(400).json({
        success: false,
        error: { code: 'RULE_INACTIVE', message: 'Cannot execute inactive rule' },
      });
    }

    // Create execution record
    const execution = await prisma.automationExecution.create({
      data: {
        ruleId: rule.id,
        triggeredBy: (req as AuthRequest).user?.id || 'MANUAL',
        triggerType: 'API',
        triggerData: (triggerData || {}) as Prisma.InputJsonValue,
        entityType: entityType || rule.entityType,
        entityId,
        status: 'PENDING',
      },
    });

    // In a real implementation, this would queue the execution
    // For now, we'll simulate immediate execution
    const startTime = Date.now();

    try {
      // Simulate action execution based on type
      const result = await executeAction(rule, execution, triggerData);

      await prisma.automationExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          startedAt: new Date(startTime),
          completedAt: new Date(),
          durationMs: Date.now() - startTime,
          result: result as string,
          output: JSON.stringify(result),
        },
      });

      // Update rule stats
      await prisma.automationRule.update({
        where: { id: rule.id },
        data: {
          lastExecutedAt: new Date(),
          executionCount: { increment: 1 },
        },
      });

      res.json({
        success: true,
        data: {
          executionId: execution.id,
          status: 'COMPLETED',
          result,
        },
      });
    } catch (execError) {
      await prisma.automationExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          startedAt: new Date(startTime),
          completedAt: new Date(),
          durationMs: Date.now() - startTime,
          errorMessage: execError instanceof Error ? execError.message : 'Unknown error',
        },
      });

      await prisma.automationRule.update({
        where: { id: rule.id },
        data: {
          lastExecutedAt: new Date(),
          failureCount: { increment: 1 },
        },
      });

      throw execError;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors },
      });
    }
    logger.error('Error executing automation rule', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'EXECUTION_ERROR', message: 'Failed to execute automation rule' },
    });
  }
});

// GET /api/automation/executions - Get execution history
router.get('/executions', async (req: Request, res: Response) => {
  try {
    const { ruleId, status, entityType, limit = '50', offset = '0' } = req.query;

    const where: Record<string, unknown> = { deletedAt: null };
    if (ruleId) where.ruleId = ruleId as string;
    if (status) where.status = status as string;
    if (entityType) where.entityType = entityType as string;

    const [executions, total] = await Promise.all([
      prisma.automationExecution.findMany({
        where,
        take: Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100),
        skip: Math.max(0, parseInt(offset as string, 10) || 0),
        orderBy: { createdAt: 'desc' },
        include: {
          rule: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      prisma.automationExecution.count({ where }),
    ]);

    res.json({
      success: true,
      data: executions,
      pagination: {
        total,
        limit: Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100),
        offset: Math.max(0, parseInt(offset as string, 10) || 0),
      },
    });
  } catch (error) {
    logger.error('Error fetching executions', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch executions' },
    });
  }
});

// GET /api/automation/executions/:id - Get single execution
router.get('/executions/:id', async (req: Request, res: Response) => {
  try {
    const execution = await prisma.automationExecution.findUnique({
      where: { id: req.params.id },
      include: {
        rule: true,
      },
    });

    if (!execution) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Execution not found' },
      });
    }

    res.json({ success: true, data: execution });
  } catch (error) {
    logger.error('Error fetching execution', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch execution' },
    });
  }
});

// POST /api/automation/executions/:id/retry - Retry failed execution
router.post('/executions/:id/retry', async (req: Request, res: Response) => {
  try {
    const execution = await prisma.automationExecution.findUnique({
      where: { id: req.params.id },
      include: { rule: true },
    });

    if (!execution) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Execution not found' },
      });
    }

    if (execution.status !== 'FAILED' && execution.status !== 'TIMEOUT') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Only failed executions can be retried' },
      });
    }

    if (execution.attemptNumber >= execution.rule.maxRetries) {
      return res.status(400).json({
        success: false,
        error: { code: 'MAX_RETRIES', message: 'Maximum retry attempts reached' },
      });
    }

    // Create new execution for retry
    const retryExecution = await prisma.automationExecution.create({
      data: {
        ruleId: execution.ruleId,
        triggeredBy: (req as AuthRequest).user?.id || 'RETRY',
        triggerType: execution.triggerType,
        triggerData: execution.triggerData ?? undefined,
        entityType: execution.entityType,
        entityId: execution.entityId,
        status: 'RETRYING',
        attemptNumber: execution.attemptNumber + 1,
      },
    });

    res.json({
      success: true,
      data: { executionId: retryExecution.id, attemptNumber: retryExecution.attemptNumber },
    });
  } catch (error) {
    logger.error('Error retrying execution', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retry execution' },
    });
  }
});

// GET /api/automation/stats - Get automation statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [totalRules, activeRules, executionsByStatus, recentExecutions, topRules] =
      await Promise.all([
        prisma.automationRule.count(),
        prisma.automationRule.count({ where: { isActive: true } }),
        prisma.automationExecution.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
        prisma.automationExecution.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            rule: { select: { name: true, code: true } },
          },
        }),
        prisma.automationRule.findMany({
          where: { deletedAt: null },
          take: 5,
          orderBy: { executionCount: 'desc' },
          select: {
            id: true,
            name: true,
            code: true,
            executionCount: true,
            failureCount: true,
            lastExecutedAt: true,
          },
        }),
      ]);

    res.json({
      success: true,
      data: {
        totalRules,
        activeRules,
        inactiveRules: totalRules - activeRules,
        executionsByStatus: executionsByStatus.map((e: { status: string; _count: { status: number } }) => ({
          status: e.status,
          count: e._count.status,
        })),
        recentExecutions,
        topRules,
      },
    });
  } catch (error) {
    logger.error('Error fetching automation stats', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch statistics' },
    });
  }
});

// Helper function to execute automation action
async function executeAction(
  rule: { actionConfig: unknown; actionType: string },
  _execution: unknown,
  _triggerData: unknown
): Promise<unknown> {
  const config = rule.actionConfig;

  switch (rule.actionType) {
    case 'CREATE_WORKFLOW':
      // Create a new workflow instance
      return { action: 'CREATE_WORKFLOW', message: 'Workflow creation triggered', config };

    case 'SEND_NOTIFICATION':
      // Send notification
      return { action: 'SEND_NOTIFICATION', message: 'Notification sent', config };

    case 'UPDATE_ENTITY':
      // Update entity
      return { action: 'UPDATE_ENTITY', message: 'Entity updated', config };

    case 'CALL_WEBHOOK':
      // Call external webhook
      return { action: 'CALL_WEBHOOK', message: 'Webhook called', config };

    case 'ASSIGN_TASK':
      // Create and assign task
      return { action: 'ASSIGN_TASK', message: 'Task assigned', config };

    case 'UPDATE_STATUS':
      // Update status
      return { action: 'UPDATE_STATUS', message: 'Status updated', config };

    default:
      return { action: rule.actionType, message: 'Action executed', config };
  }
}

export default router;
