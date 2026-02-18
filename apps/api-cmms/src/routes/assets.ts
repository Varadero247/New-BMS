import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-cmms');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateAssetCode(): string {
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `ASSET-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const assetCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  assetType: z.enum(['EQUIPMENT', 'VEHICLE', 'BUILDING', 'INFRASTRUCTURE', 'IT_ASSET', 'TOOL']),
  category: z.string().max(100).optional().nullable(),
  manufacturer: z.string().max(200).optional().nullable(),
  model: z.string().max(200).optional().nullable(),
  serialNumber: z.string().max(200).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  department: z.string().max(200).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'DECOMMISSIONED', 'DISPOSED']).optional(),
  purchaseDate: z.string().optional().nullable(),
  purchaseCost: z.number().optional().nullable(),
  warrantyExpiry: z.string().optional().nullable(),
  parentAssetId: z.string().uuid().optional().nullable(),
  criticality: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
});

const assetUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  assetType: z.enum(['EQUIPMENT', 'VEHICLE', 'BUILDING', 'INFRASTRUCTURE', 'IT_ASSET', 'TOOL']).optional(),
  category: z.string().max(100).optional().nullable(),
  manufacturer: z.string().max(200).optional().nullable(),
  model: z.string().max(200).optional().nullable(),
  serialNumber: z.string().max(200).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  department: z.string().max(200).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'DECOMMISSIONED', 'DISPOSED']).optional(),
  purchaseDate: z.string().optional().nullable(),
  purchaseCost: z.number().optional().nullable(),
  warrantyExpiry: z.string().optional().nullable(),
  parentAssetId: z.string().uuid().optional().nullable(),
  criticality: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ===================================================================
// ASSETS CRUD
// ===================================================================

// GET / — List assets
router.get('/', async (req: Request, res: Response) => {
  try {
    const { assetType, status, criticality, location, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (assetType) where.assetType = String(assetType);
    if (status) where.status = String(status);
    if (criticality) where.criticality = String(criticality);
    if (location) where.location = { contains: String(location), mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { code: { contains: String(search), mode: 'insensitive' } },
        { serialNumber: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [assets, total] = await Promise.all([
      prisma.cmmsAsset.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.cmmsAsset.count({ where }),
    ]);

    res.json({
      success: true,
      data: assets,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list assets', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list assets' } });
  }
});

// POST / — Create asset
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = assetCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const asset = await prisma.cmmsAsset.create({
      data: {
        code: generateAssetCode(),
        name: data.name,
        description: data.description,
        assetType: data.assetType,
        category: data.category,
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber,
        location: data.location,
        department: data.department,
        status: data.status || 'ACTIVE',
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchaseCost: data.purchaseCost != null ? new Prisma.Decimal(data.purchaseCost) : null,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
        parentAssetId: data.parentAssetId,
        criticality: data.criticality || 'MEDIUM',
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: asset });
  } catch (error: unknown) {
    logger.error('Failed to create asset', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create asset' } });
  }
});

// GET /:id — Get asset by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const asset = await prisma.cmmsAsset.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: {
        workOrders: { where: { deletedAt: null } as any, take: 10, orderBy: { createdAt: 'desc' } },
        preventivePlans: { where: { deletedAt: null } as any },
        inspections: { where: { deletedAt: null } as any, take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!asset) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } });
    }

    res.json({ success: true, data: asset });
  } catch (error: unknown) {
    logger.error('Failed to get asset', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get asset' } });
  }
});

// PUT /:id — Update asset
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = assetUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.errors } });
    }

    const existing = await prisma.cmmsAsset.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { ...data };
    if (data.purchaseDate !== undefined) updateData.purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : null;
    if (data.purchaseCost !== undefined) updateData.purchaseCost = data.purchaseCost != null ? new Prisma.Decimal(data.purchaseCost) : null;
    if (data.warrantyExpiry !== undefined) updateData.warrantyExpiry = data.warrantyExpiry ? new Date(data.warrantyExpiry) : null;

    const asset = await prisma.cmmsAsset.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: asset });
  } catch (error: unknown) {
    logger.error('Failed to update asset', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update asset' } });
  }
});

// DELETE /:id — Soft delete asset
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsAsset.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } });
    }

    await prisma.cmmsAsset.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Asset deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete asset', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete asset' } });
  }
});

// GET /:id/history — Asset maintenance & calibration history
router.get('/:id/history', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.cmmsAsset.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } });
    }

    const [workOrders, inspections, meterReadings, downtimes] = await Promise.all([
      prisma.cmmsWorkOrder.findMany({
        where: { assetId: req.params.id, deletedAt: null } as any,
        orderBy: { createdAt: 'desc' },
        take: 1000}),
      prisma.cmmsInspection.findMany({
        where: { assetId: req.params.id, deletedAt: null } as any,
        orderBy: { createdAt: 'desc' },
        take: 1000}),
      prisma.cmmsMeterReading.findMany({
        where: { assetId: req.params.id, deletedAt: null } as any,
        orderBy: { readingDate: 'desc' },
        take: 1000}),
      prisma.cmmsDowntime.findMany({
        where: { assetId: req.params.id, deletedAt: null } as any,
        orderBy: { startTime: 'desc' },
        take: 1000}),
    ]);

    res.json({ success: true, data: { workOrders, inspections, meterReadings, downtimes } });
  } catch (error: unknown) {
    logger.error('Failed to get asset history', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get asset history' } });
  }
});

// GET /:id/qr-code — Return QR code data for asset
router.get('/:id/qr-code', async (req: Request, res: Response) => {
  try {
    const asset = await prisma.cmmsAsset.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      select: { id: true, code: true, name: true, assetType: true, location: true, serialNumber: true },
    });

    if (!asset) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Asset not found' } });
    }

    const qrData = {
      type: 'CMMS_ASSET',
      id: asset.id,
      code: asset.code,
      name: asset.name,
      assetType: asset.assetType,
      location: asset.location,
      serialNumber: asset.serialNumber,
      url: `/assets/${asset.id}`,
    };

    res.json({ success: true, data: qrData });
  } catch (error: unknown) {
    logger.error('Failed to get QR code data', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get QR code data' } });
  }
});

export default router;
