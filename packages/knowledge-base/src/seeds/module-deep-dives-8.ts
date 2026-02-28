import type { KBArticle } from '../types';

export const moduleDeepDives8Articles: KBArticle[] = [
  // ─── AUTOMOTIVE MODULE (IATF 16949) ──────────────────────────────────────────
  {
    id: 'KB-DD8-001',
    title: 'Automotive Quality Module (IATF 16949) — Day-to-Day User Guide',
    content: `## Automotive Quality Module (IATF 16949) — Day-to-Day User Guide

The Automotive Quality module supports production quality staff managing compliance with IATF 16949:2016, the international standard for automotive quality management systems. This guide covers the routine tasks performed by quality technicians, engineers, and shift supervisors throughout a typical working day.

### Navigating the Automotive Module

From the main navigation, open **Automotive Quality**. The module is organised into six sections: Control Plans, FMEA, SPC, MSA, PPAP/APQP, and Reporting. The landing dashboard shows real-time quality metrics for the current shift including defect counts, SPC alarm status, and open PPAP submissions.

### Morning Startup Routine

Each shift should begin with the following checklist:

1. **Review overnight SPC alerts** — open the SPC Charts panel and check for any out-of-control signals generated on night-shift production runs. Acknowledge resolved conditions and escalate active violations to the process engineer.
2. **Check Control Plan compliance** — confirm that all planned inspection checkpoints for today's scheduled parts are staffed and that gauge calibration is current. Expired calibrations show in red on the Control Plan view.
3. **Review open defects** — the Defect Log dashboard shows defects from the previous 24 hours grouped by product family, defect type, and severity. Assign follow-up actions for any unresolved items.
4. **Check PPAP submission status** — if any parts are in active PPAP submission, review customer portal status notifications for approval updates or customer queries.

### Recording Defects

Navigate to **Defect Log > New Entry**. Required fields include part number, operation number, defect type (from the configured defect code library), quantity affected, shift, and operator ID. The system automatically calculates defects-per-million (DPM/PPM) against the production quantity for that operation.

For defects linked to a Control Plan characteristic, select the relevant characteristic from the dropdown — this pre-fills the reaction plan and escalation contacts defined in the Control Plan.

### Running PPAP Checklists

Open **PPAP/APQP > Active Submissions** and select the part. The 18-element PPAP checklist shows the completion status of each element with a traffic-light indicator. Click any element to open its evidence attachment panel. Use the checklist to track outstanding items before the Part Submission Warrant (PSW) can be generated.

### Logging MSA Results

Navigate to **MSA > Study Entry**. Select the gauge, characteristic, study type (Gauge R&R crossed, Gauge R&R nested, Attribute Agreement Analysis, Bias, Linearity), and enter appraiser results. The system calculates %GRR, number of distinct categories (NDC), and pass/fail status against your configured acceptance thresholds. Studies with %GRR above 30% are flagged automatically for corrective action.

### Tracking Control Plans

Open **Control Plans** and filter by product family or customer. Each Control Plan shows all monitored characteristics with their monitoring method, sample plan, frequency, control chart type, and reaction plan. Characteristics classified as Special (safety or regulatory) are highlighted with a diamond symbol.

### Viewing SPC Charts

Open **SPC > Live Charts**. Select the part number and characteristic to view the real-time control chart. Use the filter bar to switch between chart types (Xbar-R, I-MR, p, u). Western Electric rule violations are annotated directly on the chart. Use the **Data Entry** tab to log new subgroup measurements during the shift.

### Shift-End Reporting

Before closing the shift, complete the shift-end quality summary:

1. Navigate to **Reporting > Shift Summary**.
2. Confirm defect quantities are entered for all operations.
3. Review the auto-calculated FTQ (First-Time Quality) percentage for the shift.
4. Add any narrative notes for the incoming shift supervisor.
5. Submit the report — it is automatically distributed to the Quality Manager and logged in the audit trail.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['automotive', 'iatf-16949', 'daily-use', 'quality'],
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
    id: 'KB-DD8-002',
    title: 'Automotive Quality Module — Administrator Configuration Guide',
    content: `## Automotive Quality Module — Administrator Configuration Guide

This guide is for Quality System Administrators responsible for the initial configuration and ongoing maintenance of the IATF 16949 Automotive Quality module. Correct configuration is essential to ensure the module reflects your specific customer requirements, product families, and internal quality standards.

### Customer-Specific Requirements (CSRs)

IATF 16949 requires organisations to identify and comply with applicable Customer-Specific Requirements. Navigate to **Admin > Customer Requirements** to manage CSR libraries.

For each customer:
- Enter the customer name and customer code (used on PPAP submissions and scorecards).
- Upload the current CSR document (PDF).
- Tag each requirement to one or more IATF 16949 clauses — this enables the audit evidence mapping feature.
- Set the effective date and review interval (typically annual).

When a new CSR version is published, create a new revision and the system will notify affected PPAP submissions and Control Plan owners.

### Configuring Control Plan Templates

Navigate to **Admin > Control Plan Templates**. Templates define the standard column layout for Control Plans across your organisation.

Key configuration options:
- **Column visibility** — show or hide columns such as reaction plan, gauge ID, and measurement frequency.
- **Characteristic classification codes** — configure your organisation's codes for Special Characteristics (e.g. SC, CC, KPC, KCC) and map them to customer-specific symbols.
- **Frequency units** — define allowed inspection frequency expressions (e.g. "Every 2 hours", "Per setup", "Each piece").
- **Default reaction plans** — pre-fill standard reaction plan text for common characteristic types.

### MSA Study Type Configuration

Navigate to **Admin > MSA Settings**.

- **Study types available**: Gauge R&R (Crossed), Gauge R&R (Nested), Attribute Agreement Analysis, Bias Study, Linearity Study, Stability Study.
- **Acceptance thresholds**: Set %GRR thresholds for pass (<10%), marginal (10–30%), and fail (>30%). The AIAG MSA Manual 4th Edition defaults are pre-loaded.
- **Number of Distinct Categories (NDC)**: Set the minimum acceptable NDC (default: 5).
- **Gauge master list**: Link gauges from the Equipment Calibration module to enforce calibration status checking before MSA entry is permitted.

### Defining PPAP Submission Levels

Navigate to **Admin > PPAP Configuration**.

PPAP submission levels 1–5 map to the AIAG PPAP 4th Edition standard:
- **Level 1**: Part Submission Warrant only.
- **Level 2**: PSW with limited supporting data.
- **Level 3**: PSW with full supporting data (default for most customers).
- **Level 4**: PSW and requirements defined by the customer.
- **Level 5**: PSW and full supporting data reviewed at the supplier's manufacturing location.

For each customer, configure their default submission level. Individual PPAP submissions can override this if the customer specifies a different level for a particular part.

### Supplier Quality Codes

Navigate to **Admin > Supplier Quality Codes**. Define the defect and non-conformance codes used when logging supplier quality issues. Codes should align with your Supplier Quality Manual. Each code can be assigned a default severity rating and disposition recommendation.

### Configuring APQP Phase Gates

Navigate to **Admin > APQP Phases**. The five standard APQP phases are pre-configured:

1. Plan and Define Program
2. Product Design and Development Verification
3. Process Design and Development Verification
4. Product and Process Validation
5. Feedback, Assessment and Corrective Action

For each phase gate, configure:
- **Required deliverables** — documents and records that must be attached before the gate can be approved.
- **Approvers** — roles required to sign off the gate review (typically cross-functional team including Engineering, Quality, Manufacturing, and Purchasing).
- **Timing milestones** — target completion dates relative to the Job 1 date.

Phase gate approvals require electronic signatures and are recorded in the immutable audit trail.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['automotive', 'iatf-16949', 'admin', 'configuration'],
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
    id: 'KB-DD8-003',
    title: 'Automotive Quality Module — PPAP & APQP Management',
    content: `## Automotive Quality Module — PPAP & APQP Management

Production Part Approval Process (PPAP) and Advanced Product Quality Planning (APQP) are the two cornerstone methodologies of IATF 16949. This article explains how to manage both processes end-to-end within the IMS Automotive module.

### Creating an APQP Project

Navigate to **APQP/PPAP > New APQP Project**. Enter:

- **Part number and description** — link to the part master.
- **Customer** — pulls in the Customer-Specific Requirements for this customer.
- **Job 1 date** — production start date. The system back-calculates phase gate target dates automatically.
- **Cross-functional team** — assign team members by role. Each role receives a notification and access to the APQP workspace.

The APQP timeline view shows all five phases on a Gantt chart. Green phases are complete (all deliverables attached and gate approved). Amber phases have outstanding deliverables. Red phases are overdue.

### Tracking the 18 PPAP Elements

Within an APQP project, open the **PPAP Checklist** tab. The system tracks all 18 elements per AIAG PPAP 4th Edition:

1. Design Records, 2. Engineering Change Documents, 3. Customer Engineering Approval, 4. Design FMEA, 5. Process Flow Diagrams, 6. Process FMEA, 7. Control Plan, 8. Measurement System Analysis Studies, 9. Dimensional Results, 10. Material/Performance Test Results, 11. Initial Process Studies (SPC), 12. Qualified Laboratory Documentation, 13. Appearance Approval Report, 14. Sample Production Parts, 15. Master Sample, 16. Checking Aids, 17. Customer-Specific Requirements, 18. Part Submission Warrant.

For each element, the status is one of: **Not Started**, **In Progress**, **Complete**, **N/A** (not applicable for this submission level or part type). Attach supporting evidence directly to each element. N/A justifications require a written explanation.

### Submission Level Selection

The submission level (1–5) is set at the customer level by default but can be overridden per PPAP. The element completion requirements adjust automatically based on the selected level — elements not required at the selected level are greyed out and marked N/A.

### Customer Portal Submission

When all required elements are complete and the internal review is approved, navigate to **PPAP > Submit to Customer**. The system packages the PPAP into a structured PDF report and transmits it via the customer's preferred method:

- **IMS Customer Portal** — the customer receives a notification and can review and approve directly in their portal view.
- **Email package** — a ZIP of all evidence with a cover PSW is sent to the customer contact on file.
- **Manual upload** — for customers using their own supplier portal, the system generates an export package.

### PSW Generation and Approval Workflow

The Part Submission Warrant (PSW) is generated by navigating to **PPAP > Generate PSW**. The system pre-fills:

- Part number, revision level, and description.
- Supplier name, address, and DUNS number (from organisation settings).
- Drawing number and revision.
- Submission reason (initial submission, engineering change, etc.).
- Declaration of conformance checkboxes.

The Quality Manager reviews the draft PSW and applies an electronic signature. Upon signature, the PSW is locked and version-stamped. The signed PSW is attached to element 18 of the PPAP checklist automatically.

### Warrant Management

All signed PSWs are stored in the **Warrant Library** accessible from **PPAP > Warrants**. Filter by customer, part number, submission date, or status (Pending Customer Approval, Customer Approved, Customer Rejected, Superseded). Rejected warrants include the customer's rejection reason and link to a new PPAP revision workflow.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['automotive', 'iatf-16949', 'ppap', 'apqp'],
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
    id: 'KB-DD8-004',
    title: 'Automotive Quality Module — Control Plans & FMEA',
    content: `## Automotive Quality Module — Control Plans & FMEA

Control Plans and Process FMEAs (PFMEAs) are the technical backbone of IATF 16949 process control. The IMS Automotive module provides bidirectional linking between PFMEA actions and Control Plan characteristics, enabling traceability from risk identification through to production monitoring.

### Linking PFMEA to Control Plans

When creating or editing a Control Plan characteristic, use the **FMEA Link** field to associate it with one or more PFMEA failure mode actions. This linkage means that:

- If the PFMEA action is updated (e.g., RPN threshold action changes the monitoring requirement), the linked Control Plan characteristic is flagged for review.
- Auditors can navigate from a Control Plan characteristic directly to the underlying PFMEA failure mode to understand the rationale for the monitoring approach.

To create a link: open the Control Plan characteristic, click **Link FMEA Action**, search by PFMEA reference or failure mode description, and select the applicable control action. Multiple PFMEA actions can be linked to a single characteristic.

### RPN Calculation and Action Thresholds

Within the PFMEA editor, each failure mode is scored on three dimensions:

- **Severity (S)**: 1–10 scale per AIAG FMEA 4th Edition or AIAG-VDA FMEA Handbook (configurable in Admin).
- **Occurrence (O)**: 1–10 scale based on historical defect rates or design verification data.
- **Detection (D)**: 1–10 scale based on the current detection controls.

**RPN = S × O × D**. The system highlights RPNs above the configurable threshold (default: 100). Severity ratings of 9 or 10 trigger mandatory review regardless of RPN. Configure thresholds under **Admin > FMEA Settings**.

For AIAG-VDA FMEA users, the Action Priority (AP) rating (H/M/L) is displayed alongside RPN.

### Monitoring Frequency and Reaction Plans

Each Control Plan characteristic specifies:

- **Sample size and frequency** — e.g., n=5 every 2 hours. The system generates inspection due reminders based on the frequency setting and shift schedule.
- **Control method** — attribute or variable, manual check, SPC chart, vision system, CMM, etc.
- **Reaction plan** — step-by-step actions the operator must take if the characteristic is out of control or outside specification. Reaction plans can include mandatory escalation steps that notify the Quality Engineer via system alert.

### Characteristic Classification

Characteristics are classified using the codes configured in Admin. Common classifications:

- **Special Characteristics (SC/CC)** — safety or regulatory critical, marked with a shield or diamond symbol. Require 100% inspection or approved statistical controls.
- **Significant Characteristics (SC)** — important to function or customer satisfaction but not safety-critical.
- **General Characteristics** — standard process parameters.

Special Characteristics are highlighted in red throughout the Control Plan and SPC views. PFMEA failure modes linked to Special Characteristics are automatically flagged for mandatory detection control review.

### Updating After Engineering Changes

When an engineering change is approved (via the Document Control module), the system identifies all Control Plans and PFMEAs linked to the affected part or process. A **Change Impact Review** task is created for the Control Plan owner and FMEA author. They must:

1. Review all affected characteristics and failure modes.
2. Update ratings and controls to reflect the change.
3. Re-approve the updated documents.
4. Trigger a PPAP revision if the change requires customer notification.

### Revision History Tracking

Every save to a Control Plan or PFMEA creates a version record. Navigate to the **Rev History** tab to view all prior versions with the editor's name, timestamp, and a change summary. Any version can be compared side-by-side with the current version using the built-in diff viewer. Approved revisions require an electronic signature and are immutable once signed.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['automotive', 'iatf-16949', 'control-plan', 'fmea', 'pfmea'],
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
    id: 'KB-DD8-005',
    title: 'Automotive Quality Module — SPC & MSA',
    content: `## Automotive Quality Module — SPC & MSA

Statistical Process Control (SPC) and Measurement System Analysis (MSA) provide the quantitative foundation for demonstrating process stability and measurement confidence. This article explains how to configure and use both capabilities within the IMS Automotive module.

### Statistical Process Control Setup

Navigate to **SPC > Chart Configuration**. For each monitored characteristic, configure:

- **Chart type** — select based on data type and subgroup size:
  - **Xbar-R**: variable data, subgroup size 2–9 (most common in automotive).
  - **Xbar-S**: variable data, subgroup size 10 or more.
  - **I-MR (Individuals and Moving Range)**: variable data, subgroup size of 1.
  - **p chart**: attribute data, proportion defective, variable sample size.
  - **np chart**: attribute data, count defective, constant sample size.
  - **c chart**: attribute data, count of defects per unit, constant area of opportunity.
  - **u chart**: attribute data, defects per unit, variable area of opportunity.
- **Subgroup size** — number of consecutive parts measured per subgroup.
- **Specification limits** — USL and LSL pulled from the part drawing database, or entered manually.
- **Phase** — set to Trial (25 subgroups required before control limits lock) or Production.

### Control Limit Calculation

Control limits are calculated from the first 25 subgroups of production data (or the configured baseline period). Once calculated, they are locked and displayed as dashed lines on the chart. The system displays:

- **UCL / LCL** (Upper/Lower Control Limits) — 3-sigma limits.
- **UWL / LWL** (Upper/Lower Warning Limits) — 2-sigma limits (configurable).
- **USL / LSL** — specification limits shown as solid lines for reference.
- **Cpk / Ppk** — process capability indices updated with each new subgroup entry.

IATF 16949 typically requires Cpk ≥ 1.33 for Special Characteristics and ≥ 1.67 for Critical Characteristics. Thresholds are configurable.

### Western Electric Rules Configuration

Navigate to **Admin > SPC Settings > Detection Rules**. The following Western Electric rules can be individually enabled or disabled:

1. One point beyond 3 sigma (always enabled).
2. Two of three consecutive points beyond 2 sigma on the same side.
3. Four of five consecutive points beyond 1 sigma on the same side.
4. Eight consecutive points on the same side of the centreline.
5. Six consecutive points trending up or down.
6. Fourteen alternating points up and down.
7. Fifteen points within 1 sigma of centreline.
8. Eight consecutive points outside 1 sigma with none within.

Violations trigger an in-app alert and, if configured, an email/SMS notification to the designated Quality Engineer.

### MSA Study Management

Navigate to **MSA > New Study**. Select the study type and gauge, then enter the experimental design:

#### Gauge R&R (Crossed)
- Enter the number of appraisers (typically 3), parts (typically 10), and trials (typically 2 or 3).
- The ANOVA method is used by default (also calculates Average and Range method for comparison).
- Results reported: %Study Variation (%GRR), %Tolerance, Number of Distinct Categories (NDC), and repeatability vs reproducibility breakdown.

#### Gauge R&R (Nested)
- Used when parts are destructive or cannot be re-measured by all appraisers.
- Design: each appraiser measures a unique set of parts.

#### Attribute Agreement Analysis
- Appraiser data entered as pass/fail decisions for each part across multiple trials.
- System calculates Kappa statistic for within-appraiser and between-appraiser agreement.
- Results: % Agreement, Kappa (Cohen's and Fleiss's), p-values.

#### Bias and Linearity
- Bias: measures the difference between the average measurement and the reference value.
- Linearity: assesses whether bias changes systematically across the measurement range.

### Acceptance Criteria

Configured under **Admin > MSA Settings**:

- **%GRR < 10%** — Acceptable (gauge approved).
- **%GRR 10–30%** — Marginal (conditional approval, corrective action plan required).
- **%GRR > 30%** — Unacceptable (gauge rejected, replacement or improvement required before production use).
- **NDC ≥ 5** — Required to meaningfully detect process variation.

Failed MSA studies block the gauge from being selected in Control Plan configurations until a new passing study is recorded.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['automotive', 'iatf-16949', 'spc', 'msa', 'gauge-rr'],
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
    id: 'KB-DD8-006',
    title: 'Automotive Quality Module — Reporting & Dashboards',
    content: `## Automotive Quality Module — Reporting & Dashboards

The IMS Automotive module provides a comprehensive suite of dashboards and reports tailored to automotive quality management. This article covers the key KPIs tracked, available dashboards, customer scorecard exports, and audit report packs.

### Key Automotive Quality KPIs

The main KPI dashboard (**Reporting > Quality KPIs**) displays the following metrics, configurable by date range, product family, customer, and plant:

#### PPM (Parts Per Million Defective)
PPM is the primary external quality metric for automotive suppliers. The module calculates:
- **Internal PPM** — defects generated before shipment, measured against total parts produced.
- **External/Customer PPM** — defects reported by the customer after delivery, measured against total parts shipped.

PPM trend charts show monthly performance against customer-defined targets. Red/amber/green status is applied automatically.

#### Scrap Rate
Scrap cost and quantity tracked per operation, work centre, and defect code. Pareto charts identify the top contributors. Scrap rate is presented as a percentage of total production cost and as a PPM equivalent.

#### OEE (Overall Equipment Effectiveness)
OEE is pulled from the CMMS/Asset module if integrated, or entered manually from machine reports. OEE = Availability × Performance × Quality. The quality loss component is derived directly from the defect data logged in the Automotive module.

#### First-Time Quality (FTQ)
FTQ measures the percentage of units that pass all quality checks without any rework or repair. Calculated per shift, per operation, and per product family. IATF 16949 auditors frequently examine FTQ trends as evidence of process effectiveness.

#### Warranty Returns
Warranty return data entered in the **Warranty** section is tracked by part number, failure mode, and customer. Field failure rates are trended over the warranty period. This data feeds the Post-Launch Control Plan review process and may trigger PFMEA updates if field failure modes were not previously identified.

### Customer Scorecard Exports

Navigate to **Reporting > Customer Scorecards**. For each customer, the module can generate a scorecard in the format required by that customer:

- **General Motors (GM)**: SPQE Supplier Scorecard format.
- **Ford**: Q1 Scorecard format.
- **Stellantis**: Supplier Performance Scorecard format.
- **Custom**: Define column mapping for customers with proprietary formats.

Scorecards are exportable to Excel or PDF and can be scheduled for automatic monthly generation and email delivery.

### IATF Surveillance Audit Report Pack

Navigate to **Reporting > Audit Pack**. The IATF 16949 surveillance audit report pack compiles the following evidence into a single PDF:

1. Quality Policy and Objectives with trend data.
2. Customer Complaint and PPM summary (12 months).
3. Internal Audit schedule and findings summary.
4. Management Review minutes and action status.
5. Control Plan and FMEA register.
6. MSA study results summary.
7. SPC capability summary (Cpk ≥ 1.33 confirmation).
8. PPAP submission status register.
9. Supplier quality performance summary.
10. Training and competency records for quality staff.

This pack is generated in approximately 30 seconds and is formatted to align with IATF 16949 clause numbering to simplify navigation during the audit.

### Customer-Specific Report Formats

Some customers require monthly or quarterly quality performance reports in proprietary formats. Navigate to **Admin > Report Templates** to configure custom report layouts. The template builder supports drag-and-drop field mapping from the IMS data model to customer-defined column structures.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['automotive', 'iatf-16949', 'reporting', 'kpi', 'metrics'],
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
    id: 'KB-DD8-007',
    title: 'Automotive Quality Module — Troubleshooting Guide',
    content: `## Automotive Quality Module — Troubleshooting Guide

This guide covers the most common issues encountered when using the IMS Automotive Quality module, with symptoms, root causes, and step-by-step solutions.

### Issue 1: Control Plan Not Linking to FMEA Actions

**Symptom**: When editing a Control Plan characteristic and clicking 'Link FMEA Action', the search returns no results even though the PFMEA exists.

**Causes and Solutions**:
- **PFMEA not yet approved**: Only approved PFMEAs appear in the link search. Open the PFMEA and check its status. If it is in 'Draft' or 'In Review', have the PFMEA owner submit it for approval.
- **Part number mismatch**: The Control Plan and PFMEA must be linked to the same part number. Check that both records reference the identical part number (including revision level if revision-specific).
- **Missing process step linkage**: The PFMEA process step must match a process step in the Control Plan. Navigate to the PFMEA, open the relevant failure mode, and confirm the process step name matches exactly. Exact string matching is required — check for trailing spaces or variant spellings.

### Issue 2: SPC Out-of-Control Not Triggering Alerts

**Symptom**: An SPC chart shows a Western Electric rule violation (red annotation on chart), but no alert notification was sent to the Quality Engineer.

**Causes and Solutions**:
- **Notification not configured**: Navigate to **Admin > SPC Settings > Notifications** and confirm that an alert recipient is configured for the affected characteristic or product family. If the recipient list is empty, no alert is sent.
- **Alert already acknowledged**: Once a violation is acknowledged by any user, subsequent alerts for the same violation are suppressed. Check the alert history under **SPC > Alerts Log** to see if the violation was already acknowledged.
- **Email/SMS delivery failure**: Navigate to **Admin > Notification Logs** and check whether the alert was generated but failed delivery. Common causes include invalid email addresses or SMS gateway throttling. Test the notification channel from Admin > Notification Settings.
- **Control limits not locked**: Alerts only fire for charts in Production phase with locked control limits. If the chart is still in Trial phase, violations are recorded but do not trigger alerts. Lock the control limits by navigating to the chart settings and clicking 'Lock Control Limits' after 25 subgroups.

### Issue 3: PPAP Submission Stuck in Pending

**Symptom**: A PPAP has been submitted to the customer but remains in 'Pending Customer Approval' for an extended period. The customer reports they have not received the submission.

**Causes and Solutions**:
- **Portal delivery failure**: Navigate to **PPAP > Submission Log** and check the delivery status. If status shows 'Failed', re-send the submission. Common causes are customer portal authentication token expiry — re-enter the portal credentials under **Admin > Customer Portals**.
- **Wrong customer contact**: Check that the submission contact on file for this customer is the correct person. Navigate to **Admin > Customers**, select the customer, and verify the PPAP Recipient contact.
- **Email package not received**: If using email delivery, check spam folders on the customer side. Re-send using the 'Resend' button in Submission Log, which generates a fresh package with a new transmission timestamp.

### Issue 4: MSA %GRR Showing Incorrect Values

**Symptom**: The calculated %GRR does not match the expected result when cross-checked in a spreadsheet.

**Causes and Solutions**:
- **Study variation basis**: Confirm whether the system is calculating %GRR as a percentage of **Study Variation** or **Tolerance**. These are different calculations — navigate to **Admin > MSA Settings** and check the 'Default %GRR Basis' setting. AIAG MSA 4th Edition uses both; the default is %Study Variation.
- **Number of standard deviations (k)**: The AIAG method uses k=5.15 (99% of a normal distribution). Some organisations use k=6. Check **Admin > MSA Settings > k Factor**.
- **Data entry errors**: Review the raw data table in the MSA study for transcription errors. Any outlier values will significantly inflate the %GRR.

### Issue 5: Customer Scorecard Mismatch

**Symptom**: The PPM value exported on the customer scorecard does not match the value the customer is reporting on their own scorecard.

**Causes and Solutions**:
- **PPM basis difference**: Confirm whether your calculation uses parts shipped or parts received by the customer as the denominator. Some customers use a trailing 12-month rolling window; others use the calendar month. Check the customer's scorecard methodology document and align the IMS calculation basis under **Admin > Customer Scorecards > [Customer] > PPM Calculation Method**.
- **Warranty returns included/excluded**: Some customers include warranty returns in external PPM; others track them separately. Verify the scorecard configuration with your customer quality contact.
- **Time zone cutoff**: If parts ship late on the last day of the month, the shipment date may fall in different calendar months depending on time zone. Check the shipment timestamp settings.`,
    contentType: 'MARKDOWN',
    category: 'FAQ',
    status: 'PUBLISHED',
    tags: ['automotive', 'iatf-16949', 'troubleshooting'],
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
    id: 'KB-DD8-008',
    title: 'Automotive Quality Module — IATF 16949 Audit Readiness',
    content: `## Automotive Quality Module — IATF 16949 Audit Readiness

Preparing for an IATF 16949 certification or surveillance audit requires demonstrating that your quality management system is effectively implemented and continuously monitored. The IMS Automotive module centralises the evidence needed for a successful audit. This guide maps key IATF 16949 clauses to the relevant IMS screens and explains how to prepare your evidence package.

### Key Clause-to-IMS-Screen Mapping

| IATF 16949 Clause | IMS Screen | Evidence to Demonstrate |
|---|---|---|
| 4.3.2 Customer-Specific Requirements | Admin > Customer Requirements | CSR library, version control, acknowledgement records |
| 5.3.2 Process Owners | Org Chart / Role Assignments | Named process owners for each QMS process |
| 6.1.2.1 Risk Analysis | PFMEA register | Current approved PFMEAs for all production processes |
| 7.1.5.1 Monitoring/Measuring Resources | MSA > Study Library | Valid MSA studies for all Control Plan gauges |
| 7.2.3 Internal Auditor Competency | Training Tracker | Internal auditor training records and qualifications |
| 8.3 Product/Process Design | APQP > Project List | Completed APQP projects with signed phase gate approvals |
| 8.3.3.3 Special Characteristics | Control Plans / PFMEAs | Special Characteristic identification, classification, and control methods |
| 8.5.1.1 Control Plans | Control Plan register | Current approved Control Plans for all production parts |
| 8.6.2 Layout Inspection | PPAP > Element 9 | Dimensional inspection results with balloon drawings |
| 8.6.4 Appearance Approval | PPAP > Element 13 | Signed Appearance Approval Reports |
| 9.1.1.1 SPC | SPC > Chart Library | Control charts demonstrating statistical stability |
| 9.2.2.4 Product Audit | Audit > Product Audits | Completed layered process and product audit records |

### Evidence Collection Checklist

Before the audit, navigate to **Reporting > Audit Pack** and generate the IATF Surveillance Audit Report Pack. Additionally, manually verify the following:

**Control Plans and PFMEAs**
- [ ] All production parts have a current approved Control Plan.
- [ ] All Control Plans are linked to an approved PFMEA.
- [ ] Special Characteristics are identified and monitored per the Control Plan.
- [ ] Reaction plans are defined for all out-of-control conditions.

**MSA Records**
- [ ] All measurement gauges listed in Control Plans have a valid, passing MSA study.
- [ ] MSA studies are within the defined re-study interval (typically annual or on change of gauge).

**SPC Charts**
- [ ] All variable characteristics designated for SPC monitoring have active charts.
- [ ] Control limits are locked (Production phase) and Cpk ≥ 1.33 for Special Characteristics.
- [ ] Out-of-control reactions are documented for any historical violations.

**PPAP Records**
- [ ] All production parts have a customer-approved PSW on file.
- [ ] PSWs are current (not superseded by unapproved engineering changes).

**Customer Scorecards**
- [ ] Last 12 months of customer PPM data is recorded.
- [ ] Customer complaints are logged with 8D responses on file.

### Internal Audit Checklist for Automotive Quality

Navigate to **Audit > Internal Audits > New Audit** and select the 'IATF 16949 Automotive Quality' checklist template. Key focus areas for the internal audit:

1. Is the PFMEA reviewed and updated after quality escapes or field failures?
2. Are Control Plan monitoring frequencies being met? (Check inspection records against the frequency specified.)
3. Are Western Electric rule violations being reacted to within the defined reaction plan timeframe?
4. Are gauge calibration records current for all Control Plan measurement devices?
5. Are PPAP submissions current for all production parts, including those affected by engineering changes in the past 12 months?
6. Are customer-specific requirements documented, communicated to relevant staff, and reflected in process controls?

### Unannounced Audit Preparedness

IATF 16949 requires readiness for unannounced surveillance audits (at least one per three-year certification cycle). To maintain readiness:

- Ensure all SPC charts are actively monitored and up to date.
- Keep the audit evidence pack generatable at any time from Reporting > Audit Pack.
- Maintain the customer scorecard data within 30 days of current.
- Conduct quarterly internal 'mock audits' using the IMS internal audit checklist and record findings.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['automotive', 'iatf-16949', 'audit', 'compliance', 'certification'],
    author: 'IMS Team',
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    publishedAt: new Date('2026-01-01'),
    viewCount: 0,
    helpful: 0,
    notHelpful: 0,
  },

  // ─── MEDICAL DEVICES MODULE (ISO 13485) ──────────────────────────────────────
  {
    id: 'KB-DD8-009',
    title: 'Medical Devices Quality Module (ISO 13485) — Day-to-Day User Guide',
    content: `## Medical Devices Quality Module (ISO 13485) — Day-to-Day User Guide

The Medical Devices Quality module supports Quality Assurance staff working in medical device manufacturing and distribution companies operating under ISO 13485:2016. This guide covers the routine tasks performed by QA staff throughout a typical working day in a regulated medical device facility.

### Navigating the Medical Devices Module

From the main navigation, open **Medical Quality**. The module is divided into six sections: DHR/DHF, Complaints & Vigilance, CAPA, Incoming Inspection, Label Control, and Environmental Monitoring. The dashboard shows open actions by priority, overdue complaint timelines, and CAPA effectiveness checks due.

### Morning Startup Routine

Begin each day by reviewing the dashboard for time-sensitive items:

1. **Complaint response deadlines** — MDR/vigilance reporting deadlines are highlighted in red when within 5 days. Review open complaints for any approaching the 30-day initial report deadline or the 5-day serious injury/death deadline.
2. **CAPA effectiveness verifications due** — CAPAs whose effectiveness check date falls within the next 7 days are listed. Assign or confirm the responsible person.
3. **Incoming inspection queue** — materials received overnight appear in the incoming inspection queue. Assign inspectors and confirm required test methods are available.
4. **Environmental monitoring results** — if your facility requires environmental monitoring (cleanroom, aseptic areas), review overnight results for excursions.

### DHR (Device History Record) Entry

Navigate to **DHR/DHF > DHR > New Entry** or select an existing batch/lot. The DHR captures the complete production record for each manufactured device or batch:

- **Lot/serial number** — auto-generated or manually entered per your traceability system.
- **Work order reference** — links to the production work order.
- **Date of manufacture** — date range for the production run.
- **Quantity manufactured, released, and rejected** — with disposition records for rejected units.
- **Component traceability** — links to incoming inspection records for all critical components.
- **Process records** — links to completed process batch records or route cards.
- **Sterilisation records** — if applicable, links to the sterilisation cycle record.
- **Label inspection** — links to the label verification record.
- **Release authorisation** — Quality release signature (electronic signature, 21 CFR Part 11 compliant if configured).

### Complaint Handling Workflow

Navigate to **Complaints > New Complaint**. Enter complaint details:

1. **Complaint source** — customer, distributor, field service, post-market surveillance.
2. **Product involved** — part number, lot/serial number, device name.
3. **Event description** — free text description of the complaint event.
4. **Patient involvement** — flag if a patient was involved and classify the injury severity.
5. **Reportability assessment** — the system presents a decision tree to assess whether the complaint meets MDR reportability criteria. The assessment is recorded and signed.

Complaints are assigned a priority (Critical, Major, Minor) and a due date for initial investigation. The responsible QA investigator receives an automatic notification.

### CAPA Initiation from Nonconformances

When a nonconformance is closed with a root cause identified, the system prompts whether to initiate a CAPA. Navigate to **CAPA > New CAPA** or initiate directly from the nonconformance record. Link the source nonconformance, enter the root cause analysis summary, and assign corrective and preventive actions with owners and due dates.

### Incoming Inspection Logging

Navigate to **Incoming Inspection > New Inspection**. Select the purchase order or supplier delivery, enter the quantity received, and record the inspection results against the Acceptance Quality Level (AQL) plan. Attach inspection certificates (CoA, CoC) received from the supplier. Pass/fail disposition is recorded; failed lots trigger a nonconformance record automatically.

### Label Control Checks

Navigate to **Label Control > Verification Log**. For each production run, record the label verification: confirm label part number, revision, lot number, expiry date (if applicable), and any regulatory symbols (CE mark, UDI barcode). Label verification is a critical DHR record and must be completed before product release.

### Environmental Monitoring Log

Navigate to **Environmental Monitoring > New Result**. Enter the monitoring location, sample type (viable air, viable surface, non-viable particle count, temperature, humidity), result value, and pass/fail against the action and alert limits defined for that location class. Excursions automatically create a nonconformance record for investigation.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['medical', 'iso-13485', 'daily-use', 'quality'],
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
    id: 'KB-DD8-010',
    title: 'Medical Devices Quality Module — Administrator Configuration Guide',
    content: `## Medical Devices Quality Module — Administrator Configuration Guide

This guide is for Quality System Administrators responsible for the initial setup and ongoing configuration of the ISO 13485 Medical Devices Quality module. Correct configuration ensures that the module meets regulatory requirements and supports your specific product families and device classes.

### Product Families and Device Classes

Navigate to **Admin > Product Configuration**. For each product family:

- **Device class** — select Class I (lowest risk, generally exempt from premarket review), Class II (moderate risk, typically requires 510(k) or equivalent), or Class III (highest risk, requires PMA or equivalent). Device class drives certain workflow requirements within the module.
- **Regulatory markets** — select applicable markets (FDA, EU MDR, Health Canada, TGA, PMDA, etc.). Each market selection activates the relevant vigilance reporting timelines.
- **Unique Device Identification (UDI)** — configure UDI-DI and UDI-PI structure for the product family. The module validates UDI format on DHR entry.

### DHF/DHR Structure Configuration

Navigate to **Admin > DHF/DHR Settings**. Configure the document types and sections that constitute your Design History File and Device History Record:

- **DHF sections** — define the required sections (e.g., Design Inputs, Design Outputs, Design Review Records, Verification Records, Validation Records, Risk Management File, Design Transfer).
- **DHR required elements** — define which elements are mandatory for DHR completion before product release. Mandatory elements block the release signature if not all linked.
- **Retention periods** — set the record retention period per product family. EU MDR requires a minimum of 15 years for implantable devices; FDA requires 2 years from the last date the device was distributed.

### Risk Management Integration (ISO 14971)

Navigate to **Admin > Risk Management Integration**. The Medical Quality module integrates with the IMS Risk module for ISO 14971 risk management:

- **Risk Management File linkage** — link each product to its Risk Management File in the Risk module. This allows the complaint and post-market surveillance data from the Medical module to automatically populate the post-market surveillance data input in the Risk Management File.
- **Residual risk acceptability criteria** — configure the risk acceptability matrix (probability × severity) used in the risk management file. The matrix must be documented in your Risk Management Plan.

### User Roles for Regulatory Affairs vs QA

Navigate to **Admin > User Roles**. The Medical module supports the following roles with distinct permission sets:

- **Quality Technician** — can log DHR entries, incoming inspection results, and environmental monitoring. Cannot approve or release.
- **Quality Engineer** — can initiate and investigate complaints, nonconformances, and CAPAs. Can sign off investigation reports but not product release.
- **Quality Manager** — full access. Can approve CAPAs, authorise product release (DHR sign-off), and generate vigilance reports.
- **Regulatory Affairs Specialist** — read access to all records plus write access to the Vigilance Reporting and MDR sections. Cannot authorise production records.
- **Management Representative** — read-only access to all records and management review data.

### Electronic Signature Settings

Navigate to **Admin > Electronic Signatures**. Configure which records require electronic signatures and the signature type:

- **Simple e-signature** — username and password re-entry. Suitable for most QMS records.
- **Advanced e-signature** — two-factor authentication (TOTP). Required for DHR product release and CAPA approvals if operating under 21 CFR Part 11.

Each signature captures the signer's identity, timestamp, and a statement of meaning (e.g., "I approve this record as meeting all specified requirements").

### 21 CFR Part 11 Compliance Options

Navigate to **Admin > Regulatory Compliance > 21 CFR Part 11**. Enable the following controls to achieve Part 11 compliance for electronic records:

- **Audit trail** — immutable record of all record creation, modification, and deletion events (enabled by default).
- **System access controls** — unique user IDs, password complexity requirements, account lockout after failed attempts.
- **Record integrity** — database-level checksums to detect tampering.
- **Signature manifestation** — electronic signatures include the printed name, date, time, and meaning of signature.
- **Training records** — only users with current training on relevant SOPs can access controlled record functions.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['medical', 'iso-13485', 'admin', 'configuration'],
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
    id: 'KB-DD8-011',
    title: 'Medical Devices Quality Module — Design History File (DHF) Management',
    content: `## Medical Devices Quality Module — Design History File (DHF) Management

The Design History File (DHF) is the collection of records that describes the design history of a finished medical device, demonstrating that the device was developed in accordance with the approved design plan and the applicable regulatory requirements. ISO 13485 clause 7.3 and FDA 21 CFR 820.30 both mandate a DHF for each device type. This article explains how to structure and manage the DHF within the IMS Medical Quality module.

### Structuring the Design History File

Navigate to **DHF/DHF > New Design History File**. Create one DHF per device type (or family of devices with common design). The DHF is structured as a hierarchical collection of sections and documents:

**Required DHF Sections (pre-configured per ISO 13485 and 21 CFR 820.30)**:

1. **Design Plan** — the approved plan describing design and development activities, responsibilities, and stages.
2. **Design Inputs** — documented performance requirements, safety requirements, regulatory requirements, and user needs.
3. **Design Outputs** — specifications, drawings, software documents, and manufacturing procedures resulting from the design process.
4. **Design Review Records** — minutes and action items from formal design review meetings.
5. **Design Verification Records** — test reports and analyses confirming outputs meet inputs.
6. **Design Validation Records** — evidence that the device meets user needs and intended uses under actual or simulated use conditions.
7. **Design Transfer** — documentation confirming the design was correctly transferred to production.
8. **Design Changes** — all post-transfer design change records with justification and impact assessments.
9. **Risk Management File** — the ISO 14971 risk management file linked from the Risk module.

### Linking Design Inputs to Outputs

Within each DHF section, use the **Traceability Matrix** feature. Navigate to **DHF > [Device] > Traceability Matrix**. This matrix maps each design input requirement to one or more design outputs, verification activities, and validation activities. The system highlights any design input that lacks a corresponding output or verification record, identifying traceability gaps before a regulatory audit.

### Verification and Validation Records

Design Verification confirms the design output meets the design input specification. Design Validation confirms the device meets the user need in actual or simulated conditions.

- Navigate to **DHF > [Device] > Verification** to attach verification test protocols and reports.
- Navigate to **DHF > [Device] > Validation** to attach validation protocols, reports, and clinical evaluation data.

Each record includes: test objective, acceptance criteria, actual result, pass/fail conclusion, and the authorised reviewer's electronic signature. Protocols must be approved before testing begins — the system blocks result entry on a protocol that has not been signed off.

### Design Review Meeting Records

Navigate to **DHF > [Device] > Design Reviews > New Review**. For each formal design review, record:

- Review stage (e.g., Concept Review, Preliminary Design Review, Critical Design Review, Production Readiness Review).
- Attendees and their roles.
- Agenda items reviewed and decisions made.
- Open action items with owners and due dates.
- Objective evidence reviewed (list of documents reviewed during the meeting).

Design review attendance and sign-off are captured via electronic signatures. Open action items from design reviews appear in the assignee's task dashboard.

### Design Transfer Documentation

Design transfer is the process of ensuring that the product design can be consistently reproduced in production. Navigate to **DHF > [Device] > Design Transfer**. Attach:

- Production specifications and drawings (final revisions).
- Manufacturing process procedures.
- Equipment qualification records (IQ/OQ/PQ).
- Initial capability studies confirming the manufacturing process can consistently meet specifications.
- Training records for production staff on new processes.

The Design Transfer Checklist (configurable in Admin) must be fully completed and signed before the device can be designated as 'Production Released' in the system.

### Change Control During Design Phase

All changes to the design after the initial baseline are subject to change control. Navigate to **DHF > [Device] > Design Changes > New Change**. Record the change description, rationale, impact assessment (does the change affect safety, performance, regulatory status, or labelling?), and required reverification or revalidation. Changes to design inputs may invalidate existing verification records — the system flags this automatically.

### DHF Completeness Checklist

Before transfer to production or regulatory submission, run the DHF Completeness Check from **DHF > [Device] > Completeness Check**. The system verifies:

- All required sections have at least one approved document.
- All design inputs are mapped in the traceability matrix to at least one output and one verification.
- All open design change actions are closed.
- All design review action items are closed.
- The Risk Management File is approved.
- The Design Transfer Checklist is complete and signed.

Any incomplete items are listed with links to the relevant record for remediation.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['medical', 'iso-13485', 'dhf', 'design-controls'],
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
    id: 'KB-DD8-012',
    title: 'Medical Devices Quality Module — Risk Management (ISO 14971)',
    content: `## Medical Devices Quality Module — Risk Management (ISO 14971)

ISO 14971:2019 defines the requirements for risk management applied to medical devices throughout the product lifecycle. The IMS Medical Quality module integrates tightly with the Risk module to provide a complete Risk Management File (RMF) that meets ISO 14971 and supports regulatory submissions and audits.

### Creating the Risk Management File

Navigate to **Risk > Risk Management Files > New RMF**. Link the RMF to the device in the Medical module. The RMF is structured in accordance with ISO 14971:

1. **Risk Management Plan** — scope, responsibilities, risk acceptability criteria, and planned risk management activities.
2. **Hazard Identification** — comprehensive list of hazards and hazardous situations.
3. **Risk Estimation** — probability and severity ratings for each harm scenario.
4. **Risk Evaluation** — comparison of each risk against the acceptability criteria.
5. **Risk Control** — risk control measures and verification of their effectiveness.
6. **Residual Risk Evaluation** — evaluation of residual risk after controls, including overall residual risk assessment.
7. **Post-Market Surveillance Summary** — ongoing safety data from the field.
8. **Risk Management Report** — summary of the overall risk management process and conclusions.

### Hazard Identification

Navigate to **Risk > [RMF] > Hazards > New Hazard**. For each hazard:

- **Hazard description** — the physical, chemical, biological, or use-related hazard.
- **Hazardous situation** — the circumstances in which the hazard can cause harm.
- **Sequence of events** — the foreseeable chain of events leading to harm.
- **Harm** — the injury or damage to health of patients, users, or third parties.

The system provides a pre-loaded library of common medical device hazard categories (energy hazards, biological hazards, environmental hazards, usability-related hazards) to support systematic hazard identification.

### Risk Estimation

For each identified hazardous situation, enter:

- **Probability of occurrence (P1)** — probability of the hazardous situation occurring.
- **Probability of harm given hazardous situation (P2)** — probability that the hazardous situation leads to harm.
- **Severity of harm (S)** — rated on the 5-point scale: Negligible, Minor, Serious, Critical, Catastrophic.

The system calculates the overall risk level and displays it on the risk matrix. ISO 14971:2019 does not mandate a specific numeric scale; the matrix dimensions are configurable in Admin to match your Risk Management Plan.

### Risk Evaluation

The risk acceptability criteria defined in the Risk Management Plan are applied to each risk. Risks above the acceptability threshold are flagged as 'Unacceptable' and require risk control. Risks in the ALARP (As Low As Reasonably Practicable) region require benefit-risk analysis, which is documented as an attachment to the risk record.

### Risk Control Measures

Navigate to **Risk > [RMF] > Controls**. For each unacceptable risk, define one or more risk control measures following the ISO 14971 three-step hierarchy:

1. **Inherently safe design** — eliminate the hazard by design.
2. **Protective measures** — engineering controls, alarms, or physical safeguards.
3. **Information for safety** — warnings, instructions for use, training.

Each control measure must have a verification record confirming it was implemented and effective. Link verification records from the DHF.

### Residual Risk Evaluation and Overall Residual Risk

After all controls are in place, re-estimate the risk (P1, P2, S) for each hazardous situation. The system re-calculates residual risk and confirms whether it meets the acceptability criteria. Once all individual risks are acceptable, navigate to **Risk > [RMF] > Overall Residual Risk** to conduct the overall residual risk assessment and document the benefit-risk conclusion.

### Post-Market Surveillance Data Feeding Back to Risk File

The Medical module automatically transfers the following data to the RMF's Post-Market Surveillance section:

- **Complaint rate by hazard category** — complaints logged in the Complaints section are tagged with hazard categories. Aggregate rates are updated monthly in the PMS summary.
- **Serious adverse events** — vigilance reports feed the hazardous situation probability estimates.
- **Literature and field safety data** — manually entered from PMS literature searches.

When PMS data suggests a risk estimate change is needed, the system generates a Risk Review Task for the Risk Management file owner, ensuring the RMF stays current.

### Risk Management Report Generation

Navigate to **Risk > [RMF] > Generate Report**. The Risk Management Report is generated as a structured PDF summarising all risk management activities, confirming the risk management plan was followed, residual risks are acceptable, and the benefit-risk ratio is favourable. This report is a required DHF document and a key submission file for regulatory agencies.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['medical', 'iso-13485', 'iso-14971', 'risk', 'fmea'],
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
    id: 'KB-DD8-013',
    title: 'Medical Devices Quality Module — Complaint & Vigilance Management',
    content: `## Medical Devices Quality Module — Complaint & Vigilance Management

Effective complaint handling and vigilance reporting are central to ISO 13485 compliance and patient safety. Under EU MDR, IVDR, FDA, and other regulatory frameworks, manufacturers must have documented procedures for receiving, investigating, and reporting complaints. This article explains the end-to-end complaint and vigilance workflow in the IMS Medical Quality module.

### Logging Customer Complaints

Navigate to **Complaints > New Complaint**. All complaints that allege a deficiency in the identity, quality, durability, reliability, safety, effectiveness, or performance of a device must be logged and formally evaluated. Enter:

- **Complainant details** — name, organisation, country, contact information.
- **Device details** — device name, part number, lot/serial number, UDI, manufacturing date, and expiry date.
- **Event description** — verbatim description of the complaint in the complainant's own words.
- **Event date** — the date the adverse event, near-miss, or quality issue occurred.
- **Patient/user involvement** — flag if a patient was involved. If yes, enter injury type and severity.
- **Device accountability** — was the device returned? Is it available for investigation?

Upon saving, the system generates a unique complaint reference number and starts the investigation clock.

### MDR/Vigilance Reporting Workflow

After the initial complaint assessment, navigate to **Complaints > [Complaint] > Reportability Assessment**. The system walks through a decision tree:

1. Is this a complaint related to a marketed device?
2. Has the device malfunctioned or deteriorated in performance?
3. Was there a serious deterioration in the state of health (injury, life-threatening illness, death)?
4. Could recurrence of the malfunction lead to serious injury or death?

If the answer to the reportability questions indicates a reportable event, the system flags the complaint and prompts creation of a Vigilance Report.

### Adverse Event Classification

Adverse events are classified under the relevant regulatory framework:

- **EU MDR**: Serious incident (death, serious deterioration in health, or serious public health threat) vs. non-serious incident.
- **FDA**: Medical Device Report (MDR) — death, serious injury, or malfunction that could cause death or serious injury.
- **Health Canada / TGA / PMDA**: Equivalent national classifications.

Classification is recorded and signed. Incorrect classification is a significant audit finding — the decision rationale must be documented even for events classified as non-reportable.

### 30-Day and 5-Day Reporting Timelines

The system tracks reporting deadlines from the date the manufacturer becomes aware of the event:

- **30 calendar days**: Standard reporting deadline for serious incidents (EU MDR, FDA MDR).
- **15 calendar days**: FDA MDR deadline for events involving death or serious injury.
- **5 calendar days**: For events where immediate corrective action is taken or required.

The complaint dashboard highlights complaints approaching each deadline in amber (7 days remaining) and red (3 days remaining). Automated reminder notifications are sent to the Regulatory Affairs Specialist and Quality Manager at configured intervals.

### Integration with Global Regulatory Databases

Navigate to **Complaints > Regulatory Submission**. For confirmed reportable events, the system generates the required regulatory report format:

- **EU MDR**: Exports the EUDAMED structured report XML for upload to the European Database on Medical Devices.
- **FDA MDR**: Generates the MedWatch 3500A form (PDF) for submission to FDA MedWatch.
- **Other markets**: Configurable export templates for national competent authorities.

Submitted reports are linked to the source complaint record with submission date and confirmation reference numbers.

### Trend Analysis for Complaint Rates

Navigate to **Complaints > Analytics**. The trend analysis dashboard shows:

- **Complaint rate per device** — complaints per 1,000 units shipped, trended monthly.
- **Complaint rate by failure mode** — Pareto analysis of complaint categories.
- **Signal detection** — statistical alerts when complaint rates exceed the historical baseline by a configurable threshold (e.g., 2 standard deviations), triggering a Post-Market Surveillance review.

Trending data is automatically included in the quarterly Management Review data pack.

### Field Safety Corrective Action (FSCA) Management

When a complaint investigation identifies a systemic issue requiring field action, navigate to **Complaints > [Complaint] > Initiate FSCA**. The FSCA record captures:

- **Action type** — recall, field safety notice, modification, or enhanced monitoring.
- **Scope** — affected lot numbers, markets, and quantity.
- **Customer notification** — distribution of Field Safety Notices to customers and national competent authorities.
- **Effectiveness verification** — confirmation that all affected devices have been addressed.

FSCAs are subject to regulatory notification requirements. The system generates the required national competent authority notification letters from configurable templates.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['medical', 'iso-13485', 'complaints', 'vigilance', 'mdr'],
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
    id: 'KB-DD8-014',
    title: 'Medical Devices Quality Module — Nonconformance & CAPA',
    content: `## Medical Devices Quality Module — Nonconformance & CAPA

Nonconforming product control and Corrective and Preventive Action (CAPA) are fundamental requirements of ISO 13485. In the medical device industry, effective CAPA is a critical regulatory expectation — FDA warning letters and notified body audit failures frequently cite inadequate CAPA systems. This article explains the complete nonconformance and CAPA workflow in the IMS Medical Quality module.

### Nonconforming Product Disposition Workflow

Navigate to **Nonconformance > New NC** when a product or material does not meet specified requirements. Enter:

- **NC source** — incoming inspection, in-process inspection, final inspection, environmental monitoring, customer complaint, or audit finding.
- **Product/material** — part number, lot number, quantity affected.
- **Nonconformance description** — specific deviation from specification with measurements or observations.
- **Disposition options**:
  - **Use-As-Is (UAI)** — product meets intended use despite deviation. Requires engineering justification and Quality Manager approval. Patient safety impact assessment is mandatory.
  - **Rework** — product can be brought back into specification through defined rework operation. Rework procedure and re-inspection plan required.
  - **Scrap** — product cannot be salvaged. Destruction records required; for implantable devices, traceability must be maintained.
  - **Return to Supplier** — non-conforming material returned. Supplier Corrective Action Request (SCAR) initiated automatically.
  - **Concession/Deviation** — product accepted under documented concession with regulatory notification if required.

Disposition decisions for Class II/III devices require a Quality Engineer signature. Use-As-Is dispositions for safety-critical components require the Quality Manager's signature.

### Linkage from NC to CAPA

Nonconformances can be linked to a CAPA when the investigation reveals a systemic root cause requiring corrective action. From the NC record, navigate to **Actions > Initiate CAPA**. The NC reference, product details, and nonconformance description are pre-populated in the CAPA form.

ISO 13485 clause 8.5.2 requires CAPA when the nonconformance is recurrent or represents a significant quality risk. The system tracks NC recurrence by product family and failure mode — when the same failure mode appears three or more times within a rolling 90-day window, the system prompts CAPA initiation.

### Root Cause Analysis Tools

Navigate to **CAPA > [CAPA] > Root Cause Analysis**. The module supports four root cause analysis methods:

- **5-Why Analysis** — iterative why questioning, structured in a branching tree. Each level is recorded with supporting evidence.
- **Ishikawa (Fishbone) Diagram** — cause-and-effect diagram with six standard branches: Man, Machine, Method, Material, Measurement, Mother Nature (Environment). Additional branches can be added.
- **Fault Tree Analysis (FTA)** — top-down Boolean logic tree for complex failure modes. Imported from external FTA tools as PDF attachment with summary narrative.
- **Failure Mode and Effects Analysis (FMEA)** — for CAPAs that affect a process step, the linked PFMEA can be opened and updated directly from the CAPA record.

The selected RCA method and its output are attached to the CAPA record and included in regulatory submissions.

### Effectiveness Verification

After CAPA actions are implemented, an effectiveness verification is scheduled. Navigate to **CAPA > [CAPA] > Effectiveness Verification**. The verification plan defines:

- **Success criteria** — measurable criteria confirming the root cause has been eliminated (e.g., zero recurrence of the failure mode in 90 days of production after CAPA implementation).
- **Verification period** — the monitoring window (typically 90–180 days for production CAPAs).
- **Verification method** — review of production records, incoming inspection data, complaint data, or audit findings.

At the end of the verification period, the CAPA owner records the verification result and attaches supporting evidence. If the CAPA is deemed ineffective, the system opens a new CAPA linked to the original to investigate the failed corrective action.

### Regulatory Authority Notification Criteria

Some nonconformances and CAPAs must be reported to regulatory authorities. The system includes a notification assessment checklist triggered when:

- A CAPA addresses a complaint that was reported as an MDR/vigilance event.
- A CAPA requires a change to the 510(k), CE marking, or other device approval.
- A CAPA results in a product recall or Field Safety Corrective Action.

The assessment is documented and signed. If notification is required, a link to the Regulatory Submission workflow is created.

### CAPA Trending

Navigate to **CAPA > Analytics**. Key trending metrics:

- **CAPA cycle time** — days from initiation to closure, trended by month and source type.
- **Overdue CAPAs** — CAPAs past their scheduled completion date.
- **CAPA by source** — breakdown of CAPAs by source (complaints, audits, NCs, management review) showing whether proactive (audit/management review) or reactive (complaints/NCs) CAPAs dominate.
- **Recurrence rate** — percentage of CAPAs where the same failure mode recurred within 12 months, measuring CAPA effectiveness at the system level.

These metrics are included in the Management Review data pack automatically.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['medical', 'iso-13485', 'nonconformance', 'capa'],
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
    id: 'KB-DD8-015',
    title: 'Medical Devices Quality Module — Reporting & Dashboards',
    content: `## Medical Devices Quality Module — Reporting & Dashboards

The IMS Medical Quality module provides a comprehensive reporting suite designed to meet the monitoring and review requirements of ISO 13485 and global medical device regulations. This article covers the key KPIs, dashboards, management review data package, and regulatory inspection readiness reports.

### Key Medtech Quality KPIs

Navigate to **Reporting > Quality KPIs**. The KPI dashboard is configurable by date range, product family, and regulatory market. Core KPIs include:

#### Complaint Rate per Device
Measured as complaints per 1,000 units shipped, trended monthly. Separate tracking for:
- **Customer complaints** — quality or performance issues reported by customers.
- **Serious adverse events** — events requiring MDR/vigilance reporting.
- **Field safety corrective actions** — product recalls or safety notices issued.

A rising complaint rate trend triggers an automatic signal in the Post-Market Surveillance summary.

#### CAPA Cycle Time
Average days from CAPA initiation to verified closure, measured overall and by source type. ISO 13485 does not specify a mandatory cycle time, but regulatory agencies expect cycle times to be defined in your SOP and consistently met. The benchmark target is typically 90 days for production CAPAs and 180 days for complex systemic issues.

#### Supplier Nonconformance Rate
Incoming inspection failure rate by supplier, trended quarterly. Used to drive supplier qualification decisions and focused supplier audits.

#### Design Change Rate
Number of approved design changes per device per year. A high rate may indicate unstable design or inadequate design validation.

#### Audit Findings by Clause
Pie chart and trend of internal audit findings categorised by ISO 13485 clause. Consistent findings against the same clause indicate a systemic weakness requiring management attention.

### Management Review Data Package

Navigate to **Reporting > Management Review Pack**. The Management Review data package is generated automatically and includes:

1. Quality Policy review and objectives progress.
2. Internal audit results summary (findings by clause, close-out rate).
3. External audit results (notified body / regulatory inspection findings).
4. Customer complaint summary (rate, trend, MDRs submitted).
5. CAPA status (open, overdue, effectiveness verification pending).
6. Nonconformance summary (by source, by disposition).
7. Supplier quality performance (incoming rejection rate by supplier).
8. Post-Market Surveillance data summary.
9. Resource adequacy assessment (training compliance, equipment calibration status).
10. Recommendations for improvement.

The pack is formatted with a cover sheet, table of contents, and individual sections suitable for direct presentation to top management. Management review decisions and actions are recorded directly in the IMS system under **Audit > Management Reviews**.

### Regulatory Authority Inspection Readiness Report

Navigate to **Reporting > Inspection Readiness**. This report is designed for FDA pre-inspection preparation, EU MDR notified body audits, or other regulatory authority inspections. It compiles:

- Current document register with revision status.
- Open nonconformances and CAPAs with planned completion dates.
- Last 5 years of complaint data with MDR submission confirmation.
- Supplier audit schedule and status.
- Training and competency records for key QMS roles.
- Environmental monitoring trend data.
- DHR release authorisation records for the past 2 years.

### Quality System Effectiveness Metrics

Navigate to **Reporting > System Effectiveness**. This dashboard provides a holistic view of QMS health:

- **First-Pass Yield (FPY)** — percentage of devices passing all inspections without rework.
- **Audit Finding Close-Out Rate** — percentage of audit findings closed within the agreed timeframe.
- **CAPA Effectiveness Rate** — percentage of closed CAPAs confirmed effective (no recurrence).
- **Supplier On-Time Delivery with Quality** — combined supplier delivery performance.
- **Regulatory Submission Timeliness** — MDR/vigilance reports submitted within required timelines (target: 100%).

These metrics are used in the Management Review to assess whether the QMS is achieving its intended purpose of ensuring device safety and effectiveness.`,
    contentType: 'MARKDOWN',
    category: 'REFERENCE',
    status: 'PUBLISHED',
    tags: ['medical', 'iso-13485', 'reporting', 'metrics'],
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
    id: 'KB-DD8-016',
    title: 'Medical Devices Quality Module — ISO 13485 Audit Readiness',
    content: `## Medical Devices Quality Module — ISO 13485 Audit Readiness

Preparing for an ISO 13485 certification or surveillance audit by a notified body, or an inspection by a regulatory authority (FDA, national competent authority), requires systematic evidence collection across the entire quality management system. This guide explains how to use the IMS Medical Quality module to prepare for audits and inspections.

### Clause-by-Clause Evidence Mapping

The IMS Medical module organises evidence aligned to ISO 13485:2016 clauses:

| ISO 13485 Clause | IMS Module/Screen | Key Evidence |
|---|---|---|
| 4.1 Quality Management System | Admin > QMS Configuration | Documented QMS scope, processes, and their interactions |
| 4.2.3 Medical Device File | DHF/DHF > Device Files | Complete DHF for each device type |
| 5.6 Management Review | Audit > Management Reviews | Management review meeting records and action tracking |
| 6.2 Human Resources | Training Tracker | Competency records, training matrices, qualifications |
| 6.3 Infrastructure | CMMS > Assets | Equipment maintenance and calibration records |
| 6.4.2 Contamination Control | Environmental Monitoring | Environmental monitoring results and excursion investigations |
| 7.3 Design and Development | DHF > DHF Sections | Design inputs, outputs, reviews, verification, validation |
| 7.4 Purchasing | Supplier Evaluation | Supplier qualification records, approved supplier list |
| 7.5.3 Traceability | DHR | Lot traceability records linking components to finished devices |
| 7.5.9 Sterility | DHR > Sterilisation | Sterilisation cycle records and bioburden data |
| 7.6 Monitoring/Measuring Equipment | Equipment Calibration | Calibration records and out-of-calibration investigations |
| 8.2.1 Feedback | Complaints | Post-market surveillance and complaint records |
| 8.2.2 Complaints | Complaints > Investigation | Complaint investigation reports and MDR records |
| 8.3 Nonconforming Product | Nonconformance | NC records with disposition and investigation |
| 8.5.2 Corrective Action | CAPA | CAPA records with effectiveness verification |
| 8.5.3 Preventive Action | CAPA > Preventive | Proactive risk-based preventive actions |

### Typical Audit Questions and Where to Find Evidence

**"Show me your complaint handling procedure and a sample of recent complaints."**
Navigate to **Documents > SOPs > Complaint Handling SOP**, then **Complaints > Recent Complaints**. Filter to show complaints from the past 12 months and select a representative sample including at least one that was evaluated for MDR reportability.

**"Show me how you determine whether a complaint is reportable."**
Open a complaint and navigate to the **Reportability Assessment** tab. Walk the auditor through the decision tree and the documented rationale, including the approver's signature.

**"Show me your CAPA system. How do you verify effectiveness?"**
Navigate to **CAPA > Closed CAPAs**. Select a recent CAPA with an effectiveness verification completed. Show the root cause analysis, implemented actions, verification plan, and the effectiveness conclusion with supporting data.

**"Show me the Device History Record for a recent production lot."**
Navigate to **DHR > DHR Library**, select a recent lot. Walk through the completed elements: work order, component traceability, process records, inspection results, environmental monitoring (if applicable), label verification, and the Quality release signature with timestamp.

**"How do you control nonconforming product?"**
Navigate to **Nonconformance > Recent NCs** and select an example showing a device quarantined, investigated, and dispositioned. Show the disposition approval signatures and, for Use-As-Is dispositions, the engineering justification.

### Unannounced Inspection Preparedness

FDA and some national competent authorities may conduct unannounced facility inspections. To maintain preparedness:

- Assign a named Regulatory Point of Contact who is trained and authorised to receive inspection personnel.
- Keep the Inspection Readiness Report current (run monthly from Reporting > Inspection Readiness).
- Maintain a 'Back Room' workspace in IMS where documents can be quickly retrieved by clause or device.
- Ensure DHR records for all lots distributed in the past 2 years are fully complete and retrievable within 30 minutes.
- Conduct quarterly internal mock inspections using the FDA 21 CFR Part 820 or EU MDR checklist in the IMS Audit module.

### Regulatory Authority Inspection vs Certification Audit Differences

| Dimension | ISO 13485 Certification Audit (Notified Body) | FDA Inspection / MDR Competent Authority |
|---|---|---|
| Scope | ISO 13485 clause conformity | Regulatory compliance (21 CFR 820 / MDR Annex IX) |
| Notice | Typically announced (30–90 days) | Frequently unannounced |
| Duration | 1–5 days depending on company size | 1–10+ days (For Cause inspections can be lengthy) |
| Outcome | Certification issued / withheld / conditioned | Inspectional Observations (FDA 483), Warning Letter, Import Alert |
| Dispute process | Notified body appeals procedure | Written response to FDA 483 within 15 working days |
| Focus areas | QMS process effectiveness, CAPA quality | Complaint handling, MDR reporting, design controls, CAPA |

Understanding these differences helps prioritise audit preparation activities. For FDA inspections, ensure MDR files are complete and reportability assessments are thoroughly documented — this is the most common observation area in FDA device inspections.`,
    contentType: 'MARKDOWN',
    category: 'PROCEDURE',
    status: 'PUBLISHED',
    tags: ['medical', 'iso-13485', 'audit', 'compliance', 'certification'],
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
