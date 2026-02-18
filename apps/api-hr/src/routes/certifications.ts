import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-hr');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// Employee Certifications
// ============================================

const createSchema = z.object({
  employeeId: z.string().uuid(),
  name: z.string().min(1),
  issuingOrganization: z.string().min(1),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url().optional(),
  issueDate: z.string(),
  expiryDate: z.string().optional(),
  doesNotExpire: z.boolean().optional(),
  renewalRequired: z.boolean().optional(),
  certificateUrl: z.string().url().optional(),
});

const updateSchema = createSchema.omit({ employeeId: true }).partial().extend({
  status: z.enum(['ACTIVE', 'EXPIRED', 'REVOKED', 'PENDING_RENEWAL', 'SUSPENDED']).optional(),
});

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// GET / - List certifications
router.get('/', async (req: Request, res: Response) => {
  try {
    const { employeeId, status, expiringWithin, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (employeeId && typeof employeeId === 'string') where.employeeId = employeeId;
    if (status && typeof status === 'string') where.status = status as any;
    if (expiringWithin) {
      const days = parseInt(String(expiringWithin), 10);
      const future = new Date();
      future.setDate(future.getDate() + days);
      where.doesNotExpire = false;
      where.expiryDate = { lte: future, gte: new Date() };
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { issuingOrganization: { contains: search, mode: 'insensitive' } },
        { credentialId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [certs, total] = await Promise.all([
      prisma.employeeCertification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { expiryDate: 'asc' },
        include: {
          employee: { select: { id: true, employeeNumber: true, firstName: true, lastName: true, jobTitle: true } },
        },
      }),
      prisma.employeeCertification.count({ where }),
    ]);

    res.json({
      success: true,
      data: certs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Error fetching certifications', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch certifications' } });
  }
});

// GET /expiring-soon - Certifications expiring within 90 days
router.get('/expiring-soon', async (_req: Request, res: Response) => {
  try {
    const in90Days = new Date();
    in90Days.setDate(in90Days.getDate() + 90);

    const certs = await prisma.employeeCertification.findMany({
      where: {
        doesNotExpire: false,
        expiryDate: { lte: in90Days, gte: new Date() },
        status: 'ACTIVE',
      },
      orderBy: { expiryDate: 'asc' },
      include: {
        employee: { select: { id: true, employeeNumber: true, firstName: true, lastName: true, workEmail: true, jobTitle: true } },
      },
      take: 100,
    });

    res.json({ success: true, data: certs });
  } catch (error) {
    logger.error('Error fetching expiring certifications', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch expiring certifications' } });
  }
});

// GET /stats - Certification statistics
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const in30Days = new Date(); in30Days.setDate(now.getDate() + 30);
    const in90Days = new Date(); in90Days.setDate(now.getDate() + 90);

    const [total, active, expired, expiring30, expiring90] = await Promise.all([
      prisma.employeeCertification.count(),
      prisma.employeeCertification.count({ where: { status: 'ACTIVE' } }),
      prisma.employeeCertification.count({ where: { status: 'EXPIRED' } }),
      prisma.employeeCertification.count({ where: { doesNotExpire: false, expiryDate: { lte: in30Days, gte: now }, status: 'ACTIVE' } }),
      prisma.employeeCertification.count({ where: { doesNotExpire: false, expiryDate: { lte: in90Days, gte: now }, status: 'ACTIVE' } }),
    ]);

    res.json({ success: true, data: { total, active, expired, expiring30, expiring90 } });
  } catch (error) {
    logger.error('Error fetching certification stats', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch certification stats' } });
  }
});

// GET /:id - Get single certification
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const cert = await prisma.employeeCertification.findUnique({
      where: { id: req.params.id },
      include: {
        employee: { select: { id: true, employeeNumber: true, firstName: true, lastName: true, jobTitle: true } },
      },
    });

    if (!cert) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Certification not found' } });
    }

    res.json({ success: true, data: cert });
  } catch (error) {
    logger.error('Error fetching certification', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch certification' } });
  }
});

// POST / - Create certification
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createSchema.parse(req.body);

    const employee = await prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Employee not found' } });
    }

    const cert = await prisma.employeeCertification.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        issuingOrganization: data.issuingOrganization,
        credentialId: data.credentialId,
        credentialUrl: data.credentialUrl,
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        doesNotExpire: data.doesNotExpire ?? false,
        renewalRequired: data.renewalRequired ?? false,
        certificateUrl: data.certificateUrl,
        status: 'ACTIVE',
      },
      include: {
        employee: { select: { id: true, employeeNumber: true, firstName: true, lastName: true } },
      },
    });

    res.status(201).json({ success: true, data: cert });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating certification', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create certification' } });
  }
});

// PUT /:id - Update certification
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.employeeCertification.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Certification not found' } });
    }

    const data = updateSchema.parse(req.body);
    const updateData: Record<string, unknown> = { ...data };
    if (data.issueDate) updateData.issueDate = new Date(data.issueDate);
    if (data.expiryDate) updateData.expiryDate = new Date(data.expiryDate);

    const cert = await prisma.employeeCertification.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        employee: { select: { id: true, employeeNumber: true, firstName: true, lastName: true } },
      },
    });

    res.json({ success: true, data: cert });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating certification', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update certification' } });
  }
});

// DELETE /:id - Delete certification
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.employeeCertification.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Certification not found' } });
    }

    await prisma.employeeCertification.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting certification', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete certification' } });
  }
});

export default router;
