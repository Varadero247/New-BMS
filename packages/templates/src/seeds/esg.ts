import type { TemplateDefinition } from '../types';

export const esgTemplates: TemplateDefinition[] = [
  {
    code: 'TPL-ESG-001',
    name: 'ESG Materiality Assessment',
    description:
      'Double materiality assessment for identifying and prioritising ESG topics that are material to the organisation and its stakeholders.',
    module: 'ESG',
    category: 'RISK_ASSESSMENT',
    tags: ['materiality', 'double-materiality', 'esg-topics', 'stakeholder'],
    fields: [
      { id: 'section_header', label: 'Assessment Details', type: 'section' },
      { id: 'assessment_title', label: 'Assessment Title', type: 'text', required: true, width: 'full', section: 'Assessment Details' },
      { id: 'assessor', label: 'Assessor', type: 'text', required: true, width: 'half', section: 'Assessment Details' },
      { id: 'date', label: 'Date', type: 'date', required: true, width: 'half', section: 'Assessment Details' },
      { id: 'section_topics', label: 'Material Topics', type: 'section' },
      {
        id: 'topics',
        label: 'ESG Topics',
        type: 'table',
        required: true,
        columns: [
          { id: 'topic', label: 'Topic', type: 'text', required: true, placeholder: 'e.g. Carbon Emissions' },
          { id: 'pillar', label: 'Pillar', type: 'select', required: true, options: [{ label: 'Environmental', value: 'environmental' }, { label: 'Social', value: 'social' }, { label: 'Governance', value: 'governance' }] },
          { id: 'financial_impact', label: 'Financial Impact (1-5)', type: 'rating', required: true, validation: { min: 1, max: 5 } },
          { id: 'stakeholder_impact', label: 'Stakeholder Impact (1-5)', type: 'rating', required: true, validation: { min: 1, max: 5 } },
          { id: 'material', label: 'Material?', type: 'select', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }] },
          { id: 'action', label: 'Action / Response', type: 'text', placeholder: 'How will this topic be addressed?' },
        ],
        section: 'Material Topics',
      },
      { id: 'summary', label: 'Summary', type: 'textarea', required: true, validation: { minLength: 20, maxLength: 3000 }, width: 'full', section: 'Material Topics' },
    ],
  },
  {
    code: 'TPL-ESG-002',
    name: 'Carbon Footprint Report',
    description:
      'Organisational carbon footprint report covering Scope 1, 2, and 3 emissions with reduction targets and action plans.',
    module: 'ESG',
    category: 'REPORTING',
    tags: ['carbon-footprint', 'ghg', 'emissions', 'scope-1-2-3', 'climate'],
    fields: [
      { id: 'section_header', label: 'Report Details', type: 'section' },
      { id: 'reporting_period', label: 'Reporting Period', type: 'text', required: true, placeholder: 'e.g. FY 2025/26', width: 'half', section: 'Report Details' },
      { id: 'prepared_by', label: 'Prepared By', type: 'text', required: true, width: 'half', section: 'Report Details' },
      { id: 'section_emissions', label: 'Emissions Data', type: 'section' },
      {
        id: 'emissions',
        label: 'Emissions by Scope',
        type: 'table',
        required: true,
        columns: [
          { id: 'scope', label: 'Scope', type: 'select', required: true, options: [{ label: 'Scope 1 — Direct', value: 'scope_1' }, { label: 'Scope 2 — Indirect (Energy)', value: 'scope_2' }, { label: 'Scope 3 — Value Chain', value: 'scope_3' }] },
          { id: 'source', label: 'Source', type: 'text', required: true, placeholder: 'e.g. Fleet vehicles, electricity' },
          { id: 'tco2e', label: 'tCO2e', type: 'number', required: true, validation: { min: 0 } },
          { id: 'methodology', label: 'Methodology', type: 'text', placeholder: 'Calculation method used' },
        ],
        section: 'Emissions Data',
      },
      { id: 'total_emissions', label: 'Total Emissions (tCO2e)', type: 'number', required: true, validation: { min: 0 }, width: 'half', section: 'Emissions Data' },
      { id: 'section_targets', label: 'Reduction Targets', type: 'section' },
      { id: 'reduction_target', label: 'Reduction Target', type: 'textarea', required: true, placeholder: 'e.g. 30% reduction by 2030 from 2025 baseline...', validation: { maxLength: 2000 }, width: 'full', section: 'Reduction Targets' },
      { id: 'action_plan', label: 'Action Plan', type: 'textarea', required: true, placeholder: 'Key actions to achieve the reduction target...', validation: { minLength: 20, maxLength: 3000 }, width: 'full', section: 'Reduction Targets' },
    ],
  },
  {
    code: 'TPL-ESG-003',
    name: 'Stakeholder Engagement Log',
    description:
      'Log for recording ESG-related stakeholder engagement activities, feedback received, and actions taken in response.',
    module: 'ESG',
    category: 'GENERAL',
    tags: ['stakeholder-engagement', 'feedback', 'community', 'esg-reporting'],
    fields: [
      { id: 'section_header', label: 'Engagement Log', type: 'section' },
      { id: 'period', label: 'Period', type: 'text', required: true, placeholder: 'e.g. Q1 2026', width: 'half', section: 'Engagement Log' },
      { id: 'coordinator', label: 'Coordinator', type: 'text', required: true, width: 'half', section: 'Engagement Log' },
      { id: 'section_entries', label: 'Engagement Activities', type: 'section' },
      {
        id: 'engagements',
        label: 'Activities',
        type: 'table',
        required: true,
        columns: [
          { id: 'date', label: 'Date', type: 'date', required: true },
          { id: 'stakeholder', label: 'Stakeholder Group', type: 'text', required: true, placeholder: 'e.g. Local community, investors' },
          { id: 'method', label: 'Method', type: 'select', required: true, options: [{ label: 'Meeting', value: 'meeting' }, { label: 'Survey', value: 'survey' }, { label: 'Workshop', value: 'workshop' }, { label: 'Public Consultation', value: 'consultation' }, { label: 'Report/Disclosure', value: 'report' }] },
          { id: 'topic', label: 'Topic', type: 'text', required: true },
          { id: 'feedback', label: 'Key Feedback', type: 'text', placeholder: 'Summary of feedback received' },
          { id: 'action', label: 'Action Taken', type: 'text', placeholder: 'Response or follow-up' },
        ],
        section: 'Engagement Activities',
      },
    ],
  },
];
