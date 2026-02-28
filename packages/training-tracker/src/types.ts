// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export type TrainingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
export type TrainingType = 'ONBOARDING' | 'SAFETY' | 'TECHNICAL' | 'COMPLIANCE' | 'LEADERSHIP' | 'SOFT_SKILLS';
export type CompetencyLevel = 'NOVICE' | 'DEVELOPING' | 'COMPETENT' | 'PROFICIENT' | 'EXPERT';
export type DeliveryMethod = 'CLASSROOM' | 'ONLINE' | 'ON_THE_JOB' | 'BLENDED' | 'SELF_STUDY';

export interface TrainingRecord {
  id: string;
  employeeId: string;
  courseId: string;
  courseName: string;
  type: TrainingType;
  deliveryMethod: DeliveryMethod;
  status: TrainingStatus;
  scheduledDate: string;
  completedDate?: string;
  score?: number;
  passingScore: number;
  expiryDate?: string;
  instructor?: string;
  notes?: string;
}

export interface CompetencyRecord {
  id: string;
  employeeId: string;
  competency: string;
  level: CompetencyLevel;
  assessedBy: string;
  assessedAt: string;
  targetLevel: CompetencyLevel;
  notes?: string;
}
