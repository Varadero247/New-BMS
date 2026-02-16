#!/usr/bin/env node
/**
 * Gap-filling templates - Batch 1: Critical ISO 27001, GDPR, ISO 22000
 * 40 templates covering the most severe gaps
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const templates = [
  // ============================================
  // ISO 27001 GAPS (17 templates)
  // ============================================
  {
    outputPath: 'docs/compliance-templates/registers/REG-013-ISMS-Scope-Statement.docx',
    docNumber: 'REG-013', title: 'ISMS Scope Statement', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO/IEC 27001:2022 Clause 4.3',
    sections: [
      { heading: '1. Purpose', content: 'This document defines the scope and boundaries of the [COMPANY NAME] Information Security Management System (ISMS) in compliance with ISO/IEC 27001:2022 Clause 4.3.' },
      { heading: '2. Organisational Context', content: 'The following internal and external issues have been considered in determining the ISMS scope:\n\na) Internal: [Organisation structure, business strategy, information systems, culture]\nb) External: [Regulatory environment, market conditions, technology trends, threat landscape]' },
      { heading: '3. Interested Parties', table: { headers: ['Interested Party', 'Relevant Requirements', 'Applicable to ISMS'], rows: [
        ['Customers', 'Data protection, service availability, confidentiality', 'Yes'],
        ['Regulators (ICO)', 'GDPR compliance, breach notification', 'Yes'],
        ['Employees', 'Privacy of personal data, acceptable use', 'Yes'],
        ['Suppliers/Partners', 'Secure data exchange, contractual obligations', 'Yes'],
        ['Shareholders', 'Business continuity, reputation protection', 'Yes']
      ]}},
      { heading: '4. ISMS Scope Definition', content: 'The ISMS applies to:\n\na) Organisational Units: [List departments/business units]\nb) Physical Locations: [List offices, data centres, remote working]\nc) Information Systems: [List key systems, applications, infrastructure]\nd) Processes: [List business processes in scope]\ne) People: [All employees, contractors, third parties accessing information assets]' },
      { heading: '5. Interfaces & Dependencies', content: 'The following interfaces with activities performed outside the ISMS scope have been identified:\n\na) [Cloud service providers — shared responsibility model]\nb) [Outsourced IT support — covered by supplier agreements]\nc) [Third-party payment processing — PCI DSS compliance]' },
      { heading: '6. Exclusions', content: 'The following have been excluded from the ISMS scope with justification:\n\n[If any Annex A controls are excluded, justify each exclusion in the Statement of Applicability (REG-014)]' },
      { heading: '7. Approval', content: 'Approved by: _________________________ Date: ___/___/______\nTitle: [Managing Director / CISO]' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-024-InfoSec-Risk-Assessment.docx',
    docNumber: 'PRO-024', title: 'Information Security Risk Assessment Procedure', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[CISO / Managing Director]', isoRef: 'ISO/IEC 27001:2022 Clause 6.1.2',
    sections: [
      { heading: '1. Purpose', content: 'To define the methodology for identifying, analysing, evaluating, and treating information security risks within the ISMS scope.' },
      { heading: '2. Scope', content: 'Applies to all information assets, systems, processes, and people within the ISMS scope as defined in REG-013.' },
      { heading: '3. Risk Assessment Methodology', content: 'The risk assessment follows an asset-based approach:\n\n1. Identify information assets and assign owners\n2. Identify threats to each asset\n3. Identify vulnerabilities that could be exploited by threats\n4. Assess the likelihood of occurrence (1-5 scale)\n5. Assess the impact if the risk materialises (1-5 scale)\n6. Calculate risk score = Likelihood × Impact\n7. Evaluate against risk acceptance criteria\n8. Select risk treatment option for unacceptable risks' },
      { heading: '4. Risk Criteria', table: { headers: ['Score', 'Likelihood', 'Impact'], rows: [
        ['1', 'Rare — once in 10+ years', 'Negligible — no business impact'],
        ['2', 'Unlikely — once in 5 years', 'Minor — localised impact, quickly resolved'],
        ['3', 'Possible — once per year', 'Moderate — significant effort to resolve'],
        ['4', 'Likely — several times per year', 'Major — serious business disruption'],
        ['5', 'Almost Certain — monthly or more', 'Catastrophic — existential threat']
      ]}},
      { heading: '5. Risk Acceptance Criteria', content: 'Risk scores are categorised as:\n\n• 1-4: LOW — Accept the risk, monitor\n• 5-9: MEDIUM — Risk treatment required within 6 months\n• 10-15: HIGH — Risk treatment required within 3 months\n• 16-25: CRITICAL — Immediate risk treatment required, escalate to CISO' },
      { heading: '6. Risk Treatment Options', bullets: ['Modify/Mitigate: Apply controls from ISO 27001 Annex A', 'Accept: Formally accept residual risk (risk owner sign-off required)', 'Avoid: Cease the activity creating the risk', 'Transfer/Share: Transfer to third party (insurance, outsourcing)'] },
      { heading: '7. Frequency', content: 'Risk assessments shall be conducted:\n\na) Annually as a comprehensive review\nb) When significant changes occur (new systems, organisational changes, incidents)\nc) Following a significant information security incident\nd) As directed by management review' },
      { heading: '8. Records', bullets: ['REG-001: Risk Register (with information security risks)', 'REG-014: Statement of Applicability', 'PLN-010: Risk Treatment Plan', 'RPT-005: InfoSec Risk Assessment Report'] }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/plans/PLN-010-InfoSec-Risk-Treatment-Plan.docx',
    docNumber: 'PLN-010', title: 'Information Security Risk Treatment Plan', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[CISO / Managing Director]', isoRef: 'ISO/IEC 27001:2022 Clause 6.1.3',
    sections: [
      { heading: '1. Purpose', content: 'To document the risk treatment decisions for all identified information security risks, including selected controls, implementation plan, and residual risk acceptance.' },
      { heading: '2. Risk Treatment Summary', table: { headers: ['Risk ID', 'Risk Description', 'Treatment Option', 'Selected Controls (Annex A)', 'Responsible Owner', 'Target Date', 'Status', 'Residual Risk'], rows: [
        ['ISR-001', '[Description]', 'Modify', '[A.x.x]', '[Owner]', '[Date]', 'Planned', '[L×I]'],
        ['ISR-002', '[Description]', 'Modify', '[A.x.x]', '[Owner]', '[Date]', 'Planned', '[L×I]'],
        ['ISR-003', '[Description]', 'Accept', 'N/A', '[Owner]', 'N/A', 'Accepted', '[L×I]'],
        ['ISR-004', '[Description]', 'Transfer', '[Insurance ref]', '[Owner]', '[Date]', 'In Progress', '[L×I]'],
        ['ISR-005', '[Description]', 'Modify', '[A.x.x]', '[Owner]', '[Date]', 'Planned', '[L×I]']
      ]}},
      { heading: '3. Residual Risk Acceptance', content: 'Risk owners have accepted the following residual risks:\n\n[For each accepted risk: Risk ID, Description, Residual Risk Score, Risk Owner Name, Acceptance Date, Review Date]\n\nSignature: _________________________ Date: ___/___/______' },
      { heading: '4. Implementation Resources', content: 'Budget: [Estimated budget for risk treatment implementation]\nPersonnel: [Key personnel and time commitments]\nExternal support: [Consultants, technology vendors]' },
      { heading: '5. Review', content: 'This plan shall be reviewed quarterly and updated following any risk assessment changes or significant security incidents.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-014-Statement-of-Applicability.docx',
    docNumber: 'REG-014', title: 'Statement of Applicability (SoA)', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[CISO / Managing Director]', isoRef: 'ISO/IEC 27001:2022 Clause 6.1.3(d)',
    sections: [
      { heading: '1. Purpose', content: 'This Statement of Applicability (SoA) lists all 93 controls from ISO/IEC 27001:2022 Annex A, states whether each is applicable or excluded with justification, and provides the implementation status. This is a mandatory document for ISO 27001 certification.' },
      { heading: '2. Organisational Controls (A.5)', table: { headers: ['Control', 'Title', 'Applicable', 'Justification', 'Implementation Status', 'Evidence'], rows: [
        ['A.5.1', 'Policies for information security', 'Yes', 'Required for ISMS governance', 'Implemented', 'POL-004'],
        ['A.5.2', 'Information security roles and responsibilities', 'Yes', 'Required for accountability', 'Implemented', 'Org chart, JDs'],
        ['A.5.3', 'Segregation of duties', 'Yes', 'Required to prevent fraud/error', 'Implemented', 'RBAC system'],
        ['A.5.4', 'Management responsibilities', 'Yes', 'Required for governance', 'Implemented', 'ISMS Manual'],
        ['A.5.5', 'Contact with authorities', 'Yes', 'Required for incident reporting', 'Implemented', 'Contact list'],
        ['A.5.6', 'Contact with special interest groups', 'Yes', 'Threat intelligence sharing', 'Implemented', 'Membership records'],
        ['A.5.7', 'Threat intelligence', 'Yes', 'Required for proactive security', 'Implemented', 'Feed subscription'],
        ['A.5.8', 'Information security in project management', 'Yes', 'Required for secure SDLC', 'Implemented', 'Project templates'],
        ['A.5.9', 'Inventory of information and other associated assets', 'Yes', 'Required for asset management', 'Implemented', 'REG-016'],
        ['A.5.10', 'Acceptable use of information and other associated assets', 'Yes', 'Required for user responsibility', 'Implemented', 'POL-011'],
        ['A.5.11', 'Return of assets', 'Yes', 'Required on termination', 'Implemented', 'Leaver checklist'],
        ['A.5.12', 'Classification of information', 'Yes', 'Required for data handling', 'Implemented', 'PRO-025'],
        ['A.5.13', 'Labelling of information', 'Yes', 'Required for data handling', 'Implemented', 'PRO-025'],
        ['A.5.14', 'Information transfer', 'Yes', 'Required for secure comms', 'Implemented', 'Transfer policy'],
        ['A.5.15', 'Access control', 'Yes', 'Required for confidentiality', 'Implemented', 'PRO-026'],
        ['A.5.16', 'Identity management', 'Yes', 'Required for access control', 'Implemented', 'IAM procedure'],
        ['A.5.17', 'Authentication information', 'Yes', 'Required for access control', 'Implemented', 'Password policy'],
        ['A.5.18', 'Access rights', 'Yes', 'Required for least privilege', 'Implemented', 'PRO-026'],
        ['A.5.19', 'Information security in supplier relationships', 'Yes', 'Required for supply chain', 'Implemented', 'POL-012'],
        ['A.5.20', 'Addressing information security within supplier agreements', 'Yes', 'Required for contracts', 'Implemented', 'Contract template'],
        ['A.5.21', 'Managing information security in the ICT supply chain', 'Yes', 'Required for supply chain', 'Implemented', 'POL-012'],
        ['A.5.22', 'Monitoring, review and change management of supplier services', 'Yes', 'Required for ongoing assurance', 'Implemented', 'Supplier review'],
        ['A.5.23', 'Information security for use of cloud services', 'Yes', 'Cloud services in use', 'Implemented', 'Cloud policy'],
        ['A.5.24', 'Information security incident management planning and preparation', 'Yes', 'Required for incident response', 'Implemented', 'PRO-014'],
        ['A.5.25', 'Assessment and decision on information security events', 'Yes', 'Required for triage', 'Implemented', 'PRO-014'],
        ['A.5.26', 'Response to information security incidents', 'Yes', 'Required for containment', 'Implemented', 'PRO-014'],
        ['A.5.27', 'Learning from information security incidents', 'Yes', 'Required for improvement', 'Implemented', 'Lessons learned'],
        ['A.5.28', 'Collection of evidence', 'Yes', 'Required for forensics', 'Implemented', 'Evidence procedure'],
        ['A.5.29', 'Information security during disruption', 'Yes', 'Required for continuity', 'Implemented', 'PRO-015, PLN-002'],
        ['A.5.30', 'ICT readiness for business continuity', 'Yes', 'Required for DR', 'Implemented', 'PLN-002'],
        ['A.5.31', 'Legal, statutory, regulatory and contractual requirements', 'Yes', 'Required for compliance', 'Implemented', 'FRM-011'],
        ['A.5.32', 'Intellectual property rights', 'Yes', 'IP protection required', 'Implemented', 'IP register'],
        ['A.5.33', 'Protection of records', 'Yes', 'Required for evidence', 'Implemented', 'PRO-001'],
        ['A.5.34', 'Privacy and protection of PII', 'Yes', 'GDPR applicable', 'Implemented', 'POL-007'],
        ['A.5.35', 'Independent review of information security', 'Yes', 'Required for assurance', 'Implemented', 'PLN-011'],
        ['A.5.36', 'Compliance with policies, rules and standards for information security', 'Yes', 'Required for governance', 'Implemented', 'AUD-004'],
        ['A.5.37', 'Documented operating procedures', 'Yes', 'Required for consistency', 'Implemented', 'SOP library']
      ]}},
      { heading: '3. People Controls (A.6)', table: { headers: ['Control', 'Title', 'Applicable', 'Justification', 'Status', 'Evidence'], rows: [
        ['A.6.1', 'Screening', 'Yes', 'Pre-employment checks', 'Implemented', 'HR procedure'],
        ['A.6.2', 'Terms and conditions of employment', 'Yes', 'Employment contracts', 'Implemented', 'Contract templates'],
        ['A.6.3', 'Information security awareness, education and training', 'Yes', 'Required for awareness', 'Implemented', 'Training programme'],
        ['A.6.4', 'Disciplinary process', 'Yes', 'Required for enforcement', 'Implemented', 'HR policy'],
        ['A.6.5', 'Responsibilities after termination or change of employment', 'Yes', 'Required for offboarding', 'Implemented', 'Leaver process'],
        ['A.6.6', 'Confidentiality or non-disclosure agreements', 'Yes', 'Required for protection', 'Implemented', 'NDA template'],
        ['A.6.7', 'Remote working', 'Yes', 'Remote workers exist', 'Implemented', 'Remote working policy'],
        ['A.6.8', 'Information security event reporting', 'Yes', 'Required for detection', 'Implemented', 'Incident reporting']
      ]}},
      { heading: '4. Physical Controls (A.7)', table: { headers: ['Control', 'Title', 'Applicable', 'Justification', 'Status', 'Evidence'], rows: [
        ['A.7.1', 'Physical security perimeters', 'Yes', 'Office premises', 'Implemented', 'PRO-027'],
        ['A.7.2', 'Physical entry', 'Yes', 'Access control required', 'Implemented', 'Access logs'],
        ['A.7.3', 'Securing offices, rooms and facilities', 'Yes', 'Physical security', 'Implemented', 'PRO-027'],
        ['A.7.4', 'Physical security monitoring', 'Yes', 'CCTV/alarm required', 'Implemented', 'CCTV system'],
        ['A.7.5', 'Protecting against physical and environmental threats', 'Yes', 'Fire, flood, etc.', 'Implemented', 'PLN-003'],
        ['A.7.6', 'Working in secure areas', 'Yes', 'Server rooms, etc.', 'Implemented', 'PRO-027'],
        ['A.7.7', 'Clear desk and clear screen', 'Yes', 'Confidentiality', 'Implemented', 'Clear desk policy'],
        ['A.7.8', 'Equipment siting and protection', 'Yes', 'IT equipment', 'Implemented', 'PRO-027'],
        ['A.7.9', 'Security of assets off-premises', 'Yes', 'Laptops, mobile devices', 'Implemented', 'Device policy'],
        ['A.7.10', 'Storage media', 'Yes', 'Data on media', 'Implemented', 'Media handling'],
        ['A.7.11', 'Supporting utilities', 'Yes', 'UPS, generator', 'Implemented', 'UPS register'],
        ['A.7.12', 'Cabling security', 'Yes', 'Network cabling', 'Implemented', 'Cabling standards'],
        ['A.7.13', 'Equipment maintenance', 'Yes', 'Preventive maintenance', 'Implemented', 'Maintenance log'],
        ['A.7.14', 'Secure disposal or re-use of equipment', 'Yes', 'Data sanitisation', 'Implemented', 'Disposal procedure']
      ]}},
      { heading: '5. Technological Controls (A.8)', table: { headers: ['Control', 'Title', 'Applicable', 'Justification', 'Status', 'Evidence'], rows: [
        ['A.8.1', 'User endpoint devices', 'Yes', 'Laptops, mobiles', 'Implemented', 'Device policy'],
        ['A.8.2', 'Privileged access rights', 'Yes', 'Admin accounts', 'Implemented', 'PRO-026'],
        ['A.8.3', 'Information access restriction', 'Yes', 'Need-to-know', 'Implemented', 'RBAC system'],
        ['A.8.4', 'Access to source code', 'Yes', 'Development activity', 'Implemented', 'Git access controls'],
        ['A.8.5', 'Secure authentication', 'Yes', 'MFA required', 'Implemented', 'Auth policy'],
        ['A.8.6', 'Capacity management', 'Yes', 'Infrastructure capacity', 'Implemented', 'Capacity monitoring'],
        ['A.8.7', 'Protection against malware', 'Yes', 'Endpoint protection', 'Implemented', 'AV/EDR deployment'],
        ['A.8.8', 'Management of technical vulnerabilities', 'Yes', 'Patching required', 'Implemented', 'Patch management'],
        ['A.8.9', 'Configuration management', 'Yes', 'Baseline configs', 'Implemented', 'Config standards'],
        ['A.8.10', 'Information deletion', 'Yes', 'GDPR, retention', 'Implemented', 'REG-029'],
        ['A.8.11', 'Data masking', 'Yes', 'Test data, analytics', 'Implemented', 'Masking procedure'],
        ['A.8.12', 'Data leakage prevention', 'Yes', 'DLP required', 'Implemented', 'DLP controls'],
        ['A.8.13', 'Information backup', 'Yes', 'Business continuity', 'Implemented', 'Backup procedure'],
        ['A.8.14', 'Redundancy of information processing facilities', 'Yes', 'Availability', 'Implemented', 'DR architecture'],
        ['A.8.15', 'Logging', 'Yes', 'Audit trail', 'Implemented', 'Logging policy'],
        ['A.8.16', 'Monitoring activities', 'Yes', 'Threat detection', 'Implemented', 'SIEM/monitoring'],
        ['A.8.17', 'Clock synchronisation', 'Yes', 'Log correlation', 'Implemented', 'NTP configuration'],
        ['A.8.18', 'Use of privileged utility programs', 'Yes', 'Admin tools', 'Implemented', 'PRO-026'],
        ['A.8.19', 'Installation of software on operational systems', 'Yes', 'Change control', 'Implemented', 'PRO-028'],
        ['A.8.20', 'Networks security', 'Yes', 'Network perimeter', 'Implemented', 'Firewall policy'],
        ['A.8.21', 'Security of network services', 'Yes', 'Service agreements', 'Implemented', 'SLAs'],
        ['A.8.22', 'Segregation of networks', 'Yes', 'Network zones', 'Implemented', 'Network diagram'],
        ['A.8.23', 'Web filtering', 'Yes', 'Internet access', 'Implemented', 'Web filter policy'],
        ['A.8.24', 'Use of cryptography', 'Yes', 'Data protection', 'Implemented', 'POL-013'],
        ['A.8.25', 'Secure development life cycle', 'Yes', 'Software development', 'Implemented', 'SDLC procedure'],
        ['A.8.26', 'Application security requirements', 'Yes', 'App development', 'Implemented', 'Security reqs'],
        ['A.8.27', 'Secure system architecture and engineering principles', 'Yes', 'System design', 'Implemented', 'Architecture docs'],
        ['A.8.28', 'Secure coding', 'Yes', 'Code quality', 'Implemented', 'Coding standards'],
        ['A.8.29', 'Security testing in development and acceptance', 'Yes', 'Testing required', 'Implemented', 'Test procedures'],
        ['A.8.30', 'Outsourced development', 'Yes', 'Third-party dev', 'Implemented', 'Contract clauses'],
        ['A.8.31', 'Separation of development, test and production environments', 'Yes', 'Env separation', 'Implemented', 'Env architecture'],
        ['A.8.32', 'Change management', 'Yes', 'IT changes', 'Implemented', 'PRO-028'],
        ['A.8.33', 'Test information', 'Yes', 'Test data handling', 'Implemented', 'Test data policy'],
        ['A.8.34', 'Protection of information systems during audit testing', 'Yes', 'Audit security', 'Implemented', 'Audit controls']
      ]}},
      { heading: '6. Approval', content: 'This SoA was reviewed and approved by:\n\nInformation Security Manager: _________________________ Date: ___/___/______\nCISO / Managing Director: _________________________ Date: ___/___/______\n\nNext Review Date: [DD/MM/YYYY]' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-015-InfoSec-Objectives.docx',
    docNumber: 'REG-015', title: 'Information Security Objectives Register', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[CISO]', isoRef: 'ISO/IEC 27001:2022 Clause 6.2',
    sections: [
      { heading: '1. Information Security Objectives', table: { headers: ['Obj #', 'Objective', 'Target', 'Responsible', 'Resources', 'Timeline', 'Monitoring', 'Status'], rows: [
        ['ISO-1', 'Reduce security incidents by 50%', '≤12 incidents/year', 'CISO', 'SIEM investment', 'Dec 2026', 'Monthly incident count', 'In Progress'],
        ['ISO-2', '100% staff security awareness training', 'All staff trained', 'IS Manager', 'E-learning platform', 'Mar 2026', 'Training completion rate', 'In Progress'],
        ['ISO-3', 'Achieve ISO 27001 certification', 'Certificate awarded', 'IS Manager', 'Consultancy budget', 'Jun 2026', 'Stage audit results', 'Planned'],
        ['ISO-4', 'Patch critical vulnerabilities within 48hrs', '≤48hr patch time', 'IT Manager', 'Patching tools', 'Ongoing', 'Avg patch time', 'In Progress'],
        ['ISO-5', '', '', '', '', '', '', '']
      ]}},
      { heading: '2. Review', content: 'Objectives reviewed: [Quarterly]\nLast review date: [DD/MM/YYYY]\nNext review date: [DD/MM/YYYY]' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-016-Information-Asset-Register.docx',
    docNumber: 'REG-016', title: 'Information Asset Register', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[CISO]', isoRef: 'ISO/IEC 27001:2022 Annex A.5.9',
    sections: [
      { heading: '1. Information Asset Inventory', table: { headers: ['Asset ID', 'Asset Name', 'Type', 'Owner', 'Location', 'Classification', 'Value', 'Notes'], rows: [
        ['IA-001', '[ERP System]', 'Application', '[IT Director]', 'Cloud', 'Confidential', 'High', ''],
        ['IA-002', '[Customer Database]', 'Data', '[CRM Manager]', 'Cloud DB', 'Confidential', 'High', 'Contains PII'],
        ['IA-003', '[Email System]', 'Application', '[IT Manager]', 'Cloud', 'Internal', 'High', ''],
        ['IA-004', '[File Server]', 'Infrastructure', '[IT Manager]', 'On-premise', 'Internal', 'Medium', ''],
        ['IA-005', '[Employee Records]', 'Data', '[HR Manager]', 'Cloud DB', 'Restricted', 'High', 'Special category data'],
        ['IA-006', '', '', '', '', '', '', '']
      ]}},
      { heading: '2. Classification Levels', table: { headers: ['Level', 'Description', 'Handling Requirements'], rows: [
        ['Public', 'Information approved for public release', 'No restrictions on distribution'],
        ['Internal', 'General internal business information', 'Internal use only, no external sharing without approval'],
        ['Confidential', 'Sensitive business information, customer data', 'Encrypted at rest and in transit, access restricted to authorised personnel'],
        ['Restricted', 'Highly sensitive data (special category PII, trade secrets)', 'Strongest encryption, strict need-to-know, logged access, no removable media']
      ]}}
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-025-Information-Classification.docx',
    docNumber: 'PRO-025', title: 'Information Classification & Labelling Procedure', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[CISO]', isoRef: 'ISO/IEC 27001:2022 Annex A.5.12, A.5.13',
    sections: [
      { heading: '1. Purpose', content: 'To ensure all information assets are classified according to their value, sensitivity, and legal requirements, and are appropriately labelled to indicate their classification level.' },
      { heading: '2. Classification Scheme', content: 'All information shall be classified into one of four levels: Public, Internal, Confidential, or Restricted. Classification is determined by the information owner based on the potential impact of unauthorised disclosure.' },
      { heading: '3. Classification Criteria', table: { headers: ['Criterion', 'Public', 'Internal', 'Confidential', 'Restricted'], rows: [
        ['Financial impact of disclosure', 'None', '<£10k', '£10k-£100k', '>£100k'],
        ['Regulatory impact', 'None', 'Minor', 'Reportable breach', 'Enforcement action'],
        ['Reputational impact', 'None', 'Internal embarrassment', 'Media coverage', 'Business-threatening'],
        ['Legal impact', 'None', 'Minor', 'Legal proceedings', 'Criminal prosecution']
      ]}},
      { heading: '4. Labelling Requirements', bullets: ['Documents: Classification label in header/footer of every page', 'Emails: Classification in subject line prefix [PUBLIC] / [INTERNAL] / [CONFIDENTIAL] / [RESTRICTED]', 'Electronic files: Classification in file properties/metadata', 'Physical media: Classification sticker on exterior', 'Systems: Classification banner on login screen'] },
      { heading: '5. Handling Rules', content: 'Handling rules for each classification level are defined in the Information Security Policy (POL-004) and include requirements for storage, transmission, printing, disposal, and sharing.' },
      { heading: '6. Reclassification', content: 'Information owners shall review classifications annually or when circumstances change. Reclassification requires approval from the Information Security Manager.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-026-Access-Control.docx',
    docNumber: 'PRO-026', title: 'Access Control & Identity Management Procedure', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[CISO]', isoRef: 'ISO/IEC 27001:2022 Annex A.5.15-5.18, A.8.2-8.5',
    sections: [
      { heading: '1. Purpose', content: 'To ensure information and information processing facilities are accessed only by authorised persons, processes, or systems, following the principles of least privilege and need-to-know.' },
      { heading: '2. User Registration & Deregistration', content: 'a) New user accounts require formal request from line manager via IT Service Desk\nb) Identity verified before account creation (HR confirms employment)\nc) Unique user ID assigned — no shared accounts permitted\nd) Default access rights assigned based on role (RBAC)\ne) Accounts disabled within 24 hours of employment termination\nf) Quarterly review of all user accounts to identify orphaned/inactive accounts' },
      { heading: '3. Access Provisioning', content: 'a) Access rights granted based on role-based access control (RBAC) matrix\nb) Additional access requires formal approval from data/system owner\nc) Temporary access with defined expiry dates for contractors\nd) Access changes following role changes processed within 5 working days\ne) Annual access review by system/data owners — certify or revoke' },
      { heading: '4. Privileged Access', content: 'a) Privileged accounts (admin, root, DBA) require separate approval from CISO\nb) Privileged accounts shall use multi-factor authentication (MFA)\nc) Privileged actions logged with tamper-proof audit trail\nd) Privileged accounts reviewed quarterly\ne) Privileged access time-limited where possible (just-in-time access)\nf) No browsing internet or reading email with privileged accounts' },
      { heading: '5. Authentication Requirements', table: { headers: ['System Type', 'Password Policy', 'MFA Required', 'Session Timeout'], rows: [
        ['Standard user accounts', 'Min 12 chars, complexity, 90-day rotation', 'Yes — for remote access', '30 minutes'],
        ['Privileged accounts', 'Min 16 chars, complexity, 60-day rotation', 'Yes — always', '15 minutes'],
        ['Service accounts', 'Min 20 chars, no rotation (managed)', 'N/A', 'N/A'],
        ['External/portal access', 'Min 12 chars, complexity', 'Yes — always', '15 minutes']
      ]}},
      { heading: '6. Access Review Schedule', content: 'Access reviews shall be conducted:\n\n• Quarterly: Privileged accounts\n• Semi-annually: All user accounts\n• On event: Role changes, department transfers, project completion\n• Annual: Full access recertification by all system owners' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/policies/POL-011-Acceptable-Use-Policy.docx',
    docNumber: 'POL-011', title: 'Acceptable Use Policy', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO/IEC 27001:2022 Annex A.5.10',
    sections: [
      { heading: '1. Purpose', content: 'To define the acceptable use of [COMPANY NAME] information systems, networks, and data by all employees, contractors, and third parties with access to company resources.' },
      { heading: '2. Scope', content: 'This policy applies to all users of [COMPANY NAME] information systems including computers, mobile devices, email, internet, cloud services, social media, and any systems accessed for company business.' },
      { heading: '3. General Principles', bullets: [
        'Company information systems are provided for business purposes',
        'Limited personal use is permitted provided it does not interfere with work, consume excessive resources, or breach this policy',
        'All activity on company systems may be monitored in accordance with applicable law',
        'Users are responsible for the security of their credentials and must not share passwords'
      ]},
      { heading: '4. Prohibited Activities', bullets: [
        'Accessing, downloading, or distributing illegal, offensive, or inappropriate material',
        'Attempting to gain unauthorised access to any system, network, or data',
        'Installing unauthorised software on company devices',
        'Connecting personal devices to the company network without approval',
        'Transmitting confidential information via unencrypted channels',
        'Using company systems for personal commercial activities',
        'Circumventing security controls (VPNs, firewalls, content filters)',
        'Sending unsolicited bulk email (spam) from company systems'
      ]},
      { heading: '5. Email & Internet', content: 'a) Business email may be used for reasonable personal communication\nb) Do not open attachments or click links from unknown sources\nc) Report suspected phishing emails to IT Security immediately\nd) Do not use personal email for business data\ne) Internet browsing is monitored — do not access inappropriate sites' },
      { heading: '6. Mobile Devices & Remote Working', content: 'a) Company data on personal devices requires MDM enrolment\nb) Devices must be screen-locked when unattended (max 5 minutes)\nc) Lost or stolen devices must be reported to IT immediately\nd) Do not use public Wi-Fi for company business without VPN\ne) Work in public places requires privacy screen and vigilance' },
      { heading: '7. Consequences of Breach', content: 'Breach of this policy may result in disciplinary action up to and including termination of employment. Criminal activity will be reported to the appropriate authorities.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/policies/POL-012-Supplier-InfoSec-Policy.docx',
    docNumber: 'POL-012', title: 'Supplier Information Security Policy', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO/IEC 27001:2022 Annex A.5.19-5.21',
    sections: [
      { heading: '1. Purpose', content: 'To define the information security requirements for all suppliers, third parties, and service providers who access, process, store, or transmit [COMPANY NAME] information or connect to [COMPANY NAME] systems.' },
      { heading: '2. Supplier Classification', table: { headers: ['Tier', 'Description', 'Security Requirements', 'Review Frequency'], rows: [
        ['Critical', 'Access to restricted/confidential data or critical systems', 'Full security assessment, contractual controls, annual audit right', 'Annual on-site/remote audit'],
        ['High', 'Access to internal data or non-critical systems', 'Security questionnaire, contractual controls', 'Annual questionnaire'],
        ['Standard', 'No access to data or systems (goods/physical services)', 'Standard T&Cs with security clauses', 'Biennial review'],
      ]}},
      { heading: '3. Contractual Requirements', content: 'All supplier agreements must include:\n\na) Confidentiality/NDA obligations\nb) Data protection clauses (GDPR Article 28 where applicable)\nc) Security incident notification requirements (within 24 hours)\nd) Right to audit/assess supplier security controls\ne) Return/destruction of data on contract termination\nf) Sub-processor approval requirements' },
      { heading: '4. Ongoing Monitoring', content: 'Critical and High-tier suppliers shall be monitored for:\n\na) Security incident disclosures\nb) Changes to their security posture\nc) Regulatory compliance status\nd) Financial stability (insolvency risk)\ne) Performance against security SLAs' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/policies/POL-013-Cryptography-Policy.docx',
    docNumber: 'POL-013', title: 'Cryptography & Key Management Policy', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[CISO]', isoRef: 'ISO/IEC 27001:2022 Annex A.8.24',
    sections: [
      { heading: '1. Purpose', content: 'To ensure the proper and effective use of cryptographic controls to protect the confidentiality, integrity, and authenticity of [COMPANY NAME] information.' },
      { heading: '2. Encryption Requirements', table: { headers: ['Data State', 'Minimum Standard', 'Examples'], rows: [
        ['Data at rest', 'AES-256', 'Database encryption, disk encryption (BitLocker/FileVault), backup encryption'],
        ['Data in transit', 'TLS 1.2+ (TLS 1.3 preferred)', 'HTTPS, encrypted email (S/MIME/PGP), VPN (IPSec/WireGuard)'],
        ['Data in use', 'Application-level controls', 'Memory encryption where supported, secure enclaves']
      ]}},
      { heading: '3. Key Management', content: 'a) Keys generated using cryptographically secure random number generators\nb) Key length: RSA ≥2048 bit, ECC ≥256 bit, symmetric ≥256 bit\nc) Keys stored in hardware security modules (HSMs) or approved key vaults\nd) Key rotation: Annual for encryption keys, on compromise for all keys\ne) Key destruction: Secure overwrite using approved methods\nf) Key escrow: Recovery keys for critical systems stored in sealed envelopes in fireproof safe, or in approved key escrow service' },
      { heading: '4. Certificate Management', content: 'a) TLS certificates from trusted Certificate Authorities only\nb) Certificate inventory maintained and monitored for expiry\nc) Minimum 30-day renewal window before expiry\nd) Wildcard certificates minimised — use specific domain certificates where practical' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-027-Physical-Security.docx',
    docNumber: 'PRO-027', title: 'Physical & Environmental Security Procedure', version: '1.0',
    owner: '[Facilities Manager]', approvedBy: '[CISO]', isoRef: 'ISO/IEC 27001:2022 Annex A.7',
    sections: [
      { heading: '1. Purpose', content: 'To prevent unauthorised physical access, damage, and interference to [COMPANY NAME] information and information processing facilities.' },
      { heading: '2. Security Perimeters', content: 'a) External perimeter: Fencing, locks, CCTV, intrusion detection\nb) Building entry: Access-controlled doors (card/biometric)\nc) Secure areas (server rooms, comms rooms): Dual-factor access, logged entry\nd) Restricted areas (executive offices, R&D): Additional access restrictions' },
      { heading: '3. Entry Controls', bullets: ['All staff must wear visible ID badges at all times', 'Visitors must sign in at reception, be issued a visitor badge, and be escorted at all times', 'Delivery personnel escorted in loading areas only', 'Access logs reviewed monthly for anomalies', 'Lost access cards reported immediately and deactivated'] },
      { heading: '4. Secure Areas', content: 'Server rooms and comms rooms:\n\na) Access restricted to authorised IT personnel only\nb) Environmental controls: temperature 18-24°C, humidity 40-60%\nc) Fire suppression: gas-based (FM200 or equivalent)\nd) UPS and generator backup for continuous power\ne) Water leak detection\nf) No food, drink, or combustible materials permitted' },
      { heading: '5. Clear Desk & Clear Screen', bullets: ['Confidential/restricted documents locked away when unattended', 'Computer screens locked when leaving desk (Win+L / Ctrl+Cmd+Q)', 'Automatic screen lock after 5 minutes of inactivity', 'Printers: collect printouts immediately, use secure print where available', 'Whiteboards cleared after meetings'] },
      { heading: '6. Equipment Disposal', content: 'All IT equipment must be securely disposed of in compliance with WEEE regulations:\n\na) Hard drives: Degaussed and physically destroyed (NIST SP 800-88)\nb) SSDs: Cryptographic erasure + physical destruction\nc) Paper: Cross-cut shredding (DIN 66399 Level P-4 minimum)\nd) Disposal certificate obtained from approved vendor' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-028-IT-Change-Management.docx',
    docNumber: 'PRO-028', title: 'IT Change Management Procedure', version: '1.0',
    owner: '[IT Manager]', approvedBy: '[CISO]', isoRef: 'ISO/IEC 27001:2022 Annex A.8.32',
    sections: [
      { heading: '1. Purpose', content: 'To ensure all changes to information systems, infrastructure, and software are managed in a controlled manner, minimising the risk of disruption and security vulnerabilities.' },
      { heading: '2. Change Categories', table: { headers: ['Category', 'Description', 'Approval', 'Lead Time'], rows: [
        ['Standard', 'Pre-approved low-risk changes (e.g., routine patching)', 'Pre-approved by CAB', 'As scheduled'],
        ['Normal', 'Planned changes requiring assessment', 'Change Advisory Board (CAB)', 'Minimum 5 working days'],
        ['Emergency', 'Urgent changes to restore service or fix critical vulnerabilities', 'Emergency CAB (CISO + IT Manager)', 'Immediate — retrospective review within 48 hours']
      ]}},
      { heading: '3. Change Process', content: '1. Request: Change initiator submits Request for Change (RFC)\n2. Assess: Risk, impact, and resource assessment\n3. Approve: CAB reviews and approves/rejects\n4. Plan: Detailed implementation plan with rollback procedure\n5. Test: Change tested in non-production environment\n6. Implement: Change deployed in agreed maintenance window\n7. Review: Post-implementation review within 5 working days' },
      { heading: '4. Security Impact Assessment', content: 'All changes must include an assessment of security impact:\n\na) Does the change introduce new vulnerabilities?\nb) Does it affect access controls?\nc) Does it change the attack surface?\nd) Does it affect encryption or key management?\ne) Does it require an update to the risk register or SoA?' },
      { heading: '5. Rollback', content: 'Every change must have a documented rollback plan. If the change causes unexpected issues, the rollback plan must be executed within the defined rollback window.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/plans/PLN-011-ISMS-Audit-Programme.docx',
    docNumber: 'PLN-011', title: 'ISMS Internal Audit Programme', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[CISO]', isoRef: 'ISO/IEC 27001:2022 Clause 9.2',
    sections: [
      { heading: '1. Purpose', content: 'To establish a planned programme of internal audits to verify that the ISMS conforms to ISO/IEC 27001:2022 requirements and is effectively implemented and maintained.' },
      { heading: '2. Audit Schedule', table: { headers: ['Audit #', 'Scope (Clauses/Controls)', 'Auditee', 'Lead Auditor', 'Planned Date', 'Status'], rows: [
        ['ISMS-AUD-001', 'Clauses 4-5 (Context, Leadership)', '[Management]', '[Auditor]', 'Q1', 'Planned'],
        ['ISMS-AUD-002', 'Clauses 6-7 (Planning, Support)', '[IS Manager]', '[Auditor]', 'Q1', 'Planned'],
        ['ISMS-AUD-003', 'Clause 8 (Operation) + A.5 (Org Controls)', '[IT/IS Team]', '[Auditor]', 'Q2', 'Planned'],
        ['ISMS-AUD-004', 'A.6 (People) + A.7 (Physical)', '[HR + Facilities]', '[Auditor]', 'Q2', 'Planned'],
        ['ISMS-AUD-005', 'A.8 (Technological)', '[IT Team]', '[Auditor]', 'Q3', 'Planned'],
        ['ISMS-AUD-006', 'Clauses 9-10 (Performance, Improvement)', '[IS Manager]', '[Auditor]', 'Q3', 'Planned']
      ]}},
      { heading: '3. Auditor Competence', content: 'Internal auditors must:\n\na) Have completed ISO 27001 Lead Auditor or Internal Auditor training\nb) Be independent of the area being audited\nc) Have relevant information security knowledge\nd) Maintain records of audit competence in the training matrix (REG-006)' },
      { heading: '4. Audit Methodology', content: 'Audits follow ISO 19011 guidelines:\n\na) Planning: scope, criteria, schedule\nb) Opening meeting with auditee\nc) Evidence gathering: document review, interviews, observation, testing\nd) Analysis of findings\ne) Closing meeting with preliminary findings\nf) Audit report issued within 5 working days\ng) Corrective actions tracked to closure' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-021-ISMS-Management-Review.docx',
    docNumber: 'FRM-021', title: 'ISMS Management Review Record', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[CISO]', isoRef: 'ISO/IEC 27001:2022 Clause 9.3',
    sections: [
      { heading: '1. Meeting Details', table: { headers: ['Field', 'Detail'], rows: [
        ['Date', '[DD/MM/YYYY]'], ['Attendees', '[Names and roles]'], ['Chair', '[CISO / Managing Director]']
      ]}},
      { heading: '2. Mandatory Inputs (Clause 9.3)', table: { headers: ['Input', 'Status/Summary', 'Action Required'], rows: [
        ['Status of actions from previous reviews', '', ''],
        ['Changes to external and internal issues relevant to the ISMS', '', ''],
        ['Changes in needs and expectations of interested parties', '', ''],
        ['Feedback on information security performance (incidents, NCRs, objectives)', '', ''],
        ['Results of risk assessment and risk treatment plan status', '', ''],
        ['Audit results', '', ''],
        ['Opportunities for continual improvement', '', ''],
        ['Results of monitoring and measurement', '', '']
      ]}},
      { heading: '3. Decisions & Actions (Outputs)', table: { headers: ['Decision/Action', 'Owner', 'Due Date', 'Priority'], rows: [
        ['', '', '', ''], ['', '', '', ''], ['', '', '', '']
      ]}},
      { heading: '4. Sign-Off', content: 'Chair: _________________________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-022-ISMS-NCR-Corrective-Action.docx',
    docNumber: 'FRM-022', title: 'ISMS Nonconformity & Corrective Action Form', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[CISO]', isoRef: 'ISO/IEC 27001:2022 Clause 10.2',
    sections: [
      { heading: '1. Nonconformity Details', table: { headers: ['Field', 'Detail'], rows: [
        ['NCR Number', '[ISMS-NCR-YYYY-NNN]'], ['Date Raised', '[DD/MM/YYYY]'], ['Raised By', '[Name]'],
        ['Source', 'Internal Audit / External Audit / Incident / Observation'],
        ['ISMS Clause/Control', '[e.g., Clause 7.2 or A.8.7]'], ['Severity', 'Major / Minor / Observation']
      ]}},
      { heading: '2. Description of Nonconformity', content: '[Describe what was found to be nonconforming, including objective evidence]' },
      { heading: '3. Immediate Correction', content: '[Action taken to address the immediate issue]\n\nCompleted by: _____________ Date: ___/___/______' },
      { heading: '4. Root Cause Analysis', content: '[Analysis of the underlying root cause using 5-Whys, fishbone, or equivalent method]' },
      { heading: '5. Corrective Action', table: { headers: ['Action', 'Responsible', 'Due Date', 'Status'], rows: [
        ['', '', '', ''], ['', '', '', '']
      ]}},
      { heading: '6. Verification of Effectiveness', content: '[How was the corrective action verified to be effective? Date and evidence of verification]\n\nVerified by: _____________ Date: ___/___/______\nEffective: Yes / No — if No, further action required' },
      { heading: '7. Close-Out', content: 'NCR closed by: _____________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-017-InfoSec-Incident-Register.docx',
    docNumber: 'REG-017', title: 'Information Security Incident Register', version: '1.0',
    owner: '[Information Security Manager]', approvedBy: '[CISO]', isoRef: 'ISO/IEC 27001:2022 Annex A.5.24-5.27',
    sections: [
      { heading: '1. Incident Log', table: { headers: ['Incident #', 'Date Reported', 'Reporter', 'Category', 'Severity', 'Description', 'Impact', 'Status', 'Resolution Date'], rows: [
        ['SEC-001', '', '', 'Phishing/Malware/Breach/Loss/Unauthorised Access', 'P1-P4', '', '', 'Open/Investigating/Resolved/Closed', ''],
        ['SEC-002', '', '', '', '', '', '', '', ''],
        ['SEC-003', '', '', '', '', '', '', '', '']
      ]}},
      { heading: '2. Severity Classification', table: { headers: ['Priority', 'Description', 'Response Time', 'Escalation'], rows: [
        ['P1 — Critical', 'Active breach, data exfiltration, ransomware', '<1 hour', 'Immediate: CISO, CEO, Legal, ICO (if PII)'],
        ['P2 — High', 'Significant vulnerability exploited, suspected breach', '<4 hours', 'CISO, IS Manager, affected system owners'],
        ['P3 — Medium', 'Malware detection, policy violation, suspicious activity', '<8 hours', 'IS Manager, IT Security'],
        ['P4 — Low', 'Spam, minor policy breach, informational', '<24 hours', 'IT Security']
      ]}}
    ]
  },
  // ============================================
  // GDPR GAPS (11 templates)
  // ============================================
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-041-DPIA-Procedure.docx',
    docNumber: 'PRO-041', title: 'Data Protection Impact Assessment (DPIA) Procedure', version: '1.0',
    owner: '[Data Protection Officer]', approvedBy: '[Managing Director]', isoRef: 'GDPR Article 35',
    sections: [
      { heading: '1. Purpose', content: 'To define when and how Data Protection Impact Assessments (DPIAs) are conducted, ensuring compliance with GDPR Article 35 and UK GDPR.' },
      { heading: '2. When a DPIA is Required', content: 'A DPIA must be conducted before any processing that is likely to result in a high risk to the rights and freedoms of individuals. This includes:', bullets: [
        'Systematic and extensive profiling with significant effects',
        'Large-scale processing of special category data (Article 9) or criminal offence data (Article 10)',
        'Systematic monitoring of a publicly accessible area on a large scale',
        'Use of new technologies (AI, biometrics, IoT)',
        'Processing that prevents data subjects exercising a right or using a service',
        'Automated decision-making with legal or similarly significant effects',
        'Combining datasets from different sources',
        'Processing of vulnerable individuals\' data (children, employees, patients)'
      ]},
      { heading: '3. DPIA Process', content: '1. Screening: Determine if DPIA is required (use screening checklist)\n2. Describe: Document the processing (purpose, data, recipients, retention)\n3. Assess necessity: Is the processing necessary and proportionate?\n4. Identify risks: What risks does the processing pose to individuals?\n5. Mitigate: What measures will reduce the identified risks?\n6. DPO review: DPO provides written advice on the DPIA\n7. Approval: Senior management approves or rejects the processing\n8. Consult ICO: If residual high risks remain after mitigation, consult the supervisory authority before processing' },
      { heading: '4. DPO Consultation', content: 'The DPO must be consulted on all DPIAs and provide documented advice. If the DPO recommends against the processing and management overrides, the reasoning must be documented.' },
      { heading: '5. Records', content: 'Completed DPIAs are retained for the duration of the processing activity plus 6 years. DPIAs must be reviewed when the nature, scope, context, or purposes of processing change.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-032-DPIA-Form.docx',
    docNumber: 'FRM-032', title: 'Data Protection Impact Assessment (DPIA) Form', version: '1.0',
    owner: '[Data Protection Officer]', approvedBy: '[Managing Director]', isoRef: 'GDPR Article 35(7)',
    sections: [
      { heading: '1. Project/Processing Details', table: { headers: ['Field', 'Detail'], rows: [
        ['DPIA Reference', '[DPIA-YYYY-NNN]'], ['Project/System Name', ''], ['Data Controller', '[COMPANY NAME]'],
        ['Data Processor (if applicable)', ''], ['DPIA Author', ''], ['Date', '[DD/MM/YYYY]']
      ]}},
      { heading: '2. Description of Processing', content: '[Describe the processing operation: What data? Whose data? How collected? How used? Who has access? How long retained? Any transfers?]' },
      { heading: '3. Necessity & Proportionality (Article 35(7)(b))', content: '[Explain why this processing is necessary for the stated purpose. Why can the purpose not be achieved with less data or less intrusive means?]' },
      { heading: '4. Risk Assessment', table: { headers: ['Risk', 'Likelihood', 'Severity', 'Overall Risk', 'Mitigation Measure'], rows: [
        ['Unauthorised access to personal data', '', '', '', ''],
        ['Accidental loss or destruction', '', '', '', ''],
        ['Excessive data collection', '', '', '', ''],
        ['Inaccurate data leading to wrong decisions', '', '', '', ''],
        ['Re-identification of pseudonymised data', '', '', '', ''],
        ['[Other identified risk]', '', '', '', '']
      ]}},
      { heading: '5. DPO Advice', content: 'DPO Name: _________________________\nDPO Advice: [Accept / Accept with conditions / Reject]\nComments: [DPO written advice]\nDate: ___/___/______' },
      { heading: '6. Approval', content: 'Processing Approved: Yes / No\nIf No — ICO consultation required before processing commences.\n\nApproved by: _________________________ Date: ___/___/______\nTitle: [Senior Information Risk Owner]' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-042-Data-Breach-Notification.docx',
    docNumber: 'PRO-042', title: 'Personal Data Breach Notification Procedure', version: '1.0',
    owner: '[Data Protection Officer]', approvedBy: '[Managing Director]', isoRef: 'GDPR Articles 33-34',
    sections: [
      { heading: '1. Purpose', content: 'To ensure personal data breaches are detected, reported, investigated, and notified in compliance with GDPR Articles 33 (notification to supervisory authority) and 34 (communication to data subjects).' },
      { heading: '2. What is a Personal Data Breach', content: 'A breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to, personal data. This includes:', bullets: [
        'Confidentiality breach: unauthorised or accidental disclosure of or access to personal data',
        'Integrity breach: unauthorised or accidental alteration of personal data',
        'Availability breach: accidental or unauthorised loss of access to or destruction of personal data'
      ]},
      { heading: '3. Detection & Reporting', content: 'a) Any employee who suspects a personal data breach must report it to the DPO immediately (within 4 hours of becoming aware)\nb) Reports via: [email/phone/portal — provide specific contact details]\nc) The DPO logs the breach in the Data Breach Register (REG-028)\nd) The DPO assesses whether the breach is likely to result in a risk to individuals' },
      { heading: '4. ICO Notification (72-Hour Deadline)', content: 'If the breach is likely to result in a risk to the rights and freedoms of individuals:\n\na) The DPO must notify the ICO within 72 hours of becoming aware of the breach\nb) Notification via the ICO\'s online breach reporting tool\nc) Include: nature of breach, categories and approximate number of data subjects affected, likely consequences, measures taken\nd) If full information is not available within 72 hours, provide initial notification and supplement with further details' },
      { heading: '5. Data Subject Communication', content: 'If the breach is likely to result in a HIGH risk to individuals:\n\na) Communicate the breach to affected data subjects without undue delay\nb) Use clear, plain language\nc) Include: description of the breach, DPO contact details, likely consequences, measures taken to address/mitigate the breach\nd) Communication may be waived if: data was encrypted, subsequent measures eliminate the high risk, or disproportionate effort (use public communication instead)' },
      { heading: '6. Investigation & Remediation', content: 'a) DPO leads the breach investigation with support from IT Security and relevant departments\nb) Root cause analysis within 5 working days\nc) Corrective actions identified and assigned\nd) Lessons learned documented and shared\ne) DPIA updated if the breach relates to existing processing' },
      { heading: '7. Records', content: 'All breaches (including those not notified to the ICO) must be documented in the Data Breach Register (REG-028). Records retained for 6 years.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-028-Data-Breach-Register.docx',
    docNumber: 'REG-028', title: 'Personal Data Breach Register', version: '1.0',
    owner: '[Data Protection Officer]', approvedBy: '[Managing Director]', isoRef: 'GDPR Article 33(5)',
    sections: [
      { heading: '1. Breach Log', table: { headers: ['Breach #', 'Date Detected', 'Date Reported to DPO', 'Description', 'Data Categories', 'Approx. Subjects Affected', 'Risk Level', 'ICO Notified?', 'Subjects Notified?', 'Status'], rows: [
        ['PDB-001', '', '', '', '', '', 'Low/Medium/High', 'Yes/No', 'Yes/No', 'Open/Closed'],
        ['PDB-002', '', '', '', '', '', '', '', '', ''],
        ['PDB-003', '', '', '', '', '', '', '', '', '']
      ]}},
      { heading: '2. Risk Assessment Criteria', table: { headers: ['Risk Level', 'Description', 'ICO Notification Required?', 'Subject Communication Required?'], rows: [
        ['Low', 'Unlikely to result in risk to individuals', 'No (document decision)', 'No'],
        ['Medium', 'Likely to result in risk to individuals', 'Yes — within 72 hours', 'No (unless subsequently escalated)'],
        ['High', 'Likely to result in HIGH risk to individuals', 'Yes — within 72 hours', 'Yes — without undue delay']
      ]}}
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-043-Data-Subject-Rights.docx',
    docNumber: 'PRO-043', title: 'Data Subject Rights Procedure', version: '1.0',
    owner: '[Data Protection Officer]', approvedBy: '[Managing Director]', isoRef: 'GDPR Articles 12-22',
    sections: [
      { heading: '1. Purpose', content: 'To ensure [COMPANY NAME] responds to data subject rights requests lawfully, within the statutory timeframes, and in compliance with GDPR Articles 12-22.' },
      { heading: '2. Data Subject Rights', table: { headers: ['Right', 'GDPR Article', 'Description', 'Timeframe'], rows: [
        ['Access (DSAR)', 'Art 15', 'Copy of all personal data held about the individual', '1 month'],
        ['Rectification', 'Art 16', 'Correction of inaccurate or incomplete personal data', '1 month'],
        ['Erasure', 'Art 17', 'Deletion of personal data where no lawful basis for continued processing', '1 month'],
        ['Restriction', 'Art 18', 'Temporary suspension of processing while accuracy/lawfulness is verified', '1 month'],
        ['Data Portability', 'Art 20', 'Personal data provided in structured, machine-readable format', '1 month'],
        ['Objection', 'Art 21', 'Object to processing based on legitimate interests or direct marketing', 'Without undue delay'],
        ['Automated Decision-Making', 'Art 22', 'Right not to be subject to solely automated decisions with legal/significant effects', '1 month']
      ]}},
      { heading: '3. Process', content: '1. Receive: Request received via any channel (email, letter, verbal, web form)\n2. Log: Record in Data Subject Request Log (FRM-033)\n3. Verify: Verify the identity of the requester (reasonable measures)\n4. Assess: Determine which right is being exercised, any exemptions that apply\n5. Search: Identify all personal data held (all systems, paper records, email, backups)\n6. Review: Third-party data redacted, legal privilege assessed, exemptions applied\n7. Respond: Provide response within 1 calendar month of receipt\n8. Extension: If complex/numerous requests, extend by up to 2 additional months (notify requester within 1 month with reasons)' },
      { heading: '4. Exemptions', content: 'The following exemptions may apply (must be documented for each request):\n\na) Legal professional privilege\nb) Management forecasting or planning\nc) Ongoing negotiations\nd) Confidential references\ne) Regulatory functions\nf) Third-party data that cannot be redacted' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-033-Data-Subject-Request-Form.docx',
    docNumber: 'FRM-033', title: 'Data Subject Rights Request Form & Log', version: '1.0',
    owner: '[Data Protection Officer]', approvedBy: '[Managing Director]', isoRef: 'GDPR Articles 12, 15-22',
    sections: [
      { heading: '1. Request Log', table: { headers: ['Ref #', 'Date Received', 'Requester Name', 'Right Exercised', 'ID Verified?', 'Response Due', 'Response Sent', 'Extension?', 'Outcome', 'Notes'], rows: [
        ['DSR-001', '', '', '', 'Yes/No', '', '', 'Yes/No', '', ''],
        ['DSR-002', '', '', '', '', '', '', '', '', ''],
        ['DSR-003', '', '', '', '', '', '', '', '', '']
      ]}},
      { heading: '2. Request Form (for data subjects)', content: 'Name: _________________________\nEmail: _________________________\nRelationship to [COMPANY NAME]: Employee / Customer / Supplier / Other\n\nRight being exercised (tick):\n☐ Access (copy of my data)  ☐ Rectification  ☐ Erasure  ☐ Restriction\n☐ Data Portability  ☐ Objection  ☐ Automated Decision-Making\n\nDetails of request:\n[Space for requester to describe what they want]\n\nSignature: _________________________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-029-Data-Retention-Schedule.docx',
    docNumber: 'REG-029', title: 'Data Retention Schedule', version: '1.0',
    owner: '[Data Protection Officer]', approvedBy: '[Managing Director]', isoRef: 'GDPR Article 5(1)(e)',
    sections: [
      { heading: '1. Retention Schedule', table: { headers: ['Data Category', 'Examples', 'Lawful Basis', 'Retention Period', 'Disposal Method'], rows: [
        ['Employee records', 'Contracts, payroll, performance reviews', 'Contract / Legal obligation', '6 years after leaving', 'Secure deletion'],
        ['Recruitment records (unsuccessful)', 'CVs, interview notes, references', 'Legitimate interest', '6 months after decision', 'Secure deletion'],
        ['Customer records', 'Orders, invoices, correspondence', 'Contract / Legal obligation', '7 years after last transaction', 'Secure deletion'],
        ['Marketing consent records', 'Opt-in records, preferences', 'Consent', 'Duration of consent + 2 years', 'Secure deletion'],
        ['CCTV footage', 'Security camera recordings', 'Legitimate interest', '30 days (unless incident)', 'Automatic overwrite'],
        ['Website analytics', 'Cookies, browsing data', 'Consent', '26 months', 'Automatic deletion'],
        ['Health & safety records', 'Accident reports, risk assessments', 'Legal obligation', '40 years (occupational health) / 3 years (general)', 'Secure deletion'],
        ['Financial records', 'Accounts, tax records, VAT', 'Legal obligation', '7 years', 'Secure deletion'],
        ['Contracts', 'Signed agreements', 'Contract', '6 years after expiry', 'Secure deletion'],
        ['Training records', 'Certificates, attendance logs', 'Legitimate interest', 'Duration of employment + 6 years', 'Secure deletion']
      ]}},
      { heading: '2. Disposal Procedures', content: 'Paper: Cross-cut shredding (DIN 66399 P-4)\nElectronic: NIST SP 800-88 compliant secure deletion\nMedia: Degaussing + physical destruction with certificate\nCloud: Verified deletion by provider with written confirmation' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-044-Data-Processor-Agreement.docx',
    docNumber: 'PRO-044', title: 'Data Processing Agreement Template', version: '1.0',
    owner: '[Data Protection Officer]', approvedBy: '[Legal / Managing Director]', isoRef: 'GDPR Article 28(3)',
    sections: [
      { heading: '1. Parties', content: 'Data Controller: [COMPANY NAME] ("the Controller")\nData Processor: [PROCESSOR NAME] ("the Processor")' },
      { heading: '2. Subject Matter & Duration', content: 'Subject matter: [Description of processing]\nDuration: [Contract period]\nNature of processing: [Collection, storage, retrieval, analysis, etc.]\nPurpose: [Purpose of processing]\nCategories of data subjects: [Employees, customers, etc.]\nTypes of personal data: [Name, email, financial data, etc.]' },
      { heading: '3. Processor Obligations (Article 28(3))', bullets: [
        '(a) Process personal data only on documented instructions from the Controller',
        '(b) Ensure persons authorised to process personal data are bound by confidentiality',
        '(c) Take all measures required pursuant to Article 32 (security of processing)',
        '(d) Not engage a sub-processor without prior written authorisation of the Controller',
        '(e) Assist the Controller with data subject rights requests',
        '(f) Assist the Controller with obligations under Articles 32-36 (security, breach notification, DPIA)',
        '(g) Delete or return all personal data on termination of the contract',
        '(h) Make available all information necessary to demonstrate compliance and allow for audits'
      ]},
      { heading: '4. Sub-Processing', content: 'The Processor shall not engage any sub-processor without prior specific or general written authorisation from the Controller. Where general authorisation is given, the Processor shall inform the Controller of any intended changes concerning the addition or replacement of sub-processors, giving the Controller an opportunity to object.' },
      { heading: '5. International Transfers', content: 'The Processor shall not transfer personal data to a country outside the UK/EEA without prior written consent and appropriate safeguards (Standard Contractual Clauses, adequacy decision, or other approved mechanism).' },
      { heading: '6. Breach Notification', content: 'The Processor shall notify the Controller without undue delay (and no later than 24 hours) after becoming aware of a personal data breach affecting Controller data.' },
      { heading: '7. Audit Rights', content: 'The Processor shall make available to the Controller all information necessary to demonstrate compliance with Article 28 obligations and allow for and contribute to audits, including inspections, conducted by the Controller or an auditor mandated by the Controller.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-034-Legitimate-Interest-Assessment.docx',
    docNumber: 'FRM-034', title: 'Legitimate Interest Assessment (LIA)', version: '1.0',
    owner: '[Data Protection Officer]', approvedBy: '[Managing Director]', isoRef: 'GDPR Article 6(1)(f)',
    sections: [
      { heading: '1. Assessment Details', table: { headers: ['Field', 'Detail'], rows: [
        ['LIA Reference', '[LIA-YYYY-NNN]'], ['Processing Activity', ''], ['Date', '[DD/MM/YYYY]'], ['Assessor', '']
      ]}},
      { heading: '2. Purpose Test', content: 'What is the legitimate interest you are pursuing?\n[Describe the specific interest — it must be real, current, and not speculative]\n\nIs this interest legitimate (lawful, clearly identified, real)? Yes / No' },
      { heading: '3. Necessity Test', content: 'Is the processing necessary for this purpose?\n[Can you achieve the same purpose without processing personal data, or with less data?]\n\nIs there a less intrusive alternative? Yes / No — if Yes, explain why it is not used:' },
      { heading: '4. Balancing Test', content: 'Nature of the personal data: [Ordinary / Special category / Children\'s data]\nReasonable expectations of individuals: [Would they expect this processing?]\nImpact on individuals: [What effect does the processing have?]\nAre you processing data about children or vulnerable individuals? Yes / No\nAre there any safeguards to reduce the impact? [Describe safeguards]\n\nOverall balance: Do the individual\'s interests override the legitimate interest? Yes / No' },
      { heading: '5. Decision', content: 'Processing approved on legitimate interest basis: Yes / No\n\nIf Yes — ensure privacy notice is updated to reflect this processing and lawful basis.\nIf No — alternative lawful basis required or processing must not proceed.\n\nApproved by: _________________________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-045-Consent-Management.docx',
    docNumber: 'PRO-045', title: 'Consent Management Procedure', version: '1.0',
    owner: '[Data Protection Officer]', approvedBy: '[Managing Director]', isoRef: 'GDPR Articles 6(1)(a), 7',
    sections: [
      { heading: '1. Purpose', content: 'To ensure valid consent is obtained, recorded, managed, and withdrawable for all processing activities that rely on consent as the lawful basis under GDPR Article 6(1)(a).' },
      { heading: '2. Requirements for Valid Consent', bullets: [
        'Freely given: Not conditional on a service, no imbalance of power, granular (separate consent for different purposes)',
        'Specific: Clearly identified processing purpose(s)',
        'Informed: Data subject knows who the controller is, what data, why, and their right to withdraw',
        'Unambiguous: Clear affirmative action (opt-in, not pre-ticked boxes)',
        'Explicit: Required for special category data (Article 9) — must be expressly confirmed'
      ]},
      { heading: '3. Consent Records', content: 'For each consent obtained, the following must be recorded:\n\na) Who consented (data subject identifier)\nb) When they consented (date and time)\nc) What they were told at the time (version of privacy notice/consent form)\nd) How they consented (online form, paper form, verbal — with witness)\ne) Whether they have withdrawn consent (date of withdrawal)' },
      { heading: '4. Withdrawal of Consent', content: 'Data subjects must be able to withdraw consent as easily as they gave it:\n\na) Provide clear mechanism for withdrawal (unsubscribe link, online form, contact DPO)\nb) Process withdrawal requests within 48 hours\nc) Cease processing on the withdrawn basis immediately\nd) Inform data subjects of any consequences of withdrawal\ne) Retain record of the consent and its withdrawal' },
      { heading: '5. Review', content: 'Consent mechanisms and records shall be reviewed annually to ensure they remain valid, up-to-date, and compliant with current ICO guidance.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-035-International-Transfer-Assessment.docx',
    docNumber: 'FRM-035', title: 'International Data Transfer Assessment', version: '1.0',
    owner: '[Data Protection Officer]', approvedBy: '[Managing Director]', isoRef: 'GDPR Articles 44-49',
    sections: [
      { heading: '1. Transfer Details', table: { headers: ['Field', 'Detail'], rows: [
        ['Reference', '[TRA-YYYY-NNN]'], ['Data Exporter', '[COMPANY NAME]'],
        ['Data Importer', '[Name, country]'], ['Transfer Mechanism', 'Adequacy / SCCs / BCRs / Derogation'],
        ['Data Categories', ''], ['Data Subjects', ''], ['Purpose', '']
      ]}},
      { heading: '2. Transfer Impact Assessment', content: 'Following Schrems II, assess the data protection laws of the recipient country:\n\na) Does the country have adequate data protection laws? [Yes/No — check ICO list]\nb) Can public authorities access the data (surveillance laws)? [Assess]\nc) Are there effective legal remedies available to data subjects? [Assess]\nd) What supplementary measures are in place? [Encryption, pseudonymisation, contractual clauses]' },
      { heading: '3. Safeguard Mechanism', content: 'Selected mechanism and justification:\n\n☐ Adequacy decision (specify)\n☐ Standard Contractual Clauses (attach executed SCCs)\n☐ Binding Corporate Rules (specify)\n☐ Derogation under Article 49 (specify which derogation and why)\n☐ Other (specify)' },
      { heading: '4. Decision', content: 'Transfer approved: Yes / No\n\nApproved by: _________________________ Date: ___/___/______' }
    ]
  }
];

async function main() {
  const tmpDir = '/tmp/gap-batch1-configs';
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.mkdirSync('/home/dyl/New-BMS/docs/compliance-templates/generated', { recursive: true });

  console.log(`Generating ${templates.length} gap-filling templates (Batch 1)...`);
  for (const t of templates) {
    const configPath = path.join(tmpDir, `${t.docNumber}.json`);
    fs.writeFileSync(configPath, JSON.stringify(t, null, 2));
    try {
      execSync(`node /home/dyl/New-BMS/scripts/create-docx.mjs ${configPath}`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed: ${t.docNumber} - ${e.message}`);
    }
  }
  console.log(`\nDone: ${templates.length} templates generated.`);
}

main().catch(err => { console.error(err); process.exit(1); });
