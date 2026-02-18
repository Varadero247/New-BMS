import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';

const logger = createLogger('api-marketing:leads');
const router = Router();
router.param('id', validateIdParam());

const captureSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1).max(200),
  company: z.string().trim().optional(),
  jobTitle: z.string().trim().optional(),
  source: z.enum([
    'ROI_CALCULATOR',
    'CHATBOT',
    'LANDING_PAGE',
    'PARTNER_REFERRAL',
    'ORGANIC_SEARCH',
    'PAID_ADS',
    'DIRECT',
    'LINKEDIN',
  ]),
  industry: z.string().trim().optional(),
  employeeCount: z.string().trim().optional(),
  isoCount: z.number().int().optional(),
  roiEstimate: z.number().optional(),
});

// POST /api/leads/capture (public)
router.post('/capture', async (req: Request, res: Response) => {
  try {
    const parsed = captureSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const lead = await prisma.mktLead.create({
      data: parsed.data,
    });

    res.status(201).json({ success: true, data: { captured: true } });
  } catch (error) {
    logger.error('Lead capture failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to capture lead' },
    });
  }
});

// GET /api/leads
router.get('/', async (req: Request, res: Response) => {
  try {
    const { source, page = '1', limit = '25' } = req.query;
    const skip =
      (Math.max(1, parseInt(page as string, 10) || 1) - 1) *
      Math.max(1, parseInt(limit as string, 10) || 20);

    const where: Record<string, unknown> = {};
    if (source) where.source = source;

    const [leads, total] = await Promise.all([
      prisma.mktLead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100),
      }),
      prisma.mktLead.count({ where }),
    ]);

    res.json({
      success: true,
      data: { leads, total, page: Math.max(1, parseInt(page as string, 10) || 1) },
    });
  } catch (error) {
    logger.error('Failed to fetch leads', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch leads' },
    });
  }
});

// GET /api/leads/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const lead = await prisma.mktLead.findUnique({
      where: { id: req.params.id },
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Lead not found' },
      });
    }

    res.json({ success: true, data: lead });
  } catch (error) {
    logger.error('Failed to fetch lead', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch lead' },
    });
  }
});

export default router;
