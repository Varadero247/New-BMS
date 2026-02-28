// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type RiskCategory =
  | 'STRATEGIC'
  | 'OPERATIONAL'
  | 'FINANCIAL'
  | 'COMPLIANCE'
  | 'REPUTATIONAL'
  | 'TECHNOLOGY'
  | 'SAFETY'
  | 'ENVIRONMENTAL';

export type RiskStatus =
  | 'IDENTIFIED'
  | 'ASSESSED'
  | 'TREATED'
  | 'ACCEPTED'
  | 'CLOSED'
  | 'ESCALATED';

export type Likelihood = 1 | 2 | 3 | 4 | 5;
export type Impact = 1 | 2 | 3 | 4 | 5;
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TreatmentType = 'AVOID' | 'REDUCE' | 'TRANSFER' | 'ACCEPT';
export type TreatmentStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface RiskRecord {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  status: RiskStatus;
  owner: string;
  department: string;
  likelihood: Likelihood;
  impact: Impact;
  riskScore: number;
  riskLevel: RiskLevel;
  residualLikelihood?: Likelihood;
  residualImpact?: Impact;
  residualScore?: number;
  residualLevel?: RiskLevel;
  identifiedAt: string;
  reviewDate?: string;
  notes?: string;
}

export interface RiskTreatment {
  id: string;
  riskId: string;
  type: TreatmentType;
  description: string;
  status: TreatmentStatus;
  assignedTo: string;
  dueDate: string;
  completedDate?: string;
  cost?: number;
  notes?: string;
}
