import type { KBArticle } from '../types';

export const moduleDeepDives1Articles: KBArticle[] = [
  {
    id: 'KB-DD1-001',
    title: 'Health & Safety Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['health-safety', 'iso-45001', 'user-guide', 'daily-tasks'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Health & Safety Day-to-Day User Guide

## Overview

The Health & Safety module (port 3001) is the central hub for all occupational health and safety activities in your organisation. This guide covers the essential daily tasks for front-line users and supervisors.

## Getting Started

Navigate to the H&S module via **Dashboard → H&S → Overview**. The overview screen displays your personal task list, recent incidents in your area, and key KPI widgets.

## Daily Tasks

### Reporting a Hazard
1. Click **Quick Actions → Report Hazard** from the top navigation bar.
2. Select the hazard category (physical, chemical, biological, ergonomic, psychosocial).
3. Enter the location, description, and upload a photo if available.
4. Submit — the system will automatically notify your supervisor.

### Logging an Incident
1. Select **Quick Actions → Report Incident**.
2. Choose the incident type: injury, near miss, property damage, or environmental release.
3. Complete the mandatory fields: date/time, location, people involved, initial description.
4. The system assigns a reference number automatically (e.g. INC-2026-001).

### Logging a Near Miss
Near misses are a critical leading indicator. Use **Quick Actions → Log Near Miss** and follow the same process as incident reporting. Near misses are kept confidential by default.

## Checking Your Tasks

Your assigned corrective actions appear in **H&S → My Tasks**. Each task shows the due date, priority, and linked incident or risk assessment. Click any task to update progress, upload evidence, or request an extension.

## H&S Dashboard KPIs

The dashboard displays:
- **LTIFR** (Lost Time Injury Frequency Rate)
- **TRIFR** (Total Recordable Injury Frequency Rate)
- Days since last recordable incident
- Open hazard reports and overdue corrective actions

Review these daily to stay informed of your area's safety performance.
`,
  },
  {
    id: 'KB-DD1-002',
    title: 'Health & Safety Administrator Configuration Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['health-safety', 'iso-45001', 'administration', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Health & Safety Administrator Configuration Guide

## Overview

This guide covers the initial setup and ongoing administration of the Health & Safety module. Administrator access is required — navigate to **Settings → H&S → Configuration**.

## Step 1: Organisational Structure

### Locations and Departments
Go to **Settings → H&S → Locations** to define your physical sites and areas. Each location can have sub-locations (e.g. Building A → Workshop Floor). Departments are configured under **Settings → H&S → Departments**.

### Hazard Categories
Define your hazard taxonomy at **Settings → H&S → Hazard Categories**. Standard categories include physical, chemical, biological, ergonomic, and psychosocial. Add custom categories as needed.

## Step 2: Risk Matrix Configuration

Navigate to **Settings → H&S → Risk Matrix** to configure your 5×5 Likelihood × Severity matrix. Set threshold values for:
- **Low risk**: scores 1–4 (green)
- **Medium risk**: scores 5–9 (yellow)
- **High risk**: scores 10–16 (orange)
- **Extreme risk**: scores 17–25 (red)

## Step 3: Incident Severity Levels

Configure severity definitions at **Settings → H&S → Incident Severity**. Each severity level (Minor, Moderate, Major, Critical, Catastrophic) should have clear criteria and an associated notification escalation path.

## Step 4: Role Assignment

Assign H&S roles under **Settings → Users → Role Assignment**:
- **OHS Manager**: full module access, approve risk assessments and CAPAs
- **Safety Officer**: create and edit all records, run reports
- **Employee**: report hazards and incidents, view own tasks

## Step 5: Notification Rules

Set up notification rules at **Settings → H&S → Notifications** to trigger alerts when incidents are reported, risk assessments are due for review, or corrective actions are overdue.

## Step 6: Legal Requirements

Configure legal register sources at **Settings → H&S → Legal Register Sources**. The Regulatory Monitor integration can auto-populate new legislation updates for your jurisdiction.
`,
  },
  {
    id: 'KB-DD1-003',
    title: 'Health & Safety Reporting & KPI Dashboard',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['health-safety', 'iso-45001', 'reporting', 'kpi', 'dashboard'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Health & Safety Reporting & KPI Dashboard

## Overview

The H&S reporting suite provides real-time visibility into your safety performance. Access reports via **H&S → Reports** and the live dashboard via **H&S → Dashboard**.

## Key Performance Indicators

The H&S dashboard tracks the following leading and lagging indicators:

- **LTIFR**: Lost Time Injury Frequency Rate (injuries per million hours worked)
- **TRIFR**: Total Recordable Injury Frequency Rate
- **Near Miss Ratio**: near misses per recordable injury (higher is better)
- **Days Since Last Incident**: prominent countdown on the dashboard
- **Hazard Closure Rate**: percentage of reported hazards actioned within SLA

## Built-In Reports

| Report | Description |
|---|---|
| Incident Summary | All incidents by type, severity, location, and period |
| Risk Register Status | Open, in-progress, and reviewed risk assessments |
| Legal Compliance Status | Legal requirements by status and due date |
| CAPA Status Report | Open corrective actions, overdue, and closed |
| Injury Statistics | Frequency rates trended monthly and annually |

## Creating a Custom H&S Report

1. Navigate to **H&S → Reports → New Report**.
2. Select the data source (incidents, hazards, risk assessments, or CAPAs).
3. Choose your fields, filters (date range, location, severity), and groupings.
4. Preview and save the report with a name for reuse.

## Scheduling Automated Reports

Go to **H&S → Reports → Scheduled Reports** and select the report, frequency (daily, weekly, monthly), and distribution list. Reports are delivered as PDF or Excel attachments.

## Exporting Data

From any report, click **Export** and choose CSV, Excel, or PDF. For large datasets, the system generates the file in the background and emails you a download link.

## Trend Analysis

Use the **Trend Charts** tab on the H&S dashboard to view rolling 12-month data. Identify seasonal patterns, the effect of safety initiatives, and deteriorating areas before incidents occur.
`,
  },
  {
    id: 'KB-DD1-004',
    title: 'Health & Safety Best Practices (ISO 45001)',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['health-safety', 'iso-45001', 'best-practices', 'ohsms'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Health & Safety Best Practices (ISO 45001)

## Overview

ISO 45001:2018 is the international standard for Occupational Health and Safety Management Systems (OHSMS). This guide outlines best practices for aligning your IMS H&S module with the standard's requirements.

## Clause Alignment in IMS

- **Clause 4 (Context)**: Document your organisation context and interested parties in **H&S → Legal Register** and the risk assessment register.
- **Clause 5 (Leadership)**: Capture management commitments and OHS policy in **Document Control → Policies**.
- **Clause 6 (Planning)**: Hazard identification, risk assessments, legal requirements, and objectives are all managed in the H&S module.
- **Clause 8 (Operations)**: Operational controls, permit to work, and emergency procedures link directly to H&S records.
- **Clause 9 (Evaluation)**: Use the KPI dashboard and incident reports for performance monitoring.
- **Clause 10 (Improvement)**: CAPAs and the management review feed continual improvement.

## Worker Participation (Clause 5.4)

Document worker consultation activities in **H&S → Meetings**. Record safety committee meetings, toolbox talks, and hazard identification walkthroughs. Evidence of participation is a key auditor focus area.

## Proactive vs Reactive Indicators

Balance your KPIs:
- **Reactive**: LTIFR, TRIFR, number of incidents
- **Proactive**: near-miss rate, hazard reporting rate, training compliance, inspection completion rate

## Review Cycle

- **Monthly**: hazard register review, corrective action progress
- **Quarterly**: OHS objectives review, legal compliance check
- **Annual**: full management review, objectives reset, OHSMS internal audit

## Near-Miss Culture

Organisations that report more near misses have fewer serious incidents. Celebrate near-miss reporting — never penalise it. Track your near-miss-to-incident ratio on the H&S dashboard.

## Common ISO 45001 Certification Gaps

- Incomplete legal register with no review history
- Risk assessments not reviewed after incidents or changes
- No documented worker consultation evidence
- CAPA records lacking root cause analysis
- Management review not covering all required inputs
`,
  },
  {
    id: 'KB-DD1-005',
    title: 'Health & Safety Troubleshooting Guide',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['health-safety', 'iso-45001', 'troubleshooting', 'support'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Health & Safety Troubleshooting Guide

## Overview

This guide addresses the most common issues users encounter in the Health & Safety module and provides step-by-step resolutions.

## Issue: Incident Not Appearing in Reports

**Symptom**: A submitted incident is not visible in the Incident Summary report.

**Resolution**:
1. Confirm the incident status is 'Submitted' or 'Open' (drafts are excluded from reports).
2. Check the report date range filter — ensure it covers the incident date.
3. Verify the incident location matches the report's location filter.
4. If the incident was submitted by another user, confirm your role has 'View All Incidents' permission.

## Issue: Risk Assessment Approval Workflow Stuck

**Symptom**: A risk assessment submitted for approval shows no approver action for several days.

**Resolution**:
1. Go to **H&S → Risk Assessments** and open the record.
2. Check the 'Approval History' tab to see who the pending approver is.
3. Confirm that approver has an active account and the correct role.
4. Use **Actions → Reassign Approver** if needed.

## Issue: Legal Requirements Showing Wrong Jurisdiction

**Resolution**: Navigate to **Settings → H&S → Legal Register Sources** and verify that the correct country and state/province are selected. Update the jurisdiction filter and re-sync the legal register.

## Issue: Notification Emails Not Being Received

**Resolution**:
1. Check **Settings → Notifications → Email Logs** for delivery errors.
2. Verify the recipient's email address is correct in their user profile.
3. Ask the recipient to check their spam folder.
4. Confirm the notification rule is active at **Settings → H&S → Notifications**.

## Issue: User Cannot Access H&S Module

**Resolution**: Navigate to **Settings → Users**, find the user, and verify they have an H&S role assigned. At minimum, the 'Employee' role is required for basic access.

## Issue: OHS Objectives Not Updating Progress

**Resolution**: Objectives linked to manual KPIs require manual progress entry. Go to **H&S → Objectives**, open the objective, and click **Update Progress**. For auto-calculated objectives, verify the linked data source is configured correctly.

## Recovering a Deleted Incident

Deleted records are soft-deleted and retained for 90 days. Contact your System Administrator to restore a deleted incident via **Settings → Data Management → Recycle Bin**.
`,
  },
  {
    id: 'KB-DD1-006',
    title: 'Connecting Health & Safety with CMMS, Incidents & Training',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['health-safety', 'iso-45001', 'integrations', 'cross-module'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Connecting Health & Safety with CMMS, Incidents & Training

## Overview

The H&S module integrates with several other IMS modules to eliminate data duplication, automate workflows, and provide a complete picture of safety performance across your organisation.

## H&S ↔ CMMS (Maintenance)

When a hazard report identifies a defective piece of equipment, H&S can automatically raise a CMMS work order. Configure this at **Settings → Integrations → H&S → CMMS**. The work order status feeds back into the H&S hazard record, closing it automatically when maintenance is complete.

## H&S ↔ Training

Role-based competency requirements defined in H&S (e.g. forklift licence, first aid) are pushed to the Training module as mandatory training plans for employees in relevant roles. Training compliance status is visible directly on the H&S dashboard. Configure at **Settings → Integrations → H&S → Training**.

## H&S ↔ Incidents Module

The dedicated Incidents module (port 3041) provides a deeper incident investigation workflow including timelines, witness statements, and formal investigation reports. Incidents created in H&S can be escalated to the Incidents module with a single click, with all data transferred automatically.

## H&S ↔ Document Control

Procedures, safe work method statements, and emergency plans stored in Document Control can be linked directly to risk assessment controls. When a procedure is revised, H&S risk assessments that reference it are flagged for review.

## H&S ↔ Audit Management

Schedule H&S compliance audits in the Audit Management module and link findings directly to H&S corrective actions. This ensures audit findings are tracked through to resolution.

## H&S ↔ Permit to Work

PTW risk assessments pull from the H&S risk register, ensuring consistency. High-risk PTW activities automatically trigger an H&S review before permit approval.

## Configuring Cross-Module Data Flows

All integration toggles are managed at **Settings → Integrations**. Enable each integration individually and configure the specific data mapping rules for your organisation.
`,
  },
  {
    id: 'KB-DD1-007',
    title: 'ISO 45001 Compliance & Audit Readiness',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['health-safety', 'iso-45001', 'compliance', 'audit', 'certification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 45001 Compliance & Audit Readiness

## Overview

Preparing for an ISO 45001 certification or surveillance audit requires organised evidence and complete documentation. IMS provides purpose-built tools to streamline this process.

## Pre-Audit Checklist

### Required Records
Ensure all of the following are complete and up to date in IMS:

- [ ] **OHS Policy** — published, signed by top management, available to all workers
- [ ] **Hazard Register** — all identified hazards with risk ratings and controls
- [ ] **Risk Assessments** — reviewed within the last 12 months (or after any significant change)
- [ ] **Legal Register** — all applicable legislation identified, compliance status assessed
- [ ] **OHS Objectives** — SMART objectives with targets, owners, and progress records
- [ ] **Incident Register** — all incidents, near misses, and hazards for the period
- [ ] **Corrective Action Register** — open and closed CAPAs with root cause and effectiveness evidence
- [ ] **Internal Audit Records** — at least one full OHSMS internal audit per certification cycle
- [ ] **Management Review Minutes** — covering all ISO 45001 required inputs and outputs
- [ ] **Competency Records** — training completions for all safety-critical roles

## Generating the Evidence Pack

Navigate to **H&S → Reports → Audit Evidence Pack**. Select the audit scope, date range, and required record types. The system generates a structured ZIP file containing all relevant records, ready for auditor review.

## Common Non-Conformances to Avoid

- Risk assessments not reviewed after incidents or organisational changes
- Legal register with no history of compliance evaluations
- No evidence of worker participation in hazard identification
- CAPAs without root cause analysis or effectiveness checks
- Management review not covering all mandatory inputs

## Management Review Preparation

Use **H&S → Reports → Management Review Pack** to generate the complete data set for your management review. The pack includes all required ISO 45001 inputs automatically compiled from live module data.
`,
  },
  {
    id: 'KB-DD1-008',
    title: 'Conducting a Risk Assessment in H&S',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['health-safety', 'iso-45001', 'risk-assessment', 'hazard-identification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Conducting a Risk Assessment in H&S

## Overview

Risk assessments are the foundation of an effective OHSMS. This guide walks through the complete risk assessment workflow in IMS from hazard identification to approval.

## Step 1: Initiate a New Risk Assessment

Navigate to **H&S → Risk Assessments → New**. Enter the assessment title, work activity or area, scope, and assign the responsible person and review date.

## Step 2: Hazard Identification

Document all hazards associated with the activity. IMS supports multiple identification methods:
- **Job Safety Analysis (JSA)**: break the task into steps and identify hazards at each step
- **Walk-Through Survey**: record observations directly into the hazard list
- **Incident History Review**: pull in past incidents from the same location or activity type using **Add from Incident History**

For each hazard, record the type, potential harm, and persons at risk.

## Step 3: Risk Scoring

For each hazard, assign:
- **Likelihood** (1–5): Rare, Unlikely, Possible, Likely, Almost Certain
- **Severity** (1–5): Negligible, Minor, Moderate, Major, Catastrophic

The system automatically calculates the risk score (Likelihood × Severity) and applies the colour-coded risk matrix.

## Step 4: Assigning Controls

Apply the hierarchy of controls for each hazard:
1. **Eliminate** — remove the hazard entirely
2. **Substitute** — replace with something less hazardous
3. **Engineering controls** — barriers, guarding, ventilation
4. **Administrative controls** — procedures, training, supervision
5. **PPE** — last resort; personal protective equipment

Document each control measure in IMS. After applying controls, enter the residual likelihood and severity to calculate the residual risk score.

## Step 5: Review and Approval

Submit the completed assessment for approval via **Actions → Submit for Review**. The configured approver (typically the OHS Manager or department head) receives a notification and can approve or return for amendment.

## Step 6: Linking to Activities

Once approved, link the risk assessment to specific work activities, locations, or equipment records for easy retrieval during operational activities and audits.
`,
  },
  {
    id: 'KB-DD1-009',
    title: 'Environmental Management Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['environment', 'iso-14001', 'user-guide', 'daily-tasks'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Environmental Management Day-to-Day User Guide

## Overview

The Environmental Management module (port 3002) supports ISO 14001:2018 compliance. This guide covers the routine tasks performed by environmental coordinators, site managers, and monitoring personnel.

## Getting Started

Navigate to **Dashboard → Environment → Overview**. The overview shows your current significant aspects, open corrective actions, and KPI widgets for key environmental metrics.

## Daily Environmental Monitoring Tasks

### Recording Monitoring Data
1. Go to **Environment → Events → New Event**.
2. Select the event type: emissions to air, effluent discharge, waste disposal, energy consumption, or noise.
3. Enter the measured values, units, and reference the monitoring point or equipment.
4. The system automatically flags any readings that exceed configured threshold limits.

### Reviewing Threshold Alerts
Threshold breach notifications appear in your dashboard notification panel. Navigate to **Environment → Events → Alerts** to review and acknowledge breaches and initiate corrective action.

## Aspects and Impacts Register

View the current aspects register at **Environment → Aspects**. Each aspect shows:
- Environmental aspect description
- Associated impacts (positive and negative)
- Significance score and determination
- Linked controls and objectives

## Checking Environmental Objectives Progress

Navigate to **Environment → Objectives** to view your targets and current progress. Click any objective to see the linked milestones, actions, and responsible persons.

## Environmental Dashboard KPIs

The dashboard displays:
- **Emissions intensity** (kg CO2e per unit of production)
- **Waste diversion rate** (% recycled or recovered)
- **Water consumption** (m3 per period)
- **Energy use** (kWh per period)
- Open CAPA items and overdue actions

Review these metrics in your daily or weekly team briefings to track performance trends.
`,
  },
  {
    id: 'KB-DD1-010',
    title: 'Environmental Administrator Configuration Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['environment', 'iso-14001', 'administration', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Environmental Administrator Configuration Guide

## Overview

This guide covers the setup and administration of the Environmental Management module. Administrator access is required — navigate to **Settings → Environment → Configuration**.

## Step 1: Aspects Categories

Define your environmental aspect categories at **Settings → Environment → Aspect Categories**. Standard categories include:
- Air emissions (combustion, fugitive, process)
- Water discharges (process effluent, stormwater, cooling water)
- Land (spills, contamination, soil erosion)
- Energy consumption (electricity, gas, fuel)
- Waste (solid waste, hazardous waste, recyclables)
- Noise and vibration

## Step 2: Monitoring Parameters and Thresholds

Configure monitoring parameters at **Settings → Environment → Monitoring Parameters**. For each parameter, set:
- Unit of measurement (e.g. mg/L, kg, kWh)
- Warning threshold — triggers advisory alert
- Breach threshold — triggers mandatory corrective action notification
- Monitoring frequency (daily, weekly, monthly)

## Step 3: Legal Requirements Sources

Navigate to **Settings → Environment → Legal Register Sources** to configure the jurisdictions and legislation types that apply to your organisation. Enable the Regulatory Monitor integration to receive automatic updates when new environmental legislation is enacted in your jurisdiction.

## Step 4: Environmental Objectives Structure

At **Settings → Environment → Objectives Configuration**, define the structure for your environmental objectives:
- Objective categories (reduction, efficiency, compliance)
- Target types (absolute reduction, percentage improvement, maintain compliance)
- Review frequency (monthly, quarterly, annual)

## Step 5: Notification Rules

Configure threshold breach and overdue action notifications at **Settings → Environment → Notifications**. Set escalation paths for critical breaches that require immediate management notification.

## Step 6: Data Collection Frequency

For each monitoring parameter, configure the expected data collection frequency. The system will highlight overdue data entries on the dashboard to prevent monitoring gaps in your compliance records.
`,
  },
  {
    id: 'KB-DD1-011',
    title: 'Environmental Reporting & Dashboard Guide',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['environment', 'iso-14001', 'reporting', 'dashboard', 'kpi'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Environmental Reporting & Dashboard Guide

## Overview

The Environmental Management module includes a comprehensive reporting suite for regulatory compliance, management review, and stakeholder communication. Access reports via **Environment → Reports**.

## Key Environmental KPIs

Track these core metrics on the Environmental dashboard:

| KPI | Description |
|---|---|
| Emissions Intensity | CO2e per unit of production/revenue |
| Waste Diversion Rate | Percentage of waste recycled or recovered |
| Water Consumption | Total and per-unit consumption by period |
| Energy Use | Total kWh and energy intensity |
| Legal Compliance Rate | Percentage of legal requirements in compliance |
| CAPA Closure Rate | Percentage of corrective actions closed on time |

## Built-In Reports

- **Aspects Register**: Complete list of aspects, impacts, and significance ratings
- **Legal Compliance Report**: All legal requirements with compliance status and evidence
- **Objectives Progress Report**: Target vs actual for all environmental objectives
- **CAPA Status Report**: Open, overdue, and closed corrective actions
- **Monitoring Data Summary**: All environmental measurement data for a selected period

## GHG Emissions Summary

The GHG report aggregates Scope 1 and Scope 2 emissions from environmental event records. Navigate to **Environment → Reports → GHG Summary**. Emission factors are applied automatically using the IMS Emission Factors library. Data can be exported directly to the ESG module for consolidated sustainability reporting.

## Management Review Report

Use **Environment → Reports → Management Review Pack** to compile the complete environmental performance data pack required for your ISO 14001 management review input.

## Trend Analysis

The **Trend Charts** view (available on the dashboard and in each monitoring parameter detail screen) shows historical data plotted over your chosen period. Use this to identify seasonal patterns and measure the effectiveness of environmental improvement initiatives.

## Export Options

All reports support export in PDF, CSV, and Excel formats. Scheduled reports can be configured to deliver automatically to distribution lists on a weekly or monthly basis.
`,
  },
  {
    id: 'KB-DD1-012',
    title: 'Environmental Management Best Practices (ISO 14001)',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['environment', 'iso-14001', 'best-practices', 'ems'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Environmental Management Best Practices (ISO 14001)

## Overview

ISO 14001:2018 provides the framework for an effective Environmental Management System (EMS). This guide outlines best practices for using IMS to meet and exceed the standard's requirements.

## Clause Alignment in IMS

- **Clause 4 (Context)**: Document your EMS scope and interested parties' requirements in the aspects register and legal register.
- **Clause 6 (Planning)**: Aspects and impacts assessment, legal requirements, and environmental objectives are all managed in IMS.
- **Clause 9 (Performance Evaluation)**: Use monitoring data, dashboard KPIs, and internal audit records.
- **Clause 10 (Improvement)**: CAPA records and management review feed the continual improvement cycle.

## Significance Evaluation

Configure your significance threshold carefully. IMS calculates significance using a weighted scoring formula:

'severity × 1.5 + probability × 1.5 + duration + extent + reversibility + regulatory + stakeholder'

The default threshold for a significant aspect is ≥15. Review and validate this threshold with your management team. Aspects above the threshold must be linked to environmental objectives or operational controls.

## Life Cycle Perspective

ISO 14001 requires consideration of a life cycle perspective. When identifying aspects, consider:
- **Upstream**: raw material extraction, supplier activities
- **Operations**: direct site activities
- **Downstream**: product use, end-of-life disposal

Document these in the aspect description field in IMS.

## Keeping the Legal Register Current

Enable the Regulatory Monitor integration at **Settings → Integrations → Regulatory Monitor** to receive automatic alerts when new environmental legislation is enacted. Review and update legal register entries monthly.

## Environmental Objectives: SMART Targets

Ensure each objective is:
- **Specific**: clearly defined metric and scope
- **Measurable**: linked to a quantified monitoring parameter
- **Achievable**: realistic given current baseline
- **Relevant**: linked to a significant aspect
- **Time-bound**: with a clear target date and review milestones

## Continual Improvement Documentation

Maintain a record of improvements made each year in the management review minutes. ISO auditors look for evidence that the EMS is delivering measurable environmental improvements over time.
`,
  },
  {
    id: 'KB-DD1-013',
    title: 'Environmental Management Troubleshooting Guide',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['environment', 'iso-14001', 'troubleshooting', 'support'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Environmental Management Troubleshooting Guide

## Overview

This guide addresses common issues encountered in the Environmental Management module with step-by-step resolutions.

## Issue: Significance Scores Not Calculating Correctly

**Symptom**: An aspect's significance score does not match your expected value.

**Resolution**:
1. Open the aspect record and click **View Score Breakdown**.
2. Verify each scoring criterion (severity, probability, duration, extent, reversibility, regulatory, stakeholder) has been rated.
3. Check the significance formula configured at **Settings → Environment → Significance Formula** matches your intended weighting.
4. Any unrated criterion defaults to 0, which can reduce the score unexpectedly.

## Issue: Environmental Events Not Appearing in Aspects Linkage

**Resolution**: Open the event record and confirm it has been linked to an aspect via **Actions → Link to Aspect**. Events and aspects must be explicitly linked — the system does not auto-link based on category alone.

## Issue: Legal Requirements Showing Incorrect Status

**Resolution**:
1. Open the legal requirement record.
2. Review the last compliance evaluation date and update the compliance status and evidence.
3. If the status is driven by an integration, check the Regulatory Monitor feed at **Settings → Integrations → Regulatory Monitor → Feed Status**.

## Issue: CAPA Not Closing Despite All Actions Being Complete

**Resolution**: A CAPA closes only when:
1. All individual actions are marked 'Complete' with evidence uploaded.
2. An effectiveness review has been submitted and approved.
3. The CAPA owner submits for final closure via **Actions → Submit for Closure**.

If all conditions are met, ask your administrator to check the CAPA workflow configuration.

## Issue: Monitoring Data Import Failing

**Resolution**: Check the import file format matches the template at **Environment → Monitoring → Import Template**. Common errors include incorrect date format (use ISO 8601: YYYY-MM-DD), incorrect column headers, and values outside acceptable unit ranges.

## Issue: Objective Progress Not Updating

**Resolution**: Objectives linked to monitoring parameters update automatically when new monitoring data is recorded. If not updating, verify the objective is linked to the correct monitoring parameter at **Environment → Objectives → Edit → Data Linkage**.

## Accessing Environmental Data from Other Modules

Environmental data is accessible in the ESG module (Scope 1/2 emissions) and the Energy module (energy consumption). If data is not appearing, check integration settings at **Settings → Integrations → Environment**.
`,
  },
  {
    id: 'KB-DD1-014',
    title: 'Connecting Environmental Management with ESG, Energy & H&S',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['environment', 'iso-14001', 'integrations', 'esg', 'energy', 'cross-module'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Connecting Environmental Management with ESG, Energy & H&S

## Overview

The Environmental Management module sits at the centre of your sustainability data ecosystem. Its integrations with ESG, Energy, H&S, and other modules eliminate data duplication and ensure a single source of truth for environmental performance data.

## Environmental ↔ ESG

GHG emissions data recorded in environmental events automatically populate the ESG module's Scope 1 and Scope 2 emissions reporting. Configure this at **Settings → Integrations → Environment → ESG**. The integration applies IMS emission factors to raw activity data to calculate CO2e values, which flow directly into your ESG sustainability reports.

## Environmental ↔ Energy

Energy consumption data from the Energy module (port 3021) flows into the Environmental module as energy-related environmental aspects. This provides a unified view of energy use in both modules without double entry. Enable at **Settings → Integrations → Energy → Environment**.

## Environmental ↔ H&S

Environmental incidents (spills, releases) are shared with the H&S incident register, providing a consolidated view of all incident types in one place. Corrective actions can be managed in either module, with status synchronised automatically.

## Environmental ↔ Document Control

Environmental procedures, emergency plans, and monitoring protocols stored in Document Control can be linked to aspects and operational controls. When a procedure is updated, linked aspects are flagged for review.

## Environmental ↔ Audit Management

ISO 14001 compliance audits are scheduled and managed in the Audit Management module. Audit findings link directly to environmental CAPAs for seamless resolution tracking.

## Environmental ↔ Regulatory Monitor

The Regulatory Monitor integration (enabled at **Settings → Integrations → Regulatory Monitor**) automatically identifies new and amended environmental legislation relevant to your jurisdiction and industry, and adds them to the legal register for review.

## Configuration

Manage all integration connections at **Settings → Integrations**. Each integration can be enabled or disabled independently. Data mapping rules can be customised to align with your organisation's specific field naming conventions.
`,
  },
  {
    id: 'KB-DD1-015',
    title: 'ISO 14001 Compliance & Audit Readiness',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['environment', 'iso-14001', 'compliance', 'audit', 'certification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 14001 Compliance & Audit Readiness

## Overview

Achieving and maintaining ISO 14001 certification requires well-organised documented information and demonstrable evidence of EMS operation. IMS provides tools to make audit preparation efficient.

## Pre-Certification Checklist

### Required Documented Information
Ensure all of the following are complete and current in IMS:

- [ ] **Environmental Policy** — published, signed, available to all personnel and interested parties
- [ ] **EMS Scope** — documented in the system context records
- [ ] **Aspects and Impacts Register** — all aspects identified, evaluated, and significance determined
- [ ] **Legal Register** — all applicable environmental legislation identified with compliance status
- [ ] **Environmental Objectives** — SMART objectives with targets, responsible persons, and progress records
- [ ] **Monitoring and Measurement Data** — records for all significant environmental aspects
- [ ] **CAPA Register** — open and closed corrective actions with root cause and effectiveness evidence
- [ ] **Internal Audit Records** — at least one full EMS internal audit per certification cycle
- [ ] **Management Review Minutes** — covering all ISO 14001 required inputs

## Generating the Evidence Pack

Navigate to **Environment → Reports → Audit Evidence Pack**. Select the audit scope, date range, and record types. The system generates a structured, auditor-ready package.

## Common ISO 14001 Non-Conformances

- Aspects register not reviewed after significant operational changes
- Legal register with no compliance evaluation history
- Objectives without measurable targets or baseline data
- No documented monitoring and measurement program
- CAPA records without root cause analysis

## Third-Party Auditor Access

Create a read-only audit user account at **Settings → Users → New User**. Assign the 'Auditor' role, which grants read-only access to all Environmental module records without the ability to create or modify data.

## Management Review Content (ISO 14001 Clause 9.3)

Use the Management Review Pack report to compile data on: compliance status, objectives progress, significant aspects review, stakeholder communications, audit findings, and CAPA status. This ensures all ISO 14001 required inputs are covered.
`,
  },
  {
    id: 'KB-DD1-016',
    title: 'Conducting an Aspects & Impacts Assessment',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['environment', 'iso-14001', 'aspects-impacts', 'assessment'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Conducting an Aspects & Impacts Assessment

## Overview

The aspects and impacts assessment is the cornerstone of ISO 14001. This guide walks through the complete process using the IMS Environmental module.

## Step 1: Define the Scope and Boundaries

Before identifying aspects, document the EMS scope at **Environment → EMS Scope**. Define the physical and organisational boundaries, what activities and services are included, and any site-specific exclusions.

## Step 2: Identify Environmental Aspects

Navigate to **Environment → Aspects → New**. For each activity, product, or service, identify associated environmental aspects under three conditions:

- **Normal operations**: routine day-to-day activities
- **Abnormal conditions**: startups, shutdowns, maintenance activities
- **Emergency conditions**: potential incidents such as spills or fires

For each aspect, record the category (air, water, land, energy, waste, noise) and associated environmental impacts (both positive and negative).

## Step 3: Evaluate Impacts

For each aspect-impact pair, rate the following criteria (1–5 scale):

| Criterion | Description |
|---|---|
| Severity | How serious is the environmental impact? |
| Probability | How likely is the impact to occur? |
| Duration | Is the impact temporary or permanent? |
| Extent | Local, regional, or global scale? |
| Reversibility | Can the environment recover? |
| Regulatory concern | Is this subject to legislation or permits? |
| Stakeholder concern | Is this a community or investor concern? |

## Step 4: Determine Significance

IMS calculates a significance score using the configured formula. The default threshold is ≥15 for a significant aspect. Review the automatically calculated scores and apply professional judgement where needed.

## Step 5: Link to Objectives and Controls

Significant aspects must be addressed through environmental objectives, operational controls, or emergency preparedness plans. Link these directly in the aspect record using **Actions → Link Objective** or **Actions → Link Control**.

## Step 6: Review and Re-Evaluation

Set a review date for each aspect (annually as a minimum). Aspects must be re-evaluated after significant changes to operations, new environmental legislation, or major environmental incidents.
`,
  },
  {
    id: 'KB-DD1-017',
    title: 'Quality Management Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['quality', 'iso-9001', 'user-guide', 'daily-tasks'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Quality Management Day-to-Day User Guide

## Overview

The Quality Management module (port 3003) provides a complete QMS aligned with ISO 9001:2015. This guide covers the essential daily tasks for quality team members, production staff, and quality managers.

## Getting Started

Navigate to **Dashboard → Quality → Overview**. The overview screen shows your open non-conformances, pending CAPA actions, document approvals awaiting your action, and current quality KPIs.

## Logging a Non-Conformance (NCR)

1. Click **Quick Actions → New Non-Conformance**.
2. Select the classification: product non-conformance, process non-conformance, system finding, or customer complaint.
3. Choose the severity level: Minor, Major, or Critical.
4. Record the affected product, process, or area, with a clear description and evidence (photos, test results).
5. Identify the immediate containment action taken.
6. Submit — the system generates a reference number (e.g. NCR-2026-001) and notifies the responsible quality officer.

## Reviewing and Approving Quality Documents

Navigate to **Quality → Documents → Pending Approval**. Documents assigned to you for review show the revision, changes summary, and previous version for comparison. Approve, return for amendment, or escalate as required.

## Checking Open CAPAs

Your assigned corrective and preventive actions appear at **Quality → CAPAs → My Actions**. Each item shows priority, due date, and the linked NCR or audit finding. Update progress, upload evidence, and mark actions complete as you work through them.

## Quality Dashboard KPIs

The dashboard shows:
- **Defect Rate** (PPM — parts per million)
- **Customer Complaint Rate** (complaints per period)
- **CAPA Closure Rate** (% closed within target)
- **First Pass Yield** (% of output meeting spec first time)
- Open NCRs by severity and by department

Review these daily or weekly with your quality team to identify trends and prioritise actions.
`,
  },
  {
    id: 'KB-DD1-018',
    title: 'Quality Management Administrator Configuration Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['quality', 'iso-9001', 'administration', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Quality Management Administrator Configuration Guide

## Overview

This guide covers the initial setup and ongoing administration of the Quality Management module. Access the configuration panel at **Settings → Quality → Configuration**.

## Step 1: Quality Categories

Define the categories used to classify non-conformances at **Settings → Quality → NCR Categories**:
- Product quality (incoming material, in-process, finished goods)
- Process quality (method deviations, equipment failures)
- System quality (procedure gaps, audit findings)
- Customer quality (complaints, warranty returns)

## Step 2: NCR Severity Levels and Escalation

Configure severity definitions and escalation rules at **Settings → Quality → NCR Severity**. For Critical NCRs, configure immediate notification to the Quality Manager and relevant operations manager. Set response time SLAs for each severity level.

## Step 3: CAPA Workflow

Set up the CAPA workflow stages at **Settings → Quality → CAPA Workflow**:
1. **Identification** — NCR or audit finding raises CAPA requirement
2. **Root Cause Analysis** — assigned investigator completes RCA
3. **Action Planning** — corrective actions defined with owners and due dates
4. **Implementation** — actions completed and evidence uploaded
5. **Effectiveness Verification** — verifier confirms the root cause is resolved
6. **Closure** — quality manager approves closure

## Step 4: Document Control Settings

At **Settings → Quality → Document Control**, configure:
- Document review cycles by document type (procedures: annual, work instructions: bi-annual)
- Approval levels required (single approver, dual approval, management sign-off)
- Distribution list defaults for document notification

## Step 5: Quality Objectives Configuration

Set up quality objectives at **Settings → Quality → Objectives**. Link each objective to a KPI metric (defect rate, complaint rate, CAPA closure rate) with a quantified target and measurement frequency.

## Step 6: Customer Satisfaction Surveys

Configure survey templates and distribution settings at **Settings → Quality → Customer Satisfaction**. Set up automatic survey triggers based on transaction completion, contract milestones, or calendar frequency.
`,
  },
  {
    id: 'KB-DD1-019',
    title: 'Quality Reporting & KPI Dashboard Guide',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['quality', 'iso-9001', 'reporting', 'kpi', 'dashboard'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Quality Reporting & KPI Dashboard Guide

## Overview

The Quality module reporting suite provides comprehensive visibility into your quality management system performance. Access all reports via **Quality → Reports**.

## Key Quality KPIs

| KPI | Description |
|---|---|
| Defect Rate (PPM) | Defective units per million produced |
| Customer Complaint Rate | Complaints per 1,000 deliveries or transactions |
| CAPA Closure Rate | Percentage of CAPAs closed within target timeframe |
| First Pass Yield | Percentage of output meeting specification first time |
| Cost of Quality | Prevention + appraisal + internal failure + external failure costs |
| NCR Repeat Rate | Percentage of NCRs with the same root cause recurring |

## Built-In Reports

- **NCR Summary Report**: All non-conformances by type, severity, location, and resolution status
- **CAPA Status Report**: Open, overdue, and closed CAPAs with aging analysis
- **Customer Satisfaction Trend**: Survey scores over time, by customer segment
- **Supplier Quality Report**: Supplier NCR rate, on-time delivery, and quality scores
- **Audit Findings Summary**: Findings by clause, severity, and resolution status

## Creating a Management Review Quality Report

Navigate to **Quality → Reports → Management Review Pack**. The system compiles all required ISO 9001 management review inputs including objectives performance, NCR and CAPA data, customer satisfaction results, audit findings, and process performance metrics.

## Real-Time Dashboard Configuration

Customise your quality dashboard at **Quality → Dashboard → Configure**. Add, remove, and rearrange KPI widgets. Set alert thresholds — widgets change colour (green/amber/red) based on performance against target.

## Scheduled Quality Reports

Set up automated report delivery at **Quality → Reports → Scheduled Reports**. Choose frequency (weekly, monthly), format (PDF or Excel), and distribution list. Weekly quality summaries for operations managers and monthly board-level reports are common configurations.

## Benchmarking Against Targets

Every KPI widget shows the current value, target, and trend arrow. Drill down on any KPI to see the underlying data, time series chart, and period-on-period comparison to identify whether performance is improving or deteriorating.
`,
  },
  {
    id: 'KB-DD1-020',
    title: 'Quality Management Best Practices (ISO 9001)',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['quality', 'iso-9001', 'best-practices', 'qms'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Quality Management Best Practices (ISO 9001)

## Overview

ISO 9001:2015 is built on seven quality management principles: customer focus, leadership, engagement of people, process approach, improvement, evidence-based decision making, and relationship management. This guide translates those principles into practical actions in IMS.

## Clause Alignment in IMS

- **Clause 4 (Context)**: Document interested parties and issues in the quality objectives and risk register.
- **Clause 6 (Planning)**: Risks and opportunities are assessed in the quality risk register, feeding into quality objectives.
- **Clause 8 (Operations)**: Process controls, product requirements, and supplier management are configured in Quality.
- **Clause 9 (Evaluation)**: KPI dashboard, customer satisfaction data, and internal audit results provide performance data.
- **Clause 10 (Improvement)**: NCRs, CAPAs, and management review drive continual improvement.

## Effective Root Cause Analysis

IMS CAPA records support multiple RCA methods:
- **5 Whys**: guided prompts to drill down to the root cause
- **Fishbone (Ishikawa)**: categorise causes under people, process, equipment, materials, environment, management
- **Fault Tree Analysis**: for complex multi-cause failures

Always verify the root cause addresses the systemic issue, not just the immediate symptom.

## Keeping Your CAPA System Lean

Avoid CAPA overload by reserving CAPAs for issues requiring systemic action. Minor, one-off issues can be handled as immediate corrections recorded on the NCR without a formal CAPA. Use severity levels to filter which NCRs automatically trigger CAPAs.

## Internal Audit Programme

Plan a risk-based audit schedule at the start of each year. Higher-risk processes and areas with repeat NCRs should be audited more frequently. Use **Audit Management → Audit Plan → New Annual Schedule** to build and maintain your programme.

## Continual Improvement

Use quality objectives to drive measurable improvement. Set challenging but achievable targets, review progress monthly, and escalate any objective that is off-track more than 20% from target. Document all improvement actions in the CAPA system.
`,
  },
  {
    id: 'KB-DD1-021',
    title: 'Quality Management Troubleshooting Guide',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['quality', 'iso-9001', 'troubleshooting', 'support'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Quality Management Troubleshooting Guide

## Overview

This guide addresses the most common issues encountered in the Quality Management module and provides step-by-step resolutions.

## Issue: NCR Approval Workflow Not Progressing

**Symptom**: An NCR submitted for review has no response from the approver.

**Resolution**:
1. Open the NCR and check the **Workflow History** tab to identify the current approver.
2. Confirm the approver has an active IMS account with the correct quality role.
3. Check the approver's notification preferences at **Settings → Users → [Approver] → Notifications** to ensure email notifications are enabled.
4. Use **Actions → Reassign Approver** to redirect the NCR to an alternate approver if needed.

## Issue: CAPA Not Linking to Original NCR

**Resolution**: Open the CAPA record and use **Actions → Link Source Record** to manually link the NCR. If the NCR was created before the CAPA, the link must be made manually. Going forward, creating a CAPA directly from an NCR via **NCR → Actions → Raise CAPA** establishes the link automatically.

## Issue: Customer Satisfaction Survey Emails Not Being Sent

**Resolution**:
1. Navigate to **Settings → Quality → Customer Satisfaction → Email Logs** to check for delivery failures.
2. Verify the customer contact email is recorded in the CRM module and the Quality-CRM integration is enabled.
3. Confirm the survey distribution rule is active at **Quality → Customer Satisfaction → Distribution Rules**.

## Issue: Document Not Available in the Correct Revision

**Resolution**: Check the document status at **Quality → Documents**. If the latest revision is in 'Review' or 'Draft' status, only the previously published version is visible to standard users. Administrators can view all revisions.

## Issue: Quality Objectives Not Showing Progress Updates

**Resolution**: Navigate to **Quality → Objectives → [Objective] → Data Linkage** and verify the correct KPI metric is linked. For manual objectives, progress must be updated by the objective owner each reporting period.

## User Permissions: Who Can Raise vs Approve an NCR

- **Quality Employee**: can raise an NCR, cannot approve
- **Quality Officer**: can raise, review, and approve Minor NCRs
- **Quality Manager**: can approve all NCR severity levels and close CAPAs

Adjust roles at **Settings → Users → Role Assignment**.
`,
  },
  {
    id: 'KB-DD1-022',
    title: 'Connecting Quality with Documents, Audits & Complaints',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['quality', 'iso-9001', 'integrations', 'cross-module', 'document-control'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Connecting Quality with Documents, Audits & Complaints

## Overview

Quality management effectiveness depends on seamless integration with document control, audit management, complaint handling, and other operational modules. This guide explains the key cross-module connections available in IMS.

## Quality ↔ Document Control

Quality procedures, work instructions, and quality plans are stored in Document Control and linked directly to quality process records. When a procedure is revised, any NCRs or CAPAs that reference it are flagged for review. Enable at **Settings → Integrations → Quality → Document Control**.

## Quality ↔ Audit Management

Internal and external quality audit findings are created in the Audit Management module and automatically generate CAPAs in the Quality module. Audit findings can be linked to specific NCRs, process risks, or quality objectives. This creates a closed-loop between audit findings and corrective action.

## Quality ↔ Complaints Module

Customer complaints received in the Complaints module (port 3036) automatically create NCRs in the Quality module with pre-populated customer and product data. The complaint status updates as the NCR and CAPA progress, providing the customer-facing team with real-time resolution visibility.

## Quality ↔ Supplier Management

Supplier NCRs (for incoming material failures) are linked to supplier records in the Supplier Management module. The supplier's quality score in the evaluation module is automatically updated based on NCR frequency and severity. Enable at **Settings → Integrations → Quality → Supplier Management**.

## Quality ↔ Training

Competency requirements for quality roles (e.g. calibration technician, internal auditor) are maintained in the Quality module and pushed to the Training module as mandatory training plans. Training compliance is visible on the Quality dashboard.

## Quality ↔ H&S

Where NCRs have safety implications (e.g. a product defect that could cause injury), the CAPA system can be used across modules. CAPAs can be cross-referenced in both Quality and H&S.

## Configuring Cross-Module Links

All integration toggles are managed at **Settings → Quality → Integration Settings**. Data field mapping between modules can be customised for your organisation's terminology.
`,
  },
  {
    id: 'KB-DD1-023',
    title: 'ISO 9001 Compliance & Audit Readiness',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['quality', 'iso-9001', 'compliance', 'audit', 'certification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# ISO 9001 Compliance & Audit Readiness

## Overview

ISO 9001:2015 certification requires organised evidence of a functioning QMS. IMS streamlines audit preparation through structured records, evidence packs, and role-based access for external auditors.

## ISO 9001:2015 Certification Checklist

### Required Records
- [ ] **Quality Policy** — published, signed by top management, communicated to all personnel
- [ ] **Quality Objectives** — documented, measurable, with progress records
- [ ] **NCR Log** — all non-conformances recorded with containment, root cause, and resolution
- [ ] **CAPA Register** — open and closed CAPAs with effectiveness verification
- [ ] **Internal Audit Records** — programme plan and individual audit reports
- [ ] **Management Review Minutes** — covering all ISO 9001 required inputs
- [ ] **Calibration Records** — all monitoring and measuring equipment with calibration status
- [ ] **Competency Records** — training and qualification records for quality-critical roles
- [ ] **Customer Satisfaction Data** — survey results and trend analysis
- [ ] **Supplier Evaluation Records** — approved supplier list and evaluation history

## Stage 1 vs Stage 2 Audit

- **Stage 1 (Documentation Review)**: The certification body reviews your documented QMS. Ensure all required documented information is complete in IMS before the Stage 1 date.
- **Stage 2 (Implementation Audit)**: Auditors verify that the QMS is operating as documented. Ensure all staff can demonstrate using IMS for their quality activities.

## Evidence Pack Generation

Navigate to **Quality → Reports → Audit Evidence Pack** to generate a comprehensive, structured package of all QMS records for the audit period. Select the scope, date range, and record types to include.

## Common ISO 9001 Non-Conformances

- Quality objectives without measurable targets or monitoring evidence
- CAPAs without effectiveness verification before closure
- Calibration records incomplete or expired
- Internal audit programme not covering all QMS processes
- Customer satisfaction data not reviewed in management review

## Maintaining Certification: Surveillance Audit Preparation

Surveillance audits occur annually. Maintain a continuous state of readiness by running quarterly self-assessments using **Quality → Reports → Internal Compliance Check**.
`,
  },
  {
    id: 'KB-DD1-024',
    title: 'Non-Conformance & CAPA Workflow Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['quality', 'iso-9001', 'ncr', 'capa', 'corrective-action'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Non-Conformance & CAPA Workflow Guide

## Overview

The NCR-to-CAPA workflow is the core quality improvement engine in IMS. This guide walks through the complete process from raising an NCR to closing a CAPA with verified effectiveness.

## Step 1: Raise an NCR

Navigate to **Quality → NCRs → New**. Complete the required fields:
- Classification (product, process, system, customer)
- Severity (Minor, Major, Critical)
- Affected product or process
- Date detected, location, and description
- Evidence files (photos, test reports, inspection records)

## Step 2: Immediate Containment

Record the immediate containment action taken to prevent further defective output from reaching the customer. This is a mandatory field for Major and Critical NCRs. Containment examples: quarantining stock, stopping the production line, issuing a customer hold notification.

## Step 3: Assign for Investigation

Submit the NCR for investigation via **Actions → Assign for Investigation**. Assign a responsible investigator and set a root cause analysis due date.

## Step 4: Root Cause Analysis

The investigator completes the RCA using one of the available methods (5 Whys, Fishbone, Fault Tree). The root cause must be a systemic failure, not just the immediate defect.

## Step 5: Create a CAPA

From the NCR record, click **Actions → Raise CAPA**. The CAPA is pre-populated with the NCR reference, root cause, and affected area. Define corrective actions with owners, due dates, and required evidence.

## Step 6: CAPA Implementation

As each action is completed, the owner uploads evidence and marks the action complete. The CAPA progress bar updates in real time.

## Step 7: Effectiveness Verification

After all actions are complete, the designated verifier reviews the evidence and confirms the root cause has been eliminated. If the issue has recurred, the CAPA is returned for further analysis.

## Step 8: Close the NCR

Once the CAPA is verified and closed, the quality manager approves NCR closure. The record is archived and included in NCR metrics for trend analysis.

## NCR Metrics

Track cycle time (days from detection to closure), repeat rate (same root cause recurring), and NCR distribution by category and department at **Quality → Reports → NCR Analytics**.
`,
  },
  {
    id: 'KB-DD1-025',
    title: 'HR Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['hr', 'people-management', 'user-guide', 'daily-tasks'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# HR Day-to-Day User Guide

## Overview

The HR module (port 3006) is the central system for all people management activities. This guide covers daily tasks for employees, managers, and HR team members.

## Employee Self-Service

Employees access their personal HR portal via **HR → My Profile**. Available self-service actions include:
- **View and update personal details** (contact information, emergency contacts, bank details)
- **Request leave**: click **Leave → New Request**, select type and dates, add a note, and submit to your manager for approval
- **Access payslips**: navigate to **Payroll → My Payslips** to view and download current and historical payslips
- **View training records and upcoming mandatory training**
- **View your leave balances and accruals**

## Manager Tasks

Managers access their team HR view via **HR → My Team**. Daily manager tasks include:
- **Approving leave requests**: notifications appear in the dashboard; click to review and approve or decline
- **Reviewing timesheets**: navigate to **HR → Timesheets → Pending Approval**
- **Checking training compliance**: view team members with overdue mandatory training
- **Adding performance notes**: click any employee → **Performance → Add Note** to record observations throughout the year

## HR Team Daily Activities

The HR team dashboard at **HR → Dashboard** shows:
- Today's new starters and leavers
- Leave requests awaiting HR approval
- Probation end dates in the next 30 days
- Contract expiries in the next 60 days
- Upcoming performance reviews

## HR Dashboard KPIs

The dashboard displays:
- **Total headcount** by department and employment type
- **Turnover rate** (monthly and trailing 12 months)
- **Leave balance average** across the organisation
- **Training compliance rate** for mandatory programmes
- **Open recruitment positions**
`,
  },
  {
    id: 'KB-DD1-026',
    title: 'HR Administrator Configuration Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['hr', 'people-management', 'administration', 'configuration'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# HR Administrator Configuration Guide

## Overview

This guide covers the initial setup and ongoing administration of the HR module. HR Administrator access is required — navigate to **Settings → HR → Configuration**.

## Step 1: Organisational Structure

Set up your organisation hierarchy at **Settings → HR → Organisation Structure**:
- **Departments**: create a hierarchical department tree (e.g. Operations → Manufacturing → Assembly)
- **Job Titles**: define the full job title library used across the organisation
- **Locations/Sites**: physical office and site locations for headcount reporting
- **Cost Centres**: map cost centres for payroll and budgeting integration

## Step 2: Leave Types Configuration

Configure leave types at **Settings → HR → Leave Types**. For each leave type, define:
- Maximum annual entitlement (days or hours)
- Accrual method (annual grant, monthly accrual, pro-rata for part-time)
- Carry-over rules (max days, expiry date for carried-over leave)
- Whether medical certificate is required (e.g. sick leave >3 days)
- Approval required (manager, HR, or auto-approved)

Standard leave types to configure: Annual, Sick, Parental (Maternity/Paternity), TOIL, Study Leave, Compassionate, and Unpaid.

## Step 3: Employment Types

Define employment types at **Settings → HR → Employment Types**: Full-time, Part-time, Fixed-term, Casual, and Contractor. Each type can have different entitlement rules applied automatically.

## Step 4: Custom Fields

Add organisation-specific employee data fields at **Settings → HR → Custom Fields**. Common custom fields include: employee number format, security clearance level, vehicle registration, and professional memberships.

## Step 5: Notification Rules

Configure automated notifications at **Settings → HR → Notifications** for:
- Probation end dates (notify manager and HR 30 days before)
- Contract expiry dates (notify HR 60 days before)
- Right-to-work document expiry (notify HR 90 days before)
- Mandatory training overdue (notify employee and manager)

## Step 6: Module Integrations

Enable Payroll and Training integrations at **Settings → Integrations → HR** to ensure employee data flows automatically between modules without duplicate entry.
`,
  },
  {
    id: 'KB-DD1-027',
    title: 'HR Reporting & Analytics Guide',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['hr', 'people-management', 'reporting', 'analytics', 'workforce'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# HR Reporting & Analytics Guide

## Overview

The HR module provides a comprehensive people analytics suite to support workforce planning, compliance reporting, and management decision-making. Access reports at **HR → Reports**.

## Key HR Metrics

| Metric | Description |
|---|---|
| Headcount | Total employees by department, location, employment type |
| Turnover Rate | Monthly and annual voluntary/involuntary leavers ÷ average headcount |
| Absenteeism Rate | Total absence days ÷ scheduled working days × 100 |
| Time-to-Hire | Days from vacancy posted to offer accepted (from Recruitment module) |
| Training Compliance | Percentage of employees with all mandatory training current |
| Average Tenure | Mean years of service across the organisation |

## Built-In Reports

- **Employee Directory**: Full list with contact details, role, department, and employment status
- **Leave Summary**: Leave taken vs entitlement by employee and leave type for the period
- **Headcount History**: Monthly headcount trend with starters and leavers breakdown
- **Organisation Chart Export**: PDF org chart for presentations and management review
- **Skills Matrix**: Employee vs competency/qualification grid

## Workforce Analytics

Navigate to **HR → Analytics** for advanced workforce insights:
- **Age Distribution**: population pyramid by department
- **Tenure Distribution**: years-of-service histogram
- **Gender and Diversity Metrics**: representation by level and department
- **Attrition Risk Model**: identify employees at risk based on engagement and performance signals

## Custom Report Builder

At **HR → Reports → New Custom Report**, select any combination of HR fields (personal data, leave, performance, training, contracts) and apply filters (department, location, employment type, date range). Save reports for repeated use.

## Compliance Reports

Critical compliance reports accessible from **HR → Reports → Compliance**:
- **Certifications Expiring**: employees with professional certifications or right-to-work documents expiring in the next 90 days
- **Mandatory Training Overdue**: employees who have not completed required training by due date
- **Probation Review Due**: employees approaching probation review date
`,
  },
  {
    id: 'KB-DD1-028',
    title: 'HR Best Practices',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['hr', 'people-management', 'best-practices', 'workforce-management'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# HR Best Practices

## Overview

Effective people management requires consistent processes, accurate data, and clear communication. This guide outlines best practices for getting the most from the IMS HR module.

## Maintaining Accurate Employee Records

Run a quarterly data quality review: navigate to **HR → Reports → Data Quality Audit** to identify records with missing mandatory fields (e.g. emergency contact, job title, start date). Inaccurate data in HR creates downstream errors in payroll, training assignments, and compliance reporting.

## Effective Onboarding

Use the IMS onboarding checklist feature (**HR → Onboarding → New Hire Checklist**) to ensure every new employee completes all required steps: IT setup, policy acknowledgements, mandatory induction training, workplace safety orientation, and benefits enrolment. Assign checklist tasks to the new employee, their manager, and the HR team respectively.

## Performance Management Cadence

Establish a structured performance management cycle:
- **Monthly**: 1:1 conversations — record notes in HR → Performance → Conversations
- **Quarterly**: progress review against goals — update goal status in IMS
- **Annual**: formal performance appraisal — complete the appraisal template in **HR → Performance → Appraisals**

## Leave Management

Apply leave policies consistently using the IMS approval workflow. Ensure all leave — including informal arrangements — is recorded in IMS to maintain accurate balances and prevent compliance risks.

## Succession Planning

Use the Skills Matrix (**HR → Analytics → Skills Matrix**) to identify capability gaps in critical roles. Tag employees with high succession potential and document development plans in their performance records.

## Data Privacy and GDPR

HR data is sensitive personal data. Ensure:
- Access to employee records is restricted to authorised roles only
- Data retention policies are configured in **Settings → HR → Data Retention**
- The HR audit trail is reviewed regularly for unauthorised access

## Offboarding Checklist

Use **HR → Offboarding → New Leaver Checklist** when an employee leaves. Key steps: IT access revocation, equipment return, final payroll calculation, reference letter, and exit interview recording.
`,
  },
  {
    id: 'KB-DD1-029',
    title: 'HR Troubleshooting Guide',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['hr', 'people-management', 'troubleshooting', 'support'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# HR Troubleshooting Guide

## Overview

This guide addresses the most common issues encountered in the HR module with step-by-step resolutions.

## Issue: Employee Not Appearing in Module Assignments

**Symptom**: A user is not visible in the assignment dropdown in another module (e.g. H&S, Quality).

**Resolution**:
1. Confirm the employee has an active IMS user account at **Settings → Users**.
2. Verify the employee's status in HR is 'Active' (not 'On Leave', 'Suspended', or 'Terminated').
3. Check that the user has the correct role for the module in question.

## Issue: Leave Balance Incorrect After Policy Change

**Resolution**: Navigate to **HR → Leave → Recalculate Balances**. Select the affected leave type and run the recalculation. This re-applies the current policy rules to all active employee leave records. Contact your HR Administrator if balances remain incorrect after recalculation.

## Issue: Performance Review Not Sent to Manager for Approval

**Resolution**:
1. Open the performance review record and check its status — it must be 'Submitted' for the notification to fire.
2. Verify the employee's correct manager is recorded on their HR profile (**HR → Employees → [Employee] → Reporting Line**).
3. Check notification delivery at **Settings → Notifications → Email Logs**.

## Issue: Training Module Not Showing HR-Assigned Training Plans

**Resolution**: Verify the HR-Training integration is enabled at **Settings → Integrations → HR → Training**. Training plans assigned via HR job title mapping may take up to 15 minutes to propagate after the integration sync runs.

## Issue: Payroll Integration — Employee Data Not Syncing

**Resolution**: Check the sync log at **Settings → Integrations → Payroll → Sync Log**. Common causes include: employee record missing mandatory payroll fields (pay grade, bank details, tax file number), or a field format mismatch (date format, name casing).

## Issue: Bulk Import Errors

**Resolution**: Download the current import template from **HR → Employees → Import → Download Template**. Verify that all mandatory columns are populated, dates use YYYY-MM-DD format, and employment type values exactly match the configured types (case-sensitive).
`,
  },
  {
    id: 'KB-DD1-030',
    title: 'Connecting HR with Payroll, Training & Workflows',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['hr', 'people-management', 'integrations', 'payroll', 'training', 'cross-module'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Connecting HR with Payroll, Training & Workflows

## Overview

HR is the master source of employee data in IMS. Its integrations with Payroll, Training, Workflows, and other modules ensure data consistency and automate key people management processes across the system.

## HR ↔ Payroll

The HR-Payroll integration (configured at **Settings → Integrations → HR → Payroll**) synchronises:
- Employee personal details, bank account, and tax information
- Salary and pay grade changes (effective-dated)
- Leave balances and leave taken for payroll processing
- Employment start and end dates for final pay calculations

Any change to remuneration in HR automatically updates the payroll run for the current period.

## HR ↔ Training

When a new employee is added or a job title is changed in HR, the Training module automatically assigns the mandatory training plan associated with that job title. Training completions and certificate expiry dates feed back into the HR Skills Matrix and compliance reports.

Enable at **Settings → Integrations → HR → Training**.

## HR ↔ Workflows

The Workflows module (port 3008) automates onboarding and offboarding processes triggered by HR events:
- **New starter** → triggers IT provisioning, welcome email, policy acknowledgement, induction training assignment
- **Leaver** → triggers IT access removal checklist, equipment return, payroll finalisation

Configure workflow triggers at **Settings → Integrations → HR → Workflows**.

## HR ↔ Health & Safety

Employee safety certifications (e.g. first aid, forklift licence, confined space) are tracked in the H&S module's competency register. The HR Skills Matrix shows these certifications alongside other qualifications, providing a single view of employee capability and compliance.

## HR ↔ Document Control

Policy documents published in Document Control can be pushed to employees for acknowledgement via **HR → Policy Acknowledgement**. Completion is recorded in the employee's HR record with a timestamp, providing audit evidence of policy communication.

## HR ↔ Audit Management

HR compliance audits (right-to-work, working time, equal opportunity) are scheduled in Audit Management. Findings link to HR records and generate corrective actions managed through the HR module.
`,
  },
  {
    id: 'KB-DD1-031',
    title: 'HR Compliance & Employment Law Readiness',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['hr', 'people-management', 'compliance', 'employment-law', 'gdpr'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# HR Compliance & Employment Law Readiness

## Overview

HR compliance spans employment law, data protection, equal opportunity, and working time regulations. IMS HR provides the records and audit trail needed to demonstrate compliance across all these areas.

## Right to Work Documentation

The Right to Work register is managed at **HR → Compliance → Right to Work**. For each employee, record:
- Document type (passport, visa, work permit)
- Document expiry date
- Verification date and verifying officer

Automated alerts notify HR 90, 60, and 30 days before document expiry, allowing timely renewal before the employee loses their right to work.

## Working Time Regulations

Configure maximum working hour alerts at **Settings → HR → Working Time**. The system tracks contracted hours, overtime, and rest periods. Alerts fire when an employee is scheduled beyond the legal weekly hour limit or has insufficient rest between shifts.

## Equal Opportunity Monitoring

Navigate to **HR → Analytics → Diversity & Inclusion** to access the equal opportunity dashboard. Monitor gender, age, and (where legally permitted and voluntarily disclosed) ethnicity representation by department and management level. This data supports your equal opportunity reporting obligations.

## Grievance and Disciplinary Records

All grievance and disciplinary case records are stored at **HR → Compliance → Grievance & Disciplinary**. Each case includes the allegation, investigation steps, outcome, and any appeal. Access is restricted to HR Managers and above.

## GDPR and Data Protection

Configure employee data retention policies at **Settings → HR → Data Retention**. Set how long different record types are kept after employee departure (e.g. payroll records: 7 years; disciplinary records: 6 years; recruitment records: 1 year). The system automatically flags records for deletion review when the retention period expires.

## Audit Trail

Every change to an HR record — including who made the change, what was changed, and when — is logged in the immutable HR audit trail at **HR → Audit Trail**. This is essential for responding to subject access requests and regulatory investigations.
`,
  },
  {
    id: 'KB-DD1-032',
    title: 'Performance Management Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['hr', 'people-management', 'performance-management', 'appraisals'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Performance Management Guide

## Overview

A structured performance management process drives employee engagement and organisational effectiveness. IMS HR provides a complete performance management workflow from goal setting to annual appraisal.

## Step 1: Set Up the Review Cycle

Navigate to **HR → Performance → Review Cycles → New**. Configure:
- Cycle name (e.g. '2026 Annual Performance Review')
- Review type: Annual, Bi-Annual, or Quarterly
- Review period start and end dates
- Self-assessment due date, manager review due date, and sign-off date
- Who participates (all employees, specific departments, or individual roles)

## Step 2: Create Performance Review Templates

Build review templates at **HR → Performance → Templates → New**. Include:
- **Competency ratings**: organisation-defined competencies rated on a 1–5 or 1–4 scale
- **Goal achievement**: progress against individual SMART goals
- **Development feedback**: open-text comments on strengths and development areas
- **Overall rating**: summary performance rating (e.g. Exceeds, Meets, Below Expectations)

## Step 3: Goal Setting

At the start of each cycle, managers and employees collaborate on SMART goals at **HR → Performance → Goals**. Goals can be linked to department objectives and organisation-level strategic goals for alignment visibility.

## Step 4: 360-Degree Feedback (Optional)

Enable 360 feedback at **Settings → HR → Performance → 360 Feedback**. Configure peer reviewers and optional self-assessment. The system aggregates ratings and presents a blinded summary to the employee's manager.

## Step 5: Performance Improvement Plans (PIPs)

For employees not meeting performance expectations, create a PIP at **HR → Performance → PIPs → New**. Define improvement objectives, support provided, timeline, and review checkpoints. PIP progress is tracked and reviewed at each checkpoint.

## Step 6: Calibration Sessions

Use **HR → Performance → Calibration** to compare ratings across teams and ensure consistency. HR Managers can view all ratings by department and flag outliers for discussion in calibration meetings.

## Performance Analytics

View organisation-wide performance trends at **HR → Analytics → Performance**. Identify top performers, development needs, and departments where performance is declining. Use this data to inform talent planning decisions.
`,
  },
  {
    id: 'KB-DD1-033',
    title: 'Finance Day-to-Day User Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['finance', 'accounting', 'user-guide', 'daily-tasks'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Finance Day-to-Day User Guide

## Overview

The Finance module (port 3013) provides a complete financial management platform including general ledger, accounts payable, accounts receivable, budgeting, and financial reporting. This guide covers daily tasks for finance team members.

## Getting Started

Navigate to **Dashboard → Finance → Overview**. The finance overview shows your cash position, accounts receivable balance and ageing, accounts payable balance, and today's outstanding approvals.

## Daily Finance Tasks

### Reviewing and Approving Invoices
Navigate to **Finance → Accounts Payable → Invoices → Pending Approval**. Review each invoice against the purchase order (3-way matching: PO quantity, receipt quantity, and invoice quantity). Approve or return for query.

### Creating an Invoice (Accounts Receivable)
1. Go to **Finance → Accounts Receivable → New Invoice**.
2. Select the customer, billing address, and payment terms.
3. Add line items (product/service, quantity, unit price, tax code).
4. The system calculates totals and applies the configured tax rules automatically.
5. Approve and send to the customer via the system (PDF email delivery).

### Recording a Payment
Navigate to **Finance → Cash → Record Payment**. Select the invoice, enter the payment date, amount, payment method, and bank account. The system updates the invoice status and the AR balance.

### Submitting an Expense Claim
Employees submit expenses at **Finance → Expenses → New Claim**. Upload receipts, categorise each line, and submit for manager approval. Approved expenses flow automatically into the payroll module for reimbursement.

## Finance Dashboard KPIs

The dashboard shows:
- **DSO** (Days Sales Outstanding) — average debtor collection period
- **DPO** (Days Payable Outstanding) — average creditor payment period
- **Current Ratio** — current assets ÷ current liabilities
- **Operating Margin** — operating profit ÷ revenue
- **Cash Balance** by bank account
`,
  },
  {
    id: 'KB-DD1-034',
    title: 'Finance Administrator Configuration Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['finance', 'accounting', 'administration', 'configuration', 'chart-of-accounts'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Finance Administrator Configuration Guide

## Overview

Setting up the Finance module correctly from the outset is critical for data integrity and reporting accuracy. This guide covers initial configuration for Finance Administrators. Access the configuration panel at **Settings → Finance → Configuration**.

## Step 1: Chart of Accounts

Build your chart of accounts at **Finance → Chart of Accounts → Configure**. Define account codes and types:
- **Assets** (1000–1999): current assets, fixed assets, depreciation
- **Liabilities** (2000–2999): current liabilities, long-term debt, tax liabilities
- **Equity** (3000–3999): share capital, retained earnings
- **Income** (4000–4999): revenue by product/service line
- **Expenses** (5000–5999): cost of goods sold, operating expenses, payroll costs

Import an existing chart of accounts using the Excel template at **Finance → Chart of Accounts → Import**.

## Step 2: Tax Configuration

Configure tax rates and rules at **Settings → Finance → Tax Engine**. For each jurisdiction in which you operate:
- Define applicable tax types (VAT, GST, Sales Tax, withholding tax)
- Set rates and effective dates
- Configure tax codes to apply to account lines automatically
- Enable jurisdiction-specific tax calculation rules

The IMS Tax Engine supports multi-jurisdiction tax calculation automatically.

## Step 3: Multi-Currency Setup

Enable multi-currency at **Settings → Finance → Currency**. Set your base currency, then add all trading currencies. Configure automatic exchange rate updates (daily from ECB or custom rate source) or manual rate entry.

## Step 4: Approval Workflows

Define invoice and payment approval thresholds at **Settings → Finance → Approval Workflows**:
- Invoices under $5,000: single approver (line manager)
- Invoices $5,000–$50,000: dual approval (line manager + Finance Manager)
- Invoices over $50,000: Board-level approval required

## Step 5: Financial Year and Period Configuration

Set your financial year start date and period structure (monthly, 4-4-5, or 13-period) at **Settings → Finance → Financial Year**. Lock closed periods to prevent retrospective posting.

## Step 6: Module Integrations

Enable integrations with Payroll (salary cost postings), Inventory (COGS and purchase orders), and Contracts (billing milestones and revenue recognition) at **Settings → Finance → Integration Settings**.
`,
  },
  {
    id: 'KB-DD1-035',
    title: 'Finance Reporting & Financial Analytics Guide',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['finance', 'accounting', 'reporting', 'financial-statements', 'analytics'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Finance Reporting & Financial Analytics Guide

## Overview

The Finance module includes a comprehensive suite of financial reports and an analytics dashboard for management, board, and regulatory reporting. Access all financial reports at **Finance → Reports**.

## Key Financial Statements

| Report | Description |
|---|---|
| Profit & Loss | Revenue, cost of sales, gross profit, operating expenses, and net profit by period |
| Balance Sheet | Assets, liabilities, and equity at a point in time |
| Cash Flow Statement | Operating, investing, and financing cash flows |
| Trial Balance | All account balances for a selected period |
| AR Ageing Report | Outstanding receivables by age bucket (0–30, 31–60, 61–90, 90+ days) |
| AP Ageing Report | Outstanding payables by age bucket and supplier |

## Budget vs Actual Report

Navigate to **Finance → Reports → Budget vs Actual**. This report shows:
- Budget allocation by account, cost centre, or department
- Actual expenditure to date
- Variance (absolute and percentage)
- Percentage of budget consumed vs percentage of year elapsed

Filter by department, cost centre, period, and account range.

## Multi-Period Comparison

Compare financial performance across periods at **Finance → Reports → Period Comparison**. Select the current period and up to 5 prior periods. View month-on-month or year-on-year changes in revenue, costs, and margins.

## Consolidated Reporting

For multi-site or multi-entity organisations, generate consolidated financial statements at **Finance → Reports → Consolidated P&L** and **Consolidated Balance Sheet**. Inter-company eliminations must be configured at **Settings → Finance → Intercompany**.

## Financial KPI Dashboard

The CFO/Finance Manager dashboard at **Finance → Dashboard** can be configured with:
- Cash flow waterfall chart
- Revenue vs budget gauge
- Top 10 debtors by balance
- Top 10 creditors by balance
- Month-end close completion percentage

## Export and Distribution

All financial reports export in PDF, Excel (.xlsx), and CSV formats. Scheduled automated delivery to the board pack distribution list is configured at **Finance → Reports → Scheduled Reports**.
`,
  },
  {
    id: 'KB-DD1-036',
    title: 'Finance Best Practices',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['finance', 'accounting', 'best-practices', 'controls', 'month-end'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Finance Best Practices

## Overview

Sound financial management requires disciplined processes, strong internal controls, and timely reporting. This guide outlines best practices for running an effective finance function using the IMS Finance module.

## Month-End Close Checklist

Run through the following at month-end, available as a template at **Finance → Month-End → Checklist**:

1. Post all invoices and credit notes for the period
2. Reconcile all bank accounts to bank statements
3. Review and post payroll journals from the Payroll module
4. Post inventory valuation journals from the Inventory module
5. Record accruals for goods/services received but not invoiced
6. Record prepayments for expenses paid in advance
7. Run the aged debtors report and chase overdue invoices
8. Review and approve all expense claims
9. Lock the period once all postings are complete
10. Distribute the management P&L report

## Accounts Payable Management

- Take advantage of early payment discounts (check discount terms on each supplier record)
- Target a DPO (Days Payable Outstanding) that optimises cash flow without damaging supplier relationships
- Use the AP ageing report weekly to identify invoices approaching payment terms

## Cash Flow Forecasting

Maintain a 13-week rolling cash flow forecast at **Finance → Cash Flow → Forecast**. Update weekly with confirmed receipts and payments. Use scenario analysis to assess the impact of delayed customer payments or large capital expenditure.

## Internal Controls

The IMS role-based access system enforces segregation of duties:
- **Data Entry** role: can create invoices and journals, cannot approve
- **Approver** role: can approve up to their threshold, cannot create
- **Finance Manager** role: can approve all transactions, can post to all accounts
- **Auditor** role: read-only access to all financial records

Review user access quarterly at **Settings → Users → Access Review**.

## Audit Trail

Every financial transaction in IMS is immutable and carries a full audit trail: who created it, who approved it, date and time of each action, and the original values before any amendments. This is accessible at **Finance → Audit Trail** and cannot be deleted.
`,
  },
  {
    id: 'KB-DD1-037',
    title: 'Finance Troubleshooting Guide',
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['finance', 'accounting', 'troubleshooting', 'support'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Finance Troubleshooting Guide

## Overview

This guide addresses the most common issues encountered in the Finance module with step-by-step resolutions.

## Issue: Invoice Not Matching Purchase Order (3-Way Match Error)

**Symptom**: An invoice is flagged with a matching error and cannot be approved.

**Resolution**:
1. Open the invoice and click **View Match Details**.
2. The system shows the PO quantity, goods receipt quantity, and invoice quantity side by side.
3. If the invoice quantity exceeds the receipt, create a new goods receipt for the additional quantity before approving.
4. If the price differs, check the PO unit price and request a supplier credit note if incorrect.

## Issue: Tax Calculation Incorrect for a Specific Jurisdiction

**Resolution**: Navigate to **Settings → Finance → Tax Engine → [Jurisdiction]** and verify:
- The correct tax rate is active for the transaction date
- The product/service line is mapped to the correct tax code
- The customer or supplier is flagged with the correct tax treatment (taxable, exempt, zero-rated)

Run the tax recalculation for the affected invoice using **Invoice → Actions → Recalculate Tax**.

## Issue: Exchange Rate Not Updating Automatically

**Resolution**: Check the exchange rate source configuration at **Settings → Finance → Currency → Rate Source**. Verify the data feed connection is active. If using a manual rate source, ensure the rate has been entered for the current period at **Finance → Currency → Exchange Rates**.

## Issue: Budget Allocation Not Appearing in Budget vs Actual Report

**Resolution**: Open the budget at **Finance → Budget → [Budget Name]** and confirm the budget lines are in 'Approved' status. Budget lines in 'Draft' status are excluded from reports. Also verify the cost centre and account code on the budget line match exactly those used in the actual transaction.

## Issue: Bank Reconciliation — Unreconciled Transactions

**Resolution**: Navigate to **Finance → Bank Reconciliation → [Account]**. Use the **Match** function to pair bank statement lines with posted transactions. For genuine discrepancies, post a reconciliation adjustment journal with appropriate explanation. Investigate all adjustments journals monthly.

## User Permission: Who Can Post to the General Ledger

- **Finance Officer**: can create journals, cannot approve or post
- **Finance Manager**: can approve and post journals to open periods
- **CFO / Finance Director**: can post to locked periods (with audit trail entry)

Adjust at **Settings → Users → Role Assignment → Finance**.
`,
  },
  {
    id: 'KB-DD1-038',
    title: 'Connecting Finance with Payroll, Inventory & Contracts',
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['finance', 'accounting', 'integrations', 'payroll', 'inventory', 'cross-module'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Connecting Finance with Payroll, Inventory & Contracts

## Overview

Finance is the financial consolidation point for all transactional data across the IMS. Its integrations with Payroll, Inventory, Contracts, and other modules ensure all financial impacts are captured in the general ledger automatically.

## Finance ↔ Payroll

The Finance-Payroll integration posts salary journals automatically after each payroll run is approved. Configure the GL account mapping (salary expense by department, tax liabilities, superannuation/pension accruals) at **Settings → Finance → Payroll Integration**. The integration ensures payroll costs are coded to the correct cost centres without manual journal entry.

## Finance ↔ Inventory

Inventory transactions (purchase order receipts, sales order fulfilments, stock adjustments) automatically generate financial journals:
- Goods received: Debit Stock, Credit Goods Received Not Invoiced (GRNI)
- Invoice posted: Debit GRNI, Credit Accounts Payable
- Goods dispatched: Debit Cost of Goods Sold, Credit Stock

Enable and configure at **Settings → Finance → Inventory Integration**. Configure inventory valuation method (FIFO, AVCO, or Standard Cost) in the Inventory module settings.

## Finance ↔ Contracts

Contract milestones and billing schedules in the Contracts module trigger automatic invoice creation in Finance AR. Revenue recognition rules (point-in-time or over-time) are applied based on the contract type. Configure at **Settings → Finance → Contracts Integration**.

## Finance ↔ Project Management

Project budget allocations are drawn from Finance budget lines. Project cost tracking posts actuals from Finance timesheet journals and purchase orders, providing real-time project P&L visibility in both modules.

## Finance ↔ Supplier Management

Supplier invoicing terms and payment terms from Supplier Management flow into Finance AP, ensuring correct payment scheduling. Supplier credit limits and holds in Supplier Management can block invoice approval in Finance.

## Finance ↔ Asset Management

Asset additions post a capital expenditure journal in Finance. The depreciation schedule configured in Asset Management generates monthly depreciation journals automatically. Disposals post the gain or loss on disposal to the correct P&L account.

## Enabling Integrations

Manage all Finance integrations at **Settings → Finance → Integration Settings**. Each integration can be enabled independently with customisable GL account mapping.
`,
  },
  {
    id: 'KB-DD1-039',
    title: 'Finance Compliance & Audit Readiness',
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['finance', 'accounting', 'compliance', 'audit', 'internal-controls'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Finance Compliance & Audit Readiness

## Overview

Financial compliance requires a complete and accurate audit trail, robust internal controls, and well-organised documentation for external auditors and regulatory bodies. IMS Finance is designed with compliance as a core principle.

## Audit Trail

Every financial transaction in IMS — invoices, journals, payments, expense claims, budget changes — is stored with a full, immutable audit trail. Records include: who created the transaction, who approved it, the date and time of each action, and all original values before amendment.

Access the financial audit trail at **Finance → Audit Trail**. Filter by date range, user, account, or transaction type. The audit trail cannot be modified or deleted, even by system administrators.

## Segregation of Duties

IMS enforces segregation of duties through the role-based access system:
- Data entry and approval are separate roles that cannot be combined for a single user
- Approval thresholds are enforced — users cannot approve transactions above their authorised limit
- Period locking prevents retrospective posting once accounts are closed

Review your segregation of duties configuration quarterly at **Settings → Finance → Access Review**.

## Tax Compliance

The IMS Tax Engine maintains a complete calculation audit trail for every tax-bearing transaction. For VAT/GST filing support, generate the **Tax Return Preparation Report** at **Finance → Reports → Tax Compliance** for the filing period. All input and output tax postings are listed with supporting invoice references.

## Financial Statement Preparation

Use the built-in P&L, Balance Sheet, and Cash Flow Statement reports as the basis for statutory financial statements. Export to Excel for final formatting as required for your filing jurisdiction.

## Internal Audit of Financial Controls

At **Finance → Reports → Internal Controls Audit**, run the access review, approval workflow review, and period activity summary. Review these reports monthly to detect control exceptions.

## External Audit Support

Create a read-only auditor user account at **Settings → Users → New User** with the 'External Auditor' role. This provides read-only access to all financial records, reports, and the audit trail without the ability to create or modify data. Auditors can also export data directly from their read-only view.

## IFRS/GAAP Alignment

IMS Finance is designed to accommodate both IFRS and GAAP reporting requirements. Revenue recognition (IFRS 15), lease accounting (IFRS 16), and financial instrument classification (IFRS 9) can be configured at **Settings → Finance → Accounting Standards**.
`,
  },
  {
    id: 'KB-DD1-040',
    title: 'Budget Planning & Forecasting Guide',
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['finance', 'accounting', 'budgeting', 'forecasting', 'planning'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
    content: `# Budget Planning & Forecasting Guide

## Overview

The IMS Finance module provides comprehensive budget planning, rolling forecast, and variance analysis capabilities. This guide covers the complete budgeting workflow from initial creation to in-year management.

## Step 1: Create a New Budget

Navigate to **Finance → Budget → New Budget**. Define:
- Budget name (e.g. '2026 Annual Operating Budget')
- Financial year and period structure
- Budget approach: **Top-Down** (finance sets totals, departments allocate) or **Bottom-Up** (departments build upward)
- Responsible owners for each department budget section

## Step 2: Budget Structure

Define your budget structure at **Finance → Budget → Structure**:
- **Departmental budgets**: allocate by department and cost centre
- **Project budgets**: allocate by project code for capital or project expenditure
- **Capital budgets (Capex)**: separate from operating budgets, tracked to asset additions

## Step 3: Budget Allocation

Allocate budget amounts by GL account and period at **Finance → Budget → Allocate**. Spread annual totals automatically across periods using equal split, weighted seasonal profile, or manual entry. Copy prior year actuals as a starting point using **Actions → Copy from Actuals**.

## Step 4: Rolling Forecast

During the financial year, maintain a rolling forecast at **Finance → Budget → Rolling Forecast**. Update monthly with revised projections for the remainder of the year. The forecast is separate from the original budget, allowing variance analysis against both.

## Step 5: Budget vs Actual Monitoring

Monitor performance at **Finance → Reports → Budget vs Actual**. Automatic email alerts notify budget owners when spending exceeds 90% of their allocation or when variance exceeds a configured threshold.

## Step 6: Budget Approval Workflow

Submit departmental budgets for approval via **Finance → Budget → Submit for Approval**. The approval chain is:
1. Department Heads submit their sections
2. Finance Manager reviews and consolidates
3. CFO approves the consolidated budget
4. Board ratification (if configured) for the final sign-off

## Step 7: Budget Import

For large, complex organisations, use the Excel import template at **Finance → Budget → Import Template** to bulk-load budget data. The template validates account codes and cost centres against the chart of accounts on import.

## Scenario Planning

Create alternative budget scenarios at **Finance → Budget → Scenarios**. Model a base case, optimistic, and pessimistic scenario to support board-level decision making under uncertainty. Compare scenarios side-by-side in the scenario comparison report.
`,
  },
];
