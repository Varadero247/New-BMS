import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-medical');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// TRACEABILITY MATRIX
// (ISO 13485 Clause 7.3 / FDA 21 CFR 820.30)
// ============================================

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `TRC-${yy}${mm}`;
  const count = await prisma.traceabilityMatrix.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  deviceId: z.string().trim().optional(),
  deviceName: z.string().trim().min(1).max(200),
  version: z.string().trim().optional(),
  scope: z.string().trim().optional(),
  preparedBy: z.string().trim().min(1).max(200),
  reviewedBy: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const updateSchema = createSchema.partial().extend({
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'RELEASED', 'OBSOLETE']).optional(),
  approvedBy: z.string().trim().optional(),
  approvedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
});

const linkCreateSchema = z.object({
  userNeedRef: z.string().trim().min(1).max(200),
  userNeedDesc: z.string().trim().min(1).max(200),
  designInputRef: z.string().trim().optional(),
  designInputDesc: z.string().trim().optional(),
  designOutputRef: z.string().trim().optional(),
  designOutputDesc: z.string().trim().optional(),
  verificationRef: z.string().trim().optional(),
  verificationResult: z.string().trim().optional(),
  validationRef: z.string().trim().optional(),
  validationResult: z.string().trim().optional(),
  riskRef: z.string().trim().optional(),
  status: z.enum(['OPEN', 'VERIFIED', 'VALIDATED', 'COMPLETE', 'GAP']).optional(),
  notes: z.string().trim().optional(),
});

const linkUpdateSchema = linkCreateSchema.partial();

// GET / - List traceability matrices
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, deviceName, search } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (deviceName) where.deviceName = { contains: deviceName as string, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { deviceName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [matrices, total] = await Promise.all([
      prisma.traceabilityMatrix.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { links: true } } },
      }),
      prisma.traceabilityMatrix.count({ where }),
    ]);

    res.json({
      success: true,
      data: matrices,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List traceability matrices error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list traceability matrices' },
    });
  }
});

// GET /:id - Get matrix with links
router.get(
  '/:id',
  checkOwnership(prisma.traceabilityMatrix),
  async (req: AuthRequest, res: Response) => {
    try {
      const matrix = await prisma.traceabilityMatrix.findUnique({
        where: { id: req.params.id },
        include: { links: { orderBy: { createdAt: 'asc' } } },
      });

      if (!matrix || matrix.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Traceability matrix not found' },
        });
      }

      res.json({ success: true, data: matrix });
    } catch (error) {
      logger.error('Get traceability matrix error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get traceability matrix' },
      });
    }
  }
);

// POST / - Create traceability matrix
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const refNumber = await generateRefNumber();

    const matrix = await prisma.traceabilityMatrix.create({
      data: {
        refNumber,
        title: data.title,
        deviceId: data.deviceId,
        deviceName: data.deviceName,
        version: data.version || '1.0',
        status: 'DRAFT',
        scope: data.scope,
        preparedBy: data.preparedBy,
        reviewedBy: data.reviewedBy,
        notes: data.notes,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: matrix });
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
    logger.error('Create traceability matrix error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create traceability matrix' },
    });
  }
});

// PUT /:id - Update traceability matrix
router.put(
  '/:id',
  checkOwnership(prisma.traceabilityMatrix),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.traceabilityMatrix.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Traceability matrix not found' },
        });
      }

      const data = updateSchema.parse(req.body);
      const updateData: Record<string, unknown> = { ...data };
      if (data.approvedDate) updateData.approvedDate = new Date(data.approvedDate);

      const matrix = await prisma.traceabilityMatrix.update({
        where: { id: req.params.id },
        data: updateData,
      });

      res.json({ success: true, data: matrix });
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
      logger.error('Update traceability matrix error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update traceability matrix' },
      });
    }
  }
);

// DELETE /:id - Soft delete matrix
router.delete(
  '/:id',
  checkOwnership(prisma.traceabilityMatrix),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.traceabilityMatrix.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Traceability matrix not found' },
        });
      }

      await prisma.traceabilityMatrix.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });
      res.status(204).send();
    } catch (error) {
      logger.error('Delete traceability matrix error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete traceability matrix' },
      });
    }
  }
);

// POST /:id/links - Add traceability link
router.post('/:id/links', async (req: AuthRequest, res: Response) => {
  try {
    const matrix = await prisma.traceabilityMatrix.findUnique({ where: { id: req.params.id } });
    if (!matrix || matrix.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Traceability matrix not found' },
      });
    }

    const data = linkCreateSchema.parse(req.body);

    const link = await prisma.traceabilityLink.create({
      data: { matrixId: req.params.id, ...data, status: data.status || 'OPEN' },
    });

    res.status(201).json({ success: true, data: link });
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
    logger.error('Add traceability link error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to add traceability link' },
    });
  }
});

// PUT /:id/links/:linkId - Update traceability link
router.put('/:id/links/:linkId', async (req: AuthRequest, res: Response) => {
  try {
    const { id, linkId } = req.params;

    const link = await prisma.traceabilityLink.findUnique({ where: { id: linkId } });
    if (!link || link.matrixId !== id) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Traceability link not found' },
      });
    }

    const data = linkUpdateSchema.parse(req.body);
    const updated = await prisma.traceabilityLink.update({ where: { id: linkId }, data });

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
    logger.error('Update traceability link error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update traceability link' },
    });
  }
});

// DELETE /:id/links/:linkId - Delete traceability link
router.delete('/:id/links/:linkId', async (req: AuthRequest, res: Response) => {
  try {
    const { id, linkId } = req.params;

    const link = await prisma.traceabilityLink.findUnique({ where: { id: linkId } });
    if (!link || link.matrixId !== id) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Traceability link not found' },
      });
    }

    await prisma.traceabilityLink.delete({ where: { id: linkId } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete traceability link error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete traceability link' },
    });
  }
});

export default router;
