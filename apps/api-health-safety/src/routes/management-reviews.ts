// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination} from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-health-safety');

const router: IRouter = Router();

router.use(authenticate);
router.param('id', validateIdParam());
router.param('actionId', validateIdParam('actionId'));

const REVIEW_STATUSES = ['DRAFT', 'COMPLETED', 'APPROVED'] as const;
const MR_ACTION_STATUSES = ['OPEN', 'IN_PROGRESS', 'COMPLETE', 'OVERDUE'] as const;

// Generate reference number HS-MR-YYYY-NN
async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `HS-MR-${year}-`;

  const last = await prisma.hSManagementReview.findFirst({
    where: { refNumber: { startsWith: prefix }, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: { refNumber: true },
  });

  let nextNum = 1;
  if (last?.refNumber) {
    const match = last.refNumber.match(/HS-MR-\d{4}-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  return `${prefix}${String(nextNum).padStart(2, '0')}`;
}

// GET /api/management-reviews - List management reviews
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status, year, search } = req.query;
    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (year) {
      const y = parseInt(year as string, 10);
      where.reviewDate = {
        gte: new Date(`${y}-01-01T00:00:00.000Z`),
        lt: new Date(`${y + 1}-01-01T00:00:00.000Z`),
      };
    }
    if (search) {
      where.OR = [
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { chair: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.hSManagementReview.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { reviewDate: 'desc' },
        include: { actions: true },
      }),
      prisma.hSManagementReview.count({ where }),
    ]);

    res.json({
      success: true,
      data: reviews,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List management reviews error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list management reviews' },
    });
  }
});

// GET /api/management-reviews/:id - Get single management review
router.get(
  '/:id',
  checkOwnership(prisma.hSManagementReview),
  async (req: Request, res: Response) => {
    try {
      const review = await prisma.hSManagementReview.findUnique({
        where: { id: req.params.id },
        include: { actions: true },
      });

      if (!review || (review as Record<string, unknown>).deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Management review not found' },
        });
      }

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

// POST /api/management-reviews - Create management review
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
      // ISO 45001 Clause 9.3 mandatory inputs (all optional at creation)
      prevActionStatus: z.string().trim().optional(),
      ohsObjectivesProgress: z.string().trim().optional(),
      legalComplianceStatus: z.string().trim().optional(),
      incidentStatistics: z.string().trim().optional(),
      riskOpportunityReview: z.string().trim().optional(),
      auditResults: z.string().trim().optional(),
      workerParticipation: z.string().trim().optional(),
      externalCommunications: z.string().trim().optional(),
      changesInIssues: z.string().trim().optional(),
      // ISO 45001 Clause 9.3 mandatory outputs
      continualImprovement: z.string().trim().optional(),
      resourceNeeds: z.string().trim().optional(),
      systemChanges: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    const review = await prisma.hSManagementReview.create({
      data: {
        id: uuidv4(),
        refNumber,
        reviewDate: new Date(data.reviewDate),
        chair: data.chair,
        attendees: data.attendees,
        status: 'DRAFT',
        prevActionStatus: data.prevActionStatus,
        ohsObjectivesProgress: data.ohsObjectivesProgress,
        legalComplianceStatus: data.legalComplianceStatus,
        incidentStatistics: data.incidentStatistics,
        riskOpportunityReview: data.riskOpportunityReview,
        auditResults: data.auditResults,
        workerParticipation: data.workerParticipation,
        externalCommunications: data.externalCommunications,
        changesInIssues: data.changesInIssues,
        continualImprovement: data.continualImprovement,
        resourceNeeds: data.resourceNeeds,
        systemChanges: data.systemChanges,
        createdBy: req.user?.id,
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

// PUT /api/management-reviews/:id - Update management review
router.put(
  '/:id',
  checkOwnership(prisma.hSManagementReview),
  async (req: Request, res: Response) => {
    try {
      const existing = await prisma.hSManagementReview.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Management review not found' },
        });
      }

      const schema = z.object({
        reviewDate: z
          .string()
          .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
          .optional(),
        chair: z.string().trim().min(1).max(200).optional(),
        attendees: z.array(z.string().trim()).optional(),
        status: z.enum(REVIEW_STATUSES).optional(),
        prevActionStatus: z.string().trim().optional(),
        ohsObjectivesProgress: z.string().trim().optional(),
        legalComplianceStatus: z.string().trim().optional(),
        incidentStatistics: z.string().trim().optional(),
        riskOpportunityReview: z.string().trim().optional(),
        auditResults: z.string().trim().optional(),
        workerParticipation: z.string().trim().optional(),
        externalCommunications: z.string().trim().optional(),
        changesInIssues: z.string().trim().optional(),
        continualImprovement: z.string().trim().optional(),
        resourceNeeds: z.string().trim().optional(),
        systemChanges: z.string().trim().optional(),
      });

      const data = schema.parse(req.body);

      const updateData: Record<string, unknown> = { ...data };
      if (data.reviewDate) updateData.reviewDate = new Date(data.reviewDate);

      const review = await prisma.hSManagementReview.update({
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

// POST /api/management-reviews/:id/complete - Lock and complete review
router.post(
  '/:id/complete',
  checkOwnership(prisma.hSManagementReview),
  async (req: Request, res: Response) => {
    try {
      const existing = await prisma.hSManagementReview.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Management review not found' },
        });
      }

      if (existing.status === 'COMPLETED' || existing.status === 'APPROVED') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_COMPLETED',
            message: 'Review is already completed or approved',
          },
        });
      }

      const review = await prisma.hSManagementReview.update({
        where: { id: req.params.id },
        data: { status: 'COMPLETED' },
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

// POST /api/management-reviews/:id/actions - Add action to review
router.post('/:id/actions', async (req: Request, res: Response) => {
  try {
    const review = await prisma.hSManagementReview.findUnique({ where: { id: req.params.id } });
    if (!review || (review as Record<string, unknown>).deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Management review not found' },
      });
    }

    const schema = z.object({
      action: z.string().trim().min(1).max(2000),
      owner: z.string().trim().min(1).max(200),
      dueDate: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
    });

    const data = schema.parse(req.body);

    const mrAction = await prisma.hSMRAction.create({
      data: {
        id: uuidv4(),
        reviewId: req.params.id,
        action: data.action,
        owner: data.owner,
        dueDate: new Date(data.dueDate),
        status: 'OPEN',
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
    logger.error('Add management review action error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to add management review action' },
    });
  }
});

// PUT /api/management-reviews/:id/actions/:actionId - Update action status
router.put('/:id/actions/:actionId', async (req: Request, res: Response) => {
  try {
    const action = await prisma.hSMRAction.findUnique({ where: { id: req.params.actionId } });
    if (!action || action.reviewId !== req.params.id) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Management review action not found' },
      });
    }

    const schema = z.object({
      action: z.string().trim().min(1).max(2000).optional(),
      owner: z.string().trim().min(1).max(200).optional(),
      dueDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      status: z.enum(MR_ACTION_STATUSES).optional(),
    });

    const data = schema.parse(req.body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.status === 'COMPLETE') {
      updateData.completedAt = new Date();
    }

    const updated = await prisma.hSMRAction.update({
      where: { id: req.params.actionId },
      data: updateData,
    });

    res.json({ success: true, data: updated });
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

// DELETE /api/management-reviews/:id - Soft delete management review
router.delete(
  '/:id',
  checkOwnership(prisma.hSManagementReview),
  async (req: Request, res: Response) => {
    try {
      const existing = await prisma.hSManagementReview.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Management review not found' },
        });
      }

      await prisma.hSManagementReview.update({
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
