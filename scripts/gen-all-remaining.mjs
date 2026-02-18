#!/usr/bin/env node
import fs from 'fs';
import { execSync } from 'child_process';

function gen(config) {
  const tmp = `/tmp/docgen-${config.docNumber}.json`;
  fs.writeFileSync(tmp, JSON.stringify(config));
  try {
    execSync(`node /home/dyl/New-BMS/scripts/create-docx.mjs ${tmp}`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`FAIL: ${config.docNumber}`);
  }
  fs.unlinkSync(tmp);
}

const docs = [
  // ── PROCEDURES ──
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-002-Internal-Audit.docx',
    docNumber: 'PRO-002',
    title: 'Internal Audit Procedure',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001/14001/45001 Clause 9.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the process for planning, conducting, reporting, and following up internal audits across the Integrated Management System of [COMPANY NAME]. Internal audits verify that the IMS conforms to planned arrangements, the requirements of ISO 9001, ISO 14001, ISO 45001, and other applicable standards, and is effectively implemented and maintained.',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure covers all internal audits of the IMS including system audits, process audits, product/service audits, and compliance audits. It applies to all departments, processes, and sites within the scope of the certified management system.',
      },
      {
        heading: '3. Audit Programme',
        content:
          'The [Quality Manager] shall establish an annual audit programme (PLN-001) that:\n\na) Covers all IMS processes and all ISO standard clauses over a 12-month cycle\nb) Considers the importance of processes, previous audit results, and areas of change\nc) Assigns competent lead auditors and audit team members\nd) Defines the scope, criteria, and method for each audit\ne) Is approved by top management and communicated to all relevant parties\nf) Is flexible to allow additional audits triggered by non-conformances, incidents, or significant changes',
      },
      {
        heading: '4. Auditor Competence',
        content:
          'Internal auditors shall:\n\n• Have completed an approved lead auditor or internal auditor training course\n• Have knowledge of the relevant ISO standards and IMS requirements\n• Be independent of the area being audited (auditors shall not audit their own work)\n• Demonstrate objectivity and impartiality\n• Maintain competence through continuing professional development\n\nA register of qualified auditors is maintained by the [Quality Manager].',
      },
      {
        heading: '5. Audit Execution',
        content:
          '5.1 Preparation:\n• Review previous audit reports, CAPAs, and relevant documented information\n• Prepare the audit checklist (FRM-004) tailored to the scope\n• Notify the auditee of the date, scope, and schedule at least 2 weeks in advance\n\n5.2 Opening Meeting:\n• Confirm scope, criteria, and schedule\n• Explain the audit process and finding classification\n• Agree logistics and escorts if required\n\n5.3 Evidence Gathering:\n• Interview personnel at all levels\n• Observe processes and activities\n• Review documents, records, and data\n• Use sampling methods appropriate to the scope\n\n5.4 Closing Meeting:\n• Present findings and observations\n• Agree factual accuracy of findings\n• Confirm timescales for corrective action responses',
      },
      {
        heading: '6. Finding Classification',
        content:
          'Findings are classified as:\n\n• Major Non-Conformity: Absence or total breakdown of a system to meet a requirement, or a situation that raises significant doubt about the ability to deliver conforming products/services. Requires immediate corrective action.\n\n• Minor Non-Conformity: A single observed lapse in meeting a requirement that does not represent a systemic failure. Requires corrective action within agreed timescale.\n\n• Observation (OFI — Opportunity for Improvement): A situation that is not a non-conformity but where improvement would strengthen the system.\n\n• Conformity: Evidence demonstrates the requirement is met.',
      },
      {
        heading: '7. Audit Reporting',
        content:
          'The lead auditor shall produce an audit report within 5 working days containing:\n\n• Audit reference number and date\n• Scope and criteria\n• Audit team members and auditees\n• Summary of findings by classification\n• Detailed finding descriptions with evidence references\n• Positive observations and good practice identified\n• Overall audit conclusion and recommendation\n\nReports are stored in the Nexara IMS audit management module.',
      },
      {
        heading: '8. Corrective Action Follow-Up',
        content:
          'For each non-conformity:\n\na) The auditee provides root cause analysis and corrective action plan within 10 working days (major) or 30 working days (minor)\nb) Actions are recorded in the Nexara IMS CAPA module\nc) The lead auditor verifies implementation and effectiveness\nd) Verification is recorded and the finding is closed\ne) Unresolved findings are escalated to the [Quality Manager] and reported at management review',
      },
      {
        heading: '9. Related Documents',
        bullets: [
          'PLN-001: Internal Audit Programme',
          'FRM-004: Internal Audit Checklist',
          'PRO-003: Corrective Action & CAPA Procedure',
          'RPT-001: Management Review Report Template',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-003-Corrective-Action-CAPA.docx',
    docNumber: 'PRO-003',
    title: 'Corrective Action & CAPA Procedure',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001:2015 Clause 10.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the process for identifying, investigating, resolving, and preventing recurrence of non-conformities through corrective actions and the CAPA (Corrective and Preventive Action) process at [COMPANY NAME].',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to non-conformities arising from any source including internal audits, external audits, customer complaints, supplier issues, incident investigations, management reviews, process monitoring, product/service failures, and employee observations.',
      },
      {
        heading: '3. CAPA Process Flow',
        content:
          'Step 1: IDENTIFICATION — Non-conformity detected and reported via Nexara IMS\nStep 2: CONTAINMENT — Immediate action to control the impact\nStep 3: INVESTIGATION — Root cause analysis using appropriate methods\nStep 4: CORRECTIVE ACTION — Define and implement permanent corrective actions\nStep 5: VERIFICATION — Confirm actions have been implemented correctly\nStep 6: EFFECTIVENESS REVIEW — Evaluate whether actions prevented recurrence\nStep 7: CLOSURE — Close the CAPA record and update risk register if needed',
      },
      {
        heading: '4. Root Cause Analysis Methods',
        content:
          "The following methods shall be used as appropriate to the complexity of the non-conformity:\n\n5-Why Analysis: Iterative questioning to drill down from the symptom to the root cause. Document each 'why' level on the CAPA form (FRM-005).\n\nFishbone (Ishikawa) Diagram: Analyse potential causes across 6 categories — People, Method, Machine, Material, Measurement, Environment.\n\n8D Problem Solving: For complex or customer-reported issues, use the full 8-discipline methodology from D0 (Emergency Response) through D8 (Team Recognition).\n\nThe method selected must be proportionate to the significance of the non-conformity.",
      },
      {
        heading: '5. Timescales',
        content:
          '• Containment action: Within 24 hours of detection (immediate risk issues) or 5 working days\n• Root cause analysis completion: 10 working days (major), 20 working days (minor)\n• Corrective action implementation: As defined in the action plan, maximum 90 days\n• Effectiveness review: 30, 60, or 90 days after implementation (based on severity)\n• Escalation: CAPAs overdue by more than 14 days are escalated to the [Quality Manager]',
      },
      {
        heading: '6. Effectiveness Criteria',
        content:
          'A corrective action is deemed effective when:\n\n• The original non-conformity has not recurred within the review period\n• Process performance data shows sustained improvement\n• Subsequent audits confirm the corrective action is embedded\n• No related non-conformities have been raised\n\nIf the effectiveness review fails, the CAPA is reopened with a requirement for further investigation.',
      },
      {
        heading: '7. Responsibilities',
        content:
          '[Initiator]: Raises the non-conformity and documents the initial details.\n[CAPA Owner]: Leads the investigation, implements corrective actions, and provides evidence of completion.\n[Quality Manager]: Oversees the CAPA process, reviews effectiveness, approves closure, reports trends.\n[Management]: Ensures resources are available, reviews CAPA trends at management review.',
      },
      {
        heading: '8. Related Documents',
        bullets: [
          'FRM-001: Non-Conformance Report (NCR) Form',
          'FRM-005: Corrective Action Form (CAPA)',
          'PRO-002: Internal Audit Procedure',
          'REG-001: Risk Register',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-004-Risk-Opportunity-Management.docx',
    docNumber: 'PRO-004',
    title: 'Risk & Opportunity Management Procedure',
    owner: '[Risk Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001:2015 Clause 6.1',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure establishes the methodology for identifying, assessing, treating, monitoring, and reviewing risks and opportunities across all processes of the [COMPANY NAME] Integrated Management System. It ensures a consistent, risk-based approach to decision-making aligned with ISO 9001, ISO 14001, ISO 45001, and ISO 27001.',
      },
      {
        heading: '2. Risk Assessment Methodology',
        content:
          'Risks are assessed using a 5×5 likelihood and severity matrix:\n\nLikelihood Scale:\n1 — Rare: May occur only in exceptional circumstances\n2 — Unlikely: Could occur at some time but not expected\n3 — Possible: Might occur at some time\n4 — Likely: Will probably occur in most circumstances\n5 — Almost Certain: Expected to occur in most circumstances\n\nSeverity Scale:\n1 — Negligible: Minor impact, easily absorbed\n2 — Minor: Some disruption, managed within normal operations\n3 — Moderate: Significant disruption requiring management attention\n4 — Major: Serious impact on operations, reputation, or compliance\n5 — Catastrophic: Severe impact threatening business continuity',
      },
      {
        heading: '3. Risk Scoring',
        table: {
          headers: ['Risk Score', 'Risk Level', 'Action Required'],
          rows: [
            ['1-4', 'Low (Green)', 'Accept — monitor during routine reviews'],
            ['5-9', 'Medium (Yellow)', 'Reduce — implement additional controls within 90 days'],
            [
              '10-15',
              'High (Orange)',
              'Urgent — implement controls within 30 days, escalate to management',
            ],
            [
              '16-25',
              'Critical (Red)',
              'Immediate — stop activity if safe, implement emergency controls, board notification',
            ],
          ],
        },
      },
      {
        heading: '4. Risk Treatment Options',
        content:
          'For each risk above the acceptable threshold, one or more treatment options shall be selected:\n\n• AVOID: Eliminate the activity or source of risk\n• REDUCE: Implement controls to reduce likelihood and/or severity\n• TRANSFER: Share the risk through insurance, contracts, or outsourcing\n• ACCEPT: Consciously accept the residual risk with monitoring\n\nThe selected treatment must be proportionate to the risk level and cost-effective.',
      },
      {
        heading: '5. Opportunity Management',
        content:
          'Opportunities are identified during risk assessment and may include:\n\n• New markets, products, or services\n• Process efficiency improvements\n• Technology adoption\n• Partnership opportunities\n• Regulatory incentives\n\nOpportunities are documented in the Risk Register alongside risks, with actions and owners assigned.',
      },
      {
        heading: '6. Monitoring & Review',
        content:
          '• Risk registers are reviewed quarterly by risk owners\n• The overall risk profile is reviewed at each management review\n• Risk assessments are updated when triggered by incidents, audits, changes, or new information\n• Key risk indicators (KRIs) are monitored through the Nexara IMS dashboard',
      },
      {
        heading: '7. Related Documents',
        bullets: [
          'REG-001: Risk Register',
          'FRM-002: Hazard Identification & Risk Assessment Form',
          'PRO-003: Corrective Action & CAPA Procedure',
          'RPT-001: Management Review Report Template',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-005-HIRA-Procedure.docx',
    docNumber: 'PRO-005',
    title: 'Hazard Identification & Risk Assessment Procedure',
    owner: '[H&S Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 45001:2018 Clause 6.1.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the methodology for identifying hazards and assessing occupational health and safety risks across all activities, processes, and workplaces of [COMPANY NAME], ensuring effective controls are implemented using the hierarchy of controls.',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all routine and non-routine activities, all persons with access to the workplace (employees, contractors, visitors, delivery personnel), all workplaces (including remote working), and all equipment, materials, and substances used.',
      },
      {
        heading: '3. Hazard Identification',
        content:
          'Hazards shall be identified by considering:\n\n• How work is organised, social factors, leadership, and culture\n• Routine and non-routine activities and situations\n• Past incidents, near-misses, and ill health (internal and industry)\n• Potential emergency situations\n• People (behaviour, competence, human factors)\n• Changes in processes, operations, knowledge, or working conditions\n• Design of work areas, processes, installations, machinery\n• Substances (COSHH), physical agents (noise, vibration, radiation), biological agents\n\nMethods include workplace inspections, task analysis, worker consultation, incident data review, and job safety analysis.',
      },
      {
        heading: '4. Hierarchy of Controls',
        content:
          'Controls shall be applied in the following order of preference:\n\n1. ELIMINATION: Remove the hazard completely\n2. SUBSTITUTION: Replace with a less hazardous alternative\n3. ENGINEERING CONTROLS: Isolate people from the hazard (guards, ventilation, barriers)\n4. ADMINISTRATIVE CONTROLS: Change the way people work (procedures, training, signage, rotation)\n5. PERSONAL PROTECTIVE EQUIPMENT: Last resort — provide appropriate PPE\n\nHigher-level controls are always preferred. PPE is only acceptable when higher controls are not reasonably practicable.',
      },
      {
        heading: '5. Worker Consultation',
        content:
          'Workers and their representatives shall be consulted during:\n\n• Identification of hazards and assessment of risks\n• Determination of controls\n• Review of risk assessments following incidents or changes\n• Development of safe working procedures\n\nConsultation is documented and feedback is incorporated into the assessment.',
      },
      {
        heading: '6. Review Triggers',
        content:
          'Risk assessments must be reviewed when:\n\n• An incident, near-miss, or ill health occurs related to the activity\n• New equipment, materials, or processes are introduced\n• Changes in legislation or best practice\n• Worker feedback identifies new hazards\n• Routine review period expires (minimum annually)\n• Following findings from workplace inspections or audits',
      },
      {
        heading: '7. Related Documents',
        bullets: [
          'FRM-002: Hazard Identification & Risk Assessment Form',
          'FRM-006: Permit to Work Form',
          'PRO-007: Incident Investigation & Reporting Procedure',
          'REG-001: Risk Register',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-006-Environmental-Aspects-Impacts.docx',
    docNumber: 'PRO-006',
    title: 'Environmental Aspects & Impacts Procedure',
    owner: '[Environmental Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 14001:2015 Clause 6.1.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the methodology for identifying environmental aspects and evaluating their significance to determine those that require management action within the [COMPANY NAME] Environmental Management System.',
      },
      {
        heading: '2. Scope',
        content:
          'This procedure applies to all activities, products, and services of [COMPANY NAME] that can interact with the environment, including normal operations, abnormal conditions, and emergency situations. It considers a lifecycle perspective from raw material acquisition through end-of-life.',
      },
      {
        heading: '3. Aspect Identification',
        content:
          'Environmental aspects are identified by examining each activity, product, and service for:\n\n• Emissions to air (greenhouse gases, VOCs, dust, odour)\n• Discharges to water (effluent, run-off, contamination)\n• Releases to land (spills, contamination, subsidence)\n• Use of raw materials and natural resources\n• Energy use and consumption\n• Waste generation (hazardous and non-hazardous)\n• Noise, vibration, visual impact\n• Impacts on biodiversity and ecosystems\n• Transportation-related impacts',
      },
      {
        heading: '4. Significance Criteria',
        content:
          'Each aspect is scored using the significance formula:\n\nSignificance Score = (Severity × 1.5) + (Probability × 1.5) + Duration + Extent + Reversibility + Regulatory + Stakeholder\n\nScore ≥ 15: SIGNIFICANT — requires operational controls, objectives, and monitoring\nScore 10-14: MODERATE — requires operational controls and monitoring\nScore < 10: LOW — managed through general environmental awareness\n\nSignificant aspects are prioritised for objective-setting and operational control.',
      },
      {
        heading: '5. Compliance Obligations',
        content:
          'For each significant aspect, the associated compliance obligations are identified and recorded in the Legal & Regulatory Register (FRM-011). These include environmental permits, discharge consents, waste carrier licences, and reporting obligations.',
      },
      {
        heading: '6. Related Documents',
        bullets: [
          'FRM-010: Environmental Aspects & Impacts Register',
          'FRM-011: Legal & Regulatory Register',
          'POL-002: Environmental Policy',
          'PRO-011: Emergency Preparedness & Response Procedure',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-007-Incident-Investigation.docx',
    docNumber: 'PRO-007',
    title: 'Incident Investigation & Reporting Procedure',
    owner: '[H&S Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 45001:2018 Clause 10.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the process for reporting, investigating, and learning from all workplace incidents, near-misses, dangerous occurrences, and occupational ill health at [COMPANY NAME].',
      },
      {
        heading: '2. Incident Categories',
        content:
          'Incidents are categorised as:\n\n• Near Miss: An unplanned event that did not result in injury or damage but had the potential to do so\n• First Aid Case: Injury requiring first aid treatment only\n• Medical Treatment Case: Injury requiring treatment by a medical professional\n• Lost Time Injury (LTI): Injury resulting in one or more days absence from work\n• Major Injury: Specified injuries under RIDDOR (fractures, amputations, loss of consciousness)\n• Dangerous Occurrence: Specified near-misses under RIDDOR (collapse of scaffolding, explosion, electrical incident)\n• Occupational Ill Health: Work-related disease or condition\n• Fatality: Death of any person as a result of a work-related incident\n• Environmental Incident: Spill, release, or emission affecting the environment',
      },
      {
        heading: '3. Immediate Response',
        content:
          'a) Ensure the safety of all persons — provide first aid, evacuate if necessary\nb) Secure the scene — prevent further injury or damage, preserve evidence\nc) Notify emergency services if required (999/112)\nd) Notify the [H&S Manager] and line manager immediately\ne) Complete an initial incident report (FRM-003) within 24 hours\nf) Assess whether the incident is RIDDOR-reportable',
      },
      {
        heading: '4. RIDDOR Reporting',
        content:
          'The following must be reported to the Health and Safety Executive (HSE) under RIDDOR:\n\n• Deaths: Immediately by phone (0345 300 9923), followed by written report within 10 days\n• Specified injuries: Written report within 10 days\n• Over-7-day incapacitation: Written report within 15 days\n• Dangerous occurrences: Written report within 10 days\n• Occupational diseases: Written report on diagnosis\n\nThe [H&S Manager] is responsible for submitting RIDDOR reports via the HSE website.',
      },
      {
        heading: '5. Investigation Process',
        content:
          'Investigation depth is proportionate to severity:\n\n• Near miss/First aid: Line manager investigation, 5-Why analysis\n• Medical/LTI: [H&S Manager]-led investigation, full root cause analysis\n• Major/Dangerous/Fatality: Senior management-led investigation team, external investigation support if needed\n\nInvestigation includes: witness statements, scene examination, CCTV review, equipment inspection, document review, timeline reconstruction, root cause analysis, and contributory factor identification.',
      },
      {
        heading: '6. Learning & Communication',
        content:
          'Investigation findings are:\n\n• Shared through safety alerts and toolbox talks\n• Used to update risk assessments\n• Fed into CAPA process for systemic corrective actions\n• Reported at management review meetings\n• Included in safety performance statistics and trend analysis',
      },
      {
        heading: '7. Related Documents',
        bullets: [
          'FRM-003: Incident Report Form',
          'FRM-005: Corrective Action Form (CAPA)',
          'PRO-005: Hazard Identification & Risk Assessment Procedure',
          'POL-003: Health & Safety Policy',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-008-Management-Review.docx',
    docNumber: 'PRO-008',
    title: 'Management Review Procedure',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001:2015 Clause 9.3',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the process for conducting management reviews of the [COMPANY NAME] Integrated Management System to ensure its continuing suitability, adequacy, effectiveness, and alignment with the strategic direction of the organisation.',
      },
      {
        heading: '2. Frequency',
        content:
          'Management reviews shall be conducted at least twice per year (typically [January/February] and [July/August]). Additional reviews may be called following significant incidents, major audit findings, or significant changes in the business context.',
      },
      {
        heading: '3. Mandatory Inputs (ISO 9001 Clause 9.3.2)',
        content:
          'The following inputs shall be prepared and distributed to attendees at least 5 working days before the review:\n\na) Status of actions from previous management reviews\nb) Changes in external and internal issues relevant to the IMS\nc) Information on IMS performance and effectiveness including trends in:\n   i) Customer satisfaction and feedback\n   ii) Extent to which quality/environmental/H&S objectives have been met\n   iii) Process performance and product/service conformity\n   iv) Non-conformities and corrective actions\n   v) Monitoring and measurement results\n   vi) Audit results (internal and external)\n   vii) Performance of external providers (suppliers)\nd) Adequacy of resources\ne) Effectiveness of actions taken to address risks and opportunities\nf) Opportunities for improvement',
      },
      {
        heading: '4. Mandatory Outputs',
        content:
          'Management review outputs shall include decisions and actions related to:\n\na) Opportunities for improvement\nb) Any need for changes to the IMS (including policies and objectives)\nc) Resource needs\n\nAll decisions and actions are recorded in the meeting minutes (FRM-009) with assigned owners, target dates, and follow-up mechanisms.',
      },
      {
        heading: '5. Attendees',
        content:
          'Required attendees:\n• [Managing Director / CEO]\n• [Quality Manager]\n• [H&S Manager]\n• [Environmental Manager]\n• [Department Managers/Heads]\n\nOptional attendees as needed:\n• [IT Manager / CISO]\n• [HR Manager]\n• [Finance Director]\n• External consultants or auditors',
      },
      {
        heading: '6. Related Documents',
        bullets: [
          'FRM-009: Management Review Meeting Minutes Template',
          'RPT-001: Management Review Report Template',
          'RPT-002: Compliance Performance Dashboard',
          'PLN-001: Internal Audit Programme',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-009-Supplier-Evaluation.docx',
    docNumber: 'PRO-009',
    title: 'Supplier & Contractor Evaluation Procedure',
    owner: '[Procurement Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 8.4',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the process for evaluating, approving, monitoring, and re-evaluating suppliers and contractors to ensure externally provided processes, products, and services conform to requirements.',
      },
      {
        heading: '2. Initial Evaluation',
        content:
          'Before a new supplier is approved, the following assessment is conducted using FRM-007:\n\n• Quality Management System certification (ISO 9001 or equivalent)\n• Technical capability and capacity\n• Financial stability assessment\n• Delivery performance capability\n• Health & Safety management (for on-site contractors)\n• Environmental management credentials\n• References from other customers\n• Site audit (for critical suppliers)\n\nSuppliers must score a minimum of [60]% overall to be approved. Scores below [40]% result in rejection.',
      },
      {
        heading: '3. Approved Supplier List',
        content:
          'Approved suppliers are recorded in REG-004. The register includes supplier details, category, approval date, certification status, performance score, and review date. Only suppliers on the approved list may be used for procurement.',
      },
      {
        heading: '4. Ongoing Monitoring',
        content:
          'Supplier performance is monitored continuously through:\n\n• Delivery on-time percentage\n• Quality rejection/return rate\n• Response to corrective action requests\n• Pricing competitiveness\n• Communication and service quality\n\nPerformance data is reviewed quarterly and a formal supplier performance review (RPT-004) is conducted annually.',
      },
      {
        heading: '5. Re-evaluation & Actions',
        content:
          'Based on annual review scores:\n\n• ≥80%: Approved — continue, consider for preferred status\n• 60-79%: Conditionally Approved — improvement plan required\n• 40-59%: Probation — restricted use, intensive monitoring, corrective actions required\n• <40%: Suspended/Removed — alternative supplier sourced\n\nThe [Procurement Manager] communicates the outcome to the supplier and records it in REG-004.',
      },
      {
        heading: '6. Related Documents',
        bullets: [
          'FRM-007: Supplier Evaluation Form',
          'REG-004: Approved Supplier Register',
          'RPT-004: Supplier Performance Review Report',
          'PRO-003: Corrective Action & CAPA Procedure',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-010-Training-Competence.docx',
    docNumber: 'PRO-010',
    title: 'Training & Competence Procedure',
    owner: '[HR Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001/45001 Clause 7.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure ensures that all persons performing work under the control of [COMPANY NAME] are competent on the basis of appropriate education, training, or experience, and that training needs are identified and addressed systematically.',
      },
      {
        heading: '2. Competence Requirements',
        content:
          'Competence requirements are determined for each role based on:\n\n• Job descriptions and role profiles\n• ISO standard requirements\n• Legal and regulatory requirements (e.g., COSHH, first aid, working at height)\n• Operational requirements and process criticality\n• Risk assessment outcomes\n• Customer and contractual requirements',
      },
      {
        heading: '3. Training Needs Analysis',
        content:
          'Training needs are identified through:\n\n• Annual training needs review\n• New employee induction requirements\n• Changes in roles, processes, or equipment\n• Audit findings and non-conformances\n• Incident investigations\n• Legislation changes\n• Performance appraisals\n• Management review actions\n\nA Training Matrix (REG-006) maps training requirements to roles and tracks completion status.',
      },
      {
        heading: '4. Induction',
        content:
          'All new starters receive induction training covering:\n\n• Company overview, structure, and IMS policies\n• Health & Safety awareness and emergency procedures\n• Environmental awareness and waste management\n• Information security and data protection awareness\n• Quality awareness and customer focus\n• Role-specific training and procedures\n• Use of Nexara IMS system\n\nInduction is completed and signed off within the first [2 weeks / month] of employment.',
      },
      {
        heading: '5. Training Delivery & Records',
        content:
          'Training may be delivered through:\n\n• Classroom/instructor-led sessions\n• E-learning modules\n• On-the-job training and mentoring\n• External courses and qualifications\n• Toolbox talks and briefings\n\nAll training is recorded using FRM-008 and tracked in the Nexara IMS Training module.',
      },
      {
        heading: '6. Effectiveness Evaluation',
        content:
          'Training effectiveness is evaluated at 30, 60, and 90 days post-training through:\n\n• Assessment tests (for knowledge-based training)\n• Observed competence in the workplace\n• Performance monitoring and KPIs\n• Manager feedback and sign-off\n\nIf training is deemed ineffective, further training or alternative methods are arranged.',
      },
      {
        heading: '7. Related Documents',
        bullets: [
          'FRM-008: Training Record & Effectiveness Evaluation',
          'REG-006: Training Matrix',
          'PRO-005: Hazard Identification & Risk Assessment Procedure',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-011-Emergency-Preparedness.docx',
    docNumber: 'PRO-011',
    title: 'Emergency Preparedness & Response Procedure',
    owner: '[H&S Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 14001/45001 Clause 8.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure ensures that [COMPANY NAME] is prepared to respond effectively to emergency situations, minimise harm to people, property, and the environment, and recover operations as quickly as possible.',
      },
      {
        heading: '2. Emergency Scenarios',
        content:
          'The following potential emergency scenarios have been identified:\n\n• Fire and explosion\n• Chemical/hazardous substance spill or release\n• Gas leak\n• Medical emergency (serious injury, cardiac event)\n• Flooding or severe weather\n• Structural collapse\n• Power failure / utilities disruption\n• Bomb threat or security incident\n• Cyber attack (major IT systems failure)\n• Pandemic or health emergency\n\nSpecific response plans exist for each scenario in PLN-003: Emergency Response Plan.',
      },
      {
        heading: '3. Emergency Equipment',
        content:
          'Emergency equipment is maintained and inspected regularly:\n\n• Fire extinguishers: Monthly visual check, annual service\n• First aid kits: Monthly stock check\n• Spill kits: Monthly inspection\n• Emergency lighting: Monthly test\n• Fire alarm system: Weekly test, quarterly/annual service\n• Emergency showers/eyewash: Weekly test\n• Evacuation chairs: Annual inspection\n• Defibrillators: Monthly check',
      },
      {
        heading: '4. Drills & Exercises',
        content:
          'Emergency drills are conducted at the following frequency:\n\n• Fire evacuation drill: At least twice per year\n• Chemical spill response: Annually\n• First aid scenario: Annually\n• Business continuity tabletop exercise: Annually\n• Full emergency exercise: Every 2 years\n\nDrill results are recorded, debrief sessions held, and improvement actions tracked through the CAPA process.',
      },
      {
        heading: '5. Post-Emergency Review',
        content:
          'Following any actual emergency or drill, a post-emergency review shall be conducted to:\n\n• Assess the effectiveness of the response\n• Identify areas for improvement\n• Update emergency plans and procedures\n• Communicate lessons learned\n• Revise risk assessments as necessary',
      },
      {
        heading: '6. Related Documents',
        bullets: [
          'PLN-003: Emergency Response Plan',
          'PLN-002: Business Continuity Plan',
          'POL-003: Health & Safety Policy',
          'FRM-003: Incident Report Form',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-012-Permit-to-Work.docx',
    docNumber: 'PRO-012',
    title: 'Permit to Work Procedure',
    owner: '[H&S Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 45001:2018 / H&S Best Practice',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure controls high-risk work activities through a formal permit to work (PTW) system at [COMPANY NAME], ensuring that hazards are identified, precautions are taken, and work is authorised before commencement.',
      },
      {
        heading: '2. PTW Categories',
        content:
          'A permit to work is required for the following activities:\n\n• Hot Work: Welding, cutting, grinding, brazing, or any work producing sparks, flames, or heat\n• Confined Space Entry: Work in any enclosed or partially enclosed space with limited access/egress\n• Working at Height: Work at or above 2 metres, or at any height where a fall could cause injury\n• Electrical Work: Work on or near live electrical systems or equipment\n• Excavation: Any ground-breaking, trenching, or digging activities\n• Lifting Operations: Use of cranes, hoists, or lifting equipment for non-routine lifts\n• Work Near Water: Activities adjacent to or over water\n• Asbestos-Related Work: Any disturbance of asbestos-containing materials\n• Breaking Into Plant/Pipework: Opening systems that may contain hazardous substances',
      },
      {
        heading: '3. Roles & Responsibilities',
        content:
          'Permit Issuer (Authorised Person): Senior person trained and authorised to assess hazards and issue permits. Maintains the permit log.\n\nPermit Receiver (Responsible Person): Person in charge of the work who accepts the permit conditions and ensures all precautions are maintained.\n\nWorkers: Follow all permit conditions, report any changes or concerns, stop work if conditions change.',
      },
      {
        heading: '4. Permit Process',
        content:
          'a) Permit Receiver completes FRM-006 with work description, location, hazards, and proposed precautions\nb) Permit Issuer reviews the assessment, conducts site inspection, and verifies precautions\nc) Both sign the permit — work may commence\nd) Permit is displayed at the work location\ne) Permit validity is limited (typically 8-12 hours maximum)\nf) On completion, the Permit Receiver confirms the area is safe and returns the permit\ng) Permit Issuer inspects and signs off completion\nh) Completed permits are retained for [3 years]',
      },
      {
        heading: '5. Simultaneous Operations',
        content:
          'Where multiple permits are active in the same area, the Permit Issuer must assess the interaction between activities and ensure that combined hazards are controlled. A simultaneous operations assessment is documented.',
      },
      {
        heading: '6. Related Documents',
        bullets: [
          'FRM-006: Permit to Work Form',
          'PRO-005: HIRA Procedure',
          'PRO-007: Incident Investigation Procedure',
          'Safe Working Procedures (SWP series)',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-013-Change-Management.docx',
    docNumber: 'PRO-013',
    title: 'Change Management Procedure',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001:2015 Clause 6.3',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure ensures that all planned changes to the [COMPANY NAME] Integrated Management System, processes, products, services, facilities, equipment, or organisational structure are assessed for impact, approved, implemented in a controlled manner, and reviewed for effectiveness.',
      },
      {
        heading: '2. Types of Change',
        content:
          'This procedure covers:\n\n• Process changes: Modifications to operational processes or workflows\n• Product/Service changes: Design or specification changes\n• System changes: IMS documentation, policy, or procedure changes\n• Personnel changes: Key role changes, restructuring\n• Facility changes: Relocation, expansion, refurbishment\n• Equipment changes: New equipment, modifications, decommissioning\n• Supplier changes: New or changed critical suppliers\n• IT/Technology changes: System changes, software updates, infrastructure\n• Regulatory changes: New or amended legislation/standards',
      },
      {
        heading: '3. Change Request Process',
        content:
          'a) Change Initiator completes a Change Request detailing the proposed change, rationale, and expected benefits\nb) Impact Assessment is conducted covering: quality, H&S, environmental, information security, regulatory, customer, financial, and resource impacts\nc) Approval is obtained from the appropriate authority based on impact level:\n   - Low impact: Department Manager\n   - Medium impact: [Quality Manager] + relevant function head\n   - High impact: [Managing Director] / Senior Management Team\nd) Implementation Plan is developed with milestones, responsibilities, and communication\ne) Change is implemented according to plan\nf) Post-Change Review assesses effectiveness and identifies any unintended consequences',
      },
      {
        heading: '4. Emergency Changes',
        content:
          'In urgent situations, changes may be implemented before full assessment, subject to:\n\n• Verbal approval from [Managing Director] or designated deputy\n• Retrospective documentation within 5 working days\n• Full impact assessment and review completed post-implementation\n• Higher scrutiny during post-change review',
      },
      {
        heading: '5. Related Documents',
        bullets: [
          'PRO-004: Risk & Opportunity Management Procedure',
          'PRO-001: Document & Records Control Procedure',
          'Nexara IMS Change Management Module',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-014-InfoSec-Incident-Response.docx',
    docNumber: 'PRO-014',
    title: 'Information Security Incident Response Procedure',
    owner: '[CISO / IT Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 27001:2022 Clause 5.24-5.28',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the process for detecting, reporting, assessing, responding to, and learning from information security incidents at [COMPANY NAME], including personal data breaches requiring notification under UK GDPR.',
      },
      {
        heading: '2. Incident Categories',
        content:
          'Information security incidents are categorised by severity:\n\n• P1 Critical: Active data breach, ransomware, complete system compromise — requires immediate response, crisis team activation\n• P2 High: Targeted attack detected, significant vulnerability exploited, partial data exposure — response within 1 hour\n• P3 Medium: Phishing success (no data loss), malware contained, policy violation — response within 4 hours\n• P4 Low: Failed attack attempt, policy awareness issue, minor vulnerability — response within 24 hours',
      },
      {
        heading: '3. Response Phases',
        content:
          'Phase 1 — DETECTION & REPORTING: Incident detected through monitoring, user report, or third-party notification. Reported immediately to [CISO/IT Manager] via Nexara IMS incident module.\n\nPhase 2 — ASSESSMENT & TRIAGE: Severity classification, scope determination, initial impact assessment, decision on crisis team activation.\n\nPhase 3 — CONTAINMENT: Short-term containment (isolate affected systems, block accounts). Long-term containment (apply patches, harden configurations).\n\nPhase 4 — ERADICATION: Remove the root cause (malware, compromised accounts, vulnerabilities).\n\nPhase 5 — RECOVERY: Restore systems from clean backups, verify integrity, monitor for re-infection.\n\nPhase 6 — POST-INCIDENT REVIEW: Lessons learned, timeline reconstruction, root cause analysis, procedure updates, awareness communication.',
      },
      {
        heading: '4. GDPR Breach Notification',
        content:
          "For personal data breaches:\n\n• ICO Notification: Within 72 hours of becoming aware, unless the breach is unlikely to result in a risk to individuals. Report via the ICO website.\n• Data Subject Notification: Without undue delay where the breach is likely to result in a high risk to individuals' rights and freedoms.\n• Internal Record: All breaches are recorded in the Nexara IMS breach register regardless of whether external notification is required.\n\nThe [DPO] must be informed immediately of any suspected personal data breach.",
      },
      {
        heading: '5. Crisis Team',
        content:
          'For P1/P2 incidents, the Crisis Team is activated:\n\n• [CISO / IT Manager] — Incident Commander\n• [Managing Director] — Strategic decisions\n• [DPO] — Data protection assessment\n• [IT Team Lead] — Technical response\n• [Communications Manager] — External communications\n• [Legal Advisor] — Regulatory and legal guidance',
      },
      {
        heading: '6. Related Documents',
        bullets: [
          'POL-004: Information Security Policy',
          'POL-007: Data Protection & Privacy Policy',
          'PLN-002: Business Continuity Plan',
          'RPT-005: Information Security Risk Assessment Report',
        ],
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-015-Business-Continuity.docx',
    docNumber: 'PRO-015',
    title: 'Business Continuity & Disaster Recovery Procedure',
    owner: '[Business Continuity Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22301 / Business Continuity Best Practice',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure establishes the framework for ensuring [COMPANY NAME] can continue to deliver critical products and services during and after a disruptive incident, and can recover full operations within acceptable timeframes.',
      },
      {
        heading: '2. Business Impact Analysis',
        content:
          'A Business Impact Analysis (BIA) is conducted annually to identify:\n\n• Critical business functions and their dependencies\n• Maximum Tolerable Period of Disruption (MTPD) for each function\n• Recovery Time Objective (RTO): Target time to restore function\n• Recovery Point Objective (RPO): Maximum acceptable data loss\n• Minimum Business Continuity Objective (MBCO): Minimum service level\n• Resource requirements for recovery (people, technology, facilities, suppliers)',
      },
      {
        heading: '3. Recovery Strategies',
        content:
          'Recovery strategies are defined for each critical function based on RTO:\n\n• IT Systems: Cloud-based disaster recovery, backup restoration, failover to secondary site\n• Premises: Alternative workplace arrangements, remote working activation\n• People: Cross-training, succession planning, temporary staff agencies\n• Supply Chain: Alternative suppliers identified, safety stock maintained\n• Communications: Backup communication channels, cloud-based telephony',
      },
      {
        heading: '4. Plan Activation',
        content:
          'The Business Continuity Plan (PLN-002) is activated when:\n\n• A disruptive incident occurs or is imminent that exceeds normal operational response\n• The [Managing Director] or designated deputy authorises activation\n• Assessment confirms that critical functions are or will be affected\n\nActivation triggers include: major IT failure, premises loss, pandemic, supply chain failure, significant cyber attack, natural disaster.',
      },
      {
        heading: '5. Testing & Exercising',
        content:
          'The business continuity arrangements are tested through:\n\n• Desktop/tabletop exercises: Annually\n• Component testing (IT recovery, backup restoration): Quarterly\n• Full simulation exercise: Every 2 years\n• Communication cascade test: Bi-annually\n\nTest results are documented, lessons learned identified, and plans updated accordingly.',
      },
      {
        heading: '6. Related Documents',
        bullets: [
          'PLN-002: Business Continuity Plan',
          'PLN-003: Emergency Response Plan',
          'PRO-014: Information Security Incident Response Procedure',
          'POL-004: Information Security Policy',
        ],
      },
    ],
  },
  // ── REGISTERS ──
  {
    outputPath: 'docs/compliance-templates/registers/REG-001-Risk-Register.docx',
    docNumber: 'REG-001',
    title: 'Risk Register',
    owner: '[Risk Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 6.1',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This Risk Register records all identified risks and opportunities across the [COMPANY NAME] Integrated Management System, their assessment scores, treatment plans, and current status.',
      },
      {
        heading: '2. Risk Matrix Key',
        table: {
          headers: [
            '',
            'Severity 1 Negligible',
            'Severity 2 Minor',
            'Severity 3 Moderate',
            'Severity 4 Major',
            'Severity 5 Catastrophic',
          ],
          rows: [
            [
              'Likelihood 5 Almost Certain',
              '5 Med',
              '10 High',
              '15 High',
              '20 Critical',
              '25 Critical',
            ],
            ['Likelihood 4 Likely', '4 Low', '8 Med', '12 High', '16 Critical', '20 Critical'],
            ['Likelihood 3 Possible', '3 Low', '6 Med', '9 Med', '12 High', '15 High'],
            ['Likelihood 2 Unlikely', '2 Low', '4 Low', '6 Med', '8 Med', '10 High'],
            ['Likelihood 1 Rare', '1 Low', '2 Low', '3 Low', '4 Low', '5 Med'],
          ],
        },
      },
      {
        heading: '3. Risk Register',
        table: {
          headers: [
            'Risk ID',
            'Category',
            'Description',
            'L',
            'S',
            'Score',
            'Level',
            'Controls',
            'Res L',
            'Res S',
            'Res Score',
            'Owner',
            'Review Date',
            'Status',
          ],
          rows: [
            [
              'RSK-001',
              'H&S',
              'Slip/trip/fall in warehouse',
              '3',
              '3',
              '9',
              'Med',
              'Anti-slip flooring, housekeeping, signage',
              '2',
              '3',
              '6',
              '[H&S Mgr]',
              '[date]',
              'Active',
            ],
            [
              'RSK-002',
              'InfoSec',
              'Ransomware attack',
              '3',
              '5',
              '15',
              'High',
              'Endpoint protection, backups, training',
              '2',
              '5',
              '10',
              '[IT Mgr]',
              '[date]',
              'Active',
            ],
            [
              'RSK-003',
              'Quality',
              'Supplier delivering non-conforming materials',
              '3',
              '4',
              '12',
              'High',
              'Incoming inspection, approved supplier audit',
              '2',
              '4',
              '8',
              '[QA Mgr]',
              '[date]',
              'Active',
            ],
            [
              'RSK-004',
              'Regulatory',
              'Failure to comply with new CSRD requirements',
              '2',
              '4',
              '8',
              'Med',
              'Legal register review, ESG monitoring',
              '1',
              '4',
              '4',
              '[ESG Lead]',
              '[date]',
              'Active',
            ],
            [
              'RSK-005',
              'Financial',
              'Major customer insolvency',
              '2',
              '5',
              '10',
              'High',
              'Credit checks, diversification strategy',
              '1',
              '5',
              '5',
              '[Finance Dir]',
              '[date]',
              'Active',
            ],
            [
              'RSK-006',
              'Environmental',
              'Chemical spill to watercourse',
              '2',
              '5',
              '10',
              'High',
              'Bunding, spill kits, emergency procedure',
              '1',
              '5',
              '5',
              '[Env Mgr]',
              '[date]',
              'Active',
            ],
            [
              'RSK-007',
              'Operational',
              'Key equipment failure',
              '3',
              '4',
              '12',
              'High',
              'Preventive maintenance, spare parts stock',
              '2',
              '4',
              '8',
              '[CMMS Mgr]',
              '[date]',
              'Active',
            ],
            [
              'RSK-008',
              'Cyber',
              'Phishing attack leading to data breach',
              '4',
              '4',
              '16',
              'Critical',
              'Email filtering, MFA, awareness training',
              '2',
              '4',
              '8',
              '[CISO]',
              '[date]',
              'Active',
            ],
            [
              'RSK-009',
              'Reputational',
              'Negative media coverage from incident',
              '2',
              '4',
              '8',
              'Med',
              'Crisis comms plan, incident response',
              '1',
              '4',
              '4',
              '[Comms Mgr]',
              '[date]',
              'Active',
            ],
            [
              'RSK-010',
              'HR',
              'Key person dependency (single point of failure)',
              '3',
              '3',
              '9',
              'Med',
              'Cross-training, succession planning',
              '2',
              '3',
              '6',
              '[HR Dir]',
              '[date]',
              'Active',
            ],
          ],
        },
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-002-Objectives-Targets.docx',
    docNumber: 'REG-002',
    title: 'Objectives & Targets Register',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001/14001/45001 Clause 6.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This register records all quality, environmental, and health & safety objectives and targets across the [COMPANY NAME] Integrated Management System, with progress tracking and RAG status.',
      },
      {
        heading: '2. Objectives Register',
        table: {
          headers: [
            'Std',
            'Ref',
            'Objective',
            'KPI/Target',
            'Baseline',
            'Current',
            'Owner',
            'Deadline',
            'Progress',
            'RAG',
          ],
          rows: [
            [
              '9001',
              'OBJ-Q01',
              'Improve customer satisfaction',
              'NPS score ≥ 75',
              '68',
              '72',
              '[Sales Dir]',
              '31/12/2026',
              '60%',
              'Amber',
            ],
            [
              '9001',
              'OBJ-Q02',
              'Reduce customer complaints',
              '< 5 per quarter',
              '8',
              '6',
              '[Quality Mgr]',
              '31/12/2026',
              '70%',
              'Green',
            ],
            [
              '14001',
              'OBJ-E01',
              'Reduce carbon emissions',
              '10% reduction vs 2024',
              '1200 tCO2e',
              '1120 tCO2e',
              '[Env Mgr]',
              '31/12/2026',
              '67%',
              'Green',
            ],
            [
              '14001',
              'OBJ-E02',
              'Increase recycling rate',
              '≥ 85%',
              '72%',
              '80%',
              '[Env Mgr]',
              '31/12/2026',
              '80%',
              'Green',
            ],
            [
              '45001',
              'OBJ-S01',
              'Zero lost time injuries',
              '0 LTIs',
              '2 LTIs',
              '1 LTI',
              '[H&S Mgr]',
              '31/12/2026',
              '50%',
              'Amber',
            ],
            [
              '45001',
              'OBJ-S02',
              'Complete all risk assessments',
              '100% current',
              '85%',
              '92%',
              '[H&S Mgr]',
              '30/06/2026',
              '80%',
              'Green',
            ],
            [
              '27001',
              'OBJ-IS01',
              'Achieve 100% security training',
              '100% completion',
              '65%',
              '88%',
              '[CISO]',
              '30/09/2026',
              '75%',
              'Amber',
            ],
            [
              '50001',
              'OBJ-EN01',
              'Reduce energy consumption',
              '5% vs baseline',
              '450 MWh',
              '435 MWh',
              '[Energy Mgr]',
              '31/12/2026',
              '50%',
              'Amber',
            ],
          ],
        },
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-003-Calibration-Register.docx',
    docNumber: 'REG-003',
    title: 'Calibration & Inspection Equipment Register',
    owner: '[Quality Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 7.1.5',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This register records all monitoring and measuring equipment requiring calibration or verification at [COMPANY NAME], ensuring traceability and currency of calibration status.',
      },
      {
        heading: '2. Equipment Register',
        table: {
          headers: [
            'Equip ID',
            'Description',
            'Serial No',
            'Location',
            'Frequency',
            'Last Cal',
            'Next Due',
            'Standard',
            'Provider',
            'Cert No',
            'Status',
          ],
          rows: [
            [
              'CAL-001',
              'Digital Caliper 0-150mm',
              'SN-24891',
              'QC Lab',
              '12 months',
              '15/01/2026',
              '15/01/2027',
              'ISO 17025',
              '[Cal Provider]',
              'CERT-2026-001',
              'Current',
            ],
            [
              'CAL-002',
              'Torque Wrench 10-100Nm',
              'SN-55123',
              'Workshop',
              '6 months',
              '01/12/2025',
              '01/06/2026',
              'BS EN ISO 6789',
              '[Cal Provider]',
              'CERT-2025-089',
              'Current',
            ],
            [
              'CAL-003',
              'Temperature Logger',
              'SN-78456',
              'Warehouse',
              '12 months',
              '20/02/2026',
              '20/02/2027',
              'IEC 60751',
              '[Cal Provider]',
              'CERT-2026-015',
              'Current',
            ],
            [
              'CAL-004',
              'Weighing Scale 0-30kg',
              'SN-33201',
              'Goods In',
              '6 months',
              '10/11/2025',
              '10/05/2026',
              'OIML R76',
              '[Cal Provider]',
              'CERT-2025-102',
              'Due Soon',
            ],
            [
              'CAL-005',
              'Sound Level Meter',
              'SN-99102',
              'H&S',
              '12 months',
              '05/03/2025',
              '05/03/2026',
              'IEC 61672',
              '[Cal Provider]',
              'CERT-2025-034',
              'Overdue',
            ],
          ],
        },
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-004-Approved-Supplier-Register.docx',
    docNumber: 'REG-004',
    title: 'Approved Supplier Register',
    owner: '[Procurement Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 8.4',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This register maintains the list of approved suppliers and contractors for [COMPANY NAME], including their certification status, performance scores, and review dates.',
      },
      {
        heading: '2. Supplier Register',
        table: {
          headers: [
            'Supplier',
            'Category',
            'Products/Services',
            'Approval Date',
            'Last Review',
            'QMS Cert',
            'H&S Cert',
            'Score',
            'Status',
          ],
          rows: [
            [
              '[Supplier A]',
              'Raw Materials',
              'Steel components',
              '01/01/2024',
              '01/01/2026',
              'ISO 9001',
              'ISO 45001',
              '85%',
              'Approved',
            ],
            [
              '[Supplier B]',
              'IT Services',
              'Cloud hosting',
              '15/03/2024',
              '15/03/2026',
              'ISO 27001',
              'N/A',
              '92%',
              'Preferred',
            ],
            [
              '[Supplier C]',
              'Packaging',
              'Cardboard boxes',
              '01/06/2023',
              '01/06/2025',
              'ISO 9001',
              'N/A',
              '71%',
              'Conditional',
            ],
            [
              '[Supplier D]',
              'Calibration',
              'Equipment cal.',
              '10/09/2024',
              '10/09/2026',
              'ISO 17025',
              'N/A',
              '95%',
              'Preferred',
            ],
            [
              '[Supplier E]',
              'Cleaning',
              'Site cleaning',
              '01/04/2024',
              '01/04/2026',
              'None',
              'CHAS',
              '62%',
              'Approved',
            ],
          ],
        },
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-005-Document-Master-Register.docx',
    docNumber: 'REG-005',
    title: 'Document Master Register',
    owner: '[Document Controller]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 7.5',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This register is the master index of all controlled documents within the [COMPANY NAME] Integrated Management System.',
      },
      {
        heading: '2. Document Register',
        table: {
          headers: [
            'Doc No',
            'Title',
            'Type',
            'ISO Ref',
            'Owner',
            'Version',
            'Issue Date',
            'Next Review',
            'Status',
          ],
          rows: [
            [
              'POL-001',
              'Quality Policy',
              'Policy',
              '9001 cl.5.2',
              'Quality Mgr',
              '1.0',
              '[date]',
              '[date+1yr]',
              'Active',
            ],
            [
              'POL-002',
              'Environmental Policy',
              'Policy',
              '14001 cl.5.2',
              'Env Mgr',
              '1.0',
              '[date]',
              '[date+1yr]',
              'Active',
            ],
            [
              'POL-003',
              'Health & Safety Policy',
              'Policy',
              '45001 cl.5.2',
              'H&S Mgr',
              '1.0',
              '[date]',
              '[date+1yr]',
              'Active',
            ],
            [
              'POL-004',
              'Information Security Policy',
              'Policy',
              '27001 cl.5.2',
              'CISO',
              '1.0',
              '[date]',
              '[date+1yr]',
              'Active',
            ],
            [
              'POL-005',
              'Anti-Bribery Policy',
              'Policy',
              '37001 cl.5.2',
              'Compliance Mgr',
              '1.0',
              '[date]',
              '[date+1yr]',
              'Active',
            ],
            [
              'PRO-001',
              'Document Control Procedure',
              'Procedure',
              '9001 cl.7.5',
              'Doc Controller',
              '1.0',
              '[date]',
              '[date+1yr]',
              'Active',
            ],
            [
              'PRO-002',
              'Internal Audit Procedure',
              'Procedure',
              '9001 cl.9.2',
              'Quality Mgr',
              '1.0',
              '[date]',
              '[date+1yr]',
              'Active',
            ],
            [
              'PRO-003',
              'CAPA Procedure',
              'Procedure',
              '9001 cl.10.2',
              'Quality Mgr',
              '1.0',
              '[date]',
              '[date+1yr]',
              'Active',
            ],
            [
              'PRO-004',
              'Risk Management Procedure',
              'Procedure',
              '9001 cl.6.1',
              'Risk Mgr',
              '1.0',
              '[date]',
              '[date+1yr]',
              'Active',
            ],
            [
              'FRM-001',
              'NCR Form',
              'Form',
              '9001 cl.10.2',
              'Quality Mgr',
              '1.0',
              '[date]',
              '[date+1yr]',
              'Active',
            ],
            [
              'FRM-002',
              'HIRA Form',
              'Form',
              '45001 cl.6.1',
              'H&S Mgr',
              '1.0',
              '[date]',
              '[date+1yr]',
              'Active',
            ],
            [
              'REG-001',
              'Risk Register',
              'Register',
              '9001 cl.6.1',
              'Risk Mgr',
              '1.0',
              '[date]',
              '[date+1yr]',
              'Active',
            ],
            [
              'PLN-001',
              'Internal Audit Programme',
              'Plan',
              '9001 cl.9.2',
              'Quality Mgr',
              '1.0',
              '[date]',
              '[date+1yr]',
              'Active',
            ],
            [
              'RPT-001',
              'Management Review Report',
              'Report',
              '9001 cl.9.3',
              'Quality Mgr',
              '1.0',
              '[date]',
              '[date+1yr]',
              'Active',
            ],
          ],
        },
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-006-Training-Matrix.docx',
    docNumber: 'REG-006',
    title: 'Training Matrix',
    owner: '[HR Manager]',
    approvedBy: '[HR Director]',
    isoRef: 'ISO 9001/45001 Clause 7.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This Training Matrix maps mandatory and recommended training requirements to roles within [COMPANY NAME], tracking completion status to ensure all personnel are competent.',
      },
      {
        heading: '2. Key',
        content:
          'C = Completed (with date)\nR = Required (with target date)\nN/A = Not Required for this role\nO = Overdue (highlight in red)',
      },
      {
        heading: '3. Training Matrix',
        table: {
          headers: [
            'Training Topic',
            'Quality Manager',
            'H&S Advisor',
            'Production Operator',
            'Office Admin',
            'Warehouse Operative',
          ],
          rows: [
            ['Company Induction', 'C 01/2024', 'C 03/2024', 'C 06/2024', 'C 09/2024', 'C 11/2024'],
            ['H&S Awareness', 'C 01/2024', 'C 03/2024', 'C 06/2024', 'C 09/2024', 'C 11/2024'],
            ['Manual Handling', 'N/A', 'C 03/2024', 'C 06/2024', 'R 06/2026', 'C 11/2024'],
            [
              'Fire Safety & Evacuation',
              'C 01/2024',
              'C 03/2024',
              'C 06/2024',
              'C 09/2024',
              'C 11/2024',
            ],
            ['ISO 9001 Awareness', 'C 01/2024', 'C 03/2024', 'C 06/2024', 'R 03/2026', 'N/A'],
            [
              'ISO 14001 Awareness',
              'C 02/2024',
              'C 03/2024',
              'C 07/2024',
              'R 03/2026',
              'C 12/2024',
            ],
            ['First Aid at Work', 'N/A', 'C 04/2024', 'N/A', 'N/A', 'R 06/2026'],
            ['COSHH Awareness', 'N/A', 'C 03/2024', 'C 06/2024', 'N/A', 'C 11/2024'],
            [
              'Data Protection/GDPR',
              'C 02/2024',
              'C 04/2024',
              'R 06/2026',
              'C 09/2024',
              'R 06/2026',
            ],
            ['Permit to Work', 'N/A', 'C 04/2024', 'C 07/2024', 'N/A', 'C 12/2024'],
            ['Internal Auditor', 'C 01/2024', 'R 09/2026', 'N/A', 'N/A', 'N/A'],
            ['Working at Height', 'N/A', 'C 04/2024', 'R 06/2026', 'N/A', 'C 12/2024'],
          ],
        },
      },
    ],
  },
  // ── PLANS ──
  {
    outputPath: 'docs/compliance-templates/plans/PLN-001-Internal-Audit-Programme.docx',
    docNumber: 'PLN-001',
    title: 'Internal Audit Programme (Annual)',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001/14001/45001 Clause 9.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This annual audit programme ensures all IMS processes and ISO standard clauses are audited at least once per year, with increased frequency for high-risk areas.',
      },
      {
        heading: '2. Audit Schedule',
        table: {
          headers: ['Month', 'Area/Process', 'Standard', 'Clauses', 'Lead Auditor', 'Scope/Focus'],
          rows: [
            [
              'January',
              'Document Control & Records',
              'ISO 9001',
              '7.5',
              '[Auditor A]',
              'Document management, version control, retention',
            ],
            [
              'February',
              'H&S Management',
              'ISO 45001',
              '6.1, 8.1',
              '[Auditor B]',
              'Risk assessments, hazard controls, PTW',
            ],
            [
              'March',
              'Environmental Management',
              'ISO 14001',
              '6.1, 8.1',
              '[Auditor A]',
              'Aspects register, compliance obligations, monitoring',
            ],
            [
              'April',
              'Customer Focus & CRM',
              'ISO 9001',
              '5.1.2, 8.2',
              '[Auditor C]',
              'Customer satisfaction, requirements review, complaints',
            ],
            [
              'May',
              'Supplier Management',
              'ISO 9001',
              '8.4',
              '[Auditor B]',
              'Approved suppliers, evaluation, incoming inspection',
            ],
            [
              'June',
              'Training & Competence',
              'ISO 9001/45001',
              '7.2, 7.3',
              '[Auditor A]',
              'Training matrix, records, effectiveness evaluation',
            ],
            [
              'July',
              'Information Security',
              'ISO 27001',
              '5-8',
              '[Auditor D]',
              'Access control, incident management, Annex A controls',
            ],
            [
              'August',
              'Production/Operations',
              'ISO 9001',
              '8.5',
              '[Auditor C]',
              'Process control, monitoring, traceability',
            ],
            [
              'September',
              'Incident & CAPA Management',
              'ISO 45001/9001',
              '10.2',
              '[Auditor B]',
              'Incident investigation, NCRs, CAPA effectiveness',
            ],
            [
              'October',
              'Energy Management',
              'ISO 50001',
              '6.2, 8.1',
              '[Auditor A]',
              'SEUs, EnPIs, energy objectives progress',
            ],
            [
              'November',
              'Leadership & Context',
              'All',
              '4.1-5.3',
              '[Auditor C]',
              'Context, interested parties, policy, objectives',
            ],
            [
              'December',
              'Performance & Improvement',
              'All',
              '9.1, 9.3, 10',
              '[Auditor A]',
              'Monitoring, management review, continual improvement',
            ],
          ],
        },
      },
      {
        heading: '3. Notes',
        content:
          '• Audits may be rescheduled with approval from the [Quality Manager]\n• Additional audits may be triggered by non-conformances, incidents, or significant changes\n• External surveillance/certification audits are scheduled separately\n• Audit reports due within 5 working days of audit completion',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/plans/PLN-002-Business-Continuity-Plan.docx',
    docNumber: 'PLN-002',
    title: 'Business Continuity Plan',
    owner: '[Business Continuity Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22301 / BC Best Practice',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This Business Continuity Plan ensures [COMPANY NAME] can maintain or rapidly resume critical business functions during and after a disruptive incident.',
      },
      {
        heading: '2. Critical Functions & Recovery Targets',
        table: {
          headers: ['Critical Function', 'MTPD', 'RTO', 'RPO', 'MBCO', 'Dependencies'],
          rows: [
            [
              'Customer Order Processing',
              '24 hours',
              '4 hours',
              '1 hour',
              '50% capacity',
              'ERP, Email, Internet',
            ],
            [
              'Production/Manufacturing',
              '48 hours',
              '24 hours',
              '4 hours',
              '30% capacity',
              'Equipment, Materials, Utilities',
            ],
            [
              'Finance & Payroll',
              '72 hours',
              '48 hours',
              '24 hours',
              'Core payments',
              'Accounting system, Banking',
            ],
            [
              'IT Infrastructure',
              '4 hours',
              '2 hours',
              '15 minutes',
              'Core systems',
              'Data centre, Cloud, Network',
            ],
            [
              'Customer Support',
              '8 hours',
              '4 hours',
              '1 hour',
              'Phone + Email',
              'CRM, Telephony, Internet',
            ],
          ],
        },
      },
      {
        heading: '3. Crisis Management Team',
        table: {
          headers: ['Role', 'Name', 'Phone', 'Alt Phone', 'Email'],
          rows: [
            ['Crisis Director', '[Managing Director]', '[number]', '[number]', '[email]'],
            ['Operations Lead', '[Operations Director]', '[number]', '[number]', '[email]'],
            ['IT Recovery Lead', '[IT Manager]', '[number]', '[number]', '[email]'],
            ['Communications Lead', '[Comms Manager]', '[number]', '[number]', '[email]'],
            ['H&S Advisor', '[H&S Manager]', '[number]', '[number]', '[email]'],
          ],
        },
      },
      {
        heading: '4. Incident Response Timeline',
        content:
          '0-1 hour: Incident assessment, crisis team notification, initial response\n1-4 hours: Situation assessment, recovery strategy activation, stakeholder communication\n4-24 hours: Recovery operations commence, workaround solutions deployed\n24-72 hours: Core services restored, customer communications, damage assessment\n72+ hours: Full recovery operations, root cause investigation, lessons learned',
      },
      {
        heading: '5. Communication Plan',
        content:
          'Internal: Staff notification via [phone tree / mass SMS / email / Teams]\nCustomers: Direct contact for key accounts, website notice for others\nSuppliers: Key supplier notification by [Procurement Manager]\nRegulators: Notification if required under legislation\nMedia: All media enquiries handled by [Communications Manager] only',
      },
      {
        heading: '6. Test Schedule',
        content:
          '• Communication cascade test: Every 6 months\n• IT recovery test (backup restoration): Quarterly\n• Desktop exercise: Annually\n• Full simulation exercise: Every 2 years\n• Results documented and plan updated based on findings',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/plans/PLN-003-Emergency-Response-Plan.docx',
    docNumber: 'PLN-003',
    title: 'Emergency Response Plan',
    owner: '[H&S Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 14001/45001 Clause 8.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This Emergency Response Plan provides clear instructions for responding to emergency situations at [COMPANY NAME] premises, protecting people, property, and the environment.',
      },
      {
        heading: '2. Emergency Response Procedures',
        table: {
          headers: [
            'Scenario',
            'Immediate Action',
            'Responsible',
            'Assembly Point',
            'External Agency',
          ],
          rows: [
            [
              'Fire',
              'Activate alarm, evacuate, call 999',
              'Fire Wardens',
              '[Main car park]',
              'Fire & Rescue',
            ],
            [
              'Chemical Spill',
              'Evacuate area, contain if safe, call spill team',
              '[Env Mgr]',
              '[Upwind location]',
              'Environment Agency',
            ],
            [
              'Medical Emergency',
              'Call first aider, call 999 if serious',
              'First Aiders',
              'N/A (casualty location)',
              'Ambulance Service',
            ],
            [
              'Gas Leak',
              'Evacuate, no ignition sources, call 999',
              '[Facilities]',
              '[Designated point]',
              'Gas Emergency',
            ],
            [
              'Flood/Severe Weather',
              'Secure equipment, evacuate if needed',
              '[Facilities]',
              '[Main car park]',
              'Council emergency',
            ],
            [
              'Bomb Threat',
              'Follow bomb threat card, evacuate, call 999',
              '[Reception/Mgr]',
              '[Remote assembly]',
              'Police',
            ],
            [
              'Cyber Attack',
              'Disconnect affected systems, notify IT',
              '[IT Manager]',
              'N/A',
              'NCSC/Police',
            ],
            [
              'Power Failure',
              'Activate UPS/generator, assess duration',
              '[Facilities]',
              'N/A',
              'Energy provider',
            ],
          ],
        },
      },
      {
        heading: '3. Emergency Contacts',
        table: {
          headers: ['Service', 'Contact', 'Number'],
          rows: [
            ['Emergency Services', 'Police/Fire/Ambulance', '999 / 112'],
            ['HSE (RIDDOR)', 'Incident Contact Centre', '0345 300 9923'],
            ['Environment Agency', 'Incident Hotline', '0800 807060'],
            ['National Gas Emergency', 'Gas Emergency', '0800 111 999'],
            ['NHS Direct', 'Health Advice', '111'],
            ['[Company] H&S Manager', '[Name]', '[Number]'],
            ['[Company] Managing Director', '[Name]', '[Number]'],
            ['Nearest Hospital A&E', '[Hospital Name]', '[Number]'],
          ],
        },
      },
      {
        heading: '4. Post-Emergency Review',
        content:
          'Following any emergency or drill:\n\n• Debrief meeting within 48 hours\n• Incident report completed (FRM-003)\n• Emergency plan reviewed and updated\n• Corrective actions raised via CAPA process\n• Staff briefed on any changes\n• Records retained for audit purposes',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/plans/PLN-004-HACCP-Plan.docx',
    docNumber: 'PLN-004',
    title: 'HACCP Plan Template',
    owner: '[Food Safety Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 22000:2018 / Codex Alimentarius',
    sections: [
      {
        heading: '1. Purpose',
        content:
          "This HACCP Plan identifies biological, chemical, and physical hazards associated with [COMPANY NAME]'s food production/handling processes and establishes Critical Control Points (CCPs) with monitoring and corrective action procedures.",
      },
      {
        heading: '2. HACCP Team',
        table: {
          headers: ['Name', 'Role', 'Expertise'],
          rows: [
            ['[Name]', 'HACCP Team Leader', 'Food safety management, HACCP methodology'],
            ['[Name]', 'Production Representative', 'Process knowledge, equipment operation'],
            ['[Name]', 'Quality Representative', 'Testing, specifications, supplier quality'],
            ['[Name]', 'Engineering Representative', 'Equipment design, maintenance'],
            ['[Name]', 'Hygiene Representative', 'Sanitation, pest control, cleaning'],
          ],
        },
      },
      {
        heading: '3. Product Description',
        content:
          'Product Name: [Product Name]\nIntended Use: [Description of intended use]\nIntended Consumer: [Target consumer group including vulnerable groups]\nShelf Life: [Shelf life and storage conditions]\nDistribution: [Distribution method and conditions]\nPackaging: [Packaging type and materials]',
      },
      {
        heading: '4. Hazard Analysis',
        table: {
          headers: [
            'Process Step',
            'Hazard Type',
            'Hazard Description',
            'Severity (1-5)',
            'Likelihood (1-5)',
            'Significance',
            'Control Measure',
            'CCP?',
          ],
          rows: [
            [
              'Raw Material Receipt',
              'Biological',
              'Pathogen contamination of ingredients',
              '5',
              '3',
              '15 Significant',
              'Supplier approval, CoA check, temperature check',
              'No (PRP)',
            ],
            [
              'Storage',
              'Biological',
              'Growth of pathogens due to temperature abuse',
              '5',
              '2',
              '10 Significant',
              'Temperature monitoring, stock rotation',
              'CCP 1',
            ],
            [
              'Cooking',
              'Biological',
              'Survival of pathogens due to inadequate cooking',
              '5',
              '2',
              '10 Significant',
              'Time/temperature control',
              'CCP 2',
            ],
            [
              'Cooling',
              'Biological',
              'Growth of pathogens during slow cooling',
              '4',
              '3',
              '12 Significant',
              'Rapid cooling procedure',
              'CCP 3',
            ],
            [
              'Packaging',
              'Physical',
              'Foreign body contamination (metal)',
              '4',
              '2',
              '8 Moderate',
              'Metal detection',
              'CCP 4',
            ],
            [
              'Storage (Final)',
              'Biological',
              'Growth due to temperature abuse',
              '5',
              '2',
              '10 Significant',
              'Temperature monitoring',
              'CCP 5',
            ],
          ],
        },
      },
      {
        heading: '5. CCP Monitoring Plan',
        table: {
          headers: [
            'CCP',
            'Hazard',
            'Critical Limit',
            'Monitoring Method',
            'Frequency',
            'Corrective Action',
            'Records',
            'Verification',
          ],
          rows: [
            [
              'CCP 1',
              'Pathogen growth',
              '≤ 5°C (chilled) / ≤ -18°C (frozen)',
              'Temperature logger',
              'Continuous',
              'Assess product, adjust equipment, quarantine',
              'Temperature logs',
              'Daily check of records',
            ],
            [
              'CCP 2',
              'Pathogen survival',
              'Core temp ≥ 75°C for 2 min',
              'Probe thermometer',
              'Every batch',
              'Re-cook, quarantine affected product',
              'Cook records',
              'Weekly probe calibration',
            ],
            [
              'CCP 3',
              'Pathogen growth',
              'Cool to ≤ 5°C within 4 hours',
              'Temperature/time check',
              'Every batch',
              'Extend cooling, dispose if exceeded',
              'Cooling records',
              'Monthly review',
            ],
            [
              'CCP 4',
              'Metal foreign body',
              'Fe 2.0mm, Non-Fe 2.5mm, SS 3.5mm',
              'Metal detector',
              'Continuous (each unit)',
              'Reject, isolate, investigate',
              'Detector logs',
              'Hourly test piece check',
            ],
            [
              'CCP 5',
              'Pathogen growth',
              '≤ 5°C (chilled)',
              'Temperature logger',
              'Continuous',
              'Assess product, repair equipment',
              'Temperature logs',
              'Daily verification',
            ],
          ],
        },
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/plans/PLN-005-Energy-Management-Action-Plan.docx',
    docNumber: 'PLN-005',
    title: 'Energy Management Action Plan',
    owner: '[Energy Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 50001:2018 Clause 6.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This Energy Management Action Plan identifies significant energy uses, establishes energy performance indicators, and defines actions to achieve energy objectives at [COMPANY NAME].',
      },
      {
        heading: '2. Significant Energy Uses (SEUs)',
        table: {
          headers: ['SEU', 'Energy Type', 'Annual Consumption', '% of Total', 'EnPI', 'Baseline'],
          rows: [
            [
              'HVAC Systems',
              'Electricity + Gas',
              '180 MWh',
              '40%',
              'kWh per m² per HDD',
              '45 kWh/m²/HDD',
            ],
            [
              'Production Machinery',
              'Electricity',
              '120 MWh',
              '27%',
              'kWh per unit produced',
              '2.4 kWh/unit',
            ],
            ['Lighting', 'Electricity', '55 MWh', '12%', 'kWh per m² per year', '22 kWh/m²'],
            [
              'Compressed Air',
              'Electricity',
              '45 MWh',
              '10%',
              'kWh per m³ at 7 bar',
              '0.12 kWh/m³',
            ],
            ['Transport/Fleet', 'Diesel', '50 MWh eq', '11%', 'litres per 100km', '8.5 L/100km'],
          ],
        },
      },
      {
        heading: '3. Action Plan',
        table: {
          headers: [
            'Action',
            'SEU',
            'Expected Saving',
            'Investment',
            'Payback',
            'Owner',
            'Timeline',
            'Status',
          ],
          rows: [
            [
              'Install LED lighting throughout',
              'Lighting',
              '35 MWh/yr (64%)',
              '£25,000',
              '2.1 years',
              '[Facilities Mgr]',
              'Q2 2026',
              'Planned',
            ],
            [
              'Optimise HVAC schedules & setpoints',
              'HVAC',
              '20 MWh/yr (11%)',
              '£5,000',
              '0.7 years',
              '[Facilities Mgr]',
              'Q1 2026',
              'In Progress',
            ],
            [
              'Fix compressed air leaks',
              'Comp Air',
              '10 MWh/yr (22%)',
              '£3,000',
              '0.9 years',
              '[Maint Mgr]',
              'Q1 2026',
              'In Progress',
            ],
            [
              'Variable speed drives on pumps',
              'Production',
              '15 MWh/yr (13%)',
              '£18,000',
              '3.5 years',
              '[Eng Mgr]',
              'Q3 2026',
              'Planned',
            ],
            [
              'Driver efficiency training',
              'Transport',
              '5 MWh eq/yr (10%)',
              '£2,000',
              '1.2 years',
              '[Fleet Mgr]',
              'Q2 2026',
              'Planned',
            ],
            [
              'Solar PV installation (50kWp)',
              'All',
              '45 MWh/yr',
              '£40,000',
              '5.2 years',
              '[Facilities Mgr]',
              'Q4 2026',
              'Feasibility',
            ],
          ],
        },
      },
      {
        heading: '4. Monitoring Plan',
        content:
          'Energy consumption is monitored through:\n\n• Main utility meters: Monthly readings logged in Nexara IMS Energy module\n• Sub-meters on SEUs: Weekly/daily readings for key equipment\n• EnPI calculation: Monthly, compared against baseline\n• Energy review meetings: Quarterly\n• Management review reporting: Bi-annually',
      },
    ],
  },
  // ── REPORTS ──
  {
    outputPath: 'docs/compliance-templates/reports/RPT-001-Management-Review-Report.docx',
    docNumber: 'RPT-001',
    title: 'Management Review Report Template',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001:2015 Clause 9.3',
    sections: [
      {
        heading: '1. Meeting Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Date:', '[DD/MM/YYYY]'],
            ['Location:', '[Meeting Room / Virtual]'],
            ['Chair:', '[Managing Director]'],
            ['Minutes By:', '[Quality Manager]'],
            ['Attendees:', '[List all attendees]'],
            ['Apologies:', '[List apologies]'],
          ],
        },
      },
      {
        heading: '2. Status of Previous Actions',
        content:
          '[Review the action log from the previous management review. For each action, state: Completed / In Progress / Overdue / Carried Forward. Provide brief status update.]',
      },
      {
        heading: '3. Changes in External & Internal Issues',
        content:
          "[Summarise any changes in the organisation's context since the last review: market conditions, regulatory changes, technology changes, organisational changes, competitive landscape, interested party expectations.]",
      },
      {
        heading: '4. Customer Satisfaction',
        content:
          '[Present customer satisfaction data: NPS scores, survey results, complaint trends, customer feedback summary, key account feedback. Include trends and comparisons to targets.]',
      },
      {
        heading: '5. Objectives Performance',
        content:
          '[Review progress against all IMS objectives (refer to REG-002). Present RAG status for each objective. Highlight any that are behind target with proposed corrective actions.]',
      },
      {
        heading: '6. Process Performance & Product/Service Conformity',
        content:
          '[Present key process performance metrics: first-pass yield, on-time delivery, rework rates, scrap rates, service level achievements. Highlight any adverse trends.]',
      },
      {
        heading: '7. Non-Conformities & Corrective Actions',
        content:
          '[Summarise NCR/CAPA statistics: number raised, closed, overdue, by category. Present trend analysis. Highlight any systemic issues requiring management attention.]',
      },
      {
        heading: '8. Audit Results',
        content:
          '[Summarise internal and external audit results since last review: number conducted, findings by category, open findings, positive observations. Present audit programme completion rate.]',
      },
      {
        heading: '9. Supplier Performance',
        content:
          '[Summarise supplier performance: number of approved suppliers, evaluation results, supplier NCRs, delivery performance, any supplier issues requiring management decision.]',
      },
      {
        heading: '10. Risk Register Review',
        content:
          '[Review the current risk profile: number of risks by level, new risks identified, risks closed, risk score trends, any risks requiring escalation or additional resource.]',
      },
      {
        heading: '11. Resource Adequacy',
        content:
          '[Assess whether current resources (people, infrastructure, technology, budget) are adequate to maintain and improve the IMS. Identify any resource gaps or requests.]',
      },
      {
        heading: '12. Improvement Opportunities',
        content:
          '[Identify opportunities for improvement arising from all the above inputs. Present recommendations for management decision.]',
      },
      {
        heading: '13. Decisions & Actions',
        table: {
          headers: ['Action No', 'Action Description', 'Owner', 'Target Date', 'Priority'],
          rows: [
            ['MR-001', '[Action]', '[Owner]', '[Date]', 'High'],
            ['MR-002', '[Action]', '[Owner]', '[Date]', 'Medium'],
            ['MR-003', '[Action]', '[Owner]', '[Date]', 'Low'],
          ],
        },
      },
      {
        heading: '14. Next Review Date',
        content: 'The next management review is scheduled for: [DD/MM/YYYY]',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/reports/RPT-002-Compliance-Dashboard.docx',
    docNumber: 'RPT-002',
    title: 'Compliance Performance Dashboard Report',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'IMS Performance Monitoring',
    sections: [
      {
        heading: 'Monthly Compliance Performance Dashboard',
        content: 'Period: [Month Year]\nPrepared by: [Quality Manager]\nDate: [DD/MM/YYYY]',
      },
      {
        heading: '1. Compliance Scores by Standard',
        table: {
          headers: ['Standard', 'Score', 'Target', 'Trend', 'Status'],
          rows: [
            ['ISO 9001 Quality', '[XX]%', '85%', '↑', '[Green/Amber/Red]'],
            ['ISO 14001 Environment', '[XX]%', '80%', '→', '[Green/Amber/Red]'],
            ['ISO 45001 H&S', '[XX]%', '90%', '↑', '[Green/Amber/Red]'],
            ['ISO 27001 InfoSec', '[XX]%', '85%', '↓', '[Green/Amber/Red]'],
            ['Overall IMS', '[XX]%', '85%', '→', '[Green/Amber/Red]'],
          ],
        },
      },
      {
        heading: '2. Key Metrics Summary',
        table: {
          headers: ['Metric', 'This Month', 'Last Month', 'YTD', 'Target'],
          rows: [
            ['Open NCRs', '[N]', '[N]', '[N]', '< 10'],
            ['Overdue Actions', '[N]', '[N]', '[N]', '0'],
            ['Audit Completion Rate', '[N]%', '[N]%', '[N]%', '100%'],
            ['Incidents (Total)', '[N]', '[N]', '[N]', '< 5/month'],
            ['Lost Time Injuries', '[N]', '[N]', '[N]', '0'],
            ['Training Completion', '[N]%', '[N]%', '[N]%', '95%'],
            ['Customer Complaints', '[N]', '[N]', '[N]', '< 3/month'],
            ['Supplier NCRs', '[N]', '[N]', '[N]', '< 2/month'],
          ],
        },
      },
      {
        heading: '3. Objectives RAG Summary',
        content:
          '[Insert RAG table from REG-002 showing Red/Amber/Green status for each objective]',
      },
      {
        heading: '4. Top Risks This Month',
        content: '[List top 5 risks from REG-001 with current scores and any changes]',
      },
      {
        heading: '5. Key Actions & Recommendations',
        content:
          "[List the 3-5 most important actions or recommendations arising from this month's performance data]",
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/reports/RPT-003-ESG-Annual-Report.docx',
    docNumber: 'RPT-003',
    title: 'ESG Annual Report Template (CSRD-Aligned)',
    owner: '[Sustainability Director]',
    approvedBy: '[Board of Directors]',
    isoRef: 'CSRD / ESRS / GRI Standards',
    sections: [
      {
        heading: 'Executive Summary',
        content:
          '[Provide a 1-page summary of ESG performance for the reporting year, key achievements, challenges, and forward commitments.]',
      },
      { heading: '1. Environmental Performance', level: 1, content: '' },
      { heading: '1.1 Greenhouse Gas Emissions', level: 2, content: '' },
      {
        table: {
          headers: ['Scope', 'Category', 'tCO2e This Year', 'tCO2e Last Year', 'Change', 'Target'],
          rows: [
            ['Scope 1', 'Direct emissions (gas, fleet)', '[XX]', '[XX]', '[X]%', '[target]'],
            ['Scope 2', 'Electricity (location-based)', '[XX]', '[XX]', '[X]%', '[target]'],
            ['Scope 2', 'Electricity (market-based)', '[XX]', '[XX]', '[X]%', '[target]'],
            ['Scope 3', 'Business travel', '[XX]', '[XX]', '[X]%', '[target]'],
            ['Scope 3', 'Purchased goods & services', '[XX]', '[XX]', '[X]%', '[target]'],
            ['TOTAL', 'All scopes', '[XX]', '[XX]', '[X]%', 'Net Zero by [year]'],
          ],
        },
      },
      {
        heading: '1.2 Energy Consumption',
        level: 2,
        table: {
          headers: ['Energy Source', 'Consumption (MWh)', '% of Total', 'Renewable?'],
          rows: [
            ['Electricity', '[XX]', '[XX]%', '[XX]% renewable'],
            ['Natural Gas', '[XX]', '[XX]%', 'No'],
            ['Diesel (fleet)', '[XX]', '[XX]%', 'No'],
            ['Solar PV (generated)', '[XX]', '[XX]%', 'Yes'],
            ['TOTAL', '[XX]', '100%', '[XX]% renewable'],
          ],
        },
      },
      {
        heading: '1.3 Waste & Water',
        level: 2,
        table: {
          headers: ['Metric', 'This Year', 'Last Year', 'Target'],
          rows: [
            ['Total waste (tonnes)', '[XX]', '[XX]', '[target]'],
            ['Recycling rate', '[XX]%', '[XX]%', '85%'],
            ['Hazardous waste (tonnes)', '[XX]', '[XX]', '[target]'],
            ['Water consumption (m³)', '[XX]', '[XX]', '[target]'],
          ],
        },
      },
      { heading: '2. Social Performance', level: 1, content: '' },
      {
        heading: '2.1 Workforce Metrics',
        level: 2,
        table: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Total employees', '[N]'],
            ['Female employees (%)', '[N]%'],
            ['Board diversity (% female)', '[N]%'],
            ['Employee turnover rate', '[N]%'],
            ['Average training hours/employee', '[N]'],
          ],
        },
      },
      {
        heading: '2.2 Health & Safety',
        level: 2,
        table: {
          headers: ['Metric', 'This Year', 'Last Year', 'Target'],
          rows: [
            ['Lost Time Injury Rate (LTIR)', '[X.XX]', '[X.XX]', '0'],
            ['Total Recordable Incident Rate (TRIR)', '[X.XX]', '[X.XX]', '< 1.0'],
            ['Near misses reported', '[N]', '[N]', 'Increasing trend'],
            ['H&S training hours', '[N]', '[N]', '[target]'],
          ],
        },
      },
      { heading: '3. Governance', level: 1, content: '' },
      {
        heading: '3.1 Compliance & Ethics',
        level: 2,
        table: {
          headers: ['Metric', 'This Year'],
          rows: [
            ['Internal audits completed', '[N]'],
            ['External audit findings (major)', '[N]'],
            ['Whistleblowing reports', '[N]'],
            ['Anti-bribery training completion', '[N]%'],
            ['Data breaches', '[N]'],
            ['Regulatory fines/penalties', '[N] / £[X]'],
          ],
        },
      },
      {
        heading: '4. Double Materiality Summary',
        content:
          '[Summarise the double materiality assessment: top material topics identified, impact materiality vs financial materiality ranking, stakeholder engagement process, and how results inform strategy.]',
      },
      {
        heading: '5. Forward Targets',
        content:
          '[Set out ESG targets for the next reporting period and medium-term (3-5 year) targets, with baseline references and measurement approach.]',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/reports/RPT-004-Supplier-Performance-Review.docx',
    docNumber: 'RPT-004',
    title: 'Supplier Performance Review Report',
    owner: '[Procurement Manager]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 9001:2015 Clause 8.4',
    sections: [
      {
        heading: 'Supplier Details',
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Supplier Name:', '[Supplier Name]'],
            ['Supplier Code:', '[Code]'],
            ['Category:', '[Category]'],
            ['Review Period:', '[Date] to [Date]'],
            ['Reviewed By:', '[Reviewer Name]'],
            ['Review Date:', '[DD/MM/YYYY]'],
          ],
        },
      },
      {
        heading: '1. Delivery Performance',
        table: {
          headers: ['Metric', 'Target', 'Actual', 'Score'],
          rows: [
            ['On-time delivery rate', '≥ 95%', '[XX]%', '[X/5]'],
            ['Lead time compliance', 'Within agreed lead time', '[XX]%', '[X/5]'],
            ['Order accuracy', '≥ 99%', '[XX]%', '[X/5]'],
          ],
        },
      },
      {
        heading: '2. Quality Performance',
        table: {
          headers: ['Metric', 'Target', 'Actual', 'Score'],
          rows: [
            ['Incoming rejection rate', '< 1%', '[XX]%', '[X/5]'],
            ['NCRs raised', '0', '[N]', '[X/5]'],
            ['Corrective action response', 'Within 10 days', '[N] days avg', '[X/5]'],
          ],
        },
      },
      {
        heading: '3. Overall Score',
        table: {
          headers: ['Category', 'Weight', 'Score', 'Weighted Score'],
          rows: [
            ['Delivery', '30%', '[X/5]', '[X.X]'],
            ['Quality', '30%', '[X/5]', '[X.X]'],
            ['Communication', '15%', '[X/5]', '[X.X]'],
            ['Pricing', '15%', '[X/5]', '[X.X]'],
            ['Compliance', '10%', '[X/5]', '[X.X]'],
            ['TOTAL', '100%', '', '[XX]%'],
          ],
        },
      },
      {
        heading: '4. Recommendation',
        content:
          'Based on the overall score:\n\n☐ Continue as Approved Supplier (score ≥ 80%)\n☐ Improvement Plan Required (score 60-79%)\n☐ Place on Probation (score 40-59%)\n☐ Remove from Approved List (score < 40%)\n\nComments: [Reviewer comments and specific improvement requirements]',
      },
      {
        heading: '5. Action Plan',
        table: {
          headers: ['Action', 'Owner', 'Target Date', 'Status'],
          rows: [
            ['[Action 1]', '[Owner]', '[Date]', '[Status]'],
            ['[Action 2]', '[Owner]', '[Date]', '[Status]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/reports/RPT-005-InfoSec-Risk-Assessment-Report.docx',
    docNumber: 'RPT-005',
    title: 'Information Security Risk Assessment Report',
    owner: '[CISO]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 27001:2022 Clause 6.1.2',
    sections: [
      {
        heading: '1. Executive Summary',
        content:
          '[Provide a summary of the information security risk landscape for [COMPANY NAME]. Key findings, overall risk level, critical risks requiring immediate attention, and recommendations.]',
      },
      {
        heading: '2. ISMS Scope',
        content:
          'The Information Security Management System covers: [Define scope — systems, locations, processes, data types covered by the ISMS].',
      },
      {
        heading: '3. Risk Assessment Methodology',
        content:
          'Risk assessment follows PRO-004 using the 5×5 likelihood × severity matrix. Information assets are identified, threats and vulnerabilities assessed, and risks scored. Risks above the acceptable threshold (score ≥ 10) require treatment.',
      },
      {
        heading: '4. Risk Assessment Results',
        table: {
          headers: [
            'Risk ID',
            'Asset/Area',
            'Threat',
            'Vulnerability',
            'L',
            'S',
            'Score',
            'Level',
            'Treatment',
          ],
          rows: [
            [
              'IS-001',
              'Email systems',
              'Phishing attack',
              'User awareness gaps',
              '4',
              '4',
              '16',
              'Critical',
              'Reduce',
            ],
            [
              'IS-002',
              'Customer database',
              'Unauthorised access',
              'Weak access controls',
              '3',
              '5',
              '15',
              'High',
              'Reduce',
            ],
            [
              'IS-003',
              'Backup systems',
              'Ransomware',
              'Backup not air-gapped',
              '3',
              '5',
              '15',
              'High',
              'Reduce',
            ],
            [
              'IS-004',
              'Remote access',
              'Credential theft',
              'No MFA on legacy systems',
              '3',
              '4',
              '12',
              'High',
              'Reduce',
            ],
            [
              'IS-005',
              'Third-party access',
              'Supply chain attack',
              'Limited vendor oversight',
              '2',
              '5',
              '10',
              'High',
              'Reduce',
            ],
            [
              'IS-006',
              'Physical servers',
              'Physical access',
              'Server room controls',
              '2',
              '4',
              '8',
              'Medium',
              'Accept',
            ],
            [
              'IS-007',
              'Mobile devices',
              'Device loss/theft',
              'Encryption gaps',
              '3',
              '3',
              '9',
              'Medium',
              'Reduce',
            ],
            [
              'IS-008',
              'Web applications',
              'SQL injection',
              'Code vulnerabilities',
              '2',
              '4',
              '8',
              'Medium',
              'Reduce',
            ],
          ],
        },
      },
      {
        heading: '5. Annex A Control Assessment Summary',
        content:
          '[Summarise the status of ISO 27001:2022 Annex A controls:\n\n• Total controls applicable: [N]\n• Fully implemented: [N] ([X]%)\n• Partially implemented: [N] ([X]%)\n• Not implemented: [N] ([X]%)\n• Not applicable: [N]\n\nKey gaps identified: [List top control gaps]]',
      },
      {
        heading: '6. Risk Treatment Plan Status',
        table: {
          headers: ['Risk', 'Treatment Action', 'Owner', 'Target Date', 'Status'],
          rows: [
            [
              'IS-001',
              'Deploy advanced email filtering + quarterly phishing tests',
              '[IT Mgr]',
              '[Date]',
              'In Progress',
            ],
            [
              'IS-002',
              'Implement role-based access + quarterly access reviews',
              '[IT Mgr]',
              '[Date]',
              'Planned',
            ],
            ['IS-003', 'Implement immutable backup solution', '[IT Mgr]', '[Date]', 'In Progress'],
            ['IS-004', 'Deploy MFA across all remote access', '[IT Mgr]', '[Date]', 'Planned'],
          ],
        },
      },
      {
        heading: '7. Recommendations',
        bullets: [
          'Prioritise MFA deployment across all systems (IS-004)',
          'Conduct quarterly phishing simulation exercises (IS-001)',
          'Implement third-party security assessment programme (IS-005)',
          'Review and update incident response procedure and conduct tabletop exercise',
          'Increase security awareness training frequency to quarterly',
        ],
      },
    ],
  },
];

console.log(`Generating ${docs.length} documents...`);
let count = 0;
for (const doc of docs) {
  doc.version = doc.version || '1.0';
  gen(doc);
  count++;
}
console.log(`\nDone: ${count} documents generated.`);
