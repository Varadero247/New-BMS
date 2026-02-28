// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential.

export type ComplaintSource = 'EMAIL' | 'PHONE' | 'WEB_FORM' | 'IN_PERSON' | 'SOCIAL_MEDIA' | 'REGULATORY' | 'LEGAL';
export type ComplaintSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ComplaintStatus = 'RECEIVED' | 'ACKNOWLEDGED' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'CLOSED' | 'ESCALATED' | 'WITHDRAWN';
export type ComplaintCategory = 'PRODUCT_QUALITY' | 'SERVICE_DELIVERY' | 'BILLING' | 'STAFF_CONDUCT' | 'COMPLIANCE' | 'SAFETY' | 'DATA_PRIVACY';
export type ResolutionType = 'REFUND' | 'REPLACEMENT' | 'APOLOGY' | 'PROCESS_CHANGE' | 'TRAINING' | 'COMPENSATION' | 'NO_ACTION';

export interface ComplaintRecord {
  id: string;
  referenceNumber: string;
  source: ComplaintSource;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  category: ComplaintCategory;
  customerId: string;
  customerName: string;
  description: string;
  receivedAt: string;
  acknowledgedAt?: string;
  targetResolutionDate?: string;
  resolvedAt?: string;
  closedAt?: string;
  assignedTo?: string;
  rootCause?: string;
  notes?: string;
}

export interface ResolutionRecord {
  id: string;
  complaintId: string;
  type: ResolutionType;
  description: string;
  implementedBy: string;
  implementedAt: string;
  customerSatisfied?: boolean;
  satisfactionScore?: number;   // 1-5
  capaRaised?: boolean;
  capaId?: string;
  notes?: string;
}
