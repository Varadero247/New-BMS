import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

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
      prisma.gdprDataCategory.findMany({ orderBy: { category: 'asc' } }),
      prisma.dataProcessingAgreement.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.dataRequest.findMany(),
    ]);

    const requestStats = {
      total: dataRequests.length,
      received: dataRequests.filter((r: any) => r.status === 'RECEIVED').length,
      verified: dataRequests.filter((r: any) => r.status === 'VERIFIED').length,
      processing: dataRequests.filter((r: any) => r.status === 'PROCESSING').length,
      completed: dataRequests.filter((r: any) => r.status === 'COMPLETED').length,
      rejected: dataRequests.filter((r: any) => r.status === 'REJECTED').length,
    };

    const atRiskCategories = categories.filter((c: any) => c.complianceStatus === 'AT_RISK');
    const activeDpas = dpas.filter((d: any) => d.isActive);

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
    const { category: categoryName, legalBasis, retentionDays, systems, complianceStatus } = req.body;
    if (!categoryName || !legalBasis) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'category and legalBasis are required' } });
    }

    const created = await prisma.gdprDataCategory.create({
      data: {
        category: categoryName,
        legalBasis,
        retentionDays: retentionDays || 730,
        systems: systems || null,
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
    const { processorName, purpose, dataTypes, signedDate, expiryDate, documentUrl } = req.body;
    if (!processorName || !purpose) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'processorName and purpose are required' } });
    }

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
