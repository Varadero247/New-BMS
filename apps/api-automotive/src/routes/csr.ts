import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-automotive');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// CSR Register (Customer-Specific Requirements)
// IATF 16949 Compliance
// ============================================

// GET /oems - List distinct OEM names
router.get('/oems', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const results = await prisma.csrRequirement.findMany({
      distinct: ['oem'],
      select: { oem: true },
      orderBy: { oem: 'asc' },
      take: 200,
    });

    const oems = results.map((r) => r.oem);

    res.json({ success: true, data: oems });
  } catch (error) {
    logger.error('List OEMs error', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list OEMs' } });
  }
});

// GET /gaps - All non-compliant CSRs (status != COMPLIANT && status != NOT_ASSESSED)
router.get('/gaps', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      complianceStatus: {
        notIn: ['COMPLIANT', 'NOT_ASSESSED'],
      },
    };

    const [requirements, total] = await Promise.all([
      prisma.csrRequirement.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.csrRequirement.count({ where }),
    ]);

    res.json({
      success: true,
      data: requirements,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List CSR gaps error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list CSR gaps' },
    });
  }
});

// GET /oems/:oem - Get all CSRs for a specific OEM
router.get('/oems/:oem', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { oem } = req.params;
    const { page = '1', limit = '20', complianceStatus, iatfClause } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      oem: { equals: oem, mode: 'insensitive' },
    };
    if (complianceStatus) where.complianceStatus = complianceStatus as any;
    if (iatfClause) where.iatfClause = { contains: iatfClause as string, mode: 'insensitive' };

    const [requirements, total] = await Promise.all([
      prisma.csrRequirement.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ iatfClause: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.csrRequirement.count({ where }),
    ]);

    res.json({
      success: true,
      data: requirements,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List CSRs for OEM error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list CSRs for OEM' },
    });
  }
});

// PUT /:id/status - Update compliance status
router.put('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.csrRequirement.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'CSR requirement not found' },
      });
    }

    const schema = z.object({
      complianceStatus: z.enum(['COMPLIANT', 'PARTIAL', 'NOT_ASSESSED', 'NON_COMPLIANT']),
      gapNotes: z.string().trim().optional(),
      actionRequired: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: Record<string, unknown> = {
      complianceStatus: data.complianceStatus,
    };
    if (data.gapNotes !== undefined) updateData.gapNotes = data.gapNotes;
    if (data.actionRequired !== undefined) updateData.actionRequired = data.actionRequired;

    const updated = await prisma.csrRequirement.update({
      where: { id },
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
    logger.error('Update CSR status error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update CSR status' },
    });
  }
});

export default router;
