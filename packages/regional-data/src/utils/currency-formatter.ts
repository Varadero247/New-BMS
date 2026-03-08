// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { RegionConfig } from '../types/region-config.types';

export function formatCurrency(amount: number, config: RegionConfig, options?: { compact?: boolean; showCode?: boolean }): string {
  const { currency } = config;
  const formatted = new Intl.NumberFormat(config.languages[0]?.code || 'en', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
    useGrouping: true,
  }).format(amount);

  const withSymbol = currency.symbolPosition === 'before'
    ? `${currency.symbol}${formatted}`
    : `${formatted}${currency.symbol}`;

  if (options?.compact && amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return currency.symbolPosition === 'before'
      ? `${currency.symbol}${millions.toFixed(1)}M`
      : `${millions.toFixed(1)}M${currency.symbol}`;
  }
  if (options?.showCode) return `${withSymbol} ${currency.code}`;
  return withSymbol;
}

export function parseCurrency(value: string, config: RegionConfig): number {
  const cleaned = value
    .replace(config.currency.symbol, '')
    .replace(new RegExp(`\\${config.currency.thousandsSeparator}`, 'g'), '')
    .replace(config.currency.decimalSeparator, '.')
    .trim();
  return parseFloat(cleaned) || 0;
}

export function convertCurrency(amount: number, fromCode: string, toCode: string, rates: Record<string, number>): number {
  if (fromCode === toCode) return amount;
  const fromRate = rates[fromCode] ?? 1;
  const toRate = rates[toCode] ?? 1;
  return (amount / fromRate) * toRate;
}
