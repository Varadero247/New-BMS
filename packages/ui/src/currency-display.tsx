// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';
import React from 'react';
import type { RegionConfig } from '@ims/regional-data';
import { formatRegionCurrency as formatCurrency } from '@ims/regional-data';

export interface CurrencyDisplayProps {
  amount: number;
  config: RegionConfig;
  compact?: boolean;
  showCode?: boolean;
  className?: string;
  colorize?: boolean;
}

export function CurrencyDisplay({ amount, config, compact, showCode, className = '', colorize }: CurrencyDisplayProps) {
  const formatted = formatCurrency(amount, config, { compact, showCode });
  const colorClass = colorize ? (amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : '';
  return <span className={`font-mono ${colorClass} ${className}`}>{formatted}</span>;
}
