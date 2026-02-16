import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { calculateWelPercentage, getWelStatus } from '../services/riskCalculator';

const router = Router();
const logger = createLogger('chem-monitoring');

const monitoringTypeEnum = z.enum(['AIR_SAMPLE', 'BIOLOGICAL', 'WIPE_SAMPLE']);

const createMonitoringSchema = z.object({
  chemicalId: z.string().min(1),
  coshhAssessmentId: z.string().optional(),
  monitoringType: monitoringTypeEnum,
  location: z.string().optional(),
  sampledBy: z.string().optional(),
  sampledAt: z.string().datetime({ offset: true }).or(z.string().datetime()),
  resultValue: z.number().optional(),
  resultUnit: z.string().optional(),
  welTwaLimit: z.number().optional(),
  welStelLimit: z.number().optional(),
  reportUrl: z.string().optional(),
  nextMonitoringDue: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  actionTaken: z.string().optional(),
});

const updateMonitoringSchema = createMonitoringSchema.partial();

// GET /api/monitoring/overdue — due monitoring not done
router.get('/overdue', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const data = await (prisma as any).chemMonitoring.findMany({
      where: { nextMonitoringDue: { lte: new Date() }, chemical: { orgId, isActive: true, deletedAt: null } },
      include: { chemical: { select: { id: true, productName: true, casNumber: true } } },
      orderBy: { nextMonitoringDue: 'asc' },
    });
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error('Failed to fetch overdue monitoring', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch overdue monitoring' } });
  }
});

// GET /api/monitoring/dashboard — WEL exceedance summary
router.get('/dashboard', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const [total, aboveWel, atWel, belowWel, overdue] = await Promise.all([
      (prisma as any).chemMonitoring.count({ where: { chemical: { orgId, deletedAt: null } } }),
      (prisma as any).chemMonitoring.count({ where: { resultVsWel: 'ABOVE_WEL', chemical: { orgId, deletedAt: null } } }),
      (prisma as any).chemMonitoring.count({ where: { resultVsWel: 'AT_WEL', chemical: { orgId, deletedAt: null } } }),
      (prisma as any).chemMonitoring.count({ where: { resultVsWel: 'BELOW_WEL', chemical: { orgId, deletedAt: null } } }),
      (prisma as any).chemMonitoring.count({ where: { nextMonitoringDue: { lte: new Date() }, chemical: { orgId, deletedAt: null } } }),
    ]);
    res.json({ success: true, data: { total, aboveWel, atWel, belowWel, overdue } });
  } catch (error: any) {
    logger.error('Failed to fetch monitoring dashboard', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch monitoring dashboard' } });
  }
});

// GET /api/monitoring — all monitoring records
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const { chemicalId, welResult, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: any = { chemical: { orgId, deletedAt: null } };
    if (chemicalId) where.chemicalId = chemicalId;
    if (welResult) where.resultVsWel = welResult;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      (prisma as any).chemMonitoring.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { sampledAt: 'desc' },
        include: { chemical: { select: { id: true, productName: true, casNumber: true } } },
      }),
      (prisma as any).chemMonitoring.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error: any) {
    logger.error('Failed to fetch monitoring records', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch monitoring records' } });
  }
});

// POST /api/monitoring — log monitoring result
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createMonitoringSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const d = parsed.data;

    const chemical = await (prisma as any).chemRegister.findFirst({ where: { id: d.chemicalId, deletedAt: null } });
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

    const data = await (prisma as any).chemMonitoring.create({
      data: {
        ...d,
        welTwaLimit: welLimit,
        percentageOfWel,
        resultVsWel,
        actionRequired,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    logger.error('Failed to create monitoring record', { error: error.message });
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

// PUT /api/monitoring/:id — update monitoring record
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateMonitoringSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await (prisma as any).chemMonitoring.findFirst({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Monitoring record not found' } });
    const data = await (prisma as any).chemMonitoring.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error('Failed to update monitoring record', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } });
  }
});

export default router;
