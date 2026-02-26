// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type ComplianceStatus = 'CONFORMANT' | 'MINOR_GAP' | 'MAJOR_GAP' | 'NOT_APPLICABLE' | 'NOT_ASSESSED';

export interface ClauseRequirement {
  id: string;          // e.g. "4.1"
  title: string;
  description: string;
  evidenceExamples: string[];
  relatedClauses?: string[];
  mandatory: boolean;
}

export interface StandardAssessment {
  standardId: string;   // e.g. "iso-9001-2015"
  standardName: string; // e.g. "ISO 9001:2015"
  version: string;
  clauses: ClauseRequirement[];
}

export interface ClauseResponse {
  clauseId: string;
  status: ComplianceStatus;
  evidence?: string;
  notes?: string;
  responsiblePerson?: string;
  targetDate?: string;
}

export interface GapAssessment {
  id: string;
  orgId: string;
  standardId: string;
  conductedBy: string;
  conductedAt: Date;
  responses: ClauseResponse[];
}

export interface ClauseGap {
  clause: ClauseRequirement;
  status: ComplianceStatus;
  evidence?: string;
  notes?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface GapReport {
  assessmentId: string;
  standardId: string;
  standardName: string;
  orgId: string;
  conductedAt: Date;
  summary: {
    total: number;
    conformant: number;
    minorGaps: number;
    majorGaps: number;
    notApplicable: number;
    notAssessed: number;
    overallScore: number;       // 0–100
    estimatedWeeksToClose: number;
  };
  gaps: ClauseGap[];
  recommendedActions: string[];
}
