import type { KBArticle } from '../types';

export const onboardingJourneyArticles: KBArticle[] = [
  {
    id: 'KB-OJ-001',
    title: '30-Day Onboarding Journey: Health & Safety Module',
    content: `# 30-Day Onboarding Journey: Health & Safety Module

## Overview

This guide walks your team through a structured 30-day implementation of the IMS Health & Safety module (ISO 45001:2018). By the end of Day 30, your organisation will have a live safety management system with active incident reporting, permit-to-work controls, and a populated training matrix. Expected outcome: full operational readiness for one business unit or site.

---

## Before You Begin

- Confirm the Health & Safety module is enabled in Settings → Modules
- Assign an HS_MANAGER role to your lead Safety Officer
- Collect: site list, employee roster, existing risk assessment documents, current permit-to-work templates
- Book a 30-minute kick-off with your IMS implementation contact

---

## Week 1: Foundation

### Day 1-2: Initial Setup

- [ ] Log in as SUPER_ADMIN and navigate to Settings → Organisation
- [ ] Verify organisation name, country, and timezone are correct
- [ ] Navigate to Health & Safety → Settings → Locations
- [ ] Add all physical sites and locations (factory floors, offices, warehouses)
- [ ] Set a primary site as the default for new records
- [ ] Enable the H&S module for all users with HS_MANAGER or HS_OFFICER roles

### Day 3-5: Core Configuration

- [ ] Navigate to H&S → Settings → Hazard Categories
- [ ] Define your hazard taxonomy (e.g. Mechanical, Chemical, Electrical, Ergonomic, Psychosocial)
- [ ] Set up incident type codes matching your existing classification scheme
- [ ] Configure severity levels: MINOR, MODERATE, MAJOR, CRITICAL, CATASTROPHIC
- [ ] Set up the risk matrix: define likelihood scale (1-5) and consequence scale (1-5)
- [ ] Configure your risk tolerance thresholds (e.g. score >= 15 = HIGH, action required within 24h)
- [ ] Import employee list via CSV (Settings → Users → Bulk Import) or sync from HR module if enabled
- [ ] Assign site locations to each employee record

---

## Week 2: Data & People

### Day 8-10: Risk Assessment Import

- [ ] Navigate to H&S → Risk Assessments → Import
- [ ] Map columns from your existing Excel-based risk assessments to IMS fields
- [ ] Import and review imported records — spot-check 10% for accuracy
- [ ] Assign risk owners (responsible persons) to each imported assessment
- [ ] Set review due dates for all assessments (recommend 12 months from last review)
- [ ] Link existing controls to each hazard entry

### Day 11-14: Permit to Work & Incident Types

- [ ] Navigate to H&S → Permit to Work → Templates
- [ ] Create PTW templates for your main work categories: Hot Work, Confined Space, Working at Height, Electrical Isolation, Excavation
- [ ] Configure the PTW approval workflow: Requestor → Safety Officer → Site Manager → Authorised Person
- [ ] Set up PTW validity periods and mandatory pre-work checks per template
- [ ] Navigate to H&S → Incidents → Settings → Incident Types
- [ ] Define incident categories matching your regulatory reporting requirements (near miss, first aid, RIDDOR-reportable, dangerous occurrence)
- [ ] Configure mandatory fields for each incident type
- [ ] Set up automatic notification rules: who gets alerted for which severity level

---

## Week 3-4: Go-Live

### Day 15-21: Pilot & Testing

- [ ] Select one team or department as your pilot group (recommend 10-20 people)
- [ ] Run a 30-minute briefing session for the pilot group on how to log incidents
- [ ] Have 2-3 Safety Officers test the PTW workflow end-to-end: request → approve → close
- [ ] Log 2-3 test incidents (use test data — clearly mark as TEST in description)
- [ ] Test the monthly KPI dashboard: verify incident frequency rate and near-miss count populate
- [ ] Review the pilot with the group and document any usability issues
- [ ] Fix configuration gaps identified during pilot (approval routing, missing hazard categories)
- [ ] Train all Safety Officers and Site Managers on the system (target: 1-hour hands-on session)

### Day 22-30: Full Rollout

- [ ] Enable H&S module access for all employees with appropriate roles
- [ ] Send a system-wide communication with the login URL and key instructions
- [ ] Import the full training matrix: navigate to H&S → Training → Matrix → Import
- [ ] Map each job role to mandatory training requirements (minimum competencies)
- [ ] Populate existing training records for all employees
- [ ] Set up the monthly KPI report: H&S → Reports → Scheduled Reports → Monthly Safety KPIs
- [ ] Schedule first Safety Committee Review in IMS (H&S → Meetings → New)
- [ ] Archive or decommission your legacy spreadsheet-based incident log

---

## Success Criteria

- [ ] At least one real incident logged from start to close (not test data)
- [ ] At least one Permit to Work issued, approved, and closed through IMS
- [ ] Training matrix populated with records for all employees in scope
- [ ] Monthly KPI dashboard showing real data (incident rate, near misses, open actions)
- [ ] All Safety Officers confirmed able to use the system independently

---

## Next Steps After Go-Live

**Month 2:**
- Conduct your first internal audit using IMS Audit Management module
- Review any overdue risk assessments and assign corrective actions
- Run first Management Review report from H&S data

**Month 3:**
- Expand to additional sites or departments
- Link H&S incidents to CAPA workflow for systemic corrective action
- Begin benchmarking lagging indicators (TRIR, LTIR) against industry averages
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['onboarding', 'health-safety', 'getting-started', 'iso-45001'],
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
    id: 'KB-OJ-002',
    title: '30-Day Onboarding Journey: Quality Management Module',
    content: `# 30-Day Onboarding Journey: Quality Management Module

## Overview

This guide delivers a structured 30-day rollout of the IMS Quality Management module (ISO 9001:2015). By Day 30, your organisation will have a functioning quality management system with active nonconformance tracking, a configured CAPA workflow, document-controlled quality procedures, and a supplier list ready for evaluation. Expected outcome: first complete NC-to-CAPA cycle closed in IMS.

---

## Before You Begin

- Confirm the Quality Management module is enabled in Settings → Modules
- Assign a QUALITY_MANAGER role to your Quality Manager
- Collect: current quality policy document, list of products/services, existing supplier list, open nonconformance log, CAPA register
- If Document Control module is available, enable it alongside Quality

---

## Week 1: Foundation

### Day 1-2: Quality Policy & Categories

- [ ] Navigate to Quality → Settings → Quality Policy
- [ ] Enter your quality policy statement (copy from existing policy document)
- [ ] Set the policy effective date and responsible owner
- [ ] Navigate to Quality → Settings → Products & Services
- [ ] Define your product and service categories (e.g. Manufactured Products, Engineering Services, Maintenance Contracts)
- [ ] Add sub-categories where relevant for your reporting granularity
- [ ] Configure reference number format: QM-NC-YYYY-NNN for nonconformances

### Day 3-5: Nonconformance & Disposition Configuration

- [ ] Navigate to Quality → Nonconformances → Settings → NC Types
- [ ] Define nonconformance types: Customer Complaint, Internal Audit Finding, Process Deviation, Supplier NC, Product Defect
- [ ] Set severity levels for each type (Minor, Major, Critical)
- [ ] Navigate to Quality → Nonconformances → Settings → Dispositions
- [ ] Configure disposition options: Use-As-Is, Rework, Repair, Scrap, Return to Supplier, Concession
- [ ] Set up mandatory fields per disposition type
- [ ] Configure NC notification rules: who is alerted when a Critical NC is raised

---

## Week 2: Data & People

### Day 8-10: Supplier Import & Document Control

- [ ] Navigate to Quality → Suppliers → Import
- [ ] Import your Approved Supplier List (ASL) from CSV: supplier name, category, country, approval status, last audit date
- [ ] Assign supplier categories (Raw Material, Sub-contractor, Service Provider, Equipment)
- [ ] Set requalification intervals for each supplier tier
- [ ] If Document Control is enabled: navigate to Documents → Categories
- [ ] Create document categories for quality procedures: Quality Manual, Work Instructions, Quality Plans, Control Plans
- [ ] Upload your current quality manual as the master document
- [ ] Assign document owners and set review frequencies (typically 12-24 months)

### Day 11-14: CAPA Workflow Configuration

- [ ] Navigate to Quality → CAPA → Settings → Workflow Stages
- [ ] Configure CAPA stages: Initiation → Root Cause Analysis → Action Planning → Implementation → Verification → Closure
- [ ] Set SLA targets per stage (e.g. Root Cause Analysis: 5 business days, Implementation: 30 days)
- [ ] Assign default CAPA coordinator role (QUALITY_MANAGER or dedicated CAPA_COORDINATOR)
- [ ] Configure escalation rules: escalate to Quality Director if overdue by > 7 days
- [ ] Set up CAPA notification templates (assigned, due soon, overdue, closed)
- [ ] Test CAPA workflow with one sample record end-to-end

---

## Week 3-4: Go-Live

### Day 15-21: Pilot & Testing

- [ ] Select the QA team as the pilot group
- [ ] Run a 1-hour training session: how to log an NC, raise a CAPA, update disposition
- [ ] Log 3-5 real nonconformances from your current open NC log
- [ ] For each NC, raise the corresponding CAPA and assign to the responsible owner
- [ ] Verify the CAPA dashboard shows correct SLA countdown and owner assignment
- [ ] Import historical NC data from the last 12 months (Quality → Nonconformances → Import)
- [ ] Validate that NC trend charts populate correctly on the Quality Dashboard
- [ ] Review pilot results with QA team, document any workflow gaps

### Day 22-30: Full Rollout

- [ ] Enable Quality module access for all relevant roles (Production, Engineering, Procurement)
- [ ] Communicate to all users: how to raise an NC, expected response times
- [ ] Generate first Management Review data package: Quality → Reports → Management Review Summary
- [ ] Review open CAPA items and confirm all have owners and due dates
- [ ] Set up scheduled reports: weekly NC summary to Quality Manager, monthly trend report to Director
- [ ] Conduct a quality team walkthrough of the supplier evaluation workflow
- [ ] Archive or lock legacy Excel NC/CAPA logs

---

## Success Criteria

- [ ] First nonconformance logged, dispositioned, and closed end-to-end in IMS
- [ ] First CAPA raised, root cause documented, actions assigned, and closed in IMS
- [ ] Supplier list imported and all tier-1 suppliers assigned to an evaluation schedule
- [ ] Management Review data package generated with real data
- [ ] All QA team members confirmed able to log NCs independently

---

## Next Steps After Go-Live

**Month 2:**
- Schedule first supplier audits using IMS Audit Management module
- Set up customer complaint routing to feed directly into NC workflow
- Configure the quality performance dashboard for the operations team

**Month 3:**
- Begin ISO 9001 gap assessment using IMS Audit checklist library
- Link quality metrics to ESG reporting if ESG module is enabled
- Run first quarterly quality trend analysis report
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['onboarding', 'quality', 'getting-started', 'iso-9001'],
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
    id: 'KB-OJ-003',
    title: '30-Day Onboarding Journey: Environmental Management Module',
    content: `# 30-Day Onboarding Journey: Environmental Management Module

## Overview

This guide delivers a structured 30-day rollout of the IMS Environmental Management module (ISO 14001:2015). By Day 30, your organisation will have an approved environmental aspects register, a configured legal compliance calendar, active environmental monitoring data, and the foundation for ISO 14001 certification readiness. Expected outcome: aspects register approved by management, first legal compliance review completed in IMS.

---

## Before You Begin

- Confirm the Environmental Management module is enabled in Settings → Modules
- Assign an ENV_MANAGER role to your Environmental Manager
- Collect: list of significant environmental aspects from previous assessments, applicable environmental legislation register, existing monitoring parameter list and historical data, waste management records
- Review your organisation's environmental policy statement

---

## Week 1: Foundation

### Day 1-2: Environmental Aspects Register Setup

- [ ] Navigate to Environment → Aspects → Settings
- [ ] Define environmental aspect source categories (Activities, Products, Services)
- [ ] Define impact categories: Air Quality, Water Quality, Land Contamination, Resource Depletion, Biodiversity, Climate Change, Noise, Waste
- [ ] Configure the significance scoring formula: severity x 1.5 + probability x 1.5 + duration + extent + reversibility + regulatory + stakeholder
- [ ] Set the significance threshold (default: score >= 15 = Significant)
- [ ] Navigate to Environment → Aspects → New Aspect
- [ ] Enter your top 5 most significant aspects as a pilot entry exercise
- [ ] Verify significance scores calculate correctly

### Day 3-5: Legal Compliance Calendar & Monitoring Parameters

- [ ] Navigate to Environment → Legal → Compliance Calendar
- [ ] Add applicable environmental legislation (reference number, jurisdiction, requirement summary, compliance frequency)
- [ ] Set responsible owners for each compliance obligation
- [ ] Configure reminder lead times: 30 days, 7 days, 1 day before due date
- [ ] Navigate to Environment → Monitoring → Parameters
- [ ] Define environmental monitoring parameters: energy consumption (kWh), water consumption (m3), waste to landfill (tonnes), CO2 emissions (tCO2e), effluent discharge (m3), noise levels (dB)
- [ ] Set monitoring frequency for each parameter (daily, weekly, monthly, quarterly)
- [ ] Configure acceptable limits or targets for each parameter

---

## Week 2: Data & People

### Day 8-10: Baseline Data Import

- [ ] Navigate to Environment → Monitoring → Import Historical Data
- [ ] Import at least 12 months of baseline environmental monitoring data per parameter
- [ ] Verify data imported correctly: check totals against source system figures
- [ ] Review the environmental performance dashboard: confirm trend charts populate
- [ ] Navigate to Environment → Objectives → New Objective
- [ ] Create environmental objectives aligned to your policy commitments (e.g. Reduce Scope 1 emissions by 15% by 2027)
- [ ] Set measurable targets and link to monitoring parameters

### Day 11-14: Waste Management & Regulatory Reporting

- [ ] Navigate to Environment → Waste → Categories
- [ ] Define waste stream categories: Hazardous, Non-Hazardous, Recyclable, Organic, Electronic Waste, Liquid Waste
- [ ] Assign waste disposal routes and licensed contractor references for each category
- [ ] Set regulatory reporting templates for your jurisdiction (EA annual returns, Environment Agency submissions)
- [ ] Navigate to Environment → Legal → Compliance Reviews
- [ ] Schedule your first compliance review date for the end of Month 1
- [ ] Assign review responsibilities to ENV_MANAGER and site-level Environmental Officers

---

## Week 3-4: Go-Live

### Day 15-21: Pilot & Full Aspects Import

- [ ] Run a hands-on training session for Environmental Officers: logging monitoring data, updating aspects, completing compliance review
- [ ] Complete importing the full environmental aspects register from existing documentation
- [ ] For each significant aspect, link to the corresponding environmental objective
- [ ] Conduct a desktop compliance review against the imported legal register
- [ ] Record the compliance review in IMS: Environment → Legal → Compliance Reviews → New
- [ ] Document any areas of non-compliance or improvement opportunities as CAPA items
- [ ] Review the pilot results with your Environmental Manager

### Day 22-30: Full Rollout

- [ ] Enable Environment module for all relevant users (site managers, facilities, sustainability team)
- [ ] Train site personnel on how to enter monthly monitoring data
- [ ] Activate automated regulatory reporting templates: Environment → Reports → Scheduled
- [ ] Generate first environmental performance report for management review
- [ ] Present the aspects register to senior management for approval (document the approval in IMS)
- [ ] Set up the quarterly environmental objectives review schedule

---

## Success Criteria

- [ ] Environmental aspects register fully populated and approved by management (documented in IMS)
- [ ] First legal compliance review completed and recorded in IMS
- [ ] At least 3 months of monitoring data entered for all key parameters
- [ ] Environmental objectives set with measurable targets and owners assigned
- [ ] Environmental Officers able to enter monitoring data independently

---

## Next Steps After Go-Live

**Month 2:**
- Run first formal environmental internal audit using IMS Audit Management
- Set up GHG emission factor library for Scope 1, 2, and 3 calculations (links to ESG module)
- Begin supplier environmental questionnaire via Supplier Portal

**Month 3:**
- Produce first ISO 14001 gap assessment report
- Link environmental monitoring data to ESG dashboard
- Review significant aspects register after first quarter of live data
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['onboarding', 'environment', 'getting-started', 'iso-14001'],
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
    id: 'KB-OJ-004',
    title: '30-Day Onboarding Journey: Document Control Module',
    content: `# 30-Day Onboarding Journey: Document Control Module

## Overview

This guide delivers a structured 30-day rollout of the IMS Document Control module. By Day 30, your organisation will have a functioning controlled document library with approved workflows, all critical documents published, and document controllers and approvers trained on the system. Expected outcome: all tier-1 documents (policies, SOPs) live and under controlled distribution, with the first document change completed through the IMS workflow.

---

## Before You Begin

- Confirm the Document Control module is enabled in Settings → Modules
- Assign DOCUMENT_CONTROLLER role to your document management team
- Collect: current document register or index, copies of all tier-1 documents (policies, SOPs, work instructions), list of document approvers per department
- Decide on your document numbering format before starting (this cannot be easily changed after documents are created)

---

## Week 1: Foundation

### Day 1-2: Document Categories & Numbering

- [ ] Navigate to Documents → Settings → Categories
- [ ] Define document categories: Policy, Standard Operating Procedure (SOP), Work Instruction, Form/Template, Technical Specification, External Document, Record
- [ ] Define sub-categories where needed (e.g. SOP → Manufacturing, SOP → Quality, SOP → Safety)
- [ ] Navigate to Documents → Settings → Numbering
- [ ] Configure numbering format per category (e.g. POL-HSE-001, SOP-QA-001, WI-OPS-001)
- [ ] Set the starting sequence number for each category

### Day 3-5: Folder Structure & Approval Workflows

- [ ] Navigate to Documents → Settings → Folder Structure
- [ ] Create your top-level folder structure mirroring your organisation's department/function structure
- [ ] Set folder-level access permissions: who can view, who can upload to each folder
- [ ] Navigate to Documents → Settings → Approval Workflows
- [ ] Create the standard document approval workflow: Draft → Under Review → Approved → Published
- [ ] Assign reviewer and approver roles for each workflow stage
- [ ] Set SLA targets: Review within 5 business days, Approval within 3 business days
- [ ] Configure optional second-level approval for tier-1 documents (Director sign-off)
- [ ] Enable version control: IMS will automatically increment version on each approved change

---

## Week 2: Data & People

### Day 8-10: Priority Document Migration

- [ ] Create a migration priority list: tier-1 documents (policies) first, then tier-2 (SOPs), then tier-3 (work instructions)
- [ ] For each tier-1 document:
  - [ ] Navigate to Documents → New Document
  - [ ] Enter: document number, title, category, owner, effective date, review due date
  - [ ] Upload the current approved version as the master file
  - [ ] Set status to PUBLISHED (bypassing workflow for existing approved documents)
  - [ ] Mark as controlled document (enables distribution tracking)
- [ ] Target: all policies (tier-1) migrated by end of Day 10

### Day 11-14: SOP Migration & Owner Assignment

- [ ] Continue migration with tier-2 documents (SOPs)
- [ ] For each SOP, assign a document owner (the person responsible for keeping it current)
- [ ] Set review frequency for each document (policies: 1 year, SOPs: 2 years, work instructions: 3 years)
- [ ] Set up automated review reminders: owners receive email 60 days before review due date
- [ ] Navigate to Documents → Settings → Distribution Lists
- [ ] Create controlled distribution groups: who receives notification when a document is updated

---

## Week 3-4: Go-Live

### Day 15-21: Pilot & Testing

- [ ] Select 2-3 Document Controllers and 3-5 Approvers as the pilot group
- [ ] Run a 1-hour training session covering: uploading, initiating a change, reviewing, approving, publishing
- [ ] Initiate one real document change through the full workflow end-to-end
- [ ] Verify the controlled distribution notification fires when the document is published
- [ ] Verify version history is maintained correctly (old version accessible but clearly superseded)
- [ ] Test external document access: confirm staff can view but not edit published documents
- [ ] Document any workflow issues found and update configuration accordingly

### Day 22-30: Full Rollout

- [ ] Enable Document Control module access for all staff (VIEW permission minimum)
- [ ] Send company-wide communication: where to find documents, how to request changes
- [ ] Activate controlled distribution: all published documents now require acknowledgement from assigned staff
- [ ] Migrate remaining tier-3 documents (work instructions) or schedule migration over next 30 days
- [ ] Set up the monthly document status report: Documents → Reports → Status Summary
- [ ] Retire or password-protect legacy document storage (shared drives, intranets)

---

## Success Criteria

- [ ] All critical tier-1 documents (policies) published and accessible in IMS
- [ ] All tier-2 documents (SOPs) either published or in active review workflow
- [ ] First document change completed through the full workflow (draft → review → approved → published)
- [ ] All document owners assigned with review due dates set
- [ ] Document Controllers able to manage the workflow independently

---

## Next Steps After Go-Live

**Month 2:**
- Conduct a document audit: identify and update all overdue reviews
- Link documents to relevant H&S and Quality module procedures
- Configure document-linked training requirements (if Training module is enabled)

**Month 3:**
- Run first controlled distribution acknowledgement campaign for all staff
- Review numbering format and structure — adjust before volume grows
- Integrate Document Control with the Supplier Portal for external document sharing
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['onboarding', 'document-control', 'getting-started'],
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
    id: 'KB-OJ-005',
    title: '30-Day Onboarding Journey: Training Management Module',
    content: `# 30-Day Onboarding Journey: Training Management Module

## Overview

This guide delivers a structured 30-day rollout of the IMS Training Management module. By Day 30, your organisation will have a complete training item library, a role-to-training matrix, imported employee training histories, and automated reminder notifications active. Expected outcome: training matrix complete for all employees in scope, every employee has a defined training plan, and first training compliance report generated.

---

## Before You Begin

- Confirm the Training Management module is enabled in Settings → Modules
- Assign TRAINING_MANAGER role to your Learning & Development team
- Confirm the HR module is enabled (or that you have an employee list to import)
- Collect: current training register, list of mandatory training items per role, employee training history records, list of approved training providers

---

## Week 1: Foundation

### Day 1-2: Training Categories & Competency Levels

- [ ] Navigate to Training → Settings → Categories
- [ ] Define training categories: Mandatory Compliance, Role-Specific, Leadership & Management, Technical Skills, Induction, Refresher Training
- [ ] Navigate to Training → Settings → Competency Levels
- [ ] Define competency levels: Awareness (knows about it), Competent (can do it supervised), Proficient (can do it independently), Expert (can train others)
- [ ] Configure training delivery methods: Classroom, eLearning, On-the-Job, Blended, External Course, Toolbox Talk, Webinar

### Day 3-5: Training Item Library

- [ ] Navigate to Training → Library → New Training Item
- [ ] For each mandatory training item, create a record with:
  - [ ] Training item name and reference number
  - [ ] Category and delivery method
  - [ ] Duration (hours/days)
  - [ ] Frequency (one-off, annual, biennial, 3-year refresh)
  - [ ] Required competency level on completion
  - [ ] Validity period (how long until it expires and must be refreshed)
  - [ ] Approved training providers (if external course)
- [ ] Priority order: start with statutory/mandatory items (First Aid, Fire Safety, Manual Handling, Working at Height, COSHH Awareness, Forklift, etc.)
- [ ] Target: at least 20 training items created by Day 5

---

## Week 2: Data & People

### Day 8-10: Employee Training History Import

- [ ] Navigate to Training → Records → Import
- [ ] Prepare import file: employee ID, training item ID, completion date, expiry date, training provider, result (Pass/Fail/Competent)
- [ ] Import training history records for all employees
- [ ] Verify import: check sample records against source system
- [ ] Review the training compliance dashboard: confirm expired and expiring-soon records are flagged

### Day 11-14: Training Matrix Configuration

- [ ] Navigate to Training → Matrix → Role Requirements
- [ ] For each job role in your organisation, assign mandatory training items:
  - [ ] Select the role from the dropdown
  - [ ] Add each required training item and set the required competency level
  - [ ] Set whether the training is: Mandatory (blocks role clearance), Recommended, or Optional
- [ ] Priority roles to configure first: Site Operative, Supervisor, Manager, Office Staff, Contractor (induction)
- [ ] Navigate to Training → Matrix → View
- [ ] Review the matrix heatmap: RED = expired or missing, AMBER = expiring in 90 days, GREEN = current
- [ ] Export the matrix as a report to share with department managers for validation

---

## Week 3-4: Go-Live

### Day 15-21: Gap Analysis & Reminder Setup

- [ ] Navigate to Training → Reports → Gap Analysis
- [ ] Generate a gap report: all employees with expired or missing mandatory training
- [ ] Prioritise the gaps: statutory training items first (legal requirement)
- [ ] Create training plan records for the top 10 gap items: assign training event dates, trainers, locations
- [ ] Navigate to Training → Settings → Notifications
- [ ] Configure automated reminders:
  - [ ] 90-day reminder to employee and line manager (expiring soon)
  - [ ] 30-day reminder with escalation to department head
  - [ ] Overdue alert daily to Training Manager
- [ ] Test the notification by setting a test record to expire tomorrow and confirming the alert fires

### Day 22-30: Full Rollout

- [ ] Enable Training module access for all managers (to view their team's matrix)
- [ ] Enable employee self-service: employees can view their own training records and upcoming requirements
- [ ] Generate the first training compliance report: Training → Reports → Compliance Summary
- [ ] Share the compliance report with department managers and senior leadership
- [ ] Book induction training sessions for any new starters without induction records
- [ ] Set up the quarterly training review calendar: schedule reviews to check matrix currency

---

## Success Criteria

- [ ] Training matrix complete: all job roles have defined mandatory training requirements
- [ ] All employees have at least one training record in IMS
- [ ] All employees have a defined training plan (even if the plan is just their role-required items)
- [ ] Automated reminder notifications active and tested
- [ ] First training compliance report generated and shared with management

---

## Next Steps After Go-Live

**Month 2:**
- Link training requirements to H&S risk assessments (required competency before undertaking task)
- Set up training event calendar and booking system
- Configure training record certificates for printable proof of completion

**Month 3:**
- Conduct first monthly training compliance review meeting
- Identify training providers for top-priority gap items and book courses
- Integrate with Document Control: link SOPs to relevant training items
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['onboarding', 'training', 'getting-started'],
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
    id: 'KB-OJ-006',
    title: '30-Day Onboarding Journey: Audit Management Module',
    content: `# 30-Day Onboarding Journey: Audit Management Module

## Overview

This guide delivers a structured 30-day rollout of the IMS Audit Management module. By Day 30, your organisation will have a configured audit checklist library, an annual internal audit schedule, imported open findings from any previous audit system, and your first pilot audit completed end-to-end in IMS. Expected outcome: first complete audit cycle in IMS with corrective actions raised and assigned.

---

## Before You Begin

- Confirm the Audit Management module is enabled in Settings → Modules
- Assign AUDITOR role to your lead auditors and AUDIT_MANAGER to the audit programme coordinator
- Confirm the Quality or H&S module is enabled (CAPA workflow is shared with audit findings)
- Collect: existing audit programme plan, open audit findings register, audit checklist library (if any), list of qualified auditors

---

## Week 1: Foundation

### Day 1-2: Audit Types & Finding Configuration

- [ ] Navigate to Audits → Settings → Audit Types
- [ ] Define audit types: Internal Audit, External Audit (certification body), Supplier Audit, Regulatory Inspection, Management System Review, Process Audit
- [ ] For each audit type, configure:
  - [ ] Whether findings raise CAPA automatically (recommended: yes for internal audits)
  - [ ] Required fields (audit scope, lead auditor, opening meeting date)
  - [ ] Default report template
- [ ] Navigate to Audits → Settings → Finding Categories
- [ ] Define finding categories: Major Nonconformance, Minor Nonconformance, Observation, Opportunity for Improvement, Positive Finding
- [ ] Configure severity levels and required response timelines per finding category (e.g. Major NC: 30-day response required)

### Day 3-5: Checklist Library

- [ ] Navigate to Audits → Checklists → New Checklist
- [ ] Create checklist templates for your main audit types:
  - [ ] ISO 9001 Internal Audit Checklist (cover all 10 clauses)
  - [ ] ISO 45001 Internal Audit Checklist
  - [ ] ISO 14001 Internal Audit Checklist (if Environmental module enabled)
  - [ ] Supplier Audit Checklist (quality, safety, environmental)
  - [ ] Process-specific checklists (Manufacturing, Procurement, Customer Service)
- [ ] For each checklist, define sections and individual questions with:
  - [ ] Clause reference (ISO standard clause number)
  - [ ] Question text
  - [ ] Guidance notes for the auditor
  - [ ] Response options: Conforms / Minor NC / Major NC / Not Applicable / Observation

---

## Week 2: Data & People

### Day 8-10: Annual Audit Schedule

- [ ] Navigate to Audits → Schedule → Annual Programme
- [ ] Build your internal audit programme for the current year:
  - [ ] List all audit scope areas (departments, processes, sites)
  - [ ] Assign lead auditor for each audit
  - [ ] Set planned audit dates (spread evenly across the year)
  - [ ] Link the appropriate checklist to each scheduled audit
- [ ] Apply auditor independence rules: auditors must not audit their own area
- [ ] Set programme targets: all ISO 9001 clauses covered within the audit year

### Day 11-14: Open Findings Import

- [ ] Navigate to Audits → Findings → Import
- [ ] Prepare import file: finding reference, audit date, auditor, category, description, responsible owner, due date, status
- [ ] Import all open findings from your previous audit management system
- [ ] Review imported findings: confirm status (Open/In Progress/Closed) is correct
- [ ] For all imported open findings, link to CAPA items:
  - [ ] Navigate to CAPA → New (if not auto-created)
  - [ ] Reference the audit finding number in the CAPA record
  - [ ] Assign CAPA owner and confirm due date is current

---

## Week 3-4: Go-Live

### Day 15-21: Pilot Audit

- [ ] Select one small audit scope for the pilot (e.g. one process or one department)
- [ ] Create the audit record: Audits → New Audit
  - [ ] Audit type, scope, lead auditor, planned dates, checklist selection
- [ ] Conduct the pilot audit using IMS on a tablet or laptop during the physical audit
- [ ] Log findings in real time during the audit
- [ ] Complete the audit: mark all checklist questions, add auditor notes and evidence references
- [ ] Generate the audit report: Audits → [Audit Record] → Generate Report
- [ ] Review the generated report for completeness and professional presentation
- [ ] Raise CAPA items for all Major and Minor NCs found during the pilot
- [ ] Send the draft report to the auditee for factual accuracy check

### Day 22-30: Full Rollout

- [ ] Conduct lead auditor briefing: walk through the full audit workflow in IMS (1 hour)
- [ ] Activate the annual audit schedule: all planned audits now visible on the calendar
- [ ] Configure automated reminders: 2 weeks before each planned audit, notify lead auditor and auditee
- [ ] Set up the audit performance dashboard: open findings by age, CAPA closure rate, audit programme completion
- [ ] Generate the current audit programme status report for management

---

## Success Criteria

- [ ] First complete audit cycle completed in IMS: planned → conducted → reported → findings raised → CAPA assigned
- [ ] All open findings from previous system imported and linked to active CAPAs
- [ ] Annual audit programme scheduled and visible to all lead auditors
- [ ] Audit report template reviewed and approved by Audit Manager
- [ ] All lead auditors trained and able to use IMS during an audit

---

## Next Steps After Go-Live

**Month 2:**
- Conduct second audit using the programme schedule
- Review CAPA closure rates from audit findings monthly
- Begin tracking audit programme KPIs: planned vs actual, findings per audit, closure rate

**Month 3:**
- Prepare for external certification audit using IMS audit history as evidence
- Generate cross-module finding analysis: link audit findings to risk register
- Set up supplier audit programme and schedule first supplier assessments
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['onboarding', 'audit', 'getting-started'],
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
    id: 'KB-OJ-007',
    title: '30-Day Onboarding Journey: Risk Management Module',
    content: `# 30-Day Onboarding Journey: Risk Management Module

## Overview

This guide delivers a structured 30-day rollout of the IMS Risk Management module. By Day 30, your organisation will have a fully populated enterprise risk register with owners, treatment plans, and linked controls, a configured risk heat map dashboard, and the first formal risk review meeting completed in IMS. Expected outcome: complete risk register with owners and treatment plans, first risk review meeting recorded in IMS.

---

## Before You Begin

- Confirm the Risk Management module is enabled in Settings → Modules
- Assign RISK_MANAGER role to your Risk Manager or Chief Risk Officer
- Collect: existing risk register (in any format), list of risk categories used by your organisation, current risk matrix or scoring methodology, list of risk owners per department
- Senior leadership buy-in is critical: risk owners must commit to quarterly reviews

---

## Week 1: Foundation

### Day 1-2: Risk Categories & Matrix Configuration

- [ ] Navigate to Risk → Settings → Categories
- [ ] Define risk categories appropriate to your organisation:
  - [ ] Strategic (market, competition, regulation)
  - [ ] Operational (process, people, technology, supply chain)
  - [ ] Financial (credit, liquidity, foreign exchange)
  - [ ] Compliance (legal, regulatory, contractual)
  - [ ] Reputational (brand, media, stakeholder)
  - [ ] Environmental, Health & Safety (if not managed in H&S/Environment modules)
  - [ ] Cyber & Information Security
- [ ] Navigate to Risk → Settings → Risk Matrix
- [ ] Configure the likelihood scale (1-5): 1=Rare, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain
- [ ] Configure the consequence scale (1-5): 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Catastrophic
- [ ] Define risk score bands from the matrix product (Likelihood x Consequence):
  - [ ] 1-4: LOW (green) — monitor
  - [ ] 5-9: MEDIUM (yellow) — manage
  - [ ] 10-14: HIGH (amber) — mitigate, owner accountable
  - [ ] 15-25: CRITICAL (red) — immediate action, board-level visibility

### Day 3-5: Risk Appetite & Tolerance

- [ ] Navigate to Risk → Settings → Risk Appetite
- [ ] Define risk appetite statements per category (how much risk are you willing to accept?)
- [ ] Set risk tolerance thresholds per category: the maximum acceptable risk score before escalation is mandatory
- [ ] Configure escalation rules: CRITICAL risks automatically notify RISK_MANAGER and relevant board member
- [ ] Define the risk review calendar: quarterly for HIGH/CRITICAL, semi-annual for MEDIUM, annual for LOW

---

## Week 2: Data & People

### Day 8-10: Risk Register Import

- [ ] Navigate to Risk → Register → Import
- [ ] Prepare import file: risk ID, title, category, description, likelihood score, consequence score, inherent risk score, existing controls, residual likelihood, residual consequence, residual score, risk owner, status
- [ ] Import your existing risk register
- [ ] Review imported risks: verify scores calculate correctly and residual scores reflect control effectiveness
- [ ] Assign risk owners to all imported risks (HIGH and CRITICAL risks must have an owner)
- [ ] For any risks without a named owner, assign to department head as a temporary owner

### Day 11-14: Controls & Treatment Plans

- [ ] Navigate to Risk → Controls → Library
- [ ] Create a controls library: preventive controls, detective controls, corrective controls
- [ ] Link controls to risks in the register: Risk → [Risk Record] → Controls → Link
- [ ] For each HIGH and CRITICAL risk, create a treatment plan:
  - [ ] Treatment strategy: Accept, Avoid, Reduce, Transfer
  - [ ] Specific actions to reduce risk score
  - [ ] Responsible person for each action
  - [ ] Target completion date
  - [ ] Target residual score after treatment
- [ ] Review the risk heat map: Risk → Dashboard → Heat Map
- [ ] Confirm the heat map accurately represents your risk landscape

---

## Week 3-4: Go-Live

### Day 15-21: Risk Owner Training & Review Prep

- [ ] Schedule a 1-hour risk owner briefing session
- [ ] Walk risk owners through: viewing their risks, updating likelihood/consequence scores, adding treatment progress notes, adding new risks
- [ ] Each risk owner should log in and review their assigned risks during the session
- [ ] Run a test risk review meeting in IMS: Risk → Meetings → New Risk Review Meeting
- [ ] Record meeting attendees, agenda, and key decisions
- [ ] Practise generating the risk report: Risk → Reports → Risk Register Summary

### Day 22-30: Full Rollout

- [ ] Schedule the first formal quarterly risk review meeting (board or senior leadership level)
- [ ] Generate the heat map dashboard and risk summary report for the meeting pack
- [ ] Conduct the risk review meeting and record outcomes in IMS (Risk → Meetings)
- [ ] Update risk scores based on any decisions made in the review meeting
- [ ] Set up the risk watch list: HIGH and CRITICAL risks displayed on the main IMS dashboard for senior leaders
- [ ] Configure automated monthly risk status digest to RISK_MANAGER

---

## Success Criteria

- [ ] Complete risk register imported with all risks having: owner, likelihood score, consequence score, residual score
- [ ] All HIGH and CRITICAL risks have treatment plans with named action owners and due dates
- [ ] Risk heat map dashboard active and displaying current risk landscape
- [ ] First formal risk review meeting completed and recorded in IMS
- [ ] All risk owners trained and able to update their risks independently

---

## Next Steps After Go-Live

**Month 2:**
- Link risks to relevant audit findings (connect Audit and Risk modules)
- Link risks to environmental aspects and H&S hazards where relevant
- Begin tracking risk trend: is your overall risk profile improving or worsening?

**Month 3:**
- Conduct first formal quarterly risk review with all risk owners
- Review risk appetite statements with the board — adjust if business context has changed
- Generate first Enterprise Risk Management (ERM) report for board pack
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['onboarding', 'risk', 'getting-started'],
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
    id: 'KB-OJ-008',
    title: '30-Day Onboarding Journey: HR & Employee Management Module',
    content: `# 30-Day Onboarding Journey: HR & Employee Management Module

## Overview

This guide delivers a structured 30-day rollout of the IMS HR & Employee Management module. By Day 30, your HR team will have a complete employee master record system, a configured organisation structure, active onboarding and offboarding checklists, and the first monthly HR report generated from live data. Expected outcome: all employees in system with complete profiles, first monthly HR report generated.

---

## Before You Begin

- Confirm the HR & Employee Management module is enabled in Settings → Modules
- Assign HR_MANAGER role to your HR Manager and HR_OFFICER to the HR team
- Collect: current employee roster (name, job title, department, start date, contract type), organisation chart, existing HR policies, current leave entitlement schedule
- If Payroll module is being enabled simultaneously, coordinate the data model with the Payroll setup

---

## Week 1: Foundation

### Day 1-2: Organisation Structure

- [ ] Navigate to HR → Organisation → Structure
- [ ] Create your organisation hierarchy: Company → Division → Department → Team
- [ ] Add all divisions and departments as they appear on your organisation chart
- [ ] Assign a department head to each department
- [ ] Define reporting lines: who reports to whom (used for approval workflows and escalations)
- [ ] Navigate to HR → Settings → Employment Types
- [ ] Define employment types: Full-Time Permanent, Part-Time Permanent, Fixed Term Contract, Temporary, Casual/Zero Hours, Agency Worker, Apprentice, Contractor

### Day 3-5: Leave & Absence Categories

- [ ] Navigate to HR → Leave → Categories
- [ ] Define all leave types applicable to your organisation:
  - [ ] Annual Leave (with entitlement rules per employment type)
  - [ ] Sick Leave (statutory and contractual)
  - [ ] Maternity/Paternity/Shared Parental Leave
  - [ ] Unpaid Leave
  - [ ] Compassionate Leave
  - [ ] Public Holidays (configure public holiday schedule for each country/region you operate in)
  - [ ] Study/Training Leave
  - [ ] Jury Service
- [ ] Set accrual rules for annual leave: does leave accrue daily, weekly, or is it allocated in full at year start?
- [ ] Configure carry-over policy: how many days can be carried into the next leave year?

---

## Week 2: Data & People

### Day 8-10: Employee Master Data Import

- [ ] Navigate to HR → Employees → Import
- [ ] Prepare the employee import file including:
  - [ ] Employee ID (your internal payroll/HR number)
  - [ ] First name, last name, preferred name
  - [ ] Job title and department
  - [ ] Employment type and contract start date
  - [ ] Manager (line manager name or ID)
  - [ ] Work location (site)
  - [ ] Contact details (work email, work phone)
  - [ ] Date of birth (for age-related compliance checks)
  - [ ] Emergency contact details
- [ ] Import the employee file and review results
- [ ] For any import errors, correct and re-import the affected rows
- [ ] Review the organisation chart auto-generated from the import data

### Day 11-14: Onboarding & Offboarding Checklists

- [ ] Navigate to HR → Checklists → Onboarding Templates
- [ ] Create onboarding checklist templates per employment type and role level:
  - [ ] Standard Employee Onboarding (Day 1, Week 1, Month 1 sections)
  - [ ] Manager Onboarding (additional items for team leadership responsibilities)
  - [ ] Contractor Onboarding (abbreviated — site access, induction, NDA)
- [ ] For each checklist item, assign the responsible party: HR, IT, Facilities, Line Manager, Employee
- [ ] Navigate to HR → Checklists → Offboarding Templates
- [ ] Create offboarding checklist: access revocation, asset return, knowledge transfer, exit interview, final pay instructions
- [ ] Configure payroll integration basics: Navigate to HR → Settings → Payroll Integration
- [ ] Map HR employment types to payroll categories (required if Payroll module is enabled)

---

## Week 3-4: Go-Live

### Day 15-21: Pilot & Testing

- [ ] Select the HR team as the pilot group for system testing
- [ ] Run a leaver process end-to-end using a test employee record:
  - [ ] Navigate to HR → Employees → [Employee] → Terminate
  - [ ] Set termination date and reason
  - [ ] Trigger offboarding checklist — confirm tasks assigned to correct owners
  - [ ] Complete all offboarding tasks in the checklist
  - [ ] Confirm the employee record is set to INACTIVE on the termination date
- [ ] Run a new starter process end-to-end using a real new joiner (if one exists):
  - [ ] Create the employee record
  - [ ] Trigger onboarding checklist
  - [ ] Assign induction training (if Training module is enabled)
- [ ] Review and fix any gaps found in the pilot

### Day 22-30: Full Rollout

- [ ] Enable HR module for all managers (VIEW access to their direct reports' records)
- [ ] Enable employee self-service: employees can view their own records, request leave, update emergency contacts
- [ ] Train the HR team on all key workflows: new hire, leave management, performance review cycle
- [ ] Generate the first headcount report: HR → Reports → Headcount by Department
- [ ] Generate the first monthly HR report: HR → Reports → Monthly HR Summary
  - [ ] Includes: headcount, new starters, leavers, absence rates, leave balances
- [ ] Share the monthly HR report with senior leadership

---

## Success Criteria

- [ ] All employees imported and in system with complete profiles (no missing required fields)
- [ ] First leaver process completed through IMS from termination to checklist closure
- [ ] Employee self-service active: employees able to view their own records
- [ ] First monthly HR report generated with accurate headcount and absence data
- [ ] HR team trained and using IMS for day-to-day HR administration

---

## Next Steps After Go-Live

**Month 2:**
- Configure the performance review cycle (if performance management is in scope)
- Set up salary and benefits data import (sensitive — restrict to HR_MANAGER only)
- Link employee records to Training matrix to auto-populate gap analysis

**Month 3:**
- Run first absence trend analysis report
- Set up HR compliance alerts: contracts expiring in the next 90 days, probation review due dates
- Configure workforce planning reports: headcount vs. budget by department
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['onboarding', 'hr', 'getting-started'],
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
    id: 'KB-OJ-009',
    title: '30-Day Onboarding Journey: Supplier Management & Portal',
    content: `# 30-Day Onboarding Journey: Supplier Management & Portal

## Overview

This guide delivers a structured 30-day rollout of the IMS Supplier Management module and Supplier Portal. By Day 30, your top suppliers will be portal-enabled and actively submitting documentation, your qualification workflow will be live, and your first scorecard cycle will be complete. Expected outcome: top suppliers portal-enabled, first scorecard cycle complete.

---

## Before You Begin

- Confirm the Supplier Management module and Supplier Portal are enabled in Settings → Modules
- Assign SUPPLIER_MANAGER role to your Procurement Manager
- Collect: current Approved Supplier List (ASL), supplier contact list (key contacts per supplier with email addresses), existing supplier performance data, qualification criteria documents
- Identify your top 20 strategic suppliers for the pilot portal launch

---

## Week 1: Foundation

### Day 1-2: Supplier Categories & Qualification Criteria

- [ ] Navigate to Suppliers → Settings → Categories
- [ ] Define supplier categories: Raw Material Supplier, Sub-contractor, Service Provider, Equipment Supplier, Logistics Provider, Professional Services, IT & Technology
- [ ] For each category, define risk tier: Tier 1 (critical/strategic), Tier 2 (important), Tier 3 (routine/low value)
- [ ] Navigate to Suppliers → Settings → Qualification Criteria
- [ ] Define qualification requirements per category and tier:
  - [ ] Mandatory: valid insurance certificates, quality certification (ISO 9001), health & safety policy
  - [ ] Tier 1 additional: audited accounts, GDPR compliance evidence, BCP/DR policy
  - [ ] Category-specific: food safety certification for food suppliers, environmental certification for high-impact suppliers

### Day 3-5: Scorecard & ASL Workflow

- [ ] Navigate to Suppliers → Scorecard → Template
- [ ] Define performance scorecard dimensions and weights:
  - [ ] Quality (delivery quality, defect rate, complaint rate): 30%
  - [ ] Delivery (on-time delivery, lead time adherence): 25%
  - [ ] Responsiveness (response to queries, issue resolution speed): 20%
  - [ ] Commercial (pricing stability, invoice accuracy): 15%
  - [ ] Sustainability (ESG performance, environmental certificates): 10%
- [ ] Set scoring scale: 1 (Poor) to 5 (Excellent) per dimension
- [ ] Configure score thresholds: >= 4.0 = Preferred, 3.0-3.9 = Approved, 2.0-2.9 = Conditional, < 2.0 = Suspended
- [ ] Navigate to Suppliers → Settings → ASL Workflow
- [ ] Configure the ASL approval workflow: New Supplier Request → Qualification Review → Risk Assessment → Commercial Approval → Approved
- [ ] Set approvers for each stage by supplier tier (Tier 1 requires Procurement Director sign-off)

---

## Week 2: Data & People

### Day 8-10: Supplier Portal Invitation (Pilot 20)

- [ ] Navigate to Suppliers → [Supplier Record] → Portal Access → Invite
- [ ] Select your top 20 strategic suppliers
- [ ] For each: enter the primary contact name and email address
- [ ] Customise the invitation email template: include your organisation name, purpose of the portal, what documents they need to upload
- [ ] Send portal invitations
- [ ] Monitor acceptance: Suppliers → Portal → Invitation Status
- [ ] Follow up by phone with any supplier who has not accepted within 3 business days

### Day 11-14: Qualification Questionnaires & Certificate Upload

- [ ] As suppliers accept their portal invitations, monitor the qualification questionnaire responses
- [ ] Navigate to Suppliers → Portal → Submissions → Review
- [ ] Review each supplier's submitted questionnaire and uploaded documents
- [ ] Approve or request more information for each submission
- [ ] Upload any existing certificates on behalf of suppliers who are having difficulty (use Suppliers → [Supplier] → Documents → Upload on behalf of)
- [ ] For each supplier who completes qualification, update their ASL status to QUALIFIED
- [ ] Set certificate expiry reminders: portal will alert you and the supplier 60 days before any certificate expires

---

## Week 3-4: Go-Live

### Day 15-21: PO Workflow & Scorecard Cycle

- [ ] Navigate to Suppliers → Settings → PO Acknowledgement
- [ ] Activate the PO acknowledgement workflow: suppliers receive portal notification for each PO and must acknowledge within your specified window (e.g. 24 hours)
- [ ] Issue a test batch of 5 POs through the portal to your pilot suppliers
- [ ] Confirm suppliers can see the POs in their portal and acknowledge them
- [ ] Navigate to Suppliers → Scorecard → New Cycle
- [ ] Create the first scorecard evaluation cycle:
  - [ ] Cycle name: Q1 [Year] Supplier Performance Review
  - [ ] Suppliers in scope: your top 20 pilot suppliers
  - [ ] Evaluation period: last 3 months
  - [ ] Evaluators: Procurement team + relevant internal stakeholders per supplier
- [ ] Send scorecard evaluation requests to internal evaluators

### Day 22-30: Full Rollout

- [ ] Collect scorecard responses from all internal evaluators
- [ ] Calculate and finalise supplier scores for the Q1 cycle
- [ ] Share scores with suppliers via the portal (Suppliers → Scorecard → [Cycle] → Publish Scores)
- [ ] Review any supplier scoring below 3.0: initiate a supplier development plan or consider alternatives
- [ ] Expand portal invitations to remaining Tier 1 and Tier 2 suppliers (beyond the initial 20)
- [ ] Set up the annual supplier review calendar: quarterly scorecard cycles for Tier 1, annual for Tier 2/3

---

## Success Criteria

- [ ] At least 20 top suppliers portal-enabled and with submitted qualification documents
- [ ] All Tier 1 suppliers with ASL status QUALIFIED and certificates uploaded
- [ ] First PO acknowledgement workflow tested and confirmed working
- [ ] First scorecard cycle completed: scores collected, calculated, and shared with suppliers
- [ ] Procurement team trained on portal administration

---

## Next Steps After Go-Live

**Month 2:**
- Schedule first supplier audits for your highest-risk Tier 1 suppliers (link to Audit Management module)
- Configure supplier NDA and contract repository in Document Control module
- Set up supplier sustainability questionnaire (ESG module integration)

**Month 3:**
- Conduct first quarterly Supplier Management Review meeting using IMS data
- Review ASL: are there any suppliers that should be removed or moved to a different tier?
- Set up spend analysis reporting (link to Finance module)
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['onboarding', 'supplier', 'supplier-portal', 'getting-started'],
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
    id: 'KB-OJ-010',
    title: '30-Day Onboarding Journey: Finance & ESG Modules',
    content: `# 30-Day Onboarding Journey: Finance & ESG Modules

## Overview

This guide delivers a structured 30-day rollout of the IMS Finance and ESG Reporting modules. By Day 30, your finance team will have completed their first month-end close in IMS, your sustainability team will have established an ESG baseline, and the two modules will be linked to generate integrated financial and non-financial reports. Expected outcome: first month-end close completed in IMS, ESG baseline established.

---

## Before You Begin

- Confirm both Finance and ESG modules are enabled in Settings → Modules
- Assign FINANCE_MANAGER role to your Head of Finance and ESG_MANAGER to your Sustainability Manager
- Collect: current chart of accounts, trial balance for the current year to date, list of cost centres and business units, ESG materiality assessment (if completed), energy bills and waste data for the last 12 months
- Confirm your fiscal year start month and reporting currency

---

## Week 1: Foundation

### Day 1-2: Finance Configuration

- [ ] Navigate to Finance → Settings → General
- [ ] Set fiscal year start month (e.g. April for UK companies with April-March year)
- [ ] Set reporting currency and any secondary currencies used
- [ ] Define reporting periods: monthly, quarterly, annual
- [ ] Navigate to Finance → Chart of Accounts → Import
- [ ] Import your chart of accounts (COA) from CSV: account code, account name, account type (Asset, Liability, Equity, Revenue, Expense), parent account
- [ ] Review the imported COA: verify account type classification is correct
- [ ] Navigate to Finance → Settings → Cost Centres
- [ ] Define cost centres matching your organisational structure (department-level granularity recommended)
- [ ] Define business units if you have multiple trading entities or divisions

### Day 3-5: ESG Configuration & Materiality

- [ ] Navigate to ESG → Settings → Reporting Framework
- [ ] Select your primary ESG reporting framework: GRI, SASB, TCFD, CSRD, or custom
- [ ] Navigate to ESG → Settings → Materiality Topics
- [ ] Enable relevant materiality topics for your organisation:
  - [ ] Environmental: GHG Emissions, Energy Consumption, Water Use, Waste, Biodiversity
  - [ ] Social: Employee Health & Safety, Diversity & Inclusion, Training & Development, Community
  - [ ] Governance: Anti-Corruption, Board Composition, Data Privacy, Supply Chain Ethics
- [ ] For each enabled topic, assign a data owner (person responsible for data collection)
- [ ] Navigate to ESG → Settings → Emission Factors
- [ ] Configure the GHG emission factor library: select factors applicable to your country and energy sources
- [ ] Set the base year for ESG target-setting (typically the most recent year with complete data)

---

## Week 2: Data & People

### Day 8-10: Financial Data Import

- [ ] Navigate to Finance → Journals → Import
- [ ] Import year-to-date trial balance data for the current fiscal year
- [ ] Validate totals: debits must equal credits after import
- [ ] Navigate to Finance → Reports → Trial Balance
- [ ] Generate the trial balance report and compare against your source system figures
- [ ] Resolve any discrepancies before proceeding
- [ ] Import budget data: Finance → Budgets → Import
- [ ] Map budget lines to the IMS chart of accounts

### Day 11-14: ESG Data & GHG Calculations

- [ ] Navigate to ESG → Data Entry → Energy
- [ ] Enter 12 months of energy consumption data: electricity (kWh), natural gas (kWh or m3), diesel (litres), other fuels
- [ ] IMS will automatically calculate Scope 1 and Scope 2 GHG emissions using the configured emission factors
- [ ] Navigate to ESG → Data Entry → Waste
- [ ] Enter 12 months of waste data by waste stream (general, recycled, hazardous, organic)
- [ ] Navigate to ESG → Data Entry → Water
- [ ] Enter water consumption data (m3) and any wastewater discharge data
- [ ] Navigate to ESG → Data Entry → Social
- [ ] Import workforce data from HR module (or enter manually): headcount by gender, diversity metrics, training hours, lost time injury rate
- [ ] Review the ESG dashboard: confirm all materiality topics have data populated

---

## Week 3-4: Go-Live

### Day 15-21: First Month-End Close

- [ ] Navigate to Finance → Periods → [Current Month]
- [ ] Run the month-end close checklist:
  - [ ] Post all outstanding journals
  - [ ] Reconcile balance sheet accounts (bank, debtors, creditors)
  - [ ] Post depreciation entries
  - [ ] Accrue outstanding expenses
  - [ ] Review P&L against budget — investigate significant variances
  - [ ] Generate draft financial statements: P&L, Balance Sheet, Cash Flow
- [ ] Review draft financials with Finance Manager
- [ ] Post any required adjustments
- [ ] Close the period: Finance → Periods → [Month] → Close Period (prevents further posting)
- [ ] Generate the month-end management accounts pack

### Day 22-30: ESG Baseline & Integration

- [ ] Navigate to ESG → Reports → Baseline Summary
- [ ] Generate the ESG baseline report: current year actuals for all materiality topics
- [ ] Review baseline with Sustainability Manager: is the data complete and accurate?
- [ ] Set ESG targets for the next 3 years: ESG → Targets → New
  - [ ] Example: Reduce Scope 1+2 emissions by 30% by 2027 vs. base year
  - [ ] Example: Zero waste to landfill by 2028
- [ ] Train finance team on month-end close process in IMS
- [ ] Train sustainability team on ESG data entry and report generation
- [ ] Generate first integrated report: Finance → Reports → Integrated Report (financial + ESG on one dashboard)

---

## Success Criteria

- [ ] First month-end close completed in IMS with management accounts pack generated
- [ ] ESG baseline established: 12 months of data for all priority materiality topics
- [ ] GHG emissions calculated for Scope 1, 2, and available Scope 3 categories
- [ ] ESG targets set with measurable milestones
- [ ] Finance and Sustainability teams trained and able to use their respective modules independently

---

## Next Steps After Go-Live

**Month 2:**
- Connect Finance data to ESG: link energy costs to energy consumption data for carbon cost accounting
- Set up variance analysis reports: Finance → Reports → Budget vs. Actual
- Prepare first ESG progress report against targets

**Month 3:**
- Complete first quarter-end close in IMS
- Begin preparation for annual ESG disclosure (GRI/CSRD/TCFD as applicable)
- Link Finance and ESG data for integrated value creation reporting
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['onboarding', 'finance', 'esg', 'getting-started'],
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
    id: 'KB-OJ-011',
    title: '30-Day Onboarding Journey: Customer Portal Setup',
    content: `# 30-Day Onboarding Journey: Customer Portal Setup

## Overview

This guide delivers a structured 30-day rollout of the IMS Customer Portal. By Day 30, your active customers will be able to log in to a branded portal, access their certificates and compliance documents, and receive proactive notifications. Expected outcome: all active customers portal-enabled, first NPS survey response received.

---

## Before You Begin

- Confirm the Customer Portal module is enabled in Settings → Modules
- Assign PORTAL_ADMIN role to your Customer Success Manager or Quality Manager
- Collect: customer contact list (company name, key contact name, email address), list of documents to share per customer (certificates, test reports, COAs), brand assets (logo, brand colours, welcome copy)
- Identify 5-10 customers for the pilot group — choose engaged, tech-savvy contacts

---

## Week 1: Foundation

### Day 1-2: Portal Branding & Configuration

- [ ] Navigate to Customer Portal → Settings → Branding
- [ ] Upload your company logo (PNG or SVG, minimum 200px wide)
- [ ] Set brand colours: primary colour (hex code), secondary colour, button colour
- [ ] Write and enter the portal welcome message (displayed on customer login page and dashboard): keep it friendly, 2-4 sentences
- [ ] Set the portal domain/subdomain if using a custom URL (e.g. portal.yourcompany.com) — coordinate with IT
- [ ] Configure the portal footer: company name, support email, privacy policy link
- [ ] Preview the portal branding by navigating to Customer Portal → Preview

### Day 3-5: Document Types & Customer Tiers

- [ ] Navigate to Customer Portal → Settings → Document Types
- [ ] Define which document types customers can access via the portal:
  - [ ] Certificates of Conformance (CoC)
  - [ ] Test & Inspection Reports
  - [ ] Material Safety Data Sheets (MSDS/SDS)
  - [ ] Quality Plans
  - [ ] Calibration Certificates
  - [ ] ISO Certificates (your own quality and management system certificates)
  - [ ] Delivery Notes / Packing Lists
- [ ] Navigate to Customer Portal → Settings → Customer Tiers
- [ ] Define customer tiers that control portal permissions:
  - [ ] Standard: can download their own documents and certificates
  - [ ] Premium: can also submit enquiries, view product specifications, access audit reports
  - [ ] Strategic Partner: full portal access including quality performance data sharing
- [ ] Map each tier to the appropriate permission set

---

## Week 2: Data & People

### Day 8-10: Pilot Customer Invitations

- [ ] Navigate to Customer Portal → Customers → Import or New
- [ ] Add your 5-10 pilot customers:
  - [ ] Company name
  - [ ] Primary contact name and email
  - [ ] Customer tier
  - [ ] Account manager (internal owner)
- [ ] Assign document access permissions: which document types each customer can view
- [ ] Navigate to Customer Portal → Customers → [Customer] → Invite
- [ ] Send portal invitations to all pilot contacts
- [ ] Customise the invitation email subject and body (include: why they are being invited, what they can do in the portal, support contact)
- [ ] Monitor invitation acceptance: Customer Portal → Invitations → Status

### Day 11-14: Document Publication

- [ ] Navigate to Customer Portal → Documents → Publish
- [ ] For each pilot customer, publish their most recent documents:
  - [ ] Current ISO 9001 certificate (visible to all customers)
  - [ ] Any product-specific certificates or test reports specific to that customer
  - [ ] Their most recent Certificates of Conformance
- [ ] Set document visibility: Public to all customers, or Restricted to specific customer(s)
- [ ] Enable document download tracking: Customer Portal → Settings → Track Downloads
- [ ] Review the pilot customer's portal view using the Preview as Customer function
- [ ] Confirm documents appear correctly, downloads work, and the portal looks professional

---

## Week 3-4: Go-Live

### Day 15-21: Pilot Feedback

- [ ] After 3-5 days of pilot access, contact each pilot customer:
  - [ ] Phone call or email: Did they log in? Were they able to find and download their documents?
  - [ ] Any feedback on usability, missing documents, or confusing navigation?
- [ ] Address any access issues immediately: Customer Portal → Customers → [Customer] → Permissions
- [ ] Fix any broken document links or missing documents
- [ ] Update the welcome message or navigation if feedback indicates confusion
- [ ] Set up the NPS survey: Customer Portal → Settings → NPS Survey
  - [ ] Configure trigger: survey sent 14 days after first login
  - [ ] Set the NPS question: 'How likely are you to recommend our customer portal to a colleague? (0-10)'
  - [ ] Add one follow-up open question for qualitative feedback

### Day 22-30: Full Rollout

- [ ] Import your full active customer list into the portal
- [ ] Send portal invitations in batches (avoid sending all at once — stagger over 3-5 days to manage support volume)
- [ ] Set up automated certificate expiry notifications: customers receive email 30 days before any certificate expires
- [ ] Configure new document notification: customers are alerted when a new document is published for them
- [ ] Generate the first portal usage report: Customer Portal → Reports → Usage Summary
  - [ ] Track: registered users, login frequency, most downloaded documents
- [ ] Share the report with your Customer Success team

---

## Success Criteria

- [ ] All active customers invited to the portal (invitations sent)
- [ ] At least 70% of pilot customers successfully logged in and downloaded at least one document
- [ ] All current certificates and key compliance documents published for all customers
- [ ] NPS survey configured and at least one NPS response received
- [ ] Portal usage report generated and reviewed by the Customer Success team

---

## Next Steps After Go-Live

**Month 2:**
- Review NPS scores: identify detractors and follow up with individual conversations
- Add product-specific document categories based on customer feedback
- Enable the customer enquiry or complaint submission feature (if available)

**Month 3:**
- Conduct first monthly portal usage review: which customers are most active? Which haven't logged in?
- Set up re-engagement campaign for customers who have not logged in
- Consider adding a customer-facing quality performance dashboard (trend charts for key quality metrics)
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['onboarding', 'customer-portal', 'getting-started'],
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
    id: 'KB-OJ-012',
    title: '30-Day Onboarding Journey: Full IMS Rollout (All Modules)',
    content: `# 30-Day Onboarding Journey: Full IMS Rollout (All Modules)

## Overview

This guide is for customers enabling multiple IMS modules simultaneously as part of a full system implementation. Unlike single-module journeys, a full rollout requires phased sequencing, a dedicated implementation steering group, executive sponsorship, and change management planning. By Day 30, all selected modules will be live with at least one real record in each. Expected outcome: all modules live, all key users trained, and management reporting active across the integrated system.

---

## Before You Begin

- Identify your Executive Sponsor: the board-level or senior leadership champion for the IMS implementation (essential for user adoption)
- Form an Implementation Steering Group: representatives from each department being impacted
- Appoint a dedicated IMS Implementation Lead (internal project manager)
- Confirm which modules are in scope for the 30-day rollout — do not try to activate all 44 modules simultaneously
- Complete the Organisation Profile (Settings → Organisation) before enabling any module
- Allocate time commitments: the Implementation Lead needs at least 50% of their time on this project in Month 1

### Recommended Scope for 30-Day Full Rollout

A realistic 30-day full rollout covers 8-12 core modules. Suggested core set:
1. Document Control
2. Risk Management
3. Health & Safety
4. Quality Management (+ CAPA)
5. Environmental Management
6. Audit Management
7. Training Management
8. HR & Employee Management
9. Incident Management
10. Management Review (reporting layer)

Additional modules (Finance, ESG, Portals, CMMS, Field Service) are recommended for Month 2 onwards.

---

## Module Dependency Map

Some modules depend on others being configured first. Follow this dependency order:

    Organisation Profile
          |
    Users & Roles
          |
    Document Control -----> feeds all modules (policy documents)
          |
    HR & Employee Mgmt ---> feeds Training, H&S, Incidents
          |
    Risk Management ------> feeds Audit, H&S, Quality
          |
    +-----+-----+
    |           |
    H&S      Quality
    |           |
    PTW       CAPA ---------> feeds Audit
    Incidents               |
    Training            Suppliers
          |
    Audit Management
          |
    Management Review (reporting layer — consumes all modules)

---

## Week 1: Admin Foundations

### Day 1-2: Platform Configuration

- [ ] Log in as SUPER_ADMIN and complete the Organisation Profile (Settings → Organisation → General)
- [ ] Set timezone, fiscal year start, reporting currency, applicable regulatory standards
- [ ] Upload company logo and set brand colours
- [ ] Configure reference number formats for all modules at once (Settings → Reference Numbers)
- [ ] Enable all in-scope modules: Settings → Modules → enable each one

### Day 3-5: Users & Roles

- [ ] Navigate to Settings → Users → Roles
- [ ] Confirm all required roles exist for your in-scope modules (see role list in KB-GS-004)
- [ ] Create your user invitation plan: which roles for which staff members
- [ ] Import all employees via Settings → Users → Bulk Import (or sync from HR module)
- [ ] Send invitations in batches: senior leaders first, then managers, then all staff
- [ ] Assign module-specific roles to each user according to your RACI matrix
- [ ] Set up LDAP/SSO if your organisation uses Azure AD, Okta, or Google Workspace

---

## Week 2: Core Quality & Compliance Modules

### Day 8-10: Document Control & Risk

- [ ] Follow the Document Control setup checklist (KB-OJ-004, Days 1-5 tasks)
  - [ ] Define categories, numbering, folder structure, approval workflows
  - [ ] Migrate your top 10 most critical documents (policies first)
- [ ] Follow the Risk Management setup checklist (KB-OJ-007, Days 1-5 tasks)
  - [ ] Configure risk matrix and appetite
  - [ ] Import risk register
  - [ ] Assign risk owners

### Day 11-14: Audit, CAPA & Quality

- [ ] Follow Audit Management setup (KB-OJ-006, Days 1-5 tasks)
  - [ ] Configure audit types, finding categories, checklist library
- [ ] Follow Quality Management setup (KB-OJ-002, Days 1-5 tasks)
  - [ ] Configure quality policy, NC types, CAPA workflow stages
  - [ ] Import supplier list

---

## Week 3: Operational Modules

### Day 15-17: Health & Safety

- [ ] Follow H&S setup checklist (KB-OJ-001, Days 1-7 tasks)
  - [ ] Configure locations, hazard categories, incident types, severity levels
  - [ ] Set up PTW templates and approval workflow
  - [ ] Import risk assessments

### Day 18-19: Training Management

- [ ] Follow Training setup checklist (KB-OJ-005, Days 1-7 tasks)
  - [ ] Define training categories and training item library
  - [ ] Import employee training history
  - [ ] Begin mapping training matrix

### Day 20-21: Incident Management & HR

- [ ] Navigate to Incidents → Settings
  - [ ] Configure incident types, severity levels, investigation workflow
  - [ ] Set up notification rules per severity
- [ ] Follow HR setup checklist (KB-OJ-008, Days 1-7 tasks)
  - [ ] Configure organisation structure, employment types, leave categories
  - [ ] Import employee master data

---

## Week 4: Reporting & Portal Modules

### Day 22-25: Management Review & Dashboards

- [ ] Navigate to Management Review → Settings
  - [ ] Configure management review schedule (typically quarterly)
  - [ ] Define which data sources feed into the management review report (H&S, Quality, Environmental, Audit, Risk, Training, HR)
  - [ ] Generate the first management review data pack — even if data is sparse, confirm the template works
- [ ] Navigate to Dashboard → Widgets
  - [ ] Configure the main dashboard to show KPI widgets from each active module
  - [ ] Set role-based dashboard views: what does a Safety Officer see vs. a Finance Manager vs. a CEO?

### Day 26-28: Customer & Supplier Portals (if in scope)

- [ ] Follow Customer Portal setup (KB-OJ-011, Days 1-5 tasks)
  - [ ] Configure branding, document types, customer tiers
  - [ ] Invite pilot customers (5-10)
- [ ] Follow Supplier Portal setup (KB-OJ-009, Days 1-5 tasks)
  - [ ] Configure supplier categories, qualification criteria, scorecard
  - [ ] Invite top 10 strategic suppliers

### Day 29-30: Integration Testing & Go-Live Sign-Off

- [ ] Run end-to-end integration test scenarios:
  - [ ] Log an incident → link to risk register → raise CAPA → assign corrective action → close CAPA
  - [ ] Create a new employee → assign training plan → complete onboarding checklist
  - [ ] Raise a nonconformance → trigger CAPA → link to supplier → close supplier NC
  - [ ] Conduct a mini audit → raise finding → raise CAPA → link to risk
- [ ] Confirm all cross-module workflows operate correctly
- [ ] Generate the integrated management review report: confirm data from all modules appears
- [ ] Obtain Executive Sponsor sign-off: all modules are live and functioning

---

## Change Management Tips

Successful IMS adoption depends on people, not technology. Key success factors:

1. **Executive Sponsorship**: Your sponsor must visibly use the system and reference it in meetings. If leadership doesn't use IMS, adoption will stall.
2. **WIIFM (What Is In It For Me)**: For each user group, explain how IMS makes their job easier — not just that it's a compliance requirement.
3. **Super Users**: Identify one enthusiastic super user per department who becomes the go-to internal expert.
4. **Training First, Go-Live Second**: Never go live without training the affected users first — even a 30-minute session.
5. **Data Quality**: Garbage in, garbage out. Spend time on clean data import — it is the foundation for all reports.
6. **Quick Wins**: Identify 2-3 things IMS does better than your old system and communicate them in the first week.
7. **Feedback Loop**: Set up a simple way for users to report issues or suggestions (a shared email or Slack channel) and respond to every message within 24 hours.

---

## Success Criteria

- [ ] All in-scope modules live with at least one real record in each
- [ ] All key users trained (minimum: every module has at least one trained super user)
- [ ] Cross-module workflows tested and functioning
- [ ] First integrated management review report generated
- [ ] Executive Sponsor has logged in and reviewed the dashboard
- [ ] Legacy systems archived or decommissioned (or a clear date set)

---

## Next Steps After Go-Live

**Month 2:**
- Enable Finance, ESG, and remaining operational modules (CMMS, Field Service, Payroll)
- Begin the first formal management system internal audit using IMS
- Review all imported data for completeness and quality

**Month 3:**
- Conduct first quarterly management review meeting using IMS data exclusively
- Begin ISO certification preparation using IMS audit checklists and evidence packs
- Set up data governance review: confirm all modules have data owners and review schedules
- Plan advanced features: analytics dashboards, AI assistant, global search, mobile access
`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['onboarding', 'getting-started', 'full-rollout', 'implementation'],
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
