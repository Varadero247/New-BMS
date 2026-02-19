import { Router, Response } from 'express';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import {
  getAllFlags,
  getAllOrgOverrides,
  createFlag,
  updateFlag,
  deleteFlag,
  setOrgOverride,
  removeOrgOverride,
  seedInitialFlags,
  isEnabled,
  getAll,
  type FeatureFlag,
} from '@ims/feature-flags';

const logger = createLogger('api-gateway:feature-flags');
const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Validation Schemas ──────────────────────────────────────────────────────

const createFlagSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .regex(/^[a-z0-9_]+$/, 'Name must be lowercase alphanumeric with underscores only'),
  description: z.string().trim().min(1, 'Description is required').max(500),
  enabled: z.boolean().optional().default(false),
});

const updateFlagSchema = z.object({
  enabled: z.boolean().optional(),
  description: z.string().trim().max(500).optional(),
});

const orgOverrideSchema = z.object({
  enabled: z.boolean(),
});

// ─── Seed initial flags on startup ───────────────────────────────────────────

try {
  const seeded = seedInitialFlags();
  if (seeded.length > 0) {
    logger.info('Seeded initial feature flags', {
      count: seeded.length,
      flags: seeded.map((f) => f.name),
    });
  }
} catch (error: unknown) {
  logger.error('Failed to seed feature flags', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
}

// ============================================
// Admin Routes (require ADMIN role)
// ============================================

// GET /api/admin/feature-flags — List all flags with org overrides
router.get('/admin/feature-flags', requireRole('ADMIN'), (_req: AuthRequest, res: Response) => {
  try {
    const flags = getAllFlags();
    const overrides = getAllOrgOverrides();

    const data = flags.map((flag: FeatureFlag) => ({
      ...flag,
      orgOverrides: overrides.filter((o) => o.flagName === flag.name),
      orgOverrideCount: overrides.filter((o) => o.flagName === flag.name).length,
    }));

    res.json({
      success: true,
      data,
      meta: { total: flags.length },
    });
  } catch (error: unknown) {
    logger.error('Failed to list feature flags', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list feature flags' },
    });
  }
});

// POST /api/admin/feature-flags — Create a new flag
router.post('/admin/feature-flags', requireRole('ADMIN'), (req: AuthRequest, res: Response) => {
  try {
    const parsed = createFlagSchema.safeParse(req.body);
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

    const { name, description, enabled } = parsed.data;
    const flag = createFlag(name, description, enabled);

    if (!flag) {
      return res.status(409).json({
        success: false,
        error: { code: 'CONFLICT', message: `Feature flag '${name}' already exists` },
      });
    }

    logger.info('Feature flag created', { name, createdBy: req.user!.id });

    res.status(201).json({ success: true, data: flag });
  } catch (error: unknown) {
    logger.error('Failed to create feature flag', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create feature flag' },
    });
  }
});

// PUT /api/admin/feature-flags/:name — Update a flag
router.put(
  '/admin/feature-flags/:name',
  requireRole('ADMIN'),
  (req: AuthRequest, res: Response) => {
    try {
      const parsed = updateFlagSchema.safeParse(req.body);
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

      const flag = updateFlag(req.params.name, parsed.data);
      if (!flag) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Feature flag '${req.params.name}' not found` },
        });
      }

      logger.info('Feature flag updated', {
        name: req.params.name,
        updates: parsed.data,
        updatedBy: req.user!.id,
      });

      res.json({ success: true, data: flag });
    } catch (error: unknown) {
      logger.error('Failed to update feature flag', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update feature flag' },
      });
    }
  }
);

// DELETE /api/admin/feature-flags/:name — Delete a flag
router.delete(
  '/admin/feature-flags/:name',
  requireRole('ADMIN'),
  (req: AuthRequest, res: Response) => {
    try {
      const deleted = deleteFlag(req.params.name);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Feature flag '${req.params.name}' not found` },
        });
      }

      logger.info('Feature flag deleted', { name: req.params.name, deletedBy: req.user!.id });

      res.json({ success: true, data: { deleted: true } });
    } catch (error: unknown) {
      logger.error('Failed to delete feature flag', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete feature flag' },
      });
    }
  }
);

// PUT /api/admin/feature-flags/:name/orgs/:orgId — Set org override
router.put(
  '/admin/feature-flags/:name/orgs/:orgId',
  requireRole('ADMIN'),
  (req: AuthRequest, res: Response) => {
    try {
      const parsed = orgOverrideSchema.safeParse(req.body);
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

      const override = setOrgOverride(req.params.name, req.params.orgId, parsed.data.enabled);
      if (!override) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Feature flag '${req.params.name}' not found` },
        });
      }

      logger.info('Org feature flag override set', {
        flagName: req.params.name,
        orgId: req.params.orgId,
        enabled: parsed.data.enabled,
        setBy: req.user!.id,
      });

      res.json({ success: true, data: override });
    } catch (error: unknown) {
      logger.error('Failed to set org override', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to set org override' },
      });
    }
  }
);

// DELETE /api/admin/feature-flags/:name/orgs/:orgId — Remove org override
router.delete(
  '/admin/feature-flags/:name/orgs/:orgId',
  requireRole('ADMIN'),
  (req: AuthRequest, res: Response) => {
    try {
      const removed = removeOrgOverride(req.params.name, req.params.orgId);
      if (!removed) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Org override not found' },
        });
      }

      logger.info('Org feature flag override removed', {
        flagName: req.params.name,
        orgId: req.params.orgId,
        removedBy: req.user!.id,
      });

      res.json({ success: true, data: { deleted: true } });
    } catch (error: unknown) {
      logger.error('Failed to remove org override', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to remove org override' },
      });
    }
  }
);

// ============================================
// Public Routes (JWT required, any authenticated user)
// ============================================

// GET /api/feature-flags/check — Check single flag (?name=xxx)
router.get('/feature-flags/check', async (req: AuthRequest, res: Response) => {
  try {
    const nameSchema = z.object({
      name: z.string().trim().min(1, 'Flag name is required'),
    });

    const parsed = nameSchema.safeParse(req.query);
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

    const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || undefined;
    const enabled = await isEnabled(parsed.data.name, orgId);

    res.json({
      success: true,
      data: { name: parsed.data.name, enabled },
    });
  } catch (error: unknown) {
    logger.error('Failed to check feature flag', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to check feature flag' },
    });
  }
});

// GET /api/feature-flags — Get all flags for current org
router.get('/feature-flags', async (req: AuthRequest, res: Response) => {
  try {
    const orgId = (req as AuthRequest & { user?: { orgId?: string } }).user?.orgId || undefined;
    const flags = await getAll(orgId);

    res.json({ success: true, data: flags });
  } catch (error: unknown) {
    logger.error('Failed to get feature flags', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get feature flags' },
    });
  }
});

export default router;
