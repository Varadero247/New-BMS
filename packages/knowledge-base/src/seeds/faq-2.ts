import type { KBArticle } from '../types';

export const faq2Articles: KBArticle[] = [
  {
    id: 'KB-FAQ2-001',
    title: 'Q: How do I change my name or email address in IMS?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'profile', 'account'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: How do I change my name or email address in IMS?

## Changing Your Name

1. Click your avatar in the top-right corner of IMS
2. Select **Profile**
3. Update your first name and/or last name fields
4. Click **Save Changes**

Your updated name will appear immediately across IMS, including on records you have created or been assigned to.

## Changing Your Email Address

Changing your email address requires verification to ensure the new address is valid and accessible:

1. Navigate to **Profile → Account Settings → Email Address**
2. Enter your new email address
3. Click **Send Verification Email**
4. Check your new email inbox for a verification message from IMS
5. Click the verification link in the email to confirm the change

Until the verification link is clicked, your original email address remains active. If you do not receive the verification email within 5 minutes, check your spam folder or request a resend.

## If SSO Is Enabled for Your Organisation

When your organisation uses Single Sign-On (Azure AD, Okta, or another identity provider), your name and email address are controlled by your identity provider, not IMS directly. Changes made in IMS will be overwritten on your next login as IMS re-syncs with the identity provider.

To change your name or email when SSO is active, contact your IT department and request the change in the identity provider (e.g., Azure AD or Okta). The updated details will sync to IMS on your next login.

## Admin Changes

A System Administrator or User Administrator can update any user's name or email address from **Admin Console → Users → [User] → Edit Profile**, without the email verification step. Admins should communicate the change to the affected user.`,
  },
  {
    id: 'KB-FAQ2-002',
    title: 'Q: Can I use IMS on my mobile phone?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'mobile', 'app'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: Can I use IMS on my mobile phone?

## Yes — IMS Supports Mobile Access

IMS is fully accessible on mobile devices through two methods: the Progressive Web App (PWA) in your mobile browser, and native iOS and Android apps.

## Progressive Web App (PWA)

Access IMS from any modern mobile browser (Chrome, Safari, Edge) by navigating to your organisation's IMS URL. For the best experience, add IMS to your home screen:

- **iOS (Safari):** Tap the Share icon → 'Add to Home Screen'
- **Android (Chrome):** Tap the three-dot menu → 'Add to Home Screen'

This creates an app-like shortcut that opens IMS in full-screen mode without the browser address bar.

## Native iOS and Android Apps

Dedicated native apps are available:
- **iOS:** Available from the Apple App Store — search 'IMS Integrated Management'
- **Android:** Available from the Google Play Store — search 'IMS Integrated Management'

Log in with your usual IMS credentials or SSO provider.

## Features Available on Mobile

The mobile apps are optimised for field use and support:
- Incident reporting (including photo attachment)
- CMMS work order completion
- Food safety CCP temperature monitoring
- Permit to Work viewing and approval
- Inspection and checklist completion
- Training course completion
- Risk register viewing

## Offline Access

The native mobile app supports offline access for field work without internet connectivity. Data entered offline is automatically synced when connectivity is restored. See KB-FAQ2-010 for full offline access details.

## Desktop-Only Features

Some administrative functions are only available on the desktop version, including system configuration, bulk user management, and advanced report building.`,
  },
  {
    id: 'KB-FAQ2-003',
    title: 'Q: How many users can I add to IMS?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'licensing', 'users'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: How many users can I add to IMS?

## User Limit Depends on Your Licence

The maximum number of active users is determined by your IMS licence tier. Your current limit and usage are visible at **Admin Console → Organisation → Licence → User Limits**.

## Approaching Your Limit

IMS sends automatic notifications to the System Administrator when user capacity is reached:

- **80% of limit:** Advisory notification — 'You have used 80% of your user licence'
- **95% of limit:** Warning notification — 'You are approaching your user limit'
- **100% of limit:** New user invitations are blocked until capacity is increased

## Increasing Your User Limit

To add more user licences:

1. Navigate to **Admin Console → Organisation → Licence → Request Upgrade**
2. Specify the additional users required and submit the request
3. Your IMS account manager will contact you with options and pricing

Alternatively, contact your IMS account manager directly for an expedited response.

## Deactivated Users Do Not Count

Deactivated user accounts (e.g., employees who have left) do not count against your licence limit. If you are approaching your limit, review inactive accounts: **Admin Console → Users → filter by Last Login: Never or > 90 days** and deactivate accounts that are no longer needed.

## Portal Users Are Separate

External portal users — customers accessing the Customer Portal and suppliers accessing the Supplier Portal — are counted separately from internal users and have their own licence limits and pricing. Portal user limits are also visible under **Admin Console → Organisation → Licence**.

## Service Accounts

Service accounts created for API integrations count against your user limit. Review your service accounts periodically to deactivate any that are no longer used.`,
  },
  {
    id: 'KB-FAQ2-004',
    title: 'Q: How do I delete a record in IMS?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'data-management', 'records'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: How do I delete a record in IMS?

## Why Most Records Cannot Be Permanently Deleted

IMS is designed for compliance management. Most records — incidents, audits, CAPAs, risk assessments, contracts, and others — form part of the compliance audit trail. Permanently deleting these records would undermine the integrity of your compliance history and may violate regulatory retention requirements.

## What You Can Do Instead of Deleting

**Draft records:** Records in DRAFT status that have not been submitted can be discarded. Navigate to the record → **Actions → Discard Draft**. This permanently removes the draft before it enters the compliance record.

**Active records:** Published or active records can be **Archived** or **Closed** (depending on the module). Archived records are read-only — they cannot be edited but remain accessible in searches and reports. This is the appropriate action for records that are no longer active.

**Superseded records:** Documents and procedures that have been replaced by a newer version are automatically archived — the old version is retained as a historical record.

## GDPR Right to Erasure (Personal Data Deletion)

For GDPR right-to-erasure requests regarding an individual's personal data, IMS anonymises the personal data fields (replacing names with 'Anonymised User', removing contact details and identifiers) while retaining the business record structure (dates, record types, outcomes). This satisfies the right to erasure while preserving compliance records. Submit these requests to your IMS System Administrator.

## Permanent Deletion (System Administrator Only)

For specific record types, System Administrators can permanently delete records that were created in error (e.g., a test incident, a duplicate record). Navigate to the record → **Actions → Delete** (visible only to System Administrators when deletion is permitted for that record type). This action is logged in the system audit trail and is irreversible.

## Data Purge Requests

For bulk deletion of records or full data purge (e.g., for a test environment), contact IMS support with details of the records to be purged.`,
  },
  {
    id: 'KB-FAQ2-005',
    title: 'Q: Can I customise the IMS dashboard?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'dashboard', 'customisation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: Can I customise the IMS dashboard?

## Yes — the Dashboard Is Fully Customisable

Every user can personalise their IMS dashboard to show the information most relevant to their role and daily work.

## How to Customise Your Dashboard

1. Navigate to the **Dashboard**
2. Click **Edit Layout** in the top-right corner
3. The dashboard enters edit mode — widgets can be dragged and dropped to new positions
4. Click **Add Widget** to add new widgets from the widget library
5. Resize widgets by dragging their bottom-right corner
6. Remove unwanted widgets by clicking the X on each widget
7. Click **Save Layout** when done

## Available Widget Types

| Widget Type | Description |
|---|---|
| KPI tile | Single metric with trend indicator |
| Bar chart | Category or time series comparison |
| Line chart | Trend over time |
| Donut chart | Distribution breakdown |
| Recent activity feed | Latest records added or updated in a module |
| Calendar | Upcoming due dates, audits, reviews |
| Task list | Your assigned open actions |
| Quick links | Shortcuts to frequently used pages |

## Administrator-Defined Default Dashboards

System Administrators can create organisation-wide default dashboards pushed to all users or to specific roles. These are configured at **Admin Console → Dashboards → New Default Dashboard**. Users can still personalise their layout on top of the default.

## Module Dashboards

In addition to the main dashboard, each module (H&S, Quality, Finance, etc.) has its own configurable module dashboard accessible from the module's main page. These can be configured with module-specific widgets.

## Analytics Module

The Analytics module provides the most powerful custom dashboard builder, supporting live data queries, cross-module reporting, and advanced visualisations. Available to Professional and Enterprise plan customers.

## Feature Requests

If a widget or data source you need is not available, submit a feature request via the IMS support portal — popular requests from multiple customers are prioritised.`,
  },
  {
    id: 'KB-FAQ2-006',
    title: 'Q: What happens to my data if I cancel IMS?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'data', 'offboarding', 'contracts'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: What happens to my data if I cancel IMS?

## Your Data is Yours

IMS does not hold your data hostage. When you cancel your subscription, you are provided a full data export and a structured transition period.

## The Cancellation Timeline

| Stage | Timeframe | What Happens |
|---|---|---|
| Notice period | Per your contract (typically 30 days) | IMS remains fully operational |
| Data export window | 30 days after contract end | Read-only access; full export available |
| Data retention | 60 days after export window | Data held securely, no access |
| Permanent deletion | 90 days after contract end | All data permanently deleted |

## Exporting Your Data

Use the full data export tool during the export window: navigate to **Admin Console → Data Management → Export All Data**. Select modules and export format:
- **JSON:** Full-fidelity structured export for potential re-import to another system
- **CSV:** Human-readable format for spreadsheet analysis and archiving

Large exports are generated asynchronously — a download link is emailed when ready.

## Attached Documents and Files

Binary files (PDF documents, images, video attachments) are not included in the standard JSON/CSV export. Request a separate document archive (ZIP file) from IMS support. This is included at no additional cost.

## Compliance Considerations

Before cancelling, ensure you have exported all records required under regulatory retention obligations. Key records to export: incidents, CAPA records, audit records, training records, environmental monitoring data, financial records. Store these in your own compliant archive system.

## Data Retention Certificate

IMS can provide a certificate confirming the date of data deletion upon request, useful for demonstrating compliance with data minimisation requirements.

## Reactivation

If you reactivate your IMS subscription within 90 days of cancellation, your data can be restored from the retained backup. After 90 days, all data is permanently deleted and reactivation starts with a clean account.`,
  },
  {
    id: 'KB-FAQ2-007',
    title: 'Q: How do I report a bug or request a new feature?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'support', 'feature-request'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: How do I report a bug or request a new feature?

## Reporting a Bug

### Standard Bug Report

1. Click the help icon (?) in the top-right navigation bar
2. Select **Report a Problem**
3. Describe the issue: what you were trying to do, what happened, and what you expected to happen
4. Include steps to reproduce the issue (step-by-step instructions help the IMS team recreate the problem)
5. Attach a screenshot or screen recording if possible — this is very helpful for visual or UI issues
6. Submit — you will receive a reference number for tracking

### Urgent Issues

If the bug is preventing you or your team from working (system unavailable, critical data loss, security concern), contact IMS support via **live chat** (? → Live Chat) or by phone (Priority and Enterprise customers). Escalate to the 'Critical / System Down' priority level.

## Requesting a New Feature

### Submitting a Feature Request

1. Click the help icon (?) → **Suggest a Feature**
2. Describe your use case: what business problem would this feature solve?
3. Describe the desired outcome: how should the feature work?
4. If you have examples from other tools or mockups, attach them — they help the product team understand your vision
5. Submit — you will receive a confirmation with a feature request reference number

### Tracking Your Request

All submitted feature requests are visible in the **IMS Customer Portal** (accessible from the ? menu → Customer Portal). You can track the status: Under Review, Planned, In Development, Released.

### Voting on Existing Requests

Other customers' feature requests are visible in the Customer Portal. You can vote for requests that match your own needs — popular requests with many votes are prioritised by the IMS product team.

### IMS Product Roadmap

The IMS product roadmap (planned features by quarter) is available to customers in the Customer Portal under the Roadmap tab.`,
  },
  {
    id: 'KB-FAQ2-008',
    title: 'Q: Can multiple people edit the same record at the same time?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'collaboration', 'concurrency'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: Can multiple people edit the same record at the same time?

## Optimistic Concurrency for Standard Records

IMS uses optimistic concurrency control for most record types. This means multiple users can open and read the same record simultaneously. However, when two users attempt to save changes to the same record at the same time, the following happens:

1. The first user to save their changes succeeds
2. The second user's save is rejected with a notification: 'This record has been updated by another user since you opened it. Please refresh the page to see the latest version and reapply your changes.'
3. The second user can then refresh, review the first user's changes, and re-enter their own modifications before saving again

This prevents one user's changes from silently overwriting another's.

## Document Control — Check-Out System

For documents managed in Document Control, IMS uses an exclusive check-out system:

1. A user clicks **Check Out** on a document to indicate they are editing it
2. While checked out, the document is locked — other users can view the current published version but cannot edit it
3. When editing is complete, the user checks the document back in with a new version, which then goes through the approval workflow
4. If a user forgets to check in a document, administrators can force a check-in from the document record

## Collaborative Records (CAPA, Audits)

For records with multiple sections owned by different people (e.g., a CAPA where one person completes the root cause section and another completes the corrective action section), IMS allows concurrent editing of different sections without conflict. Each section has its own save button.

## Real-Time Collaboration (Roadmap)

Simultaneous real-time editing of the same field (similar to Google Docs) is planned for a future release. This is on the IMS Q2 2026 product roadmap for selected record types.`,
  },
  {
    id: 'KB-FAQ2-009',
    title: 'Q: How do I transfer ownership of records when an employee leaves?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'user-management', 'offboarding'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: How do I transfer ownership of records when an employee leaves?

## Overview

When an employee leaves the organisation, their IMS account must be deactivated and their open records, tasks, and approvals must be reassigned to another user to ensure continuity.

## Bulk Reassignment (Recommended)

The most efficient approach when offboarding a user:

1. Navigate to **Admin Console → Users → [Departing User] → Actions → Reassign Records**
2. Select which modules to reassign (or select All)
3. Choose the new owner for each module — typically the departing person's line manager or their replacement
4. Confirm — all open records in the selected modules are transferred to the new owner

Records covered by bulk reassignment include: open incidents, active CAPAs, assigned risks, documents under review, active audits, outstanding objectives, and pending training assignments.

## Automated Reassignment Configuration

To reduce manual effort for future offboarding events, configure a default reassignment rule:

Navigate to **Admin Console → Settings → Offboarding → Default Reassignment → set to 'Assign to line manager as configured in HR'**. When this is enabled and the HR module is integrated, records are automatically reassigned to the departing person's manager when their account is deactivated.

## Pending Approval Queue

Check for any documents, requests, or records awaiting the departing user's approval:

**Admin Console → Workflows → Pending Approvals → filter by Approver: [Departing User]**

Reassign each pending approval to an appropriate alternative approver.

## Individual Record Reassignment

For records not covered by bulk reassignment, or to reassign individual records: open the record → click the owner or assignee field → search for and select the new user → save.

## After Reassignment

Once all records are reassigned, proceed with deactivating the user account: **Admin Console → Users → [User] → Deactivate**. The deactivation is immediate.`,
  },
  {
    id: 'KB-FAQ2-010',
    title: 'Q: Does IMS support offline access?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'offline', 'mobile'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: Does IMS support offline access?

## Yes — via the Native Mobile App

The IMS native mobile app (iOS and Android) supports offline access for field operations where internet connectivity may be limited or unavailable.

## Offline-Capable Features

The following features work offline in the mobile app:

- **Incident reporting:** Complete an incident report offline; it syncs when connectivity is restored
- **CMMS work order completion:** Record work completed on maintenance work orders without a connection
- **Food safety CCP monitoring:** Record temperature and other CCP measurements in the field
- **Permit to Work (read-only):** View previously downloaded permits; creating new permits requires connectivity
- **Inspections and checklists:** Complete downloaded inspection forms and checklists offline
- **Training completion:** Complete downloaded training courses offline; completion records sync when back online

## How Offline Sync Works

Data entered offline is stored securely on the device in an encrypted local database. When internet connectivity is restored, the app automatically synchronises all pending data to the IMS server. A sync status indicator in the app shows the number of records awaiting synchronisation.

## Conflict Resolution

If a record was modified both offline (on the mobile device) and online (by another user on the web) during the same period, a conflict resolution prompt is displayed when syncing. You can choose to keep the offline version, keep the online version, or view both versions side by side before deciding.

## Web Application Offline Access

The IMS web application (accessed via desktop browser) does not support offline access. An internet connection is required for the web app to function. For field use without reliable connectivity, the native mobile app is the recommended approach.

## Preparing for Offline Work

Before heading into a low-connectivity area, open the IMS mobile app while connected and navigate to the modules you will need. This ensures the latest data is cached locally for offline access.`,
  },
  {
    id: 'KB-FAQ2-011',
    title: 'Q: How do I change the language in IMS?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'language', 'localisation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: How do I change the language in IMS?

## Changing Your Personal Language Setting

Each IMS user can set their own preferred display language:

1. Click your avatar in the top-right corner
2. Select **Profile**
3. Navigate to the **Preferences** tab
4. Find the **Language** dropdown
5. Select your preferred language from the list
6. Click **Save** — the page will reload in your chosen language immediately

## Supported Languages

IMS currently supports: English (UK), English (US), French, German, Spanish, Portuguese (Brazil), Dutch, Italian, Swedish, Norwegian, Danish, Finnish, Polish, Czech, Romanian, Japanese, Chinese (Simplified), Korean, and Arabic.

## What Changes with the Language Setting

The following elements are displayed in your chosen language:
- IMS navigation menus and labels
- System-generated notifications and emails
- Status options (e.g., 'Draft', 'Published', 'Approved')
- Error messages and validation text
- Help Centre content (where available in your language)

## What Does Not Change

User-generated content is displayed in the language it was originally written in. This includes:
- Record titles, descriptions, and comments created by users
- Document names and content
- Custom field labels created by your administrator

IMS does not automatically translate user-generated content between languages.

## Organisation Default Language

Your organisation's default language (applied to all new user accounts) is set by the administrator at **Admin Console → Organisation → Locale → Default Language**. Your personal language setting overrides this default.

## Requesting a New Language

If the language you need is not available, contact IMS support to submit a language request. Languages with sufficient customer demand are prioritised for localisation in the product roadmap.`,
  },
  {
    id: 'KB-FAQ2-012',
    title: 'Q: Can I attach files to records in IMS?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'files', 'attachments'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: Can I attach files to records in IMS?

## Yes — Most Records Support File Attachments

File attachments can be added to most record types in IMS, including incidents, CAPAs, risks, audits, contracts, training records, and more. Look for the **Attachments** section at the bottom of any record form.

## Supported File Formats

| Category | Formats |
|---|---|
| Documents | PDF, .docx, .doc, .xlsx, .xls, .pptx, .ppt |
| Images | PNG, JPG/JPEG, GIF, WebP, TIFF |
| Video | MP4, MOV, AVI (max 500 MB per file) |
| Audio | MP3, WAV |
| Compressed | ZIP (contents must be permitted file types) |

## File Size Limits

- **Standard files:** Maximum 25 MB per file
- **Video files:** Maximum 500 MB per file
- **Total per record:** No fixed limit (subject to your organisation's storage allocation)

## Storage Limit

Your total storage allocation depends on your licence tier. View current usage at **Admin Console → System → Health → Storage Usage**. You will be notified at 80% and 95% of your storage limit.

## File Security and Compliance

All uploaded files are encrypted at rest and in transit. Files attached to records are included in the record's audit trail — the filename, upload date, and uploading user are recorded. Attached files are included in data exports and evidence packs generated from records.

## Document Control vs Attachments

For documents that require version control, approval workflows, and controlled distribution, use the **Document Control** module rather than record attachments. Record attachments are for supporting evidence (photographs, signed forms, test results) rather than controlled documents.

## Viewing and Downloading Attachments

Attachments can be viewed inline (images and PDFs open in the browser) or downloaded. All users with access to the record can access its attachments, subject to their module access level.`,
  },
  {
    id: 'KB-FAQ2-013',
    title: 'Q: How do I set up email notifications for my team?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'notifications', 'email'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: How do I set up email notifications for my team?

## Two Methods for Team Notifications

### Method 1: Admin-Configured Notification Rules (Recommended)

Administrators can create system-wide notification rules that apply to all users in a specified role or department, without requiring each user to configure their own settings.

1. Navigate to **Admin Console → Notifications → Rules → New Rule**
2. Select the **trigger event** (e.g., 'New Incident Reported', 'CAPA Overdue', 'Document Awaiting Approval')
3. Select the **recipients:** by role (e.g., all H&S Managers), by department (e.g., all users in the Quality department), or specific named users
4. Choose the **delivery channel:** email, in-app notification, or both
5. Optionally set a **filter** (e.g., only notify for MAJOR severity incidents or above)
6. Activate the rule

### Method 2: Individual User Notification Preferences

Each user can configure their own notification preferences for events they care about:

1. Navigate to **Profile (avatar) → Notifications**
2. For each notification type, choose: Email, In-App, Both, or None
3. Note: administrators may restrict certain notification types to be mandatory (cannot be turned off by the user)

## Notification Digest Option

To reduce email volume, users can switch from real-time notifications to a **daily digest**. This collects all notifications from the day and sends a single summary email at a configured time (default: 8:00 AM). Set this at **Profile → Notifications → Delivery Preference → Daily Digest**.

## Team Distribution Groups

Create email distribution groups for common notification recipients: **Admin Console → Users → Groups → New Group → add users**. These groups can then be selected as notification recipients in any notification rule, simplifying management.

## Microsoft Teams and Slack

For teams that prefer to receive notifications in their collaboration tools rather than email, see KB-IG-023 (Teams) and KB-IG-024 (Slack) integration guides.`,
  },
  {
    id: 'KB-FAQ2-014',
    title: 'Q: What is the difference between a CAPA and a Corrective Action?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'capa', 'quality', 'definitions'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: What is the difference between a CAPA and a Corrective Action?

## Definitions

**Corrective Action (CA):** An action taken to eliminate the cause of a nonconformity or other undesirable situation that has already occurred, to prevent its recurrence.

**Preventive Action (PA):** An action taken to eliminate the cause of a potential nonconformity or other undesirable situation that has not yet occurred, to prevent its occurrence.

**CAPA (Corrective and Preventive Action):** A combined process that addresses both aspects. In IMS and most quality management systems, 'CAPA' is used as an umbrella term that encompasses the full cycle from problem identification through to verified prevention of recurrence.

## The Complete CAPA Lifecycle in IMS

A full CAPA record in IMS includes:

1. **Problem statement:** What was the nonconformity, incident, or concern?
2. **Immediate containment action:** What was done straight away to stop the problem spreading or affecting more people? (This is sometimes called a 'correction', not a corrective action)
3. **Root cause investigation:** Using methods such as 5-Why, fishbone (Ishikawa), or fault tree analysis — what was the fundamental cause?
4. **Corrective action:** What was changed to eliminate that root cause?
5. **Preventive action:** What was done to prevent a similar issue occurring in a related process or area?
6. **Effectiveness verification:** How was it confirmed that the corrective and preventive actions actually worked?

## The Key Distinction

The most important distinction is between a **correction** (fixing the immediate symptom — patch the leak) and a **corrective action** (fixing the root cause — replacing the corroded pipe and changing the maintenance inspection frequency). True CAPAs address root causes, not just symptoms.

Near-misses and hazards may generate a Preventive Action without any prior occurrence — preventing the event from happening in the first place. This is a pure preventive action with no corrective element.`,
  },
  {
    id: 'KB-FAQ2-015',
    title: 'Q: How do I access IMS from outside the office?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'remote-access', 'security'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: How do I access IMS from outside the office?

## IMS Is a Cloud-Based System

IMS is hosted in the cloud and is designed to be accessed from any location with an internet connection. There is no software to install and no VPN required for standard access.

## How to Access IMS Remotely

Simply open any modern web browser (Chrome, Firefox, Edge, Safari) on any device and navigate to your organisation's IMS URL (e.g., 'yourcompany.ims.io'). Log in with your usual credentials or SSO account. The experience is identical to accessing IMS from the office.

## Security on Remote Access

IMS protects your organisation's data regardless of where you access it from:

- All connections use HTTPS (TLS encryption) — your data is encrypted in transit
- JWT authentication tokens expire after a configurable period, requiring re-login
- If your admin has enabled MFA, you must complete MFA even from remote locations
- Session timeouts apply the same way remotely as in the office

## When VPN Is Required

In some organisations, the IMS administrator has enabled **IP whitelisting** — restricting access to specific IP address ranges. If this is in place and you are accessing IMS from a home network or public WiFi, you may be blocked with an 'Access restricted' message.

**If you are blocked by IP whitelisting:**
1. Connect to your company VPN (if you have one) — your traffic will exit via the corporate IP and be allowed
2. Contact your IMS administrator to add your home IP to the allowed list (if appropriate)

## Best Practices for Remote Access Security

- Use a personal device password or PIN lock to prevent unauthorised access if your device is lost
- Do not access IMS from public computers (library PCs, hotel business centres) where your session may be retained
- Enable MFA on your account if your organisation allows it but does not enforce it
- Log out of IMS when finished on shared or public devices`,
  },
  {
    id: 'KB-FAQ2-016',
    title: 'Q: Can I copy or clone an existing record?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'records', 'clone', 'copy'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: Can I copy or clone an existing record?

## Record Cloning Is Available for Several Record Types

Cloning allows you to create a new record pre-populated with the content of an existing record, saving time when creating similar records. Cloning is supported for the following record types:

| Module | Clone Use Case |
|---|---|
| Risk assessments | Clone a similar risk for a related hazard or location |
| Audit checklists | Copy a checklist for a similar audit at a different site |
| Document templates | Create a variation of an existing document template |
| CAPA actions | Repeat a similar corrective action across multiple departments |
| Training plans | Create a similar plan for a related job role |
| PTW permits | Clone a similar permit as a starting point for a new job |
| Contracts | Use a contract as a template for a similar agreement |
| Inspection forms | Create similar inspections for related equipment types |

## How to Clone a Record

1. Open the record you wish to clone (the source record)
2. Click **Actions** (usually in the top-right of the record)
3. Select **Clone** (or 'Copy' — the label may vary by module)
4. A new draft record is created immediately with all fields pre-populated from the source record
5. Update the fields that should differ (title, date, location, assignee, etc.)
6. Save the new record

## What Is Copied vs What Is Not Copied

**Copied from source:** All content fields (description, hazard details, control measures, checklist questions, terms and conditions text)

**Not copied from source:** Status (always starts as Draft), dates (always reset to today), attachments (not cloned — re-attach if needed), audit trail and history, approval records

## If Cloning Is Not Available

If the Clone option does not appear in the Actions menu for a record type you need, cloning for that module may not yet be implemented. Submit a feature request via ? → Suggest a Feature.`,
  },
  {
    id: 'KB-FAQ2-017',
    title: 'Q: How does IMS handle version control for documents?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'documents', 'version-control'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: How does IMS handle version control for documents?

## Version Numbering System

IMS Document Control uses a standard major.minor version numbering system that clearly distinguishes working drafts from approved, published documents:

| Version Range | Meaning | Example |
|---|---|---|
| 0.1, 0.2, 0.3... | Working draft — not yet approved | 0.3 (third draft) |
| 1.0 | First approved and published version | 1.0 (published) |
| 1.1, 1.2... | Minor revisions to published document | 1.1 (minor update) |
| 2.0 | Second major revision, fully reviewed and approved | 2.0 (major revision) |

## The Document Lifecycle

1. **Draft (0.x):** Document created and edited in draft state. Multiple reviewers may suggest changes. Each save of a draft increments the minor version.
2. **Review:** Draft submitted for formal review. Reviewers provide comments and approve or request changes.
3. **Published (1.0, 2.0...):** Approved document published as a controlled copy. The document is distributed to relevant users and linked to relevant records.
4. **Superseded:** When a new version is published, the previous version is automatically archived.
5. **Archived:** Historical versions retained permanently. Cannot be edited or deleted.

## Revision History

Every document shows its complete revision history in the **History** tab: version number, approval date, approved by, and the change log entry for each revision.

## Change Log Requirement

When creating a new revision of a published document, the author must complete a change log entry explaining what changed and why. This is required before the revision can be submitted for review.

## Permanent Version Retention

All previous versions of a document are retained permanently. This is a compliance requirement — regulators and auditors may need to see the version of a procedure that was in effect at a specific point in time. Versions cannot be deleted.

## Controlled Copy Distribution

When a document is published, IMS automatically distributes a notification to linked module users. When the document is revised, users are notified that a document they reference has been updated.`,
  },
  {
    id: 'KB-FAQ2-018',
    title: 'Q: How do I add a new legal requirement to the register?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'legal-register', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: How do I add a new legal requirement to the register?

## Accessing the Legal Register

The legal requirements register is accessible from multiple modules depending on which applies to the legislation:

- **H&S Legal Register:** Health & Safety → Legal Requirements
- **Environmental Legal Register:** Environmental → Legal Compliance
- **Centralised Regulatory Monitor:** Regulatory Monitor → Legal Register

## Adding a New Requirement

1. Navigate to the appropriate legal register and click **New Requirement**
2. Complete the required fields:

| Field | Description |
|---|---|
| Legislation name | The full name of the law, regulation, or standard |
| Reference number | The official reference (e.g., '2013 No. 1471', 'ISO 45001:2018') |
| Jurisdiction | Country, state, or region this applies to |
| Brief description | Summary of what the legislation requires your organisation to do |
| Applicable processes | Which of your processes or activities are subject to this requirement |
| Compliance status | Compliant / Non-compliant / Partially compliant / Not yet assessed |

3. Save the requirement

## Adding Evidence of Compliance

Link documents that demonstrate compliance with the requirement: scroll to the **Evidence** section → **Add Document** → search for the document in Document Control (e.g., procedure, risk assessment, training record, permit).

## Assigning an Owner and Review Frequency

Assign an owner who is responsible for monitoring changes to this legislation and maintaining compliance evidence. Set a review frequency (e.g., annually, or when the legislation is updated). The owner will receive a reminder when the review is due.

## Automated Regulatory Monitoring

Instead of manually monitoring legislation changes, link the legal requirement to a Regulatory Monitor feed for the relevant category. When the feed detects an update to the legislation, the owner is automatically notified and the compliance status is reset to 'Pending Review'.

## Bulk Import

If you have an existing legal register in a spreadsheet, contact IMS support for assistance with a bulk import using the CSV import template.`,
  },
  {
    id: 'KB-FAQ2-019',
    title: 'Q: Can IMS generate reports automatically on a schedule?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'reporting', 'scheduled-reports', 'automation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: Can IMS generate reports automatically on a schedule?

## Yes — Any Report Can Be Scheduled

IMS supports scheduled automatic report generation and distribution for any report in the Analytics module, eliminating the need to manually run and email reports on a recurring basis.

## How to Schedule a Report

1. Navigate to **Analytics → Reports**
2. Open or create the report you want to schedule
3. Click **Schedule** in the report toolbar
4. Configure the schedule:

| Setting | Options |
|---|---|
| Frequency | Daily, Weekly, Monthly, Quarterly, Annually |
| Day | Specific day of week/month |
| Time | The time the report is generated (uses the organisation's default timezone) |
| Recipients | Individual users, user groups, or external email addresses |
| Format | PDF, Excel (.xlsx), CSV |

5. Click **Activate Schedule**

## Managing Scheduled Reports

All scheduled reports are listed at **Analytics → Scheduled Reports**. From this list you can:
- View the next scheduled run date
- Pause or resume a schedule without deleting it
- Edit the schedule settings, recipients, or format
- Delete a schedule (the underlying report is not affected)
- View the history of past report runs and download any previously generated report

## Failure Notifications

If a scheduled report fails to generate (e.g., due to a data query error), the System Administrator is notified automatically with details of the failure. The schedule continues to run at its next configured interval.

## Management Review Packs

Management review packs are a common use case for scheduled reports. Configure a monthly report that consolidates H&S KPIs, quality metrics, environmental performance, and open action items, then distribute automatically to the leadership team on the first working day of each month.

## Report Archive

All generated scheduled reports are automatically stored in the report archive (**Analytics → Report Archive**) for 3 years, providing a historical record of management information as it was reported at the time.`,
  },
  {
    id: 'KB-FAQ2-020',
    title: 'Q: What support options are available for IMS?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'support', 'help'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Q: What support options are available for IMS?

## In-App Help Resources

The quickest way to get help is within IMS itself. Click the help icon (?) in the top-right corner to access:

- **Help Centre (Knowledge Base):** Searchable articles covering all modules (this document is part of the Help Centre)
- **Video tutorials:** Short how-to videos for common tasks
- **Interactive product tours:** Step-by-step guided tours of key features, available for each module from the (?) menu
- **Keyboard shortcut reference:** Press Ctrl+/ (Cmd+/ on Mac) anywhere in IMS

## Live Chat Support

Live chat with the IMS support team is available during business hours: **Monday to Friday, 8:00 AM – 6:00 PM GMT**.

Access live chat: click (?) → **Live Chat**. Typical response time: under 3 minutes during business hours.

## Email Support

For non-urgent issues or detailed questions, email support@ims.io. Typical response times:
- **Standard issues:** Within 4 business hours
- **Critical issues (system unavailable, data concerns):** Within 1 hour

When emailing, include your organisation name, the affected module, a description of the issue, and any screenshots or error messages.

## Phone Support

Phone support is available for **Priority and Enterprise plan customers**. Your support phone number is available at **Admin Console → Organisation → Licence → Support Contact**.

## Dedicated Customer Success Manager

**Enterprise plan customers** are assigned a dedicated Customer Success Manager (CSM). Your CSM provides proactive support including quarterly business reviews, product roadmap previews, and best practice guidance tailored to your organisation's use of IMS.

## Community Forum

Connect with other IMS users at **ims.io/community**. The community forum is a peer-to-peer support space where users share tips, integrations, and workflows. IMS product team members also participate regularly.

## Professional Services

For implementation support, data migration from a legacy system, custom training delivery, or advanced configuration, IMS Professional Services provides expert consulting. Contact your account manager for a Professional Services scope and quote.`,
  },
];
