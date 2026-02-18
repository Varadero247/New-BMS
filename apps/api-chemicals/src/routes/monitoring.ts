import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { calculateWelPercentage, getWelStatus } from '../services/riskCalculator';

const router = Router();
const logger = createLogger('chem-monitoring');

const monitoringTypeEnum = z.enum(['AIR_SAMPLE', 'BIOLOGICAL', 'WIPE_SAMPLE']);

const createMonitoringSchema = z.object({
  chemicalId: z.string().trim().min(1).max(200),
  coshhAssessmentId: z.string().optional(),
  monitoringType: monitoringTypeEnum,
  location: z.string().optional(),
  sampledBy: z.string().optional(),
  sampledAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
  resultValue: z.number().optional(),
  resultUnit: z.string().optional(),
  welTwaLimit: z.number().optional(),
  welStelLimit: z.number().optional(),
  reportUrl: z.string().trim().url('Invalid URL').optional(),
  nextMonitoringDue: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  actionTaken: z.string().optional(),
});

const updateMonitoringSchema = createMonitoringSchema.partial();

// GET /api/monitoring/overdue — due monitoring not done
router.get('/overdue', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const data = await prisma.chemMonitoring.findMany({
      where: { nextMonitoringDue: { lte: new Date() }, chemical: { orgId, isActive: true, deletedAt: null } },
      include: { chemical: { select: { id: true, productName: true, casNumber: true } } },
      orderBy: { nextMonitoringDue: 'asc' },
      take: 500,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to fetch overdue monitoring', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch overdue monitoring' } });
  }
});

// GET /api/monitoring/dashboard — WEL exceedance summary
router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const [total, aboveWel, atWel, belowWel, overdue] = await Promise.all([
      prisma.chemMonitoring.count({ where: { chemical: { orgId, deletedAt: null } as any } }),
      prisma.chemMonitoring.count({ where: { resultVsWel: 'ABOVE_WEL', chemical: { orgId, deletedAt: null } as any } }),
      prisma.chemMonitoring.count({ where: { resultVsWel: 'AT_WEL', chemical: { orgId, deletedAt: null } as any } }),
      prisma.chemMonitoring.count({ where: { resultVsWel: 'BELOW_WEL', chemical: { orgId, deletedAt: null } as any } }),
      prisma.chemMonitoring.count({ where: { nextMonitoringDue: { lte: new Date() }, chemical: { orgId, deletedAt: null } } }),
    ]);
    res.json({ success: true, data: { total, aboveWel, atWel, belowWel, overdue } });
  } catch (error: unknown) {
    logger.error('Failed to fetch monitoring dashboard', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch monitoring dashboard' } });
  }
});

// GET /api/monitoring — all monitoring records
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { chemicalId, welResult, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { chemical: { orgId, deletedAt: null } };
    if (chemicalId) where.chemicalId = chemicalId as any;
    if (welResult) where.resultVsWel = welResult as any;
    const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.chemMonitoring.findMany({
        where, skip, take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { sampledAt: 'desc' },
        include: { chemical: { select: { id: true, productName: true, casNumber: true } } },
      }),
      prisma.chemMonitoring.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: Math.max(1, parseInt(page, 10) || 1), limit: Math.max(1, parseInt(limit, 10) || 20), total, totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)) } });
  } catch (error: unknown) {
    logger.error('Failed to fetch monitoring records', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch monitoring records' } });
  }
});

// POST /api/monitoring — log monitoring result
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createMonitoringSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const d = parsed.data;
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';

    const chemical = await prisma.chemRegister.findFirst({ where: { id: d.chemicalId, orgId, deletedAt: null } as any });
    if (!chemical) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chemical not found' } });

    // Auto-calculate WEL percentage and status
    let percentageOfWel: number | null = null;
    let resultVsWel: string | null = null;
    let actionRequired = false;

    const welLimit = d.welTwaLimit || chemical.welTwa8hr;
    if (d.resultValue != null && welLimit) {
      percentageOfWel = calculateWelPercentage(d.resultValue, welLimit);
      resultVsWel = getWelStatus(percentageOfWel);
      actionRequired = resultVsWel === 'ABOVE_WEL' || resultVsWel === 'AT_WEL';
    }

    const data = await prisma.chemMonitoring.create({
      data: {
        ...d,
        welTwaLimit: welLimit,
        percentageOfWel,
        resultVsWel: resultVsWel as any,
        actionRequired,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create monitoring record', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' } });
  }
});

// PUT /api/monitoring/:id — update monitoring record
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateMonitoringSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.chemMonitoring.findFirst({ where: { id: req.params.id, chemical: { orgId, deletedAt: null } } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Monitoring record not found' } });
    const data = await prisma.chemMonitoring.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update monitoring record', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } });
  }
});

export default router;
