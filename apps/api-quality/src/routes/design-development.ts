import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-quality');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// =============================================
// Constants
// =============================================

const STAGES = [
  'PLANNING',
  'INPUTS',
  'OUTPUTS',
  'REVIEW',
  'VERIFICATION',
  'VALIDATION',
  'TRANSFER',
] as const;

const STAGE_STATUSES = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'SUBMITTED',
  'APPROVED',
] as const;

const PROJECT_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
] as const;

// =============================================
// Reference number generator
// =============================================

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `DD-${yy}${mm}`;
  const count = await (prisma as any).designDevelopment.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// =============================================
// POST / — Create design project
// =============================================

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1),
      description: z.string().optional(),
      productName: z.string().trim().min(1),
      projectManager: z.string().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      plannedStartDate: z.string().optional(),
      plannedEndDate: z.string().optional(),
      requirements: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    const project = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await (tx as any).designDevelopment.create({
        data: {
          refNumber,
          title: data.title,
          description: data.description,
          productName: data.productName,
          projectManager: data.projectManager,
          priority: data.priority || 'MEDIUM',
          status: 'DRAFT',
          currentStage: 'PLANNING',
          plannedStartDate: data.plannedStartDate ? new Date(data.plannedStartDate) : undefined,
          plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : undefined,
          requirements: data.requirements,
          createdBy: req.user!.id,
        },
      });

      // Create initial stage records for all 7 stages
      for (const stage of STAGES) {
        await (tx as any).designStage.create({
          data: {
            projectId: created.id,
            stage,
            status: stage === 'PLANNING' ? 'IN_PROGRESS' : 'NOT_STARTED',
            createdBy: req.user!.id,
          },
        });
      }

      return created;
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create design project error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create design project' } });
  }
});

// =============================================
// GET / — List projects with filters
// =============================================

router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, stage, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status as string;
    if (stage) where.currentStage = stage as string;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { productName: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      (prisma as any).designDevelopment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      (prisma as any).designDevelopment.count({ where }),
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
    logger.error('List design projects error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list design projects' } });
  }
});

// =============================================
// GET /:id — Get project with all stage data
// =============================================

router.get('/:id', checkOwnership((prisma as any).designDevelopment), async (req: AuthRequest, res: Response) => {
  try {
    const project = await (prisma as any).designDevelopment.findUnique({
      where: { id: req.params.id },
    });

    if (!project || project.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Design project not found' } });
    }

    const stages = await (prisma as any).designStage.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'asc' },
      take: 1000});

    res.json({ success: true, data: { ...project, stages } });
  } catch (error) {
    logger.error('Get design project error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get design project' } });
  }
});

// =============================================
// PUT /:id — Update project
// =============================================

router.put('/:id', checkOwnership((prisma as any).designDevelopment), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await (prisma as any).designDevelopment.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Design project not found' } });
    }

    const schema = z.object({
      title: z.string().trim().min(1).optional(),
      description: z.string().optional(),
      productName: z.string().trim().min(1).optional(),
      projectManager: z.string().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      status: z.enum(['DRAFT', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
      plannedStartDate: z.string().optional(),
      plannedEndDate: z.string().optional(),
      requirements: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.productName !== undefined) updateData.productName = data.productName;
    if (data.projectManager !== undefined) updateData.projectManager = data.projectManager;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.plannedStartDate !== undefined) updateData.plannedStartDate = new Date(data.plannedStartDate);
    if (data.plannedEndDate !== undefined) updateData.plannedEndDate = new Date(data.plannedEndDate);
    if (data.requirements !== undefined) updateData.requirements = data.requirements;

    const project = await (prisma as any).designDevelopment.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update design project error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update design project' } });
  }
});

// =============================================
// POST /:id/stages/:stage/submit — Submit stage for review
// =============================================

router.post('/:id/stages/:stage/submit', checkOwnership((prisma as any).designDevelopment), async (req: AuthRequest, res: Response) => {
  try {
    const { id, stage } = req.params;

    if (!STAGES.includes(stage as any)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STAGE', message: `Invalid stage: ${stage}` } });
    }

    const project = await (prisma as any).designDevelopment.findUnique({ where: { id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Design project not found' } });
    }

    const schema = z.object({
      deliverables: z.string().optional(),
      notes: z.string().optional(),
      attachments: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const stageRecord = await (prisma as any).designStage.findFirst({
      where: { projectId: id, stage: stage as string },
    });

    if (!stageRecord) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Stage record not found' } });
    }

    if (stageRecord.status === 'APPROVED') {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_APPROVED', message: 'Stage is already approved' } });
    }

    const updated = await (prisma as any).designStage.update({
      where: { id: stageRecord.id },
      data: {
        status: 'SUBMITTED',
        deliverables: data.deliverables,
        notes: data.notes,
        attachments: data.attachments,
        submittedBy: req.user!.id,
        submittedAt: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Submit design stage error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit design stage' } });
  }
});

// =============================================
// POST /:id/stages/:stage/approve — Approve stage gate
// =============================================

router.post('/:id/stages/:stage/approve', checkOwnership((prisma as any).designDevelopment), async (req: AuthRequest, res: Response) => {
  try {
    const { id, stage } = req.params;

    if (!STAGES.includes(stage as any)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STAGE', message: `Invalid stage: ${stage}` } });
    }

    const project = await (prisma as any).designDevelopment.findUnique({ where: { id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Design project not found' } });
    }

    const schema = z.object({
      approvalNotes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const stageRecord = await (prisma as any).designStage.findFirst({
      where: { projectId: id, stage: stage as string },
    });

    if (!stageRecord) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Stage record not found' } });
    }

    if (stageRecord.status !== 'SUBMITTED') {
      return res.status(400).json({ success: false, error: { code: 'NOT_SUBMITTED', message: 'Stage must be submitted before approval' } });
    }

    // Approve the stage and advance to the next
    const stageIdx = STAGES.indexOf(stage as any);
    const nextStage = stageIdx < STAGES.length - 1 ? STAGES[stageIdx + 1] : null;

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const approvedStage = await (tx as any).designStage.update({
        where: { id: stageRecord.id },
        data: {
          status: 'APPROVED',
          approvedBy: req.user!.id,
          approvedAt: new Date(),
          approvalNotes: data.approvalNotes,
        },
      });

      // Advance project to next stage
      const projectUpdate: Record<string, unknown> = {};
      if (nextStage) {
        projectUpdate.currentStage = nextStage;

        // Set next stage to IN_PROGRESS
        await (tx as any).designStage.update({
          where: { id: (await (tx as any).designStage.findFirst({ where: { projectId: id, stage: nextStage } })).id },
          data: { status: 'IN_PROGRESS' },
        });
      } else {
        // All stages completed
        projectUpdate.status = 'COMPLETED';
        projectUpdate.completedAt = new Date();
      }

      await (tx as any).designDevelopment.update({
        where: { id },
        data: projectUpdate,
      });

      return approvedStage;
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Approve design stage error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve design stage' } });
  }
});

// =============================================
// DELETE /:id — Soft delete
// =============================================

router.delete('/:id', checkOwnership((prisma as any).designDevelopment), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await (prisma as any).designDevelopment.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Design project not found' } });
    }

    await (prisma as any).designDevelopment.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), deletedBy: req.user!.id },
    });

    res.json({ success: true, data: { message: 'Design project deleted' } });
  } catch (error) {
    logger.error('Delete design project error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete design project' } });
  }
});

export default router;
