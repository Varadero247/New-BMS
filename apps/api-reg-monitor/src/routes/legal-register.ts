import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';

const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('reg-monitor-legal-register');

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  legislation: z.string().optional(),
  jurisdiction: z.string().optional(),
  applicability: z.string().optional(),
  requirements: z.string().optional(),
  complianceStatus: z.string().optional(),
  responsiblePerson: z.string().optional(),
  reviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  lastReviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await prisma.regLegalRegister.count({
    where: { orgId, referenceNumber: { startsWith: `RLR-${y}` } },
  });
  return `RLR-${y}-${String(c + 1).padStart(4, '0')}`;
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.regLegalRegister.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.regLegalRegister.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: Math.max(1, parseInt(limit, 10) || 20),
        total,
        totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)),
      },
    });
  } catch (error: unknown) {
    logger.error('Fetch failed', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch legal register entries' },
    });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const item = await prisma.regLegalRegister.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!item)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'legal register entry not found' },
      });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch legal register entry' },
    });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const {
      title,
      legislation,
      jurisdiction,
      applicability,
      requirements,
      complianceStatus,
      responsiblePerson,
      reviewDate,
      lastReviewDate,
      notes,
    } = parsed.data;
    const data = await prisma.regLegalRegister.create({
      data: {
        title,
        legislation,
        jurisdiction,
        applicability,
        requirements,
        complianceStatus,
        responsiblePerson,
        reviewDate: reviewDate ? new Date(reviewDate) : undefined,
        lastReviewDate: lastReviewDate ? new Date(lastReviewDate) : undefined,
        notes,
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' },
    });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const existing = await prisma.regLegalRegister.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!existing)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'legal register entry not found' },
      });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const {
      title,
      legislation,
      jurisdiction,
      applicability,
      requirements,
      complianceStatus,
      responsiblePerson,
      reviewDate,
      lastReviewDate,
      notes,
    } = parsed.data;
    const updateData: Record<string, unknown> = { updatedBy: (req as AuthRequest).user?.id };
    if (title !== undefined) updateData.title = title;
    if (legislation !== undefined) updateData.legislation = legislation;
    if (jurisdiction !== undefined) updateData.jurisdiction = jurisdiction;
    if (applicability !== undefined) updateData.applicability = applicability;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (complianceStatus !== undefined) updateData.complianceStatus = complianceStatus;
    if (responsiblePerson !== undefined) updateData.responsiblePerson = responsiblePerson;
    if (reviewDate !== undefined) updateData.reviewDate = new Date(reviewDate);
    if (lastReviewDate !== undefined) updateData.lastReviewDate = new Date(lastReviewDate);
    if (notes !== undefined) updateData.notes = notes;
    const data = await prisma.regLegalRegister.update({
      where: { id: req.params.id },
      data: updateData,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' },
    });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const existing = await prisma.regLegalRegister.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!existing)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'legal register entry not found' },
      });
    await prisma.regLegalRegister.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'legal register entry deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete resource' },
    });
  }
});

export default router;
