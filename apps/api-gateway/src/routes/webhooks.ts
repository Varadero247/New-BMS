import { Router, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import {
  createEndpoint,
  listEndpoints,
  getEndpoint,
  deleteEndpoint,
  updateEndpoint,
  dispatch,
  listDeliveries,
  WEBHOOK_EVENTS,
} from '@ims/webhooks';

const logger = createLogger('api-gateway:webhooks');
const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Validation Schemas ─────────────────────────────────────────────────────

const createEndpointSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  url: z.string().trim().url('Must be a valid URL'),
  events: z.array(z.string().trim().min(1).max(200)).min(1, 'At least one event is required'),
  headers: z.record(z.string().trim()).optional(),
});

const updateEndpointSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  url: z.string().trim().url().optional(),
  events: z.array(z.string().trim().min(1).max(200)).min(1).optional(),
  enabled: z.boolean().optional(),
  headers: z.record(z.string().trim()).optional(),
});

// ─── Routes ─────────────────────────────────────────────────────────────────

// GET /api/admin/webhooks — List all webhook endpoints
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const orgId = (req.user as any)?.orgId || 'default';
    const endpoints = listEndpoints(orgId);

    // Strip secrets from response
    const safe = endpoints.map((ep) => ({
      ...ep,
      secret: ep.secret.substring(0, 10) + '...',
    }));

    return res.json({
      success: true,
      data: safe,
    });
  } catch (error) {
    logger.error('Failed to list webhooks', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list webhooks' },
    });
  }
});

// GET /api/admin/webhooks/events — List available webhook events
router.get('/events', (_req: AuthRequest, res: Response) => {
  return res.json({
    success: true,
    data: WEBHOOK_EVENTS,
  });
});

// POST /api/admin/webhooks — Create a new webhook endpoint
router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const parsed = createEndpointSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const orgId = (req.user as any)?.orgId || 'default';
    const endpoint = createEndpoint({
      orgId,
      ...parsed.data,
    });

    logger.info('Created webhook endpoint', {
      orgId,
      endpointId: endpoint.id,
      name: endpoint.name,
    });

    // Return full secret only on creation
    return res.status(201).json({
      success: true,
      data: endpoint,
    });
  } catch (error) {
    logger.error('Failed to create webhook endpoint', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create webhook' },
    });
  }
});

// PATCH /api/admin/webhooks/:id — Update a webhook endpoint
router.patch('/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = getEndpoint(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Webhook endpoint not found' },
      });
    }

    const orgId = (req.user as any)?.orgId || 'default';
    if (existing.orgId !== orgId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to modify this endpoint' },
      });
    }

    const parsed = updateEndpointSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const updated = updateEndpoint(id, parsed.data);
    logger.info('Updated webhook endpoint', { orgId, endpointId: id });

    return res.json({
      success: true,
      data: { ...updated!, secret: updated!.secret.substring(0, 10) + '...' },
    });
  } catch (error) {
    logger.error('Failed to update webhook endpoint', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update webhook' },
    });
  }
});

// DELETE /api/admin/webhooks/:id — Delete a webhook endpoint
router.delete('/:id', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = getEndpoint(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Webhook endpoint not found' },
      });
    }

    const orgId = (req.user as any)?.orgId || 'default';
    if (existing.orgId !== orgId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to delete this endpoint' },
      });
    }

    deleteEndpoint(id);
    logger.info('Deleted webhook endpoint', { orgId, endpointId: id });

    return res.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    logger.error('Failed to delete webhook endpoint', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete webhook' },
    });
  }
});

// POST /api/admin/webhooks/:id/test — Send a test ping event
router.post('/:id/test', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existing = getEndpoint(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Webhook endpoint not found' },
      });
    }

    const orgId = (req.user as any)?.orgId || 'default';
    if (existing.orgId !== orgId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to test this endpoint' },
      });
    }

    const deliveries = dispatch('ping.test', orgId, {
      message: 'This is a test webhook delivery',
      timestamp: new Date().toISOString(),
      endpointId: id,
    });

    logger.info('Sent test webhook', { orgId, endpointId: id });

    return res.json({
      success: true,
      data: deliveries[0] || { status: 'no_matching_endpoint' },
    });
  } catch (error) {
    logger.error('Failed to send test webhook', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to send test webhook' },
    });
  }
});

// GET /api/admin/webhooks/:id/deliveries — List deliveries for endpoint
router.get('/:id/deliveries', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

    const existing = getEndpoint(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Webhook endpoint not found' },
      });
    }

    const orgId = (req.user as any)?.orgId || 'default';
    if (existing.orgId !== orgId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to view this endpoint' },
      });
    }

    const deliveries = listDeliveries(id, limit);

    return res.json({
      success: true,
      data: deliveries,
    });
  } catch (error) {
    logger.error('Failed to list deliveries', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list deliveries' },
    });
  }
});

export default router;
