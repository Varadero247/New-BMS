import type { KBArticle } from '../types';

export const moduleDeepDives4Articles: KBArticle[] = [
  // ─── CRM MODULE (KB-DD4-001 to KB-DD4-008) ───────────────────────────────
  {
    id: 'KB-DD4-001',
    title: 'CRM Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['crm', 'sales', 'customer-management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# CRM Day-to-Day User Guide

## Overview

The CRM module supports your daily sales and customer management activities. This guide covers the most common tasks a sales team member performs each working day.

## Starting Your Day

Open the CRM dashboard to see your personalised activity feed. The **Today's Tasks** panel shows all follow-ups and calls due today. Overdue items are highlighted in red. The team activity feed shows what your colleagues logged yesterday.

## Logging Activities

Every customer interaction should be logged to maintain a complete contact history:

- **Call**: Navigate to the contact or opportunity, select **Log Activity > Call**, enter the duration, summary, and outcome.
- **Email**: Emails synced from your connected mailbox appear automatically. Manual emails can be added via **Log Activity > Email**.
- **Meeting**: Use **Log Activity > Meeting**, record attendees, agenda, and notes.
- **Task**: Create follow-up tasks with a due date and reminder notification.

## Updating Contact Records

Keep contact records current after every interaction. Update job title, phone number, or email address directly on the contact card. If a contact has moved to a new company, use **Transfer Contact** to reassign them to the new account without losing history.

## Progressing Opportunities

Open your opportunity list filtered to **My Open Opportunities**. Drag cards on the Kanban pipeline view to advance the stage, or open the record and change the **Stage** field. Update the expected close date and probability whenever the situation changes.

## Quick Lead Entry

Use the **+ New Lead** button from any screen. Enter the minimum required fields: name, company, source, and assigned rep. The lead enters the pipeline at the **Lead** stage for qualification.

## End-of-Day Review

Before finishing, check your activity log is complete and set follow-up tasks for tomorrow. A consistent daily habit ensures accurate pipeline data and better forecasting.
`,
  },
  {
    id: 'KB-DD4-002',
    title: 'Contact & Account Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['crm', 'sales', 'customer-management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Contact & Account Management

## Account Types

The CRM supports four account types: **Prospect** (not yet a customer), **Customer** (active business relationship), **Partner** (referral or reseller partner), and **Competitor** (tracked for competitive intelligence). Set the account type when creating the account record.

## Contact Hierarchy

Accounts are the top-level record. Contacts belong to an account. One account can have multiple contacts. Assign a **Primary Contact** for each account — this person receives automated account communications.

## Required Contact Fields

When creating a contact, the following fields are mandatory: full name, email address, phone number, job title, and department. Optional enrichment fields include LinkedIn URL, direct report, and preferred communication method.

## Account Segmentation

Accounts are segmented across four dimensions:

- **Industry**: Manufacturing, Healthcare, Finance, Retail, Technology, etc.
- **Size**: SMB (1–50), Mid-Market (51–500), Enterprise (500+)
- **Region**: EMEA, APAC, Americas, or custom territory
- **Tier**: Tier 1 (strategic), Tier 2 (growth), Tier 3 (transactional)

Use segmentation filters in list views to target outreach campaigns or route accounts to the correct sales team.

## Duplicate Detection

The CRM automatically flags potential duplicates based on email domain and company name similarity. When creating a new account or contact, review the suggested duplicates panel before saving. Use **Merge Records** to combine two duplicates, preserving all activity history from both records.

## Account Health Score

Each account receives a health score (0–100) based on: recency of contact, number of open opportunities, support ticket volume, and contract renewal date proximity. Accounts with a health score below 40 appear in the **At-Risk Accounts** dashboard widget.

## Activity Timeline

Every email, call, meeting, task, and opportunity change is recorded on the account timeline in chronological order. Use the **Filter by Type** control to view only specific activity types.
`,
  },
  {
    id: 'KB-DD4-003',
    title: 'Sales Pipeline & Opportunity Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['crm', 'sales', 'customer-management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Sales Pipeline & Opportunity Management

## Pipeline Stages

The default pipeline moves opportunities through six stages:

1. **Lead** — Initial interest, not yet qualified
2. **Qualified** — BANT criteria confirmed (Budget, Authority, Need, Timeline)
3. **Proposal** — Proposal or quote submitted
4. **Negotiation** — Commercial terms being agreed
5. **Closed Won** — Deal signed
6. **Closed Lost** — Deal not won

Administrators can add or rename stages to match your sales process in **Settings > CRM > Pipeline Stages**.

## Probability Weighting

Each stage carries a default win probability: Lead (10%), Qualified (25%), Proposal (50%), Negotiation (75%), Closed Won (100%), Closed Lost (0%). Reps can override the probability on individual opportunities to reflect specific circumstances.

## Opportunity Fields

Complete these key fields for every opportunity:

- **Value**: Expected contract value (annual or one-time)
- **Expected Close Date**: Realistic date of decision
- **Products / Services**: Line items from your product catalogue
- **Competitors**: Track competing vendors being evaluated
- **Next Step**: The specific agreed next action

## Pipeline Views

Switch between **Kanban board** (visual drag-and-drop by stage) and **List view** (sortable table with all fields) using the toggle at the top of the pipeline screen. The Kanban board shows total pipeline value per stage at the top of each column.

## Sales Forecasting

The **Forecast** tab shows weighted pipeline value (opportunity value × probability) by week, month, and quarter. Compare forecast against your sales quota. Adjust individual opportunity probabilities to improve forecast accuracy.

## Converting a Lead

When a lead meets your qualification criteria, click **Convert Lead**. This promotes the lead to an opportunity at the Qualified stage and optionally creates a new account and contact record simultaneously.

## Win/Loss Analysis

After closing an opportunity, record the **Win/Loss Reason** and any competitor involved. These fields power the win/loss analysis report used in sales retrospectives.
`,
  },
  {
    id: 'KB-DD4-004',
    title: 'Activity Tracking & Follow-up Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['crm', 'sales', 'customer-management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Activity Tracking & Follow-up Management

## Activity Types

The CRM supports five activity types that can be logged against any contact or opportunity:

- **Call**: Inbound or outbound telephone conversation
- **Email**: Manual or synced email correspondence
- **Meeting**: In-person or video meeting
- **Task**: Internal to-do item related to the account or deal
- **Demo**: Product demonstration (tracked separately for conversion analysis)

## Logging Activities

From any contact, account, or opportunity record, click **Log Activity** and select the type. Required fields vary by type — calls require outcome (positive, neutral, negative) and duration; meetings require attendees. All activity types support a free-text notes field.

## Scheduling Follow-ups

When logging an activity, enable **Create Follow-up** to immediately schedule the next action. Set the follow-up type, due date, and time. You will receive a reminder notification 15 minutes before (configurable in user preferences).

## Managing Overdue Items

The **My Activities** view highlights overdue tasks in red. Overdue items older than 48 hours trigger an automated alert to your sales manager. To clear an overdue item, either complete it or reschedule it with a valid reason.

## Activity Statistics

Your personal activity dashboard shows daily and weekly counts: calls made, emails sent, meetings held, and demos delivered. Compare your activity rates against team averages and your personal targets.

## Team Activity Leaderboard

Sales managers can view the **Team Leaderboard** showing activity volumes per rep. This encourages consistent prospecting activity across the team. Leaderboard data refreshes in real time.

## Calendar Sync

Connect your Google Workspace or Microsoft 365 calendar in **Settings > Integrations > Calendar**. Meetings created in your calendar appear automatically in CRM against the matching contact. Existing CRM meetings are pushed to your calendar as events.
`,
  },
  {
    id: 'KB-DD4-005',
    title: 'CRM Reporting & Analytics',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['crm', 'sales', 'customer-management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# CRM Reporting & Analytics

## Key CRM Metrics

Monitor these metrics to evaluate sales performance:

- **Pipeline Value**: Total value of all open opportunities
- **Win Rate**: Percentage of qualified opportunities that close as won
- **Average Deal Size**: Mean value of closed-won opportunities
- **Sales Cycle Length**: Average days from lead creation to close
- **Lead Conversion Rate**: Percentage of leads that become qualified opportunities

## Built-in Reports

Access the following pre-built reports from **CRM > Reports**:

- **Pipeline Forecast**: Weighted pipeline value by rep, team, and period
- **Activity Report**: Calls, emails, and meetings by rep for any date range
- **Win/Loss Analysis**: Breakdown of closed opportunities by reason and competitor
- **Lead Source Analysis**: Which sources generate the most and highest-value leads

## Sales Dashboard

The CRM dashboard is fully configurable. Add or remove widgets including: pipeline funnel chart, quota attainment gauge, top opportunities list, recent wins ticker, and activity heatmap. Click **Customise Dashboard** to arrange widgets by drag-and-drop.

## Territory & Team Comparison

Sales managers use the **Territory Performance** report to compare win rates, average deal size, and activity levels across regions or teams. Identify which territories are underperforming relative to their account size and potential.

## Customer Acquisition Cost & Lifetime Value

The **CLV / CAC Analysis** report integrates CRM data with Finance module actuals to calculate customer acquisition cost (CAC) and estimated customer lifetime value (CLV). CLV:CAC ratio above 3:1 indicates healthy unit economics.

## Export & Distribution

Any CRM report can be exported to CSV or PDF. Use **Scheduled Reports** to automatically email a report to a distribution list daily, weekly, or monthly. This ensures sales managers receive up-to-date pipeline data without manual effort.
`,
  },
  {
    id: 'KB-DD4-006',
    title: 'Email Integration & Communications',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['crm', 'sales', 'customer-management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Email Integration & Communications

## Connecting Your Email

Navigate to **Settings > Integrations > Email** to connect your corporate email account. Both Google Workspace (Gmail) and Microsoft 365 (Outlook) are supported via OAuth. Once connected, emails sent to or received from known CRM contacts are automatically linked to the correct contact and account record.

## Email Templates

Create reusable email templates for common sales communications: initial outreach, meeting confirmation, proposal follow-up, and win/loss acknowledgement. Templates support merge fields that auto-populate with contact name, company, and rep name. Access templates in **CRM > Email Templates**.

## Email Tracking

When sending emails from within the CRM, tracking pixels and link tracking are automatically added. You receive an in-app notification when the recipient opens the email or clicks a link. Open and click data appears on the activity record.

## Bulk Email

Use **Contacts > Bulk Email** to send a personalised email to a filtered list of contacts. Select a template, apply a contact filter (e.g., industry = Healthcare, stage = Proposal), preview the merge output, then send. Bulk email respects unsubscribe preferences automatically.

## Email Sequence Automation

Configure multi-step email sequences for new leads: Day 1 introduction email, Day 3 value proposition email, Day 7 case study email, Day 14 follow-up call task. Sequences pause automatically if the contact replies. Configure sequences in **CRM > Sequences**.

## Unsubscribe Management

The CRM maintains an unsubscribe list in compliance with GDPR and CAN-SPAM regulations. Contacts who click unsubscribe are immediately flagged as **Email Opt-Out** and excluded from all future bulk emails and sequences. The opt-out flag is visible on the contact record.

## Email Audit Trail

Every email sent through the CRM or synced from connected mailboxes is permanently recorded on the contact timeline. This provides a complete and auditable communication history for any customer relationship.
`,
  },
  {
    id: 'KB-DD4-007',
    title: 'CRM Administrator Configuration Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['crm', 'sales', 'customer-management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# CRM Administrator Configuration Guide

## Pipeline Configuration

Go to **Settings > CRM > Pipeline** to manage pipeline stages. Add, rename, reorder, or archive stages. Set the default win probability for each stage. Enable or disable the **Closed Lost Reason** mandatory field to enforce capture of loss reasons.

## Activity Type Management

Add or remove activity types in **Settings > CRM > Activity Types**. Each type can be configured with required fields, outcome options, and whether it counts toward the daily activity target.

## Custom Fields

Extend the standard data model with organisation-specific fields. Navigate to **Settings > CRM > Custom Fields** and add fields to Contacts, Accounts, or Opportunities. Field types supported: text, number, date, dropdown, multi-select, and checkbox. Custom fields appear in list views and can be used in filters and reports.

## Role Configuration

Three built-in CRM roles are available:

- **Sales Rep**: Can create and edit own contacts, accounts, and opportunities. Read access to team records.
- **Sales Manager**: Full access to all records within their team. Can run team reports and reassign records.
- **CRM Admin**: Full system access including settings, custom fields, and integrations.

## Territory Management

Define territories in **Settings > CRM > Territories**. Territories can be geography-based (by country or region) or industry-based. Assign accounts and reps to territories. Auto-assignment rules can route new leads to the correct territory based on country or company size.

## Integration Settings

Connect CRM to other IMS modules:

- **Marketing**: Leads created in Marketing flow automatically into CRM.
- **Finance**: Closed-won opportunities trigger quote and invoicing workflows in Finance.
- **Customer Portal**: Account data is shared with the Customer Portal for self-service access.

## Notification Rules

Configure automated notifications in **Settings > CRM > Notifications**: deal stage change alerts, inactivity alerts (no activity on an opportunity for N days), upcoming close date reminders, and win celebration notifications to the sales team channel.
`,
  },
  {
    id: 'KB-DD4-008',
    title: 'CRM Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['crm', 'sales', 'customer-management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# CRM Best Practices

## Data Quality

Reliable CRM data drives better decisions. Establish a monthly data quality review: run the **Duplicate Report**, merge duplicates, and update stale records. Enrich key accounts with missing segmentation data (industry, tier, size). Appoint a CRM data steward to own data quality as a defined responsibility.

## Lead Management SLA

Define and enforce a lead response SLA: all new inbound leads must receive a personalised outreach within 24 business hours. Configure an alert to notify the sales manager if any lead has not been contacted within the SLA window. Fast follow-up dramatically improves lead conversion rates.

## Pipeline Hygiene

Run a weekly pipeline review meeting. Every opportunity must have an updated close date, a recent activity logged, and a clear next step. Opportunities with no activity in 30 days are flagged as **Stale** and reviewed for progression or closure.

## Opportunity Qualification

Apply a consistent qualification framework to every opportunity before moving it to the Proposal stage. The **BANT** framework (Budget, Authority, Need, Timeline) or **MEDDIC** (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion) ensures your pipeline reflects genuine opportunities.

## Sales Forecasting Accuracy

Accuracy improves when reps maintain current close dates and realistic probability estimates. Train reps to update probabilities based on factual signals (verbal commitment, procurement involvement) rather than hope. Review forecast accuracy retrospectively each quarter.

## CRM Adoption

Adoption requires active management. Ensure all team members complete CRM onboarding training. Make CRM the single source of truth: reinforce that opportunities not in the CRM do not exist in forecasts or commission calculations. Sales managers should coach from CRM data in every one-to-one meeting.

## Customer Segmentation for Targeted Outreach

Segment your customer base by tier, industry, and renewal date to drive targeted retention and upsell campaigns. High-value Tier 1 accounts should have quarterly business reviews (QBRs) scheduled in the CRM and tracked as recurring milestones.
`,
  },

  // ─── FIELD SERVICE MODULE (KB-DD4-009 to KB-DD4-016) ─────────────────────
  {
    id: 'KB-DD4-009',
    title: 'Field Service Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['field-service', 'work-orders', 'technicians'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Field Service Day-to-Day User Guide

## Overview

The Field Service module manages the complete lifecycle of field work orders, from job creation through technician dispatch, on-site execution, and customer sign-off. This guide covers daily tasks for technicians and dispatchers.

## Technician Daily Workflow

Start the day by opening the mobile app and reviewing your **Job Queue**. Jobs are listed in recommended visit order based on route optimisation. Each job card shows: customer name, site address, job type, priority, and the SLA response deadline.

To start a job, tap **Start Job** on arrival. The system records your arrival time against the SLA clock. Work through the job checklist, record time and materials used, and capture any required photographic evidence.

## Using the Mobile App

The field service mobile app works online and offline. In areas with poor connectivity, all data is cached locally and synchronised when signal is restored. Key mobile functions: view job details, access asset history, complete checklists, capture photos, record parts used, and collect customer signature.

## Dispatcher View

Dispatchers use the **Scheduling Board** — a visual timeline showing all technicians and their assigned jobs across the day. Switch to **Map View** to see technician locations and job sites overlaid on a map. The **Available Technicians** panel shows who has capacity to take additional jobs.

## Job Queue Management

Jobs are colour-coded by priority: red (emergency), amber (high), green (standard). The SLA countdown timer turns amber at 75% elapsed and red when breached. Dispatchers can reassign jobs by dragging them from one technician's row to another on the scheduling board.

## Customer Communication

Send automated customer notifications from the dispatch board: job confirmation, technician en-route notification (with estimated arrival time), and job completion confirmation. Notifications are sent by SMS or email based on the customer's preference recorded on their account.
`,
  },
  {
    id: 'KB-DD4-010',
    title: 'Work Order Creation & Dispatch',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['field-service', 'work-orders', 'technicians'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Work Order Creation & Dispatch

## Work Order Types

The Field Service module supports five work order types:

- **Installation**: New equipment or system installation at a customer site
- **Preventive Maintenance (PM)**: Scheduled maintenance based on time or usage intervals
- **Repair / Corrective Maintenance (CM)**: Reactive repair of failed or faulty equipment
- **Inspection**: Compliance or quality inspection with documented findings
- **Emergency**: Urgent work required within a contracted emergency response time

## Creating a Work Order

Navigate to **Field Service > Work Orders > New**. Complete the required fields:

- **Customer & Site**: Select from the customer account and site location records
- **Asset**: Link the work order to the specific asset being serviced
- **Work Order Type**: Select from the five types above
- **Description**: Clear description of the fault or work to be performed
- **Priority**: Emergency, High, Standard, or Low
- **Required Skills**: Certifications or skills the assigned technician must hold

## Skill-Based Routing

When you save the work order, the system queries available technicians whose skill profile matches the required skills. A ranked list of suitable technicians is displayed, ordered by proximity to the job site and current workload. Select a technician and click **Dispatch**.

## Notification to Technician

Upon dispatch, the assigned technician receives an immediate push notification on their mobile app with full job details. The notification includes: customer contact, site address, asset details, job description, and any relevant previous service history.

## Estimated Arrival Window

The system calculates an estimated arrival window based on the technician's current location, current job completion estimate, and travel time to the new site. This window is included in the automated customer notification sent at time of dispatch.

## Work Order Statuses

Work orders progress through: **New → Dispatched → En Route → In Progress → Completed → Invoiced → Closed**. Each status change is timestamped and visible to both dispatchers and customers via the customer portal.
`,
  },
  {
    id: 'KB-DD4-011',
    title: 'Technician Scheduling & Route Optimisation',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['field-service', 'work-orders', 'technicians'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Technician Scheduling & Route Optimisation

## Scheduling Methods

The Field Service module supports three scheduling approaches:

- **Manual**: Dispatcher assigns each job to a technician using the drag-and-drop scheduling board
- **Assisted**: The system recommends the best-fit technician based on skills, availability, and proximity; dispatcher confirms
- **Automatic**: Jobs are assigned automatically as they are created, with no dispatcher intervention required

## Technician Availability

Each technician has a defined working calendar: shift hours, days off, approved leave, and training days. The scheduling board only shows technicians as available during their working hours. Leave approved in the HR module automatically blocks availability in Field Service.

## Route Optimisation

For automatic and assisted scheduling, the route optimisation engine calculates the most efficient visit sequence for each technician's day, minimising total travel distance while respecting SLA response windows. The optimised route is displayed on the map view and synced to the technician's mobile app.

## Real-Time GPS Tracking

When a technician marks **En Route** on their mobile app, their GPS position is tracked in real time and displayed on the dispatcher map. This allows dispatchers to monitor progress, provide accurate ETA updates to customers, and identify technicians who are closest to emergency call-outs.

## Handling Schedule Changes

Customer rescheduling is handled through the work order record: change the scheduled date and time, then click **Notify Technician**. For emergency job insertion, use **Insert Job** on the scheduling board — the system recommends the best technician to receive the job with the least disruption to existing commitments.

## Technician Utilisation Report

The **Utilisation Report** breaks technician time into: productive time (on-site), travel time, administrative time, and idle time. Target productive utilisation above 65%. Use the report to identify technicians with consistently high travel ratios — a signal to review territory boundaries or depot locations.
`,
  },
  {
    id: 'KB-DD4-012',
    title: 'Job Site Documentation & Evidence Collection',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['field-service', 'work-orders', 'technicians'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Job Site Documentation & Evidence Collection

## Why Evidence Collection Matters

Complete job site documentation protects both the service organisation and the customer. Evidence demonstrates that work was performed to the required standard, supports warranty claims, satisfies regulatory inspection requirements, and provides a reference for future service visits.

## Capturing Job Evidence

The mobile app supports photo, video, and form-based evidence. To capture a photo, tap **Add Photo** from within the active job. Annotate the photo with markers to highlight specific faults or areas of work. Videos up to 60 seconds can be recorded for complex fault demonstrations.

## Pre-Job and Post-Job Photos

Certain work order types require mandatory pre-job and post-job photos. This is configured per job type in **Settings > Field Service > Evidence Requirements**. The technician cannot mark the job as complete until all mandatory evidence has been submitted.

## Completing Job Checklists

Each work order type has an associated checklist. Checklists contain: safety pre-checks (PPE, isolation verification, permit to work reference), task steps with pass/fail fields, quality inspection checks, and regulatory compliance confirmations. Checklists must be completed in sequence.

## Recording Asset Readings

For assets that require condition monitoring, the technician records readings during each visit: meter readings, temperature, pressure, vibration level. Readings are stored against the asset record and displayed as a trend chart in the asset history view.

## Evidence Upload and Sync

Photos, videos, and completed checklists upload automatically to the cloud when the device has connectivity. In offline mode, evidence is stored locally and syncs when signal is restored. A sync indicator shows the upload status on each evidence item.

## Permanent Attachment to Records

All evidence collected during a job is permanently attached to the work order record and also linked to the associated asset record. Evidence cannot be deleted once a job is closed. This provides an immutable audit trail for warranty, compliance, and dispute resolution purposes.
`,
  },
  {
    id: 'KB-DD4-013',
    title: 'Parts & Inventory for Field Service',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['field-service', 'work-orders', 'technicians'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Parts & Inventory for Field Service

## Technician Van Stock

Each technician maintains a mobile inventory — their van stock. Van stock is configured in **Field Service > Van Stock** per technician. Set minimum and maximum stock levels for each part number. The system generates a replenishment alert when van stock falls below the minimum level.

## Issuing Parts to a Job

When a technician uses a part on a job, they record it in the mobile app by scanning the part barcode or selecting from their van stock list. Parts are deducted from the technician's van stock inventory in real time. The parts record on the work order includes part number, description, quantity, and unit cost.

## Parts Request for Off-Van Items

If a required part is not in van stock, the technician submits a **Parts Request** through the mobile app. The request goes to the warehouse team for pick and dispatch. Alternatively, a return visit is scheduled to allow time for the part to arrive.

## Back Order Management

When a required part is out of stock at both the van and warehouse level, the part is placed on back order. The work order is placed in **Awaiting Parts** status. The system automatically updates the work order and notifies the dispatcher and customer when the part arrives and the job can be rescheduled.

## Parts Consumption Report

The **Parts Consumption Report** shows the most frequently used parts by work order type, by asset type, and by technician. This report is used to set appropriate van stock levels and negotiate bulk purchasing with suppliers.

## Integration with Inventory Module

Parts recorded against work orders flow directly into the Inventory module, updating stock levels, cost of goods used, and replenishment triggers. There is no need for manual stock adjustment in Inventory — the Field Service integration handles this automatically.

## Emergency Supplier Orders

For critical breakdowns where a part is required urgently and is not in stock, dispatchers can raise an **Emergency Purchase Order** from within the work order record. This triggers an expedited order to the approved supplier list defined in the Inventory module.
`,
  },
  {
    id: 'KB-DD4-014',
    title: 'Customer Sign-off & Job Completion',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['field-service', 'work-orders', 'technicians'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Customer Sign-off & Job Completion

## Completing a Job

Before marking a job as complete, the technician must: confirm all checklist items are marked, record total time on site, record all parts used, and submit all required evidence photos. The mobile app validates these requirements and prevents completion if any are missing.

## Customer Satisfaction Capture

At the point of completion, the customer is invited to rate the service. The technician presents their device for the customer to select a star rating (1–5) and optionally leave a free-text comment. Satisfaction scores feed directly into the technician performance scorecard and the customer account record.

## Digital Signature

The customer signs directly on the technician's mobile device screen to confirm the work was completed to their satisfaction. The signature is timestamped with GPS co-ordinates and permanently attached to the work order. This provides legal proof of acceptance for warranty and billing purposes.

## Job Completion Report

Upon job close, the system automatically generates a job completion report in PDF format. The report includes: work order reference, customer details, asset details, work performed, parts used, photos taken, checklist outcomes, time on site, and the customer's signature. The report is emailed to the customer automatically.

## Follow-up Work Orders

If the technician identifies additional work required during the visit, they raise a **Follow-up Work Order** from within the current job. The follow-up is pre-populated with the customer and asset details. The customer is informed at sign-off that a follow-up visit will be required.

## Invoice Trigger

Job completion automatically sends a completion record to the Finance module, triggering invoice generation based on the agreed service contract rate, time recorded, and parts used. No manual data re-entry is required between Field Service and Finance.

## Warranty Recording

Parts fitted during the job can be assigned a warranty period (parts warranty and labour warranty separately). Warranty end dates are recorded against the asset and trigger a warranty expiry notification when they approach.
`,
  },
  {
    id: 'KB-DD4-015',
    title: 'Field Service Reporting & KPIs',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['field-service', 'work-orders', 'technicians'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Field Service Reporting & KPIs

## Key Field Service KPIs

Track these metrics to measure field service performance:

- **First-Time Fix Rate (FTFR)**: Percentage of jobs completed without a return visit. Target: above 85%.
- **SLA Compliance Rate**: Percentage of jobs responded to and resolved within contracted SLA times. Target: above 95%.
- **Customer Satisfaction Score (CSAT)**: Average star rating from customer sign-off. Target: above 4.2/5.
- **Technician Utilisation Rate**: Productive on-site time as a percentage of total working time. Target: above 65%.
- **Average Job Duration**: Mean time from job start to job completion, tracked by work order type.

## SLA Breach Report

The **SLA Breach Report** lists every job that exceeded its contracted response or resolution time. For each breach, the report shows: breach duration, work order type, assigned technician, and the reason code selected at close. Use this report to identify systemic causes of SLA failure.

## Technician Performance Scorecard

Each technician has a monthly scorecard showing: jobs completed, first-time fix rate, average CSAT score, SLA compliance rate, utilisation rate, and rework rate. Managers use the scorecard in monthly one-to-one performance conversations.

## Revenue Per Technician

The **Revenue Report** shows billable revenue generated per technician per period. Combine with utilisation data to identify technicians with high utilisation but low revenue — a signal to review job mix or billing rates.

## Parts Consumption and Cost per Job Type

The **Cost Analysis Report** breaks down average parts cost and labour cost per work order type. This data supports pricing reviews and identifies work types that are not profitable at current contract rates.

## Work Order Status Ageing Report

The **Ageing Report** shows open work orders grouped by how long they have been open: under 7 days, 7–14 days, 14–30 days, over 30 days. Long-aged open work orders indicate scheduling, parts, or approval bottlenecks that require management attention.
`,
  },
  {
    id: 'KB-DD4-016',
    title: 'Field Service Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['field-service', 'work-orders', 'technicians'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Field Service Best Practices

## SLA Definition

Define SLA tiers clearly for each customer contract: Emergency (response within 2 hours, resolution within 4 hours), High (response within 4 hours, resolution within 8 hours), Standard (response within next business day, resolution within 3 business days). Configure these in **Settings > Field Service > SLA Tiers** and link them to customer contracts.

## Skills Matrix Management

Maintain an up-to-date skills matrix for every technician. Record certifications with expiry dates. Configure automatic alerts when a certification is within 60 days of expiry. This ensures skill-based routing always assigns appropriately qualified technicians and prevents compliance failures.

## Preventive vs Reactive Balance

Target a ratio of 70% preventive maintenance to 30% corrective maintenance (reactive). A high reactive proportion indicates inadequate PM programmes or poor asset reliability. Use the **Work Order Type Analysis** report to track your PM:CM ratio monthly and adjust PM frequencies where reactive work is highest.

## First-Time Fix Rate Improvement

FTFR is improved by two factors: accurate fault diagnosis before dispatch (so the right parts are brought) and adequate van stock for common parts. Review FTFR by fault type to identify patterns, then adjust van stock lists and technician training accordingly.

## Proactive Customer Communication

Customers are most frustrated by uncertainty. Configure automated notifications at every status transition: job confirmed, technician en route (with ETA), technician arrived, job completed. Proactive communication reduces inbound customer enquiries and improves CSAT scores significantly.

## Continuous Feedback Loop

Review the customer satisfaction comments weekly in the management dashboard. Share positive feedback with technicians — recognition drives engagement. Address negative feedback within 24 hours with a manager call to the customer. Track satisfaction trends by technician and by job type to target improvement actions.

## Mobile App Training

All technicians must be proficient in the mobile app before going live. Conduct structured training sessions covering: accepting and starting jobs, completing checklists, capturing evidence, recording parts, and obtaining customer signature. Competency should be assessed before solo deployment.
`,
  },

  // ─── PAYROLL MODULE (KB-DD4-017 to KB-DD4-024) ───────────────────────────
  {
    id: 'KB-DD4-017',
    title: 'Payroll Processing User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['payroll', 'compensation', 'hr'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Payroll Processing User Guide

## Overview

The Payroll module automates the calculation and payment of employee compensation. It supports multiple pay cycles, multi-jurisdiction tax calculations, and integrates directly with the HR and Finance modules to eliminate manual data re-entry.

## Payroll Workflow

Every payroll run follows a five-step workflow:

1. **Preparation**: Confirm all HR changes (new starters, leavers, salary changes) are recorded and approved. Verify approved leave and submitted expense claims are in the system.
2. **Calculation**: Trigger the payroll calculation engine. The engine processes gross pay, tax, social security, pension contributions, and all deductions to produce net pay for every employee.
3. **Review**: The payroll manager reviews the payroll register. A variance report highlights employees whose net pay differs by more than a configurable threshold from the previous period.
4. **Approval**: The payroll manager submits the payroll for approval. The finance director (or delegated approver) reviews and approves electronically.
5. **Payment**: Once approved, the system generates a bank transfer file in the required format for your banking platform. Upload the file to initiate payment.

## Pay Cycles

The system supports weekly, fortnightly, and monthly pay cycles within the same organisation. Different employee groups can be assigned to different pay cycles. Each cycle runs as an independent payroll with its own approval and payment workflow.

## Payroll Register

The payroll register shows every employee processed in the run: employee name, pay period, gross pay, itemised deductions, net pay, and bank account. Download the register as a CSV or PDF for record-keeping. The register is retained permanently for audit purposes.

## Payslip Distribution

After payment is approved, payslips are automatically generated and distributed. Employees access their payslips through the self-service portal or receive them by email, depending on their configured preference.
`,
  },
  {
    id: 'KB-DD4-018',
    title: 'Employee Pay Setup & Configuration',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['payroll', 'compensation', 'hr'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Employee Pay Setup & Configuration

## Pay Components

Each employee's pay is built from configurable components. Common components include:

- **Base Salary**: Fixed annual salary divided by pay periods
- **Hourly Rate**: For hourly employees — rate × hours worked
- **Overtime Rate**: Hourly rate multiplier for overtime hours (e.g., 1.5x or 2x)
- **Allowances**: Car allowance, meal allowance, shift premium — fixed or variable amounts
- **Bonus**: Discretionary or formulaic bonus payments
- **Commission**: Percentage of sales value, calculated from CRM data

## Pay Scales and Grades

Configure pay grade structures in **Payroll > Settings > Pay Grades**. Each grade has a minimum, midpoint, and maximum salary band. Assign employees to a grade. The payroll calculation validates that the employee's salary falls within their grade band and flags exceptions.

## Benefit Deductions

Recurring deductions are configured as benefit deduction components:

- **Pension**: Employee contribution as a percentage of pensionable pay
- **Health Insurance**: Fixed monthly premium deducted pre-tax or post-tax as applicable
- **Loan Repayments**: Fixed monthly repayment amount with a total loan balance tracker
- **Salary Sacrifice**: Pre-tax deductions for cycle-to-work, childcare vouchers, etc.

## Per-Employee Configuration

Each employee's pay configuration is accessible in **HR > Employee Record > Payroll** tab. Fields include: pay frequency, pay group, bank account details, tax code, pension enrolment, and active deductions. Changes made here take effect in the next payroll calculation.

## International Employees

For employees in different countries, assign the correct jurisdiction in the employee payroll configuration. The tax engine applies the appropriate country and state/province tax rates automatically. Currency is set at the legal employer level — all employees under a legal employer are paid in that entity's currency.
`,
  },
  {
    id: 'KB-DD4-019',
    title: 'Tax Calculations & Compliance',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['payroll', 'compensation', 'hr'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Tax Calculations & Compliance

## Tax Engine Capabilities

The IMS tax engine performs multi-jurisdiction payroll tax calculations including:

- **Income Tax / PAYE**: Progressive tax band calculations with personal allowances
- **National Insurance / Social Security**: Employee and employer contribution calculations
- **State / Provincial Tax**: Sub-national tax for applicable jurisdictions (US states, Canadian provinces, Australian states)
- **Payroll Tax**: Employer-side payroll taxes levied in some jurisdictions

## Tax Code Management

Each employee is assigned a tax code (UK) or W-4 withholding instructions (US) or tax file number declaration (AU). These are stored on the employee payroll record. When a tax code changes — due to a new declaration from the employee or a notification from the tax authority — update it on the employee record before the next payroll run.

## Year-to-Date Tracking

The tax engine maintains cumulative year-to-date (YTD) totals for every employee: gross earnings, taxable pay, income tax withheld, national insurance contributions, and pension contributions. YTD data is used to calculate the correct tax for each pay period under cumulative tax methods.

## Tax Year-End Processing

At the end of each tax year, the system generates the required tax certificates for every employee: P60 equivalents (UK), W-2s (US), PAYG Payment Summaries (AU). Navigate to **Payroll > Year End** to initiate the process. Review the output before distribution.

## Filing Preparation

For jurisdictions requiring employer payroll returns, the system exports data in the required format: RTI Full Payment Submission (UK), 941/W-3 (US), Single Touch Payroll (AU). Consult your payroll administrator or tax adviser to confirm filing requirements for each jurisdiction.

## Tax Engine Updates

Tax rates, thresholds, and rules are updated in the system when legislative changes are announced. Update notifications are published in **Settings > Payroll > Tax Engine Updates**. Review and apply updates before the first affected payroll run.

## Employee Self-Service Tax Declarations

Employees submit tax declaration forms through the self-service portal. Submitted declarations flow to the payroll team for review and application to the employee record. This eliminates paper-based processes and provides a digital audit trail.
`,
  },
  {
    id: 'KB-DD4-020',
    title: 'Leave & Allowances in Payroll',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['payroll', 'compensation', 'hr'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Leave & Allowances in Payroll

## Leave Types and Pay

The payroll module processes multiple leave types with different pay treatments:

- **Paid Annual Leave**: Full pay — no impact on gross pay calculation
- **Unpaid Leave**: Gross pay reduced by the unpaid days (daily rate × unpaid days)
- **Sick Leave**: Configured as full pay for a defined period, then statutory sick pay rate
- **Maternity / Paternity Leave**: Statutory pay rates applied automatically based on eligibility criteria
- **Study Leave**: Configurable — full pay, half pay, or unpaid depending on policy

## HR-Payroll Integration

Leave approved in the HR module flows automatically to the payroll calculation for the relevant pay period. No manual data transfer is required. The payroll calculation picks up approved leave from the HR module when the calculation is triggered. Ensure all leave is approved in HR before triggering the payroll calculation.

## Statutory Pay Calculations

Statutory Sick Pay (SSP) and Statutory Maternity Pay (SMP) are calculated automatically when an employee enters a qualifying leave period. The tax engine applies the current statutory rates and waiting day rules for the relevant jurisdiction. Statutory pay amounts appear as a separate line on the payslip.

## Expense Reimbursement

Employee expense claims approved in the expense management system are included in the relevant payroll run as reimbursement payments. Reimbursements are non-taxable and appear on the payslip as a separate line item.

## Overtime Calculation

Overtime is calculated based on the employee's standard working schedule. Hours recorded in excess of contracted hours are multiplied by the applicable overtime rate. Configure overtime rates in **Payroll > Settings > Overtime Rules**: standard overtime (1x–1.5x), weekend premium, bank holiday premium, and double time.

## Allowances

Recurring allowances — car, meal, shift premium, on-call — are configured as fixed or variable components on the employee's pay record. Variable allowances (e.g., shift premiums) are calculated based on the shift patterns recorded in the HR scheduling module for the pay period.
`,
  },
  {
    id: 'KB-DD4-021',
    title: 'Payroll Run Process Step by Step',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['payroll', 'compensation', 'hr'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Payroll Run Process Step by Step

## Pre-Payroll Checklist

Before triggering the payroll calculation, complete these preparation steps:

- Confirm all new starter records are created and pay configuration is complete in HR
- Confirm all leaver records have a leaving date and final pay instructions
- Verify all salary change requests have been approved and effective dates confirmed
- Check that all leave for the pay period has been approved in the HR module
- Confirm all expense claims for the period have been submitted and approved
- Communicate the payroll cut-off date to employees and managers at least one week in advance

## Running the Payroll Calculation

Navigate to **Payroll > Payroll Runs > New Run**. Select the pay group and pay period, then click **Calculate**. The calculation engine processes all active employees in the selected pay group. Processing time varies by headcount — large organisations may take several minutes.

## Reviewing Payroll Exceptions

After calculation, the **Exceptions Report** flags employees with unusual results: gross pay above or below a configurable threshold compared to the prior period, zero net pay, or negative net pay (deductions exceeding gross). Investigate each exception before approving.

## Gross-to-Net Reconciliation

The **Payroll Summary** shows total gross pay, total deductions by type, and total net pay. Reconcile these totals against your approved headcount and the budget for the period. Significant variances should be explained before approval.

## Payroll Approval

Once exceptions are resolved, click **Submit for Approval**. The payroll enters the approval queue. The designated approver (payroll manager or finance director) reviews the summary and either approves or returns it for correction with comments.

## Payment File Generation

Upon approval, navigate to **Payroll > Payment > Generate File**. Select your bank's file format (BACS, ACH, EFT, or SEPA credit transfer). Download the file and upload it to your banking platform to initiate payment.

## Post-Payroll Tasks

After payment is confirmed: upload the pension contribution file to your pension provider's portal, post the payroll journal to the Finance module (this happens automatically if the integration is enabled), and confirm payslips have been distributed to employees.
`,
  },
  {
    id: 'KB-DD4-022',
    title: 'Payroll Compliance & Reporting',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['payroll', 'compensation', 'hr'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Payroll Compliance & Reporting

## Employer Reporting Obligations

Payroll compliance requires timely reporting to tax authorities. Key obligations by jurisdiction:

- **UK**: Real Time Information (RTI) Full Payment Submission (FPS) must be filed on or before each payment date.
- **US**: Form 941 quarterly employer return; annual W-2 and W-3 filing.
- **Australia**: Single Touch Payroll (STP) Phase 2 reporting each pay event.
- **Other jurisdictions**: Consult local requirements — the system supports custom export formats.

## Standard Payroll Reports

Access all payroll reports from **Payroll > Reports**:

- **Payroll Register**: Full detail of every employee payment — gross, deductions, net
- **Cost by Department / Cost Centre**: Payroll cost allocation for management accounting
- **Variance Report**: Period-over-period comparison highlighting changes in individual pay
- **Headcount Report**: Active employee count by location, department, and employment type

## Year-End Reporting

The year-end process generates annual payroll summaries required for employee tax returns and employer statutory submissions. Initiate year-end from **Payroll > Year End**. The process produces: employee tax certificates, employer filing data, and a year-end reconciliation report.

## Audit Trail

Every change made to payroll configuration or a payroll run is recorded in the immutable audit trail: who made the change, what was changed, the old and new values, and the timestamp. The audit trail is accessible to payroll administrators and auditors under **Payroll > Audit Trail**.

## Data Retention

Payroll records — payslips, payroll registers, tax certificates, and audit trails — must be retained for a minimum of 7 years in most jurisdictions. The IMS system retains payroll data indefinitely by default. Configure archiving policies in **Settings > Data Retention**.

## GDPR and Data Protection

Payroll data is sensitive personal data under GDPR. Access is restricted to authorised payroll and HR staff only. The system enforces role-based access control — employees can only view their own payslips. All payroll data is encrypted at rest and in transit.
`,
  },
  {
    id: 'KB-DD4-023',
    title: 'Payroll Administrator Configuration Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['payroll', 'compensation', 'hr'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Payroll Administrator Configuration Guide

## Setting Up Payroll Entities

Navigate to **Settings > Payroll > Legal Employers** to create payroll entities. Each legal employer represents a legal entity registered to employ staff. Configure: company registration number, registered address, employer tax reference, and default currency. Each legal employer can have one or more pay groups.

## Pay Frequencies and Pay Groups

Create pay groups in **Settings > Payroll > Pay Groups**. A pay group defines: legal employer, pay frequency (weekly/fortnightly/monthly), pay day, and the payroll calendar (run dates and payment dates for the year). Assign employees to a pay group in their HR record.

## Jurisdiction Configuration

For each jurisdiction where employees are paid, configure: country and state/province, applicable tax tables (these are pre-loaded and updated by the system), social security rates, and any jurisdiction-specific statutory pay rules. Navigate to **Settings > Payroll > Jurisdictions**.

## Pension Scheme Configuration

Set up pension schemes in **Settings > Payroll > Pension Schemes**. For each scheme, configure: scheme name, provider, employee contribution rate or range, employer contribution rate, pensionable pay definition (qualifying earnings, basic pay, or total pay), and auto-enrolment eligibility thresholds.

## Bank Account Setup

Register the company bank accounts used for payroll payment in **Settings > Payroll > Bank Accounts**. For each account, enter: account name, sort code and account number (UK) or routing and account number (US), bank name, and the file format required by your bank.

## Access Control

Define payroll access roles in **Settings > Roles > Payroll**: Payroll Administrator (full access), Payroll Processor (run payroll, no settings), Payroll Approver (approve only), Finance Viewer (read-only access to cost reports). Apply roles to user accounts via **Settings > Users**.

## Integration Settings

Enable integrations in **Settings > Payroll > Integrations**: HR module (employee data, leave, schedules), Finance module (journal posting of payroll costs), Expense Management (expense reimbursement), and Pension Provider API (automated contribution uploads).
`,
  },
  {
    id: 'KB-DD4-024',
    title: 'Payroll Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['payroll', 'compensation', 'hr'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Payroll Best Practices

## Payroll Data Quality

Accurate payroll starts with accurate employee data. Before every payroll run, reconcile the active headcount in the Payroll module against the HR module headcount. Any discrepancy — starter not set up, leaver not terminated, tax code not updated — must be resolved before the calculation is triggered.

## Segregation of Duties

Implement clear segregation of duties: the person who inputs payroll changes should not be the same person who approves the payroll run. This control prevents fraudulent payments and errors going undetected. Document your segregation of duties in your payroll controls policy.

## Payroll Deadlines

Publish a payroll calendar at the start of each year showing all cut-off dates and payment dates. Communicate cut-off dates clearly to HR, managers, and employees. Changes received after the cut-off are processed in the following payroll run, not the current one. Consistent enforcement of deadlines prevents last-minute errors.

## Parallel Runs During Migration

When migrating from a legacy payroll system, run both systems in parallel for at least two payroll periods. Reconcile the output from both systems employee by employee. Only decommission the legacy system after two clean parallel runs with no material variances.

## Payroll Error Handling

Payroll errors discovered after payment require an off-cycle correction run. Navigate to **Payroll > Off-Cycle Runs** to process corrections for individual employees. Document the error, the correction, and the approver in the payroll audit trail. Notify affected employees promptly.

## Employee Self-Service

Empower employees to access their own payroll information through the self-service portal: current and historical payslips, P60/tax certificates, YTD pay summary, and bank account updates. Increasing self-service access significantly reduces the volume of payroll enquiries to the HR and payroll team.

## Payroll Continuity Planning

Document a payroll continuity plan for scenarios where the primary payroll processor is unavailable. Identify a trained backup processor. Test the backup arrangement at least annually to ensure business continuity for this critical process.
`,
  },

  // ─── WORKFLOWS MODULE (KB-DD4-025 to KB-DD4-032) ─────────────────────────
  {
    id: 'KB-DD4-025',
    title: 'Workflow Automation Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['workflows', 'automation', 'bpm'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Workflow Automation Day-to-Day User Guide

## Overview

The Workflows module automates business processes across all IMS modules. As a regular user, your main interaction is responding to workflow tasks in your inbox and monitoring the progress of workflows you have initiated.

## Your Workflow Inbox

Navigate to **Workflows > My Inbox** to see all workflow tasks assigned to you. Tasks are listed with the workflow name, the item requiring action, the step name, the deadline, and the time remaining. Tasks approaching their deadline are highlighted in amber; overdue tasks are highlighted in red.

## Approving and Rejecting Items

Click on any inbox task to open the workflow item. Review the details, then click **Approve** or **Reject**. On rejection, a mandatory comments field captures your reason — this is sent to the initiator and recorded in the workflow audit trail. Some workflows offer additional options such as **Request Information** or **Return to Sender**.

## Workflow Dashboard

The **Workflow Dashboard** provides an overview of your workflow activity: pending approvals in your inbox, tasks you have assigned to others that are awaiting action, workflows you have initiated that are in progress, and recent workflow completions. Use this view to monitor items you are waiting on.

## Tracking Workflow Progress

Open any workflow instance from **Workflows > All Workflows > Search**. The workflow timeline shows every step: completed steps with the approver name and timestamp, the current active step, and pending future steps. Click any completed step to read the approver's comments.

## Delegating Tasks

If you will be absent, configure a delegation in **Workflows > My Settings > Delegation**. Enter the delegatee's name and the delegation period (start and end date). All inbox tasks are automatically reassigned to your delegatee during the delegation period. You receive a notification when the delegation expires.

## Reassigning Stuck Tasks

If a task in your workflow is stuck (the assigned approver is unavailable and no delegation is set), managers and workflow administrators can reassign the task using **Workflows > Reassign Task**. Select the stuck task and choose the new assignee.
`,
  },
  {
    id: 'KB-DD4-026',
    title: 'Creating Workflow Automations',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['workflows', 'automation', 'bpm'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Creating Workflow Automations

## Workflow Builder Interface

Access the workflow builder in **Workflows > Builder > New Workflow**. The builder uses a visual canvas with three sections: **Trigger** (what starts the workflow), **Conditions** (whether the workflow should proceed), and **Actions** (what happens at each step).

## Trigger Types

Select the appropriate trigger for your workflow:

- **Record Created**: Workflow starts when a new record is created in a selected module (e.g., new incident report)
- **Record Updated**: Workflow starts when a specific field on a record changes (e.g., status changes to 'Pending Approval')
- **Form Submitted**: Workflow starts when a user submits a nominated form
- **Scheduled**: Workflow runs at a configured time — daily, weekly, monthly, or a custom cron expression
- **Manual**: A user explicitly starts the workflow by clicking a button on a record

## Condition Logic

Add conditions to ensure the workflow only runs when appropriate. Use AND/OR logic to combine multiple conditions. Condition operators include: equals, does not equal, is greater than, is less than, contains, does not contain, is empty, and is not empty. Test conditions using the **Preview** mode before activating.

## Action Types

Add actions to each workflow step:

- **Approval Step**: Assign to a user, role, or dynamic approver (e.g., the record owner's manager)
- **Send Notification**: Email or in-app notification with a configurable template
- **Create Record**: Automatically create a new record in any IMS module
- **Update Field**: Set a field value on the triggering record or a related record
- **Assign Task**: Create a task assigned to a user or role
- **Call Webhook**: Send data to an external system via HTTP POST

## Saving and Activating

Save the workflow as a draft to test it. Use **Test Workflow** to simulate the trigger and walk through each step. Once satisfied, click **Activate**. Active workflows run automatically. Deactivate a workflow at any time — existing in-progress instances continue to completion.

## Workflow Versioning

When you edit an active workflow, a new version is created. In-progress instances continue on the version they started. New instances use the latest active version. View version history in the workflow record.
`,
  },
  {
    id: 'KB-DD4-027',
    title: 'Workflow Triggers & Conditions',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['workflows', 'automation', 'bpm'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Workflow Triggers & Conditions

## Record-Based Triggers

Record-based triggers fire in response to changes in IMS module data:

- **On Create**: Fires when a new record is created in the specified module. Use this to automatically start an approval workflow whenever a new purchase request is submitted.
- **On Update — Specific Field**: Fires only when a designated field changes value. For example: start a review workflow only when the 'Status' field changes to 'Ready for Review', not on every record update.
- **On Status Change**: A variant of on-update, optimised for status field transitions. Configure from-status and to-status pairs.
- **On Record Deletion**: Fires when a record is deleted — useful for audit or notification workflows.

## Form Submission Triggers

Form submission triggers fire when a user completes and submits a configured form. Form workflows are common for: change requests, leave applications, new supplier requests, and IT service desk tickets. The submitted form data is available as variables throughout the workflow.

## Scheduled Triggers

Scheduled triggers run the workflow at a defined time without any user action. Configuration options:

- **Daily**: Specify the time of day
- **Weekly**: Specify the day of week and time
- **Monthly**: Specify the day of month and time
- **Custom cron**: For advanced schedules (e.g., every weekday at 08:00)

Scheduled workflows are commonly used for: overdue item reminders, periodic compliance checks, and report generation.

## Webhook Triggers

Webhook triggers allow external systems to start a workflow in IMS. Each webhook trigger has a unique URL and optional secret token for authentication. When the external system sends an HTTP POST to the URL, the workflow starts with the POST body available as input data.

## Condition Configuration

Conditions filter which records should proceed through the workflow. A workflow with no conditions runs for every triggered event. Add conditions to restrict: run only for high-priority records, run only during business hours, run only if the record belongs to a specific department.

## Debugging Conditions

Use **Test Mode** to simulate a trigger with sample data and observe which conditions pass or fail. The condition evaluator shows the result of each condition expression, making it straightforward to diagnose why a workflow did or did not start for a specific record.
`,
  },
  {
    id: 'KB-DD4-028',
    title: 'Approval Workflows',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['workflows', 'automation', 'bpm'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Approval Workflows

## Multi-Level Approval

Approval workflows can include multiple approval steps in sequence (each level must approve before the next is notified) or in parallel (all approvers are notified simultaneously and all must approve, or a majority is sufficient). Configure the approval structure in the workflow builder by adding multiple approval action steps.

## Approver Types

Each approval step supports flexible approver assignment:

- **Specific User**: A named individual — suitable for fixed roles such as CFO or Quality Manager
- **Role-Based**: All members of a specified system role — notification goes to the role group
- **Dynamic — Manager**: The approver is determined at run time as the submitter's line manager (pulled from HR module)
- **Round-Robin**: Approvals are distributed evenly across a pool of approvers to balance workload

## Approval Deadline and Escalation

Set a deadline for each approval step: if not actioned within N hours or days, the workflow automatically escalates. Escalation can: notify the approver's manager, reassign to an alternative approver, or both. Configure escalation chains of up to three levels.

## Approval Comments

Configure approval comments as optional or mandatory. When rejection comments are mandatory, the approver must enter a reason before the rejection is recorded. This ensures rejections are documented and the initiator understands what changes are required for resubmission.

## Conditional Approval Paths

Use conditions to route requests to different approval chains based on field values. Examples: purchase requests over £10,000 require CFO approval in addition to the department head; leave requests of more than 10 days require HR Director approval; change requests with a HIGH or CRITICAL risk rating require additional Safety Manager approval.

## Bulk Approval

Approvers with multiple pending approvals of the same type can use **Bulk Approve** from their inbox. Select multiple items, review the list, then approve all in one action. Bulk approval is only available when no comments are required.

## Approval During Absence

Encourage approvers to configure delegation before periods of absence. Alternatively, workflow administrators can reassign pending approvals using **Workflows > Admin > Reassign**. Pending approvals should never be allowed to expire without action.
`,
  },
  {
    id: 'KB-DD4-029',
    title: 'Notification & Escalation Rules',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['workflows', 'automation', 'bpm'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Notification & Escalation Rules

## Notification Channels

Workflow notifications are delivered through three channels:

- **Email**: Sent to the recipient's registered email address with a link to the action required
- **In-App**: Appears in the notification bell in the IMS navigation bar; persists until dismissed
- **SMS**: Optional — configure in **Settings > Notifications > SMS**; requires a connected SMS gateway

Recipients choose their preferred channel in **My Profile > Notification Preferences**. Administrators can override preferences for critical compliance notifications.

## Notification Templates

Each workflow notification uses a template. Templates are configured in **Workflows > Notification Templates**. Templates support merge fields wrapped in double curly braces: the recipient's name, the record title, the due date, and a direct link to the action. Maintain separate templates for: new task assigned, reminder, escalation, approval outcome (approved/rejected), and workflow completed.

## Escalation Chains

Configure escalation chains in the approval step settings. An escalation chain defines: the time threshold after which escalation triggers, the first escalation recipient, the time until a second escalation, and the second escalation recipient. A maximum of three escalation levels is supported per step.

## SLA Tracking

Workflow SLA tracking monitors the time each workflow step spends in progress. The SLA dashboard shows: average time per step, steps currently within SLA, and steps that have breached SLA. Use SLA data to identify bottlenecks and set realistic deadline targets.

## Notification Digest

Users who receive high volumes of notifications can configure a **Daily Digest** in their notification preferences. The digest consolidates all notifications from the previous 24 hours into a single email sent at a configured time each morning. Real-time notifications for critical approvals can be excluded from the digest and delivered immediately.

## Notification Audit Log

Every notification sent by the workflow engine is recorded in the notification audit log. Access it at **Workflows > Logs > Notifications**. The log shows: recipient, channel, notification type, workflow name, timestamp, and delivery status. Use the log to investigate cases where a user claims they did not receive a notification.
`,
  },
  {
    id: 'KB-DD4-030',
    title: 'Cross-Module Workflow Integration',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['workflows', 'automation', 'bpm'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Cross-Module Workflow Integration

## Overview

One of the most powerful capabilities of the IMS Workflows module is its ability to span multiple modules in a single automated process. Cross-module workflows eliminate manual handoffs between teams and ensure that consequential actions in one module automatically trigger the correct response in another.

## H&S Incident to CAPA

When a significant incident is recorded in the Health & Safety module, a workflow automatically creates a linked CAPA (Corrective and Preventive Action) in the CAPA register and assigns it to the H&S Manager. The CAPA carries forward the incident reference, description, and severity level. This ensures no significant incident is closed without a corrective action being initiated.

## Purchase Order Approval (Finance & Inventory)

When a purchase requisition is submitted in the Inventory module above a configurable value threshold, the workflow routes it through Finance for budget approval before a purchase order is raised. The Finance approver sees the requested items, supplier, and estimated cost. Upon approval, the purchase order is automatically created in the Inventory module.

## Employee Onboarding (HR, Training, Documents)

New employee onboarding triggers a multi-step workflow: HR creates the employee record, Training assigns mandatory induction courses, Document Control distributes required policy sign-off forms, and IT receives a system access request. All steps run in parallel where possible, reducing time to full productivity.

## Customer Complaint Routing (Quality & CRM)

A complaint received in the Customer Portal triggers a workflow that creates a complaint record in the Quality module and links it to the customer account in CRM. The Quality team investigates and records resolution steps. The workflow automatically notifies the CRM account manager when the complaint is resolved so they can follow up with the customer.

## Contract Approval (Legal, Finance, Management)

New contract submissions route through Legal for terms review, Finance for commercial sign-off, and Management for final authorisation — in sequence. Each step has a defined SLA. Upon final approval, the contract is stored in the Document Control module and the CRM opportunity is updated to Closed Won.

## Configuring Cross-Module Data Fields

When building a cross-module workflow, use the **Module Data** picker in action configurations to select fields from the triggering module and pass them as inputs to actions in a different module. All IMS modules expose their key fields through the workflow data model.
`,
  },
  {
    id: 'KB-DD4-031',
    title: 'Workflow Reporting & Audit Trail',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['workflows', 'automation', 'bpm'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Workflow Reporting & Audit Trail

## Workflow Audit Trail

Every event in a workflow instance is recorded in the immutable audit trail. The audit trail captures: the action type (step started, approved, rejected, escalated, completed), the actor (user who performed the action), the timestamp, the step name, any comments entered, and the workflow version in use. The audit trail cannot be edited or deleted.

Access the full audit trail for any workflow instance by opening the instance record and navigating to the **Audit** tab. Export the audit trail as a PDF for external audit or compliance submissions.

## Workflow Performance Report

Navigate to **Workflows > Reports > Performance** to see the workflow performance dashboard. Key metrics:

- Average completion time by workflow type
- Step-level breakdown: where most time is spent
- Workflows currently in progress by stage
- Workflows completed this period vs previous period

Use this data to identify bottleneck steps and set SLA targets informed by actual performance.

## SLA Compliance Report

The **SLA Compliance Report** shows the percentage of workflows completed within the configured target time, broken down by workflow type and by period. Trends in SLA performance indicate whether process improvements are having the intended effect.

## Approval Statistics

The **Approval Report** provides statistics for each approval step: total approvals, approval rate (approved vs rejected), average time to decision per approver, and rejection reason frequency. Use this data to identify approvers who are a bottleneck, and to understand common rejection reasons that could be addressed with better guidance at submission.

## Workflow Errors Report

The **Errors Report** lists workflow instances where an action failed: a webhook that returned an error, a record creation that failed due to missing required fields, or a notification that could not be delivered. For each error, the report shows the error message and the step where the failure occurred.

## Exporting Workflow Data

Any workflow report can be exported as a CSV or PDF. Schedule automated exports via **Workflows > Reports > Scheduled Exports** to deliver reports to a distribution list on a regular cadence for management review.
`,
  },
  {
    id: 'KB-DD4-032',
    title: 'Workflow Automation Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['workflows', 'automation', 'bpm'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Workflow Automation Best Practices

## Start Simple

Begin with straightforward workflows: a single approval step with a clear trigger and one action. Resist the temptation to automate a complex 15-step process from the outset. Build confidence in the platform with simpler workflows first, then add complexity as you gain experience.

## Involve End Users in Design

The people who will use the workflow daily are the most important input to its design. Run a process mapping session with the team before building anything in the workflow builder. Understand every exception and edge case before configuring conditions. Workflows designed without end-user input often fail to handle real-world scenarios.

## Avoid Over-Automation

Not every process benefits from workflow automation. Workflows are most valuable where: the process is repetitive, the rules are clear and consistent, multiple handoffs are involved, and compliance documentation is required. For one-off or highly variable processes, a lightweight task or notification may be more appropriate than a structured workflow.

## Test Before Go-Live

Use the workflow **Test Mode** to simulate all key scenarios including: the standard happy path, a rejection and resubmission, an escalation, and any conditional branches. Involve end users in user acceptance testing before activating the workflow for production use.

## Maintain a Workflow Register

Keep a register of all active workflows: workflow name, purpose, trigger, owner, creation date, and last reviewed date. The register should be reviewed quarterly to identify workflows that are no longer needed, have fallen out of alignment with the current process, or could be consolidated.

## Governance and Change Management

Treat workflow configuration changes as system changes requiring a change management process: document the change, obtain approval from the process owner, test in a non-production environment where possible, and communicate the change to affected users before go-live.

## Monitor and Optimise

Review workflow performance data monthly. Identify steps with consistently high cycle times and investigate the cause. Common bottlenecks include: approvers who are difficult to reach, steps with unclear instructions, and conditions that route too many items to a single approver. Address bottlenecks with targeted process or configuration changes.
`,
  },

  // ─── PROJECT MANAGEMENT MODULE (KB-DD4-033 to KB-DD4-040) ────────────────
  {
    id: 'KB-DD4-033',
    title: 'Project Management Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['project-management', 'projects', 'planning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Project Management Day-to-Day User Guide

## Overview

The Project Management module supports the full project lifecycle: initiation, planning, execution, monitoring, and closure. This guide covers the daily activities of project managers and team members using the module.

## Starting Your Day

Open the **Project Dashboard** to review your portfolio at a glance. Each project shows its overall RAG status (Red/Amber/Green), the next milestone due date, budget health indicator, and count of open risks and issues. Click any project to drill into the detail.

## Checking Task Status

Navigate to your active project and open the **Task Board** or **Gantt View**. Review which tasks are due today and this week. Check that tasks marked as in-progress have recent updates. Any task with no update in the last 3 days is highlighted as potentially stale.

## Updating a Task

Click on any task to open the task detail panel. Update the fields: **Status** (Not Started / In Progress / Completed / Blocked), **% Complete**, **Actual Hours** logged today, and a progress **Note**. If the task is blocked, record the blocker in the note and raise an issue if the blocker will impact the schedule.

## Logging Project Issues and Risks

Open **Project > Issues** to log a new issue: describe the issue, assess its impact on timeline and budget, assign an owner, and set a target resolution date. For risks, use **Project > Risks** to record probability, impact, and planned mitigation. Both risks and issues are visible on the project dashboard.

## Generating a Status Report

Use **Project > Reports > Status Report** to auto-generate a project status report populated with current data: RAG status, milestone progress, budget vs actual, open risks and issues, and a narrative summary field for the PM to add context. Export as PDF for distribution to stakeholders.

## Team View

The **Team View** shows all tasks assigned to team members across the project. Use this view in team standup meetings to quickly see what everyone is working on and identify tasks that are overdue or blocked.
`,
  },
  {
    id: 'KB-DD4-034',
    title: 'Project Planning & Work Breakdown Structure',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['project-management', 'projects', 'planning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Project Planning & Work Breakdown Structure

## Creating a Project

Navigate to **Project Management > Projects > New Project**. Complete the project header: project name, description, project sponsor, project manager, planned start date, planned end date, and approved budget. Assign team members from the organisation's user directory.

## Work Breakdown Structure

The WBS is the hierarchical decomposition of the project deliverables into manageable components. Structure your WBS across four levels:

- **Phase**: Major project stage (e.g., Design, Build, Test, Deploy)
- **Work Package**: Significant deliverable within a phase
- **Task**: Individual unit of work, assignable to one person
- **Milestone**: A key event or decision point with zero duration

Build your WBS in the **Plan** tab using the indent/outdent controls to establish the hierarchy.

## Gantt Chart View

The Gantt chart displays your tasks as horizontal bars on a timeline. The chart automatically calculates dates based on task duration and dependencies. The **Critical Path** is highlighted in red — any delay to a critical path task directly delays the project end date.

## Task Dependencies

Link tasks to reflect their dependency relationships: **Finish-to-Start** (the most common — Task B cannot start until Task A finishes), **Start-to-Start** (both start at the same time), and **Finish-to-Finish** (both must finish at the same time). Add a lag or lead time in days to any dependency link.

## Setting the Baseline

Once the plan is agreed and approved, set the **Baseline** by clicking **Set Baseline** in the Plan tab. The baseline captures the original planned start, end, and duration for every task. As the project progresses, schedule variance is calculated by comparing actuals against the baseline.

## Project Templates

Save a completed project plan as a template in **Project Management > Templates**. When creating a new project of the same type, select the template to pre-populate the WBS, phase durations, and standard milestones, saving significant planning time.
`,
  },
  {
    id: 'KB-DD4-035',
    title: 'Resource Management & Allocation',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['project-management', 'projects', 'planning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Resource Management & Allocation

## Resource Types

The Project Management module supports four resource types:

- **People**: Named individuals from the IMS user directory, with an associated daily or hourly cost rate
- **Equipment**: Machinery, vehicles, or tools required for project tasks
- **Materials**: Consumable items with a unit cost
- **Cost**: Direct cost items that do not fit other categories (e.g., travel, licence fees)

## Resource Calendar

Each person resource has a working calendar defining available working days, public holidays, and any planned absence. Calendars are shared with the HR module — approved leave automatically updates resource availability. Set the standard working hours per day for each resource type.

## Resource Allocation

Assign resources to tasks from the task detail panel or the **Resource Plan** view. For each assignment, specify the effort (hours) or the percentage of the resource's working day. The system calculates the task duration based on effort, calendar availability, and dependencies.

## Capacity Planning

Before committing a resource to a task, check their availability in the **Resource Capacity** view. This shows daily and weekly capacity (hours available vs hours allocated) for each resource across the project timeline. A bar turning red indicates over-allocation.

## Over-Allocation Detection

When a resource is allocated beyond 100% of their available hours on any day, the system raises an over-allocation warning. The over-allocated days are highlighted on the resource capacity chart. Resolve over-allocations by adjusting task dates, redistributing work to another resource, or negotiating additional resource availability.

## Resource Levelling

Use **Plan > Level Resources** to automatically smooth resource peaks and troughs. The levelling algorithm adjusts task start dates within their float (spare time) to eliminate over-allocations without changing the project end date. Review the levelled plan before accepting — manual adjustments may be needed.

## Skills-Based Resource Matching

When adding a resource to a task, use the **Find Resource** search to filter available people by skill or certification. The system queries the skills matrix in the HR module to identify team members with the required competencies who have capacity during the task's planned dates.
`,
  },
  {
    id: 'KB-DD4-036',
    title: 'Project Tracking & Milestone Management',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['project-management', 'projects', 'planning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Project Tracking & Milestone Management

## Milestone Types

Milestones mark significant events in the project timeline with zero duration. Standard milestone types include:

- **Phase Gate**: Formal completion of a project phase with sign-off required before the next phase begins
- **Deliverable**: A completed output delivered to a stakeholder or customer
- **Decision Point**: A go/no-go decision or change of direction
- **External Dependency**: Arrival of a third-party deliverable or regulatory approval

## Milestone Status

Each milestone has a status: **Planned** (not yet due), **At Risk** (the milestone may be missed based on predecessor task progress), **Achieved** (completed on or before the planned date), or **Missed** (the planned date passed without completion). The system automatically sets milestones to 'At Risk' when predecessor tasks fall behind schedule.

## RAG Status Calculation

The project RAG status is calculated automatically based on configurable rules:

- **Green**: Schedule variance within ±10%, cost variance within ±5%, no high-priority open issues
- **Amber**: Schedule variance 10–20%, cost variance 5–15%, or one high-priority open issue
- **Red**: Schedule variance greater than 20%, cost variance greater than 15%, or a critical open issue

Project managers can override the calculated RAG status with a manual override and a mandatory explanation, which is recorded in the audit trail.

## Earned Value Management

The EVM dashboard calculates industry-standard performance indicators:

- **SPI (Schedule Performance Index)**: BCWP / BCWS. SPI below 1.0 = behind schedule.
- **CPI (Cost Performance Index)**: BCWP / ACWP. CPI below 1.0 = over budget.
- **EAC (Estimate at Completion)**: Projected total cost based on current CPI.

## Issue Tracking

Log project issues — problems currently affecting the project — in **Project > Issues**. Record the impact on schedule (number of days) and cost (additional budget required). Issues with a schedule impact greater than the project float automatically raise the project RAG status to Red.
`,
  },
  {
    id: 'KB-DD4-037',
    title: 'Risk & Issue Management in Projects',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['project-management', 'projects', 'planning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Risk & Issue Management in Projects

## Risks vs Issues

The distinction is important: a **risk** is a potential future event that may impact the project if it occurs; an **issue** is a problem that has already materialised and is actively affecting the project. Managing both separately ensures proactive risk mitigation and reactive issue resolution run in parallel.

## Project Risk Register

Open **Project > Risks > Add Risk** to log a new project risk. Required fields:

- **Description**: Clear statement of the risk event and its cause
- **Probability**: Likelihood of occurrence (Low / Medium / High / Very High)
- **Impact**: Consequence if the risk occurs (Low / Medium / High / Very High on schedule, cost, or quality)
- **Risk Score**: Probability × Impact — displayed as a colour-coded heat map position
- **Mitigation Plan**: Actions to reduce probability or impact
- **Risk Owner**: The team member responsible for monitoring and mitigating the risk
- **Contingency Plan**: What to do if the risk materialises despite mitigation

## Risk Heat Map

The **Risk Heat Map** displays all project risks plotted on a probability-by-impact matrix. Risks in the top-right quadrant (high probability, high impact) are the priority focus for the project team. Review the heat map in weekly team meetings.

## Project Issue Log

Issues are logged in **Project > Issues**. Each issue has: description, date identified, priority (Low / Medium / High / Critical), impact on schedule and budget, assigned owner, target resolution date, and resolution notes when closed.

## Escalation

Issues that cannot be resolved at the project team level must be escalated to the project sponsor. Issues with a schedule impact greater than 5% of remaining project duration, or a cost impact greater than the contingency budget, trigger an automatic escalation notification to the project sponsor.

## Enterprise Risk Register Linkage

Project risks that have implications beyond the project boundary can be linked to the enterprise risk register managed in the Risk module. This connection is made from the project risk record using **Link to Enterprise Risk**. This ensures enterprise-level risks are informed by project-level intelligence.

## Lessons Learned

At each major milestone and at project close, conduct a risk and issue retrospective. Record lessons in the **Lessons Learned Register** in the project record. Lessons are searchable across all completed projects to inform future project risk identification.
`,
  },
  {
    id: 'KB-DD4-038',
    title: 'Project Budget & Cost Tracking',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['project-management', 'projects', 'planning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Project Budget & Cost Tracking

## Budget Structure

Project budgets are structured by cost category:

- **Labour**: Cost of people time — calculated from resource hours × cost rates
- **Materials**: Purchased materials consumed in the project
- **Subcontractors**: External service providers engaged for specific deliverables
- **Expenses**: Travel, accommodation, training, and other incidental costs
- **Contingency**: Reserve for unplanned costs — typically 10–15% of the base budget

Allocate the approved budget across phases in **Project > Budget > Budget Plan**. This allows tracking of budget consumption by project phase.

## Recording Actual Costs

Actual costs flow into the project from three sources:

- **Timesheets**: Team members log hours against project tasks. Hours × resource cost rate = labour cost.
- **Expense Claims**: Approved expense claims submitted in the Expense Management module and tagged with the project code.
- **Supplier Invoices**: Invoices posted in the Finance module referencing the project code are automatically allocated.

## Budget vs Actual Variance

The **Budget Report** shows planned budget, committed costs (purchase orders raised but not invoiced), actual spend to date, and the remaining budget. Variance is shown as an absolute value and a percentage. A cost variance above 10% requires a formal review and explanation.

## Earned Value

The EVM analysis in **Project > Reports > Earned Value** shows Budgeted Cost of Work Performed (BCWP) vs Actual Cost of Work Performed (ACWP). The Cost Performance Index (CPI) indicates whether the project is achieving planned output per pound spent. A CPI consistently below 0.9 signals that the final cost will exceed the budget unless corrective action is taken.

## Change Control

All changes that increase the project budget require a formal change request. Log the change request in **Project > Change Requests**, capturing the reason, cost impact, and schedule impact. The change request is routed through the configured approval workflow before the budget is updated. This creates an auditable record of every budget change.

## Finance Module Integration

Project cost data is synchronised with the Finance module for management accounting. Finance can allocate project costs to the correct cost centres, enabling project profitability to be measured within the financial reporting framework.
`,
  },
  {
    id: 'KB-DD4-039',
    title: 'Project Reporting & Dashboard',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['project-management', 'projects', 'planning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Project Reporting & Dashboard

## Project Status Report

The **Status Report** is the primary communication tool between the project manager and stakeholders. Navigate to **Project > Reports > Status Report** to generate the report. It is auto-populated with: overall RAG status, key accomplishments this period, upcoming milestones, budget vs actual summary, open risks and issues, and a narrative commentary field for the PM to add context. Generate weekly or fortnightly depending on project pace.

## Portfolio Dashboard

The **Portfolio Dashboard** in **Project Management > Portfolio** shows all active projects in a single view. Each project is displayed as a card with: project name, RAG status (colour-coded), project manager, planned end date, schedule health indicator, and budget health indicator. Filter by project type, sponsor, or department.

## Milestone Achievement Report

The **Milestone Report** shows all milestones across the portfolio: planned date, actual date, variance in days, and status (Achieved / Missed / Planned / At Risk). The on-time milestone achievement rate is a key performance indicator for the project management function — target above 90%.

## Resource Utilisation Report

The **Resource Report** shows hours recorded per person, broken down by project and by period. Use this report to validate that resources are being used as planned and to identify team members who are consistently under-utilised or over-extended across multiple projects.

## Financial Project Report

The **Financial Report** shows budget vs actual and forecast to completion (EAC) for each project. Portfolio-level totals are shown at the bottom. Finance directors and PMO managers use this report for monthly portfolio financial reviews.

## Lessons Learned Register

The lessons learned register is searchable across all completed projects. Filter by project type, phase, lesson category (schedule, budget, risk, quality), and date. Before starting a new project of a similar type, review relevant lessons to avoid repeating past mistakes.

## Executive Summary

For leadership audiences, use **Project > Reports > Executive Summary** to generate a one-page project health overview: project purpose, RAG status, key milestone achieved, next milestone, budget status, and top risk. The executive summary is designed for a 2-minute management review.
`,
  },
  {
    id: 'KB-DD4-040',
    title: 'Project Management Best Practices',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['project-management', 'projects', 'planning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Project Management Best Practices

## Project Initiation

Never start a project without a clear business case and formal sponsor sign-off. Document the project purpose, expected benefits, success criteria, and key constraints before committing resources. A project charter — approved by the sponsor — provides the authority to proceed. Record the approved charter in the project record under **Documents**.

## Stakeholder Management

At project initiation, create a RACI matrix (Responsible, Accountable, Consulted, Informed) covering all project roles and decision types. Develop a communication plan: who needs what information, in what format, and at what frequency. Review the stakeholder map at each phase gate — stakeholders change as the project evolves.

## Change Control

Scope creep is the most common reason projects fail to deliver on time and budget. Implement a formal change control process from day one: all requests for scope changes must be submitted as change requests, assessed for timeline and budget impact, and approved by the sponsor before work begins. Document this process in the project plan.

## Meeting Cadence

Maintain a structured rhythm of project meetings: a weekly team standup (15 minutes, status and blockers only), a monthly steering committee (30–45 minutes, RAG status, milestone review, risk and issue escalations, sponsor decisions required). Separate these two rhythms — the steering committee should not be used for operational problem-solving.

## Risk Management as a Habit

Risk management must be a team habit, not a one-off activity at the start. Review the risk register in every weekly team meeting. Ask the team: are there any new risks? Have any risks materialised? Have mitigation actions been completed? A project team that actively manages risk will avoid most surprises.

## Quality Management

Define acceptance criteria for every deliverable before the work begins. The project sponsor and key stakeholders must agree what 'done' looks like for each output. Without clear acceptance criteria, deliverables are subject to subjective judgment at review, causing rework and delay.

## Lessons Learned

Conduct a retrospective at every significant milestone, not just at project close. Capture what went well, what did not go well, and what you would do differently. Record lessons in the IMS Lessons Learned Register immediately while the memory is fresh. Lessons reviewed before the next similar project begin to build genuine organisational learning.

## Project Closure

Formal project closure is often skipped under time pressure — do not skip it. A closure process ensures: formal acceptance is obtained from the sponsor, benefits realisation is handed over to the business owner, the team is formally released and recognised, and all project documentation is archived. A closed project in the system indicates to stakeholders that the work is done.
`,
  },
];
