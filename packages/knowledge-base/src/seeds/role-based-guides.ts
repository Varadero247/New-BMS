import type { KBArticle } from '../types';

export const roleBasedGuideArticles: KBArticle[] = [
  {
    id: 'KB-RB-001',
    title: 'IMS Guide for the System Administrator',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'admin', 'system-administrator'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the System Administrator

## Your Role in IMS

As a System Administrator, you are the backbone of the IMS platform. You manage user access, maintain integrations, monitor service health, and ensure the system is running reliably for all other roles. Most users will never see the screens you work in daily — but the entire organisation depends on the work you do.

---

## Your Key Modules

- **User Management**: Create, edit, suspend, and delete user accounts; assign roles and module permissions; process access requests promptly.
- **Organisation Settings**: Maintain the organisation profile, logo, regulatory standards, and financial year configuration.
- **Integration Configuration**: Manage API keys, webhooks, SSO connections, SCIM provisioning, and third-party integrations.
- **Audit Trail**: Review system-wide activity logs to investigate security incidents or support compliance evidence requests.
- **System Health Dashboard**: Monitor all 43+ API services, database connectivity, and background job queues.
- **Backup & Recovery**: Verify scheduled database backups complete successfully and test restore procedures quarterly.
- **License & Subscription**: Track user seat counts, module entitlements, and renewal dates.

---

## Your Typical Week

### Monday — Weekly Health Check
- Review the System Health Dashboard for any weekend alerts or service degradation
- Check backup job logs from the weekend to confirm all backups completed successfully
- Review the audit trail for any unusual login activity or failed authentication attempts
- Clear any stale pending user invitations (older than 72 hours)

### Tuesday / Wednesday — User & Access Management
- Process new user invitation requests from department managers
- Review and action any role change requests
- Audit users who have not logged in for 90+ days — confirm with managers whether access should be suspended
- Check SCIM sync logs if you have Active Directory or Okta integration enabled

### Thursday — Integration & Configuration Review
- Review webhook delivery logs for any failed integrations
- Verify API key rotation schedule — keys older than 90 days should be flagged for rotation
- Check SSO configuration for any certificate expiry warnings
- Review any pending feature flag changes with module owners before enabling in production

### Friday — Reporting & Documentation
- Generate the weekly system usage report (Settings → Reports → System Usage)
- Update your admin runbook with any configuration changes made during the week
- Review open IT support tickets related to IMS access or functionality
- Plan next week's maintenance window if patching or schema migrations are needed

---

## Your Most Important Reports

1. **User Activity Report** — Shows login frequency, last login date, and active module usage per user. Useful for licence optimisation and access audits.
2. **Audit Trail Export** — Full export of all create/edit/delete actions across the system. Essential for compliance investigations and external audits.
3. **System Health Report** — Service uptime, response time averages, and error rate summary across all API services.
4. **Failed Login Report** — Count and source of failed login attempts. Flag accounts with repeated failures for security review.
5. **Integration Status Report** — Webhook delivery success rates, API key usage, and SSO authentication counts.

---

## Quick Tips for Your Role

- **Use the Global Search (Cmd+K)** to quickly navigate to any user, setting, or audit log entry without clicking through menus.
- **Set up a dedicated admin notification email** separate from your personal email so critical system alerts are never missed on holiday cover days.
- **Never share the SUPER_ADMIN account** — each administrator should have their own SYSTEM_ADMIN account so the audit trail is attributable.
- **Test the backup restore** at least once per quarter — a backup you have never restored is an untested backup.
- **Document every schema migration** in your admin runbook before executing — include rollback steps.
- **Use the 'Impersonate User' feature** (SUPER_ADMIN only) to reproduce user-reported issues without needing their password.

---

## Getting More From IMS

**Bulk User Operations**: Under Settings → Users → Bulk Actions, you can import users from CSV, bulk-assign roles, and export the full user list for auditing.

**Role Cloning**: If you need a custom permission set, clone an existing role and adjust individual module permission levels rather than building from scratch.

**Webhook Monitoring**: Navigate to Settings → Integrations → Webhooks → Delivery Log to see a real-time feed of all outbound webhook calls. Failed deliveries are highlighted in red with the HTTP response code.

**Scheduled Reports**: Configure automated weekly or monthly reports to be emailed to stakeholders. Settings → Reports → Scheduled Reports → New Schedule.

**Two-Factor Authentication Enforcement**: For sensitive roles (FINANCE_MANAGER, COMPLIANCE_OFFICER, SUPER_ADMIN), enforce 2FA at the role level. Settings → Security → 2FA Policy → Role Enforcement.
`,
  },

  {
    id: 'KB-RB-002',
    title: 'IMS Guide for the HSE Manager',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'health-safety', 'environment', 'hse-manager'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the HSE Manager

## Your Role in IMS

As an HSE Manager, IMS is your command centre for health, safety, and environmental compliance. You use it to oversee incidents, manage risk assessments, track permit workflows, monitor environmental performance, and demonstrate legal compliance to regulators and certification bodies. IMS gives you the visibility to spot trends before they become incidents, and the documentation trail to prove your management system is effective.

---

## Your Key Modules

- **Health & Safety (port 3001)**: Manage risk assessments, safety observations, toolbox talks, JSAs, legal requirements, and OHS objectives. Your primary daily workspace.
- **Environmental Management (port 3002)**: Manage environmental aspects and impacts register, legal compliance calendar, objectives, and CAPA actions.
- **Incident Management (port 3041)**: Review and investigate all incidents, near-misses, and dangerous occurrences. Track RIDDOR-reportable events.
- **Permit to Work (port 3039)**: Monitor open permits, approve high-risk work, review permit closure compliance.
- **Training Management (port 3032)**: Verify that all safety-critical training requirements are current for your workforce.
- **Corrective Action (CAPA)**: Track investigation findings through to verified closure.
- **Audit Management (port 3042)**: Schedule and review internal HSE audits.

---

## Your Typical Week

### Monday — Weekly HSE Dashboard Review
- Open the H&S module and review the KPI summary: LTIFR, TRIFR, near-miss rate, open actions
- Check the Incident module for any incidents reported over the weekend — review severity and assign investigators
- Review the PTW queue: any permits that have been open beyond their planned duration
- Check overdue risk assessments (filter: Review Date < today, Status = Active)

### Tuesday — Action Close-Out
- Work through the open CAPA list filtered to your department — chase overdue actions with owners
- Review any corrective actions arising from recent incident investigations
- Check environmental legal compliance calendar for any deadlines this week or next
- Approve any new risk assessments submitted for your review

### Wednesday — Operational Reviews
- Attend site operations meeting with current HSE metrics from IMS dashboard
- Review near-miss trends using the H&S analytics chart (last 30 days by category)
- Check contractor safety briefing completion records in the Training module
- Review any new significant environmental aspects raised by the team

### Thursday — Compliance & Reporting
- Update the legal register with any new or amended legislation identified via the Regulatory Monitor module
- Review OHS objectives progress — update milestone completion percentages
- Generate the monthly HSE summary report draft (H&S → Reports → Monthly Summary)
- Review audit findings with outstanding corrective actions

### Friday — Planning
- Review next week's high-risk work schedule and confirm PTWs are being prepared in advance
- Check training expiry calendar for safety-critical roles — any expiring within 30 days
- Review environmental monitoring data entered during the week (emissions, waste, water)
- Prepare talking points for the weekly leadership HSE update

---

## Your Most Important Reports

1. **Monthly HSE Performance Report** — Incident rates, near-miss trends, permit compliance, training compliance, and action close-out rate. The core document for management review.
2. **Legal Compliance Calendar** — All H&S and environmental legal obligations with due dates. Prevents missed reporting deadlines.
3. **Overdue Actions Dashboard** — Actions past their target close date, by module, owner, and severity. Your escalation tool.
4. **Significant Aspects Register** — Environmental aspects with significance scores above threshold. Required for ISO 14001 audits.
5. **Training Compliance Matrix** — Safety-critical training requirements versus completion status per employee. Used for contractor and staff audits.

---

## Quick Tips for Your Role

- **Use saved filters** in the Incident module to create a personal view of your site or department's incidents.
- **Set alert thresholds** on incident rates — IMS can notify you by email when LTIFR exceeds your target.
- **Link risk assessments to PTWs** — the PTW module can auto-populate hazard information from the risk register for the same task type.
- **Schedule the Monthly HSE Report** to auto-generate and email to your distribution list on the first working day of each month.
- **Use the AI Analysis panel** in the Environmental module to identify significance scoring anomalies across your aspects register.

---

## Getting More From IMS

**Management Review Pack**: Navigate to H&S → Reports → Management Review to generate a pre-formatted management review input pack including all required ISO 45001 and ISO 14001 inputs.

**Regulatory Monitor Integration**: The Regulatory Monitor module (port 3040) feeds new and amended H&S and environmental legislation directly into your legal register. Set up keyword alerts for your jurisdiction and sector.

**Bulk Risk Assessment Import**: If you have existing risk assessments in spreadsheet format, use the bulk import tool under H&S → Risk Assessments → Import to migrate them without manual re-entry.

**Cross-Module Dashboard**: Build a custom dashboard widget set combining H&S, Environmental, and Incident KPIs into a single view. Settings → Dashboard → Add Widget → select your metrics.
`,
  },

  {
    id: 'KB-RB-003',
    title: 'IMS Guide for the Quality Manager',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'quality', 'quality-manager'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Quality Manager

## Your Role in IMS

As Quality Manager, IMS gives you end-to-end control of your quality management system aligned to ISO 9001. You manage the document system, oversee CAPA and nonconformance workflows, monitor customer complaints, schedule and review audits, and generate the evidence you need for certification body visits. IMS connects these workflows so that a customer complaint can trigger a nonconformance, which triggers a CAPA, which links to a document revision — all in one traceable chain.

---

## Your Key Modules

- **Quality Management (port 3003)**: Manage nonconformances, inspection records, KPIs, and quality objectives. Your primary workspace.
- **Document Control (port 3035)**: Control all procedures, work instructions, forms, and policies with full version history and approval workflows.
- **Audit Management (port 3042)**: Schedule internal audits, manage checklists, record findings, and track finding closure.
- **Complaint Management (port 3036)**: Log and track customer complaints through to root cause analysis and resolution.
- **Corrective Action (CAPA)**: Manage corrective and preventive actions arising from all sources (audits, nonconformances, complaints, incidents).
- **Supplier Management (port 3033)**: Monitor supplier quality performance and manage supplier nonconformances.
- **Training Management (port 3032)**: Verify quality-related training (QMS awareness, process skills) is current.

---

## Your Typical Week

### Monday — Quality Dashboard Review
- Review the Quality KPI dashboard: first-pass yield, nonconformance rate, complaint aging, CAPA close-out rate
- Check for any new customer complaints logged since Friday — assign investigation owners
- Review overdue CAPAs — escalate any past target date by more than 7 days
- Check document expiry calendar for the week — any controlled documents expiring that need review

### Tuesday — CAPA and Nonconformance Management
- Review open nonconformances for progress updates — confirm root cause identification is complete for items > 5 days old
- Review CAPA effectiveness checks due this week
- Approve new CAPAs submitted for your authorisation
- Check supplier quality reports for incoming nonconformances linked to supplier lots

### Wednesday — Document Control
- Review documents in the 'Pending Approval' queue — approve or return with comments
- Check the document revision schedule — coordinate with process owners for documents due for periodic review
- Verify controlled document distribution lists are current for any newly approved documents
- Review training acknowledgements for newly published documents (staff must acknowledge reading)

### Thursday — Audit Activities
- Review the audit programme — confirm auditors and auditees for next month's audits are confirmed
- Review audit findings from recent audits — chase corrective actions with owners
- Prepare evidence packs for any upcoming external audits (certification body, customer, regulatory)
- Review calibration records for any measurement equipment due for calibration

### Friday — Reporting & Management Review Preparation
- Update the Quality KPI tracker with week's data
- Review complaint closure metrics — target is 100% of complaints acknowledged within 24 hours, resolved within 15 working days
- Generate draft monthly quality report
- Send weekly quality summary to senior management

---

## Your Most Important Reports

1. **Management Review Report** — The complete ISO 9001 management review input pack: audit results, customer feedback, process performance, product conformity, CAPA status, resource needs, risk and opportunity review.
2. **CAPA Aging Report** — All open CAPAs by source, owner, target date, and days overdue. Your primary tool for keeping corrective action moving.
3. **Nonconformance Trend Report** — Nonconformances by product, process, department, and defect category over time. Identifies systemic quality failures.
4. **Customer Complaint Aging Report** — Open complaints by age, severity, and customer. Prevents SLA breaches and reputational risk.
5. **Document Expiry Calendar** — All controlled documents with their next review date. A rolling 90-day look-ahead prevents uncontrolled out-of-date documents.

---

## Quick Tips for Your Role

- **Link everything**: When logging a complaint, link it to the relevant product, process, and customer record. This cross-linking makes trend analysis far more powerful.
- **Use CAPA templates** for common root cause types (human error, equipment failure, supplier failure) to speed up the analysis phase.
- **Set document review reminders** 60 days before expiry so process owners have time to review without rushing.
- **Pre-load audit checklists** from the IMS template library — ISO 9001 clause-by-clause checklists are available under Audit Management → Checklists → Templates.
- **Use the Pareto chart** in the Quality analytics panel to identify the top 3 defect categories driving your nonconformance rate.

---

## Getting More From IMS

**Evidence Pack for Certification Audits**: Navigate to Quality → Reports → Evidence Pack. IMS compiles all required ISO 9001 evidence — document register, audit programme, CAPA register, complaint log, calibration records, and management review minutes — into a single downloadable pack.

**Supplier Quality Dashboard**: Under Supplier Management → Quality view, track supplier DPPM (defective parts per million), on-time delivery, and audit scores in one place.

**Process Interaction Map**: Use the Document Control module's process mapping feature to visualise how your quality procedures interconnect — useful for both training and audit preparation.

**Customer Satisfaction Trending**: The CRM module feeds NPS and customer satisfaction survey results into the Quality dashboard. Enable the integration under Quality → Settings → Customer Satisfaction Data Source.
`,
  },

  {
    id: 'KB-RB-004',
    title: 'IMS Guide for the Finance Manager',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'finance', 'finance-manager'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Finance Manager

## Your Role in IMS

As Finance Manager, IMS provides a unified view of financial performance, payroll, procurement, and ESG-related financial data. You use it to approve purchase orders, review budget vs actual performance, manage month-end close, and generate the financial reports required for management review, board reporting, and statutory compliance. IMS connects finance data with operational modules so you can see the cost implications of quality failures, safety incidents, and sustainability investments.

---

## Your Key Modules

- **Finance & Accounting (port 3013)**: Core financial management — general ledger, budget management, purchase orders, accounts payable/receivable, financial reporting.
- **Payroll (port 3007)**: Payroll run management, payslip generation, multi-jurisdiction tax compliance, leave liability reporting.
- **ESG (port 3016)**: ESG financial disclosures — carbon cost reporting, social investment data, governance metrics for annual sustainability reporting.
- **Asset Management (port 3034)**: Asset register with depreciation schedules — integrates with Finance for balance sheet accuracy.
- **Contract Management (port 3037)**: Financial contracts and obligations — payment schedules, renewal dates, penalty clauses.

---

## Your Typical Week

### Monday — Financial Overview
- Review the Finance dashboard: cash position, outstanding receivables, payables due this week, budget vs actual YTD
- Review purchase orders pending your approval — approve or return with queries
- Check payroll status if payroll run is this week — verify headcount and pay period data
- Review any contract payment milestones due this week

### Tuesday / Wednesday — Operational Finance
- Process supplier invoices and match to purchase orders
- Review budget variance reports for departments with significant over/under-spend
- Approve payroll run once pre-run checks complete
- Review fixed asset additions and disposals for depreciation accuracy
- Monitor ESG data submissions from operational teams (energy cost, waste disposal cost, social spend)

### Thursday — Compliance & Reporting
- Review financial compliance calendar — VAT returns, statutory filings, audit deadlines
- Prepare management accounts pack for month-end (if applicable)
- Review ESG financial disclosure data — verify carbon cost calculations against emission factor data from the Environmental module
- Check contract register for any contracts expiring in the next 60 days requiring renewal decision

### Friday — Month-End Preparation (rolling)
- Review accruals and prepayments schedule
- Confirm all purchase invoices for the period have been posted
- Review payroll liabilities on the balance sheet
- Distribute budget vs actual report to department heads
- Update financial forecast for remainder of year

---

## Month-End Close Checklist in IMS

Navigate to Finance → Month-End → Checklist. The IMS month-end checklist includes:

- [ ] All purchase invoices posted for the period
- [ ] Payroll journal posted
- [ ] Fixed asset depreciation run completed
- [ ] Bank reconciliation completed and signed off
- [ ] Accruals and prepayments journal posted
- [ ] Intercompany transactions reconciled (if applicable)
- [ ] Budget vs actual variance report reviewed with department heads
- [ ] ESG financial data consolidated for the period
- [ ] Management accounts pack distributed
- [ ] Period locked in the system (Finance → Settings → Lock Period)

---

## Your Most Important Reports

1. **Management Accounts Pack** — P&L, balance sheet, cash flow statement, and budget variance commentary. Generated monthly for board review.
2. **Budget vs Actual Report** — Variance analysis by department and cost centre. Your primary tool for financial control conversations.
3. **Payroll Summary Report** — Gross pay, deductions, net pay, and employer costs by department. Required for HR and board reporting.
4. **ESG Financial Disclosure** — Carbon cost, social investment, governance costs. Feeds into the annual sustainability report.
5. **Cash Flow Forecast** — 13-week rolling cash flow projection. Critical for liquidity management.

---

## Quick Tips for Your Role

- **Set approval thresholds** for purchase orders so only items above a certain value require your personal approval — delegate smaller items to department budget holders.
- **Use the tax engine** for multi-jurisdiction calculations if your organisation operates across multiple countries — it handles VAT, GST, and withholding tax automatically.
- **Link asset acquisitions to purchase orders** in the system so the asset register is updated automatically when a PO is receipted.
- **Schedule the management accounts pack** to auto-generate on the 5th working day of each month so distribution is never delayed by manual report production.
- **Review the ESG financial data monthly** rather than leaving it to the year-end — it is much easier to correct data errors in-period than retrospectively.

---

## Getting More From IMS

**Financial Compliance Automation**: The Finance module tracks tax filing deadlines, VAT period end dates, and statutory audit milestones automatically. Navigate to Finance → Compliance Calendar to view and set reminders.

**Multi-Currency Support**: If your organisation trades in multiple currencies, configure exchange rate settings under Finance → Settings → Currency. Rates can be manually entered or pulled from an external feed.

**Cost Centre Reporting**: Drill down from the budget vs actual report to individual cost centre detail, then to transaction level. Navigate: Finance → Reports → Budget vs Actual → [Department] → Drill Down.

**ESG Carbon Cost Integration**: When the Environmental module logs emission data, IMS automatically calculates the associated carbon cost using the current carbon price configured in ESG → Settings → Carbon Price. This appears in your ESG financial disclosure automatically.
`,
  },

  {
    id: 'KB-RB-005',
    title: 'IMS Guide for the HR Manager',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'hr', 'hr-manager'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the HR Manager

## Your Role in IMS

As HR Manager, IMS is your single system of record for all people data. You use it to manage the employee lifecycle from onboarding to offboarding, ensure training compliance, support payroll processing, track leave and absence, and report on workforce metrics. IMS connects HR data with other modules — so a new starter automatically gets safety training assigned, and an employee leaving triggers an access revocation checklist.

---

## Your Key Modules

- **HR & Employee Management (port 3006)**: Employee records, contracts, positions, departments, onboarding/offboarding checklists, leave management, performance review scheduling.
- **Training Management (port 3032)**: Training schedule, completion tracking, competency matrix, certification expiry management.
- **Payroll (port 3007)**: Payroll processing, payslip distribution, leave deduction integration, multi-jurisdiction tax compliance.
- **Health & Safety (port 3001)**: Linked for occupational health records, safety training compliance, and incident involvement records.
- **Document Control (port 3035)**: HR policy document management — employee handbooks, disciplinary procedures, contracts of employment.

---

## Your Typical Week

### Monday — Workforce Overview
- Review the HR dashboard: headcount summary, open positions, employees on leave today, recent starters and leavers
- Check training compliance dashboard — any safety-critical training expired or expiring this week
- Review onboarding checklists for new starters — confirm IT access, induction training, and buddy allocation are on track
- Action any leave requests pending approval

### Tuesday / Wednesday — Employee Records & Compliance
- Process any contract changes, position transfers, or pay review updates
- Review the training completion report — chase managers for team members with overdue mandatory training
- Update employee records for any promotions, department transfers, or job title changes processed this week
- Review the HR compliance calendar — any statutory returns or filing deadlines approaching

### Thursday — Payroll Preparation
- Verify payroll inputs: new starters, leavers, pay changes, overtime, and leave deductions
- Review leave balance report — check for any negative balances or unusual patterns
- Coordinate with Finance on payroll cost centre allocations
- Confirm training cost allocations for the period

### Friday — Reporting & Planning
- Generate weekly headcount report for distribution to senior management
- Review performance review schedule — remind managers of upcoming review deadlines
- Check offboarding checklists for leavers — confirm exit interview, IT access revocation, and equipment return are completed
- Plan next week's HR activities: recruitment, interviews, inductions

---

## HR Compliance Calendar in IMS

Navigate to HR → Compliance Calendar. This shows all statutory HR obligations:

- P60/P11D distribution deadlines (UK)
- Annual leave year-end carryover calculations
- Contract renewal dates
- Probationary period review dates
- Performance appraisal cycle milestones
- Training certification renewal dates (per role)
- Pension auto-enrolment re-enrolment dates

Set reminder alerts so you receive email notifications 30 and 7 days before each deadline.

---

## Your Most Important Reports

1. **Headcount & Turnover Report** — Current headcount by department, new starters, leavers, and turnover rate. Required for board reporting and ESG social metrics.
2. **Training Compliance Matrix** — All mandatory training requirements versus completion status per employee, colour-coded by compliance status. Used in management review and external audits.
3. **Leave Balance Report** — Remaining leave entitlements and any negative balances. Essential for payroll accuracy and year-end planning.
4. **Payroll Summary** — Gross pay, deductions, employer costs by department. Shared with Finance for cost centre reporting.
5. **Onboarding/Offboarding Status** — Open onboarding and offboarding checklists with item completion percentage. Ensures nothing is missed.

---

## Quick Tips for Your Role

- **Use onboarding templates** — create templates for each role type (e.g., Operator, Engineer, Manager) so new starter checklists are generated automatically with the right steps and training assignments.
- **Set training expiry alerts** — configure 60-day and 30-day email reminders for safety-critical training expiry so you are never scrambling at the last minute.
- **Link HR records to IMS user accounts** — when an employee is created in the HR module, link their IMS system user account so deactivation on offboarding happens in one step.
- **Use bulk actions** for mass training assignments when you roll out new mandatory training to a large employee group.
- **Review the ESG social metrics** in HR monthly — training hours, diversity statistics, and LTIFR feed directly into the ESG report.

---

## Getting More From IMS

**Competency Matrix**: Navigate to HR → Competency Matrix to view a role-by-role breakdown of required versus held competencies. Identifies skills gaps across your workforce and feeds training planning.

**Self-Service Portal**: Employees can access their own records, submit leave requests, view payslips, and acknowledge training via the HR self-service view. Reduces the volume of manual HR admin requests significantly.

**Performance Review Integration**: HR → Performance Reviews allows you to schedule appraisal cycles, distribute review forms, and collate outcomes. Results feed into succession planning and pay review workflows.

**GDPR Data Management**: For subject access requests and right-to-erasure requests, navigate to HR → Data Privacy → DSAR Management. IMS tracks request status against the 30-day statutory deadline.
`,
  },

  {
    id: 'KB-RB-006',
    title: 'IMS Guide for the Compliance Officer',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'compliance', 'compliance-officer'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Compliance Officer

## Your Role in IMS

As a Compliance Officer, IMS is your evidence management platform. You use it to maintain legal and regulatory registers, monitor compliance obligations, manage the audit programme, track corrective actions, and prepare evidence packs for external certification bodies and regulators. IMS gives you the audit trail and documentary evidence to demonstrate that your management system is not just documented — it is actively implemented and continuously improved.

---

## Your Key Modules

- **Compliance (gateway-managed)**: Organisation-wide compliance status, compliance calendar, and regulatory obligation tracking.
- **Legal Register**: Maintain all applicable legal and regulatory requirements — linked to the H&S, Environmental, and Quality modules.
- **Audit Management (port 3042)**: Plan and manage internal and external audits, record findings, track corrective actions, and generate audit reports.
- **Document Control (port 3035)**: Ensure all procedures, policies, and records are controlled, current, and accessible.
- **Corrective Action (CAPA)**: Track all corrective actions arising from audits, incidents, and compliance reviews to verified closure.
- **Regulatory Monitor (port 3040)**: Receive live feeds of regulatory changes relevant to your jurisdiction and sector.
- **Risk Register (port 3031)**: Maintain compliance risks in the organisational risk register.

---

## Your Typical Week

### Monday — Compliance Dashboard Review
- Review the compliance calendar for deadlines this week and next
- Check the Legal Register for any items flagged as 'Review Required' by the Regulatory Monitor
- Review open compliance actions for items due or overdue this week
- Check audit findings for any that have passed their target corrective action date without closure

### Tuesday / Wednesday — Regulatory and Legal Register Management
- Review regulatory change alerts from the Regulatory Monitor — assess applicability to your organisation
- Update the legal register with any new or amended legislation and assign compliance obligation owners
- Coordinate with HSE and Quality managers on new regulatory requirements affecting their areas
- Review and approve new or revised procedures submitted to Document Control

### Thursday — Audit Programme Management
- Review audit schedule — confirm upcoming audits are planned and resourced
- Review completed audit reports — check findings are correctly categorised (Major NC, Minor NC, Observation)
- Chase corrective action owners for outstanding actions from recent audits
- Prepare evidence requests for any upcoming external audits

### Friday — Reporting & Evidence
- Generate the weekly compliance status report for senior management
- Update the compliance dashboard with any changes to status RAG ratings
- Review the ISO evidence pack completeness (see below)
- Document any regulatory engagement activities (regulator correspondence, self-assessments)

---

## ISO Evidence Pack Generation

When preparing for a certification audit, navigate to:

  Compliance → Evidence Pack → Generate

Select the relevant standard (ISO 9001, ISO 14001, ISO 45001, ISO 27001, etc.) and IMS compiles:

- Document register (all controlled documents with current version and status)
- Audit programme and completed audit reports for the period
- CAPA register with all actions and closure evidence
- Legal register with compliance status for each obligation
- Objective and target tracker showing progress against planned results
- Management review minutes
- Training records for auditor competence verification
- Risk register extract relevant to the standard

The pack is generated as a structured PDF or ZIP file ready for upload to your certification body's portal.

---

## Your Most Important Reports

1. **Compliance Status Dashboard** — RAG status for all regulatory obligations, grouped by standard. Your at-a-glance compliance health check.
2. **Legal Register Review Report** — All legal obligations, their review date, compliance status, and responsible owner. Required for ISO audits.
3. **Audit Programme Status Report** — Planned vs completed audits, finding counts, and CAPA closure rates. Demonstrates audit programme effectiveness.
4. **CAPA Aging Report** — Corrective actions by source, age, and status. Shows continuous improvement is active.
5. **Regulatory Change Impact Log** — All regulatory changes reviewed, applicability assessment, and action taken. Evidences your regulatory monitoring process.

---

## Quick Tips for Your Role

- **Set the Regulatory Monitor to your specific jurisdiction and sector** — this filters the feed to only show legislation relevant to your organisation, reducing noise.
- **Link legal register entries to specific procedures** in Document Control — when legislation changes, the linked procedures are automatically flagged for review.
- **Use the pre-built ISO audit checklists** in Audit Management rather than creating from scratch — they are structured by clause and updated when standards are revised.
- **Generate the evidence pack quarterly** rather than just before each audit — reviewing it regularly reveals gaps while there is time to address them.
- **Set compliance status RAG ratings manually** for obligations with subjective assessment — do not rely solely on automated scoring for complex regulatory requirements.

---

## Getting More From IMS

**Cross-Standard Mapping**: Navigate to Compliance → Standards Convergence to see how your implemented management system elements satisfy requirements across multiple standards simultaneously. Particularly useful if you hold ISO 9001 and ISO 14001 and ISO 45001 — many requirements overlap.

**External Audit Scheduling**: Use Audit Management → External Audits to record certification body audit schedules, assign internal preparation tasks, and track pre-audit corrective actions. This gives you a single project management view of audit preparation.

**Compliance Obligation Templates**: IMS ships with pre-populated legal register templates for common jurisdictions and sectors. Navigate to Legal Register → Import Template to start from a relevant baseline rather than a blank register.

**Automatic Reminder Cascade**: When a compliance deadline is approaching, IMS can auto-escalate notifications: 30 days to the obligation owner, 14 days to you, 7 days to the senior leadership team. Configure under Compliance → Notification Settings.
`,
  },

  {
    id: 'KB-RB-007',
    title: 'IMS Guide for the Risk Manager',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'risk', 'risk-manager'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Risk Manager

## Your Role in IMS

As Risk Manager, IMS is your enterprise risk intelligence platform. You maintain the organisational risk register, facilitate risk assessments across departments, monitor risk treatment progress, review supply chain and operational risks, and report the risk landscape to the board and senior leadership. IMS connects risks to the incidents, audits, and compliance failures that materialise them — giving you real data to validate your risk assessments.

---

## Your Key Modules

- **Risk Register (port 3031)**: The core enterprise risk register — create, assess, and track risks with full treatment plans, owner assignments, and residual risk tracking.
- **Supply Chain Risk**: Monitor supplier-related risks — concentration risk, geopolitical exposure, financial stability signals.
- **Incident Management (port 3041)**: Review materialised risks — incidents are the real-world validation of your risk register.
- **Audit Management (port 3042)**: Audit findings often reveal unregistered risks — the link between audit findings and the risk register keeps it current.
- **InfoSec (port 3015)**: Information security risk register — feeds into enterprise risk for IT and data risks.
- **Health & Safety (port 3001)**: Operational safety risk assessments link to enterprise risk for major hazard scenarios.

---

## Your Typical Week

### Monday — Risk Dashboard Review
- Review the risk heat map: count of critical and high risks, movement since last week
- Check for any new risks added by department risk owners that require your review and approval
- Review materialised risks — any incidents or audit findings this week that link to existing register entries
- Check risk treatment actions due or overdue this week

### Tuesday / Wednesday — Risk Assessment Work
- Review risk assessments submitted by process owners for calibration and consistency
- Facilitate any new risk workshops if operationally triggered (new project, new site, new supplier)
- Review supply chain risk alerts — any supplier financial distress or geopolitical events affecting your supply base
- Update risk appetite and tolerance statements if board direction has changed

### Thursday — Treatment Plan Monitoring
- Review risk treatment progress: actions due in the next 30 days, percentage of planned treatments complete
- Review residual risk levels — for risks where treatments are complete, is the residual risk now within appetite?
- Escalate risks that have moved above risk appetite threshold to senior leadership
- Review emerging risk signals from threat intelligence feeds

### Friday — Reporting
- Generate the monthly risk report (if month-end week) or update the risk dashboard for weekly leadership review
- Review the top 10 risks summary for board report preparation
- Update risk register entries based on week's learning from incidents and audits
- Review risk interconnections — cascade effects between high-rated risks

---

## Risk Appetite and Tolerance Setting

Navigate to Risk Register → Settings → Risk Appetite to configure:

- **Risk Appetite Statement**: Narrative description of the board's risk tolerance stance (e.g., 'risk averse in safety; risk open in strategic growth')
- **Risk Matrix Configuration**: Define your likelihood and consequence scales (typically 5x5 or 4x4 matrices)
- **Appetite Thresholds by Category**: Set maximum acceptable risk scores by risk category (Strategic, Operational, Financial, Compliance, Reputational)
- **Escalation Rules**: Define which risk score triggers automatic notification to Risk Manager, CFO, and CEO

Once configured, the risk heat map automatically colour-codes entries as within appetite (green), approaching tolerance (amber), or above tolerance (red).

---

## Your Most Important Reports

1. **Risk Heat Map** — Visual representation of all register risks by likelihood and consequence, colour-coded by appetite status. The key board communication tool.
2. **Top 10 Risk Report** — Detailed summary of the highest-rated risks with treatment status, residual risk, and owner commentary.
3. **Risk Treatment Progress Report** — All planned treatments with completion percentage, overdue actions, and estimated residual risk improvement.
4. **Supply Chain Risk Concentration Report** — Supplier dependency analysis showing single-source risk, geographic concentration, and financial health indicators.
5. **Materialised Risk Log** — Incidents and audit findings mapped to risk register entries. Demonstrates risk register validity with real-world data.

---

## Quick Tips for Your Role

- **Use the risk interconnection map** to identify cascade risks — a single triggering event can sometimes activate multiple high-rated risks simultaneously.
- **Calibrate risk scores consistently** — use anchor examples for each rating level on your consequence scale so different departments score risks on the same basis.
- **Review the risk register after every significant incident** — incident investigations frequently reveal risks that are absent from or under-scored in the register.
- **Integrate with the Regulatory Monitor** — new legislation often creates compliance risks that should be registered immediately rather than waiting for the annual risk review.
- **Set residual risk targets** for every risk treatment — without a target, you cannot measure whether the treatment is working.

---

## Getting More From IMS

**Predictive Risk Scoring**: The Risk Register module includes ML-assisted risk scoring that analyses historical incident data, audit findings, and near-miss patterns to suggest likelihood adjustments for existing risks. Navigate to Risk Register → Analytics → Predictive Scoring.

**Risk Bowtie Diagrams**: For major hazard risks, use the bowtie diagram feature to map causes, preventive barriers, the top event, consequence barriers, and consequences in a visual format. Risk Register → [Select Risk] → Bowtie View.

**Scenario Analysis**: Navigate to Risk Register → Scenario Analysis to model 'what if' scenarios — useful for business continuity planning and board stress-testing exercises.

**Board Risk Report Template**: IMS includes a pre-formatted board risk report template (Risk Register → Reports → Board Report) aligned to common corporate governance frameworks. Customise it with your organisation's branding and save it as your standard board pack template.
`,
  },

  {
    id: 'KB-RB-008',
    title: 'IMS Guide for the Auditor (Internal)',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'audit', 'internal-auditor'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Auditor (Internal)

## Your Role in IMS

As an Internal Auditor, IMS supports every phase of the audit lifecycle — from viewing your assigned audit schedule, accessing checklists and reference documents, conducting the audit (online or in offline mode), recording findings, linking them to corrective actions, and generating the final audit report. IMS ensures a consistent, evidence-based audit process that satisfies ISO requirements for documented internal audit programmes.

---

## Your Key Modules

- **Audit Management (port 3042)**: Your primary workspace. View your audit schedule, open audit records, checklists, and findings.
- **Document Control (port 3035)**: Access the procedures and work instructions you are auditing against — always access the current controlled version.
- **Corrective Action (CAPA)**: Findings you raise are linked directly to the CAPA module so corrective actions are tracked to closure.
- **Risk Register (port 3031)**: Cross-reference audit findings against the risk register — some findings will represent unregistered risks.
- **Training Management (port 3032)**: Verify training records during audits covering competence requirements.

---

## Your Typical Week (During an Active Audit)

### Pre-Audit (Week Before)
- Open Audit Management → My Audits → [Your Assigned Audit]
- Review the audit scope, objectives, and criteria
- Download or open the relevant audit checklist (pre-loaded by the audit programme manager)
- Access the Document Control module to read the procedures you will be auditing against — confirm you are reading the current approved version
- Review previous audit findings for the same area to check whether prior corrective actions are closed and effective
- Prepare your opening meeting notes and document requests

### Audit Day — Conducting the Audit
- Navigate to Audit Management → [Your Audit] → Conduct Audit
- Work through the checklist item by item — record observations, evidence references, and notes against each clause
- For each finding, select the finding type: Major Nonconformance, Minor Nonconformance, Observation, or Opportunity for Improvement
- Record objective evidence for each finding — you can attach photos, screenshots, or document references directly in IMS
- Use the offline mode if conducting the audit in an area without reliable Wi-Fi — your entries sync automatically when you reconnect

### Post-Audit — Closing Meeting and Report
- Review all findings recorded during the audit
- Open the closing meeting summary template: Audit Management → [Your Audit] → Closing Meeting Notes
- Generate the draft audit report: Audit Management → [Your Audit] → Generate Report
- Review the draft — add context and commentary to each finding before submitting to the audit programme manager for review
- Link each nonconformance finding to a CAPA record — the system will prompt you to create or link existing CAPAs

### Follow-Up (Subsequent Weeks)
- Monitor corrective action progress for findings you raised via Audit Management → My Findings → [Finding] → Linked CAPA
- When the auditee advises a corrective action is complete, conduct the effectiveness check
- Record your effectiveness check verdict (Effective / Partially Effective / Not Effective) in the CAPA record
- Once all findings are closed effectively, mark the audit as complete

---

## Your Most Important Reports

1. **Audit Report** — Formal report of audit scope, criteria, method, attendance, findings, and conclusions. Generated from IMS in PDF format with your organisation's letterhead.
2. **Finding Summary** — Tabular summary of all findings with type, clause reference, finding description, and corrective action status. Used in the closing meeting and for auditee distribution.
3. **Corrective Action Tracking Report** — Status of all CAPAs linked to your findings. Used for follow-up correspondence with auditees.
4. **Audit Programme Coverage Report** — Generated by the audit programme manager — shows which areas, clauses, and processes have been audited vs planned. You contribute to this through your completed audits.

---

## Quick Tips for Your Role

- **Always access procedures from Document Control** during an audit — never from a printed copy or an emailed PDF, as these may be outdated.
- **Record objective evidence at the time** — do not rely on memory. Attach photos or document references immediately when you observe something during the audit.
- **Distinguish clearly between findings and observations** — a finding requires a corrective action; an observation is a suggestion. Mis-categorisation causes unnecessary CAPA workload.
- **Check previous audit findings** before starting — if a prior finding was supposedly corrected but you are seeing the same issue again, this is a systemic failure requiring a more significant corrective action.
- **Use the offline mode** confidently — it works on mobile and tablet. All checklist responses sync when you reconnect to Wi-Fi.

---

## Getting More From IMS

**ISO Clause-Referenced Checklists**: IMS provides pre-built audit checklists for ISO 9001, ISO 14001, ISO 45001, ISO 27001, ISO 50001, ISO 42001, and ISO 37001. Navigate to Audit Management → Checklists → Template Library. Each question is tagged to the relevant standard clause.

**Evidence Attachment**: During checklist completion, use the camera icon next to any checklist item to photograph physical evidence on-site. The photo is geo-tagged and timestamped and stored directly against the checklist item.

**Finding Pattern Analysis**: After completing several audits, navigate to Audit Management → Analytics → Finding Trends to see which clauses, departments, or processes generate the most findings. Useful input for the next audit programme planning cycle.

**Auditor Competence Records**: Your own auditor training records (lead auditor qualification, technical knowledge of standards) are held in the Training module. These are checked by the audit programme manager to confirm your competence for each assigned audit.
`,
  },

  {
    id: 'KB-RB-009',
    title: 'IMS Guide for the Operations Manager',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'operations', 'operations-manager'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Operations Manager

## Your Role in IMS

As Operations Manager, IMS gives you real-time visibility across production quality, equipment health, inventory levels, permit status, and safety performance. You use it to make daily operational decisions — whether to release a work order, investigate a quality deviation, escalate a maintenance fault, or approve a high-risk permit. IMS replaces multiple standalone spreadsheets and whiteboards with a single integrated operational picture.

---

## Your Key Modules

- **CMMS — Computerised Maintenance Management (port 3017)**: Equipment register, planned and corrective maintenance work orders, breakdown analysis, and OEE (Overall Equipment Effectiveness) tracking.
- **Quality Management (port 3003)**: Production quality KPIs, nonconformance management, inspection records, and process capability data.
- **Inventory Management (port 3005)**: Stock levels, reorder alerts, goods receipt, and consumption tracking.
- **Permit to Work (port 3039)**: Approve and monitor all permits for high-risk work on your site.
- **Incident Management (port 3041)**: Review and respond to operational incidents — equipment failures, quality escapes, environmental releases, safety events.
- **Health & Safety (port 3001)**: Monitor safety KPIs for your operational area.

---

## Your Daily Operations Dashboard

Configure your personal dashboard in IMS to show the operational metrics that matter most to you:

**Production & Quality**
- First-pass yield (today and 7-day trend)
- Open nonconformances (by severity)
- Inspection holds pending disposition

**Maintenance & Equipment**
- Work orders due today and overdue
- Equipment on breakdown (affecting production)
- OEE for critical equipment lines

**Safety & Permits**
- Active permits on site right now
- Open safety observations requiring action
- Incidents in last 7 days

**Inventory**
- Materials below reorder point
- Pending goods receipts

Navigate to Dashboard → Edit Layout → Add Widgets to customise your view.

---

## Your Typical Week

### Daily (Every Morning)
- Review the operations dashboard — identify any red flags before the morning meeting
- Check CMMS for equipment status: any breakdowns overnight, any planned maintenance at risk of delaying production
- Review permit queue: are all active permits for today's planned work correctly issued and approved?
- Check quality holds: any product batches placed on hold that need disposition decision

### Monday — Weekly Planning
- Review the weekly maintenance schedule — confirm technician allocation is adequate for planned PMs
- Review inventory report — any critical materials at risk of stockout this week
- Review the quality weekly summary: yield trends, top nonconformance categories
- Plan the week's high-risk work with the safety officer — confirm PTWs are being prepared in advance

### Wednesday — Mid-Week Review
- Attend mid-week operations review meeting with current CMMS, quality, and safety data from IMS
- Review corrective maintenance backlog — prioritise by equipment criticality rating
- Check training compliance for your operational team — any safety-critical certifications expiring

### Friday — Weekly Close-Out
- Review week's incident reports — are investigations progressing appropriately?
- Generate weekly OEE report and distribute to production team
- Confirm all PTWs raised this week have been properly closed out
- Review any permit non-compliances or safety observations from the week

---

## Your Most Important Reports

1. **OEE Dashboard** — Overall Equipment Effectiveness breakdown (Availability, Performance, Quality) for each production line. Identifies where losses are occurring.
2. **Maintenance Backlog Report** — All outstanding work orders by equipment, priority, and age. Identifies maintenance debt accumulating on critical assets.
3. **Production Quality Weekly** — First-pass yield, nonconformance rate, top defect categories, inspection hold status. Your primary quality control view.
4. **PTW Compliance Report** — Permits issued vs closed on time, any permits closed without proper completion sign-off. Safety compliance metric.
5. **Inventory Level Report** — Current stock vs reorder point vs minimum safety stock. Prevents production stoppages from material shortages.

---

## Quick Tips for Your Role

- **Set equipment criticality ratings** in CMMS — this determines maintenance priority and whether a breakdown auto-escalates to you as Operations Manager.
- **Link CMMS work orders to quality nonconformances** — if a machine fault causes product defects, the link lets you see the full cost of the failure (maintenance + scrap + customer risk).
- **Use the permit dashboard at shift handover** — the PTW summary view shows all active permits, their type, location, and expiry time at a glance.
- **Set inventory minimum stock alerts** for your top 20 highest-consumption materials — a proactive reorder alert is worth far more than a reactive stockout.
- **Review OEE trends weekly** rather than just daily — daily OEE fluctuates; the weekly trend reveals whether improvements are sticking.

---

## Getting More From IMS

**Breakdown Analysis**: CMMS → Analytics → Breakdown Analysis shows you MTBF (mean time between failures) and MTTR (mean time to repair) for each equipment asset. Focus improvement effort on equipment with the worst MTBF-to-MTTR ratio.

**Planned Maintenance Compliance**: CMMS → Reports → PM Compliance shows what percentage of planned maintenance was completed on schedule. Below 85% indicates the maintenance schedule is either under-resourced or over-scheduled.

**Quality-Maintenance Correlation**: Navigate to Quality → Analytics → Defect Source Analysis to see whether defect rates correlate with maintenance events. This cross-module analysis often reveals equipment-driven quality issues that would otherwise be attributed to operator error.

**Shift Handover Notes**: CMMS → Shift Handover allows shift supervisors to log equipment status, outstanding issues, and actions for the incoming shift. This creates a searchable record and reduces verbal handover gaps.
`,
  },

  {
    id: 'KB-RB-010',
    title: 'IMS Guide for the Maintenance Technician',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'maintenance', 'technician', 'cmms'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Maintenance Technician

## Your Role in IMS

As a Maintenance Technician, IMS is your digital job sheet and equipment history system. You use it to see your assigned work orders, record what you did, log parts used, flag equipment faults, complete calibration records, and check that the required permits are in place before you start high-risk work. IMS is designed to work on a mobile device or tablet so you can use it on the workshop floor and out in the field.

---

## Your Key Modules

- **CMMS (port 3017)**: Your primary workspace. All your work orders — planned preventive maintenance (PM) and corrective maintenance (CM) — are here.
- **Permit to Work (port 3039)**: Check permit status before starting any work on the permit-required list. You must never start hot work, confined space entry, work at height, or electrical isolation without a valid active permit.
- **Equipment Calibration**: Calibration records for measurement and test equipment you use or maintain — torque wrenches, pressure gauges, temperature probes.
- **Inventory Management (port 3005)**: Check parts availability and log parts consumed against your work orders.

---

## Your Typical Day

### Start of Shift
- Log in to IMS on your mobile device or the workshop terminal
- Navigate to CMMS → My Work Orders to see today's assigned jobs
- Review each job: equipment name, location, task description, estimated duration, required parts, and safety requirements
- Check the PTW status for any job on the permit-required list — do not start until you can see the permit is 'ACTIVE' in IMS
- Collect required parts from stores — scan or enter the part numbers to create a parts reservation against your work order

### During Work
- When you start a job, tap 'Start Job' on the work order — this records your actual start time
- Use the equipment history tab on the work order to see what maintenance has been done previously on this asset — useful for diagnosing recurring faults
- If you find a fault during a PM that requires additional corrective maintenance, raise a new CM work order directly from within the PM work order using 'Raise Follow-Up Job'
- Log observations and photos directly in the work order notes — photograph any worn components, measurements, or damage before replacing them

### Completing a Job
- Tap 'Complete Job' when the work is finished
- Fill in the completion record: work performed description, parts used (quantities consumed), time taken, and any follow-up actions required
- If the equipment passed a functional test after maintenance, record the test result
- If the job required calibration, complete the calibration record form before closing the work order
- For PM jobs, confirm all checklist items are ticked off before the system will allow completion

### Flagging Faults
- If you discover an equipment fault that is outside your work order scope, navigate to CMMS → Equipment → [Asset] → Raise Fault
- Categorise the fault: Mechanical, Electrical, Instrumentation, Structural, Safety
- Set the priority: Immediate (production-critical breakdown), High, Medium, Low
- Your supervisor and the Operations Manager will be notified automatically for Immediate and High priority faults

---

## Working with Permits to Work

Before starting any permitted work:

1. Navigate to PTW → Active Permits → [Your Work Location]
2. Confirm a permit exists for your task type (Hot Work, Confined Space, Electrical Isolation, Work at Height, etc.)
3. Confirm the permit status is 'ACTIVE' and the expiry time has not passed
4. Confirm your name is listed as an authorised worker on the permit
5. Do not start work if any of these conditions are not met — contact your supervisor

When work is complete:
1. Return to PTW → [Your Permit] → Record Completion
2. Confirm all isolation points have been removed and the area is safe
3. Your supervisor will do the final permit closure in IMS

---

## Equipment Calibration Records

For any measurement equipment requiring calibration:

1. Navigate to CMMS → Calibration → [Equipment ID]
2. Complete the calibration record: as-found reading, calibration standard used, as-left reading, pass/fail verdict
3. If the equipment fails calibration, it is automatically flagged 'OUT OF SERVICE' and a notification sent to your supervisor
4. Attach the calibration certificate if an external calibration service was used

---

## Your Most Important Reports

1. **My Work Order History** — Your completed jobs for the last 30 days. Used for productivity reviews and timesheet verification.
2. **Equipment Fault History** — All faults raised for a specific asset — useful for diagnosing repeat failures before starting a new job.
3. **Calibration Due List** — Measurement equipment you are responsible for that is approaching its calibration due date.

---

## Quick Tips for Your Role

- **Use the mobile app offline mode** — if you are working in an area with poor Wi-Fi (enclosed plant room, basement, remote location), your entries are saved locally and sync when you reconnect.
- **Photograph everything unusual** — photos stored against work orders save significant time when diagnosing repeat failures later.
- **Log actual time accurately** — work order time records feed into the OEE and maintenance cost analysis that your Operations Manager uses for planning.
- **Never skip the PTW check** — the permit status takes 10 seconds to check. It is not a bureaucratic formality; it saves lives.
- **Link parts used to the correct work order** — accurate parts consumption records are the foundation of the spare parts inventory management system.

---

## Getting More From IMS

**Equipment QR Codes**: Your organisation may have printed QR codes on equipment. Scanning a QR code with the IMS mobile app opens that equipment's full history, current work orders, and fault log instantly — no need to search.

**Technical Manuals Access**: CMMS → Equipment → [Asset] → Documents links to the equipment's technical manuals, wiring diagrams, and maintenance procedures stored in Document Control. You can access these from your mobile without printing.

**Training Records**: Navigate to HR → My Training to see your current competency records, training expiry dates, and any new mandatory training assigned to your role. Keep your safety training current — some work orders are locked until the system confirms your training is valid.
`,
  },

  {
    id: 'KB-RB-011',
    title: 'IMS Guide for the Safety Officer',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'safety', 'safety-officer', 'health-safety'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Safety Officer

## Your Role in IMS

As a Safety Officer, IMS is your operational safety management tool. Your day-to-day work involves checking permits, reviewing near-miss reports, verifying safety briefing attendance, monitoring contractor compliance, reviewing JSA approvals, and recording safety inspection findings. IMS gives you the real-time visibility to keep your site safe and the documentation to prove it.

---

## Your Key Modules

- **Health & Safety (port 3001)**: Near-miss reports, safety observations, toolbox talk records, JSA approvals, risk assessments, and legal requirements compliance.
- **Permit to Work (port 3039)**: Permit queue management — review applications, issue permits, monitor active permits, and close out completed work.
- **Incident Management (port 3041)**: Log and initially investigate all incidents, near-misses, and dangerous occurrences reported to you.
- **Training Management (port 3032)**: Verify safety training compliance for workers and contractors — particularly safety inductions and safety-critical task competencies.
- **Contractor Management**: Review contractor safety briefing records and induction completion before contractors begin site work.

---

## Your Daily Routine

### Morning Safety Check (First 30 Minutes)
- Log in to IMS and check the H&S dashboard
- Review the PTW queue: any permits awaiting your approval for today's planned high-risk work
- Check active permits from yesterday that should have been closed — chase completion sign-off
- Review any near-miss or incident reports submitted since your last check
- Check if any safety observations were raised by the night shift or early starters

### Permit Management (Throughout the Day)
- Navigate to PTW → Pending Approval to review permit applications
- For each permit: confirm the JSA is approved and attached, verify the isolation plan, confirm workers are trained and inducted, check the work area is set up correctly
- Issue the permit or return it with required corrections
- Conduct spot checks on active permit work — verify isolation points are in place, workers are following the permit conditions
- Close out completed permits at end of shift after confirming the work area is restored to a safe state

### Safety Inspections
- Navigate to H&S → Inspections → New Inspection to start a scheduled or ad-hoc safety inspection
- Work through the relevant inspection checklist — general site safety, fire safety, chemical storage, working at height, machinery guarding
- Record findings with photos — select the finding category, severity, and assign an action owner
- Findings automatically appear in the CAPA list and notify the responsible person

### Toolbox Talks and Briefings
- Navigate to H&S → Toolbox Talks to access the toolbox talk library
- Select the relevant topic for today's pre-shift briefing
- Record attendance: H&S → Toolbox Talks → [Today's Talk] → Record Attendance — scan employee badges or manually tick names
- Attendance records are stored and available for audits

### Near-Miss and Incident Processing
- For each near-miss or incident reported to you, open Incident Management → Log Incident
- Complete the initial record: what happened, where, when, who was involved, immediate actions taken
- Assign a preliminary severity rating
- Notify the HSE Manager for incidents above Minor severity
- Assign an investigator if the incident requires formal investigation

---

## Contractor Safety Management

Before a contractor starts work on site:

1. Navigate to H&S → Contractors → [Contractor Company]
2. Verify the contractor safety induction is recorded as complete for each individual
3. Check that required certifications are current: CSCS cards, working at height certification, first aid, operator licences
4. Confirm the contractor's site-specific risk assessment and method statement (RAMS) have been reviewed and approved

During contractor work:
- Conduct at least one unannounced spot check per day for contractors doing high-risk work
- Record spot check findings in H&S → Observations → New Observation

---

## Your Most Important Reports

1. **Daily Safety Summary** — Permits issued and closed, near-misses logged, inspections completed, toolbox talks delivered. Your daily record of safety activity.
2. **Near-Miss Trend Report** — Near-misses by category, location, and time. Leading indicator of where accidents are likely to occur.
3. **PTW Compliance Report** — Permits issued on time, closed on time, and any permits that expired or were cancelled. Measures permit system effectiveness.
4. **Training Compliance — Safety Critical** — Workers with expired safety-critical training. You need this list to make real-time decisions about who can operate certain equipment.
5. **Contractor Safety Performance** — Near-misses, inspection findings, and permit non-compliances attributable to contractors. Used for contractor performance reviews.

---

## Quick Tips for Your Role

- **Do your permit checks in the morning before work starts** — a permit application with missing information is much easier to fix at 07:30 than when 5 contractors are standing waiting to start.
- **Use the mobile app for inspections** — walk the site with your phone, photograph findings in real time, and the inspection report is half-written by the time you get back to your desk.
- **Set up saved inspection templates** for different areas of your site (warehouse, workshop, offices, outdoor areas) so you do not need to customise from scratch each time.
- **Link near-misses to risk register entries** — if a near-miss reveals a hazard not in the risk register, raise a risk register entry from the near-miss record.
- **Monitor the toolbox talk calendar** — if the same topic is delivered repeatedly without any impact on the near-miss rate for that hazard, the delivery method or content needs to change.

---

## Getting More From IMS

**JSA Digital Workflow**: Rather than paper JSAs that go missing, use H&S → JSA → New JSA. Workers complete the JSA on a mobile device, it is reviewed and approved digitally, and it is permanently linked to the PTW record.

**Safety Observation Campaigns**: Run focused safety observation campaigns for specific hazard types (e.g., housekeeping, PPE compliance, forklift pedestrian interaction) by creating a campaign in H&S → Observations → Campaigns. Staff can submit observations on their phones, and results are aggregated automatically.

**Incident Notification Cascade**: Configure automatic notifications so that when an incident above a certain severity is logged, it immediately notifies the HSE Manager, Operations Manager, and HR Manager — no manual phone calls needed at 2am.
`,
  },

  {
    id: 'KB-RB-012',
    title: 'IMS Guide for the Environmental Officer',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'environment', 'environmental-officer'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Environmental Officer

## Your Role in IMS

As an Environmental Officer, IMS is your environmental data management and compliance platform. You use it to log environmental monitoring data, maintain the aspects and impacts register, track legal compliance obligations, monitor energy performance, manage waste streams, and generate the environmental performance reports required by your management system and regulators.

---

## Your Key Modules

- **Environmental Management (port 3002)**: Aspects and impacts register, environmental events log, legal compliance calendar, environmental objectives and milestones, CAPA management.
- **Energy Monitoring (port 3021)**: Energy consumption data entry, baseline and target tracking, energy performance indicators (EnPIs), ISO 50001 evidence.
- **Waste Management**: Waste stream records, waste transfer documentation, disposal contractor performance.
- **ESG (port 3016)**: Environmental data feeds into the ESG sustainability report — you contribute data that the ESG Manager uses for corporate reporting.
- **Regulatory Monitor (port 3040)**: Receive alerts for new and amended environmental legislation relevant to your operations.

---

## Your Typical Week

### Monday — Environmental Dashboard Review
- Review the Environmental Management dashboard: open actions, significant aspects count, legal compliance calendar items due this week
- Check for any environmental events (spills, releases, exceedances) logged since last week
- Review energy consumption data for the previous week — any anomalies in consumption vs target
- Check waste transfer documentation completed — any consignments outstanding

### Tuesday / Wednesday — Data Entry and Monitoring
- Enter environmental monitoring data from the previous week: air emissions readings, effluent discharge quality, waste arisings by stream
- Review the significance scoring for the aspects register — recalculate significance where monitoring data indicates a change in probability or magnitude
- Update milestone progress on environmental objectives (e.g., percentage complete on energy reduction initiative)
- Review waste contractor compliance — any non-conformances in waste documentation or disposal records

### Thursday — Legal and Regulatory Compliance
- Review the environmental legal compliance calendar for this month's obligations
- Process any regulatory change alerts from the Regulatory Monitor — assess whether they affect your operations and update the legal register accordingly
- Prepare any regulatory returns due this period (emissions inventories, waste returns, discharge consent reports)
- Coordinate with the HSE Manager on any environmental aspects also controlled under HSE permits and licences

### Friday — Reporting
- Generate the weekly environmental monitoring summary
- Update the environmental KPI tracker (energy intensity, water consumption, waste-to-landfill percentage)
- Review CAPA actions due — update progress on any environmental corrective actions assigned to you
- Prepare data for the monthly environmental performance report (if month-end)

---

## Logging Environmental Monitoring Data

Navigate to Environmental Management → Monitoring → New Reading:

1. Select the monitoring point (air stack, effluent outfall, noise boundary, groundwater borehole, etc.)
2. Enter the reading value and units
3. Select the monitoring method (continuous meter, periodic sample, laboratory analysis)
4. If a laboratory analysis, attach the certificate of analysis
5. Compare against the consent or permit limit — IMS highlights readings approaching or exceeding the limit in amber and red
6. If a limit is exceeded, IMS automatically prompts you to raise an environmental event and notify the HSE Manager

---

## Environmental Aspects and Impacts Register

Navigate to Environmental Management → Aspects:

- Each aspect has a significance score calculated from: Severity × 1.5 + Probability × 1.5 + Duration + Extent + Reversibility + Regulatory Concern + Stakeholder Concern
- Aspects scoring ≥ 15 are classified as Significant
- Significant aspects require environmental controls and objectives
- Review and recalculate significance at least annually, or after any significant operational change

---

## Your Most Important Reports

1. **Environmental Performance Report (Monthly)** — Energy consumption, water consumption, waste arisings by stream, emission totals, significant aspect status. The core management system report for environmental performance.
2. **Legal Compliance Calendar** — All environmental permit conditions, reporting obligations, and monitoring requirements with due dates. Critical for preventing regulatory non-compliance.
3. **Significant Aspects Register** — Current list of significant aspects with their control measures and linked objectives. Required for ISO 14001 audits.
4. **Energy Performance Report** — Actual vs target energy consumption by site/process, EnPI trend, year-on-year comparison. ISO 50001 evidence.
5. **Waste Summary Report** — Waste arisings by stream and disposal route, recycling rate, landfill diversion rate. Feeds ESG reporting.

---

## Quick Tips for Your Role

- **Enter monitoring data promptly** — do not batch enter a month's data at the end of the month. Timely data entry ensures anomalies are caught while causes can still be investigated.
- **Set consent limit alert thresholds** in the monitoring module at 80% of your permit limit — this gives you warning before you breach, allowing corrective action.
- **Link environmental events to aspects** — when an environmental event occurs (spill, exceedance), link it to the relevant aspect so the significance review reflects the actual occurrence.
- **Use the Regulatory Monitor jurisdiction filter** — set it specifically to your country, region, and industry sector to avoid being overwhelmed by irrelevant legislation alerts.
- **Coordinate energy data with Finance** — the Finance module tracks energy costs; your energy consumption data and their cost data together give you the full energy cost picture for carbon costing.

---

## Getting More From IMS

**GHG Emission Calculations**: Environmental Management → Emissions calculates Scope 1, 2, and 3 greenhouse gas emissions using the emission factors library. Enter your activity data (fuel consumption, electricity use, business travel, waste disposal) and IMS calculates tCO2e automatically using the current DEFRA/EPA emission factors.

**ISO 14001 Evidence Pack**: Navigate to Environmental Management → Reports → ISO 14001 Evidence Pack to generate the full evidence pack for certification audits: aspects register, legal register, objectives register, monitoring data summary, CAPA register, and management review inputs.

**Energy Baseline Management**: ISO 50001 requires a documented energy baseline. Navigate to Energy Monitoring → Baseline → Configure to set your reference period and boundary conditions. IMS tracks normalised energy performance against this baseline automatically.

**Environmental Training Assignments**: Work with the Training Coordinator to assign environment-specific training (spill response, waste segregation, environmental awareness) to relevant staff. Training completion feeds into the ISO 14001 competence evidence.
`,
  },

  {
    id: 'KB-RB-013',
    title: 'IMS Guide for the Document Controller',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'document-control', 'document-controller'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Document Controller

## Your Role in IMS

As Document Controller, IMS is your entire operational environment. You manage the creation, review, approval, publication, distribution, and archiving of all controlled documents — procedures, policies, work instructions, forms, specifications, and records. IMS gives you a fully automated document lifecycle workflow so you can focus on document quality and compliance rather than manually chasing reviewers and managing version spreadsheets.

---

## Your Key Modules

- **Document Control (port 3035)**: Your complete workspace. Document register, workflow routing, version management, distribution lists, expiry calendar, and archive management.

All other modules interact with Document Control for their procedures and records — but Document Control is where you live.

---

## Your Typical Day

### Morning — Workflow Queue
- Navigate to Document Control → My Tasks
- Review the approval and review requests in your queue:
  - New documents awaiting routing for first review
  - Revised documents where all reviewer comments are returned and need consolidation
  - Documents where the approval sign-off has been received and you need to publish
  - Expired documents that have been reviewed and are ready for re-issue
- Prioritise: approval requests first (someone is waiting), then new submissions, then expiry processing

### Document Creation Workflow
When a process owner submits a new document for control:

1. **Receive submission**: Document Control → New Document → Import (or the author submits directly from their draft)
2. **Register the document**: Assign document number (auto-generated by IMS), title, document type, owner, department
3. **Set the review workflow**: Select the appropriate review route (technical review, departmental review, HSE review, legal review) based on document type
4. **Route for review**: IMS sends review tasks to each reviewer in sequence (or parallel, depending on the workflow template configured)
5. **Consolidate reviewer comments**: When all reviews are returned, open the document and consolidated comments view. Coordinate with the author on any conflicting comments.
6. **Route for approval**: Send to the designated approver(s) — IMS records electronic signatures with timestamp and IP address
7. **Publish**: On receipt of all required approvals, publish the document. IMS increments the version number, dates the issue, and makes it live in the document register.
8. **Notify distribution list**: Configured recipients are automatically notified. For documents requiring staff acknowledgement (safety procedures, policies), acknowledgement tasks are sent to each person.
9. **Archive superseded version**: The previous version is automatically moved to the archive register with an 'SUPERSEDED' status.

### Expiry Calendar Management
- Navigate to Document Control → Expiry Calendar
- Filter for documents expiring in the next 30, 60, and 90 days
- Contact document owners 60 days before expiry: 'Document X-002 is due for review by [date]. Please confirm whether a revision is required or if it can be re-issued without change.'
- If a document owner does not respond within 14 days, escalate to their line manager
- Documents that reach their expiry date without a review decision are automatically flagged as 'REVIEW OVERDUE' and become visible on the HSE and Quality Managers' dashboards

### Distribution List Management
- Navigate to Document Control → [Document] → Distribution
- Review distribution lists when staff changes occur (new starters, leavers, role changes)
- For externally distributed controlled copies (to suppliers, contractors, regulators), maintain a separate external distribution log

---

## Efficient Bulk Document Operations

For situations where you need to process many documents at once:

**Bulk Review Routing**: Select multiple documents in the register → Actions → Bulk Route for Review → select reviewer(s) and deadline. Useful for annual review cycles.

**Bulk Status Update**: Select multiple documents → Actions → Bulk Update Status. Useful when transitioning documents between departments during restructures.

**Bulk Export**: Select documents → Actions → Export PDF Pack. Generates a single PDF containing all selected documents. Used for external audit evidence packs.

**Document Register Export**: Document Control → Reports → Document Register Export. Downloads a full register as CSV or Excel, showing all documents with current version, status, owner, and expiry date.

---

## Your Most Important Reports

1. **Document Register** — Complete list of all controlled documents with current version, status, owner, and next review date. The foundation of your document control audit evidence.
2. **Expiry Calendar (90-day)** — Documents due for review in the next 90 days. Your planning tool for workload management.
3. **Acknowledgement Compliance Report** — For each document requiring staff acknowledgement, shows who has and has not acknowledged. Required for safety and policy document audits.
4. **Workflow Status Report** — Documents currently in a workflow step — new, under review, awaiting approval, or awaiting publication. Identifies workflow bottlenecks.
5. **Superseded Document Archive** — Audit trail of all previous document versions. Required by ISO standards for demonstrating document history.

---

## Quick Tips for Your Role

- **Use document type templates** for each document category (Procedure, Policy, Work Instruction, Form) — consistent formatting reduces the time spent reformatting submitted drafts.
- **Set review reminder automation** — configure automatic email reminders to document owners at 60 days, 30 days, and 7 days before expiry. This dramatically reduces the number of documents you need to chase manually.
- **Use parallel review routing** where possible — sending reviews to multiple people simultaneously rather than sequentially halves the average review cycle time.
- **Lock document numbers** to document types — e.g., HSE-PRO-YYYY-NNN for H&S procedures, QMS-WI-YYYY-NNN for work instructions. This makes the register searchable and self-organising.
- **Never bypass the workflow for urgent documents** — the temptation to send a document out directly without approval 'because it is urgent' creates audit findings and liability exposure. The urgent approval workflow allows fast-track processing while maintaining the audit trail.

---

## Getting More From IMS

**Electronic Signatures**: IMS supports legally recognised electronic signatures for document approvals. Each approval records the approver's name, email, timestamp, and IP address in the audit trail. Navigate to Document Control → Settings → Signature Policy to configure signature requirements by document type.

**QR Code Controlled Copies**: For documents that need to be printed (work instructions in a clean room, procedures for field use), IMS generates a QR code that links back to the live document. Anyone scanning the QR code can instantly verify whether their printed copy is still the current version.

**Translation Management**: If your organisation operates in multiple languages, Document Control → Translation Management allows you to link translated versions to the master document. When the master is revised, the system flags all translations for update.

**Retention Schedule**: Navigate to Document Control → Retention Schedule to configure how long each document type is retained after expiry or obsolescence. IMS auto-archives documents when their retention period ends. This is your GDPR and records management compliance tool.
`,
  },

  {
    id: 'KB-RB-014',
    title: 'IMS Guide for the Training Coordinator',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'training', 'training-coordinator'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Training Coordinator

## Your Role in IMS

As Training Coordinator, IMS is your complete training management system. You plan and schedule training events, track attendance and completion, manage training materials and assessments, send reminders for overdue or expiring training, and generate the competency reports that management and auditors need. IMS connects training to the HR module (employee records) and the H&S module (safety-critical competence requirements) so compliance is tracked automatically.

---

## Your Key Modules

- **Training Management (port 3032)**: Your primary workspace. Training schedule, course library, employee training records, competency matrix, certificates, and reporting.
- **HR & Employee Management (port 3006)**: Source of employee records — names, roles, departments, and contract start dates. New starters automatically appear in Training for induction assignment.
- **Health & Safety (port 3001)**: Safety-critical training requirements — some work orders and permits in CMMS and PTW are restricted until certain training is marked complete.
- **Document Control (port 3035)**: Training materials — procedures and work instructions used in training programmes are linked from Document Control to ensure trainees always access current versions.

---

## Your Typical Week

### Monday — Training Dashboard Review
- Navigate to Training Management → Dashboard
- Review: upcoming training events this week, training completion rates by department, overdue training count, certificates expiring in the next 30 days
- Check the induction queue: any new starters in HR whose induction training has not yet been scheduled
- Review training requests submitted by employees or managers — approve, schedule, or redirect as appropriate

### Tuesday / Wednesday — Schedule and Delivery Management
- Confirm training room bookings, trainer availability, and materials for events this week
- Send attendance reminders to participants for events in the next 3 days (Training → [Event] → Send Reminder)
- Record attendance for events completed: Training → [Event] → Record Attendance
- Upload completion certificates for externally delivered training (e.g., First Aid, CSCS, Food Hygiene)
- Review assessment results for any online training completed this week — flag failures for re-take scheduling

### Thursday — Compliance Chasing
- Generate the overdue training report: Training → Reports → Overdue Training
- Send individual or bulk reminders to employees with overdue training
- Escalate to line managers for employees more than 30 days overdue on mandatory safety training
- Update training records for any off-system training completed (conferences, external courses) based on evidence submitted by employees

### Friday — Reporting and Planning
- Review next month's training calendar — confirm trainer and venue availability
- Generate the weekly training completion summary for distribution to department managers
- Review the competency matrix for any roles with gaps flagged this week
- Plan the next quarter's training schedule based on workforce training needs analysis

---

## Managing Training Materials and Assessments

Navigate to Training Management → Course Library → [Course] → Materials:

- Upload training materials in PDF, PowerPoint, or video format
- Link to procedures in Document Control rather than uploading duplicate copies — this ensures trainees always see the current approved version
- Configure online assessments: multiple choice, true/false, short answer
- Set pass mark thresholds (typically 80% for safety-critical training)
- Set the number of allowed re-takes before escalation to a manager

---

## Generating the Competency Matrix

Navigate to Training Management → Reports → Competency Matrix:

1. Select the scope: all staff, a specific department, or a specific role
2. Select the training requirements to include: all mandatory, safety-critical only, or a custom selection
3. Generate the matrix — rows are employees, columns are training requirements, cells show: CURRENT (green), EXPIRING SOON (amber), EXPIRED (red), NOT STARTED (grey), NOT REQUIRED (white)
4. Export as PDF or Excel for use in management review, external audits, or HR reporting

---

## Your Most Important Reports

1. **Competency Matrix** — The complete overview of who has what training, current or overdue, across your workforce. The single most important document for compliance audits and management review.
2. **Overdue Training Report** — Employees with training past its due date, by training type and days overdue. Your action list for compliance chasing.
3. **Training Calendar (Next 60 Days)** — Scheduled events, capacity, and confirmed bookings. Planning and resource management tool.
4. **Certificate Expiry Report** — All training certificates expiring in the next 30, 60, and 90 days. Prevents competence lapses for safety-critical roles.
5. **Training Completion Summary (Monthly)** — Training completions by department, compliance rate improvements, and training investment hours. For management review and ESG social metrics.

---

## Quick Tips for Your Role

- **Assign training at onboarding** — configure role-based induction training templates in HR so that when a new starter is added, their mandatory training is automatically assigned in Training Management.
- **Set two-stage expiry reminders** — send a reminder at 60 days and 14 days before expiry. The 60-day reminder gives time to schedule; the 14-day reminder is the final push before the certificate lapses.
- **Bulk assign training** when rolling out new mandatory training across the whole organisation — Training → Course → Bulk Assign → select employee group.
- **Integrate with CMMS and PTW** — work with your System Administrator to configure training prerequisites on work order types and permit categories. This automates competence gatekeeping without manual checking.
- **Archive completed courses** rather than deleting them — even when a training requirement changes, the historical records of who completed the old version remain important for liability and audit purposes.

---

## Getting More From IMS

**e-Learning Integration**: Training Management supports SCORM-compliant e-learning packages. Upload SCORM content under Course Library → New Course → Upload SCORM Package. Completion data is automatically recorded and feeds into the competency matrix.

**Training Needs Analysis (TNA)**: Navigate to Training Management → TNA to run a structured training needs analysis based on current role requirements versus competency records. The output is a prioritised list of training interventions with estimated cost and time.

**External Training Tracking**: For training provided by external organisations (regulatory bodies, professional associations), set up an external training record type with manual certificate upload and expiry date tracking. This gives you one complete view regardless of where training was delivered.

**Training Budget Tracking**: Link training activities to cost codes under Training → Settings → Cost Centres. This allows Finance to see training spend by department and feeds into the ESG social investment metrics.
`,
  },

  {
    id: 'KB-RB-015',
    title: 'IMS Guide for the Procurement Manager',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'procurement', 'supplier', 'procurement-manager'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Procurement Manager

## Your Role in IMS

As Procurement Manager, IMS connects your approved supplier list, supplier performance data, purchase order management, supplier audit programme, and supply chain risk monitoring into one integrated platform. You use it to maintain a controlled supplier base, make evidence-based supplier selection decisions, manage the flow of purchase orders through the Supplier Portal, and identify supply chain risks before they disrupt operations.

---

## Your Key Modules

- **Supplier Management / Supplier Evaluation (port 3033)**: Approved supplier list, supplier qualification records, supplier performance scorecards, and supplier audit history.
- **Supplier Portal (port 3019)**: The external-facing interface where approved suppliers submit documents, update their profiles, and interact with purchase orders.
- **Risk Register (port 3031)**: Supply chain risk entries — concentration risk, single-source risk, geopolitical exposure, financial stability concerns.
- **Audit Management (port 3042)**: Supplier audit schedule and findings — feeds supplier scorecards.
- **Finance (port 3013)**: Purchase orders, payment terms, and invoice matching.
- **Quality Management (port 3003)**: Supplier-caused nonconformances — links supplier performance to quality outcomes.

---

## Your Typical Week

### Monday — Supplier Overview
- Review the Supplier Dashboard: approved supplier count, suppliers with expiring certifications, open purchase orders, outstanding supplier nonconformances
- Check the risk dashboard for supply chain risk alerts: any new geopolitical or financial risk signals affecting key suppliers
- Review supplier portal activity: any new document submissions from suppliers awaiting your review and approval

### Tuesday / Wednesday — Supplier Performance and Qualification
- Review supplier scorecard data updated this week: on-time delivery, defect rate, document submission compliance
- Process any new supplier qualification applications — review submitted documentation, assign a qualification audit if required
- Review and approve or reject supplier certification renewals (ISO certificates, food safety certificates, insurance certificates)
- Review supplier nonconformances linked from the Quality module — issue formal supplier corrective action requests (SCARs) for significant failures

### Thursday — Purchase Orders and Contracts
- Review purchase orders pending approval — approve, query, or return to requester
- Review supplier contracts approaching renewal — prepare renewal recommendations for Finance and senior management
- Coordinate with the Operations Manager on any supply shortages or delivery delays flagged in Inventory
- Review preferred supplier agreements and update volume commitments where actuals diverge from forecast

### Friday — Supply Chain Risk Review
- Review the supply chain risk register: any risks that need re-scoring based on this week's events
- Check single-source supplier risk: any critical materials supplied by only one source that have had a performance dip this week
- Prepare the weekly procurement summary report
- Plan next week's supplier engagement: meetings, audits, performance reviews

---

## Managing the Approved Supplier List

Navigate to Supplier Management → Approved Suppliers:

**Adding a New Supplier**
1. Supplier Management → Add Supplier → Enter company details and contact information
2. Assign supplier category (raw materials, services, equipment, utilities, professional services)
3. Set qualification requirements based on category (e.g., ISO 9001 certificate required for production material suppliers)
4. Send qualification invitation via Supplier Portal — the supplier receives a link to submit their qualification documents
5. Review submissions and approve or reject with notes
6. Set supplier status to 'Approved' and assign risk tier (Tier 1: critical/strategic, Tier 2: important, Tier 3: standard)

**Maintaining the Approved List**
- Review supplier certifications quarterly — IMS alerts you 60 days before a supplier's certification expires
- Conduct annual performance reviews for all Tier 1 and Tier 2 suppliers
- Suspend or remove suppliers who fail to maintain qualification standards

---

## Your Most Important Reports

1. **Approved Supplier Register** — Complete list of approved suppliers with tier, category, certification status, and last performance review date. Required for ISO audits and customer qualification questionnaires.
2. **Supplier Scorecard Summary** — Aggregated performance ratings by supplier: on-time delivery rate, quality acceptance rate, documentation compliance, responsiveness. Used for annual supplier reviews.
3. **Supply Chain Risk Register Extract** — Top 20 supply chain risks with current score, treatment status, and owner. Board and management reporting.
4. **Supplier Certification Expiry Report** — All supplier certificates expiring in the next 90 days. Prevents use of suppliers with lapsed certifications.
5. **SCAR (Supplier Corrective Action Request) Tracker** — Open SCARs by supplier, age, and root cause category. Measures supplier responsiveness to quality concerns.

---

## Quick Tips for Your Role

- **Use the Supplier Portal for all document exchanges** — receiving supplier documents via email creates an uncontrolled, untracked record. The portal creates a timestamped audit trail of every document submission.
- **Set supplier risk tiers carefully** — Tier 1 suppliers get quarterly reviews, Tier 2 get annual reviews, Tier 3 get triennial reviews. A supplier supplying a business-critical component should never be left on Tier 3.
- **Integrate purchase orders with inventory** — when the Inventory module triggers a reorder, it should create a purchase order request in Finance that routes to you for approval rather than bypassing procurement.
- **Review the supply chain risk register after global events** — natural disasters, geopolitical tensions, or industry supply disruptions may require immediate re-scoring of affected supplier risks.
- **Conduct unannounced supplier audits** for your highest-risk suppliers — announced audits show you what the supplier wants you to see; unannounced audits show you reality.

---

## Getting More From IMS

**Supplier Portal Self-Service**: Configure your Supplier Portal so suppliers can self-update their company details, upload certification renewals, view their own performance scores, and submit corrective action responses directly. This reduces the administrative burden on your team significantly.

**Spend Analysis**: Navigate to Finance → Reports → Spend by Supplier to see your total spend by supplier, category, and time period. This is your starting point for strategic sourcing decisions and consolidation opportunities.

**Risk-Adjusted Vendor Selection**: When evaluating competing suppliers for a new contract, use Supplier Management → Vendor Comparison to score candidates against your qualification criteria simultaneously. IMS produces a weighted scorecard for objective selection decisions.

**Supply Chain Mapping**: For critical components, use the supply chain mapping feature to trace multi-tier supply chains — not just your direct suppliers but their key sub-suppliers. This reveals hidden concentration risks that single-tier monitoring misses.
`,
  },

  {
    id: 'KB-RB-016',
    title: 'IMS Guide for the Customer Success Manager',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'customer-success', 'crm', 'customer-portal'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Customer Success Manager

## Your Role in IMS

As a Customer Success Manager (CSM), IMS gives you a 360-degree view of your customer relationships. You use it to monitor customer health scores, respond to support issues logged through the Customer Portal, track NPS survey results, manage customer portal access, log interactions and engagement in the CRM, and stay ahead of at-risk renewals. IMS connects customer activity data with your CRM records so you have context before every customer conversation.

---

## Your Key Modules

- **CRM (port 3014)**: Customer account records, contact management, interaction logging, deal pipeline, and renewal tracking.
- **Customer Portal (port 3018)**: The interface your customers use to submit requests, view documents, track complaints, and communicate with your team. You manage their access and monitor their activity.
- **Complaint Management (port 3036)**: Customer complaints and their resolution status — a critical health signal for at-risk accounts.
- **Marketing (port 3030)**: Customer health scores, NPS results, renewal pipeline, and expansion triggers fed from marketing analysis.

---

## Your Typical Week

### Monday — Customer Health Dashboard
- Navigate to CRM → Customer Health Dashboard
- Review health scores for your accounts: any accounts that have moved from Green to Amber or Amber to Red since last week
- Check the Customer Portal activity log: any customers who have not logged in for more than 30 days (disengagement signal)
- Review open complaints for your accounts: any unresolved complaints older than 10 working days need escalation

### Tuesday / Wednesday — Account Engagement
- Review your interaction log: ensure each of your accounts has had at least one logged touchpoint in the last 14 days
- Schedule and prepare for upcoming customer calls — check the customer's portal activity, complaint history, and NPS score before the call
- Log all customer interactions in CRM → Interactions → Log Interaction (calls, emails, meetings, portal messages)
- Review the expansion opportunity pipeline: any accounts showing expansion signals (new users added, high feature usage, positive NPS) that have not had a growth conversation

### Thursday — Portal and Access Management
- Review Customer Portal → Access Management: any users whose portal access has expired or needs upgrading
- Process new portal access requests from customer contacts
- Review portal support tickets submitted this week: assign to the correct internal team or respond directly if within your scope
- Review document distribution to customers via the portal: any controlled documents due for update that customers rely on

### Friday — Renewal and Risk Management
- Review the renewal pipeline for accounts due for renewal in the next 90 days
- For accounts flagged as renewal risk (Red health score, open complaints, low portal engagement), prepare an intervention plan
- Update CRM opportunity records with this week's renewal status and next action dates
- Generate the weekly customer success summary report for your CSM team lead

---

## Customer Health Score Signals

IMS calculates customer health scores from multiple signals:

**Positive signals (increase score)**
- Regular portal logins and feature usage
- NPS score ≥ 8
- Training completion rate above threshold
- Timely invoice payment
- Reference or case study participation

**Negative signals (decrease score)**
- Portal logins declining week-on-week
- Open unresolved complaints
- Support tickets with long resolution times
- NPS score ≤ 6
- Usage of only 1 of the modules they have licensed
- Renewal conversation declined or delayed

Navigate to Marketing → Health Scores → [Account] to see the full score breakdown and individual signal contributions.

---

## Customer Expansion Play Triggers

IMS identifies expansion opportunities based on customer behaviour patterns:

- **Feature Limit Approaching**: Customer is approaching the limits of their current tier — trigger an upgrade conversation.
- **New Use Case Detected**: Customer activity suggests they are using IMS for a use case that requires an additional module — trigger a module demo conversation.
- **Champion Change**: A key champion has changed jobs or left — trigger a relationship-building conversation with their replacement.
- **High NPS + Low Module Adoption**: Customer is very satisfied with core modules but has not activated secondary modules — trigger an expansion demonstration.

Navigate to Marketing → Expansion → Your Accounts to see expansion signals for each account you manage.

---

## Your Most Important Reports

1. **Customer Health Scorecard** — All your accounts with current health score, trend, last contact date, and key risk signals. Your at-a-glance account management view.
2. **NPS Survey Results** — Net Promoter Scores by account, Promoter/Passive/Detractor breakdown, and verbatim comments. Primary voice-of-customer input.
3. **Complaint Aging Report** — Open complaints by account, age, and severity. Unresolved complaints are the leading indicator of churn.
4. **Portal Engagement Report** — Login frequency, feature usage, and support ticket volume by customer. Disengagement signals appear here first.
5. **Renewal Pipeline Report** — Accounts due for renewal in the next 90 days with health score, last contact, and renewal risk rating.

---

## Quick Tips for Your Role

- **Always check a customer's health score and portal activity before a call** — going into a call without this context means you are missing signals the customer has already sent you.
- **Log every interaction the same day** — delayed logging leads to missing details and an inaccurate interaction history.
- **Address complaints personally for high-value accounts** — do not leave complaint resolution entirely to the support team for your strategic accounts. Your personal involvement signals that the relationship matters.
- **Link complaints to CRM health score** — when a complaint is logged for an account, the health score should automatically reflect this. Confirm the integration is enabled under CRM → Settings → Signal Integration.
- **Use the portal activity dashboard as a leading indicator** — a customer who is logging in frequently is engaged; a customer who has gone quiet is at risk, even if they have not said anything.

---

## Getting More From IMS

**Automated Check-In Reminders**: Configure CRM → Automation → Check-In Reminders to send you a task when an account has had no logged interaction for 14 days. This prevents accounts from going dark without you noticing.

**Customer 360 View**: Navigate to CRM → [Account] → 360 View to see a single page summary of all data for that customer: contact history, portal activity, complaints, NPS scores, invoices, modules licensed, and training completion. Prepare for calls in 2 minutes instead of 20.

**Segment-Based Outreach**: Use CRM → Segments to group customers by health score band, renewal date, industry, or module usage and plan targeted engagement activities for each segment.

**Voice of Customer Reporting**: Navigate to CRM → Reports → Voice of Customer to aggregate NPS comments, complaint themes, and feature request patterns into a thematic summary. Share quarterly with the Product team to influence the roadmap.
`,
  },

  {
    id: 'KB-RB-017',
    title: 'IMS Guide for the Project Manager',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'project-management', 'project-manager'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Project Manager

## Your Role in IMS

As Project Manager, IMS provides an integrated project management environment where project plans, risks, issues, documents, and compliance requirements connect to the wider management system. Unlike standalone project tools, IMS links your project risks to the enterprise risk register, project documents to Document Control, and project-driven corrective actions to the CAPA module — so project delivery is fully integrated with your organisation's management system.

---

## Your Key Modules

- **Project Management (port 3009)**: Project plans, milestones, deliverables, task management, resource allocation, and status reporting.
- **Risk Register (port 3031)**: Project risks entered into IMS can be escalated to the enterprise risk register, and enterprise risks can have project-level treatment actions.
- **Document Control (port 3035)**: Project documents — plans, specifications, design documents, reports — managed under document control for version history and approval workflows.
- **Corrective Action (CAPA)**: Project issues that require formal corrective action (design failures, quality escapes, scope changes driven by defects) are managed through the CAPA workflow.
- **Finance (port 3013)**: Project budget tracking, purchase order management, and cost reporting.

---

## Your Typical Week

### Monday — Project Status Review
- Navigate to Project Management → My Projects
- Review each active project: milestone status (on track / at risk / delayed), open issues, budget vs actual, resource utilisation
- Identify projects with Red or Amber status indicators — plan corrective actions before the weekly project review
- Check risk register for any new project risks added by team members over the weekend

### Tuesday / Wednesday — Active Project Management
- Update project plans with the previous week's actual progress
- Review and action open project issues — assign owners, set target resolution dates
- Review project risk register: any risks that have changed likelihood or impact based on last week's events
- Approve or review project documents submitted to Document Control
- Coordinate resource conflicts between projects with other project managers and the Operations Manager

### Thursday — Stakeholder Reporting
- Generate project status reports for distribution to project sponsors and steering committees (Project Management → Reports → Status Report)
- Prepare for any project steering committee or executive review meetings
- Review budget vs actual for the month — prepare a spend forecast for the remainder of the project
- Coordinate with procurement on any project-related purchase orders or supplier deliveries

### Friday — Planning and Risk Review
- Review next week's critical path activities — confirm all dependencies are resolved
- Update the project risk register with any new risks identified this week
- Review milestone schedule for the next 4 weeks — any milestones at risk should be flagged with mitigation plans
- Update the project RAID log (Risks, Assumptions, Issues, Dependencies)

---

## Project Risk Management in IMS

Project risks are managed at two levels:

**Project-Level Risks** (Project Management → [Project] → Risk Register)
- Risks specific to the project: technical risk, resource risk, scope risk, dependency risk
- Managed by you and the project team
- Reviewed at each project status meeting

**Escalated Enterprise Risks** (Risk Register)
- Project risks that exceed the project risk appetite threshold are escalated to the enterprise risk register
- Navigate to Project Management → [Project] → Risk Register → [Risk] → Escalate to Enterprise Risk Register
- The Risk Manager reviews escalated risks and decides on enterprise-level treatment

---

## Integrating Projects with CAPA

When a project issue requires a formal corrective action:

1. Project Management → [Project] → Issues → [Issue] → Raise CAPA
2. IMS creates a CAPA record linked back to the project issue
3. The CAPA workflow routes for root cause analysis, corrective action planning, and implementation sign-off
4. CAPA closure is tracked both in the CAPA module and reflected in the project issue status

This integration ensures that project quality problems are addressed through the same rigorous process used for operational quality failures — and creates a searchable history of project-driven improvements.

---

## Your Most Important Reports

1. **Project Portfolio Dashboard** — All active projects with RAG status, key milestone dates, budget status, and open risk count. Your executive summary view across all projects.
2. **Project Status Report** — Detailed status for a single project: milestone progress, issues, risks, budget, and next period plan. Distributed to project sponsor and steering committee.
3. **Resource Allocation Report** — Team member allocation across projects. Identifies over-allocation and resource conflicts before they cause delivery problems.
4. **Project Risk Summary** — All project risks with current scores, treatment status, and escalation flags. Used in steering committee reporting.
5. **Budget vs Actual (Project)** — Project spend against approved budget by phase and cost category. Used for project financial control and change control decisions.

---

## Quick Tips for Your Role

- **Use the milestone dependencies feature** — linking milestones in sequence allows IMS to automatically flag downstream milestone risk when an upstream milestone slips.
- **Log issues in real time** — do not wait for the weekly meeting to record an issue. Timely logging means earlier intervention.
- **Link all project documents to Document Control** — project plans, specifications, and reports managed in Document Control rather than a SharePoint folder are version-controlled, searchable, and available in evidence packs.
- **Review the resource utilisation heatmap weekly** — team members at over 100% utilisation will deliver poor-quality work or experience burnout. Surface conflicts early.
- **Use the CAPA link for significant project issues** — not every project issue needs a full CAPA, but issues representing systemic failures or lessons learned for future projects should go through the formal process.

---

## Getting More From IMS

**Gantt View**: Navigate to Project Management → [Project] → Gantt to view the project schedule as an interactive Gantt chart. Drag milestones to update dates; the chart recalculates the critical path automatically.

**Lessons Learned Register**: At project close-out, navigate to Project Management → [Project] → Lessons Learned → Record Lessons. These feed into the organisation's knowledge base and are searchable for future project teams working on similar projects.

**Change Control Workflow**: Project Management → [Project] → Change Requests manages the formal change control process — scope changes, budget changes, and timeline changes. Each change request follows a review and approval workflow with a full audit trail.

**Earned Value Analysis**: For complex projects, navigate to Project Management → [Project] → Earned Value to see schedule performance index (SPI) and cost performance index (CPI) calculated automatically from your milestone progress and budget data.
`,
  },

  {
    id: 'KB-RB-018',
    title: 'IMS Guide for the IT / Infosec Manager',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'infosec', 'it-manager', 'security'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the IT / Infosec Manager

## Your Role in IMS

As IT and InfoSec Manager, IMS provides you with an integrated information security management system aligned to ISO 27001. You use it to maintain the information security risk register, manage the security controls register, track and investigate security incidents, monitor vulnerability management actions, receive threat intelligence feeds, and prepare evidence for certification audits. IMS connects your security posture to the enterprise risk register and audit programme — placing information security in the broader management system context.

---

## Your Key Modules

- **InfoSec (port 3015)**: Information security risk register, controls register, ISMS documentation, and security KPIs. Your primary workspace.
- **Incident Response (port 3036 — shared with Incident Management)**: Security incident log, investigation workflow, and incident response playbooks.
- **Threat Intel**: Threat intelligence feeds, IOC (Indicator of Compromise) management, and emerging threat alerts.
- **Cyber Security**: Vulnerability management, patch tracking, security scanning results, and remediation workflow.
- **Risk Register (port 3031)**: Enterprise risk register — escalated information security risks appear here and are visible to the Risk Manager and board.
- **Audit Management (port 3042)**: Internal ISO 27001 audits — you either manage or participate in these.
- **Document Control (port 3035)**: ISMS documentation — information security policy, acceptable use policy, BCDR plans, procedures.

---

## Your Typical Week

### Monday — Security Dashboard Review
- Navigate to InfoSec → Dashboard
- Review: open security incidents (severity distribution), vulnerability backlog (by CVSS score), threat intelligence alerts from the past week, controls effectiveness status
- Check for any new high-severity vulnerabilities (CVSS ≥ 7.0) published over the weekend for your technology stack
- Review security incident log for any overnight events

### Tuesday / Wednesday — Vulnerability and Controls Management
- Review vulnerability scan results (Cyber Security → Scan Results → Latest)
- Triage new vulnerabilities: assess exploitability in your environment, assign remediation owner and target date
- Review patch compliance: Cyber Security → Patch Tracking → Overdue Patches
- Review information security controls register — any controls flagged as 'Partially Implemented' or 'Not Implemented' that have been in that state for more than 30 days
- Review SIEM alerts or log summary if integrated with IMS

### Thursday — Threat Intelligence and Risk Review
- Review threat intelligence feeds: Threat Intel → Feed → Latest Indicators
- Assess IOCs (indicators of compromise) for relevance to your environment
- Review the information security risk register for any risks requiring re-assessment based on this week's threat landscape
- Update risk treatment progress for high and critical risks
- Review user access review findings from the System Administrator (periodic access recertification)

### Friday — Reporting and Audit Preparation
- Generate the weekly security metrics summary: incidents, vulnerabilities by severity, patch compliance percentage
- Review ISO 27001 audit programme status — any upcoming internal audits requiring your preparation
- Review ISMS documentation for any procedures due for review
- Distribute the weekly security summary to senior management

---

## Security Incident Management

When a security incident is reported or detected:

1. Navigate to Incident Management → Log Incident → Security Incident
2. Categorise: Data Breach, Unauthorised Access, Malware, Phishing, DDoS, Insider Threat, etc.
3. Assign severity: P1 (Critical — active breach or data loss), P2 (High — potential breach), P3 (Medium — policy violation), P4 (Low — observation)
4. Assign an incident responder and open an incident response playbook: Incident Response → Playbooks → [Select relevant playbook]
5. The playbook guides responders through containment, eradication, recovery, and post-incident review steps
6. For P1 and P2 incidents: IMS auto-notifies the CISO, DPO, and CEO
7. For data breaches: IMS triggers the GDPR 72-hour notification workflow — navigate to Incident Response → [Incident] → GDPR Notification Workflow

---

## Your Most Important Reports

1. **Information Security Risk Register** — All IS risks with current and residual scores, control status, and treatment progress. ISO 27001 Annex A evidence.
2. **Vulnerability Management Dashboard** — Open vulnerabilities by CVSS score, age, and remediation status. Shows your attack surface reduction progress.
3. **Patch Compliance Report** — Percentage of systems patched within target SLA (e.g., Critical: 48h, High: 7 days, Medium: 30 days). Key security KPI.
4. **Security Incident Trend Report** — Incidents by type, severity, and time. Shows whether your security controls are reducing incident frequency.
5. **Controls Effectiveness Summary** — ISO 27001 Annex A controls implementation status. Identifies compliance gaps before the certification audit.

---

## Quick Tips for Your Role

- **Map vulnerabilities to your asset register** — a CVSS 9.0 vulnerability on a non-internet-facing development server is very different from the same vulnerability on your public-facing web application. Context matters.
- **Use the playbook automation** — do not rely on human memory during an active incident. The incident response playbook walks responders through the correct steps in the correct order.
- **Review threat intelligence for your sector specifically** — general threat intel is noisy. Filter the Threat Intel feed to your industry sector and technology stack to get actionable signals.
- **Link security risks to the enterprise risk register** — information security is not an IT silo. A data breach has financial, reputational, and regulatory consequences. Ensure the board sees top IS risks.
- **Run tabletop exercises** — use the incident response playbooks as the basis for quarterly tabletop simulations with your team. Record outcomes in Incident Management → Exercises.

---

## Getting More From IMS

**ISO 27001 Evidence Pack**: Navigate to InfoSec → Reports → ISO 27001 Evidence Pack to compile the complete certification evidence set: ISMS scope, risk assessment, Statement of Applicability, controls register, incident log, audit programme, and management review records.

**SCIM Integration for User Provisioning**: Work with the System Administrator to enable SCIM provisioning between your identity provider (Azure AD, Okta) and IMS. User accounts are automatically created, updated, and deprovisioned in IMS when HR changes are made in the identity provider — critical for access control compliance.

**Security Awareness Training Integration**: Link the InfoSec module to Training Management to track security awareness training completion across the organisation. Set up automated phishing simulation campaign results to feed into the competency matrix.

**Data Classification Register**: Navigate to InfoSec → Data Classification to maintain a register of data assets by classification level (Public, Internal, Confidential, Restricted). This feeds into your data protection impact assessments and GDPR compliance documentation.
`,
  },

  {
    id: 'KB-RB-019',
    title: 'IMS Guide for the ESG / Sustainability Manager',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'esg', 'sustainability', 'sustainability-manager'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the ESG / Sustainability Manager

## Your Role in IMS

As ESG / Sustainability Manager, IMS collects and consolidates the environmental, social, and governance data that feeds your annual sustainability report and ongoing ESG disclosures. Instead of running data collection spreadsheets across multiple departments, IMS pulls environmental monitoring data from the Environmental module, safety metrics from H&S, training hours from HR, and governance data from the Audit and Compliance modules — giving you one controlled, auditable data set aligned to GRI, SASB, and TCFD frameworks.

---

## Your Key Modules

- **ESG (port 3016)**: Your primary workspace. ESG data consolidation, target tracking, report generation, and framework alignment (GRI, SASB, TCFD, CDP).
- **Environmental Management (port 3002)**: Source data for environmental metrics: energy consumption, water use, waste arisings, air emissions, significant aspects.
- **Energy Monitoring (port 3021)**: Detailed energy consumption data and carbon calculations for Scope 1 and 2 emissions.
- **Health & Safety (port 3001)**: Social metrics: LTIFR, TRIFR, near-miss rate, occupational illness rate.
- **HR (port 3006)**: Social metrics: headcount, turnover, training hours, diversity statistics, pay gap data.
- **Finance (port 3013)**: Governance and social metrics: tax paid, community investment spend, ESG-linked finance costs.
- **Audit Management (port 3042)**: Governance metrics: internal audit programme completion, findings and closure rates.

---

## Your Typical Month

### Week 1 — Data Collection Review
- Navigate to ESG → Data Collection Dashboard
- Review which modules have submitted their monthly data and which are outstanding
- Chase outstanding data submissions: Environmental Officer for emission and waste data, HR for diversity and training metrics, Finance for community investment spend
- Review automated data pull status — energy data from Energy Monitoring should auto-populate without manual entry

### Week 2 — Data Validation
- Review all submitted data for anomalies (significant month-on-month variance, implausible values, missing data points)
- Query anomalies with data owners — get corrections or explanations documented
- Calculate derived metrics: GHG emission totals (Scope 1, 2, 3), waste diversion rate, LTIFR, training hours per employee
- Update ESG target progress: actual vs target for each ESG KPI

### Week 3 — Narrative and Reporting
- Update the ESG narrative for the month's data: what the numbers mean, what changed, what actions are underway
- Review ESG objectives and milestones — are we on track for year-end targets?
- Prepare the monthly ESG summary for the board ESG committee (ESG → Reports → Board Summary)
- Coordinate with Communications on any public-facing ESG updates (website, investor reporting)

### Week 4 — Annual Report Preparation (ongoing)
- Review the annual report data completeness checker (ESG → Annual Report → Completeness)
- Identify any data gaps that need to be filled before year-end
- Review GRI / SASB index alignment — confirm all required disclosures have data and narrative
- Coordinate with external ESG assurance provider on their data requirements and timing

---

## GHG Emission Calculations in IMS

Navigate to ESG → Emissions → Current Year:

**Scope 1 (Direct emissions)**
- Fuel combustion data from Environmental module (natural gas, diesel, LPG)
- Refrigerant leakage from Environmental monitoring
- Calculated using current DEFRA/EPA emission factors from the emission factors library

**Scope 2 (Indirect — electricity)**
- Electricity consumption from Energy Monitoring module
- Location-based method: grid emission factor for your country/region
- Market-based method: supplier-specific emission factor if you have renewable energy contracts

**Scope 3 (Value chain)**
- Business travel from HR expense data
- Waste disposal from Environmental waste records
- Employee commuting estimates from HR headcount and commute survey data
- Upstream supply chain: estimated from spend-based or activity-based data

All calculations are transparent — click any tCO2e figure to see the underlying activity data and emission factor used.

---

## Framework Alignment

Navigate to ESG → Framework Alignment to see your disclosure coverage:

| Disclosure Standard | Coverage Status |
|--------------------|--------------------|
| GRI Standards | Indicator-by-indicator completion status |
| SASB (sector-specific) | Material topic coverage |
| TCFD | Climate risk disclosure completeness |
| CDP | Climate and water questionnaire section mapping |
| UN SDGs | Relevant SDG alignment |

The framework alignment view shows you which disclosures you currently have data for, which are partially covered, and which have no data. This drives your annual reporting gap analysis.

---

## Your Most Important Reports

1. **ESG Performance Summary (Monthly)** — All ESG KPIs against targets: emissions, energy, water, waste, safety rates, training hours, diversity metrics, governance indicators.
2. **GHG Emissions Report** — Scope 1, 2, and 3 breakdown with activity data, emission factors, and calculation methodology. Required for CDP, investor questionnaires, and annual sustainability report.
3. **ESG Target Progress Report** — All ESG objectives and targets with current performance, progress percentage, and year-end forecast. Board reporting tool.
4. **Framework Coverage Report** — GRI / SASB / TCFD disclosure index showing data availability for each required indicator.
5. **ESG Data Audit Trail** — Record of all data submissions, revisions, approvals, and validation notes. Required for third-party assurance.

---

## Quick Tips for Your Role

- **Automate data collection wherever possible** — the more data that flows automatically from operational modules (Energy Monitoring, Environmental Management, HR), the less time you spend on data chasing and the more you spend on analysis and action.
- **Document your methodology** — for each metric, document the data source, calculation method, and assumptions in ESG → Methodology Notes. This is essential for third-party assurance and for maintaining consistency year-on-year.
- **Review intensity metrics** alongside absolute figures — absolute emissions may increase as your business grows. Emissions intensity (per unit of revenue, per employee, per tonne produced) shows whether your sustainability performance is genuinely improving.
- **Engage data owners early in the year** — agree data definitions, collection responsibilities, and submission deadlines at the start of the reporting cycle, not at year-end.
- **Use the TCFD scenario analysis** in ESG → Climate Risk → Scenario Analysis to document your organisation's physical and transition climate risk assessment.

---

## Getting More From IMS

**External Assurance Support**: Navigate to ESG → Assurance Support to generate a structured data pack for your external assurance provider — including source data, calculations, methodology notes, and prior year comparatives.

**Peer Benchmarking**: ESG → Benchmarking shows your ESG performance against industry sector averages from published benchmarking sources. Identify where you lead and where you lag.

**Science-Based Targets Alignment**: If your organisation has committed to SBTs (Science-Based Targets), ESG → SBT Tracker monitors your progress against your validated near-term and long-term emission reduction pathways.

**Board ESG Dashboard**: Configure a board-level ESG dashboard in ESG → Board Dashboard: select 8-10 top-line KPIs for carbon, safety, people, and governance, and schedule automated monthly delivery to board members as a one-page PDF.
`,
  },

  {
    id: 'KB-RB-020',
    title: 'IMS Guide for the Food Safety Manager',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'food-safety', 'food-safety-manager', 'haccp'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Food Safety Manager

## Your Role in IMS

As Food Safety Manager, IMS is your HACCP management system and food safety compliance platform. You use it to manage your HACCP plan, record and review CCP (Critical Control Point) monitoring data, manage supplier allergen declarations, track food safety incidents, maintain pest control records, and prepare evidence for BRC Global Standard, FSSC 22000, or SQF certification audits. IMS integrates food safety with the broader quality and supplier management systems so that food safety is embedded in every operational process.

---

## Your Key Modules

- **Food Safety (port 3020)**: HACCP plan management, CCP monitoring records, prerequisite programme (PRP) compliance, food safety objectives, and legal compliance.
- **Supplier Management (port 3033)**: Supplier qualification, allergen declarations, raw material specifications, and supplier audit results.
- **Audit Management (port 3042)**: Internal food safety audits, BRC/FSSC audit preparation, audit findings, and corrective action tracking.
- **Training Management (port 3032)**: Food hygiene training, allergen awareness training, and HACCP training records.
- **Incident Management (port 3041)**: Food safety incidents — product recalls, contamination events, customer complaints about food safety.
- **Complaint Management (port 3036)**: Customer complaints with food safety implications — foreign body complaints, allergen reactions, foodborne illness reports.

---

## Your Typical Week

### Monday — Food Safety Dashboard
- Navigate to Food Safety → Dashboard
- Review: CCP monitoring compliance rate (target: 100%), open food safety corrective actions, PRPs with outstanding review items, supplier complaints this week
- Check the allergen declaration register — any supplier submissions outstanding or expiring
- Review food safety incidents logged since Friday

### Tuesday / Wednesday — HACCP and CCP Management
- Review CCP monitoring records entered since last review — look for any values approaching or exceeding critical limits
- For any CCP deviations recorded: navigate to Food Safety → CCP Deviations → [Deviation] to review the corrective action taken and product disposition decision
- Review the HACCP plan for any process changes that may affect hazard analysis: new raw material sources, process modifications, new products
- Update the hazard analysis register where process or ingredient changes have been approved

### Thursday — Supplier and Allergen Management
- Navigate to Supplier Management → Allergen Declarations
- Review any allergen declaration updates submitted by suppliers — any 'May Contain' statements added or removed require HACCP re-assessment
- Check raw material specifications for accuracy — any new supplier information that has not been captured in the specification register
- Review supplier audit schedule: any food safety supplier audits due in the next 60 days

### Friday — Audit Preparation and Reporting
- Review open audit findings from the most recent internal food safety audit
- Chase corrective action owners for overdue actions
- Generate the weekly food safety KPI summary
- Review training compliance for food handlers: food hygiene certificates, allergen awareness, HACCP awareness — any expiring in the next 30 days

---

## Managing the HACCP Plan in IMS

Navigate to Food Safety → HACCP Plan:

**Step 1: Hazard Analysis**
- Navigate to HACCP → Hazard Analysis
- For each process step, record: biological hazards, chemical hazards, physical hazards, and allergen hazards
- Assess significance: likelihood × severity for each hazard
- Document control measures for each significant hazard

**Step 2: CCP Determination**
- Apply the CCP decision tree for each significant hazard
- Designate steps as CCP or PRP (Prerequisite Programme)
- Each CCP requires: critical limit, monitoring procedure, frequency, responsibility, corrective action, verification activity

**Step 3: CCP Monitoring Records**
- Food Safety → CCP Monitoring → [CCP Name] → Record Reading
- Enter the measured value, time, and operator name
- IMS compares against the critical limit and flags deviations automatically
- A deviation triggers the corrective action workflow: immediate product hold, root cause investigation, product disposition decision, corrective action

**Verification and Validation**
- Food Safety → HACCP → Verification Plan: schedule verification activities (challenge testing, end-product testing, process validation)
- Record verification results and link to the relevant CCP
- Annual HACCP plan revalidation is tracked with a scheduled review reminder

---

## BRC / FSSC 22000 Audit Preparation

Navigate to Food Safety → Evidence Pack → Select Standard:

For BRC Global Standard v9:
- Section 2: Food Safety Plan (HACCP plan, hazard analysis, CCP records)
- Section 3: Food Safety & Quality Management System (documented procedures, review records)
- Section 4: Site Standards (infrastructure, equipment maintenance linked to CMMS)
- Section 5: Product Control (specifications, allergen management, product testing)
- Section 6: Process Control (CCP monitoring records, process parameters)
- Section 7: Personnel (training records, hygiene practices, medical screening)
- Section 8: High-Risk / High-Care Areas (segregation evidence, environmental monitoring)

IMS compiles available evidence for each section and shows a completeness indicator. Address any red sections before the audit date.

---

## Your Most Important Reports

1. **CCP Monitoring Compliance Report** — Monitoring records completed vs required for each CCP, by day, week, and period. 100% completion is the non-negotiable target.
2. **CCP Deviation Log** — All CCP deviations with product affected, corrective action taken, disposition decision, and root cause. Critical for audit evidence.
3. **Allergen Declaration Register** — All allergen declarations by raw material and supplier, with last review date and expiry. Foundational allergen management evidence.
4. **Food Safety Incident Summary** — Incidents by type (contamination, foreign body, allergen, microbiological) and outcome. Required for BRC/FSSC management review.
5. **Training Compliance — Food Handlers** — Food hygiene, allergen awareness, and HACCP training status per employee. Required for every food safety certification audit.

---

## Quick Tips for Your Role

- **Never accept a verbal allergen declaration from a supplier** — require a signed written declaration and file it in the IMS supplier record. Verbal assurances cannot be audited.
- **Review the HACCP plan every time a raw material source changes** — a new supplier for the same ingredient may have different allergen profiles or production practices that change your hazard analysis.
- **Set the CCP monitoring alert threshold at 90% of the critical limit** — you want to know that a CCP is trending towards its limit before it breaches, not after.
- **Link pest control records to the HACCP plan** — pest activity is a biological hazard. Any pest sightings near food handling areas should trigger a HACCP review comment.
- **Use the pre-built BRC/FSSC audit checklist** in Audit Management for your annual internal audit — it is structured to the exact standard clause sequence that the certification body uses.

---

## Getting More From IMS

**Environmental Monitoring Programme**: For high-risk food production environments, Food Safety → Environmental Monitoring manages your swab programme, microbiological testing schedule, and trend analysis. Positive results trigger automatic corrective action workflows.

**Product Recall Simulation**: Conduct a traceability exercise by navigating to Food Safety → Traceability → Recall Simulation. Enter a raw material lot number and IMS traces forward to all finished product batches that used that material. This is a required annual activity for most food safety standards.

**Shelf Life Validation**: Food Safety → Shelf Life Management tracks shelf life validation studies, challenge test results, and expiry dates by product. Links to the quality specification register for label accuracy confirmation.
`,
  },

  {
    id: 'KB-RB-021',
    title: 'IMS Guide for the Sales Executive',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'sales', 'crm', 'sales-executive'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Sales Executive

## Your Role in IMS

As a Sales Executive, IMS CRM is your deal management and customer intelligence platform. You use it to manage your prospect and customer accounts, log every interaction, track your pipeline and forecast, access marketing-qualified leads, check customer portal activity before calls, and generate account health reports that help you have more effective customer conversations. IMS gives you the organised, complete account view you need to close deals and retain customers.

---

## Your Key Modules

- **CRM (port 3014)**: Your primary workspace. Account and contact management, deal pipeline, interaction logging, and account health scoring.
- **Marketing (port 3030)**: Marketing-qualified leads (MQLs) passed to you from marketing campaigns, and customer health intelligence.
- **Customer Portal (port 3018)**: View your customers' portal activity — what they are looking at, what they are asking about — before calls and meetings.

---

## Your Typical Week

### Monday — Pipeline Review
- Navigate to CRM → My Pipeline
- Review all active deals: stage, value, close date, probability, and last contact date
- Identify deals that have had no activity in more than 7 days — plan outreach for this week
- Check the MQL queue: any new marketing-qualified leads assigned to you that need follow-up
- Review your weekly target vs forecast: where are the gaps?

### Tuesday / Wednesday — Active Selling
- Work your pipeline: customer calls, demos, proposals, and follow-ups
- Log every interaction the same day: CRM → Interactions → Log Interaction
  - Interaction type: call, email, meeting, demo, site visit
  - Summary: what was discussed, key points raised, next steps agreed
  - Next action: scheduled in CRM with a due date
- After demos, log the outcome and update the deal stage
- Send proposals — attach the proposal document to the deal record in CRM for a complete audit trail

### Thursday — Account Intelligence Preparation
- Review your customer portal activity for accounts you are calling this week: CRM → [Account] → Portal Activity
- This shows you which documents the customer has been reading, which features they are using most, and whether they have raised any support tickets recently
- Review account health scores for your existing customer base: CRM → Account Health
- Prepare your call plans using this intelligence

### Friday — Pipeline Hygiene and Reporting
- Update all deal probabilities and expected close dates to reflect current situation
- Remove stale deals that are no longer progressing — mark as 'Lost' with a lost reason
- Review your week's new business progress against target
- Submit your weekly forecast update to your sales manager via CRM → Forecast → Submit

---

## Logging Interactions Effectively

High-quality CRM data makes every customer conversation better. Each interaction log should include:

- **Date and type**: When it happened and how (call, email, meeting)
- **Attendees**: All contacts present (not just the primary contact)
- **Summary**: What was discussed — 2-3 sentences is enough
- **Key concerns raised**: Any objections, concerns, or questions the prospect or customer raised
- **Next steps**: Specific, dated actions for both you and the customer
- **Deal stage update**: Has the deal progressed, stayed the same, or regressed?

Interactions that are logged properly mean your manager can help you effectively, and when a deal transfers to a colleague, no context is lost.

---

## Working with Marketing-Qualified Leads

Navigate to CRM → Leads → MQL Queue:

Marketing passes you leads that have:
- Engaged with marketing content (downloaded a guide, attended a webinar, requested a demo)
- Met your target company profile (industry, company size, location)
- Been scored above the MQL threshold by the Marketing team

Your job with each MQL:
1. Research the company using CRM → [Lead] → Research view (company profile, news, known contacts)
2. Check if the company already exists as a prospect or customer in CRM — do not create duplicates
3. Make first contact within 48 hours of MQL assignment — this is your SLA
4. Log the outreach attempt even if there is no response — this keeps the MQL workflow moving
5. Qualify or disqualify the lead — update the lead status with your qualification decision

---

## Your Most Important Reports

1. **My Pipeline Report** — All active deals by stage, value, and close date. Your primary self-management tool.
2. **Weekly Forecast** — Committed, upside, and total pipeline value for the current and next quarter. Used by your sales manager for company revenue forecasting.
3. **Activity Report** — Interactions logged per week by type (calls, emails, meetings). Shows your activity level against target.
4. **Account Health Report** — Customer health scores for your existing accounts. At-risk accounts need pre-emptive engagement before they churn.
5. **Lead Response Time Report** — Time from MQL assignment to first contact attempt. Key metric for lead conversion rate.

---

## Quick Tips for Your Role

- **Check portal activity before every customer call** — a customer who has been looking at a new module's documentation in the portal is telling you something. Use it as a conversation opener.
- **Log next actions with due dates** — CRM → My Tasks shows all overdue and upcoming actions across all your accounts. It is your daily to-do list.
- **Use the account timeline view** — CRM → [Account] → Timeline shows every interaction, deal, complaint, and portal event in chronological order. Before a big meeting, review the last 6 months in 2 minutes.
- **Never leave a deal at the same stage for more than 14 days** — if a deal has not moved, it either needs action or needs to be re-qualified.
- **Link proposals to deal records** — attaching your proposal document to the deal record means anyone on your team can see exactly what was offered and at what price.

---

## Getting More From IMS

**Email Integration**: If your CRM is configured with email integration, sent and received emails are automatically logged against the contact record. Ask your System Administrator about the email sync configuration.

**Mobile CRM**: The IMS mobile app includes full CRM functionality — log calls immediately after hanging up, before you forget the details. Available for iOS and Android.

**Deal Scoring**: CRM → Deal Scoring uses engagement signals (email opens, portal views, meeting attendance) to score each deal's momentum. Deals with declining scores need intervention before they go cold.

**Competitive Intelligence**: Navigate to CRM → [Deal] → Competitive Analysis to log which competitors are involved in each deal, their pricing position, and your differentiation strategy. This data feeds into marketing's competitive intelligence reporting.
`,
  },

  {
    id: 'KB-RB-022',
    title: 'IMS Guide for the Marketing Manager',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'marketing', 'marketing-manager'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Marketing Manager

## Your Role in IMS

As Marketing Manager, IMS provides you with an integrated view of campaign performance, lead pipeline, customer health scores, and partner co-marketing activities. Unlike general marketing platforms, IMS connects your marketing data to the CRM and customer success signals from across the business — so your marketing decisions are grounded in customer health data, not just top-of-funnel metrics.

---

## Your Key Modules

- **Marketing (port 3030)**: Your primary workspace. Lead pipeline management, campaign ROI analysis, health score monitoring, renewal intelligence, win-back campaigns, partner MDF tracking, and LinkedIn engagement.
- **CRM (port 3014)**: Customer and prospect records that your campaigns feed into.
- **Partner Portal (port 3026)**: Partner co-marketing activities, MDF (Market Development Fund) utilisation, and partner-generated leads.

---

## Your Typical Week

### Monday — Marketing Dashboard Review
- Navigate to Marketing → Dashboard
- Review: MQL volume and quality score (week vs week), campaign ROI by channel, lead pipeline by source, customer health score trends (Amber and Red movements)
- Check win-back campaign pipeline: any churned accounts re-engaging this week
- Review partner MDF utilisation: any partners underspending their MDF allocation who need activation

### Tuesday / Wednesday — Campaign and Lead Management
- Review campaign performance: Marketing → ROI → By Campaign
  - Clicks, MQLs generated, MQL-to-SQL conversion rate, opportunity value attributed
  - Identify underperforming campaigns for pause or redesign
- Review the lead pipeline: Marketing → Leads → Pipeline View
  - Leads by source, stage, and age
  - Chase aged leads (> 14 days without sales contact) with sales team
- Review new LinkedIn engagement data: Marketing → LinkedIn Tracker → This Week
- Prepare content calendar updates based on performance data

### Thursday — Customer Health and Expansion
- Navigate to Marketing → Health Scores
- Review accounts that have moved into the Amber or Red health band this week — coordinate with CSM team on intervention
- Review expansion signals: Marketing → Expansion → Triggered This Week
  - Accounts approaching feature limits, accounts showing new use case signals, champion changes
  - Create expansion plays in CRM for accounts flagged by expansion triggers
- Review renewal risk dashboard: Marketing → Renewals → At Risk
  - Create or review save plays for accounts with < 60 days to renewal and Red or Amber health

### Friday — Partner and Reporting
- Navigate to Partner Portal → MDF → Utilisation Report
- Review partner MDF spend by partner and campaign type — identify underutilisation patterns
- Review partner-generated lead quality: Partner Portal → Leads → Quality Score
- Prepare the weekly marketing summary for the leadership team
- Plan next week's campaign schedule and content

---

## Campaign ROI Analysis

Navigate to Marketing → ROI → Campaign Detail:

For each campaign, IMS tracks:
- **Investment**: Campaign cost (agency fees, media spend, event costs, content production)
- **Leads generated**: Total leads and MQLs attributed to the campaign
- **Pipeline influenced**: Opportunity value in the CRM pipeline influenced by campaign touches
- **Closed revenue**: Closed-won deals where the campaign was a contributing touch
- **ROI calculation**: (Revenue attributed − Campaign cost) / Campaign cost × 100

Benchmark: Target ROI > 300% for demand generation campaigns. Content and brand campaigns use different attribution models.

---

## Win-Back Campaign Analysis

Navigate to Marketing → Win-Back:

Win-back campaigns target churned accounts with reactivation messaging. IMS shows:
- Churned accounts by time since churn, churn reason, and account value
- Win-back campaign touchpoints and response rates
- Reactivated accounts — track from initial response through to contract signed

Filter win-back targets by: churn reason (competitor, budget, product gaps — now resolved), time since churn (6-18 months is the optimal window), and original contract value.

---

## Your Most Important Reports

1. **Campaign ROI Report** — Revenue and pipeline attributed to each campaign against cost. The primary marketing accountability metric.
2. **Lead Pipeline by Source** — MQL volume and quality by channel (organic search, paid, events, referrals, partner). Informs channel investment decisions.
3. **Customer Health Score Trends** — Movement in health scores across the customer base, week on week. Identifies macro engagement trends and segments.
4. **Partner MDF Utilisation Report** — MDF budget allocated vs spent by partner, campaign type, and resulting lead quality. Used in quarterly partner business reviews.
5. **Win-Back Pipeline** — Churned account re-engagement status, campaign touchpoints, and reactivation rate. Measures revenue recovery programme effectiveness.

---

## Quick Tips for Your Role

- **Use customer health scores to personalise campaigns** — a nurture email to a Green health score customer looks very different from a save play email to a Red health score customer. Segment accordingly.
- **Coordinate expansion triggers with the CSM team** — when IMS identifies an expansion trigger, the CSM needs to know before they get a marketing email. Uncoordinated outreach creates confusion and erodes trust.
- **Track MDF-funded partner activities rigorously** — partner MDF is contingent on results. Require partners to log campaign activities and results in the Partner Portal as a condition of MDF release.
- **Use the LinkedIn Tracker to identify prospect intent** — companies whose employees are engaging with your content are more likely to be actively evaluating. Pass these signals to sales as warm conversation starters.
- **Review the prospect research tool weekly** — Marketing → Prospect Research shows companies in your ICP (Ideal Customer Profile) that have shown intent signals across the web. Prioritise these for outbound campaigns.

---

## Getting More From IMS

**A/B Testing Integration**: Marketing → Campaigns → AB Test allows you to run content and subject line A/B tests and track winner performance before scaling the winning variant.

**Attribution Modelling**: Navigate to Marketing → Attribution → Model Settings to choose between first-touch, last-touch, linear, and time-decay attribution models. Run the same pipeline under different models to understand which channels are truly driving revenue.

**Customer Advocacy Programme**: Marketing → Advocacy tracks customers who have agreed to participate in case studies, reference calls, or testimonials. Feed advocate details to Sales for reference call requests.

**Growth Digest**: Marketing → Digest generates an automated weekly growth intelligence digest for the senior team — combining lead pipeline, customer health summary, competitor activity (from CRM competitive intelligence), and expansion pipeline into a single PDF.
`,
  },

  {
    id: 'KB-RB-023',
    title: 'IMS Guide for the Field Service Engineer',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'field-service', 'field-engineer'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Field Service Engineer

## Your Role in IMS

As a Field Service Engineer, IMS is your job management, equipment history, and customer communication system — all accessible from your mobile device. You use it to check your assigned jobs and customer site details before travel, access equipment service history and technical documentation on-site, record job completion and parts used, capture customer digital sign-off, and log safety observations. IMS's offline mode means you can work effectively in basements, rural sites, or areas with no mobile signal.

---

## Your Key Modules

- **Field Service (port 3023)**: Your primary workspace. Assigned jobs, job details, customer site information, travel routing, and job completion forms.
- **CMMS (port 3017)**: Equipment service history — previous maintenance records, fault history, calibration records, and technical specifications for the equipment you are servicing.
- **Customer Portal (port 3018)**: Customer communication — customers can see the status of their service request, and you can send updates directly through the portal.
- **Health & Safety (port 3001)**: Safety observations you raise on customer sites feed back to the H&S team.
- **Inventory (port 3005)**: Parts availability — check whether the parts you need are in your van stock or need to be ordered.

---

## Your Typical Day

### Before Leaving the Office or Home
- Navigate to Field Service → My Jobs → Today
- Review each job for the day:
  - Customer name and site address (tap for navigation)
  - Job type: installation, planned maintenance, reactive call-out, warranty repair
  - Equipment model and serial number
  - Special access requirements (customer safety induction required, PPE requirements, escort needed)
  - Parts needed — check van stock against required parts list
- For any job requiring specialist parts not in your van stock: flag in Field Service → [Job] → Parts Request and your depot coordinator will arrange delivery or depot collection
- Download offline data for today's jobs (Field Service → Download Offline Pack → Today's Jobs) — this caches all job details, equipment history, and technical documents for offline use

### On-Site — Starting the Job
- Navigate to Field Service → [Job] → Check In: records your arrival time and location (GPS)
- Review the equipment history: Field Service → [Job] → Equipment → Service History
  - What was done on the last visit, what parts were replaced, any known recurring issues
- Access technical documentation: Field Service → [Job] → Equipment → Documents
  - Service manuals, wiring diagrams, installation guides — all stored in Document Control and accessible offline
- If the site requires a safety induction, record completion in Field Service → [Job] → Safety Induction Completed

### During the Job
- Work through the job checklist provided in the job record — tick items as you complete them
- Record all observations, measurements, and test results in the job notes
- Photograph anything relevant: pre-service equipment state, replaced components, damage found, completed installation
- If you discover additional work required beyond the original job scope, create a follow-up job request: Field Service → [Job] → Raise Additional Work Request — this goes to your scheduling team for customer approval before proceeding

### Completing the Job
- Navigate to Field Service → [Job] → Complete Job
- Fill in the completion form:
  - Work performed: describe what was done
  - Parts used: enter part numbers and quantities
  - Test results: record any functional test results
  - Outcome: Completed, Partial (further visit required), Escalated (requires specialist)
- If the customer is present, collect digital sign-off: Field Service → [Job] → Customer Sign-Off → present screen to customer for signature
- The signed job record is immediately available in the Customer Portal for the customer's records

### Safety Observations on Customer Sites
- If you observe a safety issue at a customer site: Field Service → Safety Observation → Report
- Select whether it relates to your work environment or the customer's premises
- Safety observations on customer sites are shared with your H&S team and, with your organisation's consent, can be shared with the customer's safety team via the portal

---

## Offline Mode Tips

IMS offline mode is designed for field use in areas with no connectivity:

**What works offline**
- Viewing job details, equipment history, and technical documents (pre-downloaded)
- Completing job checklists and forms
- Logging parts used
- Taking and attaching photos
- Writing notes and observations
- Recording job start and completion times

**What syncs when you reconnect**
- All completed forms, photos, and records sync automatically when your device detects any internet connection
- Customer sign-off is transmitted and appears in the Customer Portal within seconds of sync
- Parts consumption records update the inventory system

**Best practice**
- Download tomorrow's offline pack at the end of each day while you are on Wi-Fi — do not rely on mobile data to do it on the road
- If a sync fails, navigate to Field Service → Offline → Sync Status to see pending records and manually trigger a sync when connectivity is restored

---

## Your Most Important Reports

1. **My Job History** — All completed jobs in the last 30 days. Used for timesheet verification and productivity reviews.
2. **Parts Consumption by Job** — Parts used across your jobs. Used by the inventory team for van stock replenishment.
3. **Customer Sign-Off Record** — Digital sign-offs collected for all completed jobs. Customer-accessible proof of service delivery.
4. **Follow-Up Work Requests Raised** — Jobs where additional work was identified. Used by your scheduling team for follow-on job planning.

---

## Quick Tips for Your Role

- **Always download the offline pack before travel** — do not assume you will have signal on-site. Download while on Wi-Fi (home or office) and you will always have what you need.
- **Photograph the equipment before you start work** — this protects you if there is a dispute about pre-existing damage.
- **Check parts availability before travelling** — a 2-hour drive to a site with a part missing is an avoidable cost. Check Field Service → [Job] → Parts Check before departure.
- **Collect customer sign-off while still on-site** — once you have left, getting a digital sign-off is difficult. Make it the last step before you pack up.
- **Log additional work requests rather than doing unscoped work** — doing additional work without approval creates billing disputes and liability exposure. Always get it scoped and approved first.

---

## Getting More From IMS

**Route Optimisation**: Field Service → My Jobs → Route View shows all today's jobs on a map with optimised routing. Reduces travel time and fuel costs.

**Equipment QR Codes**: Customer sites with IMS-managed equipment may have QR codes on assets. Scanning the QR opens that equipment's complete service history instantly — no need to enter the serial number manually.

**Customer Communication from the Field**: Field Service → [Job] → Send Customer Update allows you to send the customer a status message directly from the portal ('Engineer on the way', 'Work complete — report attached') without going through your office.

**Parts Reorder from the Field**: If you use the last of a critical part from your van stock, raise a reorder request directly from Field Service → Parts → Reorder. The request goes to your depot immediately rather than waiting until you return.
`,
  },

  {
    id: 'KB-RB-024',
    title: 'IMS Guide for the Executive / C-Suite',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'executive', 'c-suite', 'board'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the Executive / C-Suite

## Your Role in IMS

As an executive, your relationship with IMS is about insight, not operation. You do not need to log incidents or approve documents — your team does that. What you need from IMS is a clear, reliable picture of organisational performance: safety rates, quality metrics, financial performance, ESG scores, risk heat map, and compliance status. IMS delivers this as a curated executive dashboard that requires minimal time and provides maximum intelligence.

---

## Your Key Modules

- **Dashboard (port 3000)**: Your configurable executive overview — a single page of top-line KPIs from across all active modules.
- **Risk Register (port 3031)**: The top risks facing the organisation, their current score, and treatment status.
- **ESG (port 3016)**: ESG performance against targets — carbon, safety, people, governance.
- **Finance (port 3013)**: Financial performance — P&L summary, budget vs actual, cash position.
- **Audit Management (port 3042)**: Management system audit programme status and critical findings.
- **Compliance (gateway)**: Overall compliance status across all regulatory obligations.

---

## Setting Up Your Executive Dashboard

Navigate to Dashboard → Edit Layout → Executive View:

Recommended executive dashboard widgets:

**Safety**
- LTIFR (Lost Time Injury Frequency Rate) — current month vs target vs last year
- Open safety incidents by severity — count at each severity level
- Overdue safety actions — count of past-target-date safety actions

**Quality**
- Customer complaint aging — count open > 15 working days
- Nonconformance trend — 12-month run chart
- CAPA close-out rate — percentage closed within target date

**Financial** (linked from Finance module)
- Revenue vs budget YTD
- EBITDA vs budget YTD
- Cash position (current)

**Risk**
- Risk heat map (mini) — count of Critical, High, Medium, Low risks
- Top 3 risks — title, current score, treatment status

**ESG**
- Scope 1+2 emissions vs target — YTD
- LTIFR (also in safety)
- Training hours per employee — YTD

**Compliance**
- Overall compliance RAG — green/amber/red overall status
- Upcoming compliance deadlines — next 30 days

Save this layout as your 'Executive View' so it loads by default.

---

## Your Weekly Executive Briefing

IMS can deliver a one-page executive briefing email automatically each Monday morning:

1. Navigate to Dashboard → Scheduled Reports → New Schedule
2. Select 'Executive Briefing' template
3. Choose the KPIs to include from the widget library
4. Set delivery: every Monday, 07:00 local time
5. Add recipients: yourself, any other executives who want the same briefing

The briefing arrives as a PDF attachment or an inline email — your choice. It takes 30 seconds to read and covers everything that moved significantly in the previous week.

---

## The Management Review Report

Quarterly, IMS generates a full management review pack for the board meeting.

Navigate to one of: Quality → Reports → Management Review, or H&S → Reports → Management Review, or Compliance → Reports → Management Review.

The management review pack includes (per ISO standard):
- Status of actions from previous management review
- Changes in external and internal context affecting the management system
- Information on quality / H&S / environmental performance (key metrics)
- Results of internal audits
- Customer feedback and satisfaction
- Process performance and product/service conformity
- Nonconformance, incidents, and status of corrective actions
- Monitoring and measurement results
- Audit programme results
- Performance of external providers
- Adequacy of resources
- Effectiveness of actions taken to address risks and opportunities
- Opportunities for improvement

This pack is generated in 60 seconds and is formatted for board distribution with your organisation's logo and branding.

---

## Using IMS on the Go

The IMS mobile app (available for iOS and Android) provides:

- **Executive Dashboard**: Your configured dashboard, optimised for mobile viewing
- **Alerts**: Push notifications for critical events — P1 safety incidents, major nonconformances, significant risk movements
- **Approval Queue**: Any approvals requiring your sign-off (purchase orders above threshold, policies, board documents)
- **Reports**: Access to any report available on the desktop version

Configure push notifications under Mobile → Notification Settings → Executive Alerts:
- Critical safety incidents (P1/P2)
- Budget variance alerts (> 5% adverse in a week)
- Top risk movements (any risk moving to Critical)
- Compliance status turning Red

---

## Your Most Important Reports

1. **Weekly Executive Briefing** — Automatically delivered Monday morning. Covers safety, quality, financial, and compliance highlights for the week. Read time: 2 minutes.
2. **Management Review Pack (Quarterly)** — Complete ISO management review input for the board. Covers all management system performance areas. Prepared by module managers, reviewed by you.
3. **Risk Heat Map (Monthly)** — Top 10 risks with current status, movement, and treatment progress. Your primary board risk communication tool.
4. **ESG Performance Report (Quarterly)** — Environmental, social, and governance metrics vs targets. Used for investor and stakeholder reporting.
5. **Financial Dashboard** — P&L, budget vs actual, cash, and key financial ratios. Available in real time, updated daily.

---

## Quick Tips for Your Role

- **Configure your dashboard once and leave it** — resist the temptation to constantly reconfigure. A stable, consistent dashboard lets you spot trends more easily than a dashboard that changes weekly.
- **Use the drill-down for anything that catches your eye** — every number on your executive dashboard is clickable. One click shows you the underlying detail; another shows you the raw data. You can go from 'high-level summary' to 'specific incident record' in three clicks.
- **Act on the weekly briefing** — if the LTIFR trend line has been going the wrong way for 3 consecutive weeks, that is a conversation with the HSE Manager, not a note for the monthly meeting.
- **Review the management review pack before signing off** — the pack is produced by your team. Read it critically. Patterns in the data are more important than individual data points.
- **Set the mobile alerts selectively** — if every minor event triggers a push notification, you will start ignoring them. Reserve alerts for genuinely critical events only.

---

## Getting More From IMS

**Benchmarking**: Navigate to Analytics → Benchmarking to compare your safety, quality, and ESG metrics against available industry benchmarks. Useful for board discussions about relative performance.

**Strategic KPI Tracker**: Navigate to Dashboard → Strategic KPIs to set and track your board-level strategic objectives alongside the operational KPIs. These are the 3-5 things that define organisational success for the year, tracked on a single page.

**AI Analysis Summary**: The AI module generates natural-language summaries of performance trends across all modules. Navigate to AI → Briefing → Generate Executive Summary to receive a paragraph-form description of what the data shows — useful if you prefer narrative to charts.
`,
  },

  {
    id: 'KB-RB-025',
    title: 'IMS Guide for the New Starter',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['role-based', 'new-starter', 'onboarding', 'getting-started'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# IMS Guide for the New Starter

## Your Role in IMS

Welcome to the team — and to IMS. As a new starter, IMS is where you will find your assigned tasks and actions, access training materials assigned to you, read the policies and procedures relevant to your role, and report any incidents or issues you observe. This guide gives you a confidence-building tour of the system so that you feel comfortable navigating IMS from day one.

---

## Step 1: Your First Login

Your manager or the HR team will have sent you an invitation email from IMS. Click the activation link in that email to set your password. Password requirements:
- Minimum 12 characters
- At least 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character

After setting your password, navigate to your organisation's IMS URL (your manager will provide this). Log in with your email address and the password you just set.

---

## Step 2: Navigating the Dashboard

When you first log in, you will see the IMS main dashboard. Here is what you are looking at:

**Top Navigation Bar**
- The search icon (or press Cmd+K / Ctrl+K) — searches across all content you have access to
- The bell icon — your notifications. New task assignments, reminders, and alerts appear here
- Your avatar (top right) — your profile, settings, and the logout button

**Left Sidebar**
The sidebar shows the modules you have been given access to. You will only see the modules relevant to your role — you will not see modules outside your permission level. If you think you should have access to something that is not in your sidebar, speak to your manager or the System Administrator.

**Main Content Area**
The homepage shows:
- **My Tasks** — actions and tasks assigned to you that need attention
- **My Training** — training courses assigned to you
- **Recent Notifications** — latest alerts and messages
- **Quick Links** — shortcuts your administrator has set up for commonly used pages

---

## Step 3: Finding Your Assigned Tasks

Navigate to Dashboard → My Tasks (or click the 'Tasks' section on the homepage).

Your tasks may include:
- **Training to complete**: mandatory training assigned to your role (safety induction, company policies, job-specific skills)
- **Documents to acknowledge**: policies or procedures you need to confirm you have read
- **Actions assigned to you**: corrective actions, improvement suggestions, or project tasks assigned by a manager
- **Forms to complete**: onboarding forms, health declarations, equipment checklists

Each task shows: what it is, who assigned it, and when it is due. Click a task to open it and complete it.

---

## Step 4: Completing Your Assigned Training

Navigate to Training → My Training to see all training assigned to your role.

Training may be:
- **Online (e-learning)**: Complete directly in IMS. Click the course, work through the material, and complete the assessment. Your score is recorded automatically.
- **Scheduled classroom / workshop**: IMS shows you the date, time, and location. Your attendance is recorded by your Training Coordinator.
- **Document acknowledgement**: Some 'training' is a policy or procedure you need to read and confirm you have understood. Click 'Acknowledge' after reading.

Your Training Certificate is stored in IMS once you complete each course. Navigate to Training → My Certificates to see them.

> Important: Some tasks in IMS (and some work activities) are gated by training completion. If you try to access something and get a 'training required' message, complete the required training first and then try again.

---

## Step 5: Finding Documents Relevant to Your Role

Navigate to Document Control → My Documents or use the global search (Cmd+K) to find documents by name.

Documents you are likely to need:
- **Company policies**: Health & Safety Policy, Environmental Policy, Quality Policy, IT Acceptable Use Policy, Equal Opportunities Policy
- **Procedures relevant to your role**: Ask your manager which procedures apply to your job
- **Forms**: Any forms you need to complete as part of your job are stored in Document Control

All documents in IMS are the current approved version. If you have a printed procedure from a previous visit, check the date on it against the version in Document Control — always follow the IMS version.

---

## Step 6: Understanding Notifications

The bell icon in the top navigation bar is your notification centre. Notifications you will receive as a new starter:

- **Training assigned**: A new course has been added to your training profile
- **Task assigned**: Someone has assigned you an action or task
- **Document published**: A policy or procedure has been published that you need to acknowledge
- **Reminder**: A deadline is approaching for a task or training course you have not yet completed

Click the bell to see all current notifications. Click a notification to go directly to the relevant item. The bell shows a red number badge when you have unread notifications.

You can manage your notification preferences under Your Avatar → Settings → Notifications. Start with the default settings and adjust after a few weeks once you understand which notifications matter most to you.

---

## Step 7: Raising a Request or Reporting an Incident

### If you need to request something (access, equipment, information)
Navigate to Dashboard → Quick Actions → Raise Request, or go to the relevant module and look for 'New Request' or 'New' button.

### If you observe a safety hazard or near-miss
Even on your first day, if you see something unsafe, you can report it:
1. Navigate to Health & Safety → Observations → New Observation (or Incidents → Report Incident)
2. Describe what you saw, where it was, and when
3. You do not need to know who is responsible — just describe what you observed
4. Submit the report — the safety team will follow up

You will never be penalised for reporting a safety concern. IMS is designed to make reporting easy and normal. The more near-misses are reported, the better the organisation can prevent actual injuries.

---

## Your Most Important First Steps

1. **Set your password** — done when you activate your account
2. **Complete your induction training** — check My Training and complete all 'Induction' type courses in your first week
3. **Acknowledge your key policies** — complete any document acknowledgement tasks in My Tasks in your first week
4. **Explore your module access** — click each item in your sidebar to get familiar with the modules you will be using in your role
5. **Save the IMS URL as a bookmark** — you will use it every day

---

## Quick Tips for New Starters

- **If you are lost, use the search bar** — type what you are looking for. IMS searches across articles, documents, tasks, and module records.
- **The Knowledge Base is your help library** — if you need to understand how to do something in IMS, check the Knowledge Base first (this article library). Your administrator or manager can show you how to access it.
- **Your tasks on the homepage are prioritised by due date** — work through them in order and you will always be on top of your IMS responsibilities.
- **Do not share your password** — your IMS account is personal and creates an audit trail under your name. If someone else uses your account, actions appear as yours.
- **Ask your manager if you need access to something not in your sidebar** — they can request access changes from the System Administrator.

---

## Getting More From IMS

**Your Profile**: Navigate to Your Avatar → My Profile to update your contact details, upload a profile photo, and set your notification preferences. A complete profile helps colleagues identify you in the system.

**The Knowledge Base**: This article library (the one you are reading right now) is available any time from Help → Knowledge Base. Browse by category or search for specific topics. If you cannot find an answer, use the AI Assistant (if enabled) or contact your system administrator.

**Mobile App**: Ask your IT team or manager whether IMS mobile is available for your role. For field-based and operations roles, the mobile app puts IMS in your pocket for on-the-go task completion, reporting, and communication.

**Keyboard Shortcuts**: Press Cmd+K (Mac) or Ctrl+K (Windows) from anywhere in IMS to open the command palette — a fast search and navigation tool. Type any module name, document title, or action to jump directly to it.
`,
  },
];
