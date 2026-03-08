'use client';
// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import React, { useMemo } from 'react';
import type { FinancialRuleType } from '@ims/regional-data';

const RULE_TYPE_CONFIG: Record<
  FinancialRuleType,
  { label: string; colour: string; bgColour: string; borderColour: string; icon: string }
> = {
  GST: {
    label: 'GST',
    colour: 'text-emerald-700 dark:text-emerald-300',
    bgColour: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColour: 'border-emerald-200 dark:border-emerald-700',
    icon: '🧾',
  },
  VAT: {
    label: 'VAT',
    colour: 'text-blue-700 dark:text-blue-300',
    bgColour: 'bg-blue-50 dark:bg-blue-900/20',
    borderColour: 'border-blue-200 dark:border-blue-700',
    icon: '🧾',
  },
  SST: {
    label: 'SST',
    colour: 'text-cyan-700 dark:text-cyan-300',
    bgColour: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderColour: 'border-cyan-200 dark:border-cyan-700',
    icon: '🧾',
  },
  CORPORATE_TAX: {
    label: 'Corporate Tax',
    colour: 'text-indigo-700 dark:text-indigo-300',
    bgColour: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColour: 'border-indigo-200 dark:border-indigo-700',
    icon: '🏢',
  },
  WITHHOLDING_TAX: {
    label: 'Withholding Tax',
    colour: 'text-orange-700 dark:text-orange-300',
    bgColour: 'bg-orange-50 dark:bg-orange-900/20',
    borderColour: 'border-orange-200 dark:border-orange-700',
    icon: '✂️',
  },
  PAYROLL_TAX: {
    label: 'Payroll Tax',
    colour: 'text-teal-700 dark:text-teal-300',
    bgColour: 'bg-teal-50 dark:bg-teal-900/20',
    borderColour: 'border-teal-200 dark:border-teal-700',
    icon: '👥',
  },
  STAMP_DUTY: {
    label: 'Stamp Duty',
    colour: 'text-pink-700 dark:text-pink-300',
    bgColour: 'bg-pink-50 dark:bg-pink-900/20',
    borderColour: 'border-pink-200 dark:border-pink-700',
    icon: '📄',
  },
  CUSTOMS_DUTY: {
    label: 'Customs Duty',
    colour: 'text-amber-700 dark:text-amber-300',
    bgColour: 'bg-amber-50 dark:bg-amber-900/20',
    borderColour: 'border-amber-200 dark:border-amber-700',
    icon: '🚢',
  },
  TRANSFER_PRICING: {
    label: 'Transfer Pricing',
    colour: 'text-purple-700 dark:text-purple-300',
    bgColour: 'bg-purple-50 dark:bg-purple-900/20',
    borderColour: 'border-purple-200 dark:border-purple-700',
    icon: '↔️',
  },
  FINANCIAL_REPORTING: {
    label: 'Financial Reporting',
    colour: 'text-slate-700 dark:text-slate-300',
    bgColour: 'bg-slate-50 dark:bg-slate-900/20',
    borderColour: 'border-slate-200 dark:border-slate-700',
    icon: '📊',
  },
  AUDIT_REQUIREMENT: {
    label: 'Audit Requirement',
    colour: 'text-rose-700 dark:text-rose-300',
    bgColour: 'bg-rose-50 dark:bg-rose-900/20',
    borderColour: 'border-rose-200 dark:border-rose-700',
    icon: '🔍',
  },
  OTHER: {
    label: 'Other',
    colour: 'text-gray-700 dark:text-gray-300',
    bgColour: 'bg-gray-50 dark:bg-gray-900/20',
    borderColour: 'border-gray-200 dark:border-gray-700',
    icon: '📋',
  },
};

function formatRate(rate?: number | null): string {
  if (rate == null) return 'Variable';
  return `${rate}%`;
}

function formatThreshold(amount?: number | null, currency?: string | null): string {
  if (!amount) return '';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount);
  return currency ? `${currency} ${formatted}` : formatted;
}

function computeNextDeadline(filingFrequency?: string, filingDeadline?: string): string | null {
  if (!filingFrequency || !filingDeadline) return null;

  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  // Simple heuristic: if quarterly, next deadline is next quarter
  if (filingFrequency.toLowerCase().includes('quarterly')) {
    const nextQuarterEnd = new Date(year, Math.floor(month / 3) * 3 + 3, 0);
    const deadline = new Date(nextQuarterEnd);
    deadline.setDate(deadline.getDate() + 28);
    return deadline.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Monthly: next month's deadline
  if (filingFrequency.toLowerCase().includes('monthly')) {
    const nextMonth = new Date(year, month + 2, 0);
    return nextMonth.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Annual: return the deadline text
  return filingDeadline;
}

export interface FinancialRuleCardProps {
  countryCode: string;
  countryName: string;
  ruleType: FinancialRuleType;
  name: string;
  rate?: number | null;
  description: string;
  governingBody: string;
  filingFrequency?: string;
  filingDeadline?: string;
  thresholdAmount?: number | null;
  thresholdCurrency?: string | null;
  officialUrl?: string;
  effectiveFrom?: string;
  currency: string;
  className?: string;
}

const FLAG_EMOJIS: Record<string, string> = {
  SG: '🇸🇬', AU: '🇦🇺', NZ: '🇳🇿', MY: '🇲🇾', ID: '🇮🇩', TH: '🇹🇭',
  PH: '🇵🇭', VN: '🇻🇳', BN: '🇧🇳', MM: '🇲🇲', KH: '🇰🇭', LA: '🇱🇦',
  CN: '🇨🇳', JP: '🇯🇵', KR: '🇰🇷', HK: '🇭🇰', TW: '🇹🇼', IN: '🇮🇳',
  BD: '🇧🇩', LK: '🇱🇰', FJ: '🇫🇯', PG: '🇵🇬', AE: '🇦🇪', SA: '🇸🇦',
};

export function FinancialRuleCard({
  countryCode,
  countryName,
  ruleType,
  name,
  rate,
  description,
  governingBody,
  filingFrequency,
  filingDeadline,
  thresholdAmount,
  thresholdCurrency,
  officialUrl,
  effectiveFrom,
  currency,
  className = '',
}: FinancialRuleCardProps) {
  const config = RULE_TYPE_CONFIG[ruleType];
  const nextDeadline = useMemo(
    () => computeNextDeadline(filingFrequency, filingDeadline),
    [filingFrequency, filingDeadline]
  );
  const threshold = formatThreshold(thresholdAmount, thresholdCurrency ?? currency);

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0" aria-hidden="true">
            {FLAG_EMOJIS[countryCode] ?? '🏳'}
          </span>
          <div className="min-w-0">
            <span className="text-xs text-gray-500 dark:text-gray-400 block">
              {countryName}
            </span>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
              {name}
            </h3>
          </div>
        </div>
        {/* Rate — large and prominent */}
        <div className="flex-shrink-0 text-right">
          <div
            className={`text-2xl font-bold ${config.colour}`}
            aria-label={`Tax rate: ${formatRate(rate)}`}
          >
            {formatRate(rate)}
          </div>
          <span
            className={`
              inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
              border ${config.bgColour} ${config.colour} ${config.borderColour}
            `}
          >
            <span aria-hidden="true">{config.icon}</span>
            {config.label}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
        {description}
      </p>

      {/* Governing body */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        <span className="font-medium text-gray-700 dark:text-gray-300">Authority:</span>{' '}
        {governingBody}
      </div>

      {/* Filing info */}
      {(filingFrequency || nextDeadline) && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {filingFrequency && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Frequency</div>
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {filingFrequency}
              </div>
            </div>
          )}
          {nextDeadline && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
              <div className="text-xs text-amber-600 dark:text-amber-400 mb-0.5">Next deadline</div>
              <div className="text-xs font-medium text-amber-700 dark:text-amber-300">
                {nextDeadline}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Threshold */}
      {threshold && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-800">
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            Registration threshold:
          </span>
          <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">{threshold}</span>
        </div>
      )}

      {/* Effective from */}
      {effectiveFrom && (
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          <span className="font-medium">Effective from:</span>{' '}
          {new Date(effectiveFrom).toLocaleDateString()}
        </div>
      )}

      {/* Footer */}
      {officialUrl && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            aria-label={`Official source for ${name}`}
          >
            Official tax authority
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
