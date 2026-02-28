// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type DocumentStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'OBSOLETE' | 'WITHDRAWN';
export type DocumentType = 'PROCEDURE' | 'WORK_INSTRUCTION' | 'POLICY' | 'FORM' | 'RECORD' | 'MANUAL' | 'SPECIFICATION';
export type ReviewOutcome = 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
export type DistributionMethod = 'ELECTRONIC' | 'PRINT' | 'PORTAL';

export interface DocumentRecord {
  id: string;
  title: string;
  documentType: DocumentType;
  version: string;
  status: DocumentStatus;
  author: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  reviewDate?: string;
  nextReviewDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  tags: string[];
  content?: string;
}

export interface ReviewRecord {
  id: string;
  documentId: string;
  reviewerId: string;
  outcome: ReviewOutcome;
  comments?: string;
  reviewedAt: string;
}

export interface DistributionRecord {
  id: string;
  documentId: string;
  recipientId: string;
  method: DistributionMethod;
  distributedAt: string;
  acknowledgedAt?: string;
}
