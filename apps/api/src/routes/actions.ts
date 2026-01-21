import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@new-bms/database';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Validation schemas
const createActionSchema = z.object({
  standard: z.enum(['ISO_45001', 'ISO_14001', 'ISO_9001']),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  type: z.enum(['CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT', 'IMMEDIATE', 'LONG_TERM']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  ownerId: z.string(),
  dueDate: z.string().datetime(),
  verificationMethod: z.string().optional(),
  estimatedCost: z.number().optional(),
  riskId: z.string().optional(),
  incidentId: z.string().optional(),
  legalRequirementId: z.string().optional(),
  objectiveId: z.string().optional(),
});

const updateActionSchema = createActionSchema.partial().extend({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'OVERDUE', 'CANCELLED']).optional(),
  verificationNotes: z.string().optional(),
  effectivenessRating: z.number().min(1).max(5).optional(),
  actualCost: z.number().optional(),
});

// Generate reference number
function generateReferenceNumber(standard: string, type: string): string {
  const prefix = type === 'CORRECTIVE' ? 'CA' : type === 'PREVENTIVE' ? 'PA' : 'ACT';
  const stdPrefix = { ISO_45001: 'HS', ISO_14001: 'ENV', ISO_9001: 'QA' }[standard] || '';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${stdPrefix}-${year}${month}-${random}`;
}

// Check and update overdue actions
async function updateOverdueActions() {
  const now = new Date();
  await prisma.action.updateMany({
    where: {
      dueDate: { lt: now },
      status: { in: ['OPEN', 'IN_PROGRESS'] },
    },
    data: { status: 'OVERDUE' },
  });
}

// GET /api/actions - List all actions with filtering
router.get('/', authenticate, async (req, res, next) => {
  try {
    await updateOverdueActions();

    const {
      standard,
      status,
      type,
      priority,
      ownerId,
      search,
      overdue,
      dueThisWeek,
      page = '1',
      limit = '20',
      sortBy = 'dueDate',
      sortOrder = 'asc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (standard) where.standard = standard;
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (ownerId) where.ownerId = ownerId;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (overdue === 'true') {
      where.status = 'OVERDUE';
    }
    if (dueThisWeek === 'true') {
      const now = new Date();
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + 7);
      where.dueDate = { gte: now, lte: endOfWeek };
      where.status = { in: ['OPEN', 'IN_PROGRESS'] };
    }

    const [actions, total] = await Promise.all([
      prisma.action.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          risk: { select: { id: true, title: true } },
          incident: { select: { id: true, title: true, referenceNumber: true } },
        },
      }),
      prisma.action.count({ where }),
    ]);

    res.json({
      success: true,
      data: actions,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/actions/stats - Get action statistics
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    await updateOverdueActions();

    const { standard } = req.query;
    const where: any = {};
    if (standard) where.standard = standard;

    const now = new Date();
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + 7);

    const [total, open, overdue, dueThisWeek, byStatus, byType, byPriority] = await Promise.all([
      prisma.action.count({ where }),
      prisma.action.count({ where: { ...where, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.action.count({ where: { ...where, status: 'OVERDUE' } }),
      prisma.action.count({
        where: {
          ...where,
          dueDate: { gte: now, lte: endOfWeek },
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      }),
      prisma.action.groupBy({ by: ['status'], where, _count: { id: true } }),
      prisma.action.groupBy({ by: ['type'], where, _count: { id: true } }),
      prisma.action.groupBy({ by: ['priority'], where, _count: { id: true } }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        open,
        overdue,
        dueThisWeek,
        byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: item._count.id }), {}),
        byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item._count.id }), {}),
        byPriority: byPriority.reduce((acc, item) => ({ ...acc, [item.priority]: item._count.id }), {}),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/actions/:id - Get single action
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const action = await prisma.action.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        risk: true,
        incident: true,
        legalRequirement: true,
        objective: true,
        aiAnalysis: true,
      },
    });

    if (!action) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Action not found' },
      });
    }

    res.json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
});

// POST /api/actions - Create new action
router.post('/', authenticate, validate(createActionSchema), async (req, res, next) => {
  try {
    const referenceNumber = generateReferenceNumber(req.body.standard, req.body.type);

    const action = await prisma.action.create({
      data: {
        ...req.body,
        referenceNumber,
        createdById: req.user!.id,
        dueDate: new Date(req.body.dueDate),
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Action',
        entityId: action.id,
        newData: action as any,
      },
    });

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
});

// PUT /api/actions/:id - Update action
router.put('/:id', authenticate, validate(updateActionSchema), async (req, res, next) => {
  try {
    const existing = await prisma.action.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Action not found' },
      });
    }

    const updateData: any = { ...req.body };
    if (req.body.dueDate) {
      updateData.dueDate = new Date(req.body.dueDate);
    }

    const action = await prisma.action.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Action',
        entityId: action.id,
        oldData: existing as any,
        newData: action as any,
      },
    });

    res.json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
});

// POST /api/actions/:id/complete - Mark action as completed
router.post('/:id/complete', authenticate, async (req, res, next) => {
  try {
    const existing = await prisma.action.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Action not found' },
      });
    }

    const action = await prisma.action.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        actualCost: req.body.actualCost,
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'COMPLETE',
        entity: 'Action',
        entityId: action.id,
        oldData: existing as any,
        newData: action as any,
      },
    });

    res.json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
});

// POST /api/actions/:id/verify - Verify completed action
router.post('/:id/verify', authenticate, requireRole(['ADMIN', 'MANAGER', 'AUDITOR']), async (req, res, next) => {
  try {
    const { verificationNotes, effectivenessRating } = req.body;

    const existing = await prisma.action.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Action not found' },
      });
    }

    if (existing.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Action must be completed before verification' },
      });
    }

    const action = await prisma.action.update({
      where: { id: req.params.id },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
        verificationNotes,
        effectivenessRating,
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'VERIFY',
        entity: 'Action',
        entityId: action.id,
        oldData: existing as any,
        newData: action as any,
      },
    });

    res.json({ success: true, data: action });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/actions/:id - Delete action
router.delete('/:id', authenticate, requireRole(['ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const existing = await prisma.action.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Action not found' },
      });
    }

    await prisma.action.delete({
      where: { id: req.params.id },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'Action',
        entityId: req.params.id,
        oldData: existing as any,
      },
    });

    res.json({ success: true, data: { message: 'Action deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
