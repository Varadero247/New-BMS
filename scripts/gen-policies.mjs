// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
#!/usr/bin/env node
/**
 * Generate all 10 policy templates (POL-001 to POL-010)
 */
import fs from 'fs';
import { execSync } from 'child_process';

const policies = [
  {
    outputPath: 'docs/compliance-templates/policies/POL-001-Quality-Policy.docx',
    docNumber: 'POL-001',
    title: 'Quality Policy',
    version: '1.0',
    owner: '[Quality Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 9001:2015 Clause 5.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This Quality Policy establishes the commitment of [COMPANY NAME] to the consistent delivery of products and services that meet customer requirements and applicable statutory and regulatory requirements. It provides the framework for setting and reviewing quality objectives across the organisation.\n\nThis policy is aligned with ISO 9001:2015 and forms the foundation of the Quality Management System (QMS) operated through the Nexara Integrated Management System.',
      },
      {
        heading: '2. Scope',
        content:
          "This policy applies to all employees, contractors, and third parties involved in the design, development, production, delivery, and support of [COMPANY NAME]'s products and services. It covers all sites, departments, and processes within the scope of the QMS.\n\nThe scope of the QMS is documented in the Nexara IMS and includes: [describe products/services and locations].",
      },
      {
        heading: '3. Policy Statement',
        content:
          '[COMPANY NAME] is committed to:\n\na) Meeting customer requirements and striving to exceed customer expectations through the consistent delivery of quality products and services.\n\nb) Complying with all applicable statutory, regulatory, and contractual requirements relevant to our products, services, and operations.\n\nc) Continually improving the effectiveness of the Quality Management System by establishing and reviewing measurable quality objectives at relevant functions, levels, and processes.\n\nd) Ensuring that this policy is communicated, understood, and applied throughout the organisation and is available to relevant interested parties.\n\ne) Providing adequate resources, training, and infrastructure necessary to achieve quality objectives and maintain the QMS.\n\nf) Fostering a culture of quality awareness, where every employee understands their role in contributing to quality outcomes.\n\ng) Engaging with customers, suppliers, and other interested parties to understand and respond to their needs and expectations.\n\nh) Making decisions based on the analysis and evaluation of data and information to drive evidence-based improvement.',
      },
      {
        heading: '4. Quality Objectives',
        content:
          '[COMPANY NAME] shall establish quality objectives that are consistent with this policy. Objectives shall be:\n\n• Specific, measurable, achievable, relevant, and time-bound (SMART)\n• Set at relevant functions, levels, and processes\n• Monitored through the Nexara IMS objectives tracking module\n• Reviewed at planned intervals during management review meetings\n\nCurrent quality objectives are maintained in the Nexara IMS Objectives & Targets Register (REG-002) and include targets for customer satisfaction, on-time delivery, defect rates, and process performance.',
      },
      {
        heading: '5. Leadership & Commitment',
        content:
          'Top management demonstrates leadership and commitment to the QMS by:\n\na) Taking accountability for the effectiveness of the QMS\nb) Ensuring the quality policy and objectives are established and compatible with the strategic direction of the organisation\nc) Ensuring integration of QMS requirements into business processes\nd) Promoting the use of the process approach and risk-based thinking\ne) Ensuring resources are available for the QMS\nf) Communicating the importance of effective quality management\ng) Directing and supporting persons to contribute to QMS effectiveness\nh) Promoting continual improvement\ni) Supporting other relevant management roles to demonstrate their leadership',
      },
      {
        heading: '6. Responsibilities',
        content:
          '[Managing Director / CEO]: Overall accountability for the QMS and this policy. Ensures resources are provided and the policy is communicated.\n\n[Quality Manager]: Responsible for maintaining the QMS, monitoring performance, coordinating audits, managing non-conformances, and reporting to top management on QMS performance.\n\n[Department Managers]: Responsible for implementing this policy within their areas, ensuring team compliance, and contributing to quality objectives.\n\n[All Employees]: Responsible for following documented procedures, reporting quality issues, and contributing to continual improvement.',
      },
      {
        heading: '7. Communication',
        content:
          'This policy shall be:\n\n• Displayed prominently at all [COMPANY NAME] premises\n• Available on the Nexara IMS document management system\n• Included in employee induction programmes\n• Communicated to relevant interested parties upon request\n• Reviewed for continuing suitability at each management review',
      },
      {
        heading: '8. Review',
        content:
          'This policy shall be reviewed at least annually as part of the management review process (ISO 9001 Clause 9.3), or sooner if triggered by:\n\n• Significant changes in the business context or strategic direction\n• Results of internal or external audits\n• Changes in statutory or regulatory requirements\n• Customer feedback or complaints trends\n• Non-conformance or CAPA trends',
      },
      {
        heading: '9. Related Documents',
        bullets: [
          'PRO-001: Document & Records Control Procedure',
          'PRO-002: Internal Audit Procedure',
          'PRO-003: Corrective Action & CAPA Procedure',
          'PRO-004: Risk & Opportunity Management Procedure',
          'REG-002: Objectives & Targets Register',
          'RPT-001: Management Review Report Template',
          'FRM-009: Management Review Meeting Minutes Template',
        ],
      },
      {
        heading: '10. Approval',
        content:
          'This policy has been approved by the undersigned and is effective from the date of issue.\n\nSignature: ________________________    Date: [DD/MM/YYYY]\nName: [Managing Director Name]\nTitle: [Managing Director / CEO]\n\nSignature: ________________________    Date: [DD/MM/YYYY]\nName: [Quality Manager Name]\nTitle: [Quality Manager]',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/policies/POL-002-Environmental-Policy.docx',
    docNumber: 'POL-002',
    title: 'Environmental Policy',
    version: '1.0',
    owner: '[Environmental Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 14001:2015 Clause 5.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This Environmental Policy establishes the commitment of [COMPANY NAME] to protecting the environment, preventing pollution, and fulfilling compliance obligations. It provides the framework for setting environmental objectives and targets within the Environmental Management System (EMS) aligned to ISO 14001:2015, operated through the Nexara Integrated Management System.',
      },
      {
        heading: '2. Scope',
        content:
          'This policy applies to all activities, products, and services of [COMPANY NAME] across all sites and operations. It addresses environmental aspects including but not limited to: emissions to air, discharges to water, land contamination, waste generation and management, resource use and efficiency, energy consumption, and impacts on biodiversity and ecosystems.',
      },
      {
        heading: '3. Policy Statement',
        content:
          '[COMPANY NAME] is committed to:\n\na) Protecting the environment, including prevention of pollution and reduction of environmental impacts from our operations, products, and services.\n\nb) Fulfilling all applicable compliance obligations including environmental legislation, regulations, permits, and other requirements to which we subscribe.\n\nc) Continually improving the Environmental Management System to enhance environmental performance, with a focus on reducing our carbon footprint, minimising waste, and conserving natural resources.\n\nd) Considering the lifecycle perspective of our products and services, seeking to minimise environmental impacts from raw material extraction through to end-of-life disposal.\n\ne) Setting measurable environmental objectives and targets at relevant functions and levels, and reviewing them at planned intervals.\n\nf) Communicating this policy to all employees and making it available to interested parties, including regulators, customers, suppliers, and the local community.\n\ng) Promoting environmental awareness among employees, contractors, and suppliers through training and engagement programmes.\n\nh) Integrating environmental considerations into business decisions, procurement practices, and new product/service development.',
      },
      {
        heading: '4. Environmental Objectives',
        content:
          '[COMPANY NAME] shall establish environmental objectives consistent with this policy. Current objectives include:\n\n• Reduce Scope 1 and 2 greenhouse gas emissions by [X]% by [year]\n• Achieve [X]% waste diversion from landfill by [year]\n• Reduce water consumption by [X]% per unit of production by [year]\n• Maintain zero significant environmental incidents\n• Achieve [X]% compliance score on environmental legal register\n\nObjectives are tracked in the Nexara IMS Environmental Objectives module and reviewed at management review meetings.',
      },
      {
        heading: '5. Responsibilities',
        content:
          '[Managing Director / CEO]: Overall accountability for environmental performance and ensuring adequate resources are provided.\n\n[Environmental Manager]: Day-to-day management of the EMS, legal compliance monitoring, aspects and impacts assessment, and reporting.\n\n[Department Managers]: Implementing environmental controls within their areas, ensuring team compliance with procedures.\n\n[All Employees]: Following environmental procedures, reporting incidents and near-misses, and contributing to environmental improvement.',
      },
      {
        heading: '6. Compliance Obligations',
        content:
          'A register of applicable environmental legislation and other requirements is maintained in the Nexara IMS Legal Register (FRM-011). This includes:\n\n• Environmental Protection Act 1990\n• Environment Act 2021\n• Climate Change Act 2008\n• Waste (England and Wales) Regulations 2011\n• Environmental Permitting (England and Wales) Regulations 2016\n• REACH Regulations\n• Site-specific permits and consents\n• Industry codes of practice\n• Voluntary commitments and agreements',
      },
      {
        heading: '7. Review',
        content:
          'This policy shall be reviewed at least annually as part of the management review process, or sooner if triggered by significant changes in activities, compliance obligations, or environmental performance.',
      },
      {
        heading: '8. Related Documents',
        bullets: [
          'PRO-006: Environmental Aspects & Impacts Procedure',
          'PRO-011: Emergency Preparedness & Response Procedure',
          'FRM-010: Environmental Aspects & Impacts Register',
          'FRM-011: Legal & Regulatory Register',
          'REG-002: Objectives & Targets Register',
          'RPT-003: ESG Annual Report Template',
        ],
      },
      {
        heading: '9. Approval',
        content:
          'Signature: ________________________    Date: [DD/MM/YYYY]\nName: [Managing Director Name]\nTitle: [Managing Director / CEO]',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/policies/POL-003-Health-Safety-Policy.docx',
    docNumber: 'POL-003',
    title: 'Occupational Health & Safety Policy',
    version: '1.0',
    owner: '[Health & Safety Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 45001:2018 Clause 5.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This Occupational Health & Safety (OH&S) Policy establishes the commitment of [COMPANY NAME] to providing safe and healthy working conditions for the prevention of work-related injury and ill health. It sets the framework for the OH&S Management System aligned to ISO 45001:2018, operated through the Nexara Integrated Management System.',
      },
      {
        heading: '2. Scope',
        content:
          'This policy applies to all workers, including employees, contractors, agency workers, visitors, and any other persons under the control or influence of [COMPANY NAME] across all workplaces and operations.',
      },
      {
        heading: '3. Policy Statement',
        content:
          "[COMPANY NAME] is committed to:\n\na) Providing safe and healthy working conditions for the prevention of work-related injury and ill health, appropriate to the purpose, size, and context of the organisation.\n\nb) Eliminating hazards and reducing OH&S risks using the hierarchy of controls: elimination, substitution, engineering controls, administrative controls, and personal protective equipment.\n\nc) Fulfilling all applicable legal requirements and other requirements relating to occupational health and safety.\n\nd) Continual improvement of the OH&S management system to enhance OH&S performance.\n\ne) Consultation and participation of workers, and where they exist, workers' representatives, in OH&S decisions.\n\nf) Ensuring all workers understand their obligation to work safely, report hazards, and participate in health and safety programmes.\n\ng) Providing adequate resources, training, supervision, and competent health and safety advice.\n\nh) Investigating all incidents, near-misses, and dangerous occurrences to prevent recurrence.\n\ni) Setting and reviewing measurable OH&S objectives at relevant functions and levels.\n\nj) Promoting a positive health and safety culture where safety is everyone's responsibility.",
      },
      {
        heading: '4. Worker Participation & Consultation',
        content:
          '[COMPANY NAME] ensures worker participation through:\n\n• Health & Safety Committee meetings held [monthly/quarterly]\n• Risk assessment consultation for workplace changes\n• Incident investigation involvement\n• Safety suggestion schemes\n• Toolbox talks and safety briefings\n• Worker representatives on safety matters\n\nAll workers have the right to remove themselves from work situations they believe present an imminent and serious danger to life or health, without fear of reprisal.',
      },
      {
        heading: '5. Responsibilities',
        content:
          '[Managing Director]: Ultimate accountability for OH&S, providing resources, ensuring this policy is implemented.\n\n[H&S Manager]: Operational management of the OH&S system, risk assessments, incident investigation, compliance monitoring, training coordination.\n\n[Line Managers/Supervisors]: Implementing safety procedures in their areas, conducting toolbox talks, ensuring workers are competent, reporting hazards.\n\n[All Workers]: Working safely, using PPE as required, reporting hazards and incidents, participating in training and consultation.',
      },
      {
        heading: '6. Review',
        content:
          'This policy shall be reviewed annually or following a significant incident, change in legislation, or organisational change.',
      },
      {
        heading: '7. Related Documents',
        bullets: [
          'PRO-005: Hazard Identification & Risk Assessment Procedure',
          'PRO-007: Incident Investigation & Reporting Procedure',
          'PRO-011: Emergency Preparedness & Response Procedure',
          'PRO-012: Permit to Work Procedure',
          'FRM-002: Hazard Identification & Risk Assessment Form',
          'FRM-003: Incident Report Form',
          'FRM-006: Permit to Work Form',
        ],
      },
      {
        heading: '8. Approval',
        content:
          'Signature: ________________________    Date: [DD/MM/YYYY]\nName: [Managing Director Name]\nTitle: [Managing Director / CEO]',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/policies/POL-004-Information-Security-Policy.docx',
    docNumber: 'POL-004',
    title: 'Information Security Policy',
    version: '1.0',
    owner: '[Information Security Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 27001:2022 Clause 5.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This Information Security Policy establishes the commitment of [COMPANY NAME] to protecting the confidentiality, integrity, and availability of information assets. It defines the framework for the Information Security Management System (ISMS) aligned to ISO 27001:2022, operated through the Nexara Integrated Management System.',
      },
      {
        heading: '2. Scope',
        content:
          'This policy applies to all information assets owned, managed, or processed by [COMPANY NAME], including digital and physical information, across all locations, systems, networks, and third-party services. It applies to all employees, contractors, and third parties with access to [COMPANY NAME] information.',
      },
      {
        heading: '3. Policy Statement',
        content:
          '[COMPANY NAME] is committed to:\n\na) Protecting information from unauthorised access, disclosure, modification, destruction, or interference, whether accidental or deliberate.\n\nb) Ensuring the confidentiality of sensitive business information, personal data, and customer data through appropriate access controls and classification.\n\nc) Maintaining the integrity of information by protecting against unauthorised modification and ensuring accuracy and completeness.\n\nd) Ensuring the availability of information and information systems to support business operations and meet contractual obligations.\n\ne) Complying with all applicable legal, regulatory, and contractual requirements relating to information security, including UK GDPR, Data Protection Act 2018, and the NIS Regulations.\n\nf) Continually improving the ISMS based on risk assessment outcomes, incident lessons learned, and evolving threats.\n\ng) Ensuring all personnel are aware of their information security responsibilities through training and awareness programmes.\n\nh) Managing information security risks through a systematic risk assessment and treatment process.',
      },
      {
        heading: '4. Information Classification',
        content:
          '[COMPANY NAME] classifies information into the following categories:\n\n• CONFIDENTIAL: Information that would cause significant harm if disclosed. Access restricted to named individuals. Examples: financial data, strategic plans, personal data.\n\n• INTERNAL: Information intended for use within [COMPANY NAME] only. Not for external distribution without authorisation. Examples: policies, procedures, meeting minutes.\n\n• PUBLIC: Information approved for public release. No access restrictions. Examples: marketing materials, published reports.',
      },
      {
        heading: '5. Access Control Principles',
        content:
          'Access to information and systems is managed on the principle of least privilege:\n\n• Access is granted based on business need and job role\n• Access rights are reviewed at least [quarterly/annually]\n• Multi-factor authentication is required for remote access and privileged accounts\n• User accounts are disabled immediately upon termination of employment\n• Shared accounts are prohibited except where technically unavoidable with compensating controls\n• All access is logged and monitored through the Nexara IMS audit trail',
      },
      {
        heading: '6. Incident Management',
        content:
          'All information security incidents, suspected incidents, and vulnerabilities must be reported immediately to [Information Security Manager / IT Helpdesk] using the Nexara IMS incident reporting module.\n\nIncident response follows PRO-014: Information Security Incident Response Procedure, including containment, investigation, notification (within 72 hours for personal data breaches per GDPR), and lessons learned.',
      },
      {
        heading: '7. Responsibilities',
        content:
          '[Managing Director]: Accountability for information security, resource provision.\n\n[Information Security Manager / CISO]: ISMS management, risk assessment, incident coordination, policy enforcement, audit management.\n\n[IT Manager]: Technical security controls, infrastructure security, patching, monitoring.\n\n[All Personnel]: Compliance with this policy, reporting incidents, protecting credentials, handling information according to classification.',
      },
      {
        heading: '8. Acceptable Use',
        content:
          'All users of [COMPANY NAME] information systems must:\n\n• Use systems only for authorised business purposes\n• Protect login credentials and never share passwords\n• Lock workstations when unattended\n• Not install unauthorised software\n• Not connect unauthorised devices to the network\n• Report suspicious emails, calls, or activity immediately\n• Comply with data protection requirements when handling personal data',
      },
      {
        heading: '9. Review',
        content:
          'This policy is reviewed annually, after a significant security incident, or when significant changes occur to the risk landscape, business context, or regulatory requirements.',
      },
      {
        heading: '10. Related Documents',
        bullets: [
          'PRO-014: Information Security Incident Response Procedure',
          'PRO-015: Business Continuity & Disaster Recovery Procedure',
          'POL-007: Data Protection & Privacy Policy',
          'FRM-014: Data Processing Activity Record',
          'RPT-005: Information Security Risk Assessment Report',
        ],
      },
      {
        heading: '11. Approval',
        content:
          'Signature: ________________________    Date: [DD/MM/YYYY]\nName: [Managing Director Name]\nTitle: [Managing Director / CEO]',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/policies/POL-005-Anti-Bribery-Policy.docx',
    docNumber: 'POL-005',
    title: 'Anti-Bribery & Corruption Policy',
    version: '1.0',
    owner: '[Compliance Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 37001:2016 Clause 5.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This Anti-Bribery & Corruption Policy establishes the zero-tolerance position of [COMPANY NAME] towards bribery and corruption in all forms. It sets out the responsibilities and expected behaviour of all personnel and associated persons, aligned to ISO 37001:2016 and the UK Bribery Act 2010.',
      },
      {
        heading: '2. Scope',
        content:
          'This policy applies to all directors, officers, employees, agency workers, consultants, contractors, agents, intermediaries, joint venture partners, and any other persons associated with [COMPANY NAME] or acting on its behalf, regardless of location.',
      },
      {
        heading: '3. Policy Statement',
        content:
          '[COMPANY NAME] has a zero-tolerance approach to bribery and corruption. We are committed to:\n\na) Conducting business with integrity, transparency, and in compliance with all applicable anti-bribery and corruption laws, including the UK Bribery Act 2010, the US Foreign Corrupt Practices Act, and all local laws in jurisdictions where we operate.\n\nb) Prohibiting all forms of bribery, including offering, promising, giving, requesting, agreeing to receive, or accepting bribes whether directly or through third parties.\n\nc) Prohibiting facilitation payments (small, unofficial payments to speed up routine governmental actions) in all circumstances.\n\nd) Implementing proportionate procedures to prevent bribery, including risk assessment, due diligence, training, monitoring, and reporting.\n\ne) Encouraging the reporting of any suspected bribery through confidential whistleblowing channels without fear of retaliation.\n\nf) Investigating all allegations of bribery and taking appropriate disciplinary and legal action.',
      },
      {
        heading: '4. Gifts, Hospitality & Donations',
        content:
          'The following rules apply to gifts and hospitality:\n\n• Gifts or hospitality may only be given or accepted if they are reasonable, proportionate, given in good faith, and not intended to influence a business decision.\n• All gifts and hospitality above [£/$/€50] must be declared in the Gift & Hospitality Register (FRM-012) and approved by [line manager / Compliance Manager].\n• Cash gifts are strictly prohibited under all circumstances.\n• Gifts to or from government officials require prior approval from the Compliance Manager.\n• Political and charitable donations must be approved by [Board / Managing Director] and recorded in the register.\n• Lavish or excessive hospitality is prohibited.',
      },
      {
        heading: '5. Due Diligence',
        content:
          'Proportionate due diligence shall be conducted on:\n\n• New business partners, agents, intermediaries, and joint venture partners before engagement\n• Suppliers and contractors operating in high-risk sectors or jurisdictions\n• Customers where there are bribery risk indicators\n\nDue diligence records are maintained in the Nexara IMS due diligence module and reviewed periodically.',
      },
      {
        heading: '6. Reporting & Whistleblowing',
        content:
          'Anyone who suspects or becomes aware of bribery or corruption must report it immediately through:\n\n• Their line manager (if appropriate)\n• The Compliance Manager: [email / phone]\n• The confidential whistleblowing hotline: [number / email]\n• The Nexara IMS incident reporting module\n\n[COMPANY NAME] will not tolerate retaliation against anyone who reports a concern in good faith.',
      },
      {
        heading: '7. Consequences of Breach',
        content:
          'Breach of this policy may result in:\n\n• Disciplinary action up to and including dismissal\n• Termination of business relationships with third parties\n• Criminal prosecution under the Bribery Act 2010 (penalties include unlimited fines and up to 10 years imprisonment)\n• Civil liability and reputational damage',
      },
      {
        heading: '8. Related Documents',
        bullets: [
          'FRM-012: Gift & Hospitality Register',
          'PRO-009: Supplier & Contractor Evaluation Procedure',
          'Whistleblowing Policy',
          'Code of Conduct',
        ],
      },
      {
        heading: '9. Approval',
        content:
          'Signature: ________________________    Date: [DD/MM/YYYY]\nName: [Managing Director Name]\nTitle: [Managing Director / CEO]',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/policies/POL-006-AI-Ethics-Governance-Policy.docx',
    docNumber: 'POL-006',
    title: 'AI Ethics & Governance Policy',
    version: '1.0',
    owner: '[AI Governance Lead]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 42001:2023 Clause 5.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This AI Ethics & Governance Policy establishes the principles, responsibilities, and governance framework for the responsible development, deployment, and use of Artificial Intelligence systems by [COMPANY NAME]. It is aligned to ISO/IEC 42001:2023 and forms the foundation of the AI Management System (AIMS) operated through the Nexara Integrated Management System.',
      },
      {
        heading: '2. Scope',
        content:
          'This policy applies to all AI systems developed, deployed, procured, or used by [COMPANY NAME], including machine learning models, natural language processing systems, decision-support algorithms, robotic process automation with adaptive capabilities, and generative AI tools.',
      },
      {
        heading: '3. Core Principles',
        content:
          'All AI activities at [COMPANY NAME] shall adhere to the following principles:\n\na) TRANSPARENCY: AI systems shall be designed and operated so that their purpose, capabilities, limitations, and decision-making logic can be understood and explained to affected parties.\n\nb) FAIRNESS & NON-DISCRIMINATION: AI systems shall be designed, tested, and monitored to prevent unfair bias, discrimination, or disproportionate impact on individuals or groups based on protected characteristics.\n\nc) HUMAN OVERSIGHT: All AI systems making or informing decisions that significantly affect individuals shall include meaningful human oversight mechanisms. Fully autonomous high-risk decisions are prohibited without human review.\n\nd) ACCOUNTABILITY: Clear roles and responsibilities shall be defined for the development, deployment, monitoring, and decommissioning of each AI system. AI-related decisions shall be traceable and auditable.\n\ne) PRIVACY & DATA PROTECTION: AI systems shall comply with data protection legislation (UK GDPR, DPA 2018) and process only the minimum necessary data.\n\nf) SAFETY & RELIABILITY: AI systems shall be tested, validated, and monitored to ensure they perform reliably within defined parameters and do not pose unacceptable safety risks.\n\ng) ENVIRONMENTAL RESPONSIBILITY: The environmental impact of AI compute resources shall be considered, and efforts shall be made to minimise the carbon footprint of AI operations.',
      },
      {
        heading: '4. Prohibited AI Uses',
        content:
          "[COMPANY NAME] prohibits the use of AI for:\n\n• Social scoring of individuals\n• Covert mass surveillance\n• Manipulation of individuals' decisions through subliminal techniques\n• Real-time biometric identification in public spaces (except where legally required for safety)\n• Automated decisions with legal or significant effects on individuals without human review\n• Any purpose that violates human rights, dignity, or applicable law",
      },
      {
        heading: '5. AI Risk Assessment',
        content:
          'All AI systems must undergo a risk assessment (FRM-013) before deployment, considering:\n\n• Impact on individuals (privacy, safety, rights, wellbeing)\n• Potential for bias and discrimination\n• Reliability and accuracy requirements\n• Regulatory requirements\n• Reputational risk\n\nAI systems are classified as Low, Medium, or High risk, with controls proportionate to the risk level. High-risk systems require board-level approval.',
      },
      {
        heading: '6. Governance Structure',
        content:
          '[AI Governance Lead / Committee]: Oversight of AI policy compliance, risk assessment review, approval of high-risk deployments.\n\n[AI Development Team]: Responsible for implementing technical controls, testing for bias, documenting model decisions.\n\n[Data Protection Officer]: Ensuring AI systems comply with data protection requirements.\n\n[All Users of AI Tools]: Responsible for using AI in accordance with this policy and reporting concerns.',
      },
      {
        heading: '7. Review',
        content:
          'This policy shall be reviewed annually, or when significant changes occur in AI technology, legislation, or organisational use of AI.',
      },
      {
        heading: '8. Related Documents',
        bullets: [
          'FRM-013: AI System Risk Assessment Form',
          'POL-007: Data Protection & Privacy Policy',
          'AI System Inventory (maintained in Nexara IMS)',
        ],
      },
      {
        heading: '9. Approval',
        content:
          'Signature: ________________________    Date: [DD/MM/YYYY]\nName: [Managing Director Name]\nTitle: [Managing Director / CEO]',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/policies/POL-007-Data-Protection-Privacy-Policy.docx',
    docNumber: 'POL-007',
    title: 'Data Protection & Privacy Policy',
    version: '1.0',
    owner: '[Data Protection Officer]',
    approvedBy: '[Managing Director]',
    isoRef: 'UK GDPR / Data Protection Act 2018',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This Data Protection & Privacy Policy sets out how [COMPANY NAME] collects, uses, stores, shares, and protects personal data in compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.',
      },
      {
        heading: '2. Scope',
        content:
          'This policy applies to all personal data processed by [COMPANY NAME], whether in electronic or paper form. It applies to all employees, contractors, and third-party data processors who handle personal data on behalf of the organisation.',
      },
      {
        heading: '3. Data Protection Principles',
        content:
          '[COMPANY NAME] shall ensure that personal data is:\n\na) Processed lawfully, fairly, and in a transparent manner (Lawfulness, Fairness, Transparency)\nb) Collected for specified, explicit, and legitimate purposes (Purpose Limitation)\nc) Adequate, relevant, and limited to what is necessary (Data Minimisation)\nd) Accurate and kept up to date (Accuracy)\ne) Kept for no longer than is necessary (Storage Limitation)\nf) Processed in a manner that ensures appropriate security (Integrity and Confidentiality)\ng) The controller shall be responsible for and be able to demonstrate compliance (Accountability)',
      },
      {
        heading: '4. Lawful Basis for Processing',
        content:
          '[COMPANY NAME] identifies and documents the lawful basis for each processing activity in the Record of Processing Activities (FRM-014). The lawful bases include:\n\n• Consent of the data subject\n• Performance of a contract\n• Compliance with a legal obligation\n• Vital interests of the data subject\n• Performance of a task in the public interest\n• Legitimate interests pursued by the controller',
      },
      {
        heading: '5. Data Subject Rights',
        content:
          'Individuals have the following rights which [COMPANY NAME] will facilitate:\n\n• Right to be informed (privacy notices)\n• Right of access (Subject Access Requests — responded to within 1 month)\n• Right to rectification\n• Right to erasure (right to be forgotten)\n• Right to restrict processing\n• Right to data portability\n• Right to object\n• Rights related to automated decision making and profiling\n\nRequests are managed through the Nexara IMS data subject request module and tracked to completion.',
      },
      {
        heading: '6. Data Breach Notification',
        content:
          "In the event of a personal data breach:\n\n• The breach must be reported internally immediately to the DPO\n• The DPO will assess the breach and determine if notification is required\n• The ICO must be notified within 72 hours where the breach is likely to result in a risk to individuals' rights and freedoms\n• Affected data subjects must be notified without undue delay where the breach is likely to result in a high risk to their rights and freedoms\n• All breaches are logged in the Nexara IMS incident module regardless of severity",
      },
      {
        heading: '7. Data Retention',
        content:
          '[COMPANY NAME] retains personal data only for as long as necessary for the purposes for which it was collected. Retention periods are defined in the Data Retention Schedule and enforced through the Nexara IMS data retention management module.\n\nWhen the retention period expires, data is securely deleted or anonymised.',
      },
      {
        heading: '8. International Transfers',
        content:
          'Personal data shall not be transferred outside the UK unless adequate safeguards are in place, such as:\n\n• UK Adequacy Regulations\n• Standard Contractual Clauses (SCCs)\n• Binding Corporate Rules\n• Explicit consent of the data subject',
      },
      {
        heading: '9. Data Protection Officer',
        content:
          'The Data Protection Officer can be contacted at:\n\nName: [DPO Name]\nEmail: [dpo@company.com]\nPhone: [Phone Number]\nAddress: [Address]',
      },
      {
        heading: '10. Related Documents',
        bullets: [
          'FRM-014: Data Processing Activity Record (ROPA)',
          'POL-004: Information Security Policy',
          'PRO-014: Information Security Incident Response Procedure',
          'Data Retention Schedule',
          'Privacy Notices',
        ],
      },
      {
        heading: '11. Approval',
        content:
          'Signature: ________________________    Date: [DD/MM/YYYY]\nName: [Managing Director Name]\nTitle: [Managing Director / CEO]',
      },
    ],
  },
  {
    outputPath:
      'docs/compliance-templates/policies/POL-008-Equal-Opportunities-Diversity-Policy.docx',
    docNumber: 'POL-008',
    title: 'Equal Opportunities & Diversity Policy',
    version: '1.0',
    owner: '[HR Director]',
    approvedBy: '[Managing Director]',
    isoRef: 'Equality Act 2010 / HR Best Practice',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This Equal Opportunities & Diversity Policy sets out the commitment of [COMPANY NAME] to promoting equality of opportunity and valuing diversity. It ensures that no employee, job applicant, customer, or other stakeholder receives less favourable treatment on the grounds of any protected characteristic.',
      },
      {
        heading: '2. Scope',
        content:
          'This policy applies to all aspects of employment including recruitment, selection, training, development, promotion, pay, benefits, disciplinary and grievance procedures, redundancy, and termination. It also covers the treatment of customers, suppliers, and visitors.',
      },
      {
        heading: '3. Policy Statement',
        content:
          '[COMPANY NAME] is committed to:\n\na) Providing a working environment free from discrimination, harassment, victimisation, and bullying.\n\nb) Ensuring equality of opportunity in all employment practices, based on merit, qualifications, and abilities.\n\nc) Valuing the diversity of our workforce and harnessing the different perspectives, skills, and experiences of all employees.\n\nd) Complying with the Equality Act 2010 and all applicable equality legislation.\n\ne) Making reasonable adjustments for employees and applicants with disabilities.\n\nf) Regularly reviewing employment practices to ensure fairness and taking positive action where appropriate.\n\nThe protected characteristics under the Equality Act 2010 are: age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, and sexual orientation.',
      },
      {
        heading: '4. Recruitment & Selection',
        content:
          'All recruitment and selection processes shall:\n\n• Use objective, job-related criteria\n• Be free from bias in advertising, shortlisting, and interviewing\n• Include diverse interview panels where practicable\n• Make reasonable adjustments for disabled applicants\n• Retain records to demonstrate fair and transparent decision-making',
      },
      {
        heading: '5. Complaints & Grievances',
        content:
          'Any employee who believes they have been subject to discrimination, harassment, or victimisation should raise the matter through:\n\n• Their line manager (if appropriate)\n• The HR Department\n• The formal Grievance Procedure\n\nAll complaints will be taken seriously, investigated promptly and confidentially, and resolved fairly. Victimisation of anyone making a complaint in good faith is prohibited.',
      },
      {
        heading: '6. Monitoring',
        content:
          '[COMPANY NAME] monitors workforce diversity data including recruitment, promotion, training, and leavers to identify trends and address any disparities. This data is reviewed by the HR Director and reported to the Board annually.',
      },
      {
        heading: '7. Approval',
        content:
          'Signature: ________________________    Date: [DD/MM/YYYY]\nName: [Managing Director Name]\nTitle: [Managing Director / CEO]',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/policies/POL-009-Energy-Policy.docx',
    docNumber: 'POL-009',
    title: 'Energy Policy',
    version: '1.0',
    owner: '[Energy Manager]',
    approvedBy: '[Managing Director]',
    isoRef: 'ISO 50001:2018 Clause 5.2',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This Energy Policy establishes the commitment of [COMPANY NAME] to improving energy performance through the Energy Management System (EnMS) aligned to ISO 50001:2018, operated through the Nexara Integrated Management System.',
      },
      {
        heading: '2. Scope',
        content:
          'This policy applies to all activities, equipment, systems, and processes that affect energy performance across all [COMPANY NAME] facilities and operations, including offices, manufacturing sites, warehouses, and transport.',
      },
      {
        heading: '3. Policy Statement',
        content:
          '[COMPANY NAME] is committed to:\n\na) Continually improving energy performance, including energy efficiency, energy use, and energy consumption.\n\nb) Ensuring the availability of information and resources necessary to achieve energy objectives and energy targets.\n\nc) Complying with applicable legal and other requirements relating to energy use, energy consumption, and energy efficiency.\n\nd) Supporting the procurement of energy-efficient products and services, and designing for energy performance improvement.\n\ne) Setting and reviewing energy objectives and energy targets at relevant functions and levels.\n\nf) Establishing energy performance indicators (EnPIs) and energy baselines appropriate to the organisation.\n\ng) Considering energy performance improvement in long-term planning, facility design, equipment procurement, and operational changes.\n\nh) Communicating this policy to all persons working under the control of the organisation.',
      },
      {
        heading: '4. Energy Objectives',
        content:
          'Current energy objectives include:\n\n• Reduce energy consumption by [X]% against the [year] baseline by [target year]\n• Improve Energy Performance Indicator (EnPI) for [process/facility] by [X]%\n• Complete energy audits of all significant energy uses annually\n• Achieve [X]% renewable energy procurement by [year]\n\nObjectives are tracked through the Nexara IMS Energy module.',
      },
      {
        heading: '5. Significant Energy Uses',
        content:
          'The following significant energy uses (SEUs) have been identified and are prioritised for improvement:\n\n• [HVAC systems]\n• [Production machinery / compressed air]\n• [Lighting]\n• [Transport / fleet]\n• [IT infrastructure / data centres]\n\nSEUs are monitored through sub-metering and tracked in the Nexara IMS Energy module.',
      },
      {
        heading: '6. Related Documents',
        bullets: [
          'PLN-005: Energy Management Action Plan',
          'REG-002: Objectives & Targets Register',
          'Energy Baseline Documentation (Nexara IMS)',
        ],
      },
      {
        heading: '7. Approval',
        content:
          'Signature: ________________________    Date: [DD/MM/YYYY]\nName: [Managing Director Name]\nTitle: [Managing Director / CEO]',
      },
    ],
  },
  {
    outputPath: 'docs/compliance-templates/policies/POL-010-ESG-Sustainability-Policy.docx',
    docNumber: 'POL-010',
    title: 'ESG & Sustainability Policy',
    version: '1.0',
    owner: '[Sustainability Director]',
    approvedBy: '[Board of Directors]',
    isoRef: 'CSRD / ESG Reporting Frameworks',
    sections: [
      {
        heading: '1. Purpose',
        content:
          'This ESG & Sustainability Policy establishes the commitment of [COMPANY NAME] to environmental stewardship, social responsibility, and good governance. It aligns with the Corporate Sustainability Reporting Directive (CSRD), the European Sustainability Reporting Standards (ESRS), and other applicable ESG frameworks.',
      },
      {
        heading: '2. Scope',
        content:
          'This policy covers all operations, subsidiaries, and value chain activities of [COMPANY NAME]. It addresses the three pillars of ESG: Environmental, Social, and Governance.',
      },
      {
        heading: '3. Environmental Commitments',
        content:
          '[COMPANY NAME] commits to:\n\n• Achieving net zero Scope 1 and 2 emissions by [year], with a [X]% reduction by [interim year]\n• Measuring and reporting Scope 3 emissions across the value chain\n• Reducing waste to landfill by [X]% by [year] and achieving [X]% recycling rate\n• Reducing water consumption by [X]% per unit of output by [year]\n• Protecting and enhancing biodiversity at our operational sites\n• Conducting lifecycle assessments for key products and services\n• Reporting environmental performance annually in line with CSRD requirements',
      },
      {
        heading: '4. Social Commitments',
        content:
          '[COMPANY NAME] commits to:\n\n• Providing safe and healthy working conditions (see POL-003)\n• Promoting diversity, equity, and inclusion across the workforce (see POL-008)\n• Respecting human rights throughout our operations and supply chain\n• Investing in employee training and development ([X] hours per employee per year)\n• Supporting local communities through [volunteering/charity/social investment]\n• Ensuring fair labour practices in our supply chain\n• Maintaining a modern slavery statement and conducting supply chain due diligence',
      },
      {
        heading: '5. Governance Commitments',
        content:
          '[COMPANY NAME] commits to:\n\n• Maintaining robust anti-bribery and corruption controls (see POL-005)\n• Ensuring Board oversight of ESG strategy and performance\n• Publishing transparent ESG disclosures in line with CSRD/ESRS\n• Conducting double materiality assessments to identify and prioritise ESG topics\n• Maintaining effective whistleblowing and grievance mechanisms\n• Ensuring data protection and privacy compliance (see POL-007)\n• Aligning executive remuneration with ESG performance where appropriate',
      },
      {
        heading: '6. Reporting & Disclosure',
        content:
          '[COMPANY NAME] will publish an annual ESG report covering:\n\n• Scope 1, 2, and 3 greenhouse gas emissions\n• Energy consumption and renewable energy share\n• Waste generation and diversion rates\n• Water usage and discharge\n• Workforce diversity metrics\n• Health and safety statistics (LTIR, TRIR)\n• Training hours and investment\n• Community engagement activities\n• Governance structure and board composition\n• Anti-bribery compliance metrics\n\nReporting is managed through the Nexara IMS ESG Reporting module and RPT-003 ESG Annual Report Template.',
      },
      {
        heading: '7. Double Materiality Assessment',
        content:
          "A double materiality assessment shall be conducted [annually / biennially] to identify:\n\n• Impact materiality: How [COMPANY NAME]'s activities impact the environment and society\n• Financial materiality: How ESG factors create financial risks and opportunities\n\nThe assessment informs reporting priorities and strategic ESG decisions.",
      },
      {
        heading: '8. Related Documents',
        bullets: [
          'POL-002: Environmental Policy',
          'POL-003: Health & Safety Policy',
          'POL-005: Anti-Bribery & Corruption Policy',
          'RPT-003: ESG Annual Report Template',
          'Double Materiality Assessment (Nexara IMS)',
        ],
      },
      {
        heading: '9. Approval',
        content:
          'Approved by the Board of Directors: [DD/MM/YYYY]\n\nSignature: ________________________\nName: [Chair of the Board]\nTitle: [Chair]',
      },
    ],
  },
];

// Generate all policies
for (const pol of policies) {
  const tmpFile = `/tmp/policy-${pol.docNumber}.json`;
  fs.writeFileSync(tmpFile, JSON.stringify(pol, null, 2));
  try {
    execSync(`node /home/dyl/New-BMS/scripts/create-docx.mjs ${tmpFile}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to create ${pol.docNumber}: ${err.message}`);
  }
  fs.unlinkSync(tmpFile);
}

console.log(`\nAll ${policies.length} policies created.`);
