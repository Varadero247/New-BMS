import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-field-service');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const technicianCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(30).optional().nullable(),
  skills: z.array(z.string()).or(z.record(z.any())),
  certifications: z.array(z.string()).or(z.record(z.any())).optional().nullable(),
  zone: z.string().max(100).optional().nullable(),
  status: z.enum(['AVAILABLE', 'ON_JOB', 'OFF_DUTY', 'ON_LEAVE']).optional(),
  currentLocation: z.record(z.any()).optional().nullable(),
  maxJobsPerDay: z.number().int().min(1).max(20).optional(),
  rating: z.number().min(0).max(5).optional().nullable(),
});

const technicianUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional().nullable(),
  skills: z.array(z.string()).or(z.record(z.any())).optional(),
  certifications: z.array(z.string()).or(z.record(z.any())).optional().nullable(),
  zone: z.string().max(100).optional().nullable(),
  status: z.enum(['AVAILABLE', 'ON_JOB', 'OFF_DUTY', 'ON_LEAVE']).optional(),
  currentLocation: z.record(z.any()).optional().nullable(),
  maxJobsPerDay: z.number().int().min(1).max(20).optional(),
  rating: z.number().min(0).max(5).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List technicians
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, zone, skills } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = String(status);
    if (zone) where.zone = String(zone);
    if (skills) where.skills = { path: '$', array_contains: String(skills) };

    const [data, total] = await Promise.all([
      prisma.fsSvcTechnician.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.fsSvcTechnician.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list technicians', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list technicians' } });
  }
});

// ---------------------------------------------------------------------------
// GET /available — Available technicians
// ---------------------------------------------------------------------------
router.get('/available', async (req: Request, res: Response) => {
  try {
    const data = await prisma.fsSvcTechnician.findMany({
      where: { deletedAt: null, status: 'AVAILABLE' } as any,
      orderBy: { name: 'asc' },
      take: 1000});
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to list available technicians', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list available technicians' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create technician
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = technicianCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.issues } });
    }

    const authReq = req as AuthRequest;
    const data = await prisma.fsSvcTechnician.create({
      data: { ...parsed.data, skills: parsed.data.skills as any, certifications: parsed.data.certifications as any, currentLocation: parsed.data.currentLocation as any, createdBy: authReq.user!.id },
    });

    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create technician', { error: error instanceof Error ? error.message : 'Unknown error' });
    if (error != null && typeof error === 'object' && 'code' in error && (error as any).code === 'P2002') {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Email already exists' } });
    }
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create technician' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get technician by ID
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await prisma.fsSvcTechnician.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { jobs: { where: { deletedAt: null, status: { in: ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'] } as any } } },
    });

    if (!data) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Technician not found' } });
    }
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get technician', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get technician' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id/schedule — Technician schedule
// ---------------------------------------------------------------------------
router.get('/:id/schedule', async (req: Request, res: Response) => {
  try {
    const technician = await prisma.fsSvcTechnician.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!technician) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Technician not found' } });
    }

    const { startDate, endDate } = req.query;
    const dateFilter: Record<string, unknown> = {};
    if (startDate) dateFilter.gte = new Date(String(startDate));
    if (endDate) dateFilter.lte = new Date(String(endDate));

    const jobs = await prisma.fsSvcJob.findMany({
      where: {
        technicianId: req.params.id,
        deletedAt: null,
        status: { notIn: ['CANCELLED', 'COMPLETED'] } as any,
        ...(Object.keys(dateFilter).length > 0 ? { scheduledStart: dateFilter } : {}),
      },
      orderBy: { scheduledStart: 'asc' },
      take: 1000});

    res.json({ success: true, data: { technician, jobs } });
  } catch (error: unknown) {
    logger.error('Failed to get technician schedule', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get technician schedule' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update technician
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcTechnician.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Technician not found' } });
    }

    const parsed = technicianUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.issues } });
    }

    const data = await prisma.fsSvcTechnician.update({
      where: { id: req.params.id },
      data: { ...parsed.data, skills: parsed.data.skills as any, certifications: parsed.data.certifications as any, currentLocation: parsed.data.currentLocation as any },
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update technician', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update technician' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete technician
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcTechnician.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Technician not found' } });
    }

    await prisma.fsSvcTechnician.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Technician deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete technician', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete technician' } });
  }
});

export default router;
