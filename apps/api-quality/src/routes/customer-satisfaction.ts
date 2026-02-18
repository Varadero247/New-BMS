import { Router, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-quality');

const router: Router = Router();

// Auth middleware applied to all routes EXCEPT public ones (added individually below)
router.param('id', validateIdParam());

// =============================================
// Generate reference number: CS-YYMM-XXXX
// =============================================
async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `CS-${yy}${mm}`;
  const count = await prisma.customerSurvey.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// =============================================
// NPS classification helper
// =============================================
function classifyNPS(score: number): 'PROMOTER' | 'PASSIVE' | 'DETRACTOR' {
  if (score >= 9) return 'PROMOTER';
  if (score >= 7) return 'PASSIVE';
  return 'DETRACTOR';
}

// =============================================
// PUBLIC ROUTES (no auth required)
// =============================================

// GET /public/:token - Get public survey for customer-facing form
router.get('/public/:token', async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;

    const survey = await prisma.customerSurvey.findUnique({
      where: { publicToken: token },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!survey || !survey.isPublic || !survey.isActive || survey.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Survey not found' } });
    }

    res.json({ success: true, data: survey });
  } catch (error) {
    logger.error('Get public survey error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get survey' } });
  }
});

// POST /public/:token/respond - Submit public survey response
router.post('/public/:token/respond', async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;

    const survey = await prisma.customerSurvey.findUnique({
      where: { publicToken: token },
      include: { questions: { orderBy: { orderIndex: 'asc' } } },
    });

    if (!survey || !survey.isPublic || !survey.isActive || survey.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Survey not found' } });
    }

    const schema = z.object({
      respondentName: z.string().optional(),
      respondentEmail: z.string().email().optional(),
      respondentCompany: z.string().optional(),
      answers: z.array(z.object({
        questionId: z.string().min(1),
        textValue: z.string().optional(),
        numericValue: z.number().optional(),
        selectedOptions: z.array(z.string()).optional(),
      })).min(1),
    });

    const data = schema.parse(req.body);

    // Calculate NPS and CSAT scores from answers
    let npsScore: number | null = null;
    let csatScore: number | null = null;

    for (const answer of data.answers) {
      const question = survey.questions.find(q => q.id === answer.questionId);
      if (!question) continue;
      if (question.type === 'NPS_SCALE' && answer.numericValue != null) {
        npsScore = answer.numericValue;
      }
      if (question.type === 'RATING' && answer.numericValue != null) {
        csatScore = answer.numericValue;
      }
    }

    const npsCategory = npsScore != null ? classifyNPS(npsScore) : null;

    const response = await prisma.surveyResponse.create({
      data: {
        surveyId: survey.id,
        respondentName: data.respondentName,
        respondentEmail: data.respondentEmail,
        respondentCompany: data.respondentCompany,
        npsScore,
        csatScore,
        npsCategory,
        answers: {
          create: data.answers.map(a => ({
            questionId: a.questionId,
            textValue: a.textValue,
            numericValue: a.numericValue,
            selectedOptions: a.selectedOptions || [],
          })),
        },
      },
      include: { answers: true },
    });

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Submit public response error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit response' } });
  }
});

// =============================================
// AUTHENTICATED ROUTES
// =============================================
router.use(authenticate);

// =============================================
// POST /surveys - Create survey template
// =============================================
router.post('/surveys', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      type: z.enum(['NPS', 'CSAT', 'CUSTOM', 'POST_DELIVERY', 'ANNUAL']),
      isPublic: z.boolean().optional(),
      questions: z.array(z.object({
        text: z.string().min(1),
        type: z.enum(['RATING', 'TEXT', 'MULTIPLE_CHOICE', 'YES_NO', 'NPS_SCALE']),
        required: z.boolean().optional(),
        options: z.array(z.string()).optional(),
        minValue: z.number().optional(),
        maxValue: z.number().optional(),
      })).min(1),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    // Generate public token if survey is public
    const publicToken = data.isPublic
      ? `${refNumber}-${Math.random().toString(36).substring(2, 10)}`
      : null;

    const survey = await prisma.customerSurvey.create({
      data: {
        refNumber,
        title: data.title,
        description: data.description,
        type: data.type,
        isPublic: data.isPublic || false,
        publicToken,
        createdBy: req.user?.id,
        questions: {
          create: data.questions.map((q, idx) => ({
            orderIndex: idx,
            text: q.text,
            type: q.type,
            required: q.required ?? true,
            options: q.options || [],
            minValue: q.minValue,
            maxValue: q.maxValue,
          })),
        },
      },
      include: { questions: { orderBy: { orderIndex: 'asc' } } },
    });

    res.status(201).json({ success: true, data: survey });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create survey error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create survey' } });
  }
});

// =============================================
// GET /surveys - List surveys
// =============================================
router.get('/surveys', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', type, isActive, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (type) where.type = type as any;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.title = { contains: search as string, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.customerSurvey.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { questions: true, responses: true } },
        },
      }),
      prisma.customerSurvey.count({ where }),
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
    logger.error('List surveys error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list surveys' } });
  }
});

// =============================================
// GET /surveys/:id - Get single survey with questions
// =============================================
router.get('/surveys/:id', async (req: AuthRequest, res: Response) => {
  try {
    const survey = await prisma.customerSurvey.findUnique({
      where: { id: req.params.id },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { responses: true } },
      },
    });

    if (!survey || survey.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Survey not found' } });
    }

    res.json({ success: true, data: survey });
  } catch (error) {
    logger.error('Get survey error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get survey' } });
  }
});

// =============================================
// POST /responses - Submit survey response (authenticated)
// =============================================
router.post('/responses', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      surveyId: z.string().min(1),
      respondentName: z.string().optional(),
      respondentEmail: z.string().email().optional(),
      respondentCompany: z.string().optional(),
      answers: z.array(z.object({
        questionId: z.string().min(1),
        textValue: z.string().optional(),
        numericValue: z.number().optional(),
        selectedOptions: z.array(z.string()).optional(),
      })).min(1),
    });

    const data = schema.parse(req.body);

    // Verify survey exists and is active
    const survey = await prisma.customerSurvey.findUnique({
      where: { id: data.surveyId },
      include: { questions: true },
    });

    if (!survey || !survey.isActive || survey.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Survey not found or not active' } });
    }

    // Calculate NPS and CSAT scores from answers
    let npsScore: number | null = null;
    let csatScore: number | null = null;

    for (const answer of data.answers) {
      const question = survey.questions.find(q => q.id === answer.questionId);
      if (!question) continue;
      if (question.type === 'NPS_SCALE' && answer.numericValue != null) {
        npsScore = answer.numericValue;
      }
      if (question.type === 'RATING' && answer.numericValue != null) {
        csatScore = answer.numericValue;
      }
    }

    const npsCategory = npsScore != null ? classifyNPS(npsScore) : null;

    const response = await prisma.surveyResponse.create({
      data: {
        surveyId: data.surveyId,
        respondentName: data.respondentName,
        respondentEmail: data.respondentEmail,
        respondentCompany: data.respondentCompany,
        npsScore,
        csatScore,
        npsCategory,
        answers: {
          create: data.answers.map(a => ({
            questionId: a.questionId,
            textValue: a.textValue,
            numericValue: a.numericValue,
            selectedOptions: a.selectedOptions || [],
          })),
        },
      },
      include: { answers: true },
    });

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Submit response error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit response' } });
  }
});

// =============================================
// GET /responses - List/filter responses
// =============================================
router.get('/responses', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', surveyId, npsCategory, startDate, endDate } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (surveyId) where.surveyId = surveyId as string;
    if (npsCategory) where.npsCategory = npsCategory as any;
    if (startDate || endDate) {
      where.submittedAt = {};
      if (startDate) where.submittedAt.gte = new Date(startDate as string);
      if (endDate) where.submittedAt.lte = new Date(endDate as string);
    }

    const [items, total] = await Promise.all([
      prisma.surveyResponse.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { submittedAt: 'desc' },
        include: {
          survey: { select: { id: true, title: true, refNumber: true, type: true } },
          answers: true,
        },
      }),
      prisma.surveyResponse.count({ where }),
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
    logger.error('List responses error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list responses' } });
  }
});

// =============================================
// GET /metrics - Calculate NPS, CSAT, trends
// =============================================
router.get('/metrics', async (req: AuthRequest, res: Response) => {
  try {
    const { surveyId, months = '12' } = req.query;
    const monthsNum = parseInt(months as string, 10) || 12;
    const sinceDate = new Date();
    sinceDate.setMonth(sinceDate.getMonth() - monthsNum);

    const where: any = {
      submittedAt: { gte: sinceDate },
    };
    if (surveyId) where.surveyId = surveyId as string;

    // Get all responses in period
    const responses = await prisma.surveyResponse.findMany({
      where,
      select: {
        npsScore: true,
        csatScore: true,
        npsCategory: true,
        submittedAt: true,
      },
      orderBy: { submittedAt: 'asc' },
    });

    const totalResponses = responses.length;

    // Overall NPS calculation
    const npsResponses = responses.filter(r => r.npsCategory != null);
    const promoters = npsResponses.filter(r => r.npsCategory === 'PROMOTER').length;
    const detractors = npsResponses.filter(r => r.npsCategory === 'DETRACTOR').length;
    const nps = npsResponses.length > 0
      ? Math.round(((promoters - detractors) / npsResponses.length) * 100)
      : null;

    // Average CSAT
    const csatResponses = responses.filter(r => r.csatScore != null);
    const averageCsat = csatResponses.length > 0
      ? Math.round((csatResponses.reduce((sum, r) => sum + (r.csatScore || 0), 0) / csatResponses.length) * 100) / 100
      : null;

    // Monthly trends
    const monthlyTrends: Array<{
      month: string;
      nps: number | null;
      csat: number | null;
      responseCount: number;
    }> = [];

    const grouped = new Map<string, typeof responses>();
    for (const r of responses) {
      const key = `${r.submittedAt.getFullYear()}-${String(r.submittedAt.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(r);
    }

    for (const [month, monthResponses] of grouped) {
      const mNps = monthResponses.filter(r => r.npsCategory != null);
      const mPromoters = mNps.filter(r => r.npsCategory === 'PROMOTER').length;
      const mDetractors = mNps.filter(r => r.npsCategory === 'DETRACTOR').length;
      const mNpsScore = mNps.length > 0
        ? Math.round(((mPromoters - mDetractors) / mNps.length) * 100)
        : null;

      const mCsat = monthResponses.filter(r => r.csatScore != null);
      const mCsatAvg = mCsat.length > 0
        ? Math.round((mCsat.reduce((sum, r) => sum + (r.csatScore || 0), 0) / mCsat.length) * 100) / 100
        : null;

      monthlyTrends.push({
        month,
        nps: mNpsScore,
        csat: mCsatAvg,
        responseCount: monthResponses.length,
      });
    }

    res.json({
      success: true,
      data: {
        totalResponses,
        nps,
        averageCsat,
        promoters,
        passives: npsResponses.length - promoters - detractors,
        detractors,
        monthlyTrends,
      },
    });
  } catch (error) {
    logger.error('Metrics calculation error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to calculate metrics' } });
  }
});

// =============================================
// GET /dashboard - Aggregated stats
// =============================================
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    // Total surveys
    const totalSurveys = await prisma.customerSurvey.count({ where: { deletedAt: null } as any });

    // Total responses
    const totalResponses = await prisma.surveyResponse.count();

    // Current NPS (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentResponses = await prisma.surveyResponse.findMany({
      where: { submittedAt: { gte: ninetyDaysAgo } },
      select: { npsScore: true, csatScore: true, npsCategory: true, submittedAt: true },
    });

    const npsResponses = recentResponses.filter(r => r.npsCategory != null);
    const promoters = npsResponses.filter(r => r.npsCategory === 'PROMOTER').length;
    const detractors = npsResponses.filter(r => r.npsCategory === 'DETRACTOR').length;
    const currentNps = npsResponses.length > 0
      ? Math.round(((promoters - detractors) / npsResponses.length) * 100)
      : null;

    // Current CSAT (last 90 days)
    const csatResponses = recentResponses.filter(r => r.csatScore != null);
    const currentCsat = csatResponses.length > 0
      ? Math.round((csatResponses.reduce((sum, r) => sum + (r.csatScore || 0), 0) / csatResponses.length) * 100) / 100
      : null;

    // Trend direction: compare last 90 days vs previous 90 days
    const oneEightyDaysAgo = new Date();
    oneEightyDaysAgo.setDate(oneEightyDaysAgo.getDate() - 180);

    const previousResponses = await prisma.surveyResponse.findMany({
      where: {
        submittedAt: { gte: oneEightyDaysAgo, lt: ninetyDaysAgo },
      },
      select: { npsCategory: true },
    });

    const prevNps = previousResponses.filter(r => r.npsCategory != null);
    const prevPromoters = prevNps.filter(r => r.npsCategory === 'PROMOTER').length;
    const prevDetractors = prevNps.filter(r => r.npsCategory === 'DETRACTOR').length;
    const previousNps = prevNps.length > 0
      ? Math.round(((prevPromoters - prevDetractors) / prevNps.length) * 100)
      : null;

    let trendDirection: 'up' | 'down' | 'stable' | 'insufficient_data' = 'insufficient_data';
    if (currentNps != null && previousNps != null) {
      if (currentNps > previousNps) trendDirection = 'up';
      else if (currentNps < previousNps) trendDirection = 'down';
      else trendDirection = 'stable';
    }

    res.json({
      success: true,
      data: {
        totalSurveys,
        totalResponses,
        currentNps,
        currentCsat,
        trendDirection,
        recentResponseCount: recentResponses.length,
      },
    });
  } catch (error) {
    logger.error('Dashboard stats error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get dashboard stats' } });
  }
});

export default router;
