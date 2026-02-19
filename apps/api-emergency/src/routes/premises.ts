import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';

const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('emergency-premises');

const createPremisesSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  address: z.string().trim().min(1, 'address is required'),
  postcode: z.string().trim().optional(),
  buildingType: z.string().trim().optional(),
  constructionType: z.string().trim().optional(),
  numberOfFloors: z.number().int().optional(),
  totalFloorAreaM2: z.number().nonnegative().optional(),
  maxOccupancy: z.number().int().optional(),
  normalOccupancy: z.number().int().optional(),
  responsiblePersonName: z.string().trim().optional(),
  responsiblePersonRole: z.string().trim().optional(),
  responsiblePersonEmail: z.string().trim().email().optional().or(z.literal('')),
  responsiblePersonPhone: z.string().trim().optional(),
  fireAuthorityName: z.string().trim().optional(),
  localFireStationName: z.string().trim().optional(),
  fireStationPhone: z.string().trim().optional(),
  distanceToFireStation: z.number().optional(),
  buildingSafetyActApplicable: z.boolean().optional(),
  principalAccountablePerson: z.string().trim().optional(),
  hasAutomaticFDS: z.boolean().optional(),
  hasSprinklers: z.boolean().optional(),
  hasEmergencyLighting: z.boolean().optional(),
  hasFireAlarm: z.boolean().optional(),
  hasPa: z.boolean().optional(),
  hasRisers: z.boolean().optional(),
  alarmSystem: z.string().trim().optional(),
});

const updatePremisesSchema = createPremisesSchema.partial();

// GET /api/premises — list all premises
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const { search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { organisationId: orgId };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.femPremises.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              fireRiskAssessments: true,
              wardens: true,
              activeIncidents: true,
              drillRecords: true,
            },
          },
        },
      }),
      prisma.femPremises.count({ where }),
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
    logger.error('Failed to fetch premises', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch premises' },
    });
  }
});

// POST /api/premises — create premises
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createPremisesSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = (req as any).user?.orgId || 'default';
    const data = await prisma.femPremises.create({
      data: { ...parsed.data, organisationId: orgId },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create premises', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create premises' },
    });
  }
});

// GET /api/premises/:id — get with all related data
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const item = await prisma.femPremises.findFirst({
      where: { id: req.params.id, organisationId: orgId },
      include: {
        fireRiskAssessments: { orderBy: { assessmentDate: 'desc' }, take: 5 },
        assemblyPoints: true,
        evacuationRoutes: true,
        wardens: { where: { isActive: true } },
        emergencyContacts: { orderBy: { priority: 'asc' } },
        emergencyEquipment: true,
        activeIncidents: { where: { status: { in: ['ACTIVE', 'ELEVATED', 'CONTAINED'] } } },
        drillRecords: { orderBy: { drillDate: 'desc' }, take: 5 },
        _count: { select: { peeps: true } },
      },
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Premises not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to fetch premises', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch premises' },
    });
  }
});

// PUT /api/premises/:id — update
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updatePremisesSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = (req as any).user?.orgId || 'default';
    const existing = await prisma.femPremises.findFirst({
      where: { id: req.params.id, organisationId: orgId },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Premises not found' } });
    const data = await prisma.femPremises.update({
      where: { id: req.params.id },
      data: parsed.data,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update premises', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update premises' },
    });
  }
});

// GET /api/premises/:id/dashboard — full premises safety dashboard
router.get('/:id/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const premisesId = req.params.id;
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      premises,
      fraOverdue,
      activeIncidents,
      wardenTrainingExpiring,
      equipmentServiceDue,
      peepReviewDue,
      lastDrill,
    ] = await Promise.all([
      prisma.femPremises.findUnique({ where: { id: premisesId } }),
      prisma.femFireRiskAssessment.count({
        where: { premisesId, nextReviewDate: { lt: now }, deletedAt: null },
      }),
      prisma.femEmergencyIncident.count({
        where: { premisesId, status: { in: ['ACTIVE', 'ELEVATED', 'CONTAINED'] } },
      }),
      prisma.femFireWarden.count({
        where: { premisesId, isActive: true, trainingExpiryDate: { lt: thirtyDaysFromNow } },
      }),
      prisma.femEmergencyEquipment.count({
        where: { premisesId, nextServiceDue: { lt: thirtyDaysFromNow } },
      }),
      prisma.femPeep.count({ where: { premisesId, isActive: true, reviewDate: { lt: now } } }),
      prisma.femEvacuationDrill.findFirst({
        where: { premisesId },
        orderBy: { drillDate: 'desc' },
      }),
    ]);

    if (!premises)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Premises not found' } });

    res.json({
      success: true,
      data: {
        premises,
        fraOverdueCount: fraOverdue,
        activeIncidentsCount: activeIncidents,
        wardenTrainingExpiringCount: wardenTrainingExpiring,
        equipmentServiceDueCount: equipmentServiceDue,
        peepReviewDueCount: peepReviewDue,
        lastDrill,
        drillOverdue:
          !lastDrill ||
          new Date(lastDrill.drillDate).getTime() < now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to fetch premises dashboard', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch premises dashboard' },
    });
  }
});

export default router;
