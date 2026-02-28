import type { KBArticle } from '../types';

export const complianceGuideArticles: KBArticle[] = [
  {
    id: 'KB-CG-001',
    title: 'ISO 9001:2015 Quality Management System — IMS Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['iso-9001', 'quality', 'compliance', 'certification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 9001:2015 Quality Management System — IMS Compliance Guide

## Clause-by-Clause Mapping

**Clause 4 — Context of the Organisation:** Use the Organisation Profile to document internal and external issues. The Stakeholder Management module supports identification of interested parties and their requirements. Scope documentation is maintained in Document Control.

**Clause 5 — Leadership:** The Management Review module captures top management commitment and review outputs. Quality policy is authored and approved in Document Control. Role responsibilities are assigned through the HR competency framework.

**Clause 6 — Planning:** The Risk Management module supports quality risk assessment and opportunity identification. Quality objectives are set and tracked in the KPI Dashboard with measurable targets and timelines. Change management planning uses the dedicated Change Management module.

**Clause 7 — Support:** Competency and training records are maintained in HR and the Training Tracker. Document Control manages all documented information. Infrastructure and work environment requirements can be tracked via the CMMS Asset module.

**Clause 8 — Operation:** The Quality NCR module manages nonconforming outputs. CAPA tracks corrective actions to closure. Customer satisfaction data is captured through survey integrations. Supplier quality is managed via Supplier Evaluation.

**Clause 9 — Performance Evaluation:** Internal Audit schedules, conducts, and records audit findings. KPI Dashboard displays quality metrics and trends. Management Review captures inputs and outputs to demonstrate performance evaluation.

**Clause 10 — Improvement:** CAPA module drives continual improvement. Management review outputs generate improvement actions tracked to completion.

## Required Records Checklist

- Scope of the QMS (4.3)
- Quality policy (5.2)
- Quality objectives (6.2)
- Risk and opportunity register (6.1)
- Competency records (7.2)
- Documented information controls (7.5)
- Operational planning records (8.1)
- Nonconformance and CAPA records (8.7, 10.2)
- Internal audit programme and reports (9.2)
- Management review records (9.3)

## Common Gaps IMS Addresses

Many organisations struggle with linking objectives to processes and demonstrating measurement. IMS automatically associates KPIs with processes and tracks objective status over time, providing audit-ready evidence of the performance evaluation cycle.`,
  },
  {
    id: 'KB-CG-002',
    title: 'ISO 14001:2015 Environmental Management System — IMS Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['iso-14001', 'environment', 'compliance', 'certification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 14001:2015 Environmental Management System — IMS Compliance Guide

## Clause-by-Clause Mapping

**Clause 4 — Context:** The Environmental module's aspects and impacts register captures the context of environmental interactions. The legal register records applicable environmental legislation and other requirements.

**Clause 5 — Leadership:** Environmental policy is authored and approved in Document Control. Top management commitment is demonstrated through management review records captured in the Management Review module.

**Clause 6 — Planning:** Environmental aspects are assessed for significance using IMS's built-in scoring algorithm (severity x 1.5 + probability x 1.5 + duration + extent + reversibility + regulatory + stakeholder; score >= 15 = significant). Legal requirements are managed in the legal register with review dates and compliance status. Environmental objectives and action plans are tracked with targets and progress indicators.

**Clause 7 — Support:** Competency requirements and training records link to environmental roles. Document Control manages procedures, work instructions, and operational controls. Communication records capture internal and external environmental communications.

**Clause 8 — Operation:** Operational controls are documented as procedures for significant aspects. Emergency preparedness plans are maintained in Document Control and tested via drill records.

**Clause 9 — Performance Evaluation:** Environmental monitoring data is recorded against permit conditions and objectives. Internal audit programme covers environmental processes. Management review includes environmental performance trends, legal compliance status, and objective progress.

**Clause 10 — Improvement:** CAPA manages environmental nonconformances and incidents. Continual improvement actions are tracked through management review outputs.

## Key Records for Certification

- Environmental policy, aspects register, significance determinations
- Legal register with compliance evaluations
- Environmental objectives and action plans
- Monitoring and measurement records
- CAPA records, audit reports, management review records

## Integration Points

The Environmental module integrates with ESG for sustainability reporting and with the Energy module for energy-related environmental aspects under dual ISO 14001/ISO 50001 implementations.`,
  },
  {
    id: 'KB-CG-003',
    title: 'ISO 45001:2018 OH&S Management System — IMS Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['iso-45001', 'health-safety', 'compliance', 'certification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 45001:2018 OH&S Management System — IMS Compliance Guide

## Clause-by-Clause Mapping

**Clause 4 — Context:** The Organisation Profile captures internal and external issues relevant to OHS. The legal requirements register records applicable legislation. Worker needs and interested party expectations are documented in Stakeholder Management.

**Clause 5 — Leadership:** OHS policy is maintained in Document Control. Clause 5.4 (participation and consultation) is supported by the H&S module's consultation records, toolbox talk logs, and workforce communication features. Management commitment is demonstrated through review participation records.

**Clause 6 — Planning:** Hazard identification and risk assessment are conducted and recorded in the H&S module using configurable risk matrices. Legal requirements are managed in the legal register. OHS objectives are tracked in the KPI Dashboard with SMART targets.

**Clause 7 — Support:** Competency requirements and records are maintained in HR and the Training Tracker. OHS communication records capture internal and external communications. Document Control manages all documented information.

**Clause 8 — Operation:** Operational planning controls are documented as procedures for significant hazards. The Permit to Work (PTW) module supports control of high-risk activities. Incident reporting and investigation is managed in the Incident module. Emergency preparedness plans are documented, exercised, and drill records maintained.

**Clause 9 — Performance Evaluation:** LTIFR, TRIFR, and other lagging and leading indicators are tracked on the KPI Dashboard. Internal audit covers OHS processes across the organisation. Management review includes OHS performance analysis, incident trends, and objective progress.

**Clause 10 — Improvement:** Incidents and nonconformances trigger CAPA records. Root cause analysis is documented and corrective action effectiveness is verified.

## Required Documented Information

- OHS policy, hazard register, risk assessments
- Legal requirements register, OHS objectives
- Competency and training records, emergency plans
- PTW records, incident investigation reports
- Internal audit reports, management review minutes

## Worker Participation (Clause 5.4)

IMS supports worker participation through toolbox talk records, near-miss reporting access for all staff, and consultation records on risk assessments and procedures.`,
  },
  {
    id: 'KB-CG-004',
    title: 'ISO 27001:2022 Information Security — IMS Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['iso-27001', 'infosec', 'compliance', 'certification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 27001:2022 Information Security — IMS Compliance Guide

## Clauses 4-10 Mapping

**Clause 4:** InfoSec scope, interested parties, and information security context are documented in the InfoSec module's organisational context section.

**Clause 5:** Information security policy is maintained in Document Control. Roles and responsibilities are defined in the HR module. The InfoSec module manages the ISMS roles (CISO, DPO, asset owners).

**Clause 6:** Risk assessment using threat-vulnerability-asset methodology is conducted in the InfoSec Risk Assessment register. Treatment plans are tracked as action items. Information security objectives are tracked in the KPI Dashboard.

**Clause 7-10:** Competency, awareness training, communication, document control, operational controls, audit, management review, and improvement follow the same IMS pattern as other ISO standards.

## Annex A Control Categories (ISO 27001:2022)

- **Organisational Controls (5.1-5.37):** Policies, roles, threat intelligence, asset management, access control, supplier relationships, incident management, business continuity, and compliance requirements.
- **People Controls (6.1-6.8):** Screening, terms of employment, awareness, training, disciplinary process, offboarding, remote working, confidentiality.
- **Physical Controls (7.1-7.14):** Physical security perimeters, entry controls, securing offices, monitoring, protecting against physical threats, clear desk/screen, equipment siting, maintenance, disposal.
- **Technological Controls (8.1-8.34):** User endpoints, privileged access, access restriction, authentication, cryptography, secure development, vulnerability management, logging, filtering, backup, redundancy, monitoring.

## Statement of Applicability (SoA)

The SoA is created in the InfoSec module under ISMS Documentation → Statement of Applicability. Each Annex A control is listed with applicability (yes/no), justification for inclusion or exclusion, and implementation status.

## Required Documented Information

38 mandatory documents and records include: scope, policy, risk assessment methodology, risk treatment plan, SoA, competency records, operational planning results, monitoring results, internal audit programme and reports, management review records, corrective action records.

## Certification Timeline

Typical certification journey: gap assessment (1-2 months), implementation (3-6 months), internal audit (1 month), Stage 1 audit (readiness review), Stage 2 audit (implementation verification), certification issued. Surveillance audits annually; recertification every 3 years.`,
  },
  {
    id: 'KB-CG-005',
    title: 'ISO 50001:2018 Energy Management System — IMS Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['iso-50001', 'energy', 'compliance', 'certification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 50001:2018 Energy Management System — IMS Compliance Guide

## Clause-by-Clause Mapping

**Clause 4 — Context:** Energy policy scope and boundaries are defined in the Energy module. The organisational context for energy use (facilities, operations, processes) is documented.

**Clause 5 — Leadership:** Top management commitment is demonstrated through energy policy approval, resource allocation for EnMS, and participation in management review. Energy policy is maintained in Document Control with communication records.

**Clause 6 — Planning (Energy Review):** The energy review is the cornerstone of ISO 50001 planning. In IMS Energy module: conduct an energy review identifying energy sources, uses, and consumption patterns; determine Significant Energy Uses (SEUs); identify improvement opportunities. Energy baseline is established from historical consumption data loaded into the Energy module. Energy Performance Indicators (EnPIs) quantify energy performance and track improvement. Energy objectives and energy action plans include targets, timelines, resources, and responsibilities.

**Clause 7 — Support:** Competency requirements for energy management roles are documented. Awareness training covers energy performance and employee contribution. Document Control manages EnMS documentation. Procurement criteria include energy performance requirements for equipment and facilities.

**Clause 8 — Operation:** Operational controls are established for SEUs to maintain and improve energy performance. Design activities consider energy performance improvement opportunities. Procurement processes require energy performance data for significant energy-consuming equipment.

**Clause 9 — Performance Evaluation:** EnPI monitoring tracks performance against baseline. Significant deviation analysis triggers investigation and corrective action. Internal audit covers EnMS implementation and energy performance trends. Management review includes EnPI results, objective progress, energy review update, and corrective action status.

**Clause 10 — Improvement:** Nonconformances are recorded and corrective actions tracked. Continual improvement opportunities identified through the energy review are managed as action items.

## Required Documented Information

- Energy policy, scope and boundaries
- Energy review methodology and results
- Energy baseline and EnPIs
- Energy objectives and action plans
- Operational control records, competency records
- Monitoring and measurement results
- Internal audit reports, management review records

## EnPI and Baseline Methodology

In IMS, EnPIs are configured in Energy → Performance Indicators. The baseline period is typically 12 months of stable operational data. Baseline normalisation for production volume or weather (heating/cooling degree days) is supported.`,
  },
  {
    id: 'KB-CG-006',
    title: 'ISO 22000:2018 Food Safety Management — IMS Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['iso-22000', 'food-safety', 'compliance', 'certification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 22000:2018 Food Safety Management — IMS Compliance Guide

## Clause-by-Clause Mapping

**Clause 4 — Context:** Interested parties and their requirements are documented in Stakeholder Management. The FSMS scope defines products, processes, and production sites covered.

**Clause 5 — Leadership:** The food safety policy is approved by top management and maintained in Document Control. The food safety team leader and team members are defined with competency requirements in HR. Management commitment is demonstrated through resource allocation and management review participation.

**Clause 6 — Planning:** Food safety risks and opportunities are assessed using the Food Safety module's risk assessment function. Food safety objectives are measurable and tracked in the KPI Dashboard.

**Clause 7 — Support:** Competency and training records cover food safety knowledge requirements including HACCP principles and food hygiene. Communication records capture supplier, customer, and regulatory communications. Document Control manages all FSMS documented information with version control and distribution records.

**Clause 8 — Operation:** Prerequisite programmes (PRPs) are documented and monitored. Traceability records cover ingredients to finished product and one-step-back, one-step-forward requirements. Emergency preparedness covers potential food safety incidents. Hazard analysis identifies, assesses, and controls food safety hazards. The HACCP plan documents CCPs, critical limits, monitoring, corrective actions, verification, and records.

**Clause 9 — Performance Evaluation:** Monitoring records demonstrate CCP control. Internal audit covers the full FSMS. Management review includes food safety performance, HACCP plan effectiveness, and external context changes.

**Clause 10 — Improvement:** Nonconformances, potential unsafe products, withdrawals, and recalls are managed through the NCR and CAPA modules.

## FSSC 22000 Additional Requirements

FSSC 22000 (the GFSI-benchmarked scheme built on ISO 22000) adds requirements for: food fraud vulnerability assessment (VACCP), food defence threat assessment (TACCP), allergen management, environmental monitoring programme, product development procedures, and labelling management.

## Required Records

- PRP monitoring records, hazard analysis, HACCP plan
- CCP monitoring charts, corrective action records
- Traceability records, calibration records
- Internal audit reports, management review records, training records`,
  },
  {
    id: 'KB-CG-007',
    title: 'ISO 42001:2023 AI Management System — IMS Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['iso-42001', 'ai-management', 'compliance', 'certification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 42001:2023 AI Management System — IMS Compliance Guide

## What Makes ISO 42001 Unique

ISO 42001 is the world's first international standard for AI management systems, published in December 2023. Unlike domain-specific AI regulations, it provides a management system framework applicable to any organisation developing, deploying, or using AI systems — including AI providers, deployers, and affected parties.

## Clause-by-Clause Mapping

**Clause 4 — Context:** The AI system inventory documents all AI systems in scope, their intended uses, and potential impacts. Organisational context considers AI-related stakeholder expectations and requirements. The ISO 42001 module captures the AI policy scope and system inventory.

**Clause 5 — Leadership:** The AI policy establishes the organisation's approach to responsible AI. Leadership commitment includes defining AI roles (AI Ethics Officer, system owners), setting objectives, and participating in management review. Resources for the AIMS are allocated and documented.

**Clause 6 — Planning:** AI risks and opportunities are assessed considering potential harms, biases, and misuse scenarios. AI objectives include performance, fairness, transparency, and accountability metrics tracked in the KPI Dashboard.

**Clause 7 — Support:** Competency in AI development, deployment, ethics, and governance is documented. Awareness training covers AI principles and responsible use. Documentation covers AI system descriptions, model cards, and data governance records.

**Clause 8 — Operation:** AI system lifecycle controls cover design, development, testing, deployment, monitoring, and decommissioning. AI impact assessments evaluate potential societal, ethical, and rights impacts. AI use policies govern acceptable use for each deployed system. Supply chain considerations cover AI components from third-party providers.

**Clause 9 — Performance Evaluation:** AI system performance (accuracy, fairness, drift) is monitored. Internal audit covers AIMS implementation. Management review includes AI performance data, incident trends, and policy effectiveness.

**Clause 10 — Improvement:** Nonconformities related to AI harm events, bias incidents, or system failures trigger corrective actions tracked in CAPA.

## Annex A Controls Summary

Annex A includes controls across: AI policies, internal organisation, resources for AI systems, impact assessment, AI system lifecycle, data management, supply chain, and documentation.

## EU AI Act Alignment

ISO 42001 implementation supports EU AI Act compliance. The Act's risk-based approach (minimal risk, limited risk, high risk, unacceptable risk) aligns with the AIMS risk assessment. Conformity assessment requirements for high-risk AI systems are supported by the system documentation and impact assessment records maintained in IMS.`,
  },
  {
    id: 'KB-CG-008',
    title: 'ISO 37001:2016 Anti-Bribery Management System — IMS Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['iso-37001', 'anti-bribery', 'compliance', 'certification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 37001:2016 Anti-Bribery Management System — IMS Compliance Guide

## Clause-by-Clause Mapping

**Clause 4 — Context:** The bribery risk assessment evaluates the organisation's exposure based on sector, geography, business model, and transaction types. The legal and regulatory context documents applicable anti-bribery laws (UK Bribery Act, US FCPA, local legislation) in the legal register.

**Clause 5 — Leadership:** Top management commitment is demonstrated through anti-bribery policy approval, designation of the ABMS function, and oversight by the governing body. The ABMS function (equivalent to a compliance officer) is appointed with appropriate independence, authority, and resources. Governing body oversight records are maintained in the Management Review module.

**Clause 6 — Planning:** Bribery risk assessment is the foundation of ABMS planning. The risk assessment considers: categories of bribery exposure, business relationships, transaction types, geographic risk, and sector risk. Actions to address risks and opportunities are tracked as improvement actions.

**Clause 7 — Support:** Anti-bribery competency requirements are defined. Awareness training covers the anti-bribery policy, relevant laws, and how to raise concerns. Communication includes the anti-bribery commitment to all staff, business associates, and the public.

**Clause 8 — Operation:** Due diligence on business associates (agents, JV partners, contractors) is conducted using defined procedures and recorded. Financial controls prevent off-the-books transactions. Gifts, hospitality, donations, and sponsorships policies are documented with approval registers. The speak-up channel provides confidential reporting with non-retaliation protections. Investigation procedures ensure independent and confidential case handling.

**Clause 9 — Performance Evaluation:** Monitoring and measurement covers ABMS implementation effectiveness. Internal audit reviews ABMS controls. Management review includes bribery risk assessment results, speak-up statistics, due diligence status, and audit findings.

**Clause 10 — Improvement:** Nonconformities and confirmed bribery incidents trigger corrective actions. The proportionate approach principle means controls are scaled to the organisation's actual bribery risk.

## Role of the ABMS Function

The ABMS function has a dual reporting line — to top management on operational matters and to the governing body to preserve independence. This independence is critical for credibility when investigating allegations.`,
  },
  {
    id: 'KB-CG-009',
    title: 'Integrated Management System (IMS) — Multi-Standard Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['ims', 'integrated', 'iso-9001', 'iso-14001', 'iso-45001', 'multi-standard'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Integrated Management System (IMS) — Multi-Standard Compliance Guide

## Benefits of Integration

Running separate management systems for quality, environment, and health and safety creates duplication of effort, conflicting objectives, and audit fatigue. An integrated approach delivers: reduced documentation overhead, aligned objectives and performance reviews, combined internal audit programme, unified risk management, single management review, and a consistent culture of improvement.

## High Level Structure (Annex SL)

ISO management standards share a common High Level Structure with identical clause numbering (4-10): context, leadership, planning, support, operation, performance evaluation, and improvement. This means IMS can serve multiple standards simultaneously using the same modules for the common elements, with standard-specific extensions for unique requirements.

## How IMS Handles Multi-Standard Requirements

**Single integrated policy:** One policy document can address quality, environmental, and OHS commitments. IMS Document Control supports multi-standard policy documents with clear cross-references.

**Integrated management review:** A single annual (or more frequent) management review can address all standards simultaneously. The Management Review module supports configurable inputs and outputs per standard.

**Combined audit programme:** The Audit Management module supports combined audits — a single audit team assessing multiple standards simultaneously reduces organisation disruption.

**Unified risk register:** A single risk register can capture quality, environmental, OHS, information security, and other risks with standard-specific categorisation fields.

## Cross-Standard Gap Analysis

When adding a new standard to an existing IMS, perform a gap analysis comparing the new standard's unique requirements against existing system elements. Common elements (context, leadership, objectives, audit, review, improvement) are typically already in place; the gap focuses on standard-specific clauses.

## Certification Sequence

Typical multi-standard certification journey: ISO 9001 first (establishes management system culture), then ISO 14001, then ISO 45001. Certification bodies can conduct combined or joint audits across all three standards, reducing audit days by 20-30% compared to separate audits.

## Records Serving Multiple Standards

A single training record can demonstrate Clause 7.2 competency compliance for ISO 9001, 14001, 45001, and 27001 simultaneously. IMS tags records with applicable standards to generate standard-specific evidence packs efficiently.`,
  },
  {
    id: 'KB-CG-010',
    title: 'GDPR & Data Protection Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['gdpr', 'data-protection', 'privacy', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# GDPR & Data Protection Compliance Guide

## GDPR Principles Applied to IMS

IMS processes personal data about your employees, contractors, and system users. Data protection compliance requires understanding what data is processed, on what legal basis, for what purpose, and for how long.

**Lawful basis for employee data:** Employment contract (Article 6(1)(b)) covers data necessary for the employment relationship. Legal obligation (Article 6(1)(c)) covers statutory records such as training, health surveillance, and RIDDOR reports. Legitimate interests (Article 6(1)(f)) covers security audit logs and system access records.

## Data Subject Rights in IMS

**Right of access (SAR):** Navigate to Admin Console → Privacy → Data Subject Reports to generate a full export of a user's personal data held in IMS. This covers profile data, activity records, and audit logs.

**Right to erasure:** IMS supports anonymisation of user data — personal identifiers are replaced with anonymised references while business records (incidents, audits, NCRs) are retained for legal and operational purposes.

**Right to rectification:** Edit user profile data directly in Settings → Users. Correct specific record fields via module data entry screens.

**Right to data portability:** User data exports are provided in JSON format via the Admin Console privacy tools.

## Data Retention Policies

Configure retention periods per data type in Settings → Data Retention. IMS applies automatic data minimisation after the configured retention period. Legal holds can pause automatic deletion for specific records.

## Privacy by Design

IMS implements privacy by design through: role-based access controls limiting data access to need-to-know, comprehensive audit trails for data access and changes, field-level encryption for sensitive data categories, and data minimisation in data collection forms.

## Data Processing Register

Document IMS as a data processor in your Records of Processing Activities (RoPA). IMS processes personal data on behalf of the controller (your organisation) under the terms of the Data Processing Agreement (DPA) with Anthropic IMS.

## Data Breach Response

Record data breaches in the Incident Management module. IMS supports the 72-hour regulatory notification timeline by tracking breach discovery date and notification actions. Use the document template library for GDPR breach notification letters.`,
  },
  {
    id: 'KB-CG-011',
    title: 'UK Health & Safety Law Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['health-safety', 'uk', 'legal', 'compliance', 'regulatory'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# UK Health & Safety Law Compliance Guide

## Key UK H&S Legislation

**Health and Safety at Work Act 1974 (HSWA):** The primary legislation establishing duties for employers, employees, and self-employed. IMS H&S module provides the framework for managing these duties through policy, risk assessment, and competency records.

**Management of Health and Safety at Work Regulations 1999:** Requires suitable and sufficient risk assessments (Reg. 3), competent H&S assistance (Reg. 7), emergency procedures (Reg. 8), and information for employees (Reg. 10). IMS risk assessment and training modules directly support these requirements.

**RIDDOR 2013 (Reporting of Injuries, Diseases and Dangerous Occurrences Regulations):** IMS is configured to flag reportable incidents based on RIDDOR criteria: over-7-day injuries, specified injuries (fractures, amputations, loss of sight, crush injuries, burns, and others), work-related deaths, occupational diseases, and dangerous occurrences. Navigate to H&S → Incidents → RIDDOR Report to generate the required notification.

**COSHH 2002 (Control of Substances Hazardous to Health):** Hazardous substance assessments are managed in the Chemical Register module. IMS links SDS documents to COSHH assessments and tracks health surveillance requirements.

**Work at Height Regulations 2005:** Risk assessments for work at height are recorded in the H&S module. Inspection records for access equipment are maintained in CMMS.

**LOLER 1998 (Lifting Operations and Lifting Equipment):** Statutory examination records for lifting equipment are maintained in the CMMS Asset module with due-date tracking.

**CDM 2015:** See the separate CDM Compliance Guide (KB-CG-016).

## Legal Requirements Register

Add each applicable regulation to the Legal Register in H&S → Legal Requirements. Configure review dates (annually for most legislation), record compliance status, and link supporting evidence documents.

## HSE Enforcement

If your organisation receives an Improvement Notice or Prohibition Notice from HSE, record it in H&S → Legal Register → Enforcement Actions. Track the required actions to closure and retain correspondence in Document Control.

## RIDDOR Reporting Timeline

Fatal and specified injuries: notify HSE immediately by telephone, then online within 10 days. Over-7-day injuries: online report within 15 days. IMS tracks RIDDOR status on each incident record.`,
  },
  {
    id: 'KB-CG-012',
    title: 'Environmental Regulatory Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['environment', 'regulatory', 'compliance', 'esg'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Environmental Regulatory Compliance Guide

## Key Environmental Legislation Categories

**Emissions to Air:** Environmental Permitting Regulations (England & Wales), Clean Air Act (UK), EU Emissions Trading System (ETS), and US Clean Air Act. Permit conditions specify emission limits for each point source. IMS Environmental module tracks monitoring data against permit conditions with exceedance alerts.

**Water Discharge:** Environmental Permitting (discharge consents), EU Water Framework Directive, US Clean Water Act. Trade effluent consents include monitoring frequency and parameter limits tracked in IMS.

**Waste Management:** EU Waste Framework Directive, UK Environmental Permitting, US RCRA. IMS tracks waste types, quantities, disposal routes, and carrier licence validity. Waste transfer notes are managed in Document Control.

**Contaminated Land:** Identify and manage contaminated land liabilities through the Environmental module's site register. Link to investigation and remediation records.

**Environmental Impact Assessment (EIA):** Major development projects may require EIA. Link EIA commitments (environmental conditions) to the monitoring and management records in IMS.

## Permit Compliance Monitoring

For each environmental permit: configure monitoring parameters and frequencies in Environmental → Monitoring. Set alert thresholds at 80% of permit limit (amber) and 95% (red) to allow corrective action before exceedance. Auto-generate monthly permit compliance summary reports.

## Environmental Reporting Obligations

- Annual environmental reports (permit condition)
- UK Greenhouse Gas (GHG) emissions inventory (April each year for previous calendar year)
- UK SECR (Streamlined Energy and Carbon Reporting) — included in annual company report
- EU CSRD / ESRS environmental sustainability disclosures
- ETS annual surrender (April 30 each year)

## EU CSRD and ESRS

The Corporate Sustainability Reporting Directive applies to large EU companies and EU-listed companies from 2024-2026. Environmental reporting under ESRS E1-E5 covers climate, pollution, water, biodiversity, and resource use. IMS ESG module maps data to ESRS disclosure requirements.

## Environmental Incident Regulatory Notification

Significant environmental incidents may require immediate notification to the Environment Agency (UK), EPA (US), or relevant authority. IMS Incident Management includes a regulatory notification tracker with statutory timelines. Generate evidence packs from IMS for regulatory investigations.`,
  },
  {
    id: 'KB-CG-013',
    title: 'REACH & Chemical Regulatory Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['reach', 'chemicals', 'regulatory', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# REACH & Chemical Regulatory Compliance Guide

## REACH (EU Regulation 1907/2006)

REACH applies to substances manufactured in or imported into the EU/EEA above 1 tonne per year. Key requirements:

**Registration:** Manufacturers and importers register substances with ECHA. IMS Chemical Register stores registration numbers for each substance received.

**Evaluation:** ECHA evaluates registration dossiers and substance safety. IMS tracks regulatory correspondence and evaluation outcomes.

**Authorisation:** Substances of Very High Concern (SVHCs) on the Authorisation List require authorisation before use. IMS flags SVHC substances in the chemical inventory and tracks authorisation expiry dates.

**Restriction:** Certain substances are restricted or banned. IMS SVHC screening alerts when a substance is added to the Candidate List.

**Downstream User Obligations:** As a downstream user, you must communicate chemical safety information down the supply chain and follow Exposure Scenarios in extended SDS (eSDS). IMS tracks eSDS review completion.

## CLP Regulation (EU Regulation 1272/2008)

CLP implements GHS in the EU. IMS Chemical Register stores CLP classification (hazard class, category, H-statements, P-statements), label elements, and SDS data. Hazard pictograms are displayed on the chemical record.

## OSHA HazCom (US)

US HazCom 2012 (29 CFR 1910.1200) aligns with GHS. IMS supports dual REACH/CLP and OSHA HazCom records for multinational organisations. SDS format requirements (16-section SDS) are standardised in both regimes.

## WHMIS (Canada)

Workplace Hazardous Materials Information System aligns with GHS. Canadian SDS requirements include bilingual labelling. IMS stores WHMIS classification alongside REACH/CLP data.

## RoHS / WEEE

Restriction of Hazardous Substances in electrical and electronic equipment. IMS tracks RoHS compliance status for materials and components.

## Chemical Inventory Reporting

Annual threshold reporting requirements vary by jurisdiction (e.g., US Tier II / Superfund Section 312 reporting for hazardous chemicals above thresholds). IMS generates chemical inventory reports with quantity totals by substance and location to support regulatory submissions.

## IMS as System of Record

The IMS Chemical Register is the single source of truth for regulatory submissions. Maintain SDS currency (review within 3 years of issue or when significant new information arises) and track supplier declarations of SVHC content.`,
  },
  {
    id: 'KB-CG-014',
    title: 'Food Safety Regulatory Compliance Guide (UK/EU/US)',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['food-safety', 'regulatory', 'compliance', 'haccp'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Food Safety Regulatory Compliance Guide (UK/EU/US)

## EU Food Safety Regulations

**Regulation 178/2002 (General Food Law):** Establishes traceability (one step back, one step forward), food incident notification, and the rapid alert system (RASFF). IMS Food Safety module supports traceability records and incident notifications.

**Regulation 852/2004 (Food Hygiene):** Requires food business operators to implement and maintain HACCP-based procedures. IMS HACCP plan module provides the complete documentation framework.

**Regulation 2073/2009 (Microbiological Criteria):** Sets criteria for pathogens and hygiene indicators in foodstuffs. IMS records microbiological monitoring results against these criteria.

## UK Food Law Post-Brexit

UK has retained EU food law as retained domestic law. Key UK-specific requirements include UK Food Information Regulations for allergen labelling and local authority enforcement. IMS tracks local authority inspection outcomes in the Audit module.

## US FDA Food Safety (21 CFR / FSMA)

The Food Safety Modernisation Act shifted focus from response to prevention. Key FSMA rules:

**Preventive Controls for Human Food (21 CFR Part 117):** Hazard Analysis and Risk-Based Preventive Controls (HARPC) — similar to HACCP but broader in scope, covering not just CCPs but all preventive controls (allergen, sanitation, supply chain).

**FSVP (Foreign Supplier Verification Programme):** US importers must verify foreign suppliers implement adequate preventive controls. IMS Supplier Management supports FSVP documentation.

## IMS Support for Food Safety Compliance

HACCP plan documentation: hazard analysis worksheets, CCP decision trees, monitoring records, corrective action records, verification records. Traceability: batch/lot tracking from raw material to dispatch. Supplier qualification: approved supplier register with audit status. CCP monitoring charts: automated alerts on critical limit deviation.

## Regulatory Inspection Preparation

Generate an evidence pack from Food Safety → Reports → Evidence Pack. Include: HACCP plan, PRP monitoring records, calibration records, training records, internal audit reports, customer complaint records, and management review minutes.

## Food Recall

If a recall is required: record in Incident Management → Food Safety Incident. IMS tracks the regulatory notification (Food Standards Agency in UK, FDA in US) deadline, recall scope, and withdrawal confirmation.`,
  },
  {
    id: 'KB-CG-015',
    title: 'Financial Services Regulatory Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['finance', 'regulatory', 'compliance', 'financial-services'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Financial Services Regulatory Compliance Guide

## Key Financial Regulations

**Sarbanes-Oxley (SOX):** US public companies must maintain internal controls over financial reporting (ICFR). Section 302 requires CEO/CFO certification. Section 404 requires management's assessment and auditor attestation of ICFR effectiveness. IMS Finance module provides audit trail, approval workflows, and segregation of duties controls.

**Basel III / IV:** Banking capital adequacy, liquidity, and leverage requirements. Risk management module supports operational risk identification and assessment for Basel operational risk capital calculations.

**Solvency II:** EU insurance capital requirements and governance. Risk management and internal model documentation are supported through IMS risk and document control modules.

**MiFID II:** EU investment firm requirements covering best execution, client suitability, transaction reporting, and research unbundling. IMS audit trail supports regulatory reporting evidence.

**DORA (Digital Operational Resilience Act):** EU financial sector ICT risk management, incident reporting, third-party risk, and resilience testing requirements from January 2025. IMS InfoSec and Business Continuity modules support DORA compliance.

## Internal Controls Framework

Document controls in IMS using the three-lines model: first line (business operations), second line (risk and compliance oversight), third line (internal audit). Map each control to the risk it mitigates and the regulatory requirement it satisfies. Test controls periodically using the Audit module and record results.

## Financial Reporting Obligations

IMS Finance module generates reports to support regulatory submissions. Maintain records of all submitted reports and regulatory correspondence in Document Control.

## AML Compliance

Anti-money laundering policy and procedures are managed using the ISO 37001 ABMS module. Customer due diligence (CDD) and enhanced due diligence (EDD) records are maintained. Suspicious activity reporting (SAR) workflows ensure timely reporting to the national financial intelligence unit.

## Regulatory Change Management

Integrate the Regulatory Monitor module to receive alerts on financial regulation changes (FCA, PRA, ECB, SEC, FINRA updates). Track regulatory changes through the assessment-to-implementation workflow to ensure timely compliance.

## Compliance Attestations

Management sign-off on compliance with key regulatory requirements (e.g., Consumer Duty fair value assessments, SMCR individual accountability) is captured through Workflow module approval steps with digital signature and audit trail.`,
  },
  {
    id: 'KB-CG-016',
    title: 'Construction & CDM Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['construction', 'cdm', 'health-safety', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Construction & CDM Compliance Guide

## CDM Regulations 2015 Overview

The Construction (Design and Management) Regulations 2015 apply to all construction work in Great Britain. They allocate duties to specific roles: client, principal designer, principal contractor, designers, and contractors.

## Duty Holder Support in IMS

**Client duties:** Notify HSE (F10 notification) for notifiable projects (>30 working days with >20 simultaneous workers, or >500 person-days). Appoint principal designer and principal contractor in writing — record appointments in Document Control. Ensure pre-construction information is compiled and shared.

**Principal Designer duties:** Plan, manage, monitor, and coordinate health and safety in the pre-construction phase. Manage pre-construction information pack — store in Document Control and control distribution to designers and contractors. Identify, eliminate, and control design risks using the H&S Risk Assessment module.

**Principal Contractor duties:** Develop and maintain the construction phase plan using the H&S module. Manage the construction phase H&S. Compile the health and safety file for handover to the client on project completion.

**Designer duties:** Eliminate foreseeable risks in design. Record design risk decisions and residual risk information in Document Control for inclusion in pre-construction information.

**Contractor duties:** Plan, manage, and monitor their own work. Ensure workers are trained and informed. Cooperate with the principal contractor.

## IMS Modules for CDM

**Permit to Work:** For high-risk activities such as excavations, confined space entry, work at height, hot work, and electrical isolation. PTW records provide evidence of control.

**Contractor Management:** Manage CDM duty holder organisations — record appointments, competence verification, and performance assessments.

**Document Control:** Store and control RAMS (Risk Assessment and Method Statements), pre-construction information, construction phase plan, and health and safety file.

**Training Tracker:** Record CDM competency (CSCS cards, SMSTS, SSSTS qualifications) for all duty holders.

## Health and Safety File

The H&S file is compiled by the principal designer and contains information needed for future construction, maintenance, and demolition. Store it as a project folder in Document Control and transfer ownership to the client on project completion.`,
  },
  {
    id: 'KB-CG-017',
    title: 'GDPR Data Subject Rights in IMS — Practical Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['gdpr', 'data-protection', 'privacy', 'data-subject-rights'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# GDPR Data Subject Rights in IMS — Practical Guide

## Right of Access (Subject Access Request)

When a data subject requests a copy of their personal data held in IMS:

1. Navigate to Admin Console → Privacy → Data Subject Reports
2. Search for the data subject by name or email
3. Select all relevant data categories (profile, activity, audit logs)
4. Click Generate Full Report
5. Review the report for any third-party data that must be redacted
6. Respond to the data subject within 30 calendar days of receipt

The SAR report exports all personal data IMS holds: profile information, login history, actions recorded in audit logs, and any records where the individual is named.

## Right to Rectification

If a data subject identifies inaccurate personal data: edit profile information directly in Settings → Users → [User] → Edit Profile. For inaccuracies in specific records (e.g., incident reports), edit via the relevant module. Document the correction in the SAR case record.

## Right to Erasure ('Right to be Forgotten')

IMS supports anonymisation rather than deletion to preserve business record integrity. The anonymisation process replaces personal identifiers (name, email, employee ID) with anonymous identifiers (ANON-XXXX) across all records.

Navigate to Admin Console → Privacy → Anonymise User. Note: anonymisation is irreversible. Certain records (statutory safety records, financial records) may be subject to legal holds that override the erasure right.

## Right to Data Portability

Export user data in machine-readable JSON format from Admin Console → Privacy → Data Export. This covers IMS-held data; data at sub-processors (e.g., cloud infrastructure logs) requires separate requests to those sub-processors.

## Right to Object

Users can manage notification preferences in their profile. Data processing based on legitimate interests can be objected to — document your assessment of whether a compelling legitimate ground overrides the individual's interests.

## SAR Response Documentation

Store SAR correspondence, the generated report, any redactions made, and the response letter in Document Control under Data Subject Access Requests. Retention period for SAR records: 3 years from response date.

## Third-Party Sub-Processor Data

When responding to SARs, identify whether requested data is held by IMS sub-processors (hosting, email, analytics providers). Include relevant sub-processor contact information so the data subject can make a direct request.`,
  },
  {
    id: 'KB-CG-018',
    title: 'ESG Reporting Frameworks Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['esg', 'gri', 'tcfd', 'csrd', 'sustainability', 'reporting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ESG Reporting Frameworks Compliance Guide

## GRI Standards (2021)

The Global Reporting Initiative Standards are the most widely used sustainability reporting framework. Structure:

**Universal Standards:** GRI 1 (foundation), GRI 2 (general disclosures — organisation profile, governance, strategy, ethics), GRI 3 (material topics — how to determine and report material topics).

**Topic Standards:** GRI 200 series (economic), GRI 300 series (environmental), GRI 400 series (social). Each material topic standard specifies disclosures including management approach and topic-specific metrics.

Material topics are determined through a double materiality assessment — considering both financial materiality (impact on the organisation) and impact materiality (organisation's impact on the world). IMS ESG module supports the double materiality assessment process.

## TCFD Framework

The Task Force on Climate-related Financial Disclosures provides 11 recommendations across four pillars:

**Governance:** Board oversight and management role in climate risks and opportunities.

**Strategy:** Climate-related risks and opportunities over short, medium, and long term; scenario analysis including 1.5°C and 2°C pathways.

**Risk Management:** Processes for identifying, assessing, and managing climate risks.

**Metrics & Targets:** GHG emissions (Scope 1, 2, 3), climate targets, progress.

IMS ESG module maps data to each TCFD recommendation, supporting disclosure preparation.

## CSRD / ESRS

The EU Corporate Sustainability Reporting Directive mandates ESRS (European Sustainability Reporting Standards) disclosures. Applies to large EU companies from 2024, listed SMEs from 2026. Environmental (ESRS E1-E5), social (ESRS S1-S4), and governance (ESRS G1) standards require extensive quantitative and qualitative disclosures.

## ISSB Standards

IFRS S1 (General Sustainability-Related Disclosures) and IFRS S2 (Climate-Related Disclosures) establish the global baseline adopted by many non-EU jurisdictions.

## IMS ESG Module Mapping

Navigate to ESG → Framework Mapping to see which IMS data fields satisfy which framework disclosures. A single Scope 1 emissions data entry supports GRI 305, TCFD Metrics & Targets, ESRS E1, and ISSB S2 simultaneously.

## Assurance Preparation

For limited assurance on ESG data: ensure data trails from source (meter reading, invoice, survey response) through to reported figure are documented and retained in IMS. Generate an ESG data pack from ESG → Reports → Assurance Pack.`,
  },
  {
    id: 'KB-CG-019',
    title: 'ISO 19011:2018 Audit Management Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['iso-19011', 'audit', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 19011:2018 Audit Management Compliance Guide

## Scope of ISO 19011

ISO 19011:2018 provides guidance for all audits of management systems — first party (internal), second party (supplier), and third party (certification). It covers audit programme management, audit planning, conducting audits, auditor competence, and audit reporting.

## Audit Programme Management

An audit programme is the set of audits planned for a specific time period. In IMS Audit Management, create an Annual Audit Programme:

1. Navigate to Audit Management → Programmes → New Programme
2. Set the programme objective (e.g., verify ISO 9001 implementation effectiveness)
3. Apply a risk-based schedule: higher-risk processes and areas receive higher audit frequency
4. Assign audit resources: lead auditors, technical experts, resource estimates
5. Review and approve the programme before the audit year begins

## Audit Planning

For each individual audit within the programme: define scope, criteria (clauses, procedures, processes), and auditee processes. Conduct a document review before the on-site audit. Prepare an audit plan (distributed to auditees in advance), audit checklists, and sampling strategy.

## Audit Execution

Opening meeting establishes the audit objectives, scope, criteria, methods, and timeline. Audit evidence is collected through interviews, observation, and document/record review. The audit team convenes daily to share findings and maintain consistent interpretation. The closing meeting presents audit findings (major nonconformance, minor nonconformance, observation, opportunity for improvement, conformance).

## Audit Report

The audit report is issued within an agreed timeframe (typically 10 working days). Contents: audit scope, criteria, team, dates, findings summary, conclusion (system effective / not effective), nonconformance details, and distribution list.

## Follow-Up

Nonconformances from the audit automatically generate CAPA records in IMS. Audit effectiveness is measured by CAPA closure rate, recurrence rate, and audit programme completion rate — all visible in the Audit Management dashboard.

## Auditor Competence

ISO 19011 specifies required auditor knowledge, skills, personal attributes, and education/experience. IMS Training Tracker records auditor qualifications: lead auditor course, management system knowledge, industry sector experience, and continuing professional development.

## Combined Audits

IMS supports combined audits (multiple standards in one audit) and joint audits (multiple auditing organisations). Configure combined audit checklists covering all applicable standard clauses.`,
  },
  {
    id: 'KB-CG-020',
    title: 'ISO 31000:2018 Risk Management Framework Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['iso-31000', 'risk', 'compliance', 'enterprise-risk'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 31000:2018 Risk Management Framework Guide

## Principles

ISO 31000 establishes eight principles for effective risk management: integrated (part of all activities), structured and comprehensive, customised (to the context), inclusive (stakeholder involvement), dynamic (responsive to change), best available information, human and cultural factors, and continual improvement.

IMS Risk Management module is designed around these principles, embedding risk consideration across all modules rather than treating it as a separate activity.

## Framework Components

**Leadership and commitment:** Top management demonstrates commitment by establishing risk management policy, ensuring adequate resources, and participating in risk oversight (management review).

**Integration:** Risk management is integrated into every IMS module — quality NCRs, environmental aspects, H&S hazards, and infosec risks all feed into the unified risk register.

**Design:** The risk management framework is designed considering organisational context, risk appetite, and objectives. Configure risk criteria in IMS Settings → Risk Management.

**Implementation:** Roles and responsibilities, processes, reporting, and communication are configured in IMS.

**Evaluation:** Risk management effectiveness is assessed through KPIs (risk closure rate, residual risk trend, treatment action completion) tracked in the KPI Dashboard.

**Improvement:** Risk management framework improvements are tracked as management review action items.

## Risk Assessment Process

1. **Communication and consultation:** Engage stakeholders in risk identification
2. **Scope, context, and criteria:** Define risk appetite, likelihood and consequence scales, and risk acceptance threshold in IMS Settings
3. **Risk identification:** Identify risks across all processes and objectives
4. **Risk analysis:** Assess likelihood and consequence; determine risk level
5. **Risk evaluation:** Compare against criteria to determine treatment priority
6. **Risk treatment:** Select and implement treatment options (avoid, reduce, share, accept); track actions to completion
7. **Monitoring and review:** Regular review of risk register; escalation for material changes
8. **Recording and reporting:** Risk register and risk report to management

## Embedding Across IMS Modules

Each IMS module contributes to the enterprise risk picture: quality risks (nonconformances, customer complaints), environmental risks (aspects and impacts, legal breaches), OHS risks (incidents, hazards), information security risks (vulnerabilities, incidents), financial risks (control failures). The unified risk register consolidates cross-domain visibility.

## Risk Maturity Self-Assessment

Use the ISO 31000 framework components as a maturity model. Score each component from 1 (absent) to 5 (optimised). IMS provides a risk maturity assessment template in the Audit module for conducting this self-assessment annually.`,
  },
  {
    id: 'KB-CG-021',
    title: 'Whistleblowing & Speak-Up Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['whistleblowing', 'compliance', 'corporate-governance', 'eu-whistleblower-directive'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Whistleblowing & Speak-Up Compliance Guide

## EU Whistleblower Protection Directive (2019/1937)

The EU Whistleblower Directive applies to organisations with 50 or more employees across EU member states (implemented in national law by December 2021).

**Protected disclosures:** Reporting of violations of EU law in areas including public procurement, financial services, anti-money laundering, consumer protection, data protection, environment, food safety, transport safety, nuclear safety, and cybersecurity.

**Internal reporting channel requirements:**
- Secure, confidential reporting channel accessible to employees, contractors, and others in the business relationship
- Anonymous reporting must be permitted
- Acknowledgement within 7 days of report receipt
- Diligent follow-up and feedback to reporter within 3 months

**Prohibition of retaliation:** Retaliation against good-faith reporters (dismissal, demotion, discrimination, harassment) is prohibited. The burden of proof is reversed — the employer must demonstrate an adverse action is not retaliation.

## UK PIDA (Public Interest Disclosure Act 1998)

UK workers making protected disclosures about qualifying concerns (criminal offences, health and safety violations, miscarriage of justice, environmental damage, concealment of any of these) are protected from detriment and dismissal. IMS speak-up channel records provide evidence of report receipt, response timeline, and investigation conduct.

## US Whistleblower Protections

Multiple US statutes protect whistleblowers: SOX (securities violations), Dodd-Frank (financial fraud), OSHA Section 11(c) (workplace safety), False Claims Act (government fraud). Some statutes provide financial rewards for reporters whose disclosures lead to enforcement actions.

## IMS Speak-Up Configuration

Navigate to ISO 37001 → Speak-Up Channel to configure:
- Anonymous submission (no login required)
- Case management with confidentiality controls (investigator access only)
- Automated acknowledgement within 24 hours
- Response tracking against the 3-month follow-up deadline
- Non-retaliation declaration visible to all users

## Case Investigation Independence

Investigations must be independent of the subject of the report. In IMS, assign the investigation to a lead investigator who is independent of the matter. Use the investigation workflow with restricted access so only authorised personnel can view case details.

## Annual Reporting

Produce annual statistics on speak-up reports: number received, subject matter categories, closure timelines, and actions taken. This data satisfies EU Directive transparency requirements and demonstrates programme effectiveness to the governing body.`,
  },
  {
    id: 'KB-CG-022',
    title: 'Modern Slavery & Supply Chain Compliance Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['modern-slavery', 'supply-chain', 'compliance', 'esg'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Modern Slavery & Supply Chain Compliance Guide

## Modern Slavery Act 2015 (UK)

Commercial organisations with annual turnover exceeding £36 million that supply goods or services in the UK must publish an annual modern slavery and human trafficking transparency statement. The statement must describe steps taken (or state that no steps have been taken) to ensure modern slavery is not present in business operations and supply chains.

Required statement content: organisational structure and supply chains, policies in relation to slavery and trafficking, due diligence processes, risk assessment and management, KPIs for measuring effectiveness, and training provision.

## California Transparency in Supply Chains Act

Similar requirements apply to retailers and manufacturers doing business in California with annual worldwide gross receipts over $100 million. Disclosures cover verification, auditing, certification, internal accountability, and training.

## EU Corporate Sustainability Due Diligence Directive (CSDDD)

The CSDDD (adopted 2024, phased implementation 2027-2029) requires large EU companies and non-EU companies with significant EU turnover to conduct human rights and environmental due diligence across their value chains, including taking remedial action and providing access to remedy.

## Supply Chain Risk Assessment

Using IMS Supplier Management for modern slavery risk assessment:

1. Screen supplier locations against high-risk country indices (Global Slavery Index)
2. Identify high-risk sector commodities (garments, electronics, agriculture, construction, cleaning)
3. Score suppliers on modern slavery risk (country risk + sector risk + relationship type)
4. Prioritise high-risk suppliers for enhanced due diligence

## Supplier Qualification

Include modern slavery questions in the supplier qualification questionnaire: do they have a modern slavery policy? Do they conduct supply chain mapping? Have they ever identified modern slavery in their supply chain and how did they respond? What worker welfare and living wage commitments do they make?

## Statement Preparation

Use IMS data to populate the annual modern slavery statement: number of suppliers assessed, percentage in high-risk countries, audits conducted, training hours delivered, incidents identified and remediated. IMS generates a statement data pack from Supplier Management → Reports → Modern Slavery Statement.

## Remediation

If modern slavery is identified: immediately assess worker safety, engage local experts, report to authorities where required, develop a remediation plan, and support victim access to remedy. Document all steps in the Incident Management module. Integrate with ISO 37001 speak-up channel for worker complaints.`,
  },
  {
    id: 'KB-CG-023',
    title: 'Preparing for ISO Certification — Stage 1 Audit Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['certification', 'audit', 'iso', 'preparation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Preparing for ISO Certification — Stage 1 Audit Guide

## What is a Stage 1 Audit?

The Stage 1 audit (also called a documentation review or readiness review) is a desktop assessment by the certification body. The auditor confirms that your documented management system is designed to meet the requirements of the relevant ISO standard before investing time in the Stage 2 on-site audit.

## What Auditors Review at Stage 1

**Management system scope (Clause 4.3):** Is the scope clearly defined? Does it cover the organisation's activities, products, services, and locations? Are exclusions justified?

**Policy (Clause 5.2):** Is the policy approved by top management? Does it include all required commitments? Is it available to interested parties?

**Objectives (Clause 6.2):** Are objectives measurable, monitored, and communicated? Are they linked to strategic direction?

**Risk register (Clause 6.1):** Have risks and opportunities been systematically identified? Are treatment plans in place?

**Legal register (Clause 6.1.3 for 14001/45001):** Is the register comprehensive? When was it last reviewed?

**Documented information register (Clause 7.5):** Is all required documented information identified, controlled, and current?

**Internal audit programme (Clause 9.2):** Is there an approved annual audit programme covering the full management system scope?

**Management review records (Clause 9.3):** Has at least one full management review been conducted? Does it address all required inputs?

## Common Stage 1 Findings

- Scope too narrow (excludes significant processes or sites)
- Policy not formally approved (unsigned or undated)
- Objectives not measurable or without monitoring frequency
- Legal register incomplete or not recently reviewed
- No documented audit programme for the coming year
- Management review conducted but records missing required inputs

## How to Prepare

Generate the Document Register from Document Control → Reports → Document Register. Verify all required documents are present, approved, and current. Run a readiness self-assessment in Audit Management using the relevant ISO standard as audit criteria. Address gaps before the Stage 1 date.

## Timeline

Stage 1 typically takes place 4-6 weeks before Stage 2. Major findings at Stage 1 may require a Stage 1 repeat before Stage 2 can proceed, adding weeks to the timeline. Early preparation avoids this delay.`,
  },
  {
    id: 'KB-CG-024',
    title: 'Preparing for ISO Certification — Stage 2 Audit Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['certification', 'audit', 'iso', 'preparation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Preparing for ISO Certification — Stage 2 Audit Guide

## What is a Stage 2 Audit?

The Stage 2 audit is the main certification audit. The auditor verifies that the management system documented at Stage 1 is effectively implemented in practice. Implementation means evidence: records showing the system is operating, not just procedures saying how it should operate.

## What Auditors Verify at Stage 2

**Training records:** Are all required competency records present? Do they cover all relevant personnel? Are training records current?

**Monitoring data:** Are monitoring activities being performed at the required frequency? Are records complete with actual readings against targets?

**Incident and nonconformance records:** Are incidents and NCRs being identified and reported? Are investigations completed? Do CAPA records address root causes?

**Audit records:** Has the internal audit programme been completed? Do findings reflect genuine evidence-based assessment (not just 'satisfactory')? Are CAPA records in place for findings?

**Management review minutes:** Were all required inputs addressed? Are outputs (decisions and actions) tracked to completion?

**Legal compliance evaluation:** Is there evidence of legal compliance evaluation, not just a register of requirements?

## Evidence Collection Using IMS

Navigate to each module → Reports → Evidence Pack. Select the relevant date range (typically 12 months before the audit). The evidence pack compiles module-specific records into an auditable document set. Key modules: H&S, Environment, Quality, HR, Training, Audit Management, Management Review, CAPA, Document Control.

## Common Stage 2 Nonconformances

Controls documented but not consistently applied across all sites or shifts. Training records missing for specific personnel or roles. CAPA not effectively closing issues (same issues recurring). Management review missing some required inputs. Legal compliance evaluation not evidenced.

## Pre-Audit Mock Audit

Two to four weeks before Stage 2: conduct an internal mock audit using IMS Audit Management. Assign an internal lead auditor independent of the areas being audited. Use the ISO standard as the audit criteria. Document findings and complete CAPAs before the certification audit.

## Managing Auditee Anxiety

Brief all staff on the audit process. Explain that auditors are verifying the system, not testing individual employees. Encourage staff to show auditors actual records rather than explaining what they do verbally. IMS's intuitive interface allows auditees to navigate to relevant records quickly under audit pressure.

## Auditor Access to IMS

Create a temporary read-only guest account for certification body auditors. Configure access to cover only the management system modules in scope, excluding financial and personnel data outside audit scope.`,
  },
  {
    id: 'KB-CG-025',
    title: 'Surveillance & Recertification Audit Preparation Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['certification', 'surveillance', 'recertification', 'iso'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Surveillance & Recertification Audit Preparation Guide

## The Three-Year Certification Cycle

ISO certification operates on a three-year cycle:

**Year 1 (post-certification):** First surveillance audit — typically 6-12 months after initial certification. Focused on verifying that the system is maintained and that initial certification nonconformances are resolved.

**Year 2:** Second surveillance audit — similar scope to Year 1. Auditors look for evidence of continual improvement.

**Year 3:** Recertification audit — more extensive than surveillance. Comprehensive review similar in depth to the original Stage 2 audit. Successful recertification restarts the three-year cycle.

## What Changes at Surveillance vs Initial Certification

Surveillance audits focus on:
- Are previous nonconformances truly resolved (root cause addressed, not just corrected)?
- Is the system being maintained (records current, audits completed, reviews conducted)?
- Is there evidence of continual improvement (KPI trends moving in the right direction)?
- Have there been significant changes to the organisation or context that affect the management system?

## Demonstrating Continual Improvement

Use the IMS KPI Dashboard to generate trend charts for key performance indicators. Year-on-year comparison charts demonstrating improvement (reduced incidents, reduced nonconformances, improved compliance rate, energy reduction, CAPA closure time improvement) are powerful surveillance audit evidence.

## Nonconformance Recurrence Check

Before each surveillance audit, review all nonconformances from the previous audit. For each closed CAPA: confirm the root cause identified was genuine, the corrective action addresses the root cause (not just the symptom), and there is evidence the action was implemented and verified. Recurring nonconformances signal ineffective CAPA and attract major NCs at surveillance.

## Scope Extensions

If your organisation has added sites, processes, or products since initial certification, consider including them in the certification scope at recertification or as a scope extension review. Document scope change requests with the certification body.

## Recertification Preparation

Recertification (Year 3) preparation mirrors Stage 2 preparation: generate full evidence packs, conduct a comprehensive mock internal audit, check all records are current, and verify that all legal requirements and objectives have been reviewed in the past 12 months.

## IMS Audit History

In Audit Management → History, view all previous internal audit findings and closure status. This is a quick readiness check before each surveillance audit — outstanding CAPAs or recurring themes need attention before the certification body arrives.`,
  },
  {
    id: 'KB-CG-026',
    title: 'Internal Audit Programme — Annual Planning Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['audit', 'internal-audit', 'planning', 'iso-19011'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Internal Audit Programme — Annual Planning Guide

## Risk-Based Audit Scheduling

ISO management standards require a risk-based approach to internal audit frequency. Higher-risk processes, areas with previous nonconformances, or areas with significant changes are audited more frequently than stable, low-risk processes.

In IMS, assign a risk rating to each auditable area when planning the annual programme. Areas rated 'High' are audited at least twice annually; 'Medium' once annually; 'Low' every 18-24 months (subject to covering all areas within the certification cycle).

## Audit Scope Matrix

Plan the annual programme using a scope matrix: rows represent processes or departments, columns represent applicable ISO standards and clauses. Mark each cell where a process is relevant to a clause. Distribute audits so that all cells are covered within the year. IMS Audit Management → Programme Planning provides a template matrix view.

## Audit Resource Planning

For each planned audit: identify the lead auditor and any technical experts required. Confirm auditor independence (auditors cannot audit their own work). Estimate audit duration (hours) and schedule against auditor availability. IMS Audit Management displays resource utilisation across the programme.

## Programme Documentation

Navigate to Audit Management → New Programme to create the annual audit programme. The programme record includes: objective, scope, schedule, resource plan, and programme review date. Circulate the approved programme to all auditees in January (or at the start of your audit year).

## Integration with Management Review

The audit programme and its results are required inputs to management review (Clause 9.3). IMS Audit Management generates a programme summary report showing: planned vs completed audits, findings by clause and process, CAPA status, and trend analysis. This report is presented directly at the management review.

## Auditor Competency Development

Maintain a training plan for internal auditors: initial lead auditor course (IRCA-accredited or equivalent), annual refresher on standard updates, sector-specific technical knowledge updates. Track all training in the Training Tracker module.

## Cross-Departmental Audit Teams

Independence is strengthened by using cross-departmental audit teams. An operations manager auditing the HR department, and an HR manager auditing operations, provides genuine independence and cross-functional knowledge sharing.

## Audit Programme KPIs

Track programme performance in the KPI Dashboard: percentage of planned audits completed on schedule (target >90%), average findings per audit day, CAPA closure rate within agreed timescales (target >85%), auditor utilisation rate. These KPIs feed the management review assessment of audit programme effectiveness.`,
  },
  {
    id: 'KB-CG-027',
    title: 'Evidence Pack Generation for ISO Audits',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['certification', 'evidence', 'audit', 'iso'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Evidence Pack Generation for ISO Audits

## What is an Evidence Pack?

An evidence pack is a structured collection of documented information that demonstrates management system implementation to auditors, regulatory inspectors, or internal reviewers. A well-prepared evidence pack makes audits faster, reduces auditee anxiety, and demonstrates system maturity.

## Generating an Evidence Pack in IMS

1. Navigate to the relevant module (e.g., H&S, Environment, Quality, Audit Management)
2. Select Reports → Evidence Pack
3. Choose the date range (typically the 12 months preceding the audit)
4. Select the record categories to include
5. Click Generate — IMS compiles the selected records into a structured PDF or zipped document set
6. Review completeness before sharing with auditors

## Evidence Pack Contents by Module

**Document Control:** Document register, current version of all required documented information (policy, procedures, work instructions, forms)

**Training / HR:** Competency requirements register, training records for all relevant roles, training completion summary

**Incident / NCR / CAPA:** Incident register, nonconformance register, CAPA register with status, overdue CAPA report

**Internal Audit:** Audit programme, individual audit reports, finding summary, CAPA closure evidence

**Monitoring:** Environmental monitoring data, OHS KPI data, energy monitoring records, food safety monitoring charts

**Legal Register:** Applicable legal requirements, compliance status evaluations, review dates

**Management Review:** Management review agenda and minutes, attendance record, action log with status

## Organising by ISO Clause

For certification audits, organise evidence by standard clause number. IMS evidence packs support clause-tagged evidence for ISO 9001, 14001, 45001, 27001, 50001, and 22000.

## Providing Auditor Access

For certification body auditors: create a temporary IMS account with read-only access to all relevant modules. Set an account expiry date (audit date plus 5 working days). Provide login credentials and a brief navigation guide before the audit.

For sharing document packs offline: generate the evidence pack as a PDF bundle and share via a secure link with an expiry date.

## Pre-Audit Completeness Check

One week before the audit: review the evidence pack for gaps — missing records, records outside the date range, unsigned documents, or overdue actions. Address gaps before the audit date. A pre-audit evidence review meeting with the management system team takes 2-3 hours and prevents last-minute surprises.`,
  },
  {
    id: 'KB-CG-028',
    title: 'Compliance Monitoring & Reporting Calendar',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'calendar', 'regulatory', 'reporting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Compliance Monitoring & Reporting Calendar

## Building Your Compliance Calendar

A compliance calendar consolidates all regulatory reporting deadlines, certification milestones, permit renewals, and internal review cycles into a single schedule. Missed deadlines trigger regulatory risk; late submissions attract penalties. IMS supports a centralised compliance calendar with advance alerts.

## Regulatory Reporting Deadlines (UK/EU Examples)

**April 30:** UK Greenhouse Gas (GHG) emissions report for the previous calendar year. EU ETS annual allowance surrender for the previous year.

**June 30:** Modern Slavery Act annual transparency statement (within 6 months of financial year end for most organisations).

**With annual report:** UK SECR (Streamlined Energy and Carbon Reporting) — energy and carbon data included in the directors' report for companies meeting the SECR threshold.

**Quarterly:** PAYE, VAT, and CIS returns (financial compliance calendar).

**Ad hoc:** RIDDOR notifications (immediately or within 10-15 days depending on injury type); environmental incident notifications (immediately); food safety withdrawal notifications (immediately).

## Certification Calendar

- Year 1 Surveillance Audit: typically 9-12 months after initial certification
- Year 2 Surveillance Audit: typically 21-24 months after initial certification
- Year 3 Recertification Audit: before expiry of three-year certificate

Track certification expiry dates in IMS Audit Management → Certification Register with renewal alerts.

## Internal Compliance Calendar

- Annual management review (required by all ISO standards)
- Annual internal audit programme (all areas covered within the year)
- Risk register annual review (minimum; quarterly for high-residual risks)
- Objectives progress review (quarterly recommended)
- Legal requirements register review (annual minimum)
- Supplier quality review meetings (frequency based on supplier risk rating)

## Configuring Calendar Reminders in IMS

Navigate to Compliance Calendar → Add Event. Configure advance alert notifications at 60 days (preparation begins), 30 days (escalation to management), and 7 days (immediate action required). Assign responsibility to a named owner. Integrate with email notifications so responsible owners receive automatic reminders.

## Calendar Access

Share the compliance calendar with the compliance team, department heads, and executive sponsors. Use the IMS calendar view to display all upcoming compliance events in a single monthly or quarterly view.`,
  },
  {
    id: 'KB-CG-029',
    title: 'Gap Assessment Guide — Getting Started with a New ISO Standard',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['gap-assessment', 'iso', 'certification', 'planning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Gap Assessment Guide — Getting Started with a New ISO Standard

## Purpose of a Gap Assessment

Before beginning implementation of a new ISO standard, a gap assessment identifies where your organisation currently meets the standard's requirements and where gaps exist. This prevents wasted effort and allows resources to be focused on genuine gaps rather than areas already in compliance.

## Gap Assessment Methodology

Conduct a clause-by-clause self-assessment against the standard. For each clause:

**Scoring:**
- 3 — Compliant: requirement is fully met with documented evidence
- 2 — Partially compliant: requirement is partly met but has gaps (e.g., process exists but is not documented or not consistently applied)
- 1 — Non-compliant: requirement is not met
- 0 — Not applicable: clause does not apply to the organisation's scope (justify exclusion)

Score each sub-clause and calculate a percentage compliance score per clause and overall.

## Conducting the Gap Assessment in IMS

1. Navigate to Audit Management → New Internal Audit
2. Set the audit type to 'Gap Assessment'
3. Select the target ISO standard as the audit criteria
4. Assign the lead assessor and assessment team
5. Complete the assessment using the built-in clause checklist, adding evidence references and scores
6. Generate the Gap Assessment Report from the audit record

## Gap Report Structure

The gap report includes: executive summary with overall compliance score; gap findings by clause with current state, gap description, and improvement priority; a heat map showing compliance by clause; and an estimated implementation effort (low/medium/high) per gap.

## Prioritising Gaps

Apply an impact/effort matrix: quick wins (low effort, high compliance impact) are implemented first to build momentum. Strategic investments (high effort, required for certification) require project planning. Categorise gaps as: regulatory/legal requirements (non-negotiable), certification requirements (needed for certification), and good practice (beneficial but not required for certification).

## Implementation Roadmap

Convert the gap assessment output into a project plan: objectives (close Gap X by Date Y), resources, responsibilities, and milestones. Track implementation progress in the IMS Objective Tracker. Conduct a follow-up gap assessment 6 months into implementation to measure progress.

## External Gap Assessment

Consider engaging an external consultant for an independent gap assessment before major investments in implementation. External assessors bring certification body experience and industry benchmark perspective. IMS supports external consultants via a guest account with gap assessment permissions.`,
  },
  {
    id: 'KB-CG-030',
    title: 'IMS Compliance Dashboard — Configuring Your Compliance View',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['compliance', 'dashboard', 'analytics', 'ims'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Compliance Dashboard — Configuring Your Compliance View

## What to Show on a Compliance Dashboard

An effective compliance dashboard gives management instant visibility of the compliance posture without needing to navigate multiple modules. Core metrics include:

- **Open nonconformances by standard:** Count of open NCRs categorised by ISO standard (ISO 9001, 14001, 45001, 27001)
- **CAPA overdue rate:** Percentage of CAPAs past their due date (target <5%)
- **Internal audit programme compliance:** Planned vs completed audits as a percentage (target >90%)
- **Certification expiry dates:** Days remaining to next surveillance or recertification audit
- **Training compliance rate:** Percentage of required training completed for all roles (target >95%)
- **Legal register status:** Number of requirements with overdue review dates
- **Management review status:** Days since last management review (alert if >12 months)
- **Objectives on-track rate:** Percentage of compliance objectives on track or ahead of plan

## Configuring the Compliance Dashboard in IMS

1. Navigate to Analytics → Dashboards → New Dashboard
2. Name it 'Compliance Overview'
3. Add widgets from each module: Audit Management (NCR count, audit compliance), CAPA (overdue rate), Training (completion rate), Legal Register (review status), Objectives (on-track count)
4. Set widget thresholds for RAG (Red/Amber/Green) status
5. Arrange widgets by priority — certification dates and overdue CAPAs prominently at the top

## RAG Status Configuration

Configure RAG thresholds to match your risk appetite: CAPA overdue rate — Green <5%, Amber 5-15%, Red >15%. Training compliance — Green >95%, Amber 85-95%, Red <85%. Audit programme completion — Green >90%, Amber 75-90%, Red <75%.

## Scheduling Dashboard Reports

Configure scheduled email delivery: weekly compliance digest to the compliance manager, monthly full compliance dashboard report to the leadership team. Navigate to Analytics → Schedules → New Schedule to set delivery timing and recipients.

## Multi-Standard Dashboard Layout

For organisations certified to multiple standards, create separate dashboard sections for each: ISO 9001 Quality Section, ISO 14001 Environmental Section, ISO 45001 OHS Section, ISO 27001 InfoSec Section. Use the section headings feature in Analytics dashboard builder.

## Board Reporting Integration

Export the compliance dashboard as a PDF report for board packs. The one-page compliance summary — RAG status, key metrics, top risks, and actions — is generated from Analytics → Export → Board Report Format.

## Compliance Maturity Tracking

Add a year-on-year comparison chart to the dashboard showing key compliance metrics across the past three years. Improving trends demonstrate the continual improvement requirement of ISO management standards and build board confidence in the management system.`,
  },
];
