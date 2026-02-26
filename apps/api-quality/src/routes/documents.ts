// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, formatRefNumber, parsePagination} from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-quality');

const router: Router = Router();

router.use(authenticate);
router.param('id', validateIdParam());


// GET / - List documents
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', documentType, status, accessLevel, search } = req.query;

    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (documentType) where.documentType = documentType;
    if (status) where.status = status;
    if (accessLevel) where.accessLevel = accessLevel;
    if (search) {
      where.title = { contains: search as string, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.qualDocument.findMany({
        where,
        // FINDING-040: select list fields only — exclude large text bodies and AI analysis
        select: {
          id: true,
          referenceNumber: true,
          title: true,
          documentType: true,
          isoClause: true,
          linkedProcess: true,
          version: true,
          status: true,
          language: true,
          author: true,
          ownerCustodian: true,
          reviewer: true,
          approvedBy: true,
          issueDate: true,
          effectiveDate: true,
          nextReviewDate: true,
          accessLevel: true,
          locationUrl: true,
          controlledCopies: true,
          aiGenerated: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          createdBy: true,
        },
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.qualDocument.count({ where }),
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
    logger.error('List documents error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list documents' },
    });
  }
});

// GET /:id - Get single document
router.get('/:id', checkOwnership(prisma.qualDocument), async (req: Request, res: Response) => {
  try {
    const document = await prisma.qualDocument.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    logger.error('Get document error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get document' },
    });
  }
});

// POST / - Create document
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      documentType: z.enum([
        'POLICY',
        'PROCEDURE',
        'WORK_INSTRUCTION',
        'FORM',
        'RECORD',
        'SPECIFICATION',
        'DRAWING',
        'EXTERNAL',
        'PLAN',
        'REPORT',
      ]),
      isoClause: z.string().trim().optional(),
      linkedProcess: z.string().trim().optional(),
      version: z.string().trim().default('1.0'),
      language: z.string().trim().default('English'),
      purpose: z.string().trim().optional(),
      scope: z.string().trim().optional(),
      summary: z.string().trim().optional(),
      keyChanges: z.string().trim().optional(),
      author: z.string().trim().min(1).max(200),
      ownerCustodian: z.string().trim().min(1).max(200),
      reviewer: z.string().trim().optional(),
      approvedBy: z.string().trim().optional(),
      issueDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      effectiveDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      nextReviewDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      distributionList: z.string().trim().optional(),
      accessLevel: z
        .enum(['UNRESTRICTED', 'CONTROLLED', 'CONFIDENTIAL', 'RESTRICTED'])
        .default('UNRESTRICTED'),
      locationUrl: z.string().trim().url('Invalid URL').optional(),
      controlledCopies: z.number().default(0),
      supersedesDocument: z.string().trim().optional(),
      relatedProcedures: z.string().trim().optional(),
      relatedForms: z.string().trim().optional(),
      relatedRecords: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const _refPrefix = 'QMS-DOC';
    const _refYear = new Date().getFullYear();
    const _refCount = await prisma.qualDocument.count({ where: { referenceNumber: { startsWith: `${_refPrefix}-${_refYear}` } } });
    const referenceNumber = formatRefNumber(_refPrefix, _refCount);

    const document = await prisma.qualDocument.create({
      data: {
        ...data,
        referenceNumber,
        status: 'DRAFT',
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : undefined,
      },
    });

    res.status(201).json({ success: true, data: document });
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
    logger.error('Create document error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create document' },
    });
  }
});

// PUT /:id - Update document
router.put('/:id', checkOwnership(prisma.qualDocument), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.qualDocument.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200).optional(),
      documentType: z
        .enum([
          'POLICY',
          'PROCEDURE',
          'WORK_INSTRUCTION',
          'FORM',
          'RECORD',
          'SPECIFICATION',
          'DRAWING',
          'EXTERNAL',
          'PLAN',
          'REPORT',
        ])
        .optional(),
      isoClause: z.string().trim().nullable().optional(),
      linkedProcess: z.string().trim().nullable().optional(),
      version: z.string().trim().optional(),
      status: z
        .enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ISSUED', 'OBSOLETE', 'SUPERSEDED', 'EXTERNAL'])
        .optional(),
      language: z.string().trim().optional(),
      purpose: z.string().trim().nullable().optional(),
      scope: z.string().trim().nullable().optional(),
      summary: z.string().trim().nullable().optional(),
      keyChanges: z.string().trim().nullable().optional(),
      author: z.string().trim().optional(),
      ownerCustodian: z.string().trim().optional(),
      reviewer: z.string().trim().nullable().optional(),
      approvedBy: z.string().trim().nullable().optional(),
      issueDate: z
        .string()
        .nullable()
        .refine((s) => s === null || !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      effectiveDate: z
        .string()
        .nullable()
        .refine((s) => s === null || !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      nextReviewDate: z
        .string()
        .nullable()
        .refine((s) => s === null || !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      distributionList: z.string().trim().nullable().optional(),
      accessLevel: z.enum(['UNRESTRICTED', 'CONTROLLED', 'CONFIDENTIAL', 'RESTRICTED']).optional(),
      locationUrl: z.string().trim().nullable().optional(),
      controlledCopies: z.number().optional(),
      supersedesDocument: z.string().trim().nullable().optional(),
      relatedProcedures: z.string().trim().nullable().optional(),
      relatedForms: z.string().trim().nullable().optional(),
      relatedRecords: z.string().trim().nullable().optional(),
      // AI fields
      aiAnalysis: z.string().trim().nullable().optional(),
      aiGapAnalysis: z.string().trim().nullable().optional(),
      aiContentSuggestions: z.string().trim().nullable().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const updateData = {
      ...data,
      issueDate: data.issueDate
        ? new Date(data.issueDate)
        : data.issueDate === null
          ? null
          : undefined,
      effectiveDate: data.effectiveDate
        ? new Date(data.effectiveDate)
        : data.effectiveDate === null
          ? null
          : undefined,
      nextReviewDate: data.nextReviewDate
        ? new Date(data.nextReviewDate)
        : data.nextReviewDate === null
          ? null
          : undefined,
    };

    const document = await prisma.qualDocument.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: document });
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
    logger.error('Update document error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update document' },
    });
  }
});

// DELETE /:id - Delete document
router.delete(
  '/:id',
  checkOwnership(prisma.qualDocument),
  async (req: Request, res: Response) => {
    try {
      const existing = await prisma.qualDocument.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
      }

      await prisma.qualDocument.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Delete document error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete document' },
      });
    }
  }
);

export default router;
