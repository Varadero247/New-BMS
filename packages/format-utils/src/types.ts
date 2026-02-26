// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface CurrencyOptions {
  currency: string;
  locale?: string;
  decimals?: number;
  symbol?: string;
  symbolFirst?: boolean;
}

export interface NumberFormatOptions {
  decimals: number;
  thousandsSep?: string;
  decimalSep?: string;
  prefix?: string;
  suffix?: string;
}

export type FileSizeUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';

export interface FileSizeOptions {
  unit?: FileSizeUnit;
  decimals?: number;
  binary?: boolean;
}

export type DateRangeFormat = 'short' | 'medium' | 'long' | 'iso' | 'relative';

export type PhoneFormat = 'E164' | 'national' | 'international' | 'RFC3966';

export interface AddressComponents {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export type BankAccountFormat = 'IBAN' | 'masked' | 'last4';
