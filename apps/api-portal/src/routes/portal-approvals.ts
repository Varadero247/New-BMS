import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-portal');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const approvalCreateSchema = z.object({
  type: z.enum(['DOCUMENT', 'ORDER', 'CHANGE_REQUEST', 'QUALITY']),
  referenceId: z.string().min(1),
  notes: z.string().max(5000).optional().nullable(),
});

const decisionSchema = z.object({
  notes: z.string().max(5000).optional().nullable(),
});

// ---------------------------------------------------------------------------
// GET / — List approvals
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20);
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (type) where.type = type;

    const [items, total] = await Promise.all([
      prisma.portalApproval.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.portalApproval.count({ where }),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing approvals', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list approvals' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create approval request
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = approvalCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const data = parsed.data;

    const approval = await prisma.portalApproval.create({
      data: {
        type: data.type,
        referenceId: data.referenceId,
        requestedBy: auth.user!.id,
        status: 'PENDING',
        notes: data.notes ?? null,
        createdBy: auth.user!.id,
      },
    });

    logger.info('Approval request created', { id: approval.id, type: data.type });
    return res.status(201).json({ success: true, data: approval });
  } catch (error: unknown) {
    logger.error('Error creating approval', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create approval' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/approve — Approve
// ---------------------------------------------------------------------------

router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = decisionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const existing = await prisma.portalApproval.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Approval not found' } });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Approval is not pending' } });
    }

    const updated = await prisma.portalApproval.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedBy: auth.user!.id,
        decidedAt: new Date(),
        notes: parsed.data.notes ?? existing.notes,
      },
    });

    logger.info('Approval approved', { id: updated.id });
    return res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Error approving', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/reject — Reject
// ---------------------------------------------------------------------------

router.put('/:id/reject', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = decisionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const existing = await prisma.portalApproval.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Approval not found' } });
    }

    if (existing.status !== 'PENDING') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Approval is not pending' } });
    }

    const updated = await prisma.portalApproval.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        approvedBy: auth.user!.id,
        decidedAt: new Date(),
        notes: parsed.data.notes ?? existing.notes,
      },
    });

    logger.info('Approval rejected', { id: updated.id });
    return res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Error rejecting', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to reject' } });
  }
});

export default router;
