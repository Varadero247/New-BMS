import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-project-management');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Helper: generate project code PRJ0001, PRJ0002, etc.
async function generateProjectCode(): Promise<string> {
  const lastProject = await prisma.project.findFirst({
    where: { deletedAt: null } as any,
    orderBy: { createdAt: 'desc' },
    select: { projectCode: true },
  });

  let nextNum = 1;
  if (lastProject?.projectCode) {
    const match = lastProject.projectCode.match(/PRJ(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  return `PRJ${String(nextNum).padStart(4, '0')}`;
}

// GET /api/projects - List projects with pagination and filters
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, priority, methodology, search } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (priority) where.priority = priority as any;
    if (methodology) where.methodology = methodology as any;
    if (search) {
      where.OR = [
        { projectName: { contains: search as string, mode: 'insensitive' } },
        { projectDescription: { contains: search as string, mode: 'insensitive' } },
        { projectCode: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              tasks: true,
              risks: true,
              issues: true,
              milestones: true,
            },
          },
        },
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      success: true,
      data: projects,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List projects error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list projects' },
    });
  }
});

// GET /api/projects/:id - Get single project with all relations
router.get('/:id', checkOwnership(prisma.project), async (req: AuthRequest, res: Response) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: true,
        milestones: true,
        risks: true,
        issues: true,
        changes: true,
        resources: true,
        stakeholders: true,
        documents: true,
        sprints: true,
        statusReports: { orderBy: { reportDate: 'desc' }, take: 5 },
        timesheets: true,
        _count: {
          select: {
            tasks: true,
            risks: true,
            issues: true,
            milestones: true,
            changes: true,
            resources: true,
            stakeholders: true,
            documents: true,
            sprints: true,
          },
        },
      },
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    logger.error('Get project error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get project' },
    });
  }
});

// GET /api/projects/:id/dashboard - Dashboard metrics
router.get(
  '/:id/dashboard',
  checkOwnership(prisma.project),
  async (req: AuthRequest, res: Response) => {
    try {
      const project = await prisma.project.findUnique({
        where: { id: req.params.id },
        include: {
          tasks: true,
          milestones: true,
          risks: true,
          issues: true,
          resources: true,
          timesheets: true,
        },
      });

      if (!project) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
      }

      // Overview
      const overview = {
        projectName: project.projectName,
        projectCode: project.projectCode,
        status: project.status,
        healthStatus: project.healthStatus,
        progressPercentage: project.progressPercentage,
        methodology: project.methodology,
        priority: project.priority,
      };

      // Schedule metrics
      const now = new Date();
      const startDate = project.startDate ? new Date(project.startDate) : now;
      const plannedEnd = new Date(project.plannedEndDate);
      const totalDuration = plannedEnd.getTime() - startDate.getTime();
      const elapsed = now.getTime() - startDate.getTime();
      const scheduleProgress =
        totalDuration > 0 ? Math.min(100, Math.round((elapsed / totalDuration) * 100)) : 0;

      const schedule = {
        startDate: project.startDate,
        plannedEndDate: project.plannedEndDate,
        actualEndDate: project.actualEndDate,
        scheduleProgress,
        daysRemaining: Math.max(
          0,
          Math.ceil((plannedEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        ),
        isOverdue: now > plannedEnd && !project.actualEndDate,
      };

      // Budget metrics
      const budget = {
        plannedBudget: project.plannedBudget,
        actualCost: project.actualCost,
        contingencyReserve: project.contingencyReserve,
        managementReserve: project.managementReserve,
        budgetUtilization: project.plannedBudget
          ? Math.round((project.actualCost / project.plannedBudget) * 100)
          : 0,
      };

      // EVM metrics
      const evm = {
        plannedValue: project.plannedValue,
        earnedValue: project.earnedValue,
        actualCost: project.actualCost,
        costPerformanceIndex: project.costPerformanceIndex,
        schedulePerformanceIndex: project.schedulePerformanceIndex,
        estimateAtCompletion: project.estimateAtCompletion,
        estimateToComplete: project.estimateToComplete,
        varianceAtCompletion: project.varianceAtCompletion,
      };

      // Task breakdown
      const taskBreakdown = {
        total: project.tasks.length,
        notStarted: project.tasks.filter((t) => t.status === 'NOT_STARTED').length,
        inProgress: project.tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        completed: project.tasks.filter((t) => t.status === 'COMPLETED').length,
        blocked: project.tasks.filter((t) => t.status === 'BLOCKED').length,
        cancelled: project.tasks.filter((t) => t.status === 'CANCELLED').length,
      };

      // Milestone stats
      const milestoneStats = {
        total: project.milestones.length,
        upcoming: project.milestones.filter((m) => m.status === 'UPCOMING').length,
        achieved: project.milestones.filter((m) => m.status === 'ACHIEVED').length,
        missed: project.milestones.filter((m) => m.status === 'MISSED').length,
        overdue: project.milestones.filter(
          (m) => m.status === 'UPCOMING' && new Date(m.plannedDate) < now
        ).length,
      };

      // Risk stats
      const riskStats = {
        total: project.risks.length,
        identified: project.risks.filter((r) => r.status === 'IDENTIFIED').length,
        mitigating: project.risks.filter((r) => r.status === 'MITIGATING').length,
        closed: project.risks.filter((r) => r.status === 'CLOSED').length,
        byLevel: {
          critical: project.risks.filter((r) => r.riskLevel === 'CRITICAL').length,
          high: project.risks.filter((r) => r.riskLevel === 'HIGH').length,
          medium: project.risks.filter((r) => r.riskLevel === 'MEDIUM').length,
          low: project.risks.filter((r) => r.riskLevel === 'LOW').length,
        },
      };

      // Issue stats
      const issueStats = {
        total: project.issues.length,
        open: project.issues.filter((i) => i.status === 'OPEN').length,
        inProgress: project.issues.filter((i) => i.status === 'IN_PROGRESS').length,
        resolved: project.issues.filter((i) => i.status === 'RESOLVED').length,
        closed: project.issues.filter((i) => i.status === 'CLOSED').length,
      };

      // Resource utilization
      const totalPlannedHours = project.resources.reduce(
        (sum, r) => sum + (r.plannedHours || 0),
        0
      );
      const totalActualHours = project.resources.reduce((sum, r) => sum + r.actualHours, 0);
      const resourceUtilization = {
        totalResources: project.resources.length,
        totalPlannedHours,
        totalActualHours,
        overallUtilization:
          totalPlannedHours > 0 ? Math.round((totalActualHours / totalPlannedHours) * 100) : 0,
      };

      res.json({
        success: true,
        data: {
          overview,
          schedule,
          budget,
          evm,
          taskBreakdown,
          milestoneStats,
          riskStats,
          issueStats,
          resourceUtilization,
        },
      });
    } catch (error) {
      logger.error('Dashboard error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get dashboard' },
      });
    }
  }
);

// POST /api/projects - Create project
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      projectName: z.string().trim().min(1).max(200),
      projectDescription: z.string().trim().optional(),
      projectType: z.enum(['INTERNAL', 'CLIENT', 'R_D', 'IMPROVEMENT', 'COMPLIANCE']),
      businessCase: z.string().trim().optional(),
      businessJustification: z.string().trim().optional(),
      expectedBenefits: z.string().trim().optional(),
      roi: z.number().optional(),
      paybackPeriod: z.number().optional(),
      scopeStatement: z.string().trim().optional(),
      objectives: z.string().trim().optional(),
      deliverables: z.string().trim().optional(),
      exclusions: z.string().trim().optional(),
      assumptions: z.string().trim().optional(),
      constraints: z.string().trim().optional(),
      startDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      plannedEndDate: z
        .string()
        .trim()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      plannedBudget: z.number().nonnegative().optional(),
      budgetCurrency: z.string().trim().optional(),
      contingencyReserve: z.number().optional(),
      managementReserve: z.number().nonnegative().optional(),
      projectManagerId: z.string().trim().optional(),
      projectSponsorId: z.string().trim().optional(),
      teamMembers: z.string().trim().optional(),
      methodology: z.enum(['WATERFALL', 'AGILE', 'HYBRID', 'PRINCE2']),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      complianceStandards: z.string().trim().optional(),
      linkedProcessIds: z.string().trim().optional(),
      linkedRiskIds: z.string().trim().optional(),
      linkedAspectIds: z.string().trim().optional(),
      linkedDepartmentIds: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const projectCode = await generateProjectCode();

    const project = await prisma.project.create({
      data: {
        projectCode,
        projectName: data.projectName,
        projectDescription: data.projectDescription,
        projectType: data.projectType,
        businessCase: data.businessCase,
        businessJustification: data.businessJustification,
        expectedBenefits: data.expectedBenefits,
        roi: data.roi,
        paybackPeriod: data.paybackPeriod,
        scopeStatement: data.scopeStatement,
        objectives: data.objectives,
        deliverables: data.deliverables,
        exclusions: data.exclusions,
        assumptions: data.assumptions,
        constraints: data.constraints,
        startDate: data.startDate ? new Date(data.startDate) : null,
        plannedEndDate: new Date(data.plannedEndDate),
        plannedBudget: data.plannedBudget,
        budgetCurrency: data.budgetCurrency || 'GBP',
        contingencyReserve: data.contingencyReserve || 0,
        managementReserve: data.managementReserve || 0,
        projectManagerId: data.projectManagerId,
        projectSponsorId: data.projectSponsorId,
        teamMembers: data.teamMembers,
        methodology: data.methodology,
        priority: data.priority,
        complianceStandards: data.complianceStandards,
        linkedProcessIds: data.linkedProcessIds,
        linkedRiskIds: data.linkedRiskIds,
        linkedAspectIds: data.linkedAspectIds,
        linkedDepartmentIds: data.linkedDepartmentIds,
        createdBy: req.user?.id,
        status: 'PLANNING',
        healthStatus: 'GREEN',
        progressPercentage: 0,
      },
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    logger.error('Create project error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create project' },
    });
  }
});

// PUT /api/projects/:id - Update project
const projectUpdateSchema = z.object({
  projectName: z.string().trim().min(1).max(200).optional(),
  projectDescription: z.string().trim().optional(),
  projectType: z.enum(['INTERNAL', 'CLIENT', 'R_D', 'IMPROVEMENT', 'COMPLIANCE']).optional(),
  status: z
    .enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'CLOSED'])
    .optional(),
  businessCase: z.string().trim().optional(),
  businessJustification: z.string().trim().optional(),
  expectedBenefits: z.string().trim().optional(),
  roi: z.number().optional(),
  paybackPeriod: z.number().optional(),
  scopeStatement: z.string().trim().optional(),
  objectives: z.string().trim().optional(),
  deliverables: z.string().trim().optional(),
  exclusions: z.string().trim().optional(),
  assumptions: z.string().trim().optional(),
  constraints: z.string().trim().optional(),
  startDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  plannedEndDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  actualEndDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  baselineEndDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  plannedBudget: z.number().nonnegative().optional(),
  budgetCurrency: z.string().trim().optional(),
  contingencyReserve: z.number().optional(),
  managementReserve: z.number().nonnegative().optional(),
  projectManagerId: z.string().trim().optional(),
  projectSponsorId: z.string().trim().optional(),
  teamMembers: z.string().trim().optional(),
  methodology: z.enum(['WATERFALL', 'AGILE', 'HYBRID', 'PRINCE2']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  complianceStandards: z.string().trim().optional(),
  linkedProcessIds: z.string().trim().optional(),
  linkedRiskIds: z.string().trim().optional(),
  linkedAspectIds: z.string().trim().optional(),
  linkedDepartmentIds: z.string().trim().optional(),
  earnedValue: z.number().optional(),
  actualCost: z.number().nonnegative().optional(),
  plannedValue: z.number().optional(),
  progressPercentage: z.number().min(0).max(100).optional(),
});

router.put('/:id', checkOwnership(prisma.project), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    const parsed = projectUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.errors,
        },
      });
    }
    const data = parsed.data;
    const updateData: any = { ...data, updatedBy: req.user?.id };

    // Handle date conversions
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.plannedEndDate) updateData.plannedEndDate = new Date(data.plannedEndDate);
    if (data.actualEndDate) updateData.actualEndDate = new Date(data.actualEndDate);
    if (data.baselineEndDate) updateData.baselineEndDate = new Date(data.baselineEndDate);

    // Auto-calculate EVM metrics if values provided
    if (
      data.earnedValue !== undefined ||
      data.actualCost !== undefined ||
      data.plannedValue !== undefined
    ) {
      const pv = data.plannedValue ?? existing.plannedValue;
      const ev = data.earnedValue ?? existing.earnedValue;
      const ac = data.actualCost ?? existing.actualCost;

      if (ac > 0) updateData.costPerformanceIndex = parseFloat((ev / ac).toFixed(4));
      if (pv > 0) updateData.schedulePerformanceIndex = parseFloat((ev / pv).toFixed(4));
      if (updateData.costPerformanceIndex && existing.plannedBudget) {
        updateData.estimateAtCompletion = parseFloat(
          (existing.plannedBudget / updateData.costPerformanceIndex).toFixed(2)
        );
        updateData.estimateToComplete = parseFloat(
          (updateData.estimateAtCompletion - ac).toFixed(2)
        );
        updateData.varianceAtCompletion = parseFloat(
          (existing.plannedBudget - updateData.estimateAtCompletion).toFixed(2)
        );
      }
    }

    // Handle closure
    if (data.status === 'CLOSED' && existing.status !== 'CLOSED') {
      updateData.closedAt = new Date();
      updateData.closedBy = req.user?.id;
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: project });
  } catch (error) {
    logger.error('Update project error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update project' },
    });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', checkOwnership(prisma.project), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    await prisma.project.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete project error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete project' },
    });
  }
});

export default router;
