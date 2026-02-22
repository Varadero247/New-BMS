import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-health-safety');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ISO 45001:2018 Clause 8.1.3 — Management of Change

const changeSchema = z.object({
  title: z.string().trim().min(1),
  changeType: z.enum(['PROCESS', 'EQUIPMENT', 'MATERIAL', 'PERSONNEL', 'LEGAL', 'ORGANIZATIONAL', 'OTHER']),
  description: z.string().trim().min(1),
  rationale: z.string().trim().min(1),
  proposedDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  affectedActivities: z.array(z.string()).min(1),
  affectedPersonnel: z.array(z.string()).optional(),
  ohsRisksIdentified: z.string().trim().optional(),
  riskControls: z.string().trim().optional(),
  requestedBy: z.string().trim().min(1),
  reviewedBy: z.string().trim().optional(),
});

async function generateChangeRef(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.hSChangeRequest.count();
  return `MOC-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - list change requests
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, changeType } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (changeType) where.changeType = changeType;
    const [changes, total] = await Promise.all([
      prisma.hSChangeRequest.findMany({ where, skip, take: limit, orderBy: { proposedDate: 'desc' } }),
      prisma.hSChangeRequest.count({ where }),
    ]);
    res.json({ success: true, data: changes, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list change requests', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list change requests' } });
  }
});

// POST / - create change request
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = changeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const referenceNumber = await generateChangeRef();
    const change = await prisma.hSChangeRequest.create({
      data: {
        id: uuidv4(), referenceNumber, ...parsed.data,
        proposedDate: new Date(parsed.data.proposedDate),
        status: 'DRAFT',
      },
    });
    logger.info('Change request created', { referenceNumber });
    res.status(201).json({ success: true, data: change });
  } catch (error: unknown) {
    logger.error('Failed to create change request', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create change request' } });
  }
});

// GET /dashboard
router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const [total, draft, pending, approved, implemented, rejected] = await Promise.all([
      prisma.hSChangeRequest.count({ where: { deletedAt: null } }),
      prisma.hSChangeRequest.count({ where: { deletedAt: null, status: 'DRAFT' } }),
      prisma.hSChangeRequest.count({ where: { deletedAt: null, status: 'PENDING_REVIEW' } }),
      prisma.hSChangeRequest.count({ where: { deletedAt: null, status: 'APPROVED' } }),
      prisma.hSChangeRequest.count({ where: { deletedAt: null, status: 'IMPLEMENTED' } }),
      prisma.hSChangeRequest.count({ where: { deletedAt: null, status: 'REJECTED' } }),
    ]);
    res.json({ success: true, data: { total, draft, pendingReview: pending, approved, implemented, rejected } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get dashboard' } });
  }
});

// GET /:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const change = await prisma.hSChangeRequest.findUnique({ where: { id: req.params.id } });
    if (!change || change.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }
    res.json({ success: true, data: change });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get change request' } });
  }
});

// PUT /:id - update
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hSChangeRequest.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }
    const updateSchema = changeSchema.partial().extend({
      status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED', 'CLOSED']).optional(),
      actualImplementedDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
      closedAt: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
      approvedBy: z.string().trim().optional(),
    });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const { actualImplementedDate, closedAt, proposedDate, ...rest } = parsed.data;
    const updated = await prisma.hSChangeRequest.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(proposedDate ? { proposedDate: new Date(proposedDate) } : {}),
        ...(actualImplementedDate ? { actualImplementedDate: new Date(actualImplementedDate) } : {}),
        ...(closedAt ? { closedAt: new Date(closedAt) } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update change request' } });
  }
});

// PUT /:id/approve
router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hSChangeRequest.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }
    const schema = z.object({ approvedBy: z.string().trim().min(1), approvalNotes: z.string().trim().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'approvedBy is required' } });
    }
    const updated = await prisma.hSChangeRequest.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED', approvedBy: parsed.data.approvedBy, approvedAt: new Date() },
    });
    logger.info('Change request approved', { id: req.params.id, approvedBy: parsed.data.approvedBy });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve change request' } });
  }
});

// PUT /:id/implement
router.put('/:id/implement', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hSChangeRequest.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }
    const updated = await prisma.hSChangeRequest.update({
      where: { id: req.params.id },
      data: { status: 'IMPLEMENTED', actualImplementedDate: new Date() },
    });
    logger.info('Change request implemented', { id: req.params.id });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to mark implemented' } });
  }
});

// DELETE /:id - soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.hSChangeRequest.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }
    await prisma.hSChangeRequest.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Change request deleted' } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete change request' } });
  }
});

export default router;
