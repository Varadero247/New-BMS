// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type CountryCode = 'GB' | 'US' | 'AE' | 'AU';

export interface Holiday {
  date: string; // ISO yyyy-mm-dd
  name: string;
  country: CountryCode;
  optional?: boolean;
}

export interface BusinessDayOptions {
  country?: CountryCode;
  holidays?: Holiday[];
  workDays?: number[]; // 0=Sun..6=Sat, default [1,2,3,4,5]
}

export interface SLAResult {
  businessDays: number;
  businessHours: number;
  deadline: Date;
}
