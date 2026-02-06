/**
 * Audit log action types
 */
export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  SESSION_REVOKED = 'SESSION_REVOKED',

  // CRUD Operations
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',

  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  ROLE_CHANGED = 'ROLE_CHANGED',

  // Document Management
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_DOWNLOADED = 'DOCUMENT_DOWNLOADED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  DOCUMENT_VIEWED = 'DOCUMENT_VIEWED',
  DOCUMENT_APPROVED = 'DOCUMENT_APPROVED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',

  // Incident Management
  INCIDENT_REPORTED = 'INCIDENT_REPORTED',
  INCIDENT_UPDATED = 'INCIDENT_UPDATED',
  INCIDENT_CLOSED = 'INCIDENT_CLOSED',
  INVESTIGATION_STARTED = 'INVESTIGATION_STARTED',
  INVESTIGATION_COMPLETED = 'INVESTIGATION_COMPLETED',

  // Risk Management
  RISK_CREATED = 'RISK_CREATED',
  RISK_ASSESSED = 'RISK_ASSESSED',
  RISK_MITIGATED = 'RISK_MITIGATED',
  RISK_CLOSED = 'RISK_CLOSED',

  // System Events
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  SETTINGS_CHANGED = 'SETTINGS_CHANGED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
}

/**
 * Entity types for audit logging
 */
export enum AuditEntity {
  USER = 'User',
  SESSION = 'Session',
  RISK = 'Risk',
  INCIDENT = 'Incident',
  ACTION = 'Action',
  DOCUMENT = 'Document',
  TRAINING = 'Training',
  OBJECTIVE = 'Objective',
  AUDIT = 'Audit',
  NONCONFORMANCE = 'Nonconformance',
  EMPLOYEE = 'Employee',
  DEPARTMENT = 'Department',
  LEAVE = 'Leave',
  PAYROLL = 'Payroll',
  INVENTORY = 'Inventory',
  PRODUCT = 'Product',
  WORKFLOW = 'Workflow',
  SYSTEM = 'System',
}

/**
 * Audit log entry data
 */
export interface AuditLogEntry {
  userId?: string;
  action: AuditAction | string;
  entity: AuditEntity | string;
  entityId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Audit log query options
 */
export interface AuditLogQueryOptions {
  userId?: string;
  action?: AuditAction | string;
  entity?: AuditEntity | string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Audit log result
 */
export interface AuditLogResult {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

/**
 * Fields that should be redacted from audit logs
 */
export const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'token',
  'refreshToken',
  'accessToken',
  'apiKey',
  'secret',
  'ssn',
  'socialSecurityNumber',
  'taxId',
  'bankAccount',
  'creditCard',
  'cvv',
];
