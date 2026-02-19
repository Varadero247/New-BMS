import { Router, Response } from 'express';
import { prisma } from '@ims/database';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import crypto from 'crypto';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
const logger = createLogger('api-gateway');

const router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const pluginCategoryEnum = z.enum([
  'INTEGRATION',
  'REPORTING',
  'AUTOMATION',
  'COMPLIANCE',
  'ANALYTICS',
  'COMMUNICATION',
  'DOCUMENT_MANAGEMENT',
  'FIELD_SERVICE',
  'SAFETY',
  'QUALITY',
  'OTHER',
]);

const registerPluginSchema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().trim().min(1).max(5000),
  author: z.string().trim().min(1).max(200),
  authorEmail: z.string().trim().email().optional(),
  category: pluginCategoryEnum,
  iconUrl: z.string().trim().url().optional(),
  repositoryUrl: z.string().trim().url().optional(),
  documentationUrl: z.string().trim().url().optional(),
  permissions: z.array(z.string().trim()).optional().default([]),
  webhookEvents: z.array(z.string().trim()).optional().default([]),
  configSchema: z.record(z.unknown()).optional(),
  isPublic: z.boolean().optional().default(false),
});

const updatePluginSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(5000).optional(),
  author: z.string().trim().min(1).max(200).optional(),
  authorEmail: z.string().trim().email().optional().nullable(),
  category: pluginCategoryEnum.optional(),
  iconUrl: z.string().trim().url().optional().nullable(),
  repositoryUrl: z.string().trim().url().optional().nullable(),
  documentationUrl: z.string().trim().url().optional().nullable(),
  permissions: z.array(z.string().trim()).optional(),
  webhookEvents: z.array(z.string().trim()).optional(),
  configSchema: z.record(z.unknown()).optional().nullable(),
  isPublic: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'SUSPENDED', 'DEPRECATED']).optional(),
});

const publishVersionSchema = z.object({
  version: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .regex(/^\d+\.\d+\.\d+/, 'Version must follow semver (e.g. 1.0.0)'),
  changelog: z.string().trim().max(10000).optional(),
  manifest: z.record(z.unknown()),
  entryPoint: z.string().trim().optional(),
  minPlatformVersion: z.string().trim().optional(),
});

const installSchema = z.object({
  config: z.record(z.unknown()).optional(),
});

const webhookSchema = z.object({
  event: z.string().trim().min(1).max(100),
  targetUrl: z.string().trim().url(),
});

// ---------------------------------------------------------------------------
// GET /api/marketplace/plugins — List plugins (public + org-owned)
// ---------------------------------------------------------------------------
router.get('/plugins', async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const take = Math.min(Math.max(1, parseInt(limit, 10) || 20), 100);

    const where: Record<string, unknown> = {
      deletedAt: null,
      OR: [{ isPublic: true, status: 'PUBLISHED' }, { orgId: (req.user as { organisationId?: string; orgId?: string })?.organisationId }],
    };
    if (category) (where as any).category = category;
    if (search) (where as any).name = { contains: search, mode: 'insensitive' };

    const [plugins, total] = await Promise.all([
      (prisma as any).mktPlugin.findMany({
        where,
        skip,
        take,
        orderBy: { downloads: 'desc' },
        include: { versions: { where: { isLatest: true }, take: 1 } },
      }),
      (prisma as any).mktPlugin.count({ where }),
    ]);

    res.json({
      success: true,
      data: plugins,
      meta: { total, page: Math.max(1, parseInt(page, 10) || 1), limit: take },
    });
  } catch (error) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list plugins' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/marketplace/plugins/search — Search plugins
// ---------------------------------------------------------------------------
router.get('/plugins/search', async (req: AuthRequest, res: Response) => {
  try {
    const { q, category } = req.query as Record<string, string>;
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Search query must be at least 2 characters',
        },
      });
    }

    const where: Record<string, unknown> = {
      deletedAt: null,
      status: 'PUBLISHED',
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { author: { contains: q, mode: 'insensitive' } },
      ],
    };
    if (category) (where as any).category = category;

    const plugins = await (prisma as any).mktPlugin.findMany({
      where,
      take: 50,
      orderBy: { downloads: 'desc' },
    });
    res.json({ success: true, data: plugins });
  } catch (error) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Search failed' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/marketplace/plugins/:id — Get plugin details
// ---------------------------------------------------------------------------
router.get('/plugins/:id', async (req: AuthRequest, res: Response) => {
  try {
    const plugin = await (prisma as any).mktPlugin.findUnique({
      where: { id: req.params.id },
      include: {
        versions: { orderBy: { publishedAt: 'desc' }, take: 10 },
        installs: { where: { orgId: (req.user as { organisationId?: string; orgId?: string })?.organisationId } },
      },
    });

    if (!plugin || plugin.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Plugin not found' } });
    }

    res.json({ success: true, data: { ...plugin, isInstalled: plugin.installs.length > 0 } });
  } catch (error) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get plugin' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/marketplace/plugins — Register a new plugin
// ---------------------------------------------------------------------------
router.post(
  '/plugins',
  requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = registerPluginSchema.parse(req.body);

      const existing = await (prisma as any).mktPlugin.findUnique({ where: { slug: data.slug } });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: { code: 'CONFLICT', message: 'Plugin slug already exists' },
        });
      }

      const plugin = await (prisma as any).mktPlugin.create({
        data: { ...data, orgId: (req.user as { organisationId?: string; orgId?: string })?.organisationId },
      });

      res.status(201).json({ success: true, data: plugin });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            fields: error.errors.map((e: any) => e.path.join('.')),
          },
        });
      }
      logger.error('Request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to register plugin' },
      });
    }
  }
);

// ---------------------------------------------------------------------------
// PATCH /api/marketplace/plugins/:id — Update a plugin
// ---------------------------------------------------------------------------
router.patch(
  '/plugins/:id',
  requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await (prisma as any).mktPlugin.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.deletedAt) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Plugin not found' } });
      }
      const data = updatePluginSchema.parse(req.body);
      const plugin = await (prisma as any).mktPlugin.update({
        where: { id: req.params.id },
        data: { ...data, updatedAt: new Date() },
      });
      res.json({ success: true, data: plugin });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            fields: error.errors.map((e: any) => e.path.join('.')),
          },
        });
      }
      logger.error('Request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update plugin' },
      });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/marketplace/plugins/:id/versions — Publish a new version
// ---------------------------------------------------------------------------
router.post(
  '/plugins/:id/versions',
  requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = publishVersionSchema.parse(req.body);

      // Mark all previous versions as not latest
      await (prisma as any).mktPluginVersion.updateMany({
        where: { pluginId: req.params.id, isLatest: true },
        data: { isLatest: false },
      });

      const version = await (prisma as any).mktPluginVersion.create({
        data: { ...data, pluginId: req.params.id, isLatest: true },
      });

      res.status(201).json({ success: true, data: version });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            fields: error.errors.map((e: any) => e.path.join('.')),
          },
        });
      }
      logger.error('Request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to publish version' },
      });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/marketplace/plugins/:id/versions — List versions
// ---------------------------------------------------------------------------
router.get('/plugins/:id/versions', async (req: AuthRequest, res: Response) => {
  try {
    const versions = await (prisma as any).mktPluginVersion.findMany({
      where: { pluginId: req.params.id },
      orderBy: { publishedAt: 'desc' },
      take: 1000,
    });
    res.json({ success: true, data: versions });
  } catch (error) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list versions' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/marketplace/plugins/:id/install — Install plugin for org
// ---------------------------------------------------------------------------
router.post(
  '/plugins/:id/install',
  requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const parsedInstall = installSchema.safeParse(req.body);
      if (!parsedInstall.success) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsedInstall.error.errors[0].message },
        });
      }
      const data = parsedInstall.data;
      const orgId = (req.user as { organisationId?: string; orgId?: string })?.organisationId;

      const plugin = await (prisma as any).mktPlugin.findUnique({ where: { id: req.params.id } });
      if (!plugin || plugin.deletedAt) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Plugin not found' } });
      }

      const install = await (prisma as any).mktPluginInstall.upsert({
        where: { pluginId_orgId: { pluginId: req.params.id, orgId } },
        create: { pluginId: req.params.id, orgId, installedBy: req.user?.id, config: data.config },
        update: { status: 'ACTIVE', config: data.config, uninstalledAt: null },
      });

      // Increment download count
      await (prisma as any).mktPlugin.update({
        where: { id: req.params.id },
        data: { downloads: { increment: 1 } },
      });

      res.status(201).json({ success: true, data: install });
    } catch (error) {
      logger.error('Request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to install plugin' },
      });
    }
  }
);

// ---------------------------------------------------------------------------
// DELETE /api/marketplace/plugins/:id/install — Uninstall plugin
// ---------------------------------------------------------------------------
router.delete(
  '/plugins/:id/install',
  requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const orgId = (req.user as { organisationId?: string; orgId?: string })?.organisationId;
      await (prisma as any).mktPluginInstall.update({
        where: { pluginId_orgId: { pluginId: req.params.id, orgId } },
        data: { status: 'UNINSTALLED', uninstalledAt: new Date() },
      });
      res.json({ success: true, data: { message: 'Plugin uninstalled' } });
    } catch (error) {
      logger.error('Request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to uninstall plugin' },
      });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/marketplace/plugins/:id/webhooks — Register webhook subscription
// ---------------------------------------------------------------------------
router.post(
  '/plugins/:id/webhooks',
  requireRole('ADMIN', 'SUPER_ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = webhookSchema.parse(req.body);
      const orgId = (req.user as { organisationId?: string; orgId?: string })?.organisationId;
      const secret = 'whsec_' + crypto.randomBytes(32).toString('hex');

      const subscription = await (prisma as any).mktWebhookSubscription.create({
        data: {
          pluginId: req.params.id,
          orgId,
          event: data.event,
          targetUrl: data.targetUrl,
          secret,
        },
      });

      res.status(201).json({ success: true, data: { ...subscription, secret } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            fields: error.errors.map((e: any) => e.path.join('.')),
          },
        });
      }
      logger.error('Request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to register webhook' },
      });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/marketplace/stats — Marketplace statistics
// ---------------------------------------------------------------------------
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const [totalPlugins, publishedPlugins, totalInstalls, totalDownloads] = await Promise.all([
      (prisma as any).mktPlugin.count({ where: { deletedAt: null } }),
      (prisma as any).mktPlugin.count({ where: { deletedAt: null, status: 'PUBLISHED' } }),
      (prisma as any).mktPluginInstall.count({ where: { status: 'ACTIVE' } }),
      (prisma as any).mktPlugin.aggregate({
        _sum: { downloads: true },
        where: { deletedAt: null },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalPlugins,
        publishedPlugins,
        totalInstalls,
        totalDownloads: totalDownloads._sum.downloads || 0,
      },
    });
  } catch (error) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get stats' } });
  }
});

export default router;
