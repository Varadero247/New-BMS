// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
#!/usr/bin/env node
/**
 * Generate all 14 form templates (FRM-001 to FRM-014)
 */
import fs from 'fs';
import { execSync } from 'child_process';

const B = ''; // blank fill-in placeholder

const forms = [
  // ── FRM-001: Non-Conformance Report (NCR) Form ──
  {
    outputPath: 'docs/compliance-templates/forms/FRM-001-NCR-Form.docx',
    docNumber: 'FRM-001',
    title: 'Non-Conformance Report (NCR) Form',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 10.2',
    sections: [
      {
        heading: '1. Instructions',
        content:
          'Complete this form for any non-conformance identified during audits, inspections, customer complaints, process monitoring, or internal review. All fields marked with [ ] must be completed by the originator. The NCR must be reviewed and closed by the Quality Manager or delegate.',
      },

      {
        heading: '2. NCR Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['NCR Number:', '[NCR-YYYY-NNN]'],
            ['Date Raised:', '[DD/MM/YYYY]'],
            ['Raised By:', '[Name / Role]'],
            ['Department:', '[Department Name]'],
            [
              'Source of NCR:',
              '☐ Internal Audit  ☐ External Audit  ☐ Customer Complaint  ☐ Inspection  ☐ Process Monitoring  ☐ Supplier Issue  ☐ Other: ________',
            ],
            ['Product / Process / Service:', '[Description]'],
            ['Reference (PO/Batch/Drawing No.):', '[Reference Number]'],
            ['Location:', '[Site / Area]'],
            ['ISO Clause Reference:', '[e.g. 8.5.1 / 8.6]'],
          ],
        },
      },

      {
        heading: '3. Description of Non-Conformance',
        content:
          'Provide a clear, factual description of the non-conformance, including what was expected vs. what was found:',
      },
      {
        table: {
          headers: ['Description of Non-Conformance'],
          rows: [
            [
              '[Describe the non-conformance in detail. Include measurements, specifications, or standards that were not met.]',
            ],
            [B],
            [B],
            [B],
          ],
        },
      },

      {
        heading: '4. Immediate Containment Action',
        content:
          'Describe actions taken to contain the non-conformance and prevent further impact:',
      },
      {
        table: {
          headers: ['Containment Action', 'Action By', 'Date Completed'],
          rows: [
            ['[e.g. Quarantine affected product]', '[Name]', '[DD/MM/YYYY]'],
            ['[e.g. Notify customer of delay]', '[Name]', '[DD/MM/YYYY]'],
            [B, B, B],
          ],
        },
      },

      {
        heading: '5. Root Cause Analysis — 5-Why Method',
        content: 'Complete the 5-Why analysis to identify the root cause of the non-conformance:',
      },
      {
        table: {
          headers: ['Why #', 'Question', 'Answer'],
          rows: [
            ['Why 1', 'Why did the non-conformance occur?', '[Answer]'],
            ['Why 2', 'Why did [Answer 1] happen?', '[Answer]'],
            ['Why 3', 'Why did [Answer 2] happen?', '[Answer]'],
            ['Why 4', 'Why did [Answer 3] happen?', '[Answer]'],
            ['Why 5', 'Why did [Answer 4] happen?', '[Answer]'],
          ],
        },
      },
      {
        content:
          'Root Cause Statement: [Summarise the identified root cause based on the 5-Why analysis above]',
      },

      {
        heading: '6. Corrective Action Plan',
        table: {
          headers: ['#', 'Corrective Action', 'Responsible Person', 'Target Date', 'Status'],
          rows: [
            [
              '1',
              '[Describe corrective action]',
              '[Name]',
              '[DD/MM/YYYY]',
              '☐ Open  ☐ In Progress  ☐ Complete',
            ],
            [
              '2',
              '[Describe corrective action]',
              '[Name]',
              '[DD/MM/YYYY]',
              '☐ Open  ☐ In Progress  ☐ Complete',
            ],
            ['3', B, B, B, '☐ Open  ☐ In Progress  ☐ Complete'],
            ['4', B, B, B, '☐ Open  ☐ In Progress  ☐ Complete'],
          ],
        },
      },

      {
        heading: '7. Verification of Effectiveness',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Verification Method:', '[e.g. Re-audit / Re-inspection / Data review]'],
            ['Verification Date:', '[DD/MM/YYYY]'],
            ['Verified By:', '[Name / Role]'],
            [
              'Result:',
              '☐ Effective — NC will not recur  ☐ Not Effective — further action required',
            ],
            ['Comments:', '[Verification findings and evidence]'],
          ],
        },
      },

      {
        heading: '8. Closure Sign-Off',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Originator:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Quality Manager:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Department Manager:', '[Name]', '________________', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ── FRM-002: Hazard Identification & Risk Assessment Form ──
  {
    outputPath: 'docs/compliance-templates/forms/FRM-002-Hazard-Risk-Assessment.docx',
    docNumber: 'FRM-002',
    title: 'Hazard Identification & Risk Assessment Form',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Health & Safety Manager]',
    isoRef: 'ISO 45001:2018 Clause 6.1',
    sections: [
      {
        heading: '1. Assessment Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Assessment Reference:', '[RA-YYYY-NNN]'],
            ['Date of Assessment:', '[DD/MM/YYYY]'],
            ['Assessor(s):', '[Name(s) / Role(s)]'],
            ['Department / Area:', '[Location / Activity Area]'],
            ['Activity / Process:', '[Description of work activity being assessed]'],
            ['Review Date:', '[DD/MM/YYYY]'],
          ],
        },
      },

      {
        heading: '2. Risk Matrix Key',
        content:
          'Use the following 5×5 risk matrix to determine risk scores. Risk Score = Likelihood × Severity.',
      },
      {
        table: {
          headers: [
            '',
            'Severity 1 (Negligible)',
            'Severity 2 (Minor)',
            'Severity 3 (Moderate)',
            'Severity 4 (Major)',
            'Severity 5 (Catastrophic)',
          ],
          rows: [
            [
              'Likelihood 5 (Almost Certain)',
              '5 – Medium',
              '10 – Medium',
              '15 – High',
              '20 – Critical',
              '25 – Critical',
            ],
            [
              'Likelihood 4 (Likely)',
              '4 – Low',
              '8 – Medium',
              '12 – High',
              '16 – High',
              '20 – Critical',
            ],
            [
              'Likelihood 3 (Possible)',
              '3 – Low',
              '6 – Medium',
              '9 – Medium',
              '12 – High',
              '15 – High',
            ],
            [
              'Likelihood 2 (Unlikely)',
              '2 – Low',
              '4 – Low',
              '6 – Medium',
              '8 – Medium',
              '10 – Medium',
            ],
            ['Likelihood 1 (Rare)', '1 – Low', '2 – Low', '3 – Low', '4 – Low', '5 – Medium'],
          ],
        },
      },

      {
        heading: '3. Risk Level Definitions',
        table: {
          headers: ['Risk Level', 'Score Range', 'Action Required'],
          rows: [
            [
              'Critical',
              '20–25',
              'Immediate action required. Stop work if necessary. Senior management to be notified.',
            ],
            [
              'High',
              '12–19',
              'Action required within 7 days. Additional controls must be implemented.',
            ],
            [
              'Medium',
              '5–11',
              'Action required within 30 days. Review existing controls and improve where reasonably practicable.',
            ],
            [
              'Low',
              '1–4',
              'Acceptable with current controls. Monitor and review at planned intervals.',
            ],
          ],
        },
      },

      {
        heading: '4. Hazard Identification & Risk Assessment Register',
        content:
          'Complete one row per identified hazard. Use the risk matrix above to score likelihood and severity.',
      },
      {
        table: {
          headers: [
            '#',
            'Activity / Task',
            'Hazard Description',
            'Who Affected',
            'Existing Controls',
            'L',
            'S',
            'Risk Score',
            'Risk Level',
            'Additional Controls Required',
            'Residual L',
            'Residual S',
            'Residual Risk',
            'Responsible Person',
            'Review Date',
          ],
          rows: [
            [
              '1',
              '[e.g. Manual handling]',
              '[e.g. Back injury from lifting heavy boxes]',
              '[e.g. Warehouse staff]',
              '[e.g. Mechanical aids, training]',
              '[1-5]',
              '[1-5]',
              '[L×S]',
              '[Low/Med/High/Crit]',
              '[e.g. Introduce max weight limit signs]',
              '[1-5]',
              '[1-5]',
              '[L×S]',
              '[Name]',
              '[DD/MM/YYYY]',
            ],
            ['2', B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            ['3', B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            ['4', B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            ['5', B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            ['6', B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            ['7', B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            ['8', B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            ['9', B, B, B, B, B, B, B, B, B, B, B, B, B, B],
            ['10', B, B, B, B, B, B, B, B, B, B, B, B, B, B],
          ],
        },
      },

      {
        heading: '5. Assessment Sign-Off',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Assessor:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Reviewed By:', '[H&S Manager]', '________________', '[DD/MM/YYYY]'],
            ['Approved By:', '[Department Manager]', '________________', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ── FRM-003: Incident Report Form ──
  {
    outputPath: 'docs/compliance-templates/forms/FRM-003-Incident-Report.docx',
    docNumber: 'FRM-003',
    title: 'Incident Report Form',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Health & Safety Manager]',
    isoRef: 'ISO 45001:2018 Clause 10.2',
    sections: [
      {
        heading: '1. Instructions',
        content:
          'This form must be completed as soon as practicable following any incident, including injuries, near-misses, dangerous occurrences, property damage, and environmental incidents. Complete all sections fully and submit to the H&S Manager within 24 hours.',
      },

      {
        heading: '2. Incident Classification',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Incident Reference:', '[INC-YYYY-NNN]'],
            [
              'Incident Type:',
              '☐ Injury / Ill Health  ☐ Near Miss  ☐ Dangerous Occurrence  ☐ Property Damage  ☐ Environmental Release  ☐ Fire  ☐ Security Breach  ☐ Other: ________',
            ],
            [
              'Severity:',
              '☐ Minor (First Aid)  ☐ Moderate (Medical Treatment)  ☐ Major (Lost Time / Hospitalisation)  ☐ Critical (Life Threatening)  ☐ Catastrophic (Fatality)',
            ],
          ],
        },
      },

      {
        heading: '3. Incident Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Date of Incident:', '[DD/MM/YYYY]'],
            ['Time of Incident:', '[HH:MM]'],
            ['Location:', '[Specific location — building, floor, room, area]'],
            ['Department:', '[Department Name]'],
            ['Shift:', '☐ Day  ☐ Night  ☐ Weekend  ☐ N/A'],
            ['Activity Being Performed:', '[Description of task/activity at time of incident]'],
            ['Weather Conditions (if outdoor):', '[e.g. Dry / Wet / Icy / Windy / N/A]'],
          ],
        },
      },

      {
        heading: '4. Description of Incident',
        content: 'Provide a full factual account of what happened, in chronological order:',
      },
      {
        table: {
          headers: ['Description of Incident'],
          rows: [
            [
              '[Describe exactly what happened, including events leading up to, during, and immediately after the incident.]',
            ],
            [B],
            [B],
            [B],
            [B],
          ],
        },
      },

      {
        heading: '5. Persons Involved / Injured',
        table: {
          headers: [
            'Name',
            'Role / Job Title',
            'Employee / Contractor / Visitor',
            'Nature of Injury / Involvement',
            'Treatment Given',
          ],
          rows: [
            [
              '[Name]',
              '[Role]',
              '☐ Employee  ☐ Contractor  ☐ Visitor',
              '[e.g. Laceration to left hand]',
              '[e.g. First aid on site]',
            ],
            [B, B, '☐ Employee  ☐ Contractor  ☐ Visitor', B, B],
            [B, B, '☐ Employee  ☐ Contractor  ☐ Visitor', B, B],
          ],
        },
      },

      {
        heading: '6. Immediate Actions Taken',
        table: {
          headers: ['Action Taken', 'By Whom', 'Date / Time'],
          rows: [
            ['[e.g. Area cordoned off]', '[Name]', '[DD/MM/YYYY HH:MM]'],
            ['[e.g. First aid administered]', '[Name]', '[DD/MM/YYYY HH:MM]'],
            ['[e.g. Emergency services called]', '[Name]', '[DD/MM/YYYY HH:MM]'],
            [B, B, B],
          ],
        },
      },

      {
        heading: '7. Witnesses',
        table: {
          headers: [
            'Witness Name',
            'Role / Relationship',
            'Contact Details',
            'Statement Taken Y/N',
          ],
          rows: [
            ['[Name]', '[Role]', '[Phone / Email]', '☐ Yes  ☐ No'],
            [B, B, B, '☐ Yes  ☐ No'],
            [B, B, B, '☐ Yes  ☐ No'],
          ],
        },
      },

      {
        heading: '8. Evidence',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            [
              'Photographs Taken:',
              '☐ Yes  ☐ No    If Yes, number of photos: ____    Stored at: [location/reference]',
            ],
            ['CCTV Available:', '☐ Yes  ☐ No    If Yes, footage secured: ☐ Yes  ☐ No'],
            ['Equipment/Material Preserved:', '☐ Yes  ☐ No  ☐ N/A'],
            ['Other Evidence:', '[Describe any other evidence collected]'],
          ],
        },
      },

      {
        heading: '9. Initial Cause Assessment',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            [
              'Initial Cause Category:',
              '☐ Unsafe Act  ☐ Unsafe Condition  ☐ Equipment Failure  ☐ Procedural Failure  ☐ Lack of Training  ☐ Environmental Factor  ☐ Other: ________',
            ],
            ['Brief Cause Description:', '[Initial assessment of what caused the incident]'],
          ],
        },
      },

      {
        heading: '10. Regulatory & Investigation Requirements',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            [
              'RIDDOR Reportable:',
              '☐ Yes  ☐ No  ☐ To Be Determined    If Yes, RIDDOR ref: ________',
            ],
            ['Environmental Regulator Notification Required:', '☐ Yes  ☐ No  ☐ N/A'],
            [
              'Investigation Required:',
              '☐ Yes — Full Investigation  ☐ Yes — Desk-Based Review  ☐ No',
            ],
            ['Investigation Lead:', '[Name / Role]'],
            ['Target Investigation Completion Date:', '[DD/MM/YYYY]'],
          ],
        },
      },

      {
        heading: '11. Reporting Sign-Off',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Report Completed By:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Line Manager:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['H&S Manager:', '[Name]', '________________', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ── FRM-004: Internal Audit Checklist Template ──
  {
    outputPath: 'docs/compliance-templates/forms/FRM-004-Internal-Audit-Checklist.docx',
    docNumber: 'FRM-004',
    title: 'Internal Audit Checklist Template',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001/14001/45001 Clause 9.2',
    sections: [
      {
        heading: '1. Audit Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Audit Reference:', '[AUD-YYYY-NNN]'],
            ['Audit Date(s):', '[DD/MM/YYYY] to [DD/MM/YYYY]'],
            [
              'Audit Type:',
              '☐ ISO 9001 (Quality)  ☐ ISO 14001 (Environment)  ☐ ISO 45001 (OH&S)  ☐ Integrated',
            ],
            ['Audit Scope:', '[Departments / Processes / Clauses covered]'],
            ['Lead Auditor:', '[Name]'],
            ['Audit Team:', '[Name(s)]'],
            ['Auditee(s):', '[Name(s) / Role(s)]'],
          ],
        },
      },

      {
        heading: '2. Finding Type Key',
        table: {
          headers: ['Code', 'Finding Type', 'Definition'],
          rows: [
            ['C', 'Conformity', 'Requirement is met with objective evidence.'],
            [
              'OBS',
              'Observation',
              'Area noted for potential improvement but not a non-conformity.',
            ],
            [
              'OFI',
              'Opportunity for Improvement',
              'Suggestion that could enhance system performance.',
            ],
            [
              'Minor NC',
              'Minor Non-Conformity',
              'Isolated or systemic lapse that does not affect system integrity.',
            ],
            [
              'Major NC',
              'Major Non-Conformity',
              'Absence or total breakdown of a system to meet a requirement.',
            ],
          ],
        },
      },

      {
        heading: '3. Audit Checklist — Clause 4: Context of the Organisation',
        table: {
          headers: [
            'Ref',
            'Requirement',
            'Finding (C/OBS/Minor NC/Major NC/OFI)',
            'Evidence / Notes',
            'Auditee Confirmation',
          ],
          rows: [
            [
              '4.1',
              'Has the organisation determined external and internal issues relevant to its purpose and strategic direction?',
              B,
              B,
              B,
            ],
            [
              '4.2',
              'Have the needs and expectations of interested parties been determined?',
              B,
              B,
              B,
            ],
            [
              '4.3',
              'Has the scope of the management system been determined and documented?',
              B,
              B,
              B,
            ],
            [
              '4.4',
              'Have the processes needed for the management system been determined, including interactions?',
              B,
              B,
              B,
            ],
          ],
        },
      },

      {
        heading: '4. Audit Checklist — Clause 5: Leadership',
        table: {
          headers: [
            'Ref',
            'Requirement',
            'Finding (C/OBS/Minor NC/Major NC/OFI)',
            'Evidence / Notes',
            'Auditee Confirmation',
          ],
          rows: [
            [
              '5.1',
              'Does top management demonstrate leadership and commitment to the management system?',
              B,
              B,
              B,
            ],
            ['5.2', 'Has a policy been established, communicated, and maintained?', B, B, B],
            [
              '5.3',
              'Have roles, responsibilities, and authorities been assigned and communicated?',
              B,
              B,
              B,
            ],
          ],
        },
      },

      {
        heading: '5. Audit Checklist — Clause 6: Planning',
        table: {
          headers: [
            'Ref',
            'Requirement',
            'Finding (C/OBS/Minor NC/Major NC/OFI)',
            'Evidence / Notes',
            'Auditee Confirmation',
          ],
          rows: [
            [
              '6.1',
              'Have risks and opportunities been determined and actions planned to address them?',
              B,
              B,
              B,
            ],
            ['6.2', 'Have objectives been established and plans made to achieve them?', B, B, B],
            ['6.3', 'Has planning of changes been carried out in a controlled manner?', B, B, B],
          ],
        },
      },

      {
        heading: '6. Audit Checklist — Clause 7: Support',
        table: {
          headers: [
            'Ref',
            'Requirement',
            'Finding (C/OBS/Minor NC/Major NC/OFI)',
            'Evidence / Notes',
            'Auditee Confirmation',
          ],
          rows: [
            [
              '7.1',
              'Have resources been determined and provided (people, infrastructure, environment, monitoring/measuring, knowledge)?',
              B,
              B,
              B,
            ],
            [
              '7.2',
              'Has competence of persons been determined, with training and evaluation records?',
              B,
              B,
              B,
            ],
            [
              '7.3',
              'Are persons aware of the policy, objectives, their contribution, and implications of non-conformity?',
              B,
              B,
              B,
            ],
            [
              '7.4',
              'Have internal and external communications been determined (what, when, who, how)?',
              B,
              B,
              B,
            ],
            [
              '7.5',
              'Is documented information controlled (creation, updating, identification, storage, protection, retention)?',
              B,
              B,
              B,
            ],
          ],
        },
      },

      {
        heading: '7. Audit Checklist — Clause 8: Operation',
        table: {
          headers: [
            'Ref',
            'Requirement',
            'Finding (C/OBS/Minor NC/Major NC/OFI)',
            'Evidence / Notes',
            'Auditee Confirmation',
          ],
          rows: [
            [
              '8.1',
              'Have operational processes been planned, implemented, and controlled?',
              B,
              B,
              B,
            ],
            [
              '8.2',
              'Have requirements for products and services been determined, reviewed, and communicated?',
              B,
              B,
              B,
            ],
            [
              '8.3',
              'Has design and development been planned and controlled (where applicable)?',
              B,
              B,
              B,
            ],
            [
              '8.4',
              'Are externally provided processes, products, and services controlled?',
              B,
              B,
              B,
            ],
            [
              '8.5',
              'Are production and service provision controlled under defined conditions?',
              B,
              B,
              B,
            ],
            [
              '8.6',
              'Is release of products and services subject to planned verification?',
              B,
              B,
              B,
            ],
            ['8.7', 'Are nonconforming outputs identified and controlled?', B, B, B],
          ],
        },
      },

      {
        heading: '8. Audit Checklist — Clause 9: Performance Evaluation',
        table: {
          headers: [
            'Ref',
            'Requirement',
            'Finding (C/OBS/Minor NC/Major NC/OFI)',
            'Evidence / Notes',
            'Auditee Confirmation',
          ],
          rows: [
            ['9.1', 'Has performance been monitored, measured, analysed, and evaluated?', B, B, B],
            ['9.2', 'Have internal audits been conducted at planned intervals?', B, B, B],
            [
              '9.3',
              'Has management review been conducted considering all required inputs?',
              B,
              B,
              B,
            ],
          ],
        },
      },

      {
        heading: '9. Audit Checklist — Clause 10: Improvement',
        table: {
          headers: [
            'Ref',
            'Requirement',
            'Finding (C/OBS/Minor NC/Major NC/OFI)',
            'Evidence / Notes',
            'Auditee Confirmation',
          ],
          rows: [
            [
              '10.1',
              'Have opportunities for improvement been determined and implemented?',
              B,
              B,
              B,
            ],
            [
              '10.2',
              'Have non-conformities been addressed with corrective actions and root cause analysis?',
              B,
              B,
              B,
            ],
            [
              '10.3',
              'Has the organisation continually improved the suitability, adequacy, and effectiveness of the management system?',
              B,
              B,
              B,
            ],
          ],
        },
      },

      {
        heading: '10. Audit Summary',
        table: {
          headers: ['Summary Item', 'Count'],
          rows: [
            ['Conformities (C):', '[Number]'],
            ['Observations (OBS):', '[Number]'],
            ['Opportunities for Improvement (OFI):', '[Number]'],
            ['Minor Non-Conformities:', '[Number]'],
            ['Major Non-Conformities:', '[Number]'],
            ['Total Clauses Audited:', '[Number]'],
          ],
        },
      },

      {
        heading: '11. Sign-Off',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Lead Auditor:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Auditee Representative:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Quality Manager:', '[Name]', '________________', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ── FRM-005: Corrective Action Form (CAPA) ──
  {
    outputPath: 'docs/compliance-templates/forms/FRM-005-CAPA-Form.docx',
    docNumber: 'FRM-005',
    title: 'Corrective Action Form (CAPA)',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 10.2',
    sections: [
      {
        heading: '1. CAPA Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['CAPA Reference:', '[CAPA-YYYY-NNN]'],
            ['Date Raised:', '[DD/MM/YYYY]'],
            ['Raised By:', '[Name / Role]'],
            ['Priority:', '☐ Critical  ☐ High  ☐ Medium  ☐ Low'],
            ['Linked NCR(s):', '[NCR-YYYY-NNN or N/A]'],
            ['Linked Incident(s):', '[INC-YYYY-NNN or N/A]'],
            ['Linked Audit Finding(s):', '[AUD-YYYY-NNN / Finding # or N/A]'],
            ['Linked Customer Complaint:', '[Complaint ref or N/A]'],
            ['Department:', '[Department Name]'],
            ['ISO Clause Reference:', '[e.g. 10.2.1]'],
          ],
        },
      },

      {
        heading: '2. Problem Statement',
        content:
          'Describe the problem clearly and concisely. Include the impact on product, service, process, or customer:',
      },
      {
        table: {
          headers: ['Problem Statement'],
          rows: [
            [
              '[Clear description of the problem — what is wrong, where, when, how often, and what is the impact?]',
            ],
            [B],
            [B],
          ],
        },
      },

      {
        heading: '3. Immediate / Containment Action',
        table: {
          headers: ['Immediate Action', 'Responsible', 'Date Completed', 'Effective Y/N'],
          rows: [
            [
              '[e.g. Quarantine stock, notify customer, stop process]',
              '[Name]',
              '[DD/MM/YYYY]',
              '☐ Yes  ☐ No',
            ],
            [B, B, B, '☐ Yes  ☐ No'],
            [B, B, B, '☐ Yes  ☐ No'],
          ],
        },
      },

      { heading: '4. Root Cause Analysis', level: 1 },
      {
        heading: '4.1 5-Why Analysis',
        level: 2,
        table: {
          headers: ['Why #', 'Question', 'Answer'],
          rows: [
            ['Why 1', 'Why did the problem occur?', '[Answer]'],
            ['Why 2', 'Why did [Answer 1] happen?', '[Answer]'],
            ['Why 3', 'Why did [Answer 2] happen?', '[Answer]'],
            ['Why 4', 'Why did [Answer 3] happen?', '[Answer]'],
            ['Why 5', 'Why did [Answer 4] happen?', '[Answer]'],
          ],
        },
      },
      {
        content:
          'Root Cause Statement: [Summarise the root cause identified from the analysis above]',
      },

      {
        heading: '4.2 Fishbone (Ishikawa) Diagram Categories',
        level: 2,
        content: 'Assess each category for contributing factors:',
      },
      {
        table: {
          headers: ['Category', 'Contributing Factor(s)', 'Relevant Y/N'],
          rows: [
            ['Man (People)', '[Skills, training, competence, fatigue, supervision]', '☐ Yes  ☐ No'],
            [
              'Machine (Equipment)',
              '[Maintenance, calibration, capability, age, condition]',
              '☐ Yes  ☐ No',
            ],
            [
              'Method (Process)',
              '[Procedures, work instructions, standards, sequence]',
              '☐ Yes  ☐ No',
            ],
            ['Material', '[Raw materials, consumables, specifications, suppliers]', '☐ Yes  ☐ No'],
            ['Measurement', '[Gauges, instruments, data accuracy, frequency]', '☐ Yes  ☐ No'],
            ['Environment', '[Temperature, humidity, lighting, cleanliness, noise]', '☐ Yes  ☐ No'],
          ],
        },
      },

      {
        heading: '5. Proposed Corrective Actions',
        table: {
          headers: [
            '#',
            'Corrective Action Description',
            'Expected Outcome',
            'Responsible Person',
            'Target Date',
            'Status',
          ],
          rows: [
            [
              '1',
              '[Describe the corrective action]',
              '[What will this achieve?]',
              '[Name]',
              '[DD/MM/YYYY]',
              '☐ Open  ☐ In Progress  ☐ Complete',
            ],
            ['2', B, B, B, B, '☐ Open  ☐ In Progress  ☐ Complete'],
            ['3', B, B, B, B, '☐ Open  ☐ In Progress  ☐ Complete'],
            ['4', B, B, B, B, '☐ Open  ☐ In Progress  ☐ Complete'],
          ],
        },
      },

      {
        heading: '6. Implementation Evidence',
        table: {
          headers: ['Action #', 'Evidence of Implementation', 'Date Implemented', 'Verified By'],
          rows: [
            [
              '1',
              '[e.g. Updated procedure ref, training records, photos]',
              '[DD/MM/YYYY]',
              '[Name]',
            ],
            ['2', B, B, B],
            ['3', B, B, B],
            ['4', B, B, B],
          ],
        },
      },

      {
        heading: '7. Effectiveness Review',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            [
              'Effectiveness Check Date:',
              '[DD/MM/YYYY — typically 30-90 days after implementation]',
            ],
            ['Review Method:', '[e.g. Data analysis, re-audit, inspection, customer feedback]'],
            ['Reviewed By:', '[Name / Role]'],
            [
              'Result:',
              '☐ Effective — Problem has not recurred  ☐ Partially Effective — Further action required  ☐ Not Effective — Reopen CAPA',
            ],
            ['Evidence:', '[Describe evidence supporting the effectiveness determination]'],
          ],
        },
      },

      {
        heading: '8. Closure',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['CAPA Owner:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Quality Manager:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Management Representative:', '[Name]', '________________', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ── FRM-006: Permit to Work Form ──
  {
    outputPath: 'docs/compliance-templates/forms/FRM-006-Permit-To-Work.docx',
    docNumber: 'FRM-006',
    title: 'Permit to Work Form',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Operations Director]',
    isoRef: 'ISO 45001:2018',
    sections: [
      {
        heading: '1. Permit Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Permit Number:', '[PTW-YYYY-NNN]'],
            ['Date of Issue:', '[DD/MM/YYYY]'],
            ['Valid From:', '[DD/MM/YYYY HH:MM]'],
            ['Valid To:', '[DD/MM/YYYY HH:MM]'],
            [
              'Permit Type:',
              '☐ Hot Work  ☐ Confined Space Entry  ☐ Working at Height  ☐ Electrical Work  ☐ Excavation  ☐ Asbestos  ☐ Other: ________',
            ],
          ],
        },
      },

      {
        heading: '2. Work Description',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Description of Work:', '[Detailed description of the work to be carried out]'],
            ['Exact Location:', '[Building / Floor / Room / Area / Equipment ID]'],
            ['Reason for Work:', '[e.g. Maintenance, repair, installation, inspection]'],
            ['Estimated Duration:', '[Hours / Days]'],
            ['Number of Workers:', '[Number]'],
            ['Contractor Company (if applicable):', '[Company Name]'],
          ],
        },
      },

      {
        heading: '3. Hazard Assessment Checklist',
        content: 'Tick all hazards that apply to this work activity:',
      },
      {
        table: {
          headers: ['Hazard', 'Present?', 'Control Measures Required'],
          rows: [
            ['Fire / Explosion Risk', '☐ Yes  ☐ No', B],
            ['Toxic / Harmful Substances', '☐ Yes  ☐ No', B],
            ['Oxygen Deficiency / Enrichment', '☐ Yes  ☐ No', B],
            ['Electrical Hazards', '☐ Yes  ☐ No', B],
            ['Moving / Rotating Machinery', '☐ Yes  ☐ No', B],
            ['Falling from Height', '☐ Yes  ☐ No', B],
            ['Falling Objects', '☐ Yes  ☐ No', B],
            ['Confined Space', '☐ Yes  ☐ No', B],
            ['Noise > 85 dB(A)', '☐ Yes  ☐ No', B],
            ['Hot Surfaces / Burns', '☐ Yes  ☐ No', B],
            ['Pressure Systems', '☐ Yes  ☐ No', B],
            ['Biological Hazards', '☐ Yes  ☐ No', B],
            ['Manual Handling', '☐ Yes  ☐ No', B],
            ['Environmental Impact (spill, emission)', '☐ Yes  ☐ No', B],
            ['Other: ________________', '☐ Yes  ☐ No', B],
          ],
        },
      },

      {
        heading: '4. Precautions & Controls Required',
        table: {
          headers: ['Precaution / Control', 'Required?', 'Confirmed In Place'],
          rows: [
            ['Area barricaded / cordoned off', '☐ Yes  ☐ No  ☐ N/A', '☐'],
            ['Warning signs displayed', '☐ Yes  ☐ No  ☐ N/A', '☐'],
            ['Fire extinguisher(s) available', '☐ Yes  ☐ No  ☐ N/A', '☐'],
            ['Gas monitoring equipment', '☐ Yes  ☐ No  ☐ N/A', '☐'],
            ['Ventilation provided', '☐ Yes  ☐ No  ☐ N/A', '☐'],
            ['PPE specified and worn', '☐ Yes  ☐ No  ☐ N/A', '☐'],
            ['LOTO (Lock Out Tag Out) applied', '☐ Yes  ☐ No  ☐ N/A', '☐'],
            ['Spill containment in place', '☐ Yes  ☐ No  ☐ N/A', '☐'],
            ['Rescue equipment available', '☐ Yes  ☐ No  ☐ N/A', '☐'],
            ['Standby person assigned', '☐ Yes  ☐ No  ☐ N/A', '☐'],
            ['Other: ________________', '☐ Yes  ☐ No  ☐ N/A', '☐'],
          ],
        },
      },

      {
        heading: '5. Isolation Verification',
        table: {
          headers: [
            'Isolation Type',
            'Isolation Point / Reference',
            'Isolated By',
            'Verified By',
            'Date / Time',
          ],
          rows: [
            ['Electrical', B, B, B, B],
            ['Mechanical', B, B, B, B],
            ['Process / Pipework', B, B, B, B],
            ['Other: ________', B, B, B, B],
          ],
        },
      },

      {
        heading: '6. Emergency Arrangements',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Nearest First Aider:', '[Name / Location]'],
            ['Nearest Fire Extinguisher:', '[Location]'],
            ['Emergency Assembly Point:', '[Location]'],
            ['Emergency Contact Number:', '[Phone Number]'],
            ['Rescue Plan (Confined Space):', '[Description or reference to rescue plan document]'],
            ['Nearest Hospital / A&E:', '[Name / Address]'],
          ],
        },
      },

      {
        heading: '7. Permit Issue — Authorisation',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date', 'Time'],
          rows: [
            [
              'Permit Issuer (Authorising Manager):',
              '[Name]',
              '________________',
              '[DD/MM/YYYY]',
              '[HH:MM]',
            ],
            [
              'Permit Receiver (Person in Charge):',
              '[Name]',
              '________________',
              '[DD/MM/YYYY]',
              '[HH:MM]',
            ],
          ],
        },
      },
      {
        content:
          'By signing above, the Permit Issuer confirms that all hazards have been assessed, controls are in place, and the work may proceed. The Permit Receiver acknowledges understanding of all conditions and will ensure compliance.',
      },

      {
        heading: '8. Permit Extension (if required)',
        table: {
          headers: [
            'Extended To (Date/Time)',
            'Reason for Extension',
            'Authorised By',
            'Signature',
          ],
          rows: [
            [B, B, B, '________________'],
            [B, B, B, '________________'],
          ],
        },
      },

      {
        heading: '9. Permit Completion / Cancellation',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Work Status:', '☐ Completed  ☐ Cancelled  ☐ Suspended'],
            ['Area Left Safe & Clean:', '☐ Yes  ☐ No — Details: ________'],
            ['All Isolations Removed:', '☐ Yes  ☐ No  ☐ N/A'],
            ['All Workers Accounted For:', '☐ Yes  ☐ No'],
            ['Completion Date/Time:', '[DD/MM/YYYY HH:MM]'],
          ],
        },
      },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date', 'Time'],
          rows: [
            ['Permit Receiver:', '[Name]', '________________', '[DD/MM/YYYY]', '[HH:MM]'],
            ['Permit Issuer (Close-Out):', '[Name]', '________________', '[DD/MM/YYYY]', '[HH:MM]'],
          ],
        },
      },
    ],
  },

  // ── FRM-007: Supplier Evaluation Form ──
  {
    outputPath: 'docs/compliance-templates/forms/FRM-007-Supplier-Evaluation.docx',
    docNumber: 'FRM-007',
    title: 'Supplier Evaluation Form',
    version: '1.0',
    owner: '[Procurement Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 8.4',
    sections: [
      {
        heading: '1. Supplier Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Supplier Name:', '[Company Name]'],
            ['Supplier Reference:', '[SUP-YYYY-NNN]'],
            [
              'Evaluation Type:',
              '☐ Initial Approval  ☐ Annual Review  ☐ Re-Evaluation  ☐ Post-Incident',
            ],
            ['Evaluation Date:', '[DD/MM/YYYY]'],
            ['Evaluated By:', '[Name / Role]'],
            ['Products / Services Supplied:', '[Description]'],
            ['Supplier Contact:', '[Name / Email / Phone]'],
            ['Supplier Address:', '[Address]'],
          ],
        },
      },

      {
        heading: '2. Evaluation Criteria',
        content: 'Score each criterion from 1 (Poor) to 5 (Excellent) using the definitions below:',
      },
      {
        table: {
          headers: ['Score', 'Rating', 'Definition'],
          rows: [
            ['5', 'Excellent', 'Exceeds requirements consistently. Best-in-class performance.'],
            ['4', 'Good', 'Meets requirements consistently with minor areas for improvement.'],
            ['3', 'Satisfactory', 'Meets minimum requirements. Some improvement needed.'],
            [
              '2',
              'Below Standard',
              'Does not consistently meet requirements. Significant improvement needed.',
            ],
            [
              '1',
              'Poor',
              'Fails to meet requirements. Immediate action or supplier replacement required.',
            ],
          ],
        },
      },

      {
        heading: '3. Scoring',
        table: {
          headers: [
            '#',
            'Evaluation Criterion',
            'Weight',
            'Score (1-5)',
            'Weighted Score',
            'Notes / Evidence',
          ],
          rows: [
            [
              '1',
              'Quality Management System (ISO 9001 / equivalent certification)',
              '20%',
              '[1-5]',
              '[Score × 0.20]',
              '[e.g. ISO 9001:2015 cert valid to DD/MM/YYYY]',
            ],
            [
              '2',
              'Delivery Performance (on-time, in-full)',
              '20%',
              '[1-5]',
              '[Score × 0.20]',
              '[e.g. 95% OTIF in last 12 months]',
            ],
            [
              '3',
              'Pricing & Competitiveness',
              '15%',
              '[1-5]',
              '[Score × 0.15]',
              '[e.g. Competitive benchmarking results]',
            ],
            [
              '4',
              'Technical Capability & Product Quality',
              '15%',
              '[1-5]',
              '[Score × 0.15]',
              '[e.g. Reject rate < 0.5%]',
            ],
            [
              '5',
              'Financial Stability',
              '10%',
              '[1-5]',
              '[Score × 0.10]',
              '[e.g. Credit check result, D&B rating]',
            ],
            [
              '6',
              'Health & Safety Standards',
              '10%',
              '[1-5]',
              '[Score × 0.10]',
              '[e.g. ISO 45001 cert, accident record]',
            ],
            [
              '7',
              'Environmental Performance',
              '10%',
              '[1-5]',
              '[Score × 0.10]',
              '[e.g. ISO 14001 cert, environmental policy]',
            ],
          ],
        },
      },
      { content: 'Total Weighted Score: [Sum of Weighted Scores] / 5.00' },

      {
        heading: '4. Overall Supplier Rating',
        table: {
          headers: ['Score Range', 'Rating', 'Action'],
          rows: [
            [
              '4.0 – 5.0',
              'Approved — Preferred Supplier',
              'Add to Approved Supplier List. Eligible for increased orders.',
            ],
            [
              '3.0 – 3.9',
              'Approved — Standard Supplier',
              'Add to Approved Supplier List. Monitor performance.',
            ],
            [
              '2.0 – 2.9',
              'Conditionally Approved',
              'Supplier must provide improvement plan within 30 days. Re-evaluate in 90 days.',
            ],
            [
              '1.0 – 1.9',
              'Not Approved / Suspended',
              'Do not use. Existing orders to be reviewed. Seek alternative supplier.',
            ],
          ],
        },
      },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            [
              'Final Rating:',
              '☐ Approved — Preferred  ☐ Approved — Standard  ☐ Conditionally Approved  ☐ Not Approved',
            ],
            ['Conditions (if applicable):', '[Detail any conditions for approval]'],
            ['Next Review Date:', '[DD/MM/YYYY]'],
          ],
        },
      },

      {
        heading: '5. Supplier NCRs & Performance History',
        table: {
          headers: ['Date', 'NCR / Issue Reference', 'Description', 'Resolution', 'Status'],
          rows: [
            [
              '[DD/MM/YYYY]',
              '[NCR ref]',
              '[Description of quality/delivery issue]',
              '[How resolved]',
              '☐ Open  ☐ Closed',
            ],
            [B, B, B, B, '☐ Open  ☐ Closed'],
            [B, B, B, B, '☐ Open  ☐ Closed'],
          ],
        },
      },

      {
        heading: '6. Sign-Off',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Evaluator:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Procurement Manager:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Quality Manager:', '[Name]', '________________', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ── FRM-008: Training Record & Effectiveness Evaluation ──
  {
    outputPath: 'docs/compliance-templates/forms/FRM-008-Training-Record.docx',
    docNumber: 'FRM-008',
    title: 'Training Record & Effectiveness Evaluation',
    version: '1.0',
    owner: '[HR Manager]',
    approvedBy: '[HR Manager]',
    isoRef: 'ISO 9001/45001 Clause 7.2',
    sections: [
      {
        heading: '1. Employee Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Employee Name:', '[Full Name]'],
            ['Employee ID:', '[EMP-NNNN]'],
            ['Job Title / Role:', '[Role]'],
            ['Department:', '[Department Name]'],
            ['Line Manager:', '[Manager Name]'],
            ['Start Date in Role:', '[DD/MM/YYYY]'],
          ],
        },
      },

      {
        heading: '2. Training Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Training Title:', '[Title of course / programme]'],
            ['Training Reference:', '[TRN-YYYY-NNN]'],
            ['Training Provider:', '☐ Internal  ☐ External — Provider: [Name]'],
            ['Training Date(s):', '[DD/MM/YYYY] to [DD/MM/YYYY]'],
            ['Duration:', '[Hours / Days]'],
            [
              'Training Method:',
              '☐ Classroom  ☐ On-the-Job  ☐ E-Learning  ☐ Workshop  ☐ Simulation  ☐ Self-Study  ☐ Mentoring  ☐ Other: ________',
            ],
            ['Location:', '[Venue / Online Platform]'],
            [
              'Training Objectives:',
              '[What the trainee should be able to do after completing the training]',
            ],
            ['Linked Competence Requirement:', '[e.g. ISO 45001 cl.7.2 — COSHH Awareness]'],
          ],
        },
      },

      {
        heading: '3. Assessment',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            [
              'Assessment Method:',
              '☐ Written Test  ☐ Practical Demonstration  ☐ Observation  ☐ Oral Q&A  ☐ Assignment  ☐ N/A',
            ],
            ['Pass Mark (if applicable):', '[e.g. 80%]'],
            ['Trainee Score:', '[Score / Percentage]'],
            ['Result:', '☐ Pass  ☐ Fail  ☐ N/A (no formal assessment)'],
            [
              'Certificate / Qualification Issued:',
              '☐ Yes — Ref: [Certificate Number]  ☐ No  ☐ N/A',
            ],
            ['Expiry / Renewal Date:', '[DD/MM/YYYY or N/A]'],
          ],
        },
      },

      {
        heading: '4. Trainer / Trainee Sign-Off',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Trainer:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Trainee:', '[Name]', '________________', '[DD/MM/YYYY]'],
          ],
        },
      },

      {
        heading: '5. Effectiveness Evaluation',
        content:
          'The effectiveness of training must be reviewed to confirm the trainee has achieved the required competence. Complete the following reviews:',
      },
      {
        table: {
          headers: [
            'Review Stage',
            'Review Date',
            'Reviewer',
            'Competence Demonstrated? (Y/N)',
            'Evidence / Comments',
          ],
          rows: [
            [
              '30-Day Review',
              '[DD/MM/YYYY]',
              '[Manager Name]',
              '☐ Yes  ☐ No  ☐ Partial',
              '[Observations, work output quality, errors, feedback]',
            ],
            [
              '60-Day Review',
              '[DD/MM/YYYY]',
              '[Manager Name]',
              '☐ Yes  ☐ No  ☐ Partial',
              '[Observations, work output quality, errors, feedback]',
            ],
            [
              '90-Day Review',
              '[DD/MM/YYYY]',
              '[Manager Name]',
              '☐ Yes  ☐ No  ☐ Partial',
              '[Observations, work output quality, errors, feedback]',
            ],
          ],
        },
      },

      {
        heading: '6. Overall Effectiveness Determination',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            [
              'Overall Result:',
              '☐ Effective — Competence achieved  ☐ Partially Effective — Further training/coaching required  ☐ Not Effective — Retrain or reassign',
            ],
            [
              'Further Action Required:',
              '[Describe any additional training, coaching, or support needed]',
            ],
            ['Follow-Up Date:', '[DD/MM/YYYY or N/A]'],
          ],
        },
      },

      {
        heading: '7. Manager Confirmation',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Line Manager:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['HR Manager:', '[Name]', '________________', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ── FRM-009: Management Review Meeting Minutes Template ──
  {
    outputPath: 'docs/compliance-templates/forms/FRM-009-Management-Review-Minutes.docx',
    docNumber: 'FRM-009',
    title: 'Management Review Meeting Minutes Template',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001:2015 Clause 9.3',
    sections: [
      {
        heading: '1. Meeting Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Meeting Reference:', '[MR-YYYY-NNN]'],
            ['Date:', '[DD/MM/YYYY]'],
            ['Time:', '[HH:MM] to [HH:MM]'],
            ['Location:', '[Room / Virtual Platform]'],
            ['Chair:', '[Name / Role]'],
            ['Minutes Taken By:', '[Name / Role]'],
            [
              'Management System(s) Reviewed:',
              '☐ ISO 9001 (Quality)  ☐ ISO 14001 (Environment)  ☐ ISO 45001 (OH&S)  ☐ Integrated',
            ],
          ],
        },
      },

      {
        heading: '2. Attendance',
        table: {
          headers: ['Name', 'Role / Title', 'Present / Apologies'],
          rows: [
            ['[Name]', '[Managing Director]', '☐ Present  ☐ Apologies'],
            ['[Name]', '[Quality Manager]', '☐ Present  ☐ Apologies'],
            ['[Name]', '[H&S Manager]', '☐ Present  ☐ Apologies'],
            ['[Name]', '[Environmental Manager]', '☐ Present  ☐ Apologies'],
            ['[Name]', '[Operations Manager]', '☐ Present  ☐ Apologies'],
            ['[Name]', '[HR Manager]', '☐ Present  ☐ Apologies'],
            [B, B, '☐ Present  ☐ Apologies'],
            [B, B, '☐ Present  ☐ Apologies'],
          ],
        },
      },

      {
        heading: '3. Agenda & Review Inputs (ISO 9001:2015 Clause 9.3.2)',
        content: 'The following mandatory inputs must be reviewed at each management review:',
      },

      { heading: '3.1 Status of Actions from Previous Management Reviews', level: 2 },
      {
        table: {
          headers: ['Action Ref', 'Action Description', 'Owner', 'Due Date', 'Status', 'Comments'],
          rows: [
            [
              '[MR-XXX-01]',
              '[Previous action description]',
              '[Name]',
              '[DD/MM/YYYY]',
              '☐ Complete  ☐ Ongoing  ☐ Overdue',
              B,
            ],
            [B, B, B, B, '☐ Complete  ☐ Ongoing  ☐ Overdue', B],
            [B, B, B, B, '☐ Complete  ☐ Ongoing  ☐ Overdue', B],
          ],
        },
      },

      { heading: '3.2 Changes in External & Internal Issues', level: 2 },
      {
        table: {
          headers: ['Change / Issue', 'Impact on Management System', 'Action Required'],
          rows: [
            [
              '[e.g. New legislation, market changes, organisational restructure]',
              '[Impact description]',
              '[Action or N/A]',
            ],
            [B, B, B],
          ],
        },
      },

      { heading: '3.3 Customer Satisfaction & Feedback', level: 2 },
      {
        table: {
          headers: ['Metric', 'Current Period', 'Previous Period', 'Target', 'Trend', 'Comments'],
          rows: [
            ['Customer Satisfaction Score', '[Score]', '[Score]', '[Target]', '☐ ↑  ☐ →  ☐ ↓', B],
            ['Customer Complaints', '[Number]', '[Number]', '[Target]', '☐ ↑  ☐ →  ☐ ↓', B],
            ['Net Promoter Score', '[Score]', '[Score]', '[Target]', '☐ ↑  ☐ →  ☐ ↓', B],
          ],
        },
      },

      { heading: '3.4 Quality Objectives — Performance Against Targets', level: 2 },
      {
        table: {
          headers: ['Objective', 'KPI / Metric', 'Target', 'Actual', 'Status', 'Comments'],
          rows: [
            ['[Objective 1]', '[KPI]', '[Target]', '[Actual]', '☐ Met  ☐ Not Met', B],
            ['[Objective 2]', '[KPI]', '[Target]', '[Actual]', '☐ Met  ☐ Not Met', B],
            ['[Objective 3]', '[KPI]', '[Target]', '[Actual]', '☐ Met  ☐ Not Met', B],
            [B, B, B, B, '☐ Met  ☐ Not Met', B],
          ],
        },
      },

      { heading: '3.5 Process Performance & Product Conformity', level: 2 },
      {
        table: {
          headers: ['Process / Product', 'KPI', 'Result', 'Conformity (Y/N)', 'Comments'],
          rows: [
            ['[Process 1]', '[e.g. Defect rate]', '[Result]', '☐ Yes  ☐ No', B],
            ['[Process 2]', '[e.g. On-time delivery]', '[Result]', '☐ Yes  ☐ No', B],
            [B, B, B, '☐ Yes  ☐ No', B],
          ],
        },
      },

      { heading: '3.6 Non-Conformities & Corrective Actions (CAPA)', level: 2 },
      {
        table: {
          headers: ['Metric', 'Current Period', 'Previous Period', 'Trend', 'Comments'],
          rows: [
            ['Total NCRs Raised', '[Number]', '[Number]', '☐ ↑  ☐ →  ☐ ↓', B],
            ['NCRs Closed On Time', '[Number / %]', '[Number / %]', '☐ ↑  ☐ →  ☐ ↓', B],
            ['CAPAs Open', '[Number]', '[Number]', '☐ ↑  ☐ →  ☐ ↓', B],
            ['CAPAs Effective at First Review', '[Number / %]', '[Number / %]', '☐ ↑  ☐ →  ☐ ↓', B],
          ],
        },
      },

      { heading: '3.7 Internal & External Audit Results', level: 2 },
      {
        table: {
          headers: ['Audit Ref', 'Audit Type', 'Date', 'Major NCs', 'Minor NCs', 'OFIs', 'Status'],
          rows: [
            [
              '[AUD ref]',
              '☐ Internal  ☐ External',
              '[DD/MM/YYYY]',
              '[N]',
              '[N]',
              '[N]',
              '☐ Open  ☐ Closed',
            ],
            [B, '☐ Internal  ☐ External', B, B, B, B, '☐ Open  ☐ Closed'],
          ],
        },
      },

      { heading: '3.8 External Provider (Supplier) Performance', level: 2 },
      {
        table: {
          headers: ['Supplier', 'Products/Services', 'Rating', 'Issues', 'Action Required'],
          rows: [
            [
              '[Supplier Name]',
              '[Products/Services]',
              '[Rating]',
              '[Issues or None]',
              '[Action or N/A]',
            ],
            [B, B, B, B, B],
          ],
        },
      },

      { heading: '3.9 Risks & Opportunities', level: 2 },
      {
        table: {
          headers: [
            'Risk / Opportunity',
            'Current Status',
            'Effectiveness of Actions',
            'New Actions Required',
          ],
          rows: [
            ['[Risk/Opportunity 1]', '[Status]', '[Effective / Not Effective]', '[Action or N/A]'],
            ['[Risk/Opportunity 2]', '[Status]', '[Effective / Not Effective]', '[Action or N/A]'],
            [B, B, B, B],
          ],
        },
      },

      { heading: '3.10 Opportunities for Improvement', level: 2 },
      {
        table: {
          headers: [
            'Improvement Opportunity',
            'Proposed Action',
            'Expected Benefit',
            'Owner',
            'Target Date',
          ],
          rows: [
            ['[Improvement 1]', '[Action]', '[Benefit]', '[Name]', '[DD/MM/YYYY]'],
            ['[Improvement 2]', '[Action]', '[Benefit]', '[Name]', '[DD/MM/YYYY]'],
            [B, B, B, B, B],
          ],
        },
      },

      {
        heading: '4. Management Review Outputs (ISO 9001:2015 Clause 9.3.3)',
        content: 'Decisions and actions from this review:',
      },
      {
        table: {
          headers: ['Action Ref', 'Action Description', 'Owner', 'Target Date', 'Priority'],
          rows: [
            [
              '[MR-YYYY-01]',
              '[Action description]',
              '[Name]',
              '[DD/MM/YYYY]',
              '☐ Critical  ☐ High  ☐ Medium  ☐ Low',
            ],
            ['[MR-YYYY-02]', B, B, B, '☐ Critical  ☐ High  ☐ Medium  ☐ Low'],
            ['[MR-YYYY-03]', B, B, B, '☐ Critical  ☐ High  ☐ Medium  ☐ Low'],
            ['[MR-YYYY-04]', B, B, B, '☐ Critical  ☐ High  ☐ Medium  ☐ Low'],
            ['[MR-YYYY-05]', B, B, B, '☐ Critical  ☐ High  ☐ Medium  ☐ Low'],
          ],
        },
      },

      {
        heading: '5. Next Management Review',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Proposed Date:', '[DD/MM/YYYY]'],
            ['Focus Areas:', '[Areas to prioritise at next review]'],
          ],
        },
      },

      {
        heading: '6. Approval',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Chair (Managing Director):', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Minutes Approved By:', '[Name]', '________________', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ── FRM-010: Environmental Aspects & Impacts Register ──
  {
    outputPath: 'docs/compliance-templates/forms/FRM-010-Environmental-Aspects-Register.docx',
    docNumber: 'FRM-010',
    title: 'Environmental Aspects & Impacts Register',
    version: '1.0',
    owner: '[Environmental Manager]',
    approvedBy: '[Environmental Manager]',
    isoRef: 'ISO 14001:2015 Clause 6.1',
    sections: [
      {
        heading: '1. Register Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Register Reference:', '[EAR-YYYY]'],
            ['Date of Assessment:', '[DD/MM/YYYY]'],
            ['Assessed By:', '[Name(s) / Role(s)]'],
            ['Scope:', '[Sites / Activities / Processes covered]'],
            ['Next Review Date:', '[DD/MM/YYYY]'],
          ],
        },
      },

      {
        heading: '2. Significance Scoring Criteria',
        content:
          'Score each factor from 1 (Low) to 5 (High). Significance Score = Severity + Probability + Legal Impact. Scores >= 9 are considered Significant.',
      },
      {
        table: {
          headers: ['Score', 'Severity', 'Probability', 'Legal Impact'],
          rows: [
            [
              '1',
              'Negligible — No measurable impact',
              'Rare — May occur in exceptional circumstances',
              'No applicable legislation',
            ],
            [
              '2',
              'Minor — Localised, short-term, reversible',
              'Unlikely — Could occur but not expected',
              'Legislation exists, full compliance',
            ],
            [
              '3',
              'Moderate — Localised, medium-term impact',
              'Possible — May occur at some time',
              'Legislation exists, minor gaps',
            ],
            [
              '4',
              'Major — Widespread or long-term impact',
              'Likely — Will probably occur',
              'Legislation exists, significant gaps',
            ],
            [
              '5',
              'Catastrophic — Severe, irreversible environmental damage',
              'Almost Certain — Expected to occur',
              'Regulatory breach, prosecution risk',
            ],
          ],
        },
      },

      {
        heading: '3. Environmental Aspects & Impacts Register',
        content: 'Complete one row per environmental aspect identified:',
      },
      {
        table: {
          headers: [
            '#',
            'Activity / Process',
            'Environmental Aspect',
            'Environmental Impact',
            'Condition (N/Ab/E)',
            'Severity (1-5)',
            'Probability (1-5)',
            'Legal Impact (1-5)',
            'Significance Score',
            'Significant? (Y/N)',
            'Control Measure',
            'KPI / Monitoring',
            'Review Date',
          ],
          rows: [
            [
              '1',
              '[e.g. Manufacturing]',
              '[e.g. Air emissions from paint shop]',
              '[e.g. Air quality degradation]',
              'N',
              '[1-5]',
              '[1-5]',
              '[1-5]',
              '[Sum]',
              '[Y/N]',
              '[e.g. Extraction system, VOC monitoring]',
              '[e.g. VOC ppm < 50]',
              '[DD/MM/YYYY]',
            ],
            [
              '2',
              '[e.g. Waste disposal]',
              '[e.g. Hazardous waste generation]',
              '[e.g. Soil/water contamination risk]',
              'N',
              B,
              B,
              B,
              B,
              B,
              B,
              B,
              B,
            ],
            [
              '3',
              '[e.g. Energy use]',
              '[e.g. Electricity consumption]',
              '[e.g. GHG emissions (Scope 2)]',
              'N',
              B,
              B,
              B,
              B,
              B,
              B,
              B,
              B,
            ],
            ['4', B, B, B, B, B, B, B, B, B, B, B, B],
            ['5', B, B, B, B, B, B, B, B, B, B, B, B],
            ['6', B, B, B, B, B, B, B, B, B, B, B, B],
            ['7', B, B, B, B, B, B, B, B, B, B, B, B],
            ['8', B, B, B, B, B, B, B, B, B, B, B, B],
            ['9', B, B, B, B, B, B, B, B, B, B, B, B],
            ['10', B, B, B, B, B, B, B, B, B, B, B, B],
          ],
        },
      },
      {
        content:
          'Condition Key: N = Normal Operations, Ab = Abnormal Operations, E = Emergency Situation',
      },

      {
        heading: '4. Sign-Off',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Assessor:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Environmental Manager:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Approved By:', '[Senior Management]', '________________', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ── FRM-011: Legal & Regulatory Register ──
  {
    outputPath: 'docs/compliance-templates/forms/FRM-011-Legal-Regulatory-Register.docx',
    docNumber: 'FRM-011',
    title: 'Legal & Regulatory Register',
    version: '1.0',
    owner: '[Compliance Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001/14001/45001',
    sections: [
      {
        heading: '1. Register Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Register Reference:', '[LRR-YYYY]'],
            ['Last Reviewed:', '[DD/MM/YYYY]'],
            ['Reviewed By:', '[Name / Role]'],
            [
              'Applicable Standards:',
              '☐ ISO 9001  ☐ ISO 14001  ☐ ISO 45001  ☐ ISO 27001  ☐ ISO 37001  ☐ ISO 42001  ☐ Other: ________',
            ],
            ['Next Review Date:', '[DD/MM/YYYY]'],
          ],
        },
      },

      {
        heading: '2. Instructions',
        content:
          'This register captures all applicable legal, regulatory, and other compliance obligations. It must be reviewed at least annually or when triggered by new legislation, regulatory changes, audit findings, or incidents. Each entry should be assessed for compliance status and assigned to a responsible person.',
      },

      {
        heading: '3. Legal & Regulatory Register',
        table: {
          headers: [
            '#',
            'Legislation / Standard / Requirement',
            'Jurisdiction',
            'Applicable Activity / Process',
            'Requirement Summary',
            'Compliance Status',
            'Evidence of Compliance',
            'Responsible Person',
            'Review Date',
          ],
          rows: [
            [
              '1',
              '[e.g. Health and Safety at Work etc. Act 1974]',
              '[e.g. UK]',
              '[e.g. All operations]',
              '[Key requirements applicable to the organisation]',
              '☐ Compliant  ☐ Partially  ☐ Non-compliant',
              '[e.g. H&S policy, risk assessments, training records]',
              '[Name]',
              '[DD/MM/YYYY]',
            ],
            [
              '2',
              '[e.g. Environmental Protection Act 1990]',
              '[e.g. UK]',
              '[e.g. Waste management]',
              '[Key requirements]',
              '☐ Compliant  ☐ Partially  ☐ Non-compliant',
              B,
              B,
              B,
            ],
            [
              '3',
              '[e.g. GDPR / UK Data Protection Act 2018]',
              '[e.g. UK/EU]',
              '[e.g. Personal data processing]',
              '[Key requirements]',
              '☐ Compliant  ☐ Partially  ☐ Non-compliant',
              B,
              B,
              B,
            ],
            [
              '4',
              '[e.g. REACH Regulations]',
              '[e.g. EU/UK]',
              '[e.g. Chemical use]',
              '[Key requirements]',
              '☐ Compliant  ☐ Partially  ☐ Non-compliant',
              B,
              B,
              B,
            ],
            [
              '5',
              '[e.g. RIDDOR 2013]',
              '[e.g. UK]',
              '[e.g. Incident reporting]',
              '[Key requirements]',
              '☐ Compliant  ☐ Partially  ☐ Non-compliant',
              B,
              B,
              B,
            ],
            ['6', B, B, B, B, '☐ Compliant  ☐ Partially  ☐ Non-compliant', B, B, B],
            ['7', B, B, B, B, '☐ Compliant  ☐ Partially  ☐ Non-compliant', B, B, B],
            ['8', B, B, B, B, '☐ Compliant  ☐ Partially  ☐ Non-compliant', B, B, B],
            ['9', B, B, B, B, '☐ Compliant  ☐ Partially  ☐ Non-compliant', B, B, B],
            ['10', B, B, B, B, '☐ Compliant  ☐ Partially  ☐ Non-compliant', B, B, B],
            ['11', B, B, B, B, '☐ Compliant  ☐ Partially  ☐ Non-compliant', B, B, B],
            ['12', B, B, B, B, '☐ Compliant  ☐ Partially  ☐ Non-compliant', B, B, B],
          ],
        },
      },

      {
        heading: '4. Compliance Summary',
        table: {
          headers: ['Status', 'Count', 'Percentage'],
          rows: [
            ['Compliant', '[Number]', '[%]'],
            ['Partially Compliant', '[Number]', '[%]'],
            ['Non-Compliant', '[Number]', '[%]'],
            ['Total Requirements', '[Number]', '100%'],
          ],
        },
      },

      {
        heading: '5. Sign-Off',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Compliance Manager:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Managing Director:', '[Name]', '________________', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ── FRM-012: Gift & Hospitality Register ──
  {
    outputPath: 'docs/compliance-templates/forms/FRM-012-Gift-Hospitality-Register.docx',
    docNumber: 'FRM-012',
    title: 'Gift & Hospitality Register',
    version: '1.0',
    owner: '[Compliance Manager]',
    approvedBy: '[Compliance Manager]',
    isoRef: 'ISO 37001:2016',
    sections: [
      {
        heading: '1. Register Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Register Reference:', '[GHR-YYYY]'],
            ['Period Covered:', '[DD/MM/YYYY] to [DD/MM/YYYY]'],
            ['Maintained By:', '[Name / Role]'],
            ['Last Reviewed:', '[DD/MM/YYYY]'],
          ],
        },
      },

      {
        heading: '2. Policy Summary',
        content:
          'All gifts, hospitality, entertainment, and donations given or received by employees, directors, or agents of [COMPANY NAME] must be recorded in this register in accordance with the Anti-Bribery & Corruption Policy (POL-010) and ISO 37001:2016.\n\nThresholds:\n- Gifts under [GBP 25] — Record recommended, approval not required\n- Gifts [GBP 25 – GBP 100] — Must be recorded and approved by line manager\n- Gifts over [GBP 100] — Must be recorded and approved by Compliance Manager\n- Cash or cash equivalents — Always prohibited\n- Government officials — All gifts must be pre-approved by Compliance Manager regardless of value',
      },

      {
        heading: '3. Gift & Hospitality Register',
        table: {
          headers: [
            '#',
            'Date',
            'Given or Received',
            'Employee Name / Role',
            'Third Party (Giver / Receiver)',
            'Organisation',
            'Nature / Description',
            'Estimated Value (GBP)',
            'Business Justification',
            'Approved By',
            'Declared to Compliance Y/N',
            'Comments',
          ],
          rows: [
            [
              '1',
              '[DD/MM/YYYY]',
              '☐ Given  ☐ Received',
              '[Name / Role]',
              '[Name / Role]',
              '[Company]',
              '[e.g. Business lunch, conference tickets, branded merchandise]',
              '[Value]',
              '[Business reason for the gift/hospitality]',
              '[Name]',
              '☐ Yes  ☐ No',
              B,
            ],
            ['2', B, '☐ Given  ☐ Received', B, B, B, B, B, B, B, '☐ Yes  ☐ No', B],
            ['3', B, '☐ Given  ☐ Received', B, B, B, B, B, B, B, '☐ Yes  ☐ No', B],
            ['4', B, '☐ Given  ☐ Received', B, B, B, B, B, B, B, '☐ Yes  ☐ No', B],
            ['5', B, '☐ Given  ☐ Received', B, B, B, B, B, B, B, '☐ Yes  ☐ No', B],
            ['6', B, '☐ Given  ☐ Received', B, B, B, B, B, B, B, '☐ Yes  ☐ No', B],
            ['7', B, '☐ Given  ☐ Received', B, B, B, B, B, B, B, '☐ Yes  ☐ No', B],
            ['8', B, '☐ Given  ☐ Received', B, B, B, B, B, B, B, '☐ Yes  ☐ No', B],
            ['9', B, '☐ Given  ☐ Received', B, B, B, B, B, B, B, '☐ Yes  ☐ No', B],
            ['10', B, '☐ Given  ☐ Received', B, B, B, B, B, B, B, '☐ Yes  ☐ No', B],
          ],
        },
      },

      {
        heading: '4. Period Summary',
        table: {
          headers: ['Metric', 'Count', 'Total Value (GBP)'],
          rows: [
            ['Gifts Given', '[Number]', '[Total]'],
            ['Gifts Received', '[Number]', '[Total]'],
            ['Hospitality Given', '[Number]', '[Total]'],
            ['Hospitality Received', '[Number]', '[Total]'],
            ['Declined / Returned', '[Number]', '[Total]'],
          ],
        },
      },

      {
        heading: '5. Sign-Off',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Register Maintained By:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Compliance Manager:', '[Name]', '________________', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ── FRM-013: AI System Risk Assessment Form ──
  {
    outputPath: 'docs/compliance-templates/forms/FRM-013-AI-Risk-Assessment.docx',
    docNumber: 'FRM-013',
    title: 'AI System Risk Assessment Form',
    version: '1.0',
    owner: '[AI Governance Lead]',
    approvedBy: '[Chief Technology Officer]',
    isoRef: 'ISO/IEC 42001:2023',
    sections: [
      {
        heading: '1. AI System Identification',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Assessment Reference:', '[AIRA-YYYY-NNN]'],
            ['AI System Name:', '[System Name]'],
            ['Version / Release:', '[Version Number]'],
            ['System Owner:', '[Name / Department]'],
            ['Vendor (if third-party):', '[Vendor Name or In-House]'],
            ['Date of Assessment:', '[DD/MM/YYYY]'],
            ['Assessor(s):', '[Name(s) / Role(s)]'],
            [
              'Assessment Type:',
              '☐ Initial (Pre-Deployment)  ☐ Periodic Review  ☐ Post-Incident  ☐ Change-Triggered',
            ],
          ],
        },
      },

      {
        heading: '2. AI System Description',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            [
              'Use Case / Purpose:',
              '[Describe what the AI system does and the business problem it solves]',
            ],
            [
              'AI Technique(s):',
              '☐ Machine Learning  ☐ Deep Learning  ☐ NLP  ☐ Computer Vision  ☐ Generative AI  ☐ Rule-Based  ☐ Reinforcement Learning  ☐ Other: ________',
            ],
            ['Data Inputs:', '[Describe data sources, types, and volumes used by the system]'],
            [
              'Outputs / Decisions:',
              '[Describe what the system outputs — predictions, classifications, recommendations, decisions]',
            ],
            [
              'Affected Persons / Groups:',
              "[Who is impacted by the system's outputs — employees, customers, public, specific demographics]",
            ],
            ['Deployment Environment:', '☐ Cloud  ☐ On-Premise  ☐ Edge  ☐ Hybrid'],
            ['Integration Points:', '[Systems and processes the AI interacts with]'],
          ],
        },
      },

      {
        heading: '3. Risk Identification',
        content:
          'Assess each potential harm category. Mark as applicable and score likelihood and severity.',
      },
      {
        table: {
          headers: [
            '#',
            'Harm Category',
            'Applicable?',
            'Description of Potential Harm',
            'Likelihood (1-5)',
            'Severity (1-5)',
            'Risk Score (L×S)',
            'Risk Level',
          ],
          rows: [
            [
              '1',
              'Bias & Discrimination',
              '☐ Yes  ☐ No',
              '[e.g. Model may produce biased outcomes for protected groups]',
              '[1-5]',
              '[1-5]',
              '[L×S]',
              '[Low/Med/High/Crit]',
            ],
            [
              '2',
              'Privacy & Data Protection',
              '☐ Yes  ☐ No',
              '[e.g. PII exposure, re-identification risk, unlawful processing]',
              '[1-5]',
              '[1-5]',
              '[L×S]',
              '[Low/Med/High/Crit]',
            ],
            [
              '3',
              'Physical Safety',
              '☐ Yes  ☐ No',
              '[e.g. Incorrect recommendation leads to physical harm]',
              '[1-5]',
              '[1-5]',
              '[L×S]',
              '[Low/Med/High/Crit]',
            ],
            [
              '4',
              'Financial Harm',
              '☐ Yes  ☐ No',
              '[e.g. Incorrect credit decision, pricing error]',
              '[1-5]',
              '[1-5]',
              '[L×S]',
              '[Low/Med/High/Crit]',
            ],
            [
              '5',
              'Reputational Harm',
              '☐ Yes  ☐ No',
              '[e.g. AI generates offensive content, public backlash]',
              '[1-5]',
              '[1-5]',
              '[L×S]',
              '[Low/Med/High/Crit]',
            ],
            [
              '6',
              'Transparency & Explainability',
              '☐ Yes  ☐ No',
              '[e.g. Black-box decisions that cannot be explained to affected persons]',
              '[1-5]',
              '[1-5]',
              '[L×S]',
              '[Low/Med/High/Crit]',
            ],
            [
              '7',
              'Security & Adversarial Attacks',
              '☐ Yes  ☐ No',
              '[e.g. Model poisoning, adversarial inputs, prompt injection]',
              '[1-5]',
              '[1-5]',
              '[L×S]',
              '[Low/Med/High/Crit]',
            ],
            [
              '8',
              'Autonomy & Human Agency',
              '☐ Yes  ☐ No',
              '[e.g. System overrides human judgement, manipulation risk]',
              '[1-5]',
              '[1-5]',
              '[L×S]',
              '[Low/Med/High/Crit]',
            ],
            [
              '9',
              'Environmental Impact',
              '☐ Yes  ☐ No',
              '[e.g. High energy consumption, carbon footprint of training/inference]',
              '[1-5]',
              '[1-5]',
              '[L×S]',
              '[Low/Med/High/Crit]',
            ],
            [
              '10',
              'Other: ________________',
              '☐ Yes  ☐ No',
              B,
              '[1-5]',
              '[1-5]',
              '[L×S]',
              '[Low/Med/High/Crit]',
            ],
          ],
        },
      },

      {
        heading: '4. Controls & Mitigations',
        table: {
          headers: ['Risk #', 'Control / Mitigation Measure', 'Control Type', 'Status', 'Evidence'],
          rows: [
            [
              '[#]',
              '[Describe the control measure]',
              '☐ Preventive  ☐ Detective  ☐ Corrective',
              '☐ In Place  ☐ Planned  ☐ Not Started',
              '[Reference to evidence]',
            ],
            [
              B,
              B,
              '☐ Preventive  ☐ Detective  ☐ Corrective',
              '☐ In Place  ☐ Planned  ☐ Not Started',
              B,
            ],
            [
              B,
              B,
              '☐ Preventive  ☐ Detective  ☐ Corrective',
              '☐ In Place  ☐ Planned  ☐ Not Started',
              B,
            ],
            [
              B,
              B,
              '☐ Preventive  ☐ Detective  ☐ Corrective',
              '☐ In Place  ☐ Planned  ☐ Not Started',
              B,
            ],
            [
              B,
              B,
              '☐ Preventive  ☐ Detective  ☐ Corrective',
              '☐ In Place  ☐ Planned  ☐ Not Started',
              B,
            ],
          ],
        },
      },

      {
        heading: '5. Human Oversight Mechanism',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            [
              'Level of Autonomy:',
              '☐ Human-in-the-Loop (human approves every decision)  ☐ Human-on-the-Loop (human monitors, can intervene)  ☐ Human-out-of-the-Loop (fully autonomous)',
            ],
            [
              'Override Capability:',
              '☐ Yes — Human can override all AI decisions  ☐ Partial — Some decisions can be overridden  ☐ No',
            ],
            [
              'Escalation Process:',
              '[Describe how edge cases or uncertain outputs are escalated to humans]',
            ],
            ['Monitoring Dashboard:', '☐ Yes — Ref: [System/URL]  ☐ No  ☐ Planned'],
            [
              'Alert Thresholds:',
              '[Describe what triggers human review — confidence score, drift threshold, error rate]',
            ],
          ],
        },
      },

      {
        heading: '6. Review & Monitoring Schedule',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            [
              'Review Frequency:',
              '☐ Monthly  ☐ Quarterly  ☐ Semi-Annually  ☐ Annually  ☐ Triggered by change/incident',
            ],
            [
              'Performance Metrics Monitored:',
              '[e.g. Accuracy, F1-score, fairness metrics, drift indicators]',
            ],
            ['Data Quality Checks:', '[Frequency and method of data validation]'],
            ['Model Retraining Schedule:', '[e.g. Quarterly, or when drift exceeds threshold]'],
            ['Next Review Date:', '[DD/MM/YYYY]'],
          ],
        },
      },

      {
        heading: '7. Overall Risk Determination',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Overall Risk Level:', '☐ Low  ☐ Medium  ☐ High  ☐ Critical'],
            [
              'Acceptable for Deployment:',
              '☐ Yes  ☐ Yes with Conditions  ☐ No — Further mitigation required',
            ],
            [
              'Conditions (if applicable):',
              '[Detail any conditions that must be met before/during deployment]',
            ],
          ],
        },
      },

      {
        heading: '8. Approval Authority',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Assessor:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['AI Governance Lead:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Data Protection Officer:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Chief Technology Officer:', '[Name]', '________________', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ── FRM-014: Data Processing Activity Record (GDPR Article 30) ──
  {
    outputPath: 'docs/compliance-templates/forms/FRM-014-Data-Processing-Record.docx',
    docNumber: 'FRM-014',
    title: 'Data Processing Activity Record (GDPR Article 30)',
    version: '1.0',
    owner: '[Data Protection Officer]',
    approvedBy: '[Data Protection Officer]',
    isoRef: 'GDPR Article 30',
    sections: [
      {
        heading: '1. Organisation Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Organisation Name:', '[COMPANY NAME]'],
            ['Registration / Company Number:', '[Company Registration Number]'],
            ['Address:', '[Registered Address]'],
            ['Data Protection Officer:', '[Name / Contact Details]'],
            ['EU/UK Representative (if applicable):', '[Name / Contact Details or N/A]'],
            ['Record Reference:', '[ROPA-YYYY]'],
            ['Date of Last Update:', '[DD/MM/YYYY]'],
            ['Next Review Date:', '[DD/MM/YYYY]'],
          ],
        },
      },

      {
        heading: '2. Instructions',
        content:
          'This Record of Processing Activities (ROPA) is maintained pursuant to Article 30 of the UK/EU GDPR. It documents all processing activities involving personal data carried out by [COMPANY NAME] as a data controller and, where applicable, as a data processor.\n\nThis record must be kept up to date and made available to the supervisory authority (ICO) on request. It should be reviewed at least annually or when processing activities change.',
      },

      {
        heading: '3. Record of Processing Activities — Controller',
        table: {
          headers: [
            '#',
            'Processing Activity',
            'Controller / Joint Controller',
            'Purpose of Processing',
            'Lawful Basis (Art. 6)',
            'Categories of Personal Data',
            'Categories of Data Subjects',
            'Recipients / Categories of Recipients',
            'International Transfers (Country & Safeguards)',
            'Retention Period',
            'Technical & Organisational Security Measures',
          ],
          rows: [
            [
              '1',
              '[e.g. Employee payroll processing]',
              '[COMPANY NAME]',
              '[e.g. Payment of salaries and statutory deductions]',
              '☐ Consent  ☐ Contract  ☐ Legal Obligation  ☐ Vital Interest  ☐ Public Task  ☐ Legitimate Interest',
              '[e.g. Name, address, NI number, bank details, salary]',
              '[e.g. Employees, contractors]',
              '[e.g. HMRC, pension provider, payroll bureau]',
              '[e.g. None / US — Standard Contractual Clauses]',
              '[e.g. 6 years after employment ends]',
              '[e.g. Encrypted storage, role-based access, MFA]',
            ],
            [
              '2',
              '[e.g. Customer relationship management]',
              '[COMPANY NAME]',
              '[e.g. Managing customer accounts and communications]',
              '☐ Consent  ☐ Contract  ☐ Legal Obligation  ☐ Vital Interest  ☐ Public Task  ☐ Legitimate Interest',
              '[e.g. Name, email, phone, purchase history]',
              '[e.g. Customers, prospects]',
              '[e.g. CRM provider, email service]',
              B,
              B,
              B,
            ],
            [
              '3',
              '[e.g. CCTV monitoring]',
              '[COMPANY NAME]',
              '[e.g. Security of premises and personnel]',
              '☐ Consent  ☐ Contract  ☐ Legal Obligation  ☐ Vital Interest  ☐ Public Task  ☐ Legitimate Interest',
              '[e.g. Visual images]',
              '[e.g. Employees, visitors, contractors]',
              '[e.g. Security provider, police if required]',
              B,
              B,
              B,
            ],
            [
              '4',
              B,
              B,
              B,
              '☐ Consent  ☐ Contract  ☐ Legal Obligation  ☐ Vital Interest  ☐ Public Task  ☐ Legitimate Interest',
              B,
              B,
              B,
              B,
              B,
              B,
            ],
            [
              '5',
              B,
              B,
              B,
              '☐ Consent  ☐ Contract  ☐ Legal Obligation  ☐ Vital Interest  ☐ Public Task  ☐ Legitimate Interest',
              B,
              B,
              B,
              B,
              B,
              B,
            ],
            [
              '6',
              B,
              B,
              B,
              '☐ Consent  ☐ Contract  ☐ Legal Obligation  ☐ Vital Interest  ☐ Public Task  ☐ Legitimate Interest',
              B,
              B,
              B,
              B,
              B,
              B,
            ],
            [
              '7',
              B,
              B,
              B,
              '☐ Consent  ☐ Contract  ☐ Legal Obligation  ☐ Vital Interest  ☐ Public Task  ☐ Legitimate Interest',
              B,
              B,
              B,
              B,
              B,
              B,
            ],
            [
              '8',
              B,
              B,
              B,
              '☐ Consent  ☐ Contract  ☐ Legal Obligation  ☐ Vital Interest  ☐ Public Task  ☐ Legitimate Interest',
              B,
              B,
              B,
              B,
              B,
              B,
            ],
          ],
        },
      },

      {
        heading: '4. Special Category Data Processing',
        content:
          'Where special category data (Article 9) or criminal conviction data (Article 10) is processed, additional conditions must be documented:',
      },
      {
        table: {
          headers: [
            '#',
            'Processing Activity',
            'Special Category Data Type',
            'Article 9 Condition',
            'Additional Safeguards',
          ],
          rows: [
            [
              '1',
              '[e.g. Occupational health records]',
              '☐ Health  ☐ Racial/Ethnic  ☐ Political  ☐ Religious  ☐ Trade Union  ☐ Genetic  ☐ Biometric  ☐ Sexual Orientation  ☐ Criminal Convictions',
              '[e.g. Art 9(2)(b) — Employment obligations]',
              '[e.g. Restricted access, separate storage, encryption]',
            ],
            [
              '2',
              B,
              '☐ Health  ☐ Racial/Ethnic  ☐ Political  ☐ Religious  ☐ Trade Union  ☐ Genetic  ☐ Biometric  ☐ Sexual Orientation  ☐ Criminal Convictions',
              B,
              B,
            ],
            [
              '3',
              B,
              '☐ Health  ☐ Racial/Ethnic  ☐ Political  ☐ Religious  ☐ Trade Union  ☐ Genetic  ☐ Biometric  ☐ Sexual Orientation  ☐ Criminal Convictions',
              B,
              B,
            ],
          ],
        },
      },

      {
        heading: '5. Data Protection Impact Assessments (DPIA)',
        content:
          'The following processing activities have been identified as requiring a DPIA under Article 35:',
      },
      {
        table: {
          headers: [
            'Processing Activity',
            'DPIA Required?',
            'DPIA Reference',
            'Date Completed',
            'Outcome',
          ],
          rows: [
            [
              '[Activity]',
              '☐ Yes  ☐ No',
              '[DPIA-YYYY-NNN]',
              '[DD/MM/YYYY]',
              '☐ Proceed  ☐ Proceed with Mitigations  ☐ Consult ICO',
            ],
            [B, '☐ Yes  ☐ No', B, B, '☐ Proceed  ☐ Proceed with Mitigations  ☐ Consult ICO'],
            [B, '☐ Yes  ☐ No', B, B, '☐ Proceed  ☐ Proceed with Mitigations  ☐ Consult ICO'],
          ],
        },
      },

      {
        heading: '6. Sign-Off',
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Data Protection Officer:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Information Security Manager:', '[Name]', '________________', '[DD/MM/YYYY]'],
            ['Managing Director:', '[Name]', '________________', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
];

// Generate all forms
for (const form of forms) {
  const tmpFile = `/tmp/form-${form.docNumber}.json`;
  fs.writeFileSync(tmpFile, JSON.stringify(form, null, 2));
  try {
    execSync(`node /home/dyl/New-BMS/scripts/create-docx.mjs ${tmpFile}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to create ${form.docNumber}: ${err.message}`);
  }
  fs.unlinkSync(tmpFile);
}

console.log(`\nAll ${forms.length} forms created.`);
