import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';

const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('risk-kri');

const kriSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().optional(),
  unit: z.string().trim().optional(),
  greenThreshold: z.number().optional(),
  amberThreshold: z.number().optional(),
  redThreshold: z.number().optional(),
  thresholdDirection: z.enum(['INCREASING_IS_WORSE', 'DECREASING_IS_WORSE']).optional(),
  measurementFrequency: z.string().trim().optional(),
  dataSource: z.string().trim().optional(),
  nextMeasurementDue: z
    .string()
    .trim()
    .datetime({ offset: true })
    .optional()
    .or(z.string().trim().datetime({ offset: true }).optional()),
});

function evaluateKriStatus(kri: Record<string, unknown>, value: number): string {
  const dir = kri.thresholdDirection || 'INCREASING_IS_WORSE';
  if (dir === 'INCREASING_IS_WORSE') {
    if (kri.redThreshold !== null && value > (kri.redThreshold as number)) return 'RED';
    if (kri.amberThreshold !== null && value > (kri.amberThreshold as number)) return 'AMBER';
    return 'GREEN';
  } else {
    if (kri.redThreshold !== null && value < (kri.redThreshold as number)) return 'RED';
    if (kri.amberThreshold !== null && value < (kri.amberThreshold as number)) return 'AMBER';
    return 'GREEN';
  }
}

// GET /api/risks/:id/kri
router.get('/:id/kri', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const kris = await prisma.riskKri.findMany({
      where: { riskId: req.params.id, isActive: true, risk: { orgId } } as any,
      include: { readings: { orderBy: { recordedAt: 'desc' }, take: 10 } },
    });
    res.json({ success: true, data: kris });
  } catch (error: unknown) {
    logger.error('Failed to fetch KRIs', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch KRIs' } });
  }
});

// POST /api/risks/:id/kri
router.post('/:id/kri', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const risk = await prisma.riskRegister.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!risk)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    const parsed = kriSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const kri = await prisma.riskKri.create({ data: { ...parsed.data, riskId: req.params.id } });
    res.status(201).json({ success: true, data: kri });
  } catch (error: unknown) {
    logger.error('Failed to create KRI', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } });
  }
});

// PUT /api/risks/:riskId/kri/:id
router.put('/:riskId/kri/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const parsed = kriSchema.partial().safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const existing = await prisma.riskKri.findFirst({
      where: {
        id: req.params.id,
        riskId: req.params.riskId,
        deletedAt: null,
        risk: { orgId },
      } as any,
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'KRI not found' } });
    const kri = await prisma.riskKri.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data: kri });
  } catch (error: unknown) {
    logger.error('Failed to update KRI', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } });
  }
});

// POST /api/risks/:riskId/kri/:id/reading
router.post('/:riskId/kri/:id/reading', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const readingSchema = z.object({
      value: z.number({ required_error: 'value is required' }),
      notes: z.string().trim().optional(),
    });
    const parsed = readingSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const { value, notes } = parsed.data;
    const kri = await prisma.riskKri.findFirst({
      where: {
        id: req.params.id,
        riskId: req.params.riskId,
        deletedAt: null,
        risk: { orgId },
      } as any,
    });
    if (!kri)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'KRI not found' } });
    const status = evaluateKriStatus(kri as any, value);
    const reading = await prisma.riskKriReading.create({
      data: {
        kriId: req.params.id,
        value,
        status: status as any,
        recordedBy: (req as AuthRequest).user?.id,
        notes,
      },
    });
    await prisma.riskKri.update({
      where: { id: req.params.id },
      data: {
        currentValue: value,
        currentStatus: status as any,
        lastMeasuredAt: new Date(),
        measuredBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data: reading });
  } catch (error: unknown) {
    logger.error('Failed to record KRI reading', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } });
  }
});

// GET /api/risks/kri/breaches
router.get('/kri/breaches', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const kris = await prisma.riskKri.findMany({
      where: {
        isActive: true,
        currentStatus: { in: ['AMBER', 'RED'] },
        risk: { orgId, deletedAt: null },
      } as any,
      include: {
        risk: { select: { id: true, title: true, referenceNumber: true, residualRiskLevel: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    });
    res.json({ success: true, data: kris });
  } catch (error: unknown) {
    logger.error('Failed to fetch KRI breaches', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch KRI breaches' },
    });
  }
});

// GET /api/risks/kri/due
router.get('/kri/due', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const kris = await prisma.riskKri.findMany({
      where: {
        isActive: true,
        nextMeasurementDue: { lte: nextWeek },
        risk: { orgId, deletedAt: null },
      } as any,
      include: { risk: { select: { id: true, title: true, referenceNumber: true } } },
      orderBy: { nextMeasurementDue: 'asc' },
      take: 1000,
    });
    res.json({ success: true, data: kris });
  } catch (error: unknown) {
    logger.error('Failed to fetch due KRIs', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch due KRIs' },
    });
  }
});

export default router;
