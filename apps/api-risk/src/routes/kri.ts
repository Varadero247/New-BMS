import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('risk-kri');

const kriSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  unit: z.string().optional(),
  greenThreshold: z.number().optional(),
  amberThreshold: z.number().optional(),
  redThreshold: z.number().optional(),
  thresholdDirection: z.enum(['INCREASING_IS_WORSE', 'DECREASING_IS_WORSE']).optional(),
  measurementFrequency: z.string().optional(),
  dataSource: z.string().optional(),
  nextMeasurementDue: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
});

function evaluateKriStatus(kri: any, value: number): string {
  const dir = kri.thresholdDirection || 'INCREASING_IS_WORSE';
  if (dir === 'INCREASING_IS_WORSE') {
    if (kri.redThreshold != null && value > kri.redThreshold) return 'RED';
    if (kri.amberThreshold != null && value > kri.amberThreshold) return 'AMBER';
    return 'GREEN';
  } else {
    if (kri.redThreshold != null && value < kri.redThreshold) return 'RED';
    if (kri.amberThreshold != null && value < kri.amberThreshold) return 'AMBER';
    return 'GREEN';
  }
}

// GET /api/risks/:id/kri
router.get('/:id/kri', authenticate, async (req: Request, res: Response) => {
  try {
    const kris = await (prisma as any).riskKri.findMany({
      where: { riskId: req.params.id, isActive: true },
      include: { readings: { orderBy: { recordedAt: 'desc' }, take: 10 } },
    });
    res.json({ success: true, data: kris });
  } catch (error: any) { logger.error('Failed to fetch KRIs', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch KRIs' } }); }
});

// POST /api/risks/:id/kri
router.post('/:id/kri', authenticate, async (req: Request, res: Response) => {
  try {
    const risk = await (prisma as any).riskRegister.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!risk) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    const parsed = kriSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const kri = await (prisma as any).riskKri.create({ data: { ...parsed.data, riskId: req.params.id } });
    res.status(201).json({ success: true, data: kri });
  } catch (error: any) { logger.error('Failed to create KRI', { error: error.message }); res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); }
});

// PUT /api/risks/:riskId/kri/:id
router.put('/:riskId/kri/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = kriSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await (prisma as any).riskKri.findFirst({ where: { id: req.params.id, riskId: req.params.riskId } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'KRI not found' } });
    const kri = await (prisma as any).riskKri.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data: kri });
  } catch (error: any) { logger.error('Failed to update KRI', { error: error.message }); res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); }
});

// POST /api/risks/:riskId/kri/:id/reading
router.post('/:riskId/kri/:id/reading', authenticate, async (req: Request, res: Response) => {
  try {
    const readingSchema = z.object({ value: z.number({ required_error: 'value is required' }), notes: z.string().optional() });
    const parsed = readingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const { value, notes } = parsed.data;
    const kri = await (prisma as any).riskKri.findFirst({ where: { id: req.params.id, riskId: req.params.riskId } });
    if (!kri) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'KRI not found' } });
    const status = evaluateKriStatus(kri, value);
    const reading = await (prisma as any).riskKriReading.create({
      data: { kriId: req.params.id, value, status, recordedBy: (req as any).user?.id, notes },
    });
    await (prisma as any).riskKri.update({
      where: { id: req.params.id },
      data: { currentValue: value, currentStatus: status, lastMeasuredAt: new Date(), measuredBy: (req as any).user?.id },
    });
    res.status(201).json({ success: true, data: reading });
  } catch (error: any) { logger.error('Failed to record KRI reading', { error: error.message }); res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); }
});

// GET /api/risks/kri/breaches
router.get('/kri/breaches', authenticate, async (req: Request, res: Response) => {
  try {
    const kris = await (prisma as any).riskKri.findMany({
      where: { isActive: true, currentStatus: { in: ['AMBER', 'RED'] } },
      include: { risk: { select: { id: true, title: true, referenceNumber: true, residualRiskLevel: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ success: true, data: kris });
  } catch (error: any) { logger.error('Failed to fetch KRI breaches', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch KRI breaches' } }); }
});

// GET /api/risks/kri/due
router.get('/kri/due', authenticate, async (req: Request, res: Response) => {
  try {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const kris = await (prisma as any).riskKri.findMany({
      where: { isActive: true, nextMeasurementDue: { lte: nextWeek } },
      include: { risk: { select: { id: true, title: true, referenceNumber: true } } },
      orderBy: { nextMeasurementDue: 'asc' },
    });
    res.json({ success: true, data: kris });
  } catch (error: any) { logger.error('Failed to fetch due KRIs', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch due KRIs' } }); }
});

export default router;
