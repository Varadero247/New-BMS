import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();
router.use(authenticate);

const RAG_STATUSES = ['GREEN', 'AMBER', 'RED'] as const;

// GET /api/reports - List status reports by projectId
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, page = '1', limit = '20' } = req.query;

    if (!projectId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' } });
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { projectId: projectId as string };

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
    console.error('List reports error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list reports' } });
  }
});

// GET /api/reports/:id - Get single report
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const report = await prisma.projectStatusReport.findUnique({
      where: { id: req.params.id },
    });

    if (!report) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get report' } });
  }
});

// POST /api/reports - Create status report
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      projectId: z.string().min(1),
      reportPeriod: z.string().min(1),
      reportType: z.string().optional(),
      executiveSummary: z.string().min(1),
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
      progressPercentage: z.number().optional(),
      budgetConsumed: z.number().optional(),
      scheduleVariance: z.number().optional(),
      costVariance: z.number().optional(),
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
    console.error('Create report error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create report' } });
  }
});

// DELETE /api/reports/:id - Delete report
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectStatusReport.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    }

    await prisma.projectStatusReport.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Report deleted successfully' } });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete report' } });
  }
});

export default router;
