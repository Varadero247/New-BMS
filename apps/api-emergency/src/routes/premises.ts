import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('emergency-premises');

const createPremisesSchema = z.object({
  name: z.string().min(1, 'name is required'),
  address: z.string().min(1, 'address is required'),
  postcode: z.string().optional(),
  buildingType: z.string().optional(),
  constructionType: z.string().optional(),
  numberOfFloors: z.number().int().optional(),
  totalFloorAreaM2: z.number().optional(),
  maxOccupancy: z.number().int().optional(),
  normalOccupancy: z.number().int().optional(),
  responsiblePersonName: z.string().optional(),
  responsiblePersonRole: z.string().optional(),
  responsiblePersonEmail: z.string().email().optional().or(z.literal('')),
  responsiblePersonPhone: z.string().optional(),
  fireAuthorityName: z.string().optional(),
  localFireStationName: z.string().optional(),
  fireStationPhone: z.string().optional(),
  distanceToFireStation: z.number().optional(),
  buildingSafetyActApplicable: z.boolean().optional(),
  principalAccountablePerson: z.string().optional(),
  hasAutomaticFDS: z.boolean().optional(),
  hasSprinklers: z.boolean().optional(),
  hasEmergencyLighting: z.boolean().optional(),
  hasFireAlarm: z.boolean().optional(),
  hasPa: z.boolean().optional(),
  hasRisers: z.boolean().optional(),
  alarmSystem: z.string().optional(),
});

const updatePremisesSchema = createPremisesSchema.partial();

// GET /api/premises — list all premises
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const { search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: any = { organisationId: orgId };
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      (prisma as any).femPremises.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' }, include: { _count: { select: { fireRiskAssessments: true, wardens: true, activeIncidents: true, drillRecords: true } } } }),
      (prisma as any).femPremises.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error: any) { logger.error('Failed to fetch premises', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch premises' } }); }
});

// POST /api/premises — create premises
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createPremisesSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = (req as any).user?.orgId || 'default';
    const data = await (prisma as any).femPremises.create({ data: { ...parsed.data, organisationId: orgId } });
    res.status(201).json({ success: true, data });
  } catch (error: any) { logger.error('Failed to create premises', { error: error.message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); }
});

// GET /api/premises/:id — get with all related data
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await (prisma as any).femPremises.findUnique({
      where: { id: req.params.id },
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
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Premises not found' } });
    res.json({ success: true, data: item });
  } catch (error: any) { logger.error('Failed to fetch premises', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch premises' } }); }
});

// PUT /api/premises/:id — update
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updatePremisesSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await (prisma as any).femPremises.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Premises not found' } });
    const data = await (prisma as any).femPremises.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data });
  } catch (error: any) { logger.error('Failed to update premises', { error: error.message }); res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); }
});

// GET /api/premises/:id/dashboard — full premises safety dashboard
router.get('/:id/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const premisesId = req.params.id;
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [premises, fraOverdue, activeIncidents, wardenTrainingExpiring, equipmentServiceDue, peepReviewDue, lastDrill] = await Promise.all([
      (prisma as any).femPremises.findUnique({ where: { id: premisesId } }),
      (prisma as any).femFireRiskAssessment.count({ where: { premisesId, nextReviewDate: { lt: now }, deletedAt: null } }),
      (prisma as any).femEmergencyIncident.count({ where: { premisesId, status: { in: ['ACTIVE', 'ELEVATED', 'CONTAINED'] } } }),
      (prisma as any).femFireWarden.count({ where: { premisesId, isActive: true, trainingExpiryDate: { lt: thirtyDaysFromNow } } }),
      (prisma as any).femEmergencyEquipment.count({ where: { premisesId, nextServiceDue: { lt: thirtyDaysFromNow } } }),
      (prisma as any).femPeep.count({ where: { premisesId, isActive: true, reviewDate: { lt: now } } }),
      (prisma as any).femEvacuationDrill.findFirst({ where: { premisesId }, orderBy: { drillDate: 'desc' } }),
    ]);

    if (!premises) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Premises not found' } });

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
        drillOverdue: !lastDrill || new Date(lastDrill.drillDate).getTime() < now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000,
      },
    });
  } catch (error: any) { logger.error('Failed to fetch premises dashboard', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch premises dashboard' } }); }
});

export default router;
