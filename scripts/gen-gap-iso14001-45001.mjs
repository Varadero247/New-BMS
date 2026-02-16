#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const templates = [
  // ============================================
  // ISO 14001:2015 — Environmental (7 templates)
  // ============================================
  {
    outputPath: 'docs/compliance-templates/policies/POL-011-Environmental-Policy.docx',
    docNumber: 'POL-011', title: 'Environmental Policy', version: '1.0',
    owner: '[Environmental Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO 14001:2015 Clause 5.2',
    sections: [
      { heading: '1. Purpose', content: 'To establish [COMPANY NAME]\'s commitment to environmental protection, pollution prevention, and continual improvement of environmental performance in accordance with ISO 14001:2015.' },
      { heading: '2. Policy Statement', content: '[COMPANY NAME] is committed to:\n\na) Protecting the environment, including prevention of pollution\nb) Fulfilling our compliance obligations (legal and other requirements)\nc) Continual improvement of the environmental management system to enhance environmental performance\nd) Minimising waste, emissions, and resource consumption\ne) Considering life cycle perspectives in our products and services\nf) Communicating this policy to all employees and making it available to interested parties' },
      { heading: '3. Objectives', bullets: [
        'Reduce carbon emissions by 30% by 2030 (against 2024 baseline)',
        'Achieve zero waste to landfill by 2028',
        'Reduce water consumption by 20% by 2027',
        'Ensure 100% compliance with environmental legislation and permits',
        'Integrate environmental considerations into procurement decisions'
      ]},
      { heading: '4. Responsibilities', content: 'Managing Director: Provides resources and leadership for the EMS\nEnvironmental Manager: Maintains the EMS, monitors compliance, reports performance\nAll Employees: Follow environmental procedures, report environmental concerns\nSite Managers: Implement environmental controls at operational level' },
      { heading: '5. Review', content: 'This policy is reviewed annually at management review and updated as necessary. It is communicated to all employees and made available to interested parties on request.\n\nSigned: _________________________ Date: ___/___/______\nManaging Director' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-049-Environmental-Aspects-Impacts.docx',
    docNumber: 'PRO-049', title: 'Environmental Aspects & Impacts Assessment Procedure', version: '1.0',
    owner: '[Environmental Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO 14001:2015 Clause 6.1.2',
    sections: [
      { heading: '1. Purpose', content: 'To identify environmental aspects of activities, products, and services, determine those with significant environmental impacts, and establish controls to manage them.' },
      { heading: '2. Scope', content: 'Applies to all activities, products, and services within the scope of the EMS, including those the organisation can control and those it can influence. Considers normal, abnormal, and emergency conditions.' },
      { heading: '3. Aspect Identification', content: 'Environmental aspects shall be identified considering:\n\na) Emissions to air (including GHG)\nb) Releases to water\nc) Releases to land\nd) Use of raw materials and natural resources\ne) Use of energy\nf) Generation of waste\ng) Noise, vibration, odour, dust\nh) Effects on biodiversity\n\nLife cycle stages considered: raw material acquisition, design, production, transport, use, end-of-life, disposal.' },
      { heading: '4. Significance Assessment', content: 'Each aspect is scored using the following criteria (1-5 scale):\n\n- Severity of impact\n- Probability of occurrence\n- Duration/frequency\n- Scale/extent\n- Reversibility\n- Regulatory sensitivity\n- Stakeholder concern\n\nSignificance Score = (Severity x 1.5) + (Probability x 1.5) + Duration + Extent + Reversibility + Regulatory + Stakeholder\n\nScore >= 15 = Significant aspect (requires operational controls and objectives)' },
      { heading: '5. Review', content: 'Aspects register reviewed annually, and whenever there are changes to activities, products, services, legal requirements, or following an environmental incident.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-050-Emergency-Preparedness-Environmental.docx',
    docNumber: 'PRO-050', title: 'Emergency Preparedness & Response — Environmental', version: '1.0',
    owner: '[Environmental Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO 14001:2015 Clause 8.2',
    sections: [
      { heading: '1. Purpose', content: 'To identify potential emergency situations that can have an environmental impact, plan response actions, mitigate environmental consequences, and periodically test the response arrangements.' },
      { heading: '2. Potential Emergency Situations', table: { headers: ['Scenario', 'Potential Environmental Impact', 'Likelihood', 'Response Plan'], rows: [
        ['Chemical/fuel spill', 'Soil/water contamination', 'Medium', 'Spill kit deployment, containment, notify EA'],
        ['Fire', 'Air emissions, firewater contamination', 'Low', 'Firewater containment, air monitoring'],
        ['Flood', 'Contaminated runoff, waste dispersal', 'Low', 'Elevated storage, flood barriers'],
        ['Equipment failure', 'Uncontrolled emissions/releases', 'Medium', 'Shutdown procedures, backup systems'],
        ['Loss of containment', 'Ground/water contamination', 'Low', 'Secondary containment, emergency isolation']
      ]}},
      { heading: '3. Response Actions', content: 'a) Raise alarm and ensure personnel safety\nb) Contain the environmental impact (spill kits, isolation valves, shut-off systems)\nc) Notify the Environmental Manager and site management immediately\nd) Notify external authorities as required (Environment Agency, local authority)\ne) Implement remediation actions\nf) Investigate root cause and implement corrective actions\ng) Update emergency plans based on lessons learned' },
      { heading: '4. Testing & Drills', content: 'Emergency response drills shall be conducted:\n- Spill response drill: Annually\n- Desktop exercise: Annually\n- Full emergency simulation: Every 2 years\n\nDrill results, lessons learned, and improvement actions shall be documented.' },
      { heading: '5. Records', content: 'Emergency Response Plans, Drill Records, Incident Reports, Corrective Actions. Retained for 7 years.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-039-Environmental-Aspects-Register.docx',
    docNumber: 'FRM-039', title: 'Environmental Aspects & Impacts Register', version: '1.0',
    owner: '[Environmental Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO 14001:2015 Clause 6.1.2',
    sections: [
      { heading: '1. Aspects Register', table: { headers: ['Ref', 'Activity/Product', 'Aspect', 'Impact', 'Condition', 'Sev', 'Prob', 'Dur', 'Ext', 'Rev', 'Reg', 'Stake', 'Score', 'Significant?', 'Control'], rows: [
        ['EA-001', 'Manufacturing', 'Energy consumption', 'GHG emissions / climate change', 'Normal', '', '', '', '', '', '', '', '', 'Y/N', ''],
        ['EA-002', 'Painting', 'VOC emissions', 'Air pollution', 'Normal', '', '', '', '', '', '', '', '', '', ''],
        ['EA-003', 'Waste disposal', 'Hazardous waste generation', 'Soil/water contamination', 'Normal', '', '', '', '', '', '', '', '', '', ''],
        ['EA-004', 'Transport', 'Fuel consumption', 'Air pollution / resource depletion', 'Normal', '', '', '', '', '', '', '', '', '', ''],
        ['EA-005', 'Chemical storage', 'Potential spill', 'Soil/water contamination', 'Emergency', '', '', '', '', '', '', '', '', '', '']
      ]}},
      { heading: '2. Scoring Guide', content: 'Each criterion scored 1-5:\n1 = Negligible, 2 = Minor, 3 = Moderate, 4 = Major, 5 = Severe\n\nSignificance threshold: Score >= 15' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-032-Waste-Management-Register.docx',
    docNumber: 'REG-032', title: 'Waste Management Register', version: '1.0',
    owner: '[Environmental Manager]', approvedBy: '[Site Manager]', isoRef: 'ISO 14001:2015 Clause 8.1',
    sections: [
      { heading: '1. Waste Stream Register', table: { headers: ['Waste Code', 'Description', 'Classification', 'Source', 'Storage Location', 'Carrier', 'Disposal Facility', 'Disposal Method', 'Quarterly Volume'], rows: [
        ['20 03 01', 'Mixed municipal waste', 'Non-hazardous', 'Offices/canteen', 'Waste compound', '[Carrier name]', '[Facility name]', 'Recycling/landfill', ''],
        ['15 01 01', 'Paper/cardboard packaging', 'Non-hazardous', 'Warehouse', 'Recycling skip', '', '', 'Recycling', ''],
        ['13 02 05*', 'Mineral-based engine oils', 'Hazardous', 'Workshop', 'Bunded store', '', '', 'Recovery', ''],
        ['16 06 01*', 'Lead batteries', 'Hazardous', 'Maintenance', 'Battery store', '', '', 'Recycling', ''],
        ['17 04 05', 'Scrap metal', 'Non-hazardous', 'Production', 'Skip', '', '', 'Recycling', '']
      ]}},
      { heading: '2. Waste Transfer Notes', content: 'Non-hazardous waste: Retain waste transfer notes for minimum 2 years\nHazardous waste: Retain consignment notes for minimum 3 years\nAll waste carriers must hold a valid waste carrier licence\nAll disposal facilities must hold appropriate environmental permits' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/plans/PLN-007-Environmental-Objectives.docx',
    docNumber: 'PLN-007', title: 'Environmental Objectives & Targets Plan', version: '1.0',
    owner: '[Environmental Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO 14001:2015 Clause 6.2',
    sections: [
      { heading: '1. Environmental Objectives', table: { headers: ['Ref', 'Objective', 'Target', 'Baseline', 'KPI', 'Owner', 'Due Date', 'Status'], rows: [
        ['EO-01', 'Reduce Scope 1+2 carbon emissions', '-15% vs 2024', '500 tCO2e', 'Annual tCO2e', 'Env Manager', '31/12/2026', 'In Progress'],
        ['EO-02', 'Reduce general waste to landfill', '<5% of total waste', '12%', '% waste to landfill', 'Facilities', '31/12/2026', 'In Progress'],
        ['EO-03', 'Reduce water consumption', '-10% vs 2024', '5,000 m³/yr', 'Annual m³', 'Env Manager', '31/12/2026', 'Planned'],
        ['EO-04', 'Zero environmental incidents', '0 reportable incidents', '2 in 2024', 'Incident count', 'All Managers', '31/12/2026', 'In Progress'],
        ['EO-05', 'Improve recycling rate', '>80% recycling', '65%', '% recycled', 'Facilities', '31/12/2026', 'Planned']
      ]}},
      { heading: '2. Action Plans', table: { headers: ['Objective', 'Action', 'Resource', 'Responsible', 'Timeline'], rows: [
        ['EO-01', 'LED lighting upgrade across all sites', '£25,000 capex', 'Facilities', 'Q2 2026'],
        ['EO-01', 'EV charging points for fleet', '£15,000 capex', 'Fleet Manager', 'Q3 2026'],
        ['EO-02', 'Waste segregation training for all staff', 'Training time', 'Env Manager', 'Q1 2026'],
        ['EO-03', 'Install water meters on key processes', '£3,000 capex', 'Maintenance', 'Q1 2026'],
        ['EO-05', 'Introduce closed-loop recycling for key materials', 'Supplier negotiation', 'Procurement', 'Q2 2026']
      ]}},
      { heading: '3. Review', content: 'Progress reviewed monthly by Environmental Manager, reported quarterly to management. Full review at annual management review meeting.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/reports/RPT-007-Environmental-Performance.docx',
    docNumber: 'RPT-007', title: 'Environmental Performance Report', version: '1.0',
    owner: '[Environmental Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO 14001:2015 Clause 9.1',
    sections: [
      { heading: '1. Report Details', table: { headers: ['Field', 'Detail'], rows: [
        ['Report Period', '[YYYY]'], ['Prepared By', '[Environmental Manager]'], ['Date', '[DD/MM/YYYY]']
      ]}},
      { heading: '2. Environmental KPIs', table: { headers: ['KPI', 'Unit', 'Target', 'Q1', 'Q2', 'Q3', 'Q4', 'Annual', 'vs Target'], rows: [
        ['Scope 1 emissions', 'tCO2e', '', '', '', '', '', '', ''],
        ['Scope 2 emissions', 'tCO2e', '', '', '', '', '', '', ''],
        ['Total energy consumption', 'MWh', '', '', '', '', '', '', ''],
        ['Water consumption', 'm³', '', '', '', '', '', '', ''],
        ['Total waste generated', 'tonnes', '', '', '', '', '', '', ''],
        ['Waste recycled', '%', '', '', '', '', '', '', ''],
        ['Environmental incidents', 'count', '0', '', '', '', '', '', ''],
        ['Compliance obligations met', '%', '100%', '', '', '', '', '', '']
      ]}},
      { heading: '3. Significant Aspects Update', content: '[Summary of changes to significant environmental aspects, new aspects identified, aspects resolved]' },
      { heading: '4. Compliance Status', content: '[Summary of compliance with environmental permits, licences, and legal requirements. Any non-compliances, enforcement actions, or near-misses]' },
      { heading: '5. Recommendations', content: '[Recommendations for management review: resource needs, process changes, new objectives, training requirements]' }
    ]
  },
  // ============================================
  // ISO 45001:2018 — OH&S (8 templates)
  // ============================================
  {
    outputPath: 'docs/compliance-templates/policies/POL-012-OHS-Policy.docx',
    docNumber: 'POL-012', title: 'Occupational Health & Safety Policy', version: '1.0',
    owner: '[Health & Safety Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO 45001:2018 Clause 5.2',
    sections: [
      { heading: '1. Policy Statement', content: '[COMPANY NAME] is committed to providing a safe and healthy workplace for all workers, contractors, and visitors. We recognise that occupational health and safety is an integral part of our business operations.' },
      { heading: '2. Commitments', bullets: [
        'Provide safe and healthy working conditions for the prevention of work-related injury and ill health',
        'Eliminate hazards and reduce OH&S risks using the hierarchy of controls',
        'Comply with all applicable OH&S legal requirements and other requirements',
        'Consult and encourage participation of workers and their representatives',
        'Continually improve the OH&S management system and OH&S performance',
        'Provide adequate resources, training, and information to fulfil this policy',
        'Investigate all incidents, near-misses, and hazardous conditions',
        'Set and monitor measurable OH&S objectives'
      ]},
      { heading: '3. Responsibilities', content: 'Senior Management: Provide leadership, resources, and accountability for OH&S\nHealth & Safety Manager: Maintain the OH&S MS, advise on compliance, monitor performance\nLine Managers: Implement OH&S controls, conduct risk assessments, investigate incidents\nAll Workers: Follow safe systems of work, report hazards, use PPE as required, participate in consultation' },
      { heading: '4. Communication', content: 'This policy is communicated to all workers and made available to interested parties including contractors, visitors, and regulatory authorities.' },
      { heading: '5. Review', content: 'Reviewed annually at management review and following any significant incident, change in legislation, or organisational change.\n\nSigned: _________________________ Date: ___/___/______\nManaging Director' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-051-Hazard-ID-Risk-Assessment.docx',
    docNumber: 'PRO-051', title: 'Hazard Identification & Risk Assessment Procedure', version: '1.0',
    owner: '[Health & Safety Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO 45001:2018 Clause 6.1.2',
    sections: [
      { heading: '1. Purpose', content: 'To establish a systematic process for ongoing proactive identification of hazards, assessment of OH&S risks and opportunities, and determination of controls using the hierarchy of controls.' },
      { heading: '2. Hazard Identification', content: 'Hazard identification shall consider:\n\na) How work is organised, social factors, leadership, culture\nb) Routine and non-routine activities and situations\nc) Past incidents (internal and industry)\nd) Potential emergency situations\ne) People — including workers, contractors, visitors, and vulnerable persons\nf) Physical hazards, chemical hazards, biological hazards, ergonomic hazards, psychosocial hazards\ng) Changes in processes, tools, equipment, working conditions, or knowledge' },
      { heading: '3. Risk Assessment', content: 'Risk = Likelihood x Severity\n\nLikelihood: 1 (Very unlikely) to 5 (Almost certain)\nSeverity: 1 (Negligible) to 5 (Fatality/permanent disability)\n\nRisk Rating:\n1-4 = Low (monitor)\n5-9 = Medium (controls required)\n10-15 = High (immediate action required)\n16-25 = Critical (stop work, senior management decision required)' },
      { heading: '4. Hierarchy of Controls', content: '1. Elimination — remove the hazard completely\n2. Substitution — replace with less hazardous alternative\n3. Engineering controls — isolate people from the hazard\n4. Administrative controls — change the way people work\n5. PPE — protect the individual (last resort)\n\nControls shall be applied in this order of preference. PPE shall only be used as a last resort or as an interim measure while higher-order controls are being implemented.' },
      { heading: '5. Review Frequency', content: 'Risk assessments shall be reviewed:\n- Annually as a minimum\n- Following any incident or near-miss\n- When there are changes to processes, equipment, or working conditions\n- When new hazards are identified\n- Following changes in legislation or guidance' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-052-Incident-Investigation.docx',
    docNumber: 'PRO-052', title: 'Incident Investigation Procedure', version: '1.0',
    owner: '[Health & Safety Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO 45001:2018 Clause 10.2',
    sections: [
      { heading: '1. Purpose', content: 'To ensure all incidents, near-misses, and hazardous conditions are reported, investigated, root causes identified, and corrective actions implemented to prevent recurrence.' },
      { heading: '2. Definitions', content: 'Incident: An occurrence arising out of, or in the course of, work that could or does result in injury or ill health.\nNear-miss: An incident where no injury or ill health occurred, but had the potential to do so.\nHazardous condition: An unsafe condition or practice observed that could lead to an incident.' },
      { heading: '3. Reporting', content: 'a) All incidents and near-misses must be reported immediately to the line manager\nb) Serious/major incidents: notify H&S Manager and senior management within 1 hour\nc) RIDDOR reportable incidents: notify the HSE within the statutory timeframe\nd) All reports logged in the Incident Register using form FRM-041\ne) Scene preserved for investigation (where safe to do so)' },
      { heading: '4. Investigation Process', content: '1. Secure the scene and ensure immediate safety\n2. Provide first aid / medical treatment as needed\n3. Gather evidence: photographs, witness statements, CCTV, documents\n4. Establish timeline and sequence of events\n5. Identify immediate causes (unsafe acts and unsafe conditions)\n6. Determine root causes (use 5-Whys, fishbone, fault tree analysis)\n7. Identify corrective actions to prevent recurrence\n8. Assign actions with owners and due dates\n9. Monitor implementation and verify effectiveness\n10. Share lessons learned across the organisation' },
      { heading: '5. Investigation Timescales', table: { headers: ['Severity', 'Investigation Start', 'Investigation Complete', 'Actions Due'], rows: [
        ['Fatality / specified injury', 'Immediately', '48 hours', 'ASAP — no later than 1 week'],
        ['Major injury / dangerous occurrence', 'Within 4 hours', '5 working days', '2 weeks'],
        ['Minor injury', 'Within 24 hours', '10 working days', '4 weeks'],
        ['Near-miss', 'Within 48 hours', '10 working days', '4 weeks'],
        ['Hazardous condition', 'Within 48 hours', '5 working days', '2 weeks']
      ]}},
      { heading: '6. Records', content: 'Incident Report Forms (FRM-041), Investigation Reports, Witness Statements, Photographs, CAPA records. Retained for 40 years (occupational health) or 7 years (general).' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-053-Worker-Consultation-Participation.docx',
    docNumber: 'PRO-053', title: 'Worker Consultation & Participation Procedure', version: '1.0',
    owner: '[Health & Safety Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO 45001:2018 Clause 5.4',
    sections: [
      { heading: '1. Purpose', content: 'To establish processes for worker consultation and participation in the development, planning, implementation, performance evaluation, and improvement of the OH&S management system.' },
      { heading: '2. Consultation vs Participation', content: 'Consultation (seeking views before decisions): Required for all workers on OH&S policy, objectives, legal compliance, roles, hazard identification, controls, change management, and contractor management.\n\nParticipation (involvement in decision-making): Required for non-managerial workers on hazard identification, risk assessment, actions to control risks, competence/training needs, incident investigation, and consultation arrangements.' },
      { heading: '3. Mechanisms', table: { headers: ['Mechanism', 'Frequency', 'Participants', 'Records'], rows: [
        ['Health & Safety Committee', 'Monthly', 'Worker reps + management', 'Meeting minutes'],
        ['Toolbox talks', 'Weekly', 'All workers in area', 'Attendance register'],
        ['Safety walkarounds', 'Monthly', 'H&S Manager + worker reps', 'Inspection reports'],
        ['Suggestion scheme', 'Ongoing', 'All workers', 'Suggestion log'],
        ['Risk assessment involvement', 'Per assessment', 'Workers in affected area', 'RA sign-off sheet'],
        ['Annual safety survey', 'Annually', 'All workers (anonymous)', 'Survey results']
      ]}},
      { heading: '4. Barriers to Participation', content: 'The organisation shall identify and remove barriers to participation including:\n- Language barriers (provide translated materials)\n- Literacy barriers (verbal briefings, visual aids)\n- Shift patterns (ensure all shifts included)\n- Reprisals or consequences for raising concerns (whistleblowing protection)\n- Lack of time (dedicated time for H&S participation)' },
      { heading: '5. Records', content: 'Committee minutes, consultation records, suggestion log, survey results. Retained for 5 years.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-040-Risk-Assessment.docx',
    docNumber: 'FRM-040', title: 'OH&S Risk Assessment Form', version: '1.0',
    owner: '[Health & Safety Manager]', approvedBy: '[Site Manager]', isoRef: 'ISO 45001:2018 Clause 6.1.2',
    sections: [
      { heading: '1. Assessment Details', table: { headers: ['Field', 'Detail'], rows: [
        ['RA Reference', '[RA-YYYY-NNN]'], ['Activity/Area', ''], ['Assessor(s)', ''],
        ['Date of Assessment', '[DD/MM/YYYY]'], ['Review Date', '[DD/MM/YYYY]'], ['Persons at Risk', '']
      ]}},
      { heading: '2. Risk Assessment', table: { headers: ['#', 'Hazard', 'Who at Risk', 'Existing Controls', 'L', 'S', 'Risk', 'Additional Controls Required', 'L', 'S', 'Residual Risk', 'Action Owner', 'Due Date'], rows: [
        ['1', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['2', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['3', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['4', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['5', '', '', '', '', '', '', '', '', '', '', '', '']
      ]}},
      { heading: '3. Risk Matrix', table: { headers: ['', 'Negligible (1)', 'Minor (2)', 'Moderate (3)', 'Major (4)', 'Fatal (5)'], rows: [
        ['Almost Certain (5)', '5', '10', '15', '20', '25'],
        ['Likely (4)', '4', '8', '12', '16', '20'],
        ['Possible (3)', '3', '6', '9', '12', '15'],
        ['Unlikely (2)', '2', '4', '6', '8', '10'],
        ['Very Unlikely (1)', '1', '2', '3', '4', '5']
      ]}},
      { heading: '4. Sign-Off', content: 'Assessed by: _________________________ Date: ___/___/______\nReviewed by: _________________________ Date: ___/___/______\nWorkers consulted: _________________________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-041-Incident-Near-Miss-Report.docx',
    docNumber: 'FRM-041', title: 'Incident / Near-Miss Report Form', version: '1.0',
    owner: '[Health & Safety Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO 45001:2018 Clause 10.2',
    sections: [
      { heading: '1. Incident Details', table: { headers: ['Field', 'Detail'], rows: [
        ['Report Number', '[INC-YYYY-NNN]'], ['Date & Time of Incident', ''], ['Location', ''],
        ['Reported By', ''], ['Date Reported', ''], ['Type', 'Injury / Ill Health / Near-Miss / Dangerous Occurrence / Property Damage']
      ]}},
      { heading: '2. Person(s) Involved', table: { headers: ['Name', 'Role', 'Employer', 'Injury/Ill Health', 'Treatment Given', 'Time Lost'], rows: [
        ['', '', 'Employee / Contractor / Visitor', '', 'First Aid / Hospital / None', 'Yes / No — days: ___'],
        ['', '', '', '', '', '']
      ]}},
      { heading: '3. Description of Incident', content: '[Detailed description of what happened, including events leading up to the incident, the incident itself, and immediate aftermath]\n\nWitnesses:\nName: _________________________ Contact: _________________________\nName: _________________________ Contact: _________________________' },
      { heading: '4. Immediate Actions Taken', content: '[What was done immediately to make the area safe, treat injuries, and prevent further harm]' },
      { heading: '5. RIDDOR Reportable?', content: 'Yes / No\nIf Yes — Reference: _____________ Reported by: _____________ Date: ___/___/______' },
      { heading: '6. Investigation (H&S Manager)', content: 'Root Cause(s):\n[5-Whys or equivalent analysis]\n\nCorrective Actions:\n[Actions to prevent recurrence]\n\nTarget Completion Date: ___/___/______\nActions Verified Effective: Yes / No — Date: ___/___/______\n\nInvestigated by: _________________________ Date: ___/___/______' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-033-Hazard-Register.docx',
    docNumber: 'REG-033', title: 'Hazard Register', version: '1.0',
    owner: '[Health & Safety Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO 45001:2018 Clause 6.1.2',
    sections: [
      { heading: '1. Hazard Register', table: { headers: ['Hazard ID', 'Area/Activity', 'Hazard Description', 'Potential Consequence', 'Risk Rating (pre-control)', 'Controls in Place', 'Residual Risk', 'Owner', 'Review Date'], rows: [
        ['HAZ-001', 'Workshop', 'Moving machinery parts', 'Crush/amputation injury', 'High (15)', 'Guarding, LOTO, training', 'Medium (6)', 'Workshop Manager', ''],
        ['HAZ-002', 'Warehouse', 'Working at height (racking)', 'Falls from height', 'High (16)', 'MEWP, harnesses, inspection', 'Medium (8)', 'Warehouse Manager', ''],
        ['HAZ-003', 'Office', 'DSE/ergonomic', 'Musculoskeletal disorder', 'Medium (9)', 'DSE assessment, adjustable furniture', 'Low (4)', 'Office Manager', ''],
        ['HAZ-004', 'All areas', 'Slips, trips, falls', 'Fractures, sprains', 'Medium (8)', 'Housekeeping, signage, footwear', 'Low (4)', 'All Managers', ''],
        ['HAZ-005', 'Chemical store', 'Hazardous substances', 'Chemical burns, inhalation', 'High (12)', 'COSHH assessments, PPE, ventilation', 'Medium (6)', 'Lab Manager', '']
      ]}},
      { heading: '2. Review Schedule', content: 'Full register reviewed annually. Individual entries reviewed following incidents, near-misses, changes, or new hazards identified.' }
    ]
  },
  {
    outputPath: 'docs/compliance-templates/plans/PLN-008-OHS-Objectives.docx',
    docNumber: 'PLN-008', title: 'OH&S Objectives & Programme Plan', version: '1.0',
    owner: '[Health & Safety Manager]', approvedBy: '[Managing Director]', isoRef: 'ISO 45001:2018 Clause 6.2',
    sections: [
      { heading: '1. OH&S Objectives', table: { headers: ['Ref', 'Objective', 'KPI', 'Target', 'Baseline', 'Owner', 'Due Date', 'Status'], rows: [
        ['SO-01', 'Reduce Lost Time Injury Frequency Rate', 'LTIFR', '<2.0', '3.5', 'H&S Manager', '31/12/2026', 'In Progress'],
        ['SO-02', 'Increase near-miss reporting', 'Reports per month', '>20', '8', 'All Managers', '30/06/2026', 'In Progress'],
        ['SO-03', 'Complete all outstanding risk assessments', '% RA current', '100%', '75%', 'H&S Manager', '31/03/2026', 'In Progress'],
        ['SO-04', 'Reduce manual handling injuries', 'MH injuries/year', '0', '4', 'Operations', '31/12/2026', 'In Progress'],
        ['SO-05', 'Achieve 100% H&S induction compliance', '% inducted', '100%', '85%', 'HR/H&S', '31/03/2026', 'In Progress']
      ]}},
      { heading: '2. Action Plans', table: { headers: ['Objective', 'Action', 'Resource', 'Responsible', 'Timeline'], rows: [
        ['SO-01', 'Behavioural safety observation programme', 'Training budget', 'H&S Manager', 'Q1 2026'],
        ['SO-02', 'Launch near-miss reporting app + incentive scheme', '£5,000 + IT support', 'H&S Manager', 'Q1 2026'],
        ['SO-03', 'Risk assessment blitz — dedicated team for 2 weeks', 'H&S team + managers', 'H&S Manager', 'Q1 2026'],
        ['SO-04', 'Mechanical handling aids for top 5 manual tasks', '£12,000 capex', 'Operations', 'Q2 2026'],
        ['SO-05', 'Online induction module + tracking system', 'LMS budget', 'HR Manager', 'Q1 2026']
      ]}},
      { heading: '3. Review', content: 'Progress reviewed monthly at H&S Committee. Reported to management review quarterly. Objectives updated annually or following significant incidents/changes.' }
    ]
  }
];

async function main() {
  const tmpDir = '/tmp/gap-iso14001-45001-configs';
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log(`Generating ${templates.length} ISO 14001 + ISO 45001 gap-filling templates...`);
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
