// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { CountryData } from '../../types/region.types';

export const KH: CountryData = {
  code: 'KH',
  name: 'Cambodia',
  region: 'ASEAN',
  currency: 'KHR',
  currencySymbol: '៛',
  locale: 'km-KH',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'Asia/Phnom_Penh',
  gstRate: 10,
  taxSystem: 'VAT',
  phonePrefix: '+855',
  tradeAgreements: ['ASEAN-FTA', 'RCEP'],
  legislation: [
    {
      shortCode: 'PDPA-KH-DRAFT',
      title: 'Law on Personal Data Protection (Draft)',
      category: 'DATA_PRIVACY',
      governingBody: 'Ministry of Posts and Telecommunications (MPTC)',
      relevantIsoStds: ['ISO/IEC 27001'],
      isMandatory: false,
      officialUrl: 'https://www.mptc.gov.kh',
      description: 'Draft personal data protection law establishing framework for data protection in Cambodia. Currently under legislative review; organisations are advised to prepare for compliance.',
      complianceNotes: 'Currently a draft; organisations should monitor for enactment. Best practice to align with existing ASEAN data protection frameworks.',
    },
    {
      shortCode: 'LABOUR-LAW-KH',
      title: 'Labour Law 1997',
      category: 'EMPLOYMENT',
      governingBody: 'Ministry of Labour and Vocational Training (MoLVT)',
      relevantIsoStds: [],
      isMandatory: true,
      officialUrl: 'https://www.mlvt.gov.kh',
      description: 'Primary labour legislation governing employment conditions, occupational health and safety, trade unions, collective agreements, and labour disputes in Cambodia.',
      effectiveDate: '1997-03-13',
      lastAmended: '2018-01-01',
      penaltyInfo: 'Fines of KHR 61,000 to KHR 3 million for various violations.',
      complianceNotes: 'National Social Security Fund contributions required. Workplace rules required for enterprises with 8 or more employees.',
    },
  ],
  financialRules: [
    {
      ruleType: 'VAT',
      name: 'Value Added Tax',
      rate: 10,
      governingBody: 'General Department of Taxation (GDT)',
      filingFrequency: 'Monthly',
      filingDeadline: '20th of following month',
      thresholdAmount: 125000000,
      thresholdCurrency: 'KHR',
      officialUrl: 'https://www.tax.gov.kh',
      description: 'VAT at 10% on taxable supplies of goods and services. Monthly filing for registered taxpayers. Zero-rated for exports.',
      effectiveFrom: '1999-01-01',
    },
    {
      ruleType: 'CORPORATE_TAX',
      name: 'Tax on Income (TOI)',
      rate: 20,
      governingBody: 'General Department of Taxation (GDT)',
      filingFrequency: 'Annual',
      filingDeadline: '31 March',
      officialUrl: 'https://www.tax.gov.kh',
      description: 'Tax on profit at 20% standard rate. Qualified Investment Projects may receive preferential rates and income tax holidays.',
    },
  ],
};
