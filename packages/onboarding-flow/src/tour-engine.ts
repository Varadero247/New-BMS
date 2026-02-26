// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.
import type { TourConfig, OnboardingStep } from './types';

export const DEFAULT_TOURS: TourConfig[] = [
  {
    id: 'welcome',
    name: 'Welcome to Nexara IMS',
    trigger: 'auto',
    showProgressBar: true,
    allowSkip: true,
    steps: [
      { id: 'w1', title: 'Welcome', description: 'Welcome to your IMS platform', order: 1 },
      { id: 'w2', title: 'Dashboard', description: 'Your central command centre', targetSelector: '#dashboard', order: 2 },
      { id: 'w3', title: 'Modules', description: 'Access all 42 modules from the sidebar', targetSelector: '#sidebar', order: 3 },
    ],
  },
  {
    id: 'health-safety',
    name: 'Health & Safety Tour',
    trigger: 'manual',
    showProgressBar: true,
    allowSkip: false,
    steps: [
      { id: 'hs1', title: 'Risk Assessment', description: 'Create your first risk assessment', order: 1, required: true },
      { id: 'hs2', title: 'Incident Reporting', description: 'Report and investigate incidents', order: 2 },
    ],
  },
];

export function getTourById(id: string, tours: TourConfig[] = DEFAULT_TOURS): TourConfig | null {
  return tours.find((t) => t.id === id) ?? null;
}

export function getAutoTours(tours: TourConfig[] = DEFAULT_TOURS): TourConfig[] {
  return tours.filter((t) => t.trigger === 'auto');
}

export function validateTour(config: TourConfig): string[] {
  const errors: string[] = [];
  if (!config.id) errors.push('Tour id is required');
  if (!config.name) errors.push('Tour name is required');
  if (!config.steps || config.steps.length === 0) errors.push('Tour must have at least one step');
  if (!['auto', 'manual', 'feature-flag'].includes(config.trigger)) {
    errors.push(`Invalid trigger: ${config.trigger}`);
  }
  return errors;
}

export function buildTourStep(
  partial: Partial<OnboardingStep> & Pick<OnboardingStep, 'id' | 'title' | 'description' | 'order'>
): OnboardingStep {
  return {
    placement: 'bottom',
    required: false,
    estimatedMinutes: 5,
    ...partial,
  };
}

export function getTourStepCount(config: TourConfig): number {
  return config.steps.length;
}

export function isTourValid(config: TourConfig): boolean {
  return validateTour(config).length === 0;
}
