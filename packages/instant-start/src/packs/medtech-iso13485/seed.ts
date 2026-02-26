// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { PackSection } from '../../types';

export const sections: PackSection[] = [
  {
    name: 'Risk Categories',
    type: 'riskCategories',
    items: [
      { key: 'patient-safety', data: { name: 'Patient Safety Risk', description: 'Device failure causing patient harm, death, or injury', likelihood: 2, impact: 5, category: 'PATIENT_SAFETY' } },
      { key: 'design-validation', data: { name: 'Design Validation Failure', description: 'Device does not meet intended use or clinical performance', likelihood: 2, impact: 5, category: 'QUALITY' } },
      { key: 'sterility-breach', data: { name: 'Sterility / Biocompatibility', description: 'Sterile barrier failure or cytotoxic material risk', likelihood: 2, impact: 5, category: 'QUALITY' } },
      { key: 'software-failure', data: { name: 'Software / SaMD Failure', description: 'Critical software error in device or Software as a Medical Device', likelihood: 2, impact: 5, category: 'QUALITY' } },
      { key: 'labelling-error', data: { name: 'Labelling / IFU Error', description: 'Incorrect or missing labelling leading to misuse', likelihood: 2, impact: 4, category: 'REGULATORY' } },
      { key: 'supply-chain-quality', data: { name: 'Supply Chain Quality', description: 'Component or raw material non-conformance', likelihood: 3, impact: 4, category: 'SUPPLY_CHAIN' } },
      { key: 'regulatory-approval', data: { name: 'Regulatory Approval Risk', description: 'Delay or refusal of notified body certification or FDA clearance', likelihood: 2, impact: 4, category: 'REGULATORY' } },
      { key: 'post-market-surveillance', data: { name: 'Post-Market Surveillance Gap', description: 'Failure to detect field issues through PMS/PMCF', likelihood: 2, impact: 4, category: 'REGULATORY' } },
    ],
  },
  {
    name: 'Document Types',
    type: 'documentTypes',
    items: [
      { key: 'dhr', data: { name: 'Device History Record (DHR)', code: 'DHR', retention: 15, approvalRequired: true } },
      { key: 'dmr', data: { name: 'Device Master Record (DMR)', code: 'DMR', retention: 15, approvalRequired: true } },
      { key: 'design-history-file', data: { name: 'Design History File (DHF)', code: 'DHF', retention: 15, approvalRequired: true } },
      { key: 'risk-management-file', data: { name: 'Risk Management File (ISO 14971)', code: 'RMF', retention: 15, approvalRequired: true } },
      { key: 'technical-file', data: { name: 'Technical File / Dossier', code: 'TF', retention: 15, approvalRequired: true } },
      { key: 'clinical-evaluation', data: { name: 'Clinical Evaluation Report (CER)', code: 'CER', retention: 10, approvalRequired: true } },
      { key: 'pms-plan', data: { name: 'Post-Market Surveillance Plan', code: 'PMSP', retention: 10, approvalRequired: true } },
      { key: 'complaint-report', data: { name: 'Complaint / Vigilance Report', code: 'CVR', retention: 10, approvalRequired: true } },
      { key: 'capa', data: { name: 'CAPA Record', code: 'CAPA', retention: 7, approvalRequired: true } },
      { key: 'validation-protocol', data: { name: 'Validation Protocol / Report', code: 'VAL', retention: 10, approvalRequired: true } },
    ],
  },
  {
    name: 'KPIs',
    type: 'kpis',
    items: [
      { key: 'mdr-complaints', data: { name: 'MDR-Reportable Complaints', unit: 'count', target: 0, direction: 'lower_better', frequency: 'MONTHLY' } },
      { key: 'capa-closure', data: { name: 'CAPA On-Time Closure', unit: '%', target: 95, direction: 'higher_better', frequency: 'MONTHLY' } },
      { key: 'audit-findings', data: { name: 'Audit Major Findings', unit: 'count', target: 0, direction: 'lower_better', frequency: 'QUARTERLY' } },
      { key: 'complaint-response', data: { name: 'Complaint Initial Response Time', unit: 'days', target: 3, direction: 'lower_better', frequency: 'MONTHLY' } },
      { key: 'device-nonconformance', data: { name: 'Device Nonconformance Rate', unit: 'ppm', target: 500, direction: 'lower_better', frequency: 'MONTHLY' } },
    ],
  },
];
