export interface ISOStandard {
  number: string;
  name: string;
  subtitle: string;
  requirements: [string, string, string, string];
  features: [
    { title: string; desc: string },
    { title: string; desc: string },
    { title: string; desc: string },
  ];
  keyFeatures: [string, string, string, string, string, string];
  industries: [string, string];
}

export const isoStandards: Record<string, ISOStandard> = {
  '9001': {
    number: 'ISO 9001:2015',
    name: 'Quality Management System',
    subtitle:
      "The world's most recognised quality standard — streamlined with AI-powered automation.",
    requirements: [
      'Document and control quality processes across your organisation',
      'Implement risk-based thinking and preventive action',
      'Drive continual improvement through data-driven decisions',
      'Meet customer requirements and enhance satisfaction',
    ],
    features: [
      {
        title: 'CAPA Management',
        desc: 'Automated corrective and preventive action workflows with root cause analysis and effectiveness tracking.',
      },
      {
        title: 'Document Control',
        desc: 'Version-controlled document management with approval workflows, distribution lists, and automatic review reminders.',
      },
      {
        title: 'Audit Management',
        desc: 'Plan, schedule, and execute internal audits with finding tracking, evidence collection, and management review integration.',
      },
    ],
    keyFeatures: [
      'Non-conformance tracking',
      'Management review automation',
      'Supplier quality management',
      'Customer feedback analysis',
      'Process performance dashboards',
      'Training matrix & competence records',
    ],
    industries: ['Manufacturing', 'Professional Services'],
  },
  '14001': {
    number: 'ISO 14001:2015',
    name: 'Environmental Management System',
    subtitle: 'Reduce your environmental impact and demonstrate sustainability leadership.',
    requirements: [
      'Identify and assess environmental aspects and impacts',
      'Ensure compliance with environmental legislation',
      'Set objectives and targets for environmental improvement',
      'Implement operational controls and emergency preparedness',
    ],
    features: [
      {
        title: 'Aspect & Impact Register',
        desc: 'Comprehensive environmental aspect identification with significance scoring and automatic reassessment scheduling.',
      },
      {
        title: 'Emissions Tracking',
        desc: 'Scope 1, 2 and 3 greenhouse gas emissions calculation with built-in emission factor databases and trend analysis.',
      },
      {
        title: 'Legal Compliance',
        desc: 'Regulatory obligation register with automated change monitoring and compliance evaluation workflows.',
      },
    ],
    keyFeatures: [
      'Waste management tracking',
      'Energy consumption monitoring',
      'Water usage analysis',
      'Environmental incident reporting',
      'Sustainability KPI dashboards',
      'Stakeholder communication logs',
    ],
    industries: ['Construction', 'Energy & Utilities'],
  },
  '45001': {
    number: 'ISO 45001:2018',
    name: 'Occupational Health & Safety',
    subtitle: 'Protect your workforce and build a proactive safety culture.',
    requirements: [
      'Identify hazards and assess occupational health and safety risks',
      'Establish OH&S objectives and plans to achieve them',
      'Implement operational controls and emergency response',
      'Monitor, measure, and evaluate OH&S performance',
    ],
    features: [
      {
        title: 'Risk Assessment',
        desc: 'Dynamic risk assessment tools with hazard identification, risk scoring matrices, and control hierarchy management.',
      },
      {
        title: 'Incident Management',
        desc: 'Full incident lifecycle from reporting through investigation to corrective action with RIDDOR and OSHA integration.',
      },
      {
        title: 'Safety Inspections',
        desc: 'Scheduled and ad-hoc inspection checklists with photo evidence, GPS tagging, and automated finding escalation.',
      },
    ],
    keyFeatures: [
      'Permit-to-work management',
      'Safety observation cards',
      'PPE tracking & allocation',
      'Toolbox talk records',
      'Contractor safety management',
      'Return-to-work tracking',
    ],
    industries: ['Construction', 'Manufacturing'],
  },
  '27001': {
    number: 'ISO 27001:2022',
    name: 'Information Security Management',
    subtitle: 'Protect your information assets with a world-class ISMS.',
    requirements: [
      'Establish an information security risk assessment process',
      'Implement Annex A controls appropriate to your risks',
      'Monitor and review ISMS effectiveness continuously',
      'Ensure competence and awareness of information security',
    ],
    features: [
      {
        title: 'Risk Treatment',
        desc: 'Comprehensive risk assessment with asset inventory, threat modelling, vulnerability tracking, and treatment plan management.',
      },
      {
        title: 'Control Mapping',
        desc: 'Annex A control implementation tracking with Statement of Applicability generation and gap analysis reporting.',
      },
      {
        title: 'Incident Response',
        desc: 'Security incident classification, containment workflows, forensic evidence management, and breach notification tracking.',
      },
    ],
    keyFeatures: [
      'Asset inventory management',
      'Access control reviews',
      'Vulnerability assessments',
      'Business continuity planning',
      'Supplier security assessments',
      'Security awareness campaigns',
    ],
    industries: ['Technology', 'Financial Services'],
  },
  '13485': {
    number: 'ISO 13485:2016',
    name: 'Medical Devices — Quality Management',
    subtitle: 'Achieve regulatory compliance for medical device quality management.',
    requirements: [
      'Implement design and development controls for medical devices',
      'Establish purchasing controls and supplier evaluation',
      'Maintain production and service provision controls',
      'Document complaint handling and vigilance reporting',
    ],
    features: [
      {
        title: 'Design Controls',
        desc: 'Full design history file management with design input/output traceability, verification/validation records, and design transfer.',
      },
      {
        title: 'CAPA & Complaints',
        desc: 'Medical device complaint handling with trending analysis, MDR/IVDR vigilance reporting, and CAPA effectiveness reviews.',
      },
      {
        title: 'Traceability',
        desc: 'Unique device identification (UDI) management with lot/serial tracking, distribution records, and field safety corrective actions.',
      },
    ],
    keyFeatures: [
      'Design history file (DHF)',
      'Device master record (DMR)',
      'Risk management (ISO 14971)',
      'Sterilisation validation',
      'Biocompatibility tracking',
      'Regulatory submission tracking',
    ],
    industries: ['Medical Devices', 'Pharmaceuticals'],
  },
  AS9100D: {
    number: 'AS9100D',
    name: 'Aerospace Quality Management',
    subtitle: 'Meet the rigorous quality demands of the aerospace and defence industry.',
    requirements: [
      'Implement product safety and configuration management',
      'Establish robust supplier chain quality controls',
      'Manage special processes and key characteristics',
      'Ensure counterfeit part prevention and detection',
    ],
    features: [
      {
        title: 'FAIR Management',
        desc: 'First Article Inspection Report management with AS9102 compliance, multi-level reporting, and customer approval workflows.',
      },
      {
        title: 'Special Processes',
        desc: 'Nadcap-aligned special process management with operator qualification tracking, process parameter monitoring, and revalidation scheduling.',
      },
      {
        title: 'Configuration Control',
        desc: 'Product configuration management with engineering change orders, effectivity tracking, and as-built/as-designed reconciliation.',
      },
    ],
    keyFeatures: [
      'OASIS database integration',
      'Flow-down requirements',
      'Key characteristic tracking',
      'Counterfeit part prevention',
      'On-time delivery metrics',
      'Customer property control',
    ],
    industries: ['Aerospace', 'Defence'],
  },
  IATF16949: {
    number: 'IATF 16949:2016',
    name: 'Automotive Quality Management',
    subtitle: 'Drive zero-defect culture across your automotive supply chain.',
    requirements: [
      'Implement advanced product quality planning (APQP)',
      'Establish measurement system analysis (MSA) processes',
      'Maintain statistical process control (SPC) across production',
      'Execute production part approval process (PPAP)',
    ],
    features: [
      {
        title: 'Core Tools',
        desc: 'Integrated APQP, PPAP, FMEA, MSA, and SPC tools with cross-referencing, automatic phase-gate progression, and customer submission packages.',
      },
      {
        title: 'FMEA Management',
        desc: 'Design and Process FMEA with AIAG-VDA harmonised format, action priority tracking, and effectiveness verification.',
      },
      {
        title: 'SPC & Control Plans',
        desc: 'Real-time statistical process control with control plan linkage, out-of-control reaction plans, and capability analysis (Cpk/Ppk).',
      },
    ],
    keyFeatures: [
      'Customer scorecard tracking',
      'Warranty analysis',
      'Layered process audits',
      'Error-proofing verification',
      'Supplier development',
      'Lessons learned database',
    ],
    industries: ['Automotive', 'Tier 1-3 Suppliers'],
  },
  '42001': {
    number: 'ISO 42001:2023',
    name: 'AI Management System',
    subtitle: 'Govern AI responsibly with the first international standard for AI management.',
    requirements: [
      'Establish an AI risk assessment and treatment process',
      'Implement responsible AI development lifecycle controls',
      'Monitor AI system performance and bias metrics',
      'Ensure transparency and explainability of AI decisions',
    ],
    features: [
      {
        title: 'AI Risk Registry',
        desc: 'Comprehensive AI risk identification covering bias, fairness, safety, privacy, and security with impact assessment and mitigation tracking.',
      },
      {
        title: 'Model Governance',
        desc: 'AI model lifecycle management from development through deployment with version control, performance monitoring, and retirement processes.',
      },
      {
        title: 'Ethics & Compliance',
        desc: 'AI ethics framework management with stakeholder impact assessments, human oversight controls, and regulatory compliance mapping.',
      },
    ],
    keyFeatures: [
      'AI system inventory',
      'Bias & fairness monitoring',
      'Data quality management',
      'Human oversight controls',
      'Explainability documentation',
      'AI incident reporting',
    ],
    industries: ['Technology', 'Financial Services'],
  },
  '37001': {
    number: 'ISO 37001:2016',
    name: 'Anti-Bribery Management System',
    subtitle: 'Prevent, detect, and address bribery across your organisation.',
    requirements: [
      'Conduct bribery risk assessments for all operations',
      'Implement due diligence on business associates',
      'Establish financial and non-financial controls',
      'Create whistleblowing and investigation procedures',
    ],
    features: [
      {
        title: 'Risk Assessment',
        desc: 'Bribery risk assessment covering geographic, sectoral, transactional, and business opportunity risks with heat map visualisation.',
      },
      {
        title: 'Due Diligence',
        desc: 'Business associate due diligence workflows with PEP screening, sanctions checks, beneficial ownership verification, and ongoing monitoring.',
      },
      {
        title: 'Gift & Hospitality',
        desc: 'Gift, hospitality, and donation register with approval workflows, value thresholds, and aggregate tracking per business associate.',
      },
    ],
    keyFeatures: [
      'Whistleblower portal',
      'Investigation management',
      'Training & awareness tracking',
      'Third-party due diligence',
      'Financial control monitoring',
      'Policy acknowledgement tracking',
    ],
    industries: ['Government & Public Sector', 'Oil & Gas'],
  },
  '22000': {
    number: 'ISO 22000:2018',
    name: 'Food Safety Management System',
    subtitle: 'Ensure food safety across every link in the supply chain.',
    requirements: [
      'Implement hazard analysis and critical control points (HACCP)',
      'Establish prerequisite programmes (PRPs) and operational PRPs',
      'Ensure traceability throughout the food chain',
      'Implement emergency preparedness and recall procedures',
    ],
    features: [
      {
        title: 'HACCP Plans',
        desc: 'Digital HACCP plan creation with hazard analysis, CCP determination, critical limit setting, monitoring procedures, and verification activities.',
      },
      {
        title: 'Supplier Approval',
        desc: 'Food safety supplier approval with questionnaires, audit scheduling, specification management, and incoming goods inspection.',
      },
      {
        title: 'Recall Management',
        desc: 'Product recall and withdrawal management with mock recall exercises, traceability verification, and regulatory notification workflows.',
      },
    ],
    keyFeatures: [
      'CCP monitoring dashboards',
      'Allergen management',
      'Cleaning & sanitation records',
      'Temperature monitoring',
      'Pest control management',
      'Label verification checks',
    ],
    industries: ['Food & Beverage', 'Retail & Distribution'],
  },
  '50001': {
    number: 'ISO 50001:2018',
    name: 'Energy Management System',
    subtitle: 'Optimise energy performance and reduce consumption systematically.',
    requirements: [
      'Conduct an energy review and establish an energy baseline',
      'Identify significant energy uses and energy performance indicators',
      'Set energy objectives, targets, and action plans',
      'Implement operational and maintenance controls for energy',
    ],
    features: [
      {
        title: 'Energy Monitoring',
        desc: 'Real-time energy consumption monitoring with sub-metering integration, automatic baseline adjustment, and anomaly detection alerts.',
      },
      {
        title: 'EnPI Tracking',
        desc: 'Energy performance indicator dashboards with normalisation for production volume, weather, and occupancy with trend analysis and forecasting.',
      },
      {
        title: 'Opportunity Register',
        desc: 'Energy saving opportunity identification with cost-benefit analysis, payback calculation, implementation tracking, and verified savings.',
      },
    ],
    keyFeatures: [
      'Energy baseline management',
      'Utility bill analysis',
      'Carbon footprint calculation',
      'Renewable energy tracking',
      'Equipment efficiency monitoring',
      'Energy procurement optimisation',
    ],
    industries: ['Manufacturing', 'Commercial Real Estate'],
  },
  '21502': {
    number: 'ISO 21502:2020',
    name: 'Project Management',
    subtitle: 'Deliver projects consistently with internationally recognised best practices.',
    requirements: [
      'Establish project governance and organisational structures',
      'Implement integrated planning and scope management',
      'Manage project resources, risks, and stakeholders',
      'Monitor, control, and report on project performance',
    ],
    features: [
      {
        title: 'Project Planning',
        desc: 'Integrated project planning with WBS creation, resource levelling, dependency management, and critical path analysis.',
      },
      {
        title: 'Risk Management',
        desc: 'Project risk register with probability-impact assessment, response planning, trigger monitoring, and risk burndown tracking.',
      },
      {
        title: 'Stakeholder Management',
        desc: 'Stakeholder identification and analysis with engagement planning, communication management, and influence mapping.',
      },
    ],
    keyFeatures: [
      'Gantt chart & timeline views',
      'Resource allocation tracking',
      'Earned value management',
      'Change control management',
      'Lessons learned repository',
      'Portfolio-level dashboards',
    ],
    industries: ['Engineering & Construction', 'IT & Consulting'],
  },
};
