import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();

router.use(authenticate);

// Generate FMEA number
function generateFMEANumber(type: string): string {
  const prefix = type === 'DFMEA' ? 'DF' : type === 'PFMEA' ? 'PF' : 'FM';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${year}-${random}`;
}

// GET /api/fmea - List FMEAs
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, fmeaType } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (fmeaType) where.fmeaType = fmeaType;

    const [fmeas, total] = await Promise.all([
      prisma.fMEARecord.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { actions: true } },
        },
      }),
      prisma.fMEARecord.count({ where }),
    ]);

    res.json({
      success: true,
      data: fmeas,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List FMEAs error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list FMEAs' } });
  }
});

// GET /api/fmea/:id - Get single FMEA
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const fmea = await prisma.fMEARecord.findUnique({
      where: { id: req.params.id },
      include: {
        actions: { orderBy: { originalRPN: 'desc' } },
      },
    });

    if (!fmea) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA not found' } });
    }

    res.json({ success: true, data: fmea });
  } catch (error) {
    console.error('Get FMEA error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get FMEA' } });
  }
});

// POST /api/fmea - Create FMEA
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      fmeaType: z.enum(['DFMEA', 'PFMEA', 'SFMEA', 'MFMEA']),
      product: z.string().optional(),
      process: z.string().optional(),
      subsystem: z.string().optional(),
      function: z.string().optional(),
      teamLeaderId: z.string().optional(),
      teamMembers: z.array(z.string()).default([]),
      startDate: z.string().optional(),
      targetDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const fmea = await prisma.fMEARecord.create({
      data: {
        ...data,
        fmeaNumber: generateFMEANumber(data.fmeaType),
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        status: 'IN_PROGRESS',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: fmea });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create FMEA error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create FMEA' } });
  }
});

// PATCH /api/fmea/:id - Update FMEA
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.fMEARecord.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      product: z.string().optional(),
      process: z.string().optional(),
      subsystem: z.string().optional(),
      function: z.string().optional(),
      teamLeaderId: z.string().optional(),
      teamMembers: z.array(z.string()).optional(),
      targetDate: z.string().optional(),
      status: z.enum(['DRAFT', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'IMPLEMENTED', 'CLOSED']).optional(),
      revision: z.number().optional(),
      revisionNotes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const fmea = await prisma.fMEARecord.update({
      where: { id: req.params.id },
      data: {
        ...data,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        completedDate: data.status === 'CLOSED' ? new Date() : undefined,
        revisionDate: data.revision ? new Date() : undefined,
      },
    });

    res.json({ success: true, data: fmea });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update FMEA error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update FMEA' } });
  }
});

// POST /api/fmea/:id/actions - Add failure mode/action
router.post('/:id/actions', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      itemFunction: z.string().min(1),
      potentialFailureMode: z.string().min(1),
      potentialEffects: z.string().min(1),
      potentialCauses: z.string().min(1),
      currentControls: z.string().optional(),
      currentDetection: z.string().optional(),
      originalSeverity: z.number().min(1).max(10),
      originalOccurrence: z.number().min(1).max(10),
      originalDetection: z.number().min(1).max(10),
      classification: z.enum(['CRITICAL', 'SIGNIFICANT', 'MODERATE', 'MINOR']).optional(),
      recommendedAction: z.string().optional(),
      responsibleParty: z.string().optional(),
      targetDate: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const originalRPN = data.originalSeverity * data.originalOccurrence * data.originalDetection;

    const action = await prisma.fMEAAction.create({
      data: {
        ...data,
        fmeaId: req.params.id,
        originalRPN,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        status: 'OPEN',
        createdById: req.user!.id,
      },
    });

    // Update FMEA statistics
    await updateFMEAStats(req.params.id);

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add FMEA action error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add FMEA action' } });
  }
});

// PATCH /api/fmea/:id/actions/:actionId - Update action (complete with new RPN)
router.patch('/:id/actions/:actionId', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      actionTaken: z.string().optional(),
      newSeverity: z.number().min(1).max(10).optional(),
      newOccurrence: z.number().min(1).max(10).optional(),
      newDetection: z.number().min(1).max(10).optional(),
      status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'CANCELLED']).optional(),
    });

    const data = schema.parse(req.body);

    // Calculate new RPN if all values provided
    let newRPN: number | undefined;
    if (data.newSeverity && data.newOccurrence && data.newDetection) {
      newRPN = data.newSeverity * data.newOccurrence * data.newDetection;
    }

    const action = await prisma.fMEAAction.update({
      where: { id: req.params.actionId },
      data: {
        ...data,
        newRPN,
        completedDate: data.status === 'COMPLETED' || data.status === 'VERIFIED' ? new Date() : undefined,
      },
    });

    // Update FMEA statistics
    await updateFMEAStats(req.params.id);

    res.json({ success: true, data: action });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update FMEA action error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update FMEA action' } });
  }
});

// Helper to update FMEA stats
async function updateFMEAStats(fmeaId: string): Promise<void> {
  const actions = await prisma.fMEAAction.findMany({ where: { fmeaId } });

  const stats = {
    totalFailureModes: actions.length,
    highRPNCount: actions.filter(a => a.originalRPN >= 100).length, // RPN >= 100 is typically high
    actionsPending: actions.filter(a => a.status === 'OPEN' || a.status === 'IN_PROGRESS').length,
  };

  await prisma.fMEARecord.update({
    where: { id: fmeaId },
    data: stats,
  });
}

// DELETE /api/fmea/:id - Delete FMEA
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.fMEARecord.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FMEA not found' } });
    }

    await prisma.fMEARecord.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'FMEA deleted successfully' } });
  } catch (error) {
    console.error('Delete FMEA error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete FMEA' } });
  }
});

export default router;
