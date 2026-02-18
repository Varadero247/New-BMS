import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-automotive');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// APQP Standard Deliverables per Phase (AIAG)
// ============================================

const APQP_DELIVERABLES: Record<number, string[]> = {
  1: [
    'Design Goals',
    'Reliability and Quality Goals',
    'Preliminary Bill of Materials',
    'Preliminary Process Flow Chart',
    'Preliminary Special Characteristics',
    'Product Assurance Plan',
    'Management Support',
  ],
  2: [
    'DFMEA',
    'Design for Manufacturability and Assembly',
    'Design Verification Plan',
    'Prototype Control Plan',
    'Engineering Drawings',
    'Engineering Specifications',
    'Material Specifications',
    'Drawing and Specification Changes',
    'New Equipment, Tooling, and Facilities Requirements',
    'Special Product and Process Characteristics',
    'Prototype Builds',
    'Engineering Performance Tests',
    'Design Review',
    'Management Support',
  ],
  3: [
    'Packaging Standards and Specifications',
    'Process Flow Chart',
    'Floor Plan Layout',
    'Characteristics Matrix',
    'PFMEA',
    'Pre-Launch Control Plan',
    'Process Instructions',
    'Measurement Systems Analysis Plan',
    'Preliminary Process Capability Study Plan',
    'Management Support',
  ],
  4: [
    'Production Trial Run',
    'Measurement Systems Analysis Results',
    'Preliminary Process Capability Study',
    'Production Part Approval (PPAP)',
    'Production Validation Testing',
    'Packaging Evaluation',
    'Production Control Plan',
    'Management Support',
  ],
  5: [
    'Reduced Variation',
    'Customer Satisfaction',
    'Delivery and Service',
    'Lessons Learned',
  ],
};

const PHASE_NAMES: Record<number, string> = {
  1: 'Plan and Define Program',
  2: 'Product Design and Development',
  3: 'Process Design and Development',
  4: 'Product and Process Validation',
  5: 'Feedback Assessment and Corrective Action',
};

// Helper: generate APQP reference number APQP-YYMM-XXXX
async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `APQP-${yy}${mm}`;

  const count = await prisma.apqpProject.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// GET / - List APQP projects
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, customer, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (customer) where.customer = { contains: customer as string, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { partNumber: { contains: search as string, mode: 'insensitive' } },
        { partName: { contains: search as string, mode: 'insensitive' } },
        { customer: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.apqpProject.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.apqpProject.count({ where }),
    ]);

    res.json({
      success: true,
      data: projects,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List APQP projects error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list APQP projects' } });
  }
});

// GET /:id - Get project with phases and deliverables
router.get('/:id', checkOwnership(prisma.apqpProject), async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.apqpProject.findUnique({
      where: { id: req.params.id },
      include: {
        phases: {
          include: {
            deliverables: true,
            gateReview: true,
          },
          orderBy: { phaseNumber: 'asc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'APQP project not found' } });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    logger.error('Get APQP project error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get APQP project' } });
  }
});

// POST / - Create APQP project with auto-generated phases and deliverables
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      partNumber: z.string().min(1),
      partName: z.string().min(1),
      customer: z.string().min(1),
      programName: z.string().optional(),
      startDate: z.string(),
      targetDate: z.string(),
      teamLeader: z.string().min(1),
      teamMembers: z.array(z.string()).optional().default([]),
      status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    // Create project with phases and deliverables in a transaction
    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.apqpProject.create({
        data: {
          refNumber,
          title: data.title,
          partNumber: data.partNumber,
          partName: data.partName,
          customer: data.customer,
          programName: data.programName,
          status: data.status || 'PLANNING',
          currentPhase: 1,
          startDate: new Date(data.startDate),
          targetDate: new Date(data.targetDate),
          teamLeader: data.teamLeader,
          teamMembers: data.teamMembers,
          createdBy: req.user?.id,
        },
      });

      // Create 5 APQP phases with standard deliverables
      for (let phaseNum = 1; phaseNum <= 5; phaseNum++) {
        const phase = await tx.apqpPhase.create({
          data: {
            projectId: newProject.id,
            phaseNumber: phaseNum,
            phaseName: PHASE_NAMES[phaseNum],
            status: phaseNum === 1 ? 'IN_PROGRESS' : 'NOT_STARTED',
          },
        });

        // Create deliverables for this phase
        const deliverableNames = APQP_DELIVERABLES[phaseNum] || [];
        for (const name of deliverableNames) {
          await tx.apqpDeliverable.create({
            data: {
              phaseId: phase.id,
              name,
              required: true,
              status: 'NOT_STARTED',
            },
          });
        }
      }

      // Return the full project with phases and deliverables
      return tx.apqpProject.findUnique({
        where: { id: newProject.id },
        include: {
          phases: {
            include: {
              deliverables: true,
              gateReview: true,
            },
            orderBy: { phaseNumber: 'asc' },
          },
        },
      });
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create APQP project error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create APQP project' } });
  }
});

// PUT /:id - Update APQP project
router.put('/:id', checkOwnership(prisma.apqpProject), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.apqpProject.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'APQP project not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      partNumber: z.string().min(1).optional(),
      partName: z.string().min(1).optional(),
      customer: z.string().min(1).optional(),
      programName: z.string().optional(),
      status: z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
      targetDate: z.string().optional(),
      completedDate: z.string().optional(),
      teamLeader: z.string().min(1).optional(),
      teamMembers: z.array(z.string()).optional(),
    });

    const data = schema.parse(req.body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.targetDate) updateData.targetDate = new Date(data.targetDate);
    if (data.completedDate) updateData.completedDate = new Date(data.completedDate);
    if (data.status === 'COMPLETED' && !data.completedDate) {
      updateData.completedDate = new Date();
    }

    const project = await prisma.apqpProject.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update APQP project error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update APQP project' } });
  }
});

// DELETE /:id - Soft delete APQP project
router.delete('/:id', checkOwnership(prisma.apqpProject), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.apqpProject.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'APQP project not found' } });
    }

    await prisma.apqpProject.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete APQP project error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete APQP project' } });
  }
});

// POST /:id/phases/:phaseNum/gate-review - Submit phase gate review
router.post('/:id/phases/:phaseNum/gate-review', async (req: AuthRequest, res: Response) => {
  try {
    const { id, phaseNum } = req.params;
    const phaseNumber = parseInt(phaseNum, 10);

    if (isNaN(phaseNumber) || phaseNumber < 1 || phaseNumber > 5) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Phase number must be between 1 and 5' } });
    }

    const schema = z.object({
      reviewDate: z.string(),
      reviewers: z.array(z.string()).min(1),
      decision: z.enum(['APPROVED', 'APPROVED_WITH_CONDITIONS', 'REJECTED', 'DEFERRED']),
      conditions: z.string().optional(),
      notes: z.string().optional(),
      nextActions: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Find the phase
    const phase = await prisma.apqpPhase.findFirst({
      where: { projectId: id, phaseNumber },
    });

    if (!phase) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Phase not found' } });
    }

    // Check if gate review already exists
    const existingReview = await prisma.apqpGateReview.findUnique({
      where: { phaseId: phase.id },
    });

    let gateReview;
    if (existingReview) {
      // Update existing gate review
      gateReview = await prisma.apqpGateReview.update({
        where: { id: existingReview.id },
        data: {
          reviewDate: new Date(data.reviewDate),
          reviewers: data.reviewers,
          decision: data.decision,
          conditions: data.conditions,
          notes: data.notes,
          nextActions: data.nextActions,
        },
      });
    } else {
      // Create new gate review
      gateReview = await prisma.apqpGateReview.create({
        data: {
          phaseId: phase.id,
          reviewDate: new Date(data.reviewDate),
          reviewers: data.reviewers,
          decision: data.decision,
          conditions: data.conditions,
          notes: data.notes,
          nextActions: data.nextActions,
        },
      });
    }

    // If APPROVED, mark phase as COMPLETED and advance currentPhase
    if (data.decision === 'APPROVED') {
      await prisma.apqpPhase.update({
        where: { id: phase.id },
        data: { status: 'COMPLETED', completedDate: new Date() },
      });

      // Advance project to next phase
      const project = await prisma.apqpProject.findUnique({ where: { id } });
      if (project && phaseNumber === project.currentPhase && phaseNumber < 5) {
        await prisma.apqpProject.update({
          where: { id },
          data: {
            currentPhase: phaseNumber + 1,
            status: 'IN_PROGRESS',
          },
        });

        // Start the next phase
        const nextPhase = await prisma.apqpPhase.findFirst({
          where: { projectId: id, phaseNumber: phaseNumber + 1 },
        });
        if (nextPhase) {
          await prisma.apqpPhase.update({
            where: { id: nextPhase.id },
            data: { status: 'IN_PROGRESS', startDate: new Date() },
          });
        }
      } else if (project && phaseNumber === 5) {
        // All phases complete
        await prisma.apqpProject.update({
          where: { id },
          data: { status: 'COMPLETED', completedDate: new Date() },
        });
      }
    }

    res.status(201).json({ success: true, data: gateReview });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Gate review error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit gate review' } });
  }
});

// PUT /:id/deliverables/:did - Update deliverable status
router.put('/:id/deliverables/:did', async (req: AuthRequest, res: Response) => {
  try {
    const { id, did } = req.params;

    // Verify project exists
    const project = await prisma.apqpProject.findUnique({ where: { id } });
    if (!project || project.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'APQP project not found' } });
    }

    // Find deliverable and verify it belongs to this project
    const deliverable = await prisma.apqpDeliverable.findUnique({
      where: { id: did },
      include: { phase: true },
    });

    if (!deliverable || deliverable.phase.projectId !== id) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Deliverable not found' } });
    }

    const schema = z.object({
      status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'NOT_APPLICABLE', 'BLOCKED']).optional(),
      assignedTo: z.string().optional(),
      dueDate: z.string().optional(),
      completedDate: z.string().optional(),
      documentRef: z.string().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.completedDate) updateData.completedDate = new Date(data.completedDate);
    if (data.documentRef !== undefined) updateData.documentRef = data.documentRef;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Auto-set completedDate when status becomes COMPLETED
    if (data.status === 'COMPLETED' && !data.completedDate) {
      updateData.completedDate = new Date();
    }

    const updated = await prisma.apqpDeliverable.update({
      where: { id: did },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update deliverable error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update deliverable' } });
  }
});

// GET /:id/status-report - APQP status summary with phase completion percentages
router.get('/:id/status-report', async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.apqpProject.findUnique({
      where: { id: req.params.id },
      include: {
        phases: {
          include: {
            deliverables: true,
            gateReview: true,
          },
          orderBy: { phaseNumber: 'asc' },
        },
      },
    });

    if (!project || project.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'APQP project not found' } });
    }

    const phaseReports = project.phases.map((phase) => {
      const totalDeliverables = phase.deliverables.length;
      const completedDeliverables = phase.deliverables.filter(
        (d) => d.status === 'COMPLETED' || d.status === 'NOT_APPLICABLE'
      ).length;
      const inProgressDeliverables = phase.deliverables.filter(
        (d) => d.status === 'IN_PROGRESS'
      ).length;
      const blockedDeliverables = phase.deliverables.filter(
        (d) => d.status === 'BLOCKED'
      ).length;
      const completionPercentage = totalDeliverables > 0
        ? Math.round((completedDeliverables / totalDeliverables) * 100)
        : 0;

      return {
        phaseNumber: phase.phaseNumber,
        phaseName: phase.phaseName,
        status: phase.status,
        completionPercentage,
        totalDeliverables,
        completedDeliverables,
        inProgressDeliverables,
        blockedDeliverables,
        gateReview: phase.gateReview
          ? {
              decision: phase.gateReview.decision,
              reviewDate: phase.gateReview.reviewDate,
              conditions: phase.gateReview.conditions,
            }
          : null,
      };
    });

    const totalDeliverables = phaseReports.reduce((sum, p) => sum + p.totalDeliverables, 0);
    const totalCompleted = phaseReports.reduce((sum, p) => sum + p.completedDeliverables, 0);
    const overallCompletion = totalDeliverables > 0
      ? Math.round((totalCompleted / totalDeliverables) * 100)
      : 0;

    const report = {
      projectId: project.id,
      refNumber: project.refNumber,
      title: project.title,
      customer: project.customer,
      partNumber: project.partNumber,
      status: project.status,
      currentPhase: project.currentPhase,
      startDate: project.startDate,
      targetDate: project.targetDate,
      completedDate: project.completedDate,
      overallCompletion,
      totalDeliverables,
      totalCompleted,
      phases: phaseReports,
    };

    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Status report error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate status report' } });
  }
});

export default router;
