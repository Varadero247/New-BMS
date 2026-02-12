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

// Valid WorkflowTriggerType enum values
const triggerTypeEnum = z.enum(['MANUAL', 'AUTOMATIC', 'SCHEDULED', 'EVENT', 'API']);

// Valid WorkflowDefinitionStatus enum values
const statusEnum = z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED']);

// GET /api/definitions - Get workflow definitions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, templateId, createdBy } = req.query;

    const where: Prisma.WorkflowDefinitionWhereInput = {};
    if (status) where.status = status;
    if (templateId) where.templateId = templateId;
    if (createdBy) where.createdBy = createdBy;

    const definitions = await prisma.workflowDefinition.findMany({
      where,
      include: {
        template: { select: { name: true, category: true } },
        _count: { select: { instances: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, data: definitions });
  } catch (error) {
    logger.error('Error fetching definitions', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch definitions' } });
  }
});

// GET /api/definitions/:id - Get single definition
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const definition = await prisma.workflowDefinition.findUnique({
      where: { id: req.params.id },
      include: {
        template: true,
        instances: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!definition) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Definition not found' } });
    }

    res.json({ success: true, data: definition });
  } catch (error) {
    logger.error('Error fetching definition', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch definition' } });
  }
});

// POST /api/definitions - Create workflow definition
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      templateId: z.string().uuid().optional(),
      code: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      triggerType: triggerTypeEnum,
      triggerConfig: z.record(z.unknown()).optional(),
      nodes: z.array(z.record(z.unknown())),
      edges: z.array(z.record(z.unknown())),
      variables: z.record(z.unknown()).optional(),
      defaultSLA: z.number().optional(),
      escalationRules: z.record(z.unknown()).optional(),
      notificationConfig: z.record(z.unknown()).optional(),
      createdBy: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const definition = await prisma.workflowDefinition.create({
      data: {
        templateId: data.templateId,
        code: data.code,
        name: data.name,
        description: data.description,
        triggerType: data.triggerType,
        triggerConfig: data.triggerConfig,
        nodes: data.nodes,
        edges: data.edges,
        variables: data.variables,
        defaultSLA: data.defaultSLA,
        escalationRules: data.escalationRules,
        notificationConfig: data.notificationConfig,
        createdBy: data.createdBy,
        version: 1,
        status: 'DRAFT',
      },
      include: {
        template: { select: { name: true, category: true } },
      },
    });

    res.status(201).json({ success: true, data: definition });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating definition', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create definition' } });
  }
});

// PUT /api/definitions/:id - Update workflow definition
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      triggerType: triggerTypeEnum.optional(),
      triggerConfig: z.record(z.unknown()).optional(),
      nodes: z.array(z.record(z.unknown())).optional(),
      edges: z.array(z.record(z.unknown())).optional(),
      variables: z.record(z.unknown()).optional(),
      defaultSLA: z.number().optional(),
      escalationRules: z.record(z.unknown()).optional(),
      notificationConfig: z.record(z.unknown()).optional(),
    });

    const data = schema.parse(req.body);

    // Increment version on update
    const current = await prisma.workflowDefinition.findUnique({ where: { id: req.params.id } });
    if (!current) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Definition not found' } });
    }

    const definition = await prisma.workflowDefinition.update({
      where: { id: req.params.id },
      data: {
        ...data,
        version: current.version + 1,
      },
    });

    res.json({ success: true, data: definition });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating definition', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update definition' } });
  }
});

// PUT /api/definitions/:id/activate - Activate workflow definition (was publish)
router.put('/:id/activate', async (req: Request, res: Response) => {
  try {
    const current = await prisma.workflowDefinition.findUnique({ where: { id: req.params.id } });
    if (!current) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Definition not found' } });
    }

    const definition = await prisma.workflowDefinition.update({
      where: { id: req.params.id },
      data: {
        status: 'ACTIVE',
        publishedVersion: current.version,
      },
    });

    res.json({ success: true, data: definition });
  } catch (error) {
    logger.error('Error activating definition', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to activate definition' } });
  }
});

// PUT /api/definitions/:id/archive - Archive workflow definition
router.put('/:id/archive', async (req: Request, res: Response) => {
  try {
    const definition = await prisma.workflowDefinition.update({
      where: { id: req.params.id },
      data: { status: 'ARCHIVED' },
    });

    res.json({ success: true, data: definition });
  } catch (error) {
    logger.error('Error archiving definition', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to archive definition' } });
  }
});

// POST /api/definitions/:id/clone - Clone workflow definition
router.post('/:id/clone', async (req: Request, res: Response) => {
  try {
    const source = await prisma.workflowDefinition.findUnique({ where: { id: req.params.id } });
    if (!source) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Definition not found' } });
    }

    // Generate unique code for clone
    const cloneCode = `${source.code}-COPY-${Date.now()}`;

    const clone = await prisma.workflowDefinition.create({
      data: {
        templateId: source.templateId,
        code: cloneCode,
        name: `${source.name} (Copy)`,
        description: source.description,
        triggerType: source.triggerType,
        triggerConfig: source.triggerConfig ?? undefined,
        nodes: source.nodes as object,
        edges: source.edges as object,
        variables: source.variables ?? undefined,
        defaultSLA: source.defaultSLA,
        escalationRules: source.escalationRules ?? undefined,
        notificationConfig: source.notificationConfig ?? undefined,
        version: 1,
        status: 'DRAFT',
      },
    });

    res.status(201).json({ success: true, data: clone });
  } catch (error) {
    logger.error('Error cloning definition', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to clone definition' } });
  }
});

export default router;
