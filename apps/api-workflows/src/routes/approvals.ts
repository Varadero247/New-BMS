import { Router, Request, Response } from 'express';
import { prisma } from '@ims/database';
import type { Prisma } from '@ims/database/workflows';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-workflows');

const router: Router = Router();
router.use(authenticate);

// ============================================
// APPROVAL CHAINS
// ============================================

// GET /api/approvals/chains - Get approval chains
router.get('/chains', async (req: Request, res: Response) => {
  try {
    const { chainType, isActive } = req.query;

    const where: Prisma.ApprovalChainWhereInput = {};
    if (chainType) where.chainType = chainType as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const chains = await prisma.approvalChain.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: chains });
  } catch (error) {
    logger.error('Error fetching approval chains', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch chains' },
    });
  }
});

// GET /api/approvals/chains/:id - Get single approval chain
router.get('/chains/:id', async (req: Request, res: Response) => {
  try {
    const chain = await prisma.approvalChain.findUnique({
      where: { id: req.params.id },
    });

    if (!chain) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Chain not found' },
      });
    }

    res.json({ success: true, data: chain });
  } catch (error) {
    logger.error('Error fetching chain', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch chain' },
    });
  }
});

// POST /api/approvals/chains - Create approval chain
router.post('/chains', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      definitionId: z.string().uuid().optional(),
      name: z.string().min(1),
      description: z.string().optional(),
      chainType: z.enum(['SEQUENTIAL', 'PARALLEL', 'HIERARCHICAL', 'DYNAMIC']),
      levels: z.any(),
      skipConditions: z.any().optional(),
      escalationConfig: z.any().optional(),
    });

    const data = schema.parse(req.body);

    const chain = await prisma.approvalChain.create({
      data: {
        definitionId: data.definitionId,
        name: data.name,
        description: data.description,
        chainType: data.chainType,
        levels: data.levels,
        skipConditions: data.skipConditions,
        escalationConfig: data.escalationConfig,
      },
    });

    res.status(201).json({ success: true, data: chain });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors },
      });
    }
    logger.error('Error creating chain', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create chain' },
    });
  }
});

// PUT /api/approvals/chains/:id - Update approval chain
router.put('/chains/:id', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      chainType: z.enum(['SEQUENTIAL', 'PARALLEL', 'HIERARCHICAL', 'DYNAMIC']).optional(),
      levels: z.any().optional(),
      skipConditions: z.any().optional(),
      escalationConfig: z.any().optional(),
      isActive: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const chain = await prisma.approvalChain.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: chain });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors },
      });
    }
    logger.error('Error updating chain', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update chain' },
    });
  }
});

// DELETE /api/approvals/chains/:id - Delete approval chain
router.delete('/chains/:id', async (req: Request, res: Response) => {
  try {
    await prisma.approvalChain.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting chain', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete chain' },
    });
  }
});

// ============================================
// APPROVAL REQUESTS
// ============================================

// Helper to generate request number
function generateRequestNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `APR-${timestamp}-${random}`;
}

// GET /api/approvals/requests - Get approval requests
router.get('/requests', async (req: Request, res: Response) => {
  try {
    const {
      status,
      requestType,
      requesterId,
      entityType,
      limit = '50',
      offset = '0',
    } = req.query;

    const where: Prisma.ApprovalRequestWhereInput = {};
    if (status) where.status = status as string;
    if (requestType) where.requestType = requestType as string;
    if (requesterId) where.requesterId = requesterId as string;
    if (entityType) where.entityType = entityType as string;

    const [requests, total] = await Promise.all([
      prisma.approvalRequest.findMany({
        where,
        take: Math.min(parseInt(limit as string, 10) || 20, 100),
        skip: Math.max(0, parseInt(offset as string, 10) || 0),
        orderBy: { createdAt: 'desc' },
        include: {
          responses: {
            orderBy: { respondedAt: 'desc' },
            take: 5,
          },
          _count: {
            select: { responses: true },
          },
        },
      }),
      prisma.approvalRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        limit: Math.min(parseInt(limit as string, 10) || 20, 100),
        offset: Math.max(0, parseInt(offset as string, 10) || 0),
      },
    });
  } catch (error) {
    logger.error('Error fetching approval requests', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch requests' },
    });
  }
});

// GET /api/approvals/requests/pending/:userId - Get pending approvals for user
router.get('/requests/pending/:userId', async (req: Request, res: Response) => {
  try {
    // Get pending approval requests where user is an approver at the current level
    const pendingRequests = await prisma.approvalRequest.findMany({
      where: {
        status: { in: ['PENDING', 'IN_REVIEW'] },
      },
      include: {
        responses: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter to requests where this user needs to respond at the current level
    const userPending = pendingRequests.filter((request) => {
      const userResponded = request.responses.some(
        (r) => r.approverId === req.params.userId && r.level === request.currentLevel
      );
      return !userResponded;
    });

    // Also get workflow step approvals
    const workflowApprovals = await prisma.workflowStepApproval.findMany({
      where: {
        approverId: req.params.userId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        approvalRequests: userPending,
        workflowApprovals,
        total: userPending.length + workflowApprovals.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching pending approvals', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch approvals' },
    });
  }
});

// GET /api/approvals/requests/:id - Get single approval request
router.get('/requests/:id', async (req: Request, res: Response) => {
  try {
    const request = await prisma.approvalRequest.findUnique({
      where: { id: req.params.id },
      include: {
        responses: {
          orderBy: { respondedAt: 'asc' },
        },
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Approval request not found' },
      });
    }

    res.json({ success: true, data: request });
  } catch (error) {
    logger.error('Error fetching approval request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch request' },
    });
  }
});

// POST /api/approvals/requests - Create approval request
router.post('/requests', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      requestType: z.enum([
        'DOCUMENT_APPROVAL', 'PURCHASE_REQUEST', 'LEAVE_REQUEST', 'EXPENSE_CLAIM',
        'CHANGE_REQUEST', 'ACCESS_REQUEST', 'POLICY_EXCEPTION', 'BUDGET_APPROVAL',
        'CONTRACT_APPROVAL', 'CUSTOM'
      ]),
      priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL']).default('NORMAL'),
      requesterId: z.string(),
      requesterName: z.string().optional(),
      departmentId: z.string().optional(),
      entityType: z.string().optional(),
      entityId: z.string().optional(),
      entityData: z.any().optional(),
      approvalChainId: z.string().optional(),
      totalLevels: z.number().int().min(1).default(1),
      dueDate: z.string().datetime().optional(),
    });

    const data = schema.parse(req.body);

    const request = await prisma.approvalRequest.create({
      data: {
        requestNumber: generateRequestNumber(),
        title: data.title,
        description: data.description,
        requestType: data.requestType,
        priority: data.priority,
        requesterId: data.requesterId,
        requesterName: data.requesterName,
        departmentId: data.departmentId,
        entityType: data.entityType,
        entityId: data.entityId,
        entityData: data.entityData,
        approvalChainId: data.approvalChainId,
        totalLevels: data.totalLevels,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: 'PENDING',
      },
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors },
      });
    }
    logger.error('Error creating approval request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create request' },
    });
  }
});

// PUT /api/approvals/requests/:id/respond - Respond to approval request
router.put('/requests/:id/respond', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      approverId: z.string(),
      approverName: z.string().optional(),
      approverRole: z.string().optional(),
      decision: z.enum([
        'APPROVE', 'APPROVED', 'APPROVED_WITH_COMMENTS', 'REJECT', 'REJECTED',
        'RETURNED_FOR_REVISION', 'REQUEST_CHANGES', 'DELEGATE', 'ABSTAIN'
      ]),
      comments: z.string().optional(),
      conditions: z.string().optional(),
      attachments: z.any().optional(),
    });

    const data = schema.parse(req.body);

    const request = await prisma.approvalRequest.findUnique({
      where: { id: req.params.id },
      include: { responses: true },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Approval request not found' },
      });
    }

    if (request.status !== 'PENDING' && request.status !== 'IN_REVIEW') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Request is not pending approval' },
      });
    }

    // Check if user already responded at this level
    const existingResponse = request.responses.find(
      (r) => r.approverId === data.approverId && r.level === request.currentLevel
    );

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_RESPONDED', message: 'You have already responded at this level' },
      });
    }

    // Create response
    const response = await prisma.approvalResponse.create({
      data: {
        requestId: request.id,
        approverId: data.approverId,
        approverName: data.approverName,
        approverRole: data.approverRole,
        level: request.currentLevel,
        decision: data.decision,
        comments: data.comments,
        conditions: data.conditions,
        attachments: data.attachments,
      },
    });

    // Determine new status based on decision
    let newStatus: string = request.status;
    let outcome: string | null = request.outcome;
    let decidedAt: Date | null = request.decidedAt;
    let currentLevel = request.currentLevel;

    const isRejection = ['REJECT', 'REJECTED'].includes(data.decision);
    const isApproval = ['APPROVE', 'APPROVED', 'APPROVED_WITH_COMMENTS'].includes(data.decision);

    if (isRejection) {
      newStatus = 'REJECTED';
      outcome = 'REJECTED';
      decidedAt = new Date();
    } else if (isApproval) {
      if (request.currentLevel >= request.totalLevels) {
        // Final level approved
        newStatus = 'APPROVED';
        outcome = data.conditions ? 'APPROVED_WITH_CONDITIONS' : 'APPROVED';
        decidedAt = new Date();
      } else {
        // Move to next level
        currentLevel = request.currentLevel + 1;
        newStatus = 'IN_REVIEW';
      }
    } else if (data.decision === 'RETURNED_FOR_REVISION') {
      newStatus = 'DRAFT';
      currentLevel = 1;
    }

    // Update request
    await prisma.approvalRequest.update({
      where: { id: request.id },
      data: {
        status: newStatus as any,
        outcome: outcome as any,
        decidedAt,
        currentLevel,
      },
    });

    res.json({
      success: true,
      data: {
        response,
        requestStatus: newStatus,
        outcome,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors },
      });
    }
    logger.error('Error responding to approval request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to respond' },
    });
  }
});

// PUT /api/approvals/requests/:id/cancel - Cancel approval request
router.put('/requests/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;

    const request = await prisma.approvalRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'CANCELLED',
        outcome: 'CANCELLED',
        decidedAt: new Date(),
        outcomeReason: reason,
      },
    });

    res.json({ success: true, data: request });
  } catch (error) {
    logger.error('Error cancelling approval request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to cancel request' },
    });
  }
});

// ============================================
// WORKFLOW STEP APPROVALS
// ============================================

// PUT /api/approvals/step/:id/respond - Respond to workflow step approval
router.put('/step/:id/respond', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      decision: z.enum([
        'APPROVE', 'APPROVED', 'APPROVED_WITH_COMMENTS', 'REJECT', 'REJECTED',
        'RETURNED_FOR_REVISION', 'REQUEST_CHANGES', 'DELEGATE', 'ABSTAIN'
      ]),
      comments: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const isRejection = ['REJECT', 'REJECTED'].includes(data.decision);
    const status = isRejection ? 'REJECTED' : 'APPROVED';

    const approval = await prisma.workflowStepApproval.update({
      where: { id: req.params.id },
      data: {
        decision: data.decision,
        comments: data.comments,
        decidedAt: new Date(),
        status,
      },
    });

    res.json({ success: true, data: approval });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors },
      });
    }
    logger.error('Error responding to approval', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to respond' },
    });
  }
});

// GET /api/approvals/step - Get workflow step approvals
router.get('/step', async (req: Request, res: Response) => {
  try {
    const { stepInstanceId, approverId, status, limit = '50', offset = '0' } = req.query;

    const where: Prisma.WorkflowStepApprovalWhereInput = {};
    if (stepInstanceId) where.stepInstanceId = stepInstanceId as string;
    if (approverId) where.approverId = approverId as string;
    if (status) where.status = status as string;

    const [approvals, total] = await Promise.all([
      prisma.workflowStepApproval.findMany({
        where,
        take: Math.min(parseInt(limit as string, 10) || 20, 100),
        skip: Math.max(0, parseInt(offset as string, 10) || 0),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.workflowStepApproval.count({ where }),
    ]);

    res.json({
      success: true,
      data: approvals,
      pagination: {
        total,
        limit: Math.min(parseInt(limit as string, 10) || 20, 100),
        offset: Math.max(0, parseInt(offset as string, 10) || 0),
      },
    });
  } catch (error) {
    logger.error('Error fetching step approvals', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch approvals' },
    });
  }
});

// POST /api/approvals/step - Create workflow step approval
router.post('/step', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      stepInstanceId: z.string().uuid(),
      approverId: z.string().uuid(),
      approvalOrder: z.number().int().min(1).default(1),
    });

    const data = schema.parse(req.body);

    const approval = await prisma.workflowStepApproval.create({
      data: {
        stepInstance: { connect: { id: data.stepInstanceId } },
        approver: { connect: { id: data.approverId } },
        approvalOrder: data.approvalOrder,
        status: 'PENDING',
      },
      include: {
        approver: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    res.status(201).json({ success: true, data: approval });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors },
      });
    }
    logger.error('Error creating step approval', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create approval' },
    });
  }
});

// ============================================
// STATISTICS
// ============================================

// GET /api/approvals/stats - Get approval statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      requestsByStatus,
      requestsByType,
      avgResponseTime,
      recentRequests,
    ] = await Promise.all([
      prisma.approvalRequest.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.approvalRequest.groupBy({
        by: ['requestType'],
        _count: { requestType: true },
      }),
      prisma.approvalResponse.aggregate({
        _avg: {
          level: true,
        },
      }),
      prisma.approvalRequest.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          requestNumber: true,
          title: true,
          requestType: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        requestsByStatus: requestsByStatus.map((r) => ({
          status: r.status,
          count: r._count.status,
        })),
        requestsByType: requestsByType.map((r) => ({
          type: r.requestType,
          count: r._count.requestType,
        })),
        recentRequests,
      },
    });
  } catch (error) {
    logger.error('Error fetching approval stats', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch statistics' },
    });
  }
});

export default router;
