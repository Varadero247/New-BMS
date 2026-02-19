import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';

const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('chem-sds');

const sdsStatusEnum = z.enum(['CURRENT', 'UNDER_REVIEW', 'SUPERSEDED', 'MISSING']);

const createSdsSchema = z.object({
  version: z.string().trim().min(1).max(200),
  issueDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(z.string().trim().datetime({ offset: true })),
  revisionDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .optional()
    .or(z.string().trim().datetime({ offset: true }).optional()),
  nextReviewDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .or(z.string().trim().datetime({ offset: true })),
  status: sdsStatusEnum.optional(),
  documentRef: z.string().trim().optional(),
  productUseDescription: z.string().trim().optional(),
  restrictedUses: z.string().trim().optional(),
  otherHazards: z.string().trim().optional(),
  ingredients: z.any().optional(),
  firstAidInhalation: z.string().trim().optional(),
  firstAidSkinContact: z.string().trim().optional(),
  firstAidEyeContact: z.string().trim().optional(),
  firstAidIngestion: z.string().trim().optional(),
  firstAidSymptoms: z.string().trim().optional(),
  firstAidMedicalNote: z.string().trim().optional(),
  suitableExtinguishers: z.string().trim().optional(),
  unsuitableExtinguish: z.string().trim().optional(),
  fireHazards: z.string().trim().optional(),
  fireFightingPPE: z.string().trim().optional(),
  personalPrecautions: z.string().trim().optional(),
  envPrecautions: z.string().trim().optional(),
  containmentCleanup: z.string().trim().optional(),
  handlingPrecautions: z.string().trim().optional(),
  storageConditions: z.string().trim().optional(),
  specificEndUse: z.string().trim().optional(),
  engineeringControls: z.string().trim().optional(),
  respiratoryProtection: z.string().trim().optional(),
  handProtection: z.string().trim().optional(),
  eyeProtection: z.string().trim().optional(),
  skinProtection: z.string().trim().optional(),
  environmentalExposure: z.string().trim().optional(),
  reactivity: z.string().trim().optional(),
  chemicalStability: z.string().trim().optional(),
  hazardousReactions: z.string().trim().optional(),
  conditionsToAvoid: z.string().trim().optional(),
  incompatibleMaterials: z.string().trim().optional(),
  hazardousDecomposition: z.string().trim().optional(),
  acuteToxicity: z.string().trim().optional(),
  skinIrritationCorros: z.string().trim().optional(),
  eyeIrritationCorros: z.string().trim().optional(),
  respiratorySensitiz: z.string().trim().optional(),
  skinSensitization: z.string().trim().optional(),
  germCellMutagenicity: z.string().trim().optional(),
  carcinogenicity: z.string().trim().optional(),
  reproductiveToxicity: z.string().trim().optional(),
  stocsTargetOrgan: z.string().trim().optional(),
  aspirationHazard: z.string().trim().optional(),
  aquaticToxicity: z.string().trim().optional(),
  persistenceDegradabil: z.string().trim().optional(),
  bioaccumulation: z.string().trim().optional(),
  soilMobility: z.string().trim().optional(),
  pbtAssessment: z.string().trim().optional(),
  otherAdverseEffects: z.string().trim().optional(),
  wasteDisposalMethod: z.string().trim().optional(),
  unNumber: z.string().trim().optional(),
  properShippingName: z.string().trim().optional(),
  transportHazardClass: z.string().trim().optional(),
  packingGroup: z.string().trim().optional(),
  envHazardTransport: z.boolean().optional(),
  specialTransportPrecautions: z.string().trim().optional(),
  safetyHealthEnvRegs: z.string().trim().optional(),
  chemicalSafetyAssessment: z.boolean().optional(),
  revisionsDescription: z.string().trim().optional(),
  abbreviations: z.string().trim().optional(),
  dataSourcesUsed: z.string().trim().optional(),
  fileUrl: z.string().trim().url('Invalid URL').optional(),
  fileHash: z.string().trim().optional(),
});

const updateSdsSchema = createSdsSchema.partial();

// GET /api/sds — all SDS records (org-wide)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { chemical: { orgId, deletedAt: null } };
    if (status) where.status = status as any;
    if (search) {
      where.chemical = {
        ...((where.chemical as any) || {}),
        OR: [
          { productName: { contains: search, mode: 'insensitive' } },
          { casNumber: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.chemSds.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { issueDate: 'desc' },
        include: {
          chemical: {
            select: {
              id: true,
              productName: true,
              casNumber: true,
              signalWord: true,
              pictograms: true,
            },
          },
        },
      }),
      prisma.chemSds.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: Math.max(1, parseInt(limit, 10) || 20),
        total,
        totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to fetch SDS records', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch SDS records' },
    });
  }
});

// GET /api/sds/overdue — SDS past review date
router.get('/overdue', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const data = await prisma.chemSds.findMany({
      where: {
        status: 'CURRENT',
        nextReviewDate: { lte: new Date() },
        chemical: { orgId, deletedAt: null },
      },
      include: { chemical: { select: { id: true, productName: true, casNumber: true } } },
      orderBy: { nextReviewDate: 'asc' },
      take: 1000,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to fetch overdue SDS', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch overdue SDS' },
    });
  }
});

// GET /api/sds/:id — get single SDS
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const item = await prisma.chemSds.findFirst({
      where: { id: req.params.id, chemical: { orgId, deletedAt: null } },
      include: { chemical: true },
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'SDS not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to fetch SDS', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch SDS' } });
  }
});

// POST /api/sds — create SDS for a chemical
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const _schema = z.object({
      chemicalId: z
        .string({ required_error: 'chemicalId is required' })
        .trim()
        .uuid({ message: 'chemicalId must be a valid UUID' }),
    });
    const _parsedId = _schema.safeParse(req.body);
    if (!_parsedId.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: _parsedId.error.errors[0].message },
      });
    const { chemicalId, ...rest } = req.body;
    // chemicalId validated above
    const parsed = createSdsSchema.safeParse(rest);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });

    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const chemical = await prisma.chemRegister.findFirst({
      where: { id: chemicalId, orgId, deletedAt: null } as any,
    });
    if (!chemical)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Chemical not found' } });

    // Supersede existing current SDS
    await prisma.chemSds.updateMany({
      where: { chemicalId, status: 'CURRENT' },
      data: { status: 'SUPERSEDED' },
    });

    const data = await prisma.chemSds.create({
      data: { ...(parsed.data as any), chemicalId, createdBy: (req as AuthRequest).user?.id },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create SDS', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' },
    });
  }
});

// PUT /api/sds/:id — update SDS
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateSdsSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.chemSds.findFirst({
      where: { id: req.params.id, chemical: { orgId, deletedAt: null } },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'SDS not found' } });
    const data = await prisma.chemSds.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update SDS', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' },
    });
  }
});

export default router;
