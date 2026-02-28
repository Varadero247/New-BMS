// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential and proprietary.

export type ContractorStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'SUSPENDED' | 'BLACKLISTED' | 'EXPIRED';
export type InductionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'WAIVED';
export type InductionType = 'SITE_SAFETY' | 'ENVIRONMENTAL' | 'QUALITY' | 'SECURITY' | 'EMERGENCY';
export type ContractorType = 'INDIVIDUAL' | 'COMPANY' | 'AGENCY';
export type ComplianceItem = 'PUBLIC_LIABILITY' | 'EMPLOYERS_LIABILITY' | 'PROFESSIONAL_INDEMNITY' | 'ISO_CERTIFICATION' | 'HEALTH_AND_SAFETY_POLICY';

export interface ContractorRecord {
  id: string;
  name: string;
  type: ContractorType;
  status: ContractorStatus;
  contactEmail: string;
  contactPhone?: string;
  trade: string;
  approvedBy?: string;
  approvedAt?: string;
  expiryDate?: string;
  complianceItems: ComplianceItem[];
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
}

export interface InductionRecord {
  id: string;
  contractorId: string;
  type: InductionType;
  status: InductionStatus;
  conductedBy?: string;
  conductedAt?: string;
  expiryDate?: string;
  score?: number;
  passed?: boolean;
  notes?: string;
}
