'use client';

import { useState, useCallback } from 'react';
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
  onToggle: (stepId: string) => void;
  onDismiss: () => void;
  className?: string;
}

export function OnboardingChecklist({ steps, onToggle, onDismiss, className }: OnboardingChecklistProps) {
  const [collapsed, setCollapsed] = useState(false);
  const completed = steps.filter(s => s.completed).length;
  const total = steps.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  if (total === 0) return null;

  return (
    <div className={cn('bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8">
            <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.915" fill="none" stroke="currentColor"
                className="text-blue-600 dark:text-blue-400"
                strokeWidth="3" strokeDasharray={`${progress} 100`} strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-700 dark:text-gray-300">
              {completed}/{total}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Getting Started</h3>
            <p className="text-[10px] text-gray-500">{completed === total ? 'All done!' : `${total - completed} steps remaining`}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed(c => !c)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            <svg className={cn('h-4 w-4 transition-transform', collapsed && '-rotate-90')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Dismiss checklist"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Steps */}
      {!collapsed && (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {steps.map(step => (
            <li key={step.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <button
                type="button"
                onClick={() => onToggle(step.id)}
                className={cn(
                  'mt-0.5 h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors',
                  step.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                )}
              >
                {step.completed && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm', step.completed ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100 font-medium')}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
