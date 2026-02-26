// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
#!/usr/bin/env node
/**
 * Generates all 15 IMS procedure DOCX files using create-docx.mjs
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE = '/home/dyl/New-BMS';
const OUT_DIR = 'docs/compliance-templates/procedures';

const procedures = [
  // ─── PRO-001 ───
  {
    outputPath: `${OUT_DIR}/PRO-001-Document-Records-Control.docx`,
    docNumber: 'PRO-001',
    title: 'Document & Records Control Procedure',
    version: '1.0',
    owner: '[Document Controller]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 7.5',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the requirements for creating, reviewing, approving, distributing, and controlling documented information within [COMPANY NAME]. It ensures that all documents and records required by the Integrated Management System (IMS) are current, legible, identifiable, and available at the point of use.\n\nThe procedure applies to both electronic and physical documents and establishes the retention and disposition requirements for quality records in accordance with ISO 9001:2015 Clause 7.5.',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all documented information required by the IMS, including but not limited to policies, procedures, work instructions, forms, templates, specifications, drawings, external documents, and quality records. It covers all departments, sites, and personnel within [COMPANY NAME] who create, use, or maintain controlled documents.',
      },
      {
        heading: '3. Definitions',
        content: 'The following definitions apply throughout this procedure:',
      },
      {
        bullets: [
          'Controlled Document — Any document that is subject to the approval and change control requirements of this procedure.',
          'Obsolete Document — A document that has been superseded by a newer version or is no longer required. Must be removed from points of use.',
          'Document Owner — The individual responsible for maintaining the accuracy and currency of a specific document.',
          'Master Copy — The authoritative version of a controlled document maintained by the Document Controller.',
          'Records — Documents that state results achieved or provide evidence of activities performed. Records are not subject to revision but must be retained per the retention schedule.',
          'External Document — Any document of external origin that is required for IMS operation (e.g., standards, regulations, customer specifications).',
          'DMS — Document Management System, the electronic system used to store and control documents.',
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              '[Document Controller]',
              'Maintains the master document register, assigns document numbers, controls distribution, manages the DMS, and ensures obsolete documents are withdrawn.',
            ],
            [
              '[Quality Manager]',
              'Approves all IMS policies and procedures. Ensures document control compliance during internal audits.',
            ],
            [
              'Document Owners',
              'Ensure their documents are accurate, current, and reviewed at the required frequency. Initiate change requests when updates are needed.',
            ],
            [
              'All Personnel',
              'Use only current, controlled versions of documents. Report any discrepancies or needs for document changes to the Document Controller.',
            ],
            [
              'Department Managers',
              'Ensure their teams have access to required documents and that obsolete copies are removed from their areas.',
            ],
          ],
        },
      },
      {
        heading: '5. Document Numbering Convention',
        content:
          'All controlled documents shall be assigned a unique identifier using the following format:',
      },
      {
        table: {
          headers: ['Document Type', 'Prefix', 'Example'],
          rows: [
            ['Policy', 'POL-NNN', 'POL-001 Quality Policy'],
            ['Procedure', 'PRO-NNN', 'PRO-001 Document Control Procedure'],
            ['Work Instruction', 'WI-NNN', 'WI-001 Calibration of Test Equipment'],
            ['Form / Template', 'FRM-NNN', 'FRM-001 Document Change Request Form'],
            ['Specification', 'SPC-NNN', 'SPC-001 Raw Material Specification'],
            ['External Document', 'EXT-NNN', 'EXT-001 ISO 9001:2015 Standard'],
          ],
        },
      },
      { heading: '6. Procedure — Document Creation & Review', content: '' },
      {
        heading: '6.1 Document Creation',
        level: 2,
        content:
          'When a new document is required, the initiator shall complete a Document Request Form (FRM-001) and submit it to the [Document Controller]. The request must include the purpose, intended audience, proposed content outline, and the suggested document owner.\n\nThe [Document Controller] assigns a unique document number and provides the appropriate template. The document author drafts the document using the standard template, ensuring it includes the document header (number, title, version, date, owner), purpose, scope, and all relevant content sections.',
      },
      {
        heading: '6.2 Document Review & Approval',
        level: 2,
        content:
          'All new documents and revisions shall be reviewed for adequacy and accuracy before approval. The review process is as follows:',
      },
      {
        numberedList: [
          'Step 1: The document author completes the draft and submits it to the Document Owner for technical review.',
          'Step 2: The Document Owner reviews for accuracy, completeness, and conformity with IMS requirements. Comments are returned to the author if changes are needed.',
          'Step 3: Once the Document Owner is satisfied, the document is submitted to the designated Approver (as defined in the Document Approval Matrix).',
          'Step 4: The Approver reviews and either approves, requests changes, or rejects the document. Approval is recorded with an electronic signature or wet-ink signature and date.',
          'Step 5: Upon approval, the [Document Controller] updates the Master Document Register and issues the document for distribution.',
        ],
      },
      {
        heading: '6.3 Document Distribution',
        level: 2,
        content:
          'Approved documents are distributed through the DMS. Electronic copies are made available to all relevant personnel via the shared document repository. Where physical copies are required (e.g., workshop areas without computer access), the [Document Controller] issues stamped controlled copies with a distribution list.\n\nUncontrolled copies may be issued for reference purposes only and are clearly marked as "UNCONTROLLED — FOR REFERENCE ONLY". Uncontrolled copies are not subject to revision updates.',
      },
      { heading: '7. Procedure — Version Control & Changes', content: '' },
      {
        heading: '7.1 Version Numbering',
        level: 2,
        content:
          'Documents use a sequential version numbering system (1.0, 2.0, 3.0 for major revisions; 1.1, 1.2 for minor editorial changes). Each revision increments the version number. A revision history table at the front of each document records the version, date, description of change, author, and approver.',
      },
      {
        heading: '7.2 Change Request Process',
        level: 2,
        content:
          'Any person may request a change to a controlled document by submitting a Document Change Request (FRM-002) to the [Document Controller]. The change request must describe the proposed change and its justification. The Document Owner evaluates the request and determines whether the change is warranted.\n\nApproved changes follow the same review and approval workflow as new documents. The [Document Controller] ensures the previous version is archived and replaced with the new version at all points of use.',
      },
      {
        heading: '8. Obsolete Document Management',
        content:
          'When a document is superseded or withdrawn, the [Document Controller] removes all controlled copies from distribution points and marks them as "OBSOLETE". Electronic copies are moved to an archive folder in the DMS with restricted access.\n\nOne master copy of each obsolete document is retained for the period specified in the Retention Schedule. Obsolete documents retained for legal or knowledge-preservation purposes must be clearly identified to prevent unintended use.',
      },
      {
        heading: '9. Records Management & Retention',
        content:
          'Quality records provide evidence of conformity to requirements and effective operation of the IMS. Records shall be legible, readily identifiable, and retrievable. The following retention periods apply:',
      },
      {
        table: {
          headers: ['Record Type', 'Retention Period', 'Storage Location', 'Disposition'],
          rows: [
            ['Management Review Minutes', '5 years', 'DMS / Quality folder', 'Secure destruction'],
            ['Internal Audit Reports', '5 years', 'DMS / Audit folder', 'Secure destruction'],
            ['Training Records', 'Employment + 6 years', 'DMS / HR folder', 'Secure destruction'],
            [
              'Calibration Certificates',
              '5 years',
              'DMS / Maintenance folder',
              'Secure destruction',
            ],
            ['Customer Complaints', '7 years', 'DMS / Quality folder', 'Secure destruction'],
            [
              'Supplier Evaluations',
              '3 years after last supply',
              'DMS / Procurement folder',
              'Secure destruction',
            ],
            ['Incident Reports', '10 years', 'DMS / H&S folder', 'Secure destruction'],
            [
              'Design Records',
              'Product lifetime + 10 years',
              'DMS / Engineering folder',
              'Secure destruction',
            ],
          ],
        },
      },
      {
        heading: '10. Electronic vs Physical Records',
        content:
          'Electronic records stored in the DMS are the preferred format. Electronic records must be backed up daily with off-site replication. Access controls ensure only authorised personnel can view, edit, or delete records.\n\nPhysical records, where required, shall be stored in secure, fire-rated cabinets with restricted access. Physical records must be indexed and catalogued for retrieval. Where both electronic and physical copies exist, the electronic copy is the master unless otherwise specified.',
      },
      { heading: '11. Related Documents', content: '' },
      {
        bullets: [
          'FRM-001 — Document Request Form',
          'FRM-002 — Document Change Request Form',
          'FRM-003 — Master Document Register',
          'FRM-004 — Document Distribution List',
          'FRM-005 — Records Retention Schedule',
          'POL-001 — Quality Policy',
          'PRO-002 — Internal Audit Procedure',
        ],
      },
      {
        heading: '12. Review',
        content:
          'This procedure shall be reviewed at least annually by the [Document Controller] and [Quality Manager], or sooner if triggered by significant organisational changes, audit findings, regulatory changes, or management review outputs. The review date and outcome shall be recorded in the revision history table.',
      },
    ],
  },
  // ─── PRO-002 ───
  {
    outputPath: `${OUT_DIR}/PRO-002-Internal-Audit.docx`,
    docNumber: 'PRO-002',
    title: 'Internal Audit Procedure',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001/14001/45001 Clause 9.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          "This procedure establishes the requirements for planning, conducting, reporting, and following up on internal audits of the Integrated Management System (IMS) at [COMPANY NAME]. Internal audits verify that the IMS conforms to the requirements of ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018, as well as [COMPANY NAME]'s own IMS requirements, and that it is effectively implemented and maintained.",
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all internal audits of the IMS, covering all processes, departments, and sites within [COMPANY NAME]. It encompasses quality management, environmental management, and occupational health & safety management system audits. The procedure covers the full audit cycle from programme planning through to corrective action verification and closure.',
      },
      { heading: '3. Definitions', content: '' },
      {
        bullets: [
          'Audit Programme — A set of one or more audits planned for a specific time frame and directed towards a specific purpose.',
          'Audit Plan — A description of the activities and arrangements for a specific audit.',
          'Audit Criteria — The set of policies, procedures, or requirements used as a reference against which audit evidence is compared.',
          'Audit Evidence — Records, statements of fact, or other verifiable information relevant to the audit criteria.',
          'Audit Finding — Result of evaluating audit evidence against audit criteria. Classified as Major NC, Minor NC, OFI, or Conformity.',
          'Major Nonconformity (Major NC) — Absence of, or total breakdown in, a required system element, or a situation that would raise significant doubt about the ability to achieve intended outputs.',
          'Minor Nonconformity (Minor NC) — A single observed lapse or isolated non-fulfilment of a requirement that does not represent a systemic failure.',
          'Opportunity for Improvement (OFI) — An observation where conformity exists but where improvement would enhance performance.',
          'Lead Auditor — The auditor appointed to manage and direct a specific audit.',
          'Auditee — The person, department, or process being audited.',
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              '[Quality Manager]',
              'Establishes and manages the annual audit programme. Assigns lead auditors. Reviews audit reports. Monitors corrective action completion.',
            ],
            [
              'Lead Auditor',
              'Plans the individual audit, prepares checklists, conducts the audit, leads opening and closing meetings, writes the audit report.',
            ],
            [
              'Audit Team Members',
              'Collect and evaluate audit evidence objectively. Document findings accurately.',
            ],
            [
              'Auditees / Department Managers',
              'Provide access to processes, documents, and personnel. Implement corrective actions within agreed timescales.',
            ],
            [
              '[Managing Director]',
              'Reviews audit programme results during management review. Provides resources for auditing activities.',
            ],
          ],
        },
      },
      {
        heading: '5. Auditor Competence & Independence',
        content:
          'Internal auditors shall have completed a recognised internal auditor training course (e.g., CQI/IRCA ISO 9001/14001/45001 Internal Auditor). Auditors must demonstrate knowledge of audit principles, audit techniques, and the relevant management system standards.\n\nAuditors shall not audit their own work or areas for which they have direct responsibility, to ensure objectivity and impartiality. The [Quality Manager] maintains a register of qualified auditors and their competencies.',
      },
      {
        heading: '6. Audit Programme Planning',
        content:
          'The [Quality Manager] prepares an Annual Audit Programme at the start of each calendar year. The programme ensures all IMS processes and clauses of ISO 9001, ISO 14001, and ISO 45001 are audited at least once per year. The frequency of audits for specific areas is determined based on:',
      },
      {
        bullets: [
          'The importance and risk level of the process.',
          'Results of previous audits (areas with nonconformities receive increased audit frequency).',
          'Changes to processes, equipment, or organisational structure.',
          'Customer complaints or external audit findings related to the area.',
          'Legal and regulatory requirements.',
        ],
      },
      {
        content:
          'The audit programme is approved by the [Managing Director] and communicated to all department managers. Changes to the programme are documented and approved by the [Quality Manager].',
      },
      { heading: '7. Audit Execution', content: '' },
      {
        heading: '7.1 Audit Preparation',
        level: 2,
        content:
          'The Lead Auditor prepares an Audit Plan at least two weeks before the scheduled audit date. The plan includes the audit scope, criteria, schedule, team members, and logistics. The Lead Auditor also prepares audit checklists based on the applicable ISO clauses, procedures, and previous audit findings.\n\nThe Audit Plan is communicated to the auditee at least one week before the audit to allow adequate preparation.',
      },
      {
        heading: '7.2 Opening Meeting',
        level: 2,
        content:
          'The Lead Auditor conducts an opening meeting with the auditee to confirm the audit scope, objectives, schedule, methodology, and reporting arrangements. Any concerns or constraints are discussed and resolved.',
      },
      {
        heading: '7.3 Evidence Collection',
        level: 2,
        content:
          'The audit team collects evidence through interviews with personnel, observation of activities, and examination of documents and records. Evidence is documented in audit checklists and working papers. All findings are based on objective evidence.',
      },
      {
        heading: '7.4 Finding Classification',
        level: 2,
        content: 'Each finding is classified according to the following criteria:',
      },
      {
        table: {
          headers: ['Classification', 'Definition', 'Response Required'],
          rows: [
            [
              'Major NC',
              'Absence or total breakdown of a system element; systematic failure',
              'Corrective action within 30 days; root cause analysis required',
            ],
            [
              'Minor NC',
              'Isolated non-fulfilment; single lapse',
              'Corrective action within 60 days; root cause analysis recommended',
            ],
            [
              'OFI',
              'Conformity exists but improvement opportunity identified',
              'Consideration and response within 90 days; no formal CA required',
            ],
            [
              'Conformity',
              'Requirement fully met; evidence demonstrates effective implementation',
              'No action required; positive finding recorded',
            ],
          ],
        },
      },
      {
        heading: '7.5 Closing Meeting',
        level: 2,
        content:
          'The Lead Auditor conducts a closing meeting to present audit findings, discuss conclusions, and agree on corrective action timescales. The auditee has the opportunity to seek clarification on any findings. The closing meeting attendance is recorded.',
      },
      {
        heading: '8. Audit Reporting',
        content:
          'The Lead Auditor completes the Internal Audit Report (FRM-010) within 5 working days of the audit. The report includes: audit scope and criteria, personnel interviewed, summary of findings by classification, detailed description of each nonconformity with objective evidence, positive observations, and agreed corrective action due dates.\n\nThe report is reviewed and approved by the [Quality Manager] and distributed to the auditee and relevant management.',
      },
      {
        heading: '9. Corrective Action & Follow-Up',
        content:
          'For each Major NC and Minor NC, the auditee completes a Corrective Action Request (FRM-011) identifying the root cause, planned corrective actions, responsible persons, and target completion dates. The [Quality Manager] reviews and approves the proposed corrective actions.\n\nUpon completion of corrective actions, the Lead Auditor (or designated auditor) verifies the effectiveness of the actions taken. Verification includes review of evidence that the root cause has been addressed and the nonconformity will not recur. Verified actions are closed in the audit tracking system.\n\nOverdue corrective actions are escalated to the [Quality Manager] and reported at management review.',
      },
      { heading: '10. Records', content: '' },
      {
        bullets: [
          'Annual Audit Programme (FRM-009)',
          'Individual Audit Plans',
          'Audit Checklists (completed)',
          'Internal Audit Reports (FRM-010)',
          'Corrective Action Requests (FRM-011)',
          'Auditor Competence Register',
          'Opening and Closing Meeting Attendance Records',
        ],
      },
      { heading: '11. Related Documents', content: '' },
      {
        bullets: [
          'PRO-001 — Document & Records Control Procedure',
          'PRO-003 — Corrective Action & CAPA Procedure',
          'PRO-008 — Management Review Procedure',
          'POL-001 — Quality Policy',
          'POL-002 — Environmental Policy',
          'POL-003 — Health & Safety Policy',
        ],
      },
      {
        heading: '12. Review',
        content:
          'This procedure shall be reviewed at least annually by the [Quality Manager], or sooner if triggered by changes to ISO standards, significant audit findings, changes to organisational structure, or management review outputs.',
      },
    ],
  },
  // ─── PRO-003 ───
  {
    outputPath: `${OUT_DIR}/PRO-003-Corrective-Action-CAPA.docx`,
    docNumber: 'PRO-003',
    title: 'Corrective Action & CAPA Procedure',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 10.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the process for initiating, investigating, implementing, and verifying corrective actions and Corrective and Preventive Actions (CAPA) within [COMPANY NAME]. It ensures that nonconformities are effectively addressed, root causes are eliminated, and recurrence is prevented through systematic analysis and action.',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all nonconformities identified through any source within the IMS, including internal audits, external audits, customer complaints, product/service nonconformities, incident investigations, management review actions, supplier issues, and process monitoring. It covers all departments and sites of [COMPANY NAME].',
      },
      { heading: '3. Definitions', content: '' },
      {
        bullets: [
          'Nonconformity (NC) — Non-fulfilment of a specified requirement.',
          'Correction — Action taken to eliminate a detected nonconformity (immediate fix).',
          'Corrective Action — Action taken to eliminate the root cause of a detected nonconformity to prevent recurrence.',
          'Preventive Action — Action taken to eliminate the cause of a potential nonconformity to prevent occurrence.',
          'CAPA — Corrective and Preventive Action; the combined systematic process.',
          'Root Cause — The fundamental reason for the occurrence of a nonconformity.',
          'NCR — Nonconformity Report, the formal record documenting the NC and subsequent actions.',
          'Effectiveness Review — Verification that corrective actions have eliminated the root cause and prevented recurrence.',
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              '[Quality Manager]',
              'Manages the CAPA system. Reviews and approves NCRs. Assigns investigators. Monitors CAPA status and overdue actions. Reports to management review.',
            ],
            ['NCR Initiator', 'Any person who identifies a nonconformity and raises an NCR.'],
            [
              'Investigator / Action Owner',
              'Conducts root cause analysis, identifies and implements corrective actions, provides evidence of completion.',
            ],
            [
              'Department Managers',
              'Support investigations, provide resources, ensure actions are completed within agreed timescales.',
            ],
            [
              '[Managing Director]',
              'Approves resource allocation for significant CAPAs. Reviews CAPA performance at management review.',
            ],
          ],
        },
      },
      {
        heading: '5. CAPA Initiation Triggers',
        content: 'A CAPA may be initiated from any of the following sources:',
      },
      {
        bullets: [
          'Internal audit findings (Major NC or Minor NC)',
          'External audit findings (certification body or customer audits)',
          'Customer complaints or returns',
          'Product or service nonconformities identified during inspection or testing',
          'Process monitoring data indicating adverse trends',
          'Incident or accident investigations',
          'Management review actions',
          'Supplier nonconformities',
          'Regulatory inspection findings',
          'Employee suggestions or near-miss reports',
        ],
      },
      { heading: '6. Procedure', content: '' },
      {
        heading: '6.1 Step 1 — Identification & Immediate Containment',
        level: 2,
        content:
          'When a nonconformity is identified, the initiator raises an NCR using the NCR Form (FRM-020). The NCR includes a clear description of the nonconformity, the date and location of occurrence, the standard/requirement breached, and any immediate evidence.\n\nThe initiator and/or responsible manager implements immediate containment actions to limit the impact of the nonconformity. Containment may include quarantining product, stopping a process, issuing alerts, or implementing temporary controls.',
      },
      {
        heading: '6.2 Step 2 — NCR Review & Assignment',
        level: 2,
        content:
          'The [Quality Manager] reviews the NCR within 2 working days, confirms the classification (Major NC, Minor NC, or OFI), assigns a severity rating, and designates an Investigator/Action Owner. The NCR is logged in the CAPA Register with a unique reference number.',
      },
      {
        heading: '6.3 Step 3 — Root Cause Analysis',
        level: 2,
        content:
          'The Investigator conducts a root cause analysis using one or more of the following methods, proportionate to the severity of the nonconformity:',
      },
      {
        table: {
          headers: ['Method', 'Description', 'When to Use'],
          rows: [
            [
              '5-Why Analysis',
              'Iteratively asking "Why?" to drill down from the symptom to the root cause.',
              'Minor NCs, simple cause chains, quick investigations.',
            ],
            [
              'Fishbone / Ishikawa Diagram',
              'Categorises potential causes under Man, Machine, Method, Material, Measurement, Environment.',
              'Complex NCs with multiple potential contributing factors.',
            ],
            [
              '8D Problem Solving',
              'Eight-discipline structured approach: team, problem description, containment, root cause, corrective action, preventive action, congratulate team.',
              'Major NCs, customer complaints, recurring issues requiring cross-functional resolution.',
            ],
            [
              'Fault Tree Analysis',
              'Top-down deductive analysis using Boolean logic to identify combinations of faults.',
              'Safety-critical or high-severity NCs.',
            ],
            [
              'Pareto Analysis',
              'Identifies the vital few causes contributing to the majority of nonconformities.',
              'Trend analysis across multiple NCRs.',
            ],
          ],
        },
      },
      {
        heading: '6.4 Step 4 — Action Planning',
        level: 2,
        content:
          'Based on the root cause analysis, the Investigator develops a Corrective Action Plan that includes specific actions to eliminate the root cause, responsible persons for each action, target completion dates, and required resources. Where appropriate, preventive actions are also identified to address similar potential nonconformities in other areas.\n\nThe action plan is reviewed and approved by the [Quality Manager] and the relevant Department Manager.',
      },
      {
        heading: '6.5 Step 5 — Implementation',
        level: 2,
        content:
          'Action Owners implement the corrective and preventive actions within the agreed timescales. Progress is tracked in the CAPA Register. If an action cannot be completed by the target date, the Action Owner must notify the [Quality Manager] with a revised date and justification.',
      },
      {
        heading: '6.6 Step 6 — Verification & Effectiveness Review',
        level: 2,
        content:
          'Once all actions are reported as complete, the [Quality Manager] or designated verifier checks that the actions have been implemented as planned and that objective evidence of completion exists.\n\nAn effectiveness review is conducted after a defined period (typically 30-90 days after closure) to confirm that the root cause has been eliminated and the nonconformity has not recurred. The effectiveness review is recorded on the NCR form.',
      },
      {
        heading: '6.7 Step 7 — Escalation & Closure',
        level: 2,
        content:
          'CAPAs that are overdue by more than 14 days are escalated to the relevant Department Manager. CAPAs overdue by more than 30 days are escalated to the [Managing Director]. The CAPA is formally closed only when the effectiveness review confirms successful resolution. Closed CAPAs are archived in accordance with PRO-001.',
      },
      {
        heading: '7. CAPA Performance Monitoring',
        content:
          'The [Quality Manager] monitors CAPA performance through the following KPIs, reported monthly and at management review:',
      },
      {
        bullets: [
          'Number of open CAPAs by age and severity',
          'Percentage of CAPAs closed on time',
          'Average time to closure by severity',
          'Number of recurring nonconformities (effectiveness failures)',
          'CAPA source analysis (audit, complaint, incident, etc.)',
        ],
      },
      { heading: '8. Records', content: '' },
      {
        bullets: [
          'FRM-020 — Nonconformity Report (NCR) Form',
          'FRM-021 — Root Cause Analysis Worksheet',
          'FRM-022 — Corrective Action Plan',
          'CAPA Register (maintained in IMS system)',
        ],
      },
      { heading: '9. Related Documents', content: '' },
      {
        bullets: [
          'PRO-002 — Internal Audit Procedure',
          'PRO-004 — Risk & Opportunity Management Procedure',
          'PRO-007 — Incident Investigation & Reporting Procedure',
          'PRO-008 — Management Review Procedure',
        ],
      },
      {
        heading: '10. Review',
        content:
          'This procedure shall be reviewed at least annually by the [Quality Manager], or sooner if triggered by significant audit findings, changes to standards, or management review decisions. CAPA trend data shall inform whether procedural changes are needed.',
      },
    ],
  },
  // ─── PRO-004 ───
  {
    outputPath: `${OUT_DIR}/PRO-004-Risk-Opportunity-Management.docx`,
    docNumber: 'PRO-004',
    title: 'Risk & Opportunity Management Procedure',
    version: '1.0',
    owner: '[Risk Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 6.1',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure establishes the systematic approach for identifying, assessing, treating, monitoring, and reviewing risks and opportunities within [COMPANY NAME]. It ensures that risks to the achievement of IMS objectives are managed proactively and that opportunities for improvement are identified and pursued.',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all strategic, operational, project, and compliance risks across all departments and sites of [COMPANY NAME]. It covers risks related to quality (ISO 9001), environmental (ISO 14001), and occupational health and safety (ISO 45001) management, as well as business continuity and information security risks where applicable.',
      },
      { heading: '3. Definitions', content: '' },
      {
        bullets: [
          'Risk — The effect of uncertainty on objectives; expressed as a combination of the likelihood of an event and its consequence.',
          'Opportunity — A set of circumstances that, if exploited, could lead to improved performance or competitive advantage.',
          'Risk Owner — The individual accountable for managing a specific risk.',
          'Inherent Risk — The level of risk before any controls or mitigations are applied.',
          'Residual Risk — The level of risk remaining after controls and mitigations are applied.',
          'Risk Appetite — The level of risk [COMPANY NAME] is willing to accept in pursuit of its objectives.',
          'Risk Register — The central repository documenting all identified risks, their assessments, and treatment plans.',
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              '[Risk Manager]',
              'Facilitates risk identification workshops. Maintains the Risk Register. Reports risk status to management. Coordinates risk reviews.',
            ],
            [
              '[Managing Director]',
              'Sets the risk appetite. Approves risk treatment plans for high and critical risks. Reviews risk performance at management review.',
            ],
            [
              'Risk Owners',
              'Implement and monitor risk treatment actions. Report changes in risk status. Escalate emerging risks.',
            ],
            [
              'Department Managers',
              'Identify risks within their areas. Ensure risk controls are implemented and maintained. Participate in risk reviews.',
            ],
            [
              'All Personnel',
              'Report potential risks and hazards. Follow risk control procedures.',
            ],
          ],
        },
      },
      {
        heading: '5. Risk Identification',
        content: 'Risks and opportunities are identified through the following methods:',
      },
      {
        bullets: [
          'Annual strategic risk workshops facilitated by the [Risk Manager]',
          'Departmental risk assessments conducted quarterly',
          'SWOT analysis during strategic planning',
          'PESTLE analysis for external context factors',
          'Process mapping and failure mode analysis',
          'Review of incidents, complaints, audit findings, and near misses',
          'Stakeholder consultation and interested party analysis',
          'Regulatory and legislative change monitoring',
        ],
      },
      {
        content:
          'Each identified risk is documented in the Risk Register with a description, category, potential causes, potential consequences, and the Risk Owner.',
      },
      {
        heading: '6. Risk Assessment — 5x5 Matrix',
        content:
          'Each risk is assessed for likelihood and severity (consequence) using a 5-point scale:',
      },
      { heading: '6.1 Likelihood Scale', level: 2, content: '' },
      {
        table: {
          headers: ['Score', 'Likelihood', 'Description'],
          rows: [
            ['1', 'Rare', 'May occur only in exceptional circumstances (< 5% probability)'],
            ['2', 'Unlikely', 'Could occur at some time but not expected (5-25% probability)'],
            ['3', 'Possible', 'Might occur at some time (25-50% probability)'],
            ['4', 'Likely', 'Will probably occur in most circumstances (50-80% probability)'],
            ['5', 'Almost Certain', 'Expected to occur in most circumstances (> 80% probability)'],
          ],
        },
      },
      { heading: '6.2 Severity Scale', level: 2, content: '' },
      {
        table: {
          headers: ['Score', 'Severity', 'Description'],
          rows: [
            [
              '1',
              'Insignificant',
              'Negligible impact on objectives, no injury, minimal cost (< [CURRENCY] 1,000)',
            ],
            ['2', 'Minor', 'Minor impact, first aid injury, minor cost ([CURRENCY] 1,000-10,000)'],
            [
              '3',
              'Moderate',
              'Moderate impact, medical treatment, moderate cost ([CURRENCY] 10,000-100,000)',
            ],
            [
              '4',
              'Major',
              'Major impact, serious injury, major cost ([CURRENCY] 100,000-1,000,000)',
            ],
            [
              '5',
              'Catastrophic',
              'Catastrophic impact, fatality, existential threat (> [CURRENCY] 1,000,000)',
            ],
          ],
        },
      },
      {
        heading: '6.3 Risk Rating',
        level: 2,
        content:
          'The risk score is calculated as Likelihood x Severity, giving a score between 1 and 25:',
      },
      {
        table: {
          headers: ['Risk Score', 'Risk Level', 'Action Required'],
          rows: [
            [
              '1-4',
              'Low (Green)',
              'Accept risk. Monitor during routine reviews. No additional treatment required.',
            ],
            [
              '5-9',
              'Medium (Yellow)',
              'Reduce risk where practicable. Assign Risk Owner. Review quarterly.',
            ],
            [
              '10-15',
              'High (Orange)',
              'Significant treatment required. Escalate to senior management. Review monthly.',
            ],
            [
              '16-25',
              'Critical (Red)',
              'Immediate action required. Escalate to [Managing Director]. Review weekly until reduced.',
            ],
          ],
        },
      },
      {
        heading: '7. Risk Treatment',
        content:
          'For each risk rated Medium or above, the Risk Owner develops a treatment plan using one or more of the following strategies:',
      },
      {
        table: {
          headers: ['Strategy', 'Description', 'Example'],
          rows: [
            [
              'Avoid',
              'Eliminate the risk by not undertaking the activity or changing the approach.',
              'Discontinuing a hazardous process.',
            ],
            [
              'Reduce',
              'Implement controls to reduce likelihood, severity, or both.',
              'Installing engineering controls, additional training.',
            ],
            [
              'Transfer',
              'Share or transfer the risk to a third party.',
              'Insurance, outsourcing, contractual arrangements.',
            ],
            [
              'Accept',
              'Consciously accept the risk where treatment cost exceeds benefit.',
              'Documented acceptance by [Managing Director] for low residual risks.',
            ],
          ],
        },
      },
      {
        content:
          'After treatment actions are implemented, the residual risk is reassessed using the 5x5 matrix. If residual risk remains High or Critical, further treatment or escalation is required.',
      },
      {
        heading: '8. Opportunity Management',
        content:
          'Opportunities are assessed for potential benefit and feasibility. Those deemed viable are assigned to an owner with an action plan and timeline. Opportunities include process improvements, new technologies, market expansion, efficiency gains, and enhanced stakeholder satisfaction. Opportunities are tracked alongside risks in the Risk Register.',
      },
      { heading: '9. Monitoring & Review', content: 'The Risk Register is reviewed as follows:' },
      {
        bullets: [
          'Critical risks — reviewed weekly by Risk Owner and [Risk Manager]',
          'High risks — reviewed monthly at departmental meetings',
          'Medium risks — reviewed quarterly',
          'Low risks — reviewed annually',
          'All risks — comprehensive review at management review (minimum annually)',
        ],
      },
      {
        content:
          'Risk reviews are triggered outside the normal schedule by significant incidents, near misses, organisational changes, regulatory changes, or new strategic initiatives.',
      },
      { heading: '10. Records', content: '' },
      {
        bullets: [
          'Risk Register (maintained in IMS system)',
          'Risk Assessment Worksheets',
          'Risk Treatment Plans',
          'Risk Review Meeting Minutes',
        ],
      },
      { heading: '11. Related Documents', content: '' },
      {
        bullets: [
          'PRO-005 — Hazard Identification & Risk Assessment Procedure',
          'PRO-006 — Environmental Aspects & Impacts Procedure',
          'PRO-015 — Business Continuity & Disaster Recovery Procedure',
          'PRO-008 — Management Review Procedure',
          'POL-001 — Quality Policy',
        ],
      },
      {
        heading: '12. Review',
        content:
          'This procedure shall be reviewed at least annually by the [Risk Manager] and [Quality Manager], or sooner if triggered by significant risk events, changes to the organisational context, or management review outputs.',
      },
    ],
  },
  // ─── PRO-005 ───
  {
    outputPath: `${OUT_DIR}/PRO-005-Hazard-Identification-Risk-Assessment.docx`,
    docNumber: 'PRO-005',
    title: 'Hazard Identification & Risk Assessment Procedure',
    version: '1.0',
    owner: '[H&S Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 45001:2018 Clause 6.1',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the methodology for identifying workplace hazards, assessing occupational health and safety risks, and determining appropriate controls at [COMPANY NAME]. It ensures that all reasonably foreseeable hazards are systematically identified and that risks are reduced to as low as reasonably practicable (ALARP).',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all workplaces, activities, tasks, equipment, substances, and personnel under the control of [COMPANY NAME], including contractors, visitors, and temporary workers. It covers routine and non-routine activities, emergency situations, and interactions with neighbouring operations.',
      },
      { heading: '3. Definitions', content: '' },
      {
        bullets: [
          'Hazard — A source, situation, or act with the potential to cause harm in terms of injury, ill health, or a combination of these.',
          'Risk — The combination of the likelihood of a hazardous event occurring and the severity of the injury or ill health that could result.',
          'HIRA — Hazard Identification and Risk Assessment.',
          'JSA — Job Safety Analysis; a technique to identify hazards associated with each step of a specific job.',
          'ALARP — As Low As Reasonably Practicable; a principle requiring that risks are reduced as far as is reasonably achievable.',
          'Hierarchy of Controls — The preferred order of control measures: Elimination, Substitution, Engineering Controls, Administrative Controls, Personal Protective Equipment (PPE).',
          'Residual Risk — The risk remaining after control measures have been applied.',
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              '[H&S Manager]',
              'Develops and maintains the HIRA methodology. Facilitates risk assessments. Maintains the HIRA register. Reviews and approves risk assessments.',
            ],
            [
              'Department Managers / Supervisors',
              'Ensure HIRAs are completed for all activities in their area. Implement control measures. Review HIRAs after incidents or changes.',
            ],
            [
              'Workers',
              'Participate in hazard identification. Report new or changed hazards. Follow safe systems of work and use prescribed controls.',
            ],
            [
              'H&S Representatives',
              'Participate in HIRA workshops. Represent worker concerns regarding hazards and controls.',
            ],
            [
              'Contractors',
              'Provide risk assessments and method statements for their activities. Comply with [COMPANY NAME] site safety requirements.',
            ],
          ],
        },
      },
      {
        heading: '5. Hazard Identification Methods',
        content:
          'Hazards are identified through the following methods, used individually or in combination:',
      },
      {
        bullets: [
          'Workplace inspections and safety tours',
          'Job Safety Analysis (JSA) for specific tasks',
          'Review of safety data sheets (SDS) for hazardous substances',
          'Analysis of incident reports, near misses, and first aid records',
          'Worker consultation and safety committee discussions',
          'Observation of work practices and behaviours',
          'Review of equipment manuals and manufacturer guidance',
          'Health surveillance data and occupational health reports',
          'External sources (industry guidance, HSE alerts, benchmarking)',
        ],
      },
      { heading: '6. HIRA Methodology', content: '' },
      {
        heading: '6.1 Step 1 — Task/Activity Breakdown',
        level: 2,
        content:
          'Break the activity into individual steps or tasks. For each step, identify who is involved, what equipment is used, what substances are present, and the working environment.',
      },
      {
        heading: '6.2 Step 2 — Hazard Identification',
        level: 2,
        content: 'For each step, identify all hazards considering the following categories:',
      },
      {
        bullets: [
          'Mechanical (moving parts, sharp edges, crushing)',
          'Electrical (shock, arc flash, static)',
          'Chemical (toxic, corrosive, flammable substances)',
          'Biological (bacteria, viruses, blood-borne pathogens)',
          'Physical (noise, vibration, temperature extremes, radiation)',
          'Ergonomic (manual handling, repetitive motion, posture)',
          'Psychosocial (stress, bullying, lone working, violence)',
          'Environmental (slips, trips, falls, working at height, confined spaces)',
        ],
      },
      {
        heading: '6.3 Step 3 — Risk Assessment',
        level: 2,
        content:
          'Assess each hazard using the risk matrix (Likelihood x Severity) as defined in PRO-004 Section 6. Consider the existing controls in place when scoring. The inherent risk (without controls) and residual risk (with controls) are both recorded.',
      },
      {
        heading: '6.4 Step 4 — Control Measures (Hierarchy of Controls)',
        level: 2,
        content: 'Apply control measures in the following order of preference:',
      },
      {
        table: {
          headers: ['Priority', 'Control Type', 'Description', 'Example'],
          rows: [
            [
              '1',
              'Elimination',
              'Remove the hazard entirely',
              'Redesign process to eliminate working at height',
            ],
            [
              '2',
              'Substitution',
              'Replace the hazard with something less dangerous',
              'Use water-based paint instead of solvent-based',
            ],
            [
              '3',
              'Engineering Controls',
              'Isolate people from the hazard',
              'Install machine guarding, local exhaust ventilation',
            ],
            [
              '4',
              'Administrative Controls',
              'Change the way people work',
              'Safe work procedures, training, signage, job rotation',
            ],
            [
              '5',
              'PPE',
              'Protect the individual',
              'Safety glasses, hearing protection, gloves, harnesses',
            ],
          ],
        },
      },
      {
        heading: '6.5 Step 5 — PPE Assessment',
        level: 2,
        content:
          'Where PPE is required as a control measure, a PPE assessment shall be conducted to determine the appropriate type, standard, and specification. The assessment considers the nature of the hazard, the level of protection required, comfort and fit, compatibility with other PPE, and user acceptance. PPE requirements are documented in the HIRA and communicated to affected workers.',
      },
      {
        heading: '7. Permit to Work Interface',
        content:
          'For high-risk activities identified through the HIRA process, a Permit to Work (PTW) may be required in accordance with PRO-012. Activities that typically require a PTW include hot work, confined space entry, working at height above 2 metres, electrical work on live equipment, and excavation. The HIRA shall cross-reference the applicable PTW requirements.',
      },
      {
        heading: '8. Worker Consultation',
        content:
          '[COMPANY NAME] is committed to consulting with workers on health and safety matters. Workers and their representatives shall be consulted during HIRA development and review. Consultation methods include safety committee meetings, toolbox talks, safety suggestion schemes, and direct involvement in risk assessment workshops.',
      },
      { heading: '9. Review Triggers', content: 'HIRAs shall be reviewed:' },
      {
        bullets: [
          'At least annually as part of the scheduled review cycle',
          'After any incident, accident, or near miss related to the activity',
          'When new equipment, substances, or processes are introduced',
          'When there are changes to legislation or industry guidance',
          'When workers raise concerns about the adequacy of controls',
          'After significant organisational changes affecting the activity',
          'When monitoring data (e.g., exposure monitoring, health surveillance) indicates controls are inadequate',
        ],
      },
      { heading: '10. Records', content: '' },
      {
        bullets: [
          'HIRA Register (maintained in IMS system)',
          'Job Safety Analysis worksheets',
          'PPE Assessment forms',
          'Worker consultation records',
          'HIRA review records',
        ],
      },
      { heading: '11. Related Documents', content: '' },
      {
        bullets: [
          'PRO-004 — Risk & Opportunity Management Procedure',
          'PRO-007 — Incident Investigation & Reporting Procedure',
          'PRO-011 — Emergency Preparedness & Response Procedure',
          'PRO-012 — Permit to Work Procedure',
          'POL-003 — Health & Safety Policy',
        ],
      },
      {
        heading: '12. Review',
        content:
          'This procedure shall be reviewed at least annually by the [H&S Manager], or sooner if triggered by legislative changes, significant incidents, or management review decisions.',
      },
    ],
  },
  // ─── PRO-006 ───
  {
    outputPath: `${OUT_DIR}/PRO-006-Environmental-Aspects-Impacts.docx`,
    docNumber: 'PRO-006',
    title: 'Environmental Aspects & Impacts Procedure',
    version: '1.0',
    owner: '[Environmental Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 14001:2015 Clause 6.1',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the methodology for identifying environmental aspects, evaluating the significance of their associated impacts, and determining appropriate operational controls at [COMPANY NAME]. It ensures that significant environmental aspects are managed to prevent pollution, comply with legal requirements, and achieve continual environmental improvement.',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all activities, products, and services of [COMPANY NAME] that can interact with the environment. It covers normal, abnormal, and emergency operating conditions and considers a lifecycle perspective from raw material acquisition through end of life.',
      },
      { heading: '3. Definitions', content: '' },
      {
        bullets: [
          "Environmental Aspect — An element of [COMPANY NAME]'s activities, products, or services that interacts or can interact with the environment.",
          'Environmental Impact — Any change to the environment, whether adverse or beneficial, wholly or partially resulting from an environmental aspect.',
          'Significant Aspect — An environmental aspect that has or can have a significant environmental impact, as determined by the significance evaluation criteria.',
          'Lifecycle Perspective — Consideration of environmental aspects from raw material extraction, through production and use, to end-of-life treatment and disposal.',
          'Legal Register — A register of all applicable environmental legal and other requirements.',
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              '[Environmental Manager]',
              'Develops and maintains the aspects/impacts register. Facilitates significance evaluations. Links aspects to the legal register. Reports significant aspects to management.',
            ],
            [
              'Department Managers',
              'Identify aspects within their operational areas. Implement operational controls for significant aspects. Report changes that may create new aspects.',
            ],
            [
              'All Personnel',
              'Follow environmental operational controls. Report spills, releases, or potential environmental concerns.',
            ],
            [
              '[Managing Director]',
              'Provides resources for managing significant environmental aspects. Reviews environmental performance at management review.',
            ],
          ],
        },
      },
      {
        heading: '5. Aspects Identification',
        content:
          'Environmental aspects are identified by systematically reviewing all activities, products, and services. The following categories of aspects are considered:',
      },
      {
        bullets: [
          'Emissions to air (stack emissions, fugitive emissions, greenhouse gases, dust, odour)',
          'Discharges to water (process water, stormwater runoff, effluent)',
          'Discharges to land (spills, contamination, soil disturbance)',
          'Use of raw materials and natural resources (water, energy, minerals)',
          'Waste generation (hazardous, non-hazardous, recyclable)',
          'Noise and vibration',
          'Visual impact and light pollution',
          'Effects on biodiversity and ecosystems',
          'Energy consumption (electricity, gas, fuel)',
          'Product lifecycle considerations (packaging, transport, use phase, disposal)',
        ],
      },
      {
        heading: '6. Significance Evaluation',
        content:
          'Each identified aspect is evaluated for significance using a scoring system. The total significance score determines whether the aspect is classified as significant.',
      },
      { heading: '6.1 Scoring Criteria', level: 2, content: '' },
      {
        table: {
          headers: ['Criterion', 'Weight', 'Score 1', 'Score 2', 'Score 3', 'Score 4', 'Score 5'],
          rows: [
            [
              'Severity of Impact',
              '1.5x',
              'Negligible',
              'Minor',
              'Moderate',
              'Major',
              'Catastrophic',
            ],
            [
              'Probability of Occurrence',
              '1.5x',
              'Rare',
              'Unlikely',
              'Possible',
              'Likely',
              'Almost Certain',
            ],
            ['Duration', '1x', 'Hours', 'Days', 'Weeks', 'Months', 'Permanent'],
            [
              'Extent / Scale',
              '1x',
              'Localised',
              'Site-wide',
              'Local area',
              'Regional',
              'National/Global',
            ],
            [
              'Reversibility',
              '1x',
              'Easily reversible',
              'Reversible short-term',
              'Reversible long-term',
              'Partially irreversible',
              'Fully irreversible',
            ],
            [
              'Regulatory Sensitivity',
              '1x',
              'No regulation',
              'Guidance exists',
              'Permit condition',
              'Consent limit',
              'Strict statutory limit',
            ],
            ['Stakeholder Concern', '1x', 'None', 'Low', 'Moderate', 'High', 'Very High'],
          ],
        },
      },
      {
        heading: '6.2 Significance Threshold',
        level: 2,
        content:
          'The total weighted score ranges from 8 to 40. An aspect is classified as significant if the total score is 15 or above. All significant aspects are flagged in the Aspects Register and require documented operational controls, objectives, or targets.',
      },
      {
        heading: '7. Legal Register Linkage',
        content:
          'Each significant aspect is linked to the relevant entries in the Legal Register maintained in accordance with ISO 14001 Clause 6.1.3. The [Environmental Manager] ensures that applicable legal requirements (permits, consents, discharge limits, reporting obligations) are identified for each significant aspect and that compliance is monitored.',
      },
      {
        heading: '8. Operational Controls',
        content:
          'For each significant aspect, operational controls are established to manage the associated impact. Controls may include:',
      },
      {
        bullets: [
          'Documented operating procedures and work instructions',
          'Engineering controls (containment, treatment, abatement equipment)',
          'Monitoring and measurement programmes (e.g., emissions monitoring, waste tracking)',
          'Training and awareness programmes for relevant personnel',
          'Environmental objectives and targets with improvement programmes',
          'Supply chain requirements (environmental criteria for suppliers)',
        ],
      },
      {
        heading: '9. Emergency Preparedness Interface',
        content:
          'Aspects that could result in environmental emergencies (e.g., chemical spills, fire with toxic smoke, uncontrolled releases) are cross-referenced with the Emergency Preparedness & Response Procedure (PRO-011). Emergency response plans include environmental impact mitigation measures, spill containment and clean-up procedures, and regulatory notification requirements.',
      },
      {
        heading: '10. Lifecycle Perspective',
        content:
          '[COMPANY NAME] considers environmental aspects across the lifecycle of its products and services. This includes specifying environmental requirements for procurement of raw materials, considering environmental impacts during product design, providing information about environmental impacts during product use and disposal, and working with waste management contractors to ensure proper end-of-life treatment.',
      },
      { heading: '11. Records', content: '' },
      {
        bullets: [
          'Environmental Aspects & Impacts Register',
          'Significance Evaluation Worksheets',
          'Legal Register',
          'Operational Control Procedures',
          'Environmental Monitoring Data',
        ],
      },
      { heading: '12. Related Documents', content: '' },
      {
        bullets: [
          'PRO-004 — Risk & Opportunity Management Procedure',
          'PRO-011 — Emergency Preparedness & Response Procedure',
          'POL-002 — Environmental Policy',
          'Legal Register (maintained in IMS system)',
        ],
      },
      {
        heading: '13. Review',
        content:
          'This procedure and the Aspects Register shall be reviewed at least annually by the [Environmental Manager], or sooner when triggered by new activities/products/services, significant incidents or spills, changes to legislation, audit findings, or management review outputs.',
      },
    ],
  },
  // ─── PRO-007 ───
  {
    outputPath: `${OUT_DIR}/PRO-007-Incident-Investigation-Reporting.docx`,
    docNumber: 'PRO-007',
    title: 'Incident Investigation & Reporting Procedure',
    version: '1.0',
    owner: '[H&S Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 45001:2018 Clause 10.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure establishes the requirements for reporting, investigating, and learning from incidents and near misses at [COMPANY NAME]. It ensures that all incidents are promptly reported, thoroughly investigated, root causes are identified, corrective actions are implemented, and lessons are shared to prevent recurrence.',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all incidents, accidents, dangerous occurrences, near misses, and occupational ill health cases involving employees, contractors, visitors, or members of the public on [COMPANY NAME] premises or during work-related activities. It also covers environmental incidents (spills, releases) and security incidents where H&S implications exist.',
      },
      { heading: '3. Definitions', content: '' },
      {
        bullets: [
          'Incident — An event arising out of, or in connection with, work that could or did result in injury, ill health, or damage.',
          'Near Miss — An unplanned event that did not result in injury, ill health, or damage but had the potential to do so.',
          'First Aid Case — An incident requiring first aid treatment only, with no time lost beyond the shift.',
          'Medical Treatment Case (MTC) — An incident requiring medical treatment beyond first aid but not resulting in time lost.',
          'Lost Time Injury (LTI) — An incident resulting in the injured person being unable to work on any scheduled workday after the day of the injury.',
          'Dangerous Occurrence — A specified event that is reportable under regulations (e.g., RIDDOR) regardless of whether anyone is injured.',
          'RIDDOR — Reporting of Injuries, Diseases and Dangerous Occurrences Regulations (applicable in the UK; replace with local equivalent).',
          'Fatality — A death arising from a work-related incident.',
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              'All Personnel',
              'Report all incidents, near misses, and hazards immediately to their supervisor.',
            ],
            [
              'Supervisors / Line Managers',
              'Secure the scene, ensure first aid is provided, complete initial incident report within 24 hours.',
            ],
            [
              '[H&S Manager]',
              'Classifies incidents, determines investigation level, leads or assigns investigation teams, monitors corrective actions, manages regulatory reporting.',
            ],
            [
              'Investigation Team',
              'Conducts thorough investigation, identifies root causes, recommends corrective actions.',
            ],
            [
              '[Managing Director]',
              'Notified of all serious incidents (LTI, dangerous occurrence, fatality). Ensures resources for investigation and corrective actions.',
            ],
          ],
        },
      },
      { heading: '5. Incident Categories & Investigation Levels', content: '' },
      {
        table: {
          headers: ['Category', 'Examples', 'Investigation Level', 'Reporting Requirement'],
          rows: [
            [
              'Near Miss',
              'Slip without injury, falling object with no one struck',
              'Level 1 — Supervisor investigation',
              'Internal only; logged in IMS',
            ],
            [
              'First Aid',
              'Minor cut, bruise, eye irrigation',
              'Level 1 — Supervisor investigation',
              'Internal only; logged in IMS',
            ],
            [
              'Medical Treatment',
              'Fracture, stitches, medical referral',
              'Level 2 — H&S Manager investigation',
              'Internal; reviewed for regulatory reporting',
            ],
            [
              'Lost Time Injury',
              'Injury causing absence > 1 day',
              'Level 3 — Full investigation team',
              'Regulatory reporting (RIDDOR over-7-day); internal',
            ],
            [
              'Dangerous Occurrence',
              'Collapse of scaffold, explosion, electrical short circuit',
              'Level 3 — Full investigation team',
              'Regulatory reporting (RIDDOR); internal',
            ],
            [
              'Fatality',
              'Work-related death',
              'Level 3 — Full investigation + external',
              'Immediate regulatory reporting; police notification',
            ],
          ],
        },
      },
      { heading: '6. Immediate Response', content: '' },
      {
        heading: '6.1 Scene Management',
        level: 2,
        content:
          'Upon becoming aware of an incident, the first priority is to ensure the safety of all persons. Administer first aid and call emergency services if required. Secure the scene to prevent further harm and preserve evidence. Do not disturb the scene unless necessary to prevent further injury or damage.',
      },
      {
        heading: '6.2 Initial Notification',
        level: 2,
        content:
          'The supervisor notifies the [H&S Manager] immediately for all incidents above near miss level. For serious incidents (LTI, dangerous occurrence, fatality), the [Managing Director] is notified within 1 hour. The initial Incident Report Form (FRM-030) is completed within 24 hours of the incident.',
      },
      { heading: '7. Investigation Process', content: '' },
      {
        heading: '7.1 Investigation Team',
        level: 2,
        content:
          'The [H&S Manager] appoints an investigation team appropriate to the severity. The team may include the area supervisor, H&S representative, subject matter experts, and worker representatives. For fatalities or dangerous occurrences, an external specialist may be engaged.',
      },
      {
        heading: '7.2 Evidence Collection',
        level: 2,
        content:
          'The investigation team collects evidence including photographs and sketches of the scene, witness statements, CCTV footage, equipment inspection reports, relevant documents (risk assessments, procedures, training records, maintenance logs), environmental conditions at the time, and timeline of events leading up to the incident.',
      },
      {
        heading: '7.3 Root Cause Analysis',
        level: 2,
        content:
          'The investigation team determines the root cause(s) using appropriate techniques as described in PRO-003. Common root cause categories include inadequate risk assessment, failure to follow procedures, inadequate training, equipment failure, inadequate supervision, design deficiency, and management system failure.\n\nThe investigation must distinguish between immediate causes (the direct action or condition), contributing factors (conditions that allowed the event), and root causes (the fundamental management system failures).',
      },
      {
        heading: '8. Regulatory Reporting',
        content:
          'Certain incidents must be reported to the relevant regulatory authority. Under RIDDOR (or local equivalent), the following are reportable:',
      },
      {
        bullets: [
          'Deaths arising from work-related accidents — immediately by telephone',
          'Specified injuries (fractures, amputations, loss of sight, etc.) — immediately by telephone, followed by written report within 10 days',
          'Over-7-day incapacitation — reported within 15 days',
          'Dangerous occurrences (as specified in the regulations) — immediately by telephone',
          'Occupational diseases (as specified) — when diagnosed',
        ],
      },
      {
        content:
          'The [H&S Manager] is responsible for ensuring regulatory reports are submitted within the required timescales. All regulatory notifications are recorded in the IMS.',
      },
      {
        heading: '9. Learning & Communication',
        content:
          'Investigation findings and lessons learned are communicated through safety alerts distributed to all relevant personnel, toolbox talks and safety briefings, updates to risk assessments and procedures, notice board displays, and inclusion in H&S performance reports.\n\nSignificant incident learnings are shared across all sites and departments to prevent similar incidents elsewhere.',
      },
      { heading: '10. Records', content: '' },
      {
        bullets: [
          'FRM-030 — Incident Report Form',
          'Investigation reports with evidence',
          'Witness statements',
          'Corrective action records',
          'Regulatory notification confirmations',
          'Incident register (maintained in IMS system)',
        ],
      },
      { heading: '11. Related Documents', content: '' },
      {
        bullets: [
          'PRO-003 — Corrective Action & CAPA Procedure',
          'PRO-005 — Hazard Identification & Risk Assessment Procedure',
          'PRO-011 — Emergency Preparedness & Response Procedure',
          'POL-003 — Health & Safety Policy',
        ],
      },
      {
        heading: '12. Review',
        content:
          'This procedure shall be reviewed at least annually by the [H&S Manager], or sooner when triggered by significant incidents, changes to legislation, audit findings, or management review outputs.',
      },
    ],
  },
  // ─── PRO-008 ───
  {
    outputPath: `${OUT_DIR}/PRO-008-Management-Review.docx`,
    docNumber: 'PRO-008',
    title: 'Management Review Procedure',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 9.3',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the requirements for conducting management reviews of the Integrated Management System (IMS) at [COMPANY NAME]. Management review ensures the continuing suitability, adequacy, effectiveness, and alignment of the IMS with the strategic direction of the organisation.',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to management reviews covering the quality management system (ISO 9001), environmental management system (ISO 14001), and occupational health and safety management system (ISO 45001). It covers all processes, departments, and sites within [COMPANY NAME].',
      },
      { heading: '3. Definitions', content: '' },
      {
        bullets: [
          'Management Review — A formal, planned evaluation of the IMS by top management to assess its performance and identify opportunities for improvement.',
          'Top Management — The [Managing Director] and senior leadership team who direct and control [COMPANY NAME] at the highest level.',
          'IMS Performance — The measurable results of the IMS, including achievement of objectives, process performance, and compliance status.',
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              '[Managing Director]',
              'Chairs management review meetings. Makes decisions on resources, policy changes, and strategic direction.',
            ],
            [
              '[Quality Manager]',
              'Coordinates management review preparation. Compiles input data. Distributes agenda. Records minutes and actions. Tracks action completion.',
            ],
            [
              '[Environmental Manager]',
              'Provides environmental performance data, compliance status, and significant aspects update.',
            ],
            [
              '[H&S Manager]',
              'Provides H&S performance data, incident statistics, and HIRA update.',
            ],
            [
              'Department Managers',
              'Provide process performance data and KPIs for their areas. Present departmental reports as required.',
            ],
          ],
        },
      },
      {
        heading: '5. Frequency & Scheduling',
        content:
          'Management reviews shall be conducted at least twice per year (typically in June and December). Additional reviews may be called by the [Managing Director] in response to significant incidents or changes, major audit findings, significant changes to the organisation or its context, or regulatory enforcement actions.\n\nThe schedule is established at the beginning of each year and communicated to all attendees. Invitations are issued at least 4 weeks in advance.',
      },
      {
        heading: '6. Mandatory Inputs (ISO 9001 Cl.9.3.2 / ISO 14001 Cl.9.3 / ISO 45001 Cl.9.3)',
        content: 'The following inputs shall be reviewed at each management review:',
      },
      {
        bullets: [
          'Status of actions from previous management reviews',
          'Changes in external and internal issues relevant to the IMS (context of the organisation)',
          'Changes in the needs and expectations of interested parties, including compliance obligations',
          'Information on IMS performance and effectiveness, including trends in: customer satisfaction and feedback, extent to which objectives have been met, process performance and product/service conformity, nonconformities and corrective actions, monitoring and measurement results, audit results (internal and external), supplier/external provider performance',
          'Adequacy of resources',
          'Effectiveness of actions taken to address risks and opportunities',
          'Opportunities for improvement',
          'Environmental performance including compliance with legal requirements, progress toward environmental objectives, and status of significant aspects',
          'H&S performance including incident and injury statistics, occupational health data, HIRA review status, consultation and participation outcomes, and compliance with legal requirements',
        ],
      },
      { heading: '7. Agenda Template', content: '' },
      {
        table: {
          headers: ['Item', 'Presenter', 'Duration'],
          rows: [
            ['1. Welcome & Apologies', '[Managing Director]', '5 min'],
            ['2. Review of Previous Minutes & Actions', '[Quality Manager]', '15 min'],
            ['3. Changes to Context & Interested Parties', '[Quality Manager]', '10 min'],
            ['4. Quality Performance Report & KPIs', '[Quality Manager]', '20 min'],
            ['5. Environmental Performance Report', '[Environmental Manager]', '15 min'],
            ['6. H&S Performance Report', '[H&S Manager]', '15 min'],
            ['7. Audit Results (Internal & External)', '[Quality Manager]', '15 min'],
            ['8. Nonconformity & CAPA Summary', '[Quality Manager]', '10 min'],
            ['9. Risk & Opportunity Review', '[Risk Manager]', '15 min'],
            ['10. Supplier Performance', '[Procurement Manager]', '10 min'],
            ['11. Resource Requirements', 'All', '10 min'],
            ['12. Improvement Opportunities', 'All', '10 min'],
            ['13. Decisions & Actions', '[Managing Director]', '10 min'],
          ],
        },
      },
      {
        heading: '8. Outputs & Decisions',
        content: 'Management review outputs shall include decisions and actions related to:',
      },
      {
        bullets: [
          'Opportunities for improvement of the IMS and its processes',
          'Any need for changes to the IMS, including policy and objectives',
          'Resource needs (personnel, training, equipment, budget)',
          'Actions to address identified risks and opportunities',
          'Changes to the scope of the IMS',
          'Supplier performance actions',
          'Strategic direction and alignment',
        ],
      },
      {
        content:
          'Each action is assigned to a responsible person with a target completion date. Actions are tracked by the [Quality Manager] and reviewed at the next management review.',
      },
      {
        heading: '9. Attendance',
        content:
          'The following personnel are required to attend management reviews: [Managing Director], [Quality Manager], [Environmental Manager], [H&S Manager], [Risk Manager], Department Managers, and [HR Manager]. Other personnel may be invited as required. A quorum requires the [Managing Director] (or nominated deputy) plus at least two-thirds of required attendees.',
      },
      { heading: '10. Records', content: '' },
      {
        bullets: [
          'Management Review Agenda',
          'Management Review Minutes (including decisions and actions)',
          'Presentation slides and supporting data packs',
          'Action tracker',
          'Attendance register',
        ],
      },
      { heading: '11. Related Documents', content: '' },
      {
        bullets: [
          'PRO-002 — Internal Audit Procedure',
          'PRO-003 — Corrective Action & CAPA Procedure',
          'PRO-004 — Risk & Opportunity Management Procedure',
          'POL-001 — Quality Policy',
          'POL-002 — Environmental Policy',
          'POL-003 — Health & Safety Policy',
        ],
      },
      {
        heading: '12. Review',
        content:
          'This procedure shall be reviewed at least annually by the [Quality Manager], or sooner if triggered by changes to ISO standards, significant organisational changes, or output actions from management reviews.',
      },
    ],
  },
  // ─── PRO-009 ───
  {
    outputPath: `${OUT_DIR}/PRO-009-Supplier-Contractor-Evaluation.docx`,
    docNumber: 'PRO-009',
    title: 'Supplier & Contractor Evaluation Procedure',
    version: '1.0',
    owner: '[Procurement Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 8.4',
    sections: [
      {
        heading: '1. Purpose',
        content:
          "This procedure defines the process for evaluating, approving, monitoring, and managing suppliers and contractors at [COMPANY NAME]. It ensures that externally provided products, processes, and services conform to [COMPANY NAME]'s requirements and that the supply chain supports the objectives of the Integrated Management System.",
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all suppliers of products and materials, providers of outsourced processes and services, and contractors performing work on [COMPANY NAME] premises or on behalf of [COMPANY NAME]. It covers initial evaluation, ongoing monitoring, re-evaluation, and suspension or removal from the Approved Supplier List (ASL).',
      },
      { heading: '3. Definitions', content: '' },
      {
        bullets: [
          'Supplier — An external organisation that provides products or materials to [COMPANY NAME].',
          'Contractor — An external organisation or individual that performs services or work on behalf of [COMPANY NAME].',
          'Approved Supplier List (ASL) — The register of suppliers and contractors that have been evaluated and approved for use by [COMPANY NAME].',
          "Critical Supplier — A supplier whose products or services have a direct impact on the quality, safety, or regulatory compliance of [COMPANY NAME]'s outputs.",
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              '[Procurement Manager]',
              'Manages the ASL. Coordinates supplier evaluations and re-evaluations. Monitors supplier performance. Initiates suspension or removal.',
            ],
            [
              'Department Managers / Requestors',
              'Identify supplier requirements. Participate in technical evaluations. Report supplier nonconformities.',
            ],
            [
              '[Quality Manager]',
              'Approves evaluation criteria. Reviews supplier audit reports. Approves critical supplier designations.',
            ],
            [
              '[H&S Manager]',
              'Evaluates contractor H&S competence and compliance. Reviews contractor method statements and risk assessments.',
            ],
            [
              'Suppliers / Contractors',
              'Provide required evaluation information. Maintain quality and compliance standards. Report changes that may affect their approval status.',
            ],
          ],
        },
      },
      {
        heading: '5. Initial Supplier Evaluation',
        content:
          'Before a new supplier or contractor is added to the ASL, they must undergo an initial evaluation. The evaluation considers the following criteria:',
      },
      {
        table: {
          headers: ['Criterion', 'Weight', 'Scoring (1-5)'],
          rows: [
            [
              'Quality Management System (certification, capability)',
              '25%',
              '1=None, 3=In progress, 5=ISO 9001 certified',
            ],
            ['Technical Capability & Capacity', '20%', '1=Inadequate, 3=Acceptable, 5=Excellent'],
            ['Financial Stability', '10%', '1=High risk, 3=Stable, 5=Strong'],
            [
              'Delivery Performance (references/track record)',
              '15%',
              '1=Poor, 3=Acceptable, 5=Excellent',
            ],
            ['Price Competitiveness', '10%', '1=Well above market, 3=Market rate, 5=Below market'],
            [
              'H&S Record & Compliance (for contractors)',
              '10%',
              '1=Poor, 3=Acceptable, 5=Excellent',
            ],
            [
              'Environmental Compliance',
              '5%',
              '1=Non-compliant, 3=Basic compliance, 5=ISO 14001 certified',
            ],
            ['Geographic & Logistic Suitability', '5%', '1=Problematic, 3=Acceptable, 5=Ideal'],
          ],
        },
      },
      {
        content:
          'A minimum weighted score of 3.0 out of 5.0 is required for approval. Suppliers scoring between 2.5 and 3.0 may be conditionally approved with improvement plans. Suppliers scoring below 2.5 are not approved.',
      },
      {
        heading: '6. Approved Supplier List',
        content:
          'Approved suppliers are added to the ASL with their approval date, scope of approval, classification (Standard or Critical), next re-evaluation date, and any conditions. The ASL is maintained by the [Procurement Manager] and is accessible to all purchasing personnel. Only suppliers on the ASL may be used for procurement.',
      },
      {
        heading: '7. Ongoing Monitoring',
        content: 'Supplier performance is monitored continuously using the following metrics:',
      },
      {
        bullets: [
          'On-time delivery rate (target: > 95%)',
          'Quality rejection rate (target: < 2%)',
          'Number of nonconformity reports raised',
          'Responsiveness to corrective action requests',
          'Compliance with specifications and requirements',
          'H&S incident rate (for on-site contractors)',
        ],
      },
      {
        content:
          'Performance data is recorded in the IMS supplier module and reviewed quarterly by the [Procurement Manager].',
      },
      {
        heading: '8. Performance Scoring & Re-Evaluation',
        content:
          'Each supplier receives a quarterly performance score based on the monitoring metrics. The annual re-evaluation combines the quarterly scores with any audit results and feedback from users. Suppliers are re-classified as follows:',
      },
      {
        table: {
          headers: ['Score', 'Classification', 'Action'],
          rows: [
            ['4.0-5.0', 'Preferred', 'Continue use; consider for increased scope'],
            ['3.0-3.9', 'Approved', 'Continue use; monitor normally'],
            [
              '2.5-2.9',
              'Conditional',
              'Improvement plan required; increased monitoring; 90-day review',
            ],
            ['Below 2.5', 'Suspended', 'No new orders; formal review; removal if no improvement'],
          ],
        },
      },
      {
        heading: '9. Suspension & Removal',
        content:
          'A supplier may be suspended from the ASL for persistent poor performance (below 2.5 for two consecutive quarters), a significant quality or safety incident, failure to implement agreed corrective actions, loss of required certifications, or financial instability posing supply risk.\n\nSuspension is communicated to the supplier in writing with the reasons and required improvements. Removal from the ASL is a permanent action approved by the [Quality Manager] and [Procurement Manager]. Removed suppliers may reapply after 12 months.',
      },
      { heading: '10. Records', content: '' },
      {
        bullets: [
          'Approved Supplier List',
          'Supplier Evaluation Forms',
          'Supplier Audit Reports',
          'Performance Monitoring Records',
          'Corrective Action Requests to suppliers',
          'Suspension and Removal Notifications',
        ],
      },
      { heading: '11. Related Documents', content: '' },
      {
        bullets: [
          'PRO-003 — Corrective Action & CAPA Procedure',
          'PRO-005 — Hazard Identification & Risk Assessment Procedure',
          'POL-001 — Quality Policy',
        ],
      },
      {
        heading: '12. Review',
        content:
          'This procedure shall be reviewed at least annually by the [Procurement Manager] and [Quality Manager], or sooner if triggered by significant supplier failures, changes to procurement strategy, audit findings, or management review outputs.',
      },
    ],
  },
  // ─── PRO-010 ───
  {
    outputPath: `${OUT_DIR}/PRO-010-Training-Competence.docx`,
    docNumber: 'PRO-010',
    title: 'Training & Competence Procedure',
    version: '1.0',
    owner: '[HR Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001/45001 Clause 7.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure establishes the process for identifying training needs, providing training, assessing competence, and maintaining training records at [COMPANY NAME]. It ensures that all personnel performing work that affects quality, environmental, and occupational health and safety performance are competent on the basis of appropriate education, training, skills, and experience.',
      },
      {
        heading: '2. Scope',
        content:
          "This procedure applies to all employees, contractors, temporary workers, and volunteers performing work under [COMPANY NAME]'s control. It covers induction training, role-specific training, mandatory and regulatory training, refresher training, and competence assessment.",
      },
      { heading: '3. Definitions', content: '' },
      {
        bullets: [
          'Competence — The ability to apply knowledge and skills to achieve intended results.',
          'Training Needs Analysis (TNA) — A systematic process to identify the gap between required and actual competence.',
          'Training Matrix — A matrix showing all roles, required competencies, and the training status of each individual.',
          'Induction — Initial training provided to new starters covering organisational policies, site orientation, and essential H&S information.',
          'Refresher Training — Periodic re-training to maintain competence in critical skills.',
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              '[HR Manager]',
              'Manages the training system, coordinates TNA, maintains training records, schedules training, manages the training matrix.',
            ],
            [
              'Department Managers',
              'Identify training needs for their teams, support training delivery, assess competence of team members, approve training requests.',
            ],
            [
              '[H&S Manager]',
              'Identifies mandatory H&S training requirements, delivers or coordinates H&S training, maintains H&S training records.',
            ],
            [
              '[Quality Manager]',
              'Identifies IMS-related training requirements, reviews training effectiveness for quality-critical roles.',
            ],
            [
              'All Personnel',
              'Attend scheduled training, apply skills and knowledge in the workplace, report competence gaps.',
            ],
          ],
        },
      },
      {
        heading: '5. Training Needs Analysis',
        content:
          'A Training Needs Analysis (TNA) is conducted annually by the [HR Manager] in collaboration with Department Managers. The TNA considers:',
      },
      {
        bullets: [
          'Job descriptions and role requirements',
          'Changes to processes, equipment, or technology',
          'New legal or regulatory requirements',
          'Audit findings indicating competence gaps',
          'Incident investigation findings',
          'Performance appraisal outcomes',
          'Organisational changes (restructuring, new products/services)',
          'Individual development plans and career aspirations',
        ],
      },
      {
        content:
          'The TNA output is an Annual Training Plan identifying all required training by role, department, and timescale.',
      },
      {
        heading: '6. Induction Training',
        content:
          'All new starters (employees, contractors, temporary workers) receive induction training before commencing work. Induction covers:',
      },
      {
        bullets: [
          'Company overview, mission, and values',
          'IMS policies (quality, environmental, H&S)',
          'Site orientation (facilities, emergency exits, muster points)',
          'Health and safety essentials (hazard reporting, PPE, first aid, fire procedures)',
          'Environmental responsibilities (waste segregation, spill response)',
          'IT systems and information security basics',
          'Reporting structures and key contacts',
          'Code of conduct and disciplinary procedures',
        ],
      },
      {
        content:
          'Induction completion is recorded and signed off by the new starter and their line manager.',
      },
      {
        heading: '7. Role-Specific & Mandatory Training',
        content:
          'Role-specific training is provided based on the Training Matrix. Examples include:',
      },
      {
        table: {
          headers: ['Training Topic', 'Target Audience', 'Frequency', 'Delivery Method'],
          rows: [
            [
              'Internal Auditor (ISO 9001/14001/45001)',
              'Designated auditors',
              'Initial + 3-year refresher',
              'External course',
            ],
            [
              'Manual Handling',
              'All warehouse/production staff',
              'Initial + annual refresher',
              'In-house practical',
            ],
            [
              'Working at Height',
              'Maintenance, construction teams',
              'Initial + annual refresher',
              'External accredited',
            ],
            [
              'First Aid at Work',
              'Designated first aiders',
              'Initial + 3-year requalification',
              'External accredited',
            ],
            [
              'Fire Marshal',
              'Designated fire marshals',
              'Initial + annual refresher',
              'External or in-house',
            ],
            [
              'COSHH Awareness',
              'Personnel handling hazardous substances',
              'Initial + annual refresher',
              'In-house',
            ],
            [
              'Data Protection / GDPR',
              'All personnel',
              'Initial + annual refresher',
              'Online e-learning',
            ],
            [
              'Quality System Awareness',
              'All personnel',
              'Initial + when procedures change',
              'In-house briefing',
            ],
          ],
        },
      },
      {
        heading: '8. Competence Assessment',
        content: 'Competence is assessed through a combination of methods appropriate to the role:',
      },
      {
        bullets: [
          'Written or online assessments (knowledge tests)',
          'Practical demonstrations and skills assessments',
          'Supervised work observation',
          'Professional qualifications and certifications',
          'Performance appraisal outcomes',
          'Peer review and feedback',
        ],
      },
      {
        content:
          'Where competence gaps are identified, additional training or coaching is provided and the individual is reassessed. Personnel who do not achieve competence after remedial training are reviewed by the Department Manager and [HR Manager] for role suitability.',
      },
      {
        heading: '9. Refresher Schedule',
        content:
          'Refresher training ensures competence is maintained over time. The Training Matrix specifies the refresher frequency for each training topic. The [HR Manager] generates refresher training alerts 60 days before expiry. Overdue refresher training is escalated to the Department Manager and reported at management review.',
      },
      {
        heading: '10. Training Effectiveness Evaluation',
        content: 'The effectiveness of training is evaluated at multiple levels:',
      },
      {
        bullets: [
          'Level 1 — Reaction: Participant feedback forms collected after each training event.',
          'Level 2 — Learning: Pre/post-test scores or practical assessment results.',
          'Level 3 — Behaviour: Manager observation of skill application in the workplace (30-90 days post-training).',
          'Level 4 — Results: Impact on KPIs (e.g., reduction in errors, incidents, or nonconformities).',
        ],
      },
      {
        heading: '11. Training Records',
        content: 'Training records are maintained in the IMS training module and include:',
      },
      {
        bullets: [
          'Individual training history and certificates',
          'Training Matrix (current status)',
          'Annual Training Plan',
          'TNA outputs',
          'Attendance registers',
          'Assessment results',
          'Training effectiveness evaluations',
          'Induction records',
        ],
      },
      { heading: '12. Related Documents', content: '' },
      {
        bullets: [
          'PRO-002 — Internal Audit Procedure',
          'PRO-005 — Hazard Identification & Risk Assessment Procedure',
          'PRO-008 — Management Review Procedure',
          'POL-001 — Quality Policy',
          'POL-003 — Health & Safety Policy',
        ],
      },
      {
        heading: '13. Review',
        content:
          'This procedure shall be reviewed at least annually by the [HR Manager] and [Quality Manager], or sooner if triggered by regulatory changes, significant competence-related incidents, audit findings, or management review outputs.',
      },
    ],
  },
  // ─── PRO-011 ───
  {
    outputPath: `${OUT_DIR}/PRO-011-Emergency-Preparedness-Response.docx`,
    docNumber: 'PRO-011',
    title: 'Emergency Preparedness & Response Procedure',
    version: '1.0',
    owner: '[H&S Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 14001/45001 Clause 8.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure establishes the framework for identifying potential emergency situations, developing response plans, conducting drills, and reviewing emergency preparedness at [COMPANY NAME]. It ensures that the organisation can respond effectively to emergencies to protect people, the environment, assets, and business continuity.',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all premises, operations, and personnel of [COMPANY NAME], including employees, contractors, and visitors. It covers all types of emergencies including fire, chemical spill, gas leak, explosion, severe weather, structural failure, medical emergency, security threat, environmental incident, and utility failure.',
      },
      { heading: '3. Definitions', content: '' },
      {
        bullets: [
          'Emergency — An unplanned event that requires immediate action to protect life, the environment, or assets.',
          'Emergency Response Plan (ERP) — A documented plan detailing the actions to be taken in response to a specific type of emergency.',
          'Muster Point — A designated assembly area where personnel gather during an evacuation.',
          'Communication Tree — A structured diagram showing the chain of emergency notifications.',
          'Drill — A simulated emergency exercise to test and practice the emergency response.',
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              '[H&S Manager]',
              'Develops and maintains ERPs. Coordinates drills. Reviews emergency equipment. Updates communication trees.',
            ],
            [
              '[Managing Director]',
              'Authorises the crisis management team activation. Provides resources. Acts as media spokesperson (or delegates).',
            ],
            [
              'Fire Marshals',
              'Conduct floor sweeps during evacuations. Direct personnel to muster points. Report to the Fire Assembly Coordinator.',
            ],
            [
              'First Aiders',
              'Provide first aid treatment. Assess casualties. Liaise with emergency services.',
            ],
            [
              'All Personnel',
              'Know their nearest exit and muster point. Follow evacuation instructions. Report emergencies immediately.',
            ],
            [
              'Receptionist / Security',
              'Activate fire alarm. Call emergency services. Control site access for emergency vehicles. Account for visitors.',
            ],
          ],
        },
      },
      {
        heading: '5. Emergency Scenarios',
        content:
          'The following potential emergency scenarios have been identified through risk assessment. Each has a specific Emergency Response Plan:',
      },
      {
        table: {
          headers: ['Scenario', 'Risk Level', 'ERP Reference'],
          rows: [
            ['Fire / Explosion', 'High', 'ERP-001'],
            ['Chemical Spill (hazardous substance)', 'High', 'ERP-002'],
            ['Gas Leak (natural gas / toxic gas)', 'High', 'ERP-003'],
            ['Medical Emergency (cardiac, severe trauma)', 'Medium', 'ERP-004'],
            ['Severe Weather (flood, storm, lightning)', 'Medium', 'ERP-005'],
            ['Structural Failure / Collapse', 'Medium', 'ERP-006'],
            ['Security Threat (intruder, bomb threat)', 'Medium', 'ERP-007'],
            ['Environmental Release (air emission, water discharge)', 'Medium', 'ERP-008'],
            ['Utility Failure (power, water, IT)', 'Low', 'ERP-009'],
            ['Pandemic / Public Health Emergency', 'Medium', 'ERP-010'],
          ],
        },
      },
      { heading: '6. Emergency Response Plans', content: 'Each ERP follows a standard structure:' },
      {
        bullets: [
          'Scenario description and potential impacts',
          'Initial response actions (first 5 minutes)',
          'Notification chain and escalation',
          'Evacuation or shelter-in-place instructions',
          'Containment and mitigation actions',
          'Emergency equipment locations and usage',
          'Coordination with emergency services',
          'Recovery and return-to-normal actions',
          'Post-emergency review requirements',
        ],
      },
      {
        heading: '7. Drill Schedule',
        content:
          'Emergency drills are conducted to test the effectiveness of ERPs and to ensure personnel are familiar with emergency procedures:',
      },
      {
        table: {
          headers: ['Drill Type', 'Frequency', 'Participants', 'Record'],
          rows: [
            [
              'Fire Evacuation',
              'Minimum 2 per year (6-monthly)',
              'All personnel',
              'Drill report with evacuation time',
            ],
            [
              'Chemical Spill Response',
              'Annual',
              'Spill response team + affected area',
              'Drill report with response time',
            ],
            [
              'First Aid / Medical Emergency',
              'Annual',
              'First aiders + designated responders',
              'Drill report',
            ],
            [
              'Communication Tree Test',
              'Quarterly',
              'Key personnel on communication tree',
              'Contact confirmation log',
            ],
            [
              'Full-Scale Exercise',
              'Every 2 years',
              'All personnel + emergency services',
              'Full exercise report + debrief',
            ],
            [
              'Desktop / Tabletop Exercise',
              'Annual',
              'Crisis management team',
              'Exercise report + action items',
            ],
          ],
        },
      },
      {
        content:
          'Drill outcomes, including response times, issues identified, and improvement actions, are recorded and reviewed by the [H&S Manager].',
      },
      {
        heading: '8. Communication Trees',
        content:
          'Communication trees define the notification chain for each type of emergency. The trees are maintained by the [H&S Manager] and updated whenever personnel changes occur. Key contacts include the Site Emergency Coordinator, [H&S Manager], [Managing Director], Fire Brigade (999/112), Ambulance Service (999/112), Police (999/112), Environment Agency emergency hotline, utility companies (gas, electric, water), and neighbouring businesses (mutual aid).\n\nCommunication trees are posted at reception, in all offices, and in the Emergency Response Manual. Key personnel carry emergency contact cards.',
      },
      {
        heading: '9. Emergency Equipment',
        content:
          'Emergency equipment is inspected and maintained in accordance with the following schedule:',
      },
      {
        bullets: [
          'Fire extinguishers — monthly visual check; annual service by competent person',
          'Fire alarm system — weekly test; quarterly service; annual full test',
          'Emergency lighting — monthly function test; annual full-duration test',
          'First aid kits — monthly check and restock',
          'Spill kits — monthly check; restock after use',
          'Eye wash stations — monthly check; replace fluid per manufacturer schedule',
          'Emergency showers — weekly function test',
          'AED (defibrillator) — monthly check; pad replacement per expiry date',
        ],
      },
      {
        heading: '10. Post-Emergency Review',
        content:
          'After any actual emergency or significant drill, a post-emergency review is conducted within 5 working days. The review examines the effectiveness of the response, identifies what worked well and what needs improvement, assesses whether the ERP was adequate, identifies any equipment or resource deficiencies, and determines corrective actions. The review is led by the [H&S Manager] and includes all key responders.',
      },
      { heading: '11. Records', content: '' },
      {
        bullets: [
          'Emergency Response Plans (ERP-001 to ERP-010)',
          'Drill reports and exercise records',
          'Communication trees (current version)',
          'Emergency equipment inspection logs',
          'Post-emergency review reports',
          'Emergency contact cards',
        ],
      },
      { heading: '12. Related Documents', content: '' },
      {
        bullets: [
          'PRO-005 — Hazard Identification & Risk Assessment Procedure',
          'PRO-006 — Environmental Aspects & Impacts Procedure',
          'PRO-007 — Incident Investigation & Reporting Procedure',
          'PRO-015 — Business Continuity & Disaster Recovery Procedure',
          'POL-003 — Health & Safety Policy',
        ],
      },
      {
        heading: '13. Review',
        content:
          'This procedure and all ERPs shall be reviewed at least annually by the [H&S Manager], or sooner after any actual emergency, significant drill findings, changes to site layout or operations, or management review outputs.',
      },
    ],
  },
  // ─── PRO-012 ───
  {
    outputPath: `${OUT_DIR}/PRO-012-Permit-To-Work.docx`,
    docNumber: 'PRO-012',
    title: 'Permit to Work Procedure',
    version: '1.0',
    owner: '[H&S Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 45001:2018',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure establishes the Permit to Work (PTW) system at [COMPANY NAME] for controlling high-risk activities. It ensures that hazardous work is properly planned, authorised, and controlled, that all necessary safety precautions are in place before work begins, and that the work area is safely returned to normal operation upon completion.',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all high-risk activities performed by employees, contractors, and subcontractors at [COMPANY NAME] premises. It is mandatory for the PTW categories defined in this procedure and may be applied to other high-risk activities at the discretion of the [H&S Manager].',
      },
      { heading: '3. Definitions', content: '' },
      {
        bullets: [
          'Permit to Work (PTW) — A formal documented system that authorises certain work to be carried out during a defined period, identifying the hazards, precautions, and controls required.',
          'Issuing Authority — A competent person authorised to issue permits. Must have knowledge of the hazards, the work area, and the required precautions.',
          'Permit Holder — The person responsible for carrying out the work in accordance with the permit conditions.',
          'Isolation — The disconnection and separation of energy sources (electrical, mechanical, hydraulic, pneumatic, thermal, chemical) to prevent accidental energisation or release.',
          'LOTO — Lock-Out/Tag-Out; a procedure to ensure isolated equipment cannot be re-energised until the permit is closed.',
          'SIMOPS — Simultaneous Operations; when multiple permitted activities occur in the same or adjacent area.',
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              '[H&S Manager]',
              'Maintains the PTW system. Trains and authorises Issuing Authorities. Audits PTW compliance. Manages the PTW register.',
            ],
            [
              'Issuing Authority',
              'Assesses hazards, issues permits, ensures precautions are in place, conducts site inspections, closes permits.',
            ],
            [
              'Permit Holder',
              'Accepts the permit, ensures all workers understand the conditions, carries out work in compliance, reports deviations, returns the permit on completion.',
            ],
            [
              'Area Manager',
              'Confirms the work is required and the area is available. Reviews SIMOPS. Authorises access.',
            ],
            [
              'Workers',
              'Follow all permit conditions. Stop work if conditions change. Report any concerns.',
            ],
          ],
        },
      },
      { heading: '5. PTW Categories', content: '' },
      {
        table: {
          headers: ['Category', 'PTW Form', 'Examples', 'Key Hazards'],
          rows: [
            [
              'Hot Work',
              'PTW-HW',
              'Welding, cutting, grinding, brazing, soldering',
              'Fire, explosion, burns, fumes, ignition of flammables',
            ],
            [
              'Confined Space Entry',
              'PTW-CS',
              'Tanks, vessels, pits, silos, manholes, ducts',
              'Toxic atmosphere, oxygen depletion, engulfment, entrapment',
            ],
            [
              'Working at Height',
              'PTW-WH',
              'Scaffolding, ladders, roof work, cherry pickers',
              'Falls, falling objects, structural collapse',
            ],
            [
              'Electrical Work',
              'PTW-EL',
              'Live working, isolation, testing, commissioning',
              'Electric shock, arc flash, burns, secondary injury from falls',
            ],
            [
              'Excavation',
              'PTW-EX',
              'Trenching, digging, piling, ground investigation',
              'Collapse, underground services (gas, electric, water), flooding',
            ],
          ],
        },
      },
      { heading: '6. Permit Process', content: '' },
      {
        heading: '6.1 Pre-Work Planning',
        level: 2,
        content:
          'Before a permit is issued, the following planning steps are completed: a risk assessment specific to the work is reviewed or prepared, method statements are submitted by the contractor (where applicable), the work area is inspected by the Issuing Authority, required isolations are identified, emergency arrangements are confirmed, and all affected parties are notified.',
      },
      {
        heading: '6.2 Permit Issue',
        level: 2,
        content:
          'The Issuing Authority completes the relevant PTW form, specifying the work to be done, the location, the date and time validity period, the hazards identified, the precautions and controls required, the isolation points, the emergency arrangements, and any SIMOPS considerations.\n\nBoth the Issuing Authority and the Permit Holder sign the permit. The permit is displayed at the work location.',
      },
      {
        heading: '6.3 Pre-Work Checks',
        level: 2,
        content:
          'Before work commences, the Permit Holder verifies that all precautions listed on the permit are in place. This includes confirmation of isolations and LOTO, atmospheric testing (for confined space entry), fire watch arrangements (for hot work), fall protection in place (for working at height), barriers and signage erected, and PPE available and worn.\n\nIf any precondition is not met, work shall not commence until it is resolved.',
      },
      {
        heading: '6.4 During Work',
        level: 2,
        content:
          'The Permit Holder maintains the permit conditions throughout the work. If conditions change (e.g., weather, unexpected hazards, scope change), work must stop and the Issuing Authority must be notified. The permit may need to be re-assessed or cancelled.\n\nFor confined space work, continuous atmospheric monitoring is maintained. For hot work, fire watch is maintained during and for a minimum of 60 minutes after work ceases.',
      },
      {
        heading: '6.5 Permit Closure',
        level: 2,
        content:
          'Upon completion of work, the Permit Holder confirms the work area has been made safe, tools and materials removed, isolations can be removed, and the area returned to normal operation. The Permit Holder and Issuing Authority both sign the permit closure section. The completed permit is filed in the PTW register.',
      },
      {
        heading: '7. Simultaneous Operations (SIMOPS)',
        content:
          'When multiple permitted activities are planned in the same or adjacent areas, a SIMOPS assessment is conducted to identify potential interactions and conflicts. The Issuing Authorities for each permit coordinate to ensure that activities do not create additional hazards (e.g., hot work near confined space ventilation intake). SIMOPS are recorded on each affected permit.',
      },
      {
        heading: '8. Isolation & LOTO',
        content:
          'All energy isolations required by a permit shall follow the LOTO procedure. Each worker in the danger zone applies their personal lock and tag. Isolation is verified by attempting to restart the equipment. Locks are only removed by the person who applied them (or by the [H&S Manager] with documented authorisation in emergency situations).',
      },
      { heading: '9. Records', content: '' },
      {
        bullets: [
          'Completed PTW forms (filed in PTW register)',
          'PTW Register (maintained in IMS system)',
          'Issuing Authority competence records',
          'SIMOPS assessment records',
          'Isolation and LOTO logs',
        ],
      },
      { heading: '10. Related Documents', content: '' },
      {
        bullets: [
          'PRO-005 — Hazard Identification & Risk Assessment Procedure',
          'PRO-007 — Incident Investigation & Reporting Procedure',
          'PRO-011 — Emergency Preparedness & Response Procedure',
          'POL-003 — Health & Safety Policy',
        ],
      },
      {
        heading: '11. Review',
        content:
          'This procedure shall be reviewed at least annually by the [H&S Manager], or sooner after any PTW-related incident, changes to site operations, regulatory changes, or management review outputs.',
      },
    ],
  },
  // ─── PRO-013 ───
  {
    outputPath: `${OUT_DIR}/PRO-013-Change-Management.docx`,
    docNumber: 'PRO-013',
    title: 'Change Management Procedure',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 6.3',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the process for managing planned and unplanned changes within [COMPANY NAME] to ensure that changes are properly assessed, approved, implemented, and reviewed. It ensures that the integrity of the Integrated Management System is maintained and that changes do not introduce unintended adverse consequences.',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all changes that may affect the IMS, including changes to processes, equipment, materials, organisational structure, IT systems, facilities, products/services, suppliers, legal requirements, and the scope of the IMS. It covers planned changes (proactive) and emergency changes (reactive).',
      },
      { heading: '3. Definitions', content: '' },
      {
        bullets: [
          'Change — Any alteration to the established processes, systems, equipment, materials, organisation, or environment of [COMPANY NAME].',
          'Change Request — A formal documented proposal for a change.',
          'Impact Assessment — An evaluation of the potential effects of a proposed change on quality, environment, H&S, costs, timelines, and stakeholders.',
          'Change Advisory Board (CAB) — A cross-functional group that reviews and approves significant changes.',
          'Emergency Change — A change that must be implemented urgently to address an immediate risk to safety, environment, quality, or business continuity.',
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              '[Quality Manager]',
              'Manages the change management process. Chairs the CAB. Maintains the Change Register. Ensures post-change reviews are conducted.',
            ],
            [
              'Change Initiator',
              'Submits the Change Request Form. Provides justification and supporting information.',
            ],
            [
              'Change Advisory Board (CAB)',
              'Reviews significant changes. Evaluates impact assessments. Approves or rejects changes. Comprises [Quality Manager], [H&S Manager], [Environmental Manager], [IT Manager], and affected Department Managers.',
            ],
            [
              'Change Owner',
              'Implements the approved change. Manages the implementation plan. Reports on progress and completion.',
            ],
            [
              'Department Managers',
              'Assess the impact of changes on their areas. Support implementation. Communicate changes to their teams.',
            ],
          ],
        },
      },
      { heading: '5. Change Types & Approval Levels', content: '' },
      {
        table: {
          headers: ['Change Type', 'Description', 'Approval Level', 'Examples'],
          rows: [
            [
              'Minor',
              'Low risk, limited impact, reversible',
              'Department Manager',
              'Minor procedure update, equipment setting adjustment',
            ],
            [
              'Standard',
              'Moderate risk, cross-departmental impact possible',
              'Change Advisory Board',
              'New equipment, process change, supplier change, system upgrade',
            ],
            [
              'Major',
              'High risk, significant business impact',
              'CAB + [Managing Director]',
              'Organisational restructure, new product line, facility relocation, major system replacement',
            ],
            [
              'Emergency',
              'Urgent action to prevent imminent risk',
              '[Quality Manager] or [H&S Manager]',
              'Critical safety fix, emergency equipment replacement, urgent regulatory compliance',
            ],
          ],
        },
      },
      { heading: '6. Procedure — Planned Changes', content: '' },
      {
        heading: '6.1 Step 1 — Change Request',
        level: 2,
        content:
          'The Change Initiator completes a Change Request Form (FRM-040) describing the proposed change, the reason and justification, the affected areas and personnel, the proposed implementation timeline, and any resource requirements. The form is submitted to the [Quality Manager].',
      },
      {
        heading: '6.2 Step 2 — Impact Assessment',
        level: 2,
        content:
          'The [Quality Manager] coordinates an impact assessment covering: impact on quality (product/service conformity, customer satisfaction), impact on environment (aspects, compliance, emissions), impact on H&S (hazards, risks, worker safety), impact on IT systems and data, impact on resources (people, equipment, budget), impact on interested parties (customers, suppliers, regulators), risk of unintended consequences, and reversibility of the change.',
      },
      {
        heading: '6.3 Step 3 — Approval',
        level: 2,
        content:
          'Based on the change type and impact assessment, the change is submitted for approval at the appropriate level. Minor changes are approved by the Department Manager. Standard and major changes are presented to the CAB. The CAB may approve, approve with conditions, defer for more information, or reject the change. Decisions are recorded in the Change Register.',
      },
      {
        heading: '6.4 Step 4 — Implementation Planning',
        level: 2,
        content:
          'The Change Owner develops an Implementation Plan including specific tasks and milestones, responsible persons, communication plan (who needs to know, when, and how), training requirements, testing/validation steps, rollback plan (in case the change fails), and go-live date.\n\nThe plan is reviewed and approved by the [Quality Manager] before implementation begins.',
      },
      {
        heading: '6.5 Step 5 — Implementation & Communication',
        level: 2,
        content:
          'The change is implemented according to the plan. All affected personnel are informed. Training is delivered where required. Affected documents (procedures, work instructions, forms) are updated in accordance with PRO-001.',
      },
      {
        heading: '6.6 Step 6 — Post-Change Review',
        level: 2,
        content:
          'Within 30 days of implementation, the Change Owner and [Quality Manager] conduct a post-change review to verify that the change achieved its objectives, no unintended consequences have occurred, all documentation has been updated, affected personnel have been trained, and the change can be formally closed.\n\nThe review findings are recorded in the Change Register.',
      },
      {
        heading: '7. Emergency Changes',
        content:
          'Emergency changes bypass the standard approval process due to urgency. The change is authorised by the [Quality Manager] or [H&S Manager] (or the [Managing Director] if neither is available). The change is implemented immediately with appropriate safety precautions.\n\nWithin 48 hours of implementation, a retrospective Change Request Form is completed and the standard impact assessment and post-change review are conducted. Emergency changes are flagged in the Change Register for review at the next CAB meeting.',
      },
      { heading: '8. Records', content: '' },
      {
        bullets: [
          'FRM-040 — Change Request Form',
          'Impact Assessment records',
          'CAB meeting minutes and decisions',
          'Implementation Plans',
          'Post-Change Review records',
          'Change Register (maintained in IMS system)',
        ],
      },
      { heading: '9. Related Documents', content: '' },
      {
        bullets: [
          'PRO-001 — Document & Records Control Procedure',
          'PRO-004 — Risk & Opportunity Management Procedure',
          'PRO-010 — Training & Competence Procedure',
          'PRO-015 — Business Continuity & Disaster Recovery Procedure',
        ],
      },
      {
        heading: '10. Review',
        content:
          'This procedure shall be reviewed at least annually by the [Quality Manager], or sooner if triggered by failed changes, significant incidents caused by changes, audit findings, or management review outputs.',
      },
    ],
  },
  // ─── PRO-014 ───
  {
    outputPath: `${OUT_DIR}/PRO-014-Information-Security-Incident-Response.docx`,
    docNumber: 'PRO-014',
    title: 'Information Security Incident Response Procedure',
    version: '1.0',
    owner: '[CISO]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 27001:2022',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the process for detecting, reporting, assessing, containing, eradicating, recovering from, and reviewing information security incidents at [COMPANY NAME]. It ensures that security incidents are handled promptly and effectively to minimise harm to the organisation, its customers, and its data, and that regulatory notification obligations (including GDPR 72-hour breach notification) are met.',
      },
      {
        heading: '2. Scope',
        content:
          "This procedure applies to all information security incidents affecting [COMPANY NAME]'s information assets, IT systems, networks, data, and personnel. It covers incidents affecting confidentiality, integrity, and availability of information, whether caused by internal or external actors, accidental or deliberate actions, or technical or non-technical means.",
      },
      { heading: '3. Definitions', content: '' },
      {
        bullets: [
          'Information Security Incident — A single or series of unwanted or unexpected events that have a significant probability of compromising business operations and threatening information security.',
          'Security Event — An identified occurrence of a system, service, or network state indicating a possible breach of information security policy or failure of controls.',
          'Data Breach — A security incident that results in the accidental or unlawful destruction, loss, alteration, unauthorised disclosure of, or access to, personal data.',
          'Containment — Actions taken to limit the scope and impact of a security incident.',
          'Eradication — Removal of the root cause and any artefacts of the security incident from affected systems.',
          'CSIRT — Computer Security Incident Response Team; the designated team responsible for managing security incidents.',
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              '[CISO]',
              'Leads the CSIRT. Manages the incident response process. Makes containment and escalation decisions. Coordinates with external parties.',
            ],
            [
              'CSIRT Members',
              'IT Security, Network Operations, System Administration, Application Support, Legal, and Communications representatives.',
            ],
            [
              'All Personnel',
              'Report suspected security events immediately to the IT helpdesk or [CISO].',
            ],
            [
              '[Data Protection Officer]',
              'Assesses whether a data breach requires regulatory notification. Manages GDPR breach notification process.',
            ],
            [
              '[Managing Director]',
              'Authorises major response actions (e.g., system shutdowns). Manages stakeholder and media communications.',
            ],
            [
              'IT Helpdesk',
              'First point of contact for security event reports. Logs events. Escalates to CSIRT.',
            ],
          ],
        },
      },
      { heading: '5. Incident Categories', content: '' },
      {
        table: {
          headers: ['Category', 'Description', 'Severity', 'Examples'],
          rows: [
            [
              'Category 1 — Critical',
              'Active data breach, ransomware, APT',
              'Critical',
              'Confirmed data exfiltration, ransomware encryption, nation-state attack',
            ],
            [
              'Category 2 — High',
              'Significant security compromise',
              'High',
              'Compromised admin credentials, DDoS attack, malware outbreak',
            ],
            [
              'Category 3 — Medium',
              'Security violation with limited impact',
              'Medium',
              'Unauthorised access attempt (blocked), phishing campaign, policy violation',
            ],
            [
              'Category 4 — Low',
              'Minor security event',
              'Low',
              'Isolated spam, single failed login, lost unencrypted USB (no sensitive data)',
            ],
          ],
        },
      },
      { heading: '6. Incident Response Process', content: '' },
      {
        heading: '6.1 Phase 1 — Detection & Reporting',
        level: 2,
        content:
          'Security events are detected through security monitoring tools (SIEM, IDS/IPS, endpoint protection), user reports to the IT helpdesk, automated alerts from systems and applications, external notifications (vendors, partners, law enforcement, CERTs), and third-party vulnerability disclosure.\n\nAll personnel are required to report suspected security events immediately. Reports are logged in the Incident Management System with a unique reference number, date/time, reporter details, and initial description.',
      },
      {
        heading: '6.2 Phase 2 — Triage & Assessment',
        level: 2,
        content:
          'The CSIRT conducts an initial assessment within 1 hour of a reported event to determine whether it is a confirmed security incident, classify the category and severity, identify affected systems and data, assess the scope and potential impact, and determine whether personal data is affected (triggering GDPR assessment).',
      },
      {
        heading: '6.3 Phase 3 — Containment',
        level: 2,
        content:
          'Containment actions are taken to prevent the incident from spreading or causing further damage. Short-term containment (immediate actions) may include isolating affected systems from the network, disabling compromised user accounts, blocking malicious IP addresses or domains, activating firewall rules, and redirecting network traffic.\n\nLong-term containment involves implementing temporary fixes that allow business operations to continue while a permanent solution is developed.',
      },
      {
        heading: '6.4 Phase 4 — Eradication',
        level: 2,
        content:
          'Once contained, the root cause is identified and eliminated. Eradication actions may include removing malware from affected systems, patching exploited vulnerabilities, resetting compromised credentials, rebuilding affected systems from clean backups, and updating security controls to prevent similar attacks.\n\nEvidence is preserved throughout eradication for potential legal or forensic purposes.',
      },
      {
        heading: '6.5 Phase 5 — Recovery',
        level: 2,
        content:
          'Systems and services are restored to normal operation. Recovery includes restoring data from verified clean backups, returning affected systems to production, monitoring restored systems for any signs of recurring activity, verifying system integrity before resuming operations, and communicating recovery status to stakeholders.',
      },
      {
        heading: '6.6 Phase 6 — Post-Incident Review',
        level: 2,
        content:
          'A post-incident review is conducted within 5 working days of incident closure. The review examines the timeline of events, detection and response effectiveness, root cause analysis, what worked well and what needs improvement, adequacy of existing controls, and recommended improvements to prevent recurrence.\n\nThe review produces a Post-Incident Report distributed to the CSIRT, [Managing Director], and relevant stakeholders.',
      },
      {
        heading: '7. GDPR Breach Notification',
        content:
          'If the incident involves a personal data breach, the [Data Protection Officer] assesses the risk to individuals and determines notification requirements:',
      },
      {
        table: {
          headers: ['Action', 'Timescale', 'Recipient', 'Condition'],
          rows: [
            ['Internal assessment', 'Within 24 hours', 'DPO / CSIRT', 'All personal data breaches'],
            [
              'Supervisory authority notification',
              'Within 72 hours of awareness',
              'ICO (or local DPA)',
              'Unless unlikely to result in risk to individuals',
            ],
            [
              'Individual notification',
              'Without undue delay',
              'Affected data subjects',
              'When breach is likely to result in high risk to individuals',
            ],
          ],
        },
      },
      {
        content:
          'The notification to the supervisory authority includes the nature of the breach, categories and approximate number of individuals affected, name and contact details of the DPO, description of likely consequences, and description of measures taken or proposed to address the breach. All breach notifications are documented and retained.',
      },
      {
        heading: '8. Evidence Preservation',
        content:
          'Digital evidence must be preserved in a forensically sound manner. This includes creating forensic images of affected systems, preserving log files (system, application, network, security), documenting the chain of custody, securing physical evidence (hardware, storage media), and retaining all evidence for a minimum of 7 years or as required by legal proceedings.',
      },
      { heading: '9. Records', content: '' },
      {
        bullets: [
          'Incident reports and logs',
          'CSIRT meeting minutes',
          'Post-Incident Review reports',
          'GDPR breach notification records',
          'Forensic evidence and chain of custody records',
          'Incident register (maintained in IMS system)',
        ],
      },
      { heading: '10. Related Documents', content: '' },
      {
        bullets: [
          'PRO-003 — Corrective Action & CAPA Procedure',
          'PRO-015 — Business Continuity & Disaster Recovery Procedure',
          'Information Security Policy',
          'Data Protection Policy',
          'Acceptable Use Policy',
        ],
      },
      {
        heading: '11. Review',
        content:
          'This procedure shall be reviewed at least annually by the [CISO], or sooner after any significant security incident, changes to the threat landscape, regulatory changes, technology changes, or management review outputs.',
      },
    ],
  },
  // ─── PRO-015 ───
  {
    outputPath: `${OUT_DIR}/PRO-015-Business-Continuity-Disaster-Recovery.docx`,
    docNumber: 'PRO-015',
    title: 'Business Continuity & Disaster Recovery Procedure',
    version: '1.0',
    owner: '[Business Continuity Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 22301:2019',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure establishes the framework for business continuity planning and disaster recovery at [COMPANY NAME]. It ensures that critical business functions can continue during and after a disruptive event, that recovery is achieved within acceptable timescales, and that the organisation can return to normal operations as quickly as possible.',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all critical business processes, IT systems, facilities, and personnel of [COMPANY NAME]. It covers all types of disruptive events including natural disasters, technology failures, supply chain disruptions, pandemics, cyber attacks, utility failures, and any event that threatens the continuity of business operations.',
      },
      { heading: '3. Definitions', content: '' },
      {
        bullets: [
          'Business Continuity — The capability of the organisation to continue the delivery of products and services at acceptable predefined levels following a disruptive incident.',
          'Business Impact Analysis (BIA) — A process of analysing the potential effects of a disruption on critical business functions.',
          'Recovery Time Objective (RTO) — The target time within which a business process or IT system must be restored after a disruption.',
          'Recovery Point Objective (RPO) — The maximum acceptable amount of data loss measured in time (i.e., how old the restored data can be).',
          'Maximum Tolerable Period of Disruption (MTPD) — The maximum time a business function can be unavailable before the organisation suffers unacceptable consequences.',
          'Crisis Management Team (CMT) — The senior management team responsible for strategic decision-making during a crisis.',
          'Disaster Recovery (DR) — The process of restoring IT systems and data following a major failure or disaster.',
          'Business Continuity Plan (BCP) — A documented set of procedures and information for maintaining or recovering business operations during and after a disruption.',
        ],
      },
      { heading: '4. Responsibilities', content: '' },
      {
        table: {
          headers: ['Role', 'Responsibility'],
          rows: [
            [
              '[Business Continuity Manager]',
              'Develops and maintains BCPs. Conducts BIA. Coordinates testing. Manages the BC programme.',
            ],
            [
              '[Managing Director]',
              'Chairs the Crisis Management Team. Authorises activation of the BCP. Makes strategic decisions during a crisis.',
            ],
            [
              'Crisis Management Team',
              'Comprises [Managing Director], [Business Continuity Manager], [CISO], [H&S Manager], [HR Manager], [Operations Director], and Communications Lead.',
            ],
            [
              '[IT Manager / CISO]',
              'Develops and maintains the Disaster Recovery Plan. Manages IT backup and recovery. Tests DR procedures.',
            ],
            [
              'Department Managers',
              'Develop departmental recovery plans. Identify critical activities and resources. Participate in BIA and testing.',
            ],
            [
              'All Personnel',
              'Familiarise themselves with BC procedures. Participate in training and exercises. Follow instructions during a crisis.',
            ],
          ],
        },
      },
      {
        heading: '5. Business Impact Analysis (BIA)',
        content:
          'The BIA is conducted annually by the [Business Continuity Manager] in collaboration with Department Managers. The BIA identifies and prioritises critical business functions and determines:',
      },
      {
        bullets: [
          'The impact of disruption over time (financial, operational, reputational, legal, regulatory)',
          'The Maximum Tolerable Period of Disruption (MTPD) for each function',
          'The Recovery Time Objective (RTO) for each function',
          'The Recovery Point Objective (RPO) for each IT system supporting the function',
          'Dependencies (upstream and downstream processes, IT systems, suppliers, personnel)',
          'Minimum resources required for recovery (people, equipment, workspace, IT)',
          'Peak periods and seasonal considerations',
        ],
      },
      { heading: '5.1 BIA Prioritisation', level: 2, content: '' },
      {
        table: {
          headers: ['Priority', 'MTPD', 'RTO', 'Description', 'Examples'],
          rows: [
            [
              'Critical',
              '< 4 hours',
              '< 2 hours',
              'Functions essential to safety, regulatory compliance, or immediate revenue',
              'Order processing, payment systems, safety-critical operations',
            ],
            [
              'High',
              '< 24 hours',
              '< 8 hours',
              'Functions causing significant financial or reputational impact',
              'Customer service, production, supply chain management',
            ],
            [
              'Medium',
              '< 72 hours',
              '< 24 hours',
              'Functions causing moderate impact if disrupted',
              'HR administration, procurement, quality reporting',
            ],
            [
              'Low',
              '< 7 days',
              '< 72 hours',
              'Functions with limited short-term impact',
              'Training administration, long-term planning, marketing',
            ],
          ],
        },
      },
      {
        heading: '6. Recovery Strategies',
        content:
          'Recovery strategies are developed for each critical business function based on the BIA results:',
      },
      {
        table: {
          headers: ['Strategy', 'Description', 'Application'],
          rows: [
            [
              'Redundancy',
              'Duplicate critical systems and infrastructure',
              'IT systems, network connectivity, power supply',
            ],
            [
              'Reciprocal Agreement',
              'Mutual aid arrangements with partner organisations',
              'Shared facilities, equipment, expertise',
            ],
            [
              'Alternative Site',
              'Pre-arranged secondary location for operations',
              'Office functions, customer service, management',
            ],
            [
              'Remote Working',
              'Enable staff to work from home or remote locations',
              'Office-based functions with IT connectivity',
            ],
            [
              'Manual Workaround',
              'Pre-defined manual processes for when IT systems are unavailable',
              'Order processing, record keeping, communications',
            ],
            [
              'Outsourcing',
              'Third-party arrangements for temporary service provision',
              'IT hosting, logistics, specialist services',
            ],
            [
              'Stockpiling',
              'Maintaining additional inventory of critical supplies',
              'Raw materials, spare parts, consumables',
            ],
          ],
        },
      },
      { heading: '7. IT Disaster Recovery', content: '' },
      { heading: '7.1 RPO Requirements', level: 2, content: '' },
      {
        table: {
          headers: ['System Category', 'RPO', 'Backup Frequency', 'Backup Type'],
          rows: [
            [
              'Critical (ERP, CRM, Finance)',
              '< 1 hour',
              'Continuous / 15-minute incremental',
              'Real-time replication + daily full',
            ],
            [
              'High (Email, File Servers)',
              '< 4 hours',
              'Hourly incremental',
              'Daily full + hourly incremental',
            ],
            ['Medium (Departmental systems)', '< 24 hours', 'Daily', 'Daily full + off-site copy'],
            ['Low (Development, Test)', '< 72 hours', 'Weekly', 'Weekly full backup'],
          ],
        },
      },
      {
        heading: '7.2 DR Testing',
        level: 2,
        content:
          'IT disaster recovery is tested according to the following schedule: backup restoration tests (monthly — selected systems), failover tests for critical systems (quarterly), full DR simulation (annually), and data integrity verification (weekly automated checks). Test results are documented and any failures trigger corrective actions.',
      },
      { heading: '8. Crisis Management & Communication', content: '' },
      {
        heading: '8.1 Activation Triggers',
        level: 2,
        content: 'The BCP may be activated by any of the following triggers:',
      },
      {
        bullets: [
          'Loss of access to a primary facility (fire, flood, structural damage)',
          'Major IT system failure affecting critical business functions',
          'Loss of a critical supplier with no immediate alternative',
          'Pandemic or public health emergency affecting workforce availability',
          'Cyber attack causing widespread system compromise',
          'Major utility failure (power, water, telecommunications) exceeding 4 hours',
          'Any event assessed by the [Business Continuity Manager] as requiring activation',
        ],
      },
      {
        heading: '8.2 Communication Plan',
        level: 2,
        content:
          'The crisis communication plan defines how information is communicated during a disruption. Key elements include the Crisis Management Team notification chain (activated within 30 minutes), employee communications (via text message, email, phone tree, company intranet), customer communications (via account managers, website notice, social media), supplier and partner notifications, regulatory and authority notifications where required, and media management (all media enquiries directed to the designated spokesperson).\n\nPre-drafted communication templates are maintained for common scenarios.',
      },
      { heading: '9. Testing Schedule', content: '' },
      {
        table: {
          headers: ['Test Type', 'Frequency', 'Participants', 'Objective'],
          rows: [
            [
              'Desktop / Tabletop Exercise',
              'Bi-annual',
              'Crisis Management Team',
              'Validate decision-making, communication, and role clarity',
            ],
            [
              'Functional Exercise',
              'Annual',
              'CMT + Department Managers',
              'Test specific BCP elements (e.g., alternative site activation)',
            ],
            [
              'Full Simulation Exercise',
              'Every 2 years',
              'All relevant personnel',
              'End-to-end test of BCP activation, response, and recovery',
            ],
            [
              'IT DR Test',
              'Quarterly (partial) / Annual (full)',
              'IT team',
              'Verify system recovery within RTO/RPO targets',
            ],
            [
              'Communication Test',
              'Quarterly',
              'CMT + key personnel',
              'Verify contact details and notification chain timing',
            ],
          ],
        },
      },
      {
        content:
          'All tests are documented with results, lessons learned, and improvement actions. The [Business Continuity Manager] tracks action completion.',
      },
      {
        heading: '10. Plan Maintenance',
        content:
          'Business Continuity Plans are living documents that must be kept current. Plans are reviewed and updated at least annually, after any activation of the BCP, after significant organisational changes, after testing exercises, when BIA results change, and when new risks or threats are identified. All plan holders are notified of updates and provided with the current version.',
      },
      { heading: '11. Records', content: '' },
      {
        bullets: [
          'Business Impact Analysis report',
          'Business Continuity Plans (by department and function)',
          'IT Disaster Recovery Plan',
          'Crisis Communication Plan',
          'Test and exercise reports',
          'Plan review and update records',
          'Incident and activation logs',
        ],
      },
      { heading: '12. Related Documents', content: '' },
      {
        bullets: [
          'PRO-004 — Risk & Opportunity Management Procedure',
          'PRO-011 — Emergency Preparedness & Response Procedure',
          'PRO-014 — Information Security Incident Response Procedure',
          'Information Security Policy',
        ],
      },
      {
        heading: '13. Review',
        content:
          'This procedure shall be reviewed at least annually by the [Business Continuity Manager] and [Managing Director], or sooner after any BCP activation, significant test failures, major organisational changes, or management review outputs.',
      },
    ],
  },
];

// ─── Main ───
async function main() {
  const tmpDir = '/tmp/ims-proc-configs';
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log(`Generating ${procedures.length} procedure documents...\n`);

  for (const proc of procedures) {
    const configPath = path.join(tmpDir, `${proc.docNumber}.json`);
    fs.writeFileSync(configPath, JSON.stringify(proc, null, 2));
    try {
      const result = execSync(`node /home/dyl/New-BMS/scripts/create-docx.mjs "${configPath}"`, {
        cwd: BASE,
        encoding: 'utf8',
        timeout: 30000,
      });
      console.log(result.trim());
    } catch (err) {
      console.error(`FAILED: ${proc.docNumber} — ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`\nAll ${procedures.length} procedures generated successfully.`);
}

main();
