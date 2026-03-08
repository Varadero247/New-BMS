// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import React from 'react';
import type { LegislationItem } from '@ims/regional-data';

const CATEGORY_STYLES: Record<LegislationItem['category'], { bg: string; text: string; border: string }> = {
  EMPLOYMENT: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-700' },
  HSE: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-700' },
  ENVIRONMENT: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-700' },
  DATA_PRIVACY: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-700' },
  CORPORATE: { bg: 'bg-gray-50 dark:bg-gray-900/20', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' },
  FINANCIAL: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-700' },
  ANTI_CORRUPTION: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-700' },
  CONSUMER: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-700' },
  TRADE: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-700' },
  INFORMATION_SECURITY: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-700' },
  FOOD_SAFETY: { bg: 'bg-lime-50 dark:bg-lime-900/20', text: 'text-lime-700 dark:text-lime-300', border: 'border-lime-200 dark:border-lime-700' },
  MEDICAL: { bg: 'bg-pink-50 dark:bg-pink-900/20', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-700' },
  OTHER: { bg: 'bg-gray-50 dark:bg-gray-900/20', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' },
};

export interface LegislationBadgeProps {
  legislation: LegislationItem;
  size?: 'sm' | 'md';
  showIso?: boolean;
  className?: string;
}

export function LegislationBadge({ legislation, size = 'md', showIso, className = '' }: LegislationBadgeProps) {
  const style = CATEGORY_STYLES[legislation.category] ?? CATEGORY_STYLES.OTHER;
  const textSize = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <div className={`inline-flex flex-col gap-0.5 ${className}`}>
      <span className={`inline-flex items-center rounded-full border font-medium ${textSize} ${style.bg} ${style.text} ${style.border}`}>
        {legislation.shortCode}
      </span>
      {showIso && legislation.relatedISOStandards.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {legislation.relatedISOStandards.map((std) => (
            <span key={std} className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded font-mono">
              {std}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
