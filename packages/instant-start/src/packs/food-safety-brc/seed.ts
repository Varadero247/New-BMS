// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { PackSection } from '../../types';

export const sections: PackSection[] = [
  {
    name: 'Risk Categories',
    type: 'riskCategories',
    items: [
      { key: 'microbiological-contamination', data: { name: 'Microbiological Contamination', description: 'Pathogen contamination (Listeria, Salmonella, E.coli) in product', likelihood: 2, impact: 5, category: 'FOOD_SAFETY' } },
      { key: 'allergen-cross-contact', data: { name: 'Allergen Cross-Contact', description: 'Undeclared allergen contamination causing customer harm', likelihood: 3, impact: 5, category: 'FOOD_SAFETY' } },
      { key: 'foreign-body', data: { name: 'Foreign Body Contamination', description: 'Physical contamination from glass, metal, plastic, or bone', likelihood: 2, impact: 4, category: 'FOOD_SAFETY' } },
      { key: 'chemical-contamination', data: { name: 'Chemical Contamination', description: 'Pesticide residue, cleaning agent, or process chemical contamination', likelihood: 2, impact: 4, category: 'FOOD_SAFETY' } },
      { key: 'labelling-failure', data: { name: 'Labelling / Allergen Declaration', description: 'Incorrect allergen labelling or missing mandatory information', likelihood: 2, impact: 5, category: 'REGULATORY' } },
      { key: 'supplier-quality', data: { name: 'Ingredient / Supplier Quality', description: 'Raw material or ingredient fails specification or authenticity test', likelihood: 3, impact: 4, category: 'SUPPLY_CHAIN' } },
      { key: 'cold-chain-break', data: { name: 'Cold Chain Failure', description: 'Temperature excursion during storage or transport', likelihood: 2, impact: 4, category: 'OPERATIONAL' } },
      { key: 'food-fraud', data: { name: 'Food Fraud (VACCP)', description: 'Economically motivated adulteration or substitution of ingredients', likelihood: 1, impact: 4, category: 'FOOD_SAFETY' } },
    ],
  },
  {
    name: 'Document Types',
    type: 'documentTypes',
    items: [
      { key: 'haccp-plan', data: { name: 'HACCP Plan', code: 'HACCP', retention: 7, approvalRequired: true } },
      { key: 'prp', data: { name: 'Prerequisite Programme (PRP)', code: 'PRP', retention: 5, approvalRequired: true } },
      { key: 'allergen-matrix', data: { name: 'Allergen Matrix / Risk Assessment', code: 'ALG', retention: 5, approvalRequired: true } },
      { key: 'cleaning-schedule', data: { name: 'Cleaning & Disinfection Schedule', code: 'CDS', retention: 2, approvalRequired: false } },
      { key: 'product-spec', data: { name: 'Product Specification', code: 'PSP', retention: 5, approvalRequired: true } },
      { key: 'traceability-test', data: { name: 'Traceability Exercise Record', code: 'TER', retention: 3, approvalRequired: false } },
      { key: 'recall-procedure', data: { name: 'Withdrawal / Recall Procedure', code: 'RCP', retention: 7, approvalRequired: true } },
      { key: 'environmental-monitoring', data: { name: 'Environmental Monitoring Programme', code: 'EMP', retention: 3, approvalRequired: true } },
    ],
  },
  {
    name: 'KPIs',
    type: 'kpis',
    items: [
      { key: 'customer-complaints', data: { name: 'Customer Complaints per 1M Units', unit: 'per 1M', target: 50, direction: 'lower_better', frequency: 'MONTHLY' } },
      { key: 'audit-grade', data: { name: 'BRCGS Audit Grade', unit: 'grade', target: 100, direction: 'higher_better', frequency: 'ANNUAL' } },
      { key: 'ccp-deviation', data: { name: 'CCP Deviations', unit: 'count', target: 0, direction: 'lower_better', frequency: 'MONTHLY' } },
      { key: 'traceability-time', data: { name: 'Traceability Exercise Time', unit: 'hours', target: 4, direction: 'lower_better', frequency: 'QUARTERLY' } },
      { key: 'pest-sightings', data: { name: 'Pest Sightings (Internal)', unit: 'count', target: 0, direction: 'lower_better', frequency: 'MONTHLY' } },
    ],
  },
];
