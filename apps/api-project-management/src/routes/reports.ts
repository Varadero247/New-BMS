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

const RAG_STATUSES = ['GREEN', 'AMBER', 'RED'] as const;

// GET /api/reports - List status reports by projectId
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, page = '1', limit = '20' } = req.query;

    if (!projectId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' } });
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { projectId: projectId as string, deletedAt: null };

    const [reports, total] = await Promise.all([
      prisma.projectStatusReport.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { reportDate: 'desc' },
      }),
      prisma.projectStatusReport.count({ where }),
    ]);

    res.json({
      success: true,
      data: reports,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List reports error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list reports' } });
  }
});

// GET /api/reports/:id - Get single report
router.get('/:id', checkOwnership(prisma.projectStatusReport), async (req: AuthRequest, res: Response) => {
  try {
    const report = await prisma.projectStatusReport.findUnique({
      where: { id: req.params.id },
    });

    if (!report) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Get report error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get report' } });
  }
});

// POST /api/reports - Create status report
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      projectId: z.string().trim().min(1).max(200),
      reportPeriod: z.string().trim().min(1).max(200),
      reportType: z.string().optional(),
      executiveSummary: z.string().trim().min(1).max(2000),
      progressSummary: z.string().optional(),
      milestonesAchieved: z.string().optional(),
      upcomingMilestones: z.string().optional(),
      overallStatus: z.enum(RAG_STATUSES),
      scheduleStatus: z.enum(RAG_STATUSES),
      budgetStatus: z.enum(RAG_STATUSES),
      scopeStatus: z.enum(RAG_STATUSES),
      qualityStatus: z.enum(RAG_STATUSES),
      riskStatus: z.enum(RAG_STATUSES),
      keyIssues: z.string().optional(),
      keyRisks: z.string().optional(),
      accomplishments: z.string().optional(),
      nextPeriodPlans: z.string().optional(),
      progressPercentage: z.number().min(0).max(100).optional(),
      budgetConsumed: z.number().nonnegative().optional(),
      scheduleVariance: z.number().optional(),
      costVariance: z.number().nonnegative().optional(),
    });

    const data = schema.parse(req.body);

    const report = await prisma.projectStatusReport.create({
      data: {
        projectId: data.projectId,
        reportPeriod: data.reportPeriod,
        reportType: data.reportType || 'WEEKLY',
        reportDate: new Date(),
        executiveSummary: data.executiveSummary,
        progressSummary: data.progressSummary,
        milestonesAchieved: data.milestonesAchieved,
        upcomingMilestones: data.upcomingMilestones,
        overallStatus: data.overallStatus,
        scheduleStatus: data.scheduleStatus,
        budgetStatus: data.budgetStatus,
        scopeStatus: data.scopeStatus,
        qualityStatus: data.qualityStatus,
        riskStatus: data.riskStatus,
        keyIssues: data.keyIssues,
        keyRisks: data.keyRisks,
        accomplishments: data.accomplishments,
        nextPeriodPlans: data.nextPeriodPlans,
        progressPercentage: data.progressPercentage,
        budgetConsumed: data.budgetConsumed,
        scheduleVariance: data.scheduleVariance,
        costVariance: data.costVariance,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Create report error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create report' } });
  }
});

// DELETE /api/reports/:id - Delete report
router.delete('/:id', checkOwnership(prisma.projectStatusReport), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectStatusReport.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    }

    await prisma.projectStatusReport.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete report error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete report' } });
  }
});

export default router;
