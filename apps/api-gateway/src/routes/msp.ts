import { Router, Response } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { randomUUID } from 'crypto';

const logger = createLogger('api-gateway:msp');
const router = Router();

router.use(authenticate);

// ── In-memory MSP store (v1 — will be backed by Prisma in v2) ──────

interface MspLink {
  id: string;
  consultantUserId: string;
  consultantEmail: string;
  clientOrganisationId: string;
  clientOrganisationName: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  permissions: ('READ' | 'AUDIT' | 'MANAGE' | 'BILLING')[];
  whiteLabel: {
    brandName?: string;
    logoUrl?: string;
    primaryColor?: string;
  } | null;
  linkedAt: string;
  linkedBy: string;
  lastAccessedAt: string | null;
}

const mspLinks = new Map<string, MspLink>();

// ── Validation schemas ──────────────────────────────────────────────

const linkSchema = z.object({
  clientOrganisationId: z.string().uuid(),
  clientOrganisationName: z.string().min(1).max(200),
  permissions: z.array(z.enum(['READ', 'AUDIT', 'MANAGE', 'BILLING'])).min(1),
  whiteLabel: z.object({
    brandName: z.string().max(100).optional(),
    logoUrl: z.string().url().optional(),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  }).optional(),
});

const updateLinkSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'REVOKED']).optional(),
  permissions: z.array(z.enum(['READ', 'AUDIT', 'MANAGE', 'BILLING'])).min(1).optional(),
  whiteLabel: z.object({
    brandName: z.string().max(100).optional(),
    logoUrl: z.string().url().optional(),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  }).optional(),
});

// ── Helper: check if user has MSP/consultant role ───────────────────

function isMspUser(user: any): boolean {
  const roles = user.roles || user.role || [];
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.some((r: string) =>
    ['SUPER_ADMIN', 'ORG_ADMIN', 'MSP_CONSULTANT', 'PARTNER_MANAGER'].includes(r)
  );
}

// ── POST /msp-link — Link consultant to client organisation ────────

router.post('/msp-link', async (req: AuthRequest, res: Response) => {
  try {
    if (!isMspUser(req.user)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'MSP consultant role required' },
      });
    }

    const parsed = linkSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() },
      });
    }

    const { clientOrganisationId, clientOrganisationName, permissions, whiteLabel } = parsed.data;
    const userId = req.user!.id;

    // Check for duplicate link
    const existing = Array.from(mspLinks.values()).find(
      (link) =>
        link.consultantUserId === userId &&
        link.clientOrganisationId === clientOrganisationId &&
        link.status !== 'REVOKED'
    );
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: 'Active link already exists for this client organisation' },
      });
    }

    const id = randomUUID();
    const link: MspLink = {
      id,
      consultantUserId: userId,
      consultantEmail: req.user!.email || '',
      clientOrganisationId,
      clientOrganisationName,
      status: 'ACTIVE',
      permissions,
      whiteLabel: whiteLabel || null,
      linkedAt: new Date().toISOString(),
      linkedBy: userId,
      lastAccessedAt: null,
    };

    mspLinks.set(id, link);

    logger.info('MSP link created', { linkId: id, consultant: userId, client: clientOrganisationId });

    res.status(201).json({ success: true, data: link });
  } catch (error: unknown) {
    logger.error('Failed to create MSP link', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create MSP link' },
    });
  }
});

// ── GET /msp-clients — List consultant's client portfolio ──────────

router.get('/msp-clients', async (req: AuthRequest, res: Response) => {
  try {
    if (!isMspUser(req.user)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'MSP consultant role required' },
      });
    }

    const userId = req.user!.id;
    const { status, page = '1', limit = '20' } = req.query;

    let clients = Array.from(mspLinks.values())
      .filter((link) => link.consultantUserId === userId);

    if (status) {
      clients = clients.filter((link) => link.status === status);
    }

    clients.sort((a, b) => new Date(b.linkedAt).getTime() - new Date(a.linkedAt).getTime());

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const start = (pageNum - 1) * limitNum;

    res.json({
      success: true,
      data: {
        items: clients.slice(start, start + limitNum),
        total: clients.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(clients.length / limitNum),
        summary: {
          active: clients.filter((c) => c.status === 'ACTIVE').length,
          suspended: clients.filter((c) => c.status === 'SUSPENDED').length,
          pending: clients.filter((c) => c.status === 'PENDING').length,
          total: clients.length,
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list MSP clients', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list MSP clients' },
    });
  }
});

// ── GET /msp-dashboard — Consultant compliance health dashboard ────

router.get('/msp-dashboard', async (req: AuthRequest, res: Response) => {
  try {
    if (!isMspUser(req.user)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'MSP consultant role required' },
      });
    }

    const userId = req.user!.id;
    const activeClients = Array.from(mspLinks.values())
      .filter((link) => link.consultantUserId === userId && link.status === 'ACTIVE');

    // Generate compliance health summary per client
    // In production this would query each client's actual compliance data
    const clientHealth = activeClients.map((client) => ({
      clientId: client.clientOrganisationId,
      clientName: client.clientOrganisationName,
      linkedSince: client.linkedAt,
      lastAccessed: client.lastAccessedAt,
      complianceHealth: {
        overallScore: Math.floor(Math.random() * 30) + 70, // 70-100 placeholder
        isoStandards: [
          { standard: 'ISO 9001', status: 'CERTIFIED', nextAudit: '2026-06-15', daysUntilAudit: 122 },
          { standard: 'ISO 14001', status: 'CERTIFIED', nextAudit: '2026-09-20', daysUntilAudit: 219 },
        ],
        openActions: Math.floor(Math.random() * 10),
        overdueCapa: Math.floor(Math.random() * 3),
        upcomingAudits: Math.floor(Math.random() * 2) + 1,
        expiringCertifications: 0,
      },
      alerts: [] as { type: string; message: string; severity: string }[],
    }));

    // Add alerts for clients needing attention
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
        email: req.user!.email,
        totalClients: activeClients.length,
      },
      summary: {
        totalActiveClients: activeClients.length,
        clientsNeedingAttention: clientHealth.filter((c) => c.alerts.length > 0).length,
        totalOpenActions: clientHealth.reduce((sum, c) => sum + c.complianceHealth.openActions, 0),
        totalOverdueCapa: clientHealth.reduce((sum, c) => sum + c.complianceHealth.overdueCapa, 0),
        upcomingAuditsThisMonth: clientHealth.reduce((sum, c) => sum + c.complianceHealth.upcomingAudits, 0),
        averageComplianceScore: clientHealth.length > 0
          ? Math.round(clientHealth.reduce((sum, c) => sum + c.complianceHealth.overallScore, 0) / clientHealth.length)
          : 0,
      },
      clients: clientHealth,
      generatedAt: new Date().toISOString(),
    };

    res.json({ success: true, data: dashboard });
  } catch (error: unknown) {
    logger.error('Failed to generate MSP dashboard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate MSP dashboard' },
    });
  }
});

// ── PUT /msp-link/:id — Update MSP link ────────────────────────────

router.put('/msp-link/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!isMspUser(req.user)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'MSP consultant role required' },
      });
    }

    const link = mspLinks.get(req.params.id);
    if (!link) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'MSP link not found' },
      });
    }

    if (link.consultantUserId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You can only modify your own MSP links' },
      });
    }

    const parsed = updateLinkSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() },
      });
    }

    const { status, permissions, whiteLabel } = parsed.data;

    if (status) link.status = status;
    if (permissions) link.permissions = permissions;
    if (whiteLabel) link.whiteLabel = { ...link.whiteLabel, ...whiteLabel };

    mspLinks.set(req.params.id, link);

    logger.info('MSP link updated', { linkId: req.params.id, status, consultant: req.user!.id });

    res.json({ success: true, data: link });
  } catch (error: unknown) {
    logger.error('Failed to update MSP link', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update MSP link' },
    });
  }
});

// ── DELETE /msp-link/:id — Revoke MSP link ─────────────────────────

router.delete('/msp-link/:id', async (req: AuthRequest, res: Response) => {
  try {
    if (!isMspUser(req.user)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'MSP consultant role required' },
      });
    }

    const link = mspLinks.get(req.params.id);
    if (!link) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'MSP link not found' },
      });
    }

    if (link.consultantUserId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You can only revoke your own MSP links' },
      });
    }

    link.status = 'REVOKED';
    mspLinks.set(req.params.id, link);

    logger.info('MSP link revoked', { linkId: req.params.id, consultant: req.user!.id });

    res.json({ success: true, data: { message: 'MSP link revoked', linkId: req.params.id } });
  } catch (error: unknown) {
    logger.error('Failed to revoke MSP link', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to revoke MSP link' },
    });
  }
});

// ── GET /msp-link/:id/audit-log — MSP access audit trail ──────────

router.get('/msp-link/:id/audit-log', async (req: AuthRequest, res: Response) => {
  try {
    if (!isMspUser(req.user)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'MSP consultant role required' },
      });
    }

    const link = mspLinks.get(req.params.id);
    if (!link) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'MSP link not found' },
      });
    }

    if (link.consultantUserId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    // Placeholder audit log — in production, this queries the audit trail table
    res.json({
      success: true,
      data: {
        linkId: req.params.id,
        clientName: link.clientOrganisationName,
        entries: [
          { timestamp: link.linkedAt, action: 'LINK_CREATED', user: link.consultantEmail, details: 'MSP link established' },
        ],
        total: 1,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get MSP audit log', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get MSP audit log' },
    });
  }
});

export default router;
