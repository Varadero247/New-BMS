import type { TemplateDefinition } from '../types';

export const environmentTemplates: TemplateDefinition[] = [
  // ─── TPL-ENV-001  Aspect & Impact Register ─────────────────────────
  {
    code: 'TPL-ENV-001',
    name: 'Environmental Aspect & Impact Register',
    description:
      'A structured register for identifying environmental aspects, evaluating their impacts under normal, abnormal, and emergency conditions, and scoring significance using a multi-criteria method aligned with ISO 14001:2015 Clause 6.1.2.',
    module: 'ENVIRONMENT',
    category: 'RISK_ASSESSMENT',
    tags: ['aspect', 'impact', 'significance', 'ISO 14001', 'register'],
    isoClause: '6.1.2',
    fields: [
      // ── Section: Register Header ──
      {
        id: 'section_header',
        label: 'Register Information',
        type: 'section',
      },
      {
        id: 'register_ref',
        label: 'Register Reference',
        type: 'text',
        required: true,
        placeholder: 'e.g. ENV-REG-2026-001',
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'site_location',
        label: 'Site / Location',
        type: 'text',
        required: true,
        placeholder: 'e.g. Main manufacturing facility',
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'prepared_by',
        label: 'Prepared By',
        type: 'text',
        required: true,
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'review_date',
        label: 'Review Date',
        type: 'date',
        required: true,
        helpText: 'Aspect registers must be reviewed at least annually.',
        width: 'half',
        section: 'section_header',
      },
      {
        id: 'revision',
        label: 'Revision Number',
        type: 'number',
        defaultValue: 1,
        validation: { min: 1 },
        width: 'half',
        section: 'section_header',
      },

      // ── Section: Aspects & Impacts ──
      {
        id: 'section_aspects',
        label: 'Aspects & Impacts Identification',
        type: 'section',
        helpText:
          'Identify each environmental aspect, the associated activity, and the resulting environmental impact.',
      },
      {
        id: 'aspects_table',
        label: 'Aspect & Impact Register',
        type: 'table',
        required: true,
        helpText:
          'One row per aspect. Score each criterion 1-5 and the system will calculate significance.',
        columns: [
          { id: 'aspect_ref', label: 'Ref', type: 'text', placeholder: 'ASP-001' },
          {
            id: 'activity',
            label: 'Activity / Process',
            type: 'text',
            placeholder: 'e.g. Parts washing',
          },
          {
            id: 'aspect',
            label: 'Environmental Aspect',
            type: 'text',
            placeholder: 'e.g. Use of solvent-based cleaner',
          },
          {
            id: 'impact',
            label: 'Environmental Impact',
            type: 'text',
            placeholder: 'e.g. Groundwater contamination',
          },
          {
            id: 'condition',
            label: 'Condition',
            type: 'select',
            options: [
              { label: 'Normal', value: 'normal' },
              { label: 'Abnormal', value: 'abnormal' },
              { label: 'Emergency', value: 'emergency' },
            ],
          },
          {
            id: 'impact_type',
            label: 'Impact Type',
            type: 'select',
            options: [
              { label: 'Air emissions', value: 'air' },
              { label: 'Water discharge', value: 'water' },
              { label: 'Land contamination', value: 'land' },
              { label: 'Resource depletion', value: 'resource' },
              { label: 'Waste generation', value: 'waste' },
              { label: 'Noise / vibration', value: 'noise' },
              { label: 'Energy consumption', value: 'energy' },
              { label: 'Biodiversity impact', value: 'biodiversity' },
            ],
          },
        ],
        section: 'section_aspects',
      },

      // ── Section: Significance Scoring ──
      {
        id: 'section_scoring',
        label: 'Significance Scoring',
        type: 'section',
        helpText:
          'Score each criterion from 1 (low) to 5 (high). Total >= 15 indicates a significant aspect.',
      },
      {
        id: 'severity',
        label: 'Severity of Impact',
        type: 'select',
        required: true,
        helpText: 'How severe is the environmental harm if the impact occurs?',
        options: [
          { label: '1 — Negligible (no measurable effect)', value: '1' },
          { label: '2 — Minor (localised, quickly reversible)', value: '2' },
          { label: '3 — Moderate (localised, requires remediation)', value: '3' },
          { label: '4 — Major (widespread, long-term remediation)', value: '4' },
          { label: '5 — Catastrophic (irreversible environmental damage)', value: '5' },
        ],
        width: 'half',
        section: 'section_scoring',
      },
      {
        id: 'probability',
        label: 'Probability of Occurrence',
        type: 'select',
        required: true,
        helpText: 'How likely is the impact to occur?',
        options: [
          { label: '1 — Rare (once in 10+ years)', value: '1' },
          { label: '2 — Unlikely (once in 5-10 years)', value: '2' },
          { label: '3 — Possible (once in 1-5 years)', value: '3' },
          { label: '4 — Likely (several times per year)', value: '4' },
          { label: '5 — Almost Certain (daily / weekly)', value: '5' },
        ],
        width: 'half',
        section: 'section_scoring',
      },
      {
        id: 'duration',
        label: 'Duration of Impact',
        type: 'select',
        required: true,
        options: [
          { label: '1 — Momentary (hours)', value: '1' },
          { label: '2 — Short-term (days)', value: '2' },
          { label: '3 — Medium-term (weeks to months)', value: '3' },
          { label: '4 — Long-term (years)', value: '4' },
          { label: '5 — Permanent', value: '5' },
        ],
        width: 'third',
        section: 'section_scoring',
      },
      {
        id: 'extent',
        label: 'Geographical Extent',
        type: 'select',
        required: true,
        options: [
          { label: '1 — Contained on site', value: '1' },
          { label: '2 — Within site boundary', value: '2' },
          { label: '3 — Immediate neighbourhood', value: '3' },
          { label: '4 — Regional', value: '4' },
          { label: '5 — National / global', value: '5' },
        ],
        width: 'third',
        section: 'section_scoring',
      },
      {
        id: 'reversibility',
        label: 'Reversibility',
        type: 'select',
        required: true,
        options: [
          { label: '1 — Easily reversible (self-correcting)', value: '1' },
          { label: '2 — Reversible with minor effort', value: '2' },
          { label: '3 — Reversible with significant effort', value: '3' },
          { label: '4 — Partially reversible', value: '4' },
          { label: '5 — Irreversible', value: '5' },
        ],
        width: 'third',
        section: 'section_scoring',
      },
      {
        id: 'regulatory',
        label: 'Regulatory Sensitivity',
        type: 'select',
        required: true,
        helpText: 'Is this aspect subject to legal or regulatory requirements?',
        options: [
          { label: '1 — No specific regulation', value: '1' },
          { label: '2 — General guidance applies', value: '2' },
          { label: '3 — Specific regulation with low enforcement', value: '3' },
          { label: '4 — Specific regulation, active enforcement', value: '4' },
          { label: '5 — Strict regulation, severe penalties', value: '5' },
        ],
        width: 'half',
        section: 'section_scoring',
      },
      {
        id: 'stakeholder_concern',
        label: 'Stakeholder Concern',
        type: 'select',
        required: true,
        helpText:
          'Level of interest or concern from stakeholders (community, regulators, customers).',
        options: [
          { label: '1 — No known concern', value: '1' },
          { label: '2 — Minimal concern', value: '2' },
          { label: '3 — Moderate interest', value: '3' },
          { label: '4 — Significant concern / complaints', value: '4' },
          { label: '5 — High profile / media attention', value: '5' },
        ],
        width: 'half',
        section: 'section_scoring',
      },
      {
        id: 'total_score',
        label: 'Total Significance Score',
        type: 'number',
        required: true,
        helpText:
          'Auto-calculated: severity*1.5 + probability*1.5 + duration + extent + reversibility + regulatory + stakeholder. Significant if >= 15.',
        validation: { min: 0, max: 50 },
        width: 'half',
        section: 'section_scoring',
      },
      {
        id: 'significant',
        label: 'Significant Aspect?',
        type: 'radio',
        required: true,
        options: [
          { label: 'Yes (score >= 15)', value: 'yes' },
          { label: 'No (score < 15)', value: 'no' },
        ],
        width: 'half',
        section: 'section_scoring',
      },

      // ── Section: Controls ──
      {
        id: 'section_controls',
        label: 'Operational Controls',
        type: 'section',
        helpText: 'Document controls in place to manage significant aspects.',
      },
      {
        id: 'controls',
        label: 'Control Measures',
        type: 'textarea',
        placeholder:
          'Describe operational controls, procedures, monitoring, and responsible persons.',
        validation: { maxLength: 3000 },
        width: 'full',
        section: 'section_controls',
      },

      // ── Section: Sign-off ──
      {
        id: 'section_signoff',
        label: 'Sign-Off',
        type: 'section',
      },
      {
        id: 'reviewed_by',
        label: 'Reviewed By',
        type: 'text',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
      {
        id: 'approved_date',
        label: 'Approval Date',
        type: 'date',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
    ],
  },

  // ─── TPL-ENV-002  Environmental Impact Assessment ──────────────────
  {
    code: 'TPL-ENV-002',
    name: 'Environmental Impact Assessment',
    description:
      'A project-level environmental impact assessment (EIA) form for evaluating the potential environmental effects of new projects, expansions, or changes to operations. Includes impact categorisation, mitigation planning, and monitoring requirements.',
    module: 'ENVIRONMENT',
    category: 'RISK_ASSESSMENT',
    tags: ['EIA', 'impact assessment', 'project', 'mitigation', 'monitoring'],
    isoClause: '6.1.2',
    fields: [
      // ── Section: Project Information ──
      {
        id: 'section_project',
        label: 'Project Information',
        type: 'section',
      },
      {
        id: 'project_name',
        label: 'Project Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. New Paint Shop Installation',
        width: 'half',
        section: 'section_project',
      },
      {
        id: 'project_ref',
        label: 'Project Reference',
        type: 'text',
        placeholder: 'e.g. PRJ-2026-015',
        width: 'half',
        section: 'section_project',
      },
      {
        id: 'project_location',
        label: 'Location',
        type: 'text',
        required: true,
        placeholder: 'e.g. Building D extension — North campus',
        width: 'half',
        section: 'section_project',
      },
      {
        id: 'project_manager',
        label: 'Project Manager',
        type: 'text',
        required: true,
        width: 'half',
        section: 'section_project',
      },
      {
        id: 'project_description',
        label: 'Project Description',
        type: 'textarea',
        required: true,
        placeholder:
          'Describe the project scope, objectives, timeline, and any new processes, chemicals, or equipment being introduced.',
        helpText:
          'Include enough detail for reviewers to understand potential environmental interactions.',
        validation: { maxLength: 3000 },
        width: 'full',
        section: 'section_project',
      },
      {
        id: 'project_phase',
        label: 'Project Phase',
        type: 'select',
        required: true,
        options: [
          { label: 'Planning / Feasibility', value: 'planning' },
          { label: 'Design', value: 'design' },
          { label: 'Construction', value: 'construction' },
          { label: 'Commissioning', value: 'commissioning' },
          { label: 'Operation', value: 'operation' },
          { label: 'Decommissioning', value: 'decommissioning' },
        ],
        width: 'half',
        section: 'section_project',
      },
      {
        id: 'expected_duration',
        label: 'Expected Duration',
        type: 'text',
        placeholder: 'e.g. 6 months construction + ongoing operation',
        width: 'half',
        section: 'section_project',
      },

      // ── Section: Baseline Environment ──
      {
        id: 'section_baseline',
        label: 'Baseline Environmental Conditions',
        type: 'section',
        helpText: 'Describe the current environmental conditions at the project location.',
      },
      {
        id: 'baseline_description',
        label: 'Baseline Description',
        type: 'textarea',
        required: true,
        placeholder:
          'Describe existing environmental conditions: land use, water features, habitats, air quality, noise levels, and any existing contamination.',
        validation: { maxLength: 3000 },
        width: 'full',
        section: 'section_baseline',
      },
      {
        id: 'sensitive_receptors',
        label: 'Sensitive Receptors',
        type: 'textarea',
        placeholder:
          'Identify any nearby sensitive receptors: residential areas, schools, hospitals, water courses, protected habitats, heritage sites.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_baseline',
      },

      // ── Section: Impact Categories ──
      {
        id: 'section_impacts',
        label: 'Impact Assessment by Category',
        type: 'section',
        helpText: 'Evaluate the potential environmental impact in each category.',
      },
      {
        id: 'impact_categories_table',
        label: 'Impact Categories',
        type: 'table',
        required: true,
        helpText: 'Assess each environmental category for the project.',
        columns: [
          {
            id: 'category',
            label: 'Category',
            type: 'select',
            options: [
              { label: 'Air Quality / Emissions', value: 'air' },
              { label: 'Water Quality / Discharge', value: 'water' },
              { label: 'Land / Soil Contamination', value: 'land' },
              { label: 'Noise & Vibration', value: 'noise' },
              { label: 'Waste Generation', value: 'waste' },
              { label: 'Energy Consumption', value: 'energy' },
              { label: 'Water Consumption', value: 'water_use' },
              { label: 'Biodiversity / Ecology', value: 'biodiversity' },
              { label: 'Visual / Landscape', value: 'visual' },
              { label: 'Traffic / Transport', value: 'traffic' },
              { label: 'Greenhouse Gas Emissions', value: 'ghg' },
              { label: 'Raw Material Use', value: 'materials' },
            ],
          },
          {
            id: 'potential_impact',
            label: 'Potential Impact',
            type: 'text',
            placeholder: 'Describe the potential impact',
          },
          {
            id: 'significance',
            label: 'Significance',
            type: 'select',
            options: [
              { label: 'Negligible', value: 'negligible' },
              { label: 'Minor', value: 'minor' },
              { label: 'Moderate', value: 'moderate' },
              { label: 'Major', value: 'major' },
              { label: 'Critical', value: 'critical' },
            ],
          },
          {
            id: 'phase',
            label: 'Phase Affected',
            type: 'select',
            options: [
              { label: 'Construction', value: 'construction' },
              { label: 'Operation', value: 'operation' },
              { label: 'Both', value: 'both' },
              { label: 'Decommissioning', value: 'decommissioning' },
            ],
          },
          {
            id: 'duration',
            label: 'Duration',
            type: 'select',
            options: [
              { label: 'Temporary', value: 'temporary' },
              { label: 'Short-term', value: 'short_term' },
              { label: 'Long-term', value: 'long_term' },
              { label: 'Permanent', value: 'permanent' },
            ],
          },
        ],
        section: 'section_impacts',
      },

      // ── Section: Mitigation Measures ──
      {
        id: 'section_mitigation',
        label: 'Mitigation Measures',
        type: 'section',
        helpText: 'Describe how each significant impact will be mitigated or managed.',
      },
      {
        id: 'mitigation_measures',
        label: 'Mitigation Plan',
        type: 'textarea',
        required: true,
        placeholder:
          'For each significant impact, describe the mitigation hierarchy: avoid > minimise > restore > offset. Include responsibilities and timescales.',
        helpText:
          'Follow the mitigation hierarchy and reference specific operational controls or procedures.',
        validation: { maxLength: 5000 },
        width: 'full',
        section: 'section_mitigation',
      },

      // ── Section: Monitoring Plan ──
      {
        id: 'section_monitoring',
        label: 'Monitoring Plan',
        type: 'section',
        helpText:
          'Define how environmental impacts will be monitored during and after the project.',
      },
      {
        id: 'monitoring_plan',
        label: 'Monitoring Requirements',
        type: 'textarea',
        required: true,
        placeholder:
          'Describe monitoring parameters, frequency, methods, locations, responsibilities, and trigger levels / action thresholds.',
        validation: { maxLength: 3000 },
        width: 'full',
        section: 'section_monitoring',
      },
      {
        id: 'monitoring_frequency',
        label: 'Monitoring Frequency',
        type: 'select',
        options: [
          { label: 'Continuous', value: 'continuous' },
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
          { label: 'Quarterly', value: 'quarterly' },
          { label: 'As required', value: 'as_required' },
        ],
        width: 'half',
        section: 'section_monitoring',
      },

      // ── Section: Sign-off ──
      {
        id: 'section_signoff',
        label: 'Assessment Sign-Off',
        type: 'section',
      },
      {
        id: 'assessor_name',
        label: 'EIA Assessor',
        type: 'text',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
      {
        id: 'assessment_date',
        label: 'Assessment Date',
        type: 'date',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
      {
        id: 'approver_name',
        label: 'Approved By (Environmental Manager)',
        type: 'text',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
      {
        id: 'approver_signature',
        label: 'Approver Signature',
        type: 'signature',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
    ],
  },

  // ─── TPL-ENV-003  Monthly Environmental Performance Report ─────────
  {
    code: 'TPL-ENV-003',
    name: 'Monthly Environmental Performance Report',
    description:
      'A monthly report template for tracking key environmental performance indicators including energy consumption, water usage, waste generation, emissions, and compliance status. Supports ISO 14001 Clause 9.1 monitoring requirements.',
    module: 'ENVIRONMENT',
    category: 'REPORTING',
    tags: ['performance', 'KPI', 'energy', 'water', 'waste', 'emissions', 'monthly report'],
    isoClause: '9.1.1',
    fields: [
      // ── Section: Report Header ──
      {
        id: 'section_header',
        label: 'Report Information',
        type: 'section',
      },
      {
        id: 'reporting_period',
        label: 'Reporting Period',
        type: 'text',
        required: true,
        placeholder: 'e.g. January 2026',
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'site',
        label: 'Site / Facility',
        type: 'text',
        required: true,
        placeholder: 'e.g. Main manufacturing plant',
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'prepared_by',
        label: 'Prepared By',
        type: 'text',
        required: true,
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'report_date',
        label: 'Report Date',
        type: 'date',
        required: true,
        width: 'half',
        section: 'section_header',
      },

      // ── Section: Energy Consumption ──
      {
        id: 'section_energy',
        label: 'Energy Consumption',
        type: 'section',
        helpText: 'Record energy consumption data for the reporting period.',
      },
      {
        id: 'electricity_kwh',
        label: 'Electricity (kWh)',
        type: 'number',
        required: true,
        placeholder: 'Total kWh consumed',
        helpText: 'Total electricity consumption from meter readings or utility bills.',
        validation: { min: 0 },
        width: 'third',
        section: 'section_energy',
      },
      {
        id: 'gas_kwh',
        label: 'Natural Gas (kWh)',
        type: 'number',
        placeholder: 'Total gas in kWh equivalent',
        validation: { min: 0 },
        width: 'third',
        section: 'section_energy',
      },
      {
        id: 'other_fuel',
        label: 'Other Fuels (kWh equivalent)',
        type: 'number',
        placeholder: 'Diesel, LPG, etc.',
        helpText: 'Convert to kWh equivalent using standard conversion factors.',
        validation: { min: 0 },
        width: 'third',
        section: 'section_energy',
      },
      {
        id: 'energy_intensity',
        label: 'Energy Intensity (kWh per unit of production)',
        type: 'number',
        helpText: 'Total energy divided by production output.',
        validation: { min: 0 },
        width: 'half',
        section: 'section_energy',
      },
      {
        id: 'renewable_percentage',
        label: 'Renewable Energy (%)',
        type: 'number',
        helpText: 'Percentage of total energy from renewable sources.',
        validation: { min: 0, max: 100 },
        width: 'half',
        section: 'section_energy',
      },

      // ── Section: Water Usage ──
      {
        id: 'section_water',
        label: 'Water Usage',
        type: 'section',
      },
      {
        id: 'water_consumption_m3',
        label: 'Total Water Consumption (m3)',
        type: 'number',
        required: true,
        validation: { min: 0 },
        helpText: 'Total mains water from meter readings.',
        width: 'third',
        section: 'section_water',
      },
      {
        id: 'water_recycled_m3',
        label: 'Recycled / Reclaimed Water (m3)',
        type: 'number',
        validation: { min: 0 },
        width: 'third',
        section: 'section_water',
      },
      {
        id: 'water_discharge_m3',
        label: 'Wastewater Discharged (m3)',
        type: 'number',
        validation: { min: 0 },
        helpText: 'Total discharge to sewer or treatment.',
        width: 'third',
        section: 'section_water',
      },

      // ── Section: Waste Generated ──
      {
        id: 'section_waste',
        label: 'Waste Generation',
        type: 'section',
        helpText: 'Record waste generated by type during the reporting period.',
      },
      {
        id: 'waste_table',
        label: 'Waste Streams',
        type: 'table',
        required: true,
        helpText: 'Add one row per waste stream.',
        columns: [
          {
            id: 'waste_type',
            label: 'Waste Type',
            type: 'text',
            placeholder: 'e.g. General waste',
          },
          {
            id: 'classification',
            label: 'Classification',
            type: 'select',
            options: [
              { label: 'Non-hazardous', value: 'non_hazardous' },
              { label: 'Hazardous', value: 'hazardous' },
              { label: 'Inert', value: 'inert' },
            ],
          },
          { id: 'quantity_tonnes', label: 'Quantity (tonnes)', type: 'number' },
          {
            id: 'disposal_method',
            label: 'Disposal Method',
            type: 'select',
            options: [
              { label: 'Recycled', value: 'recycled' },
              { label: 'Composted', value: 'composted' },
              { label: 'Energy recovery', value: 'energy_recovery' },
              { label: 'Landfill', value: 'landfill' },
              { label: 'Incineration', value: 'incineration' },
              { label: 'Special treatment', value: 'special' },
            ],
          },
          { id: 'ewc_code', label: 'EWC Code', type: 'text', placeholder: 'e.g. 20 03 01' },
        ],
        section: 'section_waste',
      },
      {
        id: 'recycling_rate',
        label: 'Recycling / Diversion Rate (%)',
        type: 'number',
        helpText:
          'Percentage of waste diverted from landfill (recycled + composted + energy recovery).',
        validation: { min: 0, max: 100 },
        width: 'half',
        section: 'section_waste',
      },

      // ── Section: Emissions ──
      {
        id: 'section_emissions',
        label: 'Emissions Data',
        type: 'section',
      },
      {
        id: 'scope1_co2',
        label: 'Scope 1 CO2e (tonnes)',
        type: 'number',
        helpText: 'Direct emissions from owned/controlled sources (gas, fleet, refrigerants).',
        validation: { min: 0 },
        width: 'third',
        section: 'section_emissions',
      },
      {
        id: 'scope2_co2',
        label: 'Scope 2 CO2e (tonnes)',
        type: 'number',
        helpText: 'Indirect emissions from purchased electricity.',
        validation: { min: 0 },
        width: 'third',
        section: 'section_emissions',
      },
      {
        id: 'scope3_co2',
        label: 'Scope 3 CO2e (tonnes)',
        type: 'number',
        helpText: 'Other indirect emissions (business travel, commuting, supply chain).',
        validation: { min: 0 },
        width: 'third',
        section: 'section_emissions',
      },
      {
        id: 'voc_emissions',
        label: 'VOC Emissions (kg)',
        type: 'number',
        helpText: 'Volatile Organic Compound emissions if applicable.',
        validation: { min: 0 },
        width: 'half',
        section: 'section_emissions',
      },

      // ── Section: Compliance ──
      {
        id: 'section_compliance',
        label: 'Compliance Status',
        type: 'section',
      },
      {
        id: 'permit_breaches',
        label: 'Number of Permit / Licence Breaches',
        type: 'number',
        required: true,
        defaultValue: 0,
        validation: { min: 0 },
        width: 'third',
        section: 'section_compliance',
      },
      {
        id: 'environmental_complaints',
        label: 'Environmental Complaints Received',
        type: 'number',
        required: true,
        defaultValue: 0,
        validation: { min: 0 },
        width: 'third',
        section: 'section_compliance',
      },
      {
        id: 'spills_releases',
        label: 'Spills / Uncontrolled Releases',
        type: 'number',
        required: true,
        defaultValue: 0,
        validation: { min: 0 },
        width: 'third',
        section: 'section_compliance',
      },
      {
        id: 'compliance_notes',
        label: 'Compliance Notes',
        type: 'textarea',
        placeholder:
          'Note any compliance issues, regulatory visits, or enforcement actions this period.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_compliance',
      },

      // ── Section: Trends ──
      {
        id: 'section_trends',
        label: 'Trends & Commentary',
        type: 'section',
      },
      {
        id: 'trends',
        label: 'Trends & Analysis',
        type: 'textarea',
        required: true,
        placeholder:
          'Compare this period to previous months and same period last year. Highlight improving and deteriorating trends, explain variances, and note any exceptional circumstances.',
        helpText: 'Reference specific KPIs and explain any significant changes.',
        validation: { maxLength: 3000 },
        width: 'full',
        section: 'section_trends',
      },
    ],
  },

  // ─── TPL-ENV-004  Waste Management Plan ────────────────────────────
  {
    code: 'TPL-ENV-004',
    name: 'Waste Management Plan',
    description:
      'A comprehensive waste management plan documenting waste streams, storage requirements, disposal methods, contractor details, and regulatory references. Ensures duty of care compliance and effective waste minimisation.',
    module: 'ENVIRONMENT',
    category: 'PLANNING',
    tags: ['waste', 'duty of care', 'disposal', 'recycling', 'contractor', 'EWC'],
    isoClause: '8.1',
    fields: [
      // ── Section: Plan Header ──
      {
        id: 'section_header',
        label: 'Plan Information',
        type: 'section',
      },
      {
        id: 'plan_ref',
        label: 'Plan Reference',
        type: 'text',
        required: true,
        placeholder: 'e.g. WMP-2026-001',
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'site',
        label: 'Site / Facility',
        type: 'text',
        required: true,
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'prepared_by',
        label: 'Prepared By',
        type: 'text',
        required: true,
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'effective_date',
        label: 'Effective Date',
        type: 'date',
        required: true,
        width: 'half',
        section: 'section_header',
      },
      {
        id: 'review_date',
        label: 'Review Date',
        type: 'date',
        required: true,
        helpText: 'Plans should be reviewed at least annually.',
        width: 'half',
        section: 'section_header',
      },

      // ── Section: Waste Streams ──
      {
        id: 'section_streams',
        label: 'Waste Streams Inventory',
        type: 'section',
        helpText: 'Document all waste streams generated at the site.',
      },
      {
        id: 'waste_streams_table',
        label: 'Waste Streams',
        type: 'table',
        required: true,
        helpText:
          'Add one row per waste stream. Include the EWC code, source, and estimated volume.',
        columns: [
          { id: 'stream_ref', label: 'Ref', type: 'text', placeholder: 'WS-01' },
          {
            id: 'waste_description',
            label: 'Waste Description',
            type: 'text',
            placeholder: 'e.g. Spent cutting oil',
          },
          { id: 'ewc_code', label: 'EWC Code', type: 'text', placeholder: '12 01 07*' },
          {
            id: 'classification',
            label: 'Classification',
            type: 'select',
            options: [
              { label: 'Non-hazardous', value: 'non_hazardous' },
              { label: 'Hazardous', value: 'hazardous' },
              { label: 'Inert', value: 'inert' },
            ],
          },
          {
            id: 'source',
            label: 'Source / Process',
            type: 'text',
            placeholder: 'e.g. CNC machining',
          },
          {
            id: 'estimated_volume',
            label: 'Est. Volume (per month)',
            type: 'text',
            placeholder: 'e.g. 200 litres',
          },
        ],
        section: 'section_streams',
      },

      // ── Section: Storage Requirements ──
      {
        id: 'section_storage',
        label: 'Storage Requirements',
        type: 'section',
        helpText: 'Detail how each waste stream is stored on site prior to collection.',
      },
      {
        id: 'storage_requirements',
        label: 'Storage Arrangements',
        type: 'textarea',
        required: true,
        placeholder:
          'Describe storage containers, locations, labelling, segregation, bunding/containment, and security measures for each waste stream.',
        helpText:
          'Hazardous waste must be stored in suitable, labelled containers with secondary containment.',
        validation: { maxLength: 3000 },
        width: 'full',
        section: 'section_storage',
      },
      {
        id: 'storage_map_attached',
        label: 'Site Storage Map Attached',
        type: 'file',
        helpText: 'Attach a site map showing waste storage locations.',
        section: 'section_storage',
      },

      // ── Section: Disposal Methods ──
      {
        id: 'section_disposal',
        label: 'Disposal / Treatment Methods',
        type: 'section',
      },
      {
        id: 'disposal_methods',
        label: 'Disposal Methods Summary',
        type: 'textarea',
        required: true,
        placeholder:
          'For each waste stream, describe the disposal or treatment method: recycling, recovery, incineration, landfill, etc. Reference the waste hierarchy.',
        helpText:
          'Apply the waste hierarchy: Prevention > Reuse > Recycling > Recovery > Disposal.',
        validation: { maxLength: 3000 },
        width: 'full',
        section: 'section_disposal',
      },

      // ── Section: Contractor Details ──
      {
        id: 'section_contractors',
        label: 'Waste Contractor Details',
        type: 'section',
        helpText: 'Document all registered waste carriers and disposal facilities used.',
      },
      {
        id: 'contractors_table',
        label: 'Waste Contractors',
        type: 'table',
        required: true,
        helpText:
          'Record details of each waste contractor. Verify carrier licence and site permit before use.',
        columns: [
          { id: 'contractor_name', label: 'Contractor Name', type: 'text' },
          {
            id: 'carrier_licence',
            label: 'Carrier Licence Number',
            type: 'text',
            placeholder: 'e.g. CBDU12345',
          },
          { id: 'licence_expiry', label: 'Licence Expiry', type: 'date' },
          {
            id: 'waste_types_handled',
            label: 'Waste Types Handled',
            type: 'text',
            placeholder: 'e.g. Hazardous liquids',
          },
          {
            id: 'disposal_facility',
            label: 'Disposal Facility',
            type: 'text',
            placeholder: 'Site name and permit no.',
          },
          { id: 'contact', label: 'Contact Details', type: 'text' },
        ],
        section: 'section_contractors',
      },

      // ── Section: Regulatory References ──
      {
        id: 'section_regulatory',
        label: 'Regulatory References',
        type: 'section',
      },
      {
        id: 'regulatory_references',
        label: 'Applicable Regulations',
        type: 'textarea',
        required: true,
        placeholder:
          'List all applicable waste regulations, permit conditions, and consents (e.g. Environmental Permitting Regulations, Duty of Care, Hazardous Waste Regulations).',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_regulatory',
      },
      {
        id: 'permit_numbers',
        label: 'Permit / Licence Numbers',
        type: 'text',
        placeholder: 'e.g. EP-12345, T11 Exemption',
        width: 'full',
        section: 'section_regulatory',
      },

      // ── Section: Minimisation Targets ──
      {
        id: 'section_targets',
        label: 'Waste Minimisation Targets',
        type: 'section',
      },
      {
        id: 'minimisation_targets',
        label: 'Targets',
        type: 'textarea',
        placeholder:
          'State waste minimisation and recycling targets (e.g. reduce landfill waste by 10% year-on-year, achieve 90% recycling rate).',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_targets',
      },

      // ── Section: Sign-off ──
      {
        id: 'section_signoff',
        label: 'Sign-Off',
        type: 'section',
      },
      {
        id: 'approved_by',
        label: 'Approved By',
        type: 'text',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
      {
        id: 'approver_signature',
        label: 'Approver Signature',
        type: 'signature',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
    ],
  },

  // ─── TPL-ENV-005  ISO 14001 Internal Audit Checklist ───────────────
  {
    code: 'TPL-ENV-005',
    name: 'ISO 14001 Internal Audit Checklist',
    description:
      'Comprehensive internal audit checklist for the Environmental Management System aligned with ISO 14001:2015 clauses 4-10. Records conformity assessments, objective evidence, and findings for each requirement.',
    module: 'ENVIRONMENT',
    category: 'AUDIT',
    tags: ['ISO 14001', 'audit', 'internal audit', 'EMS', 'conformity', 'certification'],
    isoClause: '9.2.2',
    fields: [
      // ── Section: Audit Header ──
      {
        id: 'section_header',
        label: 'Audit Information',
        type: 'section',
      },
      {
        id: 'audit_number',
        label: 'Audit Number',
        type: 'text',
        required: true,
        placeholder: 'e.g. IA-EMS-2026-002',
        helpText: 'Unique audit identifier from the audit programme.',
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'audit_scope',
        label: 'Audit Scope',
        type: 'textarea',
        required: true,
        placeholder:
          'e.g. ISO 14001 Clauses 4-10 covering all manufacturing processes at Main Site',
        helpText: 'Define the scope including clauses, processes, departments, and sites covered.',
        validation: { maxLength: 1000 },
        width: 'full',
        section: 'section_header',
      },
      {
        id: 'audit_criteria',
        label: 'Audit Criteria',
        type: 'text',
        required: true,
        placeholder: 'ISO 14001:2015, environmental permits, internal procedures',
        defaultValue: 'ISO 14001:2015',
        width: 'half',
        section: 'section_header',
      },
      {
        id: 'lead_auditor',
        label: 'Lead Auditor',
        type: 'text',
        required: true,
        width: 'half',
        section: 'section_header',
      },
      {
        id: 'audit_team',
        label: 'Audit Team Members',
        type: 'text',
        placeholder: 'Names of additional audit team members',
        width: 'half',
        section: 'section_header',
      },
      {
        id: 'audit_date',
        label: 'Audit Date',
        type: 'date',
        required: true,
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'auditee_department',
        label: 'Auditee Department / Process',
        type: 'text',
        required: true,
        placeholder: 'e.g. Manufacturing, Warehouse, Facilities',
        width: 'third',
        section: 'section_header',
      },

      // ── Section: Clause Audit ──
      {
        id: 'section_clauses',
        label: 'Clause-by-Clause Audit',
        type: 'section',
        helpText: 'Assess conformity against each ISO 14001:2015 requirement in scope.',
      },
      {
        id: 'clauses_table',
        label: 'Audit Findings by Clause',
        type: 'table',
        required: true,
        helpText:
          'One row per clause or sub-clause assessed. Reference the specific ISO 14001 clause number.',
        columns: [
          { id: 'clause_ref', label: 'Clause', type: 'text', placeholder: 'e.g. 6.1.2' },
          {
            id: 'requirement',
            label: 'Requirement Summary',
            type: 'text',
            placeholder: 'e.g. Environmental aspects',
          },
          {
            id: 'conformity',
            label: 'Conformity',
            type: 'select',
            options: [
              { label: 'Conforming', value: 'conforming' },
              { label: 'Minor Non-Conformity', value: 'minor_nc' },
              { label: 'Major Non-Conformity', value: 'major_nc' },
              { label: 'Observation', value: 'observation' },
              { label: 'Not Assessed', value: 'not_assessed' },
              { label: 'Not Applicable', value: 'na' },
            ],
          },
          {
            id: 'evidence',
            label: 'Objective Evidence',
            type: 'text',
            placeholder: 'Records, interviews, observations',
          },
          {
            id: 'finding',
            label: 'Finding / Notes',
            type: 'text',
            placeholder: 'Details of conformity or non-conformity',
          },
        ],
        section: 'section_clauses',
      },

      // ── Section: Non-Conformities ──
      {
        id: 'section_ncrs',
        label: 'Non-Conformity Reports',
        type: 'section',
        helpText: 'Raise formal NCRs for each non-conformity identified.',
      },
      {
        id: 'ncrs_table',
        label: 'NCR Register',
        type: 'table',
        helpText:
          'One row per non-conformity. Assign corrective actions with responsible persons and dates.',
        columns: [
          { id: 'ncr_ref', label: 'NCR Ref', type: 'text', placeholder: 'NCR-ENV-001' },
          {
            id: 'ncr_type',
            label: 'Type',
            type: 'select',
            options: [
              { label: 'Minor', value: 'minor' },
              { label: 'Major', value: 'major' },
            ],
          },
          { id: 'clause_ref', label: 'Clause', type: 'text', placeholder: '6.1.2' },
          { id: 'ncr_description', label: 'Description of Non-Conformity', type: 'text' },
          {
            id: 'root_cause',
            label: 'Root Cause',
            type: 'text',
            placeholder: 'Identified root cause',
          },
          { id: 'corrective_action', label: 'Corrective Action Required', type: 'text' },
          { id: 'responsible', label: 'Responsible Person', type: 'text' },
          { id: 'due_date', label: 'Due Date', type: 'date' },
        ],
        section: 'section_ncrs',
      },

      // ── Section: Opportunities ──
      {
        id: 'section_ofi',
        label: 'Opportunities for Improvement',
        type: 'section',
      },
      {
        id: 'opportunities',
        label: 'Opportunities for Improvement (OFI)',
        type: 'textarea',
        placeholder:
          'List any opportunities to enhance the EMS, even where requirements are being met.',
        helpText:
          'OFIs are not non-conformities but represent areas where environmental performance could be improved.',
        validation: { maxLength: 3000 },
        width: 'full',
        section: 'section_ofi',
      },

      // ── Section: Conclusion ──
      {
        id: 'section_conclusion',
        label: 'Audit Conclusion',
        type: 'section',
      },
      {
        id: 'audit_conclusion',
        label: 'Audit Conclusion',
        type: 'textarea',
        required: true,
        placeholder:
          'Summarise the overall audit findings, number of NCs, and opinion on EMS effectiveness and conformity to ISO 14001:2015.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_conclusion',
      },
      {
        id: 'auditor_signature',
        label: 'Lead Auditor Signature',
        type: 'signature',
        required: true,
        width: 'half',
        section: 'section_conclusion',
      },
      {
        id: 'audit_close_date',
        label: 'Audit Close Date',
        type: 'date',
        required: true,
        width: 'half',
        section: 'section_conclusion',
      },
    ],
  },

  // ─── TPL-ENV-006  Compliance Evaluation Record ─────────────────────
  {
    code: 'TPL-ENV-006',
    name: 'Compliance Evaluation Record',
    description:
      'Formal record of environmental compliance evaluation against legal and other requirements. Tracks the compliance status of each obligation, identifies gaps, and assigns corrective actions. Required by ISO 14001 Clause 9.1.2.',
    module: 'ENVIRONMENT',
    category: 'COMPLIANCE',
    tags: ['compliance', 'legal', 'evaluation', 'ISO 14001', 'regulatory', 'obligations'],
    isoClause: '9.1.2',
    fields: [
      // ── Section: Evaluation Header ──
      {
        id: 'section_header',
        label: 'Evaluation Details',
        type: 'section',
      },
      {
        id: 'evaluation_ref',
        label: 'Evaluation Reference',
        type: 'text',
        required: true,
        placeholder: 'e.g. CE-ENV-2026-Q1',
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'evaluation_date',
        label: 'Evaluation Date',
        type: 'date',
        required: true,
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'evaluator',
        label: 'Evaluator',
        type: 'text',
        required: true,
        placeholder: 'Name of person conducting the evaluation',
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'evaluation_scope',
        label: 'Evaluation Scope',
        type: 'textarea',
        required: true,
        placeholder:
          'Define the scope of this compliance evaluation: which regulations, permits, and obligations are being assessed.',
        validation: { maxLength: 1500 },
        width: 'full',
        section: 'section_header',
      },
      {
        id: 'evaluation_method',
        label: 'Evaluation Method',
        type: 'multiselect',
        helpText: 'How was compliance evaluated?',
        options: [
          { label: 'Document review', value: 'document_review' },
          { label: 'Site inspection', value: 'site_inspection' },
          { label: 'Monitoring data review', value: 'monitoring_data' },
          { label: 'Interview with responsible persons', value: 'interviews' },
          { label: 'Third-party audit report', value: 'third_party' },
          { label: 'Regulatory correspondence review', value: 'correspondence' },
        ],
        width: 'full',
        section: 'section_header',
      },

      // ── Section: Compliance Register ──
      {
        id: 'section_register',
        label: 'Compliance Obligations Assessment',
        type: 'section',
        helpText: 'Evaluate each compliance obligation and record the evidence and status.',
      },
      {
        id: 'regulation',
        label: 'Regulation / Requirement',
        type: 'text',
        required: true,
        placeholder: 'e.g. Environmental Permitting Regulations 2016',
        helpText: 'Name and reference of the legal or other requirement.',
        width: 'half',
        section: 'section_register',
      },
      {
        id: 'obligation_detail',
        label: 'Specific Requirement',
        type: 'textarea',
        required: true,
        placeholder: 'State the specific obligation or condition that applies to the organisation.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_register',
      },
      {
        id: 'compliance_status',
        label: 'Compliance Status',
        type: 'select',
        required: true,
        options: [
          { label: 'Fully Compliant', value: 'compliant' },
          { label: 'Partially Compliant', value: 'partial' },
          { label: 'Non-Compliant', value: 'non_compliant' },
          { label: 'Not Applicable', value: 'na' },
          { label: 'Under Review', value: 'under_review' },
        ],
        width: 'half',
        section: 'section_register',
      },
      {
        id: 'evidence',
        label: 'Evidence of Compliance',
        type: 'textarea',
        required: true,
        placeholder:
          'Describe the objective evidence reviewed to determine compliance status (e.g. monitoring records, permits, procedures, training records).',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_register',
      },
      {
        id: 'gaps',
        label: 'Gaps Identified',
        type: 'textarea',
        placeholder: 'Describe any gaps, deficiencies, or risks to ongoing compliance.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_register',
      },
      {
        id: 'corrective_actions_needed',
        label: 'Corrective Actions Required',
        type: 'textarea',
        placeholder:
          'Describe any corrective or preventive actions required to address gaps or achieve full compliance.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_register',
      },
      {
        id: 'action_owner',
        label: 'Action Owner',
        type: 'text',
        placeholder: 'Person responsible for corrective actions',
        width: 'half',
        section: 'section_register',
      },
      {
        id: 'action_due_date',
        label: 'Action Due Date',
        type: 'date',
        width: 'half',
        section: 'section_register',
      },

      // ── Section: Overall Summary ──
      {
        id: 'section_summary',
        label: 'Evaluation Summary',
        type: 'section',
      },
      {
        id: 'overall_compliance_rating',
        label: 'Overall Compliance Rating',
        type: 'select',
        required: true,
        options: [
          { label: 'Fully Compliant — All obligations met', value: 'fully_compliant' },
          { label: 'Substantially Compliant — Minor gaps only', value: 'substantially_compliant' },
          { label: 'Partially Compliant — Significant gaps exist', value: 'partially_compliant' },
          { label: 'Non-Compliant — Critical failures identified', value: 'non_compliant' },
        ],
        width: 'full',
        section: 'section_summary',
      },
      {
        id: 'summary_notes',
        label: 'Summary Notes',
        type: 'textarea',
        placeholder: 'Summarise the overall compliance position, key risks, and priority actions.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_summary',
      },
      {
        id: 'next_evaluation_date',
        label: 'Next Evaluation Date',
        type: 'date',
        required: true,
        helpText:
          'Compliance evaluations should be conducted at least annually or when significant changes occur.',
        width: 'half',
        section: 'section_summary',
      },
      {
        id: 'evaluator_signature',
        label: 'Evaluator Signature',
        type: 'signature',
        required: true,
        width: 'half',
        section: 'section_summary',
      },
    ],
  },

  // ─── TPL-ENV-007  Environmental Management Review ──────────────────
  {
    code: 'TPL-ENV-007',
    name: 'Environmental Management Review',
    description:
      'Structured management review agenda and minutes for the Environmental Management System, aligned with ISO 14001:2015 Clause 9.3. Covers all required inputs (policy, objectives, audit results, compliance, environmental performance) and outputs (decisions, actions, resource needs).',
    module: 'ENVIRONMENT',
    category: 'MANAGEMENT_REVIEW',
    tags: [
      'management review',
      'ISO 14001',
      'clause 9.3',
      'continual improvement',
      'top management',
    ],
    isoClause: '9.3',
    fields: [
      // ── Section: Meeting Details ──
      {
        id: 'section_meeting',
        label: 'Meeting Details',
        type: 'section',
      },
      {
        id: 'review_date',
        label: 'Review Date',
        type: 'date',
        required: true,
        width: 'third',
        section: 'section_meeting',
      },
      {
        id: 'review_number',
        label: 'Review Number',
        type: 'text',
        placeholder: 'e.g. MR-ENV-2026-Q1',
        width: 'third',
        section: 'section_meeting',
      },
      {
        id: 'chair',
        label: 'Chair / Top Management Representative',
        type: 'text',
        required: true,
        placeholder: 'Name and title',
        width: 'third',
        section: 'section_meeting',
      },
      {
        id: 'attendees',
        label: 'Attendees',
        type: 'textarea',
        required: true,
        placeholder: 'List all attendees with their roles.',
        helpText: 'Top management must be represented per ISO 14001 Clause 9.3.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_meeting',
      },

      // ── Section: Input — Policy & Strategy ──
      {
        id: 'section_input_policy',
        label: 'Input: Environmental Policy & Strategic Direction',
        type: 'section',
        helpText:
          'ISO 14001 Clause 9.3 — Suitability of the environmental policy and alignment with strategic direction.',
      },
      {
        id: 'policy_review',
        label: 'Environmental Policy Review',
        type: 'textarea',
        required: true,
        placeholder:
          "Review the continuing suitability of the environmental policy. Does it still reflect the organisation's context, scope, and commitment to protection of the environment?",
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_input_policy',
      },

      // ── Section: Input — Objectives Progress ──
      {
        id: 'section_input_objectives',
        label: 'Input: Environmental Objectives & Targets',
        type: 'section',
        helpText: 'Progress against environmental objectives and targets set for the period.',
      },
      {
        id: 'objectives_progress',
        label: 'Objectives Progress',
        type: 'textarea',
        required: true,
        placeholder:
          'Review each environmental objective. Report on KPI achievement, percentage complete, and any objectives at risk.',
        validation: { maxLength: 3000 },
        width: 'full',
        section: 'section_input_objectives',
      },

      // ── Section: Input — Audit Results ──
      {
        id: 'section_input_audit',
        label: 'Input: Internal Audit Results',
        type: 'section',
      },
      {
        id: 'previous_actions_status',
        label: 'Status of Actions from Previous Review',
        type: 'textarea',
        required: true,
        placeholder: 'Summarise the status of actions from the previous management review.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_input_audit',
      },
      {
        id: 'audit_results',
        label: 'Internal Audit Results Summary',
        type: 'textarea',
        required: true,
        placeholder:
          'Summarise key audit findings, number of NCs (minor/major), trends, and closure rates.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_input_audit',
      },

      // ── Section: Input — Compliance ──
      {
        id: 'section_input_compliance',
        label: 'Input: Compliance with Legal & Other Requirements',
        type: 'section',
      },
      {
        id: 'compliance_status',
        label: 'Compliance Evaluation Summary',
        type: 'textarea',
        required: true,
        placeholder:
          'Summarise the results of compliance evaluations. Note any breaches, enforcement actions, new legislation, or permit changes.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_input_compliance',
      },

      // ── Section: Input — Environmental Performance ──
      {
        id: 'section_input_performance',
        label: 'Input: Environmental Performance',
        type: 'section',
        helpText: 'Key environmental performance metrics and trends.',
      },
      {
        id: 'performance_summary',
        label: 'Environmental Performance Summary',
        type: 'textarea',
        required: true,
        placeholder:
          'Present key environmental KPIs: energy use, water use, waste generation, emissions, spills. Show trends against targets and prior periods.',
        validation: { maxLength: 3000 },
        width: 'full',
        section: 'section_input_performance',
      },
      {
        id: 'significant_incidents',
        label: 'Significant Environmental Incidents',
        type: 'textarea',
        placeholder:
          'Detail any significant environmental incidents, spills, or complaints since the last review.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_input_performance',
      },

      // ── Section: Input — External Changes ──
      {
        id: 'section_input_changes',
        label: 'Input: Changes in External & Internal Issues',
        type: 'section',
      },
      {
        id: 'changes_issues',
        label: 'Changes in Context',
        type: 'textarea',
        placeholder:
          'Note any changes in external issues (legislation, market, climate), internal issues (processes, products, structure), or stakeholder expectations.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_input_changes',
      },

      // ── Section: Output — Decisions ──
      {
        id: 'section_output_decisions',
        label: 'Output: Decisions & Directions',
        type: 'section',
        helpText: 'ISO 14001 Clause 9.3 — Conclusions and decisions of the review.',
      },
      {
        id: 'decisions_table',
        label: 'Decisions Made',
        type: 'table',
        required: true,
        helpText:
          'Record strategic decisions, changes to policy, new objectives, and resource allocations.',
        columns: [
          { id: 'decision_ref', label: 'Ref', type: 'text', placeholder: 'D-01' },
          { id: 'decision', label: 'Decision / Direction', type: 'text' },
          { id: 'rationale', label: 'Rationale', type: 'text' },
          {
            id: 'resources',
            label: 'Resources Required',
            type: 'text',
            placeholder: 'Budget, personnel',
          },
          { id: 'owner', label: 'Owner', type: 'text' },
        ],
        section: 'section_output_decisions',
      },

      // ── Section: Output — Actions ──
      {
        id: 'section_output_actions',
        label: 'Output: Action Items',
        type: 'section',
      },
      {
        id: 'action_items_table',
        label: 'Action Items',
        type: 'table',
        required: true,
        columns: [
          { id: 'action_ref', label: 'Action #', type: 'text', placeholder: 'MR-ENV-ACT-01' },
          { id: 'action_description', label: 'Action', type: 'text' },
          {
            id: 'priority',
            label: 'Priority',
            type: 'select',
            options: [
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' },
            ],
          },
          { id: 'responsible', label: 'Responsible Person', type: 'text' },
          { id: 'due_date', label: 'Due Date', type: 'date' },
          {
            id: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { label: 'Open', value: 'open' },
              { label: 'In Progress', value: 'in_progress' },
              { label: 'Complete', value: 'complete' },
            ],
          },
        ],
        section: 'section_output_actions',
      },

      // ── Section: Resource Needs ──
      {
        id: 'section_resources',
        label: 'Output: Resource Needs',
        type: 'section',
      },
      {
        id: 'resource_needs',
        label: 'Resource Requirements',
        type: 'textarea',
        placeholder:
          'Describe any additional resources (budget, personnel, training, equipment, technology) needed to improve the EMS.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_resources',
      },

      // ── Section: Next Review ──
      {
        id: 'section_next_review',
        label: 'Next Review',
        type: 'section',
      },
      {
        id: 'next_review_date',
        label: 'Next Management Review Date',
        type: 'date',
        required: true,
        helpText: 'Typically quarterly or semi-annually.',
        width: 'half',
        section: 'section_next_review',
      },
      {
        id: 'chair_signature',
        label: 'Chair Signature',
        type: 'signature',
        required: true,
        width: 'half',
        section: 'section_next_review',
      },
    ],
  },

  // ─── TPL-ENV-008  Emergency Response Plan ──────────────────────────
  {
    code: 'TPL-ENV-008',
    name: 'Environmental Emergency Response Plan',
    description:
      'An environmental emergency preparedness and response plan covering spill scenarios, response procedures, roles and responsibilities, equipment requirements, communication protocols, and drill schedules. Required by ISO 14001 Clause 8.2.',
    module: 'ENVIRONMENT',
    category: 'PLANNING',
    tags: ['emergency', 'spill', 'response', 'preparedness', 'ISO 14001', 'contingency'],
    isoClause: '8.2',
    fields: [
      // ── Section: Plan Header ──
      {
        id: 'section_header',
        label: 'Plan Information',
        type: 'section',
      },
      {
        id: 'plan_ref',
        label: 'Plan Reference',
        type: 'text',
        required: true,
        placeholder: 'e.g. ERP-ENV-2026-001',
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'site',
        label: 'Site / Facility',
        type: 'text',
        required: true,
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'version',
        label: 'Version',
        type: 'text',
        placeholder: 'e.g. v2.0',
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'effective_date',
        label: 'Effective Date',
        type: 'date',
        required: true,
        width: 'half',
        section: 'section_header',
      },
      {
        id: 'review_date',
        label: 'Review Date',
        type: 'date',
        required: true,
        helpText:
          'Emergency plans must be reviewed at least annually and after any drill or actual emergency.',
        width: 'half',
        section: 'section_header',
      },

      // ── Section: Scenario ──
      {
        id: 'section_scenario',
        label: 'Emergency Scenario',
        type: 'section',
        helpText: 'Define the environmental emergency scenario this plan addresses.',
      },
      {
        id: 'scenario_type',
        label: 'Scenario Type',
        type: 'select',
        required: true,
        options: [
          { label: 'Chemical / oil spill to land', value: 'spill_land' },
          { label: 'Chemical / oil spill to water', value: 'spill_water' },
          { label: 'Uncontrolled air emission', value: 'air_emission' },
          { label: 'Fire with environmental impact', value: 'fire' },
          { label: 'Flood / stormwater pollution', value: 'flood' },
          { label: 'Hazardous waste release', value: 'waste_release' },
          { label: 'Tank / bund failure', value: 'tank_failure' },
          { label: 'Sewer / drainage pollution', value: 'drainage' },
          { label: 'Other', value: 'other' },
        ],
        width: 'half',
        section: 'section_scenario',
      },
      {
        id: 'scenario_description',
        label: 'Scenario Description',
        type: 'textarea',
        required: true,
        placeholder:
          'Describe the emergency scenario in detail: what substance, what quantity, where it could occur, and what environmental receptors are at risk.',
        validation: { maxLength: 3000 },
        width: 'full',
        section: 'section_scenario',
      },
      {
        id: 'potential_environmental_impact',
        label: 'Potential Environmental Impact',
        type: 'textarea',
        required: true,
        placeholder:
          'Describe the worst-case environmental impact if this scenario occurs without intervention (e.g. contamination of nearby watercourse, soil contamination over X area).',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_scenario',
      },

      // ── Section: Response Procedures ──
      {
        id: 'section_response',
        label: 'Response Procedures',
        type: 'section',
        helpText: 'Step-by-step response actions.',
      },
      {
        id: 'immediate_response',
        label: 'Immediate Response Actions',
        type: 'textarea',
        required: true,
        placeholder:
          'List the immediate actions in chronological order: 1. Raise alarm, 2. Isolate source, 3. Deploy spill kit, 4. Contain spread, 5. Notify environmental coordinator...',
        helpText:
          'These must be concise and actionable — responders may refer to this under pressure.',
        validation: { maxLength: 3000 },
        width: 'full',
        section: 'section_response',
      },
      {
        id: 'containment_procedures',
        label: 'Containment & Clean-up Procedures',
        type: 'textarea',
        required: true,
        placeholder:
          'Describe detailed containment and remediation steps: materials to use, waste disposal, decontamination, sampling requirements.',
        validation: { maxLength: 3000 },
        width: 'full',
        section: 'section_response',
      },

      // ── Section: Roles & Responsibilities ──
      {
        id: 'section_roles',
        label: 'Roles & Responsibilities',
        type: 'section',
      },
      {
        id: 'roles_table',
        label: 'Emergency Roles',
        type: 'table',
        required: true,
        helpText: 'Define who does what during an environmental emergency.',
        columns: [
          {
            id: 'role',
            label: 'Role',
            type: 'text',
            placeholder: 'e.g. Environmental Coordinator',
          },
          { id: 'name', label: 'Named Person', type: 'text' },
          {
            id: 'responsibilities',
            label: 'Key Responsibilities',
            type: 'text',
            placeholder: 'e.g. Co-ordinate response, notify regulators',
          },
          { id: 'contact_phone', label: 'Contact Phone', type: 'tel' },
          { id: 'backup_name', label: 'Backup / Deputy', type: 'text' },
        ],
        section: 'section_roles',
      },

      // ── Section: Equipment ──
      {
        id: 'section_equipment',
        label: 'Equipment & Resources',
        type: 'section',
      },
      {
        id: 'equipment_needed',
        label: 'Emergency Equipment Required',
        type: 'textarea',
        required: true,
        placeholder:
          'List all equipment needed for this scenario: spill kits (type, quantity, location), PPE, absorbent materials, drain covers, pumps, containers, sampling equipment.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_equipment',
      },
      {
        id: 'equipment_locations',
        label: 'Equipment Locations',
        type: 'textarea',
        placeholder:
          'Describe where emergency equipment is stored. Attach a site map if available.',
        validation: { maxLength: 1000 },
        width: 'full',
        section: 'section_equipment',
      },
      {
        id: 'site_map',
        label: 'Site Map / Layout',
        type: 'file',
        helpText:
          'Attach a site map showing emergency equipment locations, drains, water courses, and muster points.',
        section: 'section_equipment',
      },

      // ── Section: Communication Plan ──
      {
        id: 'section_communication',
        label: 'Communication Plan',
        type: 'section',
        helpText: 'Define notification requirements and escalation procedures.',
      },
      {
        id: 'internal_notification',
        label: 'Internal Notification Procedure',
        type: 'textarea',
        required: true,
        placeholder:
          'Describe the internal notification chain: who to call first, escalation triggers, and how to communicate with employees.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_communication',
      },
      {
        id: 'external_notification',
        label: 'External Notification Requirements',
        type: 'textarea',
        required: true,
        placeholder:
          'List regulatory bodies and external parties that must be notified: Environment Agency (EA), local authority, water company, emergency services, neighbours.',
        helpText:
          'Include notification triggers (e.g. any release reaching a water course) and timescales.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_communication',
      },
      {
        id: 'ea_hotline',
        label: 'Environment Agency Incident Hotline',
        type: 'tel',
        placeholder: 'e.g. 0800 80 70 60',
        defaultValue: '0800 80 70 60',
        width: 'half',
        section: 'section_communication',
      },

      // ── Section: Drill Schedule ──
      {
        id: 'section_drills',
        label: 'Drill Schedule',
        type: 'section',
      },
      {
        id: 'drill_frequency',
        label: 'Drill Frequency',
        type: 'select',
        required: true,
        options: [
          { label: 'Quarterly', value: 'quarterly' },
          { label: 'Semi-annually', value: 'semi_annual' },
          { label: 'Annually', value: 'annual' },
        ],
        helpText: 'Minimum annually; high-risk scenarios should be drilled more frequently.',
        width: 'half',
        section: 'section_drills',
      },
      {
        id: 'next_drill_date',
        label: 'Next Scheduled Drill Date',
        type: 'date',
        width: 'half',
        section: 'section_drills',
      },
      {
        id: 'last_drill_date',
        label: 'Last Drill Conducted',
        type: 'date',
        width: 'half',
        section: 'section_drills',
      },
      {
        id: 'drill_notes',
        label: 'Drill Notes / Lessons Learned',
        type: 'textarea',
        placeholder: 'Record outcomes of the last drill and any actions arising.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_drills',
      },

      // ── Section: Sign-off ──
      {
        id: 'section_signoff',
        label: 'Plan Approval',
        type: 'section',
      },
      {
        id: 'prepared_by',
        label: 'Prepared By',
        type: 'text',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
      {
        id: 'approved_by',
        label: 'Approved By (Site Manager)',
        type: 'text',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
      {
        id: 'approver_signature',
        label: 'Approver Signature',
        type: 'signature',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
      {
        id: 'approval_date',
        label: 'Approval Date',
        type: 'date',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
    ],
  },

  // ─── TPL-ENV-009  Emergency Drill Record ───────────────────────────
  {
    code: 'TPL-ENV-009',
    name: 'Environmental Emergency Drill Record',
    description:
      'A record form for documenting environmental emergency drills, including the scenario tested, participants, timeline of events, performance evaluation, lessons learned, and follow-up actions. Supports ISO 14001 Clause 8.2 requirements for testing emergency response procedures.',
    module: 'ENVIRONMENT',
    category: 'INSPECTION',
    tags: ['drill', 'emergency', 'exercise', 'preparedness', 'ISO 14001', 'testing'],
    isoClause: '8.2',
    fields: [
      // ── Section: Drill Header ──
      {
        id: 'section_header',
        label: 'Drill Information',
        type: 'section',
      },
      {
        id: 'drill_ref',
        label: 'Drill Reference',
        type: 'text',
        required: true,
        placeholder: 'e.g. DRL-ENV-2026-003',
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'drill_type',
        label: 'Drill Type',
        type: 'select',
        required: true,
        options: [
          { label: 'Tabletop exercise', value: 'tabletop' },
          { label: 'Walk-through', value: 'walkthrough' },
          { label: 'Partial deployment (equipment only)', value: 'partial' },
          { label: 'Full deployment (live drill)', value: 'full' },
          { label: 'Unannounced drill', value: 'unannounced' },
        ],
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'drill_date',
        label: 'Drill Date',
        type: 'date',
        required: true,
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'drill_time_start',
        label: 'Start Time',
        type: 'text',
        required: true,
        placeholder: 'HH:MM',
        validation: { pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' },
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'drill_time_end',
        label: 'End Time',
        type: 'text',
        required: true,
        placeholder: 'HH:MM',
        validation: { pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' },
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'location',
        label: 'Location',
        type: 'text',
        required: true,
        placeholder: 'e.g. Chemical store, Building C',
        width: 'third',
        section: 'section_header',
      },
      {
        id: 'related_plan_ref',
        label: 'Related Emergency Response Plan',
        type: 'text',
        placeholder: 'e.g. ERP-ENV-2026-001',
        helpText: 'Reference to the emergency response plan being tested.',
        width: 'half',
        section: 'section_header',
      },
      {
        id: 'drill_coordinator',
        label: 'Drill Coordinator',
        type: 'text',
        required: true,
        width: 'half',
        section: 'section_header',
      },

      // ── Section: Scenario ──
      {
        id: 'section_scenario',
        label: 'Drill Scenario',
        type: 'section',
      },
      {
        id: 'scenario_description',
        label: 'Scenario Description',
        type: 'textarea',
        required: true,
        placeholder:
          'Describe the simulated emergency scenario: what was the assumed incident, its scale, and what response was expected.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_scenario',
      },
      {
        id: 'drill_objectives',
        label: 'Drill Objectives',
        type: 'textarea',
        required: true,
        placeholder:
          'What specific aspects of the emergency plan were being tested? e.g. Response time, containment procedures, communication chain, equipment adequacy.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_scenario',
      },

      // ── Section: Participants ──
      {
        id: 'section_participants',
        label: 'Participants',
        type: 'section',
      },
      {
        id: 'participants_table',
        label: 'Drill Participants',
        type: 'table',
        required: true,
        helpText: 'Record all participants and their roles during the drill.',
        columns: [
          { id: 'name', label: 'Name', type: 'text' },
          { id: 'role', label: 'Job Title', type: 'text' },
          {
            id: 'drill_role',
            label: 'Role in Drill',
            type: 'text',
            placeholder: 'e.g. First responder, observer, coordinator',
          },
          { id: 'department', label: 'Department', type: 'text' },
        ],
        section: 'section_participants',
      },
      {
        id: 'observers',
        label: 'Observers / Assessors',
        type: 'text',
        placeholder: 'Names of drill observers or assessors',
        width: 'full',
        section: 'section_participants',
      },

      // ── Section: Timeline ──
      {
        id: 'section_timeline',
        label: 'Timeline of Events',
        type: 'section',
        helpText: 'Record the chronological sequence of actions during the drill.',
      },
      {
        id: 'timeline_table',
        label: 'Timeline of Events',
        type: 'table',
        required: true,
        helpText:
          'Record each significant event or action during the drill with the time it occurred.',
        columns: [
          { id: 'time', label: 'Time', type: 'text', placeholder: 'HH:MM' },
          { id: 'event', label: 'Event / Action', type: 'text', placeholder: 'e.g. Alarm raised' },
          { id: 'by_whom', label: 'By Whom', type: 'text' },
          {
            id: 'comments',
            label: 'Comments',
            type: 'text',
            placeholder: 'Observations or issues',
          },
        ],
        section: 'section_timeline',
      },

      // ── Section: Performance Evaluation ──
      {
        id: 'section_evaluation',
        label: 'Performance Evaluation',
        type: 'section',
      },
      {
        id: 'response_time_rating',
        label: 'Response Time',
        type: 'rating',
        required: true,
        helpText: '1 = Very slow / inadequate, 5 = Excellent / within target.',
        section: 'section_evaluation',
      },
      {
        id: 'containment_effectiveness',
        label: 'Containment Effectiveness',
        type: 'rating',
        required: true,
        helpText: '1 = Failed to contain, 5 = Complete containment.',
        section: 'section_evaluation',
      },
      {
        id: 'communication_effectiveness',
        label: 'Communication Effectiveness',
        type: 'rating',
        required: true,
        helpText: '1 = Poor / breakdown, 5 = Clear and timely.',
        section: 'section_evaluation',
      },
      {
        id: 'equipment_adequacy',
        label: 'Equipment Adequacy',
        type: 'rating',
        required: true,
        helpText: '1 = Inadequate / missing, 5 = Fully adequate.',
        section: 'section_evaluation',
      },
      {
        id: 'personnel_competence',
        label: 'Personnel Competence',
        type: 'rating',
        required: true,
        helpText: '1 = Untrained / uncertain, 5 = Fully competent.',
        section: 'section_evaluation',
      },
      {
        id: 'overall_drill_rating',
        label: 'Overall Drill Rating',
        type: 'select',
        required: true,
        options: [
          {
            label: 'Satisfactory — Plan effective, minor improvements only',
            value: 'satisfactory',
          },
          {
            label: 'Adequate — Plan generally effective but improvements needed',
            value: 'adequate',
          },
          {
            label: 'Unsatisfactory — Significant deficiencies identified',
            value: 'unsatisfactory',
          },
        ],
        width: 'full',
        section: 'section_evaluation',
      },

      // ── Section: Lessons Learned ──
      {
        id: 'section_lessons',
        label: 'Lessons Learned',
        type: 'section',
      },
      {
        id: 'what_went_well',
        label: 'What Went Well',
        type: 'textarea',
        required: true,
        placeholder: 'List the positive aspects of the drill response.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_lessons',
      },
      {
        id: 'what_could_improve',
        label: 'What Could Be Improved',
        type: 'textarea',
        required: true,
        placeholder: 'List areas where the response fell short or could be improved.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'section_lessons',
      },
      {
        id: 'plan_update_needed',
        label: 'Emergency Plan Update Required?',
        type: 'radio',
        required: true,
        options: [
          { label: 'Yes — Plan revisions needed', value: 'yes' },
          { label: 'No — Plan remains adequate', value: 'no' },
        ],
        section: 'section_lessons',
      },

      // ── Section: Follow-Up Actions ──
      {
        id: 'section_actions',
        label: 'Follow-Up Actions',
        type: 'section',
      },
      {
        id: 'followup_actions_table',
        label: 'Follow-Up Actions',
        type: 'table',
        required: true,
        helpText: 'List all corrective or improvement actions arising from the drill.',
        columns: [
          { id: 'action_ref', label: 'Action #', type: 'text', placeholder: 'DRL-ACT-01' },
          { id: 'description', label: 'Action Description', type: 'text' },
          {
            id: 'priority',
            label: 'Priority',
            type: 'select',
            options: [
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' },
            ],
          },
          { id: 'responsible', label: 'Responsible Person', type: 'text' },
          { id: 'due_date', label: 'Due Date', type: 'date' },
          {
            id: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { label: 'Open', value: 'open' },
              { label: 'In Progress', value: 'in_progress' },
              { label: 'Complete', value: 'complete' },
            ],
          },
        ],
        section: 'section_actions',
      },

      // ── Section: Sign-off ──
      {
        id: 'section_signoff',
        label: 'Record Sign-Off',
        type: 'section',
      },
      {
        id: 'coordinator_name',
        label: 'Drill Coordinator',
        type: 'text',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
      {
        id: 'coordinator_signature',
        label: 'Coordinator Signature',
        type: 'signature',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
      {
        id: 'signoff_date',
        label: 'Date',
        type: 'date',
        required: true,
        width: 'half',
        section: 'section_signoff',
      },
    ],
  },
];
