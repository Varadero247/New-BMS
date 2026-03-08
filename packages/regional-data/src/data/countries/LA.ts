// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { CountryData } from '../../types/region.types';

export const LA: CountryData = {
  code: 'LA',
  name: 'Laos (Lao PDR)',
  region: 'ASEAN',
  currency: 'LAK',
  currencySymbol: '₭',
  locale: 'lo-LA',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'Asia/Vientiane',
  gstRate: 10,
  taxSystem: 'VAT',
  phonePrefix: '+856',
  tradeAgreements: ['ASEAN-FTA', 'RCEP'],
  legislation: [
    {
      shortCode: 'DICT-DECREE',
      title: 'Decree on Information and Communication Technology',
      category: 'INFORMATION_SECURITY',
      governingBody: 'Ministry of Information, Culture and Tourism (MICT)',
      relevantIsoStds: ['ISO/IEC 27001'],
      isMandatory: true,
      officialUrl: 'https://www.mict.gov.la',
      description: 'Regulates the use of information and communication technologies in Laos, including electronic communications, digital signatures, and cybersecurity requirements.',
      effectiveDate: '2017-01-01',
      complianceNotes: 'ICT businesses must obtain operating licences from MICT. Electronic signatures have legal validity for commercial transactions.',
    },
    {
      shortCode: 'LABOUR-LAW-LA',
      title: 'Labour Law 2013',
      category: 'EMPLOYMENT',
      governingBody: 'Ministry of Labour and Social Welfare (MoLSW)',
      relevantIsoStds: [],
      isMandatory: true,
      officialUrl: 'https://www.molsw.gov.la',
      description: 'Governs employment relationships, working conditions, occupational safety and health, social security, and labour dispute resolution in Laos.',
      effectiveDate: '2013-12-18',
      penaltyInfo: 'Fines for non-compliance with minimum wage and working conditions requirements.',
      complianceNotes: 'Labour contracts required for all employees. Enterprises with 10 or more employees must establish internal labour regulations.',
    },
  ],
  financialRules: [
    {
      ruleType: 'VAT',
      name: 'Value Added Tax',
      rate: 10,
      governingBody: 'Tax Department',
      filingFrequency: 'Monthly',
      filingDeadline: '15th of following month',
      officialUrl: 'https://www.tax.gov.la',
      description: 'VAT at 10% on goods and services. Businesses with annual revenue exceeding LAK 400 million must register for VAT.',
      effectiveFrom: '2009-01-01',
    },
    {
      ruleType: 'CORPORATE_TAX',
      name: 'Profit Tax',
      rate: 24,
      governingBody: 'Tax Department',
      filingFrequency: 'Annual',
      filingDeadline: '31 March',
      officialUrl: 'https://www.tax.gov.la',
      description: 'Profit tax at 24% for standard enterprises; 20% for small and medium enterprises; reduced rates for promoted enterprises in special economic zones.',
    },
  ],
};
