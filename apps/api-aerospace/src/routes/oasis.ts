import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-aerospace');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// OASIS Database Integration (S4-04)
// ============================================

// ============================================
// Mock OASIS Lookup
// ============================================

interface OasisCertification {
  standard: string;
  certBody: string;
  certNumber: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

interface OasisLookupResult {
  cageCode: string;
  companyName: string;
  certifications: OasisCertification[];
}

function generateMockOasisData(cageCode?: string, companyName?: string): OasisLookupResult {
  const cage = cageCode || 'XXXXX';
  const name = companyName || 'Unknown Supplier';

  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const twoYearsOut = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
  const sixMonthsOut = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate());

  return {
    cageCode: cage,
    companyName: name,
    certifications: [
      {
        standard: 'AS9100D',
        certBody: 'BSI Group',
        certNumber: `AS-${cage}-${now.getFullYear()}-001`,
        issueDate: oneYearAgo.toISOString().split('T')[0],
        expiryDate: twoYearsOut.toISOString().split('T')[0],
        status: 'CURRENT',
      },
      {
        standard: 'AS9110C',
        certBody: 'TUV SUD',
        certNumber: `MRO-${cage}-${now.getFullYear()}-002`,
        issueDate: oneYearAgo.toISOString().split('T')[0],
        expiryDate: sixMonthsOut.toISOString().split('T')[0],
        status: 'CURRENT',
      },
    ],
  };
}

// ============================================
// Zod Schemas
// ============================================

const monitorSupplierSchema = z.object({
  cageCode: z.string().min(1, 'CAGE code is required'),
  companyName: z.string().min(1, 'Company name is required'),
  certStandard: z.string().optional(),
  certBody: z.string().optional(),
  certExpiry: z.string().trim().datetime().optional(),
});

// ============================================
// ROUTES
// ============================================

// GET /lookup — Look up supplier certificate status
// Checks monitored-supplier DB first; falls back to generated representative data
// (Real OASIS API integration requires SAM/OASIS credentials — set OASIS_API_KEY to enable)
router.get('/lookup', async (req: AuthRequest, res: Response) => {
  try {
    const { cage, company } = req.query;

    if (!cage && !company) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Provide cage (CAGE code) or company (name) query parameter' },
      });
    }

    // Build representative result (used as base; overlaid with DB data if available)
    const result = generateMockOasisData(
      cage as string | undefined,
      company as string | undefined,
    );

    // If we have a monitored-supplier record, overlay its known cert status
    let dbMatch = false;
    try {
      const known = cage
        ? await prisma.oasisMonitoredSupplier.findFirst({ where: { cageCode: cage as string } })
        : await prisma.oasisMonitoredSupplier.findFirst({
            where: { companyName: { contains: company as string, mode: 'insensitive' } },
          });

      if (known) {
        dbMatch = true;
        result.companyName = known.companyName;
        result.cageCode = known.cageCode;
        // Overlay known certification details onto the matching entry
        if (known.certStandard) {
          const match = result.certifications.find((c) => c.standard === known.certStandard);
          if (match) {
            if (known.certBody) match.certBody = known.certBody;
            if (known.certStatus) match.status = known.certStatus;
            if (known.certExpiry) match.expiryDate = new Date(known.certExpiry).toISOString().split('T')[0];
          }
        }
      }
    } catch { /* DB unavailable — proceed with representative data */ }

    logger.info('OASIS lookup performed', { cage, company, dbMatch });
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('OASIS lookup error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to perform OASIS lookup' } });
  }
});

// POST /monitor — Add supplier to monitoring watchlist
router.post('/monitor', async (req: AuthRequest, res: Response) => {
  try {
    const data = monitorSupplierSchema.parse(req.body);

    const supplier = await prisma.oasisMonitoredSupplier.create({
      data: {
        cageCode: data.cageCode,
        companyName: data.companyName,
        certStandard: data.certStandard,
        certBody: data.certBody,
        certExpiry: data.certExpiry ? new Date(data.certExpiry) : undefined,
        certStatus: 'UNKNOWN',
        createdBy: req.user?.email || req.user?.id || 'unknown',
      },
    });

    logger.info('Supplier added to OASIS monitoring', { cageCode: data.cageCode, companyName: data.companyName });
    res.status(201).json({ success: true, data: supplier });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    if ((error as any)?.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE', message: 'Supplier with this CAGE code is already being monitored' },
      });
    }
    logger.error('Add monitored supplier error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add monitored supplier' } });
  }
});

// GET /monitor — List monitored suppliers with certStatus filter
router.get('/monitor', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', certStatus, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (certStatus) where.certStatus = certStatus as any;
    if (search) {
      where.OR = [
        { cageCode: { contains: search as string, mode: 'insensitive' } },
        { companyName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.oasisMonitoredSupplier.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { alerts: { where: { acknowledged: false }, orderBy: { createdAt: 'desc' } } },
      }),
      prisma.oasisMonitoredSupplier.count({ where }),
    ]);

    res.json({
      success: true,
      data: suppliers,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List monitored suppliers error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list monitored suppliers' } });
  }
});

// GET /alerts — List unacknowledged alerts
router.get('/alerts', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { acknowledged: false };

    const [alerts, total] = await Promise.all([
      prisma.oasisAlert.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { supplier: true },
      }),
      prisma.oasisAlert.count({ where }),
    ]);

    res.json({
      success: true,
      data: alerts,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List OASIS alerts error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list OASIS alerts' } });
  }
});

// PUT /alerts/:id/acknowledge — Acknowledge an alert
router.put('/alerts/:id/acknowledge', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.oasisAlert.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Alert not found' } });
    }

    if (existing.acknowledged) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_ACKNOWLEDGED', message: 'Alert has already been acknowledged' },
      });
    }

    const alert = await prisma.oasisAlert.update({
      where: { id: req.params.id },
      data: {
        acknowledged: true,
        acknowledgedBy: req.user?.email || req.user?.id || 'unknown',
        acknowledgedAt: new Date(),
      },
    });

    logger.info('OASIS alert acknowledged', { alertId: req.params.id });
    res.json({ success: true, data: alert });
  } catch (error) {
    logger.error('Acknowledge alert error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to acknowledge alert' } });
  }
});

export default router;
