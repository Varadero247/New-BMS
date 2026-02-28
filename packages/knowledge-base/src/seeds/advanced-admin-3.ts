import type { KBArticle } from '../types';

export const advancedAdmin3Articles: KBArticle[] = [
  {
    id: 'KB-AA3-001',
    title: 'Configuring Multi-Tenancy and Data Isolation',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'multi-tenancy', 'data-isolation', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring Multi-Tenancy and Data Isolation

## Isolation Models

IMS supports three levels of data isolation, each appropriate for different organisational structures.

**Organisation-level isolation** is the default. All sites share configuration, workflows, and reference data. Records created at any site are visible to users with the appropriate module role across the whole organisation. Use this model when your organisation operates as a single entity and cross-site visibility is the norm.

**Site-level isolation** restricts records so that users at Site A cannot see records belonging to Site B. Configuration (workflows, custom fields, notification rules) is still inherited from the organisation level but can be overridden per site. Use this model when sites operate independently, have separate legal entities, or have regulatory requirements prohibiting data sharing.

**Team-level isolation** is the most granular. Records are visible only to members of the team that created them. Use this for sensitive projects, joint ventures, or situations where intra-site confidentiality is required.

## Switching Isolation Models

Navigate to **Admin Console → Organisation Settings → Data Isolation**. Changing the isolation model affects all modules simultaneously. Before switching, review the impact summary shown in the confirmation dialog — it lists how many records will become hidden or newly visible after the change. Schedule this change during low-activity periods.

## Cross-Site Reporting Roles

To allow a regional manager to see aggregated data from multiple sites without seeing individual site records, assign the 'Cross-Site Analyst' role scoped to specific modules. This role sees rolled-up metrics in dashboards and reports but cannot open individual records from sites outside their scope.

## Module Configuration and Isolation

When isolation is set to site-level, each site administrator can override module-level settings (custom fields, SLA thresholds, reference number prefixes) without affecting other sites. Organisation-wide settings such as core workflow definitions and compliance calendars remain shared and editable only by organisation administrators.
`,
  },
  {
    id: 'KB-AA3-002',
    title: 'Advanced Role Design — Custom Permission Matrices',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'rbac', 'permissions', 'roles'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Advanced Role Design — Custom Permission Matrices

## Beyond the 39 Standard Roles

IMS ships with 39 predefined roles covering common job functions. When a user has a hybrid function — for example, a Safety Officer who also manages supplier relationships — you can create a custom role combining permissions from multiple modules.

Navigate to **Admin Console → Roles → New Custom Role**. Give the role a descriptive name and select the base permission level per module from the seven available levels: None, View, Comment, Edit, Approve, Manage, Admin.

## Permission Inheritance and the Most-Permissive-Wins Rule

When a user holds multiple roles, IMS applies the most permissive permission for each module. If Role A grants 'View' on the Audits module and Role B grants 'Edit' on the same module, the user effectively has 'Edit'. There is no way to restrict a permission granted by another role without removing that role entirely — plan role assignments accordingly.

## Designing Roles for External Contractors

Create a contractor-specific role with View-only access on relevant modules and no access to Admin or Finance modules. Set an expiry date on the role assignment (available in the user's Role Assignments panel) so access is automatically revoked at the end of the contract without manual intervention.

## Permission Groups

Permission groups bundle a set of role assignments together. Rather than assigning five roles individually to every new employee in a department, create a permission group for that department and assign users to the group. Changes to the group propagate automatically to all members.

## Testing Custom Roles with Role Preview

Before assigning a new custom role to real users, use **Admin Console → Roles → Role Preview**. Enter a role (or combination of roles) and the tool simulates the interface as that user would see it — showing which menu items, records, and actions would be available. This prevents accidentally granting excessive access.
`,
  },
  {
    id: 'KB-AA3-003',
    title: 'Configuring Advanced Approval Workflows',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'workflows', 'approvals', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring Advanced Approval Workflows

## Sequential vs Parallel Approval Chains

**Sequential chains** require each approver to act before the next receives the request. Use this when each stage builds on the previous decision (e.g. technical review, then legal review, then financial sign-off).

**Parallel chains** notify all approvers simultaneously. The record progresses once all approvers have responded. Use this when approvers are independent (e.g. three department heads each reviewing their own scope). Parallel chains are faster when approvers do not need to see each other's decisions first.

## Conditional Routing

Add conditions to route approvals dynamically. In the workflow editor, select a step and click **Add Condition**. Example: if the 'Risk Rating' field equals 'Critical', route to the Director role; otherwise route to the Site Manager role. Conditions can reference any field on the record, including custom fields, using simple comparison operators (equals, greater than, contains).

## Delegation Rules

Configure automatic delegation in **Admin Console → Workflows → Delegation Rules**. When an approver sets themselves as Out of Office, the system can route their pending approvals to a nominated delegate or to an escalation role. Set a maximum delegation depth of one to prevent chains of delegation creating unresolvable loops.

## Quorum Approval

For committee-style decisions, configure quorum approval: 'Require 2 of 3 approvers to agree'. If quorum is reached (e.g. two approve), the record advances even if the third has not responded. If a majority reject, the record is returned without waiting for the remainder.

## Time-Boxed Approvals

Set a response window per approval step (e.g. 48 business hours). If the approver does not respond within the window, the system can auto-escalate, auto-approve (for low-risk records), or auto-reject, depending on configuration. Document the chosen behaviour in your workflow policy so approvers understand the consequence of inaction.

## Testing Workflow Configurations

Use **Workflows → Test Mode** to submit test records through a workflow without affecting live data. Test records are flagged and excluded from reports and dashboards.
`,
  },
  {
    id: 'KB-AA3-004',
    title: 'Bulk User Management and Provisioning',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'users', 'bulk-operations', 'provisioning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Bulk User Management and Provisioning

## CSV Bulk User Import

Download the import template from **Admin Console → Users → Import → Download Template**. Required columns: 'firstName', 'lastName', 'email', 'role', 'site'. Optional columns: 'department', 'jobTitle', 'managerEmail', 'language'. Email addresses must be unique; duplicate emails cause the row to be skipped with an error. Upload the completed CSV and review the validation summary before confirming — the summary shows valid rows, error rows, and a preview of changes.

## Bulk Role Assignment with Group Templates

Create a group template in **Admin Console → Permission Groups → New Group**. Define the roles to be included, then apply the group to multiple users in one action via **Users → Select All → Actions → Assign Group**. Group templates are particularly useful at project start when a new team of users needs identical access.

## Bulk Deactivation

At project closure or end of academic year, select the relevant user set using filters (by department, site, or custom attribute) and choose **Actions → Deactivate**. Deactivated users lose access immediately but their records, audit trail entries, and assigned tasks remain intact. Deactivation is reversible.

## SCIM 2.0 Automated Provisioning

Enable SCIM in **Admin Console → Integrations → SCIM 2.0**. IMS generates a SCIM base URL and bearer token. Configure your identity provider (Azure AD, Okta, or similar) using these credentials. Once connected, users created or deactivated in your IdP are automatically provisioned or deprovisioned in IMS within minutes — no CSV import required.

## Reconciliation Against HRIS

Run the reconciliation report monthly via **Admin Console → Users → Reconciliation Report**. Upload an export from your HRIS and IMS compares email addresses. The report flags: users in HRIS but not IMS (not yet provisioned), users in IMS but not HRIS (potential orphaned accounts), and users in both with mismatched attributes.

## Quarterly Access Reviews

Schedule access reviews in **Admin Console → Compliance → Access Review Schedule**. Managers receive a task to confirm or revoke each direct report's access. Unreviewed accounts are automatically flagged after the review deadline.
`,
  },
  {
    id: 'KB-AA3-005',
    title: 'Configuring Custom Fields and Field Logic',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'custom-fields', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring Custom Fields and Field Logic

## Adding Custom Fields

Navigate to **Admin Console → Modules → [Module Name] → Custom Fields → Add Field**. Available field types:

- **Text** — single-line or multi-line free text
- **Number** — integer or decimal, with optional unit label
- **Date** — date picker with optional time component
- **Dropdown** — single selection from a defined list of options
- **Multi-select** — multiple selections from a defined list
- **Boolean** — yes/no toggle
- **File attachment** — one or more file uploads linked to the record

## Mandatory vs Optional Fields

Set a field as mandatory to prevent record submission without a value. Mandatory custom fields can be set as mandatory only on specific statuses (e.g. mandatory when closing a record but optional when drafting) using the 'Required on status' setting.

## Field Visibility Rules

Use visibility rules to show a field only when another field has a specific value. Example: show 'Chemical Name' only when 'Hazard Type' is set to 'Chemical'. Configure this under the field's **Visibility** tab using the condition builder. Multiple conditions can be combined with AND/OR logic.

## Validation Rules

Available validation options:

- **Regex pattern** — validate text fields against a regular expression (e.g. a specific reference format)
- **Min/max** — enforce numeric ranges or text length limits
- **Cross-field validation** — require that Field B is greater than Field A (e.g. end date must be after start date)

Validation errors are shown inline and prevent form submission.

## Custom Fields in Exports and Reports

In the export template editor (**Admin Console → Reporting → Export Templates**), custom fields appear in the available columns list alongside standard fields. Add them to export templates to include custom field values in CSV and XLSX exports. Custom fields are also available as filter criteria in the report builder.

## Impact on Existing Records

Adding a new field does not affect existing records — they will have a null value for the new field. Making an existing optional field mandatory does not retroactively invalidate existing records, but users editing those records will be required to fill in the field before saving.
`,
  },
  {
    id: 'KB-AA3-006',
    title: 'Advanced Notification Architecture',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'notifications', 'configuration', 'automation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Advanced Notification Architecture

## Building Complex Notification Rules

Navigate to **Admin Console → Notifications → Rules → New Rule**. Each rule has a trigger (an event: record created, field changed, SLA breached, etc.) and a set of conditions that must all be true for the notification to fire.

Example of a multi-condition rule: Trigger — 'Risk rating changed'. Conditions — 'New risk rating is High' AND 'Assignee last login is more than 7 days ago'. Recipient — 'Assignee's manager'. This notifies the manager only when an at-risk record is assigned to an inactive user.

Conditions support AND/OR grouping with nested logic for complex scenarios.

## Notification Templates with Dynamic Variables

Create reusable notification templates in **Admin Console → Notifications → Templates**. Templates support variable substitution using double-brace syntax: '{{record.title}}', '{{record.assignee.name}}', '{{record.dueDate}}', '{{organisation.name}}'. Variables are resolved at send time from the record that triggered the notification. Templates can include HTML formatting for email channels.

## Notification Channels

Per rule, configure one or more delivery channels:

- **In-app** — notification appears in the bell icon feed; always available
- **Email** — sent via your configured SMTP relay; supports HTML templates
- **Webhook** — HTTP POST to a Slack incoming webhook or Microsoft Teams connector URL; the payload includes the record title, URL, and selected field values

## Retry Logic and Dead-Letter Handling

Failed email and webhook deliveries are retried three times with exponential backoff (5 min, 20 min, 60 min). After three failures, the notification is moved to the dead-letter queue. Administrators can view and manually retry dead-letter items in **Admin Console → Notifications → Dead Letter Queue**.

## Auditing Notification Delivery

The notification delivery log (**Admin Console → Notifications → Delivery Log**) records every notification sent, the channel, the recipient, the delivery status, and the timestamp. Use this log to confirm that critical notifications were delivered and to investigate missed alerts.
`,
  },
  {
    id: 'KB-AA3-007',
    title: 'Configuring the Global Search Index',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'search', 'configuration', 'indexing'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring the Global Search Index

## Controlling Indexed Fields

Navigate to **Admin Console → Search → Index Configuration → [Module]**. Each module lists its available fields. Toggle fields on or off for indexing. Disable indexing for fields that are too granular to be useful in search (e.g. internal numeric IDs, raw JSON payloads) to reduce index size and improve performance.

## Search Ranking Weights

IMS uses a weighted ranking model. Default weights: title match (10), tag match (7), content match (3). Adjust these weights per module in **Admin Console → Search → Ranking Weights**. Increase the content weight for document-heavy modules where body text is more meaningful than the title.

## Excluding Sensitive Fields from the Index

Fields configured with field-level encryption (via **Custom Fields → Encryption → Enabled**) are automatically excluded from the search index — encrypted values cannot be tokenised meaningfully. If you later disable encryption on a field, trigger a manual re-index to make those values searchable.

## Manual Re-Index After Bulk Import

After a large bulk import, the search index may lag behind the database. Trigger a manual re-index from **Admin Console → Search → Maintenance → Re-index Now**. Select the affected modules to scope the operation. Re-indexing runs in the background; monitor progress in the System Health dashboard. Large re-index operations on millions of records may take several minutes.

## Search Analytics

Review search analytics in **Admin Console → Search → Analytics**. The 'Zero results' report shows queries that returned no hits. Investigate these queries — they indicate either missing content (create an article or record to address the gap) or indexing issues (a field that should be indexed but is not).

## Saved Search Shortcuts for Power Users

Administrators can create organisation-wide saved searches in **Admin Console → Search → Saved Searches**. These appear in the search dropdown for all users. Use saved searches to surface common queries: 'Open Critical Risks', 'Overdue Corrective Actions', 'Unreviewed Documents'.
`,
  },
  {
    id: 'KB-AA3-008',
    title: 'Configuring Data Export and Reporting Templates',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'reporting', 'export', 'templates'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring Data Export and Reporting Templates

## Creating Custom Export Templates

Navigate to **Admin Console → Reporting → Export Templates → New Template**. Select the source module and then choose fields from the available column list. Drag to reorder columns and set a custom header label for each. Save the template with a name visible to users when they trigger an export from that module.

## Parameterised Report Templates

Add runtime parameters to a report template so users can customise the output each time they run it. Common parameters: date range picker, site selector, status filter. Parameters appear as a form before the report generates. Users do not need to edit the template itself — they simply fill in the parameters and download. Define parameter defaults to cover the most common use case.

## Report Branding

Upload your organisation logo and set brand colours in **Admin Console → Organisation → Branding**. Enable 'Apply branding to reports' to add the logo to the PDF header, the organisation name and report title in a styled banner, and a footer with the page number and generation timestamp. Branding applies to all PDF exports.

## Scheduled Report Distribution

In a report template, click **Schedule → New Schedule**. Configure: frequency (daily, weekly, monthly, on a specific day), time of day, output format, and a distribution list of user email addresses. Scheduled reports run automatically and are emailed as attachments. The run log in **Admin Console → Reporting → Scheduled Reports → Log** records success and failure for each run.

## Management Pack Templates

A management pack template pulls data from multiple modules into a single PDF. Configure each section of the pack (e.g. Section 1: Open High Risks, Section 2: Overdue Actions, Section 3: Compliance Calendar for next 30 days) by adding module report blocks. Blocks are rendered sequentially. Add a cover page and an executive summary text block between data sections.

## Export Format Options

All export templates support: **CSV** (raw data, fastest), **XLSX** (formatted spreadsheet with column widths and header styling), **PDF** (branded report, suitable for distribution), **JSON** (machine-readable, for integration use). Select the default format per template; users can override at run time.
`,
  },
  {
    id: 'KB-AA3-009',
    title: 'API Key Management and Integration Security',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'api', 'security', 'integration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# API Key Management and Integration Security

## Creating Scoped API Keys

Navigate to **Admin Console → Integrations → API Keys → New Key**. Assign a descriptive name (e.g. 'HRIS Sync — Production'), select the permission scope (read-only, read-write, or specific modules), and optionally restrict to one or more IP CIDR ranges. Keys with IP restrictions are safer for server-to-server integrations where the calling IP is fixed.

IMS stores only a SHA-256 hash of the key — the raw value is shown only once at creation. Copy it immediately and store it in your secrets vault.

## API Key Rotation Strategy

Rotate API keys every 90 days. IMS supports zero-downtime rotation: create the new key before deactivating the old one, update the calling system to use the new key, then deactivate the old key. The overlap period (typically 24 hours) ensures no integration downtime during the cutover.

## Auditing API Key Usage

The API key usage log (**Admin Console → Integrations → API Keys → [Key Name] → Usage Log**) shows endpoint called, HTTP method, response code, and timestamp for every request made by that key. Use this to confirm expected usage patterns and detect anomalies such as unusual endpoint access or request spikes.

## Revoking Compromised Keys

If a key is suspected to be compromised, revoke it immediately via **Admin Console → Integrations → API Keys → [Key Name] → Revoke**. Revocation is instant. Then use the usage log to identify which endpoints were accessed and assess whether any sensitive data was exposed. Create a new key and update all integrations using the revoked key.

## OAuth 2.0 Client Credentials

For integrations that prefer OAuth 2.0, register a client in **Admin Console → Integrations → OAuth Clients → New Client**. Configure the grant type as 'Client Credentials'. The client ID and secret are used by the calling system to obtain a short-lived access token from 'POST /api/auth/token'. Tokens expire after one hour; the calling system should implement token refresh logic.

## Rate Limit Configuration per Key

Set per-key rate limits in **Admin Console → Integrations → API Keys → [Key Name] → Rate Limits**. Limits are enforced as requests per minute and requests per hour. Set tighter limits on read-heavy keys that could otherwise consume excessive database capacity.
`,
  },
  {
    id: 'KB-AA3-010',
    title: 'Configuring SLA and Escalation Rules',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'sla', 'escalation', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring SLA and Escalation Rules

## Setting SLA Timelines

Navigate to **Admin Console → SLA → Rules → New Rule**. Select the module (e.g. Incidents, Complaints), the record type or category, and the severity level. Set the response target (time to first acknowledgement) and the resolution target (time to close). Example: Critical Incident — 1-hour response, 4-hour resolution; Minor Complaint — 2-business-day response, 5-business-day resolution.

## Business Hours Configuration

SLA clocks can count elapsed calendar time or business time. Configure business hours in **Admin Console → SLA → Business Hours**. Define working hours per day (e.g. 08:00–18:00, Monday to Friday) and upload a public holiday calendar for the relevant jurisdictions. SLA clocks pause automatically outside business hours and on public holidays.

## SLA Pause Rules

Configure pause conditions in **Admin Console → SLA → Pause Rules**. Example: pause the SLA clock when the record status is 'Waiting for Customer Information'. The clock resumes automatically when the record status changes away from the pause-triggering value. Pause history is recorded in the record's SLA audit trail.

## Escalation Chains

For each SLA rule, define an escalation chain that activates at breach thresholds. Typical configuration:

- **50% of SLA elapsed** — notify the assignee as a reminder
- **80% of SLA elapsed** — notify the assignee and their line manager (at-risk alert)
- **100% of SLA elapsed** — notify the module owner and log as an SLA breach
- **110% of SLA elapsed** — notify the department director and create an automatic corrective action

## SLA Compliance Dashboard

The SLA dashboard (**Reports → SLA Performance**) shows breach rate by module, severity, and site. Configure the dashboard widgets to display the KPIs most relevant to your organisation. Filter by date range to generate monthly SLA compliance summaries.

## Reporting SLA Performance to Customers

Export the SLA compliance report as a PDF for inclusion in customer-facing service reports. The report shows response and resolution times against agreed targets, breach counts, and trend over time. Configure the export template in **Admin Console → Reporting → SLA Report Template**.
`,
  },
  {
    id: 'KB-AA3-011',
    title: 'Managing Organisation-Wide Configuration Templates',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'configuration', 'templates', 'governance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Managing Organisation-Wide Configuration Templates

## Creating Organisation-Standard Module Templates

When you enable a new module, it starts with IMS defaults. Before users begin entering data, configure the module to match your organisation's standards: reference number format, custom fields, approval workflows, notification rules, SLA thresholds. Once configured, save this as an organisation template in **Admin Console → Configuration Templates → Save Current → [Module Name] Standard**.

This template can be applied to newly enabled modules in future, or to additional sites that activate the same module. It ensures consistent setup across the organisation without manually repeating configuration steps.

## Sharing Configuration Templates Across Sites

In a multi-site deployment, navigate to **Admin Console → Configuration Templates → [Template Name] → Share**. Select which sites can apply this template. Shared templates appear in the site administrator's template library. Applying a template overlays the site's current configuration — review the diff summary before confirming.

## Versioning Configuration Templates

Each saved template is versioned automatically. View the version history in **Admin Console → Configuration Templates → [Template Name] → History**. Each version records who saved it and when. Annotate significant versions with a description (e.g. 'Post-ISO 45001 recertification update').

## Rolling Back Configuration Changes

IMS takes a configuration snapshot before any bulk configuration change (template application, bulk field update, workflow import). View snapshots in **Admin Console → Configuration → Snapshots**. To roll back, select a snapshot and click **Restore**. The restore previews the changes that will be undone before applying.

## Delegating Module-Level Configuration

Grant site administrators the ability to configure specific modules independently without exposing organisation-wide settings. In **Admin Console → Roles → Site Admin**, toggle which modules the site admin can configure. Organisation-wide settings (master workflows, compliance calendar, SLA rules) remain locked and editable only by organisation administrators.
`,
  },
  {
    id: 'KB-AA3-012',
    title: 'Configuring the Compliance Calendar',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'compliance', 'calendar', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring the Compliance Calendar

## Populating Recurring Regulatory Obligations

Navigate to **Admin Console → Compliance Calendar → New Item**. Define the obligation name, the regulation or standard it derives from, the recurrence pattern (one-off, monthly, quarterly, annual), and the due date or due-day-of-period (e.g. last business day of each quarter). Examples: Annual fire risk assessment (Health & Safety module), Quarterly legal review (Legal Register module), Monthly greenhouse gas emissions report (Energy module).

Set recurrence items to auto-generate the next occurrence 30 days before the current one is due, ensuring the calendar stays populated without manual intervention.

## Linking Calendar Items to Modules

Each calendar item can be linked to a specific module. When the item becomes due, IMS creates a task or prompts record creation in the linked module. For example, a 'Submit OSHA 300A' calendar item linked to the Incidents module opens the OSHA 300A report form in that module when the deadline approaches.

## Setting Lead Times for Reminders

Configure reminder lead times per item: a reminder at 30 days before due, a second at 7 days, and a final one on the due date itself. Reminders are sent to the item owner and any additional recipients configured on the item.

## Ownership Assignment

Assign an owner role (not a specific user) to each calendar item so that ownership transfers automatically when users change roles. The current holder of the assigned role receives all reminders and is accountable for completion.

## Generating a 12-Month Obligations Schedule

Export the compliance obligations schedule from **Compliance Calendar → Export → 12-Month Schedule → PDF**. The output lists all obligations grouped by month, with due dates, owners, and linked modules. Use this as the basis for your management review compliance agenda.

## iCal Integration with Outlook and Google Calendar

Enable iCal export in **Admin Console → Compliance Calendar → Integration → Enable iCal Feed**. Copy the generated feed URL into Outlook or Google Calendar as a subscribed calendar. IMS calendar items appear read-only in the external calendar and update automatically when items are added or modified in IMS.
`,
  },
  {
    id: 'KB-AA3-013',
    title: 'Advanced Audit Trail Configuration',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'audit-trail', 'compliance', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Advanced Audit Trail Configuration

## Configuring Captured Events

The default audit trail captures all data changes (create, update, delete) and all approval actions across all modules. In **Admin Console → Audit Trail → Event Configuration**, optionally enable additional event types:

- **Read events** — log every time a record is opened (high-volume; enable selectively for sensitive modules only)
- **Login events** — log every successful and failed login attempt
- **Search queries** — log what users searched for (useful for data loss prevention)

Enable additional event types only where there is a clear compliance requirement, as they significantly increase audit trail volume.

## Retention Period Configuration

Set the audit trail retention period in **Admin Console → Audit Trail → Retention**. The default is 7 years, meeting most regulatory requirements. Records older than the retention period are purged automatically during the nightly maintenance window. Configure different retention periods per module if different regulations apply.

## Exporting Audit Trail Data for SIEM

Enable the SIEM export in **Admin Console → Audit Trail → Integrations → SIEM Export**. IMS streams audit events in CEF or JSON format to a syslog endpoint or directly to a webhook. Configure the export to filter by event type and module to limit volume. Common SIEM integrations: Splunk, Microsoft Sentinel, IBM QRadar.

## Protecting Audit Trail Integrity

The audit trail is immutable by design — no user, including system administrators, can delete or modify individual audit trail entries through the application. For additional write protection at the database level, enable the audit trail write-protection mode in **Admin Console → Audit Trail → Integrity → Enable Write Protection**. This creates a separate database role with insert-only access to the audit table.

## Forensic Investigation Tools

Use **Admin Console → Audit Trail → Search** to filter by user, record, event type, module, and date range. Export filtered results to CSV for forensic analysis. The search index covers all audit trail fields for fast retrieval even across millions of records.

## External Auditor Reports

Generate a formatted audit trail summary for external auditors via **Admin Console → Audit Trail → Reports → Auditor Summary**. The report lists event counts by type and module, highlights any detected anomalies (e.g. bulk deletes, off-hours access), and certifies the integrity of the audit log for the selected period.
`,
  },
  {
    id: 'KB-AA3-014',
    title: 'Performance Tuning for Large Deployments',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'performance', 'large-deployment', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Performance Tuning for Large Deployments

## Scope

These recommendations apply to deployments with more than 500 active users, more than 1 million records across all modules, or more than 50 active API integrations. Smaller deployments will not typically require these optimisations.

## Database Performance: Record Archiving

Active record queries slow as table sizes grow. IMS includes an archiving pipeline (**Admin Console → Maintenance → Archive Records**) that moves records older than a configurable threshold (default: 5 years) to archive tables. Archived records remain accessible via the module's 'View Archived' filter but are excluded from default queries and dashboard widgets. This typically reduces active table size by 60–80% in mature deployments and significantly improves query response time.

## Dashboard Performance

Limit dashboards to 10 active widgets. Each widget executes one or more database queries on load. Use the 'Cached data refresh' option for widgets displaying non-critical metrics — IMS caches the result and refreshes it every 15 minutes rather than on every page load. Reserve real-time (uncached) widgets for metrics where current data is operationally critical.

## Integration Performance: Batch API Calls

Integrations that call the IMS API once per record (e.g. updating 500 records individually) are a common source of performance degradation. Use the batch API endpoints — 'POST /api/{module}/batch' — to send up to 100 record operations in a single request. Batch operations reduce HTTP round-trip overhead and database transaction count by an order of magnitude.

## Search Index Size Management

Monitor search index size in **Admin Console → Search → Index Health**. If the index exceeds the recommended size threshold, disable indexing for low-value fields (see article KB-AA3-007) and trigger a re-index to compact the index. Archiving old records also reduces index size if archived records are excluded from the index (configurable per archive policy).

## Monitoring Performance Metrics

The System Health dashboard (**Admin Console → System Health**) displays API response time percentiles (p50, p95, p99), database query duration, cache hit rates, and background job queue depths. Set alert thresholds on these metrics so you are notified of degradation before users are affected. Review the dashboard weekly in large deployments.
`,
  },
  {
    id: 'KB-AA3-015',
    title: 'Configuring Disaster Recovery and Business Continuity Settings',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'advanced', 'disaster-recovery', 'business-continuity', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring Disaster Recovery and Business Continuity Settings

## Administrator Role in Disaster Recovery

IMS administrators are not responsible for infrastructure recovery — that is the IMS support or DevOps team's responsibility. Administrator responsibilities in a DR scenario:

- Verify daily backup job completion each morning via **Admin Console → Maintenance → Backup Status**
- Document the organisation-specific recovery procedure (which modules are critical, which integrations must be reconnected first, who must be notified)
- Be the primary point of contact between your organisation and IMS support during an outage
- Validate data integrity after recovery by running the post-recovery checklist in **Admin Console → Maintenance → Recovery Checklist**

## Backup Notification Recipients

Configure who receives alerts if a backup job fails: **Admin Console → Maintenance → Backup Settings → Failure Notifications**. Add at least two recipients (primary administrator and a backup contact). Backup failure alerts are sent immediately and include the error code and affected backup scope.

## Read-Only Mode

Activate read-only mode in **Admin Console → System → Maintenance Mode → Read-Only**. In read-only mode, all users can view records but no creates, updates, or deletes are permitted. Use this during planned database maintenance or before applying a major configuration change that requires a clean starting state. Notify users before activating via system broadcast (see below).

## Failover DNS Configuration

For on-premises deployments, document the failover hostname in **Admin Console → System → Failover Configuration**. If the primary server is unreachable, update DNS to point to the failover host. IMS validates SSL certificates for both hostnames at startup; ensure certificates are installed on both hosts before a failover event occurs.

## User Communication During Outages

Use **Admin Console → System → Broadcast Message** to send a banner notification to all currently logged-in users. The banner persists until dismissed by the user or cleared by the administrator. Use broadcasts to communicate planned maintenance windows, expected downtime duration, and status update channels (e.g. your status page URL).

## Annual DR Test

Schedule an annual DR test with IMS support. After the test, document the recovery time achieved and any gaps identified. Save the DR test report in the Business Continuity module as evidence for ISO 22301 or similar framework audits.
`,
  },
];
