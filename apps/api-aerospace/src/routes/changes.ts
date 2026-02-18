import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-aerospace');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// Reference Number Generator
// ============================================

async function generateChangeRequestRefNumber(): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const count = await prisma.aeroChangeRequest.count({
    where: { refNumber: { startsWith: `AERO-CR-${yyyy}` } },
  });
  return `AERO-CR-${yyyy}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// Zod Schemas
// ============================================

const createChangeRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  changeType: z.enum(['DESIGN', 'PROCESS', 'MATERIAL', 'SUPPLIER', 'DOCUMENT', 'SOFTWARE', 'TOOLING', 'OTHER']),
  priority: z.enum(['EMERGENCY', 'HIGH', 'MEDIUM', 'LOW']).optional().default('MEDIUM'),
  reason: z.string().min(1, 'Reason is required'),
  affectedDocuments: z.array(z.string()).optional().default([]),
  affectedProcesses: z.array(z.string()).optional().default([]),
  affectedParts: z.array(z.string()).optional().default([]),
  customerImpact: z.boolean().optional().default(false),
  regulatoryImpact: z.boolean().optional().default(false),
  safetyImpact: z.boolean().optional().default(false),
  costEstimate: z.number().optional(),
  proposedBy: z.string().optional(),
  requestedDate: z.string().optional(),
  notes: z.string().optional(),
});

const updateChangeRequestSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().optional(),
  changeType: z.enum(['DESIGN', 'PROCESS', 'MATERIAL', 'SUPPLIER', 'DOCUMENT', 'SOFTWARE', 'TOOLING', 'OTHER']).optional(),
  priority: z.enum(['EMERGENCY', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  reason: z.string().optional(),
  affectedDocuments: z.array(z.string()).optional(),
  affectedProcesses: z.array(z.string()).optional(),
  affectedParts: z.array(z.string()).optional(),
  customerImpact: z.boolean().optional(),
  regulatoryImpact: z.boolean().optional(),
  safetyImpact: z.boolean().optional(),
  costEstimate: z.number().optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTING', 'IMPLEMENTED', 'VERIFIED', 'CLOSED', 'CANCELLED']).optional(),
  notes: z.string().optional(),
});

const reviewChangeRequestSchema = z.object({
  decision: z.enum(['APPROVE', 'REJECT', 'DEFER', 'REQUEST_MORE_INFO']),
  reviewNotes: z.string().optional(),
  reviewedBy: z.string().optional(),
  conditions: z.string().optional(),
});

const implementChangeRequestSchema = z.object({
  implementationNotes: z.string().optional(),
  implementedBy: z.string().optional(),
  verificationRequired: z.boolean().optional().default(true),
});

// ============================================
// CHANGE REQUESTS — CRUD
// ============================================

// GET / - List change requests
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, changeType, priority, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status as any;
    if (changeType) where.changeType = changeType as any;
    if (priority) where.priority = priority as any;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { reason: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [changeRequests, total] = await Promise.all([
      prisma.aeroChangeRequest.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.aeroChangeRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: changeRequests,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List change requests error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list change requests' } });
  }
});

// GET /:id - Get change request
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const changeRequest = await prisma.aeroChangeRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!changeRequest || changeRequest.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }

    res.json({ success: true, data: changeRequest });
  } catch (error) {
    logger.error('Get change request error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get change request' } });
  }
});

// POST / - Create change request
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createChangeRequestSchema.parse(req.body);
    const refNumber = await generateChangeRequestRefNumber();

    const changeRequest = await prisma.aeroChangeRequest.create({
      data: {
        refNumber,
        title: data.title,
        description: data.description,
        changeType: data.changeType,
        priority: data.priority,
        reason: data.reason,
        affectedDocuments: data.affectedDocuments,
        affectedProcesses: data.affectedProcesses,
        affectedParts: data.affectedParts,
        customerImpact: data.customerImpact,
        regulatoryImpact: data.regulatoryImpact,
        safetyImpact: data.safetyImpact,
        costEstimate: data.costEstimate,
        proposedBy: data.proposedBy || req.user?.id,
        requestedDate: data.requestedDate ? new Date(data.requestedDate) : new Date(),
        status: 'DRAFT',
        notes: data.notes,
        createdBy: req.user?.id,
      } as any,
    });

    res.status(201).json({ success: true, data: changeRequest });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create change request error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create change request' } });
  }
});

// PUT /:id - Update change request
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroChangeRequest.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }

    const data = updateChangeRequestSchema.parse(req.body);

    const changeRequest = await prisma.aeroChangeRequest.update({
      where: { id: req.params.id },
      data: data as any,
    });

    res.json({ success: true, data: changeRequest });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update change request error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update change request' } });
  }
});

// DELETE /:id - Soft delete change request
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroChangeRequest.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }

    await prisma.aeroChangeRequest.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete change request error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete change request' } });
  }
});

// ============================================
// CHANGE MANAGEMENT WORKFLOW
// ============================================

// PUT /:id/submit - Submit for review
router.put('/:id/submit', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroChangeRequest.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }

    const changeRequest = await prisma.aeroChangeRequest.update({
      where: { id: req.params.id },
      data: { status: 'SUBMITTED', submittedDate: new Date(), submittedBy: req.user?.id },
    });

    res.json({ success: true, data: changeRequest });
  } catch (error) {
    logger.error('Submit change request error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit change request' } });
  }
});

// PUT /:id/review - Review decision
router.put('/:id/review', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroChangeRequest.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }

    const data = reviewChangeRequestSchema.parse(req.body);

    let newStatus: string;
    switch (data.decision) {
      case 'APPROVE': newStatus = 'APPROVED'; break;
      case 'REJECT': newStatus = 'REJECTED'; break;
      case 'DEFER': newStatus = 'UNDER_REVIEW'; break;
      case 'REQUEST_MORE_INFO': newStatus = 'UNDER_REVIEW'; break;
      default: newStatus = existing.status;
    }

    const changeRequest = await prisma.aeroChangeRequest.update({
      where: { id: req.params.id },
      data: {
        status: newStatus,
        reviewDecision: data.decision,
        reviewNotes: data.reviewNotes,
        reviewedBy: data.reviewedBy || req.user?.id,
        reviewedDate: new Date(),
        conditions: data.conditions,
      } as any,
    });

    res.json({ success: true, data: changeRequest });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Review change request error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to review change request' } });
  }
});

// PUT /:id/implement - Mark as implemented
router.put('/:id/implement', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroChangeRequest.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Change request not found' } });
    }

    const data = implementChangeRequestSchema.parse(req.body);

    const changeRequest = await prisma.aeroChangeRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'IMPLEMENTED',
        implementationNotes: data.implementationNotes,
        implementedBy: data.implementedBy || req.user?.id,
        implementedDate: new Date(),
        verificationRequired: data.verificationRequired,
      },
    });

    res.json({ success: true, data: changeRequest });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Implement change request error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to mark change request as implemented' } });
  }
});

export default router;
