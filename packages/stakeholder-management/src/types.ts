// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type StakeholderType =
  | 'INTERNAL'
  | 'EXTERNAL'
  | 'REGULATORY'
  | 'CUSTOMER'
  | 'SUPPLIER'
  | 'COMMUNITY'
  | 'INVESTOR';

export type InfluenceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type InterestLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type EngagementStrategy =
  | 'MONITOR'
  | 'KEEP_INFORMED'
  | 'KEEP_SATISFIED'
  | 'MANAGE_CLOSELY';
export type CommunicationStatus =
  | 'PLANNED'
  | 'SENT'
  | 'ACKNOWLEDGED'
  | 'RESPONDED';
export type CommunicationMethod =
  | 'EMAIL'
  | 'MEETING'
  | 'REPORT'
  | 'NEWSLETTER'
  | 'SURVEY'
  | 'PORTAL';

export interface StakeholderRecord {
  id: string;
  name: string;
  type: StakeholderType;
  organization?: string;
  role?: string;
  influence: InfluenceLevel;
  interest: InterestLevel;
  engagementStrategy: EngagementStrategy;
  needs: string[];
  expectations: string[];
  contactEmail?: string;
  isActive: boolean;
}

export interface CommunicationLog {
  id: string;
  stakeholderId: string;
  subject: string;
  method: CommunicationMethod;
  status: CommunicationStatus;
  scheduledDate: string;
  sentDate?: string;
  acknowledgedDate?: string;
  respondedDate?: string;
  notes?: string;
}

/**
 * Compute engagement strategy from influence + interest levels.
 *
 * - HIGH/VERY_HIGH influence + HIGH/VERY_HIGH interest → MANAGE_CLOSELY
 * - LOW/MEDIUM influence  + HIGH/VERY_HIGH interest → KEEP_INFORMED
 * - HIGH/VERY_HIGH influence + LOW/MEDIUM interest  → KEEP_SATISFIED
 * - LOW/MEDIUM influence  + LOW/MEDIUM interest     → MONITOR
 */
export function computeEngagementStrategy(
  influence: InfluenceLevel,
  interest: InterestLevel,
): EngagementStrategy {
  const highInfluence = influence === 'HIGH' || influence === 'VERY_HIGH';
  const highInterest = interest === 'HIGH' || interest === 'VERY_HIGH';

  if (highInfluence && highInterest) return 'MANAGE_CLOSELY';
  if (!highInfluence && highInterest) return 'KEEP_INFORMED';
  if (highInfluence && !highInterest) return 'KEEP_SATISFIED';
  return 'MONITOR';
}
