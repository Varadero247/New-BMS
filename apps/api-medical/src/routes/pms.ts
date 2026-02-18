import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
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

const PMS_PLAN_STATUSES = ['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'ARCHIVED'] as const;

const PMS_REPORT_TYPES = ['PSUR', 'PMCF', 'PMS_REPORT', 'TREND_REPORT'] as const;

const PMS_REPORT_STATUSES = ['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'] as const;

/**
 * Generate reference number: PMS-YYMM-XXXX
 */
async function generatePlanRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `PMS-${yy}${mm}`;

  const count = await prisma.pmsPlan.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

/**
 * Generate report reference number: PSUR-YYMM-XXXX or PMCF-YYMM-XXXX etc.
 */
async function generateReportRefNumber(reportType: string): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `${reportType}-${yy}${mm}`;

  const count = await prisma.pmsReport.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// 1. POST /plans - Create PMS plan
// ============================================
router.post('/plans', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      deviceName: z.string().trim().min(1).max(200),
      deviceClass: z.string().optional(),
      dataSources: z.array(z.string()).optional(),
      reviewFrequency: z.string().optional(),
      status: z.enum(PMS_PLAN_STATUSES).optional(),
      lastReviewDate: z.string().optional(),
      nextReviewDate: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generatePlanRefNumber();

    const plan = await prisma.pmsPlan.create({
      data: {
        refNumber,
        deviceName: data.deviceName,
        deviceClass: data.deviceClass,
        dataSources: data.dataSources || [],
        reviewFrequency: data.reviewFrequency,
        status: data.status || 'DRAFT',
        lastReviewDate: data.lastReviewDate ? new Date(data.lastReviewDate) : undefined,
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : undefined,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create PMS plan error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create PMS plan' } });
  }
});

// ============================================
// 2. GET /plans - List plans with pagination
// ============================================
router.get('/plans', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1', limit = '20', status, deviceName,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };

    if (status) where.status = status as any;
    if (deviceName) {
      where.deviceName = { contains: deviceName as string, mode: 'insensitive' };
    }

    const [plans, total] = await Promise.all([
      prisma.pmsPlan.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pmsPlan.count({ where }),
    ]);

    res.json({
      success: true,
      data: plans,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List PMS plans error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list PMS plans' } });
  }
});

// ============================================
// 3. GET /plans/:id - Get plan with reports
// ============================================
router.get('/plans/:id', checkOwnership(prisma.pmsPlan), async (req: AuthRequest, res: Response) => {
  try {
    const plan = await prisma.pmsPlan.findUnique({
      where: { id: req.params.id },
      include: {
        reports: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!plan || plan.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'PMS plan not found' } });
    }

    res.json({ success: true, data: plan });
  } catch (error) {
    logger.error('Get PMS plan error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get PMS plan' } });
  }
});

// ============================================
// 4. PUT /plans/:id - Update plan
// ============================================
router.put('/plans/:id', checkOwnership(prisma.pmsPlan), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.pmsPlan.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'PMS plan not found' } });
    }

    const schema = z.object({
      deviceName: z.string().trim().min(1).max(200).optional(),
      deviceClass: z.string().optional(),
      dataSources: z.array(z.string()).optional(),
      reviewFrequency: z.string().optional(),
      status: z.enum(PMS_PLAN_STATUSES).optional(),
      lastReviewDate: z.string().optional(),
      nextReviewDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const plan = await prisma.pmsPlan.update({
      where: { id: req.params.id },
      data: {
        ...(data.deviceName !== undefined && { deviceName: data.deviceName }),
        ...(data.deviceClass !== undefined && { deviceClass: data.deviceClass }),
        ...(data.dataSources !== undefined && { dataSources: data.dataSources }),
        ...(data.reviewFrequency !== undefined && { reviewFrequency: data.reviewFrequency }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.lastReviewDate !== undefined && { lastReviewDate: new Date(data.lastReviewDate) }),
        ...(data.nextReviewDate !== undefined && { nextReviewDate: new Date(data.nextReviewDate) }),
      },
    });

    res.json({ success: true, data: plan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update PMS plan error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update PMS plan' } });
  }
});

// ============================================
// 5. POST /reports/psur - Create PSUR report
// ============================================
router.post('/reports/psur', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      planId: z.string().trim().min(1).max(200),
      periodStart: z.string().trim().min(1).max(200),
      periodEnd: z.string().trim().min(1).max(200),
      complaintCount: z.number().int().min(0).optional(),
      mdrCount: z.number().int().min(0).optional(),
      adverseEvents: z.number().int().min(0).optional(),
      literatureRefs: z.string().optional(),
      trendAnalysis: z.string().optional(),
      conclusions: z.string().optional(),
      actions: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Verify plan exists
    const plan = await prisma.pmsPlan.findUnique({ where: { id: data.planId } });
    if (!plan || plan.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'PMS plan not found' } });
    }

    const refNumber = await generateReportRefNumber('PSUR');

    const report = await prisma.pmsReport.create({
      data: {
        planId: data.planId,
        reportType: 'PSUR',
        refNumber,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        complaintCount: data.complaintCount ?? 0,
        mdrCount: data.mdrCount ?? 0,
        adverseEvents: data.adverseEvents ?? 0,
        literatureRefs: data.literatureRefs,
        trendAnalysis: data.trendAnalysis,
        conclusions: data.conclusions,
        actions: data.actions,
        status: 'DRAFT',
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create PSUR report error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create PSUR report' } });
  }
});

// ============================================
// 6. POST /reports/pmcf - Create PMCF report
// ============================================
router.post('/reports/pmcf', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      planId: z.string().trim().min(1).max(200),
      periodStart: z.string().trim().min(1).max(200),
      periodEnd: z.string().trim().min(1).max(200),
      complaintCount: z.number().int().min(0).optional(),
      mdrCount: z.number().int().min(0).optional(),
      adverseEvents: z.number().int().min(0).optional(),
      literatureRefs: z.string().optional(),
      trendAnalysis: z.string().optional(),
      conclusions: z.string().optional(),
      actions: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Verify plan exists
    const plan = await prisma.pmsPlan.findUnique({ where: { id: data.planId } });
    if (!plan || plan.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'PMS plan not found' } });
    }

    const refNumber = await generateReportRefNumber('PMCF');

    const report = await prisma.pmsReport.create({
      data: {
        planId: data.planId,
        reportType: 'PMCF',
        refNumber,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        complaintCount: data.complaintCount ?? 0,
        mdrCount: data.mdrCount ?? 0,
        adverseEvents: data.adverseEvents ?? 0,
        literatureRefs: data.literatureRefs,
        trendAnalysis: data.trendAnalysis,
        conclusions: data.conclusions,
        actions: data.actions,
        status: 'DRAFT',
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create PMCF report error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create PMCF report' } });
  }
});

// ============================================
// 7. GET /dashboard - PMS overview
// ============================================
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();

    const [totalPlans, activePlans, pendingReports, overdueReviews] = await Promise.all([
      // Total plans (non-deleted)
      prisma.pmsPlan.count({ where: { deletedAt: null } as any }),

      // Active plans
      prisma.pmsPlan.count({ where: { deletedAt: null, status: 'ACTIVE' } as any }),

      // Pending reports (DRAFT or REVIEW status)
      prisma.pmsReport.count({
        where: { status: { in: ['DRAFT', 'REVIEW'] } },
      }),

      // Overdue reviews: plans where nextReviewDate is in the past and status is ACTIVE
      prisma.pmsPlan.count({
        where: {
          deletedAt: null,
          status: 'ACTIVE',
          nextReviewDate: { lt: now } as any,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalPlans,
        activePlans,
        pendingReports,
        overdueReviews,
      },
    });
  } catch (error) {
    logger.error('PMS dashboard error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate PMS dashboard' } });
  }
});

export default router;
