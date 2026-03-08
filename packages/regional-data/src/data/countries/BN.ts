// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { CountryData } from '../../types/region.types';

export const BN: CountryData = {
  code: 'BN',
  name: 'Brunei Darussalam',
  region: 'ASEAN',
  currency: 'BND',
  currencySymbol: 'B$',
  locale: 'ms-BN',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'Asia/Brunei',
  gstRate: undefined,
  taxSystem: 'None',
  phonePrefix: '+673',
  tradeAgreements: ['ASEAN-FTA', 'CPTPP'],
  legislation: [
    {
      shortCode: 'DPO-2023',
      title: 'Personal Data Protection Order 2023',
      category: 'DATA_PRIVACY',
      governingBody: 'Authority for Info-communications Technology Industry of Brunei Darussalam (AITI)',
      relevantIsoStds: ['ISO/IEC 27001', 'ISO/IEC 27701'],
      isMandatory: true,
      officialUrl: 'https://www.aiti.gov.bn',
      description: 'Establishes a comprehensive framework for the protection of personal data in Brunei. Sets obligations for data controllers and processors, and rights for data subjects.',
      effectiveDate: '2023-01-01',
      penaltyInfo: 'Fines up to BND 100,000 and/or imprisonment up to 3 years for serious offences.',
      complianceNotes: 'Organisations must notify AITI of data breaches within 72 hours. Data Protection Officer appointment required for organisations processing large volumes of data.',
    },
    {
      shortCode: 'FACTORIES-ACT-BN',
      title: 'Factories Act (Chapter 139)',
      category: 'WORKPLACE_SAFETY',
      governingBody: 'Department of Labour',
      relevantIsoStds: ['ISO 45001'],
      isMandatory: true,
      officialUrl: 'https://www.labour.gov.bn',
      description: 'Provides for health, safety, and welfare at work in Brunei. Covers registration of factories, inspection requirements, and safety provisions for machinery and equipment.',
      effectiveDate: '1956-01-01',
      lastAmended: '2004-01-01',
      penaltyInfo: 'Fines up to BND 5,000 and/or imprisonment up to 6 months for contraventions.',
      complianceNotes: 'Factory registration required before commencement of operations. Annual inspection by Department of Labour required.',
    },
  ],
  financialRules: [
    {
      ruleType: 'CORPORATE_TAX',
      name: 'Corporate Income Tax',
      rate: 18.5,
      governingBody: 'Ministry of Finance and Economy (MOFE)',
      filingFrequency: 'Annual',
      filingDeadline: '30 September',
      officialUrl: 'https://www.finance.gov.bn',
      description: 'Corporate tax at 18.5% on chargeable income. No GST or VAT in Brunei. No personal income tax. Petroleum operations taxed separately at 55%.',
    },
  ],
};
