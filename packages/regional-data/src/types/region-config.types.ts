// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface RegionConfig {
  countryCode: string;
  countryName: string;
  region: 'ASEAN' | 'ANZ' | 'EAST_ASIA' | 'SOUTH_ASIA';
  tier: 1 | 2;
  currency: CurrencyConfig;
  dateFormat: string;
  numberFormat: NumberFormatConfig;
  timezone: string[];
  languages: LanguageConfig[];
  finance: FinanceConfig;
  legislation: LegislationConfig;
  isoContext: ISOContextConfig;
  compliance: ComplianceConfig;
  business: BusinessConfig;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
  symbolPosition: 'before' | 'after';
  thousandsSeparator: string;
  decimalSeparator: string;
}

export interface NumberFormatConfig {
  thousandsSeparator: string;
  decimalSeparator: string;
  grouping: number;
}

export interface LanguageConfig {
  code: string;
  name: string;
  isOfficial: boolean;
  isPrimary: boolean;
  script?: string;
}

export interface TaxBand {
  min: number;
  max?: number;
  rate: number;
  label?: string;
}

export interface FinanceConfig {
  corporateTaxRate: number;
  corporateTaxBands?: TaxBand[];
  gstVatRate: number;
  gstVatName: string;
  gstVatRegistrationThreshold?: number;
  witholdingTaxRates: {
    dividends: number;
    interest: number;
    royalties: number;
    services: number;
  };
  payrollTax?: {
    employeeRate: number;
    employerRate: number;
    name: string;
    ceiling?: number;
  };
  transferPricingRules: boolean;
  thinCapitalisationRules: boolean;
  taxTreatyNetwork: string[];
  fiscalYearEnd: string;
  filingDeadlines: {
    corporateTax: string;
    gstVat: string;
    employeeTax: string;
  };
}

export interface LegislationItem {
  shortCode: string;
  title: string;
  jurisdiction: string;
  category: 'EMPLOYMENT' | 'HSE' | 'ENVIRONMENT' | 'DATA_PRIVACY' | 'CORPORATE' | 'FINANCIAL' | 'ANTI_CORRUPTION' | 'CONSUMER' | 'TRADE' | 'INFORMATION_SECURITY' | 'FOOD_SAFETY' | 'MEDICAL' | 'OTHER';
  summary: string;
  keyRequirements: string[];
  penalties?: string;
  effectiveDate?: string;
  lastAmended?: string;
  officialUrl?: string;
  relatedISOStandards: string[];
  isMandatory: boolean;
  applicableTo: ('all' | 'manufacturing' | 'financial' | 'food' | 'medical' | 'construction' | 'retail')[];
}

export interface LegislationConfig {
  primaryLaws: LegislationItem[];
  regulatoryBodies: {
    name: string;
    acronym: string;
    website: string;
    jurisdiction: string[];
  }[];
  reportingRequirements: string[];
  auditRequirements: string;
}

export interface ISOAdoptionStatus {
  standard: string;
  localStandard?: string;
  adoptionStatus: 'ADOPTED' | 'MODIFIED' | 'EQUIVALENT' | 'SUPERSEDED' | 'NOT_ADOPTED';
  certificationBodies: string[];
  mandatoryForSectors?: string[];
  notes?: string;
}

export interface ISOContextConfig {
  adoptedStandards: ISOAdoptionStatus[];
  certificationBodies: string[];
  accreditationBody: string;
  notes: string;
}

export interface ComplianceConfig {
  mandatoryReporting: string[];
  esgRequirements: string;
  sustainabilityFrameworks: string[];
  dataProtectionAuthority: string;
  dataRetentionYears: number;
  crossBorderDataTransfer: string;
  whistleblowerProtection: boolean;
  modernSlaveryAct: boolean;
  dueDiligenceRequirements: string;
}

export interface BusinessConfig {
  companyTypes: string[];
  minShareCapital?: number;
  incorporationTime: string;
  businessRegistrationBody: string;
  easeOfDoingBusinessRank?: number;
  freeTradeZones: string[];
  importDutyFramework: string;
  exportControls: string[];
  ipProtectionRating: string;
  corruptionPerceptionsIndex?: number;
}
