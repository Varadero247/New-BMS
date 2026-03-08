// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { RegionConfig } from '../types/region-config.types';

export const la: RegionConfig = {
  countryCode: 'LA',
  countryName: 'Laos',
  region: 'ASEAN',
  tier: 2,
  currency: { code: 'LAK', symbol: '₭', name: 'Lao Kip', decimals: 0, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.' },
  dateFormat: 'DD/MM/YYYY',
  numberFormat: { thousandsSeparator: ',', decimalSeparator: '.', grouping: 3 },
  timezone: ['Asia/Vientiane'],
  languages: [
    { code: 'lo', name: 'Lao', isOfficial: true, isPrimary: true, script: 'Laoo' },
    { code: 'en-LA', name: 'English', isOfficial: false, isPrimary: false, script: 'Latn' },
  ],
  finance: {
    corporateTaxRate: 0.24,
    gstVatRate: 0.10,
    gstVatName: 'VAT',
    gstVatRegistrationThreshold: 400000000,
    witholdingTaxRates: { dividends: 0.10, interest: 0.10, royalties: 0.10, services: 0.05 },
    payrollTax: { employeeRate: 0.055, employerRate: 0.06, name: 'Social Security', ceiling: undefined },
    transferPricingRules: false,
    thinCapitalisationRules: false,
    taxTreatyNetwork: ['VN', 'TH', 'CN', 'MY', 'SG', 'KR', 'LU'],
    fiscalYearEnd: 'Dec 31',
    filingDeadlines: { corporateTax: 'Mar 31', gstVat: 'Monthly (15th)', employeeTax: 'Mar 31' },
  },
  legislation: {
    primaryLaws: [
      {
        shortCode: 'LL-LA', title: 'Labour Law (2013 as amended)', jurisdiction: 'Laos', category: 'EMPLOYMENT',
        summary: 'Primary labour legislation governing employment conditions and industrial relations.',
        keyRequirements: ['Employment contracts', '8-hour workday / 48-hour week', 'Annual leave (15 days)', 'Social security registration', 'Minimum wage compliance'],
        effectiveDate: '2014-05-14', lastAmended: '2021-01-01',
        officialUrl: 'https://www.mlsw.gov.la',
        relatedISOStandards: ['ISO 45001:2018'], isMandatory: true, applicableTo: ['all'],
      },
      {
        shortCode: 'EPL-LA', title: 'Law on Environmental Protection (2012)', jurisdiction: 'Laos', category: 'ENVIRONMENT',
        summary: 'Framework for environmental protection and EIA requirements.',
        keyRequirements: ['Environmental Impact Assessment', 'Initial Environmental Examination', 'Environmental compliance', 'Pollution control'],
        effectiveDate: '2012-12-18', lastAmended: '2021-01-01',
        officialUrl: 'https://www.monre.gov.la',
        relatedISOStandards: ['ISO 14001:2015'], isMandatory: true, applicableTo: ['manufacturing', 'construction'],
      },
      {
        shortCode: 'ACL-LA', title: 'Anti-Corruption Law (2012)', jurisdiction: 'Laos', category: 'ANTI_CORRUPTION',
        summary: 'Establishes framework for preventing and combating corruption.',
        keyRequirements: ['Anti-corruption measures', 'Asset disclosure for officials', 'Prohibition of bribery'],
        relatedISOStandards: ['ISO 37001:2016'], isMandatory: false, applicableTo: ['all'],
      },
      {
        shortCode: 'LT-LA', title: 'Law on Tax (2015)', jurisdiction: 'Laos', category: 'FINANCIAL',
        summary: 'Comprehensive tax law covering corporate income tax, VAT, and withholding tax.',
        keyRequirements: ['Tax registration', 'Proper bookkeeping', 'Tax return filing', 'VAT compliance'],
        relatedISOStandards: [], isMandatory: true, applicableTo: ['all'],
      },
    ],
    regulatoryBodies: [
      { name: 'Ministry of Labour and Social Welfare', acronym: 'MLSW', website: 'https://www.mlsw.gov.la', jurisdiction: ['EMPLOYMENT', 'HSE'] },
      { name: 'Ministry of Natural Resources and Environment', acronym: 'MONRE', website: 'https://www.monre.gov.la', jurisdiction: ['ENVIRONMENT'] },
      { name: 'Ministry of Planning and Investment', acronym: 'MPI', website: 'https://www.mpi.gov.la', jurisdiction: ['CORPORATE'] },
    ],
    reportingRequirements: ['MPI enterprise annual report', 'Tax Department filings', 'MLSW labour reports', 'BCEL banking reports (financial)'],
    auditRequirements: 'Mandatory for large enterprises and foreign-invested companies',
  },
  isoContext: {
    adoptedStandards: [
      { standard: 'ISO 9001:2015', adoptionStatus: 'ADOPTED', certificationBodies: ['Bureau Veritas', 'SGS'], notes: 'Limited adoption; growing in export-oriented sectors' },
      { standard: 'ISO 14001:2015', adoptionStatus: 'ADOPTED', certificationBodies: ['Bureau Veritas', 'SGS'], notes: 'Growing adoption in mining and hydropower sectors' },
    ],
    certificationBodies: ['Bureau Veritas', 'SGS'],
    accreditationBody: 'Lao National Standards (LNS) — in development',
    notes: 'Laos has limited ISO adoption. International certification bodies operate in the country.',
  },
  compliance: {
    mandatoryReporting: ['Enterprise Registration Certificate renewal', 'Tax Department annual returns', 'MLSW labour utilisation reports', 'Bank of Lao PDR financial sector reporting'],
    esgRequirements: 'No mandatory ESG framework; growing awareness among export-oriented and hydro-power companies.',
    sustainabilityFrameworks: ['GRI Standards (voluntary)', 'SDGs'],
    dataProtectionAuthority: 'Ministry of Posts, Telecom and Communication (limited framework)',
    dataRetentionYears: 5,
    crossBorderDataTransfer: 'No specific framework; governed by contract',
    whistleblowerProtection: false,
    modernSlaveryAct: false,
    dueDiligenceRequirements: 'No domestic requirement; international partners may require ESG due diligence',
  },
  business: {
    companyTypes: ['Private Limited Company', 'Public Company', 'Sole Proprietorship', 'Partnership', 'Branch Office'],
    minShareCapital: 1000000,
    incorporationTime: '5-10 business days',
    businessRegistrationBody: 'Ministry of Industry and Commerce (MOIC)',
    easeOfDoingBusinessRank: 154,
    freeTradeZones: ['Savan-Seno SEZ', 'Golden Triangle SEZ', 'Boten Beautiful Land SEZ', 'Vientiane Industrial and Trade Area Zone'],
    importDutyFramework: 'Varied tariff rates. ASEAN ATIGA applies. SEZ investors enjoy duty and tax exemptions.',
    exportControls: ['Ministry of Industry and Commerce licensing'],
    ipProtectionRating: 'Low — limited IP enforcement',
    corruptionPerceptionsIndex: 31,
  },
};
