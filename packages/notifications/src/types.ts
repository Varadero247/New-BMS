export type NotificationType =
  | 'INCIDENT_CREATED'
  | 'INCIDENT_UPDATED'
  | 'ACTION_ASSIGNED'
  | 'ACTION_DUE'
  | 'ACTION_OVERDUE'
  | 'CAPA_CREATED'
  | 'CAPA_DUE'
  | 'AUDIT_SCHEDULED'
  | 'AUDIT_FINDING'
  | 'APPROVAL_REQUIRED'
  | 'APPROVAL_GRANTED'
  | 'APPROVAL_REJECTED'
  | 'DOCUMENT_UPDATED'
  | 'COMPLIANCE_ALERT'
  | 'SYSTEM_ALERT'
  | 'TASK_REMINDER'
  | 'REPORT_READY'
  | 'TRAINING_DUE'
  | 'CUSTOM';

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type NotificationStatus = 'PENDING' | 'SENT' | 'READ' | 'FAILED';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  status: NotificationStatus;
  module?: string;
  referenceId?: string;
  referenceType?: string;
  link?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  readAt?: Date;
  sentAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    in_app: boolean;
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm
    end: string;
  };
  disabledTypes: NotificationType[];
  emailDigest: 'none' | 'daily' | 'weekly';
}

export interface EscalationRule {
  afterHours: number;
  escalateTo: string;
  action: 'NOTIFY_MANAGER' | 'REASSIGN' | 'AUTO_CLOSE';
}

export interface EscalationAction {
  rule: EscalationRule;
  notificationId: string;
  triggered: boolean;
  escalatedTo: string;
  action: string;
}

export interface Channel {
  type: NotificationChannel;
  send(notification: Notification): Promise<boolean>;
}
