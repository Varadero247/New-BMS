import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-field-service');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------
function generateContractNumber(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `SVC-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const contractCreateSchema = z.object({
  customerId: z.string().trim().uuid(),
  title: z.string().trim().min(1).max(200),
  type: z.enum(['WARRANTY', 'SLA', 'PREVENTIVE', 'FULL_SERVICE', 'TIME_AND_MATERIAL']),
  status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING']).optional(),
  startDate: z
    .string()
    .trim()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  endDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  value: z.number().optional().nullable(),
  responseTimeSla: z.number().int().optional().nullable(),
  resolutionTimeSla: z.number().int().optional().nullable(),
  coveredEquipment: z.any().optional().nullable(),
  terms: z.string().trim().max(5000).optional().nullable(),
});

const contractUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  type: z.enum(['WARRANTY', 'SLA', 'PREVENTIVE', 'FULL_SERVICE', 'TIME_AND_MATERIAL']).optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING']).optional(),
  startDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  endDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  value: z.number().optional().nullable(),
  responseTimeSla: z.number().int().optional().nullable(),
  resolutionTimeSla: z.number().int().optional().nullable(),
  coveredEquipment: z.any().optional().nullable(),
  terms: z.string().trim().max(5000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List contracts
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { customerId, type, status } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (customerId) where.customerId = String(customerId);
    if (type) where.type = String(type);
    if (status) where.status = String(status);

    const [data, total] = await Promise.all([
      prisma.fsSvcContract.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      prisma.fsSvcContract.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list contracts', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list contracts' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /expiring — Contracts expiring soon
// ---------------------------------------------------------------------------
router.get('/expiring', async (req: Request, res: Response) => {
  try {
    const days = parseIntParam(req.query.days, 30);
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const data = await prisma.fsSvcContract.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        endDate: { gte: now, lte: futureDate },
      },
      include: { customer: true },
      orderBy: { endDate: 'asc' },
      take: 1000,
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to list expiring contracts', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list expiring contracts' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create contract
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = contractCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const authReq = req as AuthRequest;
    const data = await prisma.fsSvcContract.create({
      data: {
        ...parsed.data,
        number: generateContractNumber(),
        startDate: new Date(parsed.data.startDate),
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
        coveredEquipment: parsed.data.coveredEquipment as any,
        createdBy: authReq.user!.id,
      },
    });

    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create contract', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create contract' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get contract by ID
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await prisma.fsSvcContract.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { customer: true, jobs: { where: { deletedAt: null } } },
    });

    if (!data) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Contract not found' } });
    }
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get contract', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get contract' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update contract
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcContract.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Contract not found' } });
    }

    const parsed = contractUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.issues },
      });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.startDate) updateData.startDate = new Date(parsed.data.startDate);
    if (parsed.data.endDate) updateData.endDate = new Date(parsed.data.endDate);
    if (parsed.data.coveredEquipment !== undefined)
      updateData.coveredEquipment = parsed.data.coveredEquipment as any;

    const data = await prisma.fsSvcContract.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update contract', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update contract' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete contract
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcContract.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Contract not found' } });
    }

    await prisma.fsSvcContract.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'Contract deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete contract', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete contract' },
    });
  }
});

export default router;
