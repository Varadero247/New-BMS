import type { KBArticle } from '../types';

export const moduleGuideArticles: KBArticle[] = [
  {
    id: 'KB-MG-001',
    title: 'Health & Safety Module (ISO 45001) Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['health-safety', 'iso-45001', 'setup', 'ohsms', 'incidents', 'risk'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Health & Safety Module (ISO 45001) Setup Guide

## Purpose

The Health & Safety module provides a complete Occupational Health & Safety Management System (OHSMS) aligned with ISO 45001:2018. It manages hazard identification, risk assessments, incidents, legal requirements, objectives, and corrective actions.

## ISO Standard Alignment

ISO 45001:2018 — Occupational Health and Safety Management Systems

Key clauses supported:
- Clause 4: Context of the organisation (legal requirements register)
- Clause 6: Planning (hazard identification, risk assessment, OHS objectives)
- Clause 8: Operation (incident reporting, PTW linkage)
- Clause 9: Performance evaluation (KPIs, compliance evaluation)
- Clause 10: Improvement (incidents, CAPAs, management review)

---

## Prerequisites

Before configuring this module, gather:
- List of workplace locations / sites
- Existing hazard register or risk assessment documentation
- Applicable health and safety legislation (local/national)
- Names and roles of H&S officers and managers
- Historical incident data (optional, for import)

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Health & Safety → Enable

The H&S module activates at port 3001 (web) and 4001 (API).

### 2. Configure Legal Requirements

  H&S → Legal Requirements → Add Requirement

Add the health and safety laws and regulations that apply to your organisation. For each requirement:
- Name of legislation / regulation
- Jurisdiction (country/region)
- Compliance obligation (MUST comply, SHOULD comply, MONITOR)
- Review frequency (annual, quarterly)
- Responsible person

> Tip: Use the Regulatory Monitor module (if enabled) to automatically receive alerts when legislation changes.

### 3. Define Hazard Categories

  H&S → Settings → Hazard Categories

Customise the list of hazard categories relevant to your workplace:
- Physical (noise, vibration, temperature)
- Chemical (substances, COSHH)
- Biological (pathogens, legionella)
- Ergonomic (manual handling, display screen)
- Psychosocial (stress, violence)

### 4. Create Your First Risk Assessment

  H&S → Risk Register → New Assessment

For each hazard:
1. Describe the hazard and affected persons
2. Assess likelihood (1–5) and severity (1–5)
3. System calculates risk score (likelihood × severity)
4. Add existing control measures
5. Assess residual risk after controls
6. Assign responsible person and review date

Risk scores:
- 1–4: LOW (green)
- 5–9: MEDIUM (amber)
- 10–16: HIGH (orange)
- 17–25: CRITICAL (red)

### 5. Configure Incident Reporting

  H&S → Settings → Incident Types

Define the incident categories relevant to your organisation:
- Near miss
- First aid incident
- Medical treatment incident
- Lost time incident
- Dangerous occurrence
- Reportable incident (RIDDOR in UK)

Set up incident notification rules:
  H&S → Settings → Notifications → Incident Alerts

Configure who receives alerts for each severity level (MINOR, MODERATE, MAJOR, CRITICAL, CATASTROPHIC).

### 6. Set OHS Objectives

  H&S → Objectives → New Objective

Create measurable safety objectives aligned with ISO 45001 Clause 6.2:
- Objective description
- Target metric and target value
- Measurement method
- Responsible person
- Target date and review frequency

Examples:
- "Reduce lost-time incident rate by 20% by Q4 2026"
- "Achieve 100% completion of mandatory safety training by Q2 2026"
- "Complete all high-risk risk assessments by March 2026"

### 7. Assign User Roles

  Settings → Users → [User] → Module Permissions → Health & Safety

Recommended role assignments:
- H&S Manager: permission level 5 (APPROVE)
- H&S Officer: permission level 3 (EDIT)
- Department Manager: permission level 3 (EDIT)
- All employees: permission level 2 (COMMENT) — to submit incident reports

---

## First Actions After Enabling

1. Create at least 3 risk assessments (one per major work area)
2. Add all applicable legal requirements
3. Report your first (or a historical) incident
4. Create 2-3 OHS objectives for the current year
5. Schedule the first internal OHS audit (see Audit Management module)

---

## Related Modules

- **Risk Management** — Feeds H&S risk assessments into the enterprise risk register
- **Incident Management** — Cross-module incident tracking
- **Audit Management** — Internal and external H&S audits
- **Training Management** — Safety training records and competency tracking
- **Permit to Work** — Hot work, confined space, electrical isolation permits
`,
  },

  {
    id: 'KB-MG-002',
    title: 'Environmental Management Module (ISO 14001) Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['environmental', 'iso-14001', 'setup', 'ems', 'aspects', 'sustainability'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Environmental Management Module (ISO 14001) Setup Guide

## Purpose

The Environmental Management module implements a complete Environmental Management System (EMS) aligned with ISO 14001:2015. It manages environmental aspects, impacts, legal obligations, events, objectives, and corrective actions.

## ISO Standard Alignment

ISO 14001:2015 — Environmental Management Systems

Key clauses supported:
- Clause 4.1/4.2: Context and interested parties (legal register)
- Clause 6.1: Environmental aspects and impacts, legal obligations
- Clause 6.2: Environmental objectives and planning
- Clause 8: Operational control and emergency response
- Clause 9: Monitoring, measurement, compliance evaluation
- Clause 10: Nonconformity and corrective action (CAPA)

---

## Prerequisites

- List of activities, products, and services your organisation provides
- Sites/locations to be covered by the EMS
- Environmental legislation applicable in your jurisdiction
- Historical environmental data (energy, water, waste, emissions) — optional
- Names of environmental manager and responsible persons per site

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Environmental Management → Enable

Module activates at port 3002 (web) and 4002 (API).

### 2. Register Environmental Aspects

  Environment → Aspects → New Aspect

An environmental aspect is any element of your organisation's activities, products, or services that can interact with the environment.

For each aspect:
- Activity or process generating the aspect
- Aspect type (emissions, effluents, waste, energy use, land contamination, etc.)
- Environmental impact (air quality, water quality, soil, climate, biodiversity)
- Conditions: Normal, Abnormal, Emergency
- Significance scoring (system-calculated):
  Score = (severity × 1.5) + (probability × 1.5) + duration + extent + reversibility + regulatory + stakeholder
  Significant if score ≥ 15

### 3. Add Legal Obligations

  Environment → Legal → Add Requirement

Record all environmental legislation, permits, consents, and voluntary commitments:
- Environmental Protection Act
- Water Resources Act / Clean Water Act
- Waste management regulations
- Air quality regulations
- Environmental permits (emissions to air, discharges to water)
- Site-specific planning conditions

### 4. Record Environmental Events

  Environment → Events → New Event

Log environmental incidents, near misses, and emergency responses:
- Event type (spill, emission exceedance, permit breach, near miss)
- Date and location
- Severity (MINOR → CATASTROPHIC)
- Immediate response taken
- Root cause analysis
- Corrective actions (links to CAPA module)

### 5. Set Environmental Objectives

  Environment → Objectives → New Objective

Create SMART environmental objectives aligned with ISO 14001 Clause 6.2:
- Scope (organisation-wide or site-specific)
- Target (e.g., "Reduce carbon emissions by 15% vs 2025 baseline")
- Measurement metric and baseline
- Milestone plan (add milestones with due dates)
- Responsible person

### 6. Configure CAPA

  Environment → CAPA → New CAPA

Link corrective and preventive actions to events and nonconformities:
- Root cause description
- Corrective action required
- Person responsible
- Target completion date
- Verification method

### 7. Assign User Roles

  Settings → Users → [User] → Module Permissions → Environment

Recommended assignments:
- Environmental Manager: level 5 (APPROVE)
- Environmental Officer: level 3 (EDIT)
- Site Manager: level 3 (EDIT)
- EHS staff: level 2 (COMMENT)

---

## Significance Scoring Reference

| Score Range | Significance | Action |
|-------------|-------------|--------|
| < 10 | Not Significant | Monitor |
| 10–14 | Borderline | Review annually |
| ≥ 15 | Significant | Operational control required |

---

## First Actions After Enabling

1. Register all significant environmental aspects (aim for at least 5)
2. Add applicable legal obligations (minimum 3)
3. Create at least 2 environmental objectives for the year
4. Log any historical incidents or near misses
5. Schedule your first environmental compliance evaluation

---

## Related Modules

- **ESG Reporting** — Uses environmental data for GHG and sustainability reporting
- **Energy Management** — Tracks energy consumption as an environmental aspect
- **Risk Management** — Environmental risks in the enterprise risk register
- **Audit Management** — ISO 14001 internal audits
- **Incident Management** — Cross-module environmental incident tracking
`,
  },

  {
    id: 'KB-MG-003',
    title: 'Quality Management Module (ISO 9001) Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['quality', 'iso-9001', 'setup', 'qms', 'nonconformance', 'capa'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Quality Management Module (ISO 9001) Setup Guide

## Purpose

The Quality Management module implements a Quality Management System (QMS) aligned with ISO 9001:2015. It manages quality plans, nonconformances, customer complaints, corrective actions, inspection records, and supplier quality.

## ISO Standard Alignment

ISO 9001:2015 — Quality Management Systems

Key clauses supported:
- Clause 4: Context (interested parties, scope)
- Clause 6: Planning (quality objectives, risk and opportunities)
- Clause 7: Support (documented information — links to Document Control)
- Clause 8: Operation (quality control, customer requirements, supplier management)
- Clause 9: Performance evaluation (audits, customer satisfaction, KPIs)
- Clause 10: Improvement (nonconformances, CAPA)

---

## Prerequisites

- Quality policy statement (approved by top management)
- List of products and/or services provided
- Customer requirements and specifications
- List of key suppliers and their quality performance data
- Names of quality manager and quality technicians/inspectors

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Quality Management → Enable

Module activates at port 3003 (web) and 4003 (API).

### 2. Define Quality Objectives

  Quality → Objectives → New Objective

Align with your quality policy. Each objective should be:
- Specific and measurable
- Linked to a KPI (e.g., customer complaint rate, first pass yield, on-time delivery)
- Assigned to a responsible person
- Reviewed at defined intervals

### 3. Configure Nonconformance Categories

  Quality → Settings → NCR Categories

Define the types of nonconformances your organisation tracks:
- Product nonconformance (out-of-spec product)
- Process nonconformance (procedure not followed)
- Supplier nonconformance (goods received not to spec)
- Customer complaint (raised by customer)
- Internal audit finding

### 4. Set Up Inspection Templates

  Quality → Inspection → Templates → New Template

Create inspection checklists for:
- Incoming goods inspection
- In-process inspection
- Final product inspection
- Supplier audit inspection

Each template includes:
- Inspection points / criteria
- Accept/reject thresholds
- Reference to applicable specification or drawing

### 5. Record Your First Nonconformance

  Quality → Nonconformances → New NCR

Fields required:
- Description of the nonconformance
- Category and severity
- Affected product/process/batch
- Detection point (incoming, in-process, customer return)
- Immediate containment action
- Root cause (use 5-Why or Fishbone analysis)
- Corrective action (links to CAPA module)
- Verification of effectiveness

### 6. Configure Customer Satisfaction Tracking

  Quality → Customer Satisfaction → Settings

Set up methods for capturing customer satisfaction data:
- Net Promoter Score (NPS) surveys
- Customer complaint log
- Customer audit feedback
- On-time delivery performance

### 7. Assign User Roles

  Settings → Users → [User] → Module Permissions → Quality

Recommended assignments:
- Quality Manager: level 5 (APPROVE)
- Quality Technician / Inspector: level 3 (EDIT)
- Production Supervisor: level 3 (EDIT)
- All production staff: level 2 (COMMENT)

---

## First Actions After Enabling

1. Upload your quality policy document (link to Document Control)
2. Define at least 3 quality objectives for the current year
3. Create inspection templates for your core products/processes
4. Record your first NCR (even a historical one)
5. Run your first supplier quality evaluation

---

## Related Modules

- **Document Control** — Controlled quality procedures and work instructions
- **Supplier Management** — Supplier quality performance and approval
- **Audit Management** — Internal quality audits (ISO 9001 Clause 9.2)
- **Customer Portal** — Customer complaint submission
- **Training Management** — Quality training competency records
`,
  },

  {
    id: 'KB-MG-004',
    title: 'HR & Employee Management Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['hr', 'employees', 'setup', 'personnel', 'onboarding', 'payroll'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# HR & Employee Management Setup Guide

## Purpose

The HR module manages the full employee lifecycle: recruitment, onboarding, employment records, performance management, leave management, and offboarding. It is the central data source for all modules that reference employees (training, incidents, payroll, etc.).

---

## Prerequisites

- Employee list with: full name, job title, department, start date, employment type
- Organisation chart / reporting structure
- Job descriptions for each role
- Employment contract templates
- Leave entitlements policy
- Performance review cycle information

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → HR & Employee Management → Enable

Module activates at port 3006 (web) and 4006 (API).

### 2. Define Your Organisation Structure

  HR → Organisation → Departments → New Department

Create your department hierarchy:
- Parent department (e.g., Operations)
- Sub-departments (e.g., Production, Maintenance, Warehouse)
- Department head (linked to an employee record)

### 3. Define Job Roles & Grades

  HR → Settings → Job Roles → New Role

For each role define:
- Job title
- Department
- Grade / band
- Pay range (min/max)
- Job description text
- Required qualifications and competencies

### 4. Import or Add Employees

  HR → Employees → Add Employee (or Import CSV)

For each employee record:
- Personal details (name, date of birth, contact)
- Employment details (start date, department, job role, employment type)
- Contract details (contract type: permanent, fixed-term, contractor)
- Emergency contact information
- Right to work documentation status

For bulk import: use the CSV template available in HR → Import → Download Template.

### 5. Configure Leave Types

  HR → Settings → Leave Types

Define all leave categories:
- Annual leave (entitlement per grade/contract type)
- Sick leave
- Parental leave (maternity, paternity, shared parental)
- Compassionate leave
- Unpaid leave
- Bank/public holidays (select your country's schedule)

### 6. Set Up Performance Reviews

  HR → Settings → Review Cycles → New Cycle

Configure your performance review cadence:
- Cycle name (e.g., "2026 Annual Review")
- Review period start and end dates
- Rating scale (e.g., 1–5 or Exceeds/Meets/Needs Improvement)
- Self-assessment: enabled/disabled
- 360 feedback: enabled/disabled
- Reviewer assignment method (manager, HR, or manual)

### 7. Assign User Roles

  Settings → Users → [User] → Module Permissions → HR

Recommended assignments:
- HR Manager: level 5 (APPROVE)
- HR Officer/Coordinator: level 4 (MANAGE)
- Line Manager: level 3 (EDIT) — access to their direct reports only
- Employee: level 1 (VIEW) — self-service for their own record

---

## First Actions After Enabling

1. Create your department structure (at least the top-level departments)
2. Add at least your admin user as an employee record
3. Configure leave types and entitlements
4. Set up the current-year performance review cycle
5. Import or add all active employees

---

## Related Modules

- **Payroll** — Uses HR employee data for salary processing
- **Training Management** — Training records linked to employee profiles
- **H&S** — Incident records linked to employee profiles
- **Incident Management** — Reporter and injured party linked to HR records
- **Document Control** — Employee handbook and contract templates
`,
  },

  {
    id: 'KB-MG-005',
    title: 'Finance & Accounting Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['finance', 'accounting', 'setup', 'budget', 'invoicing', 'reporting'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Finance & Accounting Setup Guide

## Purpose

The Finance module provides budget management, expense tracking, invoicing, financial reporting, and compliance with accounting standards. It integrates with HR (payroll costs), Procurement (purchase orders), and ESG (carbon cost reporting).

---

## Prerequisites

- Financial year start month (set in Organisation Profile)
- Chart of accounts (account codes and descriptions)
- Budget for the current financial year (by department / cost centre)
- VAT/tax rates applicable in your jurisdiction
- Bank account details (for reconciliation)
- Existing supplier and customer account list

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Finance → Enable

Module activates at port 3013 (web) and 4013 (API).

### 2. Set Up the Chart of Accounts

  Finance → Settings → Chart of Accounts

Create or import your account structure:
- Income accounts (revenue by product line/service)
- Expense accounts (OPEX: salaries, utilities, materials, etc.)
- Asset accounts (CAPEX: equipment, vehicles, property)
- Liability accounts (loans, creditors)
- Equity accounts

Use the standard account code ranges appropriate for your jurisdiction (e.g., UK: Companies House format; US: US GAAP numbering).

### 3. Configure Tax Rates

  Finance → Settings → Tax Rates

Add applicable tax rates:
- VAT/GST rates (standard, reduced, zero)
- Withholding tax rates
- Corporate tax rate (for provision estimates)

The multi-jurisdiction tax engine supports automatic calculation for international organisations.

### 4. Create Cost Centres / Departments

  Finance → Settings → Cost Centres

Link financial reporting to your organisational structure:
- Map departments (from HR module) to cost centres
- Assign budget holders (responsible for approving spend)

### 5. Enter the Annual Budget

  Finance → Budgets → New Budget

Create the annual budget by cost centre:
- Financial year (system defaults to current year based on org settings)
- Monthly phasing (spread budget across months)
- Budget owner per cost centre

### 6. Set Approval Workflows

  Finance → Settings → Approval Rules

Configure spend approval thresholds:
- Up to £500: Line manager approval
- £501–£5,000: Department head approval
- £5,001–£25,000: Finance manager approval
- Above £25,000: Director / CFO approval

### 7. Assign User Roles

  Settings → Users → [User] → Module Permissions → Finance

Recommended assignments:
- Finance Manager / CFO: level 5 (APPROVE)
- Finance Officer / Accountant: level 4 (MANAGE)
- Department Budget Holder: level 3 (EDIT) — own cost centre only
- Expense claimant (any employee): level 2 (COMMENT)

---

## First Actions After Enabling

1. Import your chart of accounts
2. Enter this year's budget by cost centre
3. Add your tax rates
4. Create your first purchase order or expense claim
5. Run the month-end report to confirm the module is working correctly

---

## Related Modules

- **Payroll** — Payroll costs posted to Finance as journal entries
- **Procurement/Contracts** — Purchase orders and supplier payments
- **ESG** — Carbon cost and sustainability spend reporting
- **HR** — Headcount costs by department
- **Asset Management** — Asset depreciation schedules
`,
  },

  {
    id: 'KB-MG-006',
    title: 'Risk Management Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['risk', 'risk-register', 'setup', 'enterprise-risk', 'iso-31000'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Risk Management Setup Guide

## Purpose

The Risk Management module provides an enterprise-wide risk register aligned with ISO 31000:2018. It aggregates risks from all other modules (H&S, Environment, Finance, Information Security, etc.) into a single risk landscape with consistent scoring and treatment tracking.

## ISO Standard Alignment

ISO 31000:2018 — Risk Management Guidelines

---

## Prerequisites

- Risk appetite statement approved by senior management
- Risk categories relevant to your organisation
- Risk scoring matrix preference (3×3, 4×4, or 5×5)
- Names of risk owners by category

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Risk Management → Enable

Module activates at port 3031 (web) and 4027 (API).

### 2. Configure Risk Scoring Matrix

  Risk → Settings → Scoring Matrix

Select your preferred risk scoring approach:
- **5×5 matrix** (recommended): Likelihood 1–5 × Consequence 1–5 = Risk Score 1–25
- **4×4 matrix**: For simpler environments
- **3×3 matrix**: For small organisations

Define thresholds:
- LOW: 1–4 (green)
- MEDIUM: 5–9 (amber)
- HIGH: 10–16 (orange)
- CRITICAL: 17–25 (red)

### 3. Define Risk Categories

  Risk → Settings → Categories

Create categories aligned with your business context:
- Strategic risks (market, competition, regulatory change)
- Operational risks (process failure, equipment, supply chain)
- Financial risks (credit, liquidity, currency)
- Compliance risks (legal, regulatory, contractual)
- Reputational risks (brand, social media, stakeholder)
- Safety risks (sourced from H&S module)
- Environmental risks (sourced from Environment module)
- Cyber / Information security risks (sourced from InfoSec module)

### 4. Set Risk Appetite

  Risk → Settings → Appetite

Define your organisation's risk appetite for each category:
- **Risk Tolerance** — Maximum risk score acceptable before escalation
- **Risk Appetite Statement** — Qualitative description of risk attitude

### 5. Create Your First Risk Assessment

  Risk → Risk Register → New Risk

For each risk:
1. Risk title and description
2. Category
3. Risk owner (responsible for managing the risk)
4. Inherent risk score (before controls): likelihood × consequence
5. Existing controls
6. Residual risk score (after controls)
7. Treatment plan (ACCEPT / REDUCE / TRANSFER / AVOID)
8. Treatment actions with due dates
9. Review date

### 6. Set Up Risk Reviews

  Risk → Settings → Review Schedule

Configure the risk review calendar:
- High/Critical risks: monthly review
- Medium risks: quarterly review
- Low risks: annual review

Automated reminders are sent to risk owners when reviews are due.

### 7. Assign User Roles

  Settings → Users → [User] → Module Permissions → Risk

Recommended assignments:
- Risk Manager / CRO: level 5 (APPROVE)
- Risk Owner (department heads): level 3 (EDIT) — own risks only
- Risk Reviewer: level 2 (COMMENT)
- Board / Audit Committee view: level 1 (VIEW)

---

## First Actions After Enabling

1. Configure your risk scoring matrix and appetite
2. Create at least 5 risks across different categories
3. Link existing risks from H&S and Environment modules
4. Set up the review schedule
5. Generate your first risk report for management review

---

## Related Modules

- **H&S** — Occupational safety risks auto-linked to risk register
- **Environmental Management** — Environmental risks auto-linked
- **Information Security** — Cyber and data risks auto-linked
- **Audit Management** — Risk-based audit planning
- **Finance** — Financial risk exposure and quantification
`,
  },

  {
    id: 'KB-MG-007',
    title: 'Document Control Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['documents', 'document-control', 'setup', 'version-control', 'procedures'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Document Control Setup Guide

## Purpose

The Document Control module manages the full lifecycle of controlled documents: creation, review, approval, distribution, and archival. It supports all ISO management system standards that require documented information (ISO 9001 Clause 7.5, ISO 14001 Clause 7.5, ISO 45001 Clause 7.5).

---

## Prerequisites

- List of existing controlled documents and their current revision levels
- Document numbering convention (e.g., QP-001, SOP-HR-001)
- Approval hierarchy for document sign-off
- Document categories / types used in your organisation
- Names of document controller and approvers per category

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Document Control → Enable

Module activates at port 3035 (web) and 4031 (API).

### 2. Configure Document Categories

  Documents → Settings → Categories

Create categories that reflect your document types:
- **Policies** — Top-level organisational policies
- **Procedures** — Step-by-step operational procedures
- **Work Instructions** — Detailed task-level instructions
- **Forms & Templates** — Blank forms and document templates
- **Records** — Completed records (often read-only after completion)
- **Technical Specifications** — Product/process specifications
- **External Documents** — Standards, legislation, customer requirements

### 3. Set Up Document Numbering

  Documents → Settings → Numbering Scheme

Define your document reference format:
- Prefix by category (e.g., POL, SOP, WI, FRM)
- Sequential number (padded to 3 digits: 001, 002, ...)
- Optional revision suffix (e.g., Rev A, Rev 1, v1.0)

Example: SOP-HS-001 Rev 2 = Safety procedure number 1, second revision.

### 4. Configure Approval Workflows

  Documents → Settings → Approval Workflows

For each document category, define the approval chain:
1. Document author drafts
2. Technical reviewer checks content
3. Approver signs off (level 5+ permission)
4. Document controller issues (assigns revision number and publication date)

### 5. Set Review Cycles

  Documents → Settings → Review Periods

Define how often each category must be reviewed:
- Policies: annual
- Procedures: annual or bi-annual
- Work Instructions: annual
- Specifications: as required / after each product change

The system sends automated review reminders to document owners.

### 6. Upload Your First Documents

  Documents → New Document → Upload

For each document:
- Select category
- Enter document title
- Upload the file (PDF, Word, Excel supported)
- Assign document owner
- Set next review date

Start with your key policy documents (Quality Policy, H&S Policy, Environmental Policy).

### 7. Assign User Roles

  Settings → Users → [User] → Module Permissions → Documents

Recommended assignments:
- Document Controller: level 6 (ADMIN)
- Approver (quality manager, department heads): level 5 (APPROVE)
- Author (any staff member): level 3 (EDIT)
- All staff read access: level 1 (VIEW)

---

## First Actions After Enabling

1. Configure your document categories and numbering scheme
2. Upload your top-level management system policies (Quality, H&S, Environment)
3. Upload at least 5 key procedures
4. Set up the review cycle for all uploaded documents
5. Share read access with all relevant staff

---

## Related Modules

- **All Compliance Modules** — Policy and procedure documents link here
- **Training Management** — Training materials managed as controlled documents
- **Audit Management** — Audit evidence stored as document records
- **Quality Management** — Quality plans and specifications
`,
  },

  {
    id: 'KB-MG-008',
    title: 'Training Management Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['training', 'learning', 'setup', 'competency', 'compliance-training'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Training Management Setup Guide

## Purpose

The Training Management module tracks employee training, qualifications, competency records, and compliance with mandatory training requirements. It ensures all staff remain qualified and that expiring certifications are flagged in advance.

---

## Prerequisites

- List of mandatory training courses (safety, compliance, technical)
- List of optional / developmental training
- Training records for existing employees (historical data)
- Competency matrix (which roles require which qualifications)
- Training providers used (internal trainers, external providers, e-learning platforms)

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Training Management → Enable

Module activates at port 3032 (web) and 4028 (API).

### 2. Define Training Courses

  Training → Courses → New Course

For each course:
- Course title and description
- Delivery method: Classroom / Online / On-the-job / Blended
- Duration
- Provider (internal / external provider name)
- Certificate validity period (e.g., 12 months, 3 years, lifetime)
- Mandatory / optional flag
- Applicable roles (who must complete this course)

Examples of mandatory courses to create:
- Manual Handling (12 months validity)
- Fire Safety Awareness (annual)
- COSHH Awareness (annual)
- First Aid at Work (3-year validity)
- Induction Training (one-time)

### 3. Build the Competency Matrix

  Training → Competency Matrix

Map each job role to its required courses:
- Select job role (from HR module)
- Add required courses and validity periods
- The system automatically flags employees in that role with gaps

### 4. Record Historical Training

  Training → Records → Bulk Import

Import historical training records from your CSV or spreadsheet:
- Employee name / ID
- Course completed
- Completion date
- Expiry date
- Certificate number (optional)
- Result (Pass / Fail / Attended)

Or add individual records:
  Training → Records → New Record

### 5. Set Up Expiry Alerts

  Training → Settings → Notifications

Configure reminder schedules for expiring training:
- 90 days before expiry: notify employee and line manager
- 30 days before expiry: escalate to HR manager
- On expiry date: flag as overdue; line manager notified
- After expiry (configurable period): flag as non-compliant

### 6. Schedule Training Sessions

  Training → Sessions → New Session

Plan upcoming training delivery:
- Course link
- Session date and time
- Location (room or virtual link)
- Maximum attendees
- Trainer name

Employees can be enrolled by HR/managers or self-enrol (if enabled).

### 7. Assign User Roles

  Settings → Users → [User] → Module Permissions → Training

Recommended assignments:
- Training Manager / L&D Manager: level 5 (APPROVE)
- HR Officer: level 4 (MANAGE)
- Line Manager: level 3 (EDIT) — for their team only
- Employee: level 1 (VIEW) — self-service to view own record

---

## First Actions After Enabling

1. Create your mandatory training course list
2. Build the competency matrix for your key roles
3. Import historical training records
4. Identify and schedule the next training session for the most-expired certifications
5. Review the compliance dashboard: Training → Dashboard → Compliance Overview

---

## Related Modules

- **HR & Employee Management** — Employee records linked to training profiles
- **H&S** — Safety training (first aid, manual handling) tracked here
- **Document Control** — Training materials managed as controlled documents
- **Audit Management** — Training compliance as an audit evidence source
`,
  },

  {
    id: 'KB-MG-009',
    title: 'Incident Management Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['incidents', 'incident-management', 'setup', 'reporting', 'investigation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Incident Management Setup Guide

## Purpose

The Incident Management module provides a centralised system for reporting, investigating, and closing incidents across all organisational domains — safety incidents, environmental events, quality nonconformances, security breaches, and operational failures.

---

## Prerequisites

- Incident reporting procedure (who can report, how, and what to include)
- Incident severity classification scheme
- Investigation methodology preference (5-Why, Fishbone/Ishikawa, Bow-Tie)
- Notification escalation contacts (who gets alerted for which severity level)
- Regulatory reporting obligations (e.g., RIDDOR in UK, OSHA 300 in US)

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Incident Management → Enable

Module activates at port 3041 (web) and 4036 (API).

### 2. Configure Incident Types

  Incidents → Settings → Incident Types

Create the incident categories relevant to your organisation:
- Near miss
- First aid incident
- Medical treatment incident
- Lost time incident
- Dangerous occurrence
- Environmental spill / release
- Quality nonconformance
- Security breach
- Property damage
- Vehicle / fleet incident
- Contractor incident

### 3. Set Severity Levels

The system uses 5 severity levels (these are fixed):
- **MINOR** — Minimal impact, no injury or environmental harm
- **MODERATE** — Minor injury or limited environmental impact
- **MAJOR** — Serious injury or significant environmental harm
- **CRITICAL** — Life-threatening injury or major environmental damage
- **CATASTROPHIC** — Fatality or catastrophic environmental impact

Configure escalation rules per severity:
  Incidents → Settings → Escalation Rules

### 4. Configure Notification Rules

  Incidents → Settings → Notifications

Define who is notified for each severity level:
- MINOR: Line manager only
- MODERATE: Line manager + H&S Officer
- MAJOR: H&S Manager + HR Manager + Site Director
- CRITICAL: CEO + H&S Director + HR Director + Legal
- CATASTROPHIC: Board notification + Regulatory authority reporting

### 5. Set Up Investigation Templates

  Incidents → Settings → Investigation Templates

Create templates for each incident type that guide investigators through the right questions. For a safety incident template:
- Immediate cause
- Root cause (select 5-Why, Fishbone, or free text)
- Contributing factors
- Control measures in place at time of incident
- Evidence collected (photo upload, witness statements)
- Recommended corrective actions

### 6. Record Your First Incident

  Incidents → New Incident

Required fields:
- **Title** — Brief description of what happened
- **Date Occurred** — Date and time of incident (field name: dateOccurred)
- **Location** — Site, building, area
- **Incident Type** — From your configured types
- **Severity** — MINOR / MODERATE / MAJOR / CRITICAL / CATASTROPHIC
- **Reporter** — Person reporting (can be different from the person involved)
- **Description** — Full account of what happened

### 7. Close the Investigation Loop

After investigation:
1. Complete root cause analysis in the investigation tab
2. Add corrective actions (linked to CAPA module or H&S module)
3. Set target closure dates for all actions
4. Verify actions completed (verification evidence required)
5. Mark incident as CLOSED

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → Incidents

Recommended assignments:
- H&S Manager / Incident Manager: level 5 (APPROVE) — close investigations
- H&S Officer / Investigator: level 4 (MANAGE) — manage investigations
- Line Manager: level 3 (EDIT) — report and contribute to investigations
- All employees: level 2 (COMMENT) — submit incident reports

---

## First Actions After Enabling

1. Configure incident types and notification escalation rules
2. Create investigation templates for your most common incident types
3. Report any current open incidents (or historical incidents for the past 12 months)
4. Confirm all staff know how to access and use the incident reporting form
5. Set up a monthly incident statistics review meeting

---

## Regulatory Reporting

IMS supports automated regulatory reporting outputs:
- UK RIDDOR reports (template export)
- EU Seveso Major Accident Notifications
- OSHA 300 / 301 Forms (US)

Configure in: Incidents → Settings → Regulatory Reporting

---

## Related Modules

- **H&S** — Safety-specific incidents linked to H&S risk register
- **Risk Management** — Incidents can trigger risk re-assessment
- **CAPA** — Corrective actions from incidents
- **HR** — Injured party linked to employee record
- **Audit Management** — Incident investigation evidence
`,
  },

  {
    id: 'KB-MG-010',
    title: 'Audit Management Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['audits', 'audit-management', 'setup', 'internal-audit', 'iso-19011'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Audit Management Setup Guide

## Purpose

The Audit Management module plans, executes, and tracks internal and external audits across all management system modules. It aligns with ISO 19011:2018 (Guidelines for Auditing Management Systems) and supports certification audit preparation.

## ISO Standard Alignment

ISO 19011:2018 — Guidelines for Auditing Management Systems

---

## Prerequisites

- Annual audit programme schedule
- List of audit areas / scope (processes, departments, sites)
- Lead auditor and internal auditor names and qualifications
- Audit checklist templates (or use the built-in library)
- Previous audit reports and open findings (for carry-forward)

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Audit Management → Enable

Module activates at port 3042 (web) and 4037 (API).

### 2. Configure Audit Types

  Audits → Settings → Audit Types

Define the types of audits your organisation conducts:
- Internal audit (first-party)
- Supplier / vendor audit (second-party)
- Certification body audit (third-party)
- Regulatory inspection
- Management review (links to Management Review module)
- Desktop review

### 3. Build the Annual Audit Programme

  Audits → Programme → New Programme

Create an audit programme for the year:
- Programme title (e.g., "2026 Internal Audit Programme")
- Programme owner (lead auditor / quality/H&S manager)
- Audit frequency per scope area (risk-based scheduling)

Add planned audits to the programme:
- Audit title and type
- Planned dates (start and end)
- Scope / area to be audited
- Applicable standard clauses
- Lead auditor assigned
- Audit team members

### 4. Create Audit Checklist Templates

  Audits → Checklists → New Template

Build checklist templates for each standard:

For ISO 9001 internal audit checklist:
- Clause 4: Context of the Organisation
- Clause 5: Leadership and Commitment
- Clause 6: Planning
- Clause 7: Support
- Clause 8: Operation
- Clause 9: Performance Evaluation
- Clause 10: Improvement

Each checklist item should have:
- Audit question or requirement
- Reference (clause number, procedure reference)
- Evidence required
- Finding options: CONFORMING / MINOR NC / MAJOR NC / OBSERVATION / OFI

### 5. Conduct Your First Audit

  Audits → My Audits → [Audit Name] → Start Audit

During the audit:
1. Work through the checklist — record findings against each item
2. Upload evidence (photos, documents, screenshots)
3. Record any nonconformities (minor or major NC)
4. Note observations and opportunities for improvement

After the audit:
1. Write the audit summary report
2. Assign corrective actions for each NC (links to CAPA)
3. Set target closure dates
4. Issue the audit report to the auditee and management

### 6. Track Audit Findings and CAPAs

  Audits → Findings → Open Findings

Monitor all open findings from all audits in one view:
- Finding reference number
- Audit name and date
- Finding type (NC, Observation, OFI)
- Assigned to (department / person responsible)
- Target closure date
- Status (OPEN / IN PROGRESS / CLOSED / OVERDUE)

### 7. Assign User Roles

  Settings → Users → [User] → Module Permissions → Audits

Recommended assignments:
- Lead Auditor / Audit Manager: level 5 (APPROVE) — approve audit reports
- Internal Auditor: level 4 (MANAGE) — conduct audits and record findings
- Auditee (department managers): level 2 (COMMENT) — respond to findings
- Management: level 1 (VIEW) — review audit programme and reports

---

## First Actions After Enabling

1. Build this year's audit programme with at least 4 planned audits
2. Create checklist templates for your primary management system standard
3. Schedule your first internal audit within the next 30 days
4. Carry forward any open findings from previous audits
5. Set up a dashboard view for the audit programme status

---

## Certification Audit Support

Use the Certification Preparation view to:
  Audits → Certification Prep → [Standard]

- Track close-out of all nonconformities before the certification audit
- Generate the evidence pack for the certification body
- Review readiness score (% of clauses with full evidence)

---

## Related Modules

- **Risk Management** — Risk-based audit planning (higher risk = more frequent audit)
- **Document Control** — Audit evidence and reports stored as controlled documents
- **Incident Management** — Incident investigations may trigger unplanned audits
- **All Compliance Modules** — Audits span all active management system modules
- **Management Review** — Audit results presented at management review meetings
`,
  },
];
