// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type ObjectiveStatus = 'DRAFT' | 'ACTIVE' | 'ACHIEVED' | 'NOT_ACHIEVED' | 'CANCELLED';
export type TargetStatus = 'PENDING' | 'ON_TRACK' | 'AT_RISK' | 'ACHIEVED' | 'MISSED';
export type MeasurementUnit = 'PERCENTAGE' | 'NUMBER' | 'KG' | 'TONNES' | 'KWH' | 'HOURS' | 'DAYS' | 'CURRENCY';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type StandardReference = 'ISO_9001' | 'ISO_14001' | 'ISO_45001' | 'ISO_50001' | 'ISO_27001';

export interface Objective {
  id: string;
  title: string;
  description: string;
  status: ObjectiveStatus;
  priority: Priority;
  owner: string;
  department: string;
  standardReference?: StandardReference;
  startDate: string;
  targetDate: string;
  achievedDate?: string;
  baseline?: number;
  unit?: MeasurementUnit;
  notes?: string;
}

export interface ObjectiveTarget {
  id: string;
  objectiveId: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: MeasurementUnit;
  status: TargetStatus;
  dueDate: string;
  assignedTo: string;
  lastUpdated: string;
  notes?: string;
}

export interface ProgressRecord {
  id: string;
  targetId: string;
  value: number;
  recordedAt: string;
  recordedBy: string;
  notes?: string;
}
