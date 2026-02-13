import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { NotificationBellState, WSNotification, WSNotificationType, WSNotificationSeverity } from '@ims/notifications';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('api-gateway:notifications');
const router = Router();

// Shared in-memory notification bell state
export const bellState = new NotificationBellState();

// ============================================
// GET /api/notifications — list user's notifications (paginated)
// ============================================
router.get('/', authenticate, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

    const result = bellState.getAll(user.id, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Failed to list notifications', { error: error.message });
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
    const user = (req as any).user;
    const count = bellState.getUnreadCount(user.id);

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error: any) {
    logger.error('Failed to get unread count', { error: error.message });
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
    const user = (req as any).user;
    const count = bellState.markAllRead(user.id);

    res.json({
      success: true,
      data: { markedCount: count },
    });
  } catch (error: any) {
    logger.error('Failed to mark all as read', { error: error.message });
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
    const user = (req as any).user;
    const notificationId = req.params.id;

    if (!notificationId || notificationId.trim() === '') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Notification ID is required' },
      });
    }

    const marked = bellState.markRead(user.id, notificationId);

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
  } catch (error: any) {
    logger.error('Failed to mark notification as read', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to mark notification as read' },
    });
  }
});

// ============================================
// POST /api/notifications/test — send a test notification (admin only)
// ============================================
const VALID_TYPES: WSNotificationType[] = ['ALERT', 'WARNING', 'INFO', 'SUCCESS', 'OVERDUE', 'DUE_SOON', 'ESCALATION'];
const VALID_SEVERITIES: WSNotificationSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

router.post('/test', authenticate, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const roles: string[] = user.roles || [];

    // Admin only
    if (!roles.includes('SUPER_ADMIN') && !roles.includes('ORG_ADMIN') && !roles.includes('ADMIN')) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Admin role required to send test notifications' },
      });
    }

    const {
      title,
      message,
      type = 'INFO',
      severity = 'LOW',
      module,
      targetUserId,
    } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'title is required' },
      });
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'message is required' },
      });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
      });
    }

    if (!VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}` },
      });
    }

    const recipientId = targetUserId || user.id;

    const notification: WSNotification = {
      id: uuidv4(),
      type,
      title: title.trim(),
      message: message.trim(),
      module: module || 'system',
      severity,
      userId: recipientId,
      orgId: user.organisationId,
      createdAt: new Date(),
      read: false,
      data: { testNotification: true, sentBy: user.id },
    };

    bellState.addNotification(recipientId, notification);

    logger.info('Test notification sent', {
      notificationId: notification.id,
      recipientId,
      sentBy: user.id,
    });

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    logger.error('Failed to send test notification', { error: error.message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to send test notification' },
    });
  }
});

export default router;
