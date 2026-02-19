import { Router, Response } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';

const logger = createLogger('compliance-calendar');
const router = Router();

// All routes require authentication
router.use(authenticate);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const VALID_STANDARDS = [
  'ISO_9001_CAL',
  'ISO_14001_CAL',
  'ISO_45001_CAL',
  'IATF_16949',
  'AS9100D',
  'ISO_13485',
  'COMBINED',
] as const;

const VALID_EVENT_TYPES = [
  'AUDIT',
  'LEGAL_REVIEW',
  'OBJECTIVE_REVIEW',
  'CAPA_DUE',
  'MANAGEMENT_REVIEW',
  'CERT_EXPIRY',
  'CALIBRATION_DUE',
  'TRAINING_EXPIRY',
  'PPAP_GATE',
  'FAI_DUE',
  'REGULATORY_SUBMISSION',
] as const;

const VALID_STATUSES = ['UPCOMING', 'DUE_SOON', 'OVERDUE', 'COMPLETED'] as const;

const STANDARD_COLORS: Record<string, string> = {
  ISO_9001_CAL: '#3b82f6', // blue
  ISO_14001_CAL: '#22c55e', // green
  ISO_45001_CAL: '#f97316', // orange
  IATF_16949: '#ef4444', // red
  AS9100D: '#a855f7', // purple
  ISO_13485: '#14b8a6', // teal
  COMBINED: '#6b7280', // gray
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function calculateDaysUntilDue(dueDate: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function computeStatus(dueDate: Date, completedAt: Date | null): string {
  if (completedAt) return 'COMPLETED';
  const days = calculateDaysUntilDue(dueDate);
  if (days < 0) return 'OVERDUE';
  if (days <= 7) return 'DUE_SOON';
  return 'UPCOMING';
}

function enrichEvent(event: Record<string, any>) {
  return {
    ...event,
    daysUntilDue: calculateDaysUntilDue(event.dueDate as Date),
    computedStatus: computeStatus(event.dueDate as Date, event.completedAt as Date | null),
    color: STANDARD_COLORS[event.standard as string] || '#6b7280',
  };
}

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------
const createEventSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(VALID_EVENT_TYPES),
  standard: z.enum(VALID_STANDARDS),
  dueDate: z
    .string()
    .trim()
    .refine((d) => !isNaN(Date.parse(d)), 'Invalid date'),
  assigneeId: z.string().trim().optional(),
  assignee: z.string().trim().max(200).optional(),
  location: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(5000).optional(),
  recurrence: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
});

const updateEventSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(VALID_EVENT_TYPES).optional(),
  standard: z.enum(VALID_STANDARDS).optional(),
  status: z.enum(VALID_STATUSES).optional(),
  dueDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), 'Invalid date')
    .optional(),
  completedAt: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), 'Invalid date')
    .nullable()
    .optional(),
  assigneeId: z.string().trim().optional(),
  assignee: z.string().trim().max(200).optional(),
  location: z.string().trim().max(500).optional(),
  notes: z.string().trim().max(5000).optional(),
  recurrence: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY']).nullable().optional(),
});

// ---------------------------------------------------------------------------
// GET / — All compliance events with filtering
// ---------------------------------------------------------------------------
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { standard, type, status, startDate, endDate, page = '1', limit = '50' } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 50), 200);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };

    if (standard) {
      const standards = (standard as string).split(',');
      where.standard = standards.length === 1 ? standards[0] : { in: standards };
    }
    if (type) {
      const types = (type as string).split(',');
      where.type = types.length === 1 ? types[0] : { in: types };
    }
    if (status) {
      const statuses = (status as string).split(',');
      where.status = statuses.length === 1 ? statuses[0] : { in: statuses };
    }
    if (startDate || endDate) {
      const dueDateFilter: Record<string, Date> = {};
      if (startDate) dueDateFilter.gte = new Date(startDate as string);
      if (endDate) dueDateFilter.lte = new Date(endDate as string);
      where.dueDate = dueDateFilter;
    }

    const [events, total] = await Promise.all([
      (prisma as any).complianceEvent.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        skip,
        take: limitNum,
      }),
      (prisma as any).complianceEvent.count({ where }),
    ]);

    const enriched = events.map(enrichEvent);

    res.json({
      success: true,
      data: enriched,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch compliance events', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch compliance events' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /upcoming — Events in the next N days
// ---------------------------------------------------------------------------
router.get('/upcoming', async (req: AuthRequest, res: Response) => {
  try {
    const days = Math.min(parseInt(req.query.days as string, 10) || 30, 365);
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const events = await (prisma as any).complianceEvent.findMany({
      where: {
        deletedAt: null,
        status: { not: 'COMPLETED' },
        dueDate: { gte: now, lte: futureDate },
      },
      orderBy: { dueDate: 'asc' },
      take: 100,
    });

    const enriched = events.map(enrichEvent);

    // Group by standard for summary
    const byStandard: Record<string, number> = {};
    const byType: Record<string, number> = {};
    enriched.forEach((e: Record<string, any>) => {
      byStandard[e.standard] = (byStandard[e.standard] || 0) + 1;
      byType[e.type] = (byType[e.type] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        events: enriched,
        summary: {
          total: enriched.length,
          dueSoon: enriched.filter((e: Record<string, any>) => e.computedStatus === 'DUE_SOON')
            .length,
          byStandard,
          byType,
        },
      },
    });
  } catch (error) {
    logger.error('Failed to fetch upcoming events', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch upcoming events' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /events — Create a compliance event
// ---------------------------------------------------------------------------
router.post('/events', async (req: AuthRequest, res: Response) => {
  try {
    const data = createEventSchema.parse(req.body);

    const dueDate = new Date(data.dueDate);
    const initialStatus = computeStatus(dueDate, null);

    const event = await (prisma as any).complianceEvent.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        standard: data.standard,
        status: initialStatus as any,
        dueDate,
        assigneeId: data.assigneeId,
        assignee: data.assignee,
        location: data.location,
        notes: data.notes,
        recurrence: data.recurrence,
        createdBy: req.user!.id,
      },
    });

    logger.info('Compliance event created', {
      eventId: event.id,
      type: event.type,
      standard: event.standard,
      userId: req.user?.id,
    });

    res.status(201).json({ success: true, data: enrichEvent(event) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        },
      });
    }
    logger.error('Failed to create compliance event', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create compliance event' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /events/:id — Update a compliance event
// ---------------------------------------------------------------------------
router.put('/events/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await (prisma as any).complianceEvent.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Compliance event '${id}' not found` },
      });
    }

    const data = updateEventSchema.parse(req.body);

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.standard !== undefined) updateData.standard = data.standard;
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
    if (data.assignee !== undefined) updateData.assignee = data.assignee;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.recurrence !== undefined) updateData.recurrence = data.recurrence;

    if (data.completedAt !== undefined) {
      updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null;
    }

    // Recompute status based on updated dueDate / completedAt
    const finalDueDate = updateData.dueDate || existing.dueDate;
    const finalCompletedAt =
      updateData.completedAt !== undefined ? updateData.completedAt : existing.completedAt;

    if (data.status !== undefined) {
      updateData.status = data.status;
    } else {
      updateData.status = computeStatus(finalDueDate as Date, finalCompletedAt as Date | null);
    }

    const updated = await (prisma as any).complianceEvent.update({
      where: { id },
      data: updateData,
    });

    logger.info('Compliance event updated', {
      eventId: id,
      userId: req.user?.id,
    });

    res.json({ success: true, data: enrichEvent(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        },
      });
    }
    logger.error('Failed to update compliance event', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update compliance event' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /events/:id — Soft-delete a compliance event
// ---------------------------------------------------------------------------
router.delete('/events/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await (prisma as any).complianceEvent.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Compliance event '${id}' not found` },
      });
    }

    await (prisma as any).complianceEvent.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info('Compliance event deleted', {
      eventId: id,
      userId: req.user?.id,
    });

    res.json({ success: true, data: { id, deleted: true } });
  } catch (error) {
    logger.error('Failed to delete compliance event', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete compliance event' },
    });
  }
});

export default router;
