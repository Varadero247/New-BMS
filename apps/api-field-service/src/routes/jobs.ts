import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-field-service');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------
function generateJobNumber(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `JOB-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const jobCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  customerId: z.string().trim().uuid(),
  siteId: z.string().trim().uuid(),
  technicianId: z.string().trim().uuid().optional().nullable(),
  contractId: z.string().trim().uuid().optional().nullable(),
  type: z.enum(['INSTALLATION', 'REPAIR', 'MAINTENANCE', 'INSPECTION', 'WARRANTY', 'EMERGENCY']),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  scheduledStart: z.string().trim().optional().nullable(),
  scheduledEnd: z.string().trim().optional().nullable(),
  estimatedDuration: z.number().int().optional().nullable(),
  skills: z.any().optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
});

const jobUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  technicianId: z.string().trim().uuid().optional().nullable(),
  contractId: z.string().trim().uuid().optional().nullable(),
  type: z
    .enum(['INSTALLATION', 'REPAIR', 'MAINTENANCE', 'INSPECTION', 'WARRANTY', 'EMERGENCY'])
    .optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z
    .enum([
      'UNASSIGNED',
      'ASSIGNED',
      'EN_ROUTE',
      'ON_SITE',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
    ])
    .optional(),
  scheduledStart: z.string().trim().optional().nullable(),
  scheduledEnd: z.string().trim().optional().nullable(),
  estimatedDuration: z.number().int().optional().nullable(),
  skills: z.any().optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

const RESERVED_PATHS = new Set(['dispatch-board', 'unassigned']);

// ---------------------------------------------------------------------------
// GET / — List jobs
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { customerId, technicianId, status, priority, type } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (customerId) where.customerId = String(customerId);
    if (technicianId) where.technicianId = String(technicianId);
    if (status) where.status = String(status);
    if (priority) where.priority = String(priority);
    if (type) where.type = String(type);

    const [data, total] = await Promise.all([
      prisma.fsSvcJob.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { customer: true, site: true, technician: true },
      }),
      prisma.fsSvcJob.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list jobs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list jobs' } });
  }
});

// ---------------------------------------------------------------------------
// GET /dispatch-board — Grouped by status
// ---------------------------------------------------------------------------
router.get('/dispatch-board', async (req: Request, res: Response) => {
  try {
    const statuses = ['UNASSIGNED', 'ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'];
    const board: Record<string, any[]> = {};

    const results = await Promise.all(
      statuses.map((s) =>
        prisma.fsSvcJob.findMany({
          where: { deletedAt: null, status: s as any },
          include: { customer: true, site: true, technician: true },
          orderBy: { priority: 'asc' },
          take: 50,
        })
      )
    );
    statuses.forEach((s, i) => {
      board[s] = results[i];
    });

    res.json({ success: true, data: board });
  } catch (error: unknown) {
    logger.error('Failed to get dispatch board', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get dispatch board' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /unassigned — Unassigned jobs
// ---------------------------------------------------------------------------
router.get('/unassigned', async (req: Request, res: Response) => {
  try {
    const data = await prisma.fsSvcJob.findMany({
      where: { deletedAt: null, status: 'UNASSIGNED' } as any,
      include: { customer: true, site: true },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      take: 1000,
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to list unassigned jobs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list unassigned jobs' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create job
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = jobCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const authReq = req as AuthRequest;
    const status = parsed.data.technicianId ? 'ASSIGNED' : 'UNASSIGNED';

    const data = await prisma.fsSvcJob.create({
      data: {
        ...parsed.data,
        number: generateJobNumber(),
        status,
        scheduledStart: parsed.data.scheduledStart ? new Date(parsed.data.scheduledStart) : null,
        scheduledEnd: parsed.data.scheduledEnd ? new Date(parsed.data.scheduledEnd) : null,
        skills: parsed.data.skills as any,
        createdBy: authReq.user!.id,
      },
    });

    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create job', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create job' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get job by ID (with reserved path guard)
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const data = await prisma.fsSvcJob.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: {
        customer: true,
        site: true,
        technician: true,
        contract: true,
        timeEntries: { where: { deletedAt: null } as any },
        partsUsed: { where: { deletedAt: null } as any },
        jobNotes: { where: { deletedAt: null } as any },
      },
    });

    if (!data) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
    }
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get job', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get job' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update job
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const existing = await prisma.fsSvcJob.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
    }

    const parsed = jobUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.scheduledStart)
      updateData.scheduledStart = new Date(parsed.data.scheduledStart);
    if (parsed.data.scheduledEnd) updateData.scheduledEnd = new Date(parsed.data.scheduledEnd);
    if (parsed.data.skills !== undefined) updateData.skills = parsed.data.skills as any;

    const data = await prisma.fsSvcJob.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update job', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update job' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete job
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcJob.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
    }

    await prisma.fsSvcJob.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Job deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete job', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete job' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/assign — Assign technician
// ---------------------------------------------------------------------------
router.put('/:id/assign', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcJob.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
    }

    const _schema = z.object({ technicianId: z.string().trim().min(1) });
    const _parsed = _schema.safeParse(req.body);
    if (!_parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: _parsed.error.errors[0].message },
      });
    const { technicianId } = _parsed.data;
    if (!technicianId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'technicianId is required' },
      });
    }

    const technician = await prisma.fsSvcTechnician.findFirst({
      where: { id: technicianId, deletedAt: null } as any,
    });
    if (!technician) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Technician not found' } });
    }

    const data = await prisma.fsSvcJob.update({
      where: { id: req.params.id },
      data: { technicianId, status: 'ASSIGNED' },
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to assign job', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to assign job' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/dispatch — Dispatch to mobile
// ---------------------------------------------------------------------------
router.put('/:id/dispatch', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcJob.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
    }

    if (!existing.technicianId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Job must be assigned before dispatch' },
      });
    }

    const data = await prisma.fsSvcJob.update({
      where: { id: req.params.id },
      data: { status: 'ASSIGNED' },
    });

    res.json({ success: true, data, message: 'Job dispatched to mobile' });
  } catch (error: unknown) {
    logger.error('Failed to dispatch job', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to dispatch job' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/en-route — Technician en route
// ---------------------------------------------------------------------------
router.put('/:id/en-route', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcJob.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
    }

    const data = await prisma.fsSvcJob.update({
      where: { id: req.params.id },
      data: { status: 'EN_ROUTE' },
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update job en-route', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update job status' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/on-site — Technician arrived
// ---------------------------------------------------------------------------
router.put('/:id/on-site', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcJob.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
    }

    const data = await prisma.fsSvcJob.update({
      where: { id: req.params.id },
      data: { status: 'ON_SITE', actualStart: new Date() },
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update job on-site', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update job status' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/complete — Complete job
// ---------------------------------------------------------------------------
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcJob.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
    }

    const _schema = z.object({ notes: z.string().trim().optional() });
    const _parsed = _schema.safeParse(req.body);
    if (!_parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: _parsed.error.errors[0].message },
      });
    const { notes } = _parsed.data;

    const data = await prisma.fsSvcJob.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED',
        actualEnd: new Date(),
        notes: notes || existing.notes,
      },
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to complete job', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to complete job' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/cancel — Cancel job
// ---------------------------------------------------------------------------
router.put('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcJob.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Job not found' } });
    }

    const _schema = z.object({ reason: z.string().trim().optional() });
    const _parsed = _schema.safeParse(req.body);
    if (!_parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: _parsed.error.errors[0].message },
      });
    const { reason } = _parsed.data;

    const data = await prisma.fsSvcJob.update({
      where: { id: req.params.id },
      data: {
        status: 'CANCELLED',
        notes: reason ? `${existing.notes || ''}\nCANCELLED: ${reason}`.trim() : existing.notes,
      },
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to cancel job', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to cancel job' } });
  }
});

export default router;
