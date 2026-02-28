import type { KBArticle } from '../types';

export const faq3Articles: KBArticle[] = [
  {
    id: 'KB-FAQ3-001',
    title: 'Can I use IMS on my mobile device?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'mobile', 'access'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Can I use IMS on my mobile device?

## Question

Can IMS be accessed from a smartphone or tablet?

## Answer

Yes. IMS is a responsive web application that works in any modern browser on iOS or Android devices. Open your mobile browser, navigate to your IMS URL, and log in as normal. The interface adapts automatically to smaller screen sizes.

For Field Service Engineers, a dedicated mobile app is available with offline sync capability. The Field Service app allows you to complete work orders, log inspections, capture photos, and obtain signatures without an active internet connection. Data syncs automatically when connectivity is restored.

## Additional Detail

**Tips for the best mobile browser experience:**

- Add IMS to your Home Screen (iOS: Share → Add to Home Screen; Android: Browser menu → Add to Home Screen) for a full-screen, app-like experience.
- Use landscape orientation for data-heavy screens such as dashboards and record tables.
- The Command Palette (Cmd+K or long-press search icon) works on mobile and provides fast navigation.
- Complex forms (such as CAPA or audit forms) may be easier to complete on a tablet than a phone.

**Field Service mobile app features:**

- Offline work order completion
- Signature capture
- Photo attachment
- GPS location tagging
- Barcode/QR code scanning for asset identification
- Push notifications for new job assignments

Download the Field Service app from the Apple App Store or Google Play Store. Log in with your IMS credentials.

## Related Articles

- Field Service Module Guide
- Offline Sync Troubleshooting
`,
  },
  {
    id: 'KB-FAQ3-002',
    title: 'How do I reset my password?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'auth', 'password'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# How do I reset my password?

## Question

I have forgotten my IMS password. How do I reset it?

## Answer

1. Go to the IMS login page.
2. Click **Forgot Password** below the login button.
3. Enter your work email address and click **Send Reset Link**.
4. Check your inbox for an email from IMS with the subject "Password Reset Request". The reset link is valid for **15 minutes**.
5. Click the link in the email, enter your new password twice, and click **Reset Password**.
6. You will be redirected to the login page. Log in with your new password.

If you do not receive the email within a few minutes, check your spam or junk folder. If it is still not there, contact your IMS administrator who can trigger a password reset from the Admin Console.

## Additional Detail

**Password requirements:** IMS passwords must be at least 12 characters long and contain a mix of uppercase letters, lowercase letters, numbers, and at least one special character.

**If SSO is enabled:** If your organisation uses Single Sign-On (Azure AD, Okta, or another provider), the Forgot Password option on the IMS login page will not be available. Your password is managed by your identity provider. Contact your IT helpdesk to reset your password in the identity provider system.

**Locked accounts:** After 5 consecutive failed login attempts, your account is locked for 15 minutes. After the lockout period, you may try again or use the Forgot Password flow.

**Admin reset:** An administrator can reset your password or unlock your account immediately from **Admin Console → Users → [Your Name] → Reset Password**.

## Related Articles

- Setting Up Multi-Factor Authentication
- SSO Login Guide
- Admin User Management Guide
`,
  },
  {
    id: 'KB-FAQ3-003',
    title: 'Can multiple users edit the same record simultaneously?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'collaboration', 'editing'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Can multiple users edit the same record simultaneously?

## Question

What happens if two users try to edit and save the same record at the same time?

## Answer

IMS uses **optimistic locking** to handle simultaneous edits on standard records (incidents, CAPAs, risks, actions, etc.).

When two users open the same record:

1. Both can edit freely without seeing a lock indicator.
2. When the **first user saves**, the record is updated and a new version timestamp is written.
3. When the **second user tries to save**, IMS detects that the record has changed since they opened it and shows a **conflict warning**.
4. The second user is presented with a **diff view** showing exactly which fields differ between their version and the saved version.
5. The second user can choose to: keep their changes (overwriting the first user's save), keep the saved version (discarding their edits), or manually merge the two versions field by field.

**Documents use a different model — check-out/check-in:**

For controlled documents in the Document Control module, a user must explicitly **check out** a document before editing. While the document is checked out, other users can view the current version but cannot edit it. The document is locked until it is checked back in or the checkout is released by an administrator. This prevents conflicts entirely for formal documents.

## Additional Detail

The optimistic locking approach is chosen for operational records because it avoids workflow blockage — a user who forgets to check something out cannot prevent colleagues from working. The conflict resolution UI makes it straightforward to merge changes in most practical cases.

For real-time collaborative editing on documents (similar to Google Docs), this is on the product roadmap as part of the Q2 2026 collaboration engine.

## Related Articles

- Document Control Check-Out / Check-In Guide
- Conflict Resolution in Record Edits
`,
  },
  {
    id: 'KB-FAQ3-004',
    title: 'How long does data stay in the system?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'data-retention', 'compliance'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# How long does data stay in the system?

## Question

How long is data retained in IMS before it is deleted or archived?

## Answer

Data retention periods in IMS are **configurable per record type** via **Admin → Data Retention Settings**. The default values align with common regulatory requirements:

| Record Type | Default Retention |
|---|---|
| Incidents | 7 years |
| CAPAs | 7 years |
| Training records | 5 years |
| Financial records | 7 years |
| Audit records | 7 years |
| Environmental monitoring | 5 years |
| Document versions | 10 years (or per policy) |
| Login and audit trail | 3 years |

These defaults can be adjusted by an administrator to match your organisation's legal obligations and internal policies.

## Additional Detail

**Archiving vs deletion:** When a record reaches its retention period, it moves to an **archived** state rather than being immediately deleted. Archived records remain searchable and accessible via the archive view but are excluded from active module views and dashboards. This ensures you can still access historical data if needed.

**Legal hold:** Records subject to an active legal hold are exempt from automatic archiving and deletion, regardless of their retention period. Legal holds are managed under **Admin → Legal Holds**.

**Deletion:** Records can be permanently deleted after they have been archived and after any applicable legal hold has been lifted. Permanent deletion is a two-step process requiring admin approval, and a deletion log is maintained in the audit trail.

**Regulatory tailoring:** If you operate in multiple jurisdictions, different retention rules can apply to different sites or legal entities within IMS.

## Related Articles

- Configuring Data Retention Policies
- Legal Hold Management Guide
- GDPR Compliance Using IMS
`,
  },
  {
    id: 'KB-FAQ3-005',
    title: 'What happens to our data if we cancel our subscription?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'data', 'offboarding'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# What happens to our data if we cancel our subscription?

## Question

If we stop using IMS, what happens to all the data we have entered?

## Answer

Following cancellation of your IMS subscription:

1. **Immediate:** Your IMS environment enters a **read-only grace period** for 30 days. You can log in, view all records, and export data, but no new records can be created or existing records edited.
2. **During the 30-day grace period:** Use **Settings → Data Export** to download your data in CSV or JSON formats for each module. A full-organisation export package is also available as a ZIP file containing all modules.
3. **After 30 days:** Your organisation's data is **permanently and irreversibly deleted** from IMS servers in accordance with GDPR Article 17 (right to erasure). A deletion confirmation certificate is emailed to your account administrator.

## Additional Detail

**What data export includes:**

- All module records (incidents, CAPAs, risks, training, documents, etc.) in CSV and JSON
- Document files (PDF, Word, Excel attachments) in their original formats
- User list and role assignments
- Configuration settings

**What is not included in export:**

- Audit trail logs (available on request during the grace period)
- System-generated analytics data

**Enterprise customers:** Enterprise customers can negotiate extended grace periods and custom data return formats as part of their contract terms. Contact your Customer Success Manager before cancelling.

**Recommendation:** We recommend scheduling a data export as soon as cancellation is confirmed rather than waiting until the end of the grace period.

## Related Articles

- Data Export Guide
- GDPR Compliance Using IMS
- Configuring Data Retention Policies
`,
  },
  {
    id: 'KB-FAQ3-006',
    title: 'Can I import data from my existing systems?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'import', 'migration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Can I import data from my existing systems?

## Question

We are migrating to IMS from another system. Can we import our historical data?

## Answer

Yes. Every module in IMS includes a **CSV import** function accessible from the module's main list view via the **Import** button (or **Actions → Import**).

**How to use CSV import:**

1. Click **Import** in the relevant module.
2. Download the **CSV template** for that module — this shows you the exact column names and accepted values.
3. Populate the template with your data. Follow the notes in the template for required fields, date formats, and enumeration values.
4. Upload the completed CSV file.
5. IMS runs a validation pass and highlights any rows with errors.
6. Fix errors and re-upload, or proceed with valid rows only (invalid rows are skipped and logged).
7. Confirm the import. Imported records are created with a source tag of "Imported" for easy identification.

**Supported import modules include:** Incidents, CAPAs, Risks, Assets, Suppliers, Training records, Audit findings, Complaints, Contracts, Chemicals register, and most other primary record types.

## Additional Detail

**Large or complex migrations:** For organisations migrating large volumes of data, complex data relationships, or data from systems with non-standard formats, a **professional services engagement** is available. The IMS professional services team can handle:

- Custom data mapping and transformation scripts
- Data cleansing and deduplication
- Historical document migration
- Parallel running validation

Contact your account manager to discuss a professional services engagement. Typical migration projects take 2–8 weeks depending on data volume and complexity.

**API import:** For automated or recurring imports, the IMS REST API supports bulk record creation. See the API Integration Guide for details.

## Related Articles

- Data Export Guide
- Using the IMS REST API
- Getting Started with IMS
`,
  },
  {
    id: 'KB-FAQ3-007',
    title: 'Does IMS integrate with Microsoft 365?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'integration', 'microsoft-365', 'azure'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Does IMS integrate with Microsoft 365?

## Question

We use Microsoft 365 across our organisation. What integrations are available between IMS and the M365 ecosystem?

## Answer

Yes. IMS offers several integrations with the Microsoft 365 ecosystem:

| M365 Product | IMS Integration | Benefit |
|---|---|---|
| Azure Active Directory | SSO + SCIM user provisioning | Single sign-on; automatic user creation/deactivation |
| Microsoft Teams | Notifications + approvals | IMS alerts in Teams channels; approve actions via Adaptive Cards |
| SharePoint | Document sync | IMS controlled documents mirrored to SharePoint libraries |
| Outlook Calendar | Audit & review scheduling | IMS audit/review events added to Outlook calendars |
| Power BI | Custom reporting | Connect Power BI to IMS data for custom dashboards |

## Additional Detail

**Azure AD SSO:** Configure Azure AD as a SAML 2.0 identity provider for IMS. Users log in with their Microsoft credentials — no separate IMS password required. Group membership in Azure AD can be mapped to IMS roles. See the Azure AD Integration Guide for full configuration steps.

**Teams notifications:** Create a Webhook in your Teams channel and paste the URL into **IMS Admin → Integrations → Microsoft Teams**. Select which event types trigger notifications (new incidents, overdue actions, management review invites, etc.).

**SharePoint document sync:** Documents approved in IMS Document Control can be automatically synced to a designated SharePoint library. This allows users who primarily work in SharePoint to access current controlled documents without needing to log into IMS separately.

**Outlook calendar:** When an audit or management review is scheduled in IMS, an Outlook calendar invitation is automatically sent to all assigned participants. Accepted/declined responses are reflected in the IMS event record.

Full configuration instructions for each integration are in the Integration Guides section of this Knowledge Base.

## Related Articles

- Integrating IMS with Azure Active Directory
- Integrating IMS with Microsoft Teams
- Integrating IMS with Power BI
`,
  },
  {
    id: 'KB-FAQ3-008',
    title: 'Can we customise the reference number format?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'reference-numbers', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Can we customise the reference number format?

## Question

The default IMS reference numbers (e.g. INC-2026-001) do not match our internal numbering convention. Can we change the format?

## Answer

Yes. Reference number formats are configurable per module under **Admin → Reference Numbers**.

For each module you can configure:

- **Prefix** — the alphabetic code at the start (e.g. 'INC', 'CAPA', 'NCR', or your own custom prefix)
- **Year inclusion** — whether the current year is embedded in the reference (e.g. '2026'); can be full 4-digit, 2-digit, or omitted
- **Separator character** — the character between segments (dash '-', slash '/', underscore '_', or none)
- **Counter length** — how many digits the sequential counter uses (e.g. 3 digits = 001, 4 digits = 0001)
- **Counter reset period** — whether the counter resets annually, never, or per site

**Example configurations:**

| Setting | Result |
|---|---|
| Prefix: INC, Year: 4-digit, Sep: -, Counter: 3 | INC-2026-001 |
| Prefix: INC, Year: none, Sep: /, Counter: 5 | INC/00001 |
| Prefix: SAFE, Year: 2-digit, Sep: _, Counter: 4 | SAFE_26_0001 |

## Additional Detail

**Important:** Reference number format changes apply to **new records only**. Existing records retain their original reference numbers. If you need to renumber historical records (e.g. during a system migration), this is a professional services engagement.

**Multi-site numbering:** If your organisation has multiple sites, you can optionally include a site code in the reference number (e.g. 'LON-INC-2026-001' for London site incidents). This is configured per module per site under **Admin → Sites → [Site] → Reference Numbers**.

**Uniqueness:** IMS guarantees that reference numbers are unique within each module, regardless of the format chosen.

## Related Articles

- Admin Configuration Guide
- Multi-Site Setup Guide
`,
  },
  {
    id: 'KB-FAQ3-009',
    title: 'How many users can we have?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'users', 'licensing'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# How many users can we have?

## Question

Is there a limit to how many user accounts we can create in IMS?

## Answer

The maximum number of active user accounts depends on your subscription tier. To check your current limits:

1. Navigate to **Admin Console → License**.
2. The License page shows your subscription tier, user limit, current active user count, and renewal date.

If you are approaching your user limit, contact your account manager to upgrade your subscription or purchase additional user seats.

## Additional Detail

**What counts as a user:**

- Any active named user account that can log into IMS counts toward your user limit.
- Deactivated/suspended user accounts do **not** count against the limit.

**Service accounts:** API-only integration accounts (service accounts used for programmatic access via API keys) do **not** count against the user limit.

**Portal users:** Customer Portal and Supplier Portal users are licensed separately from internal IMS users. Check your License page for portal user allowances.

**Concurrent users vs named users:** IMS licenses are based on named users (unique accounts), not concurrent sessions. A named user can log in from multiple devices simultaneously without additional cost.

**Subscription tiers:**

| Tier | Named Users | Portal Users |
|---|---|---|
| Starter | Up to 25 | Up to 50 |
| Professional | Up to 100 | Up to 200 |
| Enterprise | Unlimited | Unlimited |

Contact your account manager for current pricing and to discuss your requirements.

## Related Articles

- Admin User Management Guide
- Customer Portal Configuration
- Supplier Portal Configuration
`,
  },
  {
    id: 'KB-FAQ3-010',
    title: 'Is our data backed up?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'backup', 'disaster-recovery'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Is our data backed up?

## Question

How is IMS data backed up, and what are the recovery capabilities if something goes wrong?

## Answer

Yes. IMS performs automated backups on the following schedule:

| Backup Frequency | Retention |
|---|---|
| Every 4 hours (continuous backup) | 7 days |
| Daily snapshot | 30 days |
| Weekly snapshot | 12 months |

Backups are stored in **geographically separated** storage locations to protect against regional infrastructure failures.

**Recovery targets:**

- **Recovery Point Objective (RPO):** 4 hours — in a worst-case scenario, you may lose up to 4 hours of data.
- **Recovery Time Objective (RTO):** 4 hours — the system can be restored to a working state within 4 hours of a declared disaster.

## Additional Detail

**Monitoring backup status:** Administrators can view the status of the most recent backup under **Admin → System Health → Backup Status**. An alert is raised if a scheduled backup fails.

**Point-in-time recovery:** For Enterprise customers, point-in-time recovery (PITR) is available, allowing restoration to any specific minute within the continuous backup window (last 7 days). This is useful for recovering from accidental bulk data deletion.

**Restore process:** To initiate a restore, contact IMS Support. Self-service restore is available for Enterprise customers from the Admin Console. Restores can target the entire organisation database or specific modules.

**Disaster recovery testing:** IMS conducts formal disaster recovery tests quarterly. Test results and RTO/RPO achievement are documented and available to Enterprise customers on request as part of the security documentation pack.

**Your responsibilities:** The backup service described covers your IMS-hosted data. If you have integrated IMS with on-premises systems, backup of those systems remains your responsibility.

## Related Articles

- System Health Monitoring Guide
- Business Continuity Planning in IMS
`,
  },
  {
    id: 'KB-FAQ3-011',
    title: 'Can IMS send automatic reminders for overdue actions?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'notifications', 'reminders', 'automation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Can IMS send automatic reminders for overdue actions?

## Question

Can IMS automatically notify users when their assigned actions are approaching their due date or are overdue?

## Answer

Yes. IMS has a configurable reminder and escalation system for all action and task types across modules (CAPAs, corrective actions, audit findings, management review actions, training due dates, permit-to-work expiries, etc.).

To configure reminders, navigate to **Admin → Notifications → Reminder Rules** and select the relevant record type.

Available reminder triggers:

- X days **before** the due date (e.g. 14 days, 7 days, 3 days before)
- **On** the due date
- X days **after** the due date (overdue escalation)
- Weekly digest of all overdue items

For each reminder, you can configure:

- Who receives the reminder: the assignee, the assignee's manager, the record owner, a specific role
- Delivery channel: in-app notification, email, or both
- Whether to escalate if the reminder is not acknowledged within a defined period

## Additional Detail

**Module-specific reminder settings:** Each module can have its own reminder schedule. For example, you may want daily reminders for overdue safety actions but weekly reminders for overdue training items.

**Bulk configuration:** Use the **Notification Templates** section to create a named template (e.g. "Standard CAPA Reminders") and apply it to multiple record types at once, rather than configuring each individually.

**Personal preferences:** Individual users can adjust their personal notification preferences under **Profile → Notifications**, within the bounds set by the administrator. For example, a user might switch from email to in-app only for low-priority reminders.

**Microsoft Teams / Slack:** If Teams or Slack integration is configured, reminders can also be delivered to the user's Teams or Slack DM.

## Related Articles

- Notification Configuration Guide
- Integrating IMS with Microsoft Teams
- Integrating IMS with Slack
`,
  },
  {
    id: 'KB-FAQ3-012',
    title: 'How does the AI assistant work?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'ai', 'assistant', 'nlq'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# How does the AI assistant work?

## Question

What is the AI assistant in IMS and what can it do?

## Answer

IMS includes a **Natural Language Query (NLQ) assistant** accessible via the chat icon in the bottom-right corner of any IMS screen (or by pressing Cmd+K / Ctrl+K and typing a question).

You can ask questions in plain English, such as:

- "How many open incidents do we have this month?"
- "Show me overdue CAPA actions assigned to the Quality team"
- "What is our lost time injury frequency rate for the last 12 months?"
- "List all suppliers with a risk rating of High or Critical"
- "Which environmental aspects are rated as significant?"

The AI assistant interprets your question, queries the IMS database, and returns a structured result — a table, chart, count, or summary — directly in the chat window.

## Additional Detail

**What the AI assistant can do:**

- Query data across all IMS modules using natural language
- Summarise trends (e.g. "incident trend over the last 6 months")
- Generate quick reports on demand
- Navigate you to the correct module or record ("Open incident INC-2026-042")
- Explain IMS features and how to use them

**What the AI assistant cannot do:**

- Create, edit, or delete records — it is **read-only**
- Access data from external systems (only data in IMS)
- Provide legally binding compliance interpretations

**Data access:** The AI assistant respects your IMS permissions. It only returns data from modules and records you are authorised to view.

**AI model:** The NLQ engine combines a structured query interpreter with a large language model. Responses are grounded in your actual IMS data, not generated from the model's training data.

**Improving the assistant:** If the assistant gives an incorrect or unexpected result, use the thumbs-down button to flag it. Flagged queries are reviewed to improve accuracy.

## Related Articles

- Natural Language Query User Guide
- Keyboard Shortcuts and Command Palette Guide
`,
  },
  {
    id: 'KB-FAQ3-013',
    title: 'Can we have different branding for different portals?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'branding', 'customisation', 'portals'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Can we have different branding for different portals?

## Question

We want our Customer Portal and Supplier Portal to look different from each other and from the internal IMS application. Is this possible?

## Answer

Yes. The **Customer Portal** and **Supplier Portal** each have independent branding configurations. These are managed separately from the internal IMS admin branding settings.

**Per-portal branding options:**

- Logo (upload PNG or SVG, max 2MB)
- Primary colour and accent colour
- Welcome message on the login page
- Custom login page background image
- Portal display name (e.g. "ACME Supplier Hub" instead of "IMS Supplier Portal")
- Support contact details displayed in the portal footer

**Where to configure:**

- Customer Portal branding: **Admin → Customer Portal → Branding**
- Supplier Portal branding: **Admin → Supplier Portal → Branding**
- Internal IMS branding: **Admin → Organisation → Branding**

## Additional Detail

**The internal IMS admin application** uses your organisation's primary logo in the top-left navigation. The overall colour scheme for the internal app follows the IMS standard design system and is not fully customisable to maintain usability consistency for internal users.

**Custom domain:** Each portal can be configured to serve from a custom subdomain (e.g. 'suppliers.yourcompany.com' instead of 'yourcompany.ims.app/suppliers'). Custom domain configuration requires a DNS CNAME record to be set up by your IT team. Contact IMS Support to enable custom domain for your portals.

**White labelling:** Enterprise customers can request full white-labelling (removal of IMS branding from portals entirely). This is available as an add-on. Contact your account manager.

## Related Articles

- Customer Portal Configuration Guide
- Supplier Portal Configuration Guide
- Custom Domain Setup
`,
  },
  {
    id: 'KB-FAQ3-014',
    title: 'What standards does IMS support?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'standards', 'compliance', 'iso'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# What standards does IMS support?

## Question

Which management system standards and regulatory frameworks does IMS support?

## Answer

IMS is aligned to a broad range of international standards and regulatory frameworks. Supported standards include:

**Quality Management:**
- ISO 9001:2015 — Quality Management Systems
- IATF 16949 — Automotive Quality Management
- AS9100 Rev D — Aerospace Quality Management
- ISO 13485 — Medical Device Quality Management

**Health, Safety & Environment:**
- ISO 45001:2018 — Occupational Health & Safety
- ISO 14001:2015 — Environmental Management
- ISO 50001:2018 — Energy Management
- OSHA 300 Log (USA)

**Information Security & AI:**
- ISO 27001:2022 — Information Security Management
- ISO 42001:2023 — AI Management Systems
- Cyber Essentials / Cyber Essentials Plus (UK)

**Governance & Ethics:**
- ISO 37001:2016 — Anti-Bribery Management
- ISO 31000:2018 — Risk Management Framework
- ISO 55001:2014 — Asset Management

**Sustainability & ESG:**
- GRI Standards (Universal + Topic-Specific)
- SASB Industry Standards
- TCFD Climate Disclosure Framework
- UN SDG alignment mapping

**Food Safety:**
- ISO 22000:2018 — Food Safety Management
- FSSC 22000 (Version 6)
- HACCP principles

**Supply Chain:**
- ISO 28000 — Supply Chain Security
- Modern Slavery Act (UK/Australia)

Standards coverage is reviewed and expanded quarterly. Check the Compliance Guides section of this Knowledge Base for detailed guidance on using IMS to meet the requirements of each standard.

## Additional Detail

IMS uses the **Standards Convergence Engine** to map requirements across multiple standards, identifying where a single IMS record or process satisfies requirements from several standards simultaneously. This reduces duplication for organisations certified to multiple standards.

## Related Articles

- Compliance Guides section of this Knowledge Base
- Standards Convergence Engine User Guide
`,
  },
  {
    id: 'KB-FAQ3-015',
    title: 'Can I create my own workflows and approval chains?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'workflows', 'automation', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Can I create my own workflows and approval chains?

## Question

The default approval workflows in IMS do not match our process. Can we configure our own?

## Answer

Yes. IMS includes a **Workflow Builder** that allows you to create fully custom multi-stage approval chains and automated process flows without any coding.

**Workflow Builder features:**

- **Multi-stage approvals:** Define as many approval stages as needed (e.g. Team Lead → Department Manager → Director).
- **Conditional routing:** Route to different approvers or paths based on record field values (e.g. risk rating, financial value, site).
- **Parallel approvals:** Require sign-off from multiple approvers simultaneously before proceeding to the next stage.
- **Time-based escalation:** If an approver does not act within a defined time (e.g. 48 hours), automatically escalate to their manager or a backup approver.
- **Cross-module triggers:** A workflow stage completion in one module can trigger an action in another (e.g. a completed CAPA approval triggers a document review in Document Control).
- **Notifications:** Automatic email and in-app notifications to assignees at each stage.

## Additional Detail

**Where to access the Workflow Builder:** Navigate to the **Workflows** module and click **New Workflow** to launch the visual workflow designer.

**Workflow templates:** Pre-built workflow templates are available for common scenarios (Document Approval, CAPA Closure, Change Request, Permit to Work, etc.). Use these as starting points and customise as needed.

**Assigning workflows to record types:** Once a workflow is saved, navigate to **Admin → Record Types → [Record Type] → Approval Workflow** and select your custom workflow. From that point, all new records of that type will follow your workflow.

**Testing workflows:** Workflows can be tested in a sandbox mode before activation. The sandbox simulates the workflow with a dummy record and shows the full routing path without sending real notifications.

## Related Articles

- Workflow Builder User Guide
- Approval Escalation Configuration
- Cross-Module Triggers Guide
`,
  },
  {
    id: 'KB-FAQ3-016',
    title: 'How does IMS handle GDPR and data privacy?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'gdpr', 'privacy', 'data-protection'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# How does IMS handle GDPR and data privacy?

## Question

How does IMS support our GDPR compliance obligations?

## Answer

IMS processes personal data as a **data processor** on behalf of your organisation, which acts as the **data controller**. A Data Processing Agreement (DPA) is available and must be signed with IMS before processing personal data.

**GDPR-supporting features in IMS:**

| GDPR Obligation | IMS Feature |
|---|---|
| Right of Access (Art. 15) | Data Subject Access Request (DSAR) export tool |
| Right to Erasure (Art. 17) | Data deletion workflow (subject to legal hold) |
| Right to Rectification (Art. 16) | User profile editing and admin correction tools |
| Data Portability (Art. 20) | CSV/JSON export per data subject |
| Consent Management (Art. 7) | Consent records with audit trail |
| Records of Processing (Art. 30) | Data Processing Register in Settings |
| Breach Notification (Art. 33) | Incident module with 72-hour breach notification workflow |
| Data Retention (Art. 5) | Configurable retention periods per record type |

## Additional Detail

**DSAR handling:** When you receive a data subject access request, navigate to **Admin → Privacy → DSAR** and enter the data subject's name and email. IMS searches all modules and generates a comprehensive export of all personal data held for that individual.

**Data residency:** By default, IMS stores data in EU-based data centres (Ireland). US-based data centre option available for US customers. Data residency choice is set at account creation and cannot be changed post-activation without a migration service.

**Privacy by design:** New features in IMS are assessed against GDPR principles during development. Personal data fields are tagged and included in the data inventory automatically.

**Sub-processors:** A current list of IMS sub-processors (cloud infrastructure, email delivery, analytics) is maintained and updated with 30-day advance notice of changes, as required by GDPR.

## Related Articles

- GDPR Compliance Using IMS (Compliance Guide)
- Data Retention Configuration Guide
- Security and Privacy Documentation
`,
  },
  {
    id: 'KB-FAQ3-017',
    title: 'Can we restrict which modules each user can see?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'permissions', 'modules', 'rbac'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Can we restrict which modules each user can see?

## Question

Some of our users should only access specific modules (e.g. HR staff should not see Finance). Can we restrict module access per user?

## Answer

Yes. Module access in IMS is controlled through the **Role-Based Access Control (RBAC)** system.

A user only sees modules in their navigation for which they have at least one active role that grants access. If no role grants a user access to a module, that module does not appear in their navigation and they cannot navigate to it directly.

**How to configure:**

1. Navigate to **Admin → Roles**.
2. Create a role (e.g. "HR Manager") or edit an existing role.
3. For each module, set the permission level: None, View, Edit, or Admin.
4. Assign the role to users under **Admin → Users → [User] → Roles**.

Users can hold multiple roles. Their effective permissions are the union of all roles assigned to them (highest permission level wins for each module).

## Additional Detail

**Granular permissions within a module:** Within each module, permissions can be further restricted beyond view/edit/admin. For example, in HR you can allow a user to view salary information but not edit it, or allow them to view all employee records but only edit records in their own department.

**Seven permission levels:** IMS RBAC supports seven permission levels for fine-grained control: None, View, Create, Edit, Delete, Approve, Admin. Module administrators assign the appropriate level for each role.

**Role templates:** Pre-built role templates are provided for common job functions (Quality Manager, Safety Officer, Finance Director, External Auditor, etc.). Use these as starting points and customise as needed.

**Dynamic roles:** Roles can be dynamic — for example, a user is automatically granted edit access to an incident if they are the assigned investigator, even if their base role is view-only for incidents. Dynamic role rules are configured in Workflow Settings.

## Related Articles

- RBAC Configuration Guide
- Role Templates Reference
- User Management Admin Guide
`,
  },
  {
    id: 'KB-FAQ3-018',
    title: 'How do I add a new site or location?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'multi-site', 'organisation', 'sites'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# How do I add a new site or location?

## Question

Our organisation has multiple sites. How do I add a new site to IMS and configure it?

## Answer

1. Navigate to **Admin → Locations**.
2. Click **Add Location**.
3. Fill in the required fields:
   - **Site Name** (required)
   - **Address** (required)
   - **Timezone** — used for date/time display and scheduled reminders
   - **Site Administrator** — the IMS user responsible for this site
4. Optionally add: site code (used in reference numbers if multi-site numbering is enabled), phone number, and parent location (for hierarchical site structures).
5. Click **Save**.

The new site is immediately available as a location option on all records (incidents, assets, training, audits, etc.).

## Additional Detail

**Assigning users to sites:** Once a site is created, assign users to it under **Admin → Users → [User] → Sites**. Users can belong to multiple sites. Site assignment is used for:

- Filtering default views (users see records from their sites by default)
- Site-level reporting and dashboards
- Site-specific notification routing
- Reference number site codes

**Site hierarchy:** IMS supports multi-level site hierarchies (e.g. Region → Country → Site → Building → Floor). A parent site can be set when creating or editing a location. Hierarchical roll-up reporting is available in the Analytics module.

**Site-specific configuration:** Each site can have its own configured values for: emergency contacts, local regulatory requirements, working hours (for overdue SLA calculations), and site-specific document library sections.

**Deactivating a site:** If a site closes, deactivate it rather than deleting it. Deactivated sites are hidden from active record creation dropdowns but historical records linked to that site are preserved and remain accessible.

## Related Articles

- Multi-Site Management Guide
- Reference Number Configuration
- Organisational Hierarchy Setup
`,
  },
  {
    id: 'KB-FAQ3-019',
    title: 'Can external auditors be given read-only access?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'audit', 'external-access', 'read-only'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Can external auditors be given read-only access?

## Question

We have an external ISO certification audit coming up. Can we give the external auditors read-only access to IMS to review our records?

## Answer

Yes. IMS includes an **External Auditor** role designed specifically for this purpose.

**To set up external auditor access:**

1. Navigate to **Admin → Users → Invite User**.
2. Enter the auditor's name and work email address.
3. Select the role **External Auditor** (this role grants read-only access across all modules).
4. Set an **Access Expiry Date** (e.g. the last day of the audit). The account is automatically deactivated after this date.
5. Optionally scope the role to specific modules only (e.g. give access to Quality and Audit modules but not HR and Finance).
6. Click **Send Invitation**.

The auditor receives an email invitation and sets their own password. They can then log in and view records across the permitted modules. They cannot create, edit, delete, or export records.

## Additional Detail

**Audit trail logging:** All actions by external auditor accounts are logged in the IMS audit trail, including which records were viewed and when. This provides a complete record of what the auditor accessed.

**Access scope options:** If you prefer not to give access to all modules, create a custom role with view-only permissions on specific modules and assign that to the auditor instead of the default External Auditor role.

**Document sharing alternative:** If you prefer not to create a user account, you can use the **Evidence Pack** feature to export a structured ZIP file of relevant records, documents, and reports for the auditor. This requires no account creation.

**Multiple external auditors:** You can create separate accounts for each member of an audit team. There is no limit to the number of external auditor accounts (they count against your named user limit, so check your license if inviting many auditors).

## Related Articles

- RBAC Configuration Guide
- Evidence Pack Export Guide
- User Management Admin Guide
`,
  },
  {
    id: 'KB-FAQ3-020',
    title: "What's the difference between Incidents and Complaints?",
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'incidents', 'complaints'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# What's the difference between Incidents and Complaints?

## Question

When should we use the Incidents module vs the Complaints module? What is the distinction between the two?

## Answer

**Incidents** are events that originate **internally** — within your organisation's operations, facilities, or workforce:

- Workplace accidents, injuries, or near-misses
- Environmental releases or spills
- Equipment failures causing safety or quality issues
- Security breaches or data loss events
- Process nonconformances detected internally

**Complaints** are initiated **externally** — by parties outside your organisation who are expressing dissatisfaction or raising a concern:

- Customer dissatisfaction with a product or service
- Product quality complaints from customers
- Regulatory body complaints or enforcement notices
- Neighbour or community complaints about your operations (noise, emissions, etc.)
- Supplier complaints about your organisation

The key distinction is the **direction of origin**: internal event vs external communication.

## Additional Detail

**Overlap — customer safety complaints:** Some organisations choose to log product safety complaints in **both** modules — in Complaints for the customer relationship management and response tracking, and in Incidents for safety investigation and root cause analysis. IMS supports this through a **linked records** feature, which creates a cross-reference between the incident and the complaint without duplicating data entry.

**Regulatory reporting:** Incidents feed into statutory reporting (e.g. OSHA 300 log, environmental incident reports), while Complaints feed into customer satisfaction metrics and regulatory correspondence tracking.

**Workflows:** The investigation and closure workflows differ between the two modules. Incidents typically follow a root cause / immediate action / systemic action flow, while Complaints follow an acknowledge / investigate / respond / close flow with defined customer response timelines.

## Related Articles

- Incidents Module Guide
- Complaints Module Guide
- Linking Records Across Modules
`,
  },
  {
    id: 'KB-FAQ3-021',
    title: 'Can I set different approval levels for different risk ratings?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'approvals', 'risk', 'workflow'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Can I set different approval levels for different risk ratings?

## Question

We want low-risk records to be approved by a team leader, but high-risk records to require director approval. Is this possible?

## Answer

Yes. IMS Workflow Builder supports **conditional routing** based on any field value, including risk rating, financial value, location, or record type.

**Example configuration for risk-based approval escalation:**

1. Open the **Workflow Builder** in the Workflows module.
2. Create (or edit) the approval workflow for the relevant record type.
3. After the initial submission stage, add a **Condition** step.
4. Set the condition: "If Risk Rating is Low or Medium → route to Team Lead Approval stage; if Risk Rating is High or Critical → route to Director Approval stage."
5. Create separate approval stages for each path.
6. Save and assign the workflow to the record type.

This creates a branching workflow where the approval chain automatically adapts based on the risk level assigned to the record.

## Additional Detail

**Multiple condition fields:** Conditions can combine multiple fields using AND/OR logic. For example: "If Risk Rating is Critical AND Financial Impact is over £100,000 → route to Board-level approval."

**Escalation within a stage:** Within a single approval stage, you can also configure time-based escalation if the approver does not act within a defined period (e.g. 24 hours for Critical risk records, 5 business days for Low risk records).

**Configuration location:** Navigate to **Workflow → Approval Rules** for a simplified interface for common approval escalation patterns, or use the full **Workflow Builder** for complex branching logic.

**Pre-built templates:** IMS includes pre-built conditional approval workflow templates for Risk Management (Low/Medium/High/Critical routing), Change Management (standard/major/emergency), and Financial Authorisation (tier-based by value). Use these as starting points.

## Related Articles

- Workflow Builder User Guide
- Approval Escalation Configuration
- Risk Module Configuration Guide
`,
  },
  {
    id: 'KB-FAQ3-022',
    title: 'How are electronic signatures handled?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'electronic-signature', 'compliance', '21-cfr-11'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# How are electronic signatures handled?

## Question

What does an electronic signature in IMS capture, and is it compliant with regulated industry requirements?

## Answer

IMS supports two levels of electronic signature:

**Standard Electronic Signature** (default for all users):
When a user approves, reviews, or witnesses a record, IMS captures:
- Full name of the signatory
- Email address
- Timestamp (date and time, timezone)
- Action performed (Approved / Reviewed / Witnessed / Authorised)
- IP address
- A non-repudiation statement ("I confirm that I am [Name] and I am signing this record with the meaning: [Action]")

This data is permanently recorded in the audit trail and cannot be altered or deleted.

**Enhanced Electronic Signature** (for regulated industries):
The enhanced mode requires the user to **re-enter their IMS password** at the point of signing, confirming their identity beyond the active session. This mode is compliant with:
- **21 CFR Part 11** (US FDA regulated industries — pharmaceuticals, medical devices, biologics)
- **EU GMP Annex 11** (EU regulated industries)

## Additional Detail

**Enabling enhanced e-signatures:** Navigate to **Admin → Compliance → Electronic Signatures** and enable "Enhanced Electronic Signature Mode" for the relevant modules (e.g. Quality, Medical Devices, Document Control).

**DocuSign integration:** For documents requiring more formal e-signature workflows (e.g. supplier quality agreements, contracts), IMS integrates with DocuSign. The DocuSign signature certificate is archived back to the IMS document record. See the DocuSign Integration Guide.

**Bulk signing:** When multiple records require signing simultaneously (e.g. closing out an audit batch), the bulk signing feature allows a user to review and sign up to 50 records in one session, with a single password re-entry for enhanced signatures.

**Audit trail:** All electronic signatures are included in the record's audit history and in the exportable audit trail reports.

## Related Articles

- Integrating IMS with DocuSign
- 21 CFR Part 11 Compliance Guide
- Document Approval Workflow Guide
`,
  },
  {
    id: 'KB-FAQ3-023',
    title: 'Can we run IMS on-premises?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['faq', 'deployment', 'on-premises', 'cloud'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Can we run IMS on-premises?

## Question

For data sovereignty reasons, we need IMS hosted on our own infrastructure. Is an on-premises deployment available?

## Answer

IMS is primarily delivered as a **cloud-hosted SaaS** product. An **on-premises deployment option** is available for enterprise customers who have specific data residency, security classification, or regulatory requirements that prevent use of cloud hosting.

**On-premises deployment details:**

- Available to Enterprise tier customers only
- Deployed using Docker Compose (single-node) or Kubernetes (multi-node / HA)
- Includes all IMS modules and APIs identical to the cloud version
- Your IT team manages the infrastructure; IMS provides the software
- Updates are delivered as versioned container image releases on a defined schedule
- Support is provided remotely by the IMS engineering team

**Minimum infrastructure requirements (single node):**

| Component | Minimum | Recommended |
|---|---|---|
| CPU | 8 cores | 16 cores |
| RAM | 32 GB | 64 GB |
| SSD storage | 500 GB | 1 TB NVMe |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Network | 1 Gbps | 10 Gbps |

**HA / multi-node requirements:** For high availability deployments, a minimum of 3 nodes is recommended. Kubernetes deployment is required for HA. Contact IMS for the full Kubernetes deployment guide.

## Additional Detail

**Trade-offs vs cloud:** On-premises customers are responsible for infrastructure security, backup, disaster recovery, and uptime. IMS SLAs cover software defects only, not infrastructure availability for on-premises deployments. Cloud deployments include fully managed backup, DR, and a 99.9% uptime SLA.

**Licensing:** On-premises and cloud licences are the same price per user. There is no premium for on-premises deployment.

**Contact:** To discuss on-premises deployment, contact your account manager or email enterprise@ims.local.

## Related Articles

- Getting Started with IMS
- Security and Privacy Documentation
- Backup and Disaster Recovery Guide
`,
  },
  {
    id: 'KB-FAQ3-024',
    title: 'How do I contact support?',
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
    content: `# How do I contact support?

## Question

If I cannot find an answer in the Knowledge Base or need help with a problem, how do I contact the IMS support team?

## Answer

IMS support is available through the following channels:

**1. In-app chat (fastest)**
Click the **Help** icon in the bottom-right corner of any IMS screen. This opens the in-app support chat where you can describe your issue and a support agent will respond. Chat is available during business hours (Monday–Friday, 09:00–17:00 UTC).

**2. Email**
Send a detailed description of your issue to **support@ims.local**. Include your organisation name, the module affected, and steps to reproduce the issue. Include screenshots if relevant.

**3. Phone**
Phone support is available for Professional and Enterprise customers during business hours. Your support phone number is listed on the License page under **Admin → License → Support Contacts**.

**4. Dedicated Customer Success Manager**
Enterprise customers are assigned a named Customer Success Manager (CSM) who is your primary contact for product questions, escalations, and strategic guidance. Your CSM's contact details are on the License page.

## Additional Detail

**Support SLAs:**

| Priority | Definition | Response Time |
|---|---|---|
| P1 — Critical | System completely down or data loss | 1 hour |
| P2 — Major | Key feature broken or significant performance degradation | 4 hours |
| P3 — Standard | Feature not working as expected, workaround available | Next business day |
| P4 — Minor | Cosmetic issue, feature request, general question | Within 5 business days |

**Before contacting support:** Check this Knowledge Base first — most common questions are answered here. Use the search bar at the top of the Knowledge Base to find relevant articles.

**Status page:** For known outages and scheduled maintenance, check **status.ims.local**. You can subscribe to status page notifications by email.

## Related Articles

- Knowledge Base Home
- Troubleshooting Common Issues
`,
  },
];
