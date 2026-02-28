import type { KBArticle } from '../types';

export const howToGuides3Articles: KBArticle[] = [
  {
    id: 'KB-HT3-001',
    title: 'How to Set Up Equipment Calibration Schedule',
    content: `## How to Set Up Equipment Calibration Schedule

A well-maintained calibration schedule ensures measurement equipment remains accurate and compliant with ISO 9001 and other standards.

### Overview
Calibration scheduling tracks when each piece of equipment is due for calibration, records results, and triggers notifications for out-of-tolerance findings.

### Prerequisites
- Equipment already added to the asset register, or ready to add
- Calibration standards and acceptable tolerance ranges defined
- CMMS or Equipment Calibration module enabled

### Steps

1. Navigate to **CMMS** → **Equipment** → **Asset Register**.
2. Click **Add Equipment** or select an existing asset.
3. On the equipment record, open the **Calibration** tab.
4. Click **Configure Calibration Schedule**.
5. Set the **Calibration Frequency** (e.g. monthly, quarterly, annually).
6. Select the **Calibration Method** (internal, external laboratory, or on-site).
7. Enter the **Calibration Standard** reference (e.g. NIST traceable standard).
8. Set acceptable tolerance limits in the **Tolerance** field.
9. Click **Save Schedule**. The equipment now appears on the calibration due list.
10. Navigate to **CMMS** → **Calibration** → **Due List** to view upcoming calibrations.
11. When calibration is performed, open the equipment record and click **Record Calibration Result**.
12. Select the outcome: **Pass**, **Conditional Pass**, or **Fail**.
13. For **Fail** or **Conditional Pass**, the system automatically triggers an out-of-tolerance notification to the equipment owner and quality manager.
14. Attach the calibration certificate to the record.

### Tips
- Use bulk scheduling for equipment families with identical calibration intervals.
- Set reminder alerts 14 days before the due date to allow lead time for external labs.
- Link calibration records to relevant quality inspection records for full traceability.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'calibration', 'equipment', 'cmms'],
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
    id: 'KB-HT3-002',
    title: 'How to Configure a Training Matrix',
    content: `## How to Configure a Training Matrix

A training matrix maps job roles to required training items, making it easy to identify gaps and assign outstanding training in bulk.

### Overview
The training matrix gives managers a single view of which employees are competent, due for re-training, or have never completed required training.

### Prerequisites
- Job roles defined in HR settings
- Training items and courses created in the Training module
- Employees assigned to roles

### Steps

1. Navigate to **Training** → **Training Matrix**.
2. Click **Configure Matrix**.
3. Under **Roles**, click **Add Role** and select each job role from the HR role list.
4. For each role, click **Add Required Training** and select the applicable training items.
5. Set the **Training Frequency** for each item (one-off, annual, biennial, etc.).
6. Click **Save Matrix Configuration**.
7. The matrix populates automatically with all employees mapped to the selected roles.
8. Review the colour-coded grid: green = current, amber = due within 30 days, red = overdue, grey = not yet attempted.
9. Click **Generate Training Gap Report** to export a full list of outstanding items by employee.
10. To assign outstanding training in bulk, select the relevant cells in the gap report and click **Assign Training**.
11. Choose a due date and click **Send Assignments**.
12. As employees complete training, completion dates and expiry dates update automatically.

### Tips
- Re-training due dates are calculated automatically from completion date plus frequency.
- Use the **Filter by Department** option to focus on one team at a time.
- Attach competency evidence (certificates) directly to individual training records.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'training', 'competency'],
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
    id: 'KB-HT3-003',
    title: 'How to Create and Publish a Permit to Work',
    content: `## How to Create and Publish a Permit to Work

Permits to Work (PTW) control high-risk activities by ensuring hazards are identified, controls are in place, and the right people have authorised the work.

### Overview
The PTW module supports hot work, confined space entry, electrical isolation, working at height, and custom work types.

### Prerequisites
- PTW module enabled
- Authorised Person and Competent Person roles assigned in user management
- Work location and contractor (if applicable) records exist

### Steps

1. Navigate to **Permit to Work** → **New Permit**.
2. Enter the **Work Description** and select the **Work Type** (Hot Work, Confined Space, Electrical Isolation, Working at Height, or Other).
3. Select the **Work Location** from the site map or location list.
4. Set the **Planned Start Date/Time** and **Planned End Date/Time**.
5. In the **Hazards** section, add each identified hazard and its associated control measure.
6. Assign the **Competent Person** (the person doing the work).
7. Assign the **Authorised Person** (the person who can issue the permit).
8. Click **Submit for Authorisation**.
9. The assigned Authorised Person receives a notification to review and approve.
10. The Authorised Person reviews all hazards and controls, then clicks **Issue Permit**.
11. The permit status changes to **Active** and is visible on the PTW dashboard.
12. When work is complete, the Competent Person clicks **Request Closure**.
13. The Authorised Person performs a final site check and clicks **Close Permit**.

### Tips
- Permits cannot be issued if mandatory hazard controls are missing.
- Use the duplicate function for recurring similar tasks to save setup time.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'permit-to-work', 'safety'],
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
    id: 'KB-HT3-004',
    title: 'How to Investigate an Incident',
    content: `## How to Investigate an Incident

A structured investigation identifies root causes, contributing factors, and corrective actions to prevent recurrence.

### Overview
The Incident module provides a guided investigation workflow with built-in root cause analysis tools including fishbone diagrams and 5-Why analysis.

### Prerequisites
- Incident already recorded with initial details
- Investigation team members have access to the Incidents module
- Severity classification determined

### Steps

1. Navigate to **Incidents** → locate the incident record and open it.
2. Confirm the **Severity** classification (MINOR, MODERATE, MAJOR, CRITICAL, or CATASTROPHIC).
3. Click **Start Investigation** to trigger the investigation workflow.
4. In the **Investigation Team** section, add all team members who will participate.
5. Under **Root Cause Analysis**, select your preferred tool: **Fishbone Diagram** or **5-Why Analysis**.
6. Complete the selected root cause tool, documenting causes across each category (People, Process, Equipment, Environment, Management).
7. In the **Contributing Factors** section, record any additional factors that worsened the outcome.
8. Navigate to the **Corrective Actions** tab and click **Add Action** for each identified cause.
9. Assign an owner and due date to each corrective action.
10. Click **Generate Investigation Report** to produce a formatted PDF report.
11. Submit the report for management review by clicking **Submit for Review**.
12. Once approved, the incident status changes to **Closed** and corrective actions move to the CAPA register.

### Tips
- Major and above incidents automatically notify senior management on creation.
- Corrective action completion is tracked in the CAPA module dashboard.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'incident', 'investigation', 'safety'],
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
    id: 'KB-HT3-005',
    title: 'How to Build a Custom Dashboard',
    content: `## How to Build a Custom Dashboard

Custom dashboards let you surface the KPIs and data visualisations most relevant to your role, consolidating information from multiple modules in one view.

### Overview
The dashboard builder supports KPI cards, line/bar/pie charts, data tables, and heatmaps, each connected to live module data.

### Prerequisites
- At least one module with data populated
- Dashboard creation permission (Manager role or above, or custom role with Dashboard Create permission)

### Steps

1. Navigate to **Dashboard** → click **New Dashboard** in the top-right corner.
2. Enter a **Dashboard Name** and optional description.
3. Click **Add Widget**.
4. Select the **Widget Type**: KPI Card, Line Chart, Bar Chart, Pie Chart, Data Table, or Heatmap.
5. Choose the **Data Source** (module and data entity) for the widget.
6. Apply any **Filters** (date range, site, status, category) to scope the data.
7. Configure display options (title, colour theme, goal line for charts).
8. Click **Add to Dashboard**.
9. Repeat steps 3-8 to add additional widgets.
10. Drag and resize widgets to arrange the layout as needed.
11. Click **Sharing Settings** to set visibility: Private, Team, or Organisation-wide.
12. To schedule email delivery, click **Schedule Delivery**, set the frequency (daily/weekly/monthly), and add recipient email addresses.
13. Click **Save Dashboard**.

### Tips
- Pin your most-used dashboard as your home page in Profile Settings.
- Use the **Clone Dashboard** option to create department-specific variants quickly.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'dashboard', 'customisation'],
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
    id: 'KB-HT3-006',
    title: 'How to Onboard a New User',
    content: `## How to Onboard a New User

Properly onboarding new users ensures they have the right access from day one while maintaining security and auditability.

### Overview
User onboarding covers invitation, role assignment, module access configuration, and confirmation of first login.

### Prerequisites
- Admin or User Management permission
- User's business email address
- Roles and module permissions already configured

### Steps

1. Navigate to **Admin** → **User Management** → click **Invite User**.
2. Enter the user's **Email Address**, **First Name**, and **Last Name**.
3. Select the **Organisation** (and site, if multi-site is configured).
4. Under **Roles**, select one or more roles to assign (roles control module-level permissions).
5. Review the **Module Access** summary to confirm the effective permissions.
6. Toggle on any additional module permissions not covered by the assigned roles.
7. Click **Send Invitation**.
8. The user receives a welcome email with a secure registration link (valid for 72 hours).
9. Monitor the **Pending Invitations** list until the user completes registration.
10. Once the user logs in for the first time, their status changes from **Pending** to **Active**.
11. Assign the user to relevant **Teams** via HR → Teams → Add Member.
12. Assign any open workflows or tasks that require their involvement.

### Tips
- If the invitation link expires, resend it from the Pending Invitations list using **Resend Invite**.
- For bulk onboarding, use the HR employee import feature to create multiple users simultaneously.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'admin', 'users', 'onboarding'],
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
    id: 'KB-HT3-007',
    title: 'How to Offboard a Departing Employee',
    content: `## How to Offboard a Departing Employee

A structured offboarding process protects organisational data and ensures continuity of open tasks when an employee leaves.

### Overview
Offboarding in IMS involves account suspension, task reassignment, API key revocation, session termination, and final account deactivation.

### Prerequisites
- Admin or User Management permission
- Knowledge of the employee's open tasks, document ownerships, and API key usage
- Handover period agreed (if applicable)

### Steps

1. Navigate to **Admin** → **User Management** and locate the departing employee's account.
2. Click **Suspend Account** immediately upon receiving departure notice. This blocks login while preserving all records.
3. Navigate to **Tasks** → filter by the suspended user and **Reassign** all open tasks to appropriate team members.
4. In **Document Control**, search documents owned by the user and transfer ownership in bulk.
5. Navigate to **Admin** → **API Keys** and revoke any API keys issued to the user.
6. Under the user's profile, click **Terminate All Active Sessions** to invalidate any existing tokens.
7. Download the user's **Activity Audit Export** (Admin → Audit Log → Filter by User → Export) for records retention.
8. After the agreed handover period, return to the user account and click **Deactivate Account**.
9. Confirm deactivation. The account is permanently blocked but all associated records remain intact.

### Tips
- Suspension should happen on the employee's last day at the latest, ideally immediately on notification.
- Deactivated accounts remain in the audit log and cannot be reactivated without admin intervention.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'admin', 'users', 'offboarding'],
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
    id: 'KB-HT3-008',
    title: 'How to Create a Custom Role',
    content: `## How to Create a Custom Role

Custom roles let you define precise permission sets tailored to specific job functions, going beyond the built-in role templates.

### Overview
IMS supports role-based access control (RBAC) with seven permission levels per module: View, Create, Edit, Delete, Approve, Export, and Admin.

### Prerequisites
- System Admin permission
- Understanding of which modules and actions the new role needs access to
- A test user account available for validation

### Steps

1. Navigate to **Admin** → **Role Management** → click **New Role**.
2. Enter a **Role Name** and optional description.
3. Choose whether to start **From Scratch** or **Clone an Existing Role** (cloning is faster for similar roles).
4. The permission grid displays each module as a row and each permission level as a column.
5. For each module the role requires access to, tick the appropriate permission boxes (View, Create, Edit, Delete, Approve, Export, Admin).
6. To restrict access to specific sub-functions within a module, click the module name to expand sub-function controls.
7. Review the **Effective Permissions Summary** panel on the right to confirm the access is correct.
8. Click **Save Role**.
9. Assign the new role to a test user account via **Admin** → **User Management** → select user → **Edit Roles**.
10. Log in as the test user and verify that the expected pages and actions are accessible and restricted appropriately.
11. Once validated, assign the role to the intended users.

### Tips
- Follow the principle of least privilege: grant only the minimum permissions needed.
- Use role names that reflect the job function, not the permission level, for easier management.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'admin', 'rbac', 'roles'],
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
    id: 'KB-HT3-009',
    title: 'How to Configure Single Sign-On (SSO)',
    content: `## How to Configure Single Sign-On (SSO)

SSO lets your users log in with their existing corporate identity provider credentials, eliminating separate IMS passwords.

### Overview
IMS supports SAML 2.0 SSO. Your Identity Provider (IdP) — such as Azure AD, Okta, or Google Workspace — provides the SAML metadata.

### Prerequisites
- System Admin permission in IMS
- Access to your IdP admin console
- IdP SAML metadata URL or XML file

### Steps

1. Navigate to **Admin** → **Security** → **Single Sign-On**.
2. Click **Configure SSO**.
3. Enter your **IdP Metadata URL** in the provided field, or click **Upload Metadata XML** to upload the file directly.
4. IMS automatically parses the metadata and populates the IdP Entity ID and SSO endpoint fields.
5. Under **Attribute Mapping**, map the SAML attributes from your IdP to IMS user fields:
   - Email: typically 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
   - First Name: 'givenname'
   - Last Name: 'surname'
6. Set the **SSO Enforcement Level**: Optional (users can choose SSO or password), Required (all users must use SSO), or Required with Exceptions.
7. Copy the **IMS Service Provider (SP) Metadata URL** and register it in your IdP as a new application.
8. Click **Test SSO** to authenticate with a test account without yet enforcing SSO for all users.
9. Resolve any attribute mapping errors shown in the test result.
10. Once the test passes, click **Enable SSO for All Users**.

### Tips
- Keep at least one System Admin account with password login as a break-glass account before enforcing SSO.
- SCIM provisioning can be configured alongside SSO for automatic user creation and deactivation.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'admin', 'sso', 'saml'],
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
    id: 'KB-HT3-010',
    title: 'How to Set Up Email Notifications',
    content: `## How to Set Up Email Notifications

Configuring email notifications ensures users receive timely alerts for incidents, overdue tasks, approvals, and other system events.

### Overview
IMS sends notifications via your organisation's SMTP server. You can configure notification triggers per module and choose between instant and digest delivery.

### Prerequisites
- System Admin permission
- SMTP server credentials (host, port, username, password, TLS settings) from your IT team
- A test email address for verification

### Steps

1. Navigate to **Admin** → **Notifications** → **Email Settings**.
2. Enter your **SMTP Host** (e.g. 'smtp.office365.com') and **Port** (typically 587 for TLS or 465 for SSL).
3. Enable **TLS/STARTTLS** if your server requires it.
4. Enter the **SMTP Username** and **Password**.
5. Set the **From Name** (e.g. 'IMS Notifications') and **From Email Address**.
6. Click **Test Connection** to verify the SMTP settings are correct.
7. Send a **Test Email** to your test address and confirm delivery.
8. Navigate to **Notification Triggers** and expand each module.
9. For each event type (e.g. Incident Created, Document Due for Review), toggle notifications on or off.
10. For each trigger, choose **Instant** (sent immediately) or **Digest** (batched and sent at a scheduled time).
11. Set the **Digest Schedule** (daily at 08:00, weekly on Monday, etc.).
12. Click **Save Notification Settings**.

### Tips
- Avoid enabling too many instant notifications — digest delivery reduces inbox noise for non-urgent events.
- Individual users can further customise their personal notification preferences in their Profile Settings.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'admin', 'notifications', 'email'],
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
    id: 'KB-HT3-011',
    title: 'How to Configure Reference Number Formats',
    content: `## How to Configure Reference Number Formats

Reference number formats give every record a consistent, human-readable identifier that supports audit trails and document control requirements.

### Overview
Each module generates reference numbers automatically. The format is configurable per module using a template with prefix, year, counter, and separator tokens.

### Prerequisites
- System Admin permission
- Agreement on naming conventions across the organisation

### Steps

1. Navigate to **Admin** → **Settings** → **Reference Numbers**.
2. The page displays a list of all modules with reference number generation enabled.
3. Click **Edit** next to the module you want to configure (e.g. Incidents).
4. In the **Format Template** field, build your format using the available tokens:
   - '{PREFIX}' — a fixed text prefix (e.g. INC, HSE, ENV)
   - '{YEAR}' — current four-digit year
   - '{YY}' — current two-digit year
   - '{SEQ}' — sequential counter (auto-increments)
   - '{SEP}' — separator character (configure separately, e.g. '-' or '/')
5. Example template: '{PREFIX}-{YEAR}-{SEQ:4}' produces 'INC-2026-0001'.
6. Set the **Separator Character** (dash, slash, or underscore).
7. Set the **Counter Reset Period**: Never, Annually, or Monthly.
8. Set the **Counter Starting Value** (e.g. 1 or 1000).
9. Click **Preview** to see example reference numbers generated by the template.
10. Click **Save Format**.
11. New records created in that module will use the updated format immediately.

### Tips
- Existing records retain their original reference numbers — only new records use the new format.
- Use the SEQ padding option (e.g. ':4') to zero-pad counters for consistent sorting.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'admin', 'reference-numbers'],
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
    id: 'KB-HT3-012',
    title: 'How to Set Up Multi-Site Organisation Structure',
    content: `## How to Set Up Multi-Site Organisation Structure

Multi-site configuration allows a single IMS instance to manage multiple physical locations with site-level data separation and reporting.

### Overview
Sites represent distinct physical locations (factories, offices, warehouses). Each site can have its own administrators, users, and data scope.

### Prerequisites
- System Admin permission
- List of site names, addresses, time zones, and site contacts ready

### Steps

1. Navigate to **Admin** → **Organisation** → **Sites**.
2. Click **Add Site**.
3. Enter the **Site Name**, **Address**, **City**, **Country**, and **Postcode**.
4. Select the **Time Zone** for the site from the dropdown.
5. Add a **Site Contact** (name and email address).
6. Click **Save Site**. Repeat for all sites.
7. Navigate to **Admin** → **User Management** and open each user's profile.
8. In the **Site Assignment** field, assign the user to their primary site (and secondary sites if applicable).
9. Navigate to **Admin** → **Data Isolation** and select the isolation level:
   - **Shared**: all users see all site data (default)
   - **Site-Isolated**: users see only their assigned site's data
   - **Site-Isolated with Cross-Site Reports**: isolated data views but central reporting
10. Assign **Site Administrators** by granting the Site Admin role to the relevant users at each site.
11. Navigate to **Reporting** → **Site Reports** to generate site-level dashboards and KPI summaries.

### Tips
- Time zones affect how dates and times are displayed for site users.
- Site administrators can manage users and settings within their site without full system admin rights.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'admin', 'multi-site', 'organisation'],
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
    id: 'KB-HT3-013',
    title: 'How to Import Historical Data from a Spreadsheet',
    content: `## How to Import Historical Data from a Spreadsheet

Importing historical data from spreadsheets migrates existing records into IMS without manual data entry, preserving your historical audit trail.

### Overview
Each module provides a downloadable import template with required and optional columns. The importer validates data before committing records.

### Prerequisites
- Admin or Data Import permission for the target module
- Existing data in a spreadsheet ready for mapping
- Date formats standardised to YYYY-MM-DD

### Steps

1. Navigate to the target module (e.g. Incidents) and click **Settings** → **Data Import**.
2. Click **Download Import Template** and open it in Excel or Google Sheets.
3. Review the column headers — columns marked with an asterisk (*) are mandatory.
4. Map your existing spreadsheet columns to the template columns, copying data across.
5. Standardise all date fields to the format 'YYYY-MM-DD' (e.g. 2025-03-15).
6. Ensure all mandatory fields contain valid values — blank mandatory fields will cause row-level failures.
7. Save the completed template as CSV (UTF-8 encoding).
8. Return to the IMS import screen and click **Upload File**.
9. Run a **Test Import** with 10 rows to validate formatting and data quality.
10. Review the validation report — errors are shown by row number with a description.
11. Fix any errors in the source spreadsheet and re-upload if needed.
12. Click **Run Full Import** to commit all rows.
13. After import, verify the record count in the module list view matches the expected number.

### Tips
- Import runs in batches of 500 rows; very large files may take a few minutes.
- Duplicate detection uses configurable key fields (e.g. reference number or email).`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'import', 'data-migration'],
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
    id: 'KB-HT3-014',
    title: 'How to Create a Scheduled Report',
    content: `## How to Create a Scheduled Report

Scheduled reports automatically generate and deliver reports to specified recipients on a regular cadence, keeping stakeholders informed without manual effort.

### Overview
The reporting engine supports scheduled delivery of any saved report in PDF, Excel, or CSV format via email.

### Prerequisites
- Reports permission (View and Create)
- Email notifications configured (SMTP settings in Admin)
- At least one saved report or report type to schedule

### Steps

1. Navigate to **Reporting** → **Scheduled Reports** → click **New Schedule**.
2. Select the **Report Type** from the dropdown (e.g. Incident Summary, Training Matrix, KPI Dashboard).
3. Configure the report **Filters**: date range (rolling last 30 days, last quarter, etc.), status, site, and category as relevant.
4. Click **Preview Report** to confirm the data scope is correct.
5. Under **Schedule**, select the frequency: **Daily**, **Weekly**, or **Monthly**.
6. Set the **Delivery Time** (e.g. 07:00) and **Day** (for weekly: day of week; for monthly: day of month).
7. In the **Recipients** field, add one or more email addresses.
8. Select the **Output Format**: PDF, Excel (.xlsx), or CSV.
9. Optionally add a **Subject Line** and **Email Body Message** to personalise the delivery email.
10. Click **Activate Schedule**.
11. The schedule appears in the Scheduled Reports list with the next delivery date shown.
12. To view delivery history, click the schedule name and open the **Delivery Log** tab.

### Tips
- Use rolling date ranges (e.g. last 30 days) rather than fixed dates so the report stays current.
- Deactivate a schedule rather than deleting it if you need to pause delivery temporarily.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'reporting', 'scheduled-reports'],
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
    id: 'KB-HT3-015',
    title: 'How to Export Data for External Analysis',
    content: `## How to Export Data for External Analysis

Exporting data lets you perform further analysis in tools such as Excel, Power BI, or R/Python outside of IMS.

### Overview
Every module supports flexible data exports with field selection, filter options, and choice of output format. Exports include a configurable option to include or exclude audit history.

### Prerequisites
- Export permission for the target module
- Filters and date ranges determined in advance
- Awareness of any data privacy obligations before exporting personal data

### Steps

1. Navigate to the module you want to export from (e.g. Health and Safety → Incidents).
2. Apply the desired **Filters** in the list view: date range, status, severity, site, or other available filters.
3. Click **Export** in the toolbar.
4. In the Export dialogue, review the currently applied filters — adjust if needed.
5. Under **Fields to Include**, deselect any columns not needed in the export to reduce file size.
6. Select **Include Audit History** if you need a full change log appended to the export.
7. Select the **Export Format**: CSV (universal compatibility), Excel (.xlsx), or JSON (for API integrations).
8. Click **Generate Export**.
9. The export runs in the background for large datasets — you will receive a notification when it is ready.
10. Click **Download** from the notification or from **Admin** → **Export History**.
11. Open the file and verify the row count matches the record count shown in the filtered list view.

### Tips
- Exports respect your current filter state — always review applied filters before exporting.
- For very large exports (50,000+ rows), schedule the export during off-peak hours.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'export', 'data', 'analytics'],
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
    id: 'KB-HT3-016',
    title: 'How to Configure KPI Thresholds and Alerts',
    content: `## How to Configure KPI Thresholds and Alerts

KPI thresholds define the boundaries between On Track, At Risk, and Off Track performance, and trigger alerts when performance deteriorates.

### Overview
Each KPI metric has a target value and configurable threshold levels. Alerts are sent automatically when performance crosses a threshold boundary.

### Prerequisites
- KPI Admin or System Admin permission
- KPI metrics already created and collecting data
- Notification email configured in Admin settings

### Steps

1. Navigate to **Performance** → **KPI Settings** (or the relevant module's KPI configuration).
2. Select the KPI metric you want to configure.
3. Click **Edit Thresholds**.
4. Enter the **Target Value** for the metric (the goal you are aiming to achieve).
5. Set the **On Track** boundary: values within this range of the target are considered healthy.
6. Set the **At Risk** boundary: values outside the On Track range but above the critical threshold.
7. Set the **Off Track** boundary: values below this level trigger an urgent alert.
8. Select the **Metric Direction**: Higher is Better (e.g. training completion %) or Lower is Better (e.g. incident rate).
9. Under **Alerts**, enable **Automatic Alerts** and select the threshold levels that trigger notifications.
10. Set the **Alert Frequency**: Alert once on breach, or repeat alerts if performance remains outside threshold.
11. Add **Alert Recipients** (individuals or teams).
12. Click **Save Thresholds**.
13. The KPI card colour updates immediately based on current performance vs the new thresholds.

### Tips
- Review thresholds periodically as performance baselines improve over time.
- Use the At Risk threshold as an early warning signal to investigate before reaching Off Track.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'kpi', 'alerts', 'configuration'],
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
    id: 'KB-HT3-017',
    title: 'How to Archive Old Records',
    content: `## How to Archive Old Records

Archiving removes old records from active views while retaining them for audit and compliance purposes, keeping the system clean and performant.

### Overview
Archived records remain fully searchable and accessible via the Archive filter but are excluded from dashboards, KPI calculations, and default list views.

### Prerequisites
- Data Management or Admin permission
- Confirmation that records are past their active lifecycle (e.g. closed incidents older than 3 years)
- Data retention policy agreed and documented

### Steps

1. Navigate to the module containing records to archive (e.g. Incidents, Documents, or Actions).
2. Apply filters to identify records eligible for archiving: filter by **Status** (Closed/Completed) and **Date** (e.g. closed before 2023-01-01).
3. Review the filtered results to confirm all displayed records are eligible.
4. Click the checkbox in the column header to **Select All** visible records.
5. For large result sets, use **Select All Matching Records** to include records beyond the current page.
6. Click **Bulk Actions** → **Archive Records**.
7. In the confirmation dialogue, enter a brief **Archive Reason** (e.g. 'Annual archive — records closed before 2023').
8. Click **Confirm Archive**.
9. The selected records are moved to the archive. Their status updates to **Archived**.
10. Navigate to **Admin** → **Archive Reports** and click **Generate Archive Confirmation Report**.
11. Download the report listing all archived records with reference numbers and archive date.
12. Store the report as evidence for your data retention compliance records.

### Tips
- Archived records still appear in search results when the **Include Archived** filter is enabled.
- Archiving is reversible — records can be restored to active status by an Admin if needed.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'data-management', 'archiving'],
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
    id: 'KB-HT3-018',
    title: 'How to Use Global Search Effectively',
    content: `## How to Use Global Search Effectively

Global Search lets you find any record across all IMS modules instantly, without navigating to individual module list views.

### Overview
Global Search indexes records from all modules including incidents, documents, assets, training records, risks, audits, and more. Results are returned in real time with relevance ranking.

### Prerequisites
- Any valid IMS user account
- Familiarity with the types of records you are searching for

### Steps

1. Press **Ctrl+K** (Windows/Linux) or **Cmd+K** (macOS) from anywhere in IMS to open the Global Search bar. Alternatively, click the Search icon in the top navigation bar.
2. Start typing your search term. Results appear after 2 characters.
3. By default, search covers **All Modules**. To narrow scope, click the **Module Filter** and select a specific module (e.g. Incidents, Documents).
4. Apply additional filters using the filter panel:
   - **Date Range**: restrict results to records created or modified within a period
   - **Status**: filter by Active, Closed, Draft, Published, etc.
   - **Tags**: filter by assigned tags
5. For an exact phrase match, enclose your term in double quotes (e.g. "electrical isolation").
6. Results show record type, title, reference number, status, and last modified date.
7. Click any result to navigate directly to the full record.
8. To save a frequent search, click **Save Search**, name it, and access it from the **Saved Searches** panel.
9. Press **Escape** to close the search bar without navigating away.

### Tips
- Use reference numbers (e.g. INC-2026-0042) for instant exact-match retrieval.
- Saved searches can be pinned to your personal dashboard as a quick-access widget.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'search', 'productivity'],
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
    id: 'KB-HT3-019',
    title: 'How to Configure Data Retention Policies',
    content: `## How to Configure Data Retention Policies

Data retention policies define how long records are kept and what happens when they reach the end of their retention period, supporting legal and regulatory compliance.

### Overview
IMS allows retention periods to be set per record type. At expiry, records can be automatically archived or flagged for deletion with a review step.

### Prerequisites
- System Admin permission
- Legal and regulatory retention requirements confirmed (e.g. from Data Protection Officer or legal counsel)
- Data retention policy document approved

### Steps

1. Navigate to **Admin** → **Data Governance** → **Retention Policies**.
2. The page lists each record type across all modules.
3. Click **Edit** next to the record type you want to configure (e.g. Incident Reports).
4. Set the **Retention Period** in years (e.g. 7 years for incidents, 5 years for training records).
5. Under **Action at Expiry**, select either **Archive** (records become read-only and move to archive) or **Flag for Deletion** (records are queued for manual deletion approval).
6. If **Flag for Deletion** is selected, assign a **Retention Review Owner** who approves deletions.
7. Enable **Retention Review Workflow** to generate a monthly task for the owner to review expiring records.
8. Click **Save Policy**.
9. Repeat for all record types.
10. Navigate to **Admin** → **Retention Reports** → **Generate Retention Compliance Report** to produce a summary of current policy settings versus regulatory requirements.
11. Schedule the retention compliance report for quarterly delivery to your Data Protection Officer.

### Tips
- Common minimum retention periods: incidents 7 years, training 5 years, audit records 6 years, financial records 7 years.
- Always involve your legal team before configuring deletion (as opposed to archiving) for any record type.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'admin', 'data-retention', 'compliance'],
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
    id: 'KB-HT3-020',
    title: 'How to Generate a Compliance Evidence Pack',
    content: `## How to Generate a Compliance Evidence Pack

A compliance evidence pack compiles all records relevant to a specific audit standard into a single structured document, ready for external auditors.

### Overview
The Evidence Pack generator maps IMS records to standard clauses automatically, dramatically reducing the time spent preparing for certification audits.

### Prerequisites
- Compliance Admin or Audit Admin permission
- Records populated across relevant modules (incidents, training, risk register, documents, etc.)
- Target audit standard and date range known

### Steps

1. Navigate to **Compliance** → **Evidence Pack** → click **Generate New Pack**.
2. Select the **Audit Standard** from the dropdown: ISO 9001, ISO 14001, ISO 45001, ISO 27001, ISO 42001, ISO 37001, or a custom standard.
3. Set the **Evidence Date Range** (e.g. the past 12 months for an annual surveillance audit).
4. Click **Gather Evidence**. The system automatically retrieves and maps records to each standard clause.
5. Review the **Clause Coverage Summary** — clauses with full evidence are shown in green, partial in amber, and missing in red.
6. For red clauses, click the clause to see what evidence is expected and what is missing.
7. Click **Add Manual Evidence** to attach additional files (scanned certificates, meeting minutes, photographs) to specific clauses.
8. Click on any evidence item to add an **Annotation** explaining how it satisfies the clause requirement.
9. Once satisfied with the evidence, click **Generate PDF Pack**.
10. Set a **Password** to protect the PDF (required for sharing with external auditors).
11. Click **Generate**. The pack compiles and is available for download within a few minutes.
12. Download and share the password-protected PDF with your external auditor.

### Tips
- Run a trial pack 4-6 weeks before the audit to identify evidence gaps in advance.
- Evidence packs are saved and versioned — you can re-generate without losing annotations.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'compliance', 'audit', 'evidence'],
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
