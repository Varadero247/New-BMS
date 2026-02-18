import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-portal');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const registerSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1).max(200),
  company: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(50).optional().nullable(),
});

// ---------------------------------------------------------------------------
// POST / — Submit supplier registration
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
      });
    }

    const data = parsed.data;

    const existing = await prisma.portalUser.findFirst({
      where: { email: data.email, deletedAt: null } as any,
    });

    if (existing) {
      return res
        .status(409)
        .json({ success: false, error: { code: 'CONFLICT', message: 'Email already registered' } });
    }

    const user = await prisma.portalUser.create({
      data: {
        email: data.email,
        name: data.name,
        company: data.company,
        phone: data.phone ?? null,
        role: 'SUPPLIER_USER',
        portalType: 'SUPPLIER',
        status: 'PENDING',
        passwordHash: 'pending-setup',
        createdBy: auth.user!.id,
      },
    });

    logger.info('Supplier registration submitted', { id: user.id, email: user.email });
    return res
      .status(201)
      .json({ success: true, data: { id: user.id, email: user.email, status: user.status } });
  } catch (error: unknown) {
    logger.error('Error registering supplier', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to register supplier' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /status — Approval status
// ---------------------------------------------------------------------------

router.get('/status', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const user = await prisma.portalUser.findFirst({
      where: { id: auth.user!.id, deletedAt: null } as any,
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        company: user.company,
        status: user.status,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: unknown) {
    logger.error('Error fetching registration status', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch status' },
    });
  }
});

export default router;
