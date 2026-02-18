import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-analytics');
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
  return `ANL-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const widgetTypeEnum = z.enum(['CHART', 'TABLE', 'KPI', 'MAP', 'GAUGE', 'HEATMAP', 'FUNNEL', 'TIMELINE']);
const dataSourceEnum = z.enum(['HEALTH_SAFETY', 'ENVIRONMENT', 'QUALITY', 'HR', 'FINANCE', 'CRM', 'INVENTORY', 'CMMS', 'ALL']);

const dashboardCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  layout: z.record(z.any()).default({}),
  widgets: z.array(z.any()).default([]),
  isDefault: z.boolean().optional().default(false),
  isPublic: z.boolean().optional().default(false),
  tags: z.array(z.string()).optional().nullable(),
});

const dashboardUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  layout: z.record(z.any()).optional(),
  widgets: z.array(z.any()).optional(),
  isDefault: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional().nullable(),
});

const widgetCreateSchema = z.object({
  title: z.string().min(1).max(200),
  type: widgetTypeEnum,
  config: z.record(z.any()).default({}),
  dataSource: dataSourceEnum,
  query: z.record(z.any()).optional().nullable(),
  position: z.record(z.any()).default({ x: 0, y: 0, w: 4, h: 3 }),
  refreshInterval: z.number().int().min(0).optional().nullable(),
});

const widgetUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  type: widgetTypeEnum.optional(),
  config: z.record(z.any()).optional(),
  dataSource: dataSourceEnum.optional(),
  query: z.record(z.any()).optional().nullable(),
  position: z.record(z.any()).optional(),
  refreshInterval: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const RESERVED_PATHS = new Set(['default']);

// ===================================================================
// GET /api/dashboards/default — Get default dashboard
// ===================================================================

router.get('/default', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const dashboard = await prisma.analyticsDashboard.findFirst({
      where: {
        isDefault: true,
        ownerId: authReq.user!.id,
        deletedAt: null,
      } as any,
      include: { analyticsWidgets: { where: { deletedAt: null } as any } },
    });

    if (!dashboard) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No default dashboard found' } });
    }

    res.json({ success: true, data: dashboard });
  } catch (error: unknown) {
    logger.error('Failed to get default dashboard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get default dashboard' } });
  }
});

// ===================================================================
// GET /api/dashboards — List dashboards
// ===================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { owner, isPublic, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (owner === 'me') {
      where.ownerId = authReq.user!.id;
    } else if (typeof owner === 'string' && owner.length > 0) {
      where.ownerId = owner;
    }

    if (isPublic === 'true') where.isPublic = true;
    if (isPublic === 'false') where.isPublic = false;

    if (typeof search === 'string' && search.length > 0) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [dashboards, total] = await Promise.all([
      prisma.analyticsDashboard.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { analyticsWidgets: { where: { deletedAt: null } as any } },
      }),
      prisma.analyticsDashboard.count({ where }),
    ]);

    res.json({
      success: true,
      data: dashboards,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list dashboards', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list dashboards' } });
  }
});

// ===================================================================
// POST /api/dashboards — Create dashboard
// ===================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = dashboardCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const data = parsed.data;
    const dashboard = await prisma.analyticsDashboard.create({
      data: {
        name: data.name,
        description: data.description || null,
        layout: data.layout,
        widgets: data.widgets,
        isDefault: data.isDefault,
        isPublic: data.isPublic,
        ownerId: authReq.user!.id,
        tags: (data.tags || null) as any,
        createdBy: authReq.user!.id,
      },
    });

    logger.info('Dashboard created', { id: dashboard.id, name: dashboard.name });
    res.status(201).json({ success: true, data: dashboard });
  } catch (error: unknown) {
    logger.error('Failed to create dashboard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create dashboard' } });
  }
});

// ===================================================================
// POST /api/dashboards/:id/clone — Clone dashboard
// ===================================================================

router.post('/:id/clone', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    const original = await prisma.analyticsDashboard.findFirst({
      where: { id, deletedAt: null } as any,
      include: { analyticsWidgets: { where: { deletedAt: null } as any } },
    });

    if (!original) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dashboard not found' } });
    }

    const clone = await prisma.analyticsDashboard.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        layout: original.layout as any,
        widgets: original.widgets as any,
        isDefault: false,
        isPublic: false,
        ownerId: authReq.user!.id,
        tags: original.tags as any,
        createdBy: authReq.user!.id,
      },
    });

    // Clone widgets
    if (original.analyticsWidgets.length > 0) {
      await prisma.analyticsWidget.createMany({
        data: original.analyticsWidgets.map(widget => ({
          dashboardId: clone.id,
          title: widget.title,
          type: widget.type,
          config: widget.config as any,
          dataSource: widget.dataSource,
          query: widget.query as any,
          position: widget.position as any,
          refreshInterval: widget.refreshInterval,
          createdBy: authReq.user!.id,
        })),
      });
    }

    const result = await prisma.analyticsDashboard.findUnique({
      where: { id: clone.id },
      include: { analyticsWidgets: true },
    });

    logger.info('Dashboard cloned', { originalId: id, cloneId: clone.id });
    res.status(201).json({ success: true, data: result });
  } catch (error: unknown) {
    logger.error('Failed to clone dashboard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to clone dashboard' } });
  }
});

// ===================================================================
// POST /api/dashboards/:id/widgets — Add widget
// ===================================================================

router.post('/:id/widgets', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    const dashboard = await prisma.analyticsDashboard.findFirst({ where: { id, deletedAt: null } as any });
    if (!dashboard) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dashboard not found' } });
    }

    const parsed = widgetCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const data = parsed.data;
    const widget = await prisma.analyticsWidget.create({
      data: {
        dashboardId: id,
        title: data.title,
        type: data.type,
        config: data.config,
        dataSource: data.dataSource,
        query: (data.query || null) as any,
        position: data.position,
        refreshInterval: data.refreshInterval || null,
        createdBy: authReq.user!.id,
      },
    });

    logger.info('Widget created', { id: widget.id, dashboardId: id });
    res.status(201).json({ success: true, data: widget });
  } catch (error: unknown) {
    logger.error('Failed to create widget', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create widget' } });
  }
});

// ===================================================================
// PUT /api/dashboards/:id/widgets/:widgetId — Update widget
// ===================================================================

router.put('/:id/widgets/:widgetId', async (req: Request, res: Response) => {
  try {
    const { id, widgetId } = req.params;

    const widget = await prisma.analyticsWidget.findFirst({
      where: { id: widgetId, dashboardId: id, deletedAt: null } as any,
    });
    if (!widget) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Widget not found' } });
    }

    const parsed = widgetUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const updated = await prisma.analyticsWidget.update({
      where: { id: widgetId },
      data: parsed.data as any,
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to update widget', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update widget' } });
  }
});

// ===================================================================
// DELETE /api/dashboards/:id/widgets/:widgetId — Delete widget
// ===================================================================

router.delete('/:id/widgets/:widgetId', async (req: Request, res: Response) => {
  try {
    const { id, widgetId } = req.params;

    const widget = await prisma.analyticsWidget.findFirst({
      where: { id: widgetId, dashboardId: id, deletedAt: null } as any,
    });
    if (!widget) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Widget not found' } });
    }

    await prisma.analyticsWidget.update({
      where: { id: widgetId },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Widget deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete widget', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete widget' } });
  }
});

// ===================================================================
// GET /api/dashboards/:id — Get dashboard by ID
// ===================================================================

router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return;

    const dashboard = await prisma.analyticsDashboard.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { analyticsWidgets: { where: { deletedAt: null } as any } },
    });

    if (!dashboard) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dashboard not found' } });
    }

    res.json({ success: true, data: dashboard });
  } catch (error: unknown) {
    logger.error('Failed to get dashboard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get dashboard' } });
  }
});

// ===================================================================
// PUT /api/dashboards/:id — Update dashboard
// ===================================================================

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsDashboard.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dashboard not found' } });
    }

    const parsed = dashboardUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } });
    }

    const updated = await prisma.analyticsDashboard.update({
      where: { id },
      data: parsed.data as any,
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to update dashboard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update dashboard' } });
  }
});

// ===================================================================
// DELETE /api/dashboards/:id — Soft delete dashboard
// ===================================================================

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsDashboard.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Dashboard not found' } });
    }

    await prisma.analyticsDashboard.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Soft delete all widgets
    await prisma.analyticsWidget.updateMany({
      where: { dashboardId: id, deletedAt: null } as any,
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Dashboard deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete dashboard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete dashboard' } });
  }
});

export default router;
