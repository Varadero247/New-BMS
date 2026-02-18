import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import {
  NotificationBellState,
  WSNotification,
  WSNotificationType,
  WSNotificationSeverity,
} from '@ims/notifications';
import { validateIdParam } from '@ims/shared';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const logger = createLogger('api-gateway:notifications');
const router = Router();
router.param('id', validateIdParam());

// Shared in-memory notification bell state
export const bellState = new NotificationBellState();

// ============================================
// GET /api/notifications — list user's notifications (paginated)
// ============================================
router.get('/', authenticate, (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

    const result = bellState.getAll(user!.id, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    logger.error('Failed to list notifications', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list notifications' },
    });
  }
});

// ============================================
// GET /api/notifications/unread — get unread count
// ============================================
router.get('/unread', authenticate, (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const count = bellState.getUnreadCount(user!.id);

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error: unknown) {
    logger.error('Failed to get unread count', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get unread count' },
    });
  }
});

// ============================================
// PUT /api/notifications/read-all — mark all as read
// ============================================
router.put('/read-all', authenticate, (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const count = bellState.markAllRead(user!.id);

    res.json({
      success: true,
      data: { markedCount: count },
    });
  } catch (error: unknown) {
    logger.error('Failed to mark all as read', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to mark all as read' },
    });
  }
});

// ============================================
// PUT /api/notifications/:id/read — mark single notification as read
// ============================================
router.put('/:id/read', authenticate, (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const notificationId = req.params.id;

    if (!notificationId || notificationId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Notification ID is required' },
      });
    }

    const marked = bellState.markRead(user!.id, notificationId);

    if (!marked) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Notification not found' },
      });
    }

    res.json({
      success: true,
      data: { id: notificationId, read: true },
    });
  } catch (error: unknown) {
    logger.error('Failed to mark notification as read', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to mark notification as read' },
    });
  }
});

// ============================================
// POST /api/notifications/test — send a test notification (admin only)
// ============================================
const testNotificationSchema = z.object({
  title: z.string({ required_error: 'title is required' }).trim().min(1, 'title is required'),
  message: z.string({ required_error: 'message is required' }).trim().min(1, 'message is required'),
  type: z
    .enum(['ALERT', 'WARNING', 'INFO', 'SUCCESS', 'OVERDUE', 'DUE_SOON', 'ESCALATION'])
    .default('INFO'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('LOW'),
  module: z.string().optional(),
  targetUserId: z.string().optional(),
});

router.post('/test', authenticate, (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const roles: string[] = (user as any).roles || [(user as any).role] || [];

    // Admin only
    if (
      !roles.includes('SUPER_ADMIN') &&
      !roles.includes('ORG_ADMIN') &&
      !roles.includes('ADMIN')
    ) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin role required to send test notifications' },
      });
    }

    const parsed = testNotificationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { title, message, type, severity, module, targetUserId } = parsed.data;

    const recipientId = targetUserId || user!.id;

    const notification: WSNotification = {
      id: uuidv4(),
      type,
      title: title.trim(),
      message: message.trim(),
      module: module ?? 'system',
      severity,
      userId: recipientId,
      orgId: (user as any).organisationId,
      createdAt: new Date(),
      read: false,
      data: { testNotification: true, sentBy: user!.id },
    };

    bellState.addNotification(recipientId, notification);

    logger.info('Test notification sent', {
      notificationId: notification.id,
      recipientId,
      sentBy: user!.id,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error: unknown) {
    logger.error('Failed to send test notification', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to send test notification' },
    });
  }
});

export default router;
