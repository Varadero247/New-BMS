// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination} from '@ims/shared';
import { scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-aerospace');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// Reference Number Generators
// ============================================

async function generateProductSafetyItemRefNumber(): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const count = await prisma.aeroProductSafetyItem.count({
    where: { refNumber: { startsWith: `AERO-PSI-${yyyy}` } },
  });
  return `AERO-PSI-${yyyy}-${String(count + 1).padStart(3, '0')}`;
}

async function generateSafetyReviewRefNumber(): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const count = await prisma.aeroSafetyReview.count({
    where: { refNumber: { startsWith: `AERO-PSR-${yyyy}` } },
  });
  return `AERO-PSR-${yyyy}-${String(count + 1).padStart(3, '0')}`;
}

// ============================================
// Zod Schemas
// ============================================

const createProductSafetyItemSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  partNumber: z.string().trim().optional(),
  category: z.enum([
    'CRITICAL_SAFETY_ITEM',
    'FLIGHT_SAFETY_PART',
    'SAFETY_OF_FLIGHT',
    'FRACTURE_CRITICAL',
    'LIFE_LIMITED',
    'OTHER',
  ]),
  regulatoryBasis: z.string().trim().optional(),
  hazardDescription: z.string().trim().optional(),
  riskLevel: z
    .enum(['CATASTROPHIC', 'CRITICAL', 'MARGINAL', 'NEGLIGIBLE'])
    .optional()
    .default('MARGINAL'),
  mitigations: z.array(z.string().trim()).optional().default([]),
  verificationMethod: z.string().trim().optional(),
  complianceStatus: z
    .enum(['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT', 'NOT_ASSESSED'])
    .optional()
    .default('NOT_ASSESSED'),
  responsibleEngineer: z.string().trim().optional(),
  nextReviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  notes: z.string().trim().optional(),
});

const updateProductSafetyItemSchema = z.object({
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  partNumber: z.string().trim().optional(),
  category: z
    .enum([
      'CRITICAL_SAFETY_ITEM',
      'FLIGHT_SAFETY_PART',
      'SAFETY_OF_FLIGHT',
      'FRACTURE_CRITICAL',
      'LIFE_LIMITED',
      'OTHER',
    ])
    .optional(),
  regulatoryBasis: z.string().trim().optional(),
  hazardDescription: z.string().trim().optional(),
  riskLevel: z.enum(['CATASTROPHIC', 'CRITICAL', 'MARGINAL', 'NEGLIGIBLE']).optional(),
  mitigations: z.array(z.string().trim()).optional(),
  verificationMethod: z.string().trim().optional(),
  complianceStatus: z
    .enum(['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT', 'NOT_ASSESSED'])
    .optional(),
  status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'CLOSED', 'SUPERSEDED']).optional(),
  responsibleEngineer: z.string().trim().optional(),
  lastReviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  nextReviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  notes: z.string().trim().optional(),
});

const createSafetyReviewSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  reviewType: z.enum([
    'PRELIMINARY_HAZARD',
    'SYSTEM_SAFETY',
    'FAILURE_MODE',
    'FAULT_TREE',
    'FUNCTIONAL_HAZARD',
    'COMMON_CAUSE',
    'DESIGN_REVIEW',
  ]),
  productSafetyItemIds: z.array(z.string().trim()).optional().default([]),
  scope: z.string().trim().optional(),
  scheduledDate: z
    .string()
    .min(1, 'Scheduled date is required')
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  reviewTeam: z.array(z.string().trim()).optional().default([]),
  leadReviewer: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const completeSafetyReviewSchema = z.object({
  findings: z.string().trim().optional(),
  recommendations: z.array(z.string().trim()).optional().default([]),
  result: z.enum(['APPROVED', 'APPROVED_WITH_CONDITIONS', 'REQUIRES_REWORK', 'REJECTED']),
  completedBy: z.string().trim().optional(),
  approvedBy: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

// ============================================
// PRODUCT SAFETY ITEMS — CRUD
// ============================================

// GET / - List product safety items
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', category, riskLevel, complianceStatus, search } = req.query;
    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (category) where.category = category;
    if (riskLevel) where.riskLevel = riskLevel;
    if (complianceStatus) where.complianceStatus = complianceStatus;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { partNumber: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.aeroProductSafetyItem.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ riskLevel: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.aeroProductSafetyItem.count({ where }),
    ]);

    res.json({
      success: true,
      data: items,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List product safety items error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list product safety items' },
    });
  }
});

// GET /reviews - List safety reviews
router.get('/reviews', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', reviewType, result, search } = req.query;
    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (reviewType) where.reviewType = reviewType;
    if (result) where.result = result;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { scope: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [reviews, total] = await Promise.all([
      prisma.aeroSafetyReview.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { scheduledDate: 'desc' },
      }),
      prisma.aeroSafetyReview.count({ where }),
    ]);

    res.json({
      success: true,
      data: reviews,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List safety reviews error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list safety reviews' },
    });
  }
});

// GET /:id - Get product safety item
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await prisma.aeroProductSafetyItem.findUnique({
      where: { id: req.params.id },
    });

    if (!item || item.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product safety item not found' },
      });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    logger.error('Get product safety item error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get product safety item' },
    });
  }
});

// POST / - Create product safety item
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createProductSafetyItemSchema.parse(req.body);
    const refNumber = await generateProductSafetyItemRefNumber();

    const item = await prisma.aeroProductSafetyItem.create({
      data: {
        refNumber,
        title: data.title,
        description: data.description,
        partNumber: data.partNumber,
        category: data.category,
        regulatoryBasis: data.regulatoryBasis,
        hazardDescription: data.hazardDescription,
        riskLevel: data.riskLevel,
        mitigations: JSON.stringify(data.mitigations),
        verificationMethod: data.verificationMethod,
        complianceStatus: data.complianceStatus,
        status: 'ACTIVE',
        responsibleEngineer: data.responsibleEngineer,
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : null,
        notes: data.notes,
        createdBy: (req as AuthRequest).user?.id,
      },
    });

    res.status(201).json({ success: true, data: item });
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
    logger.error('Create product safety item error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create product safety item' },
    });
  }
});

// PUT /:id - Update product safety item
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aeroProductSafetyItem.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product safety item not found' },
      });
    }

    const data = updateProductSafetyItemSchema.parse(req.body);

    const item = await prisma.aeroProductSafetyItem.update({
      where: { id: req.params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.partNumber !== undefined && { partNumber: data.partNumber }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.regulatoryBasis !== undefined && { regulatoryBasis: data.regulatoryBasis }),
        ...(data.hazardDescription !== undefined && { hazardDescription: data.hazardDescription }),
        ...(data.riskLevel !== undefined && { riskLevel: data.riskLevel }),
        ...(data.mitigations !== undefined && { mitigations: JSON.stringify(data.mitigations) }),
        ...(data.verificationMethod !== undefined && { verificationMethod: data.verificationMethod }),
        ...(data.complianceStatus !== undefined && { complianceStatus: data.complianceStatus }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.responsibleEngineer !== undefined && { responsibleEngineer: data.responsibleEngineer }),
        ...(data.notes !== undefined && { notes: data.notes }),
        lastReviewDate: data.lastReviewDate
          ? new Date(data.lastReviewDate)
          : existing.lastReviewDate,
        nextReviewDate: data.nextReviewDate
          ? new Date(data.nextReviewDate)
          : existing.nextReviewDate,
      },
    });

    res.json({ success: true, data: item });
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
    logger.error('Update product safety item error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update product safety item' },
    });
  }
});

// DELETE /:id - Soft delete product safety item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aeroProductSafetyItem.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Product safety item not found' },
      });
    }

    await prisma.aeroProductSafetyItem.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete product safety item error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete product safety item' },
    });
  }
});

// ============================================
// SAFETY REVIEWS
// ============================================

// POST /reviews - Create safety review
router.post('/reviews', async (req: Request, res: Response) => {
  try {
    const data = createSafetyReviewSchema.parse(req.body);
    const refNumber = await generateSafetyReviewRefNumber();

    const review = await prisma.aeroSafetyReview.create({
      data: {
        refNumber,
        title: data.title,
        reviewType: data.reviewType,
        productSafetyItemIds: JSON.stringify(data.productSafetyItemIds),
        scope: data.scope,
        scheduledDate: new Date(data.scheduledDate),
        reviewTeam: JSON.stringify(data.reviewTeam),
        leadReviewer: data.leadReviewer,
        status: 'PLANNED',
        notes: data.notes,
        createdBy: (req as AuthRequest).user?.id,
      },
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
    logger.error('Create safety review error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create safety review' },
    });
  }
});

// PUT /reviews/:id/complete - Complete safety review
router.put('/reviews/:id/complete', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.aeroSafetyReview.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Safety review not found' } });
    }

    const data = completeSafetyReviewSchema.parse(req.body);

    const review = await prisma.aeroSafetyReview.update({
      where: { id: req.params.id },
      data: {
        findings: data.findings,
        recommendations: JSON.stringify(data.recommendations),
        result: data.result,
        completedBy: data.completedBy || (req as AuthRequest).user?.id,
        completedDate: new Date(),
        approvedBy: data.approvedBy,
        status: 'COMPLETED',
        notes: data.notes
          ? `${existing.notes ? existing.notes + '\n' : ''}${data.notes}`
          : existing.notes,
      },
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
    logger.error('Complete safety review error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to complete safety review' },
    });
  }
});

export default router;
