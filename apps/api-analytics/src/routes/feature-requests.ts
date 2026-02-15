import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('feature-requests');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// GET /aggregate — top 10 by votes, count by status (MUST be before /:id)
// ---------------------------------------------------------------------------
router.get('/aggregate', async (_req: Request, res: Response) => {
  try {
    const [topByVotes, countByStatus] = await Promise.all([
      prisma.featureRequest.findMany({
        orderBy: { votes: 'desc' },
        take: 10,
      }),
      prisma.featureRequest.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const group of countByStatus) {
      statusCounts[group.status] = group._count.id;
    }

    res.json({ success: true, data: { topByVotes, statusCounts } });
  } catch (err) {
    logger.error('Failed to aggregate feature requests', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to aggregate feature requests' } });
  }
});

// ---------------------------------------------------------------------------
// GET / — list feature requests with pagination, filter by status, sort by votes desc
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const where = status ? { status } : {};

    const [items, total] = await Promise.all([
      prisma.featureRequest.findMany({
        where,
        orderBy: { votes: 'desc' },
        skip,
        take: limit,
      }),
      prisma.featureRequest.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        featureRequests: items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    logger.error('Failed to list feature requests', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list feature requests' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — get single feature request
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const featureRequest = await prisma.featureRequest.findUnique({ where: { id } });
    if (!featureRequest) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Feature request not found' } });
    }
    res.json({ success: true, data: { featureRequest } });
  } catch (err) {
    logger.error('Failed to get feature request', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get feature request' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — create feature request
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, requestedBy } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Title is required' } });
    }

    const featureRequest = await prisma.featureRequest.create({
      data: {
        title,
        description: description || '',
        requestedBy: requestedBy || 'anonymous',
        status: 'SUBMITTED',
        priority: 0,
        votes: 0,
      },
    });

    logger.info('Feature request created', { id: featureRequest.id, title });
    res.status(201).json({ success: true, data: { featureRequest } });
  } catch (err) {
    logger.error('Failed to create feature request', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create feature request' } });
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id — update status, priority
// ---------------------------------------------------------------------------
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const existing = await prisma.featureRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Feature request not found' } });
    }

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (priority !== undefined) updateData.priority = typeof priority === 'string' ? parseInt(priority, 10) : priority;

    const featureRequest = await prisma.featureRequest.update({
      where: { id },
      data: updateData,
    });

    logger.info('Feature request updated', { id, status, priority });
    res.json({ success: true, data: { featureRequest } });
  } catch (err) {
    logger.error('Failed to update feature request', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update feature request' } });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/vote — increment votes
// ---------------------------------------------------------------------------
router.post('/:id/vote', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.featureRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Feature request not found' } });
    }

    const featureRequest = await prisma.featureRequest.update({
      where: { id },
      data: { votes: (existing.votes || 0) + 1 },
    });

    logger.info('Feature request voted', { id, newVotes: featureRequest.votes });
    res.json({ success: true, data: { featureRequest } });
  } catch (err) {
    logger.error('Failed to vote on feature request', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to vote' } });
  }
});

export default router;
