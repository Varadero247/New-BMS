import { Router, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-quality');

const router = Router();

router.use(authenticate);
router.param('id', validateIdParam());

// Generate reference number
async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-ISS';
  const count = await prisma.qualIssue.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List issues
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', bias, priority, status, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.QualIssueWhereInput = { deletedAt: null };
    if (bias) where.bias = bias;
    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (search) {
      where.issueOfConcern = { contains: search as string, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.qualIssue.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          party: { select: { id: true, partyName: true, partyType: true, referenceNumber: true } },
        },
      }),
      prisma.qualIssue.count({ where }),
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
    logger.error('List issues error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list issues' } });
  }
});

// GET /:id - Get single issue
router.get('/:id', checkOwnership(prisma.qualIssue), async (req: AuthRequest, res: Response) => {
  try {
    const issue = await prisma.qualIssue.findUnique({
      where: { id: req.params.id },
      include: {
        party: true,
      },
    });

    if (!issue) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Issue not found' } });
    }

    res.json({ success: true, data: issue });
  } catch (error) {
    logger.error('Get issue error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get issue' } });
  }
});

// POST / - Create issue
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      partyId: z.string().optional(),
      issueOfConcern: z.string().min(1),
      bias: z.enum(['RISK', 'OPPORTUNITY', 'MIXED']),
      processesAffected: z.string().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
      treatmentMethod: z.string().min(1),
      recordReference: z.string().optional(),
      status: z.enum(['OPEN', 'UNDER_REVIEW', 'TREATED', 'MONITORED', 'CLOSED']).default('OPEN'),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    // Validate partyId if provided
    if (data.partyId) {
      const party = await prisma.qualInterestedParty.findUnique({ where: { id: data.partyId } });
      if (!party) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Referenced interested party not found' } });
      }
    }

    const issue = await prisma.qualIssue.create({
      data: {
        ...data,
        referenceNumber,
      },
      include: {
        party: true,
      },
    });

    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create issue error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create issue' } });
  }
});

// PUT /:id - Update issue
router.put('/:id', checkOwnership(prisma.qualIssue), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualIssue.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Issue not found' } });
    }

    const schema = z.object({
      partyId: z.string().nullable().optional(),
      issueOfConcern: z.string().min(1).optional(),
      bias: z.enum(['RISK', 'OPPORTUNITY', 'MIXED']).optional(),
      processesAffected: z.string().nullable().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      treatmentMethod: z.string().min(1).optional(),
      recordReference: z.string().nullable().optional(),
      status: z.enum(['OPEN', 'UNDER_REVIEW', 'TREATED', 'MONITORED', 'CLOSED']).optional(),
      notes: z.string().nullable().optional(),
    });

    const data = schema.parse(req.body);

    // Validate partyId if provided
    if (data.partyId) {
      const party = await prisma.qualInterestedParty.findUnique({ where: { id: data.partyId } });
      if (!party) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Referenced interested party not found' } });
      }
    }

    const issue = await prisma.qualIssue.update({
      where: { id: req.params.id },
      data,
      include: {
        party: true,
      },
    });

    res.json({ success: true, data: issue });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update issue error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update issue' } });
  }
});

// DELETE /:id - Delete issue
router.delete('/:id', checkOwnership(prisma.qualIssue), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualIssue.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Issue not found' } });
    }

    await prisma.qualIssue.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete issue error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete issue' } });
  }
});

export default router;
