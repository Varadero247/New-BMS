import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-iso42001');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const auditLogCreateSchema = z.object({
  systemId: z.string().max(100).optional().nullable(),
  action: z.enum(['DECISION', 'OVERRIDE', 'REVIEW', 'APPROVAL', 'REJECTION', 'ESCALATION', 'CONFIG_CHANGE']),
  description: z.string().min(1).max(2000),
  inputSummary: z.string().max(5000).optional().nullable(),
  outputSummary: z.string().max(5000).optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
  riskScore: z.number().int().min(0).max(100).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET / — List audit log entries (read-only, append-only ledger)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { action, systemId, userId, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (action && typeof action === 'string') {
      where.action = action;
    }
    if (systemId && typeof systemId === 'string') {
      where.systemId = systemId;
    }
    if (userId && typeof userId === 'string') {
      where.userId = userId;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [entries, total] = await Promise.all([
      prisma.aiAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aiAuditLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: entries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list audit logs', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list audit logs' } });
  }
});

// POST / — Create audit log entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = auditLogCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const authReq = req as AuthRequest;
    const entry = await prisma.aiAuditLog.create({
      data: {
        systemId: parsed.data.systemId ?? null,
        action: parsed.data.action,
        description: parsed.data.description,
        inputSummary: parsed.data.inputSummary ?? null,
        outputSummary: parsed.data.outputSummary ?? null,
        metadata: parsed.data.metadata ?? null,
        riskScore: parsed.data.riskScore ?? null,
        userId: authReq.user?.id || 'system',
        userName: authReq.user?.email || 'system',
        ipAddress: req.ip || null,
        organisationId: authReq.user?.organisationId || 'default',
      },
    });

    logger.info('AI audit log entry created', { entryId: entry.id, action: parsed.data.action });
    res.status(201).json({ success: true, data: entry });
  } catch (error: unknown) {
    logger.error('Failed to create audit log', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create audit log entry' } });
  }
});

// GET /stats — Audit log statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [totalEntries, actionCounts, recentEntries] = await Promise.all([
      prisma.aiAuditLog.count(),
      prisma.aiAuditLog.groupBy({
        by: ['action'],
        _count: { id: true },
      }),
      prisma.aiAuditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, action: true, description: true, userName: true, createdAt: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalEntries,
        byAction: actionCounts.reduce((acc, g) => {
          acc[g.action] = g._count.id;
          return acc;
        }, {} as Record<string, number>),
        recent: recentEntries,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get audit stats', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get audit log stats' } });
  }
});

// GET /:id — Get single audit log entry
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await prisma.aiAuditLog.findUnique({ where: { id } });
    if (!entry) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit log entry not found' } });
    }
    res.json({ success: true, data: entry });
  } catch (error: unknown) {
    logger.error('Failed to get audit log entry', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get audit log entry' } });
  }
});

export default router;
