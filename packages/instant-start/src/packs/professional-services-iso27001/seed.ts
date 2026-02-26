// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { PackSection } from '../../types';

export const sections: PackSection[] = [
  {
    name: 'Risk Categories',
    type: 'riskCategories',
    items: [
      { key: 'data-breach', data: { name: 'Personal Data Breach', description: 'Unauthorised access to or disclosure of personal data', likelihood: 2, impact: 5, category: 'INFORMATION_SECURITY' } },
      { key: 'ransomware', data: { name: 'Ransomware / Malware Attack', description: 'Malicious software encrypting or destroying business data', likelihood: 3, impact: 5, category: 'CYBER' } },
      { key: 'phishing', data: { name: 'Phishing / Social Engineering', description: 'Credential theft via deceptive emails or calls', likelihood: 4, impact: 4, category: 'CYBER' } },
      { key: 'insider-threat', data: { name: 'Insider Threat', description: 'Malicious or accidental data exfiltration by employees or contractors', likelihood: 2, impact: 4, category: 'INFORMATION_SECURITY' } },
      { key: 'third-party-risk', data: { name: 'Third-Party / Supplier Risk', description: 'Data breach or service failure via supplier or sub-processor', likelihood: 3, impact: 4, category: 'SUPPLY_CHAIN' } },
      { key: 'availability-failure', data: { name: 'System Availability Failure', description: 'Cloud service outage or infrastructure failure affecting operations', likelihood: 2, impact: 3, category: 'OPERATIONAL' } },
      { key: 'gdpr-non-compliance', data: { name: 'GDPR Non-Compliance', description: 'Regulatory fine or enforcement action from data protection authority', likelihood: 2, impact: 5, category: 'REGULATORY' } },
      { key: 'privileged-access-abuse', data: { name: 'Privileged Access Abuse', description: 'Misuse of administrator or privileged system access', likelihood: 2, impact: 4, category: 'INFORMATION_SECURITY' } },
    ],
  },
  {
    name: 'Document Types',
    type: 'documentTypes',
    items: [
      { key: 'isms-policy', data: { name: 'Information Security Policy', code: 'ISP', retention: 5, approvalRequired: true } },
      { key: 'ropa', data: { name: 'Record of Processing Activities (RoPA)', code: 'ROPA', retention: 7, approvalRequired: true } },
      { key: 'dpia', data: { name: 'Data Protection Impact Assessment (DPIA)', code: 'DPIA', retention: 5, approvalRequired: true } },
      { key: 'bia', data: { name: 'Business Impact Analysis', code: 'BIA', retention: 5, approvalRequired: true } },
      { key: 'incident-report', data: { name: 'Security Incident Report', code: 'SIR', retention: 7, approvalRequired: true } },
      { key: 'soa', data: { name: 'Statement of Applicability (SoA)', code: 'SOA', retention: 10, approvalRequired: true } },
      { key: 'dpa', data: { name: 'Data Processing Agreement (DPA)', code: 'DPA', retention: 7, approvalRequired: true } },
      { key: 'vulnerability-assessment', data: { name: 'Vulnerability Assessment Report', code: 'VAR', retention: 3, approvalRequired: false } },
    ],
  },
  {
    name: 'KPIs',
    type: 'kpis',
    items: [
      { key: 'mean-time-to-detect', data: { name: 'Mean Time to Detect (MTTD)', unit: 'hours', target: 4, direction: 'lower_better', frequency: 'MONTHLY' } },
      { key: 'mean-time-to-respond', data: { name: 'Mean Time to Respond (MTTR)', unit: 'hours', target: 8, direction: 'lower_better', frequency: 'MONTHLY' } },
      { key: 'phishing-click-rate', data: { name: 'Phishing Simulation Click Rate', unit: '%', target: 5, direction: 'lower_better', frequency: 'QUARTERLY' } },
      { key: 'patch-compliance', data: { name: 'Critical Patch Compliance', unit: '%', target: 98, direction: 'higher_better', frequency: 'MONTHLY' } },
      { key: 'vulnerability-critical', data: { name: 'Unresolved Critical Vulnerabilities', unit: 'count', target: 0, direction: 'lower_better', frequency: 'WEEKLY' } },
      { key: 'dsar-response', data: { name: 'DSAR Response Time', unit: 'days', target: 25, direction: 'lower_better', frequency: 'MONTHLY' } },
    ],
  },
];
