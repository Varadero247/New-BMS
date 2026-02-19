import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-medical');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// HELPERS
// ============================================

const DESIGN_STAGE_ORDER: string[] = [
  'PLANNING',
  'INPUTS',
  'OUTPUTS',
  'REVIEW',
  'VERIFICATION',
  'VALIDATION',
  'TRANSFER',
  'COMPLETE',
];

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `DC-${yy}${mm}`;

  const count = await prisma.designProject.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// 1. GET / - List design projects
// ============================================
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, deviceClass, stage, search } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (deviceClass) where.deviceClass = deviceClass;
    if (stage) where.currentStage = stage;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { deviceName: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.designProject.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.designProject.count({ where }),
    ]);

    res.json({
      success: true,
      data: projects,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List design projects error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list design projects' },
    });
  }
});

// ============================================
// 2. GET /:id - Get project with all relations
// ============================================
router.get(
  '/:id',
  checkOwnership(prisma.designProject),
  async (req: AuthRequest, res: Response) => {
    try {
      const project = await prisma.designProject.findUnique({
        where: { id: req.params.id },
        include: {
          inputs: true,
          outputs: true,
          reviews: { orderBy: { reviewDate: 'desc' } },
          verifications: true,
          validations: true,
          transfers: true,
          historyFiles: { orderBy: { createdAt: 'desc' } },
        },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Design project not found' },
        });
      }

      res.json({ success: true, data: project });
    } catch (error) {
      logger.error('Get design project error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get design project' },
      });
    }
  }
);

// ============================================
// 3. POST / - Create design project
// ============================================
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      deviceName: z.string().trim().min(1).max(200),
      deviceClass: z.enum(['CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IIA', 'CLASS_IIB']),
      intendedUse: z.string().trim().min(1).max(200),
      patientPopulation: z.string().trim().optional(),
      regulatoryPathway: z.string().trim().optional(),
      projectLead: z.string().trim().min(1).max(200),
      teamMembers: z.array(z.string().trim()).optional().default([]),
      startDate: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      targetDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      status: z.enum(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    const project = await prisma.designProject.create({
      data: {
        refNumber,
        title: data.title,
        deviceName: data.deviceName,
        deviceClass: data.deviceClass,
        intendedUse: data.intendedUse,
        patientPopulation: data.patientPopulation,
        regulatoryPathway: data.regulatoryPathway,
        currentStage: 'PLANNING',
        status: data.status || 'ACTIVE',
        projectLead: data.projectLead,
        teamMembers: data.teamMembers,
        startDate: new Date(data.startDate),
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: project });
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
    logger.error('Create design project error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create design project' },
    });
  }
});

// ============================================
// 4. PUT /:id - Update project
// ============================================
router.put(
  '/:id',
  checkOwnership(prisma.designProject),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.designProject.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Design project not found' },
        });
      }

      const schema = z.object({
        title: z.string().trim().min(1).max(200).optional(),
        deviceName: z.string().trim().min(1).max(200).optional(),
        deviceClass: z
          .enum(['CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IIA', 'CLASS_IIB'])
          .optional(),
        intendedUse: z.string().trim().min(1).max(200).optional(),
        patientPopulation: z.string().trim().optional(),
        regulatoryPathway: z.string().trim().optional(),
        currentStage: z
          .enum([
            'PLANNING',
            'INPUTS',
            'OUTPUTS',
            'REVIEW',
            'VERIFICATION',
            'VALIDATION',
            'TRANSFER',
            'COMPLETE',
          ])
          .optional(),
        status: z.enum(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
        projectLead: z.string().trim().min(1).max(200).optional(),
        teamMembers: z.array(z.string().trim()).optional(),
        startDate: z
          .string()
          .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
          .optional(),
        targetDate: z
          .string()
          .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
          .optional(),
        completedDate: z
          .string()
          .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
          .optional(),
      });

      const data = schema.parse(req.body);

      const updateData: Record<string, unknown> = { ...data };
      if (data.startDate) updateData.startDate = new Date(data.startDate);
      if (data.targetDate) updateData.targetDate = new Date(data.targetDate);
      if (data.completedDate) updateData.completedDate = new Date(data.completedDate);

      const project = await prisma.designProject.update({
        where: { id: req.params.id },
        data: updateData,
      });

      res.json({ success: true, data: project });
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
      logger.error('Update design project error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update design project' },
      });
    }
  }
);

// ============================================
// 5. DELETE /:id - Soft delete project
// ============================================
router.delete(
  '/:id',
  checkOwnership(prisma.designProject),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.designProject.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Design project not found' },
        });
      }

      await prisma.designProject.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Delete design project error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete design project' },
      });
    }
  }
);

// ============================================
// 6. POST /:id/inputs - Add design input
// ============================================
router.post('/:id/inputs', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.designProject.findUnique({ where: { id: req.params.id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Design project not found' },
      });
    }

    const schema = z.object({
      category: z.enum([
        'FUNCTIONAL',
        'PERFORMANCE',
        'SAFETY',
        'REGULATORY',
        'USER_NEED',
        'ENVIRONMENTAL',
        'INTERFACE',
        'STANDARDS',
      ]),
      requirement: z.string().trim().min(1).max(200),
      source: z.string().trim().min(1).max(200),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      traceToOutput: z.string().trim().optional(),
      traceToVerification: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const input = await prisma.designInput.create({
      data: {
        projectId: req.params.id,
        category: data.category,
        requirement: data.requirement,
        source: data.source,
        priority: data.priority || 'MEDIUM',
        traceToOutput: data.traceToOutput,
        traceToVerification: data.traceToVerification,
      },
    });

    res.status(201).json({ success: true, data: input });
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
    logger.error('Create design input error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create design input' },
    });
  }
});

// ============================================
// 7. POST /:id/outputs - Add design output
// ============================================
router.post('/:id/outputs', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.designProject.findUnique({ where: { id: req.params.id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Design project not found' },
      });
    }

    const schema = z.object({
      category: z.enum([
        'DRAWING',
        'SPECIFICATION',
        'SOFTWARE',
        'LABELLING',
        'MANUFACTURING',
        'ACCEPTANCE_CRITERIA',
        'PACKAGING',
        'RISK_ANALYSIS',
      ]),
      description: z.string().trim().min(1).max(2000),
      documentRef: z.string().trim().optional(),
      acceptanceCriteria: z.string().trim().min(1).max(200),
      traceToInput: z.string().trim().optional(),
      status: z.enum(['DRAFT', 'REVIEWED', 'APPROVED', 'SUPERSEDED']).optional(),
    });

    const data = schema.parse(req.body);

    const output = await prisma.designOutput.create({
      data: {
        projectId: req.params.id,
        category: data.category,
        description: data.description,
        documentRef: data.documentRef,
        acceptanceCriteria: data.acceptanceCriteria,
        traceToInput: data.traceToInput,
        status: data.status || 'DRAFT',
      },
    });

    res.status(201).json({ success: true, data: output });
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
    logger.error('Create design output error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create design output' },
    });
  }
});

// ============================================
// 8. POST /:id/reviews - Add design review
// ============================================
router.post('/:id/reviews', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.designProject.findUnique({ where: { id: req.params.id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Design project not found' },
      });
    }

    const schema = z.object({
      stage: z.enum([
        'PLANNING',
        'INPUTS',
        'OUTPUTS',
        'REVIEW',
        'VERIFICATION',
        'VALIDATION',
        'TRANSFER',
        'COMPLETE',
      ]),
      reviewDate: z
        .string()
        .trim()
        .min(1)
        .max(2000)
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      reviewers: z.array(z.string().trim()).min(1),
      decision: z.enum(['APPROVED', 'APPROVED_WITH_CONDITIONS', 'NEEDS_REWORK', 'REJECTED']),
      minutes: z.string().trim().optional(),
      actionItems: z.string().trim().optional(),
      nextReviewDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
    });

    const data = schema.parse(req.body);

    const review = await prisma.designReview.create({
      data: {
        projectId: req.params.id,
        stage: data.stage,
        reviewDate: new Date(data.reviewDate),
        reviewers: data.reviewers,
        decision: data.decision,
        minutes: data.minutes,
        actionItems: data.actionItems,
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : null,
      },
    });

    res.status(201).json({ success: true, data: review });
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
    logger.error('Create design review error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create design review' },
    });
  }
});

// ============================================
// 9. POST /:id/verifications - Add verification
// ============================================
router.post('/:id/verifications', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.designProject.findUnique({ where: { id: req.params.id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Design project not found' },
      });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      protocol: z.string().trim().optional(),
      testMethod: z.string().trim().min(1).max(200),
      acceptanceCriteria: z.string().trim().min(1).max(200),
      results: z.string().trim().optional(),
      pass: z.boolean().optional(),
      completedDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      completedBy: z.string().trim().optional(),
      traceToInput: z.string().trim().optional(),
      traceToOutput: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const verification = await prisma.designVerification.create({
      data: {
        projectId: req.params.id,
        title: data.title,
        protocol: data.protocol,
        testMethod: data.testMethod,
        acceptanceCriteria: data.acceptanceCriteria,
        results: data.results,
        pass: data.pass,
        completedDate: data.completedDate ? new Date(data.completedDate) : null,
        completedBy: data.completedBy,
        traceToInput: data.traceToInput,
        traceToOutput: data.traceToOutput,
      },
    });

    res.status(201).json({ success: true, data: verification });
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
    logger.error('Create design verification error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create design verification' },
    });
  }
});

// ============================================
// 10. POST /:id/validations - Add validation
// ============================================
router.post('/:id/validations', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.designProject.findUnique({ where: { id: req.params.id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Design project not found' },
      });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      protocol: z.string().trim().optional(),
      testMethod: z.string().trim().min(1).max(200),
      intendedUseConfirmed: z.boolean().optional(),
      results: z.string().trim().optional(),
      pass: z.boolean().optional(),
      completedDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      completedBy: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const validation = await prisma.designValidation.create({
      data: {
        projectId: req.params.id,
        title: data.title,
        protocol: data.protocol,
        testMethod: data.testMethod,
        intendedUseConfirmed: data.intendedUseConfirmed ?? false,
        results: data.results,
        pass: data.pass,
        completedDate: data.completedDate ? new Date(data.completedDate) : null,
        completedBy: data.completedBy,
      },
    });

    res.status(201).json({ success: true, data: validation });
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
    logger.error('Create design validation error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create design validation' },
    });
  }
});

// ============================================
// 11. POST /:id/stages/:stage/review - Stage gate review
// ============================================
router.post('/:id/stages/:stage/review', async (req: AuthRequest, res: Response) => {
  try {
    const { id, stage } = req.params;

    const project = await prisma.designProject.findUnique({ where: { id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Design project not found' },
      });
    }

    // Validate stage is a valid DesignStage
    if (!DESIGN_STAGE_ORDER.includes(stage)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Invalid stage: ${stage}` },
      });
    }

    const schema = z.object({
      reviewers: z.array(z.string().trim()).min(1),
      decision: z.enum(['APPROVED', 'APPROVED_WITH_CONDITIONS', 'NEEDS_REWORK', 'REJECTED']),
      minutes: z.string().trim().optional(),
      actionItems: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    // Create the review record
    const review = await prisma.designReview.create({
      data: {
        projectId: id,
        stage: stage as any,
        reviewDate: new Date(),
        reviewers: data.reviewers,
        decision: data.decision,
        minutes: data.minutes,
        actionItems: data.actionItems,
      },
    });

    // If approved, advance to next stage
    let updatedProject = project;
    if (data.decision === 'APPROVED' || data.decision === 'APPROVED_WITH_CONDITIONS') {
      const currentIndex = DESIGN_STAGE_ORDER.indexOf(project.currentStage);
      const targetIndex = DESIGN_STAGE_ORDER.indexOf(stage);

      // Only advance if reviewing the current stage
      if (targetIndex === currentIndex && currentIndex < DESIGN_STAGE_ORDER.length - 1) {
        const nextStage = DESIGN_STAGE_ORDER[currentIndex + 1];
        updatedProject = await prisma.designProject.update({
          where: { id },
          data: {
            currentStage: nextStage as any,
            completedDate: nextStage === 'COMPLETE' ? new Date() : null,
            status: nextStage === 'COMPLETE' ? 'COMPLETED' : project.status,
          },
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        review,
        project: updatedProject,
        stageAdvanced: updatedProject.currentStage !== project.currentStage,
      },
    });
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
    logger.error('Stage gate review error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to perform stage gate review' },
    });
  }
});

// ============================================
// 12. GET /:id/traceability-matrix - Build traceability matrix
// ============================================
router.get('/:id/traceability-matrix', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.designProject.findUnique({
      where: { id: req.params.id },
      include: {
        inputs: true,
        outputs: true,
        verifications: true,
        validations: true,
      },
    });

    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Design project not found' },
      });
    }

    // Build traceability matrix: input -> output -> verification -> validation
    const matrix = project.inputs.map((input) => {
      const linkedOutputs = project.outputs.filter((o) => o.traceToInput === input.id);

      const linkedVerifications = project.verifications.filter(
        (v) => v.traceToInput === input.id || linkedOutputs.some((o) => v.traceToOutput === o.id)
      );

      const linkedValidations = project.validations;

      return {
        input: {
          id: input.id,
          category: input.category,
          requirement: input.requirement,
          source: input.source,
          priority: input.priority,
          verified: input.verified,
        },
        outputs: linkedOutputs.map((o) => ({
          id: o.id,
          category: o.category,
          description: o.description,
          status: o.status,
        })),
        verifications: linkedVerifications.map((v) => ({
          id: v.id,
          title: v.title,
          testMethod: v.testMethod,
          pass: v.pass,
          completedDate: v.completedDate,
        })),
        validations: linkedValidations.map((v) => ({
          id: v.id,
          title: v.title,
          testMethod: v.testMethod,
          pass: v.pass,
          intendedUseConfirmed: v.intendedUseConfirmed,
          completedDate: v.completedDate,
        })),
        coverage: {
          hasOutput: linkedOutputs.length > 0,
          hasVerification: linkedVerifications.length > 0,
          hasValidation: linkedValidations.length > 0,
          isComplete:
            linkedOutputs.length > 0 &&
            linkedVerifications.length > 0 &&
            linkedValidations.length > 0,
        },
      };
    });

    // Summary statistics
    const summary = {
      totalInputs: project.inputs.length,
      totalOutputs: project.outputs.length,
      totalVerifications: project.verifications.length,
      totalValidations: project.validations.length,
      inputsCovered: matrix.filter((m) => m.coverage.isComplete).length,
      inputsPartial: matrix.filter(
        (m) => !m.coverage.isComplete && (m.coverage.hasOutput || m.coverage.hasVerification)
      ).length,
      inputsUncovered: matrix.filter((m) => !m.coverage.hasOutput && !m.coverage.hasVerification)
        .length,
      verificationsPassed: project.verifications.filter((v) => v.pass === true).length,
      verificationsFailed: project.verifications.filter((v) => v.pass === false).length,
      verificationsPending: project.verifications.filter((v) => v.pass === null).length,
      validationsPassed: project.validations.filter((v) => v.pass === true).length,
      validationsFailed: project.validations.filter((v) => v.pass === false).length,
      validationsPending: project.validations.filter((v) => v.pass === null).length,
    };

    res.json({
      success: true,
      data: {
        projectId: project.id,
        refNumber: project.refNumber,
        deviceName: project.deviceName,
        currentStage: project.currentStage,
        matrix,
        summary,
      },
    });
  } catch (error) {
    logger.error('Traceability matrix error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to build traceability matrix' },
    });
  }
});

// ============================================
// 13. POST /:id/transfer - Design transfer approval
// ============================================
router.post('/:id/transfer', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.designProject.findUnique({ where: { id: req.params.id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Design project not found' },
      });
    }

    const schema = z.object({
      dhfComplete: z.boolean(),
      mfgReadiness: z.boolean(),
      qaApproval: z.boolean(),
      raApproval: z.boolean(),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    // Determine transfer status based on approvals
    const allApproved = data.dhfComplete && data.mfgReadiness && data.qaApproval && data.raApproval;
    const status = allApproved ? 'COMPLETED' : 'IN_PROGRESS';

    const transfer = await prisma.designTransfer.create({
      data: {
        projectId: req.params.id,
        transferDate: allApproved ? new Date() : null,
        dhfComplete: data.dhfComplete,
        mfgReadiness: data.mfgReadiness,
        qaApproval: data.qaApproval,
        raApproval: data.raApproval,
        notes: data.notes,
        status: status as any,
      },
    });

    // If all approvals granted and project is at TRANSFER stage, advance to COMPLETE
    let updatedProject = project;
    if (allApproved && project.currentStage === 'TRANSFER') {
      updatedProject = await prisma.designProject.update({
        where: { id: req.params.id },
        data: {
          currentStage: 'COMPLETE',
          status: 'COMPLETED',
          completedDate: new Date(),
        },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        transfer,
        project: updatedProject,
        allApproved,
      },
    });
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
    logger.error('Design transfer error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create design transfer' },
    });
  }
});

// ============================================
// 14. POST /:id/dhf - Add design history file
// ============================================
router.post('/:id/dhf', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.designProject.findUnique({ where: { id: req.params.id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Design project not found' },
      });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      category: z.enum([
        'DESIGN_PLAN',
        'USER_NEEDS',
        'DESIGN_INPUT',
        'DESIGN_OUTPUT',
        'DESIGN_REVIEW',
        'VERIFICATION_PROTOCOL',
        'VERIFICATION_RESULT',
        'VALIDATION_PROTOCOL',
        'VALIDATION_RESULT',
        'RISK_MANAGEMENT',
        'TRANSFER_RECORD',
        'CHANGE_ORDER',
        'OTHER',
      ]),
      documentRef: z.string().trim().min(1).max(200),
      version: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const dhf = await prisma.designHistoryFile.create({
      data: {
        projectId: req.params.id,
        title: data.title,
        category: data.category,
        documentRef: data.documentRef,
        version: data.version || '1.0',
        uploadedBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: dhf });
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
    logger.error('Create DHF entry error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create design history file entry' },
    });
  }
});

export default router;
