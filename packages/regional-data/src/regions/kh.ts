// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { RegionConfig } from '../types/region-config.types';

export const kh: RegionConfig = {
  countryCode: 'KH',
  countryName: 'Cambodia',
  region: 'ASEAN',
  tier: 2,
  currency: { code: 'KHR', symbol: '៛', name: 'Cambodian Riel', decimals: 0, symbolPosition: 'after', thousandsSeparator: ',', decimalSeparator: '.' },
  dateFormat: 'DD/MM/YYYY',
  numberFormat: { thousandsSeparator: ',', decimalSeparator: '.', grouping: 3 },
  timezone: ['Asia/Phnom_Penh'],
  languages: [
    { code: 'km', name: 'Khmer', isOfficial: true, isPrimary: true, script: 'Khmr' },
    { code: 'en-KH', name: 'English', isOfficial: false, isPrimary: false, script: 'Latn' },
  ],
  finance: {
    corporateTaxRate: 0.20,
    gstVatRate: 0.10,
    gstVatName: 'VAT',
    gstVatRegistrationThreshold: 250000000,
    witholdingTaxRates: { dividends: 0.14, interest: 0.15, royalties: 0.15, services: 0.15 },
    payrollTax: { employeeRate: 0.015, employerRate: 0.013, name: 'NSSF', ceiling: undefined },
    transferPricingRules: false,
    thinCapitalisationRules: false,
    taxTreatyNetwork: ['SG', 'CN', 'TH', 'VN', 'MY', 'IN', 'KR', 'BN'],
    fiscalYearEnd: 'Dec 31',
    filingDeadlines: { corporateTax: 'Mar 31', gstVat: 'Monthly (20th)', employeeTax: 'Mar 31' },
  },
  legislation: {
    primaryLaws: [
      {
        shortCode: 'LL-KH', title: 'Labour Law (1997 as amended 2018)', jurisdiction: 'Cambodia', category: 'EMPLOYMENT',
        summary: 'Primary labour legislation governing employment conditions.',
        keyRequirements: ['Employment contracts', '8-hour workday / 48-hour week', 'Annual leave (18 days after 1 year)', 'Minimum wage compliance', 'Trade union rights', 'NSSF registration'],
        effectiveDate: '1997-03-13', lastAmended: '2018-01-01',
        officialUrl: 'https://www.mlvt.gov.kh',
        relatedISOStandards: ['ISO 45001:2018'], isMandatory: true, applicableTo: ['all'],
      },
      {
        shortCode: 'LNE-KH', title: 'Law on Environmental Protection and Natural Resources Management (1996)', jurisdiction: 'Cambodia', category: 'ENVIRONMENT',
        summary: 'Framework for environmental protection and EIA requirements.',
        keyRequirements: ['Environmental Impact Assessment', 'Environmental compliance', 'Pollution control', 'Waste management'],
        effectiveDate: '1996-12-24', lastAmended: '2021-01-01',
        officialUrl: 'https://www.moe.gov.kh',
        relatedISOStandards: ['ISO 14001:2015'], isMandatory: true, applicableTo: ['manufacturing', 'construction'],
      },
      {
        shortCode: 'ACA-KH', title: 'Anti-Corruption Law (2010)', jurisdiction: 'Cambodia', category: 'ANTI_CORRUPTION',
        summary: 'Establishes ACU and criminalises corruption.',
        keyRequirements: ['Anti-corruption declaration', 'Gift prohibition', 'Conflict of interest declaration'],
        officialUrl: 'https://www.anticorruption.gov.kh',
        relatedISOStandards: ['ISO 37001:2016'], isMandatory: false, applicableTo: ['all'],
      },
      {
        shortCode: 'LSSOH-KH', title: 'Law on Social Security Schemes (2002)', jurisdiction: 'Cambodia', category: 'EMPLOYMENT',
        summary: 'Establishes National Social Security Fund covering occupational risks and health.',
        keyRequirements: ['NSSF registration for all employees', 'Monthly contributions', 'Workplace injury insurance'],
        officialUrl: 'https://www.nssf.gov.kh',
        relatedISOStandards: ['ISO 45001:2018'], isMandatory: true, applicableTo: ['all'],
      },
    ],
    regulatoryBodies: [
      { name: 'Ministry of Labour and Vocational Training', acronym: 'MLVT', website: 'https://www.mlvt.gov.kh', jurisdiction: ['EMPLOYMENT', 'HSE'] },
      { name: 'Ministry of Environment', acronym: 'MoE-KH', website: 'https://www.moe.gov.kh', jurisdiction: ['ENVIRONMENT'] },
      { name: 'Anti-Corruption Unit', acronym: 'ACU', website: 'https://www.anticorruption.gov.kh', jurisdiction: ['ANTI_CORRUPTION'] },
    ],
    reportingRequirements: ['MoC company annual return', 'GDT tax returns', 'NSSF monthly contributions', 'NBC banking reports', 'CSX disclosures (listed)'],
    auditRequirements: 'Mandatory for large enterprises and foreign-invested companies',
  },
  isoContext: {
    adoptedStandards: [
      { standard: 'ISO 9001:2015', adoptionStatus: 'ADOPTED', certificationBodies: ['Bureau Veritas', 'SGS', 'Intertek'], notes: 'Adoption growing in garment and tourism sectors' },
      { standard: 'ISO 14001:2015', adoptionStatus: 'ADOPTED', certificationBodies: ['Bureau Veritas', 'SGS'], notes: 'Limited but growing adoption' },
      { standard: 'ISO 45001:2018', adoptionStatus: 'ADOPTED', certificationBodies: ['Bureau Veritas', 'SGS'], notes: 'Required by major international buyers in garment sector' },
    ],
    certificationBodies: ['Bureau Veritas Cambodia', 'SGS Cambodia', 'Intertek'],
    accreditationBody: 'Cambodian Institute of Standards (ISC)',
    notes: 'Cambodia is in early stages of ISO adoption. ISC is under Ministry of Industry.',
  },
  compliance: {
    mandatoryReporting: ['MoC annual return', 'GDT tax filings', 'NSSF monthly reports', 'NBC prudential reports (banks)'],
    esgRequirements: 'No mandatory ESG framework; growing voluntary adoption among export-oriented businesses.',
    sustainabilityFrameworks: ['GRI Standards (voluntary)', 'SDGs'],
    dataProtectionAuthority: 'Ministry of Interior (limited data protection framework)',
    dataRetentionYears: 5,
    crossBorderDataTransfer: 'No specific framework',
    whistleblowerProtection: false,
    modernSlaveryAct: false,
    dueDiligenceRequirements: 'International buyers require social compliance audits; no domestic legal requirement',
  },
  business: {
    companyTypes: ['Private Limited Company', 'Public Limited Company', 'Sole Proprietorship', 'Partnership', 'Branch Office'],
    minShareCapital: 4000000,
    incorporationTime: '3-5 business days',
    businessRegistrationBody: 'Ministry of Commerce (MoC)',
    easeOfDoingBusinessRank: 144,
    freeTradeZones: ['Phnom Penh SEZ', 'Sihanoukville SEZ', 'Manhattan SEZ'],
    importDutyFramework: 'Varied tariff rates. ASEAN ATIGA applies. SEZ companies enjoy preferential rates.',
    exportControls: ['Ministry of Commerce export licensing', 'Restricted goods list'],
    ipProtectionRating: 'Low-Moderate — DIP registration available',
    corruptionPerceptionsIndex: 23,
  },
};
