import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { PartnerRequest } from '../middleware/partner-auth';

const logger = createLogger('api-partners:marketplace');
const router = Router();

// GET /api/marketplace - List marketplace listings
router.get('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id;
    if (!partnerId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });

    const { category, status } = req.query;
    const where: Record<string, unknown> = { status: status || 'ACTIVE' };
    if (category) where.type = category;

    const listings = await prisma.mktPartnerDeal.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({ success: true, data: listings });
  } catch (error) {
    logger.error('Error fetching marketplace', { error: String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch marketplace' } });
  }
});

// GET /api/marketplace/:id - Get listing
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id;
    if (!partnerId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });

    const listing = await prisma.mktPartnerDeal.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } });

    res.json({ success: true, data: listing });
  } catch (error) {
    logger.error('Error fetching listing', { error: String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch listing' } });
  }
});

// POST /api/marketplace - Create listing
router.post('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id;
    if (!partnerId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });

    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().min(1).max(2000),
      category: z.enum(['INTEGRATION', 'SERVICE', 'TEMPLATE', 'ADDON', 'PLUGIN']),
      price: z.number().nonnegative().default(0),
      currency: z.string().length(3).default('USD'),
    });

    const data = schema.parse(req.body);

    const listing = await prisma.mktPartnerDeal.create({
      data: {
        partnerId,
        title: data.title,
        description: data.description,
        stage: 'DISCOVERY',
        dealValue: data.price,
        currency: data.currency,
        expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      } as any,
    });

    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating listing', { error: String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create listing' } });
  }
});

// PATCH /api/marketplace/:id - Update listing
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id;
    if (!partnerId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });

    const schema = z.object({
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().optional(),
      price: z.number().nonnegative().optional(),
    });

    const data = schema.parse(req.body);

    const listing = await prisma.mktPartnerDeal.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found' } });
    if ((listing as any).partnerId !== partnerId) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot edit another partner listing' } });

    const updated = await prisma.mktPartnerDeal.update({
      where: { id: req.params.id },
      data: { title: data.title, description: data.description, dealValue: data.price } as any,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating listing', { error: String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update listing' } });
  }
});

export default router;
