import { Router, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-quality');

const router: Router = Router();

router.use(authenticate);
router.param('id', validateIdParam());

// Generate reference number
async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-DOC';
  const count = await prisma.qualDocument.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List documents
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', documentType, status, accessLevel, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (documentType) where.documentType = documentType as any;
    if (status) where.status = status as any;
    if (accessLevel) where.accessLevel = accessLevel as any;
    if (search) {
      where.title = { contains: search as string, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.qualDocument.findMany({
        where,
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
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list documents' } });
  }
});

// GET /:id - Get single document
router.get('/:id', checkOwnership(prisma.qualDocument), async (req: AuthRequest, res: Response) => {
  try {
    const document = await prisma.qualDocument.findUnique({
      where: { id: req.params.id },
    });

    if (!document) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    logger.error('Get document error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get document' } });
  }
});

// POST / - Create document
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      documentType: z.enum(['POLICY', 'PROCEDURE', 'WORK_INSTRUCTION', 'FORM', 'RECORD', 'SPECIFICATION', 'DRAWING', 'EXTERNAL', 'PLAN', 'REPORT']),
      isoClause: z.string().optional(),
      linkedProcess: z.string().optional(),
      version: z.string().default('1.0'),
      language: z.string().default('English'),
      purpose: z.string().optional(),
      scope: z.string().optional(),
      summary: z.string().optional(),
      keyChanges: z.string().optional(),
      author: z.string().trim().min(1).max(200),
      ownerCustodian: z.string().trim().min(1).max(200),
      reviewer: z.string().optional(),
      approvedBy: z.string().optional(),
      issueDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      effectiveDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      nextReviewDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      distributionList: z.string().optional(),
      accessLevel: z.enum(['UNRESTRICTED', 'CONTROLLED', 'CONFIDENTIAL', 'RESTRICTED']).default('UNRESTRICTED'),
      locationUrl: z.string().trim().url('Invalid URL').optional(),
      controlledCopies: z.number().default(0),
      supersedesDocument: z.string().optional(),
      relatedProcedures: z.string().optional(),
      relatedForms: z.string().optional(),
      relatedRecords: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create document error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create document' } });
  }
});

// PUT /:id - Update document
router.put('/:id', checkOwnership(prisma.qualDocument), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualDocument.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200).optional(),
      documentType: z.enum(['POLICY', 'PROCEDURE', 'WORK_INSTRUCTION', 'FORM', 'RECORD', 'SPECIFICATION', 'DRAWING', 'EXTERNAL', 'PLAN', 'REPORT']).optional(),
      isoClause: z.string().nullable().optional(),
      linkedProcess: z.string().nullable().optional(),
      version: z.string().optional(),
      status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ISSUED', 'OBSOLETE', 'SUPERSEDED', 'EXTERNAL']).optional(),
      language: z.string().optional(),
      purpose: z.string().nullable().optional(),
      scope: z.string().nullable().optional(),
      summary: z.string().nullable().optional(),
      keyChanges: z.string().nullable().optional(),
      author: z.string().optional(),
      ownerCustodian: z.string().optional(),
      reviewer: z.string().nullable().optional(),
      approvedBy: z.string().nullable().optional(),
      issueDate: z.string().nullable().refine(s => s === null || !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      effectiveDate: z.string().nullable().refine(s => s === null || !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      nextReviewDate: z.string().nullable().refine(s => s === null || !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      distributionList: z.string().nullable().optional(),
      accessLevel: z.enum(['UNRESTRICTED', 'CONTROLLED', 'CONFIDENTIAL', 'RESTRICTED']).optional(),
      locationUrl: z.string().nullable().optional(),
      controlledCopies: z.number().optional(),
      supersedesDocument: z.string().nullable().optional(),
      relatedProcedures: z.string().nullable().optional(),
      relatedForms: z.string().nullable().optional(),
      relatedRecords: z.string().nullable().optional(),
      // AI fields
      aiAnalysis: z.string().nullable().optional(),
      aiGapAnalysis: z.string().nullable().optional(),
      aiContentSuggestions: z.string().nullable().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const updateData = {
      ...data,
      issueDate: data.issueDate ? new Date(data.issueDate) : data.issueDate === null ? null : undefined,
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : data.effectiveDate === null ? null : undefined,
      nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : data.nextReviewDate === null ? null : undefined,
    };

    const document = await prisma.qualDocument.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: document });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update document error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update document' } });
  }
});

// DELETE /:id - Delete document
router.delete('/:id', checkOwnership(prisma.qualDocument), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualDocument.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    await prisma.qualDocument.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete document error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete document' } });
  }
});

export default router;
