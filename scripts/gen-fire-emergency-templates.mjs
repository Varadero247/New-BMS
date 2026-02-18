#!/usr/bin/env node
/**
 * Fire, Emergency & Disaster Management — DOCX Template Generator
 * Generates all 22 FEM templates using create-docx.mjs
 *
 * Usage: node scripts/gen-fire-emergency-templates.mjs
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, '..', 'docs', 'compliance-templates', 'fire-emergency');
const scriptPath = path.join(__dirname, 'create-docx.mjs');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const templates = [
  // ═══ POLICIES ═══
  {
    outputPath: `${outDir}/FEM-POL-001-Fire-Safety-Policy.docx`,
    docNumber: 'FEM-POL-001',
    title: 'Fire Safety Policy',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'FSO 2005 | ISO 45001:2018 cl.8.2 | Building Safety Act 2022',
    sections: [
      {
        heading: '1. Purpose',
        content:
          "This policy sets out [Company Name]'s commitment to fire safety across all premises under its control. It establishes the framework for preventing fire, protecting life, and minimising damage to property and the environment.\n\nThis policy is a legal requirement under the Regulatory Reform (Fire Safety) Order 2005 (FSO) and supports compliance with ISO 45001:2018 Clause 8.2 (Emergency preparedness and response) and the Building Safety Act 2022.",
      },
      {
        heading: '2. Scope',
        content:
          'This policy applies to all premises owned, leased, or managed by [Company Name], including offices, manufacturing facilities, warehouses, and any temporary work locations. It covers all employees, contractors, visitors, and any other persons who may be affected by fire at our premises.',
      },
      {
        heading: '3. Policy Statement',
        content:
          '[Company Name] is committed to:\n\nPreventing fire through systematic identification and elimination or reduction of fire hazards as far as is reasonably practicable.\n\nProtecting life by ensuring robust means of escape, detection and warning systems, and emergency procedures are in place, tested, and maintained.\n\nProtecting property through appropriate fire prevention measures, fire-resistant construction, and adequate firefighting equipment.\n\nComplying with all applicable fire safety legislation, particularly the Regulatory Reform (Fire Safety) Order 2005 and the Building Safety Act 2022.\n\nMaintaining a written Fire Risk Assessment for every premises, reviewed at least annually or upon any material change.\n\nProviding adequate fire safety training to all employees and ensuring fire wardens are trained and competent.',
      },
      {
        heading: '4. Legal Basis',
        bullets: [
          'Regulatory Reform (Fire Safety) Order 2005 (FSO)',
          'Building Safety Act 2022, Section 156 (mandatory written FRA records from October 2023)',
          'Health and Safety at Work etc. Act 1974',
          'Management of Health and Safety at Work Regulations 1999',
          'ISO 45001:2018 Clause 8.2 — Emergency preparedness and response',
          'ISO 14001:2015 Clause 8.2 — Environmental emergency preparedness',
        ],
      },
      { heading: '5. Responsibilities', content: '' },
      {
        heading: '5.1 Responsible Person (FSO)',
        level: 2,
        content:
          'The Responsible Person for each premises is designated in the Premises Register. They hold overall accountability for fire safety compliance at that premises, including ensuring Fire Risk Assessments are current, fire precautions are maintained, and emergency plans are in place.',
      },
      {
        heading: '5.2 Senior Management',
        level: 2,
        content:
          'Senior management shall provide adequate resources for fire safety, review fire safety performance at least annually, and ensure this policy is communicated to all relevant persons.',
      },
      {
        heading: '5.3 Managers and Supervisors',
        level: 2,
        content:
          'All managers shall ensure fire safety arrangements are implemented in their areas, fire exit routes are kept clear, fire doors are not propped open, and staff are aware of evacuation procedures.',
      },
      {
        heading: '5.4 Fire Wardens',
        level: 2,
        content:
          'Fire wardens are appointed for each area/floor as per the ICS (Incident Command System) structure. They shall receive accredited fire warden training (minimum half-day), undertake regular area sweeps, lead evacuation of their zones, and report to the Incident Commander at the assembly point.',
      },
      {
        heading: '5.5 All Employees',
        level: 2,
        content:
          'All employees shall familiarise themselves with evacuation procedures, assembly points, and the location of fire exits and firefighting equipment. They shall report any fire hazards, damaged equipment, or blocked exits immediately.',
      },
      {
        heading: '6. Fire Risk Assessment',
        content:
          'A fire risk assessment (FRA) shall be conducted for every premises by a competent person using the FSO 5-step methodology:\n\nStep 1: Identify fire hazards (ignition sources, fuel sources, oxygen sources)\nStep 2: Identify people at risk (including vulnerable persons requiring PEEPs)\nStep 3: Evaluate, remove, reduce, and protect from risk\nStep 4: Record findings, prepare emergency plan, inform and train staff\nStep 5: Review regularly (at least annually) and upon any material change\n\nAll FRAs must have a full written record as required by the Building Safety Act 2022.',
      },
      {
        heading: '7. Personal Emergency Evacuation Plans (PEEPs)',
        content:
          'Any person who may require assistance to evacuate due to disability, medical condition, pregnancy, or other factor shall have a Personal Emergency Evacuation Plan (PEEP) prepared, agreed with the individual, and reviewed at least annually or upon any change in circumstances.',
      },
      {
        heading: '8. Emergency Equipment',
        content:
          'All fire detection, alarm, firefighting, and emergency lighting equipment shall be maintained, serviced, and inspected in accordance with manufacturer requirements and relevant British Standards. Inspection and service records shall be maintained.',
      },
      {
        heading: '9. Evacuation Drills',
        content:
          'Evacuation drills shall be conducted at least twice per year for each premises (at least one unannounced). Drill records including evacuation times, issues found, and corrective actions shall be maintained.',
      },
      {
        heading: '10. Training',
        content:
          'All employees shall receive fire safety induction training on joining and refresher training at least annually. Fire wardens shall receive accredited fire warden training with annual refresher.',
      },
      {
        heading: '11. Review',
        content:
          'This policy shall be reviewed annually or upon any significant change in legislation, premises, or after any fire incident. The next scheduled review date is [DD/MM/YYYY].',
      },
      { heading: 'Document Approval', content: '' },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Prepared by', '[Name]', '', '[DD/MM/YYYY]'],
            ['Reviewed by', '[Name]', '', '[DD/MM/YYYY]'],
            ['Approved by', '[Managing Director]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-POL-002-Emergency-Management-Policy.docx`,
    docNumber: 'FEM-POL-002',
    title: 'Emergency Management Policy',
    version: '1.0',
    owner: '[Emergency Planning Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22320:2018 | ISO 45001:2018 cl.8.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          "This policy establishes [Company Name]'s commitment to structured emergency management in accordance with ISO 22320:2018 (Emergency Management — Requirements for incident response). It defines the framework for incident command and control, multi-agency coordination, information management, and post-incident learning.",
      },
      {
        heading: '2. Scope',
        content:
          "This policy covers all emergency situations that may affect [Company Name]'s premises, operations, people, or stakeholders, including but not limited to: fire, explosion, chemical spill, gas leak, flood, structural failure, power failure, cyber attack, bomb threat, pandemic, severe weather, terrorism, and environmental release.",
      },
      {
        heading: '3. Policy Statement',
        content:
          '[Company Name] commits to:\n\nAdopting the Incident Command System (ICS) structure for all emergency responses, ensuring clear command and control with defined roles and responsibilities.\n\nMaintaining documented response plans for all foreseeable emergency types, tested through regular exercises.\n\nEstablishing effective communication protocols for internal staff, external emergency services, regulators, media, and the public.\n\nManaging resources (people, equipment, supplies) effectively during emergencies through structured resource deployment and tracking.\n\nMaintaining full decision traceability during incidents — every decision, its rationale, and the information it was based on shall be recorded for post-incident review and legal compliance.\n\nConducting post-incident reviews for all significant incidents to capture lessons learned and improve future response capability.\n\nIntegrating emergency management with business continuity management (ISO 22301) to ensure rapid recovery of critical business functions.',
      },
      {
        heading: '4. Incident Command System (ICS)',
        content: 'The following ICS roles shall be pre-assigned for each premises:',
        bullets: [
          'Incident Commander — overall command authority',
          'Deputy Incident Commander — assumes command if IC unavailable',
          'Safety Officer — monitors safety conditions',
          'Liaison Officer — coordinates with external agencies',
          'Public Information Officer — manages media/public communications',
          'Operations Section Chief — directs tactical operations',
          'Planning Section Chief — collects and evaluates information',
          'Logistics Section Chief — provides resources and services',
          'Finance/Admin Section Chief — monitors costs and financial matters',
          'Fire Wardens — zone-specific evacuation leadership',
          'First Aiders — medical first response',
          'Assembly Point Wardens — manage assembly point headcounts',
        ],
      },
      {
        heading: '5. Decision Traceability (ISO 22320)',
        content:
          'During any active emergency incident, all key decisions shall be logged in the Incident Decision Log with: timestamp, decision maker, situation summary, decision made, rationale, and resources allocated. This log is append-only — entries cannot be edited or deleted. This requirement supports ISO 22320 traceability and provides a defensible record for any subsequent investigation or inquiry.',
      },
      {
        heading: '6. Communication Protocols',
        content:
          'All communications during an emergency shall be logged with: timestamp, type (internal/external/media/regulatory), recipient, method, content, and acknowledgement status. The Incident Commander shall authorise all external communications. Media statements shall only be issued through the Public Information Officer.',
      },
      {
        heading: '7. Multi-Agency Coordination',
        content:
          'When emergency services (fire, police, ambulance) attend a premises, command shall be handed over to the senior emergency services officer as required. [Company Name] shall provide full cooperation, site plans, hazard information, and personnel support as requested.',
      },
      {
        heading: '8. Post-Incident Review',
        content:
          'A formal post-incident review shall be conducted within 14 days of incident closure for all significant, major, critical, or catastrophic incidents. The review shall cover: timeline reconstruction, decision audit, what went well, areas for improvement, root cause analysis, and action plan.',
      },
      {
        heading: '9. Review',
        content:
          'This policy shall be reviewed annually or after any major incident. Next review date: [DD/MM/YYYY].',
      },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Prepared by', '[Name]', '', '[DD/MM/YYYY]'],
            ['Approved by', '[Managing Director]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-POL-003-Business-Continuity-Policy.docx`,
    docNumber: 'FEM-POL-003',
    title: 'Business Continuity Policy',
    version: '1.0',
    owner: '[Business Continuity Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22301:2019',
    sections: [
      {
        heading: '1. Purpose',
        content:
          "This policy establishes [Company Name]'s commitment to business continuity management (BCM) in accordance with ISO 22301:2019. It ensures that critical business functions can continue or be recovered within acceptable timeframes following a disruptive event.",
      },
      {
        heading: '2. Scope',
        content:
          'This policy covers all critical business functions identified through Business Impact Analysis (BIA), including but not limited to: production/manufacturing, IT systems and data, financial operations, human resources, supply chain, customer service, and regulatory compliance.',
      },
      {
        heading: '3. Policy Statement',
        content:
          '[Company Name] commits to:\n\nConducting Business Impact Analysis (BIA) to identify critical functions and determine Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO) for each.\n\nDeveloping, maintaining, and testing Business Continuity Plans (BCPs) that document recovery strategies for each critical function.\n\nEstablishing a Crisis Management Team with clear roles, responsibilities, and contact details, capable of rapid activation.\n\nConducting a programme of exercises (minimum annually) to validate BCP effectiveness, including tabletop, functional, and full-scale exercises on a 3-year rotation.\n\nMaintaining communication plans for all stakeholders (staff, customers, suppliers, media, regulators) during a continuity event.\n\nReviewing BCPs at least annually and after any significant organisational change, incident, or exercise.',
      },
      {
        heading: '4. Key Definitions',
        bullets: [
          'Recovery Time Objective (RTO): Maximum acceptable time to restore a function after disruption',
          'Recovery Point Objective (RPO): Maximum acceptable data loss measured in time',
          'Maximum Tolerable Period of Disruption (MTPD): Absolute maximum before viability is threatened',
          'Business Impact Analysis (BIA): Process to determine criticality and interdependencies of functions',
        ],
      },
      {
        heading: '5. Leadership Commitment',
        content:
          'Senior leadership shall ensure adequate resources are allocated for BCM, participate in crisis management exercises, and review BCM performance at least annually as part of management review.',
      },
      {
        heading: '6. Exercise Programme',
        content:
          'BCPs shall be tested through a structured exercise programme:\n\nYear 1: Tabletop exercise — discussion-based scenario walk-through\nYear 2: Functional exercise — test specific teams and functions\nYear 3: Full-scale exercise — live activation with all resources\n\nAdditionally, single-procedure drills (e.g. IT failover, communications cascade) may be conducted at any time.',
      },
      {
        heading: '7. Review',
        content: 'This policy shall be reviewed annually. Next review: [DD/MM/YYYY].',
      },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Prepared by', '[Name]', '', '[DD/MM/YYYY]'],
            ['Approved by', '[Managing Director]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ═══ PROCEDURES ═══
  {
    outputPath: `${outDir}/FEM-PRO-001-Fire-Risk-Assessment-Procedure.docx`,
    docNumber: 'FEM-PRO-001',
    title: 'Fire Risk Assessment Procedure',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'FSO 2005 Article 9 | PAS 79-1:2020 | Building Safety Act 2022',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the process for conducting, recording, and reviewing Fire Risk Assessments (FRAs) in compliance with the Regulatory Reform (Fire Safety) Order 2005 Article 9 and the Building Safety Act 2022 Section 156.',
      },
      {
        heading: '2. Scope',
        content:
          'Applies to all non-domestic premises owned, leased, or managed by [Company Name].',
      },
      {
        heading: '3. Legal Basis',
        bullets: [
          'FSO 2005 Article 9 — Duty to carry out risk assessment',
          'FSO 2005 Article 11 — Duty to record significant findings for 5+ employees',
          'Building Safety Act 2022 s.156 — Full written record of assessment mandatory (from October 2023)',
          'PAS 79-1:2020 — Fire risk assessment guidance',
        ],
      },
      {
        heading: '4. Definitions',
        bullets: [
          'Responsible Person (RP): Person with control of premises (employer, owner, occupier)',
          'Competent Person: Assessor with adequate training, knowledge, experience (BAFE/IFE/IFSM)',
          'Material Change: Any change that may affect fire risk (layout, use, occupancy, process)',
        ],
      },
      { heading: '5. Responsibilities', content: '' },
      {
        heading: '5.1 Responsible Person',
        level: 2,
        content:
          'Ensure a suitable and sufficient FRA is carried out by a competent person. Ensure findings are acted upon. Ensure records are maintained and shared with incoming RP on change of ownership/management.',
      },
      {
        heading: '5.2 Fire Risk Assessor',
        level: 2,
        content:
          'Conduct the assessment using the FSO 5-step methodology. Document all findings. Provide prioritised action plan.',
      },
      { heading: '6. Procedure — FSO 5-Step Fire Risk Assessment', content: '' },
      {
        heading: '6.1 Step 1: Identify Fire Hazards',
        level: 2,
        content:
          'Systematically identify:\n\nIgnition Sources: Electrical equipment, hot work, smoking, arson potential, cooking, heating, machinery, static electricity, naked flames, lightning.\n\nFuel Sources: Paper/cardboard, wood, flammable liquids, textiles, plastics, rubber, waste materials, furniture, packaging.\n\nOxygen Sources: Natural air, air conditioning systems, oxygen cylinders, oxidising chemicals, ventilation systems.\n\nFor each hazard identified, record location, quantity, and proximity to ignition/fuel/oxygen.',
      },
      {
        heading: '6.2 Step 2: Identify People at Risk',
        level: 2,
        content:
          'Record numbers of: employees, visitors, contractors, members of the public who may be present. Identify persons who may be especially at risk: persons with mobility impairment (require PEEP), persons with visual/hearing/cognitive impairment, lone workers, night workers, young persons, pregnant employees, persons unfamiliar with premises.',
      },
      {
        heading: '6.3 Step 3: Evaluate, Remove, Reduce, Protect',
        level: 2,
        content:
          'Assess adequacy of existing fire precautions across six categories:\n\n1. Fire Detection and Warning — Type, coverage, maintenance status\n2. Means of Escape — Routes, travel distances, signage, lighting\n3. Emergency Lighting — Coverage, testing regime, battery backup\n4. Firefighting Equipment — Type, location, suitability, maintenance\n5. Signs and Notices — Fire action notices, exit signs, extinguisher signs\n6. Management and Maintenance — Housekeeping, testing, training\n\nApply 5x5 risk matrix: Likelihood (1-5) × Consequence (1-5) = Risk Score\nRisk Levels: Trivial (1-2), Low (3-4), Medium (5-9), High (10-14), Very High (15-19), Intolerable (20-25)',
      },
      {
        heading: '6.4 Step 4: Record, Plan, Inform, Instruct, Train',
        level: 2,
        content:
          'Record all significant findings in the FRA report. Prepare prioritised action plan with: finding, required action, priority (Critical/High/Medium/Low), responsible person, target date. Inform all relevant persons of the findings. Ensure emergency plan is in place. Arrange or confirm fire safety training for staff.',
      },
      {
        heading: '6.5 Step 5: Review',
        level: 2,
        content:
          'Review the FRA: at least annually, after any fire or significant near-miss, upon any material change to premises (layout, use, process, occupancy), when requested by the fire authority, after any significant building work.\n\nRecord the trigger for review and any changes made.',
      },
      {
        heading: '7. Building Safety Act Compliance',
        content:
          'From October 2023, the following are mandatory: Full written record of the fire risk assessment (not just significant findings). Fire safety arrangements must be documented. Records must be shared with incoming Responsible Person on change of management/ownership.',
      },
      {
        heading: '8. Records Retention',
        content:
          'FRA records shall be retained for the life of the building or a minimum of 40 years, whichever is longer. Superseded FRAs shall be archived, not destroyed.',
      },
      {
        heading: 'Appendix A: FRA Competency Criteria',
        content:
          "The assessor shall demonstrate:\n\nFormal fire safety qualification (IFE, NEBOSH Fire Certificate, or equivalent)\nMembership of relevant professional body (IFE, IFSM) or BAFE registration\nMinimum 2 years' practical fire risk assessment experience\nKnowledge of current fire safety legislation and guidance\nCPD record demonstrating ongoing competence",
      },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Prepared by', '[Name]', '', '[DD/MM/YYYY]'],
            ['Approved by', '[Managing Director]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-PRO-002-Emergency-Response-Procedure.docx`,
    docNumber: 'FEM-PRO-002',
    title: 'Emergency Response Procedure',
    version: '1.0',
    owner: '[Emergency Planning Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22320:2018 | ISO 45001:2018 cl.8.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the structured response to emergency situations at [Company Name] premises, based on the Incident Command System (ICS) as required by ISO 22320:2018.',
      },
      {
        heading: '2. Emergency Types',
        bullets: [
          'Fire or explosion',
          'Chemical spill or gas leak',
          'Flood or severe weather',
          'Structural failure or building collapse',
          'Power or utility failure',
          'Bomb threat or civil unrest',
          'Pandemic or mass casualty event',
          'Cyber attack affecting physical safety',
          'Environmental release',
          'Terrorism',
        ],
      },
      {
        heading: '3. Activation Criteria',
        content:
          'The emergency response shall be activated when:\n\nAny person discovers an immediate threat to life, property, or the environment.\nThe fire alarm sounds.\nAn incident is reported that requires coordinated multi-person response.\nExternal agencies (police, fire) request activation.\nA crisis management decision is made to activate the BCP.',
      },
      {
        heading: '4. ICS Structure',
        content: 'Upon activation, the following command structure is established:',
        table: {
          headers: ['ICS Role', 'Responsibilities', 'Assigned To'],
          rows: [
            ['Incident Commander', 'Overall command authority, declares/closes incident', '[Name]'],
            ['Deputy IC', 'Assumes command if IC unavailable', '[Name]'],
            ['Safety Officer', 'Monitors safety of responders', '[Name]'],
            ['Liaison Officer', 'Coordinates with external agencies', '[Name]'],
            ['Public Information Officer', 'Media and public communications', '[Name]'],
            ['Operations Chief', 'Directs tactical operations (evacuation, containment)', '[Name]'],
            ['Planning Chief', 'Collects information, tracks resources', '[Name]'],
            ['Logistics Chief', 'Provides equipment, facilities, supplies', '[Name]'],
            ['Finance/Admin Chief', 'Monitors costs, procurement authority', '[Name]'],
          ],
        },
      },
      { heading: '5. First Actions by Emergency Type', content: '' },
      {
        heading: '5.1 Fire/Explosion',
        level: 2,
        content:
          '1. Activate fire alarm (nearest call point)\n2. Call 999 — Fire Service\n3. Evacuate affected area(s) — fire wardens sweep\n4. Do NOT attempt to fight fire unless trained and safe\n5. Incident Commander to command centre\n6. Roll call at assembly point\n7. Brief fire service on arrival (location, hazards, persons unaccounted)',
      },
      {
        heading: '5.2 Chemical Spill/Gas Leak',
        level: 2,
        content:
          '1. Evacuate immediate area — upwind direction\n2. Identify substance (SDS reference)\n3. Call 999 if hazardous\n4. Activate spill kit if trained and safe\n5. Notify IC and environmental officer\n6. Isolate area — prevent entry\n7. Monitor for environmental release',
      },
      {
        heading: '5.3 Flood/Severe Weather',
        level: 2,
        content:
          '1. Monitor weather warnings\n2. Protect critical equipment and records\n3. Isolate electrical systems in affected areas\n4. Consider early release of staff\n5. Activate BCP if significant disruption expected',
      },
      {
        heading: '6. Evacuation Decision-Making',
        content: 'The Incident Commander shall decide evacuation type based on risk assessment:',
        table: {
          headers: ['Evacuation Type', 'When Used'],
          rows: [
            ['Full Evacuation', 'Entire premises at risk — all areas evacuated simultaneously'],
            ['Partial Evacuation', 'Only affected areas evacuated'],
            ['Horizontal Evacuation', 'Move to refuge area on same floor (high-rise, hospitals)'],
            ['Phased Evacuation', 'Evacuate affected floor first, then adjacent floors'],
            ['Stay Put', 'Compartmented buildings where fire is contained (some residential)'],
            ['Shelter in Place', 'External hazard (chemical, weather) — safer to remain inside'],
          ],
        },
      },
      {
        heading: '7. Command Centre Activation',
        content:
          'For Major, Critical, or Catastrophic incidents, the command centre shall be activated at [Location]. Equipment: communications (phone/radio), incident log, site plans, contact directories, PPE, first aid kit, hi-vis vests.',
      },
      {
        heading: '8. External Agency Notification',
        content:
          'Emergency services (999): immediately for any life-threatening situation.\nHSE (RIDDOR): within specified timeframe for reportable incidents.\nEnvironment Agency: for environmental releases.\nLocal Authority: as required.\nMedia: only through the Public Information Officer.',
      },
      {
        heading: '9. Incident Closure',
        content:
          'The Incident Commander shall declare the incident closed when: the threat has been eliminated or contained, all persons are accounted for, scene is safe for re-entry (confirmed by fire service if attended), all agencies have been notified of closure.',
      },
      {
        heading: '10. Post-Incident Review',
        content:
          'A formal review shall be conducted within 14 days. The review shall follow FEM-FRM-008 Post-Incident Review Report template.',
      },
      {
        heading: 'Appendix A: ICS Role Cards',
        content:
          'Each ICS role holder should carry a role card summarising their key responsibilities, reporting line, and contact details for the role above and below them in the command structure. Role cards should be laminated and stored at the command centre and at each assembly point.',
      },
      { heading: 'Appendix B: Agency Contact Directory Template', content: '' },
      {
        table: {
          headers: ['Agency', 'Contact Number', '24hr Number', 'Key Contact', 'Notes'],
          rows: [
            ['Fire Service', '999', '[Local]', '', ''],
            ['Police', '999 / 101', '[Local]', '', ''],
            ['Ambulance', '999', '', '', ''],
            ['HSE', '0345 300 9923', '', '', 'RIDDOR reporting'],
            ['Environment Agency', '0800 807060', '', '', 'Incident hotline'],
            ['Gas Emergency', '0800 111 999', '', '', 'National Grid'],
            ['Electricity', '[DNO Number]', '', '', ''],
            ['Water', '[Company Number]', '', '', ''],
          ],
        },
      },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Prepared by', '[Name]', '', '[DD/MM/YYYY]'],
            ['Approved by', '[Managing Director]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-PRO-003-Evacuation-Procedure.docx`,
    docNumber: 'FEM-PRO-003',
    title: 'Evacuation Procedure',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'FSO 2005 | ISO 45001:2018 cl.8.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the evacuation process for [Company Name] premises, ensuring safe and orderly evacuation of all persons.',
      },
      {
        heading: '2. Alarm Response',
        content:
          'On hearing the fire alarm:\n\nAll persons shall stop work immediately.\nClose windows and doors (do not lock) as you leave.\nDo NOT use lifts.\nProceed to the nearest safe exit route.\nWalk briskly — do not run.\nDo NOT stop to collect personal belongings.\nAssist any person in difficulty (within your capability).\nProceed directly to the designated assembly point.\nReport to your area warden or assembly point warden.',
      },
      {
        heading: '3. Fire Warden Actions',
        numberedList: [
          'On alarm activation, don hi-vis vest and collect clipboard/roll.',
          'Sweep your designated area — check toilets, meeting rooms, kitchens, store rooms.',
          'Direct persons to nearest safe exit.',
          'Check for persons requiring PEEP assistance.',
          'Close doors as you leave each area.',
          'Report to Incident Commander at assembly point: "Floor [X] clear" or "Floor [X] — [number] persons unaccounted."',
          'Prevent re-entry until "All Clear" given by Incident Commander or fire service.',
        ],
      },
      {
        heading: '4. Assembly Points',
        content:
          'Each premises has designated assembly points recorded in the Premises Register. Assembly points are chosen to be:\n\nAt least 50m from the building\nAccessible to all persons including wheelchair users\nMarked with visible signage\nLarge enough for maximum occupancy\nNot blocking emergency vehicle access\n\nPremises-specific assembly points: [Refer to site-specific Emergency Response Plan FEM-PLN-001]',
      },
      {
        heading: '5. Roll Call Process',
        content:
          'The Assembly Point Warden shall:\n\n1. Collect headcount from each Fire Warden\n2. Compare against visitor book/sign-in system\n3. Report total evacuated and any unaccounted persons to Incident Commander\n4. Record roll call completion time\n5. Maintain control of evacuees at assembly point',
      },
      {
        heading: '6. PEEP Activation',
        content:
          "Persons with PEEPs shall be evacuated according to their individual plan. Named assistants shall go to the person's normal location immediately on alarm. If the person is not at their normal location, notify the Incident Commander. Evacuation chairs (if specified in PEEP) are located at [locations]. After evacuation, confirm the person is at the assembly point and report to the warden.",
      },
      {
        heading: '7. Re-entry Criteria',
        content:
          'No person shall re-enter the premises until:\n\nThe fire service has confirmed the building is safe (if they attended), OR\nThe Incident Commander has confirmed the "All Clear" (if no fire service attendance)\nThe fire alarm has been reset\nAny damaged areas have been assessed and secured',
      },
      {
        heading: '8. Liaison with Fire Service',
        content:
          'On arrival of the fire service, the Incident Commander shall:\n\nBrief the Officer in Charge on the situation\nProvide site plans showing fire location, hazardous materials, utilities isolation points\nProvide PEEP information for any persons still in the building\nHand over command as appropriate\nProvide access to fire panels and risers',
      },
      {
        heading: '9. Recording and Reporting',
        content:
          'All evacuations (real and drill) shall be recorded using FEM-FRM-003 Evacuation Drill Record, including: date and time, evacuation time, roll call time, issues identified, and corrective actions.',
      },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Prepared by', '[Name]', '', '[DD/MM/YYYY]'],
            ['Approved by', '[Managing Director]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-PRO-004-Fire-Warden-Procedure.docx`,
    docNumber: 'FEM-PRO-004',
    title: 'Fire Warden Procedure',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'FSO 2005 | ISO 45001:2018',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the appointment, training, and duties of fire wardens at [Company Name] premises.',
      },
      {
        heading: '2. Appointment',
        content:
          'Fire wardens shall be appointed for each floor/zone of every premises. Minimum coverage: 1 warden per floor plus 1 per 50 occupants. Deputies shall be designated for each warden. Wardens shall be volunteers where possible, with management appointment as fallback.',
      },
      {
        heading: '3. Training Requirements',
        content:
          'Initial Training: Minimum half-day accredited fire warden course covering: fire science, fire hazards in the workplace, fire detection and alarm systems, means of escape, firefighting equipment, evacuation techniques, human behaviour in fire, PEEP assistance, role of fire warden.\n\nRefresher: Annual refresher training (minimum 2 hours). Certificate of training to be recorded in the Fire Warden Register (FEM-REG-001).',
      },
      {
        heading: '4. Area Responsibility',
        content:
          'Each warden is assigned a specific area (floor, zone, department) as recorded in the Fire Warden Register. They shall be familiar with: all exits and escape routes in their area, location of fire alarm call points, location and type of fire extinguishers, location of first aid equipment, names and locations of persons with PEEPs, any specific fire hazards in their area.',
      },
      {
        heading: '5. Pre-Evacuation Sweep',
        content:
          'On alarm activation, wardens shall: don hi-vis vest, systematically check all areas including toilets, meeting rooms, break rooms, and storage areas, direct all persons to exits, check fire doors are closed, assist PEEP individuals, report area status to IC.',
      },
      {
        heading: '6. Headcount at Assembly Point',
        content:
          'Wardens shall report to the Assembly Point Warden with: number of persons evacuated from their area, confirmation area is clear OR details of any unaccounted persons, any issues encountered during evacuation, any injuries observed.',
      },
      {
        heading: '7. Communication with IC',
        content:
          'Wardens report directly to the Incident Commander. Communication methods: verbal (at assembly point), radio (if issued), phone. Standard report format: "Floor [X]/Area [Y]: [Clear/Not Clear]. [Number] persons evacuated. Issues: [none/details]."',
      },
      {
        heading: '8. Reporting Defects',
        content:
          'Wardens shall report any fire safety defects immediately: blocked exits, damaged fire doors, missing extinguishers, faulty emergency lighting, obstructed fire equipment, propped-open fire doors. Use the fire safety defect reporting form or the Nexara IMS emergency module.',
      },
      {
        heading: '9. Updating Warden Lists',
        content:
          'The Fire Warden Register (FEM-REG-001) shall be updated when: a warden leaves the organisation, a warden changes work area, training expires, a new warden is appointed, a deputy changes.',
      },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Prepared by', '[Name]', '', '[DD/MM/YYYY]'],
            ['Approved by', '[Managing Director]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-PRO-005-BCP-Activation-Procedure.docx`,
    docNumber: 'FEM-PRO-005',
    title: 'Business Continuity Activation Procedure',
    version: '1.0',
    owner: '[Business Continuity Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22301:2019',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the process for activating, managing, and deactivating Business Continuity Plans (BCPs) following a disruptive event.',
      },
      {
        heading: '2. Trigger Criteria',
        content:
          'BCP activation shall be considered when:\n\nA disruption has occurred or is imminent that threatens critical business functions.\nThe estimated duration of disruption exceeds the RTO of any critical function.\nNormal incident management is insufficient to manage the situation.\nMultiple business functions are affected simultaneously.\nThe disruption has significant financial, reputational, or regulatory impact.',
      },
      {
        heading: '3. 15-Minute Crisis Checklist',
        content: 'Within the first 15 minutes of notification:',
        numberedList: [
          'Confirm the nature and extent of the disruption',
          'Assess immediate safety risks — prioritise life safety',
          'Notify the Crisis Management Team Lead',
          'Convene initial crisis call (phone/virtual)',
          'Determine which critical functions are/will be affected',
          'Decide: activate BCP or manage through normal incident response',
          'If activating: identify which BCP(s) apply',
          'Notify all Crisis Team members of activation',
          'Establish command centre (physical or virtual)',
          'Begin communication cascade to affected staff',
        ],
      },
      {
        heading: '4. Notification of Crisis Team',
        content:
          'The Crisis Team Lead shall be notified immediately by phone. If unreachable within 10 minutes, the Deputy shall be contacted. Crisis Team contact details are maintained in each BCP document and in the Nexara IMS emergency module.',
      },
      {
        heading: '5. Initial Assessment',
        content:
          'The Crisis Team shall assess: which critical functions are impacted, estimated time to restore normal operations, whether RTOs are at risk of being breached, what resources are needed, whether alternative sites/systems need to be activated.',
      },
      {
        heading: '6. BCP Activation Decision',
        content:
          'The Crisis Team Lead (or Deputy) makes the activation decision and formally records it. The activation shall specify: which BCP(s) are activated, which functions are in scope, the command structure, the initial recovery priorities.',
      },
      {
        heading: '7. Recovery Actions by Function',
        content:
          "Each critical function's recovery follows the strategies documented in the relevant BCP. The Planning Section Chief tracks recovery progress against RTOs. Any function at risk of breaching its RTO shall be escalated immediately to the Crisis Team Lead.",
      },
      {
        heading: '8. Communication Cascade',
        content:
          'Upon activation: Staff — via SMS cascade and email. Customers — via pre-drafted notification template. Suppliers — via key contact notification. Regulators — as required by regulation. Media — through Public Information Officer only.',
      },
      {
        heading: '9. Deactivation Criteria',
        content:
          'The BCP may be deactivated when: all critical functions have been restored to acceptable levels, normal operations can resume, no further disruption is expected, all regulatory notifications have been made.',
      },
      {
        heading: '10. Stand-Down Process',
        content:
          'Upon deactivation: notify all Crisis Team members, notify all staff of return to normal operations, schedule post-event review within 14 days, update BCP based on lessons learned, file all activation records.',
      },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Prepared by', '[Name]', '', '[DD/MM/YYYY]'],
            ['Approved by', '[Managing Director]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-PRO-006-PEEP-Assessment-Procedure.docx`,
    docNumber: 'FEM-PRO-006',
    title: 'PEEP Assessment Procedure',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'FSO 2005 | Equality Act 2010 | ISO 45001:2018',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the process for identifying, assessing, and maintaining Personal Emergency Evacuation Plans (PEEPs) for any person who may need assistance to evacuate premises in an emergency.',
      },
      {
        heading: '2. Who Requires a PEEP',
        bullets: [
          'Persons with permanent mobility impairment (wheelchair users, walking frame users)',
          'Persons with visual impairment',
          'Persons with hearing impairment',
          'Persons with cognitive or learning disabilities',
          'Persons with temporary conditions (broken limb, pregnancy, post-surgery)',
          'Persons with medical conditions that may affect evacuation (epilepsy, heart conditions, severe asthma)',
          'Any person who self-identifies as needing evacuation assistance',
        ],
      },
      {
        heading: '3. Assessment Process',
        numberedList: [
          'Individual is identified (self-referral, manager referral, HR notification, occupational health)',
          'Meeting arranged with H&S team and the individual (and manager if appropriate)',
          'Assessment conducted using FEM-FRM-004 PEEP Assessment Form',
          'Evacuation method determined (standard exit, evacuation chair, refuge, buddy system)',
          'Named assistants identified and briefed',
          'Special equipment identified and provided (evacuation chair, visual alert device, etc.)',
          'PEEP documented and signed by the individual',
          'Copy provided to the individual, their manager, fire wardens, and reception/security',
          'PEEP registered in the Nexara IMS emergency module',
        ],
      },
      {
        heading: '4. PEEP Content Requirements',
        bullets: [
          "Person's name, job title, department, normal work location",
          'Mobility level (Independent, Assisted, Dependent, Wheelchair User, etc.)',
          'Specific evacuation method',
          'Number and names of evacuation assistants',
          'Refuge area location (if applicable)',
          'Special equipment required',
          'Communication needs during evacuation',
          'Brief medical summary (relevant to evacuation only)',
          'Review date',
          "Person's agreement signature",
        ],
      },
      {
        heading: '5. Review Triggers',
        content:
          "A PEEP shall be reviewed: at least annually, when the person's condition changes, when the person changes work location or floor, after any evacuation (real or drill) where issues were identified, when the building layout changes, when evacuation assistants change.",
      },
      {
        heading: '6. Confidentiality',
        content:
          'PEEP records contain personal and medical information. Access shall be restricted to: the individual, their named assistants, fire wardens (relevant sections only), H&S team, HR (for reasonable adjustments). Full PEEP details must not be displayed publicly. RBAC access controls shall restrict PEEP data to H&S Manager role and above.',
      },
      {
        heading: '7. Drill Testing',
        content:
          'PEEP evacuation procedures should be tested at least annually during an evacuation drill. The individual should participate where comfortable to do so. Alternative testing (talk-through, partial simulation) may be used where full evacuation testing is impractical or distressing.',
      },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Prepared by', '[Name]', '', '[DD/MM/YYYY]'],
            ['Approved by', '[Managing Director]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-PRO-007-BCP-Exercise-Procedure.docx`,
    docNumber: 'FEM-PRO-007',
    title: 'BCP Exercise & Testing Procedure',
    version: '1.0',
    owner: '[Business Continuity Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22301:2019 cl.8.5',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This procedure defines the programme for exercising and testing Business Continuity Plans in accordance with ISO 22301:2019 Clause 8.5.',
      },
      {
        heading: '2. Exercise Programme',
        content:
          'Minimum frequency: annually. Recommended 3-year cycle:\n\nYear 1: Tabletop exercise — discussion-based scenario\nYear 2: Functional exercise — test specific teams/functions\nYear 3: Full-scale exercise — live activation with all resources\n\nAdditionally, single-procedure drills (IT failover, communications cascade, alternative site setup) may be conducted at any time.',
      },
      { heading: '3. Exercise Types', content: '' },
      {
        heading: '3.1 Tabletop',
        level: 2,
        content:
          'Discussion-based exercise where the Crisis Team walks through a scenario. No physical movement of resources. Duration: typically 2-4 hours. Suitable for validating plans, roles, decision-making processes.',
      },
      {
        heading: '3.2 Functional',
        level: 2,
        content:
          'Tests specific functions or teams in near-real-time. May involve IT failover, communications cascade, or team mobilisation. Duration: typically half to full day.',
      },
      {
        heading: '3.3 Full-Scale',
        level: 2,
        content:
          'Live exercise involving all resources, teams, and (where possible) external agencies. Simulates a real disruption as closely as possible. Duration: typically 1-2 days. Requires significant planning (minimum 3 months lead time).',
      },
      {
        heading: '4. Planning Requirements',
        numberedList: [
          'Define clear, measurable objectives',
          'Select appropriate scenario (realistic, challenging but achievable)',
          'Identify participants and observers',
          'Brief all participants on exercise rules and safety',
          'Prepare injects (scenario developments)',
          'Arrange observers and evaluators',
          'Prepare evaluation forms',
          'Notify senior management and external parties if affected',
        ],
      },
      {
        heading: '5. Observer Roles',
        content:
          'Observers shall be appointed to watch and evaluate the exercise without intervening. They shall record: decisions made and their timeliness, communications effectiveness, plan adherence, resource utilisation, any deviations from the plan.',
      },
      {
        heading: '6. Finding Categorisation',
        content:
          'Exercise findings shall be categorised as:\n\nStrength: Procedure or action that worked well\nWeakness: Area that needs improvement but did not prevent recovery\nFailure: Critical gap that would prevent or significantly delay recovery',
      },
      {
        heading: '7. Action Tracking',
        content:
          'All weaknesses and failures shall generate actions, tracked using the FEM-FRM-007 BCP Exercise Report Template. Actions must have: description, owner, target date. Actions shall be tracked to completion before the next exercise.',
      },
      {
        heading: '8. Lessons Learned',
        content:
          'Following each exercise, the BCP shall be updated to reflect lessons learned. Updates shall be version-controlled. All participants shall receive a summary of findings and actions.',
      },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Prepared by', '[Name]', '', '[DD/MM/YYYY]'],
            ['Approved by', '[Managing Director]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ═══ FORMS ═══
  {
    outputPath: `${outDir}/FEM-FRM-001-Fire-Risk-Assessment-Form.docx`,
    docNumber: 'FEM-FRM-001',
    title: 'Fire Risk Assessment Form',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'FSO 2005 | PAS 79-1:2020 | Building Safety Act 2022',
    sections: [
      { heading: 'SECTION 1: Premises Details', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Premises Name', '[                    ]'],
            ['Address', '[                    ]'],
            ['Postcode', '[          ]'],
            ['Building Type', '[Office / Factory / Warehouse / Retail / Other]'],
            ['Number of Floors', '[    ]'],
            ['Max Occupancy', '[    ]'],
            ['Normal Occupancy', '[    ]'],
            ['Responsible Person', '[                    ]'],
            ['RP Contact', '[                    ]'],
            ['FRA Reference Number', '[FRA-YYYY-NNNN]'],
            ['Assessment Date', '[DD/MM/YYYY]'],
            ['Assessor Name', '[                    ]'],
            ['Assessor Qualification', '[IFE / NEBOSH / BAFE / IFSM]'],
            ['Previous FRA Date', '[DD/MM/YYYY]'],
            ['Previous FRA Ref', '[                    ]'],
          ],
        },
      },
      { heading: 'SECTION 2: Step 1 — Identify Fire Hazards', content: '' },
      { heading: 'Ignition Sources', level: 2, content: '' },
      {
        table: {
          headers: ['Hazard', 'Present Y/N', 'Location', 'Controls in Place'],
          rows: [
            ['Electrical equipment', '', '', ''],
            ['Hot work', '', '', ''],
            ['Smoking', '', '', ''],
            ['Arson potential', '', '', ''],
            ['Cooking appliances', '', '', ''],
            ['Heating systems', '', '', ''],
            ['Machinery/plant', '', '', ''],
            ['Static electricity', '', '', ''],
            ['Naked flames', '', '', ''],
            ['Other: [specify]', '', '', ''],
          ],
        },
      },
      { heading: 'Fuel Sources', level: 2, content: '' },
      {
        table: {
          headers: ['Fuel', 'Present Y/N', 'Quantity', 'Location', 'Storage Method'],
          rows: [
            ['Paper/cardboard', '', '', '', ''],
            ['Wood/timber', '', '', '', ''],
            ['Flammable liquids', '', '', '', ''],
            ['Textiles/fabrics', '', '', '', ''],
            ['Plastics', '', '', '', ''],
            ['Rubber', '', '', '', ''],
            ['Waste materials', '', '', '', ''],
            ['Furniture', '', '', '', ''],
            ['Packaging', '', '', '', ''],
            ['Other: [specify]', '', '', '', ''],
          ],
        },
      },
      { heading: 'Oxygen Sources', level: 2, content: '' },
      {
        table: {
          headers: ['Source', 'Present Y/N', 'Location', 'Notes'],
          rows: [
            ['Air conditioning/HVAC', '', '', ''],
            ['Oxygen cylinders', '', '', ''],
            ['Oxidising chemicals', '', '', ''],
            ['Natural ventilation', '', '', ''],
            ['Other: [specify]', '', '', ''],
          ],
        },
      },
      { pageBreak: true },
      { heading: 'SECTION 3: Step 2 — People at Risk', content: '' },
      {
        table: {
          headers: ['Category', 'Number', 'Notes'],
          rows: [
            ['Employees', '[    ]', ''],
            ['Visitors (typical)', '[    ]', ''],
            ['Contractors', '[    ]', ''],
            ['Members of public', '[    ]', ''],
            ['Total persons at risk', '[    ]', ''],
          ],
        },
      },
      { heading: 'Vulnerable Persons', level: 2, content: '' },
      {
        table: {
          headers: ['Category', 'Present Y/N', 'Number', 'PEEP in Place Y/N'],
          rows: [
            ['Mobility impaired', '', '', ''],
            ['Visual impairment', '', '', ''],
            ['Hearing impairment', '', '', ''],
            ['Cognitive impairment', '', '', ''],
            ['Pregnant employees', '', '', ''],
            ['Young persons (<18)', '', '', ''],
            ['Lone workers', '', '', ''],
            ['Night/out-of-hours workers', '', '', ''],
            ['Non-English speakers', '', '', ''],
          ],
        },
      },
      { pageBreak: true },
      { heading: 'SECTION 4: Step 3 — Evaluate Existing Precautions', content: '' },
      {
        table: {
          headers: ['Category', 'Adequate Y/N', 'Notes / Deficiencies'],
          rows: [
            ['1. Fire Detection & Warning', '', ''],
            ['   - Type and coverage of system', '', ''],
            ['   - Maintained to BS 5839?', '', ''],
            ['   - Testing regime in place?', '', ''],
            ['2. Means of Escape', '', ''],
            ['   - Adequate number of exits?', '', ''],
            ['   - Travel distances acceptable?', '', ''],
            ['   - Routes unobstructed?', '', ''],
            ['   - Fire doors adequate?', '', ''],
            ['3. Emergency Lighting', '', ''],
            ['   - Coverage adequate?', '', ''],
            ['   - Monthly functional test?', '', ''],
            ['   - Annual full discharge test?', '', ''],
            ['4. Firefighting Equipment', '', ''],
            ['   - Correct types for hazards?', '', ''],
            ['   - Adequate coverage?', '', ''],
            ['   - Annual service current?', '', ''],
            ['5. Signs & Notices', '', ''],
            ['   - Fire action notices displayed?', '', ''],
            ['   - Exit signs adequate?', '', ''],
            ['   - Extinguisher signs in place?', '', ''],
            ['6. Management & Maintenance', '', ''],
            ['   - Housekeeping adequate?', '', ''],
            ['   - Maintenance regime in place?', '', ''],
            ['   - Staff trained?', '', ''],
          ],
        },
      },
      {
        heading: 'SECTION 5: Risk Evaluation Matrix',
        content:
          'Likelihood (1 = Very Unlikely, 5 = Almost Certain)\nConsequence (1 = Negligible, 5 = Catastrophic)\nRisk Score = Likelihood × Consequence',
      },
      {
        table: {
          headers: [
            '',
            'Consequence 1',
            'Consequence 2',
            'Consequence 3',
            'Consequence 4',
            'Consequence 5',
          ],
          rows: [
            ['Likelihood 5', '5 (Med)', '10 (High)', '15 (V.High)', '20 (Intol)', '25 (Intol)'],
            ['Likelihood 4', '4 (Low)', '8 (Med)', '12 (High)', '16 (V.High)', '20 (Intol)'],
            ['Likelihood 3', '3 (Low)', '6 (Med)', '9 (Med)', '12 (High)', '15 (V.High)'],
            ['Likelihood 2', '2 (Triv)', '4 (Low)', '6 (Med)', '8 (Med)', '10 (High)'],
            ['Likelihood 1', '1 (Triv)', '2 (Triv)', '3 (Low)', '4 (Low)', '5 (Med)'],
          ],
        },
      },
      {
        table: {
          headers: ['Field', 'Value'],
          rows: [
            ['Likelihood Rating', '[1-5]'],
            ['Consequence Rating', '[1-5]'],
            ['Overall Risk Score', '[    ]'],
            ['Overall Risk Level', '[Trivial / Low / Medium / High / Very High / Intolerable]'],
          ],
        },
      },
      { pageBreak: true },
      { heading: 'SECTION 6: Step 4 — Action Plan', content: '' },
      {
        table: {
          headers: [
            'No.',
            'Finding',
            'Action Required',
            'Priority',
            'Responsible Person',
            'Target Date',
            'Completed Date',
          ],
          rows: [
            ['1', '', '', '[C/H/M/L]', '', '[DD/MM/YYYY]', ''],
            ['2', '', '', '[C/H/M/L]', '', '[DD/MM/YYYY]', ''],
            ['3', '', '', '[C/H/M/L]', '', '[DD/MM/YYYY]', ''],
            ['4', '', '', '[C/H/M/L]', '', '[DD/MM/YYYY]', ''],
            ['5', '', '', '[C/H/M/L]', '', '[DD/MM/YYYY]', ''],
            ['6', '', '', '[C/H/M/L]', '', '[DD/MM/YYYY]', ''],
            ['7', '', '', '[C/H/M/L]', '', '[DD/MM/YYYY]', ''],
            ['8', '', '', '[C/H/M/L]', '', '[DD/MM/YYYY]', ''],
          ],
        },
      },
      { heading: 'SECTION 7: Emergency Plan & Training', content: '' },
      {
        table: {
          headers: ['Item', 'Status', 'Date', 'Notes'],
          rows: [
            ['Emergency plan in place?', '[Y/N]', '', ''],
            ['Staff informed of findings?', '[Y/N]', '[DD/MM/YYYY]', ''],
            ['Fire safety training conducted?', '[Y/N]', '[DD/MM/YYYY]', ''],
            ['Fire wardens trained?', '[Y/N]', '[DD/MM/YYYY]', ''],
            ['Evacuation drill conducted?', '[Y/N]', '[DD/MM/YYYY]', ''],
          ],
        },
      },
      { heading: 'SECTION 8: Review Schedule & Sign-off', content: '' },
      {
        table: {
          headers: ['Item', 'Response'],
          rows: [
            ['Next Review Date', '[DD/MM/YYYY]'],
            ['Review Trigger', '[Annual / Material Change / Incident / Audit]'],
            ['Written Record Complete (BSA)', '[Y/N]'],
            ['Fire Arrangements Documented (BSA)', '[Y/N]'],
            ['Shared with Incoming RP (if applicable)', '[Y/N]'],
          ],
        },
      },
      {
        heading: 'Significant Findings Summary',
        level: 2,
        content: '[Free text — record significant findings here]\n\n\n\n',
      },
      {
        heading: 'Assessor Declaration',
        level: 2,
        content:
          'I confirm this fire risk assessment has been conducted in accordance with the FSO 2005 5-step methodology and represents my professional opinion of the fire risk at these premises.',
      },
      {
        table: {
          headers: ['', 'Details'],
          rows: [
            ['Assessor Name', '[                    ]'],
            ['Assessor Signature', ''],
            ['Date', '[DD/MM/YYYY]'],
            ['Responsible Person Name', '[                    ]'],
            ['RP Signature', ''],
            ['RP Date', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-FRM-002-Emergency-Incident-Report.docx`,
    docNumber: 'FEM-FRM-002',
    title: 'Emergency Incident Report Form',
    version: '1.0',
    owner: '[Emergency Planning Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22320:2018',
    sections: [
      { heading: 'Incident Details', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Incident Number', '[INC-YYYY-NNNN]'],
            [
              'Emergency Type',
              '[Fire / Explosion / Chemical Spill / Gas Leak / Flood / Structural / Power / Cyber / Bomb Threat / Pandemic / Weather / Other]',
            ],
            ['Severity', '[Minor / Significant / Major / Critical / Catastrophic]'],
            ['Date & Time Reported', '[DD/MM/YYYY HH:MM]'],
            ['Date & Time Activated', '[DD/MM/YYYY HH:MM]'],
            ['Date & Time Contained', '[DD/MM/YYYY HH:MM]'],
            ['Date & Time Closed', '[DD/MM/YYYY HH:MM]'],
            ['Duration', '[HH:MM]'],
            ['Premises', '[                    ]'],
            ['Location (specific)', '[                    ]'],
            ['Reported By', '[                    ]'],
            ['Incident Commander', '[                    ]'],
          ],
        },
      },
      {
        heading: 'Description',
        content:
          '[Provide a full description of the incident, including what happened, when, where, and how it was discovered]\n\n\n\n',
      },
      {
        heading: 'Immediate Actions Taken',
        content: '[Detail all immediate actions taken upon discovery/notification]\n\n\n\n',
      },
      { heading: 'Evacuation', content: '' },
      {
        table: {
          headers: ['Item', 'Response'],
          rows: [
            ['Evacuation Ordered?', '[Y/N]'],
            ['Evacuation Type', '[Full / Partial / Horizontal / Phased / Shelter]'],
            ['Persons Evacuated', '[Number]'],
            ['Assembly Point Used', '[                    ]'],
            ['Roll Call Completed?', '[Y/N]'],
            ['Evacuation Time', '[Minutes]'],
            ['All Persons Accounted For?', '[Y/N]'],
          ],
        },
      },
      { heading: 'Persons Affected', content: '' },
      {
        table: {
          headers: ['Item', 'Response'],
          rows: [
            ['Estimated Persons Affected', '[Number]'],
            ['Injuries Reported?', '[Y/N] — If yes, detail below'],
            ['Fatalities Reported?', '[Y/N] — If yes, detail below'],
            ['Injury Details', '[                    ]'],
          ],
        },
      },
      { heading: 'External Agencies Notified', content: '' },
      {
        table: {
          headers: ['Agency', 'Notified Y/N', 'Time Notified', 'Reference Number'],
          rows: [
            ['Fire Service', '', '', ''],
            ['Police', '', '', ''],
            ['Ambulance', '', '', ''],
            ['HSE (RIDDOR)', '', '', ''],
            ['Environment Agency', '', '', ''],
            ['Local Authority', '', '', ''],
            ['Utility Company', '', '', ''],
            ['Other: [specify]', '', '', ''],
          ],
        },
      },
      { heading: 'RIDDOR Assessment', content: '' },
      {
        table: {
          headers: ['Item', 'Response'],
          rows: [
            ['RIDDOR Reportable?', '[Y/N]'],
            ['RIDDOR Category', '[Fatality / Specified Injury / 7+ Day / Dangerous Occurrence]'],
            ['RIDDOR Reported Date', '[DD/MM/YYYY]'],
            ['RIDDOR Reference', '[                    ]'],
          ],
        },
      },
      { heading: 'BCP Activation', content: '' },
      {
        table: {
          headers: ['Item', 'Response'],
          rows: [
            ['BCP Activated?', '[Y/N]'],
            ['BCP Reference', '[BCP-YYYY-NNN]'],
            ['Continuity Impact', '[                    ]'],
            ['Estimated Recovery (hours)', '[    ]'],
          ],
        },
      },
      {
        heading: 'Decision Log Summary',
        content: 'Attach full decision log or summarise key decisions:',
        table: {
          headers: ['Time', 'Decision Maker', 'Decision', 'Rationale'],
          rows: [
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
          ],
        },
      },
      { heading: 'Root Cause', content: '' },
      {
        table: {
          headers: ['Item', 'Response'],
          rows: [
            ['Root Cause Category', '[Human / Technical / Environmental / Procedural]'],
            ['Root Cause Description', '[                    ]'],
          ],
        },
      },
      {
        heading: 'Lessons Learned',
        content: '[Document key lessons learned from this incident]\n\n\n\n',
      },
      { heading: 'Review Details', content: '' },
      {
        table: {
          headers: ['Item', 'Response'],
          rows: [
            ['Post-Incident Review Date', '[DD/MM/YYYY]'],
            ['Review Conducted By', '[                    ]'],
          ],
        },
      },
      { heading: 'Sign-Off', content: '' },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Incident Commander', '[Name]', '', '[DD/MM/YYYY]'],
            ['Responsible Person', '[Name]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-FRM-003-Evacuation-Drill-Record.docx`,
    docNumber: 'FEM-FRM-003',
    title: 'Evacuation Drill Record',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Responsible Person]',
    isoRef: 'FSO 2005',
    sections: [
      { heading: 'Drill Details', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Date', '[DD/MM/YYYY]'],
            ['Time', '[HH:MM]'],
            ['Premises', '[                    ]'],
            ['Floors/Areas Included', '[                    ]'],
            ['Drill Type', '[Announced / Unannounced]'],
            ['Evacuation Type', '[Full / Partial / Horizontal / Phased]'],
            ['Alarm Type', '[Alarmed / Silent]'],
            ['Drill Coordinator', '[                    ]'],
          ],
        },
      },
      { heading: 'Evacuation Results', content: '' },
      {
        table: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Total Persons Evacuated', '[    ]'],
            ['Evacuation Time (minutes)', '[    ]'],
            ['Target Time (minutes)', '[    ]'],
            ['Target Achieved?', '[Y/N]'],
            ['Assembly Point Reached?', '[Y/N]'],
            ['Roll Call Completed?', '[Y/N]'],
            ['Roll Call Time (minutes)', '[    ]'],
            ['PEEP Evacuation Tested?', '[Y/N]'],
          ],
        },
      },
      { heading: 'PEEP Issues', content: '[Record any issues with PEEP evacuations]\n\n' },
      { heading: 'Issues Identified', content: '' },
      {
        table: {
          headers: [
            'Issue No.',
            'Issue Description',
            'Location',
            'Action Required',
            'Responsible Person',
            'Target Date',
          ],
          rows: [
            ['1', '', '', '', '', ''],
            ['2', '', '', '', '', ''],
            ['3', '', '', '', '', ''],
            ['4', '', '', '', '', ''],
            ['5', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: 'Warden Performance Notes',
        content:
          '[Note any observations on warden performance, coverage gaps, or commendations]\n\n\n',
      },
      {
        heading: 'Corrective Actions',
        content: '[Summary of corrective actions to be taken before next drill]\n\n\n',
      },
      { heading: 'Next Drill', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Next Drill Date', '[DD/MM/YYYY]'],
            ['Drill Type', '[Announced / Unannounced]'],
          ],
        },
      },
      { heading: 'Witnesses', content: '[List names of witnesses/observers]' },
      { heading: 'Sign-Off', content: '' },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Drill Coordinator', '[Name]', '', '[DD/MM/YYYY]'],
            ['Responsible Person', '[Name]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-FRM-004-PEEP-Assessment-Form.docx`,
    docNumber: 'FEM-FRM-004',
    title: 'Personal Emergency Evacuation Plan (PEEP) Assessment Form',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Responsible Person]',
    isoRef: 'FSO 2005 | Equality Act 2010',
    sections: [
      {
        heading: 'Privacy Notice',
        content:
          'This form contains personal and medical information. It will be shared only with those who need to know for evacuation purposes: the individual, named evacuation assistants, fire wardens (relevant details only), and the H&S team. It will be stored securely and reviewed regularly.',
      },
      { heading: 'Personal Details', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Name', '[                    ]'],
            ['Job Title', '[                    ]'],
            ['Department', '[                    ]'],
            ['Normal Work Location (floor/room)', '[                    ]'],
            ['Premises', '[                    ]'],
            ['Manager Name', '[                    ]'],
          ],
        },
      },
      { heading: 'Mobility Assessment', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            [
              'Mobility Level',
              '[Independent / Assisted / Dependent / Wheelchair User / Visual Impairment / Hearing Impairment / Cognitive Impairment]',
            ],
            ['Description of Mobility Needs', '[                    ]'],
            ['Requires Assistance to Evacuate?', '[Y/N]'],
          ],
        },
      },
      { heading: 'Evacuation Plan', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            [
              'Evacuation Method',
              '[Standard exit with assistance / Evacuation chair / Refuge area then assisted / Buddy system / Other]',
            ],
            ['Number of Assistants Required', '[    ]'],
            ['Named Assistant 1', '[Name, Phone, Location]'],
            ['Named Assistant 2', '[Name, Phone, Location]'],
            ['Named Assistant 3 (backup)', '[Name, Phone, Location]'],
            ['Refuge Area Required?', '[Y/N]'],
            ['Refuge Location', '[                    ]'],
            [
              'Special Equipment Required',
              '[Evacuation chair / Visual alarm / Vibrating pager / Other]',
            ],
            [
              'Communication Method During Evacuation',
              '[Verbal / Sign language / Written / Visual alert / Other]',
            ],
          ],
        },
      },
      { heading: 'Medical Summary (Relevant to Evacuation Only)', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Brief Medical Summary', '[Only information relevant to safe evacuation]'],
            ['Medication Carried on Person?', '[Y/N]'],
            ['Any Medical Equipment Required During Evacuation?', '[Y/N — specify]'],
          ],
        },
      },
      { heading: 'Review', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Review Date', '[DD/MM/YYYY]'],
            ['Last Reviewed', '[DD/MM/YYYY]'],
            ['Assessed By', '[                    ]'],
          ],
        },
      },
      {
        heading: 'Agreement',
        content:
          'I have been consulted about this PEEP and agree that it accurately reflects my evacuation needs. I understand that this information will be shared with my named assistants and fire wardens for evacuation purposes.',
      },
      {
        table: {
          headers: ['', 'Details'],
          rows: [
            ["Person's Name", '[                    ]'],
            ["Person's Signature", ''],
            ['Date', '[DD/MM/YYYY]'],
            ['Assessor Name', '[                    ]'],
            ['Assessor Signature', ''],
            ['Assessor Date', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-FRM-005-Fire-Warden-Appointment.docx`,
    docNumber: 'FEM-FRM-005',
    title: 'Fire Warden Appointment & Training Record',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Responsible Person]',
    isoRef: 'FSO 2005',
    sections: [
      { heading: 'Warden Details', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Name', '[                    ]'],
            ['Job Title', '[                    ]'],
            ['Premises', '[                    ]'],
            ['Area Responsible', '[Floor / Zone / Department]'],
            ['ICS Role', '[Fire Warden / Incident Commander / Safety Officer / etc.]'],
            ['Appointment Date', '[DD/MM/YYYY]'],
            ['Deputy Name', '[                    ]'],
            ['Deputy Phone', '[                    ]'],
          ],
        },
      },
      { heading: 'Training Record', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Training Provider', '[                    ]'],
            ['Training Date', '[DD/MM/YYYY]'],
            ['Training Expiry Date', '[DD/MM/YYYY]'],
            ['Certificate Number', '[                    ]'],
            ['Type of Training', '[Initial / Refresher]'],
          ],
        },
      },
      { heading: 'Training Topics Covered', content: '' },
      {
        table: {
          headers: ['Topic', 'Covered Y/N'],
          rows: [
            ['Fire science and behaviour', ''],
            ['Fire hazards in the workplace', ''],
            ['Fire detection and alarm systems', ''],
            ['Means of escape', ''],
            ['Firefighting equipment types and use', ''],
            ['Evacuation techniques', ''],
            ['Human behaviour in fire', ''],
            ['PEEP assistance', ''],
            ['Role and responsibilities of fire warden', ''],
            ['Pre-evacuation sweep procedure', ''],
            ['Assembly point management', ''],
            ['Communication with Incident Commander', ''],
          ],
        },
      },
      {
        heading: 'Acknowledgement of Responsibilities',
        content:
          'I acknowledge my appointment as Fire Warden and understand my responsibilities as outlined in FEM-PRO-004 Fire Warden Procedure. I confirm I have received appropriate training and am familiar with the evacuation procedures for my assigned area.',
      },
      {
        table: {
          headers: ['', 'Details'],
          rows: [
            ['Warden Name', '[                    ]'],
            ['Warden Signature', ''],
            ['Date', '[DD/MM/YYYY]'],
            ['Manager Name', '[                    ]'],
            ['Manager Signature', ''],
            ['Manager Date', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-FRM-006-Emergency-Equipment-Inspection.docx`,
    docNumber: 'FEM-FRM-006',
    title: 'Emergency Equipment Inspection Record',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Responsible Person]',
    isoRef: 'FSO 2005 | BS 5306',
    sections: [
      { heading: 'Inspection Details', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Premises', '[                    ]'],
            ['Inspection Date', '[DD/MM/YYYY]'],
            ['Inspector Name', '[                    ]'],
            ['Inspection Type', '[Monthly / Quarterly / Annual Service]'],
          ],
        },
      },
      { heading: 'Equipment Inspection Log', content: '' },
      {
        table: {
          headers: [
            'Equipment ID',
            'Type',
            'Location',
            'Last Service',
            'Next Service Due',
            'Result (P/F/A)',
            'Defects Found',
            'Action Taken',
          ],
          rows: [
            [
              '',
              '[Extinguisher/AED/First Aid/Spill Kit]',
              '',
              '[DD/MM/YY]',
              '[DD/MM/YY]',
              '',
              '',
              '',
            ],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
          ],
        },
      },
      { heading: 'Monthly Inspection Checklist — Fire Extinguishers', content: '' },
      {
        table: {
          headers: ['Check Item', 'OK Y/N', 'Notes'],
          rows: [
            ['In correct location?', '', ''],
            ['Clearly visible?', '', ''],
            ['Access unobstructed?', '', ''],
            ['Pressure gauge in green zone?', '', ''],
            ['Pin and tamper seal intact?', '', ''],
            ['No physical damage?', '', ''],
            ['Hose/nozzle in good condition?', '', ''],
            ['Service label current?', '', ''],
            ['Correct type for hazards in area?', '', ''],
          ],
        },
      },
      { heading: 'Monthly Inspection Checklist — AED/Defibrillator', content: '' },
      {
        table: {
          headers: ['Check Item', 'OK Y/N', 'Notes'],
          rows: [
            ['Unit accessible?', '', ''],
            ['Status indicator light green?', '', ''],
            ['Pads within expiry date?', '', ''],
            ['Battery charge adequate?', '', ''],
            ['Cabinet secure and dry?', '', ''],
          ],
        },
      },
      { heading: 'Sign-Off', content: '' },
      {
        table: {
          headers: ['', 'Details'],
          rows: [
            ['Inspector Name', '[                    ]'],
            ['Inspector Signature', ''],
            ['Date', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-FRM-007-BCP-Exercise-Report.docx`,
    docNumber: 'FEM-FRM-007',
    title: 'BCP Exercise Report Template',
    version: '1.0',
    owner: '[Business Continuity Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22301:2019 cl.8.5',
    sections: [
      { heading: 'Exercise Summary', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Exercise Title', '[                    ]'],
            ['Exercise Type', '[Tabletop / Functional / Full-Scale / Drill]'],
            ['Date', '[DD/MM/YYYY]'],
            ['Duration (hours)', '[    ]'],
            ['BCP Reference', '[BCP-YYYY-NNN]'],
            ['Scope', '[                    ]'],
            ['Facilitator', '[                    ]'],
            ['Number of Participants', '[    ]'],
            ['External Parties Involved?', '[Y/N — specify]'],
          ],
        },
      },
      { heading: 'Objectives', content: '' },
      {
        table: {
          headers: ['Objective', 'Achieved Y/N', 'Evidence'],
          rows: [
            ['1. [Objective description]', '', ''],
            ['2. [Objective description]', '', ''],
            ['3. [Objective description]', '', ''],
            ['4. [Objective description]', '', ''],
          ],
        },
      },
      { heading: 'Scenario Used', content: '[Describe the scenario used for the exercise]\n\n\n' },
      { heading: 'Exercise Timeline', content: '' },
      {
        table: {
          headers: ['Time', 'Event/Inject', 'Response', 'Observation'],
          rows: [
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
          ],
        },
      },
      { heading: 'Observations', content: '' },
      {
        table: {
          headers: ['No.', 'Area', 'Finding', 'Category (S/W/F)'],
          rows: [
            ['1', '', '', '[Strength/Weakness/Failure]'],
            ['2', '', '', ''],
            ['3', '', '', ''],
            ['4', '', '', ''],
            ['5', '', '', ''],
          ],
        },
      },
      { heading: 'Recommendations and Actions', content: '' },
      {
        table: {
          headers: ['No.', 'Action', 'Owner', 'Target Date', 'Completed Date'],
          rows: [
            ['1', '', '', '[DD/MM/YYYY]', ''],
            ['2', '', '', '[DD/MM/YYYY]', ''],
            ['3', '', '', '[DD/MM/YYYY]', ''],
            ['4', '', '', '[DD/MM/YYYY]', ''],
            ['5', '', '', '[DD/MM/YYYY]', ''],
          ],
        },
      },
      { heading: 'Overall Outcome', content: '' },
      {
        table: {
          headers: ['Field', 'Response'],
          rows: [
            ['Overall Outcome', '[Passed / Passed with Actions / Failed / Cancelled]'],
            ['Objectives Met?', '[Y/N]'],
          ],
        },
      },
      { heading: 'Next Exercise', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Next Exercise Date', '[DD/MM/YYYY]'],
            ['Next Exercise Type', '[Tabletop / Functional / Full-Scale]'],
          ],
        },
      },
      { heading: 'Sign-Off', content: '' },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Facilitator', '[Name]', '', '[DD/MM/YYYY]'],
            ['BC Manager', '[Name]', '', '[DD/MM/YYYY]'],
            ['Senior Sponsor', '[Name]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-FRM-008-Post-Incident-Review-Report.docx`,
    docNumber: 'FEM-FRM-008',
    title: 'Post-Incident Review Report',
    version: '1.0',
    owner: '[Emergency Planning Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22320:2018 | ISO 45001:2018',
    sections: [
      { heading: 'Incident Summary', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Incident Number', '[INC-YYYY-NNNN]'],
            ['Emergency Type', '[                    ]'],
            ['Severity', '[Minor / Significant / Major / Critical / Catastrophic]'],
            ['Date & Time', '[DD/MM/YYYY HH:MM]'],
            ['Duration', '[HH:MM]'],
            ['Premises', '[                    ]'],
            ['Incident Commander', '[                    ]'],
          ],
        },
      },
      {
        heading: 'Timeline Reconstruction',
        content: 'Reconstruct the chronological sequence of events:',
        table: {
          headers: ['Time', 'Event', 'Action Taken', 'By Whom'],
          rows: [
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
            ['[HH:MM]', '', '', ''],
          ],
        },
      },
      {
        heading: 'Decision Audit',
        content: 'Review each key decision made during the incident:',
        table: {
          headers: ['Decision', 'Rationale', 'Was it Right?', 'What Would Improve It?'],
          rows: [
            ['', '', '[Y/N]', ''],
            ['', '', '[Y/N]', ''],
            ['', '', '[Y/N]', ''],
            ['', '', '[Y/N]', ''],
          ],
        },
      },
      {
        heading: 'What Went Well',
        content: '[Document aspects of the response that worked effectively]\n\n\n\n',
      },
      {
        heading: 'What Could Be Improved',
        content: '[Document aspects that need improvement]\n\n\n\n',
      },
      { heading: 'Root Cause Analysis', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Root Cause Category', '[Human / Technical / Environmental / Procedural]'],
            ['Root Cause Description', '[                    ]'],
            ['Contributing Factors', '[                    ]'],
            ['Underlying Causes', '[                    ]'],
          ],
        },
      },
      { heading: 'Action Plan', content: '' },
      {
        table: {
          headers: ['No.', 'Action', 'Priority', 'Owner', 'Target Date', 'Completed'],
          rows: [
            ['1', '', '[C/H/M/L]', '', '[DD/MM/YYYY]', ''],
            ['2', '', '[C/H/M/L]', '', '[DD/MM/YYYY]', ''],
            ['3', '', '[C/H/M/L]', '', '[DD/MM/YYYY]', ''],
            ['4', '', '[C/H/M/L]', '', '[DD/MM/YYYY]', ''],
            ['5', '', '[C/H/M/L]', '', '[DD/MM/YYYY]', ''],
          ],
        },
      },
      { heading: 'RIDDOR / Regulatory Reporting Status', content: '' },
      {
        table: {
          headers: ['Item', 'Status'],
          rows: [
            ['RIDDOR Reportable?', '[Y/N]'],
            ['RIDDOR Report Filed?', '[Y/N — Date]'],
            ['Environment Agency Notified?', '[Y/N — Date]'],
            ['Other Regulatory Notifications', '[                    ]'],
          ],
        },
      },
      { heading: 'BCP Activation Assessment', content: '' },
      {
        table: {
          headers: ['Item', 'Response'],
          rows: [
            ['Was BCP activated?', '[Y/N]'],
            ['Was BCP activation appropriate?', '[Y/N]'],
            ['Were RTOs achieved?', '[Y/N — Details]'],
            ['BCP amendments needed?', '[Y/N — Details]'],
          ],
        },
      },
      { heading: 'Lessons Learned — Updates Required', content: '' },
      {
        table: {
          headers: ['Document/Plan', 'Update Required', 'Owner'],
          rows: [
            ['Emergency Response Plan', '', ''],
            ['Evacuation Procedure', '', ''],
            ['Fire Risk Assessment', '', ''],
            ['Business Continuity Plan', '', ''],
            ['Training Programme', '', ''],
            ['Equipment Requirements', '', ''],
          ],
        },
      },
      { heading: 'Distribution List', content: '' },
      {
        table: {
          headers: ['Name', 'Role', 'Date Issued'],
          rows: [
            ['[Name]', '[Role]', '[DD/MM/YYYY]'],
            ['[Name]', '[Role]', '[DD/MM/YYYY]'],
            ['[Name]', '[Role]', '[DD/MM/YYYY]'],
          ],
        },
      },
      { heading: 'Sign-Off', content: '' },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Review Lead', '[Name]', '', '[DD/MM/YYYY]'],
            ['Incident Commander', '[Name]', '', '[DD/MM/YYYY]'],
            ['Responsible Person', '[Name]', '', '[DD/MM/YYYY]'],
            ['Senior Manager', '[Name]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },

  // ═══ REGISTERS ═══
  {
    outputPath: `${outDir}/FEM-REG-001-Fire-Warden-Register.docx`,
    docNumber: 'FEM-REG-001',
    title: 'Fire Warden Register',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Responsible Person]',
    isoRef: 'FSO 2005',
    sections: [
      {
        heading: 'Fire Warden Register — All Sites',
        content:
          'This register records all appointed fire wardens across all [Company Name] premises. It must be kept current and reviewed quarterly.',
      },
      {
        table: {
          headers: [
            'Name',
            'Site',
            'Area Responsible',
            'ICS Role',
            'Phone',
            'Training Date',
            'Expiry',
            'Cert Ref',
            'Active Y/N',
            'Deputy',
          ],
          rows: [
            [
              '[Name]',
              '[Site]',
              '[Floor/Zone]',
              '[Role]',
              '[Phone]',
              '[DD/MM/YY]',
              '[DD/MM/YY]',
              '[Ref]',
              'Y',
              '[Deputy]',
            ],
            ['', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: 'Register Maintenance',
        content:
          'Updated by: [H&S Manager]\nReview frequency: Quarterly\nLast updated: [DD/MM/YYYY]',
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-REG-002-PEEP-Register.docx`,
    docNumber: 'FEM-REG-002',
    title: 'PEEP Register',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Responsible Person]',
    isoRef: 'FSO 2005 | Equality Act 2010',
    sections: [
      {
        heading: 'PEEP Register — All Sites',
        content:
          'CONFIDENTIAL — This register contains personal information. Access restricted to H&S Manager, fire wardens (relevant sections only), and named assistants.\n\nThis register lists all current Personal Emergency Evacuation Plans.',
      },
      {
        table: {
          headers: [
            'Name',
            'Site',
            'Floor/Area',
            'Mobility Level',
            'Last Review',
            'Review Due',
            'Assistants Assigned',
            'Refuge Required',
            'Status',
          ],
          rows: [
            [
              '[Name]',
              '[Site]',
              '[Floor]',
              '[Level]',
              '[DD/MM/YY]',
              '[DD/MM/YY]',
              '[Names]',
              '[Y/N]',
              '[Active]',
            ],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: 'Register Maintenance',
        content:
          'Updated by: [H&S Manager]\nReview frequency: Quarterly\nLast updated: [DD/MM/YYYY]',
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-REG-003-Emergency-Equipment-Register.docx`,
    docNumber: 'FEM-REG-003',
    title: 'Emergency Equipment Register',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Responsible Person]',
    isoRef: 'FSO 2005 | BS 5306',
    sections: [
      {
        heading: 'Emergency Equipment Register — All Sites',
        content:
          'This register records all emergency equipment across all premises. Service schedules must be maintained current.',
      },
      {
        table: {
          headers: [
            'Equipment ID',
            'Type',
            'Location',
            'Installed',
            'Last Service',
            'Next Service',
            'Provider',
            'Last Inspect',
            'Result',
            'Defects',
            'Status',
          ],
          rows: [
            [
              '[ID]',
              '[Type]',
              '[Location]',
              '[DD/MM/YY]',
              '[DD/MM/YY]',
              '[DD/MM/YY]',
              '[Provider]',
              '[DD/MM/YY]',
              '[P/F]',
              '',
              '[OK]',
            ],
            ['', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', '', '', ''],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-REG-004-FRA-Register.docx`,
    docNumber: 'FEM-REG-004',
    title: 'Fire Risk Assessment Register',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Responsible Person]',
    isoRef: 'FSO 2005 | Building Safety Act 2022',
    sections: [
      {
        heading: 'Fire Risk Assessment Register — All Premises',
        content:
          'This register tracks all Fire Risk Assessments across all [Company Name] premises. FRAs must be reviewed at least annually.',
      },
      {
        table: {
          headers: [
            'Premises',
            'FRA Ref',
            'Date',
            'Risk Level',
            'Assessor',
            'Open Actions',
            'Next Review',
            'Status',
          ],
          rows: [
            [
              '[Premises]',
              '[FRA-YYYY-NNNN]',
              '[DD/MM/YY]',
              '[Level]',
              '[Name]',
              '[N]',
              '[DD/MM/YY]',
              '[Current/Overdue/Action Required]',
            ],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-REG-005-BCP-Register.docx`,
    docNumber: 'FEM-REG-005',
    title: 'BCP Register & Exercise Log',
    version: '1.0',
    owner: '[Business Continuity Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22301:2019',
    sections: [
      {
        heading: 'BCP Register & Exercise Log',
        content: 'This register tracks all Business Continuity Plans and their exercise history.',
      },
      {
        table: {
          headers: [
            'BCP Ref',
            'Title',
            'Version',
            'Status',
            'Scope',
            'Last Exercise',
            'Exercise Type',
            'Outcome',
            'Next Review',
          ],
          rows: [
            [
              '[BCP-YYYY-NNN]',
              '[Title]',
              '[1.0]',
              '[Active]',
              '[Scope]',
              '[DD/MM/YY]',
              '[Type]',
              '[Outcome]',
              '[DD/MM/YY]',
            ],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', '', ''],
          ],
        },
      },
    ],
  },

  // ═══ PLANS ═══
  {
    outputPath: `${outDir}/FEM-PLN-001-Emergency-Response-Plan.docx`,
    docNumber: 'FEM-PLN-001',
    title: 'Emergency Response Plan (Site-Specific Template)',
    version: '1.0',
    owner: '[Site Manager / Responsible Person]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22320:2018 | FSO 2005 | ISO 45001:2018 cl.8.2',
    sections: [
      { heading: '1. Premises Overview', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Premises Name', '[                    ]'],
            ['Address', '[                    ]'],
            ['Building Type', '[                    ]'],
            ['Floors', '[    ]'],
            ['Max Occupancy', '[    ]'],
            ['Responsible Person', '[Name, Phone, Email]'],
            ['Site Plan Reference', '[Document/Drawing Number]'],
          ],
        },
      },
      {
        heading: '2. Emergency Types Applicable to This Site',
        content: 'Tick applicable:',
        table: {
          headers: ['Emergency Type', 'Applicable Y/N', 'Specific Risks'],
          rows: [
            ['Fire', '', ''],
            ['Explosion', '', ''],
            ['Chemical Spill / Gas Leak', '', ''],
            ['Flood', '', ''],
            ['Structural Failure', '', ''],
            ['Power Failure', '', ''],
            ['Severe Weather', '', ''],
            ['Bomb Threat', '', ''],
            ['Other: [specify]', '', ''],
          ],
        },
      },
      { heading: '3. ICS Structure for This Site', content: '' },
      {
        table: {
          headers: ['ICS Role', 'Primary', 'Phone', 'Deputy', 'Phone'],
          rows: [
            ['Incident Commander', '', '', '', ''],
            ['Safety Officer', '', '', '', ''],
            ['Liaison Officer', '', '', '', ''],
            ['Operations Chief', '', '', '', ''],
            ['Fire Warden — Ground', '', '', '', ''],
            ['Fire Warden — Floor 1', '', '', '', ''],
            ['Fire Warden — Floor 2', '', '', '', ''],
            ['First Aider', '', '', '', ''],
            ['Assembly Point Warden', '', '', '', ''],
          ],
        },
      },
      { heading: '4. Assembly Points', content: '' },
      {
        table: {
          headers: ['Assembly Point', 'Location', 'Capacity', 'Accessible Y/N', 'Warden'],
          rows: [
            ['Primary', '[                    ]', '', '', ''],
            ['Secondary', '[                    ]', '', '', ''],
          ],
        },
      },
      {
        heading: '5. Evacuation Routes by Floor',
        content:
          '[Describe or reference floor plans showing evacuation routes, exit doors, refuge areas]',
      },
      { heading: '6. Emergency Equipment Locations', content: '' },
      {
        table: {
          headers: ['Equipment Type', 'Location', 'Notes'],
          rows: [
            ['Fire Panel', '', ''],
            ['Fire Extinguishers', '', ''],
            ['AED', '', ''],
            ['First Aid Kit', '', ''],
            ['Spill Kit', '', ''],
            ['Evacuation Chair', '', ''],
            ['Emergency Lighting', '', ''],
          ],
        },
      },
      { heading: '7. External Agency Contacts', content: '' },
      {
        table: {
          headers: ['Agency', 'Number', 'Notes'],
          rows: [
            ['Emergency Services', '999', ''],
            ['Local Fire Station', '[Number]', '[Station Name]'],
            ['Police (non-emergency)', '101', ''],
            ['HSE', '0345 300 9923', 'RIDDOR reporting'],
            ['Environment Agency', '0800 807060', 'Incident hotline'],
            ['Gas Emergency', '0800 111 999', ''],
            ['Electricity DNO', '[Number]', ''],
            ['Water Company', '[Number]', ''],
            ['Insurance', '[Number]', ''],
            ['Building Landlord', '[Number]', ''],
          ],
        },
      },
      { heading: '8. Utilities Isolation Points', content: '' },
      {
        table: {
          headers: ['Utility', 'Isolation Point Location', 'Responsible Person'],
          rows: [
            ['Gas', '', ''],
            ['Electricity (main)', '', ''],
            ['Water', '', ''],
            ['Ventilation/HVAC', '', ''],
          ],
        },
      },
      {
        heading: '9. Emergency Procedures by Type',
        content:
          '[Insert step-by-step procedures for each applicable emergency type from Section 2, referencing FEM-PRO-002 Emergency Response Procedure]',
      },
      {
        heading: '10. PEEP Summary',
        content: '[Insert summary of PEEPs for this premises, or reference FEM-REG-002]',
      },
      { heading: '11. Plan Maintenance', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Last Reviewed', '[DD/MM/YYYY]'],
            ['Reviewed By', '[                    ]'],
            ['Next Review Due', '[DD/MM/YYYY]'],
            ['Distribution', '[List of plan holders]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-PLN-002-Business-Continuity-Plan.docx`,
    docNumber: 'FEM-PLN-002',
    title: 'Business Continuity Plan (Full Template)',
    version: '1.0',
    owner: '[Business Continuity Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22301:2019',
    sections: [
      { heading: '1. Plan Overview', content: '' },
      {
        table: {
          headers: ['Field', 'Details'],
          rows: [
            ['Plan Reference', '[BCP-YYYY-NNN]'],
            ['Title', '[                    ]'],
            ['Version', '[1.0]'],
            ['Status', '[Draft / Approved / Active]'],
            ['Scope', '[                    ]'],
            ['Emergency Types Covered', '[List]'],
            ['Distribution List', '[Names and Roles]'],
          ],
        },
      },
      { heading: '2. Crisis Management Team', content: '' },
      {
        table: {
          headers: ['Role', 'Name', 'Phone (24hr)', 'Email', 'Deputy Name', 'Deputy Phone'],
          rows: [
            ['Crisis Team Lead', '', '', '', '', ''],
            ['Deputy Lead', '', '', '', '', ''],
            ['IT Recovery Lead', '', '', '', '', ''],
            ['HR Lead', '', '', '', '', ''],
            ['Communications Lead', '', '', '', '', ''],
            ['Finance Lead', '', '', '', '', ''],
            ['Operations Lead', '', '', '', '', ''],
          ],
        },
      },
      { heading: '3. Business Impact Analysis Summary', content: '' },
      {
        table: {
          headers: [
            'Critical Function',
            'RTO',
            'RPO',
            'Min Staff',
            'Dependencies',
            'Impact if Lost',
          ],
          rows: [
            [
              '[Function 1]',
              '[hours]',
              '[hours]',
              '[N]',
              '[Systems, suppliers]',
              '[Financial/operational/reputational]',
            ],
            ['[Function 2]', '', '', '', '', ''],
            ['[Function 3]', '', '', '', '', ''],
            ['[Function 4]', '', '', '', '', ''],
            ['[Function 5]', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '4. Recovery Strategies per Critical Function',
        content:
          '[For each critical function, describe: recovery strategy, resources required, step-by-step recovery actions, dependencies, success criteria]',
      },
      { heading: '5. Communication Plan', content: '' },
      {
        heading: '5.1 Internal (Staff)',
        level: 2,
        content: '[Communication method, cascade tree, template messages, frequency of updates]',
      },
      {
        heading: '5.2 External (Customers)',
        level: 2,
        content: '[Who communicates, template messages, channel, frequency]',
      },
      {
        heading: '5.3 Suppliers',
        level: 2,
        content: '[Key supplier contacts, notification process]',
      },
      {
        heading: '5.4 Media',
        level: 2,
        content: '[Spokesperson, holding statement, escalation, media centre]',
      },
      {
        heading: '5.5 Regulators',
        level: 2,
        content: '[Regulatory notification requirements, contacts, timeframes]',
      },
      { heading: '6. Activation and Deactivation', content: '' },
      {
        heading: '6.1 Activation Criteria',
        level: 2,
        content: '[Define what triggers BCP activation — reference FEM-PRO-005]',
      },
      { heading: '6.2 Activation Process', level: 2, content: '[Step-by-step activation process]' },
      {
        heading: '6.3 Deactivation Criteria',
        level: 2,
        content: '[Define when the BCP can be stood down]',
      },
      {
        heading: '7. IT and Systems Recovery',
        content:
          '[IT recovery approach: cloud failover, hot site, cold site, backup restoration procedures, RPO compliance, testing regime]',
      },
      { heading: '8. Alternative Working Arrangements', content: '' },
      {
        table: {
          headers: [
            'Alternative Site',
            'Location',
            'Capacity',
            'Ready In (hours)',
            'Contact',
            'Notes',
          ],
          rows: [
            ['[Site 1]', '', '', '', '', ''],
            ['[Site 2]', '', '', '', '', ''],
            ['Remote Working', 'N/A', '[N]', 'Immediate', '', ''],
          ],
        },
      },
      {
        heading: '9. Supply Chain Contingency',
        content:
          '[Critical suppliers, alternative suppliers, minimum stock levels, mutual aid agreements]',
      },
      {
        heading: '10. Financial Authorities During BC Event',
        content:
          '[Emergency procurement limits, authorised signatories, insurance contacts, emergency funding]',
      },
      { heading: '11. Invocation Log Template', content: '' },
      {
        table: {
          headers: ['Date/Time', 'Action', 'Decision', 'By Whom', 'Notes'],
          rows: [
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
          ],
        },
      },
      {
        heading: '12. Appendices',
        content:
          'Appendix A: Contact Directory\nAppendix B: Alternative Site Details\nAppendix C: Critical Supplier List\nAppendix D: IT Recovery Run Book\nAppendix E: Communication Templates',
      },
      { heading: 'Plan Approval', content: '' },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Prepared by', '[Name]', '', '[DD/MM/YYYY]'],
            ['Reviewed by', '[Name]', '', '[DD/MM/YYYY]'],
            ['Approved by', '[Managing Director]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
  {
    outputPath: `${outDir}/FEM-PLN-003-Annual-Fire-Safety-Plan.docx`,
    docNumber: 'FEM-PLN-003',
    title: 'Annual Fire Safety Management Plan',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'FSO 2005 | ISO 45001:2018',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This plan provides a 12-month schedule for all fire safety management activities across [Company Name] premises, ensuring systematic compliance with the Regulatory Reform (Fire Safety) Order 2005.',
      },
      { heading: '2. Annual Schedule', content: '' },
      {
        table: {
          headers: ['Month', 'Activity', 'Premises', 'Responsible Person', 'Status'],
          rows: [
            ['January', 'FRA Annual Review — [Premises 1]', '[Premises 1]', '[Name]', ''],
            ['January', 'Fire warden refresher training', 'All', '[Name]', ''],
            ['February', 'Equipment service — extinguishers', 'All', '[Provider]', ''],
            ['March', 'Evacuation Drill 1 (Announced)', '[Premises 1]', '[Name]', ''],
            ['March', 'PEEP reviews', 'All', '[Name]', ''],
            ['April', 'FRA Annual Review — [Premises 2]', '[Premises 2]', '[Name]', ''],
            ['May', 'Emergency lighting test (annual)', 'All', '[Provider]', ''],
            ['June', 'BCP Exercise (Tabletop)', 'All', '[BC Manager]', ''],
            ['June', 'Staff fire safety awareness training', 'All', '[Name]', ''],
            ['July', 'Fire alarm service (quarterly)', 'All', '[Provider]', ''],
            ['August', 'FRA action plan review', 'All', '[Name]', ''],
            ['September', 'Evacuation Drill 2 (Unannounced)', '[Premises 1]', '[Name]', ''],
            ['September', 'Evacuation Drill 1', '[Premises 2]', '[Name]', ''],
            ['October', 'Equipment service — AEDs', 'All', '[Provider]', ''],
            ['November', 'Emergency Response Plan review', 'All', '[Name]', ''],
            ['November', 'PEEP reviews (6-monthly)', 'All', '[Name]', ''],
            ['December', 'Management review of fire safety', 'All', '[MD]', ''],
            ['December', 'Annual fire safety report', 'All', '[H&S Manager]', ''],
          ],
        },
      },
      { heading: '3. Key Dates', content: '' },
      {
        table: {
          headers: ['Item', 'Frequency', 'Last Done', 'Next Due'],
          rows: [
            ['FRA Review', 'Annual (min)', '', ''],
            ['Evacuation Drill', '6-monthly (min)', '', ''],
            ['Warden Training', 'Annual refresher', '', ''],
            ['Equipment Service', 'Annual', '', ''],
            ['Fire Alarm Service', 'Quarterly', '', ''],
            ['Emergency Lighting', 'Monthly + Annual', '', ''],
            ['BCP Exercise', 'Annual (min)', '', ''],
            ['Staff Fire Training', 'Annual', '', ''],
            ['PEEP Review', 'Annual (min)', '', ''],
            ['Management Review', 'Annual', '', ''],
          ],
        },
      },
      { heading: '4. Fire Authority Liaison', content: '' },
      {
        table: {
          headers: ['Activity', 'Date', 'With Whom', 'Notes'],
          rows: [
            ['Annual liaison meeting', '', '', ''],
            ['Fire safety audit', '', '', ''],
            ['Site visit/inspection', '', '', ''],
          ],
        },
      },
      { heading: 'Plan Approval', content: '' },
      {
        table: {
          headers: ['Role', 'Name', 'Signature', 'Date'],
          rows: [
            ['Prepared by', '[H&S Manager]', '', '[DD/MM/YYYY]'],
            ['Approved by', '[Managing Director]', '', '[DD/MM/YYYY]'],
          ],
        },
      },
    ],
  },
];

// Generate all templates
let successCount = 0;
let failCount = 0;

for (const template of templates) {
  const configPath = path.join(outDir, `_temp_${path.basename(template.outputPath, '.docx')}.json`);
  try {
    fs.writeFileSync(configPath, JSON.stringify(template, null, 2));
    execSync(`node "${scriptPath}" "${configPath}"`, { stdio: 'pipe', timeout: 30000 });
    successCount++;
    console.log(`✅ Created: ${path.basename(template.outputPath)}`);
  } catch (err) {
    failCount++;
    console.error(`❌ Failed: ${path.basename(template.outputPath)} — ${err.message}`);
  } finally {
    try {
      fs.unlinkSync(configPath);
    } catch {}
  }
}

console.log(`\n═══════════════════════════════════════`);
console.log(`Templates created: ${successCount}/${templates.length}`);
console.log(`Failed: ${failCount}`);
console.log(`Output directory: ${outDir}`);
console.log(`═══════════════════════════════════════`);
