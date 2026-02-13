import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { v4 as uuidv4 } from 'uuid';

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

const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  role: z.enum(['CUSTOMER_ADMIN', 'CUSTOMER_USER', 'SUPPLIER_ADMIN', 'SUPPLIER_USER']),
  portalType: z.enum(['CUSTOMER', 'SUPPLIER']),
  phone: z.string().max(50).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']).default('PENDING'),
});

const userUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  company: z.string().min(1).max(200).optional(),
  role: z.enum(['CUSTOMER_ADMIN', 'CUSTOMER_USER', 'SUPPLIER_ADMIN', 'SUPPLIER_USER']).optional(),
  phone: z.string().max(50).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']).optional(),
});

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  role: z.enum(['CUSTOMER_ADMIN', 'CUSTOMER_USER', 'SUPPLIER_ADMIN', 'SUPPLIER_USER']),
  portalType: z.enum(['CUSTOMER', 'SUPPLIER']),
});

// ---------------------------------------------------------------------------
// GET / — List portal users
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20);
    const skip = (page - 1) * limit;
    const portalType = req.query.portalType as string | undefined;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const where: any = { deletedAt: null };
    if (portalType) where.portalType = portalType;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.portalUser.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.portalUser.count({ where }),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    logger.error('Error listing portal users', { error: error.message });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list users' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create portal user
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = userCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const data = parsed.data;

    const existing = await prisma.portalUser.findFirst({
      where: { email: data.email, deletedAt: null },
    });
    if (existing) {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Email already registered' } });
    }

    const user = await prisma.portalUser.create({
      data: {
        email: data.email,
        name: data.name,
        company: data.company,
        role: data.role,
        portalType: data.portalType,
        status: data.status,
        phone: data.phone ?? null,
        passwordHash: 'pending-setup',
        createdBy: auth.user!.id,
      },
    });

    logger.info('Portal user created', { id: user.id, email: user.email });
    return res.status(201).json({ success: true, data: user });
  } catch (error: any) {
    logger.error('Error creating portal user', { error: error.message });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create user' } });
  }
});

// ---------------------------------------------------------------------------
// POST /invite — Send invitation
// ---------------------------------------------------------------------------

const RESERVED_PATHS = new Set(['invite']);

router.post('/invite', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const data = parsed.data;
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.portalInvitation.create({
      data: {
        email: data.email,
        name: data.name,
        company: data.company,
        role: data.role,
        portalType: data.portalType,
        token,
        expiresAt,
        invitedBy: auth.user!.id,
        createdBy: auth.user!.id,
      },
    });

    logger.info('Portal invitation sent', { id: invitation.id, email: invitation.email });
    return res.status(201).json({ success: true, data: invitation });
  } catch (error: any) {
    logger.error('Error sending invitation', { error: error.message });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to send invitation' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get user detail
// ---------------------------------------------------------------------------

router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');

    const user = await prisma.portalUser.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    return res.json({ success: true, data: user });
  } catch (error: any) {
    logger.error('Error fetching user', { error: error.message });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update user
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = userUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const existing = await prisma.portalUser.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    const updated = await prisma.portalUser.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    logger.info('Portal user updated', { id: updated.id });
    return res.json({ success: true, data: updated });
  } catch (error: any) {
    logger.error('Error updating user', { error: error.message });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update user' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft-delete (deactivate) user
// ---------------------------------------------------------------------------

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.portalUser.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    const deactivated = await prisma.portalUser.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });

    logger.info('Portal user deactivated', { id: deactivated.id });
    return res.json({ success: true, data: { id: deactivated.id, status: 'INACTIVE' } });
  } catch (error: any) {
    logger.error('Error deactivating user', { error: error.message });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to deactivate user' } });
  }
});

export default router;
