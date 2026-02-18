// Types
export {
  AuditAction,
  AuditEntity,
  SENSITIVE_FIELDS,
  type AuditLogEntry,
  type AuditLogQueryOptions,
  type AuditLogResult,
} from './types';

// Service
export { AuditService, createAuditService } from './service';

// Enhanced Service (21 CFR Part 11)
export {
  EnhancedAuditService,
  createEnhancedAuditService,
  type EnhancedAuditCreateParams,
  type EnhancedAuditQueryOptions,
} from './enhanced-service';

// Middleware
export {
  auditMiddleware,
  attachOldData,
  createAuditLogger,
  type AuditMiddlewareOptions,
} from './middleware';
