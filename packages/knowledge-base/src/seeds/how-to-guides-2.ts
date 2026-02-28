import type { KBArticle } from '../types';

export const howToGuides2Articles: KBArticle[] = [
  {
    id: 'KB-HT2-001',
    title: 'How to Create a PPAP Submission Package',
    content: `## How to Create a PPAP Submission Package

A Production Part Approval Process (PPAP) submission demonstrates that a supplier understands all design and specification requirements. Follow these steps to build and submit a complete package.

### Overview
PPAP levels 1–5 differ in which elements must be submitted to the customer. Level 3 is most common and requires full documentation.

### Prerequisites
- Active part number and customer record in the Automotive module
- Completed Production Control Plan and Design FMEA
- Measurement System Analysis (MSA) results available

### Steps

1. Navigate to **Automotive → PPAP → New Submission**.
2. Select the **PPAP Level** (1–5) from the dropdown. Hover each level to see which of the 18 elements are required.
3. Enter the **Customer Name**, **Part Number**, and **Drawing Number**.
4. Work through each required element tab: attach the Part Submission Warrant (PSW), Design Documentation, Design FMEA, Process FMEA, Control Plan, MSA results, Dimensional Results, Material Performance Test Results, and remaining elements.
5. For each element, click **Upload** to attach files or **Link** to reference an existing document in the Document Control module.
6. Mark each element **Complete** once its documents are attached.
7. Click **Submit for Internal Approval** when all required elements show green checkmarks.
8. The assigned approver receives a notification. Track status on the PPAP dashboard.
9. Once internally approved, click **Submit to Customer Portal** to send the package to the customer for review.

### Tips
- Use the **Element Checklist** view to see a single-page summary of all 18 elements and their completion status.
- Save a draft at any time — the system auto-saves every 60 seconds.
- Attach the signed PSW last, as it must reflect final part characteristics.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'automotive', 'ppap'],
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
    id: 'KB-HT2-002',
    title: 'How to Run a Gauge R&R Study',
    content: `## How to Run a Gauge R&R Study

A Gauge Repeatability and Reproducibility (Gauge R&R) study quantifies how much measurement system variation contributes to total process variation. This guide walks through setting up and interpreting the study.

### Overview
A %GRR below 10% is acceptable; 10–30% may be acceptable depending on context; above 30% requires corrective action.

### Prerequisites
- At least 2 operators and 10 representative parts identified
- Gauge registered in the MSA library

### Steps

1. Navigate to **Automotive → MSA → New Gauge R&R Study**.
2. Select the **Gauge** from the library dropdown.
3. Enter the number of **Parts** (recommended: 10), **Operators** (recommended: 2–3), and **Trials** (recommended: 2–3).
4. Click **Generate Data Entry Sheet**. The system creates a grid with operator/part/trial combinations.
5. Enter each measurement value in the corresponding cell. Use Tab to advance between cells.
6. Click **Calculate** once all measurements are entered.
7. Review the **%GRR** result prominently displayed at the top of the results panel.
8. Examine the **ANOVA table**, **Range chart**, and **Average chart** to identify whether variation is due to repeatability or reproducibility.
9. Click **Save to MSA Library** to store the study results.
10. Click **Link to Control Plan** and select the relevant characteristic to associate the MSA result.

### Tips
- Blind the study — operators should not see each other's measurements.
- Randomise part presentation order for each operator to avoid bias.
- If %GRR is borderline, check the Range chart for out-of-control points before re-running.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'automotive', 'msa', 'gauge-rr'],
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
    id: 'KB-HT2-003',
    title: 'How to Set Up SPC Charts for a New Characteristic',
    content: `## How to Set Up SPC Charts for a New Characteristic

Statistical Process Control (SPC) charts detect process shifts before they produce nonconforming parts. This guide covers configuring a new chart from scratch.

### Overview
Choose Xbar-R for subgroup sizes 2–10; use I-MR for individual measurements or subgroup size 1.

### Prerequisites
- Characteristic defined in the Control Plan
- At least 25 subgroups of baseline data available for control limit calculation

### Steps

1. Navigate to **Automotive → SPC → New Chart**.
2. Enter the **Characteristic Name** and select the linked **Control Plan** row.
3. Choose the **Chart Type**: Xbar-R or I-MR from the dropdown.
4. Set the **Subgroup Size** (e.g. 5 for Xbar-R; 1 for I-MR).
5. Enter your baseline data in the **Data Import** grid, or upload a CSV using the template provided.
6. Click **Calculate Control Limits**. The system computes UCL, LCL, and CL from the baseline dataset.
7. Review the calculated limits and confirm they are statistically sound (no out-of-control points in the baseline).
8. Under **Detection Rules**, enable the desired **Western Electric Rules** (Rules 1–4 are standard).
9. Under **Alerts**, configure email or in-app notification recipients for rule violations.
10. Click **Activate Chart**. The chart is now live and accepts new data entries.

### Tips
- Collect at least 25 subgroups before calculating limits to ensure stability.
- Lock control limits after activation — do not recalculate unless a confirmed process change occurs.
- Use the **Capability** tab to view Cp and Cpk once sufficient production data accumulates.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'automotive', 'spc'],
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
    id: 'KB-HT2-004',
    title: 'How to Link FMEA Actions to a Control Plan',
    content: `## How to Link FMEA Actions to a Control Plan

Linking FMEA recommended actions directly to Control Plan rows ensures that risk mitigation is reflected in production controls and creates a traceable audit trail.

### Overview
The link wizard maps FMEA action rows (identified by high RPN) to the corresponding Control Plan process step rows, so changes to one surface automatically in the other.

### Prerequisites
- FMEA document in APPROVED or REVIEW status
- Control Plan document created for the same part number

### Steps

1. Navigate to **Automotive → FMEA** and open the relevant FMEA document.
2. Identify the process step rows that contain recommended actions (typically high-RPN rows).
3. Select one or more action rows using the row checkboxes on the left.
4. Click **Link to Control Plan** in the toolbar. The link wizard opens.
5. In the wizard, select the target **Control Plan** from the dropdown (only control plans for the same part number appear).
6. The wizard displays matching process steps from the Control Plan. Select the corresponding row for each FMEA action.
7. For each link, confirm whether the FMEA action maps to a **Detection Control** or **Prevention Control** in the Control Plan.
8. Click **Create Links**. The system creates bidirectional references.
9. Navigate to the Control Plan and verify the linked FMEA actions appear in the **FMEA Reference** column.
10. Click **Save and Approve** on both documents if they are ready for release.

### Tips
- Unlinked high-RPN actions generate an audit warning during PPAP package validation.
- If a Control Plan row is updated, the system flags linked FMEA rows for review automatically.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'automotive', 'fmea', 'control-plan'],
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
    id: 'KB-HT2-005',
    title: 'How to Generate an APQP Phase Gate Report',
    content: `## How to Generate an APQP Phase Gate Report

Advanced Product Quality Planning (APQP) phase gate reports document the completion of each phase and provide a formal sign-off record. This guide covers generating and routing a phase gate report.

### Overview
APQP has five phases: Planning, Product Design, Process Design, Product and Process Validation, and Launch. Each phase ends with a gate review.

### Prerequisites
- APQP project created and phases populated with deliverables
- All deliverables for the current phase marked complete or waived

### Steps

1. Navigate to **Automotive → APQP** and open the relevant project.
2. Select the phase you are closing (e.g. **Phase 2 — Product Design**) from the phase timeline.
3. Review the **Deliverables** list. Each item must show a green checkmark (Complete) or an approved waiver.
4. Click **Gate Review** at the top-right of the phase panel.
5. In the Gate Review form, enter the **Review Date** and **Meeting Attendees**.
6. Add **Meeting Notes** summarising key decisions and open issues.
7. For any outstanding items, add them to the **Open Issues** table with owner and target date.
8. Click **Generate Phase Gate Report**. The system compiles deliverables, notes, and issue log into a PDF.
9. Preview the report and click **Submit for Sign-off**.
10. Assigned approvers receive a notification. Once all sign-offs are collected, the phase status changes to **Closed** and the project advances to the next phase.

### Tips
- Attach supporting evidence (meeting minutes, test reports) before generating the report.
- Use the **Dashboard** view to see all APQP projects and their current phase gate status at a glance.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'automotive', 'apqp'],
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
    id: 'KB-HT2-006',
    title: 'How to Create a Design History File (DHF) Structure',
    content: `## How to Create a Design History File (DHF) Structure

A Design History File (DHF) is the controlled compilation of records describing the design history of a finished medical device. Setting up the correct structure early ensures regulatory compliance throughout the device lifecycle.

### Overview
The DHF must contain or reference all records required to demonstrate that the design was developed in accordance with the approved Design Plan (21 CFR 820.30 / ISO 13485 Clause 7.3).

### Prerequisites
- Product record created in the Medical module
- Device classification and applicable standards confirmed

### Steps

1. Navigate to **Medical → Products** and open (or create) the product record.
2. Click **Create DHF** in the product toolbar.
3. The system creates a DHF with the standard section template. Review the default sections: Design Inputs, Design Outputs, Design Review, Design Verification, Design Validation, and Design Transfer.
4. Add any additional sections required by your Quality Management System (e.g. Risk Management File, Labelling).
5. For each section, click **Edit Section** to assign a **Section Owner** and set the **Required Document Types** (e.g. protocols, reports, drawings).
6. Set the **Review Frequency** (e.g. annually or upon design change).
7. Click **Save Structure**.
8. Add initial documents to each section by clicking **Add Document** and uploading or linking from Document Control.
9. Submit the DHF structure for approval using **Submit for Review**.
10. Once approved, the DHF status changes to **Active** and section owners receive task assignments.

### Tips
- Link the DHF to the Risk Management File (ISO 14971) record from the outset.
- All documents within the DHF must be under document control with revision history.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'medical', 'dhf'],
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
    id: 'KB-HT2-007',
    title: 'How to Initiate a Medical Device Complaint',
    content: `## How to Initiate a Medical Device Complaint

Complaint handling is a regulatory requirement under 21 CFR Part 820.198 and ISO 13485 Clause 8.2.2. Every complaint must be recorded, evaluated, and investigated in a timely manner.

### Overview
A complaint is any written, electronic, or oral communication that alleges deficiencies related to the identity, quality, durability, reliability, safety, or performance of a device after it is released for distribution.

### Prerequisites
- Device serial number, lot number, or UDI available
- Reporter contact information (if provided)

### Steps

1. Navigate to **Medical → Complaints → New Complaint**.
2. Enter **Reporter Information**: name, contact details, and relationship to the device (patient, clinician, distributor).
3. Enter the **Device Identifier**: UDI, serial number, or lot number. The system auto-populates product name and model.
4. Set the **Event Date** (when the incident occurred, if known).
5. Write a clear **Event Description** in the text field, capturing exactly what the reporter stated.
6. Select the **Event Type** from the dropdown (e.g. Malfunction, Injury, Death, Near Miss).
7. The system runs a **Regulatory Reporting Evaluation** automatically, flagging if MDR (FDA) or IVDR/MDR (EU) reporting may be required. Review the evaluation and confirm or override.
8. Assign an **Investigation Owner** and set the **Target Completion Date**.
9. Click **Submit Complaint**. The complaint receives a unique reference number.
10. The investigation owner is notified and the complaint appears on the Complaints dashboard.

### Tips
- Log every complaint — even those that appear trivial — to comply with regulatory requirements.
- For potential serious injuries or deaths, escalate immediately to the regulatory affairs team.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'medical', 'complaints'],
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
    id: 'KB-HT2-008',
    title: 'How to Complete a Risk Management File',
    content: `## How to Complete a Risk Management File

ISO 14971:2019 requires manufacturers to establish, document, implement, and maintain a risk management process throughout the device lifecycle. The Risk Management File (RMF) contains all related records.

### Overview
The RMF links the Risk Management Plan, hazard analysis, risk controls, residual risk evaluation, and Risk Management Report into a single traceable record.

### Prerequisites
- Product record and DHF structure created in the Medical module
- Risk acceptance criteria defined in the Quality Management System

### Steps

1. Navigate to **Medical → Risk Management → New RMF** and link it to the product record.
2. Create the **Risk Management Plan** by filling in scope, intended use, user population, and risk acceptance criteria. Submit for approval.
3. Navigate to the **Hazard Analysis** tab. Click **Add Hazard** and describe each hazard (e.g. electrical hazard, biocompatibility).
4. For each hazard, estimate **Probability of Harm** (P1 x P2) and **Severity** using your defined scales. The system calculates the initial **Risk Level**.
5. For risks above the acceptance threshold, add **Risk Controls** (inherent safety, protective measures, information for safety). Select the control type and describe the measure.
6. Re-estimate **Residual Risk** (probability and severity) after controls are applied. The system recalculates the residual risk level.
7. Verify overall **Benefit-Risk**: confirm that the benefit of the device outweighs residual risks collectively.
8. Navigate to the **Risk Management Report** tab. Click **Generate Report** to compile all hazards, controls, and residual risk data.
9. Submit the report for approval. Approved status locks the RMF from further edits (changes require a new revision).

### Tips
- Use the hazard library to import common device-type hazards and save setup time.
- Link each risk control to a Design Output or labelling document for full traceability.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'medical', 'risk', 'iso-14971'],
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
    id: 'KB-HT2-009',
    title: 'How to Manage a CAPA End-to-End',
    content: `## How to Manage a CAPA End-to-End

Corrective and Preventive Action (CAPA) is a systematic process for eliminating the root cause of nonconformities and preventing recurrence. This guide covers the full lifecycle from initiation to closure.

### Overview
A well-managed CAPA should be completed within the defined SLA (typically 30–90 days depending on severity). The system tracks each stage and escalates overdue CAPAs automatically.

### Prerequisites
- Source nonconformance, audit finding, or complaint record to link to the CAPA

### Steps

1. Navigate to **Medical → CAPA → New CAPA** (or initiate directly from a nonconformance record using **Raise CAPA**).
2. Enter a clear **Problem Statement** describing what happened, where, when, and the extent of the issue.
3. Link the **Source Record** (nonconformance, complaint, audit finding).
4. Perform **Root Cause Analysis** using the 5-Why tool built into the RCA tab. Enter each 'Why' level until the root cause is identified.
5. Alternatively, use the **Ishikawa (Fishbone)** diagram view for multi-factor causes.
6. Navigate to the **Action Plan** tab. Click **Add Action** for each corrective action. Assign an **Owner** and **Due Date** per action.
7. Submit the action plan for approval. The approver receives a notification.
8. As actions are completed, owners update status to **Complete** and attach evidence.
9. Once all actions are complete, the CAPA moves to **Verification**. The CAPA owner verifies effectiveness (e.g. no recurrence over 30 days, follow-up audit result).
10. Click **Close CAPA** and enter the effectiveness verification result. The record is archived.

### Tips
- Use the **CAPA Dashboard** to monitor open CAPAs, overdue actions, and upcoming due dates.
- Link preventive actions to process documentation to ensure systemic improvement is captured.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'medical', 'capa'],
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
    id: 'KB-HT2-010',
    title: 'How to Prepare for a Notified Body Audit',
    content: `## How to Prepare for a Notified Body Audit

Notified Body audits assess conformity with ISO 13485 and applicable Medical Device Regulations. Thorough preparation reduces findings and shortens certification timelines.

### Overview
Use the IMS Audit Management module combined with the built-in ISO 13485 readiness checklist to structure your preparation.

### Prerequisites
- Audit Management module configured with your QMS scope
- All recent CAPAs and nonconformances up to date

### Steps

1. Navigate to **Medical → Audit Readiness → New Preparation Record** and select **Notified Body Audit** as the audit type.
2. Enter the audit scope, scheduled date, and Notified Body name.
3. Open the **ISO 13485 Clause-by-Clause Checklist**. For each clause, review the auto-populated evidence items the system has gathered from your QMS records.
4. For each clause, mark status as **Compliant**, **Partial**, or **Gap**. Add notes where evidence is missing.
5. For identified gaps, click **Create Remediation Action** to raise a CAPA or task linked to the specific clause.
6. Navigate to **Evidence Pack → Generate**. The system compiles a clause-by-clause evidence package including procedure references, records, and training completion data.
7. Review and supplement the evidence pack with any documents not automatically captured.
8. Navigate to **Audit Management → Schedule**. Create the audit event with dates, auditors (Notified Body contacts), and the agenda.
9. Assign internal escorting responsibilities to team members for each audit area.
10. Export the **Audit Readiness Summary Report** and share with management for review before the audit date.

### Tips
- Run a mock internal audit against the ISO 13485 checklist 4–6 weeks before the Notified Body visit.
- Ensure all documents cited as evidence are current, approved, and accessible electronically.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'medical', 'audit', 'iso-13485'],
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
    id: 'KB-HT2-011',
    title: 'How to Create a First Article Inspection (FAI) Report',
    content: `## How to Create a First Article Inspection (FAI) Report

AS9102 requires a First Article Inspection (FAI) to verify that production processes, tooling, and documentation can consistently produce parts conforming to design requirements.

### Overview
An FAI package consists of three forms: Form 1 (Design Documentation), Form 2 (Product Accountability — Materials/Processes), and Form 3 (Characteristic Accountability — Dimensional/Functional).

### Prerequisites
- Ballooned drawing with all characteristics numbered
- Material certifications and process approvals available

### Steps

1. Navigate to **Aerospace → FAI → New FAI Package**.
2. Enter the **Part Number**, **Part Name**, **Drawing Number**, **Revision Level**, and **Order Number**.
3. Complete **Form 1 — Design Documentation Accountability**: list each design document, drawing revision, and specification referenced. Mark each as on-file or attach the document.
4. Complete **Form 2 — Product Accountability**: enter material certifications (with heat/lot numbers), special process approvals (e.g. Nadcap), and sub-tier supplier details.
5. Complete **Form 3 — Characteristic Accountability**: for each ballooned characteristic on the drawing, enter the nominal, tolerance, measured value, and pass/fail status. Attach the ballooned drawing as a reference.
6. For any non-conforming characteristics, raise a deviation or corrective action directly from the Form 3 row using the flag icon.
7. Attach supporting test reports, material certs, and process certifications in the **Attachments** tab.
8. Click **Submit for Internal Approval**. The designated approver reviews and signs off.
9. Once internally approved, click **Submit to Customer** to send the FAI package via the customer portal.

### Tips
- Number every characteristic on the ballooned drawing before data entry to prevent omissions.
- Archive the completed FAI with the job traveller for traceability throughout the product lifecycle.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'aerospace', 'fai', 'as9102'],
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
    id: 'KB-HT2-012',
    title: 'How to Manage an Engineering Change Order',
    content: `## How to Manage an Engineering Change Order

Engineering Change Orders (ECOs) control modifications to designs, processes, or specifications, ensuring all affected stakeholders and documents are updated in a traceable and approved manner.

### Overview
ECOs flow through Initiation → Impact Assessment → Approval → Implementation → Baseline Update. No change may be incorporated into production until the ECO is fully approved.

### Prerequisites
- Document Control and Change Management modules configured
- Relevant part numbers and documents registered in the system

### Steps

1. Navigate to **Aerospace → Change Management → New ECO**.
2. Describe the change in the **Change Description** field: what is changing, why, and the engineering justification.
3. In the **Affected Items** tab, add all affected part numbers, documents (drawings, specifications, work instructions), and tooling records. Use the search to locate existing records.
4. Define the **Effectivity**: the serial number, lot number, or date after which the change applies.
5. Complete the **Impact Assessment**: check each category (safety, airworthiness, cost, schedule, tooling, supplier) and describe the impact.
6. Click **Submit for Approval**. The system routes the ECO to the defined approval matrix (engineering manager, quality, customer if required).
7. Approvers review and sign off electronically. Any rejection returns the ECO to the initiator with comments.
8. Once fully approved, the ECO status changes to **Approved — Pending Implementation**.
9. Assignees update the affected documents under document control (new revision) and process/tooling records.
10. Click **Close ECO** once all implementation tasks are complete. The system updates the product baseline automatically.

### Tips
- For safety-critical or airworthiness changes, require customer and regulatory authority approval before closing.
- Use the ECO register to track open changes by programme and review weekly in programme status meetings.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'aerospace', 'change-control'],
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
    id: 'KB-HT2-013',
    title: 'How to Add a Supplier to the Approved Supplier List',
    content: `## How to Add a Supplier to the Approved Supplier List

The Approved Supplier List (ASL) is the controlled register of suppliers authorised to provide products or services that affect product conformity. Adding a supplier requires qualification evidence and formal approval.

### Overview
The ASL process ensures only audited, risk-assessed suppliers are used in production, as required by AS9100 Clause 8.4.

### Prerequisites
- Supplier contact details and applicable commodity categories
- Supplier's current ISO or Nadcap certificates (if applicable)

### Steps

1. Navigate to **Aerospace → Supplier Quality → Approved Supplier List → Add Supplier**.
2. Create the **Supplier Record**: enter company name, address, CAGE code (if applicable), and primary contact.
3. In the **Commodity Categories** tab, select all categories the supplier is being approved for (e.g. Raw Materials, Machining, NDT, Heat Treatment).
4. Upload **Qualification Evidence**: ISO 9001 / AS9100 certificates, Nadcap approvals, ITAR compliance documentation, financial stability report, or other applicable certifications.
5. Complete the **Supplier Survey**: either send the self-assessment questionnaire to the supplier via the portal, or complete it on their behalf after a site audit.
6. Navigate to the **Risk Assessment** tab. The system calculates an initial risk tier (Critical / High / Medium / Low) based on commodity criticality and qualification evidence.
7. Adjust the risk tier if required and add justification notes.
8. Click **Submit for Approval**. The Supplier Quality Engineer and Quality Manager receive approval tasks.
9. Once all approvers sign off, the supplier status changes to **Approved** and they are published to the ASL.
10. Notify the procurement team that the supplier is now available for use.

### Tips
- Set certificate expiry reminders to avoid suppliers lapsing on the ASL without renewed certifications.
- For Critical tier suppliers, schedule an annual on-site audit and link results to the supplier record.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'aerospace', 'supplier-quality', 'asl'],
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
    id: 'KB-HT2-014',
    title: 'How to Report a Suspected Counterfeit Part',
    content: `## How to Report a Suspected Counterfeit Part

Counterfeit parts pose serious safety and airworthiness risks. AS9100 and AS6174 require organisations to identify, quarantine, report, and track suspect parts rigorously.

### Overview
When a part is suspected as counterfeit, it must be quarantined immediately and a formal investigation initiated. Confirmed counterfeits must be reported via GIDEP (Government-Industry Data Exchange Program).

### Prerequisites
- Suspect part physically available and identifiable by part number, lot, and supplier
- Access to the Receiving Inspection module

### Steps

1. Navigate to **Aerospace → Receiving Inspection → Flag Suspect Part**.
2. Enter the **Part Number**, **Lot Number**, **Quantity**, and **Supplier**. Attach photographs of the suspect item.
3. Select **Counterfeit Suspect** as the flag type. The system generates a quarantine label and a unique investigation reference.
4. Move the physical parts to the designated **Quarantine Area** and apply the printed quarantine label.
5. In the system, update the **Location** field to the quarantine bin/area reference.
6. Navigate to the **Investigation** tab. Assign an investigator and describe initial observations (unusual markings, date codes, surface finish anomalies).
7. Document **Test Findings** as they become available: XRF analysis, decapsulation results, supplier traceability checks.
8. If the part is confirmed counterfeit, click **Submit GIDEP Alert**. The system pre-fills the GIDEP form using the investigation data for review before submission.
9. Notify the **Procurement** team to suspend the supplier pending investigation outcome.
10. Update the **Supplier Risk Rating** in the ASL based on investigation findings.

### Tips
- Never rework or return a confirmed counterfeit — destroy it under controlled conditions and document the destruction.
- Retain all test evidence and photographs for a minimum of 10 years.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'aerospace', 'counterfeit-parts'],
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
    id: 'KB-HT2-015',
    title: 'How to Designate a Key Characteristic',
    content: `## How to Designate a Key Characteristic

Key Characteristics (KCs) are features whose variation significantly affects fit, function, performance, service life, or manufacturability. They receive enhanced monitoring through SPC and special cause plans.

### Overview
KC designation flows from engineering (drawing notation) through FMEA and Control Plan to suppliers, ensuring the entire supply chain understands and monitors critical features consistently.

### Prerequisites
- Engineering drawing with KC symbols (triangle or diamond per SAE AS9103) identified
- FMEA and Control Plan documents created for the part

### Steps

1. Navigate to **Aerospace → Key Characteristics → New KC**.
2. Enter the **Part Number**, **Drawing Number**, and **Characteristic Number** (matching the balloon on the drawing).
3. Describe the characteristic: nominal dimension, tolerance, and the KC type (Product KC or Manufacturing Process KC).
4. Link the KC to the corresponding **FMEA row**: open the FMEA link wizard, select the process step, and assign a **Special Cause Detection Plan** (e.g. 100% inspection or SPC monitoring).
5. Navigate to the **Control Plan** link. Map the KC to the Control Plan row and set the **Measurement Method**, **Sample Size**, **Frequency**, and **Reaction Plan** for out-of-control conditions.
6. Activate **SPC Monitoring**: click **Create SPC Chart** to auto-create an Xbar-R or I-MR chart linked to this KC.
7. In the **Supplier Flow-Down** tab, select affected sub-tier suppliers and click **Send KC Notification**. Suppliers receive the KC details via their supplier portal.
8. Configure the **KC Reporting Dashboard** widget: add this KC to your programme dashboard for real-time Cp/Cpk tracking.
9. Click **Save and Publish KC**.

### Tips
- Limit KC designation to truly critical characteristics — over-designation dilutes focus and increases monitoring burden.
- Review KC performance quarterly and archive KCs where consistent capability (Cpk ≥ 1.67) is demonstrated over 12 months.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'aerospace', 'key-characteristics'],
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
    id: 'KB-HT2-016',
    title: 'How to Run an Internal Audit End-to-End',
    content: `## How to Run an Internal Audit End-to-End

Internal audits verify that the Quality Management System is effectively implemented and maintained. This guide covers the full audit cycle from planning to closure.

### Overview
The audit cycle follows: Plan → Schedule → Conduct → Report → Corrective Action → Closure → Register Update.

### Prerequisites
- Audit schedule defined (annual audit programme)
- Auditors trained and competency records up to date

### Steps

1. Navigate to **Audit Management → New Audit** and select **Internal Audit**.
2. Enter the **Scope** (process areas, clauses, or departments to be audited), **Objectives**, and **Criteria** (e.g. ISO 9001:2015).
3. Set the **Audit Dates** and assign **Lead Auditor** and any supporting auditors.
4. Click **Notify Auditees** — the system sends a scheduled notification to department managers with the audit scope and dates.
5. Open the **Checklist** tab. Select a pre-built checklist (e.g. ISO 9001 clause checklist) or build a custom one.
6. During the audit, mark each checklist item **Conforming**, **Minor Finding**, **Major Finding**, or **Observation**. Add evidence notes for each item.
7. Log all findings using the **Add Finding** button: describe the finding, select the clause reference, and assign severity.
8. After fieldwork, click **Generate Audit Report**. Review the auto-populated report, add the auditor's overall conclusion, and submit for approval.
9. For each finding, click **Raise Corrective Action** to create a linked CAPA with a due date.
10. Once all CAPAs are closed, return to the audit record and click **Close Audit**. The audit register is updated automatically.

### Tips
- Allow 5 working days between notifying auditees and starting fieldwork to give departments time to prepare.
- Use objective evidence (records, measurements, observations) to support every finding — avoid subjective statements.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'audit', 'compliance'],
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
    id: 'KB-HT2-017',
    title: 'How to Configure a Corrective Action Workflow',
    content: `## How to Configure a Corrective Action Workflow

The Corrective Action workflow defines the stages, approvers, SLAs, and escalation rules that govern how CAPAs are processed. Proper configuration ensures consistent and timely resolution of nonconformities.

### Overview
A typical CAPA workflow has six stages: Initiation, Root Cause Analysis, Action Plan, Implementation, Verification, and Closure. Each stage can have its own approvers and SLA.

### Prerequisites
- Workflows module configured and accessible
- User roles and approver groups defined in the system

### Steps

1. Navigate to **Workflows → Workflow Templates → New Template** and select **Corrective Action** as the template type.
2. Add workflow stages by clicking **Add Stage**. Create the six stages: Initiation, Root Cause Analysis, Action Plan, Implementation, Verification, Closure.
3. For each stage, set the **Stage Name**, **Description**, and **Required Fields** (fields that must be completed before advancing).
4. Assign **Approvers** per stage: choose specific users, roles (e.g. Quality Manager), or approval groups. Set whether approval is **Any One** or **All Must Approve**.
5. Set the **SLA** (in working days) for each stage. For example: Initiation 1 day, RCA 5 days, Action Plan 3 days.
6. Configure **Escalation Rules**: if a stage exceeds its SLA, define who receives an escalation notification and at what intervals.
7. In the **Transitions** tab, define the conditions under which a CAPA can advance or be rejected between stages.
8. Click **Activate Workflow**. The template is now available when creating new CAPAs.
9. Test the workflow by creating a sample CAPA, advancing it through each stage, and verifying notifications, approvals, and SLA tracking function correctly.

### Tips
- Keep the workflow as simple as possible — complex multi-level approvals slow resolution and frustrate users.
- Review SLA compliance monthly and adjust stage durations if systemic delays are occurring.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'corrective-action', 'workflows'],
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
    id: 'KB-HT2-018',
    title: 'How to Set Up a Risk Assessment Matrix',
    content: `## How to Set Up a Risk Assessment Matrix

A Risk Assessment Matrix provides a consistent, visual framework for evaluating and prioritising risks across the organisation. Configuring it correctly ensures all risk assessments use the same scoring criteria.

### Overview
The matrix combines Consequence (Severity) and Likelihood scales to produce a risk rating. Colour coding maps ratings to treatment obligations (accept, mitigate, escalate, avoid).

### Prerequisites
- Risk Management module accessible
- Organisational risk appetite and treatment thresholds agreed by management

### Steps

1. Navigate to **Risk Management → Configuration → Risk Matrix**.
2. Define the **Consequence Categories**: add the categories relevant to your organisation (e.g. Safety, Financial, Reputational, Environmental, Operational). You can have up to 6 categories.
3. For each consequence category, define the **Severity Levels** (1–5): label each level (e.g. 1 = Negligible, 2 = Minor, 3 = Moderate, 4 = Major, 5 = Catastrophic) and provide a descriptor for each.
4. Define the **Likelihood Scale** (1–5): label each level (e.g. 1 = Rare, 2 = Unlikely, 3 = Possible, 4 = Likely, 5 = Almost Certain) with descriptors and frequency guidance.
5. Navigate to the **Matrix Colour Coding** tab. Assign a colour (Green, Yellow, Orange, Red) to each Severity x Likelihood cell by clicking the cell and selecting the colour.
6. Define the **Treatment Thresholds**: set the score ranges for Low (accept), Medium (monitor and treat), High (treat with plan), and Critical (immediate escalation required).
7. Select which **Modules** this matrix applies to (e.g. Health & Safety, Environment, Quality, Finance).
8. Click **Save and Activate**. The matrix is now used in all new risk assessments in the selected modules.

### Tips
- Involve a cross-functional team when defining descriptors to ensure the scale is meaningful across departments.
- Review and revalidate the matrix annually or following a significant incident.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'risk', 'configuration'],
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
    id: 'KB-HT2-019',
    title: 'How to Generate a Management Review Report',
    content: `## How to Generate a Management Review Report

Management Review is a top-management obligation under ISO 9001, ISO 14001, ISO 45001, and other standards. The IMS automates data gathering so the review meeting focuses on decisions rather than data collection.

### Overview
The report aggregates KPIs, audit results, nonconformance trends, customer feedback, and objectives performance across selected modules for the review period.

### Prerequisites
- Management Review module configured with your standard(s) and review frequency
- Data populated in the relevant modules for the review period

### Steps

1. Navigate to **Management Review → New Review**.
2. Enter the **Review Period** (start and end date) and **Review Date** (the meeting date).
3. Select the **Modules to Include**: tick each module whose data should be pulled (e.g. H&S, Environment, Quality, Audits, CAPAs, Customer Feedback).
4. Click **Gather Data**. The system automatically collects KPIs, audit findings, CAPA status, and nonconformance counts for the selected period and modules.
5. Review the auto-populated data sections. Verify the figures are accurate and flag any data anomalies for correction.
6. Add **Management Commentary** to each section: interpret the data, highlight trends, and note significant events.
7. Navigate to the **Attachments** tab and attach any supporting evidence (customer satisfaction survey results, external audit reports).
8. In the **Decisions and Actions** tab, record each management decision and associated action item with owner and due date.
9. Click **Route for Executive Approval**. The defined executive reviewers receive an approval task.
10. Once approved, click **Export** to download the report as a Word document or PDF for distribution and archiving.

### Tips
- Schedule the data-gathering step 1 week before the review meeting to allow time to verify and supplement figures.
- Archive the completed report in Document Control with the meeting minutes as supporting evidence.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'management-review', 'reporting'],
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
    id: 'KB-HT2-020',
    title: 'How to Create and Manage a Document Lifecycle',
    content: `## How to Create and Manage a Document Lifecycle

Document Control ensures that only current, approved documents are available at point of use, and that obsolete versions are removed from circulation. This guide covers the full lifecycle from creation to archiving.

### Overview
The document lifecycle follows: Draft → Review → Approval → Published → Periodic Review → Revised or Archived. The system enforces controlled transitions between each state.

### Prerequisites
- Document Control module configured with your document numbering convention and review intervals
- Reviewer and approver roles assigned

### Steps

1. Navigate to **Document Control → New Document**.
2. Select a **Document Template** from the library (e.g. Procedure, Work Instruction, Policy, Form).
3. The system assigns a unique **Document Number** based on the configured numbering scheme.
4. Complete the document metadata: **Title**, **Owner**, **Department**, **Applicable Standard** (optional), and **Review Interval** (e.g. 12 months).
5. Draft the document content in the built-in editor or upload a completed file.
6. Click **Submit for Review**. Assign **Reviewers** from the user list. Each reviewer receives a notification.
7. Reviewers add comments using the inline commenting tool. The document owner responds to and resolves comments.
8. Once all comments are resolved, click **Submit for Approval**. The assigned approver reviews the final draft.
9. The approver clicks **Approve and Publish**. The document status changes to **Published**, it becomes visible to all authorised users, and the previous version is automatically moved to **Superseded**.
10. At the review interval, the system sends the document owner a **Periodic Review** reminder. The owner confirms the document is still current (no change required) or initiates a new revision.
11. When a document is no longer needed, click **Archive**. It moves to the Archive register and is removed from active use but remains retrievable for audit purposes.

### Tips
- Never bypass the approval step — publishing a document without approval breaks the audit trail.
- Use the **Version History** tab to view all previous revisions and access superseded versions when needed.`,
    contentType: 'MARKDOWN',
    category: 'GUIDE',
    status: 'PUBLISHED',
    tags: ['how-to', 'document-control', 'workflow'],
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
