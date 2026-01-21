import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@new-bms/database';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Validation schemas
const createObjectiveSchema = z.object({
  standard: z.enum(['ISO_45001', 'ISO_14001', 'ISO_9001']),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  targetValue: z.number().optional(),
  unit: z.string().optional(),
  baselineValue: z.number().optional(),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
  ownerId: z.string().optional(),
  department: z.string().optional(),
});

const updateObjectiveSchema = createObjectiveSchema.partial().extend({
  status: z.enum(['NOT_STARTED', 'ON_TRACK', 'AT_RISK', 'BEHIND', 'ACHIEVED', 'CANCELLED']).optional(),
  currentValue: z.number().optional(),
  progressPercent: z.number().min(0).max(100).optional(),
});

const progressSchema = z.object({
  value: z.number(),
  notes: z.string().optional(),
});

// Calculate progress percentage
function calculateProgress(current: number | null, baseline: number | null, target: number | null): number {
  if (current === null || target === null) return 0;
  const base = baseline ?? 0;
  const range = target - base;
  if (range === 0) return current >= target ? 100 : 0;
  const progress = ((current - base) / range) * 100;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

// Determine status based on progress and due date
function calculateStatus(
  progress: number,
  targetDate: Date | null,
  currentStatus: string
): string {
  if (currentStatus === 'ACHIEVED' || currentStatus === 'CANCELLED') return currentStatus;
  if (progress >= 100) return 'ACHIEVED';

  if (!targetDate) return progress > 0 ? 'ON_TRACK' : 'NOT_STARTED';

  const now = new Date();
  const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = 90; // Assume 90-day objectives by default
  const expectedProgress = Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100);

  if (progress >= expectedProgress - 10) return 'ON_TRACK';
  if (progress >= expectedProgress - 25) return 'AT_RISK';
  return 'BEHIND';
}

// GET /api/objectives - List all objectives
router.get('/', authenticate, async (req, res, next) => {
  try {
    const {
      standard,
      status,
      ownerId,
      search,
      page = '1',
      limit = '20',
      sortBy = 'targetDate',
      sortOrder = 'asc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (standard) where.standard = standard;
    if (status) where.status = status;
    if (ownerId) where.ownerId = ownerId;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [objectives, total] = await Promise.all([
      prisma.objective.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: {
            select: { actions: true, progressRecords: true },
          },
        },
      }),
      prisma.objective.count({ where }),
    ]);

    res.json({
      success: true,
      data: objectives,
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

// GET /api/objectives/summary - Get objectives summary
router.get('/summary', authenticate, async (req, res, next) => {
  try {
    const { standard } = req.query;
    const where: any = {};
    if (standard) where.standard = standard;

    const [total, byStatus, byStandard] = await Promise.all([
      prisma.objective.count({ where }),
      prisma.objective.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      prisma.objective.groupBy({
        by: ['standard'],
        where,
        _count: { id: true },
        _avg: { progressPercent: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: item._count.id }), {}),
        byStandard: byStandard.reduce(
          (acc, item) => ({
            ...acc,
            [item.standard]: {
              count: item._count.id,
              avgProgress: Math.round(item._avg.progressPercent || 0),
            },
          }),
          {}
        ),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/objectives/:id - Get single objective
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const objective = await prisma.objective.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        actions: {
          include: {
            owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        progressRecords: {
          orderBy: { recordedAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!objective) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Objective not found' },
      });
    }

    res.json({ success: true, data: objective });
  } catch (error) {
    next(error);
  }
});

// POST /api/objectives - Create new objective
router.post('/', authenticate, requireRole(['ADMIN', 'MANAGER']), validate(createObjectiveSchema), async (req, res, next) => {
  try {
    const objective = await prisma.objective.create({
      data: {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        targetDate: req.body.targetDate ? new Date(req.body.targetDate) : undefined,
        currentValue: req.body.baselineValue,
        progressPercent: 0,
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Objective',
        entityId: objective.id,
        newData: objective as any,
      },
    });

    res.status(201).json({ success: true, data: objective });
  } catch (error) {
    next(error);
  }
});

// PUT /api/objectives/:id - Update objective
router.put('/:id', authenticate, validate(updateObjectiveSchema), async (req, res, next) => {
  try {
    const existing = await prisma.objective.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Objective not found' },
      });
    }

    const updateData: any = { ...req.body };
    if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
    if (req.body.targetDate) updateData.targetDate = new Date(req.body.targetDate);

    // Recalculate progress if current value changed
    if (req.body.currentValue !== undefined) {
      const target = req.body.targetValue ?? existing.targetValue;
      const baseline = req.body.baselineValue ?? existing.baselineValue;
      updateData.progressPercent = calculateProgress(req.body.currentValue, baseline, target);

      // Auto-update status
      if (!req.body.status) {
        updateData.status = calculateStatus(
          updateData.progressPercent,
          updateData.targetDate ?? existing.targetDate,
          existing.status
        );
      }
    }

    const objective = await prisma.objective.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Objective',
        entityId: objective.id,
        oldData: existing as any,
        newData: objective as any,
      },
    });

    res.json({ success: true, data: objective });
  } catch (error) {
    next(error);
  }
});

// POST /api/objectives/:id/progress - Record progress
router.post('/:id/progress', authenticate, validate(progressSchema), async (req, res, next) => {
  try {
    const objective = await prisma.objective.findUnique({
      where: { id: req.params.id },
    });

    if (!objective) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Objective not found' },
      });
    }

    const { value, notes } = req.body;

    // Create progress record
    const progressRecord = await prisma.objectiveProgress.create({
      data: {
        objectiveId: req.params.id,
        value,
        notes,
      },
    });

    // Update objective with new current value and progress
    const progressPercent = calculateProgress(value, objective.baselineValue, objective.targetValue);
    const status = calculateStatus(progressPercent, objective.targetDate, objective.status);

    const updatedObjective = await prisma.objective.update({
      where: { id: req.params.id },
      data: {
        currentValue: value,
        progressPercent,
        status,
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        progressRecords: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
      },
    });

    res.json({ success: true, data: { objective: updatedObjective, progressRecord } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/objectives/:id - Delete objective
router.delete('/:id', authenticate, requireRole(['ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const existing = await prisma.objective.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Objective not found' },
      });
    }

    await prisma.objective.delete({
      where: { id: req.params.id },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'Objective',
        entityId: req.params.id,
        oldData: existing as any,
      },
    });

    res.json({ success: true, data: { message: 'Objective deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
