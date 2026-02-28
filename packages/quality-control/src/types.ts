// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type InspectionStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'CONDITIONALLY_PASSED';
export type InspectionType = 'INCOMING' | 'IN_PROCESS' | 'FINAL' | 'RECEIVING' | 'AUDIT';
export type DefectSeverity = 'MINOR' | 'MAJOR' | 'CRITICAL';
export type DefectStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ACCEPTED' | 'REJECTED';
export type NonconformanceType = 'PRODUCT' | 'PROCESS' | 'SYSTEM' | 'SERVICE';
export type DispositionType = 'REWORK' | 'SCRAP' | 'USE_AS_IS' | 'RETURN_TO_SUPPLIER' | 'REPAIR';

export interface InspectionRecord {
  id: string;
  type: InspectionType;
  status: InspectionStatus;
  productId: string;
  batchId?: string;
  inspector: string;
  scheduledDate: string;
  completedDate?: string;
  sampleSize: number;
  defectsFound: number;
  notes?: string;
}

export interface DefectRecord {
  id: string;
  inspectionId: string;
  severity: DefectSeverity;
  status: DefectStatus;
  description: string;
  location?: string;
  detectedBy: string;
  detectedAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface NonconformanceRecord {
  id: string;
  type: NonconformanceType;
  description: string;
  disposition: DispositionType;
  raisedBy: string;
  raisedAt: string;
  quantity: number;
  unit: string;
  cost?: number;
  closedAt?: string;
}
