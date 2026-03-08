// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type LegislationCategory =
  | 'WORKPLACE_SAFETY'
  | 'ENVIRONMENTAL'
  | 'DATA_PRIVACY'
  | 'EMPLOYMENT'
  | 'ANTI_CORRUPTION'
  | 'FINANCIAL_REPORTING'
  | 'CONSUMER_PROTECTION'
  | 'IMPORT_EXPORT'
  | 'QUALITY_STANDARDS'
  | 'INFORMATION_SECURITY'
  | 'FOOD_SAFETY'
  | 'MEDICAL_DEVICES'
  | 'ENERGY'
  | 'ANTI_MONEY_LAUNDERING'
  | 'OTHER';

export type FinancialRuleType =
  | 'GST'
  | 'VAT'
  | 'SST'
  | 'CORPORATE_TAX'
  | 'WITHHOLDING_TAX'
  | 'PAYROLL_TAX'
  | 'STAMP_DUTY'
  | 'CUSTOMS_DUTY'
  | 'TRANSFER_PRICING'
  | 'FINANCIAL_REPORTING'
  | 'AUDIT_REQUIREMENT'
  | 'OTHER';

export type RegionName =
  | 'ASEAN'
  | 'East Asia'
  | 'South Asia'
  | 'Pacific'
  | 'Middle East';

export interface LegislationData {
  shortCode: string;
  title: string;
  category: LegislationCategory;
  governingBody: string;
  relevantIsoStds: string[];
  isMandatory: boolean;
  officialUrl?: string;
  description: string;
  effectiveDate?: string;
  lastAmended?: string;
  penaltyInfo?: string;
  complianceNotes?: string;
  thresholdAmount?: number;
}

export interface FinancialRuleData {
  ruleType: FinancialRuleType;
  name: string;
  rate?: number;
  governingBody: string;
  filingFrequency?: string;
  filingDeadline?: string;
  thresholdAmount?: number;
  thresholdCurrency?: string;
  officialUrl?: string;
  description: string;
  effectiveFrom?: string;
}

export interface IsoMappingData {
  isoStandard: string;
  isoClause?: string;
  legislationShortCode: string;
  mappingNotes?: string;
}

export interface CountryData {
  code: string;
  name: string;
  region: RegionName;
  currency: string;
  currencySymbol: string;
  locale: string;
  dateFormat: string;
  timezone: string;
  gstRate?: number;
  taxSystem?: string;
  phonePrefix: string;
  legislation: LegislationData[];
  financialRules: FinancialRuleData[];
  tradeAgreements: string[];
  isoMappings?: IsoMappingData[];
}
