import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import type { Prisma } from '@ims/database/workflows';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-workflows');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Valid WorkflowTriggerType enum values
const triggerTypeEnum = z.enum(['MANUAL', 'AUTOMATIC', 'SCHEDULED', 'EVENT', 'API']);

// Valid WorkflowDefinitionStatus enum values
const statusEnum = z.enum(['DRAFT', 'ACTIVE', 'DEPRECATED', 'ARCHIVED']);

// GET /api/definitions - Get workflow definitions
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, createdById } = req.query;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (category) where.category = category as any;
    if (createdById) where.createdById = createdById as string;

    const definitions = await prisma.workflowDefinition.findMany({
      where,
      include: {
        _count: { select: { instances: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: definitions });
  } catch (error) {
    logger.error('Error fetching definitions', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch definitions' },
    });
  }
});

// GET /api/definitions/:id - Get single definition
router.get(
  '/:id',
  checkOwnership(prisma.workflowDefinition),
  async (req: AuthRequest, res: Response) => {
    try {
      const definition = await prisma.workflowDefinition.findUnique({
        where: { id: req.params.id },
        include: {
          instances: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!definition) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Definition not found' } });
      }

      res.json({ success: true, data: definition });
    } catch (error) {
      logger.error('Error fetching definition', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch definition' },
      });
    }
  }
);

// POST /api/definitions - Create workflow definition
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      code: z.string().trim().min(1).max(200),
      name: z.string().trim().min(1).max(200),
      description: z.string().trim().optional(),
      category: z.enum([
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
      ]),
      triggerType: triggerTypeEnum,
      triggerConfig: z.record(z.unknown()).optional(),
      steps: z.unknown(), // JSON array of step definitions
      rules: z.record(z.unknown()).optional(),
      defaultSlaHours: z.number().nonnegative().optional(),
      escalationConfig: z.record(z.unknown()).optional(),
      createdById: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const definition = await prisma.workflowDefinition.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        category: data.category,
        triggerType: data.triggerType,
        triggerConfig: data.triggerConfig as any,
        steps: data.steps as any,
        rules: data.rules as any,
        defaultSlaHours: data.defaultSlaHours,
        escalationConfig: data.escalationConfig as any,
        createdById: data.createdById,
        version: 1,
        status: 'DRAFT',
      },
    });

    res.status(201).json({ success: true, data: definition });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating definition', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create definition' },
    });
  }
});

// PUT /api/definitions/:id - Update workflow definition
router.put(
  '/:id',
  checkOwnership(prisma.workflowDefinition),
  async (req: AuthRequest, res: Response) => {
    try {
      const schema = z.object({
        name: z.string().trim().min(1).max(200).optional(),
        description: z.string().trim().optional(),
        triggerType: triggerTypeEnum.optional(),
        triggerConfig: z.record(z.unknown()).optional(),
        steps: z.unknown().optional(),
        rules: z.record(z.unknown()).optional(),
        defaultSlaHours: z.number().nonnegative().optional(),
        escalationConfig: z.record(z.unknown()).optional(),
      });

      const data = schema.parse(req.body);

      // Increment version on update
      const current = await prisma.workflowDefinition.findUnique({ where: { id: req.params.id } });
      if (!current) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Definition not found' } });
      }

      const definition = await prisma.workflowDefinition.update({
        where: { id: req.params.id },
        data: {
          ...data,
          version: current.version + 1,
        } as any,
      });

      res.json({ success: true, data: definition });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
      }
      logger.error('Error updating definition', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update definition' },
      });
    }
  }
);

// PUT /api/definitions/:id/activate - Activate workflow definition (was publish)
router.put(
  '/:id/activate',
  checkOwnership(prisma.workflowDefinition),
  async (req: AuthRequest, res: Response) => {
    try {
      const current = await prisma.workflowDefinition.findUnique({ where: { id: req.params.id } });
      if (!current) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Definition not found' } });
      }

      const definition = await prisma.workflowDefinition.update({
        where: { id: req.params.id },
        data: {
          status: 'ACTIVE',
          publishedAt: new Date(),
        },
      });

      res.json({ success: true, data: definition });
    } catch (error) {
      logger.error('Error activating definition', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to activate definition' },
      });
    }
  }
);

// PUT /api/definitions/:id/archive - Archive workflow definition
router.put(
  '/:id/archive',
  checkOwnership(prisma.workflowDefinition),
  async (req: AuthRequest, res: Response) => {
    try {
      const definition = await prisma.workflowDefinition.update({
        where: { id: req.params.id },
        data: { status: 'ARCHIVED' },
      });

      res.json({ success: true, data: definition });
    } catch (error) {
      logger.error('Error archiving definition', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to archive definition' },
      });
    }
  }
);

// POST /api/definitions/:id/clone - Clone workflow definition
router.post('/:id/clone', async (req: Request, res: Response) => {
  try {
    const source = await prisma.workflowDefinition.findUnique({ where: { id: req.params.id } });
    if (!source) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Definition not found' } });
    }

    // Generate unique code for clone
    const cloneCode = `${source.code}-COPY-${Date.now()}`;

    const clone = await prisma.workflowDefinition.create({
      data: {
        code: cloneCode,
        name: `${source.name} (Copy)`,
        description: source.description,
        category: source.category,
        triggerType: source.triggerType,
        triggerConfig: (source.triggerConfig ?? undefined) as any,
        steps: source.steps as any,
        rules: (source.rules ?? undefined) as any,
        defaultSlaHours: source.defaultSlaHours,
        escalationConfig: (source.escalationConfig ?? undefined) as any,
        version: 1,
        status: 'DRAFT',
      },
    });

    res.status(201).json({ success: true, data: clone });
  } catch (error) {
    logger.error('Error cloning definition', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to clone definition' },
    });
  }
});

export default router;
