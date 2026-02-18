import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-iso42001');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `AI42-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const incidentCreateSchema = z.object({
  systemId: z.string().trim().uuid(),
  title: z.string().trim().min(1).max(300),
  description: z.string().max(10000).optional().nullable(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  incidentDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  category: z
    .enum([
      'BIAS_INCIDENT',
      'DATA_BREACH',
      'SAFETY_FAILURE',
      'PERFORMANCE_DEGRADATION',
      'UNAUTHORIZED_ACCESS',
      'MISUSE',
      'OUTPUT_ERROR',
      'SYSTEM_FAILURE',
      'PRIVACY_VIOLATION',
      'REGULATORY_BREACH',
      'OTHER',
    ])
    .optional()
    .default('OTHER'),
  affectedParties: z.string().max(2000).optional().nullable(),
  immediateAction: z.string().max(4000).optional().nullable(),
  reportedBy: z.string().max(200).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

const incidentUpdateSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  description: z.string().max(10000).optional().nullable(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['REPORTED', 'INVESTIGATING', 'MITIGATING', 'RESOLVED', 'CLOSED']).optional(),
  category: z
    .enum([
      'BIAS_INCIDENT',
      'DATA_BREACH',
      'SAFETY_FAILURE',
      'PERFORMANCE_DEGRADATION',
      'UNAUTHORIZED_ACCESS',
      'MISUSE',
      'OUTPUT_ERROR',
      'SYSTEM_FAILURE',
      'PRIVACY_VIOLATION',
      'REGULATORY_BREACH',
      'OTHER',
    ])
    .optional(),
  affectedParties: z.string().max(2000).optional().nullable(),
  immediateAction: z.string().max(4000).optional().nullable(),
  reportedBy: z.string().max(200).optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
});

const investigateSchema = z.object({
  investigator: z.string().max(200).optional().nullable(),
  rootCause: z.string().max(4000).optional().nullable(),
  findings: z.string().max(10000).optional().nullable(),
  contributingFactors: z.string().max(4000).optional().nullable(),
});

const closeSchema = z.object({
  resolution: z.string().trim().min(1).max(10000),
  lessonsLearned: z.string().max(10000).optional().nullable(),
  preventiveActions: z.string().max(4000).optional().nullable(),
  closedBy: z.string().max(200).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET / — List incidents
router.get('/', async (req: Request, res: Response) => {
  try {
    const { severity, status, systemId, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (severity && typeof severity === 'string') {
      where.severity = severity;
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (systemId && typeof systemId === 'string') {
      where.systemId = systemId;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [incidents, total] = await Promise.all([
      prisma.aiIncident.findMany({
        where,
        skip,
        take: limit,
        orderBy: { incidentDate: 'desc' },
        include: {
          system: { select: { id: true, name: true, riskTier: true } },
        },
      }),
      prisma.aiIncident.count({ where }),
    ]);

    res.json({
      success: true,
      data: incidents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list incidents', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list incidents' },
    });
  }
});

// POST / — Create incident
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = incidentCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
    }

    // Verify system exists
    const system = await prisma.aiSystem.findFirst({
      where: { id: parsed.data.systemId, deletedAt: null } as any,
    });
    if (!system) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'AI system not found' } });
    }

    const authReq = req as AuthRequest;
    const reference = generateReference('INC');

    const incident = await prisma.aiIncident.create({
      data: {
        reference,
        systemId: parsed.data.systemId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        severity: parsed.data.severity,
        status: 'REPORTED',
        incidentDate: new Date(parsed.data.incidentDate),
        category: parsed.data.category || 'OTHER',
        affectedParties: parsed.data.affectedParties ?? null,
        immediateAction: parsed.data.immediateAction ?? null,
        reportedBy: parsed.data.reportedBy ?? null,
        notes: parsed.data.notes ?? null,
        createdBy: authReq.user?.id || 'system',
      } as any,
      include: {
        system: { select: { id: true, name: true } },
      },
    });

    logger.info('AI incident created', {
      incidentId: incident.id,
      reference,
      severity: parsed.data.severity,
    });
    res.status(201).json({ success: true, data: incident });
  } catch (error: unknown) {
    logger.error('Failed to create incident', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create incident' },
    });
  }
});

// PUT /:id/investigate — Update investigation details
router.put('/:id/investigate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = investigateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await prisma.aiIncident.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    }

    if (existing.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_CLOSED', message: 'Cannot investigate a closed incident' },
      });
    }

    const authReq = req as AuthRequest;
    const incident = await prisma.aiIncident.update({
      where: { id },
      data: {
        status: 'INVESTIGATING',
        investigator: parsed.data.investigator ?? null,
        rootCause: parsed.data.rootCause ?? null,
        findings: parsed.data.findings ?? null,
        contributingFactors: parsed.data.contributingFactors ?? null,
        investigationStartedAt: (existing as any).investigationStartedAt || new Date(),
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      } as any,
      include: {
        system: { select: { id: true, name: true } },
      },
    });

    logger.info('AI incident investigation updated', { incidentId: id });
    res.json({ success: true, data: incident });
  } catch (error: unknown) {
    logger.error('Failed to update investigation', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update investigation' },
    });
  }
});

// PUT /:id/close — Close incident with resolution
router.put('/:id/close', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = closeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await prisma.aiIncident.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    }

    if (existing.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_CLOSED', message: 'Incident is already closed' },
      });
    }

    const authReq = req as AuthRequest;
    const incident = await prisma.aiIncident.update({
      where: { id },
      data: {
        status: 'CLOSED',
        resolution: parsed.data.resolution,
        lessonsLearned: parsed.data.lessonsLearned ?? null,
        preventiveActions: parsed.data.preventiveActions ?? null,
        closedAt: new Date(),
        closedBy: parsed.data.closedBy || authReq.user?.id || 'system',
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      } as any,
      include: {
        system: { select: { id: true, name: true } },
      },
    });

    logger.info('AI incident closed', { incidentId: id });
    res.json({ success: true, data: incident });
  } catch (error: unknown) {
    logger.error('Failed to close incident', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to close incident' },
    });
  }
});

// GET /:id — Get incident by ID
const RESERVED_PATHS = new Set(['investigate', 'close']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const incident = await prisma.aiIncident.findFirst({
      where: { id, deletedAt: null } as any,
      include: {
        system: { select: { id: true, name: true, riskTier: true } },
      },
    });

    if (!incident) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    }

    res.json({ success: true, data: incident });
  } catch (error: unknown) {
    logger.error('Failed to get incident', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get incident' },
    });
  }
});

// PUT /:id — Update incident
router.put('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const parsed = incidentUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await prisma.aiIncident.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    }

    const authReq = req as AuthRequest;
    const incident = await prisma.aiIncident.update({
      where: { id },
      data: {
        ...parsed.data,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      } as any,
      include: {
        system: { select: { id: true, name: true } },
      },
    });

    logger.info('AI incident updated', { incidentId: id });
    res.json({ success: true, data: incident });
  } catch (error: unknown) {
    logger.error('Failed to update incident', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update incident' },
    });
  }
});

// DELETE /:id — Soft delete incident
router.delete('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const existing = await prisma.aiIncident.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    }

    const authReq = req as AuthRequest;
    await prisma.aiIncident.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: authReq.user?.id || 'system',
      } as any,
    });

    logger.info('AI incident soft-deleted', { incidentId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete incident', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete incident' },
    });
  }
});

export default router;
