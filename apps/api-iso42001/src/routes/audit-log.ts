import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-iso42001');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const auditLogCreateSchema = z.object({
  systemId: z.string().trim().max(100).optional().nullable(),
  action: z.enum([
    'DECISION',
    'OVERRIDE',
    'REVIEW',
    'APPROVAL',
    'REJECTION',
    'ESCALATION',
    'CONFIG_CHANGE',
  ]),
  description: z.string().trim().min(1).max(2000),
  inputSummary: z.string().trim().max(5000).optional().nullable(),
  outputSummary: z.string().trim().max(5000).optional().nullable(),
  metadata: z.record(z.unknown()).optional().nullable(),
  riskScore: z.number().int().min(0).max(100).optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

function parseDateParam(val: unknown): Date | null {
  if (!val || typeof val !== 'string') return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

// ---------------------------------------------------------------------------
// Routes — Named routes MUST come before /:id
// ---------------------------------------------------------------------------

// GET /stats — Audit log statistics (counts by action, daily counts, top users)
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const orgFilter: Record<string, unknown> = {};
    if ((authReq.user as { organisationId?: string })?.organisationId) {
      orgFilter.organisationId = (authReq.user as { organisationId?: string }).organisationId;
    }

    const [totalEntries, actionCounts, recentEntries, topUsers] = await Promise.all([
      prisma.aiAuditLog.count({ where: orgFilter }),
      prisma.aiAuditLog.groupBy({
        by: ['action'],
        where: orgFilter,
        _count: { id: true },
      }),
      prisma.aiAuditLog.findMany({
        where: orgFilter,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, action: true, description: true, userName: true, createdAt: true },
      }),
      prisma.aiAuditLog.groupBy({
        by: ['userId', 'userName'],
        where: orgFilter,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    // Build daily counts from recent entries (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyEntries = await prisma.aiAuditLog.groupBy({
      by: ['createdAt'],
      where: {
        ...orgFilter,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: { id: true },
    });

    // Aggregate by date string
    const dailyCounts: Record<string, number> = {};
    for (const entry of dailyEntries) {
      const dateKey = entry.createdAt.toISOString().split('T')[0];
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + (entry as { _count: { id: number } })._count.id;
    }

    res.json({
      success: true,
      data: {
        totalEntries,
        byAction: actionCounts.reduce(
          (acc, g) => {
            acc[g.action] = (g as { _count: { id: number } })._count.id;
            return acc;
          },
          {} as Record<string, number>
        ),
        dailyCounts,
        topUsers: topUsers.map((u) => ({
          userId: u.userId,
          userName: u.userName,
          count: (u as { _count: { id: number } })._count.id,
        })),
        recent: recentEntries,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get audit stats', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get audit log stats' },
    });
  }
});

// GET / — List audit log entries with pagination, filtering by action, systemId, userId, date range
router.get('/', async (req: Request, res: Response) => {
  try {
    const { action, systemId, userId, search, startDate, endDate } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
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

    // Date range filtering
    const fromDate = parseDateParam(startDate);
    const toDate = parseDateParam(endDate);
    if (fromDate || toDate) {
      const createdAt: Record<string, Date> = {};
      if (fromDate) createdAt.gte = fromDate;
      if (toDate) createdAt.lte = toDate;
      where.createdAt = createdAt;
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
    logger.error('Failed to list audit logs', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list audit logs' },
    });
  }
});

// POST / — Create audit log entry (for middleware use)
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = auditLogCreateSchema.safeParse(req.body);
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

    const authReq = req as AuthRequest;
    const entry = await prisma.aiAuditLog.create({
      data: {
        systemId: parsed.data.systemId ?? null,
        action: parsed.data.action,
        description: parsed.data.description,
        inputSummary: parsed.data.inputSummary ?? null,
        outputSummary: parsed.data.outputSummary ?? null,
        metadata: (parsed.data.metadata ?? undefined) as any,
        riskScore: parsed.data.riskScore ?? null,
        userId: authReq.user?.id || 'system',
        userName: authReq.user?.email || 'system',
        ipAddress: req.ip || null,
        organisationId: (authReq.user as { organisationId?: string })?.organisationId || 'default',
      },
    });

    logger.info('AI audit log entry created', { entryId: entry.id, action: parsed.data.action });
    res.status(201).json({ success: true, data: entry });
  } catch (error: unknown) {
    logger.error('Failed to create audit log', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create audit log entry' },
    });
  }
});

// GET /:id — Get single audit log entry
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await prisma.aiAuditLog.findUnique({ where: { id } });
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Audit log entry not found' },
      });
    }
    res.json({ success: true, data: entry });
  } catch (error: unknown) {
    logger.error('Failed to get audit log entry', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get audit log entry' },
    });
  }
});

// DELETE /:id — Soft delete (mark in metadata, audit logs are immutable)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = await prisma.aiAuditLog.findUnique({ where: { id } });
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Audit log entry not found' },
      });
    }

    const authReq = req as AuthRequest;
    const existingMetadata = (entry.metadata as Record<string, unknown>) || {};

    // Audit logs are immutable — mark as "deleted" in metadata rather than actually removing
    await prisma.aiAuditLog.update({
      where: { id },
      data: {
        metadata: {
          ...existingMetadata,
          _deleted: true,
          _deletedAt: new Date().toISOString(),
          _deletedBy: authReq.user?.id || 'system',
        },
      },
    });

    logger.info('AI audit log entry soft-deleted', { entryId: id, deletedBy: authReq.user?.id });
    res.status(204).send();
  } catch (error: unknown) {
    logger.error('Failed to delete audit log entry', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete audit log entry' },
    });
  }
});

export default router;
