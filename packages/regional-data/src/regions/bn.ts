// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { RegionConfig } from '../types/region-config.types';

export const bn: RegionConfig = {
  countryCode: 'BN',
  countryName: 'Brunei',
  region: 'ASEAN',
  tier: 2,
  currency: { code: 'BND', symbol: 'B$', name: 'Brunei Dollar', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.' },
  dateFormat: 'DD/MM/YYYY',
  numberFormat: { thousandsSeparator: ',', decimalSeparator: '.', grouping: 3 },
  timezone: ['Asia/Brunei'],
  languages: [
    { code: 'ms-BN', name: 'Malay', isOfficial: true, isPrimary: true, script: 'Latn' },
    { code: 'en-BN', name: 'English', isOfficial: false, isPrimary: false, script: 'Latn' },
    { code: 'zh-BN', name: 'Chinese', isOfficial: false, isPrimary: false, script: 'Hans' },
  ],
  finance: {
    corporateTaxRate: 0.185,
    gstVatRate: 0,
    gstVatName: 'No GST/VAT',
    witholdingTaxRates: { dividends: 0, interest: 0, royalties: 0, services: 0 },
    payrollTax: { employeeRate: 0.05, employerRate: 0.05, name: 'TAIB (Employees Trust Fund)', ceiling: undefined },
    transferPricingRules: false,
    thinCapitalisationRules: false,
    taxTreatyNetwork: ['SG', 'UK', 'ASEAN'],
    fiscalYearEnd: 'Dec 31',
    filingDeadlines: { corporateTax: 'Jun 30 (6 months after FY end)', gstVat: 'N/A', employeeTax: 'Apr 30' },
  },
  legislation: {
    primaryLaws: [
      {
        shortCode: 'EO-BN', title: 'Employment Order, 2009', jurisdiction: 'Brunei', category: 'EMPLOYMENT',
        summary: 'Primary employment legislation governing working conditions, wages, and leave.',
        keyRequirements: ['Written employment contracts', '8-hour workday / 48-hour week', 'Annual leave (minimum 7 days)', 'Sick leave', 'Public holiday entitlements', 'Overtime provisions'],
        effectiveDate: '2009-12-15', lastAmended: '2022-01-01',
        officialUrl: 'https://www.labour.gov.bn',
        relatedISOStandards: ['ISO 45001:2018'], isMandatory: true, applicableTo: ['all'],
      },
      {
        shortCode: 'WSHO-BN', title: 'Workplace Safety and Health Order, 2009', jurisdiction: 'Brunei', category: 'HSE',
        summary: 'Workplace safety and health legislation establishing duties for employers.',
        keyRequirements: ['Risk assessment', 'Safety management system', 'Incident reporting to JTK', 'Safety officer appointment', 'Medical surveillance'],
        effectiveDate: '2009-12-15', lastAmended: '2020-01-01',
        officialUrl: 'https://www.labour.gov.bn',
        relatedISOStandards: ['ISO 45001:2018'], isMandatory: true, applicableTo: ['all'],
      },
      {
        shortCode: 'EPC-BN', title: 'Environmental Protection and Conservation Order, 2016', jurisdiction: 'Brunei', category: 'ENVIRONMENT',
        summary: 'Comprehensive environmental protection legislation.',
        keyRequirements: ['EIA for prescribed activities', 'Environmental permit', 'Pollution control', 'Hazardous substance management'],
        effectiveDate: '2016-01-01', lastAmended: '2021-01-01',
        officialUrl: 'https://www.doe.gov.bn',
        relatedISOStandards: ['ISO 14001:2015'], isMandatory: true, applicableTo: ['manufacturing', 'construction'],
      },
      {
        shortCode: 'PCA-BN', title: 'Prevention of Corruption Act (Cap. 131)', jurisdiction: 'Brunei', category: 'ANTI_CORRUPTION',
        summary: 'Criminalises bribery and corruption in both public and private sectors.',
        keyRequirements: ['Zero tolerance anti-corruption policy', 'Gifts declaration', 'ACA reporting obligations'],
        officialUrl: 'https://www.aca.gov.bn',
        relatedISOStandards: ['ISO 37001:2016'], isMandatory: true, applicableTo: ['all'],
      },
    ],
    regulatoryBodies: [
      { name: 'Department of Labour', acronym: 'JTK', website: 'https://www.labour.gov.bn', jurisdiction: ['EMPLOYMENT', 'HSE'] },
      { name: 'Department of Environment, Parks and Recreation', acronym: 'JASTRe', website: 'https://www.doe.gov.bn', jurisdiction: ['ENVIRONMENT'] },
      { name: 'Anti-Corruption Bureau (Biro Mencegah Rasuah)', acronym: 'ACA', website: 'https://www.aca.gov.bn', jurisdiction: ['ANTI_CORRUPTION'] },
    ],
    reportingRequirements: ['ROCBN company annual return', 'IRB tax returns', 'Autoriti Monetari Brunei Darussalam (AMBD) reporting (financial)', 'Labour Department reporting'],
    auditRequirements: 'Mandatory for all Sdn Bhd companies annually',
  },
  isoContext: {
    adoptedStandards: [
      { standard: 'ISO 9001:2015', adoptionStatus: 'ADOPTED', certificationBodies: ['Bureau Veritas', 'SGS', 'TÜV Rheinland'], notes: 'Required for government suppliers; growing adoption in oil & gas sector' },
      { standard: 'ISO 14001:2015', adoptionStatus: 'ADOPTED', certificationBodies: ['Bureau Veritas', 'SGS'], notes: 'Growing in oil & gas and construction sectors' },
      { standard: 'ISO 45001:2018', adoptionStatus: 'ADOPTED', certificationBodies: ['Bureau Veritas', 'SGS', 'BSI'], mandatoryForSectors: ['construction', 'manufacturing'], notes: 'Aligned with WSHO 2009; common in oil & gas and construction' },
      { standard: 'ISO 37001:2016', adoptionStatus: 'ADOPTED', certificationBodies: ['BSI', 'Bureau Veritas'], notes: 'Growing adoption post-PCA enforcement' },
    ],
    certificationBodies: ['Bureau Veritas Brunei', 'SGS Brunei', 'TÜV Rheinland', 'BSI'],
    accreditationBody: 'Brunei Darussalam Accreditation Body (BDAB)',
    notes: 'Brunei adopts international ISO standards. BDAB is developing accreditation framework. Oil & gas sector has highest ISO adoption.',
  },
  compliance: {
    mandatoryReporting: ['ROCBN annual return', 'IRB corporate tax return', 'AMBD financial institution reports', 'Labour Department quarterly reports', 'JASTRe environmental returns'],
    esgRequirements: 'No mandatory ESG reporting framework; Brunei Vision 2035 promotes sustainability. Government and oil & gas sector lead voluntary adoption.',
    sustainabilityFrameworks: ['GRI Standards (voluntary)', 'Brunei Vision 2035', 'SDGs'],
    dataProtectionAuthority: 'No dedicated authority; evolving framework under Ministry of Transport and Infocommunications',
    dataRetentionYears: 5,
    crossBorderDataTransfer: 'No specific framework; governed by contract',
    whistleblowerProtection: true,
    modernSlaveryAct: false,
    dueDiligenceRequirements: 'No mandatory requirement; oil & gas sector applies international standards (e.g., Petroleum Sustainability Initiative)',
  },
  business: {
    companyTypes: ['Sendirian Berhad (Sdn Bhd)', 'Berhad (Bhd)', 'Sole Proprietorship', 'Partnership', 'Branch Office', 'Representative Office'],
    minShareCapital: 1,
    incorporationTime: '3-5 business days',
    businessRegistrationBody: 'Registry of Companies and Business Names (ROCBN)',
    easeOfDoingBusinessRank: 66,
    freeTradeZones: ['Muara Port FTZ', 'Sungai Tujoh FTZ', 'Brunei International Airport FTZ'],
    importDutyFramework: 'Very low tariff rates (average 3.5%). ASEAN ATIGA applies. No GST/VAT.',
    exportControls: ['Customs provisions', 'Strategic goods controls aligned with international agreements'],
    ipProtectionRating: 'Moderate — BRUNIPO provides protection',
    corruptionPerceptionsIndex: 60,
  },
};
