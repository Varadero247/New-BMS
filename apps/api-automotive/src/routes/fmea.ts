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
// FMEA - Failure Mode and Effects Analysis
// (AIAG-VDA FMEA Handbook)
// ============================================

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `FMEA-${yy}${mm}`;
  const count = await prisma.fmeaStudy.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

const studyCreateSchema = z.object({
  title: z.string().trim().min(1),
  fmeaType: z.enum(['DFMEA', 'PFMEA', 'MFMEA']).optional(),
  partNumber: z.string().optional(),
  partName: z.string().optional(),
  customer: z.string().optional(),
  revision: z.string().optional(),
  preparedBy: z.string().trim().min(1),
  reviewedBy: z.string().optional(),
  scope: z.string().optional(),
  assumptions: z.string().optional(),
});

const studyUpdateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  fmeaType: z.enum(['DFMEA', 'PFMEA', 'MFMEA']).optional(),
  partNumber: z.string().optional(),
  partName: z.string().optional(),
  customer: z.string().optional(),
  revision: z.string().optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'RELEASED', 'OBSOLETE']).optional(),
  preparedBy: z.string().optional(),
  reviewedBy: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedDate: z.string().optional(),
  scope: z.string().optional(),
  assumptions: z.string().optional(),
});

const itemCreateSchema = z.object({
  itemNumber: z.number().int().min(1),
  processStep: z.string().trim().min(1),
  function: z.string().trim().min(1),
  failureMode: z.string().trim().min(1),
  failureEffect: z.string().trim().min(1),
  severity: z.number().int().min(1).max(10),
  potentialCauses: z.string().trim().min(1),
  occurrence: z.number().int().min(1).max(10),
  currentControls: z.string().optional(),
  detection: z.number().int().min(1).max(10),
  recommendedAction: z.string().optional(),
  responsibility: z.string().optional(),
  targetDate: z.string().optional(),
});

const itemUpdateSchema = itemCreateSchema.partial().extend({
  actionTaken: z.string().optional(),
  severityAfter: z.number().int().min(1).max(10).optional(),
  occurrenceAfter: z.number().int().min(1).max(10).optional(),
  detectionAfter: z.number().int().min(1).max(10).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'ACCEPTED_RISK']).optional(),
});

// GET / - List FMEA studies
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, fmeaType, customer, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (fmeaType) where.fmeaType = fmeaType as any;
    if (customer) where.customer = { contains: customer as string, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { partNumber: { contains: search as string, mode: 'insensitive' } },
        { partName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [studies, total] = await Promise.all([
      prisma.fmeaStudy.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: { select: { items: true } },
        },
      }),
      prisma.fmeaStudy.count({ where }),
    ]);

    res.json({
      success: true,
      data: studies,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List FMEA studies error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list FMEA studies' } });
  }
});

// GET /:id - Get FMEA study with items
router.get('/:id', checkOwnership(prisma.fmeaStudy), async (req: AuthRequest, res: Response) => {
  try {
    const study = await prisma.fmeaStudy.findUnique({
      where: { id: req.params.id },
      include: {
        items: { orderBy: { itemNumber: 'asc' } },
      },
    });

    if (!study || study.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA study not found' } });
    }

    res.json({ success: true, data: study });
  } catch (error) {
    logger.error('Get FMEA study error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get FMEA study' } });
  }
});

// POST / - Create FMEA study
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = studyCreateSchema.parse(req.body);
    const refNumber = await generateRefNumber();

    const study = await prisma.fmeaStudy.create({
      data: {
        refNumber,
        title: data.title,
        fmeaType: data.fmeaType || 'PFMEA',
        partNumber: data.partNumber,
        partName: data.partName,
        customer: data.customer,
        revision: data.revision || 'A',
        preparedBy: data.preparedBy,
        reviewedBy: data.reviewedBy,
        scope: data.scope,
        assumptions: data.assumptions,
        status: 'DRAFT',
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: study });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create FMEA study error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create FMEA study' } });
  }
});

// PUT /:id - Update FMEA study
router.put('/:id', checkOwnership(prisma.fmeaStudy), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.fmeaStudy.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA study not found' } });
    }

    const data = studyUpdateSchema.parse(req.body);
    const updateData: Record<string, unknown> = { ...data };
    if (data.approvedDate) updateData.approvedDate = new Date(data.approvedDate);

    const study = await prisma.fmeaStudy.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: study });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update FMEA study error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update FMEA study' } });
  }
});

// DELETE /:id - Soft delete FMEA study
router.delete('/:id', checkOwnership(prisma.fmeaStudy), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.fmeaStudy.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA study not found' } });
    }

    await prisma.fmeaStudy.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete FMEA study error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete FMEA study' } });
  }
});

// POST /:id/items - Add FMEA item
router.post('/:id/items', async (req: AuthRequest, res: Response) => {
  try {
    const study = await prisma.fmeaStudy.findUnique({ where: { id: req.params.id } });
    if (!study || study.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA study not found' } });
    }

    const data = itemCreateSchema.parse(req.body);
    const rpn = data.severity * data.occurrence * data.detection;

    const item = await prisma.fmeaItem.create({
      data: {
        studyId: req.params.id,
        itemNumber: data.itemNumber,
        processStep: data.processStep,
        function: data.function,
        failureMode: data.failureMode,
        failureEffect: data.failureEffect,
        severity: data.severity,
        potentialCauses: data.potentialCauses,
        occurrence: data.occurrence,
        currentControls: data.currentControls,
        detection: data.detection,
        rpn,
        recommendedAction: data.recommendedAction,
        responsibility: data.responsibility,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Add FMEA item error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add FMEA item' } });
  }
});

// PUT /:id/items/:itemId - Update FMEA item
router.put('/:id/items/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    const { id, itemId } = req.params;

    const study = await prisma.fmeaStudy.findUnique({ where: { id } });
    if (!study || study.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA study not found' } });
    }

    const item = await prisma.fmeaItem.findUnique({ where: { id: itemId } });
    if (!item || item.studyId !== id) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA item not found' } });
    }

    const data = itemUpdateSchema.parse(req.body);
    const updateData: Record<string, unknown> = { ...data };

    if (data.targetDate) updateData.targetDate = new Date(data.targetDate);

    // Recalculate RPN if severity/occurrence/detection changed
    const newSeverity = data.severity ?? item.severity;
    const newOccurrence = data.occurrence ?? item.occurrence;
    const newDetection = data.detection ?? item.detection;
    if (data.severity || data.occurrence || data.detection) {
      updateData.rpn = newSeverity * newOccurrence * newDetection;
    }

    // Calculate post-action RPN if after values provided
    if (data.severityAfter !== undefined || data.occurrenceAfter !== undefined || data.detectionAfter !== undefined) {
      const sa = data.severityAfter ?? item.severityAfter ?? newSeverity;
      const oa = data.occurrenceAfter ?? item.occurrenceAfter ?? newOccurrence;
      const da = data.detectionAfter ?? item.detectionAfter ?? newDetection;
      updateData.rpnAfter = sa * oa * da;
    }

    const updated = await prisma.fmeaItem.update({
      where: { id: itemId },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update FMEA item error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update FMEA item' } });
  }
});

// DELETE /:id/items/:itemId - Delete FMEA item
router.delete('/:id/items/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    const { id, itemId } = req.params;

    const item = await prisma.fmeaItem.findUnique({ where: { id: itemId } });
    if (!item || item.studyId !== id) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA item not found' } });
    }

    await prisma.fmeaItem.delete({ where: { id: itemId } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete FMEA item error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete FMEA item' } });
  }
});

export default router;
