import { Router, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-quality');

const router = Router();

router.use(authenticate);

// Generate reference number
async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-ACT';
  const count = await prisma.qualAction.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List actions
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', actionType, status, priority, source, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.QualActionWhereInput = {};
    if (actionType) where.actionType = actionType;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (source) where.source = source;
    if (search) {
      where.title = { contains: search as string, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.qualAction.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.qualAction.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('List actions error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list actions' } });
  }
});

// GET /stats - Action statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [byStatus, byPriority, byActionType, total] = await Promise.all([
      prisma.qualAction.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.qualAction.groupBy({
        by: ['priority'],
        _count: { id: true },
      }),
      prisma.qualAction.groupBy({
        by: ['actionType'],
        _count: { id: true },
      }),
      prisma.qualAction.count(),
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc: any, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc: any, item) => {
          acc[item.priority] = item._count.id;
          return acc;
        }, {}),
        byActionType: byActionType.reduce((acc: any, item) => {
          acc[item.actionType] = item._count.id;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    logger.error('Action stats error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get action statistics' } });
  }
});

// GET /:id - Get single action
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const action = await prisma.qualAction.findUnique({
      where: { id: req.params.id },
    });

    if (!action) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });
    }

    res.json({ success: true, data: action });
  } catch (error) {
    logger.error('Get action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get action' } });
  }
});

// POST / - Create action
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      actionType: z.enum(['CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT', 'AUDIT_FINDING', 'RISK_TREATMENT', 'OBJECTIVE_SUPPORT', 'LEGAL_COMPLIANCE', 'OTHER']),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
      source: z.enum(['NC_REPORT', 'CAPA', 'INTERNAL_AUDIT', 'MANAGEMENT_REVIEW', 'RISK_REGISTER', 'FMEA', 'CUSTOMER_COMPLAINT', 'SUPPLIER_AUDIT', 'CONTINUAL_IMPROVEMENT', 'OBJECTIVE', 'OTHER']),
      sourceReference: z.string().optional(),
      description: z.string().min(1),
      expectedOutcome: z.string().min(1),
      assignedTo: z.string().min(1),
      department: z.string().min(1),
      dueDate: z.string(),
      progressNotes: z.string().optional(),
      verificationMethod: z.enum(['DOCUMENT_REVIEW', 'INSPECTION', 'AUDIT', 'TEST', 'SIGN_OFF']).optional(),
      linkedNc: z.string().optional(),
      linkedCapa: z.string().optional(),
      linkedProcess: z.string().optional(),
      linkedFmea: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const action = await prisma.qualAction.create({
      data: {
        ...data,
        referenceNumber,
        dueDate: new Date(data.dueDate),
        status: 'OPEN',
        percentComplete: 0,
      },
    });

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Create action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create action' } });
  }
});

// PUT /:id - Update action
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualAction.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      actionType: z.enum(['CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT', 'AUDIT_FINDING', 'RISK_TREATMENT', 'OBJECTIVE_SUPPORT', 'LEGAL_COMPLIANCE', 'OTHER']).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      source: z.enum(['NC_REPORT', 'CAPA', 'INTERNAL_AUDIT', 'MANAGEMENT_REVIEW', 'RISK_REGISTER', 'FMEA', 'CUSTOMER_COMPLAINT', 'SUPPLIER_AUDIT', 'CONTINUAL_IMPROVEMENT', 'OBJECTIVE', 'OTHER']).optional(),
      sourceReference: z.string().nullable().optional(),
      description: z.string().optional(),
      expectedOutcome: z.string().optional(),
      assignedTo: z.string().optional(),
      department: z.string().optional(),
      dueDate: z.string().optional(),
      status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'OVERDUE', 'CANCELLED']).optional(),
      progressNotes: z.string().nullable().optional(),
      completionDate: z.string().nullable().optional(),
      percentComplete: z.number().min(0).max(100).optional(),
      verificationMethod: z.enum(['DOCUMENT_REVIEW', 'INSPECTION', 'AUDIT', 'TEST', 'SIGN_OFF']).nullable().optional(),
      verifiedBy: z.string().nullable().optional(),
      verificationDate: z.string().nullable().optional(),
      effective: z.enum(['YES', 'NO', 'PENDING']).nullable().optional(),
      linkedNc: z.string().nullable().optional(),
      linkedCapa: z.string().nullable().optional(),
      linkedProcess: z.string().nullable().optional(),
      linkedFmea: z.string().nullable().optional(),
      // AI fields
      aiAnalysis: z.string().nullable().optional(),
      aiActionPlan: z.string().nullable().optional(),
      aiResourceEstimate: z.string().nullable().optional(),
      aiSuccessCriteria: z.string().nullable().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: any = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      completionDate: data.completionDate
        ? new Date(data.completionDate)
        : data.status === 'COMPLETED' && !existing.completionDate
          ? new Date()
          : data.completionDate === null ? null : undefined,
      verificationDate: data.verificationDate
        ? new Date(data.verificationDate)
        : data.status === 'VERIFIED' && !existing.verificationDate
          ? new Date()
          : data.verificationDate === null ? null : undefined,
    };

    const action = await prisma.qualAction.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: action });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Update action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update action' } });
  }
});

// DELETE /:id - Delete action
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualAction.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });
    }

    await prisma.qualAction.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete action' } });
  }
});

export default router;
