// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.
import type { OnboardingChecklist, OnboardingProgress, OnboardingStep } from './types';

export function calculateProgress(
  checklist: OnboardingChecklist,
  completedIds: string[],
  skippedIds: string[] = []
): number {
  const total = checklist.steps.length;
  if (total === 0) return 100;
  const done = checklist.steps.filter(
    (s) => completedIds.includes(s.id) || skippedIds.includes(s.id)
  ).length;
  return Math.round((done / total) * 100);
}

export function getNextStep(
  checklist: OnboardingChecklist,
  completedIds: string[],
  skippedIds: string[] = []
): OnboardingStep | null {
  const sorted = [...checklist.steps].sort((a, b) => a.order - b.order);
  return (
    sorted.find(
      (s) => !completedIds.includes(s.id) && !skippedIds.includes(s.id)
    ) ?? null
  );
}

export function isChecklistComplete(
  checklist: OnboardingChecklist,
  completedIds: string[],
  skippedIds: string[] = []
): boolean {
  return checklist.steps.every(
    (s) => completedIds.includes(s.id) || (!s.required && skippedIds.includes(s.id))
  );
}

export function completeStep(
  progress: OnboardingProgress,
  stepId: string,
  checklist: OnboardingChecklist
): OnboardingProgress {
  if (progress.completedStepIds.includes(stepId)) return progress;
  const completedStepIds = [...progress.completedStepIds, stepId];
  const percentComplete = calculateProgress(checklist, completedStepIds, progress.skippedStepIds);
  const isComplete = isChecklistComplete(checklist, completedStepIds, progress.skippedStepIds);
  return {
    ...progress,
    completedStepIds,
    percentComplete,
    completedAt: isComplete ? new Date() : undefined,
  };
}

export function skipStep(
  progress: OnboardingProgress,
  stepId: string,
  checklist: OnboardingChecklist
): OnboardingProgress {
  const step = checklist.steps.find((s) => s.id === stepId);
  if (!step || step.required) return progress;
  if (progress.skippedStepIds.includes(stepId)) return progress;
  const skippedStepIds = [...progress.skippedStepIds, stepId];
  const percentComplete = calculateProgress(checklist, progress.completedStepIds, skippedStepIds);
  return { ...progress, skippedStepIds, percentComplete };
}

export function createProgress(checklistId: string, userId: string): OnboardingProgress {
  return {
    checklistId,
    userId,
    completedStepIds: [],
    skippedStepIds: [],
    startedAt: new Date(),
    percentComplete: 0,
  };
}

export function getRemainingSteps(
  checklist: OnboardingChecklist,
  progress: OnboardingProgress
): OnboardingStep[] {
  return checklist.steps
    .filter(
      (s) =>
        !progress.completedStepIds.includes(s.id) &&
        !progress.skippedStepIds.includes(s.id)
    )
    .sort((a, b) => a.order - b.order);
}

export function estimateTotalMinutes(checklist: OnboardingChecklist): number {
  return checklist.steps.reduce((sum, s) => sum + (s.estimatedMinutes ?? 5), 0);
}

export function sortStepsByOrder(steps: OnboardingStep[]): OnboardingStep[] {
  return [...steps].sort((a, b) => a.order - b.order);
}
