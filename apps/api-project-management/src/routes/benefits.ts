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

// =============================================
// Constants
// =============================================

const BENEFIT_TYPES = ['FINANCIAL', 'STRATEGIC', 'OPERATIONAL', 'SOCIAL_ENVIRONMENTAL'] as const;
const BENEFIT_STATUSES = ['IDENTIFIED', 'BASELINED', 'TRACKING', 'REALISED', 'PARTIALLY_REALISED', 'NOT_REALISED', 'CLOSED'] as const;
const MEASUREMENT_METHODS = ['QUANTITATIVE', 'QUALITATIVE', 'SURVEY', 'FINANCIAL_ANALYSIS', 'KPI_TRACKING'] as const;

// =============================================
// Reference number generator
// =============================================

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `BEN-${yy}${mm}`;
  const count = await prisma.benefit.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// =============================================
// POST / — Create benefit
// =============================================

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      description: z.string().optional(),
      type: z.enum(BENEFIT_TYPES),
      projectId: z.string().optional(),
      owner: z.string().optional(),
      baselineValue: z.number().optional(),
      targetValue: z.number().nonnegative().optional(),
      currentValue: z.number().nonnegative().optional(),
      unit: z.string().optional(),
      measurementMethod: z.enum(MEASUREMENT_METHODS).optional(),
      measurementSchedule: z.string().optional(),
      expectedRealisationDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      financialValue: z.number().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    const benefit = await prisma.benefit.create({
      data: {
        refNumber,
        title: data.title,
        description: data.description,
        type: data.type,
        projectId: data.projectId,
        owner: data.owner,
        baselineValue: data.baselineValue,
        targetValue: data.targetValue,
        currentValue: data.currentValue ?? data.baselineValue,
        unit: data.unit,
        measurementMethod: data.measurementMethod || 'QUANTITATIVE',
        measurementSchedule: data.measurementSchedule,
        expectedRealisationDate: data.expectedRealisationDate ? new Date(data.expectedRealisationDate) : undefined,
        financialValue: data.financialValue,
        priority: data.priority || 'MEDIUM',
        status: 'IDENTIFIED',
        createdBy: req.user!.id,
      } as any,
    });

    res.status(201).json({ success: true, data: benefit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create benefit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create benefit' } });
  }
});

// =============================================
// GET / — List benefits
// =============================================

router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, type, projectId, search } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status as any;
    if (type) where.type = type as any;
    if (projectId) where.projectId = projectId as any;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.benefit.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.benefit.count({ where }),
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
    logger.error('List benefits error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list benefits' } });
  }
});

// =============================================
// GET /dashboard — Realisation overview stats
// =============================================

router.get('/dashboard', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const where: Record<string, unknown> = { deletedAt: null };

    const [total, realised, tracking, identified, benefits] = await Promise.all([
      prisma.benefit.count({ where }),
      prisma.benefit.count({ where: { ...where, status: 'REALISED' } }),
      prisma.benefit.count({ where: { ...where, status: 'TRACKING' } }),
      prisma.benefit.count({ where: { ...where, status: 'IDENTIFIED' } }),
      prisma.benefit.findMany({ where, select: { type: true, financialValue: true, status: true, currentValue: true, targetValue: true } as any,
      take: 1000}),
    ]);

    // Aggregate by type
    const byType: Record<string, number> = {};
    const financialSummary = { totalExpected: 0, totalRealised: 0 };

    for (const b of benefits as any[]) {
      byType[b.type] = (byType[b.type] || 0) + 1;
      if (b.financialValue) financialSummary.totalExpected += b.financialValue;
      if (b.status === 'REALISED' && b.financialValue) financialSummary.totalRealised += b.financialValue;
    }

    // Calculate realisation rate
    const realisationRate = total > 0 ? Math.round((realised / total) * 100) : 0;

    res.json({
      success: true,
      data: {
        total,
        realised,
        tracking,
        identified,
        realisationRate,
        byType,
        financialSummary,
      },
    });
  } catch (error) {
    logger.error('Benefit dashboard error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get benefit dashboard' } });
  }
});

// =============================================
// GET /:id — Get with measurement history
// =============================================

router.get('/:id', checkOwnership(prisma.benefit), async (req: AuthRequest, res: Response) => {
  try {
    const benefit = await prisma.benefit.findUnique({
      where: { id: req.params.id },
    });

    if (!benefit || benefit.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Benefit not found' } });
    }

    const measurements = await prisma.benefitMeasurement.findMany({
      where: { benefitId: benefit.id },
      orderBy: { measuredAt: 'desc' } as any,
      take: 1000});

    res.json({ success: true, data: { ...benefit, measurements } });
  } catch (error) {
    logger.error('Get benefit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get benefit' } });
  }
});

// =============================================
// PUT /:id — Update benefit
// =============================================

router.put('/:id', checkOwnership(prisma.benefit), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.benefit.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Benefit not found' } });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().optional(),
      type: z.enum(BENEFIT_TYPES).optional(),
      owner: z.string().optional(),
      baselineValue: z.number().optional(),
      targetValue: z.number().nonnegative().optional(),
      currentValue: z.number().nonnegative().optional(),
      unit: z.string().optional(),
      measurementMethod: z.enum(MEASUREMENT_METHODS).optional(),
      measurementSchedule: z.string().optional(),
      expectedRealisationDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      financialValue: z.number().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      status: z.enum(['IDENTIFIED', 'BASELINED', 'TRACKING', 'REALISED', 'PARTIALLY_REALISED', 'NOT_REALISED', 'CLOSED']).optional(),
    });

    const data = schema.parse(req.body);

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.owner !== undefined) updateData.owner = data.owner;
    if (data.baselineValue !== undefined) updateData.baselineValue = data.baselineValue;
    if (data.targetValue !== undefined) updateData.targetValue = data.targetValue;
    if (data.currentValue !== undefined) updateData.currentValue = data.currentValue;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.measurementMethod !== undefined) updateData.measurementMethod = data.measurementMethod;
    if (data.measurementSchedule !== undefined) updateData.measurementSchedule = data.measurementSchedule;
    if (data.expectedRealisationDate !== undefined) updateData.expectedRealisationDate = new Date(data.expectedRealisationDate);
    if (data.financialValue !== undefined) updateData.financialValue = data.financialValue;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;

    const benefit = await prisma.benefit.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: benefit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update benefit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update benefit' } });
  }
});

// =============================================
// POST /:id/measurements — Log measurement
// =============================================

router.post('/:id/measurements', checkOwnership(prisma.benefit), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.benefit.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Benefit not found' } });
    }

    const schema = z.object({
      value: z.number(),
      notes: z.string().optional(),
      measuredAt: z.string().optional(),
      source: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const measurement = await prisma.benefitMeasurement.create({
      data: {
        benefitId: existing.id,
        value: data.value,
        notes: data.notes,
        measuredAt: data.measuredAt ? new Date(data.measuredAt) : new Date(),
        source: data.source,
        measuredBy: req.user!.id,
      } as any,
    });

    // Update current value on the benefit
    await prisma.benefit.update({
      where: { id: existing.id },
      data: {
        currentValue: data.value,
        status: existing.status === 'IDENTIFIED' ? 'TRACKING' : existing.status,
      },
    });

    res.status(201).json({ success: true, data: measurement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create measurement error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create measurement' } });
  }
});

// =============================================
// DELETE /:id — Soft delete
// =============================================

router.delete('/:id', checkOwnership(prisma.benefit), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.benefit.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Benefit not found' } });
    }

    await prisma.benefit.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), deletedBy: req.user!.id } as any,
    });

    res.json({ success: true, data: { message: 'Benefit deleted' } });
  } catch (error) {
    logger.error('Delete benefit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete benefit' } });
  }
});

export default router;
