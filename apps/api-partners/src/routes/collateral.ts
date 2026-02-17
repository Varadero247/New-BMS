import { Router, Request, Response } from 'express';
import { createLogger } from '@ims/monitoring';
import { portalPrisma } from '../prisma-portal';
import { prisma } from '../prisma';

const logger = createLogger('api-partners:collateral');
const router = Router();

const TIER_HIERARCHY: Record<string, string[]> = {
  REFERRAL: ['ALL'],
  CO_SELL: ['ALL', 'CO_SELL'],
  RESELLER: ['ALL', 'CO_SELL', 'RESELLER'],
  GCC_SPECIALIST: ['ALL', 'CO_SELL', 'RESELLER', 'GCC_SPECIALIST'],
};

// GET /api/collateral — list accessible collateral
router.get('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as AuthRequest).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    // Get partner's tier to determine access
    const partner = await prisma.mktPartner.findUnique({
      where: { id: partnerId },
      select: { tier: true },
    });

    const allowedTiers = TIER_HIERARCHY[partner?.tier || 'REFERRAL'] || ['ALL'];
    const { type } = req.query;

    const where: Record<string, unknown> = { accessTier: { in: allowedTiers } };
    if (type) where.type = type;

    const collateral = await portalPrisma.mktPartnerCollateral.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: collateral });
  } catch (error) {
    logger.error('Failed to list collateral', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list collateral' },
    });
  }
});

// GET /api/collateral/:id/download — track & return download URL
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as AuthRequest).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const partner = await prisma.mktPartner.findUnique({
      where: { id: partnerId },
      select: { tier: true },
    });

    const allowedTiers = TIER_HIERARCHY[partner?.tier || 'REFERRAL'] || ['ALL'];

    const item = await portalPrisma.mktPartnerCollateral.findUnique({
      where: { id: req.params.id },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Collateral not found' },
      });
    }

    if (!allowedTiers.includes(item.accessTier)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Your tier does not have access to this item' },
      });
    }

    // Increment download count
    await portalPrisma.mktPartnerCollateral.update({
      where: { id: req.params.id },
      data: { downloadCount: { increment: 1 } },
    });

    res.json({ success: true, data: { fileUrl: item.fileUrl } });
  } catch (error) {
    logger.error('Failed to download collateral', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to download collateral' },
    });
  }
});

export default router;
