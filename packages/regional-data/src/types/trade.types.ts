// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface TradeAgreementData {
  shortCode: string;
  name: string;
  description: string;
  effectiveDate?: string;
  officialUrl?: string;
  benefits: string[];
  memberCodes: string[];
}
