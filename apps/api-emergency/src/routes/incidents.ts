import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { notifyEmergencyDeclared, notifyIncidentStatusChange } from '../services/notificationTriggers';

const router = Router();
const logger = createLogger('emergency-incidents');

const emergencyTypeEnum = z.enum(['FIRE', 'EXPLOSION', 'CHEMICAL_SPILL', 'GAS_LEAK', 'FLOOD', 'STRUCTURAL_FAILURE', 'POWER_FAILURE', 'CYBER_ATTACK', 'BOMB_THREAT', 'CIVIL_UNREST', 'PANDEMIC', 'SEVERE_WEATHER', 'UTILITY_FAILURE', 'MEDICAL_MASS_CASUALTY', 'TERRORISM', 'ENVIRONMENTAL_RELEASE', 'SUPPLY_CHAIN_DISRUPTION', 'OTHER']);
const severityEnum = z.enum(['MINOR', 'SIGNIFICANT', 'MAJOR', 'CRITICAL', 'CATASTROPHIC']);
const statusEnum = z.enum(['STANDBY', 'ELEVATED', 'ACTIVE', 'CONTAINED', 'CLOSED']);
const evacuationTypeEnum = z.enum(['FULL_EVACUATION', 'PARTIAL_EVACUATION', 'HORIZONTAL_EVACUATION', 'PHASED_EVACUATION', 'STAY_PUT', 'SHELTER_IN_PLACE']);

// Quick declaration schema — optimised for speed (cardinal rule #4)
const declareIncidentSchema = z.object({
  emergencyType: emergencyTypeEnum,
  severity: severityEnum,
  premisesId: z.string().optional(),
  title: z.string().min(1, 'title is required'),
  description: z.string().min(1, 'description is required'),
  evacuationOrdered: z.boolean().optional(),
  evacuationType: evacuationTypeEnum.optional(),
});

const updateIncidentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  severity: severityEnum.optional(),
  status: statusEnum.optional(),
  locationDescription: z.string().optional(),
  affectedAreas: z.array(z.string()).optional(),
  evacuationOrdered: z.boolean().optional(),
  evacuationType: evacuationTypeEnum.optional(),
  assemblyPointUsed: z.string().optional(),
  estimatedPersonsAffected: z.number().int().optional(),
  injuriesReported: z.boolean().optional(),
  fatalitiesReported: z.boolean().optional(),
  incidentCommanderName: z.string().optional(),
  commandCentreLocation: z.string().optional(),
  commandCentreActivated: z.boolean().optional(),
  fireServiceNotified: z.boolean().optional(),
  policeNotified: z.boolean().optional(),
  ambulanceNotified: z.boolean().optional(),
  utilityNotified: z.boolean().optional(),
  regulatorNotified: z.boolean().optional(),
  mediaStatementIssued: z.boolean().optional(),
  riddorReportable: z.boolean().optional(),
  riddorCategory: z.string().optional(),
  bcpActivated: z.boolean().optional(),
  bcpReference: z.string().optional(),
  continuityImpact: z.string().optional(),
  estimatedRecoveryHrs: z.number().int().optional(),
  immediateActions: z.string().optional(),
  rootCauseCategory: z.string().optional(),
  lessonsLearned: z.string().optional(),
});

async function generateIncidentNumber(orgId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.femEmergencyIncident.count({
    where: { organisationId: orgId, incidentNumber: { startsWith: `INC-${year}` } },
  });
  return `INC-${year}-${String(count + 1).padStart(4, '0')}`;
}

// GET /api/incidents — all incidents
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const { status, emergencyType, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { organisationId: orgId };
    if (status) where.status = status as any;
    if (emergencyType) where.emergencyType = emergencyType as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.femEmergencyIncident.findMany({ where, skip, take: parseInt(limit), orderBy: { reportedAt: 'desc' }, include: { premises: { select: { name: true } }, _count: { select: { decisions: true, timeline: true } } } }),
      prisma.femEmergencyIncident.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error: unknown) { logger.error('Failed to fetch incidents', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch incidents' } }); }
});

// GET /api/incidents/active — currently active incidents ONLY (before /:id)
router.get('/active', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const data = await prisma.femEmergencyIncident.findMany({
      where: { organisationId: orgId, status: { in: ['ACTIVE', 'ELEVATED', 'CONTAINED'] } },
      include: { premises: { select: { name: true } }, _count: { select: { decisions: true, timeline: true } } },
      orderBy: { reportedAt: 'desc' },
    });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to fetch active incidents', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch active incidents' } }); }
});

// POST /api/incidents — declare new emergency incident (FAST — cardinal rule #4)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = declareIncidentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = (req as any).user?.orgId || 'default';
    const incidentNumber = await generateIncidentNumber(orgId);
    const data = await prisma.femEmergencyIncident.create({
      data: {
        incidentNumber,
        emergencyType: parsed.data.emergencyType,
        severity: parsed.data.severity,
        status: 'ACTIVE',
        title: parsed.data.title,
        description: parsed.data.description,
        premisesId: parsed.data.premisesId || undefined,
        evacuationOrdered: parsed.data.evacuationOrdered || false,
        evacuationType: parsed.data.evacuationType || undefined,
        activatedAt: new Date(),
        createdBy: (req as AuthRequest).user?.id,
        organisationId: orgId,
      },
      include: { premises: { select: { name: true } } },
    });
    // Add initial timeline event
    await prisma.femIncidentTimelineEvent.create({
      data: { incidentId: data.id, eventType: 'DECLARED', description: `Emergency declared: ${parsed.data.emergencyType} - ${parsed.data.severity}`, recordedBy: (req as AuthRequest).user?.id },
    });
    // Trigger notifications
    notifyEmergencyDeclared(incidentNumber, parsed.data.emergencyType, parsed.data.severity, data.premises?.name);
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to declare incident', { error: (error as Error).message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Failed to declare incident' } }); }
});

// GET /api/incidents/:id — full incident with all logs
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const item = await prisma.femEmergencyIncident.findFirst({
      where: { id: req.params.id, organisationId: orgId },
      include: {
        premises: true,
        decisions: { orderBy: { timestamp: 'desc' } },
        resourceDeployments: { orderBy: { deployedAt: 'desc' } },
        communications: { orderBy: { timestamp: 'desc' } },
        timeline: { orderBy: { timestamp: 'desc' } },
      },
    });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) { logger.error('Failed to fetch incident', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch incident' } }); }
});

// PUT /api/incidents/:id — update incident
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateIncidentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = (req as any).user?.orgId || 'default';
    const existing = await prisma.femEmergencyIncident.findFirst({ where: { id: req.params.id, organisationId: orgId } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.fireServiceNotified && !existing.fireServiceNotifiedAt) updateData.fireServiceNotifiedAt = new Date();
    if (parsed.data.regulatorNotified && !existing.regulatorNotifiedAt) updateData.regulatorNotifiedAt = new Date();
    if (parsed.data.status === 'CONTAINED' && !existing.containedAt) updateData.containedAt = new Date();
    const data = await prisma.femEmergencyIncident.update({ where: { id: req.params.id }, data: updateData });
    if (parsed.data.status && parsed.data.status !== existing.status) {
      await prisma.femIncidentTimelineEvent.create({
        data: { incidentId: data.id, eventType: 'STATUS_CHANGE', description: `Status changed from ${existing.status} to ${parsed.data.status}`, recordedBy: (req as AuthRequest).user?.id },
      });
      notifyIncidentStatusChange(existing.incidentNumber, parsed.data.status);
    }
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to update incident', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update incident' } }); }
});

// POST /api/incidents/:id/close — close incident and trigger review
router.post('/:id/close', authenticate, async (req: Request, res: Response) => {
  try {
    const { lessonsLearned, rootCauseCategory, riddorReportable, riddorCategory } = req.body;
    const orgId = (req as any).user?.orgId || 'default';
    const existing = await prisma.femEmergencyIncident.findFirst({ where: { id: req.params.id, organisationId: orgId } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    const data = await prisma.femEmergencyIncident.update({
      where: { id: req.params.id },
      data: {
        status: 'CLOSED', closedAt: new Date(), lessonsLearned, rootCauseCategory,
        riddorReportable: riddorReportable || false, riddorCategory,
        reviewCompletedAt: new Date(), reviewedBy: (req as AuthRequest).user?.id,
      },
    });
    await prisma.femIncidentTimelineEvent.create({
      data: { incidentId: data.id, eventType: 'CLOSED', description: 'Incident closed and review completed', recordedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to close incident', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'CLOSE_ERROR', message: 'Failed to close incident' } }); }
});

// POST /api/incidents/:id/decision — log decision (ISO 22320, append-only)
router.post('/:id/decision', authenticate, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      decisionMaker: z.string().min(1),
      decisionMakerRole: z.string().optional(),
      situationSummary: z.string().min(1),
      decisionMade: z.string().min(1),
      rationaleForDecision: z.string().optional(),
      resourcesAllocated: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existingOrgId = (req as any).user?.orgId || 'default';
    const existing = await prisma.femEmergencyIncident.findFirst({ where: { id: req.params.id, organisationId: existingOrgId } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    const data = await prisma.femIncidentDecisionLog.create({ data: { incidentId: req.params.id, ...parsed.data } });
    await prisma.femIncidentTimelineEvent.create({
      data: { incidentId: req.params.id, eventType: 'DECISION', description: `Decision: ${parsed.data.decisionMade}`, recordedBy: (req as AuthRequest).user?.id },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to log decision', { error: (error as Error).message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Failed to log decision' } }); }
});

// POST /api/incidents/:id/resource — log resource deployment
router.post('/:id/resource', authenticate, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      resourceType: z.string().min(1),
      resourceName: z.string().min(1),
      deployedBy: z.string().optional(),
      location: z.string().optional(),
      notes: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existingOrgId = (req as any).user?.orgId || 'default';
    const existing = await prisma.femEmergencyIncident.findFirst({ where: { id: req.params.id, organisationId: existingOrgId } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    const data = await prisma.femIncidentResourceLog.create({ data: { incidentId: req.params.id, ...parsed.data } });
    await prisma.femIncidentTimelineEvent.create({
      data: { incidentId: req.params.id, eventType: 'RESOURCE', description: `Resource deployed: ${parsed.data.resourceType} - ${parsed.data.resourceName}`, recordedBy: (req as AuthRequest).user?.id },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to log resource', { error: (error as Error).message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Failed to log resource' } }); }
});

// POST /api/incidents/:id/communication — log communication
router.post('/:id/communication', authenticate, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      communicationType: z.string().min(1),
      recipient: z.string().min(1),
      method: z.string().min(1),
      messageContent: z.string().min(1),
      sentBy: z.string().optional(),
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existingOrgId = (req as any).user?.orgId || 'default';
    const existing = await prisma.femEmergencyIncident.findFirst({ where: { id: req.params.id, organisationId: existingOrgId } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    const data = await prisma.femIncidentCommunicationLog.create({ data: { incidentId: req.params.id, ...parsed.data, sentBy: parsed.data.sentBy || (req as AuthRequest).user?.id } });
    await prisma.femIncidentTimelineEvent.create({
      data: { incidentId: req.params.id, eventType: 'COMMUNICATION', description: `${parsed.data.communicationType} to ${parsed.data.recipient} via ${parsed.data.method}`, recordedBy: (req as AuthRequest).user?.id },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to log communication', { error: (error as Error).message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Failed to log communication' } }); }
});

// POST /api/incidents/:id/timeline — add timeline event
router.post('/:id/timeline', authenticate, async (req: Request, res: Response) => {
  try {
    const schema = z.object({ eventType: z.string().min(1), description: z.string().min(1) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existingOrgId = (req as any).user?.orgId || 'default';
    const existing = await prisma.femEmergencyIncident.findFirst({ where: { id: req.params.id, organisationId: existingOrgId } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    const data = await prisma.femIncidentTimelineEvent.create({ data: { incidentId: req.params.id, ...parsed.data, recordedBy: (req as AuthRequest).user?.id } });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to add timeline event', { error: (error as Error).message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Failed to add timeline event' } }); }
});

// GET /api/incidents/:id/timeline — full chronological log
router.get('/:id/timeline', authenticate, async (req: Request, res: Response) => {
  try {
    const data = await prisma.femIncidentTimelineEvent.findMany({
      where: { incidentId: req.params.id },
      orderBy: { timestamp: 'asc' },
    });
    res.json({ success: true, data });
  } catch (error: unknown) { logger.error('Failed to fetch timeline', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch timeline' } }); }
});

export default router;
