import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('chem-sds');

const sdsStatusEnum = z.enum(['CURRENT', 'UNDER_REVIEW', 'SUPERSEDED', 'MISSING']);

const createSdsSchema = z.object({
  version: z.string().trim().min(1),
  issueDate: z.string().datetime({ offset: true }).or(z.string().datetime()),
  revisionDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  nextReviewDate: z.string().datetime({ offset: true }).or(z.string().datetime()),
  status: sdsStatusEnum.optional(),
  documentRef: z.string().optional(),
  productUseDescription: z.string().optional(),
  restrictedUses: z.string().optional(),
  otherHazards: z.string().optional(),
  ingredients: z.any().optional(),
  firstAidInhalation: z.string().optional(),
  firstAidSkinContact: z.string().optional(),
  firstAidEyeContact: z.string().optional(),
  firstAidIngestion: z.string().optional(),
  firstAidSymptoms: z.string().optional(),
  firstAidMedicalNote: z.string().optional(),
  suitableExtinguishers: z.string().optional(),
  unsuitableExtinguish: z.string().optional(),
  fireHazards: z.string().optional(),
  fireFightingPPE: z.string().optional(),
  personalPrecautions: z.string().optional(),
  envPrecautions: z.string().optional(),
  containmentCleanup: z.string().optional(),
  handlingPrecautions: z.string().optional(),
  storageConditions: z.string().optional(),
  specificEndUse: z.string().optional(),
  engineeringControls: z.string().optional(),
  respiratoryProtection: z.string().optional(),
  handProtection: z.string().optional(),
  eyeProtection: z.string().optional(),
  skinProtection: z.string().optional(),
  environmentalExposure: z.string().optional(),
  reactivity: z.string().optional(),
  chemicalStability: z.string().optional(),
  hazardousReactions: z.string().optional(),
  conditionsToAvoid: z.string().optional(),
  incompatibleMaterials: z.string().optional(),
  hazardousDecomposition: z.string().optional(),
  acuteToxicity: z.string().optional(),
  skinIrritationCorros: z.string().optional(),
  eyeIrritationCorros: z.string().optional(),
  respiratorySensitiz: z.string().optional(),
  skinSensitization: z.string().optional(),
  germCellMutagenicity: z.string().optional(),
  carcinogenicity: z.string().optional(),
  reproductiveToxicity: z.string().optional(),
  stocsTargetOrgan: z.string().optional(),
  aspirationHazard: z.string().optional(),
  aquaticToxicity: z.string().optional(),
  persistenceDegradabil: z.string().optional(),
  bioaccumulation: z.string().optional(),
  soilMobility: z.string().optional(),
  pbtAssessment: z.string().optional(),
  otherAdverseEffects: z.string().optional(),
  wasteDisposalMethod: z.string().optional(),
  unNumber: z.string().optional(),
  properShippingName: z.string().optional(),
  transportHazardClass: z.string().optional(),
  packingGroup: z.string().optional(),
  envHazardTransport: z.boolean().optional(),
  specialTransportPrecautions: z.string().optional(),
  safetyHealthEnvRegs: z.string().optional(),
  chemicalSafetyAssessment: z.boolean().optional(),
  revisionsDescription: z.string().optional(),
  abbreviations: z.string().optional(),
  dataSourcesUsed: z.string().optional(),
  fileUrl: z.string().url('Invalid URL').optional(),
  fileHash: z.string().optional(),
});

const updateSdsSchema = createSdsSchema.partial();

// GET /api/sds — all SDS records (org-wide)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { chemical: { orgId, deletedAt: null } };
    if (status) where.status = status as any;
    if (search) {
      where.chemical = { ...(where.chemical as any || {}), OR: [
        { productName: { contains: search, mode: 'insensitive' } },
        { casNumber: { contains: search, mode: 'insensitive' } },
      ]};
    }
    const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.chemSds.findMany({
        where, skip, take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { issueDate: 'desc' },
        include: { chemical: { select: { id: true, productName: true, casNumber: true, signalWord: true, pictograms: true } } },
      }),
      prisma.chemSds.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: Math.max(1, parseInt(page, 10) || 1), limit: Math.max(1, parseInt(limit, 10) || 20), total, totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)) } });
  } catch (error: unknown) {
    logger.error('Failed to fetch SDS records', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch SDS records' } });
  }
});

// GET /api/sds/overdue — SDS past review date
router.get('/overdue', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const data = await prisma.chemSds.findMany({
      where: { status: 'CURRENT', nextReviewDate: { lte: new Date() }, chemical: { orgId, deletedAt: null } },
      include: { chemical: { select: { id: true, productName: true, casNumber: true } } },
      orderBy: { nextReviewDate: 'asc' },
      take: 1000});
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to fetch overdue SDS', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch overdue SDS' } });
  }
});

// GET /api/sds/:id — get single SDS
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const item = await prisma.chemSds.findFirst({
      where: { id: req.params.id, chemical: { orgId, deletedAt: null } },
      include: { chemical: true },
    });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'SDS not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to fetch SDS', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch SDS' } });
  }
});

// POST /api/sds — create SDS for a chemical
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { chemicalId, ...rest } = req.body;
    if (!chemicalId) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'chemicalId is required' } });
    const parsed = createSdsSchema.safeParse(rest);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });

    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const chemical = await prisma.chemRegister.findFirst({ where: { id: chemicalId, orgId, deletedAt: null } as any });
    if (!chemical) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chemical not found' } });

    // Supersede existing current SDS
    await prisma.chemSds.updateMany({ where: { chemicalId, status: 'CURRENT' }, data: { status: 'SUPERSEDED' } });

    const data = await prisma.chemSds.create({
      data: { ...(parsed.data as any), chemicalId, createdBy: (req as AuthRequest).user?.id },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create SDS', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' } });
  }
});

// PUT /api/sds/:id — update SDS
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateSdsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.chemSds.findFirst({ where: { id: req.params.id, chemical: { orgId, deletedAt: null } } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'SDS not found' } });
    const data = await prisma.chemSds.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update SDS', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } });
  }
});

export default router;
