import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma, Prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const createCompetitorSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  website: z.string().trim().nullable().optional(),
  category: z.string().trim().optional(),
});

const updateCompetitorSchema = createCompetitorSchema.partial();

const createIntelSchema = z.object({
  type: z.string().trim().min(1, 'Type is required'),
  detail: z.string().trim().min(1, 'Detail is required'),
});

const logger = createLogger('competitors');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// GET / — List competitors with pagination
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const [competitors, total] = await Promise.all([
      prisma.competitorMonitor.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.competitorMonitor.count(),
    ]);

    res.json({
      success: true,
      data: {
        competitors,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    logger.error('Failed to list competitors', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list competitors' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get single competitor with intel entries
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const competitor = await prisma.competitorMonitor.findUnique({
      where: { id: req.params.id },
    });

    if (!competitor) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Competitor not found' } });
    }

    res.json({ success: true, data: competitor });
  } catch (err) {
    logger.error('Failed to get competitor', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get competitor' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create competitor
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createCompetitorSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { name, website, category } = parsed.data;

    const competitor = await prisma.competitorMonitor.create({
      data: {
        name,
        website: website || null,
        category: category || 'GENERAL',
        intel: [],
        lastCheckedAt: new Date(),
      },
    });

    logger.info('Competitor created', { id: competitor.id, name });
    res.status(201).json({ success: true, data: competitor });
  } catch (err) {
    logger.error('Failed to create competitor', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create competitor' },
    });
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id — Update competitor
// ---------------------------------------------------------------------------
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.competitorMonitor.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Competitor not found' } });
    }

    const parsed = updateCompetitorSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { name, website, category } = parsed.data;
    const competitor = await prisma.competitorMonitor.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(website !== undefined && { website }),
        ...(category !== undefined && { category }),
      },
    });

    logger.info('Competitor updated', { id: competitor.id });
    res.json({ success: true, data: competitor });
  } catch (err) {
    logger.error('Failed to update competitor', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update competitor' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/intel — Add intel entry
// ---------------------------------------------------------------------------
router.post('/:id/intel', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.competitorMonitor.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Competitor not found' } });
    }

    const parsed = createIntelSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { type, detail } = parsed.data;

    const currentIntel = (existing.intel as Array<Record<string, unknown>>) || [];
    const newEntry = { date: new Date().toISOString(), type, detail };
    const updatedIntel = [...currentIntel, newEntry];

    const competitor = await prisma.competitorMonitor.update({
      where: { id: req.params.id },
      data: { intel: updatedIntel as Prisma.InputJsonValue },
    });

    logger.info('Intel added to competitor', { id: competitor.id, type });
    res.status(201).json({ success: true, data: competitor });
  } catch (err) {
    logger.error('Failed to add intel', { error: String(err) });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add intel' } });
  }
});

export default router;
