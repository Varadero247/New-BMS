import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-payroll');

const router: Router = Router();
router.use(authenticate);

// GET /api/tax/filings - Get tax filings
router.get('/filings', async (req: Request, res: Response) => {
  try {
    const { taxYear, filingType, status } = req.query;

    const where: Prisma.TaxFilingWhereInput = {};
    if (taxYear) where.taxYear = parseInt(taxYear as string);
    if (filingType) where.filingType = filingType as string;
    if (status) where.status = status as string;

    const filings = await prisma.taxFiling.findMany({
      where,
      include: {
        payrollRun: { select: { runNumber: true, periodStart: true, periodEnd: true } },
      },
      orderBy: { filingDeadline: 'desc' },
    });

    res.json({ success: true, data: filings });
  } catch (error) {
    logger.error('Error fetching tax filings', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch filings' } });
  }
});

// POST /api/tax/filings - Create tax filing
router.post('/filings', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      payrollRunId: z.string().uuid().optional(),
      filingType: z.enum(['WITHHOLDING', 'QUARTERLY', 'ANNUAL', 'AMENDMENT', 'SOCIAL_SECURITY', 'MEDICARE', 'STATE', 'LOCAL']),
      taxPeriod: z.string(),
      taxYear: z.number(),
      grossWages: z.number(),
      taxableWages: z.number(),
      taxWithheld: z.number(),
      employerTax: z.number().default(0),
      filingDeadline: z.string(),
    });

    const data = schema.parse(req.body);

    const filing = await prisma.taxFiling.create({
      data: {
        ...data,
        filingDeadline: new Date(data.filingDeadline),
        totalTax: data.taxWithheld + data.employerTax,
        paymentDue: data.taxWithheld + data.employerTax,
        status: 'PENDING',
      },
    });

    res.status(201).json({ success: true, data: filing });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating filing', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create filing' } });
  }
});

// PUT /api/tax/filings/:id/file - Submit tax filing
router.put('/filings/:id/file', async (req: Request, res: Response) => {
  try {
    const { filedById, confirmationNumber, filingDocumentUrl } = req.body;

    const filing = await prisma.taxFiling.update({
      where: { id: req.params.id },
      data: {
        status: 'FILED',
        filedAt: new Date(),
        filedById,
        confirmationNumber,
        filingDocumentUrl,
      },
    });

    res.json({ success: true, data: filing });
  } catch (error) {
    logger.error('Error filing tax', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to file tax' } });
  }
});

// PUT /api/tax/filings/:id/pay - Record tax payment
router.put('/filings/:id/pay', async (req: Request, res: Response) => {
  try {
    const { paymentReference } = req.body;

    const filing = await prisma.taxFiling.update({
      where: { id: req.params.id },
      data: {
        paymentStatus: 'COMPLETED',
        paymentDate: new Date(),
        paymentReference,
      },
    });

    res.json({ success: true, data: filing });
  } catch (error) {
    logger.error('Error recording tax payment', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record payment' } });
  }
});

// GET /api/tax/brackets - Get tax brackets
router.get('/brackets', async (req: Request, res: Response) => {
  try {
    const { taxYear, country } = req.query;

    const where: Prisma.TaxBracketWhereInput = { isActive: true };
    if (taxYear) where.taxYear = parseInt(taxYear as string);
    if (country) where.country = country as string;

    const brackets = await prisma.taxBracket.findMany({
      where,
      orderBy: { minIncome: 'asc' },
    });

    res.json({ success: true, data: brackets });
  } catch (error) {
    logger.error('Error fetching tax brackets', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch brackets' } });
  }
});

// POST /api/tax/brackets - Create tax bracket
router.post('/brackets', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      taxYear: z.number(),
      country: z.string(),
      region: z.string().optional(),
      filingStatus: z.string().optional(),
      minIncome: z.number(),
      maxIncome: z.number().optional(),
      rate: z.number(),
      fixedAmount: z.number().default(0),
    });

    const data = schema.parse(req.body);

    const bracket = await prisma.taxBracket.create({ data });

    res.status(201).json({ success: true, data: bracket });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating bracket', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create bracket' } });
  }
});

// GET /api/tax/summary - Get tax summary
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const year = parseInt((req.query.year as string) || String(new Date().getFullYear()));

    const [filings, totals] = await Promise.all([
      prisma.taxFiling.groupBy({
        by: ['status'],
        where: { taxYear: year },
        _count: true,
      }),
      prisma.taxFiling.aggregate({
        where: { taxYear: year },
        _sum: { totalTax: true, paymentDue: true },
      }),
    ]);

    // Upcoming deadlines
    const upcomingDeadlines = await prisma.taxFiling.findMany({
      where: {
        taxYear: year,
        status: { in: ['PENDING', 'PREPARED'] },
        filingDeadline: { gte: new Date() },
      },
      orderBy: { filingDeadline: 'asc' },
      take: 5,
    });

    res.json({
      success: true,
      data: {
        byStatus: filings,
        totalTax: totals._sum.totalTax || 0,
        totalDue: totals._sum.paymentDue || 0,
        upcomingDeadlines,
      },
    });
  } catch (error) {
    logger.error('Error fetching tax summary', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch summary' } });
  }
});

export default router;
