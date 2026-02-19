import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
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
const MEASUREMENT_METHODS = [
  'QUANTITATIVE',
  'QUALITATIVE',
  'SURVEY',
  'FINANCIAL_ANALYSIS',
  'KPI_TRACKING',
] as const;

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

router.post('/', async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().optional(),
      type: z.enum(BENEFIT_TYPES),
      projectId: z.string().trim().optional(),
      owner: z.string().trim().optional(),
      baselineValue: z.number().optional(),
      targetValue: z.number().nonnegative().optional(),
      currentValue: z.number().nonnegative().optional(),
      unit: z.string().trim().optional(),
      measurementMethod: z.enum(MEASUREMENT_METHODS).optional(),
      realisationDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      expectedRealisationDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      financialValue: z.number().optional(),
      priority: z.string().trim().optional(),
      measurementSchedule: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    const benefit = await prisma.benefit.create({
      data: {
        refNumber,
        title: data.title,
        description: data.description,
        benefitType: data.type,
        projectId: data.projectId,
        owner: data.owner ?? authReq.user?.id ?? 'unassigned',
        baselineValue: data.baselineValue ?? 0,
        targetValue: data.targetValue ?? 0,
        currentValue: data.currentValue ?? data.baselineValue ?? 0,
        unit: data.unit ?? 'units',
        measurementMethod: data.measurementMethod || 'QUANTITATIVE',
        realisationDate: (data.expectedRealisationDate || data.realisationDate) ? new Date((data.expectedRealisationDate || data.realisationDate) as string) : undefined,
        status: 'IDENTIFIED',
        createdBy: authReq.user?.id,
      },
    });

    res.status(201).json({ success: true, data: benefit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create benefit error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create benefit' },
    });
  }
});

// =============================================
// GET / — List benefits
// =============================================

router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status, type, benefitType, projectId, search } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (type) where.type = type;
    if (benefitType) where.benefitType = benefitType;
    if (projectId) where.projectId = projectId;
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
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list benefits' },
    });
  }
});

// =============================================
// GET /dashboard — Realisation overview stats
// =============================================

router.get('/dashboard', scopeToUser, async (req: Request, res: Response) => {
  try {
    const where: Record<string, unknown> = { deletedAt: null };

    const [total, realised, tracking, identified, benefits] = await Promise.all([
      prisma.benefit.count({ where }),
      prisma.benefit.count({ where: { ...where, status: 'REALISED' } }),
      prisma.benefit.count({ where: { ...where, status: 'TRACKING' } }),
      prisma.benefit.count({ where: { ...where, status: 'IDENTIFIED' } }),
      prisma.benefit.findMany({
        where,
        select: {
          benefitType: true,
          status: true,
          currentValue: true,
          targetValue: true,
        },
        take: 1000,
      }),
    ]);

    // Aggregate by type
    const byType: Record<string, number> = {};

    for (const b of benefits as Array<Record<string, unknown>>) {
      const t = (b.type || b.benefitType) as string;
      byType[t] = (byType[t] || 0) + 1;
    }

    // Calculate financial summary
    const financialBenefits = (benefits as Array<Record<string, unknown>>).filter((b) => (b.type || b.benefitType) === "FINANCIAL");
    const financialSummary = {
      totalValue: financialBenefits.reduce((sum, b) => sum + (Number(b.financialValue) || 0), 0),
      realisedValue: financialBenefits.filter((b) => b.status === "REALISED").reduce((sum, b) => sum + (Number(b.currentValue) || 0), 0),
    };

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
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get benefit dashboard' },
    });
  }
});

// =============================================
// GET /:id — Get with measurement history
// =============================================

router.get('/:id', checkOwnership(prisma.benefit), async (req: Request, res: Response) => {
  try {
    const benefit = await prisma.benefit.findUnique({
      where: { id: req.params.id },
    });

    if (!benefit || benefit.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Benefit not found' } });
    }

    const measurements = await prisma.benefitMeasurement.findMany({
      where: { benefitId: benefit.id },
      orderBy: { measureDate: 'desc' as const },
      take: 1000,
    });

    res.json({ success: true, data: { ...benefit, measurements } });
  } catch (error) {
    logger.error('Get benefit error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get benefit' },
    });
  }
});

// =============================================
// PUT /:id — Update benefit
// =============================================

router.put('/:id', checkOwnership(prisma.benefit), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.benefit.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Benefit not found' } });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().optional(),
      type: z.enum(BENEFIT_TYPES).optional(),
      benefitType: z.enum(BENEFIT_TYPES).optional(),
      owner: z.string().trim().optional(),
      baselineValue: z.number().optional(),
      targetValue: z.number().nonnegative().optional(),
      currentValue: z.number().nonnegative().optional(),
      unit: z.string().trim().optional(),
      measurementMethod: z.enum(MEASUREMENT_METHODS).optional(),
      realisationDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      status: z
        .enum([
          'IDENTIFIED',
          'PLANNED',
          'TRACKING',
          'REALISED',
          'EXCEEDED',
          'NOT_ACHIEVED',
          'BASELINED',
        ])
        .optional(),
    });

    const data = schema.parse(req.body);

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.benefitType !== undefined) updateData.benefitType = data.benefitType;
    if (data.owner !== undefined) updateData.owner = data.owner;
    if (data.baselineValue !== undefined) updateData.baselineValue = data.baselineValue;
    if (data.targetValue !== undefined) updateData.targetValue = data.targetValue;
    if (data.currentValue !== undefined) updateData.currentValue = data.currentValue;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.measurementMethod !== undefined) updateData.measurementMethod = data.measurementMethod;
    if (data.realisationDate !== undefined)
      updateData.realisationDate = new Date(data.realisationDate);
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
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Update benefit error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update benefit' },
    });
  }
});

// =============================================
// POST /:id/measurements — Log measurement
// =============================================

router.post(
  '/:id/measurements',
  checkOwnership(prisma.benefit),
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    try {
      const existing = await prisma.benefit.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.deletedAt) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Benefit not found' } });
      }

      const schema = z.object({
        value: z.number().optional(),
        measuredValue: z.number().optional(),
        notes: z.string().trim().optional(),
        measuredAt: z.string().trim().optional(),
        measureDate: z.string().trim().optional(),
        source: z.string().trim().optional(),
      }).refine((d) => d.value !== undefined || d.measuredValue !== undefined, { message: "value is required" });

      const data = schema.parse(req.body);
      const measureVal = data.value ?? data.measuredValue ?? 0;
      const measureDt = data.measuredAt || data.measureDate;

      const measurement = await prisma.benefitMeasurement.create({
        data: {
          benefitId: existing.id,
          measuredValue: measureVal,
          notes: data.notes,
          measureDate: measureDt ? new Date(measureDt) : new Date(),
          measuredBy: authReq.user?.id,
        },
      });

      // Update current value on the benefit
      await prisma.benefit.update({
        where: { id: existing.id },
        data: {
          currentValue: measureVal,
          status: (existing.status === 'IDENTIFIED' || existing.status === 'PLANNED') ? 'TRACKING' : existing.status,
        },
      });

      res.status(201).json({ success: true, data: measurement });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            fields: error.errors.map((e) => e.path.join('.')),
          },
        });
      }
      logger.error('Create measurement error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to create measurement' },
      });
    }
  }
);

// =============================================
// DELETE /:id — Soft delete
// =============================================

router.delete('/:id', checkOwnership(prisma.benefit), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.benefit.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Benefit not found' } });
    }

    await prisma.benefit.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Benefit deleted' } });
  } catch (error) {
    logger.error('Delete benefit error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete benefit' },
    });
  }
});

export default router;
