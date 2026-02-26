// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
// Types
export {
  AuditAction,
  AuditEntity,
  SENSITIVE_FIELDS,
  redactFields,
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
