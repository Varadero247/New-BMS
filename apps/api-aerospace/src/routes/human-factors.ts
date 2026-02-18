import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-aerospace');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// Human Factors Management — Constants
// ============================================

const DIRTY_DOZEN_CATEGORIES = [
  'LACK_OF_COMMUNICATION',
  'COMPLACENCY',
  'LACK_OF_KNOWLEDGE',
  'DISTRACTION',
  'LACK_OF_TEAMWORK',
  'FATIGUE',
  'LACK_OF_RESOURCES',
  'PRESSURE',
  'LACK_OF_ASSERTIVENESS',
  'STRESS',
  'LACK_OF_AWARENESS',
  'NORMS',
] as const;

// ============================================
// Reference Number Generator
// ============================================

async function generateHFRefNumber(): Promise<string> {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const count = await prisma.humanFactorIncident.count({
    where: { refNumber: { startsWith: `HF-${yymm}` } },
  });
  return `HF-${yymm}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// Zod Schemas
// ============================================

const createIncidentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(DIRTY_DOZEN_CATEGORIES),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  location: z.string().optional(),
  shift: z.string().optional(),
  personnelInvolved: z.array(z.string()).optional(),
  rootCause: z.string().optional(),
  correctiveAction: z.string().optional(),
  capaRef: z.string().optional(),
  incidentDate: z.string().datetime({ message: 'Valid ISO date required for incidentDate' }),
});

const createFatigueSchema = z.object({
  personnelId: z.string().min(1, 'Personnel ID is required'),
  personnelName: z.string().min(1, 'Personnel name is required'),
  assessmentDate: z.string().datetime({ message: 'Valid ISO date required for assessmentDate' }),
  hoursWorked: z.number().min(0, 'Hours worked must be non-negative'),
  restHours: z.number().min(0, 'Rest hours must be non-negative'),
  fatigueScore: z.number().int().min(1, 'Fatigue score must be at least 1').max(10, 'Fatigue score must be at most 10'),
  riskLevel: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']),
  mitigations: z.string().optional(),
  fitForDuty: z.boolean(),
  notes: z.string().optional(),
});

// ============================================
// ROUTES — Human Factor Incidents
// ============================================

// POST /incidents — Report HF incident
router.post('/incidents', async (req: AuthRequest, res: Response) => {
  try {
    const data = createIncidentSchema.parse(req.body);
    const refNumber = await generateHFRefNumber();

    const incident = await prisma.humanFactorIncident.create({
      data: {
        refNumber,
        title: data.title,
        description: data.description,
        category: data.category,
        severity: data.severity || 'LOW',
        location: data.location,
        shift: data.shift,
        personnelInvolved: data.personnelInvolved || [],
        rootCause: data.rootCause,
        correctiveAction: data.correctiveAction,
        capaRef: data.capaRef,
        status: 'REPORTED',
        reportedBy: req.user?.email || req.user?.id || 'unknown',
        incidentDate: new Date(data.incidentDate),
      },
    });

    logger.info('Human factor incident reported', { refNumber, category: data.category, severity: data.severity });
    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create HF incident error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to report human factor incident' } });
  }
});

// GET /incidents — List HF incidents with filters
router.get('/incidents', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', category, severity, status, dateFrom, dateTo, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (category) where.category = category as any;
    if (severity) where.severity = severity as any;
    if (status) where.status = status as any;
    if (dateFrom || dateTo) {
      where.incidentDate = {};
      if (dateFrom) where.incidentDate.gte = new Date(dateFrom as string);
      if (dateTo) where.incidentDate.lte = new Date(dateTo as string);
    }
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [incidents, total] = await Promise.all([
      prisma.humanFactorIncident.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { incidentDate: 'desc' },
      }),
      prisma.humanFactorIncident.count({ where }),
    ]);

    res.json({
      success: true,
      data: incidents,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List HF incidents error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list human factor incidents' } });
  }
});

// ============================================
// ROUTES — Fatigue Assessments
// ============================================

// POST /fatigue — Log fatigue risk assessment
router.post('/fatigue', async (req: AuthRequest, res: Response) => {
  try {
    const data = createFatigueSchema.parse(req.body);

    const assessment = await prisma.fatigueAssessment.create({
      data: {
        personnelId: data.personnelId,
        personnelName: data.personnelName,
        assessmentDate: new Date(data.assessmentDate),
        hoursWorked: data.hoursWorked,
        restHours: data.restHours,
        fatigueScore: data.fatigueScore,
        riskLevel: data.riskLevel,
        mitigations: data.mitigations,
        fitForDuty: data.fitForDuty,
        notes: data.notes,
        createdBy: req.user?.email || req.user?.id || 'unknown',
      },
    });

    logger.info('Fatigue assessment logged', { personnelId: data.personnelId, fatigueScore: data.fatigueScore, riskLevel: data.riskLevel, fitForDuty: data.fitForDuty });
    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create fatigue assessment error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to log fatigue assessment' } });
  }
});

// ============================================
// ROUTES — Analytics & Reporting
// ============================================

// GET /dirty-dozen — Dirty Dozen trending: count per category for last 12 months
router.get('/dirty-dozen', async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const incidents = await prisma.humanFactorIncident.findMany({
      where: {
        deletedAt: null,
        incidentDate: { gte: twelveMonthsAgo } as any,
      },
      select: {
        category: true,
        incidentDate: true,
      },
      take: 5000,
    });

    // Build month-by-month breakdown per category
    const trending: Record<string, Record<string, number>> = {};

    // Initialize all categories with zero counts for each month
    for (const cat of DIRTY_DOZEN_CATEGORIES) {
      trending[cat] = {};
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        trending[cat][key] = 0;
      }
    }

    // Populate counts
    for (const inc of incidents) {
      const monthKey = `${inc.incidentDate.getFullYear()}-${String(inc.incidentDate.getMonth() + 1).padStart(2, '0')}`;
      if (trending[inc.category] && trending[inc.category][monthKey] !== undefined) {
        trending[inc.category][monthKey]++;
      }
    }

    // Also compute totals per category
    const totals: Record<string, number> = {};
    for (const cat of DIRTY_DOZEN_CATEGORIES) {
      totals[cat] = Object.values(trending[cat]).reduce((sum, count) => sum + count, 0);
    }

    res.json({
      success: true,
      data: {
        period: { from: twelveMonthsAgo.toISOString(), to: now.toISOString() },
        trending,
        totals,
      },
    });
  } catch (error) {
    logger.error('Dirty dozen trending error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate dirty dozen trending' } });
  }
});

// GET /dashboard — HF overview
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total incidents
    const totalIncidents = await prisma.humanFactorIncident.count({
      where: { deletedAt: null } as any,
    });

    // Incidents by severity
    const bySeverity = await prisma.humanFactorIncident.groupBy({
      by: ['severity'],
      where: { deletedAt: null } as any,
      _count: { id: true },
    });

    // Incidents by category (top 5)
    const byCategory = await prisma.humanFactorIncident.groupBy({
      by: ['category'],
      where: { deletedAt: null } as any,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    // Open incidents (not CLOSED)
    const openIncidents = await prisma.humanFactorIncident.count({
      where: { deletedAt: null, status: { not: 'CLOSED' } as any },
    });

    // Recent incidents (last 30 days)
    const recentIncidents = await prisma.humanFactorIncident.count({
      where: { deletedAt: null, incidentDate: { gte: thirtyDaysAgo } as any },
    });

    // Fatigue stats (last 30 days)
    const recentFatigueAssessments = await prisma.fatigueAssessment.findMany({
      where: { assessmentDate: { gte: thirtyDaysAgo } },
      select: {
        fatigueScore: true,
        riskLevel: true,
        fitForDuty: true,
      },
      take: 2000,
    });

    const fatigueStats = {
      totalAssessments: recentFatigueAssessments.length,
      averageScore: recentFatigueAssessments.length > 0
        ? Math.round((recentFatigueAssessments.reduce((sum, a) => sum + a.fatigueScore, 0) / recentFatigueAssessments.length) * 10) / 10
        : 0,
      highRiskCount: recentFatigueAssessments.filter(a => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL').length,
      notFitForDuty: recentFatigueAssessments.filter(a => !a.fitForDuty).length,
      byRiskLevel: {
        LOW: recentFatigueAssessments.filter(a => a.riskLevel === 'LOW').length,
        MODERATE: recentFatigueAssessments.filter(a => a.riskLevel === 'MODERATE').length,
        HIGH: recentFatigueAssessments.filter(a => a.riskLevel === 'HIGH').length,
        CRITICAL: recentFatigueAssessments.filter(a => a.riskLevel === 'CRITICAL').length,
      },
    };

    res.json({
      success: true,
      data: {
        totalIncidents,
        openIncidents,
        recentIncidents,
        bySeverity: bySeverity.map(s => ({ severity: s.severity, count: (s as any)._count.id })),
        topCategories: byCategory.map(c => ({ category: c.category, count: (c as any)._count.id })),
        fatigueStats,
      },
    });
  } catch (error) {
    logger.error('HF dashboard error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate human factors dashboard' } });
  }
});

export default router;
