'use client';

import { cn } from './utils';

export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise';

export interface PlanBadgeProps {
  plan: PlanTier;
  className?: string;
}

const planStyles: Record<PlanTier, { label: string; bg: string; text: string; border: string }> = {
  free: {
    label: 'Free',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    border: 'border-gray-200 dark:border-gray-700',
  },
  starter: {
    label: 'Starter',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  professional: {
    label: 'Professional',
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
  },
  enterprise: {
    label: 'Enterprise',
    bg: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
};

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const style = planStyles[plan] || planStyles.free;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        style.bg, style.text, style.border,
        className
      )}
    >
      {plan === 'enterprise' && (
        <svg className="h-3 w-3 mr-0.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      {style.label}
    </span>
  );
}
