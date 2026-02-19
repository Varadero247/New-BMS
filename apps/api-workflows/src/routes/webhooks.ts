import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';
import crypto from 'crypto';

const logger = createLogger('api-workflows-webhooks');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Supported webhook event types
const WEBHOOK_EVENT_TYPES = [
  'incident.created',
  'capa.overdue',
  'audit.completed',
  'nonconformance.created',
  'document.approved',
  'risk.high_rating',
  'objective.overdue',
] as const;

const webhookEventTypeEnum = z.enum(WEBHOOK_EVENT_TYPES);

// ============================================
// POST /api/webhooks — Register webhook endpoint
// ============================================
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().trim().min(1).max(255),
      url: z.string().trim().url(),
      events: z.array(webhookEventTypeEnum).min(1),
      headers: z.record(z.string().trim()).optional(),
      retryCount: z.number().int().min(0).max(10).optional(),
      timeout: z.number().int().min(1000).max(30000).optional(),
    });

    const data = schema.parse(req.body);

    // Generate HMAC secret
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.webhook.create({
      data: {
        name: data.name,
        url: data.url,
        secret,
        events: data.events,
        headers: data.headers || undefined,
        retryCount: data.retryCount ?? 3,
        timeout: data.timeout ?? 5000,
        createdBy: req.user!.id,
      },
    });

    logger.info('Webhook created', {
      webhookId: webhook.id,
      name: webhook.name,
      events: webhook.events,
    });

    res.status(201).json({ success: true, data: webhook });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating webhook', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create webhook' },
    });
  }
});

// ============================================
// GET /api/webhooks — List webhooks (paginated)
// ============================================
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (req.query.isActive !== undefined) {
      where.isActive = req.query.isActive === 'true';
    }

    if (req.query.event) {
      where.events = { has: req.query.event as string };
    }

    const [webhooks, total] = await Promise.all([
      prisma.webhook.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.webhook.count({ where }),
    ]);

    res.json({
      success: true,
      data: webhooks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Error listing webhooks', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list webhooks' },
    });
  }
});

// ============================================
// GET /api/webhooks/:id — Get webhook with recent deliveries
// ============================================
router.get('/:id', checkOwnership(prisma.webhook), async (req: AuthRequest, res: Response) => {
  try {
    const webhook = await prisma.webhook.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: {
        deliveries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!webhook) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Webhook not found' } });
    }

    res.json({ success: true, data: webhook });
  } catch (error) {
    logger.error('Error fetching webhook', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch webhook' },
    });
  }
});

// ============================================
// PUT /api/webhooks/:id — Update webhook
// ============================================
router.put('/:id', checkOwnership(prisma.webhook), async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().trim().min(1).max(255).optional(),
      url: z.string().trim().url().optional(),
      events: z.array(webhookEventTypeEnum).min(1).optional(),
      isActive: z.boolean().optional(),
      headers: z.record(z.string().trim()).optional(),
      retryCount: z.number().int().min(0).max(10).optional(),
      timeout: z.number().int().min(1000).max(30000).optional(),
    });

    const data = schema.parse(req.body);

    const existing = await prisma.webhook.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Webhook not found' } });
    }

    const webhook = await prisma.webhook.update({
      where: { id: req.params.id },
      data,
    });

    logger.info('Webhook updated', { webhookId: webhook.id });

    res.json({ success: true, data: webhook });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating webhook', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update webhook' },
    });
  }
});

// ============================================
// DELETE /api/webhooks/:id — Soft-delete webhook
// ============================================
router.delete('/:id', checkOwnership(prisma.webhook), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.webhook.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Webhook not found' } });
    }

    await prisma.webhook.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    logger.info('Webhook soft-deleted', { webhookId: req.params.id });

    res.json({ success: true, data: { message: 'Webhook deleted successfully' } });
  } catch (error) {
    logger.error('Error deleting webhook', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete webhook' },
    });
  }
});

// ============================================
// POST /api/webhooks/:id/test — Send test delivery
// ============================================
router.post(
  '/:id/test',
  checkOwnership(prisma.webhook),
  async (req: AuthRequest, res: Response) => {
    try {
      const webhook = await prisma.webhook.findFirst({
        where: { id: req.params.id, deletedAt: null },
      });

      if (!webhook) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Webhook not found' } });
      }

      const testPayload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: {
          message: 'This is a test webhook delivery',
          webhookId: webhook.id,
          webhookName: webhook.name,
        },
      };

      // Generate HMAC signature
      const payloadString = JSON.stringify(testPayload);
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(payloadString)
        .digest('hex');

      // Build request headers
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': webhook.id,
        'X-Webhook-Event': 'test',
      };

      // Merge custom headers
      if (webhook.headers && typeof webhook.headers === 'object') {
        Object.assign(requestHeaders, webhook.headers);
      }

      let statusCode: number | null = null;
      let responseBody: string | null = null;
      let success = false;
      let lastError: string | null = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), webhook.timeout);

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: requestHeaders,
          body: payloadString,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        statusCode = response.status;
        responseBody = await response.text().catch(() => null);
        success = response.ok;
      } catch (fetchError: unknown) {
        lastError = fetchError instanceof Error ? fetchError.message : 'Unknown delivery error';
        logger.warn('Test webhook delivery failed', { webhookId: webhook.id, error: lastError });
      }

      // Record delivery
      const delivery = await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event: 'test',
          payload: testPayload,
          statusCode,
          response: responseBody,
          success,
          attempts: 1,
          lastError,
          deliveredAt: success ? new Date() : undefined,
        },
      });

      logger.info('Test webhook delivery sent', {
        webhookId: webhook.id,
        deliveryId: delivery.id,
        success,
      });

      res.json({ success: true, data: delivery });
    } catch (error) {
      logger.error('Error sending test webhook', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to send test webhook' },
      });
    }
  }
);

// ============================================
// GET /api/webhooks/:id/deliveries — List deliveries for a webhook
// ============================================
router.get(
  '/:id/deliveries',
  checkOwnership(prisma.webhook),
  async (req: AuthRequest, res: Response) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = { webhookId: req.params.id };

      if (req.query.event) {
        where.event = req.query.event as string;
      }

      if (req.query.success !== undefined) {
        where.success = req.query.success === 'true';
      }

      const [deliveries, total] = await Promise.all([
        prisma.webhookDelivery.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.webhookDelivery.count({ where }),
      ]);

      res.json({
        success: true,
        data: deliveries,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      logger.error('Error listing deliveries', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to list deliveries' },
      });
    }
  }
);

// ============================================
// POST /api/webhooks/dispatch — Internal: dispatch event to all subscribed webhooks
// ============================================
router.post('/dispatch', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      event: webhookEventTypeEnum,
      data: z.record(z.unknown()),
    });

    const input = schema.parse(req.body);

    // Find all active webhooks subscribed to this event
    const webhooks = await prisma.webhook.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        events: { has: input.event },
      },
      take: 1000,
    });

    if (webhooks.length === 0) {
      return res.json({ success: true, data: { dispatched: 0, deliveries: [] } });
    }

    const payload = {
      event: input.event,
      timestamp: new Date().toISOString(),
      data: input.data,
    };

    const deliveries = [];

    for (const webhook of webhooks) {
      const payloadString = JSON.stringify(payload);

      // Generate HMAC signature
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(payloadString)
        .digest('hex');

      // Build request headers
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': webhook.id,
        'X-Webhook-Event': input.event,
      };

      if (webhook.headers && typeof webhook.headers === 'object') {
        Object.assign(requestHeaders, webhook.headers);
      }

      let statusCode: number | null = null;
      let responseBody: string | null = null;
      let success = false;
      let lastError: string | null = null;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), webhook.timeout);

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: requestHeaders,
          body: payloadString,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        statusCode = response.status;
        responseBody = await response.text().catch(() => null);
        success = response.ok;
      } catch (fetchError: unknown) {
        lastError = fetchError instanceof Error ? fetchError.message : 'Unknown delivery error';
        logger.warn('Webhook delivery failed', {
          webhookId: webhook.id,
          event: input.event,
          error: lastError,
        });
      }

      // Create delivery record
      const delivery = await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event: input.event,
          payload: payload as Prisma.InputJsonValue,
          statusCode,
          response: responseBody,
          success,
          attempts: 1,
          lastError,
          deliveredAt: success ? new Date() : undefined,
        },
      });

      deliveries.push(delivery);
    }

    logger.info('Webhook event dispatched', {
      event: input.event,
      totalWebhooks: webhooks.length,
      successful: deliveries.filter((d) => d.success).length,
      failed: deliveries.filter((d) => !d.success).length,
    });

    res.json({
      success: true,
      data: {
        dispatched: webhooks.length,
        deliveries,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error dispatching webhook event', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to dispatch webhook event' },
    });
  }
});

export default router;
