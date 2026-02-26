// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export type RoundingMode = 'HALF_UP' | 'HALF_DOWN' | 'HALF_EVEN' | 'UP' | 'DOWN' | 'CEILING' | 'FLOOR';
export type CurrencyCode = string; // ISO 4217 e.g. 'GBP', 'USD', 'EUR'
export interface Money { amount: bigint; currency: CurrencyCode; scale: number; } // amount in minor units
export interface CurrencyInfo { code: CurrencyCode; name: string; symbol: string; decimals: number; symbolPosition: 'before' | 'after'; }
export interface FormatOptions { symbol?: boolean; thousands?: boolean; decimals?: number; locale?: string; }
export interface ExchangeRate { from: CurrencyCode; to: CurrencyCode; rate: number; date?: string; }
export interface AllocationResult { amounts: bigint[]; remainder: bigint; }
