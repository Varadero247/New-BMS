import type { KBArticle } from '../types';

export const adminGuides2Articles: KBArticle[] = [
  {
    id: 'KB-AD2-001',
    title: 'Advanced User Management — Bulk Operations',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'user-management', 'bulk'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Advanced User Management — Bulk Operations

## Overview

When managing large user populations, individual record-by-record operations become impractical. IMS provides bulk operation tools that allow administrators to import, update, and manage many users simultaneously.

## Bulk User Import from CSV

Navigate to **Admin Console → Users → Import Users → Download Template** to get the CSV template. Required fields: firstName, lastName, email, role, site. Optional fields: department, jobTitle, manager email, language preference. Once the CSV is prepared, upload it and review the validation summary before confirming the import. Any rows with errors are listed for correction.

## Bulk Role Assignment

Select multiple users in the user list using the checkboxes → **Actions → Assign Role**. This overwrites the existing role for all selected users. Use with caution — bulk role assignment cannot be undone through the interface (restore from audit log if needed).

## Bulk Deactivation of Leavers

When multiple employees leave simultaneously (e.g., end of contract, site closure), select them in the user list → **Actions → Deactivate**. Deactivated users are immediately prevented from logging in. Their records, audit trail, and assigned documents remain intact.

## Bulk Password Reset Trigger

Select users → **Actions → Send Password Reset Email**. Each selected user receives a reset link valid for 24 hours. Useful after a security event requiring credential rotation.

## Deactivation vs Deletion

**Deactivation:** User cannot log in, but all their records are retained with their name and profile intact. Deactivated users do not count against your user licence limit.

**Deletion:** User's personal data is anonymised in all records (name replaced with 'Deleted User'). This is irreversible and intended for GDPR right-to-erasure requests.

## Bulk Export

Export all users with roles and site assignments: **Admin Console → Users → Export → CSV**. The export includes user status, last login date, and module permission summary.

## Audit Trail

All bulk operations are recorded in the system audit log: **Admin Console → Audit Log → filter by Action Type: User Bulk Operation**. Each bulk action record shows the operator, timestamp, and list of affected users.`,
  },
  {
    id: 'KB-AD2-002',
    title: 'Custom Fields & Data Extensions',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'customisation', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Custom Fields & Data Extensions

## Overview

Every organisation has unique data requirements that the standard IMS fields may not fully cover. Custom fields allow you to extend any IMS record type with organisation-specific data points without any coding.

## Adding a Custom Field

1. Navigate to **Admin Console → Configuration → Custom Fields**
2. Select the module and record type (e.g., Incidents → Incident Record)
3. Click **Add Field**
4. Configure the field properties:
   - **Label:** The field name shown to users
   - **Field type:** see below
   - **Required:** whether the field must be completed before the record can be saved
   - **Help text:** optional guidance shown beneath the field

## Available Field Types

| Type | Description |
|---|---|
| Text (short) | Single line, up to 255 characters |
| Text (long) | Multi-line, up to 5,000 characters |
| Number | Integer or decimal |
| Date | Date picker |
| Dropdown | Predefined list, single selection |
| Multi-select | Predefined list, multiple selections |
| Checkbox | True/false toggle |
| URL | Validated URL field |
| Email | Validated email address field |

## Field Validation

For text fields: configure minimum and maximum length, or a regex pattern for format validation (e.g., to enforce a reference number format). For number fields: configure minimum and maximum value ranges.

## Visibility in List Views and Reports

After creating a custom field, navigate to the module's list view settings and add the custom field as a column. Custom fields are also available as filter criteria and in all exports and API responses.

## Performance and Storage Considerations

Custom fields are stored as indexed JSON, enabling fast querying. Avoid creating large numbers of multi-select fields with many options as these can increase record size. Maximum 50 custom fields per record type.

## Backup and Custom Fields

Custom field data is included in all standard data exports and backups. Custom field definitions (labels, types, validation rules) are also exported in the configuration backup.`,
  },
  {
    id: 'KB-AD2-003',
    title: 'Organisation Profile & Branding Configuration',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'branding', 'organisation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Organisation Profile & Branding Configuration

## Overview

The organisation profile stores your company's identity and branding information, which appears throughout IMS: on the login page, in generated reports, in notification emails, and on the customer and supplier portals.

## Setting Organisation Details

Navigate to **Admin Console → Organisation → Profile** and complete the following fields:

- **Organisation name:** Your trading name as it should appear in the system
- **Legal name:** Full registered legal name (used on formal documents and contracts)
- **Registered address:** Used on PDF report footers
- **Company registration number:** Displayed on formal documents
- **VAT/Tax number:** Used on financial documents generated by the Finance module
- **Industry:** Used for regulatory feed filtering and benchmarking
- **Organisation size:** Number of employees bracket
- **Primary contact:** Name and email of the IMS account holder

## Logo Upload

Upload your organisation logo at **Admin Console → Organisation → Branding → Logo**. Requirements: PNG format, minimum 200×200 pixels, maximum 2 MB file size, transparent background recommended. The logo appears on the login page, navigation bar, PDF report headers, and notification emails.

## Custom Colour Scheme

Set primary and secondary brand colours using hex codes at **Admin Console → Organisation → Branding → Colours**. The primary colour is used for navigation elements, buttons, and headings. The secondary colour is used for accents and highlights.

## Custom Login Page

Configure a branded login page at **Admin Console → Organisation → Branding → Login Page**: upload a background image, add a welcome message (e.g., 'Welcome to [Organisation] Integrated Management System'), and display the organisation logo.

## Email Branding

Notification emails sent by IMS use your organisation logo in the header and allow a custom footer signature. Configure at **Admin Console → Notifications → Email Branding**.

## Language and Locale

Set the default language, date format (DD/MM/YYYY or MM/DD/YYYY), number format (comma vs decimal point), timezone, and currency symbol at **Admin Console → Organisation → Locale**. These serve as defaults; individual users can override their personal preferences.`,
  },
  {
    id: 'KB-AD2-004',
    title: 'Module Enable/Disable & Licensing',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'modules', 'licensing'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Module Enable/Disable & Licensing

## Overview

IMS is a modular system. Your licence determines which modules are active. As your organisation's needs evolve, administrators can enable new modules, manage trial activations, and understand the impact of disabling modules.

## Viewing Your Licence

Navigate to **Admin Console → Organisation → Licence** to view:
- Currently enabled modules
- User limit (total and currently used)
- Licence expiry date
- Contract tier (Essentials, Professional, Enterprise)

## Enabling a New Module

1. Navigate to **Admin Console → Modules**
2. Find the module you wish to enable (disabled modules are greyed out)
3. Click **Enable**
4. Review the module's dependencies and confirm
5. The module is immediately available to users with the appropriate role

## Module Dependencies

Some modules require others to be enabled first:

- **CMMS** requires Assets module
- **PTW (Permit to Work)** requires H&S module
- **Supplier Portal** requires Supplier Management module
- **Customer Portal** requires CRM or Complaints module

The dependency check is automatic — if you attempt to enable a module without its dependency, you will be prompted to enable the prerequisite first.

## Disabling a Module

A module can be disabled at **Admin Console → Modules → [Module] → Disable**. When disabled, all existing data is retained in the database but is inaccessible to users. No data is deleted. Re-enabling the module restores full access to all historical records.

Note: disabling a module that another module depends on is blocked until the dependent module is disabled first.

## Trial Mode

Some modules are available for a 30-day free trial. Navigate to **Admin Console → Modules → [Module] → Start Trial**. At the end of the trial, the module is automatically disabled unless you upgrade your licence.

## Requesting an Upgrade

To add permanent modules to your licence, navigate to **Admin Console → Organisation → Licence → Request Upgrade** or contact your IMS account manager.`,
  },
  {
    id: 'KB-AD2-005',
    title: 'Configuring System-Wide Notification Templates',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'notifications', 'email-templates'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring System-Wide Notification Templates

## Overview

IMS sends email and in-app notifications for a wide range of events. Each notification type uses a template that administrators can customise to match your organisation's tone, branding, and communication standards.

## Accessing the Notification Template Editor

Navigate to **Admin Console → Notifications → Templates**. The full list of system notification templates is displayed, grouped by module (e.g., Incidents, CAPA, Documents, Training). Click any template name to open the editor.

## Template Variables

Each template supports a set of variables that are replaced with actual values when the notification is sent. Common variables available in all templates:

| Variable | Description |
|---|---|
| {firstName} | Recipient's first name |
| {lastName} | Recipient's last name |
| {email} | Recipient's email address |
| {moduleName} | The IMS module name |
| {recordTitle} | The title of the triggering record |
| {dueDate} | The relevant due date |
| {link} | Deep link URL to the specific record |
| {organisation} | Your organisation name |

Module-specific variables (e.g., {severity} for incidents, {documentVersion} for documents) are listed in the template editor's variable reference panel.

## HTML Template Editing

Templates support basic HTML and inline CSS for formatting. Use the visual editor for basic changes or switch to the HTML source editor for full control. Keep HTML simple — complex layouts may render poorly in some email clients.

## Plain Text Alternative

A plain text version of the notification is automatically generated from the HTML version for email clients that do not support HTML. You can override this auto-generated plain text if needed.

## Subject Line and Sender Configuration

Customise the email subject line using the same variables. Configure the sender name (e.g., 'IMS Notifications') and reply-to address under **Admin Console → Notifications → Email Settings**.

## Testing a Template

Before activating a customised template, use the **Send Test Email** button in the template editor. Enter a recipient email address to receive a preview of how the notification will look with sample data.

## Restoring the Default Template

If a customised template is causing formatting issues or errors, click **Restore Default** in the template editor to revert to the original IMS template. Your customisation is discarded.`,
  },
  {
    id: 'KB-AD2-006',
    title: 'Configuring Data Retention Policies',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'data-retention', 'gdpr', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring Data Retention Policies

## Overview

Data retention policies define how long different types of records are kept in IMS before they are automatically deleted or anonymised. Configuring appropriate retention periods is important for GDPR compliance, regulatory requirements, and storage management.

## Accessing Retention Settings

Navigate to **Admin Console → Data Management → Retention Policies**. Each module's record types are listed with their current retention period and action (delete or anonymise).

## Common Regulatory Retention Requirements

The following retention periods are common starting points — always verify against your jurisdiction's specific legal requirements:

| Record Type | Suggested Minimum |
|---|---|
| Health & Safety incidents | 7 years |
| Environmental monitoring records | 5 years |
| Financial records | 7 years |
| Contracts (after expiry) | 7 years |
| Employee records (after leaving) | 6 years (UK) |
| Training records | Duration of employment + 3 years |
| Audit records | 5 years |

## Deletion vs Anonymisation

**Deletion:** The record is permanently removed from the system. Use for records where there is no ongoing compliance value.

**Anonymisation:** Personal data fields (names, email addresses, contact details) are replaced with anonymised placeholders. The business record structure (dates, categories, outcomes) is retained. This approach satisfies GDPR right-to-erasure requirements while preserving compliance records.

## Legal Hold

Records under legal hold (litigation, regulatory investigation) should be excluded from automatic deletion. Navigate to the record → **Actions → Apply Legal Hold** → enter the hold reason and expected end date. Records on legal hold are excluded from retention policy processing.

## Export Before Deletion

Enable the optional pre-deletion export: **Retention Policy Settings → Export before deletion → Enabled**. A CSV export of expiring records is generated and emailed to the admin 30 days before deletion occurs.

## Retention Audit Log

All automatic deletions and anonymisations are recorded in the system audit log, providing a defensible record of your retention policy application for regulatory purposes.`,
  },
  {
    id: 'KB-AD2-007',
    title: 'Setting Up Multi-Site Permissions',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'multi-site', 'permissions', 'rbac'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Setting Up Multi-Site Permissions

## Overview

For organisations operating multiple sites, IMS provides site-based data isolation controls that ensure users see only the data relevant to their location while allowing cross-site visibility for senior management and group functions.

## Cross-Site Visibility Levels

| Level | Who Should Use It | What They Can See |
|---|---|---|
| Global Admin | Group IT Admin | All sites, all data |
| Site Admin | Site H&S Manager | Own site only, full admin |
| Cross-site Viewer | Group Auditor, CEO | Read access to all sites |
| Site User | Standard employee | Own site only, as per role |

## Configuring Site Access for Users

1. Navigate to **Admin Console → Users → [User] → Site Access**
2. Select the sites this user can access
3. For each site, choose their access level (full access or read-only)
4. Save — changes take effect immediately

## Site-Restricted Roles

Create roles that automatically restrict users to a single site: **Admin Console → Roles → New Role → Site Scope: Assigned Site Only**. Any user assigned this role can only see records tagged to their assigned site, regardless of any site access settings.

## Cross-Site Reporting for Selected Roles

Enable consolidated cross-site reporting for specific roles (e.g., Group H&S Director, Group Quality Manager) without granting them full admin access to other sites: **Admin Console → Roles → [Role] → Cross-site Reporting: Enabled**.

## Data Isolation Verification

After configuring site isolation, test it using a test account assigned to a single site. Verify that:
- The test user cannot see records from other sites in any module
- Search results are filtered to the user's site
- Reports only contain data from the user's site

## Executive and Global Roles

Senior management roles that need cross-site dashboard views (e.g., Group Safety KPIs, Group Quality Performance) should be assigned 'Cross-site Viewer' access in addition to their site-specific role. The Dashboard module provides a consolidated view when cross-site access is enabled.`,
  },
  {
    id: 'KB-AD2-008',
    title: 'Managing API Keys & Service Accounts',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'api', 'security', 'api-keys'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Managing API Keys & Service Accounts

## Overview

API keys and service accounts allow external systems, automation tools, and custom integrations to interact with IMS without using a personal user account. Proper management of these credentials is critical for security.

## Creating an API Key

1. Navigate to **Admin Console → Settings → API Keys → New Key**
2. Enter a descriptive name that identifies the consuming system (e.g., 'PowerBI-Analytics-Connector', 'Zapier-Incident-Webhook')
3. Select the scope:
   - **Read-only:** GET requests only
   - **Read-write:** GET, POST, PUT, PATCH requests
   - **Module-specific:** restrict access to specific IMS modules
4. Set an expiry date (maximum 12 months — renewable)
5. Click **Generate Key**

**Important:** The API key is displayed only once at the time of creation. Copy it immediately and store it in your password manager or secrets vault. IMS cannot retrieve the key after this point.

## API Key Security Best Practices

- Give each integration its own API key — never share one key across multiple integrations
- Apply the minimum scope required for the integration's function
- Set the shortest reasonable expiry period
- Store API keys in a secrets management tool, never in plain text or source code

## API Key Rotation

When rotating a key (for security or expiry):
1. Create a new key with the same scope
2. Update the consuming system or integration with the new key
3. Verify the integration is working correctly with the new key
4. Revoke the old key

## Service Accounts

For integrations that need user-context access (e.g., a system creating records on behalf of a specific department), create a dedicated service account user: **Admin Console → Users → New User → User Type: Service Account**. Service accounts cannot log in via the user interface and do not consume a named-user licence.

## Monitoring API Key Usage

All API key requests are logged: **Admin Console → Audit Log → filter by Source: API Key**. Monitor for unexpected usage patterns, particularly outside business hours or from unrecognised IP addresses.

## Revoking a Compromised Key

If a key is suspected of compromise, revoke it immediately: **Admin Console → Settings → API Keys → [Key] → Revoke**. The key stops working within 60 seconds. Then investigate the audit log for any unauthorised actions taken with the compromised key.`,
  },
  {
    id: 'KB-AD2-009',
    title: 'Configuring Password & Authentication Policies',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'security', 'passwords', 'authentication'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring Password & Authentication Policies

## Overview

Strong authentication policies are a foundational security control. IMS allows administrators to configure password complexity requirements, session management, account lockout, and multi-factor authentication to meet your organisation's security standards.

## Password Policy Settings

Navigate to **Admin Console → Settings → Security → Password Policy**:

- **Minimum length:** Default 12 characters — ISO 27001 and NIST guidelines recommend at least 12
- **Complexity requirements:** Require at least one: uppercase letter, lowercase letter, number, special character
- **Password history:** Prevent reuse of the last N passwords (default: last 10)
- **Maximum age:** Force a password reset every N days (default: 90 days; 0 = no expiry, aligns with NIST SP 800-63B guidance)

## Account Lockout

Configure at **Admin Console → Settings → Security → Account Lockout**:

- **Failed attempts threshold:** Default 5 consecutive failed logins
- **Lockout duration:** Default 15 minutes (automatic unlock); set to 0 for manual unlock only
- **Admin notification:** Alert the system administrator when an account is locked

## Session Management

- **Idle session timeout:** Automatically log out inactive sessions after N minutes (default: 60)
- **Absolute session timeout:** Force re-authentication after N hours regardless of activity (default: 12)
- **Concurrent sessions:** Optionally limit users to one active session at a time

## Enforcing Multi-Factor Authentication

Navigate to **Admin Console → Settings → Security → MFA**:

- **Enforce for all users:** All users must enrol an authenticator app on next login
- **Enforce for specific roles:** Apply MFA enforcement only to admin and privileged roles
- Supported MFA methods: TOTP authenticator app (Google Authenticator, Microsoft Authenticator), hardware security key (FIDO2/WebAuthn)

## SSO-Only Mode

When SSO is configured and stable, disable password login to force all authentication through your identity provider: **Admin Console → Settings → Security → SSO Only Mode → Enable**. Ensure your SSO provider is reliably configured before enabling this.`,
  },
  {
    id: 'KB-AD2-010',
    title: 'Backup, Export & Data Portability',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'backup', 'data-export', 'business-continuity'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Backup, Export & Data Portability

## Overview

IMS maintains continuous automated backups of all your data. Additionally, administrators can perform on-demand data exports for local archiving, data migration, or regulatory compliance purposes.

## IMS Infrastructure Backup

IMS data is backed up continuously with point-in-time recovery (PITR) capability. The backup infrastructure provides:

- **Continuous backup:** Changes are captured continuously, not just at scheduled intervals
- **Point-in-time restore:** Ability to restore data to any point within the retention window
- **Backup retention:** Minimum 30 days; configurable up to 365 days on Enterprise plans
- **Geographic redundancy:** Backups are stored in a separate geographic region from primary data

In the event of data loss or corruption, contact IMS support to request a point-in-time restore.

## On-Demand Full Data Export

Navigate to **Admin Console → Data Management → Export All Data** to download all your organisation's data:

1. Select the modules to include (or select All)
2. Choose the export format: JSON (full fidelity, for re-import) or CSV (human-readable, for analysis)
3. Click **Generate Export** — large exports are generated asynchronously and a download link is emailed when ready

## What Is Included in the Export

- All module records (incidents, risks, CAPAs, quality records, HR data, financial records, etc.)
- User accounts and role assignments
- Workflow and notification configurations
- Custom field definitions and data
- Organisation configuration and branding settings

Uploaded binary files (PDF attachments, images) are not included in the standard data export. Request a separate document/file archive from IMS support.

## Data Portability for Migration

IMS JSON exports are structured to facilitate migration to other systems. The schema documentation for the export format is available from IMS support.

## Restore Request Process

Contact IMS support via the in-app chat or email with: the target restore timestamp, the reason for restore, and whether a full restore or partial restore (specific records) is required.`,
  },
  {
    id: 'KB-AD2-011',
    title: 'Configuring Escalation & SLA Settings',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'sla', 'escalation', 'workflows'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring Escalation & SLA Settings

## Overview

Service Level Agreements (SLAs) define the expected response and resolution timeframes for records across IMS modules. Escalation rules ensure the right people are notified when timeframes are at risk of being missed.

## SLA Configuration by Module

Navigate to each module's admin settings section. SLA settings are typically found at **Admin Console → [Module] → Settings → SLA**. Each module has its own SLA configuration reflecting the nature of its records.

## Incident SLA Reference

| Severity | Response Time | Investigation Complete | Resolution Target |
|---|---|---|---|
| CRITICAL | 1 hour | 24 hours | 48 hours |
| MAJOR | 4 hours | 72 hours | 7 days |
| MODERATE | 24 hours | 5 days | 14 days |
| MINOR | 72 hours | 10 days | 30 days |

## CAPA SLA

Configure default CAPA due dates from creation by type: major nonconformance (30 days), minor nonconformance (60 days), observation (90 days). These can be overridden on individual CAPA records.

## Document Review SLA

Set the maximum number of calendar days a document reviewer has to respond before escalation. Configure per document category: policies (7 days), procedures (14 days), work instructions (7 days).

## Escalation Rules

For each SLA, configure two escalation triggers:

- **At risk (80% elapsed):** Notify the record owner and their line manager by email and in-app notification
- **Breach (100% elapsed):** Notify the module administrator and department head

Configure at **Admin Console → [Module] → Settings → Escalation Rules**.

## Business Hours vs Calendar Hours

Configure whether SLA timers count business hours only (stopping outside your configured working hours and on public holidays) or calendar hours (24/7 counting). Navigate to **Admin Console → Organisation → Working Hours** to configure business hours and the public holiday calendar for your location.

## SLA Pause / Suspension

SLA timers can be paused when waiting for information from a third party or customer. Navigate to the record → **Actions → Pause SLA** → enter the reason. The timer resumes when the hold is removed.`,
  },
  {
    id: 'KB-AD2-012',
    title: 'User Onboarding & Offboarding Workflow',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'user-management', 'onboarding', 'offboarding'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# User Onboarding & Offboarding Workflow

## Overview

A structured onboarding and offboarding process ensures new users are set up correctly from day one and departing users are removed safely, with all their open responsibilities properly handed over.

## Automated Onboarding Workflow

When a new user is created in IMS, an onboarding workflow is automatically triggered. The default onboarding steps include:

1. Welcome email sent with login credentials or SSO instructions
2. Email verification required before first login
3. Profile completion prompted (job title, site, department, profile photo)
4. Mandatory training plan assigned (if HR-Training integration is enabled)
5. Acceptance of IMS Terms of Use and data processing notice
6. Role confirmation: user's manager receives notification to confirm the correct role is assigned

## Customising the Welcome Email

Navigate to **Admin Console → Notifications → Templates → User Welcome Email** to customise the welcome message with your organisation's name, helpful getting-started links, and your internal IT support contact.

## Offboarding Triggers

User offboarding can be triggered in two ways:
- **Manual:** An admin deactivates a user account from **Admin Console → Users → [User] → Deactivate**
- **Automated:** If the HR module is integrated, a termination in HR automatically triggers the IMS offboarding workflow

## Offboarding Steps

1. Open tasks and records are identified and listed for reassignment
2. Admin or manager bulk-reassigns open items (see KB-AD2-001 for bulk operations)
3. User account is deactivated — the user is immediately locked out
4. API keys associated with the user are revoked
5. User's pending approvals are reassigned to their line manager
6. Offboarding completion notification sent to admin and HR

## Audit Trail

All onboarding and offboarding steps are recorded in the audit log with timestamps. This provides a defensible record for access control audits and data protection reviews.

## HR Integration Linkage

When the HR module is integrated, the HR system's termination record drives the IMS offboarding trigger, ensuring the two systems remain in sync without admin manual intervention.`,
  },
  {
    id: 'KB-AD2-013',
    title: 'System Health Monitoring & Alerts',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'monitoring', 'system-health'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# System Health Monitoring & Alerts

## Overview

The IMS Admin Console includes a system health dashboard that gives administrators visibility into service status, storage usage, user activity, and integration health — enabling proactive management before issues impact users.

## System Health Dashboard

Navigate to **Admin Console → System → Health** to view real-time system indicators:

- **Service Status:** All IMS modules show green (operational), amber (degraded), or red (outage). This reflects the IMS infrastructure status, not your data.
- **Database Health:** Connection pool usage, query response times, database size
- **Storage Usage:** Total storage used vs limit, breakdown by module (documents, attachments, report archives, audit logs)
- **Active Users:** Current concurrent users, peak users today, active sessions

## User Activity Reporting

The User Activity report shows: daily active users, login frequency, inactive accounts (users who have not logged in for 60+ days), and module usage breakdown. Inactive accounts are flagged for review — they represent unused licences and potential security risks.

## Integration Health

If you have external integrations configured (SSO, webhooks, Slack, Teams, IoT endpoints), their health is shown here. A red status means the integration has been failing for more than 15 minutes, and the failure reason is shown.

## Configuring Health Alerts

Navigate to **Admin Console → System → Health Alerts** to configure notifications when:

- Storage usage exceeds 80% of limit
- An integration fails and has not recovered within 30 minutes
- Unusual login activity is detected (multiple failed logins, new geolocation)
- A scheduled report fails to generate
- Database response time exceeds threshold

## IMS Public Status Page

IMS maintains a public status page that shows the operational status of the IMS platform infrastructure: your IMS URL followed by '/status', or visit the IMS website for the status page link. Subscribe for email notifications of planned maintenance and incidents.

## Maintenance Windows

IMS performs planned maintenance during low-usage windows (typically Sunday 02:00–04:00 UTC). Maintenance is announced via the status page and email at least 72 hours in advance.`,
  },
  {
    id: 'KB-AD2-014',
    title: 'Configuring Number Sequences & Reference Numbers',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'configuration', 'reference-numbers'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring Number Sequences & Reference Numbers

## Overview

Every IMS record is assigned a unique reference number when it is created. These reference numbers follow configurable formats that make it easy to identify the record type, year, and sequence at a glance.

## Default Reference Number Formats

| Module | Default Format | Example |
|---|---|---|
| Incidents | INC-YYYY-NNN | INC-2026-001 |
| Risks | RISK-YYYY-NNN | RISK-2026-042 |
| NCRs (Quality) | NCR-YYYY-NNN | NCR-2026-015 |
| CAPAs | CAPA-YYYY-NNN | CAPA-2026-008 |
| Documents | DOC-PREFIX-NNN | DOC-POL-001 |
| Permits (PTW) | PTW-SITE-YYYY-NNN | PTW-LON-2026-003 |
| Audits | AUD-YYYY-NNN | AUD-2026-007 |
| Contracts | CNT-YYYY-NNN | CNT-2026-019 |

## Customising the Prefix

Navigate to **Admin Console → Configuration → Reference Numbers → select module → edit format**. Available format components:
- **Fixed text prefix:** e.g., 'INC', 'SAFETY', 'HS'
- **Year (YYYY or YY):** e.g., '2026' or '26'
- **Month (MM):** optional
- **Site code:** for multi-site organisations (configured in Organisation → Sites)
- **Sequence number:** minimum digits (NNN = 3 digits, NNNN = 4 digits)
- **Separator character:** hyphen (-), slash (/), or underscore (_)

## Adding a Site Code for Multi-Site Organisations

For multi-site organisations, including a site code in the reference number immediately identifies which site generated the record: e.g., 'LON-INC-2026-001' vs 'MAN-INC-2026-001'. Configure site codes at **Admin Console → Organisation → Sites → [Site] → Site Code** (2–4 character code).

## Sequence Reset Options

- **Annual reset:** Sequence number resets to 001 at the start of each calendar year (default)
- **Continuous:** Sequence number never resets; counts up indefinitely

## Manual Override

If your role permits, you can override the auto-generated reference on individual records. This is useful when aligning IMS reference numbers with an existing paper-based system during migration.

## Uniqueness Constraint

Reference numbers are unique within each module. Duplicate reference numbers cannot be saved. If you attempt to save a record with a manually entered reference that already exists, you will receive a validation error.`,
  },
  {
    id: 'KB-AD2-015',
    title: 'Language & Localisation Settings',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'localisation', 'language', 'i18n'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Language & Localisation Settings

## Overview

IMS supports 18 languages and a range of locale settings for date formats, number formats, timezones, and currencies. This allows multinational organisations to deploy IMS across different regions with appropriate localisation for each user group.

## Supported Languages

English (UK), English (US), French, German, Spanish, Portuguese (Brazil), Dutch, Italian, Swedish, Norwegian, Danish, Finnish, Polish, Czech, Romanian, Japanese, Chinese (Simplified), Korean, Arabic.

## Setting the Organisation Default Language

Navigate to **Admin Console → Organisation → Locale → Default Language**. This language is applied to all new users unless they override it in their personal settings.

## Per-User Language Override

Individual users can set their preferred language at: **Profile (avatar top-right) → Preferences → Language → select → Save**. The IMS interface, system labels, and error messages will appear in the chosen language.

**Note:** User-created content (record titles, descriptions, document names, comments) is stored and displayed in the language it was written in. IMS does not automatically translate user-generated content.

## Date and Time Formats

Configure the organisation default date format at **Admin Console → Organisation → Locale → Date Format**:
- **DD/MM/YYYY** — standard in UK, Europe, Australia
- **MM/DD/YYYY** — standard in the United States
- **YYYY-MM-DD** — ISO 8601, useful for international organisations

## Number Formats

- **Decimal point:** 1,234.56 (English convention)
- **Decimal comma:** 1.234,56 (European convention)

## Timezone Configuration

The organisation's default timezone is configured at **Admin Console → Organisation → Locale → Timezone**. All record timestamps, scheduled reports, and notification delivery times use this timezone. Users can override their personal timezone in profile preferences.

## Right-to-Left (RTL) Support

Arabic and Hebrew are displayed with right-to-left text direction. The entire IMS interface mirrors to RTL layout when these languages are selected.

## Requesting a New Language

If your preferred language is not available, submit a request to IMS support. Languages with sufficient demand are added to the localisation roadmap.`,
  },
  {
    id: 'KB-AD2-016',
    title: 'Configuring Module-Specific Approval Thresholds',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'approvals', 'workflows', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring Module-Specific Approval Thresholds

## Overview

Approval thresholds define at what point a record requires a higher level of authority for approval. Configuring thresholds correctly ensures appropriate oversight without creating unnecessary bottlenecks for routine activities.

## Finance — Invoice Approval Thresholds

Navigate to **Admin Console → Finance → Settings → Approval Configuration → Invoice Thresholds**:

| Invoice Value | Required Approver |
|---|---|
| Up to £1,000 | Department Manager |
| £1,001 – £10,000 | Finance Director |
| £10,001 – £50,000 | CFO |
| Above £50,000 | CFO + CEO |

Adjust these bands and approver roles to match your organisation's financial authority matrix (Delegation of Authority document).

## Risk — Score-Based Approval

Navigate to **Admin Console → Risk → Settings → Approval Configuration**. Set the risk score threshold above which senior management review and approval is required before a risk treatment plan is accepted (e.g., risk score ≥ 20 requires Risk Committee approval).

## Document — Category-Based Approval Levels

Navigate to **Admin Console → Documents → Settings → Approval Configuration**. Assign required approver roles by document category:
- **Policies:** Board Director or QHSE Director
- **Procedures:** Department Head
- **Work Instructions:** Supervisor or Team Leader
- **Forms and Templates:** Module Administrator

## Contracts — Value Tiers

Navigate to **Admin Console → Contracts → Settings → Approval Tiers**. Define contract value bands and the approver role required at each tier. Include a separate configuration for contract renewals vs new contracts.

## Incidents — Severity-Based Notifications

Navigate to **Admin Console → Incidents → Settings → Notifications**. Configure which severity levels automatically notify which roles: CRITICAL incidents notify Director and CEO immediately; MINOR incidents notify the department manager only.

## Audit Trail of Configuration Changes

All approval threshold configuration changes are recorded in the system audit log with the previous and new values, operator, and timestamp. This provides an audit trail for governance and regulatory purposes.`,
  },
  {
    id: 'KB-AD2-017',
    title: 'Advanced Reporting — Custom Report Templates',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'reporting', 'analytics', 'customisation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Advanced Reporting — Custom Report Templates

## Overview

Beyond the built-in module reports, the IMS Analytics module allows administrators and power users to create custom report templates that are tailored to your organisation's specific reporting requirements, including management review packs, board reports, and regulatory submissions.

## Creating a Custom Report Template

Navigate to **Analytics → Templates → New Template**:

1. **Name and description:** Give the template a clear name (e.g., 'Monthly H&S Management Report', 'Board ESG Summary')
2. **Cover page:** Add your organisation logo, report title field, and date field
3. **Add sections:** Choose from the section types below

## Template Section Types

| Section Type | Description |
|---|---|
| Text / narrative | Editable text for context and commentary |
| KPI tile row | 3–4 headline metric tiles |
| Bar / line chart | Time series or category comparison chart |
| Data table | Filterable tabular data from any module |
| Pie / donut chart | Distribution breakdown |
| Appendix | Supporting detail data |

## Branding

Apply your organisation's report style: **Template → Settings → Branding → select colour scheme** (uses your configured brand colours), header logo, and report footer content.

## Scheduling Automated Report Generation

Activate automated report delivery at **Template → Schedule → set frequency → set recipients → set format (PDF or Excel)**. Scheduled reports are generated at the configured time and emailed to recipients automatically. Useful for: monthly management review packs, weekly safety KPI digests, quarterly board ESG reports.

## Report Archive

All generated reports (scheduled and on-demand) are stored in the report archive for 3 years: **Analytics → Report Archive → filter by template → download**. This provides an auditable history of reports produced.

## Custom Report API

Generate reports programmatically using the IMS Reporting API: POST to '/api/v1/analytics/reports/generate' with the template ID and parameters. The response includes a URL to download the generated report file.

## Template Versioning

When you update a report template, all future reports use the new version. Historical reports in the archive retain the format they were generated with, ensuring consistent historical records.`,
  },
  {
    id: 'KB-AD2-018',
    title: 'Configuring the Customer & Supplier Portals',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'portal', 'configuration', 'customer-portal', 'supplier-portal'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Configuring the Customer & Supplier Portals

## Overview

IMS provides two external-facing portals: the Customer Portal (for clients and customers) and the Supplier Portal (for vendors and contractors). Each portal provides a controlled, branded self-service interface without granting external parties access to the main IMS system.

## Customer Portal Configuration

Navigate to **Admin Console → Portals → Customer**:

1. **Enable the portal:** Toggle → Enabled
2. **Branding:** Upload a portal-specific logo (can differ from main IMS logo), set primary colour, set portal title and welcome message
3. **Available features:** Select which capabilities customers can access:
   - Submit complaints or service requests
   - View invoice status and download invoices
   - Access approved documents (e.g., certificates, quality plans)
   - View project or delivery status

4. **Registration:** Choose 'Invitation only' (admin creates customer accounts) or 'Self-registration with approval' (customers can request access)

## Supplier Portal Configuration

Navigate to **Admin Console → Portals → Supplier**:

1. **Enable the portal:** Toggle → Enabled
2. **Self-registration fields:** Configure the fields suppliers must complete when registering (company name, registration number, categories, contact details)
3. **Qualification document requirements:** List the documents suppliers must upload to be considered for approval (ISO certificates, insurance, bank details)
4. **Available features:** Select what suppliers can do:
   - View and acknowledge purchase orders
   - Submit invoices for approval
   - Maintain qualification documents (with expiry date tracking)
   - Respond to audit findings and SCAR requests

## Portal Domain

Configure a custom subdomain for each portal: e.g., 'suppliers.yourcompany.com' and 'clients.yourcompany.com'. Navigate to **Admin Console → Portals → [Portal] → Custom Domain** and follow the DNS configuration instructions.

## Portal Audit Trail

All actions taken by portal users (submissions, uploads, acknowledgements) are logged in the main IMS audit trail and are visible to internal administrators with the appropriate access.`,
  },
  {
    id: 'KB-AD2-019',
    title: 'Regulatory & Standards Update Management',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'regulatory', 'standards', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Regulatory & Standards Update Management

## Overview

ISO standards and regulations are periodically updated. This guide explains how IMS manages standard updates, how your organisation is notified, and how to manage the transition to updated standards without disrupting ongoing compliance activities.

## How IMS Handles Standard Updates

When a supported standard is revised (e.g., a new edition of ISO 9001, a new regulation), IMS typically updates:
- Audit Management checklists (new clauses added, obsolete clauses removed)
- Compliance mapping tables (cross-standard requirement mapping)
- Document templates referencing the standard version
- Regulatory Monitor feed categories

## Notification of Standard Updates

When a major standard update is detected, IMS sends a notification to the System Administrator via email and in-app notification. The notification includes: the standard name, the effective date of the new version, a summary of key changes, and a link to the transition guidance article.

## Transition Period Management

Many standards have a transition period during which both the old and new versions are valid. IMS supports running parallel assessments:

1. Navigate to **Audit Management → Programme → New Audit** → select 'Standard Version' → both old and new versions will be listed during the transition period
2. Use separate audit programmes for old-version compliance and new-version gap assessment
3. Once transition is complete, archive old-version audit templates

## Regulatory Feed Maintenance

The Regulatory Monitor module uses configured feed sources to track changes. If a feed source URL changes (a regulatory body relaunches their website), update the source: **Regulatory Monitor → Admin → Feed Sources → [Source] → Update URL → test connection → save**.

## Custom Regulatory Feed

Add organisation-specific or niche regulatory sources: **Regulatory Monitor → Admin → Feed Sources → Add Custom Source → enter RSS/Atom feed URL or configure a monitored webpage**.

## Standard Version References in Documents

When a standard is updated, controlled documents referencing the old version require revision. The Document Control module can search all documents referencing a specific standard version: **Documents → Search → Standard Reference → [old version]**. Update each identified document through the standard revision workflow.`,
  },
  {
    id: 'KB-AD2-020',
    title: 'Advanced Security Configuration',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['admin', 'security', 'advanced', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Advanced Security Configuration

## Overview

Beyond basic password and MFA settings, IMS provides advanced security controls for organisations with elevated security requirements — including IP access restrictions, privileged account management, anomaly detection, and access to security compliance documentation.

## IP Whitelisting

Restrict IMS access to specific IP address ranges: navigate to **Admin Console → Settings → Security → IP Access Control → Add IP Range**. Enter CIDR notation ranges (e.g., '203.0.113.0/24' for your corporate network egress IP). Users connecting from unlisted IPs will be blocked with a descriptive error message.

**Warning:** Before enabling IP whitelisting, ensure you have added all relevant IP ranges including remote access VPN egress IPs, otherwise you may lock out remote users.

## Advanced Session Management

- **Concurrent session limits:** Restrict users to a maximum number of simultaneous active sessions (default: unlimited; recommend 3 for most users)
- **Geographic restriction alerts:** Notify admins when a user logs in from a country not in their normal pattern
- **Impossible travel detection:** Alert when a user session appears in two geographically distant locations within an implausibly short time (potential session hijack indicator)

## Privileged Access Management

Administrator accounts have access to all organisational data and configuration. Apply heightened controls:

- Require MFA re-authentication for all admin console actions
- Enable 'Admin session recording' to capture all admin actions in the detailed audit log
- Set admin account review reminders: **Admin Console → Settings → Security → Admin Account Review → every 90 days**
- Ensure admin accounts use a separate email address from personal or departmental accounts

## Security Event Monitoring

Configure automated alerts for suspicious events: **Admin Console → Settings → Security → Security Alerts**. Recommended alerts: 10+ failed logins in 5 minutes (brute force detection), admin account login from unrecognised device, API key usage outside business hours.

## Compliance Certifications and Reports

IMS maintains ISO 27001 certification and produces a SOC 2 Type II report annually. Request copies from IMS support (available to Enterprise customers under NDA). These reports support your own supplier due diligence activities and compliance evidence packs.

## Responsible Vulnerability Disclosure

To report a security vulnerability in IMS, email security@ims.io. IMS acknowledges reports within 24 hours and aims to resolve critical vulnerabilities within 72 hours.`,
  },
];
