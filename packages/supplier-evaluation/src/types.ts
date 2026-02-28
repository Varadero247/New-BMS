// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type SupplierStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'CONDITIONAL' | 'SUSPENDED' | 'DISQUALIFIED';
export type SupplierCategory = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'PREFERRED';
export type EvaluationCriteria = 'QUALITY' | 'DELIVERY' | 'PRICE' | 'SERVICE' | 'COMPLIANCE' | 'FINANCIAL_STABILITY';
export type EvaluationResult = 'APPROVED' | 'CONDITIONAL' | 'REJECTED';
export type PerformanceRating = 1 | 2 | 3 | 4 | 5;

export interface SupplierRecord {
  id: string;
  name: string;
  status: SupplierStatus;
  category: SupplierCategory;
  country: string;
  contactEmail: string;
  products: string[];
  approvedBy?: string;
  approvedAt?: string;
  reviewDate?: string;
  overallRating?: PerformanceRating;
  notes?: string;
}

export interface SupplierEvaluation {
  id: string;
  supplierId: string;
  evaluatedBy: string;
  evaluatedAt: string;
  result: EvaluationResult;
  scores: Record<EvaluationCriteria, number>; // 0-100 per criterion
  overallScore: number; // average of all scores
  comments?: string;
  nextEvaluationDate?: string;
}
