import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const createCategorySchema = z.object({
  category: z.string().min(1, 'category is required'),
  legalBasis: z.string().min(1, 'legalBasis is required'),
  retentionDays: z.number().optional(),
  systems: z.string().nullable().optional(),
  complianceStatus: z.string().optional(),
});

const createDpaSchema = z.object({
  processorName: z.string().min(1, 'processorName is required'),
  purpose: z.string().min(1, 'purpose is required'),
  dataTypes: z.array(z.string()).optional(),
  signedDate: z.string().nullable().refine(s => s === null || !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  expiryDate: z.string().nullable().refine(s => s === null || !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  documentUrl: z.string().nullable().optional(),
});

const logger = createLogger('gdpr');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// GET /categories — List all GDPR data categories
// ---------------------------------------------------------------------------
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.gdprDataCategory.findMany({
      orderBy: { category: 'asc' },
      take: 500,
    });
    res.json({ success: true, data: { categories } });
  } catch (err) {
    logger.error('Failed to list GDPR categories', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list categories' } });
  }
});

// ---------------------------------------------------------------------------
// GET /dpas — List data processing agreements
// ---------------------------------------------------------------------------
router.get('/dpas', async (_req: Request, res: Response) => {
  try {
    const dpas = await prisma.dataProcessingAgreement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    res.json({ success: true, data: { dpas } });
  } catch (err) {
    logger.error('Failed to list DPAs', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list DPAs' } });
  }
});

// ---------------------------------------------------------------------------
// GET /report — GDPR compliance report
// ---------------------------------------------------------------------------
router.get('/report', async (_req: Request, res: Response) => {
  try {
    const [categories, dpas, dataRequests] = await Promise.all([
      prisma.gdprDataCategory.findMany({ orderBy: { category: 'asc' }, take: 500 }),
      prisma.dataProcessingAgreement.findMany({ orderBy: { createdAt: 'desc' }, take: 500 }),
      prisma.dataRequest.findMany({ take: 1000, orderBy: { createdAt: 'desc' } }),
    ]);

    const requestStats = {
      total: dataRequests.length,
      received: dataRequests.filter((r: Record<string, unknown>) => r.status === 'RECEIVED').length,
      verified: dataRequests.filter((r: Record<string, unknown>) => r.status === 'VERIFIED').length,
      processing: dataRequests.filter((r: Record<string, unknown>) => r.status === 'PROCESSING').length,
      completed: dataRequests.filter((r: Record<string, unknown>) => r.status === 'COMPLETED').length,
      rejected: dataRequests.filter((r: Record<string, unknown>) => r.status === 'REJECTED').length,
    };

    const atRiskCategories = categories.filter((c: Record<string, unknown>) => c.complianceStatus === 'AT_RISK');
    const activeDpas = dpas.filter((d: Record<string, unknown>) => d.isActive);

    res.json({
      success: true,
      data: {
        categories,
        dpas,
        requestStats,
        summary: {
          totalCategories: categories.length,
          atRiskCategories: atRiskCategories.length,
          totalDpas: dpas.length,
          activeDpas: activeDpas.length,
          totalRequests: requestStats.total,
          pendingRequests: requestStats.received + requestStats.verified + requestStats.processing,
        },
      },
    });
  } catch (err) {
    logger.error('Failed to generate GDPR report', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate report' } });
  }
});

// ---------------------------------------------------------------------------
// POST /categories — Create data category
// ---------------------------------------------------------------------------
router.post('/categories', async (req: Request, res: Response) => {
  try {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }

    const { category: categoryName, legalBasis, retentionDays, systems, complianceStatus } = parsed.data;

    const created = await prisma.gdprDataCategory.create({
      data: {
        category: categoryName,
        legalBasis,
        retentionDays: retentionDays || 730,
        systems: (systems || null) as any,
        complianceStatus: complianceStatus || 'COMPLIANT',
      },
    });

    logger.info('GDPR data category created', { id: created.id, category: categoryName });
    res.status(201).json({ success: true, data: { category: created } });
  } catch (err) {
    logger.error('Failed to create GDPR category', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create category' } });
  }
});

// ---------------------------------------------------------------------------
// POST /dpas — Create data processing agreement
// ---------------------------------------------------------------------------
router.post('/dpas', async (req: Request, res: Response) => {
  try {
    const parsed = createDpaSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }

    const { processorName, purpose, dataTypes, signedDate, expiryDate, documentUrl } = parsed.data;

    const dpa = await prisma.dataProcessingAgreement.create({
      data: {
        processorName,
        purpose,
        dataTypes: dataTypes || [],
        signedDate: signedDate ? new Date(signedDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        documentUrl: documentUrl || null,
        isActive: true,
      },
    });

    logger.info('DPA created', { id: dpa.id, processorName });
    res.status(201).json({ success: true, data: { dpa } });
  } catch (err) {
    logger.error('Failed to create DPA', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create DPA' } });
  }
});

export default router;
