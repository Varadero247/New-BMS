// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential and proprietary.

export type InspectionFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'AS_NEEDED';
export type InspectionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'OVERDUE';
export type ChecklistStatus = 'DRAFT' | 'ACTIVE' | 'RETIRED';
export type ItemResult = 'PASS' | 'FAIL' | 'N_A' | 'OBSERVATION';
export type InspectionCategory = 'SAFETY' | 'QUALITY' | 'ENVIRONMENTAL' | 'EQUIPMENT' | 'PROCESS' | 'FACILITY';

export interface InspectionPlan {
  id: string;
  title: string;
  category: InspectionCategory;
  frequency: InspectionFrequency;
  status: InspectionStatus;
  checklistId?: string;
  location: string;
  assignedTo: string;
  scheduledDate: string;
  completedDate?: string;
  score?: number;
  notes?: string;
}

export interface Checklist {
  id: string;
  title: string;
  category: InspectionCategory;
  status: ChecklistStatus;
  version: number;
  items: ChecklistItem[];
  createdBy: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  order: number;
  description: string;
  required: boolean;
  result?: ItemResult;
  notes?: string;
}
