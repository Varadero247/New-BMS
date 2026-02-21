import { Router, Request, Response } from 'express';
import { prisma as prismaBase } from '@ims/database';
import type { PrismaClient } from '@ims/database/core';
import { authenticate, type AuthRequest } from '@ims/auth';

const prisma = prismaBase as unknown as PrismaClient;
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { createHash } from 'crypto';

/**
 * Deterministic pseudo-score (70–100) derived from a stable hash of the client ID.
 * Used for mock compliance health data until per-client compliance tables are available.
 */
function deterministicScore(clientId: string, seed: string = ''): number {
  const hash = createHash('sha256')
    .update(clientId + seed)
    .digest();
  return 70 + (hash[0] % 31); // 70–100
}

const logger = createLogger('api-gateway:msp');
const router = Router();

router.use(authenticate);
router.param('id', validateIdParam());

// ── Validation schemas ──────────────────────────────────────────────

const linkSchema = z.object({
  clientOrganisationId: z.string().trim().uuid(),
  clientOrganisationName: z.string().trim().min(1).max(200),
  permissions: z.array(z.enum(['READ', 'AUDIT', 'MANAGE', 'BILLING'])).min(1),
  whiteLabel: z
    .object({
      brandName: z.string().trim().max(100).optional(),
      logoUrl: z.string().trim().url().optional(),
      primaryColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
    })
    .optional(),
});

const updateLinkSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'REVOKED']).optional(),
  permissions: z
    .array(z.enum(['READ', 'AUDIT', 'MANAGE', 'BILLING']))
    .min(1)
    .optional(),
  whiteLabel: z
    .object({
      brandName: z.string().trim().max(100).optional(),
      logoUrl: z.string().trim().url().optional(),
      primaryColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
    })
    .optional(),
});

// ── Helper: check if user has MSP/consultant role ───────────────────

function isMspUser(user: Record<string, unknown>): boolean {
  const roles = user.roles || user.role || [];
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.some((r: string) =>
    ['SUPER_ADMIN', 'ORG_ADMIN', 'MSP_CONSULTANT', 'PARTNER_MANAGER'].includes(r)
  );
}

// ── POST /msp-link — Link consultant to client organisation ────────

router.post('/msp-link', async (req: Request, res: Response) => {
  try {
    if (!isMspUser((req as AuthRequest).user as Record<string, unknown>)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'MSP consultant role required' },
      });
    }

    const parsed = linkSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const { clientOrganisationId, clientOrganisationName, permissions, whiteLabel } = parsed.data;
    const userId = (req as AuthRequest).user!.id;

    // Check for duplicate active link
    const existing = await prisma.mspLink.findFirst({
      where: {
        consultantUserId: userId,
        clientOrganisationId,
        status: { not: 'REVOKED' as const },
      },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Active link already exists for this client organisation',
        },
      });
    }

    const link = await prisma.mspLink.create({
      data: {
        id: crypto.randomUUID(),
        consultantUserId: userId,
        consultantEmail: (req as AuthRequest).user!.email || '',
        clientOrganisationId,
        clientOrganisationName,
        status: 'ACTIVE',
        permissions,
        ...(whiteLabel !== undefined ? { whiteLabel } : {}),
        linkedBy: userId,
      },
    });

    // Persist audit entry (fire-and-forget)
    void (async () => {
      try {
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'MSP_LINK_CREATED',
            entity: 'msp_link',
            entityId: link.id,
            changes: link as unknown as never,
          },
        });
      } catch (e: unknown) {
        logger.warn('Audit log write failed', { error: (e as Error).message });
      }
    })();

    logger.info('MSP link created', {
      linkId: link.id,
      consultant: userId,
      client: clientOrganisationId,
    });

    res.status(201).json({ success: true, data: link });
  } catch (error: unknown) {
    logger.error('Failed to create MSP link', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create MSP link' },
    });
  }
});

// ── GET /msp-clients — List consultant's client portfolio ──────────

router.get('/msp-clients', async (req: Request, res: Response) => {
  try {
    if (!isMspUser((req as AuthRequest).user as Record<string, unknown>)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'MSP consultant role required' },
      });
    }

    const userId = (req as AuthRequest).user!.id;
    const { status, page = '1', limit = '20' } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    const where = {
      consultantUserId: userId,
      ...(status ? { status: status as 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED' } : {}),
    };

    const [items, total, statusCounts] = await Promise.all([
      prisma.mspLink.findMany({
        where,
        orderBy: { linkedAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.mspLink.count({ where }),
      prisma.mspLink.groupBy({
        by: ['status'],
        where: { consultantUserId: userId },
        _count: true,
      }),
    ]);

    const countByStatus = (s: string) =>
      statusCounts.find((c) => c.status === s)?._count ?? 0;

    res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        summary: {
          active: countByStatus('ACTIVE'),
          suspended: countByStatus('SUSPENDED'),
          pending: countByStatus('PENDING'),
          total: statusCounts.reduce((sum, c) => sum + c._count, 0),
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list MSP clients', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list MSP clients' },
    });
  }
});

// ── GET /msp-dashboard — Consultant compliance health dashboard ────

router.get('/msp-dashboard', async (req: Request, res: Response) => {
  try {
    if (!isMspUser((req as AuthRequest).user as Record<string, unknown>)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'MSP consultant role required' },
      });
    }

    const userId = (req as AuthRequest).user!.id;
    const activeClients = await prisma.mspLink.findMany({
      where: { consultantUserId: userId, status: 'ACTIVE' },
    });

    // Generate compliance health summary per client (stub — real queries per client TBD)
    const clientHealth = activeClients.map((client) => ({
      clientId: client.clientOrganisationId,
      clientName: client.clientOrganisationName,
      linkedSince: client.linkedAt,
      lastAccessed: client.lastAccessedAt,
      complianceHealth: {
        overallScore: deterministicScore(client.clientOrganisationId, 'score'),
        isoStandards: [
          {
            standard: 'ISO 9001',
            status: 'CERTIFIED',
            nextAudit: '2026-06-15',
            daysUntilAudit: 122,
          },
          {
            standard: 'ISO 14001',
            status: 'CERTIFIED',
            nextAudit: '2026-09-20',
            daysUntilAudit: 219,
          },
        ],
        openActions: deterministicScore(client.clientOrganisationId, 'actions') % 10,
        overdueCapa: deterministicScore(client.clientOrganisationId, 'capa') % 3,
        upcomingAudits: (deterministicScore(client.clientOrganisationId, 'audits') % 2) + 1,
        expiringCertifications: 0,
      },
      alerts: [] as { type: string; message: string; severity: string }[],
    }));

    clientHealth.forEach((client) => {
      if (client.complianceHealth.overdueCapa > 0) {
        client.alerts.push({
          type: 'OVERDUE_CAPA',
          message: `${client.complianceHealth.overdueCapa} overdue CAPA actions`,
          severity: 'HIGH',
        });
      }
      if (client.complianceHealth.overallScore < 80) {
        client.alerts.push({
          type: 'LOW_COMPLIANCE',
          message: `Compliance score below 80%`,
          severity: 'MEDIUM',
        });
      }
    });

    const dashboard = {
      consultant: {
        userId,
        email: (req as AuthRequest).user!.email,
        totalClients: activeClients.length,
      },
      summary: {
        totalActiveClients: activeClients.length,
        clientsNeedingAttention: clientHealth.filter((c) => c.alerts.length > 0).length,
        totalOpenActions: clientHealth.reduce((sum, c) => sum + c.complianceHealth.openActions, 0),
        totalOverdueCapa: clientHealth.reduce((sum, c) => sum + c.complianceHealth.overdueCapa, 0),
        upcomingAuditsThisMonth: clientHealth.reduce(
          (sum, c) => sum + c.complianceHealth.upcomingAudits,
          0
        ),
        averageComplianceScore:
          clientHealth.length > 0
            ? Math.round(
                clientHealth.reduce((sum, c) => sum + c.complianceHealth.overallScore, 0) /
                  clientHealth.length
              )
            : 0,
      },
      clients: clientHealth,
      generatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: dashboard });
  } catch (error: unknown) {
    logger.error('Failed to generate MSP dashboard', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate MSP dashboard' },
    });
  }
});

// ── PUT /msp-link/:id — Update MSP link ────────────────────────────

router.put('/msp-link/:id', async (req: Request, res: Response) => {
  try {
    if (!isMspUser((req as AuthRequest).user as Record<string, unknown>)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'MSP consultant role required' },
      });
    }

    const link = await prisma.mspLink.findUnique({ where: { id: req.params.id } });
    if (!link) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'MSP link not found' },
      });
    }

    if (link.consultantUserId !== (req as AuthRequest).user!.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You can only modify your own MSP links' },
      });
    }

    const parsed = updateLinkSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const { status, permissions, whiteLabel } = parsed.data;

    const updated = await prisma.mspLink.update({
      where: { id: req.params.id },
      data: {
        ...(status ? { status } : {}),
        ...(permissions ? { permissions } : {}),
        ...(whiteLabel
          ? { whiteLabel: { ...(link.whiteLabel as object | null ?? {}), ...whiteLabel } }
          : {}),
      },
    });

    void (async () => {
      try {
        await prisma.auditLog.create({
          data: {
            userId: (req as AuthRequest).user!.id,
            action: 'MSP_LINK_UPDATED',
            entity: 'msp_link',
            entityId: req.params.id,
            changes: { status, permissions, whiteLabel } as unknown as never,
          },
        });
      } catch (e: unknown) {
        logger.warn('Audit log write failed', { error: (e as Error).message });
      }
    })();

    logger.info('MSP link updated', { linkId: req.params.id, status, consultant: (req as AuthRequest).user!.id });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to update MSP link', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update MSP link' },
    });
  }
});

// ── DELETE /msp-link/:id — Revoke MSP link ─────────────────────────

router.delete('/msp-link/:id', async (req: Request, res: Response) => {
  try {
    if (!isMspUser((req as AuthRequest).user as Record<string, unknown>)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'MSP consultant role required' },
      });
    }

    const link = await prisma.mspLink.findUnique({ where: { id: req.params.id } });
    if (!link) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'MSP link not found' },
      });
    }

    if (link.consultantUserId !== (req as AuthRequest).user!.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You can only revoke your own MSP links' },
      });
    }

    await prisma.mspLink.update({
      where: { id: req.params.id },
      data: { status: 'REVOKED' },
    });

    void (async () => {
      try {
        await prisma.auditLog.create({
          data: {
            userId: (req as AuthRequest).user!.id,
            action: 'MSP_LINK_REVOKED',
            entity: 'msp_link',
            entityId: req.params.id,
          },
        });
      } catch (e: unknown) {
        logger.warn('Audit log write failed', { error: (e as Error).message });
      }
    })();

    logger.info('MSP link revoked', { linkId: req.params.id, consultant: (req as AuthRequest).user!.id });

    res.json({ success: true, data: { message: 'MSP link revoked', linkId: req.params.id } });
  } catch (error: unknown) {
    logger.error('Failed to revoke MSP link', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to revoke MSP link' },
    });
  }
});

// ── GET /msp-link/:id/audit-log — MSP access audit trail ──────────

router.get('/msp-link/:id/audit-log', async (req: Request, res: Response) => {
  try {
    if (!isMspUser((req as AuthRequest).user as Record<string, unknown>)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'MSP consultant role required' },
      });
    }

    const link = await prisma.mspLink.findUnique({ where: { id: req.params.id } });
    if (!link) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'MSP link not found' },
      });
    }

    if (link.consultantUserId !== (req as AuthRequest).user!.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    const logs = await prisma.auditLog.findMany({
      where: { entity: 'msp_link', entityId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const entries = logs.map((log) => ({
      timestamp: log.createdAt.toISOString(),
      action: log.action,
      user: log.userId,
      details: log.action.replace(/_/g, ' ').toLowerCase(),
    }));

    res.json({
      success: true,
      data: {
        linkId: req.params.id,
        clientName: link.clientOrganisationName,
        entries,
        total: entries.length,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get MSP audit log', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get MSP audit log' },
    });
  }
});

export default router;
