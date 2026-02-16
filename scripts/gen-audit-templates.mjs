#!/usr/bin/env node
/**
 * Generate 10 ISO Audit Checklist templates
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function auditRows(clauses) {
  return clauses.map(c => [c, '', 'C / NC / OFI', '', '']);
}

const templates = [
  {
    outputPath: 'docs/compliance-templates/audits/AUD-001-ISO-9001-Audit-Checklist.docx',
    docNumber: 'AUD-001', title: 'ISO 9001:2015 Internal Audit Checklist', version: '1.0',
    owner: '[Quality Manager]', approvedBy: '[Management Representative]', isoRef: 'ISO 9001:2015',
    sections: [
      { heading: '1. Audit Information', table: { headers: ['Field', 'Detail'], rows: [
        ['Audit Number', '[AUD-YYYY-NNN]'], ['Standard', 'ISO 9001:2015'], ['Audit Date', '[DD/MM/YYYY]'],
        ['Lead Auditor', '[Name]'], ['Auditee / Department', '[Name / Department]'], ['Audit Scope', '[Clauses / Processes covered]']
      ]}},
      { heading: '2. Instructions', content: 'For each clause requirement, record:\n• C = Conforming (objective evidence confirms compliance)\n• NC = Non-Conforming (requirement not met — raise NCR)\n• OFI = Opportunity for Improvement\n• N/A = Not Applicable (justify in notes)\n\nRecord objective evidence (document numbers, records seen, interviews conducted) in the Evidence column.' },
      { heading: '3. Clause 4 — Context of the Organisation', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '4.1 Understanding the organisation and its context',
        '4.2 Understanding the needs and expectations of interested parties',
        '4.3 Determining the scope of the QMS',
        '4.4 QMS and its processes'
      ])}},
      { heading: '4. Clause 5 — Leadership', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '5.1.1 Leadership and commitment — General',
        '5.1.2 Customer focus',
        '5.2 Quality Policy',
        '5.3 Organisational roles, responsibilities and authorities'
      ])}},
      { heading: '5. Clause 6 — Planning', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '6.1 Actions to address risks and opportunities',
        '6.2 Quality objectives and planning to achieve them',
        '6.3 Planning of changes'
      ])}},
      { heading: '6. Clause 7 — Support', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '7.1.1 Resources — General',
        '7.1.2 People',
        '7.1.3 Infrastructure',
        '7.1.4 Environment for operation of processes',
        '7.1.5 Monitoring and measuring resources',
        '7.1.6 Organisational knowledge',
        '7.2 Competence',
        '7.3 Awareness',
        '7.4 Communication',
        '7.5 Documented information'
      ])}},
      { heading: '7. Clause 8 — Operation', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '8.1 Operational planning and control',
        '8.2 Requirements for products and services',
        '8.3 Design and development',
        '8.4 Control of externally provided processes, products and services',
        '8.5 Production and service provision',
        '8.6 Release of products and services',
        '8.7 Control of nonconforming outputs'
      ])}},
      { heading: '8. Clause 9 — Performance Evaluation', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '9.1 Monitoring, measurement, analysis and evaluation',
        '9.2 Internal audit',
        '9.3 Management review'
      ])}},
      { heading: '9. Clause 10 — Improvement', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '10.1 General',
        '10.2 Nonconformity and corrective action',
        '10.3 Continual improvement'
      ])}},
      { heading: '10. Audit Summary', table: { headers: ['Metric', 'Count'], rows: [
        ['Total requirements audited', ''], ['Conforming (C)', ''], ['Non-Conforming (NC)', ''],
        ['Opportunities for Improvement', ''], ['Not Applicable', '']
      ]}},
      { heading: '11. Auditor Sign-Off', content: 'Lead Auditor: _________________________ Date: ___/___/______\n\nAuditee Acknowledgement: _________________________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/audits/AUD-002-ISO-14001-Audit-Checklist.docx',
    docNumber: 'AUD-002', title: 'ISO 14001:2015 Internal Audit Checklist', version: '1.0',
    owner: '[Environmental Manager]', approvedBy: '[Management Representative]', isoRef: 'ISO 14001:2015',
    sections: [
      { heading: '1. Audit Information', table: { headers: ['Field', 'Detail'], rows: [
        ['Audit Number', '[AUD-YYYY-NNN]'], ['Standard', 'ISO 14001:2015'], ['Audit Date', '[DD/MM/YYYY]'],
        ['Lead Auditor', '[Name]'], ['Auditee / Department', '[Name / Department]']
      ]}},
      { heading: '2. Clause 4 — Context', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '4.1 Understanding the organisation and its context',
        '4.2 Needs and expectations of interested parties',
        '4.3 Scope of the EMS',
        '4.4 Environmental management system'
      ])}},
      { heading: '3. Clause 5 — Leadership', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '5.1 Leadership and commitment', '5.2 Environmental policy', '5.3 Roles, responsibilities and authorities'
      ])}},
      { heading: '4. Clause 6 — Planning', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '6.1.1 General — risks and opportunities',
        '6.1.2 Environmental aspects',
        '6.1.3 Compliance obligations',
        '6.1.4 Planning action',
        '6.2 Environmental objectives and planning'
      ])}},
      { heading: '5. Clause 7 — Support', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '7.1 Resources', '7.2 Competence', '7.3 Awareness', '7.4 Communication', '7.5 Documented information'
      ])}},
      { heading: '6. Clause 8 — Operation', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '8.1 Operational planning and control', '8.2 Emergency preparedness and response'
      ])}},
      { heading: '7. Clause 9 — Performance Evaluation', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '9.1.1 Monitoring and measurement — general', '9.1.2 Evaluation of compliance',
        '9.2 Internal audit', '9.3 Management review'
      ])}},
      { heading: '8. Clause 10 — Improvement', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '10.1 General', '10.2 Nonconformity and corrective action', '10.3 Continual improvement'
      ])}},
      { heading: '9. Audit Summary', table: { headers: ['Metric', 'Count'], rows: [
        ['Total requirements audited', ''], ['Conforming', ''], ['Non-Conforming', ''], ['OFI', '']
      ]}},
      { heading: '10. Sign-Off', content: 'Lead Auditor: _________________________ Date: ___/___/______\nAuditee: _________________________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/audits/AUD-003-ISO-45001-Audit-Checklist.docx',
    docNumber: 'AUD-003', title: 'ISO 45001:2018 Internal Audit Checklist', version: '1.0',
    owner: '[H&S Manager]', approvedBy: '[Management Representative]', isoRef: 'ISO 45001:2018',
    sections: [
      { heading: '1. Audit Information', table: { headers: ['Field', 'Detail'], rows: [
        ['Audit Number', '[AUD-YYYY-NNN]'], ['Standard', 'ISO 45001:2018'], ['Audit Date', '[DD/MM/YYYY]'],
        ['Lead Auditor', '[Name]'], ['Auditee / Department', '[Name / Department]']
      ]}},
      { heading: '2. Clause 4 — Context', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '4.1 Understanding the organisation and its context', '4.2 Needs and expectations of workers and other interested parties',
        '4.3 Scope of the OH&S management system', '4.4 OH&S management system'
      ])}},
      { heading: '3. Clause 5 — Leadership & Worker Participation', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '5.1 Leadership and commitment', '5.2 OH&S policy', '5.3 Organisational roles, responsibilities and authorities',
        '5.4 Consultation and participation of workers'
      ])}},
      { heading: '4. Clause 6 — Planning', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '6.1.1 General', '6.1.2.1 Hazard identification', '6.1.2.2 Assessment of OH&S risks',
        '6.1.2.3 Assessment of OH&S opportunities', '6.1.3 Determination of legal requirements',
        '6.1.4 Planning action', '6.2 OH&S objectives and planning'
      ])}},
      { heading: '5. Clause 7 — Support', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '7.1 Resources', '7.2 Competence', '7.3 Awareness', '7.4 Communication', '7.5 Documented information'
      ])}},
      { heading: '6. Clause 8 — Operation', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '8.1.1 General', '8.1.2 Eliminating hazards and reducing OH&S risks', '8.1.3 Management of change',
        '8.1.4 Procurement', '8.2 Emergency preparedness and response'
      ])}},
      { heading: '7. Clause 9 — Performance Evaluation', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '9.1.1 General', '9.1.2 Evaluation of compliance', '9.2 Internal audit', '9.3 Management review'
      ])}},
      { heading: '8. Clause 10 — Improvement', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '10.1 General', '10.2 Incident, nonconformity and corrective action', '10.3 Continual improvement'
      ])}},
      { heading: '9. Sign-Off', content: 'Lead Auditor: _________________________ Date: ___/___/______\nAuditee: _________________________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/audits/AUD-004-ISO-27001-Audit-Checklist.docx',
    docNumber: 'AUD-004', title: 'ISO 27001:2022 Internal Audit Checklist', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[Management Representative]', isoRef: 'ISO/IEC 27001:2022',
    sections: [
      { heading: '1. Audit Information', table: { headers: ['Field', 'Detail'], rows: [
        ['Audit Number', '[AUD-YYYY-NNN]'], ['Standard', 'ISO/IEC 27001:2022'], ['Audit Date', '[DD/MM/YYYY]'],
        ['Lead Auditor', '[Name]'], ['Auditee / Department', '[Name / Department]']
      ]}},
      { heading: '2. ISMS Clauses (4-10)', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '4.1 Understanding context', '4.2 Interested parties', '4.3 ISMS scope', '4.4 ISMS',
        '5.1 Leadership and commitment', '5.2 Information security policy', '5.3 Roles and authorities',
        '6.1 Risk assessment process', '6.2 Information security objectives', '6.3 Planning of changes',
        '7.1 Resources', '7.2 Competence', '7.3 Awareness', '7.4 Communication', '7.5 Documented information',
        '8.1 Operational planning and control', '8.2 Risk assessment', '8.3 Risk treatment',
        '9.1 Monitoring and measurement', '9.2 Internal audit', '9.3 Management review',
        '10.1 Continual improvement', '10.2 Nonconformity and corrective action'
      ])}},
      { heading: '3. Annex A Controls — Organisational (A.5)', table: { headers: ['Control', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'A.5.1 Policies for information security', 'A.5.2 Information security roles',
        'A.5.3 Segregation of duties', 'A.5.7 Threat intelligence',
        'A.5.8 Information security in project management', 'A.5.9 Inventory of information assets',
        'A.5.10 Acceptable use of information', 'A.5.23 Information security for cloud services',
        'A.5.24 Incident management planning', 'A.5.29 Information security during disruption',
        'A.5.30 ICT readiness for business continuity', 'A.5.34 Privacy and PII protection',
        'A.5.36 Compliance with policies and standards'
      ])}},
      { heading: '4. Annex A — People (A.6)', table: { headers: ['Control', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'A.6.1 Screening', 'A.6.2 Terms and conditions of employment',
        'A.6.3 Information security awareness and training', 'A.6.5 Responsibilities after termination'
      ])}},
      { heading: '5. Annex A — Physical (A.7)', table: { headers: ['Control', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'A.7.1 Physical security perimeters', 'A.7.2 Physical entry', 'A.7.4 Physical security monitoring',
        'A.7.9 Security of assets off-premises', 'A.7.10 Storage media', 'A.7.14 Secure disposal'
      ])}},
      { heading: '6. Annex A — Technological (A.8)', table: { headers: ['Control', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'A.8.1 User endpoint devices', 'A.8.2 Privileged access rights', 'A.8.3 Information access restriction',
        'A.8.5 Secure authentication', 'A.8.7 Protection against malware', 'A.8.8 Management of technical vulnerabilities',
        'A.8.9 Configuration management', 'A.8.12 Data leakage prevention', 'A.8.15 Logging',
        'A.8.16 Monitoring activities', 'A.8.24 Use of cryptography', 'A.8.25 Secure development life cycle',
        'A.8.28 Secure coding'
      ])}},
      { heading: '7. Sign-Off', content: 'Lead Auditor: _________________________ Date: ___/___/______\nAuditee: _________________________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/audits/AUD-005-ISO-22000-Audit-Checklist.docx',
    docNumber: 'AUD-005', title: 'ISO 22000:2018 Internal Audit Checklist', version: '1.0',
    owner: '[Food Safety Manager]', approvedBy: '[Management Representative]', isoRef: 'ISO 22000:2018',
    sections: [
      { heading: '1. Audit Information', table: { headers: ['Field', 'Detail'], rows: [
        ['Audit Number', '[AUD-YYYY-NNN]'], ['Standard', 'ISO 22000:2018'], ['Audit Date', '[DD/MM/YYYY]'],
        ['Lead Auditor', '[Name]'], ['Auditee', '[Name / Department]']
      ]}},
      { heading: '2. FSMS Clauses', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '4.1 Understanding context', '4.2 Interested parties', '4.3 Scope of the FSMS', '4.4 FSMS',
        '5.1 Leadership and commitment', '5.2 Food safety policy', '5.3 Roles and authorities',
        '6.1 Risks and opportunities', '6.2 Objectives of the FSMS', '6.3 Planning of changes',
        '7.1 Resources', '7.2 Competence', '7.3 Awareness', '7.4 Communication',
        '7.5 Documented information'
      ])}},
      { heading: '3. Clause 8 — Operation (HACCP)', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '8.1 Operational planning and control',
        '8.2 Prerequisite programmes (PRPs)',
        '8.3 Traceability system',
        '8.4 Emergency preparedness and response',
        '8.5.1 Preliminary steps for hazard analysis',
        '8.5.2 Hazard analysis (biological, chemical, physical)',
        '8.5.3 Validation of control measures',
        '8.5.4 Hazard control plan (HACCP/OPRP)',
        '8.6 Updating PRP and hazard control plan',
        '8.7 Control of monitoring and measuring',
        '8.8 Verification related to PRPs and hazard control plan',
        '8.9 Control of product and process nonconformities'
      ])}},
      { heading: '4. Clauses 9-10', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '9.1 Monitoring, measurement, analysis and evaluation',
        '9.2 Internal audit', '9.3 Management review',
        '10.1 Nonconformity and corrective action',
        '10.2 Continual improvement', '10.3 Update of the FSMS'
      ])}},
      { heading: '5. Sign-Off', content: 'Lead Auditor: _________________________ Date: ___/___/______\nAuditee: _________________________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/audits/AUD-006-ISO-50001-Audit-Checklist.docx',
    docNumber: 'AUD-006', title: 'ISO 50001:2018 Internal Audit Checklist', version: '1.0',
    owner: '[Energy Manager]', approvedBy: '[Management Representative]', isoRef: 'ISO 50001:2018',
    sections: [
      { heading: '1. Audit Information', table: { headers: ['Field', 'Detail'], rows: [
        ['Audit Number', '[AUD-YYYY-NNN]'], ['Standard', 'ISO 50001:2018'], ['Audit Date', '[DD/MM/YYYY]'],
        ['Lead Auditor', '[Name]'], ['Auditee', '[Name / Department]']
      ]}},
      { heading: '2. EnMS Clauses', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '4.1 Understanding context', '4.2 Interested parties', '4.3 Scope of the EnMS', '4.4 EnMS',
        '5.1 Leadership and commitment', '5.2 Energy policy', '5.3 Roles and authorities',
        '6.1 Risks and opportunities', '6.2 Objectives, energy targets and planning',
        '6.3 Energy review', '6.4 Energy performance indicators (EnPIs)',
        '6.5 Energy baseline', '6.6 Planning for collection of energy data',
        '7.1 Resources', '7.2 Competence', '7.3 Awareness', '7.4 Communication', '7.5 Documented information',
        '8.1 Operational planning and control', '8.2 Design', '8.3 Procurement',
        '9.1 Monitoring, measurement, analysis, evaluation of energy performance',
        '9.2 Internal audit', '9.3 Management review',
        '10.1 Nonconformity and corrective action', '10.2 Continual improvement'
      ])}},
      { heading: '3. Sign-Off', content: 'Lead Auditor: _________________________ Date: ___/___/______\nAuditee: _________________________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/audits/AUD-007-ISO-37001-Audit-Checklist.docx',
    docNumber: 'AUD-007', title: 'ISO 37001:2016 Internal Audit Checklist', version: '1.0',
    owner: '[Compliance Manager]', approvedBy: '[Management Representative]', isoRef: 'ISO 37001:2016',
    sections: [
      { heading: '1. Audit Information', table: { headers: ['Field', 'Detail'], rows: [
        ['Audit Number', '[AUD-YYYY-NNN]'], ['Standard', 'ISO 37001:2016'], ['Audit Date', '[DD/MM/YYYY]'],
        ['Lead Auditor', '[Name]'], ['Auditee', '[Name / Department]']
      ]}},
      { heading: '2. ABMS Clauses', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '4.1 Understanding context', '4.2 Interested parties', '4.3 Scope of ABMS',
        '4.4 Anti-bribery management system', '4.5 Bribery risk assessment',
        '5.1.1 Governing body', '5.1.2 Top management', '5.2 Anti-bribery policy',
        '5.3.1 Roles and responsibilities', '5.3.2 Anti-bribery compliance function',
        '5.3.3 Delegated decision-making',
        '6.1 Actions to address risks and opportunities', '6.2 Anti-bribery objectives',
        '7.1 Resources', '7.2.1 General competence', '7.2.2 Due diligence',
        '7.3 Awareness and training', '7.4 Communication', '7.5 Documented information',
        '8.1 Operational planning and control', '8.2 Due diligence',
        '8.3 Financial controls', '8.4 Non-financial controls',
        '8.5 Anti-bribery controls for controlled organisations',
        '8.6 Anti-bribery commitments', '8.7 Gifts, hospitality, donations',
        '8.8 Managing inadequacy of controls', '8.9 Raising concerns', '8.10 Investigating and dealing with bribery',
        '9.1 Monitoring, measurement, analysis and evaluation', '9.2 Internal audit', '9.3 Management review',
        '10.1 Nonconformity and corrective action', '10.2 Continual improvement'
      ])}},
      { heading: '3. Sign-Off', content: 'Lead Auditor: _________________________ Date: ___/___/______\nAuditee: _________________________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/audits/AUD-008-ISO-42001-Audit-Checklist.docx',
    docNumber: 'AUD-008', title: 'ISO/IEC 42001:2023 Internal Audit Checklist', version: '1.0',
    owner: '[AI Governance Manager]', approvedBy: '[Management Representative]', isoRef: 'ISO/IEC 42001:2023',
    sections: [
      { heading: '1. Audit Information', table: { headers: ['Field', 'Detail'], rows: [
        ['Audit Number', '[AUD-YYYY-NNN]'], ['Standard', 'ISO/IEC 42001:2023'], ['Audit Date', '[DD/MM/YYYY]'],
        ['Lead Auditor', '[Name]'], ['Auditee', '[Name / Department]']
      ]}},
      { heading: '2. AIMS Clauses', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        '4.1 Understanding context', '4.2 Interested parties', '4.3 Scope of AIMS', '4.4 AI management system',
        '5.1 Leadership and commitment', '5.2 AI policy', '5.3 Roles and authorities',
        '6.1 Actions to address risks and opportunities',
        '6.1.2 AI risk assessment', '6.1.3 AI risk treatment',
        '6.2 AI objectives and planning',
        '7.1 Resources', '7.2 Competence', '7.3 Awareness', '7.4 Communication', '7.5 Documented information',
        '8.1 Operational planning and control',
        '8.2 AI risk assessment (operational)',
        '8.3 AI risk treatment (operational)',
        '8.4 AI system impact assessment',
        '9.1 Monitoring, measurement, analysis and evaluation',
        '9.2 Internal audit', '9.3 Management review',
        '10.1 Continual improvement', '10.2 Nonconformity and corrective action'
      ])}},
      { heading: '3. Annex A Controls', table: { headers: ['Control', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'A.2 AI policies', 'A.3 Internal organisation for AI',
        'A.4 Resources for AI systems', 'A.5 Assessing impacts of AI systems',
        'A.6 AI system lifecycle', 'A.7 Data for AI systems',
        'A.8 Information for interested parties of AI systems',
        'A.9 Use of AI systems', 'A.10 Third-party and customer relationships'
      ])}},
      { heading: '4. Sign-Off', content: 'Lead Auditor: _________________________ Date: ___/___/______\nAuditee: _________________________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/audits/AUD-009-GDPR-Audit-Checklist.docx',
    docNumber: 'AUD-009', title: 'GDPR / UK GDPR Compliance Audit Checklist', version: '1.0',
    owner: '[Data Protection Officer]', approvedBy: '[Management Representative]', isoRef: 'GDPR / UK GDPR / DPA 2018',
    sections: [
      { heading: '1. Audit Information', table: { headers: ['Field', 'Detail'], rows: [
        ['Audit Number', '[AUD-YYYY-NNN]'], ['Regulation', 'GDPR / UK GDPR / DPA 2018'], ['Audit Date', '[DD/MM/YYYY]'],
        ['Lead Auditor', '[Name]'], ['Auditee', '[Name / Department]']
      ]}},
      { heading: '2. Lawfulness, Fairness, Transparency (Art 5-6)', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'Art 5(1)(a) — Lawfulness, fairness and transparency principle',
        'Art 6 — Lawful basis identified and documented for each processing activity',
        'Art 7 — Conditions for consent (where consent is the lawful basis)',
        'Art 9 — Special category data — explicit consent or other Art 9(2) condition',
        'Art 13-14 — Privacy notices provided at point of collection'
      ])}},
      { heading: '3. Data Subject Rights (Art 12-22)', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'Art 12 — Transparent communication and response within 1 month',
        'Art 15 — Right of access (Subject Access Request process)',
        'Art 16 — Right to rectification',
        'Art 17 — Right to erasure ("right to be forgotten")',
        'Art 18 — Right to restriction of processing',
        'Art 20 — Right to data portability',
        'Art 21 — Right to object (including direct marketing)',
        'Art 22 — Automated decision-making and profiling'
      ])}},
      { heading: '4. Accountability & Governance (Art 24-43)', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'Art 24 — Responsibility of the controller',
        'Art 25 — Data protection by design and by default',
        'Art 28 — Processor agreements in place',
        'Art 30 — Records of processing activities (ROPA)',
        'Art 32 — Security of processing (technical and organisational measures)',
        'Art 33 — Breach notification to ICO within 72 hours',
        'Art 34 — Communication of breach to data subjects',
        'Art 35 — Data Protection Impact Assessment (DPIA) where required',
        'Art 37 — DPO designated (where required)',
        'Art 44-49 — International transfers (adequacy, SCCs, or other safeguards)'
      ])}},
      { heading: '5. Technical Measures', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'Encryption at rest and in transit',
        'Access controls and least privilege',
        'Pseudonymisation where appropriate',
        'Regular testing of security measures',
        'Backup and disaster recovery for personal data',
        'Data retention schedules implemented and enforced',
        'Secure disposal of personal data'
      ])}},
      { heading: '6. Sign-Off', content: 'Lead Auditor: _________________________ Date: ___/___/______\nAuditee: _________________________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/audits/AUD-010-ESG-CSRD-Audit-Checklist.docx',
    docNumber: 'AUD-010', title: 'ESG / CSRD Compliance Audit Checklist', version: '1.0',
    owner: '[ESG Manager]', approvedBy: '[Management Representative]', isoRef: 'CSRD / ESRS / GRI',
    sections: [
      { heading: '1. Audit Information', table: { headers: ['Field', 'Detail'], rows: [
        ['Audit Number', '[AUD-YYYY-NNN]'], ['Framework', 'CSRD / ESRS / GRI Standards'], ['Audit Date', '[DD/MM/YYYY]'],
        ['Lead Auditor', '[Name]'], ['Auditee', '[Name / Department]']
      ]}},
      { heading: '2. Environmental — Climate Change (ESRS E1)', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'E1-1 Transition plan for climate change mitigation',
        'E1-2 Policies related to climate change mitigation and adaptation',
        'E1-3 Actions and resources for climate change',
        'E1-4 Targets related to climate change mitigation and adaptation',
        'E1-5 Energy consumption and mix',
        'E1-6 Gross Scopes 1, 2, 3 GHG emissions',
        'E1-7 GHG removals and carbon credits',
        'E1-8 Internal carbon pricing',
        'E1-9 Financial effects of climate change'
      ])}},
      { heading: '3. Environmental — Pollution & Resources (ESRS E2-E5)', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'E2 Pollution of air, water, soil',
        'E3 Water and marine resources',
        'E4 Biodiversity and ecosystems',
        'E5 Resource use and circular economy'
      ])}},
      { heading: '4. Social — Own Workforce (ESRS S1)', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'S1-1 Policies related to own workforce',
        'S1-6 Characteristics of the undertaking\'s employees',
        'S1-8 Collective bargaining coverage',
        'S1-9 Diversity indicators',
        'S1-14 Health and safety indicators',
        'S1-15 Work-life balance indicators',
        'S1-16 Remuneration metrics (pay gap)'
      ])}},
      { heading: '5. Social — Value Chain & Communities (ESRS S2-S4)', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'S2 Workers in the value chain', 'S3 Affected communities', 'S4 Consumers and end-users'
      ])}},
      { heading: '6. Governance (ESRS G1)', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'G1-1 Business conduct policies', 'G1-2 Management of relationships with suppliers',
        'G1-3 Prevention and detection of corruption and bribery', 'G1-4 Confirmed incidents of corruption',
        'G1-5 Political influence and lobbying', 'G1-6 Payment practices'
      ])}},
      { heading: '7. Double Materiality Assessment', table: { headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'], rows: auditRows([
        'Double materiality assessment conducted', 'Impact materiality (inside-out) assessed',
        'Financial materiality (outside-in) assessed', 'Stakeholder engagement in materiality process',
        'Material topics identified and prioritised', 'Materiality results approved by governance body'
      ])}},
      { heading: '8. Sign-Off', content: 'Lead Auditor: _________________________ Date: ___/___/______\nAuditee: _________________________ Date: ___/___/______' }
    ]
  }
];

async function main() {
  const tmpDir = '/tmp/audit-configs';
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.mkdirSync('/home/dyl/New-BMS/docs/compliance-templates/audits', { recursive: true });

  console.log(`Generating ${templates.length} audit checklists...`);
  for (const t of templates) {
    const configPath = path.join(tmpDir, `${t.docNumber}.json`);
    fs.writeFileSync(configPath, JSON.stringify(t, null, 2));
    execSync(`node /home/dyl/New-BMS/scripts/create-docx.mjs ${configPath}`, { stdio: 'inherit' });
  }
  console.log(`\nDone: ${templates.length} audit checklists generated.`);
}

main().catch(err => { console.error(err); process.exit(1); });
