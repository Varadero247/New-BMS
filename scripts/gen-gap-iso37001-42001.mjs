// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const templates = [
  // ============================================
  // ISO 37001:2016 — Anti-Bribery (9 templates)
  // ============================================
  {
    outputPath: 'docs/compliance-templates/policies/POL-015-Anti-Bribery-Policy.docx',
    docNumber: 'POL-015',
    title: 'Anti-Bribery & Anti-Corruption Policy',
    version: '1.0',
    owner: '[Compliance Officer]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 37001:2016 Clause 5.2',
    sections: [
      {
        heading: '1. Policy Statement',
        content:
          '[COMPANY NAME] has a zero-tolerance approach to bribery and corruption. We are committed to acting professionally, fairly, and with integrity in all business dealings and relationships, wherever we operate.',
      },
      {
        heading: '2. Scope',
        content:
          'This policy applies to all employees, directors, officers, contractors, consultants, agents, intermediaries, joint venture partners, and any other person acting on behalf of [COMPANY NAME]. It covers all forms of bribery including:\n\na) Offering, promising, giving, or authorising a bribe\nb) Requesting, agreeing to receive, or accepting a bribe\nc) Bribery of public officials (domestic and foreign)\nd) Facilitation payments\ne) Political and charitable contributions made to obtain an improper advantage',
      },
      {
        heading: '3. Prohibited Conduct',
        bullets: [
          'Offering or giving anything of value to influence a decision or gain an improper advantage',
          'Making facilitation or "grease" payments to speed up routine government actions',
          'Providing gifts, hospitality, or entertainment that are lavish, disproportionate, or intended to influence',
          'Making political donations on behalf of the company to secure business advantage',
          'Using intermediaries, agents, or third parties to channel bribes',
          'Failing to report suspected or actual bribery',
        ],
      },
      {
        heading: '4. Gifts & Hospitality',
        content:
          'All gifts and hospitality (given or received) must be:\na) Reasonable, proportionate, and made in good faith\nb) Declared in the Gifts & Hospitality Register (REG-037)\nc) Pre-approved if value exceeds £50 (individual) or £200 (corporate hospitality)\nd) Never given to or received from public officials without Compliance Officer approval\ne) Never given during a tender or contract negotiation',
      },
      {
        heading: '5. Reporting & Whistleblowing',
        content:
          'Any employee who suspects bribery or corruption must report it to the Compliance Officer or via the confidential whistleblowing channel. No employee will suffer retaliation for reporting concerns in good faith.\n\nWhistleblowing channel: [email/phone/online portal]',
      },
      {
        heading: '6. Consequences',
        content:
          'Violation of this policy may result in disciplinary action up to and including dismissal, and may constitute a criminal offence under the Bribery Act 2010.',
      },
      {
        heading: '7. Review',
        content:
          'Reviewed annually by the Compliance Officer and approved by the governing body.\n\nSigned: _________________________ Date: ___/___/______\nManaging Director',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-060-Bribery-Risk-Assessment.docx',
    docNumber: 'PRO-060',
    title: 'Bribery Risk Assessment Procedure',
    version: '1.0',
    owner: '[Compliance Officer]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 37001:2016 Clause 4.5',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To identify, analyse, and evaluate bribery risks faced by [COMPANY NAME] and determine controls to mitigate those risks to an acceptable level.',
      },
      {
        heading: '2. Risk Categories',
        table: {
          headers: ['Category', 'Risk Factors', 'Example Scenarios'],
          rows: [
            [
              'Country risk',
              'CPI score, governance, rule of law',
              'Operating in countries with high corruption perception',
            ],
            [
              'Sector risk',
              'Industry practices, regulatory environment',
              'Public procurement, construction, extractives, defence',
            ],
            [
              'Transaction risk',
              'Value, complexity, intermediaries',
              'High-value contracts, use of agents/intermediaries',
            ],
            [
              'Business partner risk',
              'Due diligence findings, reputation',
              'Joint ventures, consortia, subcontractors in high-risk markets',
            ],
            [
              'Opportunity risk',
              'Gifts/hospitality culture, discretionary authority',
              'Staff with authority over procurement or contract award',
            ],
          ],
        },
      },
      {
        heading: '3. Assessment Process',
        content:
          '1. Identify: List all business activities, relationships, and transactions\n2. Analyse: Assess inherent bribery risk (likelihood x impact) for each\n3. Evaluate: Assess existing controls and determine residual risk\n4. Treat: Implement additional controls where residual risk exceeds tolerance\n5. Monitor: Ongoing monitoring of risk indicators and control effectiveness',
      },
      {
        heading: '4. Risk Rating',
        content:
          'Likelihood: 1 (Rare) to 5 (Almost Certain)\nImpact: 1 (Negligible) to 5 (Catastrophic — criminal prosecution, debarment)\nRisk = Likelihood x Impact\n\nHigh (15-25): Unacceptable — enhanced controls required\nMedium (8-14): Additional controls may be required\nLow (1-7): Current controls adequate — monitor',
      },
      {
        heading: '5. Review',
        content:
          'Bribery risk assessment reviewed annually, and following:\n- Entry into new markets or countries\n- New business relationships or joint ventures\n- Changes in legislation\n- Bribery incidents or investigations',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-061-Gifts-Hospitality.docx',
    docNumber: 'PRO-061',
    title: 'Gifts & Hospitality Procedure',
    version: '1.0',
    owner: '[Compliance Officer]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 37001:2016 Clause 8.7',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To provide clear rules on giving and receiving gifts, hospitality, and entertainment to prevent bribery and ensure all such activities are transparent, proportionate, and properly recorded.',
      },
      {
        heading: '2. Thresholds',
        table: {
          headers: ['Type', 'Value Threshold', 'Approval Required', 'Register Entry'],
          rows: [
            ['Gifts received', '<£25', 'No approval needed', 'Optional'],
            ['Gifts received', '£25-£50', 'Line manager approval', 'Required'],
            ['Gifts received', '>£50', 'Compliance Officer approval', 'Required'],
            ['Gifts given', '<£25', 'No approval needed', 'Optional'],
            ['Gifts given', '£25-£100', 'Line manager approval', 'Required'],
            ['Gifts given', '>£100', 'Compliance Officer approval', 'Required'],
            ['Hospitality (given/received)', '<£100 per head', 'Line manager approval', 'Required'],
            [
              'Hospitality (given/received)',
              '>£100 per head',
              'Compliance Officer approval',
              'Required',
            ],
            ['Public officials', 'Any value', 'Compliance Officer approval', 'Required'],
          ],
        },
      },
      {
        heading: '3. Prohibited',
        bullets: [
          'Cash or cash equivalents (gift cards, vouchers) — never acceptable',
          'Gifts/hospitality during a live tender or contract negotiation',
          'Anything lavish, disproportionate, or designed to influence a decision',
          'Gifts/hospitality to or from public officials without Compliance Officer pre-approval',
          'Any gift/hospitality that would embarrass the company if made public',
        ],
      },
      {
        heading: '4. Process',
        content:
          '1. Check policy: Is it within thresholds and not prohibited?\n2. Seek approval: Obtain required approval (line manager or Compliance Officer)\n3. Declare: Complete declaration form (FRM-047) and submit to Compliance\n4. Register: Entry made in Gifts & Hospitality Register (REG-037)\n5. Review: Compliance Officer reviews register quarterly for patterns/concerns',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-062-Due-Diligence.docx',
    docNumber: 'PRO-062',
    title: 'Due Diligence Procedure (Anti-Bribery)',
    version: '1.0',
    owner: '[Compliance Officer]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 37001:2016 Clause 8.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To establish a risk-based due diligence process for business associates (agents, intermediaries, JV partners, suppliers, contractors) to identify and mitigate bribery risks before and during business relationships.',
      },
      {
        heading: '2. Due Diligence Levels',
        table: {
          headers: ['Level', 'When Applied', 'Checks Required', 'Approver'],
          rows: [
            [
              'Standard',
              'Low-risk associates, domestic suppliers',
              'Questionnaire, internet search, sanctions check',
              'Procurement Manager',
            ],
            [
              'Enhanced',
              'Medium-risk: agents, intermediaries, overseas suppliers',
              'Standard + financial checks, reference checks, management interview',
              'Compliance Officer',
            ],
            [
              'Full',
              'High-risk: agents in high-risk countries, JVs, govt contracts',
              'Enhanced + third-party background report, beneficial ownership, site visit',
              'Managing Director',
            ],
          ],
        },
      },
      {
        heading: '3. Red Flags',
        bullets: [
          'Associate based in or connected to a high-corruption country (CPI <40)',
          'Unusual payment arrangements (cash, third-country accounts, shell companies)',
          'Refusal to provide information or sign anti-bribery undertaking',
          'Associate has connections to government officials or politically exposed persons',
          'Commission or fee structure is unusually high or lacks clear justification',
          'Associate has been the subject of bribery allegations or investigations',
          'Request to use a specific intermediary without clear business justification',
        ],
      },
      {
        heading: '4. Ongoing Monitoring',
        content:
          'Due diligence is refreshed:\n- Every 3 years for standard risk\n- Every 2 years for enhanced risk\n- Annually for full due diligence\n- Immediately following red flag indicators or change in relationship',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-047-Gifts-Hospitality-Declaration.docx',
    docNumber: 'FRM-047',
    title: 'Gifts & Hospitality Declaration Form',
    version: '1.0',
    owner: '[Compliance Officer]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 37001:2016 Clause 8.7',
    sections: [
      {
        heading: '1. Declaration Details',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Date', ''],
            ['Employee Name', ''],
            ['Department', ''],
            ['Given or Received?', 'Given / Received'],
            ['Description of Gift/Hospitality', ''],
            ['Approximate Value (£)', ''],
            ['Name of External Party', ''],
            ['Organisation of External Party', ''],
            ['Reason/Occasion', ''],
            ['Is the external party a public official?', 'Yes / No'],
            ['Is there an active tender or negotiation?', 'Yes / No'],
          ],
        },
      },
      {
        heading: '2. Approval',
        content:
          'Line Manager Approval: _________________________ Date: ___/___/______\n\nCompliance Officer Approval (if required): _________________________ Date: ___/___/______\n\nDecision: Approved / Declined\nReason for decline (if applicable): _______________',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-048-Bribery-Risk-Assessment.docx',
    docNumber: 'FRM-048',
    title: 'Bribery Risk Assessment Form',
    version: '1.0',
    owner: '[Compliance Officer]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 37001:2016 Clause 4.5',
    sections: [
      {
        heading: '1. Assessment Details',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Reference', '[BRA-YYYY-NNN]'],
            ['Business Activity/Relationship', ''],
            ['Assessor', ''],
            ['Date', ''],
          ],
        },
      },
      {
        heading: '2. Risk Assessment',
        table: {
          headers: [
            'Risk Factor',
            'Description',
            'Inherent Risk (L x I)',
            'Existing Controls',
            'Residual Risk',
            'Additional Controls',
          ],
          rows: [
            ['Country/jurisdiction', '', '', '', '', ''],
            ['Sector/industry', '', '', '', '', ''],
            ['Transaction value/complexity', '', '', '', '', ''],
            ['Business partner profile', '', '', '', '', ''],
            ['Use of intermediaries', '', '', '', '', ''],
            ['Government interaction', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '3. Overall Risk Rating',
        content:
          'Overall Bribery Risk: Low / Medium / High\n\nRisk acceptable? Yes / No\nIf No — additional controls required before proceeding.\n\nApproved by: _________________________ Date: ___/___/______',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-037-Gifts-Hospitality-Register.docx',
    docNumber: 'REG-037',
    title: 'Gifts & Hospitality Register',
    version: '1.0',
    owner: '[Compliance Officer]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 37001:2016 Clause 8.7',
    sections: [
      {
        heading: '1. Register',
        table: {
          headers: [
            'Ref',
            'Date',
            'Employee',
            'Given/Received',
            'Description',
            'Value (£)',
            'External Party',
            'Public Official?',
            'Approved By',
            'Notes',
          ],
          rows: [
            ['GH-001', '', '', '', '', '', '', 'Y/N', '', ''],
            ['GH-002', '', '', '', '', '', '', '', '', ''],
            ['GH-003', '', '', '', '', '', '', '', '', ''],
            ['GH-004', '', '', '', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '2. Review',
        content:
          'Register reviewed quarterly by Compliance Officer for patterns, excessive values, concentrated relationships, or other concerns. Summary reported to governing body annually.',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-038-Anti-Bribery-Training-Register.docx',
    docNumber: 'REG-038',
    title: 'Anti-Bribery Training Register',
    version: '1.0',
    owner: '[Compliance Officer]',
    approvedBy: '[HR Manager]',
    isoRef: 'ISO 37001:2016 Clause 7.3',
    sections: [
      {
        heading: '1. Training Log',
        table: {
          headers: [
            'Name',
            'Role',
            'Risk Level',
            'Training Type',
            'Date Completed',
            'Next Due',
            'Certificate/Evidence',
          ],
          rows: [
            ['', '', 'High/Medium/Low', 'Induction / Annual / Enhanced', '', '', ''],
            ['', '', '', '', '', '', ''],
            ['', '', '', '', '', '', ''],
            ['', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '2. Training Requirements',
        table: {
          headers: ['Risk Level', 'Training Content', 'Frequency', 'Format'],
          rows: [
            [
              'All staff',
              'Anti-bribery awareness, policy overview, reporting',
              'At induction + annually',
              'E-learning (30 min)',
            ],
            [
              'Medium risk',
              'Above + gifts/hospitality, due diligence, red flags',
              'At induction + annually',
              'Workshop (2 hours)',
            ],
            [
              'High risk (agents, procurement, senior mgmt)',
              'Above + case studies, facilitation payments, jurisdiction risks',
              'At appointment + annually',
              'Face-to-face (half day)',
            ],
          ],
        },
      },
      {
        heading: '3. Compliance Rate',
        content:
          'Target: 100% compliance with training requirements\nCurrent compliance: ____%\nOverdue: [list any overdue individuals]\n\nReviewed by: _________________________ Date: ___/___/______',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/reports/RPT-010-Anti-Bribery-Compliance.docx',
    docNumber: 'RPT-010',
    title: 'Anti-Bribery Compliance Report',
    version: '1.0',
    owner: '[Compliance Officer]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 37001:2016 Clause 9.1',
    sections: [
      {
        heading: '1. Report Details',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Period', '[YYYY]'],
            ['Prepared By', '[Compliance Officer]'],
            ['Date', ''],
          ],
        },
      },
      {
        heading: '2. Key Metrics',
        table: {
          headers: ['Metric', 'Target', 'Actual', 'Status'],
          rows: [
            ['Training completion rate', '100%', '', ''],
            ['Bribery risk assessments completed', '100% of scheduled', '', ''],
            ['Due diligence completed for new associates', '100%', '', ''],
            ['Gifts & hospitality declarations', 'All >£25 declared', '', ''],
            ['Whistleblowing reports received', 'N/A', '', ''],
            ['Investigations completed', 'All within 30 days', '', ''],
            ['Policy breaches identified', '0', '', ''],
            ['Regulatory enquiries/enforcement', '0', '', ''],
          ],
        },
      },
      {
        heading: '3. Significant Matters',
        content:
          '[Summary of any investigations, policy breaches, regulatory changes, or emerging risks]',
      },
      {
        heading: '4. Recommendations',
        content:
          '[Recommendations for governing body: policy updates, resource needs, training enhancements, control improvements]',
      },
    ],
  },
  // ============================================
  // ISO/IEC 42001:2023 — AI Management (8 templates)
  // ============================================
  {
    outputPath: 'docs/compliance-templates/policies/POL-016-AI-Management-Policy.docx',
    docNumber: 'POL-016',
    title: 'AI Management Policy',
    version: '1.0',
    owner: '[AI Governance Lead]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO/IEC 42001:2023 Clause 5.2',
    sections: [
      {
        heading: '1. Policy Statement',
        content:
          '[COMPANY NAME] is committed to the responsible development, deployment, and use of artificial intelligence systems. We will ensure AI systems are transparent, fair, safe, and respect human rights and fundamental freedoms.',
      },
      {
        heading: '2. Principles',
        bullets: [
          'Transparency: AI systems and their decision-making processes shall be explainable and understandable to affected stakeholders',
          'Fairness: AI systems shall not discriminate unfairly against individuals or groups',
          'Safety & Reliability: AI systems shall be robust, secure, and perform as intended',
          'Privacy: AI systems shall respect data protection rights and process personal data lawfully',
          'Accountability: Clear roles and responsibilities for AI system governance, development, deployment, and monitoring',
          'Human Oversight: Appropriate human oversight shall be maintained for all AI systems, especially those making consequential decisions',
          'Sustainability: Environmental impacts of AI systems shall be considered and minimised',
        ],
      },
      {
        heading: '3. Scope',
        content:
          'This policy applies to all AI systems developed, procured, deployed, or operated by [COMPANY NAME], including machine learning models, natural language processing systems, computer vision systems, robotic process automation with AI components, and generative AI tools.',
      },
      {
        heading: '4. Governance',
        content:
          'AI Governance Board: Provides strategic oversight, approves high-risk AI deployments\nAI Governance Lead: Day-to-day management of the AI MS, risk assessment, compliance\nAI Development Teams: Implement AI systems in accordance with this policy\nData Protection Officer: Ensures AI processing complies with GDPR\nAll Employees: Use AI tools responsibly and report concerns',
      },
      {
        heading: '5. Review',
        content:
          'Reviewed annually and following significant AI incidents, regulatory changes, or deployment of new high-risk AI systems.\n\nSigned: _________________________ Date: ___/___/______\nManaging Director',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-063-AI-Risk-Assessment.docx',
    docNumber: 'PRO-063',
    title: 'AI Risk Assessment Procedure',
    version: '1.0',
    owner: '[AI Governance Lead]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO/IEC 42001:2023 Clause 6.1',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To identify, assess, and manage risks associated with AI systems throughout their lifecycle, including risks to individuals, groups, organisations, and society.',
      },
      {
        heading: '2. Risk Categories',
        table: {
          headers: ['Category', 'Examples'],
          rows: [
            [
              'Bias & Fairness',
              'Discriminatory outcomes, underrepresentation, proxy discrimination',
            ],
            ['Transparency', 'Lack of explainability, opaque decision-making, inability to audit'],
            [
              'Safety & Reliability',
              'Incorrect outputs, adversarial attacks, system failures, unintended behaviour',
            ],
            [
              'Privacy',
              'Unlawful processing, re-identification, inference of sensitive attributes',
            ],
            ['Security', 'Model theft, data poisoning, prompt injection, adversarial manipulation'],
            ['Human Rights', 'Impact on autonomy, dignity, freedom of expression, employment'],
            ['Environmental', 'Energy consumption, carbon footprint of training/inference'],
            ['Legal & Regulatory', 'Non-compliance with AI Act, GDPR, sector-specific regulations'],
          ],
        },
      },
      {
        heading: '3. Risk Classification',
        content:
          'AI systems are classified into risk tiers:\n\nMinimal Risk: Simple automation, internal tools with limited impact\nLimited Risk: Customer-facing AI with transparency obligations\nHigh Risk: AI in employment, credit, healthcare, law enforcement, critical infrastructure\nUnacceptable Risk: Social scoring, mass surveillance, manipulative AI — prohibited\n\nHigh-risk AI systems require full AI Impact Assessment (FRM-049) before deployment.',
      },
      {
        heading: '4. Assessment Process',
        content:
          '1. System Registration: Register in AI Systems Inventory (REG-039)\n2. Classification: Determine risk tier\n3. Impact Assessment: Complete FRM-049 for high-risk systems\n4. Controls: Implement appropriate controls (technical + organisational)\n5. Approval: Obtain governance board approval for high-risk deployments\n6. Monitoring: Ongoing monitoring of AI system performance and risks\n7. Review: Periodic re-assessment (annually or trigger-based)',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/procedures/PRO-064-AI-System-Lifecycle.docx',
    docNumber: 'PRO-064',
    title: 'AI System Lifecycle Management Procedure',
    version: '1.0',
    owner: '[AI Governance Lead]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO/IEC 42001:2023 Clause 8.4',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'To define the lifecycle management process for AI systems from conception through retirement, ensuring governance, quality, and responsible AI practices at every stage.',
      },
      {
        heading: '2. Lifecycle Stages',
        table: {
          headers: ['Stage', 'Key Activities', 'Governance Gate', 'Documentation'],
          rows: [
            [
              '1. Concept',
              'Business case, feasibility, ethical review',
              'Governance Board approval',
              'Business case, initial risk assessment',
            ],
            [
              '2. Design',
              'Data requirements, model architecture, fairness criteria',
              'Design review',
              'Design specification, data management plan',
            ],
            [
              '3. Development',
              'Data collection/preparation, model training, testing',
              'Development review',
              'Training logs, test results, bias testing',
            ],
            [
              '4. Validation',
              'Performance testing, fairness audit, security testing',
              'Validation gate',
              'Validation report, AI Impact Assessment',
            ],
            [
              '5. Deployment',
              'Production release, monitoring setup, user training',
              'Deployment approval',
              'Deployment plan, monitoring dashboard',
            ],
            [
              '6. Operation',
              'Performance monitoring, drift detection, incident response',
              'Periodic review',
              'Monitoring reports, incident logs',
            ],
            [
              '7. Retirement',
              'Model decommission, data deletion, knowledge capture',
              'Retirement approval',
              'Retirement report, lessons learned',
            ],
          ],
        },
      },
      {
        heading: '3. Data Governance',
        content:
          'AI training data shall be:\na) Collected and processed lawfully (GDPR compliance)\nb) Representative and balanced (bias testing required)\nc) Documented (data cards/datasheets)\nd) Version controlled\ne) Subject to quality checks before use',
      },
      {
        heading: '4. Model Governance',
        content:
          'a) All models version controlled with clear lineage\nb) Training reproducible (random seeds, hyperparameters documented)\nc) Performance metrics tracked over time (accuracy, fairness metrics, drift)\nd) Explainability methods applied appropriate to risk level\ne) Human review required for consequential decisions',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-049-AI-Impact-Assessment.docx',
    docNumber: 'FRM-049',
    title: 'AI Impact Assessment Form',
    version: '1.0',
    owner: '[AI Governance Lead]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO/IEC 42001:2023 Clause 6.1.2',
    sections: [
      {
        heading: '1. System Details',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['AI System Name', ''],
            ['Version', ''],
            ['Owner', ''],
            ['Purpose', ''],
            ['Risk Tier', 'Minimal / Limited / High'],
            ['Date', ''],
            ['Assessor', ''],
          ],
        },
      },
      {
        heading: '2. Impact Assessment',
        table: {
          headers: [
            'Impact Area',
            'Description of Impact',
            'Severity',
            'Likelihood',
            'Risk Level',
            'Mitigation',
          ],
          rows: [
            ['Fairness & Bias', '', '', '', '', ''],
            ['Transparency & Explainability', '', '', '', '', ''],
            ['Privacy & Data Protection', '', '', '', '', ''],
            ['Safety & Reliability', '', '', '', '', ''],
            ['Security', '', '', '', '', ''],
            ['Human Rights & Autonomy', '', '', '', '', ''],
            ['Environmental Impact', '', '', '', '', ''],
            ['Legal & Regulatory Compliance', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '3. Human Oversight',
        content:
          'Level of human oversight: Human-in-the-loop / Human-on-the-loop / Human-in-command\nJustification: [Why this level is appropriate]\nEscalation process: [How edge cases or uncertain outputs are escalated to humans]',
      },
      {
        heading: '4. Approval',
        content:
          'Overall Risk: Low / Medium / High\nDeployment Approved: Yes / No / Conditional\nConditions (if applicable): _______________\n\nApproved by: _________________________ Date: ___/___/______\nAI Governance Board Chair',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/forms/FRM-050-AI-System-Registration.docx',
    docNumber: 'FRM-050',
    title: 'AI System Registration Form',
    version: '1.0',
    owner: '[AI Governance Lead]',
    approvedBy: '[IT Director]',
    isoRef: 'ISO/IEC 42001:2023 Clause 8.2',
    sections: [
      {
        heading: '1. System Registration',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['System ID', '[AI-YYYY-NNN]'],
            ['System Name', ''],
            ['Description', ''],
            ['AI Type', 'ML / NLP / Computer Vision / RPA+AI / Generative AI / Other'],
            ['Purpose', ''],
            ['Department', ''],
            ['System Owner', ''],
            ['Vendor (if procured)', ''],
            ['Risk Tier', 'Minimal / Limited / High'],
            ['Data Sources', ''],
            ['Personal Data Processed?', 'Yes / No'],
            ['Decision Impact', 'Advisory / Semi-autonomous / Autonomous'],
            ['Deployment Status', 'Concept / Development / Deployed / Retired'],
            ['Date Registered', ''],
            ['Last Review', ''],
          ],
        },
      },
      {
        heading: '2. Compliance Checklist',
        table: {
          headers: ['Requirement', 'Status', 'Notes'],
          rows: [
            ['AI Impact Assessment completed', 'Y/N/NA', ''],
            ['DPIA completed (if personal data)', 'Y/N/NA', ''],
            ['Fairness/bias testing completed', 'Y/N/NA', ''],
            ['Explainability method defined', 'Y/N/NA', ''],
            ['Human oversight arrangements in place', 'Y/N/NA', ''],
            ['Monitoring and drift detection active', 'Y/N/NA', ''],
            ['Incident response plan in place', 'Y/N/NA', ''],
            ['User training completed', 'Y/N/NA', ''],
          ],
        },
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/registers/REG-039-AI-Systems-Inventory.docx',
    docNumber: 'REG-039',
    title: 'AI Systems Inventory Register',
    version: '1.0',
    owner: '[AI Governance Lead]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO/IEC 42001:2023 Clause 8.2',
    sections: [
      {
        heading: '1. AI Systems Inventory',
        table: {
          headers: [
            'System ID',
            'Name',
            'Type',
            'Purpose',
            'Risk Tier',
            'Owner',
            'Status',
            'Impact Assessment',
            'Last Review',
            'Next Review',
          ],
          rows: [
            ['AI-001', '', '', '', '', '', 'Deployed/Dev/Retired', 'Complete/Pending/NA', '', ''],
            ['AI-002', '', '', '', '', '', '', '', '', ''],
            ['AI-003', '', '', '', '', '', '', '', '', ''],
            ['AI-004', '', '', '', '', '', '', '', '', ''],
          ],
        },
      },
      {
        heading: '2. Summary Statistics',
        content:
          'Total AI systems: ___\nHigh-risk: ___\nLimited risk: ___\nMinimal risk: ___\nAll impact assessments current: Yes / No\n\nReviewed by: _________________________ Date: ___/___/______',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/plans/PLN-011-AI-Objectives.docx',
    docNumber: 'PLN-011',
    title: 'AI Objectives & Implementation Plan',
    version: '1.0',
    owner: '[AI Governance Lead]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO/IEC 42001:2023 Clause 6.2',
    sections: [
      {
        heading: '1. AI Objectives',
        table: {
          headers: ['Ref', 'Objective', 'KPI', 'Target', 'Owner', 'Due Date', 'Status'],
          rows: [
            [
              'AIO-01',
              'Complete AI inventory for all systems',
              '% systems registered',
              '100%',
              'AI Governance Lead',
              '31/03/2026',
              'In Progress',
            ],
            [
              'AIO-02',
              'AI impact assessments for all high-risk systems',
              '% high-risk assessed',
              '100%',
              'AI Governance Lead',
              '30/06/2026',
              'Planned',
            ],
            [
              'AIO-03',
              'Implement bias monitoring for customer-facing AI',
              '% systems monitored',
              '100%',
              'Data Science Lead',
              '31/12/2026',
              'Planned',
            ],
            [
              'AIO-04',
              'AI awareness training for all staff',
              '% trained',
              '100%',
              'HR / AI Governance',
              '30/06/2026',
              'In Progress',
            ],
            [
              'AIO-05',
              'Achieve ISO 42001 certification',
              'Certification',
              'Certified',
              'AI Governance Lead',
              '31/12/2026',
              'Planned',
            ],
          ],
        },
      },
      {
        heading: '2. Action Plans',
        table: {
          headers: ['Objective', 'Action', 'Resource', 'Timeline'],
          rows: [
            [
              'AIO-01',
              'Department-by-department AI system discovery',
              'AI Governance team',
              'Q1 2026',
            ],
            [
              'AIO-02',
              'Develop impact assessment methodology and templates',
              'External consultant',
              'Q1 2026',
            ],
            ['AIO-03', 'Deploy fairness monitoring platform', '£15,000 + Data Science', 'Q3 2026'],
            [
              'AIO-04',
              'Develop and deliver AI awareness e-learning module',
              '£5,000 LMS budget',
              'Q2 2026',
            ],
            [
              'AIO-05',
              'Gap analysis, remediation, stage 1 & 2 audit',
              '£25,000 cert budget',
              'Q4 2026',
            ],
          ],
        },
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/reports/RPT-011-AI-Governance.docx',
    docNumber: 'RPT-011',
    title: 'AI Governance Report',
    version: '1.0',
    owner: '[AI Governance Lead]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO/IEC 42001:2023 Clause 9.1',
    sections: [
      {
        heading: '1. Report Details',
        table: {
          headers: ['Field', 'Detail'],
          rows: [
            ['Period', '[YYYY]'],
            ['Prepared By', '[AI Governance Lead]'],
            ['Date', ''],
          ],
        },
      },
      {
        heading: '2. AI Portfolio Summary',
        table: {
          headers: ['Metric', 'Value'],
          rows: [
            ['Total AI systems in inventory', ''],
            ['High-risk systems', ''],
            ['New AI systems deployed this period', ''],
            ['AI systems retired this period', ''],
            ['Impact assessments completed', ''],
            ['Bias incidents detected', ''],
            ['AI-related complaints received', ''],
            ['Training completion rate', ''],
          ],
        },
      },
      {
        heading: '3. Key Findings',
        content:
          '[Summary of AI performance, fairness audits, incidents, regulatory developments, and emerging risks]',
      },
      {
        heading: '4. Recommendations',
        content:
          '[Recommendations for governance board: resource needs, policy updates, new controls, technology investments]',
      },
    ],
  },
];

async function main() {
  const tmpDir = '/tmp/gap-iso37001-42001-configs';
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log(`Generating ${templates.length} ISO 37001 + ISO 42001 gap-filling templates...`);
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
