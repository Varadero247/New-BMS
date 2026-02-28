import type { KBArticle } from '../types';

export const moduleDeepDives10Articles: KBArticle[] = [
  // ─── PARTNER PORTAL MODULE ───────────────────────────────────────────────────
  {
    id: 'KB-DD10-001',
    title: 'Partner Portal — Day-to-Day User Guide',
    content: `## Partner Portal — Day-to-Day User Guide

The Partner Portal gives partner organisations a dedicated workspace to collaborate with your organisation on joint business activities. This guide walks through the routine tasks a partner user performs each day.

### Logging In and Navigation

Partners access the portal at your organisation's dedicated partner portal URL. After logging in with their partner credentials, they land on the Partner Dashboard, which shows a summary of their tier status, open deals, pending tasks, MDF balance, and any announcements from your partner programme team.

The main navigation is divided into six sections:

- **Projects** — joint projects and co-sell opportunities
- **Documents** — shared content library (pricing, technical specs, marketing assets)
- **Deals** — deal registrations and pipeline
- **MDF** — Market Development Funds balance, requests, and activity reporting
- **Training** — available courses and certification status
- **Account** — partner profile, scorecard, and team management

### Accessing Joint Projects

Open the Projects section to view all active joint projects. Each project card shows the project name, your organisation's owner, the current phase, and the partner's action items. Click a project to open the full detail view — here the partner sees shared milestones, documents attached to this project, and a communication log.

Partners can update task status, attach deliverables, and post comments directly on the project. All activity is visible to both sides.

### Viewing Shared Documents

The Documents library contains content your organisation has made available to this partner. Documents are organised by category: Product, Pricing, Marketing, Technical, and Training. The partner's tier determines which categories and individual documents are visible — for example, a Silver partner may see the standard price list while a Gold partner also sees the discount schedule.

To download a document, click the title and select Download. If a document requires NDA acceptance before access, the partner is prompted to acknowledge the NDA on first access.

### Logging Co-Marketing Activities

If the partner is running a co-marketing activity — a webinar, event, or email campaign — they record it under MDF > Activity Log. They enter the activity name, type, planned date, target audience, and estimated reach. Attaching the campaign brief at this stage helps with MDF fund reconciliation later.

### Submitting Deal Registrations

To register a new deal, the partner navigates to Deals > Register New Deal. They complete the deal registration form: prospect company name, contact name, estimated deal value, expected close date, product or service lines, and a brief description of the opportunity.

On submission, the deal enters your organisation's review queue. The partner can track the status — Submitted, Under Review, Approved, or Rejected — from the Deals list.

### Checking MDF Balances

The MDF section shows the partner's current programme balance, allocated funds against active requests, and historical fund usage. The balance refreshes when your programme team processes completed activity claims.

### Viewing Partner Tier Status

The Account > Tier Status page shows the partner's current tier (Silver, Gold, or Platinum) alongside the requirements for the next tier: revenue threshold, certified engineers, deal registration activity, and MDF utilisation rate. A progress indicator shows how close the partner is to each requirement.

### Accessing Training Resources

The Training section lists courses available to partner users. Some courses are required for tier maintenance; others are optional. Each course card shows estimated duration, the certification it leads to, and its expiry period. Partners click Enrol to start a course and track completion from their training dashboard.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['partners', 'portal', 'daily-use', 'collaboration'],
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
    id: 'KB-DD10-002',
    title: 'Partner Portal — Administrator Configuration Guide',
    content: `## Partner Portal — Administrator Configuration Guide

This guide covers the full configuration of the Partner Portal for internal administrators responsible for managing the partner programme setup.

### Partner Tier Configuration

Navigate to Settings > Partner Programme > Tiers. The default tier structure includes Silver, Gold, and Platinum, but names and thresholds are configurable.

For each tier, define:

- **Revenue Threshold** — annual partner-sourced revenue required to achieve or maintain the tier
- **Certified Engineer Requirement** — minimum number of personnel holding current product certifications
- **Deal Registration Requirement** — minimum number of deals registered per quarter
- **MDF Utilisation Rate** — minimum percentage of allocated MDF that must be claimed within the programme year

Tier reviews can be set to run automatically on a quarterly or annual schedule, or triggered manually from the partner's account page.

### Deal Registration Rules

Under Settings > Deal Registration, configure:

- **Protection Period** — how long (in days) a registered deal is protected from being registered by another partner against the same prospect. Default is 90 days.
- **Auto-Approval Threshold** — deals below a set value can be auto-approved without manual review.
- **Conflict Resolution Policy** — when two partners register the same prospect, define whether the first-registered partner wins, the deal is split, or a manual review is required.
- **Required Fields** — configure which fields are mandatory before submission is accepted.

### MDF Programme Setup

Open Settings > MDF Programme. Define the programme year dates, the total MDF budget available, and the allocation method:

- **Tier-Based Allocation** — Gold partners receive a fixed MDF allocation, Platinum partners receive a higher allocation.
- **Performance-Based Allocation** — MDF is allocated as a percentage of prior-year partner-sourced revenue.
- **Hybrid** — base allocation by tier plus a performance uplift.

Set the claim submission deadline (e.g., 60 days after activity completion) and configure Proof of Execution (POE) document requirements per activity type.

### Shared Content Library

Under Content > Partner Library, upload documents and configure visibility:

1. Upload the document and select the document type (Pricing, Technical, Marketing, Training, Product).
2. Set the minimum tier required to access the document.
3. Optionally restrict to specific named partners.
4. Set an NDA requirement if the document is commercially sensitive.
5. Set an expiry date if the document should be automatically hidden after a certain date (e.g., outdated price lists).

### Partner User Provisioning

Partners can be invited individually or in bulk. From Partners > Manage > select a partner > Team, use Invite User to send an email invitation. Alternatively, upload a CSV of email addresses for bulk invitation.

Assign each partner user a role: Partner Admin (can manage their organisation's users and profile), Partner User (standard access), or Partner Viewer (read-only access to shared documents and deal status).

### SSO Setup

If the partner organisation uses a corporate identity provider, configure SSO under the partner's account settings. The system supports SAML 2.0 and OIDC. Provide the partner's IdP metadata URL or upload their metadata XML. Map the name, email, and role attributes from the identity provider's claims.

### Partner Scorecard KPI Configuration

Open Settings > Scorecard. Define the KPIs included in the partner scorecard and their weighting:

- Revenue Generated (suggested weight: 30%)
- Deal Win Rate (suggested weight: 20%)
- Pipeline Coverage Ratio (suggested weight: 15%)
- Certification Compliance (suggested weight: 15%)
- Customer Satisfaction from Partner-Led Deals (suggested weight: 10%)
- MDF Utilisation (suggested weight: 10%)

Adjust weightings to reflect your programme's strategic priorities.

### Notification Templates

Under Settings > Notifications, configure the email and in-portal notification templates for partner events: deal registration approved/rejected, MDF request approved/rejected, tier review outcome, certification expiry reminder, and partner contract renewal. Each template supports merge fields for partner name, deal details, and programme manager contact.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['partners', 'portal', 'admin', 'configuration'],
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
    id: 'KB-DD10-003',
    title: 'Partner Portal — Deal Registration & Pipeline',
    content: `## Partner Portal — Deal Registration & Pipeline

Deal registration protects the partner's investment in finding and developing an opportunity. This article covers the full workflow — from partner submission through approval, conflict handling, and outcome reporting.

### Partner Deal Submission

A partner logs in and navigates to Deals > Register New Deal. The registration form captures:

- **Prospect Details** — company name, primary contact name, email, and phone
- **Opportunity Details** — product or service lines, estimated deal value, expected close date
- **Opportunity Description** — a brief narrative of the business challenge and proposed solution
- **Partner Contact** — the partner sales representative owning this deal

On submission the system performs a duplicate check: it searches existing registered deals and open CRM opportunities for the same prospect. If a potential conflict is found, the partner is warned before submission and the deal enters a Conflict Review state rather than the standard queue.

### Review and Approval Workflow

Submitted deals appear in the partner programme manager's queue under Deals > Pending Review. The reviewer can:

- **Approve** — the deal is protected for the configured protection period
- **Reject** — the partner is notified with a reason (e.g., existing direct account, duplicate registration)
- **Request Information** — the deal is returned to the partner with a question before a decision is made

Partners receive email and portal notifications at each status change.

### Deal Protection Rules

Once approved, the deal is marked Protected with an expiry date. During the protection window:

- No other partner can register the same prospect for the same product line.
- Your internal sales team can see the registration and the partner contact.
- If your direct sales team independently identifies the same prospect, the system flags a potential conflict and routes it to the programme manager.

Protection can be extended by the programme manager if the sales cycle is longer than the default period.

### Conflict Resolution

When two partners register the same prospect, the conflict resolution policy defined in settings applies. In manual review mode, the programme manager sees both registrations side by side — submission dates, deal details, and contact information — and decides which partner is awarded protection or whether a co-sell arrangement is appropriate.

The outcome and rationale are recorded and visible to both partners.

### Pipeline Visibility

Partners see only their own deals. Your internal programme team sees all partner deals in the aggregate pipeline view. The pipeline view filters by: tier, region, product line, stage, and deal value. The partner-visible fields (prospect name, deal value, stage) are configurable separately from the internal-only fields (internal sales owner, probability score, strategic notes).

### Co-Sell Tracking

When a deal involves both a partner and an internal sales representative working together, mark the deal as Co-Sell. This unlocks a shared activity log visible to both parties, enables joint meeting scheduling, and records the co-sell effort for revenue attribution purposes.

### Revenue Attribution

At deal close, record the outcome: Won, Lost, or No Decision. For won deals, attribute revenue as:

- **Partner-Sourced** — the partner identified and developed the opportunity independently.
- **Partner-Influenced** — the partner contributed to an opportunity originally identified internally.

Revenue attribution feeds the partner scorecard and the programme ROI analysis.

### Reporting Deal Outcomes to Partners

Partners receive an automatic notification when a deal they registered is closed. For won deals, the notification includes the confirmed deal value and confirmation that partner-sourced revenue has been credited to their scorecard. For lost deals, the partner can optionally request a win/loss debrief from their programme manager.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['partners', 'portal', 'deal-registration', 'pipeline'],
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
    id: 'KB-DD10-004',
    title: 'Partner Portal — MDF & Co-Marketing',
    content: `## Partner Portal — MDF & Co-Marketing

Market Development Funds (MDF) are co-investment funds your organisation provides to partners to generate demand and accelerate revenue. This article covers the complete MDF lifecycle from fund allocation through proof of execution and reconciliation.

### MDF Programme Structure

MDF programmes typically run on a calendar-year or programme-year basis. Each partner has a fund allocation based on their tier or prior-year performance. The MDF balance is visible on the partner's portal dashboard and in the MDF section of the portal.

Fund categories may include:
- **Events** — sponsorship, booth fees, and event hosting
- **Digital Marketing** — paid advertising, content syndication
- **Field Marketing** — local campaigns, roadshows, customer dinners
- **Telemarketing** — outbound calling programmes
- **Training** — partner-facing training events

### MDF Request Submission (Partner)

When a partner plans an activity and wants to pre-approve MDF spend, they submit an MDF Request:

1. Navigate to MDF > New Request.
2. Select the activity type, provide the activity name, planned date, target audience, expected reach, and a description of the activity.
3. Enter the estimated cost and the amount of MDF requested.
4. Attach the campaign brief or event plan.
5. Submit. The request enters the programme manager's review queue.

Requests can be submitted for pre-approval before the activity occurs, or as a post-activity claim if pre-approval was not required for the activity type.

### Approval Workflow (Programme Manager)

Pending requests appear under MDF > Pending Requests. The programme manager reviews the activity plan, checks the partner's remaining balance, and either approves, rejects, or requests additional information.

Approval criteria typically include: activity alignment with programme objectives, budget availability, minimum expected reach, and use of co-branded materials.

### Activity Completion and Proof of Execution (POE)

After the activity is complete, the partner must submit a POE claim to release the funds:

1. Open the approved MDF request and click Submit POE.
2. Upload required evidence: event photos, email campaign screenshots, attendee lists, invoices, or analytics reports.
3. Enter the actual cost incurred and the actual reach achieved.
4. Submit the POE claim for review.

The programme manager reviews the POE against the approval conditions. If evidence is satisfactory, the claim is approved and the actual spend is deducted from the partner's MDF balance.

### ROI Measurement

For each completed activity, the system records:
- Funds spent
- Estimated reach and actual reach
- Leads generated (entered manually or via CRM sync)
- Pipeline influenced (linked deal registrations within a configurable attribution window)
- Revenue influenced

ROI is calculated as: (Revenue Influenced) / (MDF Spend). Activities with positive ROI attribution are highlighted in programme reporting.

### Co-Branded Asset Library

The Documents section includes a Co-Marketing folder with editable co-branded templates: email templates, presentation decks, data sheets, and banner ads in standard dimensions. Partners download these templates, add their logo and contact details, and use them for approved MDF activities. Using approved assets is often a POE requirement for digital marketing claims.

### Joint Campaign Management

For larger co-marketing campaigns involving multiple activities, create a Campaign under MDF > Campaigns. A campaign groups related MDF requests and activities, provides an aggregate spend view, and tracks campaign-level ROI across all constituent activities.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['partners', 'portal', 'mdf', 'co-marketing'],
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
    id: 'KB-DD10-005',
    title: 'Partner Portal — Training & Certification Tracking',
    content: `## Partner Portal — Training & Certification Tracking

Partner training and certification programmes ensure that partner personnel have the product knowledge, technical skills, and compliance awareness needed to represent your organisation effectively.

### Partner Training Catalogue

The Training section of the portal lists all courses available to partner users. Courses are categorised as:

- **Required** — mandatory for tier maintenance (e.g., all Gold engineers must complete Advanced Technical Certification)
- **Recommended** — strongly encouraged for partner performance but not tier-blocking
- **Optional** — available for personal development or specialist use cases

Each course card shows: title, duration, certification earned, certification validity period, and whether it is required for the partner's current or target tier.

### Enrolling in a Course

Partners click Enrol on a course card. Depending on the course type, this either:

- Opens the e-learning content directly within the portal (for self-paced digital courses)
- Registers the partner user for an instructor-led session (showing available dates and locations)
- Links to an external learning management system (LMS) where the course is hosted

### Completion and Certification

On completing a course and passing any assessment, the certification is recorded against the partner user's profile. The certification entry shows:

- Certification name
- Date achieved
- Expiry date (e.g., valid for 2 years)
- Certificate download link (PDF)

Certifications are visible to both the partner user and your internal programme team.

### Certification Renewal Reminders

The system sends automatic reminders when a certification is approaching expiry:

- 90 days before expiry: initial reminder to the partner user and their partner admin
- 30 days before expiry: escalation reminder
- On expiry: the certification is marked Expired and the partner admin is notified

If a certification required for tier maintenance expires and is not renewed within a grace period, the tier review process may be triggered.

### Tier Requirement Enforcement

The partner scorecard's Certification Compliance dimension checks whether the partner meets the minimum certification headcount for their tier. For example:

- Silver: 1 certified sales professional
- Gold: 2 certified sales professionals + 2 certified technical engineers
- Platinum: 3 certified sales professionals + 4 certified technical engineers + 1 certified solutions architect

The Tier Status page shows exactly how many certified personnel the partner currently has against each requirement.

### Integration with the Training Management Module

If your organisation uses the IMS Training Management module internally, partner-accessible courses can be linked from that module's catalogue into the Partner Portal training section. Completion records sync between the two systems, so you have a single source of truth for both internal and partner training compliance.

### Partner Competency Reporting

Administrators access Training > Partner Compliance Report to see certification status across all partners:

- Total partner users certified per certification type
- Percentage of partners meeting tier training requirements
- Certifications expiring in the next 90 days, by partner
- Partners at risk of tier downgrade due to certification lapse

Export this report as CSV or PDF for programme review meetings.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['partners', 'portal', 'training', 'certification'],
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
    id: 'KB-DD10-006',
    title: 'Partner Portal — Partner Scorecard & Performance',
    content: `## Partner Portal — Partner Scorecard & Performance

The partner scorecard gives both your organisation and your partners a transparent view of partner programme performance. It drives tier decisions, remediation conversations, and programme investment.

### Scorecard Dimensions

The default scorecard measures six dimensions. Each dimension has a configured weight that determines its contribution to the overall scorecard score (0–100).

**1. Revenue Generated (30%)**
Total partner-sourced and partner-influenced revenue in the current programme year, measured against the partner's revenue target for their tier.

**2. Deal Win Rate (20%)**
Percentage of registered deals that closed as Won, measuring the quality of deal registrations and partner sales execution.

**3. Pipeline Coverage Ratio (15%)**
Total open deal pipeline value divided by the partner's quarterly revenue target. A ratio of 3x or higher is considered healthy.

**4. Certification Compliance (15%)**
Percentage of required certifications held by partner personnel, measured against tier requirements.

**5. Customer Satisfaction (10%)**
Average CSAT or NPS score from customers on deals closed by or with this partner, pulled from the Customer Portal feedback data.

**6. MDF Utilisation (10%)**
Percentage of allocated MDF that the partner claimed within the programme year. Low utilisation may indicate poor programme engagement.

### Automated Scorecard Calculation

Scorecard scores update automatically each week based on live data from the Deal Registration, Training, MDF, and Customer Portal modules. Programme managers do not need to manually calculate scores.

The scorecard view shows both the raw metric and the dimension score. A traffic light indicator (green/amber/red) is shown for each dimension based on configured thresholds.

### Tier Review Process

Tier reviews are triggered on the schedule defined in settings (quarterly or annually) or manually by a programme manager. During a review, the system compares the partner's scorecard against the tier criteria. Possible outcomes:

- **Tier Maintained** — partner meets all requirements for their current tier
- **Tier Upgraded** — partner meets all requirements for the next tier and is promoted
- **Tier at Risk** — partner falls below one or more requirements; a remediation period is granted
- **Tier Downgraded** — partner has been in Tier at Risk status for the grace period without improvement

The partner receives an email notification of the tier review outcome along with a detailed scorecard breakdown.

### Remediation Plans

When a partner is at risk of tier downgrade, the programme manager creates a Remediation Plan under the partner's account. The plan records:

- The specific dimensions where the partner is underperforming
- Agreed targets to meet by the end of the remediation period
- Support commitments from your organisation (e.g., a dedicated programme manager resource, co-sell support)
- Review checkpoints (e.g., monthly calls during the remediation period)

The partner can view their remediation plan in the portal and update action progress against each commitment.

### Scorecard Benchmark Comparison

Partners can view an anonymised benchmark in their portal showing how their scorecard compares to the average for their tier. This shows, for example, that they are above average on deal win rate but below average on MDF utilisation — giving a clear signal of where to focus.

Programme administrators see a full benchmark view with all partners ranked, which supports programme health analysis and identification of best practices to share across the programme.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['partners', 'portal', 'scorecard', 'performance', 'kpi'],
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
    id: 'KB-DD10-007',
    title: 'Partner Portal — Document Sharing & Collaboration',
    content: `## Partner Portal — Document Sharing & Collaboration

Controlled document sharing with partners is a key function of the Partner Portal — giving partners the information they need while protecting commercially sensitive or restricted materials.

### Document Visibility Permissions

Document access is controlled on two axes:

**Tier-Based Access**
Assign a minimum tier to each document. A Silver partner cannot see documents marked Gold or above. This ensures that information such as extended discount schedules or detailed product roadmaps is only available to partners who have earned that level of trust.

**Deal-Based Access**
Some documents should only be available when a partner has an active registered deal for a specific product. Configure these documents with Deal Required = Yes. The partner only sees the document if they have at least one approved deal registration for the relevant product line.

### Managing the Shared Document Library

Administrators manage documents under Content > Partner Library. To add a document:

1. Click Upload Document.
2. Select the file and enter the document title, type, and description.
3. Set the visibility rules: minimum tier, deal requirement, specific partner whitelist (if applicable).
4. Set an NDA requirement if needed.
5. Set a document expiry date if applicable.
6. Publish immediately or save as draft for review.

### Version Control

When a document is updated, upload a new version rather than replacing the file. The system maintains a version history. Partners always see the latest published version. If the partner downloaded a previous version, the document in their portal shows a "newer version available" indicator.

Version history is accessible to administrators to track what version was available to partners at any given date — useful for compliance or dispute resolution.

### NDA-Gated Content

Mark sensitive documents as NDA Required. On first access, the partner user is presented with the NDA text and must click Accept before the download link is revealed. The acceptance is recorded (partner user name, timestamp, document version) and visible to administrators under the document's Access Log.

Partners who have already accepted the NDA for a document are not prompted again unless the NDA version changes.

### Sharing Product Roadmaps

Product roadmaps require careful access control. Typically these are shared only with Gold and Platinum partners under NDA. Use the Deal-Based Access control in combination with the tier restriction to ensure that only actively selling partners see the roadmap.

Mark roadmap documents with an explicit expiry date so they are automatically hidden after the disclosed timeframe has passed.

### Partner Feedback on Documents

Partners can submit feedback on any document they can access: a thumbs-up/down rating and a free-text comment. This feedback is visible to administrators and helps identify documents that are confusing, outdated, or missing detail. Feedback notifications are sent to the document owner.

### Audit Trail of Document Access

Every document download is logged: partner organisation, user name, document title, version, and timestamp. Administrators access the audit trail under Content > Access Log. Filter by document, partner, or date range. This log supports data governance and provides evidence for NDA compliance.

The access log can be exported as CSV for external audit purposes.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['partners', 'portal', 'documents', 'sharing', 'collaboration'],
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
    id: 'KB-DD10-008',
    title: 'Partner Portal — Reporting & Analytics',
    content: `## Partner Portal — Reporting & Analytics

Partner programme reporting provides the executive and operational visibility needed to manage programme health, justify investment, and drive continuous improvement.

### Partner Programme KPI Dashboard

The programme dashboard is accessible to programme managers and executives under Reports > Partner Programme. Key metrics shown:

**Revenue Metrics**
- Total partner-sourced revenue (year to date vs target)
- Total partner-influenced revenue
- Revenue by tier (Silver / Gold / Platinum contribution split)
- Average deal size by tier and region

**Pipeline Metrics**
- Total open partner pipeline value
- Pipeline coverage ratio (programme total)
- Deal registration velocity (registrations per week, 12-week trend)
- Average time from registration to close

**MDF Metrics**
- Total MDF allocated vs claimed
- Utilisation rate by tier
- Average ROI on completed MDF activities
- Top activities by pipeline influenced

**Engagement Metrics**
- Partner portal login frequency (weekly active partners as % of total)
- Feature adoption by module (documents, deals, MDF, training)
- Partner NPS (aggregated from post-transaction surveys)
- Certification rate by tier

### Partner Engagement Scoring

Each partner is assigned an Engagement Score (0–100) combining portal activity, MDF utilisation, deal registration frequency, and training completion rate. This score supplements the financial scorecard and identifies partners who are disengaging before revenue impact becomes visible.

Low-engagement partners (score below 40) are flagged for programme manager outreach. High-engagement partners above 80 are candidates for co-investment and featured partner status.

### Executive Partner Programme Report

The Executive Report is a pre-formatted summary suitable for leadership review meetings. It covers:

- Programme health summary (revenue, pipeline, MDF ROI)
- Tier distribution (number of partners at each tier and trend)
- Top 10 partners by revenue contribution
- Risk summary (partners at risk of tier downgrade)
- Programme investment vs return

Generate the Executive Report from Reports > Partner Programme > Executive Report. Select the reporting period (month, quarter, or year) and click Generate. The report is available as PDF or exportable to Word.

### Partner-Facing Performance Summary

Partners can access a simplified version of their own performance summary from Account > My Performance Report. They see their scorecard, deal performance, MDF summary, and training compliance in a single-page summary.

Programme managers can also generate and email this summary to the partner on demand — useful for regular business reviews or tier renewal conversations. Navigate to Partners > select partner > Actions > Send Performance Summary.

### Custom Report Builder

For ad hoc analysis, use the Custom Report builder under Reports > Custom. Select dimensions (partner, tier, region, product) and metrics (revenue, win rate, pipeline, MDF), apply filters, and run the report. Save frequently used custom reports for quick access.

Custom reports can be scheduled for automatic delivery by email on a daily, weekly, or monthly basis.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['partners', 'portal', 'reporting', 'analytics'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },

  // ─── CUSTOMER PORTAL MODULE ───────────────────────────────────────────────────
  {
    id: 'KB-DD10-009',
    title: 'Customer Portal — Self-Service Account Management',
    content: `## Customer Portal — Self-Service Account Management

The Customer Portal empowers customers to manage their own account details, users, and preferences without raising support requests. This reduces administrative overhead for your team while giving customers direct control.

### Accessing Account Settings

After logging in, customers navigate to Account > Settings from the top navigation. The Settings section is divided into sub-pages: Profile, Organisation, Users, Notifications, Security, and Preferences.

### Updating Contact Information

Under Account > Settings > Profile, the customer can update:

- Primary contact name, job title, and phone number
- Contact email address (requires email verification on change)
- Profile photograph

For changes to the primary contact email, the system sends a verification link to the new address before applying the change. The old address receives a notification of the change for security awareness.

### Billing Address Changes

Billing address updates are made under Account > Settings > Organisation. The customer enters the new billing address and submits for update. If your organisation requires internal approval before address changes take effect (for billing system integrity), the change enters a pending state and the customer sees a "pending approval" indicator until an internal team member confirms it.

### User Invitation and Role Assignment

Customers manage their own team's portal access. Under Account > Settings > Users, an account admin can:

- **Invite a User** — enter an email address and select a role (Admin, User, or Viewer). An invitation email is sent automatically.
- **Edit Role** — change an existing user's role at any time.
- **Deactivate a User** — deactivate a user who has left the organisation without deleting their history.
- **Resend Invitation** — resend an expired invitation link.

The portal enforces a user limit based on the customer's account tier. A warning is shown when the limit is approached.

### Notification Preference Settings

Under Account > Settings > Notifications, customers configure which portal events trigger email or in-portal notifications:

- New invoice posted
- Contract renewal approaching
- Support ticket status change
- New document published to their account
- NPS survey request
- Scheduled maintenance alerts

Notifications can be configured per user — each team member sets their own preferences.

### Time Zone and Language Preferences

Under Account > Settings > Preferences, customers set:

- **Time Zone** — all dates and times throughout the portal display in the selected time zone
- **Language** — portal interface language (available languages depend on your configured locales)
- **Date Format** — DD/MM/YYYY or MM/DD/YYYY
- **Currency Display** — for customers with multi-currency contracts, they can select their preferred display currency (this does not affect invoice amounts, which are in the contracted currency)

### Two-Factor Authentication Setup

Customers can enable 2FA for their portal access under Account > Settings > Security. Supported methods:

- **Authenticator App** — scan the QR code with Google Authenticator, Authy, or any TOTP-compatible app
- **SMS** — receive a one-time code by SMS (requires a verified mobile number)

Account admins can also enforce 2FA for all users in their organisation by enabling the "Require 2FA for all users" toggle. After enabling this, users who do not yet have 2FA set up are prompted to complete setup at their next login.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['customer-portal', 'self-service', 'account-management'],
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
    id: 'KB-DD10-010',
    title: 'Customer Portal — Contract & Invoice Management',
    content: `## Customer Portal — Contract & Invoice Management

The Customer Portal provides customers with direct access to their contracts, invoices, and billing documents, reducing inbound queries and improving the customer experience around commercial matters.

### Viewing Contracts and Statements of Work

Navigate to Account > Contracts. The contracts list shows all active and historical agreements:

- Contract name and reference number
- Contract type (Master Agreement, Statement of Work, Order Form, Amendment)
- Start and end dates
- Contract status (Active, Pending Renewal, Expired, Terminated)
- Linked documents (attachments to this contract)

Click a contract to view the full detail. Download the signed PDF from the document attachment section. If a contract has a renewal date approaching, a banner is shown prompting the customer to initiate renewal.

### Invoice Access and Download

Invoices are listed under Account > Invoices. Each invoice shows:

- Invoice number and date
- Due date and payment status (Paid, Unpaid, Overdue, Disputed)
- Invoice amount and currency
- Download link for the PDF invoice

Customers can download individual invoices or use the bulk download option to download all invoices for a selected date range as a ZIP file — useful for finance teams reconciling accounts.

### Invoice Dispute Workflow

If a customer believes an invoice is incorrect, they can raise a dispute directly in the portal:

1. Open the invoice and click Raise Dispute.
2. Select the dispute category: Incorrect Amount, Duplicate Invoice, Services Not Rendered, or Other.
3. Enter a description of the issue and optionally attach supporting documents.
4. Submit.

The dispute is routed to your finance team. The invoice is flagged as Disputed in the portal and the customer receives updates as the dispute is investigated. On resolution, the customer is notified of the outcome and any credit note or corrected invoice is posted to their account.

### Payment Method Management

Under Account > Billing > Payment Methods, customers manage their payment methods if your organisation offers direct portal payment:

- Add, update, or remove credit/debit card details
- Set a default payment method
- View payment history

For customers on purchase order-based billing, they can attach their current PO number under Account > Billing > Purchase Order Reference. This PO reference is printed on subsequent invoices automatically.

### Usage Report Downloads

For usage-based contracts, usage reports are available under Account > Usage. Customers select the period and download a CSV or PDF usage summary. This is particularly relevant for SaaS or consumption-based services where the customer needs to reconcile usage against invoiced amounts.

### Contract Renewal Initiation

When a contract approaches its renewal date, the customer sees a Renew Contract option on the contract detail page. Clicking this opens a renewal request form where the customer can indicate their intent to renew, request changes to scope or terms, or request a renewal discussion with their account manager. The request is routed to your renewals team.

### Certificate of Compliance Downloads

For customers who need a certificate confirming your organisation holds relevant certifications (ISO 9001, ISO 27001, etc.), these are available under Account > Certificates. Your team publishes the current certificates here, and the customer downloads them on demand without raising a request.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['customer-portal', 'contracts', 'invoices', 'billing'],
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
    id: 'KB-DD10-011',
    title: 'Customer Portal — Support Ticket Management',
    content: `## Customer Portal — Support Ticket Management

The Customer Portal provides a self-service support interface that allows customers to submit, track, and manage their support requests without needing to phone or email your support team.

### Submitting a Support Ticket

Customers navigate to Support > New Ticket. The submission form includes:

- **Category** — select from the configured category list (Technical, Billing, Account, Product, Other)
- **Priority** — customer-selected urgency: Low, Medium, High, or Critical (your SLA policy governs response times per priority)
- **Subject** — a brief, descriptive subject line
- **Description** — full description of the issue or request
- **Attachments** — upload screenshots, log files, or other supporting files (up to 10 files, 25 MB each)

As the customer types their description, the portal suggests relevant knowledge base articles that may resolve the issue without needing to submit a ticket. If the customer finds a helpful article, they can close the form without submitting.

### Real-Time Status Tracking

After submission, the ticket is visible under Support > My Tickets. The list shows each ticket's reference number, subject, category, priority, status, and last update date.

Ticket statuses:
- **Open** — submitted, awaiting first response
- **In Progress** — being actively worked by your support team
- **Awaiting Customer** — your team has responded and is waiting for additional information
- **Resolved** — your team has marked the ticket as resolved (customer can reopen within a configurable window)
- **Closed** — ticket is closed and no longer active

Customers receive email notifications at each status change and when a support agent adds a comment.

### Responding to Support Agents

When a ticket is in Awaiting Customer status, the customer opens the ticket and posts a reply in the conversation thread. They can attach additional files. This moves the ticket back to In Progress status.

### Escalation Requests

If a customer is dissatisfied with the progress of a ticket, they can click Escalate within the ticket. This sends an escalation notification to the support team manager and flags the ticket with an escalation indicator. The customer enters a brief reason for escalation before submitting.

Escalated tickets are governed by escalation SLAs separate from the standard SLA for the priority level.

### Customer Satisfaction (CSAT) Rating

When a ticket is resolved, the customer receives an automatic CSAT survey via email and in the portal. The survey asks:

- Overall satisfaction with the support experience (1–5 stars)
- Whether the issue was fully resolved (Yes / No / Partially)
- An optional free-text comment

CSAT responses feed the customer satisfaction reporting in your quality and CRM modules.

### SLA Visibility

Customers can see their SLA terms under Support > My SLA. This page shows:

- Target response time by priority
- Target resolution time by priority
- Current performance (e.g., "98% of Critical tickets responded within SLA this quarter")

On each open ticket, a countdown shows the remaining time before the SLA target is breached, giving the customer visibility into expected response timing without needing to ask.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['customer-portal', 'support', 'tickets', 'complaints'],
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
    id: 'KB-DD10-012',
    title: 'Customer Portal — Product & Service Requests',
    content: `## Customer Portal — Product & Service Requests

Customers can initiate a variety of product and service-related requests directly through the portal, avoiding the need to contact their account manager for routine transactions.

### Request Types Available in the Portal

Configure which request types are visible to customers under Settings > Portal > Request Types. Common types include:

- **Service Request** — a request for standard service delivery (e.g., additional user provisioning, configuration change)
- **Change Request** — a request to change the scope, configuration, or terms of a current service
- **New Product/Service Request** — an expression of interest in a product or service not currently in the customer's contract
- **Feature Request** — a suggestion for a new capability or enhancement to an existing product
- **Information Request** — a request for technical documentation, compliance evidence, or other information

### Submitting a Service Request

Navigate to Requests > New Request. Select the request type, complete the required fields for that type, attach any supporting documents, and submit.

For service requests with a configurable service catalogue, the form dynamically shows the relevant fields. For example, a User Provisioning request asks for the new user's name, email, and role; a Configuration Change request asks for the current configuration, the requested change, and the reason.

### Request Status Tracking and Approval Workflow

Submitted requests appear under Requests > My Requests. Customers track status: Submitted, Under Review, Approved, In Progress, Delivered, or Rejected.

Some request types require the customer to formally acknowledge and approve a scope or cost change before work proceeds. When your team issues an approval step, the customer sees an action required indicator on the request. They open the request, review the proposed scope and any cost implications, and click Accept or Decline.

### Customer Acknowledgement of Change Impact

For change requests that carry risk or operational impact, your team can include a Change Impact Summary with the approval request. This documents: expected downtime, affected services, rollback plan, and scheduled delivery window. The customer's acknowledgement of this summary is recorded as part of the request audit trail.

### Delivery Scheduling via Portal

For requests that require scheduling (e.g., an on-site service visit or a maintenance window), the customer can view available delivery slots directly in the portal. When your team creates the request fulfilment task in the internal Project Management module, available slots are published to the portal. The customer selects their preferred slot and confirms. Both sides receive a calendar invitation.

### Integration with Internal Project Management

Approved requests automatically create a task or project in the internal Project Management module, assigned to the relevant delivery team. The portal request and the internal task are linked — status updates on the internal task sync back to the customer-facing request status automatically.

The customer sees a real-time progress indicator that reflects the actual delivery progress without your team needing to manually update the portal.

### Feature Request Management

Feature requests submitted through the portal are routed to your product management team. The customer can see the status of their feature request: Received, Under Review, On Roadmap, Delivered, or Declined (with reason). This closed-loop approach demonstrates that customer feedback is taken seriously and builds confidence in the product development process.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['customer-portal', 'requests', 'service', 'orders'],
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
    id: 'KB-DD10-013',
    title: 'Customer Portal — Quality Document Access',
    content: `## Customer Portal — Quality Document Access

Customers in regulated or quality-sensitive industries frequently need access to quality documentation specific to their orders or account. The Customer Portal provides a controlled, on-demand document access point that reduces manual document distribution effort.

### Documents Available Through the Portal

Configure which document types customers can access under Settings > Portal > Quality Documents. Common types include:

- **Certificate of Conformance (CoC)** — confirms that products or services meet specified requirements
- **Test Reports** — detailed test data and results for manufactured items or software builds
- **Traceability Records** — material traceability from raw material to finished product
- **Product Specifications** — technical specifications relevant to the customer's products
- **Material Safety Data Sheets (MSDS/SDS)** — chemical safety information for products handled by the customer
- **REACH/RoHS Declarations** — substance compliance declarations
- **Inspection Reports** — results of incoming or in-process inspections

### Finding and Downloading Documents

Customers navigate to Documents > Quality Documents. They can search by:

- Document type
- Order number or purchase order reference
- Part number or product name
- Date range (documents issued in a specific period)

Each document entry shows the document title, reference number, issue date, and version. Click Download to retrieve the PDF.

### Document Request Workflow

If a customer cannot find a document they need — for example, a CoC for an older order not yet in the portal — they can submit a document request:

1. Click Request a Document.
2. Select the document type and enter the relevant order number or part number.
3. Describe the specific document needed and the reason (e.g., customer audit requirement, regulatory submission).
4. Submit.

The request is routed to your quality team. Once the document is prepared and published, the customer receives a notification and the document appears in their quality documents library.

### Notification When New Certificates Are Posted

When your quality team publishes a new document to a customer's account, the customer automatically receives a notification (email and in-portal). This is particularly useful for recurring documents such as annual batch certificates or periodic test reports, where the customer needs to know as soon as the latest issue is available.

Notification preferences for quality documents are configurable per customer user in Account > Settings > Notifications.

### Document Version Control

When a certificate or document is reissued (e.g., corrected CoC), the portal shows the latest version by default. The previous version is retained in the version history, accessible by clicking Show Previous Versions. This ensures customers always have the correct current document while preserving the audit trail.

### Access Control by Account

Quality documents are scoped to the customer's account — customers can only see documents related to their own orders and products. This is enforced at the data level; a customer cannot navigate to another customer's document even if they know the URL.

For customers with complex organisational structures (parent company with multiple subsidiaries each having their own portal access), configure account groups under Settings > Portal > Account Groups to allow parent-level visibility across subsidiary accounts.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['customer-portal', 'quality', 'documents', 'certificates'],
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
    id: 'KB-DD10-014',
    title: 'Customer Portal — NPS & Feedback Collection',
    content: `## Customer Portal — NPS & Feedback Collection

Systematic feedback collection through the Customer Portal supports continuous service improvement and gives customers confidence that their voice is heard.

### NPS Survey Types

Two types of NPS surveys are used:

**Relationship NPS (rNPS)**
Sent on a scheduled basis (typically quarterly or annually) to all active customers, regardless of recent interactions. Measures the overall relationship and long-term sentiment.

**Transactional NPS (tNPS)**
Triggered automatically after a specific customer interaction: a support ticket is resolved, a service request is delivered, a project milestone is completed. Measures satisfaction with that specific transaction.

Configure survey schedules and triggers under Settings > Feedback > NPS Configuration.

### Survey Dispatch

NPS surveys are sent by email and also appear as an in-portal prompt. The survey email contains a single-question prompt ("On a scale of 0–10, how likely are you to recommend us to a colleague?") with the 11-point scale embedded directly in the email — the customer can respond with one click without logging in.

If the customer logs into the portal and a pending survey exists, a non-intrusive banner prompts them to complete it.

### Customer Feedback Submission

After selecting their NPS score, customers are taken to a short follow-up page:

- A follow-up open-text question tailored to the score band:
  - Promoters (9–10): "What do you value most about working with us?"
  - Passives (7–8): "What could we do better?"
  - Detractors (0–6): "What is the most important thing we should improve?"
- An optional category selector: Product, Service, Support, Commercial, Communication

Completing the follow-up is optional but encouraged.

### Feedback Categorisation and Routing

Submitted feedback is automatically categorised by the text analysis engine and routed to the appropriate team:

- Product feedback → Product Management
- Support feedback → Customer Support Manager
- Commercial feedback → Account Management
- Communication feedback → Customer Success

Each routed feedback item appears in the relevant team's dashboard with the customer name (unless submitted anonymously), NPS score, and verbatim comment. The team member acknowledges receipt and records the action taken.

### Closed-Loop Feedback

Customers can see the status of actions taken in response to their feedback under Account > My Feedback. When the responsible team member records an action (e.g., "Raised a product improvement request referencing this feedback" or "Account manager has scheduled a call to discuss"), the customer sees a "We acted on this" indicator.

This closed-loop approach — showing customers that feedback leads to action — is strongly correlated with improved NPS over time.

### Satisfaction Trend Reporting

The Feedback dashboard under Reports > Customer Satisfaction shows:

- NPS trend over time (rolling 12-month chart)
- Net Promoter Score breakdown by segment (tier, region, product)
- Average tNPS by transaction type
- Detractor volume and common themes (word cloud from verbatim comments)
- Closed-loop completion rate (percentage of detractor feedback that received a follow-up action)

Export the satisfaction report as PDF for quarterly business reviews.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['customer-portal', 'nps', 'feedback', 'satisfaction'],
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
    id: 'KB-DD10-015',
    title: 'Customer Portal — Reporting & Administrator Guide',
    content: `## Customer Portal — Reporting & Administrator Guide

This guide covers portal administration configuration and the analytics available to internal administrators responsible for the Customer Portal.

### Portal Branding Configuration

Navigate to Settings > Portal > Branding. Configure:

- **Organisation Logo** — upload the logo that appears in the portal header and email notifications (PNG, max 500 KB)
- **Primary Colour** — hex code for the portal's primary action colour (buttons, links, highlights)
- **Secondary Colour** — hex code for the portal's secondary elements
- **Portal Domain** — the custom subdomain at which the portal is hosted (e.g., 'portal.yourcompany.com')
- **Email From Name** — the sender name for all portal-generated emails
- **Custom Welcome Message** — a short message displayed on the portal login page

Preview changes before publishing. Changes take effect immediately after saving.

### Feature Toggles Per Customer Tier

Under Settings > Portal > Feature Access, configure which portal features are available by customer tier:

- **Bronze** — Support Tickets, Quality Documents (basic), Account Settings
- **Silver** — all Bronze features + Contracts, Invoices, Requests, Usage Reports
- **Gold** — all Silver features + Advanced Reporting, NPS Feedback, Product Requests
- **Enterprise** — all features + custom integrations and dedicated account views

Adjust tier-to-feature mappings to match your commercial model.

### Permitted Document Types

Under Settings > Portal > Document Types, enable or disable the document categories that can be published to the customer-facing library. Only enable categories that your team is operationally ready to maintain. Enabling a category sets the expectation that documents will be available; leaving categories empty frustrates customers.

### Customer Portal Usage Analytics

The portal usage dashboard (Reports > Portal Usage) provides:

- **Active Users** — monthly active users trend (30/60/90 day)
- **Login Frequency** — average logins per user per week, by customer tier
- **Feature Adoption** — which modules customers use most (support, documents, contracts, requests, NPS)
- **Session Duration** — average time spent in the portal per session
- **Mobile vs Desktop** — device split for portal access

High feature adoption is a positive signal of portal value. Low adoption of a feature that should be high-value indicates a UX or communication issue to investigate.

### Generating Customer Health Reports

Customer health is a composite measure combining portal engagement, support ticket volume, NPS score, contract renewal status, and payment behaviour. The Customer Health Report (Reports > Customer Health) shows each account's health score (0–100) and trend (improving, stable, declining).

Accounts with declining health scores are flagged for proactive outreach by the customer success team. The report exports to CSV for integration with CRM tools.

### SLA Compliance Reporting Per Customer

Under Reports > SLA Compliance, filter by customer to see their specific SLA performance:

- Response SLA compliance rate (% of tickets responded within target)
- Resolution SLA compliance rate (% of tickets resolved within target)
- Breached tickets with root cause category
- Trend over the last 12 months

This report is useful for customer quarterly business reviews and for internal performance monitoring. For customers with SLA credits in their contract, this report provides the evidentiary basis for credit calculations.

### Audit Log

All administrative changes to portal settings are logged in Settings > Audit Log. This records who made what change and when, supporting governance and change management processes.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['customer-portal', 'admin', 'reporting', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },

  // ─── SUPPLIER PORTAL MODULE ───────────────────────────────────────────────────
  {
    id: 'KB-DD10-016',
    title: 'Supplier Portal — Onboarding & Qualification',
    content: `## Supplier Portal — Onboarding & Qualification

A structured supplier onboarding and qualification process ensures that new suppliers meet your organisation's minimum standards before being added to the approved supplier list.

### Initiating Onboarding

Supplier onboarding can be initiated in two ways:

1. **Internal Initiation** — a buyer creates a new supplier record in the Supplier Portal and sends an onboarding invitation to the supplier's primary contact.
2. **Self-Registration** — if enabled, suppliers access your supplier portal's public registration URL and submit a registration request. The request is reviewed by your procurement team before onboarding proceeds.

### Supplier Registration Form

The supplier completes an online registration form capturing:

- Company name, registered address, and legal entity type
- Primary contact details
- Business categories and products/services offered
- Countries of operation
- Annual turnover band (for risk segmentation)
- Parent company and ultimate beneficial owner (UBO) disclosure

### Document Submission

After registration, the supplier is guided through a document submission checklist. Required documents typically include:

- **Certificates** — ISO 9001, ISO 14001, ISO 45001, or sector-specific certifications (Nadcap, AS9100, IATF 16949)
- **Insurance Certificates** — public liability, professional indemnity, employer's liability
- **Bank Details** — for payment processing (submitted via a secure bank detail form, not email)
- **Modern Slavery Statement** — required for suppliers above the statutory threshold
- **Data Processing Agreement** — if the supplier will process personal data on your behalf

Suppliers upload documents directly in the portal. Each document has a defined expiry date; the portal tracks expiry and sends renewal reminders.

### Qualification Questionnaire

The qualification questionnaire is a structured assessment covering:

- **Quality Management** — QMS maturity, inspection capabilities, non-conformance handling
- **Environmental** — environmental policy, waste management, carbon footprint data
- **Health & Safety** — accident rate, H&S policy, site safety standards
- **Financial Stability** — self-declared financial health and credit references
- **Ethics & Compliance** — anti-bribery policy, whistleblowing channel, sanctions screening consent

Questionnaire responses are scored automatically and reviewed by the procurement team. High-risk responses may trigger an escalated review or a pre-qualification audit.

### Pre-Qualification Approval and Conditional Approval

After reviewing documents and questionnaire responses, the procurement team issues one of three decisions:

- **Approved** — supplier is added to the approved supplier list with a defined qualification validity period
- **Conditionally Approved** — supplier may be used for low-risk purchases while open action items are resolved (e.g., a missing certificate is expected imminently)
- **Rejected** — supplier does not meet minimum requirements; rejection reason is recorded

All decisions are visible to the supplier in the portal.

### Requalification

Qualification validity periods are configurable by supplier risk category (e.g., strategic suppliers every 2 years, standard suppliers every 3 years). When a requalification is due, the supplier is prompted to update their documents and re-complete the qualification questionnaire. Changes are flagged for reviewer attention; unchanged sections are pre-populated from the previous qualification.

### Self-Service Document Updates

Approved suppliers can update their documents at any time via the portal — for example, to upload a renewed ISO certificate before the current one expires. Updated documents trigger a review notification to the procurement team. The supplier's approval status is maintained pending review unless the updated document raises a new concern.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['supplier-portal', 'onboarding', 'qualification', 'vendor'],
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
    id: 'KB-DD10-017',
    title: 'Supplier Portal — Purchase Order & Delivery Management',
    content: `## Supplier Portal — Purchase Order & Delivery Management

The Supplier Portal provides a collaborative interface for purchase order management and delivery coordination, reducing email-based communication and creating a full audit trail of procurement transactions.

### Viewing Purchase Orders

Suppliers navigate to Orders > Purchase Orders to see all POs issued to them. The PO list shows:

- PO number and issue date
- Buyer name and organisation
- PO status: Pending Acknowledgement, Acknowledged, In Delivery, Partially Delivered, Complete, or Cancelled
- Total PO value and currency
- Required delivery date

Click a PO to open the full detail: line items with quantities, unit prices, delivery addresses, and any special instructions.

### Purchase Order Acknowledgement

When a new PO is issued, the supplier receives a portal notification and must acknowledge receipt. Open the PO and click Acknowledge. If the supplier cannot fulfil the PO as stated (e.g., quantity unavailable or delivery date unachievable), they click Acknowledge with Exception and enter the specific exception: revised quantity, revised delivery date, or substitute item offered.

Exceptions are routed back to the buyer for acceptance or rejection before the PO is confirmed.

### Delivery Confirmation and Advance Ship Notice (ASN)

When goods are shipped or a service delivery is scheduled, the supplier submits an Advance Ship Notice from the PO detail page:

1. Select the PO lines being shipped.
2. Enter quantities shipped per line.
3. Enter the dispatch date, estimated delivery date, carrier name, and tracking number.
4. Attach the packing list and any certificates of conformance for the shipment.
5. Submit.

The buyer receives an ASN notification and can track the shipment through the portal.

### Partial Delivery Recording

For large orders delivered in multiple shipments, each delivery is recorded as a separate ASN against the same PO. The PO detail view shows a running summary: quantities ordered, quantities delivered to date, and outstanding quantities. Both the supplier and the buyer have a real-time view of delivery progress.

### Delivery Performance Self-Reporting

For service deliveries, suppliers record completion via the portal: service description, completion date, hours worked (if applicable), and evidence of delivery (e.g., signed delivery note, completion certificate). This self-reported data feeds the supplier's on-time delivery metric on their performance scorecard.

### Discrepancy Reporting Against PO

If a supplier identifies a discrepancy between the PO and their capability to deliver (e.g., material shortage, specification ambiguity), they raise a Delivery Query directly on the PO. The buyer is notified and responds via the portal, creating a documented resolution record that both parties can reference.

### Electronic Proof of Delivery Upload

After physical delivery, the supplier uploads the signed delivery note or proof of delivery (POD) document to the relevant ASN record. This provides an auditable record of delivery acceptance, useful for invoice reconciliation and dispute resolution.

### Integration with Inventory Receiving

When a delivery is confirmed in the Supplier Portal, the inventory receiving module is automatically notified. The receiving team can compare the ASN details against the physical goods received and record any discrepancies (shorts, overages, damaged items) in the receiving record. Discrepancies are visible to the supplier in the portal and may trigger a formal nonconformance report.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['supplier-portal', 'purchase-orders', 'delivery', 'procurement'],
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
    id: 'KB-DD10-018',
    title: 'Supplier Portal — Quality & Nonconformance Reporting',
    content: `## Supplier Portal — Quality & Nonconformance Reporting

Effective nonconformance management with suppliers requires a structured, documented process. The Supplier Portal enables both supplier-initiated and customer-issued nonconformance reports to be managed collaboratively.

### Supplier-Initiated Nonconformance Reports (SNR)

If a supplier identifies a quality issue before or during delivery — for example, material test results outside specification, or a process deviation that may have affected product — they should proactively raise a Supplier Nonconformance Report rather than shipping nonconforming product.

To raise an SNR:

1. Navigate to Quality > New Nonconformance.
2. Select the affected PO and line item(s).
3. Describe the nonconformance: what was found, when it was discovered, quantity affected.
4. Attach supporting evidence (test reports, photographs, measurement data).
5. Propose a disposition: Use As Is, Rework, Scrap, or Return for Disposition by Customer.
6. Submit.

Your quality team reviews the SNR and issues a disposition decision within the configured response window.

### Receiving Customer-Issued Nonconformance Notices

When your organisation identifies a nonconformance on incoming material or a delivered service, a Nonconformance Notice (NCN) is issued to the supplier via the portal. The supplier receives a notification and can view the NCN in Quality > Received Nonconformances.

The NCN includes: description of the nonconformance, photos or measurements, affected PO and quantity, and the required corrective action response deadline.

### Corrective Action Response (8D and 5-Why)

The supplier submits a corrective action response directly in the portal. The response form supports structured problem-solving methodologies:

**8D Response**
The 8D form walks through each discipline: D1 (team), D2 (problem description), D3 (containment), D4 (root cause), D5 (permanent corrective action), D6 (implementation), D7 (recurrence prevention), D8 (team recognition and closure).

**5-Why Response**
For simpler nonconformances, the 5-Why form provides a root cause chain from symptom to root cause, followed by a corrective action and verification plan.

Attach supporting evidence (photos of scrap disposal, rework records, process change documentation) to the response before submitting.

### Effectiveness Verification Follow-Up

After the corrective action is implemented, your quality team schedules a verification review. The supplier submits verification evidence through the portal — for example, statistical process data showing the issue has not recurred, or updated work instructions. The quality team reviews and either closes the NCN or requests additional evidence.

### Supplier Quality Rating Visibility

Suppliers can see their current quality rating under My Performance > Quality Rating. The rating is calculated from:

- NCR frequency (nonconformances per 100 deliveries)
- Corrective action response rate (% of NCRs with CA submitted on time)
- Escape rate (nonconformances not caught before delivery)
- First time right rate (deliveries accepted without rework or concession)

### Appeal Process for Disputed NCRs

If a supplier disputes an NCR — for example, believing the nonconformance was caused by your organisation's specification error or handling damage — they can raise an Appeal. The appeal includes a written statement and supporting evidence. Appeals are reviewed by a senior quality manager who was not involved in the original NCR. The appeal outcome is recorded and both parties are notified.

### Document Submission for CAR Closure

To formally close a Corrective Action Request (CAR), the supplier must submit a closure package that typically includes: confirmed root cause, permanent corrective action taken, supporting evidence, and an updated control plan or PFMEA if applicable. The closure package is reviewed by your quality team and, if satisfactory, the CAR is closed and the supplier's quality rating is updated.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['supplier-portal', 'quality', 'nonconformance', 'corrective-action'],
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
    id: 'KB-DD10-019',
    title: 'Supplier Portal — Certificate & Document Management',
    content: `## Supplier Portal — Certificate & Document Management

Maintaining current, accurate compliance documentation from suppliers is a core procurement governance requirement. The Supplier Portal provides a structured environment for suppliers to manage and submit their compliance documentation.

### Document Types Managed in the Portal

The following compliance document types are commonly managed through the Supplier Portal:

- **Quality Management Certificates** — ISO 9001, IATF 16949, AS9100, ISO 13485
- **Environmental Certificates** — ISO 14001, ISO 50001
- **Health & Safety Certificates** — ISO 45001, OHSAS 18001 (legacy)
- **Sector Approvals** — Nadcap (aerospace special processes), FDA registration, CE marking technical files
- **Insurance Certificates** — Public liability, employer's liability, professional indemnity, product liability
- **Material Certifications** — Mill test certificates, certificates of conformance for raw materials
- **Substance Compliance** — REACH substance declarations, RoHS compliance declarations, conflict minerals (CMRT)
- **Modern Slavery** — Annual Modern Slavery and Human Trafficking Statement

### Uploading and Managing Documents

Suppliers navigate to Documents > My Documents. To upload a new document:

1. Click Upload Document.
2. Select the document type from the configured list.
3. Enter the issuing body name, certificate number (if applicable), issue date, and expiry date.
4. Upload the document file (PDF preferred; max 20 MB).
5. Submit.

Uploaded documents are immediately visible to your procurement and quality teams for review. Documents remain in a Pending Review status until a reviewer approves them.

### Expiry Notifications and Renewal Reminders

The system tracks expiry dates for all submitted documents. Automated reminders are sent to the supplier:

- 90 days before expiry: first reminder
- 60 days before expiry: second reminder with escalation to supplier's account admin
- 30 days before expiry: final reminder — document shown as Expiring Soon in the portal
- On expiry: document marked as Expired; supplier qualification status may be affected if a required document expires

Suppliers see a document status summary on their portal dashboard highlighting any expired or expiring-soon items.

### Customer Access to Supplier Certificates

Certificates stored in the Supplier Portal are accessible to your procurement, quality, and audit teams. They can view the supplier's full document library, download individual certificates, and see the document history (all previous versions).

For externally auditable processes (e.g., a customer audit of your supply chain), you can generate a Supplier Compliance Summary Report showing the supplier's current certification status across all required document types.

### Version Control and Approval Workflow

When a supplier uploads a renewed certificate, the new version enters Pending Review status. The previous version remains as Active until the review is complete. Once approved, the new version becomes Active and the previous version is archived in version history.

If a supplier uploads a document that does not meet requirements (e.g., a certificate issued by an unaccredited body, or missing scope of certification), the reviewer rejects the document with a comment, and the supplier is notified to re-submit.

### Nadcap and Sector-Specific Approvals

For aerospace and defence suppliers, Nadcap approval documents (including process category and commodity approvals) are managed with additional metadata: the accrediting body (PRI), the specific process categories approved (Heat Treat, NDT, Chemical Processing, etc.), and the customer-specific approvals where applicable.

The system checks Nadcap expiry independently for each process category, since a supplier may hold a two-year approval for Heat Treat but a shorter cycle for NDT.

### Conflict Minerals and REACH Declarations

REACH and RoHS declarations are managed as annual submissions. The system reminds suppliers to submit updated declarations each programme year. The conflict minerals CMRT (Conflict Minerals Reporting Template) follows the same annual cycle.

Suppliers complete these declarations directly in the portal using guided forms, reducing the burden of managing multiple spreadsheet submissions. Submitted declarations are validated against expected format before acceptance.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['supplier-portal', 'certificates', 'documents', 'compliance'],
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
    id: 'KB-DD10-020',
    title: 'Supplier Portal — Performance Scorecard & Reporting',
    content: `## Supplier Portal — Performance Scorecard & Reporting

The supplier performance scorecard gives both your organisation and your suppliers a shared, transparent view of delivery, quality, and relationship performance — supporting constructive supplier reviews and continuous improvement.

### Scorecard Dimensions

The default scorecard measures five dimensions:

**1. On-Time Delivery (OTD)**
Percentage of PO lines delivered on or before the required delivery date, measured over the rolling 12-month period. A delivery is on time if the ASN-confirmed delivery date meets the PO date. Partial deliveries count pro-rata by quantity.

**2. Quality Acceptance Rate (QAR)**
Percentage of delivered lots accepted at incoming inspection without requiring rework, concession, or return. Calculated as: (Lots Accepted First Time) / (Total Lots Delivered).

**3. Cost Performance**
Variance between invoiced amounts and PO values (excluding approved change orders). High levels of invoice variance indicate commercial control issues. Also includes any cost recovery claims raised against the supplier for nonconformance.

**4. Responsiveness**
Average time to: acknowledge POs, respond to quality queries, submit corrective action responses, and return calls or portal messages. Measured against configured SLA targets.

**5. Sustainability Score**
Composite score based on: ISO 14001 certification status, carbon footprint data submission, modern slavery statement currency, and conflict minerals declaration completion. The weighting of this dimension increases for suppliers in high-risk categories or geographies.

### Supplier Visibility Into Their Own Scorecard

Suppliers access their scorecard under My Performance > Scorecard. The view shows:

- Current score per dimension (0–100) with traffic light indicator
- Overall weighted scorecard score
- Trend chart (12-month rolling history per dimension)
- Benchmark bar: anonymous comparison showing where the supplier sits relative to peers in the same category

This transparency removes the need for the supplier to ask for performance data before business reviews and gives them the information needed to self-manage improvement.

### Anonymous Benchmark Comparison

The benchmark shows each supplier where they stand relative to their peer group (suppliers in the same spend category and tier) without revealing other suppliers' identities:

- "Your OTD is 94.2% — the category average is 91.5% and the top quartile is 97.8%"

Suppliers performing below the category average on any dimension are prompted to review the relevant guidance article or contact their account manager.

### Remediation Plan Submission

When a scorecard dimension falls below the configured minimum threshold, a remediation flag is set and the supplier is notified. The supplier submits a Remediation Plan:

1. Acknowledge the underperformance.
2. Root cause analysis (brief).
3. Corrective actions with owners and target dates.
4. Leading indicator to demonstrate improvement.

Your procurement team reviews and either accepts the plan or requests revision. Accepted plans are monitored at the defined checkpoint frequency (e.g., monthly) until the KPI recovers above threshold or the remediation period ends.

### Historical Trend View

The scorecard history view shows each dimension's performance for every calendar quarter going back to when the supplier was first active. This longitudinal view is essential for identifying patterns — for example, a supplier whose OTD degrades every Q4 due to holiday period capacity constraints — and for evidence-based category strategy decisions.

### Escalation Workflow for Scorecard Disputes

If a supplier disputes a scorecard metric — for example, claiming that a late delivery was caused by your organisation's specification change rather than a supplier delay — they raise a Scorecard Dispute:

1. Navigate to My Performance > Disputes > New Dispute.
2. Select the dimension and the specific transaction(s) in dispute.
3. Provide a written explanation and attach supporting evidence.
4. Submit.

A procurement manager reviews the dispute. If upheld, the affected transactions are excluded from the KPI calculation and the score is recalculated. If rejected, the original score stands and the rejection reason is recorded. All dispute outcomes are visible to the supplier.

### Supplier Self-Assessment Submissions

In addition to the system-calculated scorecard, suppliers complete an annual self-assessment questionnaire covering their internal capability, strategic direction, investment plans, and risks. This qualitative data supplements the quantitative scorecard and informs segmentation decisions.

Self-assessments are submitted under My Performance > Annual Self-Assessment and are reviewed during the annual strategic supplier review.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['supplier-portal', 'scorecard', 'performance', 'kpi', 'reporting'],
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
