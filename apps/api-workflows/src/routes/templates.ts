import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-workflows');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Valid WorkflowCategory enum values
const workflowCategoryEnum = z.enum([
  'APPROVAL',
  'REVIEW',
  'CHANGE_MANAGEMENT',
  'INCIDENT',
  'REQUEST',
  'ONBOARDING',
  'OFFBOARDING',
  'PROCUREMENT',
  'DOCUMENT_CONTROL',
  'AUDIT',
  'CAPA',
  'TRAINING',
  'CUSTOM',
]);

// Valid IndustryType enum values
const industryTypeEnum = z.enum([
  'MANUFACTURING',
  'HEALTHCARE',
  'CONSTRUCTION',
  'RETAIL',
  'FINANCE',
  'TECHNOLOGY',
  'EDUCATION',
  'HOSPITALITY',
  'LOGISTICS',
  'ENERGY',
  'PHARMACEUTICAL',
  'AUTOMOTIVE',
  'AEROSPACE',
  'FOOD_BEVERAGE',
  'GENERAL',
]);

// GET /api/templates - Get workflow templates
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { category, industryType, isActive } = req.query;

    const where: Record<string, unknown> = { deletedAt: null };
    if (category) where.category = category;
    if (industryType) where.industryType = industryType;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const templates = await prisma.workflowTemplate.findMany({
      where,
      orderBy: { name: 'asc' },
      take: 100,
    });

    res.json({ success: true, data: templates });
  } catch (error) {
    logger.error('Error fetching templates', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch templates' },
    });
  }
});

// GET /api/templates/categories/list - Get template categories (must be before /:id)
router.get('/categories/list', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.workflowTemplate.groupBy({
      by: ['category'],
      _count: true,
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    logger.error('Error fetching categories', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch categories' },
    });
  }
});

// GET /api/templates/:id - Get single template
router.get(
  '/:id',
  checkOwnership(prisma.workflowTemplate),
  async (req: AuthRequest, res: Response) => {
    try {
      const template = await prisma.workflowTemplate.findUnique({
        where: { id: req.params.id },
      });

      if (!template) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
      }

      res.json({ success: true, data: template });
    } catch (error) {
      logger.error('Error fetching template', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch template' },
      });
    }
  }
);

// POST /api/templates - Create template
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      code: z.string().trim().min(1).max(200),
      name: z.string().trim().min(1).max(200),
      description: z.string().trim().optional(),
      category: workflowCategoryEnum,
      industryType: industryTypeEnum.optional(),
      definitionTemplate: z.record(z.unknown()),
      formTemplates: z.record(z.unknown()).optional(),
    });

    const data = schema.parse(req.body);

    const template = await prisma.workflowTemplate.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        industryType: data.industryType,
        definitionTemplate: data.definitionTemplate as any,
        formTemplates: data.formTemplates as any,
      },
    });

    res.status(201).json({ success: true, data: template });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating template', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create template' },
    });
  }
});

// PUT /api/templates/:id - Update template
router.put(
  '/:id',
  checkOwnership(prisma.workflowTemplate),
  async (req: AuthRequest, res: Response) => {
    try {
      const schema = z.object({
        name: z.string().trim().min(1).max(200).optional(),
        description: z.string().trim().optional(),
        category: workflowCategoryEnum.optional(),
        industryType: industryTypeEnum.optional(),
        definitionTemplate: z.record(z.unknown()).optional(),
        formTemplates: z.record(z.unknown()).optional(),
        isActive: z.boolean().optional(),
      });

      const data = schema.parse(req.body);

      const template = await prisma.workflowTemplate.update({
        where: { id: req.params.id },
        data: data as any,
      });

      res.json({ success: true, data: template });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
      }
      logger.error('Error updating template', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update template' },
      });
    }
  }
);

// PUT /api/templates/:id/publish - Publish template
router.put(
  '/:id/publish',
  checkOwnership(prisma.workflowTemplate),
  async (req: AuthRequest, res: Response) => {
    try {
      const template = await prisma.workflowTemplate.update({
        where: { id: req.params.id },
        data: {
          isActive: true,
        },
      });

      res.json({ success: true, data: template });
    } catch (error) {
      logger.error('Error publishing template', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to publish template' },
      });
    }
  }
);

export default router;
