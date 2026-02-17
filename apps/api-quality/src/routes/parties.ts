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
  const prefix = 'QMS-PTY';
  const count = await prisma.qualInterestedParty.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List interested parties
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', partyType, status, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.QualInterestedPartyWhereInput = { deletedAt: null };
    if (partyType) where.partyType = partyType;
    if (status) where.status = status;
    if (search) {
      where.partyName = { contains: search as string, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.qualInterestedParty.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { issues: true } },
        },
      }),
      prisma.qualInterestedParty.count({ where }),
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
    logger.error('List parties error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list interested parties' } });
  }
});

// GET /:id - Get single interested party
router.get('/:id', checkOwnership(prisma.qualInterestedParty), async (req: AuthRequest, res: Response) => {
  try {
    const party = await prisma.qualInterestedParty.findUnique({
      where: { id: req.params.id },
      include: {
        issues: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!party) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Interested party not found' } });
    }

    res.json({ success: true, data: party });
  } catch (error) {
    logger.error('Get party error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get interested party' } });
  }
});

// POST / - Create interested party
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      partyName: z.string().min(1),
      partyType: z.enum(['INTERNAL', 'EXTERNAL']),
      reasonForInclusion: z.string().min(1),
      needsExpectations: z.string().optional(),
      communicationMethod: z.string().optional(),
      reviewFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'BI_ANNUALLY', 'ON_CHANGE']).default('ANNUALLY'),
      status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const party = await prisma.qualInterestedParty.create({
      data: {
        ...data,
        referenceNumber,
      },
    });

    res.status(201).json({ success: true, data: party });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create party error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create interested party' } });
  }
});

// PUT /:id - Update interested party
router.put('/:id', checkOwnership(prisma.qualInterestedParty), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualInterestedParty.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Interested party not found' } });
    }

    const schema = z.object({
      partyName: z.string().min(1).optional(),
      partyType: z.enum(['INTERNAL', 'EXTERNAL']).optional(),
      reasonForInclusion: z.string().min(1).optional(),
      needsExpectations: z.string().nullable().optional(),
      communicationMethod: z.string().nullable().optional(),
      reviewFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'BI_ANNUALLY', 'ON_CHANGE']).optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
      notes: z.string().nullable().optional(),
    });

    const data = schema.parse(req.body);

    const party = await prisma.qualInterestedParty.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: party });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update party error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update interested party' } });
  }
});

// DELETE /:id - Delete interested party
router.delete('/:id', checkOwnership(prisma.qualInterestedParty), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualInterestedParty.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Interested party not found' } });
    }

    await prisma.qualInterestedParty.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete party error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete interested party' } });
  }
});

export default router;
