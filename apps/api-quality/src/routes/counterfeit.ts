import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-quality');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// =============================================
// Generate reference numbers
// =============================================

async function generateReportRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `SUCP-${yy}${mm}`;
  const count = await prisma.counterfeitReport.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

async function generateQuarantineRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `QR-${yy}${mm}`;
  const count = await prisma.quarantineRecord.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// =============================================
// COUNTERFEIT REPORTS
// =============================================

// POST /reports — Report suspected counterfeit part
router.post('/reports', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      partNumber: z.string().min(1),
      partName: z.string().optional(),
      manufacturer: z.string().min(1),
      distributor: z.string().optional(),
      lotNumber: z.string().optional(),
      serialNumber: z.string().optional(),
      suspicionReason: z.string().min(1),
      evidence: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateReportRefNumber();

    const report = await prisma.counterfeitReport.create({
      data: {
        refNumber,
        partNumber: data.partNumber,
        partName: data.partName,
        manufacturer: data.manufacturer,
        distributor: data.distributor,
        lotNumber: data.lotNumber,
        serialNumber: data.serialNumber,
        suspicionReason: data.suspicionReason,
        evidence: data.evidence,
        reportedBy: req.user!.id,
        status: 'REPORTED',
        createdBy: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create counterfeit report error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create counterfeit report' } });
  }
});

// GET /reports — List counterfeit reports with pagination
router.get('/reports', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, partNumber, manufacturer } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (partNumber) where.partNumber = { contains: partNumber as string, mode: 'insensitive' };
    if (manufacturer) where.manufacturer = { contains: manufacturer as string, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      prisma.counterfeitReport.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.counterfeitReport.count({ where }),
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
    logger.error('List counterfeit reports error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list counterfeit reports' } });
  }
});

// GET /reports/:id — Get report details
router.get('/reports/:id', checkOwnership(prisma.counterfeitReport), async (req: AuthRequest, res: Response) => {
  try {
    const report = await prisma.counterfeitReport.findUnique({
      where: { id: req.params.id },
    });

    if (!report || report.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Counterfeit report not found' } });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Get counterfeit report error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get counterfeit report' } });
  }
});

// PUT /reports/:id — Update investigation
router.put('/reports/:id', checkOwnership(prisma.counterfeitReport), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.counterfeitReport.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Counterfeit report not found' } });
    }

    const schema = z.object({
      investigationNotes: z.string().optional(),
      status: z.enum([
        'REPORTED', 'UNDER_INVESTIGATION', 'CONFIRMED_COUNTERFEIT',
        'CONFIRMED_AUTHENTIC', 'INCONCLUSIVE', 'CLOSED',
      ]).optional(),
      disposition: z.enum([
        'DESTROY', 'RETURN_TO_SUPPLIER', 'QUARANTINE', 'CLEARED',
      ]).optional(),
      evidence: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: Record<string, unknown> = {};
    if (data.investigationNotes !== undefined) updateData.investigationNotes = data.investigationNotes;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.evidence !== undefined) updateData.evidence = data.evidence;
    if (data.disposition !== undefined) {
      updateData.disposition = data.disposition;
      updateData.dispositionDate = new Date();
      updateData.dispositionBy = req.user!.id;
    }

    const report = await prisma.counterfeitReport.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update counterfeit report error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update counterfeit report' } });
  }
});

// POST /reports/:id/quarantine — Place in quarantine
router.post('/reports/:id/quarantine', checkOwnership(prisma.counterfeitReport), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.counterfeitReport.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Counterfeit report not found' } });
    }

    const schema = z.object({
      quantity: z.number().int().positive(),
      location: z.string().min(1),
      reason: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateQuarantineRefNumber();

    const quarantineRecord = await prisma.quarantineRecord.create({
      data: {
        refNumber,
        partNumber: existing.partNumber,
        quantity: data.quantity,
        location: data.location,
        reason: data.reason || `Suspected counterfeit part - ${existing.refNumber}`,
        reportId: existing.id,
        status: 'QUARANTINED',
        createdBy: req.user!.id,
      },
    });

    // Link quarantine record to the counterfeit report
    await prisma.counterfeitReport.update({
      where: { id: req.params.id },
      data: { quarantineId: quarantineRecord.id },
    });

    res.status(201).json({ success: true, data: quarantineRecord });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Quarantine part error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to quarantine part' } });
  }
});

// POST /reports/:id/notify — Notify GIDEP/EASA
router.post('/reports/:id/notify', checkOwnership(prisma.counterfeitReport), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.counterfeitReport.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Counterfeit report not found' } });
    }

    const schema = z.object({
      notifyGidep: z.boolean().optional(),
      gidepRef: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: Record<string, unknown> = {};
    if (data.notifyGidep !== undefined) updateData.gidepReported = data.notifyGidep;
    if (data.gidepRef !== undefined) updateData.gidepRef = data.gidepRef;

    const report = await prisma.counterfeitReport.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Notify GIDEP error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update GIDEP notification' } });
  }
});

// =============================================
// APPROVED SOURCES
// =============================================

// POST /approved-sources — Add to approved source list
router.post('/approved-sources', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      companyName: z.string().min(1),
      cageCode: z.string().optional(),
      partNumbers: z.array(z.string()),
      certifications: z.array(z.string()),
      approvalDate: z.string(),
      expiryDate: z.string().optional(),
      notes: z.string().optional(),
      riskRating: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    });

    const data = schema.parse(req.body);

    const source = await prisma.approvedSource.create({
      data: {
        companyName: data.companyName,
        cageCode: data.cageCode,
        partNumbers: data.partNumbers,
        certifications: data.certifications,
        approvalDate: new Date(data.approvalDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        notes: data.notes,
        riskRating: data.riskRating || 'LOW',
        status: 'APPROVED',
        createdBy: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: source });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create approved source error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create approved source' } });
  }
});

// GET /approved-sources — Query approved sources
router.get('/approved-sources', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, cageCode, companyName, riskRating } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status as any;
    if (cageCode) where.cageCode = { contains: cageCode as string, mode: 'insensitive' };
    if (companyName) where.companyName = { contains: companyName as string, mode: 'insensitive' };
    if (riskRating) where.riskRating = riskRating as any;

    const [items, total] = await Promise.all([
      prisma.approvedSource.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.approvedSource.count({ where }),
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
    logger.error('List approved sources error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list approved sources' } });
  }
});

export default router;
