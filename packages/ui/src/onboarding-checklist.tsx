'use client';

import { useState } from 'react';
import { cn } from './utils';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  href?: string;
}

export interface OnboardingChecklistProps {
  steps: OnboardingStep[];
  onStepClick?: (step: OnboardingStep) => void;
  onDismiss?: () => void;
  className?: string;
}

export function OnboardingChecklist({
  steps,
  onStepClick,
  onDismiss,
  className,
}: OnboardingChecklistProps) {
  const [expanded, setExpanded] = useState(true);

  const completed = steps.filter((s) => s.completed).length;
  const total = steps.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  if (total === 0) return null;

  const handleStepClick = (step: OnboardingStep) => {
    onStepClick?.(step);
    if (step.href) window.location.href = step.href;
  };

  /* ---------- Collapsed: circular toggle button ---------- */
  if (!expanded) {
    return (
      <div className={cn('fixed bottom-6 right-6 z-40', className)}>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className={cn(
            'h-14 w-14 rounded-full bg-brand-600 text-white shadow-xl',
            'flex flex-col items-center justify-center gap-0.5',
            'hover:bg-brand-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2'
          )}
          aria-label={`Getting Started — ${completed} of ${total} steps complete`}
        >
          <span className="text-xs font-bold leading-none">
            {completed}/{total}
          </span>
          {/* Mini checkmark icon */}
          <svg
            className="h-3.5 w-3.5 opacity-80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    );
  }

  /* ---------- Expanded: card panel ---------- */
  return (
    <div className={cn('fixed bottom-6 right-6 z-40', className)}>
      <div className="w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-display font-semibold text-foreground">Getting Started</h3>
            <div className="flex items-center gap-1">
              {/* Collapse button */}
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
                aria-label="Collapse checklist"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* Dismiss button */}
              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
                  aria-label="Dismiss getting started checklist"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Progress text */}
          <p className="text-xs text-muted-foreground mb-2">
            {completed === total ? 'All done!' : `${completed} of ${total} steps complete`}
          </p>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={completed}
              aria-valuemin={0}
              aria-valuemax={total}
            />
          </div>
        </div>

        {/* Step list */}
        <ul className="max-h-72 overflow-y-auto">
          {steps.map((step) => (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => handleStepClick(step)}
                className="w-full px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
              >
                {/* Step icon */}
                {step.completed ? (
                  /* Completed: green checkmark circle */
                  <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                ) : (
                  /* Pending: empty circle */
                  <span className="shrink-0 h-5 w-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                )}

                {/* Step text */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm leading-snug',
                      step.completed
                        ? 'text-muted-foreground line-through'
                        : 'text-foreground font-medium'
                    )}
                  >
                    {step.title}
                  </p>
                  {!step.completed && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Arrow for incomplete steps with href */}
                {!step.completed && step.href && (
                  <svg
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
