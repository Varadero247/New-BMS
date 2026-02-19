import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma} from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-finance');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `FIN-${prefix}-${yy}${mm}-${rand}`;
}

// Validation schemas
const createTaxRateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  code: z.string().trim().min(1).max(200),
  rate: z.number().min(0).max(100),
  jurisdiction: z
    .enum(['UK_VAT', 'US_SALES', 'EU_VAT', 'CANADA_GST', 'AUSTRALIA_GST', 'OTHER'])
    .default('UK_VAT'),
  isDefault: z.boolean().optional(),
  description: z.string().trim().optional(),
  effectiveFrom: z.string().trim().optional(),
  effectiveTo: z.string().trim().optional(),
});

const createTaxReturnSchema = z.object({
  taxRateId: z.string().trim().uuid(),
  periodStart: z
    .string()
    .trim()
    .min(1)
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  periodEnd: z
    .string()
    .trim()
    .min(1)
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  notes: z.string().trim().optional(),
});

// ============================================
// TAX RATES
// ============================================

// GET /api/tax/rates - List tax rates
router.get('/rates', async (req: Request, res: Response) => {
  try {
    const { jurisdiction, isActive } = req.query;

    const where: Record<string, unknown> = { deletedAt: null };
    if (jurisdiction) where.jurisdiction = jurisdiction;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const rates = await prisma.finTaxRate.findMany({
      where,
      orderBy: [{ jurisdiction: 'asc' }, { rate: 'asc' }],
      take: 1000,
    });

    res.json({ success: true, data: rates });
  } catch (error: unknown) {
    logger.error('Error listing tax rates', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list tax rates' },
    });
  }
});

// GET /api/tax/rates/:id - Get tax rate
router.get('/rates/:id', async (req: Request, res: Response) => {
  try {
    const rate = await prisma.finTaxRate.findUnique({ where: { id: req.params.id } });
    if (!rate) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Tax rate not found' } });
    }
    res.json({ success: true, data: rate });
  } catch (error: unknown) {
    logger.error('Error getting tax rate', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get tax rate' },
    });
  }
});

// POST /api/tax/rates - Create tax rate
router.post('/rates', async (req: Request, res: Response) => {
  try {
    const data = createTaxRateSchema.parse(req.body);
    const user = (req as AuthRequest).user;

    // If this is set as default, unset other defaults in same jurisdiction
    if (data.isDefault) {
      await prisma.finTaxRate.updateMany({
        where: { jurisdiction: data.jurisdiction, isDefault: true },
        data: { isDefault: false },
      });
    }

    const rate = await prisma.finTaxRate.create({
      data: {
        ...data,
        effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined,
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
        createdBy: user!.id,
      },
    });

    res.status(201).json({ success: true, data: rate });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE', message: 'Tax rate code already exists' },
      });
    }
    logger.error('Error creating tax rate', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create tax rate' },
    });
  }
});

// PUT /api/tax/rates/:id - Update tax rate
router.put('/rates/:id', async (req: Request, res: Response) => {
  try {
    const data = createTaxRateSchema.partial().parse(req.body);

    const existing = await prisma.finTaxRate.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Tax rate not found' } });
    }

    const rate = await prisma.finTaxRate.update({
      where: { id: req.params.id },
      data: {
        ...data,
        effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : undefined,
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : undefined,
      },
    });

    res.json({ success: true, data: rate });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    logger.error('Error updating tax rate', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update tax rate' },
    });
  }
});

// DELETE /api/tax/rates/:id - Soft delete tax rate
router.delete('/rates/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.finTaxRate.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Tax rate not found' } });
    }

    await prisma.finTaxRate.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    res.json({ success: true, data: { message: 'Tax rate deleted' } });
  } catch (error: unknown) {
    logger.error('Error deleting tax rate', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete tax rate' },
    });
  }
});

// ============================================
// TAX RETURNS
// ============================================

// GET /api/tax/returns - List tax returns
router.get('/returns', async (req: Request, res: Response) => {
  try {
    const { status, taxRateId, year, page = '1', limit = '20' } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (taxRateId) where.taxRateId = taxRateId;
    if (year) {
      where.periodStart = { gte: new Date(`${year}-01-01`) };
      where.periodEnd = { lte: new Date(`${year}-12-31`) };
    }

    const [returns, total] = await Promise.all([
      prisma.finTaxReturn.findMany({
        where,
        include: {
          taxRate: { select: { id: true, name: true, code: true, rate: true, jurisdiction: true } },
        },
        orderBy: { periodStart: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.finTaxReturn.count({ where }),
    ]);

    res.json({
      success: true,
      data: returns,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: unknown) {
    logger.error('Error listing tax returns', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list tax returns' },
    });
  }
});

// GET /api/tax/returns/:id - Get tax return
router.get('/returns/:id', async (req: Request, res: Response) => {
  try {
    const taxReturn = await prisma.finTaxReturn.findUnique({
      where: { id: req.params.id },
      include: { taxRate: true },
    });

    if (!taxReturn) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Tax return not found' } });
    }

    res.json({ success: true, data: taxReturn });
  } catch (error: unknown) {
    logger.error('Error getting tax return', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get tax return' },
    });
  }
});

// POST /api/tax/returns - Create tax return
router.post('/returns', async (req: Request, res: Response) => {
  try {
    const data = createTaxReturnSchema.parse(req.body);
    const user = (req as AuthRequest).user;

    const taxRate = await prisma.finTaxRate.findUnique({ where: { id: data.taxRateId } });
    if (!taxRate) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Tax rate not found' } });
    }

    const taxReturn = await prisma.finTaxReturn.create({
      data: {
        reference: generateReference('TAX'),
        taxRateId: data.taxRateId,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        notes: data.notes,
        createdBy: user!.id,
      },
      include: { taxRate: true },
    });

    res.status(201).json({ success: true, data: taxReturn });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    logger.error('Error creating tax return', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create tax return' },
    });
  }
});

// PUT /api/tax/returns/:id - Update tax return
router.put('/returns/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.finTaxReturn.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Tax return not found' } });
    }

    if (existing.status !== 'DRAFT' && existing.status !== 'CALCULATED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Can only update draft or calculated tax returns',
        },
      });
    }

    const _schema = z.object({
      salesTax: z.number().nonnegative().optional(),
      purchaseTax: z.number().nonnegative().optional(),
      notes: z.string().trim().optional(),
    });
    const _parsed = _schema.safeParse(req.body);
    if (!_parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: _parsed.error.errors[0].message },
      });
    const { salesTax, purchaseTax, notes } = _parsed.data;
    const netTax =
      (salesTax ?? Number(existing.salesTax)) - (purchaseTax ?? Number(existing.purchaseTax));

    const taxReturn = await prisma.finTaxReturn.update({
      where: { id: req.params.id },
      data: {
        salesTax: salesTax ?? undefined,
        purchaseTax: purchaseTax ?? undefined,
        netTax,
        notes: notes ?? undefined,
        status: 'CALCULATED',
      },
      include: { taxRate: true },
    });

    res.json({ success: true, data: taxReturn });
  } catch (error: unknown) {
    logger.error('Error updating tax return', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update tax return' },
    });
  }
});

// POST /api/tax/returns/:id/submit - Submit tax return
router.post('/returns/:id/submit', async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;

    const existing = await prisma.finTaxReturn.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Tax return not found' } });
    }

    if (existing.status !== 'CALCULATED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Tax return must be calculated before submitting',
        },
      });
    }

    const taxReturn = await prisma.finTaxReturn.update({
      where: { id: req.params.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        submittedBy: user!.id,
      },
      include: { taxRate: true },
    });

    res.json({ success: true, data: taxReturn });
  } catch (error: unknown) {
    logger.error('Error submitting tax return', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to submit tax return' },
    });
  }
});

// GET /api/tax/report - Tax summary report
router.get('/report', async (req: Request, res: Response) => {
  try {
    const { periodStart, periodEnd, jurisdiction } = req.query;

    const where: Record<string, unknown> = { deletedAt: null };
    if (jurisdiction) where.taxRate = { jurisdiction };
    if (periodStart || periodEnd) {
      if (periodStart) where.periodStart = { gte: new Date(periodStart as string) };
      if (periodEnd) where.periodEnd = { lte: new Date(periodEnd as string) };
    }

    const returns = await prisma.finTaxReturn.findMany({
      where,
      include: { taxRate: { select: { name: true, code: true, rate: true, jurisdiction: true } } },
      orderBy: { periodStart: 'asc' },
      take: 1000,
    });

    const summary = {
      totalSalesTax: returns.reduce((sum, r) => sum + Number(r.salesTax), 0),
      totalPurchaseTax: returns.reduce((sum, r) => sum + Number(r.purchaseTax), 0),
      totalNetTax: returns.reduce((sum, r) => sum + Number(r.netTax), 0),
      returnCount: returns.length,
      byStatus: {
        draft: returns.filter((r) => r.status === 'DRAFT').length,
        calculated: returns.filter((r) => r.status === 'CALCULATED').length,
        submitted: returns.filter((r) => r.status === 'SUBMITTED').length,
        accepted: returns.filter((r) => r.status === 'ACCEPTED').length,
      },
      returns,
    };

    res.json({ success: true, data: summary });
  } catch (error: unknown) {
    logger.error('Error generating tax report', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate tax report' },
    });
  }
});

export default router;
