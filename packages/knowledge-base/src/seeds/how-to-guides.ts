import type { KBArticle } from '../types';

export const howToGuideArticles: KBArticle[] = [
  {
    id: 'KB-HT-001',
    title: 'How to Set Up Two-Factor Authentication (2FA)',
    content: `## How to Set Up Two-Factor Authentication (2FA)

Two-factor authentication adds a critical second layer of security to your IMS account. Follow these steps to enable 2FA.

### Supported Authenticator Apps
Google Authenticator, Microsoft Authenticator, Authy, 1Password, or any TOTP-compatible app.

### Steps

1. Log in to IMS and click your profile avatar in the top-right corner.
2. Select **Profile Settings** from the dropdown menu.
3. Navigate to the **Security** tab.
4. Locate the **Two-Factor Authentication** section and click **Enable 2FA**.
5. Open your preferred authenticator app on your mobile device.
6. Select **Add Account** or the '+' icon in your authenticator app.
7. Scan the QR code displayed on screen using your authenticator app camera.
8. If you cannot scan the QR code, click **Enter code manually** and type the secret key into your app.
9. Enter the 6-digit verification code shown in your authenticator app into the IMS verification field.
10. Click **Verify and Enable**.
11. **Critically important**: Download or copy your backup codes and store them securely offline. These are used if you lose access to your authenticator device.
12. Click **Confirm** to finalise setup. The Security tab will now show 2FA as active.

### If You Lose Access to Your Authenticator
Use one of your saved backup codes at the 2FA prompt. Navigate to Security settings and re-enrol a new device immediately after logging in.

### Admin: Force-Enable 2FA for All Users
Navigate to Admin Console → Security → Authentication Policy → Toggle **Require 2FA for all users** → Save. Users will be prompted to set up 2FA on their next login.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['security', 'authentication', '2fa'],
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
    id: 'KB-HT-002',
    title: 'How to Import Employees from a Spreadsheet',
    content: `## How to Import Employees from a Spreadsheet

Bulk importing employees saves time when onboarding many staff members at once. This guide walks through the entire import process.

### Steps

1. Navigate to **HR** → **Settings** → **Data Import**.
2. Click **Download Template** and open the employee import CSV template in Excel or Google Sheets.
3. Fill in the required columns for each employee:
   - 'firstName', 'lastName', 'email' (must be unique)
   - 'department', 'jobTitle', 'startDate' (format: YYYY-MM-DD)
   - 'employmentType' (FULL_TIME, PART_TIME, CONTRACTOR, CASUAL)
4. Optional columns: 'phone', 'managerId', 'siteCode', 'costCentre', 'salary'.
5. Validate your data: check for duplicate email addresses, correct date formats, and no blank required fields.
6. Save the file as CSV (UTF-8 encoding).
7. Return to HR → Settings → Import → click **Upload File**.
8. Select your completed CSV file and click **Open**.
9. Review the **Import Preview**: green rows will import successfully, yellow rows have warnings, red rows have errors.
10. Click any red row to see the specific error and correct the source file if needed.
11. Re-upload the corrected file if changes were made, then click **Confirm Import**.
12. Monitor the import progress bar. Large imports may take several minutes.
13. Review the **Import Results Summary**: records imported, skipped, and any errors.

### Common Errors
- **Duplicate email**: each employee needs a unique email address
- **Invalid date format**: use YYYY-MM-DD only
- **Missing required fields**: all required columns must have values
- **Unknown department**: department must match an existing department name exactly`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['hr', 'data-import', 'bulk'],
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
    id: 'KB-HT-003',
    title: 'How to Create a Custom Dashboard',
    content: `## How to Create a Custom Dashboard

Custom dashboards let you surface the metrics most relevant to your role. You can create personal dashboards or share them with your team.

### Steps

1. Navigate to **Analytics** → **Dashboards** in the main navigation.
2. Click **New Dashboard** (top-right button).
3. Enter a dashboard name and optional description. Choose visibility: **Private** (only you) or **Shared** (specify roles or users).
4. Click **Add Widget** to add your first widget.
5. Choose a widget type: Bar Chart, Line Chart, Pie Chart, KPI Card, Data Table, Heat Map, or Gauge.
6. Select the **Data Source**: choose the module (e.g., Incidents, Quality, HR) and the specific metric or dataset.
7. Configure the metric: choose aggregation (Count, Sum, Average), grouping field, and any filters.
8. Set the time range: last 7 days, last 30 days, last quarter, or custom range.
9. Configure chart appearance: title, colour palette, axis labels.
10. Click **Add to Dashboard**. The widget appears on your canvas.
11. Drag widgets to reposition them. Resize by dragging the bottom-right corner.
12. Repeat steps 4-11 for each additional widget.
13. Set **Refresh Interval**: manual, every 5 minutes, hourly, or daily.
14. Click **Save Dashboard**.

### Tips
- Start with 5-7 key metrics to avoid information overload.
- Use a consistent colour scheme: green for on-track, amber for at-risk, red for overdue.
- Pin your most important dashboard as your homepage via Dashboard Settings → Set as Home.
- Duplicate a dashboard before making major changes so you have a backup.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['analytics', 'dashboard', 'reporting'],
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
    id: 'KB-HT-004',
    title: 'How to Generate a Compliance Report for an ISO Audit',
    content: `## How to Generate a Compliance Report for an ISO Audit

Compliance reports provide auditors with evidence of conformance. Generate these reports before your audit to review completeness and address gaps.

### Steps

1. Navigate to the relevant module for the standard being audited (e.g., Quality for ISO 9001, Health & Safety for ISO 45001, Environment for ISO 14001).
2. Click **Reports** in the module sidebar.
3. Select **Compliance Reports** from the report category list.
4. Choose the **Report Type** from the dropdown (e.g., 'ISO 9001:2015 Compliance Summary', 'Clause Coverage Report', 'Evidence Inventory').
5. Set the **Date Range** for the reporting period (typically the last 12 months for annual audits).
6. Select the **Standard**: ISO 9001, ISO 14001, ISO 45001, ISO 27001, ISO 50001, or a multi-standard combined view.
7. Toggle **Include Evidence Pack** to attach supporting documents, records, and data tables to the report.
8. Toggle **Include Gap Analysis** if you want a comparison against all standard clauses.
9. Click **Generate Report**. Large reports with evidence packs may take 1-2 minutes to compile.
10. Review the generated report on-screen: check clause coverage percentages and any flagged gaps.
11. Use the **Annotate** tool to add explanatory notes to sections before finalising.
12. Click **Export** and choose format: PDF (recommended for auditors), Word (editable), or Excel (data only).

### Tips
- Generate the evidence pack at least 2 weeks before the audit to identify and address data gaps.
- Share a draft with your audit team to verify accuracy before submitting to the external auditor.
- Save the report to Document Control for version control and future reference.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['compliance', 'audit', 'iso', 'reporting'],
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
    id: 'KB-HT-005',
    title: 'How to Set Up Automated Email Notifications',
    content: `## How to Set Up Automated Email Notifications

Automated notifications ensure the right people are informed about important events without manual follow-up. This guide covers creating notification rules.

### Steps

1. Navigate to **Settings** → **Notifications** in the main menu.
2. Click **New Notification Rule**.
3. Give the rule a descriptive name (e.g., 'CAPA Overdue Alert - H&S Manager').
4. Select the **Trigger Event** from the dropdown: examples include 'Record becomes overdue', 'Status changes to', 'New record created', 'Approval required', 'Document due for review'.
5. Select the **Module** the trigger applies to (e.g., Incidents, CAPA, Documents, Training).
6. Add optional **Conditions** to filter when the notification fires. For example: 'Severity equals CRITICAL' or 'Department equals Operations'.
7. Configure **Recipients** — choose one or more recipient types:
   - By role (e.g., all H&S Managers)
   - By department (e.g., all members of Engineering)
   - Specific named individuals
   - Dynamic: 'Record owner', 'Record owner\'s manager', 'Assigned approver'
8. Compose the **Email Template**. Use variable placeholders: '{name}', '{record_id}', '{due_date}', '{module}', '{status}', '{link}'.
9. Write a clear subject line, e.g., 'Action Required: {record_id} is overdue'.
10. Set **Frequency** if the trigger is recurring: immediate, daily digest, or weekly summary.
11. Click **Send Test Notification** to verify the email arrives correctly and variables resolve properly.
12. Click **Activate** to enable the rule. Confirm it appears in the active rules list.

### Tips
Keep email templates concise. Include the direct link to the record so recipients can act immediately without searching.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['notifications', 'email', 'automation'],
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
    id: 'KB-HT-006',
    title: 'How to Export Data to Excel or CSV',
    content: `## How to Export Data to Excel or CSV

IMS supports flexible data exports from any list view. Follow these steps to export data in your preferred format.

### Steps

1. Navigate to the module and list view containing the data you want to export (e.g., Incidents list, Risk Register, Employee list).
2. Apply any desired **filters** to narrow the data: use the filter bar at the top of the list to filter by date range, status, department, or other fields.
3. Use the **column selector** (the column icon at the top-right of the list) to show or hide columns before exporting.
4. Click the **Export** button (arrow-out icon) in the toolbar.
5. In the export dialog, choose the **Format**:
   - **CSV**: raw data, compatible with any spreadsheet application
   - **Excel (.xlsx)**: formatted workbook with column headers, auto-sized columns, and optional chart sheet
   - **PDF**: visual report format, suitable for sharing and printing
6. Select which **columns to include**: tick the columns you need or click 'All Columns'.
7. Choose the **date range** if applicable (exports can be limited by created date or updated date).
8. For very large datasets (over 10,000 rows), toggle **Background Export**. The export will process in the background and you will receive an email when ready.
9. Click **Download** for immediate exports. The file saves to your browser's default downloads folder.
10. For background exports, navigate to **Settings** → **My Exports** to download completed export files.

### Tips
- Schedule recurring exports via Settings → Scheduled Exports if you need regular data extracts.
- Exports respect your role permissions: you will only see data you have access to.
- Large PDF exports with images may take longer; CSV is fastest for raw data.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['data-export', 'excel', 'reporting'],
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
    id: 'KB-HT-007',
    title: 'How to Reset Another User\'s Password (Admin)',
    content: `## How to Reset Another User's Password (Admin)

Administrators can reset user passwords directly or trigger a self-service reset email. All password reset actions are logged in the audit trail.

### Steps

1. Navigate to **Admin Console** in the main navigation (requires Administrator role).
2. Click **Users** in the Admin Console sidebar.
3. Use the search bar to find the user by name or email address.
4. Click the user's name to open their user record.
5. Click the **Actions** button (three-dot menu) in the top-right of the user record.
6. Select **Reset Password** from the dropdown menu.
7. Choose your reset method:

   **Option A — Send Reset Link (recommended)**
   - Select 'Send password reset email to user'.
   - Click **Send**. The user receives an email with a secure reset link valid for 24 hours.
   - Inform the user to check their inbox (including spam folder).

   **Option B — Set Temporary Password**
   - Select 'Set a temporary password'.
   - Enter a temporary password meeting complexity requirements (minimum 12 characters, uppercase, number, symbol).
   - Tick **Force password change on next login** (strongly recommended).
   - Click **Set Password**. Communicate the temporary password to the user via a secure channel (not email).

8. Confirm the action in the confirmation dialog.

### Audit Trail
The password reset action is automatically logged in the user's audit history with the admin's name, timestamp, and method used. View this under Admin Console → Users → [User] → Audit Log.

### Unlocking Locked Accounts
If a user is locked out after too many failed attempts, click Actions → Unlock Account before or instead of resetting the password.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['admin', 'user-management', 'passwords'],
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
    id: 'KB-HT-008',
    title: 'How to Create a Corrective Action (CAPA)',
    content: `## How to Create a Corrective Action (CAPA)

Corrective and Preventive Actions (CAPAs) are raised to address root causes of non-conformances. They can be initiated from incidents, audit findings, NCRs, or complaints.

### Steps

1. Navigate to the source record that requires a CAPA (e.g., an incident, audit finding, non-conformance, or customer complaint).
2. Click the **Create CAPA** button on the record detail page.
3. The CAPA form opens pre-linked to the source record. Complete the required fields:
   - **CAPA Title**: concise description of the issue
   - **Description**: full details of the non-conformance or problem
   - **Root Cause Method**: select from 5-Why, Fishbone, Fault Tree, or Other
   - **Owner**: assign the person responsible for completing the CAPA
   - **Target Due Date**: set a realistic completion date
4. Click **Save** to create the CAPA in Draft status.
5. Navigate to the **Root Cause Analysis** tab and assign RCA tasks to team members. Set individual deadlines.
6. Team members complete their RCA tasks and record findings. Once all tasks are done, record the root cause conclusion.
7. Navigate to the **Action Plan** tab and add corrective action items. For each action: enter description, assign an owner, set a due date, and specify what evidence is required for closure.
8. Click **Submit for Approval**. The designated approver receives a notification.
9. The approver reviews the CAPA and either approves or returns it with comments.
10. Action owners complete their actions and upload evidence (documents, photos, data).
11. The CAPA owner reviews all evidence and clicks **Submit for Verification**.
12. The approver verifies effectiveness and clicks **Close CAPA**.

### Tips
Raise a CAPA promptly after a non-conformance is identified. Delayed CAPAs reduce their effectiveness.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['capa', 'corrective-action', 'quality'],
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
    id: 'KB-HT-009',
    title: 'How to Schedule and Run a Payroll',
    content: `## How to Schedule and Run a Payroll

Running payroll accurately requires verifying HR data before calculation, reviewing results carefully, and following a structured approval process.

### Steps

1. **Verify HR changes are complete** before starting the pay run. Confirm all of the following are processed in HR: new starters, leavers (with final pay date), salary changes, leave taken, bonuses or commissions.
2. Navigate to **Payroll** → **Pay Runs** → click **New Pay Run**.
3. Select the **Pay Group** (e.g., Monthly Salaried, Weekly Hourly) and confirm the **Pay Period** (start date and end date).
4. Review the **Employee List**: confirm all expected employees are included and any leavers are marked with their final pay date.
5. Click **Run Calculation**. The system calculates gross pay, deductions (tax, superannuation/pension, salary sacrifice), and net pay.
6. Review the **Exceptions Report**: flag any employees with unusual variances (e.g., pay doubled, zero net pay). Investigate and correct source data as needed.
7. Check the **Gross-to-Net Reconciliation summary**: total gross, total tax, total net, and total employer contributions.
8. Click **Submit for Approval**. The payroll approver (typically Finance Director) receives a notification.
9. The approver reviews the summary and clicks **Approve Pay Run**.
10. Click **Generate Payment File** to create the ABA, BACS, or ACH bank file.
11. Upload the payment file to your online banking platform and process the bank transfer.
12. Click **Distribute Payslips**: employees receive payslips via email and the employee self-service portal.
13. Click **Post to Finance** to send payroll journals to the Finance module for reconciliation.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['payroll', 'finance', 'hr'],
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
    id: 'KB-HT-010',
    title: 'How to Conduct a Risk Assessment',
    content: `## How to Conduct a Risk Assessment

Risk assessments systematically identify and evaluate risks so controls can be put in place before harm occurs. This guide covers the standard IMS risk assessment process.

### Steps

1. Navigate to **Risk** → **New Risk Assessment** (or for H&S-specific risks: **Health & Safety** → **Risk Assessments** → **New**).
2. Select the **Assessment Type**: Operational, Project, H&S, Environmental, Financial, or Strategic.
3. Enter assessment metadata: title, scope, assessment team members, and location.
4. Click **Add Risk** to begin identifying hazards and risks.
5. For each risk, complete the following:
   - **Description**: what is the risk and how could it occur?
   - **Category**: Health & Safety, Financial, Reputational, Operational, Legal, Environmental
   - **Likelihood**: score 1-5 (1 = rare, 5 = almost certain)
   - **Consequence**: score 1-5 (1 = insignificant, 5 = catastrophic)
6. The system automatically calculates the **inherent risk rating** (Likelihood x Consequence): Low (1-4), Medium (5-9), High (10-16), Critical (17-25).
7. Add **Existing Controls**: list current safeguards and rate their effectiveness.
8. The system calculates the **residual risk rating** after existing controls.
9. If residual risk is unacceptable, add **Additional Controls Required**: assign owner and due date for each new control.
10. Set a **Review Date** (typically 12 months, or sooner for high-rated risks).
11. Assign an **Assessment Owner** responsible for maintaining the assessment.
12. Click **Submit for Approval**. The approving manager reviews and approves.
13. Once approved, click **Publish** to make the assessment active.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['risk', 'risk-assessment', 'health-safety'],
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
    id: 'KB-HT-011',
    title: 'How to Create and Publish a Document',
    content: `## How to Create and Publish a Document

Document Control ensures all documents go through a formal creation, review, and approval process before publication. Follow these steps to create and publish a new controlled document.

### Steps

1. Navigate to **Document Control** → click **New Document**.
2. Select a **template** from the template library, or click **Blank Document** to start from scratch.
3. Fill in the document **metadata**:
   - **Title**: descriptive document name
   - **Document Number**: auto-generated or enter manually per your numbering convention
   - **Category**: Policy, Procedure, Work Instruction, Form, Record
   - **Owner**: the person responsible for keeping this document current
   - **Review Cycle**: how frequently this document must be reviewed (e.g., 12 months, 24 months)
4. Write or paste your document content in the editor. Use headings, numbered lists, and tables for clarity.
5. Upload any **attachments** (diagrams, reference materials) using the attachment panel.
6. Click **Save as Draft**. The document is saved in Draft status and only visible to you.
7. Click **Submit for Review**. Add reviewer names and an optional message. Reviewers receive an email notification.
8. Reviewers open the document, read it, and add comments using the inline comment tool.
9. Address reviewer comments by revising the document content. Mark each comment as resolved.
10. When all review comments are resolved, click **Submit for Approval**.
11. The approver receives a notification, reviews the final document, and clicks **Approve**.
12. The document **publishes automatically**: the status changes to Published, a new version number is assigned, and stakeholders in the distribution list are notified.

### Version Control
Previous versions are retained in the document history. Click **Version History** to view or restore earlier versions.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['documents', 'document-control'],
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
    id: 'KB-HT-012',
    title: 'How to Set Up an Audit Programme',
    content: `## How to Set Up an Audit Programme

An audit programme defines the schedule of audits for a period (typically 12 months) and ensures all required areas are covered systematically.

### Steps

1. Navigate to **Audit Management** → **Programmes** → click **New Programme**.
2. Enter the **Programme Name** (e.g., 'ISO 9001:2015 Annual Internal Audit Programme 2026').
3. Set the **Programme Date Range**: start date and end date (typically a calendar or financial year).
4. Select the **Standard(s)** the programme covers: ISO 9001, ISO 14001, ISO 45001, ISO 27001, or multiple.
5. Add individual audits to the programme by clicking **Add Audit**. For each audit:
   - **Audit Scope**: which departments, processes, or locations are in scope
   - **Audit Criteria**: which clauses or requirements are being audited
   - **Audit Type**: Internal, External (certification body), Supplier, or Regulatory
   - **Lead Auditor**: assign from your qualified internal auditors
   - **Audit Team**: add supporting auditors if needed
   - **Auditees**: departments or personnel to be audited
   - **Planned Date**: scheduled date of the audit
6. Repeat step 5 for all planned audits in the programme.
7. Review the programme calendar view to check for scheduling conflicts or gaps in coverage.
8. Click **Save Programme**.
9. Click **Send Audit Notifications** to inform all auditors and auditees of their upcoming audits.
10. The programme dashboard now shows a Gantt-style schedule, completion status, and finding summaries as audits are completed.

### Tips
Stagger audits throughout the year rather than clustering them. Cover all ISO clauses across the programme to satisfy surveillance audit requirements.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['audit', 'planning', 'iso-19011'],
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
    id: 'KB-HT-013',
    title: 'How to Add a New Site or Location',
    content: `## How to Add a New Site or Location

Adding a new site enables multi-site management, separate reporting by location, and site-specific configuration of modules and roles.

### Steps

1. Navigate to **Admin Console** → **Organisation** → **Sites**.
2. Click **Add Site**.
3. Enter the site **details**:
   - **Site Name**: full name of the location (e.g., 'Melbourne Manufacturing Plant')
   - **Site Code**: short unique identifier (e.g., 'MEL-MFG') used in reference numbers
   - **Address**: street address, city, state, postcode, country
   - **Timezone**: select the correct timezone for local date/time display
4. Click **Save** to create the site record.
5. Assign a **Site Administrator**: search for and select an existing user who will have admin rights for this site. They will receive an email notification.
6. Configure **site-specific settings**:
   - Select which modules are **enabled** for this site
   - Set **default roles** applied to new users at this site
   - Enter **local regulatory context**: country/state for applicable legislation
7. Build the **location hierarchy** within the site by clicking **Add Location**. Create buildings, then floors within buildings, then areas within floors. Assign location codes.
8. Assign **existing employees** to the new site: HR → Employees → bulk select → Actions → Change Site.
9. Configure **cross-site reporting permissions**: specify which roles can view data from all sites versus their own site only (Admin Console → Roles → [Role] → Data Scope).
10. Notify the site administrator their site is ready and provide them with login credentials and setup instructions.

The new site now appears in all module filter dropdowns and reporting options.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['admin', 'settings', 'multi-site'],
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
    id: 'KB-HT-014',
    title: 'How to Bulk Assign Training to Employees',
    content: `## How to Bulk Assign Training to Employees

Bulk assignment saves time when rolling out mandatory training to large groups of employees. You can assign by role, department, or individual selection.

### Steps

**Method A: Via Training Plans**

1. Navigate to **Training** → **Training Plans**.
2. Select the training plan you want to assign (e.g., 'Annual Mandatory Safety Training 2026').
3. Click **Assign Training Plan**.
4. Choose the **Assignment Method**:
   - **By Role**: assigns to all employees with the selected job title(s)
   - **By Department**: assigns to all employees in the selected department(s)
   - **By Site**: assigns to all employees at the selected site(s)
   - **Individual Selection**: manually pick specific employees
5. Apply the selection and review the list of employees who will receive the assignment.
6. Set the **Completion Deadline**: the date by which all employees must complete the training.
7. Toggle **Send Notification** to automatically notify employees of their new training requirement.
8. Click **Confirm Assignment**. Employees receive a notification with the training details and deadline.

**Method B: Via Individual Course**

1. Navigate to **Training** → **Courses**.
2. Select the course you want to assign.
3. Click **Assign** in the course detail page.
4. Follow steps 4-8 above.

### Monitoring Progress
After assignment, navigate to Training → Reports → Training Compliance to see completion status. Green: complete, Amber: in progress, Red: not started or overdue.

### Tips
For regulatory mandatory training, set a reminder escalation rule to notify managers when employees are overdue.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['training', 'bulk', 'hr'],
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
    id: 'KB-HT-015',
    title: 'How to Configure an Approval Workflow',
    content: `## How to Configure an Approval Workflow

Approval workflows automate routing of records to the right people for sign-off. This guide covers setting up a single-stage or multi-stage approval workflow.

### Steps

1. Navigate to **Workflows** → click **New Workflow**.
2. Enter a **Workflow Name** (e.g., 'Incident Report Approval') and an optional description.
3. Select the **Module** this workflow applies to (e.g., Incidents, CAPA, Documents, Permits).
4. Set the **Trigger**: the event that starts the workflow (e.g., 'Record status changes to Pending Approval').
5. Optionally add **Trigger Conditions** to make the workflow conditional: e.g., only trigger when Severity equals CRITICAL or Department equals Operations.
6. Click **Add Step** → select **Approval**.
7. Configure the **Approver**:
   - **Specific User**: always routes to the named person
   - **By Role**: routes to any user with the specified role
   - **Dynamic**: 'Manager of record submitter' (auto-resolves from HR reporting structure)
8. Set the **Approval Deadline**: number of business days the approver has to respond.
9. Add **Escalation**: if not approved within the deadline, escalate to a specified person or role.
10. Configure **Post-Approval Actions**: on approval, change record status to 'Approved', notify submitter; on rejection, return to submitter with comments.
11. Click **Add Notification** to send the submitter an email when their record is approved or rejected.
12. For multi-stage approval, click **Add Step** again and repeat steps 6-10 for the next approver in the chain.
13. Click **Test Workflow**: create a test record and step through the flow to verify routing and notifications.
14. Click **Activate** to make the workflow live.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['workflows', 'approval', 'automation'],
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
    id: 'KB-HT-016',
    title: 'How to Generate an ESG Report',
    content: `## How to Generate an ESG Report

ESG reports communicate your environmental, social, and governance performance to stakeholders. IMS supports GRI, TCFD, SASB, and CSRD frameworks.

### Steps

1. Navigate to **ESG** → **Reports** → click **New Report**.
2. Enter the **Report Name** (e.g., 'Annual ESG Report 2025') and optional description.
3. Select the **Reporting Framework** from the dropdown: GRI Standards, TCFD, SASB (choose applicable industry sector), CSRD/ESRS, or a custom multi-framework view.
4. Set the **Reporting Period**: financial year or calendar year.
5. Review the **Data Completeness Dashboard**: metrics are colour-coded:
   - Green: data is complete and verified
   - Amber: partial data available, gaps identified
   - Red: no data available for this metric
6. Click any amber or red metric to see what data is missing and which module it comes from.
7. Navigate to the relevant modules to fill data gaps or request data from module owners.
8. Return to the ESG report and click **Refresh Data** once gaps are addressed.
9. Review calculated metrics: Scope 1, 2, and 3 GHG emissions, energy intensity, water use, waste diversion rate, gender pay gap, board diversity, and governance indicators.
10. Click **Generate Draft Report**. The system compiles quantitative data into the framework-required disclosure format.
11. Review narrative sections: add qualitative commentary, targets, and performance context to each section in the editor.
12. Route for **Sign-Off**: select approvers (typically CFO and CEO for listed companies).
13. After approval, click **Export**: choose PDF for publication, Word for further editing, or XBRL for regulatory digital filing.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['esg', 'sustainability', 'reporting'],
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
    id: 'KB-HT-017',
    title: 'How to Manage Supplier Qualification',
    content: `## How to Manage Supplier Qualification

Supplier qualification ensures that only approved, assessed suppliers are used. Follow this process for onboarding a new supplier through full qualification.

### Steps

1. Navigate to **Supplier Management** → click **New Supplier**.
2. Enter the supplier's basic details: company name, country, contact name, email, phone, and business category.
3. Select the **Supplier Tier** and **Risk Category** based on your initial assessment (Tier 1 = critical/strategic, Tier 4 = low value/low risk).
4. Click **Send Qualification Questionnaire**. The supplier receives a portal invitation link via email.
5. The supplier logs into the **Supplier Portal** and completes the qualification questionnaire: company profile, certifications, financial information, insurance, quality systems, and policies.
6. You receive a notification when the questionnaire is submitted. Navigate to the supplier record → **Qualification** tab.
7. Review all submitted information and documents: check certifications are current, financial indicators are acceptable, and required policies are in place.
8. Score the supplier against your **Qualification Criteria**: weighted scoring across quality, financial, ESG, and capability dimensions.
9. If a qualification audit is required (typically for Tier 1 suppliers), schedule it via Audit Management and link it to the supplier record.
10. Record the qualification **Decision**:
    - **Approved**: supplier meets all criteria
    - **Conditionally Approved**: supplier approved with specified conditions to be met by a date
    - **Rejected**: supplier does not meet minimum criteria (record reasons for transparency)
11. Click **Notify Supplier** to send the qualification outcome automatically.
12. Set the **Re-qualification Date**: the date by which the supplier must be re-assessed (e.g., annually for critical suppliers).`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['suppliers', 'qualification', 'procurement'],
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
    id: 'KB-HT-018',
    title: 'How to Set Up SSO (Single Sign-On)',
    content: `## How to Set Up SSO (Single Sign-On)

SSO allows users to log into IMS using their existing corporate identity provider credentials, eliminating the need for a separate IMS password.

### Supported Identity Providers
Azure Active Directory / Entra ID, Okta, Google Workspace, OneLogin, and any SAML 2.0-compliant IdP.

### Steps

1. Navigate to **Admin Console** → **Settings** → **Security** → **SSO**.
2. Toggle **Enable SSO** to on.
3. Select your **Identity Provider** from the list. For a custom IdP, select 'Generic SAML 2.0'.
4. Click **Download Service Provider Metadata** to get the IMS SAML metadata XML file.
5. Log into your identity provider admin console and create a new SAML application for IMS.
6. Upload or paste the IMS SP metadata into your IdP configuration. Configure attribute mappings:
   - 'email' → user email address (required)
   - 'firstName' → given name
   - 'lastName' → family name
   - 'role' → IMS role name (optional, for auto-provisioning)
7. Download the **IdP Metadata** XML from your identity provider.
8. Return to IMS SSO settings and click **Upload IdP Metadata**. Select the downloaded XML file.
9. Configure **user provisioning**: choose 'Just-in-Time' (JIT) to auto-create users on first SSO login, or 'Manual' to pre-create users.
10. Click **Test SSO Configuration**. IMS will open a test login window. Sign in with your corporate credentials.
11. Verify the test login succeeds and your profile is correctly populated.
12. Click **Enable for All Users** to make SSO available. Users will see the 'Sign in with [IdP]' button on the login page.
13. Optionally toggle **Enforce SSO** to disable username/password login for non-admin users, requiring all logins to go through the IdP.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['sso', 'security', 'admin', 'authentication'],
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
    id: 'KB-HT-019',
    title: 'How to Create a Permit to Work',
    content: `## How to Create a Permit to Work

Permits to Work (PTW) control high-risk activities to prevent accidents. The permit must be issued before work begins and closed when work is complete.

### Permit Types
Hot Work, Confined Space Entry, General Maintenance, Electrical Isolation, Working at Height, Excavation, and Cold Work.

### Steps

1. Navigate to **PTW** → click **New Permit**.
2. Select the **Permit Type** from the dropdown (e.g., Hot Work, Confined Space).
3. Complete the **Permit Form**:
   - **Location**: select the specific work area from the location hierarchy
   - **Contractor / Technician**: name of the person(s) carrying out the work
   - **Work Description**: detailed description of the task to be performed
   - **Planned Start Date/Time** and **End Date/Time**
   - **Equipment and Tools Required**: list all items needed
4. Complete the **Risk Assessment** section:
   - Identify all hazards associated with the work
   - Select the controls in place for each hazard
   - Specify required **PPE**: select from the PPE list (hard hat, harness, respirator, etc.)
5. Complete any **Additional Safeguards** required by the permit type (e.g., for confined space: atmospheric testing, rescue team standby, buddy system).
6. Click **Submit for Review**. The Area Authority or issuing authority receives a notification.
7. The **Area Authority** visits the worksite, verifies conditions match the permit, and signs the permit digitally.
8. The permit status changes to **Issued**. The permit holder receives the permit via email or the IMS mobile app.
9. Work commences. The permit must be kept on-site for the duration of the work.
10. On completion, the permit holder signs the return section and submits the permit back.
11. The Area Authority verifies completion and clicks **Close Permit** with a final sign-off.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['ptw', 'permit-to-work', 'safety'],
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
    id: 'KB-HT-020',
    title: 'How to Run a Management Review Meeting',
    content: `## How to Run a Management Review Meeting

Management reviews are a top management obligation under ISO standards. IMS helps you collect input data, facilitate the meeting, and track action outputs.

### Steps

1. Navigate to **Management Review** → click **New Review**.
2. Enter the meeting **details**: title, planned date, location or video link, and which attendees are required.
3. Select the **Standard(s)** being reviewed (ISO 9001, 14001, 45001, 27001, or multiple).
4. Click **Collect Inputs** to generate data request tasks. Input owners across all modules receive automated email requests to submit their data reports.
5. Set the **Data Submission Deadline** (typically 2 weeks before the meeting).
6. Monitor the **Input Dashboard**: track which inputs are submitted (green), in progress (amber), or not started (red).
7. Follow up with incomplete input owners using the built-in reminder button.
8. Once all inputs are received, click **Generate Pre-Read Pack**. IMS compiles all submitted data into a single formatted PDF.
9. Distribute the pre-read pack to all attendees at least 5 business days before the meeting.
10. Conduct the meeting. In IMS, open the **Meeting Facilitator View** to record in real time:
    - Mark attendance
    - Record discussion points for each agenda item
    - Record decisions made
11. Add **Action Items** as they arise: each action needs a description, owner, and due date.
12. After the meeting, click **Circulate Minutes**. Attendees receive the draft minutes for acknowledgement.
13. Actions are automatically created in IMS and appear in the responsible owners' task lists.
14. Set the **Next Review Date** and save. IMS will send a reminder 6 weeks before the next review is due.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['management-review', 'leadership', 'iso'],
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
    id: 'KB-HT-021',
    title: 'How to Set Up the Legal Requirements Register',
    content: `## How to Set Up the Legal Requirements Register

The legal register records all applicable legislation, regulations, and other requirements your organisation must comply with. Each module has its own legal register.

### Steps

1. Navigate to the relevant module for the register you are setting up:
   - **Health & Safety** → Legal Register (for WHS/OHS legislation)
   - **Environment** → Legal Register (for environmental legislation)
   - **Quality** → Legal Register (for product/service regulations)
   - **Food Safety** → Legal Register (for food standards)
2. Click **Add Requirement**.
3. Complete the **requirement details**:
   - **Legislation Name**: full title of the act, regulation, or standard
   - **Reference Number**: section, regulation, or clause number
   - **Jurisdiction**: country, state, or territory where it applies
   - **Requirement Summary**: a plain-language description of what is required
   - **Applicable Processes**: which of your processes or activities must comply
4. Set the **Compliance Status**: Compliant, Partially Compliant, Non-compliant, or Under Review.
5. Add **Evidence of Compliance**: attach relevant documents, records, or procedures that demonstrate how you comply.
6. Set the **Review Frequency**: how often this requirement should be re-evaluated (quarterly, annually, or when legislation changes).
7. Assign an **Owner**: the person responsible for monitoring this requirement.
8. Optionally link to the **Regulatory Monitor** module: toggle on to receive automatic alerts when this legislation is updated or amended.
9. Click **Save**. The requirement appears in the legal register with a next-review date.
10. Run the **Legal Register Report** periodically: navigate to Reports → Legal Compliance to review overall compliance status across all requirements.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['legal', 'compliance', 'regulatory'],
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
    id: 'KB-HT-022',
    title: 'How to Create a Training Course',
    content: `## How to Create a Training Course

IMS supports building online courses, uploading SCORM packages, and recording face-to-face and instructor-led training. This guide covers creating a new online course.

### Steps

1. Navigate to **Training** → **Courses** → click **New Course**.
2. Enter the course **details**:
   - **Title**: clear, descriptive course name
   - **Description**: what the course covers and who it is for
   - **Category**: Safety, Quality, HR, Compliance, Technical, Leadership
   - **Duration**: estimated time to complete in minutes
   - **Passing Score**: percentage required to pass the assessment (e.g., 80%)
3. Select the **Delivery Type**:
   - Online (self-paced): learners complete at their own pace
   - Virtual instructor-led: scheduled live session with video link
   - Face-to-face: classroom session recorded for compliance
   - Blended: combination of online pre-work and live session
4. Add **Modules/Sections** to structure the course content. Click **Add Module**, name it, and add lessons within it.
5. For each lesson, upload content:
   - Videos (MP4, max 500 MB per video)
   - PDFs or PowerPoint presentations
   - SCORM or xAPI packages (upload the ZIP file directly)
   - Embedded web links or YouTube videos
6. Add an **Assessment**: click Add Assessment → enter questions (multiple choice, true/false, short answer).
7. Configure **Certificate Generation**: toggle on, select a certificate template, and set expiry period if applicable.
8. Click **Preview** to experience the course as a learner before publishing.
9. Set **Mandatory/Optional** status and the default completion deadline.
10. Click **Publish** to make the course available for assignment and self-enrolment.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['training', 'content', 'learning'],
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
    id: 'KB-HT-023',
    title: 'How to Process an Insurance Claim-Related Incident Report',
    content: `## How to Process an Insurance Claim-Related Incident Report

When an incident may result in an insurance claim, the incident report must be thorough and generated promptly. Follow this process to ensure compliance and accurate reporting.

### Steps

1. **Log the incident immediately** after it occurs. Navigate to **Incidents** → **New Incident** and complete all fields:
   - Full incident description, date, time, and exact location
   - Names of injured parties and witnesses
   - Severity level (set accurately — this affects reporting thresholds)
   - Immediate actions taken
   - Upload photos and any physical evidence documentation
2. Set the **Severity** accurately using the standard scale (MINOR, MODERATE, MAJOR, CRITICAL, CATASTROPHIC).
3. **Notify** the H&S manager and your legal/insurance contact immediately (use the built-in notification tool or flag them as a stakeholder on the incident record).
4. Navigate to **Incidents** → select the incident → click **Reports**.
5. Select the **Insurance Incident Report** template from the report type dropdown.
6. The system pre-populates all incident data. Review and complete the additional sections:
   - Detailed incident description in narrative form
   - Injuries or property damage details
   - Witness statements (upload or transcribe)
   - Immediate corrective actions taken
   - Estimated financial impact if known
7. Click **Generate Report** and review the PDF output for accuracy and completeness.
8. Click **Download PDF** and submit to your insurer through their preferred channel.
9. Return to the incident record → **Notes** tab → record the insurer's claim reference number.
10. Track claim status and insurer correspondence in the Notes section.
11. If the investigation identifies systemic issues, click **Create CAPA** to address the root cause.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['incidents', 'insurance', 'reporting'],
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
    id: 'KB-HT-024',
    title: 'How to Configure Role-Based Access Control',
    content: `## How to Configure Role-Based Access Control

RBAC controls what each user can see and do in IMS. The system includes 39 standard roles. You can assign these or create custom roles with precise permissions.

### Steps

1. Navigate to **Admin Console** → **Roles**.
2. Review the existing 39 standard roles (e.g., H&S Manager, Quality Auditor, HR Administrator) to determine if any meet your needs. Click a role to view its permissions.
3. To assign a standard role to a user: navigate to Admin Console → Users → select the user → click **Edit** → Role tab → select the role(s) → Save.
4. To create a **Custom Role**: click **New Role**.
5. Enter the role **Name** and **Description** (e.g., 'Plant Manager — Read Only Finance').
6. Configure **module permissions** for each module in the system. For each module, choose from:
   - **None**: no access to this module
   - **View**: can see records but not change them
   - **Create**: can create new records
   - **Edit**: can edit existing records
   - **Delete**: can delete records
   - **Approve**: can approve records in workflow steps
   - **Admin**: full module administration rights
7. Configure **data scope**: whether the role sees data from their own site only, their department only, or the entire organisation.
8. Click **Save Role**.
9. Assign the custom role to users: Admin Console → Users → select user → Edit → Role → choose your custom role.
10. Test the role by logging in as a test user with that role and verifying access.

### Access Reviews
Navigate to **Reports** → **Access Review** to audit all user-role assignments. Best practice: review quarterly and whenever staff change roles.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['rbac', 'security', 'user-management', 'admin'],
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
    id: 'KB-HT-025',
    title: 'How to Submit and Approve an Expense Claim',
    content: `## How to Submit and Approve an Expense Claim

IMS integrates expense management with Finance and Payroll. Employees submit claims digitally with receipts; managers approve online.

### Submitting a Claim (Employee)

1. Navigate to **Finance** → **Expenses** → click **New Expense Claim**.
2. Enter the **Claim Period**: start and end date for the expenses included in this claim.
3. Click **Add Expense Item** for each expense:
   - **Date**: date the expense was incurred
   - **Category**: Travel, Accommodation, Meals, Equipment, Training, Other
   - **Description**: brief explanation of the business purpose
   - **Amount** and **Currency** (multi-currency supported)
   - **Attach Receipt**: photograph or scan of the receipt (required for items over the threshold)
4. After adding all items, review the claim total.
5. Add any optional **Notes** to the claim (e.g., context for an unusual expense).
6. Click **Submit Claim**. Your approving manager receives an email notification.

### Approving a Claim (Manager)

7. Navigate to **Finance** → **Expenses** → **Pending Approval** tab.
8. Click the claim to review it. All items and receipts are displayed.
9. Review each expense item. For any item that is unclear, click the comment icon to ask the claimant for clarification.
10. If an item is not approvable (personal expense, over policy limit, missing receipt), click **Reject Item** and enter the reason.
11. When satisfied, click **Approve Claim**.
12. Approved claims are automatically sent to Payroll for reimbursement in the next pay run, or to Finance for a direct bank transfer if outside payroll timing.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['finance', 'expenses', 'hr'],
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
    id: 'KB-HT-026',
    title: 'How to Set Up Energy Monitoring',
    content: `## How to Set Up Energy Monitoring

Energy monitoring enables you to track consumption, measure against a baseline, set improvement targets, and manage your ISO 50001 energy management system.

### Steps

1. Navigate to **Energy** → **Settings** → **Energy Sources**.
2. Add each energy source your organisation uses: Electricity, Natural Gas, Diesel, LPG, Renewables (solar, wind), or Steam. Enter calorific values and conversion factors for GJ calculation.
3. Navigate to **Settings** → **Metering Points**. Click **Add Metering Point** for each meter you want to monitor:
   - **Name**: descriptive name (e.g., 'Main Building Electricity Meter')
   - **Energy Source**: link to the energy source created above
   - **Location**: site, building, or process area
   - **Meter ID**: the meter reference number
4. Configure the **Baseline Period**: select the 12-month period that represents normal operations (used to calculate Energy Performance Indicators).
5. Enter **Historical Consumption Data**: either type monthly figures or import from CSV for each metering point.
6. Navigate to **EnPIs** (Energy Performance Indicators). Click **Add EnPI**:
   - Define the metric formula (e.g., kWh per unit produced, kWh per square metre)
   - Enter the **baseline value** calculated from historical data
   - Set the **improvement target** (e.g., 5% reduction per year)
7. Configure **Alerts**: set percentage variance thresholds that trigger notifications (e.g., alert if consumption is 10% above baseline for any metering point).
8. Create an **Energy Action Plan**: list specific projects to reduce consumption, assign owners, set budgets and expected savings.
9. Assign data entry responsibilities: schedule reminders for meter reading submission.
10. Activate the **Monitoring Dashboard**. Live or monthly consumption data now displays against baseline and target.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['energy', 'iso-50001', 'monitoring'],
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
    id: 'KB-HT-027',
    title: 'How to Conduct a Food Safety Inspection',
    content: `## How to Conduct a Food Safety Inspection

Food safety inspections verify that premises, processes, and products meet food safety standards. Use the IMS mobile-ready inspection tool for efficient on-site completion.

### Steps

1. Navigate to **Food Safety** → **Inspections** → click **New Inspection**.
2. Select the **Inspection Type**: GMP Inspection, HACCP Verification, Supplier Inspection, Pest Control Inspection, or Hygiene Audit.
3. Select the **Location** being inspected: specific production area, storage zone, or kitchen.
4. Choose a **Checklist Template** from the library (or use a custom checklist you have created).
5. Click **Start Inspection**. On a mobile device, the inspection opens in the mobile-optimised view — navigate to the location with your device.
6. Work through each **checklist item**:
   - Mark **Pass**: requirement is fully met
   - Mark **Fail**: requirement is not met
   - Mark **N/A**: item does not apply to this location
7. For any **Fail** result, tap the item to add an observation and photo. The system flags these as potential non-conformances.
8. You can raise a corrective action directly from a failed item: tap **Raise Action** → assign owner → set due date.
9. Complete all sections of the checklist. The progress bar shows how many items remain.
10. When all items are complete, the system calculates the **Inspection Score** (percentage of applicable items that passed).
11. Review the automatically generated **Findings Summary**: lists all failures and observations.
12. Click **Submit Inspection Report**. The report is saved and the supervisor receives an automatic notification of the score and any critical failures.
13. Non-conformances raised during the inspection appear in the CAPA register for tracking.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['food-safety', 'inspection', 'haccp'],
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
    id: 'KB-HT-028',
    title: 'How to Process a Customer Complaint',
    content: `## How to Process a Customer Complaint

A structured complaint handling process demonstrates customer focus and supports continual improvement. IMS tracks complaints from receipt to closure.

### Steps

1. Navigate to **Complaints** → click **New Complaint**.
2. Enter the **complainant details**: name, company, contact information.
3. Complete the complaint record:
   - **Complaint Description**: detailed description in the customer's own words where possible
   - **Category**: Product Quality, Delivery, Service, Billing, Safety, or Other
   - **Date Received** and **Product/Service** involved
   - **Severity**: Minor, Significant, or Major (based on your classification criteria)
4. Click **Save**. The system automatically sends an **acknowledgement email** to the customer confirming receipt and the expected response timeframe.
5. **Assign an Investigator**: select the appropriate person and click Assign.
6. The investigator opens the complaint and begins the investigation:
   - Gathers relevant records, production data, and delivery documentation
   - Contacts relevant internal teams (production, logistics, quality)
   - Interviews involved staff if needed
7. Complete the **Investigation Record**: document findings, root cause, and whether the complaint is valid.
8. Determine the **Resolution**: describe the action taken (product replacement, refund, service redo, process change) and any compensation offered.
9. Draft the **Customer Response Letter** using the IMS template. Personalise it with the investigation findings and resolution.
10. Route the response through manager review if required.
11. Click **Send Response** to deliver the letter to the customer via email.
12. After the agreed resolution period, send a **follow-up satisfaction check** to confirm the customer is satisfied.
13. Click **Close Complaint**. If a systemic issue was identified, click **Create CAPA** to drive process improvement.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['complaints', 'customer-satisfaction', 'quality'],
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
    id: 'KB-HT-029',
    title: 'How to Create and Distribute a Policy Document',
    content: `## How to Create and Distribute a Policy Document

Policies set the rules and commitments of your organisation. Publishing them through Document Control ensures they are version-controlled, approved at the right level, and acknowledged by all relevant staff.

### Steps

1. Navigate to **Document Control** → click **New Document**.
2. Select **Policy** as the document category.
3. From the template library, choose the **Policy Template** (pre-formatted with standard policy sections).
4. Complete the document **metadata**: title (e.g., 'Quality Policy'), document number, owner (typically a Director or the CEO), and a 12-month review cycle.
5. In the document editor, complete the standard policy sections:
   - **Purpose**: why this policy exists
   - **Scope**: who and what it applies to
   - **Policy Statements**: the specific commitments and rules (numbered list)
   - **Responsibilities**: who is accountable for what
   - **Definitions**: key terms used
   - **Related Documents**: cross-reference to procedures that implement this policy
6. Set the **Distribution List**: choose who must read and acknowledge this policy (e.g., All Employees, or specific roles/departments).
7. Click **Submit for Approval**. Route to the appropriate senior leader or CEO for sign-off.
8. The approver reviews the policy and clicks **Approve**. The document is published automatically.
9. All employees on the distribution list receive an **email notification** informing them of the new or updated policy with a link to read it.
10. IMS tracks **acknowledgements**: employees must click 'Mark as Read' to confirm they have read the policy.
11. Monitor the **Required Reading Dashboard**: navigate to Document Control → Reports → Reading Status to see who has and has not acknowledged the policy.
12. Send reminders to non-acknowledgers using the bulk reminder tool.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['documents', 'policy', 'compliance'],
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
    id: 'KB-HT-030',
    title: 'How to Register and Track an AI System',
    content: `## How to Register and Track an AI System

ISO 42001 requires organisations to maintain an inventory of AI systems and assess their risks and impacts. This guide covers registering a new AI system in the IMS AI inventory.

### Steps

1. Navigate to **ISO 42001** → **AI Inventory** → click **Register AI System**.
2. Complete the **Registration Form**:
   - **System Name**: name of the AI model or application
   - **Purpose**: what the AI system is used for
   - **Description**: how the system works (brief technical and functional description)
   - **Owner**: the department head or system owner responsible for governance
   - **Deployment Environment**: internal tool, customer-facing product, or integrated service
3. Select the **Decision Type**:
   - **Supportive**: AI provides information, humans always decide
   - **Partially Automated**: AI makes some decisions, humans review others
   - **Fully Automated**: AI makes decisions without human review
4. Complete the **Risk Classification Questionnaire**: answer questions about data types processed, affected populations, decision reversibility, and error impact. The system calculates the risk tier (Low, Limited, High, Unacceptable).
5. Complete the **Impact Assessment**: identify affected stakeholders, document potential harms, and record the mitigations in place.
6. Upload or link **Governance Documents**: your AI policy, the model card (if available), data processing agreement, and relevant test results.
7. Set the **Monitoring Schedule**: frequency of performance, bias, and drift reviews (monthly for high-risk, quarterly for limited-risk).
8. Click **Submit for Governance Committee Approval**. The AI governance committee receives a notification to review the registration.
9. After approval, the AI system status becomes **Active** and monitoring begins.
10. The system dashboard tracks monitoring review due dates and any raised concerns.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['iso-42001', 'ai', 'governance'],
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
    id: 'KB-HT-031',
    title: 'How to Perform a Stock Count (Cycle Count)',
    content: `## How to Perform a Stock Count (Cycle Count)

Cycle counting maintains inventory accuracy by counting sections of stock regularly rather than shutting down for a full stocktake. Follow this process to run a cycle count in IMS.

### Steps

1. Navigate to **Inventory** → **Cycle Counts** → click **Schedule Count**.
2. Select the **Locations or Zones** to count in this cycle. You can select specific aisles, bays, or bins.
3. Assign **Counters**: select employees who will perform the physical count.
4. Set the **Count Date**: the date counting will take place.
5. Click **Generate Count Sheets**. Print the sheets or use the IMS mobile app for digital counting.
6. On count day, the counter navigates to each assigned location. For each item:
   - **Scan** the item barcode or QR code (or select from the list manually)
   - Enter the **physical quantity** counted
7. The system records the count but does not yet compare it to the system quantity.
8. After all items in the location are counted, submit the location count.
9. The system automatically compares counted quantities to system quantities and flags **Discrepancies** (items where counted quantity differs from system quantity).
10. Items with discrepancies above your tolerance threshold are flagged for a **Second Count**: send counters back to recount flagged locations.
11. After the second count, **Investigate Variances**: review transaction history, check for mis-picks or un-recorded receipts.
12. Click **Approve Adjustments** for variances that are confirmed and explained.
13. Click **Post Adjustments** to update inventory system quantities.
14. The system generates a **Cycle Count Report**: accuracy percentage, number of variances, and total value of adjustments.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['inventory', 'stock-count', 'warehouse'],
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
    id: 'KB-HT-032',
    title: 'How to Set Up a Preventive Maintenance Schedule',
    content: `## How to Set Up a Preventive Maintenance Schedule

Preventive maintenance (PM) schedules ensure assets receive regular servicing to prevent unexpected breakdowns. IMS auto-generates work orders based on your configured schedule.

### Steps

1. Navigate to **CMMS** → **Assets** and select the asset you want to create a PM schedule for.
2. Click the **Maintenance Plans** tab on the asset record.
3. Click **Add Plan**.
4. Enter the plan **details**:
   - **Plan Name**: e.g., 'Quarterly Lubrication Service'
   - **Description**: what this maintenance plan covers
5. Add **Maintenance Tasks** to the plan by clicking **Add Task** for each task:
   - **Task Description**: what must be done
   - **Estimated Duration**: hours required
   - **Required Skill/Certification**: any special qualifications needed
   - **Materials Required**: list parts or consumables (these are reserved from inventory)
6. Select the **Schedule Type**:
   - **Fixed Interval**: maintenance runs every N days (e.g., every 90 days)
   - **Meter-Based**: maintenance runs every N hours of operation (e.g., every 500 run hours)
   - **Seasonal**: maintenance runs at specific calendar periods (e.g., every April)
   - **Condition-Based**: triggered when a sensor reading crosses a threshold
7. Set the **First Due Date** for the initial work order to be generated.
8. Set the **Lead Time**: how many days before the due date the work order should appear in the queue.
9. Click **Save Plan**. The plan is now active.
10. IMS automatically generates a **Work Order** when the due date approaches and places it in the CMMS work queue.
11. A technician accepts the work order, carries out the maintenance, records time and materials used, and closes the work order.
12. Closing the work order automatically calculates and sets the **next due date** based on your schedule.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['cmms', 'maintenance', 'preventive'],
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
    id: 'KB-HT-033',
    title: 'How to Create a Project and Assign Tasks',
    content: `## How to Create a Project and Assign Tasks

Project Management in IMS gives you a structured way to plan, resource, and track work from initiation to completion.

### Steps

1. Navigate to **Project Management** → click **New Project**.
2. Enter the project **details**:
   - **Project Name**: descriptive title
   - **Description**: project objectives and scope
   - **Start Date** and **Target End Date**
   - **Budget**: total approved project budget
   - **Project Manager**: assign from your user list
3. Click **Create Project**. The project opens in the planning view.
4. Create **Project Phases** to structure the project (e.g., Discovery, Design, Build, Test, Launch). Click **Add Phase** for each.
5. Add **Tasks** to each phase. For each task, click **Add Task** and complete:
   - **Title** and **Description**
   - **Assignee**: person responsible for completing the task
   - **Start Date** and **Duration** in days
   - **Dependencies**: link tasks that must be completed before this one can start
6. Add **Milestones** at key delivery points: click **Add Milestone** → name and date. Milestones are shown as diamond shapes on the Gantt chart.
7. Assign **Resources** to tasks: in the Resource view, drag team member names onto the tasks they are working on.
8. Check the **Resource Utilisation** view for over-allocation (shown in red). Adjust task assignments or dates to resolve conflicts.
9. Click **Baseline the Plan** to lock the original planned dates for future comparison.
10. Click **Share with Team**. Team members receive email notifications listing their assigned tasks.
11. Team members view their tasks in **My Tasks** and update progress (Not Started, In Progress, Complete).
12. The project appears in the **Portfolio Dashboard** alongside all other active projects.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['project-management', 'planning', 'tasks'],
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
    id: 'KB-HT-034',
    title: 'How to Handle an Environmental Incident',
    content: `## How to Handle an Environmental Incident

Environmental incidents (spills, emissions exceedances, noise complaints) require prompt logging, investigation, and regulatory reporting where applicable.

### Steps

1. **Log the incident immediately** after it is identified. Navigate to **Environment** → **Events** → click **New Event**.
2. Set the **Event Type**: Spill, Emission Exceedance, Noise Complaint, Water Quality, Waste Management Breach, or Other.
3. Complete the incident details:
   - Description of what happened, when, and where
   - Estimated quantity/scale of the incident
   - Upload photos and any monitoring data
4. Assess the **Potential Environmental Impact**: select affected media (air, water, soil, biodiversity), severity, and geographic extent.
5. Record **Immediate Response Actions** taken (e.g., spill contained, drain blocked, material cleaned up).
6. Notify required parties:
   - Assign the environmental manager as the responsible investigator
   - If the incident exceeds a regulatory threshold, use **Notify Regulator** button to generate a regulatory notification and log the notification date
7. Assign an **Investigation**: set investigation tasks, assign team members, and set completion deadlines.
8. Complete the investigation to determine the root cause. Link to the relevant **Aspects Register** entry.
9. Create a **Corrective Action**: if the root cause is a control failure, raise a CAPA linked to this event.
10. Update the **Aspects Register**: if the incident reveals an aspect was underrated or a control is inadequate, update the significance assessment and controls.
11. Click **Close Event** once the corrective action is verified complete and the situation is fully resolved.
12. If regulatory reporting was required, upload the filed report to the event record and record submission confirmation details.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['environment', 'incident', 'iso-14001'],
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
    id: 'KB-HT-035',
    title: 'How to Create an Anti-Bribery Due Diligence Request',
    content: `## How to Create an Anti-Bribery Due Diligence Request

ISO 37001 requires appropriate due diligence on business associates. This guide covers initiating a due diligence request through the IMS anti-bribery module.

### Steps

1. Navigate to **ISO 37001** → **Due Diligence** → click **New Request**.
2. Enter the **subject details**:
   - **Subject Name**: name of the company or individual being assessed
   - **Assessment Type**: New Business Partner, Existing Partner Re-screening, or Project-Specific
   - **Requestor**: your name and department
3. Classify the **Partner Type**: Agent or Intermediary, Distributor, Joint Venture Partner, Supplier, or Customer. Partner type influences risk scoring.
4. Based on your initial risk assessment, select the **Due Diligence Level**:
   - **Simplified**: for low-risk partners (low-risk country, low transaction value, indirect relationship)
   - **Standard**: for moderate-risk partners
   - **Enhanced**: for high-risk partners (high-risk jurisdiction, large transactions, agent relationships)
5. Click **Send Questionnaire**. The partner receives an email with a secure portal link to complete the due diligence questionnaire.
6. The partner completes the questionnaire online: company ownership structure, PEP connections, certifications, anti-bribery policies, and references.
7. You are notified when the questionnaire is submitted. Review all responses in the Due Diligence record.
8. Click **Run Automated Checks**: the system runs sanctions list screening (OFAC, UN, EU), adverse media search, and PEP check.
9. Review the automated check results. Investigate any flags manually.
10. Record the overall **Risk Rating**: Low, Medium, High, or Unacceptable.
11. Make the **Decision**: Approve, Approve with Conditions (specify conditions and monitoring), or Reject (record reason).
12. All questionnaire responses, automated check results, and decisions are stored in the due diligence record as permanent evidence.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['iso-37001', 'anti-bribery', 'due-diligence'],
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
    id: 'KB-HT-036',
    title: 'How to Create a Chemical Safety Assessment',
    content: `## How to Create a Chemical Safety Assessment

Chemical safety assessments (COSHH assessments) evaluate the health risks from hazardous substances and determine adequate controls and PPE.

### Steps

1. Navigate to **Chemical Register** → locate the chemical requiring assessment → click the chemical name to open its record.
2. Click **Create Risk Assessment** on the chemical record page.
3. The assessment is pre-populated with hazard information from the Safety Data Sheet (SDS). Verify this information is current.
4. Click **Add Task** to identify each task or process where this chemical is used:
   - **Task Name**: describe the work activity
   - **Location**: where the activity takes place
   - **Frequency**: how often this task is performed (daily, weekly, occasionally)
5. For each task, assess the **Exposure**:
   - **Duration** of exposure per task (minutes or hours)
   - **Route of Exposure**: inhalation, skin contact, ingestion, or injection
   - **Exposure Quantity/Concentration**: estimated amount or concentration
6. Compare the exposure assessment against relevant **Occupational Exposure Limits** (the system retrieves these from the chemical's SDS data).
7. Rate the **Risk Level** before controls: Low, Medium, High, or Very High.
8. Add **Controls** using the hierarchy of controls framework:
   - Elimination or substitution
   - Engineering controls (LEV, enclosure, ventilation)
   - Administrative controls (safe work procedures, training, time limits)
   - **PPE**: specify type, standard (e.g., EN 374 gloves), and supplier
9. Reassess the **Residual Risk** after all controls are applied.
10. Add **Emergency Response Information**: first aid measures for each exposure route, spill response procedure.
11. Assign the assessment to all **Affected Employees** for acknowledgement.
12. Set a **Review Date** (annually, or immediately if the chemical or process changes).
13. Click **Submit for Approval** and then **Approve** to finalise the assessment.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['chemicals', 'coshh', 'risk-assessment'],
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
    id: 'KB-HT-037',
    title: 'How to Set Up Multi-Site Organisation Structure',
    content: `## How to Set Up Multi-Site Organisation Structure

Configuring a multi-site structure enables site-specific management, reporting, and access control while maintaining a consolidated organisation-wide view.

### Steps

1. Navigate to **Admin Console** → **Organisation** → **Sites**.
2. For each physical location, click **Add Site** and complete:
   - **Site Name**: full descriptive name
   - **Site Code**: short unique code used in reference numbers (e.g., 'SYD-HQ', 'MEL-WH')
   - **Address**: full postal address
   - **Timezone**: correct local timezone for date and time display
3. Click **Save** after entering each site's details.
4. Assign a **Site Administrator** for each site: this user will have admin-level access scoped to their site only. They receive an invitation email.
5. Configure **site-specific settings** (click into the site → Settings tab):
   - **Modules Enabled**: turn off modules not used at this site
   - **Default Roles**: roles automatically applied to new users created at this site
   - **Local Regulations**: set country and state for automatic applicable legislation filtering
6. Create the **Location Hierarchy** within each site: click Add Location → create buildings → add floors within buildings → add areas within floors. Assign location codes to each node.
7. Assign existing **employees** to sites: HR → Employees → filter by current site → bulk select → Actions → Change Site.
8. Configure **data visibility rules** per role (Admin Console → Roles → [Role] → Data Scope):
   - **Own Site Only**: default for most operational roles
   - **All Sites**: for senior managers and corporate functions
   - **Specific Sites**: for regional managers covering defined sites
9. Test the setup by logging in as each site administrator and verifying they see only their site's data.
10. Brief site administrators on their responsibilities and provide them with the Site Administrator Quick Start guide.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['admin', 'multi-site', 'settings'],
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
    id: 'KB-HT-038',
    title: 'How to Configure the Supplier Portal',
    content: `## How to Configure the Supplier Portal

The Supplier Portal gives external suppliers a dedicated self-service interface to interact with your organisation. Configure it to control what suppliers can access and do.

### Steps

1. Navigate to **Admin Console** → **Portal Settings** → **Supplier Portal**.
2. Toggle **Enable Supplier Portal** to on.
3. Configure **Branding**:
   - Upload your organisation logo (PNG or SVG, max 2 MB)
   - Set primary and secondary colours using hex codes
   - Write a **Welcome Message** that greets suppliers on login
4. Configure **Self-Registration**: decide whether suppliers can register themselves or must be invited:
   - If self-registration: define the required registration fields and set an approval workflow for new supplier accounts
   - If invite-only: supplier accounts are created by your procurement team
5. Configure **Portal Permissions** — decide what suppliers can see and do in the portal:
   - View Purchase Orders sent to them
   - Submit invoices against POs
   - Update their company profile and certifications
   - Respond to audit requests and questionnaires
   - View and accept contract documents
6. Configure **Supplier Notifications**: set up automatic emails to suppliers for events such as:
   - New Purchase Order received
   - Audit scheduled
   - Re-qualification reminder
   - Document requiring signature
7. Set up the **Portal URL** (e.g., suppliers.yourcompany.com) if you are using a custom domain. Follow the DNS configuration instructions provided.
8. Create a **test supplier account** and log in to verify the portal appearance and all configured permissions work correctly.
9. Click **Activate Portal** to make it live.
10. Send **invitation links** to suppliers via the Supplier Management module: Suppliers → select supplier → Actions → Send Portal Invitation.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['supplier-portal', 'suppliers', 'portal'],
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
    id: 'KB-HT-039',
    title: 'How to Schedule and Track Training Completions',
    content: `## How to Schedule and Track Training Completions

Tracking training compliance ensures all employees have completed required training. IMS provides a real-time compliance dashboard and automated reminder tools.

### Steps

1. Navigate to **Training** → **Reports** → **Training Compliance**.
2. The compliance dashboard displays by default for all employees across all training. Use the **filters** to narrow the view:
   - **Department**: filter to a specific team or business unit
   - **Role**: filter to employees with a specific job title
   - **Training Plan**: filter to a specific mandatory training programme
   - **Status**: show All, Overdue Only, or Due Soon
3. Review the **Compliance Table**: each employee row shows their completion status:
   - Green: all required training complete
   - Amber: training is assigned and due within 30 days
   - Red: training is overdue or not started past the deadline
4. Click any employee name to view their full **Training Record**: all training assigned, completed, and expired.
5. To send reminders to overdue employees: tick the checkboxes next to overdue employees → click **Send Reminder**.
6. In the reminder dialog, choose to use the default reminder template or write a custom message. Click **Send**.
7. To send automated escalation notices to managers: configure an escalation rule in Workflows that fires when training is overdue by N days and notifies the employee's manager.
8. Generate a **Compliance Report**:
   - Click **Export** → choose Excel (for detailed data manipulation) or PDF (for sharing with management)
   - The report shows completion rates by department, role, and training programme
9. Schedule an **Automated Compliance Report**: click Schedule → set frequency (weekly or monthly) → choose recipients (e.g., all department managers) → Save. Managers receive the report automatically on the configured schedule.
10. For regulatory mandatory training, use the **Expiry Tracking** view to see employees whose certifications are approaching expiry.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['training', 'compliance', 'reporting'],
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
    id: 'KB-HT-040',
    title: 'How to Configure Automated Escalation Rules',
    content: `## How to Configure Automated Escalation Rules

Escalation rules automatically notify senior staff when records are overdue or unactioned, ensuring nothing slips through the cracks without intervention.

### Steps

1. Navigate to **Workflows** → **Escalation Rules** → click **New Rule**.
2. Enter a descriptive **Rule Name** (e.g., 'CAPA Overdue Escalation — H&S Manager').
3. Select the **Module** this rule applies to: Incidents, CAPA, Documents, Complaints, Audits, or Permits.
4. Select the **Trigger** condition:
   - Record status has not changed for N days
   - Record is past its due date by N days
   - SLA response or resolution timer is approaching limit (specify percentage, e.g., 80%)
   - A specific field value is set (e.g., Severity equals CRITICAL)
5. Set the **Trigger Timing**: how many days after the trigger condition is met before the first escalation fires.
6. Configure the **First Escalation**:
   - **Recipient**: select 'Record owner\'s manager', a specific role (e.g., H&S Manager), or a named person
   - **Message Template**: write the escalation email. Include variables like '{record_id}', '{title}', '{owner}', '{days_overdue}', '{link}'
   - **Timing**: number of days after trigger before this escalation fires
7. Click **Add Escalation Level** to add a second escalation that fires if the first goes unaddressed:
   - Select a higher-level recipient (e.g., Department Director or CEO for critical items)
   - Set a new timing (e.g., 5 days after first escalation)
8. Set the **Maximum Escalation Level** to prevent the chain from escalating indefinitely.
9. Toggle **Notify Original Assignee** at each escalation level to keep the record owner informed as the escalation climbs.
10. Click **Test Rule**: create a test record that meets the trigger condition and verify the escalation fires to the correct recipients.
11. Review test emails to ensure content and links are correct.
12. Click **Activate** to make the rule live. Confirm it appears in the Active Escalation Rules list.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['workflows', 'escalation', 'notifications'],
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
