import type { KBArticle } from '../types';

export const adminGuideArticles: KBArticle[] = [
  {
    id: 'KB-AD-001',
    title: 'Role-Based Access Control (RBAC) — Complete Reference',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['rbac', 'roles', 'permissions', 'access-control', 'users', 'admin'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Role-Based Access Control (RBAC) — Complete Reference

## Overview

IMS uses a Role-Based Access Control (RBAC) system with 39 predefined roles across 17 modules. Understanding how roles and permissions interact is essential for administrators setting up new users.

**Quick reference:** To add a user, go to [Settings → Users → Invite User](/settings/users). To edit permissions, go to [Settings → Users → \\[User\\] → Module Permissions](/settings/users).

---

## The Permission Model

Every user has:
1. A **global role** — determines default access across all modules
2. **Module-specific overrides** — optionally set per user to grant more or less access than the role default

### Permission Levels

| Level | Name | What the user can do |
|-------|------|----------------------|
| 0 | NONE | Cannot see the module |
| 1 | VIEW | Read all records |
| 2 | COMMENT | Read + add comments, submit basic forms |
| 3 | EDIT | Create and edit own records |
| 4 | MANAGE | Create, edit, and manage others' records |
| 5 | APPROVE | Manage + approve/reject workflow steps |
| 6 | ADMIN | Full control including module configuration |

---

## Full Role Reference

### System-Wide Roles

| Role | Default Module Permission | Use Case |
|------|--------------------------|----------|
| SUPER_ADMIN | 6 (ADMIN) on all | Nexara platform administrators |
| SYSTEM_ADMIN | 6 (ADMIN) on all | Your organisation's main IT admin |
| MODULE_ADMIN | 6 (ADMIN) on assigned modules | Module-by-module administration |
| VIEWER | 1 (VIEW) on all | Read-only access for auditors, regulators |

### Health & Safety Roles

| Role | H&S Permission | Other Permissions |
|------|---------------|------------------|
| HS_MANAGER | 5 (APPROVE) | Risk: 4, Incidents: 4, Training: 3 |
| HS_OFFICER | 3 (EDIT) | Risk: 3, Incidents: 3 |
| HS_AUDITOR | 1 (VIEW) | Audit: 4 |
| EMPLOYEE | 2 (COMMENT) | H&S (incident report only) |

### Environmental Roles

| Role | ENV Permission | Other |
|------|---------------|-------|
| ENV_MANAGER | 5 (APPROVE) | ESG: 4, Energy: 4 |
| ENV_OFFICER | 3 (EDIT) | ESG: 3 |

### Quality Roles

| Role | Quality Permission | Other |
|------|------------------|-------|
| QUALITY_MANAGER | 5 (APPROVE) | Complaints: 5, Audits: 4, Docs: 4 |
| QUALITY_INSPECTOR | 3 (EDIT) | Complaints: 3 |
| FOOD_SAFETY_MANAGER | 5 (APPROVE) | Quality: 4, Training: 3 |

### HR & People Roles

| Role | HR Permission | Other |
|------|--------------|-------|
| HR_MANAGER | 5 (APPROVE) | Payroll: 4, Training: 4 |
| HR_OFFICER | 4 (MANAGE) | Training: 3 |
| PAYROLL_ADMIN | 6 (ADMIN) | HR: 3 (view only) |
| TRAINING_MANAGER | 5 (APPROVE) | HR: 1 |
| LINE_MANAGER | 3 (EDIT) | Direct reports only |

### Finance Roles

| Role | Finance Permission | Other |
|------|------------------|-------|
| FINANCE_MANAGER | 5 (APPROVE) | Contracts: 4, Suppliers: 3 |
| FINANCE_ANALYST | 3 (EDIT) | — |
| PROCUREMENT_MANAGER | 5 (APPROVE) | Suppliers: 5, Contracts: 5, Inventory: 4 |

### Operations Roles

| Role | Primary Permission | Other |
|------|------------------|-------|
| MAINTENANCE_MANAGER | 5 on CMMS | Assets: 4, Inventory: 4, PTW: 5 |
| TECHNICIAN | 3 on CMMS | PTW: 2, Inventory: 2 |
| FIELD_SERVICE_MANAGER | 5 on Field Service | — |
| FIELD_TECHNICIAN | 3 on Field Service | — |
| INVENTORY_MANAGER | 5 on Inventory | — |

### Compliance Roles

| Role | Primary Permission |
|------|------------------|
| RISK_MANAGER | 5 on Risk |
| COMPLIANCE_OFFICER | 4 on all compliance modules |
| AUDITOR | 4 on Audits, 1 elsewhere |
| INFOSEC_MANAGER | 5 on InfoSec |
| LEGAL_COUNSEL | 3 on Contracts, 4 on ISO 37001 |

### Customer / Supplier Roles

| Role | Access |
|------|--------|
| CUSTOMER_PORTAL_USER | Customer Portal only (external) |
| SUPPLIER_PORTAL_USER | Supplier Portal only (external) |
| CRM_MANAGER | 5 on CRM, Customer Portal: 5 |
| ACCOUNT_MANAGER | 3 on CRM, 3 on Field Service |

---

## Creating a Custom Permission Set

For users who don't fit a predefined role:
1. Assign the closest role as the baseline
2. Navigate to the user's profile: [Settings → Users → \\[User\\] → Module Permissions](/settings/users)
3. Override individual module levels as needed
4. Document the reason for the custom override in the user notes field

---

## Best Practices

- **Least privilege** — Always assign the minimum permission level needed
- **Role review** — Review all user permissions quarterly
- **Separation of duties** — Finance approval and payment should not be the same person
- **Named accounts** — Never use shared logins; every user must have their own account
- **Offboarding** — Immediately suspend accounts when staff leave (see [KB-FAQ-002](/knowledge-base#KB-FAQ-002))

---

## See Also

- [Managing Users, Roles & Permissions (Getting Started)](/knowledge-base#KB-GS-004)
- [Single Sign-On Configuration](/knowledge-base#KB-AD-002)
- [Audit Trail & Compliance Logging](/knowledge-base#KB-AD-010)
`,
  },

  {
    id: 'KB-AD-002',
    title: 'Single Sign-On (SSO) Configuration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['sso', 'saml', 'okta', 'azure-ad', 'google-workspace', 'authentication', 'admin'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Single Sign-On (SSO) Configuration Guide

## Overview

IMS supports SAML 2.0 Single Sign-On, allowing your users to log in with their corporate identity provider (IdP) credentials instead of a separate IMS password. SSO is available on Professional and Enterprise plans.

**Navigate to:** [Settings → Security → Single Sign-On](/settings/security/sso)

---

## Supported Identity Providers

- **Microsoft Azure Active Directory (Entra ID)**
- **Okta**
- **Google Workspace**
- **OneLogin**
- **ADFS (Active Directory Federation Services)**
- Any SAML 2.0-compliant IdP

---

## Before You Begin

You will need:
- Administrator access to your identity provider
- IMS SAML metadata (download from Settings → Security → SSO → Download Metadata)
- Your IMS tenant domain (e.g., yourcompany.ims.io)

---

## Step-by-Step: Azure AD Configuration

### In Azure Active Directory

1. Navigate to **Azure Portal → Azure Active Directory → Enterprise Applications → New Application**
2. Select **Create your own application**
3. Name it "IMS" and select **Integrate any other application you don't find in the gallery**
4. In the application, select **Single sign-on → SAML**
5. In **Basic SAML Configuration**, enter:
   - **Identifier (Entity ID):** \`https://yourcompany.ims.io/auth/saml/metadata\`
   - **Reply URL (ACS URL):** \`https://yourcompany.ims.io/auth/saml/callback\`
   - **Sign on URL:** \`https://yourcompany.ims.io/login\`
6. In **User Attributes & Claims**, ensure the following are mapped:
   - \`email\` → user.mail
   - \`givenname\` → user.givenname
   - \`surname\` → user.surname
7. Download the **Federation Metadata XML** file

### In IMS

1. Navigate to [Settings → Security → SSO](/settings/security/sso)
2. Select **Azure AD** as the identity provider
3. Upload the Federation Metadata XML file from Azure
4. Set **Default role for SSO users**: choose the role assigned when a new user logs in via SSO for the first time (recommended: EMPLOYEE)
5. Optionally enable **Auto-provision users**: IMS creates a user account automatically on first SSO login
6. Click **Save and Test**

---

## Step-by-Step: Okta Configuration

### In Okta

1. Navigate to **Applications → Create App Integration**
2. Select **SAML 2.0**
3. In the **General** tab:
   - **Single sign on URL:** \`https://yourcompany.ims.io/auth/saml/callback\`
   - **Audience URI (SP Entity ID):** \`https://yourcompany.ims.io/auth/saml/metadata\`
4. In **Attribute Statements**, add:
   - email → user.email
   - firstName → user.firstName
   - lastName → user.lastName
5. Download the **Identity Provider Metadata** XML

### In IMS

Follow the same steps as Azure AD, selecting **Okta** as the provider and uploading the Okta metadata XML.

---

## Step-by-Step: Google Workspace

### In Google Admin Console

1. Navigate to **Apps → Web and mobile apps → Add App → Add custom SAML app**
2. Name the app "IMS"
3. Download the **IdP Metadata** XML
4. In **Service Provider Details**:
   - **ACS URL:** \`https://yourcompany.ims.io/auth/saml/callback\`
   - **Entity ID:** \`https://yourcompany.ims.io/auth/saml/metadata\`
   - **Name ID format:** EMAIL
5. In **Attribute mapping**, add:
   - Email → Basic Information > Primary Email
   - firstName → Basic Information > First Name
   - lastName → Basic Information > Last Name
6. Save and enable the app for your users

### In IMS

Select **Google Workspace** and upload the IdP Metadata XML.

---

## SSO Settings in IMS

| Setting | Description |
|---------|-------------|
| SSO Required | Force all users to use SSO (disables password login) |
| SSO Optional | Users can use SSO or password login |
| Auto-provision | Create IMS account on first SSO login |
| Default role | Role assigned to auto-provisioned users |
| Allow local admin | Keep 1 local admin account that bypasses SSO (recommended for lockout recovery) |

---

## Testing SSO

1. Open a private/incognito browser window
2. Navigate to your IMS login page
3. Click **Sign in with [Provider Name]**
4. Complete the IdP login flow
5. Confirm you land on the IMS dashboard with the correct user profile

If SSO fails, check the [Settings → Security → SSO → SSO Logs](/settings/security/sso/logs) for error details.

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| "Invalid audience" error | Incorrect Entity ID | Verify Entity ID matches exactly |
| "SAML assertion expired" | Clock skew between IMS and IdP | Ensure server clocks are synchronised (NTP) |
| User gets wrong role | Default role misconfigured | Update default role in SSO settings |
| Attributes not received | Missing attribute statements in IdP | Add email, firstName, lastName mappings |

---

## See Also

- [Managing Users, Roles & Permissions](/knowledge-base#KB-GS-004)
- [Security Settings & Hardening](/knowledge-base#KB-AD-007)
- [Audit Trail & Compliance Logging](/knowledge-base#KB-AD-010)
`,
  },

  {
    id: 'KB-AD-003',
    title: 'API Keys & External Integrations',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['api', 'api-keys', 'integrations', 'webhooks', 'rest', 'developer', 'automation'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# API Keys & External Integrations

## Overview

IMS provides a RESTful API accessible via the API Gateway (port 4000) for integration with external systems such as ERP, HR, financial, and monitoring tools. All API requests require a Bearer token from login or a long-lived API key for machine-to-machine communication.

**Navigate to API keys:** [Settings → API → API Keys](/settings/api/keys)

---

## Authentication Methods

### 1. User JWT (Interactive)

For interactive use and short-lived sessions:

\`\`\`
POST /api/auth/login
{
  "email": "admin@ims.local",
  "password": "your-password"
}
\`\`\`

Returns:
\`\`\`
{ "data": { "accessToken": "eyJ..." } }
\`\`\`

Include in all subsequent requests:
\`\`\`
Authorization: Bearer eyJ...
\`\`\`

JWT access tokens expire after 1 hour. Refresh using:
\`\`\`
POST /api/auth/refresh
\`\`\`

### 2. API Key (Machine-to-Machine)

For integrations and automated scripts:

1. Navigate to [Settings → API → API Keys → Create Key](/settings/api/keys)
2. Enter a name (e.g., "Power BI Integration")
3. Set an expiry date (or leave blank for no expiry — not recommended)
4. Select the permissions scope (which modules and operations this key can access)
5. Copy the key — **it is only shown once**

Include the API key as a Bearer token:
\`\`\`
Authorization: Bearer ims_live_abc123...
\`\`\`

---

## Core API Endpoints

All endpoints are prefixed with \`/api/v1/\` or \`/api/\`.

### Authentication
- \`POST /api/auth/login\` — Login, returns accessToken
- \`POST /api/auth/refresh\` — Refresh access token
- \`POST /api/auth/logout\` — Invalidate current session
- \`GET /api/auth/me\` — Current user profile

### Users & Organisations
- \`GET /api/users\` — List users
- \`POST /api/users\` — Create user
- \`GET /api/organisations\` — Organisation details

### Module APIs (examples)

All module APIs follow the same RESTful pattern:

\`\`\`
GET    /api/{module}/              → list records
POST   /api/{module}/              → create record
GET    /api/{module}/:id           → get single record
PUT    /api/{module}/:id           → update record
DELETE /api/{module}/:id           → delete record
\`\`\`

Module prefixes:

| Module | API Prefix | Port |
|--------|-----------|------|
| H&S | /api/health-safety/ | 4001 |
| Environment | /api/environment/ | 4002 |
| Quality | /api/quality/ | 4003 |
| Inventory | /api/inventory/ | 4005 |
| HR | /api/hr/ | 4006 |
| Payroll | /api/payroll/ | 4007 |
| Finance | /api/finance/ | 4013 |
| CRM | /api/crm/ | 4014 |
| InfoSec | /api/infosec/ | 4015 |
| ESG | /api/esg/ | 4016 |
| CMMS | /api/cmms/ | 4017 |
| Risk | /api/risk/ | 4027 |
| Training | /api/training/ | 4028 |
| Suppliers | /api/suppliers/ | 4029 |
| Assets | /api/assets/ | 4030 |
| Documents | /api/documents/ | 4031 |
| Incidents | /api/incidents/ | 4036 |
| Audits | /api/audits/ | 4037 |
| Search | /api/search/ | 4050 |

### Global Search
\`\`\`
GET /api/search/?q={query}&modules=hs,quality&limit=20
\`\`\`

---

## Webhooks

Configure webhooks to push IMS events to external systems:

1. Navigate to [Settings → API → Webhooks → Add Webhook](/settings/api/webhooks)
2. Enter the external endpoint URL
3. Select events to subscribe to:
   - incident.created / incident.closed
   - risk.created / risk.updated
   - ncr.created / ncr.closed
   - document.published
   - training.expiring (30 days before)
   - user.created / user.deactivated
4. Select the HMAC secret (used to verify webhook authenticity)
5. Test the webhook

Webhook payload format:
\`\`\`json
{
  "event": "incident.created",
  "timestamp": "2026-02-28T10:30:00Z",
  "data": { ...incident fields... },
  "signature": "sha256=..."
}
\`\`\`

---

## Rate Limits

| Endpoint Category | Limit |
|------------------|-------|
| Login / Auth | 5 requests per 15 minutes |
| Standard API reads | 1,000 requests per minute |
| Standard API writes | 200 requests per minute |
| Bulk import | 10 requests per minute |

Rate limit headers are included in all responses:
\`\`\`
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1706431200
\`\`\`

---

## Common Integrations

### Microsoft Power BI
Use the OData feed: \`/api/analytics/odata\` with API key auth. Or use the REST API with Power BI's custom connector.

### Slack / Microsoft Teams
Use webhooks to post IMS events to a Slack or Teams channel. Attach the IMS webhook URL in your Slack app configuration.

### ERP Systems (SAP, Oracle, Dynamics)
Use the REST API to sync:
- Employees (from ERP HR module → IMS HR module)
- Cost centres (from ERP Finance → IMS Finance)
- Purchase orders (from ERP Procurement → IMS Inventory/Contracts)

### Jira
Use webhooks to create Jira tickets when IMS incidents or NCRs are raised.

---

## See Also

- [System Health & Performance Monitoring](/knowledge-base#KB-AD-008)
- [Data Import & Export](/knowledge-base#KB-AD-005)
- [Workflows & Automation](/knowledge-base#KB-MG-019)
`,
  },

  {
    id: 'KB-AD-004',
    title: 'Notification Configuration Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['notifications', 'alerts', 'email', 'configuration', 'escalation', 'admin'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Notification Configuration Guide

## Overview

IMS delivers notifications through multiple channels: in-app notifications (real-time WebSocket), email, and optionally Slack or Microsoft Teams. Notifications are triggered by events across all active modules and by the Workflows engine.

**Navigate to:** [Settings → Notifications](/settings/notifications)

---

## Notification Channels

### 1. In-App Notifications

Real-time notifications appear in the notification bell (top right of the dashboard). All users receive in-app notifications for events relevant to their role. These cannot be disabled — they are the primary alert mechanism.

### 2. Email Notifications

Email is sent for important events requiring action. Configure:
- **SMTP server** — Your outgoing mail server
- **Sender address** — e.g., noreply@yourcompany.com
- **Reply-to address** — e.g., ims-support@yourcompany.com

  [Settings → Notifications → Email → SMTP Configuration](/settings/notifications/email)

Test the configuration with the **Send Test Email** button.

### 3. Slack Integration

Post IMS notifications to Slack channels:
1. Create a Slack App in your Slack workspace
2. Generate an Incoming Webhook URL for the target channel
3. Enter the Webhook URL in [Settings → Notifications → Slack](/settings/notifications/slack)
4. Select which event types to post to Slack (e.g., MAJOR incidents, overdue actions)

### 4. Microsoft Teams Integration

Post to Teams channels:
1. In Teams, right-click the target channel → Connectors → Incoming Webhook
2. Copy the webhook URL
3. Enter in [Settings → Notifications → Teams](/settings/notifications/teams)

---

## Notification Rules

### System-Wide Default Rules

By default, notifications are sent based on role:

| Event | Recipients |
|-------|-----------|
| Incident MINOR created | Reporter + Line Manager |
| Incident MAJOR created | Reporter + H&S Manager + HR Manager |
| Incident CRITICAL/CATASTROPHIC | All of the above + CEO + Board |
| Risk elevated to HIGH | Risk Owner + Risk Manager |
| Document due for review | Document Owner |
| Training expiring (30 days) | Employee + Line Manager |
| Training expired | Employee + HR Manager |
| NCR raised | Quality Manager + Department Manager |
| PTW about to expire | PTW Issuer + Site Manager |
| Supplier compliance document expired | Procurement Manager + Account Manager |

### Custom Notification Rules

Create custom rules for your specific processes:
1. Navigate to [Settings → Notifications → Rules → New Rule](/settings/notifications/rules)
2. Select the **triggering event** (from the event catalogue)
3. Add **conditions** (optional — e.g., "only if priority = HIGH")
4. Select **recipients** (specific users, roles, or the record's assigned person)
5. Select **channels** (in-app, email, Slack, Teams)
6. Set **delay** (optional — e.g., send reminder 24 hours after event if not acknowledged)

---

## Notification Templates

Customise the content of email notifications:
  [Settings → Notifications → Templates](/settings/notifications/templates)

Templates use \`{{field}}\` substitution. For example:
\`\`\`
Subject: New Incident Reported: {{title}} ({{severity}})
Body: A {{severity}} incident "{{title}}" was reported on {{dateOccurred}} at {{location}}.
      Reported by: {{reporter.name}}
      Please review: {{link}}
\`\`\`

Available field names depend on the event type. Each template has a preview button.

---

## Digest Notifications

Instead of individual notifications for each event, configure a daily or weekly digest:
  [Settings → Notifications → Digest](/settings/notifications/digest)

The digest consolidates:
- New incidents from the past period
- Actions becoming overdue
- Documents due for review
- Training nearing expiry
- Open NCRs and CAPAs

Digest is delivered at a configured time (e.g., 08:00 Monday for weekly, 07:30 daily for daily).

---

## User-Level Preferences

Each user can adjust their own notification preferences (within limits set by admin):
  [My Profile → Notification Preferences](/profile/notifications)

Users can:
- Unsubscribe from non-mandatory email notifications
- Choose digest vs real-time
- Set quiet hours (no email during evenings/weekends)

Administrators can lock specific notification types as mandatory (cannot be unsubscribed from).

---

## Troubleshooting

**Emails not arriving**
- Check the SMTP configuration: [Settings → Notifications → Email → Test](/settings/notifications/email)
- Check user's spam/junk folder
- Verify the sender domain has correct SPF/DKIM records

**Too many notifications**
- Switch from real-time to digest mode for affected users
- Review custom notification rules for duplicates
- Check that Workflows module isn't triggering duplicate alerts

---

## See Also

- [Workflows & Automation](/knowledge-base#KB-MG-019)
- [API Keys & Webhooks](/knowledge-base#KB-AD-003)
`,
  },

  {
    id: 'KB-AD-005',
    title: 'Data Import & Export Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['import', 'export', 'csv', 'bulk', 'data-migration', 'integration', 'admin'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Data Import & Export Guide

## Overview

IMS supports bulk data import and export for all major modules. This is typically used during initial setup (to migrate existing data) and for ongoing data exchange with external systems (ERP, spreadsheets, BI tools).

---

## Import — General Process

### Step 1: Download the Template

Every import uses a standardised CSV template. Download the template for your module:

  [Module] → Import → Download Template CSV

The template contains:
- Required columns (must be filled in)
- Optional columns
- Dropdown values (e.g., valid severity levels)
- Example rows

### Step 2: Populate the Template

Fill in your data in a spreadsheet application:
- Keep column headers exactly as provided (case-sensitive)
- Dates: use ISO 8601 format — YYYY-MM-DD (e.g., 2026-03-15)
- Enumerations: use the exact values shown in the example (e.g., MINOR not Minor)
- Required fields left blank will cause row-level validation errors
- Maximum 10,000 rows per import file

### Step 3: Upload and Validate

  [Module] → Import → Upload CSV

The system validates the file before importing:
- Row count shown
- Validation errors listed per row (if any)
- Rows with errors are highlighted but valid rows can still be imported

### Step 4: Review and Confirm

After validation, review the import summary:
- X records to import
- Y records with errors (skipped)
- Click **Confirm Import** to proceed

Import is processed asynchronously for large files. You will receive a notification when complete.

---

## Module-Specific Import Guides

### Users
  [Settings → Users → Import](/settings/users)

Required columns: \`email\`, \`firstName\`, \`lastName\`, \`role\`
Optional: \`department\`, \`jobTitle\`, \`startDate\`

### Employees (HR Module)
  [HR → Import Employees](/hr/employees)

Required: \`firstName\`, \`lastName\`, \`email\`, \`jobRole\`, \`department\`, \`startDate\`, \`contractType\`
Optional: \`managerId\`, \`salary\`, \`workLocation\`

### Assets
  [Assets → Import](/assets)

Required: \`assetId\`, \`name\`, \`category\`, \`location\`, \`acquisitionDate\`, \`purchaseCost\`
Optional: \`manufacturer\`, \`model\`, \`serialNumber\`, \`warrantyExpiry\`, \`usefulLife\`

### Inventory Items
  [Inventory → Import Items](/inventory/items)

Required: \`partNumber\`, \`description\`, \`category\`, \`unitOfMeasure\`
Optional: \`supplier\`, \`unitCost\`, \`minStock\`, \`reorderQty\`, \`location\`

### Chemicals
  [Chemicals → Import](/chemicals)

Required: \`productName\`, \`casNumber\`, \`category\`, \`location\`
Optional: \`supplier\`, \`hazardClass\`, \`quantityOnSite\`

### Incidents (Historical)
  [Incidents → Import](/incidents)

Required: \`title\`, \`dateOccurred\`, \`severity\`, \`incidentType\`, \`description\`
Optional: \`location\`, \`reporterEmail\`, \`status\`

Note: \`severity\` must be \`MINOR\`, \`MODERATE\`, \`MAJOR\`, \`CRITICAL\`, or \`CATASTROPHIC\`.

### Training Records
  [Training → Import Records](/training/records)

Required: \`employeeEmail\`, \`courseTitle\`, \`completionDate\`
Optional: \`expiryDate\`, \`certificateNumber\`, \`result\`, \`provider\`

---

## Export

### Module-Level Export

Export data from any module:
  [Module] → Export → Choose Format

Available formats: CSV / Excel (.xlsx) / JSON

Apply filters before exporting (date range, status, category) to limit the dataset.

### Analytics Export

For cross-module reporting:
  [Analytics → Export](/analytics/export)

Select:
- Data source (module or cross-module dataset)
- Fields to include
- Date range and filters
- Format and output

### Scheduled Exports

Set up recurring data exports:
  [Settings → API → Scheduled Exports](/settings/api/exports)

The file is emailed to a specified address or uploaded to an SFTP server on your defined schedule.

### API Data Access

For programmatic data access: see the [API Keys & External Integrations guide](/knowledge-base#KB-AD-003).

---

## Data Migration from Legacy Systems

If migrating from another system, follow this recommended order:

1. Users
2. Employees (HR)
3. Assets / Inventory
4. Chemicals
5. Suppliers
6. Documents (upload files manually or via API)
7. Historical incidents
8. Historical training records
9. Historical risk assessments
10. Historical audit findings

Allow 2–3 weeks for a full data migration from a legacy system with dedicated staff.

---

## See Also

- [API Keys & External Integrations](/knowledge-base#KB-AD-003)
- [Backup, Recovery & Data Retention](/knowledge-base#KB-AD-006)
`,
  },

  {
    id: 'KB-AD-006',
    title: 'Backup, Recovery & Data Retention',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['backup', 'recovery', 'data-retention', 'disaster-recovery', 'gdpr', 'admin'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Backup, Recovery & Data Retention

## Overview

IMS operates on a PostgreSQL database with automated backups, point-in-time recovery capability, and configurable data retention policies to meet GDPR and industry compliance requirements.

**Navigate to backup settings:** [Settings → System → Backup & Recovery](/settings/system/backup)

---

## Backup Architecture

### Automated Backups

IMS performs the following backups automatically:

| Backup Type | Frequency | Retention |
|------------|-----------|-----------|
| Full database backup | Daily (2:00 AM UTC) | 30 days |
| Transaction log backup | Every 15 minutes | 7 days |
| Weekly snapshot | Every Sunday | 90 days |
| Monthly archive | 1st of each month | 12 months |

Backups are stored encrypted (AES-256) in the configured backup destination (local filesystem, AWS S3, or Azure Blob Storage).

### Point-in-Time Recovery (PITR)

Transaction log backups enable recovery to any point within the last 7 days. This protects against:
- Accidental data deletion
- Malicious data modification
- Software bugs that corrupt data

---

## Configuring Backup Destinations

  Settings → System → Backup → Destinations

### Local Storage
- Path: /var/backups/ims/
- Minimum recommended space: 5× your database size

### AWS S3
- Bucket name (must be in the same region as your IMS instance)
- IAM role or access key with S3 PutObject / GetObject permissions
- Optional: S3 Glacier transition after 30 days (cost saving)

### Azure Blob Storage
- Storage account name and container
- SAS token or Managed Identity

---

## Verifying Backups

> **Important:** Test your backup restore process at least quarterly. An untested backup is not a backup.

To verify a backup:
  Settings → System → Backup → Backup History → [Select backup] → Verify

Verification performs a checksum comparison to confirm the backup file is intact without restoring it.

For a full restore test, contact Nexara support to arrange a sandbox restore.

---

## Manual Backup

Trigger an on-demand backup at any time:
  Settings → System → Backup → Trigger Backup Now

Use this before major data migrations or system updates.

---

## Restoring from Backup

> **Warning:** Restoring overwrites current data. Always create a fresh backup immediately before restoring.

### Restore Procedure

1. Contact Nexara support to initiate a restore (self-service restore available on Enterprise plan)
2. Select the restore point: specific backup file or point-in-time timestamp
3. Confirm: restoration will overwrite all data since the selected point
4. Restoration typically takes 15–60 minutes depending on database size
5. After restore, verify data integrity and notify affected users

---

## Data Retention Policies

### System Data Retention Defaults

| Data Type | Default Retention | Configurable? |
|-----------|-----------------|---------------|
| Audit logs | 7 years | No (compliance) |
| Incident records | Indefinite | No |
| Training records | 7 years after end of employment | Yes |
| Financial records | 7 years | No (legal) |
| User login history | 2 years | Yes |
| Soft-deleted records | 90 days | Yes |
| API access logs | 90 days | Yes |

### Configuring Custom Retention

  Settings → System → Data Retention → New Policy

Create policies for specific data types:
- Select the data category
- Set retention period (days / months / years)
- Set action after retention: ANONYMISE (replace personal data with tokens) or DELETE

GDPR / UK GDPR Note: Data relating to identifiable individuals must not be retained longer than necessary for the purpose for which it was collected. Anonymisation removes the personal identifier while preserving statistical/operational usefulness.

### Right to Erasure (GDPR Article 17)

To process a data subject access / erasure request:
  Settings → Privacy → Data Requests → New Request

Enter the data subject's email address. The system:
- Identifies all personal data held for that individual
- Produces a data inventory report (for access requests)
- Executes pseudonymisation / deletion (for erasure requests)

---

## Disaster Recovery

### Recovery Time Objective (RTO)

| Scenario | Expected RTO |
|---------|-------------|
| Single record deletion | < 1 hour (PITR) |
| Module data corruption | 2–4 hours (daily backup restore) |
| Full database loss | 4–8 hours |
| Full infrastructure loss | 24–48 hours (rebuild + restore) |

### Recovery Point Objective (RPO)

- Transaction log backups every 15 minutes = maximum 15 minutes data loss
- If 15 minutes is too long: contact Nexara for synchronous replication options

---

## See Also

- [System Health & Performance Monitoring](/knowledge-base#KB-AD-008)
- [Security Settings & Hardening](/knowledge-base#KB-AD-007)
- [API Keys & External Integrations](/knowledge-base#KB-AD-003)
`,
  },

  {
    id: 'KB-AD-007',
    title: 'Security Settings & Hardening Guide',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['security', 'password-policy', 'mfa', 'session', 'hardening', 'admin'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Security Settings & Hardening Guide

## Overview

IMS provides a comprehensive set of security controls that system administrators should configure to meet their organisation's security policy and applicable regulations (UK GDPR, ISO 27001, Cyber Essentials, etc.).

**Navigate to:** [Settings → Security](/settings/security)

---

## Password Policy

  Settings → Security → Password Policy

### Recommended Settings

| Setting | Recommended Value |
|---------|-----------------|
| Minimum length | 14 characters |
| Uppercase required | Yes |
| Lowercase required | Yes |
| Number required | Yes |
| Special character required | Yes |
| Maximum age (days) | 90 |
| Password history | Last 12 passwords |
| Account lockout threshold | 5 failed attempts |
| Lockout duration (minutes) | 30 |
| Reset link validity (hours) | 4 |

### Breached Password Detection

IMS integrates with the Have I Been Pwned (HIBP) database to check passwords against 700 million+ compromised passwords. Enable this to prevent users from setting passwords known to attackers:
  Settings → Security → Password Policy → Breached Password Check → Enable

---

## Multi-Factor Authentication (MFA)

  Settings → Security → MFA

### MFA Options

- **TOTP (Authenticator App)** — Microsoft Authenticator, Google Authenticator, Authy
- **SMS OTP** — One-time code sent via SMS (less secure than TOTP)
- **Email OTP** — One-time code sent to registered email

### MFA Policy

| Setting | Options |
|---------|---------|
| MFA requirement | OFF / OPTIONAL / REQUIRED for all / REQUIRED for admins only |
| Grace period | Number of days after account creation before MFA is enforced |
| Remember device | Allow users to skip MFA on the same device for N days |
| Backup codes | Allow users to generate emergency bypass codes (stored securely) |

**Recommendation:** Require MFA for all users with MANAGE or higher permission levels. Require it for all users if you process personal or sensitive data.

---

## Session Management

  Settings → Security → Sessions

| Setting | Recommended Value |
|---------|-----------------|
| Access token lifetime | 60 minutes |
| Refresh token lifetime | 7 days |
| Idle session timeout | 30 minutes |
| Maximum concurrent sessions per user | 3 |
| Force re-authentication for sensitive actions | Yes (payroll, user deletion, API key creation) |

### Session Monitoring

View all active sessions:
  Settings → Security → Sessions → Active Sessions

Administrators can terminate any session. Users can terminate their own sessions from:
  My Profile → Active Sessions

---

## Network Security

  Settings → Security → Network

### IP Allow List

Restrict IMS access to specific IP addresses or CIDR ranges:
- Office IP addresses
- VPN gateway IP
- CI/CD server IPs (for API access)

Enable IP allow listing for maximum security — note that this prevents access from unrecognised networks (including home working without VPN).

### TLS Configuration

IMS requires TLS 1.2 or higher for all connections. TLS 1.0 and 1.1 are disabled by default. Ensure your load balancer / reverse proxy enforces the same minimum.

### Security Headers

Default security headers applied by IMS:
- \`Strict-Transport-Security: max-age=31536000; includeSubDomains\`
- \`Content-Security-Policy\` (configurable — see [Settings → Security → CSP](/settings/security/csp))
- \`X-Frame-Options: DENY\`
- \`X-Content-Type-Options: nosniff\`
- \`Referrer-Policy: strict-origin-when-cross-origin\`

---

## API Security

- All API endpoints require authentication (no public endpoints except login and health check)
- Rate limiting applied to all endpoints (see [API Keys & Integrations](/knowledge-base#KB-AD-003))
- API keys can be scoped to specific modules and HTTP methods
- API key audit log: [Settings → API → API Keys → Audit Log](/settings/api/keys)

---

## Hardening Checklist

Complete these steps before go-live:

- [ ] Change default admin password from \`admin123\`
- [ ] Enable MFA for all admin accounts
- [ ] Configure password policy (min 14 chars, 90-day rotation)
- [ ] Enable breached password detection
- [ ] Set up SSO if using a corporate identity provider
- [ ] Configure IP allow list (if all users are office/VPN based)
- [ ] Review and minimise API key permissions
- [ ] Enable audit logging (all admin actions)
- [ ] Configure session timeout (30-minute idle)
- [ ] Schedule quarterly access reviews (user roles and permissions)

---

## See Also

- [Single Sign-On Configuration](/knowledge-base#KB-AD-002)
- [Audit Trail & Compliance Logging](/knowledge-base#KB-AD-010)
- [Backup, Recovery & Data Retention](/knowledge-base#KB-AD-006)
`,
  },

  {
    id: 'KB-AD-008',
    title: 'System Health & Performance Monitoring',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['monitoring', 'health', 'performance', 'uptime', 'grafana', 'alerts', 'admin'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# System Health & Performance Monitoring

## Overview

IMS includes built-in service health monitoring, performance metrics, and alerting via Prometheus and Grafana. The Admin Console provides a simplified health dashboard for non-technical administrators.

**Navigate to:** [Settings → System → Health](/settings/system/health) (simplified view)
**Grafana dashboards:** Available at port 3100 (or as configured in your deployment)

---

## Service Health Dashboard

  Settings → System → Health

The health dashboard shows the status of all 43 API services and 44 web applications:

| Status | Meaning |
|--------|---------|
| 🟢 Healthy | Service is running and responding normally |
| 🟡 Degraded | Service is running but response times are elevated |
| 🔴 Unhealthy | Service is not responding or returning errors |
| ⚫ Unknown | Health check has not returned recently |

Each service shows:
- Current status
- Response time (p50, p95, p99)
- Error rate (last 5 minutes)
- Uptime (last 30 days)

### Health Check Endpoint

All services expose \`GET /health\` (returns 200 OK with \`{ "status": "ok" }\`).

You can integrate this with external monitoring (Pingdom, Datadog, etc.) to receive independent uptime alerts.

---

## Grafana Monitoring Dashboards

IMS ships with 4 pre-built Grafana dashboards:

### 1. Service Overview
- Request rate per service (req/s)
- Error rate per service (%)
- P95 response time per service (ms)
- Active connections

### 2. Database Performance
- Query execution time (P50, P95)
- Active connections per schema
- Slow query log (queries > 1 second)
- Connection pool utilisation

### 3. Infrastructure
- CPU and memory per container
- Disk I/O and free space
- Network throughput in/out
- Container restart count (indicates crashes)

### 4. Business KPIs (SLO Monitoring)
- Module availability SLO (target: 99.9%)
- API success rate SLO (target: 99.5%)
- P95 response time SLO (target: < 500ms)
- SLO burn rate alerts (page when burn rate is unsustainable)

---

## Alert Rules

IMS includes 19 pre-configured alert rules in Prometheus Alertmanager:

| Alert | Threshold | Severity |
|-------|----------|---------|
| API error rate high | > 5% for 5 min | WARNING |
| API error rate critical | > 20% for 2 min | CRITICAL |
| Response time elevated | P95 > 2s for 5 min | WARNING |
| Service down | Health check failing for 1 min | CRITICAL |
| Database connection pool full | > 90% used | WARNING |
| Disk space low | < 20% free | WARNING |
| Disk space critical | < 10% free | CRITICAL |
| High CPU | > 85% for 10 min | WARNING |
| High memory | > 90% for 5 min | WARNING |

Configure alert destinations (email, Slack, PagerDuty) in the Alertmanager configuration.

---

## Log Access

Application logs are available:
- **Docker:** \`docker logs ims-api-{service}\`
- **Log aggregation:** If ELK stack or Loki is configured, query logs via Kibana or Grafana Explore
- **Admin Console log viewer:** [Settings → System → Logs](/settings/system/logs) — last 1,000 log lines per service

Log levels: ERROR → WARN → INFO → DEBUG (default: INFO in production)

Change log level temporarily:
  Settings → System → Logs → [Service] → Change Log Level (takes effect immediately, resets on restart)

---

## Performance Optimisation

If response times are elevated:

### Database
- Check slow query log for queries > 500ms
- Verify indexes are in place (contact Nexara support for index analysis)
- Check active connection count — if near pool limit, increase pool size in env config

### Application
- Check for recent deployments that may have introduced regressions
- Review container memory — if near limit, increase memory allocation
- Check for background jobs consuming resources (bulk imports, large report generation)

### Network
- Check gateway routing — confirm requests are reaching the correct service
- Verify no network saturation between services

---

## Uptime and Incident History

  Settings → System → Incidents

View historical uptime incidents:
- Date and time of each incident
- Affected services
- Duration
- Root cause (once documented)
- Post-incident review (for CRITICAL incidents)

---

## See Also

- [Backup, Recovery & Data Retention](/knowledge-base#KB-AD-006)
- [API Keys & External Integrations](/knowledge-base#KB-AD-003)
- [Security Settings & Hardening](/knowledge-base#KB-AD-007)
`,
  },

  {
    id: 'KB-AD-009',
    title: 'Multi-Site & Multi-Organisation Configuration',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['multi-site', 'multi-org', 'locations', 'subsidiaries', 'enterprise', 'admin'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Multi-Site & Multi-Organisation Configuration

## Overview

IMS supports organisations operating across multiple physical sites and, for enterprise customers, multiple subsidiary organisations. Understanding the configuration options helps you structure IMS to match your operational model.

**Navigate to:** [Settings → Organisation → Sites](/settings/organisation/sites)

---

## Site vs Organisation

| Concept | Description | Use Case |
|---------|-------------|---------|
| **Site** | A physical location within one legal entity | Manufacturing plants, offices, warehouses |
| **Organisation** | A separate legal entity | Subsidiaries, acquired companies, JV partners |

Most businesses configure sites within a single organisation. Multi-organisation is for enterprise groups managing multiple legal entities under one IMS platform.

---

## Configuring Multiple Sites

### 1. Create Sites

  Settings → Organisation → Sites → New Site

For each site:
- **Site name** — e.g., "Manchester Plant", "London HQ", "Dubai Office"
- **Site code** — Short identifier used in reference numbers (e.g., MCR, LDN, DXB)
- **Address** — Full address (used on reports and regulatory filings)
- **Time zone** — Used for timestamps and scheduling
- **Site manager** — Responsible person (linked to HR employee)
- **Site type** — Manufacturing / Office / Warehouse / Remote / Laboratory

### 2. Assign Users to Sites

  Settings → Users → [User] → Sites

Users can be assigned to one or more sites. Their data access is filtered by site assignment (configurable — see below).

### 3. Configure Site-Based Data Scoping

  Settings → Organisation → Data Scoping

Choose how data is scoped by site:

- **Open** — All users see all data from all sites (default; good for small organisations)
- **Site-scoped** — Users only see data from their assigned site(s) by default, with a "switch site" option for those with multi-site access
- **Strict** — Users only ever see data from their assigned site(s); no cross-site access unless granted explicitly

### 4. Site-Level Reporting

Most module reports and dashboards can be filtered by site:
  [Module] → Reports → Filter by Site: [Select]

Management-level roles can compare performance across all sites in the Analytics module.

### 5. Site-Specific Configuration

Certain settings can be configured at site level rather than organisation level:
- PPE requirements (H&S module)
- Emergency contacts and assembly points
- PTW authorising authorities
- Energy meters and baselines
- Local regulatory requirements (for international operations)

Navigate to the relevant module settings and look for the **Site** dropdown to configure per-site.

---

## Multi-Organisation (Enterprise)

Available on Enterprise plan. Each organisation has:
- Its own data siloed from other organisations
- Its own user accounts (cross-organisation users require explicit invitation)
- Its own module configuration and branding
- Consolidated reporting at group level via the Group Dashboard

### Creating a Child Organisation

  Settings → Group → Organisations → New Organisation

- Organisation name and legal entity details
- Country and currency
- Admin user email (will receive invitation to set up the organisation)
- Plan (can differ from parent — e.g., parent has Enterprise, subsidiary has Professional)
- Modules to activate

### Group-Level Reporting

Group administrators have access to consolidated reports across all organisations:
  Analytics → Group Dashboard

Available consolidated views:
- Incident rates across all organisations (normalised by headcount)
- ESG metrics consolidated (for group-level GHG reporting)
- Risk landscape across all entities
- Compliance status per organisation

### Cross-Organisation Users

Some users (Group CEO, Group HSEQ Director, External Auditor) may need access across organisations:
  Settings → Group → Cross-Organisation Users → Add

Select the user and the organisations they have access to. Their access level is configured per organisation.

---

## Reference Number Prefixes

When operating multi-site, use site codes in reference numbers to avoid confusion:
  [Module] → Settings → Reference Numbers → Template

Example templates:
- \`{siteCode}-INC-{year}-{seq}\` → MCR-INC-2026-001 (Manchester incident)
- \`{siteCode}-RA-{year}-{seq}\` → LDN-RA-2026-001 (London risk assessment)

---

## See Also

- [Setting Up Your Organisation Profile](/knowledge-base#KB-GS-003)
- [Managing Users, Roles & Permissions](/knowledge-base#KB-GS-004)
- [Audit Trail & Compliance Logging](/knowledge-base#KB-AD-010)
`,
  },

  {
    id: 'KB-AD-010',
    title: 'Audit Trail & Compliance Logging',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['audit-trail', 'logging', 'compliance', 'gdpr', 'iso-27001', 'traceability', 'admin'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Audit Trail & Compliance Logging

## Overview

IMS maintains a tamper-evident audit trail of all user actions across the platform. The audit log is immutable — entries cannot be edited or deleted, even by system administrators. This satisfies requirements from ISO 27001 Clause 9.1, ISO 9001 Clause 7.5, UK GDPR Article 5(2), and most regulatory frameworks.

**Navigate to:** [Settings → Security → Audit Log](/settings/security/audit-log)

---

## What is Logged

Every user action that creates, modifies, or deletes data generates an audit log entry:

| Action Type | Examples |
|------------|---------|
| CREATE | New incident reported, new user invited, new risk assessment |
| READ | Document viewed, report exported, record accessed |
| UPDATE | Incident status changed, user role updated, document revised |
| DELETE | Record archived / soft-deleted, user suspended |
| LOGIN | Successful login, failed login attempt, MFA challenge |
| LOGOUT | Session ended (manual or timeout) |
| CONFIG | Settings changed, module enabled/disabled, notification rules updated |
| EXPORT | Data exported to CSV, API data accessed |
| APPROVE | Record approved, workflow step completed |

### What Each Log Entry Contains

- **Timestamp** — UTC timestamp to millisecond precision
- **User** — Email, user ID, and display name of the acting user
- **IP address** — Originating IP (includes proxy chain awareness)
- **User agent** — Browser or API client identifier
- **Action type** — CREATE / UPDATE / DELETE / LOGIN / etc.
- **Resource type** — Which module and data entity was affected
- **Resource ID** — The specific record affected
- **Changes** — Before and after values for all changed fields (UPDATE events)
- **Result** — SUCCESS or FAILURE (with error detail)
- **Session ID** — Links all actions in one session together

---

## Viewing the Audit Log

  Settings → Security → Audit Log

### Filters Available

- **Date range** — From/to date picker
- **User** — Filter by specific user
- **Action type** — LOGIN, CREATE, UPDATE, DELETE, etc.
- **Module** — Filter to one module (e.g., H&S, Finance)
- **Resource type** — e.g., Incident, User, Document
- **IP address** — Investigate activity from a specific IP
- **Result** — SUCCESS or FAILURE

### Searching for Specific Changes

To investigate who changed a specific record:
1. Navigate to the record in the relevant module
2. Click the **History** tab (available on all records)
3. View all changes with user, timestamp, and field-by-field diff

---

## Compliance Reports

### Failed Login Report

  Audit Log → Reports → Failed Logins

Shows all failed authentication attempts over a selected period:
- User attempting login
- IP address
- Number of failed attempts
- Whether account was locked

Use to identify brute force attacks or shared credential problems.

### Privilege Escalation Report

  Audit Log → Reports → Permission Changes

Lists all changes to user roles and module permissions:
- Who changed the permission
- Which user was affected
- Old permission level → New permission level
- Date and time

### Data Export Report

  Audit Log → Reports → Data Exports

Records all instances of data exported from the system — important for GDPR data minimisation audits.

### Administrator Actions Report

  Audit Log → Reports → Admin Actions

Filters all CONFIG events to show system-level configuration changes — useful for change management audits.

---

## Log Retention and Export

Audit logs are retained for **7 years** by default (this period cannot be shortened as it meets legal requirements in most jurisdictions).

### Export Audit Logs

  Audit Log → Export → Select date range → Format (CSV / JSON)

Exports can be scheduled for regular delivery to a SIEM (Security Information and Event Management) system.

### SIEM Integration

For real-time log forwarding to a SIEM (Splunk, Microsoft Sentinel, IBM QRadar):
  Settings → Security → Audit Log → SIEM Integration

Configure:
- Protocol: Syslog / HTTP POST (JSON)
- Endpoint URL or syslog server address
- Authentication token (if HTTP)
- Log format: CEF / LEEF / JSON

---

## Immutability and Integrity

The audit log uses an append-only data model:
- No UPDATE or DELETE operations are permitted on the audit table at the database level
- Row-level Security (RLS) enforced via PostgreSQL — only the audit writer role can insert
- Daily hash chain: each day's log is signed with a SHA-256 hash of the previous day's hash, creating a tamper-evident chain
- Export includes the hash chain data for independent verification

---

## See Also

- [Security Settings & Hardening](/knowledge-base#KB-AD-007)
- [Backup, Recovery & Data Retention](/knowledge-base#KB-AD-006)
- [RBAC Complete Reference](/knowledge-base#KB-AD-001)
`,
  },
];
