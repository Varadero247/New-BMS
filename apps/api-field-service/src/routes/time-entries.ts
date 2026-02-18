import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-field-service');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const timeEntryCreateSchema = z.object({
  jobId: z.string().uuid(),
  technicianId: z.string().uuid(),
  type: z.enum(['TRAVEL', 'WORK', 'BREAK', 'ADMIN']),
  startTime: z.string(),
  endTime: z.string().optional().nullable(),
  duration: z.number().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  billable: z.boolean().optional(),
});

const timeEntryUpdateSchema = z.object({
  type: z.enum(['TRAVEL', 'WORK', 'BREAK', 'ADMIN']).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional().nullable(),
  duration: z.number().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  billable: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List time entries
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { jobId, technicianId, type } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (jobId) where.jobId = String(jobId);
    if (technicianId) where.technicianId = String(technicianId);
    if (type) where.type = String(type);

    const [data, total] = await Promise.all([
      prisma.fsSvcTimeEntry.findMany({ where, skip, take: limit, orderBy: { startTime: 'desc' }, include: { job: true, technician: true } }),
      prisma.fsSvcTimeEntry.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list time entries', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list time entries' } });
  }
});

// ---------------------------------------------------------------------------
// GET /summary — Hours summary by technician/period
// ---------------------------------------------------------------------------
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { technicianId, startDate, endDate } = req.query;
    const where: Record<string, unknown> = { deletedAt: null };
    if (technicianId) where.technicianId = String(technicianId);
    if (startDate || endDate) {
      (where as any).startTime = {};
      if (startDate) (where as any).startTime.gte = new Date(String(startDate));
      if (endDate) (where as any).startTime.lte = new Date(String(endDate));
    }

    const entries = await prisma.fsSvcTimeEntry.findMany({
      where,
      include: { technician: true },
    });

    // Aggregate by technician
    const summary: Record<string, { technicianId: string; technicianName: string; totalHours: number; billableHours: number; breakdown: Record<string, number> }> = {};

    for (const entry of entries) {
      const tid = entry.technicianId;
      if (!summary[tid]) {
        summary[tid] = {
          technicianId: tid,
          technicianName: (entry as any).technician?.name || 'Unknown',
          totalHours: 0,
          billableHours: 0,
          breakdown: { TRAVEL: 0, WORK: 0, BREAK: 0, ADMIN: 0 },
        };
      }
      const hours = entry.duration ? Number(entry.duration) : 0;
      summary[tid].totalHours += hours;
      if (entry.billable) summary[tid].billableHours += hours;
      summary[tid].breakdown[entry.type] = (summary[tid].breakdown[entry.type] || 0) + hours;
    }

    res.json({ success: true, data: Object.values(summary) });
  } catch (error: unknown) {
    logger.error('Failed to get time entries summary', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get time entries summary' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create time entry
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = timeEntryCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.issues } });
    }

    const authReq = req as AuthRequest;
    const data = await prisma.fsSvcTimeEntry.create({
      data: {
        ...parsed.data,
        startTime: new Date(parsed.data.startTime),
        endTime: parsed.data.endTime ? new Date(parsed.data.endTime) : null,
        duration: parsed.data.duration ? new Prisma.Decimal(parsed.data.duration) : null,
        createdBy: authReq.user!.id,
      },
    });

    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create time entry', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create time entry' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get time entry
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await prisma.fsSvcTimeEntry.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { job: true, technician: true },
    });

    if (!data) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Time entry not found' } });
    }
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get time entry', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get time entry' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update time entry
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcTimeEntry.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Time entry not found' } });
    }

    const parsed = timeEntryUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.issues } });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.startTime) updateData.startTime = new Date(parsed.data.startTime);
    if (parsed.data.endTime) updateData.endTime = new Date(parsed.data.endTime);
    if (parsed.data.duration !== undefined) updateData.duration = parsed.data.duration ? new Prisma.Decimal(parsed.data.duration) : null;

    const data = await prisma.fsSvcTimeEntry.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update time entry', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update time entry' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete time entry
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcTimeEntry.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Time entry not found' } });
    }

    await prisma.fsSvcTimeEntry.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Time entry deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete time entry', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete time entry' } });
  }
});

export default router;
