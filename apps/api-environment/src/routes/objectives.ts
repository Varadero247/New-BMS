import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router: IRouter = Router();
const STANDARD = 'ISO_14001';

router.use(authenticate);

// GET /api/objectives - List environmental objectives
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { standard: STANDARD };
    if (status) where.status = status;

    const [objectives, total] = await Promise.all([
      prisma.objective.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { targetDate: 'asc' },
        include: {
          owner: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.objective.count({ where }),
    ]);

    res.json({
      success: true,
      data: objectives,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List objectives error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list objectives' } });
  }
});

// GET /api/objectives/:id - Get single objective
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const objective = await prisma.objective.findFirst({
      where: { id: req.params.id, standard: STANDARD },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        progressRecords: { orderBy: { recordedAt: 'desc' } },
        actions: true,
      },
    });

    if (!objective) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
    }

    res.json({ success: true, data: objective });
  } catch (error) {
    console.error('Get objective error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get objective' } });
  }
});

// POST /api/objectives - Create objective
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      targetValue: z.number().optional(),
      unit: z.string().optional(),
      baselineValue: z.number().optional(),
      startDate: z.string().optional(),
      targetDate: z.string().optional(),
      ownerId: z.string().optional(),
      department: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const objective = await prisma.objective.create({
      data: {
        id: uuidv4(),
        standard: STANDARD,
        ...data,
        currentValue: data.baselineValue,
        progressPercent: 0,
        startDate: data.startDate ? new Date(data.startDate) : null,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        status: 'NOT_STARTED',
      },
    });

    res.status(201).json({ success: true, data: objective });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create objective error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create objective' } });
  }
});

// POST /api/objectives/:id/progress - Add progress record
router.post('/:id/progress', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.objective.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
    }

    const schema = z.object({
      value: z.number(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Calculate progress percentage
    let progressPercent = 0;
    if (existing.targetValue && existing.baselineValue !== null) {
      const range = existing.targetValue - (existing.baselineValue || 0);
      if (range !== 0) {
        progressPercent = Math.min(100, Math.max(0,
          ((data.value - (existing.baselineValue || 0)) / range) * 100
        ));
      }
    }

    // Determine status
    let status = existing.status;
    if (progressPercent >= 100) {
      status = 'ACHIEVED';
    } else if (progressPercent > 0) {
      status = 'ON_TRACK';
    }

    // Create progress record and update objective
    const [progress] = await Promise.all([
      prisma.objectiveProgress.create({
        data: {
          id: uuidv4(),
          objectiveId: req.params.id,
          value: data.value,
          notes: data.notes,
          recordedAt: new Date(),
        },
      }),
      prisma.objective.update({
        where: { id: req.params.id },
        data: {
          currentValue: data.value,
          progressPercent: Math.round(progressPercent),
          status,
        },
      }),
    ]);

    res.status(201).json({ success: true, data: progress });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add progress error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add progress' } });
  }
});

// PATCH /api/objectives/:id - Update objective
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.objective.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      targetValue: z.number().optional(),
      unit: z.string().optional(),
      targetDate: z.string().optional(),
      ownerId: z.string().optional(),
      department: z.string().optional(),
      status: z.enum(['NOT_STARTED', 'ON_TRACK', 'AT_RISK', 'BEHIND', 'ACHIEVED', 'CANCELLED']).optional(),
    });

    const data = schema.parse(req.body);

    const objective = await prisma.objective.update({
      where: { id: req.params.id },
      data: {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : existing.targetDate,
      },
    });

    res.json({ success: true, data: objective });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update objective error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update objective' } });
  }
});

// DELETE /api/objectives/:id - Delete objective
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.objective.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
    }

    await prisma.objective.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Objective deleted successfully' } });
  } catch (error) {
    console.error('Delete objective error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete objective' } });
  }
});

export default router;
