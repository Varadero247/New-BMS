'use client';
// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import React from 'react';
import type { LegislationCategory } from '@ims/regional-data';

const CATEGORY_COLOURS: Record<LegislationCategory, { bg: string; text: string; border: string }> =
  {
    DATA_PRIVACY: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-700',
    },
    WORKPLACE_SAFETY: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-300',
      border: 'border-yellow-200 dark:border-yellow-700',
    },
    ENVIRONMENTAL: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-200 dark:border-green-700',
    },
    EMPLOYMENT: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-700',
    },
    ANTI_CORRUPTION: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-700',
    },
    FINANCIAL_REPORTING: {
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      text: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200 dark:border-indigo-700',
    },
    CONSUMER_PROTECTION: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      text: 'text-orange-700 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-700',
    },
    IMPORT_EXPORT: {
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
      text: 'text-cyan-700 dark:text-cyan-300',
      border: 'border-cyan-200 dark:border-cyan-700',
    },
    QUALITY_STANDARDS: {
      bg: 'bg-teal-100 dark:bg-teal-900/30',
      text: 'text-teal-700 dark:text-teal-300',
      border: 'border-teal-200 dark:border-teal-700',
    },
    INFORMATION_SECURITY: {
      bg: 'bg-slate-100 dark:bg-slate-900/30',
      text: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
    },
    FOOD_SAFETY: {
      bg: 'bg-lime-100 dark:bg-lime-900/30',
      text: 'text-lime-700 dark:text-lime-300',
      border: 'border-lime-200 dark:border-lime-700',
    },
    MEDICAL_DEVICES: {
      bg: 'bg-pink-100 dark:bg-pink-900/30',
      text: 'text-pink-700 dark:text-pink-300',
      border: 'border-pink-200 dark:border-pink-700',
    },
    ENERGY: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-700',
    },
    ANTI_MONEY_LAUNDERING: {
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-700',
    },
    OTHER: {
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-700',
    },
  };

function formatCategory(cat: LegislationCategory): string {
  return cat
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

export type LegislationComplianceStatus = 'compliant' | 'non-compliant' | 'partial' | 'not-assessed';

const STATUS_CONFIG: Record<
  LegislationComplianceStatus,
  { label: string; colour: string; icon: string }
> = {
  compliant: { label: 'Compliant', colour: 'text-green-600 dark:text-green-400', icon: '✓' },
  'non-compliant': {
    label: 'Non-Compliant',
    colour: 'text-red-600 dark:text-red-400',
    icon: '✗',
  },
  partial: { label: 'Partial', colour: 'text-yellow-600 dark:text-yellow-400', icon: '◑' },
  'not-assessed': {
    label: 'Not Assessed',
    colour: 'text-gray-400 dark:text-gray-500',
    icon: '?',
  },
};

export interface LegislationCardProps {
  countryCode: string;
  countryName: string;
  shortCode: string;
  title: string;
  category: LegislationCategory;
  governingBody: string;
  description: string;
  relevantIsoStds?: string[];
  isMandatory?: boolean;
  officialUrl?: string;
  effectiveDate?: string;
  lastAmended?: string;
  penaltyInfo?: string;
  complianceNotes?: string;
  complianceStatus?: LegislationComplianceStatus;
  className?: string;
  onViewDetails?: () => void;
}

const FLAG_EMOJIS: Record<string, string> = {
  SG: '🇸🇬', AU: '🇦🇺', NZ: '🇳🇿', MY: '🇲🇾', ID: '🇮🇩', TH: '🇹🇭',
  PH: '🇵🇭', VN: '🇻🇳', BN: '🇧🇳', MM: '🇲🇲', KH: '🇰🇭', LA: '🇱🇦',
  CN: '🇨🇳', JP: '🇯🇵', KR: '🇰🇷', HK: '🇭🇰', TW: '🇹🇼', IN: '🇮🇳',
  BD: '🇧🇩', LK: '🇱🇰', FJ: '🇫🇯', PG: '🇵🇬', AE: '🇦🇪', SA: '🇸🇦',
};

export function LegislationCard({
  countryCode,
  countryName,
  shortCode,
  title,
  category,
  governingBody,
  description,
  relevantIsoStds = [],
  isMandatory = false,
  officialUrl,
  effectiveDate,
  lastAmended,
  penaltyInfo,
  complianceNotes,
  complianceStatus = 'not-assessed',
  className = '',
  onViewDetails,
}: LegislationCardProps) {
  const colours = CATEGORY_COLOURS[category];
  const status = STATUS_CONFIG[complianceStatus];

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
              {countryName} — {shortCode}
            </span>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
              {title}
            </h3>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {/* Mandatory badge */}
          {isMandatory ? (
            <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-medium">
              Mandatory
            </span>
          ) : (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
              Voluntary
            </span>
          )}
          {/* Compliance status */}
          <span className={`text-xs font-medium ${status.colour}`}>
            {status.icon} {status.label}
          </span>
        </div>
      </div>

      {/* Category badge */}
      <div className="mb-3">
        <span
          className={`
            inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full
            border ${colours.bg} ${colours.text} ${colours.border}
          `}
        >
          {formatCategory(category)}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
        {description}
      </p>

      {/* Governing body */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        <span className="font-medium text-gray-700 dark:text-gray-300">Governing body:</span>{' '}
        {governingBody}
      </div>

      {/* ISO Standards badges */}
      {relevantIsoStds.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3" aria-label="Relevant ISO standards">
          {relevantIsoStds.map((iso) => (
            <span
              key={iso}
              className="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-700 font-mono"
            >
              {iso}
            </span>
          ))}
        </div>
      )}

      {/* Dates */}
      {(effectiveDate || lastAmended) && (
        <div className="flex gap-3 text-xs text-gray-400 dark:text-gray-500 mb-3">
          {effectiveDate && (
            <span>
              <span className="font-medium">Effective:</span>{' '}
              {new Date(effectiveDate).toLocaleDateString()}
            </span>
          )}
          {lastAmended && (
            <span>
              <span className="font-medium">Amended:</span>{' '}
              {new Date(lastAmended).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {/* Penalty info */}
      {penaltyInfo && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-400">
          <span className="font-medium">Penalties:</span> {penaltyInfo}
        </div>
      )}

      {/* Compliance notes */}
      {complianceNotes && (
        <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded text-xs text-amber-700 dark:text-amber-400">
          <span className="font-medium">Notes:</span> {complianceNotes}
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
        {officialUrl && (
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            aria-label={`View official source for ${title}`}
          >
            Official source
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            View details
          </button>
        )}
      </div>
    </div>
  );
}
