// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { PackSection } from '../../types';

export const sections: PackSection[] = [
  {
    name: 'Risk Categories',
    type: 'riskCategories',
    items: [
      { key: 'product-quality-failure', data: { name: 'Product Quality Failure', description: 'Nonconformance affecting product quality or customer specification', likelihood: 3, impact: 4, category: 'QUALITY' } },
      { key: 'process-failure', data: { name: 'Process Failure', description: 'Manufacturing process breakdown causing defects or scrap', likelihood: 3, impact: 3, category: 'OPERATIONAL' } },
      { key: 'supplier-quality', data: { name: 'Supplier Quality Issue', description: 'Incoming material or component fails to meet specification', likelihood: 2, impact: 4, category: 'SUPPLY_CHAIN' } },
      { key: 'equipment-failure', data: { name: 'Equipment / Tooling Failure', description: 'Machine or tooling breakdown affecting production', likelihood: 2, impact: 3, category: 'OPERATIONAL' } },
      { key: 'measurement-system-error', data: { name: 'Measurement System Error', description: 'Gauge or measurement system producing inaccurate results', likelihood: 2, impact: 3, category: 'QUALITY' } },
      { key: 'customer-complaint', data: { name: 'Customer Complaint / Return', description: 'Customer returns, warranty claim, or field failure', likelihood: 2, impact: 5, category: 'CUSTOMER' } },
      { key: 'regulatory-compliance', data: { name: 'Regulatory / REACH / RoHS', description: 'Non-compliance with automotive environmental or chemical regulations', likelihood: 1, impact: 5, category: 'REGULATORY' } },
      { key: 'counterfeit-parts', data: { name: 'Counterfeit / Suspect Parts', description: 'Suspect counterfeit components entering the supply chain', likelihood: 1, impact: 5, category: 'SUPPLY_CHAIN' } },
      { key: 'capacity-constraint', data: { name: 'Capacity Constraint', description: 'Production capacity insufficient to meet customer demand', likelihood: 2, impact: 3, category: 'OPERATIONAL' } },
      { key: 'engineering-change', data: { name: 'Engineering Change Control', description: 'Risk of uncontrolled engineering changes affecting quality', likelihood: 2, impact: 4, category: 'QUALITY' } },
    ],
  },
  {
    name: 'Document Types',
    type: 'documentTypes',
    items: [
      { key: 'control-plan', data: { name: 'Control Plan', code: 'CP', retention: 10, approvalRequired: true } },
      { key: 'pfmea', data: { name: 'Process FMEA', code: 'PFMEA', retention: 10, approvalRequired: true } },
      { key: 'dfmea', data: { name: 'Design FMEA', code: 'DFMEA', retention: 10, approvalRequired: true } },
      { key: 'ppap-submission', data: { name: 'PPAP Submission Package', code: 'PPAP', retention: 10, approvalRequired: true } },
      { key: 'apqp-plan', data: { name: 'APQP Plan', code: 'APQP', retention: 7, approvalRequired: true } },
      { key: 'spc-chart', data: { name: 'SPC Control Chart', code: 'SPC', retention: 5, approvalRequired: false } },
      { key: 'msa-report', data: { name: 'MSA / Gauge R&R Report', code: 'MSA', retention: 5, approvalRequired: true } },
      { key: 'process-flow', data: { name: 'Process Flow Diagram', code: 'PFD', retention: 10, approvalRequired: true } },
      { key: 'work-instruction', data: { name: 'Work Instruction', code: 'WI', retention: 5, approvalRequired: true } },
      { key: 'inspection-plan', data: { name: 'Inspection / Test Plan', code: 'ITP', retention: 5, approvalRequired: true } },
    ],
  },
  {
    name: 'KPIs',
    type: 'kpis',
    items: [
      { key: 'ppm', data: { name: 'PPM (Customer)', unit: 'ppm', target: 50, direction: 'lower_better', frequency: 'MONTHLY' } },
      { key: 'internal-ppm', data: { name: 'Internal PPM', unit: 'ppm', target: 500, direction: 'lower_better', frequency: 'MONTHLY' } },
      { key: 'otd', data: { name: 'On-Time Delivery', unit: '%', target: 98.5, direction: 'higher_better', frequency: 'MONTHLY' } },
      { key: 'first-pass-yield', data: { name: 'First Pass Yield', unit: '%', target: 97, direction: 'higher_better', frequency: 'WEEKLY' } },
      { key: 'scrap-rate', data: { name: 'Scrap Rate', unit: '%', target: 1.5, direction: 'lower_better', frequency: 'MONTHLY' } },
      { key: 'oee', data: { name: 'OEE', unit: '%', target: 85, direction: 'higher_better', frequency: 'WEEKLY' } },
      { key: 'warranty-ppm', data: { name: 'Warranty PPM', unit: 'ppm', target: 100, direction: 'lower_better', frequency: 'MONTHLY' } },
      { key: 'supplier-ppm', data: { name: 'Supplier PPM', unit: 'ppm', target: 1000, direction: 'lower_better', frequency: 'MONTHLY' } },
    ],
  },
  {
    name: 'Audit Checklists',
    type: 'auditChecklists',
    items: [
      { key: 'iatf-internal-audit', data: { name: 'IATF 16949 Internal Audit', standard: 'IATF 16949:2016', questionCount: 120, frequency: 'ANNUAL' } },
      { key: 'process-audit', data: { name: 'Process / VDA 6.3 Audit', standard: 'VDA 6.3', questionCount: 85, frequency: 'ANNUAL' } },
      { key: 'layered-process-audit', data: { name: 'Layered Process Audit (LPA)', standard: 'IATF 16949:2016', questionCount: 30, frequency: 'WEEKLY' } },
      { key: 'supplier-audit', data: { name: 'Supplier Quality Audit', standard: 'IATF 16949:2016', questionCount: 65, frequency: 'ANNUAL' } },
    ],
  },
];
