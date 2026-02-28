import type { KBArticle } from '../types';

export const faqArticles: KBArticle[] = [
  {
    id: 'KB-FAQ-001',
    title: "I Can't Log In — Troubleshooting Login Issues",
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['login', 'access', 'troubleshooting', 'password', 'account'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# I Can't Log In — Troubleshooting Login Issues

## Quick Checklist

Before contacting support, work through this checklist:

- [ ] I am using the correct login URL (check with your administrator)
- [ ] I am using my registered email address (not a nickname or alias)
- [ ] Caps Lock is not on when typing my password
- [ ] I have tried the [password reset process](/knowledge-base#KB-FAQ-002)
- [ ] I am not on a blocked network (check with IT if you use an IP allow list)

---

## Common Login Problems

### "Invalid email or password"

The email and password combination doesn't match any account.

**Solutions:**
1. Check you are typing the exact email used when your account was created
2. Check for leading/trailing spaces in the email field
3. Try resetting your password: click **Forgot Password** on the login page
4. Contact your IMS administrator to confirm your account exists and is active

### "Your account has been locked"

After 5 consecutive failed login attempts, the account is temporarily locked for 30 minutes.

**Solutions:**
1. Wait 30 minutes and try again
2. Use **Forgot Password** to reset immediately and bypass the lockout
3. Contact your administrator to unlock the account immediately: [Settings → Users → \\[User\\] → Unlock Account](/settings/users)

### "Your account has been suspended"

An administrator has manually suspended your account.

**Solution:** Contact your IMS administrator to reactivate your account.

### "Your invitation has expired"

New user invitation links expire after 72 hours.

**Solution:** Ask your administrator to resend the invitation: [Settings → Users → \\[User\\] → Resend Invitation](/settings/users)

### SSO / Single Sign-On issues

If your organisation uses SSO (Okta, Azure AD, Google):
1. Ensure you are clicking **Sign in with [Provider]** and NOT entering a password manually
2. Try clearing your browser cache and cookies
3. If you get "Access denied" from the identity provider, contact your IT team — your account may not be in the right SSO group
4. If you get an IMS error after SSO succeeds, contact your IMS administrator

For SSO setup problems, see [Single Sign-On Configuration](/knowledge-base#KB-AD-002).

### MFA code not accepted

1. Ensure your authenticator app clock is correct (TOTP is time-sensitive; clock skew > 30 seconds causes failures)
2. On Android/iOS: check your device's automatic date and time setting is enabled
3. If you have lost your authenticator app, use one of your backup codes
4. If you have no backup codes, contact your IMS administrator to reset your MFA

### Page not loading / blank screen

1. Clear your browser cache: Ctrl+Shift+Delete (Windows) / Cmd+Shift+Delete (Mac)
2. Try a different browser (Chrome, Firefox, Edge — latest version)
3. Try an incognito / private window
4. Disable browser extensions temporarily
5. If the issue persists, check if your IMS instance is experiencing an outage: [Settings → System → Health](/settings/system/health)

---

## Default Test Credentials

For new installations only (change these immediately after first login):
- Email: admin@ims.local
- Password: admin123

If these have already been changed (as they should be), there is no way to recover them — use Forgot Password or contact Nexara support.

---

## Still Stuck?

- **AI Assistant:** Use the [AI Assistant](/chat) in the Admin Console for guided troubleshooting
- **Contact support:** [KB-FAQ-010](/knowledge-base#KB-FAQ-010)
- **Related:** [How do I reset my password?](/knowledge-base#KB-FAQ-002)
`,
  },

  {
    id: 'KB-FAQ-002',
    title: 'How Do I Reset My Password?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['password', 'reset', 'account', 'forgotten', 'security'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# How Do I Reset My Password?

## Self-Service Reset (Recommended)

1. Navigate to the IMS login page
2. Click **Forgot your password?** below the login form
3. Enter your registered email address
4. Click **Send reset link**
5. Check your email inbox (including spam/junk folder) for a message from noreply@ims.local (or your configured sender)
6. Click the reset link in the email — it is valid for **4 hours**
7. Enter your new password twice
8. Click **Set New Password**

Your account is immediately accessible with the new password.

---

## Password Requirements

Your new password must meet the policy set by your administrator. The default policy requires:
- Minimum 12 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (e.g., ! @ # $ % ^ &)
- Not one of your last 5 passwords

The form will show a strength indicator and flag any requirement not yet met.

---

## Changing Your Password (When Already Logged In)

If you simply want to change a password you already know:

1. Click your avatar / name in the top right
2. Select **My Profile**
3. Click [**Security**](/profile/security)
4. Enter your current password
5. Enter and confirm your new password
6. Click **Save**

---

## Administrator Reset (for Locked or Unavailable Email)

If a user cannot receive the reset email (e.g., email address has changed):

1. Log in as an administrator
2. Navigate to [Settings → Users → \\[User\\]](/settings/users)
3. Click **Reset Password**
4. Enter a temporary password
5. Enable **Force password change on next login**
6. Click **Save** and communicate the temporary password to the user securely

---

## Offboarding — Changing a Former Employee's Account

When a staff member leaves:
1. [Settings → Users → \\[User\\] → **Suspend Account**](/settings/users) — immediately blocks all access
2. Do NOT delete the account — their records and audit trail must remain linked to their user ID
3. Optionally change their email to a placeholder (e.g., john.smith.LEAVER@yourcompany.com) to free the email for a new user

---

## Related Articles

- [I Can't Log In — Troubleshooting](/knowledge-base#KB-FAQ-001)
- [Security Settings & Hardening](/knowledge-base#KB-AD-007)
- [Managing Users, Roles & Permissions](/knowledge-base#KB-GS-004)
`,
  },

  {
    id: 'KB-FAQ-003',
    title: 'How Do I Generate a Compliance Report?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['reports', 'compliance', 'export', 'pdf', 'iso', 'management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# How Do I Generate a Compliance Report?

## Types of Reports Available

IMS generates several categories of compliance report:

| Report Type | Location | Description |
|------------|---------|-------------|
| Module summary report | Each module → Reports | KPIs, trends, and record summary for one module |
| Management review pack | Mgmt Review → Reports | Full ISO management review inputs and outputs |
| ESG report | ESG → Reports | GHG emissions, social metrics, GRI/SASB/TCFD aligned |
| Audit report | Audits → [Audit] → Export | Findings, nonconformities, and corrective actions |
| Incident statistics | H&S → Reports → Incidents | LTIFR, TRIR, severity breakdown |
| Legal compliance evaluation | H&S or Env → Legal → Report | Compliance status for all legal obligations |
| Risk report | Risk → Reports | Risk landscape, treatment status, residual risk summary |
| Training compliance report | Training → Reports | % of staff trained, expiring/expired records |
| Dashboard PDF | Analytics → Dashboards → Export PDF | Any dashboard as a formatted PDF |

---

## Generating a Module Report

1. Navigate to the relevant module (e.g., Health & Safety)
2. Click **Reports** in the module navigation
3. Select the report type
4. Set the date range (e.g., January 2026 – December 2026)
5. Apply any filters (site, department, category)
6. Click **Generate Report**
7. Preview the report in-browser
8. Click **Export PDF** or **Export Excel**

---

## Generating a Management Review Pack

The management review pack consolidates KPIs from all active modules:

1. Navigate to [Management Review → \\[Review\\] → Generate Pack](/mgmt-review)
2. Select the standards to include (ISO 9001, ISO 14001, ISO 45001, etc.)
3. Select the review period
4. The system auto-populates all inputs from connected modules
5. Add narrative commentary in the text fields
6. Click **Generate PDF Pack**

The PDF includes:
- Executive summary
- All standard-required input topics with data
- Action items from the previous review
- New actions arising from this review

---

## Scheduled Reports

For reports that are needed regularly (weekly, monthly, quarterly):
1. Navigate to [Analytics → Reports → New Scheduled Report](/analytics/reports)
2. Select the report type and configuration
3. Set the schedule (e.g., 1st of every month)
4. Add recipients (email addresses)
5. Select format (PDF / Excel)
6. Click **Save Schedule**

The report generates automatically and is emailed to recipients on the schedule.

---

## Sharing Reports Externally

To share a report with an external auditor or certification body:
1. Generate the report as a PDF
2. The PDF includes your organisation logo, report date, and data range
3. For audit evidence packs, use [Audits → Evidence Pack → Generate](/audits) to bundle multiple reports

For ongoing external access (e.g., for a retained auditor), invite them as a VIEWER role user so they can access reports directly in IMS.

---

## Related Articles

- [Analytics & Reporting Setup Guide](/knowledge-base#KB-MG-035)
- [Management Review Setup Guide](/knowledge-base#KB-MG-027)
- [Audit Management Setup Guide](/knowledge-base#KB-MG-010)
`,
  },

  {
    id: 'KB-FAQ-004',
    title: 'How Do I Add a New User?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['users', 'invite', 'add-user', 'onboarding', 'roles', 'getting-started'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# How Do I Add a New User?

## Quick Answer

Navigate to [Settings → Users → Invite User](/settings/users) and fill in the form.

---

## Step-by-Step

### 1. Go to User Management

  Settings → Users → Invite User

(You need SYSTEM_ADMIN or MODULE_ADMIN permission to invite users.)

### 2. Fill In the Invite Form

Required:
- **Email address** — The user's work email. The invitation is sent here.
- **First name** and **Last name**
- **Role** — Select the appropriate role from the dropdown (see the [RBAC Reference](/knowledge-base#KB-AD-001) for role descriptions)

Optional:
- **Department** — Used for filtering and reporting
- **Job title**
- **Sites** — Which site(s) the user has access to (if multi-site configured)

### 3. Click "Send Invitation"

The user receives an email with a secure link to:
1. Set their password
2. Optionally set up MFA
3. Access the IMS dashboard

Invitation links are valid for **72 hours**. If the user doesn't activate within 72 hours, resend the invitation: [Settings → Users → \\[User\\] → Resend Invitation](/settings/users).

---

## Choosing the Right Role

| If the user is... | Assign role... |
|-------------------|--------------|
| Your main IT / system administrator | SYSTEM_ADMIN |
| Responsible for H&S management | HS_MANAGER |
| An H&S officer | HS_OFFICER |
| A general employee who needs to report incidents | EMPLOYEE |
| A quality manager | QUALITY_MANAGER |
| A finance approver | FINANCE_MANAGER |
| An external auditor (read-only) | VIEWER |
| A customer using the Customer Portal | CUSTOMER_PORTAL_USER |

For a full role list, see [RBAC Complete Reference](/knowledge-base#KB-AD-001).

---

## Bulk Inviting Users

To invite many users at once:
1. [Settings → Users → Import](/settings/users)
2. Download the CSV template
3. Fill in: email, firstName, lastName, role (one row per user)
4. Upload the CSV
5. IMS sends invitations to all valid rows

---

## Common Issues

**"Email already exists"** — The email is already registered. Use [Settings → Users → \\[User\\]](/settings/users) to manage the existing account.

**"User didn't receive the email"** — Check their spam/junk folder. Resend from [Settings → Users → \\[User\\] → Resend](/settings/users). Verify your email SMTP configuration: [Settings → Notifications → Email → Test](/settings/notifications/email).

**"I need to give a user access to only specific modules"** — First set their role, then go to [Settings → Users → \\[User\\] → Module Permissions](/settings/users) to override individual module levels.

---

## Related Articles

- [Managing Users, Roles & Permissions](/knowledge-base#KB-GS-004)
- [RBAC Complete Reference](/knowledge-base#KB-AD-001)
- [How Do I Reset My Password?](/knowledge-base#KB-FAQ-002)
`,
  },

  {
    id: 'KB-FAQ-005',
    title: 'What File Formats Can I Import?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['import', 'file-formats', 'csv', 'excel', 'data', 'migration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# What File Formats Can I Import?

## Data Record Imports

For importing records (users, employees, assets, incidents, etc.):

| Format | Supported | Notes |
|--------|-----------|-------|
| CSV (.csv) | ✅ Yes | Preferred format; UTF-8 encoding required |
| Excel (.xlsx) | ✅ Yes | First sheet is used; no merged cells |
| Excel (.xls) | ❌ No | Old format; save as .xlsx first |
| Google Sheets | Via export | Export as CSV from Google Sheets first |
| JSON | Via API | Use the REST API for programmatic imports |
| XML | ❌ No | Not supported for record imports |

### CSV Requirements

- **Encoding:** UTF-8 (not UTF-8 BOM, not ANSI)
- **Delimiter:** Comma (,) — not semicolon or tab
- **Headers:** First row must be column headers (exactly as in the template)
- **Dates:** ISO 8601 format — YYYY-MM-DD (e.g., 2026-03-15)
- **Booleans:** true / false (lowercase)
- **Maximum rows:** 10,000 per file (split larger files)
- **Maximum file size:** 10 MB

**Tip:** Always download the module's template CSV first: [Module] → Import → Download Template. Never modify the column headers.

---

## Document File Uploads

For uploading documents (policies, procedures, SDS, certificates):

| Format | Supported | Notes |
|--------|-----------|-------|
| PDF (.pdf) | ✅ Yes | Preferred for published documents |
| Word (.docx) | ✅ Yes | Editable in Document Control |
| Word (.doc) | ✅ Yes | |
| Excel (.xlsx, .xls) | ✅ Yes | Spreadsheet data and templates |
| PowerPoint (.pptx) | ✅ Yes | |
| Images (PNG, JPG, GIF, WEBP) | ✅ Yes | For evidence photos |
| ZIP archives | ✅ Yes | Document packs (extracted on upload) |
| Video (MP4) | ✅ Yes | Training videos (max 500 MB) |
| Text (.txt) | ✅ Yes | |
| CSV (.csv) | ✅ Yes | Data files attached as evidence |
| Executable (.exe, .bat, etc.) | ❌ No | Not permitted for security |
| Script files (.js, .py, .sh) | ❌ No | Not permitted for security |

Maximum document file size: **100 MB** per file (configurable up to 500 MB by admin).

---

## Logo and Image Uploads

For organisation logos and profile photos:

| Format | Supported | Recommended Size |
|--------|-----------|-----------------|
| PNG | ✅ Yes | 200×200px to 2000×2000px |
| JPG/JPEG | ✅ Yes | Same |
| SVG | ✅ Yes | Vector — scales to any size |
| GIF | ❌ No | Animated GIFs not permitted |
| BMP | ❌ No | Use PNG instead |

Maximum logo file size: **5 MB**.

---

## SDS (Safety Data Sheets)

SDS files must be:
- PDF format
- Maximum 20 MB per file
- In one of the supported languages (English, French, German, Spanish, and 15 others)

The system attempts to automatically extract hazard classifications from SDS PDFs. Manual verification is always required.

---

## Importing from Legacy Systems

If migrating from another QHSE system, common formats:

| Source System | Export Format | IMS Import |
|--------------|--------------|-----------|
| SafetyCulture iAuditor | CSV export | Import as incidents or inspection records |
| Intelex | CSV export | Transform to IMS template format |
| Ideagen Q-Pulse | Excel export | Transform to IMS template format |
| Sharepoint lists | Export to Excel/CSV | Import via CSV |
| Paper records | Manual data entry | Use bulk import CSV |

For large data migrations (> 50,000 records), contact Nexara Professional Services for assisted migration support.

---

## Related Articles

- [Data Import & Export Guide](/knowledge-base#KB-AD-005)
- [API Keys & External Integrations](/knowledge-base#KB-AD-003)
`,
  },

  {
    id: 'KB-FAQ-006',
    title: "Why Am I Not Receiving Email Notifications?",
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['notifications', 'email', 'alerts', 'troubleshooting', 'smtp'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Why Am I Not Receiving Email Notifications?

## Diagnostic Steps (in order)

### 1. Check Your Spam / Junk Folder

IMS notification emails may be filtered as spam by some mail servers. Check your spam/junk folder for emails from noreply@ims.local (or your configured sender).

**Fix:** Mark the email as "Not spam" and add the sender to your safe senders list.

### 2. Check Your Notification Preferences

You may have unsubscribed from this notification type:
1. Click your avatar → [My Profile → Notification Preferences](/profile/notifications)
2. Check that the relevant notification types are enabled
3. Check you are set to **email** delivery (not in-app only)

### 3. Verify the SMTP Configuration (Admin)

The email server configuration may be incorrect:
1. Navigate to [Settings → Notifications → Email](/settings/notifications/email)
2. Click **Send Test Email**
3. If the test email fails, check:
   - SMTP host and port (common: smtp.office365.com:587, smtp.gmail.com:587, smtp.sendgrid.net:587)
   - Authentication credentials (username and password or API key)
   - TLS/STARTTLS enabled? (required by most modern SMTP servers)
4. Check the error message shown after the failed test for the specific cause

### 4. Check That Notification Rules Are Configured

Some notifications require explicit configuration:
  [Settings → Notifications → Rules](/settings/notifications/rules)

Verify the relevant rule exists and that you are in the recipient list.

### 5. Check the Module Notification Settings

Each module has its own notification settings. For example, H&S incident notifications:
  H&S → Settings → Notifications → Incident Alerts

Verify your email is listed as a recipient for the relevant event type and severity.

### 6. Check User Role Permissions

Some notifications are only sent to users with certain permission levels. If you don't have at least VIEW access to a module, you won't receive notifications from it.

Check your permissions at: [Settings → Users → \\[Your User\\] → Module Permissions](/settings/users)

---

## "I receive in-app notifications but not emails"

This confirms the event is being triggered correctly but email delivery is failing.

Check:
1. SMTP configuration (see Step 3 above)
2. Your email notification preference (see Step 2 above)
3. Whether your organisation's email server is blocking the sender domain

---

## "I receive emails but not in-app notifications"

In-app notifications require a stable WebSocket connection. Check:
1. Browser compatibility: use Chrome, Firefox, or Edge (latest version)
2. Network: check that WebSocket connections are not blocked by a firewall or proxy
3. Refresh the page: the notification bell should update

---

## Email Allow-Listing for IT Teams

Ask your IT team to allow-list the following to ensure IMS emails are delivered:
- **From address:** noreply@yourims.domain (or your configured sender)
- **Sending IP:** (provided by Nexara for your deployment)
- **SPF record:** Check that the IMS sending IP is included in your domain's SPF record
- **DKIM:** Enable DKIM signing in [Settings → Notifications → Email → DKIM](/settings/notifications/email)

---

## Related Articles

- [Notification Configuration Guide](/knowledge-base#KB-AD-004)
- [Workflows & Automation](/knowledge-base#KB-MG-019)
`,
  },

  {
    id: 'KB-FAQ-007',
    title: 'What Happens to Data When I Disable a Module?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['modules', 'disable', 'data', 'archive', 'restore'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# What Happens to Data When I Disable a Module?

## Short Answer

**Your data is completely safe.** Disabling a module hides its interface and stops its API service, but all data remains intact in the database. Re-enabling the module immediately restores access to all historical data.

---

## What "Disabling" Does

When you disable a module:

| What Changes | What Stays the Same |
|-------------|-------------------|
| Module removed from sidebar navigation | All records and data in the database |
| Module API service stopped | Audit trail of all past actions |
| Notifications from this module paused | Document attachments and uploaded files |
| Module not included in dashboards | Cross-module links (e.g., risk linked to incident) |
| Users cannot access the module pages | Workflow history related to this module |

---

## Disabling a Module

  Settings → Modules → \\[Module Name\\] → Disable

You will see a confirmation dialog reminding you that data is preserved. Type CONFIRM to proceed.

---

## Re-Enabling a Module

  Settings → Modules → \\[Module Name\\] → Enable

The module reactivates within 30–60 seconds. All historical data is immediately available again. No re-configuration is required.

---

## Permanent Data Deletion

Disabling is reversible. If you need to permanently delete module data (for example, when offboarding and the data is no longer required):

1. Contact Nexara support — permanent deletion cannot be self-served
2. Provide: the module name, date range to delete, and written confirmation from your DPO/legal team
3. Permanent deletion is irreversible and documented in your account's admin audit log

**When is permanent deletion appropriate?**
- End of a contract period where data retention is no longer legally required
- GDPR right to erasure for an individual's personal data within a module
- A test/sandbox installation being decommissioned

---

## Module Dependency Warnings

Some modules depend on others:

| If you disable... | It affects... |
|------------------|--------------|
| HR | Payroll cannot process (employee records missing) |
| HR | Training records lose the employee link |
| Inventory | CMMS parts consumption tracking stops |
| Document Control | Document links from other modules become broken |
| Risk | Risk-linked incidents and NCRs lose the risk link |

The system will warn you of these dependencies before allowing you to disable.

---

## Related Articles

- [Enabling & Configuring Modules](/knowledge-base#KB-GS-005)
- [Backup, Recovery & Data Retention](/knowledge-base#KB-AD-006)
`,
  },

  {
    id: 'KB-FAQ-008',
    title: 'How Do I Configure IMS for Multiple Sites?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['multi-site', 'locations', 'sites', 'configuration', 'enterprise'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# How Do I Configure IMS for Multiple Sites?

## Quick Answer

Create your sites in [Settings → Organisation → Sites → New Site](/settings/organisation/sites), assign users to their site(s), and optionally enable site-based data scoping.

For detailed guidance, see the full [Multi-Site & Multi-Organisation Configuration guide](/knowledge-base#KB-AD-009).

---

## When to Use Sites vs Organisations

- **Sites** = Multiple physical locations of the same company (plant A, plant B, head office)
- **Organisations** = Legally separate entities (subsidiaries, acquired companies)

If you're just setting up multiple locations of one company, use **Sites**.

---

## Quick Setup Steps

### 1. Create your sites

  Settings → Organisation → Sites → New Site

For each location:
- Site name (e.g., "Manchester Plant")
- Site code (e.g., MCR) — used in reference numbers
- Address, timezone, and site manager

### 2. Assign users to sites

  Settings → Users → \\[User\\] → Sites

Each user is assigned their primary site(s). If a user works across all sites, assign them to all.

### 3. Choose data scoping

  Settings → Organisation → Data Scoping

- **Open:** All users see all sites' data (fine for small organisations)
- **Site-scoped:** Users see their site by default, with option to switch
- **Strict:** Users can only ever see their own site's data

### 4. Configure site-specific settings (where applicable)

Some module settings can be set per-site:
- H&S: site-specific risk categories and emergency contacts
- Energy: site-specific meters and baselines
- PTW: site-specific authorising authorities

Navigate to the module settings and look for the **Site** selector.

---

## Cross-Site Reporting

Users with multi-site access can compare sites in reports:
  Analytics → Dashboards → Filter by Site: All Sites

Management-level users see a side-by-side comparison of KPIs per site.

---

## Reference Numbers

Include the site code in record reference numbers:
  H&S → Settings → Reference Numbers → Template → \`{siteCode}-INC-{year}-{seq}\`

This produces: MCR-INC-2026-001 for Manchester, LDN-INC-2026-001 for London.

---

## Related Articles

- [Multi-Site & Multi-Organisation Configuration](/knowledge-base#KB-AD-009)
- [Setting Up Your Organisation Profile](/knowledge-base#KB-GS-003)
`,
  },

  {
    id: 'KB-FAQ-009',
    title: 'What Are the System Requirements for IMS?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['system-requirements', 'browser', 'hardware', 'network', 'mobile', 'compatibility'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# What Are the System Requirements for IMS?

## For End Users (Browser-Based Access)

IMS is a web application — no software installation required. Users access it through a web browser.

### Supported Browsers

| Browser | Minimum Version | Notes |
|---------|---------------|-------|
| Google Chrome | 110+ | Recommended |
| Mozilla Firefox | 110+ | Fully supported |
| Microsoft Edge | 110+ | Fully supported |
| Apple Safari | 16+ | Supported (Mac and iOS) |
| Opera | 96+ | Supported |
| Internet Explorer 11 | ❌ Not supported | Use Edge instead |

**Recommended:** Always use the latest version of your browser for best performance and security.

### Device Requirements

| Device Type | Minimum Spec |
|------------|-------------|
| Desktop / Laptop | Any modern PC/Mac capable of running the above browsers |
| RAM | 4 GB minimum, 8 GB recommended |
| Screen resolution | 1280×768 minimum, 1920×1080 recommended |
| Internet connection | 5 Mbps minimum per user, 25 Mbps recommended |
| Tablet (iPad, Android) | Safari 16+ or Chrome 110+ (mobile-responsive interface) |
| Smartphone | Supported for incident reporting and basic access; full dashboard best on tablet/desktop |

### Network Requirements

- HTTPS (port 443) must be open to your IMS domain
- WebSocket connections (for real-time notifications) must not be blocked by firewall/proxy
- If using SSO: SAML redirect traffic must be permitted between IMS and your identity provider

---

## For Server/Infrastructure (Self-Hosted Deployments)

If you are self-hosting IMS (on-premises or private cloud):

### Minimum Server Specification

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 8 cores | 16+ cores |
| RAM | 32 GB | 64 GB |
| Storage | 500 GB SSD | 2 TB SSD (NVMe preferred) |
| OS | Ubuntu 22.04 LTS / CentOS 8 / RHEL 8 | Ubuntu 22.04 LTS |
| Docker | 24.0+ | Latest stable |
| Docker Compose | 2.20+ | Latest stable |
| PostgreSQL | 15+ | 16+ (included in Docker Compose) |
| Redis | 7+ | 7+ (included in Docker Compose) |
| Node.js | 20 LTS | 22 LTS |

### Database Storage Estimates

| Organisation Size | Monthly Data Growth | 3-Year Storage Estimate |
|------------------|-------------------|------------------------|
| Small (<100 users) | ~500 MB | ~20 GB |
| Medium (100–500 users) | ~2 GB | ~75 GB |
| Large (500–2,000 users) | ~8 GB | ~290 GB |
| Enterprise (2,000+ users) | ~20 GB+ | ~750 GB+ |

### Network Ports Required (Server)

| Service | Port | Direction |
|---------|------|-----------|
| HTTPS (load balancer) | 443 | Inbound |
| HTTP redirect | 80 | Inbound |
| PostgreSQL | 5432 | Internal only |
| Redis | 6379 | Internal only |
| API Gateway | 4000 | Internal |
| API services | 4001–4050 | Internal |
| Web apps | 3000–3045 | Internal |
| Grafana | 3100 | Internal / admin only |

---

## Cloud-Hosted (SaaS) Requirements

For organisations using the Nexara-hosted SaaS version:
- No server infrastructure required
- Just a supported browser and internet connection
- Uptime SLA: 99.9% (see your contract for specifics)
- Data residency: EU (default), UK, or US — specified at contract time

---

## Related Articles

- [System Health & Performance Monitoring](/knowledge-base#KB-AD-008)
- [Backup, Recovery & Data Retention](/knowledge-base#KB-AD-006)
- [I Can't Log In — Troubleshooting](/knowledge-base#KB-FAQ-001)
`,
  },

  {
    id: 'KB-FAQ-010',
    title: 'How Do I Get Support?',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['support', 'help', 'contact', 'ticket', 'sla', 'training'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# How Do I Get Support?

## Self-Service First

Before raising a support ticket, please check:

1. **This Knowledge Base** — [Browse all articles](/knowledge-base) or use the search bar
2. **AI Assistant** — The [AI Assistant](/chat) in the Admin Console can answer many questions instantly
3. **In-app help** — Click the **?** icon on any page for contextual help
4. **Tooltips** — Hover over field labels and buttons for descriptions

---

## Support Channels

### AI Assistant (Instant)

Available 24/7 in the Admin Console:
  [Admin Console → AI Assistant (sidebar)](/chat)

The AI Assistant can:
- Answer questions about IMS features and configuration
- Guide you through step-by-step processes
- Diagnose common issues
- Provide links to relevant Knowledge Base articles

### Email Support

  support@nexara.io

Monitored Monday–Friday, 09:00–18:00 GMT. Response within 4 business hours on Professional plan; 2 hours on Enterprise.

Include in your email:
- Your organisation name
- The module or feature affected
- A description of the issue
- Steps to reproduce (if a bug)
- Screenshots or screen recordings (if relevant)

### Live Chat (Professional & Enterprise)

Available in the Admin Console bottom-right corner during support hours:
  Admin Console → Live Chat button

### Phone Support (Enterprise only)

Dedicated support phone line details are in your enterprise agreement. For P1 (system down) incidents, use the emergency phone number — available 24/7.

---

## Support Ticket Priorities

| Priority | Description | Response SLA |
|----------|-------------|-------------|
| P1 — Critical | System completely down; business operations halted | 30 minutes (Enterprise) / 2 hours (Professional) |
| P2 — High | Core functionality not working; significant impact | 2 hours (Enterprise) / 4 hours (Professional) |
| P3 — Medium | Feature not working but workaround available | 4 hours (Enterprise) / 8 hours (Professional) |
| P4 — Low | Minor issue or how-to question | 1 business day |

---

## Raising a Support Ticket

  Admin Console → Support → New Ticket

Or email support@nexara.io with subject line: \`[Priority] Brief description\`

Example: \`[P2] Incident reports not generating PDF after today's update\`

---

## Training & Onboarding

### Self-Guided Training

- [Getting Started guide series](/knowledge-base#KB-GS-001) — Start here if new to IMS
- [Module setup guides](/knowledge-base) — Detailed guides for each module
- Video tutorials: available within each module under **Help → Video Guides**

### Live Training Sessions

Nexara offers live online training sessions:
- **IMS Fundamentals** (3 hours) — For all users; covers login, navigation, and common tasks
- **Administrator Training** (1 day) — For system administrators; covers full configuration
- **Module-Specific Training** (2 hours each) — Deep-dive into one module

Book training sessions via: training@nexara.io

### On-Site Training

Available on Enterprise plan. Contact your Customer Success Manager.

---

## Customer Success Manager

Enterprise customers have a dedicated Customer Success Manager (CSM) who:
- Provides proactive check-ins and usage reviews
- Helps plan module rollouts
- Connects you with training resources
- Escalates technical issues

Contact your CSM via email (provided in your welcome email) or through the Admin Console:
  Admin Console → Onboarding → Your CSM

---

## Feedback & Feature Requests

To suggest a new feature or improvement:
  Admin Console → Feature Requests → Submit Request

Or email: feedback@nexara.io

---

## Related Articles

- [I Can't Log In — Troubleshooting](/knowledge-base#KB-FAQ-001)
- [What Are the System Requirements?](/knowledge-base#KB-FAQ-009)
- [Welcome to IMS — First Login](/knowledge-base#KB-GS-001)
`,
  },
];
