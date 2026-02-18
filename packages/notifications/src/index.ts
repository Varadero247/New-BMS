export { NotificationService } from './notification-service';
export { InAppChannel, EmailChannel, PushChannel, SmsChannel, createChannel } from './channels';
export { checkEscalation, getDefaultEscalationRules } from './escalation';
export { WebSocketNotificationServer } from './websocket';
export { NotificationBellState } from './notification-bell';
export type {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationPreferences,
  EscalationRule,
  EscalationAction,
  Channel,
} from './types';
export type { WSNotification, WSNotificationType, WSNotificationSeverity } from './websocket';
