import { Router, Response } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-quality');

const router: Router = Router();

router.use(authenticate);
router.param('id', validateIdParam());
router.param('milestoneId', validateIdParam('milestoneId'));

// Generate reference number
async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.qualObjective.count({
    where: { referenceNumber: { startsWith: `QMS-OBJ-${year}` } },
  });
  return `QMS-OBJ-${year}-${String(count + 1).padStart(3, '0')}`;
}

// ============================================
// OBJECTIVE CRUD
// ============================================

// GET / — List objectives (paginated)
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', category, status, search } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) where.title = { contains: search as string, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      prisma.qualObjective.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { milestones: { orderBy: { targetDate: 'asc' } } },
      }),
      prisma.qualObjective.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('List objectives error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list objectives' },
    });
  }
});

// GET /:id — Get single objective
router.get(
  '/:id',
  checkOwnership(prisma.qualObjective),
  async (req: AuthRequest, res: Response) => {
    try {
      const objective = await prisma.qualObjective.findUnique({
        where: { id: req.params.id },
        include: { milestones: { orderBy: { targetDate: 'asc' } } },
      });

      if (!objective) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
      }

      res.json({ success: true, data: objective });
    } catch (error) {
      logger.error('Get objective error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get objective' },
      });
    }
  }
);

// POST / — Create objective
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      objectiveStatement: z.string().trim().min(1).max(2000),
      category: z.enum([
        'CUSTOMER_SATISFACTION',
        'PRODUCT_QUALITY',
        'PROCESS_EFFICIENCY',
        'SUPPLIER_PERFORMANCE',
        'COMPLIANCE',
        'DEFECT_REDUCTION',
        'ON_TIME_DELIVERY',
        'AUDIT_PERFORMANCE',
        'IMPROVEMENT',
        'REVENUE',
        'CERTIFICATION',
        'TRAINING',
        'OTHER',
      ]),
      status: z
        .enum(['NOT_STARTED', 'ON_TRACK', 'AT_RISK', 'BEHIND', 'ACHIEVED', 'CANCELLED', 'DEFERRED'])
        .optional(),
      policyCommitment: z.string().trim().optional(),
      isoClause: z.string().trim().optional(),
      linkedProcesses: z.string().trim().optional(),
      linkedRisks: z.string().trim().optional(),
      linkedOpportunities: z.string().trim().optional(),
      // KPI
      kpiDescription: z.string().trim().min(1).max(2000),
      baselineValue: z.number(),
      targetValue: z.number().nonnegative(),
      currentValue: z.number().nonnegative().optional(),
      unit: z.string().trim().min(1).max(200),
      // Ownership
      owner: z.string().trim().min(1).max(200),
      department: z.string().trim().min(1).max(200),
      targetDate: z
        .string()
        .trim()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      resourcesRequired: z.string().trim().optional(),
      // Progress
      progressNotes: z.string().trim().optional(),
      progressPercent: z.number().min(0).max(100).optional(),
      // AI
      aiAnalysis: z.string().trim().optional(),
      aiSmartScore: z.string().trim().optional(),
      aiKpiSuggestions: z.string().trim().optional(),
      aiMilestones: z.string().trim().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const objective = await prisma.qualObjective.create({
      data: {
        referenceNumber,
        title: data.title,
        objectiveStatement: data.objectiveStatement,
        category: data.category,
        status: (data.status as any) || 'NOT_STARTED',
        policyCommitment: data.policyCommitment,
        isoClause: data.isoClause,
        linkedProcesses: data.linkedProcesses,
        linkedRisks: data.linkedRisks,
        linkedOpportunities: data.linkedOpportunities,
        kpiDescription: data.kpiDescription,
        baselineValue: data.baselineValue,
        targetValue: data.targetValue,
        currentValue: data.currentValue,
        unit: data.unit,
        owner: data.owner,
        department: data.department,
        targetDate: new Date(data.targetDate),
        resourcesRequired: data.resourcesRequired,
        progressNotes: data.progressNotes,
        progressPercent: data.progressPercent ?? 0,
        aiAnalysis: data.aiAnalysis,
        aiSmartScore: data.aiSmartScore,
        aiKpiSuggestions: data.aiKpiSuggestions,
        aiMilestones: data.aiMilestones,
        aiGenerated: data.aiGenerated,
      },
      include: { milestones: { orderBy: { targetDate: 'asc' } } },
    });

    res.status(201).json({ success: true, data: objective });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create objective error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create objective' },
    });
  }
});

// PUT /:id — Update objective
router.put(
  '/:id',
  checkOwnership(prisma.qualObjective),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.qualObjective.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
      }

      const schema = z.object({
        title: z.string().trim().min(1).max(200).optional(),
        objectiveStatement: z.string().trim().optional(),
        category: z
          .enum([
            'CUSTOMER_SATISFACTION',
            'PRODUCT_QUALITY',
            'PROCESS_EFFICIENCY',
            'SUPPLIER_PERFORMANCE',
            'COMPLIANCE',
            'DEFECT_REDUCTION',
            'ON_TIME_DELIVERY',
            'AUDIT_PERFORMANCE',
            'IMPROVEMENT',
            'REVENUE',
            'CERTIFICATION',
            'TRAINING',
            'OTHER',
          ])
          .optional(),
        status: z
          .enum([
            'NOT_STARTED',
            'ON_TRACK',
            'AT_RISK',
            'BEHIND',
            'ACHIEVED',
            'CANCELLED',
            'DEFERRED',
          ])
          .optional(),
        policyCommitment: z.string().trim().optional(),
        isoClause: z.string().trim().optional(),
        linkedProcesses: z.string().trim().optional(),
        linkedRisks: z.string().trim().optional(),
        linkedOpportunities: z.string().trim().optional(),
        kpiDescription: z.string().trim().optional(),
        baselineValue: z.number().optional(),
        targetValue: z.number().nonnegative().optional(),
        currentValue: z.number().nonnegative().optional(),
        unit: z.string().trim().optional(),
        owner: z.string().trim().optional(),
        department: z.string().trim().optional(),
        targetDate: z
          .string()
          .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
          .optional(),
        resourcesRequired: z.string().trim().optional(),
        progressNotes: z.string().trim().optional(),
        progressPercent: z.number().min(0).max(100).optional(),
        aiAnalysis: z.string().trim().optional(),
        aiSmartScore: z.string().trim().optional(),
        aiKpiSuggestions: z.string().trim().optional(),
        aiMilestones: z.string().trim().optional(),
        aiGenerated: z.boolean().optional(),
      });

      const data = schema.parse(req.body);

      const objective = await prisma.qualObjective.update({
        where: { id: req.params.id },
        data: {
          ...data,
          targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        },
        include: { milestones: { orderBy: { targetDate: 'asc' } } },
      });

      res.json({ success: true, data: objective });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            fields: error.errors.map((e) => e.path.join('.')),
          },
        });
      }
      logger.error('Update objective error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update objective' },
      });
    }
  }
);

// DELETE /:id — Delete objective
router.delete(
  '/:id',
  checkOwnership(prisma.qualObjective),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.qualObjective.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
      }

      await prisma.qualObjective.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() } as any,
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Delete objective error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete objective' },
      });
    }
  }
);

// ============================================
// MILESTONES (nested under /:id/milestones)
// ============================================

// POST /:id/milestones — Create milestone
router.post('/:id/milestones', async (req: AuthRequest, res: Response) => {
  try {
    const objective = await prisma.qualObjective.findUnique({ where: { id: req.params.id } });
    if (!objective) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Objective not found' } });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      targetDate: z
        .string()
        .trim()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED']).optional(),
      notes: z.string().trim().optional(),
      completedDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
    });

    const data = schema.parse(req.body);

    const milestone = await prisma.qualMilestone.create({
      data: {
        objectiveId: req.params.id,
        title: data.title,
        targetDate: new Date(data.targetDate),
        status: (data.status as any) || 'PENDING',
        notes: data.notes,
        completedDate: data.completedDate ? new Date(data.completedDate) : undefined,
      },
    });

    res.status(201).json({ success: true, data: milestone });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create milestone error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create milestone' },
    });
  }
});

// PUT /:id/milestones/:milestoneId — Update milestone
router.put('/:id/milestones/:milestoneId', async (req: AuthRequest, res: Response) => {
  try {
    const existingMilestone = await prisma.qualMilestone.findFirst({
      where: { id: req.params.milestoneId, objectiveId: req.params.id },
    });
    if (!existingMilestone) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200).optional(),
      targetDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED']).optional(),
      notes: z.string().trim().optional(),
      completedDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
    });

    const data = schema.parse(req.body);

    const milestone = await prisma.qualMilestone.update({
      where: { id: req.params.milestoneId },
      data: {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        completedDate: data.completedDate
          ? new Date(data.completedDate)
          : data.status === 'COMPLETED'
            ? new Date()
            : undefined,
      },
    });

    res.json({ success: true, data: milestone });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Update milestone error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update milestone' },
    });
  }
});

// DELETE /:id/milestones/:milestoneId — Delete milestone
router.delete('/:id/milestones/:milestoneId', async (req: AuthRequest, res: Response) => {
  try {
    const existingMilestone = await prisma.qualMilestone.findFirst({
      where: { id: req.params.milestoneId, objectiveId: req.params.id },
    });
    if (!existingMilestone) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Milestone not found' } });
    }

    await prisma.qualMilestone.update({
      where: { id: req.params.milestoneId },
      data: { deletedAt: new Date() } as any,
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete milestone error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete milestone' },
    });
  }
});

export default router;
