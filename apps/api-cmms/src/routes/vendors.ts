import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-cmms');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const vendorCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  code: z.string().trim().min(1).max(50),
  contactName: z.string().trim().max(200).optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  specialization: z.string().trim().max(200).optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  isPreferred: z.boolean().optional(),
  contractExpiry: z.string().trim().optional().nullable(),
});

const vendorUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  contactName: z.string().trim().max(200).optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  address: z.string().trim().max(500).optional().nullable(),
  specialization: z.string().trim().max(200).optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  isPreferred: z.boolean().optional(),
  contractExpiry: z.string().trim().optional().nullable(),
});

const contractCreateSchema = z.object({
  assetId: z.string().trim().uuid().optional().nullable(),
  contractNumber: z.string().trim().min(1).max(50),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  startDate: z
    .string()
    .trim()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  endDate: z
    .string()
    .trim()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  value: z.number().optional().nullable(),
  type: z.enum(['FULL_SERVICE', 'PARTS_ONLY', 'LABOR_ONLY', 'WARRANTY', 'SLA']),
  status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING']).optional(),
  slaResponseHours: z.number().int().optional().nullable(),
  slaResolutionHours: z.number().int().optional().nullable(),
});

const contractUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  startDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  endDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  value: z.number().optional().nullable(),
  type: z.enum(['FULL_SERVICE', 'PARTS_ONLY', 'LABOR_ONLY', 'WARRANTY', 'SLA']).optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING']).optional(),
  slaResponseHours: z.number().int().optional().nullable(),
  slaResolutionHours: z.number().int().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ===================================================================
// VENDORS CRUD
// ===================================================================

// GET /vendors — List vendors
router.get('/', async (req: Request, res: Response) => {
  try {
    const { specialization, isPreferred, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (specialization)
      where.specialization = { contains: String(specialization), mode: 'insensitive' };
    if (isPreferred !== undefined) where.isPreferred = isPreferred === 'true';
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { code: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [vendors, total] = await Promise.all([
      prisma.cmmsVendor.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.cmmsVendor.count({ where }),
    ]);

    res.json({
      success: true,
      data: vendors,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list vendors', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list vendors' },
    });
  }
});

// POST /vendors — Create vendor
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = vendorCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.errors },
      });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const vendor = await prisma.cmmsVendor.create({
      data: {
        name: data.name,
        code: data.code,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        specialization: data.specialization,
        rating: data.rating !== null ? new Prisma.Decimal(data.rating) : null,
        isPreferred: data.isPreferred || false,
        contractExpiry: data.contractExpiry ? new Date(data.contractExpiry) : null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: vendor });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'Vendor code already exists' },
      });
    }
    logger.error('Failed to create vendor', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create vendor' },
    });
  }
});

// GET /vendors/:id — Get vendor by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const vendor = await prisma.cmmsVendor.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { serviceContracts: { where: { deletedAt: null } } },
    });

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Vendor not found' } });
    }

    res.json({ success: true, data: vendor });
  } catch (error: unknown) {
    logger.error('Failed to get vendor', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get vendor' } });
  }
});

// PUT /vendors/:id — Update vendor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = vendorUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.errors },
      });
    }

    const existing = await prisma.cmmsVendor.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Vendor not found' } });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { ...data };
    if (data.rating !== undefined)
      updateData.rating = data.rating !== null ? new Prisma.Decimal(data.rating) : null;
    if (data.contractExpiry !== undefined)
      updateData.contractExpiry = data.contractExpiry ? new Date(data.contractExpiry) : null;

    const vendor = await prisma.cmmsVendor.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, data: vendor });
  } catch (error: unknown) {
    logger.error('Failed to update vendor', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update vendor' },
    });
  }
});

// DELETE /vendors/:id — Soft delete vendor
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsVendor.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Vendor not found' } });
    }

    await prisma.cmmsVendor.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'Vendor deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete vendor', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete vendor' },
    });
  }
});

// GET /vendors/:id/contracts — List vendor contracts
router.get('/:id/contracts', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsVendor.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Vendor not found' } });
    }

    const contracts = await prisma.cmmsServiceContract.findMany({
      where: { vendorId: req.params.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    res.json({ success: true, data: contracts });
  } catch (error: unknown) {
    logger.error('Failed to list vendor contracts', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list vendor contracts' },
    });
  }
});

// POST /vendors/:id/contracts — Create contract for vendor
router.post('/:id/contracts', async (req: Request, res: Response) => {
  try {
    const parsed = contractCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.errors },
      });
    }

    const existing = await prisma.cmmsVendor.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Vendor not found' } });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const contract = await prisma.cmmsServiceContract.create({
      data: {
        vendorId: req.params.id,
        assetId: data.assetId,
        contractNumber: data.contractNumber,
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        value: data.value !== null ? new Prisma.Decimal(data.value) : null,
        type: data.type,
        status: data.status || 'PENDING',
        slaResponseHours: data.slaResponseHours,
        slaResolutionHours: data.slaResolutionHours,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: contract });
  } catch (error: unknown) {
    if ((error as { code?: string })?.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'Contract number already exists' },
      });
    }
    logger.error('Failed to create contract', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create contract' },
    });
  }
});

// PUT /contracts/:id — Update contract (mounted at /api/contracts/:id)
router.put('/contracts/:id', async (req: Request, res: Response) => {
  try {
    const parsed = contractUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.errors },
      });
    }

    const existing = await prisma.cmmsServiceContract.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Contract not found' } });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { ...data };
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.value !== undefined)
      updateData.value = data.value !== null ? new Prisma.Decimal(data.value) : null;

    const contract = await prisma.cmmsServiceContract.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, data: contract });
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

export default router;
