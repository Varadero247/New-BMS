// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { RegionConfig } from '../types/region-config.types';

export const mm: RegionConfig = {
  countryCode: 'MM',
  countryName: 'Myanmar',
  region: 'ASEAN',
  tier: 2,
  currency: { code: 'MMK', symbol: 'K', name: 'Myanmar Kyat', decimals: 0, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.' },
  dateFormat: 'DD/MM/YYYY',
  numberFormat: { thousandsSeparator: ',', decimalSeparator: '.', grouping: 3 },
  timezone: ['Asia/Rangoon'],
  languages: [
    { code: 'my', name: 'Burmese', isOfficial: true, isPrimary: true, script: 'Mymr' },
  ],
  finance: {
    corporateTaxRate: 0.22,
    gstVatRate: 0.05,
    gstVatName: 'Commercial Tax',
    gstVatRegistrationThreshold: 50000000,
    witholdingTaxRates: { dividends: 0.15, interest: 0.15, royalties: 0.15, services: 0.02 },
    payrollTax: { employeeRate: 0.02, employerRate: 0.03, name: 'Social Security', ceiling: undefined },
    transferPricingRules: false,
    thinCapitalisationRules: false,
    taxTreatyNetwork: ['SG', 'IN', 'MY', 'TH', 'VN', 'KR', 'GB', 'US'],
    fiscalYearEnd: 'Sep 30',
    filingDeadlines: { corporateTax: 'Dec 31 (3 months after FY end)', gstVat: 'Monthly (10th)', employeeTax: 'Dec 31' },
  },
  legislation: {
    primaryLaws: [
      {
        shortCode: 'LA-MM', title: 'Labour Organizations Law (2011) and related labour legislation', jurisdiction: 'Myanmar', category: 'EMPLOYMENT',
        summary: 'Framework for labour relations including the right to organise, work conditions, and wages.',
        keyRequirements: ['Minimum wage compliance', 'Working hours (44 hours/week)', 'Annual leave', 'Social security registration', 'Dispute resolution'],
        effectiveDate: '2011-10-11', lastAmended: '2021-01-01',
        officialUrl: 'https://www.mol.gov.mm',
        relatedISOStandards: ['ISO 45001:2018'], isMandatory: true, applicableTo: ['all'],
      },
      {
        shortCode: 'OSHA-MM', title: 'Factories Act (Chapter 277) and Oilfields Act', jurisdiction: 'Myanmar', category: 'HSE',
        summary: 'Safety and health regulations for factories and industrial establishments.',
        keyRequirements: ['Factory registration', 'Safety measures', 'Accident reporting', 'Medical provisions'],
        effectiveDate: '1951-01-01', lastAmended: '2021-01-01',
        officialUrl: 'https://www.mol.gov.mm',
        relatedISOStandards: ['ISO 45001:2018'], isMandatory: true, applicableTo: ['manufacturing', 'construction'],
      },
      {
        shortCode: 'EPL-MM', title: 'Environmental Conservation Law (2012)', jurisdiction: 'Myanmar', category: 'ENVIRONMENT',
        summary: 'Framework for environmental conservation and EIA requirements.',
        keyRequirements: ['Environmental Impact Assessment', 'Environmental compliance plan', 'Pollution control', 'Environmental permit'],
        effectiveDate: '2012-03-30', lastAmended: '2019-01-01',
        relatedISOStandards: ['ISO 14001:2015'], isMandatory: true, applicableTo: ['manufacturing', 'construction'],
      },
      {
        shortCode: 'ACL-MM', title: 'Anti-Corruption Law (2013)', jurisdiction: 'Myanmar', category: 'ANTI_CORRUPTION',
        summary: 'Establishes the Anti-Corruption Commission and defines corruption offences.',
        keyRequirements: ['Anti-corruption management system', 'Asset declaration for government employees', 'Zero tolerance policy'],
        relatedISOStandards: ['ISO 37001:2016'], isMandatory: false, applicableTo: ['all'],
      },
    ],
    regulatoryBodies: [
      { name: 'Ministry of Labour', acronym: 'MoL-MM', website: 'https://www.mol.gov.mm', jurisdiction: ['EMPLOYMENT', 'HSE'] },
      { name: 'Environmental Conservation Department', acronym: 'ECD', website: 'https://www.ecd.gov.mm', jurisdiction: ['ENVIRONMENT'] },
      { name: 'Myanmar Investment Commission', acronym: 'MIC', website: 'https://www.mic.gov.mm', jurisdiction: ['CORPORATE'] },
    ],
    reportingRequirements: ['DICA company annual return', 'IRD tax returns', 'MIC reporting (FDI companies)', 'ECD environmental compliance'],
    auditRequirements: 'Mandatory for public companies and foreign-invested enterprises',
  },
  isoContext: {
    adoptedStandards: [
      { standard: 'ISO 9001:2015', adoptionStatus: 'ADOPTED', certificationBodies: ['Bureau Veritas', 'SGS', 'Intertek'], notes: 'Growing adoption among export-oriented manufacturers' },
      { standard: 'ISO 14001:2015', adoptionStatus: 'ADOPTED', certificationBodies: ['Bureau Veritas', 'SGS'], notes: 'Required by some international buyers' },
      { standard: 'ISO 45001:2018', adoptionStatus: 'ADOPTED', certificationBodies: ['Bureau Veritas', 'SGS'], notes: 'Growing in garment and construction sectors' },
    ],
    certificationBodies: ['Bureau Veritas Myanmar', 'SGS Myanmar', 'Intertek'],
    accreditationBody: 'Myanmar Accreditation Body (MAB) — in development',
    notes: 'Myanmar is in early stages of ISO adoption. International certification bodies operate locally.',
  },
  compliance: {
    mandatoryReporting: ['DICA annual company return', 'IRD tax filings', 'Social Security Board monthly contributions', 'MIC quarterly reports (MIC-permitted companies)'],
    esgRequirements: 'No mandatory ESG reporting framework; international investors apply their own standards.',
    sustainabilityFrameworks: ['GRI Standards (voluntary)', 'SDGs'],
    dataProtectionAuthority: 'No dedicated authority; Ministry of Transport and Communications oversees ICT',
    dataRetentionYears: 5,
    crossBorderDataTransfer: 'No specific framework; governed by contract',
    whistleblowerProtection: false,
    modernSlaveryAct: false,
    dueDiligenceRequirements: 'High ESG risk jurisdiction; international buyers require supply chain audits',
  },
  business: {
    companyTypes: ['Private Limited Company', 'Public Company', 'Branch Office', 'Representative Office'],
    minShareCapital: 1000000,
    incorporationTime: '5-10 business days',
    businessRegistrationBody: 'Directorate of Investment and Company Administration (DICA)',
    easeOfDoingBusinessRank: 165,
    freeTradeZones: ['Thilawa SEZ', 'Kyaukphyu SEZ', 'Dawei SEZ'],
    importDutyFramework: 'Varied tariff rates (0-40%). ASEAN ATIGA preferential rates apply with limitations.',
    exportControls: ['Export/Import licensing requirements', 'Restricted goods list'],
    ipProtectionRating: 'Low — enforcement limited',
    corruptionPerceptionsIndex: 23,
  },
};
