// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type SyncStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL';
export type SyncDirection = 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';
export type ConnectorType = 'BAMBOOHR' | 'SAP_HR' | 'DYNAMICS_365' | 'WORKDAY' | 'XERO' | 'GENERIC_REST';
export type EntityType = 'EMPLOYEE' | 'DEPARTMENT' | 'POSITION' | 'LEAVE' | 'SUPPLIER' | 'INVOICE' | 'CUSTOMER';

export interface ConnectorConfig {
  id: string;
  orgId: string;
  type: ConnectorType;
  name: string;
  enabled: boolean;
  credentials: Record<string, string>;  // encrypted at rest
  syncSchedule: string;  // cron expression
  syncDirection: SyncDirection;
  entityTypes: EntityType[];
  fieldMappings?: FieldMapping[];
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transform?: string;
}

export interface SyncJob {
  id: string;
  connectorId: string;
  orgId: string;
  status: SyncStatus;
  direction: SyncDirection;
  entityTypes: EntityType[];
  startedAt?: Date;
  completedAt?: Date;
  stats: SyncStats;
  errors: SyncError[];
  triggeredBy: 'SCHEDULE' | 'MANUAL' | 'WEBHOOK';
}

export interface SyncStats {
  totalFetched: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}

export interface SyncError {
  entityType: EntityType;
  entityId?: string;
  message: string;
  timestamp: Date;
}

export interface SyncProgress {
  jobId: string;
  entityType: EntityType;
  processed: number;
  total: number;
  status: SyncStatus;
}

export interface SyncRecord {
  entityType: EntityType;
  externalId: string;
  data: Record<string, unknown>;
  checksum?: string;
}

export interface ConnectorHealthStatus {
  connectorId: string;
  healthy: boolean;
  lastCheckedAt: Date;
  latencyMs?: number;
  errorMessage?: string;
}
