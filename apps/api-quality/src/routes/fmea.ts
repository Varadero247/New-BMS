import { Router, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-quality');

const router = Router();

router.use(authenticate);

// Generate reference number
async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.qualFmea.count({
    where: { referenceNumber: { startsWith: `QMS-FMEA-${year}` } },
  });
  return `QMS-FMEA-${year}-${String(count + 1).padStart(3, '0')}`;
}

// Determine action priority from RPN
function getActionPriority(rpn: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (rpn > 200) return 'HIGH';
  if (rpn >= 80) return 'MEDIUM';
  return 'LOW';
}

// ============================================
// FMEA CRUD
// ============================================

// GET / — List FMEAs (paginated)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, fmeaType } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.QualFmeaWhereInput = {};
    if (status) where.status = status;
    if (fmeaType) where.fmeaType = fmeaType;

    const [items, total] = await Promise.all([
      prisma.qualFmea.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { rows: { orderBy: { sortOrder: 'asc' } } },
      }),
      prisma.qualFmea.count({ where }),
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
    logger.error('List FMEAs error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list FMEAs' } });
  }
});

// GET /stats — FMEA statistics
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const totalFmeas = await prisma.qualFmea.count();

    const allRows = await prisma.qualFmeaRow.findMany({
      select: { rpn: true },
    });

    const highRpnCount = allRows.filter(r => r.rpn > 200).length;
    const avgRpn = allRows.length > 0
      ? Math.round(allRows.reduce((sum, r) => sum + r.rpn, 0) / allRows.length)
      : 0;

    res.json({
      success: true,
      data: { totalFmeas, highRpnCount, avgRpn },
    });
  } catch (error) {
    logger.error('FMEA stats error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get FMEA stats' } });
  }
});

// GET /:id — Get single FMEA
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const fmea = await prisma.qualFmea.findUnique({
      where: { id: req.params.id },
      include: { rows: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!fmea) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA not found' } });
    }

    res.json({ success: true, data: fmea });
  } catch (error) {
    logger.error('Get FMEA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get FMEA' } });
  }
});

// POST / — Create FMEA
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      fmeaType: z.enum(['DFMEA', 'PFMEA', 'SFMEA']),
      title: z.string().min(1),
      productProcess: z.string().min(1),
      partNumberRev: z.string().optional(),
      customer: z.string().optional(),
      teamMembers: z.string().optional(),
      scopeDescription: z.string().optional(),
      linkedProcess: z.string().optional(),
      status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'ACTIVE', 'ARCHIVED']).optional(),
      dateInitiated: z.string().optional(),
      nextReviewDate: z.string().optional(),
      aiAnalysis: z.string().optional(),
      aiMissingFailureModes: z.string().optional(),
      aiControlGaps: z.string().optional(),
      aiTopPriorityActions: z.string().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const fmea = await prisma.qualFmea.create({
      data: {
        referenceNumber,
        fmeaType: data.fmeaType,
        title: data.title,
        productProcess: data.productProcess,
        partNumberRev: data.partNumberRev,
        customer: data.customer,
        teamMembers: data.teamMembers,
        scopeDescription: data.scopeDescription,
        linkedProcess: data.linkedProcess,
        status: data.status || 'DRAFT',
        dateInitiated: data.dateInitiated ? new Date(data.dateInitiated) : new Date(),
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : undefined,
        aiAnalysis: data.aiAnalysis,
        aiMissingFailureModes: data.aiMissingFailureModes,
        aiControlGaps: data.aiControlGaps,
        aiTopPriorityActions: data.aiTopPriorityActions,
        aiGenerated: data.aiGenerated,
      },
      include: { rows: { orderBy: { sortOrder: 'asc' } } },
    });

    res.status(201).json({ success: true, data: fmea });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Create FMEA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create FMEA' } });
  }
});

// PUT /:id — Update FMEA
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualFmea.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA not found' } });
    }

    const schema = z.object({
      fmeaType: z.enum(['DFMEA', 'PFMEA', 'SFMEA']).optional(),
      title: z.string().min(1).optional(),
      productProcess: z.string().optional(),
      partNumberRev: z.string().optional(),
      customer: z.string().optional(),
      teamMembers: z.string().optional(),
      scopeDescription: z.string().optional(),
      linkedProcess: z.string().optional(),
      status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'ACTIVE', 'ARCHIVED']).optional(),
      nextReviewDate: z.string().optional(),
      aiAnalysis: z.string().optional(),
      aiMissingFailureModes: z.string().optional(),
      aiControlGaps: z.string().optional(),
      aiTopPriorityActions: z.string().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const fmea = await prisma.qualFmea.update({
      where: { id: req.params.id },
      data: {
        ...data,
        nextReviewDate: data.nextReviewDate ? new Date(data.nextReviewDate) : undefined,
      },
      include: { rows: { orderBy: { sortOrder: 'asc' } } },
    });

    res.json({ success: true, data: fmea });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Update FMEA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update FMEA' } });
  }
});

// DELETE /:id — Delete FMEA
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualFmea.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA not found' } });
    }

    await prisma.qualFmea.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete FMEA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete FMEA' } });
  }
});

// ============================================
// FMEA ROWS (nested under /:id/rows)
// ============================================

// POST /:id/rows — Create FMEA row with auto RPN
router.post('/:id/rows', async (req: AuthRequest, res: Response) => {
  try {
    const fmea = await prisma.qualFmea.findUnique({ where: { id: req.params.id } });
    if (!fmea) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA not found' } });
    }

    const schema = z.object({
      sortOrder: z.number().optional(),
      itemProcessStep: z.string().optional(),
      functionRequirement: z.string().optional(),
      failureMode: z.string().min(1),
      effectOfFailure: z.string().min(1),
      severity: z.number().min(1).max(10).default(1),
      potentialCauses: z.string().min(1),
      currentPreventionControls: z.string().optional(),
      occurrence: z.number().min(1).max(10).default(1),
      currentDetectionControls: z.string().optional(),
      detection: z.number().min(1).max(10).default(1),
      recommendedActions: z.string().optional(),
      assignedTo: z.string().optional(),
      dueDate: z.string().optional(),
      actionsTaken: z.string().optional(),
      status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'ACCEPTED']).optional(),
    });

    const data = schema.parse(req.body);

    // Auto-calculate RPN
    const rpn = data.severity * data.occurrence * data.detection;
    const actionPriority = getActionPriority(rpn);

    // Default sortOrder to next in sequence
    let sortOrder = data.sortOrder;
    if (sortOrder === undefined) {
      const maxRow = await prisma.qualFmeaRow.findFirst({
        where: { fmeaId: req.params.id },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true },
      });
      sortOrder = (maxRow?.sortOrder ?? -1) + 1;
    }

    const row = await prisma.qualFmeaRow.create({
      data: {
        fmeaId: req.params.id,
        sortOrder,
        itemProcessStep: data.itemProcessStep,
        functionRequirement: data.functionRequirement,
        failureMode: data.failureMode,
        effectOfFailure: data.effectOfFailure,
        severity: data.severity,
        potentialCauses: data.potentialCauses,
        currentPreventionControls: data.currentPreventionControls,
        occurrence: data.occurrence,
        currentDetectionControls: data.currentDetectionControls,
        detection: data.detection,
        rpn,
        actionPriority,
        recommendedActions: data.recommendedActions,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        actionsTaken: data.actionsTaken,
        status: data.status || 'OPEN',
      },
    });

    res.status(201).json({ success: true, data: row });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Create FMEA row error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create FMEA row' } });
  }
});

// PUT /:id/rows/:rowId — Update FMEA row, recalc RPN
router.put('/:id/rows/:rowId', async (req: AuthRequest, res: Response) => {
  try {
    const existingRow = await prisma.qualFmeaRow.findFirst({
      where: { id: req.params.rowId, fmeaId: req.params.id },
    });
    if (!existingRow) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA row not found' } });
    }

    const schema = z.object({
      sortOrder: z.number().optional(),
      itemProcessStep: z.string().optional(),
      functionRequirement: z.string().optional(),
      failureMode: z.string().optional(),
      effectOfFailure: z.string().optional(),
      severity: z.number().min(1).max(10).optional(),
      potentialCauses: z.string().optional(),
      currentPreventionControls: z.string().optional(),
      occurrence: z.number().min(1).max(10).optional(),
      currentDetectionControls: z.string().optional(),
      detection: z.number().min(1).max(10).optional(),
      recommendedActions: z.string().optional(),
      assignedTo: z.string().optional(),
      dueDate: z.string().optional(),
      actionsTaken: z.string().optional(),
      revisedSeverity: z.number().min(1).max(10).optional(),
      revisedOccurrence: z.number().min(1).max(10).optional(),
      revisedDetection: z.number().min(1).max(10).optional(),
      status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'ACCEPTED']).optional(),
    });

    const data = schema.parse(req.body);

    // Recalculate RPN with current or updated values
    const s = data.severity ?? existingRow.severity;
    const o = data.occurrence ?? existingRow.occurrence;
    const d = data.detection ?? existingRow.detection;
    const rpn = s * o * d;
    const actionPriority = getActionPriority(rpn);

    // Calculate revised RPN if revised scores are provided
    let revisedRpn: number | undefined = existingRow.revisedRpn ?? undefined;
    const rs = data.revisedSeverity ?? existingRow.revisedSeverity;
    const ro = data.revisedOccurrence ?? existingRow.revisedOccurrence;
    const rd = data.revisedDetection ?? existingRow.revisedDetection;
    if (rs !== null && ro !== null && rd !== null && rs !== undefined && ro !== undefined && rd !== undefined) {
      revisedRpn = rs * ro * rd;
    }

    const row = await prisma.qualFmeaRow.update({
      where: { id: req.params.rowId },
      data: {
        ...data,
        rpn,
        actionPriority,
        revisedRpn,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });

    res.json({ success: true, data: row });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Update FMEA row error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update FMEA row' } });
  }
});

// DELETE /:id/rows/:rowId — Delete FMEA row
router.delete('/:id/rows/:rowId', async (req: AuthRequest, res: Response) => {
  try {
    const existingRow = await prisma.qualFmeaRow.findFirst({
      where: { id: req.params.rowId, fmeaId: req.params.id },
    });
    if (!existingRow) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA row not found' } });
    }

    await prisma.qualFmeaRow.delete({ where: { id: req.params.rowId } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete FMEA row error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete FMEA row' } });
  }
});

// POST /:id/rows/reorder — Bulk update sortOrder
router.post('/:id/rows/reorder', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      rows: z.array(z.object({
        id: z.string(),
        sortOrder: z.number(),
      })),
    });

    const { rows } = schema.parse(req.body);

    await Promise.all(
      rows.map(row =>
        prisma.qualFmeaRow.update({
          where: { id: row.id },
          data: { sortOrder: row.sortOrder },
        })
      )
    );

    const updatedFmea = await prisma.qualFmea.findUnique({
      where: { id: req.params.id },
      include: { rows: { orderBy: { sortOrder: 'asc' } } },
    });

    res.json({ success: true, data: updatedFmea });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Reorder FMEA rows error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reorder FMEA rows' } });
  }
});

export default router;
