import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-iso37001');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateReference(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AB-INV-${yy}${mm}-${rand}`;
}

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

const investigationCreateSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  allegationType: z.enum([
    'BRIBERY',
    'CORRUPTION',
    'FACILITATION_PAYMENT',
    'KICKBACK',
    'GIFT_VIOLATION',
    'CONFLICT_OF_INTEREST',
    'FRAUD',
    'MONEY_LAUNDERING',
    'EMBEZZLEMENT',
    'WHISTLEBLOWER_REPORT',
    'POLICY_VIOLATION',
    'OTHER',
  ]),
  reportedBy: z.string().min(1).max(200),
  reportedDate: z.string().min(1),
  anonymous: z.boolean().default(false),
  department: z.string().max(200).optional(),
  location: z.string().max(300).optional(),
  involvedParties: z.string().max(2000).optional(),
  estimatedValue: z.number().optional(),
  currency: z.string().length(3).default('USD'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  notes: z.string().max(5000).optional(),
});

const investigationUpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  allegationType: z.enum([
    'BRIBERY',
    'CORRUPTION',
    'FACILITATION_PAYMENT',
    'KICKBACK',
    'GIFT_VIOLATION',
    'CONFLICT_OF_INTEREST',
    'FRAUD',
    'MONEY_LAUNDERING',
    'EMBEZZLEMENT',
    'WHISTLEBLOWER_REPORT',
    'POLICY_VIOLATION',
    'OTHER',
  ]).optional(),
  department: z.string().max(200).optional(),
  location: z.string().max(300).optional(),
  involvedParties: z.string().max(2000).optional(),
  estimatedValue: z.number().optional(),
  currency: z.string().length(3).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  notes: z.string().max(5000).optional(),
});

const investigateSchema = z.object({
  investigatorId: z.string().max(100).optional(),
  investigatorName: z.string().max(200).optional(),
  investigationNotes: z.string().max(5000).optional(),
});

const closeSchema = z.object({
  outcome: z.enum([
    'SUBSTANTIATED',
    'UNSUBSTANTIATED',
    'INCONCLUSIVE',
    'PARTIALLY_SUBSTANTIATED',
    'REFERRED_TO_AUTHORITIES',
    'DISMISSED',
  ]),
  findings: z.string().min(1).max(5000),
  actions: z.string().max(5000).optional(),
  lessonsLearned: z.string().max(2000).optional(),
  disciplinaryAction: z.string().max(2000).optional(),
  reportedToAuthorities: z.boolean().default(false),
  authorityDetails: z.string().max(1000).optional(),
});

// ---------------------------------------------------------------------------
// Reserved paths for /:id routes
// ---------------------------------------------------------------------------

const RESERVED_PATHS = new Set(['health', 'stats', 'export']);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET / — List investigations
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, outcome, allegationType, priority, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (outcome && typeof outcome === 'string') {
      where.outcome = outcome;
    }
    if (allegationType && typeof allegationType === 'string') {
      where.allegationType = allegationType;
    }
    if (priority && typeof priority === 'string') {
      where.priority = priority;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { reportedBy: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [investigations, total] = await Promise.all([
      prisma.abInvestigation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.abInvestigation.count({ where }),
    ]);

    res.json({
      success: true,
      data: investigations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list investigations', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to list investigations' });
  }
});

// POST / — Create investigation
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = investigationCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const userId = (req as AuthRequest).user?.id || 'system';
    const referenceNumber = generateReference();

    const investigation = await prisma.abInvestigation.create({
      data: {
        ...parsed.data,
        referenceNumber,
        status: 'REPORTED',
        createdBy: userId,
        updatedBy: userId,
      },
    });

    logger.info('Investigation created', { id: investigation.id, referenceNumber });
    res.status(201).json({ success: true, data: investigation });
  } catch (error: unknown) {
    logger.error('Failed to create investigation', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to create investigation' });
  }
});

// GET /:id — Get by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');

    const investigation = await prisma.abInvestigation.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!investigation) {
      return res.status(404).json({ success: false, error: 'Investigation not found' });
    }

    res.json({ success: true, data: investigation });
  } catch (error: unknown) {
    logger.error('Failed to get investigation', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to get investigation' });
  }
});

// PUT /:id — Update
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');

    const parsed = investigationUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const existing = await prisma.abInvestigation.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Investigation not found' });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    const investigation = await prisma.abInvestigation.update({
      where: { id: req.params.id },
      data: {
        ...parsed.data,
        updatedBy: userId,
      },
    });

    logger.info('Investigation updated', { id: investigation.id });
    res.json({ success: true, data: investigation });
  } catch (error: unknown) {
    logger.error('Failed to update investigation', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to update investigation' });
  }
});

// PUT /:id/investigate — Start investigation
router.put('/:id/investigate', async (req: Request, res: Response) => {
  try {
    const parsed = investigateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const existing = await prisma.abInvestigation.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Investigation not found' });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    const investigation = await prisma.abInvestigation.update({
      where: { id: req.params.id },
      data: {
        status: 'UNDER_INVESTIGATION',
        investigatorId: parsed.data.investigatorId,
        investigatorName: parsed.data.investigatorName,
        investigationNotes: parsed.data.investigationNotes,
        investigationStartDate: new Date(),
        updatedBy: userId,
      },
    });

    logger.info('Investigation started', { id: investigation.id });
    res.json({ success: true, data: investigation });
  } catch (error: unknown) {
    logger.error('Failed to start investigation', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to start investigation' });
  }
});

// PUT /:id/close — Close with outcome, findings, actions
router.put('/:id/close', async (req: Request, res: Response) => {
  try {
    const parsed = closeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const existing = await prisma.abInvestigation.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Investigation not found' });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    const investigation = await prisma.abInvestigation.update({
      where: { id: req.params.id },
      data: {
        status: 'CLOSED',
        outcome: parsed.data.outcome,
        findings: parsed.data.findings,
        actions: parsed.data.actions,
        lessonsLearned: parsed.data.lessonsLearned,
        disciplinaryAction: parsed.data.disciplinaryAction,
        reportedToAuthorities: parsed.data.reportedToAuthorities,
        authorityDetails: parsed.data.authorityDetails,
        closedAt: new Date(),
        closedBy: userId,
        updatedBy: userId,
      },
    });

    logger.info('Investigation closed', { id: investigation.id, outcome: parsed.data.outcome });
    res.json({ success: true, data: investigation });
  } catch (error: unknown) {
    logger.error('Failed to close investigation', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to close investigation' });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.abInvestigation.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Investigation not found' });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    await prisma.abInvestigation.update({
      where: { id: req.params.id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });

    logger.info('Investigation deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Investigation deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete investigation', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to delete investigation' });
  }
});

export default router;
