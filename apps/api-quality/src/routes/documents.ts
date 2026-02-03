import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();

router.use(authenticate);

// Generate document number
function generateDocumentNumber(type: string): string {
  const prefix = type.substring(0, 3).toUpperCase();
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

// GET /api/documents - List documents
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, documentType, standard, search } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (documentType) where.documentType = documentType;
    if (standard) where.standard = standard;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { documentNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.qMSDocument.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
        include: {
          versions: { take: 1, orderBy: { createdAt: 'desc' } },
          _count: { select: { approvals: true, distributions: true } },
        },
      }),
      prisma.qMSDocument.count({ where }),
    ]);

    res.json({
      success: true,
      data: documents,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list documents' } });
  }
});

// GET /api/documents/:id - Get single document
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const document = await prisma.qMSDocument.findUnique({
      where: { id: req.params.id },
      include: {
        versions: { orderBy: { createdAt: 'desc' } },
        approvals: { orderBy: { approvalLevel: 'asc' } },
        distributions: true,
      },
    });

    if (!document) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    // Log access
    await prisma.qMSDocumentAccessLog.create({
      data: {
        documentId: document.id,
        userId: req.user!.id,
        action: 'VIEW',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({ success: true, data: document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get document' } });
  }
});

// POST /api/documents - Create document
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      documentType: z.enum(['POLICY', 'PROCEDURE', 'WORK_INSTRUCTION', 'FORM', 'RECORD', 'MANUAL', 'PLAN', 'SPECIFICATION', 'DRAWING', 'STANDARD', 'GUIDELINE', 'TEMPLATE', 'REPORT', 'CERTIFICATE', 'CONTRACT', 'OTHER']),
      category: z.string().optional(),
      isoClause: z.string().optional(),
      standard: z.enum(['ISO_45001', 'ISO_14001', 'ISO_9001']).optional(),
      confidentiality: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'SECRET']).default('INTERNAL'),
      reviewFrequency: z.number().optional(),
      keywords: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
    });

    const data = schema.parse(req.body);

    const document = await prisma.qMSDocument.create({
      data: {
        ...data,
        documentNumber: generateDocumentNumber(data.documentType),
        status: 'DRAFT',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create document error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create document' } });
  }
});

// PATCH /api/documents/:id - Update document
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qMSDocument.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      isoClause: z.string().optional(),
      confidentiality: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'SECRET']).optional(),
      reviewFrequency: z.number().optional(),
      nextReviewDate: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'EFFECTIVE', 'OBSOLETE', 'ARCHIVED']).optional(),
    });

    const data = schema.parse(req.body);

    const document = await prisma.qMSDocument.update({
      where: { id: req.params.id },
      data: {
        ...data,
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : undefined,
        updatedById: req.user!.id,
      },
    });

    res.json({ success: true, data: document });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update document error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update document' } });
  }
});

// GET /api/documents/:id/versions - Get document versions
router.get('/:id/versions', async (req: AuthRequest, res: Response) => {
  try {
    const versions = await prisma.qMSDocumentVersion.findMany({
      where: { documentId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: versions });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get versions' } });
  }
});

// POST /api/documents/:id/versions - Create new version
router.post('/:id/versions', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      fileUrl: z.string().optional(),
      fileName: z.string().optional(),
      fileSize: z.number().optional(),
      fileType: z.string().optional(),
      content: z.string().optional(),
      changeReason: z.string().optional(),
      changeSummary: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Get current version
    const currentVersion = await prisma.qMSDocumentVersion.findFirst({
      where: { documentId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });

    const majorVersion = currentVersion?.majorVersion || 1;
    const minorVersion = (currentVersion?.minorVersion || 0) + 1;

    const version = await prisma.qMSDocumentVersion.create({
      data: {
        documentId: req.params.id,
        ...data,
        versionNumber: `${majorVersion}.${minorVersion}`,
        majorVersion,
        minorVersion,
        status: 'DRAFT',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: version });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create version error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create version' } });
  }
});

// POST /api/documents/:id/approve - Submit for approval
router.post('/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      approverIds: z.array(z.string()),
      versionNumber: z.string().optional(),
      dueDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const approvals = await Promise.all(
      data.approverIds.map((approverId, index) =>
        prisma.qMSDocumentApproval.create({
          data: {
            documentId: req.params.id,
            versionNumber: data.versionNumber,
            approverId,
            approvalLevel: index + 1,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          },
        })
      )
    );

    // Update document status
    await prisma.qMSDocument.update({
      where: { id: req.params.id },
      data: { status: 'REVIEW' },
    });

    res.status(201).json({ success: true, data: approvals });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Submit approval error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit for approval' } });
  }
});

// PATCH /api/documents/:id/approve/:approvalId - Respond to approval
router.patch('/:id/approve/:approvalId', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      decision: z.enum(['APPROVED', 'APPROVED_WITH_COMMENTS', 'REJECTED', 'RETURNED_FOR_REVISION']),
      comments: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const approval = await prisma.qMSDocumentApproval.update({
      where: { id: req.params.approvalId },
      data: {
        decision: data.decision,
        comments: data.comments,
        status: data.decision === 'APPROVED' || data.decision === 'APPROVED_WITH_COMMENTS' ? 'APPROVED' : 'REJECTED',
        respondedAt: new Date(),
        signedAt: new Date(),
      },
    });

    res.json({ success: true, data: approval });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Respond approval error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to respond to approval' } });
  }
});

// POST /api/documents/:id/distribute - Distribute document
router.post('/:id/distribute', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      recipientIds: z.array(z.string()),
      recipientType: z.enum(['USER', 'DEPARTMENT', 'ROLE', 'EXTERNAL']).default('USER'),
      distributionType: z.enum(['ELECTRONIC', 'PRINTED_CONTROLLED', 'PRINTED_UNCONTROLLED', 'EXTERNAL']).default('ELECTRONIC'),
      acknowledgementRequired: z.boolean().default(true),
    });

    const data = schema.parse(req.body);

    const distributions = await Promise.all(
      data.recipientIds.map((recipientId, index) =>
        prisma.qMSDocumentDistribution.create({
          data: {
            documentId: req.params.id,
            recipientId,
            recipientType: data.recipientType,
            distributionType: data.distributionType,
            acknowledgementRequired: data.acknowledgementRequired,
            copyNumber: `${req.params.id.slice(-4)}-${(index + 1).toString().padStart(3, '0')}`,
            status: 'DISTRIBUTED',
          },
        })
      )
    );

    res.status(201).json({ success: true, data: distributions });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Distribute error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to distribute document' } });
  }
});

// GET /api/documents/:id/access-log - Get access log
router.get('/:id/access-log', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      prisma.qMSDocumentAccessLog.findMany({
        where: { documentId: req.params.id },
        skip,
        take: limitNum,
        orderBy: { accessedAt: 'desc' },
      }),
      prisma.qMSDocumentAccessLog.count({ where: { documentId: req.params.id } }),
    ]);

    res.json({
      success: true,
      data: logs,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Get access log error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get access log' } });
  }
});

// DELETE /api/documents/:id - Delete document
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qMSDocument.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    await prisma.qMSDocument.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Document deleted successfully' } });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete document' } });
  }
});

export default router;
