import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { requirePermission, PermissionLevel } from '@ims/rbac';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
const logger = createLogger('api-quality');

const generateTemplateSchema = z.object({
  prompt: z.string().trim().min(5, 'Please provide a descriptive prompt (at least 5 characters)'),
  category: z.string().trim().optional(),
  isoStandard: z.string().trim().optional(),
  title: z.string().trim().optional(),
});

const router: Router = Router();
router.param('id', validateIdParam());

// Template category definitions with ISO clause references
const TEMPLATE_CATEGORIES: Record<
  string,
  { prefix: string; isoStandards: string[]; defaultSections: string[] }
> = {
  POLICY: {
    prefix: 'POL',
    isoStandards: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'ISO 27001:2022'],
    defaultSections: [
      'Purpose',
      'Scope',
      'Policy Statement',
      'Objectives',
      'Responsibilities',
      'Communication',
      'Review',
      'Related Documents',
      'Approval',
    ],
  },
  PROCEDURE: {
    prefix: 'PRO',
    isoStandards: ['ISO 9001:2015'],
    defaultSections: [
      'Purpose',
      'Scope',
      'Definitions',
      'Responsibilities',
      'Procedure',
      'Records',
      'Related Documents',
      'Review',
    ],
  },
  SWP: {
    prefix: 'SWP',
    isoStandards: ['ISO 45001:2018'],
    defaultSections: [
      'Purpose',
      'Scope',
      'Definitions',
      'Hazards & Risks',
      'Control Measures',
      'PPE Requirements',
      'Emergency Procedures',
      'Training',
      'Related Documents',
    ],
  },
  FORM: {
    prefix: 'FRM',
    isoStandards: ['ISO 9001:2015'],
    defaultSections: [
      'Form Header',
      'Details Section',
      'Assessment Section',
      'Actions Section',
      'Sign-Off',
    ],
  },
  REGISTER: {
    prefix: 'REG',
    isoStandards: ['ISO 9001:2015'],
    defaultSections: ['Register Information', 'Register Table', 'Review History'],
  },
  PLAN: {
    prefix: 'PLN',
    isoStandards: ['ISO 9001:2015'],
    defaultSections: [
      'Purpose',
      'Scope',
      'Objectives',
      'Schedule',
      'Resources',
      'Responsibilities',
      'Monitoring',
      'Review',
    ],
  },
  REPORT: {
    prefix: 'RPT',
    isoStandards: ['ISO 9001:2015'],
    defaultSections: [
      'Executive Summary',
      'Methodology',
      'Findings',
      'Analysis',
      'Recommendations',
      'Appendices',
    ],
  },
  AUDIT: {
    prefix: 'AUD',
    isoStandards: ['ISO 19011:2018'],
    defaultSections: ['Audit Information', 'Instructions', 'Checklist', 'Summary', 'Sign-Off'],
  },
};

// ISO standard mapping for intelligent template generation
const ISO_KEYWORDS: Record<string, { standard: string; clause?: string; owner: string }> = {
  quality: { standard: 'ISO 9001:2015', owner: '[Quality Manager]' },
  environment: { standard: 'ISO 14001:2015', owner: '[Environmental Manager]' },
  environmental: { standard: 'ISO 14001:2015', owner: '[Environmental Manager]' },
  'health and safety': { standard: 'ISO 45001:2018', owner: '[H&S Manager]' },
  'health & safety': { standard: 'ISO 45001:2018', owner: '[H&S Manager]' },
  ohs: { standard: 'ISO 45001:2018', owner: '[H&S Manager]' },
  safety: { standard: 'ISO 45001:2018', owner: '[H&S Manager]' },
  'information security': {
    standard: 'ISO/IEC 27001:2022',
    owner: '[Information Security Manager]',
  },
  infosec: { standard: 'ISO/IEC 27001:2022', owner: '[Information Security Manager]' },
  cyber: { standard: 'ISO/IEC 27001:2022', owner: '[Information Security Manager]' },
  'food safety': { standard: 'ISO 22000:2018', owner: '[Food Safety Manager]' },
  haccp: { standard: 'ISO 22000:2018', clause: 'Clause 8.5', owner: '[Food Safety Manager]' },
  energy: { standard: 'ISO 50001:2018', owner: '[Energy Manager]' },
  'anti-bribery': { standard: 'ISO 37001:2016', owner: '[Compliance Manager]' },
  bribery: { standard: 'ISO 37001:2016', owner: '[Compliance Manager]' },
  corruption: { standard: 'ISO 37001:2016', owner: '[Compliance Manager]' },
  ai: { standard: 'ISO/IEC 42001:2023', owner: '[AI Governance Manager]' },
  'artificial intelligence': { standard: 'ISO/IEC 42001:2023', owner: '[AI Governance Manager]' },
  gdpr: { standard: 'UK GDPR / DPA 2018', owner: '[Data Protection Officer]' },
  'data protection': { standard: 'UK GDPR / DPA 2018', owner: '[Data Protection Officer]' },
  privacy: { standard: 'UK GDPR / DPA 2018', owner: '[Data Protection Officer]' },
  esg: { standard: 'CSRD / ESRS / GRI', owner: '[ESG Manager]' },
  sustainability: { standard: 'CSRD / ESRS / GRI', owner: '[ESG Manager]' },
};

function detectIsoStandard(prompt: string): { standard: string; owner: string; clause?: string } {
  const lower = prompt.toLowerCase();
  // Sort keywords by length descending so "food safety" is checked before "safety", etc.
  const sortedEntries = Object.entries(ISO_KEYWORDS).sort((a, b) => b[0].length - a[0].length);
  for (const [keyword, info] of sortedEntries) {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lower)) return info;
  }
  return { standard: 'ISO 9001:2015', owner: '[Quality Manager]' };
}

function detectCategory(prompt: string): string {
  const lower = prompt.toLowerCase();
  const match = (word: string) => new RegExp(`\\b${word}\\b`).test(lower);
  if (match('policy')) return 'POLICY';
  if (match('safe working') || match('swp')) return 'SWP';
  if (lower.includes('audit checklist') || match('audit')) return 'AUDIT';
  if (match('procedure') || match('process')) return 'PROCEDURE';
  if (match('form')) return 'FORM';
  if (match('checklist')) return 'FORM';
  if (match('register') || match('log')) return 'REGISTER';
  if (match('plan') || match('programme')) return 'PLAN';
  if (match('report') || match('review')) return 'REPORT';
  return 'PROCEDURE'; // default
}

function generateDocNumber(prefix: string, sequence: number): string {
  return `${prefix}-${String(sequence).padStart(3, '0')}`;
}

function buildTitle(prompt: string, category: string): string {
  // Extract key topic from prompt
  const cleanPrompt = prompt
    .replace(/create|generate|make|build|write|draft|a|an|the|for|with|template|document/gi, '')
    .trim();
  const words = cleanPrompt.split(/\s+/).filter((w) => w.length > 2);
  const title = words
    .slice(0, 6)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const categoryLabel =
    category === 'SWP'
      ? 'Safe Working Procedure'
      : category.charAt(0) + category.slice(1).toLowerCase();

  return `${title} ${categoryLabel}`.trim();
}

function buildSections(
  prompt: string,
  category: string,
  iso: { standard: string; owner: string }
): unknown[] {
  const _catDef = TEMPLATE_CATEGORIES[category];
  const sections: unknown[] = [];
  const _lower = prompt.toLowerCase();

  if (category === 'POLICY') {
    sections.push(
      {
        heading: '1. Purpose',
        content: `This policy establishes [COMPANY NAME]'s commitment and approach to ${extractTopic(prompt)}. It provides the framework for setting objectives and targets in compliance with ${iso.standard}.`,
      },
      {
        heading: '2. Scope',
        content: `This policy applies to all employees, contractors, and relevant interested parties of [COMPANY NAME]. It covers all activities, products, and services within the scope of the management system.`,
      },
      {
        heading: '3. Policy Statement',
        content: `[COMPANY NAME] is committed to:\n\na) Continual improvement of the management system\nb) Compliance with applicable legal and regulatory requirements\nc) Meeting the requirements of ${iso.standard}\nd) Providing adequate resources for implementation\ne) Communicating this policy to all relevant interested parties\nf) Reviewing this policy at planned intervals for continuing suitability`,
      },
      {
        heading: '4. Objectives',
        content: `The following objectives support this policy:\n\na) [Objective 1 — SMART: Specific, Measurable, Achievable, Relevant, Time-bound]\nb) [Objective 2]\nc) [Objective 3]`,
      },
      {
        heading: '5. Responsibilities',
        content: `[Managing Director]: Overall accountability for this policy and provision of resources.\n\n${iso.owner}: Day-to-day implementation, monitoring performance, and reporting to management.\n\n[All Employees]: Compliance with this policy and reporting of concerns.`,
      },
      {
        heading: '6. Communication',
        content: `This policy shall be:\n\na) Communicated to all employees during induction and annually thereafter\nb) Made available to interested parties on request\nc) Displayed in common areas and on the company intranet\nd) Reviewed for continuing suitability at each management review`,
      },
      {
        heading: '7. Review',
        content:
          'This policy shall be reviewed annually or when significant changes occur to the organisation, its context, or applicable legal requirements.',
      },
      {
        heading: '8. Related Documents',
        bullets: [
          'Management System Manual',
          'Objectives & Targets Register (REG-002)',
          'Management Review Minutes (FRM-009)',
        ],
      }
    );
  } else if (category === 'PROCEDURE') {
    sections.push(
      {
        heading: '1. Purpose',
        content: `This procedure defines the process for ${extractTopic(prompt)} within [COMPANY NAME]'s Integrated Management System, ensuring compliance with ${iso.standard}.`,
      },
      {
        heading: '2. Scope',
        content: `This procedure applies to all relevant personnel and activities related to ${extractTopic(prompt)} across [COMPANY NAME].`,
      },
      {
        heading: '3. Definitions',
        bullets: ['[Term 1]: [Definition]', '[Term 2]: [Definition]', '[Term 3]: [Definition]'],
      },
      {
        heading: '4. Responsibilities',
        content: `${iso.owner}: Responsible for the implementation and maintenance of this procedure.\n\n[Department Managers]: Ensure compliance within their areas.\n\n[All Staff]: Follow this procedure and report any deviations.`,
      },
      { heading: '5. Procedure', level: 1, content: '' },
      {
        heading: '5.1 Planning',
        level: 2,
        content:
          'a) [Step 1 — planning requirements]\nb) [Step 2 — resource allocation]\nc) [Step 3 — communication of requirements]',
      },
      {
        heading: '5.2 Implementation',
        level: 2,
        content:
          'a) [Step 1 — execution details]\nb) [Step 2 — monitoring requirements]\nc) [Step 3 — recording requirements]',
      },
      {
        heading: '5.3 Review & Improvement',
        level: 2,
        content:
          'a) [Step 1 — review frequency and criteria]\nb) [Step 2 — corrective action process]\nc) [Step 3 — lessons learned]',
      },
      {
        heading: '6. Records',
        content: 'The following records shall be maintained:',
        bullets: [
          '[Record type 1] — retained for [X] years',
          '[Record type 2] — retained for [X] years',
        ],
      },
      {
        heading: '7. Related Documents',
        bullets: ['[Related procedure/form 1]', '[Related procedure/form 2]', `${iso.standard}`],
      },
      {
        heading: '8. Review',
        content: 'This procedure shall be reviewed annually or when significant changes occur.',
      }
    );
  } else if (category === 'SWP') {
    sections.push(
      {
        heading: '1. Purpose',
        content: `To establish safe working practices for ${extractTopic(prompt)}, ensuring compliance with ${iso.standard} and applicable legal requirements.`,
      },
      {
        heading: '2. Scope',
        content:
          'This safe working procedure applies to all employees, contractors, and visitors who may be involved in or affected by these activities.',
      },
      {
        heading: '3. Hazards & Risks',
        bullets: [
          '[Hazard 1] — [Associated risk and potential consequence]',
          '[Hazard 2] — [Associated risk and potential consequence]',
          '[Hazard 3] — [Associated risk and potential consequence]',
          '[Hazard 4] — [Associated risk and potential consequence]',
        ],
      },
      { heading: '4. Control Measures', level: 1, content: '' },
      {
        heading: '4.1 Pre-Work Requirements',
        level: 2,
        bullets: [
          'Complete risk assessment (FRM-002)',
          'Obtain Permit to Work where required (FRM-006)',
          'Verify training and competence of all personnel',
          'Check and inspect all equipment before use',
          'Brief all workers on specific hazards and controls',
        ],
      },
      {
        heading: '4.2 During Work',
        level: 2,
        bullets: [
          '[Control measure 1]',
          '[Control measure 2]',
          '[Control measure 3]',
          'Stop work immediately if unsafe conditions develop',
        ],
      },
      {
        heading: '4.3 PPE Requirements',
        level: 2,
        bullets: [
          '[PPE item 1 — specification]',
          '[PPE item 2 — specification]',
          '[PPE item 3 — specification]',
        ],
      },
      {
        heading: '5. Emergency Procedures',
        content:
          'In the event of an emergency:\n\na) Stop work immediately and make the area safe\nb) Raise the alarm and contact emergency services if required\nc) Administer first aid if trained to do so\nd) Report the incident to the H&S Manager\ne) Preserve the scene for investigation',
      },
      {
        heading: '6. Training Requirements',
        bullets: [
          '[Required training/certification 1]',
          '[Required training/certification 2]',
          'Refresher frequency: [annually/every 3 years]',
        ],
      },
      {
        heading: '7. Related Documents',
        bullets: [
          'FRM-002: Hazard & Risk Assessment',
          'FRM-006: Permit to Work',
          'PRO-007: Incident Investigation',
          iso.standard,
        ],
      }
    );
  } else if (category === 'FORM') {
    sections.push(
      {
        heading: '1. Form Information',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Form Number', '[Auto-generated]'],
            ['Date', '[DD/MM/YYYY]'],
            ['Completed By', '[Name]'],
            ['Department', '[Department]'],
            ['Reference', `${iso.standard}`],
          ],
        },
      },
      {
        heading: '2. Details',
        table: {
          headers: ['Item', 'Description', 'Status', 'Notes'],
          rows: [
            ['[Item 1]', '', '', ''],
            ['[Item 2]', '', '', ''],
            ['[Item 3]', '', '', ''],
            ['[Item 4]', '', '', ''],
          ],
        },
      },
      {
        heading: '3. Assessment / Findings',
        content: '[Space for assessment details, findings, observations, or measurements]',
      },
      {
        heading: '4. Actions Required',
        table: {
          headers: ['Action', 'Responsible', 'Due Date', 'Status'],
          rows: [
            ['', '', '', ''],
            ['', '', '', ''],
            ['', '', '', ''],
          ],
        },
      },
      {
        heading: '5. Sign-Off',
        content:
          'Completed By: _________________________ Date: ___/___/______\n\nReviewed By: _________________________ Date: ___/___/______\n\nApproved By: _________________________ Date: ___/___/______',
      }
    );
  } else if (category === 'REGISTER') {
    sections.push(
      {
        heading: '1. Register Information',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Register Title', extractTopic(prompt)],
            ['Owner', iso.owner],
            ['Review Frequency', 'Annually'],
            ['ISO Reference', iso.standard],
          ],
        },
      },
      {
        heading: '2. Register',
        table: {
          headers: [
            'Ref #',
            'Description',
            'Category',
            'Status',
            'Owner',
            'Date',
            'Review Date',
            'Notes',
          ],
          rows: [
            ['001', '', '', '', '', '', '', ''],
            ['002', '', '', '', '', '', '', ''],
            ['003', '', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '3. Review History',
        table: {
          headers: ['Review Date', 'Reviewer', 'Changes Made', 'Next Review'],
          rows: [
            ['', '', '', ''],
            ['', '', '', ''],
          ],
        },
      }
    );
  } else if (category === 'PLAN') {
    sections.push(
      {
        heading: '1. Purpose',
        content: `This plan establishes the approach for ${extractTopic(prompt)} in compliance with ${iso.standard}.`,
      },
      {
        heading: '2. Scope',
        content: 'This plan covers [define scope — departments, activities, timeframe].',
      },
      { heading: '3. Objectives', bullets: ['[Objective 1]', '[Objective 2]', '[Objective 3]'] },
      {
        heading: '4. Schedule',
        table: {
          headers: ['Activity', 'Responsible', 'Start Date', 'End Date', 'Status'],
          rows: [
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
          ],
        },
      },
      {
        heading: '5. Resources',
        content:
          'The following resources are required:\n\na) Personnel: [roles and time commitments]\nb) Equipment: [specific equipment/tools]\nc) Budget: [estimated budget]\nd) External support: [consultants, training providers]',
      },
      {
        heading: '6. Monitoring & Review',
        content:
          'Progress will be monitored through:\n\na) [Weekly/monthly] status meetings\nb) KPI tracking against objectives\nc) Formal review at [frequency]\nd) Reporting to management review',
      },
      { heading: '7. Related Documents', bullets: ['[Related plan/procedure]', iso.standard] }
    );
  } else if (category === 'REPORT') {
    sections.push(
      {
        heading: '1. Executive Summary',
        content: `This report presents the findings of ${extractTopic(prompt)} for the period [start date] to [end date]. [Summary of key findings and conclusions].`,
      },
      {
        heading: '2. Methodology',
        content:
          'The following methodology was used:\n\na) [Data collection method]\nb) [Analysis approach]\nc) [Criteria/standards used]\nd) [Limitations and assumptions]',
      },
      { heading: '3. Findings', content: '[Detailed findings organised by topic/area]' },
      {
        heading: '4. Analysis',
        table: {
          headers: ['Area', 'Finding', 'Risk Level', 'Trend', 'Action Required'],
          rows: [
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
          ],
        },
      },
      {
        heading: '5. Recommendations',
        bullets: [
          '[Recommendation 1 — priority, responsible party, timeframe]',
          '[Recommendation 2]',
          '[Recommendation 3]',
        ],
      },
      { heading: '6. Conclusion', content: '[Overall conclusion and next steps]' },
      {
        heading: '7. Appendices',
        content: '[Reference to supporting data, evidence, and supplementary information]',
      }
    );
  } else if (category === 'AUDIT') {
    sections.push(
      {
        heading: '1. Audit Information',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Audit Number', '[AUD-YYYY-NNN]'],
            ['Standard', iso.standard],
            ['Audit Date', '[DD/MM/YYYY]'],
            ['Lead Auditor', '[Name]'],
            ['Auditee', '[Name / Department]'],
            ['Scope', extractTopic(prompt)],
          ],
        },
      },
      {
        heading: '2. Instructions',
        content:
          'For each requirement, record:\n• C = Conforming\n• NC = Non-Conforming (raise NCR)\n• OFI = Opportunity for Improvement\n• N/A = Not Applicable (justify)\n\nRecord objective evidence in the Evidence column.',
      },
      {
        heading: '3. Audit Checklist',
        table: {
          headers: ['Requirement', 'Evidence', 'Rating', 'Finding', 'NCR Ref'],
          rows: [
            ['[Requirement 1]', '', 'C / NC / OFI', '', ''],
            ['[Requirement 2]', '', 'C / NC / OFI', '', ''],
            ['[Requirement 3]', '', 'C / NC / OFI', '', ''],
            ['[Requirement 4]', '', 'C / NC / OFI', '', ''],
            ['[Requirement 5]', '', 'C / NC / OFI', '', ''],
          ],
        },
      },
      {
        heading: '4. Summary',
        table: {
          headers: ['Metric', 'Count'],
          rows: [
            ['Conforming', ''],
            ['Non-Conforming', ''],
            ['OFI', ''],
            ['N/A', ''],
          ],
        },
      },
      {
        heading: '5. Sign-Off',
        content:
          'Lead Auditor: _________________________ Date: ___/___/______\nAuditee: _________________________ Date: ___/___/______',
      }
    );
  }

  return sections;
}

function extractTopic(prompt: string): string {
  return (
    prompt
      .replace(
        /create|generate|make|build|write|draft|a|an|the|for|me|please|template|document|policy|procedure|form|register|plan|report|audit|checklist|swp|safe working/gi,
        ''
      )
      .replace(/\s+/g, ' ')
      .trim() || 'the specified topic'
  );
}

// GET /api/template-generator — List all generated templates
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const { category, isoStandard, page = '1', limit = '20' } = req.query;
    const skip =
      (Math.max(1, parseInt(page as string, 10) || 1) - 1) *
      Math.max(1, parseInt(limit as string, 10) || 20);

    const where: Record<string, unknown> = {
      organisationId: (user as { organisationId?: string }).organisationId || 'default',
    };
    if (category) where.category = category;
    if (isoStandard) where.isoStandard = { contains: String(isoStandard) };

    const [templates, total] = await Promise.all([
      prisma.qualGeneratedTemplate.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.qualGeneratedTemplate.count({ where }),
    ]);

    res.json({
      success: true,
      data: templates,
      pagination: {
        page: Math.max(1, parseInt(page as string, 10) || 1),
        limit: Math.max(1, parseInt(limit as string, 10) || 20),
        total,
      },
    });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch resource' },
    });
  }
});

// POST /api/template-generator — Generate a new template from a prompt
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const parsed = generateTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const {
      prompt,
      category: requestedCategory,
      isoStandard: requestedStandard,
      title: requestedTitle,
    } = parsed.data;

    // Detect parameters from prompt
    const category = requestedCategory || detectCategory(prompt);
    const iso = detectIsoStandard(prompt);
    if (requestedStandard) iso.standard = requestedStandard;

    const catDef = TEMPLATE_CATEGORIES[category];
    if (!catDef) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CATEGORY',
          message: `Invalid category. Valid: ${Object.keys(TEMPLATE_CATEGORIES).join(', ')}`,
        },
      });
    }

    // Get next sequence number
    const existingCount = await prisma.qualGeneratedTemplate.count({
      where: { category, organisationId: (user as { organisationId?: string }).organisationId || 'default' },
    });
    const sequence = existingCount + 100; // Start AI-generated at 100 to avoid conflicts
    const docNumber = generateDocNumber(catDef.prefix, sequence);
    const title = requestedTitle || buildTitle(prompt, category);

    // Build template config
    const sections = buildSections(prompt, category, iso);
    const configJson = {
      outputPath: `docs/compliance-templates/generated/${docNumber}-${title.replace(/[^a-zA-Z0-9]/g, '-')}.docx`,
      docNumber,
      title,
      version: '1.0',
      owner: iso.owner,
      approvedBy: '[Approver]',
      isoRef: iso.standard,
      sections,
    };

    // Save to database
    const template = await prisma.qualGeneratedTemplate.create({
      data: {
        docNumber,
        title,
        category,
        isoStandard: iso.standard,
        isoClause: iso.clause || null,
        description: `AI-generated ${category.toLowerCase()} template based on user prompt`,
        configJson: JSON.stringify(configJson),
        prompt: prompt.trim(),
        generatedBy: user!.id || 'system',
        organisationId: (user as { organisationId?: string }).organisationId || 'default',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: template.id,
        docNumber: template.docNumber,
        title: template.title,
        category: template.category,
        isoStandard: template.isoStandard,
        configJson: configJson,
        message: 'Template generated successfully. Use the configJson to produce a DOCX file.',
      },
    });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'GENERATION_ERROR', message: 'Internal server error' },
    });
  }
});

// GET /api/template-generator/categories — List available categories (BEFORE /:id)
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: Object.entries(TEMPLATE_CATEGORIES).map(([key, val]) => ({
        category: key,
        prefix: val.prefix,
        isoStandards: val.isoStandards,
        defaultSections: val.defaultSections,
      })),
    });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list categories' },
    });
  }
});

// GET /api/template-generator/:id — Get a specific generated template
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const template = await prisma.qualGeneratedTemplate.findUnique({
      where: { id: req.params.id },
    });

    if (!template) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Template not found' } });
    }

    res.json({ success: true, data: { ...template, configJson: JSON.parse(template.configJson) } });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch resource' },
    });
  }
});

// DELETE /api/template-generator/:id — Delete a generated template
router.delete(
  '/:id',
  authenticate,
  requirePermission('quality', PermissionLevel.FULL),
  async (req: Request, res: Response) => {
    try {
      await prisma.qualGeneratedTemplate.delete({
        where: { id: req.params.id },
      });
      res.json({ success: true, data: { message: 'Template deleted' } });
    } catch (error: unknown) {
      logger.error('Request failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete resource' },
      });
    }
  }
);

export default router;
