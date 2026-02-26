// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface DowntimeEvent {
  id: string;
  reason: string;
  category: 'planned' | 'unplanned' | 'changeover' | 'breakdown' | 'maintenance';
  durationMinutes: number;
  startTime?: Date;
  endTime?: Date;
}

export interface OEEInput {
  /** Total planned production time in minutes */
  plannedProductionTime: number;
  /** Total downtime in minutes (planned + unplanned) */
  downtime: number;
  /** Ideal cycle time per piece in minutes */
  idealCycleTime: number;
  /** Total number of pieces produced (good + bad) */
  totalPieces: number;
  /** Number of good (non-defective) pieces */
  goodPieces: number;
  /** Optional: breakdown of downtime events */
  downtimeEvents?: DowntimeEvent[];
}

export interface OEEResult {
  /** Availability factor (0-1) */
  availability: number;
  /** Performance factor (0-1) */
  performance: number;
  /** Quality factor (0-1) */
  quality: number;
  /** Overall Equipment Effectiveness (0-1) */
  oee: number;
  /** OEE as a percentage string */
  oeePercent: string;
  /** Category classification */
  category: OEECategory;
  /** Whether this qualifies as world-class */
  isWorldClass: boolean;
  /** Run time in minutes (planned - downtime) */
  runTime: number;
  /** Number of defective pieces */
  defectPieces: number;
}

export type OEECategory = 'world-class' | 'good' | 'average' | 'below-average' | 'poor';

export interface MTBFResult {
  mtbf: number;
  unit: string;
}

export interface MTTRResult {
  mttr: number;
  unit: string;
}
