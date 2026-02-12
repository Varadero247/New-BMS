import type { TemplateDefinition } from '../types';

export const projectManagementTemplates: TemplateDefinition[] = [
  // ───────────────────────────────────────────────
  // TPL-PM-001  Project Charter
  // ───────────────────────────────────────────────
  {
    code: 'TPL-PM-001',
    name: 'Project Charter',
    description:
      'Formal project authorisation document that defines the project purpose, objectives, scope, stakeholders, milestones, and budget. Serves as the official start of a project.',
    module: 'PROJECT_MANAGEMENT',
    category: 'PLANNING',
    tags: ['project-charter', 'initiation', 'scope', 'stakeholder', 'milestone'],
    fields: [
      // ── Section: Project Identity ──
      {
        id: 'section_identity',
        label: 'Project Identity',
        type: 'section',
        helpText: 'Core identification of the project.',
      },
      {
        id: 'project_name',
        label: 'Project Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. ERP System Migration Phase 2',
        width: 'full',
        section: 'Project Identity',
      },
      {
        id: 'sponsor',
        label: 'Project Sponsor',
        type: 'text',
        required: true,
        placeholder: 'Name and title of the executive sponsor',
        helpText: 'The senior leader who champions the project and provides funding authority.',
        width: 'half',
        section: 'Project Identity',
      },
      {
        id: 'project_manager',
        label: 'Project Manager',
        type: 'text',
        required: true,
        placeholder: 'Name of the assigned project manager',
        width: 'half',
        section: 'Project Identity',
      },
      {
        id: 'date',
        label: 'Charter Date',
        type: 'date',
        required: true,
        helpText: 'Date the charter is formally issued.',
        width: 'half',
        section: 'Project Identity',
      },

      // ── Section: Business Case ──
      {
        id: 'section_business_case',
        label: 'Business Case',
        type: 'section',
        helpText: 'Why this project is needed and what value it delivers.',
      },
      {
        id: 'business_case',
        label: 'Business Case',
        type: 'textarea',
        required: true,
        placeholder: 'Describe the business need, opportunity, or problem this project addresses. Include expected benefits, ROI, or strategic alignment...',
        helpText: 'This justifies the investment of resources. Be specific about measurable benefits.',
        validation: { minLength: 50, maxLength: 5000 },
        width: 'full',
        section: 'Business Case',
      },

      // ── Section: Objectives ──
      {
        id: 'section_objectives',
        label: 'Project Objectives',
        type: 'section',
        helpText: 'SMART objectives the project must achieve.',
      },
      {
        id: 'objectives',
        label: 'Objectives',
        type: 'table',
        required: true,
        helpText: 'Define each objective with a measurable success criterion.',
        columns: [
          {
            id: 'objective',
            label: 'Objective',
            type: 'text',
            required: true,
            placeholder: 'e.g. Migrate all financial data to new ERP',
          },
          {
            id: 'success_criterion',
            label: 'Success Criterion',
            type: 'text',
            required: true,
            placeholder: 'e.g. 100% data migrated with zero data loss',
          },
          {
            id: 'priority',
            label: 'Priority',
            type: 'select',
            required: true,
            options: [
              { label: 'Must Have', value: 'must_have' },
              { label: 'Should Have', value: 'should_have' },
              { label: 'Nice to Have', value: 'nice_to_have' },
            ],
          },
        ],
        section: 'Project Objectives',
      },

      // ── Section: Scope ──
      {
        id: 'section_scope',
        label: 'Project Scope',
        type: 'section',
        helpText: 'Clearly define what is included and excluded from the project.',
      },
      {
        id: 'scope',
        label: 'Scope (In / Out)',
        type: 'table',
        required: true,
        helpText: 'List each scope item and whether it is in scope or explicitly out of scope.',
        columns: [
          {
            id: 'item',
            label: 'Scope Item',
            type: 'text',
            required: true,
            placeholder: 'e.g. User acceptance testing',
          },
          {
            id: 'in_out',
            label: 'In / Out of Scope',
            type: 'select',
            required: true,
            options: [
              { label: 'In Scope', value: 'in' },
              { label: 'Out of Scope', value: 'out' },
            ],
          },
          {
            id: 'notes',
            label: 'Notes',
            type: 'text',
            placeholder: 'Clarification if needed',
          },
        ],
        section: 'Project Scope',
      },

      // ── Section: Key Stakeholders ──
      {
        id: 'section_stakeholders',
        label: 'Key Stakeholders',
        type: 'section',
        helpText: 'Identify the key people and groups with an interest in or influence on the project.',
      },
      {
        id: 'stakeholders',
        label: 'Key Stakeholders',
        type: 'table',
        required: true,
        helpText: 'List stakeholders with their role, interest level, and primary concern.',
        columns: [
          {
            id: 'name',
            label: 'Stakeholder / Group',
            type: 'text',
            required: true,
            placeholder: 'e.g. Finance Director',
          },
          {
            id: 'role',
            label: 'Role / Interest',
            type: 'text',
            required: true,
            placeholder: 'e.g. Budget holder, end user',
          },
          {
            id: 'influence',
            label: 'Influence Level',
            type: 'select',
            required: true,
            options: [
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' },
            ],
          },
        ],
        section: 'Key Stakeholders',
      },

      // ── Section: Milestones ──
      {
        id: 'section_milestones',
        label: 'Key Milestones',
        type: 'section',
        helpText: 'Major milestones and target dates for the project.',
      },
      {
        id: 'milestones',
        label: 'Milestones',
        type: 'table',
        required: true,
        helpText: 'Define the major deliverables or phase gates with target completion dates.',
        columns: [
          {
            id: 'milestone',
            label: 'Milestone',
            type: 'text',
            required: true,
            placeholder: 'e.g. Requirements sign-off',
          },
          {
            id: 'target_date',
            label: 'Target Date',
            type: 'date',
            required: true,
          },
        ],
        section: 'Key Milestones',
      },

      // ── Section: Assumptions & Constraints ──
      {
        id: 'section_assumptions_constraints',
        label: 'Assumptions & Constraints',
        type: 'section',
        helpText: 'Factors taken as true (assumptions) and limitations (constraints) affecting the project.',
      },
      {
        id: 'assumptions',
        label: 'Assumptions',
        type: 'textarea',
        required: true,
        placeholder: 'List the key assumptions underpinning the project plan...',
        helpText: 'e.g. "Vendor will deliver software by Q2", "Key staff will be available full-time".',
        validation: { minLength: 10, maxLength: 3000 },
        width: 'full',
        section: 'Assumptions & Constraints',
      },
      {
        id: 'constraints',
        label: 'Constraints',
        type: 'textarea',
        required: true,
        placeholder: 'List the constraints that limit the project team...',
        helpText: 'e.g. "Budget capped at 150k", "Must go live before year-end regulatory deadline".',
        validation: { minLength: 10, maxLength: 3000 },
        width: 'full',
        section: 'Assumptions & Constraints',
      },

      // ── Section: Budget ──
      {
        id: 'section_budget',
        label: 'Budget',
        type: 'section',
        helpText: 'High-level budget estimate for the project.',
      },
      {
        id: 'budget_estimate',
        label: 'Budget Estimate',
        type: 'number',
        required: true,
        placeholder: 'e.g. 150000',
        helpText: 'Total estimated project budget in the base currency.',
        validation: { min: 0 },
        width: 'half',
        section: 'Budget',
      },
      {
        id: 'budget_notes',
        label: 'Budget Notes',
        type: 'textarea',
        placeholder: 'Breakdown or additional context for the budget estimate...',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'Budget',
      },

      // ── Section: Approval ──
      {
        id: 'section_approval',
        label: 'Approval & Sign-Off',
        type: 'section',
        helpText: 'Formal sign-off authorising the project to proceed.',
      },
      {
        id: 'sponsor_signature',
        label: 'Sponsor Signature',
        type: 'signature',
        required: true,
        helpText: 'The project sponsor signs to formally authorise the project.',
        section: 'Approval & Sign-Off',
      },
      {
        id: 'pm_signature',
        label: 'Project Manager Signature',
        type: 'signature',
        required: true,
        helpText: 'The project manager signs to accept responsibility for delivery.',
        section: 'Approval & Sign-Off',
      },
    ],
  },

  // ───────────────────────────────────────────────
  // TPL-PM-002  Project Closure Report
  // ───────────────────────────────────────────────
  {
    code: 'TPL-PM-002',
    name: 'Project Closure Report',
    description:
      'Formal project closure document summarising objectives achieved, lessons learned, outstanding items, budget performance, and stakeholder sign-off.',
    module: 'PROJECT_MANAGEMENT',
    category: 'REPORTING',
    tags: ['project-closure', 'lessons-learned', 'post-mortem', 'sign-off', 'final-report'],
    fields: [
      // ── Section: Project Summary ──
      {
        id: 'section_summary',
        label: 'Project Summary',
        type: 'section',
        helpText: 'High-level identification of the project being closed.',
      },
      {
        id: 'project_name',
        label: 'Project Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. ERP System Migration Phase 2',
        width: 'full',
        section: 'Project Summary',
      },
      {
        id: 'project_manager',
        label: 'Project Manager',
        type: 'text',
        required: true,
        placeholder: 'Name of the project manager',
        width: 'half',
        section: 'Project Summary',
      },
      {
        id: 'start_date',
        label: 'Actual Start Date',
        type: 'date',
        required: true,
        width: 'half',
        section: 'Project Summary',
      },
      {
        id: 'end_date',
        label: 'Actual End Date',
        type: 'date',
        required: true,
        width: 'half',
        section: 'Project Summary',
      },

      // ── Section: Objectives Achieved ──
      {
        id: 'section_objectives',
        label: 'Objectives Achieved',
        type: 'section',
        helpText: 'Compare planned objectives against actual outcomes.',
      },
      {
        id: 'objectives_achieved',
        label: 'Objectives Achieved',
        type: 'table',
        required: true,
        helpText: 'List each original objective with target, actual outcome, and final status.',
        columns: [
          {
            id: 'objective',
            label: 'Objective',
            type: 'text',
            required: true,
            placeholder: 'e.g. Migrate all financial data',
          },
          {
            id: 'target',
            label: 'Original Target',
            type: 'text',
            required: true,
            placeholder: 'e.g. 100% migration, zero data loss',
          },
          {
            id: 'actual',
            label: 'Actual Outcome',
            type: 'text',
            required: true,
            placeholder: 'e.g. 100% migrated, 2 minor reconciliation items',
          },
          {
            id: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
              { label: 'Fully Achieved', value: 'fully_achieved' },
              { label: 'Partially Achieved', value: 'partially_achieved' },
              { label: 'Not Achieved', value: 'not_achieved' },
              { label: 'Deferred', value: 'deferred' },
            ],
          },
        ],
        section: 'Objectives Achieved',
      },

      // ── Section: Lessons Learned ──
      {
        id: 'section_lessons',
        label: 'Lessons Learned',
        type: 'section',
        helpText: 'Capture what went well, what could be improved, and recommendations for future projects.',
      },
      {
        id: 'lessons_learned',
        label: 'Lessons Learned',
        type: 'table',
        required: true,
        helpText: 'Document key lessons across different categories.',
        columns: [
          {
            id: 'category',
            label: 'Category',
            type: 'select',
            required: true,
            options: [
              { label: 'Planning', value: 'planning' },
              { label: 'Execution', value: 'execution' },
              { label: 'Communication', value: 'communication' },
              { label: 'Risk Management', value: 'risk_management' },
              { label: 'Resource Management', value: 'resource_management' },
              { label: 'Stakeholder Management', value: 'stakeholder_management' },
              { label: 'Technology', value: 'technology' },
              { label: 'Vendor Management', value: 'vendor_management' },
            ],
          },
          {
            id: 'description',
            label: 'Description',
            type: 'textarea',
            required: true,
            placeholder: 'What happened and why...',
            validation: { maxLength: 1000 },
          },
          {
            id: 'recommendation',
            label: 'Recommendation',
            type: 'textarea',
            required: true,
            placeholder: 'What should be done differently next time...',
            validation: { maxLength: 1000 },
          },
        ],
        section: 'Lessons Learned',
      },

      // ── Section: Outstanding Items ──
      {
        id: 'section_outstanding',
        label: 'Outstanding Items',
        type: 'section',
        helpText: 'Items that remain open or have been transferred to BAU or another project.',
      },
      {
        id: 'outstanding_items',
        label: 'Outstanding Items',
        type: 'table',
        helpText: 'List any remaining items, their owner, and where they have been transferred.',
        columns: [
          {
            id: 'item',
            label: 'Item Description',
            type: 'text',
            required: true,
            placeholder: 'e.g. Reporting module customisation',
          },
          {
            id: 'owner',
            label: 'Owner',
            type: 'text',
            required: true,
            placeholder: 'Person or team responsible',
          },
          {
            id: 'transferred_to',
            label: 'Transferred To',
            type: 'text',
            placeholder: 'e.g. BAU Support Team, Phase 3 project',
          },
          {
            id: 'target_date',
            label: 'Target Completion',
            type: 'date',
          },
        ],
        section: 'Outstanding Items',
      },

      // ── Section: Budget Performance ──
      {
        id: 'section_budget',
        label: 'Budget Performance',
        type: 'section',
        helpText: 'Compare actual spend against the planned budget.',
      },
      {
        id: 'planned_budget',
        label: 'Planned Budget',
        type: 'number',
        required: true,
        placeholder: 'e.g. 150000',
        helpText: 'Original approved budget.',
        validation: { min: 0 },
        width: 'half',
        section: 'Budget Performance',
      },
      {
        id: 'actual_budget',
        label: 'Actual Spend',
        type: 'number',
        required: true,
        placeholder: 'e.g. 142000',
        helpText: 'Total actual expenditure at project close.',
        validation: { min: 0 },
        width: 'half',
        section: 'Budget Performance',
      },
      {
        id: 'budget_variance_notes',
        label: 'Budget Variance Notes',
        type: 'textarea',
        placeholder: 'Explain any significant variance between planned and actual budget...',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'Budget Performance',
      },

      // ── Section: Sign-Off ──
      {
        id: 'section_signoff',
        label: 'Stakeholder Sign-Off',
        type: 'section',
        helpText: 'Formal sign-off from key stakeholders confirming the project is closed.',
      },
      {
        id: 'sponsor_signoff',
        label: 'Sponsor Sign-Off',
        type: 'signature',
        required: true,
        helpText: 'The project sponsor confirms the project is formally closed.',
        section: 'Stakeholder Sign-Off',
      },
      {
        id: 'pm_signoff',
        label: 'Project Manager Sign-Off',
        type: 'signature',
        required: true,
        helpText: 'The project manager confirms all closure activities are complete.',
        section: 'Stakeholder Sign-Off',
      },
      {
        id: 'archival_notes',
        label: 'Archival Notes',
        type: 'textarea',
        placeholder: 'Notes on where project documentation is archived, retention period, and access instructions...',
        helpText: 'Ensure project records are properly archived per organisational policy.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'Stakeholder Sign-Off',
      },
    ],
  },

  // ───────────────────────────────────────────────
  // TPL-PM-003  Project Risk Register
  // ───────────────────────────────────────────────
  {
    code: 'TPL-PM-003',
    name: 'Project Risk Register',
    description:
      'Living risk register for identifying, assessing, and tracking project risks with probability/impact scoring, owners, mitigation strategies, and contingency plans.',
    module: 'PROJECT_MANAGEMENT',
    category: 'RISK_ASSESSMENT',
    tags: ['risk-register', 'risk-management', 'mitigation', 'contingency', 'probability-impact'],
    isoClause: '6.1',
    fields: [
      // ── Section: Register Details ──
      {
        id: 'section_details',
        label: 'Register Details',
        type: 'section',
        helpText: 'Context for the risk register.',
      },
      {
        id: 'project_name',
        label: 'Project Name',
        type: 'text',
        required: true,
        placeholder: 'e.g. ERP System Migration Phase 2',
        width: 'half',
        section: 'Register Details',
      },
      {
        id: 'date',
        label: 'Register Date',
        type: 'date',
        required: true,
        helpText: 'Date this version of the risk register was prepared.',
        width: 'half',
        section: 'Register Details',
      },

      // ── Section: Risk Items ──
      {
        id: 'section_risks',
        label: 'Risk Items',
        type: 'section',
        helpText: 'List all identified project risks with their assessment and response plans.',
      },
      {
        id: 'risk_items',
        label: 'Risk Items',
        type: 'table',
        required: true,
        helpText: 'Risk score = Probability x Impact. Scores 1-8 Low, 9-15 Medium, 16-25 High.',
        columns: [
          {
            id: 'risk_id',
            label: 'Risk ID',
            type: 'text',
            required: true,
            placeholder: 'e.g. R-001',
          },
          {
            id: 'description',
            label: 'Risk Description',
            type: 'textarea',
            required: true,
            placeholder: 'Describe the risk event and its potential consequences...',
            validation: { maxLength: 500 },
          },
          {
            id: 'category',
            label: 'Category',
            type: 'select',
            required: true,
            options: [
              { label: 'Technical', value: 'technical' },
              { label: 'Schedule', value: 'schedule' },
              { label: 'Budget / Cost', value: 'budget' },
              { label: 'Resource', value: 'resource' },
              { label: 'Scope', value: 'scope' },
              { label: 'External / Vendor', value: 'external' },
              { label: 'Regulatory', value: 'regulatory' },
              { label: 'Organisational', value: 'organisational' },
            ],
          },
          {
            id: 'probability',
            label: 'Probability (1-5)',
            type: 'rating',
            required: true,
            validation: { min: 1, max: 5 },
          },
          {
            id: 'impact',
            label: 'Impact (1-5)',
            type: 'rating',
            required: true,
            validation: { min: 1, max: 5 },
          },
          {
            id: 'risk_score',
            label: 'Risk Score',
            type: 'number',
            helpText: 'Probability x Impact (auto-calculated where possible).',
            validation: { min: 1, max: 25 },
          },
          {
            id: 'owner',
            label: 'Risk Owner',
            type: 'text',
            required: true,
            placeholder: 'Person responsible for managing this risk',
          },
          {
            id: 'mitigation_strategy',
            label: 'Mitigation Strategy',
            type: 'textarea',
            required: true,
            placeholder: 'Actions to reduce the probability or impact...',
            validation: { maxLength: 500 },
          },
          {
            id: 'contingency',
            label: 'Contingency Plan',
            type: 'textarea',
            placeholder: 'What to do if the risk materialises...',
            validation: { maxLength: 500 },
          },
          {
            id: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
              { label: 'Open', value: 'open' },
              { label: 'Mitigating', value: 'mitigating' },
              { label: 'Occurred', value: 'occurred' },
              { label: 'Closed', value: 'closed' },
              { label: 'Accepted', value: 'accepted' },
            ],
          },
        ],
        section: 'Risk Items',
      },

      // ── Section: Summary & Review ──
      {
        id: 'section_summary',
        label: 'Summary & Review',
        type: 'section',
        helpText: 'Overall risk position and review schedule.',
      },
      {
        id: 'risk_summary',
        label: 'Risk Summary',
        type: 'textarea',
        required: true,
        placeholder: 'Provide an overall summary of the project risk position, trends, and key concerns...',
        helpText: 'Summarise the top risks, overall risk profile, and any escalation needs.',
        validation: { minLength: 20, maxLength: 3000 },
        width: 'full',
        section: 'Summary & Review',
      },
      {
        id: 'review_date',
        label: 'Last Review Date',
        type: 'date',
        required: true,
        helpText: 'When this risk register was last formally reviewed.',
        width: 'half',
        section: 'Summary & Review',
      },
      {
        id: 'next_review',
        label: 'Next Scheduled Review',
        type: 'date',
        required: true,
        helpText: 'When the next formal risk review is planned.',
        width: 'half',
        section: 'Summary & Review',
      },
    ],
  },
];
