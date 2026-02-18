import { Router, Request, Response } from 'express';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('complaints-public');

const submitSchema = z.object({
  orgId: z.string().trim().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  complainantName: z.string().optional(),
  complainantEmail: z.string().trim().email('Invalid email').optional(),
  complainantPhone: z.string().optional(),
  category: z
    .enum([
      'PRODUCT',
      'SERVICE',
      'DELIVERY',
      'BILLING',
      'SAFETY',
      'ENVIRONMENTAL',
      'REGULATORY',
      'OTHER',
    ])
    .optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  productRef: z.string().optional(),
  orderRef: z.string().optional(),
});

router.post('/submit', async (req: Request, res: Response) => {
  try {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const year = new Date().getFullYear();
    const count = await prisma.compComplaint.count({
      where: { referenceNumber: { startsWith: `CMP-${year}` } },
    });
    const referenceNumber = `CMP-${year}-${String(count + 1).padStart(4, '0')}`;
    const {
      orgId,
      title,
      description,
      complainantName,
      complainantEmail,
      complainantPhone,
      category,
      priority,
      productRef,
      orderRef,
    } = parsed.data;
    const data = await prisma.compComplaint.create({
      data: {
        orgId: orgId || 'default',
        title,
        description,
        complainantName,
        complainantEmail,
        complainantPhone,
        category,
        priority,
        productRef,
        orderRef,
        referenceNumber,
        channel: 'WEB_FORM',
      },
    });
    res.status(201).json({ success: true, data: { referenceNumber: data.referenceNumber } });
  } catch (error: unknown) {
    logger.error('Public submit failed', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to submit complaint' },
    });
  }
});
export default router;
