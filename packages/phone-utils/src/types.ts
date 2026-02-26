// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface PhoneNumber {
  raw: string;
  e164: string;
  nationalNumber: string;
  countryCode: string; // ISO 3166-1 alpha-2
  callingCode: string; // e.g. "44"
  valid: boolean;
}
export interface CountryPhoneInfo {
  code: string;       // ISO 3166-1 alpha-2
  name: string;
  callingCode: string;
  pattern: RegExp;    // regex for national number validation
  format: string;     // format template e.g. "XXXX XXXXXX"
  trunkPrefix?: string; // e.g. "0" for UK
}
export type PhoneFormat = 'e164' | 'national' | 'international' | 'rfc3966';
