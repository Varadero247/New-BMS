import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-project-management');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/documents - List documents by projectId
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, page = '1', limit = '50' } = req.query;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' },
      });
    }

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { projectId: projectId as string, deletedAt: null };

    const [documents, total] = await Promise.all([
      prisma.projectDocument.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.projectDocument.count({ where }),
    ]);

    res.json({
      success: true,
      data: documents,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List documents error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list documents' },
    });
  }
});

const createDocumentSchema = z.object({
  projectId: z.string().trim().min(1).max(200),
  documentCode: z.string().trim().min(1).max(200),
  documentTitle: z.string().trim().min(1).max(200),
  documentType: z.enum([
    'CHARTER',
    'PLAN',
    'REPORT',
    'SPECIFICATION',
    'DESIGN',
    'DRAWING',
    'CONTRACT',
  ]),
  documentCategory: z.string().trim().optional(),
  version: z.string().trim().optional(),
  fileUrl: z.string().trim().url('Invalid URL').optional(),
  fileSize: z.number().nonnegative().optional(),
  fileType: z.string().trim().optional(),
  description: z.string().trim().optional(),
  keywords: z.string().trim().optional(),
  accessLevel: z.string().trim().optional(),
  status: z.string().trim().optional(),
});
const updateDocumentSchema = createDocumentSchema
  .extend({
    reviewedAt: z.string().trim().optional(),
    approvedAt: z.string().trim().optional(),
  })
  .partial();

// POST /api/documents - Create document
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createDocumentSchema.parse(req.body);

    const document = await prisma.projectDocument.create({
      data: {
        projectId: data.projectId,
        documentCode: data.documentCode,
        documentTitle: data.documentTitle,
        documentType: data.documentType,
        documentCategory: data.documentCategory,
        version: data.version || '1.0',
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        fileType: data.fileType,
        description: data.description,
        keywords: data.keywords,
        accessLevel: data.accessLevel || 'PROJECT_TEAM',
        status: (data.status as any) || 'DRAFT',
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    logger.error('Create document error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create document' },
    });
  }
});

// PUT /api/documents/:id - Update document
router.put(
  '/:id',
  checkOwnership(prisma.projectDocument),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.projectDocument.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
      }

      const parsed = updateDocumentSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
        });
      const data = parsed.data;
      const updateData = { ...data, updatedBy: req.user?.id } as Record<string, unknown>;

      if (data.reviewedAt) updateData.reviewedAt = new Date(data.reviewedAt);
      if (data.approvedAt) updateData.approvedAt = new Date(data.approvedAt);

      const document = await prisma.projectDocument.update({
        where: { id: req.params.id },
        data: updateData,
      });

      res.json({ success: true, data: document });
    } catch (error) {
      logger.error('Update document error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update document' },
      });
    }
  }
);

// DELETE /api/documents/:id - Delete document
router.delete(
  '/:id',
  checkOwnership(prisma.projectDocument),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.projectDocument.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
      }

      await prisma.projectDocument.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
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
