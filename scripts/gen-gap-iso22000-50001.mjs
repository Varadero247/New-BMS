#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const templates = [
  // ============================================
  // ISO 22000:2018 — Food Safety (12 templates)
  // ============================================
  {
    outputPath: 'docs/compliance-templates/policies/POL-013-Food-Safety-Policy.docx',
    docNumber: 'POL-013',
    title: 'Food Safety Policy',
    version: '1.0',
    owner: '[Food Safety Team Leader]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22000:2018 Clause 5.2',
    sections: [
      {
        heading: '1. Policy Statement',
        content:
          '[COMPANY NAME] is committed to producing safe food products that meet customer expectations and comply with all applicable food safety legislation and regulatory requirements.',
      },
      {
        heading: '2. Commitments',
        bullets: [
          'Ensure food safety through an effective Food Safety Management System based on ISO 22000:2018 and HACCP principles',
          'Comply with all applicable food safety legislation, regulatory requirements, and mutually agreed customer food safety requirements',
          'Maintain and improve prerequisite programmes (PRPs) to provide a hygienic operating environment',
          'Identify and control all reasonably foreseeable food safety hazards through HACCP analysis',
          'Ensure effective internal and external communication on food safety matters',
          'Continually improve the effectiveness of the FSMS through management review, internal audit, and verification',
          'Provide adequate resources, training, and infrastructure to maintain food safety',
          'Ensure traceability of all raw materials and finished products throughout the supply chain',
        ],
      },
      {
        heading: '3. Responsibilities',
        content:
          'Managing Director: Overall accountability for food safety, resource provision\nFood Safety Team Leader: Maintains the FSMS, leads the HACCP team, reports to management\nProduction Manager: Implements food safety controls at operational level\nQuality Manager: Verification activities, internal audits, trend analysis\nAll Employees: Follow food safety procedures, report food safety concerns immediately',
      },
      {
        heading: '4. Review',
        content:
          'This policy is reviewed annually at management review and updated as necessary.\n\nSigned: _________________________ Date: ___/___/______\nManaging Director',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-054-HACCP-Plan-Development.docx',
    docNumber: 'PRO-054',
    title: 'HACCP Plan Development Procedure',
    version: '1.0',
    owner: '[Food Safety Team Leader]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22000:2018 Clause 8.5.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To define the process for developing, implementing, maintaining, and updating HACCP plans in accordance with Codex Alimentarius principles and ISO 22000:2018.',
      },
      {
        heading: '2. HACCP Team',
        content:
          'The HACCP team shall have multidisciplinary expertise including food science/technology, microbiology, production, engineering, quality, and relevant regulatory knowledge. External expertise may be used where internal competence is insufficient.',
      },
      {
        heading: '3. Preliminary Steps',
        content:
          '1. Describe the product (composition, processing, packaging, storage, shelf life, intended use, distribution)\n2. Identify intended use and consumers (including vulnerable groups)\n3. Construct flow diagrams for all products/processes\n4. On-site verification of flow diagrams\n5. List all potential hazards associated with each step',
      },
      {
        heading: '4. HACCP Principles',
        content:
          'Principle 1: Conduct a hazard analysis (biological, chemical, physical, allergen, radiological)\nPrinciple 2: Determine Critical Control Points (CCPs) using the CCP decision tree\nPrinciple 3: Establish critical limits for each CCP (measurable, science-based)\nPrinciple 4: Establish CCP monitoring procedures (what, how, frequency, who)\nPrinciple 5: Establish corrective actions when monitoring indicates deviation\nPrinciple 6: Establish verification procedures (validation, review, testing)\nPrinciple 7: Establish documentation and record keeping',
      },
      {
        heading: '5. HACCP Plan Review',
        content:
          'The HACCP plan shall be reviewed and updated:\n- Annually as a minimum\n- When there are changes to products, processes, raw materials, equipment, or premises\n- Following a food safety incident or product recall\n- When new hazard information becomes available\n- Following regulatory changes',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-055-Prerequisite-Programme.docx',
    docNumber: 'PRO-055',
    title: 'Prerequisite Programme (PRP) Procedure',
    version: '1.0',
    owner: '[Food Safety Team Leader]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22000:2018 Clause 8.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To establish and maintain prerequisite programmes (PRPs) that provide the basic conditions and activities necessary to maintain a hygienic environment for the production of safe food.',
      },
      {
        heading: '2. PRP Categories',
        table: {
          headers: ['PRP', 'Key Requirements', 'Monitoring', 'Frequency'],
          rows: [
            [
              'Building & facilities',
              'Layout, construction, maintenance, pest proofing',
              'Facility inspection',
              'Monthly',
            ],
            [
              'Equipment',
              'Hygienic design, maintenance, calibration',
              'Maintenance records',
              'Per schedule',
            ],
            [
              'Cleaning & sanitation',
              'Cleaning schedules, validated methods, chemical control',
              'ATP swabbing, visual',
              'Per schedule',
            ],
            [
              'Pest management',
              'Integrated pest management, contractor service',
              'Pest activity reports',
              'Monthly/quarterly',
            ],
            [
              'Personal hygiene',
              'Handwashing, clothing, illness reporting, visitor control',
              'Hygiene audits',
              'Weekly',
            ],
            [
              'Waste management',
              'Segregation, removal frequency, food vs non-food waste',
              'Waste log',
              'Daily',
            ],
            [
              'Water & air',
              'Potable water testing, air filtration where required',
              'Lab analysis',
              'Quarterly',
            ],
            [
              'Allergen management',
              'Segregation, labelling, cleaning validation, supplier controls',
              'Allergen audits',
              'Monthly',
            ],
            [
              'Storage & transport',
              'Temperature control, FIFO, vehicle hygiene',
              'Temperature logs',
              'Continuous',
            ],
            [
              'Supplier control',
              'Approval, specifications, incoming inspection',
              'Supplier audits',
              'Annual',
            ],
          ],
        },
      },
      {
        heading: '3. Verification',
        content:
          'PRPs are verified through internal audits, environmental monitoring (swabbing), water testing, and management review. Non-conformities are addressed through the corrective action process.',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-056-Food-Safety-Verification.docx',
    docNumber: 'PRO-056',
    title: 'Food Safety Verification Procedure',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Food Safety Team Leader]',
    isoRef: 'ISO 22000:2018 Clause 8.8',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To define verification activities that confirm the FSMS, PRPs, and HACCP plan are implemented effectively, producing safe food consistently.',
      },
      {
        heading: '2. Verification Activities',
        table: {
          headers: ['Activity', 'Purpose', 'Method', 'Frequency', 'Responsible'],
          rows: [
            [
              'Internal audits',
              'FSMS compliance',
              'ISO 19011 audit methodology',
              'Bi-annual per area',
              'Quality Manager',
            ],
            [
              'CCP monitoring review',
              'CCP records complete and compliant',
              'Record review',
              'Daily',
              'Food Safety Team Leader',
            ],
            [
              'Product testing',
              'End-product meets specifications',
              'Microbiological/chemical analysis',
              'Per batch/weekly',
              'Lab Manager',
            ],
            [
              'Environmental monitoring',
              'Hygiene effectiveness',
              'Swab testing (Listeria, TVC)',
              'Weekly/monthly',
              'Quality',
            ],
            [
              'PRP verification',
              'PRPs effectively implemented',
              'Inspections and audits',
              'Monthly',
              'Quality',
            ],
            [
              'Supplier verification',
              'Incoming materials meet specs',
              'COA review, incoming testing',
              'Per delivery/quarterly',
              'Quality',
            ],
            [
              'HACCP plan review',
              'Plan current and effective',
              'Team review',
              'Annual + trigger-based',
              'HACCP Team',
            ],
          ],
        },
      },
      {
        heading: '3. Trend Analysis',
        content:
          'Verification data shall be analysed for trends. Adverse trends trigger investigation and corrective action before product safety is compromised.',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-057-Traceability.docx',
    docNumber: 'PRO-057',
    title: 'Traceability Procedure',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22000:2018 Clause 8.3',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To establish a traceability system that can identify the lot(s) of product and their relation to batches of raw materials, processing records, and delivery records — one step forward and one step back throughout the supply chain.',
      },
      {
        heading: '2. Traceability Requirements',
        content:
          'The system shall enable:\na) Identification of raw material suppliers and incoming batches (one step back)\nb) Linking of incoming materials to production batches through processing records\nc) Identification of all customers/destinations for each production batch (one step forward)\nd) Complete trace within 4 hours in the event of a recall\ne) Mock recalls conducted every 6 months to verify system effectiveness',
      },
      {
        heading: '3. Lot Identification',
        content:
          'Each production batch/lot shall be assigned a unique lot code that includes:\n- Production date\n- Production line\n- Sequential number\n\nFormat: [YYMMDD]-[LINE]-[NNN]\nExample: 260215-A-001',
      },
      {
        heading: '4. Mock Recall',
        content:
          'Mock recalls shall be conducted every 6 months (alternating forward and backward trace). Target: 100% trace within 4 hours. Results reported at management review.',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-042-CCP-Monitoring.docx',
    docNumber: 'FRM-042',
    title: 'CCP Monitoring Record Form',
    version: '1.0',
    owner: '[Food Safety Team Leader]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 22000:2018 Clause 8.5.4',
    sections: [
      {
        heading: '1. CCP Details',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['CCP Number', '[CCP-NNN]'],
            ['CCP Description', '[e.g., Cooking, Chilling, Metal Detection]'],
            ['Critical Limit', '[e.g., Core temp >= 75°C for 2 min]'],
            ['Monitoring Method', '[e.g., Probe thermometer]'],
            ['Monitoring Frequency', '[e.g., Every batch]'],
            ['Corrective Action if Deviation', '[e.g., Re-cook, hold and test, dispose]'],
          ],
        },
      },
      {
        heading: '2. Monitoring Log',
        table: {
          headers: [
            'Date',
            'Time',
            'Batch/Lot',
            'Reading',
            'Within Limit?',
            'Corrective Action',
            'Verified By',
          ],
          rows: [
            ['', '', '', '', 'Yes / No', '', ''],
            ['', '', '', '', '', '', ''],
            ['', '', '', '', '', '', ''],
            ['', '', '', '', '', '', ''],
            ['', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '3. Deviation Record',
        content:
          'If critical limit is exceeded:\n1. Isolate affected product\n2. Apply corrective action per HACCP plan\n3. Record details above\n4. Notify Food Safety Team Leader\n5. Assess affected product (release / rework / dispose)\n6. Investigate root cause\n\nSupervisor sign-off: _________________________ Date: ___/___/______',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-043-HACCP-Hazard-Analysis.docx',
    docNumber: 'FRM-043',
    title: 'HACCP Hazard Analysis Worksheet',
    version: '1.0',
    owner: '[Food Safety Team Leader]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22000:2018 Clause 8.5.2',
    sections: [
      {
        heading: '1. Product/Process',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Product Name', ''],
            ['HACCP Plan Ref', ''],
            ['Date', ''],
            ['HACCP Team', ''],
          ],
        },
      },
      {
        heading: '2. Hazard Analysis',
        table: {
          headers: [
            'Step',
            'Hazard (B/C/P/A)',
            'Description',
            'Cause',
            'Likelihood (1-5)',
            'Severity (1-5)',
            'Significance',
            'Control Measure',
            'CCP? (Y/N)',
          ],
          rows: [
            ['Receiving', '', '', '', '', '', '', '', ''],
            ['Storage', '', '', '', '', '', '', '', ''],
            ['Preparation', '', '', '', '', '', '', '', ''],
            ['Processing', '', '', '', '', '', '', '', ''],
            ['Packaging', '', '', '', '', '', '', '', ''],
            ['Storage (finished)', '', '', '', '', '', '', '', ''],
            ['Distribution', '', '', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '3. Legend',
        content:
          'B = Biological, C = Chemical, P = Physical, A = Allergen\nSignificance = Likelihood x Severity. Score >= 10 = Significant hazard requiring CCP or OPRP consideration.',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-044-Allergen-Control-Checklist.docx',
    docNumber: 'FRM-044',
    title: 'Allergen Control Checklist',
    version: '1.0',
    owner: '[Food Safety Team Leader]',
    approvedBy: '[Quality Manager]',
    isoRef: 'ISO 22000:2018 Clause 8.5.1',
    sections: [
      {
        heading: '1. Audit Details',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Date', ''],
            ['Area/Line', ''],
            ['Auditor', ''],
            ['Production Run', ''],
          ],
        },
      },
      {
        heading: '2. Allergen Control Checks',
        table: {
          headers: ['#', 'Check Point', 'Compliant?', 'Evidence/Comments'],
          rows: [
            [
              '1',
              'Allergen-containing ingredients clearly identified and segregated in storage',
              'Y/N/NA',
              '',
            ],
            [
              '2',
              'Production schedule follows allergen-to-non-allergen sequence (or validated cleaning between)',
              'Y/N/NA',
              '',
            ],
            [
              '3',
              'Allergen changeover cleaning completed and verified (visual + ATP/swab)',
              'Y/N/NA',
              '',
            ],
            ['4', 'Staff aware of allergens present on current production run', 'Y/N/NA', ''],
            [
              '5',
              'Correct labels applied matching product formulation (allergen declaration checked)',
              'Y/N/NA',
              '',
            ],
            [
              '6',
              'No open allergen-containing ingredients in non-allergen production areas',
              'Y/N/NA',
              '',
            ],
            ['7', 'Dedicated utensils/equipment for allergen lines (colour-coded)', 'Y/N/NA', ''],
            [
              '8',
              'Supplier specifications confirm allergen status of incoming ingredients',
              'Y/N/NA',
              '',
            ],
            [
              '9',
              'Precautionary allergen labelling (PAL/may contain) applied where risk identified',
              'Y/N/NA',
              '',
            ],
            [
              '10',
              'Staff have received allergen awareness training within last 12 months',
              'Y/N/NA',
              '',
            ],
          ],
        },
      },
      {
        heading: '3. Actions Required',
        content:
          'Non-conformances:\n[Details and corrective actions]\n\nAuditor: _________________________ Date: ___/___/______',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-034-CCP-Register.docx',
    docNumber: 'REG-034',
    title: 'CCP Register',
    version: '1.0',
    owner: '[Food Safety Team Leader]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22000:2018 Clause 8.5.2',
    sections: [
      {
        heading: '1. CCP Summary',
        table: {
          headers: [
            'CCP #',
            'Process Step',
            'Hazard Controlled',
            'Critical Limit',
            'Monitoring Method',
            'Frequency',
            'Corrective Action',
            'Verification',
            'Records',
          ],
          rows: [
            [
              'CCP-001',
              'Cooking',
              'Survival of pathogens (B)',
              '>=75°C core for 2 min',
              'Probe thermometer',
              'Every batch',
              'Re-cook or dispose',
              'Daily record review, thermometer cal.',
              'FRM-042',
            ],
            [
              'CCP-002',
              'Chilling',
              'Growth of pathogens (B)',
              '<=5°C within 4 hours',
              'Temperature logger',
              'Continuous',
              'Extend chill time or dispose',
              'Logger download, calibration',
              'FRM-042',
            ],
            [
              'CCP-003',
              'Metal detection',
              'Metal contamination (P)',
              'Fe 1.5mm, NFe 2.0mm, SS 2.5mm',
              'Metal detector',
              'All units',
              'Reject, isolate, re-run, investigate',
              'Test piece checks every 30 min',
              'FRM-042',
            ],
          ],
        },
      },
      {
        heading: '2. Review',
        content:
          'CCP register reviewed by HACCP team at least annually and following any HACCP plan update.',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-035-Food-Safety-Supplier-Register.docx',
    docNumber: 'REG-035',
    title: 'Food Safety Supplier Register',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Food Safety Team Leader]',
    isoRef: 'ISO 22000:2018 Clause 7.1.6',
    sections: [
      {
        heading: '1. Approved Supplier List',
        table: {
          headers: [
            'Supplier ID',
            'Name',
            'Materials Supplied',
            'Certification',
            'Last Audit',
            'Next Audit',
            'Risk Rating',
            'Allergen Status',
            'Status',
          ],
          rows: [
            [
              'FS-SUP-001',
              '',
              '',
              'BRC/FSSC/ISO 22000',
              '',
              '',
              'High/Medium/Low',
              '',
              'Approved/Conditional',
            ],
            ['FS-SUP-002', '', '', '', '', '', '', '', ''],
            ['FS-SUP-003', '', '', '', '', '', '', '', ''],
            ['FS-SUP-004', '', '', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '2. Approval Criteria',
        content:
          'High risk (direct food contact materials): Must hold GFSI-recognised certification (BRC, FSSC 22000, IFS, SQF) or pass on-site audit.\nMedium risk (packaging, indirect materials): Questionnaire + certificate review.\nLow risk (non-food contact services): Questionnaire only.',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/plans/PLN-009-HACCP-Plan.docx',
    docNumber: 'PLN-009',
    title: 'HACCP Plan',
    version: '1.0',
    owner: '[Food Safety Team Leader]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22000:2018 Clause 8.5.2',
    sections: [
      {
        heading: '1. Product Description',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Product Name', '[Product name]'],
            ['Product Description', '[Composition, packaging format]'],
            ['Intended Use', '[Ready-to-eat / cook before consumption / further processing]'],
            ['Target Consumer', '[General population / specific groups]'],
            ['Shelf Life', '[X days/months at X°C]'],
            ['Distribution', '[Chilled / Ambient / Frozen]'],
          ],
        },
      },
      {
        heading: '2. Flow Diagram',
        content:
          '[Insert process flow diagram showing all steps from raw material receipt to distribution]\n\nFlow diagram verified on-site: Yes / No\nVerified by: _________________________ Date: ___/___/______',
      },
      {
        heading: '3. CCP Summary',
        table: {
          headers: [
            'CCP',
            'Step',
            'Hazard',
            'Critical Limit',
            'Monitoring',
            'Corrective Action',
            'Verification',
          ],
          rows: [
            ['CCP-001', '', '', '', '', '', ''],
            ['CCP-002', '', '', '', '', '', ''],
            ['CCP-003', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '4. OPRP Summary',
        table: {
          headers: ['OPRP', 'Step', 'Hazard', 'Action Criteria', 'Monitoring', 'Correction/CA'],
          rows: [
            ['OPRP-001', '', '', '', '', ''],
            ['OPRP-002', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '5. Validation',
        content:
          'The HACCP plan shall be validated to confirm that the identified control measures are capable of achieving the intended level of food safety hazard control.\n\nValidation methods: Scientific literature, historical data, experimental trials, regulatory guidance.\n\nValidated by: _________________________ Date: ___/___/______',
      },
      {
        heading: '6. Review',
        content:
          'HACCP plan reviewed annually and following product/process changes, new hazards, incidents, or regulatory changes.\n\nLast review: ___/___/______  Next review: ___/___/______',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/reports/RPT-008-Food-Safety-Performance.docx',
    docNumber: 'RPT-008',
    title: 'Food Safety Performance Report',
    version: '1.0',
    owner: '[Food Safety Team Leader]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 22000:2018 Clause 9.1',
    sections: [
      {
        heading: '1. Report Period',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Period', '[Q1/Q2/Q3/Q4 YYYY]'],
            ['Prepared By', ''],
            ['Date', ''],
          ],
        },
      },
      {
        heading: '2. Key Metrics',
        table: {
          headers: ['KPI', 'Target', 'Actual', 'Trend', 'Status'],
          rows: [
            ['CCP deviations', '0', '', '', ''],
            ['Customer complaints (food safety)', '<2/quarter', '', '', ''],
            ['Product recalls', '0', '', '', ''],
            ['Internal audit non-conformities (major)', '0', '', '', ''],
            ['Environmental monitoring failures', '<5%', '', '', ''],
            ['Supplier non-conformities', '<3/quarter', '', '', ''],
            ['Mock recall completion time', '<4 hours', '', '', ''],
            ['Training compliance', '100%', '', '', ''],
          ],
        },
      },
      {
        heading: '3. Incidents & Corrective Actions',
        content:
          '[Summary of any food safety incidents, customer complaints, near-misses, and corrective actions taken]',
      },
      {
        heading: '4. Recommendations',
        content:
          '[Recommendations for management review: resource needs, HACCP plan updates, training, capital investment]',
      },
    ],
  },
  // ============================================
  // ISO 50001:2018 — Energy (8 templates)
  // ============================================
  {
    outputPath: 'docs/compliance-templates/policies/POL-014-Energy-Policy.docx',
    docNumber: 'POL-014',
    title: 'Energy Policy',
    version: '1.0',
    owner: '[Energy Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 50001:2018 Clause 5.2',
    sections: [
      {
        heading: '1. Policy Statement',
        content:
          '[COMPANY NAME] is committed to continually improving energy performance, reducing energy consumption, and supporting the transition to a low-carbon economy.',
      },
      {
        heading: '2. Commitments',
        bullets: [
          'Continually improve energy performance and the energy management system',
          'Ensure availability of information and resources to achieve energy objectives and targets',
          'Comply with applicable legal and other requirements relating to energy use',
          'Support the procurement of energy-efficient products and services',
          'Consider energy performance improvement in design activities',
          'Reduce greenhouse gas emissions associated with energy use',
          'Communicate this policy and energy performance expectations to all personnel',
        ],
      },
      {
        heading: '3. Review',
        content:
          'This policy is reviewed annually at management review.\n\nSigned: _________________________ Date: ___/___/______\nManaging Director',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-058-Energy-Review.docx',
    docNumber: 'PRO-058',
    title: 'Energy Review Procedure',
    version: '1.0',
    owner: '[Energy Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 50001:2018 Clause 6.3',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To define the process for conducting energy reviews to analyse energy use and consumption, identify significant energy uses (SEUs), and determine energy performance improvement opportunities.',
      },
      {
        heading: '2. Energy Data Collection',
        content:
          'Data collected and analysed:\na) Energy sources: electricity, natural gas, diesel, LPG, renewables\nb) Past and current energy use and consumption (minimum 12 months)\nc) Relevant variables affecting SEUs (production volume, weather, occupancy)\nd) Energy performance vs. previous periods',
      },
      {
        heading: '3. Significant Energy Uses',
        content:
          'Identification criteria: An energy use is significant if it accounts for:\na) >10% of total energy consumption, OR\nb) Has substantial potential for energy performance improvement\n\nFor each SEU, determine:\n- Current energy performance\n- Relevant variables affecting performance\n- Persons whose actions significantly affect energy performance\n- Energy performance indicators (EnPIs) and baselines',
      },
      {
        heading: '4. Improvement Opportunities',
        content:
          'Opportunities are identified through:\na) Energy audits (ISO 50002 methodology)\nb) Sub-metering data analysis\nc) Benchmarking against industry/best practice\nd) Technology reviews\ne) Staff suggestions\n\nOpportunities are prioritised using energy savings potential, capital cost, payback period, and strategic alignment.',
      },
      {
        heading: '5. Energy Review Output',
        content:
          'The energy review produces:\n1. Updated energy balance (Sankey diagram)\n2. Updated SEU register\n3. EnPIs and baselines\n4. Prioritised list of improvement opportunities\n5. Recommendations for energy objectives and targets',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-059-Energy-Performance-Monitoring.docx',
    docNumber: 'PRO-059',
    title: 'Energy Performance Monitoring Procedure',
    version: '1.0',
    owner: '[Energy Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 50001:2018 Clause 9.1',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To define the monitoring, measurement, analysis, and evaluation of energy performance, significant energy uses, and energy performance indicators.',
      },
      {
        heading: '2. Monitoring Plan',
        table: {
          headers: ['Parameter', 'Method', 'Frequency', 'Responsible', 'Target/Baseline'],
          rows: [
            [
              'Total site electricity',
              'Main meter (AMR)',
              'Half-hourly',
              'Energy Manager',
              'kWh/year',
            ],
            ['Total site gas', 'Main meter', 'Daily', 'Energy Manager', 'kWh/year'],
            ['SEU 1: HVAC', 'Sub-meter', 'Half-hourly', 'Facilities', 'kWh/m²/yr'],
            ['SEU 2: Production line', 'Sub-meter', 'Hourly', 'Production', 'kWh/unit produced'],
            [
              'SEU 3: Compressed air',
              'Sub-meter + pressure',
              'Hourly',
              'Maintenance',
              'kWh/m³ @ 7 bar',
            ],
            ['Renewable generation', 'Inverter meter', 'Daily', 'Energy Manager', 'kWh generated'],
          ],
        },
      },
      {
        heading: '3. Energy Performance Indicators (EnPIs)',
        content:
          'EnPI 1: Total energy intensity (kWh per unit of production)\nEnPI 2: Building energy intensity (kWh per m² floor area)\nEnPI 3: Specific energy consumption per SEU\n\nEnPIs are compared to energy baselines to evaluate energy performance improvement. Statistical methods (regression analysis) are used to normalise for relevant variables.',
      },
      {
        heading: '4. Reporting',
        content:
          'Monthly energy dashboard to management\nQuarterly EnPI report to energy committee\nAnnual energy performance report to management review',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-045-Energy-Consumption-Log.docx',
    docNumber: 'FRM-045',
    title: 'Energy Consumption Log',
    version: '1.0',
    owner: '[Energy Manager]',
    approvedBy: '[Facilities Manager]',
    isoRef: 'ISO 50001:2018 Clause 6.3',
    sections: [
      {
        heading: '1. Monthly Energy Consumption',
        table: {
          headers: [
            'Month',
            'Electricity (kWh)',
            'Gas (kWh)',
            'Diesel (litres)',
            'LPG (kg)',
            'Renewables (kWh)',
            'Total (kWh)',
            'Production Units',
            'EnPI (kWh/unit)',
          ],
          rows: [
            ['January', '', '', '', '', '', '', '', ''],
            ['February', '', '', '', '', '', '', '', ''],
            ['March', '', '', '', '', '', '', '', ''],
            ['April', '', '', '', '', '', '', '', ''],
            ['May', '', '', '', '', '', '', '', ''],
            ['June', '', '', '', '', '', '', '', ''],
            ['July', '', '', '', '', '', '', '', ''],
            ['August', '', '', '', '', '', '', '', ''],
            ['September', '', '', '', '', '', '', '', ''],
            ['October', '', '', '', '', '', '', '', ''],
            ['November', '', '', '', '', '', '', '', ''],
            ['December', '', '', '', '', '', '', '', ''],
            ['TOTAL', '', '', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '2. Notes',
        content:
          '[Record any anomalies, meter changes, production shutdowns, or other factors affecting consumption]',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-046-Energy-Improvement-Opportunity.docx',
    docNumber: 'FRM-046',
    title: 'Energy Improvement Opportunity Form',
    version: '1.0',
    owner: '[Energy Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 50001:2018 Clause 6.4',
    sections: [
      {
        heading: '1. Opportunity Details',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Reference', '[EIO-YYYY-NNN]'],
            ['Title', ''],
            ['SEU Affected', ''],
            ['Proposed By', ''],
            ['Date', ''],
          ],
        },
      },
      {
        heading: '2. Description',
        content:
          '[Detailed description of the energy improvement opportunity, including current state and proposed change]',
      },
      {
        heading: '3. Business Case',
        table: {
          headers: ['Parameter', 'Value'],
          rows: [
            ['Estimated annual energy saving (kWh)', ''],
            ['Estimated annual cost saving (£)', ''],
            ['Capital cost (£)', ''],
            ['Simple payback period', ''],
            ['CO2 reduction (tCO2e/year)', ''],
            ['Non-energy benefits', ''],
          ],
        },
      },
      {
        heading: '4. Decision',
        content:
          'Priority: High / Medium / Low\nApproved: Yes / No / Deferred\n\nApproved by: _________________________ Date: ___/___/______',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-036-Significant-Energy-Uses.docx',
    docNumber: 'REG-036',
    title: 'Significant Energy Uses (SEU) Register',
    version: '1.0',
    owner: '[Energy Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 50001:2018 Clause 6.3',
    sections: [
      {
        heading: '1. SEU Register',
        table: {
          headers: [
            'SEU #',
            'Description',
            'Energy Source',
            'Annual Consumption (kWh)',
            '% of Total',
            'Relevant Variables',
            'EnPI',
            'Baseline',
            'Target',
            'Owner',
          ],
          rows: [
            [
              'SEU-001',
              'HVAC system',
              'Electricity + Gas',
              '',
              '',
              'HDD/CDD, occupancy',
              'kWh/m²/yr',
              '',
              '',
              'Facilities',
            ],
            [
              'SEU-002',
              'Production line 1',
              'Electricity',
              '',
              '',
              'Production volume',
              'kWh/unit',
              '',
              '',
              'Production',
            ],
            [
              'SEU-003',
              'Compressed air',
              'Electricity',
              '',
              '',
              'Operating hours',
              'kWh/m³',
              '',
              '',
              'Maintenance',
            ],
            [
              'SEU-004',
              'Lighting',
              'Electricity',
              '',
              '',
              'Operating hours',
              'kWh/m²',
              '',
              '',
              'Facilities',
            ],
            [
              'SEU-005',
              'Fleet vehicles',
              'Diesel',
              '',
              '',
              'km driven',
              'litres/100km',
              '',
              '',
              'Fleet',
            ],
          ],
        },
      },
      {
        heading: '2. Review',
        content:
          'SEU register reviewed as part of the annual energy review. Updated when energy use patterns change or new energy uses are commissioned.',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/plans/PLN-010-Energy-Objectives.docx',
    docNumber: 'PLN-010',
    title: 'Energy Objectives & Action Plan',
    version: '1.0',
    owner: '[Energy Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 50001:2018 Clause 6.2',
    sections: [
      {
        heading: '1. Energy Objectives',
        table: {
          headers: [
            'Ref',
            'Objective',
            'EnPI',
            'Target',
            'Baseline',
            'Owner',
            'Due Date',
            'Status',
          ],
          rows: [
            [
              'EnO-01',
              'Reduce overall energy intensity',
              'kWh/unit',
              '-10% vs 2024',
              '',
              'Energy Manager',
              '31/12/2026',
              'In Progress',
            ],
            [
              'EnO-02',
              'Reduce HVAC energy consumption',
              'kWh/m²',
              '-15% vs 2024',
              '',
              'Facilities',
              '31/12/2026',
              'In Progress',
            ],
            [
              'EnO-03',
              'Increase renewable generation',
              '% of total',
              '25%',
              '10%',
              'Energy Manager',
              '31/12/2027',
              'Planned',
            ],
            [
              'EnO-04',
              'Eliminate compressed air leaks',
              'Leak rate',
              '<5%',
              '15%',
              'Maintenance',
              '30/06/2026',
              'In Progress',
            ],
          ],
        },
      },
      {
        heading: '2. Action Plans',
        table: {
          headers: ['Objective', 'Action', 'Cost', 'Saving', 'Payback', 'Responsible', 'Timeline'],
          rows: [
            [
              'EnO-01',
              'Variable speed drives on motors',
              '£20,000',
              '£8,000/yr',
              '2.5 yrs',
              'Engineering',
              'Q2 2026',
            ],
            [
              'EnO-02',
              'BMS optimisation + weather compensation',
              '£5,000',
              '£6,000/yr',
              '0.8 yrs',
              'Facilities',
              'Q1 2026',
            ],
            [
              'EnO-03',
              'Rooftop solar PV installation (100kWp)',
              '£80,000',
              '£12,000/yr',
              '6.7 yrs',
              'Energy Manager',
              'Q3 2027',
            ],
            [
              'EnO-04',
              'Ultrasonic leak detection + repair programme',
              '£2,000',
              '£4,000/yr',
              '0.5 yrs',
              'Maintenance',
              'Q1 2026',
            ],
          ],
        },
      },
      {
        heading: '3. Review',
        content:
          'Progress reviewed monthly by Energy Manager, reported quarterly to energy committee and annually at management review.',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/reports/RPT-009-Energy-Performance.docx',
    docNumber: 'RPT-009',
    title: 'Energy Performance Report',
    version: '1.0',
    owner: '[Energy Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 50001:2018 Clause 9.1',
    sections: [
      {
        heading: '1. Report Details',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Period', '[YYYY]'],
            ['Prepared By', ''],
            ['Date', ''],
          ],
        },
      },
      {
        heading: '2. Energy Performance Summary',
        table: {
          headers: [
            'Metric',
            'Baseline Year',
            'Previous Year',
            'Current Year',
            'Change',
            'Target',
            'Status',
          ],
          rows: [
            ['Total energy (MWh)', '', '', '', '', '', ''],
            ['Electricity (MWh)', '', '', '', '', '', ''],
            ['Gas (MWh)', '', '', '', '', '', ''],
            ['Energy intensity (kWh/unit)', '', '', '', '', '', ''],
            ['Scope 1 emissions (tCO2e)', '', '', '', '', '', ''],
            ['Scope 2 emissions (tCO2e)', '', '', '', '', '', ''],
            ['Renewable %', '', '', '', '', '', ''],
            ['Energy cost (£)', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '3. SEU Performance',
        content: '[Performance of each significant energy use against its EnPI and target]',
      },
      {
        heading: '4. Improvement Actions Status',
        content: '[Status of energy improvement projects, savings achieved, pipeline projects]',
      },
      {
        heading: '5. Recommendations',
        content:
          '[Recommendations for management review: investment priorities, new objectives, resource needs]',
      },
    ],
  },
];

async function main() {
  const tmpDir = '/tmp/gap-iso22000-50001-configs';
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log(`Generating ${templates.length} ISO 22000 + ISO 50001 gap-filling templates...`);
  for (const t of templates) {
    const configPath = path.join(tmpDir, `${t.docNumber}.json`);
    fs.writeFileSync(configPath, JSON.stringify(t, null, 2));
    try {
      execSync(`node /home/dyl/New-BMS/scripts/create-docx.mjs ${configPath}`, {
        stdio: 'inherit',
      });
    } catch (e) {
      console.error(`Failed: ${t.docNumber} - ${e.message}`);
    }
  }
  console.log(`\nDone: ${templates.length} templates generated.`);
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
