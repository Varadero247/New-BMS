import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination} from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-medical');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// HELPERS
// ============================================

const COMPLAINT_SOURCES = [
  'CUSTOMER',
  'FIELD_SERVICE',
  'INTERNAL',
  'REGULATORY',
  'DISTRIBUTOR',
  'HEALTHCARE_PROVIDER',
  'PATIENT',
] as const;

const COMPLAINT_SEVERITIES = [
  'MINOR',
  'MODERATE',
  'MAJOR',
  'CRITICAL',
  'LIFE_THREATENING',
] as const;

const COMPLAINT_STATUSES = [
  'RECEIVED',
  'UNDER_INVESTIGATION',
  'MDR_REVIEW',
  'CAPA_INITIATED',
  'CLOSED',
  'CLOSED_NO_ACTION',
] as const;

/**
 * Generate reference number: COMP-YYMM-XXXX
 */
async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `COMP-${yy}${mm}`;

  const count = await prisma.complaint.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

/**
 * MDR auto-detection: flag complaints involving death, injury, or malfunction
 * for mandatory MDR/Vigilance review per 21 CFR 803 / EU MDR Article 87.
 */
function shouldFlagForMDR(complaint: {
  deathOccurred: boolean;
  injuryOccurred: boolean;
  malfunctionOccurred: boolean;
}): boolean {
  return complaint.deathOccurred || complaint.injuryOccurred || complaint.malfunctionOccurred;
}

// ============================================
// 1. POST / - Log new complaint
// ============================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      deviceName: z.string().trim().min(1).max(200),
      deviceId: z.string().trim().optional(),
      lotNumber: z.string().trim().optional(),
      serialNumber: z.string().trim().optional(),
      complaintDate: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      source: z.enum(COMPLAINT_SOURCES),
      reporterName: z.string().trim().optional(),
      reporterContact: z.string().trim().optional(),
      description: z.string().trim().min(1).max(2000),
      patientInvolved: z.boolean().optional(),
      injuryOccurred: z.boolean().optional(),
      injuryDescription: z.string().trim().optional(),
      deathOccurred: z.boolean().optional(),
      malfunctionOccurred: z.boolean().optional(),
      severity: z.enum(COMPLAINT_SEVERITIES).optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    const injuryOccurred = data.injuryOccurred ?? false;
    const deathOccurred = data.deathOccurred ?? false;
    const malfunctionOccurred = data.malfunctionOccurred ?? false;

    // Auto-detect MDR reportability and set initial status accordingly
    const needsMDRReview = shouldFlagForMDR({
      deathOccurred,
      injuryOccurred,
      malfunctionOccurred,
    });

    const complaint = await prisma.complaint.create({
      data: {
        refNumber,
        deviceName: data.deviceName,
        deviceId: data.deviceId,
        lotNumber: data.lotNumber,
        serialNumber: data.serialNumber,
        complaintDate: new Date(data.complaintDate),
        source: data.source,
        reporterName: data.reporterName,
        reporterContact: data.reporterContact,
        description: data.description,
        patientInvolved: data.patientInvolved ?? false,
        injuryOccurred,
        injuryDescription: data.injuryDescription,
        deathOccurred,
        malfunctionOccurred,
        severity: data.severity || 'MINOR',
        status: needsMDRReview ? 'MDR_REVIEW' : 'RECEIVED',
        createdBy: (req as AuthRequest).user?.id,
      },
    });

    res.status(201).json({ success: true, data: complaint });
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
    logger.error('Create complaint error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create complaint' },
    });
  }
});

// ============================================
// 2. GET / - List complaints with pagination & filters
// ============================================
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      severity,
      deviceName,
      mdrReportable,
      dateFrom,
      dateTo,
    } = req.query;

    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };

    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (deviceName) {
      where.deviceName = { contains: deviceName as string, mode: 'insensitive' };
    }
    if (mdrReportable !== undefined) {
      const boolVal = mdrReportable === 'true';
      where.mdrReportable = boolVal;
    }
    if (dateFrom || dateTo) {
      where.complaintDate = {};
      if (dateFrom) (where.complaintDate as { gte?: Date; lte?: Date }).gte = new Date(dateFrom as string);
      if (dateTo) (where.complaintDate as { gte?: Date; lte?: Date }).lte = new Date(dateTo as string);
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { complaintDate: 'desc' },
      }),
      prisma.complaint.count({ where }),
    ]);

    res.json({
      success: true,
      data: complaints,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List complaints error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list complaints' },
    });
  }
});

// ============================================
// 3. GET /trending - Complaint trend analysis
// ============================================
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const baseWhere: Prisma.ComplaintWhereInput = {
      deletedAt: null,
      complaintDate: { gte: twelveMonthsAgo },
    };

    // Complaints by month (last 12 months)
    const allComplaints = await prisma.complaint.findMany({
      where: baseWhere,
      select: { complaintDate: true, deviceName: true, source: true, severity: true },
      orderBy: { complaintDate: 'asc' },
      take: 1000,
    });

    // Group by month
    const byMonth: Record<string, number> = {};
    for (const c of allComplaints) {
      const key = `${c.complaintDate.getFullYear()}-${String(c.complaintDate.getMonth() + 1).padStart(2, '0')}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    }

    // Group by device
    const byDevice: Record<string, number> = {};
    for (const c of allComplaints) {
      byDevice[c.deviceName] = (byDevice[c.deviceName] || 0) + 1;
    }

    // Group by source (complaint type)
    const bySource: Record<string, number> = {};
    for (const c of allComplaints) {
      bySource[c.source] = (bySource[c.source] || 0) + 1;
    }

    // Group by severity
    const bySeverity: Record<string, number> = {};
    for (const c of allComplaints) {
      bySeverity[c.severity] = (bySeverity[c.severity] || 0) + 1;
    }

    // Sort byMonth keys chronologically
    const byMonthSorted = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    // Sort byDevice descending by count
    const byDeviceSorted = Object.entries(byDevice)
      .sort(([, a], [, b]) => b - a)
      .map(([device, count]) => ({ device, count }));

    // Sort bySource descending by count
    const bySourceSorted = Object.entries(bySource)
      .sort(([, a], [, b]) => b - a)
      .map(([source, count]) => ({ source, count }));

    // Sort bySeverity descending by count
    const bySeveritySorted = Object.entries(bySeverity)
      .sort(([, a], [, b]) => b - a)
      .map(([severity, count]) => ({ severity, count }));

    res.json({
      success: true,
      data: {
        period: {
          from: twelveMonthsAgo.toISOString(),
          to: new Date().toISOString(),
        },
        totalComplaints: allComplaints.length,
        byMonth: byMonthSorted,
        byDevice: byDeviceSorted,
        bySource: bySourceSorted,
        bySeverity: bySeveritySorted,
      },
    });
  } catch (error) {
    logger.error('Complaint trending error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate complaint trends' },
    });
  }
});

// ============================================
// 4. GET /mdr-pending - Complaints needing MDR decision
// ============================================
router.get('/mdr-pending', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = {
      deletedAt: null,
      mdrReportable: null,
      OR: [{ injuryOccurred: true }, { deathOccurred: true }, { malfunctionOccurred: true }],
    };

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { complaintDate: 'desc' },
      }),
      prisma.complaint.count({ where }),
    ]);

    res.json({
      success: true,
      data: complaints,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('MDR pending complaints error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list MDR pending complaints' },
    });
  }
});

// ============================================
// 5. GET /:id - Get complaint with full details
// ============================================
router.get('/:id', checkOwnership(prisma.complaint), async (req: Request, res: Response) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
    });

    if (!complaint || complaint.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Complaint not found' } });
    }

    res.json({ success: true, data: complaint });
  } catch (error) {
    logger.error('Get complaint error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get complaint' },
    });
  }
});

// ============================================
// 6. PUT /:id - Update investigation details
// ============================================
router.put('/:id', checkOwnership(prisma.complaint), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.complaint.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Complaint not found' } });
    }

    const schema = z.object({
      investigationSummary: z.string().trim().optional(),
      rootCause: z.string().trim().optional(),
      correctiveAction: z.string().trim().optional(),
      capaRef: z.string().trim().optional(),
      status: z.enum(COMPLAINT_STATUSES).optional(),
    });

    const data = schema.parse(req.body);

    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: {
        ...(data.investigationSummary !== undefined && {
          investigationSummary: data.investigationSummary,
        }),
        ...(data.rootCause !== undefined && { rootCause: data.rootCause }),
        ...(data.correctiveAction !== undefined && { correctiveAction: data.correctiveAction }),
        ...(data.capaRef !== undefined && { capaRef: data.capaRef }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    res.json({ success: true, data: complaint });
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
    logger.error('Update complaint error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update complaint' },
    });
  }
});

// ============================================
// 7. POST /:id/mdr - Flag MDR reportability decision
// ============================================
router.post('/:id/mdr', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.complaint.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Complaint not found' } });
    }

    const schema = z.object({
      reportable: z.boolean(),
      mdrReportRef: z.string().trim().optional(),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: Prisma.ComplaintUpdateInput = {
      mdrReportable: data.reportable,
      mdrDecisionDate: new Date(),
      mdrDecisionBy: (req as AuthRequest).user?.email || (req as AuthRequest).user?.id,
    };

    if (data.mdrReportRef) {
      updateData.mdrReportRef = data.mdrReportRef;
    }

    // If reportable, move status to MDR_REVIEW (unless already past that)
    if (data.reportable) {
      updateData.status = 'MDR_REVIEW';
    }

    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: complaint });
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
    logger.error('MDR decision error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to record MDR decision' },
    });
  }
});

// ============================================
// 8. POST /:id/close - Close complaint
// ============================================
router.post('/:id/close', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.complaint.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Complaint not found' } });
    }

    // Validate: MDR decision must have been made
    if (existing.mdrReportable === null) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MDR_DECISION_REQUIRED',
          message: 'MDR reportability decision must be made before closing the complaint',
        },
      });
    }

    // Validate: investigation must have rootCause and correctiveAction
    if (!existing.rootCause || !existing.correctiveAction) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVESTIGATION_INCOMPLETE',
          message:
            'Root cause and corrective action must be documented before closing the complaint',
        },
      });
    }

    const schema = z.object({
      disposition: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data: {
        status: 'CLOSED',
        closedDate: new Date(),
        closedBy: (req as AuthRequest).user?.email || (req as AuthRequest).user?.id,
        ...(data.disposition && {
          investigationSummary: existing.investigationSummary
            ? `${existing.investigationSummary}\n\nDisposition: ${data.disposition}`
            : `Disposition: ${data.disposition}`,
        }),
      },
    });

    res.json({ success: true, data: complaint });
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
    logger.error('Close complaint error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to close complaint' },
    });
  }
});

export default router;
