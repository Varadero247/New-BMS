// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { TemplateDefinition } from '../types';

export const hrTemplates: TemplateDefinition[] = [
  // ───────────────────────────────────────────────
  // TPL-HR-001  Job Description Template
  // ───────────────────────────────────────────────
  {
    code: 'TPL-HR-001',
    name: 'Job Description Template',
    description:
      'Standardised job description for defining roles, responsibilities, qualifications, and competencies required for a position.',
    module: 'HR',
    category: 'GENERAL',
    tags: ['job-description', 'recruitment', 'role-definition', 'competency'],
    isoClause: '7.2',
    fields: [
      // ── Section: Position Details ──
      {
        id: 'section_position',
        label: 'Position Details',
        type: 'section',
        helpText: 'Basic information about the role being described.',
      },
      {
        id: 'job_title',
        label: 'Job Title',
        type: 'text',
        required: true,
        placeholder: 'e.g. Senior Quality Engineer',
        width: 'half',
        section: 'Position Details',
      },
      {
        id: 'department',
        label: 'Department',
        type: 'text',
        required: true,
        placeholder: 'e.g. Quality Assurance',
        width: 'half',
        section: 'Position Details',
      },
      {
        id: 'reports_to',
        label: 'Reports To',
        type: 'text',
        required: true,
        placeholder: 'e.g. Quality Manager',
        helpText: 'Direct line manager or supervisor for this role.',
        width: 'half',
        section: 'Position Details',
      },
      {
        id: 'grade_band',
        label: 'Grade / Band',
        type: 'text',
        placeholder: 'e.g. Band 6 / Grade C',
        helpText: 'Internal pay grade or job evaluation band.',
        width: 'half',
        section: 'Position Details',
      },

      // ── Section: Role Purpose ──
      {
        id: 'section_purpose',
        label: 'Role Purpose',
        type: 'section',
        helpText: 'High-level summary of why this role exists.',
      },
      {
        id: 'purpose_statement',
        label: 'Purpose Statement',
        type: 'textarea',
        required: true,
        placeholder:
          'Describe the overall purpose and contribution of this role to the organisation...',
        helpText:
          'A concise statement (2-4 sentences) explaining the core purpose of the position.',
        validation: { minLength: 50, maxLength: 2000 },
        width: 'full',
        section: 'Role Purpose',
      },

      // ── Section: Key Responsibilities ──
      {
        id: 'section_responsibilities',
        label: 'Key Responsibilities',
        type: 'section',
        helpText: 'List the primary duties and their relative priority.',
      },
      {
        id: 'responsibilities',
        label: 'Key Responsibilities',
        type: 'table',
        required: true,
        helpText: 'Add each core responsibility with its priority level.',
        columns: [
          {
            id: 'responsibility',
            label: 'Responsibility',
            type: 'textarea',
            required: true,
            placeholder: 'Describe the responsibility...',
            validation: { maxLength: 500 },
          },
          {
            id: 'priority',
            label: 'Priority',
            type: 'select',
            required: true,
            options: [
              { label: 'Critical', value: 'critical' },
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
              { label: 'Low', value: 'low' },
            ],
          },
        ],
        section: 'Key Responsibilities',
      },

      // ── Section: Qualifications ──
      {
        id: 'section_qualifications',
        label: 'Qualifications & Experience',
        type: 'section',
        helpText: 'Minimum and preferred qualifications for the role.',
      },
      {
        id: 'qualifications',
        label: 'Qualifications Required',
        type: 'table',
        required: true,
        helpText: 'List required and desirable qualifications, certifications, or experience.',
        columns: [
          {
            id: 'qualification',
            label: 'Qualification / Experience',
            type: 'text',
            required: true,
            placeholder: 'e.g. BSc in Engineering',
          },
          {
            id: 'requirement_level',
            label: 'Requirement Level',
            type: 'select',
            required: true,
            options: [
              { label: 'Essential', value: 'essential' },
              { label: 'Desirable', value: 'desirable' },
            ],
          },
        ],
        section: 'Qualifications & Experience',
      },

      // ── Section: Competencies ──
      {
        id: 'section_competencies',
        label: 'Competencies',
        type: 'section',
        helpText: 'Behavioural and technical competencies required.',
      },
      {
        id: 'competencies',
        label: 'Required Competencies',
        type: 'multiselect',
        required: true,
        helpText: 'Select all competencies that apply to this role.',
        options: [
          { label: 'Leadership', value: 'leadership' },
          { label: 'Communication', value: 'communication' },
          { label: 'Problem Solving', value: 'problem_solving' },
          { label: 'Teamwork', value: 'teamwork' },
          { label: 'Analytical Thinking', value: 'analytical_thinking' },
          { label: 'Attention to Detail', value: 'attention_to_detail' },
          { label: 'Time Management', value: 'time_management' },
          { label: 'Technical Expertise', value: 'technical_expertise' },
          { label: 'Customer Focus', value: 'customer_focus' },
          { label: 'Continuous Improvement', value: 'continuous_improvement' },
          { label: 'Change Management', value: 'change_management' },
          { label: 'Decision Making', value: 'decision_making' },
          { label: 'Project Management', value: 'project_management' },
          { label: 'Regulatory Knowledge', value: 'regulatory_knowledge' },
        ],
        section: 'Competencies',
      },

      // ── Section: Working Conditions ──
      {
        id: 'section_conditions',
        label: 'Working Conditions',
        type: 'section',
        helpText: 'Physical, environmental, and scheduling conditions.',
      },
      {
        id: 'working_conditions',
        label: 'Working Conditions',
        type: 'textarea',
        placeholder:
          'Describe working environment, travel requirements, shift patterns, physical demands...',
        helpText:
          'Include details on location, travel, hours, PPE requirements, and any special conditions.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'Working Conditions',
      },

      // ── Section: Approval ──
      {
        id: 'section_approval',
        label: 'Approval',
        type: 'section',
        helpText: 'Sign-off to confirm the job description is accurate and approved.',
      },
      {
        id: 'prepared_by',
        label: 'Prepared By',
        type: 'text',
        required: true,
        placeholder: 'Name of the person who prepared this description',
        width: 'half',
        section: 'Approval',
      },
      {
        id: 'approval_date',
        label: 'Approval Date',
        type: 'date',
        required: true,
        width: 'half',
        section: 'Approval',
      },
      {
        id: 'approver_signature',
        label: 'Approver Signature',
        type: 'signature',
        required: true,
        helpText:
          'Signature of the hiring manager or HR representative approving this job description.',
        section: 'Approval',
      },
    ],
    defaultContent: {
      competencies: ['communication', 'teamwork'],
    },
  },

  // ───────────────────────────────────────────────
  // TPL-HR-002  Interview Assessment Form
  // ───────────────────────────────────────────────
  {
    code: 'TPL-HR-002',
    name: 'Interview Assessment Form',
    description:
      'Structured interview evaluation form for consistently assessing candidates against role-specific competencies and cultural fit.',
    module: 'HR',
    category: 'GENERAL',
    tags: ['interview', 'recruitment', 'assessment', 'candidate-evaluation'],
    fields: [
      // ── Section: Candidate Information ──
      {
        id: 'section_candidate',
        label: 'Candidate Information',
        type: 'section',
        helpText: 'Details of the candidate being interviewed.',
      },
      {
        id: 'candidate_name',
        label: 'Candidate Name',
        type: 'text',
        required: true,
        placeholder: 'Full name of the candidate',
        width: 'half',
        section: 'Candidate Information',
      },
      {
        id: 'position',
        label: 'Position Applied For',
        type: 'text',
        required: true,
        placeholder: 'e.g. Senior Quality Engineer',
        width: 'half',
        section: 'Candidate Information',
      },
      {
        id: 'interview_date',
        label: 'Interview Date',
        type: 'date',
        required: true,
        width: 'half',
        section: 'Candidate Information',
      },
      {
        id: 'interviewer',
        label: 'Interviewer Name',
        type: 'text',
        required: true,
        placeholder: 'Name of the interviewer',
        width: 'half',
        section: 'Candidate Information',
      },

      // ── Section: Competency Assessment ──
      {
        id: 'section_competency',
        label: 'Competency Assessment',
        type: 'section',
        helpText: "Rate each competency based on the candidate's responses during the interview.",
      },
      {
        id: 'competency_assessment',
        label: 'Competency Assessment',
        type: 'table',
        required: true,
        helpText:
          'Assess each competency area. Rating scale: 1 = Poor, 2 = Below Average, 3 = Average, 4 = Good, 5 = Excellent.',
        columns: [
          {
            id: 'competency',
            label: 'Competency',
            type: 'text',
            required: true,
            placeholder: 'e.g. Problem Solving',
          },
          {
            id: 'question_asked',
            label: 'Question Asked',
            type: 'textarea',
            required: true,
            placeholder: 'The interview question used...',
            validation: { maxLength: 500 },
          },
          {
            id: 'response_summary',
            label: 'Response Summary',
            type: 'textarea',
            required: true,
            placeholder: "Summary of the candidate's response...",
            validation: { maxLength: 1000 },
          },
          {
            id: 'rating',
            label: 'Rating (1-5)',
            type: 'rating',
            required: true,
            validation: { min: 1, max: 5 },
          },
        ],
        section: 'Competency Assessment',
      },

      // ── Section: Skills & Fit ──
      {
        id: 'section_skills_fit',
        label: 'Skills & Cultural Fit',
        type: 'section',
        helpText: 'Overall assessment of technical ability and cultural alignment.',
      },
      {
        id: 'technical_skills_rating',
        label: 'Technical Skills Rating',
        type: 'rating',
        required: true,
        helpText: "Overall rating of the candidate's technical skills. 1 = Poor, 5 = Excellent.",
        validation: { min: 1, max: 5 },
        width: 'half',
        section: 'Skills & Cultural Fit',
      },
      {
        id: 'cultural_fit_rating',
        label: 'Cultural Fit Rating',
        type: 'rating',
        required: true,
        helpText:
          'How well the candidate aligns with company values and team dynamics. 1 = Poor, 5 = Excellent.',
        validation: { min: 1, max: 5 },
        width: 'half',
        section: 'Skills & Cultural Fit',
      },

      // ── Section: Recommendation ──
      {
        id: 'section_recommendation',
        label: 'Overall Recommendation',
        type: 'section',
        helpText: 'Final assessment and hiring recommendation.',
      },
      {
        id: 'overall_recommendation',
        label: 'Overall Recommendation',
        type: 'select',
        required: true,
        helpText: 'Select the hiring recommendation based on the full interview assessment.',
        options: [
          { label: 'Strong Hire', value: 'strong_hire' },
          { label: 'Hire', value: 'hire' },
          { label: 'Maybe', value: 'maybe' },
          { label: 'No Hire', value: 'no_hire' },
        ],
        width: 'half',
        section: 'Overall Recommendation',
      },
      {
        id: 'strengths',
        label: 'Key Strengths',
        type: 'textarea',
        required: true,
        placeholder: "Summarise the candidate's main strengths observed during the interview...",
        helpText: 'Highlight specific examples or evidence from the interview.',
        validation: { minLength: 20, maxLength: 2000 },
        width: 'full',
        section: 'Overall Recommendation',
      },
      {
        id: 'concerns',
        label: 'Concerns / Weaknesses',
        type: 'textarea',
        placeholder:
          'Note any concerns, gaps, or areas where the candidate did not meet expectations...',
        helpText: 'Be specific and evidence-based.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'Overall Recommendation',
      },
      {
        id: 'additional_notes',
        label: 'Additional Notes',
        type: 'textarea',
        placeholder: 'Any other observations, follow-up actions, or references to check...',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'Overall Recommendation',
      },
    ],
  },

  // ───────────────────────────────────────────────
  // TPL-HR-003  Performance Review Form
  // ───────────────────────────────────────────────
  {
    code: 'TPL-HR-003',
    name: 'Performance Review Form',
    description:
      'Comprehensive annual or periodic performance appraisal form covering goal achievement, competency ratings, development planning, and sign-off.',
    module: 'HR',
    category: 'REPORTING',
    tags: ['performance', 'appraisal', 'review', 'development', 'goals'],
    isoClause: '7.2',
    fields: [
      // ── Section: Employee Details ──
      {
        id: 'section_employee',
        label: 'Employee Details',
        type: 'section',
        helpText: 'Identify the employee and review period.',
      },
      {
        id: 'employee_name',
        label: 'Employee Name',
        type: 'text',
        required: true,
        placeholder: 'Full name of the employee',
        width: 'half',
        section: 'Employee Details',
      },
      {
        id: 'department',
        label: 'Department',
        type: 'text',
        required: true,
        placeholder: 'e.g. Operations',
        width: 'half',
        section: 'Employee Details',
      },
      {
        id: 'review_period',
        label: 'Review Period',
        type: 'text',
        required: true,
        placeholder: 'e.g. Jan 2026 - Dec 2026',
        helpText: 'The time period this review covers.',
        width: 'half',
        section: 'Employee Details',
      },
      {
        id: 'reviewer',
        label: 'Reviewer / Line Manager',
        type: 'text',
        required: true,
        placeholder: 'Name of the reviewing manager',
        width: 'half',
        section: 'Employee Details',
      },

      // ── Section: Goals Achievement ──
      {
        id: 'section_goals',
        label: 'Goals Achievement',
        type: 'section',
        helpText: 'Assess performance against each agreed goal or objective.',
      },
      {
        id: 'goals_achievement',
        label: 'Goals Achievement',
        type: 'table',
        required: true,
        helpText:
          'List each goal, the target, actual result, and a rating from 1 (not met) to 5 (exceeded).',
        columns: [
          {
            id: 'goal',
            label: 'Goal / Objective',
            type: 'text',
            required: true,
            placeholder: 'e.g. Reduce customer complaints by 15%',
          },
          {
            id: 'target',
            label: 'Target',
            type: 'text',
            required: true,
            placeholder: 'e.g. 15% reduction',
          },
          {
            id: 'actual',
            label: 'Actual Result',
            type: 'text',
            required: true,
            placeholder: 'e.g. 18% reduction achieved',
          },
          {
            id: 'rating',
            label: 'Rating (1-5)',
            type: 'rating',
            required: true,
            validation: { min: 1, max: 5 },
          },
        ],
        section: 'Goals Achievement',
      },

      // ── Section: Competency Ratings ──
      {
        id: 'section_competency_ratings',
        label: 'Competency Ratings',
        type: 'section',
        helpText: 'Rate the employee on each core competency.',
      },
      {
        id: 'competency_ratings',
        label: 'Competency Ratings',
        type: 'table',
        required: true,
        helpText: 'Rate each competency from 1 (needs significant improvement) to 5 (role model).',
        columns: [
          {
            id: 'competency',
            label: 'Competency',
            type: 'text',
            required: true,
            placeholder: 'e.g. Communication',
          },
          {
            id: 'rating',
            label: 'Rating (1-5)',
            type: 'rating',
            required: true,
            validation: { min: 1, max: 5 },
          },
          {
            id: 'comments',
            label: 'Comments / Evidence',
            type: 'textarea',
            placeholder: 'Provide supporting evidence or examples...',
            validation: { maxLength: 500 },
          },
        ],
        section: 'Competency Ratings',
      },

      // ── Section: Overall Assessment ──
      {
        id: 'section_overall',
        label: 'Overall Assessment',
        type: 'section',
        helpText: "Summarise the employee's overall performance.",
      },
      {
        id: 'overall_rating',
        label: 'Overall Performance Rating',
        type: 'select',
        required: true,
        helpText: 'Select the overall performance rating for this review period.',
        options: [
          { label: '1 - Unsatisfactory', value: '1' },
          { label: '2 - Needs Improvement', value: '2' },
          { label: '3 - Meets Expectations', value: '3' },
          { label: '4 - Exceeds Expectations', value: '4' },
          { label: '5 - Outstanding', value: '5' },
        ],
        width: 'half',
        section: 'Overall Assessment',
      },
      {
        id: 'strengths',
        label: 'Strengths',
        type: 'textarea',
        required: true,
        placeholder: "Describe the employee's key strengths demonstrated during this period...",
        validation: { minLength: 20, maxLength: 2000 },
        width: 'full',
        section: 'Overall Assessment',
      },
      {
        id: 'areas_for_improvement',
        label: 'Areas for Improvement',
        type: 'textarea',
        required: true,
        placeholder: 'Identify specific areas where the employee should focus on development...',
        validation: { minLength: 20, maxLength: 2000 },
        width: 'full',
        section: 'Overall Assessment',
      },

      // ── Section: Development Plan ──
      {
        id: 'section_development',
        label: 'Development Plan',
        type: 'section',
        helpText: "Agreed actions for the employee's professional development.",
      },
      {
        id: 'development_plan',
        label: 'Development Actions',
        type: 'table',
        required: true,
        helpText: 'List agreed development activities, target dates, and support required.',
        columns: [
          {
            id: 'action',
            label: 'Development Action',
            type: 'text',
            required: true,
            placeholder: 'e.g. Complete ISO 9001 Lead Auditor course',
          },
          {
            id: 'target_date',
            label: 'Target Date',
            type: 'date',
            required: true,
          },
          {
            id: 'support_required',
            label: 'Support / Resources Required',
            type: 'text',
            placeholder: 'e.g. Funding approval, study leave',
          },
        ],
        section: 'Development Plan',
      },

      // ── Section: Comments & Sign-Off ──
      {
        id: 'section_signoff',
        label: 'Comments & Sign-Off',
        type: 'section',
        helpText: 'Employee comments and formal sign-off from both parties.',
      },
      {
        id: 'employee_comments',
        label: 'Employee Comments',
        type: 'textarea',
        placeholder: 'The employee may add their own comments on the review here...',
        helpText: 'This section is for the employee to provide their perspective.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'Comments & Sign-Off',
      },
      {
        id: 'employee_signature',
        label: 'Employee Signature',
        type: 'signature',
        required: true,
        helpText: 'Employee signs to acknowledge the review has been discussed.',
        section: 'Comments & Sign-Off',
      },
      {
        id: 'reviewer_signature',
        label: 'Reviewer Signature',
        type: 'signature',
        required: true,
        helpText: 'Reviewing manager signs to confirm the assessment.',
        section: 'Comments & Sign-Off',
      },
    ],
  },

  // ───────────────────────────────────────────────
  // TPL-HR-004  Training Needs Analysis
  // ───────────────────────────────────────────────
  {
    code: 'TPL-HR-004',
    name: 'Training Needs Analysis',
    description:
      'Systematic assessment of training gaps across a department or team, identifying priority needs, budget requirements, and timelines.',
    module: 'HR',
    category: 'TRAINING',
    tags: ['training', 'competency-gap', 'development', 'needs-analysis', 'skills'],
    isoClause: '7.2',
    fields: [
      // ── Section: Analysis Details ──
      {
        id: 'section_details',
        label: 'Analysis Details',
        type: 'section',
        helpText: 'Basic information about the scope of this training needs analysis.',
      },
      {
        id: 'department',
        label: 'Department / Team',
        type: 'text',
        required: true,
        placeholder: 'e.g. Manufacturing',
        width: 'third',
        section: 'Analysis Details',
      },
      {
        id: 'analysis_date',
        label: 'Analysis Date',
        type: 'date',
        required: true,
        width: 'third',
        section: 'Analysis Details',
      },
      {
        id: 'analyst',
        label: 'Analyst / Conducted By',
        type: 'text',
        required: true,
        placeholder: 'Name of the person conducting the analysis',
        width: 'third',
        section: 'Analysis Details',
      },

      // ── Section: Current Competencies ──
      {
        id: 'section_competencies',
        label: 'Current Competency Assessment',
        type: 'section',
        helpText: 'Map current competency levels against required levels to identify gaps.',
      },
      {
        id: 'current_competencies',
        label: 'Competency Gap Analysis',
        type: 'table',
        required: true,
        helpText:
          'For each role/competency, rate the current level and required level on a 1-5 scale. The gap is the difference.',
        columns: [
          {
            id: 'role',
            label: 'Role / Job Title',
            type: 'text',
            required: true,
            placeholder: 'e.g. Production Operator',
          },
          {
            id: 'competency',
            label: 'Competency',
            type: 'text',
            required: true,
            placeholder: 'e.g. SPC Charting',
          },
          {
            id: 'current_level',
            label: 'Current Level (1-5)',
            type: 'rating',
            required: true,
            validation: { min: 1, max: 5 },
          },
          {
            id: 'required_level',
            label: 'Required Level (1-5)',
            type: 'rating',
            required: true,
            validation: { min: 1, max: 5 },
          },
          {
            id: 'gap',
            label: 'Gap',
            type: 'number',
            helpText: 'Required level minus current level. Auto-calculated where possible.',
            validation: { min: 0, max: 4 },
          },
        ],
        section: 'Current Competency Assessment',
      },

      // ── Section: Priority Training Needs ──
      {
        id: 'section_priority',
        label: 'Priority Training Needs',
        type: 'section',
        helpText: 'Identify the most important training interventions based on the gap analysis.',
      },
      {
        id: 'priority_training_needs',
        label: 'Priority Training Needs',
        type: 'table',
        required: true,
        helpText: 'List the training topics in priority order with delivery details.',
        columns: [
          {
            id: 'topic',
            label: 'Training Topic',
            type: 'text',
            required: true,
            placeholder: 'e.g. ISO 9001:2015 Awareness',
          },
          {
            id: 'number_of_staff',
            label: 'Number of Staff',
            type: 'number',
            required: true,
            validation: { min: 1 },
            placeholder: 'e.g. 12',
          },
          {
            id: 'urgency',
            label: 'Urgency',
            type: 'select',
            required: true,
            options: [
              { label: 'Critical - Immediate', value: 'critical' },
              { label: 'High - Within 1 month', value: 'high' },
              { label: 'Medium - Within 3 months', value: 'medium' },
              { label: 'Low - Within 6 months', value: 'low' },
            ],
          },
          {
            id: 'recommended_method',
            label: 'Recommended Method',
            type: 'select',
            required: true,
            options: [
              { label: 'Classroom Training', value: 'classroom' },
              { label: 'Online / E-Learning', value: 'online' },
              { label: 'On-the-Job Training', value: 'on_the_job' },
              { label: 'Workshop', value: 'workshop' },
              { label: 'Mentoring / Coaching', value: 'mentoring' },
              { label: 'External Course', value: 'external' },
              { label: 'Conference / Seminar', value: 'conference' },
            ],
          },
        ],
        section: 'Priority Training Needs',
      },

      // ── Section: Budget & Timeline ──
      {
        id: 'section_budget',
        label: 'Budget & Timeline',
        type: 'section',
        helpText: 'Estimated cost and implementation schedule.',
      },
      {
        id: 'budget_estimate',
        label: 'Total Budget Estimate',
        type: 'number',
        required: true,
        placeholder: 'e.g. 25000',
        helpText: 'Estimated total cost in the base currency for all identified training needs.',
        validation: { min: 0 },
        width: 'half',
        section: 'Budget & Timeline',
      },
      {
        id: 'timeline',
        label: 'Implementation Timeline',
        type: 'textarea',
        required: true,
        placeholder:
          'Describe the phased rollout plan with target dates for each training initiative...',
        helpText: 'Include key milestones and delivery phases.',
        validation: { maxLength: 2000 },
        width: 'full',
        section: 'Budget & Timeline',
      },

      // ── Section: Approval ──
      {
        id: 'section_approval',
        label: 'Approval',
        type: 'section',
        helpText: 'Management approval for the training plan and budget.',
      },
      {
        id: 'approved_by',
        label: 'Approved By',
        type: 'text',
        required: true,
        placeholder: 'Name and title of the approver',
        width: 'half',
        section: 'Approval',
      },
      {
        id: 'approval_date',
        label: 'Approval Date',
        type: 'date',
        required: true,
        width: 'half',
        section: 'Approval',
      },
      {
        id: 'approver_signature',
        label: 'Approver Signature',
        type: 'signature',
        required: true,
        helpText: 'Signature of the department head or training budget holder.',
        section: 'Approval',
      },
    ],
  },

  // ───────────────────────────────────────────────
  // TPL-HR-005  Training Record
  // ───────────────────────────────────────────────
  {
    code: 'TPL-HR-005',
    name: 'Training Record',
    description:
      'Individual training completion record capturing course details, assessment results, competency achieved, and sign-off.',
    module: 'HR',
    category: 'TRAINING',
    tags: ['training', 'competency', 'record', 'certification', 'evidence'],
    isoClause: '7.2',
    fields: [
      // ── Section: Employee Information ──
      {
        id: 'section_employee',
        label: 'Employee Information',
        type: 'section',
        helpText: 'Identify the employee who completed the training.',
      },
      {
        id: 'employee_name',
        label: 'Employee Name',
        type: 'text',
        required: true,
        placeholder: 'Full name of the employee',
        width: 'half',
        section: 'Employee Information',
      },
      {
        id: 'employee_id',
        label: 'Employee ID',
        type: 'text',
        required: true,
        placeholder: 'e.g. EMP-00123',
        helpText: "The employee's unique identifier in the HR system.",
        width: 'half',
        section: 'Employee Information',
      },

      // ── Section: Training Details ──
      {
        id: 'section_training',
        label: 'Training Details',
        type: 'section',
        helpText: 'Information about the training course or activity.',
      },
      {
        id: 'training_title',
        label: 'Training Title',
        type: 'text',
        required: true,
        placeholder: 'e.g. ISO 14001 Environmental Awareness',
        width: 'full',
        section: 'Training Details',
      },
      {
        id: 'provider',
        label: 'Training Provider',
        type: 'text',
        required: true,
        placeholder: 'e.g. BSI Group, Internal HR, Coursera',
        helpText: 'Name of the training provider or internal department.',
        width: 'half',
        section: 'Training Details',
      },
      {
        id: 'training_type',
        label: 'Training Type',
        type: 'select',
        required: true,
        options: [
          { label: 'Internal', value: 'internal' },
          { label: 'External', value: 'external' },
          { label: 'Online / E-Learning', value: 'online' },
          { label: 'On-the-Job', value: 'on_the_job' },
        ],
        width: 'half',
        section: 'Training Details',
      },
      {
        id: 'date_completed',
        label: 'Date Completed',
        type: 'date',
        required: true,
        width: 'half',
        section: 'Training Details',
      },
      {
        id: 'duration_hours',
        label: 'Duration (Hours)',
        type: 'number',
        required: true,
        placeholder: 'e.g. 8',
        helpText: 'Total hours of training completed.',
        validation: { min: 0.5, max: 500 },
        width: 'half',
        section: 'Training Details',
      },

      // ── Section: Assessment ──
      {
        id: 'section_assessment',
        label: 'Assessment & Results',
        type: 'section',
        helpText: 'How the training was assessed and the outcome.',
      },
      {
        id: 'assessment_method',
        label: 'Assessment Method',
        type: 'select',
        required: true,
        helpText: 'How was competency assessed after the training?',
        options: [
          { label: 'Written Examination', value: 'written_exam' },
          { label: 'Practical Assessment', value: 'practical' },
          { label: 'Observation', value: 'observation' },
          { label: 'Portfolio / Evidence', value: 'portfolio' },
          { label: 'Verbal Assessment', value: 'verbal' },
          { label: 'Online Quiz', value: 'online_quiz' },
          { label: 'No Formal Assessment', value: 'none' },
        ],
        width: 'half',
        section: 'Assessment & Results',
      },
      {
        id: 'assessment_result',
        label: 'Assessment Result',
        type: 'select',
        required: true,
        options: [
          { label: 'Pass', value: 'pass' },
          { label: 'Fail', value: 'fail' },
          { label: 'N/A', value: 'na' },
        ],
        width: 'half',
        section: 'Assessment & Results',
      },
      {
        id: 'competency_achieved',
        label: 'Competency Achieved',
        type: 'textarea',
        required: true,
        placeholder:
          'Describe the competency or skill the employee has demonstrated as a result of this training...',
        helpText: 'Be specific about what the employee can now do or understand.',
        validation: { minLength: 10, maxLength: 1000 },
        width: 'full',
        section: 'Assessment & Results',
      },

      // ── Section: Certification ──
      {
        id: 'section_certification',
        label: 'Certification',
        type: 'section',
        helpText: 'Reference to any certificate or formal qualification issued.',
      },
      {
        id: 'certificate_reference',
        label: 'Certificate Reference',
        type: 'text',
        placeholder: 'e.g. CERT-2026-00456',
        helpText: 'Reference number of the certificate issued, if applicable.',
        width: 'half',
        section: 'Certification',
      },
      {
        id: 'certificate_file',
        label: 'Certificate Upload',
        type: 'file',
        helpText: 'Upload a copy of the certificate or evidence of completion.',
        section: 'Certification',
      },

      // ── Section: Sign-Off ──
      {
        id: 'section_signoff',
        label: 'Sign-Off',
        type: 'section',
        helpText: 'Trainer and trainee confirm the training record is accurate.',
      },
      {
        id: 'trainer_signature',
        label: 'Trainer Signature',
        type: 'signature',
        required: true,
        helpText:
          'The trainer or assessor confirms the training was delivered and assessment completed.',
        section: 'Sign-Off',
      },
      {
        id: 'trainee_signature',
        label: 'Trainee Signature',
        type: 'signature',
        required: true,
        helpText: 'The employee confirms attendance and receipt of any materials.',
        section: 'Sign-Off',
      },
    ],
  },
];
