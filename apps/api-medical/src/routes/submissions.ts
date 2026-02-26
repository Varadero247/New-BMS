// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination} from '@ims/shared';
import { scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-medical');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// Regulatory Submissions Tracker (S4-05)
// ============================================

// ============================================
// Constants
// ============================================

const REGULATORY_MARKETS = [
  'FDA_510K',
  'FDA_DE_NOVO',
  'FDA_PMA',
  'EU_CE_MDR',
  'EU_CE_IVDR',
  'UKCA',
  'HEALTH_CANADA',
  'TGA_AUSTRALIA',
  'PMDA_JAPAN',
  'NMPA_CHINA',
  'ANVISA_BRAZIL',
] as const;

const SUBMISSION_TYPES = ['INITIAL', 'SUPPLEMENT', 'RENEWAL', 'AMENDMENT', 'NOTIFICATION'] as const;

const SUBMISSION_STATUSES = [
  'PREPARATION',
  'SUBMITTED',
  'UNDER_REVIEW',
  'ADDITIONAL_INFO_REQUESTED',
  'APPROVED',
  'CONDITIONALLY_APPROVED',
  'REJECTED',
  'WITHDRAWN',
  'EXPIRED',
] as const;

// ============================================
// Reference Number Generator
// ============================================

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `REG-${yy}${mm}`;

  const count = await prisma.regulatorySubmission.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// Zod Schemas
// ============================================

const createSubmissionSchema = z.object({
  deviceName: z.string().trim().min(1, 'Device name is required'),
  market: z.enum(REGULATORY_MARKETS),
  submissionType: z.enum(SUBMISSION_TYPES),
  notes: z.string().trim().optional(),
});

const updateSubmissionSchema = z.object({
  status: z.enum(SUBMISSION_STATUSES).optional(),
  submittedDate: z.string().trim().datetime({ offset: true }).optional(),
  approvalDate: z.string().trim().datetime({ offset: true }).optional(),
  expiryDate: z.string().trim().datetime({ offset: true }).optional(),
  referenceNumber: z.string().trim().optional(),
  conditions: z.string().trim().optional(),
});

const createChangeSchema = z.object({
  changeType: z.string().trim().min(1, 'Change type is required'),
  description: z.string().trim().min(1, 'Description is required'),
  notificationDate: z.string().trim().datetime({ offset: true }).optional(),
});

// ============================================
// ROUTES
// ============================================

// POST / — Create submission
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createSubmissionSchema.parse(req.body);
    const refNumber = await generateRefNumber();

    const submission = await prisma.regulatorySubmission.create({
      data: {
        refNumber,
        deviceName: data.deviceName,
        market: data.market,
        submissionType: data.submissionType,
        status: 'PREPARATION',
        notes: data.notes,
        createdBy: (req as AuthRequest).user?.id || 'unknown',
      },
    });

    logger.info('Regulatory submission created', {
      refNumber,
      market: data.market,
      submissionType: data.submissionType,
    });
    res.status(201).json({ success: true, data: submission });
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
    logger.error('Create regulatory submission error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create regulatory submission' },
    });
  }
});

// GET / — List submissions with market/status filters, paginated
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', market, status, search } = req.query;
    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (market) where.market = market;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { deviceName: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [submissions, total] = await Promise.all([
      prisma.regulatorySubmission.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { changes: { orderBy: { createdAt: 'desc' } } },
      }),
      prisma.regulatorySubmission.count({ where }),
    ]);

    res.json({
      success: true,
      data: submissions,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List regulatory submissions error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list regulatory submissions' },
    });
  }
});

// GET /:id — Get submission with changes included
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const submission = await prisma.regulatorySubmission.findUnique({
      where: { id: req.params.id },
      include: { changes: { orderBy: { createdAt: 'desc' } } },
    });

    if (!submission || submission.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Regulatory submission not found' },
      });
    }

    res.json({ success: true, data: submission });
  } catch (error) {
    logger.error('Get regulatory submission error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get regulatory submission' },
    });
  }
});

// PUT /:id — Update submission status, dates, conditions
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.regulatorySubmission.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Regulatory submission not found' },
      });
    }

    const data = updateSubmissionSchema.parse(req.body);

    const submission = await prisma.regulatorySubmission.update({
      where: { id: req.params.id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.submittedDate !== undefined && { submittedDate: new Date(data.submittedDate) }),
        ...(data.approvalDate !== undefined && { approvalDate: new Date(data.approvalDate) }),
        ...(data.expiryDate !== undefined && { expiryDate: new Date(data.expiryDate) }),
        ...(data.referenceNumber !== undefined && { referenceNumber: data.referenceNumber }),
        ...(data.conditions !== undefined && { conditions: data.conditions }),
      },
    });

    logger.info('Regulatory submission updated', {
      id: req.params.id,
      refNumber: existing.refNumber,
    });
    res.json({ success: true, data: submission });
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
    logger.error('Update regulatory submission error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update regulatory submission' },
    });
  }
});

// POST /:id/changes — Log post-approval change notification
router.post('/:id/changes', async (req: Request, res: Response) => {
  try {
    const submission = await prisma.regulatorySubmission.findUnique({
      where: { id: req.params.id },
    });
    if (!submission || submission.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Regulatory submission not found' },
      });
    }

    const data = createChangeSchema.parse(req.body);

    const change = await prisma.regSubmissionChange.create({
      data: {
        submissionId: req.params.id,
        changeType: data.changeType,
        description: data.description,
        notificationDate: data.notificationDate ? new Date(data.notificationDate) : undefined,
        status: 'PENDING',
      },
    });

    logger.info('Submission change notification logged', {
      submissionId: req.params.id,
      changeType: data.changeType,
    });
    res.status(201).json({ success: true, data: change });
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
    logger.error('Create submission change error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create submission change' },
    });
  }
});

export default router;
