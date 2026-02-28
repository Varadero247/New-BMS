// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type AuditType = 'INTERNAL' | 'EXTERNAL' | 'SUPPLIER' | 'REGULATORY' | 'CERTIFICATION';
export type AuditStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
export type FindingSeverity = 'OBSERVATION' | 'MINOR_NC' | 'MAJOR_NC' | 'CRITICAL_NC';
export type FindingStatus = 'OPEN' | 'RESPONDED' | 'VERIFIED' | 'CLOSED' | 'OVERDUE';
export type AuditScope = 'QUALITY' | 'ENVIRONMENT' | 'HEALTH_SAFETY' | 'INFORMATION_SECURITY' | 'ENERGY' | 'FOOD_SAFETY';

export interface AuditRecord {
  id: string;
  type: AuditType;
  scope: AuditScope[];
  title: string;
  status: AuditStatus;
  leadAuditor: string;
  auditTeam: string[];
  auditee: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  standardsReferenced: string[];
  objectives: string[];
  notes?: string;
}

export interface AuditFinding {
  id: string;
  auditId: string;
  severity: FindingSeverity;
  status: FindingStatus;
  clauseReference: string;
  description: string;
  evidence: string;
  raisedBy: string;
  raisedAt: string;
  responseDeadline?: string;
  response?: string;
  respondedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  closedAt?: string;
  capaId?: string;
}
