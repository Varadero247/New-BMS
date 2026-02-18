import { Router, Response } from 'express';
import { prisma } from '@ims/database';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { renderTemplateToHtml } from '@ims/templates';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
const logger = createLogger('api-gateway');

const router = Router();

// All template routes require authentication
router.use(authenticate);

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  module: z.enum([
    'HEALTH_SAFETY', 'ENVIRONMENT', 'QUALITY', 'AUTOMOTIVE', 'MEDICAL',
    'AEROSPACE', 'HR', 'PAYROLL', 'WORKFLOWS', 'PROJECT_MANAGEMENT', 'INVENTORY',
    'CRM', 'FINANCE', 'INFOSEC', 'ISO37001', 'ISO42001',
    'ESG', 'CMMS', 'FOOD_SAFETY', 'ENERGY', 'FIELD_SERVICE', 'ANALYTICS',
  ]),
  category: z.enum([
    'RISK_ASSESSMENT', 'INCIDENT_INVESTIGATION', 'AUDIT', 'MANAGEMENT_REVIEW',
    'CAPA', 'COMPLIANCE', 'INSPECTION', 'TRAINING', 'DESIGN_DEVELOPMENT',
    'PROCESS_CONTROL', 'SUPPLIER', 'CUSTOMER', 'REGULATORY', 'PLANNING',
    'REPORTING', 'GENERAL', 'CERTIFICATION',
  ]),
  tags: z.array(z.string()).optional().default([]),
  fields: z.array(z.any()).min(1, 'At least one field is required'),
  defaultContent: z.record(z.any()).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED']).optional().default('ACTIVE'),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  category: z.enum([
    'RISK_ASSESSMENT', 'INCIDENT_INVESTIGATION', 'AUDIT', 'MANAGEMENT_REVIEW',
    'CAPA', 'COMPLIANCE', 'INSPECTION', 'TRAINING', 'DESIGN_DEVELOPMENT',
    'PROCESS_CONTROL', 'SUPPLIER', 'CUSTOMER', 'REGULATORY', 'PLANNING',
    'REPORTING', 'GENERAL', 'CERTIFICATION',
  ]).optional(),
  tags: z.array(z.string()).optional(),
  fields: z.array(z.any()).optional(),
  defaultContent: z.record(z.any()).optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED']).optional(),
  changeNote: z.string().max(500).optional(),
});

const useTemplateSchema = z.object({
  filledData: z.record(z.any()),
  referenceId: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Helper: generate next template code
// ---------------------------------------------------------------------------

const MODULE_PREFIX: Record<string, string> = {
  HEALTH_SAFETY: 'HS',
  ENVIRONMENT: 'ENV',
  QUALITY: 'QMS',
  AUTOMOTIVE: 'AUTO',
  MEDICAL: 'MED',
  AEROSPACE: 'AERO',
  HR: 'HR',
  PAYROLL: 'PAY',
  WORKFLOWS: 'WF',
  PROJECT_MANAGEMENT: 'PM',
  INVENTORY: 'INV',
};

async function generateCode(module: string): Promise<string> {
  const prefix = MODULE_PREFIX[module] || module.substring(0, 3);
  const lastTemplate = await (prisma as any).template.findFirst({
    where: { code: { startsWith: `TPL-${prefix}-` } },
    orderBy: { code: 'desc' },
    select: { code: true },
  });

  let nextNum = 1;
  if (lastTemplate?.code) {
    const parts = lastTemplate.code.split('-');
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num)) nextNum = num + 1;
  }
  return `TPL-${prefix}-${String(nextNum).padStart(3, '0')}`;
}

// ---------------------------------------------------------------------------
// GET /api/v1/templates — List templates
// ---------------------------------------------------------------------------

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      module, category, status, search,
      page = '1', limit = '20', sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query as Record<string, string>;

    const where: Record<string, unknown> = { deletedAt: null };
    if (module) where.module = module;
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [templates, total] = await Promise.all([
      (prisma as any).template.findMany({
        where,
        orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take,
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          module: true,
          category: true,
          status: true,
          version: true,
          tags: true,
          usageCount: true,
          isBuiltIn: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      (prisma as any).template.count({ where }),
    ]);

    res.json({
      success: true,
      data: templates,
      pagination: { page: parseInt(page, 10), limit: take, total, pages: Math.ceil(total / take) },
    });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/v1/templates/stats — Usage statistics
// ---------------------------------------------------------------------------

router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const [byModule, byCategory, topUsed, totals] = await Promise.all([
      (prisma as any).template.groupBy({
        by: ['module'],
        _count: true,
        where: { deletedAt: null } as any,
      }),
      (prisma as any).template.groupBy({
        by: ['category'],
        _count: true,
        where: { deletedAt: null } as any,
      }),
      (prisma as any).template.findMany({
        where: { deletedAt: null, usageCount: { gt: 0 } as any },
        orderBy: { usageCount: 'desc' },
        take: 10,
        select: { id: true, code: true, name: true, module: true, usageCount: true },
      }),
      (prisma as any).template.aggregate({
        _count: true,
        _sum: { usageCount: true },
        where: { deletedAt: null } as any,
      }),
    ]);

    res.json({
      success: true,
      data: {
        byModule: byModule.map((g: Record<string, unknown>) => ({ module: g.module, count: g._count })),
        byCategory: byCategory.map((g: Record<string, unknown>) => ({ category: g.category, count: g._count })),
        topUsed,
        total: totals._count,
        totalUsages: totals._sum?.usageCount ?? 0,
      },
    });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/v1/templates/search — Full-text search
// ---------------------------------------------------------------------------

router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    const { q = '', limit = '20' } = req.query as Record<string, string>;
    if (!q.trim()) {
      return res.json({ success: true, data: [] });
    }

    const templates = await (prisma as any).template.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: 'insensitive' } as any },
          { description: { contains: q, mode: 'insensitive' } },
          { code: { contains: q, mode: 'insensitive' } },
          { tags: { has: q.toLowerCase() } },
        ],
      },
      orderBy: { usageCount: 'desc' },
      take: Math.min(50, parseInt(limit, 10)),
      select: {
        id: true, code: true, name: true, description: true,
        module: true, category: true, usageCount: true,
      },
    });

    res.json({ success: true, data: templates });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/v1/templates/:id — Single template
// ---------------------------------------------------------------------------

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const template = await (prisma as any).template.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!template) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
    }
    res.json({ success: true, data: template });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/v1/templates — Create template
// ---------------------------------------------------------------------------

router.post('/', requireRole('MANAGER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    }
    const data = parsed.data;
    const code = await generateCode(data.module);

    const template = await (prisma as any).template.create({
      data: {
        code,
        name: data.name,
        description: data.description ?? null,
        module: data.module,
        category: data.category,
        status: data.status,
        tags: data.tags,
        fields: data.fields as any,
        defaultContent: data.defaultContent ?? null,
        isBuiltIn: false,
        createdBy: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: template });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/v1/templates/:id — Update template (auto-versions)
// ---------------------------------------------------------------------------

router.put('/:id', requireRole('MANAGER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await (prisma as any).template.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
    }

    const parsed = updateTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    }

    // Snapshot current version before update
    await (prisma as any).templateVersion.create({
      data: {
        templateId: existing.id,
        version: existing.version,
        fields: existing.fields,
        defaultContent: existing.defaultContent,
        changedById: req.user!.id,
        changeNote: parsed.data.changeNote ?? `Updated to version ${existing.version + 1}`,
      },
    });

    const updateData: Record<string, unknown> = { ...parsed.data, version: existing.version + 1 };
    delete updateData.changeNote;

    const updated = await (prisma as any).template.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/templates/:id — Soft-delete
// ---------------------------------------------------------------------------

router.delete('/:id', requireRole('MANAGER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await (prisma as any).template.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
    }

    // Only ADMIN can delete built-in templates
    if (existing.isBuiltIn && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Only administrators can delete built-in templates' } });
    }

    await (prisma as any).template.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Template deleted' } });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/v1/templates/:id/clone — Clone template
// ---------------------------------------------------------------------------

router.post('/:id/clone', requireRole('MANAGER', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const original = await (prisma as any).template.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!original) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
    }

    const code = await generateCode(original.module);
    const nameBody = z.object({ name: z.string().max(300).optional() }).safeParse(req.body);
    const cloneName = (nameBody.success ? nameBody.data.name : undefined) || `${original.name} (Copy)`;

    const cloned = await (prisma as any).template.create({
      data: {
        code,
        name: cloneName,
        description: original.description,
        module: original.module,
        category: original.category,
        status: 'DRAFT',
        tags: original.tags,
        fields: original.fields,
        defaultContent: original.defaultContent,
        isBuiltIn: false,
        usageCount: 0,
        createdBy: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: cloned });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/v1/templates/:id/use — Create TemplateInstance
// ---------------------------------------------------------------------------

router.post('/:id/use', async (req: AuthRequest, res: Response) => {
  try {
    const template = await (prisma as any).template.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!template) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
    }

    const parsed = useTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    }

    const [instance] = await Promise.all([
      (prisma as any).templateInstance.create({
        data: {
          templateId: template.id,
          templateCode: template.code,
          templateName: template.name,
          module: template.module,
          filledData: parsed.data.filledData as any,
          createdById: req.user!.id,
          referenceId: parsed.data.referenceId ?? null,
        },
      }),
      (prisma as any).template.update({
        where: { id: template.id },
        data: { usageCount: { increment: 1 } },
      }),
    ]);

    res.status(201).json({ success: true, data: instance });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

// ---------------------------------------------------------------------------
// GET /api/v1/templates/:id/versions — Version history
// ---------------------------------------------------------------------------

router.get('/:id/versions', async (req: AuthRequest, res: Response) => {
  try {
    const template = await (prisma as any).template.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      select: { id: true },
    });
    if (!template) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
    }

    const versions = await (prisma as any).templateVersion.findMany({
      where: { templateId: req.params.id },
      orderBy: { version: 'desc' },
    });

    res.json({ success: true, data: versions });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

// ---------------------------------------------------------------------------
// POST /api/v1/templates/:id/versions/:version/restore — Restore version
// ---------------------------------------------------------------------------

router.post(
  '/:id/versions/:version/restore',
  requireRole('MANAGER', 'ADMIN'),
  async (req: AuthRequest, res: Response) => {
    try {
      const versionNum = parseInt(req.params.version, 10);
      const templateVersion = await (prisma as any).templateVersion.findFirst({
        where: { templateId: req.params.id, version: versionNum },
      });
      if (!templateVersion) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Version not found' } });
      }

      const current = await (prisma as any).template.findFirst({
        where: { id: req.params.id, deletedAt: null } as any,
      });
      if (!current) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
      }

      // Snapshot current state before restoring
      await (prisma as any).templateVersion.create({
        data: {
          templateId: current.id,
          version: current.version,
          fields: current.fields,
          defaultContent: current.defaultContent,
          changedById: req.user!.id,
          changeNote: `Restored from version ${versionNum}`,
        },
      });

      const restored = await (prisma as any).template.update({
        where: { id: req.params.id },
        data: {
          fields: templateVersion.fields,
          defaultContent: templateVersion.defaultContent,
          version: current.version + 1,
        },
      });

      res.json({ success: true, data: restored });
    } catch (error: unknown) {
      logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
    }
  },
);

// ---------------------------------------------------------------------------
// GET /api/v1/templates/:id/export — Export as HTML or JSON
// ---------------------------------------------------------------------------

router.get('/:id/export', async (req: AuthRequest, res: Response) => {
  try {
    const template = await (prisma as any).template.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!template) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
    }

    const format = (req.query.format as string) === 'json' ? 'json' : 'html';
    const slug = template.code.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (format === 'json') {
      const payload = {
        code: template.code,
        name: template.name,
        description: template.description,
        module: template.module,
        category: template.category,
        version: template.version,
        fields: template.fields,
        defaultContent: template.defaultContent,
        exportedAt: new Date().toISOString(),
      };
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${slug}.json"`);
      return res.send(JSON.stringify(payload, null, 2));
    }

    // HTML export
    const html = renderTemplateToHtml(
      {
        code: template.code,
        name: template.name,
        description: template.description,
        fields: template.fields as any,
      },
      undefined,
    );
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.html"`);
    res.send(html);
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
});

export default router;
