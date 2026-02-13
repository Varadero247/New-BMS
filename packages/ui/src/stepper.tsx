'use client';

import { cn } from './utils';

export interface StepperStep {
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md';
  className?: string;
  onStepClick?: (step: number) => void;
}

export function Stepper({
  steps,
  currentStep,
  orientation = 'horizontal',
  size = 'md',
  className,
  onStepClick,
}: StepperProps) {
  const isHorizontal = orientation === 'horizontal';
  const dotSize = size === 'sm' ? 'h-6 w-6 text-xs' : 'h-8 w-8 text-sm';

  return (
    <nav aria-label="Progress" className={className}>
      <ol className={cn(
        'flex',
        isHorizontal ? 'items-center' : 'flex-col gap-4'
      )}>
        {steps.map((step, i) => {
          const status = i < currentStep ? 'complete' : i === currentStep ? 'current' : 'upcoming';

          return (
            <li
              key={i}
              className={cn(
                'flex',
                isHorizontal ? 'items-center flex-1' : 'items-start gap-3',
                isHorizontal && i < steps.length - 1 && 'pr-2'
              )}
            >
              <div className={cn('flex items-center', isHorizontal && 'flex-1')}>
                <button
                  type="button"
                  onClick={() => onStepClick?.(i)}
                  disabled={!onStepClick}
                  className={cn(
                    'flex-shrink-0 rounded-full flex items-center justify-center font-medium transition-colors',
                    dotSize,
                    status === 'complete'
                      ? 'bg-blue-600 text-white'
                      : status === 'current'
                      ? 'border-2 border-blue-600 text-blue-600 bg-white dark:bg-gray-900'
                      : 'border-2 border-gray-300 dark:border-gray-600 text-gray-400 bg-white dark:bg-gray-900',
                    onStepClick && 'cursor-pointer hover:opacity-80'
                  )}
                  aria-current={status === 'current' ? 'step' : undefined}
                >
                  {status === 'complete' ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </button>

                {/* Connector line */}
                {isHorizontal && i < steps.length - 1 && (
                  <div className={cn(
                    'flex-1 h-0.5 mx-2',
                    i < currentStep ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  )} />
                )}
              </div>

              {/* Labels for horizontal */}
              {isHorizontal ? (
                <div className="sr-only">
                  <span>{step.label}</span>
                </div>
              ) : (
                <div className="min-w-0 flex-1">
                  <span className={cn(
                    'text-sm font-medium',
                    status === 'current' ? 'text-blue-600' : status === 'complete' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {step.label}
                  </span>
                  {step.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.description}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Labels below for horizontal */}
      {isHorizontal && (
        <div className="flex mt-2">
          {steps.map((step, i) => {
            const status = i < currentStep ? 'complete' : i === currentStep ? 'current' : 'upcoming';
            return (
              <div key={i} className="flex-1 text-center">
                <span className={cn(
                  'text-xs font-medium',
                  status === 'current' ? 'text-blue-600' : status === 'complete' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
                )}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </nav>
  );
}
