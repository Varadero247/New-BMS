import { Router, Request, Response } from 'express';
import { prisma } from '@ims/database';
import type { Prisma } from '@ims/database/workflows';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-workflows');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Valid WorkflowCategory enum values
const workflowCategoryEnum = z.enum([
  'HR', 'FINANCE', 'OPERATIONS', 'QUALITY', 'SAFETY',
  'PROCUREMENT', 'SALES', 'CUSTOMER_SERVICE', 'IT', 'COMPLIANCE', 'GENERAL'
]);

// Valid IndustryType enum values
const industryTypeEnum = z.enum([
  'MANUFACTURING', 'HEALTHCARE', 'CONSTRUCTION', 'RETAIL', 'FINANCE',
  'TECHNOLOGY', 'EDUCATION', 'HOSPITALITY', 'LOGISTICS', 'ENERGY',
  'PHARMACEUTICAL', 'AUTOMOTIVE', 'AEROSPACE', 'FOOD_BEVERAGE', 'GENERAL'
]);

// Valid WorkflowComplexity enum values
const complexityEnum = z.enum(['SIMPLE', 'MEDIUM', 'COMPLEX']);

// GET /api/templates - Get workflow templates
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, industryType, isActive } = req.query;

    const where: Prisma.WorkflowTemplateWhereInput = {};
    if (category) where.category = category;
    if (industryType) where.industryType = industryType;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const templates = await prisma.workflowTemplate.findMany({
      where,
      include: {
        _count: { select: { definitions: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: templates });
  } catch (error) {
    logger.error('Error fetching templates', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch templates' } });
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
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch categories' } });
  }
});

// GET /api/templates/:id - Get single template
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const template = await prisma.workflowTemplate.findUnique({
      where: { id: req.params.id },
      include: {
        definitions: true,
      },
    });

    if (!template) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
    }

    res.json({ success: true, data: template });
  } catch (error) {
    logger.error('Error fetching template', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch template' } });
  }
});

// POST /api/templates - Create template
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      code: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      category: workflowCategoryEnum,
      industryType: industryTypeEnum.optional(),
      estimatedDuration: z.number().optional(),
      complexity: complexityEnum.optional(),
      requiredRoles: z.array(z.string()).optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const template = await prisma.workflowTemplate.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        industryType: data.industryType,
        estimatedDuration: data.estimatedDuration,
        complexity: data.complexity || 'MEDIUM',
        requiredRoles: data.requiredRoles || [],
        icon: data.icon,
        color: data.color,
        version: 1,
      },
    });

    res.status(201).json({ success: true, data: template });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating template', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create template' } });
  }
});

// PUT /api/templates/:id - Update template
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      category: workflowCategoryEnum.optional(),
      industryType: industryTypeEnum.optional(),
      estimatedDuration: z.number().optional(),
      complexity: complexityEnum.optional(),
      requiredRoles: z.array(z.string()).optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      isActive: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const template = await prisma.workflowTemplate.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: template });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating template', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update template' } });
  }
});

// PUT /api/templates/:id/publish - Publish template
router.put('/:id/publish', async (req: Request, res: Response) => {
  try {
    const template = await prisma.workflowTemplate.update({
      where: { id: req.params.id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    res.json({ success: true, data: template });
  } catch (error) {
    logger.error('Error publishing template', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to publish template' } });
  }
});

export default router;
