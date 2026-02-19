import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const logger = createLogger('api-partners:profile');
const router = Router();

const updateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  company: z.string().trim().min(1).max(200).optional(),
  phone: z.string().trim().optional(),
  isoSpecialisms: z.array(z.string().trim()).optional(),
});

// GET /api/profile
router.get('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as any).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const partner = await prisma.mktPartner.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        phone: true,
        tier: true,
        isoSpecialisms: true,
        referralCode: true,
        referralUrl: true,
        status: true,
        createdAt: true,
      },
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Partner not found' },
      });
    }

    res.json({ success: true, data: partner });
  } catch (error) {
    logger.error('Failed to fetch profile', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch profile' },
    });
  }
});

// PUT /api/profile
router.put('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as any).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const partner = await prisma.mktPartner.update({
      where: { id: partnerId },
      data: parsed.data,
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        phone: true,
        tier: true,
        isoSpecialisms: true,
        referralCode: true,
        referralUrl: true,
        status: true,
      },
    });

    res.json({ success: true, data: partner });
  } catch (error) {
    logger.error('Failed to update profile', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' },
    });
  }
});

export default router;
