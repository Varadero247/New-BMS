export type AuditAction = 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout' | 'approve' | 'reject';
export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId: string;
  userName?: string;
  timestamp: number;
  ipAddress?: string;
  changes?: FieldChange[];
  metadata?: Record<string, unknown>;
  severity: AuditSeverity;
}

export interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface FormattedAuditEntry {
  id: string;
  description: string;
  timestamp: string;
  actor: string;
  action: string;
  severity: AuditSeverity;
  details: string[];
}

export interface AuditSummary {
  totalEntries: number;
  byAction: Record<AuditAction, number>;
  bySeverity: Record<AuditSeverity, number>;
  byUser: Record<string, number>;
  dateRange: { from: number; to: number } | null;
}
