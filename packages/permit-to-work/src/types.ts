// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type PermitType =
  | 'HOT_WORK'
  | 'CONFINED_SPACE'
  | 'ELECTRICAL'
  | 'EXCAVATION'
  | 'WORKING_AT_HEIGHT'
  | 'RADIATION'
  | 'CHEMICAL';

export type PermitStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'COMPLETED'
  | 'CANCELLED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IsolationStatus = 'APPLIED' | 'VERIFIED' | 'REMOVED' | 'FAILED';

export type IsolationType =
  | 'LOCKOUT'
  | 'TAGOUT'
  | 'LOCKOUT_TAGOUT'
  | 'VALVE_LOCK'
  | 'ELECTRICAL_ISOLATION';

export interface PermitRecord {
  id: string;
  type: PermitType;
  status: PermitStatus;
  title: string;
  location: string;
  workDescription: string;
  riskLevel: RiskLevel;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  validFrom?: string;
  validUntil?: string;
  completedAt?: string;
  cancelledAt?: string;
  hazards: string[];
  precautions: string[];
  workers: string[];
  supervisor: string;
  notes?: string;
}

export interface IsolationRecord {
  id: string;
  permitId: string;
  type: IsolationType;
  status: IsolationStatus;
  isolationPoint: string;
  appliedBy: string;
  appliedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  removedBy?: string;
  removedAt?: string;
  notes?: string;
}
