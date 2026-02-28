import type { KBArticle } from '../types';

export const moduleDeepDives6Articles: KBArticle[] = [
  // ─── REGULATORY MONITOR MODULE ───────────────────────────────────────────
  {
    id: 'KB-DD6-001',
    title: 'Regulatory Monitor Day-to-Day User Guide',
    content: `## Regulatory Monitor Day-to-Day User Guide

The Regulatory Monitor module keeps your organisation ahead of legislative change. This guide covers the routine tasks you will perform each day when managing regulatory compliance.

### Accessing the Dashboard

Open the Regulatory Monitor from the main navigation. The dashboard presents four key panels:

- **Pending Assessments** — regulatory changes received but not yet assessed for organisational impact
- **Upcoming Compliance Deadlines** — legislation coming into force within the next 30, 60, and 90 days
- **Regulatory Change Feed** — live stream of new alerts from your configured jurisdictional feeds
- **Action Status** — open compliance actions assigned to team members

### Reviewing New Regulatory Alerts

Each alert card shows the jurisdiction, legislation name, type of change (new regulation, amendment, repeal), and the effective date. Click an alert to open the full summary. Read the description, note the effective date, and use the **Assess Impact** button to begin the impact assessment workflow.

### Assessing Impact of a Regulatory Change

Impact assessment follows a four-step workflow:

1. **Relevance** — confirm whether the change applies to your organisation's activities, products, or locations
2. **Impact** — identify which processes, sites, and functions are affected
3. **Gap Analysis** — compare current practice against the new requirement
4. **Action Planning** — assign compliance actions with owners and target dates

Once all four steps are completed, mark the assessment as **Complete** and the change moves from the feed to the Legal Register.

### Updating the Legal Register

Completed assessments automatically populate a new entry in the Legal Register with status **Assessed**. Review the pre-filled fields, add any additional context, and confirm the compliance status: Compliant, Non-Compliant, or Partially Compliant.

### Assigning Compliance Actions

From the assessment, use **Add Action** to create a compliance action linked to the regulatory change. Set the owner, due date, and evidence requirements. Actions appear in the assignee's task queue and are visible on the main dashboard until closed.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['regulatory', 'compliance', 'legal-register'],
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
    id: 'KB-DD6-002',
    title: 'Setting Up Regulatory Feeds',
    content: `## Setting Up Regulatory Feeds

Regulatory feeds are the foundation of the Regulatory Monitor module. Correctly configured feeds ensure your team receives timely alerts about legislation relevant to your organisation.

### Configuring Jurisdiction-Based Feeds

Navigate to **Settings → Regulatory Feeds → Add Feed**. Select the jurisdictions you operate in: country-level feeds cover national legislation, while state or province feeds cover regional law. You can subscribe to multiple jurisdictions simultaneously.

For each jurisdiction, select the **industry sectors** that apply to your operations: Health & Safety, Environment, Food & Beverage, Finance & Accounting, Information Security, and others. Narrower sector selection reduces noise in your feed.

### Subscribing to Legislation Areas

Within each sector, subscribe to specific legislation areas. For example, within Health & Safety you might select: workplace safety regulations, hazardous substances, working time, and noise at work. Deselect areas that do not apply to minimise irrelevant alerts.

### Custom Watchlist Keywords

Add keywords to your watchlist to catch legislation that spans multiple sectors. Example keywords: 'per- and polyfluoroalkyl substances', 'carbon border adjustment', 'AI liability', 'supply chain due diligence'. Alerts containing your keywords appear in the feed regardless of sector classification.

### Feed Frequency Settings

Choose how often the system polls each feed source:

- **Real-time** — suitable for high-priority regulatory areas
- **Daily** — standard setting for most jurisdictions
- **Weekly** — appropriate for stable legislative environments

### Notification Settings

Configure who receives alert notifications. Options include: email digest (daily or weekly summary), in-app notification badge, push notification for mobile app, and direct assignment to a named compliance owner. Use role-based routing to send alerts to the relevant functional team automatically.

### Testing Your Feed Configuration

After saving, click **Send Test Alert** to verify that a sample alert reaches your nominated recipients. Review the feed configuration annually and after any significant change to your operating footprint.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['regulatory', 'compliance', 'legal-register'],
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
    id: 'KB-DD6-003',
    title: 'Regulatory Change Assessment Process',
    content: `## Regulatory Change Assessment Process

When a new regulatory change alert arrives, a structured assessment process ensures your organisation understands what is required and responds appropriately before the effective date.

### Step 1 — Receiving the Alert

The assigned compliance reviewer receives an in-app notification and email linking to the regulatory change record. The record shows the originating feed, jurisdiction, legislation name, change type (new, amendment, repeal, consultation), and effective date. Review the source document link where provided.

### Step 2 — Initial Relevance Determination

Before investing effort in a full assessment, confirm relevance. Ask: Does this legislation apply to our industry sector? Does it cover activities, products, or locations we operate? If irrelevant, mark as **Not Applicable** with a brief justification. The record is filed and excluded from further tracking.

### Step 3 — Impact Assessment

For relevant changes, open the impact assessment form and identify:

- **Processes** affected — which documented procedures need updating
- **Products or services** affected — any changes to specifications, labelling, or approvals
- **Sites or locations** affected — jurisdiction-specific requirements

Rate the impact: High (immediate compliance action required), Medium (managed improvement programme), or Low (monitoring only).

### Step 4 — Gap Analysis

Compare your current practice against the new requirement. Document non-compliant areas with supporting evidence. Classify each gap as **Immediate** (must be closed before effective date) or **Transitional** (grace period applies).

### Step 5 — Action Planning

For each identified gap, create a compliance action: description, owner, target date, and evidence of closure required. Actions created here link automatically to the Regulatory Change record and the Legal Register entry.

### Assessment Workflow Approval

Completed assessments route through a defined approval workflow: **Reviewer → Compliance Manager → Management**. Each approver reviews the assessment and either approves or returns it with comments. Once approved, the Legal Register is updated automatically.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['regulatory', 'compliance', 'legal-register'],
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
    id: 'KB-DD6-004',
    title: 'Compliance Gap Analysis',
    content: `## Compliance Gap Analysis

A compliance gap analysis identifies the difference between your current practice and what a new or updated regulation requires. A rigorous gap analysis is the foundation of a credible compliance action plan.

### Methodology

Begin by obtaining the full text of the new requirement. Break it into individual obligations — specific things your organisation must do, must not do, or must demonstrate. For each obligation, assess your current practice against that requirement.

Map each obligation to the relevant processes, procedures, systems, or controls already in place. Where a match exists and the obligation is met, record the evidence reference. Where no match exists or the current practice falls short, document the gap.

### Gap Documentation

Each gap is documented with:

- **Requirement** — the specific legal obligation text
- **Current Practice** — what the organisation currently does
- **Gap Description** — the difference between the two
- **Evidence of Gap** — how you confirmed the shortfall
- **Gap Severity** — Immediate (must resolve before effective date) or Transitional (grace period applies)

### Gap Severity Classification

Classify gaps using two criteria: **regulatory urgency** (is there a fixed deadline?) and **risk level** (what is the consequence of non-compliance — enforcement action, financial penalty, harm to people or environment?). High-urgency, high-risk gaps must be addressed first.

### Action Planning

For each documented gap, create a compliance action in IMS. Each action requires: a clear description of what must change, the process or system owner responsible, a target completion date before the effective date, and the evidence that will demonstrate closure.

### Gap Closure Tracking

Use the Regulatory Monitor dashboard to track gap closure progress. A progress bar shows percentage of actions closed for each regulatory change. Overdue actions are highlighted in red and escalated to the compliance manager.

### Management Summary Report

Generate the **Gap Analysis Report** from the Actions menu. This formatted document is suitable for presenting to management and for ISO certification auditors reviewing evidence of regulatory compliance activity.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['regulatory', 'compliance', 'legal-register'],
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
    id: 'KB-DD6-005',
    title: 'Legal Register Management',
    content: `## Legal Register Management

The Legal Register is the definitive record of all legal and regulatory requirements that apply to your organisation. It is a mandatory documented information requirement for ISO 9001, ISO 14001, ISO 45001, and ISO 27001 certification.

### Legal Register Contents

Each entry in the Legal Register contains:

- **Legislation Name** — full official title
- **Reference** — legislation number or citation
- **Jurisdiction** — country, state, or sector body
- **Applicable Processes** — which business processes this legislation governs
- **Compliance Status** — Compliant, Non-Compliant, Partially Compliant, Under Assessment
- **Compliance Evidence** — link to documented evidence of compliance
- **Next Review Date** — when this entry must next be re-assessed

### Adding a New Legal Requirement

Requirements can be added manually (click **Add Requirement** and complete the form) or automatically from a completed regulatory change assessment. Automatic addition pre-fills fields from the assessment record, saving time and reducing transcription errors.

### Compliance Assessment

For each legal requirement, document how compliance is achieved. Attach evidence: policy documents, procedure references, training records, inspection reports, or test results. Rate overall compliance status honestly — the register is for internal management and continuous improvement.

### Non-Compliance Recording

If an entry is assessed as Non-Compliant or Partially Compliant, the system prompts you to create a corrective action. Non-compliance is escalated to the compliance manager. Where the non-compliance carries regulatory risk, an immediate notification is sent to management.

### Review Frequency

Legal Register entries should be reviewed:

- **Annually** — for stable, long-standing legislation
- **Real-time** — for active regulatory feed entries as new changes arrive
- **Triggered** — after a significant operational change, new site, new product, or regulatory inspection

### Legal Register Report

Generate the **Legal Register Report** for ISO certification audits. This formatted document lists all requirements, compliance status, and evidence references — the standard format expected by certification bodies.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['regulatory', 'compliance', 'legal-register'],
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
    id: 'KB-DD6-006',
    title: 'Regulatory Monitor Integration',
    content: `## Regulatory Monitor Integration

The Regulatory Monitor module is most powerful when connected to other IMS modules. Integration ensures that regulatory changes automatically trigger the right actions across your management system.

### Integration with the Environmental Module

Environmental legislation identified in the Regulatory Monitor feeds directly into the Environmental module's Legal Register. Changes to emissions legislation, waste regulations, or water discharge consents appear automatically in the Environmental Legal Requirements list, prompting reassessment of environmental aspects.

### Integration with Health & Safety

OHS legislation changes identified by the Regulatory Monitor feed into the H&S module's legal requirements register. New or updated safety regulations trigger review of risk assessments and safe work procedures. The H&S module displays an alert banner when linked regulatory changes are pending assessment.

### Integration with Food Safety

Food safety legislation — labelling requirements, allergen rules, hygiene regulations — flows from the Regulatory Monitor into the Food Safety module's compliance register. HACCP plans can be flagged for review when relevant legislation changes.

### Integration with Document Control

When a regulatory change is assessed as requiring a procedure update, the integration creates a document revision task in the Document Control module. The new regulation is linked to the affected documents so auditors can trace the legislative trigger for each document revision.

### Integration with Audit Management

The Legal Register in the Regulatory Monitor provides the schedule of compliance requirements against which compliance audits are planned. The Audit Management module can automatically suggest audit scope items based on recently added or changed legal requirements.

### Integration with Management Review

The Regulatory Monitor generates a **Regulatory Landscape Summary** report formatted as a Management Review input. This summarises new legislation received, assessments completed, compliance status changes, and upcoming deadlines — everything a management team needs to fulfil the ISO requirement to review compliance obligations.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['regulatory', 'compliance', 'legal-register'],
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
    id: 'KB-DD6-007',
    title: 'Regulatory Reporting & Compliance Dashboard',
    content: `## Regulatory Reporting & Compliance Dashboard

The Regulatory Monitor dashboard provides a real-time view of your organisation's regulatory compliance posture. Understanding each panel helps you act quickly on the metrics that matter most.

### Compliance Status Overview

The summary panel shows your legal register entries by compliance status:

- **Compliant** — percentage of requirements with documented compliance evidence
- **Non-Compliant** — requirements where gaps exist and corrective actions are open
- **Partially Compliant** — requirements where some but not all obligations are met
- **Needs Assessment** — new requirements not yet evaluated

A high proportion of compliant requirements does not mean all risks are managed — focus particularly on the non-compliant and needs-assessment categories.

### Regulatory Change Activity

This chart shows the volume of regulatory changes received versus assessed per month. A growing backlog of unassessed changes is an early warning of resourcing pressure or alert overload, which may indicate the need to refine feed configuration.

### Action Plan Status

Open compliance actions are listed with owner, due date, and days remaining. Actions fewer than 14 days from their due date are highlighted in amber; overdue actions appear in red. Use this panel in team meetings to drive accountability.

### Upcoming Deadlines

Regulations coming into force in the next 30, 60, and 90 days are listed with the number of open actions per regulation. This allows prioritisation of effort on regulations with imminent effective dates.

### Compliance Evidence Completeness

This metric measures the percentage of compliant legal register entries that have attached documentary evidence. Entries claiming compliance without evidence are a certification audit risk.

### Regulatory Risk Register

High-risk non-compliance areas are surfaced as a risk register summary, allowing direct escalation to the Enterprise Risk Register module. This creates a transparent link from regulatory exposure to the organisation's overall risk profile.

### Exporting Reports

All dashboard panels can be exported as PDF or CSV. The **Regulatory Compliance Report** template generates a formatted management report combining all panels with an executive summary narrative.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['regulatory', 'compliance', 'legal-register'],
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
    id: 'KB-DD6-008',
    title: 'Regulatory Compliance Best Practices',
    content: `## Regulatory Compliance Best Practices

Effective regulatory compliance management goes beyond tracking legislation. The following practices help organisations build a proactive, sustainable compliance culture.

### Proactive Monitoring

The most effective organisations scan for regulatory change before it takes effect, not after. Configure your regulatory feeds to capture consultation papers and proposed legislation, not just enacted law. This gives you up to 12 months' notice of changes rather than weeks.

### Regulatory Compliance Calendar

Maintain a forward-looking compliance calendar showing: effective dates for upcoming legislation, scheduled legal register reviews, annual compliance report deadlines, and regulatory licence renewal dates. Publish this calendar to all compliance stakeholders.

### Cross-Functional Compliance Teams

Regulatory compliance requires input from multiple disciplines. Build cross-functional teams with legal expertise (interpreting the legislation), technical expertise (assessing operational impact), and management authority (approving actions and resource). A single compliance officer cannot manage complex regulatory environments alone.

### Regulatory Intelligence Sharing

Keep all relevant stakeholders informed of the regulatory landscape. Regular briefings — a monthly regulatory digest — help operational teams understand why procedures are changing and build a culture where compliance is understood as necessary rather than bureaucratic.

### Compliance Documentation

Maintain clear, retrievable evidence of compliance. Every legal register entry should be traceable to specific evidence: a procedure, a test result, a training record, or an inspection report. Undocumented compliance is indistinguishable from non-compliance during an audit.

### Building Regulatory Change into Business Planning

Major regulatory changes carry implementation costs. Embed regulatory horizon scanning into business planning and budgeting processes. Finance and operations leaders should understand upcoming compliance obligations 12–24 months ahead to plan resources.

### Engaging with Regulators

Proactive engagement with regulatory bodies — participating in public consultations, attending industry forums, and maintaining relationships with enforcement officers — provides early intelligence on regulatory intent and demonstrates good faith. Regulators generally deal more favourably with organisations that demonstrate proactive compliance management.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['regulatory', 'compliance', 'legal-register'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },

  // ─── MANAGEMENT REVIEW MODULE ────────────────────────────────────────────
  {
    id: 'KB-DD6-009',
    title: 'Management Review Day-to-Day User Guide',
    content: `## Management Review Day-to-Day User Guide

The Management Review module supports the top management review process required by all major ISO management system standards. This guide covers the tasks you will perform regularly as a system manager, data owner, or management review coordinator.

### Navigating the Module

From the main navigation, open Management Review. The landing page shows:

- **Upcoming Reviews** — scheduled management review meetings with date, scope, and status
- **Outstanding Actions** — actions from previous reviews that remain open
- **Review Schedule Compliance** — whether reviews are being conducted at the required frequency
- **Data Collection Status** — completeness of input data for the next scheduled review

### Creating and Scheduling a Management Review

Click **New Review** and complete the setup form: review name, scope (which standard(s)), scheduled date, meeting duration, lead facilitator, and required participants. The system sends calendar invitations to all participants and creates data collection tasks for each nominated data owner.

### Submitting Input Data as a Data Owner

If you are nominated as a data owner, you will receive a notification requesting your input data before the review. Open the linked task, complete the input form for your area (e.g., audit results, process KPI, supplier performance), and submit. Your submission is confirmed and visible to the review coordinator.

### Reviewing Action Status

Outstanding actions from previous reviews are displayed in the Actions panel. Each action shows the description, owner, due date, and current progress status. Action owners can update progress directly from this view by adding a progress note and changing the status to In Progress, Complete, or Overdue (with justification).

### Dashboard Summary

The dashboard provides at-a-glance compliance: percentage of reviews conducted on schedule, percentage of actions closed on time, and average days to close actions. Use these metrics to demonstrate management review programme effectiveness to certification auditors.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['management-review', 'iso-9001', 'leadership'],
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
    id: 'KB-DD6-010',
    title: 'Planning the Management Review Meeting',
    content: `## Planning the Management Review Meeting

A well-planned management review is the difference between a productive strategic discussion and an ineffective compliance exercise. This article covers the planning steps required to make your management review genuinely valuable.

### Frequency Requirements

ISO standards require management review at planned intervals, with a minimum of annually for most organisations. However, immature or newly implemented systems benefit from more frequent reviews — quarterly in the first year of certification. High-risk organisations often conduct monthly health checks supplemented by a formal annual review.

### Review Scope: Single vs Integrated

Define the scope before planning the agenda. A single-standard review covers one ISO standard (e.g., ISO 9001 only). An integrated review covers multiple standards in one meeting — typically ISO 9001, ISO 14001, ISO 45001, and ISO 27001 together. An integrated review is more efficient but requires broader participant preparation.

### Agenda Development

IMS provides a pre-built agenda template for combined ISO 9001/14001/45001/27001 reviews. The template covers all mandatory inputs per standard and can be customised by removing sections not applicable to your scope. Circulate the draft agenda to participants at least two weeks before the meeting.

### Participant Roles

Effective management reviews require genuine top management participation — not just attendance. Define roles clearly:

- **Chair** — typically the CEO or Managing Director; responsible for decisions
- **System Managers** — present data and system performance for each standard
- **Process Owners** — present KPI data for their processes
- **Compliance Manager** — presents regulatory compliance status

### Meeting Logistics

Issue the pre-read pack (input data summary) to all participants at least five working days before the meeting. Set a data submission deadline two days before the pre-read is due so the coordinator can collate and quality-check inputs. Schedule the review as a recurring calendar event to maintain frequency discipline.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['management-review', 'iso-9001', 'leadership'],
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
    id: 'KB-DD6-011',
    title: 'Management Review Inputs & Data Collection',
    content: `## Management Review Inputs & Data Collection

ISO standards specify the inputs that must be considered at each management review. Collecting complete, accurate data from across your management system is essential for a credible review.

### Mandatory Inputs Per ISO Standard

All major ISO management system standards require the following inputs:

- **Changes in internal and external context** — significant changes to the organisation's environment since the last review
- **Interested party issues** — concerns and feedback from customers, regulators, employees, and other stakeholders
- **Previous action status** — update on all actions arising from the last management review
- **Process performance and conformity** — KPI results for key processes
- **Audit results** — internal audit programme results and any external audit findings
- **Non-conformances and CAPAs** — non-conformance trends and corrective action effectiveness
- **Monitoring and measurement results** — environmental, safety, quality measurement data as applicable
- **Supplier and external provider performance** — key supplier performance metrics
- **Objectives performance** — progress against management system objectives
- **Risks and opportunities** — significant risks and opportunities identified since the last review
- **Regulatory changes** — new or changed legislation affecting the organisation

### Automated Data Pull

When IMS modules are connected, relevant data is pulled automatically for the review. The system populates audit results from the Audit module, NCR trends from the CAPA module, and objective progress from the Objectives module, reducing manual data collection effort.

### Data Quality Check

Before generating the pre-read pack, the management review coordinator should check data completeness. IMS flags data owners who have not submitted their inputs and sends automated reminders. Incomplete inputs should be followed up personally if automated reminders are not actioned.

### Input Pack Generation

Once all inputs are collected, use **Generate Pre-Read** to produce a formatted management review input document. This document combines all inputs into a structured summary, suitable for distribution to management and for retention as evidence of the review process.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['management-review', 'iso-9001', 'leadership'],
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
    id: 'KB-DD6-012',
    title: 'Management Review Outputs & Action Items',
    content: `## Management Review Outputs & Action Items

Management review outputs are decisions and actions that drive continual improvement. Capturing and tracking these outputs rigorously is what makes the management review process effective rather than ceremonial.

### Required Outputs Per ISO Standard

ISO management system standards require management review to produce documented outputs addressing:

- **System effectiveness** — conclusions on whether the management system is achieving its intended outcomes
- **Continual improvement opportunities** — specific improvements to be pursued
- **Resource needs** — decisions on additional resources required for the management system
- **Changes to the management system** — updates to scope, policy, objectives, or processes
- **Strategic opportunities** — business opportunities identified through the management system lens

### Recording Decisions

During the meeting, the nominated minutes-taker records decisions directly in IMS using the **Minutes** panel. The structured format prompts input for each required output, ensuring no mandatory topic is omitted. Decisions are recorded as agreed statements, not open questions.

### Action Items

Each improvement opportunity or resource decision results in an action item. Complete the action form:

- **Description** — what must be done, stated clearly
- **Owner** — the named individual responsible
- **Due Date** — realistic target for completion
- **Evidence Required** — what will demonstrate the action is complete

Actions are assigned to owners immediately from the meeting interface. Owners receive notification and the action appears in their task queue.

### Action Tracking Between Reviews

Between reviews, action owners update progress in IMS. The management review coordinator monitors action status via the dashboard. Actions overdue at the next review are highlighted in the previous-action-status input, creating accountability.

### Output Communication

Once minutes are approved, they are distributed to all participants and relevant process owners via IMS notification. Minutes are stored as a review record and are retrievable for certification audit evidence.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['management-review', 'iso-9001', 'leadership'],
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
    id: 'KB-DD6-013',
    title: 'Multi-Standard Integrated Management Review',
    content: `## Multi-Standard Integrated Management Review

Running a single integrated management review for multiple ISO standards is a significant efficiency gain for organisations with an Integrated Management System. This article explains how to conduct an effective integrated review.

### Scope of an Integrated Review

An integrated review typically covers ISO 9001 (Quality), ISO 14001 (Environment), ISO 45001 (Health & Safety), and ISO 27001 (Information Security) in a single meeting. All four standards require annual management review, so combining them eliminates three additional meetings while satisfying all requirements.

### Common Review Inputs

Many management review inputs apply across all standards: context changes, interested party issues, previous action status, objectives performance, internal audit results, and resource requirements. Collect these once and present them as shared inputs applicable to all management systems.

### Standard-Specific Sections

After the common inputs, the integrated review addresses standard-specific items:

- **ISO 9001** — customer satisfaction data, product/service conformity, process performance
- **ISO 14001** — significant environmental aspects, environmental performance, legal compliance
- **ISO 45001** — OH&S performance, incidents and near misses, worker consultation and participation
- **ISO 27001** — information security risk treatment, security incidents, technology changes

IMS provides a combined agenda template with dedicated sections for each standard while sharing common input sections.

### Evidence Pack for Multiple Certification Bodies

If you hold certification from multiple certification bodies (e.g., one body for ISO 9001/14001, another for ISO 45001), the integrated review record satisfies both. Ensure the minutes clearly reference each standard so auditors can identify the relevant sections.

### Cross-Standard Improvement Opportunities

An integrated review enables the identification of improvements that benefit multiple systems simultaneously. For example, an improved data management process may improve quality records, environmental records, and security simultaneously — an insight that single-standard reviews would miss.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['management-review', 'iso-9001', 'leadership'],
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
    id: 'KB-DD6-014',
    title: 'Management Review Frequency & Scheduling',
    content: `## Management Review Frequency & Scheduling

Getting the frequency and scheduling of management reviews right is crucial for both compliance and system effectiveness. This article covers the requirements and the practical options available.

### Minimum Frequency by Standard

All major ISO management system standards (ISO 9001, ISO 14001, ISO 45001, ISO 27001) require management review at **planned intervals** with a minimum of annually. The standard language gives flexibility — more frequent reviews are always permissible and often advisable.

### Recommended Review Cycle

For most organisations, a tiered approach works well:

- **Monthly health checks** — a brief 30-minute review of key metrics by the management team; not a formal ISO management review but maintains awareness between formal reviews
- **Quarterly deep dives** — a 2-hour structured review of system performance, suitable for organisations with high-risk activities or rapidly changing environments
- **Annual formal review** — the complete review covering all mandatory inputs and outputs, documented as the formal ISO management review

### Trigger Reviews

Certain events should trigger an unscheduled management review in addition to the routine cycle:

- A significant incident or major customer complaint
- A major regulatory change with significant compliance implications
- A merger, acquisition, or major restructuring
- Significant changes in the competitive or operating environment

IMS allows you to create an ad-hoc review at any time using **New Review → Triggered Review**.

### Management Review Calendar

Create a recurring management review schedule in IMS at the start of each year. Set reminders for data owners 30 days before each review and for participants 14 days before. Publish the calendar to all system managers and process owners.

### Ensuring Genuine Top Management Involvement

The review must involve top management — not be delegated to system managers alone. Scheduling reviews as fixed calendar commitments for senior leadership, with adequate preparation time, is the most effective way to ensure genuine engagement.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['management-review', 'iso-9001', 'leadership'],
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
    id: 'KB-DD6-015',
    title: 'Management Review Records & Evidence',
    content: `## Management Review Records & Evidence

Management review records are mandatory documented information under all major ISO management system standards. This article covers what records are required, how long to keep them, and how to make them available for certification audits.

### What Records Must Be Kept

The following must be retained for each management review:

- **Attendance record** — who participated (name, role, and confirmation of attendance)
- **Agenda** — the topics covered and the scope of the review
- **Pre-read pack** — the input data provided to participants before the meeting
- **Minutes** — the decisions made and their rationale
- **Action log** — all actions arising, with owners and due dates

IMS captures and stores all of these automatically as part of the review workflow.

### Retention Requirements

For most ISO standards, management review records should be retained for a minimum of three years. Organisations with longer regulatory retention requirements (e.g., in regulated industries) should retain records for the period specified by their sector regulator, typically five to seven years. Configure the IMS document retention policy to match your requirement.

### Evidence for Certification Body

Management review records are one of the first items a certification body auditor will request. They demonstrate that top management is actively engaged with the management system — not just nominally responsible. The IMS Management Review module generates a formatted evidence pack combining all records for a given review in a single document.

### Auditor Access

Provide auditors with read-only access to the Management Review module rather than exporting paper records. This allows auditors to browse the review history, drill into individual records, and verify action closure — all without leaving IMS.

### Linking Actions to CAPA

Management review actions that identify systemic issues may be better managed as formal corrective actions. IMS allows you to promote a management review action to a CAPA record with a single click, ensuring full corrective action tracking and root cause analysis.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['management-review', 'iso-9001', 'leadership'],
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
    id: 'KB-DD6-016',
    title: 'Management Review Best Practices',
    content: `## Management Review Best Practices

The management review is one of the highest-leverage activities in any management system. When done well it drives strategic improvement; when done poorly it becomes an annual compliance checkbox. The following practices distinguish the best management review programmes.

### Securing Genuine Top Management Engagement

The management review must involve leaders who have the authority to make decisions and allocate resources. Securing genuine engagement requires linking the management system to business strategy — show top management how system performance data relates to business outcomes they care about: customer retention, cost reduction, risk exposure, and regulatory standing.

### Preparing Engaging Pre-Read Materials

Walls of tables are not engaging pre-read. Present input data as dashboards: trend charts showing whether performance is improving or declining, traffic-light summaries highlighting areas requiring attention, and brief narratives explaining the significance of the data. Management should arrive at the review already understanding the key issues.

### Action Ownership by Senior Leaders

Actions from management review are most effective when owned by senior leaders, not delegated entirely to system managers. When a director commits to resolving a resourcing constraint by a specific date, it signals that the management system is taken seriously.

### Connecting Outputs to Business Planning

Management review outputs should feed directly into business planning. Resource decisions, strategic improvement priorities, and objectives changes should align with the annual business plan cycle. An integrated planning process ensures the management system is embedded in the business rather than running parallel to it.

### Celebrating Successes

Management reviews should not only surface problems. Begin each review by acknowledging improvements achieved since the last review. Recognition of progress motivates the teams behind the data and demonstrates that the system drives real results.

### Year-on-Year Benchmarking

Use the analytics module to compare current performance with the same period in previous years. Trends across multiple review cycles reveal the true trajectory of system maturity and provide compelling evidence of continual improvement for certification bodies.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['management-review', 'iso-9001', 'leadership'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },

  // ─── CHEMICAL REGISTER MODULE ─────────────────────────────────────────────
  {
    id: 'KB-DD6-017',
    title: 'Chemical Register Day-to-Day User Guide',
    content: `## Chemical Register Day-to-Day User Guide

The Chemical Register module centralises all information about hazardous substances used in your organisation. This guide covers the routine tasks you will perform when managing chemical safety day to day.

### Daily Chemical Management Tasks

Begin each day by reviewing the Chemical Register dashboard for items requiring attention:

- **SDS Currency** — Safety Data Sheets flagged as overdue for review (past their scheduled review date or superseded by a new supplier version)
- **Inventory Levels** — chemicals approaching minimum stock or maximum storage limits
- **Usage Logs** — recent chemical usage entries awaiting supervisor review
- **Disposal Records** — waste chemical disposal records pending completion

### Chemical Dashboard Overview

The dashboard provides four key metrics:

- **Total Chemicals** — count of active chemicals in the register across all sites
- **High-Hazard Chemicals** — chemicals classified with a GHS skull-and-crossbones, corrosion, or flammable hazard
- **SDSs Due for Review** — count of Safety Data Sheets whose review date has passed
- **Regulatory Compliance Status** — traffic-light indicator of REACH, RoHS, and other regulatory compliance

### Quick Actions

From the dashboard toolbar:

- **Add Chemical** — register a new substance with full SDS upload
- **Log Usage** — record daily or batch chemical usage
- **Request SDS Update** — send an automated request to the supplier for the latest SDS version

### Mobile Access

The IMS mobile app provides field access to the Chemical Register. Scan the QR code on a chemical label to open the full SDS, view PPE requirements, and access first aid measures on your phone — essential for first responders and workers in the field. Ensure all chemical labels carry IMS-generated QR codes printed from the label tool.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['chemicals', 'hazmat', 'sds', 'reach'],
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
    id: 'KB-DD6-018',
    title: 'Adding & Managing Chemicals (SDS)',
    content: `## Adding & Managing Chemicals (SDS)

Maintaining an accurate chemical register with current Safety Data Sheets is a legal requirement in most jurisdictions. This article covers how to add new chemicals and manage the SDS lifecycle in IMS.

### Chemical Record Fields

When adding a new chemical, complete the following fields:

- **CAS Number** — unique chemical identifier; used for regulatory screening
- **Product Name** — commercial name as it appears on the label and SDS
- **Supplier** — linked to the supplier register
- **GHS Hazard Classification** — hazard class(es) and category from Section 2 of the SDS
- **GHS Signal Word** — Danger or Warning
- **PPE Requirements** — specific PPE required from Section 8 of the SDS
- **Storage Requirements** — temperature, segregation, ventilation requirements from Section 7
- **First Aid Measures** — summary from Section 4 for emergency responders

### SDS Upload

Upload the current SDS as a PDF attachment. IMS stores the version with upload date and uploader name. Multiple SDS versions are retained in the version history — older versions are archived but accessible for historical incident investigation.

### SDS Review Cycle

SDS documents must be reviewed when:

- The supplier issues a new version (system prompts when a newer version request is returned)
- Legislation changes affect classification or labelling
- The 3-year default review cycle is reached

### SDS Request Workflow

To request an updated SDS from a supplier, click **Request SDS**. The system sends a formatted email to the supplier contact requesting the latest version, logs the request, and sets a 30-day follow-up reminder. This creates an auditable trail of SDS management diligence.

### SDS Library Management

Use the SDS library view to browse all chemicals organised by GHS hazard class and storage location. This view is useful for storage segregation planning and for identifying chemical substitution opportunities — replacing high-hazard substances with safer alternatives in the same functional category.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['chemicals', 'hazmat', 'sds', 'reach'],
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
    id: 'KB-DD6-019',
    title: 'Hazard Classification & GHS Labels',
    content: `## Hazard Classification & GHS Labels

The Globally Harmonised System of Classification and Labelling of Chemicals (GHS) is the international standard for communicating chemical hazards. This article explains how to apply GHS classification in IMS and generate compliant labels.

### GHS Classification Framework

GHS classifies chemicals into hazard classes (the type of hazard) and categories (the severity level within that class). Key hazard classes include:

- **Physical hazards** — flammable liquids, explosives, oxidisers, compressed gases
- **Health hazards** — acute toxicity, skin corrosion, respiratory sensitisation, carcinogens, reproductive toxicants
- **Environmental hazards** — aquatic toxicity (acute and chronic)

Categories run from 1 (most severe) to 4 or 5 (least severe) depending on the hazard class.

### GHS Label Elements

Every GHS-compliant label must include:

- **Signal Word** — Danger (categories 1–2 for most hazard classes) or Warning (categories 3–4)
- **Hazard Statements (H-statements)** — standardised phrases describing the nature of the hazard
- **Precautionary Statements (P-statements)** — measures to minimise or prevent adverse effects
- **Pictograms** — standardised symbols (skull, flame, corrosion, exclamation mark, etc.)

IMS generates these elements from the hazard classification data entered in the chemical record.

### Classification Validation

IMS highlights discrepancies between your entered classification and the classification shown on the uploaded SDS. Review and resolve discrepancies before approving the chemical record.

### Label Printing

Print GHS-compliant labels from the chemical record. Labels include the product name, supplier, hazard pictograms, signal word, H-statements, P-statements, and a QR code linking to the SDS. Labels are formatted for standard label stock sizes.

### Regulatory Classification Schemes

Different jurisdictions implement GHS with variations: CLP Regulation (EU), OSHA HazCom 2012 (US), WHMIS 2015 (Canada), and others. IMS allows you to flag jurisdiction-specific classification requirements and generate labels compliant with the jurisdiction relevant to each site.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['chemicals', 'hazmat', 'sds', 'reach'],
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
    id: 'KB-DD6-020',
    title: 'Chemical Risk Assessment',
    content: `## Chemical Risk Assessment

A chemical risk assessment evaluates the risk posed by hazardous substances to workers and determines the controls needed to manage that risk. This process is known as COSHH assessment in the UK and has equivalent frameworks in other jurisdictions.

### Assessment Methodology

Open the chemical risk assessment form from the Chemical Register record. The structured methodology follows five steps:

**1. Identify the Chemical Hazard**
Review the SDS to identify all relevant hazard classifications. Note the most significant health hazards: acute toxicity, carcinogenicity, sensitisation, reproductive toxicity, and others.

**2. Identify Exposure Routes**
Determine how workers could be exposed: inhalation (vapour, dust, fume), skin contact (direct contact, splash), ingestion (hand-to-mouth), or injection (high-pressure spray). The SDS Section 8 and Section 11 are the primary references.

**3. Assess Exposure Level**
Estimate how much exposure occurs: frequency of use, duration of contact, quantities handled, and whether the work area is enclosed or open. Compare against occupational exposure limits (OELs) where available.

**4. Determine Risk Level**
Combine hazard severity with exposure likelihood to generate a risk rating: Low, Medium, High, or Very High. IMS calculates this automatically from your inputs.

**5. Implement Controls**
Apply the hierarchy of controls: Eliminate the chemical if possible; Substitute with a less hazardous alternative; apply Engineering controls (ventilation, enclosure); apply Administrative controls (reduced handling time, safe work procedures); and finally specify PPE as the last line of defence.

### Health Surveillance

Chemicals associated with occupational diseases (sensitisers, carcinogens) require health surveillance programmes for exposed workers. IMS links the chemical risk assessment to the H&S module's health surveillance records, ensuring workers handling high-risk chemicals are monitored.

### Periodic Re-Assessment

Re-assess chemical risks when: the chemical or supplier changes, the process or quantity used changes, an incident or health complaint occurs, or at the periodic review interval (typically every two to three years).`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['chemicals', 'hazmat', 'sds', 'reach'],
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
    id: 'KB-DD6-021',
    title: 'Chemical Storage & Handling Requirements',
    content: `## Chemical Storage & Handling Requirements

Correct chemical storage and handling is a legal requirement and a fundamental loss prevention measure. This article explains how to use IMS to manage storage compatibility, quantity limits, and handling procedures.

### Storage Compatibility

Incompatible chemicals must be segregated to prevent dangerous reactions. Key incompatible groups include:

- **Flammable liquids** must be segregated from oxidisers, strong acids, and strong bases
- **Oxidisers** must be segregated from flammables, organic materials, and reducing agents
- **Corrosives (acids and bases)** must be segregated from each other and from flammables
- **Reactives** (water-reactive, pyrophoric) require specific isolated storage

IMS checks your chemical inventory for storage compatibility conflicts and flags incompatible substances stored in the same location.

### Storage Area Requirements

Define storage areas in IMS with their physical characteristics:

- **Ventilation** — natural or mechanical ventilation provided
- **Temperature control** — ambient, refrigerated, or heated
- **Spill containment** — bunded floor with minimum volume of largest container
- **Signage** — GHS hazard warning signs and emergency contact details

Each chemical record specifies the appropriate storage area type, and IMS validates that the assigned storage area meets the requirements.

### Quantity Limits

Maximum storage quantities are set by fire safety regulations, planning conditions, and COSHH/REACH thresholds. IMS tracks current inventory quantities and alerts when storage limits are approached or exceeded.

### Handling Procedures

Link each chemical to a safe work procedure (SWP) created in the Document Control module. The SWP references the SDS handling guidance from Section 7 and includes site-specific controls. Workers accessing the chemical record on the mobile app can navigate directly to the linked SWP.

### Storage Inspection

Use the monthly **Chemical Store Inspection** checklist in IMS. The checklist covers: labelling completeness, SDS accessibility, segregation compliance, spill kit readiness, eyewash station serviceability, fire extinguisher currency, and housekeeping standards. Inspection records are retained for audit evidence.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['chemicals', 'hazmat', 'sds', 'reach'],
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
    id: 'KB-DD6-022',
    title: 'Chemical Regulatory Compliance',
    content: `## Chemical Regulatory Compliance

Chemical regulatory compliance spans multiple overlapping frameworks. IMS integrates these requirements to help you demonstrate compliance efficiently.

### REACH (EU)

The Registration, Evaluation, Authorisation and Restriction of Chemicals Regulation governs chemicals placed on the EU market. Key compliance tasks in IMS:

- **SVHC Screening** — the system screens your chemical inventory against the current SVHC Candidate List and flags matches requiring supplier communication
- **Supplier Declarations** — record supplier declarations confirming SVHC content and concentration
- **Authorisation Status** — substances on Annex XIV require authorisation to use; IMS flags these with their authorisation sunset date

### RoHS and WEEE

For electronics manufacturers, the Restriction of Hazardous Substances Directive restricts certain substances in electrical equipment. IMS records which chemicals in your inventory contain RoHS-restricted substances and at what concentrations, supporting product compliance declarations.

### Biocides and Pesticides

Biocidal products and pesticides require product authorisation. The chemical record includes fields for biocide product type and active substance, supporting compliance with the Biocidal Products Regulation (EU) and equivalent national frameworks.

### Occupational Exposure Limits

IMS stores Occupational Exposure Limits (OELs) for over 1,000 common substances — workplace exposure limits (UK), permissible exposure limits (US), and EU binding OELs. Risk assessments reference OELs automatically, flagging exposures above the limit.

### Import and Export Restrictions

Certain chemicals are subject to export control or import licensing requirements. IMS flags chemicals on international control lists (e.g., dual-use goods regulation, Rotterdam Convention prior informed consent chemicals) at the point of entry.

### Regulatory Change Monitoring

The Chemical Register integrates with the Regulatory Monitor module. New SVHC additions, OEL changes, or RoHS amendments generate alerts and prompt re-assessment of affected chemicals.

### Regulatory Reporting

Generate the **Annual Chemical Inventory Report** for regulatory submissions. This lists all chemicals by CAS number, quantity held, hazard class, and regulatory status — the standard format for many national environmental and safety regulatory submissions.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['chemicals', 'hazmat', 'sds', 'reach'],
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
    id: 'KB-DD6-023',
    title: 'Chemical Incident Management',
    content: `## Chemical Incident Management

Chemical incidents — spills, exposures, fires, and releases — require a rapid, co-ordinated response. IMS connects the Chemical Register to incident management, ensuring responders have the information they need immediately.

### Chemical Incident Types

Chemical incidents fall into several categories:

- **Spill** — liquid or solid chemical released to the environment or work area
- **Exposure** — worker contact with a chemical through inhalation, skin contact, or ingestion
- **Fire or explosion** — involving flammable or reactive chemicals
- **Gas release** — toxic or asphyxiant gas escape to the atmosphere

### Chemical Incident Response

When a chemical incident occurs, access the chemical record on the IMS mobile app using the label QR code. The first aid panel (from SDS Section 4) provides immediate guidance:

- Inhalation: move to fresh air, apply emergency oxygen if trained
- Skin contact: remove contaminated clothing, irrigate with water for the period specified in the SDS
- Eye contact: irrigate continuously with water; duration specified on SDS
- Ingestion: do not induce vomiting unless specifically instructed; contact poison control

IMS links chemical incidents to the H&S Incident module for full incident recording and investigation.

### Spill Response Procedure

The chemical record includes a linked spill response procedure. Key steps: contain the spill using appropriate materials (neutralising agents, absorbents), prevent entry to drains, use appropriate PPE as specified in the SDS, and arrange disposal of spill waste as hazardous material.

### Incident Notification

Check the chemical record for regulatory notification thresholds. Releases above threshold quantities may require immediate notification to the environmental regulator, local authority, or emergency services. IMS provides a notification checklist to ensure no mandatory notification is missed.

### Post-Incident Investigation

Following any significant chemical incident, open a CAPA record from the linked H&S incident. Investigate root cause: was the chemical stored correctly, were procedures followed, was PPE available and worn? Identify corrective actions to prevent recurrence.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['chemicals', 'hazmat', 'sds', 'reach'],
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
    id: 'KB-DD6-024',
    title: 'Chemical Register Best Practices',
    content: `## Chemical Register Best Practices

An accurate, well-maintained chemical register underpins all aspects of chemical safety management. These best practices help organisations maintain a genuinely useful register rather than a compliance document.

### Maintaining an Accurate Chemical Inventory

Conduct a physical chemical inventory count at least annually and reconcile it against the IMS register. Common discrepancies: chemicals brought on site without being registered, chemicals that have been disposed of but remain in the register, and quantities that do not match records. Assign a named owner for each storage area to maintain accountability.

### Minimising Your Chemical Inventory

Every chemical in your inventory carries a management burden: SDS maintenance, risk assessment, storage requirements, and disposal costs. Regularly review your inventory for chemicals that have not been used in the past 12 months and consider disposal. Rationalise by identifying multiple chemicals that serve the same function and standardising on one.

### Substitution Programme

Operating a formal substitution programme — systematically identifying and replacing high-hazard chemicals with safer alternatives — reduces your overall chemical risk profile. The Chemical Register supports substitution by grouping chemicals by function, allowing you to compare hazard profiles and identify safer alternatives.

### Digital SDS Management

Eliminate paper SDS folders. Physical folders are difficult to keep current, may not be accessible at the point of use, and cannot be updated instantly when a new SDS version is received. IMS digital SDS management provides instant access via QR code scan, automatic version control, and audit trail of SDS reviews.

### Chemical Safety Training

Workers who handle chemicals must receive training specific to the substances they use. Link each chemical record to the required training competency in the Training module. Workers can be automatically notified when they are assigned to work with a new chemical, and managers can verify training currency before authorising chemical use.

### Contractor Chemical Management

Contractors often bring chemicals on site without prior notification. Implement a **Contractor Chemical Pre-Approval** process: contractors submit their SDS to you before starting work, and chemical safety is reviewed before approval to bring chemicals on site. Record contractor chemical use in the site register.

### Annual Chemical Register Audit

Conduct an annual audit of the chemical register for completeness, accuracy, and SDS currency. Use the audit checklist in IMS: every chemical has a current SDS, every SDS has been reviewed within the cycle, every chemical has a completed risk assessment, and storage locations are correctly recorded.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['chemicals', 'hazmat', 'sds', 'reach'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },

  // ─── EMERGENCY MANAGEMENT MODULE ─────────────────────────────────────────
  {
    id: 'KB-DD6-025',
    title: 'Emergency Management Day-to-Day User Guide',
    content: `## Emergency Management Day-to-Day User Guide

The Emergency Management module helps your organisation prepare for, respond to, and recover from emergency events. This guide covers the routine tasks performed by emergency management coordinators and team members.

### Daily Emergency Preparedness Tasks

Regular tasks to maintain a state of readiness:

- **Equipment Readiness** — review the equipment inspection schedule for items due today (fire extinguishers, defibrillators, spill kits, first aid boxes)
- **Drill Schedule** — check upcoming drills and confirm participant assignments
- **Contact List Currency** — verify that emergency contacts (fire wardens, first aiders, emergency services) are current; contact details change frequently
- **Plan Status** — confirm that all emergency response plans are within their review date

### Emergency Dashboard

The main dashboard provides a preparedness overview:

- **Drill Compliance** — percentage of scheduled drills completed on time
- **Plan Status** — plans current, due for review, and overdue
- **Emergency Contact Currency** — contacts last verified within the past 6 months
- **Equipment Inspection Due** — count of overdue equipment inspections

A green dashboard indicates a prepared organisation. Red panels require immediate attention.

### Quick Actions

From the toolbar:

- **Log a Drill** — record a completed drill with participants, scenario, and evaluation
- **Update Contacts** — add, update, or remove emergency contact details
- **Raise an Emergency** — activate the emergency response module in a live event

### Activating Emergency Response from Mobile

During a real emergency, open the IMS mobile app and tap **Emergency**. Select the emergency type to open the response checklist for that scenario. The app provides the relevant response plan, emergency contacts, and notification functions without needing to find a desktop terminal.

### Post-Event Recording

After every emergency event — including drills — complete the post-event record in IMS. Record the timeline, actions taken, resources used, and lessons identified. This record is essential for improvement and for demonstrating emergency preparedness to auditors.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['emergency', 'emergency-response', 'business-continuity'],
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
    id: 'KB-DD6-026',
    title: 'Emergency Response Plan Creation',
    content: `## Emergency Response Plan Creation

Emergency response plans define how your organisation will respond to specific emergency scenarios. This article explains how to create effective plans using the IMS Emergency Management module.

### Plan Types

Create a separate plan for each foreseeable emergency scenario. Common plan types include:

- **Fire** — fire alarm, evacuation, fire team response, liaison with fire service
- **Medical Emergency** — first aid response, requesting emergency ambulance, CPR/defibrillator use
- **Hazmat / Chemical Release** — HAZMAT team activation, evacuation zone, regulatory notification
- **Bomb Threat** — search procedure, evacuation decision, liaison with police
- **Natural Disaster** — flood, earthquake, severe weather — shelter-in-place vs evacuation decisions
- **Cyber Incident** — initial containment, IT security team activation, business continuity trigger
- **Evacuation (General)** — general emergency evacuation covering all scenarios

### Plan Structure

Each plan follows a standard structure in IMS:

1. **Purpose and Scope** — what this plan covers and when it applies
2. **Trigger** — what conditions activate this plan
3. **Emergency Response Team** — named individuals and their roles, with deputies
4. **Immediate Actions (0–15 minutes)** — priority actions in the first moments
5. **Short-Term Actions (15 minutes – 2 hours)** — stabilisation and communication
6. **Extended Response (2–24 hours)** — sustained response and transition to recovery
7. **Resources** — equipment, external contacts, and facilities needed
8. **Communication** — who is notified and how
9. **Recovery** — return to normal operations

### Review and Approval Workflow

Draft plans are reviewed by the emergency coordinator, then approved by the site manager or senior responsible officer. Approved plans are published and accessible to all named response team members.

### Versioning

IMS maintains version history for all emergency response plans. Each revision is dated and the author recorded. The current version is always displayed; previous versions are archived.

### Distribution

Published plans are automatically accessible to all named emergency response team members. Physical copies should be held off-site and at assembly points for use when IT systems are unavailable.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['emergency', 'emergency-response', 'business-continuity'],
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
    id: 'KB-DD6-027',
    title: 'Emergency Drill Management',
    content: `## Emergency Drill Management

Drills are how organisations test and improve their emergency preparedness. IMS provides a complete drill management workflow from planning through evaluation and corrective action.

### Drill Types

Select the appropriate drill type based on what you want to test:

- **Tabletop Exercise** — facilitated discussion-based exercise; participants talk through their response to a scenario without physical activity. Low cost, suitable for management teams and complex scenarios.
- **Functional Drill** — tests specific emergency functions (e.g., communications only, or IT recovery only) without a full exercise
- **Full-Scale Exercise** — physically enacts the emergency scenario across the organisation; highest fidelity but highest cost and disruption
- **Surprise Drill** — conducted without advance notice; tests genuine readiness but requires careful safety management to avoid real emergencies during the drill

### Planning a Drill

Create a drill record in IMS:

- **Scenario** — the emergency type being practised
- **Date and Time** — when the drill will take place
- **Participants** — named individuals and roles
- **Objectives** — what the drill is testing
- **Evaluators** — independent observers who will assess performance

Send drill notifications to participants and observers from IMS, which generates calendar invites automatically.

### Drill Execution Recording

During the drill, the designated recorder captures: time of each event (alarm activation, first responder arrival, evacuation complete), actions taken by response team, any deviations from the plan, and response times against targets.

### Post-Drill Debrief

Within 24 hours of the drill, conduct a structured debrief session with all participants. Use the IMS debrief template: What went well? What did not go as planned? What should we do differently? Record participant comments in IMS.

### Drill Evaluation and Corrective Actions

Evaluate the drill against the stated objectives. For each objective, record whether it was met, partially met, or not met. For shortfalls, create improvement actions with owners and due dates. These actions are tracked in IMS until closed.

### Drill Frequency

Most regulations require at least one full evacuation drill per year for each site. High-hazard sites typically require quarterly drills. Tabletop exercises for senior management and IT recovery tests should be conducted at least annually.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['emergency', 'emergency-response', 'business-continuity'],
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
    id: 'KB-DD6-028',
    title: 'Evacuation Procedures & Assembly Points',
    content: `## Evacuation Procedures & Assembly Points

A clearly documented and well-practised evacuation procedure is fundamental to protecting lives during an emergency. This article explains how to manage evacuation documentation in IMS.

### Evacuation Procedure Documentation

Create a site evacuation procedure in IMS for each site. The procedure links to:

- **Floor Plans** — annotated PDF showing evacuation routes, assembly points, fire warden zones, and locations of fire extinguishers, alarms, and first aid kits
- **Evacuation Routes** — primary and secondary routes for each area
- **Assembly Points** — designated outdoor locations where people gather after evacuating

### Assembly Point Management

Register each assembly point in IMS:

- **Location description** — what3words or GPS coordinates for emergency services
- **Capacity** — number of people the assembly point can accommodate
- **Accessibility** — confirmation that the assembly point is accessible for mobility-impaired workers
- **Signage** — photographic evidence that assembly point signs are in place

### Fire Warden Roles

Register fire wardens in IMS with their assigned zone, competency certification date, and deputy warden. The system alerts when fire warden certifications are approaching expiry. Each zone must have a primary and at least one deputy warden.

### Roll Call System

Immediately after evacuation, fire wardens conduct a roll call of their zone's occupants. IMS provides a digital roll call form on the mobile app: the warden checks off names against the zone occupant list and reports unaccounted persons to the assembly point coordinator.

### Visitor and Contractor Evacuation

The IMS visitor sign-in system generates a current visitor list for each site. Fire wardens access this list on the mobile app during evacuation to account for all visitors. Contractors signing in via IMS are automatically added to the site evacuation list.

### Disability Evacuation

For workers with mobility impairments, create a Personal Emergency Evacuation Plan (PEEP) in IMS. The PEEP specifies the evacuation method, assistance required, and assigned buddy. PEEPs are linked to the individual's personnel record and are visible to fire wardens in the relevant zone.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['emergency', 'emergency-response', 'business-continuity'],
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
    id: 'KB-DD6-029',
    title: 'Emergency Communication & Notifications',
    content: `## Emergency Communication & Notifications

Effective communication during an emergency prevents confusion, enables a co-ordinated response, and ensures legal notification obligations are met. IMS provides a complete emergency communication framework.

### Emergency Notification Contacts

Maintain a current emergency contact directory in IMS:

- **Internal contacts** — emergency response team members with primary and backup numbers
- **Emergency services** — local fire, police, and ambulance contact numbers and the nearest station
- **Regulatory authorities** — environmental, health and safety, and sector regulators with emergency notification contacts
- **Key stakeholders** — board members, insurers, key customers who may need to be notified
- **Media contacts** — communications team and pre-approved external spokespersons

Review and verify contacts every six months. Outdated contacts are flagged on the dashboard.

### Notification Cascade

When an emergency is activated in IMS, the notification cascade runs automatically:

1. **Emergency response team** — immediate SMS and push notification
2. **Site management** — simultaneous notification
3. **Senior management** — notification within the first 15 minutes for significant events

Cascade escalation is based on the emergency type and severity selected at activation.

### Mass Notification

For a site-wide evacuation or major event, use the **Mass Notification** function to send an SMS, email, or in-app push to all staff simultaneously. Compose the message from a pre-approved template and send with one action. Delivery receipts are logged.

### Communication Scripts

Pre-approved scripts reduce errors and stress during real emergencies. IMS stores communication scripts for each emergency type: what to say when calling the fire service, how to notify the regulator, and what to tell staff waiting at the assembly point.

### Social Media Policy

IMS stores the social media communication policy for emergencies. Only nominated spokespersons are authorised to post externally. The policy is accessible to all managers via the emergency module.

### Regulatory Notification Obligations

Some emergencies require notification to regulators within specified timeframes. IMS provides a notification checklist for each emergency type, specifying which regulatory bodies must be notified, within what time, and with what information.

### All-Clear Communication

After the emergency is resolved, IMS sends an **All-Clear** notification to all contacts who were notified during the event. This closes the communication loop and reduces unnecessary anxiety.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['emergency', 'emergency-response', 'business-continuity'],
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
    id: 'KB-DD6-030',
    title: 'Business Continuity Integration',
    content: `## Business Continuity Integration

Emergency management and business continuity are closely related but distinct disciplines. IMS integrates the two to ensure a seamless transition from emergency response to sustained business operations.

### Emergency Response vs Business Continuity

**Emergency Response** focuses on the immediate reaction to an event: protecting life and property, stabilising the situation, and preventing escalation. It operates in the first minutes to hours of an incident.

**Business Continuity** focuses on maintaining or rapidly restoring critical business operations during a prolonged disruption. It operates in the hours to weeks following an incident.

IMS links the two: when an emergency is not resolved within the initial response phase, a business continuity plan (BCP) activation is triggered automatically based on event type and duration.

### Critical Business Process Identification

In the Business Continuity module, document your critical business processes and their:

- **Recovery Time Objective (RTO)** — the maximum acceptable time before the process must be restored
- **Recovery Point Objective (RPO)** — the maximum acceptable data loss in time

These parameters, defined in the BCP module, guide the emergency response transition: responders know which operations must be prioritised for recovery.

### IT Disaster Recovery

IT system failure is one of the most common business continuity events. IMS integrates with the IT Security module (InfoSec) to link IT disaster recovery plans to emergency response. A cyber incident triggering the Emergency module automatically surfaces the relevant IT recovery procedures.

### Crisis Management Team

For extended events, a Crisis Management Team (CMT) coordinates the transition from emergency response to business continuity. IMS registers CMT members, their activation contact details, and their decision-making authority. The CMT convenes via the IMS incident bridge functionality.

### Exercise and Testing

Business continuity plans and emergency response plans should be tested together in integrated exercises. An annual full-scale exercise that begins as an emergency response and transitions to business continuity provides the most realistic test of both capabilities.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['emergency', 'emergency-response', 'business-continuity'],
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
    id: 'KB-DD6-031',
    title: 'Emergency Management Reporting & Dashboard',
    content: `## Emergency Management Reporting & Dashboard

The Emergency Management dashboard provides a real-time view of your organisation's emergency preparedness posture. Monitoring key metrics enables continuous improvement in readiness.

### Emergency Preparedness Dashboard

The main dashboard shows five preparedness dimensions:

- **Drill Compliance Rate** — percentage of scheduled drills completed on time; target is 100%
- **Plan Currency** — percentage of emergency response plans within their review date
- **Equipment Readiness** — percentage of emergency equipment inspections current
- **Contact List Completeness** — percentage of emergency contacts verified within the past 6 months
- **Training Compliance** — percentage of emergency response team members with current competency

Any metric below 80% is highlighted in amber; below 60% in red.

### Incident Response Time Report

For actual emergency events recorded in IMS, the report shows:

- Time from incident identification to emergency activation
- Time from activation to first responder on scene
- Time from first response to all-clear

These metrics reveal whether response times are improving through training and drills.

### Drill Performance Trend

A 12-month trend chart shows drill scores across all exercises. An improving trend demonstrates programme effectiveness. A declining trend suggests response capability degradation, requiring investigation of causes (staff turnover, reduced training, complacency).

### Training Compliance Report

Emergency response roles require specific competencies: first aid, fire warden certification, HAZMAT awareness, and others. The training compliance report shows, by role, the percentage of team members with current certification. Expiring certifications are listed with the holder's name and renewal deadline.

### Regulatory Compliance Report

Many jurisdictions specify mandatory emergency planning requirements: minimum drill frequency, plan content, appointment of emergency coordinators, and training obligations. The Regulatory Compliance Report maps your emergency management activities against these requirements and identifies any gaps.

### Management Review Report

Generate the Emergency Management input for the management review pre-read. This summarises preparedness metrics, drill results, emergency events in the period, and planned improvements — in the format required for an ISO management review input.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['emergency', 'emergency-response', 'business-continuity'],
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
    id: 'KB-DD6-032',
    title: 'Emergency Management Best Practices',
    content: `## Emergency Management Best Practices

Emergency preparedness is built over time through consistent practice, learning, and organisational commitment. These best practices distinguish organisations that respond effectively from those that are merely compliant on paper.

### Culture of Preparedness

Effective emergency management is a cultural commitment, not a compliance exercise. Build a culture where every employee understands their role in an emergency, takes part in drills willingly, and reports hazards that could lead to emergencies. Regular communication about emergency preparedness — in toolbox talks, team meetings, and induction — keeps preparedness visible.

### Involving All Staff

Do not limit emergency preparedness to a small team of fire wardens. Every employee should know: how to raise the alarm, the nearest exit route, the assembly point for their area, and the contact number for the emergency coordinator. Make this part of induction for all new starters and refresh annually.

### Mutual Aid Agreements

Establish mutual aid agreements with neighbouring businesses. These agreements allow organisations to provide each other with emergency resources (personnel, equipment, storage space) during an incident. IMS stores mutual aid agreement contacts and the resources available under each agreement.

### Supply Chain Emergency Contacts

Know your critical suppliers' emergency contact procedures. If your primary raw material supplier suffers an emergency, how quickly can you contact their emergency team and activate an alternative supply arrangement? Store this information in the supplier record linked to the emergency module.

### Pre-Authorised Emergency Spending

Emergencies require rapid resource deployment. Ensure finance policies include a pre-authorised emergency spending limit enabling the emergency coordinator to procure necessary resources without purchase order delays. Document the authority level in the emergency response plan.

### Learning from Others

Review publicly available emergency response reports and post-incident investigations from other organisations and regulators. These provide valuable insights into failure modes that you can check for in your own systems without having to experience the incidents yourself.

### Regular Plan Review

Emergency response plans must be reviewed: after every real emergency or significant near miss; after every drill that reveals gaps; when the organisation changes (new site, new process, new technology); and at a minimum annually. IMS schedules plan reviews automatically and escalates overdue reviews to the emergency management coordinator.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['emergency', 'emergency-response', 'business-continuity'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },

  // ─── ISO 42001 (AI MANAGEMENT SYSTEM) MODULE ─────────────────────────────
  {
    id: 'KB-DD6-033',
    title: 'AI Management System Day-to-Day User Guide',
    content: `## AI Management System Day-to-Day User Guide

The ISO 42001 module supports the management of your AI Management System (AIMS). As artificial intelligence becomes embedded in business operations, governing its use responsibly requires a structured management system. This guide covers daily AIMS tasks.

### Daily AI Governance Tasks

Begin each day by reviewing the AIMS dashboard for items requiring attention:

- **AI System Performance** — performance metric alerts for deployed AI systems that have crossed threshold limits
- **AI Incident Queue** — newly reported AI incidents awaiting triage and assignment
- **Deployment Requests** — AI deployment or model update requests awaiting governance approval
- **Objective Progress** — quarterly status of AI governance objectives

### AI Dashboard Overview

The dashboard provides four key panels:

- **Active AI Systems** — count of AI systems in production with a breakdown by risk classification
- **Risk Classification Distribution** — pie chart showing the proportion of AI systems at each risk level: Minimal, Limited, High, and Unacceptable
- **Open Incidents** — AI incidents by severity and status
- **Objective Progress** — percentage of AI objectives on track, at risk, or off track

### Quick Actions

From the toolbar:

- **Register AI System** — add a new AI system to the inventory
- **Log AI Incident** — report a new AI incident or unexpected behaviour
- **Conduct AI Risk Assessment** — open the risk assessment workflow for an AI system

### Navigating the AI Inventory

The AI Inventory is the central registry of all AI systems in use or under development. Filter by status (development, testing, deployed, retired), risk level, department, or AI type. Click any system to view its full record: purpose, risk assessment, governance documentation, performance metrics, and incident history.

### Approval Workflow

Before any AI system is deployed to production, an approval workflow must be completed: risk assessment reviewed, governance documentation complete, legal and compliance sign-off, and management approval. IMS tracks the approval status of all pending deployments.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-42001', 'ai-management', 'artificial-intelligence'],
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
    id: 'KB-DD6-034',
    title: 'AI System Inventory & Classification',
    content: `## AI System Inventory & Classification

Knowing what AI systems your organisation uses and how they are classified is the starting point for AI governance. This article explains how to build and maintain a comprehensive AI inventory in IMS.

### AI System Registration

When a new AI system is introduced, register it in IMS before deployment. Complete the registration form:

- **Name and Description** — what the system does and its business purpose
- **AI Type** — machine learning, natural language processing, computer vision, expert system, generative AI, or hybrid
- **Business Owner** — the responsible manager or department head
- **Development Team** — internal team or third-party vendor
- **Deployment Environment** — production, staging, test, or sandbox
- **Version** — current model or software version with release date

### AI Lifecycle Status

Track each AI system through its lifecycle:

- **Development** — system under development; not yet in use
- **Testing** — undergoing testing and validation; limited user exposure
- **Limited Deployment** — deployed to a subset of users or use cases for controlled evaluation
- **Full Deployment** — in full production use
- **Retired** — no longer in use; record retained for historical governance purposes

### Risk Classification Per ISO 42001

ISO 42001 aligns with the risk-based approach of the EU AI Act and similar frameworks. Classify each AI system:

- **Unacceptable Risk** — prohibited uses: social scoring, subliminal manipulation, real-time biometric surveillance in public spaces
- **High Risk** — applications in employment, education, critical infrastructure, law enforcement, migration, or access to essential services
- **Limited Risk** — systems where transparency obligations apply, such as chatbots and deepfake generation
- **Minimal Risk** — all other AI systems; most applications fall here

### Classification Criteria

Apply the classification using the guided questionnaire in IMS:

- What is the potential impact on human rights, safety, or fundamental freedoms?
- Are decisions made by the AI system reversible by a human?
- What is the vulnerability of the people affected?
- What is the degree of human oversight over AI decisions?

### Documentation Requirements by Risk Level

Higher-risk classifications require more extensive documentation: full risk assessment, bias testing results, explainability documentation, human oversight mechanisms, and post-market monitoring plan. Minimal-risk systems require basic registration only.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-42001', 'ai-management', 'artificial-intelligence'],
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
    id: 'KB-DD6-035',
    title: 'AI Risk Assessment & Impact Assessment',
    content: `## AI Risk Assessment & Impact Assessment

AI-specific risks differ from traditional operational risks. A structured AI risk assessment identifies the unique failure modes, biases, and societal impacts that AI systems can create.

### AI Risk Assessment Methodology

Open the AI risk assessment from the AI system record. The assessment methodology follows ISO 42001 guidance and covers both technical and societal risk dimensions.

### Identifying AI-Specific Risks

AI systems carry risks that traditional software does not:

- **Bias and Discrimination** — model outputs that systematically disadvantage groups based on protected characteristics
- **Privacy Violations** — unintended disclosure or inference of personal information
- **Security Vulnerabilities** — susceptibility to adversarial attacks, model inversion, or data poisoning
- **Transparency** — inability to explain or audit AI decision-making
- **Reliability** — unexpected failure modes, hallucination (generative AI), or performance degradation over time
- **Explainability** — inability to justify individual AI decisions to affected parties

### AI Impact Assessment

Beyond risk to the organisation, assess the impact of the AI system on external parties:

- **Societal Impact** — how the system affects society at scale if widely adopted
- **Environmental Impact** — energy consumption of training and inference; carbon footprint
- **Individual Impact** — impacts on specific individuals affected by AI decisions, particularly vulnerable groups

### Stakeholder Impact

Identify who is affected by AI system outputs: employees subject to AI-assisted HR decisions, customers receiving AI-generated recommendations, third parties affected by automated processes. For high-risk AI systems, engage with affected groups during the design phase.

### Risk Treatment

For each identified risk, document the treatment control:

- **Eliminate** — redesign or remove the AI system capability
- **Reduce** — bias mitigation techniques, privacy-preserving methods, security hardening
- **Transfer** — insurance, contractual liability management
- **Accept** — documented acceptance with rationale for low-level residual risks

### Ongoing Monitoring

AI risks evolve. Model drift — where the statistical relationship between inputs and outputs changes over time as real-world data patterns shift — can introduce new risks in previously validated systems. Schedule periodic risk reassessment and continuous performance monitoring.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-42001', 'ai-management', 'artificial-intelligence'],
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
    id: 'KB-DD6-036',
    title: 'AI Governance & Policy Management',
    content: `## AI Governance & Policy Management

AI governance ensures that AI systems are developed, deployed, and operated in a manner consistent with organisational values, legal obligations, and ethical principles. This article covers the governance framework supported by IMS.

### AI Governance Framework

The AIMS governance framework consists of three layers:

1. **AI Policy** — the top-level statement of the organisation's approach to AI: intended uses, prohibited uses, ethical principles, and accountability
2. **AI Standards** — specific technical and process requirements for each risk class of AI system
3. **AI Procedures** — operational procedures for risk assessment, incident management, performance monitoring, and third-party AI governance

IMS stores all three layers in the Document Control module, linked to the AIMS module.

### Roles and Responsibilities

Define clear accountability for AI governance:

- **AI Owner** — the business manager responsible for each AI system's performance and compliance
- **AI Developer** — the technical team responsible for model development and maintenance
- **AI Risk Manager** — the governance professional responsible for risk assessment and compliance monitoring
- **Data Steward** — responsible for the quality, privacy, and appropriate use of training and input data

### AI Procurement Governance

Many AI systems are procured from third-party vendors. Establish a due diligence process: before purchasing an AI system, assess the vendor's AI development practices, data governance, bias testing methodology, incident notification procedures, and ISO 42001 or equivalent certification status.

### Model Governance

Before any model is deployed or updated in production:

- Review model documentation: training data sources, model architecture, validation methodology, known limitations
- Complete bias testing and fairness evaluation
- Obtain sign-off from the AI risk manager and business owner
- Document the approval decision with rationale

### Explainability Requirements

For AI systems making consequential decisions about individuals, document how those decisions can be explained in plain language to the affected person. Explainability requirements are calibrated to risk level — high-risk systems require technical and non-technical explanations.

### Human Oversight

Ensure meaningful human oversight for high-risk AI systems. Document the human review checkpoints built into the AI-assisted workflow and the criteria for human override of AI outputs.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-42001', 'ai-management', 'artificial-intelligence'],
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
    id: 'KB-DD6-037',
    title: 'AI Incident Management',
    content: `## AI Incident Management

AI incidents — unexpected or harmful AI system behaviours — require a distinct management approach that combines technical investigation with governance and regulatory considerations.

### AI Incident Types

Report any of the following as an AI incident in IMS:

- **Model Failure** — the AI system produces incorrect outputs, crashes, or becomes unavailable
- **Biased Output** — AI outputs that appear to discriminate based on protected characteristics
- **Privacy Breach Involving AI** — AI system exposing, inferring, or transmitting personal data inappropriately
- **AI Misuse** — deliberate misuse of an AI system contrary to its intended purpose or policy
- **Unexpected AI Behaviour** — AI outputs that are surprising, unexplained, or inconsistent with design intent
- **Security Incident** — adversarial attack, model inversion, or data poisoning affecting an AI system

### AI Incident Reporting

Any employee can report an AI incident using the **Log AI Incident** quick action. The form captures: the AI system affected, the date and description of the behaviour observed, the output produced, the impact on users or third parties, and any supporting evidence (screenshots, output logs).

### Incident Severity

Classify the incident severity based on impact:

- **Critical** — significant harm to individuals, major data breach, or regulatory enforcement risk; requires immediate senior management notification
- **High** — material impact on operations or significant reputational risk
- **Medium** — limited impact but requiring prompt investigation
- **Low** — minor issue or potential concern without confirmed harm

### AI Incident Investigation

Investigate AI incidents using a structured methodology:

1. Identify the specific model, version, and input data involved
2. Reproduce the issue in a test environment if possible
3. Analyse training data for bias or quality issues
4. Review model architecture for susceptibility to the failure mode
5. Assess whether similar incidents may occur in other AI systems

### Regulatory Notification

Emerging AI regulations, including the EU AI Act, include incident notification requirements for providers and deployers of high-risk AI systems. IMS provides a notification checklist for each incident type and severity, specifying applicable regulatory notification obligations.

### Corrective Actions

AI incident corrective actions may include: model retraining on corrected data, model version rollback, temporary decommissioning, enhanced human oversight, user communication, or control enhancement. All actions are tracked in IMS until verified as complete.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-42001', 'ai-management', 'artificial-intelligence'],
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
    id: 'KB-DD6-038',
    title: 'AI Performance Monitoring & Metrics',
    content: `## AI Performance Monitoring & Metrics

AI systems require active performance monitoring throughout their operational lifetime. Unlike traditional software, AI system performance can degrade over time as real-world data patterns shift away from the training distribution. IMS provides a monitoring framework for all deployed AI systems.

### AI Key Performance Indicators

Technical performance metrics vary by AI type. Common metrics recorded in IMS include:

- **Accuracy** — percentage of outputs that are correct (for classification systems)
- **Precision** — of the positive predictions made, the proportion that were correct
- **Recall** — of all actual positive cases, the proportion the model correctly identified
- **F1-Score** — harmonic mean of precision and recall; useful for imbalanced datasets
- **Latency** — average response time for AI system inference

### Business Performance Metrics

Beyond technical metrics, monitor business outcomes:

- **Task Completion Rate** — how often the AI system successfully completes its intended task
- **Efficiency Improvement** — measurable time or cost saving versus the previous process
- **Error Rate** — frequency of AI errors requiring human correction

### Fairness and Bias Metrics

For AI systems making decisions that affect people, monitor fairness:

- **Demographic Parity** — do outcomes differ significantly across demographic groups?
- **Equal Opportunity** — are true positive rates consistent across groups?
- **Calibration** — are confidence scores equally reliable across different groups?

Configure alert thresholds for each fairness metric. Breaching a threshold triggers an AI incident review.

### Model Drift Detection

Model drift occurs when the statistical relationship between model inputs and outputs changes over time. IMS monitors:

- **Input data drift** — changes in the distribution of input data compared to the training baseline
- **Output distribution drift** — changes in the distribution of AI predictions

Statistical tests run automatically on a schedule. Drift alerts prompt investigation and potential model retraining.

### Performance Thresholds

Set minimum acceptable performance levels for each KPI. When performance falls below the threshold, IMS creates an automatic alert for the AI owner and risk manager, and triggers a review workflow. Thresholds are defined per system during the deployment approval process.

### Monitoring Dashboard

The AI system performance dashboard shows current metric values, trend charts for the past 90 days, threshold breach alerts, and upcoming scheduled monitoring reviews — all accessible from the AI system record.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-42001', 'ai-management', 'artificial-intelligence'],
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
    id: 'KB-DD6-039',
    title: 'AI Reporting & Compliance Dashboard',
    content: `## AI Reporting & Compliance Dashboard

The AI Management System reporting suite provides the evidence base for ISO 42001 certification and supports ongoing AI governance accountability. This article explains the available reports and their purpose.

### AI Register Report

The AI Register Report lists all AI systems in the inventory with:

- System name and description
- AI type and version
- Risk classification (Minimal / Limited / High / Unacceptable)
- Lifecycle status
- Business owner
- Date of last risk assessment
- Compliance status (Compliant / Review Required / Non-Compliant)

This report provides certification body auditors with a complete overview of the AI portfolio in a single document.

### AI Risk Summary

The AI Risk Summary aggregates risk data across the AI portfolio:

- Distribution of AI systems across risk classifications
- Number of identified risks by treatment status (Treated / In Progress / Accepted)
- Outstanding high-risk items requiring management attention

### AI Incident Log

The AI Incident Log reports all incidents in the period:

- Incident type, severity, and AI system involved
- Date reported and date resolved
- Root cause category
- Corrective action status

Trend analysis shows whether incident frequency is increasing or decreasing and identifies AI systems with recurring issues.

### AI Performance Report

For each deployed AI system, the performance report shows current KPI values against thresholds, performance trend over the past quarter, and any threshold breach events.

### ISO 42001 Compliance Status

The Clause Compliance report maps AIMS activities against each ISO 42001 clause requirement. For each clause, record the compliance status (Conforming / Partially Conforming / Not Conforming) and link to supporting evidence in IMS.

### EU AI Act Readiness Assessment

For organisations subject to the EU AI Act, the readiness report assesses compliance with the Act's requirements for high-risk AI systems: conformity assessment, technical documentation, transparency, human oversight, and post-market monitoring. This report identifies gaps requiring action before the Act's compliance deadlines.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-42001', 'ai-management', 'artificial-intelligence'],
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
    id: 'KB-DD6-040',
    title: 'ISO 42001 AI Management Best Practices',
    content: `## ISO 42001 AI Management Best Practices

ISO 42001:2023 is the first international standard for AI Management Systems. Implementing it effectively requires both technical rigour and cultural commitment to responsible AI.

### ISO 42001 Key Requirements

The standard requires organisations to:

- Establish an **AI Policy** committing to responsible AI use
- Demonstrate **leadership commitment** — top management accountable for AIMS performance
- Set **AI Objectives** with measurable targets
- Implement **AI risk management** — proportionate to the risk classification of each system
- Apply **AI controls** — a subset of Annex A controls selected based on risk treatment results
- Conduct **performance evaluation** — internal audits, management review, KPI monitoring
- Pursue **continual improvement** — learning from incidents, audits, and performance data

### Responsible AI Principles

Embed these principles into your AI policy and governance:

- **Fairness** — AI systems do not discriminate unfairly
- **Transparency** — the organisation is open about its AI use
- **Accountability** — clear responsibility for each AI system's outcomes
- **Privacy** — personal data is handled lawfully and minimised
- **Safety** — AI systems do not cause harm to people or the environment

### AI Governance Structure

Establish an AI Ethics and Governance Committee with representation from technology, legal, compliance, HR, and operations. The committee reviews high-risk AI deployments, AI policy compliance, significant incidents, and emerging AI regulatory developments.

### Embedding AI Governance in Procurement

Make AI governance a procurement requirement. Before purchasing any AI-powered product or service, complete a vendor due diligence questionnaire covering AI development practices, bias testing, data governance, incident notification obligations, and the vendor's own ISO 42001 or equivalent compliance status.

### Staff Training

Two levels of AI training are essential:

- **AI Literacy** for all employees: what AI is, how it is used in the organisation, how to report concerns
- **AI Risk and Governance** for AI practitioners, system owners, and risk managers: technical AI risk, bias assessment, governance requirements

### Engaging Stakeholders

Be transparent with customers, employees, and other stakeholders about AI use. Publish a clear AI use statement explaining what AI systems are deployed, their purpose, and how decisions are reviewed. Invite feedback on AI system performance and fairness.

### Continual Improvement

Use incident data, performance metrics, audit findings, and management review outputs to continuously strengthen AI governance. Set annual improvement targets for AIMS maturity and report progress to senior leadership.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['iso-42001', 'ai-management', 'artificial-intelligence'],
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
