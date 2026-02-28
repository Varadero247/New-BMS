// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma as prismaBase, Prisma } from '@ims/database';
import type { PrismaClient } from '@ims/database/core';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { renderTemplateToHtml } from '@ims/templates';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
const logger = createLogger('api-gateway');
const prisma = prismaBase as unknown as PrismaClient;

const router = Router();
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const createTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  module: z.enum([
    'HEALTH_SAFETY',
    'ENVIRONMENT',
    'QUALITY',
    'AUTOMOTIVE',
    'MEDICAL',
    'AEROSPACE',
    'HR',
    'PAYROLL',
    'WORKFLOWS',
    'PROJECT_MANAGEMENT',
    'INVENTORY',
    'CRM',
    'FINANCE',
    'INFOSEC',
    'ISO37001',
    'ISO42001',
    'ESG',
    'CMMS',
    'FOOD_SAFETY',
    'ENERGY',
    'FIELD_SERVICE',
    'ANALYTICS',
    'RISK',
    'TRAINING',
    'SUPPLIERS',
    'ASSETS',
    'COMPLAINTS',
    'DOCUMENTS',
    'CONTRACTS',
    'PTW',
    'INCIDENTS',
    'AUDITS',
    'MANAGEMENT_REVIEW',
    'CHEMICALS',
  ]),
  category: z.enum([
    'RISK_ASSESSMENT',
    'INCIDENT_INVESTIGATION',
    'AUDIT',
    'MANAGEMENT_REVIEW',
    'CAPA',
    'COMPLIANCE',
    'INSPECTION',
    'TRAINING',
    'DESIGN_DEVELOPMENT',
    'PROCESS_CONTROL',
    'SUPPLIER',
    'CUSTOMER',
    'REGULATORY',
    'PLANNING',
    'REPORTING',
    'GENERAL',
    'CERTIFICATION',
  ]),
  tags: z.array(z.string().trim()).optional().default([]),
  fields: z.array(z.any()).min(1, 'At least one field is required'),
  defaultContent: z.record(z.any()).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED']).optional().default('ACTIVE'),
});

const updateTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  category: z
    .enum([
      'RISK_ASSESSMENT',
      'INCIDENT_INVESTIGATION',
      'AUDIT',
      'MANAGEMENT_REVIEW',
      'CAPA',
      'COMPLIANCE',
      'INSPECTION',
      'TRAINING',
      'DESIGN_DEVELOPMENT',
      'PROCESS_CONTROL',
      'SUPPLIER',
      'CUSTOMER',
      'REGULATORY',
      'PLANNING',
      'REPORTING',
      'GENERAL',
      'CERTIFICATION',
    ])
    .optional(),
  tags: z.array(z.string().trim()).optional(),
  fields: z.array(z.any()).optional(),
  defaultContent: z.record(z.any()).optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED']).optional(),
  changeNote: z.string().trim().max(500).optional(),
});

const useTemplateSchema = z.object({
  filledData: z.record(z.any()),
  referenceId: z.string().trim().optional(),
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
  const lastTemplate = await prisma.template.findFirst({
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

router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      module,
      category,
      status,
      search,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
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

    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const take = Math.min(250, Math.max(1, parseInt(limit, 10) || 20));

    const [templates, total] = await Promise.all([
      prisma.template.findMany({
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
          fields: true,
          usageCount: true,
          isBuiltIn: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.template.count({ where }),
    ]);

    res.json({
      success: true,
      data: templates,
      pagination: {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/v1/templates/stats — Usage statistics
// ---------------------------------------------------------------------------

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [byModule, byCategory, topUsed, totals] = await Promise.all([
      prisma.template.groupBy({
        by: ['module'],
        _count: true,
        where: { deletedAt: null },
      }),
      prisma.template.groupBy({
        by: ['category'],
        _count: true,
        where: { deletedAt: null },
      }),
      prisma.template.findMany({
        where: { deletedAt: null, usageCount: { gt: 0 } },
        orderBy: { usageCount: 'desc' },
        take: 10,
        select: { id: true, code: true, name: true, module: true, usageCount: true },
      }),
      prisma.template.aggregate({
        _count: true,
        _sum: { usageCount: true },
        where: { deletedAt: null },
      }),
    ]);

    res.json({
      success: true,
      data: {
        byModule: byModule.map((g: Record<string, unknown>) => ({
          module: g.module,
          count: g._count,
        })),
        byCategory: byCategory.map((g: Record<string, unknown>) => ({
          category: g.category,
          count: g._count,
        })),
        topUsed,
        total: totals._count,
        totalUsages: totals._sum?.usageCount ?? 0,
      },
    });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/v1/templates/search — Full-text search
// ---------------------------------------------------------------------------

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q = '', limit = '20' } = req.query as Record<string, string>;
    if (!q.trim()) {
      return res.json({ success: true, data: [] });
    }

    const templates = await prisma.template.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { code: { contains: q, mode: 'insensitive' } },
          { tags: { has: q.toLowerCase() } },
        ],
      },
      orderBy: { usageCount: 'desc' },
      take: Math.min(50, parseInt(limit, 10) || 20),
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        module: true,
        category: true,
        usageCount: true,
      },
    });

    res.json({ success: true, data: templates });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/v1/templates/:id — Single template
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const template = await prisma.template.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!template) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
    }
    res.json({ success: true, data: template });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/v1/templates — Create template
// ---------------------------------------------------------------------------

router.post('/', authenticate, requireRole('MANAGER', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const parsed = createTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    }
    const data = parsed.data;
    const code = await generateCode(data.module);

    const template = await prisma.template.create({
      data: {
        code,
        name: data.name,
        description: data.description ?? null,
        module: data.module,
        category: data.category,
        status: data.status,
        tags: data.tags,
        fields: data.fields as Prisma.InputJsonValue,
        defaultContent: (data.defaultContent ?? null) as never,
        isBuiltIn: false,
        createdBy: (req as AuthRequest).user!.id,
      },
    });

    res.status(201).json({ success: true, data: template });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/v1/templates/:id — Update template (auto-versions)
// ---------------------------------------------------------------------------

router.put('/:id', authenticate, requireRole('MANAGER', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.template.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
    }

    const parsed = updateTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    }

    // Snapshot current version before update
    await prisma.templateVersion.create({
      data: {
        templateId: existing.id,
        version: existing.version,
        fields: existing.fields as never,
        defaultContent: existing.defaultContent as never,
        changedById: (req as AuthRequest).user!.id,
        changeNote: parsed.data.changeNote ?? `Updated to version ${existing.version + 1}`,
      },
    });

    const updateData: Record<string, unknown> = { ...parsed.data, version: existing.version + 1 };
    delete updateData.changeNote;

    const updated = await prisma.template.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/v1/templates/:id — Soft-delete
// ---------------------------------------------------------------------------

router.delete('/:id', authenticate, requireRole('MANAGER', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.template.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
    }

    // Only ADMIN can delete built-in templates
    if (existing.isBuiltIn && (req as AuthRequest).user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Only administrators can delete built-in templates',
        },
      });
    }

    await prisma.template.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Template deleted' } });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/v1/templates/:id/clone — Clone template
// ---------------------------------------------------------------------------

router.post(
  '/:id/clone',
  authenticate,
  requireRole('MANAGER', 'ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const original = await prisma.template.findFirst({
        where: { id: req.params.id, deletedAt: null },
      });
      if (!original) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
      }

      const code = await generateCode(original.module);
      const nameBody = z
        .object({ name: z.string().trim().max(300).optional() })
        .safeParse(req.body);
      const cloneName =
        (nameBody.success ? nameBody.data.name : undefined) || `${original.name} (Copy)`;

      const cloned = await prisma.template.create({
        data: {
          code,
          name: cloneName,
          description: original.description,
          module: original.module,
          category: original.category,
          status: 'DRAFT',
          tags: original.tags,
          fields: original.fields as never,
          defaultContent: original.defaultContent as never,
          isBuiltIn: false,
          usageCount: 0,
          createdBy: (req as AuthRequest).user!.id,
        },
      });

      res.status(201).json({ success: true, data: cloned });
    } catch (error: unknown) {
      logger.error('Request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/v1/templates/:id/use — Create TemplateInstance
// ---------------------------------------------------------------------------

router.post('/:id/use', authenticate, async (req: Request, res: Response) => {
  try {
    const template = await prisma.template.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!template) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
    }

    const parsed = useTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.errors[0].message });
    }

    const [instance] = await Promise.all([
      prisma.templateInstance.create({
        data: {
          templateId: template.id,
          templateCode: template.code,
          templateName: template.name,
          module: template.module,
          filledData: parsed.data.filledData as Prisma.InputJsonValue,
          createdById: (req as AuthRequest).user!.id,
          referenceId: parsed.data.referenceId ?? null,
        },
      }),
      prisma.template.update({
        where: { id: template.id },
        data: { usageCount: { increment: 1 } },
      }),
    ]);

    res.status(201).json({ success: true, data: instance });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/v1/templates/:id/versions — Version history
// ---------------------------------------------------------------------------

router.get('/:id/versions', async (req: Request, res: Response) => {
  try {
    const template = await prisma.template.findFirst({
      where: { id: req.params.id, deletedAt: null },
      select: { id: true },
    });
    if (!template) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
    }

    const versions = await prisma.templateVersion.findMany({
      where: { templateId: req.params.id },
      orderBy: { version: 'desc' },
      take: 1000,
    });

    res.json({ success: true, data: versions });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/v1/templates/:id/versions/:version/restore — Restore version
// ---------------------------------------------------------------------------

router.post(
  '/:id/versions/:version/restore',
  authenticate,
  requireRole('MANAGER', 'ADMIN'),
  async (req: Request, res: Response) => {
    try {
      const versionNum = parseInt(req.params.version, 10);
      if (isNaN(versionNum)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid version number' },
        });
      }
      const templateVersion = await prisma.templateVersion.findFirst({
        where: { templateId: req.params.id, version: versionNum },
      });
      if (!templateVersion) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Version not found' } });
      }

      const current = await prisma.template.findFirst({
        where: { id: req.params.id, deletedAt: null },
      });
      if (!current) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
      }

      // Snapshot current state before restoring
      await prisma.templateVersion.create({
        data: {
          templateId: current.id,
          version: current.version,
          fields: current.fields as never,
          defaultContent: current.defaultContent as never,
          changedById: (req as AuthRequest).user!.id,
          changeNote: `Restored from version ${versionNum}`,
        },
      });

      const restored = await prisma.template.update({
        where: { id: req.params.id },
        data: {
          fields: templateVersion.fields as never,
          defaultContent: (templateVersion.defaultContent ?? null) as never,
          version: current.version + 1,
        },
      });

      res.json({ success: true, data: restored });
    } catch (error: unknown) {
      logger.error('Request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
      });
    }
  }
);

// ---------------------------------------------------------------------------
// GET /api/v1/templates/:id/export — Export as HTML or JSON
// ---------------------------------------------------------------------------

router.get('/:id/export', async (req: Request, res: Response) => {
  try {
    const template = await prisma.template.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!template) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
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
        fields: template.fields as unknown as import('@ims/templates').FieldDefinition[],
      },
      undefined
    );
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.html"`);
    res.send(html);
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});

export default router;
