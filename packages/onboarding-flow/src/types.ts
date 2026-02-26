// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.

export type StepStatus = 'pending' | 'active' | 'completed' | 'skipped';
export type TourTrigger = 'auto' | 'manual' | 'feature-flag';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  order: number;
  required?: boolean;
  estimatedMinutes?: number;
}

export interface OnboardingChecklist {
  id: string;
  name: string;
  module: string;
  steps: OnboardingStep[];
  completionReward?: string;
}

export interface OnboardingProgress {
  checklistId: string;
  userId: string;
  completedStepIds: string[];
  skippedStepIds: string[];
  startedAt: Date;
  completedAt?: Date;
  percentComplete: number;
}

export interface TourConfig {
  id: string;
  name: string;
  trigger: TourTrigger;
  steps: OnboardingStep[];
  showProgressBar?: boolean;
  allowSkip?: boolean;
}
