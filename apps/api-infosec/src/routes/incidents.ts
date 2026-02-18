import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';
import { z } from 'zod';

const logger = createLogger('api-infosec');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

function generateIncidentRef(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `ISI-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const incidentCreateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().max(5000).optional(),
  type: z.enum(['DATA_BREACH', 'UNAUTHORIZED_ACCESS', 'MALWARE', 'PHISHING', 'DENIAL_OF_SERVICE', 'INSIDER_THREAT', 'PHYSICAL_SECURITY', 'SOCIAL_ENGINEERING', 'OTHER']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  affectedSystems: z.array(z.string()).optional(),
  affectedAssetIds: z.array(z.string()).optional(),
  personalDataInvolved: z.boolean().optional().default(false),
  reportedBy: z.string().max(200).optional(),
  detectedAt: z.string().optional(),
});

const investigateSchema = z.object({
  investigationNotes: z.string().trim().min(1).max(10000),
  rootCause: z.string().max(5000).optional(),
  containmentActions: z.string().max(5000).optional(),
  assignedTo: z.string().max(200).optional(),
});

const closeSchema = z.object({
  lessonsLearned: z.string().trim().min(1).max(5000),
  correctiveActions: z.string().max(5000).optional(),
  preventiveActions: z.string().max(5000).optional(),
});

// ---------------------------------------------------------------------------
// POST / — Report security incident
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = incidentCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const refNumber = generateIncidentRef();

    const data: Record<string, unknown> = {
      refNumber,
      title: parsed.data.title,
      description: parsed.data.description || null,
      type: parsed.data.type,
      severity: parsed.data.severity,
      affectedSystems: parsed.data.affectedSystems || [],
      affectedAssetIds: parsed.data.affectedAssetIds || [],
      personalDataInvolved: parsed.data.personalDataInvolved || false,
      reportedBy: parsed.data.reportedBy || null,
      detectedAt: parsed.data.detectedAt ? new Date(parsed.data.detectedAt) : new Date(),
      status: 'REPORTED',
      createdBy: authReq.user?.id || 'system',
    };

    // GDPR 72-hour notification requirement
    if (parsed.data.personalDataInvolved) {
      data.gdprBreachNotification = true;
      data.gdprNotificationDeadline = new Date(Date.now() + 72 * 60 * 60 * 1000);
    }

    const incident = await prisma.isIncident.create({ data: data as any });

    logger.info('Security incident reported', { incidentId: incident.id, refNumber, severity: parsed.data.severity });
    res.status(201).json({ success: true, data: incident });
  } catch (error: unknown) {
    logger.error('Failed to report security incident', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to report security incident' } });
  }
});

// ---------------------------------------------------------------------------
// GET / — List incidents with filters
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, severity, status, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (type && typeof type === 'string') {
      where.type = type;
    }
    if (severity && typeof severity === 'string') {
      where.severity = severity;
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { refNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [incidents, total] = await Promise.all([
      prisma.isIncident.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.isIncident.count({ where }),
    ]);

    res.json({
      success: true,
      data: incidents,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list security incidents', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list security incidents' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Incident detail
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const incident = await prisma.isIncident.findFirst({
      where: { id, deletedAt: null } as any,
    });

    if (!incident) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Security incident not found' } });
    }

    res.json({ success: true, data: incident });
  } catch (error: unknown) {
    logger.error('Failed to get security incident', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get security incident' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/investigate — Update investigation
// ---------------------------------------------------------------------------
router.put('/:id/investigate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = investigateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }

    const existing = await prisma.isIncident.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Security incident not found' } });
    }

    const authReq = req as AuthRequest;
    const incident = await prisma.isIncident.update({
      where: { id },
      data: {
        investigationNotes: parsed.data.investigationNotes,
        rootCause: parsed.data.rootCause || null,
        containmentActions: parsed.data.containmentActions || null,
        assignedTo: parsed.data.assignedTo || null,
        status: 'INVESTIGATING',
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      } as any,
    });

    logger.info('Security incident investigation updated', { incidentId: id });
    res.json({ success: true, data: incident });
  } catch (error: unknown) {
    logger.error('Failed to update investigation', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update investigation' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/close — Close incident
// ---------------------------------------------------------------------------
router.put('/:id/close', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = closeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }

    const existing = await prisma.isIncident.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Security incident not found' } });
    }

    const authReq = req as AuthRequest;
    const incident = await prisma.isIncident.update({
      where: { id },
      data: {
        lessonsLearned: parsed.data.lessonsLearned,
        correctiveActions: parsed.data.correctiveActions || null,
        preventiveActions: parsed.data.preventiveActions || null,
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: authReq.user?.id || 'system',
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      } as any,
    });

    logger.info('Security incident closed', { incidentId: id });
    res.json({ success: true, data: incident });
  } catch (error: unknown) {
    logger.error('Failed to close security incident', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to close security incident' } });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/notify — Log GDPR notification
// ---------------------------------------------------------------------------
router.post('/:id/notify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.isIncident.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Security incident not found' } });
    }

    if (!existing.gdprBreachNotification) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'This incident does not require GDPR breach notification' } });
    }

    const authReq = req as AuthRequest;
    const incident = await prisma.isIncident.update({
      where: { id },
      data: {
        gdprNotifiedAt: new Date(),
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      } as any,
    });

    logger.info('GDPR breach notification logged', { incidentId: id });
    res.json({ success: true, data: incident });
  } catch (error: unknown) {
    logger.error('Failed to log GDPR notification', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to log GDPR notification' } });
  }
});

export default router;
