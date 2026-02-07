import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router: IRouter = Router();
const STANDARD = 'ISO_9001';

const ACTION_TYPES = ['CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT', 'IMMEDIATE', 'LONG_TERM'] as const;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const STATUSES = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'OVERDUE', 'CANCELLED'] as const;

router.use(authenticate);

function generateReferenceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ACT-${year}${month}-${random}`;
}

// GET /api/actions - List actions
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, priority, incidentId } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { standard: STANDARD };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (incidentId) where.incidentId = incidentId;

    const [actions, total] = await Promise.all([
      prisma.action.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          incident: { select: { id: true, title: true, referenceNumber: true } },
          owner: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.action.count({ where }),
    ]);

    res.json({
      success: true,
      data: actions,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List actions error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list actions' } });
  }
});

// GET /api/actions/:id - Get single action
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const action = await prisma.action.findFirst({
      where: { id: req.params.id, standard: STANDARD },
      include: {
        incident: { select: { id: true, title: true, referenceNumber: true, status: true } },
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!action) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });
    }

    res.json({ success: true, data: action });
  } catch (error) {
    console.error('Get action error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get action' } });
  }
});

// POST /api/actions - Create action
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      type: z.enum(ACTION_TYPES).default('CORRECTIVE'),
      priority: z.enum(PRIORITIES).default('MEDIUM'),
      dueDate: z.string(),
      incidentId: z.string().optional(),
      ownerId: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const action = await prisma.action.create({
      data: {
        id: uuidv4(),
        standard: STANDARD,
        referenceNumber: generateReferenceNumber(),
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        dueDate: new Date(data.dueDate),
        status: 'OPEN',
        incidentId: data.incidentId || null,
        ownerId: data.ownerId || req.user!.id,
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create action error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create action' } });
  }
});

// PATCH /api/actions/:id - Update action
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.action.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      type: z.enum(ACTION_TYPES).optional(),
      priority: z.enum(PRIORITIES).optional(),
      status: z.enum(STATUSES).optional(),
      dueDate: z.string().optional(),
      ownerId: z.string().optional(),
      verificationNotes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const action = await prisma.action.update({
      where: { id: req.params.id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : existing.dueDate,
        completedAt: data.status === 'COMPLETED' ? new Date() : existing.completedAt,
        verifiedAt: data.status === 'VERIFIED' ? new Date() : existing.verifiedAt,
      },
    });

    res.json({ success: true, data: action });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update action error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update action' } });
  }
});

// DELETE /api/actions/:id - Delete action
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.action.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });
    }

    await prisma.action.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Action deleted successfully' } });
  } catch (error) {
    console.error('Delete action error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete action' } });
  }
});

export default router;
