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
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-environment');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());
router.param('actionId', validateIdParam('actionId'));

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.envManagementReview.count({
    where: { refNumber: { startsWith: `ENV-MR-${year}` } },
  });
  return `ENV-MR-${year}-${String(count + 1).padStart(2, '0')}`;
}

// GET / - List management reviews
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50', status, year, search } = req.query;
    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query, { defaultLimit: 50 });

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (year) {
      const yearNum = parseInt(year as string, 10);
      where.reviewDate = {
        gte: new Date(`${yearNum}-01-01`),
        lt: new Date(`${yearNum + 1}-01-01`),
      };
    }
    if (search) {
      where.OR = [
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { chair: { contains: search as string, mode: 'insensitive' } },
        { prevActionStatus: { contains: search as string, mode: 'insensitive' } },
        { objectivesProgress: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.envManagementReview.findMany({
        where,
        skip,
        take: limitNum,
        include: { actions: true },
        orderBy: { reviewDate: 'desc' },
      }),
      prisma.envManagementReview.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('List management reviews error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list management reviews' },
    });
  }
});

// GET /:id - Get single review with actions
router.get(
  '/:id',
  checkOwnership(prisma.envManagementReview),
  async (req: Request, res: Response) => {
    try {
      const review = await prisma.envManagementReview.findUnique({
        where: { id: req.params.id },
        include: { actions: true },
      });
      if (!review)
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Management review not found' },
        });
      res.json({ success: true, data: review });
    } catch (error) {
      logger.error('Get management review error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get management review' },
      });
    }
  }
);

// POST / - Create management review
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      reviewDate: z
        .string()
        .trim()
        .min(1)
        .max(2000)
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      chair: z.string().trim().min(1).max(200),
      attendees: z.array(z.string().trim()).min(1),
      // ISO 14001 Clause 9.3 inputs (all optional)
      prevActionStatus: z.string().trim().optional(),
      changesInIssues: z.string().trim().optional(),
      objectivesProgress: z.string().trim().optional(),
      aspectsPerformance: z.string().trim().optional(),
      legalCompliance: z.string().trim().optional(),
      incidentSummary: z.string().trim().optional(),
      auditResults: z.string().trim().optional(),
      supplierPerformance: z.string().trim().optional(),
      // Outputs (optional at creation)
      continualImprovement: z.string().trim().optional(),
      resourceNeeds: z.string().trim().optional(),
      systemChanges: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    const review = await prisma.envManagementReview.create({
      data: {
        refNumber,
        reviewDate: new Date(data.reviewDate),
        chair: data.chair,
        attendees: data.attendees,
        status: 'DRAFT',
        prevActionStatus: data.prevActionStatus,
        changesInIssues: data.changesInIssues,
        objectivesProgress: data.objectivesProgress,
        aspectsPerformance: data.aspectsPerformance,
        legalCompliance: data.legalCompliance,
        incidentSummary: data.incidentSummary,
        auditResults: data.auditResults,
        supplierPerformance: data.supplierPerformance,
        continualImprovement: data.continualImprovement,
        resourceNeeds: data.resourceNeeds,
        systemChanges: data.systemChanges,
      },
      include: { actions: true },
    });

    res.status(201).json({ success: true, data: review });
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
    logger.error('Create management review error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create management review' },
    });
  }
});

// PUT /:id - Update management review
router.put(
  '/:id',
  checkOwnership(prisma.envManagementReview),
  async (req: Request, res: Response) => {
    try {
      const existing = await prisma.envManagementReview.findUnique({
        where: { id: req.params.id },
      });
      if (!existing)
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Management review not found' },
        });

      if (existing.status === 'APPROVED') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'REVIEW_LOCKED',
            message: 'Cannot update an approved management review',
          },
        });
      }

      const schema = z.object({
        reviewDate: z
          .string()
          .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
          .optional(),
        chair: z.string().trim().optional(),
        attendees: z.array(z.string().trim()).optional(),
        // Inputs
        prevActionStatus: z.string().trim().optional(),
        changesInIssues: z.string().trim().optional(),
        objectivesProgress: z.string().trim().optional(),
        aspectsPerformance: z.string().trim().optional(),
        legalCompliance: z.string().trim().optional(),
        incidentSummary: z.string().trim().optional(),
        auditResults: z.string().trim().optional(),
        supplierPerformance: z.string().trim().optional(),
        // Outputs
        continualImprovement: z.string().trim().optional(),
        resourceNeeds: z.string().trim().optional(),
        systemChanges: z.string().trim().optional(),
      });

      const data = schema.parse(req.body);

      const updateData: Record<string, unknown> = { ...data };

      // Convert date strings to Date objects
      if (data.reviewDate && typeof data.reviewDate === 'string')
        updateData.reviewDate = new Date(data.reviewDate);

      const review = await prisma.envManagementReview.update({
        where: { id: req.params.id },
        data: updateData,
        include: { actions: true },
      });

      res.json({ success: true, data: review });
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
      logger.error('Update management review error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update management review' },
      });
    }
  }
);

// POST /:id/complete - Lock and complete review
router.post(
  '/:id/complete',
  checkOwnership(prisma.envManagementReview),
  async (req: Request, res: Response) => {
    try {
      const existing = await prisma.envManagementReview.findUnique({
        where: { id: req.params.id },
      });
      if (!existing)
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Management review not found' },
        });

      if (existing.status === 'COMPLETED' || existing.status === 'APPROVED') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_COMPLETED',
            message: 'Management review is already completed or approved',
          },
        });
      }

      // Validate that all mandatory ISO 14001 Clause 9.3 inputs are filled
      const mandatoryInputs = [
        'prevActionStatus',
        'changesInIssues',
        'objectivesProgress',
        'aspectsPerformance',
        'legalCompliance',
        'auditResults',
      ] as const;

      const missingFields = mandatoryInputs.filter(
        (field) => !existing[field] || (existing[field] as string).trim() === ''
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INCOMPLETE_REVIEW',
            message: 'All mandatory input fields must be completed before finalising the review',
            fields: missingFields,
          },
        });
      }

      const review = await prisma.envManagementReview.update({
        where: { id: req.params.id },
        data: { status: 'COMPLETED', completedAt: new Date() } as Record<string, unknown>,
        include: { actions: true },
      });

      res.json({ success: true, data: review });
    } catch (error) {
      logger.error('Complete management review error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to complete management review' },
      });
    }
  }
);

// POST /:id/actions - Add action to review
router.post('/:id/actions', async (req: Request, res: Response) => {
  try {
    const review = await prisma.envManagementReview.findUnique({ where: { id: req.params.id } });
    if (!review)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Management review not found' },
      });

    const schema = z.object({
      action: z.string().trim().min(1).max(2000),
      owner: z.string().trim().min(1).max(200),
      dueDate: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const mrAction = await prisma.envMRAction.create({
      data: {
        reviewId: req.params.id,
        action: data.action,
        owner: data.owner,
        dueDate: new Date(data.dueDate),
        notes: data.notes,
      },
    });

    res.status(201).json({ success: true, data: mrAction });
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
    logger.error('Create management review action error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create management review action' },
    });
  }
});

// PUT /:id/actions/:actionId - Update action
router.put('/:id/actions/:actionId', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.envMRAction.findFirst({
      where: { id: req.params.actionId, reviewId: req.params.id },
    });
    if (!existing)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Management review action not found' },
      });

    const schema = z.object({
      action: z.string().trim().optional(),
      owner: z.string().trim().optional(),
      dueDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      status: z.string().trim().optional(),
      completedAt: z.string().trim().optional(),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const updateData: Record<string, unknown> = { ...data };

    // Convert date strings to Date objects
    if (data.dueDate && typeof data.dueDate === 'string')
      updateData.dueDate = new Date(data.dueDate);
    if (data.completedAt && typeof data.completedAt === 'string')
      updateData.completedAt = new Date(data.completedAt);

    // Auto-set completedAt when status changes to COMPLETED
    if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED' && !data.completedAt) {
      updateData.completedAt = new Date();
    }

    const mrAction = await prisma.envMRAction.update({
      where: { id: req.params.actionId },
      data: updateData,
    });

    res.json({ success: true, data: mrAction });
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
    logger.error('Update management review action error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update management review action' },
    });
  }
});

// DELETE /:id - Soft delete management review
router.delete(
  '/:id',
  checkOwnership(prisma.envManagementReview),
  async (req: Request, res: Response) => {
    try {
      const existing = await prisma.envManagementReview.findUnique({
        where: { id: req.params.id },
      });
      if (!existing)
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Management review not found' },
        });

      await prisma.envManagementReview.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Delete management review error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete management review' },
      });
    }
  }
);

export default router;
