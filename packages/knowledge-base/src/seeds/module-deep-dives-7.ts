import type { KBArticle } from '../types';

export const moduleDeepDives7Articles: KBArticle[] = [
  // ─── ISO 37001 (ANTI-BRIBERY MANAGEMENT SYSTEM) MODULE ───────────────────
  {
    id: 'KB-DD7-001',
    title: 'Anti-Bribery Management System Day-to-Day User Guide',
    content: `## Anti-Bribery Management System Day-to-Day User Guide

The ISO 37001 module supports the management of your Anti-Bribery Management System (ABMS). Bribery is a significant legal and reputational risk for organisations operating in complex commercial environments. This guide covers the routine tasks performed by compliance professionals managing the ABMS day to day.

### Navigating the ISO 37001 Module

From the main navigation, open ISO 37001. The module is organised into five sections: Due Diligence, Gifts & Hospitality, Declarations, Speak-Up, and Reporting. The dashboard surfaces the most time-sensitive items across all five areas.

### Daily Compliance Tasks

Review the dashboard each day for items requiring action:

- **Open Due Diligence Requests** — business partner assessments awaiting review or approval
- **Pending Declarations** — conflict of interest or gifts declarations submitted but not yet reviewed
- **Speak-Up Reports** — newly submitted concern reports awaiting acknowledgement and assignment
- **Training Compliance** — staff due for anti-bribery refresher training

### Dashboard Overview

The main dashboard shows five compliance health metrics:

- **Open Due Diligence** — count of active due diligence assessments by stage
- **Pending Declarations** — gifts, hospitality, and conflict of interest items awaiting manager sign-off
- **Incident Reports** — open speak-up cases by classification stage
- **Training Compliance** — percentage of staff with current anti-bribery training certification
- **Policy Acknowledgements** — percentage of staff who have acknowledged the current anti-bribery policy

### Quick Actions

From the toolbar:

- **Log Gift** — record a gift or hospitality item given or received
- **Submit Due Diligence** — open a due diligence assessment for a new or existing business partner
- **Report Concern** — submit an anonymous or named speak-up report

### Compliance Calendar

The compliance calendar shows: annual policy acknowledgement cycles, scheduled due diligence re-assessments, training renewal deadlines, and the ABMS internal audit schedule — keeping all key ABMS activities visible in one place.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-37001', 'anti-bribery', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-002',
    title: 'Bribery Risk Assessment',
    content: `## Bribery Risk Assessment

A bribery risk assessment is the foundation of an effective ABMS. It identifies the scenarios where bribery risk is highest and ensures that controls are proportionate to the actual risk faced.

### Risk Assessment Methodology

Open the bribery risk assessment from the ISO 37001 module. The methodology follows ISO 37001 guidance and walks through identification, scoring, and treatment of bribery risk scenarios.

### Identifying Risk Scenarios by Function

Work through each business function to identify plausible bribery scenarios:

- **Sales and Marketing** — entertaining public officials or customers, gifts to influence procurement decisions
- **Procurement** — receiving inducements from suppliers, reciprocal arrangements
- **Regulatory Affairs** — interaction with licensing or approval authorities
- **Finance** — off-book payments, facilitation payments, inflated expense claims
- **Human Resources** — payments to influence hiring decisions
- **Operations** — payments to customs officials, inspectors, or service providers

### Risk Factors

Weight each scenario by its inherent risk factors:

- **Public Official Interaction** — significantly elevates bribery risk
- **High-Risk Geographies** — operating in countries with elevated corruption perception indices
- **Large Contract Values** — higher-value decisions attract more incentive for improper payments
- **Discretionary Decision-Making** — individual employees with significant unreviewed purchasing or approval authority

### Risk Scoring

Score each scenario: Likelihood (1–5) multiplied by Impact (1–5). Scenarios scoring above 15 are High Risk and require enhanced controls. Scenarios scoring 8–15 are Medium Risk. Below 8 are Low Risk.

### Risk Treatment

Map each risk scenario to the Annex A controls from ISO 37001:

- Due diligence on business partners
- Financial controls (segregation of duties, approval limits)
- Gifts and hospitality policy
- Anti-bribery training for at-risk roles
- Whistleblowing channel

### Risk Register Review

Review the bribery risk assessment annually or when triggered by a significant change: new market entry, major acquisition, significant change in business model, or reported incident.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-37001', 'anti-bribery', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-003',
    title: 'Due Diligence Procedures',
    content: `## Due Diligence Procedures

Due diligence on business partners is one of the most important controls in an Anti-Bribery Management System. It verifies that third parties who act on behalf of your organisation, or with whom you enter significant commercial relationships, do not present an unacceptable bribery risk.

### Scope of Due Diligence

Due diligence applies to:

- **Agents and Intermediaries** — third parties acting on your behalf in dealings with public authorities or customers
- **Distributors and Resellers** — particularly in high-risk jurisdictions
- **Joint Venture Partners** — shared liability requires assurance of partner standards
- **Major Suppliers** — in high-risk sectors or geographies
- **Professional Advisors** — law firms, lobbyists, and consultants with regulatory interactions

Not all third parties require the same level of due diligence. The level is calibrated to the risk profile.

### Due Diligence Levels

**Simplified Due Diligence** — for low-risk, low-value business partners. Basic sanctions screening and public domain checks.

**Standard Due Diligence** — for medium-risk partners. Sanctions screening, adverse media check, company registration check, anti-bribery questionnaire.

**Enhanced Due Diligence** — for high-risk partners, particularly agents in high-risk jurisdictions. All standard checks plus: financial check, reference verification, beneficial ownership identification, and may include an on-site visit.

### Due Diligence Process

1. Initiate a due diligence request in IMS from the business partner record
2. Send the due diligence questionnaire to the partner contact
3. Conduct sanctions screening (automated against global sanctions lists)
4. Conduct adverse media check (searches for negative press coverage)
5. Review returned questionnaire and supporting documents
6. Identify and assess any red flags

### Red Flag Identification

Red flags that require escalation: refusal to complete the questionnaire, beneficial ownership linked to a public official, recent adverse media coverage of bribery allegations, unusually high commission requests, and connections to known corrupt entities.

### Due Diligence Outcomes

Based on the assessment, classify the outcome: Approved, Approved with Conditions (specific monitoring requirements), or Rejected. The decision is recorded with the reviewer's name, date, and rationale.

### Periodic Re-Screening

Schedule periodic re-screening based on risk level: annually for high-risk partners, every three years for standard-risk, triggered by news alerts for all partners. IMS schedules re-assessments automatically.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-37001', 'anti-bribery', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-004',
    title: 'Business Partner & Third-Party Assessment',
    content: `## Business Partner & Third-Party Assessment

A comprehensive business partner programme manages anti-bribery risk across the entire third-party lifecycle — from onboarding through monitoring and, where necessary, offboarding.

### Business Partner Registry

All third parties requiring anti-bribery management are registered in IMS. The registry records: company name, jurisdiction, business relationship type, risk classification, due diligence status, and next re-assessment date. The registry provides a single view of the entire third-party portfolio.

### Onboarding Workflow

The partner onboarding process follows a defined sequence in IMS:

1. **Initiating Department** submits a new partner request with business justification
2. **Risk Classification** — the system assigns a risk level based on country, sector, and relationship type
3. **Due Diligence** — appropriate level of due diligence is completed
4. **Compliance Review** — compliance function reviews and approves or rejects
5. **Commercial Engagement** — the business may proceed with the relationship

No commercial engagement is authorised until compliance approval is recorded in IMS.

### Anti-Bribery Contractual Clauses

All business partner contracts must include standard anti-bribery clauses requiring: compliance with applicable anti-bribery laws, cooperation with audits and investigations, notification of any suspected bribery involving the contract, and the organisation's right to terminate for bribery violations. These clauses are stored in IMS and auto-populated in contract templates.

### Monitoring During Engagement

High-risk partners are subject to ongoing monitoring between formal re-assessments: automated adverse media alerts, annual certification of compliance, and review triggered by any red flag event (such as a bribery allegation in the partner's home market).

### Business Partner Training

Require high-risk agents and intermediaries to complete an online anti-bribery training module as a condition of engagement. Track training completion in IMS. Untrained partners are flagged as non-compliant.

### Non-Compliant Partner Termination

Where a partner is found to present an unacceptable bribery risk, or refuses to engage with due diligence or training requirements, the IMS workflow generates a formal termination recommendation for approval by the ABMS Officer and legal counsel before any communication to the partner.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-37001', 'anti-bribery', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-005',
    title: 'Gifts, Hospitality & Conflict of Interest Management',
    content: `## Gifts, Hospitality & Conflict of Interest Management

Gifts, hospitality, and conflicts of interest are primary vectors for bribery. A transparent, well-enforced policy for these areas is a core ISO 37001 control.

### Gifts and Hospitality Policy

The anti-bribery policy sets out:

- **Permitted threshold** — the maximum value of a gift or hospitality item that may be given or received without pre-approval
- **Pre-approval requirement** — gifts and hospitality above the threshold require advance approval from the manager and, for high-value items, the ABMS Officer
- **Prohibited items** — cash, cash equivalents (vouchers, gift cards above a nominal value), and items with no legitimate business justification are prohibited at any value
- **Public official rule** — a more restrictive rule applies to gifts and hospitality involving public officials in many jurisdictions

### Gifts and Hospitality Register

All gifts and hospitality items — both given and received — are recorded in IMS regardless of value. The register entry includes: date, description, estimated value, from/to (company and individual), business purpose, and approval status.

The register is reviewed quarterly by the ABMS Officer for patterns that might indicate an attempt to cultivate improper influence.

### Pre-Approval Workflow

Items above the threshold trigger a pre-approval request in IMS. The request is sent to the employee's line manager, who approves or declines within 48 hours. Approvals above the senior threshold are automatically escalated to the ABMS Officer.

### Conflict of Interest Declaration

All employees in designated roles (procurement, sales, HR, regulatory affairs) complete an annual conflict of interest declaration in IMS. Ad-hoc declarations are submitted whenever a new conflict arises during the year. Each declaration records: the nature of the potential conflict, relationships involved, and the management decision (no conflict found, conflict managed, employee recused).

### Conflict of Interest Register

All declared conflicts are maintained in the Conflict of Interest Register with the management decision and any monitoring requirements. The register is reviewed by the ABMS Officer and reported at management review.

### Facilitation Payments

Facilitation payments — small payments to public officials to expedite routine government actions — are prohibited by many anti-bribery laws including the UK Bribery Act. The policy requires employees to refuse facilitation payment demands and report them immediately through the speak-up channel.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-37001', 'anti-bribery', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-006',
    title: 'Whistleblowing & Speak-Up Channels',
    content: `## Whistleblowing & Speak-Up Channels

A confidential, accessible speak-up channel is an essential component of an ISO 37001-compliant ABMS. It enables employees and third parties to report concerns about bribery without fear of retaliation.

### Speak-Up Channels

IMS provides multiple speak-up channels to maximise accessibility:

- **In-App Report** — a secure form within IMS, accessible to all logged-in users
- **Anonymous Web Form** — accessible without login, allowing fully anonymous submission
- **Email Hotline** — a dedicated mailbox monitored by the ABMS Officer
- **Telephone Hotline** — a dedicated number for verbal reports, with transcription into IMS
- **Direct to Compliance Officer** — named contact for reporters who prefer a direct relationship

All channels feed into the same case management workflow in IMS.

### Report Intake

Every submitted report receives an automatic acknowledgement with a unique case reference number. The reporter (unless anonymous) is notified that their report has been received and will be reviewed within a defined timeframe (typically 5 working days for initial assessment).

### Case Investigation

Cases are assigned to an investigator who is independent of the subject of the report. Independence is essential: the ABMS Officer must not investigate a report concerning their own conduct, and the investigator must not be a direct report of the subject. The investigation is documented in IMS with a structured investigation log.

### Confidentiality Obligations

All personnel involved in handling speak-up reports are bound by strict confidentiality obligations. The identity of the reporter and the subject is protected throughout the investigation. Access to case records in IMS is restricted to the investigator, ABMS Officer, and senior management on a need-to-know basis.

### Reporter Protection (Non-Retaliation)

The non-retaliation policy protects reporters from adverse employment action as a result of making a good-faith report. Retaliation is itself a disciplinary offence. IMS tracks the employment status of reporters (where identifiable) for 12 months after their report to detect any retaliation patterns.

### Case Classification

On completion of investigation, classify the case: Substantiated (evidence supports the allegation), Unsubstantiated (no supporting evidence found), or Outside Scope (not an anti-bribery matter; refer to the appropriate function). All three classifications receive a written outcome communicated to the reporter where they are identifiable.

### Case Statistics

The speak-up statistics — number of reports, resolution rate, average response time, and anonymity rate — are reported at management review. An increase in reports generally reflects a positive culture of speaking up, not an increase in wrongdoing.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-37001', 'anti-bribery', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-007',
    title: 'Anti-Bribery Compliance Reporting',
    content: `## Anti-Bribery Compliance Reporting

Reporting on ABMS performance provides accountability for top management and the board and supplies the evidence base for ISO 37001 certification.

### ABMS Performance Indicators

Track the following KPIs in IMS:

- **Due Diligence Completion Rate** — percentage of business partners with current due diligence on file
- **Training Compliance Rate** — percentage of staff in at-risk roles with current anti-bribery training
- **Gifts Register Completeness** — percentage of gifts and hospitality items approved within policy
- **Policy Acknowledgement Rate** — percentage of all staff who have acknowledged the current anti-bribery policy
- **Open Investigations** — number of speak-up cases in the investigation phase
- **Average Investigation Resolution Time** — days from report to outcome; target typically within 60 days
- **Red Flag Resolution Time** — days from due diligence red flag identification to outcome decision

### Management Review Inputs

The ABMS Officer generates a formatted management review input report from IMS. This covers all KPIs for the period, a summary of speak-up reports received and their outcomes, due diligence activity and outcomes, training programme results, and any significant regulatory developments in anti-bribery law affecting the organisation.

### Board and Audit Committee Report

For organisations with board-level oversight of ABMS, IMS generates a concise board-level report: overall ABMS health status, key risk areas, incidents, and key improvement actions. The report is formatted for board consumption — no tables of raw data; instead, trend charts and management commentary.

### Regulatory Compliance

Anti-bribery laws in most jurisdictions include a defence available to organisations that have implemented adequate procedures to prevent bribery (UK Bribery Act Section 7 defence, equivalent FCPA compliance programme defence). ABMS documentation in IMS provides the evidence of adequate procedures.

### External Audit Support

Prepare for ISO 37001 certification body audits by generating the ABMS Evidence Pack: risk assessment, due diligence records, gifts register, training records, speak-up statistics, management review records, and the ABMS Officer appointment documentation. Export this pack as a structured PDF for the auditor.

### Annual Compliance Certificate

The ABMS Officer signs an annual compliance certificate confirming that the ABMS has been operational during the period, has been audited internally, and that no unresolved significant ABMS deficiencies have been identified. This certificate is retained in IMS and provided to major customers and partners who require evidence of the organisation's anti-bribery programme.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-37001', 'anti-bribery', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-008',
    title: 'ISO 37001 Anti-Bribery Best Practices',
    content: `## ISO 37001 Anti-Bribery Best Practices

ISO 37001:2016 provides the international framework for anti-bribery management. Implementing it effectively requires both robust processes and a genuine organisational commitment to integrity.

### ISO 37001 Key Requirements

The standard requires:

- **Top Management Commitment** — the board and senior leadership must demonstrate visible, personal commitment to anti-bribery
- **Anti-Bribery Policy** — a clear policy approved by top management and communicated to all personnel
- **ABMS Officer** — a named, senior individual with independence to exercise oversight of the ABMS
- **Risk Assessment** — a documented bribery risk assessment forming the basis of the control programme
- **Due Diligence** — proportionate due diligence on business partners
- **Financial Controls** — segregation of duties, approval limits, expense controls designed to prevent bribery facilitation
- **Training** — proportionate training for all personnel and at-risk roles
- **Reporting Mechanism** — confidential speak-up channel
- **Investigation** — documented investigation procedures for bribery allegations
- **Continual Improvement** — use of audit findings, incident learning, and management review to improve the ABMS

### Culture of Integrity

An anti-bribery policy alone does not prevent bribery — organisational culture does. Leaders who model ethical behaviour, who refuse commercial opportunities that compromise integrity, and who reward ethical decision-making over short-term revenue send a clear signal throughout the organisation.

### Zero-Tolerance Communication

Communicate zero tolerance for bribery consistently and repeatedly: in induction, in annual training, in team meetings, in commercial proposals, and in business partner communications. Inconsistency between policy and leadership behaviour destroys the credibility of the ABMS.

### Proportionate Approach

ISO 37001 requires that controls be proportionate to the organisation's bribery risk. A small domestic company with no public-sector contracts does not need the same ABMS complexity as a multinational infrastructure firm. Calibrate your investment to actual risk.

### Practical Training

Anti-bribery training is most effective when scenario-based. Present employees with realistic situations they may encounter in their roles — a supplier offering tickets to a sporting event, a customs official asking for a payment — and guide them through the correct response. Abstract policy training is quickly forgotten; scenario training builds judgment.

### Maintaining ISO 37001 Certification

Certification requires annual surveillance audits and a recertification audit every three years. Maintain continuous ABMS performance data in IMS so that evidence is always available and up to date. Address audit findings promptly and use them to drive genuine improvement.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-37001', 'anti-bribery', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },

  // ─── SUPPLIER MANAGEMENT MODULE ──────────────────────────────────────────
  {
    id: 'KB-DD7-009',
    title: 'Supplier Management Day-to-Day User Guide',
    content: `## Supplier Management Day-to-Day User Guide

The Supplier Management module provides a complete platform for managing your supplier base from initial qualification through ongoing performance management and development. This guide covers the routine tasks performed by procurement and supply chain managers.

### Daily Supplier Management Tasks

Begin each day by reviewing the supplier dashboard for time-sensitive items:

- **Supplier Performance Data** — new performance scorecards or exception reports requiring review
- **Document Expiry Alerts** — supplier insurance certificates, quality certifications, or other documents approaching expiry
- **Re-Evaluation Schedule** — suppliers due for periodic re-evaluation this month
- **Open Non-Conformances** — quality or delivery non-conformances raised against suppliers that require follow-up

### Supplier Dashboard Overview

The dashboard provides four key panels:

- **Approved vs Unapproved** — the proportion of your supplier base that is fully approved vs pending qualification
- **Upcoming Re-Evaluations** — suppliers due for periodic re-evaluation in the next 30, 60, and 90 days
- **Performance Scores** — average performance score across strategic and preferred supplier categories
- **Open Non-Conformances** — count of unresolved supplier quality or delivery failures

### Quick Actions

From the toolbar:

- **Add Supplier** — register a new supplier and initiate the qualification workflow
- **Log Performance Issue** — record a specific delivery, quality, or compliance failure against a supplier
- **Schedule Audit** — plan a supplier audit and send notification

### Supplier Search and Filter

Use the supplier search to locate supplier records quickly by name, category, country, approval status, or performance tier. Save frequently used search filters as views for one-click access during busy periods.

### Processing Enquiries

When a supplier submits a qualification document (insurance renewal, updated certification), the enquiry queue shows documents awaiting review. Open each document, verify it meets requirements, and update the supplier record with the new expiry date and document version.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['suppliers', 'vendor-management', 'procurement'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-010',
    title: 'Supplier Onboarding & Qualification',
    content: `## Supplier Onboarding & Qualification

A structured supplier onboarding and qualification process ensures that only compliant, capable suppliers are approved for use. IMS manages the entire qualification lifecycle.

### Supplier Onboarding Process

The qualification process follows a defined workflow in IMS:

1. **Supplier Self-Registration** — the supplier completes an online registration form providing company details, contact information, and business category
2. **Documentation Submission** — the supplier uploads required qualification documents via the Supplier Portal
3. **Document Verification** — procurement reviews documents for completeness and validity
4. **Evaluation** — the supplier is scored against qualification criteria
5. **Approval Decision** — approved, conditionally approved, or rejected with documented rationale

### Required Documentation

Configure the required documents per supplier category:

- **Company Registration** — verified legal entity and registration number
- **Insurance Certificates** — public liability, employers' liability, professional indemnity as applicable
- **Quality Certifications** — ISO 9001 or sector-specific quality certification
- **Financial Information** — recent accounts or credit reference for significant-value suppliers
- **Environmental Policy** — required for suppliers in sectors with significant environmental impact
- **H&S Policy** — required for suppliers providing on-site services

### Approval Criteria

Each supplier category has defined minimum scores and mandatory document requirements. A supplier that does not meet minimum criteria cannot be approved. Define criteria in the module configuration for each category.

### Conditional Approval

Where a supplier meets most criteria but has one outstanding item (e.g., insurance renewal pending), conditional approval allows commercial engagement to proceed for a specified period while the outstanding item is resolved. Conditional approval has a hard expiry date; if not resolved, the supplier reverts to unapproved status automatically.

### Supplier Categories

IMS uses a tiered category system:

- **Strategic** — critical, long-term partners requiring the highest level of management
- **Preferred** — approved suppliers with demonstrated performance track record
- **Approved** — qualified suppliers who have met minimum requirements
- **Conditional** — approved with specific outstanding conditions
- **Blacklisted** — permanently excluded due to serious compliance failure, fraud, or significant quality failure

### Supplier ID and Code Assignment

On approval, IMS assigns a unique supplier ID and generates a supplier code for use in procurement systems. These are linked to the supplier record for all subsequent transactions.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['suppliers', 'vendor-management', 'procurement'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-011',
    title: 'Supplier Risk Assessment',
    content: `## Supplier Risk Assessment

A supplier risk assessment evaluates the risks that each supplier relationship presents to your organisation across multiple dimensions. Risk-based supplier management concentrates resources on the highest-risk suppliers.

### Risk Dimensions

IMS evaluates supplier risk across seven dimensions:

1. **Financial Stability** — is the supplier financially viable and unlikely to fail?
2. **Supply Chain Resilience** — does the supplier have redundant capacity, alternative sources, and robust business continuity plans?
3. **Quality Capability** — does the supplier have the quality management systems to consistently deliver conforming product or service?
4. **Regulatory Compliance** — is the supplier compliant with applicable regulations in their country and sector?
5. **ESG Performance** — does the supplier meet minimum standards on environmental, social, and governance performance?
6. **Geographic Risk** — is the supplier in a country or region with elevated political, economic, or natural disaster risk?
7. **Single-Source Risk** — are you sole-sourcing from this supplier with no alternative qualified?

### Risk Scoring Methodology

Each dimension is scored 1–5 using the criteria defined in your organisation's supplier risk policy. IMS calculates a weighted composite risk score and classifies each supplier as: Low Risk, Medium Risk, High Risk, or Critical Risk.

Weight each dimension according to your procurement priorities — most organisations weight financial stability, supply chain resilience, and quality capability most heavily.

### Risk-Based Monitoring

Apply monitoring intensity proportional to risk:

- **Critical Risk suppliers** — monthly performance review, quarterly relationship meetings, annual on-site audit
- **High Risk suppliers** — quarterly performance review, semi-annual audit
- **Medium Risk suppliers** — annual performance evaluation
- **Low Risk suppliers** — triennial evaluation

### Supply Chain Disruption Risk

For critical and high-risk suppliers, request Business Continuity Plans and Recovery Time Objectives. Review these annually and test them as part of your own business continuity exercises.

### ESG Risk Assessment

ESG risk in the supply chain is increasingly subject to regulatory requirements (EU Corporate Sustainability Due Diligence Directive and similar). IMS includes an ESG scoring module that evaluates environmental practices, labour standards, and governance quality across your supplier base.

### Supplier Risk Heat Map

The supplier risk heat map provides a portfolio view: a two-axis plot of spend level versus risk score. Suppliers with high spend and high risk are your priority for risk mitigation investment.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['suppliers', 'vendor-management', 'procurement'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-012',
    title: 'Supplier Performance Evaluation',
    content: `## Supplier Performance Evaluation

Regular supplier performance evaluation is a requirement of ISO 9001, ISO 14001, and ISO 45001. It ensures that external providers continue to meet your requirements and provides data to support supplier development.

### Performance Criteria

Define the performance criteria relevant to your supplier categories:

- **On-Time Delivery** — percentage of deliveries arriving on or before the agreed date
- **Quality** — defect rate, incoming inspection pass rate, PPM (parts per million defective)
- **Responsiveness** — response time to enquiries, complaints, and technical requests
- **Value for Money** — price competitiveness and cost reduction initiatives
- **Innovation** — proactive improvement suggestions and new product or service proposals
- **Sustainability** — environmental and social performance improvements

Weight criteria based on what matters most for each supplier category. Quality and delivery typically carry the highest weight for manufacturing suppliers.

### Evaluation Frequency

- **Strategic Suppliers** — monthly scorecard plus quarterly relationship management meeting
- **Preferred Suppliers** — quarterly scorecard
- **Approved Suppliers** — annual evaluation

IMS schedules evaluations automatically and notifies the responsible buyer when an evaluation is due.

### Evaluation Data Sources

IMS draws on multiple data sources for the supplier evaluation:

- **Purchasing data** — on-time delivery calculated from order dates and actual receipt dates
- **Incoming Inspection** — quality results from goods-received inspections
- **Complaints** — customer complaints attributed to supplier failure
- **Survey** — annual supplier survey for qualitative performance assessment

### Supplier Scorecard

The scorecard presents the overall performance score (0–100) and a breakdown by criterion. Trend charts show performance over the past 12 months. A comparison against the category average benchmarks the supplier against peers.

### Performance-Based Consequences

Performance scores determine tier movement:

- Sustained high performance → elevation to Preferred or Strategic status
- Declining performance → demotion from Strategic to Preferred
- Persistent poor performance → placement on an Improvement Programme
- Serious quality or compliance failure → suspension pending investigation

All tier changes are recorded in IMS with the rationale and communicated formally to the supplier.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['suppliers', 'vendor-management', 'procurement'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-013',
    title: 'Supplier Audit Management',
    content: `## Supplier Audit Management

Supplier audits provide first-hand verification of supplier capability and compliance. IMS manages the supplier audit lifecycle from planning through follow-up.

### Supplier Audit Types

Different audit types serve different purposes:

- **Quality System Audit** — evaluates whether the supplier's quality management system is effectively implemented; typically references ISO 9001
- **Environmental Audit** — assesses the supplier's environmental management practices and compliance with environmental legislation
- **Health & Safety Audit** — evaluates occupational health and safety management, particularly for on-site service providers
- **ESG Audit** — assesses environmental, social, and governance performance against your supply chain code of conduct
- **Process Audit** — evaluates a specific production or service delivery process at the supplier's facility

### Audit Planning

Create a risk-based supplier audit schedule in IMS at the start of each year. Critical and high-risk suppliers receive annual audits. Medium-risk suppliers are audited every two to three years. Low-risk suppliers are audited only when triggered by a performance concern.

### Audit Notification

Send a formal audit notification to the supplier at least four weeks before the planned date. The notification specifies: the audit scope, the standards or code of conduct being assessed, the audit team composition, documents required in advance, and the on-site agenda. IMS generates the notification letter automatically from the audit record.

### Remote vs On-Site Audits

Remote audits (via video conference and document review) are appropriate for: initial qualification of low-risk suppliers, follow-up verification of corrective actions, and geographically remote suppliers with low risk profiles. On-site audits are required for: high-risk supplier qualification, process-specific assessments, and investigations of serious quality or compliance failures.

### Audit Findings

Record audit findings in IMS using the standard classification:

- **Major Non-Conformance** — a significant failure that threatens product conformity or regulatory compliance; requires a formal CAPA with a 30-day corrective action deadline
- **Minor Non-Conformance** — a process gap that does not immediately threaten conformity; requires a corrective action within 60 days
- **Observation** — an improvement opportunity noted for the supplier's consideration

### Corrective Action and Re-Audit

Share findings with the supplier immediately after the audit. The supplier submits a corrective action plan within the required timeframe. IMS tracks the corrective action plan until all actions are verified as implemented. For major non-conformances, a follow-up audit (remote or on-site) confirms implementation.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['suppliers', 'vendor-management', 'procurement'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-014',
    title: 'Supplier Contract & Terms Management',
    content: `## Supplier Contract & Terms Management

Effective supplier contracts define the terms of the commercial relationship and provide the legal framework for enforcing performance and compliance requirements. IMS integrates supplier contract management with the broader supplier governance programme.

### Standard Terms and Conditions

Your organisation's standard purchase terms and conditions are stored in IMS and linked to the Contract Management module. All purchase orders issued through the procurement system reference the standard terms. IMS alerts when a supplier attempts to substitute their own terms during the ordering process.

### Supplier-Specific Agreements

For strategic and preferred suppliers, additional agreements supplement the standard terms:

- **Quality Agreement** — specifies quality requirements, inspection criteria, non-conformance notification obligations, and CAPA requirements
- **Service Level Agreement (SLA)** — defines measurable service delivery standards with response and resolution time commitments
- **Confidentiality Agreement (NDA)** — protects proprietary information shared during the commercial relationship
- **Framework Agreement** — sets pricing, terms, and volumes for a defined period without individual purchase orders

### Anti-Bribery Clauses

In line with ISO 37001, all significant supplier contracts must include anti-bribery clauses: the supplier confirms compliance with applicable anti-bribery legislation, agrees to maintain adequate anti-bribery procedures, and consents to the organisation's right to audit compliance and terminate the contract for bribery violations.

### Supply Continuity Requirements

For critical suppliers, include supply continuity obligations: the supplier must maintain a business continuity plan, notify you of any event threatening supply within a specified timeframe, and maintain safety stock levels agreed in advance.

### Data Protection Obligations

Where suppliers process personal data on your behalf, a Data Processing Agreement (DPA) is mandatory under GDPR and equivalent regulations. IMS tracks DPA status for all suppliers handling personal data and alerts when a DPA expires or requires review.

### Contract Performance Monitoring

Link supplier performance KPIs to contractual SLA targets in IMS. When performance falls below the contractual threshold, IMS generates a performance notice automatically. Persistent failures trigger the formal dispute resolution procedure or contract termination workflow, both documented in IMS.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['suppliers', 'vendor-management', 'procurement'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-015',
    title: 'Supplier Reporting & Dashboard',
    content: `## Supplier Reporting & Dashboard

The Supplier Management reporting suite provides comprehensive visibility of your supply base for procurement management, compliance teams, and senior leadership.

### Supplier Portfolio Report

The supplier portfolio report provides a complete view of your supply base:

- Total supplier count by approval status (Strategic, Preferred, Approved, Conditional, Blacklisted)
- Geographic distribution: suppliers by country and region
- Category breakdown: suppliers by procurement category
- Spend distribution: total annual spend by supplier and category

This report is used for supply base rationalisation decisions and procurement strategy planning.

### Supplier Performance League Table

The performance league table ranks all evaluated suppliers by composite performance score. Filter by category, region, or time period. Identify consistently high-performing suppliers for recognition and deeper partnership, and consistently poor-performing suppliers for intervention.

### Supply Chain Risk Report

The risk report surfaces high-risk suppliers and their mitigation status:

- Suppliers classified as Critical or High Risk
- Open risk treatment actions and their due dates
- Single-source dependencies with no qualified alternative supplier
- Suppliers with recent adverse media alerts

### Audit Schedule Compliance

Track the proportion of planned supplier audits completed on schedule. An audit schedule compliance below target indicates either resource constraints or supplier non-cooperation — both require management attention.

### Supplier Development Report

The supplier development report tracks improvement programmes in progress:

- Suppliers on formal improvement plans with progress percentage
- Corrective actions from supplier audits by status
- Year-on-year performance improvement by supplier

### ESG Supply Chain Report

For sustainability reporting (GRI, TCFD, CDP), the ESG supply chain report summarises:

- Percentage of spend covered by ESG-assessed suppliers
- Suppliers meeting minimum ESG standards vs those with open improvement actions
- Carbon intensity of key suppliers (where data is provided)

### Spend Analysis

The spend analysis report shows total spend by supplier and category for the year to date and prior year comparison. Identify spend concentration risk (excessive dependence on a single supplier) and opportunities for category consolidation.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['suppliers', 'vendor-management', 'procurement'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-016',
    title: 'Supplier Management Best Practices',
    content: `## Supplier Management Best Practices

Effective supplier management goes beyond compliance and qualification. The best supplier programmes build collaborative relationships that create mutual value and sustainable supply chain performance.

### Supplier Segmentation

Not all suppliers deserve equal management attention. Segment your supply base using a portfolio analysis (e.g., Kraljic matrix):

- **Strategic suppliers** — high spend, high supply risk; require active relationship management, joint planning, and executive engagement
- **Leverage suppliers** — high spend, low supply risk; competitive sourcing to maximise value
- **Bottleneck suppliers** — low spend, high supply risk; ensure supply continuity through inventory, dual-sourcing, or long-term contracts
- **Non-critical suppliers** — low spend, low risk; automate management, reduce transaction cost

Concentrate your supplier management investment on Strategic and Bottleneck categories.

### Supplier Development

For strategic and preferred suppliers, invest in capability building. Joint improvement programmes, technical assistance, and shared training improve supplier performance and deepen the relationship. Suppliers who receive development support typically demonstrate greater loyalty and priority treatment during supply shortages.

### Collaborative Relationships

Move from a transactional to a collaborative mindset with key suppliers. Share demand forecasts to enable better planning, involve suppliers in new product development (early supplier involvement), and create joint innovation programmes. Collaboration unlocks value that adversarial relationships leave on the table.

### Supply Chain Visibility

Map your supply chain beyond tier 1 suppliers. Many significant supply chain risks — labour rights abuses, environmental violations, concentration risk — reside at tier 2 and tier 3. IMS allows you to build a multi-tier supply chain map using supplier-provided data.

### Responsible Sourcing

Embed ethical, environmental, and social standards in your supply chain code of conduct and enforce them through the audit and qualification programme. Responsible sourcing is increasingly expected by customers, investors, and regulators as well as being the right thing to do.

### Total Cost of Ownership

Evaluate suppliers on total cost of ownership (TCO), not unit price alone. A supplier with a lower unit price but poor delivery reliability, high defect rate, or significant management overhead may cost more in practice. TCO analysis in IMS includes: purchase price, inbound logistics, inspection cost, defect-related rework, line stoppages, and supplier management overhead.

### Supplier Relationship Management Principles

The most effective supplier relationships are built on: clear and consistent communication, transparent performance feedback (good and bad), honouring commitments, fair treatment in commercial negotiations, and recognition of excellent performance. Treat suppliers as you would want to be treated as a customer.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['suppliers', 'vendor-management', 'procurement'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },

  // ─── ANALYTICS MODULE ─────────────────────────────────────────────────────
  {
    id: 'KB-DD7-017',
    title: 'Analytics Day-to-Day User Guide',
    content: `## Analytics Day-to-Day User Guide

The Analytics module transforms IMS data into actionable insights through dashboards, reports, and data exploration tools. This guide covers the daily workflow for users who rely on analytics to monitor performance and make decisions.

### Daily Analytics Workflow

Most users begin their day with a set of saved dashboard views relevant to their role:

- **KPI Dashboards** — key performance indicators for the processes or modules they manage
- **Scheduled Reports** — reports that arrive in their inbox on a daily, weekly, or monthly schedule
- **Alert Notifications** — metrics that have crossed a threshold since the previous view

### Analytics Module Overview

The module has four main sections:

- **Dashboards** — visual displays of key metrics combining multiple widgets
- **Report Builder** — a flexible tool for creating tabular and chart-based reports
- **Data Explorer** — a query interface for ad-hoc data investigation
- **Scheduled Reports** — a manager for automated report generation and distribution

### Filtering and Date Range Selection

All dashboards and reports support global filtering. Use the date range selector at the top of any view to switch between: today, this week, this month, this quarter, this year, or a custom date range. Apply module or organisational unit filters to restrict data to the area you manage. Saved filter presets mean you do not need to reapply filters each session.

### Exporting Data

Choose the right export format for your purpose:

- **Dashboard Screenshot** — a PDF image of the current dashboard view, suitable for presentations
- **Underlying Data CSV** — the raw data behind any widget, suitable for further analysis in Excel
- **Formatted PDF Report** — a professionally formatted report with your organisation's branding

### Bookmarking and Sharing

Bookmark your most-used dashboards and report views for one-click access. Share a dashboard with colleagues by sending a direct link — recipients with appropriate access will see the same view. Use the **Share as Public** option to create a read-only link that does not require IMS login.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['analytics', 'reporting', 'dashboards', 'bi'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-018',
    title: 'Building Custom Dashboards',
    content: `## Building Custom Dashboards

Custom dashboards let you assemble the metrics that matter most for your role into a single, personalised view. IMS provides a drag-and-drop dashboard builder with a rich library of widget types.

### Dashboard Creation

Click **New Dashboard** and complete the setup form:

- **Name** — a descriptive name for the dashboard (e.g., 'H&S KPI Overview', 'Monthly Quality Review')
- **Description** — optional context for other users
- **Audience** — Personal (only you), Team (shared with your team), or Organisation (visible to all users with access)
- **Data Sources** — the IMS modules you will draw data from

### Widget Types

Choose from a library of widget types:

- **KPI Tile** — a single number with trend indicator (up/down vs prior period); ideal for headline metrics
- **Line Chart** — trends over time; best for metrics you monitor continuously
- **Bar Chart** — comparison between categories or time periods
- **Pie or Donut Chart** — proportional composition; use sparingly (more than five segments becomes hard to read)
- **Table** — structured data with sortable columns; for detailed breakdowns
- **Heatmap** — density or intensity across two dimensions (e.g., incident count by department and month)
- **Gauge** — current value against a target; for metrics with a defined goal
- **Map** — geographic distribution of data by site or region

### Adding and Configuring Widgets

Click **Add Widget**, select the widget type, then configure:

- **Data Source** — the IMS module and data table
- **Metric** — the specific field or calculated measure to display
- **Filter** — limit the data (e.g., only show High severity incidents)
- **Time Period** — the date range for the data
- **Aggregation** — sum, count, average, minimum, maximum

### Dashboard Layout

Arrange widgets using drag-and-drop. Resize by dragging the widget corner. A common layout convention: most important KPI tiles across the top row, supporting trend charts in the middle, and detailed tables at the bottom.

### Dashboard Filters

Add global dashboard filters — controls that users can adjust to filter all widgets simultaneously. Useful filters: date range, organisational unit, module-specific categories. Global filters reduce the need to configure each widget separately.

### Refresh Rate

Configure how often dashboard data refreshes: real-time (suitable for operational monitoring), every 15 minutes, hourly, or cached (daily, on-demand). Real-time refresh increases database load; use cached refresh for routine dashboards.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['analytics', 'reporting', 'dashboards', 'bi'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-019',
    title: 'Report Builder Guide',
    content: `## Report Builder Guide

The Report Builder provides a no-code interface for creating structured reports from IMS data. From simple tabular lists to complex cross-tabulated summaries, the builder handles a wide range of reporting needs without requiring SQL knowledge.

### Report Types

Choose the appropriate report type before building:

- **Tabular Report** — a list of records with selected fields as columns; the most flexible and widely used type
- **Summary Report** — a tabular report with grouping and subtotals; ideal for aggregated views (e.g., incidents by department)
- **Matrix Report** — a cross-tabulation showing metrics at the intersection of two dimensions (e.g., incident count by month and by severity)
- **Chart Report** — a chart-first report where the visualisation is the primary output

### Selecting Data Sources

Choose the primary data source (the IMS module and data table). For cross-module reports, add secondary data sources and define how they join to the primary source. Common joins: incidents linked to corrective actions, training completions linked to employees, supplier non-conformances linked to supplier records.

### Fields and Columns

Select the fields to include in the report. For tabular reports, each field becomes a column. Reorder columns by dragging them in the field list. Rename column headers to use business-friendly labels.

### Applying Filters

Add filters to restrict the report to relevant data:

- **Value Filter** — match a specific field value (e.g., Status = 'Open')
- **Date Filter** — restrict to a date range (e.g., Created between 01/01/2025 and 31/12/2025)
- **Relative Date Range** — this month, last quarter, year to date — updates automatically as time passes
- **User Context Filter** — restrict to records owned by the current user (useful for personal task reports)

### Grouping and Aggregation

Group the report by one or more dimensions and apply aggregate functions to numeric fields: Sum, Count, Average, Minimum, Maximum. Use Count for non-numeric fields (e.g., count of incidents per department).

### Sorting, Ranking, and Calculated Fields

Sort by any column ascending or descending. Use the Top N filter to show only the top or bottom N records by a given metric.

Create calculated fields using formulas combining existing numeric fields: for example, a 'Days to Close' field calculated as the difference between 'Open Date' and 'Close Date'. Calculated fields appear as regular columns in the report.

### Preview and Save

Click **Preview** to check the report output before saving. Adjust fields, filters, and grouping as needed. Save the report with a name, description, and visibility setting.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['analytics', 'reporting', 'dashboards', 'bi'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-020',
    title: 'Data Visualisation Best Practices',
    content: `## Data Visualisation Best Practices

Effective data visualisation communicates insight quickly and clearly. Poor visualisation obscures meaning, misleads viewers, or simply fails to inform decisions. These principles apply across all IMS dashboard and report design.

### Choosing the Right Chart Type

The single most important decision in data visualisation is chart type selection:

- **Bar chart** — use for comparing discrete categories or values at a point in time. Works for both small and large category counts.
- **Line chart** — use for trends over time. Implies continuity between data points; do not use for unordered categories.
- **Pie or donut chart** — use only for showing composition of a whole, and only when you have five or fewer categories. More than five slices become impossible to interpret.
- **Scatter plot** — use for showing the relationship (correlation) between two numeric variables.
- **Heatmap** — use for showing density or intensity across two categorical dimensions, such as incident count by department and month.
- **Gauge** — use for showing current performance against a single target. Do not use gauges as a primary chart on a data-rich dashboard.

### Colour Best Practices

Colour choice significantly affects how a visualisation is interpreted:

- Use a consistent colour coding system across all dashboards: the same colour always means the same thing
- Use traffic-light colours (red/amber/green) only for status indicators; avoid them in charts where they carry no status meaning
- Consider colour-blind viewers: approximately 8% of men have red-green colour blindness. Use blue-orange palettes as a safe alternative to red-green
- Limit the number of colours in a single chart to seven or fewer; more colours are cognitively difficult to track

### Labels and Annotations

Decide deliberately when to label data points versus relying on axes:

- Label individual data points when the chart has fewer than 10 points and the exact values matter
- Rely on axes when you have many data points and the trend matters more than individual values
- Add annotations to mark significant events: regulatory changes, process improvements, major incidents

### Dashboard Layout

Follow a consistent layout hierarchy: the most important headline metric top-left (where the eye naturally starts), supporting context metrics across the top row, trend charts in the main body, and detailed data tables at the bottom for users who want to drill into specifics.

### Storytelling with Data

A well-designed dashboard leads the viewer to the key insight without requiring them to search for it. Use titles that state the conclusion ('Incident Rate Down 23% Year on Year'), not just the metric ('Incident Rate'). Add brief annotations explaining why a metric changed, not just that it changed.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['analytics', 'reporting', 'dashboards', 'bi'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-021',
    title: 'Cross-Module Analytics & Data Sources',
    content: `## Cross-Module Analytics & Data Sources

One of the most powerful capabilities of the IMS Analytics module is the ability to combine data from multiple management system modules into a single analysis. Cross-module insights reveal patterns and relationships that single-module reports cannot show.

### Available Cross-Module Data

The Analytics module can draw data from any IMS module to which you have access:

- Health & Safety — incidents, risk assessments, legal requirements, objectives
- Environment — environmental aspects, events, legal obligations, objectives
- Quality — non-conformances, CAPAs, customer complaints, audit findings
- HR — employee records, training completions, competency status
- Finance — costs, budgets, project spend
- Supplier Management — performance scores, non-conformances, audit findings
- Training — training completions, competency records

### Joining Data Across Modules

To join data from two modules, select both as data sources and define the relationship. Common joins:

- **Incidents linked to CAPAs** — identify which incidents have generated corrective actions and track their status
- **Training records linked to employees** — show training compliance by department, site, or role
- **Supplier non-conformances linked to supplier records** — rank suppliers by quality failure frequency

### Enterprise KPI Dashboards

Senior leaders benefit from an integrated view of management system performance across all modules. An enterprise KPI dashboard might show on a single screen: total incidents (H&S), environmental events (Env), customer complaints (Quality), audit overdue items (Audit), and open objectives (all modules). This provides a comprehensive management system health check in one view.

### Common Cross-Module Analyses

**Incident Cost Analysis** — join H&S incidents with Finance data to calculate the total cost of incidents (direct costs: treatment, repair; indirect costs: investigation, downtime, productivity loss). Demonstrates the financial case for H&S investment.

**Training Compliance by Department** — join HR department data with Training completion records to show which departments have the highest and lowest training compliance rates. Enables targeted intervention.

**Supplier Quality Cost** — join Quality NCR data with Supplier records and Finance data to show the total cost of supplier-related quality failures by supplier. Supports TCO analysis and supplier development prioritisation.

### Data Freshness

Each module's data refreshes on a different schedule. The Data Sources panel in Analytics shows the last refresh time for each connected module, helping you assess the currency of your analysis.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['analytics', 'reporting', 'dashboards', 'bi'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-022',
    title: 'Scheduled Reports & Distribution',
    content: `## Scheduled Reports & Distribution

Scheduled reports automate the delivery of regular management information, ensuring stakeholders receive timely data without needing to log in and run reports manually.

### Creating a Scheduled Report

Navigate to **Analytics → Scheduled Reports → New Schedule**. Complete the setup form:

- **Report** — select the saved report or dashboard you want to schedule
- **Format** — choose the delivery format: PDF (formatted for reading), CSV (data for further analysis), or Excel (data with basic formatting)
- **Frequency** — daily, weekly (specify day of week), monthly (specify day of month), or quarterly
- **Time** — specify the delivery time; schedule data-intensive reports during off-peak hours
- **Recipients** — add individual users or distribution groups

### Recipient Management

Add recipients by IMS user (they must have appropriate data access permissions) or by email address (for external recipients such as board members or auditors). Create distribution groups for recurring recipient sets (e.g., the Safety Leadership Team) to simplify management.

### Report Delivery

Scheduled reports are delivered by email as an attachment (PDF, CSV, or Excel) or as a link to the report in IMS. Link delivery is preferred for large reports, as email attachments are limited to 25 MB.

### Report Archive

Every generated scheduled report is stored in the **Report Archive** in IMS, accessible from the scheduled report record. The archive is searchable by date and report name. This provides an audit trail of what information was distributed and when.

### Conditional Scheduling

Configure reports to deliver only when the data meets a threshold condition: send the weekly incident summary report only if the incident count for the period is greater than zero; send the overdue actions report only if there are actions more than seven days overdue. Conditional scheduling reduces report fatigue — recipients receive reports only when there is something meaningful to read.

### Report Pause and Delivery Failure Notification

Pause a scheduled report temporarily without deleting it — useful during system maintenance periods or holiday shutdowns. If a scheduled report fails to generate (due to a data source error or permission issue), the report owner receives an immediate failure notification with the error description, enabling quick resolution.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['analytics', 'reporting', 'dashboards', 'bi'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-023',
    title: 'Analytics API & Data Export',
    content: `## Analytics API & Data Export

For organisations that need to integrate IMS data with external business intelligence tools, data warehouses, or custom applications, the Analytics API provides programmatic access to IMS data.

### Analytics REST API

The Analytics REST API exposes IMS data through standard HTTP endpoints. All API calls require authentication using a Bearer token with the 'analytics:read' scope. Obtain API tokens from **Settings → API Access → Generate Token**.

### Available Endpoints

The API exposes three categories of endpoints:

- **Dashboards** — retrieve dashboard definitions and widget data
- **Reports** — run saved reports and receive results in JSON format
- **Raw Data Queries** — parameterised queries against IMS module data tables

Full API documentation is available at '/api/analytics/docs' in your IMS instance, including interactive examples using the Swagger UI.

### Rate Limiting

API access is rate-limited to protect system performance. Default limits: 1,000 requests per hour per organisation, 100 requests per minute per token. For bulk data extraction, use the scheduled bulk export feature rather than high-frequency API polling.

### Data Export Formats

Choose the export format based on downstream use:

- **JSON** — structured data for application integration
- **CSV** — flat-file data for spreadsheet analysis or database import
- **Excel** — formatted workbook with column headers and basic styling
- **Parquet** — columnar format optimised for large-scale analytics and data warehouse loading

### Bulk Data Export

For loading IMS data into a data warehouse or data lake, use the **Bulk Export** function. Configure the modules to include, the date range, and the target format (typically Parquet or CSV). Bulk exports are generated asynchronously and made available for download or pushed to a configured object storage destination (AWS S3, Azure Blob, Google Cloud Storage).

### Webhook Delivery

Configure webhooks to push IMS data to external systems in real time or on a schedule. Events such as a new incident record, a closed corrective action, or a completed audit can trigger a webhook delivery to your nominated endpoint. Webhooks support HTTP POST with JSON payload and HMAC signature verification.

### BI Tool Integration

IMS provides pre-built connectors for the most popular BI tools. Connection guides are available in the IMS documentation for: Microsoft Power BI (using the Power BI REST API connector), Tableau (using the Web Data Connector), Looker (using the API connector), and Google Looker Studio (using the JSON data source).`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['analytics', 'reporting', 'dashboards', 'bi'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
  {
    id: 'KB-DD7-024',
    title: 'Analytics Best Practices',
    content: `## Analytics Best Practices

Analytics is most valuable when it drives decisions and actions, not just reporting. These best practices help organisations build a data-driven culture around the IMS Analytics module.

### Data Governance in Analytics

Define clearly who can access what data in Analytics. Apply the principle of least privilege: users should see data relevant to their role and no more. A line manager should see team-level data; a department head should see department-level data; the CEO should see organisation-level data. Configure role-based access controls in IMS to enforce these boundaries.

### Metric Definitions: Single Source of Truth

Agree on standard metric definitions across the organisation and encode them in IMS. 'What counts as an incident?' 'How is delivery performance calculated?' 'What is the base for calculating training compliance rate?' Inconsistent definitions lead to conflicting reports and erode confidence in analytics. Document agreed definitions in the IMS knowledge base.

### Using IMS Analytics Rather Than Spreadsheets

The most common analytics anti-pattern is maintaining parallel spreadsheets that duplicate IMS data. Spreadsheets diverge from the source of truth, are not version-controlled, and are error-prone. Mandate that management reporting uses IMS Analytics as the single source of truth. Invest time in building the IMS reports and dashboards that make spreadsheet alternatives redundant.

### Data Literacy Training

Analytics tools are only as useful as the users' ability to interpret the results correctly. Provide data literacy training to regular report users: how to interpret percentage changes, why absolute numbers can mislead without context, the difference between correlation and causation, and how to identify misleading chart design.

### Acting on Data

Ensure analytics drives action, not just reporting. Every significant KPI should have a defined owner, a target, and a clear process for what happens when the target is missed. If a dashboard metric is regularly below target but nothing changes, the analytics process is broken — the connection between data and decision needs to be investigated.

### Avoiding KPI Overload

More metrics is not better. A dashboard with 50 metrics becomes noise — people stop reading it. Limit operational dashboards to 10–15 carefully chosen, genuinely actionable metrics. Reserve detailed metrics for drill-down reports accessed when investigating a specific issue.

### Regular Analytics Review

Conduct a quarterly analytics review: which reports are being accessed and which are not? Retire unused reports to reduce maintenance overhead. Identify new questions that management cannot currently answer with the available dashboards, and build new reports to address them.

### Benchmarking

Use IMS Analytics to benchmark performance over time and, where data is available, across sites. Year-on-year comparison reveals the genuine trajectory of system performance. Multi-site comparison identifies top-performing sites whose practices can be shared across the organisation.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['analytics', 'reporting', 'dashboards', 'bi'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },
];
