import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('chem-incidents');

const incidentTypeEnum = z.enum(['SPILL', 'EXPOSURE', 'FIRE', 'RELEASE', 'NEAR_MISS']);
const severityEnum = z.enum(['MINOR', 'SIGNIFICANT', 'MAJOR', 'CATASTROPHIC']);
const exposureRouteEnum = z.enum(['INHALATION', 'SKIN_ABSORPTION', 'INGESTION', 'INJECTION', 'EYE_CONTACT']);

const createIncidentSchema = z.object({
  chemicalId: z.string().trim().min(1).max(200),
  incidentType: incidentTypeEnum,
  severity: severityEnum,
  dateTime: z.string().trim().datetime({ offset: true }).or(z.string().trim().datetime({ offset: true })),
  location: z.string().min(1, 'location is required'),
  description: z.string().min(1, 'description is required'),
  personsInvolved: z.array(z.string()).optional(),
  immediateActions: z.string().optional(),
  exposureRoutes: z.array(exposureRouteEnum).optional(),
  medicalAttentionGiven: z.boolean().optional(),
  riddorReportable: z.boolean().optional(),
  linkedIncidentId: z.string().optional(),
  rootCauseAnalysis: z.string().optional(),
  correctiveActions: z.string().optional(),
});

const updateIncidentSchema = createIncidentSchema.partial();

// GET /api/incidents — all chemical incidents
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { type, severity, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { chemical: { orgId, deletedAt: null } };
    if (type) where.incidentType = type as any;
    if (severity) where.severity = severity as any;
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.chemIncident.findMany({
        where, skip, take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { dateTime: 'desc' },
        include: { chemical: { select: { id: true, productName: true, casNumber: true, signalWord: true, pictograms: true } } },
      }),
      prisma.chemIncident.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: Math.max(1, parseInt(page, 10) || 1), limit: Math.max(1, parseInt(limit, 10) || 20), total, totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)) } });
  } catch (error: unknown) {
    logger.error('Failed to fetch incidents', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch incidents' } });
  }
});

// GET /api/incidents/:id — single incident
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const item = await prisma.chemIncident.findFirst({
      where: { id: req.params.id, chemical: { orgId, deletedAt: null } },
      include: { chemical: true },
    });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to fetch incident', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch incident' } });
  }
});

// POST /api/incidents — report chemical incident
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createIncidentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const d = parsed.data;

    const chemical = await prisma.chemRegister.findFirst({ where: { id: d.chemicalId, orgId, deletedAt: null } as any });
    if (!chemical) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chemical not found' } });

    const data = await prisma.chemIncident.create({
      data: { ...d, orgId, createdBy: (req as AuthRequest).user?.id },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create incident', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' } });
  }
});

// PUT /api/incidents/:id — update incident/investigation
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateIncidentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.chemIncident.findFirst({ where: { id: req.params.id, chemical: { orgId, deletedAt: null } } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    const data = await prisma.chemIncident.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update incident', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } });
  }
});

export default router;
