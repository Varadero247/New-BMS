import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-iso37001');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `AB-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const giftCreateSchema = z.object({
  description: z.string().trim().min(1).max(500),
  giftType: z.enum([
    'GIFT',
    'HOSPITALITY',
    'ENTERTAINMENT',
    'TRAVEL',
    'DONATION',
    'SPONSORSHIP',
    'FACILITATION_PAYMENT',
    'OTHER',
  ]),
  direction: z.enum(['GIVEN', 'RECEIVED']),
  value: z.number().min(0),
  currency: z.string().length(3).default('USD'),
  recipientOrGiver: z.string().trim().min(1).max(300),
  date: z.string().trim().min(1).max(200),
  organization: z.string().max(300).optional(),
  position: z.string().max(200).optional(),
  governmentOfficial: z.boolean().default(false),
  reason: z.string().max(2000).optional(),
  employeeId: z.string().max(100).optional(),
  employeeName: z.string().max(200).optional(),
  department: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

const giftUpdateSchema = z.object({
  description: z.string().trim().min(1).max(500).optional(),
  giftType: z
    .enum([
      'GIFT',
      'HOSPITALITY',
      'ENTERTAINMENT',
      'TRAVEL',
      'DONATION',
      'SPONSORSHIP',
      'FACILITATION_PAYMENT',
      'OTHER',
    ])
    .optional(),
  direction: z.enum(['GIVEN', 'RECEIVED']).optional(),
  value: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  recipientOrGiver: z.string().trim().min(1).max(300).optional(),
  date: z.string().optional(),
  organization: z.string().max(300).optional(),
  position: z.string().max(200).optional(),
  governmentOfficial: z.boolean().optional(),
  reason: z.string().max(2000).optional(),
  employeeId: z.string().max(100).optional(),
  employeeName: z.string().max(200).optional(),
  department: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

// ---------------------------------------------------------------------------
// Reserved paths for /:id routes
// ---------------------------------------------------------------------------

const RESERVED_PATHS = new Set(['health', 'stats', 'export']);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET / — List gifts/hospitality
router.get('/', async (req: Request, res: Response) => {
  try {
    const { giftType, direction, status, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (giftType && typeof giftType === 'string') {
      where.giftType = giftType;
    }
    if (direction && typeof direction === 'string') {
      where.direction = direction;
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { recipientOrGiver: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [gifts, total] = await Promise.all([
      (prisma as any).abGift.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      (prisma as any).abGift.count({ where }),
    ]);

    res.json({
      success: true,
      data: gifts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list gifts', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list gifts' } });
  }
});

// POST / — Create gift/hospitality record
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = giftCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const userId = (req as AuthRequest).user?.id || 'system';
    const referenceNumber = generateReference('GFT');

    const { value, ...rest } = parsed.data;

    const gift = await (prisma as any).abGift.create({
      data: {
        ...rest,
        value: new Prisma.Decimal(value),
        referenceNumber,
        status: 'PENDING',
        createdBy: userId,
        updatedBy: userId,
      },
    });

    logger.info('Gift record created', { id: gift.id, referenceNumber });
    res.status(201).json({ success: true, data: gift });
  } catch (error: unknown) {
    logger.error('Failed to create gift record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create gift record' },
    });
  }
});

// GET /:id — Get by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');

    const gift = await (prisma as any).abGift.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!gift) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Gift record not found' } });
    }

    res.json({ success: true, data: gift });
  } catch (error: unknown) {
    logger.error('Failed to get gift record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get gift record' },
    });
  }
});

// PUT /:id — Update
router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');

    const parsed = giftUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const existing = await (prisma as any).abGift.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Gift record not found' } });
    }

    const userId = (req as AuthRequest).user?.id || 'system';
    const { value, ...rest } = parsed.data;

    const updateData: Record<string, unknown> = {
      ...rest,
      updatedBy: userId,
    };

    if (value !== undefined) {
      updateData.value = new Prisma.Decimal(value);
    }

    const gift = await (prisma as any).abGift.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logger.info('Gift record updated', { id: gift.id });
    res.json({ success: true, data: gift });
  } catch (error: unknown) {
    logger.error('Failed to update gift record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update gift record' },
    });
  }
});

// PUT /:id/approve — Approve gift
router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).abGift.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Gift record not found' } });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    const gift = await (prisma as any).abGift.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedBy: userId,
        approvedAt: new Date(),
        updatedBy: userId,
      },
    });

    logger.info('Gift record approved', { id: gift.id });
    res.json({ success: true, data: gift });
  } catch (error: unknown) {
    logger.error('Failed to approve gift record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to approve gift record' },
    });
  }
});

// PUT /:id/decline — Decline gift
router.put('/:id/decline', async (req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).abGift.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Gift record not found' } });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    const gift = await (prisma as any).abGift.update({
      where: { id: req.params.id },
      data: {
        status: 'DECLINED',
        declinedBy: userId,
        declinedAt: new Date(),
        updatedBy: userId,
      },
    });

    logger.info('Gift record declined', { id: gift.id });
    res.json({ success: true, data: gift });
  } catch (error: unknown) {
    logger.error('Failed to decline gift record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to decline gift record' },
    });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).abGift.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Gift record not found' } });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    await (prisma as any).abGift.update({
      where: { id: req.params.id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });

    logger.info('Gift record deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Gift record deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete gift record', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete gift record' },
    });
  }
});

export default router;
