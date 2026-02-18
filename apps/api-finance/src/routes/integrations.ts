import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-finance');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Validation schemas
const createIntegrationSchema = z.object({
  provider: z.enum(['XERO', 'QUICKBOOKS', 'SAGE', 'STRIPE', 'PAYPAL', 'BANK_FEED', 'CUSTOM']),
  name: z.string().trim().min(1).max(200),
  direction: z.enum(['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL']).default('BIDIRECTIONAL'),
  config: z.record(z.any()).optional(),
});

// GET /api/integrations - List integrations
router.get('/', async (req: Request, res: Response) => {
  try {
    const integrations = await prisma.finIntegration.findMany({
      include: {
        _count: { select: { syncLogs: true } },
        syncLogs: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: integrations });
  } catch (error: unknown) {
    logger.error('Error listing integrations', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list integrations' } });
  }
});

// GET /api/integrations/:id - Get integration details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const integration = await prisma.finIntegration.findUnique({
      where: { id: req.params.id },
      include: {
        syncLogs: {
          orderBy: { startedAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!integration) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Integration not found' } });
    }

    res.json({ success: true, data: integration });
  } catch (error: unknown) {
    logger.error('Error getting integration', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get integration' } });
  }
});

// POST /api/integrations - Create integration
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createIntegrationSchema.parse(req.body);
    const user = (req as AuthRequest).user;

    const integration = await prisma.finIntegration.create({
      data: {
        ...data,
        createdBy: user!.id,
      },
    });

    res.status(201).json({ success: true, data: integration });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Error creating integration', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create integration' } });
  }
});

// PUT /api/integrations/:id - Update integration
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const data = createIntegrationSchema.partial().parse(req.body);

    const existing = await prisma.finIntegration.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Integration not found' } });
    }

    const integration = await prisma.finIntegration.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: integration });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    logger.error('Error updating integration', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update integration' } });
  }
});

// POST /api/integrations/:id/activate - Activate integration
router.post('/:id/activate', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.finIntegration.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Integration not found' } });
    }

    const integration = await prisma.finIntegration.update({
      where: { id: req.params.id },
      data: { isActive: true },
    });

    res.json({ success: true, data: integration });
  } catch (error: unknown) {
    logger.error('Error activating integration', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to activate integration' } });
  }
});

// POST /api/integrations/:id/deactivate - Deactivate integration
router.post('/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.finIntegration.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Integration not found' } });
    }

    const integration = await prisma.finIntegration.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });

    res.json({ success: true, data: integration });
  } catch (error: unknown) {
    logger.error('Error deactivating integration', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to deactivate integration' } });
  }
});

// POST /api/integrations/:id/sync - Trigger sync (stub)
router.post('/:id/sync', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.finIntegration.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Integration not found' } });
    }

    if (!existing.isActive) {
      return res.status(400).json({ success: false, error: { code: 'INACTIVE', message: 'Integration is not active' } });
    }

    // Create sync log entry in PENDING state; actual sync executes via background queue
    const syncLog = await prisma.finSyncLog.create({
      data: {
        integrationId: req.params.id,
        direction: existing.direction,
        status: 'PENDING',
      },
    });

    await prisma.finIntegration.update({
      where: { id: req.params.id },
      data: { lastSyncAt: new Date() },
    });

    // Return 202 Accepted — sync job is queued, not yet completed
    res.status(202).json({
      success: true,
      data: {
        message: 'Sync job accepted and queued',
        syncLogId: syncLog.id,
        status: 'PENDING',
        estimatedCompletionSeconds: 30,
      },
    });
  } catch (error: unknown) {
    logger.error('Error triggering sync', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to trigger sync' } });
  }
});

// GET /api/integrations/:id/logs - Get sync logs
router.get('/:id/logs', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      prisma.finSyncLog.findMany({
        where: { integrationId: req.params.id },
        orderBy: { startedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.finSyncLog.count({ where: { integrationId: req.params.id } }),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: unknown) {
    logger.error('Error listing sync logs', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list sync logs' } });
  }
});

export default router;
