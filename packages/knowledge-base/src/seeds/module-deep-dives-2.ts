import type { KBArticle } from '../types';

export const moduleDeepDives2Articles: KBArticle[] = [
  // ─── RISK MANAGEMENT (KB-DD2-001 to KB-DD2-008) ───────────────────────────
  {
    id: 'KB-DD2-001',
    title: 'Risk Register Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['risk', 'risk-management', 'enterprise-risk'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Risk Register Day-to-Day User Guide

## Navigating the Risk Register Module

The Risk Register is your central hub for viewing and managing all organisational risks. From the main menu, select **Risk Management > Risk Register** to open the full register view. You can filter risks by status, category, owner, or site using the filter bar at the top.

## Viewing Your Assigned Risks

Click **My Risks** in the left navigation panel to see all risks where you are listed as the risk owner. Each row displays the risk title, current likelihood and consequence scores, the residual risk rating, and the next review date. Colour coding (green/amber/red) gives an at-a-glance indicator of priority.

## Updating Risk Status and Scores

Open any risk record and click **Edit**. You can update:

- **Likelihood score**: 1 (Rare) to 5 (Almost Certain)
- **Consequence score**: 1 (Insignificant) to 5 (Catastrophic)
- **Status**: Active, Under Treatment, Accepted, Closed
- **Notes**: add a free-text comment to explain score changes

All changes are logged automatically in the risk audit trail.

## Logging Treatment Progress

Navigate to the **Treatment Plans** tab within a risk record. Each treatment action has a completion percentage field. Update the percentage, add a progress note, and click **Save Progress**. Overdue treatment actions appear highlighted in amber.

## Risk Dashboard Overview

The main dashboard displays:

- **Heat map**: 5x5 matrix showing all active risks by inherent and residual score
- **Top 10 Risks**: ranked by residual score
- **Treatment Progress**: percentage of treatment actions on track, at risk, or overdue
- **Upcoming Reviews**: risks with review dates in the next 30 days

## Adding a New Risk from the Dashboard

Click the **+ New Risk** button on the dashboard or register view. Complete the risk identification form: title, description, category, likelihood, consequence, owner, and initial treatment approach. The system auto-generates a risk reference number (e.g. RISK-2026-001).`,
  },
  {
    id: 'KB-DD2-002',
    title: 'Risk Identification & Assessment Process',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['risk', 'risk-management', 'enterprise-risk'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Risk Identification & Assessment Process

## Risk Identification Techniques

Effective risk identification uses multiple complementary methods. Common approaches supported by IMS include:

- **Risk workshops**: facilitated sessions with business unit leaders
- **Interviews**: structured one-on-one conversations with subject matter experts
- **Checklists**: industry-specific and module-specific risk prompt lists
- **Incident history**: mining past incident and near miss data to surface risk patterns
- **Environmental scanning**: PESTLE analysis for strategic risk identification

## Risk Categories

IMS supports the following standard risk categories (configurable by administrators):

- Strategic, Operational, Financial, Compliance, Reputational, Safety, Environmental

Each category has configurable sub-categories to support granular classification.

## Likelihood and Consequence Scoring

IMS uses a 5x5 risk matrix. Both likelihood and consequence are scored on a 1-5 scale:

- **Likelihood**: 1 (Rare) → 5 (Almost Certain)
- **Consequence**: 1 (Insignificant) → 5 (Catastrophic)

The combined score (L x C) produces a risk rating: Low (1-4), Medium (5-9), High (10-16), Extreme (17-25).

## Inherent, Residual, and Target Risk

IMS captures three risk score sets:

- **Inherent risk**: the raw score before any controls are applied
- **Residual risk**: the score after existing controls are factored in
- **Target risk**: the desired future score after treatment actions are completed

## Risk Appetite and Tolerance

Your organisation's risk appetite statement is configured by the risk administrator. Risks scoring above the appetite threshold are flagged for mandatory treatment planning. Tolerance bands define the acceptable range around each appetite statement.

## Risk Owners and Review Dates

Every risk must have a named owner and a scheduled review date. The system enforces this as mandatory fields on risk creation. Owners receive automated email reminders 14 days before their review is due.`,
  },
  {
    id: 'KB-DD2-003',
    title: 'Risk Treatment & Mitigation Planning',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['risk', 'risk-management', 'enterprise-risk'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Risk Treatment & Mitigation Planning

## Four Treatment Options

IMS structures risk treatment around four internationally recognised options:

1. **Avoid**: eliminate the activity or condition that creates the risk
2. **Reduce**: implement controls to lower likelihood or consequence
3. **Transfer**: share the risk through insurance, contracts, or outsourcing
4. **Accept**: formally acknowledge the risk without further action (requires approval)

Select the treatment strategy on the risk record's **Treatment** tab before creating individual treatment actions.

## Creating Treatment Plans

For each treatment action, record the following:

- **Action description**: what will be done
- **Action owner**: the person responsible for completing it
- **Due date**: realistic target completion date
- **Estimated cost**: budget required (optional but recommended)
- **Priority**: High / Medium / Low

Multiple actions can be added to a single treatment plan. Actions can be linked to existing controls already in the system.

## Linking Treatments to Existing Controls

IMS allows you to reference existing controls from the Controls Library when building a treatment plan. This avoids duplication and ensures your control register stays aligned with risk treatments. Use the **Link Existing Control** button within the treatment action form.

## Progress Tracking

Each treatment action has a **% Complete** slider. Update it regularly as work progresses. The risk record's summary view shows the aggregate treatment completion percentage. Actions that pass their due date without reaching 100% are automatically flagged as overdue and highlighted in amber.

## Contingency Plans for Accepted Risks

When a risk is accepted, IMS requires a contingency plan describing what the organisation will do if the risk materialises. This is captured in the **Contingency** field and reviewed as part of the regular risk review cycle.

## Treatment Effectiveness Review

After treatment actions are marked complete, the risk owner must conduct an effectiveness review: reassess the residual risk score and confirm the target risk has been achieved. Effectiveness reviews are recorded and become part of the risk audit trail.`,
  },
  {
    id: 'KB-DD2-004',
    title: 'Risk Monitoring & Review Cycle',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['risk', 'risk-management', 'enterprise-risk'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Risk Monitoring & Review Cycle

## Setting Review Frequencies

IMS allows review frequencies to be set per-risk based on its rating:

- **Extreme risks**: monthly review recommended
- **High risks**: quarterly review recommended
- **Medium risks**: semi-annual review recommended
- **Low risks**: annual review recommended

Administrators can configure default frequencies by risk rating. Risk owners can adjust the frequency on individual risks subject to approval.

## Risk Review Workflow

The review workflow follows a three-stage approval path:

1. **Risk Owner**: updates risk scores, treatment progress, and notes
2. **Risk Manager**: reviews and approves the updated risk record
3. **Leadership**: receives a summary report of high and extreme risks quarterly

Each stage generates an automated notification. Incomplete reviews trigger escalation reminders at configurable intervals.

## Escalation Rules

IMS automatically escalates a risk when:

- The residual risk score increases by two or more points since the last review
- A treatment action is more than 30 days overdue
- The review date has passed without the owner completing the review

Escalations are directed to the risk owner's line manager and the risk manager.

## Risk Register Audit Trail

Every change to a risk record is logged: who made the change, what field was changed, the old value, the new value, and the timestamp. The audit trail is accessible from the **History** tab on any risk record and cannot be edited or deleted.

## Key Risk Indicators (KRIs)

KRIs are quantitative metrics that signal when a risk is trending toward its threshold. Configure KRIs on a risk record's **Indicators** tab. Set a data source (manual entry or API feed), a warning threshold, and an alert threshold. When a KRI breaches its threshold, the system creates an automatic alert and assigns a review task to the risk owner.

## Periodic Risk Reports for Management Review

IMS generates a standard management review risk report: top risks by rating, treatment progress, KRI status, and risks added or closed in the period. Schedule this report to be delivered automatically on a monthly or quarterly basis.`,
  },
  {
    id: 'KB-DD2-005',
    title: 'Enterprise Risk Reporting & Dashboard',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['risk', 'risk-management', 'enterprise-risk'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Enterprise Risk Reporting & Dashboard

## Risk Heat Map

The heat map is the centrepiece of the risk dashboard. It plots all active risks on a 5x5 grid with likelihood on the x-axis and consequence on the y-axis. Each cell is colour coded: green (low), yellow (medium), amber (high), red (extreme). Click any cell to see the list of risks plotted there and drill into individual risk records.

Toggle between **Inherent** and **Residual** heat map views using the selector at the top right.

## Top 10 Risks

Two ranked lists are available side by side:

- **Top 10 by Inherent Risk**: highest uncontrolled exposure
- **Top 10 by Residual Risk**: highest remaining exposure after controls

Each entry shows the risk title, owner, category, score, and a sparkline showing score trend over the past four review periods.

## Treatment Progress Widget

A progress bar shows the aggregate percentage of treatment actions across all active risks that are: Completed, In Progress, Not Started, and Overdue. Click **Overdue** to jump to the filtered list of overdue actions.

## Risks by Category

A pie chart shows the distribution of active risks across categories (Strategic, Operational, Financial, Compliance, etc.). Hover over a segment to see the count and click to filter the register by that category.

## Trend Analysis

The trend panel shows how the aggregate risk profile has changed over the past 12 months: the number of extreme, high, medium, and low risks per quarter. This helps demonstrate the effectiveness of the risk management programme over time.

## Custom Risk Reports

Use the **Report Builder** under Risk Management > Reports to create ad-hoc risk reports. Filter by business unit, category, owner, date range, and status. Choose from table or chart layouts. All custom reports can be exported to PDF or Excel.

## Board-Level Risk Report

A pre-built board report template is available: it includes the heat map, top 10 risks, treatment summary, and KRI status. Generate it on demand or schedule automatic monthly distribution to board members.`,
  },
  {
    id: 'KB-DD2-006',
    title: 'Risk Management Administrator Configuration Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['risk', 'risk-management', 'enterprise-risk'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Risk Management Administrator Configuration Guide

## Configuring the Risk Matrix

Navigate to **Settings > Risk Management > Risk Matrix** to configure the 5x5 scoring matrix. For each likelihood level (1-5) and consequence level (1-5) you can define:

- **Label**: e.g. Rare, Unlikely, Possible, Likely, Almost Certain
- **Description**: guidance for risk assessors
- **Colour**: mapped to rating band (green/yellow/amber/red)
- **Appetite threshold**: the score above which mandatory treatment is required

## Risk Categories and Sub-categories

Under **Settings > Risk Management > Categories**, add or rename categories and create sub-category trees up to three levels deep. Deactivate categories no longer in use rather than deleting them to preserve historical data.

## Approval Workflows

Configure who can create, edit, and approve risk records under **Settings > Risk Management > Workflows**. Options include:

- **Open entry**: any user can add a risk (recommended for large organisations)
- **Controlled entry**: only nominated risk coordinators can add risks
- **Dual approval**: risk manager plus senior leader approval for extreme risks

## Notification Rules

Set up automated email and in-app notifications for: overdue reviews, escalated risks, new risks above a score threshold, and KRI threshold breaches. Notifications can be directed to the risk owner, their line manager, the risk manager, or a distribution list.

## Multi-Site Risk Configuration

For multi-site organisations, configure whether risks are **global** (visible and reportable across all sites) or **site-level** (scoped to a specific location). The risk dashboard supports site-level filtering and consolidated enterprise views.

## Integration Settings

Link the risk module to other IMS modules:

- **Incidents**: a high-severity incident can auto-create a risk record
- **Audits**: audit findings can be linked to existing risks or trigger new risk identification
- **Compliance**: regulatory non-compliance events can escalate to risk records

Configure these integration triggers under **Settings > Risk Management > Integrations**.`,
  },
  {
    id: 'KB-DD2-007',
    title: 'Risk Management Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['risk', 'risk-management', 'enterprise-risk'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Risk Management Best Practices

## Embedding Risk Management in Business Processes

Risk management is most effective when it is woven into everyday decision-making rather than treated as a compliance exercise. Embed risk review into project kick-off meetings, capital approval processes, and new product or service launches. Use the IMS risk module as a live tool, not a once-a-year report.

## Risk Owner Accountability

Clear accountability is the single most important factor in effective risk management. Every risk must have one named owner — not a team or committee. Define the risk owner's responsibilities using a RACI matrix: Responsible (owner), Accountable (senior leader), Consulted (subject matter experts), Informed (board/management).

## Avoiding Risk Register Inflation

A common failure is a risk register that grows without bounds, diluting focus. Regularly review the register to consolidate duplicates, close risks that are now below appetite, and remove risks that are actually issues or operational tasks. Aim for a register that contains only material risks requiring management attention.

## Integrating Risk Management with Strategic Planning

Annual strategic planning should include a review of the risk register. New strategic objectives may create new risks; retired objectives may allow existing risks to be closed. The output of strategic risk workshops should feed directly into IMS.

## ISO 31000 Alignment

IMS is designed to support the ISO 31000:2018 framework: principles (integrated, structured, inclusive, dynamic, best available information, human and cultural factors, continual improvement), framework (leadership, integration, design, implementation, evaluation, improvement), and process (communication, scope, assessment, treatment, monitoring, recording).

## Facilitating Effective Risk Workshops

Good risk workshops are time-boxed (2-3 hours), structured with a clear agenda, and facilitated by someone independent of the business unit being assessed. Use prompt questions from IMS risk checklists to stimulate discussion. Capture risks in IMS in real-time during the workshop.

## Using Risk Data to Improve Business Decisions

Share risk data with decision-makers in a format they can act on: the heat map for visual impact, the top 10 list for focus, and the treatment progress report for accountability. Risk data presented clearly drives better resource allocation and strategic decisions.`,
  },
  {
    id: 'KB-DD2-008',
    title: 'Risk Management Compliance & Audit Readiness',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['risk', 'risk-management', 'enterprise-risk'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Risk Management Compliance & Audit Readiness

## Standard Requirements

Risk management is required by multiple ISO management system standards:

- **ISO 31000:2018**: dedicated risk management standard — principles, framework, process
- **ISO 9001:2015**: clause 6.1 requires actions to address risks and opportunities
- **ISO 14001:2015**: clause 6.1 requires environmental risk and opportunity assessment
- **ISO 45001:2018**: clause 6.1 requires hazard identification and OH&S risk assessment

IMS supports all four frameworks from a single risk register with module-specific risk categorisation.

## Required Records

For audit and certification readiness, maintain the following records in IMS:

- **Risk register**: all active risks with current scores and owners
- **Treatment plans**: actions, owners, due dates, and completion evidence
- **Review records**: dated risk review history with approver sign-off
- **Risk reports**: periodic management reports demonstrating oversight
- **Audit trail**: all changes to risk records (automatically maintained by IMS)

## Internal Audit of the Risk Management Process

Schedule an annual internal audit of the risk management process itself. The audit should verify: all risks have owners and current review dates, treatment plans exist for high/extreme risks, the risk matrix and appetite statements have been reviewed by leadership, and the register is complete and free of duplicates.

## Board Reporting

Boards require a clear view of: current risk appetite, top risks, treatment status, and KRI trends. Use the IMS board risk report template to produce a one-page executive summary suitable for board papers.

## ERM Maturity Assessment

IMS includes an ERM maturity self-assessment tool under **Risk Management > Maturity Assessment**. It evaluates your organisation across five dimensions: governance, process, integration, culture, and technology. Results generate a maturity roadmap with recommended improvement actions.

## External Certification Requirements

Certification bodies (BSI, Bureau Veritas, SGS, etc.) require evidence of a functioning risk management process. IMS can generate a complete audit evidence pack including the risk register, treatment plans, review history, and management reports, ready for upload to the certification body's evidence portal.`,
  },

  // ─── DOCUMENT CONTROL (KB-DD2-009 to KB-DD2-016) ─────────────────────────
  {
    id: 'KB-DD2-009',
    title: 'Document Control Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['documents', 'document-control', 'iso-9001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Document Control Day-to-Day User Guide

## Finding and Accessing Controlled Documents

Navigate to **Document Control > Document Register** to browse or search the full library. Use the search bar to find documents by title, reference number, or keyword. Apply filters for document type, module, site, or status to narrow results. Starred documents appear in your personal **My Documents** shortcut panel.

## Understanding Document Status

Every controlled document has one of four statuses:

- **DRAFT**: being written, not yet approved for use
- **REVIEW**: submitted for review and awaiting approval
- **APPROVED**: the current authorised version for use
- **OBSOLETE**: superseded or withdrawn; read-only for reference

Only documents with APPROVED status should be referenced in day-to-day work.

## Checking Out a Document for Editing

To edit an existing document, open it and click **Check Out**. This locks the document to your user account, preventing others from making simultaneous edits. Edit the content using the built-in editor or download the file for offline editing. When done, use **Check In** to upload your changes and release the lock.

## Submitting a Document for Review

After editing, click **Submit for Review**. Select the appropriate review workflow (configured by your administrator). Add a change summary describing what was changed and why. The system notifies all reviewers and approvers automatically.

## Acknowledging a Controlled Document

When a new or revised document is distributed to you, you will receive an in-app notification and email. Open the notification, read the document, and click **Acknowledge Receipt**. Your acknowledgement is recorded with a timestamp.

## Downloading and Printing

Click **Download** on any approved document to save a PDF copy. If watermarking is enabled by your administrator, the downloaded file will include a watermark showing your name and the download date. Print directly from the PDF viewer using your browser's print function.`,
  },
  {
    id: 'KB-DD2-010',
    title: 'Document Lifecycle Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['documents', 'document-control', 'iso-9001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Document Lifecycle Management

## Document Creation

New documents begin with a creation request. The author selects a document template, completes the required metadata (title, type, module, owner, classification, review cycle), and writes the initial content using the built-in rich text editor or by uploading a file. The system auto-generates a document reference number according to your organisation's configured numbering convention.

## Review and Approval Workflow

IMS supports configurable multi-stage review workflows. A typical workflow includes: Technical Review (subject matter expert), Quality Review (QMS manager), and Final Approval (department head). Each reviewer receives an automated task notification with a deadline. Overdue reviews trigger escalation reminders to the reviewer's line manager.

## Document Distribution

On approval, IMS automatically distributes the document to all configured recipients based on the document's distribution group rules (by role, department, or site). Each recipient receives a notification and is added to the acknowledgement tracking list.

## Revision Control

IMS uses a major.minor versioning system:

- **Minor revision** (e.g. 1.0 → 1.1): editorial corrections, no change to substance
- **Major revision** (e.g. 1.x → 2.0): significant content change requiring full re-approval

Administrators configure which revision type triggers a full review workflow versus an expedited review.

## Superseding a Document

When a document is replaced by a new version, the old version is automatically set to OBSOLETE and linked to the new version as its predecessor. Users searching for the old reference number are redirected to the new version with a notification explaining the supersession.

## Document Expiry and Obsolescence

Each document has a configured review cycle (e.g. annual, biennial). When the review date passes without a new approved version, IMS flags the document as **Overdue for Review** and notifies the document owner. Documents that are deliberately withdrawn are set to OBSOLETE manually by the document controller.

## Archiving and Retention

Archived documents remain in IMS in read-only form for the configured retention period (e.g. 7 years for quality records). After the retention period expires, the system flags the document for permanent deletion, which requires administrator approval.`,
  },
  {
    id: 'KB-DD2-011',
    title: 'Document Review & Approval Workflows',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['documents', 'document-control', 'iso-9001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Document Review & Approval Workflows

## Setting Up a Review Workflow

Administrators configure document review workflows under **Settings > Document Control > Workflows**. Three workflow types are available:

- **Single approver**: one person reviews and approves
- **Sequential**: reviewers receive the document one at a time in order
- **Parallel**: all reviewers receive the document simultaneously; approval requires all to respond

Workflows can be configured per document type (e.g. policies use sequential, work instructions use single approver).

## Adding Reviewers and Approvers

Reviewers and approvers can be specified by individual user or by role. Role-based assignment means that if the role-holder changes, the workflow automatically routes to the new person. You can mix individual and role-based assignments within the same workflow stage.

## Review Deadlines and Reminders

Each workflow stage has a configurable deadline (in business days). Automated reminders are sent at the halfway point and one day before the deadline. If the deadline passes without a response, the system sends an escalation notification to the reviewer's supervisor and the document controller.

## Comment and Markup by Reviewers

Reviewers can add comments directly within the IMS document editor using the **Comment** tool. Comments are threaded, dated, and attributed to the reviewer. The document author receives a notification for each new comment and can respond or mark it as resolved.

## Conditional Approval

IMS supports conditional approval: an approver can approve the document subject to specific revisions. The author receives the conditions, makes the required changes, and resubmits. The approver then performs a final check before granting unconditional approval.

## Escalation for Overdue Reviews

Overdue review tasks are escalated to the reviewer's line manager after a configurable grace period (default: 2 business days). If still not actioned, the document controller is notified and can reassign the review task.

## Audit Trail

Every review action — submit for review, comment, approve, reject, conditional approval, reassign — is logged in the document's audit trail with the user's name, action, and timestamp. This trail is available from the **History** tab and can be exported for audit evidence.`,
  },
  {
    id: 'KB-DD2-012',
    title: 'Version Control & Document History',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['documents', 'document-control', 'iso-9001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Version Control & Document History

## How IMS Manages Document Versions

IMS uses a structured versioning model. Every approved document starts at version 1.0. Minor revisions increment the minor number (1.0 → 1.1 → 1.2). Major revisions increment the major number (1.x → 2.0). Draft versions use a 'D' suffix (e.g. 2.0-D) until formally approved.

Only the current approved version is displayed by default in search results and the document register. Previous versions are accessible via the **Revision History** tab.

## Viewing Revision History

Open any document and select the **Revision History** tab. All previous versions are listed with: version number, approval date, approved-by name, and the change summary entered at the time of submission. Click any previous version to view its content in read-only mode.

## Comparing Versions

Click **Compare Versions** on the Revision History tab and select two versions to compare. IMS highlights inserted text in green and deleted text in red, giving a clear view of what changed between revisions.

## Rollback to a Previous Version

In exceptional circumstances (e.g. an error in the current version), document controllers can roll back to a previous approved version. Navigate to the previous version in Revision History, click **Restore This Version**, and provide a mandatory justification note. The restored version is re-submitted through the normal approval workflow before becoming the active version.

## Change Log Requirements

When submitting a document for review, authors must complete a mandatory **Change Summary** field. This should describe: what was changed, why it was changed, and any sections affected. Clear change summaries make the revision history meaningful for future users and auditors.

## Parent-Child Document Links

IMS supports linking related documents: for example, a procedure that references a policy, or a work instruction that references a procedure. These links appear in the **Related Documents** section and are maintained automatically when a parent document is revised. Users viewing a procedure can easily navigate to its parent policy.

## Linking Documents to Module Processes

Documents can be tagged to specific IMS modules (H&S, Quality, Environment, etc.) and to specific processes within those modules. This means staff working in a module can access directly relevant controlled documents without navigating the full document library.`,
  },
  {
    id: 'KB-DD2-013',
    title: 'Document Distribution & Access Control',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['documents', 'document-control', 'iso-9001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Document Distribution & Access Control

## Document Distribution Groups

Distribution groups define who receives a document automatically on approval. Groups can be based on:

- **Role**: all users with a specific system role (e.g. all H&S Managers)
- **Department**: all users in a specific department
- **Site**: all users at a specific location
- **Module**: all users with access to a specific IMS module

Multiple distribution groups can be assigned to a single document. Manage distribution groups under **Settings > Document Control > Distribution Groups**.

## Read Receipts and Acknowledgement Tracking

For every document in a distribution group, IMS tracks whether each recipient has opened and acknowledged the document. The **Acknowledgement Status** report shows: total recipients, acknowledged, not yet read, and overdue.

## Overdue Acknowledgements

Configure a deadline for acknowledgement (e.g. 5 business days from distribution). Recipients who miss the deadline receive automated reminders. Their line managers receive an escalation notification after a configurable grace period. Document controllers can see all overdue acknowledgements in the compliance dashboard.

## Public vs Restricted Documents

Each document has an access level:

- **Public**: accessible to all authenticated users in the organisation
- **Restricted**: accessible only to members of specified distribution groups or roles
- **Confidential**: accessible only to named individuals

Access levels are set by the document controller at the time of creation.

## External Distribution for Contractors

For documents that need to be shared with contractors or visitors who do not have IMS accounts, generate a **Secure External Link**. This creates a time-limited, read-only URL with optional password protection. Access via the external link is logged in the document's audit trail.

## Automatic Watermarking

When enabled, all downloaded PDFs include a watermark containing the downloading user's full name, their organisation, and the download timestamp. This discourages unauthorised sharing and provides traceability if a document is found outside the system.

## Keeping Distribution Lists Current

Review distribution groups at least annually or whenever there is a significant organisational change (restructure, new site, role changes). Outdated distribution lists are a common audit finding — schedule a review as part of your annual document control audit.`,
  },
  {
    id: 'KB-DD2-014',
    title: 'Document Templates & Standardisation',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['documents', 'document-control', 'iso-9001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Document Templates & Standardisation

## Using Built-In IMS Document Templates

IMS includes 192 built-in document templates covering all 34 supported modules. Access them via **Document Control > Templates > Browse Templates**. Templates are categorised by module (Quality, H&S, Environment, etc.) and by document type (Policy, Procedure, Work Instruction, Form, Report). Click **Use Template** to start a new document with the template pre-loaded.

## Creating Custom Document Templates

Navigate to **Document Control > Templates > Create Template**. Design your template using the rich text editor: add your organisation's logo, standard header and footer, required sections, and placeholder fields. Save the template and submit it for approval through the template approval workflow before it becomes available to other users.

## Organising the Template Library

Templates are organised into categories that mirror your document classification structure. Create sub-categories for specific teams or document types. Archive templates that are no longer in use rather than deleting them, to maintain the template history.

## Smart Fields in Templates

Smart fields auto-populate when a new document is created from the template:

- 'DocumentNumber' — auto-generated reference number
- 'RevisionNumber' — current revision (e.g. 1.0)
- 'EffectiveDate' — date of approval
- 'ReviewDate' — calculated from review cycle setting
- 'ApprovedBy' — name of the final approver

Insert smart fields using the **Insert Field** button in the template editor.

## Enforcing Template Use

Administrators can configure IMS to require that all new documents of a given type must start from an approved template. This prevents ad-hoc document creation that bypasses the standard structure and ensures consistent formatting across the organisation.

## Template Approval Workflow

New and revised templates must pass through an approval workflow before becoming available. This typically involves review by the document controller and approval by the QMS manager. Only approved templates appear in the template library for general use.

## Multi-Language Document Support

IMS supports multi-language documents. When creating a document, select the primary language and add translations as linked variants. The system maintains version synchronisation between language variants, flagging translation variants that need updating when the master document is revised.`,
  },
  {
    id: 'KB-DD2-015',
    title: 'Document Reporting & Compliance',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['documents', 'document-control', 'iso-9001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Document Reporting & Compliance

## Document Register Report

The document register report is your master list of all controlled documents. It includes: document reference, title, type, module, current version, status, owner, last review date, and next review date. Generate it from **Document Control > Reports > Document Register**. Export to Excel for offline analysis or PDF for audit evidence packages.

## Overdue Review Report

The overdue review report lists all documents where the review date has passed and no new version has been approved. It shows the review date, how many days overdue, and the document owner. This report should be reviewed weekly by the document controller.

## Acknowledgement Compliance Report

The acknowledgement compliance report shows, for each distributed document, the percentage of recipients who have acknowledged receipt. Filter by document, department, or date range. This report is useful for demonstrating training and communication compliance to auditors.

## Documents by Module

The module distribution chart shows how many documents are registered under each IMS module (Quality, H&S, Environment, etc.). This helps identify under-documented areas and supports resource planning for document reviews.

## Obsolete Document Report

Lists all documents in OBSOLETE status with their original reference numbers, final version, and date of obsolescence. This report is useful for confirming to auditors that superseded documents are no longer in use and have been formally withdrawn.

## ISO 9001/14001/45001 Required Documents Checklist

IMS includes a built-in compliance checklist mapping required documented information from ISO 9001:2015, ISO 14001:2015, and ISO 45001:2018 to your actual documents. Gaps are highlighted in red. Access it from **Document Control > Compliance Checklist**.

## Evidence Pack for Certification Audits

Generate a complete audit evidence pack under **Document Control > Export > Audit Pack**. The pack includes the document register, acknowledgement compliance report, overdue review report, the ISO compliance checklist, and a random sample of approved documents. The pack is packaged as a ZIP file suitable for sending to your certification body before an audit visit.`,
  },
  {
    id: 'KB-DD2-016',
    title: 'Document Control Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['documents', 'document-control', 'iso-9001'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Document Control Best Practices

## Document Numbering Convention

Establish a consistent numbering convention from the start. A recommended format is: MODULE-TYPE-NNN (e.g. QMS-POL-001 for the first quality policy, HS-PROC-012 for a health and safety procedure). Configure this convention in IMS settings so reference numbers are auto-generated consistently.

## Keeping the Document Register Lean

A bloated document register is hard to maintain and can confuse users trying to find the right document. Conduct an annual document rationalisation exercise: identify duplicate documents covering the same topic, combine where possible, and archive or obsolete anything no longer relevant to current operations.

## Realistic Review Cycles

Assign review cycles based on the type and volatility of the document:

- **Policies**: annual review (subject to regulatory change)
- **Procedures**: biennial review (every two years)
- **Work instructions**: biennial or triennial depending on process stability
- **Forms and templates**: review when the related procedure is reviewed

Unrealistically short review cycles generate large volumes of overdue reviews and undermine confidence in the system.

## Linking Documents to Processes

Maximise the value of document control by embedding document links directly into IMS module workflows. For example, a risk assessment procedure should appear as a linked resource within the risk module, not just in the document register. This ensures the right document is available at the point of need.

## Training Staff on Document Control Procedures

All staff who create, review, or approve controlled documents should complete the **Document Control Awareness** training course in the Training module. Schedule this as part of new employee onboarding and as a refresher every two years.

## Common Audit Findings in Document Control

Certification auditors frequently find: documents in use that are not version controlled, review dates passed without action, no acknowledgement evidence, inconsistent document numbering, and OBSOLETE documents still physically accessible in workplaces. IMS reports help you proactively identify and address each of these issues.

## Transitioning to Fully Digital Document Control

If you are migrating from paper-based or shared-drive document control, plan a phased migration: import existing documents into IMS, validate the register, train staff, and formally retire the old system. Ensure all printing stations are updated with **'Controlled document must be obtained from IMS'** notices to prevent use of uncontrolled paper copies.`,
  },

  // ─── TRAINING MANAGEMENT (KB-DD2-017 to KB-DD2-024) ──────────────────────
  {
    id: 'KB-DD2-017',
    title: 'Training Management Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['training', 'competency', 'learning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Training Management Day-to-Day User Guide

## Viewing Your Assigned Training

Log in and navigate to **Training > My Training**. Your personal training dashboard shows:

- **Due Soon**: training due within the next 30 days
- **Overdue**: training past its deadline (highlighted in red)
- **Completed**: all completed training with dates and scores
- **Upcoming**: scheduled training events you are enrolled in

Click any training item to see full details including the course description, estimated duration, and any prerequisites.

## Completing an Online Training Course

Click **Start Course** on any assigned e-learning module. The course opens in the IMS course player. Progress is automatically saved if you need to pause and return. On completion, click **Submit** on the final assessment. Your score is recorded immediately and your training record is updated. A digital completion certificate is generated automatically.

## Uploading Training Evidence

For externally completed training (conferences, external courses, certifications), navigate to **Training > My Training > Upload Evidence**. Select the training record, upload a PDF of your certificate or an attendance confirmation, enter the completion date, and click **Save**. Your manager is notified to verify the evidence.

## Viewing Your Training Transcript

Go to **Training > My Transcript** to see your complete training history: all completed courses, external certifications, assessment scores, and expiry dates for time-limited qualifications. Download your transcript as a PDF from the **Export** button.

## Manager View: Team Training Compliance

Managers navigate to **Training > Team Compliance** to see a dashboard of their direct reports' training status. The compliance rate percentage, list of individuals with overdue training, and upcoming expiries are all visible at a glance. Click any team member's name to drill into their individual transcript.

## Scheduling a Training Session

To schedule a face-to-face or virtual training event, go to **Training > Events > Create Event**. Enter the course, date, time, location or video link, maximum participants, and the trainer's name. Invitations are sent automatically to enrolled participants. The event appears in the shared training calendar.`,
  },
  {
    id: 'KB-DD2-018',
    title: 'Training Needs Analysis (TNA) Process',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['training', 'competency', 'learning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Training Needs Analysis (TNA) Process

## What is a Training Needs Analysis?

A Training Needs Analysis (TNA) is a systematic process of identifying the gap between the training and competency that employees currently have and the training and competency they need to perform their roles effectively and safely. IMS provides a structured TNA process that feeds directly into training plan creation.

## Identifying Training Needs: The Gap Approach

IMS compares two data sets for each employee:

- **Required competencies**: defined by the employee's job role (configured in the competency library)
- **Current competencies**: recorded from completed training, assessments, and manager evaluations

Gaps — where required competency exceeds current competency — are surfaced automatically in the TNA report.

## Role-Based Competency Requirements

Before running a TNA, ensure that each job title in IMS has been linked to the relevant competency requirements. Go to **Settings > Training > Role Competencies** to define which competencies are mandatory for each role. This is the foundation of automated gap identification.

## Individual TNA

For an individual TNA, navigate to **Training > TNA > Individual**. Select the employee. IMS generates a gap report showing each required competency, their current level, and the gap. From this report, create training assignments directly for the individual.

## Site-Wide TNA

For a department or site-wide analysis, use **Training > TNA > Bulk Analysis**. Select the scope (department, site, or all employees). IMS aggregates all individual gaps and produces a summary showing the most common and highest-priority training needs. Use this to plan group training events and prioritise the training budget.

## Mandatory vs Development Training

Within the TNA output, flag each training need as:

- **Mandatory**: required for safety, regulatory compliance, or role performance — must be completed within defined timelines
- **Development**: desirable for career growth and enhanced performance — lower priority but tracked

## Creating Training Plans from TNA Results

From the TNA report, select the identified gaps and click **Create Training Plan**. IMS generates a personalised training plan for the employee or a group plan for a department, populating it with the courses needed to close the identified gaps. Set deadlines and assign the plan with a single click.`,
  },
  {
    id: 'KB-DD2-019',
    title: 'Creating & Managing Training Plans',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['training', 'competency', 'learning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Creating & Managing Training Plans

## Training Plan Structure

A training plan is a structured set of learning activities assigned to an individual or group over a defined period. Each plan contains:

- **Courses**: online e-learning modules within IMS
- **Events**: face-to-face or virtual training sessions
- **Assessments**: knowledge tests or competency evaluations
- **External qualifications**: third-party certifications to be obtained

Plans have a start date, end date, and an overall completion target.

## Assigning Training Plans

Training plans can be assigned to:

- **Individuals**: targeted personal development or role-specific mandatory training
- **Roles**: everyone with a given job title receives the plan automatically
- **Departments**: all members of a department
- **New starters**: automatically assigned when an employee joins (onboarding plan)

## Mandatory vs Optional Training Within a Plan

Within any training plan, each item can be flagged as **Mandatory** or **Optional**. Mandatory items must be completed by the plan deadline. Optional items are tracked but do not affect the overall compliance rate calculation.

## Reusable Training Plan Templates

Create reusable plan templates for common role types: Supervisor Safety Induction, Quality Auditor Certification Path, New Manager Essentials. Access templates under **Training > Plan Templates**. When assigning a plan, start from a template and customise as needed rather than building from scratch each time.

## Bulk Assignment

To assign a training plan to a large group quickly, use **Training > Plans > Bulk Assign**. Upload a CSV file with employee IDs or filter by department/role/site. Review the pre-assignment summary and confirm to send assignments to all selected employees simultaneously.

## Real-Time Progress Tracking

The training plan progress view shows each participant's completion percentage, a breakdown of completed vs outstanding items, and any overdue items highlighted in amber/red. Managers can access this view for their team from **Training > Team Plans**.

## Updating Plans After Assignment

Plans can be updated after assignment: add new courses, change deadlines, or mark items as waived (with a justification note). All changes are logged. Employees receive a notification when their assigned plan is updated.`,
  },
  {
    id: 'KB-DD2-020',
    title: 'Competency Management & Skills Matrix',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['training', 'competency', 'learning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Competency Management & Skills Matrix

## Defining Competencies

Navigate to **Training > Competency Library > Add Competency**. For each competency, define:

- **Name**: clear, specific skill or knowledge area (e.g. 'Manual Handling', 'ISO 9001 Internal Auditing')
- **Category**: technical, behavioural, regulatory, leadership
- **Assessment method**: test score, manager assessment, self-assessment, observed performance
- **Renewal frequency**: how often the competency must be re-verified (e.g. every 3 years)

## Competency Levels

IMS supports four standard competency levels:

- **Awareness**: knows the topic exists and understands basic concepts
- **Trained**: has received formal training and can perform with supervision
- **Competent**: can perform independently to the required standard
- **Expert**: can train others and leads in this area

## Building the Skills Matrix

The skills matrix is an employee-versus-competency grid. Access it from **Training > Skills Matrix**. Rows represent employees (or job roles); columns represent competencies. Each cell shows the employee's current level for that competency using a colour-coded indicator: grey (not assessed), red (gap), amber (partial), green (competent/expert).

## Assessment Methods

Competency levels are set via four methods:

- **Training completion**: automatically updated when a linked course is completed
- **Test score**: threshold scores mapped to competency levels
- **Manager assessment**: manager rates the employee directly in IMS
- **Self-assessment**: employee self-rates; reviewed and confirmed by manager

## Identifying and Acting on Competency Gaps

The skills matrix highlights gaps in red. Click any red cell to create a training assignment directly from the gap. For systemic gaps (many employees lacking the same competency), use the TNA bulk analysis to plan a department-level training event.

## Skills Matrix Reports

Export the skills matrix as a CSV from **Training > Skills Matrix > Export**. This is useful for HR workforce planning, board-level skills gap presentations, and regulatory inspection evidence (particularly for ISO 45001 competency requirements).

## Keeping the Matrix Current

Set a competency review schedule — typically aligned with performance appraisal cycles. At each review, managers update the competency levels for their team in IMS. The system flags competencies approaching their renewal date 60 days in advance.`,
  },
  {
    id: 'KB-DD2-021',
    title: 'Training Completion Tracking & Certificates',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['training', 'competency', 'learning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Training Completion Tracking & Certificates

## Automatic Completion Tracking

For online courses built within IMS or SCORM-compliant content hosted on the IMS platform, completion is tracked automatically. When a learner completes all modules and passes the final assessment (if applicable), the training record is updated in real-time. No manual intervention is required.

## Manual Evidence Upload

For externally completed training — external courses, conferences, workshops, or professional certifications — completion must be recorded manually:

1. Navigate to **Training > My Training > Upload Evidence**
2. Select the course or create a new external training record
3. Upload your certificate or attendance confirmation (PDF, JPG, or PNG)
4. Enter the completion date and the name of the external provider
5. Submit for manager verification

## Certificate Expiry Tracking

IMS tracks the expiry dates of all time-limited qualifications (e.g. first aid, forklift license, ISO auditor certification). The system generates reminders at 90 days, 60 days, and 30 days before expiry — sent to both the employee and their manager. Expired certificates are flagged on the training dashboard and in compliance reports.

## Digital Certificate Generation

For courses completed within IMS, the system generates a branded digital certificate automatically. The certificate includes: employee name, course title, completion date, score (if applicable), and the issuing organisation's logo. Employees can download their certificates from **Training > My Transcript > Certificates**.

## CPD Tracking

IMS includes a Continuing Professional Development (CPD) tracker. Employees log CPD activities (articles read, webinars attended, conferences, coaching) with hours and a brief description. CPD hours are tracked against annual targets. The CPD log can be exported as evidence for professional body membership renewals.

## Training Records for ISO 45001 Compliance

ISO 45001 requires documented evidence of employee competency. IMS training records — including completion dates, scores, and uploaded certificates — constitute this evidence. Generate a **Competency Evidence Report** from **Training > Reports** to produce a formatted record suitable for certification body review.

## Employee Self-Service for Training Records

Employees can view and download their own training transcripts, certificates, and CPD logs at any time through **Training > My Transcript**. This reduces administrative requests to HR and empowers employees to manage their own professional development records.`,
  },
  {
    id: 'KB-DD2-022',
    title: 'Mandatory Training & Compliance Tracking',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['training', 'competency', 'learning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Mandatory Training & Compliance Tracking

## Designating Mandatory Training

Navigate to a course in **Training > Course Library** and open the course settings. Toggle **Mandatory Training** to on. Then specify the scope:

- **All employees**: applies organisation-wide
- **By role**: only employees with specified job titles
- **By site**: all employees at a specific location
- **By module access**: employees with access to a particular IMS module

Set the initial completion deadline (e.g. within 30 days of assignment for new starters, within 90 days for an organisation-wide rollout).

## Completion Deadlines and Grace Periods

For mandatory training, configure:

- **Initial deadline**: number of days from assignment date to complete the training
- **Grace period**: additional days allowed before escalation actions trigger
- **Recertification period**: how often the training must be repeated (e.g. annually)

## Compliance Rate Dashboard

The compliance dashboard (**Training > Compliance Dashboard**) shows the aggregate mandatory training compliance rate as a percentage. Drill down by department, site, or role to identify where compliance is lowest. A traffic light indicator shows departments at risk of non-compliance.

## Automatic Reminders

IMS sends automatic email reminders for outstanding mandatory training:

- 14 days before the deadline: courtesy reminder to the employee
- 3 days before the deadline: urgent reminder to employee and their manager
- On the deadline: final reminder if still incomplete
- After the deadline: daily escalation notifications until completed

## Manager Alerts

Managers receive a consolidated weekly email listing all direct reports with overdue mandatory training. They can also view this information at any time in **Training > Team Compliance**. This keeps managers accountable for their team's training compliance without requiring them to manually chase individuals.

## Regulatory Mandatory Training

Configure regulatory-required training (health and safety induction, data protection/GDPR awareness, anti-money laundering) separately with regulatory references attached. IMS generates a **Regulatory Compliance Training Report** showing completion rates for each regulatory requirement by date.

## Evidence for Regulatory Inspections

When a regulatory inspector or certification auditor requests evidence of mandatory training completion, generate the **Mandatory Training Compliance Report** from **Training > Reports**. The report shows each employee's completion status, date, and score for every mandatory training item, formatted for regulatory submission.`,
  },
  {
    id: 'KB-DD2-023',
    title: 'Training Reporting & Dashboard',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['training', 'competency', 'learning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Training Reporting & Dashboard

## Key Training Metrics

IMS tracks four primary training metrics:

- **Compliance rate**: percentage of mandatory training completed on time across all employees
- **Completion rate**: percentage of all assigned training (mandatory and development) completed
- **Training hours per employee**: average learning hours delivered in the period
- **Cost per training hour**: total training spend divided by total hours delivered

These metrics are available on the main training dashboard and in scheduled reports.

## Built-In Reports

Access all standard reports from **Training > Reports**:

- **Training Compliance Summary**: compliance rate by department, site, and individual
- **Course Completion Report**: completion rates per course, including scores and attempt counts
- **Expiring Certifications**: qualifications expiring in the next 30/60/90 days
- **Training Cost Analysis**: spend by department, course, and training type over the period

## Training Dashboard Widgets

The training dashboard includes configurable widgets:

- Progress bar showing overall mandatory training compliance %
- Compliance thermometer: red/amber/green banding against target
- Expiry calendar: upcoming certificate expiries by month
- Recent completions: latest training completed across the organisation
- Top courses: most completed courses in the period

## Drill-Down Capability

Click any metric on the dashboard to drill down: from organisation level to department level to individual employee level. This allows HR and training managers to quickly identify who specifically is driving poor compliance figures.

## Exporting Training Data

Export training data in two formats:

- **CSV**: for integration with payroll (training allowances), HR systems, or Excel analysis
- **PDF**: formatted compliance reports for audit evidence, board papers, or management review

## Scheduled Reports

Configure reports to be generated and emailed automatically:

- **Weekly**: mandatory training compliance report to department heads
- **Monthly**: full training dashboard summary to HR director and senior leadership
- **Quarterly**: training cost analysis to finance

Scheduled reports are configured under **Training > Reports > Schedule Report**.`,
  },
  {
    id: 'KB-DD2-024',
    title: 'Training Management Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['training', 'competency', 'learning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Training Management Best Practices

## Embedding Training in Onboarding

Configure an onboarding training plan template that is automatically assigned to all new employees on their first day. This plan should cover: safety induction, data protection, code of conduct, systems access, and role-specific mandatory training. Automatic assignment means no-one falls through the cracks during busy onboarding periods.

## Blended Learning

The most effective training programmes combine multiple delivery formats. IMS supports a blended approach: online e-learning for foundational knowledge, face-to-face sessions for practical skills, on-the-job observation for competency verification, and peer learning groups for knowledge sharing. Record all formats in IMS for a complete learning picture.

## Keeping Training Content Current

Assign a content owner to every course in IMS. Set an annual review reminder for each course. Outdated training content — particularly for regulatory or safety topics — is not just ineffective but potentially a compliance and liability risk. The course library review report helps identify courses that have not been updated in over 12 months.

## Engaging Learners

Adult learners engage better with: bite-sized modules (under 15 minutes), scenario-based learning that reflects real work situations, interactive elements (drag and drop, branching scenarios), and immediate feedback on assessment answers. When commissioning new content, brief your training providers on these principles.

## Measuring Training Effectiveness

Completion and test scores are level 1 and 2 measurements (Kirkpatrick model). Go further:

- **Level 3 (Behaviour)**: has the training changed on-the-job behaviour? Use manager observations and competency assessments.
- **Level 4 (Results)**: has the training improved outcomes? Track incident rates, quality defect rates, and compliance scores before and after training interventions.

## Training Budget Management

IMS tracks training costs at the course, department, and individual level. Use this data to calculate ROI on high-cost training interventions and to allocate the training budget more effectively in future cycles. Filter the cost analysis report by department to support fair budget allocation.

## Integration with HR

Ensure that the employee data in IMS Training is synchronised with your HR system. New starters, leavers, and role changes should update IMS automatically. Manual data mismatches — training assigned to leavers, new starters missed — undermine compliance reporting accuracy and waste administrator time.`,
  },

  // ─── INCIDENT MANAGEMENT (KB-DD2-025 to KB-DD2-032) ─────────────────────
  {
    id: 'KB-DD2-025',
    title: 'Incident Reporting Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['incidents', 'incident-management', 'safety'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Incident Reporting Day-to-Day User Guide

## How to Report an Incident

IMS provides two reporting options:

- **Quick Report**: a streamlined five-field form for immediate reporting on mobile or desktop — title, date occurred, location, severity, and brief description. Takes under two minutes to submit.
- **Full Report**: the complete incident record including all details, witnesses, injuries, property damage, and initial photos. Can be completed by the reporter or expanded by an investigator after initial quick reporting.

Both options are accessible from the **+ Report Incident** button on the main dashboard or from **Incident Management > Report New Incident**.

## Required Fields

All incident reports must include:

- **Title**: a clear, factual description of what happened (e.g. 'Slip on wet floor in Warehouse B')
- **Date Occurred**: the actual date and time of the incident
- **Location**: site, building, and specific area where the incident occurred
- **Severity**: classified using the IMS five-level scale
- **Description**: a factual account of what happened, who was involved, and immediate actions taken

## Severity Levels

IMS uses five severity levels with uppercase values in the system:

- **MINOR**: first aid only, no lost time, minimal damage
- **MODERATE**: medical treatment required, short lost time (under 3 days)
- **MAJOR**: significant injury, extended lost time (3+ days), substantial damage
- **CRITICAL**: life-threatening injury, major property damage, regulatory notification likely required
- **CATASTROPHIC**: fatality, multiple serious injuries, major environmental release

## Uploading Photos and Evidence

Click **Add Attachment** on the incident report form to upload photos, CCTV footage stills, equipment condition photos, or any other relevant evidence. Evidence uploaded at the point of reporting is most valuable as it captures the scene before any changes are made.

## Near Miss and Hazard Reporting

The same reporting form is used for near misses and hazards — select the appropriate incident type at the top of the form. Near miss reporting is actively encouraged as a leading safety indicator. All near miss reports are reviewed by the safety team within 24 hours.

## Viewing Your Submitted Incidents

Navigate to **Incident Management > My Reports** to see all incidents you have submitted, with their current status (Under Review, Under Investigation, Closed) and any actions or responses from the safety team.`,
  },
  {
    id: 'KB-DD2-026',
    title: 'Incident Investigation Process',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['incidents', 'incident-management', 'safety'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Incident Investigation Process

## Incident Triage

When a new incident is reported, the safety team receives an immediate notification. The triage step involves reviewing the initial report and confirming or adjusting the severity classification. Severity may be upgraded if additional information comes to light (e.g. a minor injury initially reported becomes a significant injury after medical assessment).

The triage decision is logged with a timestamp and the name of the triage officer.

## Assigning the Investigation

The safety manager assigns an investigator from **Incident Management > [Incident] > Assign Investigator**. The investigator receives an automated notification with the incident details and a link to the IMS investigation workspace. For MAJOR, CRITICAL, or CATASTROPHIC incidents, a multi-person investigation team is typically assembled.

## Investigation Timelines

IMS enforces recommended investigation timelines based on severity:

- **MINOR**: within 5 business days
- **MODERATE**: within 3 business days
- **MAJOR**: within 48 hours
- **CRITICAL/CATASTROPHIC**: immediate (24-hour initial report, full report within 7 days)

Regulatory notification requirements (RIDDOR, OSHA, etc.) vary by jurisdiction and are configured by administrators.

## Gathering Evidence

The IMS investigation workspace supports systematic evidence collection:

- **Witness statement forms**: structured templates for recording witness accounts
- **Photo gallery**: organise and annotate photos and CCTV stills
- **Document references**: link relevant documents (procedures, risk assessments, training records)
- **Equipment records**: reference maintenance logs and inspection records
- **Timeline builder**: reconstruct the sequence of events leading to the incident

## Investigation Report Structure

IMS provides a standard investigation report template:

1. Incident summary and classification
2. Sequence of events (timeline)
3. Evidence summary
4. Contributing factors and root causes
5. Corrective actions recommended
6. Lessons learned

## Approval and Sign-Off

The completed investigation report is submitted for review to the safety manager and, for significant incidents, to senior leadership. Reviewers can comment and request amendments before final approval. The approved report is stored in IMS and linked to the incident record permanently.`,
  },
  {
    id: 'KB-DD2-027',
    title: 'Root Cause Analysis Methods',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['incidents', 'incident-management', 'safety'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Root Cause Analysis Methods

## The 5 Whys Method

The 5 Whys is the simplest RCA method: ask 'Why did this happen?' iteratively until you reach a root cause. IMS provides a 5 Whys worksheet within the investigation workspace. Enter the problem statement and up to five levels of 'Why' responses. The system saves your 5 Whys chain and links it to the investigation report.

This method works best for straightforward, single-cause incidents. Avoid stopping at the immediate cause; keep asking 'Why?' until you reach a systemic factor within your organisation's control.

## Fishbone Diagram (Ishikawa)

The fishbone diagram organises potential causes into categories. IMS supports the standard safety fishbone categories:

- People, Procedures, Equipment, Environment, Management System, Materials

Navigate to **Investigation > Add RCA Tool > Fishbone Diagram**. Add cause branches under each category. This method is particularly useful for identifying contributing factors across multiple areas.

## Fault Tree Analysis

Fault tree analysis is a top-down deductive approach suited to complex, multi-cause incidents. Start with the top event (the incident) and work backwards through the logical combinations of events that led to it. IMS includes a simple fault tree builder for incidents of MAJOR severity or above.

## Bowtie Analysis

Bowtie analysis maps threats (causes) on the left, consequences on the right, with the hazard at the centre. Barriers (controls) are shown on the threat side (prevention) and consequence side (mitigation). IMS's bowtie tool links barriers to existing controls in the risk and H&S modules, showing where barriers failed.

## Selecting the Right Method

- **MINOR/MODERATE**: 5 Whys is sufficient
- **MAJOR**: Fishbone or 5 Whys with contributing factors documented
- **CRITICAL/CATASTROPHIC**: Fault tree, Bowtie, or a formal multi-discipline investigation using all tools

## Documenting RCA Findings

All RCA tools in IMS automatically link their outputs to the investigation report. The root causes identified are then used to generate corrective actions (CAPAs) in the CAPA module.

## Common RCA Pitfalls

Avoid: stopping at human error as the root cause (always ask why the error occurred), blaming individuals rather than systems, and identifying causes outside your organisation's control. Good RCA identifies causes that lead to actionable improvements.`,
  },
  {
    id: 'KB-DD2-028',
    title: 'Corrective Actions from Incidents',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['incidents', 'incident-management', 'safety'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Corrective Actions from Incidents

## Creating CAPAs from an Incident Record

From any incident record, navigate to the **Corrective Actions** tab and click **+ Create CAPA**. The CAPA is automatically linked to the incident, inheriting the incident reference number, severity, and module. The investigator selects whether the CAPA addresses an immediate issue or a root cause.

## Immediate vs Root Cause Corrective Actions

Two types of corrective action arise from incident investigations:

- **Immediate corrective actions (containment)**: actions taken immediately to prevent recurrence while the investigation is ongoing (e.g. clean up a spill, fence off a hazardous area, suspend a process)
- **Root cause corrective actions**: actions that address the underlying cause identified through RCA (e.g. revise a procedure, install a permanent guard, provide specific training)

Both types are tracked as separate CAPA records in IMS.

## CAPA Assignment

Each CAPA requires: a responsible person (the owner accountable for completing it), a due date, and a description of the required evidence on completion (e.g. updated procedure document, training completion records, photo of installed control).

## Progress Tracking

CAPA status progresses through four stages:

- **OPEN**: assigned but not yet started
- **IN PROGRESS**: work underway
- **PENDING VERIFICATION**: owner has marked complete; awaiting verifier review
- **CLOSED**: verifier has confirmed effectiveness and closed the CAPA

The incident record's **Summary** tab shows the aggregate CAPA status for the incident.

## CAPA Effectiveness Review

When an owner marks a CAPA as PENDING VERIFICATION, the assigned verifier (typically the safety manager or investigation team leader) reviews the evidence and confirms whether the corrective action has effectively addressed the issue. If not effective, the CAPA is returned to IN PROGRESS with a comment.

## Linking Multiple Incidents to a Common CAPA

When a systemic issue underlies multiple incidents, a single CAPA can be linked to several incident records. This prevents duplication and ensures the systemic fix is tracked centrally. Use the **Link Existing CAPA** option on the Corrective Actions tab.

## CAPA Metrics

Track corrective action performance from **Incident Management > CAPA Dashboard**: average time from incident to CAPA closure, percentage of CAPAs closed on time, and recurrence rate (incidents with the same root cause within 12 months of a CAPA).`,
  },
  {
    id: 'KB-DD2-029',
    title: 'Near Miss & Hazard Reporting Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['incidents', 'incident-management', 'safety'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Near Miss & Hazard Reporting Guide

## Definitions

Understanding the difference between these three report types is important:

- **Incident**: an event that caused harm, damage, or an unplanned operational disruption
- **Near miss**: an event that had the potential to cause harm but did not — often described as 'a close call'
- **Hazard**: a condition or situation that has the potential to cause harm if not controlled — not yet an event

All three are reported in IMS using the same incident reporting form; the distinction is made by selecting the correct **Incident Type** field.

## Why Near Miss Reporting Matters

Near misses are a leading indicator of future incidents. For every serious injury, research shows there are typically many near misses and hazards that preceded it (Heinrich's Triangle). Organisations that identify and act on near misses and hazards prevent incidents before they occur.

A healthy near miss reporting culture means: more near misses reported than actual incidents, a high ratio of near miss reports relative to the workforce size, and visible management action on near miss reports.

## Making Near Miss Reporting Easy

IMS provides a simplified near miss quick-report form accessible on mobile devices without requiring a full login in some configurations. Reduce the friction of reporting by:

- Configuring the near miss form to require minimal fields (type, location, brief description)
- Embedding the near miss reporting link in safety induction materials
- Making the **+ Near Miss** button prominent on the dashboard

## Escalating a Near Miss to a Hazard

If the near miss reveals an ongoing hazardous condition that needs formal risk assessment, the safety officer can escalate the near miss report to a **Hazard** record from the incident record's **Actions** menu. This triggers a risk assessment workflow in the H&S module.

## Rewarding Near Miss Reporters

Positive safety culture practices include: acknowledging reporters by name in safety briefings (with consent), including near miss statistics in safety newsletters, and recognising departments with high near miss reporting rates as demonstrating good safety culture (not poor performance).

## Near Miss Trend Analysis

Review near miss data monthly: which locations generate the most near misses, which causal factors recur, and whether near miss volumes are increasing (which can indicate either improving culture or deteriorating conditions). Use this data to prioritise hazard inspections and risk assessments.`,
  },
  {
    id: 'KB-DD2-030',
    title: 'Incident Trend Analysis & Dashboard',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['incidents', 'incident-management', 'safety'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Incident Trend Analysis & Dashboard

## LTIFR Calculation

Lost Time Injury Frequency Rate (LTIFR) measures the number of lost time injuries per million hours worked. IMS calculates this automatically using:

LTIFR = (Number of lost time injuries x 1,000,000) / Total hours worked

Ensure hours worked data is entered monthly under **Incident Management > Settings > Hours Worked** for accurate LTIFR calculation.

## TRIFR

Total Recordable Injury Frequency Rate (TRIFR) includes all injuries requiring medical treatment (not just lost time injuries):

TRIFR = (Number of recordable injuries x 1,000,000) / Total hours worked

Both LTIFR and TRIFR are displayed on the main incident dashboard with trend lines.

## Severity Rate

Severity rate measures the total days lost due to injury per million hours worked. This metric highlights whether injuries are becoming more or less serious over time, independent of frequency.

## Monthly/Quarterly/Annual Comparison

The trend analysis panel shows incident counts by month or quarter for the current year compared to the previous year. Toggle between: total incidents, by severity level, by incident type (incident/near miss/hazard). Export the trend chart as an image or the underlying data as CSV.

## Location-Based Heat Map

The location heat map displays incident density by site and work area. Facilities with higher incident rates are shaded darker. Click any location to see the list of incidents at that site. This visual helps direct inspection and improvement resources to highest-risk areas.

## Causal Factor Analysis

The causal factor breakdown chart shows the most frequently identified root causes and contributing factors across all incidents in the period. Common systemic factors (e.g. inadequate supervision, poor housekeeping, equipment not maintained) are visible at a glance.

## Leading vs Lagging Indicators

IMS distinguishes between:

- **Lagging indicators**: reactive measures of past harm (LTIFR, TRIFR, severity rate)
- **Leading indicators**: proactive measures predicting future safety performance (near miss reports per employee, safety observation rates, overdue hazard assessments, training compliance)

Both are available on the incident dashboard. A strong safety programme improves leading indicators first, which subsequently improves lagging indicators.`,
  },
  {
    id: 'KB-DD2-031',
    title: 'Incident Reporting & Regulatory Compliance',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['incidents', 'incident-management', 'safety'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Incident Reporting & Regulatory Compliance

## Regulatory Notification Requirements

Regulatory notification requirements vary by jurisdiction and incident severity. IMS supports configuration for multiple regulatory frameworks:

- **RIDDOR (UK)**: reporting to the Health and Safety Executive required for over-7-day injuries, specified injuries, dangerous occurrences, and occupational diseases
- **OSHA 300 (US)**: recordkeeping and annual reporting of work-related injuries and illnesses
- **Other jurisdictions**: configure notification rules for any regulatory framework under Settings

## Configuring Automatic Regulatory Alerts

Navigate to **Settings > Incident Management > Regulatory Notifications**. For each jurisdiction applicable to your organisation, configure:

- The severity threshold that triggers a notification requirement
- The time limit for notification (e.g. within 10 days for RIDDOR over-7-day injuries)
- The recipient(s): safety manager, legal/compliance team, or the regulatory authority directly (via API where supported)

When an incident meeting the criteria is logged, IMS creates an automatic regulatory notification task assigned to the safety manager.

## Statutory Incident Report Generation

IMS generates pre-formatted incident reports aligned with common statutory requirements. For RIDDOR, the report includes all required data fields in the format expected by the UK HSE. For OSHA, IMS generates OSHA Form 300, 300A, and 301 data extracts. Access these from **Incident Management > [Incident] > Generate Statutory Report**.

## Incident Record Retention

Regulatory requirements for incident record retention vary:

- **UK (RIDDOR records)**: minimum 3 years
- **EU (general)**: typically 5-10 years depending on jurisdiction and industry
- **US (OSHA 300 logs)**: minimum 5 years
- **IMS default**: 7 years (configurable by administrator)

IMS does not delete incident records within the configured retention period. After the period, records are flagged for review before any deletion.

## Regulatory Authority Access

For regulatory inspections, create a time-limited read-only user account for the inspector under **Settings > Users > External Access**. This gives the inspector direct access to the incident register and records without sharing administrative credentials.

## Maintaining the Incident Register

For regulatory compliance, the incident register must be complete, accurate, and easily searchable. IMS enforces data quality by requiring mandatory fields at the point of reporting and flagging incomplete records. Use the **Incident Register Completeness Report** monthly to identify and complete any records with missing data.`,
  },
  {
    id: 'KB-DD2-032',
    title: 'Incident Management Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['incidents', 'incident-management', 'safety'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Incident Management Best Practices

## Creating a Just Culture

A just culture distinguishes between honest mistakes and reckless behaviour. In a just culture, employees are not punished for reporting incidents or near misses in good faith. This is the single most important enabler of high incident reporting rates. Make just culture principles explicit in your incident reporting policy and communicate them regularly.

## Response Time Standards

Define and publish clear response time standards for each severity level:

- **CATASTROPHIC/CRITICAL**: immediate response; site manager and safety director notified within 30 minutes
- **MAJOR**: response within 4 hours; investigation assigned within 24 hours
- **MODERATE**: acknowledgement within 24 hours; investigation assigned within 48 hours
- **MINOR**: acknowledgement within 48 hours; no formal investigation required

IMS enforces these standards through automated notifications and escalations.

## Incident Communication

Define a communication protocol for significant incidents: who is notified, in what order, through what channel, and with what information. Use the IMS notification system to automate stakeholder notifications based on severity. Ensure affected employees receive timely, factual communication about incidents and subsequent actions.

## Learning from Incidents: Formal Lessons Learned

For every MAJOR, CRITICAL, and CATASTROPHIC incident, document formal lessons learned and distribute them to relevant teams across the organisation. IMS includes a **Lessons Learned** section in the investigation report template. Share lessons via the IMS notification system and in team safety briefings.

## Investigation Quality Assurance

Implement a peer review process for investigation reports: before a report is approved, it is reviewed by a second qualified investigator who was not part of the investigation. This improves quality and ensures root causes are genuinely systemic rather than superficial.

## System-Wide Learning

When a significant incident occurs at one site, review whether similar hazards or conditions exist at other sites. Use the IMS risk module to check for related risks and the incident trend analysis to look for similar patterns elsewhere. Act on system-wide vulnerabilities before an incident occurs at another location.

## Incident Data in Management Review

Present incident data at every management review meeting: LTIFR and TRIFR trends, severity distribution, top causal factors, CAPA completion rate, and comparison to industry benchmarks. Incident data should drive management decisions about resource allocation and strategic safety priorities.`,
  },

  // ─── AUDIT MANAGEMENT (KB-DD2-033 to KB-DD2-040) ─────────────────────────
  {
    id: 'KB-DD2-033',
    title: 'Audit Management Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['audit', 'internal-audit', 'iso-19011'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Audit Management Day-to-Day User Guide

## Navigating the Audit Module

From the main menu, select **Audit Management** to open the audit module homepage. Three panels give you an immediate overview:

- **Planned Audits**: all audits scheduled in the current audit programme
- **Open Findings**: all non-conformances and observations currently under corrective action
- **My Tasks**: audit tasks assigned specifically to you (checklists to complete, findings to verify, CAPAs to close)

## Viewing Your Audit Schedule

Click **Audit Schedule** in the left navigation to see the full annual audit calendar. Filter by audit type (internal, supplier, process) or by module. Click any audit entry to see full details: scope, criteria, team, auditee, and status.

For audits you are involved in as an auditor or auditee, you will receive automated notifications 2 weeks before the scheduled audit date as a reminder.

## Completing an Audit Checklist

Open an assigned audit from **My Tasks > Checklists**. Work through each question, selecting the appropriate response:

- **Yes / Conforming**: the requirement is met
- **No / Non-conforming**: the requirement is not met (a finding will be created)
- **N/A**: the requirement does not apply to this audit scope
- **Partial**: partial conformance; an observation may be logged

Add notes and attach evidence (photos, documents) to any question using the evidence upload button.

## Logging an Audit Finding

When a question response is Non-conforming, click **Log Finding** to open the finding form. Select the finding type (NC — Major, NC — Minor, Observation, Opportunity for Improvement), write the finding statement, and link the relevant standard clause or requirement. Attach objective evidence to support the finding.

## Tracking Your Corrective Actions from Audits

Navigate to **My Tasks > Corrective Actions** to see all CAPAs arising from audit findings that are assigned to you. The status (Open, In Progress, Pending Verification, Closed) and due date are shown for each. Click any CAPA to update progress and upload completion evidence.

## Audit Dashboard

The audit dashboard shows: audit programme compliance rate (planned vs completed), open findings by type and age, overdue CAPAs, and the next five scheduled audits.`,
  },
  {
    id: 'KB-DD2-034',
    title: 'Audit Planning & Scheduling',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['audit', 'internal-audit', 'iso-19011'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Audit Planning & Scheduling

## Annual Audit Programme

The annual audit programme defines all audits to be conducted during the year. It is created by the audit programme manager (typically the QMS or HSE manager) and approved by senior leadership. Navigate to **Audit Management > Audit Programme > Create Programme** to set up the annual schedule.

A risk-based approach means higher-risk processes, sites, or suppliers receive more frequent or thorough audits. Review previous audit findings and incident data to inform the risk assessment for the programme.

## Audit Types

IMS supports the following audit types:

- **Internal audit**: conducted by your own trained auditors against management system requirements
- **External (certification body) audit**: by third-party certification bodies (BSI, DNV, Bureau Veritas, etc.)
- **Supplier audit**: evaluation of a supplier's management system or processes
- **Process audit**: focused on a specific process regardless of management system clause
- **System audit**: covering the full management system against all applicable clauses

## Audit Scope and Criteria

Each audit entry in IMS requires a defined scope (what processes, sites, departments, and time period are covered) and criteria (which standard clauses, procedures, or requirements will be audited against). Clear scope and criteria prevent audit creep and ensure a meaningful, focused audit.

## Audit Team Composition

Assign at least a Lead Auditor to every audit. Add additional auditors and technical experts as required by the scope. IMS checks that assigned auditors have the required competency level in the relevant module (based on their training records) and flags any gaps.

## Auditor Competency Requirements

ISO 19011:2018 defines auditor competency requirements. In IMS, auditor competency is verified by checking the auditor's training transcript for: Internal Auditor certification in the relevant standard, management system awareness, and any sector-specific technical knowledge required.

## Audit Notification

IMS sends a formal audit notification email to the auditee (typically the department head or site manager) at a configurable advance notice period (default: 4 weeks for planned audits, 24 hours for unannounced audits). The notification includes: scope, criteria, planned date, audit team composition, and a request for an opening meeting time.

## Resource Planning

Each audit entry includes fields for estimated audit days, travel requirements, and any accommodation needs. The audit programme manager can view total audit days planned across the year and balance the workload across the audit team.`,
  },
  {
    id: 'KB-DD2-035',
    title: 'Conducting an Internal Audit',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['audit', 'internal-audit', 'iso-19011'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Conducting an Internal Audit

## Pre-Audit Preparation

Before the audit date, the lead auditor should:

1. Review previous audit reports for the same scope — focus on whether previous findings have been closed
2. Review the applicable standard clauses and organisational procedures for the scope
3. Prepare or select the audit checklist in IMS from **Audit Management > [Audit] > Checklist > Select/Customise**
4. Confirm the opening meeting time and agenda with the auditee
5. Confirm team roles: who leads, who scribes, who covers which process areas

## Opening Meeting

The opening meeting formally starts the audit. A standard agenda includes:

- Introductions and roles
- Confirmation of audit scope and criteria
- Overview of the audit process and methodology
- Practical arrangements: access, contacts, safety requirements
- Confirmation of the closing meeting time

Record the opening meeting attendance in IMS by uploading the sign-in sheet or entering attendee names.

## Audit Evidence Collection

The auditor's role is to gather objective evidence through three methods:

- **Interviews**: structured conversations with process operators, supervisors, and managers
- **Observation**: watching processes in operation and observing workplace conditions
- **Document and record review**: checking that required documents exist, are current, and are being followed

All evidence should be specific, factual, and attributable (who said/showed/did what, when).

## Using the IMS Audit Checklist

Open the checklist on the IMS mobile app or desktop. Work through each question, entering responses (Yes/No/NA/Partial), adding notes about the evidence gathered, and attaching photos or documents. Mark questions as complete as you go. Partially completed checklists are saved automatically.

## Documenting Findings in Real-Time

Log findings immediately using the **Log Finding** button on any checklist question. Capturing findings in real-time avoids losing detail and ensures objective evidence is attached while it is fresh.

## Closing Meeting

Present preliminary findings to the auditee. Confirm the finding statements are factually accurate (though the auditee does not have to agree with the conclusion). Confirm the distribution list for the final report. Agree timelines for CAPA submission.

## Audit Report Drafting

After the closing meeting, the lead auditor completes the audit report in IMS. The system auto-populates the report template with audit details, checklist results, and logged findings. The auditor adds the executive summary, conclusions, and any overall observations about the management system's effectiveness.`,
  },
  {
    id: 'KB-DD2-036',
    title: 'Audit Findings & Non-Conformances',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['audit', 'internal-audit', 'iso-19011'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Audit Findings & Non-Conformances

## Finding Classification

IMS supports four finding types, aligned with ISO 19011:2018 guidance:

- **Major Non-Conformance (NC)**: a systematic failure or complete absence of a required element; likely to affect the organisation's ability to meet its management system objectives
- **Minor Non-Conformance (NC)**: an isolated failure or partial implementation of a requirement; does not represent a systematic breakdown
- **Observation**: not a non-conformance; the auditor notes an area of concern that could develop into a non-conformance if not addressed
- **Opportunity for Improvement (OFI)**: a positive suggestion for enhancement, not required by the standard but recommended by the auditor

## Writing an Effective Finding Statement

A well-written finding has three elements:

1. **What requirement was audited** (the criterion): reference the standard clause, procedure, or requirement
2. **What was found** (the objective evidence): specific, factual observations — who, what, when, where, how many
3. **The gap**: a clear statement of how the evidence fails to meet the requirement

Example: 'Clause 9.2 of ISO 9001:2015 requires all internal audits to be planned. During the audit on 2026-01-15, the 2025 audit programme was requested but not available. The audit programme manager confirmed no formal programme had been created for 2025. This does not meet the requirement.'

## Auditee Response

After the report is issued, the auditee can accept the finding or request clarification via the **Finding Response** function. Requesting clarification does not extend the CAPA deadline; disagreements are escalated to the audit programme manager for resolution.

## Corrective Action Assignment

When a finding is accepted, the auditee assigns a CAPA owner and due date from within the finding record. The CAPA is linked to the finding and progresses through the CAPA workflow. The finding status updates automatically as the CAPA progresses.

## Finding Dispute Resolution

If an auditee disputes a finding, the lead auditor and audit programme manager review the evidence and the auditee's counter-evidence. If the finding is not sustained, it is reclassified as withdrawn with a note. If sustained, the CAPA deadline is confirmed. All dispute communications are logged in IMS.

## Systemic Finding Identification

Review findings from multiple audits for patterns. If the same root cause recurs across different audits or sites, this indicates a systemic management system weakness. IMS's finding trend analysis helps identify these patterns. A systemic finding may warrant a separate, broader CAPA or a management system review.`,
  },
  {
    id: 'KB-DD2-037',
    title: 'Corrective Actions from Audits',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['audit', 'internal-audit', 'iso-19011'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Corrective Actions from Audits

## CAPA Raised from Audit Finding: Mandatory Fields

When creating a CAPA from an audit finding in IMS, the following fields are mandatory:

- **Finding reference**: automatically linked from the parent finding
- **Root cause**: the identified root cause of the non-conformance (using one of the supported RCA methods)
- **Corrective action description**: what will be done to eliminate the root cause
- **Responsible person**: the named owner of the corrective action
- **Due date**: realistic target completion date
- **Evidence required**: what constitutes sufficient evidence of completion

## Root Cause Analysis Link

IMS links the CAPA to the RCA tool used (5 Whys, fishbone, etc.) from within the CAPA record. The root cause must be documented before the CAPA can be progressed beyond OPEN status. This enforces genuine root cause investigation rather than superficial corrective action.

## CAPA Action Plan

For complex CAPAs requiring multiple steps, add sub-actions to the CAPA record. Each sub-action has its own owner, due date, and evidence requirement. The overall CAPA cannot be marked complete until all sub-actions are completed. This structured approach prevents premature closure.

## Evidence Requirements

Define evidence requirements clearly at the point of CAPA creation:

- Updated and approved procedure document
- Training completion records for affected staff
- Photo or video of physical change implemented
- Test results or inspection records confirming the fix

Vague evidence requirements lead to inadequate evidence being submitted. Be specific.

## Verification by the Auditor

IMS requires that CAPAs from audit findings are verified by the original auditor (or a designated verifier) before they can be closed. The verifier reviews the evidence submitted by the CAPA owner and confirms it is adequate and addresses the root cause. If not, they return the CAPA with a comment.

## CAPA Escalation

CAPAs that reach their due date without being marked complete are automatically escalated: first to the CAPA owner's manager, then to the audit programme manager. The IMS escalation dashboard shows all overdue audit CAPAs and their escalation status.

## Closing the Finding

Once the CAPA is verified and closed, the linked finding status automatically updates to CLOSED in IMS. The finding's closure date, CAPA reference, and verifier's name are recorded in the finding record. The audit report is updated to reflect all findings as closed when the last outstanding CAPA is verified.`,
  },
  {
    id: 'KB-DD2-038',
    title: 'Audit Evidence Collection & Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['audit', 'internal-audit', 'iso-19011'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Audit Evidence Collection & Management

## Evidence Types

IMS supports the following evidence types within audit records:

- **Documents**: controlled documents reviewed during the audit (linked from the Document Control module or uploaded as files)
- **Records**: completed forms, logs, maintenance records, and other operational records
- **Photos**: photographs of physical conditions, equipment, workplace areas
- **Test results**: calibration certificates, inspection test records, laboratory results
- **Interview notes**: structured notes from auditor interviews with staff
- **Observation notes**: written observations of processes or conditions witnessed during the audit

## Uploading Evidence During the Audit

The IMS mobile app supports evidence upload during the audit. Photograph a document or condition, add a brief caption, and link it to the relevant checklist question or finding directly from the app. Evidence is immediately synchronised to the audit record in IMS.

## Evidence Naming Convention

Adopt a consistent naming convention for audit evidence files to make audit packs navigable:

Format: [AuditRef]-[Clause]-[EvidenceType]-[SequenceNumber]
Example: AUD-2026-014-Cl6.1-Photo-001.jpg

Configure your convention in **Settings > Audit Management > Evidence Naming** to apply it automatically.

## Linking Evidence to Questions and Findings

Each piece of evidence in IMS can be linked to one or more checklist questions and to specific findings. This linkage makes it easy for report reviewers and certification bodies to trace a finding's objective evidence directly. Use the **Link to Finding** option on each evidence item.

## Evidence Review by the Audit Team

Before finalising the audit report, the lead auditor reviews all uploaded evidence to confirm it is adequate, legible, and clearly supports the checklist responses and findings. Insufficient or unclear evidence should be flagged for follow-up before the closing meeting if possible.

## Preparing Evidence Packs for Certification Body Audits

For external (certification body) audits, IMS can generate a complete evidence pack. Navigate to **Audit Management > [Audit] > Export Evidence Pack**. The pack includes: the completed checklist, all findings, all uploaded evidence files, the audit report, and all linked controlled documents. The pack is exported as an organised ZIP file.

## Evidence Retention

Audit records and all associated evidence are retained in IMS for the configured retention period. ISO standards recommend a minimum of three years for audit records. IMS does not delete audit evidence within the retention period. After retention, evidence is flagged for administrator review before any deletion action.`,
  },
  {
    id: 'KB-DD2-039',
    title: 'Audit Reporting & Dashboard',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['audit', 'internal-audit', 'iso-19011'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Audit Reporting & Dashboard

## Audit Report Structure

IMS generates audit reports using a standard template that includes:

1. **Audit details**: reference, date, type, scope, criteria, audit team
2. **Opening meeting attendance**: names and roles of attendees
3. **Audit process summary**: areas covered, evidence reviewed, audit methodology
4. **Findings summary**: total by type (Major NC, Minor NC, Observation, OFI)
5. **Finding details**: individual finding statements with evidence references
6. **Conclusions**: overall assessment of the management system's conformance and effectiveness
7. **Appendices**: completed checklist, evidence list

The report template is auto-populated from all data entered in IMS during the audit. The lead auditor adds the narrative sections (audit process summary and conclusions) before submitting for approval.

## Audit Score Calculation

IMS calculates an overall audit score from the checklist responses. Scores are weighted by question category (e.g. mandatory requirements weighted higher than recommended practices). The score is expressed as a percentage and displayed on the audit summary card in the dashboard.

## Audit Dashboard Widgets

Key widgets on the audit management dashboard:

- **Planned vs Completed**: progress bar showing the audit programme completion rate
- **Findings by Type**: bar chart showing Major NC, Minor NC, Observation, OFI counts for the current year
- **CAPA Status**: doughnut chart showing Open, In Progress, Pending Verification, Closed CAPAs
- **Next Scheduled Audits**: upcoming five audits with dates and scope
- **Overdue CAPAs**: count of CAPAs past their due date

## Multi-Site Audit Comparison

The benchmarking report (**Audit Management > Reports > Benchmarking**) compares audit scores across multiple sites for the same audit type and period. This helps identify high-performing sites to share good practices from and low-performing sites requiring additional support.

## Audit Programme Report for Management Review

The annual audit programme report is a required input to management review under ISO 9001, 14001, and 45001. IMS generates this report from **Audit Management > Reports > Programme Summary**. It covers: audits planned vs completed, total findings by type, CAPA close rate, and trend compared to the prior year.

## Distributing Audit Reports

Configure the distribution list for each audit report under the audit settings. Recipients receive an email notification with a link to the report in IMS when it is approved. External recipients (e.g. certification bodies) can be given temporary access or receive the report as a PDF attachment.`,
  },
  {
    id: 'KB-DD2-040',
    title: 'Internal Audit Best Practices (ISO 19011)',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['audit', 'internal-audit', 'iso-19011'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Internal Audit Best Practices (ISO 19011)

## ISO 19011:2018 Alignment

ISO 19011:2018 provides guidance on auditing management systems. IMS is designed to support its three-part structure:

- **Principles of auditing**: integrity, fair presentation, due professional care, confidentiality, independence, evidence-based approach, risk-based approach
- **Managing an audit programme**: objectives, risks, scope, coordination, monitoring
- **Conducting audits**: initiation, preparation, execution, reporting, completion, follow-up

## Risk-Based Audit Scheduling

The most effective audit programmes allocate audit resources to the areas of greatest risk and significance. Factors to consider: previous audit finding history, process complexity and change, incident and complaint history, regulatory requirements, and strategic importance to the organisation. Use IMS risk data and incident trends to inform the annual audit programme.

## Auditor Independence

Auditors must not audit their own work. IMS enforces this by flagging potential conflicts of interest when assigning auditors: if an auditor is listed as a process owner or has direct management responsibility for the audit scope, a conflict warning is displayed. The audit programme manager must resolve the conflict before proceeding.

## Continual Improvement of the Audit Programme

Review the audit programme itself at least annually:

- Were all planned audits completed on time?
- Were audit reports issued within the required timeframe?
- Are CAPA close rates improving?
- Is the risk-based scheduling approach capturing the right areas?

Document this review as part of management review inputs.

## Auditor Development

Invest in ongoing auditor development. Beyond initial certification, good auditors develop skills in: process analysis, effective interviewing, clear written communication, conflict resolution, and sector-specific technical knowledge. Track auditor CPD in the IMS Training module.

## Audit Findings Driving Real Improvement

Audit programmes that generate findings but do not drive genuine corrective action add little value. Monitor the CAPA effectiveness rate: what percentage of closed CAPAs resulted in no recurrence of the finding at the next audit? Low effectiveness rates indicate superficial corrective action.

## Cross-Functional Audit Teams

Include non-specialists in audit teams to bring fresh perspectives. An accountant on a safety audit or an engineer on a quality audit often spots issues that specialist auditors overlook. This cross-pollination also builds management system awareness across the organisation.

## Integrating Audit Results into Management Review

Audit data — programme completion, finding trends, CAPA close rates, and benchmarking results — must be presented at management review. Use the IMS audit programme summary report as the basis for the management review input. Ensure management review outputs include decisions and actions related to audit programme improvements.`,
  },
];
