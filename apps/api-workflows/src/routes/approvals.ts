import { Router, Request, Response } from 'express';
import { prisma } from '@ims/database';
import { z } from 'zod';

const router: Router = Router();

// GET /api/approvals/chains - Get approval chains
router.get('/chains', async (req: Request, res: Response) => {
  try {
    const { chainType, isActive } = req.query;

    const where: any = {};
    if (chainType) where.chainType = chainType;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const chains = await prisma.approvalChain.findMany({
      where,
      include: {
        definition: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: chains });
  } catch (error) {
    console.error('Error fetching approval chains:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch chains' } });
  }
});

// GET /api/approvals/chains/:id - Get single approval chain
router.get('/chains/:id', async (req: Request, res: Response) => {
  try {
    const chain = await prisma.approvalChain.findUnique({
      where: { id: req.params.id },
      include: {
        definition: true,
      },
    });

    if (!chain) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chain not found' } });
    }

    res.json({ success: true, data: chain });
  } catch (error) {
    console.error('Error fetching chain:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch chain' } });
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
      levels: z.any(), // JSON array of approval level configurations
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
      include: {
        definition: { select: { name: true } },
      },
    });

    res.status(201).json({ success: true, data: chain });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error creating chain:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create chain' } });
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
      include: {
        definition: { select: { name: true } },
      },
    });

    res.json({ success: true, data: chain });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error updating chain:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update chain' } });
  }
});

// TODO: The following routes require ApprovalRequest and ApprovalResponse models
// to be added to the Prisma schema. These models don't currently exist.
// Use WorkflowStepApproval for approval tracking within workflows instead.

// GET /api/approvals/requests - Get approval requests
router.get('/requests', async (_req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Approval requests feature requires ApprovalRequest model in Prisma schema. Use workflow step approvals instead.',
    },
  });
});

// GET /api/approvals/requests/pending/:userId - Get pending approvals for user
router.get('/requests/pending/:userId', async (req: Request, res: Response) => {
  try {
    // Return pending workflow step approvals for this user instead
    const pendingApprovals = await prisma.workflowStepApproval.findMany({
      where: {
        approverId: req.params.userId,
        status: 'PENDING',
      },
      include: {
        stepInstance: {
          include: {
            instance: {
              select: { instanceNumber: true, title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: pendingApprovals });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch approvals' } });
  }
});

// POST /api/approvals/requests - Create approval request
router.post('/requests', async (_req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Approval requests feature requires ApprovalRequest model in Prisma schema. Use workflow instances instead.',
    },
  });
});

// PUT /api/approvals/requests/:id/respond - Respond to approval request
router.put('/requests/:id/respond', async (_req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Approval response feature requires ApprovalResponse model in Prisma schema. Use workflow step approvals instead.',
    },
  });
});

// PUT /api/approvals/step/:id/respond - Respond to workflow step approval
router.put('/step/:id/respond', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      decision: z.enum(['APPROVE', 'APPROVED', 'APPROVED_WITH_COMMENTS', 'REJECT', 'REJECTED', 'RETURNED_FOR_REVISION', 'REQUEST_CHANGES', 'DELEGATE', 'ABSTAIN']),
      comments: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const approval = await prisma.workflowStepApproval.update({
      where: { id: req.params.id },
      data: {
        decision: data.decision,
        comments: data.comments,
        decidedAt: new Date(),
        status: data.decision === 'REJECT' || data.decision === 'REJECTED' ? 'REJECTED' : 'APPROVED',
      },
    });

    res.json({ success: true, data: approval });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    console.error('Error responding to approval:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to respond' } });
  }
});

export default router;
