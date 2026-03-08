// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export function formatCurrency(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    SGD: 'S$',
    AUD: 'A$',
    NZD: 'NZ$',
    MYR: 'RM',
    IDR: 'Rp',
    THB: '฿',
    PHP: '₱',
    VND: '₫',
    BND: 'B$',
    CNY: '¥',
    JPY: '¥',
    KRW: '₩',
    HKD: 'HK$',
    TWD: 'NT$',
    INR: '₹',
    AED: 'AED',
    SAR: 'SR',
    BDT: '৳',
    LKR: 'Rs',
    FJD: 'FJ$',
    PGK: 'K',
    KHR: '៛',
    LAK: '₭',
    MMK: 'K',
  };
  return symbols[currencyCode] ?? currencyCode;
}
