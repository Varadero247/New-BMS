import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('chem-inventory');

const createInventorySchema = z.object({
  chemicalId: z.string().min(1),
  location: z.string().min(1, 'location is required'),
  storageArea: z.string().optional(),
  containerRef: z.string().optional(),
  quantityOnhand: z.number().min(0),
  unit: z.string().min(1),
  minStockLevel: z.number().optional(),
  maxStockLevel: z.number().optional(),
  expiryDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  openedDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
});

const updateInventorySchema = createInventorySchema.partial();

// GET /api/inventory/low-stock — items below min level
router.get('/low-stock', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const items = await prisma.chemInventory.findMany({
      where: { isActive: true, minStockLevel: { not: null }, chemical: { orgId, isActive: true, deletedAt: null } },
      include: { chemical: { select: { id: true, productName: true, casNumber: true } } },
    });
    const lowStock = items.filter((i: Record<string, unknown>) => Number(i.quantityOnhand) <= Number(i.minStockLevel || 0));
    res.json({ success: true, data: lowStock });
  } catch (error: unknown) {
    logger.error('Failed to fetch low stock', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch low stock' } });
  }
});

// GET /api/inventory/expiring — expiring within N days
router.get('/expiring', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const days = parseInt(req.query.days as string) || 60;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const data = await prisma.chemInventory.findMany({
      where: { isActive: true, expiryDate: { lte: futureDate, not: null }, chemical: { orgId, isActive: true, deletedAt: null } },
      include: { chemical: { select: { id: true, productName: true, casNumber: true } } },
      orderBy: { expiryDate: 'asc' },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to fetch expiring stock', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch expiring stock' } });
  }
});

// GET /api/inventory — all inventory locations
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { location, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { isActive: true, chemical: { orgId, isActive: true, deletedAt: null } };
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (search) {
      where.chemical = { ...(where.chemical as any || {}), OR: [
        { productName: { contains: search, mode: 'insensitive' } },
        { casNumber: { contains: search, mode: 'insensitive' } },
      ]};
    }
    const skip = ((parseInt(page, 10) || 1) - 1) * (parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.chemInventory.findMany({
        where, skip, take: Math.min(parseInt(limit, 10) || 20, 100),
        orderBy: { updatedAt: 'desc' },
        include: { chemical: { select: { id: true, productName: true, casNumber: true, storageClass: true, incompatibleWith: true, pictograms: true, signalWord: true } } },
      }),
      prisma.chemInventory.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 20, total, pages: Math.ceil(total / (parseInt(limit, 10) || 20)) } });
  } catch (error: unknown) {
    logger.error('Failed to fetch inventory', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch inventory' } });
  }
});

// GET /api/inventory/:id — single inventory record
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const item = await prisma.chemInventory.findFirst({
      where: { id: req.params.id, isActive: true, chemical: { orgId, deletedAt: null } },
      include: { chemical: true, usageRecords: { orderBy: { usedAt: 'desc' }, take: 20 } },
    });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Inventory record not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to fetch inventory record', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch inventory record' } });
  }
});

// POST /api/inventory — add stock at location
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createInventorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });

    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const chemical = await prisma.chemRegister.findFirst({ where: { id: parsed.data.chemicalId, orgId, deletedAt: null } as any });
    if (!chemical) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chemical not found' } });

    // Check incompatibility at same location
    if (chemical.incompatibleWith && chemical.incompatibleWith.length > 0) {
      const conflicting = await prisma.chemInventory.findMany({
        where: {
          isActive: true,
          location: parsed.data.location,
          chemical: { casNumber: { in: chemical.incompatibleWith }, deletedAt: null },
        },
        include: { chemical: { select: { productName: true, casNumber: true } } },
      });
      if (conflicting.length > 0) {
        // Batch create incompatibility alerts
        await prisma.chemIncompatAlert.createMany({
          data: conflicting.map(c => ({
            chemicalId: chemical.id,
            incompatibleWithCas: c.chemical.casNumber || '',
            incompatibleWithName: c.chemical.productName,
            hazardDescription: `${chemical.productName} is incompatible with ${c.chemical.productName} — cannot be stored together`,
            severityLevel: 'CRITICAL' as const,
            storageLocationA: parsed.data.location,
            storageLocationB: c.location,
          })),
          skipDuplicates: true,
        });
      }
    }

    const data = await prisma.chemInventory.create({ data: parsed.data });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create inventory record', { error: (error as Error).message });
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create resource' } });
  }
});

// PUT /api/inventory/:id — update stock
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateInventorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.chemInventory.findFirst({ where: { id: req.params.id, isActive: true, chemical: { orgId, deletedAt: null } } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Inventory record not found' } });
    const data = await prisma.chemInventory.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update inventory', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } });
  }
});

// POST /api/inventory/:id/inspect — record inspection
router.post('/:id/inspect', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.chemInventory.findFirst({ where: { id: req.params.id, isActive: true, chemical: { orgId, deletedAt: null } } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Inventory record not found' } });
    const { meetsStorageReqs, storageIssues } = req.body;
    const data = await prisma.chemInventory.update({
      where: { id: req.params.id },
      data: {
        lastInspectedAt: new Date(),
        inspectedBy: (req as AuthRequest).user?.id,
        meetsStorageReqs: meetsStorageReqs ?? true,
        storageIssues: storageIssues || null,
      },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to record inspection', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } });
  }
});

export default router;
