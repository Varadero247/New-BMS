// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export type RequirementType = 'LAW' | 'REGULATION' | 'PERMIT' | 'STANDARD' | 'GUIDELINE' | 'LICENCE' | 'AGREEMENT';
export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL' | 'NOT_ASSESSED' | 'NOT_APPLICABLE';
export type Jurisdiction = 'FEDERAL' | 'STATE' | 'LOCAL' | 'INTERNATIONAL' | 'INDUSTRY';
export type ReviewFrequency = 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'ANNUAL';
export type ObligationType = 'MUST' | 'SHOULD' | 'MAY';

export interface LegalRequirement {
  id: string;
  title: string;
  type: RequirementType;
  jurisdiction: Jurisdiction;
  referenceNumber?: string;
  description: string;
  applicableTo: string[];    // departments/activities
  complianceStatus: ComplianceStatus;
  reviewFrequency: ReviewFrequency;
  lastReviewDate?: string;
  nextReviewDate?: string;
  owner: string;
  effectiveDate: string;
  expiryDate?: string;
  isActive: boolean;
}

export interface ComplianceObligation {
  id: string;
  requirementId: string;
  description: string;
  obligationType: ObligationType;
  assignedTo: string;
  dueDate?: string;
  completedDate?: string;
  evidence?: string;
  notes?: string;
}
