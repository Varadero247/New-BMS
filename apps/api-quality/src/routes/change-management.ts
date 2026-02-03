import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();

router.use(authenticate);

// Generate change number
function generateChangeNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CR-${year}${month}-${random}`;
}

// GET /api/change-requests - List change requests
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, changeType, priority } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (changeType) where.changeType = changeType;
    if (priority) where.priority = priority;

    const [changeRequests, total] = await Promise.all([
      prisma.changeRequest.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { approvals: true, impacts: true, implementations: true } },
        },
      }),
      prisma.changeRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: changeRequests,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List change requests error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list change requests' } });
  }
});

// GET /api/change-requests/:id - Get single change request
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const changeRequest = await prisma.changeRequest.findUnique({
      where: { id: req.params.id },
      include: {
        approvals: { orderBy: { approvalLevel: 'asc' } },
        impacts: true,
        implementations: { orderBy: { taskNumber: 'asc' } },
        document: { select: { id: true, documentNumber: true, title: true } },
      },
    });

    if (!changeRequest) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }

    res.json({ success: true, data: changeRequest });
  } catch (error) {
    console.error('Get change request error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get change request' } });
  }
});

// POST /api/change-requests - Create change request
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      justification: z.string().optional(),
      changeType: z.enum(['PRODUCT', 'PROCESS', 'DOCUMENT', 'SYSTEM', 'SUPPLIER', 'EQUIPMENT', 'MATERIAL', 'ORGANIZATIONAL']),
      category: z.enum(['DESIGN', 'MANUFACTURING', 'QUALITY', 'SAFETY', 'REGULATORY', 'CUSTOMER_DRIVEN', 'COST_REDUCTION', 'IMPROVEMENT']).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY']).default('MEDIUM'),
      affectedItems: z.any().optional(),
      documentId: z.string().optional(),
      department: z.string().optional(),
      targetDate: z.string().optional(),
      estimatedCost: z.number().optional(),
    });

    const data = schema.parse(req.body);

    const changeRequest = await prisma.changeRequest.create({
      data: {
        ...data,
        changeNumber: generateChangeNumber(),
        requestedById: req.user!.id,
        status: 'DRAFT',
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
      },
    });

    res.status(201).json({ success: true, data: changeRequest });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create change request error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create change request' } });
  }
});

// PATCH /api/change-requests/:id - Update change request
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.changeRequest.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      justification: z.string().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'EMERGENCY']).optional(),
      status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'IMPACT_ASSESSMENT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_IMPLEMENTATION', 'VERIFICATION', 'COMPLETED', 'CANCELLED']).optional(),
      affectedItems: z.any().optional(),
      riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      riskAssessment: z.any().optional(),
      targetDate: z.string().optional(),
      effectiveDate: z.string().optional(),
      estimatedCost: z.number().optional(),
      actualCost: z.number().optional(),
    });

    const data = schema.parse(req.body);

    const changeRequest = await prisma.changeRequest.update({
      where: { id: req.params.id },
      data: {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
        actualCompletionDate: data.status === 'COMPLETED' ? new Date() : undefined,
      },
    });

    res.json({ success: true, data: changeRequest });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update change request error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update change request' } });
  }
});

// POST /api/change-requests/:id/approve - Submit for approval / add approvers
router.post('/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      approverIds: z.array(z.string()),
      isCCB: z.boolean().default(false),
      dueDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const approvals = await Promise.all(
      data.approverIds.map((approverId, index) =>
        prisma.changeApproval.create({
          data: {
            changeRequestId: req.params.id,
            approverId,
            approvalLevel: index + 1,
            isCCBMember: data.isCCB,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          },
        })
      )
    );

    // Update status to pending approval
    await prisma.changeRequest.update({
      where: { id: req.params.id },
      data: { status: 'PENDING_APPROVAL' },
    });

    res.status(201).json({ success: true, data: approvals });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Submit for approval error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit for approval' } });
  }
});

// PATCH /api/change-requests/:id/approve/:approvalId - Respond to approval
router.patch('/:id/approve/:approvalId', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      decision: z.enum(['APPROVED', 'APPROVED_WITH_COMMENTS', 'REJECTED', 'RETURNED_FOR_REVISION']),
      comments: z.string().optional(),
      conditions: z.array(z.string()).default([]),
    });

    const data = schema.parse(req.body);

    const approval = await prisma.changeApproval.update({
      where: { id: req.params.approvalId },
      data: {
        decision: data.decision,
        comments: data.comments,
        conditions: data.conditions,
        status: data.decision === 'APPROVED' || data.decision === 'APPROVED_WITH_COMMENTS' ? 'APPROVED' : 'REJECTED',
        respondedAt: new Date(),
      },
    });

    // Check if all approvals are complete
    const allApprovals = await prisma.changeApproval.findMany({
      where: { changeRequestId: req.params.id },
    });

    const allResponded = allApprovals.every(a => a.status !== 'PENDING');
    const allApproved = allApprovals.every(a => a.status === 'APPROVED');

    if (allResponded) {
      await prisma.changeRequest.update({
        where: { id: req.params.id },
        data: {
          status: allApproved ? 'APPROVED' : 'REJECTED',
        },
      });
    }

    res.json({ success: true, data: approval });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Respond to approval error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to respond to approval' } });
  }
});

// POST /api/change-requests/:id/impacts - Add impact assessment
router.post('/:id/impacts', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      impactArea: z.enum(['QUALITY', 'SAFETY', 'REGULATORY', 'FINANCIAL', 'OPERATIONAL', 'CUSTOMER', 'SUPPLY_CHAIN', 'DOCUMENTATION', 'TRAINING', 'EQUIPMENT', 'PERSONNEL']),
      impactDescription: z.string().min(1),
      severity: z.enum(['NEGLIGIBLE', 'MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']).default('MODERATE'),
      affectedEntity: z.string().optional(),
      affectedEntityId: z.string().optional(),
      mitigationRequired: z.boolean().default(false),
      mitigationPlan: z.string().optional(),
      actionsRequired: z.any().optional(),
      trainingRequired: z.boolean().default(false),
      trainingNotes: z.string().optional(),
      documentationChanges: z.array(z.string()).default([]),
    });

    const data = schema.parse(req.body);

    const impact = await prisma.changeImpact.create({
      data: {
        ...data,
        changeRequestId: req.params.id,
        assessedById: req.user!.id,
        assessedAt: new Date(),
      },
    });

    // Update status to impact assessment if not already past that
    const cr = await prisma.changeRequest.findUnique({ where: { id: req.params.id } });
    if (cr && (cr.status === 'SUBMITTED' || cr.status === 'UNDER_REVIEW')) {
      await prisma.changeRequest.update({
        where: { id: req.params.id },
        data: { status: 'IMPACT_ASSESSMENT' },
      });
    }

    res.status(201).json({ success: true, data: impact });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add impact error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add impact' } });
  }
});

// GET /api/change-requests/:id/impacts - Get impacts
router.get('/:id/impacts', async (req: AuthRequest, res: Response) => {
  try {
    const impacts = await prisma.changeImpact.findMany({
      where: { changeRequestId: req.params.id },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: impacts });
  } catch (error) {
    console.error('Get impacts error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get impacts' } });
  }
});

// POST /api/change-requests/:id/implementation - Add implementation task
router.post('/:id/implementation', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      description: z.string().min(1),
      assignedToId: z.string().optional(),
      department: z.string().optional(),
      plannedStartDate: z.string().optional(),
      plannedEndDate: z.string().optional(),
      verificationMethod: z.string().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Get next task number
    const count = await prisma.changeImplementation.count({
      where: { changeRequestId: req.params.id },
    });

    const implementation = await prisma.changeImplementation.create({
      data: {
        ...data,
        changeRequestId: req.params.id,
        taskNumber: count + 1,
        plannedStartDate: data.plannedStartDate ? new Date(data.plannedStartDate) : undefined,
        plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : undefined,
        status: 'PLANNED',
      },
    });

    res.status(201).json({ success: true, data: implementation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add implementation error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add implementation task' } });
  }
});

// PATCH /api/change-requests/:id/implementation/:taskId - Update implementation task
router.patch('/:id/implementation/:taskId', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      description: z.string().optional(),
      actualStartDate: z.string().optional(),
      actualEndDate: z.string().optional(),
      status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'VALIDATED', 'FAILED']).optional(),
      verificationResult: z.string().optional(),
      evidence: z.any().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const implementation = await prisma.changeImplementation.update({
      where: { id: req.params.taskId },
      data: {
        ...data,
        actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : undefined,
        actualEndDate: data.actualEndDate ? new Date(data.actualEndDate) : undefined,
        verifiedById: data.status === 'VALIDATED' ? req.user!.id : undefined,
        verifiedAt: data.status === 'VALIDATED' ? new Date() : undefined,
      },
    });

    res.json({ success: true, data: implementation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update implementation error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update implementation task' } });
  }
});

// DELETE /api/change-requests/:id - Delete change request
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.changeRequest.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }

    // Only allow deletion of draft or cancelled requests
    if (existing.status !== 'DRAFT' && existing.status !== 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Can only delete draft or cancelled change requests' }
      });
    }

    await prisma.changeRequest.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Change request deleted successfully' } });
  } catch (error) {
    console.error('Delete change request error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete change request' } });
  }
});

export default router;
