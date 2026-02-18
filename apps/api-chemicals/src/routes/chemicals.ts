import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('chem-chemicals');

const pictogramEnum = z.enum(['GHS01_EXPLOSIVE', 'GHS02_FLAMMABLE', 'GHS03_OXIDISING', 'GHS04_GAS_UNDER_PRESSURE', 'GHS05_CORROSIVE', 'GHS06_TOXIC', 'GHS07_IRRITANT_HARMFUL', 'GHS08_HEALTH_HAZARD', 'GHS09_ENVIRONMENTAL']);
const signalWordEnum = z.enum(['DANGER', 'WARNING', 'NONE']);
const physicalStateEnum = z.enum(['GAS', 'LIQUID', 'SOLID_FINE_POWDER', 'SOLID_COARSE_POWDER', 'SOLID_GRANULES', 'SOLID_BULK', 'AEROSOL', 'PASTE']);
const storageClassEnum = z.enum(['CLASS_1_EXPLOSIVES', 'CLASS_2_FLAMMABLE_GAS', 'CLASS_3_FLAMMABLE_LIQUID', 'CLASS_4_FLAMMABLE_SOLID', 'CLASS_5_OXIDISING', 'CLASS_6_TOXIC', 'CLASS_7_RADIOACTIVE', 'CLASS_8_CORROSIVE', 'CLASS_9_OTHER_HAZARDOUS', 'NON_HAZARDOUS']);
const wasteClassEnum = z.enum(['NON_HAZARDOUS', 'HAZARDOUS', 'SPECIAL', 'CLINICAL', 'RADIOACTIVE']);

const createChemicalSchema = z.object({
  productName: z.string().min(1, 'productName is required'),
  chemicalName: z.string().min(1, 'chemicalName is required'),
  casNumber: z.string().optional(),
  ecNumber: z.string().optional(),
  reachRegistrationNo: z.string().optional(),
  unNumber: z.string().optional(),
  signalWord: signalWordEnum.optional(),
  pictograms: z.array(pictogramEnum).optional(),
  hazardStatements: z.array(z.string()).optional(),
  precautionaryStmts: z.array(z.string()).optional(),
  hazardCategory: z.string().optional(),
  physicalState: physicalStateEnum.optional(),
  colour: z.string().optional(),
  odour: z.string().optional(),
  flashPoint: z.number().optional(),
  boilingPoint: z.number().optional(),
  meltingPoint: z.number().optional(),
  vapourPressure: z.number().optional(),
  density: z.number().optional(),
  solubilityWater: z.string().optional(),
  ph: z.string().optional(),
  welTwa8hr: z.number().optional(),
  welTwaPpm: z.number().optional(),
  welStel15min: z.number().optional(),
  welStelPpm: z.number().optional(),
  biologicalMonitoring: z.boolean().optional(),
  storageClass: storageClassEnum.optional(),
  storageTemperatureMin: z.number().optional(),
  storageTemperatureMax: z.number().optional(),
  requiresVentilation: z.boolean().optional(),
  requiresFireproof: z.boolean().optional(),
  requiresSecondaryContainment: z.boolean().optional(),
  incompatibleWith: z.array(z.string()).optional(),
  maxQuantityOnsite: z.number().optional(),
  maxQuantityUnit: z.string().optional(),
  wasteClassification: wasteClassEnum.optional(),
  ewcCode: z.string().optional(),
  disposalRoute: z.string().optional(),
  supplier: z.string().optional(),
  supplierId: z.string().optional(),
  manufacturerName: z.string().optional(),
  manufacturerContact: z.string().optional(),
  emergencyContact: z.string().optional(),
  isCarcinogen: z.boolean().optional(),
  isMutagen: z.boolean().optional(),
  isReprotoxic: z.boolean().optional(),
  isSvhc: z.boolean().optional(),
  isDsear: z.boolean().optional(),
});

const updateChemicalSchema = createChemicalSchema.partial();

// GET /api/chemicals/alerts/expiry — SDS and stock expiry alerts
router.get('/alerts/expiry', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const days = parseInt(req.query.days as string) || 60;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const [sdsExpiring, stockExpiring] = await Promise.all([
      prisma.chemSds.findMany({
        where: { status: 'CURRENT', nextReviewDate: { lte: futureDate }, chemical: { orgId, isActive: true, deletedAt: null } },
        include: { chemical: { select: { id: true, productName: true, casNumber: true } } },
        orderBy: { nextReviewDate: 'asc' },
      }),
      prisma.chemInventory.findMany({
        where: { isActive: true, expiryDate: { lte: futureDate, not: null }, chemical: { orgId, isActive: true, deletedAt: null } },
        include: { chemical: { select: { id: true, productName: true, casNumber: true } } },
        orderBy: { expiryDate: 'asc' },
      }),
    ]);
    res.json({ success: true, data: { sdsExpiring, stockExpiring } });
  } catch (error: unknown) {
    logger.error('Failed to fetch expiry alerts', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch expiry alerts' } });
  }
});

// GET /api/chemicals/alerts/incompatible — incompatibility conflicts by location
router.get('/alerts/incompatible', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const alerts = await prisma.chemIncompatAlert.findMany({
      where: { isActive: true, chemical: { orgId, isActive: true, deletedAt: null } as any },
      include: { chemical: { select: { id: true, productName: true, casNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: alerts });
  } catch (error: unknown) {
    logger.error('Failed to fetch incompatibility alerts', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch incompatibility alerts' } });
  }
});

// GET /api/chemicals — list all chemicals
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { search, riskLevel, pictogram, cmr, storageClass: sc, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, isActive: true, deletedAt: null };
    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { chemicalName: { contains: search, mode: 'insensitive' } },
        { casNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (pictogram) where.pictograms = { has: pictogram };
    if (cmr === 'true') where.isCmr = true;
    if (sc) where.storageClass = sc as any;

    const skip = ((parseInt(page, 10) || 1) - 1) * (parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.chemRegister.findMany({
        where, skip, take: Math.min(parseInt(limit, 10) || 20, 100),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { safetyDataSheets: true, coshhAssessments: true, inventoryLocations: true } },
        },
      }),
      prisma.chemRegister.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 20, total, totalPages: Math.ceil(total / (parseInt(limit, 10) || 20)) } });
  } catch (error: unknown) {
    logger.error('Failed to fetch chemicals', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch chemicals' } });
  }
});

// GET /api/chemicals/:id — get single chemical
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const item = await prisma.chemRegister.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
      include: {
        _count: { select: { safetyDataSheets: true, coshhAssessments: true, inventoryLocations: true, incidents: true, exposureMonitoring: true } },
      },
    });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chemical not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to fetch chemical', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch chemical' } });
  }
});

// POST /api/chemicals — create new chemical
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createChemicalSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const d = parsed.data;

    // Auto-set CMR and health surveillance flags
    const isCmr = d.isCarcinogen || d.isMutagen || d.isReprotoxic || false;
    const healthSurveillanceReq = isCmr;

    const data = await prisma.chemRegister.create({
      data: {
        ...d,
        isCmr,
        healthSurveillanceReq,
        orgId,
        createdBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create chemical', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' } });
  }
});

// PUT /api/chemicals/:id — update chemical
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateChemicalSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.chemRegister.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chemical not found' } });

    const d = parsed.data;
    const isCarcinogen = d.isCarcinogen ?? existing.isCarcinogen;
    const isMutagen = d.isMutagen ?? existing.isMutagen;
    const isReprotoxic = d.isReprotoxic ?? existing.isReprotoxic;
    const isCmr = isCarcinogen || isMutagen || isReprotoxic;
    const healthSurveillanceReq = isCmr;

    const data = await prisma.chemRegister.update({
      where: { id: req.params.id },
      data: { ...d, isCmr, healthSurveillanceReq },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update chemical', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } });
  }
});

// DELETE /api/chemicals/:id — soft delete
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.chemRegister.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chemical not found' } });
    await prisma.chemRegister.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), isActive: false } });
    res.json({ success: true, data: { message: 'Chemical deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete chemical', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete resource' } });
  }
});

export default router;
