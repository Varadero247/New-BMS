import type { KBArticle } from '../types';

export const moduleGuides3Articles: KBArticle[] = [
  {
    id: 'KB-MG-026',
    title: 'Regulatory Monitor Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['regulatory', 'legislation', 'compliance', 'legal-register', 'monitoring'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Regulatory Monitor Setup Guide

## Purpose

The Regulatory Monitor module delivers a live feed of legislative and regulatory changes relevant to your organisation's jurisdiction, industry, and active management system standards. It eliminates manual monitoring of legislation and flags changes that may require updates to your legal register, policies, or procedures.

---

## Prerequisites

- Countries / jurisdictions in which you operate
- Industry sectors (manufacturing, construction, healthcare, food, etc.)
- Active management system standards (ISO 45001, ISO 14001, ISO 9001, etc.)
- Contact for compliance: legal register owner per module

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Regulatory Monitor → Enable

Module activates at port 3040 (web) and 4035 (API).

### 2. Configure Jurisdictions

  Reg Monitor → Settings → Jurisdictions

Select all jurisdictions where you need to monitor regulation:
- UK (England/Wales, Scotland, Northern Ireland separate options)
- European Union (all or specific member states)
- United States (federal + state-level)
- Australia, Canada, UAE, and 40+ additional jurisdictions

### 3. Select Topic Areas

  Reg Monitor → Settings → Topics

Choose the regulatory topics relevant to your business:
- Health & Safety (RIDDOR, COSHH, PUWER, HSW Act, etc.)
- Environment (Environmental Permitting, Waste, Water, Air Quality)
- Employment (National Minimum Wage, Equality, TUPE, Working Time)
- Data Protection (UK GDPR, EU GDPR, CCPA)
- Food Safety (Food Safety Act, Food Hygiene Regulations)
- Product Safety (CE Marking, UKCA, REACH, RoHS)
- Financial (Companies Act, FCA, AML)
- Energy (Energy Savings Opportunity Scheme, ESOS, CRC)

### 4. Configure Alert Preferences

  Reg Monitor → Settings → Alerts

Set how you receive regulatory alerts:
- **Immediately** — Critical changes (new regulations, enforcement actions)
- **Weekly digest** — All changes collated into one email
- **Monthly summary** — Low-priority monitoring updates

Assign the alert recipient for each topic area (typically the module owner: H&S Manager receives H&S alerts, Environmental Manager receives environment alerts).

### 5. Review the Regulatory Feed

  Reg Monitor → Feed

The live feed shows:
- Date of regulatory change
- Title and summary of the change
- Jurisdiction
- Relevant topics
- **Impact assessment** — How likely this is to affect your organisation (HIGH / MEDIUM / LOW)
- **Actions suggested** — Specific steps to ensure compliance

### 6. Process Regulatory Alerts

When a relevant change is flagged:
1. Click the item to open the full detail
2. Review the change and its impact
3. Mark as: RELEVANT / NOT RELEVANT / UNDER REVIEW
4. If relevant: create an action item (automatically links to the relevant module's legal register)
5. Update the legal register with the new obligation
6. Close the alert once actions are complete

### 7. Assign User Roles

  Settings → Users → [User] → Module Permissions → Reg Monitor

Recommended assignments:
- Compliance Officer / Legal Register Owner: level 5 (APPROVE)
- Module Managers (H&S, Env, Quality, etc.): level 3 (EDIT) — review own topic alerts
- All managers: level 1 (VIEW)

---

## First Actions After Enabling

1. Configure all relevant jurisdictions
2. Select all applicable topic areas
3. Set alert preferences and recipient assignments
4. Review the initial feed and mark items as relevant/not relevant
5. Create actions for any immediately relevant items

---

## Related Modules

- **H&S Module** — Legal requirements register updated from alerts
- **Environmental Management** — Environmental legal obligations updated
- **Quality Management** — Product safety and standards updates
- **Document Control** — Updated procedures when regulations change
`,
  },

  {
    id: 'KB-MG-027',
    title: 'Management Review Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['management-review', 'iso', 'governance', 'inputs', 'outputs', 'actions'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Management Review Setup Guide

## Purpose

The Management Review module structures, documents, and tracks management review meetings required by all ISO management system standards (ISO 9001 Clause 9.3, ISO 14001 Clause 9.3, ISO 45001 Clause 9.3, ISO 27001 Clause 9.3). It auto-populates review inputs from active modules and tracks the actions arising.

## ISO Standard Alignment

All ISO management system standards require periodic management reviews covering mandatory inputs and outputs. The module ensures nothing is missed.

---

## Prerequisites

- Active ISO modules (H&S, Quality, Environment, or others)
- Senior management team names (top management who must attend)
- Review frequency preference (typically annual, but quarterly is better practice)

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Management Review → Enable

Module activates at port 3043 (web) and 4038 (API).

### 2. Configure Review Frequency

  Mgmt Review → Settings → Schedule

Set how often management reviews are conducted:
- Frequency: ANNUAL / BI-ANNUAL / QUARTERLY
- Scheduled month(s) (e.g., January and July for bi-annual)
- Reminder: Alert top management X days before the review date

### 3. Create a Management Review

  Mgmt Review → New Review

Fields required:
- Review title (e.g., "ISO 9001 Management Review Q1 2026")
- Standard(s) being reviewed (can cover multiple standards in one review)
- Review date
- Location / meeting type (on-site, virtual)
- Chairperson (top management representative)
- Attendees

### 4. Populate Required Inputs

  Mgmt Review → [Review] → Inputs

ISO standards require specific inputs to be reviewed. The system auto-populates data from active modules:

**From all standards:**
- Status of actions from previous review
- Changes in external/internal context (from risk register)
- Performance against objectives and KPIs (auto-pulled from each module)
- Nonconformities and corrective action status (auto-pulled)
- Audit results (auto-pulled from Audit Management)
- Monitoring and measurement results

**ISO 9001 additional inputs:**
- Customer satisfaction and complaints data
- Supplier performance

**ISO 14001 additional inputs:**
- Environmental performance vs targets
- Legal compliance evaluation results

**ISO 45001 additional inputs:**
- OHS incident statistics (LTIFR, TRIR)
- Consultation and participation results

**ISO 27001 additional inputs:**
- Security incident statistics
- Vulnerability and threat landscape changes

For each input section: review the auto-populated data, add context and narrative, and record top management's assessment.

### 5. Record Review Outputs

  Mgmt Review → [Review] → Outputs

ISO standards require documented outputs covering:
- Conclusions on the continuing suitability, adequacy, and effectiveness of the management system
- Decisions and actions related to improvement opportunities
- Decisions on any changes needed (resources, roles, policies, objectives)
- Implications for strategic direction

### 6. Create Actions

  Mgmt Review → [Review] → Actions → New Action

For each decision arising from the review:
- Action description
- Responsible person
- Target completion date
- Priority

Actions are tracked in the module until closed. Overdue actions are flagged in the next review.

### 7. Finalise and Sign Off

  Mgmt Review → [Review] → Sign Off

The chairperson formally approves the review record. The signed review is stored as a controlled document (links to Document Control).

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → Mgmt Review

Recommended assignments:
- Quality/EHS/ISO Manager: level 5 (APPROVE) — prepare and finalise reviews
- Top Management / Directors: level 3 (EDIT) — contribute to and sign off reviews
- Module Managers: level 1 (VIEW) — see the review and their action items

---

## First Actions After Enabling

1. Configure review frequency and schedule
2. Create your first management review
3. Review the auto-populated inputs from all active modules
4. Record management decisions as outputs
5. Create actions and assign owners

---

## Related Modules

- All active ISO modules feed data into management review inputs
- **Audit Management** — Audit results are a mandatory input
- **Document Control** — Signed review minutes stored as controlled records
`,
  },

  {
    id: 'KB-MG-028',
    title: 'Chemical Register Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['chemicals', 'coshh', 'sds', 'hazardous-substances', 'reach', 'chemical-register'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Chemical Register Setup Guide

## Purpose

The Chemical Register module maintains a comprehensive register of all hazardous substances used on site, stores Safety Data Sheets (SDS), records COSHH assessments, manages chemical substitution, and ensures compliance with REACH, CLP, and COSHH regulations.

---

## Prerequisites

- List of all chemicals, substances, and products used at your site(s)
- Current Safety Data Sheets (SDS/MSDS) for each substance
- Existing COSHH assessments (if any)
- Storage locations for chemicals
- Names of persons responsible for chemical management

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Chemical Register → Enable

Module activates at port 3044 (web) and 4040 (API).

### 2. Define Chemical Categories

  Chemicals → Settings → Categories

Create categories for your chemical types:
- Cleaning agents
- Lubricants and oils
- Solvents
- Adhesives and sealants
- Fuels
- Process chemicals
- Laboratory reagents
- Pesticides / biocides
- Refrigerants

### 3. Add Chemicals to the Register

  Chemicals → New Chemical

For each chemical:
- **Product name** (trade/brand name)
- **Chemical name** (IUPAC or common name)
- **CAS number** — Chemical Abstracts Service number (unique identifier)
- **Supplier**
- **Category**
- **Hazard classifications** — GHS/CLP pictograms (Flammable, Toxic, Corrosive, etc.)
- **Location(s) where used** and **storage location**
- **Quantity on site** (for site risk assessment)
- **REACH registration status** (for substances > 1 tonne/year in EU/UK)
- **Substitute available?** — Flag for elimination/substitution potential

### 4. Upload Safety Data Sheets

  Chemicals → [Chemical] → SDS → Upload SDS

Upload the current SDS (must be < 5 years old or latest version from supplier):
- SDS revision date
- Language
- Next review date (set alert)

The system extracts key hazard information from the SDS PDF (Section 2 and Section 8 used most frequently).

### 5. Create COSHH Assessments

  Chemicals → COSHH Assessments → New Assessment

For each chemical × task combination where significant exposure may occur:
- Task description (where and how the chemical is used)
- Who is exposed and for how long
- Exposure route (inhalation, skin contact, ingestion, injection)
- Existing controls (LEV, gloves, RPE, enclosure)
- Is exposure adequately controlled? Yes/No
- Residual risk level
- Health surveillance required? Yes/No
- Monitoring required? Yes/No
- Additional control measures required

### 6. Manage Chemical Substitution

  Chemicals → Substitution Review

Identify chemicals that should be eliminated or substituted:
- Substances with CMR (Carcinogenic, Mutagenic, Reprotoxic) classification — priority for elimination
- SVHCs (Substances of Very High Concern under REACH) — mandatory phase-out for SVHC-authorised uses
- Substances where a safer alternative exists

### 7. Set Review Reminders

  Chemicals → Settings → Review Schedule

Configure periodic reviews:
- SDS review: alert when SDS is > 3 years old
- COSHH assessment review: annual or after any change to process/substance
- Chemical inventory: quarterly reconciliation

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → Chemicals

Recommended assignments:
- Health & Safety Manager / Chemical Manager: level 5 (APPROVE)
- Laboratory/Process Technician: level 3 (EDIT)
- Operators (read SDS): level 1 (VIEW)

---

## First Actions After Enabling

1. Add all chemicals currently used on site
2. Upload current SDS for each
3. Create COSHH assessments for your highest-risk substances
4. Identify any CMR substances for priority substitution
5. Link chemical assessments to the H&S risk register

---

## Related Modules

- **H&S Module** — Chemical risks appear in H&S risk register
- **Environmental Management** — Chemical waste and emissions as environmental aspects
- **Incident Management** — Chemical spills and exposure incidents
- **Training Management** — COSHH awareness training records
- **Permit to Work** — Chemical permit for fumigation/high-hazard use
`,
  },

  {
    id: 'KB-MG-029',
    title: 'Emergency Management Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['emergency', 'bcp', 'crisis', 'evacuation', 'response-plans', 'drills'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Emergency Management Setup Guide

## Purpose

The Emergency Management module maintains emergency response plans, business continuity plans (BCP), emergency contact lists, drill records, and crisis communication templates. It ensures your organisation is prepared to respond effectively to fire, flood, cyber attack, pandemic, or any other major disruption.

---

## Prerequisites

- List of potential emergency scenarios for your sites
- Current emergency response plans or evacuation procedures
- Emergency contacts (fire brigade, police, ambulance, utilities, key suppliers)
- Assembly point locations
- List of emergency wardens / fire marshals
- Business continuity requirements (RTOs and RPOs for critical processes)

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Emergency Management → Enable

Module activates at port 3045 (web) and 4041 (API).

### 2. Define Emergency Scenarios

  Emergency → Scenarios → New Scenario

Create response plans for each type of emergency:
- **Fire** — Evacuation routes, assembly points, roll call procedure
- **Flood / water ingress** — Isolation points, evacuation routes
- **Explosion or major chemical release** — Shelter-in-place or evacuation
- **Medical emergency / mass casualty** — First aid, ambulance liaison
- **Cyber attack / IT system failure** — IT recovery, manual fallback
- **Pandemic / infectious disease outbreak** — Isolation, remote working
- **Major power failure** — UPS, generator, essential service prioritisation
- **Bomb threat / security breach** — Evacuation, police liaison
- **Supply chain failure** — Alternate supplier activation
- **Severe weather** — Site closure, homeworking, road transport suspension

### 3. Build Emergency Response Plans

  Emergency → Plans → New Plan

For each scenario, build a step-by-step response plan:
- **Immediate actions** (first 15 minutes) — Who does what
- **Escalation chain** — Who is notified, in what order, at what point
- **External notifications** — Regulatory authority, insurers, media
- **Recovery actions** — Steps to restore normal operations
- **Stand-down criteria** — When is the emergency declared over?

Assign a plan owner and a backup who can activate the plan.

### 4. Maintain Emergency Contact Directory

  Emergency → Contacts → New Contact

Maintain a directory of all emergency contacts:
- Internal: Emergency Co-ordinator, Site Manager, IT Manager, HR Director
- External: Local fire brigade (direct), police non-emergency, utility providers (gas, water, electric), environmental regulator, insurance broker
- Key suppliers: critical materials suppliers with after-hours contacts
- Media / PR contact (for major incidents)

The directory is accessible offline (downloadable as PDF) and on mobile.

### 5. Record Drills and Exercises

  Emergency → Drills → New Drill

For each drill conducted:
- Drill type (Evacuation, Tabletop, Full exercise)
- Scenario tested
- Date and duration
- Participants
- Observations / findings
- Actions required (follow-up improvements)
- Pass/Fail assessment

Most regulations require at least one fire evacuation drill per year.

### 6. Configure Business Continuity

  Emergency → BCP → New Plan

For critical business processes, document:
- **Process name** (e.g., "Customer order fulfilment")
- **Recovery Time Objective (RTO)** — Maximum downtime before severe impact
- **Recovery Point Objective (RPO)** — Maximum data loss acceptable
- **Dependencies** — People, systems, suppliers, facilities required
- **Recovery steps** — How to restore the process
- **Workaround** — Manual alternative while system is offline
- **Owner** — Who activates the BCP

### 7. Assign User Roles

  Settings → Users → [User] → Module Permissions → Emergency

Recommended assignments:
- Emergency Co-ordinator / H&S Manager: level 5 (APPROVE)
- Site Managers / Fire Marshals: level 3 (EDIT)
- All staff: level 1 (VIEW) — read emergency plans and contacts

---

## First Actions After Enabling

1. Build fire evacuation response plans for each site
2. Upload emergency contacts directory
3. Add assembly point locations
4. Record the most recent evacuation drill
5. Create BCP for your 3 most critical business processes

---

## Related Modules

- **H&S Module** — Emergency arrangements linked to H&S risk assessment
- **Incident Management** — Major incidents activate emergency plans
- **Training Management** — Emergency warden training records
- **Document Control** — Emergency plans stored as controlled documents
`,
  },

  {
    id: 'KB-MG-030',
    title: 'ISO 42001 (AI Management) Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-42001', 'ai-management', 'artificial-intelligence', 'ai-risk', 'governance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 42001 (AI Management System) Setup Guide

## Purpose

The ISO 42001 module implements an Artificial Intelligence Management System (AIMS) aligned with ISO/IEC 42001:2023 — the world's first international standard for AI management. It manages the AI system inventory, AI risk assessments, bias and fairness evaluations, transparency documentation, and governance of AI development and deployment.

## ISO Standard Alignment

ISO/IEC 42001:2023 — Artificial Intelligence Management Systems

Key clauses supported:
- Clause 4: Organisational context (AI impact assessment)
- Clause 6: Planning (AI objectives, risk and opportunities)
- Clause 8: Operation (AI system lifecycle, impact assessments)
- Clause 9: Performance evaluation
- Clause 10: Improvement

---

## Prerequisites

- Inventory of all AI systems used or developed by your organisation
- Description of the purpose and data inputs for each AI system
- AI ethics policy or intent to create one
- Names of AI system owners and the AI Governance Officer
- Legal/compliance awareness of applicable AI regulations (EU AI Act, UK AI Regulation, etc.)

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → ISO 42001 → Enable

Module activates at port 3024 (web) and 4023 (API).

### 2. Define the AIMS Scope

  ISO 42001 → Settings → Scope

Document which AI systems and AI development activities are in scope:
- AI systems developed in-house
- Third-party AI systems used in business operations
- AI-assisted decision-making processes

### 3. Build the AI System Inventory

  ISO 42001 → Systems → New AI System

For each AI system:
- **System name** — e.g., "Customer churn prediction model"
- **Reference number** (auto-generated)
- **Purpose** — What problem it solves
- **Category** — Classification per EU AI Act risk tiers (MINIMAL / LIMITED / HIGH / PROHIBITED)
- **Data inputs** — What data the system processes (personal data? sensitive categories?)
- **Decision type** — ADVISORY (human still decides) / AUTONOMOUS (AI decides)
- **Affected persons** — Who is subject to AI-generated decisions
- **Department** — Which team owns and operates the system
- **Data types** — Structured, unstructured, biometric, etc.
- **Model type** — Machine learning, rule-based, generative AI, etc.
- **Deployment date**

### 4. Conduct AI Impact Assessments

  ISO 42001 → Assessments → New Assessment

For each AI system (especially HIGH risk category):
- Describe the intended purpose and context of use
- Identify potential harms to individuals or groups (discrimination, loss of employment, safety risks, privacy violations)
- Assess likelihood and severity of each harm
- Document existing safeguards
- Residual risk level
- Mitigation plan for unacceptable residual risks

### 5. Assess Bias and Fairness

  ISO 42001 → Systems → [System] → Bias Assessment

- Protected characteristics potentially affected (age, gender, race, disability, etc.)
- Training data representativeness review
- Outcome disparity testing results
- Corrective measures applied
- Re-assessment schedule

### 6. Transparency and Explainability Documentation

  ISO 42001 → Systems → [System] → Transparency

Document how the AI system's decisions are explained to affected persons:
- Is the AI involvement disclosed to users/subjects? Yes/No
- How is a decision explained (feature importance, reasoning)
- Is there a human review right? Yes/No
- Contact for challenging AI decisions

### 7. Set AI Objectives

  ISO 42001 → Objectives → New Objective

Example objectives:
- "Achieve bias parity (< 5% disparity) across all HIGH risk AI systems by Q3 2026"
- "Complete AI impact assessments for 100% of in-scope systems by Q2 2026"
- "Implement human oversight for all HIGH risk AI decisions by Q4 2026"

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → ISO 42001

Recommended assignments:
- AI Governance Officer / DPO: level 5 (APPROVE)
- AI System Owner: level 4 (MANAGE) — manage their own system records
- Developer / Data Scientist: level 3 (EDIT)
- Compliance / Audit: level 1 (VIEW)

---

## First Actions After Enabling

1. Define the AIMS scope
2. Register all AI systems currently in use
3. Classify each system by EU AI Act risk tier
4. Complete impact assessments for HIGH risk systems
5. Document transparency mechanisms for each system

---

## Related Modules

- **Risk Management** — AI risks linked to enterprise risk register
- **Data Governance** — Personal data used by AI systems
- **Document Control** — AI policies and model documentation
- **Audit Management** — ISO 42001 internal audits
`,
  },

  {
    id: 'KB-MG-031',
    title: 'ISO 37001 (Anti-Bribery Management) Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-37001', 'anti-bribery', 'corruption', 'due-diligence', 'gifts', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 37001 (Anti-Bribery Management System) Setup Guide

## Purpose

The ISO 37001 module implements an Anti-Bribery Management System (ABMS) aligned with ISO 37001:2016. It manages bribery risk assessments, due diligence on business associates, gifts and hospitality registers, financial controls, and whistleblowing / speak-up channels.

## ISO Standard Alignment

ISO 37001:2016 — Anti-Bribery Management Systems

Key requirements supported:
- Clause 4: Context and bribery risk assessment
- Clause 6: Anti-bribery objectives and planning
- Clause 7: Support (training, awareness, reporting channels)
- Clause 8: Operations (due diligence, financial controls, gifts register)
- Clause 9: Performance evaluation (monitoring, internal audit)
- Clause 10: Improvement (investigations, corrective actions)

---

## Prerequisites

- Anti-bribery policy (approved by top management)
- Business associate list (third parties with which you do business)
- Gifts and hospitality policy
- Whistleblowing procedure
- Names of ABMS Compliance Officer and their deputy

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → ISO 37001 → Enable

Module activates at port 3025 (web) and 4024 (API).

### 2. Document the Anti-Bribery Policy

  ISO 37001 → Documents → Anti-Bribery Policy

The policy must:
- Prohibit bribery in all forms (giving, receiving, facilitating)
- Apply to all personnel and controlled organisations
- Be signed by the highest governance body
- Be communicated to all personnel and relevant business associates

Upload the signed policy. It links to Document Control for version control.

### 3. Conduct a Bribery Risk Assessment

  ISO 37001 → Risk Assessment → New Assessment

Assess bribery risk across your activities:
- Geographic risk (countries with high Transparency International CPI scores)
- Sector risk (public procurement, defence, construction, extractives)
- Transaction types at risk (government permits, customs, large procurement)
- Business associate risk (agents, intermediaries, JV partners)
- Personal risk (new employees in high-risk roles, long-serving staff in procurement)

For each risk: likelihood × impact = risk rating (LOW / MEDIUM / HIGH / CRITICAL).

### 4. Set Up Due Diligence

  ISO 37001 → Due Diligence → New Assessment

For each business associate (third party) that represents a bribery risk:
- Entity name and type (agent, supplier, customer, JV partner, consultant)
- Country of operation
- Relationship type and contract value
- Due diligence checks performed:
  - Sanctions screening (PEP, OFAC, UN, EU lists)
  - Background check (beneficial ownership, adverse media)
  - Anti-bribery questionnaire completed by the third party
  - References obtained
- Overall due diligence rating: LOW / MEDIUM / HIGH / UNACCEPTABLE
- Actions required (e.g., enhanced monitoring, contract clause review)

### 5. Maintain the Gifts & Hospitality Register

  ISO 37001 → Gifts Register → New Entry

All gifts, hospitality, and expenses related to business relationships must be recorded:
- Direction: GIVEN / RECEIVED
- Person giving/receiving (staff member)
- Other party (business associate)
- Description and estimated value
- Date
- Business justification
- Approval status: PENDING / APPROVED / REJECTED

Set thresholds that require line manager or compliance approval (e.g., items > £50).

### 6. Configure the Speak-Up / Whistleblowing Channel

  ISO 37001 → Speak-Up → Settings

Configure an anonymous reporting channel for bribery concerns:
- Email address (dedicated, monitored by ABMS Compliance Officer)
- Hotline number (third-party, if used)
- Online form (linked to external secure form if preferred)
- Guarantee of non-retaliation: documented in policy

Ensure the channel is promoted to all staff in anti-bribery training.

### 7. Set Anti-Bribery Objectives

  ISO 37001 → Objectives

Example objectives:
- "Complete anti-bribery training for 100% of personnel by Q2 2026"
- "Conduct due diligence on 100% of HIGH risk business associates by Q3 2026"
- "Conduct an ABMS internal audit by Q4 2026"

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → ISO 37001

Recommended assignments:
- ABMS Compliance Officer: level 6 (ADMIN)
- Senior Management: level 3 (EDIT) — approve gifts and due diligence
- All personnel: level 2 (COMMENT) — submit gifts/hospitality entries

---

## First Actions After Enabling

1. Upload the anti-bribery policy
2. Complete the bribery risk assessment
3. Begin due diligence on your top 10 highest-risk business associates
4. Activate the gifts register and communicate the policy to all staff
5. Configure the speak-up channel and test it

---

## Related Modules

- **Training Management** — Anti-bribery training records
- **Risk Management** — Bribery risks in enterprise risk register
- **Document Control** — Anti-bribery policy and procedures
- **Audit Management** — ISO 37001 internal audits
`,
  },

  {
    id: 'KB-MG-032',
    title: 'Supplier Management & Evaluation Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['suppliers', 'vendor', 'evaluation', 'approved-list', 'performance', 'procurement'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Supplier Management & Evaluation Setup Guide

## Purpose

The Supplier Management module maintains the approved supplier list, manages supplier onboarding and qualification, tracks supplier performance (delivery, quality, compliance), and supports supplier audits. It provides visibility into supply chain risk and drives continuous supplier improvement.

---

## Prerequisites

- Current approved supplier list with contact information
- Supplier categories and criticality ratings
- Performance evaluation criteria used by your organisation
- Supplier performance data for the past 12 months (on-time delivery %, quality rejection rates)
- Supplier questionnaire or self-assessment form

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Supplier Management → Enable

Module activates at port 3033 (web) and 4029 (API).

### 2. Define Supplier Categories

  Suppliers → Settings → Categories

Create categories based on what suppliers provide:
- Raw materials and components
- Packaging materials
- Services (contract labour, cleaning, security, IT)
- Professional services (legal, consultancy, accountancy)
- Maintenance and engineering
- Logistics and transport
- Utilities

### 3. Define Criticality Tiers

  Suppliers → Settings → Criticality Tiers

Classify suppliers by their importance to your operations:
- **Tier 1 — Critical:** Single-source suppliers; disruption stops production / core service
- **Tier 2 — Important:** Preferred suppliers; alternatives exist but switching is difficult
- **Tier 3 — Standard:** Commodity suppliers; easily replaceable

### 4. Import Existing Suppliers

  Suppliers → Import or New Supplier

For each supplier:
- Company name
- Category
- Criticality tier
- Country of supply (risk indicator)
- Status: APPROVED / CONDITIONAL / NEW / SUSPENDED / DELISTED
- Primary contact details
- Account manager (internal)
- Certifications held (ISO 9001, ISO 14001, BRC, etc.)
- Contract reference (links to Contracts module)

### 5. Supplier Onboarding / Qualification

  Suppliers → [Supplier] → Qualification → New Questionnaire

Send the supplier a qualification questionnaire covering:
- Financial stability (company registration, accounts)
- Quality management (certifications, quality policy)
- Environmental management (certifications, ESG policy)
- Social responsibility (modern slavery, diversity, ethics)
- Information security (data handling, GDPR compliance)
- Business continuity capability
- Insurance coverage

Score responses and decide: APPROVE / CONDITIONAL (requires corrective actions) / REJECT.

### 6. Configure Performance Scorecards

  Suppliers → Settings → Scorecard Criteria

Define the KPIs on which suppliers are scored (typically quarterly):
- **On-Time Delivery (OTD)** — % of orders delivered on time in full
- **Quality** — % of deliveries accepted first time (no rejection/rework)
- **Responsiveness** — Response time to queries and complaints
- **Documentation** — Accuracy of delivery notes, certificates, invoices
- **NCR rate** — Nonconformance reports raised against this supplier
- **Price competitiveness** — vs market benchmark (optional)
- **Sustainability** — ESG score (optional)

Weight each criterion by importance (e.g., OTD 30%, Quality 40%, etc.).

### 7. Enter Quarterly Scorecards

  Suppliers → [Supplier] → Scorecards → New Scorecard

Enter actual performance data for each KPI:
- Rating or raw score
- System calculates weighted overall score
- Overall grade: A (Excellent 90%+) / B (Good 75–89%) / C (Acceptable 60–74%) / D (Poor <60%)

D-rated suppliers receive an automatic improvement notice.

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → Suppliers

Recommended assignments:
- Procurement Manager: level 5 (APPROVE)
- Buyer / Procurement Officer: level 4 (MANAGE)
- Quality / H&S (supplier audit): level 3 (EDIT)
- Supplier (via Supplier Portal): level 2 (COMMENT)

---

## First Actions After Enabling

1. Import your approved supplier list
2. Classify suppliers by category and criticality
3. Send the qualification questionnaire to any suppliers not yet formally approved
4. Enter historical performance data for Tier 1 and Tier 2 suppliers
5. Generate your first supplier performance report

---

## Related Modules

- **Supplier Portal** — Suppliers can self-serve compliance documents
- **Quality Management** — Supplier NCRs tracked in quality module
- **Contracts** — Supplier contracts linked
- **Food Safety** — Approved supplier list for food ingredients
- **ISO 37001** — Anti-bribery due diligence on suppliers
`,
  },

  {
    id: 'KB-MG-033',
    title: 'Customer Portal Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['customer-portal', 'self-service', 'portal', 'customers', 'complaints', 'documents'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Customer Portal Setup Guide

## Purpose

The Customer Portal provides your customers with a branded, self-service web portal where they can raise complaints, track the status of their cases, access shared documents (quality certificates, SDS, test reports), view service job progress, and submit satisfaction surveys — without needing to call or email your team.

---

## Prerequisites

- CRM module active (customers must exist as CRM accounts)
- Company logo and brand colours (for portal customisation)
- List of document types to share via the portal
- At least one customer to invite for initial testing
- Decision on which features to enable (complaints, documents, job tracking)

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Customer Portal → Enable

Module activates at port 3018 (web) and 4018 (API).

### 2. Customise the Portal Branding

  Customer Portal → Settings → Branding

Configure the look and feel for your customers:
- Portal name (e.g., "Nexara Client Portal")
- Company logo (shown in header)
- Primary and accent brand colours
- Welcome message / banner text
- Support contact email shown in footer
- Custom domain (e.g., portal.yourcompany.com) — requires DNS configuration

### 3. Enable Portal Features

  Customer Portal → Settings → Features

Toggle which sections are visible to portal users:
- **My Complaints** — Submit and track complaints
- **Documents** — Access shared quality/compliance documents
- **Service Jobs** — Track field service job status and history
- **Satisfaction Surveys** — Complete post-service satisfaction surveys
- **My Account** — View and update contact details
- **Invoice History** — View invoices (if Finance integration enabled)

### 4. Configure Document Sharing

  Customer Portal → Documents → Permissions

Define which document types can be shared per customer:
- Quality certificates (ISO 9001, FSSC 22000, etc.)
- Test reports and certificates of conformity (CoC)
- Safety Data Sheets (SDS)
- Product specifications
- Delivery documents

Documents shared from Document Control are version-controlled — customers always see the current approved version.

### 5. Invite Customers

  Customer Portal → Users → Invite Customer User

For each customer contact to be given portal access:
- Select the CRM account
- Enter the contact's email address
- Select the role: ADMIN (full access for that account) / VIEWER
- Send invitation (link valid for 7 days)

The contact creates their own password on first login — your team never sees customer passwords.

### 6. Set Up Complaint Submission

  Customer Portal → Settings → Complaints

Configure the complaint submission form visible to customers:
- Required fields (category, description, order reference, date)
- File attachment allowed? Yes/No
- Acknowledgement email: auto-sent on submission
- SLA commitments shown to customers: Yes/No

Submitted complaints flow directly into the Complaints module for your team to handle.

### 7. Configure Satisfaction Surveys

  Customer Portal → Surveys → New Survey

Create post-service satisfaction surveys:
- Survey trigger: on job completion / complaint closure / manually
- Questions: star rating (1–5), NPS (0–10), free text
- Thank-you message after completion

Survey responses feed into the Quality module customer satisfaction KPIs.

### 8. Assign User Roles (Internal)

  Settings → Users → [User] → Module Permissions → Customer Portal

- Portal Administrator: level 6 (ADMIN) — configure portal, manage access
- Account Manager: level 3 (EDIT) — invite customers, share documents
- Support Team: level 3 (EDIT) — respond to portal-raised complaints

---

## First Actions After Enabling

1. Customise the portal branding with your logo and colours
2. Enable the features relevant to your customers
3. Configure document sharing permissions
4. Invite 2-3 test customers and get their feedback
5. Configure complaint submission and test the full workflow

---

## Related Modules

- **CRM** — Customer accounts must exist before portal invitations
- **Complaints** — Portal-submitted complaints flow into Complaints module
- **Field Service** — Job tracking visible to customers
- **Document Control** — Shared documents sourced from Document Control
- **Quality Management** — Customer satisfaction survey data
`,
  },

  {
    id: 'KB-MG-034',
    title: 'Supplier Portal Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['supplier-portal', 'self-service', 'portal', 'suppliers', 'compliance', 'documents'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Supplier Portal Setup Guide

## Purpose

The Supplier Portal gives your suppliers a dedicated self-service portal where they can upload compliance documents (insurance certificates, certifications, risk assessments), complete qualification questionnaires, view purchase orders, submit invoices, and respond to performance reviews — all without email back-and-forth.

---

## Prerequisites

- Supplier Management module active
- List of suppliers to invite (starting with Tier 1 and Tier 2)
- Portal branding assets (logo, brand colours)
- Decision on which documents suppliers must upload

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Supplier Portal → Enable

Module activates at port 3019 (web) and 4018 (API, shared with Customer Portal using different auth scope).

### 2. Customise the Portal Branding

  Supplier Portal → Settings → Branding

- Portal name (e.g., "Nexara Supplier Hub")
- Company logo and brand colours
- Welcome message
- Procurement contact details
- Custom domain (optional)

### 3. Enable Portal Features

  Supplier Portal → Settings → Features

Configure what suppliers can do in the portal:
- **Compliance Documents** — Upload and manage their compliance documents
- **Qualification Questionnaire** — Complete your supplier approval questionnaire
- **Purchase Orders** — View POs raised by your organisation
- **Invoice Submission** — Upload invoices against POs (if enabled)
- **Performance Scorecard** — View their own scorecard results
- **NCR Responses** — Respond to nonconformance reports raised against them

### 4. Configure Required Documents

  Supplier Portal → Compliance → Document Requirements

Define which documents each supplier must maintain:
- Public Liability Insurance (expiry tracked — alert 30 days before)
- Employers' Liability Insurance (UK legal requirement)
- ISO 9001 / ISO 14001 / ISO 45001 Certificate (expiry tracked)
- Modern Slavery Statement (annual)
- GDPR / Data Processing Agreement
- Anti-Bribery Policy
- COSHH Assessment (for chemical suppliers)

When a document expires, the supplier is automatically notified to upload a renewal, and your procurement team is also alerted.

### 5. Configure the Qualification Questionnaire

  Supplier Portal → Qualification → Configure Questionnaire

Build the online questionnaire suppliers complete when first applying or at renewal:
- Company information and financial details
- Quality management practices
- Environmental and sustainability performance
- H&S policies and statistics
- Information security / data handling
- Modern slavery and ethical trading

Responses are scored automatically and presented to your procurement team for approval.

### 6. Invite Suppliers

  Supplier Portal → Users → Invite Supplier

For each supplier to be given portal access:
- Select the supplier record
- Enter the supplier's contact email (primary point of contact)
- System sends an invitation with a portal link

The supplier creates their own account — a unique login per supplier company.

### 7. Monitor Compliance Dashboard

  Supplier Portal → Compliance Dashboard

View the compliance status of all your suppliers at a glance:
- Green: All documents current, questionnaire approved
- Amber: 1 or more documents expiring within 30 days
- Red: 1 or more documents expired / questionnaire overdue

Filter by category, tier, or country. Export for management reporting.

### 8. Assign User Roles (Internal)

  Settings → Users → [User] → Module Permissions → Supplier Portal

- Procurement Manager: level 6 (ADMIN)
- Buyer: level 4 (MANAGE) — invite suppliers, review documents
- Quality Manager: level 3 (EDIT) — review compliance and NCR responses
- Finance: level 1 (VIEW) — view invoice submissions

---

## First Actions After Enabling

1. Customise the portal branding
2. Configure required compliance documents for each supplier category
3. Build your supplier qualification questionnaire
4. Invite your Tier 1 suppliers first (most critical)
5. Monitor the compliance dashboard for missing documents

---

## Related Modules

- **Supplier Management** — Supplier records and evaluation linked
- **Quality Management** — NCRs sent to suppliers via the portal
- **Contracts** — PO references visible in supplier portal
- **Finance** — Invoice submission workflow (if enabled)
- **ISO 37001** — Anti-bribery questionnaire part of qualification
`,
  },

  {
    id: 'KB-MG-035',
    title: 'Analytics & Reporting Setup Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['analytics', 'reporting', 'dashboards', 'kpi', 'charts', 'data-export'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Analytics & Reporting Setup Guide

## Purpose

The Analytics module provides cross-module reporting, customisable dashboards, KPI tracking, and data export capabilities. It consolidates data from all active IMS modules into a single analytics layer, enabling management reporting, trend analysis, and performance monitoring without needing to visit individual modules.

---

## Prerequisites

- At least 2 active modules with meaningful data
- Clarity on which KPIs are most important to senior management
- Names of report owners for each management report

---

## Step-by-Step Configuration

### 1. Enable the Module

  Settings → Modules → Analytics → Enable

Module activates at port 3022 (web) and 4021 (API).

### 2. Explore the Pre-Built Dashboards

  Analytics → Dashboards → Built-in

The module includes pre-built dashboards for each active module:
- **H&S Overview** — Incident trends, LTIFR, TRIR, risk heatmap, open actions
- **Environmental** — Aspect significance trends, CAPA status, compliance rating
- **Quality** — NCR trend, DPMO, first pass yield, customer complaint rate
- **Finance** — P&L snapshot, budget vs actual, aged debtors
- **HR** — Headcount, turnover, absence rate, training compliance
- **Energy** — Consumption trend, EnPI vs baseline, top energy users
- **ESG** — GHG emissions trajectory, social metrics, SDG alignment
- **Risk** — Risk landscape heatmap, residual risk distribution
- **Maintenance** — Work order backlog, PM compliance, MTBF, MTTR

Click any pre-built dashboard to open it — data is auto-populated.

### 3. Create a Custom Dashboard

  Analytics → Dashboards → New Dashboard

Build a dashboard with the metrics most relevant to your role:
1. Name the dashboard
2. Choose layout (2 columns, 3 columns, fullwidth)
3. Add widgets from the widget library:
   - KPI tile (single number with trend arrow)
   - Line chart (trend over time)
   - Bar/column chart (comparison)
   - Pie/donut chart (distribution)
   - Data table (top N records)
   - Heatmap (risk or incident geography)
   - Gauge chart (target vs actual)

For each widget: select the data source (module + metric), time range, and filters.

### 4. Create a Scheduled Report

  Analytics → Reports → New Report

Set up an automated report that is delivered by email on a schedule:
- Report name and description
- Select a dashboard or custom metric set
- Output format: PDF / Excel / CSV
- Schedule: Daily / Weekly / Monthly / Quarterly
- Recipients (email list)

Example: "Monthly Management KPI Pack" — PDF sent to board on the 1st of each month.

### 5. Use Natural Language Query (NLQ)

  Analytics → Ask a Question

Type a plain-English question to query your data:
- "How many incidents occurred in the last 3 months?"
- "What is our current LTIFR?"
- "Which department has the most open corrective actions?"
- "Show me energy consumption for Site A vs Site B this year"

The NLQ engine (powered by @ims/nlq) interprets the query and returns a chart or table.

### 6. Data Export

  Analytics → Export

Export data from any module:
- Select module and dataset
- Apply date range and filters
- Export format: CSV / Excel / JSON
- Schedule recurring exports (for external BI tools like Power BI or Tableau)

For API access: use the \`/api/analytics/*\` endpoints with Bearer token authentication to pull data programmatically.

### 7. Configure the Executive Homepage

  Analytics → Settings → Homepage

Configure the widgets shown on the main IMS Dashboard (port 3000) homepage:
- Each user can customise their own homepage
- Administrators can set a default homepage for all users
- Recommended: KPI tiles across top, then charts below

### 8. Assign User Roles

  Settings → Users → [User] → Module Permissions → Analytics

Recommended assignments:
- BI Analyst / Report Administrator: level 5 (APPROVE) — create and publish dashboards
- Module Manager: level 3 (EDIT) — create dashboards for their module data
- All users: level 1 (VIEW) — view published dashboards

---

## First Actions After Enabling

1. Open the pre-built dashboards for your active modules and review the data
2. Create a custom "Management Overview" dashboard with your top 10 KPIs
3. Schedule a monthly PDF report to send to senior management
4. Set up the homepage widget layout for the main Dashboard
5. Try the NLQ interface with 5 questions about your operational data

---

## Related Modules

Works with all active modules. Data is pulled automatically — no configuration needed per module once Analytics is enabled.

Key integrations:
- **All modules** — All KPI data sourced from individual modules
- **ESG** — GHG and sustainability metrics
- **Finance** — Financial KPIs and budget performance
- **H&S** — Safety statistics (LTIFR, TRIR)
`,
  },
];
